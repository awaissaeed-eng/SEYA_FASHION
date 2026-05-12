const nodemailer = require('nodemailer');

// Email configuration - dynamically get from env
const getEmailConfig = () => {
  // Use Ethereal for testing
  if (process.env.USE_ETHEREAL === 'true') {
    return {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
      },
    };
  }
  
  // Use real SMTP (Gmail or other)
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

// Brand configuration
const BRAND = {
  name: 'SEYA Fashion',
  get email() {
    return process.env.SMTP_USER || 'Seya_fashion@gmail.com';
  },
  colors: {
    primary: '#592a0d',
    accent: '#bfa77b',
    background: '#f5f1e8',
    white: '#ffffff',
  },
};

// Create reusable transporter
let transporter = null;

const getTransporter = () => {
  // Always create fresh transporter to pick up env changes
  transporter = nodemailer.createTransport(getEmailConfig());
  return transporter;
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transport = getTransporter();
    await transport.verify();
    return true;
  } catch (error) {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Email service configuration error:', error.message);
    }
    return false;
  }
};

// Email templates
const getEmailTemplate = (type, data) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const year = new Date().getFullYear();

  const baseStyles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;500&display=swap');
      body { font-family: 'Lato', Arial, sans-serif; margin: 0; padding: 0; background-color: ${BRAND.colors.background}; }
      .container { max-width: 600px; margin: 0 auto; background-color: ${BRAND.colors.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, ${BRAND.colors.primary} 0%, #3d1c09 100%); padding: 40px 30px; text-align: center; }
      .header h1 { font-family: 'Playfair Display', Georgia, serif; color: ${BRAND.colors.accent}; margin: 0; font-size: 32px; letter-spacing: 3px; }
      .header p { color: rgba(191, 167, 123, 0.8); margin: 10px 0 0; font-size: 14px; letter-spacing: 1px; }
      .content { padding: 40px 30px; }
      .badge { display: inline-block; background: linear-gradient(135deg, ${BRAND.colors.accent} 0%, #d4c4a8 100%); color: ${BRAND.colors.primary}; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 1px; margin-bottom: 20px; }
      .product-image { width: 100%; max-height: 400px; object-fit: cover; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
      .product-name { font-family: 'Playfair Display', Georgia, serif; color: ${BRAND.colors.primary}; font-size: 28px; margin: 20px 0 10px; }
      .product-price { color: ${BRAND.colors.accent}; font-size: 24px; font-weight: 700; margin: 10px 0; }
      .product-desc { color: #666; line-height: 1.8; margin: 15px 0; font-size: 15px; }
      .cta-button { display: inline-block; background: linear-gradient(135deg, ${BRAND.colors.primary} 0%, #3d1c09 100%); color: ${BRAND.colors.accent} !important; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; margin-top: 25px; letter-spacing: 1px; transition: all 0.3s ease; }
      .cta-button:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(89, 42, 13, 0.3); }
      .divider { height: 1px; background: linear-gradient(90deg, transparent, ${BRAND.colors.accent}, transparent); margin: 30px 0; }
      .footer { background-color: ${BRAND.colors.background}; padding: 30px; text-align: center; }
      .footer p { color: ${BRAND.colors.primary}; font-size: 12px; margin: 5px 0; }
      .footer a { color: ${BRAND.colors.accent}; text-decoration: none; }
      .social-links { margin: 15px 0; }
      .social-links a { display: inline-block; margin: 0 10px; color: ${BRAND.colors.primary}; }
    </style>
  `;

  if (type === 'product') {
    return {
      subject: `✨ New Arrival: ${data.name} - ${BRAND.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${BRAND.name}</h1>
              <p>Elegance Redefined</p>
            </div>
            <div class="content" style="text-align: center;">
              <span class="badge">✨ NEW ARRIVAL ✨</span>
              ${data.image ? `<img src="${data.image.startsWith('http') ? data.image : baseUrl + data.image}" alt="${data.name}" class="product-image" />` : ''}
              <h2 class="product-name">${data.name}</h2>
              <p class="product-price">Rs. ${data.price?.toLocaleString('en-PK') || '0'}</p>
              ${data.description ? `<p class="product-desc">${data.description.substring(0, 200)}${data.description.length > 200 ? '...' : ''}</p>` : ''}
              <div class="divider"></div>
              <p style="color: #888; font-size: 14px;">Be the first to own this exclusive piece</p>
              <a href="${baseUrl}/shop" class="cta-button">SHOP NOW</a>
            </div>
            <div class="footer">
              <p><strong>${BRAND.name}</strong></p>
              <p>Where Style Meets Sophistication</p>
              <div class="divider" style="margin: 15px auto; width: 50%;"></div>
              <p>© ${year} ${BRAND.name}. All rights reserved.</p>
              <p style="color: #999; font-size: 11px; margin-top: 15px;">
                You received this email because you subscribed to our newsletter.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  if (type === 'category') {
    return {
      subject: `🎉 New Collection: ${data.name} - ${BRAND.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${BRAND.name}</h1>
              <p>Elegance Redefined</p>
            </div>
            <div class="content" style="text-align: center;">
              <span class="badge">🎉 NEW COLLECTION 🎉</span>
              ${data.image ? `<img src="${data.image.startsWith('http') ? data.image : baseUrl + data.image}" alt="${data.name}" class="product-image" />` : ''}
              <h2 class="product-name">${data.name}</h2>
              ${data.description ? `<p class="product-desc">${data.description}</p>` : '<p class="product-desc">Discover our latest collection of elegant pieces crafted with precision and style.</p>'}
              <div class="divider"></div>
              <p style="color: #888; font-size: 14px;">Explore the newest additions to our exclusive collection</p>
              <a href="${baseUrl}/shop" class="cta-button">EXPLORE COLLECTION</a>
            </div>
            <div class="footer">
              <p><strong>${BRAND.name}</strong></p>
              <p>Where Style Meets Sophistication</p>
              <div class="divider" style="margin: 15px auto; width: 50%;"></div>
              <p>© ${year} ${BRAND.name}. All rights reserved.</p>
              <p style="color: #999; font-size: 11px; margin-top: 15px;">
                You received this email because you subscribed to our newsletter.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  return null;
};


// Send email to a single recipient
const sendEmail = async (to, subject, html) => {
  try {
    const transport = getTransporter();
    const result = await transport.sendMail({
      from: `"${BRAND.name}" <${BRAND.email}>`,
      to,
      subject,
      html,
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send notification to all active subscribers
const sendNotificationToSubscribers = async (type, data) => {
  const Subscriber = require('../models/subscriber');
  const EmailLog = require('../models/emailLog');

  const results = {
    total: 0,
    sent: 0,
    failed: 0,
    errors: [],
    skipped: false,
  };

  try {
    // Check if email is configured (either real SMTP or Ethereal)
    const useEthereal = process.env.USE_ETHEREAL === 'true';
    const hasRealSmtp = process.env.SMTP_USER && process.env.SMTP_PASS;
    const hasEthereal = process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS;
    
    if (!hasRealSmtp && !hasEthereal) {
      results.skipped = true;
      results.message = 'SMTP not configured';
      return results;
    }

    // Get email template
    const template = getEmailTemplate(type, data);
    if (!template) {
      results.skipped = true;
      results.message = 'Invalid notification type';
      return results;
    }

    // Get all active subscribers
    const subscribers = await Subscriber.find({ status: 'active' });
    results.total = subscribers.length;

    if (subscribers.length === 0) {
      results.message = 'No active subscribers';
      return results;
    }

    // Send emails to all subscribers
    const transport = getTransporter();
    
    // Verify transport connection first
    try {
      await transport.verify();
    } catch (verifyError) {
      results.skipped = true;
      results.message = `SMTP connection failed: ${verifyError.message}`;
      return results;
    }
    
    // Determine sender email
    const senderEmail = process.env.USE_ETHEREAL === 'true' 
      ? process.env.ETHEREAL_USER 
      : process.env.SMTP_USER;
    
    for (const subscriber of subscribers) {
      try {
        const info = await transport.sendMail({
          from: `"${BRAND.name}" <${senderEmail}>`,
          to: subscriber.email,
          subject: template.subject,
          html: template.html,
        });
        
        results.sent++;
        
        // If using Ethereal in development, log the preview URL
        if (process.env.USE_ETHEREAL === 'true' && process.env.NODE_ENV === 'development') {
          const previewUrl = nodemailer.getTestMessageUrl(info);
          console.log(`📬 Preview URL: ${previewUrl}`);
        }
        
        // Log successful email
        await EmailLog.create({
          recipient: subscriber.email,
          subject: template.subject,
          type,
          status: 'sent',
          relatedId: data._id,
          relatedModel: type === 'product' ? 'Product' : 'Category',
        });
        
      } catch (error) {
        results.failed++;
        results.errors.push({ email: subscriber.email, error: error.message });
        
        // Log failed email
        await EmailLog.create({
          recipient: subscriber.email,
          subject: template.subject,
          type,
          status: 'failed',
          error: error.message,
          relatedId: data._id,
          relatedModel: type === 'product' ? 'Product' : 'Category',
        });
      }
    }

    results.message = `Sent to ${results.sent}/${results.total} subscribers`;
    
  } catch (error) {
    results.error = error.message;
  }

  return results;
};

// Check if email service is configured
const isEmailConfigured = () => {
  const hasRealSmtp = process.env.SMTP_USER && process.env.SMTP_PASS;
  const hasEthereal = process.env.USE_ETHEREAL === 'true' && process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS;
  return !!(hasRealSmtp || hasEthereal);
};

// ═══════════════════════════════════════════════════════════════
// ORDER CONFIRMATION EMAIL
// Send order confirmation to customer after successful order
// Uses template from emailTemplates.js
// ═══════════════════════════════════════════════════════════════
const sendOrderConfirmationEmail = async (order) => {
  try {
    // Check if email is configured
    if (!isEmailConfigured()) {
      console.warn('⚠️  Email not configured - skipping order confirmation email');
      return { success: false, skipped: true, message: 'Email not configured' };
    }

    // Import the email template
    const { orderConfirmationTemplate } = require('./emailTemplates');
    
    // Generate email HTML from template
    const emailHTML = orderConfirmationTemplate(order);

    // Send email
    const transport = getTransporter();
    
    // Determine sender email
    const senderEmail = process.env.USE_ETHEREAL === 'true' 
      ? process.env.ETHEREAL_USER 
      : process.env.SMTP_USER;

    const info = await transport.sendMail({
      from: `"${BRAND.name}" <${senderEmail}>`,
      to: order.customerInfo.email,
      subject: `Order Confirmed — ${order.orderId} | Seya Fashion`,
      html: emailHTML,
    });

    // If using Ethereal in development, log the preview URL
    if (process.env.USE_ETHEREAL === 'true' && process.env.NODE_ENV === 'development') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`📬 Order Confirmation Email Preview: ${previewUrl}`);
    }

    console.log(`✅ Order confirmation email sent to ${order.customerInfo.email} for order ${order.orderId}`);

    return { 
      success: true, 
      messageId: info.messageId,
      email: order.customerInfo.email,
      orderId: order.orderId
    };

  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

module.exports = {
  getTransporter,
  verifyEmailConfig,
  getEmailTemplate,
  sendEmail,
  sendNotificationToSubscribers,
  sendOrderConfirmationEmail,
  isEmailConfigured,
  BRAND,
};
