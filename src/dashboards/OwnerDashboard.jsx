import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import OwnerCalendar from '../components/OwnerCalendar'
import StatusBadge from '../components/StatusBadge'
import { sendConfirmedEmail, sendRejectedEmail } from '../utils/sendEmail'
import { useToast } from '../components/Toast'
export default function OwnerDashboard() {
  const { showToast } = useToast()
  const [machines, setMachines] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [openCalendar, setOpenCalendar] = useState(null)
  useEffect(() => { load() }, [])

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: mac } = await supabase.from('machines').select('*').eq('owner_id', user.id)
    setMachines(mac || [])

    let bookingData = []
    if (mac?.length) {
      const machineIds = mac.map(m => m.id)
      const { data: bk } = await supabase
        .from('bookings')
        .select('*, machines(title, owner_id)')
        .in('machine_id', machineIds)
        .order('created_at', { ascending: false })
      bookingData = bk || []
    }

    setBookings(bookingData)
    setLoading(false)
  }

  const setStatus = async (id, status, booking) => {
    // 1. Update the database FIRST and refresh the UI immediately
    const { error: updateErr } = await supabase
      .from('bookings').update({ status }).eq('id', id)

    if (updateErr) {
      showToast('Update failed: ' + updateErr.message, 'error')
      return
    }

    // Show success and refresh right away — don't wait for email
    showToast(status === 'confirmed' ? 'Booking accepted ✓' : 'Booking declined',
      status === 'confirmed' ? 'success' : 'error')
    await load()

    // 2. Send email AFTER (wrapped so a failure never blocks the update)
    try {
      if (status === 'confirmed') {
        const { data: { session } } = await supabase.auth.getSession()
        const { data: ownerProf } = await supabase.from('profiles')
          .select('full_name, mobile').eq('id', session.user.id).single()
        await sendConfirmedEmail({
          renter_name: booking.renter_name, renter_email: booking.renter_email,
          machine_title: booking.machines?.title,
          start_date: booking.start_date, end_date: booking.end_date,
          total_amount: booking.total_amount,
          owner_name: ownerProf?.full_name, owner_mobile: ownerProf?.mobile,
        })
      } else if (status === 'cancelled') {
        await sendRejectedEmail({
          renter_name: booking.renter_name, renter_email: booking.renter_email,
          machine_title: booking.machines?.title,
          start_date: booking.start_date, end_date: booking.end_date,
        })
      }
    } catch (e) {
      console.error('Email failed (booking status was still updated):', e)
    }
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
                <StatusBadge status={b.status} />
              </div>
              {b.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setStatus(b.id, 'confirmed',b)}
                    className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg">Accept</button>
                  <button onClick={() => setStatus(b.id, 'cancelled',b)}
                    className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
  <h2 className="text-2xl font-bold mb-4">
    My Machines ({machines.length})
  </h2>

  <div className="space-y-4">
    {machines.map((m) => (
      <div key={m.id} className="bg-white rounded-xl shadow p-4">
        <div className="flex gap-4">
          <img
            src={m.images?.[0] || "https://placehold.co/80"}
            alt={m.title}
            className="h-16 w-16 object-cover rounded-lg"
          />

          <div className="flex-1">
            <h3 className="font-bold">{m.title}</h3>
            <p className="text-sm text-gray-500">
              {m.machine_type} • {m.city}
            </p>
            <p className="text-sm">₹{m.daily_rate}/day</p>
          </div>

          <button
            onClick={() => deleteMachine(m.id)}
            className="text-xs text-red-500 self-start"
          >
            Delete
          </button>
        </div>

        <button
          onClick={() =>
            setOpenCalendar(openCalendar === m.id ? null : m.id)
          }
          className="mt-3 text-sm text-brand-600 border border-brand-600 rounded-lg px-3 py-1 hover:bg-brand-50"
        >
          {openCalendar === m.id
            ? "Hide Calendar"
            : "📅 Manage Availability"}
        </button>

        {openCalendar === m.id && (
          <div className="mt-3">
            <OwnerCalendar machineId={m.id} />
          </div>
        )}
      </div>
    ))}
  </div>
</section>
    </div>
  )
}