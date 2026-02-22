import { useState, useEffect } from 'react';
import { LuHouse } from "react-icons/lu";
import { FaRegTrashCan } from "react-icons/fa6";
import { RiArrowDropDownLine } from "react-icons/ri";
import { MdCheck } from 'react-icons/md';
import { CiUser } from "react-icons/ci";

const HEAD_NAME_OPTIONS = [
  { value: 'jm-melca-nueva', label: 'JM Melca Nueva' },
  { value: 'jm-nueva', label: 'JM Nueva' },
  { value: 'melca-nueva', label: 'Melca Nueva' },
  { value: 'jim-nueva', label: 'Jim Nueva' },
];

export default function HouseholdForm({ value = {}, onChange }) {
  const [householdNo, setHouseholdNo] = useState(value.householdNo || '');
  const [headName, setHeadName] = useState(value.headName || '');
  const [address, setAddress] = useState(value.address || '');
  const [members, setMembers] = useState(
    (value.members && value.members.length > 0) ? value.members : [
      'JM Melca Nueva',
      'JM Nueva',
      'Melca Nueva',
      'Jim Nueva',
    ]
  );
  const [showHeadDropdown, setShowHeadDropdown] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  useEffect(() => {
    onChange({
      householdNo,
      headName,
      address,
      members,
    });
  }, [householdNo, headName, address, members, onChange]);

  const handleHeadNameSelect = (option) => {
    setHeadName(option.label);
    setShowHeadDropdown(false);
  };

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      setMembers([...members, newMemberName]);
      setNewMemberName('');
    }
  };

  const handleRemoveMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Household No. and Head Name */}
      <div className="flex flex-col md:flex-row gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Household No.</label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-100 px-4 py-3 border-r border-gray-300 flex items-center justify-center text-[#005F02]">
              <LuHouse className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={householdNo}
              onChange={(e) => setHouseholdNo(e.target.value)}
              placeholder="1-2345"
              className="flex-1 px-1 py-2.5 bg-white focus:outline-none border-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Head Name</label>
          <div className="relative ">
            <button
              type="button"
              onClick={() => setShowHeadDropdown(!showHeadDropdown)}
              className="w-full flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white "
            >
              <div className="bg-gray-100 px-4 py-3 flex items-center justify-center border-r border-gray-300">
                <CiUser className="w-6 h-6" />
              </div>
              <span className="flex-1 text-left px-4 py-2.5 text-gray-700">
                {headName || 'Select Head'}
              </span>
              <RiArrowDropDownLine className={`w-7 h-7 text-gray-400 transition-transform ml-24 mr-4 ${showHeadDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showHeadDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {HEAD_NAME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleHeadNameSelect(option)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-100 flex items-center justify-between"
                  >
                    {option.label}
                    {headName === option.label && <MdCheck className="w-5 h-5 text-[#005F02]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <div className="flex mr-3 items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
          <div className="bg-gray-100 px-4 py-3 flex items-center justify-center border-r text-[#005F02] border-gray-300">
            <LuHouse className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Dahlia Avenue St."
            className="flex-1 px-4 py-2.5 bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Members</label>
          <span className="text-sm font-medium text-gray-600">{members.length}</span>
        </div>

        <div className="space-y-2 mb-4">
          {members.map((member, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border border-gray-200"
            >
          <div className="bg-gray-100 px-4 py-3 flex items-center justify-center border-r text-[#005F02] border-gray-300">
            <CiUser className="w-6 h-6" />
          </div>
              <span className="flex-1 text-sm text-gray-700">{member}</span>
              <button
                type="button"
                onClick={() => handleRemoveMember(index)}
                className="p-1.5 text-gray-500 rounded-lg transition-colors"
                aria-label="Remove member"
              >
                <FaRegTrashCan className="w-5 h-5 hover:text-red-500 transition-colors" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Member */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddMember}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            + Add Member
          </button>
        </div>
      </div>
    </div>
  );
}
