# Tratamento de Erros de Rate Limiting (429) no Supabase

## Problema Identificado

Durante os testes da funcionalidade de criação de conta, identificamos um erro 429 (Too Many Requests) retornado pela API do Supabase:

```
useAuth.ts:78  POST https://swjeufricwpedqgoenbe.supabase.co/auth/v1/signup 429
```

Esse erro ocorre quando fazemos muitas requisições em um curto período de tempo para a API de autenticação do Supabase.

## Solução Implementada

### 1. Tratamento Especializado do Erro 429

Adicionamos um tratamento específico para o erro 429 no hook `useAuth.ts`:

```typescript
const signUp = async (email: string, password: string) => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Tratamento especial para erro 429 (Too Many Requests)
      if (error.status === 429) {
        throw new Error('Muitas tentativas de criação de conta. Por favor, aguarde alguns minutos antes de tentar novamente.');
      }
      throw error;
    }

    return data;
  } catch (error: any) {
    // Tratamento adicional para erro de rede ou outros erros inesperados
    if (error.message && error.message.includes('Failed to fetch')) {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
    throw error;
  }
};
```

### 2. Melhorias no Log de Erros

Adicionamos um log de erro detalhado no componente Login para ajudar na depuração:

```typescript
} catch (error: any) {
  console.error("Authentication error:", error);
  toast({
    title: isSignUp ? "Erro ao criar conta" : "Erro no login",
    description: error.message || (isSignUp ? "Falha ao criar conta. Tente novamente." : "Falha ao fazer login. Tente novamente."),
    variant: "destructive",
  });
}
```

## Recomendações

1. **Evitar testes repetidos em curto período**: Durante o desenvolvimento, evite criar muitas contas em sequência para não atingir os limites de rate limiting.

2. **Usar contas de teste**: Para testes repetidos, use um pequeno conjunto de contas de teste em vez de criar novas contas a cada teste.

3. **Verificar console do navegador**: Sempre verifique o console do navegador para identificar erros específicos que podem ajudar na depuração.

4. **Aguardar entre testes**: Se encontrar o erro 429, aguarde alguns minutos antes de tentar novamente.

## Outros Warnings Resolvidos

Além do erro 429, também identificamos alguns warnings do React Router relacionados a mudanças futuras. Esses warnings não impedem o funcionamento da aplicação, mas indicam que podemos precisar atualizar a configuração de rotas no futuro.

Essas melhorias ajudarão a identificar mais facilmente problemas de autenticação e fornecer mensagens mais claras para os usuários durante o processo de criação de conta.