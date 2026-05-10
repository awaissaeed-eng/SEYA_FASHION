import { motion } from 'motion/react';
import { Award, Heart, Sparkles, Users, TrendingUp, Shield } from 'lucide-react';
import UserLayout from '../../components/user/UserLayout';
import aboutImage from '../../assets/about2.png';

export default function About() {
  const whyChooseUs = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Only the finest fabrics and materials for our exclusive designs',
    },
    {
      icon: Heart,
      title: 'Crafted with Love',
      description: 'Every piece is carefully designed with attention to detail',
    },
    {
      icon: Sparkles,
      title: 'Luxury Designs',
      description: 'Timeless elegance meets modern sophistication',
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Dedicated to providing exceptional shopping experience',
    },
    {
      icon: TrendingUp,
      title: 'Latest Trends',
      description: 'Stay ahead with our curated fashion-forward collections',
    },
    {
      icon: Shield,
      title: 'Trusted Brand',
      description: 'Years of excellence in luxury women\'s fashion',
    },
  ];

  const timeline = [
    {
      year: '2018',
      title: 'The Beginning',
      description: 'SEYA Fashion was founded with a vision to bring luxury to everyday wear',
    },
    {
      year: '2020',
      title: 'Expansion',
      description: 'Launched our luxury line and expanded to international markets',
    },
    {
      year: '2022',
      title: 'Innovation',
      description: 'Introduced sustainable fabrics and eco-friendly practices',
    },
    {
      year: '2025',
      title: 'Present Day',
      description: 'Leading the luxury fashion industry with cutting-edge designs',
    },
  ];

  return (
    <UserLayout>
      {/* Hero Section */}
      <div className="relative h-[350px] sm:h-[450px] md:h-[550px] overflow-hidden bg-gradient-to-br from-[#592a0d] to-[#3b1d0a]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-32 h-32 sm:w-64 sm:h-64 bg-[#bfa77b] rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-48 h-48 sm:w-96 sm:h-96 bg-[#bfa77b] rounded-full blur-3xl"></div>
          </div>
          
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 h-full flex items-center justify-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl"
            >
              <h1 className="text-[#bfa77b] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-3 sm:mb-4 md:mb-6 px-2">Our Story</h1>
              <p className="text-[#e7dcc8] text-sm sm:text-base md:text-lg lg:text-xl mx-auto leading-relaxed px-4">
                Where elegance meets innovation. Discover the journey of SEYA Fashion and our commitment to luxury.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Brand Story */}
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-[#bfa77b] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 sm:mb-6">The SEYA Experience</h2>
              <div className="space-y-3 sm:space-y-4">
                <p className="text-[#592a0d] text-sm sm:text-base md:text-lg leading-relaxed">
                  SEYA Fashion was born from a passion for creating timeless elegance. We believe that 
                  every woman deserves to feel confident and beautiful in what she wears. Our collections 
                  are carefully curated to blend traditional craftsmanship with contemporary design.
                </p>
                <p className="text-[#592a0d] text-sm sm:text-base md:text-lg leading-relaxed">
                  Each piece in our collection tells a story of dedication, artistry, and attention to 
                  detail. From selecting the finest fabrics to the final stitch, we ensure that every 
                  garment meets our exacting standards of quality and luxury.
                </p>
                <p className="text-[#592a0d] text-sm sm:text-base md:text-lg leading-relaxed">
                  Our mission is to empower women through fashion, offering pieces that are not just 
                  clothing, but expressions of individuality and style.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-lg overflow-hidden aspect-[4/3] order-1 lg:order-2"
            >
              <img
                src={aboutImage}
                alt="SEYA Fashion Store"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-6 sm:mb-8 md:mb-12"
            >
              <h2 className="text-[#bfa77b] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 sm:mb-4">Why Choose SEYA</h2>
              <p className="text-[#592a0d] text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
                Discover what makes us the preferred choice for luxury women's fashion
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {whyChooseUs.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-transparent p-4 sm:p-6 md:p-8 rounded-lg shadow-lg border-2 border-[#e7dcc8] hover:border-[#bfa77b] transition-all group"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#bfa77b] to-[#d4bd8a] rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:shadow-lg transition-all">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#592a0d]" />
                  </div>
                  <h3 className="text-[#bfa77b] text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-[#592a0d] text-xs sm:text-sm md:text-base leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-[#bfa77b] text-3xl md:text-5xl font-serif font-bold mb-4">Our Journey</h2>
            <p className="text-[#592a0d] text-base md:text-lg">Milestones that shaped SEYA Fashion</p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex gap-4 md:gap-8 mb-8 md:mb-12 last:mb-0"
              >
                <div className="flex-shrink-0 w-20 md:w-32 text-right">
                  <span className="text-[#bfa77b] text-2xl md:text-3xl font-bold">{item.year}</span>
                </div>
                <div className="relative flex-shrink-0">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-[#bfa77b] rounded-full mt-1"></div>
                  {index !== timeline.length - 1 && (
                    <div className="absolute left-1/2 top-4 w-0.5 h-24 md:h-32 bg-[#e7dcc8] -ml-px"></div>
                  )}
                </div>
                <div className="flex-1 pb-4 md:pb-8">
                  <h3 className="text-[#bfa77b] text-lg md:text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-[#592a0d] text-sm md:text-base leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Designer Vision */}
        <section className="bg-gradient-to-r from-[#592a0d] to-[#3b1d0a] py-8 sm:py-10 md:py-12 lg:py-20">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-[#bfa77b] text-3xl md:text-5xl font-serif font-bold mb-6">Designer's Vision</h2>
                <p className="text-[#e7dcc8] text-base md:text-lg leading-relaxed mb-6">
                  "Fashion is not just about clothing, it's about creating an experience, a feeling, 
                  a moment of confidence. At SEYA, we craft pieces that celebrate the strength and 
                  elegance of modern women."
                </p>
                <p className="text-[#bfa77b] text-lg md:text-xl font-semibold">- Founder & Creative Director</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-[#bfa77b] text-3xl md:text-5xl font-serif font-bold mb-4">Our Values</h2>
            <p className="text-[#592a0d] text-base md:text-lg">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'Quality',
                description: 'We never compromise on the quality of our fabrics and craftsmanship',
              },
              {
                title: 'Sustainability',
                description: 'Committed to eco-friendly practices and sustainable fashion',
              },
              {
                title: 'Empowerment',
                description: 'Empowering women through fashion and confidence',
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#f5f1e8] p-6 md:p-8 rounded-lg text-center border-2 border-[#e7dcc8] hover:border-[#bfa77b] transition-all"
              >
                <h3 className="text-[#bfa77b] text-lg md:text-2xl font-semibold mb-3">{value.title}</h3>
                <p className="text-[#592a0d] text-sm md:text-base leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
    </UserLayout>
  );
}
