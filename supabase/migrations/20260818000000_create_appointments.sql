-- Base schema for a fresh project. Existing projects keep their table unchanged;
-- the following hardening migration adds safeguards to an existing table.
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_name text not null,
  appointment_date date not null,
  appointment_time time without time zone not null,
  priority text not null default 'Medium',
  is_completed boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists appointments_user_schedule_idx
  on public.appointments (user_id, appointment_date, appointment_time);

comment on table public.appointments is
  'User-owned appointment data. Access is controlled by row-level security.';
