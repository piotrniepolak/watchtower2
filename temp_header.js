// WHO Statistical Annex data - Authentic data from WHO CSV
export function generateAuthenticWHOData() {
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
