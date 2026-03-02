/**
 * AddressInformationForm.jsx
 *
 * Issues fixed vs. original:
 * 1. Field names aligned to schema:
 *    - `purok` → `purokId` (FK to puroks_tbl.id)
 *    - `houseNo` ✓
 *    - `street` ✓
 *    - Added: `yearsOfResidency`, `isRenter`, `zipCode`
 * 2. Puroks fetched from DB via householdsService.fetchPuroks()
 * 3. Household list fetched from DB for the household FK dropdown.
 */
import { useEffect, useState } from 'react';
import { fetchPuroks } from '../../../../../services/householdsService';
import { fetchHouseholds } from '../../../../../services/householdsService';

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

function Input({ id, value, onChange, placeholder, type = 'text', required, disabled, min }) {
  return (
    <input
      id={id}
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      min={min}
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
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Checkbox({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked ?? false}
        onChange={onChange}
        className="w-4 h-4 accent-[#005F02]"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

export default function AddressInformationForm({ data = {}, onChange, errors = {}, disabled }) {
  const [puroks, setPuroks] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [loadingPuroks, setLoadingPuroks] = useState(true);
  const [loadingHouseholds, setLoadingHouseholds] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPuroks()
      .then((data) => { if (!cancelled) setPuroks(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingPuroks(false); });
    fetchHouseholds()
      .then((data) => { if (!cancelled) setHouseholds(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingHouseholds(false); });
    return () => { cancelled = true; };
  }, []);

  const set = (field) => (e) =>
    onChange(field, e.target.type === 'checkbox' ? e.target.checked : e.target.value);

  const purokOptions = puroks.map((p) => ({ value: p.id, label: p.name }));
  const householdOptions = households.map((h) => ({
    value: h.id,
    label: `${h.household_no ?? h.id} — ${[h.house_no, h.street].filter(Boolean).join(', ')}`,
  }));

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-gray-800 border-b pb-2">Address Information</h3>

      {/* Household link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Household" error={errors.householdId}>
          <Select
            id="householdId"
            value={data.householdId}
            onChange={set('householdId')}
            options={householdOptions}
            placeholder={loadingHouseholds ? 'Loading households…' : 'Select household (optional)'}
            disabled={disabled || loadingHouseholds}
          />
        </Field>
        {/* purokId — FK to puroks_tbl */}
        <Field label="Purok" error={errors.purokId}>
          <Select
            id="purokId"
            value={data.purokId}
            onChange={set('purokId')}
            options={purokOptions}
            placeholder={loadingPuroks ? 'Loading puroks…' : 'Select purok (optional)'}
            disabled={disabled || loadingPuroks}
          />
        </Field>
      </div>

      {/* House / Street */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="House No." error={errors.houseNo}>
          <Input
            id="houseNo"
            value={data.houseNo}
            onChange={set('houseNo')}
            placeholder="123"
            disabled={disabled}
          />
        </Field>
        <Field label="Street" error={errors.street}>
          <Input
            id="street"
            value={data.street}
            onChange={set('street')}
            placeholder="Dahlia Ave."
            disabled={disabled}
          />
        </Field>
      </div>

      {/* Barangay / City / Province / Zip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Barangay" error={errors.barangay}>
          <Input
            id="barangay"
            value={data.barangay ?? 'San Bartolome'}
            onChange={set('barangay')}
            placeholder="San Bartolome"
            disabled={disabled}
          />
        </Field>
        <Field label="City / Municipality" error={errors.city}>
          <Input
            id="city"
            value={data.city ?? 'Quezon City'}
            onChange={set('city')}
            placeholder="Quezon City"
            disabled={disabled}
          />
        </Field>
        <Field label="Province" error={errors.province}>
          <Input
            id="province"
            value={data.province ?? 'Metro Manila'}
            onChange={set('province')}
            placeholder="Metro Manila"
            disabled={disabled}
          />
        </Field>
        <Field label="ZIP Code" error={errors.zipCode}>
          <Input
            id="zipCode"
            value={data.zipCode}
            onChange={set('zipCode')}
            placeholder="1116"
            disabled={disabled}
          />
        </Field>
      </div>

      {/* Years of residency / Renter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <Field label="Years of Residency" error={errors.yearsOfResidency}>
          <Input
            id="yearsOfResidency"
            type="number"
            min="0"
            value={data.yearsOfResidency}
            onChange={set('yearsOfResidency')}
            placeholder="0"
            disabled={disabled}
          />
        </Field>
        <div className="flex items-center h-10 mt-6">
          <Checkbox
            id="isRenter"
            checked={data.isRenter}
            onChange={set('isRenter')}
            label="Is renting / boarder"
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <h3 className="text-base font-semibold text-gray-800 border-b pb-2 pt-2">Emergency Contact</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Full Name" error={errors.emergencyContactName}>
          <Input
            id="emergencyContactName"
            value={data.emergencyContactName}
            onChange={set('emergencyContactName')}
            placeholder="Maria dela Cruz"
            disabled={disabled}
          />
        </Field>
        <Field label="Relationship" error={errors.emergencyContactRelationship}>
          <Input
            id="emergencyContactRelationship"
            value={data.emergencyContactRelationship}
            onChange={set('emergencyContactRelationship')}
            placeholder="Mother, Spouse…"
            disabled={disabled}
          />
        </Field>
        <Field label="Contact Number" error={errors.emergencyContactNumber}>
          <Input
            id="emergencyContactNumber"
            value={data.emergencyContactNumber}
            onChange={set('emergencyContactNumber')}
            placeholder="09XXXXXXXXX"
            disabled={disabled}
          />
        </Field>
      </div>
    </div>
  );
}