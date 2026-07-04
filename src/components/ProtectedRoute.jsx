import { useEffect, useState } from 'react'
//import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Spinner from './Spinner'
import { Navigate, useLocation } from 'react-router-dom'
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking') // 'checking' | 'in' | 'out'
  const location = useLocation()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? 'in' : 'out')
    })
  }, [])

  if (status === 'checking') return <Spinner label="Checking access..." />
  //if (status === 'out') return <Navigate to="/login" replace />
  if (status === 'out') return <Navigate to="/login" state={{ from: location }} replace />
  return children
}