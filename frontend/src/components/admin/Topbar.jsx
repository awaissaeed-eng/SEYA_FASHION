import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown, User, Settings, LogOut } from 'lucide-react';

// Simple classNames helper
function cn(...args) {
  return args.filter(Boolean).join(' ');
}

const getPageTitle = (pathname) => {
  const pageMap = {
    dashboard: 'Dashboard',
    orders: 'Orders Management',
    products: 'Products',
    categories: 'Categories',
    payments: 'Payments',
    links: 'Links',
    reports: 'Reports & Analytics',
    settings: 'Settings',
    subscribers: 'Subscribers',
    hero: 'Hero Settings',
    support: 'Support',
  };

  const match = pathname.match(/\/admin\/(\w+)/);
  return pageMap[match?.[1]] || 'Dashboard';
};

export default function Topbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const { user, logout, forceLogout } = useAuth();

  useEffect(() => {
    setPageTitle(getPageTitle(location.pathname));
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    
    const handleOutside = (e) => {
      // Don't close if clicking on the profile button itself
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, [profileOpen]);

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Desktop logout clicked!');
    setProfileOpen(false);
    
    // Force immediate logout
    forceLogout();
    
    // Navigate to login
    navigate('/admin/login');
  };

  const handleProfile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Settings clicked!');
    setProfileOpen(false);
    navigate('/admin/settings');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'SF';
  };

  return (
    <>
      {/* Desktop Topbar */}
      <header className="hidden lg:block bg-white border-b border-[#e8dfd3] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl xl:text-2xl font-bold text-[#592a0d]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {pageTitle}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          {/* Profile section with dropdown */}
          <div className="flex items-center gap-3 relative" ref={profileRef}>
            <div className="text-right hidden xl:block">
              <p className="text-sm font-medium text-[#592a0d]">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.email || 'Admin User'
                }
              </p>
              <p className="text-xs text-gray-600">
                {user?.email || 'admin@seyafashion.com'}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Profile button clicked, current state:', profileOpen);
                setProfileOpen((s) => {
                  console.log('Setting profileOpen to:', !s);
                  return !s;
                });
              }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#f5f1e8] transition-colors"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-[#592a0d] flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials()}
              </div>
              <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform', profileOpen && 'rotate-180')} />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 py-1"
                role="menu"
                aria-hidden={!profileOpen}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="px-4 py-3 border-b border-gray-100 xl:hidden">
                  <p className="text-sm font-medium text-[#592a0d] truncate">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.email || 'Admin User'
                    }
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.email || 'admin@seyafashion.com'}
                  </p>
                </div>
                <button
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-[#592a0d] hover:bg-[#f5f1e8] transition-colors"
                  onClick={handleProfile}
                  role="menuitem"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Topbar */}
      <header className="lg:hidden bg-white border-b border-[#e8dfd3] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-[#592a0d] truncate" style={{ fontFamily: 'Playfair Display, serif' }}>
              {pageTitle}
            </h1>
          </div>

          {/* Mobile Profile */}
          <div className="flex items-center gap-2 relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((s) => !s)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#f5f1e8] transition-colors"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#592a0d] flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials()}
              </div>
              <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform', profileOpen && 'rotate-180')} />
            </button>

            {/* Mobile Dropdown Menu */}
            {profileOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 py-1"
                role="menu"
                aria-hidden={!profileOpen}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-[#592a0d] truncate">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.email || 'Admin User'
                    }
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.email || 'admin@seyafashion.com'}
                  </p>
                </div>
                <button
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-[#592a0d] hover:bg-[#f5f1e8] transition-colors"
                  onClick={handleProfile}
                  role="menuitem"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
