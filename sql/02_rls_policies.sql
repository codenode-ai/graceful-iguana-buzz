-- 02_rls_policies.sql
-- Habilita RLS
alter table sociometria.companies enable row level security;
alter table sociometria.profiles enable row level security;
alter table sociometria.employees enable row level security;
alter table sociometria.responses enable row level security;

-- Remover políticas existentes primeiro para evitar conflitos
drop policy if exists "companies insert own" on sociometria.companies;
drop policy if exists "profiles insert own" on sociometria.profiles;
drop policy if exists "responses insert own" on sociometria.responses;
drop policy if exists "responses read same company" on sociometria.responses;
drop policy if exists "responses admin rw" on sociometria.responses;
drop policy if exists "employees read same company" on sociometria.employees;
drop policy if exists "employees admin rw" on sociometria.employees;
drop policy if exists "profiles update own" on sociometria.profiles;
drop policy if exists "profiles select own" on sociometria.profiles;

-- Remover funções existentes
drop function if exists sociometria.current_employee_id() cascade;
drop function if exists sociometria.is_admin() cascade;
drop function if exists sociometria.current_profile_company_id() cascade;

-- Helpers
create or replace function sociometria.current_profile_company_id() 
returns uuid 
language sql 
stable 
as $function$
  select company_id from sociometria.profiles where user_id = auth.uid()
$function$;

create or replace function sociometria.is_admin() 
returns boolean 
language sql 
stable 
as $function$
  select exists(select 1 from sociometria.profiles p where p.user_id = auth.uid() and p.role = 'admin')
$function$;

-- COMPANIES: permitir que usuários criem sua primeira empresa
create policy "companies insert own" on sociometria.companies
  for insert
  with check (true); -- Allow any authenticated user to create a company initially

-- PROFILES: permitir que usuários criem seu próprio perfil
create policy "profiles insert own" on sociometria.profiles
  for insert
  with check (user_id = auth.uid()); -- Allow user to create their own profile

-- PROFILES: usuário só enxerga o próprio perfil
create policy "profiles select own" on sociometria.profiles
  for select using (user_id = auth.uid());

create policy "profiles update own" on sociometria.profiles
  for update using (user_id = auth.uid());

-- EMPLOYEES: admin lê/escreve de sua empresa; employees (conta) somente leitura da mesma empresa
create policy "employees admin rw" on sociometria.employees
  for all
  using (company_id = sociometria.current_profile_company_id() and sociometria.is_admin())
  with check (company_id = sociometria.current_profile_company_id() and sociometria.is_admin());

create policy "employees read same company" on sociometria.employees
  for select
  using (company_id = sociometria.current_profile_company_id());

-- RESPONSES: admin rw na própria empresa; funcionária pode inserir/ler apenas suas próprias saídas
create policy "responses admin rw" on sociometria.responses
  for all
  using (company_id = sociometria.current_profile_company_id() and sociometria.is_admin())
  with check (company_id = sociometria.current_profile_company_id() and sociometria.is_admin());

-- Funcionária autenticada pode ver respostas da sua empresa (leitura agregada do sociograma)
create policy "responses read same company" on sociometria.responses
  for select
  using (company_id = sociometria.current_profile_company_id());

-- Funcionária pode inserir respostas originadas dela mesma
-- Para isso, precisamos mapear employee_id do usuário (opcional: coluna opcional em profiles)
alter table if exists sociometria.profiles add column if not exists employee_id uuid references sociometria.employees(id);

create or replace function sociometria.current_employee_id() 
returns uuid 
language sql 
stable 
as $function$
  select employee_id from sociometria.profiles where user_id = auth.uid()
$function$;

create policy "responses insert own" on sociometria.responses
  for insert
  with check (
    company_id = sociometria.current_profile_company_id()
    and from_employee_id = sociometria.current_employee_id()
  );

-- Por padrão, negar tudo que não estiver nas policies
