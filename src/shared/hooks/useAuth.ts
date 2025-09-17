import { useState, useEffect } from 'react';
// Import the Supabase client from the shared lib.  When using the alias
// `@`, the "shared" directory sits under `src/shared`, so we import from
// `@/shared/lib/supabase` instead of the invalid `@/lib/supabase` path.
import { supabase } from '@/shared/lib/supabase';

/**
 * Hook responsável por lidar com a autenticação via Supabase.
 *
 * Este hook encapsula as operações de login, registro, login via link mágico
 * e sign‑out, além de expor o objeto `user` e um estado de carregamento.
 * Ele também assina as mudanças de autenticação e atualiza o estado quando
 * um usuário faz login ou logout.
 */
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const signInWithMagicLink = async (email: string) => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) {
      throw error;
    }

    return data;
  };

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
          throw new Error(
            'Muitas tentativas de criação de conta. Por favor, aguarde alguns minutos antes de tentar novamente.'
          );
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

  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };

  /**
   * Cria ou atualiza um registro de perfil na tabela `profiles`.
   *
   * O Supabase aplica políticas de RLS que garantem que apenas o próprio
   * usuário possa acessar/editar seu perfil. Este método verifica se já
   * existe um perfil para o `userId` informado. Se existir, atualiza os
   * campos `company_id` e `role`; caso contrário, insere um novo registro.
   */
  const createProfile = async (
    userId: string,
    companyId: string,
    role: string = 'admin'
  ) => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    console.log(
      'Tentando criar/atualizar perfil para usuário:',
      userId,
      'na empresa:',
      companyId
    );

    // Verificar se o perfil já existe
    const {
      data: existingProfile,
      error: selectError,
    } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    // PGRST116 = nenhum registro encontrado
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Erro ao verificar perfil existente:', selectError);
      throw selectError;
    }

    // Se perfil existir, atualiza
    if (existingProfile) {
      console.log('Perfil já existe, atualizando...');
      const { data, error } = await supabase
        .from('profiles')
        .update({ company_id: companyId, role })
        .eq('user_id', userId)
        .select();
      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw error;
      }
      console.log('Perfil atualizado:', data);
      return data;
    }

    // Caso contrário, cria um novo perfil
    console.log('Criando novo perfil...');
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ user_id: userId, company_id: companyId, role }])
      .select();
    if (error) {
      console.error('Erro ao criar perfil:', error);
      throw error;
    }
    console.log('Perfil criado:', data);
    return data;
  };

  return {
    user,
    loading,
    signIn,
    signInWithMagicLink,
    signUp,
    signOut,
    createProfile,
  };
};