import { supabase } from './lib/supabase';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return;
  }

  try {
    // Test authentication by getting the current user (will be null if not logged in)
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Supabase connection error:', error.message);
      return;
    }
    
    console.log('Supabase connection successful!');
    console.log('Current user:', user);
    
    // Test database connection by querying a simple table
    // This will fail if we don't have proper permissions, but that's expected
    const { data, error: dbError } = await supabase
      .from('companies')
      .select('id')
      .limit(1);
    
    if (dbError && dbError.code !== '42501') { // 42501 is permission denied, which is expected
      console.error('Database query error:', dbError.message);
    } else {
      console.log('Database connection test completed');
      if (data) {
        console.log('Query result (limited to 1):', data);
      }
    }
  } catch (err) {
    console.error('Unexpected error during Supabase test:', err);
  }
}

testSupabaseConnection();