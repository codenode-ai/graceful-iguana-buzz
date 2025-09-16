import { supabase } from '@/lib/supabase';

export const createDefaultCompany = async (companyName: string) => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }

  console.log('Tentando criar empresa:', companyName);
  
  // Criar uma nova empresa
  const { data, error } = await supabase
    .from('companies')
    .insert([{ name: companyName }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar empresa:', error);
    throw error;
  }

  console.log('Empresa criada com sucesso:', data);
  return data;
};