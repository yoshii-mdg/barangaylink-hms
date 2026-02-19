import { useState, useRef, useEffect } from 'react';
import { LuCalendarX } from "react-icons/lu";
import { IoLocationSharp } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";

const DATE_RANGE_OPTIONS = [
  { value: 'last30', label: 'Last 30 days' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
];

const FILTER_ALL_OPTIONS = [{ value: 'all', label: 'All' }];
const FILTER_YEAR_PAGE_SIZE = 9; // 3 rows x 3 columns
const FILTER_CATEGORY_OPTIONS = [{ value: 'category', label: 'Category' }];

function formatDate(d) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toYMD(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return toYMD(a) === toYMD(b);
}

function isInRange(day, start, end) {
  if (!day || !start || !end) return false;
  const t = day.getTime();
  return t > start.getTime() && t < end.getTime();
}

export default function Filters() {
  const [dateRangeLabel, setDateRangeLabel] = useState('Last 30 days');
  const [last30Open, setLast30Open] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [activeDateRange, setActiveDateRange] = useState('last30');
  const [calendarMonth, setCalendarMonth] = useState(() => ({ year: new Date().getFullYear(), month: new Date().getMonth() }));
  const [calendarView, setCalendarView] = useState('days'); // 'days' | 'months' | 'years'
  const [yearRangeStart, setYearRangeStart] = useState(() => new Date().getFullYear() - 15); // for year picker grid
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [filterAllOpen, setFilterAllOpen] = useState(false);
  const [filterYearOpen, setFilterYearOpen] = useState(false);
  const [filterCategoryOpen, setFilterCategoryOpen] = useState(false);
  const [filterAll, setFilterAll] = useState('All');
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));
  const [filterCategory, setFilterCategory] = useState('Category');
  const [filterYearRangeStart, setFilterYearRangeStart] = useState(() => new Date().getFullYear() - 4); // center current year in 3x3 grid (middle position)
  const last30Ref = useRef(null);
  const customRef = useRef(null);
  const filterAllRef = useRef(null);
  const filterYearRef = useRef(null);
  const filterCategoryRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (last30Ref.current && !last30Ref.current.contains(e.target)) setLast30Open(false);
      if (customRef.current && !customRef.current.contains(e.target)) setCustomOpen(false);
      if (filterAllRef.current && !filterAllRef.current.contains(e.target)) setFilterAllOpen(false);
      if (filterYearRef.current && !filterYearRef.current.contains(e.target)) setFilterYearOpen(false);
      if (filterCategoryRef.current && !filterCategoryRef.current.contains(e.target)) setFilterCategoryOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateRangeSelect = (opt) => {
    setDateRangeLabel(opt.label);
    setActiveDateRange(opt.value);
    setLast30Open(false);
  };

  const handleCustomApply = () => {
    if (rangeStart && rangeEnd) {
      const start = toYMD(rangeStart);
      const end = toYMD(rangeEnd);
      setCustomStart(start);
      setCustomEnd(end);
      setActiveDateRange('custom');
    }
    setCustomOpen(false);
  };

  const openCustom = () => {
    setCustomOpen(true);
    setLast30Open(false);
    setCalendarView('days');
    if (customStart && customEnd) {
      const start = new Date(customStart + 'T12:00:00');
      const end = new Date(customEnd + 'T12:00:00');
      setRangeStart(start);
      setRangeEnd(end);
      setCalendarMonth({ year: start.getFullYear(), month: start.getMonth() });
    } else {
      setRangeStart(null);
      setRangeEnd(null);
      const now = new Date();
      setCalendarMonth({ year: now.getFullYear(), month: now.getMonth() });
    }
    setYearRangeStart((y) => {
      const current = new Date().getFullYear();
      if (current >= y && current < y + 16) return y;
      return current - 15;
    });
  };

  const handleCalendarDayClick = (day) => {
    if (!day) return;
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(day);
      setRangeEnd(null);
    } else {
      if (day.getTime() < rangeStart.getTime()) {
        setRangeEnd(rangeStart);
        setRangeStart(day);
      } else {
        setRangeEnd(day);
      }
    }
  };

  const prevMonth = () => {
    setCalendarMonth((m) => (m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 }));
  };
  const nextMonth = () => {
    setCalendarMonth((m) => (m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 }));
  };

  const YEAR_PAGE_SIZE = 16;
  const yearsForPicker = Array.from({ length: YEAR_PAGE_SIZE }, (_, i) => yearRangeStart + i);
  const prevYearPage = () => setYearRangeStart((y) => Math.max(2000, y - YEAR_PAGE_SIZE));
  const nextYearPage = () => setYearRangeStart((y) => y + YEAR_PAGE_SIZE);

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const customLabel = customStart && customEnd
    ? `${formatDate(customStart)} - ${formatDate(customEnd)}`
    : 'Custom';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-6" data-date-range={activeDateRange}>
      {/* Date Range - single light gray rounded container */}
      <div className="inline-flex items-center gap-2 flex-wrap p-2 rounded-xl border-gray-200">
        <span className="text-sm font-semibold  px-1">Date Range</span>

        {/* Last 30 days dropdown - icon inside dropdown */}
        <div className="relative" ref={last30Ref}>
          <button
            type="button"
            onClick={() => {
              setLast30Open((o) => !o);
              setCustomOpen(false);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 shrink-0 min-w-[120px] justify-between bg-white  hover:bg-gray-50"
          >
            <span className="inline-flex items-center gap-2">
              <LuCalendarX className="w-5 h-5 shrink-0" />
              {dateRangeLabel}
            </span>
            <IoIosArrowDown className="w-4 h-4 shrink-0" />
          </button>
          {last30Open && (
            <div className="absolute top-full left-0 mt-1 py-1 w-full min-w-[140px] bg-white rounded-lg border border-gray-200 shadow-lg z-10">
              {DATE_RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleDateRangeSelect(opt)}
                  className="block w-full text-left px-4 py-2 text-sm  hover:bg-gray-100 rounded-md"
                >
                  {opt.label}
                </button>
              ))}
              
            </div>

          )}
        </div>


        {/* Custom dropdown with calendar */}
        <div className="relative" ref={customRef}>
          <button
            type="button"
            onClick={() => (customOpen ? setCustomOpen(false) : openCustom())}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 shrink-0 min-w-[100px] justify-between bg-white  hover:bg-gray-50"
          >
            {customLabel}
            <IoIosArrowDown className="w-4 h-4 shrink-0" />
          </button>
          {customOpen && (
            <div className="absolute top-full left-0 mt-1 p-4 bg-white rounded-lg border border-gray-200 shadow-lg z-10 min-w-[280px]">
              {/* Header: view switcher + nav */}
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={calendarView === 'days' ? prevMonth : calendarView === 'months' ? () => setCalendarMonth((m) => ({ ...m, year: m.year - 1 })) : prevYearPage} aria-label="Previous" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                {calendarView === 'days' && (
                  <button type="button" onClick={() => setCalendarView('months')} className="text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded px-2 py-1">
                    {new Date(calendarMonth.year, calendarMonth.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </button>
                )}
                {calendarView === 'months' && (
                  <button
                    type="button"
                    onClick={() => {
                      setYearRangeStart(Math.max(2000, calendarMonth.year - Math.floor(YEAR_PAGE_SIZE / 2)));
                      setCalendarView('years');
                    }}
                    className="text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded px-2 py-1"
                  >
                    {calendarMonth.year}
                  </button>
                )}
                {calendarView === 'years' && (
                  <span className="text-sm font-semibold text-gray-800">
                    {yearRangeStart} – {yearRangeStart + YEAR_PAGE_SIZE - 1}
                  </span>
                )}
                <button type="button" onClick={calendarView === 'days' ? nextMonth : calendarView === 'months' ? () => setCalendarMonth((m) => ({ ...m, year: m.year + 1 })) : nextYearPage} aria-label="Next" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              {/* Days view */}
              {calendarView === 'days' && (
                <>
                  <div className="grid grid-cols-7 gap-0.5 mb-3">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>
                    ))}
                    {getCalendarDays(calendarMonth.year, calendarMonth.month).map((day, i) => {
                      const isStart = day && rangeStart && isSameDay(day, rangeStart);
                      const isEnd = day && rangeEnd && isSameDay(day, rangeEnd);
                      const inRange = day && isInRange(day, rangeStart, rangeEnd);
                      const isCurrentMonth = day && day.getMonth() === calendarMonth.month;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={!day}
                          onClick={() => handleCalendarDayClick(day)}
                          className={`
                            w-8 h-8 rounded-lg text-sm
                            ${!day ? 'invisible' : ''}
                            ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-800'}
                            ${isStart || isEnd ? 'bg-[#005F02] text-white font-semibold' : ''}
                            ${inRange ? 'bg-[#005F02]/20' : ''}
                            ${day && isCurrentMonth && !isStart && !isEnd && !inRange ? 'hover:bg-gray-100' : ''}
                          `}
                        >
                          {day ? day.getDate() : ''}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Months view */}
              {calendarView === 'months' && (
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {MONTH_NAMES.map((name, i) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setCalendarMonth((m) => ({ ...m, month: i }));
                        setCalendarView('days');
                      }}
                      className="py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}

              {/* Years view */}
              {calendarView === 'years' && (
                <div className="grid grid-cols-4 gap-1.5 mb-3 max-h-[220px] overflow-y-auto">
                  {yearsForPicker.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setCalendarMonth((m) => ({ ...m, year: y }));
                        setCalendarView('months');
                      }}
                      className={`py-2 rounded-lg text-sm font-medium ${y === calendarMonth.year ? 'bg-[#005F02] text-white' : 'text-gray-800 hover:bg-gray-100'}`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setCustomStart('');
                    setCustomEnd('');
                    setRangeStart(null);
                    setRangeEnd(null);
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Reset
                </button>
                <button type="button" onClick={handleCustomApply} disabled={!rangeStart || !rangeEnd} className="px-3 py-1.5 text-sm font-medium bg-[#005F02] text-white rounded-lg hover:bg-[#004a02] disabled:opacity-50 disabled:cursor-not-allowed">Apply</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter by - same style as Date Range dropdowns */}
      <div className="inline-flex items-center gap-2 flex-wrap p-2 rounded-xl border-gray-200">
        <span className="text-sm font-semibold  px-1">Filter by;</span>
        <div className="flex items-center gap-2">
          {/* All dropdown */}
          <div className="relative" ref={filterAllRef}>
            <button
              type="button"
              onClick={() => {
                setFilterAllOpen((o) => !o);
                setFilterYearOpen(false);
                setFilterCategoryOpen(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 shrink-0 min-w-[100px] justify-between bg-white  hover:bg-gray-50"
            >
              <span className="inline-flex items-center gap-2">
                <IoLocationSharp className="w-5 h-5 shrink-0 text-gray-600" />
                {filterAll}
              </span>
              <IoIosArrowDown className="w-4 h-4 shrink-0" />
            </button>
            {filterAllOpen && (
              <div className="absolute top-full left-0 mt-1 py-1 w-full min-w-[100px] bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                {FILTER_ALL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setFilterAll(opt.label);
                      setFilterAllOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm  hover:bg-gray-100 rounded-md"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year picker */}
          <div className="relative" ref={filterYearRef}>
            <button
              type="button"
              onClick={() => {
                setFilterYearOpen((o) => !o);
                setFilterAllOpen(false);
                setFilterCategoryOpen(false);
                const currentYear = parseInt(filterYear, 10);
                if (!isNaN(currentYear)) {
                  // Center the selected year in the 3x3 grid (middle position is index 4)
                  setFilterYearRangeStart(Math.max(2000, currentYear - 4));
                }
              }}
              className="inline-flex items-center gap-5 px-4 py-2 rounded-lg text-sm border border-gray-300 shrink-0 min-w-[90px] justify-between bg-white  hover:bg-gray-50"
            >
              <span className="inline-flex items-center gap-5">
                <span className="font-semibold">Year </span>
              </span>
              <div className="inline-flex items-center gap-0.5 border border-gray-300 rounded px-2 py-0.5">
                {filterYear}
                <IoIosArrowDown className="w-4 h-4 shrink-0" />
              </div>
            </button>
            {filterYearOpen && (
              <div className="absolute top-full left-0 mt-1 p-4 bg-white rounded-lg border border-gray-200 shadow-lg z-10 min-w-[240px]">
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => setFilterYearRangeStart((y) => Math.max(2000, y - FILTER_YEAR_PAGE_SIZE))}
                    aria-label="Previous years"
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="text-sm font-semibold text-gray-800">
                    {filterYearRangeStart} – {filterYearRangeStart + FILTER_YEAR_PAGE_SIZE - 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilterYearRangeStart((y) => y + FILTER_YEAR_PAGE_SIZE)}
                    aria-label="Next years"
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {Array.from({ length: FILTER_YEAR_PAGE_SIZE }, (_, i) => filterYearRangeStart + i).map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setFilterYear(String(y));
                        setFilterYearOpen(false);
                      }}
                      className={`py-2 rounded-lg text-sm font-medium ${String(y) === filterYear ? 'bg-[#005F02] text-white' : 'text-gray-800 hover:bg-gray-100'}`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category dropdown */}
          <div className="relative" ref={filterCategoryRef}>
            <button
              type="button"
              onClick={() => {
                setFilterCategoryOpen((o) => !o);
                setFilterAllOpen(false);
                setFilterYearOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 shrink-0 min-w-[100px] justify-between bg-white  hover:bg-gray-50"
            >
              {filterCategory}
              <IoIosArrowDown className="w-4 h-4 shrink-0" />
            </button>
            {filterCategoryOpen && (
              <div className="absolute top-full left-0 mt-1 py-1 w-full min-w-[100px] bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                {FILTER_CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setFilterCategory(opt.label);
                      setFilterCategoryOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm  hover:bg-gray-100 rounded-md"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
