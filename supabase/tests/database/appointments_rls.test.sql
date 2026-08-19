begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(9);

select extensions.has_table('public', 'appointments', 'appointments table exists');

select extensions.ok(
  (select relrowsecurity and relforcerowsecurity
   from pg_catalog.pg_class
   where oid = 'public.appointments'::regclass),
  'RLS is enabled and forced'
);

select extensions.is(
  (select count(*)::integer
   from pg_catalog.pg_policies
   where schemaname = 'public' and tablename = 'appointments'),
  4,
  'exactly four owner-scoped policies exist'
);

select extensions.ok(
  not has_table_privilege('anon', 'public.appointments', 'SELECT')
  and not has_table_privilege('anon', 'public.appointments', 'INSERT')
  and not has_table_privilege('anon', 'public.appointments', 'UPDATE')
  and not has_table_privilege('anon', 'public.appointments', 'DELETE'),
  'anonymous users have no appointment privileges'
);

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'rls-owner-a@example.invalid'),
  ('22222222-2222-4222-8222-222222222222', 'rls-owner-b@example.invalid');

insert into public.appointments (
  id, user_id, client_name, appointment_date, appointment_time
) values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'Owner A appointment', '2026-08-20', '09:00'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'Owner B appointment', '2026-08-21', '10:00'
  );

set local role authenticated;
set local request.jwt.claims =
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select extensions.results_eq(
  $$select id from public.appointments order by id$$,
  array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid],
  'a user can read only their own row'
);

select extensions.results_eq(
  $$update public.appointments
    set client_name = 'Blocked cross-user update'
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    returning id$$,
  array[]::uuid[],
  'a user cannot update another user row'
);

select extensions.results_eq(
  $$delete from public.appointments
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    returning id$$,
  array[]::uuid[],
  'a user cannot delete another user row'
);

select extensions.throws_ok(
  $$insert into public.appointments (
      user_id, client_name, appointment_date, appointment_time
    ) values (
      '22222222-2222-4222-8222-222222222222',
      'Spoofed owner', '2026-08-22', '11:00'
    )$$,
  '42501',
  null,
  'a user cannot insert a row owned by another user'
);

reset role;

select extensions.ok(
  exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'public.appointments'::regclass
      and tgname = 'enforce_appointment_quota_before_insert'
      and not tgisinternal
  ),
  'the per-user appointment quota trigger exists'
);

select * from extensions.finish();
rollback;
