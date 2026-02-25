const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'product_created',
      'product_updated',
      'product_deleted',
      'category_created',
      'category_updated',
      'category_deleted',
      'order_created',
      'order_status_updated',
      'order_cancelled',
      'inventory_updated',
      'password_changed',
      'profile_updated',
      'avatar_updated',
    ],
  },
  description: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    enum: ['product', 'category', 'order', 'user', 'settings'],
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  targetName: {
    type: String,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
