/**
 * Form Validation Rules & Sanitization Utilities
 */

// 1. Validate Name (Alphabets, spaces, dots only - NO Numbers)
export function validateName(value, required = true) {
  if (!value || !value.toString().trim()) {
    return required ? { isValid: false, error: 'Name is required' } : { isValid: true, error: '' };
  }
  const nameRegex = /^[a-zA-Z\s'.]+$/;
  if (!nameRegex.test(value)) {
    return { isValid: false, error: 'Name cannot contain numbers or special characters' };
  }
  if (value.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  return { isValid: true, error: '' };
}

// 2. Validate Mobile Number (Digits only, exactly 10 digits)
export function validateMobile(value, required = true) {
  if (!value || !value.toString().trim()) {
    return required ? { isValid: false, error: 'Mobile number is required' } : { isValid: true, error: '' };
  }
  const cleanVal = value.toString().replace(/\D/g, '');
  if (cleanVal.length !== 10) {
    return { isValid: false, error: 'Mobile number must be exactly 10 digits' };
  }
  return { isValid: true, error: '' };
}

// 3. Validate Numeric Fields (Age, Amount, Fee, Quantity, ID - Numbers only)
export function validateNumber(value, required = true, min = null, max = null) {
  if (value === null || value === undefined || value.toString().trim() === '') {
    return required ? { isValid: false, error: 'This field is required' } : { isValid: true, error: '' };
  }
  const num = Number(value);
  if (isNaN(num)) {
    return { isValid: false, error: 'Only numeric digits allowed' };
  }
  if (min !== null && num < min) {
    return { isValid: false, error: `Value must be at least ${min}` };
  }
  if (max !== null && num > max) {
    return { isValid: false, error: `Value cannot exceed ${max}` };
  }
  return { isValid: true, error: '' };
}

// 4. Validate Email Format
export function validateEmail(value, required = false) {
  if (!value || !value.toString().trim()) {
    return required ? { isValid: false, error: 'Email address is required' } : { isValid: true, error: '' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true, error: '' };
}

// 5. Generic Required Field Check
export function validateRequired(value, fieldName = 'Field') {
  if (value === null || value === undefined || value.toString().trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true, error: '' };
}

// 6. Real-time Input Sanitizer (Prevents invalid keypresses)
export function sanitizeInput(value, inputType) {
  if (!value && value !== 0) return '';
  const str = value.toString();

  switch (inputType) {
    case 'name':
      // Strips digits and special symbols except spaces, dots, apostrophes
      return str.replace(/[^a-zA-Z\s'.]/g, '');

    case 'mobile':
      // Strips non-digits and truncates to 10 digits
      return str.replace(/\D/g, '').slice(0, 10);

    case 'number':
    case 'numeric':
      // Keeps digits and single decimal point
      return str.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

    case 'integer':
      // Keeps digits only
      return str.replace(/\D/g, '');

    default:
      return str;
  }
}
