// Application Constants
// Centralized configuration for magic numbers and hardcoded values

// Price and currency settings
export const PRICE_SETTINGS = {
  MIN_PRICE: 0,
  MAX_PRICE: 100000,
  DEFAULT_PRICE_RANGE: [0, 100000],
  CURRENCY: 'PKR',
  CURRENCY_SYMBOL: 'Rs.',
  FREE_SHIPPING_THRESHOLD: 0, // Free shipping for all orders
};

// Pagination and limits
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
  PRODUCTS_PER_PAGE: 12,
  ORDERS_PER_PAGE: 20,
};

// File upload settings
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
  MAX_FILES_PER_UPLOAD: 5,
  MAX_PRODUCT_IMAGES: 10,
};

// Form validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_MESSAGE_LENGTH: 2000,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
};

// Animation and UI timing
export const TIMING = {
  TOAST_DURATION: 5000,
  MODAL_ANIMATION_DURATION: 300,
  HERO_SLIDE_INTERVAL: 5000,
  DEBOUNCE_DELAY: 300,
  PRINT_DELAY: 500,
  FORM_SUBMIT_DELAY: 1000,
  SEARCH_DEBOUNCE: 500,
};

// Order status configuration
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_ORDER = ['processing', 'pending', 'shipped', 'completed', 'cancelled'];

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.COMPLETED]: 'Completed',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
};

// Product settings
export const PRODUCT = {
  DEFAULT_SIZES: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  DEFAULT_COLORS: ['Black', 'White', 'Navy', 'Gray', 'Brown'],
  MIN_STOCK: 0,
  MAX_STOCK: 9999,
  FEATURED_PRODUCTS_LIMIT: 8,
  RELATED_PRODUCTS_LIMIT: 4,
};

// API settings
export const API = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  ADMIN_TOKEN: 'adminToken',
  CART_DATA: 'cartData',
  USER_PREFERENCES: 'userPreferences',
  THEME_PREFERENCE: 'themePreference',
};

// Email settings
export const EMAIL = {
  NEWSLETTER_SUBJECT: 'Welcome to SEYA Fashion Newsletter',
  ORDER_CONFIRMATION_SUBJECT: 'Order Confirmation - SEYA Fashion',
  PASSWORD_RESET_SUBJECT: 'Password Reset - SEYA Fashion',
  CONTACT_FORM_SUBJECT: 'New Contact Form Submission',
};

// Social media and contact
export const CONTACT = {
  WHATSAPP_DEFAULT_MESSAGE: 'Hello! I have a question about SEYA Fashion.',
  SOCIAL_PLATFORMS: ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'whatsapp'],
  SUPPORT_EMAIL: 'support@seyafashion.com',
  BUSINESS_EMAIL: 'info@seyafashion.com',
};

// Image and media settings
export const MEDIA = {
  PLACEHOLDER_IMAGE: '/placeholder-product.jpg',
  HERO_IMAGE_ASPECT_RATIO: '16:9',
  PRODUCT_IMAGE_ASPECT_RATIO: '3:4',
  THUMBNAIL_SIZE: 150,
  PREVIEW_SIZE: 400,
  FULL_SIZE: 1200,
};

// Search and filtering
export const SEARCH = {
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_LENGTH: 100,
  SEARCH_DEBOUNCE_MS: 300,
  MAX_SEARCH_RESULTS: 50,
};

// Responsive breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'Order placed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_SENT: 'Email sent successfully!',
  ITEM_ADDED_TO_CART: 'Item added to cart!',
  NEWSLETTER_SUBSCRIBED: 'Successfully subscribed to newsletter!',
};

// Feature flags
export const FEATURES = {
  ENABLE_WISHLIST: false,
  ENABLE_REVIEWS: false,
  ENABLE_SOCIAL_LOGIN: false,
  ENABLE_LIVE_CHAT: false,
  ENABLE_ANALYTICS: true,
  ENABLE_PWA: false,
};

// Environment-specific settings
export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging',
};

export default {
  PRICE_SETTINGS,
  PAGINATION,
  FILE_UPLOAD,
  VALIDATION,
  TIMING,
  ORDER_STATUS,
  ORDER_STATUS_ORDER,
  ORDER_STATUS_LABELS,
  PRODUCT,
  API,
  STORAGE_KEYS,
  EMAIL,
  CONTACT,
  MEDIA,
  SEARCH,
  BREAKPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURES,
  ENV,
};