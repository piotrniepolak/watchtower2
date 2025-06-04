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
  }

  private initializeConflicts() {
    const initialConflicts: InsertConflict[] = [
      {
        region: "Eastern Europe",
        name: "Ukraine-Russia",
        description: "Ongoing conflict between Ukraine and Russia",
        severity: "High",
        status: "Active",
        duration: "2 years, 3 months",
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
        duration: "4 months",
        startDate: new Date("2023-10-07"),
        latitude: 31.3547,
        longitude: 34.3088,
        parties: ["IL", "PS"],
      },
      {
        region: "South China Sea",
        name: "Maritime Dispute",
        description: "Territorial disputes in South China Sea",
        severity: "Medium",
        status: "Ongoing",
        duration: "5 years",
        startDate: new Date("2019-01-01"),
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
        duration: "1 year, 8 months",
        startDate: new Date("2022-05-01"),
        latitude: 17.570,
        longitude: -3.9962,
        parties: ["ML", "FR"],
      },
    ];

    initialConflicts.forEach(conflict => {
      this.createConflict(conflict);
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
