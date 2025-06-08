import { db } from "./db";
import { discussions } from "@shared/schema";
import { lt } from "drizzle-orm";

export class ChatCleanupService {
  private isScheduled = false;

  constructor() {
    this.scheduleDailyCleanup();
  }

  private scheduleDailyCleanup(): void {
    if (this.isScheduled) return;
    
    const scheduleNext = () => {
      const now = new Date();
      
      // Calculate next midnight ET (UTC-5 or UTC-4 depending on DST)
      const etOffset = this.getETOffset(now);
      const nextMidnightET = new Date();
      nextMidnightET.setUTCHours(etOffset, 0, 0, 0);
      
      // If we've passed today's midnight ET, schedule for tomorrow
      if (now.getTime() > nextMidnightET.getTime()) {
        nextMidnightET.setUTCDate(nextMidnightET.getUTCDate() + 1);
      }
      
      const timeUntilCleanup = nextMidnightET.getTime() - now.getTime();
      
      console.log(`Chat cleanup scheduled for: ${nextMidnightET.toISOString()} (in ${Math.round(timeUntilCleanup / 1000 / 60)} minutes)`);
      
      setTimeout(async () => {
        await this.cleanupOldMessages();
        scheduleNext(); // Schedule the next cleanup
      }, timeUntilCleanup);
    };

    scheduleNext();
    this.isScheduled = true;
  }

  private getETOffset(date: Date): number {
    // Simple DST calculation for US Eastern Time
    const year = date.getFullYear();
    const marchSecondSunday = this.getNthSunday(year, 2, 2); // Second Sunday of March
    const novemberFirstSunday = this.getNthSunday(year, 10, 0); // First Sunday of November
    
    if (date >= marchSecondSunday && date < novemberFirstSunday) {
      return 4; // EDT (UTC-4)
    } else {
      return 5; // EST (UTC-5)
    }
  }

  private getNthSunday(year: number, month: number, n: number): Date {
    const firstDay = new Date(year, month, 1);
    const firstSunday = new Date(firstDay);
    firstSunday.setDate(1 + (7 - firstDay.getDay()) % 7);
    return new Date(firstSunday.getTime() + (n * 7 * 24 * 60 * 60 * 1000));
  }

  async cleanupOldMessages(): Promise<void> {
    try {
      // Delete chat messages older than 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const result = await db
        .delete(discussions)
        .where(lt(discussions.createdAt, twentyFourHoursAgo));

      console.log(`Chat cleanup completed at ${new Date().toISOString()}`);
      console.log(`Cleaned up messages older than: ${twentyFourHoursAgo.toISOString()}`);
    } catch (error) {
      console.error("Error during chat cleanup:", error);
    }
  }

  async cleanupNow(): Promise<void> {
    await this.cleanupOldMessages();
  }
}

export const chatCleanupService = new ChatCleanupService();