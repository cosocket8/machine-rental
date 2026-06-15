import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useParams, useNavigate } from 'react-router-dom'

export default function MachineDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [machine, setMachine] = useState(null)
  const [bookedRanges, setBookedRanges] = useState([])
  const [activeImg, setActiveImg] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    renter_name: '', renter_mobile: '', renter_email: '', renter_pan: '',
    start_date: '', end_date: '', helper_needed: false
  })

  useEffect(() => { fetchData() }, [id])

  const fetchData = async () => {
    setLoading(true)
    const { data: m } = await supabase.from('machines').select('*').eq('id', id).single()
    setMachine(m)
    // get confirmed/pending bookings to block those dates
    const { data: b } = await supabase
      .from('bookings').select('start_date, end_date')
      .eq('machine_id', id).in('status', ['pending', 'confirmed'])
    setBookedRanges(b || [])
    // prefill renter info from their profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof) setForm(f => ({ ...f,
        renter_name: prof.full_name || '', renter_mobile: prof.mobile || '',
        renter_email: prof.email || '', renter_pan: prof.pan_number || '' }))
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  // ---- rent calculation ----
  const calcDays = () => {
    if (!form.start_date || !form.end_date) return 0
    const s = new Date(form.start_date), e = new Date(form.end_date)
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
    return diff > 0 ? diff : 0
  }
  const days = calcDays()
  const machineCost = days * (Number(machine?.daily_rate) || 0)
  const helperCost = form.helper_needed && machine?.helper_available
    ? days * (Number(machine?.helper_charge) || 0) : 0
  const totalAmount = machineCost + helperCost

  // ---- check date overlap with existing bookings ----
  const datesOverlap = () => {
    if (!form.start_date || !form.end_date) return false
    const s = new Date(form.start_date), e = new Date(form.end_date)
    return bookedRanges.some(r => {
      const rs = new Date(r.start_date), re = new Date(r.end_date)
      return s <= re && e >= rs
    })
  }

  const handleBook = async () => {
    setError('')
    if (!form.renter_name || !form.renter_mobile || !form.renter_email || !form.renter_pan) {
      setError('Please fill all your details.'); return
    }
    if (!form.start_date || !form.end_date) { setError('Select start and end dates.'); return }
    if (days <= 0) { setError('End date must be on or after start date.'); return }
    if (datesOverlap()) { setError('Those dates are already booked. Pick different dates.'); return }

    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error: insErr } = await supabase.from('bookings').insert({
      machine_id: id, renter_id: user.id,
      renter_name: form.renter_name, renter_mobile: form.renter_mobile,
      renter_email: form.renter_email, renter_pan: form.renter_pan,
      start_date: form.start_date, end_date: form.end_date,
      helper_needed: form.helper_needed, total_amount: totalAmount,
      status: 'pending'
    })
    setSubmitting(false)
    if (insErr) { setError(insErr.message); return }
    setSuccess(true)
    fetchData() // refresh blocked dates
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>
  if (!machine) return <div className="p-10 text-center">Machine not found.</div>

  if (success) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-green-600">✅ Booking Request Sent!</h1>
      <p className="text-gray-600">The owner will confirm your booking shortly.</p>
      <p className="text-gray-600">Total: ₹{totalAmount} for {days} day(s)</p>
      <button onClick={() => navigate('/browse')}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg">Browse more machines</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/browse')} className="text-sm text-gray-600 mb-4">← Back</button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* LEFT: images + info */}
          <div>
            <img src={machine.images?.[activeImg] || 'https://placehold.co/600x400?text=No+Image'}
              alt={machine.title} className="w-full h-72 object-cover rounded-2xl" />
            {machine.images?.length > 1 && (
              <div className="flex gap-2 mt-3">
                {machine.images.map((img, i) => (
                  <img key={i} src={img} onClick={() => setActiveImg(i)}
                    className={`h-16 w-16 object-cover rounded-lg cursor-pointer border-2 ${i === activeImg ? 'border-blue-600' : 'border-transparent'}`} />
                ))}
              </div>
            )}
            <div className="bg-white rounded-2xl shadow p-5 mt-4">
              <p className="text-xs text-blue-600 font-medium">{machine.machine_type}</p>
              <h1 className="text-2xl font-bold">{machine.title}</h1>
              <p className="text-gray-500 mb-2">📍 {machine.city}</p>
              <p className="text-gray-700 text-sm mb-3">{machine.description}</p>
              <p className="font-bold text-xl">₹{machine.daily_rate}<span className="text-sm font-normal text-gray-500">/day</span></p>
              {machine.helper_available && (
                <p className="text-sm text-green-700 mt-1">👷 Helper available (+₹{machine.helper_charge}/day)</p>
              )}
            </div>
          </div>

          {/* RIGHT: booking form */}
          <div className="bg-white rounded-2xl shadow p-6 h-fit">
            <h2 className="font-bold text-lg mb-4">Book this machine</h2>

            {bookedRanges.length > 0 && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">
                <p className="font-medium mb-1">Already booked (unavailable):</p>
                {bookedRanges.map((r, i) => (
                  <p key={i}>• {r.start_date} → {r.end_date}</p>
                ))}
              </div>
            )}

            <input name="renter_name" value={form.renter_name} onChange={handleChange}
              placeholder="Full Name" className="w-full border rounded-lg p-3 mb-3" />
            <input name="renter_mobile" value={form.renter_mobile} onChange={handleChange}
              placeholder="Mobile Number" className="w-full border rounded-lg p-3 mb-3" />
            <input name="renter_email" value={form.renter_email} onChange={handleChange}
              placeholder="Email Address" className="w-full border rounded-lg p-3 mb-3" />
            <input name="renter_pan" value={form.renter_pan} onChange={handleChange}
              placeholder="PAN Number" className="w-full border rounded-lg p-3 mb-3" />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input name="start_date" type="date" value={form.start_date} onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input name="end_date" type="date" value={form.end_date} onChange={handleChange}
                  min={form.start_date || new Date().toISOString().split('T')[0]}
                  className="w-full border rounded-lg p-2" />
              </div>
            </div>

            {machine.helper_available && (
              <div className="flex items-center gap-2 mb-4">
                <input type="checkbox" name="helper_needed" checked={form.helper_needed}
                  onChange={handleChange} id="helper_needed" />
                <label htmlFor="helper_needed" className="text-sm">
                  I need a helper/operator (+₹{machine.helper_charge}/day)
                </label>
              </div>
            )}

            {/* live rent breakdown */}
            {days > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                <div className="flex justify-between"><span>Duration</span><span>{days} day(s)</span></div>
                <div className="flex justify-between"><span>Machine rent</span><span>₹{machineCost}</span></div>
                {helperCost > 0 && (
                  <div className="flex justify-between"><span>Helper charge</span><span>₹{helperCost}</span></div>
                )}
                <div className="flex justify-between font-bold border-t mt-2 pt-2">
                  <span>Total</span><span>₹{totalAmount}</span>
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <button onClick={handleBook} disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}