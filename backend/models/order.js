const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Make optional for guest checkout
  },
  // Customer Information (from checkout form)
  customerInfo: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
  },
  products: [{
    // Product reference (for active products)
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false, // Made optional since we store snapshot
    },
    // Product snapshot - preserves data even if product is deleted
    productSnapshot: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        default: '',
      },
      images: [{
        type: String, // Cloudinary URLs
      }],
      category: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
      },
      sku: String,
      details: String,
      // Snapshot timestamp
      snapshotAt: {
        type: Date,
        default: Date.now,
      },
    },
    // Order-specific product data
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    size: {
      type: String,
      default: '',
    },
    // Custom Size Flag and Data (preserved from cart)
    isCustomSize: { type: Boolean, default: false }, // Clear flag for custom size orders
    customSize: {
      isCustom: { type: Boolean, default: false }, // Backward compatibility
      measurements: {
        kameez: {
          chest: Number,
          waist: Number,
          hips: Number,
          shoulderWidth: Number,
          armLength: Number,
          kameezLength: Number
        },
        shalwar: {
          waist: Number,
          hip: Number,
          length: Number,
          ankleWidth: Number
        },
        dupatta: {
          length: Number,
          width: Number
        }
      },
      notes: String,
      measurementFiles: [{
        filename: String,
        originalName: String,
        url: String,
        fileType: { type: String, enum: ['image', 'pdf'] },
        uploadedAt: { type: Date, default: Date.now }
      }]
    },
    // Track if original product still exists
    productExists: {
      type: Boolean,
      default: true,
    },
  }],
  subtotalAmount: {
    type: Number,
    required: true,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  shippingAmount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
    default: 'pending',
  },
  trackingNumber: {
    type: String,
    default: '',
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date,
  },
  estimatedDelivery: {
    type: Date,
  },
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String,
  },
  billingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentInfo: {
    // Card payment fields
    cardName: String,
    // Note: Never store actual card numbers, expiry, or CVV
    last4Digits: String,
    cardType: String,
  },
  // Payment Status - Independent from Order Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  paymentGateway: {
    type: String,
    default: 'Meezan Bank', // Default gateway
  },
  transactionId: {
    type: String,
    default: '',
  },
  paymentDate: {
    type: Date,
  },
  gatewayResponse: {
    type: String, // Store raw response for debugging (admin only)
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
