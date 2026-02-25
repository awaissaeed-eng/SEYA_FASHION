  import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUrl';

export function EditProductModal({ isOpen, onClose, product, onUpdateProduct }) {
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: []
  });

  useEffect(() => {
    if (product) {
      setEditedProduct({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        stock: product.stock || '',
        images: product.images || []
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editedProduct.name && editedProduct.price && editedProduct.category && editedProduct.stock) {
      const updatedProduct = {
        ...product,
        ...editedProduct
      };
      onUpdateProduct(updatedProduct);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold mb-6">Edit Product</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Product Name"
                      value={editedProduct.name}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      type="text"
                      name="price"
                      placeholder="Price (e.g., $50.00)"
                      value={editedProduct.price}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      placeholder="Category"
                      value={editedProduct.category}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock"
                      placeholder="Stock Quantity"
                      value={editedProduct.stock}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images (Max 5)
                    </label>
                    <input
                      type="file"
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                          const files = Array.from(e.target.files);
                          if (files.length > 5) {
                            alert('Maximum 5 images allowed');
                            return;
                          }
                          // Check each file size (50MB limit)
                          const maxSize = 50 * 1024 * 1024; // 50MB in bytes
                          for (const file of files) {
                            if (file.size > maxSize) {
                              alert('this file is too much long');
                              return;
                            }
                          }
                          setEditedProduct({ ...editedProduct, images: files });
                        }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {editedProduct.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-5 gap-2">
                        {editedProduct.images.map((image, index) => {
                          let src = '';
                          if (typeof image === 'string') {
                            src = getImageUrl(image);
                          } else if (image instanceof File) {
                            src = URL.createObjectURL(image);
                          }
                          return (
                            <div key={index} className="relative">
                              <img src={src} alt={`Product ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedImages = editedProduct.images.filter((_, i) => i !== index);
                                  setEditedProduct({ ...editedProduct, images: updatedImages });
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Description
                    </label>
                    <textarea
                      name="description"
                      placeholder="Product Description"
                      value={editedProduct.description}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full h-24 resize-none"
                      rows="4"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
