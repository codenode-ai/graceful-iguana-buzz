-- 0001_dev_seed.sql
-- Development-only seed data to validate onboarding/RBAC flows
-- Execute with `supabase db reset` or `psql -f` in local environments.

begin;

-- Clean previous data ------------------------------------------------------
truncate table sociometria.responses restart identity cascade;
truncate table sociometria.employees restart identity cascade;
truncate table sociometria.company_invites restart identity cascade;
truncate table sociometria.profiles restart identity cascade;
truncate table sociometria.companies restart identity cascade;

-- Seed auth users (passwords must be set via Supabase auth admin CLI or UI)
insert into auth.users (id, email, raw_app_meta_data, raw_user_meta_data, aud, role)
values
  ('00000000-0000-0000-0000-000000000001', 'superadmin@sociometria.dev', '{"provider":"email","providers":["email"]}', '{"name":"SaaS Superadmin"}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000002', 'admin@acme.dev', '{"provider":"email","providers":["email"]}', '{"name":"Ana Admin"}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000003', 'manager@acme.dev', '{"provider":"email","providers":["email"]}', '{"name":"Miguel Manager"}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000004', 'employee@acme.dev', '{"provider":"email","providers":["email"]}', '{"name":"Eva Employee"}', 'authenticated', 'authenticated')
on conflict (id) do nothing;

-- Companies ---------------------------------------------------------------
insert into sociometria.companies (id, name, status, plan, billing_email, created_by)
values
  ('10000000-0000-0000-0000-000000000001', 'Acme Ltda', 'active', 'starter', 'finance@acme.dev', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000002', 'Globex Corp', 'trial', 'free', 'contato@globex.dev', '00000000-0000-0000-0000-000000000001');

-- Profiles ----------------------------------------------------------------
insert into sociometria.profiles (user_id, company_id, role, full_name)
values
  ('00000000-0000-0000-0000-000000000001', null, 'superadmin', 'SaaS Superadmin'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'admin', 'Ana Admin'),
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'manager', 'Miguel Manager'),
  ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'employee', 'Eva Employee');

-- Employees ---------------------------------------------------------------
insert into sociometria.employees (id, company_id, full_name, email, language)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Eva Employee', 'employee@acme.dev', 'pt-BR'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Carlos Colleague', 'carlos@acme.dev', 'pt-BR'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Fernanda Facilitadora', 'fernanda@acme.dev', 'pt-BR');

-- Responses ---------------------------------------------------------------
insert into sociometria.responses (id, company_id, from_employee_id, to_employee_id, question_key, created_by)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'q1', '00000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'q1', '00000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'q2', '00000000-0000-0000-0000-000000000002');

-- Invitations -------------------------------------------------------------
insert into sociometria.company_invites (id, company_id, email, role, token, created_by, expires_at)
values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'newhire@acme.dev', 'employee', '50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', timezone('utc', now()) + interval '5 days');

commit;
