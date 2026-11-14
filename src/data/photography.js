// Published hotel gallery photographs verified against the public API, 14 November 2026.
// Only photography is seeded: accommodation, rates and availability always remain live.
const asset = (id, alt_text) => ({ image_url: `https://api.elparaisohotelltd.com/api/gallery/files/${id}/full/`, thumbnail_url: `https://api.elparaisohotelltd.com/api/gallery/files/${id}/thumbnail/`, alt_text });
export const photography = {
  general: asset(9, 'Garden seating at Elparaiso'),
  rooms: asset(10, 'Accommodation at Elparaiso Hotel'),
  restaurant: asset(2, 'Restaurant and lounge at Elparaiso'),
  garden: asset(8, 'The Elparaiso garden gazebo in the evening'),
  experiences: asset(6, 'Children’s play area at Elparaiso'),
  airbnb: asset(4, 'Private stay sitting room at Elparaiso'),
  conference: asset(13, 'Conference hall at Elparaiso Hotel'),
  celebrations: asset(15, 'Conference and wedding setup at Elparaiso'),
};
