import { useState, useRef, useCallback } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { MdCheck } from 'react-icons/md';
import { useClickOutside } from '../hooks/useClickOutside';
import { getOrderFromValue, buildSortValue } from '../utils/sortUtils';

const SORT_OPTIONS = [
  { value: 'date-newest', label: 'Date (Newest)', category: 'date' },
  { value: 'date-oldest', label: 'Date (Oldest)', category: 'date' },
  { value: 'status',      label: 'Status',         category: 'status' },
];

export default function SortFilter({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useClickOutside(ref, useCallback(() => setIsOpen(false), []));

  const handleSortChange = (optValue) => {
    const opt = SORT_OPTIONS.find((o) => o.value === optValue);
    if (opt) onChange?.(buildSortValue(opt.category, getOrderFromValue(optValue)));
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="inline-flex items-center text-gray-900 gap-2 px-4 py-2.5 rounded-lg text-base font-medium border border-gray-300 bg-white hover:bg-gray-50 justify-between shadow-sm transition-all"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>Sort By</span>
        <IoIosArrowDown
          className={`w-4 h-4 shrink-0 transition-transform text-gray-500 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 py-1 w-full min-w-40 bg-white rounded-lg border border-gray-200 shadow-lg z-10" role="listbox">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              onClick={() => handleSortChange(opt.value)}
              className="flex items-center justify-between w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
            >
              <span>{opt.label}</span>
              {value === opt.value && <MdCheck className="w-4 h-4 text-green-600" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}