/**
 * ═══════════════════════════════════════════════════════════════
 * EMAIL TEMPLATES FOR SEYA FASHION
 * Professional HTML email templates matching brand colors
 * ═══════════════════════════════════════════════════════════════
 */

const BRAND = {
  name: 'SEYA FASHION',
  tagline: 'ELEGANCE IN EVERY THREAD',
  colors: {
    primary: '#592a0d',
    secondary: '#bfa77b',
    background: '#f9f4f0',
    white: '#ffffff',
    border: '#f0e8e0',
    success: '#15803d',
    successBg: '#f0fdf4',
  }
};

/**
 * Order Confirmation Email Template
 * Sent immediately after order is created
 */
exports.orderConfirmationTemplate = (order) => {
  // Format product items HTML
  const itemsHTML = order.products.map(item => {
    const product = item.productSnapshot || item.product || {};
    const productName = product.name || 'Product';
    const productImage = product.images && product.images[0] 
      ? (product.images[0].startsWith('http') ? product.images[0] : `${process.env.CLIENT_URL}${product.images[0]}`)
      : '';
    const size = item.size || 'Standard';
    const quantity = item.quantity || 1;
    const price = item.price || 0;
    const total = price * quantity;

    return `
      <tr>
        <td style="padding:12px;border-bottom:1px solid ${BRAND.colors.border};">
          ${productImage ? `<img src="${productImage}" alt="${productName}" width="60" style="border-radius:4px;display:block;"/>` : ''}
        </td>
        <td style="padding:12px;border-bottom:1px solid ${BRAND.colors.border};">
          <strong style="color:${BRAND.colors.primary};">${productName}</strong><br/>
          <span style="color:#888;font-size:13px;">Size: ${size}</span>
        </td>
        <td style="padding:12px;border-bottom:1px solid ${BRAND.colors.border};text-align:center;color:#666;">
          ${quantity}
        </td>
        <td style="padding:12px;border-bottom:1px solid ${BRAND.colors.border};text-align:right;color:${BRAND.colors.primary};font-weight:600;">
          PKR ${total.toLocaleString('en-PK')}
        </td>
      </tr>
    `;
  }).join('');

  // Format payment status badge
  const paymentStatusBadge = order.paymentStatus === 'paid'
    ? `<span style="background:#dcfce7;color:${BRAND.colors.success};padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">✅ Paid</span>`
    : `<span style="background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">⏳ Pending</span>`;

  // Format shipping amount
  const shippingDisplay = order.shippingAmount === 0
    ? '<span style="color:#15803d;font-weight:600;">FREE</span>'
    : `PKR ${order.shippingAmount.toLocaleString('en-PK')}`;

  // Format order date
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // WhatsApp number and support email
  const whatsappNumber = process.env.WHATSAPP_NUMBER || '923001234567';
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@seyafashion.com';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Order Confirmed | Seya Fashion</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.colors.background};font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background-color:${BRAND.colors.white};">

<!-- HEADER -->
<div style="background:linear-gradient(135deg,${BRAND.colors.primary} 0%,#8b4513 100%);padding:40px 30px;text-align:center;">
<h1 style="color:${BRAND.colors.secondary};margin:0;font-size:32px;font-weight:300;letter-spacing:4px;">${BRAND.name}</h1>
<p style="color:#f0e8e0;margin:8px 0 0;font-size:13px;letter-spacing:2px;">${BRAND.tagline}</p>
</div>

<!-- SUCCESS BANNER -->
<div style="background-color:${BRAND.colors.successBg};padding:24px 30px;text-align:center;border-bottom:3px solid #22c55e;">
<div style="font-size:40px;margin-bottom:8px;">✅</div>
<h2 style="color:${BRAND.colors.success};margin:0;font-size:22px;">Order Confirmed!</h2>
<p style="color:#166534;margin:8px 0 0;font-size:14px;">Thank you for shopping with Seya Fashion. Your order has been received.</p>
</div>

<!-- ORDER INFO -->
<div style="padding:30px;background:${BRAND.colors.white};">
<table width="100%" style="border-collapse:collapse;margin-bottom:24px;">
<tr>
<td style="padding:8px 0;">
<span style="color:#888;font-size:13px;">Order ID</span><br/>
<strong style="color:${BRAND.colors.primary};font-size:18px;">${order.orderId}</strong>
</td>
<td style="padding:8px 0;text-align:right;">
<span style="color:#888;font-size:13px;">Order Date</span><br/>
<strong style="font-size:14px;">${orderDate}</strong>
</td>
</tr>
<tr>
<td style="padding:8px 0;">
<span style="color:#888;font-size:13px;">Payment Status</span><br/>
${paymentStatusBadge}
</td>
<td style="padding:8px 0;text-align:right;">
<span style="color:#888;font-size:13px;">Payment Method</span><br/>
<strong style="font-size:14px;text-transform:capitalize;">${order.paymentMethod}</strong>
</td>
</tr>
</table>

<!-- DIVIDER -->
<hr style="border:none;border-top:1px solid ${BRAND.colors.border};margin:0 0 24px;"/>

<!-- PRODUCTS TABLE -->
<h3 style="color:${BRAND.colors.primary};margin:0 0 16px;font-size:16px;text-transform:uppercase;letter-spacing:1px;">Items Ordered</h3>
<table width="100%" style="border-collapse:collapse;">
<thead>
<tr style="background-color:${BRAND.colors.background};">
<th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;">Product</th>
<th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;">Details</th>
<th style="padding:10px 12px;text-align:center;font-size:12px;color:#888;text-transform:uppercase;">Qty</th>
<th style="padding:10px 12px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;">Price</th>
</tr>
</thead>
<tbody>
${itemsHTML}
</tbody>
</table>

<!-- ORDER TOTALS -->
<div style="margin-top:20px;padding:20px;background:${BRAND.colors.background};border-radius:8px;">
<table width="100%" style="border-collapse:collapse;">
<tr>
<td style="padding:6px 0;color:#555;font-size:14px;">Subtotal</td>
<td style="padding:6px 0;text-align:right;font-size:14px;">PKR ${order.subtotalAmount.toLocaleString('en-PK')}</td>
</tr>
<tr>
<td style="padding:6px 0;color:#555;font-size:14px;">Tax (GST)</td>
<td style="padding:6px 0;text-align:right;font-size:14px;">PKR ${order.taxAmount.toLocaleString('en-PK')}</td>
</tr>
<tr>
<td style="padding:6px 0;color:#555;font-size:14px;">Shipping</td>
<td style="padding:6px 0;text-align:right;font-size:14px;">${shippingDisplay}</td>
</tr>
<tr>
<td colspan="2"><hr style="border:none;border-top:2px solid ${BRAND.colors.secondary};margin:10px 0;"/></td>
</tr>
<tr>
<td style="padding:6px 0;font-weight:700;font-size:16px;color:${BRAND.colors.primary};">Total Amount</td>
<td style="padding:6px 0;text-align:right;font-weight:700;font-size:18px;color:${BRAND.colors.primary};">PKR ${order.totalAmount.toLocaleString('en-PK')}</td>
</tr>
</table>
</div>

<!-- SHIPPING ADDRESS -->
<div style="margin-top:24px;">
<h3 style="color:${BRAND.colors.primary};margin:0 0 12px;font-size:16px;text-transform:uppercase;letter-spacing:1px;">Delivery Address</h3>
<div style="padding:16px;border:1px solid ${BRAND.colors.border};border-radius:8px;font-size:14px;color:#444;line-height:1.7;">
<strong>${order.shippingAddress.name}</strong><br/>
${order.shippingAddress.street}<br/>
${order.shippingAddress.city}${order.shippingAddress.state ? ', ' + order.shippingAddress.state : ''}<br/>
${order.shippingAddress.country}<br/>
📞 ${order.customerInfo.phone}
</div>
</div>

<!-- TRACK ORDER BUTTON -->
<div style="margin-top:32px;text-align:center;">
<a href="${clientUrl}/track-order?orderId=${order.orderId}&email=${encodeURIComponent(order.customerInfo.email)}"
style="display:inline-block;background:linear-gradient(135deg,${BRAND.colors.primary} 0%,#8b4513 100%);color:${BRAND.colors.secondary};text-decoration:none;padding:16px 40px;border-radius:4px;font-size:15px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">
🔍 Track Your Order
</a>
<p style="color:#888;font-size:12px;margin-top:10px;">Use Order ID: <strong>${order.orderId}</strong> and your email to track your order</p>
</div>

<!-- WHAT HAPPENS NEXT -->
<div style="margin-top:32px;padding:20px;background:#fef9f0;border-left:4px solid ${BRAND.colors.secondary};border-radius:4px;">
<h3 style="color:${BRAND.colors.primary};margin:0 0 12px;font-size:15px;">What Happens Next?</h3>
<div style="font-size:13px;color:#555;line-height:2;">
✅ <strong>Order Received</strong> — We have your order<br/>
📦 <strong>Processing</strong> — We prepare your items (1-2 days)<br/>
🚚 <strong>Shipped</strong> — Your order is on the way<br/>
🎉 <strong>Delivered</strong> — Enjoy your Seya Fashion purchase!
</div>
</div>

<!-- NEED HELP -->
<div style="margin-top:24px;padding:20px;border:1px solid ${BRAND.colors.border};border-radius:8px;text-align:center;">
<h3 style="color:${BRAND.colors.primary};margin:0 0 8px;font-size:15px;">Need Help?</h3>
<p style="color:#555;font-size:13px;margin:0 0 12px;">Our team is here to help you with any questions</p>
<a href="https://wa.me/${whatsappNumber}" style="color:#25d366;text-decoration:none;font-weight:600;font-size:13px;">💬 Chat on WhatsApp</a>
&nbsp;&nbsp;|&nbsp;&nbsp;
<a href="mailto:${supportEmail}" style="color:${BRAND.colors.primary};text-decoration:none;font-weight:600;font-size:13px;">✉️ Email Support</a>
</div>

</div>

<!-- FOOTER -->
<div style="background:${BRAND.colors.primary};padding:30px;text-align:center;">
<p style="color:${BRAND.colors.secondary};margin:0 0 8px;font-size:18px;font-weight:300;letter-spacing:3px;">${BRAND.name}</p>
<p style="color:#f0e8e0;margin:0 0 16px;font-size:12px;">${BRAND.tagline}</p>
<div style="margin-bottom:16px;">
<a href="${clientUrl}" style="color:${BRAND.colors.secondary};text-decoration:none;font-size:12px;margin:0 10px;">Shop Now</a>
<a href="${clientUrl}/track-order" style="color:${BRAND.colors.secondary};text-decoration:none;font-size:12px;margin:0 10px;">Track Order</a>
<a href="${clientUrl}/support" style="color:${BRAND.colors.secondary};text-decoration:none;font-size:12px;margin:0 10px;">Support</a>
</div>
<p style="color:#a07850;margin:0;font-size:11px;">© ${new Date().getFullYear()} Seya Fashion. All rights reserved.<br/>Rawalpindi, Pakistan</p>
<p style="color:#a07850;margin:8px 0 0;font-size:10px;">You received this email because you placed an order at Seya Fashion.<br/>This is an automated email, please do not reply.</p>
</div>

</div>
</body>
</html>`;
};

// Already exported above using exports.orderConfirmationTemplate
