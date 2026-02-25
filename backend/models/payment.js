const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Transaction identification
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  
  // Payment method and tokenized data (PCI compliant)
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card']
  },
  paymentToken: {
    type: String,
    required: true,
    // This is the tokenized payment data, never raw card details
  },
  tokenData: {
    // Safe, non-sensitive token metadata
    last4: String, // Last 4 digits of card
    cardType: String, // Visa, Mastercard, etc.
    maskedNumber: String,
    expiryMonth: String,
    expiryYear: String
  },
  
  // Transaction details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'PKR'
  },
  
  // Payment status tracking
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  
  // Gateway information
  gateway: {
    type: String,
    required: true,
    default: 'meezan_bank'
  },
  gatewayTransactionId: {
    type: String,
    index: true
  },
  gatewayResponse: {
    type: String, // JSON string of gateway response
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  paidAt: {
    type: Date,
    index: true
  },
  
  // Customer information (for payment processing)
  customerInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },
  
  // Billing address
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Security and fraud prevention
  metadata: {
    ipAddress: String,
    userAgent: String,
    timestamp: Date,
    fraudScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // Refund information
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed']
    },
    processedAt: Date,
    gatewayRefundId: String
  }],
  
  // Webhook and callback tracking
  webhookAttempts: [{
    timestamp: Date,
    status: String,
    response: String
  }]
}, {
  timestamps: true
});

// Indexes for performance
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ 'metadata.ipAddress': 1, createdAt: -1 });
paymentSchema.index({ gatewayTransactionId: 1 });

// Virtual for total refunded amount
paymentSchema.virtual('totalRefunded').get(function() {
  return this.refunds
    .filter(refund => refund.status === 'completed')
    .reduce((total, refund) => total + refund.amount, 0);
});

// Methods
paymentSchema.methods.isRefundable = function() {
  return this.status === 'paid' && 
         this.totalRefunded < this.amount &&
         Date.now() - this.paidAt < (30 * 24 * 60 * 60 * 1000); // 30 days
};

paymentSchema.methods.canRetry = function() {
  return ['failed', 'cancelled'].includes(this.status) &&
         Date.now() - this.createdAt < (24 * 60 * 60 * 1000); // 24 hours
};

// Static methods
paymentSchema.statics.findByTransactionId = function(transactionId) {
  return this.findOne({ transactionId });
};

paymentSchema.statics.getPaymentStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Set paidAt timestamp when status changes to paid
  if (this.isModified('status') && this.status === 'paid' && !this.paidAt) {
    this.paidAt = new Date();
  }
  next();
});

// Post-save middleware for logging
paymentSchema.post('save', function(doc) {
  if (this.isModified('status')) {
    console.log(`Payment ${doc.transactionId} status updated to: ${doc.status}`);
  }
});

module.exports = mongoose.model('Payment', paymentSchema);