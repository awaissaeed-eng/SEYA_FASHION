const Review = require('../models/review');
const Product = require('../models/product');
const { createLog } = require('./activityLogController');

// ═══════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// Create a new review (PUBLIC - anyone can submit)
exports.createReview = async (req, res) => {
  try {
    const { product, customerName, customerEmail, rating, comment, orderId } = req.body;

    // Validate required fields
    if (!product || !customerName || !customerEmail || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Validate comment length
    if (comment.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment must not exceed 500 characters',
      });
    }

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Create review
    const review = await Review.create({
      product,
      customerName,
      customerEmail,
      rating,
      comment,
      orderId,
      isApproved: false, // Requires admin approval
    });

    console.log('Review submitted:', review._id);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! It will appear after admin approval.',
      review,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message,
    });
  }
};

// Get approved reviews for a product (PUBLIC)
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    // Get approved reviews only
    const reviews = await Review.find({
      product: productId,
      isApproved: true,
    })
      .sort('-createdAt')
      .select('-__v');

    // Calculate average rating
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    res.status(200).json({
      success: true,
      count: totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviews,
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// Get all reviews (ADMIN - includes pending)
exports.getAllReviews = async (req, res) => {
  try {
    const { status } = req.query; // 'all', 'pending', 'approved'

    let filter = {};
    if (status === 'pending') {
      filter.isApproved = false;
    } else if (status === 'approved') {
      filter.isApproved = true;
    }

    const reviews = await Review.find(filter)
      .populate('product', 'name images')
      .populate('approvedBy', 'firstName lastName')
      .sort('-createdAt')
      .select('-__v');

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

// Approve a review (ADMIN)
exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Review is already approved',
      });
    }

    review.isApproved = true;
    review.approvedBy = req.userId;
    review.approvedAt = new Date();
    await review.save();

    // Log activity
    if (req.userId) {
      await createLog(
        req.userId,
        'review_approved',
        `Approved review from ${review.customerName}`,
        'review',
        review._id,
        'Review'
      );
    }

    console.log('Review approved:', review._id);

    res.status(200).json({
      success: true,
      message: 'Review approved successfully',
      review,
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve review',
      error: error.message,
    });
  }
};

// Delete a review (ADMIN)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const reviewInfo = {
      customerName: review.customerName,
      rating: review.rating,
    };

    await Review.findByIdAndDelete(id);

    // Log activity
    if (req.userId) {
      await createLog(
        req.userId,
        'review_deleted',
        `Deleted review from ${reviewInfo.customerName} (${reviewInfo.rating} stars)`,
        'review',
        id,
        'Review'
      );
    }

    console.log('Review deleted:', id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message,
    });
  }
};

// Get review statistics (ADMIN)
exports.getReviewStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const pendingReviews = await Review.countDocuments({ isApproved: false });
    const approvedReviews = await Review.countDocuments({ isApproved: true });

    // Average rating across all approved reviews
    const approvedReviewsList = await Review.find({ isApproved: true });
    const averageRating = approvedReviewsList.length > 0
      ? approvedReviewsList.reduce((sum, review) => sum + review.rating, 0) / approvedReviewsList.length
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        total: totalReviews,
        pending: pendingReviews,
        approved: approvedReviews,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review statistics',
      error: error.message,
    });
  }
};
