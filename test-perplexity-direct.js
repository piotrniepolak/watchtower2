// Direct test of Perplexity API to identify article discovery issues
import fetch from 'node-fetch';

async function testPerplexityDirectly() {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.log('❌ PERPLEXITY_API_KEY not found');
    return;
  }

  console.log('🔍 Testing Perplexity API directly for pharmaceutical articles...');

  const testPrompt = `Find recent articles from STAT News about pharmaceutical sector news published in the last 24-48 hours.

Search STAT News for articles covering:
Drug approvals, FDA decisions, clinical trial results, pharmaceutical company earnings, biotech developments, drug pricing, regulatory updates, merger and acquisition activity

Format each article found as:
ARTICLE 1:
Title: [exact headline]
Source: STAT News
Date: [publication date]
URL: [direct article link]
Content: [brief summary]

Find 2-4 recent articles from STAT News if available. Only return articles that actually exist with working URLs.`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{ role: 'user', content: testPrompt }],
        max_tokens: 2000,
        temperature: 0.1,
        search_recency_filter: "day",
        return_citations: true
      })
    });

    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} - ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log('\n📝 Full Perplexity Response:');
    console.log('Content:', data.choices[0].message.content);
    console.log('\n🔗 Citations:', data.citations || []);
    
    // Test article parsing
    const content = data.choices[0].message.content;
    const citations = data.citations || [];
    
    console.log('\n🧪 Testing article parsing...');
    
    // Test multiple parsing patterns
    const patterns = [
      /ARTICLE\s+(\d+):\s*\n(?:.*?\n)*?Title:\s*(.+?)\n(?:.*?\n)*?Source:\s*(.+?)\n(?:.*?\n)*?Date:\s*(.+?)\n(?:.*?\n)*?URL:\s*(.+?)\n(?:.*?\n)*?Content:\s*(.+?)(?=\n\nARTICLE|\n\n(?!URL|Content|Date|Source|Title)|$)/gims,
      /###\s*ARTICLE\s*(\d+):\s*\n(?:.*?\n)*?[*-]\s*\*\*Title:\*\*\s*(.+?)\n(?:.*?\n)*?[*-]\s*\*\*Source:\*\*\s*(.+?)\n(?:.*?\n)*?[*-]\s*\*\*Date:\*\*\s*(.+?)\n(?:.*?\n)*?[*-]\s*\*\*URL:\*\*\s*(.+?)\n(?:.*?\n)*?[*-]\s*\*\*Content:\*\*\s*(.+?)(?=\n\n###|\n\n(?![*-])|$)/gims,
      /\*\*(.+?)\*\*\s*\n(?:.*?\n)*?(?:Published|Date):\s*(.+?)\n(?:.*?\n)*?(?:URL|Link):\s*(.+?)(?:\n|$)/gims
    ];
    
    let foundArticles = [];
    
    patterns.forEach((pattern, index) => {
      console.log(`\n🔍 Testing pattern ${index + 1}:`);
      const matches = [...content.matchAll(pattern)];
      console.log(`Found ${matches.length} matches`);
      
      matches.forEach((match, i) => {
        console.log(`  Article ${i + 1}:`, {
          title: match[2] || match[1] || 'No title',
          source: match[3] || 'STAT News',
          date: match[4] || match[2] || 'No date',
          url: match[5] || match[3] || 'No URL'
        });
      });
      
      if (matches.length > 0) {
        foundArticles = matches.map(match => ({
          title: match[2] || match[1] || 'Unknown',
          source: match[3] || 'STAT News',
          date: match[4] || match[2] || 'Recent',
          url: match[5] || match[3] || '',
          content: match[6] || match[4] || 'Brief summary'
        }));
      }
    });
    
    console.log(`\n✅ Total articles parsed: ${foundArticles.length}`);
    
    if (foundArticles.length === 0) {
      console.log('\n🚨 ISSUE IDENTIFIED: No articles parsed from Perplexity response');
      console.log('This is why the system finds so few articles!');
      console.log('\nResponse format analysis needed...');
    }
    
  } catch (error) {
    console.log('❌ Error testing Perplexity:', error.message);
  }
}

testPerplexityDirectly();