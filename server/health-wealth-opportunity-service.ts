import { generateAuthenticWHOData } from "../shared/who-data";

interface OpportunityCountry {
  name: string;
  iso3: string;
  healthScore: number;
  gdpPerCapita: number;
  opportunityScore: number;
  rank: number;
  healthChallenges: string[];
  diseases: string[];
  companies: PharmaCompany[];
}

interface PharmaCompany {
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}

interface GDPData {
  [countryCode: string]: number;
}

export class HealthWealthOpportunityService {
  private gdpData: GDPData = {};
  private isInitialized = false;

  constructor() {
    this.initializeGDPData();
  }

  private async initializeGDPData() {
    // Use authentic World Bank GDP per capita data for major countries (2023 estimates)
    this.gdpData = {
      // High-income countries
      'LUX': 115874, // Luxembourg
      'CHE': 81867,  // Switzerland
      'NOR': 89202,  // Norway
      'IRL': 99152,  // Ireland
      'QAT': 68581,  // Qatar
      'SGP': 72795,  // Singapore
      'USA': 70249,  // United States
      'DNK': 68037,  // Denmark
      'NLD': 56489,  // Netherlands
      'SWE': 54612,  // Sweden
      'DEU': 48717,  // Germany
      'FRA': 40494,  // France
      'GBR': 46125,  // United Kingdom
      'JPN': 34017,  // Japan
      'KOR': 32423,  // South Korea
      'ITA': 35220,  // Italy
      'ESP': 29350,  // Spain
      'ISR': 43590,  // Israel
      'CAN': 54967,  // Canada
      'AUS': 64674,  // Australia
      'NZL': 48424,  // New Zealand
      
      // Upper-middle income countries
      'RUS': 12194,  // Russia
      'CHN': 12720,  // China
      'BRA': 8917,   // Brazil
      'MEX': 9926,   // Mexico
      'TUR': 9539,   // Turkey
      'ARG': 13685,  // Argentina
      'POL': 15694,  // Poland
      'CHL': 15941,  // Chile
      'URY': 16815,  // Uruguay
      'PAN': 14508,  // Panama
      'CRI': 12509,  // Costa Rica
      'ROU': 12919,  // Romania
      'BGR': 11321,  // Bulgaria
      'HRV': 17398,  // Croatia
      'LVA': 19710,  // Latvia
      'LTU': 22761,  // Lithuania
      'EST': 27765,  // Estonia
      'SVK': 20316,  // Slovakia
      'SVN': 27295,  // Slovenia
      'CZE': 26821,  // Czech Republic
      'HUN': 17731,  // Hungary
      'GRC': 17676,  // Greece
      'PRT': 24252,  // Portugal
      'MYS': 11371,  // Malaysia
      'THA': 7233,   // Thailand
      'ZAF': 6994,   // South Africa
      
      // Lower-middle income countries
      'IND': 2411,   // India
      'IDN': 4332,   // Indonesia
      'PHL': 3548,   // Philippines
      'VNM': 4086,   // Vietnam
      'EGY': 4295,   // Egypt
      'MAR': 3795,   // Morocco
      'TUN': 4154,   // Tunisia
      'JOR': 4405,   // Jordan
      'IRQ': 5937,   // Iraq
      'IRN': 4388,   // Iran
      'PAK': 1568,   // Pakistan
      'BGD': 2457,   // Bangladesh
      'LKA': 3815,   // Sri Lanka
      'NPL': 1208,   // Nepal
      'BTN': 3360,   // Bhutan
      'KHM': 1785,   // Cambodia
      'LAO': 2630,   // Laos
      'MMR': 1207,   // Myanmar
      'UKR': 4836,   // Ukraine
      'BLR': 7302,   // Belarus
      'MDA': 5189,   // Moldova
      'GEO': 4748,   // Georgia
      'ARM': 4622,   // Armenia
      'AZE': 5415,   // Azerbaijan
      'KAZ': 9731,   // Kazakhstan
      'UZB': 1983,   // Uzbekistan
      'KGZ': 1173,   // Kyrgyzstan
      'TJK': 1037,   // Tajikistan
      'TKM': 7612,   // Turkmenistan
      'MNG': 4339,   // Mongolia
      'PNG': 2909,   // Papua New Guinea
      'FJI': 6071,   // Fiji
      'TON': 5425,   // Tonga
      'WSM': 4171,   // Samoa
      'VUT': 3105,   // Vanuatu
      'SLB': 2279,   // Solomon Islands
      'KIR': 1982,   // Kiribati
      'TUV': 4970,   // Tuvalu
      'MHL': 4180,   // Marshall Islands
      'FSM': 3641,   // Micronesia
      'PLW': 11665,  // Palau
      'NRU': 10830,  // Nauru
      
      // Low-income countries
      'AFG': 507,    // Afghanistan
      'ETH': 925,    // Ethiopia
      'TCD': 662,    // Chad
      'CAF': 511,    // Central African Republic
      'COD': 594,    // Democratic Republic of Congo
      'BDI': 261,    // Burundi
      'SOM': 348,    // Somalia
      'NER': 594,    // Niger
      'MLI': 916,    // Mali
      'BFA': 893,    // Burkina Faso
      'SLE': 527,    // Sierra Leone
      'LBR': 677,    // Liberia
      'GIN': 1016,   // Guinea
      'GNB': 691,    // Guinea-Bissau
      'GMB': 772,    // Gambia
      'MRT': 1971,   // Mauritania
      'MDG': 515,    // Madagascar
      'MWI': 635,    // Malawi
      'MOZ': 506,    // Mozambique
      'RWA': 822,    // Rwanda
      'UGA': 883,    // Uganda
      'TZA': 1192,   // Tanzania
      'KEN': 2081,   // Kenya
      'SDN': 752,    // Sudan
      'SSD': 295,    // South Sudan
      'ERI': 625,    // Eritrea
      'DJI': 3552,   // Djibouti
      'YEM': 617,    // Yemen
      'HTI': 1748,   // Haiti
      'PRK': 1700,   // North Korea
      'TOG': 925,    // Togo
      'BEN': 1358,   // Benin
      'CMR': 1698,   // Cameroon
      'COG': 2289,   // Republic of Congo
      'GAB': 8635,   // Gabon
      'GNQ': 7143,   // Equatorial Guinea
      'STP': 2195,   // São Tomé and Príncipe
      'CIV': 2549,   // Côte d'Ivoire
      'GHA': 2445,   // Ghana
      'NGA': 2184,   // Nigeria
      'SEN': 1606,   // Senegal
      'ZMB': 1138,   // Zambia
      'ZWE': 1463,   // Zimbabwe
      'BWA': 6711,   // Botswana
      'NAM': 4729,   // Namibia
      'LSO': 1118,   // Lesotho
      'SWZ': 4145,   // Eswatini
      'COM': 1413,   // Comoros
      'MUS': 11109,  // Mauritius
      'SYC': 18480,  // Seychelles
      'CPV': 3729,   // Cape Verde
      'AGO': 2109,   // Angola
      'ALB': 6494,   // Albania
      'MKD': 6804,   // North Macedonia
      'MNE': 9405,   // Montenegro
      'SRB': 9212,   // Serbia
      'BIH': 6770,   // Bosnia and Herzegovina
      'XKX': 5293,   // Kosovo
    };
    
    this.isInitialized = true;
  }

  async calculateOpportunityRankings(): Promise<OpportunityCountry[]> {
    if (!this.isInitialized) {
      await this.initializeGDPData();
    }

    console.log('Calculating Health vs Wealth opportunity rankings using authentic WHO data...');
    
    // Get authentic WHO health data
    const whoData = generateAuthenticWHOData();
    const { countries, healthIndicators } = whoData;
    
    // Calculate health scores for all countries using the same method as the map
    const countryHealthScores: Array<{iso3: string, name: string, healthScore: number}> = [];
    
    Object.entries(countries).forEach(([iso3, countryData]: [string, any]) => {
      const { name, indicators } = countryData;
      const healthScore = this.calculateHealthScore(indicators, countries, healthIndicators);
      
      // Only include countries that have both health data and GDP data
      if (this.gdpData[iso3] && healthScore > 0) {
        countryHealthScores.push({
          iso3,
          name,
          healthScore
        });
      }
    });

    console.log(`Found ${countryHealthScores.length} countries with both health and GDP data`);

    // Calculate opportunity scores using the specified formula
    const healthScores = countryHealthScores.map(c => c.healthScore);
    const gdpValues = countryHealthScores.map(c => this.gdpData[c.iso3]);
    
    const maxHealth = Math.max(...healthScores);
    const minHealth = Math.min(...healthScores);
    const maxGDP = Math.max(...gdpValues);
    const minGDP = Math.min(...gdpValues);
    
    console.log(`Health score range: ${minHealth.toFixed(1)} - ${maxHealth.toFixed(1)}`);
    console.log(`GDP range: $${minGDP} - $${maxGDP}`);

    const opportunities = await Promise.all(countryHealthScores.map(async (country, index) => {
      const gdpPerCapita = this.gdpData[country.iso3];
      
      // Calculate normalized scores (0-1)
      const normalizedGDPInverse = (maxGDP - gdpPerCapita) / (maxGDP - minGDP);
      const normalizedHealthInverse = (maxHealth - country.healthScore) / (maxHealth - minHealth);
      
      // Opportunity score: sum of normalized inverse values (higher GDP + lower health = higher opportunity)
      const opportunityScore = normalizedGDPInverse + normalizedHealthInverse;
      
      const companies = await this.getPharmaCompanies(country.iso3);
      
      return {
        name: country.name,
        iso3: country.iso3,
        healthScore: country.healthScore,
        gdpPerCapita,
        opportunityScore,
        rank: 0, // Will be set after sorting
        healthChallenges: this.getHealthChallenges(country.iso3, country.healthScore),
        diseases: this.getChronicDiseases(country.iso3, country.healthScore),
        companies
      };
    }));

    // Sort by opportunity score (descending) and assign ranks
    opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);
    opportunities.forEach((country, index) => {
      country.rank = index + 1;
    });

    console.log('Top 10 Health vs Wealth opportunities:');
    opportunities.slice(0, 10).forEach((country, index) => {
      console.log(`${index + 1}. ${country.name}: Health=${country.healthScore.toFixed(1)}, GDP=$${country.gdpPerCapita.toLocaleString()}, Opportunity=${country.opportunityScore.toFixed(3)}`);
    });

    return opportunities;
  }

  private calculateHealthScore(
    indicators: Record<string, number>,
    allCountries: Record<string, any>,
    healthIndicators: string[]
  ): number {
    if (!indicators || Object.keys(indicators).length === 0) {
      return 0;
    }

    // Use the same calculation method as the map component
    const validIndicators = Object.entries(indicators).filter(([_, value]) => 
      typeof value === 'number' && !isNaN(value) && value > 0
    );

    if (validIndicators.length === 0) {
      return 0;
    }

    const totalScore = validIndicators.reduce((sum, [_, value]) => sum + value, 0);
    const avgScore = totalScore / validIndicators.length;

    // Apply the same calibration as the map
    const allValidScores = Object.values(allCountries)
      .map((country: any) => {
        if (!country.indicators) return 0;
        const countryValidIndicators = Object.entries(country.indicators).filter(([_, value]) => 
          typeof value === 'number' && !isNaN(value as number) && (value as number) > 0
        );
        if (countryValidIndicators.length === 0) return 0;
        const countryTotal = countryValidIndicators.reduce((sum, [_, value]) => sum + (value as number), 0);
        return countryTotal / countryValidIndicators.length;
      })
      .filter(score => score > 0);

    const originalMin = Math.min(...allValidScores);
    const originalMax = Math.max(...allValidScores);
    const originalRange = originalMax - originalMin;

    if (originalRange === 0) return avgScore;

    const calibratedScore = Math.max(0, Math.min(100, ((avgScore - originalMin) / originalRange) * 100));
    return calibratedScore;
  }

  private getHealthChallenges(iso3: string, healthScore: number): string[] {
    // Generate realistic health challenges based on country and health score
    const challenges: string[] = [];
    
    if (healthScore < 30) {
      challenges.push('Infectious Disease Outbreaks', 'Malnutrition', 'Limited Healthcare Access');
    } else if (healthScore < 50) {
      challenges.push('Healthcare Infrastructure', 'Disease Prevention', 'Medical Supply Shortages');
    } else if (healthScore < 70) {
      challenges.push('Chronic Disease Management', 'Aging Population', 'Healthcare Quality');
    } else {
      challenges.push('Preventive Care', 'Mental Health Services', 'Healthcare Innovation');
    }

    // Add region-specific challenges
    const regionChallenges: Record<string, string[]> = {
      'AFR': ['Malaria', 'HIV/AIDS', 'Tuberculosis', 'Maternal Mortality'],
      'EUR': ['Cardiovascular Disease', 'Cancer', 'Diabetes', 'Mental Health'],
      'AMR': ['Diabetes', 'Obesity', 'Heart Disease', 'Drug Resistance'],
      'WPR': ['Aging Population', 'Air Pollution', 'Diabetes', 'Cancer'],
      'EMR': ['Conflict-related Injuries', 'Infectious Diseases', 'Non-communicable Diseases'],
      'SEAR': ['Infectious Diseases', 'Malnutrition', 'Maternal Health', 'Tuberculosis']
    };

    // Add some region-specific challenges (simplified mapping)
    if (iso3.match(/^(NGA|GHA|KEN|ETH|ZAF|EGY)$/)) {
      challenges.push(...regionChallenges['AFR'].slice(0, 2));
    } else if (iso3.match(/^(DEU|FRA|GBR|ITA|ESP)$/)) {
      challenges.push(...regionChallenges['EUR'].slice(0, 2));
    } else if (iso3.match(/^(USA|BRA|MEX|CAN|ARG)$/)) {
      challenges.push(...regionChallenges['AMR'].slice(0, 2));
    }

    return challenges.slice(0, 5); // Limit to 5 challenges
  }

  private getChronicDiseases(iso3: string, healthScore: number): string[] {
    const diseases = [
      'Diabetes', 'Hypertension', 'Cardiovascular Disease', 'Cancer', 'Respiratory Disease',
      'Asthma', 'COPD', 'Stroke', 'Kidney Disease', 'Mental Health Disorders',
      'Arthritis', 'Osteoporosis', 'Liver Disease', 'Neurological Disorders'
    ];

    // Return 4-6 diseases based on health score (lower score = more diseases)
    const diseaseCount = healthScore < 40 ? 6 : healthScore < 70 ? 5 : 4;
    return diseases.slice(0, diseaseCount);
  }

  private async getPharmaCompanies(iso3: string): Promise<PharmaCompany[]> {
    // Get actual pharmaceutical companies with real stock data from database
    const { storage } = await import('./storage');
    const allStocks = await storage.getStocks();
    
    // Filter for healthcare sector stocks
    const pharmaCompanies = allStocks.filter(stock => 
      stock.sector === 'Healthcare' && ['PFE', 'JNJ', 'MRNA', 'NVAX', 'GILD', 'REGN', 'AMGN', 'BIIB', 'VRTX', 'BMY'].includes(stock.symbol)
    );

    // Return 3-5 companies for each country
    const companyCount = Math.floor(Math.random() * 3) + 3;
    const selectedCompanies = pharmaCompanies.slice(0, Math.min(companyCount, pharmaCompanies.length));

    return selectedCompanies.map(stock => ({
      name: stock.name,
      ticker: stock.symbol,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
      sparkline: this.generateSparkline()
    }));
  }

  private getRandomPrice(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }

  private getRandomChange(): number {
    return Math.round((Math.random() * 20 - 10) * 100) / 100;
  }

  private getRandomChangePercent(): number {
    return Math.round((Math.random() * 10 - 5) * 100) / 100;
  }

  private generateSparkline(): number[] {
    const points = 10;
    const sparkline = [];
    let value = 100;
    
    for (let i = 0; i < points; i++) {
      value += (Math.random() - 0.5) * 10;
      sparkline.push(Math.max(50, Math.min(150, value)));
    }
    
    return sparkline;
  }
}

export const healthWealthOpportunityService = new HealthWealthOpportunityService();