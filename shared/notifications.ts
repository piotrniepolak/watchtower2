import { pgTable, varchar, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id"),
  type: varchar("type").notNull(), // "conflict_update", "market_alert", "ai_analysis", "system"
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional structured data
  read: boolean("read").default(false).notNull(),
  priority: varchar("priority").default("normal").notNull(), // "low", "normal", "high", "urgent"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type NotificationType = "conflict_update" | "market_alert" | "ai_analysis" | "system";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface ConflictUpdateData {
  conflictId: number;
  conflictName: string;
  updateType: "status_change" | "escalation" | "casualties" | "new_development";
  previousValue?: string;
  newValue?: string;
}

export interface MarketAlertData {
  stockSymbol: string;
  stockName: string;
  alertType: "price_change" | "volume_spike" | "correlation_event";
  threshold?: number;
  currentValue: number;
  change: number;
  changePercent: number;
}

export interface AIAnalysisData {
  analysisType: "prediction" | "market_analysis" | "storyline";
  conflictId?: number;
  confidence?: number;
  summary: string;
}