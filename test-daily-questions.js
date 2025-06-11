import { perplexityService } from './server/perplexity-service.js';
import { db } from './server/db.js';
import { discussions, dailyQuestions } from './shared/schema.js';

const sectors = ['defense', 'healthcare', 'energy'];

async function generateDailyQuestions() {
  console.log('🤖 Starting manual daily question generation...');
  
  for (const sector of sectors) {
    try {
      console.log(`📝 Generating question for ${sector} sector...`);
      
      // Generate question using Perplexity
      const prompt = `Generate an engaging discussion question for the ${sector} sector community. 
The question should be thought-provoking, relevant to current industry trends, and encourage meaningful discussion among professionals and enthusiasts.
Format: Return only the question text, no additional formatting.
Focus on topics like market analysis, technological developments, policy impacts, or strategic insights.`;

      const questionText = await perplexityService.generateContent(prompt);
      
      if (!questionText) {
        console.log(`❌ Failed to generate question for ${sector}`);
        continue;
      }

      // Create pinned discussion
      const [discussion] = await db.insert(discussions).values({
        title: `Daily Discussion: ${sector.charAt(0).toUpperCase() + sector.slice(1)} Sector`,
        content: questionText,
        authorId: 'system',
        category: sector,
        tags: ['daily-question', 'community', sector],
        isPinned: true
      }).returning();

      // Create daily question record
      await db.insert(dailyQuestions).values({
        sector,
        question: questionText,
        context: `Daily discussion question for ${sector} sector community`,
        generatedDate: new Date().toISOString().split('T')[0],
        discussionId: discussion.id,
        isActive: true
      });

      console.log(`✅ Generated question for ${sector}: "${questionText.substring(0, 60)}..."`);
    } catch (error) {
      console.error(`❌ Error generating question for ${sector}:`, error.message);
    }
  }
  
  console.log('🎉 Daily question generation completed!');
}

generateDailyQuestions().catch(console.error);