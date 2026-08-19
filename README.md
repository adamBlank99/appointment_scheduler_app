# Appointment Scheduler

A full-stack scheduling workspace for creating, prioritizing, tracking, and completing appointments. Built with React, Supabase Auth, PostgreSQL, and a security-first public demo experience.

**[View Live Demo](https://appointment-scheduler-app.vercel.app)** · **[View Source](https://github.com/adamBlank99/appointment_scheduler_app)**

> Recruiter note: select **Try Live Demo** to explore the complete workflow without creating an account. Guest data stays in the current browser tab and never reaches the production database.

## Product overview

Appointment Scheduler provides a focused dashboard for managing upcoming commitments and completed work. Users can create a private account for persistent data or immediately enter an isolated Guest Demo populated with realistic sample appointments.

### Core experience

- Create, edit, delete, complete, and restore appointments
- Search appointment names and notes
- Filter by low, medium, or high priority
- Sort schedules chronologically
- Review completed appointment history
- Use a responsive workspace across desktop and mobile layouts
- Explore the full product through a no-signup Guest Demo

## Engineering highlights

- **Two persistence strategies:** authenticated data uses PostgreSQL while Guest Demo data uses tab-scoped `sessionStorage` behind a matching service interface.
- **Database-enforced authorization:** PostgreSQL Row Level Security restricts every appointment operation to its authenticated owner.
- **Defense in depth:** browser validation is backed by database constraints, request throttling, record quotas, least-privilege grants, and forced RLS.
- **Abuse-resistant authentication:** Supabase email/password authentication is protected by Cloudflare Turnstile tokens on signup and login.
- **Privacy-aware demo mode:** recruiters can evaluate the application without creating accounts or consuming authentication/database resources.
- **Production guardrails:** Vercel security headers, dependency auditing, Dependabot, CI checks, privacy disclosures, and permanent account deletion are included.

## Technology

| Area | Implementation |
| --- | --- |
| Frontend | React 19, Vite, React Router |
| Interface | Responsive CSS, Lucide icons |
| Authentication | Supabase Auth, email confirmation |
| Bot protection | Cloudflare Turnstile |
| Database | PostgreSQL through Supabase |
| Authorization | PostgreSQL Row Level Security |
| Guest persistence | Browser `sessionStorage` |
| Server-side operations | Supabase Edge Functions |
| Deployment | Vercel |
| Quality | ESLint, pgTAP, GitHub Actions, Dependabot |

## Architecture

```text
React / Vite
  ├─ Authentication context
  │    └─ Supabase Auth + Turnstile
  ├─ Shared appointment interface
  │    ├─ Guest service ───────────> sessionStorage
  │    └─ Account service ─────────> Supabase Data API
  │                                  └─ PostgreSQL
  │                                      ├─ forced owner-only RLS
  │                                      ├─ input constraints
  │                                      ├─ per-account record quota
  │                                      └─ request-rate limits
  └─ Account deletion ─────────────> Supabase Edge Function
                                         └─ server-only admin API
```

The browser includes owner filters for clear query intent, but PostgreSQL policies—not frontend code—form the authorization boundary.

## Security and privacy

This repository treats its public deployment as an internet-facing application rather than a trusted portfolio mockup.

- Anonymous users receive no appointment-table privileges.
- Authenticated users can access only rows where `auth.uid() = user_id`.
- Direct API callers cannot bypass field lengths, allowed priorities, appointment quotas, or request limits.
- Guest appointments are capped and remain only in the current browser tab.
- Signup and login require a server-validated CAPTCHA token.
- Service-role credentials never enter the Vite bundle.
- Account deletion is performed by an authenticated Edge Function and cascades to owned records.
- Content Security Policy and related browser headers are configured in `vercel.json`.

See [SECURITY.md](SECURITY.md) for responsible disclosure. The deployed application also includes a privacy and acceptable-use notice.

## Run locally

```bash
git clone https://github.com/adamBlank99/appointment_scheduler_app.git
cd appointment_scheduler_app
npm install
cp .env.example .env.local
npm run dev
```

Add only public browser configuration to `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
# Optional when using a different Turnstile widget:
VITE_TURNSTILE_SITE_KEY=your-public-turnstile-site-key
```

The production Turnstile site key is public and included as the application default; the variable above overrides it for another widget. Never place a Supabase service-role key, database password, or Turnstile secret in a `VITE_` variable. If account services are not configured, Guest Demo remains available.

## Database and Edge Function setup

Apply the versioned migrations and run the RLS regression suite with the Supabase CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase start
npm run test:db
```

Deploy account deletion with an exact origin allowlist:

```bash
supabase secrets set ALLOWED_ORIGINS=https://appointment-scheduler-app.vercel.app
supabase functions deploy delete-account
```

The pgTAP suite verifies forced RLS, anonymous denial, cross-account read/update/delete isolation, owner-spoofing rejection, and the appointment quota trigger.

## Available commands

```bash
npm run dev       # Start the Vite development server
npm run lint      # Run static analysis
npm run build     # Create a production bundle
npm run preview   # Preview the production bundle locally
npm run test:db   # Run Supabase pgTAP database tests
```

GitHub Actions runs linting, the production build, and a high-severity production dependency audit on pushes and pull requests.

## Project structure

```text
src/
  components/       Shared shell, appointment UI, forms, CAPTCHA
  context/          Authentication and guest-session state
  pages/            Login, signup, dashboard, forms, privacy
  services/         Supabase and guest persistence adapters
supabase/
  functions/        Authenticated account-deletion function
  migrations/       Reproducible schema and security controls
  tests/database/   RLS and ownership regression tests
.github/             CI and dependency-update configuration
```

## Design priorities

The project emphasizes practical full-stack concerns beyond CRUD: trustworthy authorization boundaries, public-demo isolation, abuse resistance, cost controls, privacy minimization, reproducible database security, accessible error states, and deployment readiness.
