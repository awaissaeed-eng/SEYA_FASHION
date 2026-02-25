const nodemailer = require('nodemailer');

// Email configuration
const getEmailConfig = () => {
  // Use environment variables for email configuration
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  };
};

// Create reusable transporter
const createTransporter = () => {
  const config = getEmailConfig();
  
  // Check if email is configured
  if (!config.auth.user || !config.auth.pass) {
    throw new Error('Email service not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
  }
  
  return nodemailer.createTransporter(config);
};

// Send email function
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = createTransporter();
    
    // Verify connection
    await transporter.verify();
    
    const mailOptions = {
      from: `"SEYA Fashion" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    };
    
    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    // Log error for debugging but don't expose sensitive details
    const errorMessage = error.message || 'Failed to send email';
    return { success: false, error: errorMessage };
  }
};

// Check if email service is configured
const isEmailConfigured = () => {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
};

module.exports = {
  sendEmail,
  isEmailConfigured,
};
