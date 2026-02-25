const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = ''
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    primary: 'border-[#592a0d] border-t-transparent',
    secondary: 'border-[#bfa77b] border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent'
  };

  const spinnerClasses = `${sizes[size]} border-2 ${colors[color]} rounded-full animate-spin ${className}`;

  if (text) {
    return (
      <div className="flex items-center justify-center gap-3">
        <div className={spinnerClasses} />
        <span className="text-sm sm:text-base text-[#592a0d]">{text}</span>
      </div>
    );
  }

  return <div className={spinnerClasses} />;
};

export default LoadingSpinner;