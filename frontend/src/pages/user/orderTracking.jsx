import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, CheckCircle, Clock, Truck, MapPin, Phone, Mail, Calendar, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import UserLayout from '../../components/user/UserLayout';
import { orderService } from '../../services/order';
import { useToast } from '../../components/Toast';
import { getStatusInfo } from '../../utils/orderStatusDisplay';
import CustomSizeDisplay from '../../components/user/CustomSizeDisplay';
import { tw } from '../../config/theme';

export default function OrderTracking() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [contactInfo, setContactInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    
    if (!orderId.trim()) {
      toast.error('Error', 'Please enter your Order ID');
      return;
    }
    
    if (!contactInfo.trim()) {
      toast.error('Error', 'Please enter your phone number or email');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      // Determine if contact info is email or phone
      const isEmail = contactInfo.includes('@');
      const queryParam = isEmail ? `email=${encodeURIComponent(contactInfo)}` : `phone=${encodeURIComponent(contactInfo)}`;
      
      const response = await orderService.getOrderById(orderId, queryParam);
      
      if (response.data.success && response.data.order) {
        setOrder(response.data.order);
        toast.success('Success', 'Order found!');
      } else {
        setError('Order not found. Please check your Order ID and contact information.');
      }
    } catch (err) {
      console.error('Order tracking error:', err);
      setError(err.response?.data?.message || 'Order not found. Please check your Order ID and contact information.');
      toast.error('Error', 'Could not find your order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusProgress = (status) => {
    const statusMap = {
      'pending': 1,
      'processing': 2,
      'shipped': 3,
      'completed': 4,
      'cancelled': 0
    };
    return statusMap[status] || 0;
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'processing', label: 'Confirmed', icon: CheckCircle },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'completed', label: 'Delivered', icon: MapPin }
  ];

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#f5f1e8] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${tw.primaryBg} flex items-center justify-center`}>
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-[#bfa77b]" />
              </div>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-bold ${tw.primaryText} mb-2`} style={{ fontFamily: 'Playfair Display, serif' }}>
              Track Your Order
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Enter your order details to check the status of your delivery
            </p>
          </motion.div>

          {/* Tracking Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8"
          >
            <form onSubmit={handleTrackOrder} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium ${tw.primaryText} mb-2`}>
                  Order ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g., SEYA00001"
                    className={`w-full px-4 py-3 pl-12 border border-[#e8dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77b] ${tw.primaryText}`}
                  />
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  You can find your Order ID in the confirmation email
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium ${tw.primaryText} mb-2`}>
                  Phone Number or Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="03001234567 or email@example.com"
                    className={`w-full px-4 py-3 pl-12 border border-[#e8dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77b] ${tw.primaryText}`}
                  />
                  {contactInfo.includes('@') ? (
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  ) : (
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the phone number or email used when placing the order
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${tw.primaryBg} text-[#bfa77b] py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-[#6d3a18] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#bfa77b] border-t-transparent rounded-full animate-spin"></div>
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Track Order
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Order Not Found</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                  <p className="text-red-600 text-sm mt-2">
                    Please verify:
                  </p>
                  <ul className="text-red-600 text-sm mt-1 ml-4 list-disc">
                    <li>Order ID is correct (check your confirmation email)</li>
                    <li>Phone number or email matches the one used during checkout</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Details */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Order Header */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className={`text-2xl font-bold ${tw.primaryText} mb-1`} style={{ fontFamily: 'Playfair Display, serif' }}>
                      Order {order.orderId || order._id}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className={`text-2xl font-bold ${tw.primaryText}`}>
                      Rs. {order.totalAmount?.toLocaleString('en-PK')}
                    </p>
                  </div>
                </div>

                {/* Status Progress Bar */}
                {order.status !== 'cancelled' ? (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      {statusSteps.map((step, index) => {
                        const currentProgress = getStatusProgress(order.status);
                        const isCompleted = index + 1 <= currentProgress;
                        const isCurrent = index + 1 === currentProgress;
                        const Icon = step.icon;

                        return (
                          <div key={step.key} className="flex-1 relative">
                            <div className="flex flex-col items-center">
                              {/* Icon */}
                              <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                                  isCompleted
                                    ? 'bg-[#592a0d] text-[#bfa77b]'
                                    : isCurrent
                                    ? 'bg-[#bfa77b] text-[#592a0d] ring-4 ring-[#bfa77b]/30'
                                    : 'bg-gray-200 text-gray-400'
                                }`}
                              >
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                              </div>
                              {/* Label */}
                              <p
                                className={`text-xs sm:text-sm font-medium text-center ${
                                  isCompleted || isCurrent ? tw.primaryText : 'text-gray-400'
                                }`}
                              >
                                {step.label}
                              </p>
                            </div>
                            {/* Connector Line */}
                            {index < statusSteps.length - 1 && (
                              <div
                                className={`absolute top-5 sm:top-6 left-1/2 w-full h-1 -z-10 transition-all ${
                                  index + 1 < currentProgress ? 'bg-[#592a0d]' : 'bg-gray-200'
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Current Status Message */}
                    <div className={`p-4 rounded-lg ${tw.secondaryBg} border border-[#e8dfd3]`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{getStatusInfo(order.status).icon}</span>
                        </div>
                        <div>
                          <h3 className={`font-semibold ${tw.primaryText} mb-1`}>
                            {getStatusInfo(order.status).label}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getStatusInfo(order.status).description}
                          </p>
                          {order.status === 'shipped' && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Estimated Delivery:</strong> 3-5 business days
                            </p>
                          )}
                          {order.status === 'processing' && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Note:</strong> We will contact you on {order.customerInfo?.phone} to confirm delivery details.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-4 rounded-lg bg-gray-100 border border-gray-300">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-gray-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Order Cancelled</h3>
                        <p className="text-sm text-gray-600">
                          This order has been cancelled. If you have any questions, please contact our support team.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className={`text-lg font-semibold ${tw.primaryText} mb-4`}>
                    Order Items ({order.products?.length})
                  </h3>
                  <div className="space-y-4">
                    {order.products?.map((item, index) => {
                      const productData = item.productSnapshot || item.product || {};
                      const productName = productData.name || item.product?.name || item.name || 'Unknown Product';
                      const productImage = productData.images?.[0] || item.product?.images?.[0];
                      const isCustomSize = item.isCustomSize || item.customSize?.isCustom;

                      return (
                        <div
                          key={index}
                          className="flex gap-4 p-4 rounded-lg bg-[#faf8f5] border border-[#e8dfd3]"
                        >
                          {/* Product Image */}
                          {productImage && (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                              <img
                                src={productImage}
                                alt={productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold ${tw.primaryText} mb-1`}>
                              {productName}
                            </h4>
                            {isCustomSize ? (
                              <div className="text-sm text-gray-600 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className={`${tw.secondaryText} font-medium`}>Custom Size</span>
                                  <span>•</span>
                                  <span>Qty: {item.quantity}</span>
                                </div>
                                <CustomSizeDisplay customSize={item.customSize} compact />
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">
                                Size: {item.size || 'Standard'} • Qty: {item.quantity}
                              </p>
                            )}
                            <p className={`text-sm font-semibold ${tw.primaryText} mt-2`}>
                              Rs. {(item.price * item.quantity).toLocaleString('en-PK')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h3 className={`text-lg font-semibold ${tw.primaryText} mb-4`}>
                  Delivery Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#bfa77b] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Shipping Address</p>
                      <p className={`${tw.primaryText}`}>{order.shippingAddress?.name}</p>
                      <p className="text-sm text-gray-600">{order.shippingAddress?.street}</p>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                      </p>
                      <p className="text-sm text-gray-600">{order.shippingAddress?.country}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#bfa77b] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Contact Number</p>
                      <p className={`${tw.primaryText}`}>{order.customerInfo?.phone || order.shippingAddress?.phone}</p>
                    </div>
                  </div>
                  {order.customerInfo?.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-[#bfa77b] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                        <p className={`${tw.primaryText}`}>{order.customerInfo.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h3 className={`text-lg font-semibold ${tw.primaryText} mb-4`}>
                  Order Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className={tw.primaryText}>Rs. {order.subtotalAmount?.toLocaleString('en-PK')}</span>
                  </div>
                  {order.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST</span>
                      <span className={tw.primaryText}>Rs. {order.taxAmount?.toLocaleString('en-PK')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className={tw.primaryText}>Rs. {order.shippingAmount?.toLocaleString('en-PK') || '0'}</span>
                  </div>
                  <div className="border-t border-[#e8dfd3] pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className={`font-semibold ${tw.primaryText}`}>Total</span>
                      <span className={`font-bold text-lg ${tw.primaryText}`}>
                        Rs. {order.totalAmount?.toLocaleString('en-PK')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className={`p-6 rounded-xl ${tw.secondaryBg} border border-[#e8dfd3]`}>
                <h3 className={`font-semibold ${tw.primaryText} mb-2`}>Need Help?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  If you have any questions about your order, please contact our customer support team.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:+923001234567"
                    className={`flex items-center justify-center gap-2 px-4 py-2 border border-[#bfa77b] ${tw.primaryText} rounded-lg hover:bg-[#bfa77b]/10 transition-colors text-sm`}
                  >
                    <Phone className="w-4 h-4" />
                    Call Support
                  </a>
                  <a
                    href="mailto:support@seyafashion.com"
                    className={`flex items-center justify-center gap-2 px-4 py-2 border border-[#bfa77b] ${tw.primaryText} rounded-lg hover:bg-[#bfa77b]/10 transition-colors text-sm`}
                  >
                    <Mail className="w-4 h-4" />
                    Email Support
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
