# Missing production CSS and JavaScript

The browser reported missing `chunk-6KYCQHYJ-BsGSvjV8.js`, `GalleryLightbox-f3RtnlLe.js`, and a `text/html` response for `GalleryLightbox-B2JoE1iF.css`. All three files exist in the current local production build and are referenced by its HTML. This points to incomplete deployment output or a mismatch between served HTML and deployed assets. Live origin verification was unavailable: the web tool could not retrieve the pages and local DNS resolution failed. The exact live cause is not confirmed.

An HTML error page returned for a stylesheet produces the MIME error. Keep `X-Content-Type-Options: nosniff`; forcing a CSS content type onto HTML would hide the underlying delivery failure.

## Changes

- Vercel explicitly runs `npm run build` and publishes `dist` using the Vite framework configuration.
- HTML revalidates on reuse. Existing private-route `no-store` rules and long-lived hashed asset caching are retained. No public-host redirect was added.
- Vite emits a build manifest. The build fails if manifest files, shared/lazy dependencies, CSS, or HTML asset references are missing, empty, or replaced by HTML.
- The live verifier now includes `modulepreload` dependencies, not just entry scripts and stylesheets. Those dependencies include the reported shared chunks.

## Restore production

1. Deploy this source revision through the existing Vercel project, using a fresh build without the previous build cache. The project root must be the frontend checkout and the output directory must be `dist`.
2. Publish the complete output from that one build, including **all** files under `dist/assets`. Do not copy only `index.html`, the main JavaScript bundle, or selected CSS files. A manual static deployment should switch the complete release atomically and retain older hashed assets needed by open browser tabs.
3. After deployment, hard-refresh the affected browser tab. Check the serving host’s homepage and every CSS, JavaScript and modulepreload URL referenced by that HTML; they must return 200 with CSS/JavaScript content types. Old hashes may disappear in a new build, so use the deployed HTML’s current references rather than inventing replacement files with old names.
4. Run `npm run check:seo:live` from a network-enabled environment. Its canonical redirect checks may independently report the previously documented apex/www hosting migration; do not introduce opposing redirect rules to address asset delivery.

The Google Maps `ERR_BLOCKED_BY_CLIENT` request is separate. It is consistent with a browser content blocker and does not explain the first-party asset 404s. Verify Maps in a browser session without extensions if needed.

## Verification

`npm test`, `npm run build`, `npm run check:seo`, and `git diff --check` passed. The build verified 57 asset files and 17 HTML documents. Tests cover omitted shared chunks, invalid CSS bodies, modulepreload extraction and hosting output/cache settings. Production deployment and live HTTP verification were not performed.

References: [Vite production builds](https://vite.dev/guide/build), [Vercel project configuration](https://vercel.com/docs/project-configuration), [Vercel cache headers](https://vercel.com/docs/caching/cache-control-headers).
