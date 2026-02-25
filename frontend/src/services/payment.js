import api from '../config/api';

// Mock tokenization service (replace with actual Meezan Bank tokenization)
class PaymentTokenizer {
  static async tokenizeCard(cardData) {
    // Simulate API call to payment gateway for tokenization
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation
        if (!cardData.cardNumber || cardData.cardNumber.length < 13) {
          reject(new Error('Invalid card number'));
          return;
        }
        
        if (!cardData.expiryDate || !cardData.cvv) {
          reject(new Error('Missing required card details'));
          return;
        }

        // Generate mock token (in production, this comes from Meezan Bank)
        const token = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const last4 = cardData.cardNumber.slice(-4);
        
        resolve({
          token,
          last4,
          cardType: PaymentTokenizer.detectCardType(cardData.cardNumber),
          expiryMonth: cardData.expiryDate.split('/')[0],
          expiryYear: cardData.expiryDate.split('/')[1]
        });
      }, 1500); // Simulate network delay
    });
  }

  static async tokenizeWallet(walletData) {
    // Simulate wallet tokenization
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!walletData.mobileNumber || !walletData.otpReference) {
          reject(new Error('Missing wallet payment details'));
          return;
        }

        const token = `wallet_${walletData.walletType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        resolve({
          token,
          walletType: walletData.walletType,
          mobileNumber: walletData.mobileNumber,
          maskedNumber: `***${walletData.mobileNumber.slice(-4)}`
        });
      }, 1000);
    });
  }

  static detectCardType(cardNumber) {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'American Express';
    if (/^6/.test(number)) return 'Discover';
    
    return 'Unknown';
  }
}

export const paymentService = {
  // Tokenize payment method (never sends raw card data to backend)
  async tokenizePayment(paymentData, paymentMethod) {
    try {
      if (paymentMethod === 'card') {
        return await PaymentTokenizer.tokenizeCard(paymentData);
      } else {
        return await PaymentTokenizer.tokenizeWallet({
          ...paymentData,
          walletType: paymentMethod
        });
      }
    } catch (error) {
      throw new Error(`Tokenization failed: ${error.message}`);
    }
  },

  // Initiate payment with token (secure backend call)
  async initiatePayment(paymentData) {
    try {
      const response = await api.post('/payments/initiate', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment initiation failed');
    }
  },

  // Verify payment status
  async verifyPayment(transactionId) {
    try {
      const response = await api.get(`/payments/verify/${transactionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  },

  // Get payment status
  async getPaymentStatus(transactionId) {
    try {
      const response = await api.get(`/payments/status/${transactionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get payment status');
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