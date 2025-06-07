import { pgTable, text, serial, integer, real, timestamp, varchar, boolean, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const conflicts = pgTable("conflicts", {
  id: serial("id").primaryKey(),
  region: text("region").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  severity: text("severity").notNull(), // "Low", "Medium", "High"
  status: text("status").notNull(), // "Active", "Ongoing", "Resolved"
  duration: text("duration").notNull(),
  startDate: timestamp("start_date").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  parties: text("parties").array(), // Array of country codes for flags
});

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  change: real("change").notNull(),
  changePercent: real("change_percent").notNull(),
  volume: integer("volume").notNull(),
  marketCap: text("market_cap"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const correlationEvents = pgTable("correlation_events", {
  id: serial("id").primaryKey(),
  conflictId: integer("conflict_id").references(() => conflicts.id),
  eventDate: timestamp("event_date").notNull(),
  eventDescription: text("event_description").notNull(),
  stockMovement: real("stock_movement").notNull(),
  severity: integer("severity").notNull(), // 1-10 scale
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stockWatchlists = pgTable("stock_watchlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stockSymbol: text("stock_symbol").references(() => stocks.symbol).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  notes: text("notes"),
});

export const conflictWatchlists = pgTable("conflict_watchlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  conflictId: integer("conflict_id").references(() => conflicts.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  notes: text("notes"),
});

export const insertConflictSchema = createInsertSchema(conflicts).omit({
  id: true,
  lastUpdated: true,
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  lastUpdated: true,
});

export const insertCorrelationEventSchema = createInsertSchema(correlationEvents).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockWatchlistSchema = createInsertSchema(stockWatchlists).omit({
  id: true,
  createdAt: true,
});

export const insertConflictWatchlistSchema = createInsertSchema(conflictWatchlists).omit({
  id: true,
  createdAt: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  stockWatchlists: many(stockWatchlists),
  conflictWatchlists: many(conflictWatchlists),
}));

export const stockWatchlistsRelations = relations(stockWatchlists, ({ one }) => ({
  user: one(users, { fields: [stockWatchlists.userId], references: [users.id] }),
  stock: one(stocks, { fields: [stockWatchlists.stockSymbol], references: [stocks.symbol] }),
}));

export const conflictWatchlistsRelations = relations(conflictWatchlists, ({ one }) => ({
  user: one(users, { fields: [conflictWatchlists.userId], references: [users.id] }),
  conflict: one(conflicts, { fields: [conflictWatchlists.conflictId], references: [conflicts.id] }),
}));

export type InsertConflict = z.infer<typeof insertConflictSchema>;
export type Conflict = typeof conflicts.$inferSelect;

export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocks.$inferSelect;

export type InsertCorrelationEvent = z.infer<typeof insertCorrelationEventSchema>;
export type CorrelationEvent = typeof correlationEvents.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

export type InsertStockWatchlist = z.infer<typeof insertStockWatchlistSchema>;
export type StockWatchlist = typeof stockWatchlists.$inferSelect;

export type InsertConflictWatchlist = z.infer<typeof insertConflictWatchlistSchema>;
export type ConflictWatchlist = typeof conflictWatchlists.$inferSelect;

// Daily Quiz Tables
export const dailyQuizzes = pgTable("daily_quizzes", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  questions: jsonb("questions").notNull(), // Array of quiz questions
  createdAt: timestamp("created_at").defaultNow(),
});

export const userQuizResponses = pgTable("user_quiz_responses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  quizId: integer("quiz_id").notNull().references(() => dailyQuizzes.id),
  responses: jsonb("responses").notNull(), // User's answers
  score: integer("score").notNull(),
  totalPoints: integer("total_points").notNull().default(0), // Points earned including time bonus
  timeBonus: integer("time_bonus").notNull().default(0), // Speed completion bonus
  completionTimeSeconds: integer("completion_time_seconds"), // Time taken to complete quiz
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertDailyQuizSchema = createInsertSchema(dailyQuizzes, {
  questions: z.array(z.any())
}).omit({
  id: true,
  createdAt: true,
});

export const insertUserQuizResponseSchema = createInsertSchema(userQuizResponses, {
  responses: z.array(z.number())
}).omit({
  id: true,
  completedAt: true,
});

export const dailyQuizzesRelations = relations(dailyQuizzes, ({ many }) => ({
  responses: many(userQuizResponses),
}));

export const userQuizResponsesRelations = relations(userQuizResponses, ({ one }) => ({
  user: one(users, {
    fields: [userQuizResponses.userId],
    references: [users.id],
  }),
  quiz: one(dailyQuizzes, {
    fields: [userQuizResponses.quizId],
    references: [dailyQuizzes.id],
  }),
}));

export type InsertDailyQuiz = z.infer<typeof insertDailyQuizSchema>;
export type DailyQuiz = typeof dailyQuizzes.$inferSelect;

export type InsertUserQuizResponse = z.infer<typeof insertUserQuizResponseSchema>;
export type UserQuizResponse = typeof userQuizResponses.$inferSelect;

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  category: "geopolitical" | "market" | "defense" | "general";
  source?: string;
}

// Daily News Schema
export const dailyNews = pgTable("daily_news", {
  id: serial("id").primaryKey(),
  date: varchar("date").notNull().unique(),
  title: varchar("title").notNull(),
  summary: text("summary").notNull(),
  keyDevelopments: jsonb("key_developments").notNull(),
  marketImpact: text("market_impact").notNull(),
  conflictUpdates: jsonb("conflict_updates").notNull(),
  defenseStockHighlights: jsonb("defense_stock_highlights").notNull(),
  geopoliticalAnalysis: text("geopolitical_analysis").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDailyNewsSchema = createInsertSchema(dailyNews, {
  keyDevelopments: z.array(z.string()),
  conflictUpdates: z.array(z.object({
    conflict: z.string(),
    update: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
  })),
  defenseStockHighlights: z.array(z.object({
    symbol: z.string(),
    name: z.string(),
    change: z.number(),
    changePercent: z.number(),
    reason: z.string(),
  })),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertDailyNews = z.infer<typeof insertDailyNewsSchema>;
export type DailyNews = typeof dailyNews.$inferSelect;

export interface NewsConflictUpdate {
  conflict: string;
  update: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface NewsStockHighlight {
  symbol: string;
  name: string;
  change: number;
  changePercent: number;
  reason: string;
}

// Lobbying expenditure tracking
export const lobbyingExpenditures = pgTable("lobbying_expenditures", {
  id: serial("id").primaryKey(),
  stockSymbol: text("stock_symbol").references(() => stocks.symbol).notNull(),
  year: integer("year").notNull(),
  quarter: integer("quarter").notNull(), // 1-4
  amount: real("amount").notNull(), // Amount spent in millions USD
  reportedDate: timestamp("reported_date").notNull(),
  source: text("source").notNull().default("OpenSecrets.org"), // Data source
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLobbyingExpenditureSchema = createInsertSchema(lobbyingExpenditures).omit({
  id: true,
  createdAt: true,
});

export type InsertLobbyingExpenditure = z.infer<typeof insertLobbyingExpenditureSchema>;
export type LobbyingExpenditure = typeof lobbyingExpenditures.$inferSelect;

// Stock price history for ROI calculations
export const stockPriceHistory = pgTable("stock_price_history", {
  id: serial("id").primaryKey(),
  stockSymbol: text("stock_symbol").references(() => stocks.symbol).notNull(),
  date: date("date").notNull(),
  openPrice: real("open_price").notNull(),
  closePrice: real("close_price").notNull(),
  highPrice: real("high_price").notNull(),
  lowPrice: real("low_price").notNull(),
  volume: integer("volume").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStockPriceHistorySchema = createInsertSchema(stockPriceHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertStockPriceHistory = z.infer<typeof insertStockPriceHistorySchema>;
export type StockPriceHistory = typeof stockPriceHistory.$inferSelect;

export interface ROIAnalysis {
  stockSymbol: string;
  companyName: string;
  timeframe: string;
  priceGainPercent: number;
  lobbyingSpent: number;
  roiRatio: number; // Price gain % / Lobbying spent (millions)
  rank: number;
}
