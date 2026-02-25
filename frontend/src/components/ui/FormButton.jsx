import { motion } from 'motion/react';

const FormButton = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#592a0d] text-[#bfa77b] hover:bg-[#6d3a18] focus:ring-[#592a0d] shadow-md hover:shadow-lg',
    secondary: 'bg-[#bfa77b] text-[#592a0d] hover:bg-[#d4a574] focus:ring-[#bfa77b] shadow-md hover:shadow-lg',
    outline: 'border-2 border-[#bfa77b] text-[#592a0d] hover:bg-[#592a0d] hover:text-[#bfa77b] hover:border-[#592a0d] focus:ring-[#bfa77b]',
    ghost: 'text-[#592a0d] hover:bg-[#f5f1e8] focus:ring-[#bfa77b]',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-md hover:shadow-lg'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm sm:text-base',
    lg: 'px-6 py-3 text-base sm:text-lg',
    xl: 'px-8 py-4 text-lg sm:text-xl'
  };
  
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  const ButtonContent = () => (
    <>
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {icon && !loading && icon}
      {children}
    </>
  );
  
  if (disabled || loading) {
    return (
      <button
        type={type}
        disabled={true}
        className={buttonClasses}
        {...props}
      >
        <ButtonContent />
      </button>
    );
  }
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={buttonClasses}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      <ButtonContent />
    </motion.button>
  );
};

export default FormButton;