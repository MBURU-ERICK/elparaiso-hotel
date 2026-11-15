// Both modulepreload dependencies and entry scripts are required for initial rendering.
export function documentAssets(html) {
  const paths = new Set();
  for (const match of html.matchAll(/<(script|link)\b[^>]*>/gi)) {
    const attribute = match[1].toLowerCase() === 'script' ? 'src' : 'href';
    const value = match[0].match(new RegExp(`\\b${attribute}\\s*=\\s*["']([^"']+)["']`, 'i'))?.[1];
    if (value?.startsWith('/assets/') && /\.(?:js|css)(?:[?#]|$)/i.test(value)) paths.add(value);
  }
  return [...paths];
}
export function assetContentType(path) {
  return /\.css(?:[?#]|$)/i.test(path) ? /text\/css/i : /(?:javascript|ecmascript)/i;
}
