import { renderToPipeableStream } from 'react-dom/server';
import { Writable } from 'node:stream';
import { Buffer } from 'node:buffer';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

export function renderPage(path) {
  const context = {};
  return new Promise((resolve, reject) => {
    const parts = [];
    const output = new Writable({ write(chunk, encoding, callback) { parts.push(chunk); callback(); } });
    output.on('finish', () => resolve({ body: Buffer.concat(parts).toString(), head: context.helmet ? ['title', 'meta', 'link', 'script'].map(key => context.helmet[key].toString()).join('') : '' }));
    output.on('error', reject);
    const stream = renderToPipeableStream(<HelmetProvider context={context}><MemoryRouter initialEntries={[path]}><App /></MemoryRouter></HelmetProvider>, {
      onAllReady() { stream.pipe(output); },
      onError(error) { reject(error); },
    });
  });
}
