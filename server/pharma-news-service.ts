import OpenAI from "openai";
import { storage } from "./storage";
import type { DailyNews, InsertDailyNews, NewsConflictUpdate, NewsStockHighlight } from "@shared/schema";

export class PharmaNewsService {
  private openai: OpenAI;
  private isGenerating = false;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY environment variable is missing - pharma news generation will be limited");
    }
    if (!process.env.PERPLEXITY_API_KEY) {
      console.warn("PERPLEXITY_API_KEY environment variable is missing - current healthcare events fetching will be limited");
    }
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });
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
      return null;
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
      return null;
    } finally {
      this.isGenerating = false;
    }
  }

  private async generatePharmaNewsContent(stocks: any[], currentEvents: string): Promise<Omit<DailyNews, 'id' | 'date' | 'createdAt'>> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return this.getFallbackPharmaContent();
      }

      const stockList = stocks.map(s => `${s.symbol} (${s.name})`).join(', ');

      const prompt = `You are an expert pharmaceutical intelligence analyst. Based on the following current healthcare events and pharmaceutical stock data, generate a comprehensive daily intelligence brief.

Current Healthcare Events:
${currentEvents}

Healthcare Stocks Being Monitored:
${stockList}

Generate a pharmaceutical intelligence briefing with the following structure:

1. TITLE: A compelling headline for today's pharmaceutical briefing
2. SUMMARY: 2-3 sentence executive summary of key healthcare developments
3. KEY_DEVELOPMENTS: Array of 4-5 bullet points covering major healthcare events, pharmaceutical industry news, and medical developments
4. MARKET_IMPACT: Analysis of how today's events affect pharmaceutical markets and investor sentiment
5. HEALTH_CRISIS_UPDATES: Array of specific updates for current health emergencies, disease outbreaks, or public health developments with severity levels
6. PHARMA_STOCK_HIGHLIGHTS: Array of notable pharmaceutical stock movements with explanations
7. REGULATORY_ANALYSIS: Strategic analysis of broader healthcare policy and regulatory implications

Return as JSON in this exact format:
{
  "title": "string",
  "summary": "string", 
  "keyDevelopments": ["string1", "string2", ...],
  "marketImpact": "string",
  "conflictUpdates": [
    {
      "conflict": "string (health crisis name)",
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
  "geopoliticalAnalysis": "string (regulatory and policy analysis)"
}

Focus on:
- Disease outbreaks and public health emergencies
- FDA drug approvals and regulatory decisions
- Clinical trial results and medical breakthroughs
- Pharmaceutical company earnings and mergers
- Healthcare policy changes and their market impact
- Global health initiatives and vaccination programs
- Biotechnology innovations and research developments

Make all content specific to healthcare and pharmaceuticals - no military or defense references.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content generated from OpenAI");
      }

      const parsed = JSON.parse(content);
      
      return {
        title: parsed.title,
        summary: parsed.summary,
        keyDevelopments: parsed.keyDevelopments,
        marketImpact: parsed.marketImpact,
        conflictUpdates: parsed.conflictUpdates || [],
        defenseStockHighlights: parsed.defenseStockHighlights || [],
        geopoliticalAnalysis: parsed.geopoliticalAnalysis
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
      defenseStockHighlights: [
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

  async getTodaysPharmaNews(): Promise<DailyNews | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.generateDailyPharmaNews(today);
  }
}

export const pharmaNewsService = new PharmaNewsService();