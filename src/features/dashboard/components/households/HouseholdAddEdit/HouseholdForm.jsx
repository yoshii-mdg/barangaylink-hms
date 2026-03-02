/**
 * HouseholdAddEdit/HouseholdForm.jsx
 *
 * Issues fixed vs. original:
 * 1. Field names aligned to schema:
 *    - `purok` → `purokId` (FK to puroks_tbl.id)
 *    - Added: `ownershipType`, `structureType`, `remarks`
 *    - membership_role_enum values for members
 * 2. Puroks and available residents fetched from Supabase.
 * 3. Members managed via household_members_tbl relationships.
 */
import { useState, useEffect } from 'react';
import { fetchPuroks } from '../../../../../services/householdsService';
import { fetchResidents } from '../../../../../services/residentsService';

const OWNERSHIP_TYPES = ['Owned', 'Rented', 'Shared', 'Government-issued', 'Other'];
const STRUCTURE_TYPES = ['Concrete', 'Wood', 'Mixed', 'Semi-concrete', 'Makeshift', 'Other'];
// membership_role_enum
const MEMBER_ROLES = ['Head', 'Spouse', 'Child', 'Parent', 'Sibling', 'Relative', 'Boarder', 'Other'];

function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Input({ id, value, onChange, placeholder, disabled }) {
  return (
    <input
      id={id}
      type="text"
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]/20 focus:border-[#005F02] disabled:bg-gray-50"
    />
  );
}

function Select({ id, value, onChange, options, placeholder, required, disabled }) {
  return (
    <select
      id={id}
      value={value ?? ''}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="h-10 px-3 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#005F02]/20 focus:border-[#005F02] disabled:bg-gray-50"
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  );
}

/**
 * @param {object} props
 * @param {object} props.data       - current form values
 * @param {function} props.onChange - (field, value) => void
 * @param {object} props.errors
 * @param {boolean} props.disabled
 */
export default function HouseholdForm({ data = {}, onChange, errors = {}, disabled }) {
  const [puroks, setPuroks] = useState([]);
  const [allResidents, setAllResidents] = useState([]);
  const [loadingPuroks, setLoadingPuroks] = useState(true);
  const [loadingResidents, setLoadingResidents] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPuroks()
      .then((d) => { if (!cancelled) setPuroks(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingPuroks(false); });
    fetchResidents()
      .then((d) => { if (!cancelled) setAllResidents(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingResidents(false); });
    return () => { cancelled = true; };
  }, []);

  const set = (field) => (e) => onChange(field, e.target.value);

  const purokOptions = puroks.map((p) => ({ value: p.id, label: p.name }));
  const residentOptions = allResidents.map((r) => ({
    value: r.id,
    label: [r.last_name, r.first_name, r.middle_name].filter(Boolean).join(', '),
  }));

  // Members helpers
  const members = data.members ?? [];

  const addMember = () => {
    onChange('members', [
      ...members,
      { residentId: '', role: 'Other', isHead: false },
    ]);
  };

  const updateMember = (idx, field, value) => {
    const updated = members.map((m, i) => {
      if (i !== idx) return m;
      const next = { ...m, [field]: value };
      // Only one head allowed
      if (field === 'isHead' && value) {
        return next;
      }
      return next;
    });
    // Enforce single head
    if (field === 'isHead' && value) {
      onChange('members', updated.map((m, i) => (i === idx ? m : { ...m, isHead: false })));
    } else {
      onChange('members', updated);
    }
  };

  const removeMember = (idx) => {
    onChange('members', members.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-gray-800 border-b pb-2">Household Location</h3>

      {/* Purok */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Purok" error={errors.purokId}>
          <Select
            id="purokId"
            value={data.purokId}
            onChange={set('purokId')}
            options={purokOptions}
            placeholder={loadingPuroks ? 'Loading…' : 'Select purok (optional)'}
            disabled={disabled || loadingPuroks}
          />
        </Field>
        <Field label="House No." error={errors.houseNo}>
          <Input id="houseNo" value={data.houseNo} onChange={set('houseNo')} placeholder="123" disabled={disabled} />
        </Field>
        <Field label="Street" error={errors.street}>
          <Input id="street" value={data.street} onChange={set('street')} placeholder="Dahlia Ave." disabled={disabled} />
        </Field>
        <Field label="Barangay" error={errors.barangay}>
          <Input id="barangay" value={data.barangay ?? 'San Bartolome'} onChange={set('barangay')} placeholder="San Bartolome" disabled={disabled} />
        </Field>
        <Field label="City" error={errors.city}>
          <Input id="city" value={data.city ?? 'Quezon City'} onChange={set('city')} placeholder="Quezon City" disabled={disabled} />
        </Field>
        <Field label="ZIP Code" error={errors.zipCode}>
          <Input id="zipCode" value={data.zipCode} onChange={set('zipCode')} placeholder="1116" disabled={disabled} />
        </Field>
      </div>

      {/* Property details */}
      <h3 className="text-base font-semibold text-gray-800 border-b pb-2 pt-2">Property Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Ownership Type" error={errors.ownershipType}>
          <Select
            id="ownershipType"
            value={data.ownershipType}
            onChange={set('ownershipType')}
            options={OWNERSHIP_TYPES}
            placeholder="Select type"
            disabled={disabled}
          />
        </Field>
        <Field label="Structure Type" error={errors.structureType}>
          <Select
            id="structureType"
            value={data.structureType}
            onChange={set('structureType')}
            options={STRUCTURE_TYPES}
            placeholder="Select type"
            disabled={disabled}
          />
        </Field>
      </div>

      <Field label="Remarks" error={errors.remarks}>
        <textarea
          id="remarks"
          value={data.remarks ?? ''}
          onChange={set('remarks')}
          placeholder="Additional notes…"
          rows={2}
          disabled={disabled}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#005F02]/20 focus:border-[#005F02] disabled:bg-gray-50"
        />
      </Field>

      {/* Members */}
      <div className="flex items-center justify-between border-b pb-2 pt-2">
        <h3 className="text-base font-semibold text-gray-800">Household Members</h3>
        <button
          type="button"
          onClick={addMember}
          disabled={disabled}
          className="text-sm text-[#005F02] font-medium hover:underline disabled:opacity-50"
        >
          + Add Member
        </button>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No members added yet. Click "Add Member" to link residents.
        </p>
      ) : (
        <div className="space-y-3">
          {members.map((m, idx) => (
            <div key={idx} className="flex gap-3 items-end p-3 rounded-lg bg-gray-50 border border-gray-200">
              {/* Resident picker */}
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 mb-1 block">Resident</label>
                <select
                  value={m.residentId ?? ''}
                  onChange={(e) => updateMember(idx, 'residentId', e.target.value)}
                  disabled={disabled || loadingResidents}
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#005F02]/20"
                >
                  <option value="" disabled>
                    {loadingResidents ? 'Loading…' : 'Select resident'}
                  </option>
                  {residentOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role */}
              <div className="w-36">
                <label className="text-xs font-medium text-gray-600 mb-1 block">Role</label>
                <select
                  value={m.role ?? 'Other'}
                  onChange={(e) => updateMember(idx, 'role', e.target.value)}
                  disabled={disabled}
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#005F02]/20"
                >
                  {MEMBER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Head toggle */}
              <label className="flex items-center gap-1.5 pb-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={m.isHead ?? false}
                  onChange={(e) => updateMember(idx, 'isHead', e.target.checked)}
                  disabled={disabled}
                  className="w-4 h-4 accent-[#005F02]"
                />
                <span className="text-xs text-gray-700 whitespace-nowrap">Head</span>
              </label>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeMember(idx)}
                disabled={disabled}
                className="pb-2 text-red-400 hover:text-red-600 text-xs font-medium"
                aria-label={`Remove member ${idx + 1}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}