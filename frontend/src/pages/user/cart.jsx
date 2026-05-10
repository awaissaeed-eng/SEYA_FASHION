import { motion } from 'motion/react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Ruler } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { optimizedCartService } from '../../services/optimizedCart';
import { cachedTaxService } from '../../services/cachedServices';
import UserLayout from '../../components/user/UserLayout';
import CustomSizeDisplay from '../../components/user/CustomSizeDisplay';
import { getImageUrl } from '../../utils/imageUrl';
import { calculateCartTotals, formatCurrency } from '../../utils/taxCalculator';


export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gstSettings, setGstSettings] = useState({ gstPercentage: 0, isEnabled: false });
  

  const fetchCart = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      // If forceRefresh, invalidate cache first
      if (forceRefresh) {
        optimizedCartService.invalidateCache();
      }
      const res = await optimizedCartService.getCart();
      setCartItems(res.data.cart.items || []);
    } catch (err) {
      setError('Failed to load cart.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchGstSettings() {
      try {
        const res = await cachedTaxService.getTaxSettings();
        setGstSettings(res.gstSettings || res.taxSettings);
      } catch (err) {
        console.error('Failed to load GST settings:', err);
      }
    }
    
    // Always fetch fresh data when cart page loads
    fetchCart(true);
    fetchGstSettings();

    // Listen for cart updates from other components - force refresh
    const handleCartUpdate = () => fetchCart(true);
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Also refresh when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCart(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchCart]);

  // Get available stock for a cart item
  const getItemStock = (item) => {
    if (item.size && item.product?.sizes && Array.isArray(item.product.sizes)) {
      const sizeObj = item.product.sizes.find(s => s.size === item.size);
      return sizeObj ? sizeObj.quantity : 0;
    }
    return item.product?.stock || 0;
  };

  const updateQuantity = useCallback(async (itemKey, change) => {
    // Parse the itemKey to get product info
    const item = cartItems.find((i, idx) => {
      const key = `${i.product?._id || i.product}-${i.size}-${i.color}-${idx}`;
      return key === itemKey;
    });
    
    if (!item) return;
    const newQty = Math.max(1, item.quantity + change);
    const availableStock = getItemStock(item);
    
    // Don't allow increase beyond stock
    if (newQty > availableStock) return;
    
    try {
      const res = await optimizedCartService.updateCartItem({
        productId: item.product._id || item.product,
        quantity: newQty,
        size: item.size,
        color: item.color
      });
      setCartItems(res.data.cart.items || []);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      setError('Failed to update quantity.');
    }
  }, [cartItems]);

  const removeItem = useCallback(async (itemKey) => {
    // Parse the itemKey to get product info
    const item = cartItems.find((i, idx) => {
      const key = `${i.product?._id || i.product}-${i.size}-${i.color}-${idx}`;
      return key === itemKey;
    });
    
    if (!item) return;
    try {
      const res = await optimizedCartService.removeCartItem({
        productId: item.product._id || item.product,
        size: item.size,
        color: item.color
      });
      setCartItems(res.data.cart.items || []);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      setError('Failed to remove item.');
    }
  }, [cartItems]);

  const cartTotals = calculateCartTotals(cartItems, gstSettings);

  // Navigation function for buttons
  const navigate = (page) => {
    window.location.href = page === 'shop' ? '/shop' : '/checkout';
  };

  return (
    <UserLayout>
      <div className="py-8 sm:py-10 md:py-12">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#bfa77b] mb-2">Shopping Cart</h1>
            <p className="text-[#592a0d] text-sm sm:text-base">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20">Loading cart...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-600">{error}</div>
          ) : cartItems.length === 0 ? (
            // Empty Cart State
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <ShoppingBag className="w-24 h-24 text-[#bfa77b] mx-auto mb-6" />
              <h2 className="text-[#bfa77b] mb-4">Your cart is empty</h2>
              <p className="text-[#592a0d] mb-8">Add some beautiful items to get started!</p>
              <button
                onClick={() => navigate('shop')}
                className="bg-[#592a0d] text-[#bfa77b] px-8 py-3 rounded-full glow-gold-hover transition-all inline-flex items-center gap-2"
              >
                Continue Shopping
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                {cartItems.map((item, index) => {
                  // Generate unique key for cookie-based cart items
                  const itemKey = `${item.product?._id || item.product}-${item.size}-${item.color}-${index}`;
                  
                  return (
                  <motion.div
                    key={itemKey}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex gap-4 sm:gap-5 md:gap-6 flex-col sm:flex-row">
                      {/* Product Image */}
                      <div className="w-full sm:w-28 md:w-32 h-36 sm:h-36 md:h-40 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={
                            item.product?.images && item.product.images.length > 0
                              ? item.product.images[0].startsWith('http')
                                ? item.product.images[0]
                                : getImageUrl(item.product.images[0])
                              : item.product?.thumbnail
                                ? item.product.thumbnail.startsWith('http')
                                  ? item.product.thumbnail
                                  : getImageUrl(item.product.thumbnail)
                                : '/no-image.png'
                          }
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-[#592a0d]">{item.product?.name}</h3>
                            <p className="text-[#592a0d]/70 text-sm mt-1">
                              {/* Display size info - custom or regular */}
                              {(item.isCustomSize || item.customSize?.isCustom) ? (
                                <span className="flex items-center gap-2">
                                  <Ruler className="w-4 h-4" />
                                  <span>Custom Size</span>
                                </span>
                              ) : (
                                <>
                                  {item.size ? `Size: ${item.size}` : 'Size: Standard'} 
                                  {item.color ? ` | Color: ${item.color}` : ''}
                                </>
                              )}
                            </p>
                            
                            {/* Full custom size details */}
                            {(item.isCustomSize || item.customSize?.isCustom) && (
                              <CustomSizeDisplay customSize={item.customSize} />
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(itemKey)}
                            className="text-[#592a0d] hover:text-red-600 transition-colors p-2"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          {/* Quantity Controls - Disabled for custom size items */}
                          <div className="flex items-center gap-3">
                            {(item.isCustomSize || item.customSize?.isCustom) ? (
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">Custom Size Item</span>
                                <span className="text-[#592a0d] min-w-[2rem] text-center">
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => updateQuantity(itemKey, -1)}
                                  disabled={item.quantity <= 1}
                                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all flex items-center justify-center touch-manipulation ${
                                    item.quantity <= 1
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-[#f5f1e8] text-[#592a0d] hover:bg-[#bfa77b] hover:text-white'
                                  }`}
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-[#592a0d] min-w-[2rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(itemKey, 1)}
                                  disabled={item.quantity >= getItemStock(item)}
                                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all flex items-center justify-center touch-manipulation ${
                                    item.quantity >= getItemStock(item)
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-[#f5f1e8] text-[#592a0d] hover:bg-[#bfa77b] hover:text-white'
                                  }`}
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-[#bfa77b]">Rs. {(item.product?.price * item.quantity).toLocaleString('en-PK', { maximumFractionDigits: 0 })}</p>
                            {item.quantity > 1 && (
                              <p className="text-[#592a0d]/60 text-sm">
                                Rs. {item.product?.price.toLocaleString('en-PK', { maximumFractionDigits: 0 })} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  );
                })}

                {/* Continue Shopping Button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => navigate('shop')}
                  className="text-[#592a0d] hover:text-[#bfa77b] transition-all flex items-center gap-2 mt-6"
                >
                  ← Continue Shopping
                </motion.button>
              </div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg sticky top-24">
                  <h3 className="text-[#bfa77b] mb-6">Order Summary</h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-[#592a0d]">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartTotals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#592a0d]">
                      <span>Shipping</span>
                      <span>{cartTotals.shippingAmount === 0 ? 'FREE' : formatCurrency(cartTotals.shippingAmount)}</span>
                    </div>
                    {cartTotals.shippingAmount === 0 && (
                      <p className="text-green-600 text-sm">
                        🎉 Free shipping included!
                      </p>
                    )}
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

                  
                  {/* Promo Code */}
                  {/*<div className="mb-6">
                    <input
                      type="text"
                      placeholder="Promo code"
                      className="w-full px-4 py-3 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none text-[#592a0d] mb-3"
                    />
                    <button className="w-full bg-[#f5f1e8] text-[#592a0d] py-2 rounded-lg hover:bg-[#e7dcc8] transition-all">
                      Apply Code
                    </button>
                  </div>*/}

                  {/* Checkout Button */}
                  <button
                    onClick={() => navigate('checkout')}
                    className="w-full bg-[#592a0d] text-[#bfa77b] py-4 rounded-full glow-gold-hover transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {/* Security Badge */}
                  <div className="mt-6 text-center">
                    <p className="text-[#592a0d]/60 text-sm flex items-center justify-center gap-2">
                      🔒 Secure Checkout
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
