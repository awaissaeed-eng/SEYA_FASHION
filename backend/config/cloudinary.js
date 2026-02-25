const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary with optimizations
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Upload options
 * @param {string} options.folder - Cloudinary folder name
 * @param {string} options.resource_type - 'image' or 'video'
 * @param {boolean} options.eager - Generate eager transformations
 * @returns {Promise<{url: string, public_id: string, width: number, height: number}>}
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'seya-fashion',
      resource_type: options.resource_type || 'auto',
      // Enable automatic format and quality optimization
      quality: 'auto:good',
      fetch_format: 'auto',
      // Generate responsive breakpoints for images
      responsive_breakpoints: options.resource_type === 'image' ? {
        bytes_step: 20000,
        min_width: 200,
        max_width: 1920,
        max_images: 5,
        create_derived: true,
      } : undefined,
      // Eager transformations for common sizes (optional)
      eager: options.eager ? [
        { width: 400, height: 600, crop: 'fill', quality: 'auto:good', fetch_format: 'auto' },
        { width: 800, height: 1200, crop: 'fill', quality: 'auto:good', fetch_format: 'auto' },
      ] : undefined,
      eager_async: true, // Generate transformations asynchronously
      // Video-specific options
      ...(options.resource_type === 'video' && {
        eager: [
          { width: 640, quality: 'auto:low', fetch_format: 'auto' },
          { width: 1024, quality: 'auto:good', fetch_format: 'auto' },
          { width: 1920, quality: 'auto:good', fetch_format: 'auto' },
        ],
        eager_async: true,
      }),
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            responsive_breakpoints: result.responsive_breakpoints,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @param {string} resourceType - 'image' or 'video'
 * @returns {Promise}
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {string[]} publicIds - Array of Cloudinary public_ids
 * @param {string} resourceType - 'image' or 'video'
 * @returns {Promise}
 */
const deleteMultipleFromCloudinary = async (publicIds, resourceType = 'image') => {
  try {
    if (!publicIds || publicIds.length === 0) return;
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary bulk delete error:', error);
    throw error;
  }
};

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - public_id or null
 */
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  try {
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.ext
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    // Remove version number if present and get the path
    let path = parts[1];
    if (path.startsWith('v')) {
      path = path.substring(path.indexOf('/') + 1);
    }
    
    // Remove file extension
    const lastDotIndex = path.lastIndexOf('.');
    if (lastDotIndex > -1) {
      path = path.substring(0, lastDotIndex);
    }
    
    return path;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

/**
 * Generate optimized image URL with transformations
 * @param {string} publicId - Cloudinary public_id
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized URL
 */
const getOptimizedUrl = (publicId, options = {}) => {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto:good',
    format = 'auto',
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    fetch_format: format,
    secure: true,
  });
};

/**
 * Generate video streaming URL (HLS/DASH)
 * @param {string} publicId - Cloudinary public_id
 * @returns {Object} - Streaming URLs
 */
const getVideoStreamingUrls = (publicId) => {
  return {
    hls: cloudinary.url(publicId, {
      resource_type: 'video',
      streaming_profile: 'hd',
      format: 'm3u8',
      secure: true,
    }),
    dash: cloudinary.url(publicId, {
      resource_type: 'video',
      streaming_profile: 'hd',
      format: 'mpd',
      secure: true,
    }),
    mp4: cloudinary.url(publicId, {
      resource_type: 'video',
      quality: 'auto:good',
      fetch_format: 'auto',
      secure: true,
    }),
  };
};

/**
 * Invalidate CDN cache for a resource
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise}
 */
const invalidateCache = async (publicId) => {
  try {
    const result = await cloudinary.api.update(publicId, {
      invalidate: true,
    });
    return result;
  } catch (error) {
    console.error('Cache invalidation error:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  getPublicIdFromUrl,
  getOptimizedUrl,
  getVideoStreamingUrls,
  invalidateCache,
};
