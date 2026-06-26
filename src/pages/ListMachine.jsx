import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { MACHINE_CATEGORIES } from '../data/machineCategories'
import { useToast } from '../components/Toast'

export default function ListMachine() {

  const navigate = useNavigate()
  const { showToast } = useToast()

  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    category: '',
    machine_type: '',
    title: '',
    description: '',
    hourly_rate: '',
    daily_rate: '',
    city: '',
    helper_available: false,
    helper_charge: ''
  })


  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked
    } = e.target

    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    })
  }



  const handleSubmit = async () => {

    setError('')


    if (
      !form.category ||
      !form.machine_type ||
      !form.title ||
      !form.daily_rate ||
      !form.city
    ) {

      showToast(
        'Please fill category, machine type, title, daily rate and city.',
        'error'
      )

      return
    }



    setLoading(true)


    try {


      const {
        data: { user }
      } = await supabase.auth.getUser()



      // upload images

      const imageUrls = []


      for (const file of files) {

        const path =
          `${user.id}/${Date.now()}-${file.name}`


        const {
          error: upErr
        } = await supabase.storage
          .from('machine-images')
          .upload(path, file)


        if (upErr) throw upErr



        const {
          data
        } =
        supabase.storage
          .from('machine-images')
          .getPublicUrl(path)


        imageUrls.push(data.publicUrl)

      }





      // insert machine

      const {
        error: insErr
      } =
      await supabase
        .from('machines')
        .insert({

          owner_id: user.id,

          category: form.category,

          machine_type: form.machine_type,

          title: form.title,

          description: form.description,

          images: imageUrls,

          hourly_rate: form.hourly_rate || null,

          daily_rate: form.daily_rate,

          city: form.city,

          helper_available: form.helper_available,

          helper_charge:
            form.helper_available
              ? form.helper_charge || 0
              : 0,

          status: 'active'
        })



      if (insErr) throw insErr



      showToast(
        'Machine listed successfully! 🎉',
        'success'
      )


      navigate('/home')



    } catch (err) {


      showToast(
        err.message,
        'error'
      )

    }


    setLoading(false)

  }





  return (

    <div className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">


        <h1 className="text-2xl font-bold mb-6">
          List Your Machine
        </h1>



        <label className="block text-sm font-medium mb-1">
          Category *
        </label>


        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 mb-4"
        >

          <option value="">
            Select category
          </option>


          {Object.keys(MACHINE_CATEGORIES)
            .map(cat => (

              <option key={cat} value={cat}>
                {cat}
              </option>

            ))}

        </select>




        <label className="block text-sm font-medium mb-1">
          Machine Type *
        </label>


        <select

          name="machine_type"

          value={form.machine_type}

          onChange={handleChange}

          disabled={!form.category}

          className="w-full border rounded-lg p-3 mb-4"

        >

          <option value="">
            Select machine type
          </option>


          {form.category &&
            MACHINE_CATEGORIES[form.category]
              .map(m => (

                <option key={m} value={m}>
                  {m}
                </option>

              ))}

        </select>




        <label className="block text-sm font-medium mb-1">
          Listing Title *
        </label>


        <input

          name="title"

          placeholder="e.g. 3-Axis CNC Milling Machine - VMC 850"

          onChange={handleChange}

          className="w-full border rounded-lg p-3 mb-4"

        />



        <label className="block text-sm font-medium mb-1">
          Description
        </label>


        <textarea

          name="description"

          rows="3"

          placeholder="Specs, capacity, condition, brand..."

          onChange={handleChange}

          className="w-full border rounded-lg p-3 mb-4"

        />




        <div className="grid grid-cols-2 gap-4 mb-4">


          <div>

            <label className="block text-sm font-medium mb-1">
              Hourly Rate (₹)
            </label>


            <input

              name="hourly_rate"

              type="number"

              onChange={handleChange}

              className="w-full border rounded-lg p-3"

            />

          </div>



          <div>

            <label className="block text-sm font-medium mb-1">
              Daily Rate (₹) *
            </label>


            <input

              name="daily_rate"

              type="number"

              onChange={handleChange}

              className="w-full border rounded-lg p-3"

            />

          </div>


        </div>




        <label className="block text-sm font-medium mb-1">
          City *
        </label>


        <input

          name="city"

          placeholder="e.g. Mumbai"

          onChange={handleChange}

          className="w-full border rounded-lg p-3 mb-4"

        />




        <div className="flex items-center gap-2 mb-2">


          <input

            type="checkbox"

            name="helper_available"

            checked={form.helper_available}

            onChange={handleChange}

            id="helper"

          />


          <label
            htmlFor="helper"
            className="text-sm font-medium"
          >
            Operator/Helper available with this machine
          </label>


        </div>



        {form.helper_available && (

          <input

            name="helper_charge"

            type="number"

            placeholder="Helper charge per day (₹)"

            onChange={handleChange}

            className="w-full border rounded-lg p-3 mb-4"

          />

        )}





        <label className="block text-sm font-medium mb-1 mt-2">
          Machine Photos
        </label>


        <input

          type="file"

          multiple

          accept="image/*"

          onChange={(e)=>setFiles([...e.target.files])}

          className="w-full border rounded-lg p-3 mb-4"

        />



        {files.length > 0 && (

          <p className="text-sm text-gray-500 mb-4">

            {files.length} photo(s) selected

          </p>

        )}




        <button

          onClick={handleSubmit}

          disabled={loading}

          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"

        >

          {loading ? 'Listing...' : 'List Machine'}

        </button>



      </div>

    </div>

  )

}