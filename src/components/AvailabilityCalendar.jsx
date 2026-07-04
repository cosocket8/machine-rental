import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// helper: format a Date as YYYY-MM-DD (local, no timezone shift)
const fmt = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function AvailabilityCalendar({ bookedRanges, ownerBlocks = [],startDate, endDate, onSelectDate }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  // build a set of all booked date-strings for quick lookup
  const bookedSet = new Set()
    ;(bookedRanges || []).forEach(r => {
    let d = new Date(r.start_date)
    const end = new Date(r.end_date)
    while (d <= end) { bookedSet.add(fmt(d)); d.setDate(d.getDate() + 1) }
  })
  ;(ownerBlocks || []).forEach(d => bookedSet.add(d))

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // is a date inside the currently selected range?
  const inSelectedRange = (dateStr) => {
    if (!startDate || !endDate) return dateStr === startDate
    return dateStr >= startDate && dateStr <= endDate
  }

  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1))

  const monthName = viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
  const canGoPrev = new Date(year, month, 1) > new Date(today.getFullYear(), today.getMonth(), 1)

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null) // empty leading cells
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} disabled={!canGoPrev}
          className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30">
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold text-sm">{monthName}</span>
        <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* weekday labels */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>

      {/* day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />
          const dateStr = fmt(date)
          const isPast = date < today
          const isBooked = bookedSet.has(dateStr)
          const isSelected = inSelectedRange(dateStr)
          const disabled = isPast || isBooked

          let cls = 'h-9 rounded-lg text-sm flex items-center justify-center transition '
          if (disabled) cls += 'text-gray-300 line-through cursor-not-allowed bg-gray-50'
          else if (isSelected) cls += 'bg-brand-600 text-white font-semibold'
          else cls += 'hover:bg-brand-100 text-gray-700 cursor-pointer'

          return (
            <button key={i} disabled={disabled}
              onClick={() => onSelectDate(dateStr)}
              className={cls}>
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {/* legend */}
      <div className="flex gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-brand-600 inline-block" /> Selected
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-gray-200 inline-block" /> Booked / Past
        </span>
      </div>
    </div>
  )
}