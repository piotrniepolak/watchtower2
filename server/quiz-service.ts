import OpenAI from "openai";
import { storage } from "./storage";
import { perplexityService } from "./perplexity-service";
import type { QuizQuestion, DailyQuiz, InsertDailyQuiz } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class QuizService {
  private isGenerating = false;

  private async fetchCurrentEvents(): Promise<string> {
    try {
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
              content: 'You are a defense intelligence analyst providing current geopolitical and military developments for strategic assessment.'
            },
            {
              role: 'user',
              content: 'Analyze the most significant geopolitical developments from the past week, focusing on: 1) Active conflicts and military operations, 2) Defense contractor earnings, major contract awards, and industry developments, 3) International sanctions, diplomatic initiatives, and security partnerships, 4) Military technology advances, weapons testing, and procurement announcements, 5) Strategic resource competition (energy, rare earth minerals, shipping lanes). Provide specific details with dates and strategic implications.'
            }
          ],
          max_tokens: 2000,
          temperature: 0.1,
          search_recency_filter: 'week'
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error fetching current events:', error);
      // Return comprehensive context for OpenAI to generate relevant questions
      return `Current major geopolitical context (December 2024/January 2025):
      - Ongoing conflict in Ukraine with evolving defense supply chains and NATO support
      - Indo-Pacific tensions regarding Taiwan and South China Sea territorial disputes
      - Middle East regional tensions affecting energy security and defense partnerships
      - Defense industry focus on AI, hypersonics, and autonomous systems
      - Increased defense spending across NATO allies and Indo-Pacific partners
      - Supply chain vulnerabilities in critical defense technologies
      - Cyber warfare capabilities and space-based defense systems development`;
    }
  }

  async generateDailyQuiz(date: string): Promise<DailyQuiz | null> {
    if (this.isGenerating) {
      console.log("Quiz generation already in progress");
      return null;
    }

    this.isGenerating = true;
    
    try {
      // Check if quiz already exists for this date
      const existingQuiz = await storage.getDailyQuiz(date);
      if (existingQuiz) {
        console.log(`Quiz already exists for ${date}`);
        return existingQuiz;
      }

      console.log(`Generating new quiz for ${date}`);
      
      // Generate questions using OpenAI
      const questions = await this.generateQuestions();
      
      // Save quiz to database
      const quiz = await storage.createDailyQuiz({
        date,
        questions: questions as any
      });
      
      console.log(`Successfully created quiz for ${date} with ${questions.length} questions`);
      return quiz;
    } catch (error) {
      console.error("Error generating daily quiz:", error);
      return null;
    } finally {
      this.isGenerating = false;
    }
  }

  private async generateQuestions(): Promise<QuizQuestion[]> {
    try {
      const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      // First, get current geopolitical and defense news using Perplexity
      const currentEvents = await this.fetchCurrentEvents();

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a senior geopolitical analyst and defense intelligence specialist. Today is ${currentDate}. Create sophisticated quiz questions about current global developments.

Generate 3 challenging questions covering:
1. Current geopolitical tensions and conflicts (Ukraine, Middle East, Indo-Pacific, etc.)
2. Defense industry developments and military technology trends
3. Economic warfare, sanctions, energy geopolitics, and strategic partnerships

Requirements:
- Questions must reflect real-world complexity and current events from 2024-2025
- Include specific countries, organizations, technologies, or recent developments
- Create sophisticated distractors that require deep knowledge
- Explanations should provide strategic context and implications
- Each question should challenge informed readers

If current events data is provided below, prioritize those developments. Otherwise, focus on major ongoing geopolitical situations.

Return JSON format:
{
  "questions": [
    {
      "id": "geo_${currentDate.replace(/\s/g, '_')}_1",
      "question": "Detailed, specific question about current geopolitical developments",
      "options": ["Sophisticated option A", "Detailed option B", "Strategic option C", "Complex option D"],
      "correctAnswer": 0,
      "explanation": "Comprehensive explanation with strategic implications and context",
      "difficulty": "hard",
      "category": "geopolitical",
      "source": "Current geopolitical analysis"
    }
  ]
}`
          },
          {
            role: "user",
            content: `Based on the following current events from the past week, generate 3 quiz questions:

CURRENT EVENTS DATA:
${currentEvents}

Create questions that:
1. Are directly based on the events described above
2. Test knowledge of these specific recent developments
3. Are challenging but fair for informed readers
4. Include explanations that reference the source events
5. Cover different categories: geopolitical, market, defense
6. Have varying difficulty: one easy, one medium, one hard

Only use information from the current events data provided above.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2500
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      const parsed = JSON.parse(content);
      const questions: QuizQuestion[] = parsed.questions || [];

      if (questions.length !== 3) {
        throw new Error(`Expected 3 questions, got ${questions.length}`);
      }

      // Validate question structure
      questions.forEach((q, index) => {
        if (!q.question || !q.options || q.options.length !== 4 || 
            typeof q.correctAnswer !== 'number' || !q.explanation) {
          throw new Error(`Invalid question structure at index ${index}`);
        }
        
        // Ensure we have a unique ID
        if (!q.id) {
          q.id = `q_${Date.now()}_${index}`;
        }
      });

      return questions;
    } catch (error) {
      console.error("Error generating questions with OpenAI:", error);
      
      // Fallback questions if OpenAI fails
      return this.getFallbackQuestions();
    }
  }

  private getFallbackQuestions(): QuizQuestion[] {
    const today = new Date().toISOString().split('T')[0];
    
    return [
      {
        id: `current_${today}_1`,
        question: "Which strategic development has most significantly altered NATO's eastern flank defense posture since 2022?",
        options: [
          "Establishment of permanent battle groups in Baltic states and Poland",
          "Deployment of HIMARS systems to Eastern European allies",
          "Creation of the NATO Response Force rapid deployment capability",
          "Integration of Nordic countries into Arctic defense strategies"
        ],
        correctAnswer: 0,
        explanation: "NATO has fundamentally restructured its eastern flank with permanent multinational battle groups in the Baltic states and Poland, representing a shift from rotational to persistent deterrence following Russia's invasion of Ukraine.",
        difficulty: "hard",
        category: "geopolitical",
        source: "NATO Strategic Concept 2022 analysis"
      },
      {
        id: `current_${today}_2`,
        question: "What factor primarily drives defense stock performance during prolonged geopolitical conflicts?",
        options: [
          "Immediate surge in emergency procurement contracts",
          "Long-term increases in baseline defense budget allocations",
          "Speculation on conflict escalation scenarios",
          "Currency fluctuations in affected regions"
        ],
        correctAnswer: 1,
        explanation: "Defense stocks show strongest correlation with government defense budget allocations and military spending announcements, as these directly impact revenue potential for defense contractors.",
        difficulty: "medium",
        category: "market",
        source: "Financial market correlation studies"
      },
      {
        id: `current_${today}_3`,
        question: "Which emerging technology sector has become most critical for maintaining strategic military advantage in peer competition scenarios?",
        options: [
          "Quantum computing and cryptography for secure communications",
          "Hypersonic weapons delivery systems and countermeasures",
          "Artificial intelligence for autonomous battlefield decision-making",
          "Space-based intelligence and satellite constellation networks"
        ],
        correctAnswer: 2,
        explanation: "AI-driven autonomous systems represent the most transformative military technology, enabling rapid decision-making in complex battlefields, force multiplication, and strategic advantages in information warfare and operational tempo that define modern peer competition.",
        difficulty: "hard",
        category: "defense",
        source: "Defense Innovation Unit strategic analysis"
      }
    ];
  }

  async getTodaysQuiz(): Promise<DailyQuiz | null> {
    const today = this.getTodayDateET();
    let quiz = await storage.getDailyQuiz(today);
    
    if (!quiz) {
      quiz = await this.generateDailyQuiz(today);
    }
    
    return quiz;
  }

  async submitQuizResponse(userId: number, quizId: number, responses: number[], completionTimeSeconds?: number): Promise<{ score: number; total: number; totalPoints: number; timeBonus: number }> {
    const quiz = await storage.getDailyQuizById(quizId);
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    const questions = quiz.questions as QuizQuestion[];
    let score = 0;

    responses.forEach((response, index) => {
      if (response === questions[index]?.correctAnswer) {
        score++;
      }
    });

    // Calculate points: 500 points per correct answer
    const basePoints = score * 500;
    
    // Calculate time bonus: Maximum 300 points for completing under 300 seconds
    // Bonus decreases by 1 point per second after that
    let timeBonus = 0;
    if (completionTimeSeconds !== undefined && completionTimeSeconds <= 300) {
      timeBonus = Math.max(0, 300 - completionTimeSeconds);
    }
    
    const totalPoints = basePoints + timeBonus;

    await storage.createUserQuizResponse({
      userId,
      quizId,
      responses: responses as any,
      score,
      totalPoints,
      timeBonus,
      completionTimeSeconds: completionTimeSeconds || null
    });

    return { score, total: questions.length, totalPoints, timeBonus };
  }

  private getTodayDateET(): string {
    const now = new Date();
    // Convert to ET timezone
    const etTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    return etTime.toISOString().split('T')[0];
  }

  // Generate daily quiz for a specific sector
  async generateDailyQuizForSector(date: string, sector: string): Promise<any> {
    try {
      console.log(`Generating quiz for ${sector} sector on ${date}`);
      
      // Use Perplexity to generate quiz questions
      const quiz = await perplexityService.generateQuiz({
        sector,
        difficulty: 'medium'
      });

      // Store the quiz in database
      const storedQuiz = await storage.createDailyQuiz({
        date,
        sector,
        questions: quiz.questions
      });

      console.log(`Successfully generated ${sector} quiz with ${quiz.questions.length} questions`);
      return storedQuiz;
    } catch (error) {
      console.error(`Error generating ${sector} quiz:`, error);
      throw error;
    }
  }

  // Schedule daily quiz generation for all sectors
  startDailyQuizScheduler(): void {
    const checkAndGenerate = async () => {
      const today = this.getTodayDateET();
      const sectors = ['defense', 'health', 'energy'];
      
      for (const sector of sectors) {
        const existingQuiz = await storage.getDailyQuizBySector(today, sector);
        
        if (!existingQuiz) {
          console.log(`Generating today's ${sector} quiz...`);
          await this.generateDailyQuizForSector(today, sector);
        }
      }
    };

    // Check immediately
    checkAndGenerate();

    // Schedule to run every hour to catch the midnight ET rollover
    setInterval(checkAndGenerate, 60 * 60 * 1000);
  }
}

export const quizService = new QuizService();