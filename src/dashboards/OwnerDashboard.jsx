import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function OwnerDashboard() {
  const [machines, setMachines] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: mac } = await supabase.from('machines').select('*').eq('owner_id', user.id)
    setMachines(mac || [])
    const { data: bk } = await supabase
      .from('bookings')
      .select('*, machines(title, owner_id)')
      .order('created_at', { ascending: false })
    setBookings((bk || []).filter(b => b.machines?.owner_id === user.id))
    setLoading(false)
  }

  const setStatus = async (id, status) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    load()
  }
  const deleteMachine = async (id) => {
    if (!confirm('Delete this machine?')) return
    await supabase.from('machines').delete().eq('id', id)
    load()
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Booking Requests</h2>
        {bookings.length === 0 && <p className="text-gray-500">No booking requests yet.</p>}
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{b.machines?.title}</h3>
                  <p className="text-sm text-gray-500">{b.start_date} → {b.end_date} • ₹{b.total_amount}</p>
                  <p className="text-sm mt-1">{b.renter_name} • {b.renter_mobile} • {b.renter_email}</p>
                  <p className="text-xs text-gray-400">PAN: {b.renter_pan} {b.helper_needed && '• needs helper'}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100">{b.status}</span>
              </div>
              {b.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setStatus(b.id, 'confirmed')}
                    className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg">Accept</button>
                  <button onClick={() => setStatus(b.id, 'cancelled')}
                    className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">My Machines ({machines.length})</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {machines.map(m => (
            <div key={m.id} className="bg-white rounded-xl shadow p-4 flex gap-4">
              <img src={m.images?.[0] || 'https://placehold.co/80'}
                className="h-16 w-16 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="font-bold">{m.title}</h3>
                <p className="text-sm text-gray-500">{m.machine_type} • {m.city}</p>
                <p className="text-sm">₹{m.daily_rate}/day</p>
              </div>
              <button onClick={() => deleteMachine(m.id)}
                className="text-xs text-red-500 self-start">Delete</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}