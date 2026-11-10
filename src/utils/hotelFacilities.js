export function hotelFacilities(facilities) {
  return facilities.filter(f => ['hotel', 'mixed'].includes(f.facility_type));
}
export function defaultHotelFacility(facilities) {
  const hotels = hotelFacilities(facilities);
  const hotel = hotels.find(f => f.name.toLowerCase().replace(/[^a-z]/g, '').includes('elparaiso')) || (hotels.length === 1 ? hotels[0] : null);
  return hotel ? String(hotel.id) : '';
}
