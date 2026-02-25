/**
 * Frontend Order Status Management Rules
 * Mirrors backend validation rules for consistent UX
 */

// Available order statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Terminal states that cannot be changed
export const TERMINAL_STATES = [ORDER_STATUSES.COMPLETED, ORDER_STATUSES.CANCELLED];

// Valid status transitions
export const STATUS_TRANSITIONS = {
  [ORDER_STATUSES.PENDING]: [ORDER_STATUSES.PROCESSING, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.PROCESSING]: [ORDER_STATUSES.SHIPPED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.SHIPPED]: [ORDER_STATUSES.COMPLETED],
  [ORDER_STATUSES.COMPLETED]: [], // Terminal state
  [ORDER_STATUSES.CANCELLED]: []  // Terminal state
};

/**
 * Get valid next statuses for a given current status
 * @param {string} currentStatus - Current order status
 * @returns {string[]} Array of valid next statuses
 */
export const getValidNextStatuses = (currentStatus) => {
  if (!currentStatus || !STATUS_TRANSITIONS[currentStatus]) {
    return [];
  }
  return STATUS_TRANSITIONS[currentStatus];
};

/**
 * Check if a status transition is valid
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Desired new status
 * @returns {boolean} True if transition is valid
 */
export const isValidTransition = (currentStatus, newStatus) => {
  const validNextStatuses = getValidNextStatuses(currentStatus);
  return validNextStatuses.includes(newStatus);
};

/**
 * Check if a status is terminal (cannot be changed)
 * @param {string} status - Order status to check
 * @returns {boolean} True if status is terminal
 */
export const isTerminalStatus = (status) => {
  return TERMINAL_STATES.includes(status);
};

/**
 * Get status display information
 * @param {string} status - Order status
 * @returns {object} Display information for the status
 */
export const getStatusInfo = (status) => {
  const statusInfo = {
    [ORDER_STATUSES.PENDING]: {
      label: 'Pending',
      color: 'bg-[#bfa77b] text-[#592a0d]',
      icon: '⏳',
      description: 'Order received, awaiting processing'
    },
    [ORDER_STATUSES.PROCESSING]: {
      label: 'Processing',
      color: 'bg-[#d4a574] text-[#592a0d]',
      icon: '⚙️',
      description: 'Order is being prepared'
    },
    [ORDER_STATUSES.SHIPPED]: {
      label: 'Shipped',
      color: 'bg-blue-500 text-white',
      icon: '🚚',
      description: 'Order has been shipped'
    },
    [ORDER_STATUSES.COMPLETED]: {
      label: 'Completed',
      color: 'bg-[#592a0d] text-white',
      icon: '✅',
      description: 'Order delivered and completed'
    },
    [ORDER_STATUSES.CANCELLED]: {
      label: 'Cancelled',
      color: 'bg-gray-400 text-white',
      icon: '❌',
      description: 'Order has been cancelled'
    }
  };

  return statusInfo[status] || {
    label: status,
    color: 'bg-gray-200 text-gray-800',
    icon: '📦',
    description: 'Unknown status'
  };
};