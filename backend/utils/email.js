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
// ═══════════════════════════════════════════════════════════════
const sendOrderConfirmationEmail = async (order) => {
  try {
    // Check if email is configured
    if (!isEmailConfigured()) {
      console.warn('⚠️  Email not configured - skipping order confirmation email');
      return { success: false, skipped: true, message: 'Email not configured' };
    }

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const year = new Date().getFullYear();

    // Format order items for email
    const itemsListHtml = order.products.map(item => {
      const productName = item.productSnapshot?.name || 'Product';
      const size = item.size || 'N/A';
      const quantity = item.quantity || 1;
      const price = item.price || 0;
      const total = price * quantity;

      return `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #eee;">
            <strong style="color: ${BRAND.colors.primary};">${productName}</strong><br>
            <span style="color: #888; font-size: 13px;">Size: ${size}</span>
          </td>
          <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center; color: #666;">
            ${quantity}
          </td>
          <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right; color: ${BRAND.colors.accent}; font-weight: 600;">
            PKR ${total.toLocaleString('en-PK')}
          </td>
        </tr>
      `;
    }).join('');

    // Format plain text version
    const itemsListText = order.products.map(item => {
      const productName = item.productSnapshot?.name || 'Product';
      const size = item.size || 'N/A';
      const quantity = item.quantity || 1;
      const price = item.price || 0;
      const total = price * quantity;
      return `  • ${productName} (Size: ${size}) - Qty: ${quantity} - PKR ${total.toLocaleString('en-PK')}`;
    }).join('\n');

    // Email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;500&display=swap');
          body { font-family: 'Lato', Arial, sans-serif; margin: 0; padding: 0; background-color: ${BRAND.colors.background}; }
          .container { max-width: 600px; margin: 0 auto; background-color: ${BRAND.colors.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, ${BRAND.colors.primary} 0%, #3d1c09 100%); padding: 40px 30px; text-align: center; }
          .header h1 { font-family: 'Playfair Display', Georgia, serif; color: ${BRAND.colors.accent}; margin: 0; font-size: 32px; letter-spacing: 3px; }
          .header p { color: rgba(191, 167, 123, 0.8); margin: 10px 0 0; font-size: 14px; letter-spacing: 1px; }
          .content { padding: 40px 30px; }
          .badge { display: inline-block; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 1px; margin-bottom: 20px; }
          .order-id { font-family: 'Playfair Display', Georgia, serif; color: ${BRAND.colors.primary}; font-size: 24px; margin: 20px 0; }
          .info-box { background-color: ${BRAND.colors.background}; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-box h3 { color: ${BRAND.colors.primary}; margin: 0 0 10px; font-size: 16px; }
          .info-box p { color: #666; margin: 5px 0; font-size: 14px; line-height: 1.6; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th { background-color: ${BRAND.colors.primary}; color: ${BRAND.colors.accent}; padding: 12px; text-align: left; font-size: 13px; letter-spacing: 1px; }
          .order-table th:last-child { text-align: right; }
          .totals { margin-top: 20px; }
          .totals-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .totals-row.total { border-top: 2px solid ${BRAND.colors.primary}; border-bottom: 2px solid ${BRAND.colors.primary}; font-weight: 700; font-size: 18px; color: ${BRAND.colors.primary}; margin-top: 10px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, ${BRAND.colors.primary} 0%, #3d1c09 100%); color: ${BRAND.colors.accent} !important; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; margin-top: 25px; letter-spacing: 1px; }
          .divider { height: 1px; background: linear-gradient(90deg, transparent, ${BRAND.colors.accent}, transparent); margin: 30px 0; }
          .footer { background-color: ${BRAND.colors.background}; padding: 30px; text-align: center; }
          .footer p { color: ${BRAND.colors.primary}; font-size: 12px; margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${BRAND.name}</h1>
            <p>Elegance Redefined</p>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <span class="badge">✓ ORDER CONFIRMED</span>
              <h2 style="color: ${BRAND.colors.primary}; margin: 10px 0;">Thank You, ${order.customerInfo.firstName}!</h2>
              <p style="color: #666; font-size: 15px;">Your order has been received and is being processed.</p>
            </div>
            
            <div class="divider"></div>
            
            <div class="info-box">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${order.orderId}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Payment Status:</strong> ${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</p>
            </div>

            <h3 style="color: ${BRAND.colors.primary}; margin-top: 30px;">Items Ordered</h3>
            <table class="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHtml}
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row">
                <span style="color: #666;">Subtotal:</span>
                <span style="color: #666;">PKR ${order.subtotalAmount?.toLocaleString('en-PK') || '0'}</span>
              </div>
              <div class="totals-row">
                <span style="color: #666;">Tax (GST):</span>
                <span style="color: #666;">PKR ${order.taxAmount?.toLocaleString('en-PK') || '0'}</span>
              </div>
              <div class="totals-row">
                <span style="color: #666;">Shipping:</span>
                <span style="color: #666;">PKR ${order.shippingAmount?.toLocaleString('en-PK') || '0'}</span>
              </div>
              <div class="totals-row total">
                <span>Total:</span>
                <span style="color: ${BRAND.colors.accent};">PKR ${order.totalAmount?.toLocaleString('en-PK') || '0'}</span>
              </div>
            </div>

            <div class="info-box" style="margin-top: 30px;">
              <h3>Delivery Address</h3>
              <p>${order.shippingAddress.name}</p>
              <p>${order.shippingAddress.street}</p>
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
              <p>${order.shippingAddress.country}</p>
              <p style="margin-top: 10px;"><strong>Contact:</strong> ${order.customerInfo.phone}</p>
            </div>

            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>📞 Next Steps:</strong> We will contact you on <strong>${order.customerInfo.phone}</strong> to confirm delivery details and arrange shipment.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${baseUrl}/orders/${order._id}?email=${encodeURIComponent(order.customerInfo.email)}" class="cta-button">VIEW ORDER STATUS</a>
            </div>

            <div class="divider"></div>

            <p style="color: #888; font-size: 13px; text-align: center;">
              If you have any questions, please contact us at <a href="mailto:${BRAND.email}" style="color: ${BRAND.colors.accent};">${BRAND.email}</a>
            </p>
          </div>
          <div class="footer">
            <p><strong>${BRAND.name}</strong></p>
            <p>Where Style Meets Sophistication</p>
            <div class="divider" style="margin: 15px auto; width: 50%;"></div>
            <p>© ${year} ${BRAND.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const emailText = `
Dear ${order.customerInfo.firstName},

Thank you for your order at ${BRAND.name}!

ORDER DETAILS
─────────────────────────────────────
Order ID: ${order.orderId}
Order Date: ${new Date(order.createdAt).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
Payment Status: ${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}

ITEMS ORDERED
─────────────────────────────────────
${itemsListText}

ORDER SUMMARY
─────────────────────────────────────
Subtotal:  PKR ${order.subtotalAmount?.toLocaleString('en-PK') || '0'}
Tax (GST): PKR ${order.taxAmount?.toLocaleString('en-PK') || '0'}
Shipping:  PKR ${order.shippingAmount?.toLocaleString('en-PK') || '0'}
─────────────────────────────────────
Total:     PKR ${order.totalAmount?.toLocaleString('en-PK') || '0'}

DELIVERY ADDRESS
─────────────────────────────────────
${order.shippingAddress.name}
${order.shippingAddress.street}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
${order.shippingAddress.country}

Contact: ${order.customerInfo.phone}

NEXT STEPS
─────────────────────────────────────
We will contact you on ${order.customerInfo.phone} to confirm delivery details and arrange shipment.

View your order status: ${baseUrl}/orders/${order._id}?email=${encodeURIComponent(order.customerInfo.email)}

Thank you for shopping with ${BRAND.name}!

If you have any questions, please contact us at ${BRAND.email}

${BRAND.name} - Where Style Meets Sophistication
© ${year} ${BRAND.name}. All rights reserved.
    `.trim();

    // Send email
    const transport = getTransporter();
    
    // Determine sender email
    const senderEmail = process.env.USE_ETHEREAL === 'true' 
      ? process.env.ETHEREAL_USER 
      : process.env.SMTP_USER;

    const info = await transport.sendMail({
      from: `"${BRAND.name}" <${senderEmail}>`,
      to: order.customerInfo.email,
      subject: `Order Confirmed — ${order.orderId} — ${BRAND.name}`,
      text: emailText,
      html: emailHtml,
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
