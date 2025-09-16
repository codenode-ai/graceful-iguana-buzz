import { supabase } from './lib/supabase';

async function debugAccountCreation() {
  console.log('=== Debug Account Creation ===');
  
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
    } else if (user) {
      console.log('✅ Authenticated as:', user.email);
      console.log('User ID:', user.id);
      
      // Check if user has a profile
      console.log('\nChecking if user has a profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.log('⚠️  Profile query error:', profileError.message);
        console.log('Profile error code:', profileError.code);
      } else if (profileError && profileError.code === 'PGRST116') {
        console.log('ℹ️  No profile found for user (this is expected for new users)');
      } else if (profile) {
        console.log('✅ User has a profile:', profile);
        
        // Check if profile has a company
        if (profile.company_id) {
          console.log('\nChecking company details...');
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', profile.company_id)
            .single();
          
          if (companyError) {
            console.log('⚠️  Company query error:', companyError.message);
          } else if (company) {
            console.log('✅ User\'s company:', company);
          } else {
            console.log('⚠️  No company found for profile');
          }
        } else {
          console.log('⚠️  Profile has no company_id');
        }
      } else {
        console.log('ℹ️  No profile found for user');
      }
      
      // List all companies for this user
      console.log('\nListing all companies...');
      const { data: allCompanies, error: allCompaniesError } = await supabase
        .from('companies')
        .select('*');
      
      if (allCompaniesError) {
        console.log('⚠️  Companies query error:', allCompaniesError.message);
      } else {
        console.log('📊 All companies:', allCompanies);
      }
      
      // List all profiles
      console.log('\nListing all profiles...');
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (allProfilesError) {
        console.log('⚠️  Profiles query error:', allProfilesError.message);
      } else {
        console.log('📊 All profiles:', allProfiles);
      }
    } else {
      console.log('⚠️  Not authenticated');
    }
    
    console.log('\n=== Debug Summary ===');
    console.log('ℹ️  This debug script helps identify issues with account creation');
    
  } catch (err) {
    console.error('❌ Unexpected error during debug:', err);
  }
}

// Run the debug script
debugAccountCreation();