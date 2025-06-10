#!/usr/bin/env python3
import csv
import json

def extract_all_authentic_who_data():
    """Extract ALL WHO indicators for ALL countries from CSV file"""
    countries_data = {}
    all_indicators = set()
    
    with open('attached_assets/Pasted-IndicatorName-IndicatorCode-Location-LocationCode-Year-Disaggregation-NumericValue-DisplayValue-Comm-1749576445239_1749576445242.txt', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            country = row['Location']
            code = row['LocationCode']
            indicator = row['IndicatorName']
            
            # Track all indicators
            all_indicators.add(indicator)
            
            # Handle empty values
            try:
                value = float(row['NumericValue']) if row['NumericValue'].strip() else None
            except (ValueError, AttributeError):
                continue
            
            if code not in countries_data:
                countries_data[code] = {'name': country, 'indicators': {}}
            
            if value is not None:
                countries_data[code]['indicators'][indicator] = value
    
    return countries_data, sorted(all_indicators)

def generate_complete_country_data():
    """Generate complete authentic data for all countries in our implementation"""
    authentic_data, all_indicators = extract_all_authentic_who_data()
    
    # Countries in our current implementation
    target_countries = ['USA', 'CHN', 'DEU', 'FRA', 'GBR', 'JPN', 'IND', 'BRA', 'RUS', 'CAN', 'AUS', 'NGA', 'ETH', 'ZAF', 'KEN', 'MEX', 'IDN', 'TUR', 'ARG']
    
    print(f"Found {len(all_indicators)} total indicators in WHO data")
    print(f"Processing {len(target_countries)} countries\n")
    
    # Generate complete data for each country
    for code in target_countries:
        if code in authentic_data:
            country_name = authentic_data[code]['name']
            indicators = authentic_data[code]['indicators']
            
            print(f"'{code}': {{")
            print(f"  name: '{country_name}',")
            print(f"  indicators: {{")
            
            # Process all 55 indicators we use in our system
            our_indicators = [
                'Adolescent birth rate (per 1000 women aged 10-14 years)',
                'Adolescent birth rate (per 1000 women aged 15-19 years)',
                'Age-standardized mortality rate attributed to household and ambient air pollution  (per 100 000 population)',
                'Age-standardized prevalence of tobacco use among persons 15 years and older  (%)',
                'Annual mean concentrations of fine particulate matter (PM2.5) in urban areas (µg/m3)',
                'Average of 15 International Health Regulations core capacity scores',
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
                'Maternal mortality ratio (per 100 000 live births)',
                'Measles-containing-vaccine second-dose (MCV2) immunization coverage by the locally recommended age (%)',
                'Mortality rate attributed to exposure to unsafe WASH services (per 100 000 population)',
                'Mortality rate due to homicide (per 100 000 population)',
                'Mortality rate from unintentional poisoning (per 100 000 population)',
                'Neonatal mortality rate (per 1000 live births)',
                'New HIV infections (per 1000 uninfected population)',
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
                'Proportion of population using safely-managed drinking-water services (%)',
                'Proportion of population using safely-managed sanitation services (%)',
                'Proportion of population with primary reliance on clean fuels and technology (%)',
                'Proportion of safely treated domestic wastewater flows (%)',
                'Proportion of women of reproductive age who have their need for family planning satisfied with modern methods (%)',
                'Road traffic mortality rate (per 100 000 population)',
                'Suicide mortality rate (per 100 000 population)',
                'Total alcohol per capita (≥ 15 years of age) consumption (litres of pure alcohol)',
                'Tuberculosis incidence (per 100 000 population)',
                'UHC: Service coverage index',
                'Under-five mortality rate (per 1000 live births)',
            ]
            
            for indicator in our_indicators:
                if indicator in indicators:
                    value = indicators[indicator]
                    print(f"    '{indicator}': {value},")
                else:
                    print(f"    // '{indicator}': NO DATA,")
            
            print(f"  }}")
            print(f"}},")
            print()
        else:
            print(f"WARNING: {code} not found in authentic WHO data")
    
    return authentic_data

if __name__ == "__main__":
    generate_complete_country_data()