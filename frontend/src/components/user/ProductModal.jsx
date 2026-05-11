import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './ImageWithFallback';
import { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUrl';

export function ProductModal({ isOpen, product, onClose }) {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Get scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Prevent scroll and compensate for scrollbar
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {
        // Restore original values
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  if (!product) return null;
  
  const availableSizes = product.sizes && product.sizes.length > 0
    ? product.sizes.filter(s => s.quantity > 0).map(s => s.size)
    : [];
  
  // Check if product is completely out of stock
  const isOutOfStock = product.sizes && product.sizes.length > 0
    ? product.sizes.every(s => s.quantity === 0)
    : product.stock === 0;

  // Set default selected size if available
  if (!selectedSize && availableSizes.length > 0) {
    setTimeout(() => setSelectedSize(availableSizes[0]), 0);
  }

  // Get random available size for add to cart
  const getRandomAvailableSize = () => {
    if (availableSizes.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * availableSizes.length);
    return availableSizes[randomIndex];
  };

  const handleViewDetails = () => {
    onClose();
    navigate(`/product/${product._id || product.id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl relative my-auto"
          >
            {/* Close button - positioned absolutely */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-[#592a0d] text-white rounded-full flex items-center justify-center hover:bg-[#3b1d0a] transition-colors shadow-lg"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-2 gap-0 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              {/* Image Section */}
              <div className="relative bg-gray-50 flex items-center justify-center p-3 sm:p-4 md:p-6 flex-shrink-0">
                <div className={`relative rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 w-full max-w-sm ${isOutOfStock ? 'opacity-60' : ''}`}>
                  <ImageWithFallback
                    src={product.images && product.images.length
                      ? product.images[0].startsWith('http')
                        ? product.images[0]
                        : getImageUrl(product.images[0])
                      : ''}
                    alt={product.name}
                    className={`w-full aspect-[3/4] object-cover ${isOutOfStock ? 'grayscale blur-[1px]' : ''}`}
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        {/* Subtle overlay only, no text */}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col justify-between p-4 sm:p-6 md:p-8 pt-12 sm:pt-16 md:pt-8">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                      <span className="inline-block bg-[#d4bd8a] text-[#592a0d] px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold">
                        {product.category && typeof product.category === 'object' ? product.category.name : product.category}
                      </span>
                      {isOutOfStock && (
                        <span className="inline-block bg-red-100 text-red-600 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium">
                          Sold Out
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#bfa77b] mb-2 sm:mb-3 md:mb-4 leading-tight">
                      {product.name}
                    </h2>
                    
                    <p className="text-[#592a0d] text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 md:mb-6">
                      PKR {product.price?.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                    </p>
                    
                    <p className="text-[#592a0d] leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base line-clamp-3">
                      {product.description}
                    </p>

                    {availableSizes.length > 0 && (
                      <div className="mb-4 sm:mb-6 md:mb-8">
                        <h4 className="text-[#592a0d] font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Select Size</h4>
                        <div className="flex gap-2 flex-wrap">
                          {availableSizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full transition-all font-medium flex items-center justify-center text-xs sm:text-sm md:text-base ${
                                selectedSize === size
                                  ? 'bg-[#bfa77b] text-white'
                                  : 'bg-[#f5f1e8] text-[#592a0d] hover:bg-[#e7dcc8]'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-gray-100">
                    {isOutOfStock ? (
                      <div className="w-full bg-gray-300 text-gray-600 py-2 sm:py-3 md:py-4 rounded-full flex items-center justify-center gap-2 font-medium text-sm sm:text-base">
                        Sold Out
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-[#592a0d] text-[#bfa77b] py-2 sm:py-3 md:py-4 rounded-full flex items-center justify-center gap-2 font-semibold tracking-wider hover:shadow-lg transition-all text-sm sm:text-base"
                        onClick={async () => {
                          const { _id, id } = product;
                          // Use selected size or get a random available size
                          const sizeToAdd = selectedSize || getRandomAvailableSize();
                          await import('../../services/optimizedCart').then(({ optimizedCartService }) => {
                            optimizedCartService.addToCart({ productId: _id || id, quantity: 1, size: sizeToAdd });
                          });
                          window.dispatchEvent(new Event('cartUpdated'));
                          onClose();
                        }}
                        aria-label="Add to Cart"
                      >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                        Add to Cart
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleViewDetails}
                      className="w-full bg-[#f5f1e8] text-[#592a0d] py-2 sm:py-3 md:py-4 rounded-full font-semibold hover:bg-[#e7dcc8] transition-all text-sm sm:text-base"
                    >
                      View Full Details
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
      )}
    </AnimatePresence>
  );
}
