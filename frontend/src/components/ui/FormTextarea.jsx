import { useState } from 'react';

const FormTextarea = ({
  name,
  value,
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  error = '',
  rows = 4,
  maxLength,
  showCharCount = false,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  const textareaClasses = `
    w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none text-[#592a0d] transition-colors text-sm sm:text-base resize-vertical
    ${error 
      ? 'border-red-500 focus:border-red-500' 
      : 'border-[#e7dcc8] focus:border-[#bfa77b]'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}
    ${className}
  `;

  const handleChange = (e) => {
    if (onChange) {
      onChange(name, e.target.value);
    }
  };

  const charCount = value ? value.length : 0;
  const isOverLimit = maxLength && charCount > maxLength;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-[#592a0d] font-medium text-sm sm:text-base">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={textareaClasses}
          {...props}
        />
        
        {showCharCount && maxLength && (
          <div className={`absolute bottom-2 right-2 text-xs ${
            isOverLimit ? 'text-red-500' : 'text-gray-400'
          }`}>
            {charCount}/{maxLength}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
      
      {showCharCount && maxLength && !error && (
        <p className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
          {charCount} of {maxLength} characters used
        </p>
      )}
    </div>
  );
};

export default FormTextarea;