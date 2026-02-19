export default function ResidentTable({ residents = [], onSelectResident }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base">
        <thead>
          <tr className="text-left text-sm bg-[#E8F5E9] text-gray-700 border-b border-gray-200">
            <th className="py-3 px-4 font-semibold">Resident No.</th>
            <th className="py-3 px-4 font-semibold">Name</th>
            <th className="py-3 px-4 font-semibold">Address</th>
            <th className="py-3 px-4 font-semibold">Gender</th>
            <th className="py-3 px-4 font-semibold">Birthdate</th>
            <th className="py-3 px-4 font-semibold">Contact No.</th>
            <th className="py-3 px-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {residents.map((resident, idx) => (
            <tr
              key={resident.id ?? idx}
              className={`border-b border-gray-100 last:border-b-0 ${
                idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'
              } hover:bg-gray-50/80 cursor-pointer transition-colors`}
              onClick={() => onSelectResident?.(resident)}
            >
              <td className="py-3 px-4 text-gray-800">{resident.residentNo}</td>
              <td className="py-3 px-4 text-gray-800">{resident.name}</td>
              <td className="py-3 px-4 text-gray-800">{resident.address}</td>
              <td className="py-3 px-4 text-gray-800">{resident.gender}</td>
              <td className="py-3 px-4 text-gray-800">{resident.birthdate}</td>
              <td className="py-3 px-4 text-gray-800">{resident.contactNo}</td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    resident.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {resident.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
