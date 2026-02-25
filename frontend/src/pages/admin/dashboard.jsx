import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, ShoppingCart, CheckCircle2, RefreshCw, Truck, XCircle, X, History, Calendar } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../config/api';

function SmallCard({ children, className = '' }) {
  return (
    <div className={`border-[#e8dfd3] bg-white rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// Format PKR currency
const formatPKR = (amount) => {
  return `Rs. ${amount?.toLocaleString('en-PK', { maximumFractionDigits: 0 }) || '0'}`;
};

// Format activity time based on date
const formatActivityTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const pastDate = new Date(past.getFullYear(), past.getMonth(), past.getDate());
  
  const timeStr = past.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  if (pastDate.getTime() === today.getTime()) {
    return timeStr;
  } else if (pastDate.getTime() === yesterday.getTime()) {
    return `Yesterday ${timeStr}`;
  } else {
    const dateStr = past.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    return `${dateStr}, ${timeStr}`;
  }
};

// Get activity type color
const getActivityColor = (action) => {
  if (action.includes('product')) return 'bg-[#d4a574]';
  if (action.includes('category')) return 'bg-[#8b6f47]';
  if (action.includes('order')) return 'bg-[#592a0d]';
  if (action.includes('password') || action.includes('profile') || action.includes('avatar')) return 'bg-[#bfa77b]';
  return 'bg-gray-400';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    processingCount: 0,
    shippedCount: 0,
    cancelledCount: 0,
    completionRate: 0,
    revenueChange: 0,
    newOrdersThisMonth: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [allActivities, setAllActivities] = useState([]);
  const [activityFilter, setActivityFilter] = useState('1year'); // Default to 1 year
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalActivityCount, setTotalActivityCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/activity?limit=5'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (activityRes.data.success) {
        setActivities(activityRes.data.activities);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllActivities = async (filterType = '1year', start = '', end = '') => {
    setLoadingActivities(true);
    try {
      let url = '/activity?limit=500';
      
      if (start && end) {
        // Custom date range
        url = `/activity?startDate=${start}&endDate=${end}&limit=500`;
      } else if (start) {
        url = `/activity?startDate=${start}&limit=500`;
      } else if (end) {
        url = `/activity?endDate=${end}&limit=500`;
      } else if (filterType === '1year') {
        url = '/activity?quick=1year&limit=500';
      } else if (filterType === '30days') {
        url = '/activity?quick=30days&limit=500';
      } else if (filterType === '7days') {
        url = '/activity?quick=7days&limit=500';
      } else if (filterType === 'today') {
        url = '/activity?quick=today&limit=500';
      } else if (filterType === 'yesterday') {
        url = '/activity?quick=yesterday&limit=500';
      }
      
      const res = await api.get(url);
      if (res.data.success) {
        setAllActivities(res.data.activities);
        setTotalActivityCount(res.data.totalCount || res.data.activities.length);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleViewAllActivities = () => {
    setShowActivityModal(true);
    setStartDate('');
    setEndDate('');
    setActivityFilter('1year');
    fetchAllActivities('1year');
  };

  const handleFilterChange = (filterType) => {
    setActivityFilter(filterType);
    setStartDate('');
    setEndDate('');
    fetchAllActivities(filterType);
  };

  const handleDateRangeFilter = () => {
    if (startDate || endDate) {
      setActivityFilter('custom');
      fetchAllActivities('custom', startDate, endDate);
    }
  };

  const handleClearDateRange = () => {
    setStartDate('');
    setEndDate('');
    setActivityFilter('1year');
    fetchAllActivities('1year');
  };

  // Quick filter options
  const quickFilters = [
    { key: '1year', label: 'Last 1 Year' },
    { key: '30days', label: 'Last 30 Days' },
    { key: '7days', label: 'Last 7 Days' },
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
  ];

  const statsData = [
    {
      title: 'Total Revenue',
      value: formatPKR(stats.totalRevenue),
      change: `${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}% from last month`,
      icon: Banknote,
      color: '#bfa77b',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: `+${stats.newOrdersThisMonth} this month`,
      icon: ShoppingCart,
      color: '#592a0d',
    },
    {
      title: 'Completed',
      value: stats.completedOrders.toLocaleString(),
      change: `${stats.completionRate}% completion rate`,
      icon: CheckCircle2,
      color: '#8b6f47',
    },
    {
      title: 'Processing',
      value: stats.processingCount.toString(),
      change: 'Being prepared',
      icon: RefreshCw,
      color: '#d4a574',
    },
    {
      title: 'Shipped',
      value: stats.shippedCount.toString(),
      change: 'On the way',
      icon: Truck,
      color: '#3b82f6',
    },
    {
      title: 'Cancelled',
      value: stats.cancelledCount.toString(),
      change: 'Order cancellations',
      icon: XCircle,
      color: '#dc2626',
    },
  ];

  const handleAddProduct = () => {
    navigate('/admin/products');
  };

  const handleManageCategories = () => {
    navigate('/admin/categories');
  };

  const handleOrderManage = () => {
    navigate('/admin/orders');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#592a0d]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }}>
            Admin Dashboard
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <SmallCard key={stat.title} className="p-3 sm:p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                    <div className="mt-1 sm:mt-2 text-lg sm:text-2xl font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: stat.color }}>
                      {stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{stat.change}</p>
                  </div>
                  <div className="ml-2 sm:ml-3 flex-shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: stat.color }} />
                  </div>
                </div>
              </SmallCard>
            );
          })}
        </div>

        {/* Quick Actions */}
        <SmallCard className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
            <h2 className="text-base sm:text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }}>
              Quick Actions
            </h2>
            <div className="text-xs sm:text-sm text-muted-foreground">Actions to speed up admin tasks</div>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
            <button
              onClick={handleAddProduct}
              className="px-3 sm:px-4 py-2 border-2 border-[#bfa77b] text-[#592a0d] rounded-lg font-medium transition-all duration-300 hover:bg-[#592a0d] hover:text-white hover:border-[#592a0d] hover:shadow-md active:scale-95 text-sm sm:text-base"
            >
              Add New Product
            </button>
            <button
              onClick={handleManageCategories}
              className="px-3 sm:px-4 py-2 border-2 border-[#bfa77b] text-[#592a0d] rounded-lg font-medium transition-all duration-300 hover:bg-[#592a0d] hover:text-white hover:border-[#592a0d] hover:shadow-md active:scale-95 text-sm sm:text-base"
            >
              Manage Categories
            </button>
            <button
              onClick={handleOrderManage}
              className="px-3 sm:px-4 py-2 border-2 border-[#bfa77b] text-[#592a0d] rounded-lg font-medium transition-all duration-300 hover:bg-[#592a0d] hover:text-white hover:border-[#592a0d] hover:shadow-md active:scale-95 text-sm sm:text-base"
            >
              Order Manage
            </button>
          </div>
        </SmallCard>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6">
          <SmallCard className="p-3 sm:p-4 xl:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
              <h3 className="text-base sm:text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }}>
                Recent Activity
              </h3>
              <div className="text-xs sm:text-sm text-muted-foreground">Latest 5 activities</div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {activities.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                  No recent activities
                </div>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-start sm:items-center justify-between p-2 sm:p-3 rounded-lg bg-[#faf8f5] hover:bg-[#f5f1eb] transition-colors border border-[#e8dfd3]"
                  >
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getActivityColor(activity.action)} flex-shrink-0 mt-1 sm:mt-0`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium leading-tight">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatActivityTime(activity.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* View All Button - after activities */}
            <div className="flex justify-end mt-3 sm:mt-4">
              <button
                onClick={handleViewAllActivities}
                className="flex items-center gap-2 px-3 py-2 bg-[#592a0d] text-white rounded-lg hover:bg-[#6d3a18] transition-colors text-xs sm:text-sm shadow-md"
              >
                <History className="w-3 h-3 sm:w-4 sm:h-4" />
                View All
              </button>
            </div>
          </SmallCard>
        </div>

        {/* Activity History Modal */}
        {showActivityModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg border border-[#e8dfd3] max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="p-6 border-b border-[#e8dfd3] flex items-center justify-between">
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-2xl font-bold">
                    Activity History
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">View up to 1 year of admin activity</p>
                </div>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Quick Filters */}
              <div className="px-6 py-3 border-b border-[#e8dfd3]">
                <p className="text-sm font-medium text-[#592a0d] mb-2">Quick Filters</p>
                <div className="flex flex-wrap gap-2">
                  {quickFilters.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => handleFilterChange(filter.key)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        activityFilter === filter.key
                          ? 'bg-[#592a0d] text-white'
                          : 'bg-[#f5f1e8] text-[#592a0d] hover:bg-[#e8dfd3]'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="px-6 py-3 border-b border-[#e8dfd3]">
                <p className="text-sm font-medium text-[#592a0d] mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Custom Date Range
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">From:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate || new Date().toISOString().split('T')[0]}
                      className="px-3 py-1.5 border border-[#e8dfd3] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#bfa77b]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">To:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      max={new Date().toISOString().split('T')[0]}
                      className="px-3 py-1.5 border border-[#e8dfd3] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#bfa77b]"
                    />
                  </div>
                  <button
                    onClick={handleDateRangeFilter}
                    disabled={!startDate && !endDate}
                    className="px-4 py-1.5 bg-[#bfa77b] text-[#592a0d] rounded-md text-sm font-medium hover:bg-[#d4bd8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                  {(startDate || endDate || activityFilter === 'custom') && (
                    <button
                      onClick={handleClearDateRange}
                      className="px-3 py-1.5 text-sm text-red-500 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Activity List */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingActivities ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#592a0d]"></div>
                  </div>
                ) : allActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No activities found for this period
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 mb-3">
                      Showing {allActivities.length} of {totalActivityCount} activities
                    </p>
                    <div className="space-y-3">
                      {allActivities.map((activity) => (
                        <div
                          key={activity._id}
                          className="flex items-center justify-between p-3 rounded-lg bg-[#faf8f5] hover:bg-[#f5f1eb] transition-colors border border-[#e8dfd3]"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getActivityColor(activity.action)}`} />
                            <div>
                              <p className="text-sm font-medium">{activity.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
