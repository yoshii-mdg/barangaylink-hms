import { useState, useRef, useEffect, useMemo } from 'react';
import { IoMdAdd } from 'react-icons/io';
import EidForms from '../EidForms';

const INITIAL_FORM = {
  idNumber: '',
  lastName: '',
  firstName: '',
  middleName: '',
  suffix: '',
  birthdate: '',
  gender: '',
  address: '',
  contactNumber: '',
  emailAddress: '',
  photo: null,
};

/**
 * Very naively splits "First Middle Last" → parts.
 * Real usage will pull structured fields from the DB.
 */
function parseNameToFormData(name) {
  const parts = (name ?? '').split(' ').filter(Boolean);
  let lastName = '', firstName = '', middleName = '', suffix = '';

  if (parts.length >= 2) {
    lastName   = parts[parts.length - 1];
    firstName  = parts[0];
    middleName = parts.slice(1, -1).join(' ');
  } else if (parts.length === 1) {
    firstName = parts[0];
  }

  // Detect suffix at end of middleName
  const suffixMatch = middleName.match(/(Jr\.|Sr\.|II|III|IV)$/);
  if (suffixMatch) {
    suffix     = suffixMatch[1];
    middleName = middleName.replace(/\s+(Jr\.|Sr\.|II|III|IV)$/, '').trim();
  }

  return { lastName, firstName, middleName, suffix };
}

export default function EidAddEditModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = 'create',
}) {
  const getInitialFormData = useMemo(() => {
    if (initialData && mode === 'edit') {
      return {
        ...INITIAL_FORM,
        idNumber:      initialData.idNumber      ?? '',
        address:       initialData.address       ?? '',
        birthdate:     initialData.birthdate     ?? '',
        gender:        initialData.gender        ?? '',
        contactNumber: initialData.contactNumber ?? '',
        emailAddress:  initialData.emailAddress  ?? '',
        photo:         initialData.photo         ?? null,
        ...parseNameToFormData(initialData.name),
      };
    }
    return INITIAL_FORM;
  }, [initialData, mode]);

  const [formData, setFormData] = useState(getInitialFormData);
  const panelRef = useRef(null);

  useEffect(() => {
    setFormData(getInitialFormData);
  }, [getInitialFormData]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const onBackdropClick = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) onClose?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullName = [formData.firstName, formData.middleName, formData.lastName, formData.suffix]
      .filter(Boolean)
      .join(' ');
    onSubmit?.({
      ...formData,
      name: fullName,
    });
  };

  const fullName = [formData.firstName, formData.middleName, formData.lastName]
    .filter(Boolean)
    .join(' ');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="eid-modal-title"
      onMouseDown={onBackdropClick}
    >
      <div
        ref={panelRef}
        className="relative bg-white w-full max-w-3xl rounded-xl shadow-xl flex flex-col max-h-[95vh] mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {mode === 'create' && (
              <div className="w-7 h-7 rounded-full bg-[#005F02] flex items-center justify-center">
                <IoMdAdd className="w-5 h-5 text-white" />
              </div>
            )}
            <h2 id="eid-modal-title" className="text-xl font-semibold text-gray-900">
              {mode === 'edit' ? 'Edit eID' : 'Create New eID'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <EidForms value={formData} onChange={setFormData} fullName={fullName} />
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 bg-[#F1F7F2] border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#005F02] text-white hover:bg-[#004A01]"
            >
              {mode === 'edit' ? 'Save Changes' : 'Add New eID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}