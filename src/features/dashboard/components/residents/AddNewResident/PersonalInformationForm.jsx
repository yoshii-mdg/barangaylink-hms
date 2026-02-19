import { FiUser } from 'react-icons/fi';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02]';

export default function PersonalInformationForm({ value = {}, onChange }) {
  const update = (field, val) => onChange?.({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FiUser className="w-5 h-5 text-[#005F02]" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Personal Information
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
          <input
            type="text"
            value={value.lastName ?? ''}
            onChange={(e) => update('lastName', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
          <input
            type="text"
            value={value.firstName ?? ''}
            onChange={(e) => update('firstName', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Middle Name</label>
          <input
            type="text"
            value={value.middleName ?? ''}
            onChange={(e) => update('middleName', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Suffix</label>
          <input
            type="text"
            value={value.suffix ?? ''}
            onChange={(e) => update('suffix', e.target.value)}
            placeholder="e.g. Jr., Sr."
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Birthdate</label>
          <input
            type="text"
            value={value.birthdate ?? ''}
            onChange={(e) => update('birthdate', e.target.value)}
            placeholder="MM/DD/YYYY"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
          <select
            value={value.gender ?? ''}
            onChange={(e) => update('gender', e.target.value)}
            className={inputClass}
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Number</label>
          <input
            type="text"
            value={value.contactNumber ?? ''}
            onChange={(e) => update('contactNumber', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
