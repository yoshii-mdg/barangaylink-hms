import { useState, useRef, useEffect, useMemo } from 'react';
import { PiUserPlus } from 'react-icons/pi';
import PersonalInformationForm from './PersonalInformationForm';
import AddressInformationForm from './AddressInformationForm';
import IdentificationDetailForm from './IdentificationDetailForm';

const initialFormData = {
  personal: {},
  address: {},
  identification: {},
};

export default function ResidentAddEdit({ isOpen, onClose, onSubmit, initialData = null, mode = 'add' }) {
  const getInitialFormData = useMemo(() => {
    // Stored as "LastName FirstName MiddleName Suffix"
    if (initialData && mode === 'edit') {
      const nameParts = initialData.name?.split(' ') || [];
      let lastName = '', firstName = '', middleName = '', suffix = '';

      if (nameParts.length >= 2) {
        lastName = nameParts[nameParts.length - 1];
        firstName = nameParts[0];
        middleName = nameParts.slice(1, -1).join(' ');
      } else if (nameParts.length === 1) {
        firstName = nameParts[0];
      }

      // Check for suffix in middleName
      const suffixMatch = middleName.match(/(Jr\.|Sr\.|II|III|IV)$/);
      if (suffixMatch) {
        suffix = suffixMatch[1];
        middleName = middleName.replace(/\s+(Jr\.|Sr\.|II|III|IV)$/, '');
      }

      // Stored as "HouseNo, Street, Purok, Barangay"
      const addressParts = initialData.address?.split(', ') || [];
      const houseNo = addressParts[0] || '';
      const street = addressParts[1] || '';
      const purok = addressParts[2] || '';
      const barangay = addressParts[3] || '';

      return {
        personal: {
          lastName,
          firstName,
          middleName,
          suffix,
          birthdate: initialData.birthdate || '',
          gender: initialData.gender || '',
          contactNumber: initialData.contactNo || '',
        },
        address: {
          houseNo,
          street,
          purok,
          barangay,
        },
        identification: {
          idNumber: initialData.residentNo || '',
          status: initialData.status || 'Active',
        },
      };
    }
    return initialFormData;
  }, [initialData, mode]);

  // We want to reset form data whenever initialData changes (e.g. when opening edit modal for a different resident)
  const [formData, setFormData] = useState(getInitialFormData);
  const panelRef = useRef(null);

  useEffect(() => {
    setFormData(getInitialFormData);
  }, [getInitialFormData]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const onBackdropClick = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) onClose?.();
  };

  const handleClear = () => {
    setFormData(initialFormData);
  };

  // When submitting, we want to combine the form data into the expected resident format
  const handleSubmit = (e) => {
    e.preventDefault();
    const resident = {
      lastName: formData.personal.lastName,
      firstName: formData.personal.firstName,
      middleName: formData.personal.middleName,
      suffix: formData.personal.suffix,
      birthdate: formData.personal.birthdate,
      gender: formData.personal.gender,
      contactNumber: formData.personal.contactNumber,
      houseNo: formData.address.houseNo,
      street: formData.address.street,
      purok: formData.address.purok,
      barangay: formData.address.barangay,
      idNumber: formData.identification.idNumber,
      status: formData.identification.status ?? 'Active',
    };
    onSubmit?.(resident);
    setFormData(initialFormData);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-resident-title"
      onMouseDown={onBackdropClick}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={panelRef}
        className="relative bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center bg-[#F1F7F2] gap-3 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg text-[#005F02]">
            <PiUserPlus className="w-6 h-6" />
          </div>
          <h2 id="add-resident-title" className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit Resident' : 'Add New Resident'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Form body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            <PersonalInformationForm
              value={formData.personal}
              onChange={(v) => setFormData((d) => ({ ...d, personal: v }))}
            />
            <AddressInformationForm
              value={formData.address}
              onChange={(v) => setFormData((d) => ({ ...d, address: v }))}
            />
            <IdentificationDetailForm
              value={formData.identification}
              onChange={(v) => setFormData((d) => ({ ...d, identification: v }))}
            />
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 bg-[#F1F7F2] px-6 py-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {mode === 'add' && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#005F02] text-white hover:bg-[#004A01]"
            >
              {mode === 'edit' ? 'Update Resident' : 'Add New Resident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
