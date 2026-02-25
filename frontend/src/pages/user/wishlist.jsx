import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingCart, Trash2, Share2 } from 'lucide-react';
import UserLayout from '../../components/user/UserLayout';
import { getWishlist, removeFromWishlist } from '../../utils/wishlist';
import { shareProduct } from '../../utils/share';
import { cachedProductService } from '../../services/cachedServices';
import { optimizedCartService } from '../../services/optimizedCart';
import { useToast } from '../../components/Toast';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../../components/user/ImageWithFallback';
import { getImageUrl } from '../../utils/imageUrl';

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadWishlistProducts();
    
    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      loadWishlistProducts();
    };
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, []);

  const loadWishlistProducts = async () => {
    setLoading(true);
    try {
      const wishlistIds = getWishlist();
      if (wishlistIds.length === 0) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      // Fetch all products
      const response = await cachedProductService.getAll();
      const allProducts = response.data.products || [];
      
      // Filter products that are in wishlist
      const wishlistItems = allProducts.filter(product => 
        wishlistIds.includes(product._id || product.id)
      );
      
      setWishlistProducts(wishlistItems);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Error', 'Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (productId, productName) => {
    removeFromWishlist(productId);
    toast.info('Removed', `${productName} removed from wishlist`);
  };

  const handleAddToCart = async (product) => {
    try {
      // Get first available size
      let size = '';
      if (product.sizes && product.sizes.length > 0) {
        const availableSize = product.sizes.find(s => s.quantity > 0);
        size = availableSize ? availableSize.size : '';
      }

      if (!size && product.sizes && product.sizes.length > 0) {
        toast.warning('Out of Stock', 'This product is currently out of stock');
        return;
      }

      await optimizedCartService.addToCart({
        productId: product._id || product.id,
        quantity: 1,
        size: size
      });
      
      toast.success('Added to Cart', `${product.name} has been added to your cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error', 'Failed to add item to cart');
    }
  };

  const handleShare = async (product) => {
    const result = await shareProduct(product);
    
    if (result.success && result.method === 'clipboard') {
      toast.success('Link Copied!', 'Product link has been copied to clipboard');
    } else if (!result.cancelled && !result.success) {
      toast.error('Share Failed', 'Unable to share product');
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-20">
            <div className="text-[#592a0d] text-xl">Loading wishlist...</div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <Heart className="w-8 h-8 text-[#bfa77b] fill-current" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#592a0d]">
              My Wishlist
            </h1>
          </motion.div>
          <p className="text-[#592a0d] text-lg">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Wishlist Items */}
        {wishlistProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-serif text-[#592a0d] mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Start adding products you love!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/shop')}
              className="bg-[#592a0d] text-[#bfa77b] px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Browse Products
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product, index) => {
              const isOutOfStock = product.sizes && product.sizes.length > 0
                ? product.sizes.every(s => s.quantity === 0)
                : product.stock === 0;

              return (
                <motion.div
                  key={product._id || product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-[#e7dcc8] hover:border-[#bfa77b] transition-all group"
                >
                  {/* Product Image */}
                  <div 
                    className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                    onClick={() => handleViewProduct(product._id || product.id)}
                  >
                    <ImageWithFallback
                      src={product.images && product.images.length
                        ? product.images[0].startsWith('http')
                          ? product.images[0]
                          : getImageUrl(product.images[0])
                        : ''}
                      alt={product.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        isOutOfStock ? 'grayscale opacity-60' : ''
                      }`}
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                          Sold Out
                        </span>
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(product._id || product.id, product.name);
                      }}
                      className="absolute top-3 right-3 w-10 h-10 bg-white/90 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center transition-all shadow-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div 
                      className="cursor-pointer mb-3"
                      onClick={() => handleViewProduct(product._id || product.id)}
                    >
                      <h3 className="font-serif font-bold text-lg text-[#592a0d] mb-1 line-clamp-2 hover:text-[#bfa77b] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[#bfa77b] font-semibold text-xl">
                        PKR {product.price?.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!isOutOfStock && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 bg-[#592a0d] text-[#bfa77b] py-2 rounded-full flex items-center justify-center gap-2 hover:shadow-lg transition-all font-medium text-sm"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleShare(product)}
                        className={`${isOutOfStock ? 'flex-1' : ''} bg-[#f5f1e8] text-[#592a0d] p-2 rounded-full hover:bg-[#e7dcc8] transition-all`}
                      >
                        <Share2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
