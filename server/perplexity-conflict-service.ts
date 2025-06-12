import type { Conflict } from '../shared/schema.js';

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
}

interface ConflictIntelligence {
  region: string;
  conflictName: string;
  currentStatus: string;
  recentDevelopments: string[];
  severity: "critical" | "high" | "medium" | "low";
  defenseImpact: string;
  marketImplications: string;
  sourceLinks: string[];
  lastUpdated: string;
}

export class PerplexityConflictService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('PERPLEXITY_API_KEY not found in environment variables');
    }
  }

  async generateComprehensiveConflictUpdates(): Promise<ConflictIntelligence[]> {
    if (!this.apiKey) {
      console.error('❌ Perplexity API key not available for conflict analysis');
      return [];
    }

    try {
      console.log('🌍 Generating comprehensive global conflict intelligence...');

      const conflictRegions = [
        "Ukraine-Russia conflict",
        "Middle East tensions (Israel-Palestine, Iran-Israel)",
        "South China Sea disputes",
        "Taiwan Strait tensions",
        "North Korea nuclear developments",
        "Syria conflict",
        "Yemen conflict",
        "Afghanistan security situation",
        "Ethiopia-Tigray conflict",
        "Myanmar military situation"
      ];

      const conflictUpdates: ConflictIntelligence[] = [];

      // Generate intelligence for each major conflict region
      for (const region of conflictRegions) {
        try {
          const intelligence = await this.analyzeRegionalConflict(region);
          if (intelligence) {
            conflictUpdates.push(intelligence);
          }
          // Add delay to respect API limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Failed to analyze conflict in ${region}:`, error);
        }
      }

      console.log(`✅ Generated comprehensive intelligence for ${conflictUpdates.length} conflict regions`);
      return conflictUpdates;
    } catch (error) {
      console.error('❌ Error generating comprehensive conflict updates:', error);
      return [];
    }
  }

  private async analyzeRegionalConflict(region: string): Promise<ConflictIntelligence | null> {
    try {
      const prompt = `Analyze the current status of ${region} with focus on:
1. Latest developments in the past 24-48 hours
2. Current military/security situation
3. Impact on global defense markets and arms sales
4. Defense contractor involvement and opportunities
5. Geopolitical implications for defense spending
6. Key recent news articles and sources

Provide specific, factual information with current dates and figures where available. Focus on defense industry relevance and market implications.`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a defense intelligence analyst providing comprehensive conflict analysis with focus on defense market implications. Be precise, factual, and cite specific sources.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.2,
          top_p: 0.9,
          return_related_questions: false,
          search_recency_filter: 'day',
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data: PerplexityResponse = await response.json();
      const content = data.choices?.[0]?.message?.content;
      const citations = data.citations || [];

      if (!content) {
        console.error(`❌ No content received for ${region}`);
        return null;
      }

      // Parse the AI response to extract structured information
      const intelligence = this.parseConflictIntelligence(region, content, citations);
      return intelligence;
    } catch (error) {
      console.error(`❌ Error analyzing ${region}:`, error);
      return null;
    }
  }

  private parseConflictIntelligence(region: string, content: string, citations: string[]): ConflictIntelligence {
    // Extract key information from the AI response
    const lines = content.split('\n').filter(line => line.trim());
    
    // Determine severity based on content analysis
    const severity = this.determineSeverity(content);
    
    // Extract recent developments (look for numbered lists or bullet points)
    const developments = this.extractDevelopments(content);
    
    // Extract defense impact information
    const defenseImpact = this.extractDefenseImpact(content);
    
    // Extract market implications
    const marketImplications = this.extractMarketImplications(content);

    return {
      region: this.formatRegionName(region),
      conflictName: region,
      currentStatus: this.extractCurrentStatus(content),
      recentDevelopments: developments,
      severity,
      defenseImpact,
      marketImplications,
      sourceLinks: citations.slice(0, 5), // Limit to top 5 sources
      lastUpdated: new Date().toISOString()
    };
  }

  private determineSeverity(content: string): "critical" | "high" | "medium" | "low" {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('critical') || lowerContent.includes('escalating rapidly') || 
        lowerContent.includes('immediate threat') || lowerContent.includes('emergency')) {
      return 'critical';
    } else if (lowerContent.includes('high tension') || lowerContent.includes('active combat') || 
               lowerContent.includes('significant threat') || lowerContent.includes('major incident')) {
      return 'high';
    } else if (lowerContent.includes('moderate') || lowerContent.includes('ongoing concern') || 
               lowerContent.includes('diplomatic tension')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private extractDevelopments(content: string): string[] {
    const developments: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Look for numbered lists, bullet points, or lines with recent dates
      if (trimmed.match(/^\d+\./) || trimmed.startsWith('•') || trimmed.startsWith('-') || 
          trimmed.includes('recently') || trimmed.includes('yesterday') || trimmed.includes('today')) {
        if (trimmed.length > 20 && trimmed.length < 200) {
          developments.push(trimmed.replace(/^\d+\.|^•|^-/, '').trim());
        }
      }
    }
    
    return developments.slice(0, 4); // Limit to 4 key developments
  }

  private extractDefenseImpact(content: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('defense') && line.toLowerCase().includes('impact')) {
        return line.trim();
      }
    }
    
    // Fallback: extract defense-related sentences
    const sentences = content.split('.').filter(s => 
      s.toLowerCase().includes('defense') || s.toLowerCase().includes('military') || 
      s.toLowerCase().includes('arms') || s.toLowerCase().includes('weapons')
    );
    
    return sentences[0]?.trim() + '.' || 'Defense sector monitoring situation for potential opportunities.';
  }

  private extractMarketImplications(content: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('market') && (line.toLowerCase().includes('impact') || line.toLowerCase().includes('implications'))) {
        return line.trim();
      }
    }
    
    // Fallback: extract market-related sentences
    const sentences = content.split('.').filter(s => 
      s.toLowerCase().includes('market') || s.toLowerCase().includes('stock') || 
      s.toLowerCase().includes('contract') || s.toLowerCase().includes('spending')
    );
    
    return sentences[0]?.trim() + '.' || 'Market implications under assessment as situation develops.';
  }

  private extractCurrentStatus(content: string): string {
    const sentences = content.split('.').slice(0, 3); // Get first few sentences
    return sentences.join('. ').trim();
  }

  private formatRegionName(region: string): string {
    // Format region names for display
    if (region.includes('Ukraine')) return 'Eastern Europe';
    if (region.includes('Middle East')) return 'Middle East';
    if (region.includes('China Sea')) return 'Asia-Pacific';
    if (region.includes('Taiwan')) return 'Asia-Pacific';
    if (region.includes('North Korea')) return 'Asia-Pacific';
    if (region.includes('Syria')) return 'Middle East';
    if (region.includes('Yemen')) return 'Middle East';
    if (region.includes('Afghanistan')) return 'Central Asia';
    if (region.includes('Ethiopia')) return 'East Africa';
    if (region.includes('Myanmar')) return 'Southeast Asia';
    
    return region;
  }

  async getTodaysConflictIntelligence(): Promise<ConflictIntelligence[]> {
    // Check if we have fresh intelligence from today
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // For now, generate fresh intelligence each time
      // In production, you might want to cache this data
      return await this.generateComprehensiveConflictUpdates();
    } catch (error) {
      console.error('❌ Error getting today\'s conflict intelligence:', error);
      return [];
    }
  }
}

export const perplexityConflictService = new PerplexityConflictService();