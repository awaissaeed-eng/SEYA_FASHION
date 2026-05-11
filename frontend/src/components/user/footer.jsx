import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { FaTiktok } from "react-icons/fa";
import { footerLinksService } from '../../services/footerLinks';

const Footer = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchLinks() {
      setLoading(true);
      try {
        const res = await footerLinksService.getAll();
        setLinks(res.data.grouped);
      } catch (err) {
        setLinks({ social: [], quick: [], contact: [] });
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();
  }, []);

  // Use grouped links from backend
  const socialLinks = links.social || [];
  const quickLinks = links.quick || [];
  const contactLinks = links.contact || [];

  // Icon mapping
  const iconMap = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    tiktok: FaTiktok,
    mail: Mail,
    phone: Phone,
    map: MapPin,
    location: MapPin,
    mappin: MapPin,
    address: MapPin,
    external: ExternalLink,
  };

  return (
    <footer className="mt-8 sm:mt-10 md:mt-12">
      <div className="bg-[#592a0d] text-[#e7dcc8]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Left Column: Logo and Description */}
            <div className="flex flex-col sm:col-span-2 lg:col-span-1">
              <Link to="/" className="text-xl sm:text-2xl md:text-3xl font-serif font-semibold text-[#bfa77b] hover:text-[#e7dcc8] transition-colors mb-2 sm:mb-3">
                SEYA Fashion
              </Link>
              <p className="text-xs sm:text-sm md:text-base mb-3 sm:mb-4 leading-relaxed text-[#f0e7da] max-w-md">
                Elevate your style with our exclusive collection of luxury women's clothing. Crafted with elegance and designed for the modern woman.
              </p>
              {/* Social Icons as rounded badges */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-4">
                {socialLinks.map(link => {
                  const Icon = iconMap[link.icon] || ExternalLink;
                  return (
                    <a 
                      key={link._id} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#bfa77b]/10 flex items-center justify-center text-[#bfa77b] hover:bg-[#bfa77b] hover:text-[#592a0d] transition touch-manipulation"
                      aria-label={link.label}
                    >
                      <Icon size={18} className="sm:w-5 sm:h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Middle Column: Quick Links */}
            <div className="flex flex-col">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#bfa77b] mb-2 sm:mb-3">Quick Links</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm md:text-base">
                <li>
                  <Link to="/track-order" className="hover:text-[#bfa77b] transition-colors inline-block py-1">Track Order</Link>
                </li>
                {quickLinks.map(link => (
                  <li key={link._id}>
                    <Link to={link.url} className="hover:text-[#bfa77b] transition-colors inline-block py-1">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Contact Us */}
            <div className="flex flex-col">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#bfa77b] mb-2 sm:mb-3">Contact Us</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base">
                {contactLinks.map(link => {
                  const Icon = iconMap[link.icon] || ExternalLink;
                  return (
                    <li key={link._id} className="flex items-start gap-2 sm:gap-3">
                      <Icon size={16} className="text-[#bfa77b] flex-shrink-0 mt-0.5 sm:w-[18px] sm:h-[18px]" />
                      <span className="text-[#f0e7da] break-words">{link.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          {/* Divider Line */}
          <div className="border-t border-[#bfa77b]/30 mt-4 sm:mt-6 pt-4 sm:pt-6 text-center text-xs sm:text-sm text-[#f0e7da]">
            © 2025 SEYA Fashion. All rights reserved. Designed with elegance.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
