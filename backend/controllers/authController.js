const User = require('../models/user');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Validate email format
const validateEmail = (email) => {
  return validator.isEmail(email) && email.length <= 254;
};

// Validate password strength
const validatePassword = (password) => {
  return password && 
         typeof password === 'string' && 
         password.length >= 6 && 
         password.length <= 128;
};

// Validate name fields
const validateName = (name) => {
  return name && 
         typeof name === 'string' && 
         name.trim().length >= 1 && 
         name.trim().length <= 50 &&
         /^[a-zA-Z\s'-]+$/.test(name.trim());
};

// Register User (ADMIN-ONLY)
// Only admins can create new admin accounts
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, role } = req.body;

    console.log('Registration attempt by admin:', req.userId);
    console.log('Creating user with role:', role || 'user');

    // Input validation
    if (!validateName(firstName)) {
      console.error('Registration failed: Invalid first name');
      return res.status(400).json({ message: 'Please provide a valid first name' });
    }

    if (!validateName(lastName)) {
      console.error('Registration failed: Invalid last name');
      return res.status(400).json({ message: 'Please provide a valid last name' });
    }

    if (!validateEmail(email)) {
      console.error('Registration failed: Invalid email');
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (!validatePassword(password)) {
      console.error('Registration failed: Invalid password');
      return res.status(400).json({ message: 'Password must be between 6-128 characters' });
    }

    if (password !== confirmPassword) {
      console.error('Registration failed: Passwords do not match');
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Validate role if provided
    if (role && !['user', 'admin'].includes(role)) {
      console.error('Registration failed: Invalid role:', role);
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Sanitize inputs
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.toLowerCase().trim();
    const userRole = role || 'user';

    // Check if user exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      console.error('Registration failed: User already exists:', cleanEmail);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      password,
      role: userRole,
    });

    console.log('User created successfully:', user._id);
    console.log('User email:', user.email);
    console.log('User role:', user.role);
    console.log('Created by admin:', req.userId);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      message: `${userRole === 'admin' ? 'Admin' : 'User'} account created successfully`,
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Login User
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ message: 'Please provide a password' });
    }

    // Sanitize email
    const cleanEmail = email.toLowerCase().trim();

    // Find user and include password field
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
};

// Logout (optional, mainly client-side)
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
