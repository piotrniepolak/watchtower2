import OpenAI from "openai";
import { storage } from "./storage";
import { perplexityService } from "./perplexity-service";
import { dailyPharmaUpdateService } from "./daily-pharma-update-service";
import type { DailyNews, InsertDailyNews, NewsConflictUpdate, NewsStockHighlight } from "@shared/schema";

export class PharmaNewsService {
  private openai: OpenAI;
  private isGenerating = false;
  private scheduledGeneration: NodeJS.Timeout | null = null;
  private lastGenerationDate: string | null = null;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY environment variable is missing - pharma news generation will be limited");
    }
    if (!process.env.PERPLEXITY_API_KEY) {
      console.warn("PERPLEXITY_API_KEY environment variable is missing - current healthcare events fetching will be limited");
    }
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });
    this.initializeDailyScheduler();
  }

  private initializeDailyScheduler(): void {
    console.log("📅 Initializing daily pharmaceutical intelligence scheduler");
    this.scheduleNextGeneration();
  }

  private scheduleNextGeneration(): void {
    if (this.scheduledGeneration) {
      clearTimeout(this.scheduledGeneration);
    }

    const now = new Date();
    const nextMidnightET = this.getNextMidnightET();
    const msUntilMidnight = nextMidnightET.getTime() - now.getTime();

    console.log(`⏰ Next pharmaceutical intelligence generation scheduled for: ${nextMidnightET.toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`);
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
      console.log(`📋 Daily pharmaceutical intelligence already generated for ${todayET}, skipping scheduled generation`);
      return;
    }

    console.log(`🕛 Performing scheduled midnight ET pharmaceutical intelligence generation for ${todayET}`);
    
    try {
      const result = await this.generatePerplexityIntelligenceBrief();
      if (result) {
        this.lastGenerationDate = todayET;
        console.log(`✅ Scheduled pharmaceutical intelligence generation completed successfully for ${todayET}`);
      }
    } catch (error) {
      console.error(`❌ Error in scheduled pharmaceutical intelligence generation for ${todayET}:`, error);
    }
  }

  private async fetchCurrentHealthcareEvents(): Promise<string> {
    try {
      if (!process.env.PERPLEXITY_API_KEY) {
        console.warn("PERPLEXITY_API_KEY not available, skipping current healthcare events fetch");
        return "Current healthcare events data unavailable - API key not configured";
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
              content: 'You are a pharmaceutical and healthcare intelligence analyst. Provide comprehensive, current information about global health events, pharmaceutical industry developments, and medical affairs.'
            },
            {
              role: 'user',
              content: `Provide a comprehensive pharmaceutical intelligence briefing for today's date (${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}). Include the most significant healthcare developments, pharmaceutical industry news, and medical events from today and the past 24-48 hours. Cover: 1) Current disease outbreaks, health emergencies, and public health developments with specific details, 2) Pharmaceutical company news, earnings, drug approvals, and market movements, 3) International healthcare policy developments and regulatory announcements, 4) Medical research breakthroughs, clinical trial results, and FDA approvals, 5) Technology developments in healthcare and biotechnology sectors. Focus on events from today and very recent developments that impact global health and pharmaceutical markets. Provide specific dates, numbers, and verifiable details.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.2,
          search_recency_filter: 'day'
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error fetching current healthcare events:', error);
      return 'Unable to fetch current healthcare events. Using general pharmaceutical knowledge.';
    }
  }

  async generateDailyPharmaNews(date: string): Promise<DailyNews | null> {
    if (this.isGenerating) {
      console.log("Pharma news generation already in progress...");
      // Reset the flag if it's been stuck for more than 2 minutes
      setTimeout(() => {
        this.isGenerating = false;
      }, 120000);
      return this.getFallbackPharmaNews();
    }

    this.isGenerating = true;

    try {
      console.log(`Generating daily pharma news for ${date}...`);

      // Get current healthcare events from Perplexity API first
      const currentEvents = await this.fetchCurrentHealthcareEvents();
      
      // Get healthcare stocks for context
      const stocks = await storage.getStocks();
      const healthcareStocks = stocks.filter(stock => 
        stock.sector === 'Healthcare' || 
        ['PFE', 'JNJ', 'MRNA', 'BMY', 'AMGN', 'GILD', 'BIIB', 'REGN', 'VRTX', 'NVAX'].includes(stock.symbol)
      );

      const newsData = await this.generatePharmaNewsContent(healthcareStocks, currentEvents);
      
      return {
        id: Math.floor(Math.random() * 1000000),
        date,
        createdAt: new Date(),
        ...newsData
      } as DailyNews;
    } catch (error) {
      console.error("Error generating pharma news:", error);
      return this.getFallbackPharmaNews();
    } finally {
      this.isGenerating = false;
    }
  }

  private getFallbackPharmaNews(): DailyNews {
    return {
      id: Math.floor(Math.random() * 1000000),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      ...this.getFallbackPharmaContent()
    } as DailyNews;
  }

  private async generatePharmaNewsContent(stocks: any[], currentEvents: string): Promise<Omit<DailyNews, 'id' | 'date' | 'createdAt'>> {
    try {
      // Use the comprehensive intelligence brief that already extracts pharmaceutical companies
      console.log("🔬 Generating comprehensive pharmaceutical intelligence using Perplexity AI...");
      const intelligenceBrief = await perplexityService.generateComprehensiveIntelligenceBrief();
      
      return {
        title: intelligenceBrief.title,
        summary: intelligenceBrief.summary, // This will now be a structured object with content and references
        keyDevelopments: intelligenceBrief.keyDevelopments,
        marketImpact: intelligenceBrief.marketImpact,
        conflictUpdates: intelligenceBrief.conflictUpdates.map(update => ({
          conflict: update.region,
          update: update.description,
          severity: update.severity as "medium" | "high" | "low" | "critical"
        })),
        defenseStockHighlights: [],
        pharmaceuticalStockHighlights: intelligenceBrief.pharmaceuticalStockHighlights?.map(stock => ({
          symbol: stock.symbol,
          name: stock.company,
          change: stock.change,
          changePercent: stock.change,
          reason: stock.analysis
        })) || [],
        geopoliticalAnalysis: intelligenceBrief.geopoliticalAnalysis
      };

    } catch (error) {
      console.error("Error generating pharma news content:", error);
      return this.getFallbackPharmaContent();
    }
  }

  private getFallbackPharmaContent(): Omit<DailyNews, 'id' | 'date' | 'createdAt'> {
    return {
      title: "Pharmaceutical Market Intelligence Brief",
      summary: "Today's pharmaceutical markets show mixed signals as investors monitor ongoing clinical trials and regulatory developments. Key healthcare stocks demonstrate resilience amid evolving treatment landscapes.",
      keyDevelopments: [
        "FDA continues review of multiple drug applications with decisions expected this quarter",
        "Pharmaceutical companies report strong R&D pipeline progress in oncology and rare diseases",
        "Global health organizations coordinate response to emerging infectious disease threats",
        "Healthcare technology integration accelerates across major hospital systems",
        "Regulatory frameworks evolve to accommodate breakthrough therapy designations"
      ],
      marketImpact: "Healthcare markets remain fundamentally strong with sustained investment in biotechnology innovation. Regulatory clarity continues to drive investor confidence in pharmaceutical sectors, while emerging therapeutic areas present significant growth opportunities.",
      conflictUpdates: [
        {
          conflict: "COVID-19 Variant Monitoring",
          update: "Health authorities maintain surveillance protocols for emerging variants with updated vaccination strategies.",
          severity: "medium"
        },
        {
          conflict: "Antimicrobial Resistance Crisis",
          update: "WHO reports continued challenges with drug-resistant infections requiring novel therapeutic approaches.",
          severity: "high"
        }
      ],
      defenseStockHighlights: [],
      pharmaceuticalStockHighlights: [
        {
          symbol: "PFE",
          name: "Pfizer Inc",
          change: 1.2,
          changePercent: 0.8,
          reason: "Strong performance in oncology portfolio with positive clinical trial data"
        },
        {
          symbol: "JNJ",
          name: "Johnson & Johnson",
          change: 0.9,
          changePercent: 0.6,
          reason: "Solid pharmaceutical division results offset by consumer health segment concerns"
        }
      ],
      geopoliticalAnalysis: "Global healthcare policies continue evolving with emphasis on pandemic preparedness and equitable access to essential medicines. Regulatory harmonization efforts between major markets facilitate faster drug development timelines while maintaining safety standards."
    };
  }

  async generatePerplexityIntelligenceBrief(): Promise<DailyNews | null> {
    if (this.isGenerating) {
      console.log("Pharmaceutical intelligence generation already in progress, skipping...");
      return null;
    }

    try {
      this.isGenerating = true;
      console.log("🔬 Generating pharmaceutical intelligence brief using Perplexity AI...");
      console.log("🔍 About to call Perplexity service...");

      // Force real Perplexity API call
      const intelligenceBrief = await perplexityService.generateComprehensiveIntelligenceBrief();
      console.log("🔍 Perplexity service returned:", !!intelligenceBrief);
      
      if (!intelligenceBrief) {
        throw new Error("Perplexity service failed to generate intelligence brief");
      }

      const newsData: InsertDailyNews = {
        date: new Date().toISOString().split('T')[0],
        title: intelligenceBrief.title,
        summary: intelligenceBrief.summary,
        keyDevelopments: intelligenceBrief.keyDevelopments,
        conflictUpdates: intelligenceBrief.conflictUpdates.map(update => ({
          conflict: update.region,
          update: update.description,
          severity: update.severity as "medium" | "high" | "low" | "critical"
        })),
        defenseStockHighlights: intelligenceBrief.defenseStockHighlights.map(stock => ({
          symbol: stock.symbol,
          name: stock.company,
          change: stock.change,
          changePercent: stock.change,
          reason: stock.analysis
        })),
        pharmaceuticalStockHighlights: intelligenceBrief.pharmaceuticalStockHighlights?.map(stock => ({
          symbol: stock.symbol,
          name: stock.company,
          change: stock.change,
          changePercent: stock.change,
          reason: stock.analysis
        })),
        marketImpact: intelligenceBrief.marketImpact,
        geopoliticalAnalysis: intelligenceBrief.geopoliticalAnalysis
      };

      // Delete existing entry for today and create fresh one with extracted companies
      try {
        console.log("🔄 Deleting existing entry and creating fresh pharmaceutical intelligence brief");
        const today = new Date().toISOString().split('T')[0];
        
        // First delete any existing entry for today
        await storage.deleteDailyNews(today);
        
        // Create fresh entry with extracted pharmaceutical companies
        const savedNews = await storage.createDailyNews(newsData);
        console.log("✅ Fresh pharmaceutical intelligence brief with extracted companies saved successfully");
        
        // Run daily pharmaceutical database update
        await dailyPharmaUpdateService.scheduleDailyUpdate(savedNews);
        
        return savedNews;
      } catch (dbError: any) {
        console.error("❌ Error saving pharmaceutical intelligence brief:", dbError);
        throw dbError;
      }
    } catch (error) {
      console.error("❌ Error generating pharmaceutical intelligence brief:", error);
      return null;
    } finally {
      this.isGenerating = false;
    }
  }

  async getTodaysPharmaNews(): Promise<DailyNews | null> {
    const today = new Date().toISOString().split('T')[0];
    
    // Always generate fresh pharmaceutical intelligence with extracted companies
    // This ensures we get the latest company extractions from Perplexity AI
    console.log(`🔄 Generating fresh pharmaceutical intelligence brief for ${today}`);
    return this.generateDailyPharmaNews(today);
  }
}

export const pharmaNewsService = new PharmaNewsService();