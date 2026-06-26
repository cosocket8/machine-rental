import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MACHINE_CATEGORIES } from '../data/machineCategories'
import { Search, MapPin, HardHat, SlidersHorizontal } from 'lucide-react'
import Spinner from '../components/Spinner'

export default function Browse() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [filters, setFilters] = useState({
    category: '', machine_type: '', city: '', maxPrice: '', helperOnly: false
  })

  // read ?category= from URL (set by landing page tiles)
  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setFilters(f => ({ ...f, category: cat }))
  }, [searchParams])

  useEffect(() => { fetchMachines() }, [])

  const fetchMachines = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('machines').select('*').eq('status', 'active')
      .order('created_at', { ascending: false })
    if (!error) setMachines(data || [])
    setLoading(false)
  }

  const handleFilter = (e) => {
    const { name, value, type, checked } = e.target
    setFilters({ ...filters, [name]: type === 'checkbox' ? checked : value })
  }

  const clearAll = () => {
    setFilters({ category: '', machine_type: '', city: '', maxPrice: '', helperOnly: false })
    setSearch('')
  }

  // filter + search + sort
  let filtered = machines.filter(m => {
    if (filters.category && m.category !== filters.category) return false
    if (filters.machine_type && m.machine_type !== filters.machine_type) return false
    if (filters.city && !m.city?.toLowerCase().includes(filters.city.toLowerCase())) return false
    if (filters.maxPrice && Number(m.daily_rate) > Number(filters.maxPrice)) return false
    if (filters.helperOnly && !m.helper_available) return false
    if (search) {
      const q = search.toLowerCase()
      const hay = `${m.title} ${m.machine_type} ${m.city} ${m.description}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  filtered = [...filtered].sort((a, b) => {
    if (sort === 'price_low') return a.daily_rate - b.daily_rate
    if (sort === 'price_high') return b.daily_rate - a.daily_rate
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* search + sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search machines, e.g. CNC, lathe, embroidery..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
            />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-500">
            <option value="newest">Newest first</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ===== SIDEBAR ===== */}
          <aside className="lg:w-64 shrink-0 bg-white rounded-2xl shadow-card p-5 h-fit lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal size={18} className="text-brand-600" />
              <h2 className="font-bold">Filters</h2>
            </div>

            <label className="block text-sm font-medium mb-1">Category</label>
            <select name="category" value={filters.category} onChange={handleFilter}
              className="w-full border border-gray-200 rounded-lg p-2 mb-4 text-sm outline-none focus:border-brand-500">
              <option value="">All categories</option>
              {Object.keys(MACHINE_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label className="block text-sm font-medium mb-1">Machine Type</label>
            <select name="machine_type" value={filters.machine_type} onChange={handleFilter}
              disabled={!filters.category}
              className="w-full border border-gray-200 rounded-lg p-2 mb-4 text-sm outline-none focus:border-brand-500 disabled:bg-gray-50">
              <option value="">All types</option>
              {filters.category && MACHINE_CATEGORIES[filters.category].map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <label className="block text-sm font-medium mb-1">City</label>
            <input name="city" value={filters.city} onChange={handleFilter} placeholder="e.g. Mumbai"
              className="w-full border border-gray-200 rounded-lg p-2 mb-4 text-sm outline-none focus:border-brand-500" />

            <label className="block text-sm font-medium mb-1">Max Daily Rate (₹)</label>
            <input name="maxPrice" type="number" value={filters.maxPrice} onChange={handleFilter} placeholder="e.g. 5000"
              className="w-full border border-gray-200 rounded-lg p-2 mb-4 text-sm outline-none focus:border-brand-500" />

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="helperOnly" checked={filters.helperOnly} onChange={handleFilter}
                className="accent-brand-600" />
              <span className="text-sm">Helper available only</span>
            </label>

            <button onClick={clearAll}
              className="w-full mt-5 text-sm text-brand-600 border border-brand-600 rounded-lg py-2 hover:bg-brand-50 transition">
              Clear Filters
            </button>
          </aside>

          {/* ===== CARDS ===== */}
          <main className="flex-1">
            <p className="text-sm text-gray-500 mb-4">
              {loading ? '' : `${filtered.length} machine(s) found`}
            </p>

            {loading ? <Spinner label="Loading machines..." /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((m, i) => (
                  <div key={m.id} style={{ animationDelay: `${i * 50}ms` }}
                    className="bg-white rounded-2xl shadow-card hover:shadow-soft hover:-translate-y-1 transition overflow-hidden flex flex-col animate-fadeUp">
                    <div className="relative">
                      <img src={m.images?.[0] || 'https://placehold.co/400x250?text=No+Image'}
                        alt={m.title} className="h-44 w-full object-cover" />
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-medium text-brand-700 px-2 py-1 rounded-full">
                        {m.category}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-xs text-brand-600 font-medium">{m.machine_type}</p>
                      <h3 className="font-bold text-gray-800 leading-snug">{m.title}</h3>
                      <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                        <MapPin size={14} /> {m.city}
                      </p>
                      {m.helper_available && (
                        <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-1 w-fit mb-2 flex items-center gap-1">
                          <HardHat size={12} /> Helper available
                        </span>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <p className="font-bold text-lg">₹{m.daily_rate}
                          <span className="text-xs font-normal text-gray-500">/day</span></p>
                        <button onClick={() => navigate(`/machine/${m.id}`)}
                          className="bg-brand-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-700 transition">
                          View & Book
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 mb-3">No machines match your search.</p>
                <button onClick={clearAll} className="text-brand-600 font-medium">Clear all filters</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
