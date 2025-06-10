#!/usr/bin/env python3
import csv
import json

def extract_authentic_who_data():
    """Extract exact WHO data for all countries from CSV file"""
    countries_data = {}
    
    with open('attached_assets/Pasted-IndicatorName-IndicatorCode-Location-LocationCode-Year-Disaggregation-NumericValue-DisplayValue-Comm-1749576445239_1749576445242.txt', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            country = row['Location']
            code = row['LocationCode']
            indicator = row['IndicatorName']
            
            # Handle empty values
            try:
                value = float(row['NumericValue']) if row['NumericValue'].strip() else None
            except (ValueError, AttributeError):
                continue
            
            if code not in countries_data:
                countries_data[code] = {'name': country, 'indicators': {}}
            
            if value is not None:
                countries_data[code]['indicators'][indicator] = value
    
    return countries_data

def verify_current_implementation():
    """Verify current data against authentic WHO values"""
    authentic_data = extract_authentic_who_data()
    
    # Countries currently in our implementation
    target_countries = ['USA', 'CHN', 'DEU', 'FRA', 'GBR', 'JPN', 'IND', 'BRA', 'RUS', 'CAN', 'AUS', 'NGA', 'ETH', 'ZAF', 'KEN', 'MEX', 'IDN', 'TUR', 'ARG']
    
    discrepancies = []
    
    for code in target_countries:
        if code in authentic_data:
            indicators = authentic_data[code]['indicators']
            
            # Key indicators to verify
            key_indicators = [
                'Adolescent birth rate (per 1000 women aged 15-19 years)',
                'Age-standardized mortality rate attributed to household and ambient air pollution  (per 100 000 population)',
                'Age-standardized prevalence of tobacco use among persons 15 years and older  (%)',
                'Annual mean concentrations of fine particulate matter (PM2.5) in urban areas (µg/m3)',
                'Average of 15 International Health Regulations core capacity scores'
            ]
            
            print(f"\n{code} ({authentic_data[code]['name']}):")
            for indicator in key_indicators:
                if indicator in indicators:
                    value = indicators[indicator]
                    print(f"  {indicator}: {value}")
                else:
                    print(f"  {indicator}: NO DATA")
    
    return authentic_data

if __name__ == "__main__":
    verify_current_implementation()