import { todayInNairobi } from './stayDates.js';

export function isCurrentEvent(event, today = todayInNairobi()) {
  const lastDate = event.end_date || event.start_date;
  if (!lastDate) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastDate)) return false;
  const date = new Date(`${lastDate}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== lastDate) return false;
  return lastDate >= today;
}

export function requestIsExpired(request, today = todayInNairobi()) {
  if (['new', 'responded'].includes(request.status)) return request.is_expired === true || !!request.start_date && request.start_date < today;
  if (request.status === 'confirmed') return request.is_expired === true || !!request.end_date && request.end_date < today;
  return false;
}
