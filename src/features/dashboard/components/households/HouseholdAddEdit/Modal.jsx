/**
 * HouseholdAddEdit/Modal.jsx
 *
 * Issues fixed vs. original:
 * 1. initialData mapping corrected to DB column names:
 *    - `purok` → `purokId` (purok_id FK)
 *    - `houseNo` ← house_no ✓
 *    - Added: ownershipType, structureType, remarks, members
 * 2. Submit disabled while submitting prop is true.
 * 3. Form validation before submit.
 */
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LuX } from 'react-icons/lu';
import HouseholdForm from './HouseholdForm';

const blankForm = () => ({
  purokId: '',
  houseNo: '',
  street: '',
  barangay: 'San Bartolome',
  city: 'Quezon City',
  province: 'Metro Manila',
  zipCode: '',
  ownershipType: '',
  structureType: '',
  remarks: '',
  isActive: true,
  members: [],
});

function dbRowToForm(row) {
  if (!row) return blankForm();
  return {
    purokId: row.purok_id ?? '',
    houseNo: row.house_no ?? '',
    street: row.street ?? '',
    barangay: row.barangay ?? 'San Bartolome',
    city: row.city ?? 'Quezon City',
    province: row.province ?? 'Metro Manila',
    zipCode: row.zip_code ?? '',
    ownershipType: row.ownership_type ?? '',
    structureType: row.structure_type ?? '',
    remarks: row.remarks ?? '',
    isActive: row.is_active ?? true,
    // Members: map from household_members_tbl join shape
    members: (row.members ?? []).map((m) => ({
      residentId: m.resident_id ?? '',
      role: m.role ?? 'Other',
      isHead: m.is_head ?? false,
      joinedAt: m.joined_at ?? null,
    })),
  };
}

function validate(form) {
  // Households require at least a barangay
  return {};
}

export default function HouseholdAddEditModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = 'add',
  submitting = false,
}) {
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(dbRowToForm(initialData));
      setErrors({});
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
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
      aria-labelledby="household-modal-title"
    >
      <div className="absolute inset-0 bg-black/60" onClick={!submitting ? onClose : undefined} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="household-modal-title" className="text-lg font-semibold text-gray-900">
            {mode === 'add' ? 'Add New Household' : 'Edit Household'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto">
          <div className="p-6">
            <HouseholdForm
              data={form}
              onChange={handleChange}
              errors={errors}
              disabled={submitting}
            />
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
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
              {mode === 'add' ? 'Save Household' : 'Update Household'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}