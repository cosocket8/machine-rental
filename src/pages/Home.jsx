import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useLocation } from 'react-router-dom'
import RenterDashboard from '../dashboards/RenterDashboard'
import OwnerDashboard from '../dashboards/OwnerDashboard'
import AdminDashboard from '../dashboards/AdminDashboard'

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [location.key])

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/')
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(data)
    setLoading(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">
          MachineRent
        </h1>

        <div className="flex items-center gap-3">
          {/* Rent + List: not for admins */}
          {profile?.role !== 'admin' && (
            <button
              onClick={() => navigate('/browse')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              🔍 Rent
            </button>
          )}

          {profile?.role === 'owner' && (
            <button
              onClick={() => navigate('/list-machine')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              + List
            </button>
          )}

          <span className="text-sm text-gray-600">
            {profile?.full_name} ({profile?.role})
          </span>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {profile?.role === 'renter' && <RenterDashboard />}
        {profile?.role === 'owner' && <OwnerDashboard />}
        {profile?.role === 'admin' && <AdminDashboard />}
      </div>
    </div>
  )
}