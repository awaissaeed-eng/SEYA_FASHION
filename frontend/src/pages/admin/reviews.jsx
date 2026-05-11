import { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle, Clock, Filter, Package } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { reviewService } from '../../services/review';
import { useToast } from '../../components/Toast';

export default function Reviews() {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewService.getAllReviews();
      setReviews(response.data.reviews || []);
    } catch (error) {
      toast.error('Error', 'Failed to fetch reviews');
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    setActionLoading(reviewId);
    try {
      await reviewService.approveReview(reviewId);
      toast.success('Success', 'Review approved successfully');
      fetchReviews();
    } catch (error) {
      toast.error('Error', error.response?.data?.message || 'Failed to approve review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setActionLoading(reviewId);
    try {
      await reviewService.deleteReview(reviewId);
      toast.success('Success', 'Review deleted successfully');
      fetchReviews();
    } catch (error) {
      toast.error('Error', error.response?.data?.message || 'Failed to delete review');
    } finally {
      setActionLoading(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-[#bfa77b] text-[#bfa77b]' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !review.isApproved;
    if (filter === 'approved') return review.isApproved;
    return true;
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => !r.isApproved).length,
    approved: reviews.filter((r) => r.isApproved).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#592a0d]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Product Reviews
            </h1>
            <p className="text-gray-600 mt-1">Manage customer reviews and ratings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 border border-[#e8dfd3] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                <p className="text-3xl font-bold text-[#592a0d]">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-[#f5f1e8] rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-[#bfa77b]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e8dfd3] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e8dfd3] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl p-4 border border-[#e8dfd3] shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-[#592a0d] text-[#bfa77b]'
                    : 'bg-[#f5f1e8] text-[#592a0d] hover:bg-[#e8dfd3]'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                Approved ({stats.approved})
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-xl border border-[#e8dfd3] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#592a0d] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No reviews found</p>
              <p className="text-gray-500 text-sm mt-2">
                {filter === 'pending' && 'No pending reviews at the moment'}
                {filter === 'approved' && 'No approved reviews yet'}
                {filter === 'all' && 'No reviews have been submitted yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f5f1e8] border-b border-[#e8dfd3]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#592a0d]">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#592a0d]">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#592a0d]">Rating</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#592a0d]">Comment</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#592a0d]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#592a0d]">Date</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#592a0d]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8dfd3]">
                  {filteredReviews.map((review) => (
                    <tr key={review._id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#f5f1e8] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-[#bfa77b]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#592a0d] truncate">
                              {review.product?.name || 'Product Deleted'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-[#592a0d]">{review.customerName}</p>
                          <p className="text-xs text-gray-500">{review.customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm font-medium text-[#592a0d]">{review.rating}.0</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                          {review.comment}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {review.isApproved ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {!review.isApproved && (
                            <button
                              onClick={() => handleApprove(review._id)}
                              disabled={actionLoading === review._id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve Review"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(review._id)}
                            disabled={actionLoading === review._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Review"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
