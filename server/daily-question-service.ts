import { storage } from "./storage";
import { perplexityService } from "./perplexity-service";
import { InsertDailyQuestion, InsertDiscussion } from "@shared/schema";

export class DailyQuestionService {
  private isGenerating = false;
  private scheduledTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.scheduleNextGeneration();
  }

  private scheduleNextGeneration() {
    // Calculate time until next 00:00 AM ET
    const now = new Date();
    const etOffset = -5 * 60 * 60 * 1000; // EST offset in milliseconds
    const nowET = new Date(now.getTime() + etOffset);
    
    const nextMidnight = new Date(nowET);
    nextMidnight.setHours(24, 0, 0, 0); // Next midnight ET
    
    const msUntilMidnight = nextMidnight.getTime() - nowET.getTime();
    
    console.log(`📅 Scheduling next daily question generation in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);
    
    this.scheduledTimer = setTimeout(() => {
      this.generateDailyQuestions();
      this.scheduleNextGeneration(); // Schedule next day
    }, msUntilMidnight);
  }

  async generateDailyQuestions() {
    if (this.isGenerating) {
      console.log("⏳ Daily question generation already in progress, skipping...");
      return;
    }

    this.isGenerating = true;
    console.log("🤖 Starting automated daily question generation for all sectors...");

    const sectors = ['defense', 'healthcare', 'energy'];
    const today = new Date().toISOString().split('T')[0];

    try {
      for (const sector of sectors) {
        await this.generateSectorQuestion(sector, today);
      }
      console.log("✅ All daily questions generated successfully");
    } catch (error) {
      console.error("❌ Error generating daily questions:", error);
    } finally {
      this.isGenerating = false;
    }
  }

  private async generateSectorQuestion(sector: string, date: string) {
    try {
      // Check if question already exists for today
      const existingQuestion = await storage.getDailyQuestion(sector, date);
      if (existingQuestion) {
        console.log(`📋 Daily question for ${sector} already exists for ${date}`);
        return;
      }

      console.log(`🔄 Generating daily question for ${sector} sector...`);

      // Generate question using Perplexity AI
      const questionData = await this.generateQuestionWithPerplexity(sector);
      
      // Create discussion thread first
      const discussion = await storage.createDiscussion({
        title: `Daily Discussion: ${questionData.title}`,
        content: questionData.question,
        category: sector,
        tags: ['daily-question', sector, 'automated'],
        authorId: null // System-generated
      });

      // Create daily question record
      const dailyQuestion: InsertDailyQuestion = {
        sector,
        question: questionData.question,
        context: questionData.context,
        generatedDate: date,
        discussionId: discussion.id,
        isActive: true
      };

      await storage.createDailyQuestion(dailyQuestion);
      
      console.log(`✅ Generated daily question for ${sector}: "${questionData.title}"`);
    } catch (error) {
      console.error(`❌ Failed to generate question for ${sector}:`, error);
    }
  }

  private async generateQuestionWithPerplexity(sector: string): Promise<{
    title: string;
    question: string;
    context: string;
  }> {
    const sectorPrompts = {
      defense: `Generate a thought-provoking discussion question about current defense and military affairs. 
        Focus on topics like defense spending, military technology, geopolitical tensions, defense contracts, 
        or strategic military developments. The question should encourage substantive discussion about real current events.
        
        Format your response as JSON with these fields:
        - title: A brief title for the discussion (max 60 characters)
        - question: The main discussion question (should be open-ended and thought-provoking)
        - context: 2-3 sentences providing relevant background context`,

      healthcare: `Generate a thought-provoking discussion question about current healthcare and pharmaceutical affairs.
        Focus on topics like drug development, healthcare policy, pharmaceutical regulations, medical breakthroughs,
        public health challenges, or healthcare economics. The question should encourage substantive discussion about real current events.
        
        Format your response as JSON with these fields:
        - title: A brief title for the discussion (max 60 characters)
        - question: The main discussion question (should be open-ended and thought-provoking)
        - context: 2-3 sentences providing relevant background context`,

      energy: `Generate a thought-provoking discussion question about current energy sector affairs.
        Focus on topics like renewable energy, oil markets, energy policy, climate change impacts,
        energy infrastructure, or energy security. The question should encourage substantive discussion about real current events.
        
        Format your response as JSON with these fields:
        - title: A brief title for the discussion (max 60 characters)
        - question: The main discussion question (should be open-ended and thought-provoking)
        - context: 2-3 sentences providing relevant background context`
    };

    const prompt = sectorPrompts[sector as keyof typeof sectorPrompts];
    const response = await perplexityService.generateContent(prompt);
    
    try {
      const parsed = JSON.parse(response);
      return {
        title: parsed.title || `Daily ${sector.charAt(0).toUpperCase() + sector.slice(1)} Discussion`,
        question: parsed.question || `What are your thoughts on current developments in the ${sector} sector?`,
        context: parsed.context || `This is today's discussion topic for the ${sector} sector.`
      };
    } catch (parseError) {
      console.warn(`Failed to parse Perplexity response for ${sector}, using fallback:`, parseError);
      return {
        title: `Daily ${sector.charAt(0).toUpperCase() + sector.slice(1)} Discussion`,
        question: response.length > 200 ? response.substring(0, 200) + "..." : response,
        context: `Today's discussion topic for the ${sector} sector, generated by AI analysis of current events.`
      };
    }
  }

  // Manual trigger for testing
  async generateQuestionsNow() {
    console.log("🔧 Manually triggering daily question generation...");
    await this.generateDailyQuestions();
  }

  // Get today's question for a sector
  async getTodaysQuestion(sector: string) {
    const today = new Date().toISOString().split('T')[0];
    return await storage.getDailyQuestion(sector, today);
  }

  // Cleanup
  destroy() {
    if (this.scheduledTimer) {
      clearTimeout(this.scheduledTimer);
      this.scheduledTimer = null;
    }
  }
}

export const dailyQuestionService = new DailyQuestionService();