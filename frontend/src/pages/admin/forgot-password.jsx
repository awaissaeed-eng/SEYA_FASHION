import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Shield, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '../../components/Toast';

export default function AdminForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call - in production, this would send reset email
    setTimeout(() => {
      // Password reset logic would go here
      setIsSubmitted(true);
      setLoading(false);
    }, 1000);
  };

  const handleResend = () => {
    // Resend logic would go here
    toast.success('Email Sent', 'Reset email has been resent!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden bg-[#f5f1e8]">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.05, 0.03],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#bfa77b] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.03, 0.05, 0.03],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#592a0d] rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#592a0d] to-[#3b1d0a] rounded-full mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-[#bfa77b]" />
          </div>
          <h2 className="text-2xl font-bold text-[#592a0d] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isSubmitted ? 'Check Your Email' : 'Reset Password'}
          </h2>
          <p className="text-[#592a0d]/70">
            {isSubmitted
              ? "We've sent you a reset link"
              : 'Enter your email to reset your password'}
          </p>
        </motion.div>

        {/* Form or Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8 border border-[#bfa77b]/20"
        >
          {!isSubmitted ? (
            // Reset Form
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f5f1e8] rounded-full mb-4">
                  <Mail className="w-8 h-8 text-[#bfa77b]" />
                </div>
                <p className="text-[#592a0d]/70 text-sm">
                  No worries! Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-[#592a0d] font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#bfa77b]" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@seyafashion.com"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none transition-all bg-[#f5f1e8]/30 text-[#592a0d] placeholder:text-[#592a0d]/40 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg transition-all shadow-lg font-medium ${
                  loading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#592a0d] to-[#3b1d0a] text-[#bfa77b] hover:shadow-xl'
                }`}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </motion.button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="w-full flex items-center justify-center gap-2 text-[#bfa77b] hover:text-[#592a0d] transition-colors py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </form>
          ) : (
            // Success State
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center space-y-6"
            >
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Check className="w-10 h-10 text-green-600" />
                </motion.div>
              </div>

              {/* Success Message */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#592a0d]">Email Sent!</h3>
                <p className="text-[#592a0d]/70">We've sent a password reset link to</p>
                <p className="text-[#bfa77b] font-medium">{email}</p>
              </div>

              {/* Instructions */}
              <div className="bg-[#f5f1e8] rounded-lg p-4 text-left">
                <h4 className="text-[#592a0d] font-medium mb-2 text-sm">What's next?</h4>
                <ul className="space-y-2 text-sm text-[#592a0d]/70">
                  <li className="flex items-start gap-2">
                    <span className="text-[#bfa77b] mt-1">1.</span>
                    <span>Check your email inbox (and spam folder)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#bfa77b] mt-1">2.</span>
                    <span>Click the reset link in the email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#bfa77b] mt-1">3.</span>
                    <span>Create a new password</span>
                  </li>
                </ul>
              </div>

              {/* Resend Link */}
              <div className="pt-4 border-t border-[#e7dcc8]">
                <p className="text-sm text-[#592a0d]/70 mb-3">Didn't receive the email?</p>
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-[#bfa77b] hover:text-[#592a0d] transition-colors font-medium"
                >
                  Resend Email
                </button>
              </div>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="w-full flex items-center justify-center gap-2 text-[#bfa77b] hover:text-[#592a0d] transition-colors py-2 mt-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 space-y-3"
        >
          {!isSubmitted && (
            <p className="text-[#592a0d]/70 text-sm">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/admin/login')}
                className="text-[#bfa77b] hover:text-[#592a0d] transition-colors"
              >
                Sign In
              </button>
            </p>
          )}
          <button
            onClick={() => navigate('/')}
            className="text-[#bfa77b] hover:text-[#592a0d] transition-colors block w-full"
          >
            ← Back to Home
          </button>
        </motion.div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 text-xs text-[#592a0d]/50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Your security is our priority</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
