import { useState, useRef, useEffect } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { MdCheck } from 'react-icons/md';

const SORT_OPTIONS = [
  { value: 'date-newest', label: 'Date (Newest)', category: 'date' },
  { value: 'date-oldest', label: 'Date (Oldest)', category: 'date' },
  { value: 'status', label: 'Status', category: 'status' },
];

const DISPLAY_OPTIONS = SORT_OPTIONS.filter((opt) => opt.value !== 'name-asc');

const getCategoryFromValue = (value) => {
  if (value.includes('name')) return 'name';
  if (value.includes('date')) return 'date';
  if (value.includes('status')) return 'status';
  return 'name';
};

const getOrderFromValue = (value) => {
  if (value.includes('desc') || value === 'date-oldest') return 'desc';
  return 'asc';
};

const buildSortValue = (category, order) => {
  if (category === 'name') {
    return order === 'asc' ? 'name-asc' : 'name-desc';
  }
  if (category === 'date') {
    return order === 'asc' ? 'date-newest' : 'date-oldest';
  }
  return 'status';
};

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

  const handleSortChange = (optValue) => {
    const selectedOpt = SORT_OPTIONS.find((o) => o.value === optValue);
    if (selectedOpt) {
      const selectedOrder = getOrderFromValue(optValue);
      onChange?.(buildSortValue(selectedOpt.category, selectedOrder));
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="inline-flex items-center text-black/70 gap-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 justify-between"
      >
        <span>Sort By</span>
        <IoIosArrowDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 py-1 w-full min-w-40 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
          {DISPLAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSortChange(opt.value)}
              className="flex items-center justify-between w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
            >
              <span>{opt.label}</span>
              {value === opt.value && <MdCheck className="w-4 h-4 text-green-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
