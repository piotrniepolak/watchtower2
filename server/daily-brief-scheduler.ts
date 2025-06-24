import { FourStepIntelligenceService } from "./four-step-intelligence-service";

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
        
        console.log(`✅ Successfully generated ${sector} brief with ${intelligenceBrief?.keyDevelopments?.length || 0} developments`);
        
      } catch (error) {
        console.error(`❌ Failed to generate ${sector} brief:`, error);
      }
    }
    
    // Schedule next generation
    this.scheduleNextGeneration();
  }

  public async getCachedBrief(sector: string): Promise<any | null> {
    // For now, return null to force fresh generation
    // TODO: Implement proper database caching after schema is stable
    console.log(`🔄 No cached brief available for ${sector}, will generate fresh`);
    return null;
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
    
    return intelligenceBrief;
  }

  public cleanup() {
    if (this.scheduledGeneration) {
      clearTimeout(this.scheduledGeneration);
      this.scheduledGeneration = null;
    }
  }
}

export const dailyBriefScheduler = new DailyBriefScheduler();