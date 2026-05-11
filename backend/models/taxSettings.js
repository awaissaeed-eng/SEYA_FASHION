const mongoose = require('mongoose');

const gstSettingsSchema = new mongoose.Schema({
  // New GST percentage field
  gstPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100, // Maximum 100% GST
  },
  // Legacy tax amount field (for backward compatibility)
  taxAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isEnabled: {
    type: Boolean,
    default: false,
  },
  // Shipping charges configuration
  shippingCharges: {
    isEnabled: {
      type: Boolean,
      default: false,
    },
    fixedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    freeShippingAbove: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Ensure only one GST settings document exists
gstSettingsSchema.index({}, { unique: true });

// Use the same collection name as before to maintain compatibility
module.exports = mongoose.model('TaxSettings', gstSettingsSchema, 'taxsettings');