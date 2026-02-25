// Share utility functions

/**
 * Share product using Web Share API or fallback to clipboard
 * @param {Object} product - Product object with name, price, and id
 * @returns {Promise<Object>} Result object with success status and method used
 */
export const shareProduct = async (product) => {
  const productUrl = `${window.location.origin}/product/${product._id || product.id}`;
  const shareData = {
    title: product.name,
    text: `Check out ${product.name} - PKR ${product.price?.toLocaleString('en-PK', { maximumFractionDigits: 0 })} at SEYA Fashion`,
    url: productUrl,
  };

  // Check if Web Share API is supported (mainly mobile devices)
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'native' };
    } catch (error) {
      // User cancelled or error occurred
      if (error.name === 'AbortError') {
        return { success: false, method: 'native', cancelled: true };
      }
      console.error('Error sharing:', error);
      // Fallback to clipboard
      return await copyToClipboard(productUrl);
    }
  } else {
    // Fallback to clipboard for desktop
    return await copyToClipboard(productUrl);
  }
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<Object>} Result object with success status
 */
const copyToClipboard = async (text) => {
  try {
    // Modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard' };
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        textArea.remove();
        return { success: true, method: 'clipboard' };
      } catch (error) {
        textArea.remove();
        throw error;
      }
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return { success: false, method: 'clipboard', error };
  }
};
