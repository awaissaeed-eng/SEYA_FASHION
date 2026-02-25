/**
 * Get the full image URL
 * Handles both Cloudinary URLs (full https URLs) and legacy local paths (/uploads/...)
 * @param {string} url - Image URL or path
 * @returns {string} - Full image URL
 */
export const getImageUrl = (url) => {
  if (!url) return '/no-image.png';
  
  // If it's already a full URL (Cloudinary or other CDN), return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Legacy local path - prepend backend URL
  const backendUrl = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
  return `${backendUrl}${url}`;
};

/**
 * Get the full video URL
 * Same logic as getImageUrl but for videos
 * @param {string} url - Video URL or path
 * @returns {string} - Full video URL
 */
export const getVideoUrl = (url) => {
  if (!url) return '';
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const backendUrl = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
  return `${backendUrl}${url}`;
};
