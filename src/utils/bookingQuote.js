export function stayNights(arrival, departure) {
  const days = (Date.parse(`${departure}T12:00:00Z`) - Date.parse(`${arrival}T12:00:00Z`)) / 86400000;
  return Number.isInteger(days) && days > 0 ? days : 0;
}
export function estimateBooking(form, options) {
  if (form.service === 'event') return null;
  const guests = Number(form.guests), occupancy = Number(form.occupancy);
  if (!Number.isInteger(guests) || guests < 1 || ![1, 2].includes(occupancy)) return null;
  const lines = [];
  const add = (description, quantity, price, basis) => {
    const cents = Math.round(Number(price) * 100);
    lines.push({ description, quantity, unit_price: (cents / 100).toFixed(2), total: (quantity * cents / 100).toFixed(2), basis });
  };
  function roomLine(room, count, arrival, departure) {
    if (!room || occupancy > room.max_occupancy) return false;
    const rate = occupancy === 2 ? room.double_occupancy_rate : room.nightly_rate;
    const nights = stayNights(arrival, departure), rooms = Math.ceil(count / occupancy);
    if (!nights || !rate || Number(rate) <= 0) return false;
    add(`${room.name} · ${occupancy} person(s) per room`, rooms * nights, rate, `${count} guests · ${rooms} rooms × ${nights} nights`);
    return true;
  }
  if (form.service === 'hotel') {
    if (!roomLine(options.rooms.find(r => String(r.id) === form.room_type && String(r.facility) === form.facility), guests, form.start_date, form.end_date)) return null;
  } else if (form.service === 'airbnb') {
    const unit = options.units.find(u => String(u.id) === form.unit && String(u.facility) === form.facility);
    const nights = stayNights(form.start_date, form.end_date);
    if (!unit || guests > unit.max_guests || !nights) return null;
    add(unit.name, nights, unit.nightly_rate, `${guests} guests · 1 unit × ${nights} nights`);
  } else {
    const pkg = options.packages.find(p => String(p.id) === form.package && String(p.facility) === form.facility);
    const days = form.end_date === form.start_date && form.start_date ? 1 : stayNights(form.start_date, form.end_date) + 1;
    if (!pkg || !form.start_date || !form.end_date || form.end_date < form.start_date) return null;
    add(`${pkg.duration === 'full' ? 'Full' : 'Half'} day conference`, guests * days, pkg.price_per_guest, `${guests} guests × ${days} day(s)`);
    if (form.add_accommodation) {
      const count = Number(form.accommodation_guests);
      if (!Number.isInteger(count) || count < 1 || count > guests || !roomLine(options.rooms.find(r => String(r.id) === form.room_type), count, form.accommodation_check_in, form.accommodation_check_out)) return null;
    }
  }
  return { currency: 'KES', lines, total: (lines.reduce((sum, l) => sum + Math.round(Number(l.total) * 100), 0) / 100).toFixed(2) };
}
