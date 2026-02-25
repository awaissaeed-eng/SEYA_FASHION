// Lazy-loaded PDF generation utility
import { formatShippingInfo } from './addressFormatter';
import { TIMING } from '../config/constants';

// Lazy load jsPDF only when needed
const loadJsPDF = async () => {
  const { default: jsPDF } = await import('jspdf');
  return jsPDF;
};

export const generateOrderHTML = (order) => {
  const customerInfo = formatShippingInfo(order);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Order ${order.orderId || order._id} - SEYA Fashion</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Arial', sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background: white;
          padding: 20px;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 3px solid #592a0d; 
          padding-bottom: 20px; 
        }
        .company-name { 
          font-size: 32px; 
          font-weight: bold; 
          color: #592a0d; 
          margin-bottom: 8px; 
          letter-spacing: 2px;
        }
        .document-title { 
          font-size: 24px; 
          color: #bfa77b; 
          margin-bottom: 10px; 
        }
        .order-id { 
          font-size: 16px; 
          color: #592a0d; 
          font-weight: 600;
        }
        .content { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px; 
          gap: 40px;
        }
        .left-column, .right-column { 
          flex: 1; 
        }
        .section-title { 
          font-size: 18px; 
          font-weight: bold; 
          color: #592a0d; 
          margin-bottom: 15px; 
          border-bottom: 2px solid #bfa77b; 
          padding-bottom: 5px; 
        }
        .info-row { 
          margin-bottom: 8px; 
          display: flex;
        }
        .info-label { 
          font-weight: 600; 
          color: #592a0d; 
          min-width: 120px;
        }
        .info-value { 
          color: #333; 
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 30px 0; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .items-table th { 
          background: #592a0d; 
          color: white; 
          padding: 15px 12px; 
          text-align: left; 
          font-weight: 600;
          border-bottom: 2px solid #3d1c09;
        }
        .items-table td { 
          padding: 12px; 
          border-bottom: 1px solid #e0e0e0; 
        }
        .items-table tr:nth-child(even) { 
          background-color: #f9f9f9; 
        }
        .items-table tr:hover { 
          background-color: #f5f1e8; 
        }
        .totals-section { 
          margin-top: 30px; 
          display: flex; 
          justify-content: flex-end; 
        }
        .totals-box { 
          background: #f5f1e8; 
          border: 2px solid #bfa77b; 
          border-radius: 8px; 
          padding: 20px; 
          min-width: 300px;
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 8px; 
          padding: 5px 0;
        }
        .total-row.final { 
          border-top: 2px solid #592a0d; 
          margin-top: 10px; 
          padding-top: 10px; 
          font-weight: bold; 
          font-size: 18px; 
          color: #592a0d; 
        }
        .footer { 
          margin-top: 40px; 
          text-align: center; 
          padding-top: 20px; 
          border-top: 2px solid #bfa77b; 
          color: #666; 
        }
        .discontinued { 
          color: #dc2626; 
          font-style: italic; 
          font-size: 12px;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">SEYA FASHION</div>
        <div class="document-title">ORDER SUMMARY</div>
        <div class="order-id">Order #${order.orderId || order._id}</div>
      </div>

      <div class="content">
        <div class="left-column">
          <div class="section-title">Order Information</div>
          <div class="info-row">
            <span class="info-label">Order Date:</span>
            <span class="info-value">${new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Order ID:</span>
            <span class="info-value">${order.orderId || order._id}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span class="info-value">${order.paymentMethod || 'Card'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Order Status:</span>
            <span class="info-value" style="color: #592a0d; font-weight: 600;">${order.status || 'Processing'}</span>
          </div>
        </div>
        
        <div class="right-column">
          <div class="section-title">Customer Information</div>
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${customerInfo.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${order.customerInfo?.email || order.user?.email || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone:</span>
            <span class="info-value">${customerInfo.contact}</span>
          </div>
          <div style="margin-top: 20px;">
            <div class="section-title">Shipping Address</div>
            <div class="info-value">
              ${customerInfo.address.line1}<br>
              ${customerInfo.address.line2}
            </div>
          </div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Size</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.products?.map(item => {
            const productData = item.productSnapshot || item.product || {};
            const productName = productData.name || 'Product';
            const isDeleted = !item.productExists;
            const itemTotal = item.price * item.quantity;
            const sizeText = (item.isCustomSize || item.customSize?.isCustom) ? 'Custom Size' : (item.size || 'Standard');
            
            return `
              <tr>
                <td>
                  ${productName}
                  ${isDeleted ? '<br><span class="discontinued">(Product Discontinued)</span>' : ''}
                </td>
                <td>${sizeText}</td>
                <td>${item.quantity}</td>
                <td>Rs. ${item.price.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</td>
                <td>Rs. ${itemTotal.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</td>
              </tr>
            `;
          }).join('') || '<tr><td colspan="5">No items found</td></tr>'}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="totals-box">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>Rs. ${order.subtotalAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 }) || '0'}</span>
          </div>
          <div class="total-row">
            <span>Shipping:</span>
            <span>Rs. ${order.shippingAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 }) || '0'}</span>
          </div>
          ${order.taxAmount > 0 ? `
          <div class="total-row">
            <span>GST:</span>
            <span>Rs. ${order.taxAmount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</span>
          </div>
          ` : ''}
          <div class="total-row final">
            <span>Total Amount:</span>
            <span>Rs. ${order.totalAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 }) || '0'}</span>
          </div>
        </div>
      </div>

      <div class="footer">
        <p><strong>Thank you for choosing SEYA Fashion!</strong></p>
        <p>Your style matters to us, and we look forward to serving you again.</p>
      </div>
    </body>
    </html>
  `;
};

export const handlePrint = (order) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(generateOrderHTML(order));
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, TIMING.PRINT_DELAY);
  }
};

export const handleDownloadPDF = async (order) => {
  if (!order) return;

  // Lazy load jsPDF
  const jsPDF = await loadJsPDF();
  
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Colors
  const primaryColor = [89, 42, 13]; // #592a0d
  const secondaryColor = [191, 167, 123]; // #bfa77b
  const lightColor = [245, 241, 232]; // #f5f1e8
  
  // Header background
  doc.setFillColor(...lightColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Company Name
  doc.setTextColor(...primaryColor);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('SEYA FASHION', pageWidth / 2, 20, { align: 'center' });
  
  // Document Title
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(20);
  doc.text('ORDER SUMMARY', pageWidth / 2, 32, { align: 'center' });
  
  // Order ID
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order #${order.orderId || order._id}`, pageWidth / 2, 40, { align: 'center' });
  
  let yPosition = 60;
  
  // Order Information (Left Column)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Order Information', 20, yPosition);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition += 10;
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Order ID: ${order.orderId || order._id}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Payment Method: ${order.paymentMethod || 'Card'}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Status: ${order.status || 'Processing'}`, 20, yPosition);
  
  // Customer Information (Right Column)
  const customerInfo = formatShippingInfo(order);
  yPosition = 60;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information', pageWidth - 90, yPosition);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition += 10;
  doc.text(`Name: ${customerInfo.name}`, pageWidth - 90, yPosition);
  yPosition += 6;
  // Get customer email with proper priority
  const customerEmail = order.customerInfo?.email || order.user?.email || 'N/A';
  doc.text(`Email: ${customerEmail}`, pageWidth - 90, yPosition);
  yPosition += 6;
  doc.text(`Phone: ${customerInfo.contact}`, pageWidth - 90, yPosition);
  
  // Shipping Address
  yPosition += 12;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Shipping Address', pageWidth - 90, yPosition);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition += 10;
  doc.text(customerInfo.address.line1, pageWidth - 90, yPosition);
  yPosition += 6;
  doc.text(customerInfo.address.line2, pageWidth - 90, yPosition);
  
  // Items Section
  yPosition = 130;
  
  // Items Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Order Items', 20, yPosition);
  yPosition += 15;
  
  // Table Header
  doc.setFillColor(...primaryColor);
  doc.rect(20, yPosition - 8, pageWidth - 40, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Product', 25, yPosition - 2);
  doc.text('Size', 100, yPosition - 2);
  doc.text('Qty', 125, yPosition - 2);
  doc.text('Unit Price', 145, yPosition - 2);
  doc.text('Total', 175, yPosition - 2);
  
  yPosition += 8;
  
  // Table Rows
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  let rowColor = true;
  order.products?.forEach((item) => {
    const productData = item.productSnapshot || item.product || {};
    const productName = productData.name || 'Product';
    const isDeleted = !item.productExists;
    const itemTotal = item.price * item.quantity;
    
    // Alternate row colors
    if (rowColor) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, yPosition - 6, pageWidth - 40, 10, 'F');
    }
    rowColor = !rowColor;
    
    // Item details
    let displayName = productName;
    if (displayName.length > 20) {
      displayName = displayName.substring(0, 17) + '...';
    }
    if (isDeleted) {
      displayName += ' (Disc.)';
    }
    
    doc.text(displayName, 25, yPosition);
    
    // Size display - show "Custom" for custom size items
    const sizeText = (item.isCustomSize || item.customSize?.isCustom) ? 'Custom' : (item.size || 'Standard');
    doc.text(sizeText, 100, yPosition);
    
    doc.text(item.quantity.toString(), 125, yPosition);
    doc.text(`Rs. ${item.price.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`, 145, yPosition);
    doc.text(`Rs. ${itemTotal.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`, 175, yPosition);
    
    yPosition += 12;
  });
  
  // Totals Section
  yPosition += 10;
  const totalsX = pageWidth - 100;
  
  // Totals box
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.rect(totalsX - 10, yPosition - 10, 90, 60);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...primaryColor);
  
  // Subtotal
  doc.text('Subtotal:', totalsX - 5, yPosition);
  doc.text(`Rs. ${order.subtotalAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 }) || '0'}`, totalsX + 65, yPosition, { align: 'right' });
  yPosition += 10;
  
  // Shipping
  doc.text('Shipping:', totalsX - 5, yPosition);
  doc.text(`Rs. ${order.shippingAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 }) || '0'}`, totalsX + 65, yPosition, { align: 'right' });
  yPosition += 10;
  
  // GST (if applicable)
  if (order.taxAmount > 0) {
    doc.text('GST:', totalsX - 5, yPosition);
    doc.text(`Rs. ${order.taxAmount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`, totalsX + 65, yPosition, { align: 'right' });
    yPosition += 10;
  }
  
  // Total line
  doc.setDrawColor(...primaryColor);
  doc.line(totalsX - 5, yPosition - 2, totalsX + 65, yPosition - 2);
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Total:', totalsX - 5, yPosition + 5);
  doc.text(`Rs. ${order.totalAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 }) || '0'}`, totalsX + 65, yPosition + 5, { align: 'right' });
  
  // Footer
  const footerY = pageHeight - 40;
  doc.setDrawColor(...secondaryColor);
  doc.line(20, footerY - 15, pageWidth - 20, footerY - 15);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...primaryColor);
  doc.text('Thank you for choosing SEYA Fashion!', pageWidth / 2, footerY - 5, { align: 'center' });
  doc.text('Your style matters to us, and we look forward to serving you again.', pageWidth / 2, footerY + 3, { align: 'center' });
  
  // Save the PDF
  doc.save(`SEYA_Fashion_Order_${order.orderId || order._id}.pdf`);
};

export default {
  generateOrderHTML,
  handlePrint,
  handleDownloadPDF,
};