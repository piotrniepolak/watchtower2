import { 
  conflicts, stocks, correlationEvents, users, stockWatchlists, conflictWatchlists, dailyQuizzes, userQuizResponses, dailyNews,
  type Conflict, type Stock, type CorrelationEvent, type User, type StockWatchlist, type ConflictWatchlist, type DailyQuiz, type UserQuizResponse, type DailyNews,
  type InsertConflict, type InsertStock, type InsertCorrelationEvent, type InsertUser, type InsertStockWatchlist, type InsertConflictWatchlist, type InsertDailyQuiz, type InsertUserQuizResponse, type InsertDailyNews, type UpsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gt } from "drizzle-orm";
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
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUsername(id: string, newUsername: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Stock Watchlists
  getUserStockWatchlist(userId: string): Promise<StockWatchlist[]>;
  addStockToWatchlist(watchlist: InsertStockWatchlist): Promise<StockWatchlist>;
  removeStockFromWatchlist(userId: string, stockSymbol: string): Promise<void>;
  
  // Conflict Watchlists
  getUserConflictWatchlist(userId: string): Promise<ConflictWatchlist[]>;
  addConflictToWatchlist(watchlist: InsertConflictWatchlist): Promise<ConflictWatchlist>;
  removeConflictFromWatchlist(userId: string, conflictId: number): Promise<void>;
  
  // Daily Quizzes
  getDailyQuiz(date: string): Promise<DailyQuiz | undefined>;
  createDailyQuiz(quiz: InsertDailyQuiz): Promise<DailyQuiz>;
  createUserQuizResponse(response: InsertUserQuizResponse): Promise<UserQuizResponse>;
  getUserQuizResponse(userId: string, quizId: number): Promise<UserQuizResponse | undefined>;
  
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
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUsername(id: string, newUsername: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ username: newUsername }).where(eq(users.id, id)).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Stock Watchlists
  async getUserStockWatchlist(userId: string): Promise<StockWatchlist[]> {
    return await db.select().from(stockWatchlists).where(eq(stockWatchlists.userId, userId));
  }

  async addStockToWatchlist(watchlist: InsertStockWatchlist): Promise<StockWatchlist> {
    const [created] = await db.insert(stockWatchlists).values(watchlist).returning();
    return created;
  }

  async removeStockFromWatchlist(userId: string, stockSymbol: string): Promise<void> {
    await db.delete(stockWatchlists).where(
      and(eq(stockWatchlists.userId, userId), eq(stockWatchlists.stockSymbol, stockSymbol))
    );
  }

  // Conflict Watchlists
  async getUserConflictWatchlist(userId: string): Promise<ConflictWatchlist[]> {
    return await db.select().from(conflictWatchlists).where(eq(conflictWatchlists.userId, userId));
  }

  async addConflictToWatchlist(watchlist: InsertConflictWatchlist): Promise<ConflictWatchlist> {
    const [created] = await db.insert(conflictWatchlists).values(watchlist).returning();
    return created;
  }

  async removeConflictFromWatchlist(userId: string, conflictId: number): Promise<void> {
    await db.delete(conflictWatchlists).where(
      and(eq(conflictWatchlists.userId, userId), eq(conflictWatchlists.conflictId, conflictId))
    );
  }

  // Daily Quizzes
  async getDailyQuiz(date: string): Promise<DailyQuiz | undefined> {
    const [quiz] = await db.select().from(dailyQuizzes).where(eq(dailyQuizzes.date, date));
    return quiz;
  }

  async createDailyQuiz(quiz: InsertDailyQuiz): Promise<DailyQuiz> {
    const [created] = await db.insert(dailyQuizzes).values(quiz).returning();
    return created;
  }

  async createUserQuizResponse(response: InsertUserQuizResponse): Promise<UserQuizResponse> {
    const [created] = await db.insert(userQuizResponses).values(response).returning();
    return created;
  }

  async getUserQuizResponse(userId: string, quizId: number): Promise<UserQuizResponse | undefined> {
    const [response] = await db.select().from(userQuizResponses).where(
      and(eq(userQuizResponses.userId, userId), eq(userQuizResponses.quizId, quizId))
    );
    return response;
  }

  // Daily News
  async getDailyNews(date: string): Promise<DailyNews | undefined> {
    const [news] = await db.select().from(dailyNews).where(eq(dailyNews.date, date));
    return news;
  }

  async createDailyNews(news: InsertDailyNews): Promise<DailyNews> {
    const [created] = await db.insert(dailyNews).values(news).returning();
    return created;
  }

  // Quiz Leaderboard
  async getDailyQuizLeaderboard(date: string): Promise<{ username: string; totalPoints: number; score: number; timeBonus: number; completedAt: Date | null }[]> {
    const leaderboard = await db
      .select({
        username: users.username,
        totalPoints: userQuizResponses.totalPoints,
        score: userQuizResponses.score,
        timeBonus: userQuizResponses.timeBonus,
        completedAt: userQuizResponses.completedAt,
      })
      .from(userQuizResponses)
      .innerJoin(dailyQuizzes, eq(userQuizResponses.quizId, dailyQuizzes.id))
      .innerJoin(users, eq(userQuizResponses.userId, users.id))
      .where(eq(dailyQuizzes.date, date))
      .orderBy(desc(userQuizResponses.totalPoints), asc(userQuizResponses.completedAt));

    return leaderboard.map(entry => ({
      username: entry.username || 'Anonymous',
      totalPoints: entry.totalPoints,
      score: entry.score,
      timeBonus: entry.timeBonus,
      completedAt: entry.completedAt,
    }));
  }
}

// In-memory storage implementation for development
export class MemStorage implements IStorage {
  private conflicts: Conflict[] = [];
  private stocks: Stock[] = [];
  private correlationEvents: CorrelationEvent[] = [];
  private users: User[] = [];
  private stockWatchlists: StockWatchlist[] = [];
  private conflictWatchlists: ConflictWatchlist[] = [];
  private dailyQuizzes: DailyQuiz[] = [];
  private userQuizResponses: UserQuizResponse[] = [];
  private dailyNewsItems: DailyNews[] = [];
  private idCounter = 1;

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Initialize with comprehensive defense contractor and conflict data
    this.conflicts = [
      {
        id: 1,
        region: "Eastern Europe",
        name: "Ukraine-Russia Conflict",
        description: "Ongoing territorial dispute and military conflict between Ukraine and Russia",
        severity: "High",
        status: "Active",
        duration: "2+ years",
        startDate: new Date("2022-02-24"),
        lastUpdated: new Date(),
        latitude: 50.4501,
        longitude: 30.5234,
        parties: ["Ukraine", "Russia"]
      },
      {
        id: 2,
        region: "Middle East",
        name: "Israel-Palestine Conflict",
        description: "Long-standing territorial and political conflict in the Middle East",
        severity: "High", 
        status: "Active",
        duration: "75+ years",
        startDate: new Date("1948-05-15"),
        lastUpdated: new Date(),
        latitude: 31.7683,
        longitude: 35.2137,
        parties: ["Israel", "Palestine"]
      },
      {
        id: 3,
        region: "East Asia",
        name: "Taiwan Strait Tensions",
        description: "Escalating military tensions between China and Taiwan",
        severity: "Medium",
        status: "Monitoring",
        duration: "70+ years",
        startDate: new Date("1949-12-07"),
        lastUpdated: new Date(),
        latitude: 25.0330,
        longitude: 121.5654,
        parties: ["China", "Taiwan"]
      },
      {
        id: 4,
        region: "South Asia",
        name: "Kashmir Dispute",
        description: "Territorial dispute between India and Pakistan over Kashmir region",
        severity: "Medium",
        status: "Active",
        duration: "75+ years", 
        startDate: new Date("1947-10-22"),
        lastUpdated: new Date(),
        latitude: 34.0837,
        longitude: 74.7973,
        parties: ["India", "Pakistan"]
      },
      {
        id: 5,
        region: "Africa",
        name: "Ethiopian Civil Conflict",
        description: "Internal armed conflict in Ethiopia involving multiple regions",
        severity: "High",
        status: "Active",
        duration: "3+ years",
        startDate: new Date("2020-11-04"),
        lastUpdated: new Date(),
        latitude: 9.1450,
        longitude: 40.4897,
        parties: ["Ethiopian Government", "Regional Forces"]
      },
      {
        id: 6,
        region: "Middle East",
        name: "Syrian Civil War",
        description: "Multi-sided armed conflict in Syria",
        severity: "High",
        status: "Active", 
        duration: "13+ years",
        startDate: new Date("2011-03-15"),
        lastUpdated: new Date(),
        latitude: 34.8021,
        longitude: 38.9968,
        parties: ["Syrian Government", "Opposition Forces"]
      },
      {
        id: 7,
        region: "South America",
        name: "Colombia Internal Conflict",
        description: "Armed conflict involving government forces and illegal armed groups",
        severity: "Medium",
        status: "Active",
        duration: "50+ years",
        startDate: new Date("1964-05-27"),
        lastUpdated: new Date(),
        latitude: 4.7110,
        longitude: -74.0721,
        parties: ["Colombian Government", "Armed Groups"]
      },
      {
        id: 8,
        region: "Africa",
        name: "Mali Conflict",
        description: "Armed conflict in northern Mali involving government and rebel forces",
        severity: "Medium",
        status: "Active",
        duration: "12+ years",
        startDate: new Date("2012-01-16"),
        lastUpdated: new Date(),
        latitude: 17.5707,
        longitude: -3.9962,
        parties: ["Mali Government", "Rebel Groups"]
      },
      {
        id: 9,
        region: "Asia",
        name: "Myanmar Civil Unrest",
        description: "Political instability and armed conflict following military coup",
        severity: "High",
        status: "Active",
        duration: "3+ years",
        startDate: new Date("2021-02-01"),
        lastUpdated: new Date(),
        latitude: 19.7633,
        longitude: 96.0785,
        parties: ["Military Junta", "Opposition Forces"]
      },
      {
        id: 10,
        region: "Europe",
        name: "Nagorno-Karabakh Dispute",
        description: "Territorial dispute between Armenia and Azerbaijan",
        severity: "Medium",
        status: "Monitoring",
        duration: "30+ years",
        startDate: new Date("1988-02-20"),
        lastUpdated: new Date(),
        latitude: 39.8282,
        longitude: 46.7633,
        parties: ["Armenia", "Azerbaijan"]
      },
      {
        id: 11,
        region: "Africa",
        name: "Democratic Republic of Congo Conflict",
        description: "Armed conflicts in eastern DRC involving multiple armed groups",
        severity: "High",
        status: "Active",
        duration: "25+ years",
        startDate: new Date("1998-08-02"),
        lastUpdated: new Date(),
        latitude: -4.0383,
        longitude: 21.7587,
        parties: ["DRC Government", "Armed Groups"]
      },
      {
        id: 12,
        region: "Middle East",
        name: "Yemen Civil War",
        description: "Multi-sided civil war in Yemen",
        severity: "High",
        status: "Active",
        duration: "9+ years",
        startDate: new Date("2014-09-21"),
        lastUpdated: new Date(),
        latitude: 15.5527,
        longitude: 48.5164,
        parties: ["Houthis", "Saudi-backed Government"]
      },
      {
        id: 13,
        region: "Europe",
        name: "Georgia Territorial Disputes",
        description: "Territorial disputes involving South Ossetia and Abkhazia",
        severity: "Low",
        status: "Frozen",
        duration: "30+ years",
        startDate: new Date("1991-12-23"),
        lastUpdated: new Date(),
        latitude: 41.7151,
        longitude: 44.8271,
        parties: ["Georgia", "Russia", "Breakaway Regions"]
      }
    ];

    this.stocks = [
      {
        symbol: "LMT",
        id: 1,
        name: "Lockheed Martin Corporation",
        price: 481.69,
        change: 3.62,
        changePercent: 0.76,
        volume: 1234567,
        marketCap: "$125.2B",
        lastUpdated: new Date()
      },
      {
        symbol: "RTX",
        id: 2,
        name: "Raytheon Technologies Corporation",
        price: 139.10,
        change: 0.01,
        changePercent: 0.01,
        volume: 2345678,
        marketCap: "$198.5B",
        lastUpdated: new Date()
      },
      {
        symbol: "NOC",
        id: 3,
        name: "Northrop Grumman Corporation",
        price: 489.41,
        change: 1.27,
        changePercent: 0.26,
        volume: 987654,
        marketCap: "$72.8B",
        lastUpdated: new Date()
      },
      {
        symbol: "GD",
        id: 4,
        name: "General Dynamics Corporation",
        price: 276.48,
        change: 1.98,
        changePercent: 0.72,
        volume: 1456789,
        marketCap: "$76.4B",
        lastUpdated: new Date()
      },
      {
        symbol: "BA",
        id: 5,
        name: "The Boeing Company",
        price: 210.80,
        change: 1.61,
        changePercent: 0.77,
        volume: 3456789,
        marketCap: "$124.7B",
        lastUpdated: new Date()
      },
      {
        symbol: "RHM.DE",
        id: 6,
        name: "Rheinmetall AG",
        price: 1788.00,
        change: -93.78,
        changePercent: -4.99,
        volume: 234567,
        marketCap: "€37.8B",
        lastUpdated: new Date()
      },
      {
        symbol: "BA.L",
        id: 7,
        name: "BAE Systems plc",
        price: 1930.50,
        change: -51.50,
        changePercent: -2.60,
        volume: 567890,
        marketCap: "£61.2B",
        lastUpdated: new Date()
      },
      {
        symbol: "LDOS",
        id: 8,
        name: "Leidos Holdings Inc",
        price: 148.14,
        change: 2.76,
        changePercent: 1.90,
        volume: 789012,
        marketCap: "$20.1B",
        lastUpdated: new Date()
      },
      {
        symbol: "LHX",
        id: 9,
        name: "L3Harris Technologies Inc",
        price: 244.27,
        change: 2.15,
        changePercent: 0.89,
        volume: 890123,
        marketCap: "$44.8B",
        lastUpdated: new Date()
      },
      {
        symbol: "HWM",
        id: 10,
        name: "Howmet Aerospace Inc",
        price: 175.37,
        change: 0.19,
        changePercent: 0.11,
        volume: 456789,
        marketCap: "$68.2B",
        lastUpdated: new Date()
      },
      {
        symbol: "KTOS",
        id: 11,
        name: "Kratos Defense & Security Solutions Inc",
        price: 40.47,
        change: 0.11,
        changePercent: 0.27,
        volume: 345678,
        marketCap: "$5.1B",
        lastUpdated: new Date()
      },
      {
        symbol: "AVAV",
        id: 12,
        name: "AeroVironment Inc",
        price: 190.89,
        change: 4.30,
        changePercent: 2.30,
        volume: 234567,
        marketCap: "$5.2B",
        lastUpdated: new Date()
      },
      {
        symbol: "CW",
        id: 13,
        name: "Curtiss-Wright Corporation",
        price: 452.52,
        change: 3.59,
        changePercent: 0.80,
        volume: 123456,
        marketCap: "$17.8B",
        lastUpdated: new Date()
      },
      {
        symbol: "MRCY",
        id: 14,
        name: "Mercury Systems Inc",
        price: 53.14,
        change: 1.13,
        changePercent: 2.17,
        volume: 678901,
        marketCap: "$3.1B",
        lastUpdated: new Date()
      },
      {
        symbol: "TXT",
        id: 15,
        name: "Textron Inc",
        price: 75.57,
        change: 1.07,
        changePercent: 1.44,
        volume: 987654,
        marketCap: "$15.8B",
        lastUpdated: new Date()
      },
      {
        symbol: "ITA",
        id: 16,
        name: "iShares U.S. Aerospace & Defense ETF",
        price: 181.96,
        change: 1.76,
        changePercent: 0.98,
        volume: 567890,
        marketCap: "$2.8B",
        lastUpdated: new Date()
      }
    ];

    // Initialize correlation events
    this.correlationEvents = [
      {
        id: 1,
        conflictId: 1,
        severity: 8,
        eventDate: new Date(),
        eventDescription: "Major missile strike on Ukrainian infrastructure leads to defense stock surge",
        stockMovement: 2.3
      },
      {
        id: 2,
        conflictId: 2,
        severity: 7,
        eventDate: new Date(),
        eventDescription: "Israel announces new defense contract, boosting sector confidence",
        stockMovement: 1.8
      },
      {
        id: 3,
        conflictId: 3,
        severity: 6,
        eventDate: new Date(),
        eventDescription: "Taiwan increases defense spending amid rising tensions",
        stockMovement: 1.2
      }
    ];
  }

  // Conflicts
  async getConflicts(): Promise<Conflict[]> {
    return this.conflicts;
  }

  async getConflict(id: number): Promise<Conflict | undefined> {
    return this.conflicts.find(c => c.id === id);
  }

  async createConflict(insertConflict: InsertConflict): Promise<Conflict> {
    const conflict: Conflict = {
      id: this.idCounter++,
      ...insertConflict,
      lastUpdated: new Date()
    };
    this.conflicts.push(conflict);
    return conflict;
  }

  async updateConflict(id: number, updateData: Partial<InsertConflict>): Promise<Conflict | undefined> {
    const index = this.conflicts.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    this.conflicts[index] = { ...this.conflicts[index], ...updateData, lastUpdated: new Date() };
    return this.conflicts[index];
  }

  // Stocks
  async getStocks(): Promise<Stock[]> {
    return this.stocks;
  }

  async getStock(symbol: string): Promise<Stock | undefined> {
    return this.stocks.find(s => s.symbol === symbol);
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const stock: Stock = {
      id: this.idCounter++,
      ...insertStock,
      lastUpdated: new Date()
    };
    this.stocks.push(stock);
    return stock;
  }

  async updateStock(symbol: string, updateData: Partial<InsertStock>): Promise<Stock | undefined> {
    const index = this.stocks.findIndex(s => s.symbol === symbol);
    if (index === -1) return undefined;
    
    this.stocks[index] = { ...this.stocks[index], ...updateData, lastUpdated: new Date() };
    return this.stocks[index];
  }

  // Correlation Events
  async getCorrelationEvents(): Promise<CorrelationEvent[]> {
    return this.correlationEvents;
  }

  async createCorrelationEvent(insertEvent: InsertCorrelationEvent): Promise<CorrelationEvent> {
    const event: CorrelationEvent = {
      id: this.idCounter++,
      ...insertEvent
    };
    this.correlationEvents.push(event);
    return event;
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    this.users[index] = { ...this.users[index], ...updateData, updatedAt: new Date() };
    return this.users[index];
  }

  async updateUsername(id: string, newUsername: string): Promise<User | undefined> {
    return this.updateUser(id, { username: newUsername });
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(userData.id);
    if (existingUser) {
      return await this.updateUser(userData.id, userData) || existingUser;
    } else {
      return await this.createUser(userData);
    }
  }

  // Stock Watchlists
  async getUserStockWatchlist(userId: string): Promise<StockWatchlist[]> {
    return this.stockWatchlists.filter(w => w.userId === userId);
  }

  async addStockToWatchlist(watchlist: InsertStockWatchlist): Promise<StockWatchlist> {
    const item: StockWatchlist = {
      id: this.idCounter++,
      ...watchlist,
      createdAt: new Date()
    };
    this.stockWatchlists.push(item);
    return item;
  }

  async removeStockFromWatchlist(userId: string, stockSymbol: string): Promise<void> {
    this.stockWatchlists = this.stockWatchlists.filter(
      w => !(w.userId === userId && w.stockSymbol === stockSymbol)
    );
  }

  // Conflict Watchlists
  async getUserConflictWatchlist(userId: string): Promise<ConflictWatchlist[]> {
    return this.conflictWatchlists.filter(w => w.userId === userId);
  }

  async addConflictToWatchlist(watchlist: InsertConflictWatchlist): Promise<ConflictWatchlist> {
    const item: ConflictWatchlist = {
      id: this.idCounter++,
      ...watchlist,
      createdAt: new Date()
    };
    this.conflictWatchlists.push(item);
    return item;
  }

  async removeConflictFromWatchlist(userId: string, conflictId: number): Promise<void> {
    this.conflictWatchlists = this.conflictWatchlists.filter(
      w => !(w.userId === userId && w.conflictId === conflictId)
    );
  }

  // Daily Quizzes
  async getDailyQuiz(date: string): Promise<DailyQuiz | undefined> {
    return this.dailyQuizzes.find(q => q.date === date);
  }

  async createDailyQuiz(quiz: InsertDailyQuiz): Promise<DailyQuiz> {
    const created: DailyQuiz = {
      id: this.idCounter++,
      ...quiz,
      createdAt: new Date()
    };
    this.dailyQuizzes.push(created);
    return created;
  }

  async createUserQuizResponse(response: InsertUserQuizResponse): Promise<UserQuizResponse> {
    const created: UserQuizResponse = {
      id: this.idCounter++,
      ...response,
      completedAt: new Date()
    };
    this.userQuizResponses.push(created);
    return created;
  }

  async getUserQuizResponse(userId: string, quizId: number): Promise<UserQuizResponse | undefined> {
    return this.userQuizResponses.find(r => r.userId === userId && r.quizId === quizId);
  }

  // Daily News
  async getDailyNews(date: string): Promise<DailyNews | undefined> {
    return this.dailyNewsItems.find(n => n.date === date);
  }

  async createDailyNews(news: InsertDailyNews): Promise<DailyNews> {
    const created: DailyNews = {
      id: this.idCounter++,
      ...news,
      createdAt: new Date()
    };
    this.dailyNewsItems.push(created);
    return created;
  }

  // Quiz Leaderboard
  async getDailyQuizLeaderboard(date: string): Promise<{ username: string; totalPoints: number; score: number; timeBonus: number; completedAt: Date | null }[]> {
    const quiz = this.dailyQuizzes.find(q => q.date === date);
    if (!quiz) return [];

    const responses = this.userQuizResponses
      .filter(r => r.quizId === quiz.id)
      .map(r => {
        const user = this.users.find(u => u.id === r.userId);
        return {
          username: user?.username || 'Anonymous',
          totalPoints: r.totalPoints,
          score: r.score,
          timeBonus: r.timeBonus,
          completedAt: r.completedAt
        };
      })
      .sort((a, b) => {
        if (a.totalPoints !== b.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        return (a.completedAt?.getTime() || 0) - (b.completedAt?.getTime() || 0);
      });

    return responses;
  }
}

export const storage = new MemStorage();