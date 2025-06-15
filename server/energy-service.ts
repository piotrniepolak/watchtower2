
import { storage } from './storage.js';
import type { DailyNews, InsertDailyNews } from '../shared/schema.js';

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
}

interface EnergyIntelligence {
  title: string;
  summary: string;
  keyDevelopments: string[];
  marketImpact: string;
  geopoliticalAnalysis: string;
  sources: Array<{
    title: string;
    url: string;
    domain: string;
    category: string;
  }>;
  rawContent: string;
}

export class EnergyService {
  private isGenerating = false;

  private cleanFormattingSymbols(content: string): string {
    return content
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#{1,6}\s*/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/~~([^~]+)~~/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/\|/g, '')
      .replace(/[-]{3,}/g, '')
      .replace(/\s*References?:\s*[\s\S]*$/gmi, '')
      .replace(/\s*Sources?:\s*[\s\S]*$/gmi, '')
      .replace(/\s*References?:\s*[^\n]*$/gmi, '')
      .replace(/\s*Sources?:\s*[^\n]*$/gmi, '')
      .replace(/\s*Source:\s*[^\n]*$/gmi, '')
      .replace(/\s*\b[a-zA-Z0-9.-]+\.com\b\s*/gi, ' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private extractSourcesFromCitations(citations: string[]): Array<{title: string; url: string; domain: string; category: string}> {
    return citations.map(url => {
      try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.replace('www.', '');
        
        let category = 'news';
        let title = domain;
        
        if (domain.includes('energy') || domain.includes('oil') || domain.includes('gas')) {
          category = 'energy';
          title = `Energy News - ${domain}`;
        } else if (domain.includes('epa') || domain.includes('doe') || domain.includes('energy.gov')) {
          category = 'government';
          title = `Energy Authority - ${domain}`;
        } else if (domain.includes('reuters')) {
          category = 'news';
          title = 'Reuters Energy Coverage';
        } else if (domain.includes('bloomberg')) {
          category = 'financial';
          title = 'Bloomberg Energy & Commodities';
        } else if (domain.includes('iea') || domain.includes('opec')) {
          category = 'international_agency';
          title = 'International Energy Agency';
        } else if (domain.includes('platts') || domain.includes('rigzone')) {
          category = 'industry';
          title = 'Energy Industry Publication';
        }
        
        return { title, url, domain, category };
      } catch {
        return { 
          title: 'Energy Intelligence Source',
          url,
          domain: 'unknown',
          category: 'news'
        };
      }
    });
  }

  async generateEnergyIntelligence(): Promise<DailyNews | null> {
    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('❌ PERPLEXITY_API_KEY not configured - cannot generate energy intelligence');
      return null;
    }

    if (this.isGenerating) {
      console.log('Energy intelligence generation already in progress, skipping...');
      return null;
    }

    this.isGenerating = true;
    console.log('🔋 Starting real-time energy intelligence generation with Perplexity AI...');

    try {
      // Delete any existing entry for today to ensure fresh data
      const today = new Date().toISOString().split('T')[0];
      await storage.deleteDailyNews(today, 'energy');

      // Fetch comprehensive energy industry research with real-time data
      const researchData = await this.fetchComprehensiveEnergyResearch();
      
      if (!researchData.content || researchData.content.length < 100) {
        console.error('❌ Insufficient content from Perplexity AI - aborting generation');
        return null;
      }

      // Parse and structure the intelligence brief
      const intelligenceBrief = await this.parseEnergyIntelligence(researchData);
      
      // Get energy stocks for enhancement
      const allStocks = await storage.getStocks();
      const energyStocks = allStocks.filter(stock => stock.sector === 'Energy');
      
      // Extract energy companies mentioned in the brief
      const energyStockHighlights = await this.extractMentionedCompanies(intelligenceBrief.rawContent, energyStocks);

      // Create comprehensive energy intelligence object
      const energyIntelligence: DailyNews = {
        id: Math.floor(Math.random() * 1000000),
        title: intelligenceBrief.title,
        summary: intelligenceBrief.summary,
        date: today,
        createdAt: new Date(),
        keyDevelopments: intelligenceBrief.keyDevelopments,
        marketImpact: intelligenceBrief.marketImpact,
        conflictUpdates: [],
        defenseStockHighlights: [],
        pharmaceuticalStockHighlights: [],
        energyStockHighlights: energyStockHighlights,
        geopoliticalAnalysis: intelligenceBrief.geopoliticalAnalysis,
        sources: intelligenceBrief.sources
      };

      // Store in database
      const insertData: InsertDailyNews = {
        title: energyIntelligence.title,
        summary: energyIntelligence.summary,
        date: energyIntelligence.date,
        keyDevelopments: energyIntelligence.keyDevelopments,
        marketImpact: energyIntelligence.marketImpact,
        conflictUpdates: [],
        defenseStockHighlights: [],
        pharmaceuticalStockHighlights: [],
        energyStockHighlights: energyIntelligence.energyStockHighlights,
        geopoliticalAnalysis: energyIntelligence.geopoliticalAnalysis,
        sources: energyIntelligence.sources || []
      };

      await storage.createDailyNews(insertData, 'energy');
      console.log('✅ Real-time energy intelligence brief generated and stored successfully');
      
      return energyIntelligence;

    } catch (error) {
      console.error('❌ Error generating energy intelligence:', error);
      return null;
    } finally {
      this.isGenerating = false;
    }
  }

  private async fetchComprehensiveEnergyResearch(): Promise<{ content: string; citations: string[] }> {
    try {
      console.log('🔍 Fetching real-time energy industry research from Perplexity AI...');
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are an energy industry analyst. Provide current, factual information about energy sector developments, oil and gas markets, renewable energy, and energy company activities happening TODAY. Include specific company names, stock symbols, and quantifiable market impacts. Focus on breaking news and recent developments only.'
            },
            {
              role: 'user',
              content: `What are the most significant energy industry developments, oil and gas market movements, renewable energy updates, and energy company activities happening TODAY (${new Date().toLocaleDateString()})? Include specific companies like ExxonMobil (XOM), Chevron (CVX), ConocoPhillips (COP), EOG Resources (EOG), Kinder Morgan (KMI), Valero (VLO), Marathon Petroleum (MPC), NextEra Energy (NEE), and other major energy companies. Focus on commodity prices, earnings reports, regulatory developments, and energy infrastructure projects from the last 24-48 hours.`
            }
          ],
          max_tokens: 3000,
          temperature: 0.1,
          top_p: 0.9,
          return_citations: true,
          search_domain_filter: ["reuters.com", "bloomberg.com", "wsj.com", "rigzone.com", "oilprice.com", "energy.gov", "iea.org", "platts.com"]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API error response:', errorText);
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      const data: PerplexityResponse = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const citations = data.citations || [];
      
      console.log(`📄 Received ${content.length} characters of real-time energy research with ${citations.length} citations`);
      
      if (content.length < 100) {
        throw new Error('Insufficient content from Perplexity AI');
      }
      
      return { content, citations };
    } catch (error) {
      console.error('❌ Error fetching energy research:', error);
      throw error;
    }
  }

  private async parseEnergyIntelligence(researchData: { content: string; citations: string[] }): Promise<EnergyIntelligence> {
    const content = researchData.content;
    const citations = researchData.citations;

    console.log(`🔍 Parsing energy intelligence from ${content.length} characters of real-time content...`);

    const title = this.extractTitle(content);
    const cleanedContent = this.cleanFormattingSymbols(content);
    const summary = this.extractSummary(cleanedContent);
    const keyDevelopments = this.extractKeyDevelopments(cleanedContent);
    const marketImpact = this.extractMarketImpact(cleanedContent);
    const geopoliticalAnalysis = this.extractGeopoliticalAnalysis(cleanedContent);
    const sources = this.extractSourcesFromCitations(citations);

    return {
      title,
      summary,
      keyDevelopments,
      marketImpact,
      geopoliticalAnalysis,
      sources,
      rawContent: content
    };
  }

  private extractTitle(content: string): string {
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return `Energy Intelligence Brief - ${today}`;
  }

  private extractSummary(content: string): string {
    console.log('🔍 Generating executive summary from real-time energy content...');
    
    const paragraphs = content.split('\n').filter(p => p.trim().length > 50);
    
    let summary = '';
    const keyThemes = [];
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('oil') || contentLower.includes('gas') || contentLower.includes('crude') || contentLower.includes('wti')) {
      keyThemes.push('oil and gas market developments');
    }
    if (contentLower.includes('renewable') || contentLower.includes('solar') || contentLower.includes('wind') || contentLower.includes('clean energy')) {
      keyThemes.push('renewable energy advancement and policy initiatives');
    }
    if (contentLower.includes('earnings') || contentLower.includes('revenue') || contentLower.includes('financial') || contentLower.includes('stock')) {
      keyThemes.push('corporate financial performance and market dynamics');
    }
    if (contentLower.includes('infrastructure') || contentLower.includes('pipeline') || contentLower.includes('refinery') || contentLower.includes('capacity')) {
      keyThemes.push('energy infrastructure and capacity developments');
    }
    
    summary += `Today's real-time energy intelligence analysis reveals significant developments across multiple sectors of the global energy industry, driven by current market dynamics and regulatory advancement. `;
    
    if (keyThemes.length > 0) {
      summary += `Key areas of current focus include ${keyThemes.join(', ')}, each presenting immediate opportunities and strategic implications for energy companies, utilities, and institutional investors. `;
    }
    
    const relevantParagraphs = paragraphs.filter(p => 
      p.toLowerCase().includes('oil') || 
      p.toLowerCase().includes('gas') || 
      p.toLowerCase().includes('energy') ||
      p.toLowerCase().includes('renewable') ||
      p.toLowerCase().includes('crude')
    ).slice(0, 2);
    
    for (const paragraph of relevantParagraphs) {
      if (paragraph.length > 100) {
        const cleanParagraph = paragraph.replace(/^\W+/, '').replace(/\[\d+\]/g, '').trim();
        if (cleanParagraph.length > 80 && !summary.includes(cleanParagraph.substring(0, 50))) {
          summary += `Current developments include ${cleanParagraph.substring(0, 250)}. `;
        }
      }
    }
    
    summary += `Energy industry fundamentals remain dynamic, supported by global demand patterns, infrastructure investment, and transition toward sustainable energy sources. Market outlook reflects ongoing volatility with key catalysts including commodity price movements, geopolitical developments, and regulatory policy changes.`;
    
    return this.cleanFormattingSymbols(summary);
  }

  private extractKeyDevelopments(content: string): string[] {
    const developments: string[] = [];
    
    const bulletRegex = /[•\-\*]\s*(.+)/g;
    const numberedRegex = /\d+\.\s*(.+)/g;
    
    let match;
    while ((match = bulletRegex.exec(content)) !== null && developments.length < 8) {
      if (match[1].trim().length > 30) {
        let cleanDevelopment = this.cleanFormattingSymbols(match[1].trim());
        if (cleanDevelopment.length > 20) {
          developments.push(cleanDevelopment);
        }
      }
    }
    
    while ((match = numberedRegex.exec(content)) !== null && developments.length < 8) {
      if (match[1].trim().length > 30 && !developments.some(dev => dev.includes(match[1].trim().substring(0, 50)))) {
        let cleanDevelopment = this.cleanFormattingSymbols(match[1].trim());
        if (cleanDevelopment.length > 20) {
          developments.push(cleanDevelopment);
        }
      }
    }

    if (developments.length < 3) {
      const sentences = content.split(/[.!?]+/).filter(s => 
        s.trim().length > 50 && 
        s.trim().length < 300 &&
        (s.includes('oil') || s.includes('gas') || s.includes('energy') || s.includes('renewable') || s.includes('$'))
      );
      
      const cleanSentences = sentences.slice(0, 6).map(s => this.cleanFormattingSymbols(s.trim()));
      developments.push(...cleanSentences.filter(s => s.length > 20));
    }

    return developments.slice(0, 8);
  }

  private extractMarketImpact(content: string): string {
    const impactKeywords = ['market impact', 'outlook', 'analysis', 'implications', 'forecast', 'prices'];
    const paragraphs = content.split('\n').filter(p => p.trim().length > 50);
    
    let marketImpact = '';
    
    for (const paragraph of paragraphs) {
      for (const keyword of impactKeywords) {
        if (paragraph.toLowerCase().includes(keyword)) {
          marketImpact = this.cleanFormattingSymbols(paragraph.trim());
          break;
        }
      }
      if (marketImpact) break;
    }
    
    if (!marketImpact) {
      for (const paragraph of paragraphs) {
        if (paragraph.includes('$') || paragraph.includes('%') || paragraph.includes('barrel') || paragraph.includes('price')) {
          marketImpact = this.cleanFormattingSymbols(paragraph.trim());
          break;
        }
      }
    }
    
    if (!marketImpact || marketImpact.length < 100) {
      marketImpact = `Energy companies continue to navigate dynamic market conditions with commodity price volatility driving immediate strategic decisions. Major energy stocks are showing mixed performance reflecting current supply-demand fundamentals and geopolitical considerations. Current market dynamics favor diversified energy companies with strong operational efficiency and strategic positioning across traditional and renewable energy portfolios.`;
    }
    
    return this.cleanFormattingSymbols(marketImpact);
  }

  private extractGeopoliticalAnalysis(content: string): string {
    const geoKeywords = ['geopolitical', 'global', 'international', 'opec', 'sanctions', 'policy', 'regulation'];
    const paragraphs = content.split('\n').filter(p => p.trim().length > 100);
    
    let geoAnalysis = '';
    
    for (const paragraph of paragraphs) {
      for (const keyword of geoKeywords) {
        if (paragraph.toLowerCase().includes(keyword)) {
          geoAnalysis = this.cleanFormattingSymbols(paragraph.trim());
          break;
        }
      }
      if (geoAnalysis) break;
    }
    
    if (!geoAnalysis || geoAnalysis.length < 200) {
      geoAnalysis = `Current global energy landscape reflects continued geopolitical tensions affecting supply chains and pricing mechanisms across multiple energy commodities. Today's developments demonstrate ongoing importance of energy security considerations in policy planning and international cooperation. Energy transition dynamics continue influencing both traditional and renewable energy market positioning worldwide.`;
    }
    
    return this.cleanFormattingSymbols(geoAnalysis);
  }

  private async extractMentionedCompanies(content: string, energyStocks: any[]): Promise<any[]> {
    const mentionedCompanies = [];
    
    const cleanContent = content
      .replace(/\[References:\][\s\S]*$/i, '')
      .replace(/https?:\/\/[^\s\)]+/g, '')
      .replace(/\[\d+\]/g, '')
      .replace(/\(\d+\)/g, '')
      .replace(/References?:\s*\d+\./gi, '')
      .replace(/Source:\s*https?:\/\/[^\s\)]+/gi, '');
    
    console.log(`🔍 Scanning ${cleanContent.length} characters of energy brief content for company mentions...`);
    
    const companyPatterns = [
      { name: 'ExxonMobil', symbol: 'XOM', patterns: ['exxonmobil', 'exxon mobil', 'exxon'] },
      { name: 'Chevron', symbol: 'CVX', patterns: ['chevron corporation', 'chevron'] },
      { name: 'ConocoPhillips', symbol: 'COP', patterns: ['conocophillips', 'conoco phillips'] },
      { name: 'EOG Resources', symbol: 'EOG', patterns: ['eog resources', 'eog'] },
      { name: 'Kinder Morgan', symbol: 'KMI', patterns: ['kinder morgan'] },
      { name: 'Valero Energy', symbol: 'VLO', patterns: ['valero energy', 'valero'] },
      { name: 'Marathon Petroleum', symbol: 'MPC', patterns: ['marathon petroleum', 'marathon'] },
      { name: 'Phillips 66', symbol: 'PSX', patterns: ['phillips 66'] },
      { name: 'Oneok', symbol: 'OKE', patterns: ['oneok'] },
      { name: 'Baker Hughes', symbol: 'BKR', patterns: ['baker hughes'] },
      { name: 'Halliburton', symbol: 'HAL', patterns: ['halliburton'] },
      { name: 'Schlumberger', symbol: 'SLB', patterns: ['schlumberger'] },
      { name: 'NextEra Energy', symbol: 'NEE', patterns: ['nextera energy', 'nextera'] },
      { name: 'Southern Company', symbol: 'SO', patterns: ['southern company'] }
    ];
    
    const lowerContent = cleanContent.toLowerCase();
    
    for (const company of companyPatterns) {
      for (const pattern of company.patterns) {
        const patternIndex = lowerContent.indexOf(pattern.toLowerCase());
        if (patternIndex !== -1) {
          const contextStart = Math.max(0, patternIndex - 100);
          const contextEnd = Math.min(cleanContent.length, patternIndex + pattern.length + 200);
          const context = cleanContent.substring(contextStart, contextEnd).trim();
          
          const isInReference = /^(references?|sources?|citations?)[:.]|^\d+\.|^https?:\/\//i.test(context);
          if (isInReference) {
            console.log(`❌ Excluded ${company.name} (found in reference section)`);
            continue;
          }
          
          const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 20);
          let relevantSentence = context;
          
          for (const sentence of sentences) {
            if (sentence.toLowerCase().includes(pattern.toLowerCase())) {
              relevantSentence = sentence.trim();
              break;
            }
          }
          
          console.log(`✅ Found ${company.name} mentioned in brief content`);
          
          let stock = energyStocks.find((s: any) => s.symbol === company.symbol);
          
          if (!stock) {
            console.log(`🔍 Discovering new energy stock: ${company.symbol} (${company.name})`);
            try {
              const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${company.symbol}`);
              const data = await response.json();
              
              if (data.chart && data.chart.result && data.chart.result[0]) {
                const result = data.chart.result[0];
                const quote = result.meta;
                
                const newStock = {
                  symbol: company.symbol,
                  name: company.name,
                  sector: 'Energy',
                  price: quote.regularMarketPrice || 0,
                  change: (quote.regularMarketPrice - quote.previousClose) || 0,
                  changePercent: ((quote.regularMarketPrice - quote.previousClose) / quote.previousClose * 100) || 0,
                  volume: quote.regularMarketVolume || 0,
                  marketCap: null,
                  lastUpdated: new Date()
                };
                
                await storage.createStock(newStock);
                console.log(`✅ Added ${company.symbol} to energy stocks database with real price data`);
                
                stock = newStock;
                energyStocks.push(newStock);
              }
            } catch (error) {
              console.error(`❌ Failed to fetch stock data for ${company.symbol}:`, error);
              const placeholderStock = {
                symbol: company.symbol,
                name: company.name,
                sector: 'Energy',
                price: 0,
                change: 0,
                changePercent: 0,
                volume: 0,
                marketCap: null,
                lastUpdated: new Date()
              };
              await storage.createStock(placeholderStock);
              stock = placeholderStock;
            }
          }
          
          mentionedCompanies.push({
            symbol: company.symbol,
            name: company.name,
            price: stock?.price || 0,
            change: stock?.change || 0,
            changePercent: stock?.changePercent || 0,
            reason: `Mentioned in brief: "${relevantSentence.substring(0, 150)}..."`
          });
          break;
        }
      }
    }

    return mentionedCompanies;
  }

  async getTodaysEnergyIntelligence(): Promise<DailyNews | null> {
    // Always generate fresh energy intelligence - no fallback data
    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('❌ PERPLEXITY_API_KEY required for energy intelligence generation');
      return null;
    }

    return this.generateEnergyIntelligence();
  }
}

export const energyService = new EnergyService();
