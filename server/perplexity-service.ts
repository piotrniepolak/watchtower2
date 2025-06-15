import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { storage } from './storage';

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
  sourcesSection?: string;
  createdAt: string;
}

class PerplexityService {
  private apiKey: string;
  private baseUrl: string = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY!;
    if (!this.apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is required');
    }
  }

  private async queryPerplexity(prompt: string): Promise<{ content: string; citations: Array<{ url: string; title: string; snippet?: string }> }> {
    try {
      const response = await fetch(this.baseUrl, {
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
              content: 'You are a pharmaceutical industry analyst providing factual, current information about the pharmaceutical sector, healthcare developments, and market trends. Focus on recent, verifiable information.'
            },
            {
              role: 'user', 
              content: `TODAY IS ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. ${prompt} 

CRITICAL REQUIREMENT: Focus EXCLUSIVELY on pharmaceutical events from the past 24-48 hours (${new Date(Date.now() - 48*60*60*1000).toLocaleDateString()} to ${new Date().toLocaleDateString()}). Include exact dates for all events. Reject information older than 48 hours.`
            }
          ],
          max_tokens: 1000,
          temperature: 0.2,
          top_p: 0.9,
          return_citations: true,
          search_recency_filter: "day",
          search_domain_filter: ["pubmed.ncbi.nlm.nih.gov", "fda.gov", "who.int", "reuters.com", "bloomberg.com", "biopharmadive.com", "statnews.com"]
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json() as PerplexityResponse;
      
      // Normalize citations to consistent format and fetch real titles
      console.log('🔄 Normalizing citations and fetching real titles...');
      const normalizedCitations: Array<{ url: string; title: string; snippet: string }> = [];
      
      for (let i = 0; i < (data.citations || []).length; i++) {
        const citation = data.citations![i];
        let normalizedCitation;
        
        if (typeof citation === 'string') {
          normalizedCitation = {
            url: citation,
            title: '',
            snippet: ''
          };
        } else {
          normalizedCitation = {
            url: citation.url,
            title: citation.title || '',
            snippet: citation.snippet || ''
          };
        }

        // Try to fetch the actual title from the web page
        const webTitle = await this.fetchArticleTitle(normalizedCitation.url);
        if (webTitle && webTitle.length > 10) {
          normalizedCitation.title = webTitle;
        }

        normalizedCitations.push(normalizedCitation);
      }

      console.log(`✅ Normalized ${normalizedCitations.length} citations:`, normalizedCitations.map(c => c.url));

      return {
        content: data.choices[0]?.message?.content || '',
        citations: normalizedCitations
      };
    } catch (error) {
      console.error('Error querying Perplexity:', error);
      throw error;
    }
  }

  private async fetchArticleTitle(url: string): Promise<string | null> {
    try {
      console.log(`🔍 Fetching title for: ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`❌ Failed to fetch ${url}: ${response.status}`);
        return null;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Try multiple selectors to find the article title
      let title = '';
      
      // BioPharma Dive specific selectors
      if (url.includes('biopharmadive.com')) {
        title = $('.view-article-header h1').text().trim() ||
                $('.article-header h1').text().trim() ||
                $('h1.article-title').text().trim() ||
                $('h1[data-module="ArticleHeader"]').text().trim() ||
                $('.story-header h1').text().trim();
      }
      
      // STAT News specific selectors  
      if (!title && url.includes('statnews.com')) {
        title = $('h1.entry-title').text().trim() ||
                $('.article-header h1').text().trim() ||
                $('h1[class*="headline"]').text().trim() ||
                $('.post-title h1').text().trim();
      }
      
      // Generic fallback selectors
      if (!title) {
        title = $('h1').first().text().trim() || 
                $('meta[property="og:title"]').attr('content') || 
                $('meta[name="twitter:title"]').attr('content') || 
                $('.article-title').text().trim() ||
                $('.headline').text().trim() ||
                $('title').text().trim();
      }

      // Clean up the title
      if (title) {
        console.log(`🔍 Raw title extracted: "${title}"`);
        
        // Remove site name suffixes like " - STAT" or " | BioPharma Dive"
        title = title.replace(/\s*[-|]\s*(STAT|BioPharma Dive|Pharmalot).*$/i, '');
        title = title.replace(/\s+/g, ' ').trim();
        
        // Filter out generic/promotional titles that aren't actual article titles
        const genericTitles = [
          'don\'t miss tomorrow\'s biopharma industry news',
          'subscribe to biopharmadive',
          'breaking news',
          'latest news',
          'industry news',
          'pharmaceutical news',
          'healthcare news'
        ];
        
        const isGeneric = genericTitles.some(generic => 
          title.toLowerCase().includes(generic.toLowerCase())
        );
        
        if (!isGeneric && title.length > 10) {
          console.log(`✅ Extracted meaningful title: "${title}"`);
          return title;
        } else {
          console.log(`⚠️ Filtered out generic title: "${title}"`);
        }
      }

      console.log(`⚠️ No meaningful title found for ${url}`);
      return null;
    } catch (error) {
      console.log(`❌ Error fetching title for ${url}:`, error);
      return null;
    }
  }

  private cleanFormattingSymbols(content: string): string {
    return content
      .replace(/\*\*/g, '')  // Remove bold markdown
      .replace(/\*/g, '')    // Remove italic markdown  
      .replace(/__/g, '')    // Remove underline markdown
      .replace(/_/g, '')     // Remove single underscore
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/^\s*[-*+]\s/gm, '') // Remove bullet points
      .replace(/^\s*\d+\.\s/gm, '') // Remove numbered lists
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links but keep text
      .replace(/`([^`]+)`/g, '$1') // Remove code formatting
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private currentBriefCitations: Array<{ url: string; title: string; snippet?: string }> = [];

  private async createConsolidatedSourcesSection(): Promise<string> {
    if (this.currentBriefCitations.length === 0) {
      return '';
    }

    // Remove duplicates based on URL
    const uniqueCitations = this.currentBriefCitations.filter((citation, index, self) => 
      index === self.findIndex(c => c.url === citation.url)
    );

    // Filter out generic URLs and keep only authentic article URLs
    const authenticCitations = uniqueCitations.filter((citation, index) => {
      const isValidUrl = citation.url && 
                        typeof citation.url === 'string' && 
                        citation.url.startsWith('http') && 
                        citation.url.length > 10;
      
      const isGenericUrl = citation.url === 'https://www.biopharmadive.com/news/' ||
                          citation.url === 'https://www.statnews.com/' ||
                          citation.url === 'https://www.fda.gov/' ||
                          citation.url.match(/^https:\/\/[^\/]+\/?$/);
      
      if (!isValidUrl || isGenericUrl) {
        console.log(`❌ Invalid citation ${index + 1} filtered out: "${citation.url}"`);
        return false;
      } else {
        console.log(`✅ Valid citation ${index + 1}: ${citation.url}`);
        return true;
      }
    });

    console.log(`📚 Creating consolidated sources section with ${authenticCitations.length} authentic citations`);

    if (authenticCitations.length === 0) {
      return '';
    }

    let sourcesSection = '\n\n**Intelligence Sources & References:**\n\n';
    
    for (let index = 0; index < authenticCitations.length; index++) {
      const citation = authenticCitations[index];
      let displayTitle = citation.title;
      
      // If no authentic title was fetched, skip this citation
      if (!displayTitle || displayTitle.length < 10 || displayTitle.includes('Article from')) {
        console.log(`❌ Skipping citation without authentic title: ${citation.url}`);
        continue;
      }
      
      sourcesSection += `${index + 1}. [${displayTitle}](${citation.url})\n`;
    }

    return sourcesSection;
  }

  async generateExecutiveSummary(): Promise<string> {
    const prompt = `Generate a comprehensive 2-3 paragraph executive summary of today's most significant pharmaceutical industry developments. Search specifically for recent articles from:
    - STAT News (statnews.com)
    - BioPharma Dive (biopharmadive.com) 
    - FiercePharma (fiercepharma.com)
    - Pharmaceutical Executive (pharmexec.com)
    - BioWorld (bioworld.com)
    
    Include specific drug approvals, clinical trial results, regulatory decisions, company announcements, and market movements with direct quotes and references to the source articles. Each claim should be backed by a specific URL from these pharmaceutical news sources. Use numbered citations [1], [2], [3] to reference specific articles.`;
    
    const result = await this.queryPerplexity(prompt);
    this.currentBriefCitations.push(...result.citations);
    
    return this.cleanFormattingSymbols(result.content);
  }

  async generateKeyDevelopments(): Promise<string[]> {
    const prompt = `List the top 5 key pharmaceutical industry developments from today. Focus on:
    - New drug approvals by FDA
    - Clinical trial results
    - Regulatory announcements
    - Major pharmaceutical company news
    - Healthcare policy changes
    
    Format as bullet points with specific details and sources. Include company names, drug names, and specific outcomes.`;
    
    const result = await this.queryPerplexity(prompt);
    this.currentBriefCitations.push(...result.citations);
    
    const cleanContent = this.cleanFormattingSymbols(result.content);
    return cleanContent.split('\n').filter(line => line.trim().length > 0);
  }

  async generateMarketImpactAnalysis(): Promise<string> {
    const prompt = `Analyze today's pharmaceutical market impact focusing on:
    - Stock movements of major pharmaceutical companies
    - Market reactions to FDA approvals or rejections
    - Impact of regulatory decisions on biotech sector
    - Healthcare policy effects on pharmaceutical investments
    - Global pharmaceutical market trends
    
    Provide specific analysis with company names, stock symbols, and percentage changes where available.`;
    
    const result = await this.queryPerplexity(prompt);
    this.currentBriefCitations.push(...result.citations);
    
    return this.cleanFormattingSymbols(result.content);
  }

  async generateRegulatoryAnalysis(): Promise<string> {
    const prompt = `Provide geopolitical analysis of today's pharmaceutical developments including:
    - International regulatory harmonization efforts
    - Trade impacts on pharmaceutical supply chains
    - Global health policy developments
    - Cross-border pharmaceutical collaborations
    - Regulatory disputes between countries
    
    Focus on how geopolitical factors affect pharmaceutical industry operations and market access.`;
    
    const result = await this.queryPerplexity(prompt);
    this.currentBriefCitations.push(...result.citations);
    
    return this.cleanFormattingSymbols(result.content);
  }

  async generateComprehensiveIntelligenceBrief(): Promise<PharmaceuticalIntelligence> {
    // Reset citations for new brief
    this.currentBriefCitations = [];
    
    console.log('🚀 Starting comprehensive pharmaceutical intelligence brief generation...');
    
    const [
      executiveSummary,
      keyDevelopments,
      marketImpact,
      geopoliticalAnalysis
    ] = await Promise.all([
      this.generateExecutiveSummary(),
      this.generateKeyDevelopments(),
      this.generateMarketImpactAnalysis(),
      this.generateRegulatoryAnalysis()
    ]);

    const sourcesSection = await this.createConsolidatedSourcesSection();

    return {
      title: `Pharmaceutical Intelligence Brief - ${new Date().toLocaleDateString()}`,
      summary: executiveSummary,
      keyDevelopments,
      conflictUpdates: [],
      defenseStockHighlights: [],
      pharmaceuticalStockHighlights: [],
      marketImpact,
      geopoliticalAnalysis,
      sourcesSection,
      createdAt: new Date().toISOString()
    };
  }
}

export const perplexityService = new PerplexityService();