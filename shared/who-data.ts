// WHO Statistical Annex data structure and generation functions

// Health score calculation functions (same as map component)
function isPositiveDirection(indicator: string): boolean {
  const positiveKeywords = [
    'coverage', 'access', 'births', 'skilled', 'immunization',
    'vaccination', 'expectancy', 'density', 'improved', 'safe'
  ];
  
  const negativeKeywords = [
    'mortality', 'death', 'disease', 'malnutrition', 'stunting',
    'wasting', 'underweight', 'prevalence', 'incidence', 'burden'
  ];
  
  const indicatorLower = indicator.toLowerCase();
  
  // Check for positive indicators first
  if (positiveKeywords.some(keyword => indicatorLower.includes(keyword))) {
    return true;
  }
  
  // Check for negative indicators
  if (negativeKeywords.some(keyword => indicatorLower.includes(keyword))) {
    return false;
  }
  
  // Default to positive direction if unclear
  return true;
}

// Normalize indicator values to 0-1 scale
function normalizeIndicator(
  values: number[], 
  value: number, 
  isPositive: boolean
): number {
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  if (max === min) return 0.5; // Handle case where all values are the same
  
  if (isPositive) {
    // Higher is better: (value - min) / (max - min)
    return (value - min) / (max - min);
  } else {
    // Lower is better: (max - value) / (max - min)
    return (max - value) / (max - min);
  }
}

function calculateWHOHealthScore(
  countryIndicators: Record<string, number>,
  allCountriesData: Record<string, any>,
  healthIndicators: string[]
): number {
  if (Object.keys(countryIndicators).length === 0) return 0;
  
  let totalScore = 0;
  let validIndicators = 0;
  
  // Equal weight for each indicator
  const weight = 1 / healthIndicators.length;
  
  healthIndicators.forEach(indicator => {
    const value = countryIndicators[indicator];
    if (value === undefined || isNaN(value)) return;
    
    // Get all values for this indicator across countries for normalization
    const allValues = Object.values(allCountriesData)
      .map((country: any) => country.indicators[indicator])
      .filter((val: any) => val !== undefined && !isNaN(val));
    
    if (allValues.length === 0) return;
    
    const isPositive = isPositiveDirection(indicator);
    const normalizedValue = normalizeIndicator(allValues, value, isPositive);
    
    totalScore += normalizedValue * weight;
    validIndicators++;
  });
  
  // Scale to 0-100 and adjust for missing indicators
  const adjustmentFactor = healthIndicators.length / Math.max(1, validIndicators);
  const rawScore = totalScore * 100 * adjustmentFactor;
  
  // Calibrate score to 0-100 range where original min=28 maps to 0 and max=69 maps to 100
  const originalMin = 28;
  const originalMax = 69;
  const originalRange = originalMax - originalMin;
  
  // Apply linear transformation: newScore = ((rawScore - originalMin) / originalRange) * 100
  const calibratedScore = Math.max(0, Math.min(100, ((rawScore - originalMin) / originalRange) * 100));
  
  return calibratedScore;
}

export function generateAuthenticWHOData() {
  // Authentic WHO health indicators from Statistical Annex CSV data - 55 indicators
  const healthIndicators = [
    'Adolescent birth rate (per 1000 women aged 10-14 years)',
    'Adolescent birth rate (per 1000 women aged 15-19 years)',
    'Age-standardized mortality rate attributed to household and ambient air pollution  (per 100 000 population)',
    'Age-standardized prevalence of tobacco use among persons 15 years and older  (%)',
    'Amount of water- and sanitation-related official development assistance that is part of a government-coordinated spending plan (constant 2020 US$ millions)',
    'Annual mean concentrations of fine particulate matter (PM2.5) in urban areas (µg/m3)',
    'Average of 15 International Health Regulations core capacity scores',
    'Contact coverage of treatment services for alcohol use disorders (%)',
    'Contact coverage of treatment services for drug use disorders (%)',
    'Density of dentists (per 10 000 population)',
    'Density of medical doctors (per 10 000 population)',
    'Density of nursing and midwifery personnel (per 10 000 population)',
    'Density of pharmacists (per 10 000 population)',
    'Diphtheria-tetanus-pertussis (DTP3) immunization coverage among 1-year-olds (%)',
    'Domestic general government health expenditure (GGHE-D) as percentage of general government expenditure (GGE) (%)',
    'Healthy life expectancy at birth (years)',
    'Hepatitis B surface antigen (HBsAg) prevalence among children under 5 years (%)',
    'Human papillomavirus (HPV) immunization coverage estimates among 15 year-old girls (%)',
    'Life expectancy at birth (years)',
    'Malaria incidence (per 1000 population at risk)',
    'Maternal mortality ratio (per 100 000 live births)',
    'Measles-containing-vaccine second-dose (MCV2) immunization coverage by the locally recommended age (%)',
    'Mortality rate attributed to exposure to unsafe WASH services (per 100 000 population)',
    'Mortality rate due to homicide (per 100 000 population)',
    'Mortality rate from unintentional poisoning (per 100 000 population)',
    'Neonatal mortality rate (per 1000 live births)',
    'New HIV infections (per 1000 uninfected population)',
    'Percentage of bloodstream infection due to Escherichia coli resistant to 3rd-generation cephalosporin (%)',
    'Percentage of bloodstream infections due methicillin-resistant Staphylococcus aureus (%)',
    'Pneumococcal conjugate 3rd dose (PCV3) immunization coverage  among 1-year olds (%)',
    'Population with household expenditures on health > 10% of total household expenditure or income (%)',
    'Population with household expenditures on health > 25% of total household expenditure or income (%)',
    'Prevalence of anaemia in women of reproductive age (15-49 years) (%)',
    'Prevalence of overweight in children under 5 (%)',
    'Prevalence of stunting in children under 5 (%)',
    'Prevalence of wasting in children under 5 (%)',
    'Probability of dying from any of CVD, cancer, diabetes, CRD between age 30 and exact age 70 (%)',
    'Proportion of births attended by skilled health personnel (%)',
    'Proportion of ever-partnered women and girls aged 15-49 years subjected to physical and/or sexual violence by a current or former intimate partner in the previous 12 months (%)',
    'Proportion of ever-partnered women and girls aged 15-49 years subjected to physical and/or sexual violence by a current or former intimate partner in their lifetime (%)',
    'Proportion of health facilities with a core set of relevant essential medicines available and affordable on a sustainable basis (%)',
    'Proportion of population using a hand-washing facility with soap and water (%)',
    'Proportion of population using safely-managed drinking-water services (%)',
    'Proportion of population using safely-managed sanitation services (%)',
    'Proportion of population with primary reliance on clean fuels and technology (%)',
    'Proportion of safely treated domestic wastewater flows (%)',
    'Proportion of women of reproductive age who have their need for family planning satisfied with modern methods (%)',
    'Reported number of people requiring interventions against NTDs',
    'Road traffic mortality rate (per 100 000 population)',
    'Suicide mortality rate (per 100 000 population)',
    'Total alcohol per capita (≥ 15 years of age) consumption (litres of pure alcohol)',
    'Total net official development assistance to medical research and basic health sectors per capita (US$), by recipient country',
    'Tuberculosis incidence (per 100 000 population)',
    'UHC: Service coverage index',
    'Under-five mortality rate (per 1000 live births)',
  ];

  const countries = generateComprehensiveHealthData();
  
  // Calculate health scores for all countries using the same algorithm as the map
  const countriesWithScores: Record<string, any> = {};
  
  Object.entries(countries).forEach(([iso3, countryData]: [string, any]) => {
    const healthScore = calculateWHOHealthScore(
      countryData.indicators,
      countries,
      healthIndicators
    );
    
    countriesWithScores[iso3] = {
      ...countryData,
      healthScore
    };
  });
  
  return {
    healthIndicators,
    countries: countriesWithScores
  };
}

function generateComprehensiveHealthData() {
  const countryHealthData: Record<string, { name: string; indicators: Record<string, number> }> = {};

  // Afghanistan
  countryHealthData['AFG'] = {
    name: 'Afghanistan',
    indicators: {
      'Adolescent birth rate (per 1000 women aged 10-14 years)': 18.0,
      'Adolescent birth rate (per 1000 women aged 15-19 years)': 62.0,
      'Age-standardized mortality rate attributed to household and ambient air pollution  (per 100 000 population)': 269.083,
      'Age-standardized prevalence of tobacco use among persons 15 years and older  (%)': 22.7,
      'Amount of water- and sanitation-related official development assistance that is part of a government-coordinated spending plan (constant 2020 US$ millions)': 46.0561,
      'Annual mean concentrations of fine particulate matter (PM2.5) in urban areas (µg/m3)': 62.48616,
      'Average of 15 International Health Regulations core capacity scores': 35.0,
      'Density of dentists (per 10 000 population)': 0.06,
      'Density of medical doctors (per 10 000 population)': 3.17,
      'Density of nursing and midwifery personnel (per 10 000 population)': 5.49,
      'Density of pharmacists (per 10 000 population)': 0.32,
      'Diphtheria-tetanus-pertussis (DTP3) immunization coverage among 1-year-olds (%)': 60.0,
      'Domestic general government health expenditure (GGHE-D) as percentage of general government expenditure (GGE) (%)': 1.12605727,
      'Healthy life expectancy at birth (years)': 49.646948,
      'Hepatitis B surface antigen (HBsAg) prevalence among children under 5 years (%)': 1.5,
      'Life expectancy at birth (years)': 57.40378236,
      'Malaria incidence (per 1000 population at risk)': 13.25697218,
      'Maternal mortality ratio (per 100 000 live births)': 520.5022864,
      'Measles-containing-vaccine second-dose (MCV2) immunization coverage by the locally recommended age (%)': 42.0,
      'Mortality rate attributed to exposure to unsafe WASH services (per 100 000 population)': 16.6,
      'Mortality rate due to homicide (per 100 000 population)': 8.325069503,
      'Mortality rate from unintentional poisoning (per 100 000 population)': 2.498339438,
      'Neonatal mortality rate (per 1000 live births)': 34.294071911,
      'New HIV infections (per 1000 uninfected population)': 0.1,
      'Pneumococcal conjugate 3rd dose (PCV3) immunization coverage  among 1-year olds (%)': 58.0,
      'Population with household expenditures on health > 10% of total household expenditure or income (%)': 26.08,
      'Population with household expenditures on health > 25% of total household expenditure or income (%)': 8.03,
      'Prevalence of anaemia in women of reproductive age (15-49 years) (%)': 45.4,
      'Prevalence of overweight in children under 5 (%)': 4.4,
      'Prevalence of stunting in children under 5 (%)': 42.0,
      'Prevalence of wasting in children under 5 (%)': 3.6,
      'Probability of dying from any of CVD, cancer, diabetes, CRD between age 30 and exact age 70 (%)': 32.7,
      'Proportion of births attended by skilled health personnel (%)': 68.0,
      'Proportion of ever-partnered women and girls aged 15-49 years subjected to physical and/or sexual violence by a current or former intimate partner in the previous 12 months (%)': 35.0,
      'Proportion of ever-partnered women and girls aged 15-49 years subjected to physical and/or sexual violence by a current or former intimate partner in their lifetime (%)': 46.0,
      'Proportion of population using a hand-washing facility with soap and water (%)': 48.2147,
      'Proportion of population using safely-managed drinking-water services (%)': 30.0341,
      'Proportion of population with primary reliance on clean fuels and technology (%)': 38.6,
      'Proportion of safely treated domestic wastewater flows (%)': 6.056743145,
      'Proportion of women of reproductive age who have their need for family planning satisfied with modern methods (%)': 42.1,
      'Reported number of people requiring interventions against NTDs': 16959219.0,
      'Road traffic mortality rate (per 100 000 population)': 24.1,
      'Suicide mortality rate (per 100 000 population)': 3.5954195,
      'Total alcohol per capita (≥ 15 years of age) consumption (litres of pure alcohol)': 0.00794198,
      'Total net official development assistance to medical research and basic health sectors per capita (US$), by recipient country': 7.34,
      'Tuberculosis incidence (per 100 000 population)': 180.0,
      'UHC: Service coverage index': 40.88461,
      'Under-five mortality rate (per 1000 live births)': 55.507863502,
    }
  };

  // Adding first batch of key countries with authentic WHO data
  
  // United States
  countryHealthData['USA'] = {
    name: 'United States',
    indicators: {
      'Adolescent birth rate (per 1000 women aged 10-14 years)': 0.200000003,
      'Adolescent birth rate (per 1000 women aged 15-19 years)': 13.5,
      'Age-standardized mortality rate attributed to household and ambient air pollution  (per 100 000 population)': 14.223,
      'Age-standardized prevalence of tobacco use among persons 15 years and older  (%)': 24.3,
      'Annual mean concentrations of fine particulate matter (PM2.5) in urban areas (µg/m3)': 7.17987,
      'Average of 15 International Health Regulations core capacity scores': 84.0,
      'Density of dentists (per 10 000 population)': 6.0,
      'Density of medical doctors (per 10 000 population)': 36.81,
      'Density of nursing and midwifery personnel (per 10 000 population)': 133.76,
      'Density of pharmacists (per 10 000 population)': 11.13,
      'Diphtheria-tetanus-pertussis (DTP3) immunization coverage among 1-year-olds (%)': 94.0,
      'Domestic general government health expenditure (GGHE-D) as percentage of general government expenditure (GGE) (%)': 24.74209785,
      'Healthy life expectancy at birth (years)': 62.76627405,
      'Hepatitis B surface antigen (HBsAg) prevalence among children under 5 years (%)': 0.21,
      'Human papillomavirus (HPV) immunization coverage estimates among 15 year-old girls (%)': 52.0,
      'Life expectancy at birth (years)': 73.72311675,
      'Maternal mortality ratio (per 100 000 live births)': 16.6325256,
      'Measles-containing-vaccine second-dose (MCV2) immunization coverage by the locally recommended age (%)': 95.0,
      'Mortality rate attributed to exposure to unsafe WASH services (per 100 000 population)': 2.3,
      'Mortality rate due to homicide (per 100 000 population)': 5.769844772,
      'Mortality rate from unintentional poisoning (per 100 000 population)': 0.528198287,
      'Neonatal mortality rate (per 1000 live births)': 3.366071658,
      'Pneumococcal conjugate 3rd dose (PCV3) immunization coverage  among 1-year olds (%)': 84.0,
      'Population with household expenditures on health > 10% of total household expenditure or income (%)': 4.61,
      'Population with household expenditures on health > 25% of total household expenditure or income (%)': 0.89,
      'Prevalence of anaemia in women of reproductive age (15-49 years) (%)': 15.0,
      'Prevalence of overweight in children under 5 (%)': 9.7,
      'Prevalence of stunting in children under 5 (%)': 4.2,
      'Prevalence of wasting in children under 5 (%)': 0.1,
      'Probability of dying from any of CVD, cancer, diabetes, CRD between age 30 and exact age 70 (%)': 13.7,
      'Proportion of births attended by skilled health personnel (%)': 99.0,
      'Proportion of ever-partnered women and girls aged 15-49 years subjected to physical and/or sexual violence by a current or former intimate partner in the previous 12 months (%)': 6.0,
      'Proportion of ever-partnered women and girls aged 15-49 years subjected to physical and/or sexual violence by a current or former intimate partner in their lifetime (%)': 26.0,
      'Proportion of population using safely-managed drinking-water services (%)': 97.46839,
      'Proportion of population using safely-managed sanitation services (%)': 97.0433,
      'Proportion of population with primary reliance on clean fuels and technology (%)': 100.0,
      'Proportion of safely treated domestic wastewater flows (%)': 98.06144714,
      'Proportion of women of reproductive age who have their need for family planning satisfied with modern methods (%)': 78.4,
      'Reported number of people requiring interventions against NTDs': 525.0,
      'Road traffic mortality rate (per 100 000 population)': 14.2,
      'Suicide mortality rate (per 100 000 population)': 15.63138897,
      'Total alcohol per capita (≥ 15 years of age) consumption (litres of pure alcohol)': 9.810645103,
      'Tuberculosis incidence (per 100 000 population)': 3.1,
      'UHC: Service coverage index': 80.0,
      'Under-five mortality rate (per 1000 live births)': 6.478951398,
    }
  };

  // China
  countryHealthData['CHN'] = {
    name: 'China',
    indicators: {
      'Adolescent birth rate (per 1000 women aged 10-14 years)': 0.29,
      'Adolescent birth rate (per 1000 women aged 15-19 years)': 6.8,
      'Age-standardized mortality rate attributed to household and ambient air pollution  (per 100 000 population)': 120.851,
      'Age-standardized prevalence of tobacco use among persons 15 years and older  (%)': 25.6,
      'Annual mean concentrations of fine particulate matter (PM2.5) in urban areas (µg/m3)': 35.73,
      'Average of 15 International Health Regulations core capacity scores': 77.0,
      'Density of dentists (per 10 000 population)': 1.67,
      'Density of medical doctors (per 10 000 population)': 26.06,
      'Density of nursing and midwifery personnel (per 10 000 population)': 36.11,
      'Density of pharmacists (per 10 000 population)': 1.27,
      'Diphtheria-tetanus-pertussis (DTP3) immunization coverage among 1-year-olds (%)': 99.0,
      'Domestic general government health expenditure (GGHE-D) as percentage of general government expenditure (GGE) (%)': 7.34,
      'Healthy life expectancy at birth (years)': 69.58,
      'Life expectancy at birth (years)': 78.21,
      'Maternal mortality ratio (per 100 000 live births)': 23.0,
      'Measles-containing-vaccine second-dose (MCV2) immunization coverage by the locally recommended age (%)': 99.0,
      'Mortality rate attributed to exposure to unsafe WASH services (per 100 000 population)': 4.8,
      'Mortality rate due to homicide (per 100 000 population)': 0.53,
      'Mortality rate from unintentional poisoning (per 100 000 population)': 0.64,
      'Neonatal mortality rate (per 1000 live births)': 3.6,
      'Pneumococcal conjugate 3rd dose (PCV3) immunization coverage  among 1-year olds (%)': 93.0,
      'Population with household expenditures on health > 10% of total household expenditure or income (%)': 13.19,
      'Population with household expenditures on health > 25% of total household expenditure or income (%)': 2.88,
      'Prevalence of anaemia in women of reproductive age (15-49 years) (%)': 19.9,
      'Prevalence of overweight in children under 5 (%)': 7.2,
      'Prevalence of stunting in children under 5 (%)': 4.8,
      'Prevalence of wasting in children under 5 (%)': 1.8,
      'Probability of dying from any of CVD, cancer, diabetes, CRD between age 30 and exact age 70 (%)': 17.6,
      'Proportion of births attended by skilled health personnel (%)': 100.0,
      'Proportion of population using safely-managed drinking-water services (%)': 93.36,
      'Proportion of population using safely-managed sanitation services (%)': 85.26,
      'Proportion of population with primary reliance on clean fuels and technology (%)': 71.0,
      'Proportion of safely treated domestic wastewater flows (%)': 75.97,
      'Proportion of women of reproductive age who have their need for family planning satisfied with modern methods (%)': 84.5,
      'Road traffic mortality rate (per 100 000 population)': 18.8,
      'Suicide mortality rate (per 100 000 population)': 7.92,
      'Total alcohol per capita (≥ 15 years of age) consumption (litres of pure alcohol)': 6.7,
      'Tuberculosis incidence (per 100 000 population)': 55.0,
      'UHC: Service coverage index': 81.0,
      'Under-five mortality rate (per 1000 live births)': 7.1,
    }
  };

  // Germany
  countryHealthData['DEU'] = {
    name: 'Germany',
    indicators: {
      'Adolescent birth rate (per 1000 women aged 10-14 years)': 0.06,
      'Adolescent birth rate (per 1000 women aged 15-19 years)': 8.2,
      'Age-standardized mortality rate attributed to household and ambient air pollution  (per 100 000 population)': 17.0,
      'Age-standardized prevalence of tobacco use among persons 15 years and older  (%)': 23.8,
      'Annual mean concentrations of fine particulate matter (PM2.5) in urban areas (µg/m3)': 11.94,
      'Average of 15 International Health Regulations core capacity scores': 91.0,
      'Density of dentists (per 10 000 population)': 8.31,
      'Density of medical doctors (per 10 000 population)': 44.68,
      'Density of nursing and midwifery personnel (per 10 000 population)': 135.94,
      'Density of pharmacists (per 10 000 population)': 6.47,
      'Diphtheria-tetanus-pertussis (DTP3) immunization coverage among 1-year-olds (%)': 97.0,
      'Domestic general government health expenditure (GGHE-D) as percentage of general government expenditure (GGE) (%)': 20.79,
      'Healthy life expectancy at birth (years)': 70.9,
      'Life expectancy at birth (years)': 80.94,
      'Maternal mortality ratio (per 100 000 live births)': 4.0,
      'Measles-containing-vaccine second-dose (MCV2) immunization coverage by the locally recommended age (%)': 93.0,
      'Mortality rate attributed to exposure to unsafe WASH services (per 100 000 population)': 1.1,
      'Mortality rate due to homicide (per 100 000 population)': 0.93,
      'Mortality rate from unintentional poisoning (per 100 000 population)': 0.53,
      'Neonatal mortality rate (per 1000 live births)': 2.2,
      'Pneumococcal conjugate 3rd dose (PCV3) immunization coverage  among 1-year olds (%)': 93.0,
      'Population with household expenditures on health > 10% of total household expenditure or income (%)': 2.48,
      'Population with household expenditures on health > 25% of total household expenditure or income (%)': 0.16,
      'Prevalence of anaemia in women of reproductive age (15-49 years) (%)': 14.7,
      'Prevalence of overweight in children under 5 (%)': 11.2,
      'Prevalence of stunting in children under 5 (%)': 1.9,
      'Prevalence of wasting in children under 5 (%)': 0.5,
      'Probability of dying from any of CVD, cancer, diabetes, CRD between age 30 and exact age 70 (%)': 11.8,
      'Proportion of births attended by skilled health personnel (%)': 99.0,
      'Proportion of population using safely-managed drinking-water services (%)': 99.0,
      'Proportion of population using safely-managed sanitation services (%)': 97.0,
      'Proportion of population with primary reliance on clean fuels and technology (%)': 100.0,
      'Proportion of safely treated domestic wastewater flows (%)': 96.0,
      'Proportion of women of reproductive age who have their need for family planning satisfied with modern methods (%)': 73.0,
      'Road traffic mortality rate (per 100 000 population)': 4.2,
      'Suicide mortality rate (per 100 000 population)': 12.30,
      'Total alcohol per capita (≥ 15 years of age) consumption (litres of pure alcohol)': 12.2,
      'Tuberculosis incidence (per 100 000 population)': 7.2,
      'UHC: Service coverage index': 86.0,
      'Under-five mortality rate (per 1000 live births)': 3.8,
    }
  };

  // NOTE: Complete dataset contains 198 countries with 55 indicators each
  // This represents the first integration of authentic WHO Statistical Annex data
  // Additional countries will be added progressively to replace all hardcoded values

  return countryHealthData;
}

// Get countries that lack comprehensive WHO data
export function getCountriesWithoutWHOData(): string[] {
  return [
    // Microstates without comprehensive reporting
    'VAT', // Vatican City
    'MCO', // Monaco  
    'SMR', // San Marino
    'LIE', // Liechtenstein
    'AND', // Andorra
    'MLT', // Malta (limited data)
    
    // Small island nations with limited reporting
    'NRU', // Nauru
    'TUV', // Tuvalu
    'PLW', // Palau
    'MHL', // Marshall Islands
    'FSM', // Micronesia
    'KIR', // Kiribati
    'COK', // Cook Islands
    'NIU', // Niue
    
    // Territories and dependencies
    'GRL', // Greenland (Denmark)
    'NCL', // New Caledonia (France)
    'GUF', // French Guiana (France)
    'PYF', // French Polynesia (France)
    'SPM', // Saint Pierre and Miquelon (France)
    'WLF', // Wallis and Futuna (France)
    
    // Some disputed territories not in standard WHO reporting
    'TWN', // Taiwan (complex WHO status)
  ];
}