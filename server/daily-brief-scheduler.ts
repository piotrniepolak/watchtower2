import { FourStepIntelligenceService } from "./four-step-intelligence-service";
import { pool } from "./db";

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
        
        // Generate fresh intelligence brief using correct methods
        let intelligenceBrief;
        if (sector === 'defense') {
          intelligenceBrief = await this.fourStepService.generateDefenseIntelligence();
        } else if (sector === 'pharmaceutical') {
          intelligenceBrief = await this.fourStepService.generatePharmaceuticalIntelligence();
        } else if (sector === 'energy') {
          intelligenceBrief = await this.fourStepService.generateEnergyIntelligence();
        }
        
        // Cache the generated brief
        if (intelligenceBrief) {
          await this.cacheBrief(sector, intelligenceBrief);
        }
        
        console.log(`✅ Successfully generated ${sector} brief with ${intelligenceBrief?.keyDevelopments?.length || 0} developments`);
        
      } catch (error) {
        console.error(`❌ Failed to generate ${sector} brief:`, error);
      }
    }
    
    // Schedule next generation
    this.scheduleNextGeneration();
  }

  public async getCachedBrief(sector: string): Promise<any | null> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const result = await pool.query(
        `SELECT * FROM daily_intelligence_briefs 
         WHERE sector = $1 AND date = $2 
         ORDER BY createdat DESC 
         LIMIT 1`,
        [sector, today]
      );
      
      if (result.rows && result.rows.length > 0) {
        const brief = result.rows[0];
        console.log(`✅ Found cached ${sector} brief from ${brief.date}`);
        
        // Parse JSON fields properly
        const extractedArticles = Array.isArray(brief.extractedarticles) 
          ? brief.extractedarticles 
          : (typeof brief.extractedarticles === 'string' 
              ? JSON.parse(brief.extractedarticles || '[]') 
              : []);
        
        const sourceUrls = Array.isArray(brief.sourceurls) 
          ? brief.sourceurls 
          : (typeof brief.sourceurls === 'string' 
              ? JSON.parse(brief.sourceurls || '[]') 
              : []);
        
        const keyDevelopments = Array.isArray(brief.keydevelopments) 
          ? brief.keydevelopments 
          : (typeof brief.keydevelopments === 'string' 
              ? JSON.parse(brief.keydevelopments || '[]') 
              : []);

        return {
          id: brief.id,
          date: brief.date,
          title: brief.title,
          executiveSummary: brief.executivesummary || brief.summary,
          keyDevelopments: keyDevelopments,
          marketImpactAnalysis: brief.marketimpact || brief.marketimpactanalysis,
          geopoliticalAnalysis: brief.geopoliticalanalysis,
          sourcesSection: brief.sourcessection,
          extractedArticles: extractedArticles,
          sourceUrls: sourceUrls,
          articleCount: extractedArticles.length, // Calculate from actual array
          methodologyUsed: brief.methodologyused || 'four-step-authentic-extraction'
        };
      }
      
      console.log(`🔄 No cached brief available for ${sector}, will generate fresh`);
      return null;
    } catch (error) {
      console.error(`❌ Error fetching cached brief for ${sector}:`, error);
      return null;
    }
  }

  public async generateBriefIfMissing(sector: string): Promise<any> {
    const cachedBrief = await this.getCachedBrief(sector);
    
    if (cachedBrief) {
      console.log(`✅ Using cached ${sector} brief`);
      return cachedBrief;
    }
    
    console.log(`🔄 No cached brief found for ${sector}, generating fresh brief...`);
    
    // Generate fresh brief using correct method
    let intelligenceBrief;
    if (sector === 'defense') {
      intelligenceBrief = await this.fourStepService.generateDefenseIntelligence();
    } else if (sector === 'pharmaceutical') {
      intelligenceBrief = await this.fourStepService.generatePharmaceuticalIntelligence();
    } else if (sector === 'energy') {
      intelligenceBrief = await this.fourStepService.generateEnergyIntelligence();
    } else {
      throw new Error(`Unsupported sector: ${sector}`);
    }
    
    console.log(`✅ Generated fresh ${sector} intelligence brief`);
    
    // Cache the newly generated brief
    if (intelligenceBrief) {
      await this.cacheBrief(sector, intelligenceBrief);
    }
    
    return intelligenceBrief;
  }

  private async cacheBrief(sector: string, brief: any): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await pool.query(
        `INSERT INTO daily_intelligence_briefs 
         (sector, date, title, executivesummary, keydevelopments, marketimpact, geopoliticalanalysis, sourcessection, extractedarticles, sourceurls, articlecount, methodologyused)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (sector, date) 
         DO UPDATE SET 
           title = EXCLUDED.title,
           executivesummary = EXCLUDED.executivesummary,
           keydevelopments = EXCLUDED.keydevelopments,
           marketimpact = EXCLUDED.marketimpact,
           geopoliticalanalysis = EXCLUDED.geopoliticalanalysis,
           sourcessection = EXCLUDED.sourcessection,
           extractedarticles = EXCLUDED.extractedarticles,
           sourceurls = EXCLUDED.sourceurls,
           articlecount = EXCLUDED.articlecount,
           methodologyused = EXCLUDED.methodologyused,
           createdat = CURRENT_TIMESTAMP`,
        [
          sector,
          today,
          brief.title || `${sector} Intelligence Brief - ${today}`,
          brief.summary || brief.executiveSummary || '',
          JSON.stringify(brief.keyDevelopments || []),
          brief.marketImpact || brief.marketImpactAnalysis || '',
          brief.geopoliticalAnalysis || '',
          brief.sourcesSection || '',
          JSON.stringify(brief.extractedArticles || []),
          JSON.stringify(brief.sourceUrls || []),
          brief.extractedArticles?.length || 0,
          brief.methodologyUsed || 'four-step-authentic-extraction'
        ]
      );
      
      console.log(`💾 Cached ${sector} brief for ${today}`);
    } catch (error) {
      console.error(`❌ Error caching brief for ${sector}:`, error);
    }
  }

  public cleanup() {
    if (this.scheduledGeneration) {
      clearTimeout(this.scheduledGeneration);
      this.scheduledGeneration = null;
    }
  }
}

export const dailyBriefScheduler = new DailyBriefScheduler();