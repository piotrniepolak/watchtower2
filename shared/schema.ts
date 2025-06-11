import { pgTable, text, serial, integer, real, timestamp, varchar, boolean, jsonb, date, index, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Import sector-specific schemas
export * from "./health-schema";
export * from "./energy-schema";

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
  sector: varchar("sector", { length: 50 }).default("Defense"),
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

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  sector: text("sector"), // Optional: defense, health, energy
  isSystem: boolean("is_system").default(false),
});

export const chatUsers = pgTable("chat_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  lastActive: timestamp("last_active").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - supports both session-based auth and Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  username: varchar("username"),
  password: varchar("password"), // For session-based authentication
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stockWatchlists = pgTable("stock_watchlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stockSymbol: text("stock_symbol").references(() => stocks.symbol).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  notes: text("notes"),
});

export const conflictWatchlists = pgTable("conflict_watchlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
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
  userId: varchar("user_id").notNull().references(() => users.id),
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

// Chat Message Schema
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;



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

// Discussion Board Tables
export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").references(() => users.id),
  category: varchar("category", { length: 100 }).notNull().default("general"),
  tags: text("tags").array(),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  replyCount: integer("reply_count").default(0),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const discussionReplies = pgTable("discussion_replies", {
  id: serial("id").primaryKey(),
  discussionId: integer("discussion_id").notNull().references(() => discussions.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  parentReplyId: integer("parent_reply_id").references(() => discussionReplies.id),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const discussionVotes = pgTable("discussion_votes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  discussionId: integer("discussion_id").references(() => discussions.id, { onDelete: "cascade" }),
  replyId: integer("reply_id").references(() => discussionReplies.id, { onDelete: "cascade" }),
  voteType: varchar("vote_type", { length: 10 }).notNull(), // 'up' or 'down'
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Questions for Community Chat
export const dailyQuestions = pgTable("daily_questions", {
  id: serial("id").primaryKey(),
  sector: varchar("sector", { length: 20 }).notNull(), // 'defense', 'healthcare', 'energy', 'general'
  question: text("question").notNull(),
  context: text("context"), // Additional context or background
  generatedDate: date("generated_date").notNull(),
  discussionId: integer("discussion_id").references(() => discussions.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Learning Module Tables
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  options: jsonb("options").notNull(), // Array of answer options
  correctAnswer: integer("correct_answer").notNull(), // Index of correct option
  explanation: text("explanation").notNull(),
  sector: varchar("sector", { length: 20 }).notNull(), // 'defense', 'health', 'energy'
  difficulty: varchar("difficulty", { length: 10 }).notNull(), // 'easy', 'medium', 'hard'
  source: text("source").notNull(), // Source of the information
  tags: text("tags").array(), // Related topics/tags
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizResponses = pgTable("quiz_responses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  questionId: integer("question_id").notNull().references(() => quizQuestions.id),
  selectedAnswer: integer("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent").notNull(), // in milliseconds
  sector: varchar("sector", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const learningStats = pgTable("learning_stats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  sector: varchar("sector", { length: 20 }).notNull(),
  totalScore: integer("total_score").default(0),
  streak: integer("streak").default(0),
  correctAnswers: integer("correct_answers").default(0),
  totalQuestions: integer("total_questions").default(0),
  lastQuizDate: date("last_quiz_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  author: one(users, {
    fields: [discussions.authorId],
    references: [users.id],
  }),
  replies: many(discussionReplies),
  votes: many(discussionVotes),
}));

export const discussionRepliesRelations = relations(discussionReplies, ({ one, many }) => ({
  discussion: one(discussions, {
    fields: [discussionReplies.discussionId],
    references: [discussions.id],
  }),
  author: one(users, {
    fields: [discussionReplies.authorId],
    references: [users.id],
  }),
  parentReply: one(discussionReplies, {
    fields: [discussionReplies.parentReplyId],
    references: [discussionReplies.id],
  }),
  childReplies: many(discussionReplies),
  votes: many(discussionVotes),
}));

export const discussionVotesRelations = relations(discussionVotes, ({ one }) => ({
  user: one(users, {
    fields: [discussionVotes.userId],
    references: [users.id],
  }),
  discussion: one(discussions, {
    fields: [discussionVotes.discussionId],
    references: [discussions.id],
  }),
  reply: one(discussionReplies, {
    fields: [discussionVotes.replyId],
    references: [discussionReplies.id],
  }),
}));

// Discussion Board Schemas
export const insertDiscussionSchema = createInsertSchema(discussions, {
  authorId: z.string().nullable().optional()
}).omit({
  id: true,
  upvotes: true,
  downvotes: true,
  replyCount: true,
  lastActivityAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDailyQuestionSchema = createInsertSchema(dailyQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertDiscussionReplySchema = createInsertSchema(discussionReplies).omit({
  id: true,
  upvotes: true,
  downvotes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscussionVoteSchema = createInsertSchema(discussionVotes).omit({
  id: true,
  createdAt: true,
});

// Chat User Schema
export const insertChatUserSchema = createInsertSchema(chatUsers).omit({
  id: true,
  createdAt: true,
});

// Chat User Types
export type ChatUser = typeof chatUsers.$inferSelect;
export type InsertChatUser = z.infer<typeof insertChatUserSchema>;

// Discussion Board Types
export type Discussion = typeof discussions.$inferSelect;
export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type DiscussionReply = typeof discussionReplies.$inferSelect;
export type InsertDiscussionReply = z.infer<typeof insertDiscussionReplySchema>;
export type DiscussionVote = typeof discussionVotes.$inferSelect;
export type InsertDiscussionVote = z.infer<typeof insertDiscussionVoteSchema>;
export type DailyQuestion = typeof dailyQuestions.$inferSelect;
export type InsertDailyQuestion = z.infer<typeof insertDailyQuestionSchema>;

// Learning Module Schemas
export const insertQuizQuestionSchema = createInsertSchema(quizQuestions, {
  options: z.array(z.string()),
  tags: z.array(z.string()).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizResponseSchema = createInsertSchema(quizResponses).omit({
  id: true,
  createdAt: true,
});

export const insertLearningStatsSchema = createInsertSchema(learningStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Learning Module Types
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizResponse = typeof quizResponses.$inferSelect;
export type InsertQuizResponse = z.infer<typeof insertQuizResponseSchema>;
export type LearningStats = typeof learningStats.$inferSelect;
export type InsertLearningStats = z.infer<typeof insertLearningStatsSchema>;
