const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Verify Token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.id) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    // Fetch user to get role
    const user = await User.findById(decoded.id).select('role isActive');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account deactivated' });
    }
    
    req.userId = decoded.id;
    req.userRole = user.role || 'user';
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Token verification failed' });
  }
};

// Optional Token Verification - for user routes that can work with or without authentication
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // If no token provided, continue without authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next();
    }

    // Try to verify token, but don't fail if invalid
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.id) {
        req.userId = decoded.id;
      }
    } catch (tokenError) {
      // Token is invalid, but continue without authentication
      console.log('Optional auth - invalid token, continuing as guest');
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue even if there's an error
  }
};

// Admin Check with database validation
const adminCheck = async (req, res, next) => {
  try {
    if (!req.userId) {
      console.error('Admin check failed: No userId in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if userRole was already set by verifyToken
    if (req.userRole !== 'admin') {
      console.error('Admin check failed: User is not admin');
      console.error('User ID:', req.userId);
      console.error('User role:', req.userRole);
      return res.status(403).json({ message: 'Admin access required' });
    }

    const user = await User.findById(req.userId).select('isActive role');
    
    if (!user) {
      console.error('Admin check failed: User not found');
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (!user.isActive) {
      console.error('Admin check failed: Account deactivated');
      return res.status(403).json({ message: 'Account deactivated' });
    }

    // Double-check role from database
    if (user.role !== 'admin') {
      console.error('Admin check failed: User role is not admin in database');
      console.error('User ID:', req.userId);
      console.error('Database role:', user.role);
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    console.log('Admin check passed for user:', req.userId);
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Authorization verification failed' });
  }
};

// Validate ObjectId format
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  
  next();
};

module.exports = { verifyToken, optionalAuth, adminCheck, validateObjectId };
