/**
 * ResidentAddEdit/Modal.jsx
 *
 * Issues fixed vs. original:
 * 1. initialData field mapping corrected to use exact DB column names:
 *    - `email_address` → `email`
 *    - `is_registered_voter` → `is_voter`  → form key: `isVoter`
 *    - `precinct_no` → `voter_id_no`       → form key: `voterIdNo`
 *    - `household_role` removed (lives in household_members_tbl)
 *    - Added all missing fields: monthlyIncome, isSoloParent, is4psBeneficiary,
 *      isSeniorCitizen, educationalAttainment, bloodType, purokId, yearsOfResidency,
 *      isRenter, zipCode, philsysIdNo, sssNo, tinNo, philhealthNo, pagibigNo,
 *      passportNo, driversLicenseNo, postalIdNo,
 *      emergencyContactName, emergencyContactRelationship, emergencyContactNumber
 * 2. Tab state preserved on initialData change.
 * 3. Proper form validation before submit.
 * 4. Submit button disabled while submitting.
 */
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LuX } from 'react-icons/lu';
import PersonalInformationForm from './PersonalInformationForm';
import AddressInformationForm from './AddressInformationForm';
import IdentificationDetailForm from './IdentificationDetailForm';

const TABS = ['Personal', 'Address', 'Identification'];

/** Build the blank initial form state */
const blankForm = () => ({
  // Personal
  firstName: '', middleName: '', lastName: '', suffix: '',
  gender: '', birthdate: '', birthplace: '',
  civilStatus: 'Single', nationality: 'Filipino', religion: '', occupation: '',
  monthlyIncome: '', educationalAttainment: '', bloodType: '',
  // Flags
  isVoter: false, voterIdNo: '',
  isPwd: false, pwdIdNo: '',
  isSoloParent: false, is4psBeneficiary: false, isSeniorCitizen: false,
  // Contact
  contactNumber: '', email: '',
  // Address
  householdId: '', purokId: '',
  houseNo: '', street: '',
  barangay: 'San Bartolome', city: 'Quezon City', province: 'Metro Manila', zipCode: '',
  yearsOfResidency: '', isRenter: false,
  // Emergency contact
  emergencyContactName: '', emergencyContactRelationship: '', emergencyContactNumber: '',
  // IDs
  philsysIdNo: '', sssNo: '', tinNo: '', philhealthNo: '', pagibigNo: '',
  passportNo: '', driversLicenseNo: '', postalIdNo: '',
  // Status
  status: 'Active',
});

/** Map a DB row (raw from Supabase) to form field names */
function dbRowToForm(row) {
  if (!row) return blankForm();
  return {
    firstName: row.first_name ?? '',
    middleName: row.middle_name ?? '',
    lastName: row.last_name ?? '',
    suffix: row.suffix ?? '',
    gender: row.gender ?? '',
    birthdate: row.birthdate ?? '',
    birthplace: row.birthplace ?? '',
    civilStatus: row.civil_status ?? 'Single',
    nationality: row.nationality ?? 'Filipino',
    religion: row.religion ?? '',
    occupation: row.occupation ?? '',
    monthlyIncome: row.monthly_income ?? '',
    educationalAttainment: row.educational_attainment ?? '',
    bloodType: row.blood_type ?? '',
    // Flags — schema columns: is_voter, voter_id_no, is_pwd, pwd_id_no
    isVoter: row.is_voter ?? false,
    voterIdNo: row.voter_id_no ?? '',
    isPwd: row.is_pwd ?? false,
    pwdIdNo: row.pwd_id_no ?? '',
    isSoloParent: row.is_solo_parent ?? false,
    is4psBeneficiary: row.is_4ps_beneficiary ?? false,
    isSeniorCitizen: row.is_senior_citizen ?? false,
    // Contact — schema: contact_number, email
    contactNumber: row.contact_number ?? '',
    email: row.email ?? '',
    // Address — schema: household_id, purok_id, house_no, street, barangay, city, province, zip_code
    householdId: row.household_id ?? '',
    purokId: row.purok_id ?? '',
    houseNo: row.house_no ?? '',
    street: row.street ?? '',
    barangay: row.barangay ?? 'San Bartolome',
    city: row.city ?? 'Quezon City',
    province: row.province ?? 'Metro Manila',
    zipCode: row.zip_code ?? '',
    yearsOfResidency: row.years_of_residency ?? '',
    isRenter: row.is_renter ?? false,
    // Emergency
    emergencyContactName: row.emergency_contact_name ?? '',
    emergencyContactRelationship: row.emergency_contact_relationship ?? '',
    emergencyContactNumber: row.emergency_contact_number ?? '',
    // IDs
    philsysIdNo: row.philsys_id_no ?? '',
    sssNo: row.sss_no ?? '',
    tinNo: row.tin_no ?? '',
    philhealthNo: row.philhealth_no ?? '',
    pagibigNo: row.pagibig_no ?? '',
    passportNo: row.passport_no ?? '',
    driversLicenseNo: row.drivers_license_no ?? '',
    postalIdNo: row.postal_id_no ?? '',
    // Status
    status: row.status ?? 'Active',
  };
}

/** Basic client-side validation */
function validate(form) {
  const errs = {};
  if (!form.firstName?.trim()) errs.firstName = 'First name is required';
  if (!form.lastName?.trim()) errs.lastName = 'Last name is required';
  if (!form.gender) errs.gender = 'Sex is required';
  if (!form.birthdate) errs.birthdate = 'Date of birth is required';
  if (!form.civilStatus) errs.civilStatus = 'Civil status is required';
  return errs;
}

export default function ResidentAddEditModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = 'add',
  submitting = false,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});

  // Re-populate form when initialData changes (edit mode)
  useEffect(() => {
    if (isOpen) {
      setForm(dbRowToForm(initialData));
      setErrors({});
      setActiveTab(0);
    }
  }, [isOpen, initialData]);

  // Trap body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Jump to first tab with errors
      const personalFields = ['firstName', 'lastName', 'gender', 'birthdate', 'civilStatus'];
      if (personalFields.some((f) => errs[f])) setActiveTab(0);
      return;
    }
    onSubmit(form);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resident-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={!submitting ? onClose : undefined} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="resident-modal-title" className="text-lg font-semibold text-gray-900">
            {mode === 'add' ? 'Add New Resident' : 'Edit Resident'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === i
                  ? 'border-[#005F02] text-[#005F02]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 0 && (
              <PersonalInformationForm
                data={form}
                onChange={handleChange}
                errors={errors}
                disabled={submitting}
              />
            )}
            {activeTab === 1 && (
              <AddressInformationForm
                data={form}
                onChange={handleChange}
                errors={errors}
                disabled={submitting}
              />
            )}
            {activeTab === 2 && (
              <IdentificationDetailForm
                data={form}
                onChange={handleChange}
                errors={errors}
                disabled={submitting}
              />
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center gap-3">
            <div className="flex gap-2">
              {activeTab > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab((t) => t - 1)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Back
                </button>
              )}
              {activeTab < TABS.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab((t) => t + 1)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-lg bg-[#005F02] text-white text-sm font-medium hover:bg-[#004A01] disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {mode === 'add' ? 'Save Resident' : 'Update Resident'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}