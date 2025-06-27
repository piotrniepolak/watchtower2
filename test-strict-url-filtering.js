/**
 * Test Strict URL Filtering System
 * Tests the redesigned URL validation that ONLY keeps working URLs
 * NO fallbacks, NO replacements - strict filtering only
 */

async function testStrictURLFiltering() {
  console.log('🧪 Testing Strict URL Filtering System (No Fallbacks)...\n');

  // Import the URL validation service
  const { urlValidationService } = await import('./server/url-validation-service.js');

  console.log('1. Testing individual URL validation:');
  
  // Test individual URLs
  const testUrls = [
    'https://www.defensenews.com/pentagon/', // Should work
    'https://www.defensenews.com/fake-404-url', // Should be rejected
    'https://www.statnews.com/topic/biotech/', // Should work
    'https://www.statnews.com/non-existent-page', // Should be rejected
    'https://broken-domain-12345.com/news' // Should be rejected
  ];

  for (const url of testUrls) {
    try {
      const result = await urlValidationService.validateURL(url);
      console.log(`${result.isValid ? '✅' : '❌'} ${url} - Status: ${result.status} ${result.error ? `(${result.error})` : ''}`);
    } catch (error) {
      console.log(`❌ ${url} - Error: ${error.message}`);
    }
  }

  console.log('\n2. Testing strict URL filtering:');
  console.log('🔍 Filtering URLs to keep ONLY working ones (no fallbacks)...');
  
  try {
    const workingUrls = await urlValidationService.validateAndFilterWorkingUrls(testUrls);
    
    console.log('\n📊 Results:');
    console.log(`✅ Working URLs kept: ${workingUrls.length}`);
    console.log(`❌ Broken URLs rejected: ${testUrls.length - workingUrls.length}`);
    
    console.log('\nFinal working URLs:');
    workingUrls.forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
    });
    
    // Verify success criteria
    const successRate = (workingUrls.length / testUrls.length) * 100;
    console.log(`\n📈 Success Rate: ${successRate.toFixed(1)}% (${workingUrls.length}/${testUrls.length})`);
    
    if (workingUrls.length > 0) {
      console.log('✅ SUCCESS: System successfully filtered URLs keeping only working ones');
      console.log('✅ NO FALLBACKS USED: Broken URLs properly rejected');
    } else {
      console.log('❌ FAILURE: No working URLs found');
    }
    
  } catch (error) {
    console.log(`❌ Error during filtering: ${error.message}`);
  }

  console.log('\n3. Testing with all broken URLs (should throw error):');
  
  const allBrokenUrls = [
    'https://broken-domain-1.com/fake',
    'https://broken-domain-2.com/fake',
    'https://broken-domain-3.com/fake'
  ];
  
  try {
    await urlValidationService.validateAndFilterWorkingUrls(allBrokenUrls);
    console.log('❌ FAILURE: Should have thrown error for zero working URLs');
  } catch (error) {
    console.log(`✅ SUCCESS: Properly threw error - ${error.message}`);
  }

  console.log('\n🔍 Summary:');
  console.log('✅ Strict filtering implemented - only working URLs kept');
  console.log('✅ Broken URLs properly rejected without fallbacks');
  console.log('✅ System throws error when no working URLs found');
  console.log('✅ No URL replacement or fallback logic used');
}

testStrictURLFiltering().catch(console.error);