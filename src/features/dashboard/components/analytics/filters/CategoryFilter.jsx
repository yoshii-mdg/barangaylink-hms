import { useState, useRef, useEffect } from 'react';
import { IoIosArrowDown } from "react-icons/io";

const FILTER_CATEGORY_OPTIONS = [{ value: 'category', label: 'Category' }];

export default function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange 
}) {
  const [filterCategoryOpen, setFilterCategoryOpen] = useState(false);
  const filterCategoryRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterCategoryRef.current && !filterCategoryRef.current.contains(e.target)) {
        setFilterCategoryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCategory = (option) => {
    onCategoryChange(option.label);
    setFilterCategoryOpen(false);
  };

  return (
    <div className="relative" ref={filterCategoryRef}>
      <button
        type="button"
        onClick={() => setFilterCategoryOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 shrink-0 min-w-[100px] justify-between bg-white hover:bg-gray-50"
      >
        {selectedCategory}
        <IoIosArrowDown className={`w-4 h-4 shrink-0 transition-transform ${filterCategoryOpen ? 'rotate-180' : ''}`} />
      </button>
      {filterCategoryOpen && (
        <div className="absolute top-full left-0 mt-1 py-1 w-full min-w-[100px] bg-white rounded-lg border border-gray-200 shadow-lg z-10">
          {FILTER_CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelectCategory(opt)}
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
