# Appointment Scheduler

**Live Demo:** Deployment URL will be added after the first Vercel release.<br>
**Tech Stack:** React, Vite, Supabase, PostgreSQL

Appointment Scheduler is a full-stack appointment management application for organizing meetings, deadlines, and follow-up work. It combines a responsive React workspace with Supabase authentication and PostgreSQL-backed, user-scoped scheduling data.

## Features

- Email/password authentication with email confirmation support
- Protected application routes and persisted authenticated sessions
- One-click Guest Demo with realistic, browser-isolated sample data
- Create, edit, delete, complete, and restore appointments
- Completed appointment history
- Search by appointment name or notes
- Priority filtering and chronological sorting
- Low, medium, and high appointment priorities
- Form validation plus loading, empty, and error states
- Responsive navigation for desktop and mobile layouts

Guest Demo requires no account. Its appointments are stored in the current browser tab with `sessionStorage`; guest actions never read from or write to Supabase. Demo data is seeded once and can be reset intentionally from the navigation.

## Architecture

```text
React / Vite
     |
     +-- React Router (protected routes)
     |
     +-- Authentication Context
     |
     +-- Shared App Shell + Appointment Components
     |
     +-- Guest Service --------> sessionStorage
     |
     +-- Appointment Service
              |
              v
          Supabase
          /      \
       Auth    PostgreSQL
```

The main application areas live in `src/pages`, reusable navigation and form/card UI live in `src/components`, authentication state is managed in `src/context`, and Supabase plus guest persistence are isolated in `src/services`. The Vercel SPA rewrite is defined in `vercel.json`, while database access policies are reproducible from `supabase/migrations`.

## Data security

Authenticated CRUD queries include the current user's ID, and new appointments are written with `user_id`. Frontend filtering is defense in depth—not the database security boundary. The included migration enables Row Level Security and restricts `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations to rows where `auth.uid() = user_id`.

RLS cannot be verified from repository code alone. Apply [`supabase/migrations/20260819000000_secure_appointments_rls.sql`](supabase/migrations/20260819000000_secure_appointments_rls.sql) in the Supabase Dashboard **SQL Editor** (or with `supabase db push`), then inspect **Database → Tables → appointments → RLS policies**. The migration intentionally replaces existing policies on that table so an older permissive policy cannot undermine the new rules.

The frontend must use only a Supabase public publishable/anon key. Never expose a service-role key, database password, or other private credential in Vite environment variables.

## Local development

```bash
git clone https://github.com/adamBlank99/appointment_scheduler_app.git
cd appointment_scheduler_app
npm install
cp .env.example .env
npm run dev
```

Configure these values in `.env`:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
```

Without those variables, Guest Demo still works locally; account login and signup remain disabled.

## Build and deployment

```bash
npm run lint
npm run build
npm run preview
```

For Vercel, import the repository, add both public Supabase environment variables, and deploy the production branch. `vercel.json` sends direct visits such as `/dashboard`, `/completed`, `/new`, and `/edit/:id` to the React entry point.

For confirmation emails, add the production origin and `https://YOUR-DOMAIN/login?confirmed=true` under **Supabase → Authentication → URL Configuration**. Keep email confirmation enabled and customize the Supabase email template/branding before launch.

## Screenshots

Screenshots will be added after the production URL and final responsive deployment are verified:

- Desktop appointment dashboard
- Guest Demo and completed history
- Mobile scheduling workflow

## Resume claim check

The implementation supports authenticated sessions, protected routes, user-scoped appointment access, PostgreSQL persistence, reusable dashboards/forms, create/update/cancellation (delete), search, filtering, sorting, priority, and completion status tracking. These claims are accurate once the included RLS migration has been applied to the production Supabase project; until then, database-enforced user isolation should not be claimed as verified.

## Potential next steps

- Add automated component and end-to-end tests
- Add optional calendar or reminder integrations
- Capture production screenshots after deployment
