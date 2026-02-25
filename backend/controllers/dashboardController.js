const Order = require('../models/order');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get all orders
    const orders = await Order.find();
    
    // Calculate total revenue from all orders except cancelled ones
    // (Revenue is counted when order is created since payment is already processed)
    const revenueOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = revenueOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Count orders by status
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const processingCount = orders.filter(o => o.status === 'processing').length;
    const shippedCount = orders.filter(o => o.status === 'shipped').length;
    const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
    const completedOrders = orders.filter(o => o.status === 'completed');
    const completedOrdersCount = completedOrders.length;
    
    // Calculate completion rate
    const completionRate = totalOrders > 0 ? ((completedOrdersCount / totalOrders) * 100).toFixed(1) : 0;
    
    // Get orders from last month for comparison
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthOrders = orders.filter(o => new Date(o.createdAt) >= lastMonth);
    const lastMonthRevenue = lastMonthOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Calculate revenue change percentage
    const previousMonthStart = new Date();
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 2);
    const previousMonthOrders = orders.filter(o => {
      const date = new Date(o.createdAt);
      return date >= previousMonthStart && date < lastMonth;
    });
    const previousMonthRevenue = previousMonthOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    let revenueChange = 0;
    if (previousMonthRevenue > 0) {
      revenueChange = (((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1);
    }

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        completedOrders: completedOrdersCount,
        processingCount,
        shippedCount,
        cancelledCount,
        completionRate,
        revenueChange,
        newOrdersThisMonth: lastMonthOrders.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
