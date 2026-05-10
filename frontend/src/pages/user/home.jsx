import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Mail, CheckCircle, Loader2 } from 'lucide-react';
import UserLayout from '../../components/user/UserLayout';
import { ImageWithFallback } from '../../components/user/ImageWithFallback';
import { ProductCard } from '../../components/user/ProductCard';
import { ProductModal } from '../../components/user/ProductModal';
import { subscriberService } from '../../services/subscriber';
import { cachedHeroService } from '../../services/cachedServices';
import { getImageUrl, getVideoUrl } from '../../utils/imageUrl';

// Newsletter Section Component
const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [emailError, setEmailError] = useState('');

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setMessage({ type: '', text: '' });
    if (value && !isValidEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    // Validate email before submitting
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    setEmailError('');

    try {
      const response = await subscriberService.subscribe(email);
      setMessage({ type: 'success', text: response.data.message });
      setEmail('');
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to subscribe. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-transparent rounded-2xl p-8 md:p-12 text-center border-2 border-[#bfa77b] relative z-10"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#592a0d] rounded-full mb-6">
          <Mail className="w-8 h-8 text-[#bfa77b]" />
        </div>
        <h3 className="text-[#bfa77b] text-2xl md:text-4xl font-serif font-bold mb-4">Stay Updated</h3>
        <p className="text-[#592a0d] text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
          Subscribe to our newsletter for exclusive offers and latest collections
        </p>
        
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-md md:max-w-2xl mx-auto">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              disabled={loading}
              className={`w-full px-4 md:px-6 py-2 md:py-3 rounded-full border-2 ${emailError ? 'border-red-500' : 'border-[#bfa77b]'} focus:outline-none focus:border-[#592a0d] bg-white text-[#592a0d] text-sm md:text-base disabled:opacity-50`}
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1 text-left pl-4">{emailError}</p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            type="submit"
            disabled={loading}
            className="bg-[#592a0d] text-[#bfa77b] px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 h-fit"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Subscribing...</span>
              </>
            ) : (
              <span>Subscribe</span>
            )}
          </motion.button>
        </form>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 flex items-center justify-center gap-2 ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
            <span className="text-sm md:text-base">{message.text}</span>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};


const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Hero settings state
  const [heroSettings, setHeroSettings] = useState(null);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const heroIntervalRef = useRef(null);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? featuredProducts.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  // Helper to check if product is out of stock (all sizes sold out)
  const isProductOutOfStock = (product) => {
    if (!product.sizes || product.sizes.length === 0) return product.stock === 0;
    return product.sizes.every(s => s.quantity === 0);
  };

  // Get 3 products to display, looping through the 5 products
  const getDisplayProducts = () => {
    if (featuredProducts.length === 0) return [];
    const display = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentSlide + i) % featuredProducts.length;
      display.push(featuredProducts[index]);
    }
    return display;
  };

  // Fetch hero settings
  useEffect(() => {
    async function fetchHeroSettings() {
      try {
        const res = await cachedHeroService.getSettings();
        if (res.data.success) {
          setHeroSettings(res.data.settings);
        }
      } catch (err) {
        console.error('Failed to load hero settings:', err);
      }
    }
    fetchHeroSettings();
  }, []);

  // Hero image slideshow
  useEffect(() => {
    if (heroSettings?.mediaType === 'image' && heroSettings?.slideshowEnabled && heroSettings?.images?.length > 1) {
      heroIntervalRef.current = setInterval(() => {
        setHeroImageIndex(prev => (prev + 1) % heroSettings.images.length);
      }, (heroSettings.slideshowInterval || 5) * 1000);
    }
    return () => {
      if (heroIntervalRef.current) {
        clearInterval(heroIntervalRef.current);
      }
    };
  }, [heroSettings]);

  // Fetch categories and latest 5 products from backend
  useEffect(() => {
    let mounted = true;
    async function fetchCategoriesAndFeatured() {
      setLoadingCategories(true);
      setLoadingFeatured(true);
      try {
        const res = await import('../../services/category');
        const prodRes = await import('../../services/product');
        const response = await res.categoryService.getAll();
        const featuredRes = await prodRes.productService.getAll();
        if (mounted) {
          setCategories(response.data.categories.filter(cat => cat.isActive));
          // Get latest 5 products (sorted by newest first, any category)
          const allProducts = featuredRes.data.products.filter(p => p.isActive);
          // Sort by createdAt descending (newest first)
          allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          // Take only the latest 5
          setFeaturedProducts(allProducts.slice(0, 5));
        }
      } catch (err) {
        setCategories([]);
        setFeaturedProducts([]);
      } finally {
        setLoadingCategories(false);
        setLoadingFeatured(false);
      }
    }
    fetchCategoriesAndFeatured();
    return () => { mounted = false; };
  }, []);

  // Get current hero media URL
  const getHeroMediaUrl = () => {
    if (!heroSettings) return null;
    if (heroSettings.mediaType === 'video' && heroSettings.video) {
      return getVideoUrl(heroSettings.video);
    }
    if (heroSettings.mediaType === 'image' && heroSettings.images?.length > 0) {
      return getImageUrl(heroSettings.images[heroImageIndex]);
    }
    return null;
  };

  const heroMediaUrl = getHeroMediaUrl();
  const blurStyle = heroSettings?.blurEnabled ? { filter: `blur(${heroSettings.blurAmount || 4}px)` } : {};

  return (
    <UserLayout>
      {/* Hero Section */}
      <section className="relative h-[500px] sm:h-[600px] md:h-[700px] overflow-hidden bg-gradient-to-br from-[#592a0d] to-[#3b1d0a]">
          {/* Background Media with Blur */}
          {heroMediaUrl && heroSettings?.mediaType === 'video' && (
            <>
              <video
                className="absolute inset-0 w-full h-full object-cover"
                style={blurStyle}
                autoPlay={heroSettings.videoAutoplay}
                muted={heroSettings.videoMuted}
                loop={heroSettings.videoLoop}
                playsInline
                preload="none"
                loading="lazy"
                poster={heroSettings.videoPoster || ''}
              >
                <source src={heroMediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {/* Main Video (non-blurred overlay) */}
              {!heroSettings.blurEnabled && (
                <video
                  className="absolute inset-0 w-full h-full md:object-contain object-cover"
                  autoPlay={heroSettings.videoAutoplay}
                  muted={heroSettings.videoMuted}
                  loop={heroSettings.videoLoop}
                  playsInline
                  preload="none"
                  loading="lazy"
                  poster={heroSettings.videoPoster || ''}
                >
                  <source src={heroMediaUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </>
          )}
          
          {heroMediaUrl && heroSettings?.mediaType === 'image' && (
            <motion.img
              key={heroImageIndex}
              src={heroMediaUrl}
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover"
              style={blurStyle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          <div className={`container mx-auto px-4 md:px-6 lg:px-8 h-full flex relative z-10 ${
            heroSettings?.contentVerticalPosition === 'top' ? 'items-start pt-20' :
            heroSettings?.contentVerticalPosition === 'bottom' ? 'items-end pb-20' : 'items-center'
          } ${
            heroSettings?.contentPosition === 'center' ? 'justify-center' :
            heroSettings?.contentPosition === 'right' ? 'justify-end' : 'justify-start'
          }`}>
            <div className={`max-w-2xl ${heroSettings?.contentPosition === 'center' ? 'text-center' : ''}`}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {(heroSettings?.showSubtitle !== false) && (
                  <div className={`flex items-center gap-2 mb-4 ${heroSettings?.contentPosition === 'center' ? 'justify-center' : ''}`}>
                    <Sparkles className={`text-[#bfa77b] ${
                      heroSettings?.subtitleSize === 'large' ? 'w-6 h-6' :
                      heroSettings?.subtitleSize === 'medium' ? 'w-5 h-5' : 'w-4 h-4'
                    }`} />
                    <span className={`text-[#bfa77b] tracking-widest ${
                      heroSettings?.subtitleSize === 'large' ? 'text-base sm:text-lg' :
                      heroSettings?.subtitleSize === 'medium' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                    }`}>
                      {heroSettings?.subtitle || 'NEW COLLECTION 2025'}
                    </span>
                  </div>
                )}
                <h1 className={`text-[#bfa77b] mb-4 md:mb-6 font-serif font-bold leading-tight ${
                  heroSettings?.titleSize === 'xlarge' ? 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl' :
                  heroSettings?.titleSize === 'large' ? 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl' :
                  heroSettings?.titleSize === 'medium' ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl' :
                  'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
                }`}>
                  {heroSettings?.title?.split(' ').map((word, i) => (
                    <span key={i}>
                      {word}
                      {i === 0 && <br />}
                      {i > 0 && ' '}
                    </span>
                  )) || <>Elegance<br />Redefined</>}
                </h1>
                {(heroSettings?.showDescription !== false) && (
                  <p className={`text-[#e7dcc8] mb-6 md:mb-8 leading-relaxed ${
                    heroSettings?.contentPosition === 'center' ? 'mx-auto' : ''
                  } ${
                    heroSettings?.descriptionSize === 'large' ? 'text-lg sm:text-xl md:text-2xl max-w-xl' :
                    heroSettings?.descriptionSize === 'medium' ? 'text-base sm:text-lg md:text-xl max-w-lg' :
                    'text-sm sm:text-base md:text-lg max-w-md'
                  }`}>
                    {heroSettings?.description || "Discover our exclusive collection of luxury women's clothing. Where sophistication meets style."}
                  </p>
                )}
                {(heroSettings?.showButton !== false) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(heroSettings?.buttonLink || '/shop')}
                    className={`bg-[#bfa77b] text-[#592a0d] rounded-full flex items-center gap-2 font-semibold tracking-wider transition-all hover:shadow-lg ${
                      heroSettings?.contentPosition === 'center' ? 'mx-auto' : ''
                    } ${
                      heroSettings?.buttonSize === 'large' ? 'px-8 sm:px-10 py-4 md:py-5 text-base sm:text-lg' :
                      heroSettings?.buttonSize === 'medium' ? 'px-6 sm:px-8 py-3 md:py-4 text-sm sm:text-base' :
                      'px-4 sm:px-6 py-2 md:py-3 text-xs sm:text-sm'
                    }`}
                  >
                    <span>{heroSettings?.buttonText || 'SHOP NOW'}</span>
                    <ArrowRight className={`${
                      heroSettings?.buttonSize === 'large' ? 'w-5 sm:w-6 h-5 sm:h-6' :
                      heroSettings?.buttonSize === 'medium' ? 'w-4 sm:w-5 h-4 sm:h-5' :
                      'w-3 sm:w-4 h-3 sm:h-4'
                    }`} />
                  </motion.button>
                )}
              </motion.div>
            </div>
          </div>
          
          {/* Image slideshow indicators */}
          {heroSettings?.mediaType === 'image' && heroSettings?.images?.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
              {heroSettings.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setHeroImageIndex(index)}
                  className={`transition-all rounded-full ${
                    index === heroImageIndex ? 'bg-[#bfa77b] w-8 h-2' : 'bg-white/50 w-2 h-2'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section className="py-8 md:py-12 mt-8 md:mt-12 relative">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-[#bfa77b] text-3xl md:text-5xl font-serif font-bold mb-4">Shop By Collection</h2>
              <p className="text-[#592a0d] text-base md:text-lg">Curated collections for every occasion</p>
            </motion.div>

            {loadingCategories ? (
              <div className="text-center py-8 text-[#592a0d]">Loading collections...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-[#592a0d]">No collections found.</div>
            ) : (
              <div className="flex flex-col gap-12 md:gap-16">
                {categories.map((cat, index) => (
                  <motion.div
                    key={cat._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-[35%_65%] gap-4 md:gap-6 items-center"
                  >
                    
                    <div className="relative w-full h-80 md:h-96 lg:h-[500px] flex items-center justify-center">
                      <img
                        src={cat.image ? getImageUrl(cat.image) : '/placeholder.png'}
                        alt={cat.name}
                        className="max-w-full max-h-full rounded-2xl"
                        style={{ 
                          objectFit: 'contain', 
                          objectPosition: 'center'
                        }}
                        loading="lazy"
                      />
                    </div>
                    {/* Text section */}
                    <div className="w-full text-center md:text-left">
                      <h3 className="text-[#592a0d] text-2xl md:text-3xl font-semibold mb-3">{cat.name}</h3>
                      <p className="text-[#592a0d] text-base md:text-lg mb-4 leading-relaxed">{cat.description}</p>
                      <div
                        onClick={() => navigate('/shop')}
                        className="flex items-center justify-center md:justify-start gap-2 text-[#bfa77b] hover:text-[#592a0d] transition-colors text-base font-medium cursor-pointer"
                      >
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Slider */}
        <section className="relative">
          <div className="container mx-auto py-12 md:py-20 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-[#bfa77b] text-3xl md:text-5xl font-serif font-bold mb-4">Featured Collection</h2>
              <p className="text-[#592a0d] text-base md:text-lg">Handpicked pieces just for you</p>
            </motion.div>

            <div className="relative max-w-6xl mx-auto">
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 md:-translate-x-6 bg-[#592a0d] text-[#bfa77b] p-2 md:p-3 rounded-full z-10 hover:bg-[#bfa77b] hover:text-[#592a0d] transition-all"
                onClick={prevSlide}
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 md:translate-x-6 bg-[#592a0d] text-[#bfa77b] p-2 md:p-3 rounded-full z-10 hover:bg-[#bfa77b] hover:text-[#592a0d] transition-all"
                onClick={nextSlide}
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="overflow-hidden px-2">
                {loadingFeatured ? (
                  <div className="text-center py-8 text-[#592a0d]">Loading featured products...</div>
                ) : featuredProducts.length === 0 ? (
                  <div className="text-center py-8 text-[#592a0d]">No featured products found.</div>
                ) : (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                  >
                    {getDisplayProducts().map((product, idx) => {
                      const imageUrl = product.images && product.images.length
                        ? product.images[0].startsWith('http')
                          ? product.images[0]
                          : getImageUrl(product.images[0])
                        : '';
                      const outOfStock = isProductOutOfStock(product);
                      return (
                        <ProductCard
                          key={`${product._id || product.id}-${currentSlide}-${idx}`}
                          id={product._id || product.id}
                          image={imageUrl}
                          title={product.name}
                          price={product.price}
                          category={product.category && typeof product.category === 'object' ? product.category.name : product.category}
                          description={product.description}
                          sizes={product.sizes}
                          status={product.status}
                          outOfStock={outOfStock}
                          onQuickView={() => {
                            setSelectedProduct(product);
                            setIsModalOpen(true);
                          }}
                        />
                      );
                    })}
                  </motion.div>
                )}
              </div>

              <div className="flex justify-center gap-2 mt-6 md:mt-8">
                {featuredProducts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all rounded-full ${
                      index === currentSlide ? 'bg-[#bfa77b] w-8 h-2' : 'bg-[#e7dcc8] w-2 h-2'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <NewsletterSection />

      <ProductModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={() => setIsModalOpen(false)}
      />
    </UserLayout>
  );
};

export default Home;
