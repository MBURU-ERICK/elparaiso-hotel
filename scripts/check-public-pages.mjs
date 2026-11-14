import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { canonicalPaths, routeAliases, canonicalUrl, site } from '../src/config/site.js';
const titles = new Set();
const publicPaths = new Set([...canonicalPaths, ...Object.keys(routeAliases), '/booking', '/review']);
const schemasFor = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match => { const data = JSON.parse(match[1]); return data['@graph'] || [data]; });
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
for (const route of canonicalPaths) {
  const html = await readFile(`dist${route === '/' ? '' : route}/index.html`, 'utf8');
  const head = html.split('</head>')[0];
  const title = head.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title), `${route}: missing or duplicate title`); titles.add(title);
  assert.equal((head.match(/<title>/g) || []).length, 1);
  assert.equal((head.match(/name="description"/g) || []).length, 1);
  assert.equal((head.match(/rel="canonical"/g) || []).length, 1);
  assert.ok(head.includes(`rel="canonical" href="${canonicalUrl(route)}"`), `${route}: incorrect canonical`);
  assert.match(head, /<meta name="description" content="[^"]+"/);
  assert.match(head, /content="index, follow, max-image-preview:large"/);
  assert.ok(head.includes(`property="og:url" content="${canonicalUrl(route)}"`));
  assert.match(head, /name="twitter:card" content="summary_large_image"/);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${route}: expected one H1`);
  assert.match(html, /<main(?:\s|>)/);
  assert.ok(!html.includes('https://www.elparaisohotelltd.com'), `${route}: stale www URL`);
  const schemas = schemasFor(html);
  assert.equal((html.match(/<script type="application\/ld\+json">/g) || []).length, 1, `${route}: duplicate structured data`);
  assert.ok(schemas.some(s => s['@type'] === 'Hotel' && s['@id'] === `${site.origin}/#hotel`));
  assert.ok(schemas.some(s => s['@type'] === 'WebSite' && s.url === `${site.origin}/`));
  assert.ok(!schemas.some(s => s.aggregateRating || s.review), 'No fabricated ratings or reviews');
  if (route !== '/') assert.ok(schemas.some(s => s['@type'] === 'BreadcrumbList'));
  for (const match of html.matchAll(/<a\b[^>]*href="([^" ]*)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    const link = new URL(value, `${site.origin}${route}`);
    if (link.origin !== site.origin || link.pathname.startsWith('/staff/')) continue;
    assert.ok(publicPaths.has(link.pathname), `${route}: unknown destination ${link.pathname}`);
    assert.ok(!routeAliases[link.pathname], `${route}: link uses a redirect alias ${link.pathname}`);
    if (link.pathname === '/booking' && link.searchParams.has('service')) assert.ok(['hotel', 'airbnb', 'conference', 'event'].includes(link.searchParams.get('service')));
    if (link.hash && link.pathname === route) assert.ok(html.includes(`id="${link.hash.slice(1)}"`), `${route}: broken fragment ${link.hash}`);
  }
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    assert.ok(attr(tag, 'alt') !== undefined, `${route}: image missing alt`);
    const src = attr(tag, 'src');
    if (src?.startsWith('/')) await access(`dist${decodeURIComponent(src)}`);
  }
  assert.ok(!html.includes('alice@example.test'));
}
for (const [alias, preferred] of Object.entries(routeAliases)) {
  const html = await readFile(`dist${alias}/index.html`, 'utf8');
  assert.ok(html.includes(`rel="canonical" href="${canonicalUrl(preferred)}"`));
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]).sort(), canonicalPaths.map(canonicalUrl).sort());
assert.match(await readFile('dist/robots.txt', 'utf8'), /Sitemap: https:\/\/elparaisohotelltd.com\/sitemap.xml/);
const restaurant = schemasFor(await readFile('dist/restaurant/index.html', 'utf8'));
assert.ok(restaurant.some(s => s['@type'] === 'Restaurant'));
const booking = await readFile('dist/booking/index.html', 'utf8');
assert.match(booking, /When can we welcome you/);
assert.match(booking, /noindex, nofollow/);
assert.ok(booking.includes(`href="${canonicalUrl('/booking')}"`));
const missing = await readFile('dist/404.html', 'utf8');
assert.match(missing, /Page not found/);
assert.match(missing, /noindex, nofollow/);
assert.ok(!missing.includes('rel="canonical"'));
const shell = await readFile('dist/app.html', 'utf8');
assert.match(shell, /noindex, nofollow/);
assert.ok(shell.includes('<div id="root"></div>'));
await assert.rejects(access('dist/account')); await assert.rejects(access('dist/staff'));
assert.ok(!(await readFile('dist/index.html', 'utf8')).includes('TESTIMONIAL PLACEHOLDER'));
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
assert.ok(!config.rewrites.some(rule => rule.source.includes('?!api')), 'Unknown URLs must not receive the SPA shell');
assert.ok(config.redirects.some(rule => rule.has?.some(h => h.value === 'www.elparaisohotelltd.com') && rule.destination === `${site.origin}/:path*` && rule.permanent));
for (const [alias, target] of Object.entries(routeAliases)) assert.ok(config.redirects.some(rule => rule.source === alias && rule.destination === target && rule.permanent));
console.log(`SEO verified: ${canonicalPaths.length} canonical pages, 3 aliases, exact sitemap, metadata in head, single schema graph, headings, internal links, image alt/local assets, noindex booking/private shell, 404 document and redirect configuration.`);
