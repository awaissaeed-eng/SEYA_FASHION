const Order = require('../models/order');
const { createLog } = require('./activityLogController');
const { calculateGst } = require('./taxController');
const { validateStatusTransition, getValidNextStatuses } = require('../utils/orderStatusRules');

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
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is owner or admin
    if (order.user && order.user._id.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    // Validate stock and create product snapshots
    const processedProducts = [];
    for (let item of products) {
      const productDoc = await Product.findById(item.product).populate('category');
      if (!productDoc) {
        return res.status(400).json({ message: `Product not found` });
      }
      
      // Skip stock validation for custom size items (made to order)
      const isCustomSizeItem = item.isCustomSize || item.customSize?.isCustom;
      if (!isCustomSizeItem && productDoc.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${productDoc?.name}` });
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

    // Reduce product stock and update size quantities (skip custom size items)
    for (let item of processedProducts) {
      // Skip stock reduction for custom size items as they are made to order
      if (item.isCustomSize || item.customSize?.isCustom) {
        console.log(`Skipping stock reduction for custom size item: ${item.productSnapshot?.name}`);
        continue;
      }

      const productDoc = await Product.findById(item.product);
      if (productDoc) {
        // Update the specific size quantity
        if (productDoc.sizes && productDoc.sizes.length > 0 && item.size && item.size !== 'Standard') {
          const updatedSizes = productDoc.sizes.map(s => {
            if (s.size === item.size) {
              return { ...s.toObject(), quantity: Math.max(0, s.quantity - item.quantity) };
            }
            return s.toObject();
          });
          
          // Filter out sizes with quantity <= 0
          const validSizes = updatedSizes.filter(s => s.quantity > 0);
          
          // Recalculate total stock from remaining sizes
          const newStock = validSizes.reduce((sum, s) => sum + s.quantity, 0);
          
          // Use $set to fully replace sizes array (not merge)
          await Product.updateOne(
            { _id: item.product },
            { $set: { sizes: validSizes, stock: newStock } }
          );
        } else {
          // No sizes, just decrement stock
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity } }
          );
        }
      }
    }

    // Clear guest cart cookie after order is placed
    res.clearCookie('shopping_cart', { path: '/' });

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
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending orders' });
    }

    // Restore product stock
    for (let item of order.products) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
