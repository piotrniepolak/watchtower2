// Test the intelligence service automation
const fetch = require('node-fetch');

async function testIntelligenceAutomation() {
  try {
    console.log('🧪 Testing intelligence automation...');
    
    // Try to trigger a fresh intelligence generation
    const response = await fetch('http://0.0.0.0:5173/api/intelligence/defense/four-step', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Intelligence service responded');
      console.log('📊 Brief ID:', data.id);
      console.log('📅 Generated at:', data.generatedAt);
      
      // Check if automatic fixes were applied
      const hasEllipses = data.executiveSummary.includes('...');
      const hasInlineSources = data.keyDevelopments.some(dev => 
        dev.includes('.com') || dev.includes('reports')
      );
      
      console.log('🔧 Automation Status:');
      console.log('  - Ellipses removed:', !hasEllipses ? '✅' : '❌');
      console.log('  - Inline sources cleaned:', !hasInlineSources ? '✅' : '❌');
      console.log('  - Content length:', data.executiveSummary.length, 'chars');
      console.log('  - Key developments:', data.keyDevelopments.length, 'items');
      
    } else {
      console.log('❌ Failed to fetch intelligence:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Error testing automation:', error.message);
  }
}

testIntelligenceAutomation();