import OpenAI from "openai";
import { storage } from "./storage";
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
              content: 'You are a news analyst focused on geopolitical events and defense industry developments. Provide current, factual information.'
            },
            {
              role: 'user',
              content: 'What are the most significant geopolitical events, defense industry news, and military developments that have occurred in the past 7 days? Focus on: 1) International conflicts and tensions, 2) Defense contractor earnings and major contracts, 3) Military exercises and diplomatic meetings, 4) Defense technology and procurement news. Provide specific, recent events with dates and details.'
            }
          ],
          max_tokens: 1500,
          temperature: 0.2,
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
      return 'Unable to fetch current events. Using general geopolitical knowledge.';
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
            content: `You are a geopolitical intelligence expert creating daily quiz questions. Today is ${currentDate}. Generate 3 unique, challenging questions based on the CURRENT EVENTS provided below from recent news sources.
            
            Focus on creating quiz questions from the actual current events data, covering:
            - Recent geopolitical developments and ongoing conflicts
            - Defense industry news, stock movements, and contract announcements
            - International relations, diplomatic meetings, and policy changes
            - Military actions, defense spending, and security developments
            - Economic impacts of geopolitical events on defense markets
            - Technology developments in defense and security sectors
            
            IMPORTANT: Base questions ONLY on the current events information provided. Do not use general knowledge or historical events.
            
            Return a JSON array with exactly 3 questions in this format:
            {
              "questions": [
                {
                  "id": "unique_id",
                  "question": "Question text based on provided current events",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correctAnswer": 0,
                  "explanation": "Detailed explanation referencing the specific current event",
                  "difficulty": "medium",
                  "category": "geopolitical",
                  "source": "Reference to the current event source"
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
        id: `fallback_${today}_1`,
        question: "Which defense contractor sector typically benefits most from increased geopolitical tensions?",
        options: [
          "Commercial aviation",
          "Missile and defense systems",
          "Consumer electronics", 
          "Automotive technology"
        ],
        correctAnswer: 1,
        explanation: "Missile and defense systems manufacturers like Raytheon, Lockheed Martin, and Northrop Grumman typically see increased demand and stock performance during periods of heightened geopolitical tension as governments boost defense spending.",
        difficulty: "medium",
        category: "defense",
        source: "Historical defense market analysis"
      },
      {
        id: `fallback_${today}_2`,
        question: "What is the primary economic indicator that defense stocks correlate with during conflict periods?",
        options: [
          "Consumer confidence index",
          "Government defense budget allocations",
          "Oil price volatility",
          "Technology sector performance"
        ],
        correctAnswer: 1,
        explanation: "Defense stocks show strongest correlation with government defense budget allocations and military spending announcements, as these directly impact revenue potential for defense contractors.",
        difficulty: "medium",
        category: "market",
        source: "Financial market correlation studies"
      },
      {
        id: `fallback_${today}_3`,
        question: "Which factor most influences short-term volatility in defense contractor stock prices?",
        options: [
          "Quarterly earnings reports",
          "Breaking geopolitical news",
          "Federal Reserve interest rate decisions",
          "Commodity price changes"
        ],
        correctAnswer: 1,
        explanation: "Breaking geopolitical news, especially conflict escalations or new tensions, creates immediate market reactions in defense stocks as investors anticipate changes in defense spending and contract opportunities.",
        difficulty: "easy",
        category: "geopolitical",
        source: "Market volatility analysis"
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

  // Schedule daily quiz generation
  startDailyQuizScheduler(): void {
    const checkAndGenerate = async () => {
      const today = this.getTodayDateET();
      const existingQuiz = await storage.getDailyQuiz(today);
      
      if (!existingQuiz) {
        console.log("Generating today's quiz...");
        await this.generateDailyQuiz(today);
      }
    };

    // Check immediately
    checkAndGenerate();

    // Schedule to run every hour to catch the midnight ET rollover
    setInterval(checkAndGenerate, 60 * 60 * 1000);
  }
}

export const quizService = new QuizService();