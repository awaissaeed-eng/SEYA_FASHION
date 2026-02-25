// GST calculation utilities for consistent frontend calculations

/**
 * Calculate order totals including GST and shipping
 * @param {number} subtotal - Subtotal amount
 * @param {Object} gstSettings - GST settings from backend
 * @returns {Object} - Calculated totals
 */
export const calculateOrderTotals = (subtotal, gstSettings = null) => {
  const subtotalAmount = parseFloat(subtotal) || 0;
  
  // Calculate GST - applies to all products when enabled
  let gstAmount = 0;
  if (gstSettings && gstSettings.isEnabled && gstSettings.gstPercentage > 0) {
    gstAmount = Math.round((subtotalAmount * gstSettings.gstPercentage) / 100);
  }
  
  // Shipping is set to 0 as requested
  const shippingAmount = 0;
  
  // Calculate total
  const totalAmount = subtotalAmount + gstAmount + shippingAmount;
  
  return {
    subtotal: subtotalAmount,
    gstAmount,
    taxAmount: gstAmount, // Legacy support
    shippingAmount,
    total: totalAmount,
  };
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  return `Rs. ${parseFloat(amount || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
};

/**
 * Calculate cart totals from cart items
 * @param {Array} cartItems - Array of cart items
 * @param {Object} gstSettings - GST settings from backend
 * @returns {Object} - Calculated cart totals
 */
export const calculateCartTotals = (cartItems = [], gstSettings = null) => {
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  return calculateOrderTotals(subtotal, gstSettings);
};