import { forwardRef } from 'react';
import { motion } from 'motion/react';

const AccessibleButton = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  onKeyDown,
  className = '',
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaPressed,
  role = 'button',
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-medium rounded-lg 
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:ring-2 focus-visible:ring-[#bfa77b] focus-visible:ring-offset-2
  `;
  
  const variants = {
    primary: 'bg-[#592a0d] text-[#bfa77b] hover:bg-[#6d3a18] focus:ring-[#592a0d] shadow-md hover:shadow-lg',
    secondary: 'bg-[#bfa77b] text-[#592a0d] hover:bg-[#d4a574] focus:ring-[#bfa77b] shadow-md hover:shadow-lg',
    outline: 'border-2 border-[#bfa77b] text-[#592a0d] hover:bg-[#592a0d] hover:text-[#bfa77b] hover:border-[#592a0d] focus:ring-[#bfa77b]',
    ghost: 'text-[#592a0d] hover:bg-[#f5f1e8] focus:ring-[#bfa77b]',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-md hover:shadow-lg'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm sm:text-base min-h-[40px]',
    lg: 'px-6 py-3 text-base sm:text-lg min-h-[48px]',
    xl: 'px-8 py-4 text-lg sm:text-xl min-h-[56px]'
  };
  
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  const handleKeyDown = (e) => {
    // Handle Enter and Space keys for better accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && !loading && onClick) {
        onClick(e);
      }
    }
    
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const ButtonContent = () => (
    <>
      {loading && (
        <div 
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </>
  );
  
  if (disabled || loading) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={true}
        className={buttonClasses}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-expanded={ariaExpanded}
        aria-pressed={ariaPressed}
        role={role}
        {...props}
      >
        <ButtonContent />
      </button>
    );
  }
  
  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={buttonClasses}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      role={role}
      {...props}
    >
      <ButtonContent />
    </motion.button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;