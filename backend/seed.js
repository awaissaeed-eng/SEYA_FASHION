const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Category = require('./models/category');
const Product = require('./models/product');
const User = require('./models/user');

dotenv.config();


const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'SEYA Fashion Admin',
      email: 'seyafashion1@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });
    console.log('✅ Admin user created:', adminUser.email);
    
    console.log('Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);
    
    // Get the first category for sample products
    const unstitchedCategory = createdCategories.find(cat => cat.name === 'Unstitched Suits');
    const readyToWearCategory = createdCategories.find(cat => cat.name === 'Ready to Wear');
    
    
    
    console.log('Creating sample products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Created ${createdProducts.length} products`);
    
    console.log('✅ Database seeded successfully!');
    console.log('Categories:', createdCategories.map(c => c.name).join(', '));
    console.log('Products:', createdProducts.map(p => p.name).join(', '));
    
    await mongoose.disconnect();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;