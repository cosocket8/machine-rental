const STATUS = {
  pending:   { label: 'Awaiting approval', cls: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed',         cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Declined / Cancelled', cls: 'bg-red-100 text-red-700' },
  completed: { label: 'Completed',         cls: 'bg-blue-100 text-blue-700' },
}

export default function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, cls: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${s.cls}`}>
      {s.label}
    </span>
  )
}