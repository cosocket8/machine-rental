import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  // When the user arrives from the email link, Supabase sets a temporary session
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true)
      }
    })
    // also check if a session already exists (link already processed)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
  }, [])

  const handleReset = async () => {
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    alert('Password updated! Please log in with your new password.')
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Set New Password</h1>
        <p className="text-center text-gray-500 mb-6">Enter your new password below</p>

        {!ready ? (
          <p className="text-center text-gray-500 text-sm">
            Verifying your reset link... If this doesn't clear, please request a new
            reset link from the login page.
          </p>
        ) : (
          <>
            <input type="password" placeholder="New Password" value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded-lg p-3 mb-3" />
            <input type="password" placeholder="Confirm New Password" value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4" />

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <button onClick={handleReset} disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}