import { Eye, Printer, Download, Package, User, Calendar, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import InlineStatusDropdown from './InlineStatusDropdown';
import { getPaymentStatusInfo, getPaymentMethodInfo } from '../../utils/paymentStatusRules';
import { tw } from '../../config/theme';
import { orderService } from '../../services/order';

// Wrapper component to fetch valid statuses for each order
const StatusDropdownWithFetch = ({ currentStatus, orderId, onStatusChange }) => {
  const [validNextStatuses, setValidNextStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValidStatuses = async () => {
      if (!orderId) return;
      
      setLoading(true);
      try {
        const response = await orderService.getValidNextStatuses(orderId);
        setValidNextStatuses(response.data.validNextStatuses || []);
      } catch (error) {
        console.error('Failed to fetch valid statuses:', error);
        setValidNextStatuses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchValidStatuses();
  }, [orderId, currentStatus]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1">
        <div className="w-3 h-3 border border-[#592a0d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <InlineStatusDropdown
      currentStatus={currentStatus}
      orderId={orderId}
      validNextStatuses={validNextStatuses}
      onStatusChange={onStatusChange}
    />
  );
};

const OrdersTable = ({ 
  orders, 
  onViewOrder, 
  onDownloadPDF, 
  onPrintOrder, 
  onStatusChange 
}) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No orders found
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#d1d1d1] border-b border-[#e8dfd3]">
              <th className={`px-6 py-3 text-left text-sm font-semibold ${tw.primaryText}`}>Order ID</th>
              <th className={`px-6 py-3 text-left text-sm font-semibold ${tw.primaryText}`}>Customer</th>
              <th className={`px-6 py-3 text-left text-sm font-semibold ${tw.primaryText}`}>Items</th>
              <th className={`px-6 py-3 text-left text-sm font-semibold ${tw.primaryText}`}>Total</th>
              <th className={`px-6 py-3 text-left text-sm font-semibold ${tw.primaryText}`}>Payment Method</th>
              <th className={`px-6 py-3 text-left text-sm font-semibold ${tw.primaryText}`}>Payment Status</th>
              <th className={`px-6 py-3 text-left text-sm font-semibold ${tw.primaryText}`}>Order Status</th>
              <th className={`px-6 py-3 text-left text-sm font-semibold ${tw.primaryText}`}>Date</th>
              <th className={`px-6 py-3 text-right text-sm font-semibold ${tw.primaryText}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                onViewOrder={onViewOrder}
                onDownloadPDF={onDownloadPDF}
                onPrintOrder={onPrintOrder}
                onStatusChange={onStatusChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Hidden on desktop */}
      <div className="lg:hidden space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            onViewOrder={onViewOrder}
            onDownloadPDF={onDownloadPDF}
            onPrintOrder={onPrintOrder}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </>
  );
};

const OrderRow = ({ 
  order, 
  onViewOrder, 
  onDownloadPDF, 
  onPrintOrder, 
  onStatusChange 
}) => {
  const paymentMethodInfo = getPaymentMethodInfo(order.paymentMethod, order.paymentInfo);
  const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus || 'pending');

  return (
    <tr className="border-b border-[#e8dfd3] hover:bg-[#faf8f5] transition-colors">
      <td className={`px-6 py-4 text-sm ${tw.primaryText}`}>
        {order.orderId || order._id}
      </td>
      
      <td className={`px-6 py-4 text-sm ${tw.primaryText}`}>
        {order.customerInfo?.firstName || order.user?.firstName} {order.customerInfo?.lastName || order.user?.lastName}
        <br />
        {order.customerInfo?.email || order.user?.email}
        <br />
        {order.customerInfo?.phone || order.user?.phone}
      </td>
      
      <td className="px-6 py-4 text-sm text-gray-600">
        {order.products?.map((item, idx) => {
          const productData = item.productSnapshot || item.product || {};
          const productName = productData.name || 
                            item.product?.name || 
                            item.name || 
                            'Unknown Product';
          const isDeleted = !item.productExists;
          
          return (
            <div key={idx} className={`mb-2 ${isDeleted ? 'opacity-70' : ''}`}>
              <div className="font-medium">{productName}</div>
              <div className="text-xs text-gray-500">
                Qty: {item.quantity} | 
                {(item.isCustomSize || item.customSize?.isCustom) ? (
                  <span className={`${tw.secondaryText} font-medium`}> Custom Size</span>
                ) : (
                  <span> Size: {item.size}</span>
                )} | 
                Rs. {item.price}
                {isDeleted && <span className="text-red-500 ml-2">(Discontinued)</span>}
              </div>
            </div>
          );
        })}
      </td>
      
      <td className={`px-6 py-4 text-sm font-semibold ${tw.primaryText}`}>
        Rs. {order.totalAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
      </td>
      
      <td className="px-6 py-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">{paymentMethodInfo.icon}</span>
          <div>
            <div className="font-medium">{paymentMethodInfo.label}</div>
            <div className="text-xs text-gray-500">{paymentMethodInfo.details}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 text-sm">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${paymentStatusInfo.color}`}>
          <span>{paymentStatusInfo.icon}</span>
          {paymentStatusInfo.label}
        </span>
      </td>
      
      <td className="px-6 py-4 text-sm">
        <StatusDropdownWithFetch
          currentStatus={order.status}
          orderId={order._id}
          onStatusChange={onStatusChange}
        />
      </td>
      
      <td className="px-6 py-4 text-sm text-gray-600">
        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
      </td>
      
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-1">
          <button
            onClick={() => onViewOrder(order)}
            className={`p-2 ${tw.primaryText} hover:bg-[#bfa77b]/10 rounded-lg transition-colors`}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDownloadPDF(order)}
            className={`p-2 ${tw.primaryText} hover:bg-[#bfa77b]/10 rounded-lg transition-colors`}
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPrintOrder(order)}
            className={`p-2 ${tw.primaryText} hover:bg-[#bfa77b]/10 rounded-lg transition-colors`}
            title="Print Order"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const OrderCard = ({ 
  order, 
  onViewOrder, 
  onDownloadPDF, 
  onPrintOrder, 
  onStatusChange 
}) => {
  const customerName = `${order.customerInfo?.firstName || order.user?.firstName || ''} ${order.customerInfo?.lastName || order.user?.lastName || ''}`.trim();
  const customerEmail = order.customerInfo?.email || order.user?.email;
  const customerPhone = order.customerInfo?.phone || order.user?.phone;
  const paymentMethodInfo = getPaymentMethodInfo(order.paymentMethod, order.paymentInfo);
  const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus || 'pending');

  return (
    <div className="bg-white rounded-lg border border-[#e8dfd3] p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with Order ID and Payment Status */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-semibold text-lg ${tw.primaryText}`}>
            #{order.orderId || order._id?.slice(-8)}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3" />
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
          </p>
        </div>
        <div className="text-right space-y-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${paymentStatusInfo.color}`}>
            <span>{paymentStatusInfo.icon}</span>
            {paymentStatusInfo.label}
          </span>
          <div>
            <StatusDropdownWithFetch
              currentStatus={order.status}
              orderId={order._id}
              onStatusChange={onStatusChange}
            />
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-3 p-3 bg-[#faf8f5] rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-[#8b6f47]" />
          <span className={`font-medium ${tw.primaryText}`}>Customer</span>
        </div>
        <div className="text-sm space-y-1">
          {customerName && <p className="font-medium">{customerName}</p>}
          {customerEmail && <p className="text-gray-600">{customerEmail}</p>}
          {customerPhone && <p className="text-gray-600">{customerPhone}</p>}
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-4 h-4 text-[#8b6f47]" />
          <span className={`font-medium ${tw.primaryText}`}>Items ({order.products?.length || 0})</span>
        </div>
        <div className="space-y-2">
          {order.products?.slice(0, 2).map((item, idx) => {
            const productData = item.productSnapshot || item.product || {};
            const productName = productData.name || 
                              item.product?.name || 
                              item.name || 
                              'Unknown Product';
            const isDeleted = !item.productExists;
            
            return (
              <div key={idx} className={`text-sm p-2 bg-gray-50 rounded ${isDeleted ? 'opacity-70' : ''}`}>
                <div className="font-medium">{productName}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Qty: {item.quantity} • 
                  {(item.isCustomSize || item.customSize?.isCustom) ? (
                    <span className={`${tw.secondaryText} font-medium`}> Custom Size</span>
                  ) : (
                    <span> Size: {item.size}</span>
                  )} • 
                  Rs. {item.price}
                  {isDeleted && <span className="text-red-500 ml-1">(Discontinued)</span>}
                </div>
              </div>
            );
          })}
          {order.products?.length > 2 && (
            <p className="text-xs text-gray-500 text-center py-1">
              +{order.products.length - 2} more items
            </p>
          )}
        </div>
      </div>

      {/* Payment and Total */}
      <div className="flex items-center justify-between mb-4 p-3 bg-[#f5f1e8] rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-lg">{paymentMethodInfo.icon}</span>
          <div>
            <div className="text-sm font-medium">{paymentMethodInfo.label}</div>
            <div className="text-xs text-gray-500">{paymentMethodInfo.details}</div>
          </div>
        </div>
        <div className={`text-lg font-bold ${tw.primaryText}`}>
          Rs. {order.totalAmount?.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewOrder(order)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#8b6f47] text-white rounded-lg hover:bg-[#6d5436] transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
        <button
          onClick={() => onDownloadPDF(order)}
          className={`p-2 ${tw.primaryText} hover:bg-[#bfa77b]/10 rounded-lg transition-colors border border-[#e8dfd3]`}
          title="Download PDF"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPrintOrder(order)}
          className={`p-2 ${tw.primaryText} hover:bg-[#bfa77b]/10 rounded-lg transition-colors border border-[#e8dfd3]`}
          title="Print Order"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OrdersTable;