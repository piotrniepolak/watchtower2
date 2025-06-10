#!/usr/bin/env python3
"""
Extract ALL countries from WHO Statistical Annex CSV
Processes the complete CSV to include all available countries with authentic data
"""

import csv
import json
from collections import defaultdict

def extract_all_countries_csv_data():
    """Extract ALL countries with authentic WHO data from complete CSV file"""
    
    # Data storage
    country_data = defaultdict(dict)
    country_names = {}
    csv_available = defaultdict(set)
    
    # Track unique countries and their authentic data
    countries_found = set()
    
    try:
        with open('attached_assets/Pasted-IndicatorName-IndicatorCode-Location-LocationCode-Year-Disaggregation-NumericValue-DisplayValue-Comm-1749582428287_1749582428290.txt', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                location = row['Location']
                location_code = row['LocationCode']
                indicator = row['IndicatorName']
                numeric_value = row['NumericValue']
                
                # Skip regional aggregates and global data
                if location in ['Global', 'African Region', 'Eastern Mediterranean Region', 'European Region', 'Region of the Americas', 'South-East Asia Region', 'Western Pacific Region']:
                    continue
                
                # Only process countries with valid location codes (typically 3-letter codes)
                if len(location_code) == 3 and location_code.isalpha():
                    countries_found.add(location)
                    country_names[location_code] = location
                    
                    if location_code not in country_data:
                        country_data[location_code] = {
                            'name': location,
                            'indicators': {}
                        }
                    
                    # Check if authentic data is available
                    if numeric_value and numeric_value.strip() and numeric_value != 'NO DATA':
                        try:
                            # Use exact numeric value from CSV
                            value = float(numeric_value)
                            country_data[location_code]['indicators'][indicator] = value
                            csv_available[location_code].add(indicator)
                        except ValueError:
                            continue
    
    except FileNotFoundError:
        print("CSV file not found")
        return None, None, None
    
    return dict(country_data), dict(csv_available), countries_found

def generate_all_countries_replacement():
    """Generate replacement code with ALL countries having authentic CSV data"""
    
    country_data, csv_available, countries_found = extract_all_countries_csv_data()
    
    if not country_data:
        print("No data extracted from CSV")
        return
    
    print(f"\n=== ALL COUNTRIES CSV DATA EXTRACTION REPORT ===")
    print(f"Total countries found: {len(countries_found)}")
    print(f"Countries with data: {len(country_data)}")
    
    total_indicators = sum(len(data['indicators']) for data in country_data.values())
    print(f"Total authentic indicators: {total_indicators}")
    
    # Filter countries with substantial data (at least 10 indicators)
    substantial_countries = {code: data for code, data in country_data.items() 
                           if len(data['indicators']) >= 10}
    
    print(f"Countries with substantial data (≥10 indicators): {len(substantial_countries)}")
    
    # Generate replacement code for all countries
    replacement_code = ""
    
    for country_code, data in substantial_countries.items():
        replacement_code += f"    '{country_code}': {{\n"
        replacement_code += f"      name: '{data['name']}',\n"
        replacement_code += f"      indicators: {{\n"
        
        for indicator, value in data['indicators'].items():
            # Escape single quotes in indicator names
            escaped_indicator = indicator.replace("'", "\\'")
            replacement_code += f"        '{escaped_indicator}': {value},\n"
        
        replacement_code += f"      }}\n"
        replacement_code += f"    }},\n"
    
    # Write complete replacement file
    with open('all_countries_authentic_csv_replacement.txt', 'w') as f:
        f.write("// ALL COUNTRIES AUTHENTIC WHO STATISTICAL ANNEX DATA\n")
        f.write("// Zero tolerance - only exact CSV values included\n\n")
        f.write("const allCountriesAuthenticWHOData = {\n")
        f.write(replacement_code)
        f.write("};\n")
    
    # Generate country summary
    with open('all_countries_summary.txt', 'w') as f:
        f.write("=== ALL COUNTRIES SUMMARY ===\n\n")
        f.write(f"Total countries with data: {len(substantial_countries)}\n\n")
        
        for country_code, data in sorted(substantial_countries.items()):
            indicator_count = len(data['indicators'])
            f.write(f"{country_code} ({data['name']}): {indicator_count} indicators\n")
    
    print(f"\nFiles generated:")
    print(f"- all_countries_authentic_csv_replacement.txt")
    print(f"- all_countries_summary.txt")
    
    print(f"\nTop 10 countries by indicator count:")
    sorted_countries = sorted(substantial_countries.items(), 
                            key=lambda x: len(x[1]['indicators']), reverse=True)
    for i, (code, data) in enumerate(sorted_countries[:10]):
        print(f"{i+1}. {code} ({data['name']}): {len(data['indicators'])} indicators")

if __name__ == "__main__":
    generate_all_countries_replacement()