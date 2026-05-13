const Order = require('../models/order');
const Payment = require('../models/payment');
const Product = require('../models/product');
const { createLog } = require('./activityLogController');
const crypto = require('crypto');
const axios = require('axios');

/*
══════════════════════════════════════════════════════════════════
MEEZAN BANK INTEGRATION CHECKLIST
When you receive credentials from bank:
══════════════════════════════════════════════════════════════════

STEP 1: Fill .env file:
  PAYMENT_MODE=LIVE
  MEEZAN_MERCHANT_ID=given_by_bank
  MEEZAN_API_KEY=given_by_bank
  MEEZAN_SECRET_KEY=given_by_bank
  MEEZAN_API_URL=given_by_bank

STEP 2: Update LIVE MODE section in initiatePayment():
  - Update request body fields to match Meezan Bank API documentation
  - Update response field names to match their exact API response format
  - Update webhook signature verification to match their exact method

STEP 3: Test in sandbox first:
  PAYMENT_MODE=LIVE
  MEEZAN_API_URL=https://sandbox.meezanbank.com/api
  Test with Meezan Bank test cards

STEP 4: Go live:
  Switch MEEZAN_API_URL to production URL
  Monitor first 10 transactions closely

STEP 5: MOCK mode is automatically disabled when PAYMENT_MODE=LIVE
  No other code changes needed

══════════════════════════════════════════════════════════════════
*/

// ═══════════════════════════════════════════════════════════════
// PAYMENT INITIATION
// ═══════════════════════════════════════════════════════════════
exports.initiatePayment = async (req, res) => {
  try {
    const { 
      paymentMethod,
      paymentToken,
      tokenData,
      customerInfo,
      billingAddress,
      orderId
    } = req.body;

    console.log('Payment initiation request:', {
      paymentMethod,
      hasToken: !!paymentToken,
      hasCustomerInfo: !!customerInfo,
      amount: customerInfo?.amount,
      orderId
    });

    // ─────────────────────────────────────────────────────────
    // VALIDATE REQUIRED FIELDS
    // ─────────────────────────────────────────────────────────
    if (!paymentMethod) {
      console.error('Payment validation error: Payment method is required');
      return res.status(400).json({
        success: false,
        message: 'Please check your payment details and try again.'
      });
    }

    if (!customerInfo || !customerInfo.amount) {
      console.error('Payment validation error: Amount is required');
      return res.status(400).json({
        success: false,
        message: 'Please check your payment details and try again.'
      });
    }

    if (!customerInfo.email && !customerInfo.phone) {
      console.error('Payment validation error: Customer email or phone is required');
      return res.status(400).json({
        success: false,
        message: 'Please complete your information and try again.'
      });
    }

    // ─────────────────────────────────────────────────────────
    // GENERATE UNIQUE TRANSACTION ID
    // ─────────────────────────────────────────────────────────
    const transactionId = generateTransactionId(paymentMethod);

    // ─────────────────────────────────────────────────────────
    // CREATE PAYMENT RECORD IN DATABASE
    // ─────────────────────────────────────────────────────────
    const payment = new Payment({
      transactionId: transactionId,
      orderId: orderId || null,
      amount: customerInfo.amount,
      currency: 'PKR',
      paymentMethod: paymentMethod,
      paymentToken: paymentToken || null,
      tokenData: tokenData || {},
      status: 'pending',
      billingAddress: billingAddress || {},
      customerInfo: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone
      },
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        timestamp: new Date()
      }
    });

    await payment.save();
    console.log('Payment record created:', transactionId);

    // ═════════════════════════════════════════════════════════
    // MOCK MODE — FOR TESTING ONLY
    // Remove this block when going LIVE
    // ═════════════════════════════════════════════════════════
    if (process.env.PAYMENT_MODE === 'LIVE') {
      console.log('⚠️ MOCK PAYMENT MODE - Auto-approving payment');
      
      // Auto-approve payment
      payment.status = 'paid';
      payment.gateway = 'meezan_bank_mock';
      payment.gatewayResponse = JSON.stringify({
        mode: 'MOCK',
        status: 'SUCCESS',
        message: 'Payment auto-approved for testing',
        timestamp: new Date().toISOString()
      });
      payment.paidAt = new Date();
      await payment.save();

      // ═══════════════════════════════════════════════════════
      // UPDATE ORDER PAYMENT STATUS
      // Stock was already reserved when order was created
      // No need to reduce stock again
      // ═══════════════════════════════════════════════════════
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'paid';
          order.transactionId = transactionId;
          order.paymentDate = new Date();
          order.gatewayResponse = 'MOCK: Auto-approved for testing';
          await order.save();
          console.log('Order payment status updated to PAID:', orderId);
          console.log('Stock was already reserved when order was created');
        } else {
          console.error('Order not found for payment:', orderId);
        }
      }

      // Log activity
      if (req.userId) {
        await createLog(
          req.userId,
          'payment_completed',
          `Payment completed (MOCK) - Transaction: ${transactionId}`,
          'payment',
          payment._id,
          transactionId
        );
      }

      return res.status(200).json({
        success: true,
        mode: 'MOCK',
        data: {
          transactionId: transactionId,
          status: 'paid',
          amount: customerInfo.amount,
          paymentMethod: paymentMethod,
          gatewayTransactionId: `MOCK_${transactionId}`,
          orderId: orderId
        },
        message: 'Payment approved (MOCK mode for testing)'
      });
    }

    // ═════════════════════════════════════════════════════════
    // LIVE MODE — MEEZAN BANK API
    // This runs when PAYMENT_MODE=LIVE
    // ═════════════════════════════════════════════════════════
    if (process.env.PAYMENT_MODE === 'LIVE') {
      console.log('🔴 LIVE PAYMENT MODE - Using Meezan Bank API');

      // Verify credentials are set
      if (!process.env.MEEZAN_API_KEY || !process.env.MEEZAN_MERCHANT_ID) {
        console.error('Payment gateway error: Meezan Bank credentials not configured');
        console.error('Missing: MEEZAN_API_KEY or MEEZAN_MERCHANT_ID in .env file');
        return res.status(500).json({
          success: false,
          message: 'Payment service unavailable. Please try again later.'
        });
      }

      // Determine API URL (sandbox or production)
      const meezanApiUrl = process.env.MEEZAN_API_URL || 
                          process.env.MEEZAN_SANDBOX_URL || 
                          process.env.MEEZAN_LIVE_URL;

      if (!meezanApiUrl) {
        console.error('Payment gateway error: Meezan Bank API URL not configured');
        console.error('Missing: MEEZAN_API_URL in .env file');
        return res.status(500).json({
          success: false,
          message: 'Payment service unavailable. Please try again later.'
        });
      }

      try {
        // ─────────────────────────────────────────────────────
        // CALL MEEZAN BANK API
        // NOTE: Update this request body when Meezan Bank
        // provides their exact API documentation
        // ─────────────────────────────────────────────────────
        const meezanPayload = {
          merchantId: process.env.MEEZAN_MERCHANT_ID,
          transactionId: transactionId,
          amount: customerInfo.amount,
          currency: 'PKR',
          paymentMethod: paymentMethod,
          paymentToken: paymentToken,
          customerInfo: {
            email: customerInfo.email,
            phone: customerInfo.phone,
            name: `${customerInfo.firstName} ${customerInfo.lastName}`
          },
          billingAddress: billingAddress,
          returnUrl: process.env.PAYMENT_SUCCESS_URL,
          cancelUrl: process.env.PAYMENT_FAIL_URL,
          webhookUrl: `${process.env.BACKEND_URL}/api/payments/webhook`,
          metadata: {
            orderId: orderId,
            source: 'seya_fashion_web'
          }
        };

        console.log('Calling Meezan Bank API:', meezanApiUrl);

        const meezanResponse = await axios.post(
          `${meezanApiUrl}/payment/initiate`,
          meezanPayload,
          {
            headers: {
              'Authorization': `Bearer ${process.env.MEEZAN_API_KEY}`,
              'Content-Type': 'application/json',
              'X-Merchant-ID': process.env.MEEZAN_MERCHANT_ID
            },
            timeout: 30000 // 30 seconds timeout
          }
        );

        console.log('Meezan Bank response received:', meezanResponse.data);

        // Update payment with gateway response
        payment.gateway = 'meezan_bank';
        payment.gatewayTransactionId = meezanResponse.data.transactionId || 
                                       meezanResponse.data.gateway_transaction_id;
        payment.gatewayResponse = JSON.stringify(meezanResponse.data);
        await payment.save();

        // Log activity
        if (req.userId) {
          await createLog(
            req.userId,
            'payment_initiated',
            `Payment initiated with Meezan Bank - Transaction: ${transactionId}`,
            'payment',
            payment._id,
            transactionId
          );
        }

        // Return payment URL for redirect
        return res.status(200).json({
          success: true,
          mode: 'LIVE',
          data: {
            transactionId: transactionId,
            status: 'pending',
            paymentUrl: meezanResponse.data.paymentUrl || 
                       meezanResponse.data.payment_url,
            gatewayTransactionId: meezanResponse.data.transactionId
          },
          message: 'Redirect to payment page'
        });

      } catch (meezanError) {
        console.error('Meezan Bank API error:', meezanError.message);
        console.error('Error details:', meezanError.response?.data);
        console.error('Error stack:', meezanError.stack);

        // Update payment status to failed
        payment.status = 'failed';
        payment.gatewayResponse = JSON.stringify({
          error: meezanError.message,
          details: meezanError.response?.data,
          timestamp: new Date().toISOString()
        });
        await payment.save();

        return res.status(500).json({
          success: false,
          message: 'We could not process your payment. Please try again.'
        });
      }
    }

    // ─────────────────────────────────────────────────────────
    // INVALID PAYMENT MODE
    // ─────────────────────────────────────────────────────────
    console.error('Payment configuration error: Invalid PAYMENT_MODE in .env');
    console.error('PAYMENT_MODE must be either MOCK or LIVE');
    return res.status(500).json({
      success: false,
      message: 'Payment service unavailable. Please try again later.'
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or contact support.'
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// WEBHOOK HANDLER
// Receives payment confirmation from Meezan Bank
// ═══════════════════════════════════════════════════════════════
exports.handleWebhook = async (req, res) => {
  try {
    console.log('Webhook received from Meezan Bank:', req.body);

    const {
      transactionId,
      status,
      signature,
      gatewayTransactionId,
      amount,
      paymentMethod
    } = req.body;

    // ─────────────────────────────────────────────────────────
    // VERIFY WEBHOOK SIGNATURE (LIVE MODE ONLY)
    // ─────────────────────────────────────────────────────────
    if (process.env.PAYMENT_MODE === 'LIVE' && process.env.MEEZAN_SECRET_KEY) {
      const isValid = verifyWebhookSignature(req.body, signature);
      
      if (!isValid) {
        console.error('Webhook error: Invalid signature');
        console.error('Received signature:', signature);
        console.error('Webhook payload:', JSON.stringify(req.body, null, 2));
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }
    }

    // ─────────────────────────────────────────────────────────
    // FIND AND UPDATE PAYMENT
    // ─────────────────────────────────────────────────────────
    const payment = await Payment.findOne({ transactionId });
    
    if (!payment) {
      console.error('Webhook error: Payment not found for transaction:', transactionId);
      console.error('Webhook payload:', JSON.stringify(req.body, null, 2));
      return res.status(404).json({
        success: false,
        message: 'Not found'
      });
    }

    // Update payment status
    const previousStatus = payment.status;
    payment.status = mapPaymentStatus(status);
    payment.gatewayTransactionId = gatewayTransactionId;
    payment.gatewayResponse = JSON.stringify(req.body);
    
    if (payment.status === 'paid') {
      payment.paidAt = new Date();
    }

    await payment.save();
    console.log(`Payment ${transactionId} updated: ${previousStatus} → ${payment.status}`);

    // ─────────────────────────────────────────────────────────
    // UPDATE ORDER STATUS AND HANDLE STOCK
    // ─────────────────────────────────────────────────────────
    if (payment.orderId) {
      const order = await Order.findById(payment.orderId).populate('products.product');
      
      if (order) {
        if (payment.status === 'paid') {
          order.paymentStatus = 'paid';
          order.transactionId = transactionId;
          order.paymentDate = new Date();
          order.gatewayResponse = JSON.stringify(req.body);
          await order.save();
          
          console.log('Order payment status updated to PAID (webhook):', order._id);
          console.log('Stock was already reserved when order was created');
        } else if (payment.status === 'failed') {
          order.paymentStatus = 'failed';
          await order.save();
          
          // ═══════════════════════════════════════════════════════
          // RESTORE STOCK FOR FAILED PAYMENT
          // ═══════════════════════════════════════════════════════
          console.log('Payment failed - restoring reserved stock for order:', order._id);
          
          for (let item of order.products) {
            // Skip stock restoration for custom size items
            if (item.isCustomSize || item.customSize?.isCustom) {
              console.log(`Skipping stock restoration for custom size item: ${item.productSnapshot?.name}`);
              continue;
            }

            const productDoc = await Product.findById(item.product);
            if (productDoc) {
              // Restore the specific size quantity
              if (productDoc.sizes && productDoc.sizes.length > 0 && item.size && item.size !== 'Standard' && item.size !== 'Custom Size') {
                // Check if size exists
                const sizeExists = productDoc.sizes.find(s => s.size === item.size);
                
                if (sizeExists) {
                  // Size exists, increment quantity
                  await Product.findOneAndUpdate(
                    { 
                      _id: item.product,
                      'sizes.size': item.size
                    },
                    {
                      $inc: {
                        'sizes.$.quantity': item.quantity,
                        stock: item.quantity
                      }
                    }
                  );
                } else {
                  // Size was removed (was 0), add it back
                  await Product.findByIdAndUpdate(
                    item.product,
                    {
                      $push: { sizes: { size: item.size, quantity: item.quantity } },
                      $inc: { stock: item.quantity }
                    }
                  );
                }
                
                console.log(`Stock restored for ${productDoc.name}, size ${item.size}: +${item.quantity}`);
              } else {
                // No sizes, just increment stock
                await Product.findByIdAndUpdate(
                  item.product,
                  { $inc: { stock: item.quantity } }
                );
                console.log(`Stock restored for ${productDoc.name}: +${item.quantity}`);
              }
              
              // Update product status if it was OUT_OF_STOCK
              const updatedProduct = await Product.findById(item.product);
              if (updatedProduct.status === 'OUT_OF_STOCK' && updatedProduct.stock > 0) {
                updatedProduct.status = 'ACTIVE';
                await updatedProduct.save();
                console.log(`Product ${productDoc.name} status changed from OUT_OF_STOCK to ACTIVE`);
              }
            }
          }
        }
        
        console.log('Order payment status updated:', order._id);
      }
    }

    // Respond to webhook
    return res.status(200).json({
      success: true,
      received: true
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET PAYMENT STATUS
// ═══════════════════════════════════════════════════════════════
exports.getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId })
      .populate('orderId', 'orderId totalAmount')
      .select('-paymentToken -gatewayResponse');

    if (!payment) {
      console.error('Payment status check: Payment not found for transaction:', transactionId);
      return res.status(404).json({
        success: false,
        message: 'Payment information not available'
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
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve payment status. Please try again.'
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// VERIFY PAYMENT (Legacy endpoint)
// ═══════════════════════════════════════════════════════════════
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId });
    
    if (!payment) {
      console.error('Payment verification: Payment not found for transaction:', transactionId);
      return res.status(404).json({
        success: false,
        message: 'Payment information not available'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        transactionId: payment.transactionId,
        status: payment.status,
        amount: payment.amount,
        paidAt: payment.paidAt
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Unable to verify payment. Please try again.'
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function generateTransactionId(paymentMethod) {
  const prefix = 'MZN';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function verifyWebhookSignature(payload, signature) {
  if (!process.env.MEEZAN_SECRET_KEY) {
    console.warn('MEEZAN_SECRET_KEY not set, skipping signature verification');
    return true;
  }

  try {
    // Create a copy of payload without signature
    const payloadCopy = { ...payload };
    delete payloadCopy.signature;

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.MEEZAN_SECRET_KEY)
      .update(JSON.stringify(payloadCopy))
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

function mapPaymentStatus(meezanStatus) {
  const statusMap = {
    'SUCCESS': 'paid',
    'APPROVED': 'paid',
    'COMPLETED': 'paid',
    'PAID': 'paid',
    'PENDING': 'pending',
    'PROCESSING': 'processing',
    'FAILED': 'failed',
    'DECLINED': 'failed',
    'REJECTED': 'failed',
    'CANCELLED': 'cancelled',
    'CANCELED': 'cancelled',
    'REFUNDED': 'refunded'
  };

  return statusMap[meezanStatus?.toUpperCase()] || 'failed';
}
