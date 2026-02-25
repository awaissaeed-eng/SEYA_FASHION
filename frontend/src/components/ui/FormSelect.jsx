import { ChevronDown } from 'lucide-react';

const FormSelect = ({
  name,
  value,
  onChange,
  options = [],
  label,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  error = '',
  className = '',
  ...props
}) => {
  const selectClasses = `
    w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none text-[#592a0d] transition-colors text-sm sm:text-base appearance-none bg-white
    ${error 
      ? 'border-red-500 focus:border-red-500' 
      : 'border-[#e7dcc8] focus:border-[#bfa77b]'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'cursor-pointer'}
    ${className}
  `;

  const handleChange = (e) => {
    if (onChange) {
      onChange(name, e.target.value);
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-[#592a0d] font-medium text-sm sm:text-base">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#bfa77b] pointer-events-none">
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
      
      {error && (
        <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormSelect;