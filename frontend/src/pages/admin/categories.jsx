import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { categoryService } from '../../services/category';
import { subscriberService } from '../../services/subscriber';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import { getImageUrl } from '../../utils/imageUrl';

export default function Categories() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [pendingEmailData, setPendingEmailData] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll();
      setCategories(response.data.categories);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setIsAddDialogOpen(true);
    setSelectedCategory(null);
    setFormData({ name: '', description: '', image: '' });
    setImagePreview('');
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image || '',
    });
    setImagePreview(category.image ? getImageUrl(category.image) : '');
    setIsAddDialogOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      toast.error('Validation Error', 'Please enter category name');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Validation Error', 'Please enter category description');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedCategory) {
        // Update existing category
        await categoryService.update(
          selectedCategory._id,
          formData.name,
          formData.description,
          formData.image
        );
        toast.success('Category Updated', 'Category has been updated successfully.');
      } else {
        // Create new category
        const response = await categoryService.create(
          formData.name,
          formData.description,
          formData.image
        );

        // Store category data for email confirmation
        setPendingEmailData({
          type: 'category',
          data: {
            name: formData.name,
            description: formData.description,
            image: response.data?.category?.image || ''
          }
        });
        
        // Show email confirmation modal
        setShowEmailConfirm(true);
        toast.success('Category Created', 'Category has been added successfully.');
      }

      // Refresh categories list
      await fetchCategories();

      // Close modal
      setIsAddDialogOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', description: '', image: '' });
      setImagePreview('');
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Failed to save category');
      console.error('Error saving category:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.delete(categoryId);
        await fetchCategories();
      } catch (err) {
        toast.error('Error', err.response?.data?.message || 'Failed to delete category');
        console.error('Error deleting category:', err);
      }
    }
  };

  // Handle sending email notification to subscribers
  const handleSendEmailNotification = async () => {
    if (!pendingEmailData) return;
    
    try {
      await subscriberService.sendNotification(pendingEmailData.type, pendingEmailData.data);
      toast.success('Emails Sent', 'Notification emails have been sent to all active subscribers.');
    } catch (err) {
      toast.error('Email Error', err.response?.data?.message || 'Failed to send email notifications');
      console.error('Error sending email notifications:', err);
    } finally {
      setPendingEmailData(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-xl sm:text-2xl lg:text-3xl font-bold">
            Categories Management
          </h2>
          <button
            onClick={handleAddCategory}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#592a0d] text-white rounded-lg hover:bg-[#6d3a18] transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-32 sm:h-64">
            <p className="text-gray-600 text-sm sm:text-base">Loading categories...</p>
          </div>
        ) : (
          <>
            {/* Categories Grid */}
            {categories.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-[#faf8f5] rounded-lg border border-[#e8dfd3]">
                <p className="text-gray-600 text-sm sm:text-base">No categories found. Create your first category!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="bg-white rounded-lg border border-[#e8dfd3] transition-all duration-300 overflow-hidden hover:shadow-lg group"
                  >
                    {/* Category Image */}
                    <div className="h-32 sm:h-40 lg:h-50 overflow-hidden bg-[#faf8f5] relative">
                      {category.image ? (
                        <img
                          src={getImageUrl(category.image)}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => { e.target.src = '/placeholder.png'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-sm">No Image</span>
                        </div>
                      )}
                      {/* Active Badge */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-xs font-semibold text-white ${
                            category.isActive ? 'bg-[#8b6f47]' : 'bg-gray-400'
                          }`}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Category Info */}
                    <div className="p-3 sm:p-4 space-y-3">
                      <div>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="font-semibold text-base sm:text-lg">
                          {category.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{category.description}</p>
                      </div>

                      {/* Product Count */}
                      <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[#faf8f5]">
                        <span className="text-xs sm:text-sm text-gray-600">Products</span>
                        <span className="text-xs sm:text-sm font-semibold text-[#592a0d]">{category.productCount || 0}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-[#bfa77b] text-[#592a0d] rounded-md hover:bg-[#bfa77b]/10 transition-colors text-xs sm:text-sm"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs sm:text-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tip Card */}
            <div className="bg-[#faf8f5] rounded-lg border border-[#e8dfd3] p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Tip:</strong> Add new categories using the "Add Category" button above.
              </p>
            </div>
          </>
        )}

        {/* Add/Edit Category Modal */}
        {isAddDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg border border-[#e8dfd3] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-[#e8dfd3] flex items-center justify-between">
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-2xl font-bold">
                    {selectedCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCategory ? 'Update category details' : 'Create a new category for your products'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setSelectedCategory(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Category Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-2">Category Image</label>
                  <div className="relative">
                    {imagePreview ? (
                      <div className="relative h-48 rounded-lg overflow-hidden border-2 border-[#e8dfd3] bg-[#faf8f5]">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                          <label className="cursor-pointer flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded-lg hover:bg-black/70">
                            <Upload className="w-4 h-4" />
                            Change Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              disabled={submitting}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[#e8dfd3] rounded-lg p-8 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-[#bfa77b] hover:bg-[#faf8f5] transition-colors">
                        <Upload className="w-8 h-8 text-[#bfa77b] mb-2" />
                        <span className="text-sm font-medium text-[#592a0d]">Click to upload image</span>
                        <span className="text-xs text-gray-600 mt-1">or drag and drop</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={submitting}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-2">Category Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g., Dresses, Accessories"
                    className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d]"
                    disabled={submitting}
                  />
                </div>

                {/* Category Description */}
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Enter category description"
                    rows="3"
                    className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d]"
                    disabled={submitting}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSaveCategory}
                    disabled={submitting}
                    className={`flex-1 px-4 py-2 text-white rounded-md transition-colors font-medium ${
                      submitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#592a0d] hover:bg-[#6d3a18]'
                    }`}
                  >
                    {submitting ? 'Saving...' : selectedCategory ? 'Update Category' : 'Add Category'}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setSelectedCategory(null);
                    }}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 border border-[#bfa77b] text-[#592a0d] rounded-md hover:bg-[#bfa77b]/10 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Confirmation Modal */}
        <ConfirmModal
          isOpen={showEmailConfirm}
          onClose={() => {
            setShowEmailConfirm(false);
            setPendingEmailData(null);
          }}
          onConfirm={handleSendEmailNotification}
          title="Send Email Notification"
          message="Would you like to send an email notification about this new collection to all active subscribers?"
          confirmText="Send Email"
          cancelText="Cancel"
          type="email"
        />
      </div>
    </AdminLayout>
  );
}
