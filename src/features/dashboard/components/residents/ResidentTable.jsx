const STATUS_STYLES = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-500',
  Deceased: 'bg-red-100 text-red-700',
  Transferred: 'bg-yellow-100 text-yellow-700',
};

export default function ResidentTable({ residents = [], onSelectResident }) {
  if (residents.length === 0) {
    return (
      <div className="text-center py-14 text-gray-400 text-sm">
        No residents found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs bg-gray-50 text-gray-500 border-b border-gray-200 uppercase tracking-wide">
            <th className="py-3 px-3 font-semibold">Resident No.</th>
            <th className="py-3 px-3 font-semibold">Name</th>
            <th className="py-3 px-3 font-semibold">Gender</th>
            <th className="py-3 px-3 font-semibold">Birthdate</th>
            <th className="py-3 px-3 font-semibold">Contact No.</th>
            <th className="py-3 px-3 font-semibold">Status</th>
            <th className="py-3 px-3 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {residents.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-3 text-gray-600 font-mono text-xs">{r.residentNo}</td>
              <td className="py-3 px-3 font-medium text-gray-900">{r.name}</td>
              <td className="py-3 px-3 text-gray-700">{r.gender}</td>
              <td className="py-3 px-3 text-gray-700">{r.birthdate || '—'}</td>
              <td className="py-3 px-3 text-gray-700 font-mono text-xs">{r.contactNo}</td>
              <td className="py-3 px-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {r.status}
                </span>
              </td>
              <td className="py-3 px-3 text-right">
                <button
                  type="button"
                  onClick={() => onSelectResident?.(r)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#005F02]/10 text-[#005F02] hover:bg-[#005F02]/20 font-medium transition-colors"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}