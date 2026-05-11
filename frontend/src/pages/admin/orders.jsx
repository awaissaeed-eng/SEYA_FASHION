import { useMemo, useState, useEffect } from 'react';
import { orderService } from '../../services/order';
import AdminLayout from '../../components/admin/AdminLayout';
import OrdersTable from '../../components/admin/OrdersTable';
import OrdersFilters from '../../components/admin/OrdersFilters';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import { useToast } from '../../components/Toast';
import { formatCustomerName } from '../../utils/addressFormatter';
import { getStatusInfo } from '../../utils/orderStatusDisplay';
import { handleApiError } from '../../utils/errorHandler';
import { ORDER_STATUS_ORDER } from '../../config/constants';
import { tw, fontStyles } from '../../config/theme';
import { handlePrint, handleDownloadPDF } from '../../utils/pdfGenerator';

// Remove all dummy data

// Status order for grouped view (Processing first, Cancelled last)
const STATUS_ORDER = ORDER_STATUS_ORDER;

// Helper functions to extract status information
const getStatusLabel = (status) => {
  const statusInfo = getStatusInfo(status);
  return statusInfo.label;
};

const getStatusIcon = (status) => {
  const statusInfo = getStatusInfo(status);
  return statusInfo.icon;
};

export default function Orders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'grouped'

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await orderService.getAllOrders();
        setOrders(res.data.orders || []);
      } catch (err) {
        setOrders([]);
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const customerName = formatCustomerName(order);
      const matchesSearch =
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order._id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchQuery]);

  // Group orders by status for grouped view
  const groupedOrders = useMemo(() => {
    const groups = {};
    STATUS_ORDER.forEach(status => {
      groups[status] = filteredOrders.filter(order => order.status === status);
    });
    return groups;
  }, [filteredOrders]);

  const generateOrderHTML = (order) => {
    // This function has been moved to pdfGenerator.js for better organization
    // and will be removed in the next cleanup
    return '';
  };

  const handlePrintOrder = (order) => {
    handlePrint(order);
  };

  const handleDownloadOrderPDF = (order) => {
    handleDownloadPDF(order);
  };

  const handleRefresh = async () => {
    try {
      const res = await orderService.getAllOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      handleApiError(err, toast, 'Failed to refresh orders');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      
      // Update the orders list with the updated order
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      // Update selected order if it's the one being changed
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }

      toast.success('Success', response.data.message || `Order status updated to ${newStatus}`);
    } catch (error) {
      handleApiError(error, toast, 'Failed to update order status');
      throw error; // Re-throw to let the component handle loading states
    }
  };

  // ...existing code...

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className={`text-3xl font-bold ${tw.primaryText}`} style={fontStyles.serifHeading}>
            Orders Management
          </h2>
        </div>

        {/* Filters Section */}
        <OrdersFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onRefresh={handleRefresh}
        />

        {/* Orders Display - All View */}
        {viewMode === 'all' && (
          <div className={`${tw.card} overflow-hidden`}>
            <div className="p-6 border-b border-[#e8dfd3]">
              <h3 className={`text-xl font-semibold ${tw.primaryText}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                All Orders ({filteredOrders.length})
              </h3>
            </div>
            <OrdersTable
              orders={filteredOrders}
              onViewOrder={setSelectedOrder}
              onDownloadPDF={handleDownloadOrderPDF}
              onPrintOrder={handlePrintOrder}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}

        {/* Orders Display - Grouped by Status View */}
        {viewMode === 'grouped' && (
          <div className="space-y-6">
            {STATUS_ORDER.map((status) => {
              const statusOrders = groupedOrders[status];
              if (statusOrders.length === 0) return null;
              
              return (
                <div key={status} className={`${tw.card} overflow-hidden`}>
                  <div className="p-4 border-b border-[#e8dfd3] flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getStatusIcon(status)}</span>
                      <h3 className={`text-xl font-semibold ${tw.primaryText}`} style={fontStyles.serifHeading}>
                        {getStatusLabel(status)}
                      </h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusInfo(status).color}`}>
                      {statusOrders.length} {statusOrders.length === 1 ? 'order' : 'orders'}
                    </span>
                  </div>
                  <OrdersTable
                    orders={statusOrders}
                    onViewOrder={setSelectedOrder}
                    onDownloadPDF={handleDownloadOrderPDF}
                    onPrintOrder={handlePrintOrder}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              );
            })}
            
            {/* Show message if no orders at all */}
            {filteredOrders.length === 0 && (
              <div className={`${tw.card} p-12 text-center`}>
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </div>
        )}

        {/* Order Details Modal */}
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onDownloadPDF={handleDownloadOrderPDF}
          onPrintOrder={handlePrintOrder}
          onStatusChange={handleStatusChange}
        />
      </div>
    </AdminLayout>
  );
}

