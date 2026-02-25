const User = require('../models/user');
const { createLog } = require('./activityLogController');
const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinary');
const validator = require('validator');

// Validate name fields
const validateName = (name) => {
  return name && 
         typeof name === 'string' && 
         name.trim().length >= 1 && 
         name.trim().length <= 50 &&
         /^[a-zA-Z\s'-]+$/.test(name.trim());
};

// Validate phone number
const validatePhone = (phone) => {
  if (!phone) return true; // Optional field
  return typeof phone === 'string' && 
         phone.trim().length >= 10 && 
         phone.trim().length <= 20 &&
         /^[\d\s\-\+\(\)]+$/.test(phone.trim());
};

// Validate email format
const validateEmail = (email) => {
  return validator.isEmail(email) && email.length <= 254;
};

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address, avatar } = req.body;

    // Validate inputs
    if (firstName && !validateName(firstName)) {
      return res.status(400).json({ message: 'Invalid first name format' });
    }

    if (lastName && !validateName(lastName)) {
      return res.status(400).json({ message: 'Invalid last name format' });
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Sanitize inputs
    const updateData = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (phone) updateData.phone = phone.trim();
    if (address && typeof address === 'object') {
      updateData.address = {
        street: address.street ? address.street.trim() : '',
        city: address.city ? address.city.trim() : '',
        state: address.state ? address.state.trim() : '',
        zipCode: address.zipCode ? address.zipCode.trim() : '',
        country: address.country ? address.country.trim() : '',
      };
    }
    if (avatar && typeof avatar === 'string') updateData.avatar = avatar.trim();

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete avatar from Cloudinary if exists
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      const publicId = getPublicIdFromUrl(user.avatar);
      if (publicId) {
        await deleteFromCloudinary(publicId, 'image');
      }
    }

    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).populate('wishlist');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate('wishlist');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update admin profile
exports.updateAdminProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, role, bio } = req.body;
    
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    if (bio !== undefined) updateData.bio = bio;

    // Handle avatar upload to Cloudinary
    if (req.file) {
      // Delete old avatar from Cloudinary if exists
      if (user.avatar && user.avatar.includes('cloudinary.com')) {
        const oldPublicId = getPublicIdFromUrl(user.avatar);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId, 'image');
        }
      }

      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'seya-fashion/avatars',
        resource_type: 'image',
      });
      updateData.avatar = result.url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    );

    await createLog(req.userId, 'profile_updated', 'Updated admin profile', 'user', updatedUser._id, updatedUser.firstName + ' ' + updatedUser.lastName);

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change admin password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    await createLog(req.userId, 'password_changed', 'Changed password', 'user', user._id, user.firstName + ' ' + user.lastName);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload avatar only
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      const oldPublicId = getPublicIdFromUrl(user.avatar);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId, 'image');
      }
    }

    // Upload new avatar to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'seya-fashion/avatars',
      resource_type: 'image',
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { avatar: result.url },
      { new: true }
    );

    await createLog(req.userId, 'avatar_updated', 'Updated avatar', 'user', updatedUser._id, updatedUser.firstName + ' ' + updatedUser.lastName);

    res.status(200).json({
      success: true,
      avatar: updatedUser.avatar,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
