import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5173';

async function testUsernameValidation() {
  console.log('Testing username validation functionality...\n');

  // Test 1: First user claims username "testuser"
  console.log('Test 1: First user claims username "testuser"');
  try {
    const response1 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Hello, I am the first testuser',
        category: 'general',
        tempUsername: 'testuser'
      })
    });
    
    const result1 = await response1.json();
    if (response1.ok) {
      console.log('✅ First user successfully claimed username "testuser"');
      console.log(`   Message ID: ${result1.id}`);
    } else {
      console.log('❌ First user failed to claim username:', result1.error);
    }
  } catch (error) {
    console.log('❌ Error in test 1:', error.message);
  }

  console.log('');

  // Test 2: Second user tries to use same username "testuser"
  console.log('Test 2: Second user attempts to use same username "testuser"');
  try {
    const response2 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Hello, I am trying to use the same username',
        category: 'general',
        tempUsername: 'testuser'
      })
    });
    
    const result2 = await response2.json();
    if (response2.status === 409) {
      console.log('✅ Second user correctly blocked from using duplicate username');
      console.log(`   Error: ${result2.error}`);
      console.log(`   Code: ${result2.code}`);
    } else if (response2.ok) {
      console.log('❌ Second user incorrectly allowed to use duplicate username');
    } else {
      console.log('❌ Unexpected error:', result2.error);
    }
  } catch (error) {
    console.log('❌ Error in test 2:', error.message);
  }

  console.log('');

  // Test 3: Second user tries different username "testuser2"
  console.log('Test 3: Second user uses different username "testuser2"');
  try {
    const response3 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Hello, I am testuser2 with a different username',
        category: 'general',
        tempUsername: 'testuser2'
      })
    });
    
    const result3 = await response3.json();
    if (response3.ok) {
      console.log('✅ Second user successfully used different username "testuser2"');
      console.log(`   Message ID: ${result3.id}`);
    } else {
      console.log('❌ Second user failed with different username:', result3.error);
    }
  } catch (error) {
    console.log('❌ Error in test 3:', error.message);
  }

  console.log('');

  // Test 4: Original user can continue using their username
  console.log('Test 4: Original user continues using "testuser"');
  try {
    const response4 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'This is my second message with the same username',
        category: 'general',
        tempUsername: 'testuser'
      })
    });
    
    const result4 = await response4.json();
    if (response4.ok) {
      console.log('✅ Original user can continue using their claimed username');
      console.log(`   Message ID: ${result4.id}`);
    } else if (response4.status === 409) {
      console.log('❌ Original user incorrectly blocked from using their own username');
    } else {
      console.log('❌ Unexpected error:', result4.error);
    }
  } catch (error) {
    console.log('❌ Error in test 4:', error.message);
  }

  console.log('\nTesting complete!');
}

// Run the test
testUsernameValidation().catch(console.error);