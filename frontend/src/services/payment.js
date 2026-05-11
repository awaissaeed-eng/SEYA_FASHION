import api from '../config/api';

// Card type detection utility
export const detectCardType = (cardNumber) => {
  const number = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(number)) return 'Visa';
  if (/^5[1-5]/.test(number)) return 'Mastercard';
  if (/^3[47]/.test(number)) return 'American Express';
  if (/^6/.test(number)) return 'Discover';
  
  return 'Unknown';
};

export const paymentService = {
  // Initiate payment with token (secure backend call)
  async initiatePayment(paymentData) {
    try {
      const response = await api.post('/payments/initiate', paymentData);
      return response.data;
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw new Error(error.response?.data?.message || 'We could not process your payment. Please try again.');
    }
  },

  // Verify payment status
  async verifyPayment(transactionId) {
    try {
      const response = await api.get(`/payments/verify/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw new Error(error.response?.data?.message || 'Unable to verify payment. Please try again.');
    }
  },

  // Get payment status
  async getPaymentStatus(transactionId) {
    try {
      const response = await api.get(`/payments/status/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Payment status error:', error);
      throw new Error(error.response?.data?.message || 'Unable to retrieve payment status. Please try again.');
    }
  }
};

// Fraud prevention utilities
export const fraudPrevention = {
  // Check for duplicate transactions
  checkDuplicateTransaction(amount, timestamp) {
    const key = `transaction_${amount}_${Math.floor(timestamp / 60000)}`; // 1-minute window
    const existing = localStorage.getItem(key);
    
    if (existing) {
      return true; // Potential duplicate
    }
    
    localStorage.setItem(key, timestamp.toString());
    // Clean up old entries
    setTimeout(() => localStorage.removeItem(key), 300000); // 5 minutes
    
    return false;
  },

  // Validate transaction amount
  validateAmount(amount, minAmount = 100, maxAmount = 1000000) {
    const numAmount = parseFloat(amount);
    return numAmount >= minAmount && numAmount <= maxAmount;
  },

  // Rate limiting check
  checkRateLimit(identifier, maxAttempts = 5, windowMs = 300000) { // 5 attempts per 5 minutes
    const key = `rate_limit_${identifier}`;
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Filter attempts within window
    const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false; // Rate limited
    }
    
    recentAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(recentAttempts));
    
    return true;
  }
};