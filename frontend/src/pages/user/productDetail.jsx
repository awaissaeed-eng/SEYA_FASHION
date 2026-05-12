import { useState, useEffect, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { cachedProductService } from '../../services/cachedServices';
import { optimizedCartService } from '../../services/optimizedCart';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, X } from 'lucide-react';
import { ImageWithFallback } from '../../components/user/ImageWithFallback';
import UserLayout from '../../components/user/UserLayout';
import CustomSizeForm from '../../components/user/CustomSizeForm';
import ProductReviews from '../../components/user/ProductReviews';
import { getImageUrl } from '../../utils/imageUrl';
import { toggleWishlist, isInWishlist } from '../../utils/wishlist';
import { shareProduct } from '../../utils/share';
import { useToast } from '../../components/Toast';

// Lazy load components
const ProductDetails = lazy(() => import('../../components/user/ProductDetails'));


export default function ProductDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showCustomSizeForm, setShowCustomSizeForm] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await cachedProductService.getById(id);
        setProduct(res.data.product);
        // Check if product is in wishlist
        setInWishlist(isInWishlist(res.data.product._id || res.data.product.id));
        // Set first available size (with quantity > 0)
        if (res.data.product.sizes && res.data.product.sizes.length > 0) {
          const availableSize = res.data.product.sizes.find(s => s.quantity > 0);
          if (availableSize) {
            setSelectedSize(availableSize.size);
          }
        }
        if (res.data.product.colors && res.data.product.colors.length > 0) {
          setSelectedColor(res.data.product.colors[0]);
        }
      } catch (err) {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = () => {
      if (product) {
        setInWishlist(isInWishlist(product._id || product.id));
      }
    };
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [product]);

  // Check if product is completely out of stock
  const isOutOfStock = product?.sizes && product.sizes.length > 0
    ? product.sizes.every(s => s.quantity === 0)
    : product?.stock === 0;

  // Get random available size
  const getRandomAvailableSize = () => {
    if (!product?.sizes) return '';
    const availableSizes = product.sizes.filter(s => s.quantity > 0);
    if (availableSizes.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * availableSizes.length);
    return availableSizes[randomIndex].size;
  };

  // Get available stock for selected size
  const getAvailableStock = () => {
    if (!product) return 0;
    if (product.sizes && product.sizes.length > 0 && selectedSize) {
      const sizeObj = product.sizes.find(s => s.size === selectedSize);
      return sizeObj ? sizeObj.quantity : 0;
    }
    return product.stock || 0;
  };

  const availableStock = getAvailableStock();
  const canIncrease = selectedSize === 'custom' ? true : quantity < availableStock;
  const canDecrease = quantity > 1;

  const handleAddToCart = async () => {
    if (selectedSize === 'custom' && !showCustomSizeForm) {
      setShowCustomSizeForm(true);
    } else if (selectedSize === 'custom' && showCustomSizeForm) {
      // Custom size form is already shown, user needs to fill it out
      return;
    } else {
      // Only apply random size logic for standard size products when no size is selected
      setAddingToCart(true);
      try {
        const sizeToAdd = selectedSize || getRandomAvailableSize();
        await optimizedCartService.addToCart({ 
          productId: product._id || product.id,
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0] : '',
          price: product.price,
          category: typeof product.category === 'object' ? product.category.name : product.category,
          quantity, 
          size: sizeToAdd, 
          color: selectedColor 
        });
      } catch (error) {
        console.error('Failed to add to cart:', error);
      } finally {
        setAddingToCart(false);
      }
    }
  };

  const handleCustomSizeSubmit = async (customSizeData) => {
    setAddingToCart(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('productId', product._id || product.id);
      formData.append('quantity', quantity);
      formData.append('size', 'Custom Size');
      formData.append('color', selectedColor);
      
      // Add custom size data
      formData.append('customSize', JSON.stringify({
        isCustom: true,
        measurements: customSizeData.measurements,
        notes: customSizeData.notes
      }));
      
      // Add files if any
      if (customSizeData.files && customSizeData.files.length > 0) {
        customSizeData.files.forEach((fileObj) => {
          formData.append('measurementFiles', fileObj.file);
        });
      }

      // Get API base URL
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Use fetch instead of cartService for file upload
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token') || ''}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      window.dispatchEvent(new Event('cartUpdated'));
      setShowCustomSizeForm(false);
    } catch (error) {
      console.error('Failed to add custom size to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    const productId = product._id || product.id;
    const added = toggleWishlist(productId);
    setInWishlist(added);
    
    if (added) {
      toast.success('Added to Wishlist', `${product.name} has been added to your wishlist`);
    } else {
      toast.info('Removed from Wishlist', `${product.name} has been removed from your wishlist`);
    }
  };

  const handleShare = async () => {
    const result = await shareProduct(product);
    
    if (result.success) {
      if (result.method === 'clipboard') {
        toast.success('Link Copied!', 'Product link has been copied to clipboard');
      }
      // For native share, don't show toast as the native UI handles it
    } else if (!result.cancelled) {
      toast.error('Share Failed', 'Unable to share product. Please try again.');
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="text-[#592a0d] text-xl">Loading product...</div>
        </div>
      </UserLayout>
    );
  }

  if (error || !product) {
    return (
      <UserLayout>
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="text-[#592a0d] text-xl">{error || 'Product not found'}</div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
          {/* Breadcrumb */}
          <div className="text-xs sm:text-sm text-[#592a0d] mb-6 sm:mb-8">
            <span className="hover:text-[#bfa77b] cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span className="hover:text-[#bfa77b] cursor-pointer">Shop</span>
            <span className="mx-2">/</span>
            <span className="text-[#bfa77b]">{product.name}</span>
          </div>

          {/* Product Details */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-12 mb-12 sm:mb-16 md:mb-20">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image Preview */}
              <div className="rounded-lg overflow-hidden border-2 border-[#e7dcc8] shadow-lg">
                <ImageWithFallback
                  src={product.images && product.images.length
                    ? product.images[selectedImageIndex]?.startsWith('http')
                      ? product.images[selectedImageIndex]
                      : getImageUrl(product.images[selectedImageIndex])
                    : ''}
                  alt={product.name}
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>
              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  {product.images.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        selectedImageIndex === i 
                          ? 'border-[#bfa77b] ring-2 ring-[#bfa77b]' 
                          : 'border-[#e7dcc8] hover:border-[#bfa77b]'
                      }`}
                    >
                      <ImageWithFallback
                        src={img.startsWith('http') ? img : getImageUrl(img)}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 lg:space-y-8"
            >
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-block bg-[#bfa77b] text-[#592a0d] px-3 sm:px-4 py-1 rounded-full text-sm">
                    {product.category && typeof product.category === 'object' ? product.category.name : product.category}
                  </span>
                  {isOutOfStock && (
                    <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                      Sold Out
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#592a0d] mb-3 sm:mb-2 leading-tight">
                  {product.name}
                </h1>
                <p className={`text-2xl sm:text-3xl md:text-4xl font-semibold ${isOutOfStock ? 'text-gray-400' : 'text-[#bfa77b]'}`}>PKR {product.price?.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</p>
              </div>

              <p className="text-[#592a0d] leading-relaxed text-sm sm:text-base md:text-lg">
                {product.description}
              </p>

              {/* Color Selection: Only show if colors are defined by admin */}
              {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
                <div>
                  <h4 className="text-[#592a0d] font-semibold mb-3 text-base sm:text-lg">Select Color</h4>
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 sm:px-6 py-2 rounded-full transition-all font-medium text-sm sm:text-base ${
                          selectedColor === color
                            ? 'bg-[#bfa77b] text-[#592a0d]'
                            : 'bg-[#f5f1e8] text-[#592a0d] hover:bg-[#e7dcc8]'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection with Stock */}
              {(product.sizes && product.sizes.length > 0) || product.allowCustomSize ? (
                <div>
                  <h4 className="text-[#592a0d] font-semibold mb-3 text-base sm:text-lg">Select Size</h4>
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {/* Standard Sizes */}
                    {product.sizes && product.sizes.map(({ size, quantity }) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setShowCustomSizeForm(false); // Hide custom form when selecting standard size
                        }}
                        disabled={quantity === 0}
                        className={`w-14 h-10 sm:w-16 sm:h-12 rounded-full transition-all font-medium flex flex-col items-center justify-center border text-sm sm:text-base ${
                          selectedSize === size
                            ? 'bg-[#bfa77b] text-[#592a0d] border-[#bfa77b] shadow-md'
                            : 'bg-[#f5f1e8] text-[#592a0d] hover:bg-[#e7dcc8] border-[#e8dfd3]'
                        } ${quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span>{size}</span>
                      </button>
                    ))}
                    
                    {/* Custom Size Option - More Prominent */}
                    {product.allowCustomSize && (
                      <button
                        onClick={() => {
                          setSelectedSize('custom');
                          setShowCustomSizeForm(true);
                        }}
                        className={`px-4 sm:px-6 h-10 sm:h-12 rounded-full transition-all font-medium flex items-center justify-center border-2 text-sm sm:text-base ${
                          selectedSize === 'custom'
                            ? 'bg-[#592a0d] text-[#bfa77b] border-[#592a0d] shadow-lg'
                            : 'bg-gradient-to-r from-[#f5f1e8] to-[#e7dcc8] text-[#592a0d] hover:from-[#bfa77b] hover:to-[#d4a574] hover:text-white border-[#bfa77b]'
                        }`}
                      >
                        <span className="font-semibold">Custom Size</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Inline Custom Size Form */}
                  {selectedSize === 'custom' && showCustomSizeForm && (
                    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-[#faf8f5] rounded-lg border-2 border-[#bfa77b]">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-base sm:text-lg font-semibold text-[#592a0d]">Enter Your Measurements</h5>
                        <button
                          onClick={() => {
                            setShowCustomSizeForm(false);
                            setSelectedSize('');
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <CustomSizeForm
                        onSubmit={handleCustomSizeSubmit}
                        onCancel={() => {
                          setShowCustomSizeForm(false);
                          setSelectedSize('');
                        }}
                        loading={addingToCart}
                        inline={true}
                      />
                    </div>
                  )}
                </div>
              ) : null}

              {/* Quantity */}
              {!isOutOfStock && (
                <div>
                  <h4 className="text-[#592a0d] font-semibold mb-3 text-base sm:text-lg">Quantity</h4>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button
                      onClick={() => canDecrease && setQuantity(quantity - 1)}
                      disabled={!canDecrease}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all font-bold text-lg sm:text-xl ${
                        canDecrease 
                          ? 'bg-[#f5f1e8] text-[#592a0d] hover:bg-[#bfa77b] hover:text-white' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      -
                    </button>
                    <span className="text-[#592a0d] text-lg sm:text-xl w-12 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => canIncrease && setQuantity(quantity + 1)}
                      disabled={!canIncrease}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all font-bold text-lg sm:text-xl ${
                        canIncrease 
                          ? 'bg-[#f5f1e8] text-[#592a0d] hover:bg-[#bfa77b] hover:text-white' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      +
                    </button>
                  </div>
                  {/* Show available stock for selected size */}
                  {selectedSize && product.sizes && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      {availableStock} available in size {selectedSize}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4">
                {isOutOfStock ? (
                  <div className="w-full bg-gray-300 text-gray-600 py-3 sm:py-4 rounded-full flex items-center justify-center gap-2 font-medium tracking-wider text-lg sm:text-xl">
                    <span>Sold Out</span>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#592a0d] text-[#bfa77b] py-3 sm:py-4 rounded-full flex items-center justify-center gap-2 hover:shadow-lg transition-all font-semibold tracking-wider disabled:opacity-50 text-base sm:text-lg"
                    onClick={handleAddToCart}
                    disabled={addingToCart || (selectedSize === 'custom' && showCustomSizeForm)}
                    aria-label="Add to Cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>
                      {addingToCart ? 'ADDING...' : 
                       selectedSize === 'custom' && showCustomSizeForm ? 'FILL MEASUREMENTS ABOVE' : 
                       selectedSize === 'custom' ? 'SELECT CUSTOM SIZE ABOVE' : 
                       'ADD TO CART'}
                    </span>
                  </motion.button>
                )}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWishlistToggle}
                    className={`flex-1 py-3 rounded-full flex items-center justify-center gap-2 transition-all font-semibold ${
                      inWishlist 
                        ? 'bg-[#592a0d] text-[#bfa77b] hover:bg-[#3b1d0a]' 
                        : 'bg-[#f5f1e8] text-[#592a0d] hover:bg-[#e7dcc8]'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                    <span>{inWishlist ? 'In Wishlist' : 'Wishlist'}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShare}
                    className="flex-1 bg-[#f5f1e8] text-[#592a0d] py-3 rounded-full flex items-center justify-center gap-2 hover:bg-[#e7dcc8] transition-all font-semibold"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </motion.button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-[#e7dcc8]">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#f5f1e8] rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="w-6 h-6 text-[#bfa77b]" />
                  </div>
                  <p className="text-sm text-[#592a0d] font-medium">Free Shipping</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#f5f1e8] rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-[#bfa77b]" />
                  </div>
                  <p className="text-sm text-[#592a0d] font-medium">Secure Payment</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#f5f1e8] rounded-full flex items-center justify-center mx-auto mb-2">
                    <RotateCcw className="w-6 h-6 text-[#bfa77b]" />
                  </div>
                  <p className="text-sm text-[#592a0d] font-medium">Easy Returns</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <Suspense fallback={
            <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-[#e7dcc8] mb-20">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          }>
            <ProductDetails details={product.details} />
          </Suspense>

          {/* Product Reviews */}
          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg border-2 border-[#e7dcc8]">
            <ProductReviews productId={product._id || product.id} />
          </div>
        </div>

        {/* Custom Size Form Modal - Keep for fallback */}
        {showCustomSizeForm && selectedSize !== 'custom' && (
          <CustomSizeForm
            onSubmit={handleCustomSizeSubmit}
            onCancel={() => setShowCustomSizeForm(false)}
            loading={addingToCart}
          />
        )}
    </UserLayout>
  );
}
