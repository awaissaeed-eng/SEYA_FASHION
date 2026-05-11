import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Mail, Instagram, Facebook, MessageCircle, CheckCircle, Twitter, Youtube } from 'lucide-react';
import logo from '../../assets/logo.png';
import axios from 'axios';

// Icon mapping for social platforms
const getSocialIcon = (platform, iconName) => {
  const iconMap = {
    facebook: Facebook,
    instagram: Instagram,
    whatsapp: MessageCircle,
    twitter: Twitter,
    youtube: Youtube,
  };
  
  const platformLower = platform?.toLowerCase() || '';
  return iconMap[platformLower] || MessageCircle;
};

export default function Maintenance({ data }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [socialLinks, setSocialLinks] = useState([]);

  // Fetch social links
  useEffect(() => {
    if (data.socialLinks && data.socialLinks.length > 0) {
      setSocialLinks(data.socialLinks);
    }
  }, [data.socialLinks]);

  // Countdown timer
  useEffect(() => {
    if (!data.endTime) return;

    const endTime = new Date(data.endTime);
    
    const timer = setInterval(() => {
      const now = new Date();
      const diff = endTime - now;

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        // Check if maintenance is over
        setTimeout(() => {
          window.location.reload();
        }, 5000);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [data.endTime]);

  // Email notification handler
  const handleNotify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.post(`${API_BASE_URL}/subscribers`, { email });
      setSubmitted(true);
      setMessage('Thank you! We will notify you when we are back online.');
      setEmail('');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already subscribed')) {
        setMessage('You are already subscribed! We will notify you when we are back.');
        setSubmitted(true);
      } else {
        setError('Something went wrong. Please try again later.');
      }
    }
  };

  const hasCountdown = data.endTime && (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a0a00] via-[#3d1508] to-[#1a0500] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#bfa77b]/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-2xl w-full text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <img 
            src={logo} 
            alt="Seya Fashion" 
            className="h-16 sm:h-20 md:h-24 mx-auto mb-4 filter drop-shadow-2xl"
          />
          <h1 
            className="text-[#bfa77b] text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            SEYA FASHION
          </h1>
        </motion.div>

        {/* Animated icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="mb-8"
        >
          <Settings className="w-16 h-16 sm:w-20 sm:h-20 text-[#bfa77b] mx-auto opacity-80" />
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          We'll Be Back Soon
        </motion.h2>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-300 text-base sm:text-lg md:text-xl mb-10 leading-relaxed px-4"
        >
          {data.message || 'We are upgrading our website to serve you better. Please check back soon.'}
        </motion.p>

        {/* Countdown timer */}
        {hasCountdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-12"
          >
            <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-xl mx-auto">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds }
              ].map((item, index) => (
                <div 
                  key={item.label}
                  className="bg-white/10 backdrop-blur-sm border-2 border-[#bfa77b]/30 rounded-xl p-3 sm:p-4 md:p-6"
                >
                  <motion.div
                    key={item.value}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-[#bfa77b] text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2"
                  >
                    {String(item.value).padStart(2, '0')}
                  </motion.div>
                  <div className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Email notification form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-12"
        >
          {!submitted ? (
            <form onSubmit={handleNotify} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white/95 text-[#592a0d] placeholder:text-gray-500 rounded-lg border-2 border-transparent focus:border-[#bfa77b] focus:outline-none transition-all text-sm sm:text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#bfa77b] hover:bg-[#d4a574] text-[#592a0d] px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base whitespace-nowrap"
                >
                  Notify Me
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-3 text-left">{error}</p>
              )}
            </form>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-500/20 border-2 border-green-500/50 rounded-lg p-4 sm:p-6 max-w-md mx-auto"
            >
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-green-300 text-base sm:text-lg font-medium">{message}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Social media icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center gap-6 mb-8 flex-wrap"
        >
          {socialLinks.length > 0 ? (
            socialLinks.map((link) => {
              const IconComponent = getSocialIcon(link.platform, link.icon);
              const url = link.platform === 'whatsapp' && link.phoneNumber
                ? `https://wa.me/${link.phoneNumber.replace(/[^0-9]/g, '')}`
                : link.url;

              return (
                <a
                  key={link._id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/10 hover:bg-[#bfa77b]/20 border-2 border-[#bfa77b]/30 hover:border-[#bfa77b] rounded-full flex items-center justify-center transition-all transform hover:scale-110"
                  aria-label={link.label}
                  title={link.label}
                >
                  <IconComponent className="w-5 h-5 text-[#bfa77b]" />
                </a>
              );
            })
          ) : (
            // Fallback to default links if no social links in database
            <>
              <a
                href="https://www.facebook.com/seyafashion"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/10 hover:bg-[#bfa77b]/20 border-2 border-[#bfa77b]/30 hover:border-[#bfa77b] rounded-full flex items-center justify-center transition-all transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-[#bfa77b]" />
              </a>
              <a
                href="https://www.instagram.com/seyafashion"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/10 hover:bg-[#bfa77b]/20 border-2 border-[#bfa77b]/30 hover:border-[#bfa77b] rounded-full flex items-center justify-center transition-all transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-[#bfa77b]" />
              </a>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/10 hover:bg-[#bfa77b]/20 border-2 border-[#bfa77b]/30 hover:border-[#bfa77b] rounded-full flex items-center justify-center transition-all transform hover:scale-110"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-[#bfa77b]" />
              </a>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-gray-500 text-sm"
        >
          © 2026 Seya Fashion. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
