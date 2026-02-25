const { SupportCard, FAQ, ContactMessage, ContactInfo, WhatsAppSettings, Policy } = require('../models/supportContent');

// ============ SUPPORT CARDS ============
exports.getSupportCards = async (req, res) => {
  try {
    let cards = await SupportCard.find({ active: true }).sort({ order: 1 });
    
    // Seed default data if empty
    if (cards.length === 0) {
      const defaults = [
        { icon: 'truck', title: 'Shipping Info', description: 'Free shipping on orders over Rs. 5000', order: 1 },
        { icon: 'rotateCcw', title: 'Easy Returns', description: '14-day return policy', order: 2 },
        { icon: 'creditCard', title: 'Secure Payment', description: 'Safe & secure transactions', order: 3 },
        { icon: 'shield', title: 'Quality Guarantee', description: 'Premium quality assured', order: 4 }
      ];
      cards = await SupportCard.insertMany(defaults);
    }
    
    res.json({ success: true, cards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllSupportCards = async (req, res) => {
  try {
    let cards = await SupportCard.find().sort({ order: 1 });
    
    if (cards.length === 0) {
      const defaults = [
        { icon: 'truck', title: 'Shipping Info', description: 'Free shipping on orders over Rs. 5000', order: 1 },
        { icon: 'rotateCcw', title: 'Easy Returns', description: '14-day return policy', order: 2 },
        { icon: 'creditCard', title: 'Secure Payment', description: 'Safe & secure transactions', order: 3 },
        { icon: 'shield', title: 'Quality Guarantee', description: 'Premium quality assured', order: 4 }
      ];
      cards = await SupportCard.insertMany(defaults);
    }
    
    res.json({ success: true, cards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSupportCard = async (req, res) => {
  try {
    const card = new SupportCard(req.body);
    await card.save();
    res.status(201).json({ success: true, card });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSupportCard = async (req, res) => {
  try {
    const card = await SupportCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    res.json({ success: true, card });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSupportCard = async (req, res) => {
  try {
    await SupportCard.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ============ FAQs ============
exports.getFAQs = async (req, res) => {
  try {
    let faqs = await FAQ.find({ active: true }).sort({ order: 1 });
    
    if (faqs.length === 0) {
      const defaults = [
        { question: 'What is your shipping policy?', answer: 'We offer free shipping on all orders above Rs. 5000. Standard shipping takes 5-7 business days.', order: 1 },
        { question: 'How do I track my order?', answer: 'Once your order is shipped, you will receive a tracking number via email or WhatsApp.', order: 2 },
        { question: 'What is your return policy?', answer: 'We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in original condition with tags attached.', order: 3 },
        { question: 'How do I determine my size?', answer: 'Please refer to our size guide available on each product page. If you are between sizes, we recommend sizing up.', order: 4 },
        { question: 'Do you offer customization?', answer: 'Yes, we offer customization services for select items. Please contact our customer service team for more details.', order: 5 },
        { question: 'What payment methods do you accept?', answer: 'We accept Cash on Delivery (COD), bank transfers, and credit/debit cards. All payments are processed securely.', order: 6 }
      ];
      faqs = await FAQ.insertMany(defaults);
    }
    
    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllFAQs = async (req, res) => {
  try {
    let faqs = await FAQ.find().sort({ order: 1 });
    
    if (faqs.length === 0) {
      const defaults = [
        { question: 'What is your shipping policy?', answer: 'We offer free shipping on all orders above Rs. 5000. Standard shipping takes 5-7 business days.', order: 1 },
        { question: 'How do I track my order?', answer: 'Once your order is shipped, you will receive a tracking number via email or WhatsApp.', order: 2 },
        { question: 'What is your return policy?', answer: 'We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in original condition with tags attached.', order: 3 },
        { question: 'How do I determine my size?', answer: 'Please refer to our size guide available on each product page. If you are between sizes, we recommend sizing up.', order: 4 },
        { question: 'Do you offer customization?', answer: 'Yes, we offer customization services for select items. Please contact our customer service team for more details.', order: 5 },
        { question: 'What payment methods do you accept?', answer: 'We accept Cash on Delivery (COD), bank transfers, and credit/debit cards. All payments are processed securely.', order: 6 }
      ];
      faqs = await FAQ.insertMany(defaults);
    }
    
    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFAQ = async (req, res) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();
    res.status(201).json({ success: true, faq });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
    res.json({ success: true, faq });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ CONTACT MESSAGES ============
exports.createContactMessage = async (req, res) => {
  try {
    const message = new ContactMessage(req.body);
    await message.save();
    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markMessageRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json({ success: true, message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteContactMessage = async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ============ CONTACT INFO ============
exports.getContactInfo = async (req, res) => {
  try {
    let info = await ContactInfo.find({ active: true }).sort({ order: 1 });
    
    if (info.length === 0) {
      const defaults = [
        { icon: 'mapPin', title: 'Visit Us', content: 'Islamabad, Pakistan\nRawalpindi, Pakistan', order: 1 },
        { icon: 'phone', title: 'Call Us', content: '+92 300 1234567\nMon-Sat: 10AM - 8PM', order: 2 },
        { icon: 'mail', title: 'Email Us', content: 'info@seyafashion.com\nsupport@seyafashion.com', order: 3 }
      ];
      info = await ContactInfo.insertMany(defaults);
    }
    
    res.json({ success: true, contactInfo: info });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllContactInfo = async (req, res) => {
  try {
    let info = await ContactInfo.find().sort({ order: 1 });
    
    if (info.length === 0) {
      const defaults = [
        { icon: 'mapPin', title: 'Visit Us', content: 'Islamabad, Pakistan\nRawalpindi, Pakistan', order: 1 },
        { icon: 'phone', title: 'Call Us', content: '+92 300 1234567\nMon-Sat: 10AM - 8PM', order: 2 },
        { icon: 'mail', title: 'Email Us', content: 'info@seyafashion.com\nsupport@seyafashion.com', order: 3 }
      ];
      info = await ContactInfo.insertMany(defaults);
    }
    
    res.json({ success: true, contactInfo: info });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createContactInfo = async (req, res) => {
  try {
    const info = new ContactInfo(req.body);
    await info.save();
    res.status(201).json({ success: true, contactInfo: info });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateContactInfo = async (req, res) => {
  try {
    const info = await ContactInfo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!info) return res.status(404).json({ success: false, message: 'Contact info not found' });
    res.json({ success: true, contactInfo: info });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteContactInfo = async (req, res) => {
  try {
    await ContactInfo.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Contact info deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ WHATSAPP SETTINGS ============
exports.getWhatsAppSettings = async (req, res) => {
  try {
    let settings = await WhatsAppSettings.findOne({ active: true });
    
    if (!settings) {
      settings = await WhatsAppSettings.create({
        phoneNumber: '923001234567',
        buttonText: 'Start WhatsApp Chat',
        subtitle: 'Chat with us instantly',
        active: true
      });
    }
    
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateWhatsAppSettings = async (req, res) => {
  try {
    let settings = await WhatsAppSettings.findOne();
    
    if (settings) {
      settings = await WhatsAppSettings.findByIdAndUpdate(settings._id, req.body, { new: true });
    } else {
      settings = await WhatsAppSettings.create(req.body);
    }
    
    res.json({ success: true, settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============ POLICIES ============
exports.getPolicies = async (req, res) => {
  try {
    let policies = await Policy.find({ active: true }).sort({ order: 1 });
    
    if (policies.length === 0) {
      const defaults = [
        { title: 'Shipping Policy', content: 'Free shipping on orders over Rs. 5000\nStandard delivery: 5-7 business days\nExpress delivery: 2-3 business days\nNationwide shipping available', contentType: 'bullets', order: 1 },
        { title: 'Return Policy', content: '14-day return window\nItems must be unworn with tags\nFree returns for exchanges\nRefund processed within 5-7 days', contentType: 'bullets', order: 2 },
        { title: 'Privacy Policy', content: 'Secure payment processing\nYour data is protected\nNo sharing of personal info\nFully compliant with data protection laws', contentType: 'bullets', order: 3 }
      ];
      policies = await Policy.insertMany(defaults);
    }
    
    res.json({ success: true, policies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllPolicies = async (req, res) => {
  try {
    let policies = await Policy.find().sort({ order: 1 });
    
    if (policies.length === 0) {
      const defaults = [
        { title: 'Shipping Policy', content: 'Free shipping on orders over Rs. 5000\nStandard delivery: 5-7 business days\nExpress delivery: 2-3 business days\nNationwide shipping available', contentType: 'bullets', order: 1 },
        { title: 'Return Policy', content: '14-day return window\nItems must be unworn with tags\nFree returns for exchanges\nRefund processed within 5-7 days', contentType: 'bullets', order: 2 },
        { title: 'Privacy Policy', content: 'Secure payment processing\nYour data is protected\nNo sharing of personal info\nFully compliant with data protection laws', contentType: 'bullets', order: 3 }
      ];
      policies = await Policy.insertMany(defaults);
    }
    
    res.json({ success: true, policies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    const policy = new Policy(req.body);
    await policy.save();
    res.status(201).json({ success: true, policy });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' });
    res.json({ success: true, policy });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    await Policy.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Policy deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
