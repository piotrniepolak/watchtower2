import { 
  conflicts, stocks, correlationEvents, users, stockWatchlists, conflictWatchlists,
  type Conflict, type Stock, type CorrelationEvent, type User, type StockWatchlist, type ConflictWatchlist,
  type InsertConflict, type InsertStock, type InsertCorrelationEvent, type InsertUser, type InsertStockWatchlist, type InsertConflictWatchlist 
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Conflicts
  getConflicts(): Promise<Conflict[]>;
  getConflict(id: number): Promise<Conflict | undefined>;
  createConflict(conflict: InsertConflict): Promise<Conflict>;
  updateConflict(id: number, conflict: Partial<InsertConflict>): Promise<Conflict | undefined>;
  
  // Stocks
  getStocks(): Promise<Stock[]>;
  getStock(symbol: string): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(symbol: string, stock: Partial<InsertStock>): Promise<Stock | undefined>;
  
  // Correlation Events
  getCorrelationEvents(): Promise<CorrelationEvent[]>;
  createCorrelationEvent(event: InsertCorrelationEvent): Promise<CorrelationEvent>;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Stock Watchlists
  getUserStockWatchlist(userId: number): Promise<StockWatchlist[]>;
  addStockToWatchlist(watchlist: InsertStockWatchlist): Promise<StockWatchlist>;
  removeStockFromWatchlist(userId: number, stockSymbol: string): Promise<void>;
  
  // Conflict Watchlists
  getUserConflictWatchlist(userId: number): Promise<ConflictWatchlist[]>;
  addConflictToWatchlist(watchlist: InsertConflictWatchlist): Promise<ConflictWatchlist>;
  removeConflictFromWatchlist(userId: number, conflictId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Conflicts
  async getConflicts(): Promise<Conflict[]> {
    return await db.select().from(conflicts);
  }

  async getConflict(id: number): Promise<Conflict | undefined> {
    const [conflict] = await db.select().from(conflicts).where(eq(conflicts.id, id));
    return conflict;
  }

  async createConflict(insertConflict: InsertConflict): Promise<Conflict> {
    const [conflict] = await db.insert(conflicts).values(insertConflict).returning();
    return conflict;
  }

  async updateConflict(id: number, updateData: Partial<InsertConflict>): Promise<Conflict | undefined> {
    const [conflict] = await db.update(conflicts).set(updateData).where(eq(conflicts.id, id)).returning();
    return conflict;
  }

  // Stocks
  async getStocks(): Promise<Stock[]> {
    return await db.select().from(stocks);
  }

  async getStock(symbol: string): Promise<Stock | undefined> {
    const [stock] = await db.select().from(stocks).where(eq(stocks.symbol, symbol));
    return stock;
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const [stock] = await db.insert(stocks).values(insertStock).returning();
    return stock;
  }

  async updateStock(symbol: string, updateData: Partial<InsertStock>): Promise<Stock | undefined> {
    const [stock] = await db.update(stocks).set(updateData).where(eq(stocks.symbol, symbol)).returning();
    return stock;
  }

  // Correlation Events
  async getCorrelationEvents(): Promise<CorrelationEvent[]> {
    return await db.select().from(correlationEvents);
  }

  async createCorrelationEvent(insertEvent: InsertCorrelationEvent): Promise<CorrelationEvent> {
    const [event] = await db.insert(correlationEvents).values(insertEvent).returning();
    return event;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const userWithHashedPassword = { ...insertUser, password: hashedPassword };
    
    const [user] = await db.insert(users).values(userWithHashedPassword).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  // Stock Watchlists
  async getUserStockWatchlist(userId: number): Promise<StockWatchlist[]> {
    return await db.select().from(stockWatchlists).where(eq(stockWatchlists.userId, userId));
  }

  async addStockToWatchlist(watchlist: InsertStockWatchlist): Promise<StockWatchlist> {
    const [newWatchlist] = await db.insert(stockWatchlists).values(watchlist).returning();
    return newWatchlist;
  }

  async removeStockFromWatchlist(userId: number, stockSymbol: string): Promise<void> {
    await db.delete(stockWatchlists).where(
      and(
        eq(stockWatchlists.userId, userId),
        eq(stockWatchlists.stockSymbol, stockSymbol)
      )
    );
  }

  // Conflict Watchlists
  async getUserConflictWatchlist(userId: number): Promise<ConflictWatchlist[]> {
    return await db.select().from(conflictWatchlists).where(eq(conflictWatchlists.userId, userId));
  }

  async addConflictToWatchlist(watchlist: InsertConflictWatchlist): Promise<ConflictWatchlist> {
    const [newWatchlist] = await db.insert(conflictWatchlists).values(watchlist).returning();
    return newWatchlist;
  }

  async removeConflictFromWatchlist(userId: number, conflictId: number): Promise<void> {
    await db.delete(conflictWatchlists).where(
      and(
        eq(conflictWatchlists.userId, userId),
        eq(conflictWatchlists.conflictId, conflictId)
      )
    );
  }

  // Utility method for password verification
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

// For backward compatibility, create sample data in memory for the current session
export class MemStorage implements IStorage {
  private conflicts: Map<number, Conflict>;
  private stocks: Map<string, Stock>;
  private correlationEvents: Map<number, CorrelationEvent>;
  private users: Map<number, User>;
  private stockWatchlists: Map<number, StockWatchlist>;
  private conflictWatchlists: Map<number, ConflictWatchlist>;
  private currentConflictId: number;
  private currentCorrelationId: number;
  private currentUserId: number;
  private currentStockWatchlistId: number;
  private currentConflictWatchlistId: number;

  constructor() {
    this.conflicts = new Map();
    this.stocks = new Map();
    this.correlationEvents = new Map();
    this.currentConflictId = 1;
    this.currentCorrelationId = 1;
    this.initializeConflicts();
    this.initializeStocks();
  }

  private initializeConflicts() {
    const sampleConflicts: Conflict[] = [
      {
        id: 1,
        region: "Eastern Europe",
        name: "Ukraine-Russia Conflict",
        description: "Ongoing military conflict between Ukraine and Russia",
        severity: "High",
        status: "Active",
        duration: "2+ years",
        startDate: new Date("2022-02-24"),
        lastUpdated: new Date(),
        latitude: 49.0,
        longitude: 32.0,
        parties: ["UA", "RU"]
      },
      {
        id: 2,
        region: "Middle East",
        name: "Israel-Gaza Conflict",
        description: "Ongoing conflict in Gaza Strip",
        severity: "High",
        status: "Active",
        duration: "3+ months",
        startDate: new Date("2023-10-07"),
        lastUpdated: new Date(),
        latitude: 31.5,
        longitude: 34.5,
        parties: ["IL", "PS"]
      },
      {
        id: 3,
        region: "West Africa",
        name: "Mali Security Crisis",
        description: "Security crisis in northern Mali",
        severity: "Medium",
        status: "Ongoing",
        duration: "1+ year",
        startDate: new Date("2023-01-01"),
        lastUpdated: new Date(),
        latitude: 17.0,
        longitude: -4.0,
        parties: ["ML", "FR"]
      },
      {
        id: 4,
        region: "East Africa",
        name: "Ethiopia Tigray Conflict",
        description: "Internal conflict in Tigray region",
        severity: "Medium",
        status: "Ceasefire",
        duration: "2+ years",
        startDate: new Date("2020-11-04"),
        lastUpdated: new Date(),
        latitude: 14.0,
        longitude: 39.0,
        parties: ["ET"]
      },
      {
        id: 5,
        region: "South Asia",
        name: "Kashmir Border Tensions",
        description: "Border tensions between India and Pakistan",
        severity: "Medium",
        status: "Ongoing",
        duration: "Decades",
        startDate: new Date("1947-01-01"),
        lastUpdated: new Date(),
        latitude: 34.0,
        longitude: 76.0,
        parties: ["IN", "PK"]
      },
      {
        id: 6,
        region: "East Asia",
        name: "Taiwan Strait Tensions",
        description: "Rising tensions across Taiwan Strait",
        severity: "Medium",
        status: "Ongoing",
        duration: "Ongoing",
        startDate: new Date("2020-01-01"),
        lastUpdated: new Date(),
        latitude: 24.0,
        longitude: 121.0,
        parties: ["TW", "CN"]
      },
      {
        id: 7,
        region: "Central Africa",
        name: "DRC Eastern Conflicts",
        description: "Multiple armed groups active in eastern DRC",
        severity: "High",
        status: "Active",
        duration: "2+ years",
        startDate: new Date("2022-01-01"),
        lastUpdated: new Date(),
        latitude: -2.0,
        longitude: 29.0,
        parties: ["CD"]
      },
      {
        id: 8,
        region: "Horn of Africa",
        name: "Sudan Internal Conflict",
        description: "Internal armed conflict in Sudan",
        severity: "High",
        status: "Active",
        duration: "1+ year",
        startDate: new Date("2023-04-15"),
        lastUpdated: new Date(),
        latitude: 15.0,
        longitude: 30.0,
        parties: ["SD"]
      }
    ];

    sampleConflicts.forEach(conflict => {
      this.conflicts.set(conflict.id, conflict);
      this.currentConflictId = Math.max(this.currentConflictId, conflict.id + 1);
    });
  }

  private initializeStocks() {
    const sampleStocks: Stock[] = [
      {
        id: 1,
        symbol: "LMT",
        name: "Lockheed Martin Corporation",
        price: 423.50,
        change: 8.20,
        changePercent: 1.98,
        volume: 1250000,
        marketCap: "$120.5B",
        lastUpdated: new Date()
      },
      {
        id: 2,
        symbol: "RTX",
        name: "RTX Corporation",
        price: 98.75,
        change: -1.25,
        changePercent: -1.25,
        volume: 2100000,
        marketCap: "$142.8B",
        lastUpdated: new Date()
      },
      {
        id: 3,
        symbol: "NOC",
        name: "Northrop Grumman Corporation",
        price: 467.90,
        change: 12.45,
        changePercent: 2.73,
        volume: 890000,
        marketCap: "$72.1B",
        lastUpdated: new Date()
      },
      {
        id: 4,
        symbol: "GD",
        name: "General Dynamics Corporation",
        price: 289.30,
        change: 5.80,
        changePercent: 2.05,
        volume: 1650000,
        marketCap: "$79.4B",
        lastUpdated: new Date()
      },
      {
        id: 5,
        symbol: "BA",
        name: "The Boeing Company",
        price: 205.25,
        change: -3.75,
        changePercent: -1.79,
        volume: 3200000,
        marketCap: "$122.7B",
        lastUpdated: new Date()
      }
    ];

    sampleStocks.forEach(stock => {
      this.stocks.set(stock.symbol, stock);
    });
  }

  async getConflicts(): Promise<Conflict[]> {
    return Array.from(this.conflicts.values());
  }

  async getConflict(id: number): Promise<Conflict | undefined> {
    return this.conflicts.get(id);
  }

  async createConflict(insertConflict: InsertConflict): Promise<Conflict> {
    const conflict: Conflict = {
      id: this.currentConflictId++,
      ...insertConflict,
      lastUpdated: new Date()
    };
    this.conflicts.set(conflict.id, conflict);
    return conflict;
  }

  async updateConflict(id: number, updateData: Partial<InsertConflict>): Promise<Conflict | undefined> {
    const existing = this.conflicts.get(id);
    if (!existing) return undefined;
    
    const updated: Conflict = {
      ...existing,
      ...updateData,
      lastUpdated: new Date()
    };
    this.conflicts.set(id, updated);
    return updated;
  }

  async getStocks(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }

  async getStock(symbol: string): Promise<Stock | undefined> {
    return this.stocks.get(symbol);
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const stock: Stock = {
      id: this.stocks.size + 1,
      ...insertStock,
      lastUpdated: new Date()
    };
    this.stocks.set(stock.symbol, stock);
    return stock;
  }

  async updateStock(symbol: string, updateData: Partial<InsertStock>): Promise<Stock | undefined> {
    const existing = this.stocks.get(symbol);
    if (!existing) return undefined;
    
    const updated: Stock = {
      ...existing,
      ...updateData,
      lastUpdated: new Date()
    };
    this.stocks.set(symbol, updated);
    return updated;
  }

  async getCorrelationEvents(): Promise<CorrelationEvent[]> {
    return Array.from(this.correlationEvents.values());
  }

  async createCorrelationEvent(insertEvent: InsertCorrelationEvent): Promise<CorrelationEvent> {
    const event: CorrelationEvent = {
      id: this.currentCorrelationId++,
      ...insertEvent
    };
    this.correlationEvents.set(event.id, event);
    return event;
  }

  // User methods - placeholder for compatibility (will switch to database later)
  async getUser(id: number): Promise<User | undefined> {
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    throw new Error("User creation not implemented in MemStorage");
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    return undefined;
  }

  async getUserStockWatchlist(userId: number): Promise<StockWatchlist[]> {
    return [];
  }

  async addStockToWatchlist(watchlist: InsertStockWatchlist): Promise<StockWatchlist> {
    throw new Error("Watchlist not implemented in MemStorage");
  }

  async removeStockFromWatchlist(userId: number, stockSymbol: string): Promise<void> {
    // No-op
  }

  async getUserConflictWatchlist(userId: number): Promise<ConflictWatchlist[]> {
    return [];
  }

  async addConflictToWatchlist(watchlist: InsertConflictWatchlist): Promise<ConflictWatchlist> {
    throw new Error("Watchlist not implemented in MemStorage");
  }

  async removeConflictFromWatchlist(userId: number, conflictId: number): Promise<void> {
    // No-op
  }
}

export const storage = new MemStorage();