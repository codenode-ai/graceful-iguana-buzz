-- 0003_policies_and_rpcs.sql
-- Row Level Security policies and helper RPCs to enforce RBAC

-- Helper functions ---------------------------------------------------------

create or replace function sociometria.is_superadmin(uid uuid default auth.uid())
returns boolean
security definer
set search_path = public, sociometria
language plpgsql
as $$
begin
  if uid is null then
    return false;
  end if;

  return exists (
    select 1
    from sociometria.profiles p
    where p.user_id = uid
      and p.role = 'superadmin'
  );
end;
$$;

create or replace function sociometria.is_company_admin(company uuid, uid uuid default auth.uid())
returns boolean
security definer
set search_path = public, sociometria
language plpgsql
as $$
begin
  if uid is null or company is null then
    return false;
  end if;

  return exists (
    select 1
    from sociometria.profiles p
    where p.user_id = uid
      and p.company_id = company
      and p.role = 'admin'
  );
end;
$$;

create or replace function sociometria.is_company_manager(company uuid, uid uuid default auth.uid())
returns boolean
security definer
set search_path = public, sociometria
language plpgsql
as $$
begin
  if uid is null or company is null then
    return false;
  end if;

  return exists (
    select 1
    from sociometria.profiles p
    where p.user_id = uid
      and p.company_id = company
      and p.role in ('admin', 'manager')
  );
end;
$$;

-- Row Level Security enablement -------------------------------------------

alter table sociometria.companies enable row level security;
alter table sociometria.profiles enable row level security;
alter table sociometria.company_invites enable row level security;
alter table sociometria.employees enable row level security;
alter table sociometria.responses enable row level security;

-- Companies ----------------------------------------------------------------

create policy companies_select_members on sociometria.companies
for select
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or created_by = auth.uid()
    or exists (
      select 1
      from sociometria.profiles p
      where p.user_id = auth.uid()
        and p.company_id = sociometria.companies.id
    )
  )
);

create policy companies_insert_creator on sociometria.companies
for insert
with check (
  auth.role() = 'authenticated'
  and created_by = auth.uid()
);

create policy companies_update_admin on sociometria.companies
for update
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.is_company_admin(sociometria.companies.id)
  )
)
with check (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.is_company_admin(sociometria.companies.id)
  )
);

create policy companies_delete_superadmin on sociometria.companies
for delete
using (
  sociometria.is_superadmin()
);

-- Profiles -----------------------------------------------------------------

create policy profiles_select_scope on sociometria.profiles
for select
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or user_id = auth.uid()
    or (
      company_id is not null
      and exists (
        select 1
        from sociometria.profiles p
        where p.user_id = auth.uid()
          and (
            p.role = 'superadmin'
            or (p.company_id = company_id and p.role in ('admin', 'manager'))
          )
      )
    )
  )
);

create policy profiles_insert_self_or_superadmin on sociometria.profiles
for insert
with check (
  auth.role() = 'authenticated'
  and (
    user_id = auth.uid()
    or sociometria.is_superadmin()
  )
);

create policy profiles_update_self_or_admin on sociometria.profiles
for update
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or user_id = auth.uid()
    or (
      company_id is not null and sociometria.is_company_admin(company_id)
    )
  )
)
with check (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or user_id = auth.uid()
    or (
      company_id is not null and sociometria.is_company_admin(company_id)
    )
  )
);

create policy profiles_delete_superadmin on sociometria.profiles
for delete
using (
  sociometria.is_superadmin()
  or (
    company_id is not null and sociometria.is_company_admin(company_id)
  )
);

-- Company Invites ----------------------------------------------------------

create policy invites_select_company_admin on sociometria.company_invites
for select
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.is_company_admin(company_id)
  )
);

create policy invites_insert_company_admin on sociometria.company_invites
for insert
with check (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.is_company_admin(company_id)
  )
);

create policy invites_update_company_admin on sociometria.company_invites
for update
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.is_company_admin(company_id)
  )
)
with check (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.is_company_admin(company_id)
  )
);

create policy invites_delete_company_admin on sociometria.company_invites
for delete
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.is_company_admin(company_id)
  )
);

-- Employees ----------------------------------------------------------------

create policy employees_select_company_members on sociometria.employees
for select
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or exists (
      select 1
      from sociometria.profiles p
      where p.user_id = auth.uid()
        and p.company_id = company_id
    )
  )
);

create policy employees_insert_manager on sociometria.employees
for insert
with check (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.is_company_manager(company_id)
  )
);

create policy employees_update_manager on sociometria.employees
for update
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.is_company_manager(company_id)
  )
)
with check (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.is_company_manager(company_id)
  )
);

create policy employees_delete_admin on sociometria.employees
for delete
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.is_company_admin(company_id)
  )
);

-- Responses ----------------------------------------------------------------

create policy responses_select_company_members on sociometria.responses
for select
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or exists (
      select 1
      from sociometria.profiles p
      where p.user_id = auth.uid()
        and p.company_id = company_id
    )
  )
);

create policy responses_insert_members on sociometria.responses
for insert
with check (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or exists (
      select 1
      from sociometria.profiles p
      where p.user_id = auth.uid()
        and p.company_id = company_id
        and p.role in ('admin', 'manager', 'employee')
    )
  )
);

create policy responses_delete_admin on sociometria.responses
for delete
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.is_company_admin(company_id)
  )
);

-- RPCs ---------------------------------------------------------------------

create or replace function sociometria.get_company_metrics(p_company_id uuid)
returns table (
  company_id uuid,
  status sociometria.company_status,
  plan sociometria.billing_plan,
  employees_count bigint,
  responses_count bigint
)
language sql
stable
security definer
set search_path = public, sociometria
as $$
  select *
  from sociometria.company_metrics
  where company_id = p_company_id;
$$;

create or replace function sociometria.get_saas_overview()
returns table (
  companies_total bigint,
  active_companies bigint,
  trial_companies bigint,
  suspended_companies bigint,
  employees_total bigint,
  responses_total bigint
)
language sql
stable
security definer
set search_path = public, sociometria
as $$
  select
    count(*) as companies_total,
    count(*) filter (where status = 'active') as active_companies,
    count(*) filter (where status = 'trial') as trial_companies,
    count(*) filter (where status = 'suspended') as suspended_companies,
    coalesce(sum(employees_count), 0) as employees_total,
    coalesce(sum(responses_count), 0) as responses_total
  from sociometria.company_metrics;
$$;

-- Grant execute on RPCs to authenticated users (RLS still applies)
grant execute on function sociometria.get_company_metrics(uuid) to authenticated;
grant execute on function sociometria.get_saas_overview() to authenticated;
