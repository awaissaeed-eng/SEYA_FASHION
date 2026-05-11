import { X, Download, Printer, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import InlineStatusDropdown from './InlineStatusDropdown';
import CustomSizeDisplay from '../user/CustomSizeDisplay';
import { formatShippingInfo } from '../../utils/addressFormatter';
import { getStatusInfo } from '../../utils/orderStatusDisplay';
import { getPaymentStatusInfo, getPaymentMethodInfo, formatPaymentDate, getPaymentGatewayInfo } from '../../utils/paymentStatusRules';
import { tw } from '../../config/theme';
import { orderService } from '../../services/order';

const OrderDetailsModal = ({
  order,
  onClose,
  onDownloadPDF,
  onPrintOrder,
  onStatusChange
}) => {
  const [showGatewayResponse, setShowGatewayResponse] = useState(false);
  const [validNextStatuses, setValidNextStatuses] = useState([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  
  if (!order) return null;

  // Fetch valid next statuses when order changes
  useEffect(() => {
    const fetchValidStatuses = async () => {
      if (!order || !order._id) return;
      
      setLoadingStatuses(true);
      try {
        const response = await orderService.getValidNextStatuses(order._id);
        setValidNextStatuses(response.data.validNextStatuses || []);
      } catch (error) {
        console.error('Failed to fetch valid statuses:', error);
        setValidNextStatuses([]);
      } finally {
        setLoadingStatuses(false);
      }
    };

    fetchValidStatuses();
  }, [order?._id, order?.status]);

  const shippingInfo = formatShippingInfo(order);
  const paymentMethodInfo = getPaymentMethodInfo(order.paymentMethod, order.paymentInfo);
  const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus || 'pending');
  const paymentGatewayInfo = getPaymentGatewayInfo(order.paymentGateway || 'Meezan Bank');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className={`${tw.card} max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto`}>
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#e8dfd3] flex items-center justify-between">
          <div>
            <h2 className={`text-lg sm:text-2xl font-bold ${tw.primaryText}`} style={{ fontFamily: 'Playfair Display, serif' }}>
              Order Details {order.orderId || order._id}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Complete order information and actions</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Order Info Grid - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <OrderInfoCard title="Customer & Shipping" shippingInfo={shippingInfo} order={order} />
            <OrderInfoCard 
              title="Order Date & Time" 
              content={order.createdAt ? new Date(order.createdAt).toLocaleString('en-PK', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) : ''} 
            />
            <OrderBreakdownCard order={order} />
            <OrderItemsCard order={order} />
          </div>

          {/* Payment Details Section */}
          <PaymentDetailsCard 
            order={order} 
            paymentMethodInfo={paymentMethodInfo}
            paymentStatusInfo={paymentStatusInfo}
            paymentGatewayInfo={paymentGatewayInfo}
            showGatewayResponse={showGatewayResponse}
            setShowGatewayResponse={setShowGatewayResponse}
          />

          {/* Status Management */}
          <div className="space-y-3">
            <label className={`block text-sm font-medium ${tw.primaryText}`}>Order Status</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              {loadingStatuses ? (
                <div className="flex items-center gap-2 px-3 py-1">
                  <div className="w-4 h-4 border border-[#592a0d] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">Loading statuses...</span>
                </div>
              ) : (
                <InlineStatusDropdown
                  currentStatus={order.status}
                  orderId={order._id}
                  validNextStatuses={validNextStatuses}
                  onStatusChange={onStatusChange}
                />
              )}
              <div className="text-xs sm:text-sm text-gray-600">
                {getStatusInfo(order.status).description}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => onDownloadPDF(order)}
              className={`flex-1 px-4 py-2 border border-[#bfa77b] ${tw.primaryText} rounded-md hover:bg-[#bfa77b]/10 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base`}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={() => onPrintOrder(order)}
              className={`flex-1 px-4 py-2 border border-[#bfa77b] ${tw.primaryText} rounded-md hover:bg-[#bfa77b]/10 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base`}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Order</span>
              <span className="sm:hidden">Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderInfoCard = ({ title, shippingInfo, order, content }) => (
  <div className="p-3 sm:p-4 rounded-lg bg-[#faf8f5] border border-[#e8dfd3]">
    <p className="text-xs sm:text-sm text-gray-600">{title}</p>
    <div className="mt-2 space-y-2">
      {shippingInfo ? (
        <>
          <p className={`font-semibold text-sm sm:text-base ${tw.primaryText}`}>{shippingInfo.name}</p>
          <div className={`text-xs sm:text-sm ${tw.primaryText} space-y-1`}>
            <p>{shippingInfo.address.line1}</p>
            <p>{shippingInfo.address.line2}</p>
          </div>
          <p className={`text-xs sm:text-sm ${tw.primaryText} pt-1 border-t border-[#e8dfd3]`}>
            {shippingInfo.contact}
          </p>
          {order.customerInfo?.email && 
           order.customerInfo.email !== shippingInfo.contact && (
            <p className={`text-xs sm:text-sm ${tw.primaryText}`}>
              {order.customerInfo.email}
            </p>
          )}
        </>
      ) : (
        <p className={`mt-1 font-semibold text-sm sm:text-base ${tw.primaryText}`}>{content}</p>
      )}
    </div>
  </div>
);

const OrderBreakdownCard = ({ order }) => (
  <div className="p-3 sm:p-4 rounded-lg bg-[#faf8f5] border border-[#e8dfd3]">
    <p className="text-xs sm:text-sm text-gray-600">Order Breakdown</p>
    <div className="mt-2 space-y-1 text-xs sm:text-sm">
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span>Rs. {order.subtotalAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 }) || 'N/A'}</span>
      </div>
      {order.taxAmount > 0 && (
        <div className="flex justify-between">
          <span>GST:</span>
          <span>Rs. {order.taxAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Shipping:</span>
        <span>Rs. {order.shippingAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 }) || '0'}</span>
      </div>
      <div className="flex justify-between font-semibold border-t pt-1">
        <span>Total:</span>
        <span>Rs. {order.totalAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</span>
      </div>
    </div>
  </div>
);

const OrderItemsCard = ({ order }) => (
  <div className="p-3 sm:p-4 rounded-lg bg-[#faf8f5] border border-[#e8dfd3]">
    <p className="text-xs sm:text-sm text-gray-600 mb-3">Items ({order.products?.length})</p>
    <div className="space-y-3">
      {order.products?.map((item, idx) => {
        const productData = item.productSnapshot || item.product || {};
        const productName = productData.name || 
                          item.product?.name || 
                          item.name || 
                          'Unknown Product';
        const isDeleted = !item.productExists;
        
        return (
          <div key={idx} className={isDeleted ? 'opacity-70' : ''}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <span className={`font-medium text-sm sm:text-base ${tw.primaryText}`}>{productName}</span>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">
                  {(item.isCustomSize || item.customSize?.isCustom) ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`${tw.secondaryText} font-medium text-xs sm:text-sm`}>Custom Size</span>
                        <span className="text-xs sm:text-sm">| Qty: {item.quantity}</span>
                      </div>
                      <CustomSizeDisplay customSize={item.customSize} />
                      
                      {/* Enhanced file display for admin - Mobile Responsive */}
                      {item.customSize?.measurementFiles && item.customSize.measurementFiles.length > 0 && (
                        <div className="mt-3 p-2 sm:p-3 bg-white rounded-lg border border-[#e8dfd3]">
                          <h5 className={`text-xs sm:text-sm font-semibold ${tw.primaryText} mb-2 flex items-center gap-2`}>
                            📎 Customer Uploaded Files ({item.customSize.measurementFiles.length})
                          </h5>
                          <div className="grid grid-cols-1 gap-2 sm:gap-3">
                            {item.customSize.measurementFiles.map((file, fileIdx) => (
                              <div key={fileIdx} className="flex items-center gap-2 sm:gap-3 p-2 bg-[#faf8f5] rounded border">
                                {file.fileType === 'image' ? (
                                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden flex-shrink-0 border">
                                    <img
                                      src={file.url}
                                      alt={file.originalName}
                                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => window.open(file.url, '_blank')}
                                      title="Click to view full image"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded flex items-center justify-center flex-shrink-0 border">
                                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs sm:text-sm font-medium ${tw.primaryText} truncate`}>
                                    {file.originalName || file.filename}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {file.fileType === 'image' ? 'Image' : 'PDF'} • {new Date(file.uploadedAt).toLocaleDateString()}
                                  </p>
                                  <div className="flex gap-1 sm:gap-2 mt-1">
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`text-xs ${tw.primaryBg} text-white px-2 py-1 rounded hover:bg-[#6d3a18] transition-colors`}
                                    >
                                      View
                                    </a>
                                    <a
                                      href={file.url}
                                      download={file.originalName}
                                      className={`text-xs ${tw.secondaryBg} ${tw.primaryText} px-2 py-1 rounded hover:bg-[#d4a574] transition-colors`}
                                    >
                                      Download
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs sm:text-sm">Size: {item.size || 'Standard'} | Qty: {item.quantity}</span>
                  )}
                  {isDeleted && <span className="text-red-500 text-xs ml-2">(Discontinued)</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const PaymentDetailsCard = ({ 
  order, 
  paymentMethodInfo, 
  paymentStatusInfo, 
  paymentGatewayInfo,
  showGatewayResponse,
  setShowGatewayResponse 
}) => (
  <div className="p-4 sm:p-6 rounded-lg bg-[#faf8f5] border border-[#e8dfd3]">
    <h3 className={`text-lg sm:text-xl font-semibold ${tw.primaryText} mb-4 flex items-center gap-2`}>
      💳 Payment Details
    </h3>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {/* Payment Method */}
      <div>
        <label className="text-xs sm:text-sm text-gray-600 font-medium">Payment Method</label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg">{paymentMethodInfo.icon}</span>
          <div>
            <div className={`font-semibold text-sm sm:text-base ${tw.primaryText}`}>{paymentMethodInfo.label}</div>
            <div className="text-xs sm:text-sm text-gray-500">{paymentMethodInfo.details}</div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div>
        <label className="text-xs sm:text-sm text-gray-600 font-medium">Payment Status</label>
        <div className="mt-1">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${paymentStatusInfo.color}`}>
            <span>{paymentStatusInfo.icon}</span>
            {paymentStatusInfo.label}
          </span>
          <p className="text-xs text-gray-500 mt-1">{paymentStatusInfo.description}</p>
        </div>
      </div>

      {/* Payment Gateway */}
      <div>
        <label className="text-xs sm:text-sm text-gray-600 font-medium">Payment Gateway</label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg">{paymentGatewayInfo.icon}</span>
          <span className={`font-medium text-sm sm:text-base ${tw.primaryText}`}>{paymentGatewayInfo.label}</span>
        </div>
      </div>

      {/* Transaction ID */}
      <div>
        <label className="text-xs sm:text-sm text-gray-600 font-medium">Transaction ID</label>
        <div className="mt-1">
          <span className={`font-mono text-sm sm:text-base ${tw.primaryText} bg-white px-2 py-1 rounded border`}>
            {order.transactionId || 'Not generated'}
          </span>
        </div>
      </div>

      {/* Amount Paid */}
      <div>
        <label className="text-xs sm:text-sm text-gray-600 font-medium">Amount Paid</label>
        <div className="mt-1">
          <span className={`font-bold text-lg ${tw.primaryText}`}>
            Rs. {order.totalAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Payment Date */}
      <div>
        <label className="text-xs sm:text-sm text-gray-600 font-medium">Payment Date & Time</label>
        <div className="mt-1">
          <span className={`text-sm sm:text-base ${tw.primaryText}`}>
            {formatPaymentDate(order.paymentDate)}
          </span>
        </div>
      </div>
    </div>

    {/* Gateway Response (Admin Only - Collapsible) */}
    {order.gatewayResponse && (
      <div className="mt-4 sm:mt-6 border-t border-[#e8dfd3] pt-4">
        <button
          onClick={() => setShowGatewayResponse(!showGatewayResponse)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          {showGatewayResponse ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Gateway Response (Debug Info)
        </button>
        
        {showGatewayResponse && (
          <div className="mt-2 p-3 bg-gray-100 rounded-lg border">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
              {order.gatewayResponse || 'No gateway response available'}
            </pre>
          </div>
        )}
      </div>
    )}
  </div>
);

export default OrderDetailsModal;