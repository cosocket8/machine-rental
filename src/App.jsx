import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Auth from './pages/Auth'
import Home from './pages/Home'
import ListMachine from './pages/ListMachine'
import Browse from './pages/Browse'
import MachineDetail from './pages/MachineDetail'
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/list-machine" element={<ListMachine />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/machine/:id" element={<MachineDetail />} />
      </Routes>
    </BrowserRouter>
  )
}