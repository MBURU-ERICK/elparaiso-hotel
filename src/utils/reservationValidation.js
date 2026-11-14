import { stayNights } from './bookingQuote.js';
export function validateStaySearch(form, today) {
  const errors = {};
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!validDate(form.start_date) || form.start_date < today) errors.start_date = 'Choose today or a future arrival date.';
  if (!validDate(form.end_date) || !stayNights(form.start_date, form.end_date)) errors.end_date = 'Departure must be after arrival.';
  if (!Number.isInteger(Number(form.guests)) || Number(form.guests) < 1 || Number(form.guests) > 100) errors.guests = 'Choose between 1 and 100 adults.';
  if (!String(form.children ?? '').trim() || !Number.isInteger(Number(form.children)) || Number(form.children) < 0 || Number(form.children) > 100) errors.children = 'Choose between 0 and 100 children.';
  if (!Number.isInteger(Number(form.requested_rooms)) || Number(form.requested_rooms) < 1 || Number(form.requested_rooms) > 100) errors.requested_rooms = 'Choose between 1 and 100 rooms.';
  return errors;
}
export function validateGuestDetails(guest, companyBooking = false) {
  const errors = {};
  if (!guest.first.trim()) errors.first = 'Enter your first name.';
  if (!guest.last.trim()) errors.last = 'Enter your surname.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim())) errors.email = 'Enter a valid email address.';
  const digits = guest.phone.replace(/\D/g, '');
  if (!/^\+?[\d\s()-]+$/.test(guest.phone.trim()) || digits.length < 7 || digits.length > 15) errors.phone = 'Enter a phone number with 7–15 digits, including country code where possible.';
  if (companyBooking && !guest.company.trim()) errors.company = 'Enter your company name.';
  return errors;
}
