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
      return data.message;
    }
    
    // Handle common HTTP status codes
    switch (status) {
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.GENERIC_ERROR;
    }
  }
  
  // Handle network errors
  if (error.request) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  // Handle validation errors
  if (error.name === 'ValidationError') {
    return ERROR_MESSAGES.VALIDATION_ERROR;
  }
  
  // Return the error message if it's a string and user-friendly
  if (typeof error === 'string') {
    return error;
  }
  
  // Return the error message if it exists and looks user-friendly
  if (error.message && !error.message.includes('fetch')) {
    return error.message;
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
};