// Media management utility for admin panel
// Handles both server and Cloudinary operations

class MediaManager {
  constructor() {
    this.API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }

  // Get authorization headers
  getAuthHeaders() {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  // Upload media (image or video) to both server and Cloudinary
  async uploadMedia(file, type = 'image', folder = 'general') {
    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('type', type);
      formData.append('folder', folder);

      const response = await fetch(`${this.API_BASE_URL}/media/upload`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: {
          serverPath: result.serverPath,
          cloudinaryUrl: result.cloudinaryUrl,
          publicId: result.publicId,
          filename: result.filename,
          type: result.type,
          size: result.size
        }
      };
    } catch (error) {
      console.error('Media upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete media from both server and Cloudinary
  async deleteMedia(mediaPath, publicId = null) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/media/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({
          mediaPath,
          publicId
        })
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      console.error('Media deletion failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload multiple media files
  async uploadMultipleMedia(files, type = 'image', folder = 'general') {
    const results = [];
    
    for (const file of files) {
      const result = await this.uploadMedia(file, type, folder);
      results.push({
        file: file.name,
        ...result
      });
    }

    return results;
  }

  // Delete multiple media files
  async deleteMultipleMedia(mediaItems) {
    const results = [];
    
    for (const item of mediaItems) {
      const result = await this.deleteMedia(item.path, item.publicId);
      results.push({
        path: item.path,
        ...result
      });
    }

    return results;
  }

  // Optimize image before upload
  async optimizeImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            const optimizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Validate media file
  validateMediaFile(file, type = 'image') {
    const errors = [];

    // Size validation
    const maxSizes = {
      image: 5 * 1024 * 1024, // 5MB
      video: 50 * 1024 * 1024  // 50MB
    };

    if (file.size > maxSizes[type]) {
      errors.push(`File size exceeds ${maxSizes[type] / (1024 * 1024)}MB limit`);
    }

    // Type validation
    const allowedTypes = {
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/mov']
    };

    if (!allowedTypes[type].includes(file.type)) {
      errors.push(`Invalid file type. Allowed: ${allowedTypes[type].join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get media info
  async getMediaInfo(mediaPath) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/media/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ mediaPath })
      });

      if (!response.ok) {
        throw new Error(`Failed to get media info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get media info:', error);
      return null;
    }
  }

  // Batch operations
  async batchUpload(files, options = {}) {
    const {
      type = 'image',
      folder = 'general',
      optimize = true,
      maxWidth = 1200,
      quality = 0.8
    } = options;

    const results = [];
    
    for (const file of files) {
      // Validate file
      const validation = this.validateMediaFile(file, type);
      if (!validation.isValid) {
        results.push({
          file: file.name,
          success: false,
          errors: validation.errors
        });
        continue;
      }

      // Optimize if needed
      let processedFile = file;
      if (optimize && type === 'image') {
        try {
          processedFile = await this.optimizeImage(file, maxWidth, quality);
        } catch (error) {
          console.warn('Image optimization failed, using original:', error);
        }
      }

      // Upload
      const result = await this.uploadMedia(processedFile, type, folder);
      results.push({
        file: file.name,
        originalSize: file.size,
        processedSize: processedFile.size,
        ...result
      });
    }

    return results;
  }
}

// Create singleton instance
const mediaManager = new MediaManager();

export { mediaManager };
export default mediaManager;