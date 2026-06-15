import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function RenterDashboard() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('bookings')
      .select('*, machines(title, machine_type, city, images)')
      .eq('renter_id', user.id)
      .order('created_at', { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  const cancel = async (id) => {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    load()
  }

  const badge = (s) => ({
    pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700', cancelled: 'bg-red-100 text-red-700'
  }[s])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
      {bookings.length === 0 && <p className="text-gray-500">No bookings yet. Go rent a machine!</p>}
      <div className="space-y-3">
        {bookings.map(b => (
          <div key={b.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <img src={b.machines?.images?.[0] || 'https://placehold.co/80'}
              className="h-16 w-16 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-bold">{b.machines?.title}</h3>
              <p className="text-sm text-gray-500">{b.machines?.city} • {b.start_date} → {b.end_date}</p>
              <p className="text-sm font-medium">₹{b.total_amount} {b.helper_needed && '• with helper'}</p>
            </div>
            <div className="text-right">
              <span className={`text-xs px-3 py-1 rounded-full ${badge(b.status)}`}>{b.status}</span>
              {b.status === 'pending' && (
                <button onClick={() => cancel(b.id)}
                  className="block text-xs text-red-500 mt-2">Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}