import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
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

export type InsertConflict = z.infer<typeof insertConflictSchema>;
export type Conflict = typeof conflicts.$inferSelect;

export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocks.$inferSelect;

export type InsertCorrelationEvent = z.infer<typeof insertCorrelationEventSchema>;
export type CorrelationEvent = typeof correlationEvents.$inferSelect;
