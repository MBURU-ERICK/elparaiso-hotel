# Administration API integration

The frontend admin workspace is `/staff/admin`, restricted to `me.user.is_superuser`.
The backend must enforce this independently on every admin endpoint. Existing facility
permissions still control staff navigation and API operations.

Required endpoints (not implemented in this frontend repository):

- POST `/api/staff/admin/rooms/`: room_number, room_type, facility_id,
  nightly_rate (KES decimal), status (available/maintenance/inactive).
- POST `/api/staff/admin/users/`: full_name, username, email, facility_id,
  role (reception/housekeeping/finance/manager). Send a single-use activation
  invitation; never return credentials.

Both use existing session authentication and CSRF. Validate facility membership,
unique room numbers/usernames, positive facility IDs, and nonnegative rates.
Return 201 on success and field validation errors on failure. Audit administrator
identity and changes. Assign concrete facility actions server-side; never trust
role strings from a client for authorization. Administrator promotion is deliberately
excluded from the account creation form.

Suggested role mapping: reception -> reservation operations; housekeeping -> room
status; finance -> payments_manage; manager -> facility manage. Existing coarse
view/manage actions need backend review before finer separation is enforced.

Guest navigation assistant is a local menu, with no AI service or message storage.
