import OpenAI from "openai";
import { storage } from "./storage";
import type { QuizQuestion, DailyQuiz, InsertDailyQuiz } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class QuizService {
  private isGenerating = false;

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
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a geopolitical intelligence expert creating daily quiz questions. Generate 3 unique, challenging questions based on CURRENT global events from the last 7 days. Focus on:
            - Recent geopolitical developments and conflicts
            - Defense industry news and market movements  
            - International relations and diplomatic events
            - Military actions and security developments
            - Economic impacts of geopolitical events
            
            Each question should test knowledge of recent events, not general history. Questions should be factual and based on real developments.
            
            Return a JSON array with exactly 3 questions in this format:
            {
              "questions": [
                {
                  "id": "unique_id",
                  "question": "Question text",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correctAnswer": 0,
                  "explanation": "Detailed explanation with context",
                  "difficulty": "medium",
                  "category": "geopolitical",
                  "source": "Brief source context"
                }
              ]
            }`
          },
          {
            role: "user",
            content: `Generate 3 quiz questions about current geopolitical and defense market developments from the past week. Make sure questions are:
            1. Based on actual recent events (within last 7 days)
            2. Relevant to geopolitical intelligence and defense markets
            3. Challenging but fair for informed readers
            4. Include proper explanations with context
            
            Categories should be distributed among: geopolitical, market, defense.
            Difficulty should be mostly medium with one easy and one hard question.`
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

  async submitQuizResponse(userId: number, quizId: number, responses: number[]): Promise<{ score: number; total: number }> {
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

    await storage.createUserQuizResponse({
      userId,
      quizId,
      responses: responses as any,
      score
    });

    return { score, total: questions.length };
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