# Appointment Scheduler

A full-stack scheduling workspace for creating, prioritizing, tracking, and completing appointments. Built with React, Supabase Auth, PostgreSQL, and a security-first public demo experience.

**[LIVE DEMO LINK](https://appointment-scheduler-app.vercel.app)** 
<img width="1459" height="798" alt="Screenshot 2026-08-20 at 1 08 53 AM" src="https://github.com/user-attachments/assets/d982a3d4-ff38-47b5-aa1e-fa7332e54c68" />

## Product overview

Appointment Scheduler provides a focused approach for managing upcoming commitments and completed work. Users can create a private account for their tasks and appointments or try the guest recruiter mode.

### Functionality

- Create, edit, delete, complete, and restore appointments
- Search appointment names and notes
- Filter by low, medium, or high priority
- Sort schedules chronologically
- Review completed appointment history
- Use a responsive workspace across desktop and mobile layouts

## Engineering highlights

- **Persistence strategies:** authenticated data uses PostgreSQL while Guest Demo data uses tab-scoped `sessionStorage` behind a matching service interface.
- **Database authorization:** PostgreSQL Row Level Security restricts every appointment operation to its authenticated owner.
- **Defense in depth:** browser validation is backed by database constraints, request throttling, record quotas, least-privilege grants, and forced RLS.
- **Abuse Resistance:** Supabase email/password authentication is protected by Cloudflare Turnstile tokens on signup and login.
- **Guardrails:** Vercel security headers, dependency auditing, Dependabot, CI checks, privacy disclosures, and permanent account deletion are included.

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


## Design priorities

The project emphasizes a sleek design to managing appointments using a practical full-stack application beyond simple CRUD: With database security and protections against abuse.
