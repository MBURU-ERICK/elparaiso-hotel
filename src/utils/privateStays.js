export const privateStayMap = 'https://maps.app.goo.gl/vsrm5SShh67vWCde9';
export const asList = data => Array.isArray(data) ? data : data?.results || [];
export function unitPhotos(unit) {
  const seen = new Set();
  return (Array.isArray(unit.images) ? unit.images : []).flatMap((image, index) => {
    const url = typeof image === 'string' ? image : image?.image_url;
    if (!url || seen.has(url)) return [];
    seen.add(url);
    return [{ id: `unit-${unit.id}-${index}`, image_url: url, thumbnail_url: image?.thumbnail_url || url.replace(/(\/api\/gallery\/files\/\d+\/)full\/(?=$|[?#])/, '$1thumbnail/'),
      title: `${unit.name} · Photograph ${index + 1}`, alt_text: image?.alt_text || `${unit.name} at ${unit.property_name || 'Elparaiso'}`, category: 'Private stays', description: '' }];
  });
}
export function unitBookingUrl(unit) {
  return `/booking?${new URLSearchParams({ service: 'airbnb', unit: unit.id, ...(unit.facility ? { facility: unit.facility } : {}), ...(unit.max_guests === 1 ? { adults: '1' } : {}) })}`;
}
export function stayRate(rate) {
  const amount = Number(rate);
  return Number.isFinite(amount) && amount > 0 ? `KES ${amount.toLocaleString('en-KE', { maximumFractionDigits: 2 })}` : null;
}
