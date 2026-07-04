import emailjs from '@emailjs/browser'

const SERVICE = import.meta.env.VITE_EMAILJS_SERVICE_ID
const KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID  // the one generic template

async function send(to_email, subject, message) {
  try {
    await emailjs.send(SERVICE, TEMPLATE, { to_email, subject, message }, KEY)
    return true
  } catch (e) { console.error('Email failed:', e); return false }
}

// 1. to renter — request received
export async function sendBookingEmail(d) {
  const msg = `Hi ${d.renter_name},

Your booking request has been received!

Machine: ${d.machine_title}
Dates: ${d.start_date} to ${d.end_date}
Duration: ${d.days} day(s)
Total: Rs ${d.total_amount}
Helper: ${d.helper_needed ? 'Yes' : 'No'}

The owner will confirm shortly.`
  return send(d.renter_email, `Booking Request Received - ${d.machine_title}`, msg)
}

// 2. to owner — new request
export async function sendOwnerEmail(d) {
  const msg = `Hi ${d.owner_name},

You have a new booking request!

Machine: ${d.machine_title}
Requested by: ${d.renter_name} (${d.renter_mobile})
Dates: ${d.start_date} to ${d.end_date}
Total: Rs ${d.total_amount}
Helper requested: ${d.helper_needed ? 'Yes' : 'No'}

Review it here: ${import.meta.env.VITE_APP_URL}/home`
  return send(d.owner_email, `New Booking Request - ${d.machine_title}`, msg)
}

// 3. to renter — confirmed
export async function sendConfirmedEmail(d) {
  const msg = `Hi ${d.renter_name},

Great news! Your booking has been CONFIRMED.

Machine: ${d.machine_title}
Dates: ${d.start_date} to ${d.end_date}
Total: Rs ${d.total_amount}

Owner contact: ${d.owner_name} - ${d.owner_mobile}`
  return send(d.renter_email, `Booking Confirmed - ${d.machine_title}`, msg)
}

// 4. to renter — declined
export async function sendRejectedEmail(d) {
  const msg = `Hi ${d.renter_name},

Unfortunately, the owner could not confirm your booking for:

Machine: ${d.machine_title}
Dates: ${d.start_date} to ${d.end_date}

Please try other machines or different dates.`
  return send(d.renter_email, `Update on your booking - ${d.machine_title}`, msg)
}