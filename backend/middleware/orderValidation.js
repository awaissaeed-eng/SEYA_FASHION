const { body, validationResult } = require('express-validator');

// ═══════════════════════════════════════════════════════════════
// ORDER VALIDATION MIDDLEWARE
// Validates all order data before processing
// ═══════════════════════════════════════════════════════════════

exports.validateOrder = [
  // ─────────────────────────────────────────────────────────
  // CUSTOMER INFORMATION
  // ─────────────────────────────────────────────────────────
  body('customerInfo.firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name must contain only letters'),

  body('customerInfo.lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Last name must contain only letters'),

  body('customerInfo.email')
    .notEmpty()
    .withMessage('Email is required')
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('customerInfo.phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^(\+92|0)[0-9]{10}$/)
    .withMessage('Invalid Pakistan phone number format (e.g., 03001234567 or +923001234567)'),

  // ─────────────────────────────────────────────────────────
  // PRODUCTS
  // ─────────────────────────────────────────────────────────
  body('products')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one product'),

  body('products.*.product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format'),

  body('products.*.quantity')
    .isInt({ min: 1, max: 20 })
    .withMessage('Quantity must be between 1 and 20'),

  body('products.*.price')
    .isFloat({ min: 1, max: 1000000 })
    .withMessage('Price must be a positive number between 1 and 1,000,000'),

  body('products.*.size')
    .optional()
    .trim()
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'Standard', 'Custom Size', ''])
    .withMessage('Invalid size option'),

  // ─────────────────────────────────────────────────────────
  // SHIPPING ADDRESS
  // ─────────────────────────────────────────────────────────
  body('shippingAddress.name')
    .notEmpty()
    .withMessage('Recipient name is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Recipient name must not exceed 100 characters'),

  body('shippingAddress.street')
    .notEmpty()
    .withMessage('Street address is required')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),

  body('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required')
    .trim()
    .isLength({ max: 50 })
    .withMessage('City name must not exceed 50 characters'),

  body('shippingAddress.state')
    .notEmpty()
    .withMessage('State/Province is required')
    .trim()
    .isLength({ max: 50 })
    .withMessage('State name must not exceed 50 characters'),

  body('shippingAddress.zipCode')
    .notEmpty()
    .withMessage('Zip/Postal code is required')
    .trim()
    .matches(/^[0-9]{5}$/)
    .withMessage('Invalid Pakistan postal code (must be 5 digits)'),

  body('shippingAddress.country')
    .notEmpty()
    .withMessage('Country is required')
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country name must not exceed 50 characters'),

  body('shippingAddress.phone')
    .notEmpty()
    .withMessage('Shipping phone number is required')
    .trim()
    .matches(/^(\+92|0)[0-9]{10}$/)
    .withMessage('Invalid Pakistan phone number format'),

  // ─────────────────────────────────────────────────────────
  // BILLING ADDRESS (Optional)
  // ─────────────────────────────────────────────────────────
  body('billingAddress.name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Billing name must not exceed 100 characters'),

  body('billingAddress.street')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Billing street must not exceed 200 characters'),

  body('billingAddress.city')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Billing city must not exceed 50 characters'),

  body('billingAddress.state')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Billing state must not exceed 50 characters'),

  body('billingAddress.zipCode')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9]{5}$/)
    .withMessage('Invalid billing postal code (must be 5 digits)'),

  body('billingAddress.country')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Billing country must not exceed 50 characters'),

  // ─────────────────────────────────────────────────────────
  // AMOUNTS
  // ─────────────────────────────────────────────────────────
  body('subtotal')
    .isFloat({ min: 1, max: 10000000 })
    .withMessage('Subtotal must be a positive number'),

  body('totalAmount')
    .isFloat({ min: 1, max: 10000000 })
    .withMessage('Total amount must be a positive number'),

  // ─────────────────────────────────────────────────────────
  // PAYMENT METHOD
  // ─────────────────────────────────────────────────────────
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['card', 'cod', 'bank_transfer'])
    .withMessage('Invalid payment method (must be: card, cod, or bank_transfer)'),

  // ─────────────────────────────────────────────────────────
  // VALIDATION RESULT HANDLER
  // ─────────────────────────────────────────────────────────
  (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      console.error('Order validation failed:', {
        errors: errors.array(),
        body: req.body
      });

      // Group errors by field for better readability
      const errorsByField = {};
      errors.array().forEach(error => {
        if (!errorsByField[error.path]) {
          errorsByField[error.path] = [];
        }
        errorsByField[error.path].push(error.msg);
      });

      return res.status(400).json({
        success: false,
        message: 'Order validation failed. Please check your input.',
        errors: errors.array(),
        errorsByField
      });
    }

    console.log('Order validation passed:', {
      customerEmail: req.body.customerInfo?.email,
      productsCount: req.body.products?.length,
      totalAmount: req.body.totalAmount
    });

    next();
  }
];

// ═══════════════════════════════════════════════════════════════
// ADDITIONAL VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Validate that product IDs exist in database
 * This should be called in the controller after basic validation
 */
exports.validateProductsExist = async (products, Product) => {
  const invalidProducts = [];
  
  for (const item of products) {
    const product = await Product.findById(item.product);
    if (!product) {
      invalidProducts.push(item.product);
    }
  }
  
  return {
    valid: invalidProducts.length === 0,
    invalidProducts
  };
};

/**
 * Validate that total amount matches calculated amount
 * This prevents price manipulation
 */
exports.validateTotalAmount = (products, subtotal, totalAmount, taxAmount = 0, shippingAmount = 0) => {
  // Calculate expected subtotal
  const calculatedSubtotal = products.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // Calculate expected total
  const calculatedTotal = calculatedSubtotal + taxAmount + shippingAmount;

  // Allow small rounding differences (0.01)
  const subtotalMatch = Math.abs(calculatedSubtotal - subtotal) <= 0.01;
  const totalMatch = Math.abs(calculatedTotal - totalAmount) <= 0.01;

  return {
    valid: subtotalMatch && totalMatch,
    calculatedSubtotal,
    providedSubtotal: subtotal,
    calculatedTotal,
    providedTotal: totalAmount,
    subtotalMatch,
    totalMatch
  };
};
