-- Enforce limits in PostgreSQL because browser validation can be bypassed by
-- callers using the public Data API directly.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

update public.appointments set notes = '' where notes is null;
update public.appointments set priority = 'Medium' where priority is null;
update public.appointments set is_completed = false where is_completed is null;

alter table public.appointments alter column notes set default '';
alter table public.appointments alter column priority set default 'Medium';
alter table public.appointments alter column is_completed set default false;

alter table public.appointments
  drop constraint if exists appointments_user_id_fkey,
  add constraint appointments_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade not valid;

alter table public.appointments
  drop constraint if exists appointments_user_id_required,
  add constraint appointments_user_id_required
    check (user_id is not null) not valid,
  drop constraint if exists appointments_client_name_valid,
  add constraint appointments_client_name_valid
    check (client_name is not null and char_length(btrim(client_name)) between 1 and 100) not valid,
  drop constraint if exists appointments_date_required,
  add constraint appointments_date_required
    check (appointment_date is not null) not valid,
  drop constraint if exists appointments_time_required,
  add constraint appointments_time_required
    check (appointment_time is not null) not valid,
  drop constraint if exists appointments_priority_valid,
  add constraint appointments_priority_valid
    check (priority in ('Low', 'Medium', 'High')) not valid,
  drop constraint if exists appointments_notes_valid,
  add constraint appointments_notes_valid
    check (notes is not null and char_length(notes) <= 500) not valid;

create index if not exists appointments_user_schedule_idx
  on public.appointments (user_id, appointment_date, appointment_time);

-- Serialize inserts for each account before counting so concurrent requests
-- cannot race past the per-user storage ceiling.
create or replace function private.enforce_appointment_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.user_id::text, 77129)
  );

  if (select count(*) from public.appointments where user_id = new.user_id) >= 250 then
    raise exception using
      errcode = 'P0001',
      message = 'Appointment limit reached. Delete an appointment before creating another.';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_appointment_quota() from public, anon, authenticated;

drop trigger if exists enforce_appointment_quota_before_insert on public.appointments;
create trigger enforce_appointment_quota_before_insert
before insert on public.appointments
for each row execute function private.enforce_appointment_quota();

-- The pre-request hook limits authenticated requests made through PostgREST,
-- with a lower ceiling for writes. Authentication endpoints have separate
-- CAPTCHA and provider-side limits described in README.md.
create table if not exists private.api_request_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  write_count integer not null check (write_count >= 0)
);

revoke all on table private.api_request_limits from public, anon, authenticated;

create or replace function private.check_request_rate_limit()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_method text := current_setting('request.method', true);
  current_user_id uuid := auth.uid();
  is_write boolean := request_method in ('POST', 'PUT', 'PATCH', 'DELETE');
  current_request_count integer;
  current_write_count integer;
begin
  if current_user_id is null then
    return;
  end if;

  insert into private.api_request_limits as limits (
    user_id,
    window_started_at,
    request_count,
    write_count
  ) values (
    current_user_id,
    statement_timestamp(),
    1,
    case when is_write then 1 else 0 end
  )
  on conflict (user_id) do update
    set window_started_at = case
          when limits.window_started_at <= statement_timestamp() - interval '5 minutes'
            then statement_timestamp()
          else limits.window_started_at
        end,
        request_count = case
          when limits.window_started_at <= statement_timestamp() - interval '5 minutes'
            then 1
          else limits.request_count + 1
        end,
        write_count = case
          when limits.window_started_at <= statement_timestamp() - interval '5 minutes'
            then case when is_write then 1 else 0 end
          when is_write then limits.write_count + 1
          else limits.write_count
        end
  returning request_count, write_count
    into current_request_count, current_write_count;

  if current_request_count > 300 then
    raise sqlstate 'PT429' using
      message = 'Request rate limit exceeded. Try again in a few minutes.';
  end if;

  if current_write_count > 60 then
    raise sqlstate 'PT429' using
      message = 'Write rate limit exceeded. Try again in a few minutes.';
  end if;
end;
$$;

revoke all on function private.check_request_rate_limit() from public, anon, authenticated;
grant usage on schema private to authenticator;
grant execute on function private.check_request_rate_limit() to authenticator;

alter role authenticator set pgrst.db_pre_request = 'private.check_request_rate_limit';
notify pgrst, 'reload config';

-- Remove stale abuse-control rows without storing IP addresses or request logs.
create extension if not exists pg_cron with schema pg_catalog;

do $$
declare
  existing_job_id bigint;
begin
  for existing_job_id in
    select jobid from cron.job
    where jobname = 'purge-expired-api-request-limits'
  loop
    perform cron.unschedule(existing_job_id);
  end loop;
end
$$;

select cron.schedule(
  'purge-expired-api-request-limits',
  '*/5 * * * *',
  $cron$delete from private.api_request_limits where window_started_at < now() - interval '5 minutes'$cron$
);

-- New public-schema objects are private until a later migration deliberately
-- grants the minimum access they require.
revoke create on schema public from public;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
