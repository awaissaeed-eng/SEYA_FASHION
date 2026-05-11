// Input validation utilities with real-time character filtering

export const inputValidators = {
  // Full Name - Only letters and spaces
  fullName: {
    filter: (value) => {
      return value.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ').trimStart();
    },
    validate: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return 'Name is required';
      if (trimmed.length < 2) return 'Name must be at least 2 characters';
      if (trimmed.length > 50) return 'Name must be less than 50 characters';
      return '';
    },
    onKeyDown: (e) => {
      // Block numbers and symbols
      if (/[0-9!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?~`]/.test(e.key) && e.key.length === 1) {
        e.preventDefault();
      }
    }
  },

  // Phone Number - Numbers only with country-specific formatting
  phone: {
    filter: (value, country = 'Pakistan') => {
      const numbers = value.replace(/\D/g, '');
      
      // Country-specific formatting
      switch (country) {
        case 'Pakistan':
          // Format: +92 XXX XXXXXXX or 03XX XXXXXXX
          if (numbers.startsWith('92')) {
            return numbers.slice(0, 12); // +92 XXX XXXXXXX
          } else if (numbers.startsWith('03')) {
            return numbers.slice(0, 11); // 03XX XXXXXXX
          } else {
            return numbers.slice(0, 11);
          }
        case 'United States':
        case 'Canada':
          return numbers.slice(0, 10); // XXX XXX XXXX
        case 'United Kingdom':
          return numbers.slice(0, 11); // XXXXXXXXXXX
        default:
          return numbers.slice(0, 15); // International max
      }
    },
    validate: (value, country = 'Pakistan') => {
      const numbers = value.replace(/\D/g, '');
      if (!numbers) return 'Phone number is required';
      
      switch (country) {
        case 'Pakistan':
          if (numbers.length < 10) return 'Phone number must be at least 10 digits';
          if (numbers.length > 12) return 'Phone number is too long';
          if (!numbers.match(/^(92|03)/)) return 'Invalid Pakistan phone format';
          break;
        case 'United States':
        case 'Canada':
          if (numbers.length !== 10) return 'Phone number must be 10 digits';
          break;
        case 'United Kingdom':
          if (numbers.length < 10 || numbers.length > 11) return 'Invalid UK phone number';
          break;
        default:
          if (numbers.length < 7 || numbers.length > 15) return 'Invalid phone number length';
      }
      return '';
    },
    onKeyDown: (e) => {
      // Only allow numbers, backspace, delete, arrow keys
      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
        e.preventDefault();
      }
    }
  },

  // Email validation
  email: {
    filter: (value) => {
      // Allow basic email characters
      return value.replace(/[^a-zA-Z0-9@._-]/g, '').toLowerCase();
    },
    validate: (value) => {
      if (!value) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email address';
      if (value.length > 254) return 'Email is too long';
      return '';
    },
    onKeyDown: (e) => {
      // Block invalid email characters
      if (!/[a-zA-Z0-9@._-]/.test(e.key) && e.key.length === 1) {
        e.preventDefault();
      }
    }
  },

  // Address fields - Letters, numbers, spaces, comma, hyphen
  address: {
    filter: (value) => {
      return value.replace(/[^a-zA-Z0-9\s,.-]/g, '').replace(/\s+/g, ' ').trimStart();
    },
    validate: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return 'Address is required';
      if (trimmed.length < 5) return 'Address must be at least 5 characters';
      if (trimmed.length > 100) return 'Address is too long';
      return '';
    },
    onKeyDown: (e) => {
      // Allow letters, numbers, spaces, comma, period, hyphen
      if (!/[a-zA-Z0-9\s,.-]/.test(e.key) && e.key.length === 1) {
        e.preventDefault();
      }
    }
  },

  // City/State - Letters, spaces, hyphen
  cityState: {
    filter: (value) => {
      return value.replace(/[^a-zA-Z\s-]/g, '').replace(/\s+/g, ' ').trimStart();
    },
    validate: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return 'This field is required';
      if (trimmed.length < 2) return 'Must be at least 2 characters';
      if (trimmed.length > 50) return 'Must be less than 50 characters';
      return '';
    },
    onKeyDown: (e) => {
      // Only letters, spaces, hyphen
      if (!/[a-zA-Z\s-]/.test(e.key) && e.key.length === 1) {
        e.preventDefault();
      }
    }
  },

  // Postal/ZIP Code
  postalCode: {
    filter: (value, country = 'Pakistan') => {
      switch (country) {
        case 'Pakistan':
          return value.replace(/\D/g, '').slice(0, 5); // Numbers only, 5 digits
        case 'United States':
          return value.replace(/\D/g, '').slice(0, 5); // Numbers only, 5 digits
        case 'Canada':
        case 'United Kingdom':
          return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7); // Alphanumeric
        default:
          return value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
      }
    },
    validate: (value, country = 'Pakistan') => {
      if (!value) return ''; // Optional field
      
      switch (country) {
        case 'Pakistan':
          if (value.length !== 5) return 'ZIP code must be 5 digits';
          break;
        case 'United States':
          if (value.length !== 5) return 'ZIP code must be 5 digits';
          break;
        case 'Canada':
          if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(value.replace(/\s/g, ''))) {
            return 'Invalid Canadian postal code format';
          }
          break;
        case 'United Kingdom':
          if (value.length < 5 || value.length > 7) return 'Invalid UK postal code';
          break;
      }
      return '';
    },
    onKeyDown: (e, country = 'Pakistan') => {
      if (country === 'Pakistan' || country === 'United States') {
        // Numbers only
        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
          e.preventDefault();
        }
      } else {
        // Alphanumeric
        if (!/[a-zA-Z0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
          e.preventDefault();
        }
      }
    }
  },

  // Card Number - Numbers only with formatting (accepts any valid format)
  cardNumber: {
    filter: (value) => {
      const numbers = value.replace(/\D/g, '');
      const formatted = numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
      return formatted.slice(0, 19); // Max 16 digits + 3 spaces
    },
    validate: (value) => {
      const numbers = value.replace(/\D/g, '');
      if (!numbers) return 'Card number is required';
      if (numbers.length < 13) return 'Card number must be at least 13 digits';
      if (numbers.length > 19) return 'Card number is too long';
      return '';
    },
    onKeyDown: (e) => {
      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
        e.preventDefault();
      }
    }
  },

  // Card Expiry - MM/YY format with expiration validation
  cardExpiry: {
    filter: (value) => {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length >= 2) {
        return numbers.slice(0, 2) + '/' + numbers.slice(2, 4);
      }
      return numbers;
    },
    validate: (value) => {
      if (!value) return 'Expiry date is required';
      if (!/^\d{2}\/\d{2}$/.test(value)) return 'Format: MM/YY';
      
      const [month, year] = value.split('/').map(Number);
      
      // Validate month range
      if (month < 1 || month > 12) return 'Invalid month (01-12)';
      
      // Check if card is expired
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits of year
      const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
      
      // Card is expired if:
      // 1. Year is less than current year
      // 2. Year is same as current year but month is less than current month
      if (year < currentYear) {
        return 'Card has expired';
      }
      
      if (year === currentYear && month < currentMonth) {
        return 'Card has expired';
      }
      
      // Check if expiry date is too far in the future (more than 20 years)
      if (year > currentYear + 20) {
        return 'Invalid expiry year';
      }
      
      return '';
    },
    onKeyDown: (e) => {
      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
        e.preventDefault();
      }
    }
  },

  // CVV - Numbers only, 3-4 digits
  cvv: {
    filter: (value) => {
      return value.replace(/\D/g, '').slice(0, 4);
    },
    validate: (value) => {
      if (!value) return 'CVV is required';
      if (value.length < 3) return 'CVV must be 3 or 4 digits';
      if (value.length > 4) return 'CVV must be 3 or 4 digits';
      return '';
    },
    onKeyDown: (e) => {
      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
        e.preventDefault();
      }
    }
  },

  // Text - General text validation for OTP/Reference numbers
  text: {
    filter: (value) => {
      // Allow alphanumeric characters only
      return value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
    },
    validate: (value, country, options = {}) => {
      const trimmed = value.trim();
      if (!trimmed) return 'This field is required';
      
      const minLength = options.minLength || 4;
      const maxLength = options.maxLength || 20;
      
      if (trimmed.length < minLength) return `Must be at least ${minLength} characters`;
      if (trimmed.length > maxLength) return `Must be less than ${maxLength} characters`;
      return '';
    },
    onKeyDown: (e) => {
      // Allow alphanumeric characters only
      if (!/[a-zA-Z0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
        e.preventDefault();
      }
    }
  }
};

// Prevent paste of invalid data
export const handlePaste = (e, validatorType, country) => {
  e.preventDefault();
  const pastedData = e.clipboardData.getData('text');
  const validator = inputValidators[validatorType];
  if (validator && validator.filter) {
    const filtered = validator.filter(pastedData, country);
    e.target.value = filtered;
    // Trigger change event
    const event = new Event('input', { bubbles: true });
    e.target.dispatchEvent(event);
  }
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(field => {
    const rule = validationRules[field];
    const validator = inputValidators[rule.type];
    
    if (validator && validator.validate) {
      const error = validator.validate(formData[field], rule.country);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};