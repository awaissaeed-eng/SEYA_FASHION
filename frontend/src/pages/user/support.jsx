import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronDown,
  Truck,
  RotateCcw,
  CreditCard,
  Shield,
  HelpCircle
} from 'lucide-react';
import UserLayout from '../../components/user/UserLayout';
import { useToast } from '../../components/Toast';
import * as supportService from '../../services/support';

const ICON_MAP = {
  truck: Truck,
  rotateCcw: RotateCcw,
  creditCard: CreditCard,
  shield: Shield,
  mapPin: MapPin,
  phone: Phone,
  mail: Mail,
};

const getIcon = (iconName) => ICON_MAP[iconName] || HelpCircle;

export default function Support() {
  const toast = useToast();
  const [openFaq, setOpenFaq] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Data from API
  const [cards, setCards] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [contactInfo, setContactInfo] = useState([]);
  const [whatsapp, setWhatsapp] = useState(null);
  const [policies, setPolicies] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [emailError, setEmailError] = useState('');

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    if (email && !isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cardsRes, faqsRes, contactRes, whatsappRes, policiesRes] = await Promise.all([
        supportService.getSupportCards(),
        supportService.getFAQs(),
        supportService.getContactInfo(),
        supportService.getWhatsAppSettings(),
        supportService.getPolicies(),
      ]);
      setCards(cardsRes.cards || []);
      setFaqs(faqsRes.faqs || []);
      setContactInfo(contactRes.contactInfo || []);
      setWhatsapp(whatsappRes.settings);
      setPolicies(policiesRes.policies || []);
    } catch (err) {
      console.error('Error loading support data:', err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email before submitting
    if (!isValidEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      toast.error('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    try {
      await supportService.sendContactMessage(formData);
      toast.success('Message Sent', 'Thank you for contacting us! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setEmailError('');
    } catch (err) {
      toast.error('Error', 'Failed to send message. Please try again.');
    }
  };

  const openWhatsApp = () => {
    if (whatsapp?.phoneNumber) {
      window.open(`https://wa.me/${whatsapp.phoneNumber}`, '_blank');
    }
  };

  return (
    <UserLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#592a0d] to-[#3b1d0a] py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-[#bfa77b] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-3 sm:mb-4 md:mb-6 px-2">Customer Support</h1>
            <p className="text-[#e7dcc8] text-sm sm:text-base md:text-lg leading-relaxed px-4">
              We're here to help. Find answers to common questions or get in touch with our team.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Quick Support Options */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {cards.map((card, index) => {
            const IconComp = getIcon(card.icon);
            return (
              <motion.div
                key={card._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg border-2 border-[#e7dcc8] text-center hover:border-[#bfa77b] transition-all"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-[#f5f1e8] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <IconComp className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#bfa77b]" />
                </div>
                <h3 className="text-[#bfa77b] text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-[#592a0d] text-xs sm:text-sm md:text-base leading-relaxed">{card.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 sm:py-10 md:py-12 lg:py-20">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-[#bfa77b] text-3xl md:text-5xl font-serif font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-[#592a0d] text-base md:text-lg">Find answers to common questions</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-transparent rounded-lg shadow-lg border-2 border-[#e7dcc8] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-4 md:px-6 py-3 md:py-4 flex justify-between items-center hover:bg-[#f5f1e8] transition-all"
                >
                  <span className="text-[#592a0d] text-left text-sm md:text-base font-medium">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#bfa77b] transition-transform flex-shrink-0 ml-4 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 md:px-6 pb-3 md:pb-4"
                  >
                    <p className="text-[#592a0d] text-sm md:text-base leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[#bfa77b] text-3xl md:text-5xl font-serif font-bold mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#592a0d] text-sm md:text-base font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 md:py-3 rounded-lg border-2 border-[#e7dcc8] focus:border-[#bfa77b] focus:outline-none bg-white text-[#592a0d] text-sm md:text-base"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-[#592a0d] text-sm md:text-base font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  required
                  className={`w-full px-4 py-2 md:py-3 rounded-lg border-2 ${emailError ? 'border-red-500' : 'border-[#e7dcc8]'} focus:border-[#bfa77b] focus:outline-none bg-white text-[#592a0d] text-sm md:text-base`}
                  placeholder="your@email.com"
                />
                {emailError && (
                  <p className="text-red-500 text-xs mt-1">{emailError}</p>
                )}
              </div>
              <div>
                <label className="block text-[#592a0d] text-sm md:text-base font-semibold mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-4 py-2 md:py-3 rounded-lg border-2 border-[#e7dcc8] focus:border-[#bfa77b] focus:outline-none bg-white text-[#592a0d] text-sm md:text-base"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="block text-[#592a0d] text-sm md:text-base font-semibold mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-2 md:py-3 rounded-lg border-2 border-[#e7dcc8] focus:border-[#bfa77b] focus:outline-none bg-white text-[#592a0d] text-sm md:text-base resize-none"
                  placeholder="Your message..."
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-[#592a0d] text-[#bfa77b] py-3 md:py-4 rounded-full font-semibold transition-all hover:shadow-lg text-sm md:text-base"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[#bfa77b] text-3xl md:text-5xl font-serif font-bold mb-6">Get In Touch</h2>
            <div className="space-y-4 md:space-y-6">
              {contactInfo.map((info) => {
                const IconComp = getIcon(info.icon);
                return (
                  <div key={info._id} className="bg-white p-4 md:p-6 rounded-lg shadow-lg border-2 border-[#e7dcc8]">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-[#f5f1e8] rounded-full flex items-center justify-center flex-shrink-0">
                        <IconComp className="w-5 h-5 md:w-6 md:h-6 text-[#bfa77b]" />
                      </div>
                      <div>
                        <h4 className="text-[#bfa77b] text-lg md:text-xl font-semibold mb-2">{info.title}</h4>
                        <p className="text-[#592a0d] text-sm md:text-base leading-relaxed whitespace-pre-line">
                          {info.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {whatsapp?.active && (
                <div className="bg-gradient-to-r from-[#592a0d] to-[#3b1d0a] p-4 md:p-6 rounded-lg shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#bfa77b]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-[#bfa77b]" />
                    </div>
                    <div>
                      <h4 className="text-[#bfa77b] text-lg md:text-xl font-semibold mb-1">WhatsApp Support</h4>
                      <p className="text-[#e7dcc8] text-xs md:text-sm">{whatsapp.subtitle}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openWhatsApp}
                    className="w-full bg-[#bfa77b] text-[#592a0d] py-2 md:py-3 rounded-full font-semibold transition-all hover:shadow-lg text-sm md:text-base"
                  >
                    {whatsapp.buttonText}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Policies Section */}
      <section className="py-8 sm:py-10 md:py-12 lg:py-20">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-[#bfa77b] text-3xl md:text-5xl font-serif font-bold mb-4">Our Policies</h2>
            <p className="text-[#592a0d] text-base md:text-lg">Important information about our services</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {policies.map((policy, index) => (
              <motion.div
                key={policy._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-transparent p-4 md:p-6 rounded-lg shadow-lg border-2 border-[#e7dcc8] hover:border-[#bfa77b] transition-all"
              >
                <h3 className="text-[#bfa77b] text-lg md:text-2xl font-semibold mb-4">{policy.title}</h3>
                {policy.contentType === 'bullets' ? (
                  <ul className="space-y-2">
                    {policy.content.split('\n').filter(line => line.trim()).map((point, i) => (
                      <li key={i} className="text-[#592a0d] text-xs md:text-sm flex items-start gap-2 leading-relaxed">
                        <span className="text-[#bfa77b] mt-0.5 flex-shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#592a0d] text-xs md:text-sm leading-relaxed whitespace-pre-line">{policy.content}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
