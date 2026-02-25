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
    <footer className="mt-12">
      <div className="bg-[#592a0d] text-[#e7dcc8] mt-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-10">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Left Column: Logo and Description */}
            <div className="flex flex-col">
              <Link to="/" className="text-2xl md:text-3xl lg:text-4xl font-serif font-semibold text-[#bfa77b] hover:text-[#e7dcc8] transition-colors mb-3">
                SEYA Fashion
              </Link>
              <p className="text-sm md:text-base lg:text-base mb-4 leading-relaxed text-[#f0e7da] max-w-md">
                Elevate your style with our exclusive collection of luxury women's clothing. Crafted with elegance and designed for the modern woman.
              </p>
              {/* Social Icons as rounded badges */}
              <div className="flex space-x-3 mt-4">
                {socialLinks.map(link => {
                  const Icon = iconMap[link.icon] || ExternalLink;
                  return (
                    <a key={link._id} href={link.url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#bfa77b]/10 flex items-center justify-center text-[#bfa77b] hover:bg-[#bfa77b] hover:text-[#592a0d] transition">
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Middle Column: Quick Links */}
            <div className="flex flex-col">
              <h3 className="text-lg md:text-2xl font-semibold text-[#bfa77b] mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm md:text-base">
                {quickLinks.map(link => (
                  <li key={link._id}>
                    <Link to={link.url} className="hover:text-[#bfa77b] transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Contact Us */}
            <div className="flex flex-col">
              <h3 className="text-lg md:text-2xl font-semibold text-[#bfa77b] mb-3">Contact Us</h3>
              <ul className="space-y-3 text-sm md:text-base">
                {contactLinks.map(link => {
                  const Icon = iconMap[link.icon] || ExternalLink;
                  return (
                    <li key={link._id} className="flex items-center gap-3">
                      <Icon size={18} className="text-[#bfa77b] flex-shrink-0" />
                      <span className="text-[#f0e7da]">{link.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          {/* Divider Line */}
          <div className="border-t border-[#bfa77b]/30 mt-6 pt-6 text-center text-sm text-[#f0e7da]">
            © 2025 SEYA Fashion. All rights reserved. Designed with elegance.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
