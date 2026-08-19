-- Run through the Supabase CLI (`supabase db push`) or paste into the
-- Supabase Dashboard SQL Editor. Review existing policies before applying:
-- this migration deliberately replaces every policy on appointments.

alter table public.appointments enable row level security;
alter table public.appointments force row level security;

revoke all on table public.appointments from anon;
grant select, insert, update, delete on table public.appointments to authenticated;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointments'
  loop
    execute format(
      'drop policy if exists %I on public.appointments',
      existing_policy.policyname
    );
  end loop;
end
$$;

create policy "Users can read their own appointments"
on public.appointments
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own appointments"
on public.appointments
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own appointments"
on public.appointments
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own appointments"
on public.appointments
for delete
to authenticated
using ((select auth.uid()) = user_id);
