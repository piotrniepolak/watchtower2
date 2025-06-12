import OpenAI from "openai";
import { storage } from "./storage";
import { perplexityService } from "./perplexity-service";
import { yahooFinanceService } from "./yahoo-finance-service";
import type { DailyNews, InsertDailyNews, NewsConflictUpdate, NewsStockHighlight, InsertStock } from "@shared/schema";

export class DefenseNewsService {
  private openai: OpenAI;
  private isGenerating = false;
  private scheduledGeneration: NodeJS.Timeout | null = null;
  private lastGenerationDate: string | null = null;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY environment variable is missing - defense news generation will be limited");
    }
    if (!process.env.PERPLEXITY_API_KEY) {
      console.warn("PERPLEXITY_API_KEY environment variable is missing - current defense events fetching will be limited");
    }
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });
    this.initializeDailyScheduler();
  }

  private initializeDailyScheduler(): void {
    console.log("🛡️ Initializing daily defense intelligence scheduler");
    this.scheduleNextGeneration();
  }

  private scheduleNextGeneration(): void {
    if (this.scheduledGeneration) {
      clearTimeout(this.scheduledGeneration);
    }

    const now = new Date();
    const nextMidnightET = this.getNextMidnightET();
    const msUntilMidnight = nextMidnightET.getTime() - now.getTime();

    console.log(`⏰ Next defense intelligence generation scheduled for: ${nextMidnightET.toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`);
    console.log(`⏱️  Time until next generation: ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);

    this.scheduledGeneration = setTimeout(async () => {
      await this.performScheduledGeneration();
      this.scheduleNextGeneration(); // Schedule the next day
    }, msUntilMidnight);
  }

  private getNextMidnightET(): Date {
    const now = new Date();
    const etNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    
    // Create next midnight in ET
    const nextMidnightET = new Date(etNow);
    nextMidnightET.setHours(24, 0, 0, 0); // Set to midnight of next day
    
    // Convert back to UTC for setTimeout
    const offset = etNow.getTime() - now.getTime();
    return new Date(nextMidnightET.getTime() - offset);
  }

  private async performScheduledGeneration(): Promise<void> {
    const todayET = new Date().toLocaleDateString('en-US', { 
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-').replace(/(\d{4})-(\d{2})-(\d{2})/, '$1-$2-$3');

    if (this.lastGenerationDate === todayET) {
      console.log(`🛡️ Daily defense intelligence already generated for ${todayET}, skipping scheduled generation`);
      return;
    }

    console.log(`🕛 Performing scheduled midnight ET defense intelligence generation for ${todayET}`);
    
    try {
      const result = await this.generatePerplexityDefenseIntelligenceBrief();
      if (result) {
        this.lastGenerationDate = todayET;
        console.log(`✅ Scheduled defense intelligence generation completed successfully for ${todayET}`);
      }
    } catch (error) {
      console.error(`❌ Error in scheduled defense intelligence generation for ${todayET}:`, error);
    }
  }

  private async fetchCurrentDefenseEvents(): Promise<string> {
    try {
      if (!process.env.PERPLEXITY_API_KEY) {
        console.warn("PERPLEXITY_API_KEY not available, skipping current defense events fetch");
        return "Current defense events data unavailable - API key not configured";
      }

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a senior defense intelligence analyst providing comprehensive current global security developments, military conflicts, defense contractor news, and geopolitical events affecting defense markets. Include specific company names, contract values, stock symbols, and detailed financial impacts.'
            },
            {
              role: 'user',
              content: `Provide a comprehensive and detailed overview of current global defense and security developments from the past 24-48 hours, including:

1. ACTIVE MILITARY CONFLICTS: Current status, recent developments, casualty reports, territory changes, military equipment usage, international involvement
2. DEFENSE CONTRACTOR NEWS: Earnings reports, major contracts awarded (with specific dollar amounts), new product announcements, executive changes, merger/acquisition activity
3. GEOPOLITICAL TENSIONS: Diplomatic developments, sanctions, trade restrictions, alliance changes affecting defense markets
4. MILITARY TECHNOLOGY: New weapons systems, cybersecurity developments, AI/autonomous systems, space defense capabilities
5. INTERNATIONAL DEFENSE COOPERATION: Arms deals with specific values, joint military exercises, defense partnership agreements
6. SECURITY THREATS: Cybersecurity incidents, terrorism developments, intelligence operations
7. DEFENSE BUDGET ALLOCATIONS: Government spending announcements, budget changes, procurement decisions

For each item, provide:
- Specific company names and stock symbols when mentioned
- Exact contract values and financial figures
- Countries and regions involved
- Timeline of developments
- Source references where possible
- Market impact analysis

Focus on events that would significantly impact defense markets, security analysis, and military readiness. Include both major defense contractors (Lockheed Martin, Raytheon, Northrop Grumman, etc.) and smaller specialized companies.`
            }
          ],
          max_tokens: 3500,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error fetching current defense events for news:', error);
      return 'Unable to fetch current defense events. Using general geopolitical knowledge.';
    }
  }

  private async detectAndAddDefenseCompanies(stockHighlights: any[], content: string): Promise<void> {
    const knownDefenseCompanies = [
      { symbol: 'LMT', name: 'Lockheed Martin', patterns: ['lockheed martin', 'lockheed', 'LMT'] },
      { symbol: 'RTX', name: 'Raytheon Technologies', patterns: ['raytheon', 'RTX', 'raytheon technologies'] },
      { symbol: 'NOC', name: 'Northrop Grumman', patterns: ['northrop grumman', 'northrop', 'NOC'] },
      { symbol: 'GD', name: 'General Dynamics', patterns: ['general dynamics', 'GD'] },
      { symbol: 'BA', name: 'Boeing', patterns: ['boeing', 'BA'] },
      { symbol: 'LDOS', name: 'Leidos Holdings', patterns: ['leidos', 'LDOS'] },
      { symbol: 'HII', name: 'Huntington Ingalls Industries', patterns: ['huntington ingalls', 'HII'] },
      { symbol: 'LHX', name: 'L3Harris Technologies', patterns: ['l3harris', 'harris', 'LHX'] },
      { symbol: 'AVAV', name: 'AeroVironment', patterns: ['aerovironment', 'AVAV'] },
      { symbol: 'KTOS', name: 'Kratos Defense', patterns: ['kratos', 'KTOS'] },
      { symbol: 'TDG', name: 'TransDigm Group', patterns: ['transdigm', 'TDG'] },
      { symbol: 'CW', name: 'Curtiss-Wright', patterns: ['curtiss-wright', 'CW'] },
      { symbol: 'MRCY', name: 'Mercury Systems', patterns: ['mercury systems', 'MRCY'] },
      { symbol: 'AJRD', name: 'Aerojet Rocketdyne', patterns: ['aerojet', 'rocketdyne', 'AJRD'] },
      { symbol: 'ESLT', name: 'Elbit Systems', patterns: ['elbit', 'ESLT'] }
    ];

    const contentLower = content.toLowerCase();
    const detectedCompanies = new Set<string>();

    // Detect companies from content
    for (const company of knownDefenseCompanies) {
      for (const pattern of company.patterns) {
        if (contentLower.includes(pattern.toLowerCase())) {
          detectedCompanies.add(company.symbol);
          break;
        }
      }
    }

    // Detect companies from stock highlights
    for (const highlight of stockHighlights) {
      if (highlight.symbol) {
        detectedCompanies.add(highlight.symbol);
      }
    }

    // Add detected companies to database if not already present
    const existingStocks = await storage.getStocks();
    const existingSymbols = new Set(existingStocks.map(s => s.symbol));

    for (const symbol of detectedCompanies) {
      if (!existingSymbols.has(symbol)) {
        const company = knownDefenseCompanies.find(c => c.symbol === symbol);
        if (company) {
          try {
            console.log(`🔍 Detecting new defense company: ${symbol} (${company.name})`);
            
            // Fetch current stock data from Yahoo Finance
            const stockData = await yahooFinanceService.getStockQuote(symbol);
            
            if (stockData) {
              const newStock: InsertStock = {
                symbol: symbol,
                name: company.name,
                sector: 'Defense',
                currentPrice: stockData.currentPrice,
                priceChange: stockData.priceChange,
                percentChange: stockData.percentChange,
                volume: stockData.volume || 0,
                marketCap: stockData.marketCap || 0,
                hasDefense: true,
                hasHealthcare: false,
                hasEnergy: false
              };

              await storage.createStock(newStock);
              console.log(`✅ Added new defense stock: ${symbol} at $${stockData.currentPrice}`);
            }
          } catch (error) {
            console.error(`❌ Error adding defense stock ${symbol}:`, error);
          }
        }
      }
    }
  }

  private async enhanceStockHighlights(highlights: any[], existingStocks: any[]): Promise<NewsStockHighlight[]> {
    const enhanced: NewsStockHighlight[] = [];
    
    for (const highlight of highlights) {
      const stockData = existingStocks.find(s => s.symbol === highlight.symbol);
      
      enhanced.push({
        symbol: highlight.symbol || '',
        companyName: highlight.companyName || stockData?.name || '',
        sector: highlight.sector || 'Defense',
        currentPrice: stockData?.currentPrice || 0,
        priceChange: highlight.priceChange || stockData?.percentChange || '0%',
        analysis: highlight.analysis || '',
        catalysts: highlight.catalysts || '',
        recentNews: highlight.recentNews || '',
        competitivePosition: highlight.competitivePosition || ''
      });
    }

    return enhanced;
  }

  private async enhanceConflictUpdates(updates: any[], existingConflicts: any[]): Promise<NewsConflictUpdate[]> {
    const enhanced: NewsConflictUpdate[] = [];
    
    for (const update of updates) {
      enhanced.push({
        conflictName: update.conflictName || '',
        region: update.region || '',
        status: update.status || '',
        severity: update.severity || 'medium',
        description: update.description || '',
        marketImpact: update.marketImpact || '',
        keyPlayers: update.keyPlayers || [],
        economicImpact: update.economicImpact || ''
      });
    }

    return enhanced;
  }

  async generatePerplexityDefenseIntelligenceBrief(): Promise<DailyNews | null> {
    if (this.isGenerating) {
      console.log("🛡️ Defense intelligence generation already in progress...");
      return null;
    }

    this.isGenerating = true;

    try {
      console.log("🔍 Generating fresh defense intelligence using Perplexity AI...");

      // Get current defense events from Perplexity API
      const currentEvents = await this.fetchCurrentDefenseEvents();
      
      // Get current conflicts and defense stocks for context
      const conflicts = await storage.getConflicts();
      const stocks = await storage.getStocks();
      const defenseStocks = stocks.filter(stock => stock.sector === 'Defense');
      const activeConflicts = conflicts.filter(c => c.status === "Active");

      const defenseStockSymbols = defenseStocks.map(s => `${s.symbol} (${s.name})`).join(', ');
      const conflictNames = activeConflicts.map(c => `${c.name} (${c.region})`).join(', ');

      if (!process.env.OPENAI_API_KEY) {
        console.warn("OPENAI_API_KEY not available, returning fallback defense intelligence");
        return this.generateFallbackDefenseIntelligence(currentEvents, activeConflicts, defenseStocks);
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a senior defense intelligence analyst creating comprehensive daily briefings for defense sector investors and security professionals. Your briefings must be:

1. FACTUAL and based on real current events
2. ANALYTICAL with strategic insights
3. MARKET-FOCUSED for defense sector investments
4. GEOPOLITICALLY AWARE of global security dynamics
5. PROFESSIONALLY WRITTEN for executive consumption

Current defense stocks being tracked: ${defenseStockSymbols}
Active global conflicts: ${conflictNames}

Create detailed analysis that connects current events to market implications and strategic considerations.`
          },
          {
            role: "user",
            content: `Based on these current defense and security developments:

${currentEvents}

Create a comprehensive Defense Intelligence Brief with these exact sections in JSON format:

{
  "title": "Defense Intelligence Brief - [Today's Date]",
  "summary": "2-3 detailed sentences providing executive summary of key developments with specific impact assessments",
  "keyDevelopments": [
    "Detailed bullet point 1 with specific companies, contract values, and market implications",
    "Detailed bullet point 2 with geopolitical analysis and defense contractor impacts",
    "Continue with 8-10 comprehensive bullet points covering all major developments"
  ],
  "conflictUpdates": [
    {
      "conflictName": "Specific conflict name",
      "region": "Geographic region",
      "status": "Current operational status",
      "severity": "high/medium/low",
      "description": "4-5 detailed sentences covering recent developments, military equipment usage, casualty reports, and strategic implications",
      "marketImpact": "2-3 sentences on specific defense contractor opportunities and market effects",
      "keyPlayers": ["Country1", "Country2", "Organization1"],
      "economicImpact": "Specific financial figures and market valuations affected"
    }
  ],
  "defenseStockHighlights": [
    {
      "symbol": "Company stock symbol",
      "companyName": "Full company name",
      "sector": "Specific defense subsector",
      "analysis": "4-5 detailed sentences covering recent performance, strategic position, competitive advantages, and market outlook",
      "catalysts": "Specific contracts, technological developments, or market drivers affecting stock performance",
      "recentNews": "Latest company-specific developments from the current events",
      "competitivePosition": "Analysis of market position relative to competitors"
    }
  ],
  "geopoliticalAnalysis": "3-4 detailed paragraphs analyzing: strategic implications of current conflicts and their evolution, alliance dynamics and international defense cooperation trends, policy implications for defense spending across major powers, regional security assessments and emerging threat vectors, economic warfare and sanctions impact on defense trade",
  "marketImpact": "3-4 comprehensive paragraphs covering: defense sector performance outlook with specific projections, investment opportunities and risk assessments by subsector, supply chain challenges and manufacturing capacity issues, long-term strategic considerations for defense investors, emerging markets and technological disruption impacts"
}

Requirements:
1. Include 6-8 defense companies in defenseStockHighlights with comprehensive analysis
2. Cover 5-7 major conflicts in conflictUpdates with detailed status
3. Each keyDevelopments bullet should be 2-3 sentences with specific details
4. Automatically detect and analyze any defense companies mentioned in current events
5. Include specific contract values, market capitalizations, and financial figures
6. Provide actionable intelligence for executive decision-making
7. Focus on factual analysis with strategic insights

Return ONLY the JSON object with no additional text.`
          }
        ],
        max_tokens: 3000,
        temperature: 0.4
      });

      const content = response.choices[0].message.content;
      if (!content) {
        console.error("❌ No content received from OpenAI for defense intelligence");
        return this.generateFallbackDefenseIntelligence(currentEvents, activeConflicts, defenseStocks);
      }

      console.log("🛡️ Successfully generated defense intelligence content");
      return await this.parseAndStoreDefenseIntelligence(content, activeConflicts, defenseStocks);

    } catch (error) {
      console.error("❌ Error generating defense intelligence brief:", error);
      const conflicts = await storage.getConflicts();
      const stocks = await storage.getStocks();
      const defenseStocks = stocks.filter(stock => stock.sector === 'Defense');
      const activeConflicts = conflicts.filter(c => c.status === "Active");
      return this.generateFallbackDefenseIntelligence([], activeConflicts, defenseStocks);
    } finally {
      this.isGenerating = false;
    }
  }

  private async parseAndStoreDefenseIntelligence(content: string, conflicts: any[], defenseStocks: any[]): Promise<DailyNews | null> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Parse the structured content
      const lines = content.split('\n');
      let title = `Defense Intelligence Brief - ${new Date().toLocaleDateString()}`;
      let summary = "";
      let keyDevelopments: string[] = [];
      let marketImpact = "";
      let geopoliticalAnalysis = "";

      let currentSection = "";
      let buildingText = "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.includes("TITLE:") || trimmedLine.includes("Defense Intelligence Brief")) {
          title = trimmedLine.replace(/TITLE:\s*/, '').replace(/"/g, '') || title;
        } else if (trimmedLine.includes("SUMMARY:")) {
          currentSection = "summary";
          buildingText = trimmedLine.replace(/SUMMARY:\s*/, '');
        } else if (trimmedLine.includes("KEY DEVELOPMENTS:")) {
          if (buildingText && currentSection === "summary") {
            summary = buildingText.trim();
          }
          currentSection = "developments";
          buildingText = "";
        } else if (trimmedLine.includes("MARKET IMPACT:")) {
          if (currentSection === "developments" && buildingText) {
            keyDevelopments = buildingText.split('\n')
              .filter(line => line.trim())
              .map(line => line.replace(/^[-•*]\s*/, '').trim())
              .filter(line => line.length > 0);
          }
          currentSection = "market";
          buildingText = trimmedLine.replace(/MARKET IMPACT:\s*/, '');
        } else if (trimmedLine.includes("GEOPOLITICAL ANALYSIS:")) {
          if (buildingText && currentSection === "market") {
            marketImpact = buildingText.trim();
          }
          currentSection = "geopolitical";
          buildingText = trimmedLine.replace(/GEOPOLITICAL ANALYSIS:\s*/, '');
        } else if (trimmedLine.includes("CONFLICT UPDATES:") || trimmedLine.includes("DEFENSE STOCK HIGHLIGHTS:")) {
          if (buildingText && currentSection === "geopolitical") {
            geopoliticalAnalysis = buildingText.trim();
          }
          currentSection = "other";
        } else if (trimmedLine && !trimmedLine.includes("TITLE:") && !trimmedLine.includes("SUMMARY:") && currentSection !== "other") {
          if (currentSection === "developments" && (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*'))) {
            if (buildingText) buildingText += '\n';
            buildingText += trimmedLine;
          } else {
            if (buildingText) buildingText += ' ';
            buildingText += trimmedLine;
          }
        }
      }

      // Handle final section
      if (buildingText) {
        if (currentSection === "summary") summary = buildingText.trim();
        else if (currentSection === "market") marketImpact = buildingText.trim();
        else if (currentSection === "geopolitical") geopoliticalAnalysis = buildingText.trim();
        else if (currentSection === "developments") {
          keyDevelopments = buildingText.split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^[-•*]\s*/, '').trim())
            .filter(line => line.length > 0);
        }
      }

      // Ensure we have content
      if (!summary) summary = "Today's defense intelligence covers ongoing global security developments and their impact on defense markets.";
      if (keyDevelopments.length === 0) {
        keyDevelopments = [
          `Monitoring ${conflicts.filter(c => c.status === "Active").length} active global conflicts`,
          "Defense contractors maintain steady performance amid geopolitical developments",
          "Global defense spending continues to reflect evolving security challenges",
          "Military technology advancement remains priority for major defense programs"
        ];
      }
      if (!marketImpact) marketImpact = "Defense markets show resilience amid global uncertainty, with major contractors benefiting from sustained government spending and international partnerships.";
      if (!geopoliticalAnalysis) geopoliticalAnalysis = "Current global security environment features multiple active conflicts requiring continued defense sector engagement and strategic preparedness.";

      // Generate conflict updates and defense stock highlights
      const conflictUpdates = conflicts.filter(c => c.status === "Active").slice(0, 5).map(conflict => ({
        conflict: conflict.name,
        update: `Situation in ${conflict.region} remains active with ongoing security operations`,
        severity: conflict.severity.toLowerCase() === "high" ? "high" as const : 
                 conflict.severity.toLowerCase() === "medium" ? "medium" as const : "low" as const
      }));

      const defenseStockHighlights = defenseStocks.slice(0, 6).map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        change: stock.change,
        changePercent: stock.changePercent,
        reason: `${stock.changePercent >= 0 ? 'Positive' : 'Negative'} market response to defense sector developments`
      }));

      const defenseIntelligence: DailyNews = {
        id: Math.floor(Math.random() * 1000000),
        date: today,
        createdAt: new Date(),
        title,
        summary,
        keyDevelopments,
        marketImpact,
        conflictUpdates,
        defenseStockHighlights,
        pharmaceuticalStockHighlights: [],
        geopoliticalAnalysis
      };

      // Store in database
      const insertData: InsertDailyNews = {
        date: today,
        title,
        summary,
        keyDevelopments,
        marketImpact,
        conflictUpdates,
        defenseStockHighlights,
        pharmaceuticalStockHighlights: [],
        geopoliticalAnalysis
      };

      await storage.createDailyNews(insertData);
      console.log("✅ Defense intelligence brief successfully stored in database");

      return defenseIntelligence;

    } catch (error) {
      console.error("❌ Error parsing and storing defense intelligence:", error);
      return null;
    }
  }

  private generateFallbackDefenseIntelligence(currentEvents: string | any[], conflicts: any[], defenseStocks: any[]): DailyNews {
    const today = new Date().toISOString().split('T')[0];
    const activeConflicts = conflicts.filter(c => c.status === "Active");

    return {
      id: Math.floor(Math.random() * 1000000),
      date: today,
      createdAt: new Date(),
      title: `Defense Intelligence Brief - ${new Date().toLocaleDateString()}`,
      summary: `Today's defense intelligence covers ${activeConflicts.length} active global conflicts and their impact on defense markets. Defense sector continues to respond to evolving geopolitical developments.`,
      keyDevelopments: [
        `Monitoring ${activeConflicts.length} active global conflicts affecting defense procurement`,
        "Defense contractors reporting steady order flow from international allies",
        "Geopolitical tensions driving increased defense spending across NATO members",
        "Advanced weapons systems development accelerating in response to evolving threats",
        "Regional security partnerships strengthening through joint defense initiatives",
        "Military modernization programs proceeding across multiple allied nations"
      ],
      marketImpact: "Defense markets demonstrate resilience amid global uncertainty, with major contractors benefiting from sustained government spending, international partnerships, and ongoing modernization programs. Current geopolitical environment supports continued investment in defense capabilities.",
      conflictUpdates: activeConflicts.slice(0, 5).map(conflict => ({
        conflict: conflict.name,
        update: `Situation in ${conflict.region} remains active with ongoing security operations and monitoring`,
        severity: conflict.severity.toLowerCase() === "high" ? "high" as const : 
                 conflict.severity.toLowerCase() === "medium" ? "medium" as const : "low" as const
      })),
      defenseStockHighlights: defenseStocks.slice(0, 6).map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        change: stock.change,
        changePercent: stock.changePercent,
        reason: `${stock.changePercent >= 0 ? 'Positive' : 'Negative'} market response to current defense sector developments and geopolitical environment`
      })),
      pharmaceuticalStockHighlights: [],
      geopoliticalAnalysis: `Current global security environment features ${activeConflicts.length} active conflicts requiring continued defense sector engagement. Regional tensions across Eastern Europe, Middle East, and Asia-Pacific are driving sustained demand for defense capabilities and international security cooperation. Defense spending remains prioritized across allied nations as security challenges continue to evolve.`
    };
  }

  async getTodaysDefenseNews(): Promise<DailyNews | null> {
    const today = new Date().toISOString().split('T')[0];
    
    // Try to get existing defense news from database
    let news = await storage.getDailyNews(today);
    
    // If no existing data, generate new defense intelligence
    if (!news) {
      console.log('🛡️ No existing defense intelligence found, generating fresh data...');
      news = await this.generatePerplexityDefenseIntelligenceBrief();
    }
    
    return news;
  }
}

export const defenseNewsService = new DefenseNewsService();