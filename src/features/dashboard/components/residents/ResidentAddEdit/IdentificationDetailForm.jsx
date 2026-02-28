import { IoInformationCircleOutline } from 'react-icons/io5';
import { FormSelect } from '../../../../../shared';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02]';

export default function IdentificationDetailForm({ value = {}, onChange }) {
  const update = (field, val) => onChange?.({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <IoInformationCircleOutline className="w-5 h-5 text-[#005F02]" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Identification Details
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Number</label>
          <div className="relative">
            <input
              type="text"
              value={value.idNumber ?? ''}
              onChange={(e) => update('idNumber', e.target.value)}
              placeholder="1111-111-11"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
          <FormSelect
            placeholder="Status"
            value={value.status ?? 'Active'}
            onChange={(val) => update('status', val)}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
