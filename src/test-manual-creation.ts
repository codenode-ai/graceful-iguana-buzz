import { supabase } from './lib/supabase';
import { createDefaultCompany } from './lib/companyUtils';

// Copiando a função createProfile diretamente para teste
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

async function testManualCreation() {
  console.log('=== Teste Manual de Criação de Empresa e Perfil ===');
  
  if (!supabase) {
    console.error('❌ Supabase client is not initialized');
    return;
  }

  try {
    // Check if we're authenticated
    console.log('Checking authentication status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️  Not authenticated');
      return;
    } else if (user) {
      console.log('✅ Authenticated as:', user.email);
      console.log('User ID:', user.id);
      
      // Test creating a company manually
      console.log('\nTesting manual company creation...');
      try {
        const companyName = `Test Company ${Date.now()}`;
        console.log('Creating company with name:', companyName);
        const company = await createDefaultCompany(companyName);
        console.log('✅ Company created successfully:', company);
        
        // Test creating a profile manually
        console.log('\nTesting manual profile creation...');
        const profile = await createProfile(user.id, company.id, 'admin');
        console.log('✅ Profile created successfully:', profile);
      } catch (creationError: any) {
        console.error('❌ Error creating company or profile:', creationError);
        console.error('Error details:', {
          message: creationError.message,
          code: creationError.code,
          details: creationError.details
        });
      }
    } else {
      console.log('⚠️  Not authenticated');
    }
  } catch (err) {
    console.error('❌ Unexpected error during test:', err);
  }
}

// Run the test script
testManualCreation();