// Quick debug script to check sources section
import fetch from 'node-fetch';

async function checkSources() {
  try {
    const response = await fetch('http://0.0.0.0:5000/api/news/pharma/today');
    const data = await response.json();
    
    console.log('Sources Section:');
    console.log('================');
    console.log(data.sourcesSection || 'No sources section found');
    console.log('\n');
    
    console.log('Brief ID:', data.id);
    console.log('Date:', data.date);
    console.log('Sector:', data.sector);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSources();