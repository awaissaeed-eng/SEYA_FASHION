// Lazy loading utilities for heavy components and libraries
import { lazy } from 'react';

// Heavy libraries - lazy loaded only when needed
export const lazyJsPDF = () => import('jspdf');
export const lazyDOMPurify = () => import('dompurify');

// Admin components - code split to admin routes only
export const RichTextEditor = lazy(() => import('../components/admin/RichTextEditor'));

// PDF generation utility - lazy loaded
export const PDFGenerator = {
  async generateOrderPDF(order, generateOrderHTML) {
    const { default: jsPDF } = await lazyJsPDF();
    // PDF generation logic will be moved here
    return new jsPDF();
  }
};

// DOMPurify utility - lazy loaded for product details
export const sanitizeHTML = async (html) => {
  const { default: DOMPurify } = await lazyDOMPurify();
  return DOMPurify.sanitize(html);
};

export default {
  lazyJsPDF,
  lazyDOMPurify,
  RichTextEditor,
  PDFGenerator,
  sanitizeHTML,
};