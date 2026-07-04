import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from './Toast'

const fmt = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function OwnerCalendar({ machineId }) {
  const { showToast } = useToast()
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [blocked, setBlocked] = useState(new Set())
  const [booked, setBooked] = useState(new Set())
  const [rangeStart, setRangeStart] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [machineId])

  const load = async () => {
    setLoading(true)
    const { data: blocks } = await supabase
      .from('owner_blocked_slots').select('blocked_date').eq('machine_id', machineId)
    setBlocked(new Set((blocks || []).map(b => b.blocked_date)))

    const { data: bookings } = await supabase
      .from('bookings').select('start_date, end_date')
      .eq('machine_id', machineId).in('status', ['pending', 'confirmed'])
    const bset = new Set()
    ;(bookings || []).forEach(r => {
      let d = new Date(r.start_date); const end = new Date(r.end_date)
      while (d <= end) { bset.add(fmt(d)); d.setDate(d.getDate() + 1) }
    })
    setBooked(bset)
    setLoading(false)
  }

  const handleClick = async (dateStr) => {
    if (booked.has(dateStr)) {
      showToast('This day has a booking and cannot be changed.', 'error'); return
    }

    // If clicking an already-blocked day (and not mid-range), unblock just that day
    if (blocked.has(dateStr) && !rangeStart) {
      const { error } = await supabase.from('owner_blocked_slots')
        .delete().eq('machine_id', machineId).eq('blocked_date', dateStr)
      if (error) { showToast(error.message, 'error'); return }
      showToast('Day marked available', 'success')
      await load(); return
    }

    // First click of a range
    if (!rangeStart) {
      setRangeStart(dateStr)
      showToast('Now click the END date to block the whole period', 'info')
      return
    }

    // Second click — block the whole range
    const start = rangeStart < dateStr ? rangeStart : dateStr
    const end = rangeStart < dateStr ? dateStr : rangeStart
    setRangeStart(null)

    const rows = []
    let d = new Date(start); const last = new Date(end)
    while (d <= last) {
      const ds = fmt(d)
      if (!booked.has(ds) && !blocked.has(ds)) rows.push({ machine_id: machineId, blocked_date: ds })
      d.setDate(d.getDate() + 1)
    }
    if (rows.length === 0) { showToast('Those days are already blocked or booked.', 'info'); return }

    const { error } = await supabase.from('owner_blocked_slots').insert(rows)
    if (error) { showToast(error.message, 'error'); return }
    showToast(`Blocked ${rows.length} day(s)`, 'success')
    await load()
  }

  const cancelRange = () => { setRangeStart(null); showToast('Selection cleared', 'info') }

  const year = viewMonth.getFullYear(), month = viewMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
  const canGoPrev = new Date(year, month, 1) > new Date(today.getFullYear(), today.getMonth(), 1)

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  // highlight days between rangeStart and hovered — here we just highlight the start
  const inPendingRange = (dateStr) => rangeStart && dateStr === rangeStart

  if (loading) return <p className="text-sm text-gray-400">Loading calendar...</p>

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewMonth(new Date(year, month - 1, 1))} disabled={!canGoPrev}
          className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={18} /></button>
        <span className="font-semibold text-sm">{monthName}</span>
        <button onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          className="p-1 rounded-lg hover:bg-gray-100"><ChevronRight size={18} /></button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />
          const dateStr = fmt(date)
          const isPast = date < today
          const isBooked = booked.has(dateStr)
          const isBlocked = blocked.has(dateStr)
          const isStart = inPendingRange(dateStr)

          let cls = 'h-9 rounded-lg text-sm flex items-center justify-center transition '
          if (isPast) cls += 'text-gray-300 cursor-not-allowed bg-gray-50'
          else if (isBooked) cls += 'bg-red-500 text-white cursor-not-allowed'
          else if (isStart) cls += 'bg-brand-600 text-white ring-2 ring-brand-300 cursor-pointer'
          else if (isBlocked) cls += 'bg-gray-400 text-white cursor-pointer'
          else cls += 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'

          return (
            <button key={i} disabled={isPast || isBooked}
              onClick={() => handleClick(dateStr)} className={cls}>
              {date.getDate()}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-green-100 inline-block" /> Available</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-gray-400 inline-block" /> Blocked by you</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-500 inline-block" /> Booked</span>
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-400">
          {rangeStart
            ? 'Now click the END date to block the whole period.'
            : 'Click a start date, then an end date, to block a period. Click a grey day to unblock it.'}
        </p>
        {rangeStart && (
          <button onClick={cancelRange} className="text-xs text-red-500 shrink-0 ml-2">Cancel</button>
        )}
      </div>
    </div>
  )
}