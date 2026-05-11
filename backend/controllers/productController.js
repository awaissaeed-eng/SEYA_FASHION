const Product = require('../models/product');
const Order = require('../models/order');
const { createLog } = require('./activityLogController');
const { sendNotificationToSubscribers } = require('../utils/email');
const { uploadToCloudinary, deleteFromCloudinary, deleteMultipleFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinary');
const { validateSearchInput, escapeRegex, validateSortField } = require('../middleware/securityMiddleware');

// Allowed sort fields for products
const ALLOWED_SORT_FIELDS = ['name', 'price', 'createdat', 'stock', 'updatedat'];

// Get all products (admin - includes inactive products)
exports.getAllProductsAdmin = async (req, res, next) => {
  try {
    const { category, search, sort, page = 1, limit = 0 } = req.query;

    let query = {}; // No isActive filter for admin

    // Secure search implementation
    if (search) {
      const sanitizedSearch = validateSearchInput(search);
      if (sanitizedSearch) {
        const escapedSearch = escapeRegex(sanitizedSearch);
        query.$or = [
          { name: { $regex: escapedSearch, $options: 'i' } },
          { description: { $regex: escapedSearch, $options: 'i' } },
        ];
      }
    }

    // Secure category filter
    if (category && typeof category === 'string' && category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category;
    }

    // Secure sort implementation
    let sortOption = { createdAt: -1 };
    if (sort && typeof sort === 'string') {
      const [field, order] = sort.split(':');
      const validField = validateSortField(field, ALLOWED_SORT_FIELDS);
      if (validField) {
        const sortOrder = order === 'desc' ? -1 : 1;
        sortOption = { [validField]: sortOrder };
      }
    }

    // Secure pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(0, Math.min(100, parseInt(limit) || 0)); // Max 100 items per page

    let productsQuery = Product.find(query)
      .populate('category')
      .sort(sortOption);

    if (limitNum > 0) {
      const skip = (pageNum - 1) * limitNum;
      productsQuery = productsQuery.skip(skip).limit(limitNum);
    }

    const products = await productsQuery;
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
      products,
    });
  } catch (error) {
    console.error('getAllProductsAdmin error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, search, sort, page = 1, limit = 0 } = req.query;

    let query = { isActive: true };

    // Secure search implementation
    if (search) {
      const sanitizedSearch = validateSearchInput(search);
      if (sanitizedSearch) {
        const escapedSearch = escapeRegex(sanitizedSearch);
        query.$or = [
          { name: { $regex: escapedSearch, $options: 'i' } },
          { description: { $regex: escapedSearch, $options: 'i' } },
        ];
      }
    }

    // Secure category filter
    if (category && typeof category === 'string' && category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category;
    }

    // Secure sort implementation
    let sortOption = { createdAt: -1 };
    if (sort && typeof sort === 'string') {
      const [field, order] = sort.split(':');
      const validField = validateSortField(field, ALLOWED_SORT_FIELDS);
      if (validField) {
        const sortOrder = order === 'desc' ? -1 : 1;
        sortOption = { [validField]: sortOrder };
      }
    }

    // Secure pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(0, Math.min(100, parseInt(limit) || 0)); // Max 100 items per page

    let productsQuery = Product.find(query)
      .populate('category')
      .sort(sortOption);

    if (limitNum > 0) {
      const skip = (pageNum - 1) * limitNum;
      productsQuery = productsQuery.skip(skip).limit(limitNum);
    }

    const products = await productsQuery;
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
      products,
    });
  } catch (error) {
    console.error('getAllProducts error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category').populate('reviews.user', 'firstName lastName avatar');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const productObj = product.toObject();
    if (productObj.sizes && productObj.sizes.length > 0) {
      productObj.sizes = productObj.sizes.filter(s => s.quantity > 0);
    }
    
    res.status(200).json({
      success: true,
      product: productObj,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product (admin)
exports.createProduct = async (req, res, next) => {
  try {
    const { sizes, details, ...productData } = req.body;
    let images = [];

    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        uploadToCloudinary(file.buffer, {
          folder: 'seya-fashion/products',
          resource_type: 'image',
        })
      );
      const uploadResults = await Promise.all(uploadPromises);
      images = uploadResults.map(result => ({
        url: result.url,
        public_id: result.public_id,
      }));
    }

    const product = new Product({
      ...productData,
      images: images.map(img => img.url),
      imagePublicIds: images.map(img => img.public_id),
      sizes: sizes || [],
      details: details || '',
    });
    await product.save();
    
    if (req.userId) {
      await createLog(req.userId, 'product_created', `Created product "${product.name}"`, 'product', product._id, product.name);
    }
    
    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update product (admin)
exports.updateProduct = async (req, res, next) => {
  try {
    let { sizes, details, existingImages, ...updateData } = req.body;
    
    // Parse sizes from JSON string
    if (typeof sizes === 'string') {
      try {
        sizes = JSON.parse(sizes);
      } catch (e) {
        sizes = [];
      }
    }
    
    // Fallback: Parse sizes from FormData format
    if (sizes === undefined || sizes === null) {
      const parsedSizes = [];
      const sizeKeys = Object.keys(req.body).filter(key => key.startsWith('sizes['));
      const sizeIndices = [...new Set(sizeKeys.map(key => {
        const match = key.match(/sizes\[(\d+)\]/);
        return match ? parseInt(match[1]) : null;
      }).filter(idx => idx !== null))];
      
      sizeIndices.forEach(idx => {
        const size = req.body[`sizes[${idx}][size]`];
        const quantity = req.body[`sizes[${idx}][quantity]`];
        if (size && quantity !== undefined) {
          parsedSizes.push({ size, quantity: parseInt(quantity) });
        }
      });
      
      sizes = parsedSizes.length > 0 ? parsedSizes : [];
    }
    
    if (sizes && !Array.isArray(sizes) && typeof sizes === 'object') {
      sizes = Object.values(sizes);
    }
    
    if (!Array.isArray(sizes)) {
      sizes = [];
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Parse existing images to keep
    let imagesToKeep = [];
    if (existingImages) {
      try {
        imagesToKeep = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
        console.log('Images to keep:', imagesToKeep);
      } catch (e) {
        console.error('Error parsing existingImages:', e);
        imagesToKeep = [];
      }
    } else {
      console.log('No existingImages provided, will keep all current images');
      // If no existingImages provided, keep all current images (backward compatibility)
      imagesToKeep = product.images || [];
    }

    // Find images to delete from Cloudinary
    const currentImages = product.images || [];
    const imagesToDelete = currentImages.filter(img => !imagesToKeep.includes(img));
    
    // Delete removed images from Cloudinary
    if (imagesToDelete.length > 0) {
      const publicIdsToDelete = imagesToDelete
        .map(url => getPublicIdFromUrl(url))
        .filter(id => id !== null);
      
      if (publicIdsToDelete.length > 0) {
        await deleteMultipleFromCloudinary(publicIdsToDelete, 'image');
      }
    }

    // Upload new images to Cloudinary
    let newImages = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        uploadToCloudinary(file.buffer, {
          folder: 'seya-fashion/products',
          resource_type: 'image',
        })
      );
      const uploadResults = await Promise.all(uploadPromises);
      newImages = uploadResults.map(result => result.url);
    }

    // Combine existing and new images
    updateData.images = [...imagesToKeep, ...newImages];
    console.log('Final images array:', updateData.images);

    // Process sizes
    const validSizes = sizes
      .map(s => ({
        size: s.size,
        quantity: parseInt(s.quantity) || 0
      }))
      .filter(s => s.quantity > 0);
    
    updateData.sizes = validSizes;
    updateData.stock = validSizes.reduce((sum, s) => sum + s.quantity, 0);

    if (details !== undefined) {
      updateData.details = details;
    }

    Object.assign(product, updateData);
    await product.save();

    if (req.userId) {
      await createLog(req.userId, 'product_updated', `Updated product "${product.name}"`, 'product', product._id, product.name);
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete product (admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Mark product as deleted in all orders (preserve order history)
    await Order.updateMany(
      { 'products.product': req.params.id },
      { $set: { 'products.$.productExists': false } }
    );
    
    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const publicIds = product.images
        .map(url => getPublicIdFromUrl(url))
        .filter(id => id !== null);
      
      if (publicIds.length > 0) {
        await deleteMultipleFromCloudinary(publicIds, 'image');
      }
    }
    
    const productName = product.name;
    await Product.findByIdAndDelete(req.params.id);
    
    if (req.userId) {
      await createLog(req.userId, 'product_deleted', `Deleted product "${productName}"`, 'product', req.params.id, productName);
    }
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully. Order history preserved.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add review to product
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = {
      user: req.userId,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.calculateAverageRating();
    await product.save();

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category')
      .limit(8);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
