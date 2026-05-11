const Order = require('../models/order');
const { createLog } = require('./activityLogController');
const { calculateGst } = require('./taxController');
const { validateStatusTransition, getValidNextStatuses } = require('../utils/orderStatusRules');
const { sendOrderConfirmationEmail } = require('../utils/email');
const EmailLog = require('../models/emailLog');

// Get all orders for admin panel with full details
exports.getAdminOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'firstName lastName email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const Counter = require('../models/counter');
const Product = require('../models/product');

// Get all orders (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'firstName lastName email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('getAllOrders error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user orders
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    // ─────────────────────────────────────────────────────────
    // STEP 1: VERIFY EMAIL OR PHONE PROVIDED (for guest orders)
    // ─────────────────────────────────────────────────────────
    const { email, phone } = req.query;

    // ─────────────────────────────────────────────────────────
    // STEP 2: FIND ORDER (by orderId or _id)
    // ─────────────────────────────────────────────────────────
    let order;
    
    // Try to find by orderId first (e.g., SEYA00001)
    order = await Order.findOne({ orderId: req.params.id })
      .populate('user', 'firstName lastName email phone');
    
    // If not found, try to find by MongoDB _id
    if (!order && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(req.params.id)
        .populate('user', 'firstName lastName email phone');
    }

    if (!order) {
      console.error('Order view failed: Order not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // ─────────────────────────────────────────────────────────
    // STEP 3: AUTHORIZATION CHECK
    // ─────────────────────────────────────────────────────────
    
    // Admin can view any order
    if (req.userRole === 'admin') {
      return res.status(200).json({
        success: true,
        order
      });
    }

    // Registered user can view their own order
    if (order.user && req.userId && order.user._id.toString() === req.userId) {
      return res.status(200).json({
        success: true,
        order
      });
    }

    // Guest order - require email or phone verification
    if (!email && !phone) {
      console.error('Order view failed: No email or phone provided for guest order');
      return res.status(400).json({
        success: false,
        message: 'Please provide your email or phone to view order'
      });
    }

    // Verify email or phone matches order
    const emailMatch = email && 
      order.customerInfo.email.toLowerCase() === email.toLowerCase();
    
    const phoneMatch = phone && 
      order.customerInfo.phone === phone;

    if (!emailMatch && !phoneMatch) {
      console.error('Order view failed: Email/phone mismatch');
      console.error('Provided email:', email);
      console.error('Provided phone:', phone);
      console.error('Order email:', order.customerInfo.email);
      console.error('Order phone:', order.customerInfo.phone);
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order'
      });
    }

    // Email/phone verified - return order
    console.log('Order viewed successfully:', order._id);
    console.log('Verified by:', emailMatch ? email : phone);

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve order. Please try again.'
    });
  }
};

// Create order
exports.createOrder = async (req, res, next) => {
  try {
    const { 
      products, 
      subtotal,
      totalAmount, 
      shippingAddress, 
      billingAddress,
      paymentMethod,
      paymentInfo,
      customerInfo // New: customer information from checkout
    } = req.body;

    console.log('Creating order with data:', {
      customerInfo,
      shippingAddress,
      billingAddress,
      paymentMethod,
      productsCount: products?.length,
      subtotal,
      totalAmount
    });

    // Calculate GST and shipping
    const gstAmount = await calculateGst(subtotal);
    const shippingAmount = 0; // Set to 0 as requested
    const calculatedTotal = subtotal + gstAmount + shippingAmount;

    // Validate that the total matches (allow small rounding differences)
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      console.warn('Total amount mismatch:', { calculatedTotal, providedTotal: totalAmount });
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: VALIDATE STOCK AND CREATE PRODUCT SNAPSHOTS
    // ═══════════════════════════════════════════════════════════════
    const processedProducts = [];
    
    for (let item of products) {
      const productDoc = await Product.findById(item.product).populate('category');
      
      if (!productDoc) {
        console.error('Product not found:', item.product);
        return res.status(404).json({ 
          success: false,
          message: `Product not found` 
        });
      }

      // ─────────────────────────────────────────────────────────
      // VALIDATE PRICE (Prevent price manipulation)
      // ─────────────────────────────────────────────────────────
      if (Math.abs(productDoc.price - item.price) > 0.01) {
        console.error('Price manipulation detected:', {
          product: productDoc.name,
          actualPrice: productDoc.price,
          providedPrice: item.price
        });
        return res.status(400).json({ 
          success: false,
          message: `Invalid price for ${productDoc.name}. Please refresh and try again.` 
        });
      }
      
      // Skip stock validation for custom size items (made to order)
      const isCustomSizeItem = item.isCustomSize || item.customSize?.isCustom;
      
      if (!isCustomSizeItem) {
        // ─────────────────────────────────────────────────────────
        // VALIDATE STOCK FOR STANDARD ITEMS
        // ─────────────────────────────────────────────────────────
        
        // Check if product has sizes
        if (productDoc.sizes && productDoc.sizes.length > 0 && item.size) {
          // Find the specific size
          const sizeObj = productDoc.sizes.find(s => s.size === item.size);
          
          if (!sizeObj) {
            console.error('Size not found:', item.size, 'for product:', productDoc.name);
            return res.status(400).json({ 
              success: false,
              message: `Size ${item.size} is not available for ${productDoc.name}` 
            });
          }
          
          if (sizeObj.quantity < item.quantity) {
            console.error('Insufficient stock for size:', {
              product: productDoc.name,
              size: item.size,
              requested: item.quantity,
              available: sizeObj.quantity
            });
            return res.status(400).json({ 
              success: false,
              message: `Sorry, ${productDoc.name} in size ${item.size} has only ${sizeObj.quantity} items available. You requested ${item.quantity}.` 
            });
          }
        } else {
          // No sizes, check total stock
          if (productDoc.stock < item.quantity) {
            console.error('Insufficient stock:', {
              product: productDoc.name,
              requested: item.quantity,
              available: productDoc.stock
            });
            return res.status(400).json({ 
              success: false,
              message: `Sorry, ${productDoc.name} has only ${productDoc.stock} items available. You requested ${item.quantity}.` 
            });
          }
        }
      }
      
      // Handle size assignment - custom size or standard size
      let size = item.size;
      
      if (isCustomSizeItem) {
        size = 'Custom Size'; // Set proper display for custom size
      } else if (!size || size === '') {
        // Assign default size for standard items
        if (productDoc.sizes && productDoc.sizes.length > 0) {
          size = productDoc.sizes[0].size;
        } else {
          size = 'Standard';
        }
      }
      
      // Create product snapshot for order history preservation
      const productSnapshot = {
        _id: productDoc._id,
        name: productDoc.name,
        description: productDoc.description,
        images: productDoc.images || [],
        category: productDoc.category ? {
          _id: productDoc.category._id,
          name: productDoc.category.name,
        } : null,
        sku: productDoc.sku,
        details: productDoc.details,
        snapshotAt: new Date(),
      };
      
      processedProducts.push({
        product: productDoc._id, // Reference to original product
        productSnapshot, // Complete product data snapshot
        quantity: item.quantity,
        price: item.price,
        size,
        productExists: true, // Product exists at time of order
        // Preserve custom size data from cart with clear flag
        isCustomSize: item.isCustomSize || item.customSize?.isCustom || false,
        customSize: item.customSize || { isCustom: false }
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: RESERVE STOCK (Prevent race conditions)
    // This reduces stock immediately to prevent double-booking
    // If payment fails, stock will be restored
    // ═══════════════════════════════════════════════════════════════
    console.log('Reserving stock for order...');
    
    for (let item of processedProducts) {
      // Skip stock reservation for custom size items
      if (item.isCustomSize || item.customSize?.isCustom) {
        console.log(`Skipping stock reservation for custom size item: ${item.productSnapshot?.name}`);
        continue;
      }

      const productDoc = await Product.findById(item.product);
      if (productDoc) {
        // Update the specific size quantity
        if (productDoc.sizes && productDoc.sizes.length > 0 && item.size && item.size !== 'Standard' && item.size !== 'Custom Size') {
          // Use findOneAndUpdate with atomic operation to prevent race conditions
          const result = await Product.findOneAndUpdate(
            { 
              _id: item.product,
              'sizes.size': item.size,
              'sizes.quantity': { $gte: item.quantity } // Ensure stock is still available
            },
            {
              $inc: {
                'sizes.$.quantity': -item.quantity,
                stock: -item.quantity
              }
            },
            { new: true }
          );
          
          if (!result) {
            // Stock was taken by another order, rollback previous reservations
            console.error('Stock reservation failed - race condition detected');
            
            // Rollback: restore stock for previously processed items
            for (let prevItem of processedProducts) {
              if (prevItem === item) break; // Stop at current item
              if (prevItem.isCustomSize) continue;
              
              await Product.findOneAndUpdate(
                { 
                  _id: prevItem.product,
                  'sizes.size': prevItem.size
                },
                {
                  $inc: {
                    'sizes.$.quantity': prevItem.quantity,
                    stock: prevItem.quantity
                  }
                }
              );
            }
            
            return res.status(400).json({ 
              success: false,
              message: `Sorry, ${item.productSnapshot.name} in size ${item.size} is no longer available. Another customer just purchased it.` 
            });
          }
          
          console.log(`Stock reserved for ${productDoc.name}, size ${item.size}: -${item.quantity}`);
          
          // Check if size is now out of stock
          const updatedProduct = await Product.findById(item.product);
          const updatedSize = updatedProduct.sizes.find(s => s.size === item.size);
          
          if (updatedSize && updatedSize.quantity <= 0) {
            // Remove size from array if quantity is 0
            updatedProduct.sizes = updatedProduct.sizes.filter(s => s.size !== item.size);
            await updatedProduct.save();
            console.log(`Size ${item.size} removed from ${productDoc.name} (out of stock)`);
          }
          
          // Check if product is completely out of stock
          if (updatedProduct.stock <= 0) {
            updatedProduct.status = 'OUT_OF_STOCK';
            await updatedProduct.save();
            console.log(`Product ${productDoc.name} marked as OUT_OF_STOCK`);
          }
        } else {
          // No sizes, just decrement stock with atomic operation
          const result = await Product.findOneAndUpdate(
            { 
              _id: item.product,
              stock: { $gte: item.quantity } // Ensure stock is still available
            },
            {
              $inc: { stock: -item.quantity }
            },
            { new: true }
          );
          
          if (!result) {
            // Stock was taken by another order, rollback
            console.error('Stock reservation failed - race condition detected');
            
            // Rollback previous reservations
            for (let prevItem of processedProducts) {
              if (prevItem === item) break;
              if (prevItem.isCustomSize) continue;
              
              await Product.findOneAndUpdate(
                { _id: prevItem.product },
                { $inc: { stock: prevItem.quantity } }
              );
            }
            
            return res.status(400).json({ 
              success: false,
              message: `Sorry, ${item.productSnapshot.name} is no longer available. Another customer just purchased it.` 
            });
          }
          
          console.log(`Stock reserved for ${productDoc.name}: -${item.quantity}`);
          
          // Check if product is out of stock
          if (result.stock <= 0) {
            result.status = 'OUT_OF_STOCK';
            await result.save();
            console.log(`Product ${productDoc.name} marked as OUT_OF_STOCK`);
          }
        }
      }
    }

    // Get and increment sequential order number
    let counter = await Counter.findOneAndUpdate(
      { name: 'order' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const orderId = 'SEYA' + counter.seq.toString().padStart(5, '0');

    // Extract payment information based on payment method
    let paymentInfoToStore = {};
    
    if (paymentMethod === 'card') {
      // Extract last 4 digits from card number for storage (security)
      const last4Digits = paymentInfo?.cardNumber ? 
        paymentInfo.cardNumber.replace(/\s/g, '').slice(-4) : '';
      
      paymentInfoToStore = {
        cardName: paymentInfo?.cardName || '',
        last4Digits,
        cardType: 'Unknown', // Could be determined from card number
      };
    }

    // Generate transaction ID for the order
    const generateTransactionId = () => {
      const prefix = 'MZN';
      const randomNum = Math.floor(Math.random() * 100000000);
      return `${prefix}-${randomNum.toString().padStart(8, '0')}`;
    };

    const order = new Order({
      orderId,
      user: req.userId || null, // Optional for guest checkout
      customerInfo: {
        firstName: customerInfo?.firstName || shippingAddress?.name?.split(' ')[0] || '',
        lastName: customerInfo?.lastName || shippingAddress?.name?.split(' ').slice(1).join(' ') || '',
        email: customerInfo?.email || '',
        phone: customerInfo?.phone || shippingAddress?.phone || '',
      },
      products: processedProducts,
      subtotalAmount: subtotal,
      taxAmount: gstAmount,
      shippingAmount,
      totalAmount: calculatedTotal,
      shippingAddress: {
        name: shippingAddress?.name || `${customerInfo?.firstName || ''} ${customerInfo?.lastName || ''}`.trim(),
        street: shippingAddress?.street || '',
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || '',
        zipCode: shippingAddress?.zipCode || '',
        country: shippingAddress?.country || '',
        phone: shippingAddress?.phone || customerInfo?.phone || '',
      },
      billingAddress: billingAddress ? {
        name: billingAddress.name || paymentInfo?.cardName || '',
        street: billingAddress.street || '',
        city: billingAddress.city || '',
        state: billingAddress.state || '',
        zipCode: billingAddress.zipCode || '',
        country: billingAddress.country || '',
      } : null,
      paymentMethod,
      paymentInfo: paymentInfoToStore,
      // Payment Status Information
      paymentStatus: 'pending', // Default to pending
      paymentGateway: 'Meezan Bank', // Default gateway
      transactionId: generateTransactionId(),
      paymentDate: null, // Will be set when payment is confirmed
      gatewayResponse: '', // Will be populated by payment gateway webhook
    });

    await order.save();

    // ═══════════════════════════════════════════════════════════════
    // STOCK ALREADY RESERVED
    // Stock was reduced in STEP 2 above to prevent race conditions
    // If payment fails, the payment controller will restore the stock
    // ═══════════════════════════════════════════════════════════════
    console.log('Order created with stock reserved');
    console.log('If payment fails, stock will be restored automatically');

    // DO NOT clear cart here - cart will be cleared after payment success
    // res.clearCookie('shopping_cart', { path: '/' });

    // Log activity for new order if user is logged in (admin tracking only)
    if (req.userId) {
      await createLog(req.userId, 'order_created', `New order ${orderId} received`, 'order', order._id, orderId);
    }

    // Populate product details including images before returning
    await order.populate('products.product', 'name price thumbnail images');

    console.log('Order created successfully:', {
      orderId: order.orderId,
      customerName: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
      customerEmail: order.customerInfo.email
    });

    // ═══════════════════════════════════════════════════════════════
    // SEND ORDER CONFIRMATION EMAIL
    // Send email to customer with order details
    // Do NOT fail the order if email fails - order is already saved
    // ═══════════════════════════════════════════════════════════════
    try {
      console.log('Sending order confirmation email...');
      const emailResult = await sendOrderConfirmationEmail(order);
      
      if (emailResult.success) {
        console.log(`✅ Order confirmation email sent successfully to ${order.customerInfo.email}`);
        
        // Log successful email to database
        try {
          await EmailLog.create({
            recipient: order.customerInfo.email,
            subject: `Order Confirmed — ${order.orderId} — SEYA Fashion`,
            type: 'order_confirmation',
            status: 'sent',
            relatedId: order._id,
            relatedModel: 'Order',
            sentAt: new Date()
          });
        } catch (logError) {
          console.error('Failed to log email to database:', logError.message);
          // Continue - email was sent successfully
        }
      } else if (emailResult.skipped) {
        console.warn(`⚠️  Order confirmation email skipped: ${emailResult.message}`);
      } else {
        console.error(`❌ Failed to send order confirmation email: ${emailResult.error}`);
        
        // Log failed email to database
        try {
          await EmailLog.create({
            recipient: order.customerInfo.email,
            subject: `Order Confirmed — ${order.orderId} — SEYA Fashion`,
            type: 'order_confirmation',
            status: 'failed',
            error: emailResult.error,
            relatedId: order._id,
            relatedModel: 'Order',
            sentAt: new Date()
          });
        } catch (logError) {
          console.error('Failed to log email error to database:', logError.message);
        }
      }
    } catch (emailError) {
      // Email sending failed, but order is already saved
      // Log the error but continue with the response
      console.error('❌ Order confirmation email error:', emailError.message);
      console.error('Order was created successfully, but email notification failed');
      
      // Try to log the error
      try {
        await EmailLog.create({
          recipient: order.customerInfo.email,
          subject: `Order Confirmed — ${order.orderId} — SEYA Fashion`,
          type: 'order_confirmation',
          status: 'failed',
          error: emailError.message,
          relatedId: order._id,
          relatedModel: 'Order',
          sentAt: new Date()
        });
      } catch (logError) {
        console.error('Failed to log email error to database:', logError.message);
      }
    }

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Find the current order
    const currentOrder = await Order.findById(req.params.id);
    if (!currentOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate status transition
    const validation = validateStatusTransition(currentOrder.status, status);
    if (!validation.valid) {
      return res.status(400).json({ 
        message: validation.error,
        currentStatus: currentOrder.status,
        attemptedStatus: status
      });
    }

    // Update the order status
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('products.product', 'name price');

    // Log activity
    if (req.userId) {
      await createLog(req.userId, 'order_status_updated', `Updated order ${order.orderId || order._id} status from "${currentOrder.status}" to "${status}"`, 'order', order._id, order.orderId || order._id.toString());
    }

    res.status(200).json({
      success: true,
      order,
      message: `Order status updated from ${currentOrder.status} to ${status}`
    });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get valid next statuses for an order (admin)
exports.getValidNextStatuses = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const validNextStatuses = getValidNextStatuses(order.status);
    
    res.status(200).json({
      success: true,
      currentStatus: order.status,
      validNextStatuses,
      isTerminal: validNextStatuses.length === 0
    });
  } catch (error) {
    console.error('getValidNextStatuses error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update payment status (for payment gateway webhooks)
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, transactionId, gatewayResponse } = req.body;

    // Validate payment status
    if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update payment information
    const updateData = {
      paymentStatus,
      gatewayResponse: gatewayResponse || '',
    };

    // Set payment date when payment is successful
    if (paymentStatus === 'paid') {
      updateData.paymentDate = new Date();
    }

    // Update transaction ID if provided
    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log activity
    if (req.userId) {
      await createLog(req.userId, 'payment_status_updated', `Updated payment status for order ${order.orderId || order._id} to "${paymentStatus}"`, 'order', order._id, order.orderId || order._id.toString());
    }

    res.status(200).json({
      success: true,
      order: updatedOrder,
      message: `Payment status updated to ${paymentStatus}`
    });
  } catch (error) {
    console.error('updatePaymentStatus error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    // ─────────────────────────────────────────────────────────
    // STEP 1: VERIFY EMAIL OR PHONE PROVIDED
    // ─────────────────────────────────────────────────────────
    const { email, phone } = req.body;

    if (!email && !phone) {
      console.error('Order cancellation failed: No email or phone provided');
      return res.status(400).json({
        success: false,
        message: 'Please provide your email or phone to cancel order'
      });
    }

    // ─────────────────────────────────────────────────────────
    // STEP 2: FIND ORDER
    // ─────────────────────────────────────────────────────────
    const order = await Order.findById(req.params.id);

    if (!order) {
      console.error('Order cancellation failed: Order not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // ─────────────────────────────────────────────────────────
    // STEP 3: VERIFY EMAIL OR PHONE MATCHES ORDER
    // ─────────────────────────────────────────────────────────
    const emailMatch = email && 
      order.customerInfo.email.toLowerCase() === email.toLowerCase();
    
    const phoneMatch = phone && 
      order.customerInfo.phone === phone;

    if (!emailMatch && !phoneMatch) {
      console.error('Order cancellation failed: Email/phone mismatch');
      console.error('Provided email:', email);
      console.error('Provided phone:', phone);
      console.error('Order email:', order.customerInfo.email);
      console.error('Order phone:', order.customerInfo.phone);
      return res.status(403).json({
        success: false,
        message: 'Email or phone does not match this order'
      });
    }

    // ─────────────────────────────────────────────────────────
    // STEP 4: CHECK ORDER STATUS
    // ─────────────────────────────────────────────────────────
    if (order.status !== 'pending') {
      console.error('Order cancellation failed: Order status is not pending:', order.status);
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending orders'
      });
    }

    // ─────────────────────────────────────────────────────────
    // STEP 5: RESTORE PRODUCT STOCK
    // ─────────────────────────────────────────────────────────
    for (let item of order.products) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    // ─────────────────────────────────────────────────────────
    // STEP 6: CANCEL ORDER
    // ─────────────────────────────────────────────────────────
    order.status = 'cancelled';
    await order.save();

    console.log('Order cancelled successfully:', order._id);
    console.log('Cancelled by:', emailMatch ? email : phone);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Order cancellation error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Unable to cancel order. Please try again or contact support.'
    });
  }
};
