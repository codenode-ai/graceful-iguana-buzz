import { createClient } from '@supabase/supabase-js';

// Usar as mesmas credenciais do seu .env
const supabaseUrl = 'https://swjeufricwpedqgoenbe.supabase.co';
const supabaseServiceKey = 'SUA_SERVICE_KEY_AQUI'; // Você precisa obter esta do dashboard do Supabase

// Conectar com a service key (que tem permissões administrativas)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setupSchema() {
  console.log('=== Configurando schema sociometria ===');
  
  try {
    // Verificar schemas existentes
    console.log('Verificando schemas atuais...');
    const { data: currentSchemas, error: schemasError } = await supabaseAdmin
      .from('information_schema.schemata')
      .select('schema_name')
      .ilike('schema_name', 'sociometria');
    
    if (schemasError) {
      console.error('Erro ao verificar schemas:', schemasError.message);
      return;
    }
    
    if (currentSchemas && currentSchemas.length > 0) {
      console.log('Schema sociometria já existe');
    } else {
      console.log('Schema sociometria não encontrado, criando...');
      // O schema é criado pelo seu script SQL, então não precisamos criar aqui
    }
    
    // Verificar se as tabelas existem
    console.log('Verificando tabelas no schema sociometria...');
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'sociometria');
    
    if (tablesError) {
      console.error('Erro ao verificar tabelas:', tablesError.message);
    } else {
      console.log('Tabelas encontradas:', tables.map(t => t.table_name));
    }
    
    console.log('\n=== Instruções para configurar o Supabase ===');
    console.log('1. Acesse o dashboard do Supabase');
    console.log('2. Vá para "Database" > "Settings"');
    console.log('3. Em "Schemas", adicione "sociometria" à lista de schemas');
    console.log('4. Salve as configurações');
    console.log('\nAlternativamente, você pode executar este SQL como superuser:');
    console.log('ALTER DATABASE postgres SET search_path TO "$user", public, sociometria, extensions;');
    
  } catch (err) {
    console.error('❌ Erro durante a configuração:', err);
  }
}

// Executar a configuração
setupSchema();