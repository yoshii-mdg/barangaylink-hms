/**
 * sortUtils.js
 *
 * FIX: `getOrderFromValue` had inverted logic for date sorting.
 *
 * Previous (broken):
 *   'date-oldest' → 'desc'  ← WRONG: desc gives newest first, not oldest
 *   'date-newest' → 'asc'   ← WRONG: asc gives oldest first, not newest
 *
 * Corrected:
 *   'date-newest' → 'desc'  ← DESC on created_at = latest date at top = newest first ✓
 *   'date-oldest' → 'asc'   ← ASC on created_at  = earliest date at top = oldest first ✓
 *
 * Also fixed `buildSortValue` to match:
 *   date + asc  → 'date-oldest'   (ascending timestamp = oldest at top)
 *   date + desc → 'date-newest'   (descending timestamp = newest at top)
 *
 * The name-based sorting was correct (name-asc = A→Z, name-desc = Z→A).
 */

export const getCategoryFromValue = (value) => {
  if (value.includes('name')) return 'name';
  if (value.includes('date')) return 'date';
  if (value.includes('status')) return 'status';
  return 'name';
};

/**
 * Returns the SQL sort order ('asc' | 'desc') for a given sort value string.
 *
 * For DATE:
 *   'date-newest' → 'desc'  (DESC timestamp = most recent first)
 *   'date-oldest' → 'asc'   (ASC timestamp  = earliest first)
 *
 * For NAME:
 *   'name-asc'  → 'asc'   (A → Z)
 *   'name-desc' → 'desc'  (Z → A)
 */
export const getOrderFromValue = (value) => {
  if (value === 'date-newest') return 'desc';
  if (value === 'date-oldest') return 'asc';
  if (value.includes('desc')) return 'desc';
  return 'asc';
};

/**
 * Builds a sort value string from a category + order pair.
 *
 * For DATE:
 *   asc  → 'date-oldest'  (ascending timestamp = oldest shown first)
 *   desc → 'date-newest'  (descending timestamp = newest shown first)
 *
 * For NAME:
 *   asc  → 'name-asc'
 *   desc → 'name-desc'
 */
export const buildSortValue = (category, order) => {
  if (category === 'name') return order === 'asc' ? 'name-asc' : 'name-desc';
  if (category === 'date') return order === 'asc' ? 'date-oldest' : 'date-newest';
  return 'status';
};