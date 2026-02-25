// Address formatting utilities for consistent display across the application

/**
 * Formats customer name from order data
 * @param {Object} order - Order object containing customer information
 * @returns {string} - Formatted customer name
 */
export const formatCustomerName = (order) => {
  if (!order) return 'Customer Name';
  
  // Priority: customerInfo (primary) > shippingAddress.name > user data (fallback)
  if (order.customerInfo?.firstName || order.customerInfo?.lastName) {
    return `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim();
  }
  
  if (order.shippingAddress?.name) {
    return order.shippingAddress.name;
  }
  
  if (order.user?.firstName || order.user?.lastName) {
    return `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim();
  }
  
  return 'Customer Name';
};

/**
 * Formats shipping address into exactly two lines
 * @param {Object} order - Order object containing shipping address
 * @returns {Object} - Object with line1 (street) and line2 (city, state, zip, country)
 */
export const formatShippingAddress = (order) => {
  if (!order?.shippingAddress) {
    return {
      line1: 'Street Address',
      line2: 'City, State, ZIP, Country'
    };
  }
  
  const { street, city, state, zipCode, country } = order.shippingAddress;
  
  // Line 1: Street Address
  const line1 = street || 'Street Address';
  
  // Line 2: City, State, ZIP, Country (filter out empty values)
  const addressParts = [city, state, zipCode, country].filter(Boolean);
  const line2 = addressParts.length > 0 ? addressParts.join(', ') : 'City, State, ZIP, Country';
  
  return { line1, line2 };
};

/**
 * Gets customer contact information (phone or email)
 * @param {Object} order - Order object containing customer contact info
 * @returns {string} - Formatted contact information
 */
export const formatCustomerContact = (order) => {
  if (!order) return 'Contact Information';
  
  // Priority: customerInfo (primary) > shippingAddress > user data (fallback)
  return (
    order.customerInfo?.phone ||
    order.customerInfo?.email ||
    order.shippingAddress?.phone ||
    order.user?.phone ||
    order.user?.email ||
    'Contact Information'
  );
};

/**
 * Formats complete shipping information for professional display
 * @param {Object} order - Order object
 * @returns {Object} - Complete formatted shipping information
 */
export const formatShippingInfo = (order) => {
  return {
    name: formatCustomerName(order),
    address: formatShippingAddress(order),
    contact: formatCustomerContact(order)
  };
};

/**
 * Formats billing address into exactly two lines
 * @param {Object} order - Order object containing billing address
 * @returns {Object} - Object with line1 (street) and line2 (city, state, zip, country)
 */
export const formatBillingAddress = (order) => {
  if (!order?.billingAddress) {
    // Fallback to shipping address if no billing address
    return formatShippingAddress(order);
  }
  
  const { street, city, state, zipCode, country } = order.billingAddress;
  
  // Line 1: Street Address
  const line1 = street || 'Street Address';
  
  // Line 2: City, State, ZIP, Country (filter out empty values)
  const addressParts = [city, state, zipCode, country].filter(Boolean);
  const line2 = addressParts.length > 0 ? addressParts.join(', ') : 'City, State, ZIP, Country';
  
  return { line1, line2 };
};

/**
 * Gets billing contact name
 * @param {Object} order - Order object containing billing information
 * @returns {string} - Formatted billing contact name
 */
export const formatBillingName = (order) => {
  if (!order) return 'Billing Contact';
  
  // Priority: billingAddress.name > paymentInfo.cardName > customer name
  return (
    order.billingAddress?.name ||
    order.paymentInfo?.cardName ||
    formatCustomerName(order)
  );
};