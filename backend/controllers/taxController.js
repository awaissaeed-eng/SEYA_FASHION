const TaxSettings = require('../models/taxSettings');
const { createLog } = require('./activityLogController');

// Get current GST settings
exports.getGstSettings = async (req, res) => {
  try {
    let gstSettings = await TaxSettings.findOne();
    
    // Create default settings if none exist
    if (!gstSettings) {
      gstSettings = new TaxSettings({
        gstPercentage: 0,
        isEnabled: false,
      });
      await gstSettings.save();
    }

    res.status(200).json({
      success: true,
      gstSettings,
      taxSettings: gstSettings, // Legacy support
    });
  } catch (error) {
    console.error('getGstSettings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update GST settings (admin only)
exports.updateGstSettings = async (req, res) => {
  try {
    const { gstPercentage, isEnabled, taxAmount } = req.body;

    // Handle backward compatibility - if taxAmount is provided, treat it as 0% GST
    let percentage = gstPercentage;
    if (percentage === undefined && taxAmount !== undefined) {
      // Legacy support: if taxAmount is provided, set GST to 0%
      percentage = 0;
    }

    // Validate GST percentage
    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({ message: 'GST percentage must be between 0 and 100' });
    }

    let gstSettings = await TaxSettings.findOne();
    
    if (!gstSettings) {
      gstSettings = new TaxSettings({
        gstPercentage: percentage || 0,
        isEnabled: isEnabled || false,
        updatedBy: req.userId,
      });
    } else {
      gstSettings.gstPercentage = percentage !== undefined ? percentage : gstSettings.gstPercentage;
      gstSettings.isEnabled = isEnabled !== undefined ? isEnabled : gstSettings.isEnabled;
      gstSettings.updatedBy = req.userId;
    }

    await gstSettings.save();

    // Log activity
    if (req.userId) {
      await createLog(
        req.userId, 
        'gst_settings_updated', 
        `Updated GST settings: ${percentage}%, Enabled: ${isEnabled}`, 
        'settings', 
        gstSettings._id, 
        'GST Settings'
      );
    }

    res.status(200).json({
      success: true,
      gstSettings,
      taxSettings: gstSettings, // Legacy support
    });
  } catch (error) {
    console.error('updateGstSettings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Calculate GST for given subtotal
exports.calculateGst = async (subtotal) => {
  try {
    const gstSettings = await TaxSettings.findOne();
    
    if (!gstSettings || !gstSettings.isEnabled || gstSettings.gstPercentage <= 0) {
      return 0;
    }

    // Calculate GST as percentage of subtotal
    const gstAmount = (parseFloat(subtotal) * gstSettings.gstPercentage) / 100;
    return Math.round(gstAmount); // Round to nearest rupee
  } catch (error) {
    console.error('calculateGst error:', error);
    return 0;
  }
};

// Get GST calculation for frontend
exports.getGstCalculation = async (req, res) => {
  try {
    const { subtotal } = req.query;
    
    if (!subtotal || subtotal <= 0) {
      return res.status(400).json({ message: 'Valid subtotal is required' });
    }

    const gstAmount = await exports.calculateGst(parseFloat(subtotal));
    const shippingAmount = 0; // Set to 0 as requested
    const total = parseFloat(subtotal) + gstAmount + shippingAmount;

    res.status(200).json({
      success: true,
      calculation: {
        subtotal: parseFloat(subtotal),
        gstAmount,
        shippingAmount,
        total,
      },
    });
  } catch (error) {
    console.error('getGstCalculation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Legacy support - keep old function names for backward compatibility
exports.getTaxSettings = exports.getGstSettings;
exports.updateTaxSettings = exports.updateGstSettings;
exports.calculateTax = exports.calculateGst;
exports.getTaxCalculation = exports.getGstCalculation;