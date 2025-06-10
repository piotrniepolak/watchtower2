#!/usr/bin/env python3
"""
Sanitize All Countries CSV Data
Replaces special characters in country names and generates clean replacement data
"""

import csv
import json
from collections import defaultdict

def sanitize_country_name(name):
    """Replace special characters with non-special versions"""
    replacements = {
        'ô': 'o',
        'é': 'e',
        'í': 'i',
        'ó': 'o',
        'ú': 'u',
        'ñ': 'n',
        'ç': 'c',
        'à': 'a',
        'è': 'e',
        'ì': 'i',
        'ò': 'o',
        'ù': 'u',
        'á': 'a',
        'é': 'e',
        'í': 'i',
        'ó': 'o',
        'ú': 'u',
        'ý': 'y',
        'ā': 'a',
        'ē': 'e',
        'ī': 'i',
        'ō': 'o',
        'ū': 'u',
        'ă': 'a',
        'ĕ': 'e',
        'ĭ': 'i',
        'ŏ': 'o',
        'ŭ': 'u'
    }
    
    sanitized = name
    for special, replacement in replacements.items():
        sanitized = sanitized.replace(special, replacement)
    
    return sanitized

def extract_all_sanitized_countries():
    """Extract ALL countries with sanitized names from CSV"""
    
    country_data = defaultdict(dict)
    country_names = {}
    
    try:
        with open('attached_assets/Pasted-IndicatorName-IndicatorCode-Location-LocationCode-Year-Disaggregation-NumericValue-DisplayValue-Comm-1749582428287_1749582428290.txt', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                location = row['Location']
                location_code = row['LocationCode']
                indicator = row['IndicatorName']
                numeric_value = row['NumericValue']
                
                # Skip regional aggregates
                if location in ['Global', 'African Region', 'Eastern Mediterranean Region', 'European Region', 'Region of the Americas', 'South-East Asia Region', 'Western Pacific Region']:
                    continue
                
                # Only process countries with valid location codes
                if len(location_code) == 3 and location_code.isalpha():
                    # Sanitize country name
                    sanitized_name = sanitize_country_name(location)
                    country_names[location_code] = sanitized_name
                    
                    if location_code not in country_data:
                        country_data[location_code] = {
                            'name': sanitized_name,
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
    
    # Filter countries with substantial data (at least 10 indicators)
    substantial_countries = {code: data for code, data in country_data.items() 
                           if len(data['indicators']) >= 10}
    
    return substantial_countries

def generate_all_sanitized_replacement():
    """Generate replacement code with ALL sanitized countries"""
    
    country_data = extract_all_sanitized_countries()
    
    if not country_data:
        print("No data extracted from CSV")
        return
    
    print(f"\n=== ALL SANITIZED COUNTRIES CSV DATA EXTRACTION ===")
    print(f"Countries with substantial data: {len(country_data)}")
    
    total_indicators = sum(len(data['indicators']) for data in country_data.values())
    print(f"Total authentic indicators: {total_indicators}")
    
    # Generate replacement code for all countries
    replacement_code = ""
    
    for country_code, data in country_data.items():
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
    with open('all_sanitized_countries_replacement.txt', 'w') as f:
        f.write("// ALL SANITIZED COUNTRIES AUTHENTIC WHO STATISTICAL ANNEX DATA\n")
        f.write("// Zero tolerance - only exact CSV values included\n")
        f.write("// Special characters replaced with non-special versions\n\n")
        f.write("const allSanitizedCountriesWHOData = {\n")
        f.write(replacement_code)
        f.write("};\n")
    
    print(f"\nFiles generated:")
    print(f"- all_sanitized_countries_replacement.txt")
    
    print(f"\nTop 10 countries by indicator count:")
    sorted_countries = sorted(country_data.items(), 
                            key=lambda x: len(x[1]['indicators']), reverse=True)
    for i, (code, data) in enumerate(sorted_countries[:10]):
        print(f"{i+1}. {code} ({data['name']}): {len(data['indicators'])} indicators")

if __name__ == "__main__":
    generate_all_sanitized_replacement()