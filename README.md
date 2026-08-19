# Appointment Scheduler

**Live Demo:** Add the production URL after the first verified Vercel release.<br>
**Stack:** React, Vite, Supabase Auth, PostgreSQL, Cloudflare Turnstile, Vercel

Appointment Scheduler is a portfolio scheduling application with private authenticated workspaces and a no-account Guest Demo. It is designed for public deployment, with database-enforced ownership, bounded storage, bot protection, account deletion, and browser-only guest data.

## Features

- Email/password authentication with email confirmation
- Cloudflare Turnstile protection on signup and login
- One-click Guest Demo backed only by tab-scoped `sessionStorage`
- Create, edit, delete, complete, restore, search, filter, and sort appointments
- PostgreSQL Row Level Security (RLS) for owner-only access
- Database-enforced field lengths, allowed values, request throttling, and a 250-record account quota
- Permanent in-app account and appointment deletion
- Privacy/acceptable-use notice and security reporting policy
- Security headers, dependency updates, lint/build CI, and a production dependency audit

Guest data never reads from or writes to Supabase. It is capped at 100 records in the current tab and can be reset from the navigation.

## Security model

The browser is not a trust boundary. Although authenticated queries include the current user ID, PostgreSQL RLS independently restricts every `SELECT`, `INSERT`, `UPDATE`, and `DELETE` to `auth.uid() = user_id`. The database also rejects oversized or malformed fields, serializes inserts before enforcing the per-account quota, and throttles authenticated Data API requests (with a lower write ceiling) without storing IP addresses.

The public Supabase publishable key is expected in browser code. A service-role key or database password must never use a `VITE_` variable or be added to Vercel's frontend environment. The service-role key is used only by the deployed `delete-account` Edge Function through Supabase's server-managed environment.

Guest Demo is intentionally isolated from the backend, which makes it the safest route for casual recruiter exploration and prevents demo traffic from consuming database or authentication resources.

## Local development

```bash
git clone https://github.com/adamBlank99/appointment_scheduler_app.git
cd appointment_scheduler_app
npm install
cp .env.example .env.local
npm run dev
```

Configure only public client values:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
VITE_TURNSTILE_SITE_KEY=your-public-turnstile-site-key
```

If Supabase or Turnstile is missing, account login/signup stays disabled instead of falling back to an unprotected endpoint. Guest Demo remains available.

## Database setup and tests

Install the Supabase CLI, link the intended project, review the migrations, then apply them in timestamp order:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The migrations create the base table, force RLS, remove anonymous privileges and older policies, add owner-only policies, enforce input/storage limits, and install a PostgREST pre-request write limiter. Because the RLS migration intentionally replaces every existing policy on `appointments`, review any project-specific policies before applying it.

Run the pgTAP isolation tests against a local Supabase stack:

```bash
supabase start
npm run test:db
```

The tests verify forced RLS, anonymous denial, cross-user read/update/delete denial, owner spoofing denial, and the quota trigger. Do not claim production RLS is verified until the migrations and tests pass against the deployment schema.

## Account deletion function

Set an exact comma-separated origin allowlist and deploy the authenticated server-side function:

```bash
supabase secrets set ALLOWED_ORIGINS=https://YOUR-DOMAIN,https://YOUR-PROJECT.vercel.app
supabase functions deploy delete-account
```

For local function testing, add `http://localhost:5173` to `ALLOWED_ORIGINS`. Do not manually expose `SUPABASE_SERVICE_ROLE_KEY`; Supabase provides it to deployed Edge Functions. The function validates the caller's access token again before deleting that caller, and the database foreign key cascades deletion to their appointments and rate-limit record.

## Required provider configuration before launch

Repository controls cannot configure hosted dashboards. Complete and verify all of these items before sharing the URL publicly:

### Supabase

- Confirm `VITE_SUPABASE_URL` points to an active project and that its hostname resolves.
- Apply all migrations and run the RLS tests. Inspect **Database → Tables → appointments → RLS policies** afterward.
- In Auth bot/abuse protection, enable Cloudflare Turnstile with its **secret key**. Put only the matching public site key in Vercel as `VITE_TURNSTILE_SITE_KEY`.
- Keep email confirmation enabled. Disable anonymous, phone, social, and other providers that this app does not use.
- Require at least 12-character passwords. Enable leaked-password protection if the project plan supports it.
- Configure a production custom SMTP provider. Supabase's built-in SMTP is only for testing and has very low limits.
- Set conservative Auth email/signup/verification limits, then monitor them. CAPTCHA complements these limits; it does not replace them.
- Set the exact production **Site URL** and exact `/login?confirmed=true` redirect. Allow localhost only for development and avoid broad production wildcards.
- Deploy `delete-account` and set its exact `ALLOWED_ORIGINS` secret.
- Enable spend alerts/caps available to the account, review database size and Auth user growth, and choose an appropriate backup policy.
- Keep API/database logs to the minimum retention needed for operations and never log appointment content or credentials.

### Vercel

- Add exactly the three public `VITE_` values shown above. Do not add a service-role key, JWT signing secret, database URL, or database password to the frontend project.
- Enable deployment protection for previews so non-production builds are not publicly indexed or abused.
- Configure spend notifications and a hard spend limit appropriate for a portfolio project.
- Use Vercel Firewall rules to challenge or rate-limit unusually high request volume. Auth and database requests go directly to Supabase and must also retain the Supabase-side controls above.
- After deployment, verify the CSP and other headers in `vercel.json`, the Turnstile challenge, direct SPA route loads, signup confirmation, login, cross-account isolation, and account deletion.

### GitHub and operations

- Enable private vulnerability reporting, secret scanning/push protection, Dependabot alerts, and branch protection requiring the CI workflow.
- Add a real monitored private security contact if the project becomes more than a portfolio demonstration.
- Do not use real confidential, health, payment, government-ID, or regulated scheduling data. Review the in-app privacy notice whenever providers or data practices change.
- Periodically delete junk/inactive test accounts and review usage dashboards. Never run destructive availability testing against the live providers.

## Build checks

```bash
npm run lint
npm run build
npm audit --omit=dev --audit-level=high
```

The GitHub Actions workflow runs these checks for pushes and pull requests. Dependabot monitors npm packages and workflow actions.

## Architecture

```text
React / Vite
  ├─ Guest service ───────────────> sessionStorage (tab only, max 100)
  ├─ Supabase Auth + Turnstile ───> confirmed account
  ├─ Appointment service ─────────> PostgreSQL
  │                                  ├─ forced RLS ownership
  │                                  ├─ input constraints
  │                                  ├─ max 250 rows/account
  │                                  └─ authenticated request limiter
  └─ Delete-account action ───────> Supabase Edge Function
                                     └─ server-only admin deletion
```

Security reports should follow [SECURITY.md](SECURITY.md). The privacy and acceptable-use notice is also available at `/privacy` in the application.
