const ActivityLog = require('../models/activityLog');

// Helper: Delete activities older than 1 year
const cleanupOldActivities = async () => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    await ActivityLog.deleteMany({ createdAt: { $lt: oneYearAgo } });
  } catch (error) {
    console.error('Failed to cleanup old activities:', error);
  }
};

// Create activity log entry
exports.createLog = async (userId, action, description, targetType = null, targetId = null, targetName = null, metadata = null) => {
  try {
    // Cleanup old activities on each create
    await cleanupOldActivities();
    
    const log = new ActivityLog({
      user: userId,
      action,
      description,
      targetType,
      targetId,
      targetName,
      metadata,
    });
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create activity log:', error);
    return null;
  }
};

// Get recent activity logs with filtering
exports.getRecentActivity = async (req, res) => {
  try {
    // Cleanup old activities on each query
    await cleanupOldActivities();
    
    const { limit, quick, date, startDate, endDate } = req.query;
    const queryLimit = parseInt(limit) || 20;
    
    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    if (quick === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { createdAt: { $gte: todayStart } };
    } else if (quick === 'yesterday') {
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { createdAt: { $gte: yesterdayStart, $lt: todayStart } };
    } else if (quick === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: sevenDaysAgo } };
    } else if (quick === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
    } else if (quick === '1year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      dateFilter = { createdAt: { $gte: oneYearAgo } };
    } else if (date) {
      // Specific date filter (YYYY-MM-DD)
      const filterDate = new Date(date);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      dateFilter = { createdAt: { $gte: filterDate, $lt: nextDay } };
    } else if (startDate && endDate) {
      // Date range filter
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // Include end date
      dateFilter = { createdAt: { $gte: start, $lt: end } };
    } else if (startDate) {
      // Only start date provided - from start date to now
      const start = new Date(startDate);
      dateFilter = { createdAt: { $gte: start } };
    } else if (endDate) {
      // Only end date provided - from 1 year ago to end date
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      dateFilter = { createdAt: { $gte: oneYearAgo, $lt: end } };
    } else {
      // Default: last 7 days for dashboard preview
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: sevenDaysAgo } };
    }
    
    const logs = await ActivityLog.find(dateFilter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(queryLimit);

    // Get total count for the filter
    const totalCount = await ActivityLog.countDocuments(dateFilter);

    res.status(200).json({
      success: true,
      count: logs.length,
      totalCount,
      activities: logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get activity logs by user
exports.getUserActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const logs = await ActivityLog.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      activities: logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
