import { FaUser } from 'react-icons/fa';

export default function EIdProfile({
  className = '',
  size = 72,
  photoUrl = null,
}) {
  return (
    <div
      className={`flex items-center justify-center shrink-0 overflow-hidden bg-gray-200 border border-gray-300 rounded-md ${className}`}
      style={{ width: size, height: size }}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : (
        <FaUser className="w-1/2 h-1/2 text-gray-400" />
      )}
    </div>
  );
}
