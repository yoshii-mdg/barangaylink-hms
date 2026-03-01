const ROLE_FILTERS = [
  { label: 'All',         value: 'all' },
  { label: 'Super Admin', value: 'superadmin' },
  { label: 'Staff',       value: 'staff' },
  { label: 'Resident',    value: 'resident' },
];

/**
 * Tab bar for filtering the user list by role.
 * roleCounts keys must match filter values.
 */
export default function RoleTabs({ roleFilter, onRoleChange, roleCounts = {} }) {
  return (
    <div className="flex gap-8 border-b border-gray-200 mb-6 overflow-x-auto" role="tablist">
      {ROLE_FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          role="tab"
          aria-selected={roleFilter === filter.value}
          onClick={() => onRoleChange(filter.value)}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
            roleFilter === filter.value
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {filter.label} ({roleCounts[filter.value] ?? 0})
        </button>
      ))}
    </div>
  );
}