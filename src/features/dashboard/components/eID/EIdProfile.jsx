import { FaUser } from 'react-icons/fa';

export default function EIdProfile({
  className = '',
  size = 72,
  showInitials = false,
  name,
  photoUrl = null,
}) {
  const initials = name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '';

  return (
    <div
      className={`flex items-center justify-center shrink-0 rounded-md overflow-hidden bg-gray-200 border border-gray-300 ${className}`}
      style={{ width: size, height: size }}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : showInitials && initials ? (
        <span className="text-sm font-semibold text-gray-600">{initials}</span>
      ) : (
        <FaUser className="w-1/2 h-1/2 text-gray-400" />
      )}
    </div>
  );
}
