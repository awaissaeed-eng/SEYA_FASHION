import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Menu, X } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu when clicking outside or on navigation
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-sidebar') && !event.target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f1e8]">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#592a0d] px-4 py-3 flex items-center justify-between lg:hidden shadow-lg">
        <h1 className="text-[#bfa77b] text-lg font-bold tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
          SEYA FASHION
        </h1>
        <button
          onClick={toggleMobileMenu}
          className="mobile-menu-button text-white hover:bg-[#6d3a18] p-3 rounded-lg transition-colors z-50 relative focus:outline-none focus:ring-2 focus:ring-[#bfa77b] active:bg-[#7a4520]"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          type="button"
          style={{ minWidth: '48px', minHeight: '48px' }}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile/Tablet Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar */}
          <div className="mobile-sidebar fixed left-0 top-0 bottom-0 z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
            <Sidebar onNavigate={closeMobileMenu} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <div className="hidden lg:block">
          <Topbar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="max-w-full lg:max-w-[1600px] mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
