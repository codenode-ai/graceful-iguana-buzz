-- 0002_define_types_and_tables.sql
-- Enumerations and core tables for authentication/onboarding flows

-- Tear down legacy artifacts so the schema can be recreated consistently.
drop view if exists sociometria.company_metrics;
drop table if exists sociometria.responses cascade;
drop table if exists sociometria.employees cascade;
drop table if exists sociometria.company_invites cascade;
drop table if exists sociometria.profiles cascade;
drop table if exists sociometria.companies cascade;
drop type if exists sociometria.user_role cascade;
drop type if exists sociometria.company_status cascade;
drop type if exists sociometria.billing_plan cascade;

-- Enumerated types used across the SaaS data model
create type sociometria.user_role as enum ('admin', 'manager', 'employee', 'superadmin');
create type sociometria.company_status as enum ('trial', 'active', 'suspended');
create type sociometria.billing_plan as enum ('free', 'starter', 'growth', 'enterprise');

-- Helper function to keep updated_at columns in sync
create or replace function sociometria.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- SaaS companies (B2B customers)
create table sociometria.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status sociometria.company_status not null default 'trial',
  plan sociometria.billing_plan not null default 'free',
  billing_email text,
  stripe_customer_id text,
  metadata jsonb default '{}',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger trg_companies_touch_updated_at
before update on sociometria.companies
for each row
execute function sociometria.touch_updated_at();

-- Profiles map auth.users to companies and roles
create table sociometria.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  company_id uuid references sociometria.companies (id) on delete set null,
  role sociometria.user_role not null default 'employee',
  full_name text,
  invited_by uuid references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_company_required check (
    role = 'superadmin' or company_id is not null
  )
);

create trigger trg_profiles_touch_updated_at
before update on sociometria.profiles
for each row
execute function sociometria.touch_updated_at();

-- Invitations for users to join an existing company
create table sociometria.company_invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references sociometria.companies (id) on delete cascade,
  email citext not null,
  role sociometria.user_role not null default 'employee',
  token uuid not null default gen_random_uuid(),
  created_by uuid references auth.users (id),
  accepted_by uuid references auth.users (id),
  accepted_at timestamptz,
  expires_at timestamptz not null default (timezone('utc', now()) + interval '7 days'),
  metadata jsonb default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint company_invite_role_check check (role <> 'superadmin')
);

create unique index company_invites_token_idx
  on sociometria.company_invites (token);

create trigger trg_company_invites_touch_updated_at
before update on sociometria.company_invites
for each row
execute function sociometria.touch_updated_at();

-- Sociometric employees (internal to each company)
create table sociometria.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references sociometria.companies (id) on delete cascade,
  full_name text not null,
  email text,
  language text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger trg_employees_touch_updated_at
before update on sociometria.employees
for each row
execute function sociometria.touch_updated_at();

-- Sociometric questionnaire responses (edges in the network graph)
create table sociometria.responses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references sociometria.companies (id) on delete cascade,
  from_employee_id uuid not null references sociometria.employees (id) on delete cascade,
  to_employee_id uuid not null references sociometria.employees (id) on delete cascade,
  question_key text check (question_key in ('q1', 'q2', 'q3')) not null,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  constraint responses_unique_per_question unique (company_id, from_employee_id, to_employee_id, question_key)
);

-- Aggregated metrics view for dashboards and SaaS panel
create or replace view sociometria.company_metrics as
select
  c.id as company_id,
  c.status,
  c.plan,
  count(distinct e.id) as employees_count,
  count(distinct r.id) as responses_count
from sociometria.companies c
left join sociometria.employees e on e.company_id = c.id
left join sociometria.responses r on r.company_id = c.id
group by 1, 2, 3;
