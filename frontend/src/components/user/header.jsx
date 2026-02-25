import { useState, useEffect } from 'react';
import { cartService } from '../../services/cart';
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
        const res = await cartService.getCart();
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
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 relative">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Logo */}
          <Link to="/" className="flex flex-col items-start min-w-0 flex-shrink hover:opacity-90 transition-opacity">
            <img 
              src={logo} 
              alt="SEYA Fashion" 
              className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto"
            />
            <span className="text-[8px] sm:text-[9px] md:text-[10px] text-[#e7dcc8]/80 tracking-wider font-light mt-0.5">
              Luxury Customize Women Clothing
            </span>
          </Link>

          {/* Center: Navigation - Hidden on small screens, visible on md+ */}
          <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center space-x-3 lg:space-x-6">
            <Link to="/" className="text-sm md:text-base tracking-wide px-3 py-2 rounded-full hover:bg-[#bfa77b]/10 hover:text-[#bfa77b] transition-colors">Home</Link>
            <Link to="/shop" className="text-sm md:text-base tracking-wide px-3 py-2 rounded-full hover:bg-[#bfa77b]/10 hover:text-[#bfa77b] transition-colors">Shop</Link>
            <Link to="/about" className="text-sm md:text-base tracking-wide px-3 py-2 rounded-full hover:bg-[#bfa77b]/10 hover:text-[#bfa77b] transition-colors">About</Link>
            <Link to="/support" className="text-sm md:text-base tracking-wide px-3 py-2 rounded-full hover:bg-[#bfa77b]/10 hover:text-[#bfa77b] transition-colors">Support</Link>
          </nav>

          {/* Right: Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 mr-2 sm:mr-4 md:mr-8 flex-shrink-0">
            {/* Search */}
            <div className="relative flex items-center">
              {/* Search input - inline on desktop, overlay on mobile */}
              {isSearchOpen && (
                <>
                  {/* Mobile/Tablet: Full-width overlay below header */}
                  <div className="md:hidden fixed left-0 right-0 top-[72px] sm:top-[88px] px-4 py-3 bg-gradient-to-b from-[#592a0d] to-[#4a1f11] shadow-lg z-50 border-t border-[#bfa77b]/20">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full px-4 py-2.5 bg-[#f5f1e8] text-[#592a0d] placeholder:text-[#592a0d]/50 rounded-lg border-2 border-[#bfa77b] shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-[#bfa77b]/50 focus:border-[#bfa77b] transition-all"
                      autoFocus
                      onBlur={() => setTimeout(() => setIsSearchOpen(false), 150)}
                    />
                  </div>
                  
                  {/* Desktop: Inline search */}
                  <input
                    type="text"
                    placeholder="Search..."
                    className="hidden md:block w-48 lg:w-64 px-3 py-2 bg-[#f5f1e8] text-[#592a0d] placeholder:text-[#592a0d]/50 rounded-lg border-2 border-[#bfa77b] shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#bfa77b]/50 focus:border-[#bfa77b] transition-all mr-2"
                    autoFocus
                    onBlur={() => setTimeout(() => setIsSearchOpen(false), 150)}
                  />
                </>
              )}
              {/* Search button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hover:text-[#e7dcc8] transition-colors p-2 rounded-full hover:bg-[#bfa77b]/10 flex-shrink-0"
                aria-label="Search"
              >
                <Search size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Profile */}
            {/* <button className="hover:text-[#e7dcc8] transition-colors p-2 rounded-full hover:bg-[#bfa77b]/10" aria-label="Profile"> */}
              {/* <User size={20} className="sm:w-6 sm:h-6" /> */}
            {/* </button> */}

            {/* Wishlist */}
            <Link to="/wishlist" className="hover:text-[#e7dcc8] transition-colors p-2 rounded-full hover:bg-[#bfa77b]/10 relative" aria-label="Wishlist">
              <Heart size={20} className="sm:w-6 sm:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#bfa77b] text-[#592a0d] rounded-full px-2 py-0.5 text-xs font-bold min-w-[1.5rem] text-center shadow-lg">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="hover:text-[#e7dcc8] transition-colors p-2 rounded-full hover:bg-[#bfa77b]/10 relative" aria-label="Cart">
              <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#bfa77b] text-[#592a0d] rounded-full px-2 py-0.5 text-xs font-bold min-w-[1.5rem] text-center shadow-lg animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Navigation - Below header on small screens */}
        <nav className="md:hidden flex justify-center space-x-4 sm:space-x-6 mt-3 pb-1 border-t border-[#bfa77b]/20 pt-3">
          <Link to="/" className="hover:text-[#e7dcc8] transition-colors text-xs sm:text-sm px-2">Home</Link>
          <Link to="/shop" className="hover:text-[#e7dcc8] transition-colors text-xs sm:text-sm px-2">Shop</Link>
          <Link to="/about" className="hover:text-[#e7dcc8] transition-colors text-xs sm:text-sm px-2">About</Link>
          <Link to="/support" className="hover:text-[#e7dcc8] transition-colors text-xs sm:text-sm px-2">Support</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
