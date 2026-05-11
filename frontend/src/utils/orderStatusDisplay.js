/**
 * Order Status Display Utilities
 * UI-only helpers for displaying order statuses
 * 
 * IMPORTANT: This file contains ONLY display logic (colors, labels, icons).
 * Business logic (status transitions, validation) is in backend only.
 * Never duplicate business rules here - always fetch from backend API.
 */

// Order status constants (for reference only)
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

/**
 * Get status display information for UI
 * @param {string} status - Order status
 * @returns {object} Display information (label, color, icon, description)
 */
export const getStatusInfo = (status) => {
  const statusInfo = {
    [ORDER_STATUSES.PENDING]: {
      label: 'Pending',
      color: 'bg-[#bfa77b] text-[#592a0d]',
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: '⏳',
      description: 'Order received, awaiting processing'
    },
    [ORDER_STATUSES.PROCESSING]: {
      label: 'Processing',
      color: 'bg-[#d4a574] text-[#592a0d]',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: '⚙️',
      description: 'Order is being prepared'
    },
    [ORDER_STATUSES.SHIPPED]: {
      label: 'Shipped',
      color: 'bg-blue-500 text-white',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: '🚚',
      description: 'Order has been shipped'
    },
    [ORDER_STATUSES.COMPLETED]: {
      label: 'Completed',
      color: 'bg-[#592a0d] text-white',
      badgeClass: 'bg-green-100 text-green-800 border-green-300',
      icon: '✅',
      description: 'Order delivered and completed'
    },
    [ORDER_STATUSES.CANCELLED]: {
      label: 'Cancelled',
      color: 'bg-gray-400 text-white',
      badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: '❌',
      description: 'Order has been cancelled'
    }
  };

  return statusInfo[status] || {
    label: status,
    color: 'bg-gray-200 text-gray-800',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-300',
    icon: '📦',
    description: 'Unknown status'
  };
};

/**
 * Get status badge component props
 * @param {string} status - Order status
 * @returns {object} Props for badge component
 */
export const getStatusBadgeProps = (status) => {
  const info = getStatusInfo(status);
  return {
    label: info.label,
    className: info.badgeClass,
    icon: info.icon
  };
};

/**
 * Get status color class for Tailwind
 * @param {string} status - Order status
 * @returns {string} Tailwind color classes
 */
export const getStatusColor = (status) => {
  const info = getStatusInfo(status);
  return info.color;
};

/**
 * Get status icon
 * @param {string} status - Order status
 * @returns {string} Emoji icon
 */
export const getStatusIcon = (status) => {
  const info = getStatusInfo(status);
  return info.icon;
};

/**
 * Get status label (human-readable)
 * @param {string} status - Order status
 * @returns {string} Display label
 */
export const getStatusLabel = (status) => {
  const info = getStatusInfo(status);
  return info.label;
};

/**
 * Get status description
 * @param {string} status - Order status
 * @returns {string} Status description
 */
export const getStatusDescription = (status) => {
  const info = getStatusInfo(status);
  return info.description;
};
