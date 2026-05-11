const Subscriber = require('../models/subscriber');
const EmailLog = require('../models/emailLog');
const { sendNotificationToSubscribers, isEmailConfigured, BRAND } = require('../utils/email');

// Subscribe a new email
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return res.status(400).json({ message: 'This email is already subscribed' });
      }
      // Reactivate if previously unsubscribed
      existingSubscriber.status = 'active';
      existingSubscriber.unsubscribedAt = null;
      await existingSubscriber.save();
      return res.status(200).json({ success: true, message: 'Welcome back! Your subscription has been reactivated' });
    }

    // Create new subscriber
    const subscriber = new Subscriber({ email: email.toLowerCase() });
    await subscriber.save();

    res.status(201).json({ success: true, message: 'Successfully subscribed to our newsletter!' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This email is already subscribed' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get all subscribers (admin)
exports.getAllSubscribers = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    
    const subscribers = await Subscriber.find(query).sort({ subscribedAt: -1 });

    res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update subscriber status (admin)
exports.updateSubscriberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'unsubscribed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const subscriber = await Subscriber.findById(id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    subscriber.status = status;
    if (status === 'unsubscribed') {
      subscriber.unsubscribedAt = new Date();
    } else {
      subscriber.unsubscribedAt = null;
    }
    await subscriber.save();

    res.status(200).json({ success: true, subscriber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete subscriber (admin)
exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const subscriber = await Subscriber.findByIdAndDelete(id);
    
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    res.status(200).json({ success: true, message: 'Subscriber deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send notification email to all active subscribers (manual trigger)
exports.sendNotification = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({ message: 'Type and data are required' });
    }

    if (!['product', 'category'].includes(type)) {
      return res.status(400).json({ message: 'Invalid notification type' });
    }

    // Check if email is configured
    if (!isEmailConfigured()) {
      return res.status(200).json({ 
        success: true, 
        message: 'Email notification skipped (SMTP not configured)', 
        sent: 0,
        configured: false,
      });
    }

    // Send notifications
    const result = await sendNotificationToSubscribers(type, data);

    res.status(200).json({
      success: true,
      message: result.message || `Notification sent to ${result.sent} subscribers`,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
      errors: result.errors?.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get subscriber stats
exports.getStats = async (req, res) => {
  try {
    const total = await Subscriber.countDocuments();
    const active = await Subscriber.countDocuments({ status: 'active' });
    const unsubscribed = await Subscriber.countDocuments({ status: 'unsubscribed' });

    // Get email stats
    const emailsSent = await EmailLog.countDocuments({ status: 'sent' });
    const emailsFailed = await EmailLog.countDocuments({ status: 'failed' });

    res.status(200).json({
      success: true,
      stats: { 
        total, 
        active, 
        unsubscribed,
        emailsSent,
        emailsFailed,
        emailConfigured: isEmailConfigured(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get email logs (admin)
exports.getEmailLogs = async (req, res) => {
  try {
    const { status, type, limit = 50 } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;

    const logs = await EmailLog.find(query)
      .sort({ sentAt: -1 })
      .limit(parseInt(limit));

    const stats = {
      total: await EmailLog.countDocuments(),
      sent: await EmailLog.countDocuments({ status: 'sent' }),
      failed: await EmailLog.countDocuments({ status: 'failed' }),
    };

    res.status(200).json({
      success: true,
      count: logs.length,
      stats,
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get email configuration status
exports.getEmailConfig = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      configured: isEmailConfigured(),
      sender: BRAND.email,
      brandName: BRAND.name,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Test email configuration
exports.testEmailConfig = async (req, res) => {
  try {
    const nodemailer = require('nodemailer');
    
    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
      },
    };
    
    // Check if credentials are set
    if (!config.auth.user || !config.auth.pass || config.auth.pass === 'your_app_password_here') {
      return res.status(200).json({
        success: false,
        configured: false,
        message: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in backend/.env file.',
        hint: 'For Gmail, you need to generate an App Password: Google Account > Security > 2-Step Verification > App passwords',
      });
    }
    
    const transporter = nodemailer.createTransport(config);
    
    // Try to verify connection
    await transporter.verify();
    
    res.status(200).json({
      success: true,
      configured: true,
      message: 'Email configuration is valid and connection successful!',
      smtpUser: config.auth.user,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      configured: false,
      message: `Email configuration error: ${error.message}`,
      errorCode: error.code,
      hint: error.code === 'EAUTH' 
        ? 'Authentication failed. For Gmail, make sure you are using an App Password, not your regular password.'
        : 'Check your SMTP settings in backend/.env',
    });
  }
};
