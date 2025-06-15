// Test pharmaceutical intelligence brief source links functionality
const fetch = require('node-fetch');

async function testPharmaSourceLinks() {
  try {
    console.log('Testing pharmaceutical intelligence brief generation...');
    
    // Generate a new pharmaceutical intelligence brief
    const generateResponse = await fetch('http://localhost:5000/api/pharma-news/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ forceGenerate: true })
    });
    
    console.log('Generate response status:', generateResponse.status);
    
    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      console.log('Generated brief title:', generateData.title);
      
      if (generateData.sourcesSection) {
        console.log('Sources section found:');
        console.log(generateData.sourcesSection.substring(0, 500) + '...');
        
        // Test if markdown links are properly formatted
        const markdownLinks = generateData.sourcesSection.match(/\d+\.\s*\[([^\]]+)\]\(([^)]+)\)/g);
        if (markdownLinks) {
          console.log(`Found ${markdownLinks.length} markdown links:`);
          markdownLinks.slice(0, 3).forEach((link, index) => {
            console.log(`${index + 1}. ${link}`);
          });
        } else {
          console.log('No markdown links found in sourcesSection');
        }
      } else {
        console.log('No sourcesSection in generated brief');
      }
    } else {
      console.log('Generate request failed');
    }
    
    // Fetch the latest pharmaceutical brief
    const fetchResponse = await fetch('http://localhost:5000/api/pharma-news', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('Fetch response status:', fetchResponse.status);
    
    if (fetchResponse.ok) {
      const fetchData = await fetchResponse.json();
      console.log('Fetched brief title:', fetchData.title);
      
      if (fetchData.sourcesSection) {
        console.log('Sources section length:', fetchData.sourcesSection.length);
        
        // Test extractReferences function logic
        const markdownLinks = fetchData.sourcesSection.match(/\d+\.\s*\[([^\]]+)\]\(([^)]+)\)/g);
        if (markdownLinks) {
          console.log('Source links validation:');
          markdownLinks.slice(0, 3).forEach((link, index) => {
            const match = link.match(/\d+\.\s*\[([^\]]+)\]\(([^)]+)\)/);
            if (match) {
              const title = match[1].trim();
              const url = match[2].trim();
              console.log(`${index + 1}. Title: "${title}"`);
              console.log(`   URL: ${url}`);
              console.log(`   Valid URL: ${url.startsWith('http')}`);
            }
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPharmaSourceLinks();