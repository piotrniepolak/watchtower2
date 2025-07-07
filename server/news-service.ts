import OpenAI from "openai";
import { storage } from "./storage";
import type { DailyNews, InsertDailyNews, NewsConflictUpdate, NewsStockHighlight } from "@shared/schema";

export class NewsService {
  private openai: OpenAI;
  private isGenerating = false;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY environment variable is missing - news generation will be limited");
    }
    if (!process.env.PERPLEXITY_API_KEY) {
      console.warn("PERPLEXITY_API_KEY environment variable is missing - current events fetching will be limited");
    }
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });
  }

  private async fetchCurrentEvents(): Promise<string> {
    try {
      if (!process.env.PERPLEXITY_API_KEY) {
        console.warn("PERPLEXITY_API_KEY not available, skipping current events fetch");
        return "Current events data unavailable - API key not configured";
      }

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a geopolitical intelligence analyst. Provide comprehensive, current information about global events, defense industry developments, and military affairs.'
            },
            {
              role: 'user',
              content: `Provide a comprehensive intelligence briefing for today's date (${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}). Include the most significant geopolitical developments, defense industry news, and military events from today and the past 24-48 hours. Cover: 1) Current conflict updates and regional tensions with specific details, 2) Defense contractor news, earnings, contracts, and market movements, 3) International diplomatic developments and policy announcements, 4) Military exercises, defense spending, and procurement decisions, 5) Technology developments in defense and security sectors. Focus on events from today and very recent developments that impact global security and defense markets. Provide specific dates, numbers, and verifiable details.`
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
      console.error('Error fetching current events for news:', error);
      return 'Unable to fetch current events. Using general geopolitical knowledge.';
    }
  }

  async generateDailyNews(date: string): Promise<DailyNews | null> {
    if (this.isGenerating) {
      console.log("News generation already in progress...");
      return null;
    }

    this.isGenerating = true;

    try {
      console.log(`Generating daily news for ${date}...`);

      // Check if news already exists for this date
      const existing = await storage.getDailyNews(date);
      if (existing) {
        console.log(`Daily news already exists for ${date}`);
        return existing;
      }

      // Get current events from Perplexity API first
      const currentEvents = await this.fetchCurrentEvents();
      
      // Get current conflicts and stocks for context
      const conflicts = await storage.getConflicts();
      const stocks = await storage.getStocks();

      const newsData = await this.generateNewsContent(conflicts, stocks, currentEvents);
      
      const insertData: InsertDailyNews = {
        date,
        ...newsData
      };

      const createdNews = await storage.createDailyNews(insertData);
      console.log(`Successfully created daily news for ${date}`);
      
      return createdNews;
    } catch (error) {
      console.error("Error generating daily news:", error);
      return null;
    } finally {
      this.isGenerating = false;
    }
  }

  private async generateNewsContent(conflicts: any[], stocks: any[], currentEvents: string) {
    const activeConflicts = conflicts.filter(c => c.status === "Active").slice(0, 8);
    const defenseStocks = stocks.slice(0, 10);

    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const prompt = `Generate a comprehensive daily intelligence briefing for a geopolitical defense intelligence platform. Today is ${currentDate}. Base your briefing on the CURRENT EVENTS provided below and focus on developments that impact defense contractors and global security markets.

CURRENT EVENTS DATA:
${currentEvents}

PLATFORM CONTEXT:
- Current active conflicts: ${activeConflicts.map(c => `${c.name} (${c.region})`).join(", ")}
- Major defense stocks: ${defenseStocks.map(s => `${s.symbol} (${s.name})`).join(", ")}

IMPORTANT: Base your briefing primarily on the current events data provided above. Ensure the content correlates with the same information used for daily quiz generation.

Generate a structured news briefing with:

1. TITLE: A compelling headline for today's briefing
2. SUMMARY: 2-3 sentence executive summary of key developments
3. KEY_DEVELOPMENTS: Array of 4-5 bullet points covering major geopolitical events, defense industry news, and security developments
4. MARKET_IMPACT: Analysis of how today's events affect defense markets and investor sentiment
5. CONFLICT_UPDATES: Array of specific updates for active conflicts with severity levels
6. DEFENSE_STOCK_HIGHLIGHTS: Array of notable stock movements with explanations
7. GEOPOLITICAL_ANALYSIS: Strategic analysis of broader implications

Return as JSON in this exact format:
{
  "title": "string",
  "summary": "string", 
  "keyDevelopments": ["string1", "string2", ...],
  "marketImpact": "string",
  "conflictUpdates": [
    {
      "conflict": "string",
      "update": "string", 
      "severity": "low|medium|high|critical"
    }
  ],
  "defenseStockHighlights": [
    {
      "symbol": "string",
      "name": "string",
      "change": number,
      "changePercent": number,
      "reason": "string"
    }
  ],
  "geopoliticalAnalysis": "string"
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a senior geopolitical intelligence analyst specializing in defense markets and global security. Provide factual, analytical content based on realistic scenarios and market dynamics."
          },
          {
            role: "user",
            content: `${prompt}

CRITICAL: Base all content on the current events data provided above. This briefing should correlate with quiz questions generated from the same source material. Focus on the specific defense contractor news, geopolitical developments, and market events mentioned in the current events data.

Make the briefing comprehensive but ensure all information is derived from the current events provided, not from general knowledge.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      const parsedContent = JSON.parse(content);
      
      // Validate the structure
      if (!parsedContent.title || !parsedContent.summary || !Array.isArray(parsedContent.keyDevelopments)) {
        throw new Error("Invalid response structure from OpenAI");
      }

      return parsedContent;
    } catch (error) {
      console.error("Error generating news content:", error);
      return this.getFallbackNews();
    }
  }

  private getFallbackNews() {
    const today = new Date();
    return {
      title: `Defense Intelligence Brief - ${today.toLocaleDateString()}`,
      summary: "Today's briefing covers ongoing geopolitical developments and their impact on global defense markets.",
      keyDevelopments: [
        "Continued monitoring of global conflict zones",
        "Defense sector maintains strategic positioning",
        "Market volatility reflects geopolitical tensions",
        "Technology advances in defense capabilities"
      ],
      marketImpact: "Defense markets show mixed signals as investors weigh geopolitical risks against sector fundamentals.",
      conflictUpdates: [
        {
          conflict: "Eastern Europe",
          update: "Situation remains dynamic with ongoing developments",
          severity: "medium" as const
        }
      ],
      defenseStockHighlights: [
        {
          symbol: "LMT",
          name: "Lockheed Martin",
          change: 0,
          changePercent: 0,
          reason: "Stable performance amid market uncertainty"
        }
      ],
      geopoliticalAnalysis: "Global security environment continues to evolve, requiring ongoing strategic assessment and market analysis."
    };
  }

  async getTodaysNews(): Promise<DailyNews | null> {
    const today = this.getTodayDateET();
    const news = await storage.getDailyNews(today);
    return news || null;
  }

  private getTodayDateET(): string {
    const now = new Date();
    const etTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const year = etTime.getFullYear();
    const month = String(etTime.getMonth() + 1).padStart(2, '0');
    const day = String(etTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  startDailyNewsScheduler(): void {
    console.log("Daily news scheduler started");
    
    // Generate today's news immediately
    const today = this.getTodayDateET();
    this.generateDailyNews(today);
    
    // Schedule daily generation at midnight ET
    const scheduleNext = () => {
      const now = new Date();
      const etTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const tomorrow = new Date(etTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 1, 0, 0); // 12:01 AM ET
      
      const msUntilTomorrow = tomorrow.getTime() - etTime.getTime();
      
      setTimeout(() => {
        const dateStr = this.getTodayDateET();
        this.generateDailyNews(dateStr);
        scheduleNext(); // Schedule the next day
      }, msUntilTomorrow);
    };
    
    scheduleNext();
  }
}

export const newsService = new NewsService();