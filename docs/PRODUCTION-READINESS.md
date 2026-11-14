# Production readiness review — Windows-hosted API

Reviewed 14 November 2026. Frontend: React/Vite/Vercel. Backend: Django REST Framework/PostgreSQL, moving to an always-on Windows computer. No production service, DNS record, secret, booking, payment or accounting logic was changed. Both repositories had clean working trees before this audit.

## Decision

**The source passes the local release checks and is prepared for Windows migration. Live production is not yet signed off.** The public API returned Cloudflare error 1033 during the audit. The new Windows services, tunnel, real-data restore, SMTP delivery and reboot recovery must be verified before cutover is complete.

Use [the step-by-step Windows migration/deployment runbook](WINDOWS-DEPLOYMENT.md). It covers Git transfer, dependencies, environment values, PostgreSQL restore, photo storage, service installation, Cloudflare, Vercel, verification and rollback.

## Confirmed findings and fixes

| Area | Finding | Result |
| --- | --- | --- |
| Frontend dependency audit | Three moderate advisories in minimatch/ESLint's build-tool dependency chain. | Compatible locked updates applied; clean install reports zero vulnerabilities. No application dependency or business contract was intentionally changed. |
| Node runtime | The laptop used Node 20.19.2. | Release checks rerun with Node 24.22.3; Node 24 selected in CI and `.nvmrc`, supported engines declared. |
| API build configuration | Without `VITE_API_URL`, service modules fell back to localhost, which could be embedded in an unconfigured production build. | Production build now rejects missing/non-HTTPS/localhost/credential-bearing/path/query API values. CI explicitly supplies the real public API origin. |
| Windows deployment preparation | Existing startup script supervises Waitress and the email worker, but no ready-to-review Windows service template or complete transfer guide existed. | Added WinSW template, private environment example, deployment artifact tests and a Windows preflight script. No service installed here. |
| Backend ignores | Windows `venv`, additional env variants and transfer dumps were not covered by repository-local ignores. | Added explicit exclusions; genuine `.env.example` remains tracked. No existing data deleted. |
| Windows documentation | Old instructions referred to temporary hosts, implied historical configuration state and could schedule a second mail worker. | Replaced with a pointer to the current detailed runbook and accurate service/outbox guidance. |
| Storage transfer | Git does not contain the database or uploaded hotel images. | Added portable SHA-256 transfer verification and instructions for separate PostgreSQL/media/private-gallery migration. No real guest data was exported by this audit. |
| Windows/Linux scripts | Cross-platform checkout can alter shell line endings. | Added `.gitattributes` for Linux shell and PowerShell files; CI includes Windows syntax validation. |
| Production API | Public readiness/health probes returned Cloudflare 1033. | Recorded as an operational blocker. Cloudflare's documentation associates this with a missing/unhealthy tunnel connector. No claim that code changes repaired the external tunnel. |
| Frontend stylesheet delivery | The previously broken production stylesheet now returns 200 with `text/css`; the conflicting application-domain redirect remains removed. | No stylesheet rewrite needed. Preserve single-owner hosting redirects during the move. |
| Canonical host | Apex `/rooms` still returns 308 to www, while the desired metadata canonical is apex. | Hosting-domain coordination remains pending. The application must not reintroduce the opposing redirect that broke CSS/JS. |

## Checks performed

| Check | Result and scope |
| --- | --- |
| Frontend clean locked install | Passed under Node 24.22.3. `npm ci` reported zero vulnerabilities after compatible updates. |
| Frontend lint | Passed. |
| Frontend JavaScript tests | Passed: 43 component/service cases plus 13 date/SEO/release-configuration cases. |
| Frontend Python transfer-tool tests | Passed: 2 cases. |
| Frontend production build | Passed; 15 initial route documents plus custom 404 output. |
| SEO/static asset assertions | Passed; preferred routes, canonical metadata, structured data, sitemap, headings, internal links, local assets, private/noindex output and anti-loop config checked. |
| Existing backend configuration | `manage.py check --deploy --fail-level WARNING` passed, with two intentionally silenced HSTS include-subdomain/preload warnings. This does not prove the external tunnel/SMTP service. |
| Backend isolated release checks | Passed with independent test-only environment values and an isolated PostgreSQL 17 cluster in `/tmp`. |
| Configured source database, read-only | No pending migrations; integrity audit checked 2 booking records, 0 issues, 0 pending emails and 0 exhausted emails. No source records were modified. |
| Backend migration drift | No changes detected. Fresh migrations applied successfully in the isolated database. |
| Backend full test discovery | 106 tests passed, including booking allocation, concurrency, scoped permissions, dates, request identity and email-queue behavior. Test SMTP is in-memory; no real message sent. |
| Service/artifact tests | 6 tests passed: 4 existing Linux supervision checks plus 2 Windows configuration artifact checks. |
| Database portability rehearsal | A custom PostgreSQL dump from the isolated audit database restored into another empty audit database. Restored migration check passed. This is not a restore of real production hotel data. |
| Static collection | Passed into temporary storage, preserving existing backend `staticfiles`. |
| Backend dependency compatibility | `pip check` passed. |
| Backend vulnerability audit | Pinned `requirements.lock`: no known vulnerabilities reported by pip-audit at audit time. |
| Secret handling | Real env files were not printed, copied into Git or replaced. No obvious tracked private-key/AWS-key patterns found; this is not a forensic audit of all Git history. |
| Windows package portability | Pinned requirements successfully downloaded as binary wheels for Windows x64 / Python 3.13. No target package was installed on this Linux host. |
| Repository path portability | Both repositories have no tracked Windows case-colliding or invalid filenames. |
| Native Windows execution | Not available on this Linux machine. Windows CI syntax validation was added; actual service installation, ACLs, reboot and live session checks remain operator gates. |

Both repositories remain reviewable and uncommitted by this task. No automatic dependency `--force` upgrade, database migration against operational data, data cleanup/deletion, credential rotation or financial activation was performed.

## Release gates on the Windows computer

1. Record matching reviewed frontend/backend release SHAs; clone both, recreate environments and fill secrets privately.
2. Rehearse restore into a separate database, verify storage checksums and inspect integrity/migration output. Preserve the production Django secret when moving the actual database.
3. During the final maintenance window, stop the old web/outbox writer and connector, make a fresh final transfer, restore into an empty final database and keep one active database writer.
4. Run the supplied `Test-WindowsRelease.ps1`, collect static files and verify persistent-data ACLs.
5. Install/start PostgreSQL, the supervised API/outbox service and the existing named Cloudflare Tunnel connector with automatic restart. Do not run duplicate notification schedules.
6. Verify public readiness, actual staff login/CSRF, a controlled real booking and actual guest/team email receipt, images, backups and reboot recovery.
7. Deploy the reviewed frontend through the existing Vercel project with Node 24 and the real API origin. Coordinate canonical-domain settings without competing redirect rules.
8. Perform a real backup restore drill before calling the move complete. After new Windows writes, never roll back to a stale laptop database without preserving/reconciling those writes.

## Audit logs

Session logs are under `/tmp/release-node24-*.log`, `/tmp/release-pip-audit.log` and `/tmp/elparaiso-release-audit/`. They are diagnostics from this machine, not files to publish. The isolated PostgreSQL audit cluster was stopped after checks.
