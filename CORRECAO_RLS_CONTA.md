# Correção das Políticas de Segurança (RLS) para Criação de Conta

## Problema Identificado

O erro ao criar uma nova conta estava relacionado às políticas de segurança (RLS - Row Level Security) no Supabase. Quando um novo usuário tentava se registrar, o sistema não conseguia criar a empresa e o perfil do usuário devido a restrições nas políticas de segurança.

## Causa do Problema

1. **Ausência de políticas para criação de registros**: As políticas RLS existentes permitiam apenas a leitura e atualização de registros, mas não a criação inicial de empresas e perfis.

2. **Funções de segurança dependentes de perfil existente**: As funções `current_profile_company_id()` e `is_admin()` dependem da existência de um perfil, que ainda não existe no momento da criação da conta.

## Solução Implementada

Foram adicionadas duas novas políticas no arquivo `sql/02_rls_policies.sql`:

1. **Política para criação de empresas**:
   ```sql
   create policy "companies insert own" on sociometria.companies
     for insert
     with check (true); -- Permite que qualquer usuário autenticado crie uma empresa inicialmente
   ```

2. **Política para criação de perfis**:
   ```sql
   create policy "profiles insert own" on sociometria.profiles
     for insert
     with check (user_id = auth.uid()); -- Permite que o usuário crie seu próprio perfil
   ```

Além disso, foi adicionada a linha para habilitar RLS na tabela de empresas:
```sql
alter table sociometria.companies enable row level security;
```

## Benefícios da Solução

1. **Permite criação de conta**: Novos usuários podem criar sua empresa e perfil sem restrições de segurança.

2. **Mantém segurança**: Após a criação, as políticas existentes continuam protegendo os dados, permitindo que usuários acessem apenas informações de sua própria empresa.

3. **Fluxo de criação simplificado**: Remove a necessidade de contornos complexos no código da aplicação para lidar com as restrições iniciais.

## Próximos Passos

1. Executar o script `02_rls_policies.sql` atualizado no Supabase
2. Testar o fluxo de criação de conta novamente
3. Verificar se não há outros pontos que possam ser afetados pelas mudanças