import { useState } from 'react';
import { ActionDropdown } from '../../../../shared';
import { FaRegTrashAlt } from 'react-icons/fa';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { LuShieldOff, LuShieldCheck } from 'react-icons/lu';

// Maps DB role values → display labels
const ROLE_LABELS = {
  superadmin: 'Super Admin',
  staff:      'Staff',
  resident:   'Resident',
};

const ROLE_OPTIONS = [
  { value: 'superadmin', label: 'Super Admin' },
  { value: 'staff',      label: 'Staff' },
  { value: 'resident',   label: 'Resident' },
];

const STATUS_CLASSES = {
  true:  'bg-emerald-100 text-emerald-800',
  false: 'bg-gray-100 text-gray-600',
};

export default function UserTable({
  users = [],
  onDeleteUser,
  onRoleChange,
  onDeactivateUser,
  onReactivateUser,
}) {
  const [openRoleDropdown, setOpenRoleDropdown] = useState(null);

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full min-w-[700px] text-base relative">
        <thead>
          <tr className="text-left text-sm bg-[#F1F7F2] text-gray-700 border-b border-gray-200">
            <th className="py-3 px-4 font-semibold">Name</th>
            <th className="py-3 px-4 font-semibold">Email</th>
            <th className="py-3 px-4 font-semibold">Role</th>
            <th className="py-3 px-4 font-semibold">Status</th>
            <th className="py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user, idx) => (
              <tr
                key={user.user_id ?? idx}
                className={`border-b border-gray-100 border-l border-r last:border-b-0 ${
                  idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-gray-50/80 transition-colors`}
              >
                {/* Name */}
                <td className="py-3 px-4 text-gray-800">
                  {[user.first_name, user.middle_name, user.last_name].filter(Boolean).join(' ') || '—'}
                </td>

                {/* Email */}
                <td className="py-3 px-4 text-gray-800">{user.email || '—'}</td>

                {/* Role — inline dropdown */}
                <td className="py-3 px-4 relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenRoleDropdown(openRoleDropdown === user.user_id ? null : user.user_id)
                    }
                    className="px-3 py-1.5 text-sm flex items-center gap-1 rounded hover:bg-gray-100 transition-colors"
                    aria-haspopup="listbox"
                    aria-expanded={openRoleDropdown === user.user_id}
                  >
                    <span>{ROLE_LABELS[user.role] ?? user.role}</span>
                    <RiArrowDropDownLine
                      className={`w-6 h-6 text-gray-500 transition-transform ${
                        openRoleDropdown === user.user_id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openRoleDropdown === user.user_id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenRoleDropdown(null)}
                      />
                      <div
                        className="absolute left-0 top-full mt-1 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-20"
                        role="listbox"
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={user.role === option.value}
                            onClick={() => {
                              onRoleChange?.(user.user_id, option.value);
                              setOpenRoleDropdown(null);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                              user.role === option.value
                                ? 'bg-green-50 text-green-700 font-medium'
                                : ''
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${
                      STATUS_CLASSES[String(user.is_active)] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 relative">
                  <ActionDropdown
                    actions={[
                      user.is_active
                        ? {
                            icon: LuShieldOff,
                            label: 'Deactivate',
                            onClick: () => onDeactivateUser?.(user),
                          }
                        : {
                            icon: LuShieldCheck,
                            label: 'Reactivate',
                            onClick: () => onReactivateUser?.(user),
                          },
                      {
                        icon: FaRegTrashAlt,
                        label: 'Delete',
                        onClick: () => onDeleteUser?.(user),
                        className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                      },
                    ]}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}