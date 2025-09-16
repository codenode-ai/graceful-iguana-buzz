import { supabase } from './lib/supabase';

async function testSignUpResponse() {
  console.log('Testing Supabase signUp response structure...');
  
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return;
  }

  try {
    // Test the structure of the signUp response
    // We'll use a valid fake email format
    const fakeEmail = `test${Date.now()}@example.com`;
    
    console.log('Calling signUp with fake email:', fakeEmail);
    const response = await supabase.auth.signUp({
      email: fakeEmail,
      password: 'test-password-123',
    });
    
    console.log('Full signUp response:', JSON.stringify(response, null, 2));
    
    if (response.error) {
      console.log('Error in response:', response.error);
      console.log('Error status:', response.error.status);
      console.log('Error code:', response.error.code);
    } else {
      console.log('Data in response:', response.data);
      console.log('User in response.data:', response.data.user);
      console.log('Session in response.data:', response.data.session);
    }
  } catch (err) {
    console.error('Unexpected error during signUp test:', err);
  }
}

testSignUpResponse();