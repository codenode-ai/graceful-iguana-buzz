import { supabase } from './lib/supabase';

async function verifySchema() {
  console.log('=== Verificação do Schema ===');
  
  if (!supabase) {
    console.error('❌ Supabase client is not initialized');
    return;
  }

  try {
    // Verificar se o schema 'sociometria' existe
    console.log('Verificando schemas existentes...');
    const { data: schemas, error: schemaError } = await supabase
      .from('information_schema.schemata')
      .select('schema_name')
      .ilike('schema_name', 'sociometria');
    
    if (schemaError) {
      console.error('Erro ao verificar schemas:', schemaError.message);
    } else {
      console.log('Schemas encontrados:', schemas);
    }

    // Verificar tabelas no schema 'sociometria'
    console.log('\nVerificando tabelas no schema sociometria...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'sociometria');
    
    if (tablesError) {
      console.error('Erro ao verificar tabelas:', tablesError.message);
    } else {
      console.log('Tabelas encontradas:', tables);
    }

    // Verificar se as tabelas específicas existem
    console.log('\nVerificando estrutura das tabelas...');
    
    // Verificar companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id')
      .limit(1);
    
    if (companiesError) {
      console.log('Tabela companies não encontrada ou erro de acesso:', companiesError.message);
    } else {
      console.log('Tabela companies acessível');
    }
    
    // Verificar employees
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id')
      .limit(1);
    
    if (employeesError) {
      console.log('Tabela employees não encontrada ou erro de acesso:', employeesError.message);
    } else {
      console.log('Tabela employees acessível');
    }
    
    // Verificar profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);
    
    if (profilesError) {
      console.log('Tabela profiles não encontrada ou erro de acesso:', profilesError.message);
    } else {
      console.log('Tabela profiles acessível');
    }
    
    // Verificar responses
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('id')
      .limit(1);
    
    if (responsesError) {
      console.log('Tabela responses não encontrada ou erro de acesso:', responsesError.message);
    } else {
      console.log('Tabela responses acessível');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error during schema verification:', err);
  }
}

// Executar a verificação
verifySchema();