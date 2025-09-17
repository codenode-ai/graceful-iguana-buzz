import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';

/**
 * Hook responsável por recuperar e vincular o perfil de um colaborador ao usuário logado.
 *
 * Este hook consulta a tabela `profiles` em Supabase utilizando o `userId`
 * fornecido. Ele devolve o `employeeId` associado ao usuário, além de
 * indicadores de carregamento e erro. Também expõe uma função
 * `linkEmployeeToUser` para atualizar o registro de perfil, associando
 * um employee ao usuário correspondente.
 */
export const useEmployeeProfile = (userId: string | undefined) => {
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      if (!userId || !supabase) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('employee_id')
          .eq('user_id', userId)
          .single();

        if (error) {
          setError(error.message);
        } else {
          setEmployeeId(data?.employee_id || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeProfile();
  }, [userId]);

  /**
   * Associa um employee existente a este usuário.
   * Atualiza a coluna `employee_id` na tabela `profiles`.
   */
  const linkEmployeeToUser = async (employeeId: string) => {
    if (!userId || !supabase) {
      throw new Error('User not authenticated or Supabase not initialized');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ employee_id: employeeId })
      .eq('user_id', userId)
      .select();

    if (error) {
      throw error;
    }

    setEmployeeId(employeeId);
    return data;
  };

  return {
    employeeId,
    loading,
    error,
    linkEmployeeToUser,
  };
};