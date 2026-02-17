import { NavLink } from 'react-router-dom';
import { Logo } from '../../../shared';
import { FiHome,} from 'react-icons/fi';
import { PiUsersThree, PiUsers } from "react-icons/pi";
import { BsQrCode,} from 'react-icons/bs'
import { FaRegAddressCard } from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import LogoDashboard from '../../../assets/images/logo-dashboard.svg'


const navSections = [
  {
    title: 'General',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: MdOutlineDashboard },
      { to: '/analytics', label: 'Analytics', icon: TbBrandGoogleAnalytics  },
    ],
  },
  {
    title: 'Management',
    items: [
      { to: '/residents', label: 'Residents', icon: PiUsersThree },
      { to: '/households', label: 'Households', icon: FiHome },
      { to: '/eid', label: 'eID', icon: FaRegAddressCard },
      { to: '/verification', label: 'Verification', icon: BsQrCode },
      { to: '/profile', label: 'User', icon: PiUsers }
    ],
  },
];

export default function DashboardSidebar() {
  return (
    <aside className="w-68 bg-white border-r border-gray-200 min-h-screen">
      <div className="px-6 py-6">
      <img src={LogoDashboard} alt="Logo" className='w-full' />
      </div>

      <hr className='border-gray-400 opacity-20 mb-5'></hr>

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
                      [
                        'flex items-center gap-3 px-2 py-2 rounded-lg text-lg transition-colors',
                        isActive
                          ? 'bg-[#005F02]/15 text-[#005F02] font-semibold'
                          : 'text-gray-700 hover:bg-gray-100',
                      ].join(' ')
                    }
                    end={item.to === '/dashboard'}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{item.label}</span>
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

