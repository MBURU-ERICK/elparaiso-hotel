# Technical SEO audit, implementation and indexing handoff

Audit date: 14 November 2026. Requested official canonical: **https://elparaisohotelltd.com/**.

This implementation supersedes the www-domain recommendations in earlier design reports. No deployment, DNS changes, webmaster submissions, Business Profile edits, old-domain requests, or backend changes were made.

## Audit summary

| Area | Verified finding | Implementation / remaining limit |
| --- | --- | --- |
| Routes | The existing router has eleven distinct indexable pages, three legacy aliases, booking, review, account and staff routes. | Retained every existing route. No speculative landing pages added. |
| HTTPS and hosts | Live www `/rooms` returns 200; apex `/rooms` returns 308 to www. | Code now prefers apex. Existing hosting/domain redirect must be reversed during a coordinated rollout before the canonical host can go live. Public-host redirects are now managed only in hosting to prevent loops. |
| Canonical / social metadata | Existing canonical, OG and image URLs pointed at www. | Centralized official origin; absolute apex canonical, OG and Twitter image URLs. Queries/fragments/trailing slashes omitted from canonicals. |
| Sitemap | Listed fourteen URLs including three duplicate aliases. | Eleven preferred indexable URLs only. Booking/review/private/404 URLs are excluded. Robots sitemap reference uses apex. |
| Titles and descriptions | Existing page-specific metadata was present. Several titles lacked location/context; About contained an unnecessary title separator. | Improved room/gallery/events/About titles and official-site homepage description. Unique titles/descriptions remain in initial HTML. |
| Rendering | Public pages were already prerendered. Room listings and rates are fetched in the browser. | Preserved HTML-first marketing content and live accommodation data. No frozen offers, inventory or prices introduced. |
| HTTP 404 | A deliberately nonexistent public URL returned HTTP 200 and the app shell. | Removed the global SPA catch-all. Only known private route families receive the app shell. Vercel's documented `404.html` mechanism now has a prerendered noindex error page with useful links. Deployment HTTP status still needs live validation. |
| Structured data | Basic Hotel/Restaurant/Breadcrumb data existed, without stable entity IDs or WebSite identity. | One JSON-LD graph per page: Hotel, WebSite, WebPage/AboutPage/ContactPage, breadcrumbs, Restaurant where relevant. Stable entity IDs, existing phones/email/location and genuine images. No invented ratings, coordinates, hours, prices, founding dates or social profiles. |
| Hydration | Moving JSON-LD outside its React-rendered location created duplicate browser graphs during a trial build. | JSON-LD remains in its original body location, which is valid structured-data placement. Metadata is in the head. This avoids duplicate graphs after hydration. |
| Internal linking | Some guest links still used `/business` and `/airbnb`. | Links now target `/conferences` and `/private-stays`. Existing `/events`, `/business`, `/airbnb` gain permanent redirects and retain their React routes. Root-relative links resolve to apex after the host redirect. |
| Images / performance | Genuine hotel imagery, responsive sources and eager hero/lazy primary secondary images already existed; decorative thumbnails were eager and hero had a duplicate full-image preload. | Lazy secondary thumbnails, asynchronous image decoding, responsive hero hint retained via React rendering, redundant full-image preload removed. Stable image dimensions retained. No measured Core Web Vitals gain asserted. |
| Fonts | Google Fonts were discovered through CSS `@import`. | Stylesheet now discovered directly in the document head with preconnections and `display=swap`. Existing typography preserved. |
| Headings / mobile | Guest routes already use one main heading and responsive layouts. | Built-page checks verify one H1, main landmark, alt attributes, internal destinations and local image assets. Browser validation covers changed metadata/rendering and copy on desktop/mobile. |
| Index controls | Booking/staff/account noindex was intentional; review had only a client noindex instruction. | Preserved booking policy. Private shell starts noindex; review gets noindex/no-store headers. Public marketing pages allow indexing and large image previews. Noindex is not treated as authentication. |
| Webmaster verification | No genuine Search Console/Bing verification values were supplied. | Optional build-time public verification values supported via `.env.example`. Empty values publish no verification tags. No fake ownership claim. |
| Local identity | Existing content identifies Elparaiso Hotel, Rumuruti, Laikipia County, Kenya, with Office and Director phone numbers. | Shared site identity, graph and visible official-site link. Complete street/pin/hours still require hotel-approved facts. |

## Canonical page inventory

- `/` — hotel and restaurant in Rumuruti, Laikipia.
- `/rooms` — hotel accommodation and live room categories.
- `/private-stays` — private accommodation.
- `/restaurant` — restaurant dining.
- `/experiences` — garden/family experiences.
- `/events-groups` — events and group enquiries.
- `/conferences` — meetings and conference enquiries.
- `/about` — hotel identity and hospitality.
- `/contact` — official contacts, location and enquiry options.
- `/gallery` — genuine hotel photography.
- `/conference-meals` — existing group catering quotation page.

`/booking` remains available and prerendered but intentionally noindex. It is an interactive quotation request, not an indexable inventory/offer page. Legacy aliases remain usable but are omitted from the sitemap. Nothing references the former `.co.ke` domain as a canonical or sameAs identity.

## Deployment prerequisite: avoid a redirect loop

**Public-host redirects must have one owner: Vercel Domains (or a coordinated Cloudflare rule), not an opposing rule in this application.**

1. Inspect Vercel Project → Domains and Cloudflare redirect rules to locate the existing apex-to-www rule. The observed response came from Vercel, but the audit does not claim authenticated visibility into either dashboard.
2. With production authorization, make `elparaisohotelltd.com` a served production domain with a valid certificate, rather than a domain that redirects to www. Remove any conflicting apex-to-www Cloudflare rule. Keep both hostnames attached and valid.
3. Deploy this reviewed frontend configuration and establish **www → apex** permanently, preserving paths and query strings. Avoid duplicate rules that fight each other. `vercel.json` deliberately omits www/apex redirects so an existing platform rule cannot cause a redirect loop. It retains the Vercel-project-host redirect and normalizes trailing slashes.
4. Keep `VITE_API_URL=https://api.elparaisohotelltd.com`. A live booking-options GET with `Origin: https://elparaisohotelltd.com` returned matching Access-Control-Allow-Origin plus credentials support. Separately confirm Django's production `CSRF_TRUSTED_ORIGINS` includes apex before a controlled real submission test; CORS success alone does not prove POST/CSRF behavior.
5. Run `npm run check:seo:live`. It performs public GETs only and fails on wrong-domain redirects, incorrect canonical metadata, sitemap drift, bad alias redirects and soft 404s. It does not change settings or submit URLs. A predeployment run failed as expected because production still redirects apex to www. This is a deployment prerequisite, not a passing live rollout.
6. Check HTTPS www, HTTPS apex and HTTP apex manually for `/`, `/rooms`, a query-bearing URL and a missing URL. Expected: apex content 200, www/HTTP permanent redirects to canonical HTTPS, unknown public paths 404, private deep links still functional.

Do not change production DNS as part of an unapproved code rollout. No access to or redirects from `elparaisohotel.co.ke` are needed for this approach. Its current uptime/ownership was not assessed or assumed.

## Indexing and local-search steps after a successful rollout

These are prepared owner actions, not completed submissions. No authenticated webmaster account is connected. An optional OpenSEO integration was discovered for Search Console reporting but has not been installed/connected; it is not a substitute for site verification or a promise of submission capability.

### Google Search Console

- Verify the new domain property using the exact TXT value Google provides, only with DNS authorization; or verify the canonical HTTPS URL-prefix property with the genuine HTML meta value.
- For HTML verification, set `VITE_GOOGLE_SITE_VERIFICATION` to the supplied public value and rebuild/redeploy. Do not put account secrets in VITE variables.
- Submit `https://elparaisohotelltd.com/sitemap.xml`.
- Use URL Inspection for the homepage, rooms, contact and the other important preferred pages. Compare Google's selected canonical and rendered HTML to the intended apex URLs. Request indexing where appropriate.
- Monitor Page Indexing, Crawl Stats, Core Web Vitals and Performance by query/page over the following weeks. A sitemap or request does not guarantee indexing or rankings.
- Do not use Change of Address from an old property the hotel does not control. Do not attempt to verify or remove the old website.

### Bing

- Add and verify the new canonical property in Bing Webmaster Tools, or import the legitimately verified Search Console property.
- HTML verification is available through `VITE_BING_SITE_VERIFICATION`, populated with Microsoft's genuine public value before rebuilding.
- Submit the canonical sitemap and inspect important URLs using the site's tools. Do not manufacture a BingSiteAuth file or IndexNow ownership key.

### Brave

- Keep canonical pages accessible to crawlers, with meaningful initial HTML and legitimate inbound links.
- Brave's official crawler help documents its Googlebot-compatible crawl access and URL re-fetch process. Its official submission page is `https://search.brave.com/submit-url`. Use the actual form according to its current options after the canonical pages are live; no recrawl or indexing request was sent by this task.
- Do not request delisting of the uncontrolled old domain or assume a submission guarantees inclusion.

### Local identity and authority

Use the existing real-world business name **Elparaiso Hotel**, rather than adding keywords to its Business Profile name.

Confirmed on-site contact record:

- Official website: `https://elparaisohotelltd.com/`.
- Location: Rumuruti, Laikipia County, Kenya.
- Office: `+254708231994` (`0708 231 994`).
- Director: `+254724502872` (`0724 502 872`).
- Email: `elparaisohotelltd@gmail.com`.

Update the hotel's existing Google Business Profile website field and legitimate Bing/social/tourism/booking listings that the hotel controls. Confirm its actual map pin, street address, visitor hours and primary public telephone with management before changing those records. Keep one profile for the real business; do not create duplicate profiles to compete with an outdated website.

Ask existing partners to update their genuine links to the official site. Publish hotel-approved room descriptions, meeting arrangements, dining information and original photographs. Seek genuine guest reviews without incentives or fabricated review markup. Add verified social profile URLs to schema only when ownership is established. The current schema deliberately omits unknown sameAs, star ratings, opening hours and geographic coordinates.

## Verification and limits

Commands:

```sh
npm run lint
npm test
npm run build
npm run check:seo
# After the authorized hosting/domain rollout:
npm run check:seo:live
```

The build generates fifteen initial route documents plus `404.html`. The static SEO checker covers eleven canonical pages, three aliases, sitemap equality, structured-data JSON, official entity IDs, metadata placement, one H1/main landmark, links/fragments, image alt/local assets, noindex booking/private/error output and intended Vercel rules. New unit tests cover canonical normalization, safe JSON-LD serialization, retained routes and private rewrites.

Browser checks serve local build bytes under the intended apex origin using Chrome request interception, leaving public API reads live. This checks hydration and mobile rendering without publishing. It does not prove Vercel's postdeployment HTTP redirect/404 behavior. That requires the live check after deployment.

No Core Web Vitals, Lighthouse scores, search rankings or Google-selected canonicals are claimed without measurement/account data. The shared CSS/JavaScript bundles and third-party fonts/maps remain performance opportunities. Availability and rates remain browser-fetched, with loading/error states; they were not converted into static offers for SEO. The existing contact email-app workflow was preserved.

## Recorded results

- `npm run lint`: passed.
- `npm test`: passed, including the existing component/service and stay-date suites plus the new SEO suite.
- `npm run build`: passed; fifteen initial documents and the custom error document generated.
- `npm run check:seo`: passed all canonical, sitemap, schema, link, alt, heading, private-output and route assertions.
- `git diff --check`: passed.
- Final Chrome pass: 13 destinations (11 indexable pages, booking, missing page) at 390px and 1440px, plus homepage/contact copy at 360px, 768px and 1024px. No overflow, one H1 per destination, expected robots/canonical metadata, no duplicate Hotel/WebSite graph nodes and no runtime exceptions.
- Live verifier: failed before deployment, as expected; the existing apex-to-www redirect still conflicts with the requested canonical direction. Live postdeployment status is not claimed as passing.

Detailed session logs are in `/tmp/elparaiso-seo-build.log`, `/tmp/elparaiso-seo-lint.log`, `/tmp/elparaiso-seo-tests.log`, `/tmp/elparaiso-seo-check.log`, `/tmp/elparaiso-seo-live.log` and `/tmp/elparaiso-seo-browser-final.log`.

## Primary references

- [Google canonicalization guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google site-name / WebSite data](https://developers.google.com/search/docs/appearance/site-names)
- [Google local business data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google request recrawling](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [Google Business Profile guidelines](https://support.google.com/business/answer/3038177)
- [Bing sitemap guidance](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed)
- [Brave crawler help](https://search.brave.com/help/brave-search-crawler)
- [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json)
- [Vercel custom 404 behavior](https://vercel.com/kb/guide/custom-404-page)

## CSS/JavaScript loading repair

The deployed www-to-apex application redirect conflicted with Vercel's existing apex-to-www domain redirect. On 14 November, the real stylesheet request `/assets/index-OMR3dtdD.css` and JavaScript requests alternated between the two hosts with HTTP 308 until the redirect limit was reached. Cached homepage HTML still returned 200, disguising the failure as missing CSS.

Removed the application's public-host redirect. Both the SEO build checker and unit suite now reject public-host redirect rules in `vercel.json`, preventing this configuration from fighting Vercel Domains again. The desired apex canonical remains unchanged; its eventual hosting migration is separate from restoring asset delivery. Production restoration requires deploying this repair or removing the conflicting redirect through an authorized hosting change. No DNS or production settings were changed by this repair.

Repair verification: build, lint, tests, static SEO/asset checks and `git diff --check` passed. Chrome checked the repaired build's homepage, rooms, booking, About and Contact at 390px and 1440px: built stylesheet rules loaded, correct fonts/flex layout applied, no horizontal overflow and no runtime exceptions. Preview checks used directory URLs to serve the same prerendered documents selected by Vercel rewrites. Live restoration is pending deployment; local checks do not claim production is already repaired.
