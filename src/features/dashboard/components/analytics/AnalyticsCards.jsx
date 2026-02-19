import { PiUsersThree } from 'react-icons/pi';
import { FiHome } from 'react-icons/fi';
import { FaRegAddressCard } from 'react-icons/fa';
import { IoStatsChartOutline } from 'react-icons/io5';

const cards = [
  {
    label: 'Total Residents',
    value: '3,245',
    icon: PiUsersThree,
  },
  {
    label: 'Total Households',
    value: '812',
    icon: FiHome,
  },
  {
    label: 'Total Brgy IDs Issued',
    value: '2,980',
    icon: FaRegAddressCard,
  },
  {
    label: 'Population Growth Rate',
    value: '+2.3%',
    icon: IoStatsChartOutline,
  },
];

export default function AnalyticsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center text-[#005F02] shrink-0">
                <Icon className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-base font-medium text-gray-600">{card.label}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{card.value}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
