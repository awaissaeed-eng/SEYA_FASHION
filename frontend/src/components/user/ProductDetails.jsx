// Lazy-loaded product details component with sanitized HTML
import { useState, useEffect } from 'react';

const ProductDetails = ({ details }) => {
  const [sanitizedHTML, setSanitizedHTML] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sanitizeContent = async () => {
      if (!details) {
        setLoading(false);
        return;
      }

      try {
        // Lazy load DOMPurify
        const { default: DOMPurify } = await import('dompurify');
        const sanitized = DOMPurify.sanitize(details);
        setSanitizedHTML(sanitized);
      } catch (error) {
        console.error('Failed to sanitize HTML:', error);
        setSanitizedHTML(details); // Fallback to unsanitized content
      } finally {
        setLoading(false);
      }
    };

    sanitizeContent();
  }, [details]);

  if (!details) return null;

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-[#e7dcc8] mb-20">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-[#e7dcc8] mb-20">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#bfa77b] mb-3">
            Product Details
          </h3>
          <div 
            className="product-details-content text-[#592a0d] leading-relaxed text-base md:text-lg"
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;