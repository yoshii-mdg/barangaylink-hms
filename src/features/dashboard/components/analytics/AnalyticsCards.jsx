import { PiUsersThree } from 'react-icons/pi';
import { FiHome } from 'react-icons/fi';
import { FaRegAddressCard } from 'react-icons/fa';
import { IoStatsChartOutline } from 'react-icons/io5';

const getCardData = (filters) => {
  const year = parseInt(filters?.year || new Date().getFullYear(), 10);
  const baseResidents = 3245;
  const baseHouseholds = 812;
  const baseIds = 2980;
  
  // Adjust values based on year (mock calculation)
  const yearOffset = year - new Date().getFullYear();
  const residents = Math.round(baseResidents + yearOffset * 120);
  const households = Math.round(baseHouseholds + yearOffset * 30);
  const ids = Math.round(baseIds + yearOffset * 100);
  const growthRate = yearOffset > 0 ? `+${(2.3 + yearOffset * 0.2).toFixed(1)}%` : `+${Math.max(0, 2.3 + yearOffset * 0.2).toFixed(1)}%`;

  return [
    {
      label: 'Total Residents',
      value: residents.toLocaleString(),
      icon: PiUsersThree,
    },
    {
      label: 'Total Households',
      value: households.toLocaleString(),
      icon: FiHome,
    },
    {
      label: 'Total Brgy IDs Issued',
      value: ids.toLocaleString(),
      icon: FaRegAddressCard,
    },
    {
      label: 'Population Growth Rate',
      value: growthRate,
      icon: IoStatsChartOutline,
    },
  ];
};

export default function AnalyticsCards({ filters }) {
  const cards = getCardData(filters);
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
