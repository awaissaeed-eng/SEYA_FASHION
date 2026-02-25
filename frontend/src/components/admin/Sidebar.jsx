import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  Link2,
  Settings,
  ChevronLeft,
  Store,
  Mail,
  Image,
  HeadphonesIcon,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Simple classNames helper
function cn(...args) {
  return args.filter(Boolean).join(' ');
}

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, forceLogout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      if (width < 1024) {
        setCollapsed(false); // Always expanded on mobile/tablet
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleToggle = () => {
    if (!isMobile) {
      setCollapsed((c) => !c);
    }
  };

  const handleNavigation = (to) => {
    if (onNavigate) {
      onNavigate(); // Close mobile menu
    }
    navigate(to);
  };

  const handleLogout = async () => {
    try {
      forceLogout();
      if (onNavigate) onNavigate();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, to: '/admin/orders' },
    { id: 'products', label: 'Products', icon: Package, to: '/admin/products' },
    { id: 'categories', label: 'Categories', icon: FolderTree, to: '/admin/categories' },
    { id: 'hero', label: 'Hero Section', icon: Image, to: '/admin/hero' },
    { id: 'subscribers', label: 'Subscribers', icon: Mail, to: '/admin/subscribers' },
    { id: 'links', label: 'Links', icon: Link2, to: '/admin/links' },
    { id: 'support', label: 'Support', icon: HeadphonesIcon, to: '/admin/support' },
    { id: 'settings', label: 'Settings', icon: Settings, to: '/admin/settings' },
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'SF';
  };

  const sidebarWidth = isMobile ? 'w-80' : (collapsed ? 'w-16' : 'w-64');

  return (
    <div
      className={cn(
        'bg-[#592a0d] text-white h-screen transition-all duration-300 ease-in-out flex flex-col border-r border-[#7a4520] shadow-xl',
        sidebarWidth
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#7a4520] flex items-center justify-between">
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-[#bfa77b] flex-shrink-0" />
            <h1 className="text-[#bfa77b] text-lg font-bold tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
              SEYA FASHION
            </h1>
          </div>
        )}
        {collapsed && !isMobile && <Store className="w-6 h-6 text-[#bfa77b] mx-auto" />}
      </div>

      {/* User Profile Section - Mobile/Tablet */}
      {isMobile && (
        <div className="p-4 border-b border-[#7a4520] bg-[#6d3a18]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#bfa77b] text-[#592a0d] flex items-center justify-center font-semibold">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.email || 'Admin User'
                }
              </p>
              <p className="text-xs text-gray-300 truncate">
                {user?.email || 'admin@seyafashion.com'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.to)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left',
                isActive
                  ? 'bg-[#6d3a18] text-white shadow-lg shadow-[#bfa77b]/20 border border-[#bfa77b]/30'
                  : 'text-gray-300 hover:bg-[#6d3a18]/50 hover:text-white',
                collapsed && !isMobile && 'justify-center px-2'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || isMobile) && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-2 border-t border-[#7a4520] space-y-1">
        {/* Mobile Logout Button */}
        {isMobile && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        )}

        {/* Desktop Collapse Button */}
        {!isMobile && (
          <button
            onClick={handleToggle}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#6d3a18]/50 transition-all duration-200',
              collapsed && 'justify-center px-2'
            )}
          >
            <ChevronLeft className={cn('w-5 h-5 transition-transform duration-300', collapsed && 'rotate-180')} />
            {!collapsed && <span className="font-medium">Collapse</span>}
          </button>
        )}
      </div>
    </div>
  );
}
