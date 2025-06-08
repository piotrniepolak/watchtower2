import { 
  dailyQuizzes, userQuizResponses, users,
  type DailyQuiz, type UserQuizResponse, type User,
  type InsertDailyQuiz, type InsertUserQuizResponse
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export class QuizStorage {
  // Get today's quiz
  async getDailyQuiz(date: string): Promise<DailyQuiz | null> {
    const [quiz] = await db.select().from(dailyQuizzes).where(eq(dailyQuizzes.date, date));
    return quiz || null;
  }

  // Create a new daily quiz
  async createDailyQuiz(quiz: InsertDailyQuiz): Promise<DailyQuiz> {
    const [newQuiz] = await db.insert(dailyQuizzes).values(quiz).returning();
    return newQuiz;
  }

  // Submit quiz response and save to database
  async submitQuizResponse(
    userId: string, 
    quizId: number, 
    responses: number[], 
    score: number,
    totalPoints: number,
    timeBonus: number,
    completionTimeSeconds?: number
  ): Promise<{ score: number; total: number; totalPoints: number; timeBonus: number }> {
    // Check if user already submitted for this quiz
    const existingResponse = await db
      .select()
      .from(userQuizResponses)
      .where(and(
        eq(userQuizResponses.userId, userId),
        eq(userQuizResponses.quizId, quizId)
      ));

    if (existingResponse.length > 0) {
      // Return existing results
      const existing = existingResponse[0];
      return {
        score: existing.score,
        total: responses.length,
        totalPoints: existing.totalPoints,
        timeBonus: existing.timeBonus
      };
    }

    // Save new response
    const responseData: InsertUserQuizResponse = {
      userId,
      quizId,
      responses,
      score,
      totalPoints,
      timeBonus,
      completionTimeSeconds
    };

    await db.insert(userQuizResponses).values(responseData);

    return {
      score,
      total: responses.length,
      totalPoints,
      timeBonus
    };
  }

  // Get daily quiz by ID
  async getDailyQuizById(id: number): Promise<DailyQuiz | null> {
    const [quiz] = await db
      .select()
      .from(dailyQuizzes)
      .where(eq(dailyQuizzes.id, id));
    
    return quiz || null;
  }

  // Get user's quiz response for a specific quiz
  async getUserQuizResponse(userId: string, quizId: number): Promise<UserQuizResponse | null> {
    const [response] = await db
      .select()
      .from(userQuizResponses)
      .where(and(
        eq(userQuizResponses.userId, userId),
        eq(userQuizResponses.quizId, quizId)
      ));
    
    return response || null;
  }

  // Get leaderboard for a specific date
  async getDailyQuizLeaderboard(date: string): Promise<{
    username: string;
    totalPoints: number;
    score: number;
    timeBonus: number;
    completedAt: Date | null;
  }[]> {
    // Get today's quiz first
    const quiz = await this.getDailyQuiz(date);
    console.log(`Getting leaderboard for date: ${date}, quiz found:`, quiz?.id);
    if (!quiz) {
      return [];
    }

    // Get leaderboard including anonymous users
    const results = await db
      .select({
        userId: userQuizResponses.userId,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        totalPoints: userQuizResponses.totalPoints,
        score: userQuizResponses.score,
        timeBonus: userQuizResponses.timeBonus,
        completedAt: userQuizResponses.completedAt,
      })
      .from(userQuizResponses)
      .leftJoin(users, eq(userQuizResponses.userId, users.id))
      .where(eq(userQuizResponses.quizId, quiz.id))
      .orderBy(desc(userQuizResponses.totalPoints), asc(userQuizResponses.completedAt));

    console.log(`Found ${results.length} leaderboard entries for quiz ${quiz.id}`);
    if (results.length > 0) {
      console.log('Sample entry:', results[0]);
      console.log('All entries usernames:', results.map(r => ({ 
        userId: r.userId, 
        username: r.username, 
        firstName: r.firstName 
      })));
    }

    const leaderboardData = results.map(result => {
      console.log('Raw database result:', {
        userId: result.userId,
        username: result.username,
        firstName: result.firstName,
        email: result.email
      });
      const generatedUsername = this.generateUsernameForLeaderboard(result);
      console.log('Generated username:', generatedUsername);
      
      return {
        username: generatedUsername,
        totalPoints: result.totalPoints,
        score: result.score,
        timeBonus: result.timeBonus,
        completedAt: result.completedAt
      };
    });
    
    console.log('Final leaderboard data:', leaderboardData);
    return leaderboardData;
  }

  // Helper method to generate a username from user data
  private generateUsername(user: { username?: string | null; firstName?: string | null; email?: string | null }): string {
    if (user.username) return user.username;
    if (user.firstName) return user.firstName;
    if (user.email) return user.email.split('@')[0];
    return 'Anonymous';
  }

  // Helper method to generate username for leaderboard including anonymous users
  private generateUsernameForLeaderboard(result: { 
    userId: string; 
    username?: string | null; 
    firstName?: string | null; 
    lastName?: string | null; 
    email?: string | null; 
  }): string {
    // Check if this is an anonymous user first
    if (result.userId.startsWith('anon_')) {
      // Extract a short identifier from the anonymous ID
      const parts = result.userId.split('_');
      if (parts.length >= 3) {
        return `Anonymous${parts[2].slice(-4)}`;
      }
      return `Anonymous${result.userId.slice(-4)}`;
    }
    
    // For registered users, ALWAYS prioritize the actual username they created
    if (result.username && result.username.trim() && result.username.trim() !== '') {
      return result.username.trim();
    }
    
    // If user somehow doesn't have a username, generate one from name + ID to avoid duplicates
    if (result.firstName && result.firstName.trim()) {
      const shortId = result.userId.toString().slice(-3);
      return `${result.firstName.trim()}${shortId}`;
    }
    
    // If no first name, use email prefix + ID
    if (result.email) {
      const emailPrefix = result.email.split('@')[0];
      const shortId = result.userId.toString().slice(-3);
      return `${emailPrefix}${shortId}`;
    }
    
    // Last resort - use user ID
    return `User${result.userId.slice(-4)}`;
  }
}

export const quizStorage = new QuizStorage();