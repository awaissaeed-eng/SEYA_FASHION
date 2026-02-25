// Global Error Handler
const errorHandler = (err, req, res, next) => {
  // Log error details for debugging (server-side only)
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      message: 'Validation Error',
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(400).json({
      message: `${field} already exists`,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired',
    });
  }

  // Security-related errors
  if (err.message && err.message.includes('Invalid input')) {
    return res.status(400).json({
      message: 'Invalid input format',
    });
  }

  if (err.message && err.message.includes('too deep')) {
    return res.status(400).json({
      message: 'Request structure too complex',
    });
  }

  if (err.message && err.message.includes('too long')) {
    return res.status(400).json({
      message: 'Input exceeds maximum length',
    });
  }

  // Rate limiting error
  if (err.status === 429) {
    return res.status(429).json({
      message: 'Too many requests, please try again later',
    });
  }

  // Default error - don't expose internal details
  const statusCode = err.status || err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : (err.message || 'An error occurred');
  
  res.status(statusCode).json({
    message,
  });
};

module.exports = errorHandler;
