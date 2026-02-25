import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  getOptimizedImageUrl,
  getResponsiveImageUrls,
  getBlurPlaceholderUrl,
  getSrcSet,
  getSizesAttribute,
  preloadMedia,
  isCloudinaryUrl,
} from '../../utils/cloudinaryOptimization';
import { getImageUrl } from '../../utils/imageUrl';

/**
 * OptimizedImage Component
 * Provides responsive, lazy-loaded images with blur-up effect
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  sizes,
  aspectRatio = '3:4',
  priority = false,
  quality = 'auto:good',
  objectFit = 'cover',
  onLoad,
  onError,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  // Get optimized URLs
  const imageUrl = isCloudinaryUrl(src) ? src : getImageUrl(src);
  const placeholderUrl = getBlurPlaceholderUrl(imageUrl);
  const responsiveUrls = getResponsiveImageUrls(imageUrl, sizes);

  // Preload if priority
  useEffect(() => {
    if (priority && responsiveUrls.mobile) {
      preloadMedia(responsiveUrls.mobile, 'image');
    }
  }, [priority, responsiveUrls.mobile]);

  // Handle load
  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  // Handle error
  const handleError = () => {
    setError(true);
    onError?.();
  };

  // Error state
  if (error) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ aspectRatio }}
      >
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 mx-auto text-gray-300 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-400">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio }}>
      {/* Blur placeholder */}
      {!loaded && placeholderUrl && (
        <motion.img
          src={placeholderUrl}
          alt=""
          className="absolute inset-0 w-full h-full blur-xl scale-110"
          style={{ objectFit }}
          aria-hidden="true"
          initial={{ opacity: 1 }}
          animate={{ opacity: loaded ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Main image */}
      <motion.img
        ref={imgRef}
        src={responsiveUrls.mobile}
        srcSet={isCloudinaryUrl(imageUrl) ? getSrcSet(imageUrl, sizes) : undefined}
        sizes={isCloudinaryUrl(imageUrl) ? getSizesAttribute() : undefined}
        alt={alt}
        className="w-full h-full"
        style={{ objectFit }}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        {...rest}
      />

      {/* Loading skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

/**
 * OptimizedBackgroundImage Component
 * For background images with blur-up effect
 */
export function OptimizedBackgroundImage({
  src,
  className = '',
  children,
  sizes,
  quality = 'auto:good',
  overlay = false,
  overlayOpacity = 0.3,
}) {
  const [loaded, setLoaded] = useState(false);
  const imageUrl = isCloudinaryUrl(src) ? src : getImageUrl(src);
  const placeholderUrl = getBlurPlaceholderUrl(imageUrl);
  const optimizedUrl = getOptimizedImageUrl(imageUrl, {
    width: 1920,
    quality,
  });

  return (
    <div className={`relative ${className}`}>
      {/* Blur placeholder */}
      {!loaded && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-xl scale-110"
          style={{ backgroundImage: `url(${placeholderUrl})` }}
        />
      )}

      {/* Main background */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url(${optimizedUrl})` }}
      />

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Hidden image for loading detection */}
      <img
        src={optimizedUrl}
        alt=""
        className="hidden"
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}

export default OptimizedImage;
