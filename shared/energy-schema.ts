import { pgTable, varchar, text, integer, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";

// Energy Regulation Events - Policy changes, OPEC decisions, regulatory announcements
export const energyRegulationEvents = pgTable("energy_regulation_events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // policy_change, opec_decision, sanctions, trade_agreement, environmental_regulation
  regulationType: varchar("regulation_type", { length: 100 }).notNull(), // drilling_permit, pipeline_approval, emissions_standard, tax_policy
  region: varchar("region", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }),
  regulatoryBody: varchar("regulatory_body", { length: 200 }).notNull(), // EPA, DOE, OPEC, etc.
  severity: varchar("severity", { length: 50 }).notNull(), // low, medium, high, critical
  impact: varchar("impact", { length: 50 }).notNull(), // positive, negative, neutral
  affectedSector: varchar("affected_sector", { length: 100 }), // oil, gas, renewable, nuclear
  description: text("description"),
  implementationDate: timestamp("implementation_date"),
  expectedDuration: varchar("expected_duration", { length: 100 }), // temporary, permanent, 1_year, etc.
  source: varchar("source", { length: 200 }).notNull(),
  sourceUrl: text("source_url"),
  economicImpact: decimal("economic_impact", { precision: 15, scale: 2 }), // Estimated impact in billions
  priceImpactEstimate: decimal("price_impact_estimate", { precision: 8, scale: 4 }), // Expected % change in oil/gas prices
  affectedCompanies: jsonb("affected_companies"), // JSON array of company names/tickers
  complianceCost: decimal("compliance_cost", { precision: 15, scale: 2 }),
  eventDate: timestamp("event_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Energy Stock Correlations - Links regulation events to energy stock movements
export const energyStockCorrelations = pgTable("energy_stock_correlations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  regulationEventId: integer("regulation_event_id").references(() => energyRegulationEvents.id),
  stockSymbol: varchar("stock_symbol", { length: 10 }).notNull(),
  correlationStrength: decimal("correlation_strength", { precision: 5, scale: 4 }),
  priceImpact: decimal("price_impact", { precision: 10, scale: 4 }),
  volumeImpact: decimal("volume_impact", { precision: 15, scale: 2 }),
  eventDate: timestamp("event_date").notNull(),
  stockDate: timestamp("stock_date").notNull(),
  analysisMethod: varchar("analysis_method", { length: 50 }),
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  lag: integer("lag"), // Days between regulation event and stock reaction
  createdAt: timestamp("created_at").defaultNow(),
});

// Oil Price Events - Major oil price movements and their causes
export const oilPriceEvents = pgTable("oil_price_events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // supply_shock, demand_surge, strategic_reserve, geopolitical
  oilType: varchar("oil_type", { length: 50 }).notNull(), // WTI, Brent, crude_oil
  priceChange: decimal("price_change", { precision: 8, scale: 4 }).notNull(), // Percentage change
  priceFrom: decimal("price_from", { precision: 8, scale: 2 }),
  priceTo: decimal("price_to", { precision: 8, scale: 2 }),
  volume: decimal("volume", { precision: 15, scale: 2 }),
  cause: text("cause"),
  region: varchar("region", { length: 100 }),
  duration: varchar("duration", { length: 50 }), // intraday, week, month, sustained
  marketReaction: text("market_reaction"),
  analystCommentary: text("analyst_commentary"),
  relatedEvents: jsonb("related_events"), // JSON array of related event IDs
  eventDate: timestamp("event_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Policy Timeline - Track major energy policy developments over time
export const energyPolicyTimeline = pgTable("energy_policy_timeline", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  policyName: varchar("policy_name", { length: 200 }).notNull(),
  policyType: varchar("policy_type", { length: 100 }).notNull(), // legislation, executive_order, regulation, international_agreement
  stage: varchar("stage", { length: 100 }).notNull(), // proposed, under_review, approved, implemented, repealed
  region: varchar("region", { length: 100 }).notNull(),
  sponsoringBody: varchar("sponsoring_body", { length: 200 }),
  description: text("description"),
  keyProvisions: jsonb("key_provisions"),
  expectedImpact: text("expected_impact"),
  industryResponse: text("industry_response"),
  stageDate: timestamp("stage_date").notNull(),
  nextMilestone: varchar("next_milestone", { length: 200 }),
  nextMilestoneDate: timestamp("next_milestone_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type EnergyRegulationEvent = typeof energyRegulationEvents.$inferSelect;
export type InsertEnergyRegulationEvent = typeof energyRegulationEvents.$inferInsert;
export type EnergyStockCorrelation = typeof energyStockCorrelations.$inferSelect;
export type InsertEnergyStockCorrelation = typeof energyStockCorrelations.$inferInsert;
export type OilPriceEvent = typeof oilPriceEvents.$inferSelect;
export type InsertOilPriceEvent = typeof oilPriceEvents.$inferInsert;
export type EnergyPolicyTimeline = typeof energyPolicyTimeline.$inferSelect;
export type InsertEnergyPolicyTimeline = typeof energyPolicyTimeline.$inferInsert;