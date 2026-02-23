import { NavLink, useLocation } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { PiUsersThree, PiUsers } from "react-icons/pi";
import { BsQrCode } from 'react-icons/bs';
import { FaRegAddressCard } from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { LuUsers } from "react-icons/lu";
import LogoDashboard from '../../../assets/images/logo-dashboard.svg';
import { useAuth } from '../../../core/AuthContext';
import { ROLES } from '../../../core/AuthContext';

// Build nav sections based on role
function getNavSections(role) {
  const prefix = role === ROLES.SUPERADMIN
    ? '/admin'
    : role === ROLES.STAFF
      ? '/staff'
      : '/resident';

  const general = [
    { to: `${prefix}/dashboard`, label: 'Dashboard', icon: MdOutlineDashboard },
  ];

  if (role !== ROLES.RESIDENT) {
    general.push({ to: `${prefix}/analytics`, label: 'Analytics', icon: TbBrandGoogleAnalytics });
  }

  const management = [];

  if (role === ROLES.RESIDENT) {
    management.push({ to: `${prefix}/eid`, label: 'My eID', icon: FaRegAddressCard });
    management.push({ to: `${prefix}/profile`, label: 'My Profile', icon: PiUsers });
  } else {
    management.push({ to: `${prefix}/residents`, label: 'Residents', icon: PiUsersThree });
    management.push({ to: `${prefix}/households`, label: 'Households', icon: FiHome });
    management.push({ to: `${prefix}/eid`, label: 'eID', icon: FaRegAddressCard });
    management.push({ to: `${prefix}/verification`, label: 'Verification', icon: BsQrCode });
    management.push({ to: `${prefix}/profile`, label: 'Profile', icon: PiUsers });
    if (role === ROLES.SUPERADMIN) {
      management.push({ to: `${prefix}/users`, label: 'User Management', icon: LuUsers });
    }
  }

  return [
    { title: 'General', items: general },
    { title: 'Management', items: management },
  ];
}

export default function DashboardSidebar() {
  const { userRole } = useAuth();
  const navSections = getNavSections(userRole);

  return (
    <aside className="w-68 bg-white border-r border-gray-200 min-h-screen flex-shrink-0">
      <div className="px-6 py-6">
        <img src={LogoDashboard} alt="Logo" className='w-full' />
      </div>

      <hr className='border-gray-400 opacity-20 mb-5' />

      <nav className="px-4 pb-6">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="px-3 text-[14px] font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </p>

            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? 'bg-[#005F02] text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}