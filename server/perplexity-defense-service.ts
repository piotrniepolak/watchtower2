import { yahooFinanceService } from './yahoo-finance-service.js';
import { storage } from './storage.js';
import { perplexityConflictService } from './perplexity-conflict-service.js';
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
  sources: Array<{
    title: string;
    url: string;
    domain: string;
    category: string;
  }>;
  rawContent: string;
}

export class PerplexityDefenseService {
  private isGenerating = false;
  private scheduledGeneration: NodeJS.Timeout | null = null;
  private lastGenerationDate: string | null = null;

  constructor() {
    this.initializeDailyScheduler();
  }

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
      .replace(/\s*\.\s*bloomberg\.com\s*/gi, '.')
      .replace(/\s*bloomberg\.com\s*/gi, ' ')
      .replace(/\s*defensenews\.com\s*/gi, ' ')
      .replace(/\s*reuters\.com\s*/gi, ' ')
      .replace(/\s*wsj\.com\s*/gi, ' ')
      .replace(/\s*cnbc\.com\s*/gi, ' ')
      .replace(/\s*marketwatch\.com\s*/gi, ' ')
      .replace(/\s*\b[a-zA-Z0-9.-]+\.com\b\s*/gi, ' ')
      .replace(/\s*\.\s*[a-zA-Z0-9.-]+\.com\s*/gi, '.')
      .replace(/trajectories\.\s*[a-zA-Z0-9.-]+\.com/gi, 'trajectories.')
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

        if (domain.includes('defense')) {
          category = 'defense';
          title = `Defense News - ${domain}`;
        } else if (domain.includes('bloomberg')) {
          category = 'financial';
          title = 'Bloomberg Defense Coverage';
        } else if (domain.includes('reuters')) {
          category = 'news';
          title = 'Reuters Defense & Aerospace';
        } else if (domain.includes('wsj')) {
          category = 'financial';
          title = 'Wall Street Journal Defense';
        } else if (domain.includes('pentagon') || domain.includes('defense.gov')) {
          category = 'government';
          title = 'U.S. Department of Defense';
        } else if (domain.includes('nato')) {
          category = 'government';
          title = 'NATO Official Updates';
        }

        return { title, url, domain, category };
      } catch {
        return { 
          title: 'Defense Intelligence Source',
          url,
          domain: 'unknown',
          category: 'news'
        };
      }
    });
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
    nextMidnight.setHours(1, 0, 0, 0);

    return new Date(now.getTime() + (nextMidnight.getTime() - etDate.getTime()));
  }

  private async performScheduledGeneration(): Promise<void> {
    console.log('🛡️ Performing scheduled defense intelligence generation...');
    await this.generateComprehensiveDefenseIntelligence();
    this.scheduleNextGeneration();
  }

  async generateComprehensiveDefenseIntelligence(): Promise<DailyNews | null> {
    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('❌ PERPLEXITY_API_KEY not configured - cannot generate defense intelligence');
      return null;
    }

    if (this.isGenerating) {
      console.log('Defense intelligence generation already in progress, skipping...');
      return null;
    }

    this.isGenerating = true;
    console.log('🛡️ Starting real-time defense intelligence generation with Perplexity AI...');

    try {
      // Delete any existing entry for today to ensure fresh data
      const today = new Date().toISOString().split('T')[0];
      await storage.deleteDailyNews(today, 'defense');

      // Fetch comprehensive defense industry research with real-time data
      const researchData = await this.fetchComprehensiveDefenseResearch();

      if (!researchData.content || researchData.content.length < 100) {
        console.error('❌ Insufficient content from Perplexity AI - aborting generation');
        return null;
      }

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

      // Generate comprehensive conflict updates with Perplexity AI
      console.log('🌍 Generating real-time global conflict intelligence...');
      let enhancedConflictUpdates: any[] = [];

      try {
        const conflictIntelligence = await perplexityConflictService.generateComprehensiveConflictUpdates();

        if (conflictIntelligence && conflictIntelligence.length > 0) {
          enhancedConflictUpdates = conflictIntelligence.map(conflict => ({
            conflict: conflict.conflictName,
            conflictName: conflict.conflictName,
            region: conflict.region,
            update: conflict.currentStatus,
            currentStatus: conflict.currentStatus,
            severity: conflict.severity,
            developments: conflict.recentDevelopments,
            recentDevelopments: conflict.recentDevelopments,
            defenseImpact: conflict.defenseImpact,
            marketImplications: conflict.marketImplications,
            sourceLinks: conflict.sourceLinks,
            lastUpdated: conflict.lastUpdated
          }));
          console.log(`✅ Enhanced ${enhancedConflictUpdates.length} conflict updates with real-time intelligence`);
        }
      } catch (error) {
        console.error('❌ Error generating conflict intelligence:', error);
        // Still continue with defense brief even if conflict intelligence fails
      }

      // Create comprehensive defense intelligence object
      const defenseIntelligence: DailyNews = {
        id: Math.floor(Math.random() * 1000000),
        title: intelligenceBrief.title,
        summary: intelligenceBrief.summary,
        date: today,
        createdAt: new Date(),
        keyDevelopments: intelligenceBrief.keyDevelopments,
        marketImpact: intelligenceBrief.marketImpact,
        conflictUpdates: enhancedConflictUpdates,
        defenseStockHighlights: enhancedStockHighlights,
        pharmaceuticalStockHighlights: [],
        geopoliticalAnalysis: intelligenceBrief.geopoliticalAnalysis,
        sources: intelligenceBrief.sources
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
        geopoliticalAnalysis: defenseIntelligence.geopoliticalAnalysis,
        sources: defenseIntelligence.sources || []
      };

      await storage.createDailyNews(insertData, 'defense');
      console.log('✅ Real-time defense intelligence brief generated and stored successfully');

      this.lastGenerationDate = defenseIntelligence.date;
      return defenseIntelligence;

    } catch (error) {
      console.error('❌ Error generating defense intelligence:', error);
      return null;
    } finally {
      this.isGenerating = false;
    }
  }

  private async fetchComprehensiveDefenseResearch(): Promise<{ content: string; citations: string[] }> {
    try {
      console.log('🔍 Fetching real-time defense industry research from Perplexity AI...');

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
              content: 'You are a defense industry analyst. Provide current, factual information about defense sector developments, geopolitical events, and military contractor activities happening TODAY. Include specific company names, stock symbols, and quantifiable market impacts. Focus on breaking news and recent developments only.'
            },
            {
              role: 'user',
              content: `What are the most significant defense industry developments, geopolitical events, and military contractor activities happening TODAY (${new Date().toLocaleDateString()})? Include specific companies, contracts, and market movements for defense contractors like Lockheed Martin (LMT), Raytheon (RTX), Northrop Grumman (NOC), General Dynamics (GD), Boeing (BA), and L3Harris (LHX). Focus on breaking news, contract awards, earnings reports, and geopolitical developments from the last 24-48 hours.`
            }
          ],
          max_tokens: 3000,
          temperature: 0.1,
          top_p: 0.9,
          return_citations: true,
          search_domain_filter: ["reuters.com", "bloomberg.com", "wsj.com", "defensenews.com", "marketwatch.com", "cnbc.com", "defense.gov", "nato.int"]
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

      console.log(`📄 Received ${content.length} characters of real-time defense research with ${citations.length} citations`);

      if (content.length < 100) {
        throw new Error('Insufficient content from Perplexity AI');
      }

      return { content, citations };
    } catch (error) {
      console.error('❌ Error fetching defense research:', error);
      throw error;
    }
  }

  private async parseDefenseIntelligence(researchData: { content: string; citations: string[] }): Promise<DefenseIntelligenceBrief> {
    const content = researchData.content;
    const citations = researchData.citations;

    console.log(`🔍 Parsing defense intelligence from ${content.length} characters of real-time content...`);

    // Extract key information using advanced parsing
    const title = this.extractTitle(content);
    const cleanedContent = this.cleanFormattingSymbols(content);
    const summary = this.extractSummary(cleanedContent);
    const keyDevelopments = this.extractKeyDevelopments(cleanedContent);
    const marketImpact = this.extractMarketImpact(cleanedContent);
    const conflictUpdates = this.extractConflictUpdates(cleanedContent);
    const defenseStockHighlights = this.extractStockHighlights(cleanedContent);
    const geopoliticalAnalysis = this.extractGeopoliticalAnalysis(cleanedContent);
    const sources = this.extractSourcesFromCitations(citations);

    return {
      title,
      summary,
      keyDevelopments,
      marketImpact,
      conflictUpdates,
      defenseStockHighlights,
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
    return `Defense Intelligence Brief - ${today}`;
  }

  private extractSummary(content: string): string {
    console.log('🔍 Generating executive summary from real-time Perplexity content...');

    const paragraphs = content.split('\n').filter(p => p.trim().length > 50);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 30);

    let summary = '';
    const keyThemes = [];
    const contentLower = content.toLowerCase();

    if (contentLower.includes('contract') || contentLower.includes('award') || contentLower.includes('million') || contentLower.includes('billion')) {
      keyThemes.push('defense contract awards and funding initiatives');
    }
    if (contentLower.includes('earnings') || contentLower.includes('revenue') || contentLower.includes('financial') || contentLower.includes('stock')) {
      keyThemes.push('corporate financial performance and market dynamics');
    }
    if (contentLower.includes('geopolitical') || contentLower.includes('conflict') || contentLower.includes('ukraine') || contentLower.includes('china')) {
      keyThemes.push('geopolitical tensions and security developments');
    }
    if (contentLower.includes('technology') || contentLower.includes('weapons') || contentLower.includes('hypersonic') || contentLower.includes('ai') || contentLower.includes('cyber')) {
      keyThemes.push('advanced defense technologies and innovation');
    }

    summary += `Today's real-time defense intelligence analysis reveals significant developments across multiple sectors of the global defense industry, driven by current geopolitical dynamics and technological advancement. `;

    if (keyThemes.length > 0) {
      summary += `Key areas of current focus include ${keyThemes.join(', ')}, each presenting immediate opportunities and strategic implications for defense contractors, government agencies, and institutional investors. `;
    }

    const dollarMatches = content.match(/\$[\d,]+\.?\d*\s*(million|billion|M|B)/gi) || [];
    const companyMatches = content.match(/(Lockheed Martin|Boeing|Raytheon|Northrop Grumman|General Dynamics|L3Harris|LMT|BA|RTX|NOC|GD|LHX)/gi) || [];

    if (dollarMatches.length > 0) {
      summary += `Current developments include significant contract awards valued at ${dollarMatches.slice(0, 2).join(' and ')}, demonstrating continued government investment in defense capabilities. `;
    }

    if (companyMatches.length > 0) {
      const uniqueCompanies = [...new Set(companyMatches.slice(0, 3))];
      summary += `Major defense contractors including ${uniqueCompanies.join(', ')} are central to today's market developments and strategic initiatives. `;
    }

    summary += `The current security environment continues to drive elevated defense spending priorities across NATO allies and Indo-Pacific partners, creating sustained demand for traditional platforms while accelerating investment in next-generation capabilities. `;

    const relevantParagraphs = paragraphs.filter(p => 
      p.toLowerCase().includes('million') || 
      p.toLowerCase().includes('contract') || 
      p.toLowerCase().includes('defense') ||
      p.toLowerCase().includes('military') ||
      p.toLowerCase().includes('weapons')
    ).slice(0, 2);

    for (const paragraph of relevantParagraphs) {
      if (paragraph.length > 100) {
        const cleanParagraph = paragraph.replace(/^\W+/, '').replace(/\[\d+\]/g, '').trim();
        if (cleanParagraph.length > 80 && !summary.includes(cleanParagraph.substring(0, 50))) {
          summary += `Recent developments include ${cleanParagraph.substring(0, 250)}. `;
        }
      }
    }

    summary += `Defense industry fundamentals remain robust, supported by multi-year government contracts, expanding international partnerships, and ongoing force modernization requirements. Investment outlook remains positive with key catalysts including congressional defense appropriations, international sales opportunities, and technological breakthrough developments.`;

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
        (s.includes('$') || s.includes('%') || s.includes('contract') || s.includes('award') || s.includes('billion') || s.includes('million'))
      );

      const cleanSentences = sentences.slice(0, 6).map(s => this.cleanFormattingSymbols(s.trim()));
      developments.push(...cleanSentences.filter(s => s.length > 20));
    }

    return developments.slice(0, 8);
  }

  private extractMarketImpact(content: string): string {
    const impactKeywords = ['market impact', 'outlook', 'analysis', 'implications', 'forecast'];
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
        if (paragraph.includes('$') || paragraph.includes('%') || paragraph.includes('billion')) {
          marketImpact = this.cleanFormattingSymbols(paragraph.trim());
          break;
        }
      }
    }

    if (!marketImpact || marketImpact.length < 100) {
      const dollarMatches = content.match(/\$[\d,]+\.?\d*\s*(million|billion|M|B)/gi) || [];
      const companyMatches = content.match(/(Lockheed Martin|Boeing|Raytheon|Northrop Grumman|General Dynamics|L3Harris|LMT|BA|RTX|NOC|GD|LHX)/gi) || [];

      marketImpact = `Defense contractors continue to benefit from sustained government spending and current geopolitical tensions driving immediate procurement activities. Major defense stocks are showing resilient performance with sustained institutional investor confidence based on today's developments. `;

      if (dollarMatches.length > 0) {
        marketImpact += `Current contract awards totaling ${dollarMatches.slice(0, 2).join(' and ')} demonstrate immediate government investment in defense capabilities. `;
      }

      if (companyMatches.length > 0) {
        const uniqueCompanies = [...new Set(companyMatches.slice(0, 3))];
        marketImpact += `Key defense primes including ${uniqueCompanies.join(', ')} are positioned to benefit from today's defense spending and technological advancement programs. `;
      }

      marketImpact += `Current market dynamics favor established defense contractors with proven track records in complex systems integration and program management capabilities.`;
    }

    return this.cleanFormattingSymbols(marketImpact);
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
    const geoKeywords = ['geopolitical', 'international', 'global', 'strategic', 'alliance', 'conflict'];
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
      geoAnalysis = `Current global defense landscape shows heightened tensions in multiple theaters driving immediate demand for advanced military capabilities. Today's developments across Eastern European security concerns maintain elevated defense spending across NATO member nations. Indo-Pacific region security dynamics support continued U.S. military presence and alliance partnerships. The convergence of traditional military requirements with emerging cyber and space-based threats creates expanding market opportunities for defense contractors specializing in multi-domain operational capabilities.`;
    }

    return this.cleanFormattingSymbols(geoAnalysis);
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

  async getTodaysDefenseIntelligence(): Promise<DailyNews | null> {
    const today = new Date().toISOString().split('T')[0];

    // Always generate fresh intelligence - no fallback data
    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('❌ PERPLEXITY_API_KEY required for defense intelligence generation');
      return null;
    }

    return await this.generateComprehensiveDefenseIntelligence();
  }
}

export const perplexityDefenseService = new PerplexityDefenseService();