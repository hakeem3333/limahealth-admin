export default function Table({ headers, children, rightAlignLast = true }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-card">
      <table className="w-full min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-400">
            {headers.map((header, i) => (
              <th
                key={header}
                className={`px-5 py-4 font-bold ${rightAlignLast && i === headers.length - 1 ? "text-right" : ""}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "", colSpan }) {
  return (
    <td colSpan={colSpan} className={`px-5 py-4 ${className}`}>
      {children}
    </td>
  );
}
