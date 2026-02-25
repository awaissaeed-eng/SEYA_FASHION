/**
 * Order Status Management Rules
 * Defines strict transition rules for order status changes
 */

// Available order statuses
const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Terminal states that cannot be changed
const TERMINAL_STATES = [ORDER_STATUSES.COMPLETED, ORDER_STATUSES.CANCELLED];

// Valid status transitions
const STATUS_TRANSITIONS = {
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
const getValidNextStatuses = (currentStatus) => {
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
const isValidTransition = (currentStatus, newStatus) => {
  const validNextStatuses = getValidNextStatuses(currentStatus);
  return validNextStatuses.includes(newStatus);
};

/**
 * Check if a status is terminal (cannot be changed)
 * @param {string} status - Order status to check
 * @returns {boolean} True if status is terminal
 */
const isTerminalStatus = (status) => {
  return TERMINAL_STATES.includes(status);
};

/**
 * Validate status transition and return error message if invalid
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Desired new status
 * @returns {object} { valid: boolean, error?: string }
 */
const validateStatusTransition = (currentStatus, newStatus) => {
  // Check if current status is terminal
  if (isTerminalStatus(currentStatus)) {
    return {
      valid: false,
      error: `Cannot change status from ${currentStatus}. This order has reached a terminal state.`
    };
  }

  // Check if new status is valid
  if (!Object.values(ORDER_STATUSES).includes(newStatus)) {
    return {
      valid: false,
      error: `Invalid status: ${newStatus}. Valid statuses are: ${Object.values(ORDER_STATUSES).join(', ')}`
    };
  }

  // Check if transition is allowed
  if (!isValidTransition(currentStatus, newStatus)) {
    const validNext = getValidNextStatuses(currentStatus);
    return {
      valid: false,
      error: `Invalid transition from ${currentStatus} to ${newStatus}. Valid next statuses: ${validNext.length > 0 ? validNext.join(', ') : 'none (terminal state)'}`
    };
  }

  return { valid: true };
};

/**
 * Get status display information
 * @param {string} status - Order status
 * @returns {object} Display information for the status
 */
const getStatusInfo = (status) => {
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

module.exports = {
  ORDER_STATUSES,
  TERMINAL_STATES,
  STATUS_TRANSITIONS,
  getValidNextStatuses,
  isValidTransition,
  isTerminalStatus,
  validateStatusTransition,
  getStatusInfo
};