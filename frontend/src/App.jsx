import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

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

function App() {
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
