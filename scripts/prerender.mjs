import { createServer } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const routes = ['/', '/rooms', '/restaurant', '/experiences', '/about', '/gallery', '/contact', '/business'];
const server = await createServer({ mode: 'production', server: { middlewareMode: true, hmr: false, watch: null, ws: false } });
try {
  const { renderPage } = await server.ssrLoadModule('/src/prerender.jsx');
  const template = await readFile('dist/index.html', 'utf8');
  // Private and unknown routes get an empty app shell, not homepage markup.
  await writeFile('dist/app.html', template);
  for (const route of routes) {
    const rendered = await renderPage(route);
    // React 19 emits document metadata ahead of the component fragment. Place
    // it in the actual document head for crawlers and social link previews.
    const metadata = [];
    const body = rendered.body.replace(/<title>[\s\S]*?<\/title>|<meta\b[^>]*\/?>|<link\b[^>]*\/?>/g, tag => { metadata.push(tag); return ''; });
    const head = metadata.length ? metadata.join('') : rendered.head;
    const shell = template.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta\s+name="description"[\s\S]*?\/>/, '');
    const html = shell.replace('</head>', `${head}</head>`).replace('<div id="root"></div>', `<div id="root">${body}</div>`);
    const folder = route === '/' ? 'dist' : `dist${route}`;
    await mkdir(folder, { recursive: true });
    await writeFile(`${folder}/index.html`, html);
  }
  console.log(`Prerendered ${routes.length} public pages. Customer and staff content excluded.`);
} finally { await server.close(); }
