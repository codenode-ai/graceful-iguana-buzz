-- 0005_grant_permissions.sql
-- Ensure authenticated users can access the sociometria schema/tables under RLS policies

grant usage on schema sociometria to authenticated;
grant usage on schema sociometria to service_role;

grant select, insert, update, delete on all tables in schema sociometria to authenticated;
grant select on all tables in schema sociometria to service_role;

alter default privileges in schema sociometria
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema sociometria
  grant select on tables to service_role;
