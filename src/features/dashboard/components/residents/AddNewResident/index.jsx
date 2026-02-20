import { useState, useRef, useEffect } from 'react';
import { PiUserPlus } from 'react-icons/pi';
import PersonalInformationForm from './PersonalInformationForm';
import AddressInformationForm from './AddressInformationForm';
import IdentificationDetailForm from './IdentificationDetailForm';

const initialFormData = {
  personal: {},
  address: {},
  identification: {},
};

export default function AddNewResident({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState(initialFormData);
  const panelRef = useRef(null);

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
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg text-[#005F02]">
            <PiUserPlus className="w-6 h-6" />
          </div>
          <h2 id="add-resident-title" className="text-xl font-semibold text-gray-900">
            Add New Resident
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
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#005F02] text-white hover:bg-[#004A01]"
            >
              Add New Resident
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
