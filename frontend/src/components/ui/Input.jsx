import { forwardRef } from 'react';
import { tw } from '../../config/theme';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  className = '',
  containerClassName = '',
  required = false,
  ...props
}, ref) => {
  const baseClasses = `w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${tw.input}`;
  const errorClasses = error ? 'border-red-500 focus:border-red-500' : '';
  const iconPadding = icon ? (iconPosition === 'left' ? 'pl-12' : 'pr-12') : '';
  
  const inputClasses = `${baseClasses} ${errorClasses} ${iconPadding} ${className}`;
  
  return (
    <div className={containerClassName}>
      {label && (
        <label className={`block ${tw.primaryText} font-medium mb-2`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bfa77b]">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bfa77b]">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;