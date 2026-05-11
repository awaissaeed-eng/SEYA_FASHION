const Category = require('../models/category');
const { createLog } = require('./activityLogController');
const { sendNotificationToSubscribers } = require('../utils/email');
const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinary');

// Get all categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory');

    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await require('../models/product').countDocuments({
          category: category._id,
          isActive: true
        });
        return {
          ...category.toObject(),
          productCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create category (admin)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, parentCategory } = req.body;
    let imageUrl = '';

    // Upload image to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'seya-fashion/categories',
        resource_type: 'image',
      });
      imageUrl = result.url;
    }

    const category = new Category({
      name,
      description,
      image: imageUrl,
      parentCategory: parentCategory || null,
    });

    await category.save();

    if (req.userId) {
      await createLog(req.userId, 'category_created', `Created category "${category.name}"`, 'category', category._id, category.name);
    }

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update category (admin)
exports.updateCategory = async (req, res, next) => {
  try {
    let updateData = { ...req.body };
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Upload new image to Cloudinary if provided
    if (req.file) {
      // Delete old image from Cloudinary
      if (category.image) {
        const oldPublicId = getPublicIdFromUrl(category.image);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId, 'image');
        }
      }

      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'seya-fashion/categories',
        resource_type: 'image',
      });
      updateData.image = result.url;
    }

    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (req.userId) {
      await createLog(req.userId, 'category_updated', `Updated category "${updatedCategory.name}"`, 'category', updatedCategory._id, updatedCategory.name);
    }

    res.status(200).json({
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete category (admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete image from Cloudinary
    if (category.image) {
      const publicId = getPublicIdFromUrl(category.image);
      if (publicId) {
        await deleteFromCloudinary(publicId, 'image');
      }
    }

    const categoryName = category.name;
    await Category.findByIdAndDelete(req.params.id);

    if (req.userId) {
      await createLog(req.userId, 'category_deleted', `Deleted category "${categoryName}"`, 'category', req.params.id, categoryName);
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
