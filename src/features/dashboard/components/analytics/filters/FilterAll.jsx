import { useState, useRef, useEffect } from 'react';
import { IoLocationSharp } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";

const FILTER_ALL_OPTIONS = [{ value: 'all', label: 'All' }];

export default function FilterAll({ 
  selectedFilter, 
  onFilterChange 
}) {
  const [filterAllOpen, setFilterAllOpen] = useState(false);
  const filterAllRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterAllRef.current && !filterAllRef.current.contains(e.target)) {
        setFilterAllOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOption = (option) => {
    onFilterChange(option.label);
    setFilterAllOpen(false);
  };

  return (
    <div className="relative" ref={filterAllRef}>
      <button
        type="button"
        onClick={() => setFilterAllOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 shrink-0 min-w-[100px] justify-between bg-white hover:bg-gray-50"
      >
        <span className="inline-flex items-center gap-2">
          <IoLocationSharp className="w-5 h-5 shrink-0 text-gray-600" />
          {selectedFilter}
        </span>
        <IoIosArrowDown className="w-4 h-4 shrink-0" />
      </button>
      {filterAllOpen && (
        <div className="absolute top-full left-0 mt-1 py-1 w-full min-w-[100px] bg-white rounded-lg border border-gray-200 shadow-lg z-10">
          {FILTER_ALL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelectOption(opt)}
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
