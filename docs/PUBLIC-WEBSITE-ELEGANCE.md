# Ivory and gold public website

The visitor website uses the Private Stays visual direction: warm ivory, champagne surfaces, accessible dark gold buttons, editorial serif headings, consistent room and service cards, and a compact light footer.

## Coverage

- Home: split photographic introduction, date/guest search, curated service collections, live room cards, private-stay feature, approved guest stories and directions.
- Rooms: shared photographic introduction, room-image viewer, detailed cards, room filters, saved favourites and enquiry links.
- Private Stays: existing photo mosaics, property-specific grounds photographs and supplied location link, within the shared visitor shell.
- Restaurant and Experiences: photographic headers, interactive service cards, group dining, published guest feedback and a consistent closing invitation.
- About: photographic introduction and clickable chapter and journal photographs with ivory/champagne storytelling sections.
- Events and Conferences: warm editorial venue presentation, live event cards and conference package details.
- Gallery: the existing photo journal and full-screen viewer with matching gold accents.
- Contact: clear contact-method icons, enquiry form, directions and staff directory.
- Booking, group-meal enquiries and guest reviews: matching visitor form surfaces, controls, summaries and focus treatments.
- Navigation: matching booking action, active link accents, Gallery link and responsive menu.

The shared styling is scoped to `.guest-experience.hotel-elegance`. Operational staff workspaces use a separate root. Prices, capacities, package details, reviews and published events continue to come from their existing APIs; past-event filtering and booking validation remain in place. Homepage reviews display up to three approved stories, with a link to Experiences.

`EditorialPhoto` provides a consistent photograph button and full-screen viewer with keyboard navigation, swipe, zoom and original-image links. Existing verified photographic references remain the fallback where already used by the site. No stock photography, ratings or facility claims were added.

## Validation and release

Run `npm test`, `npm run build` and `npm run check:seo`. The build prerenders the canonical public pages and aliases. Added checks cover editorial photo accessibility, correct booking destinations and separation of photo controls from service navigation.

Automated checks passed during implementation. Browser visual and interaction verification remains outstanding because this session has no browser preview tool. Before release, review public pages at phone, tablet and desktop widths and verify booking, gallery, contact and room-image interactions with production data. Deploy the frontend build through the existing hosting workflow; no backend schema migration is required. No production deployment was performed.
