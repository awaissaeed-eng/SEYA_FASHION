import { formatShippingInfo, formatBillingAddress, formatBillingName } from '../utils/addressFormatter';

/**
 * Professional address display component for consistent formatting
 * @param {Object} props - Component props
 * @param {Object} props.order - Order object containing address information
 * @param {string} props.type - Address type: 'shipping' or 'billing'
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showContact - Whether to show contact information
 */
const AddressDisplay = ({ 
  order, 
  type = 'shipping', 
  className = '', 
  showContact = true 
}) => {
  if (!order) {
    return (
      <div className={`text-gray-500 ${className}`}>
        <p>No address information available</p>
      </div>
    );
  }

  if (type === 'shipping') {
    const shippingInfo = formatShippingInfo(order);
    
    return (
      <div className={`text-[#592a0d] leading-relaxed ${className}`}>
        {/* Customer Name */}
        <p className="font-semibold text-lg mb-3">
          {shippingInfo.name}
        </p>
        
        {/* Address - Exactly Two Lines */}
        <div className="mb-3 space-y-1">
          <p className="text-base">{shippingInfo.address.line1}</p>
          <p className="text-base">{shippingInfo.address.line2}</p>
        </div>
        
        {/* Customer Contact */}
        {showContact && (
          <p className="text-base pt-2 border-t border-[#e7dcc8]">
            {shippingInfo.contact}
          </p>
        )}
      </div>
    );
  }

  if (type === 'billing') {
    const billingName = formatBillingName(order);
    const billingAddress = formatBillingAddress(order);
    
    return (
      <div className={`text-[#592a0d] leading-relaxed ${className}`}>
        {/* Billing Name */}
        <p className="font-semibold text-lg mb-3">
          {billingName}
        </p>
        
        {/* Address - Exactly Two Lines */}
        <div className="mb-3 space-y-1">
          <p className="text-base">{billingAddress.line1}</p>
          <p className="text-base">{billingAddress.line2}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AddressDisplay;