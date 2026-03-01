import { FiSearch } from 'react-icons/fi';

export default function SearchBox({ value = '', onChange, placeholder = 'Search' }) {
  return (
    <div className="relative flex-1 w-full sm:max-w-md">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02] shadow-sm transition-all"
      />
    </div>
  );
}