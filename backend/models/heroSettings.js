const mongoose = require('mongoose');

const heroSettingsSchema = new mongoose.Schema({
  // Media type: 'video' or 'image'
  mediaType: {
    type: String,
    enum: ['video', 'image'],
    default: 'image',
  },
  
  // Images array for slideshow
  images: [{
    type: String,
  }],
  
  // Video URL
  video: {
    type: String,
    default: '',
  },
  
  // Blur effect
  blurEnabled: {
    type: Boolean,
    default: false,
  },
  blurAmount: {
    type: Number,
    default: 4, // pixels
    min: 0,
    max: 20,
  },
  
  // Slideshow settings
  slideshowEnabled: {
    type: Boolean,
    default: true,
  },
  slideshowInterval: {
    type: Number,
    default: 5, // seconds
    min: 1,
    max: 30,
  },
  
  // Video settings
  videoAutoplay: {
    type: Boolean,
    default: true,
  },
  videoLoop: {
    type: Boolean,
    default: true,
  },
  videoMuted: {
    type: Boolean,
    default: true,
  },
  
  // Content positioning and styling
  contentPosition: {
    type: String,
    enum: ['left', 'center', 'right'],
    default: 'left',
  },
  contentVerticalPosition: {
    type: String,
    enum: ['top', 'middle', 'bottom'],
    default: 'middle',
  },
  titleSize: {
    type: String,
    enum: ['small', 'medium', 'large', 'xlarge'],
    default: 'large',
  },
  subtitleSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'small',
  },
  descriptionSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium',
  },
  buttonSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium',
  },
  showSubtitle: {
    type: Boolean,
    default: true,
  },
  showDescription: {
    type: Boolean,
    default: true,
  },
  showButton: {
    type: Boolean,
    default: true,
  },
  
  // Hero content
  title: {
    type: String,
    default: 'Elegance Redefined',
  },
  subtitle: {
    type: String,
    default: 'NEW COLLECTION 2025',
  },
  description: {
    type: String,
    default: 'Discover our exclusive collection of luxury women\'s clothing. Where sophistication meets style.',
  },
  buttonText: {
    type: String,
    default: 'SHOP NOW',
  },
  buttonLink: {
    type: String,
    default: '/shop',
  },
  
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Ensure only one settings document exists
heroSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('HeroSettings', heroSettingsSchema);
