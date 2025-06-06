import { 
  conflicts, stocks, correlationEvents, users, stockWatchlists, conflictWatchlists, dailyQuizzes, userQuizResponses, dailyNews,
  type Conflict, type Stock, type CorrelationEvent, type User, type StockWatchlist, type ConflictWatchlist, type DailyQuiz, type UserQuizResponse, type DailyNews,
  type InsertConflict, type InsertStock, type InsertCorrelationEvent, type InsertUser, type InsertStockWatchlist, type InsertConflictWatchlist, type InsertDailyQuiz, type InsertUserQuizResponse, type InsertDailyNews
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
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
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Stock Watchlists
  getUserStockWatchlist(userId: number): Promise<StockWatchlist[]>;
  addStockToWatchlist(watchlist: InsertStockWatchlist): Promise<StockWatchlist>;
  removeStockFromWatchlist(userId: number, stockSymbol: string): Promise<void>;
  
  // Conflict Watchlists
  getUserConflictWatchlist(userId: number): Promise<ConflictWatchlist[]>;
  addConflictToWatchlist(watchlist: InsertConflictWatchlist): Promise<ConflictWatchlist>;
  removeConflictFromWatchlist(userId: number, conflictId: number): Promise<void>;
  
  // Daily Quizzes
  getDailyQuiz(date: string): Promise<DailyQuiz | undefined>;
  getDailyQuizById(id: number): Promise<DailyQuiz | undefined>;
  createDailyQuiz(quiz: InsertDailyQuiz): Promise<DailyQuiz>;
  createUserQuizResponse(response: InsertUserQuizResponse): Promise<UserQuizResponse>;
  getUserQuizResponse(userId: number, quizId: number): Promise<UserQuizResponse | undefined>;
  
  // Daily News
  getDailyNews(date: string): Promise<DailyNews | undefined>;
  createDailyNews(news: InsertDailyNews): Promise<DailyNews>;
  
  // Quiz Leaderboard
  getDailyQuizLeaderboard(date: string): Promise<{ username: string; totalPoints: number; score: number; timeBonus: number; completedAt: Date | null }[]>;
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

  // Daily News
  async getDailyNews(date: string): Promise<DailyNews | undefined> {
    const [news] = await db.select().from(dailyNews).where(eq(dailyNews.date, date));
    return news || undefined;
  }

  async createDailyNews(insertNews: InsertDailyNews): Promise<DailyNews> {
    const [news] = await db.insert(dailyNews).values(insertNews).returning();
    return news;
  }

  async getDailyQuizLeaderboard(date: string): Promise<{ username: string; totalPoints: number; score: number; timeBonus: number; completedAt: Date | null }[]> {
    const quiz = await this.getDailyQuiz(date);
    if (!quiz) return [];

    const results = await db
      .select({
        username: users.username,
        totalPoints: userQuizResponses.totalPoints,
        score: userQuizResponses.score,
        timeBonus: userQuizResponses.timeBonus,
        completedAt: userQuizResponses.completedAt,
      })
      .from(userQuizResponses)
      .innerJoin(users, eq(userQuizResponses.userId, users.id))
      .where(eq(userQuizResponses.quizId, quiz.id))
      .orderBy(desc(userQuizResponses.totalPoints), asc(userQuizResponses.completedAt));

    return results;
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
  private users: Map<number, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  private usersByUsername: Map<string, User> = new Map();
  private stockWatchlists: Map<number, StockWatchlist> = new Map();
  private conflictWatchlists: Map<number, ConflictWatchlist> = new Map();
  private dailyQuizzes: Map<string, DailyQuiz> = new Map();
  private userQuizResponses: Map<number, UserQuizResponse> = new Map();
  private dailyNewsMap: Map<string, DailyNews> = new Map();
  private currentConflictId: number;
  private currentCorrelationId: number;
  private currentUserId: number = 1;
  private currentStockWatchlistId: number = 1;
  private currentConflictWatchlistId: number = 1;
  private currentQuizId: number = 1;
  private currentQuizResponseId: number = 1;
  private currentNewsId: number = 1;

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
        description: "Ongoing military conflict with recent developments in drone warfare and territorial dynamics. Over 1 million+ military casualties combined (June 2025).",
        severity: "High",
        status: "Active",
        duration: "3+ years",
        startDate: new Date("2022-02-24"),
        lastUpdated: new Date("2025-06-04"),
        latitude: 49.0,
        longitude: 32.0,
        parties: ["UA", "RU"]
      },
      {
        id: 2,
        region: "Middle East",
        name: "Israel-Gaza Conflict",
        description: "Continued military operations with ongoing humanitarian crisis and regional tensions. Over 55,000 casualties reported.",
        severity: "High",
        status: "Active",
        duration: "20+ months",
        startDate: new Date("2023-10-07"),
        lastUpdated: new Date("2025-06-04"),
        latitude: 31.5,
        longitude: 34.5,
        parties: ["IL", "PS"]
      },
      {
        id: 3,
        region: "Africa",
        name: "Sudan Civil War",
        description: "Devastating civil war between Sudanese Armed Forces and Rapid Support Forces. Over 40,000 casualties and millions displaced.",
        severity: "High",
        status: "Active",
        duration: "2+ years",
        startDate: new Date("2023-04-15"),
        lastUpdated: new Date("2025-06-04"),
        latitude: 15.5,
        longitude: 32.5,
        parties: ["SD"]
      },
      {
        id: 4,
        region: "Asia",
        name: "Myanmar Civil War",
        description: "Intensifying civil war with resistance forces gaining territory against military junta. Estimated 15,000+ casualties.",
        severity: "High",
        status: "Active",
        duration: "4+ years",
        startDate: new Date("2021-02-01"),
        lastUpdated: new Date("2025-06-04"),
        latitude: 21.9,
        longitude: 95.9,
        parties: ["MM"]
      },
      {
        id: 5,
        region: "Asia-Pacific",
        name: "South China Sea Tensions",
        description: "Escalating territorial disputes with increased naval presence and confrontations. Recent incidents involving 25+ casualties.",
        severity: "Medium",
        status: "Active",
        duration: "Ongoing",
        startDate: new Date("2023-01-01"),
        lastUpdated: new Date("2025-06-04"),
        latitude: 15.0,
        longitude: 115.0,
        parties: ["CN", "PH", "VN", "MY"]
      },
      {
        id: 6,
        region: "Asia-Pacific",
        name: "Taiwan Strait Tensions",
        description: "Heightened military exercises and diplomatic tensions with increased defense buildups. No direct casualties but rising military alert levels.",
        severity: "High",
        status: "Monitoring",
        duration: "Ongoing",
        startDate: new Date("2024-01-01"),
        lastUpdated: new Date("2025-06-04"),
        latitude: 24.0,
        longitude: 121.0,
        parties: ["TW", "CN", "US"]
      },
      {
        id: 7,
        region: "Africa",
        name: "Democratic Republic of Congo M23 Crisis",
        description: "M23 insurgency in eastern DRC with regional involvement and humanitarian crisis",
        severity: "Medium",
        status: "Active",
        duration: "3+ years",
        startDate: new Date("2022-01-01"),
        lastUpdated: new Date("2025-06-04"),
        latitude: -2.0,
        longitude: 29.0,
        parties: ["CD", "RW"]
      },

      {
        id: 8,
        region: "Middle East",
        name: "Iran-Israel Shadow War",
        description: "Ongoing covert conflict involving cyber attacks, proxy warfare, assassinations, and regional power projection across the Middle East.",
        severity: "High",
        status: "Active",
        duration: "15+ years",
        startDate: new Date("2010-01-01"),
        lastUpdated: new Date("2025-06-04"),
        latitude: 32.0,
        longitude: 53.0,
        parties: ["IR", "IL"]
      },
      {
        id: 9,
        region: "Africa",
        name: "West Africa Sahel Crisis",
        description: "Multi-country insurgency involving jihadist groups across Mali, Burkina Faso, Niger, and Chad. Over 20,000 deaths since 2012.",
        severity: "High",
        status: "Active",
        duration: "12+ years",
        startDate: new Date("2012-01-16"),
        lastUpdated: new Date("2025-06-04"),
        latitude: 15.0,
        longitude: -5.0,
        parties: ["ML", "BF", "NE", "TD"]
      },
      {
        id: 10,
        region: "Europe",
        name: "Georgia-Russia Border Tensions",
        description: "Ongoing tensions over occupied territories of South Ossetia and Abkhazia with periodic escalations and borderization activities.",
        severity: "Medium",
        status: "Active",
        duration: "17+ years",
        startDate: new Date("2008-08-07"),
        lastUpdated: new Date("2025-06-04"),
        latitude: 42.3,
        longitude: 43.4,
        parties: ["GE", "RU"]
      },
      {
        id: 11,
        region: "North America",
        name: "Mexico Drug War",
        description: "Ongoing conflict between Mexican government and drug cartels. Over 400,000 deaths and 100,000+ disappeared since 2006 (June 2025).",
        severity: "High",
        status: "Active",
        duration: "18+ years",
        startDate: new Date("2006-12-11"),
        lastUpdated: new Date("2025-06-04"),
        latitude: 23.6,
        longitude: -102.5,
        parties: ["MX"]
      },
      {
        id: 12,
        region: "South America",
        name: "Venezuela Border Crisis",
        description: "Multi-faceted crisis involving mass migration, territorial disputes with neighbors, and internal political conflict. 7.7 million migrants and refugees.",
        severity: "High",
        status: "Active",
        duration: "10+ years",
        startDate: new Date("2015-01-01"),
        lastUpdated: new Date("2025-06-04"),
        latitude: 6.4,
        longitude: -66.9,
        parties: ["VE", "GY", "CO", "BR"]
      },
      {
        id: 13,
        region: "North America",
        name: "Haiti Gang Crisis",
        description: "Complete breakdown of state authority with criminal gangs controlling majority of territory. Over 8,000 deaths in 2023 alone.",
        severity: "Critical",
        status: "Active",
        duration: "4+ years",
        startDate: new Date("2021-07-07"),
        lastUpdated: new Date("2025-06-04"),
        latitude: 18.9,
        longitude: -72.3,
        parties: ["HT"]
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
      },
      {
        id: 6,
        symbol: "RHM.DE",
        name: "Rheinmetall AG",
        price: 485.20,
        change: 15.80,
        changePercent: 3.37,
        volume: 750000,
        marketCap: "€20.8B",
        lastUpdated: new Date()
      },
      {
        id: 7,
        symbol: "BA.L",
        name: "BAE Systems plc",
        price: 1285.50,
        change: 23.40,
        changePercent: 1.86,
        volume: 1400000,
        marketCap: "£41.2B",
        lastUpdated: new Date()
      },
      {
        id: 8,
        symbol: "LDOS",
        name: "Leidos Holdings Inc",
        price: 142.85,
        change: 3.60,
        changePercent: 2.59,
        volume: 850000,
        marketCap: "$19.7B",
        lastUpdated: new Date()
      },
      {
        id: 9,
        symbol: "LHX",
        name: "L3Harris Technologies Inc",
        price: 215.60,
        change: 7.90,
        changePercent: 3.80,
        volume: 980000,
        marketCap: "$40.1B",
        lastUpdated: new Date()
      },
      {
        id: 10,
        symbol: "HWM",
        name: "Howmet Aerospace Inc",
        price: 89.45,
        change: 2.15,
        changePercent: 2.46,
        volume: 1200000,
        marketCap: "$36.8B",
        lastUpdated: new Date()
      },
      {
        id: 11,
        symbol: "KTOS",
        name: "Kratos Defense & Security Solutions Inc",
        price: 18.75,
        change: 0.85,
        changePercent: 4.75,
        volume: 2100000,
        marketCap: "$2.4B",
        lastUpdated: new Date()
      },
      {
        id: 12,
        symbol: "AVAV",
        name: "AeroVironment Inc",
        price: 187.90,
        change: 12.30,
        changePercent: 7.01,
        volume: 890000,
        marketCap: "$5.2B",
        lastUpdated: new Date()
      },
      {
        id: 13,
        symbol: "CW",
        name: "Curtiss-Wright Corporation",
        price: 293.40,
        change: 8.95,
        changePercent: 3.15,
        volume: 670000,
        marketCap: "$11.8B",
        lastUpdated: new Date()
      },
      {
        id: 14,
        symbol: "MRCY",
        name: "Mercury Systems Inc",
        price: 34.25,
        change: 1.45,
        changePercent: 4.42,
        volume: 1450000,
        marketCap: "$2.1B",
        lastUpdated: new Date()
      },
      {
        id: 15,
        symbol: "TXT",
        name: "Textron Inc",
        price: 89.60,
        change: 2.80,
        changePercent: 3.23,
        volume: 1850000,
        marketCap: "$18.9B",
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
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.usersByEmail.get(email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.usersByUsername.get(username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user);
    this.usersByUsername.set(user.username, user);
    
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const numericId = parseInt(id);
    const existingUser = this.users.get(numericId);
    if (!existingUser) return undefined;

    const updatedUser: User = {
      ...existingUser,
      ...updateData,
      updatedAt: new Date(),
    };

    this.users.set(numericId, updatedUser);
    
    // Update index maps if email or username changed
    if (updateData.email && updateData.email !== existingUser.email) {
      this.usersByEmail.delete(existingUser.email);
      this.usersByEmail.set(updateData.email, updatedUser);
    }
    
    if (updateData.username && updateData.username !== existingUser.username) {
      this.usersByUsername.delete(existingUser.username);
      this.usersByUsername.set(updateData.username, updatedUser);
    }

    return updatedUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(userData.id);
    if (existingUser) {
      return await this.updateUser(userData.id, userData) || existingUser;
    } else {
      return await this.createUser({
        ...userData,
        username: userData.email || `user_${userData.id}`,
        password: 'oauth_user' // OAuth users don't need passwords
      });
    }
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

  // Daily Quiz methods
  async getDailyQuiz(date: string): Promise<DailyQuiz | undefined> {
    return this.dailyQuizzes.get(date);
  }

  async getDailyQuizById(id: number): Promise<DailyQuiz | undefined> {
    for (const quiz of this.dailyQuizzes.values()) {
      if (quiz.id === id) {
        return quiz;
      }
    }
    return undefined;
  }

  async createDailyQuiz(insertQuiz: InsertDailyQuiz): Promise<DailyQuiz> {
    const quiz: DailyQuiz = {
      id: this.currentQuizId++,
      date: insertQuiz.date,
      questions: insertQuiz.questions,
      createdAt: new Date(),
    };
    
    this.dailyQuizzes.set(insertQuiz.date, quiz);
    return quiz;
  }

  async createUserQuizResponse(insertResponse: InsertUserQuizResponse): Promise<UserQuizResponse> {
    const response: UserQuizResponse = {
      id: this.currentQuizResponseId++,
      userId: insertResponse.userId,
      quizId: insertResponse.quizId,
      responses: insertResponse.responses,
      score: insertResponse.score,
      totalPoints: insertResponse.totalPoints || 0,
      timeBonus: insertResponse.timeBonus || 0,
      completionTimeSeconds: insertResponse.completionTimeSeconds || null,
      completedAt: new Date(),
    };
    
    this.userQuizResponses.set(response.id, response);
    return response;
  }

  async getUserQuizResponse(userId: number, quizId: number): Promise<UserQuizResponse | undefined> {
    for (const response of this.userQuizResponses.values()) {
      if (response.userId === userId && response.quizId === quizId) {
        return response;
      }
    }
    return undefined;
  }

  // Daily News
  async getDailyNews(date: string): Promise<DailyNews | undefined> {
    return this.dailyNewsMap.get(date);
  }

  async createDailyNews(insertNews: InsertDailyNews): Promise<DailyNews> {
    const news: DailyNews = {
      id: this.currentNewsId++,
      date: insertNews.date,
      title: insertNews.title,
      summary: insertNews.summary,
      keyDevelopments: insertNews.keyDevelopments,
      marketImpact: insertNews.marketImpact,
      conflictUpdates: insertNews.conflictUpdates,
      defenseStockHighlights: insertNews.defenseStockHighlights,
      geopoliticalAnalysis: insertNews.geopoliticalAnalysis,
      createdAt: new Date(),
    };
    
    this.dailyNewsMap.set(news.date, news);
    return news;
  }

  async getDailyQuizLeaderboard(date: string): Promise<{ username: string; totalPoints: number; score: number; timeBonus: number; completedAt: Date | null }[]> {
    const quiz = await this.getDailyQuiz(date);
    if (!quiz) return [];

    const leaderboard: { username: string; totalPoints: number; score: number; timeBonus: number; completedAt: Date | null }[] = [];
    
    for (const response of this.userQuizResponses.values()) {
      if (response.quizId === quiz.id) {
        const user = this.users.get(response.userId);
        if (user) {
          leaderboard.push({
            username: user.username,
            totalPoints: response.totalPoints,
            score: response.score,
            timeBonus: response.timeBonus,
            completedAt: response.completedAt,
          });
        }
      }
    }
    
    // Sort by total points (descending), then by completion time (ascending)
    return leaderboard.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (a.completedAt && b.completedAt) {
        return a.completedAt.getTime() - b.completedAt.getTime();
      }
      return 0;
    });
  }
}

export const storage = new MemStorage();