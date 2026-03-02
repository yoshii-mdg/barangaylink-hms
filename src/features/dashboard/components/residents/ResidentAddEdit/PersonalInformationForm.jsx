/**
 * PersonalInformationForm.jsx
 *
 * Issues fixed vs. original:
 * 1. Field names aligned to schema columns:
 *    - `isRegisteredVoter` → `isVoter` (schema: is_voter)
 *    - `precinctNo` → `voterIdNo` (schema: voter_id_no)
 *    - `emailAddress` → `email` (schema: email)
 *    - Added missing fields: monthlyIncome, isSoloParent, is4psBeneficiary,
 *      isSeniorCitizen, educationalAttainment, bloodType
 * 2. gender enum values match schema: 'Male' | 'Female' (case-sensitive)
 * 3. civil_status enum values match schema exactly.
 * 4. status enum values match resident_status_enum: Active | Inactive | Transferred | Deceased
 */
import { useEffect } from 'react';

const CIVIL_STATUS_OPTIONS = ['Single', 'Married', 'Widowed', 'Legally Separated', 'Annulled'];
const STATUS_OPTIONS = ['Active', 'Inactive', 'Transferred', 'Deceased'];
const EDUCATION_OPTIONS = [
  'No formal education',
  'Elementary',
  'High School',
  'Senior High School',
  'Vocational / Tech-Voc',
  'College',
  "Post-Graduate / Master's",
  'Doctorate',
];
const BLOOD_TYPE_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

/** Reusable form field wrapper */
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

function Input({ id, value, onChange, placeholder, type = 'text', required, disabled, ...rest }) {
  return (
    <input
      id={id}
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]/20 focus:border-[#005F02] disabled:bg-gray-50"
      {...rest}
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
      className="h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]/20 focus:border-[#005F02] disabled:bg-gray-50 bg-white"
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
          {typeof o === 'string' ? o : o.label}
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

/**
 * @param {object} props
 * @param {object} props.data         - current form values
 * @param {function} props.onChange   - (field, value) => void
 * @param {object} props.errors       - validation errors keyed by field name
 * @param {boolean} props.disabled
 */
export default function PersonalInformationForm({ data = {}, onChange, errors = {}, disabled }) {
  const set = (field) => (e) =>
    onChange(field, e.target.type === 'checkbox' ? e.target.checked : e.target.value);

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-gray-800 border-b pb-2">Personal Information</h3>

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="sm:col-span-1">
          <Field label="First Name" required error={errors.firstName}>
            <Input
              id="firstName"
              value={data.firstName}
              onChange={set('firstName')}
              placeholder="Juan"
              required
              disabled={disabled}
            />
          </Field>
        </div>
        <div className="sm:col-span-1">
          <Field label="Middle Name" error={errors.middleName}>
            <Input
              id="middleName"
              value={data.middleName}
              onChange={set('middleName')}
              placeholder="Santos"
              disabled={disabled}
            />
          </Field>
        </div>
        <div className="sm:col-span-1">
          <Field label="Last Name" required error={errors.lastName}>
            <Input
              id="lastName"
              value={data.lastName}
              onChange={set('lastName')}
              placeholder="dela Cruz"
              required
              disabled={disabled}
            />
          </Field>
        </div>
        <div className="sm:col-span-1">
          <Field label="Suffix" error={errors.suffix}>
            <Input
              id="suffix"
              value={data.suffix}
              onChange={set('suffix')}
              placeholder="Jr., III"
              disabled={disabled}
            />
          </Field>
        </div>
      </div>

      {/* Gender / Birthdate / Birthplace */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Sex" required error={errors.gender}>
          {/* schema enum: 'Male' | 'Female' */}
          <Select
            id="gender"
            value={data.gender}
            onChange={set('gender')}
            options={['Male', 'Female']}
            placeholder="Select sex"
            required
            disabled={disabled}
          />
        </Field>
        <Field label="Date of Birth" required error={errors.birthdate}>
          <Input
            id="birthdate"
            type="date"
            value={data.birthdate}
            onChange={set('birthdate')}
            required
            disabled={disabled}
          />
        </Field>
        <Field label="Place of Birth" error={errors.birthplace}>
          <Input
            id="birthplace"
            value={data.birthplace}
            onChange={set('birthplace')}
            placeholder="City / Municipality"
            disabled={disabled}
          />
        </Field>
      </div>

      {/* Civil status / Nationality / Religion */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Civil Status" required error={errors.civilStatus}>
          <Select
            id="civilStatus"
            value={data.civilStatus}
            onChange={set('civilStatus')}
            options={CIVIL_STATUS_OPTIONS}
            placeholder="Select status"
            required
            disabled={disabled}
          />
        </Field>
        <Field label="Nationality" error={errors.nationality}>
          <Input
            id="nationality"
            value={data.nationality}
            onChange={set('nationality')}
            placeholder="Filipino"
            disabled={disabled}
          />
        </Field>
        <Field label="Religion" error={errors.religion}>
          <Input
            id="religion"
            value={data.religion}
            onChange={set('religion')}
            placeholder="Roman Catholic"
            disabled={disabled}
          />
        </Field>
      </div>

      {/* Occupation / Monthly Income */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Occupation" error={errors.occupation}>
          <Input
            id="occupation"
            value={data.occupation}
            onChange={set('occupation')}
            placeholder="Teacher, Driver…"
            disabled={disabled}
          />
        </Field>
        <Field label="Monthly Income (₱)" error={errors.monthlyIncome}>
          <Input
            id="monthlyIncome"
            type="number"
            value={data.monthlyIncome}
            onChange={set('monthlyIncome')}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={disabled}
          />
        </Field>
      </div>

      {/* Educational attainment / Blood type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Educational Attainment" error={errors.educationalAttainment}>
          <Select
            id="educationalAttainment"
            value={data.educationalAttainment}
            onChange={set('educationalAttainment')}
            options={EDUCATION_OPTIONS}
            placeholder="Select attainment"
            disabled={disabled}
          />
        </Field>
        <Field label="Blood Type" error={errors.bloodType}>
          <Select
            id="bloodType"
            value={data.bloodType}
            onChange={set('bloodType')}
            options={BLOOD_TYPE_OPTIONS}
            placeholder="Select blood type"
            disabled={disabled}
          />
        </Field>
      </div>

      {/* Contact */}
      <h3 className="text-base font-semibold text-gray-800 border-b pb-2 pt-2">Contact Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Contact Number" error={errors.contactNumber}>
          <Input
            id="contactNumber"
            value={data.contactNumber}
            onChange={set('contactNumber')}
            placeholder="09XXXXXXXXX"
            disabled={disabled}
          />
        </Field>
        {/* Field name: `email` — matches schema column */}
        <Field label="Email Address" error={errors.email}>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={set('email')}
            placeholder="juan@example.com"
            disabled={disabled}
          />
        </Field>
      </div>

      {/* Special categories */}
      <h3 className="text-base font-semibold text-gray-800 border-b pb-2 pt-2">Special Categories</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* is_voter */}
        <Checkbox
          id="isVoter"
          checked={data.isVoter}
          onChange={set('isVoter')}
          label="Registered Voter"
        />
        {data.isVoter && (
          <Field label="Voter ID No." error={errors.voterIdNo}>
            <Input
              id="voterIdNo"
              value={data.voterIdNo}
              onChange={set('voterIdNo')}
              placeholder="Voter ID number"
              disabled={disabled}
            />
          </Field>
        )}
        {/* is_pwd */}
        <Checkbox
          id="isPwd"
          checked={data.isPwd}
          onChange={set('isPwd')}
          label="Person with Disability (PWD)"
        />
        {data.isPwd && (
          <Field label="PWD ID No." error={errors.pwdIdNo}>
            <Input
              id="pwdIdNo"
              value={data.pwdIdNo}
              onChange={set('pwdIdNo')}
              placeholder="PWD ID number"
              disabled={disabled}
            />
          </Field>
        )}
        <Checkbox
          id="isSoloParent"
          checked={data.isSoloParent}
          onChange={set('isSoloParent')}
          label="Solo Parent"
        />
        <Checkbox
          id="is4psBeneficiary"
          checked={data.is4psBeneficiary}
          onChange={set('is4psBeneficiary')}
          label="4Ps Beneficiary"
        />
        <Checkbox
          id="isSeniorCitizen"
          checked={data.isSeniorCitizen}
          onChange={set('isSeniorCitizen')}
          label="Senior Citizen (60+)"
        />
      </div>

      {/* Status */}
      <h3 className="text-base font-semibold text-gray-800 border-b pb-2 pt-2">Record Status</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* resident_status_enum: Active | Inactive | Transferred | Deceased */}
        <Field label="Status" required error={errors.status}>
          <Select
            id="status"
            value={data.status}
            onChange={set('status')}
            options={STATUS_OPTIONS}
            required
            disabled={disabled}
          />
        </Field>
      </div>
    </div>
  );
}