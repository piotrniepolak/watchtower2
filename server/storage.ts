import { conflicts, stocks, correlationEvents, type Conflict, type Stock, type CorrelationEvent, type InsertConflict, type InsertStock, type InsertCorrelationEvent } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private conflicts: Map<number, Conflict>;
  private stocks: Map<string, Stock>;
  private correlationEvents: Map<number, CorrelationEvent>;
  private currentConflictId: number;
  private currentCorrelationId: number;

  constructor() {
    this.conflicts = new Map();
    this.stocks = new Map();
    this.correlationEvents = new Map();
    this.currentConflictId = 1;
    this.currentCorrelationId = 1;
    
    // Initialize with some conflict data
    this.initializeConflicts();
    this.initializeStocks();
  }

  private initializeConflicts() {
    const initialConflicts: InsertConflict[] = [
      {
        region: "Eastern Europe",
        name: "Ukraine-Russia",
        description: "Ongoing conflict between Ukraine and Russia",
        severity: "High",
        status: "Active",
        duration: "2 years, 9 months",
        startDate: new Date("2022-02-24"),
        latitude: 50.4501,
        longitude: 30.5234,
        parties: ["UA", "RU"],
      },
      {
        region: "Middle East",
        name: "Israel-Gaza",
        description: "Conflict in Gaza Strip",
        severity: "High",
        status: "Active",
        duration: "8 months",
        startDate: new Date("2023-10-07"),
        latitude: 31.3547,
        longitude: 34.3088,
        parties: ["IL", "PS"],
      },
      {
        region: "South China Sea",
        name: "South China Sea Dispute",
        description: "Territorial disputes in South China Sea",
        severity: "Medium",
        status: "Ongoing",
        duration: "Decades",
        startDate: new Date("2009-01-01"),
        latitude: 16.0, 
        longitude: 114.0,
        parties: ["CN", "PH", "VN", "MY"],
      },
      {
        region: "West Africa",
        name: "Mali Crisis",
        description: "Political and security crisis in Mali",
        severity: "Medium",
        status: "Ongoing",
        duration: "12+ years",
        startDate: new Date("2012-01-01"),
        latitude: 17.570,
        longitude: -3.9962,
        parties: ["ML", "FR"],
      },
      {
        region: "East Africa",
        name: "Ethiopia-Tigray",
        description: "Armed conflict in northern Ethiopia",
        severity: "High",
        status: "Ceasefire",
        duration: "2+ years",
        startDate: new Date("2020-11-04"),
        latitude: 14.2700,
        longitude: 38.2700,
        parties: ["ET", "TG"],
      },
      {
        region: "West Africa", 
        name: "Burkina Faso Insurgency",
        description: "Islamist insurgency in Burkina Faso",
        severity: "High",
        status: "Active",
        duration: "8+ years",
        startDate: new Date("2015-01-01"),
        latitude: 12.2383,
        longitude: -1.5616,
        parties: ["BF", "IS"],
      },
      {
        region: "Central Africa",
        name: "Democratic Republic Congo",
        description: "Armed conflicts in eastern DRC",
        severity: "High",
        status: "Active",
        duration: "25+ years",
        startDate: new Date("1998-08-02"),
        latitude: -4.0383,
        longitude: 21.7587,
        parties: ["CD", "RW", "UG"],
      },
      {
        region: "South Asia",
        name: "Kashmir Conflict",
        description: "Territorial dispute over Kashmir region",
        severity: "Medium",
        status: "Ongoing",
        duration: "76+ years",
        startDate: new Date("1947-10-22"),
        latitude: 34.0837,
        longitude: 74.7973,
        parties: ["IN", "PK"],
      },
      {
        region: "Middle East",
        name: "Syria Civil War",
        description: "Ongoing multi-sided civil war in Syria",
        severity: "Medium",
        status: "Low-intensity",
        duration: "13+ years",
        startDate: new Date("2011-03-15"),
        latitude: 34.8021,
        longitude: 38.9968,
        parties: ["SY", "TR", "US"],
      },
      {
        region: "Middle East",
        name: "Yemen Civil War",
        description: "Ongoing civil war in Yemen",
        severity: "High",
        status: "Active",
        duration: "9+ years",
        startDate: new Date("2014-09-21"),
        latitude: 15.5527,
        longitude: 48.5164,
        parties: ["YE", "SA"],
      },
      {
        region: "East Asia",
        name: "Taiwan Strait Tensions",
        description: "Cross-strait tensions between China and Taiwan",
        severity: "Medium",
        status: "Ongoing",
        duration: "75+ years",
        startDate: new Date("1949-12-07"),
        latitude: 23.8103,
        longitude: 120.9675,
        parties: ["CN", "TW"],
      },
      {
        region: "Central Asia",
        name: "Afghanistan Taliban",
        description: "Taliban control and insurgent activities",
        severity: "Medium",
        status: "Post-conflict",
        duration: "20+ years",
        startDate: new Date("2001-10-07"),
        latitude: 33.9391,
        longitude: 67.7100,
        parties: ["AF", "TB"],
      },
      {
        region: "West Africa",
        name: "Nigeria Boko Haram",
        description: "Boko Haram insurgency in northeast Nigeria",
        severity: "High",
        status: "Active",
        duration: "14+ years",
        startDate: new Date("2009-07-26"),
        latitude: 9.0820,
        longitude: 8.6753,
        parties: ["NG", "BH"],
      },
      {
        region: "Horn of Africa",
        name: "Somalia Al-Shabaab",
        description: "Al-Shabaab insurgency in Somalia",
        severity: "High",
        status: "Active",
        duration: "17+ years",
        startDate: new Date("2006-06-05"),
        latitude: 5.1521,
        longitude: 46.1996,
        parties: ["SO", "AS"],
      },
      {
        region: "Southeast Asia",
        name: "Myanmar Civil War",
        description: "Civil war following military coup",
        severity: "High",
        status: "Active",
        duration: "3+ years",
        startDate: new Date("2021-02-01"),
        latitude: 19.7633,
        longitude: 96.0785,
        parties: ["MM", "NUG"],
      },
      {
        region: "South America",
        name: "Colombia-Venezuela Border",
        description: "Border tensions and migration crisis",
        severity: "Low",
        status: "Ongoing",
        duration: "5+ years",
        startDate: new Date("2019-01-01"),
        latitude: 7.8939,
        longitude: -72.5078,
        parties: ["CO", "VE"],
      }
    ];

    initialConflicts.forEach(conflict => {
      this.createConflict(conflict);
    });
  }

  private initializeStocks() {
    const initialStocks: InsertStock[] = [
      {
        symbol: "LMT",
        name: "Lockheed Martin Corporation",
        price: 480.17,
        change: 1.35,
        changePercent: 0.2819,
        volume: 1032298,
        marketCap: "$125.2B",
      },
      {
        symbol: "RTX",
        name: "Raytheon Technologies Corporation", 
        price: 137.5,
        change: 0.04,
        changePercent: 0.0291,
        volume: 3493879,
        marketCap: "$198.4B",
      },
      {
        symbol: "NOC",
        name: "Northrop Grumman Corporation",
        price: 488.22,
        change: 4.84,
        changePercent: 1.0013,
        volume: 578461,
        marketCap: "$74.8B",
      },
      {
        symbol: "GD", 
        name: "General Dynamics Corporation",
        price: 276.04,
        change: 0.33,
        changePercent: 0.1197,
        volume: 1051028,
        marketCap: "$75.9B",
      },
      {
        symbol: "BA",
        name: "The Boeing Company",
        price: 213.43,
        change: 1.96,
        changePercent: 0.9268,
        volume: 8106080,
        marketCap: "$128.7B",
      },
      {
        symbol: "HII",
        name: "Huntington Ingalls Industries",
        price: 298.75,
        change: 2.18,
        changePercent: 0.7355,
        volume: 245680,
        marketCap: "$12.1B",
      },
      {
        symbol: "LHX",
        name: "L3Harris Technologies",
        price: 219.84,
        change: 1.42,
        changePercent: 0.6508,
        volume: 892347,
        marketCap: "$40.3B",
      },
      {
        symbol: "TDG",
        name: "TransDigm Group",
        price: 1186.92,
        change: 8.67,
        changePercent: 0.7361,
        volume: 178923,
        marketCap: "$69.2B",
      },
      {
        symbol: "LDOS",
        name: "Leidos Holdings",
        price: 148.33,
        change: 0.98,
        changePercent: 0.6650,
        volume: 567234,
        marketCap: "$20.1B",
      },
      {
        symbol: "CACI",
        name: "CACI International",
        price: 445.67,
        change: 3.21,
        changePercent: 0.7258,
        volume: 134567,
        marketCap: "$10.8B",
      },
      {
        symbol: "SAIC",
        name: "Science Applications International",
        price: 134.22,
        change: 1.05,
        changePercent: 0.7881,
        volume: 298765,
        marketCap: "$7.5B",
      },
      {
        symbol: "KTOS",
        name: "Kratos Defense & Security Solutions",
        price: 17.89,
        change: 0.23,
        changePercent: 1.3025,
        volume: 1234567,
        marketCap: "$2.2B",
      }
    ];

    initialStocks.forEach(stock => {
      this.createStock(stock);
    });
  }

  async getConflicts(): Promise<Conflict[]> {
    return Array.from(this.conflicts.values());
  }

  async getConflict(id: number): Promise<Conflict | undefined> {
    return this.conflicts.get(id);
  }

  async createConflict(insertConflict: InsertConflict): Promise<Conflict> {
    const id = this.currentConflictId++;
    const conflict: Conflict = {
      id,
      region: insertConflict.region,
      name: insertConflict.name,
      description: insertConflict.description || null,
      severity: insertConflict.severity,
      status: insertConflict.status,
      duration: insertConflict.duration,
      startDate: insertConflict.startDate,
      lastUpdated: new Date(),
      latitude: insertConflict.latitude || null,
      longitude: insertConflict.longitude || null,
      parties: insertConflict.parties || null,
    };
    this.conflicts.set(id, conflict);
    return conflict;
  }

  async updateConflict(id: number, updateData: Partial<InsertConflict>): Promise<Conflict | undefined> {
    const existing = this.conflicts.get(id);
    if (!existing) return undefined;
    
    const updated: Conflict = {
      ...existing,
      ...updateData,
      lastUpdated: new Date(),
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
      symbol: insertStock.symbol,
      name: insertStock.name,
      price: insertStock.price,
      change: insertStock.change,
      changePercent: insertStock.changePercent,
      volume: insertStock.volume,
      marketCap: insertStock.marketCap || null,
      lastUpdated: new Date(),
    };
    this.stocks.set(insertStock.symbol, stock);
    return stock;
  }

  async updateStock(symbol: string, updateData: Partial<InsertStock>): Promise<Stock | undefined> {
    const existing = this.stocks.get(symbol);
    if (!existing) return undefined;
    
    const updated: Stock = {
      ...existing,
      ...updateData,
      lastUpdated: new Date(),
    };
    this.stocks.set(symbol, updated);
    return updated;
  }

  async getCorrelationEvents(): Promise<CorrelationEvent[]> {
    return Array.from(this.correlationEvents.values());
  }

  async createCorrelationEvent(insertEvent: InsertCorrelationEvent): Promise<CorrelationEvent> {
    const id = this.currentCorrelationId++;
    const event: CorrelationEvent = {
      id,
      conflictId: insertEvent.conflictId || null,
      eventDate: insertEvent.eventDate,
      eventDescription: insertEvent.eventDescription,
      stockMovement: insertEvent.stockMovement,
      severity: insertEvent.severity,
    };
    this.correlationEvents.set(id, event);
    return event;
  }
}

export const storage = new MemStorage();
