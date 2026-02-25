const validator = require('validator');

// Input sanitization and validation middleware
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize route parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    res.status(400).json({ message: 'Invalid input format' });
  }
};

// Recursively sanitize object properties
const sanitizeObject = (obj, depth = 0) => {
  // Prevent deep nesting attacks
  if (depth > 10) {
    throw new Error('Object nesting too deep');
  }

  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize key names - prevent NoSQL operator injection
    const cleanKey = sanitizeKey(key);
    
    if (value === null || value === undefined) {
      sanitized[cleanKey] = value;
    } else if (typeof value === 'string') {
      sanitized[cleanKey] = sanitizeString(value);
    } else if (typeof value === 'number') {
      sanitized[cleanKey] = sanitizeNumber(value);
    } else if (typeof value === 'boolean') {
      sanitized[cleanKey] = value;
    } else if (Array.isArray(value)) {
      sanitized[cleanKey] = value.map(item => 
        typeof item === 'object' && item !== null 
          ? sanitizeObject(item, depth + 1)
          : typeof item === 'string' 
            ? sanitizeString(item)
            : item
      );
    } else if (typeof value === 'object') {
      sanitized[cleanKey] = sanitizeObject(value, depth + 1);
    } else {
      // Skip unknown types
      continue;
    }
  }
  
  return sanitized;
};

// Sanitize object keys to prevent NoSQL operator injection
const sanitizeKey = (key) => {
  if (typeof key !== 'string') {
    throw new Error('Invalid key type');
  }
  
  // Block MongoDB operators
  if (key.startsWith('$') || key.includes('.')) {
    throw new Error('Invalid key format');
  }
  
  return key.trim();
};

// Sanitize string values
const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  
  // Length validation
  if (str.length > 10000) {
    throw new Error('String too long');
  }
  
  // Remove null bytes and control characters
  let sanitized = str.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

// Sanitize numeric values
const sanitizeNumber = (num) => {
  if (typeof num === 'string') {
    const parsed = parseFloat(num);
    if (isNaN(parsed) || !isFinite(parsed)) {
      throw new Error('Invalid number format');
    }
    return parsed;
  }
  
  if (typeof num === 'number') {
    if (!isFinite(num)) {
      throw new Error('Invalid number value');
    }
    return num;
  }
  
  throw new Error('Invalid number type');
};

// Validate search input specifically
const validateSearchInput = (search) => {
  if (!search || typeof search !== 'string') {
    return null;
  }
  
  const trimmed = search.trim();
  
  // Length validation
  if (trimmed.length === 0 || trimmed.length > 100) {
    return null;
  }
  
  // Block potentially dangerous patterns
  const dangerousPatterns = [
    /\$where/i,
    /\$regex/i,
    /\$ne/i,
    /\$gt/i,
    /\$lt/i,
    /\$in/i,
    /\$nin/i,
    /\$or/i,
    /\$and/i,
    /javascript:/i,
    /<script/i,
    /eval\(/i,
    /function\(/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      return null;
    }
  }
  
  return trimmed;
};

// Escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Validate sort parameters
const validateSortField = (field, allowedFields) => {
  if (!field || typeof field !== 'string') {
    return null;
  }
  
  const cleanField = field.trim().toLowerCase();
  return allowedFields.includes(cleanField) ? cleanField : null;
};

// Rate limiting for search endpoints
const createRateLimit = () => {
  const attempts = new Map();
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const MAX_ATTEMPTS = 100;
  
  return (req, res, next) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    // Clean old entries
    for (const [id, data] of attempts.entries()) {
      if (now - data.firstAttempt > WINDOW_MS) {
        attempts.delete(id);
      }
    }
    
    // Check current client
    const clientData = attempts.get(clientId);
    
    if (!clientData) {
      attempts.set(clientId, { count: 1, firstAttempt: now });
      return next();
    }
    
    if (now - clientData.firstAttempt > WINDOW_MS) {
      attempts.set(clientId, { count: 1, firstAttempt: now });
      return next();
    }
    
    clientData.count++;
    
    if (clientData.count > MAX_ATTEMPTS) {
      return res.status(429).json({ 
        message: 'Too many requests, please try again later' 
      });
    }
    
    next();
  };
};

// Log suspicious activity
const logSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /\$where/i, /\$regex/i, /\$ne/i, /\$gt/i, /\$lt/i,
    /javascript:/i, /<script/i, /union\s+select/i,
    /drop\s+table/i, /delete\s+from/i, /insert\s+into/i
  ];
  
  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      console.warn(`[SECURITY] Suspicious request from ${req.ip}: ${req.method} ${req.path}`, {
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        data: requestData
      });
      break;
    }
  }
  
  next();
};

module.exports = {
  sanitizeInput,
  validateSearchInput,
  escapeRegex,
  validateSortField,
  createRateLimit,
  logSuspiciousActivity
};