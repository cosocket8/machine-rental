export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="h-10 w-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}
