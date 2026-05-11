/**
 * Maintenance Mode Middleware
 * 
 * Blocks all user-facing routes when MAINTENANCE_MODE=true
 * Admin routes always work (admin panel accessible during maintenance)
 * 
 * Usage:
 * - Set MAINTENANCE_MODE=true in .env to enable
 * - Set MAINTENANCE_MODE=false in .env to disable
 */

const maintenanceMiddleware = (req, res, next) => {
  // Skip maintenance check for admin routes — admin panel always works
  if (
    req.path.startsWith('/api/auth') ||
    req.path.startsWith('/api/admin') ||
    req.path.startsWith('/api/dashboard') ||
    req.path.startsWith('/api/maintenance') ||
    req.path.startsWith('/api/users') ||
    req.path.startsWith('/api/activity')
  ) {
    return next();
  }

  // Check if maintenance mode is enabled
  if (process.env.MAINTENANCE_MODE === 'true') {
    return res.status(503).json({
      success: false,
      maintenance: true,
      message: process.env.MAINTENANCE_MESSAGE || 
        'Website is under maintenance. Please check back soon.',
      endTime: process.env.MAINTENANCE_END_TIME || null
    });
  }

  // Maintenance mode is off, proceed normally
  next();
};

module.exports = maintenanceMiddleware;
