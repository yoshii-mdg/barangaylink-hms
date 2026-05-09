// ─────────────────────────────────────────────────────────────
// Lightweight input sanitizer for XSS prevention.
// Runs on every text field before form data reaches the backend.
// ─────────────────────────────────────────────────────────────

const HTML_TAG_RE = /<\/?[^>]+(>|$)/g;
const MULTI_SPACE_RE = /\s{2,}/g;

/**
 * Strip HTML/XML tags and collapse excessive whitespace.
 */
function stripTags(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(HTML_TAG_RE, '')
    .replace(MULTI_SPACE_RE, ' ')
    .trim();
}

/**
 * Recursively sanitize all string values in a plain object / nested structure.
 * Non-string values (numbers, booleans, Files, null) are left untouched.
 */
export function sanitizeFormData(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return stripTags(obj);
  if (obj instanceof File) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeFormData);

  if (typeof obj === 'object') {
    const clean = {};
    for (const [key, val] of Object.entries(obj)) {
      clean[key] = sanitizeFormData(val);
    }
    return clean;
  }

  return obj; // numbers, booleans, etc.
}
