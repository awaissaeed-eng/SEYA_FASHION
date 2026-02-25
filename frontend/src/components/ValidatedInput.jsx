import { useState, useEffect, useCallback } from 'react';
import { inputValidators, handlePaste } from '../utils/inputValidation';

const ValidatedInput = ({
  type = 'text',
  name,
  value,
  onChange,
  onValidation,
  validationType,
  country = 'Pakistan',
  label,
  placeholder,
  required = false,
  className = '',
  icon,
  ...props
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const validator = inputValidators[validationType];

  // Memoize validation function to prevent unnecessary re-renders
  const validateField = useCallback(() => {
    if (validator && validator.validate) {
      const errorMessage = validator.validate(value, country);
      setError(errorMessage);
      if (onValidation) {
        // Report as valid if no error, even if not touched yet
        onValidation(name, !errorMessage);
      }
    }
  }, [value, validator, country, name, onValidation]);

  // Validate on value change
  useEffect(() => {
    validateField();
  }, [validateField]);

  const handleInputChange = (e) => {
    let newValue = e.target.value;
    
    // Apply filter if available
    if (validator && validator.filter) {
      newValue = validator.filter(newValue, country);
    }
    
    onChange(name, newValue);
  };

  const handleKeyDown = (e) => {
    if (validator && validator.onKeyDown) {
      validator.onKeyDown(e, country);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const handlePasteEvent = (e) => {
    handlePaste(e, validationType, country);
    // Update parent state after paste
    setTimeout(() => {
      onChange(name, e.target.value);
    }, 0);
  };

  const inputClasses = `
    w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none text-[#592a0d] transition-colors text-sm sm:text-base
    ${error && touched 
      ? 'border-red-500 focus:border-red-500' 
      : 'border-[#e7dcc8] focus:border-[#bfa77b]'
    }
    ${icon ? 'pr-10 sm:pr-12' : ''}
    ${props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-[#592a0d] font-medium text-sm sm:text-base">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onPaste={handlePasteEvent}
          placeholder={placeholder}
          className={inputClasses}
          autoComplete="off"
          {...props}
        />
        
        {icon && (
          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#bfa77b]">
            {icon}
          </div>
        )}
      </div>
      
      {error && touched && (
        <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default ValidatedInput;