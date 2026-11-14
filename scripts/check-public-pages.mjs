import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const routes = ['/', '/rooms', '/restaurant', '/experiences', '/about', '/gallery', '/contact', '/business', '/events', '/airbnb', '/conference-meals'];
const titles = new Set();
for (const route of routes) {
  const html = await readFile(`dist${route === '/' ? '' : route}/index.html`, 'utf8');
  const head = html.split('</head>')[0];
  const title = head.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title, `${route}: missing title in head`);
  assert.ok(!titles.has(title), `${route}: duplicate title`); titles.add(title);
  assert.match(head, /<meta name="description" content="[^"]+"/);
  assert.match(head, /<link rel="canonical" href="https:\/\//);
  assert.match(head, /content="index, follow"/);
  assert.match(html, /<h1/);
  const publicPaths = new Set([...routes, '/private-stays', '/events-groups', '/conferences', '/airbnb', '/booking', '/conference-meals', '/review']);
  for (const match of html.matchAll(/<a\b[^>]*href="(\/[^" ]*)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    const link = new URL(value, 'https://hotel.example.test');
    if (link.pathname.startsWith('/assets/') || link.pathname.startsWith('/staff/')) continue;
    assert.ok(publicPaths.has(link.pathname), `${route}: unknown public destination ${link.pathname}`);
    if (link.pathname === '/booking' && link.searchParams.has('service')) {
      assert.ok(['hotel', 'airbnb', 'conference', 'event'].includes(link.searchParams.get('service')), `${route}: invalid booking experience`);
    }
  }
  assert.ok(!html.includes('alice@example.test'), 'Customer fixture must not appear in public HTML');
}
assert.match(await readFile('dist/index.html', 'utf8'), /application\/ld\+json/);
assert.ok((await readFile('dist/app.html', 'utf8')).includes('<div id="root"></div>'), 'Private routes must receive an empty shell for client rendering');
await assert.rejects(access('dist/account'));
await assert.rejects(access('dist/staff'));
console.log('SEO output verified: 11 distinct public pages, metadata in head, visible content, Hotel structured data, no customer/staff prerendering.');

for (const route of ['/private-stays', '/events-groups', '/conferences']) {
  const html = await readFile(`dist${route}/index.html`, 'utf8');
  assert.match(html, /<h1/);
  assert.ok(html.includes(`href="https://www.elparaisohotelltd.com${route}"`), `${route}: canonical missing`);
}
console.log('Three new public routes verified with primary-domain canonical URLs.');
const restaurant = await readFile('dist/restaurant/index.html', 'utf8');
const schemas = [...restaurant.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
assert.ok(schemas.some(schema => schema['@type'] === 'Restaurant'), 'Restaurant schema missing');
assert.ok(schemas.some(schema => schema['@type'] === 'BreadcrumbList'), 'Breadcrumbs missing');
assert.match(restaurant, /property="og:image" content="https:\/\/www.elparaisohotelltd.com\/images\/restaurant-dining.jpg"/);
console.log('Restaurant schema, breadcrumbs and photographic sharing image verified.');

const booking = await readFile('dist/booking/index.html', 'utf8');
assert.match(booking, /When can we welcome you/);
assert.match(booking, /noindex, nofollow/);
assert.match(booking, /https:\/\/www.elparaisohotelltd.com\/booking/);
assert.ok(!(await readFile('dist/index.html', 'utf8')).includes('TESTIMONIAL PLACEHOLDER'));
console.log('Booking has visible initial content, canonical metadata and noindex; testimonial placeholder removed.');
