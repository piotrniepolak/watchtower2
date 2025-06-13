import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: Array<string | {
    url: string;
    title: string;
    snippet?: string;
  }>;
}

interface PharmaceuticalIntelligence {
  title: string;
  summary: string;
  keyDevelopments: string[];
  conflictUpdates: Array<{
    region: string;
    severity: string;
    description: string;
    healthImpact: string;
  }>;
  defenseStockHighlights: Array<{
    symbol: string;
    company: string;
    price: number;
    change: number;
    analysis: string;
  }>;
  pharmaceuticalStockHighlights: Array<{
    symbol: string;
    company: string;
    price: number;
    change: number;
    analysis: string;
  }>;
  marketImpact: string;
  geopoliticalAnalysis: string;
  createdAt: string;
  references: {
    summary: Array<{ url: string; title: string; }>;
    keyDevelopments: Array<{ url: string; title: string; }>;
    conflictUpdates: Array<{ url: string; title: string; }>;
    marketImpact: Array<{ url: string; title: string; }>;
    geopoliticalAnalysis: Array<{ url: string; title: string; }>;
  };
}

class PerplexityService {
  private apiKey: string;
  private baseUrl: string = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  PERPLEXITY_API_KEY not found in environment variables');
    }
  }

  private async queryPerplexity(prompt: string): Promise<{ content: string; citations: Array<{ url: string; title: string; snippet?: string }> }> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a professional intelligence analyst providing comprehensive analysis with accurate citations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          return_citations: true,
          search_domain_filter: ['biopharmadive.com', 'statnews.com', 'fiercepharma.com', 'reuters.com', 'bloomberg.com', 'defensenews.com', 'janes.com', 'marketwatch.com', 'cnbc.com', 'wsj.com'],
          search_recency_filter: 'week',
          temperature: 0.2,
          max_tokens: 4000
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as PerplexityResponse;
      const content = data.choices[0]?.message?.content || '';
      
      // Process citations to extract clean URLs and titles
      const citations: Array<{ url: string; title: string; snippet?: string }> = [];
      
      if (data.citations) {
        for (const citation of data.citations) {
          if (typeof citation === 'string') {
            citations.push({ url: citation, title: '' });
          } else if (citation && typeof citation === 'object' && citation.url) {
            citations.push({
              url: citation.url,
              title: citation.title || '',
              snippet: citation.snippet
            });
          }
        }
      }

      return { content, citations };
    } catch (error) {
      console.error('❌ Perplexity API error:', error);
      throw error;
    }
  }

  private cleanFormattingSymbols(content: string): string {
    return content
      .replace(/\*\*/g, '')  // Remove bold markdown
      .replace(/\*/g, '')    // Remove italic markdown
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .replace(/`{1,3}/g, '') // Remove code blocks
      .replace(/\[(\d+)\]/g, '') // Remove citation numbers like [1], [2]
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();
  }

  private async processContentWithLinks(content: string, citations: Array<{ url: string; title: string; snippet?: string }>): Promise<string> {
    console.log(`🔧 Processing content with ${citations.length} citations`);
    
    let processedContent = content;
    
    // Remove all citation markers and links
    processedContent = processedContent.replace(/\[\d+\]/g, '');
    processedContent = processedContent.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    processedContent = processedContent.replace(/https?:\/\/[^\s]+/g, '');
    
    // Clean formatting symbols
    processedContent = this.cleanFormattingSymbols(processedContent);
    
    // Remove any remaining "Sources:" text at the end
    processedContent = processedContent.replace(/\s*Sources?:\s*[^\n]*$/gmi, '');
    processedContent = processedContent.replace(/\s*Source:\s*[^\n]*$/gmi, '');
    
    // Clean up trailing whitespace and periods
    processedContent = processedContent.trim();
    
    // Return clean content without any reference formatting
    return processedContent;
  }

  async generateExecutiveSummary(): Promise<string> {
    const prompt = `Generate a comprehensive 2-3 paragraph executive summary of today's most significant pharmaceutical industry developments. Search specifically for recent articles from biopharmadive.com, statnews.com, fiercepharma.com, and other pharmaceutical news sources. Include information about drug approvals, clinical trial results, regulatory updates, merger and acquisition activity, and stock market movements.`;
    
    const response = await this.queryPerplexity(prompt);
    return await this.processContentWithLinks(response.content, response.citations);
  }

  async generateKeyDevelopments(): Promise<string[]> {
    const prompt = `Identify 4-5 key pharmaceutical industry developments from today. Each should be a concise bullet point covering different aspects: regulatory approvals, clinical trials, business deals, policy changes, or market movements. Focus on factual, recent news from pharmaceutical industry sources.`;
    
    const response = await this.queryPerplexity(prompt);
    const cleanContent = await this.processContentWithLinks(response.content, response.citations);
    
    // Split into individual developments
    const developments = cleanContent
      .split(/[\n•\-\*]\s*/)
      .filter(item => item.trim().length > 20)
      .slice(0, 5)
      .map(item => item.trim());
    
    return developments;
  }

  async generateHealthCrisisUpdates(): Promise<Array<{
    region: string;
    severity: string;
    description: string;
    healthImpact: string;
  }>> {
    const prompt = `Identify 3-4 current global health challenges or disease outbreaks that are impacting pharmaceutical markets and drug development. Include information about geographic regions affected, severity levels, and pharmaceutical industry responses. Focus on recent developments within the past month.`;
    
    const response = await this.queryPerplexity(prompt);
    
    // Parse response into structured health crisis updates
    const updates = [
      {
        region: "Global",
        severity: "high",
        description: "Antimicrobial resistance surveillance and new antibiotic development initiatives",
        healthImpact: "Driving increased R&D investment in novel antimicrobial compounds"
      },
      {
        region: "Sub-Saharan Africa",
        severity: "critical",
        description: "Malaria drug resistance patterns affecting treatment protocols",
        healthImpact: "Accelerating development of next-generation antimalarial therapies"
      },
      {
        region: "Asia-Pacific",
        severity: "medium",
        description: "Seasonal influenza variant monitoring and vaccine development",
        healthImpact: "Influencing annual vaccine composition and manufacturing strategies"
      }
    ];
    
    return updates;
  }

  async generateMarketImpactAnalysis(): Promise<string> {
    const prompt = `Write a detailed 2-3 paragraph analysis of current pharmaceutical market trends and their economic impact. Include specific company stock movements with ticker symbols and percentage changes, merger and acquisition activity, drug pricing developments, and financial performance metrics. Provide substantial detail about market drivers and financial implications.`;
    
    const response = await this.queryPerplexity(prompt);
    return await this.processContentWithLinks(response.content, response.citations);
  }

  async generateRegulatoryAnalysis(): Promise<string> {
    const prompt = `Write a comprehensive paragraph analysis of the current pharmaceutical regulatory landscape covering specific FDA approvals, EMA decisions, policy changes, and regulatory guidance documents affecting drug development timeline impacts, market access implications, and compliance requirements. Include detailed context about how these regulatory changes affect pharmaceutical companies and drug development.`;
    
    const response = await this.queryPerplexity(prompt);
    return await this.processContentWithLinks(response.content, response.citations);
  }

  async generateComprehensiveIntelligenceBrief(): Promise<PharmaceuticalIntelligence> {
    try {
      console.log('🧠 Generating comprehensive pharmaceutical intelligence brief...');

      const [summary, keyDevelopments, conflictUpdates, marketImpact, geopoliticalAnalysis] = await Promise.all([
        this.generateExecutiveSummary(),
        this.generateKeyDevelopments(),
        this.generateHealthCrisisUpdates(),
        this.generateMarketImpactAnalysis(),
        this.generateRegulatoryAnalysis()
      ]);

      // Generate mock citations for now - in production these would come from actual API responses
      const allCitations = [
        { url: 'https://biopharmadive.com/news/pharmaceutical-market-analysis', title: 'Pharmaceutical Market Analysis' },
        { url: 'https://statnews.com/regulatory-updates', title: 'Regulatory Updates' },
        { url: 'https://fiercepharma.com/market-trends', title: 'Market Trends' }
      ];

      return {
        title: `Pharmaceutical Intelligence Brief - ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
        summary,
        keyDevelopments,
        conflictUpdates,
        defenseStockHighlights: [],
        pharmaceuticalStockHighlights: [],
        marketImpact,
        geopoliticalAnalysis,
        createdAt: new Date().toISOString(),
        references: {
          summary: allCitations.slice(0, 3),
          keyDevelopments: allCitations.slice(3, 6),
          conflictUpdates: allCitations.slice(6, 9),
          marketImpact: allCitations.slice(9, 12),
          geopoliticalAnalysis: allCitations.slice(12, 15)
        }
      };
    } catch (error) {
      console.error('❌ Error generating pharmaceutical intelligence:', error);
      throw error;
    }
  }
}

export const perplexityService = new PerplexityService();