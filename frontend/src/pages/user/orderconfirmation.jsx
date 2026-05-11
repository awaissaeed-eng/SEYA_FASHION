import { motion } from 'framer-motion';
import { CheckCircle, Download, Mail, ArrowRight, FileText } from 'lucide-react';
import UserLayout from '../../components/user/UserLayout';
import CustomSizeDisplay from '../../components/user/CustomSizeDisplay';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUrl';
import AddressDisplay from '../../components/AddressDisplay';
import jsPDF from 'jspdf';

export default function OrderConfirmation() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    if (location.state && location.state.order) {
      console.log('Order data received:', location.state.order);
      setOrder(location.state.order);
      setLoading(false);
    } else {
      console.warn('No order data in location.state');
      setLoading(false);
    }
  }, [location.state]);

  const downloadInvoice = () => {
    if (!order) return;

    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Colors (RGB values for jsPDF)
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
    
    // Invoice Title
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(20);
    doc.text('INVOICE', pageWidth / 2, 32, { align: 'center' });
    
    // Order ID
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order #${order.orderId || order._id}`, pageWidth / 2, 40, { align: 'center' });
    
    let yPosition = 60;
    
    // Invoice Details Section (Left Column)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Invoice Details', 20, yPosition);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition += 10;
    doc.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Order ID: ${order.orderId || order._id}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Payment Method: ${order.paymentMethod || 'Card'}`, 20, yPosition);
    
    // Customer Information (Right Column)
    yPosition = 60;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To', pageWidth - 90, yPosition);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition += 10;
    const customerName = `${order.customerInfo?.firstName || order.user?.firstName || ''} ${order.customerInfo?.lastName || order.user?.lastName || ''}`.trim();
    doc.text(customerName, pageWidth - 90, yPosition);
    yPosition += 6;
    doc.text(order.customerInfo?.email || order.user?.email || '', pageWidth - 90, yPosition);
    yPosition += 6;
    doc.text(order.customerInfo?.phone || order.user?.phone || '', pageWidth - 90, yPosition);
    
    // Shipping Address
    yPosition += 12;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Ship To', pageWidth - 90, yPosition);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition += 10;
    doc.text(order.shippingAddress?.name || '', pageWidth - 90, yPosition);
    yPosition += 6;
    doc.text(order.shippingAddress?.street || '', pageWidth - 90, yPosition);
    yPosition += 6;
    doc.text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}`, pageWidth - 90, yPosition);
    yPosition += 6;
    doc.text(`${order.shippingAddress?.zipCode || ''} ${order.shippingAddress?.country || ''}`, pageWidth - 90, yPosition);
    
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
    doc.text('Item', 25, yPosition - 2);
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
    order.products?.forEach((item, index) => {
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
      
      // Display size - show "Custom Size" for custom size items
      const sizeDisplay = (item.isCustomSize || item.customSize?.isCustom) ? 'Custom Size' : (item.size || 'Standard');
      doc.text(sizeDisplay, 100, yPosition);
      
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
    doc.text('Thank you for choosing SEYA Fashion.', pageWidth / 2, footerY - 5, { align: 'center' });
    doc.text('Your style matters to us, and we look forward to serving you again.', pageWidth / 2, footerY + 3, { align: 'center' });
    
    // Save the PDF
    doc.save(`SEYA_Fashion_Invoice_${order.orderId || order._id}.pdf`);
  };

  return (
    <UserLayout>
      <div className="py-12">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#bfa77b]"></div>
              <p className="mt-4 text-[#592a0d]">Loading order details...</p>
            </div>
          ) : !order ? (
            <div className="text-center py-20">
              <h2 className="text-[#bfa77b] mb-4">Order Not Found</h2>
              <p className="text-[#592a0d] mb-8">We couldn't find your order details.</p>
              <button
                onClick={() => window.location.href = '/shop'}
                className="bg-[#592a0d] text-[#bfa77b] px-8 py-3 rounded-full hover:glow-gold-hover transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
            >
              <CheckCircle className="w-16 h-16 text-green-600" />
            </motion.div>
            <h1 className="text-[#bfa77b] mb-4">Order Confirmed!</h1>
            <p className="text-[#592a0d] text-lg mb-2">
              Thank you for your purchase from SEYA Fashion
            </p>
            <p className="text-[#592a0d]/70">Order #{order?.orderId || order?._id}</p>
          </motion.div>

          {/* Confirmation Email Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 flex items-start gap-4"
          >
            <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-[#592a0d] mb-2">Confirmation Email Sent</h4>
              <p className="text-[#592a0d]/70 text-sm">
                We've sent a confirmation email to <strong>{order?.customerInfo?.email || order?.user?.email}</strong> with your order details and tracking information.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h3 className="text-[#bfa77b] mb-6">Order Items</h3>
                <div className="space-y-4">
                  {order?.products?.map((item, index) => {
                    // Use product snapshot data (preserves info even if product is deleted)
                    const productData = item.productSnapshot || item.product || {};
                    
                    // Get product image from snapshot
                    let productImg = null;
                    if (productData.images && productData.images.length > 0) {
                      productImg = getImageUrl(productData.images[0]);
                    }
                    
                    const productName = productData.name || 'Product';
                    const isCustomSize = item.isCustomSize || item.customSize?.isCustom;
                    // Always show "Custom Size" for custom size items, regardless of what's in the size field
                    const productSize = isCustomSize ? 'Custom Size' : (item.size || 'Standard');
                    const productQty = item.quantity;
                    const productPrice = item.price;
                    const isDeleted = !item.productExists;
                    
                    return (
                      <div key={index} className="flex gap-4 pb-4 border-b border-[#e7dcc8] last:border-0">
                        <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[#f5f1e8] flex items-center justify-center relative">
                          {productImg ? (
                            <img
                              src={productImg}
                              alt={productName}
                              className={`w-full h-full object-cover ${isDeleted ? 'opacity-60' : ''}`}
                              onError={(e) => { 
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<span class="text-[#bfa77b] text-xs text-center">No Image</span>';
                              }}
                            />
                          ) : (
                            <span className="text-[#bfa77b] text-xs text-center">No Image</span>
                          )}
                          {isDeleted && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <span className="text-white text-xs bg-red-500 px-1 py-0.5 rounded">Discontinued</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-[#592a0d] ${isDeleted ? 'opacity-70' : ''}`}>{productName}</h4>
                            {isDeleted && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                Product Discontinued
                              </span>
                            )}
                          </div>
                          <p className="text-[#592a0d]/60 text-sm mb-2">
                            Size: {productSize} | Qty: {productQty}
                          </p>
                          
                          {/* Custom Size Details */}
                          {isCustomSize && item.customSize && (
                            <div className="mb-2">
                              <CustomSizeDisplay customSize={item.customSize} compact={false} />
                              
                              {/* Enhanced file display for user order confirmation */}
                              {item.customSize?.measurementFiles && item.customSize.measurementFiles.length > 0 && (
                                <div className="mt-2 p-2 bg-[#faf8f5] rounded border border-[#e8dfd3]">
                                  <p className="text-xs font-medium text-[#592a0d] mb-2">
                                    📎 Your uploaded files ({item.customSize.measurementFiles.length})
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {item.customSize.measurementFiles.map((file, fileIdx) => (
                                      <div key={fileIdx} className="flex items-center gap-2 bg-white p-1 rounded border text-xs">
                                        {file.fileType === 'image' ? (
                                          <div className="w-8 h-8 rounded overflow-hidden">
                                            <img
                                              src={file.url}
                                              alt={file.originalName}
                                              className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                                              onClick={() => window.open(file.url, '_blank')}
                                              title="Click to view"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-red-600" />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="truncate text-[#592a0d] font-medium">
                                            {file.originalName?.split('.')[0] || 'File'}
                                          </p>
                                          <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#bfa77b] hover:text-[#592a0d] underline"
                                          >
                                            View
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <p className="text-[#bfa77b]">
                            Rs. {(productPrice * productQty).toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h3 className="text-[#bfa77b] mb-6">Shipping Address</h3>
                <AddressDisplay 
                  order={order} 
                  type="shipping" 
                  showContact={true}
                />
              </motion.div>
            </div>

            {/* Right Column - Summary & Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* Order Summary */}
              <div className="bg-white rounded-2xl p-8 shadow-lg sticky top-24">
                <h3 className="text-[#bfa77b] mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-[#592a0d]">
                    <span>Subtotal</span>
                    <span>Rs. {order?.subtotalAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 }) || order?.products?.reduce((sum, item) => sum + item.price * item.quantity, 0)?.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-[#592a0d]">
                    <span>Shipping</span>
                    <span>Rs. {order?.shippingAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 }) || '0'}</span>
                  </div>
                  {order?.taxAmount > 0 && (
                    <div className="flex justify-between text-[#592a0d]">
                      <span>GST</span>
                      <span>Rs. {order?.taxAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</span>
                    </div>
                  )}
                  <div className="border-t border-[#e7dcc8] pt-4">
                    <div className="flex justify-between">
                      <span className="text-[#592a0d]">Total Paid</span>
                      <span className="text-[#bfa77b]">Rs. {order?.totalAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={downloadInvoice}
                    className="w-full bg-[#592a0d] text-[#bfa77b] py-3 rounded-full hover:glow-gold-hover transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Invoice
                  </button>
                  <button
                    onClick={() => window.location.href = '/shop'}
                    className="w-full bg-[#f5f1e8] text-[#592a0d] py-3 rounded-full hover:bg-[#e7dcc8] transition-all flex items-center justify-center gap-2"
                  >
                    Continue Shopping
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Customer Support */}
                <div className="mt-6 pt-6 border-t border-[#e7dfd3]">
                  <div className="text-center">
                    
                    <button
                      onClick={() => window.location.href = '/support'}
                      className="text-[#bfa77b] hover:text-[#592a0d] transition-colors text-sm"
                    >
                      Need Help? Contact Customer Support →
                    </button>
                  </div>
                </div>
              </div>

              
              {/* What's Next */}
              {/*
              <div className="bg-[#bfa77b]/10 rounded-2xl p-6">
                <h4 className="text-[#592a0d] mb-4">What's Next?</h4>
                <ul className="space-y-3 text-[#592a0d] text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-[#bfa77b] flex-shrink-0">✓</span>
                    <span>You'll receive an email when your order ships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#bfa77b] flex-shrink-0">✓</span>
                    <span>Your order will be processed within 1-2 business days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#bfa77b] flex-shrink-0">✓</span>
                    <span>Contact us if you have any questions</span>
                  </li>
                </ul>
              </div>
              */}
            </motion.div>
          </div>
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
