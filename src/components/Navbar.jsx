import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="text-xl font-extrabold text-brand-600">
          MachineRent
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/browse')}
            className="text-sm font-medium text-gray-600 hover:text-brand-600">
            Browse
          </button>
          {user ? (
            <button onClick={() => navigate('/home')}
              className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700">
              Dashboard
            </button>
          ) : (
            <button onClick={() => navigate('/login')}
              className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700">
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}