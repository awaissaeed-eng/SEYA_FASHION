import { useState, useEffect } from 'react';
import { Star, StarHalf, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { reviewService } from '../../services/review';
import { useToast } from '../Toast';
import { tw } from '../../config/theme';

export default function ProductReviews({ productId }) {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    rating: 0,
    comment: '',
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getProductReviews(productId);
      setReviews(response.data.reviews || []);
      setAverageRating(response.data.averageRating || 0);
      setTotalReviews(response.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerEmail || !formData.rating || !formData.comment) {
      toast.error('Error', 'Please fill in all fields');
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      toast.error('Error', 'Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      await reviewService.createReview({
        product: productId,
        ...formData,
      });

      toast.success('Success', 'Review submitted! It will appear after admin approval.');
      
      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        rating: 0,
        comment: '',
      });
      setShowForm(false);
    } catch (error) {
      toast.error('Error', error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, size = 'w-5 h-5') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className={`${size} fill-[#bfa77b] text-[#bfa77b]`} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className={`${size} fill-[#bfa77b] text-[#bfa77b]`} />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className={`${size} text-gray-300`} />
      );
    }

    return stars;
  };

  const renderRatingSelector = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= formData.rating
                  ? 'fill-[#bfa77b] text-[#bfa77b]'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12">
      {/* Reviews Header */}
      <div className="mb-8">
        <h2 className={`text-2xl sm:text-3xl font-bold ${tw.primaryText} mb-4`} style={{ fontFamily: 'Playfair Display, serif' }}>
          Customer Reviews
        </h2>

        {totalReviews > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(averageRating)}</div>
              <span className={`text-2xl font-bold ${tw.primaryText}`}>
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-600">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        ) : (
          <p className="text-gray-600 mb-6">No reviews yet. Be the first to review this product!</p>
        )}

        <button
          onClick={() => setShowForm(!showForm)}
          className={`${tw.primaryBg} text-[#bfa77b] px-6 py-3 rounded-full hover:bg-[#6d3a18] transition-colors font-medium`}
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-[#faf8f5] rounded-xl p-6 mb-8 border border-[#e8dfd3]"
        >
          <h3 className={`text-xl font-semibold ${tw.primaryText} mb-4`}>Write Your Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${tw.primaryText} mb-2`}>
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#e8dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77b]"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${tw.primaryText} mb-2`}>
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#e8dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77b]"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${tw.primaryText} mb-2`}>
                Rating <span className="text-red-500">*</span>
              </label>
              {renderRatingSelector()}
            </div>

            <div>
              <label className={`block text-sm font-medium ${tw.primaryText} mb-2`}>
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                rows="4"
                maxLength="500"
                className="w-full px-4 py-2 border border-[#e8dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77b] resize-none"
                placeholder="Share your experience with this product..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.comment.length}/500 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full sm:w-auto ${tw.primaryBg} text-[#bfa77b] px-8 py-3 rounded-full hover:bg-[#6d3a18] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-[#e8dfd3] shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full ${tw.secondaryBg} flex items-center justify-center flex-shrink-0`}>
                  <User className={`w-6 h-6 ${tw.primaryText}`} />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div>
                      <h4 className={`font-semibold ${tw.primaryText}`}>{review.customerName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">{renderStars(review.rating, 'w-4 h-4')}</div>
                        <span className="text-sm text-gray-500">
                          {review.rating}.0
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          !showForm && (
            <div className="text-center py-12 bg-[#faf8f5] rounded-xl border border-[#e8dfd3]">
              <p className="text-gray-600">No reviews yet. Be the first to share your experience!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
