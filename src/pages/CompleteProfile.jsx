import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function CompleteProfile() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', mobile: '', role: 'renter' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // prefill name from their Google account if available
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user) { navigate('/login'); return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof?.profile_completed) { navigate('/home'); return } // already done
      setForm(f => ({
        ...f,
        full_name: prof?.full_name || user.user_metadata?.full_name || '',
      }))
    })
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setError('')
    if (!form.full_name || !form.mobile) {
      setError('Please enter your name and mobile number.'); return
    }
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const { data, error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      mobile: form.mobile,
      role: form.role,
      profile_completed: true
    }).eq('id', session.user.id).select()   // .select() returns the updated row

    setLoading(false)
    console.log('update result:', data, 'error:', error)   // <-- watch this

    if (error) { setError(error.message); return }
    if (!data || data.length === 0) {
      setError('Update did not save (permission issue). Check console.')
      return
    }
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Complete your profile</h1>
        <p className="text-center text-gray-500 mb-6">Just a few details to get started</p>

        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input name="full_name" value={form.full_name} onChange={handleChange}
          className="w-full border rounded-lg p-3 mb-3" />

        <label className="block text-sm font-medium mb-1">Mobile Number</label>
        <input name="mobile" value={form.mobile} onChange={handleChange}
          placeholder="10-digit mobile" className="w-full border rounded-lg p-3 mb-3" />

        <label className="block text-sm font-medium mb-1">I want to...</label>
        <select name="role" value={form.role} onChange={handleChange}
          className="w-full border rounded-lg p-3 mb-4">
          <option value="renter">Rent Machines</option>
          <option value="owner">List my Machines</option>
        </select>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}