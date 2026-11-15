import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProductionApiOrigin } from '../scripts/release-config.mjs';

test('production API configuration accepts the real HTTPS origin', () => {
  assert.equal(validateProductionApiOrigin(' https://api.elparaisohotelltd.com/ '), 'https://api.elparaisohotelltd.com');
});
test('missing or development API settings cannot silently ship to production', () => {
  for (const value of ['', undefined, 'http://127.0.0.1:8000', 'https://localhost', '/api', 'https://user:password@api.example.test', 'https://api.example.test/api', 'https://api.example.test?key=secret', 'https://api.example.test#hash']) {
    assert.throws(() => validateProductionApiOrigin(value), value);
  }
});

const { analyticsPath, allowsAnalytics } = await import('../src/analytics/privacy.js');
test('analytics excludes private routes and only records normalized public paths', () => {
  assert.equal(analyticsPath('/staff/admin'), null);
  assert.equal(analyticsPath('/account/profile'), null);
  assert.equal(analyticsPath('/review'), null);
  assert.equal(analyticsPath('/booking?email=private@example.test'), null);
  assert.equal(analyticsPath('/airbnb/'), '/private-stays');
  assert.equal(analyticsPath('/booking'), '/booking');
});
test('analytics respects browser privacy preferences without visitor identifiers', () => {
  assert.equal(allowsAnalytics({ navigator: { doNotTrack: '1' } }), false);
  assert.equal(allowsAnalytics({ navigator: { globalPrivacyControl: true } }), false);
  assert.equal(allowsAnalytics({ navigator: {} }), true);
});

const { documentAssets, assetContentType } = await import('../scripts/asset-references.mjs');
test('asset checks include modulepreload chunks as well as CSS and entry scripts', () => {
  const paths = documentAssets(`<link crossorigin href="/assets/shared-123.js" rel="modulepreload"><link rel='stylesheet' href='/assets/viewer-456.css'><script type="module" src="/assets/main-789.js"></script><link rel="stylesheet" href="https://fonts.example.test/font.css">`);
  assert.deepEqual(paths, ['/assets/shared-123.js', '/assets/viewer-456.css', '/assets/main-789.js']);
  assert.match('text/css; charset=utf-8', assetContentType(paths[1]));
  assert.doesNotMatch('text/html', assetContentType(paths[1]));
});

test('release validation rejects omitted chunks and HTML masquerading as CSS', async () => {
  const { mkdtemp, mkdir, writeFile, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { checkBuildAssets } = await import('../scripts/check-build-assets.mjs');
  const folder = await mkdtemp(join(tmpdir(), 'elparaiso-assets-'));
  try {
    await mkdir(join(folder, '.vite')); await mkdir(join(folder, 'assets'));
    await writeFile(join(folder, '.vite/manifest.json'), JSON.stringify({
      'index.html': { file: 'assets/main.js', isEntry: true, imports: ['shared'], css: ['assets/main.css'] },
      shared: { file: 'assets/shared.js' },
    }));
    await writeFile(join(folder, 'index.html'), '<script src="/assets/main.js"></script><link href="/assets/shared.js" rel="modulepreload"><link rel="stylesheet" href="/assets/main.css">');
    await writeFile(join(folder, 'assets/main.js'), 'import "./shared.js";');
    await writeFile(join(folder, 'assets/main.css'), 'body{color:black}');
    await assert.rejects(checkBuildAssets(folder), /Missing build asset: assets\/shared.js/);
    await writeFile(join(folder, 'assets/shared.js'), 'export const ready=true;');
    assert.equal((await checkBuildAssets(folder)).assets, 3);
    await writeFile(join(folder, 'assets/main.css'), '<!doctype html><html>Not found</html>');
    await assert.rejects(checkBuildAssets(folder), /HTML was written in place of an asset/);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

test('hosting publishes the complete dist output and revalidates HTML while caching hashed assets', async () => {
  const { readFile } = await import('node:fs/promises');
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));
  assert.equal(config.outputDirectory, 'dist');
  assert.equal(config.buildCommand, 'npm run build');
  assert.ok(config.headers.find(rule => rule.source === '/(.*)').headers.some(header => header.key === 'Cache-Control' && header.value.includes('must-revalidate')));
  assert.ok(config.headers.find(rule => rule.source === '/assets/:path*').headers.some(header => header.key === 'Cache-Control' && header.value.includes('immutable')));
});
