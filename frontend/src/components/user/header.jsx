import { useState, useEffect } from 'react';
import { optimizedCartService } from '../../services/optimizedCart';
import { getWishlistCount } from '../../utils/wishlist';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Heart } from 'lucide-react';
import logo from '../../assets/logo.png';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    async function fetchCartCount() {
      try {
        const res = await optimizedCartService.getCart();
        setCartCount(res.data.cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0);
      } catch {
        setCartCount(0);
      }
    }
    
    function updateWishlistCount() {
      setWishlistCount(getWishlistCount());
    }
    
    fetchCartCount();
    updateWishlistCount();
    
    window.addEventListener('cartUpdated', fetchCartCount);
    window.addEventListener('wishlistUpdated', updateWishlistCount);
    
    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
      window.removeEventListener('wishlistUpdated', updateWishlistCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-[#4a1f11] via-[#5b2b12] to-[#592a0d] text-[#bfa77b] shadow-lg">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 relative">
        <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
          {/* Left: Logo */}
          <Link to="/" className="flex flex-col items-start min-w-0 flex-shrink-0 hover:opacity-90 transition-opacity">
            <img 
              src={logo} 
              alt="SEYA Fashion" 
              className="w-auto object-contain max-h-[27px] sm:max-h-[30px] md:max-h-[38px] lg:max-h-[46px]"
            />
            <span className="sm:block text-[6px] sm:text-[9px] md:text-[8px] lg:text-[10px] text-[#e7dcc8]/80 tracking-wider font-light mt-0.5 whitespace-nowrap">
              Luxury Customize Women Clothing
            </span>
          </Link>

          {/* Center: Navigation - Hidden on small screens, visible on md+ */}
          <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center space-x-2 lg:space-x-4 xl:space-x-6">
            <Link to="/" className="text-sm lg:text-base tracking-wide px-2 lg:px-3 py-2 rounded-full hover:bg-[#bfa77b]/10 hover:text-[#bfa77b] transition-colors whitespace-nowrap">Home</Link>
            <Link to="/shop" className="text-sm lg:text-base tracking-wide px-2 lg:px-3 py-2 rounded-full hover:bg-[#bfa77b]/10 hover:text-[#bfa77b] transition-colors whitespace-nowrap">Shop</Link>
            <Link to="/about" className="text-sm lg:text-base tracking-wide px-2 lg:px-3 py-2 rounded-full hover:bg-[#bfa77b]/10 hover:text-[#bfa77b] transition-colors whitespace-nowrap">About</Link>
            <Link to="/support" className="text-sm lg:text-base tracking-wide px-2 lg:px-3 py-2 rounded-full hover:bg-[#bfa77b]/10 hover:text-[#bfa77b] transition-colors whitespace-nowrap">Support</Link>
          </nav>

          {/* Right: Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
            {/* Search */}
            <div className="relative flex items-center">
              {/* Search input - inline on desktop, overlay on mobile */}
              {isSearchOpen && (
                <>
                  {/* Mobile/Tablet: Full-width overlay below header */}
                  <div className="md:hidden fixed left-0 right-0 top-[60px] sm:top-[72px] px-3 sm:px-4 py-3 bg-gradient-to-b from-[#592a0d] to-[#4a1f11] shadow-lg z-50 border-t border-[#bfa77b]/20">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#f5f1e8] text-[#592a0d] placeholder:text-[#592a0d]/50 rounded-lg border-2 border-[#bfa77b] shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-[#bfa77b]/50 focus:border-[#bfa77b] transition-all"
                      autoFocus
                      onBlur={() => setTimeout(() => setIsSearchOpen(false), 150)}
                    />
                  </div>
                  
                  {/* Desktop: Inline search */}
                  <input
                    type="text"
                    placeholder="Search..."
                    className="hidden md:block w-40 lg:w-48 xl:w-64 px-3 py-1.5 lg:py-2 bg-[#f5f1e8] text-[#592a0d] placeholder:text-[#592a0d]/50 rounded-lg border-2 border-[#bfa77b] shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#bfa77b]/50 focus:border-[#bfa77b] transition-all mr-2"
                    autoFocus
                    onBlur={() => setTimeout(() => setIsSearchOpen(false), 150)}
                  />
                </>
              )}
              {/* Search button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hover:text-[#e7dcc8] transition-colors p-1.5 sm:p-2 rounded-full hover:bg-[#bfa77b]/10 flex items-center justify-center flex-shrink-0 touch-manipulation"
                aria-label="Search"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="hover:text-[#e7dcc8] transition-colors p-1.5 sm:p-2 rounded-full hover:bg-[#bfa77b]/10 relative flex items-center justify-center touch-manipulation" 
              aria-label="Wishlist"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 bg-[#bfa77b] text-[#592a0d] rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-bold min-w-[1.25rem] sm:min-w-[1.5rem] text-center shadow-lg">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="hover:text-[#e7dcc8] transition-colors p-1.5 sm:p-2 rounded-full hover:bg-[#bfa77b]/10 relative flex items-center justify-center touch-manipulation" 
              aria-label="Cart"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 bg-[#bfa77b] text-[#592a0d] rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-bold min-w-[1.25rem] sm:min-w-[1.5rem] text-center shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Navigation - Below header on small screens */}
        <nav className="md:hidden flex justify-center items-center space-x-3 sm:space-x-4 md:space-x-6 mt-2 pt-2 border-t border-[#bfa77b]/20 overflow-x-auto">
          <Link to="/" className="hover:text-[#e7dcc8] transition-colors text-xs sm:text-sm px-2 py-1 whitespace-nowrap touch-manipulation flex items-center" style={{ minHeight: '36px' }}>Home</Link>
          <Link to="/shop" className="hover:text-[#e7dcc8] transition-colors text-xs sm:text-sm px-2 py-1 whitespace-nowrap touch-manipulation flex items-center" style={{ minHeight: '36px' }}>Shop</Link>
          <Link to="/about" className="hover:text-[#e7dcc8] transition-colors text-xs sm:text-sm px-2 py-1 whitespace-nowrap touch-manipulation flex items-center" style={{ minHeight: '36px' }}>About</Link>
          <Link to="/support" className="hover:text-[#e7dcc8] transition-colors text-xs sm:text-sm px-2 py-1 whitespace-nowrap touch-manipulation flex items-center" style={{ minHeight: '36px' }}>Support</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
