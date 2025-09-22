# Plano de Adequação ao Escopo

## Etapa 1 – Base Supabase
- Estruturar migrations com schema `sociometria`, tipos, tabelas, triggers e RPCs.
- Configurar políticas RLS alinhadas aos papéis (admin, manager, employee, superadmin).
- Criar seed de desenvolvimento e documentar setup (`supabase start`, `db reset`, aplicação do seed, definição de senhas).

## Etapa 2 – Camada de Autenticação
- Implementar `AuthProvider` global para sessão, perfil e empresa.
- Refatorar hooks (`useAuth`, `useCompany`, `useRole`) e remover duplicidades.
- Ajustar roteamento (guards, fallback de login, carregamento inicial) usando o provider.

## Etapa 3 – Fluxo de Onboarding de Empresa
- Construir wizard `/onboarding/company` (criar/selecionar empresa).
- Adaptar signup/login para redirecionar quando `company_id` estiver ausente.
- Implementar convites (`company_invites`), aceite e associação ao perfil.

## Etapa 4 – RBAC no Dashboard
- Proteger rotas existentes com `RequireCompany` e `RequireRole`.
- Adaptar telas (`/employees`, `/questionnaires`, `/reports`, `/sociogram`) para permissões específicas.
- Incluir UI de gestão interna: alterar papéis, remover usuários, acompanhar convites.

## Etapa 5 – Painel Administrativo SaaS
- Criar rota `/admin-saas` para superadmins com lista de empresas, status e plano.
- Consumir RPCs de métricas, exibir contagens e detalhes (billing, trial, suspensões).
- Permitir ações administrativas (alterar plano/status, analisar métricas agregadas).

## Etapa 6 – UX Complementar
- Fluxos de redefinição de senha, confirmação de e-mail e alerta de sessão expirada.
- Padronizar textos/encoding e adicionar feedback de carregamento/erros.
- Documentar fluxos e componentes compartilhados.

## Etapa 7 – Testes e Qualidade
- Criar testes unitários para hooks/provider/RBAC (Vitest) e mocks Supabase.
- Adotar suíte e2e cobrindo cadastro -> empresa -> dashboard e acesso superadmin.
- Integrar lint/test em CI local e checklist de release.
