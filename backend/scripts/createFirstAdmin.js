/**
 * Create First Admin User
 * 
 * This script creates the first admin account for your Seya Fashion store.
 * Run this ONCE when setting up the system for the first time.
 * 
 * Usage:
 *   node scripts/createFirstAdmin.js
 * 
 * After creating the first admin, all future admin accounts must be created
 * by logged-in admins through the admin panel.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createFirstAdmin() {
  try {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('   SEYA FASHION - Create First Admin Account');
    console.log('═══════════════════════════════════════════════════════\n');

    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database\n');

    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  WARNING: An admin account already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('\nIf you need to create another admin, log in with an existing');
      console.log('admin account and use the admin panel.\n');
      
      const proceed = await question('Do you want to create another admin anyway? (yes/no): ');
      if (proceed.toLowerCase() !== 'yes') {
        console.log('\nOperation cancelled.');
        process.exit(0);
      }
      console.log('');
    }

    // Get admin details
    console.log('Enter admin account details:\n');
    
    const firstName = await question('First Name: ');
    if (!firstName || firstName.trim().length === 0) {
      console.error('❌ First name is required');
      process.exit(1);
    }

    const lastName = await question('Last Name: ');
    if (!lastName || lastName.trim().length === 0) {
      console.error('❌ Last name is required');
      process.exit(1);
    }

    const email = await question('Email: ');
    if (!email || !email.includes('@')) {
      console.error('❌ Valid email is required');
      process.exit(1);
    }

    const password = await question('Password (min 6 characters): ');
    if (!password || password.length < 6) {
      console.error('❌ Password must be at least 6 characters');
      process.exit(1);
    }

    const confirmPassword = await question('Confirm Password: ');
    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match');
      process.exit(1);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      console.error('\n❌ A user with this email already exists');
      console.error('Email:', existingUser.email);
      console.error('Role:', existingUser.role);
      process.exit(1);
    }

    // Create admin user
    console.log('\nCreating admin account...');
    const admin = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: 'admin',
      isActive: true,
    });

    console.log('\n✅ Admin account created successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Admin Details:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('ID:', admin._id);
    console.log('Name:', admin.firstName, admin.lastName);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('You can now log in at: http://localhost:3000/admin/login\n');
    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('1. Keep these credentials safe');
    console.log('2. The register API is now admin-only');
    console.log('3. Only logged-in admins can create new admin accounts');
    console.log('4. Strangers cannot create admin accounts anymore\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
createFirstAdmin();
