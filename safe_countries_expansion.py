#!/usr/bin/env python3
"""
Safe Countries Expansion
Safely adds more countries while avoiding JavaScript syntax errors
"""

import csv
import json
from collections import defaultdict

def extract_safe_countries_data():
    """Extract countries with safe names (no special characters)"""
    
    country_data = defaultdict(dict)
    country_names = {}
    
    # Countries to exclude due to special characters
    problematic_names = [
        "Côte d'Ivoire",
        "Democratic People's Republic of Korea", 
        "Lao People's Democratic Republic",
        "China, Hong Kong SAR",
        "China, Macao SAR"
    ]
    
    try:
        with open('attached_assets/Pasted-IndicatorName-IndicatorCode-Location-LocationCode-Year-Disaggregation-NumericValue-DisplayValue-Comm-1749582428287_1749582428290.txt', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                location = row['Location']
                location_code = row['LocationCode']
                indicator = row['IndicatorName']
                numeric_value = row['NumericValue']
                
                # Skip problematic names and regional aggregates
                if location in problematic_names:
                    continue
                    
                if location in ['Global', 'African Region', 'Eastern Mediterranean Region', 'European Region', 'Region of the Americas', 'South-East Asia Region', 'Western Pacific Region']:
                    continue
                
                # Only process countries with valid location codes
                if len(location_code) == 3 and location_code.isalpha():
                    country_names[location_code] = location
                    
                    if location_code not in country_data:
                        country_data[location_code] = {
                            'name': location,
                            'indicators': {}
                        }
                    
                    # Check if authentic data is available
                    if numeric_value and numeric_value.strip() and numeric_value != 'NO DATA':
                        try:
                            value = float(numeric_value)
                            country_data[location_code]['indicators'][indicator] = value
                        except ValueError:
                            continue
    
    except FileNotFoundError:
        print("CSV file not found")
        return None
    
    # Filter countries with substantial data (at least 30 indicators)
    substantial_countries = {code: data for code, data in country_data.items() 
                           if len(data['indicators']) >= 30}
    
    return substantial_countries

def generate_safe_expansion():
    """Generate safe country expansion with 50 additional countries"""
    
    safe_countries = extract_safe_countries_data()
    if not safe_countries:
        return
    
    # Current 17 countries we already have
    current_countries = ['ARG', 'AUS', 'BRA', 'CAN', 'ETH', 'DEU', 'IDN', 'IRN', 'ITA', 'KEN', 'MEX', 'NGA', 'RUS', 'ZAF', 'USA', 'CHN', 'FRA']
    
    # Get 50 additional countries
    additional_countries = {}
    count = 0
    for code, data in safe_countries.items():
        if code not in current_countries and count < 50:
            additional_countries[code] = data
            count += 1
    
    # Generate replacement code
    replacement_code = ""
    for country_code, data in additional_countries.items():
        replacement_code += f"    '{country_code}': {{\n"
        replacement_code += f"      name: '{data['name']}',\n"
        replacement_code += f"      indicators: {{\n"
        
        for indicator, value in data['indicators'].items():
            # Escape any single quotes in indicator names
            escaped_indicator = indicator.replace("'", "\\'")
            replacement_code += f"        '{escaped_indicator}': {value},\n"
        
        replacement_code += f"      }}\n"
        replacement_code += f"    }},\n"
    
    # Write safe expansion file
    with open('safe_countries_expansion.txt', 'w') as f:
        f.write("// SAFE COUNTRIES EXPANSION - 50 ADDITIONAL COUNTRIES\n")
        f.write("// Zero tolerance - only exact CSV values included\n\n")
        f.write(replacement_code)
    
    print(f"Generated safe expansion with {len(additional_countries)} countries")
    
    # Show which countries will be added
    for code, data in additional_countries.items():
        print(f"{code}: {data['name']} ({len(data['indicators'])} indicators)")

if __name__ == "__main__":
    generate_safe_expansion()