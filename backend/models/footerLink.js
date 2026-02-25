const mongoose = require('mongoose');

const footerLinkSchema = new mongoose.Schema({
  label: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['footer', 'menu', 'social', 'promotion', 'quick', 'contact', 'floating'], required: true },
  icon: { type: String }, // optional, for social links
  active: { type: Boolean, default: true },
  category: { type: String }, // quick, social, contact (for footer links only)
  // Floating social icon specific fields
  platform: { type: String, enum: ['facebook', 'instagram', 'youtube', 'whatsapp', 'twitter', 'tiktok', ''] },
  phoneNumber: { type: String }, // For WhatsApp
  hoverText: { type: String }, // Custom hover text
  order: { type: Number, default: 0 }, // Display order for floating icons
}, { timestamps: true });

module.exports = mongoose.model('FooterLink', footerLinkSchema);
