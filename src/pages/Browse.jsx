import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { MACHINE_CATEGORIES } from '../data/machineCategories'

export default function Browse() {

  const navigate = useNavigate()

  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({
    category: '',
    machine_type: '',
    city: '',
    maxPrice: '',
    helperOnly: false
  })


  useEffect(() => {
    fetchMachines()
  }, [])



  const fetchMachines = async () => {

    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .or('status.eq.active,status.is.null')
      .order('created_at', { ascending: false })

    console.log('machines:', data, 'error:', error)

    if (error) {
      setError(error.message)
      setMachines([])
    } else {
      setMachines(data || [])
    }

    setLoading(false)
  }



  const handleFilter = (e) => {

    const { name, value, type, checked } = e.target

    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    })
  }



  const filtered = machines.filter(m => {

    if (filters.category && m.category !== filters.category)
      return false

    if (
      filters.machine_type &&
      m.machine_type !== filters.machine_type
    )
      return false


    if (
      filters.city &&
      !m.city?.toLowerCase().includes(filters.city.toLowerCase())
    )
      return false


    if (
      filters.maxPrice &&
      Number(m.daily_rate) > Number(filters.maxPrice)
    )
      return false


    if (
      filters.helperOnly &&
      !m.helper_available
    )
      return false


    return true
  })



  return (

    <div className="min-h-screen bg-gray-100">


      {/* Top bar */}

      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">

        <h1 className="text-xl font-bold text-blue-600">
          MachineRent
        </h1>


        <button
          onClick={() => navigate('/home')}
          className="text-sm text-gray-600"
        >
          ← Back to Home
        </button>


      </div>



      <div className="max-w-7xl mx-auto flex gap-6 p-6">



        {/* FILTERS */}

        <aside className="w-64 shrink-0 bg-white rounded-2xl shadow p-5 h-fit sticky top-6">


          <h2 className="font-bold mb-4">
            Filters
          </h2>



          <label className="block text-sm font-medium mb-1">
            Category
          </label>


          <select
            name="category"
            value={filters.category}
            onChange={handleFilter}
            className="w-full border rounded-lg p-2 mb-4 text-sm"
          >

            <option value="">
              All categories
            </option>


            {
              Object.keys(MACHINE_CATEGORIES).map(c => (

                <option key={c} value={c}>
                  {c}
                </option>

              ))
            }


          </select>




          <label className="block text-sm font-medium mb-1">
            Machine Type
          </label>


          <select
            name="machine_type"
            value={filters.machine_type}
            onChange={handleFilter}
            disabled={!filters.category}
            className="w-full border rounded-lg p-2 mb-4 text-sm"
          >


            <option value="">
              All types
            </option>


            {
              filters.category &&
              MACHINE_CATEGORIES[filters.category].map(m => (

                <option key={m} value={m}>
                  {m}
                </option>

              ))
            }


          </select>





          <label className="block text-sm font-medium mb-1">
            City
          </label>


          <input
            name="city"
            value={filters.city}
            onChange={handleFilter}
            placeholder="e.g. Mumbai"
            className="w-full border rounded-lg p-2 mb-4 text-sm"
          />





          <label className="block text-sm font-medium mb-1">
            Max Daily Rate (₹)
          </label>


          <input
            name="maxPrice"
            type="number"
            value={filters.maxPrice}
            onChange={handleFilter}
            placeholder="e.g. 5000"
            className="w-full border rounded-lg p-2 mb-4 text-sm"
          />





          <div className="flex items-center gap-2">


            <input
              type="checkbox"
              name="helperOnly"
              checked={filters.helperOnly}
              onChange={handleFilter}
              id="helperOnly"
            />


            <label
              htmlFor="helperOnly"
              className="text-sm"
            >
              Helper available only
            </label>


          </div>





          <button

            onClick={() =>
              setFilters({
                category:'',
                machine_type:'',
                city:'',
                maxPrice:'',
                helperOnly:false
              })
            }

            className="w-full mt-4 text-sm text-blue-600 border border-blue-600 rounded-lg py-2 hover:bg-blue-50"

          >

            Clear Filters

          </button>



        </aside>







        {/* MACHINES */}


        <main className="flex-1">


          <div className="mb-4">
            <p className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${filtered.length} machine(s) found`}
            </p>
            {error && (
              <p className="text-sm text-red-500 mt-2">
                Error loading machines: {error}
              </p>
            )}
          </div>





          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">



          {
            filtered.map(m => (

              <div

                key={m.id}

                className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden flex flex-col"

              >



                <img

                  src={
                    m.images?.[0] ||
                    m.image_url ||
                    'https://placehold.co/400x250?text=No+Image'
                  }

                  alt={m.title}

                  className="h-44 w-full object-cover"

                />





                <div className="p-4 flex flex-col flex-1">


                  <p className="text-xs text-blue-600 font-medium">

                    {m.machine_type}

                  </p>



                  <h3 className="font-bold text-gray-800">

                    {m.title}

                  </h3>




                  <p className="text-sm text-gray-500 mb-2">

                    📍 {m.city}

                  </p>




                  {
                    m.helper_available && (

                      <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-1 w-fit mb-2">

                        👷 Helper available

                      </span>

                    )
                  }






                  <div className="mt-auto flex items-center justify-between pt-3">


                    <p className="font-bold text-lg">

                      ₹{m.daily_rate}

                      <span className="text-xs font-normal text-gray-500">
                        /day
                      </span>

                    </p>




                    <button

                      onClick={() =>
                        navigate(`/machine/${m.id}`)
                      }

                      className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"

                    >

                      View & Book

                    </button>



                  </div>



                </div>



              </div>

            ))
          }



          </div>





          {
            !loading &&
            filtered.length === 0 && (

              <p className="text-center text-gray-500 mt-20">

                No machines match these filters.
                Try clearing some filters.

              </p>

            )
          }



        </main>



      </div>


    </div>

  )

}