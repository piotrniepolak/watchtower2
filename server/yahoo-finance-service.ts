import fetch from 'node-fetch';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  peRatio: number | null;
  week52High: number;
  week52Low: number;
  avgVolume: number;
  divYield: number | null;
  eps: number | null;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockChart {
  symbol: string;
  timeRange: string;
  data: HistoricalDataPoint[];
  currency: string;
}

class YahooFinanceService {
  private readonly baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';
  private readonly quoteUrl = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary';

  /**
   * Get detailed stock quote with comprehensive financial data
   */
  async getStockQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const url = `${this.quoteUrl}/${symbol}?modules=price,summaryDetail,defaultKeyStatistics`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        console.error(`Yahoo Finance quote API error: ${response.status}`);
        return null;
      }

      const data = await response.json() as any;
      const result = data.quoteSummary?.result?.[0];
      
      if (!result) {
        console.error(`No quote data found for symbol: ${symbol}`);
        return null;
      }

      const price = result.price;
      const summaryDetail = result.summaryDetail;
      const keyStats = result.defaultKeyStatistics;

      if (!price) {
        console.error(`No price data found for symbol: ${symbol}`);
        return null;
      }

      const currentPrice = price.regularMarketPrice?.raw || price.postMarketPrice?.raw || 0;
      const previousClose = price.regularMarketPreviousClose?.raw || 0;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      return {
        symbol,
        name: price.longName || price.shortName || symbol,
        price: currentPrice,
        change,
        changePercent,
        open: price.regularMarketOpen?.raw || 0,
        high: price.regularMarketDayHigh?.raw || 0,
        low: price.regularMarketDayLow?.raw || 0,
        volume: price.regularMarketVolume?.raw || 0,
        marketCap: summaryDetail?.marketCap?.raw || 0,
        peRatio: summaryDetail?.trailingPE?.raw || null,
        week52High: summaryDetail?.fiftyTwoWeekHigh?.raw || 0,
        week52Low: summaryDetail?.fiftyTwoWeekLow?.raw || 0,
        avgVolume: summaryDetail?.averageVolume?.raw || 0,
        divYield: summaryDetail?.dividendYield?.raw ? summaryDetail.dividendYield.raw * 100 : null,
        eps: keyStats?.trailingEps?.raw || null
      };
    } catch (error) {
      console.error(`Error fetching stock quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get historical chart data for different time ranges
   */
  async getStockChart(symbol: string, timeRange: string): Promise<StockChart | null> {
    try {
      const { period1, period2, interval } = this.getTimeRangeParams(timeRange);
      const url = `${this.baseUrl}/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        console.error(`Yahoo Finance chart API error: ${response.status}`);
        return null;
      }

      const data = await response.json() as any;
      const result = data.chart?.result?.[0];
      
      if (!result) {
        console.error(`No chart data found for symbol: ${symbol}`);
        return null;
      }

      const timestamps = result.timestamp || [];
      const indicators = result.indicators?.quote?.[0];
      
      if (!indicators) {
        console.error(`No price indicators found for symbol: ${symbol}`);
        return null;
      }

      const opens = indicators.open || [];
      const highs = indicators.high || [];
      const lows = indicators.low || [];
      const closes = indicators.close || [];
      const volumes = indicators.volume || [];

      const chartData: HistoricalDataPoint[] = timestamps.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString(),
        open: opens[index] || 0,
        high: highs[index] || 0,
        low: lows[index] || 0,
        close: closes[index] || 0,
        volume: volumes[index] || 0
      })).filter((point: HistoricalDataPoint) => point.close > 0);

      return {
        symbol,
        timeRange,
        data: chartData,
        currency: result.meta?.currency || 'USD'
      };
    } catch (error) {
      console.error(`Error fetching chart data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Convert time range to Yahoo Finance API parameters
   */
  private getTimeRangeParams(timeRange: string): { period1: number, period2: number, interval: string } {
    const now = Math.floor(Date.now() / 1000);
    
    switch (timeRange) {
      case '1D':
        return {
          period1: now - (24 * 60 * 60),
          period2: now,
          interval: '5m'
        };
      case '5D':
        return {
          period1: now - (5 * 24 * 60 * 60),
          period2: now,
          interval: '15m'
        };
      case '1M':
        return {
          period1: now - (30 * 24 * 60 * 60),
          period2: now,
          interval: '1h'
        };
      case '6M':
        return {
          period1: now - (6 * 30 * 24 * 60 * 60),
          period2: now,
          interval: '1d'
        };
      case 'YTD':
        const currentYear = new Date().getFullYear();
        const startOfYear = Math.floor(new Date(currentYear, 0, 1).getTime() / 1000);
        return {
          period1: startOfYear,
          period2: now,
          interval: '1d'
        };
      case '1Y':
        return {
          period1: now - (365 * 24 * 60 * 60),
          period2: now,
          interval: '1d'
        };
      case '5Y':
        return {
          period1: now - (5 * 365 * 24 * 60 * 60),
          period2: now,
          interval: '1wk'
        };
      case 'Max':
        return {
          period1: 315532800, // 1980-01-01
          period2: now,
          interval: '1mo'
        };
      default:
        return {
          period1: now - (24 * 60 * 60),
          period2: now,
          interval: '5m'
        };
    }
  }

  /**
   * Format market cap for display
   */
  formatMarketCap(marketCap: number): string {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toLocaleString()}`;
    }
  }

  /**
   * Format large numbers for display
   */
  formatVolume(volume: number): string {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`;
    } else {
      return volume.toLocaleString();
    }
  }
}

export const yahooFinanceService = new YahooFinanceService();