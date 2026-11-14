import { createServer } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { canonicalPaths, routeAliases } from '../src/config/site.js';
const routes = [...canonicalPaths, ...Object.keys(routeAliases), '/booking'];
const server = await createServer({ mode: 'production', server: { middlewareMode: true, hmr: false, watch: null, ws: false } });
try {
  const { renderPage } = await server.ssrLoadModule('/src/prerender.jsx');
  const template = await readFile('dist/index.html', 'utf8');
  // Only known private routes receive this shell; unknown URLs use the HTTP 404 page.
  await writeFile('dist/app.html', template.replace('</head>', '<meta name="robots" content="noindex, nofollow" /></head>'));
  async function documentFor(route) {
    const rendered = await renderPage(route);
    const metadata = [];
    const body = rendered.body.replace(/<title>[\s\S]*?<\/title>|<meta\b[^>]*\/?>|<link\b[^>]*\/?>/g, tag => { metadata.push(tag); return ''; });
    const head = metadata.length ? metadata.join('') : rendered.head;
    const shell = template.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta\s+name="description"[\s\S]*?\/>/, '');
    return shell.replace('</head>', `${head}</head>`).replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  }
  for (const route of routes) {
    const folder = route === '/' ? 'dist' : `dist${route}`;
    await mkdir(folder, { recursive: true });
    await writeFile(`${folder}/index.html`, await documentFor(route));
  }
  // Vercel serves this file with status 404 when no static file or rewrite matches.
  await writeFile('dist/404.html', await documentFor('/404.html'));
  console.log(`Prerendered ${routes.length} route documents and a noindex 404 page; account/staff data excluded.`);
} finally { await server.close(); }
