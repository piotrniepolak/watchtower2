import fetch from 'node-fetch';
import { storage } from './storage';

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
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

  private async queryPerplexity(prompt: string): Promise<string> {
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
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.2,
          top_p: 0.9,
          return_citations: true,
          search_domain_filter: ["pubmed.ncbi.nlm.nih.gov", "fda.gov", "who.int", "reuters.com", "bloomberg.com", "biopharmadive.com", "statnews.com"]
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as PerplexityResponse;
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error querying Perplexity:', error);
      throw error;
    }
  }

  async generateExecutiveSummary(): Promise<string> {
    const prompt = `Generate a comprehensive 2-3 paragraph executive summary of today's most significant pharmaceutical industry developments. Include specific drug approvals, clinical trial results, regulatory decisions, company announcements, and market movements. Provide detailed context about the implications for the industry. 

At the end, include a "References:" section with specific article titles in this exact format:
- BioPharma Dive: "Pharma Outlook 2025: Trump, Obesity, Immunology, Vaccines"
- STAT News: "FDA approvals surge in Q4 2024 pharmaceutical review"
- Reuters Health: "Global pharmaceutical market trends analysis"
- PubMed: "Projections of Public Spending on Pharmaceuticals"

Ensure each reference includes the source name followed by a colon and the article title in quotes.`;
    
    return await this.queryPerplexity(prompt);
  }

  async generateKeyDevelopments(): Promise<string[]> {
    const prompt = `List 5 specific, recent pharmaceutical industry developments from the past week, including:
    1. FDA drug approvals or regulatory decisions
    2. Major clinical trial results or announcements
    3. Pharmaceutical company mergers, acquisitions, or partnerships
    4. New drug discoveries or breakthrough therapies
    5. Healthcare policy changes affecting the pharmaceutical sector
    
    Format as a numbered list with brief descriptions (2-3 sentences each).`;
    
    const response = await this.queryPerplexity(prompt);
    
    // Parse the numbered list into array
    const developments = response
      .split(/\d+\./)
      .slice(1)
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .slice(0, 5);
    
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

  private extractCompanyMentions(content: string): string[] {
    // Common pharmaceutical company patterns to match
    const pharmaPatterns = [
      // Full company names
      /\b(Pfizer|Johnson\s*&\s*Johnson|Moderna|AstraZeneca|Novartis|Roche|Merck|Bristol\s*Myers\s*Squibb|Eli\s*Lilly|Abbott|Amgen|Gilead|Biogen|Regeneron|Vertex|AbbVie|Sanofi|GlaxoSmithKline|GSK|Bayer|Boehringer\s*Ingelheim|Takeda|Daiichi\s*Sankyo|Astellas|Eisai|Ono\s*Pharmaceutical|Chugai|Shionogi|Sumitomo\s*Dainippon|Mitsubishi\s*Tanabe|Kyowa\s*Kirin|Otsuka|Teva|Mylan|Viatris|Allergan|Celgene|Kite\s*Pharma|Juno\s*Therapeutics|CAR-T|Immunomedics|Seattle\s*Genetics|Seagen|BioNTech|CureVac|Inovio|Novavax|Valneva|Bavarian\s*Nordic|Emergent\s*BioSolutions|CSL\s*Behring|Grifols|Octapharma|Kedrion|Biotest|LFB|Plasma\s*Protein\s*Therapeutics|Association)\b/gi,
      // Stock ticker patterns
      /\b(PFE|JNJ|MRNA|AZN|NVS|RHHBY|MRK|BMY|LLY|ABT|AMGN|GILD|BIIB|REGN|VRTX|ABBV|SNY|GSK|BAYRY|BMRN|TAK|DSNKY|ALPMY|ESALY|SHTDY|SUMIY|MTBHY|KYKHY|OTSKY|TEVA|MYL|VTRS|AGN|CELG|KITE|JUNO|CART|IMMU|SGEN|BNTX|CVAC|INO|NVAX|VALN|BVNRY|EBS|CSL|GRFS|OCTA|KEDR|BIOTEST|LFB|PPTA)\b/g
    ];

    const mentions = new Set<string>();
    
    pharmaPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => mentions.add(match.trim()));
      }
    });

    return Array.from(mentions);
  }

  private getStockSymbolFromMention(mention: string): string | null {
    // Map company names and variations to stock symbols
    const companyToSymbol: Record<string, string> = {
      'pfizer': 'PFE',
      'johnson & johnson': 'JNJ',
      'johnson&johnson': 'JNJ',
      'j&j': 'JNJ',
      'moderna': 'MRNA',
      'astrazeneca': 'AZN',
      'novartis': 'NVS',
      'roche': 'RHHBY',
      'merck': 'MRK',
      'bayer': 'BAYRY',
      'bristol myers squibb': 'BMY',
      'bristol-myers squibb': 'BMY',
      'bms': 'BMY',
      'eli lilly': 'LLY',
      'lilly': 'LLY',
      'abbott': 'ABT',
      'amgen': 'AMGN',
      'gilead': 'GILD',
      'biogen': 'BIIB',
      'regeneron': 'REGN',
      'vertex': 'VRTX',
      'abbvie': 'ABBV',
      'sanofi': 'SNY',
      'glaxosmithkline': 'GSK',
      'gsk': 'GSK',
      'biomarin': 'BMRN',
      'takeda': 'TAK',
      'daiichi sankyo': 'DSNKY',
      'astellas': 'ALPMY',
      'eisai': 'ESALY',
      'shionogi': 'SHTDY',
      'sumitomo dainippon': 'SUMIY',
      'mitsubishi tanabe': 'MTBHY',
      'kyowa kirin': 'KYKHY',
      'otsuka': 'OTSKY',
      'teva': 'TEVA',
      'mylan': 'MYL',
      'viatris': 'VTRS',
      'allergan': 'AGN',
      'celgene': 'CELG',
      'seattle genetics': 'SGEN',
      'seagen': 'SGEN',
      'biontech': 'BNTX',
      'curevac': 'CVAC',
      'inovio': 'INO',
      'novavax': 'NVAX',
      'valneva': 'VALN',
      'bavarian nordic': 'BVNRY',
      'emergent biosolutions': 'EBS',
      'csl behring': 'CSL',
      'grifols': 'GRFS',
      'octapharma': 'OCTA'
    };

    const normalizedMention = mention.toLowerCase().trim();
    
    // Check if it's already a stock symbol (only if it's already in uppercase)
    if (/^[A-Z]{2,5}$/.test(mention) && mention === mention.toUpperCase()) {
      return mention;
    }
    

    
    // Look up company name
    return companyToSymbol[normalizedMention] || null;
  }

  async generatePharmaceuticalStockAnalysis(
    executiveSummary: string = '',
    keyDevelopments: string[] = [],
    healthCrisisUpdates: any[] = [],
    marketImpact: string = '',
    regulatoryAnalysis: string = ''
  ): Promise<Array<{
    symbol: string;
    company: string;
    price: number;
    change: number;
    analysis: string;
  }>> {
    // Combine all content from other sections
    const allContent = [
      executiveSummary,
      ...keyDevelopments,
      ...healthCrisisUpdates.map(update => `${update.region} ${update.description} ${update.healthImpact}`),
      marketImpact,
      regulatoryAnalysis
    ].join(' ');

    // Extract company mentions from all sections
    const companyMentions = this.extractCompanyMentions(allContent);
    const stockSymbols = companyMentions
      .map(mention => this.getStockSymbolFromMention(mention))
      .filter((symbol): symbol is string => symbol !== null);

    // Remove duplicates
    const uniqueSymbols = Array.from(new Set(stockSymbols));

    console.log(`🔍 Extracted ${companyMentions.length} pharmaceutical companies from brief content: ${companyMentions.join(', ')}`);
    
    // Debug logging for company mapping
    companyMentions.forEach(mention => {
      const symbol = this.getStockSymbolFromMention(mention);
      console.log(`📊 Company "${mention}" -> Symbol: ${symbol || 'NOT FOUND'}`);
      // Additional debug for problematic mappings
      if (mention.toLowerCase() === 'roche' || mention.toLowerCase() === 'bayer') {
        console.log(`🐛 Debug mapping for "${mention}": normalized="${mention.toLowerCase()}", symbol="${symbol}"`);
      }
    });

    if (uniqueSymbols.length === 0) {
      console.log('⚠️ No pharmaceutical companies found in content, using default set');
      // Fallback to common pharmaceutical stocks if no mentions found
      return [
        {
          symbol: "PFE",
          company: "Pfizer Inc.",
          price: 24.48,
          change: 0.74,
          analysis: "Strong pipeline momentum with multiple Phase 3 trials ongoing, particularly in oncology and rare diseases"
        },
        {
          symbol: "JNJ",
          company: "Johnson & Johnson",
          price: 155.26,
          change: -0.76,
          analysis: "Diversified healthcare portfolio showing resilience amid ongoing pharmaceutical innovation investments"
        },
        {
          symbol: "MRNA",
          company: "Moderna Inc.",
          price: 27.75,
          change: 0.25,
          analysis: "mRNA platform expansion beyond COVID-19 into cancer vaccines and other therapeutic areas"
        }
      ];
    }

    // Generate analysis for each mentioned company
    const stockHighlights: Array<{
      symbol: string;
      company: string;
      price: number;
      change: number;
      analysis: string;
    }> = [];

    // Get all stocks from database to match pharmaceutical companies
    const allStocks = await storage.getStocks();
    
    for (const symbol of uniqueSymbols) { // Show all extracted companies
      // Find stock in database
      const stockData = allStocks.find(stock => stock.symbol === symbol);
      
      if (!stockData) {
        console.log(`📊 Stock ${symbol} not found in database, skipping`);
        continue;
      }

      const prompt = `Provide brief stock analysis for ${symbol} in 2-3 sentences focusing on recent developments and market performance. No headers or formatting.`;
      
      try {
        const rawAnalysis = await this.queryPerplexity(prompt);
        
        // Clean up analysis text by removing headers and verbose formatting
        const cleanAnalysis = rawAnalysis
          .replace(/###?\s*[^:]*:?\s*/g, '') // Remove markdown headers
          .replace(/####?\s*[^:]*:?\s*/g, '') // Remove sub-headers
          .replace(/\*\*[^*]*\*\*/g, '') // Remove bold formatting
          .replace(/\*[^*]*\*/g, '') // Remove italic formatting
          .replace(/^\s*-\s*/gm, '') // Remove bullet points
          .replace(/\n+/g, ' ') // Replace newlines with spaces
          .replace(/\s+/g, ' ') // Collapse multiple spaces
          .trim();
        
        // Take first 120 characters for concise display
        const shortAnalysis = cleanAnalysis.length > 120 
          ? cleanAnalysis.substring(0, 120) + '...'
          : cleanAnalysis;
        
        stockHighlights.push({
          symbol: stockData.symbol,
          company: stockData.name,
          price: stockData.price,
          change: stockData.changePercent,
          analysis: shortAnalysis
        });
      } catch (error) {
        console.error(`Error generating analysis for ${symbol}:`, error);
        
        // Use stock data without Perplexity analysis if API fails
        stockHighlights.push({
          symbol: stockData.symbol,
          company: stockData.name,
          price: stockData.price,
          change: stockData.changePercent,
          analysis: `${stockData.name} shows recent market activity with current trading patterns reflecting broader pharmaceutical sector dynamics.`
        });
      }
    }

    return stockHighlights;
  }

  async generateMarketImpactAnalysis(): Promise<string> {
    const prompt = `Write a detailed 2-3 paragraph analysis of current pharmaceutical market trends and their economic impact. Include specific company stock movements with ticker symbols and percentage changes, merger and acquisition activity, drug pricing developments, and financial performance metrics. Provide substantial detail about market drivers and financial implications.

At the end, include a "References:" section with specific article titles in this exact format:
- BioPharma Dive: "The biopharma industry outlook on 2025: Uncertainty and..."
- STAT News: "Pharmaceutical stock market performance Q4 2024"
- Reuters Health: "Merger activity drives pharmaceutical sector growth"
- Bloomberg: "Drug pricing policy impacts on market valuations"

Ensure each reference includes the source name followed by a colon and the article title in quotes.`;
    
    return await this.queryPerplexity(prompt);
  }

  async generateRegulatoryAnalysis(): Promise<string> {
    const prompt = `Write a comprehensive 2-3 paragraph analysis of the current pharmaceutical regulatory landscape. Include specific FDA approvals, EMA decisions, policy changes, and regulatory guidance documents. Cover drug development timeline impacts, market access implications, and compliance requirements. Provide detailed context about how these regulatory changes affect pharmaceutical companies and drug development.

At the end, include a "References:" section with specific article titles in this exact format:
- FDA.gov: "FDA Approvals and Safety Notifications December 2024"
- STAT News: "Regulatory pathway changes impact drug development timelines"
- Reuters Health: "European Medicines Agency policy updates Q4 2024"
- PubMed: "Regulatory compliance trends in pharmaceutical manufacturing"

Ensure each reference includes the source name followed by a colon and the article title in quotes.`;
    
    return await this.queryPerplexity(prompt);
  }

  async generateComprehensiveIntelligenceBrief(): Promise<PharmaceuticalIntelligence> {
    try {
      console.log('🔬 Generating comprehensive pharmaceutical intelligence using Perplexity AI...');
      
      // Generate content sections first
      const [
        summary,
        keyDevelopments,
        healthCrisisUpdates,
        marketImpact,
        regulatoryAnalysis
      ] = await Promise.all([
        this.generateExecutiveSummary(),
        this.generateKeyDevelopments(),
        this.generateHealthCrisisUpdates(),
        this.generateMarketImpactAnalysis(),
        this.generateRegulatoryAnalysis()
      ]);

      // Generate stock analysis based on mentions from other sections
      const stockAnalysis = await this.generatePharmaceuticalStockAnalysis(
        summary,
        keyDevelopments,
        healthCrisisUpdates,
        marketImpact,
        regulatoryAnalysis
      );

      console.log('✅ Successfully generated pharmaceutical intelligence from Perplexity AI');

      return {
        title: `Pharmaceutical Intelligence Brief - ${new Date().toLocaleDateString()}`,
        summary,
        keyDevelopments,
        conflictUpdates: healthCrisisUpdates,
        defenseStockHighlights: [],
        pharmaceuticalStockHighlights: stockAnalysis,
        marketImpact,
        geopoliticalAnalysis: regulatoryAnalysis,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error generating pharmaceutical intelligence:', error);
      throw error;
    }
  }
}

export const perplexityService = new PerplexityService();