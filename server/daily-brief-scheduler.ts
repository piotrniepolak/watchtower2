import { db } from './db';
import { dailyIntelligenceBriefs } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { FourStepIntelligenceService } from './four-step-intelligence-service';

export class DailyBriefScheduler {
  private fourStepService: FourStepIntelligenceService;
  private scheduledGeneration: NodeJS.Timeout | null = null;

  constructor() {
    this.fourStepService = new FourStepIntelligenceService();
    this.scheduleNextGeneration();
  }

  private scheduleNextGeneration() {
    const now = new Date();
    const nextMidnight = new Date();
    
    // Set to next 24:00 ET (midnight ET)
    nextMidnight.setUTCHours(5, 0, 0, 0); // 24:00 ET = 05:00 UTC (EST) or 04:00 UTC (EDT)
    
    // If it's past midnight today, schedule for tomorrow
    if (now >= nextMidnight) {
      nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
    }
    
    const timeUntilMidnight = nextMidnight.getTime() - now.getTime();
    
    console.log(`📅 Scheduling next daily brief generation in ${Math.round(timeUntilMidnight / (1000 * 60))} minutes at ${nextMidnight.toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`);
    
    this.scheduledGeneration = setTimeout(() => {
      this.generateDailyBriefs();
    }, timeUntilMidnight);
  }

  private async generateDailyBriefs() {
    console.log(`🌅 Starting daily brief generation at ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`);
    
    const sectors = ['defense', 'pharmaceutical', 'energy'];
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    for (const sector of sectors) {
      try {
        console.log(`🔄 Generating ${sector} brief for ${today}...`);
        
        // Generate fresh intelligence brief
        const intelligenceBrief = await this.fourStepService.generateIntelligenceBrief(sector);
        
        // Store in database (upsert - replace if exists)
        await db.insert(dailyIntelligenceBriefs)
          .values({
            sector,
            date: today,
            executiveSummary: intelligenceBrief.executiveSummary,
            keyDevelopments: intelligenceBrief.keyDevelopments,
            marketImpactAnalysis: intelligenceBrief.marketImpactAnalysis,
            geopoliticalAnalysis: intelligenceBrief.geopoliticalAnalysis,
            sources: intelligenceBrief.sources,
            sourceUtilization: intelligenceBrief.sourceUtilization || {},
            articlesExtracted: intelligenceBrief.articlesExtracted || 0,
            generatedAt: new Date(),
            isValid: true
          })
          .onConflictDoUpdate({
            target: [dailyIntelligenceBriefs.sector, dailyIntelligenceBriefs.date],
            set: {
              executiveSummary: intelligenceBrief.executiveSummary,
              keyDevelopments: intelligenceBrief.keyDevelopments,
              marketImpactAnalysis: intelligenceBrief.marketImpactAnalysis,
              geopoliticalAnalysis: intelligenceBrief.geopoliticalAnalysis,
              sources: intelligenceBrief.sources,
              sourceUtilization: intelligenceBrief.sourceUtilization || {},
              articlesExtracted: intelligenceBrief.articlesExtracted || 0,
              generatedAt: new Date(),
              isValid: true
            }
          });
        
        console.log(`✅ ${sector} brief generated and stored successfully`);
        
        // Add delay between sectors to avoid API rate limits
        await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute delay
        
      } catch (error) {
        console.error(`❌ Failed to generate ${sector} brief:`, error);
        
        // Mark as invalid if generation fails
        await db.insert(dailyIntelligenceBriefs)
          .values({
            sector,
            date: today,
            executiveSummary: '',
            keyDevelopments: [],
            marketImpactAnalysis: '',
            geopoliticalAnalysis: '',
            sources: [],
            sourceUtilization: {},
            articlesExtracted: 0,
            generatedAt: new Date(),
            isValid: false
          })
          .onConflictDoUpdate({
            target: [dailyIntelligenceBriefs.sector, dailyIntelligenceBriefs.date],
            set: {
              isValid: false,
              generatedAt: new Date()
            }
          });
      }
    }
    
    console.log(`🎯 Daily brief generation completed at ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`);
    
    // Schedule next generation
    this.scheduleNextGeneration();
  }

  public async getCachedBrief(sector: string): Promise<any | null> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const [cachedBrief] = await db
        .select()
        .from(dailyIntelligenceBriefs)
        .where(
          and(
            eq(dailyIntelligenceBriefs.sector, sector),
            eq(dailyIntelligenceBriefs.date, today),
            eq(dailyIntelligenceBriefs.isValid, true)
          )
        )
        .limit(1);
      
      if (cachedBrief) {
        console.log(`📋 Serving cached ${sector} brief for ${today}`);
        return {
          executiveSummary: cachedBrief.executiveSummary,
          keyDevelopments: cachedBrief.keyDevelopments,
          marketImpactAnalysis: cachedBrief.marketImpactAnalysis,
          geopoliticalAnalysis: cachedBrief.geopoliticalAnalysis,
          sources: cachedBrief.sources,
          sourceUtilization: cachedBrief.sourceUtilization,
          articlesExtracted: cachedBrief.articlesExtracted,
          generatedAt: cachedBrief.generatedAt.toISOString()
        };
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error fetching cached brief for ${sector}:`, error);
      return null;
    }
  }

  public async generateBriefIfMissing(sector: string): Promise<any> {
    // Check if we have a cached brief first
    const cached = await this.getCachedBrief(sector);
    if (cached) {
      return cached;
    }
    
    console.log(`🔄 No cached brief found for ${sector}, generating fresh brief...`);
    
    // Generate fresh brief and cache it
    const intelligenceBrief = await this.fourStepService.generateIntelligenceBrief(sector);
    const today = new Date().toISOString().split('T')[0];
    
    // Store in database
    await db.insert(dailyIntelligenceBriefs)
      .values({
        sector,
        date: today,
        executiveSummary: intelligenceBrief.executiveSummary,
        keyDevelopments: intelligenceBrief.keyDevelopments,
        marketImpactAnalysis: intelligenceBrief.marketImpactAnalysis,
        geopoliticalAnalysis: intelligenceBrief.geopoliticalAnalysis,
        sources: intelligenceBrief.sources,
        sourceUtilization: intelligenceBrief.sourceUtilization || {},
        articlesExtracted: intelligenceBrief.articlesExtracted || 0,
        generatedAt: new Date(),
        isValid: true
      })
      .onConflictDoUpdate({
        target: [dailyIntelligenceBriefs.sector, dailyIntelligenceBriefs.date],
        set: {
          executiveSummary: intelligenceBrief.executiveSummary,
          keyDevelopments: intelligenceBrief.keyDevelopments,
          marketImpactAnalysis: intelligenceBrief.marketImpactAnalysis,
          geopoliticalAnalysis: intelligenceBrief.geopoliticalAnalysis,
          sources: intelligenceBrief.sources,
          sourceUtilization: intelligenceBrief.sourceUtilization || {},
          articlesExtracted: intelligenceBrief.articlesExtracted || 0,
          generatedAt: new Date(),
          isValid: true
        }
      });
    
    return intelligenceBrief;
  }

  public cleanup() {
    if (this.scheduledGeneration) {
      clearTimeout(this.scheduledGeneration);
      this.scheduledGeneration = null;
    }
  }
}

// Singleton instance
export const dailyBriefScheduler = new DailyBriefScheduler();