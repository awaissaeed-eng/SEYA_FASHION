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
        shippingCharges: {
          isEnabled: false,
          fixedAmount: 0,
          freeShippingAbove: 0,
        },
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
    const { gstPercentage, isEnabled, taxAmount, shippingCharges } = req.body;

    // Handle backward compatibility - if taxAmount is provided, treat it as 0% GST
    let percentage = gstPercentage;
    if (percentage === undefined && taxAmount !== undefined) {
      // Legacy support: if taxAmount is provided, set GST to 0%
      percentage = 0;
    }

    // Validate GST percentage
    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      return res.status(400).json({ message: 'GST percentage must be between 0 and 100' });
    }

    // Validate shipping charges if provided
    if (shippingCharges) {
      if (shippingCharges.fixedAmount !== undefined && shippingCharges.fixedAmount < 0) {
        return res.status(400).json({ message: 'Shipping amount cannot be negative' });
      }
      if (shippingCharges.freeShippingAbove !== undefined && shippingCharges.freeShippingAbove < 0) {
        return res.status(400).json({ message: 'Free shipping threshold cannot be negative' });
      }
    }

    let gstSettings = await TaxSettings.findOne();
    
    if (!gstSettings) {
      gstSettings = new TaxSettings({
        gstPercentage: percentage || 0,
        isEnabled: isEnabled || false,
        shippingCharges: shippingCharges || {
          isEnabled: false,
          fixedAmount: 0,
          freeShippingAbove: 0,
        },
        updatedBy: req.userId,
      });
    } else {
      gstSettings.gstPercentage = percentage !== undefined ? percentage : gstSettings.gstPercentage;
      gstSettings.isEnabled = isEnabled !== undefined ? isEnabled : gstSettings.isEnabled;
      
      // Update shipping charges if provided
      if (shippingCharges) {
        if (!gstSettings.shippingCharges) {
          gstSettings.shippingCharges = {};
        }
        gstSettings.shippingCharges.isEnabled = shippingCharges.isEnabled !== undefined 
          ? shippingCharges.isEnabled 
          : gstSettings.shippingCharges.isEnabled;
        gstSettings.shippingCharges.fixedAmount = shippingCharges.fixedAmount !== undefined 
          ? shippingCharges.fixedAmount 
          : gstSettings.shippingCharges.fixedAmount;
        gstSettings.shippingCharges.freeShippingAbove = shippingCharges.freeShippingAbove !== undefined 
          ? shippingCharges.freeShippingAbove 
          : gstSettings.shippingCharges.freeShippingAbove;
      }
      
      gstSettings.updatedBy = req.userId;
    }

    await gstSettings.save();

    // Log activity
    if (req.userId) {
      const logMessage = [];
      if (percentage !== undefined) logMessage.push(`GST: ${percentage}%`);
      if (isEnabled !== undefined) logMessage.push(`GST Enabled: ${isEnabled}`);
      if (shippingCharges) {
        logMessage.push(`Shipping: ${shippingCharges.isEnabled ? 'Enabled' : 'Disabled'}`);
        if (shippingCharges.fixedAmount !== undefined) logMessage.push(`Amount: PKR ${shippingCharges.fixedAmount}`);
        if (shippingCharges.freeShippingAbove !== undefined) logMessage.push(`Free above: PKR ${shippingCharges.freeShippingAbove}`);
      }
      
      await createLog(
        req.userId, 
        'tax_settings_updated', 
        `Updated settings: ${logMessage.join(', ')}`, 
        'settings', 
        gstSettings._id, 
        'Tax & Shipping Settings'
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