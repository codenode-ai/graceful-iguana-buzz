# Projeto Sociometria SaaS

Este repositório contém a aplicação React + Supabase para o fluxo de cadastro, login e gestão de empresas descrito no escopo.

## Pré-requisitos

- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado e autenticado (`supabase login`).
- Node 18+ e pnpm/npm instalados.
- Arquivo `.env` com:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - (opcional) `VITE_SUPABASE_SERVICE_ROLE_KEY` para scripts administrativos.

## Banco de Dados (Supabase)

1. Inicie o ambiente local do Supabase:
   ```bash
   supabase start
   ```
2. Aplique as migrations:
   ```bash
   supabase db reset --use-migrations
   ```
   O CLI executará automaticamente os arquivos em `sql/migrations/` na ordem (`0001`, `0002`, `0003`...).
3. Carregue os dados de desenvolvimento:
   ```bash
   supabase db connect
   # copie a connection string exibida e execute:
   psql "postgresql://postgres:postgres@localhost:54322/postgres" -f sql/seeds/0001_dev_seed.sql
   ```
   O seed cria usuários de teste, empresas, perfis, convites e respostas. Ajuste as credenciais no arquivo conforme necessário.
4. Para redefinir o ambiente a qualquer momento, execute novamente `supabase db reset --use-migrations` e reaplique o seed.

### Usuários Seed

| Papel        | E-mail                      | Observações                       |
|--------------|-----------------------------|-----------------------------------|
| superadmin   | `superadmin@sociometria.dev`| Acesso ao painel `/admin-saas`    |
| admin        | `admin@acme.dev`            | Admin da empresa *Acme Ltda*      |
| manager      | `manager@acme.dev`          | Gerencia equipe/questionários     |
| employee     | `employee@acme.dev`         | Responde questionários            |

As senhas devem ser definidas manualmente via dashboard do Supabase ou usando o CLI (`supabase auth signups`).

## Execução do Frontend

1. Instale dependências:
   ```bash
   pnpm install
   ```
2. Rode o projeto:
   ```bash
   pnpm dev
   ```

## Estrutura de SQL

- `sql/migrations/0001_*.sql`: cria o schema `sociometria` e extensões.
- `sql/migrations/0002_*.sql`: define tipos, tabelas (companies, profiles, invites, employees, responses) e triggers `updated_at`.
- `sql/migrations/0003_*.sql`: políticas RLS completas e RPCs (`get_company_metrics`, `get_saas_overview`).
- `sql/seeds/0001_dev_seed.sql`: dados iniciais para testes manuais de RBAC/onboarding.

## Próximos Passos

- Implementar `AuthProvider` no frontend e proteger rotas com base nas roles.
- Construir onboarding de empresas, convites e painel `/admin-saas` usando as estruturas criadas.

## Autenticação: recuperação e confirmação de e-mail

- Recuperar senha
  - Rota pública: `/forgot-password` (envia link via `supabase.auth.resetPasswordForEmail`).
  - Configure em Project Settings → Authentication → Redirect URLs para incluir a origem do app (ex.: `http://localhost:5173/reset-password`).
  - Rota pública: `/reset-password` (define a nova senha via `supabase.auth.updateUser`).

- Reenviar confirmação de e-mail
  - Na tela de Login, há a ação “Reenviar confirmacao” que chama `supabase.auth.resend({ type: 'signup', email })`.
  - Em desenvolvimento você pode ativar “Auto confirm new users” no Dashboard (Authentication → Providers → Email) caso não tenha SMTP configurado.

- Dicas
  - Garanta que `SITE_URL`/Redirect URLs no Supabase contém a origem local e de produção do frontend.
  - Personalize os templates de e-mail em Authentication → Templates (opcional).
### Promovendo superadmin

Após criar/confirmar o usuário (ex.: `contato@codenode.com.br`), execute no SQL Editor:
```sql
select sociometria.promote_to_superadmin('contato@codenode.com.br');
```
Isso garante `role = superadmin` e `company_id = null`, liberando o acesso ao painel `/admin-saas`.
