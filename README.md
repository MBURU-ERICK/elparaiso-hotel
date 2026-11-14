# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Premium guest frontend

The guest frontend remains React + Vite + React Router. Run `npm run dev` locally; `npm run build` produces Vercel-ready assets and 14 prerendered public page shells. Dynamic rates, photos and availability are never snapshotted.

- Design tokens and responsive guest-page styling: `src/styles/premium.css`; homepage-specific layout: `src/styles/home.css`.
- Shared page hero, service card, FAQ and closing CTA: `src/components/Premium.jsx`.
- Editorial service descriptions: `src/data/services.js`; homepage teasers: `src/data/home.js`; Director/Office numbers: `src/data/contacts.js`.
- Rooms/rates/capacities: existing hotel staff system and `/api/rooms/types/`. Private units: `/api/shortstays/units/`. Photos: existing gallery manager, using rooms, airbnb, restaurant, garden, experiences and general categories.
- New public URLs: `/private-stays`, `/events-groups`, `/conferences`. Existing `/airbnb`, `/events`, `/business` remain usable, canonicalizing to their newer equivalents.
- Booking and event/conference quotations continue through `/booking` and the existing guest-reservation endpoint. Catering remains at `/conference-meals`.
- The public Contact form prepares an email with `mailto:`; it cannot report delivery. The existing enquiry API requires a verified customer and has not been made public.
- API origin remains configured with `VITE_API_URL`; no credentials belong in client environment variables.

Checks: `npm run lint`, `npm test`, `npm run build`, `npm run check:seo`. No typecheck script is currently defined. See `HANDOFF.md` and `docs/PREMIUM-REDESIGN.md` for content and review requirements.

### Serene booking flow
`/booking` uses `src/pages/StayBooking.jsx` for hotel/private stays. Conference/event query parameters retain the existing `GuestBooking` workflow. Five stages preserve entered values when moving back; only a successful API response shows request receipt. Edit semantic colours in `src/styles/serene.css`, booking layout in `src/styles/reservation.css`. Children/preferred-room numbers are requests for the team; rates remain based on existing adult occupancy rules. See `docs/SERENE-BOOKING.md` for API behavior and verification limits.
