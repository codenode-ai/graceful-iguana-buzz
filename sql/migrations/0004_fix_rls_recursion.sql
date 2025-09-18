-- 0004_fix_rls_recursion.sql
-- Adjust RLS policies to avoid recursion and add helper functions for role checks

set search_path = sociometria, public;

-- Helper to check generic membership within a company
create or replace function sociometria.is_company_member(company uuid, uid uuid default auth.uid())
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
  );
end;
$$;

-- Helper to check if user has any role within a company from a provided list
create or replace function sociometria.has_company_role(company uuid, roles text[], uid uuid default auth.uid())
returns boolean
security definer
set search_path = public, sociometria
language plpgsql
as $$
begin
  if uid is null or company is null or roles is null then
    return false;
  end if;

  return exists (
    select 1
    from sociometria.profiles p
    where p.user_id = uid
      and p.company_id = company
      and p.role = any(roles)
  );
end;
$$;

-- Recreate policies using helper functions to prevent recursive policy evaluation

-- Companies
drop policy if exists companies_select_members on sociometria.companies;
create policy companies_select_members on sociometria.companies
for select
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or created_by = auth.uid()
    or sociometria.is_company_member(id)
  )
);

-- Profiles
drop policy if exists profiles_select_scope on sociometria.profiles;
create policy profiles_select_scope on sociometria.profiles
for select
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or user_id = auth.uid()
    or (
      company_id is not null
      and (
        sociometria.is_company_admin(company_id)
        or sociometria.is_company_manager(company_id)
      )
    )
  )
);

-- Employees
drop policy if exists employees_select_company_members on sociometria.employees;
create policy employees_select_company_members on sociometria.employees
for select
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.is_company_member(company_id)
  )
);

-- Responses
drop policy if exists responses_select_company_members on sociometria.responses;
create policy responses_select_company_members on sociometria.responses
for select
using (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.is_company_member(company_id)
  )
);

drop policy if exists responses_insert_members on sociometria.responses;
create policy responses_insert_members on sociometria.responses
for insert
with check (
  auth.role() = 'authenticated'
  and (
    sociometria.is_superadmin()
    or sociometria.has_company_role(company_id, array['admin','manager','employee'])
  )
);

-- Re-grant execute on helper functions to authenticated role
grant execute on function sociometria.is_company_member(uuid, uuid) to authenticated;
grant execute on function sociometria.has_company_role(uuid, text[], uuid) to authenticated;
