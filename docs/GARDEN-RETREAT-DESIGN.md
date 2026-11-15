# Garden retreat design direction

## Plan

Elparaiso is a hotel, restaurant and garden destination in Rumuruti. The visitor website should help someone compare actual stays, see the setting and plan a visit with the team. Its visual identity comes from the property's published garden photography, rather than a generic international luxury-hotel template.

Palette: porcelain `#F7FAF7`, eucalyptus `#DFE9DF`, deep slate `#233C3B`, ivory `#FFFDF7`, antique gold `#886323`, and muted green `#53665D`. Gold identifies the primary booking actions; pale greens provide quieter garden context. The compact footer stays light.

Type: Iowan Old Style/Palatino for open, readable hospitality headings, Avenir Next/Segoe UI for navigation, descriptions and booking details. These established local font stacks preserve the prior performance optimization. Headings and labels use sentence case, with left-aligned body copy and short readable line lengths.

Layout options considered:

```text
A: [headline / booking actions] [large garden photograph]
   [stays] [dining] [garden links]
   [booking search]
   [room photography / details] [published room features]

B: [full-bleed garden photograph + overlaid headline]
   [booking search over photograph]
```

Choose A: prominent garden photography with readable copy on a solid surface and visible booking actions. This respects the request for a calm hotel-and-garden identity without relying on text over a busy image. Other pages share the palette, typography, photo viewer and compact navigation/footer.

## Review before implementation

The previous warm brown/ivory direction was too close to a generic luxury-hotel default. It is revised to cooler porcelain, eucalyptus and slate, retaining gold as an accent rather than coloring every heading. Remove redundant uppercase labels and ornamental italics from the new homepage. Discovery cards become open photographic compositions; priced room cards keep a clear product boundary. Reserve visual emphasis for the large garden photograph.

Available room amenities must come from published room data, not from assumptions about international hotel facilities. Show how many room categories list each feature, and direct guests to the chosen room for exact inclusions. Do not invent pools, spas, gyms, stars, awards or accessibility claims.

## Implementation review

The homepage now opens with the actual garden photo collection, a large sentence-case headline, direct stay/gallery actions and simple routes into accommodation, dining and outdoor experiences. The shared public palette, forms, gallery, review cards and Private Stays surfaces use cool porcelain/eucalyptus/slate with gold actions. The compact footer remains ivory. Service discovery cards use open photography, while rooms retain clear rate/detail boundaries.

The `HotelAmenities` section appears on Home and Experiences. It reuses the shared public room cache and derives features from the existing API. Duplicate feature names count once per room category; invalid/empty values are ignored. Counts indicate selected room categories, rather than claiming a feature is included in every stay. Empty/error states direct guests to room details or the team.

The first muted color was darkened from `#5B6E65` to `#53665D` after its contrast on eucalyptus measured below 4.5:1. Automated checks now enforce normal-text contrast for the main ink, muted text and primary action pairs, plus 3:1 for the field-boundary token. New type uses rem-based sizes, fluid clamping, restrained sentence-case labels and short paragraphs. Forced-color overrides preserve control boundaries and photo-caption legibility. This brand direction deliberately uses a light appearance.

Validation passed: `npm test`, `npm run lint`, `npm run build`, `npm run check:seo`, build-asset validation and `git diff --check`. Tests also cover truthful amenity summaries and empty-state behavior. The final build verified 75 asset files and 17 HTML documents.

Browser preview/screenshots were unavailable, so this is not a claim of completed visual, keyboard or device verification. Review phone/tablet/desktop layouts, room features and booking/photo-viewer interactions before release. No production deployment was performed.

Skills used: installed `frontend-design`, and the bundled Modern Web Guidance `visual-design/color.md` and `visual-design/typography.md` guides. The npm guidance runner was previously unavailable offline, so the installed guide files were read directly. No new runtime dependency, external web font or invented amenity was added.
