// Public business identity only. Do not add unverified ratings, hours or coordinates.
export const site = {
  origin: 'https://elparaisohotelltd.com',
  name: 'Elparaiso Hotel',
  alternateName: 'Elparaiso Hotel & Restaurant',
  email: 'elparaisohotelltd@gmail.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Rumuruti', addressRegion: 'Laikipia County', addressCountry: 'KE' },
  map: 'https://www.google.com/maps/search/?api=1&query=Elparaiso+Hotel+Rumuruti+Kenya',
};
export const canonicalPaths = ['/', '/rooms', '/private-stays', '/restaurant', '/experiences', '/events-groups', '/conferences', '/about', '/contact', '/gallery', '/conference-meals'];
export const routeAliases = { '/airbnb': '/private-stays', '/events': '/events-groups', '/business': '/conferences' };
export function canonicalUrl(path = '/') {
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return `${site.origin}${routeAliases[clean] || clean}`;
}
export const jsonLd = value => JSON.stringify(value).replace(/</g, '\\u003c');
