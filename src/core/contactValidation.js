/**
 * Validates a Philippine mobile number.
 * Rules:
 *   - Exactly 11 digits
 *   - Must start with 09
 *   - Non-digit characters (spaces, dashes) are stripped before checking
 *
 * @param {string} value
 * @param {boolean} required - if true, an empty value is also an error
 * @returns {string | true} error message string, or true if valid
 */
export function validateContactNumber(value, required = false) {
    if (!value || value.trim() === '') {
        if (required) return 'Contact number is required.';
        return true; // optional — empty is fine
    }
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 11) return 'Contact number must be exactly 11 digits.';
    if (!digits.startsWith('09')) return 'Contact number must start with 09 (e.g. 09171234567).';
    return true;
}

/**
 * Strips non-digit characters and enforces max 11 digits.
 * Use as an onChange handler to keep input clean.
 *
 * @param {string} value - raw input value
 * @returns {string} cleaned value (digits only, max 11 chars)
 */
export function sanitizeContactNumber(value) {
    return value.replace(/\D/g, '').slice(0, 11);
}