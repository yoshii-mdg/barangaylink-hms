import { FiCalendar, FiUser, FiMapPin, FiPhone, FiMail, FiCamera } from 'react-icons/fi';
import { useRef } from 'react';
import EIdProfile from './EIdProfile';

const inputWrapperClass =
  'flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white';
const iconWrapperClass =
  'bg-gray-100 px-4 py-3 flex items-center justify-center border-r border-gray-300 text-[#005F02]';
const inputClass =
  'flex-1 px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none';

const FormField = ({ label, children }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
    )}
    {children}
  </div>
);

export default function EidForms({ value = {}, onChange, fullName = '' }) {
  const fileInputRef = useRef(null);

  const update = (field, val) => onChange?.({ ...value, [field]: val });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be under 2MB');
        return;
      }

      // Check file type
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        alert('Only PNG and JPG files are supported');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        update('photo', event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Section: Profile Left, ID/Names Right */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        {/* Left: Photo section */}
        <div className="flex flex-col items-center sm:m-5 shrink-0 sm:w-40">
          <div className="relative">
            <EIdProfile
              name={fullName}
              size={150}
              photoUrl={value.photo}
              className="rounded-lg"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-[#005F02] hover:bg-[#004A01] text-white p-2 rounded-lg shadow-md transition-colors"
              title="Upload photo"
            >
              <FiCamera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-xs text-gray-400 text-center">
            We support PNGs and JPGs under 2MB
          </p>
        </div>

        {/* Right: ID, Names section */}
        <div className="flex-1">
          <div className="space-y-4">
            {/* ID Number - Full width */}
            <FormField label="ID Number:">
              <div className={inputWrapperClass}>
                <input
                  type="text"
                  value={value.idNumber ?? ''}
                  onChange={(e) => update('idNumber', e.target.value)}
                  placeholder="e.g. 1234-123-12"
                  className={inputClass}
                />
              </div>
            </FormField>

            {/* Last Name and First Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Last Name:">
                <div className={inputWrapperClass}>
                  <input
                    type="text"
                    value={value.lastName ?? ''}
                    onChange={(e) => update('lastName', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </FormField>

              <FormField label="First Name:">
                <div className={inputWrapperClass}>
                  <input
                    type="text"
                    value={value.firstName ?? ''}
                    onChange={(e) => update('firstName', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </FormField>
            </div>

            {/* Middle Name and Suffix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Middle Name:">
                <div className={inputWrapperClass}>
                  <input
                    type="text"
                    value={value.middleName ?? ''}
                    onChange={(e) => update('middleName', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </FormField>

              <FormField label="Suffix:">
                <div className={inputWrapperClass}>
                  <input
                    type="text"
                    value={value.suffix ?? ''}
                    onChange={(e) => update('suffix', e.target.value)}
                    placeholder="Jr., Sr."
                    className={inputClass}
                  />
                </div>
              </FormField>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Birthdate, Gender, Address, Contact, Email */}
      <div className="space-y-4">
        {/* Birthdate and Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Birthdate:">
            <div className={inputWrapperClass}>
              <div className={iconWrapperClass}>
                <FiCalendar className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={value.birthdate ?? ''}
                onChange={(e) => update('birthdate', e.target.value)}
                placeholder="mm/dd/yy"
                className={inputClass}
              />
            </div>
          </FormField>

          <FormField label="Gender:">
            <div className={inputWrapperClass}>
              <div className={iconWrapperClass}>
                <FiUser className="w-5 h-5" />
              </div>
              <select
                value={value.gender ?? ''}
                onChange={(e) => update('gender', e.target.value)}
                className={inputClass}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </FormField>
        </div>

        {/* Address - Full width */}
        <FormField label="Address:">
          <div className={inputWrapperClass}>
            <div className={iconWrapperClass}>
              <FiMapPin className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={value.address ?? ''}
              onChange={(e) => update('address', e.target.value)}
              placeholder="e.g. #81 St. Brgy. San Bartolome"
              className={inputClass}
            />
          </div>
        </FormField>

        {/* Contact Number - Full width */}
        <FormField label="Contact Number:">
          <div className={inputWrapperClass}>
            <div className={iconWrapperClass}>
              <FiPhone className="w-5 h-5" />
            </div>
            <input
              type="tel"
              value={value.contactNumber ?? ''}
              onChange={(e) => update('contactNumber', e.target.value)}
              placeholder="e.g. 09XX XXX XXXX"
              className={inputClass}
            />
          </div>
        </FormField>

        {/* Email Address - Full width */}
        <FormField label="Email Address:">
          <div className={inputWrapperClass}>
            <div className={iconWrapperClass}>
              <FiMail className="w-5 h-5" />
            </div>
            <input
              type="email"
              value={value.emailAddress ?? ''}
              onChange={(e) => update('emailAddress', e.target.value)}
              placeholder="e.g. email@example.com"
              className={inputClass}
            />
          </div>
        </FormField>
      </div>
    </div>
  );
}
