import { useNavigate } from 'react-router-dom'
import { MACHINE_CATEGORIES } from '../data/machineCategories'
import { Search, PlusCircle, Wrench, Shirt, Utensils, Printer } from 'lucide-react'

const categoryMeta = {
  "Fabrication & Metalworking": { icon: Wrench, color: "bg-blue-100 text-blue-700" },
  "Textile Processing": { icon: Shirt, color: "bg-pink-100 text-pink-700" },
  "Food & Agro Processing": { icon: Utensils, color: "bg-amber-100 text-amber-700" },
  "Printing & Packaging": { icon: Printer, color: "bg-emerald-100 text-emerald-700" },
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center animate-fadeUp">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Rent industrial machines,<br />on demand.
          </h1>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto mb-8">
            The marketplace where manufacturers rent out idle machines and others book them
            by the hour or day — just like booking a seat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/browse')}
              className="bg-white text-brand-700 font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-50 transition shadow-soft">
              <Search size={20} /> Rent a Machine
            </button>
            <button onClick={() => navigate('/list-machine')}
              className="bg-accent-500 text-white font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-accent-600 transition shadow-soft">
              <PlusCircle size={20} /> List Your Machine
            </button>
          </div>
        </div>
      </section>

      {/* ===== CATEGORY TILES ===== */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-2">Browse by Category</h2>
        <p className="text-center text-gray-500 mb-10">Find the right machine for your production needs</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.keys(MACHINE_CATEGORIES).map((cat, i) => {
            const meta = categoryMeta[cat]
            const Icon = meta.icon
            return (
              <button key={cat}
                onClick={() => navigate(`/browse?category=${encodeURIComponent(cat)}`)}
                style={{ animationDelay: `${i * 80}ms` }}
                className="bg-white rounded-2xl shadow-card p-6 text-left hover:-translate-y-1 hover:shadow-soft transition animate-fadeUp">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${meta.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-bold mb-1">{cat}</h3>
                <p className="text-sm text-gray-500">
                  {MACHINE_CATEGORIES[cat].length} machine types
                </p>
              </button>
            )
          })}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { n: '1', t: 'Find a machine', d: 'Filter by category, location, price and availability.' },
              { n: '2', t: 'Book your slot', d: 'Pick your dates, add a helper if needed, see the total instantly.' },
              { n: '3', t: 'Get to work', d: 'The owner confirms and you get your booking confirmation.' },
            ].map(s => (
              <div key={s.n} className="text-center">
                <div className="h-12 w-12 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="font-bold mb-1">{s.t}</h3>
                <p className="text-sm text-gray-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-brand-900 text-brand-200 text-center py-8 text-sm">
        © 2026 MachineRent · Industrial machine rental marketplace
      </footer>
    </div>
  )
}