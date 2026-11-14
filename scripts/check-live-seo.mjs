// Read-only deployment verification. It never submits indexing or changes hosting.
import assert from 'node:assert/strict';
import { site, canonicalPaths, canonicalUrl, routeAliases } from '../src/config/site.js';
let failures = 0;
async function check(label, run) {
  try { await run(); console.log(`PASS ${label}`); }
  catch (error) { failures++; console.error(`FAIL ${label}: ${error.message}`); }
}
const get = url => fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Elparaiso-SEO-Verification/1.0' } });
for (const path of canonicalPaths) await check(path, async () => {
  const response = await get(canonicalUrl(path));
  assert.equal(response.status, 200, `expected 200, got ${response.status}; location=${response.headers.get('location')}`);
  assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag') || ''));
  const html = await response.text();
  const head = html.split('</head>')[0];
  assert.ok(head.includes(`rel="canonical" href="${canonicalUrl(path)}"`), 'canonical missing or incorrect');
  assert.ok(!/name="robots" content="[^"]*noindex/.test(head), 'public page is noindex');
  assert.match(head, /<title>.+<\/title>/);
  assert.match(html, /<h1(?:\s|>)/);
});
await check('HTTP redirects to canonical HTTPS', async () => {
  const response = await get('http://elparaisohotelltd.com/rooms?seo_check=1');
  assert.ok([301, 308].includes(response.status));
  assert.equal(new URL(response.headers.get('location'), site.origin).href, `${site.origin}/rooms?seo_check=1`);
});
await check('www redirects to apex and preserves path/query', async () => {
  const response = await get('https://www.elparaisohotelltd.com/rooms?seo_check=1');
  assert.ok([301, 308].includes(response.status), `expected permanent redirect, got ${response.status}`);
  assert.equal(new URL(response.headers.get('location'), 'https://www.elparaisohotelltd.com').href, `${site.origin}/rooms?seo_check=1`);
});
for (const [alias, path] of Object.entries(routeAliases)) await check(`alias ${alias}`, async () => {
  const response = await get(`${site.origin}${alias}?seo_check=1`);
  assert.ok([301, 308].includes(response.status));
  assert.equal(new URL(response.headers.get('location'), site.origin).href, `${site.origin}${path}?seo_check=1`);
});
await check('genuine HTTP 404', async () => {
  const response = await get(`${site.origin}/seo-verification-missing-page`);
  assert.equal(response.status, 404);
  assert.match(await response.text(), /Page not found/);
});
await check('robots sitemap location', async () => {
  const response = await get(`${site.origin}/robots.txt`); assert.equal(response.status, 200);
  assert.ok((await response.text()).includes(`Sitemap: ${site.origin}/sitemap.xml`));
});
await check('sitemap contains exactly the canonical public pages', async () => {
  const response = await get(`${site.origin}/sitemap.xml`); assert.equal(response.status, 200);
  const xml = await response.text();
  assert.deepEqual([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]).sort(), canonicalPaths.map(canonicalUrl).sort());
});
await check('booking stays noindex', async () => {
  const response = await get(`${site.origin}/booking`); assert.equal(response.status, 200);
  assert.match(await response.text(), /noindex/);
});
if (failures) { console.error(`${failures} live SEO checks failed. This script does not deploy or repair hosting settings.`); process.exitCode = 1; }
