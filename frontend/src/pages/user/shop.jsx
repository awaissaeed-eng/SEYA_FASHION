import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, SlidersHorizontal } from 'lucide-react';
import UserLayout from '../../components/user/UserLayout';
import { ProductCard } from '../../components/user/ProductCard';
import { ProductModal } from '../../components/user/ProductModal';
import { getImageUrl } from '../../utils/imageUrl';


export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [categories, setCategories] = useState(['All']);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const fabrics = ['Cotton', 'Silk', 'Velvet', 'Chiffon', 'Lawn'];
  const location = useLocation();

  // Prevent body scroll when mobile filters are open
  useEffect(() => {
    if (showFilters && window.innerWidth < 1024) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [showFilters]);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const catRes = await import('../../services/category');
        const prodRes = await import('../../services/product');
        const catResponse = await catRes.categoryService.getAll();
        const prodResponse = await prodRes.productService.getAll();
        if (mounted) {
          const activeCats = catResponse.data.categories.filter(cat => cat.isActive).map(cat => cat.name);
          setCategories(['All', ...activeCats]);
          setProducts(prodResponse.data.products);
        }
      } catch (err) {
        setCategories(['All']);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (location.state && location.state.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location.state]);

  const filteredProducts = products.filter((product) => {
    const catName = product.category && typeof product.category === 'object' ? product.category.name : product.category;
    if (selectedCategory !== 'All' && catName !== selectedCategory) {
      return false;
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return b._id && a._id ? b._id.localeCompare(a._id) : 0;
      default:
        return 0;
    }
  });

  return (
    <UserLayout>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#592a0d] to-[#3b1d0a] py-12 md:py-20">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-[#bfa77b] text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 md:mb-6">Our Collection</h1>
              <p className="text-[#e7dcc8] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Discover timeless pieces crafted with elegance and sophistication
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full bg-[#592a0d] text-[#bfa77b] py-3 md:py-4 rounded-lg flex items-center justify-center gap-2 font-semibold"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Filters Sidebar */}
            <AnimatePresence>
              {(showFilters || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                <motion.aside
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className={`
                    lg:w-64 bg-white rounded-lg p-4 md:p-6 shadow-lg border-2 border-[#e7dcc8]
                    ${showFilters ? 
                      'fixed inset-0 z-40 lg:relative lg:inset-auto lg:z-auto overflow-y-auto' : 
                      'lg:sticky lg:top-24 lg:h-fit'
                    }
                  `}
                >
                  <div className="flex justify-between items-center mb-6 lg:hidden">
                    <h3 className="text-[#bfa77b] text-lg font-semibold">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="p-1">
                      <X className="w-5 h-5 text-[#592a0d]" />
                    </button>
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="text-[#592a0d] font-semibold mb-3">Categories</h4>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowFilters(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-all text-sm md:text-base ${
                            selectedCategory === category
                              ? 'bg-[#bfa77b] text-[#592a0d] font-semibold'
                              : 'bg-[#f5f1e8] text-[#592a0d] hover:bg-[#e7dcc8]'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="text-[#592a0d] font-semibold mb-3">Price Range</h4>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                        className="w-full accent-[#bfa77b] h-2 rounded-lg"
                      />
                      <div className="flex justify-between text-sm text-[#592a0d] font-semibold">
                        <span>PKR {priceRange[0]}</span>
                        <span>PKR {priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fabrics 
                  <div className="mb-6">
                    <h4 className="text-[#592a0d] font-semibold mb-3">Fabric</h4>
                    <div className="space-y-2">
                      {fabrics.map((fabric) => (
                        <label key={fabric} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-[#bfa77b] cursor-pointer"
                          />
                          <span className="text-sm text-[#592a0d]">{fabric}</span>
                        </label>
                      ))}
                    </div>
                  </div>*/}

                  {/* Reset Filters */}
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setPriceRange([0, 50000]);
                      setShowFilters(false); // Close filters on mobile after reset
                    }}
                    className="w-full bg-[#f5f1e8] text-[#592a0d] py-2 md:py-3 rounded-lg hover:bg-[#e7dcc8] transition-all font-semibold text-sm md:text-base"
                  >
                    Reset Filters
                  </button>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Overlay for mobile filters */}
            {showFilters && (
              <div 
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                onClick={() => setShowFilters(false)}
              />
            )}

            {/* Products Grid */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                <p className="text-[#592a0d] text-sm md:text-base font-medium">
                  Showing {sortedProducts.length} products
                </p>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-[#e7dcc8] bg-white text-[#592a0d] focus:outline-none focus:border-[#bfa77b] text-sm md:text-base"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {loading ? (
                <div className="text-center py-12 md:py-20">
                  <p className="text-[#592a0d] text-lg md:text-xl font-semibold">Loading products...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {sortedProducts.map((product, index) => {
                      const imageUrl = product.images && product.images.length
                        ? product.images[0].startsWith('http')
                          ? product.images[0]
                          : getImageUrl(product.images[0])
                        : '';
                      // Check if product is out of stock (from status field or calculated)
                      const isOutOfStock = product.status === 'OUT_OF_STOCK' || (
                        product.sizes && product.sizes.length > 0
                          ? product.sizes.every(s => s.quantity === 0)
                          : product.stock === 0
                      );
                      return (
                        <motion.div
                          key={product._id || product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ProductCard
                            id={product._id || product.id}
                            image={imageUrl}
                            title={product.name}
                            price={product.price}
                            category={product.category && typeof product.category === 'object' ? product.category.name : product.category}
                            description={product.description}
                            sizes={product.sizes || []}
                            status={product.status}
                            outOfStock={isOutOfStock}
                            onQuickView={() => {
                              setSelectedProduct(product);
                              setIsModalOpen(true);
                            }}
                          />
                        </motion.div>
                      );
                    })}
                  </div>

                  {sortedProducts.length === 0 && (
                    <div className="text-center py-12 md:py-20">
                      <p className="text-[#592a0d] text-lg md:text-xl font-semibold">No products found matching your filters</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      <ProductModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={() => setIsModalOpen(false)}
      />
    </UserLayout>
  );
}
