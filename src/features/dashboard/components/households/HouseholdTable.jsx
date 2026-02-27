import { useState, useRef, useEffect } from 'react';
import { HiEllipsisVertical, HiPencilSquare } from 'react-icons/hi2';
import { FaRegTrashAlt } from "react-icons/fa";
import { RiUserMinusLine } from "react-icons/ri";

export default function HouseholdTable({ households = [], onEditHousehold, onArchiveHousehold, onDeleteHousehold }) {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownClick = (e, householdId) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === householdId ? null : householdId);
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full min-w-[600px] text-base relative">
        <thead>
          <tr className="text-left text-sm bg-[#F1F7F2] text-gray-700 border-b border-gray-200">
            <th className="py-3 px-4 font-semibold">Household No.</th>
            <th className="py-3 px-4 font-semibold">Head Member Name</th>
            <th className="py-3 px-4 font-semibold">Address</th>
            <th className="py-3 px-4 font-semibold">Members</th>
            <th className="py-3 px-4 font-semibold">Status</th>
            <th className="py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {households.map((household, idx) => (
            <tr
              key={household.id ?? idx}
              className={`border-b border-gray-100 border-l border-r last:border-b-0 ${idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-gray-50/80 transition-colors`}
            >
              <td className="py-3 px-4 text-gray-800">{household.householdNo}</td>
              <td className="py-3 px-4 text-gray-800">{household.headMemberName}</td>
              <td className="py-3 px-4 text-gray-800">{household.address}</td>
              <td className="py-3 px-4 text-gray-800">{household.members}</td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block px-4 py-1 rounded-lg text-xs font-medium ${household.status === 'Active'
                      ? 'bg-emerald-100 px-5 text-emerald-800'
                      : 'bg-red-100  text-red-800'
                    }`}
                >
                  {household.status}
                </span>
              </td>
              <td className="py-3 px-4 relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={(e) => handleDropdownClick(e, household.id)}
                  className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <HiEllipsisVertical className="w-5 h-5 text-gray-600" />
                </button>
                {openDropdownId === household.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50 pointer-events-auto">
                    <div
                      role="button"
                      tabIndex="0"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onEditHousehold?.(household);
                        setOpenDropdownId(null);
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 transition-colors border-b border-gray-100 cursor-pointer"
                    >
                      <HiPencilSquare className="w-4 h-4 text-gray-600" />
                      <span>Edit</span>
                    </div>
                    <div
                      role="button"
                      tabIndex="0"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onDeleteHousehold?.(household);
                        setOpenDropdownId(null);
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 transition-colors border-b border-gray-100 cursor-pointer "
                    >
                      <RiUserMinusLine className="w-4 h-4 text-gray-600" />
                      <span>Archive Resident</span>
                    </div>
                    <div
                      role="button"
                      tabIndex="0"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        console.log('Delete button clicked, calling onDeleteHousehold with:', household);
                        onDeleteHousehold?.(household);
                        setOpenDropdownId(null);
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 transition-colors text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <FaRegTrashAlt className="w-4 h-4" />
                      <span>Delete</span>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
