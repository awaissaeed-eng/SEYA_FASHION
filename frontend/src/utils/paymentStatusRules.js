// Payment status utility functions

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed'
};

export const getPaymentStatusInfo = (status) => {
  const statusMap = {
    [PAYMENT_STATUS.PENDING]: {
      label: 'Pending',
      icon: '⏳',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      description: 'Payment is being processed'
    },
    [PAYMENT_STATUS.PAID]: {
      label: 'Paid',
      icon: '✅',
      color: 'bg-green-100 text-green-800 border-green-200',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      description: 'Payment completed successfully'
    },
    [PAYMENT_STATUS.FAILED]: {
      label: 'Failed',
      icon: '❌',
      color: 'bg-red-100 text-red-800 border-red-200',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      description: 'Payment failed or was declined'
    }
  };

  return statusMap[status] || statusMap[PAYMENT_STATUS.PENDING];
};

export const getPaymentMethodInfo = (paymentMethod, paymentInfo = {}) => {
  const methodMap = {
    card: {
      label: 'Card',
      icon: '💳',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      details: paymentInfo.last4Digits ? `****${paymentInfo.last4Digits}` : 'Card Payment'
    }
  };

  return methodMap[paymentMethod] || methodMap.card;
};

export const formatPaymentDate = (date) => {
  if (!date) return 'Not paid yet';
  
  const paymentDate = new Date(date);
  const now = new Date();
  const diffInHours = (now - paymentDate) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return paymentDate.toLocaleString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' today';
  } else if (diffInHours < 48) {
    return paymentDate.toLocaleString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' yesterday';
  } else {
    return paymentDate.toLocaleString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
};

export const getPaymentGatewayInfo = (gateway) => {
  const gatewayMap = {
    'Meezan Bank': {
      label: 'Meezan Bank',
      icon: '🏦',
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  };

  return gatewayMap[gateway] || gatewayMap['Meezan Bank'];
};