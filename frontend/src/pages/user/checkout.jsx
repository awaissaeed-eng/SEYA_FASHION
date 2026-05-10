import { motion } from 'framer-motion';
import { ArrowRight, CreditCard, Truck, Lock, ChevronRight, User, Mail, Phone, MapPin } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cartService } from '../../services/cart';
import { taxService } from '../../services/tax';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../../components/user/UserLayout';
import ValidatedInput from '../../components/ValidatedInput';
import { validateForm } from '../../utils/inputValidation';
import { calculateCartTotals, formatCurrency } from '../../utils/taxCalculator';

export default function Checkout() {
  const navigate = useNavigate();
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [errors, setErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [gstSettings, setGstSettings] = useState({ gstPercentage: 0, isEnabled: false });
  
  useEffect(() => {
    async function fetchCart() {
      const res = await cartService.getCart();
      setCartItems(res.data.cart.items || []);
    }
    
    async function fetchGstSettings() {
      try {
        const res = await taxService.getTaxSettings();
        setGstSettings(res.gstSettings || res.taxSettings);
      } catch (err) {
        console.error('Failed to load GST settings:', err);
      }
    }
    
    fetchCart();
    fetchGstSettings();

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);
  
  const cartTotals = calculateCartTotals(cartItems, gstSettings);

  // Validation rules
  const validationRules = {
    firstName: { type: 'fullName', required: true },
    lastName: { type: 'fullName', required: false },
    email: { type: 'email', required: !shippingInfo.phone },
    phone: { type: 'phone', required: !shippingInfo.email, country: shippingInfo.country },
    address: { type: 'address', required: true },
    city: { type: 'cityState', required: true },
    state: { type: 'cityState', required: false },
    zipCode: { type: 'postalCode', required: false, country: shippingInfo.country },
  };

  const handleInputChange = useCallback((name, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleValidation = useCallback((fieldName, isValid) => {
    setFieldValidation(prev => ({
      ...prev,
      [fieldName]: isValid
    }));
  }, []);

  // Check form validity
  useEffect(() => {
    const requiredFields = Object.keys(validationRules).filter(field => 
      validationRules[field].required || 
      (field === 'email' && !shippingInfo.phone) ||
      (field === 'phone' && !shippingInfo.email)
    );
    
    const allRequiredValid = requiredFields.every(field => 
      fieldValidation[field] && shippingInfo[field].trim()
    );
    
    setIsFormValid(allRequiredValid);
  }, [fieldValidation, shippingInfo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Final validation
    const { isValid, errors: validationErrors } = validateForm(shippingInfo, validationRules);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    // Clear errors and proceed
    setErrors({});
    
    const checkoutData = {
      address: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zip: shippingInfo.zipCode,
      country: shippingInfo.country,
      firstName: shippingInfo.firstName,
      lastName: shippingInfo.lastName,
      email: shippingInfo.email,
      phone: shippingInfo.phone,
    };
    
    navigate('/billing', { state: { checkoutData, paymentMethod } });
  };

  return (
    <UserLayout>
      <div className="py-8 sm:py-10 md:py-12">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 sm:mb-12"
          >
            {/* Mobile Progress - Simplified */}
            <div className="flex sm:hidden items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-sm text-[#592a0d] font-medium">Step 2 of 4</div>
                <div className="text-lg font-semibold text-[#bfa77b]">Checkout</div>
              </div>
            </div>
            
            {/* Desktop Progress - Full */}
            <div className="hidden sm:flex items-center justify-center gap-2 md:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#bfa77b] text-[#592a0d] flex items-center justify-center text-sm sm:text-base">
                  ✓
                </div>
                <span className="text-[#592a0d] text-sm sm:text-base">Cart</span>
              </div>
              <ChevronRight className="text-[#bfa77b] w-4 h-4 sm:w-5 sm:h-5" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#592a0d] text-[#bfa77b] flex items-center justify-center text-sm sm:text-base">
                  2
                </div>
                <span className="text-[#bfa77b] text-sm sm:text-base">Checkout</span>
              </div>
              <ChevronRight className="text-[#bfa77b]/30 w-4 h-4 sm:w-5 sm:h-5" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#e7dcc8] text-[#592a0d] flex items-center justify-center text-sm sm:text-base">
                  3
                </div>
                <span className="text-[#592a0d]/50 text-sm sm:text-base">Billing</span>
              </div>
              <ChevronRight className="text-[#bfa77b]/30 w-4 h-4 sm:w-5 sm:h-5" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#e7dcc8] text-[#592a0d] flex items-center justify-center text-sm sm:text-base">
                  4
                </div>
                <span className="text-[#592a0d]/50 text-sm sm:text-base">Confirmation</span>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 sm:space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6 xl:gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Shipping Information */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#bfa77b]" />
                    <h2 className="text-lg sm:text-xl text-[#bfa77b] font-semibold">Shipping Information</h2>
                  </div>

                  <div className="space-y-4 sm:space-y-6 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4 md:gap-6">
                    <ValidatedInput
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                      onValidation={handleValidation}
                      validationType="fullName"
                      label="First Name"
                      placeholder="Enter your first name"
                      required
                      icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />}
                    />
                    
                    <ValidatedInput
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
                      onValidation={handleValidation}
                      validationType="fullName"
                      label="Last Name"
                      placeholder="Enter your last name (optional)"
                      icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />}
                    />
                    
                    <ValidatedInput
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      onValidation={handleValidation}
                      validationType="email"
                      label={`Email ${shippingInfo.phone ? '(optional)' : ''}`}
                      placeholder="Enter your email address"
                      required={!shippingInfo.phone}
                      icon={<Mail className="w-4 h-4 sm:w-5 sm:h-5" />}
                    />
                    
                    <ValidatedInput
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      onValidation={handleValidation}
                      validationType="phone"
                      country={shippingInfo.country}
                      label={`Phone ${shippingInfo.email ? '(optional)' : ''}`}
                      placeholder="Enter your phone number"
                      required={!shippingInfo.email}
                      icon={<Phone className="w-4 h-4 sm:w-5 sm:h-5" />}
                    />
                    
                    <div className="sm:col-span-1 md:col-span-2">
                      <ValidatedInput
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        onValidation={handleValidation}
                        validationType="address"
                        label="Street Address"
                        placeholder="Enter your full address"
                        required
                        icon={<MapPin className="w-4 h-4 sm:w-5 sm:h-5" />}
                      />
                    </div>
                    
                    <ValidatedInput
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      onValidation={handleValidation}
                      validationType="cityState"
                      label="City"
                      placeholder="Enter your city"
                      required
                    />
                    
                    <ValidatedInput
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                      onValidation={handleValidation}
                      validationType="cityState"
                      label="State/Province"
                      placeholder="Enter your state (optional)"
                    />
                    
                    <ValidatedInput
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleInputChange}
                      onValidation={handleValidation}
                      validationType="postalCode"
                      country={shippingInfo.country}
                      label="ZIP/Postal Code"
                      placeholder="Enter ZIP code (optional)"
                    />
                    
                    <div>
                      <label className="block text-[#592a0d] font-medium mb-2 text-sm sm:text-base">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="country"
                        value={shippingInfo.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none text-[#592a0d] text-sm sm:text-base"
                      >
                        <option value="Pakistan">Pakistan</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="UAE">UAE</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="China">China</option>
                        <option value="India">India</option>
                        <option value="Turkey">Turkey</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Italy">Italy</option>
                        <option value="Spain">Spain</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Indonesia">Indonesia</option>
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="Japan">Japan</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Brazil">Brazil</option>
                        <option value="Russia">Russia</option>
                        <option value="Mexico">Mexico</option>
                        <option value="Egypt">Egypt</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Thailand">Thailand</option>
                        <option value="Philippines">Philippines</option>
                        <option value="Vietnam">Vietnam</option>
                        <option value="Ukraine">Ukraine</option>
                        <option value="Poland">Poland</option>
                        <option value="Sweden">Sweden</option>
                        <option value="Norway">Norway</option>
                        <option value="Denmark">Denmark</option>
                        <option value="Finland">Finland</option>
                        <option value="Ireland">Ireland</option>
                        <option value="Switzerland">Switzerland</option>
                        <option value="Netherlands">Netherlands</option>
                        <option value="Belgium">Belgium</option>
                        <option value="Austria">Austria</option>
                        <option value="Greece">Greece</option>
                        <option value="New Zealand">New Zealand</option>
                      </select>
                      {errors.country && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span>{errors.country}
                      </p>}
                    </div>
                  </div>
                </motion.div>

                {/* Removed Shipping Method Section */}

                {/* Payment Method Selection */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-[#bfa77b]" />
                    <h3 className="text-lg sm:text-xl text-[#bfa77b] font-semibold">Payment Method</h3>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Credit/Debit Card */}
                    <label
                      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#bfa77b] bg-[#f5f1e8]'
                          : 'border-[#e7dcc8] hover:border-[#bfa77b]/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-[#bfa77b]"
                      />
                      <span className="text-xl sm:text-2xl">💳</span>
                      <span className="text-[#592a0d] text-sm sm:text-base font-medium">Credit / Debit Card</span>
                    </label>
                  </div>
                </motion.div>
              </div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg sticky top-24">
                  <h3 className="text-[#bfa77b] mb-6">Order Summary</h3>

                  {/* Order Items */}
                  <div className="space-y-4 mb-6 pb-6 border-b border-[#e7dcc8]">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="text-[#592a0d]">{item.product?.name}</p>
                          <p className="text-[#592a0d]/60">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-[#592a0d]">
                          Rs. {(item.product?.price * item.quantity).toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-[#592a0d]">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartTotals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#592a0d]">
                      <span>Shipping</span>
                      <span>{cartTotals.shippingAmount === 0 ? 'FREE' : formatCurrency(cartTotals.shippingAmount)}</span>
                    </div>
                    {cartTotals.gstAmount > 0 && (
                      <div className="flex justify-between text-[#592a0d]">
                        <span>GST</span>
                        <span>{formatCurrency(cartTotals.gstAmount)}</span>
                      </div>
                    )}
                    <div className="border-t border-[#e7dcc8] pt-4">
                      <div className="flex justify-between">
                        <span className="text-[#592a0d]">Total</span>
                        <span className="text-[#bfa77b]">{formatCurrency(cartTotals.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`w-full py-4 rounded-full transition-all flex items-center justify-center gap-2 mb-4 font-medium ${
                      isFormValid 
                        ? 'bg-[#592a0d] text-[#bfa77b] hover:bg-[#6d3a18] cursor-pointer' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue to Billing
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {!isFormValid && (
                    <p className="text-center text-sm text-gray-500 mb-4">
                      Please fill in all required fields correctly to continue
                    </p>
                  )}

                  {/* Security Notice */}
                  <div className="flex items-center justify-center gap-2 text-[#592a0d]/60 text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Secure SSL Encryption</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}
