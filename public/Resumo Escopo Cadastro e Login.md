Resumo do escopo atual - Fluxo Cadastro e Login

1. Autenticação

Baseada no Supabase Auth (e-mail + senha).

Sessão mantida automaticamente pelo Supabase.

Contexto (AuthProvider) criado no frontend para gerenciar login/logout e expor estado do usuário.

2. Perfis

Tabela profiles armazena:

- user_id
- company_id
- role (admin, manager, employee, ou superadmin no caso do painel do SaaS).

Ao registrar um novo usuário:

- Se não tiver empresa -> redireciona para tela "Criar Empresa".
- Se criar empresa -> vira admin dela.
- Futuramente poderá ser convidado para empresa já existente.

3. Empresas

Tabela companies representa os clientes B2B do SaaS.

Relacionamento 1:N -> uma empresa pode ter vários usuários (via profiles).

Admin da empresa é responsável por gerenciar seus funcionários/usuários internos.

4. Papéis (RBAC)

Dentro da empresa cliente:

- admin -> gerencia tudo (funcionários, relatórios, questionários).
- manager -> gerencia funcionários e questionários.
- employee -> apenas responde questionários.

No SaaS (B2B):

- superadmin -> papel reservado à equipe do SaaS para acessar o painel administrativo do SaaS (ver status de empresas, planos, métricas, billing).

5. Fluxo de um novo usuário

- Faz login/cadastro.
- É redirecionado para criar uma empresa (se não tiver).
- Ganha papel admin na empresa criada.
- Tem acesso ao dashboard da empresa, adaptado conforme o papel.
- Toda a segurança é garantida por RLS no Supabase, que restringe cada usuário apenas aos dados da sua empresa.

6. Painel Administrativo do SaaS (B2B)

Focado somente na gestão de empresas clientes, não nos usuários internos delas.

Permite a superadmins:

- Listar empresas.
- Acompanhar status (trial, ativo, suspensão).
- Visualizar e alterar planos (Stripe integrado).
- Consultar métricas agregadas (quantas empresas ativas, quantas por plano, crescimento etc.).

Esse painel roda em /admin-saas, protegido para superadmin.
