const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxLength: 500,
  },
  orderId: {
    type: String,
    trim: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for faster queries
reviewSchema.index({ product: 1, isApproved: 1 });
reviewSchema.index({ isApproved: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
