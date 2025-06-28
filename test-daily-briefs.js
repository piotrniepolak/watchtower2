// Test the daily sector brief generator
import fetch from 'node-fetch';

async function testDailyBriefGenerator() {
  console.log('🧪 Testing Daily Sector Brief Generator...');
  
  try {
    // Test defense brief generation
    console.log('\n📰 Testing Defense Brief Generation...');
    const response = await fetch('http://localhost:5000/api/daily-briefs/defense', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const brief = await response.json();
      console.log('✅ Defense brief generated successfully');
      console.log('📊 Brief metrics:');
      console.log(`   - Executive Summary: ${brief.wordCounts?.executiveSummary || 'N/A'} words`);
      console.log(`   - Key Developments: ${brief.keyDevelopments?.length || 'N/A'} items`);
      console.log(`   - Geopolitical Analysis: ${brief.wordCounts?.geopoliticalAnalysis || 'N/A'} words`);
      console.log(`   - Market Impact Analysis: ${brief.wordCounts?.marketImpactAnalysis || 'N/A'} words`);
      console.log(`   - References: ${brief.references?.length || 'N/A'} verified URLs`);
      
      // Check formatting compliance
      console.log('\n🔍 Checking format compliance:');
      const hasEllipses = brief.executiveSummary?.includes('...');
      const properDevelopments = brief.keyDevelopments?.every(dev => 
        !dev.includes('...') && dev.endsWith('.') && !dev.includes('.com')
      );
      
      console.log(`   - No ellipses in content: ${!hasEllipses ? '✅' : '❌'}`);
      console.log(`   - Properly formatted developments: ${properDevelopments ? '✅' : '❌'}`);
      console.log(`   - Clean references section: ${brief.references?.length > 0 ? '✅' : '❌'}`);
      
    } else {
      console.log(`❌ Defense brief generation failed: ${response.status}`);
      const error = await response.text();
      console.log('Error:', error.substring(0, 500));
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testDailyBriefGenerator();