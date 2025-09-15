import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
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

    // Verificar se o perfil já existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      // Atualizar perfil existente
      const { data, error } = await supabase
        .from('profiles')
        .update({ company_id: companyId, role })
        .eq('user_id', userId)
        .select();
      
      if (error) throw error;
      return data;
    } else {
      // Criar novo perfil
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ user_id: userId, company_id: companyId, role }])
        .select();
      
      if (error) throw error;
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