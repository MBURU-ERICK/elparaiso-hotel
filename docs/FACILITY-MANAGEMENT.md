# Facility management

Administrators can open **Facilities** from the staff sidebar or Administration page at `/staff/facilities`.

Create a location or edit an existing one, including name, unique code, address, phone and active state. Choose **Hotel rooms**, **Airbnb**, **Both**, or **Conference only**. **This facility offers conferences** is independent of the accommodation choice, so hotel and Airbnb facilities can both offer conferences. Conference-only venues must keep that capability enabled.

Airbnb/Both creates a draft Airbnb property if one does not already exist. Add rooms and explicitly publish the property through Airbnb room management. Saving a facility does not automatically publish private accommodation. Type changes that would detach hotel categories or an Airbnb property are rejected; choose Both to retain existing accommodation. Deactivation retains records while removing the facility from new booking options. Deletion is not provided.

After enabling conferences, use **Configure conference packages** on the facility card. The packages page supports creating half-day and full-day packages with rates, inclusions, optional published hall photographs and an offer toggle. One package per duration per facility is allowed. Existing package rates can still be edited. Package management requires facility manage permissions; facility creation/editing requires an active staff superuser.

Turning off conference capability hides that facility's packages from the public conference list, catalogue and booking options. New conference requests are rejected, including requests built from stale browser data. Existing package records, bookings and saved quote values remain intact.

## Deployment

1. Deploy the backend and run `python manage.py migrate` with the production configuration.
2. Migration `facilities.0002_facility_has_conference` adds the capability flag and marks existing conference-only venues and facilities with conference packages as capable, preserving existing offerings.
3. Restart the backend, then deploy the frontend build.
4. As an administrator, create an Airbnb facility with conferences, add a package, confirm it appears in guest booking options, then verify editing and disabling conference availability. Publish the Airbnb property separately when its room information is ready.

No production migration or deployment was performed.

## Verification

Frontend tests, lint, production build, asset validation and SEO checks passed. The facility editor test checks the independent accommodation and conference controls. Django system checks, migration drift detection and four database-free backend tests passed. Migration-history verification could not contact the configured database; PostgreSQL integration tests were attempted against isolated test settings and were blocked by socket permissions. Integration tests are in `facilities/test_api.py` and cover CRUD, default draft publication, duplicate codes, type protection, permission checks, conference package creation and disabled-conference filtering/rejection.

Browser visual/keyboard checks remain outstanding. The new UI follows the existing staff workspace style and uses native radio buttons, checkboxes, labeled inputs, fieldsets, busy states and save/error announcements, guided by the installed Modern Web Guidance forms guide.
