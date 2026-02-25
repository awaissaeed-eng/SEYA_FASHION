import { motion } from 'framer-motion';
import { ArrowRight, CreditCard, Lock, ChevronRight, User, Mail, MapPin, Phone, Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cartService } from '../../services/cart';
import { taxService } from '../../services/tax';
import { paymentService, fraudPrevention } from '../../services/payment';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import UserLayout from '../../components/user/UserLayout';
import ValidatedInput from '../../components/ValidatedInput';
import { validateForm } from '../../utils/inputValidation';
import { calculateCartTotals, formatCurrency } from '../../utils/taxCalculator';
import { handleApiError } from '../../utils/errorHandler';
import { tw } from '../../config/theme';

// Payment processing states
const PAYMENT_STATES = {
  FORM: 'form',
  TOKENIZING: 'tokenizing',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

export default function Billing() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutData = location.state?.checkoutData || {};
  const paymentMethod = location.state?.paymentMethod || 'card';
  
  // Payment processing state
  const [paymentState, setPaymentState] = useState(PAYMENT_STATES.FORM);
  const [paymentResult, setPaymentResult] = useState(null);
  const [processingMessage, setProcessingMessage] = useState('');
  
  const [billingInfo, setBillingInfo] = useState({
    // Card fields
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    // Wallet fields
    mobileNumber: '',
    otpReference: '',
    // Billing address fields
    billingAddress: checkoutData.address || '',
    billingCity: checkoutData.city || '',
    billingState: checkoutData.state || '',
    billingZip: checkoutData.zip || '',
    billingCountry: checkoutData.country || 'Pakistan',
    saveCard: false,
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [fieldValidation, setFieldValidation] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({});

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
  }, []);
  
  const cartTotals = calculateCartTotals(cartItems, gstSettings);

  // Validation rules - dynamic based on payment method
  const validationRules = {
    // Card payment fields
    ...(paymentMethod === 'card' && {
      cardNumber: { type: 'cardNumber', required: true },
      cardName: { type: 'fullName', required: true },
      expiryDate: { type: 'cardExpiry', required: true },
      cvv: { type: 'cvv', required: true },
    }),
    // Wallet payment fields
    ...(paymentMethod !== 'card' && {
      mobileNumber: { type: 'phone', required: true, country: 'Pakistan' },
      otpReference: { type: 'text', required: true, minLength: 4 },
    }),
    // Billing address fields (common for all payment methods)
    billingAddress: { type: 'address', required: !sameAsShipping },
    billingCity: { type: 'cityState', required: !sameAsShipping },
    billingState: { type: 'cityState', required: false },
    billingZip: { type: 'postalCode', required: false, country: billingInfo.billingCountry },
  };

  const handleInputChange = useCallback((name, value) => {
    setBillingInfo(prev => ({
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

  // Check form validity - dynamic based on payment method
  useEffect(() => {
    let requiredFields = [];
    
    // Add required fields based on payment method
    if (paymentMethod === 'card') {
      requiredFields = ['cardNumber', 'cardName', 'expiryDate', 'cvv'];
    } else {
      requiredFields = ['mobileNumber', 'otpReference'];
    }
    
    // Add billing address fields only if not same as shipping
    if (!sameAsShipping) {
      requiredFields.push('billingAddress', 'billingCity');
    }
    
    const allRequiredValid = requiredFields.every(field => {
      const hasValue = billingInfo[field] && billingInfo[field].trim();
      const isFieldValid = fieldValidation[field];
      return hasValue && (isFieldValid !== false); // Allow undefined (not yet validated) or true
    });
    
    setIsFormValid(allRequiredValid);
  }, [fieldValidation, billingInfo, sameAsShipping, paymentMethod]);

  // Update billing address when "same as shipping" changes
  useEffect(() => {
    if (sameAsShipping) {
      setBillingInfo(prev => ({
        ...prev,
        billingAddress: checkoutData.address || '',
        billingCity: checkoutData.city || '',
        billingState: checkoutData.state || '',
        billingZip: checkoutData.zip || '',
        billingCountry: checkoutData.country || 'Pakistan',
      }));
    }
  }, [sameAsShipping, checkoutData]);

  // Secure payment processing function
  const processSecurePayment = async (paymentData) => {
    try {
      setPaymentState(PAYMENT_STATES.TOKENIZING);
      setProcessingMessage('Securing your payment information...');

      // Step 1: Tokenize payment data (never send raw card data to backend)
      const tokenResult = await paymentService.tokenizePayment(paymentData, paymentMethod);
      
      setProcessingMessage('Processing your payment...');
      setPaymentState(PAYMENT_STATES.PROCESSING);

      // Step 2: Send tokenized data to backend
      const paymentRequest = {
        orderId: checkoutData.orderId || 'temp_order_' + Date.now(),
        paymentToken: tokenResult.token,
        paymentMethod,
        tokenData: {
          last4: tokenResult.last4,
          cardType: tokenResult.cardType,
          walletType: tokenResult.walletType,
          maskedNumber: tokenResult.maskedNumber
        },
        billingAddress: {
          street: billingInfo.billingAddress,
          city: billingInfo.billingCity,
          state: billingInfo.billingState,
          zipCode: billingInfo.billingZip,
          country: billingInfo.billingCountry
        },
        customerInfo: {
          firstName: checkoutData.firstName,
          lastName: checkoutData.lastName,
          email: checkoutData.email,
          phone: checkoutData.phone
        }
      };

      // Step 3: Initiate payment with backend
      const paymentResponse = await paymentService.initiatePayment(paymentRequest);
      
      setProcessingMessage('Confirming payment...');

      // Step 4: Poll for payment status (simulate real-time updates)
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        try {
          const statusResponse = await paymentService.getPaymentStatus(paymentResponse.data.transactionId);
          
          if (statusResponse.data.status === 'paid') {
            setPaymentState(PAYMENT_STATES.SUCCESS);
            setPaymentResult({
              transactionId: statusResponse.data.transactionId,
              amount: statusResponse.data.amount,
              status: 'paid',
              paymentMethod: statusResponse.data.paymentMethod
            });
            return;
          } else if (statusResponse.data.status === 'failed') {
            throw new Error('Payment was declined by the bank');
          }
        } catch (statusError) {
          if (statusError.message.includes('declined')) {
            throw statusError;
          }
          // Continue polling for other errors
        }
        
        attempts++;
      }
      
      // Timeout - payment still pending
      setPaymentState(PAYMENT_STATES.SUCCESS);
      setPaymentResult({
        transactionId: paymentResponse.data.transactionId,
        amount: paymentResponse.data.amount,
        status: 'pending',
        paymentMethod: paymentResponse.data.paymentMethod
      });

    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentState(PAYMENT_STATES.ERROR);
      setPaymentResult({
        error: error.message || 'Payment processing failed',
        canRetry: true
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (paymentState !== PAYMENT_STATES.FORM) {
      return;
    }
    
    // Final validation
    const { isValid, errors: validationErrors } = validateForm(billingInfo, validationRules);
    
    if (!isValid) {
      setErrors(validationErrors);
      toast.error('Error', 'Please correct the errors in the form');
      return;
    }

    // Fraud prevention checks
    const clientId = checkoutData.email || 'anonymous';
    
    if (!fraudPrevention.checkRateLimit(clientId)) {
      toast.error('Error', 'Too many payment attempts. Please try again later.');
      return;
    }

    if (fraudPrevention.checkDuplicateTransaction(cartTotals.total, Date.now())) {
      toast.error('Error', 'Duplicate transaction detected. Please wait before trying again.');
      return;
    }

    if (!fraudPrevention.validateAmount(cartTotals.total)) {
      toast.error('Error', 'Invalid transaction amount');
      return;
    }

    // Clear errors and proceed with secure payment
    setErrors({});
    
    // Prepare payment data (will be tokenized, never sent raw to backend)
    const paymentData = paymentMethod === 'card' ? {
      cardNumber: billingInfo.cardNumber.replace(/\s/g, ''),
      cardName: billingInfo.cardName,
      expiryDate: billingInfo.expiryDate,
      cvv: billingInfo.cvv,
    } : {
      mobileNumber: billingInfo.mobileNumber,
      otpReference: billingInfo.otpReference,
    };

    await processSecurePayment(paymentData);
  };

  const handleRetryPayment = () => {
    setPaymentState(PAYMENT_STATES.FORM);
    setPaymentResult(null);
    setProcessingMessage('');
  };

  const handleGoToOrders = () => {
    navigate('/orderconfirmation', { 
      state: { 
        paymentResult,
        checkoutData 
      } 
    });
  };

  // Render payment processing states
  if (paymentState === PAYMENT_STATES.TOKENIZING || paymentState === PAYMENT_STATES.PROCESSING) {
    return (
      <UserLayout>
        <div className="py-12">
          <div className="container mx-auto max-w-2xl">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="mb-6">
                <Loader className="w-16 h-16 text-[#bfa77b] animate-spin mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#592a0d] mb-2">Processing Payment</h2>
                <p className="text-gray-600">{processingMessage}</p>
              </div>
              
              <div className="bg-[#f5f1e8] rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 justify-center">
                  <Shield className="w-5 h-5 text-[#bfa77b]" />
                  <span className="text-sm text-[#592a0d]">Your payment is being processed securely</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                Please do not close this window or navigate away from this page.
              </p>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (paymentState === PAYMENT_STATES.SUCCESS) {
    return (
      <UserLayout>
        <div className="py-12">
          <div className="container mx-auto max-w-2xl">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#592a0d] mb-2">
                  {paymentResult?.status === 'paid' ? 'Payment Successful!' : 'Payment Submitted!'}
                </h2>
                <p className="text-gray-600">
                  {paymentResult?.status === 'paid' 
                    ? 'Your payment has been processed successfully.'
                    : 'Your payment is being processed. You will receive a confirmation shortly.'
                  }
                </p>
              </div>
              
              <div className="bg-[#f5f1e8] rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-[#592a0d] mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono">{paymentResult?.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">{formatCurrency(paymentResult?.amount || cartTotals.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="capitalize">{paymentResult?.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-semibold ${
                      paymentResult?.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {paymentResult?.status === 'paid' ? 'Paid' : 'Processing'}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleGoToOrders}
                className="w-full py-4 bg-[#592a0d] text-[#bfa77b] rounded-full hover:bg-[#6d3a18] transition-colors font-medium"
              >
                View Order Details
              </button>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (paymentState === PAYMENT_STATES.ERROR) {
    return (
      <UserLayout>
        <div className="py-12">
          <div className="container mx-auto max-w-2xl">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="mb-6">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#592a0d] mb-2">Payment Failed</h2>
                <p className="text-gray-600 mb-4">{paymentResult?.error}</p>
              </div>
              
              <div className="flex gap-4">
                {paymentResult?.canRetry && (
                  <button
                    onClick={handleRetryPayment}
                    className="flex-1 py-3 bg-[#592a0d] text-[#bfa77b] rounded-full hover:bg-[#6d3a18] transition-colors font-medium"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={() => navigate('/checkout')}
                  className="flex-1 py-3 border border-[#bfa77b] text-[#592a0d] rounded-full hover:bg-[#bfa77b]/10 transition-colors font-medium"
                >
                  Back to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="py-12 px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="container mx-auto max-w-2xl">
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 sm:mb-12"
          >
            {/* Mobile Progress - Simplified */}
            <div className="flex sm:hidden items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-sm text-[#592a0d] font-medium">Step 3 of 4</div>
                <div className="text-lg font-semibold text-[#bfa77b]">Billing</div>
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
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#bfa77b] text-[#592a0d] flex items-center justify-center text-sm sm:text-base">
                  ✓
                </div>
                <span className="text-[#592a0d] text-sm sm:text-base">Checkout</span>
              </div>
              <ChevronRight className="text-[#bfa77b] w-4 h-4 sm:w-5 sm:h-5" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#592a0d] text-[#bfa77b] flex items-center justify-center text-sm sm:text-base">
                  3
                </div>
                <span className="text-[#bfa77b] text-sm sm:text-base">Billing</span>
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
            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
              {/* Billing Form */}
              <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                {/* Payment Information - Dynamic by payment method */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-[#bfa77b]" />
                    <h2 className="text-lg sm:text-xl text-[#bfa77b] font-semibold">
                      Payment Information
                    </h2>
                  </div>

                  {/* Card Payment Fields */}
                  <div className="space-y-4 sm:space-y-6">
                      <ValidatedInput
                        name="cardNumber"
                        value={billingInfo.cardNumber}
                        onChange={handleInputChange}
                        onValidation={handleValidation}
                        validationType="cardNumber"
                        label="Card Number"
                        placeholder="1234 5678 9012 3456"
                        required
                        icon={<CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />}
                      />
                      
                      <ValidatedInput
                        name="cardName"
                        value={billingInfo.cardName}
                        onChange={handleInputChange}
                        onValidation={handleValidation}
                        validationType="fullName"
                        label="Cardholder Name"
                        placeholder="Full name as on card"
                        required
                        icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />}
                      />
                      
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <ValidatedInput
                          name="expiryDate"
                          value={billingInfo.expiryDate}
                          onChange={handleInputChange}
                          onValidation={handleValidation}
                          validationType="cardExpiry"
                          label="Expiry Date"
                          placeholder="MM/YY"
                          required
                        />
                        
                        <ValidatedInput
                          name="cvv"
                          value={billingInfo.cvv}
                          onChange={handleInputChange}
                          onValidation={handleValidation}
                          validationType="cvv"
                          label="CVV"
                          placeholder="123"
                          required
                        />
                      </div>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="saveCard"
                          checked={billingInfo.saveCard}
                          onChange={(e) => handleInputChange('saveCard', e.target.checked)}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-[#bfa77b] border-[#e7dcc8] rounded"
                        />
                        <span className="text-[#592a0d] text-sm sm:text-base">Save card for future purchases</span>
                      </label>
                    </div>
                  
                  {/* Security Notice */}
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#f5f1e8] rounded-lg flex items-start gap-2 sm:gap-3">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#bfa77b] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[#592a0d] text-xs sm:text-sm">
                        Your payment information is encrypted and secure. We never store your full card details.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Billing Address */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg"
                >
                  <h3 className="text-lg sm:text-xl text-[#bfa77b] font-semibold mb-4 sm:mb-6">Billing Address</h3>

                  <label className="flex items-center gap-3 cursor-pointer mb-4 sm:mb-6">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-[#bfa77b] border-[#e7dcc8] rounded"
                    />
                    <span className="text-[#592a0d] text-sm sm:text-base">Same as shipping address</span>
                  </label>

                  <div className="space-y-4 sm:space-y-6 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4 md:gap-6">
                    <div className="sm:col-span-1 md:col-span-2">
                      <ValidatedInput
                        name="billingAddress"
                        value={billingInfo.billingAddress}
                        onChange={handleInputChange}
                        onValidation={handleValidation}
                        validationType="address"
                        label="Street Address"
                        placeholder="Enter billing address"
                        required
                        disabled={sameAsShipping}
                        icon={<MapPin className="w-4 h-4 sm:w-5 sm:h-5" />}
                      />
                    </div>
                    
                    <ValidatedInput
                      name="billingCity"
                      value={billingInfo.billingCity}
                      onChange={handleInputChange}
                      onValidation={handleValidation}
                      validationType="cityState"
                      label="City"
                      placeholder="Enter city"
                      required
                      disabled={sameAsShipping}
                    />
                    
                    <ValidatedInput
                      name="billingState"
                      value={billingInfo.billingState}
                      onChange={handleInputChange}
                      onValidation={handleValidation}
                      validationType="cityState"
                      label="State/Province"
                      placeholder="Enter state (optional)"
                      disabled={sameAsShipping}
                    />
                    
                    <ValidatedInput
                      name="billingZip"
                      value={billingInfo.billingZip}
                      onChange={handleInputChange}
                      onValidation={handleValidation}
                      validationType="postalCode"
                      country={billingInfo.billingCountry}
                      label="ZIP/Postal Code"
                      placeholder="Enter ZIP code (optional)"
                      disabled={sameAsShipping}
                    />
                    
                    <div>
                      <label className="block text-[#592a0d] font-medium mb-2 text-sm sm:text-base">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="billingCountry"
                        value={billingInfo.billingCountry}
                        onChange={(e) => handleInputChange('billingCountry', e.target.value)}
                        disabled={sameAsShipping}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none text-[#592a0d] text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="Pakistan">Pakistan</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="UAE">UAE</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
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
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg sticky top-24">
                  <h3 className="text-lg sm:text-xl text-[#bfa77b] font-semibold mb-4 sm:mb-6">Order Summary</h3>

                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex justify-between text-[#592a0d] text-sm sm:text-base">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartTotals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#592a0d] text-sm sm:text-base">
                      <span>Shipping</span>
                      <span>{cartTotals.shippingAmount === 0 ? 'FREE' : formatCurrency(cartTotals.shippingAmount)}</span>
                    </div>
                    {cartTotals.gstAmount > 0 && (
                      <div className="flex justify-between text-[#592a0d] text-sm sm:text-base">
                        <span>GST</span>
                        <span>{formatCurrency(cartTotals.gstAmount)}</span>
                      </div>
                    )}
                    <div className="border-t border-[#e7dcc8] pt-3 sm:pt-4">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-[#592a0d] font-medium">Total</span>
                        <span className="text-[#bfa77b] font-semibold">
                          {formatCurrency(cartTotals.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Icons */}
                  <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-[#e7dcc8]">
                    <p className="text-[#592a0d] text-xs sm:text-sm mb-2 sm:mb-3">We accept:</p>
                    <div className="flex gap-2 sm:gap-3 text-xl sm:text-2xl">
                      <span title="Credit/Debit Cards">💳</span>
                    </div>
                  </div>

                  {/* Complete Payment Button */}
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`w-full py-3 sm:py-4 rounded-full transition-all flex items-center justify-center gap-2 mb-3 sm:mb-4 font-medium text-sm sm:text-base ${
                      isFormValid 
                        ? 'bg-[#592a0d] text-[#bfa77b] hover:bg-[#6d3a18] cursor-pointer' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Complete Payment
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {!isFormValid && (
                    <div className="text-center text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      <p>Please fill in all required fields to complete payment</p>
                      <p className="text-xs mt-1">
                        Required: Card Number, Cardholder Name, Expiry Date, CVV
                        {!sameAsShipping && ', Billing Address'}
                      </p>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="flex items-center justify-center gap-2 text-[#592a0d]/60 text-xs sm:text-sm mb-3 sm:mb-4">
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Secure 256-bit SSL encryption</span>
                  </div>

                  {/* Terms */}
                  <p className="text-[#592a0d]/60 text-xs text-center">
                    By completing your purchase, you agree to our Terms of Service and Privacy Policy. 
                    Your payment is processed securely through PCI-compliant channels.
                  </p>
                </div>
              </motion.div>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}