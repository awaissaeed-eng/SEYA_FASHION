// Cart service using localStorage ONLY - NO backend API calls
const CART_KEY = 'cart';
const CART_VERSION_KEY = 'cart_version';
const CURRENT_CART_VERSION = '2.0'; // Updated version for new structure

class OptimizedCartService {
  constructor() {
    // Migrate old cart data on initialization
    this.migrateCartIfNeeded();
  }

  // Migrate old cart structure to new structure
  migrateCartIfNeeded() {
    try {
      const version = localStorage.getItem(CART_VERSION_KEY);
      
      // If version doesn't match, clear old cart
      if (version !== CURRENT_CART_VERSION) {
        console.log('Migrating cart to new version...');
        localStorage.removeItem(CART_KEY);
        localStorage.setItem(CART_VERSION_KEY, CURRENT_CART_VERSION);
        console.log('Cart migration complete. Old cart cleared.');
      }
    } catch (error) {
      console.error('Cart migration error:', error);
    }
  }

  // Load cart from localStorage
  loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }

  // Save cart to localStorage
  saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      localStorage.setItem(CART_VERSION_KEY, CURRENT_CART_VERSION);
      // Dispatch event for cart updates
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  // Get cart (returns promise for compatibility with existing code)
  async getCart() {
    const cart = this.loadCart();
    return {
      data: {
        success: true,
        cart: {
          items: cart
        }
      }
    };
  }

  // Add item to cart
  async addToCart(item) {
    const cart = this.loadCart();
    
    // For custom size items, use a unique identifier that includes custom size flag
    const isCustomSize = item.isCustomSize || item.customSize?.isCustom || false;
    
    // Check if item already exists (same product and size)
    // For custom size items, always add as new item (don't merge quantities)
    const existingItemIndex = isCustomSize ? -1 : cart.findIndex(
      cartItem => cartItem.productId === item.productId && cartItem.size === item.size
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists (only for standard sizes)
      cart[existingItemIndex].quantity += item.quantity || 1;
    } else {
      // Add new item
      const cartItem = {
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        size: item.size,
        quantity: item.quantity || 1,
        category: item.category,
        // Add custom size data if present
        isCustomSize: isCustomSize,
        customSize: item.customSize || { isCustom: false }
      };
      
      cart.push(cartItem);
    }

    this.saveCart(cart);
    
    return {
      data: {
        success: true,
        message: 'Item added to cart',
        cart: {
          items: cart
        }
      }
    };
  }

  // Update cart item quantity
  async updateCartItem(item) {
    const cart = this.loadCart();
    
    const itemIndex = cart.findIndex(
      cartItem => cartItem.productId === item.productId && cartItem.size === item.size
    );

    if (itemIndex > -1) {
      cart[itemIndex].quantity = item.quantity;
      this.saveCart(cart);
    }

    return {
      data: {
        success: true,
        message: 'Cart updated',
        cart: {
          items: cart
        }
      }
    };
  }

  // Remove item from cart
  async removeCartItem(item) {
    const cart = this.loadCart();
    
    const filteredCart = cart.filter(
      cartItem => !(cartItem.productId === item.productId && cartItem.size === item.size)
    );

    this.saveCart(filteredCart);

    return {
      data: {
        success: true,
        message: 'Item removed from cart',
        cart: {
          items: filteredCart
        }
      }
    };
  }

  // Clear entire cart
  async clearCart() {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event('cartUpdated'));
    
    return {
      data: {
        success: true,
        message: 'Cart cleared',
        cart: {
          items: []
        }
      }
    };
  }

  // Utility methods for compatibility
  clearCache() {
    // No-op for localStorage implementation
  }

  async preloadCart() {
    // No-op for localStorage implementation
  }

  getCachedCart() {
    return this.loadCart();
  }
}

// Create singleton instance
const optimizedCartService = new OptimizedCartService();

export { optimizedCartService };
export default optimizedCartService;