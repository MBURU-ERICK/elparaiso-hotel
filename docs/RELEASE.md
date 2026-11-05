# Frontend upgrade validation and release gates

Existing React/Vite application and routes retained. Original public/images and src/assets files remain. All hardcoded Unsplash photo rendering is removed; gallery drafts must be imported/reviewed/published before the site shows hotel photographs. Empty gallery states are intentional, rather than displaying unrelated stock imagery.

GalleryCard, GalleryGrid, GalleryCarousel, GalleryPhoto, GalleryUploadForm and GalleryManager use /api/gallery/. StaffLayout preserves the existing session/CSRF implementation and wraps existing staff pages. Operational room status uses facility-scoped /api/staff/rooms/. Gallery upload/edit and publication remain manager-only at the backend. Navigation uses server-provided facility actions. Reconciliation now selects authorized facilities rather than hardcoding facility 1; existing accountant review history and independent review rules are preserved.

Set VITE_API_URL to the exact HTTPS backend origin at build time; it is a public URL, never a secret. Do not put provider/storage/database credentials in VITE_* variables. Frontend/backend same-site custom domains are preferred for reliable session cookies. Backend CSRF endpoint returns a masked token; multipart uploads preserve browser Content-Type boundaries. New vercel.json supplies SPA routing and basic response headers; deployment has not been performed. Review CSP with actual API, fonts, WhatsApp and Google Maps domains in staging before enforcing it.

Validation:
- npm test: 7 server-rendered React component and API service tests. Covers gallery states, alt text/responsive sources, default-private upload form, carousel control markup/loading priority, pagination filters, multipart session/CSRF requests.
- npm run lint and npm run build pass.
- These tests do not simulate a browser DOM. No browser automation package/browser connector is available, and network access blocks installing missing test dependencies. No screenshot, mobile-device, screen-reader or interactive carousel result is claimed.

Before release run keyboard-only navigation (including mobile menus and confirmation controls), screen-reader checks, contrast audit and browser testing at 320/375/768/1024/1440 widths. Verify hover/focus pause, previous/next and arrow keys, vertical scroll vs horizontal swipe, reduced motion, document-hidden pause, first-image priority and lazy offscreen images. Check no overflow and readable booking forms on mobile. Test session login/token rotation/logout on real Vercel/custom domains, all facility roles, upload failures and private image previews. Verify production headers/SPA routes and actual published gallery data. Backend PostgreSQL/S3 checks and backup restore drill are additional gates.

No production deployment, source-image deletion, credential changes or payment settlement is included. The original uncommitted StaffReconciliation history additions are deliberately left outside upgrade commits.
