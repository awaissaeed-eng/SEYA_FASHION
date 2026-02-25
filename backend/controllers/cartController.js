const Product = require('../models/product');
const { uploadToCloudinary } = require('../config/cloudinary');

// Cookie configuration
const CART_COOKIE_NAME = 'shopping_cart';
const CART_COOKIE_OPTIONS = {
  httpOnly: false,  // Allow JavaScript access for frontend updates
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/'
};

// Helper to parse cart from cookie
const getCartFromCookie = (req) => {
  try {
    const cartCookie = req.cookies[CART_COOKIE_NAME];
    if (!cartCookie) return { items: [] };
    
    // Cookie is already parsed by cookie-parser
    return typeof cartCookie === 'string' ? JSON.parse(cartCookie) : cartCookie;
  } catch (error) {
    console.error('Error parsing cart cookie:', error);
    return { items: [] };
  }
};

// Helper to save cart to cookie
const saveCartToCookie = (res, cart) => {
  try {
    res.cookie(CART_COOKIE_NAME, JSON.stringify(cart), CART_COOKIE_OPTIONS);
  } catch (error) {
    console.error('Error saving cart cookie:', error);
  }
};

// Helper to calculate cart totals
const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { totalItems, totalPrice };
};

// Get cart
exports.getCart = async (req, res) => {
  try {
    const cart = getCartFromCookie(req);
    
    // Populate product details for each item
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const product = await Product.findById(item.product)
            .select('name price thumbnail stock images sizes');
          
          return {
            ...item,
            product: product || null
          };
        } catch (error) {
          return { ...item, product: null };
        }
      })
    );
    
    // Filter out items with deleted products
    const validItems = populatedItems.filter(item => item.product !== null);
    
    // Update cart if items were removed
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      saveCartToCookie(res, cart);
    }
    
    const totals = calculateTotals(validItems);
    
    res.status(200).json({
      success: true,
      cart: {
        items: validItems,
        ...totals
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    let { productId, quantity, size, color, customSize } = req.body;

    // Parse customSize if it's a JSON string
    if (typeof customSize === 'string') {
      try {
        customSize = JSON.parse(customSize);
      } catch (parseError) {
        console.error('Failed to parse customSize JSON:', parseError);
        customSize = null;
      }
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // For custom size, skip stock check as it's made to order
    if (!customSize?.isCustom && product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const cart = getCartFromCookie(req);

    // Handle file uploads for custom size items
    let measurementFiles = [];
    if (customSize?.isCustom && req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const fileType = file.mimetype.startsWith('image/') ? 'image' : 'pdf';
          const uploadResult = await uploadToCloudinary(file.buffer, {
            folder: 'seya-fashion/measurements',
            resource_type: fileType === 'pdf' ? 'raw' : 'image'
          });
          
          measurementFiles.push({
            filename: uploadResult.public_id,
            originalName: file.originalname,
            url: uploadResult.url,
            fileType,
            uploadedAt: new Date()
          });
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          return res.status(500).json({ message: 'Failed to upload measurement file' });
        }
      }
    }

    // For custom size items, each item is unique (no combining)
    const existingItem = customSize?.isCustom ? null : cart.items.find(
      (item) =>
        item.product === productId &&
        item.size === size &&
        item.color === color &&
        !item.customSize?.isCustom
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const cartItem = {
        product: productId,
        quantity,
        size: customSize?.isCustom ? 'Custom Size' : size,
        color,
        price: product.price,
      };

      // Add custom size data if provided
      if (customSize?.isCustom) {
        cartItem.isCustomSize = true;
        cartItem.customSize = {
          isCustom: true,
          measurements: customSize.measurements || {},
          notes: customSize.notes || '',
          measurementFiles
        };
      }

      cart.items.push(cartItem);
    }

    // Save to cookie
    saveCartToCookie(res, cart);

    // Return populated cart
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const prod = await Product.findById(item.product)
          .select('name price thumbnail stock images sizes');
        return { ...item, product: prod };
      })
    );

    const totals = calculateTotals(cart.items);

    res.status(200).json({
      success: true,
      cart: {
        items: populatedItems,
        ...totals
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;

    const cart = getCartFromCookie(req);
    
    const cartItem = cart.items.find(
      (item) =>
        item.product === productId &&
        item.size === size &&
        item.color === color
    );

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) =>
          !(item.product === productId && item.size === size && item.color === color)
      );
    } else {
      cartItem.quantity = quantity;
    }

    // Save to cookie
    saveCartToCookie(res, cart);

    // Return populated cart
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.product)
          .select('name price thumbnail stock images sizes');
        return { ...item, product };
      })
    );

    const totals = calculateTotals(cart.items);

    res.status(200).json({
      success: true,
      cart: {
        items: populatedItems,
        ...totals
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId, size, color } = req.body;

    const cart = getCartFromCookie(req);
    
    cart.items = cart.items.filter(
      (item) =>
        !(item.product === productId && item.size === size && item.color === color)
    );

    // Save to cookie
    saveCartToCookie(res, cart);

    // Return populated cart
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.product)
          .select('name price thumbnail stock images sizes');
        return { ...item, product };
      })
    );

    const totals = calculateTotals(cart.items);

    res.status(200).json({
      success: true,
      cart: {
        items: populatedItems,
        ...totals
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = { items: [] };
    
    // Save empty cart to cookie
    saveCartToCookie(res, cart);

    res.status(200).json({
      success: true,
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
