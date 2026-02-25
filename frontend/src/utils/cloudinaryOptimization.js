/**
 * Cloudinary Optimization Utilities
 * Provides responsive image/video URLs with automatic optimization
 */

/**
 * Device breakpoints for responsive images
 */
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1920,
};

/**
 * Image size presets for different use cases
 */
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  card: { width: 400, height: 600 },
  cardLarge: { width: 600, height: 900 },
  detail: { width: 800, height: 1200 },
  hero: { width: 1920, height: 1080 },
  avatar: { width: 200, height: 200 },
};

/**
 * Video quality presets
 */
export const VIDEO_QUALITIES = {
  mobile: { width: 640, quality: 'auto:low' },
  tablet: { width: 1024, quality: 'auto:good' },
  desktop: { width: 1920, quality: 'auto:good' },
};

/**
 * Check if URL is a Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  return url && typeof url === 'string' && url.includes('cloudinary.com');
};

/**
 * Generate optimized Cloudinary image URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!isCloudinaryUrl(url)) {
    // Return as-is for non-Cloudinary URLs
    return url || '/no-image.png';
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto:good',
    format = 'auto',
    gravity = 'auto',
    aspectRatio,
  } = options;

  const transformations = [];

  // Width
  if (width) transformations.push(`w_${width}`);

  // Height or aspect ratio
  if (height) {
    transformations.push(`h_${height}`);
  } else if (aspectRatio) {
    transformations.push(`ar_${aspectRatio}`);
  }

  // Crop mode
  if (crop) transformations.push(`c_${crop}`);

  // Gravity (for smart cropping)
  if (gravity) transformations.push(`g_${gravity}`);

  // Quality
  transformations.push(`q_${quality}`);

  // Format (auto-detect best format: WebP, AVIF, etc.)
  transformations.push(`f_${format}`);

  // Combine transformations
  const transformString = transformations.join(',');

  // Insert transformations into URL
  return url.replace('/upload/', `/upload/${transformString}/`);
};

/**
 * Generate responsive image URLs for srcset
 * @param {string} url - Original Cloudinary URL
 * @param {Object} sizes - Size configurations
 * @returns {Object} - URLs for different sizes
 */
export const getResponsiveImageUrls = (url, sizes = {}) => {
  if (!isCloudinaryUrl(url)) {
    return {
      mobile: url,
      tablet: url,
      desktop: url,
    };
  }

  const {
    mobile = IMAGE_SIZES.card,
    tablet = IMAGE_SIZES.cardLarge,
    desktop = IMAGE_SIZES.detail,
    aspectRatio = '3:4',
  } = sizes;

  return {
    mobile: getOptimizedImageUrl(url, { ...mobile, aspectRatio }),
    tablet: getOptimizedImageUrl(url, { ...tablet, aspectRatio }),
    desktop: getOptimizedImageUrl(url, { ...desktop, aspectRatio }),
  };
};

/**
 * Generate blur placeholder URL (tiny, low-quality image)
 * @param {string} url - Original Cloudinary URL
 * @returns {string} - Placeholder URL
 */
export const getBlurPlaceholderUrl = (url) => {
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  return getOptimizedImageUrl(url, {
    width: 20,
    quality: 'auto:low',
    format: 'auto',
  });
};

/**
 * Generate optimized video URL
 * @param {string} url - Original Cloudinary video URL
 * @param {Object} options - Video options
 * @returns {string} - Optimized video URL
 */
export const getOptimizedVideoUrl = (url, options = {}) => {
  if (!isCloudinaryUrl(url)) {
    return url || '';
  }

  const {
    width,
    quality = 'auto:good',
    format = 'auto',
  } = options;

  const transformations = [];

  if (width) transformations.push(`w_${width}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  const transformString = transformations.join(',');
  return url.replace('/upload/', `/upload/${transformString}/`);
};

/**
 * Generate responsive video URLs for different devices
 * @param {string} url - Original Cloudinary video URL
 * @returns {Object} - Video URLs for different devices
 */
export const getResponsiveVideoUrls = (url) => {
  if (!isCloudinaryUrl(url)) {
    return {
      mobile: url,
      tablet: url,
      desktop: url,
    };
  }

  return {
    mobile: getOptimizedVideoUrl(url, VIDEO_QUALITIES.mobile),
    tablet: getOptimizedVideoUrl(url, VIDEO_QUALITIES.tablet),
    desktop: getOptimizedVideoUrl(url, VIDEO_QUALITIES.desktop),
  };
};

/**
 * Generate video poster (thumbnail) URL
 * @param {string} videoUrl - Cloudinary video URL
 * @param {number} width - Poster width
 * @returns {string} - Poster image URL
 */
export const getVideoPosterUrl = (videoUrl, width = 1920) => {
  if (!isCloudinaryUrl(videoUrl)) {
    return '';
  }

  // Convert video URL to image URL (extract frame at 0 seconds)
  return videoUrl
    .replace('/video/', '/image/')
    .replace('/upload/', `/upload/w_${width},q_auto:good,f_auto,so_0/`)
    .replace(/\.(mp4|webm|ogg|mov|avi)$/, '.jpg');
};

/**
 * Preload critical image
 * @param {string} url - Image URL to preload
 * @param {string} type - Resource type ('image' or 'video')
 */
export const preloadMedia = (url, type = 'image') => {
  if (!url || typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = type;
  link.href = url;
  
  // Add to head if not already present
  const existing = document.querySelector(`link[href="${url}"]`);
  if (!existing) {
    document.head.appendChild(link);
  }
};

/**
 * Get srcset string for responsive images
 * @param {string} url - Original Cloudinary URL
 * @param {Object} sizes - Size configurations
 * @returns {string} - srcset string
 */
export const getSrcSet = (url, sizes = {}) => {
  const urls = getResponsiveImageUrls(url, sizes);
  
  return `
    ${urls.mobile} ${sizes.mobile?.width || IMAGE_SIZES.card.width}w,
    ${urls.tablet} ${sizes.tablet?.width || IMAGE_SIZES.cardLarge.width}w,
    ${urls.desktop} ${sizes.desktop?.width || IMAGE_SIZES.detail.width}w
  `.trim();
};

/**
 * Get sizes attribute for responsive images
 * @param {Object} breakpoints - Custom breakpoints
 * @returns {string} - sizes attribute value
 */
export const getSizesAttribute = (breakpoints = {}) => {
  const {
    mobile = '100vw',
    tablet = '50vw',
    desktop = '33vw',
  } = breakpoints;

  return `(max-width: ${BREAKPOINTS.mobile}px) ${mobile}, (max-width: ${BREAKPOINTS.tablet}px) ${tablet}, ${desktop}`;
};

/**
 * Generate adaptive video sources for HTML5 video element
 * @param {string} url - Original video URL
 * @returns {Array} - Array of source objects
 */
export const getAdaptiveVideoSources = (url) => {
  if (!isCloudinaryUrl(url)) {
    return [{ src: url, type: 'video/mp4' }];
  }

  const urls = getResponsiveVideoUrls(url);

  return [
    {
      src: urls.mobile,
      type: 'video/mp4',
      media: `(max-width: ${BREAKPOINTS.mobile}px)`,
    },
    {
      src: urls.tablet,
      type: 'video/mp4',
      media: `(max-width: ${BREAKPOINTS.tablet}px)`,
    },
    {
      src: urls.desktop,
      type: 'video/mp4',
    },
  ];
};

/**
 * Calculate optimal image dimensions based on container and aspect ratio
 * @param {number} containerWidth - Container width in pixels
 * @param {string} aspectRatio - Aspect ratio (e.g., '16:9', '3:4')
 * @returns {Object} - Width and height
 */
export const calculateImageDimensions = (containerWidth, aspectRatio = '3:4') => {
  const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
  const height = Math.round((containerWidth * heightRatio) / widthRatio);
  
  return {
    width: containerWidth,
    height,
  };
};

/**
 * Get device pixel ratio for high-DPI displays
 * @returns {number} - Device pixel ratio
 */
export const getDevicePixelRatio = () => {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
};

/**
 * Adjust image size for high-DPI displays
 * @param {number} size - Base size
 * @returns {number} - Adjusted size
 */
export const adjustForDPR = (size) => {
  const dpr = getDevicePixelRatio();
  // Cap at 2x to avoid excessive file sizes
  return Math.round(size * Math.min(dpr, 2));
};
