import { useState, useEffect } from 'react';
// Ajuste o caminho do supabase para o diretório compartilhado. O alias `@`
// resolve para `src`, então incluímos `shared/lib` aqui.
import { supabase } from '@/shared/lib/supabase';

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
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

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

  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };

  const createProfile = async (userId: string, companyId: string, role: string = 'admin') => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    console.log('Tentando criar/atualizar perfil para usuário:', userId, 'na empresa:', companyId);
    
    // Verificar se o perfil já existe
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = nenhum registro encontrado
      console.error('Erro ao verificar perfil existente:', selectError);
      throw selectError;
    }

    if (existingProfile) {
      console.log('Perfil já existe, atualizando...');
      // Atualizar perfil existente
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
    } else {
      console.log('Criando novo perfil...');
      // Criar novo perfil
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
    }
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