// Test Supabase connection
const testSupabaseConnection = async () => {
  try {
    console.log('Testing connection to Supabase...');
    
    // Test 1: Direct fetch to Supabase
    console.log('Testing direct fetch to Supabase...');
    const response = await fetch('https://askyhriemixsuaagfgw.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFza3locmllbWlzeHVhb2FnZmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTcyMDQsImV4cCI6MjA3NzM3MzIwNH0.wh1Iq2DqcOYTiiSxWezCldtf0Ax6OFJCHaD_CxxoNQA',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Successfully connected to Supabase!');
      const data = await response.json();
      console.log('Supabase response:', data);
    } else {
      console.error('❌ Failed to connect to Supabase:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
  }
};

// Run the test
testSupabaseConnection();
