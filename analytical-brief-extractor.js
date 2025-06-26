// Analytical Brief Extractor - Extracting authentic articles from Watchtower intelligence system
const http = require('http');

async function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve({ error: 'Failed to parse JSON', raw: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function extractBriefs() {
  console.log('Extracting authentic intelligence briefs from Watchtower...\n');
  
  try {
    // Get Defense Intelligence
    console.log('=== CONFLICTS SECTION ===');
    const defenseData = await makeRequest('/api/intelligence/defense/four-step');
    if (defenseData.error) {
      console.log('Defense brief not available:', defenseData.error);
    } else {
      console.log('Defense Brief Content:');
      console.log('Executive Summary:', defenseData.executiveSummary?.substring(0, 200) + '...');
      console.log('Key Developments:', defenseData.keyDevelopments?.length || 0, 'items');
      console.log('Source URLs:', defenseData.sourceUrls?.length || 0, 'sources');
      if (defenseData.sourceUrls) {
        defenseData.sourceUrls.forEach(url => console.log(' -', url));
      }
    }
    
    // Get Pharmaceutical Intelligence
    console.log('\n=== PHARMA SECTION ===');
    const pharmaData = await makeRequest('/api/intelligence/pharmaceutical/four-step');
    if (pharmaData.error) {
      console.log('Pharma brief not available:', pharmaData.error);
    } else {
      console.log('Pharma Brief Content:');
      console.log('Executive Summary:', pharmaData.executiveSummary?.substring(0, 200) + '...');
      console.log('Key Developments:', pharmaData.keyDevelopments?.length || 0, 'items');
      console.log('Source URLs:', pharmaData.sourceUrls?.length || 0, 'sources');
      if (pharmaData.sourceUrls) {
        pharmaData.sourceUrls.forEach(url => console.log(' -', url));
      }
    }
    
    // Get Energy Intelligence
    console.log('\n=== ENERGY SECTION ===');
    const energyData = await makeRequest('/api/intelligence/energy/four-step');
    if (energyData.error) {
      console.log('Energy brief not available:', energyData.error);
    } else {
      console.log('Energy Brief Content:');
      console.log('Executive Summary:', energyData.executiveSummary?.substring(0, 200) + '...');
      console.log('Key Developments:', energyData.keyDevelopments?.length || 0, 'items');
      console.log('Source URLs:', energyData.sourceUrls?.length || 0, 'sources');
      if (energyData.sourceUrls) {
        energyData.sourceUrls.forEach(url => console.log(' -', url));
      }
    }

    return { defenseData, pharmaData, energyData };
    
  } catch (error) {
    console.error('Error extracting briefs:', error);
    return null;
  }
}

extractBriefs().then(results => {
  if (results) {
    console.log('\n=== EXTRACTION COMPLETE ===');
    console.log('Defense sources:', results.defenseData?.sourceUrls?.length || 0);
    console.log('Pharma sources:', results.pharmaData?.sourceUrls?.length || 0);
    console.log('Energy sources:', results.energyData?.sourceUrls?.length || 0);
  }
});