import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AdminDashboard() {
  const [tab, setTab] = useState('machines')
  const [machines, setMachines] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data: m } = await supabase.from('machines').select('*, profiles(full_name)')
    const { data: b } = await supabase.from('bookings').select('*, machines(title)')
    const { data: u } = await supabase.from('profiles').select('*')
    setMachines(m || []); setBookings(b || []); setUsers(u || [])
  }

  const setMachineStatus = async (id, status) => {
    await supabase.from('machines').update({ status }).eq('id', id); load()
  }

  const Tab = ({ id, label }) => (
    <button onClick={() => setTab(id)}
      className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === id ? 'bg-blue-600 text-white' : 'bg-white'}`}>
      {label}
    </button>
  )

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
      <div className="flex gap-2 mb-5">
        <Tab id="machines" label={`Machines (${machines.length})`} />
        <Tab id="bookings" label={`Bookings (${bookings.length})`} />
        <Tab id="users" label={`Users (${users.length})`} />
      </div>

      {tab === 'machines' && (
        <div className="space-y-3">
          {machines.map(m => (
            <div key={m.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold">{m.title}</h3>
                <p className="text-sm text-gray-500">{m.machine_type} • {m.city} • owner: {m.profiles?.full_name}</p>
                <span className="text-xs">Status: {m.status}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setMachineStatus(m.id, 'active')}
                  className="bg-green-600 text-white text-xs px-3 py-1 rounded">Activate</button>
                <button onClick={() => setMachineStatus(m.id, 'blocked')}
                  className="bg-red-500 text-white text-xs px-3 py-1 rounded">Block</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'bookings' && (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="bg-white rounded-xl shadow p-4">
              <h3 className="font-bold">{b.machines?.title}</h3>
              <p className="text-sm text-gray-500">{b.renter_name} • {b.start_date} → {b.end_date} • ₹{b.total_amount}</p>
              <span className="text-xs">Status: {b.status}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u.id} className="bg-white rounded-xl shadow p-4 flex justify-between">
              <div>
                <h3 className="font-bold">{u.full_name}</h3>
                <p className="text-sm text-gray-500">{u.email} • {u.mobile}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 self-start">{u.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}