import { memo, useCallback } from 'react';
import { motion } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { optimizedCartService } from '../../services/optimizedCart';
import { toggleWishlist, isInWishlist } from '../../utils/wishlist';
import { OptimizedImage } from '../ui/OptimizedImage';
import { IMAGE_SIZES } from '../../utils/cloudinaryOptimization';

const ProductCard = memo(({ id, image, title, price, category, onQuickView, sizes = [], outOfStock = false, status }) => {
  const imgRef = useRef();
  const [animating, setAnimating] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const navigate = useNavigate();

  // Check if product is in wishlist on mount
  useEffect(() => {
    setInWishlist(isInWishlist(id));
  }, [id]);

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = () => {
      setInWishlist(isInWishlist(id));
    };
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [id]);

  // Determine if out of stock from status field or calculated from sizes/stock
  const isOutOfStock = status === 'OUT_OF_STOCK' || outOfStock;

  // Get available sizes (quantity > 0)
  const availableSizes = sizes.filter(s => s.quantity > 0);

  // Select a random available size
  const getRandomAvailableSize = useCallback(() => {
    if (availableSizes.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * availableSizes.length);
    return availableSizes[randomIndex].size;
  }, [availableSizes]);

  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    setAnimating(true);
    const selectedSize = getRandomAvailableSize();
    await optimizedCartService.addToCart({ 
      productId: id,
      name: title,
      image: image,
      price: price,
      size: selectedSize,
      quantity: 1,
      category: category
    });
    window.dispatchEvent(new Event('cartUpdated'));
    setTimeout(() => setAnimating(false), 700);
  }, [id, title, image, price, category, isOutOfStock, getRandomAvailableSize]);

  const handleQuickView = useCallback((e) => {
    e.stopPropagation();
    onQuickView?.();
  }, [onQuickView]);

  const handleWishlistToggle = useCallback((e) => {
    e.stopPropagation();
    toggleWishlist(id);
  }, [id]);

  const handleCardClick = useCallback(() => {
    navigate(`/product/${id}`);
  }, [navigate, id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={isOutOfStock ? {} : { y: -10 }}
      onClick={handleCardClick}
      className={`group bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 border-2 border-transparent cursor-pointer relative ${isOutOfStock ? 'opacity-70' : 'hover:shadow-xl hover:border-[#bfa77b]'}`}
    >
      <div className="relative overflow-hidden aspect-[3/4]">
        <div className="absolute top-3 md:top-4 left-3 md:left-4 z-10 flex flex-col gap-2">
          <span className="bg-[#d4bd8a] text-[#592a0d] px-2 md:px-3 lg:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold">
            {category}
          </span>
        </div>

        {/* Wishlist Button - Top Right */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleWishlistToggle}
          className={`absolute top-3 md:top-4 right-3 md:right-4 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
            inWishlist 
              ? 'bg-[#592a0d] text-[#bfa77b]' 
              : 'bg-white/90 text-[#592a0d] hover:bg-white'
          }`}
          aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 md:w-5 md:h-5 ${inWishlist ? 'fill-current' : ''}`} />
        </motion.button>

        {/* Optimized Image with lazy loading and blur-up */}
        <OptimizedImage
          src={image}
          alt={title}
          className={`w-full h-full ${isOutOfStock ? 'grayscale-[50%] opacity-80' : 'group-hover:scale-110 transition-transform duration-500'} ${animating ? 'fly-to-cart' : ''}`}
          sizes={{
            mobile: IMAGE_SIZES.card,
            tablet: IMAGE_SIZES.cardLarge,
            desktop: IMAGE_SIZES.cardLarge,
          }}
          aspectRatio="3:4"
          objectFit="cover"
          priority={false}
        />

        {/* Action buttons overlay - always visible on mobile/tablet, hover on laptop+ */}
        {!isOutOfStock && (
          <>
            {/* Background overlay - visible on mobile/tablet, hover on laptop+ */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent lg:bg-transparent lg:group-hover:bg-black/20 transition-all duration-300 pointer-events-none z-[5]"></div>
            
            {/* Buttons - always visible on mobile/tablet, hover on laptop+ */}
            <div className="product-card-actions absolute inset-x-0 bottom-0 flex items-end justify-center pb-3 sm:pb-4 md:pb-6 z-10 transition-all duration-300">
              <div className="flex gap-2 sm:gap-3 md:gap-4">
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-[#d4bd8a] text-[#592a0d] flex items-center justify-center hover:bg-[#bfa77b] transition-colors shadow-lg touch-manipulation"
                  onClick={handleAddToCart}
                  aria-label="Add to Cart"
                >
                  <ShoppingBag className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleQuickView}
                  className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-white text-[#592a0d] flex items-center justify-center hover:bg-[#f5f1e8] transition-colors shadow-lg touch-manipulation"
                  aria-label="Quick View"
                >
                  <Eye className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                </motion.button>
              </div>
            </div>
          </>
        )}

        {/* Out of stock overlay on image - subtle effect only */}
        {isOutOfStock && (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-black/5"></div>
          </div>
        )}
      </div>

      <div className="bg-white p-3 md:p-4 lg:p-6 flex-grow flex flex-col justify-between">
        <div>
          <h3 className={`text-base md:text-lg lg:text-xl font-serif font-bold mb-2 md:mb-3 line-clamp-2 leading-tight ${isOutOfStock ? 'text-gray-500' : 'text-[#592a0d]'}`}>
            {title}
          </h3>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className={`text-lg md:text-xl lg:text-2xl font-bold ${isOutOfStock ? 'text-gray-400' : 'text-[#bfa77b]'}`}>
            PKR {price.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
          </span>
          {isOutOfStock && (
            <span className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-1 rounded">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export { ProductCard };
