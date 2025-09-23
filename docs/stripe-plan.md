# Plano - Integração Stripe

## Visão Geral
Integração completa de billing SaaS com Stripe, cobrindo criação de clientes, assinaturas, mudanças de plano e feedback em tempo real para o dashboard.

## Backend (Supabase + Stripe)

### 1. Modelagem e migrations
- Tabelas novas: `stripe_customers`, `subscriptions`, `subscription_events`, `plans`.
- Expandir `companies` com campos `stripe_customer_id`, `subscription_status`, `current_plan`, `trial_ends_at`, `billing_email`.
- Views no schema `sociometria` para facilitar métricas (planos ativos, churn, etc.).
- Grants e RLS ajustados (somente superadmin pode ver métricas agregadas; empresa vê apenas a própria assinatura).

### 2. Integração Stripe
- Criar função/Edge Function `create-stripe-customer` chamada no onboarding (após empresa criada).
- Função para iniciar checkout de upgrade/downgrade (`create-checkout-session`).
- Webhooks hospedados via Supabase Edge Functions:
  - `customer.created` → persistir `stripe_customer_id`.
  - `customer.subscription.created/updated/deleted` → atualizar `subscriptions`, `companies.subscription_status`, `companies.current_plan`.
  - `invoice.payment_succeeded` / `invoice.payment_failed` → registrar em `subscription_events` e atualizar status.
- Manter chave secreta do Stripe como `STRIPE_SECRET_KEY` (via Supabase secrets) e `STRIPE_WEBHOOK_SECRET` para validação dos webhooks.
- Scripts seed para criar planos no Stripe (modo test) e sincronizá-los com a tabela `plans`.

### 3. Rotinas e scripts manuais
- Criar clientes Stripe para empresas existentes (script one-off que percorre `companies` e chama `stripe.customers.create`).
- Sincronização inicial de assinaturas (em caso de migração): script para atualizar `subscriptions` baseando-se no dado vindo da API do Stripe.

## Frontend

### 4. Painel da Empresa
- Página `Billing` acessível para `admin` e `superadmin` da empresa.
  - Exibir plano atual, status (`trial`, `active`, `past_due`), data de renovação.
  - Botões: `Alterar plano`, `Gerenciar pagamento` (abre Stripe customer portal), `Cancelar assinatura`.
  - Se estiver em trial, contador regressivo (`trial_ends_at`).
- Feedback em toasts/spinners enquanto aguarda retorno da API.

### 5. Painel SaaS (superadmin)
- `/admin-saas`: cards com métricas de assinaturas (quantos em cada plano, receita recorrente estimada, empresas em risco).
- Tabela com empresas: plano atual, status, valor mensal, links rápidos para abrir customer no Stripe.
- Filtros: por status (`trial`, `active`, `past_due`, `canceled`).

### 6. Hooks/States
- Hook `useBilling` para consultar dados de billing (`get_saas_overview`, `get_company_billing`).
- Atualizar AuthProvider para escutar mudanças de `company.subscription_status` e disponibilizar campo `billing` no contexto.

## Operações Manuais (antes de ir para produção)
- Configurar conta Stripe (modo test → live) e criar produtos/planos (Monthly/Yearly) com IDs compartilhados.
- Definir secret keys no Supabase: `SUPABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- Expor endpoints das Edge Functions (`supabase functions deploy ...`) e registrar URLs no painel Stripe (webhooks → endpoint).
- Habilitar portal de faturamento no Stripe Dashboard com logo e domínios permitidos.
- Se já existem empresas em produção, migrar dados para o Stripe manualmente e sincronizar `stripe_customer_id`/`subscriptions` via scripts mencionados.
- Testes obrigatórios com cartões de teste (`4242...`), falha (`4000...`), cancelamento e reativação para validar todos os eventos.

## Testes
- Unitários/integração: simular webhooks com `stripe-cli`, validar atualizações em `companies` e `subscriptions`.
- E2E: fluxo completo (trial → upgrade por checkout → alteração de plano → cancelamento → reativação) e verificação do dashboard.
- Regressão: rodar suites existentes após merge.

## Entregáveis
- Migrations `0007`+ com novas tabelas/grants.
- Edge Functions (webhooks, checkout session, portal).
- Hooks e componentes de billing no front.
- Documentação (README) com passos para configurar Stripe e rodar testes (`stripe-cli listen`, etc.).
- Scripts `pnpm stripe:sync` ou similares para sincronização inicial.
