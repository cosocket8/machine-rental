import emailjs from '@emailjs/browser'

const SERVICE = import.meta.env.VITE_EMAILJS_SERVICE_ID
const KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// 1. to renter — request received
export async function sendBookingEmail(d) {
  try {
    await emailjs.send(SERVICE, import.meta.env.VITE_EMAILJS_TEMPLATE_ID, {
      renter_name: d.renter_name, renter_email: d.renter_email,
      machine_title: d.machine_title, start_date: d.start_date, end_date: d.end_date,
      days: d.days, total_amount: d.total_amount, helper: d.helper_needed ? 'Yes' : 'No',
    }, KEY)
    return true
  } catch (e) { console.error('Renter email failed:', e); return false }
}

// 2. to owner — new request
export async function sendOwnerEmail(d) {
  try {
    await emailjs.send(SERVICE, import.meta.env.VITE_EMAILJS_TEMPLATE_OWNER, {
      owner_name: d.owner_name, owner_email: d.owner_email,
      machine_title: d.machine_title, renter_name: d.renter_name, renter_mobile: d.renter_mobile,
      start_date: d.start_date, end_date: d.end_date, days: d.days,
      total_amount: d.total_amount, helper: d.helper_needed ? 'Yes' : 'No',
    }, KEY)
    return true
  } catch (e) { console.error('Owner email failed:', e); return false }
}

// 3. to renter — confirmed
export async function sendConfirmedEmail(d) {
  try {
    await emailjs.send(SERVICE, import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRMED, {
      renter_name: d.renter_name, renter_email: d.renter_email,
      machine_title: d.machine_title, start_date: d.start_date, end_date: d.end_date,
      total_amount: d.total_amount, owner_name: d.owner_name, owner_mobile: d.owner_mobile,
    }, KEY)
    return true
  } catch (e) { console.error('Confirmed email failed:', e); return false }
}

// 4. to renter — declined
export async function sendRejectedEmail(d) {
  try {
    await emailjs.send(SERVICE, import.meta.env.VITE_EMAILJS_TEMPLATE_REJECTED, {
      renter_name: d.renter_name, renter_email: d.renter_email,
      machine_title: d.machine_title, start_date: d.start_date, end_date: d.end_date,
    }, KEY)
    return true
  } catch (e) { console.error('Rejected email failed:', e); return false }
}