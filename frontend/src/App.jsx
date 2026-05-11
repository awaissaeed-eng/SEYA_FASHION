import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Maintenance page
import Maintenance from './pages/user/Maintenance';

// User pages
import Home from './pages/user/home';
import Shop from './pages/user/shop';
import About from './pages/user/about';
import Support from './pages/user/support';
import ProductDetailPage from './pages/user/productDetail';
import ProductCardsPage from './pages/user/productCards';
import Cart from './pages/user/cart';
import Checkout from './pages/user/checkout';
import Billing from './pages/user/billing';
import OrderConfirmation from './pages/user/orderconfirmation';
import OrderTracking from './pages/user/orderTracking';
import Wishlist from './pages/user/wishlist';

// Admin pages
import Login from './pages/admin/login';
import ForgotPassword from './pages/admin/forgot-password';
import Dashboard from './pages/admin/dashboard';
import Products from './pages/admin/products';
import Orders from './pages/admin/orders';
import Settings from './pages/admin/settings';
import Categories from './pages/admin/categories';
import Subscribers from './pages/admin/subscribers';
import Links from './pages/admin/links';
import HeroSettings from './pages/admin/hero';
import AdminSupport from './pages/admin/support';
import Reviews from './pages/admin/reviews';

function App() {
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${API_BASE_URL}/maintenance/status`);
        setMaintenance(res.data.maintenance);
        setMaintenanceData(res.data);
      } catch (error) {
        // If cannot reach server, do not show maintenance
        console.error('Maintenance check failed:', error);
        setMaintenance(false);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();

    // Check every 60 seconds automatically
    const interval = setInterval(checkMaintenance, 60000);

    return () => clearInterval(interval);
  }, []);

  // Show loading state briefly
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center">
        <div className="text-[#592a0d] text-xl">Loading...</div>
      </div>
    );
  }

  // Show maintenance page for all users EXCEPT admin routes
  if (maintenance && !window.location.pathname.startsWith('/admin')) {
    return <Maintenance data={maintenanceData} />;
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public User Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/product-cards" element={<ProductCardsPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/support" element={<Support />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/orderconfirmation" element={<OrderConfirmation />} />
            <Route path="/track-order" element={<OrderTracking />} />
            
            {/* Public Admin Routes (Login/Forgot Password) */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/admin/categories" element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            } />
            <Route path="/admin/reviews" element={
              <ProtectedRoute>
                <Reviews />
              </ProtectedRoute>
            } />
            <Route path="/admin/subscribers" element={
              <ProtectedRoute>
                <Subscribers />
              </ProtectedRoute>
            } />
            <Route path="/admin/links" element={
              <ProtectedRoute>
                <Links />
              </ProtectedRoute>
            } />
            <Route path="/admin/hero" element={
              <ProtectedRoute>
                <HeroSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/support" element={
              <ProtectedRoute>
                <AdminSupport />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
