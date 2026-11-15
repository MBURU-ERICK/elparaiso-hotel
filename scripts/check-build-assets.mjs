import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { documentAssets } from './asset-references.mjs';

export async function checkBuildAssets(directory = 'dist') {
  const root = resolve(directory);
  const manifest = JSON.parse(await readFile(resolve(root, '.vite/manifest.json'), 'utf8'));
  assert.ok(Object.values(manifest).some(entry => entry.isEntry), 'Build manifest has no entry point');
  const checked = new Set();
  async function checkFile(path) {
    const file = resolve(root, path);
    const local = relative(root, file);
    assert.ok(local && !local.startsWith(`..${sep}`) && local !== '..', `Asset escapes build directory: ${path}`);
    if (checked.has(file)) return;
    let info;
    try { info = await stat(file); } catch { throw new Error(`Missing build asset: ${path}. Publish the complete dist directory from one build.`); }
    assert.ok(info.isFile() && info.size > 0, `Empty or invalid build asset: ${path}`);
    if (/\.(?:css|js)$/.test(file)) {
      const text = await readFile(file, 'utf8');
      assert.ok(!/^\s*(?:<!doctype\s+html|<html\b)/i.test(text), `HTML was written in place of an asset: ${path}`);
    }
    checked.add(file);
  }
  for (const [key, entry] of Object.entries(manifest)) {
    assert.equal(typeof entry.file, 'string', `Manifest entry ${key} is missing a file`);
    for (const path of [entry.file, ...(entry.css || []), ...(entry.assets || [])]) await checkFile(path);
    for (const dependency of [...(entry.imports || []), ...(entry.dynamicImports || [])]) {
      assert.ok(manifest[dependency], `Manifest entry ${key} references missing chunk ${dependency}`);
    }
  }
  let documents = 0;
  async function inspect(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = resolve(folder, entry.name);
      if (entry.isDirectory() && entry.name !== 'assets' && entry.name !== '.vite') await inspect(path);
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        const assets = documentAssets(await readFile(path, 'utf8'));
        assert.ok(assets.length, `${relative(root, path)} has no production assets`);
        for (const asset of assets) await checkFile(new URL(asset, 'https://build.invalid').pathname.slice(1));
        documents++;
      }
    }
  }
  await inspect(root);
  assert.ok(documents, 'No HTML documents found');
  return { documents, assets: checked.size };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await checkBuildAssets();
  console.log(`Build assets verified: ${result.assets} files and ${result.documents} HTML documents, including shared/lazy chunks and stylesheets.`);
}
