const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const { sanitizeInput, createRateLimit, logSuspiciousActivity } = require('./middleware/securityMiddleware');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Connect to MongoDB
connectDB();

// Ensure uploads directories exist
const uploadsDirectories = [
  path.join(__dirname, 'uploads', 'avatars'),
  path.join(__dirname, 'uploads', 'products'),
  path.join(__dirname, 'uploads', 'categories'),
  path.join(__dirname, 'uploads', 'hero')
];

uploadsDirectories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Security middleware (applied first)
app.use(logSuspiciousActivity);
app.use(sanitizeInput);

// Rate limiting for search endpoints
const searchRateLimit = createRateLimit();
app.use('/api/products', searchRateLimit);

// CORS configuration
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5174',
    'https://seyafashion.com.pk',
    'https://www.seyafashion.com.pk',
    'https://palevioletred-mallard-931043.hostingersite.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    if (buf.length === 0) {
      req.body = {};
    }
  }
}));
app.use(express.urlencoded({ 
  limit: '10mb', 
  extended: true,
  parameterLimit: 100
}));
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
});

// Serve uploads folder for images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Maintenance Mode Middleware (MUST be before other routes)
const maintenanceMiddleware = require('./middleware/maintenanceMiddleware');
app.use(maintenanceMiddleware);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'SEYA Fashion API is running!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'SEYA Fashion Backend API',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/footer-links', require('./routes/footerLinkRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/subscribers', require('./routes/subscriberRoutes'));
app.use('/api/hero', require('./routes/heroRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/tax', require('./routes/taxRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    requestedPath: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/products',
      'GET /api/categories',
      'POST /api/auth/login'
    ]
  });
});

// Error handling middleware (applied last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SEYA Fashion Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 API URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

module.exports = app;
