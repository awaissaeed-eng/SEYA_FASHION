// Optimized cart service with batching and caching
import api from '../config/api';

class OptimizedCartService {
  constructor() {
    this.cache = new Map();
    this.pendingOperations = [];
    this.batchTimeout = null;
    this.BATCH_DELAY = 300; // ms
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  getCachedCart() {
    const cached = this.cache.get('cart');
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  setCachedCart(data) {
    this.cache.set('cart', {
      data,
      timestamp: Date.now()
    });
  }

  invalidateCache() {
    this.cache.delete('cart');
  }

  // Batch operations
  batchOperation(operation) {
    return new Promise((resolve, reject) => {
      this.pendingOperations.push({ operation, resolve, reject });
      
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }
      
      this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, this.BATCH_DELAY);
    });
  }

  async processBatch() {
    if (this.pendingOperations.length === 0) return;
    
    const operations = [...this.pendingOperations];
    this.pendingOperations = [];
    this.batchTimeout = null;

    try {
      // Group operations by type
      const grouped = operations.reduce((acc, { operation }) => {
        const type = operation.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(operation);
        return acc;
      }, {});

      // Process each group
      let finalCart = null;
      
      for (const [type, ops] of Object.entries(grouped)) {
        switch (type) {
          case 'add':
            for (const op of ops) {
              await api.post('/cart/add', op.data);
            }
            break;
          case 'update':
            for (const op of ops) {
              await api.put('/cart/update', op.data);
            }
            break;
          case 'remove':
            for (const op of ops) {
              await api.delete('/cart/remove', { data: op.data });
            }
            break;
        }
      }

      // Fetch updated cart once
      const cartResponse = await api.get('/cart');
      finalCart = cartResponse.data;
      this.setCachedCart(finalCart);

      // Resolve all promises with the same cart data
      operations.forEach(({ resolve }) => resolve(cartResponse));
      
      // Dispatch cart updated event
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (error) {
      // Reject all promises with the error
      operations.forEach(({ reject }) => reject(error));
      this.invalidateCache();
    }
  }

  // Public API methods
  async addToCart(item) {
    this.invalidateCache();
    return this.batchOperation({
      type: 'add',
      data: item
    });
  }

  async getCart() {
    // Try cache first
    const cached = this.getCachedCart();
    if (cached) {
      return { data: cached };
    }

    try {
      const response = await api.get('/cart');
      this.setCachedCart(response.data);
      return response;
    } catch (error) {
      this.invalidateCache();
      throw error;
    }
  }

  async updateCartItem(item) {
    this.invalidateCache();
    return this.batchOperation({
      type: 'update',
      data: item
    });
  }

  async removeCartItem(item) {
    this.invalidateCache();
    return this.batchOperation({
      type: 'remove',
      data: item
    });
  }

  async clearCart() {
    this.invalidateCache();
    const response = await api.delete('/cart/clear');
    window.dispatchEvent(new Event('cartUpdated'));
    return response;
  }

  // Utility methods
  clearCache() {
    this.cache.clear();
  }

  // Preload cart data
  async preloadCart() {
    if (!this.getCachedCart()) {
      try {
        await this.getCart();
      } catch (error) {
        // Silently fail for preloading
        console.warn('Failed to preload cart:', error);
      }
    }
  }
}

// Create singleton instance
const optimizedCartService = new OptimizedCartService();

export { optimizedCartService };
export default optimizedCartService;