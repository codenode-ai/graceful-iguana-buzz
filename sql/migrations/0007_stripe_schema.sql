-- 0007_stripe_schema.sql
-- Introduces billing tables and columns to support Stripe subscriptions.

-- Enumerated status matching principal Stripe subscription states
create type sociometria.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid',
  'paused'
);

-- Plans available for purchase (maps to Stripe price ids)
create table sociometria.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  amount_cents integer not null,
  currency text not null default 'usd',
  interval text not null check (interval in ('month', 'year')),
  stripe_price_id text unique,
  active boolean not null default true,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function sociometria.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger trg_plans_touch_updated_at
before update on sociometria.plans
for each row
execute function sociometria.touch_updated_at();

-- Stripe customer id linked to each company
create table sociometria.stripe_customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references sociometria.companies(id) on delete cascade,
  stripe_customer_id text unique not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default timezone('utc', now())
);

create unique index stripe_customers_company_idx
  on sociometria.stripe_customers(company_id);

-- Subscriptions per company
create table sociometria.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references sociometria.companies(id) on delete cascade,
  plan_id uuid references sociometria.plans(id),
  stripe_subscription_id text unique not null,
  status sociometria.subscription_status not null default 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  trial_ends_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger trg_subscriptions_touch_updated_at
before update on sociometria.subscriptions
for each row
execute function sociometria.touch_updated_at();

create unique index subscriptions_company_active_idx
  on sociometria.subscriptions(company_id)
  where status in ('trialing', 'active', 'past_due', 'unpaid', 'incomplete');

-- Audit trail of subscription events (webhooks)
create table sociometria.subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references sociometria.subscriptions(id) on delete cascade,
  stripe_event_id text unique not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Extend companies with billing metadata
alter table sociometria.companies
  add column if not exists stripe_customer_id text,
  add column if not exists subscription_status sociometria.subscription_status default 'trialing',
  add column if not exists billing_plan_id uuid references sociometria.plans(id),
  add column if not exists trial_ends_at timestamptz;

create index if not exists companies_subscription_status_idx
  on sociometria.companies(subscription_status);

-- Policies -----------------------------------------------------------------

-- Plans: leitura liberada para autenticados; alterações restritas a superadmin
alter table sociometria.plans enable row level security;

drop policy if exists plans_select_authenticated on sociometria.plans;
create policy plans_select_authenticated
  on sociometria.plans
  for select
  using (auth.role() = 'authenticated');

drop policy if exists plans_modify_superadmin on sociometria.plans;
create policy plans_modify_superadmin
  on sociometria.plans
  for all
  using (sociometria.is_superadmin())
  with check (sociometria.is_superadmin());

-- Stripe customers: empresa consegue ver, superadmin vê tudo
alter table sociometria.stripe_customers enable row level security;

drop policy if exists stripe_customers_select_company on sociometria.stripe_customers;
create policy stripe_customers_select_company
  on sociometria.stripe_customers
  for select
  using (
    auth.role() = 'authenticated'
    and (
      sociometria.is_superadmin()
      or sociometria.is_company_admin(company_id)
    )
  );

-- Subscriptions: leitura para superadmin ou empresa; alterações via service role (bypass)
alter table sociometria.subscriptions enable row level security;

drop policy if exists subscriptions_select_company on sociometria.subscriptions;
create policy subscriptions_select_company
  on sociometria.subscriptions
  for select
  using (
    auth.role() = 'authenticated'
    and (
      sociometria.is_superadmin()
      or sociometria.is_company_admin(company_id)
      or sociometria.is_company_manager(company_id)
    )
  );

-- Subscription events: apenas superadmin
alter table sociometria.subscription_events enable row level security;

drop policy if exists subscription_events_select_superadmin on sociometria.subscription_events;
create policy subscription_events_select_superadmin
  on sociometria.subscription_events
  for select
  using (sociometria.is_superadmin());

-- Ensure new tables inherit default privileges defined in previous migration (0005).


