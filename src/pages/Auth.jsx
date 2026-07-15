import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ email: '', password: '', fullName: '', mobile: '', role: 'renter' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/home'

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setLoading(true); setError('')
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email, password: form.password
      })
      if (error) setError(error.message)
      else navigate(redirectTo)
    } else {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            mobile: form.mobile,
            role: form.role
          }
        }
      })
      if (error) { setError(error.message) }
      else {
        setError('')
        setSignupSuccess(true)
      }
    }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!form.email) {
      setError('Please enter your email address first, then click "Forgot password".')
      return
    }
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    setLoading(false)
    if (error) setError(error.message)
    else { setError(''); setResetSent(true) }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`
      }
    })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">MachineRent</h1>
        <p className="text-center text-gray-500 mb-6">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </p>

        {signupSuccess && (
          <div className="bg-green-50 text-green-700 rounded-lg p-4 mb-4 text-sm">
            ✅ Account created! Please check your email and click the verification
            link before logging in.
          </div>
        )}

        {resetSent && (
          <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4 text-sm">
            ✅ Password reset link sent! Check your email.
          </div>
        )}

        {!isLogin && (
          <>
            <input name="fullName" placeholder="Full Name" onChange={handleChange}
              className="w-full border rounded-lg p-3 mb-3" />
            <input name="mobile" placeholder="Mobile Number" onChange={handleChange}
              className="w-full border rounded-lg p-3 mb-3" />
            <select name="role" onChange={handleChange}
              className="w-full border rounded-lg p-3 mb-3">
              <option value="renter">I want to Rent a Machine</option>
              <option value="owner">I want to List my Machines</option>
            </select>
          </>
        )}

        <input name="email" type="email" placeholder="Email" onChange={handleChange}
          className="w-full border rounded-lg p-3 mb-3" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange}
          className="w-full border rounded-lg p-3 mb-2" />

        {isLogin && (
          <button onClick={handleForgotPassword}
            className="text-sm text-blue-600 mb-4 block">
            Forgot password?
          </button>
        )}

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
        </button>

        {/* ===== OR divider + Google login at the bottom ===== */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <button onClick={handleGoogleLogin}
          className="w-full border border-gray-300 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
          <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="text-center mt-4 text-sm">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setIsLogin(!isLogin); setSignupSuccess(false); setResetSent(false); setError('') }}
            className="text-blue-600 font-medium">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  )
}