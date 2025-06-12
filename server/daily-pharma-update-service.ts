import { storage } from './storage';

interface NewPharmaCompany {
  symbol: string;
  name: string;
  detectedIn: string;
  context: string;
}

export class DailyPharmaUpdateService {
  private static instance: DailyPharmaUpdateService;

  public static getInstance(): DailyPharmaUpdateService {
    if (!DailyPharmaUpdateService.instance) {
      DailyPharmaUpdateService.instance = new DailyPharmaUpdateService();
    }
    return DailyPharmaUpdateService.instance;
  }

  /**
   * Process new daily pharmaceutical intelligence brief and add any new companies
   */
  async processNewBrief(briefData: any): Promise<{
    newCompaniesAdded: NewPharmaCompany[];
    totalCompaniesTracked: number;
  }> {
    console.log('🔍 Processing new Daily Pharmaceutical Intelligence Brief for company discovery...');

    // Get current pharmaceutical companies in database
    const existingStocks = await storage.getStocks();
    const existingHealthcareSymbols = new Set(
      existingStocks
        .filter(stock => stock.sector === 'Healthcare')
        .map(stock => stock.symbol)
    );

    // Extract only the actual brief text content, excluding reference URLs
    const briefTextContent = [
      briefData.title || '',
      briefData.summary || '',
      ...(Array.isArray(briefData.keyDevelopments) ? briefData.keyDevelopments : []),
      briefData.marketImpact || '',
      briefData.geopoliticalAnalysis || '',
      ...(Array.isArray(briefData.conflictUpdates) ? 
        briefData.conflictUpdates.map((update: any) => update.update || '') : [])
    ].join(' ');

    // Remove any URLs, references, and citations that might contain company names to prevent false positives
    const cleanBriefContent = briefTextContent
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/www\.[^\s]+/g, '') // Remove www domains
      .replace(/### References:[\s\S]*$/i, '') // Remove entire references section
      .replace(/- [^:]+: "[^"]*"[^\n]*/g, '') // Remove citation lines
      .replace(/\([^)]*20\d{2}[^)]*\)/g, '') // Remove date citations like (2025-06-12)
      .replace(/BioPharma Dive|STAT News|Reuters|Bloomberg/gi, '') // Remove news source names
      .toLowerCase();

    // Enhanced pharmaceutical company mapping with newly discovered patterns
    const companyToSymbolMap: Record<string, string> = {
      'nuvation bio': 'NUVB',
      'nuvation': 'NUVB',
      'bayer': 'BAYRY',
      'bayer healthcare': 'BAYRY',
      'biogen': 'BIIB',
      'eli lilly': 'LLY',
      'lilly': 'LLY',
      'gsk': 'GSK',
      'glaxosmithkline': 'GSK',
      'johnson & johnson': 'JNJ',
      'j&j': 'JNJ',
      'roche': 'RHHBY',
      'sanofi': 'SNY',
      'ultragenyx': 'RARE',
      'vertex': 'VRTX',
      'vertex pharmaceuticals': 'VRTX',
      'pfizer': 'PFE',
      'merck': 'MRK',
      'abbvie': 'ABBV',
      'novartis': 'NVS',
      'astrazeneca': 'AZN',
      'bristol myers': 'BMY',
      'bristol-myers squibb': 'BMY',
      'amgen': 'AMGN',
      'gilead': 'GILD',
      'moderna': 'MRNA',
      'regeneron': 'REGN',
      'novavax': 'NVAX',
      'solid': 'SLDB',
      'solid biosciences': 'SLDB',
      'stoke': 'STOK',
      'stoke therapeutics': 'STOK',
      // Add more comprehensive mapping for potential new companies
      'takeda': 'TAK',
      'novo nordisk': 'NVO',
      'boehringer ingelheim': 'BOEHRINGER',
      'teva': 'TEVA',
      'allergan': 'AGN',
      'celgene': 'CELG',
      'shire': 'SHPG',
      'alexion': 'ALXN',
      'incyte': 'INCY',
      'bioverativ': 'BIVV',
      'bluebird bio': 'BLUE',
      'catalyst': 'CPRX',
      'denali': 'DNLI',
      'editas': 'EDIT',
      'fate therapeutics': 'FATE',
      'genmab': 'GMAB',
      'humacyte': 'HUMA',
      'intellia': 'NTLA',
      'jounce': 'JNCE',
      'kite': 'KITE',
      'loxo': 'LOXO',
      'mirati': 'MRTX',
      'nektar': 'NKTR',
      'onyx': 'ONXX',
      'portola': 'PTLA',
      'qiagen': 'QGEN',
      'regenxbio': 'RGNX',
      'sangamo': 'SGMO',
      'translate bio': 'TBIO',
      'uniqure': 'QURE',
      'veracyte': 'VCYT',
      'wave life': 'WVE',
      'xynomic': 'XYN',
      'zogenix': 'ZGNX'
    };

    // Detect all mentioned pharmaceutical companies
    const mentionedSymbols = new Set<string>();

    // Search through cleaned text content for company mentions (excluding URLs)
    Object.entries(companyToSymbolMap).forEach(([companyName, symbol]) => {
      const regex = new RegExp(`\\b${companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(cleanBriefContent)) {
        mentionedSymbols.add(symbol);
        console.log(`📊 Detected pharmaceutical company: ${companyName} -> ${symbol}`);
      }
    });

    // Identify new companies not yet in database
    const newCompanies: NewPharmaCompany[] = [];
    
    for (const symbol of Array.from(mentionedSymbols)) {
      if (!existingHealthcareSymbols.has(symbol)) {
        // Find the company name that mapped to this symbol
        const companyName = Object.keys(companyToSymbolMap).find(key => 
          companyToSymbolMap[key] === symbol
        );
        
        if (companyName) {
          newCompanies.push({
            symbol,
            name: this.formatCompanyName(companyName),
            detectedIn: briefData.title || 'Daily Pharmaceutical Intelligence Brief',
            context: this.extractContext(cleanBriefContent, companyName)
          });
        }
      }
    }

    // Add new companies to the database
    for (const newCompany of newCompanies) {
      try {
        await this.addCompanyToDatabase(newCompany);
        console.log(`✅ Added new pharmaceutical company: ${newCompany.symbol} - ${newCompany.name}`);
      } catch (error) {
        console.error(`❌ Failed to add company ${newCompany.symbol}:`, error);
      }
    }

    const totalTracked = existingHealthcareSymbols.size + newCompanies.length;

    console.log(`🎯 Daily pharmaceutical update complete:`);
    console.log(`   - New companies added: ${newCompanies.length}`);
    console.log(`   - Total companies tracked: ${totalTracked}`);

    return {
      newCompaniesAdded: newCompanies,
      totalCompaniesTracked: totalTracked
    };
  }

  /**
   * Add a new pharmaceutical company to the database
   */
  private async addCompanyToDatabase(company: NewPharmaCompany): Promise<void> {
    // First try to get current market data for the company
    let price = 0;
    let change = 0;
    let changePercent = 0;

    try {
      const marketData = await this.fetchMarketData(company.symbol);
      price = marketData.price;
      change = marketData.change;
      changePercent = marketData.changePercent;
    } catch (error) {
      console.log(`📊 No market data available for ${company.symbol}, adding as unlisted company`);
    }

    // Add to database using storage service
    const newStock = {
      symbol: company.symbol,
      name: company.name,
      sector: 'Healthcare' as const,
      price,
      change,
      changePercent,
      volume: 0,
      marketCap: price > 0 ? 'N/A' : 'Private/Unlisted',
      lastUpdated: new Date()
    };

    await storage.createStock(newStock);
  }

  /**
   * Fetch current market data for a stock symbol
   */
  private async fetchMarketData(symbol: string): Promise<{
    price: number;
    change: number;
    changePercent: number;
  }> {
    const fetch = (await import('node-fetch')).default;
    
    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
      
      if (!response.ok) {
        throw new Error(`Yahoo Finance API returned ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (data.chart?.result?.[0]?.meta) {
        const meta = data.chart.result[0].meta;
        const currentPrice = meta.regularMarketPrice || 0;
        const previousClose = meta.previousClose || currentPrice;
        const change = currentPrice - previousClose;
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

        return {
          price: currentPrice,
          change,
          changePercent
        };
      }

      throw new Error('Invalid response format from Yahoo Finance');
    } catch (error) {
      throw new Error(`Failed to fetch market data for ${symbol}: ${error}`);
    }
  }

  /**
   * Format company name for display
   */
  private formatCompanyName(companyName: string): string {
    return companyName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Extract context around company mention
   */
  private extractContext(text: string, companyName: string): string {
    const regex = new RegExp(`(.{0,100}\\b${companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b.{0,100})`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : 'Mentioned in pharmaceutical intelligence brief';
  }

  /**
   * Schedule daily updates (called when new brief is generated)
   */
  async scheduleDailyUpdate(briefData: any): Promise<void> {
    try {
      const result = await this.processNewBrief(briefData);
      
      if (result.newCompaniesAdded.length > 0) {
        console.log(`🚀 Daily pharmaceutical database update: ${result.newCompaniesAdded.length} new companies added`);
        
        // Log new companies for monitoring
        result.newCompaniesAdded.forEach(company => {
          console.log(`   + ${company.symbol}: ${company.name}`);
        });
      } else {
        console.log(`✅ Daily pharmaceutical database update: No new companies detected`);
      }
    } catch (error) {
      console.error('❌ Daily pharmaceutical update failed:', error);
    }
  }
}

export const dailyPharmaUpdateService = DailyPharmaUpdateService.getInstance();