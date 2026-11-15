# Modern Web Guidance frontend optimization

The installed skill at `/home/trick/.agents/skills/modern-web-guidance/SKILL.md` and its bundled guide files were used directly. The offline npm runner could not find `modern-web-guidance@1.0.0` in its package cache; no package installation or dependency update was required.

## Applied guidance

- `guides/performance/performance.md`: dynamically load secondary routes and the photograph viewer, remove unnecessary render-blocking font requests, and share fresh read-only catalogue responses. Native platform font stacks already used by the current guest and staff designs are now the global defaults. Map and other private/API request behavior is retained.
- `guides/performance/optimize-image-priority.md`: retain eager, high-priority hero images; lower initially hidden carousel slide priority; use normal priority for lazy below-the-fold images; match image `sizes` to service cards, mosaic tiles and private-room photographs. Private-room thumbnails use the known gallery thumbnail endpoint, while arbitrary external URLs remain unchanged. The redundant blurred thumbnail request was removed from `HomePhoto`.
- `guides/ui-behaviors/prevent-page-scroll-under-modal-dialog.md`: contain scrolling on native dialogs and their backdrops instead of mutating body overflow. Dialog labeling uses instance-specific IDs, native modal focus behavior and focus restoration remain in place. Non-scrollable backdrop containment is a progressive enhancement; Safari may still allow background scrolling. The installed guide explicitly recommends this over root-scroll workarounds.

The conditional async dependencies guide was also read; no polyfill or top-level-await change was needed.

## Loading and data behavior

- Public routes beyond Home use dynamic imports. Prerendered documents include the current route's CSS and static module dependencies from the Vite manifest, avoiding delayed route styling. Optional viewer dependencies are excluded from those preloads.
- The viewer has an inline loading/cancel state and a local failure fallback with an original-photo link. A route failure has an explicit reload/home recovery state.
- Public-resource consumers subscribe to one cache snapshot per key. Fresh responses last 60 seconds, concurrent requests deduplicate, retries force refresh, failed refreshes retain prior data, and hidden tabs defer refresh until visible. Values are not included in server prerenders. Availability and final prices continue to be validated by the existing submission endpoints.
- Staff refresh CSS loads with the staff layout/login routes, rather than the public entry.
- No service worker, dependency, library upgrade, unverified photo format, or new browser support requirement was added.

## Measured build footprint

The following totals sum the production entry and its static JavaScript/CSS dependencies. Gzip is estimated by compressing each emitted file with Node's gzip; it is not a live network or Core Web Vitals measurement. Route-on-demand, image, API, font and third-party payloads are excluded from these totals.

| Initial homepage assets | Before | After |
| --- | ---: | ---: |
| Raw bytes | 585,740 | 509,321 |
| Estimated gzip bytes | 160,188 | 143,431 |

The gzip reduction is approximately **10.5%**. The optional gallery viewer is not in the initial static dependency graph.

## Validation and remaining verification

Automated tests cover cache freshness/deduplication, shared subscriptions, retained stale results, key isolation, SSR privacy, private photo thumbnails, route-specific CSS/preloads and hidden-slide image priority. Existing booking, gallery, review and SEO tests remain in place. `npm test`, `npm run lint`, `npm run build`, `npm run check:seo` and asset integrity checks passed during the optimization pass.

Browser/Lighthouse testing and live deployment were unavailable. Before release, check gallery opening/closing, Escape/focus restoration, lazy-route navigation, room selection, enquiry submission, direct page styling and representative phone/tablet/desktop layouts. No live LCP, INP, CLS or PageSpeed score is claimed. Private Stays and Gallery hero photographs still depend on live published API data, so their first photo timing needs a network-enabled browser measurement.
