// Wishlist utility functions using localStorage

const WISHLIST_KEY = 'seya_wishlist';

/**
 * Get all wishlist items
 * @returns {Array} Array of product IDs
 */
export const getWishlist = () => {
  try {
    const wishlist = localStorage.getItem(WISHLIST_KEY);
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (error) {
    console.error('Error reading wishlist:', error);
    return [];
  }
};

/**
 * Add product to wishlist
 * @param {string} productId - Product ID to add
 * @returns {boolean} Success status
 */
export const addToWishlist = (productId) => {
  try {
    const wishlist = getWishlist();
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
      // Dispatch event for other components to listen
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { productId, action: 'add' } }));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
};

/**
 * Remove product from wishlist
 * @param {string} productId - Product ID to remove
 * @returns {boolean} Success status
 */
export const removeFromWishlist = (productId) => {
  try {
    const wishlist = getWishlist();
    const filtered = wishlist.filter(id => id !== productId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(filtered));
    // Dispatch event for other components to listen
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { productId, action: 'remove' } }));
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
};

/**
 * Check if product is in wishlist
 * @param {string} productId - Product ID to check
 * @returns {boolean} True if in wishlist
 */
export const isInWishlist = (productId) => {
  const wishlist = getWishlist();
  return wishlist.includes(productId);
};

/**
 * Toggle product in wishlist
 * @param {string} productId - Product ID to toggle
 * @returns {boolean} True if added, false if removed
 */
export const toggleWishlist = (productId) => {
  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
    return false;
  } else {
    addToWishlist(productId);
    return true;
  }
};

/**
 * Clear entire wishlist
 */
export const clearWishlist = () => {
  try {
    localStorage.removeItem(WISHLIST_KEY);
    window.dispatchEvent(new Event('wishlistUpdated'));
  } catch (error) {
    console.error('Error clearing wishlist:', error);
  }
};

/**
 * Get wishlist count
 * @returns {number} Number of items in wishlist
 */
export const getWishlistCount = () => {
  return getWishlist().length;
};
