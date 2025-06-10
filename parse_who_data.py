#!/usr/bin/env python3

import csv
import json
from collections import defaultdict

def parse_who_csv():
    # Read the WHO CSV file
    filename = "attached_assets/Pasted-IndicatorName-IndicatorCode-Location-LocationCode-Year-Disaggregation-NumericValue-DisplayValue-Comm-1749576445239_1749576445242.txt"
    
    # Store data by country
    countries_data = defaultdict(lambda: {"name": "", "indicators": {}})
    all_indicators = set()
    
    # Country code mapping for common variations
    country_mapping = {
        "USA": "United States",
        "UK": "United Kingdom", 
        "Russia": "Russian Federation",
        "Iran (Islamic Republic of)": "Iran",
        "Türkiye": "Turkey"
    }
    
    with open(filename, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            indicator_name = row['IndicatorName'].strip()
            location = row['Location'].strip()
            location_code = row['LocationCode'].strip()
            
            # Skip regional aggregates and global data
            if location_code in ['AFR', 'AMR', 'EMR', 'EUR', 'SEAR', 'WPR', 'GLOBAL']:
                continue
                
            # Skip if no country code or if it's a comment line
            if len(location_code) != 3 or not location_code.isalpha():
                continue
                
            try:
                numeric_value = float(row['NumericValue'])
            except (ValueError, TypeError):
                continue
                
            # Store the data
            countries_data[location_code]["name"] = location
            countries_data[location_code]["indicators"][indicator_name] = numeric_value
            all_indicators.add(indicator_name)
    
    return dict(countries_data), sorted(list(all_indicators))

def generate_js_replacement():
    countries_data, indicators = parse_who_csv()
    
    print("WHO Data Processing Complete")
    print(f"Found {len(countries_data)} countries")
    print(f"Found {len(indicators)} unique indicators")
    print()
    
    # Check for United States data
    if 'USA' in countries_data:
        print("United States indicators found:")
        for indicator, value in sorted(countries_data['USA']['indicators'].items()):
            print(f"  {indicator}: {value}")
        print()
    
    # Generate the JavaScript replacement
    js_code = []
    js_code.append("// WHO Statistical Annex data - Authentic data from WHO CSV")
    js_code.append("export function generateAuthenticWHOData() {")
    js_code.append("  const healthIndicators = [")
    
    for indicator in indicators:
        js_code.append(f"    '{indicator}',")
    
    js_code.append("  ];")
    js_code.append("")
    js_code.append("  const countries = generateComprehensiveHealthData();")
    js_code.append("")
    js_code.append("  // Calculate health scores for all countries using the same algorithm as the map")
    js_code.append("  const countriesWithScores: Record<string, any> = {};")
    js_code.append("")
    js_code.append("  Object.entries(countries).forEach(([iso3, countryData]: [string, any]) => {")
    js_code.append("    const healthScore = calculateWHOHealthScore(")
    js_code.append("      countryData.indicators,")
    js_code.append("      countries,")
    js_code.append("      healthIndicators")
    js_code.append("    );")
    js_code.append("")
    js_code.append("    countriesWithScores[iso3] = {")
    js_code.append("      ...countryData,")
    js_code.append("      healthScore")
    js_code.append("    };")
    js_code.append("  });")
    js_code.append("")
    js_code.append("  return {")
    js_code.append("    healthIndicators,")
    js_code.append("    countries: countriesWithScores")
    js_code.append("  };")
    js_code.append("}")
    js_code.append("")
    js_code.append("function generateComprehensiveHealthData() {")
    js_code.append("  const countryHealthData: Record<string, { name: string; indicators: Record<string, number> }> = {};")
    js_code.append("")
    
    # Generate country data
    for iso3, data in countries_data.items():
        js_code.append(f"  // {data['name']}")
        js_code.append(f"  countryHealthData['{iso3}'] = {{")
        js_code.append(f"    name: '{data['name']}',")
        js_code.append("    indicators: {")
        
        for indicator, value in sorted(data['indicators'].items()):
            # Escape single quotes in indicator names
            escaped_indicator = indicator.replace("'", "\\'")
            js_code.append(f"      '{escaped_indicator}': {value},")
        
        js_code.append("    }")
        js_code.append("  };")
        js_code.append("")
    
    js_code.append("  return countryHealthData;")
    js_code.append("}")
    
    return '\n'.join(js_code)

if __name__ == "__main__":
    js_replacement = generate_js_replacement()
    
    # Write to file
    with open("who_data_replacement.js", "w", encoding="utf-8") as f:
        f.write(js_replacement)
    
    print("JavaScript replacement code generated in 'who_data_replacement.js'")