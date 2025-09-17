-- 01_schema.sql
-- Cria schema dedicado
create schema if not exists sociometria;

-- Tabelas principais
create table if not exists sociometria.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Perfis de usuário (mapeia auth.users -> role/empresa)
create table if not exists sociometria.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references sociometria.companies(id) on delete set null,
  role text check (role in ('admin','employee')) not null default 'admin',
  created_at timestamptz default now()
);

-- Funcionárias (podem ou não ter conta auth)
create table if not exists sociometria.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references sociometria.companies(id) on delete cascade,
  name text not null,
  language text,
  notes text,
  created_at timestamptz default now()
);

-- Respostas sociométricas (arestas do grafo)
-- question_key: 'q1' | 'q2' | 'q3'
create table if not exists sociometria.responses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references sociometria.companies(id) on delete cascade,
  from_employee_id uuid not null references sociometria.employees(id) on delete cascade,
  to_employee_id uuid not null references sociometria.employees(id) on delete cascade,
  question_key text check (question_key in ('q1','q2','q3')) not null,
  created_at timestamptz default now(),
  unique (from_employee_id, to_employee_id, question_key)
);

-- View simples para contagens
create or replace view sociometria.metrics as
select e.company_id,
  count(distinct e.id) as employees_count,
  count(distinct r.id) as responses_count
from sociometria.employees e
left join sociometria.responses r on r.company_id = e.company_id
group by 1;
