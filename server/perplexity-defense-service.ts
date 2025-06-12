import { yahooFinanceService } from './yahoo-finance-service.js';
import { storage } from './storage.js';
import type { DailyNews, InsertDailyNews, NewsStockHighlight, NewsConflictUpdate, InsertStock } from '../shared/schema.js';

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
}

interface DefenseIntelligenceBrief {
  title: string;
  summary: string;
  keyDevelopments: string[];
  marketImpact: string;
  conflictUpdates: Array<{
    region: string;
    description: string;
    severity: "high" | "medium" | "low" | "critical";
  }>;
  defenseStockHighlights: Array<{
    symbol: string;
    companyName: string;
    analysis: string;
    marketCap?: string;
    contractValue?: string;
  }>;
  geopoliticalAnalysis: string;
  citations: string[];
  rawContent: string;
}

export class PerplexityDefenseService {
  private isGenerating = false;
  private scheduledGeneration: NodeJS.Timeout | null = null;
  private lastGenerationDate: string | null = null;

  constructor() {
    this.initializeDailyScheduler();
  }

  private initializeDailyScheduler(): void {
    const scheduleNext = () => {
      if (this.scheduledGeneration) {
        clearTimeout(this.scheduledGeneration);
      }
      this.scheduleNextGeneration();
    };

    scheduleNext();
  }

  private scheduleNextGeneration(): void {
    const nextMidnight = this.getNextMidnightET();
    const msUntilGeneration = nextMidnight.getTime() - Date.now();
    
    console.log(`🛡️ Next defense intelligence generation scheduled for: ${nextMidnight.toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`);
    console.log(`⏱️  Time until next generation: ${Math.round(msUntilGeneration / (1000 * 60))} minutes`);

    this.scheduledGeneration = setTimeout(() => {
      this.performScheduledGeneration();
    }, msUntilGeneration);
  }

  private getNextMidnightET(): Date {
    const now = new Date();
    const etDate = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const nextMidnight = new Date(etDate);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(1, 0, 0, 0); // 1 AM ET for defense intelligence
    
    return new Date(now.getTime() + (nextMidnight.getTime() - etDate.getTime()));
  }

  private async performScheduledGeneration(): Promise<void> {
    console.log('🛡️ Performing scheduled defense intelligence generation...');
    await this.generateComprehensiveDefenseIntelligence();
    this.scheduleNextGeneration();
  }

  async generateComprehensiveDefenseIntelligence(): Promise<DailyNews | null> {
    if (this.isGenerating) {
      console.log('Defense intelligence generation already in progress...');
      return null;
    }

    this.isGenerating = true;
    console.log('🛡️ Starting comprehensive defense intelligence generation with Perplexity AI...');

    try {
      // Fetch comprehensive defense industry research
      const researchData = await this.fetchComprehensiveDefenseResearch();
      
      // Parse and structure the intelligence brief
      const intelligenceBrief = await this.parseDefenseIntelligence(researchData);
      
      // Get current stocks and conflicts from database
      const stocks = await storage.getStocks();
      const conflicts = await storage.getConflicts();
      
      // Filter defense stocks
      const defenseStocks = stocks.filter(stock => 
        stock.sector === 'Defense' ||
        ['LMT', 'RTX', 'NOC', 'GD', 'BA', 'LHX', 'HII', 'LDOS', 'AVAV', 'KTOS', 'PLTR', 'DFEN'].includes(stock.symbol)
      );

      // Enhance stock highlights with real Yahoo Finance data
      const enhancedStockHighlights = await this.enhanceStockHighlights(
        intelligenceBrief.defenseStockHighlights,
        defenseStocks
      );

      // Detect and add new companies mentioned in the research
      await this.detectAndAddDefenseCompanies(intelligenceBrief.rawContent);

      // Create comprehensive defense intelligence object
      const defenseIntelligence: DailyNews = {
        id: Math.floor(Math.random() * 1000000),
        title: intelligenceBrief.title,
        summary: intelligenceBrief.summary,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        keyDevelopments: intelligenceBrief.keyDevelopments,
        marketImpact: intelligenceBrief.marketImpact,
        conflictUpdates: intelligenceBrief.conflictUpdates.map(update => ({
          conflict: update.region,
          update: update.description,
          severity: update.severity
        })),
        defenseStockHighlights: enhancedStockHighlights,
        pharmaceuticalStockHighlights: [],
        geopoliticalAnalysis: intelligenceBrief.geopoliticalAnalysis
      };

      // Store in database
      const insertData: InsertDailyNews = {
        title: defenseIntelligence.title,
        summary: defenseIntelligence.summary,
        date: defenseIntelligence.date,
        keyDevelopments: Array.isArray(defenseIntelligence.keyDevelopments) ? defenseIntelligence.keyDevelopments : [],
        marketImpact: defenseIntelligence.marketImpact,
        conflictUpdates: Array.isArray(defenseIntelligence.conflictUpdates) ? defenseIntelligence.conflictUpdates : [],
        defenseStockHighlights: Array.isArray(defenseIntelligence.defenseStockHighlights) ? defenseIntelligence.defenseStockHighlights : [],
        pharmaceuticalStockHighlights: [],
        geopoliticalAnalysis: defenseIntelligence.geopoliticalAnalysis
      };

      await storage.createDailyNews(insertData);
      console.log('✅ Defense intelligence brief generated and stored successfully');
      
      this.lastGenerationDate = defenseIntelligence.date;
      return defenseIntelligence;

    } catch (error) {
      console.error('❌ Error generating defense intelligence:', error);
      return this.generateFallbackDefenseIntelligence();
    } finally {
      this.isGenerating = false;
    }
  }

  private async fetchComprehensiveDefenseResearch(): Promise<{ content: string; citations: string[] }> {
    try {
      console.log('🔍 Fetching comprehensive defense industry research from Perplexity AI...');
      
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
              content: 'You are a defense industry analyst. Provide current, factual information about defense sector developments, geopolitical events, and military contractor activities. Include specific company names, stock symbols, and quantifiable market impacts.'
            },
            {
              role: 'user',
              content: 'What are the most significant defense industry developments, geopolitical events, and military contractor activities happening today? Include specific companies, contracts, and market movements for defense contractors like Lockheed Martin (LMT), Raytheon (RTX), Northrop Grumman (NOC), General Dynamics (GD), Boeing (BA), and L3Harris (LHX).'
            }
          ],
          max_tokens: 2000,
          temperature: 0.2,
          top_p: 0.9,
          return_citations: true,
          search_domain_filter: ["reuters.com", "bloomberg.com", "wsj.com", "defensenews.com", "marketwatch.com", "cnbc.com"]
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
      
      console.log(`📄 Received ${content.length} characters of defense research with ${citations.length} citations`);
      
      return { content, citations };
    } catch (error) {
      console.error('❌ Error fetching defense research:', error);
      throw error;
    }
  }

  private async parseDefenseIntelligence(researchData: { content: string; citations: string[] }): Promise<DefenseIntelligenceBrief> {
    const content = researchData.content;
    const citations = researchData.citations;

    // Extract key information using advanced parsing
    const title = this.extractTitle(content);
    const summary = this.extractSummary(content);
    const keyDevelopments = this.extractKeyDevelopments(content);
    const marketImpact = this.extractMarketImpact(content);
    const conflictUpdates = this.extractConflictUpdates(content);
    const defenseStockHighlights = this.extractStockHighlights(content);
    const geopoliticalAnalysis = this.extractGeopoliticalAnalysis(content);

    return {
      title,
      summary,
      keyDevelopments,
      marketImpact,
      conflictUpdates,
      defenseStockHighlights,
      geopoliticalAnalysis,
      citations,
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
    return `Defense Intelligence Brief - ${today}`;
  }

  private extractSummary(content: string): string {
    // Extract the first substantial paragraph or key summary points
    const paragraphs = content.split('\n').filter(p => p.trim().length > 100);
    return paragraphs[0]?.substring(0, 500) + '...' || 
           'Comprehensive defense sector analysis featuring current market developments, contract awards, and geopolitical intelligence.';
  }

  private extractKeyDevelopments(content: string): string[] {
    const developments: string[] = [];
    
    // Look for bullet points, numbered lists, or key developments
    const bulletRegex = /[•\-\*]\s*(.+)/g;
    const numberedRegex = /\d+\.\s*(.+)/g;
    
    let match;
    while ((match = bulletRegex.exec(content)) !== null && developments.length < 8) {
      if (match[1].trim().length > 30) {
        developments.push(match[1].trim());
      }
    }
    
    while ((match = numberedRegex.exec(content)) !== null && developments.length < 8) {
      if (match[1].trim().length > 30 && !developments.includes(match[1].trim())) {
        developments.push(match[1].trim());
      }
    }

    // If no structured list found, extract key sentences
    if (developments.length < 3) {
      const sentences = content.split(/[.!?]+/).filter(s => 
        s.trim().length > 50 && 
        s.trim().length < 200 &&
        (s.includes('$') || s.includes('%') || s.includes('contract') || s.includes('award'))
      );
      
      developments.push(...sentences.slice(0, 6).map(s => s.trim()));
    }

    return developments.slice(0, 8);
  }

  private extractMarketImpact(content: string): string {
    // Look for market impact, outlook, or analysis sections
    const impactKeywords = ['market impact', 'outlook', 'analysis', 'implications', 'forecast'];
    const paragraphs = content.split('\n').filter(p => p.trim().length > 50);
    
    for (const paragraph of paragraphs) {
      for (const keyword of impactKeywords) {
        if (paragraph.toLowerCase().includes(keyword)) {
          return paragraph.trim().substring(0, 400) + '...';
        }
      }
    }
    
    // Fallback to any paragraph mentioning financial metrics
    for (const paragraph of paragraphs) {
      if (paragraph.includes('$') || paragraph.includes('%') || paragraph.includes('billion')) {
        return paragraph.trim().substring(0, 400) + '...';
      }
    }
    
    return 'Defense sector showing resilient performance amid sustained government spending and geopolitical tensions driving increased procurement activities.';
  }

  private extractConflictUpdates(content: string): Array<{ region: string; description: string; severity: "high" | "medium" | "low" | "critical" }> {
    const updates: Array<{ region: string; description: string; severity: "high" | "medium" | "low" | "critical" }> = [];
    
    const regions = ['Ukraine', 'Taiwan', 'China', 'Middle East', 'NATO', 'Indo-Pacific', 'Korea', 'Iran', 'Russia'];
    const severityKeywords = {
      'critical': ['critical', 'urgent', 'immediate', 'crisis'],
      'high': ['high', 'significant', 'major', 'escalation'],
      'medium': ['moderate', 'ongoing', 'developing', 'monitoring'],
      'low': ['minor', 'routine', 'stable', 'peaceful']
    };

    for (const region of regions) {
      const regionRegex = new RegExp(`${region}[^.]*[.]`, 'gi');
      const matches = content.match(regionRegex);
      
      if (matches && matches.length > 0) {
        const description = matches[0].trim();
        let severity: "high" | "medium" | "low" | "critical" = 'medium';
        
        // Determine severity based on keywords
        for (const [level, keywords] of Object.entries(severityKeywords)) {
          if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
            severity = level as "high" | "medium" | "low" | "critical";
            break;
          }
        }
        
        updates.push({
          region,
          description: description.substring(0, 300),
          severity
        });
      }
    }
    
    return updates.slice(0, 5);
  }

  private extractStockHighlights(content: string): Array<{ symbol: string; companyName: string; analysis: string; marketCap?: string; contractValue?: string }> {
    const highlights: Array<{ symbol: string; companyName: string; analysis: string; marketCap?: string; contractValue?: string }> = [];
    
    const stockPatterns = [
      { symbol: 'LMT', name: 'Lockheed Martin' },
      { symbol: 'RTX', name: 'Raytheon Technologies' },
      { symbol: 'NOC', name: 'Northrop Grumman' },
      { symbol: 'GD', name: 'General Dynamics' },
      { symbol: 'BA', name: 'Boeing' },
      { symbol: 'LHX', name: 'L3Harris Technologies' },
      { symbol: 'HII', name: 'Huntington Ingalls' },
      { symbol: 'LDOS', name: 'Leidos' },
      { symbol: 'AVAV', name: 'AeroVironment' },
      { symbol: 'KTOS', name: 'Kratos Defense' },
      { symbol: 'PLTR', name: 'Palantir' }
    ];

    for (const stock of stockPatterns) {
      const companyRegex = new RegExp(`${stock.name}[^.]*[.]`, 'gi');
      const symbolRegex = new RegExp(`${stock.symbol}[^.]*[.]`, 'gi');
      
      const companyMatches = content.match(companyRegex);
      const symbolMatches = content.match(symbolRegex);
      
      if (companyMatches || symbolMatches) {
        const analysis = (companyMatches?.[0] || symbolMatches?.[0] || '').trim();
        
        // Extract market cap if mentioned
        const marketCapMatch = analysis.match(/\$[\d.,]+\s*(billion|million|B|M)/i);
        const contractMatch = analysis.match(/contract.*\$[\d.,]+\s*(billion|million|B|M)/i);
        
        highlights.push({
          symbol: stock.symbol,
          companyName: stock.name,
          analysis: analysis.substring(0, 300),
          marketCap: marketCapMatch?.[0],
          contractValue: contractMatch?.[0]
        });
      }
    }
    
    return highlights.slice(0, 8);
  }

  private extractGeopoliticalAnalysis(content: string): string {
    // Look for geopolitical analysis sections
    const geoKeywords = ['geopolitical', 'international', 'global', 'strategic', 'alliance', 'conflict'];
    const paragraphs = content.split('\n').filter(p => p.trim().length > 100);
    
    for (const paragraph of paragraphs) {
      for (const keyword of geoKeywords) {
        if (paragraph.toLowerCase().includes(keyword)) {
          return paragraph.trim().substring(0, 500) + '...';
        }
      }
    }
    
    return 'Current geopolitical environment characterized by evolving security challenges requiring sustained defense investment and international cooperation.';
  }

  private async enhanceStockHighlights(stockHighlights: Array<{ symbol: string; companyName: string; analysis: string }>, defenseStocks: any[]): Promise<NewsStockHighlight[]> {
    const enhanced: NewsStockHighlight[] = [];
    
    for (const highlight of stockHighlights) {
      try {
        const quote = await yahooFinanceService.getStockQuote(highlight.symbol);
        const stockData = defenseStocks.find(s => s.symbol === highlight.symbol);

        enhanced.push({
          symbol: highlight.symbol,
          name: highlight.companyName || stockData?.name || highlight.symbol,
          change: quote?.change || 0,
          changePercent: quote?.changePercent || 0,
          price: quote?.price || 0,
          reason: highlight.analysis || `Defense sector performance with current market activity`
        });
      } catch (error) {
        console.warn(`⚠️ Could not enhance stock data for ${highlight.symbol}:`, error);
        enhanced.push({
          symbol: highlight.symbol,
          name: highlight.companyName || highlight.symbol,
          change: 0,
          changePercent: 0,
          price: 0,
          reason: highlight.analysis || "Analysis pending"
        });
      }
    }
    
    return enhanced;
  }

  private async detectAndAddDefenseCompanies(content: string): Promise<void> {
    const stockSymbolRegex = /\b[A-Z]{2,5}\b/g;
    const detectedSymbols = new Set<string>();
    
    // Extract potential stock symbols
    const matches = content.match(stockSymbolRegex) || [];
    for (const match of matches) {
      if (match.length >= 2 && match.length <= 5) {
        detectedSymbols.add(match);
      }
    }

    // Known defense companies to check
    const defenseCompanies = ['LMT', 'RTX', 'NOC', 'GD', 'BA', 'LHX', 'HII', 'LDOS', 'AVAV', 'KTOS', 'PLTR', 'DFEN'];
    
    for (const symbol of defenseCompanies) {
      if (content.includes(symbol)) {
        detectedSymbols.add(symbol);
      }
    }

    // Add detected companies to database
    for (const symbol of Array.from(detectedSymbols)) {
      try {
        const existingStocks = await storage.getStocks();
        const stockExists = existingStocks.some(s => s.symbol === symbol);
        
        if (!stockExists && defenseCompanies.includes(symbol)) {
          const quote = await yahooFinanceService.getStockQuote(symbol);
          
          if (quote) {
            const newStock: InsertStock = {
              symbol: symbol,
              name: quote.name || symbol,
              price: quote.price || 0,
              change: quote.change || 0,
              changePercent: quote.changePercent || 0,
              volume: quote.volume || 0,
              marketCap: quote.marketCap ? quote.marketCap.toString() : null,
              sector: "Defense"
            };

            await storage.createStock(newStock);
            console.log(`✅ Added new defense stock: ${symbol}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not add defense stock ${symbol}:`, error);
      }
    }
  }

  private async generateFallbackDefenseIntelligence(): Promise<DailyNews> {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      id: Math.floor(Math.random() * 1000000),
      title: `Defense Intelligence Brief - ${new Date().toLocaleDateString()}`,
      summary: "Comprehensive defense sector analysis featuring current market developments and geopolitical intelligence.",
      date: today,
      createdAt: new Date(),
      keyDevelopments: [
        "Major defense contractors maintaining strong operational performance",
        "Geopolitical tensions driving increased defense procurement activities",
        "Advanced weapons systems development progressing across key programs",
        "International defense cooperation expanding through strategic partnerships"
      ],
      marketImpact: "Defense sector demonstrating resilient performance with sustained government spending support.",
      conflictUpdates: [],
      defenseStockHighlights: [],
      pharmaceuticalStockHighlights: [],
      geopoliticalAnalysis: "Current security environment requiring continued defense investment and international cooperation."
    };
  }

  async getTodaysDefenseIntelligence(): Promise<DailyNews | null> {
    const today = new Date().toISOString().split('T')[0];
    
    if (this.lastGenerationDate === today) {
      return await storage.getDailyNews(today) || null;
    }

    // Generate new defense intelligence
    return await this.generateComprehensiveDefenseIntelligence();
  }
}

export const perplexityDefenseService = new PerplexityDefenseService();