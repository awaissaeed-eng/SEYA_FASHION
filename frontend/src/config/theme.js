// SEYA Fashion Theme Configuration
// Centralized color scheme and design tokens

export const colors = {
  // Primary brand colors
  primary: {
    dark: '#592a0d',      // Main brand color
    light: '#6d3a18',     // Hover state
    lighter: '#8b6f47',   // Muted variant
  },
  
  // Secondary/accent colors
  secondary: {
    main: '#bfa77b',      // Gold accent
    light: '#d4a574',     // Light gold
    lighter: '#d4c4a8',   // Very light gold
  },
  
  // Background colors
  background: {
    main: '#f5f1e8',      // Main background
    light: '#faf8f5',     // Light background
    card: '#ffffff',      // Card background
    muted: '#e7dcc8',     // Muted background
    border: '#e8dfd3',    // Border color
  },
  
  // Text colors
  text: {
    primary: '#592a0d',   // Primary text
    secondary: '#666666', // Secondary text
    muted: '#999999',     // Muted text
    light: '#ffffff',     // Light text
  },
  
  // Status colors
  status: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  
  // Utility colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

// Typography configuration
export const typography = {
  fontFamily: {
    serif: 'Playfair Display, serif',
    sans: 'Inter, system-ui, sans-serif',
  },
  
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
};

// Font style constants to replace inline styles
export const fontStyles = {
  serifHeading: { fontFamily: 'Playfair Display, serif' },
  serifBody: { fontFamily: 'Playfair Display, serif' },
  sansHeading: { fontFamily: 'Inter, system-ui, sans-serif' },
  sansBody: { fontFamily: 'Inter, system-ui, sans-serif' },
};

// Spacing configuration
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

// Border radius configuration
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
};

// Shadow configuration
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};

// Component-specific configurations
export const components = {
  button: {
    primary: {
      bg: colors.primary.dark,
      text: colors.secondary.main,
      hover: colors.primary.light,
    },
    secondary: {
      bg: colors.background.main,
      text: colors.primary.dark,
      hover: colors.background.muted,
    },
    outline: {
      bg: 'transparent',
      text: colors.primary.dark,
      border: colors.secondary.main,
      hover: colors.secondary.main + '/10',
    }
  },
  
  input: {
    border: colors.background.muted,
    focus: colors.secondary.main,
    bg: colors.background.card,
    text: colors.primary.dark,
    placeholder: colors.primary.dark + '/40',
  },
  
  card: {
    bg: colors.background.card,
    border: colors.background.border,
    shadow: shadows.lg,
  }
};

// Utility functions for theme usage
export const getColor = (colorPath) => {
  const keys = colorPath.split('.');
  let result = colors;
  
  for (const key of keys) {
    result = result[key];
    if (!result) return colorPath; // Return original if not found
  }
  
  return result;
};

// CSS-in-JS helper for Tailwind classes
export const tw = {
  // Primary colors
  primaryText: 'text-[#592a0d]',
  primaryBg: 'bg-[#592a0d]',
  primaryBorder: 'border-[#592a0d]',
  
  // Secondary colors
  secondaryText: 'text-[#bfa77b]',
  secondaryBg: 'bg-[#bfa77b]',
  secondaryBorder: 'border-[#bfa77b]',
  
  // Background colors
  bgMain: 'bg-[#f5f1e8]',
  bgLight: 'bg-[#faf8f5]',
  bgCard: 'bg-white',
  bgMuted: 'bg-[#e7dcc8]',
  
  // Border colors
  borderMain: 'border-[#e8dfd3]',
  borderMuted: 'border-[#e7dcc8]',
  
  // Common combinations
  primaryButton: 'bg-[#592a0d] text-[#bfa77b] hover:bg-[#6d3a18]',
  secondaryButton: 'bg-[#f5f1e8] text-[#592a0d] hover:bg-[#e7dcc8]',
  outlineButton: 'border-[#bfa77b] text-[#592a0d] hover:bg-[#bfa77b]/10',
  
  // Input styles
  input: 'border-[#e7dcc8] focus:border-[#bfa77b] bg-white text-[#592a0d] placeholder:text-[#592a0d]/40',
  
  // Card styles
  card: 'bg-white border-[#e8dfd3] shadow-lg',
};

export default {
  colors,
  typography,
  fontStyles,
  spacing,
  borderRadius,
  shadows,
  components,
  getColor,
  tw,
};