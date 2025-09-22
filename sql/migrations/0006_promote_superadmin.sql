-- 0006_promote_superadmin.sql
-- Helper to promote an existing auth user to superadmin role

create or replace function sociometria.promote_to_superadmin(p_email text)
returns void
language plpgsql
security definer
set search_path = public, sociometria, auth
as $$
declare
  v_user auth.users%rowtype;
begin
  select * into v_user from auth.users where lower(email) = lower(p_email);
  if not found then
    raise exception 'User with email % not found in auth.users', p_email;
  end if;

  insert into sociometria.profiles (user_id, company_id, role)
  values (v_user.id, null, 'superadmin')
  on conflict (user_id) do update set company_id = null, role = 'superadmin';
end;
$$;

grant execute on function sociometria.promote_to_superadmin(text) to service_role;
