const express = require('express');
const router = express.Router();
const { verifyToken, adminCheck } = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');
const FooterLink = require('../models/footerLink');

/**
 * @route   GET /api/maintenance/status
 * @desc    Check if maintenance mode is enabled (PUBLIC)
 * @access  Public
 */
router.get('/status', async (req, res) => {
  try {
    // Fetch social media links from database
    const socialLinks = await FooterLink.find({ 
      type: 'social', 
      active: true 
    }).select('label url icon platform phoneNumber').sort({ order: 1 });

    res.json({
      maintenance: process.env.MAINTENANCE_MODE === 'true',
      message: process.env.MAINTENANCE_MESSAGE || '',
      endTime: process.env.MAINTENANCE_END_TIME || null,
      socialLinks: socialLinks || []
    });
  } catch (error) {
    console.error('Error fetching maintenance status:', error);
    res.json({
      maintenance: process.env.MAINTENANCE_MODE === 'true',
      message: process.env.MAINTENANCE_MESSAGE || '',
      endTime: process.env.MAINTENANCE_END_TIME || null,
      socialLinks: []
    });
  }
});

/**
 * @route   POST /api/maintenance/toggle
 * @desc    Toggle maintenance mode ON/OFF (ADMIN ONLY)
 * @access  Admin
 */
router.post('/toggle', verifyToken, adminCheck, async (req, res) => {
  try {
    const { enabled, message, endTime } = req.body;

    // Update environment variables in memory
    process.env.MAINTENANCE_MODE = enabled ? 'true' : 'false';
    
    if (message !== undefined) {
      process.env.MAINTENANCE_MESSAGE = message;
    }
    
    if (endTime !== undefined) {
      process.env.MAINTENANCE_END_TIME = endTime;
    }

    // Update .env file for persistence
    const envPath = path.join(__dirname, '../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update MAINTENANCE_MODE
    if (envContent.includes('MAINTENANCE_MODE=')) {
      envContent = envContent.replace(
        /MAINTENANCE_MODE=.*/,
        `MAINTENANCE_MODE=${enabled ? 'true' : 'false'}`
      );
    } else {
      envContent += `\nMAINTENANCE_MODE=${enabled ? 'true' : 'false'}`;
    }

    // Update MAINTENANCE_MESSAGE
    if (message !== undefined) {
      if (envContent.includes('MAINTENANCE_MESSAGE=')) {
        envContent = envContent.replace(
          /MAINTENANCE_MESSAGE=.*/,
          `MAINTENANCE_MESSAGE=${message}`
        );
      } else {
        envContent += `\nMAINTENANCE_MESSAGE=${message}`;
      }
    }

    // Update MAINTENANCE_END_TIME
    if (endTime !== undefined) {
      if (envContent.includes('MAINTENANCE_END_TIME=')) {
        envContent = envContent.replace(
          /MAINTENANCE_END_TIME=.*/,
          `MAINTENANCE_END_TIME=${endTime}`
        );
      } else {
        envContent += `\nMAINTENANCE_END_TIME=${endTime}`;
      }
    }

    // Write back to .env file
    fs.writeFileSync(envPath, envContent);

    res.json({
      success: true,
      maintenance: process.env.MAINTENANCE_MODE === 'true',
      message: enabled 
        ? 'Maintenance mode enabled. Website is now showing maintenance page to visitors.' 
        : 'Maintenance mode disabled. Website is now accessible to all visitors.',
      data: {
        enabled: process.env.MAINTENANCE_MODE === 'true',
        message: process.env.MAINTENANCE_MESSAGE,
        endTime: process.env.MAINTENANCE_END_TIME
      }
    });
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle maintenance mode',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/maintenance/settings
 * @desc    Get current maintenance settings (ADMIN ONLY)
 * @access  Admin
 */
router.get('/settings', verifyToken, adminCheck, (req, res) => {
  res.json({
    success: true,
    data: {
      enabled: process.env.MAINTENANCE_MODE === 'true',
      message: process.env.MAINTENANCE_MESSAGE || '',
      endTime: process.env.MAINTENANCE_END_TIME || null
    }
  });
});

module.exports = router;
