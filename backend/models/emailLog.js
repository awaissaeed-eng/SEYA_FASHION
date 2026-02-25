const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['product', 'category', 'order', 'welcome', 'other'],
    required: true,
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending',
  },
  error: {
    type: String,
    default: null,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel',
  },
  relatedModel: {
    type: String,
    enum: ['Product', 'Category', 'Order'],
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ type: 1 });
emailLogSchema.index({ sentAt: -1 });

// Auto-delete logs older than 30 days
emailLogSchema.index({ sentAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('EmailLog', emailLogSchema);
