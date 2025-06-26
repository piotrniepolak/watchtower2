const fetch = require('node-fetch');

async function enhanceDefenseBrief() {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.error('PERPLEXITY_API_KEY not found');
    return;
  }

  const prompt = `Generate a comprehensive defense intelligence brief for June 26, 2025, focusing on these requirements:

EXECUTIVE SUMMARY: Provide a cohesive narrative of main developments from the last 24 hours with strategic context and impact assessment.

KEY DEVELOPMENTS: Extract 6 specific developments with hard facts, dates, figures, and direct impacts from these recent events:
- NATO summit outcomes and alliance commitments
- Germany's defense spending plans and budget allocations
- Pentagon fiscal 2026 budget details and procurement priorities
- Iran-Israel tensions and strike assessments
- Navy shipbuilding programs and vessel requests
- European defense modernization initiatives

GEOPOLITICAL ANALYSIS: Focus on strategic and diplomatic repercussions, regional context, alliance dynamics, and likely next moves based on:
- Middle East stability following Iranian nuclear facility strikes
- NATO cohesion and burden-sharing agreements
- U.S. defense posture and allied coordination
- Regional security implications and threat assessments

MARKET IMPACT ANALYSIS: Analyze concrete effects on defense equities, government contracts, and corporate earnings with specific:
- Defense contractor stock movements and valuations
- Government contract awards and deal flow
- Procurement budget allocations and spending patterns
- Industry revenue projections and earnings impacts

Search only government releases, official statements, defense publications, and Tier-1 media from the last 24 hours. Include specific metrics, quotes, timelines, and concrete examples. No placeholder text or unsupported claims.

Provide full article URLs for all sources referenced.`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a defense intelligence analyst. Provide comprehensive analysis with specific data, metrics, and verifiable facts. Include all source URLs.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.2,
        top_p: 0.9,
        search_recency_filter: 'day',
        return_images: false,
        return_related_questions: false,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      console.log('=== ENHANCED DEFENSE BRIEF ===');
      console.log(data.choices[0].message.content);
      
      if (data.citations) {
        console.log('\n=== CITATIONS ===');
        data.citations.forEach((citation, index) => {
          console.log(`${index + 1}. ${citation}`);
        });
      }
    } else {
      console.error('No response content received');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error enhancing defense brief:', error);
  }
}

enhanceDefenseBrief();