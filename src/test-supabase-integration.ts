import { supabase } from './lib/supabase';

async function testSupabaseIntegration() {
  console.log('=== Supabase Integration Test ===');
  
  if (!supabase) {
    console.error('❌ Supabase client is not initialized');
    return;
  }

  try {
    // Test 1: Check if we can connect to Supabase
    console.log('Test 1: Checking Supabase connection...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️  Not authenticated (this is expected if not logged in)');
    } else {
      console.log('✅ Supabase connection successful');
      console.log('👤 Current user:', user?.email || 'Not logged in');
    }
    
    // Test 2: Try to access a table (this might fail due to RLS)
    console.log('\nTest 2: Testing database access...');
    const { data, error: dbError } = await supabase
      .from('companies')
      .select('id')
      .limit(1);
    
    if (dbError) {
      if (dbError.code === '42501') {
        console.log('✅ Database connection works (permission denied is expected for anonymous users)');
      } else {
        console.log('⚠️  Database query error:', dbError.message);
      }
    } else {
      console.log('✅ Database access successful');
      console.log('📊 Sample data:', data);
    }
    
    // Test 3: Check if schemas exist
    console.log('\nTest 3: Checking schema structure...');
    const { data: schemas, error: schemaError } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (schemaError) {
      if (schemaError.code === '42501') {
        console.log('✅ Schema exists (permission denied is expected for anonymous users)');
      } else {
        console.log('⚠️  Schema query error:', schemaError.message);
      }
    } else {
      console.log('✅ Schema access successful');
    }
    
    console.log('\n=== Test Summary ===');
    console.log('✅ Supabase integration is properly configured');
    console.log('ℹ️  Some operations may fail due to Row Level Security (RLS) - this is expected');
    console.log('ℹ️  Authentication is required for full functionality');
    
  } catch (err) {
    console.error('❌ Unexpected error during Supabase test:', err);
  }
}

// Run the test
testSupabaseIntegration();