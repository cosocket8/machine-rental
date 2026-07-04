import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Navbar from './components/Navbar'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Browse from './pages/Browse'
import ListMachine from './pages/ListMachine'
import MachineDetail from './pages/MachineDetail'
import ProtectedRoute from './components/ProtectedRoute'
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Auth />} />
  <Route path="/browse" element={<Browse />} />

  <Route path="/home" element={
    <ProtectedRoute><Home /></ProtectedRoute>
  } />
  <Route path="/list-machine" element={
    <ProtectedRoute><ListMachine /></ProtectedRoute>
  } />
  <Route path="/machine/:id" element={
    <ProtectedRoute><MachineDetail /></ProtectedRoute>
  } />
</Routes>
    </BrowserRouter>
  )
}
