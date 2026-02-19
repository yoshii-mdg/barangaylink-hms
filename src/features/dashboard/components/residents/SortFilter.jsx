import { useState, useRef, useEffect } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'date-newest', label: 'Date (Newest)' },
  { value: 'date-oldest', label: 'Date (Oldest)' },
  { value: 'status', label: 'Status' },
];

export default function SortFilter({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? 'Filter by';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 min-w-[140px] justify-between"
      >
        <span>{selectedLabel}</span>
        <IoIosArrowDown className="w-4 h-4 shrink-0" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 py-1 w-full min-w-[160px] bg-white rounded-lg border border-gray-200 shadow-lg z-10">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange?.(opt.value);
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
