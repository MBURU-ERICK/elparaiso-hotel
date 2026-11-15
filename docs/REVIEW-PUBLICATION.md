# Published guest reviews

Administrators can open **Guest reviews** at `/staff/reviews` and choose **Publish to guest website** on a checkout review or a previous portal review. **Unpublish review** removes it from subsequent public API responses without deleting the original feedback. All existing and newly submitted reviews are private by default.

The Experience page at `/experiences` displays published reviews, newest first, in responsive cards with ratings, shortened guest names, facility names and review months. Long comments have a full-review disclosure; the section includes loading, retry, empty and pagination states. The public response excludes booking references, contact fields and internal reservation IDs. Comments are displayed as written, so administrators should check their contents before publication.

## Deployment

1. Deploy the backend and run `python manage.py migrate` with the production configuration. Migration `customers.0013_review_publication` adds the two publication flags.
2. Deploy the frontend build.
3. Sign in as an administrator, publish a review and verify it on `/experiences`. Unpublish it to verify removal after refreshing the page.

The implementation does not publish any existing reviews automatically. No production deployment or migration was performed.

## Validation

Frontend tests include escaping review text, accessible ratings and access to long comments. The production build and changed-file lint passed. Three database-free backend tests cover administrator-only moderation, public response fields, pagination, cache prevention and the read-only customer publication field. Database integration tests for both review sources, default privacy and unpublishing are in `customers/test_review_publication.py`; they require PostgreSQL and could not run in this environment because socket creation is denied. Browser visual validation was unavailable.
