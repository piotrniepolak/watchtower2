// Test script to verify sector API endpoints
const testSectors = async () => {
  const sectors = ['defense', 'health', 'energy'];
  
  for (const sector of sectors) {
    console.log(`\n=== Testing ${sector} sector ===`);
    
    try {
      const predResponse = await fetch(`http://localhost:5000/api/analysis/predictions?sector=${sector}`);
      const predictions = await predResponse.json();
      console.log(`${sector} predictions:`, predictions.length > 0 ? predictions[0].conflictName || predictions[0].scenario : 'No data');
      
      const marketResponse = await fetch(`http://localhost:5000/api/analysis/market?sector=${sector}`);
      const market = await marketResponse.json();
      console.log(`${sector} market:`, market.sectorOutlook?.substring(0, 50) + '...');
      
    } catch (error) {
      console.error(`Error testing ${sector}:`, error.message);
    }
  }
};

testSectors();