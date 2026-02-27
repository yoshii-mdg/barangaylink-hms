export const getCategoryFromValue = (value) => {
  if (value.includes('name')) return 'name';
  if (value.includes('date')) return 'date';
  if (value.includes('status')) return 'status';
  return 'name';
};

export const getOrderFromValue = (value) =>
  value.includes('desc') || value === 'date-oldest' ? 'desc' : 'asc';

export const buildSortValue = (category, order) => {
  if (category === 'name') return order === 'asc' ? 'name-asc' : 'name-desc';
  if (category === 'date') return order === 'asc' ? 'date-newest' : 'date-oldest';
  return 'status';
};