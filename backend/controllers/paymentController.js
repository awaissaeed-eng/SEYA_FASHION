const Order = require('../models/order');
const Payment = require('../models/payment');
const { createLog } = require('./activityLogController');
const crypto = require('crypto');

// Payment initiation endpoint (receives only tokens, never raw card data)
exports.initiatePayment = async (req, res) => {
  try {
    const { 
      orderId, 
      paymentToken, 
      paymentMethod, 
      tokenData,
      billingAddress,
      customerInfo 
    } = req.body;

    // Validate required fields
    if (!orderId || !paymentToken || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment data'
      });
    }

    // Find the order
    const order = await Order.findOne({ 
      $or: [
        { orderId: orderId },
        { _id: orderId }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check for duplicate payment attempts
    const existingPayment = await Payment.findOne({
      orderId: order._id,
      status: { $in: ['pending', 'processing'] }
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'Payment already in progress for this order'
      });
    }

    // Fraud prevention checks
    const fraudCheck = await performFraudChecks(order, paymentToken, req);
    if (!fraudCheck.passed) {
      return res.status(400).json({
        success: false,
        message: fraudCheck.reason
      });
    }

    // Generate transaction ID
    const transactionId = generateTransactionId(paymentMethod);

    // Create payment record (PCI compliant - no raw card data)
    const payment = new Payment({
      orderId: order._id,
      transactionId,
      paymentMethod,
      paymentToken, // Tokenized payment data only
      tokenData: {
        last4: tokenData?.last4,
        cardType: tokenData?.cardType,
        walletType: tokenData?.walletType,
        maskedNumber: tokenData?.maskedNumber
      },
      amount: order.totalAmount,
      currency: 'PKR',
      status: 'pending',
      gateway: 'meezan_bank',
      billingAddress,
      customerInfo,
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        timestamp: new Date()
      }
    });

    await payment.save();

    // Update order payment status
    order.paymentStatus = 'pending';
    order.transactionId = transactionId;
    await order.save();

    // In production, this would call Meezan Bank API
    const gatewayResponse = await processPaymentWithGateway(payment);

    // Update payment with gateway response
    payment.gatewayTransactionId = gatewayResponse.gatewayTransactionId;
    payment.gatewayResponse = gatewayResponse.rawResponse;
    payment.status = gatewayResponse.status;
    await payment.save();

    // Log activity
    if (req.userId) {
      await createLog(
        req.userId, 
        'payment_initiated', 
        `Payment initiated for order ${order.orderId} - Transaction: ${transactionId}`,
        'payment',
        payment._id,
        transactionId
      );
    }

    res.status(200).json({
      success: true,
      data: {
        transactionId,
        status: payment.status,
        amount: payment.amount,
        paymentMethod,
        gatewayTransactionId: payment.gatewayTransactionId,
        // Never expose sensitive data
        tokenData: {
          last4: tokenData?.last4,
          cardType: tokenData?.cardType,
          walletType: tokenData?.walletType
        }
      },
      message: 'Payment initiated successfully'
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initiation failed'
    });
  }
};

// Payment verification endpoint (webhook from Meezan Bank)
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { 
      status, 
      gatewayTransactionId, 
      gatewayResponse,
      signature 
    } = req.body;

    // Verify webhook signature (in production)
    if (!verifyWebhookSignature(req.body, signature)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment status
    const previousStatus = payment.status;
    payment.status = status;
    payment.gatewayTransactionId = gatewayTransactionId;
    payment.gatewayResponse = JSON.stringify(gatewayResponse);
    
    if (status === 'paid') {
      payment.paidAt = new Date();
    }

    await payment.save();

    // Update order payment status
    const order = await Order.findById(payment.orderId);
    if (order) {
      order.paymentStatus = status;
      if (status === 'paid') {
        order.paymentDate = new Date();
      }
      await order.save();
    }

    // Log status change
    console.log(`Payment ${transactionId} status updated: ${previousStatus} → ${status}`);

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully'
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId })
      .populate('orderId', 'orderId totalAmount')
      .select('-paymentToken -gatewayResponse'); // Never expose sensitive data

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        transactionId: payment.transactionId,
        status: payment.status,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
        tokenData: payment.tokenData,
        order: payment.orderId
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status'
    });
  }
};

// Helper functions
function generateTransactionId(paymentMethod) {
  const prefix = 'MZN';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

async function performFraudChecks(order, paymentToken, req) {
  // Amount validation
  if (order.totalAmount < 100 || order.totalAmount > 1000000) {
    return { passed: false, reason: 'Invalid transaction amount' };
  }

  // Rate limiting check
  const clientId = req.ip + (req.userId || 'anonymous');
  const recentPayments = await Payment.countDocuments({
    'metadata.ipAddress': req.ip,
    createdAt: { $gte: new Date(Date.now() - 300000) } // 5 minutes
  });

  if (recentPayments >= 5) {
    return { passed: false, reason: 'Too many payment attempts. Please try again later.' };
  }

  // Duplicate transaction check
  const duplicatePayment = await Payment.findOne({
    amount: order.totalAmount,
    'metadata.ipAddress': req.ip,
    createdAt: { $gte: new Date(Date.now() - 60000) }, // 1 minute
    status: { $in: ['pending', 'paid'] }
  });

  if (duplicatePayment) {
    return { passed: false, reason: 'Duplicate transaction detected' };
  }

  return { passed: true };
}

async function processPaymentWithGateway(payment) {
  // Mock Meezan Bank API call
  // In production, this would be actual API integration
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate for testing
      
      resolve({
        gatewayTransactionId: `MZN_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        status: success ? 'paid' : 'failed',
        rawResponse: JSON.stringify({
          gateway: 'meezan_bank',
          timestamp: new Date().toISOString(),
          status: success ? 'SUCCESS' : 'FAILED',
          message: success ? 'Payment processed successfully' : 'Payment declined by bank'
        })
      });
    }, 2000); // Simulate processing time
  });
}

function verifyWebhookSignature(payload, signature) {
  // In production, verify webhook signature from Meezan Bank
  const secret = process.env.MEEZAN_WEBHOOK_SECRET || 'test_secret';
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}