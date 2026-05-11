import { ERROR_MESSAGES } from '../config/constants';

/**
 * Centralized error handling utility
 * Provides consistent error processing and user-friendly messages
 */

export class AppError extends Error {
  constructor(message, code = 'GENERIC_ERROR', statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/**
 * Technical error messages that should be hidden from users
 * These are mapped to user-friendly alternatives
 */
const TECHNICAL_ERROR_MAP = {
  // Payment errors
  'tokenization failed': 'Payment processing error. Please check your payment details and try again',
  'payment tokenization failed': 'Payment processing error. Please check your payment details and try again',
  'payment processing failed': 'Payment could not be processed. Please try again or use a different payment method',
  'transaction failed': 'Payment could not be processed. Please try again',
  'payment declined': 'Payment was declined. Please check your payment details or try a different payment method',
  
  // Database errors
  'database error': 'Service temporarily unavailable. Please try again later',
  'db error': 'Service temporarily unavailable. Please try again later',
  'connection error': 'Service temporarily unavailable. Please try again later',
  'query failed': 'Service temporarily unavailable. Please try again later',
  
  // Server errors
  'internal server error': 'Something went wrong. Please try again later',
  'server error': 'Something went wrong. Please try again later',
  '500': 'Something went wrong. Please try again later',
  
  // Network errors
  'network error': 'Network connection error. Please check your internet connection',
  'timeout': 'Request timed out. Please try again',
  'request timeout': 'Request timed out. Please try again',
  
  // Validation errors (technical)
  'validation failed': 'Please check your input and try again',
  'invalid input': 'Please check your input and try again',
  'missing required field': 'Please fill in all required fields',
  'required field missing': 'Please fill in all required fields',
};

/**
 * Check if an error message is technical and should be hidden
 */
const isTechnicalError = (message) => {
  if (!message || typeof message !== 'string') return false;
  
  const lowerMessage = message.toLowerCase().trim();
  
  // Check if message matches any technical error pattern
  for (const technicalKey of Object.keys(TECHNICAL_ERROR_MAP)) {
    if (lowerMessage.includes(technicalKey.toLowerCase())) {
      return true;
    }
  }
  
  // Additional patterns that indicate technical errors
  const technicalPatterns = [
    /internal/i,
    /database/i,
    /query/i,
    /connection/i,
    /timeout/i,
    /500/,
    /502/,
    /503/,
    /504/,
  ];
  
  return technicalPatterns.some(pattern => pattern.test(message));
};

/**
 * Convert technical error message to user-friendly message
 */
const convertTechnicalError = (message) => {
  if (!message || typeof message !== 'string') {
    return ERROR_MESSAGES.GENERIC_ERROR;
  }
  
  const lowerMessage = message.toLowerCase().trim();
  
  // Find matching technical error and return user-friendly version
  for (const [technicalKey, userFriendlyMessage] of Object.entries(TECHNICAL_ERROR_MAP)) {
    if (lowerMessage.includes(technicalKey.toLowerCase())) {
      return userFriendlyMessage;
    }
  }
  
  // If no specific match, return generic error
  return ERROR_MESSAGES.GENERIC_ERROR;
};

/**
 * User-friendly error messages that should be shown as-is
 * These are validation and business logic errors that users need to see
 */
const USER_FRIENDLY_PATTERNS = [
  /product not found/i,
  /out of stock/i,
  /insufficient stock/i,
  /invalid quantity/i,
  /cart is empty/i,
  /invalid address/i,
  /invalid phone/i,
  /invalid card/i,
  /card expired/i,
  /invalid cvv/i,
  /invalid expiry/i,
  /order not found/i,
  /already subscribed/i,
  /invalid email format/i,
  /please enter/i,
  /please provide/i,
  /required/i,
  /must be at least/i,
  /must be less than/i,
  /cannot be empty/i,
  /too short/i,
  /too long/i,
];

/**
 * Check if error message is user-friendly and should be shown
 */
const isUserFriendlyError = (message) => {
  if (!message || typeof message !== 'string') return false;
  return USER_FRIENDLY_PATTERNS.some(pattern => pattern.test(message));
};

/**
 * Extract user-friendly error message from various error types
 */
export const getErrorMessage = (error) => {
  // Handle AppError instances
  if (error instanceof AppError) {
    return error.message;
  }
  
  // Handle API response errors
  if (error.response) {
    const { status, data } = error.response;
    
    // Check for specific error message from API
    if (data?.message) {
      const apiMessage = data.message;
      
      // If it's a user-friendly message, show it
      if (isUserFriendlyError(apiMessage)) {
        return apiMessage;
      }
      
      // If it's a technical message, convert it
      if (isTechnicalError(apiMessage)) {
        return convertTechnicalError(apiMessage);
      }
      
      // If unsure, show the message (better to show than hide legitimate errors)
      return apiMessage;
    }
    
    // Handle common HTTP status codes
    switch (status) {
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return 'Access denied. Please try again';
      case 403:
        return 'Access denied';
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 500:
        return 'Something went wrong. Please try again later';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later';
      default:
        return ERROR_MESSAGES.GENERIC_ERROR;
    }
  }
  
  // Handle network errors
  if (error.request) {
    return 'Network connection error. Please check your internet connection';
  }
  
  // Handle validation errors
  if (error.name === 'ValidationError') {
    return ERROR_MESSAGES.VALIDATION_ERROR;
  }
  
  // Return the error message if it's a string
  if (typeof error === 'string') {
    // Check if it's technical
    if (isTechnicalError(error)) {
      return convertTechnicalError(error);
    }
    // Check if it's user-friendly
    if (isUserFriendlyError(error)) {
      return error;
    }
    // Default to showing the message
    return error;
  }
  
  // Return the error message if it exists
  if (error.message) {
    // Check if it's technical
    if (isTechnicalError(error.message)) {
      return convertTechnicalError(error.message);
    }
    // Check if it's user-friendly
    if (isUserFriendlyError(error.message)) {
      return error.message;
    }
    // If it doesn't look like a fetch error, show it
    if (!error.message.includes('fetch')) {
      return error.message;
    }
  }
  
  // Fallback to generic error
  return ERROR_MESSAGES.GENERIC_ERROR;
};

/**
 * Handle API errors consistently
 */
export const handleApiError = (error, toast = null, defaultMessage = null) => {
  const message = defaultMessage || getErrorMessage(error);
  
  // Log error for debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }
  
  // Show toast notification if toast function is provided
  if (toast && typeof toast.error === 'function') {
    toast.error('Error', message);
  }
  
  return message;
};

/**
 * Async error wrapper for consistent error handling
 */
export const withErrorHandling = (asyncFn, errorHandler = null) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const message = getErrorMessage(error);
      
      if (errorHandler) {
        errorHandler(error, message);
      }
      
      throw new AppError(message, error.code || 'GENERIC_ERROR', error.statusCode || 500);
    }
  };
};

/**
 * Form validation error handler
 */
export const handleFormErrors = (error, setErrors = null) => {
  if (error.response?.data?.errors) {
    const formErrors = error.response.data.errors;
    
    if (setErrors && typeof setErrors === 'function') {
      setErrors(formErrors);
    }
    
    return formErrors;
  }
  
  return {};
};

/**
 * Retry mechanism for failed operations
 */
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

/**
 * Safe async operation wrapper
 */
export const safeAsync = async (asyncFn, fallbackValue = null) => {
  try {
    return await asyncFn();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Safe async operation failed:', error);
    }
    return fallbackValue;
  }
};

/**
 * Validation error formatter
 */
export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(error => error.message || error).join(', ');
  }
  
  if (typeof errors === 'object') {
    return Object.values(errors).flat().join(', ');
  }
  
  return errors || ERROR_MESSAGES.VALIDATION_ERROR;
};

export default {
  AppError,
  getErrorMessage,
  handleApiError,
  withErrorHandling,
  handleFormErrors,
  withRetry,
  safeAsync,
  formatValidationErrors,
  isTechnicalError,
  isUserFriendlyError,
  convertTechnicalError,
};