import { useMemo, useState, useEffect } from 'react';
import { SizeStockInput } from '../../components/admin/SizeStockInput';
import RichTextEditor from '../../components/admin/RichTextEditor';
import AdminLayout from '../../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Search, Grid3x3, List, X, Upload } from 'lucide-react';
import { productService } from '../../services/product';
import { categoryService } from '../../services/category';
import { subscriberService } from '../../services/subscriber';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import { getImageUrl } from '../../utils/imageUrl';

const getStockBadge = (stock) => {
  if (stock === 0) {
    return <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">Out of Stock</span>;
  }
  if (stock < 5) {
    return <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[#d4a574] text-[#592a0d]">Low Stock</span>;
  }
  return <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[#8b6f47] text-white">In Stock</span>;
};

const getStatusBadge = (isActive) => {
  if (isActive) {
    return <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">Active</span>;
  }
  return <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white">Inactive</span>;
};

export default function Products() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [pendingEmailData, setPendingEmailData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    images: [], // always an array
    sizes: [], // [{ size: 'M', quantity: 10 }]
    isActive: true, // Add isActive field
  });

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllAdmin(); // Use admin endpoint
      setProducts(response.data.products);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data.categories.filter(cat => cat.isActive));
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleAddProduct = () => {
    setIsAddDialogOpen(true);
    setSelectedProduct(null);
    setFormData({ name: '', category: '', price: '', stock: '', description: '', images: [], sizes: [], isActive: true });
    setImagePreview('');
  };

  const handleEditProduct = async (product) => {
    try {
      // Always fetch fresh product data from backend to ensure we have latest sizes
      const response = await productService.getById(product._id);
      const freshProduct = response.data.product;
      
      setSelectedProduct(freshProduct);
      
      // Filter out sizes with quantity <= 0 (sold out sizes)
      const validSizes = Array.isArray(freshProduct.sizes) 
        ? freshProduct.sizes.filter(s => s.quantity > 0)
        : [];
      
      setFormData({
        name: freshProduct.name,
        category: freshProduct.category?._id || '',
        price: freshProduct.price.toString(),
        stock: freshProduct.stock.toString(),
        description: freshProduct.description,
        images: freshProduct.images || [],
        sizes: validSizes,
        details: freshProduct.details || '',
        isActive: freshProduct.isActive !== undefined ? freshProduct.isActive : true,
      });
      setImagePreview(freshProduct.images?.[0] ? getImageUrl(freshProduct.images[0]) : '');
      setIsAddDialogOpen(true);
    } catch (err) {
      console.error('Error fetching product:', err);
      toast.error('Error', 'Failed to load product data');
    }
  };

  const handleReplaceImage = (index) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          images: prev.images.map((img, i) => i === index ? file : img)
        }));
      }
    };
    input.click();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 5;
    const maxSize = 50 * 1024 * 1024; // 50MB per image
    const validFiles = files.filter(file => file.size <= maxSize).slice(0, maxImages - formData.images.length);
    if (validFiles.length < files.length) {
      toast.warning('Warning', 'Some images were too large or exceeded the limit.');
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    if (formData.images.length === 1) {
      setImagePreview('');
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name.trim()) {
      toast.error('Validation Error', 'Please enter product name');
      return;
    }
    if (!formData.category) {
      toast.error('Validation Error', 'Please select a category');
      return;
    }
    if (!formData.price) {
      toast.error('Validation Error', 'Please enter product price');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Validation Error', 'Please enter product description');
      return;
    }
    // Calculate total stock from sizes (0 if no sizes)
    const totalStock = formData.sizes && formData.sizes.length > 0 
      ? formData.sizes.reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0)
      : 0;
    setSubmitting(true);
    try {
      if (selectedProduct) {
        // Update existing product
        await productService.update(
          selectedProduct._id,
          formData.name,
          formData.category,
          formData.price,
          totalStock,
          formData.description,
          formData.images,
          formData.sizes,
          formData.details || '',
          formData.isActive
        );
        toast.success('Product Updated', 'Product has been updated successfully.');
      } else {
        // Create new product
        const response = await productService.create(
          formData.name,
          formData.category,
          formData.price,
          totalStock,
          formData.description,
          formData.images,
          formData.sizes,
          formData.details || '',
          formData.isActive
        );

        // Store product data for email confirmation
        setPendingEmailData({
          type: 'product',
          data: {
            name: formData.name,
            price: formData.price,
            description: formData.description,
            image: response.data?.product?.images?.[0] || ''
          }
        });
        
        // Show email confirmation modal
        setShowEmailConfirm(true);
        toast.success('Product Created', 'Product has been added successfully.');
      }

      // Close modal first to prevent stale data display
      setIsAddDialogOpen(false);
      setSelectedProduct(null);
      setFormData({ name: '', category: '', price: '', stock: '', description: '', images: [], sizes: [], isActive: true });
      setImagePreview('');
      
      // Refresh products list from backend
      await fetchProducts();
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Failed to save product');
      console.error('Error saving product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(productId);
        await fetchProducts();
      } catch (err) {
        toast.error('Error', err.response?.data?.message || 'Failed to delete product');
        console.error('Error deleting product:', err);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-2xl sm:text-3xl font-bold">
            Products Management
          </h2>
          <button
            onClick={handleAddProduct}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-[#592a0d] text-white rounded-lg hover:bg-[#6d3a18] transition-colors shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Search and View Toggle */}
            <div className="bg-white rounded-lg border border-[#e8dfd3] p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d] text-sm sm:text-base"
                  />
                </div>
                <div className="flex gap-1 border border-[#e8dfd3] rounded-lg p-1 bg-white w-full sm:w-fit">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 sm:flex-none p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-[#592a0d] text-white' : 'text-[#592a0d] hover:bg-gray-100'}`}
                  >
                    <Grid3x3 className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 sm:flex-none p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-[#592a0d] text-white' : 'text-[#592a0d] hover:bg-gray-100'}`}
                  >
                    <List className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-[#faf8f5] rounded-lg border border-[#e8dfd3]">
                <p className="text-gray-600">{searchQuery ? 'No products found matching your search.' : 'No products yet. Create your first product!'}</p>
              </div>
            ) : (
              <>
                {/* Products Display - Grid View */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-lg border border-[#e8dfd3] hover:shadow-lg transition-all duration-300 overflow-hidden group"
                      >
                        <div className="aspect-square overflow-hidden bg-[#faf8f5]">
                          {product.images?.[0] ? (
                            <img
                              src={getImageUrl(product.images[0])}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={e => { e.target.src = '/placeholder.png'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="text-sm">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 sm:p-4 space-y-2">
                          <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="font-semibold truncate text-sm sm:text-base">
                            {product.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{product.category?.name || ''}</p>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span style={{ color: '#592a0d' }} className="font-semibold text-sm sm:text-base">Rs. {product.price?.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</span>
                            <div className="flex flex-col gap-1">
                              {getStockBadge(product.stock)}
                              {getStatusBadge(product.isActive)}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-2 border border-[#bfa77b] text-[#592a0d] rounded-md hover:bg-[#bfa77b]/10 transition-colors text-xs sm:text-sm"
                            >
                              <Pencil className="w-3 h-3" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs sm:text-sm"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* List View - Responsive */
                  <div className="bg-white rounded-lg border border-[#e8dfd3] overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-[#e8dfd3]">
                      <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-lg md:text-xl font-semibold">
                        All Products ({filteredProducts.length})
                      </h3>
                    </div>
                    
                    {/* Desktop Table View - Hidden on mobile */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-[#faf8f5] border-b border-[#e8dfd3]">
                            <th className="px-6 py-3 text-left text-sm font-semibold text-[#592a0d]">Image</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-[#592a0d]">Name</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-[#592a0d]">Category</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-[#592a0d]">Price</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-[#592a0d]">Stock</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-[#592a0d]">Status</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-[#592a0d]">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((product) => (
                            <tr key={product._id} className="border-b border-[#e8dfd3] hover:bg-[#faf8f5] transition-colors">
                              <td className="px-6 py-4">
                                {product.images?.[0] ? (
                                  <img
                                    src={getImageUrl(product.images[0])}
                                    alt={product.name}
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded bg-[#faf8f5] flex items-center justify-center text-xs text-gray-400">
                                    No img
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-[#592a0d] font-medium">{product.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name || ''}</td>
                              <td className="px-6 py-4 text-sm font-semibold text-[#592a0d]">Rs. {product.price?.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</td>
                              <td className="px-6 py-4 text-sm">{getStockBadge(product.stock)}</td>
                              <td className="px-6 py-4 text-sm">{getStatusBadge(product.isActive)}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="p-2 text-[#592a0d] hover:bg-[#bfa77b]/10 rounded-lg transition-colors"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product._id)}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View - Hidden on desktop */}
                    <div className="lg:hidden divide-y divide-[#e8dfd3]">
                      {filteredProducts.map((product) => (
                        <div key={product._id} className="p-4 hover:bg-[#faf8f5] transition-colors">
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              {product.images?.[0] ? (
                                <img
                                  src={getImageUrl(product.images[0])}
                                  alt={product.name}
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[#faf8f5] flex items-center justify-center text-xs text-gray-400">
                                  No img
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm sm:text-base font-semibold text-[#592a0d] truncate">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                    {product.category?.name || 'No category'}
                                  </p>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="p-2 text-[#592a0d] hover:bg-[#bfa77b]/10 rounded-lg transition-colors"
                                    title="Edit Product"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product._id)}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm sm:text-base font-bold text-[#592a0d]">
                                    Rs. {product.price?.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                                  </span>
                                  <div className="flex flex-col gap-1 text-xs sm:text-sm">
                                    {getStockBadge(product.stock)}
                                    {getStatusBadge(product.isActive)}
                                  </div>
                                </div>
                              </div>

                              {/* Size info for mobile */}
                              {product.sizes && product.sizes.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-[#e8dfd3]">
                                  <p className="text-xs text-gray-500">
                                    Sizes: {product.sizes.map(s => `${s.size} (${s.quantity})`).join(', ')}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Tip Card */}
            <div className="bg-[#faf8f5] rounded-lg border border-[#e8dfd3] p-4">
              <p className="text-sm text-gray-700">
                <strong>Tip:</strong> Add new products using the "Add Product" button above.
              </p>
            </div>
          </>
        )}

        {/* Add/Edit Product Modal */}
        {isAddDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg border border-[#e8dfd3] w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-[#e8dfd3] flex items-center justify-between">
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-lg sm:text-2xl font-bold">
                    {selectedProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {selectedProduct ? 'Update product details' : 'Add a new product to your inventory'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setSelectedProduct(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Product Images Upload */}
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-2">
                    Product Images ({formData.images.length}/5)
                  </label>
                  <div className="space-y-4">
                    {/* Image Thumbnails */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {formData.images.map((image, index) => {
                          let src = '';
                          if (typeof image === 'string') {
                            src = getImageUrl(image);
                          } else if (image instanceof File) {
                            src = URL.createObjectURL(image);
                          }
                          return (
                            <div key={index} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border-2 border-[#e8dfd3] bg-[#faf8f5]">
                                <img
                                  src={src}
                                  alt={`Product ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleReplaceImage(index)}
                                      className="p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
                                      disabled={submitting}
                                    >
                                      <Pencil className="w-4 h-4 text-[#592a0d]" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImage(index)}
                                      className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                                      disabled={submitting}
                                    >
                                      <X className="w-4 h-4 text-white" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Image Button */}
                    {formData.images.length < 5 && (
                      <label className="border-2 border-dashed border-[#e8dfd3] rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#bfa77b] hover:bg-[#faf8f5] transition-colors">
                        <Upload className="w-8 h-8 text-[#592a0d] mb-2" />
                        <span className="text-sm font-medium text-[#592a0d]">Add Image</span>
                        <span className="text-xs text-gray-600 mt-1">Click to upload (max 5 images)</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={submitting || formData.images.length >= 5}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-2">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Enter product name"
                    className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d]"
                    disabled={submitting}
                  />
                </div>

                {/* Category and Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d] text-sm sm:text-base"
                      disabled={submitting}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-2">Price (PKR)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d] text-sm sm:text-base"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Stock Quantity */}
                {/* Size and Stock Section */}
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-2">Size & Stock <span className="text-gray-400 font-normal">(optional)</span></label>
                  <SizeStockInput
                    sizes={formData.sizes || []}
                    setSizes={(sizes) => setFormData((prev) => ({ ...prev, sizes }))}
                    disabled={submitting}
                    isEditing={!!selectedProduct}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Enter product description"
                    rows="3"
                    className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d]"
                    disabled={submitting}
                  />
                </div>

                {/* Product Status (Active/Inactive) */}
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-2">Product Status</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isActive"
                        value="true"
                        checked={formData.isActive === true}
                        onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                        disabled={submitting}
                        className="w-4 h-4 text-[#592a0d] focus:ring-[#bfa77b] focus:ring-2"
                      />
                      <span className="text-sm text-[#592a0d] font-medium">Active</span>
                      <span className="text-xs text-gray-500">(Visible in shop)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isActive"
                        value="false"
                        checked={formData.isActive === false}
                        onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                        disabled={submitting}
                        className="w-4 h-4 text-[#592a0d] focus:ring-[#bfa77b] focus:ring-2"
                      />
                      <span className="text-sm text-[#592a0d] font-medium">Inactive</span>
                      <span className="text-xs text-gray-500">(Hidden from shop)</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.isActive 
                      ? "This product will be visible to customers in the shop page." 
                      : "This product will be hidden from customers and won't appear in the shop page."
                    }
                  </p>
                </div>

                {/* Product Details - Rich Text Editor */}
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-2">Product Details</label>
                  <RichTextEditor
                    value={formData.details || ''}
                    onChange={(content) => setFormData((prev) => ({ ...prev, details: content }))}
                    placeholder="Enter additional product details with formatting..."
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use the toolbar to format text with headings, bullet points, bold, etc.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                  <button
                    onClick={handleSaveProduct}
                    disabled={submitting}
                    className={`flex-1 px-4 py-2.5 sm:py-2 text-white rounded-md transition-colors font-medium text-sm sm:text-base ${
                      submitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#592a0d] hover:bg-[#6d3a18]'
                    }`}
                  >
                    {submitting ? 'Saving...' : selectedProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setSelectedProduct(null);
                    }}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 sm:py-2 border border-[#bfa77b] text-[#592a0d] rounded-md hover:bg-[#bfa77b]/10 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
          message="Would you like to send an email notification about this new product to all active subscribers?"
          confirmText="Send Email"
          cancelText="Cancel"
          type="email"
        />
      </div>
    </AdminLayout>
  );
}
