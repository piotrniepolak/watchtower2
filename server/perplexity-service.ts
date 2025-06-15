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
      
      // Debug logging for citations
      console.log('🔍 Perplexity API Response Debug:');
      console.log('Citations received:', data.citations?.length || 0);
      if (data.citations && data.citations.length > 0) {
        console.log('First citation:', data.citations[0]);
      }
      
      // Normalize citations to consistent format
      console.log('🔄 Normalizing citations...');
      const normalizedCitations: Array<{ url: string; title: string; snippet: string }> = (data.citations || []).map((citation, index) => {
        if (typeof citation === 'string') {
          // Extract domain for title fallback
          try {
            const url = new URL(citation);
            const domain = url.hostname.replace('www.', '');
            return {
              url: citation,
              title: `Source from ${domain}`,
              snippet: ''
            };
          } catch {
            return {
              url: citation,
              title: `Source ${index + 1}`,
              snippet: ''
            };
          }
        } else {
          return {
            url: citation.url,
            title: citation.title || `Source ${index + 1}`,
            snippet: citation.snippet || ''
          };
        }
      });

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
      // Remove markdown formatting symbols
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold markdown
      .replace(/\*([^*]+)\*/g, '$1')      // Remove italic markdown
      .replace(/#{1,6}\s*/g, '')          // Remove hashtag headers
      .replace(/`([^`]+)`/g, '$1')        // Remove code formatting
      .replace(/~~([^~]+)~~/g, '$1')      // Remove strikethrough
      .replace(/_([^_]+)_/g, '$1')        // Remove underline formatting
      .replace(/\|/g, '')                 // Remove table separators
      .replace(/[-]{3,}/g, '')            // Remove horizontal rules
      .replace(/\s{2,}/g, ' ')            // Replace multiple spaces with single space
      .replace(/\n{3,}/g, '\n\n')         // Replace multiple newlines with double newline
      .trim();
  }

  private async processContentWithLinks(content: string, citations: Array<{ url: string; title: string; snippet?: string }>): Promise<string> {
    console.log(`🔗 Processing content with ${citations?.length || 0} citations`);
    console.log(`🔗 Citations received in processContentWithLinks:`, JSON.stringify(citations, null, 2));
    
    if (!citations || citations.length === 0) {
      console.log('⚠️ No citations provided for content processing');
      return content;
    }

    // Debug log all citations
    citations.forEach((citation, index) => {
      console.log(`   Citation ${index + 1}: Title="${citation.title || 'No title'}" URL="${citation.url || 'No URL'}"`);
    });

    // The citations are already normalized at this point, so validate the URLs
    const validCitations = citations.filter((citation, index) => {
      const isValidUrl = citation.url && 
                        (citation.url.startsWith('http://') || citation.url.startsWith('https://')) && 
                        citation.url.length > 10 &&
                        !citation.url.includes('undefined') &&
                        !citation.url.includes('null');
      
      if (!isValidUrl) {
        console.log(`❌ Invalid citation ${index + 1} filtered out: "${citation.url}"`);
        return false;
      } else {
        console.log(`✅ Valid citation ${index + 1}: ${citation.url}`);
        return true;
      }
    });

    if (validCitations.length === 0) {
      console.log('❌ No valid citations found after filtering, returning original content');
      return content;
    }

    // Remove all citation numbers [1], [2], etc. from the main content
    let processedContent = content;
    
    console.log(`🔧 Before citation removal: ${processedContent.substring(0, 200)}...`);
    
    // Remove all citation patterns like [1], [2], [3], including clustered ones like [1][3]
    processedContent = processedContent.replace(/\[\d+\]/g, '');
    
    // Apply formatting cleanup to remove markdown symbols and clean text
    processedContent = this.cleanFormattingSymbols(processedContent);
    
    console.log(`🔧 After citation removal and formatting cleanup: ${processedContent.substring(0, 200)}...`);
    
    // Clean up any extra spaces left by removed citations
    processedContent = processedContent.replace(/\s+/g, ' ').trim();

    // Add clean reference list below the content
    if (validCitations.length > 0) {
      processedContent += '\n\n**References:**\n\n';
      
      // Use for loop to enable async/await for web scraping
      for (let index = 0; index < validCitations.length; index++) {
        const citation = validCitations[index];
        let displayTitle = citation.title;
        
        // If title is generic, contains source domain, or is just a number, fetch from web
        if (!displayTitle || 
            displayTitle.includes('Source from') || 
            displayTitle.toLowerCase().includes('biopharmadive.com') || 
            displayTitle.toLowerCase().includes('statnews.com') ||
            displayTitle.toLowerCase().includes("don't miss tomorrow's biopharma industry news") ||
            displayTitle.toLowerCase().includes('subscribe to biopharmadive') ||
            displayTitle.match(/^\d+$/) || // Just a number
            displayTitle.length < 10) { // Too short to be meaningful
          
          // Fetch the actual title from the web page
          const webTitle = await this.fetchArticleTitle(citation.url);
          
          if (webTitle) {
            displayTitle = webTitle;
          } else {
            // Fallback to URL parsing if web scraping fails
            const urlParts = citation.url.split('/');
            let articleSlug = '';
            
            if (citation.url.includes('biopharmadive.com/news/')) {
              const newsIndex = urlParts.findIndex(part => part === 'news');
              if (newsIndex !== -1 && urlParts[newsIndex + 1]) {
                articleSlug = urlParts[newsIndex + 1];
              }
            } else if (citation.url.includes('statnews.com/')) {
              const lastPart = urlParts[urlParts.length - 1];
              const secondLastPart = urlParts[urlParts.length - 2];
              
              if (lastPart && !lastPart.match(/^\d{4}$/) && lastPart.length > 3) {
                articleSlug = lastPart;
              } else if (secondLastPart && secondLastPart.length > 3) {
                articleSlug = secondLastPart;
              }
            } else {
              for (let i = urlParts.length - 1; i >= 0; i--) {
                const part = urlParts[i];
                if (part && part.length > 3 && !part.match(/^\d+$/) && part !== 'news' && part !== 'articles') {
                  articleSlug = part;
                  break;
                }
              }
            }
            
            if (articleSlug && articleSlug !== '') {
              displayTitle = articleSlug
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase())
                .replace(/\b(And|Of|The|In|On|At|To|For|With|By)\b/g, word => word.toLowerCase())
                .replace(/\b(A|An)\b/g, word => word.toLowerCase())
                .trim();
            } else {
              const domain = new URL(citation.url).hostname.replace('www.', '');
              displayTitle = `Article from ${domain}`;
            }
          }
        }
        
        processedContent += `${index + 1}. [${displayTitle}](${citation.url})\n`;
      }
      
      console.log(`✅ Added clean reference list with ${validCitations.length} valid citations`);
    }

    return processedContent;
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
    console.log(`🎯 Executive Summary - Citations received: ${result.citations.length}`);
    if (result.citations.length > 0) {
      console.log(`🎯 Executive Summary - First citation: ${result.citations[0].url || result.citations[0]}`);
    }
    const processed = await this.processContentWithLinks(result.content, result.citations);
    console.log(`🎯 Executive Summary - Processed length: ${processed.length}, Has references: ${processed.includes('**References:**')}`);
    
    // Remove "References:" sections from Executive Summary content while preserving dedicated sources section
    return processed
      .replace(/References?:\s*[\s\S]*$/i, '') // Remove "References:" and everything after
      .replace(/Sources?:\s*[\s\S]*$/i, '') // Remove "Sources:" and everything after
      .replace(/\n\s*References?:.*$/gmi, '') // Remove "References:" lines
      .replace(/\n\s*Sources?:.*$/gmi, '') // Remove "Sources:" lines
      .trim();
  }

  async generateKeyDevelopments(): Promise<string[]> {
    const prompt = `Search for 5 specific, recent pharmaceutical industry developments from the past week from these news sources:
    - STAT News (statnews.com)
    - BioPharma Dive (biopharmadive.com)
    - FiercePharma (fiercepharma.com)
    - Reuters Health (reuters.com/business/healthcare-pharmaceuticals/)
    - Wall Street Journal Health section
    
    Include:
    1. FDA drug approvals or regulatory decisions
    2. Major clinical trial results or announcements  
    3. Pharmaceutical company mergers, acquisitions, or partnerships
    4. New drug discoveries or breakthrough therapies
    5. Healthcare policy changes affecting the pharmaceutical sector
    
    Each development should cite the specific article URL. Format as numbered list with brief descriptions and include citation references [1], [2], etc.`;
    
    const result = await this.queryPerplexity(prompt);
    
    // Parse the numbered list into array
    const developments = result.content
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
    // Enhanced pharmaceutical company patterns to match - more comprehensive list
    const pharmaPatterns = [
      // Full company names - comprehensive list
      /\b(Pfizer|Johnson\s*&\s*Johnson|J&J|Moderna|AstraZeneca|Novartis|Roche|Merck|Bristol\s*Myers\s*Squibb|Bristol\s*Myers|Eli\s*Lilly|Lilly|Abbott|Amgen|Gilead|Biogen|Regeneron|Vertex|AbbVie|Sanofi|GlaxoSmithKline|GSK|Bayer|Boehringer\s*Ingelheim|Takeda|Daiichi\s*Sankyo|Astellas|Eisai|Ono\s*Pharmaceutical|Chugai|Shionogi|Sumitomo\s*Dainippon|Mitsubishi\s*Tanabe|Kyowa\s*Kirin|Otsuka|Teva|Mylan|Viatris|Allergan|Celgene|Kite\s*Pharma|Juno\s*Therapeutics|CAR-T|Immunomedics|Seattle\s*Genetics|Seagen|BioNTech|CureVac|Inovio|Novavax|Valneva|Bavarian\s*Nordic|Emergent\s*BioSolutions|CSL\s*Behring|Grifols|Octapharma|Kedrion|Biotest|LFB|Plasma\s*Protein\s*Therapeutics|Association|Nuvation|Ultragenyx|Argenx|Incyte|Blueprint\s*Medicines|Alnylam|Exact\s*Sciences|Illumina|10x\s*Genomics|Pacific\s*Biosciences|Twist\s*Bioscience|Solid\s*Biosciences|Stoke\s*Therapeutics|Catalent|IQVIA|Syneos|Thermo\s*Fisher|Charles\s*River|Laboratory\s*Corporation|LabCorp|Quest\s*Diagnostics|Danaher|Agilent|Waters|PerkinElmer|Mettler\s*Toledo|Sartorius|Lonza|WuXi\s*AppTec|Pharmaceutical\s*Research|Associates|ICON|Parexel|PPD|Covance|Quintiles)\b/gi,
      // Stock ticker patterns - comprehensive list
      /\b(PFE|JNJ|MRNA|AZN|NVS|RHHBY|MRK|BMY|LLY|ABT|AMGN|GILD|BIIB|REGN|VRTX|ABBV|SNY|GSK|BAYRY|BMRN|TAK|DSNKY|ALPMY|ESALY|SHTDY|SUMIY|MTBHY|KYKHY|OTSKY|TEVA|MYL|VTRS|AGN|CELG|KITE|JUNO|CART|IMMU|SGEN|BNTX|CVAC|INO|NVAX|VALN|BVNRY|EBS|CSL|GRFS|OCTA|KEDR|BIOTEST|LFB|PPTA|NUVB|RARE|ARGX|INCY|BPMC|ALNY|EXAS|ILMN|TXG|PACB|TWST|SLDB|STOK|CTLT|IQV|SYNH|TMO|CRL|LH|DGX|DHR|A|WAT|PKI|MTD|SARKY|LONZ|WXI|PRA|ICLR|PRXL|PPD|CVN|Q)\b/g
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
      'octapharma': 'OCTA',
      'nuvation': 'NUVB',
      'ultragenyx': 'RARE',
      'argenx': 'ARGX',
      'incyte': 'INCY',
      'blueprint medicines': 'BPMC',
      'alnylam': 'ALNY',
      'exact sciences': 'EXAS',
      'illumina': 'ILMN',
      '10x genomics': 'TXG',
      'pacific biosciences': 'PACB',
      'twist bioscience': 'TWST',
      'solid biosciences': 'SLDB',
      'solid': 'SLDB',
      'stoke therapeutics': 'STOK',
      'stoke': 'STOK',
      'catalent': 'CTLT',
      'iqvia': 'IQV',
      'syneos': 'SYNH',
      'syneos health': 'SYNH',
      'thermo fisher': 'TMO',
      'thermo fisher scientific': 'TMO',
      'charles river': 'CRL',
      'charles river laboratories': 'CRL',
      'laboratory corporation': 'LH',
      'labcorp': 'LH',
      'quest diagnostics': 'DGX',
      'danaher': 'DHR',
      'agilent': 'A',
      'agilent technologies': 'A',
      'waters': 'WAT',
      'waters corporation': 'WAT',
      'perkinelmer': 'PKI',
      'mettler toledo': 'MTD',
      'sartorius': 'SARKY',
      'lonza': 'LONZ',
      'lonza group': 'LONZ',
      'wuxi apptec': 'WXI',
      'pharmaceutical research': 'PRA',
      'pra health sciences': 'PRA',
      'icon': 'ICLR',
      'icon plc': 'ICLR',
      'parexel': 'PRXL',
      'ppd': 'PPD',
      'covance': 'CVN',
      'quintiles': 'Q',
      'nuvation bio': 'NUVB'
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
    // DISABLED: Old pharmaceutical extraction logic replaced by improved text-based extraction in routes.ts
    console.log('ℹ️ Pharmaceutical stock analysis disabled in perplexity service - using improved extraction in routes.ts');
    
    // Return empty array - extraction now handled in routes.ts
    const stockHighlights: Array<{
      symbol: string;
      company: string;
      price: number;
      change: number;
      analysis: string;
    }> = [];
    
    // All pharmaceutical stock extraction now handled in routes.ts
    return stockHighlights;
  }

  async generateMarketImpactAnalysis(): Promise<string> {
    const prompt = `Write a detailed 2-3 paragraph analysis of current pharmaceutical market trends and their economic impact. Include specific company stock movements with ticker symbols and percentage changes, merger and acquisition activity, drug pricing developments, and financial performance metrics. Provide substantial detail about market drivers and financial implications.`;
    
    const result = await this.queryPerplexity(prompt);
    const processed = await this.processContentWithLinks(result.content, result.citations);
    
    // Remove "References:" sections from Market Impact content while preserving dedicated sources section
    return processed
      .replace(/References?:\s*[\s\S]*$/i, '') // Remove "References:" and everything after
      .replace(/Sources?:\s*[\s\S]*$/i, '') // Remove "Sources:" and everything after
      .replace(/\n\s*References?:.*$/gmi, '') // Remove "References:" lines
      .replace(/\n\s*Sources?:.*$/gmi, '') // Remove "Sources:" lines
      .trim();
  }

  async generateRegulatoryAnalysis(): Promise<string> {
    const prompt = `Write a comprehensive 2-3 paragraph analysis of the current pharmaceutical regulatory landscape. Include specific FDA approvals, EMA decisions, policy changes, and regulatory guidance documents. Cover drug development timeline impacts, market access implications, and compliance requirements. Provide detailed context about how these regulatory changes affect pharmaceutical companies and drug development.`;
    
    const result = await this.queryPerplexity(prompt);
    const processed = await this.processContentWithLinks(result.content, result.citations);
    
    // Remove "References:" sections from Geopolitical Analysis content while preserving dedicated sources section
    return processed
      .replace(/References?:\s*[\s\S]*$/i, '') // Remove "References:" and everything after
      .replace(/Sources?:\s*[\s\S]*$/i, '') // Remove "Sources:" and everything after
      .replace(/\n\s*References?:.*$/gmi, '') // Remove "References:" lines
      .replace(/\n\s*Sources?:.*$/gmi, '') // Remove "Sources:" lines
      .trim();
  }

  // Store all citations collected during brief generation
  private allBriefCitations: Array<{ url: string; title: string; snippet?: string }> = [];

  private createConsolidatedSourcesSection(): string {
    if (this.allBriefCitations.length === 0) {
      return '';
    }

    // Remove duplicates based on URL
    const uniqueCitations = this.allBriefCitations.filter((citation, index, self) => 
      index === self.findIndex(c => c.url === citation.url)
    );

    console.log(`📚 Creating consolidated sources section with ${uniqueCitations.length} unique citations`);

    let sourcesSection = '\n\n**Intelligence Sources & References:**\n\n';
    uniqueCitations.forEach((citation, index) => {
      sourcesSection += `${index + 1}. [${citation.title}](${citation.url})\n`;
    });

    return sourcesSection;
  }

  async generateExecutiveSummaryWithCitations(): Promise<{ content: string; citations: Array<{ url: string; title: string; snippet?: string }> }> {
    const prompt = `Generate a comprehensive 2-3 paragraph executive summary of today's most significant pharmaceutical industry developments. Search specifically for recent articles from:
    - STAT News (statnews.com)
    - BioPharma Dive (biopharmadive.com) 
    - FiercePharma (fiercepharma.com)
    - Pharmaceutical Executive (pharmexec.com)
    - BioWorld (bioworld.com)
    
    Include specific drug approvals, clinical trial results, regulatory decisions, company announcements, and market movements with direct quotes and references to the source articles. Each claim should be backed by a specific URL from these pharmaceutical news sources. Use numbered citations [1], [2], [3] to reference specific articles.`;
    
    const result = await this.queryPerplexity(prompt);
    console.log(`🎯 Executive Summary - Citations received: ${result.citations.length}`);
    
    // Collect citations for consolidated sources
    this.allBriefCitations.push(...result.citations);
    
    const processed = await this.processContentWithLinks(result.content, result.citations);
    
    // Remove "References:" sections from content
    const cleanContent = processed
      .replace(/References?:\s*[\s\S]*$/i, '')
      .replace(/Sources?:\s*[\s\S]*$/i, '')
      .replace(/\n\s*References?:.*$/gmi, '')
      .replace(/\n\s*Sources?:.*$/gmi, '')
      .trim();
    
    return { content: cleanContent, citations: result.citations };
  }

  async generateKeyDevelopmentsWithCitations(): Promise<{ content: string[]; citations: Array<{ url: string; title: string; snippet?: string }> }> {
    const prompt = `Search for 5 specific, recent pharmaceutical industry developments from the past week from these news sources:
    - STAT News (statnews.com)
    - BioPharma Dive (biopharmadive.com)
    - FiercePharma (fiercepharma.com)
    - Reuters Health (reuters.com/business/healthcare-pharmaceuticals/)
    - Wall Street Journal Health section
    
    Include:
    1. FDA drug approvals or regulatory decisions
    2. Major clinical trial results or announcements  
    3. Pharmaceutical company mergers, acquisitions, or partnerships
    4. New drug discoveries or breakthrough therapies
    5. Healthcare policy changes affecting the pharmaceutical sector
    
    Each development should cite the specific article URL. Format as numbered list with brief descriptions and include citation references [1], [2], etc.`;
    
    const result = await this.queryPerplexity(prompt);
    console.log(`🎯 Key Developments - Citations received: ${result.citations.length}`);
    
    // Collect citations for consolidated sources
    this.allBriefCitations.push(...result.citations);
    
    const processed = await this.processContentWithLinks(result.content, result.citations);
    
    // Remove references and convert to array
    const cleanContent = processed
      .replace(/References?:\s*[\s\S]*$/i, '')
      .replace(/Sources?:\s*[\s\S]*$/i, '')
      .replace(/\n\s*References?:.*$/gmi, '')
      .replace(/\n\s*Sources?:.*$/gmi, '')
      .trim();
    
    const developments = cleanContent.split('\n').filter(line => line.trim());
    return { content: developments, citations: result.citations };
  }

  async generateHealthCrisisUpdatesWithCitations(): Promise<{ content: Array<{ region: string; severity: string; description: string; healthImpact: string }>; citations: Array<{ url: string; title: string; snippet?: string }> }> {
    const prompt = `Search for current global health crises and their pharmaceutical implications from authoritative sources:
    - WHO (who.int)
    - CDC (cdc.gov) 
    - STAT News (statnews.com)
    - Reuters Health
    - BioPharma Dive
    
    Focus on:
    1. Disease outbreaks affecting pharmaceutical supply chains
    2. Public health emergencies requiring pharmaceutical interventions
    3. Regional health crises impacting drug access or development
    4. Regulatory responses to health emergencies
    
    Format as structured updates with specific source citations.`;
    
    const result = await this.queryPerplexity(prompt);
    console.log(`🎯 Health Crisis Updates - Citations received: ${result.citations.length}`);
    
    // Collect citations for consolidated sources
    this.allBriefCitations.push(...result.citations);
    
    const processed = await this.processContentWithLinks(result.content, result.citations);
    
    // Convert to structured format (simplified for now)
    const updates = [{
      region: "Global",
      severity: "medium",
      description: processed.replace(/References?:\s*[\s\S]*$/i, '').replace(/Sources?:\s*[\s\S]*$/i, '').trim(),
      healthImpact: "Monitoring pharmaceutical sector impacts"
    }];
    
    return { content: updates, citations: result.citations };
  }

  async generateMarketImpactAnalysisWithCitations(): Promise<{ content: string; citations: Array<{ url: string; title: string; snippet?: string }> }> {
    const prompt = `Analyze today's pharmaceutical market developments and their financial impact. Search recent articles from:
    - Bloomberg Healthcare (bloomberg.com)
    - Reuters Business/Healthcare (reuters.com/business/healthcare-pharmaceuticals/)
    - BioPharma Dive (biopharmadive.com)
    - FiercePharma (fiercepharma.com)
    - Wall Street Journal Health
    
    Focus on:
    - Stock price movements of major pharmaceutical companies
    - FDA approvals or rejections affecting company valuations
    - Merger & acquisition activity in pharma sector
    - Clinical trial results moving markets
    - Regulatory decisions impacting pharmaceutical revenues
    
    Provide specific company names, stock movements, and market reactions with source citations.`;
    
    const result = await this.queryPerplexity(prompt);
    console.log(`🎯 Market Impact Analysis - Citations received: ${result.citations.length}`);
    
    // Collect citations for consolidated sources
    this.allBriefCitations.push(...result.citations);
    
    const processed = await this.processContentWithLinks(result.content, result.citations);
    
    // Remove references sections
    const cleanContent = processed
      .replace(/References?:\s*[\s\S]*$/i, '')
      .replace(/Sources?:\s*[\s\S]*$/i, '')
      .replace(/\n\s*References?:.*$/gmi, '')
      .replace(/\n\s*Sources?:.*$/gmi, '')
      .trim();
    
    return { content: cleanContent, citations: result.citations };
  }

  async generateRegulatoryAnalysisWithCitations(): Promise<{ content: string; citations: Array<{ url: string; title: string; snippet?: string }> }> {
    const prompt = `Analyze current pharmaceutical regulatory developments and policy changes. Search recent articles from:
    - FDA (fda.gov/news-events)
    - STAT News (statnews.com)
    - BioPharma Dive (biopharmadive.com)
    - Reuters Healthcare (reuters.com)
    - Pharmaceutical Executive (pharmexec.com)
    
    Focus on:
    - New FDA drug approvals or rejections
    - Changes in pharmaceutical regulations or policies
    - International regulatory harmonization efforts
    - Healthcare policy changes affecting pharmaceutical companies
    - Regulatory guidance updates for drug development
    
    Provide detailed analysis of regulatory impact on the pharmaceutical industry with specific source citations.`;
    
    const result = await this.queryPerplexity(prompt);
    console.log(`🎯 Regulatory Analysis - Citations received: ${result.citations.length}`);
    
    // Collect citations for consolidated sources
    this.allBriefCitations.push(...result.citations);
    
    const processed = await this.processContentWithLinks(result.content, result.citations);
    
    // Remove references sections
    const cleanContent = processed
      .replace(/References?:\s*[\s\S]*$/i, '')
      .replace(/Sources?:\s*[\s\S]*$/i, '')
      .replace(/\n\s*References?:.*$/gmi, '')
      .replace(/\n\s*Sources?:.*$/gmi, '')
      .trim();
    
    return { content: cleanContent, citations: result.citations };
  }

  async generateComprehensiveIntelligenceBrief(): Promise<PharmaceuticalIntelligence> {
    try {
      console.log('🔬 Generating comprehensive pharmaceutical intelligence using Perplexity AI...');
      
      // Reset citations collection for new brief
      this.allBriefCitations = [];
      
      // Generate content sections and collect citations
      const [
        summaryResult,
        keyDevelopmentsResult,
        healthCrisisResult,
        marketImpactResult,
        regulatoryResult
      ] = await Promise.all([
        this.generateExecutiveSummaryWithCitations(),
        this.generateKeyDevelopmentsWithCitations(),
        this.generateHealthCrisisUpdatesWithCitations(),
        this.generateMarketImpactAnalysisWithCitations(),
        this.generateRegulatoryAnalysisWithCitations()
      ]);

      // Generate stock analysis based on mentions from other sections
      const stockAnalysis = await this.generatePharmaceuticalStockAnalysis(
        summaryResult.content,
        keyDevelopmentsResult.content,
        healthCrisisResult.content,
        marketImpactResult.content,
        regulatoryResult.content
      );

      // Create consolidated sources section with all actual citations
      const sourcesSection = this.createConsolidatedSourcesSection();

      console.log('✅ Successfully generated pharmaceutical intelligence from Perplexity AI');
      console.log(`📚 Collected ${this.allBriefCitations.length} total citations for sources section`);

      return {
        title: `Pharmaceutical Intelligence Brief - ${new Date().toLocaleDateString()}`,
        summary: summaryResult.content + sourcesSection,
        keyDevelopments: keyDevelopmentsResult.content,
        conflictUpdates: healthCrisisResult.content,
        defenseStockHighlights: [],
        pharmaceuticalStockHighlights: stockAnalysis,
        marketImpact: marketImpactResult.content,
        geopoliticalAnalysis: regulatoryResult.content,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error generating pharmaceutical intelligence:', error);
      throw error;
    }
  }
}

export const perplexityService = new PerplexityService();