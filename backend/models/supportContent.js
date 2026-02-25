const mongoose = require('mongoose');

// Support Cards Schema (4 cards - Shipping Info, Easy Returns, etc.)
const supportCardSchema = new mongoose.Schema({
  icon: { type: String, required: true }, // truck, rotateCcw, creditCard, shield
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// FAQ Schema
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Contact Messages Schema (from users)
const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  replied: { type: Boolean, default: false }
}, { timestamps: true });

// Contact Info Schema (Location, Phone, Email cards)
const contactInfoSchema = new mongoose.Schema({
  icon: { type: String, required: true }, // mapPin, phone, mail
  title: { type: String, required: true },
  content: { type: String, required: true }, // Can contain line breaks with \n
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// WhatsApp Settings Schema
const whatsappSettingsSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  buttonText: { type: String, default: 'Start WhatsApp Chat' },
  subtitle: { type: String, default: 'Chat with us instantly' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Policy Schema
const policySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // Can be bullet points or paragraphs
  contentType: { type: String, enum: ['bullets', 'paragraph'], default: 'bullets' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const SupportCard = mongoose.model('SupportCard', supportCardSchema);
const FAQ = mongoose.model('FAQ', faqSchema);
const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
const ContactInfo = mongoose.model('ContactInfo', contactInfoSchema);
const WhatsAppSettings = mongoose.model('WhatsAppSettings', whatsappSettingsSchema);
const Policy = mongoose.model('Policy', policySchema);

module.exports = {
  SupportCard,
  FAQ,
  ContactMessage,
  ContactInfo,
  WhatsAppSettings,
  Policy
};
