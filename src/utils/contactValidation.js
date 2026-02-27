/**
 * Validates a Philippine mobile number (11 digits, starts with 09).
 * @returns {string | true} error message or true if valid
 */
export function validateContactNumber(value, required = false) {
  if (!value || value.trim() === '') {
    return required ? 'Contact number is required.' : true;
  }
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) return 'Contact number must be exactly 11 digits.';
  if (!digits.startsWith('09')) return 'Contact number must start with 09 (e.g. 09171234567).';
  return true;
}

/** Strips non-digits and caps at 11 characters. Use as an onChange sanitizer. */
export function sanitizeContactNumber(value) {
  return value.replace(/\D/g, '').slice(0, 11);
}