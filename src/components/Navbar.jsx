import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import logo from '../assets/logo.jpeg'
export default function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)

  useEffect(() => {
    const loadRole = async (u) => {
      if (!u) { setRole(null); return }
      const { data } = await supabase.from('profiles').select('role').eq('id', u.id).single()
      setRole(data?.role || null)
    }
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); loadRole(data.user) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null)
      loadRole(session?.user || null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const isAdmin = role === 'admin'

  return (
    <nav className="bg-[#0d1b2a] shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate(isAdmin ? '/home' : '/')}
  className="flex items-center">
  <img src={logo} alt="Cosocket" className="h-20 object-contain rounded-md" />
</button>
        <div className="flex items-center gap-3">
          {/* Browse only for non-admins */}
          {!isAdmin && (
            <button onClick={() => navigate('/browse')}
  className="text-sm font-medium text-gray-200 hover:text-white">
  Browse
</button>
          )}
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