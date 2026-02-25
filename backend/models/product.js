const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    details: {
      type: String,
      default: '',
    },
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide product description'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: 0,
    // PKR
  },
  originalPrice: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  images: [{
    type: String,
    required: true,
  }],
  thumbnail: {
    type: String,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  sizes: [{
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL'],
    },
    quantity: {
      type: Number,
      min: 0,
      default: 0,
    },
  }],
  // Custom Size Configuration
  allowCustomSize: {
    type: Boolean,
    default: true, // Enable by default for clothing items
  },
  customSizeFields: {
    kameez: {
      enabled: { type: Boolean, default: true },
      fields: [{
        name: { type: String, default: 'chest' },
        label: { type: String, default: 'Chest' },
        unit: { type: String, default: 'inches' },
        required: { type: Boolean, default: true }
      }]
    },
    shalwar: {
      enabled: { type: Boolean, default: true },
      fields: [{
        name: { type: String, default: 'waist' },
        label: { type: String, default: 'Waist' },
        unit: { type: String, default: 'inches' },
        required: { type: Boolean, default: true }
      }]
    },
    dupatta: {
      enabled: { type: Boolean, default: true },
      fields: [{
        name: { type: String, default: 'length' },
        label: { type: String, default: 'Length' },
        unit: { type: String, default: 'inches' },
        required: { type: Boolean, default: true }
      }]
    }
  },
  colors: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  tags: [String],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'],
    default: 'IN_STOCK',
  },
}, {
  timestamps: true,
});

// Virtual to calculate stock status
productSchema.methods.calculateStockStatus = function() {
  let totalStock = 0;
  
  // If product has sizes, calculate total from sizes
  if (this.sizes && this.sizes.length > 0) {
    totalStock = this.sizes.reduce((sum, size) => sum + (size.quantity || 0), 0);
  } else {
    // Otherwise use the stock field
    totalStock = this.stock || 0;
  }
  
  if (totalStock === 0) {
    return 'OUT_OF_STOCK';
  } else if (totalStock < 5) {
    return 'LOW_STOCK';
  }
  return 'IN_STOCK';
};

// Pre-save hook to update status
productSchema.pre('save', function(next) {
  this.status = this.calculateStockStatus();
  next();
});

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = (sum / this.reviews.length).toFixed(1);
  }
};

module.exports = mongoose.model('Product', productSchema);
