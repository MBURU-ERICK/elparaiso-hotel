import { routeAliases } from '../src/config/site.js';
// Include only the route being rendered, never all other pages or optional dialogs.
const routeModules = {
  '/rooms': 'src/pages/Rooms.jsx', '/restaurant': 'src/pages/Restaurant.jsx',
  '/experiences': 'src/pages/Experiences.jsx', '/about': 'src/pages/About.jsx',
  '/gallery': 'src/pages/Gallery.jsx', '/contact': 'src/pages/Contact.jsx',
  '/private-stays': 'src/pages/PrivateStays.jsx', '/events-groups': 'src/pages/Events.jsx',
  '/conferences': 'src/pages/Business.jsx', '/conference-meals': 'src/pages/MealQuotation.jsx',
  '/booking': 'src/pages/StayBooking.jsx',
};
export function routeAssetTags(route, manifest, template) {
  const entry = routeModules[routeAliases[route] || route];
  if (!entry || !manifest[entry]) return '';
  const files = new Set();
  const visited = new Set();
  function visit(key) {
    if (visited.has(key)) return;
    visited.add(key);
    const chunk = manifest[key];
    if (!chunk) throw new Error(`Missing route asset in manifest: ${key}`);
    files.add(chunk.file);
    for (const css of chunk.css || []) files.add(css);
    for (const dependency of chunk.imports || []) visit(dependency);
  }
  visit(entry);
  return [...files].filter(file => !template.includes(`"/${file}"`)).map(file => file.endsWith('.css')
    ? `<link rel="stylesheet" crossorigin href="/${file}">`
    : file.endsWith('.js') ? `<link rel="modulepreload" crossorigin href="/${file}">` : '').join('');
}
