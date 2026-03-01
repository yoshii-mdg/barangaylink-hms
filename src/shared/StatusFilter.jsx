import { useState, useRef, useCallback } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { MdCheck } from 'react-icons/md';
import { useClickOutside } from '../hooks/useClickOutside';

const STATUS_OPTIONS = [
  { value: 'all',         label: 'All Status' },
  { value: 'active',      label: 'Active' },
  { value: 'inactive',    label: 'Inactive' },
  { value: 'pending',     label: 'Pending' },
  { value: 'deactivated', label: 'Deactivated' },
];

export default function StatusFilter({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useClickOutside(ref, useCallback(() => setIsOpen(false), []));

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium">Status</span>
        <IoIosArrowDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          role="listbox"
        >
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onClick={() => { onChange?.(option.value); setIsOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <span>{option.label}</span>
              {value === option.value && <MdCheck className="w-5 h-5 text-[#005F02]" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}