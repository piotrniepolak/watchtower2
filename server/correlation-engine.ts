import { SectorConfig } from "@shared/sectors";

export interface CorrelationData {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface CorrelationResult {
  strength: number;
  confidence: number;
  lag: number;
  pValue: number;
  method: string;
  dataPoints: number;
  timeSeries: Array<{
    date: Date;
    eventValue: number;
    stockValue: number;
    correlation: number;
  }>;
}

export interface CorrelationParams {
  lookbackDays: number;
  method: 'pearson' | 'crossCorrelation' | 'leadLag';
  minDataPoints?: number;
  maxLag?: number;
}

export class CorrelationEngine {
  
  async correlate(
    eventData: CorrelationData[],
    stockData: CorrelationData[],
    params: CorrelationParams
  ): Promise<CorrelationResult> {
    
    // Filter data to lookback period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - params.lookbackDays);
    
    const filteredEvents = eventData.filter(d => d.timestamp >= cutoffDate);
    const filteredStocks = stockData.filter(d => d.timestamp >= cutoffDate);
    
    if (filteredEvents.length < (params.minDataPoints || 5) || 
        filteredStocks.length < (params.minDataPoints || 5)) {
      throw new Error('Insufficient data points for correlation analysis');
    }

    switch (params.method) {
      case 'pearson':
        return this.calculatePearsonCorrelation(filteredEvents, filteredStocks, params);
      case 'crossCorrelation':
        return this.calculateCrossCorrelation(filteredEvents, filteredStocks, params);
      case 'leadLag':
        return this.calculateLeadLagCorrelation(filteredEvents, filteredStocks, params);
      default:
        throw new Error(`Unsupported correlation method: ${params.method}`);
    }
  }

  private calculatePearsonCorrelation(
    eventData: CorrelationData[],
    stockData: CorrelationData[],
    params: CorrelationParams
  ): CorrelationResult {
    
    // Align data by timestamp (daily granularity)
    const alignedData = this.alignDataByDay(eventData, stockData);
    
    if (alignedData.length < 2) {
      throw new Error('Insufficient aligned data points');
    }

    const eventValues = alignedData.map(d => d.eventValue);
    const stockValues = alignedData.map(d => d.stockValue);
    
    const correlation = this.pearsonCorrelation(eventValues, stockValues);
    const pValue = this.calculatePValue(correlation, alignedData.length);
    
    return {
      strength: Math.abs(correlation),
      confidence: 1 - pValue,
      lag: 0,
      pValue,
      method: 'pearson',
      dataPoints: alignedData.length,
      timeSeries: alignedData.map(d => ({
        ...d,
        correlation
      }))
    };
  }

  private calculateCrossCorrelation(
    eventData: CorrelationData[],
    stockData: CorrelationData[],
    params: CorrelationParams
  ): CorrelationResult {
    
    const maxLag = params.maxLag || 14; // Default 14 days max lag
    const alignedData = this.alignDataByDay(eventData, stockData);
    
    let bestCorrelation = 0;
    let bestLag = 0;
    let bestPValue = 1;
    
    // Test different lag periods
    for (let lag = 0; lag <= maxLag; lag++) {
      const laggedData = this.applyLag(alignedData, lag);
      
      if (laggedData.length < 2) continue;
      
      const eventValues = laggedData.map(d => d.eventValue);
      const stockValues = laggedData.map(d => d.stockValue);
      
      const correlation = this.pearsonCorrelation(eventValues, stockValues);
      const pValue = this.calculatePValue(correlation, laggedData.length);
      
      if (Math.abs(correlation) > Math.abs(bestCorrelation)) {
        bestCorrelation = correlation;
        bestLag = lag;
        bestPValue = pValue;
      }
    }
    
    return {
      strength: Math.abs(bestCorrelation),
      confidence: 1 - bestPValue,
      lag: bestLag,
      pValue: bestPValue,
      method: 'crossCorrelation',
      dataPoints: alignedData.length,
      timeSeries: alignedData.map(d => ({
        ...d,
        correlation: bestCorrelation
      }))
    };
  }

  private calculateLeadLagCorrelation(
    eventData: CorrelationData[],
    stockData: CorrelationData[],
    params: CorrelationParams
  ): CorrelationResult {
    
    // Similar to cross-correlation but focuses on lead-lag relationships
    const maxLag = params.maxLag || 21; // Default 21 days for energy sector
    const alignedData = this.alignDataByDay(eventData, stockData);
    
    const results: Array<{lag: number, correlation: number, pValue: number}> = [];
    
    // Test both positive and negative lags
    for (let lag = -maxLag; lag <= maxLag; lag++) {
      const laggedData = this.applyLag(alignedData, lag);
      
      if (laggedData.length < 2) continue;
      
      const eventValues = laggedData.map(d => d.eventValue);
      const stockValues = laggedData.map(d => d.stockValue);
      
      const correlation = this.pearsonCorrelation(eventValues, stockValues);
      const pValue = this.calculatePValue(correlation, laggedData.length);
      
      results.push({ lag, correlation, pValue });
    }
    
    // Find the lag with strongest correlation
    const bestResult = results.reduce((best, current) => 
      Math.abs(current.correlation) > Math.abs(best.correlation) ? current : best
    );
    
    return {
      strength: Math.abs(bestResult.correlation),
      confidence: 1 - bestResult.pValue,
      lag: bestResult.lag,
      pValue: bestResult.pValue,
      method: 'leadLag',
      dataPoints: alignedData.length,
      timeSeries: alignedData.map(d => ({
        ...d,
        correlation: bestResult.correlation
      }))
    };
  }

  private alignDataByDay(
    eventData: CorrelationData[],
    stockData: CorrelationData[]
  ): Array<{date: Date, eventValue: number, stockValue: number}> {
    
    const eventsByDay = new Map<string, number>();
    const stocksByDay = new Map<string, number>();
    
    // Group by day
    eventData.forEach(d => {
      const dayKey = d.timestamp.toISOString().split('T')[0];
      eventsByDay.set(dayKey, (eventsByDay.get(dayKey) || 0) + d.value);
    });
    
    stockData.forEach(d => {
      const dayKey = d.timestamp.toISOString().split('T')[0];
      stocksByDay.set(dayKey, d.value); // Use latest value for the day
    });
    
    // Find common dates
    const commonDates = Array.from(eventsByDay.keys())
      .filter(date => stocksByDay.has(date))
      .sort();
    
    return commonDates.map(date => ({
      date: new Date(date),
      eventValue: eventsByDay.get(date)!,
      stockValue: stocksByDay.get(date)!
    }));
  }

  private applyLag(
    data: Array<{date: Date, eventValue: number, stockValue: number}>,
    lag: number
  ): Array<{date: Date, eventValue: number, stockValue: number}> {
    
    if (lag === 0) return data;
    
    if (lag > 0) {
      // Positive lag: events lead stocks
      return data.slice(0, -lag).map((d, i) => ({
        date: d.date,
        eventValue: d.eventValue,
        stockValue: data[i + lag].stockValue
      }));
    } else {
      // Negative lag: stocks lead events
      return data.slice(-lag).map((d, i) => ({
        date: d.date,
        eventValue: data[i - lag].eventValue,
        stockValue: d.stockValue
      }));
    }
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    
    if (n !== y.length || n === 0) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculatePValue(correlation: number, n: number): number {
    // Simplified p-value calculation for correlation
    // Using t-distribution approximation
    if (n <= 2) return 1;
    
    const t = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
    
    // Simplified p-value approximation
    const df = n - 2;
    const absT = Math.abs(t);
    
    // Very basic approximation - in production, use proper statistical library
    if (absT > 2.576) return 0.01;  // 99% confidence
    if (absT > 1.96) return 0.05;   // 95% confidence
    if (absT > 1.645) return 0.10;  // 90% confidence
    
    return 0.5; // Low confidence
  }
}

export const correlationEngine = new CorrelationEngine();