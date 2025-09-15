import { supabase } from '@/lib/supabase';

export const createDefaultCompany = async (companyName: string) => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }

  // Criar uma nova empresa
  const { data, error } = await supabase
    .from('companies')
    .insert([{ name: companyName }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};