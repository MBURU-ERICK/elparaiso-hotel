import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const routes = ['/', '/rooms', '/restaurant', '/experiences', '/about', '/gallery', '/contact', '/business'];
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
  assert.ok(!html.includes('alice@example.test'), 'Customer fixture must not appear in public HTML');
}
assert.match(await readFile('dist/index.html', 'utf8'), /application\/ld\+json/);
assert.ok((await readFile('dist/app.html', 'utf8')).includes('<div id="root"></div>'), 'Private routes must receive an empty shell for client rendering');
await assert.rejects(access('dist/account'));
await assert.rejects(access('dist/staff'));
console.log('SEO output verified: 8 distinct public pages, metadata in head, visible content, Hotel structured data, no customer/staff prerendering.');
