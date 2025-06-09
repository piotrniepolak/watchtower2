export interface SectorConfig {
  key: string;
  label: string;
  description: string;
  icon: string;
  primaryColor: string;
  dataSources: {
    events: {
      name: string;
      description: string;
      endpoint?: string;
    };
    stocks: {
      name: string;
      description: string;
      tickers: string[];
    };
  };
  correlationParams: {
    lookbackDays: number;
    method: string;
    updateFrequency: string;
  };
  pages: string[];
  enabled: boolean;
}

export const sectors: Record<string, SectorConfig> = {
  defense: {
    key: 'defense',
    label: 'Global Conflicts & Defense',
    description: 'Track geopolitical conflicts and their impact on defense contractor stocks',
    icon: 'Shield',
    primaryColor: '#DC2626',
    dataSources: {
      events: {
        name: 'Geopolitical Conflicts',
        description: 'Real-time conflict monitoring and escalation tracking',
        endpoint: '/api/conflicts'
      },
      stocks: {
        name: 'Defense Contractors',
        description: 'Major defense and aerospace companies',
        tickers: ['LMT', 'RTX', 'NOC', 'GD', 'BA', 'LDOS', 'LHX', 'HWM', 'KTOS', 'AVAV', 'CW', 'MRCY', 'TXT', 'RHM.DE', 'BA.L', 'ITA']
      }
    },
    correlationParams: {
      lookbackDays: 30,
      method: 'pearson',
      updateFrequency: 'real-time'
    },
    pages: ['dashboard', 'conflicts', 'markets', 'ai-analysis', 'timeline', 'lobbying'],
    enabled: true
  },
  health: {
    key: 'health',
    label: 'Global Health & Pharmaceuticals',
    description: 'Monitor disease outbreaks and health crises impact on pharmaceutical companies',
    icon: 'Heart',
    primaryColor: '#059669',
    dataSources: {
      events: {
        name: 'Disease Outbreaks & Health Crises',
        description: 'WHO alerts, CDC reports, and global health emergencies',
        endpoint: '/api/health-events'
      },
      stocks: {
        name: 'Pharmaceutical Companies',
        description: 'Major pharmaceutical and biotech companies',
        tickers: ['PFE', 'JNJ', 'MRNA', 'NVAX', 'GILD', 'REGN', 'AMGN', 'BIIB', 'VRTX', 'BMY']
      }
    },
    correlationParams: {
      lookbackDays: 14,
      method: 'crossCorrelation',
      updateFrequency: 'daily'
    },
    pages: ['dashboard', 'health-events', 'markets', 'ai-analysis', 'timeline', 'research'],
    enabled: true
  },
  energy: {
    key: 'energy',
    label: 'Oil & Gas Regulations',
    description: 'Track energy policy changes and regulatory impact on oil & gas companies',
    icon: 'Zap',
    primaryColor: '#EA580C',
    dataSources: {
      events: {
        name: 'Energy Regulations & Policy',
        description: 'EIA reports, OPEC decisions, and regulatory changes',
        endpoint: '/api/energy-events'
      },
      stocks: {
        name: 'Energy Companies',
        description: 'Major oil, gas, and energy companies',
        tickers: ['XOM', 'CVX', 'COP', 'EOG', 'SLB', 'HAL', 'BKR', 'MPC', 'VLO', 'PSX', 'KMI', 'OKE', 'NEE', 'SO']
      }
    },
    correlationParams: {
      lookbackDays: 21,
      method: 'leadLag',
      updateFrequency: 'daily'
    },
    pages: ['dashboard', 'regulations', 'markets', 'ai-analysis', 'timeline', 'policy'],
    enabled: true
  }
};

export function getSector(key: string): SectorConfig | undefined {
  return sectors[key];
}

export function getActiveSectors(): SectorConfig[] {
  return Object.values(sectors).filter(sector => sector.enabled);
}

export function getSectorByTicker(ticker: string): SectorConfig | undefined {
  return Object.values(sectors).find(sector => 
    sector.dataSources.stocks.tickers.includes(ticker)
  );
}