import { pgTable, varchar, text, integer, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";

// Health Events - Disease outbreaks, health emergencies, WHO alerts
export const healthEvents = pgTable("health_events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // outbreak, epidemic, pandemic, health_emergency
  diseaseName: varchar("disease_name", { length: 200 }).notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }),
  severity: varchar("severity", { length: 50 }).notNull(), // low, medium, high, critical
  status: varchar("status", { length: 50 }).notNull(), // active, contained, resolved
  casesReported: integer("cases_reported"),
  deathsReported: integer("deaths_reported"),
  recoveredReported: integer("recovered_reported"),
  source: varchar("source", { length: 200 }).notNull(), // WHO, CDC, etc.
  sourceUrl: text("source_url"),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  affectedPopulation: integer("affected_population"),
  responseActions: jsonb("response_actions"), // JSON array of response measures
  economicImpact: text("economic_impact"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Health Stock Correlations - Links health events to pharmaceutical stock movements
export const healthStockCorrelations = pgTable("health_stock_correlations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  healthEventId: integer("health_event_id").references(() => healthEvents.id),
  stockSymbol: varchar("stock_symbol", { length: 10 }).notNull(),
  correlationStrength: decimal("correlation_strength", { precision: 5, scale: 4 }),
  priceImpact: decimal("price_impact", { precision: 10, scale: 4 }),
  volumeImpact: decimal("volume_impact", { precision: 15, scale: 2 }),
  eventDate: timestamp("event_date").notNull(),
  stockDate: timestamp("stock_date").notNull(),
  analysisMethod: varchar("analysis_method", { length: 50 }),
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pharmaceutical Research Events - Clinical trials, FDA approvals, research breakthroughs
export const pharmaResearchEvents = pgTable("pharma_research_events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // clinical_trial, fda_approval, breakthrough, partnership
  company: varchar("company", { length: 200 }).notNull(),
  stockSymbol: varchar("stock_symbol", { length: 10 }),
  drugName: varchar("drug_name", { length: 200 }),
  indication: text("indication"), // What the drug treats
  phase: varchar("phase", { length: 50 }), // Phase I, II, III, IV for clinical trials
  status: varchar("status", { length: 50 }).notNull(), // initiated, completed, approved, rejected
  marketSize: decimal("market_size", { precision: 15, scale: 2 }), // Estimated market size
  description: text("description"),
  sourceUrl: text("source_url"),
  eventDate: timestamp("event_date").notNull(),
  expectedLaunchDate: timestamp("expected_launch_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type HealthEvent = typeof healthEvents.$inferSelect;
export type InsertHealthEvent = typeof healthEvents.$inferInsert;
export type HealthStockCorrelation = typeof healthStockCorrelations.$inferSelect;
export type InsertHealthStockCorrelation = typeof healthStockCorrelations.$inferInsert;
export type PharmaResearchEvent = typeof pharmaResearchEvents.$inferSelect;
export type InsertPharmaResearchEvent = typeof pharmaResearchEvents.$inferInsert;