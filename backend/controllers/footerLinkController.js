const FooterLink = require('../models/footerLink');

// Get all links for admin (all types)
exports.getAllFooterLinks = async (req, res) => {
  try {
    // Fetch all links for admin
    const allLinks = await FooterLink.find().sort({ order: 1, createdAt: 1 });
    
    // Also get grouped footer links for frontend
    const footerLinks = allLinks.filter(link => link.type === 'footer' && link.active);
    const grouped = {
      social: [],
      quick: [],
      contact: [],
    };
    footerLinks.forEach(link => {
      if (link.category === 'social') grouped.social.push(link);
      else if (link.category === 'quick') grouped.quick.push(link);
      else if (link.category === 'contact') grouped.contact.push(link);
    });
    
    res.json({ success: true, grouped, links: allLinks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new footer link
exports.createFooterLink = async (req, res) => {
  try {
    const linkData = {
      label: req.body.label,
      url: req.body.url,
      type: req.body.type,
      icon: req.body.icon,
      active: req.body.active,
      category: req.body.category || '',
    };
    
    // Add floating social icon specific fields
    if (req.body.type === 'floating') {
      linkData.platform = req.body.platform;
      linkData.phoneNumber = req.body.phoneNumber || '';
      linkData.hoverText = req.body.hoverText || '';
      linkData.order = req.body.order || 0;
    }
    
    const link = new FooterLink(linkData);
    await link.save();
    res.status(201).json({ success: true, link });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a footer link
exports.updateFooterLink = async (req, res) => {
  try {
    const updateData = {
      label: req.body.label,
      url: req.body.url,
      type: req.body.type,
      icon: req.body.icon,
      active: req.body.active,
      category: req.body.category || '',
    };
    
    // Add floating social icon specific fields
    if (req.body.type === 'floating') {
      updateData.platform = req.body.platform;
      updateData.phoneNumber = req.body.phoneNumber || '';
      updateData.hoverText = req.body.hoverText || '';
      updateData.order = req.body.order || 0;
    }
    
    const link = await FooterLink.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!link) return res.status(404).json({ message: 'Footer link not found' });
    res.json({ success: true, link });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a footer link
exports.deleteFooterLink = async (req, res) => {
  try {
    const link = await FooterLink.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ message: 'Footer link not found' });
    res.json({ success: true, message: 'Footer link deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get enabled floating social icons (public endpoint for frontend)
exports.getFloatingSocialIcons = async (req, res) => {
  try {
    const icons = await FooterLink.find({ type: 'floating', active: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, icons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
