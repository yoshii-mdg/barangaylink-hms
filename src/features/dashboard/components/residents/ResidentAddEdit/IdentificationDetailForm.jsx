/**
 * IdentificationDetailForm.jsx
 *
 * Issues fixed vs. original:
 * 1. All field names aligned to schema column names:
 *    - `philsysId` → `philsysIdNo`   (schema: philsys_id_no)
 *    - `sss` → `sssNo`               (schema: sss_no)
 *    - `tin` → `tinNo`               (schema: tin_no)
 *    - `philhealth` → `philhealthNo` (schema: philhealth_no)
 *    - `pagibig` → `pagibigNo`       (schema: pagibig_no)
 *    - `passport` → `passportNo`     (schema: passport_no)
 *    - `driversLicense` → `driversLicenseNo` (schema: drivers_license_no)
 *    - `postalId` → `postalIdNo`     (schema: postal_id_no)
 */

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
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

const ID_FIELDS = [
  { field: 'philsysIdNo',      label: 'PhilSys ID No.',        placeholder: 'PSN-XXXX-XXXX-XXXX' },
  { field: 'sssNo',            label: 'SSS No.',               placeholder: 'XX-XXXXXXX-X' },
  { field: 'tinNo',            label: 'TIN No.',               placeholder: 'XXX-XXX-XXX' },
  { field: 'philhealthNo',     label: 'PhilHealth No.',        placeholder: 'XX-XXXXXXXXX-X' },
  { field: 'pagibigNo',        label: 'Pag-IBIG / HDMF No.',  placeholder: 'XXXX-XXXX-XXXX' },
  { field: 'passportNo',       label: 'Passport No.',          placeholder: 'AXXXXXXX' },
  { field: 'driversLicenseNo', label: "Driver's License No.", placeholder: 'AXXXX-XXXXXX-XX' },
  { field: 'postalIdNo',       label: 'Postal ID No.',         placeholder: 'XXXX-XXXX-XXXX' },
];

/**
 * @param {object} props
 * @param {object} props.data       - form values keyed by field names above
 * @param {function} props.onChange - (field, value) => void
 * @param {object} props.errors
 * @param {boolean} props.disabled
 */
export default function IdentificationDetailForm({ data = {}, onChange, errors = {}, disabled }) {
  const set = (field) => (e) => onChange(field, e.target.value);

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-gray-800 border-b pb-2">
        Identification Details
      </h3>
      <p className="text-sm text-gray-500">
        All identification fields are optional. Provide only what the resident has.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ID_FIELDS.map(({ field, label, placeholder }) => (
          <Field key={field} label={label} error={errors[field]}>
            <Input
              id={field}
              value={data[field]}
              onChange={set(field)}
              placeholder={placeholder}
              disabled={disabled}
            />
          </Field>
        ))}
      </div>
    </div>
  );
}