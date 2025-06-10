#!/usr/bin/env python3
"""
Complete WHO Statistical Annex CSV Data Extraction
Processes the full WHO CSV to create authentic country data with zero tolerance for estimates.
"""

import csv
import json
from collections import defaultdict

def extract_complete_csv_data():
    """Extract ALL authentic WHO data from complete CSV file"""
    
    # Country code mapping for our 19 countries
    country_mapping = {
        'USA': 'United States of America',
        'CHN': 'China',
        'IDN': 'Indonesia',
        'TUR': 'Turkey',
        'ARG': 'Argentina', 
        'BRA': 'Brazil',
        'RUS': 'Russian Federation',
        'CAN': 'Canada',
        'AUS': 'Australia',
        'NGA': 'Nigeria',
        'ETH': 'Ethiopia',
        'ZAF': 'South Africa',
        'KEN': 'Kenya',
        'MEX': 'Mexico',
        'IRN': 'Iran (Islamic Republic of)',
        'DEU': 'Germany',
        'GBR': 'United Kingdom of Great Britain and Northern Ireland',
        'FRA': 'France',
        'ITA': 'Italy'
    }
    
    # Reverse mapping for lookup
    location_to_code = {v: k for k, v in country_mapping.items()}
    
    # Data storage
    country_data = defaultdict(dict)
    csv_available = defaultdict(set)
    csv_missing = defaultdict(set)
    
    try:
        with open('attached_assets/Pasted-IndicatorName-IndicatorCode-Location-LocationCode-Year-Disaggregation-NumericValue-DisplayValue-Comm-1749582428287_1749582428290.txt', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                location = row['Location']
                indicator = row['IndicatorName']
                numeric_value = row['NumericValue']
                display_value = row['DisplayValue']
                
                # Check if this is one of our target countries
                if location in location_to_code:
                    country_code = location_to_code[location]
                    
                    if country_code not in country_data:
                        country_data[country_code] = {
                            'name': location,
                            'indicators': {}
                        }
                    
                    # Check if data is available
                    if numeric_value and numeric_value.strip() and numeric_value != 'NO DATA':
                        try:
                            # Use the exact numeric value from CSV
                            value = float(numeric_value)
                            country_data[country_code]['indicators'][indicator] = value
                            csv_available[country_code].add(indicator)
                        except ValueError:
                            csv_missing[country_code].add(indicator)
                    else:
                        csv_missing[country_code].add(indicator)
    
    except FileNotFoundError:
        print("CSV file not found")
        return None, None, None
    
    return dict(country_data), dict(csv_available), dict(csv_missing)

def generate_complete_authentic_replacement():
    """Generate complete replacement code with ONLY authentic CSV data"""
    
    country_data, csv_available, csv_missing = extract_complete_csv_data()
    
    if not country_data:
        print("No data extracted from CSV")
        return
    
    print(f"\n=== COMPLETE CSV DATA EXTRACTION REPORT ===")
    print(f"Countries processed: {len(country_data)}")
    
    total_available = sum(len(indicators) for indicators in csv_available.values())
    total_missing = sum(len(indicators) for indicators in csv_missing.values())
    
    print(f"Total authentic indicators: {total_available}")
    print(f"Total missing indicators: {total_missing}")
    
    # Generate replacement code for each country
    replacement_code = ""
    
    for country_code, data in country_data.items():
        if data['indicators']:  # Only include countries with authentic data
            replacement_code += f"    '{country_code}': {{\n"
            replacement_code += f"      name: '{data['name']}',\n"
            replacement_code += f"      indicators: {{\n"
            
            for indicator, value in data['indicators'].items():
                replacement_code += f"        '{indicator}': {value},\n"
            
            replacement_code += f"      }}\n"
            replacement_code += f"    }},\n"
    
    # Write complete replacement file
    with open('complete_authentic_csv_replacement.txt', 'w') as f:
        f.write("// COMPLETE AUTHENTIC WHO STATISTICAL ANNEX DATA\n")
        f.write("// Zero tolerance - only exact CSV values included\n\n")
        f.write("const authenticWHOData = {\n")
        f.write(replacement_code)
        f.write("};\n")
    
    # Generate missing data report
    with open('csv_missing_indicators_report.txt', 'w') as f:
        f.write("=== CSV MISSING DATA REPORT ===\n\n")
        for country_code, missing_indicators in csv_missing.items():
            if missing_indicators:
                country_name = country_data[country_code]['name']
                f.write(f"{country_code} ({country_name}):\n")
                for indicator in sorted(missing_indicators):
                    f.write(f"  - {indicator}\n")
                f.write(f"  Total missing: {len(missing_indicators)}\n\n")
    
    print(f"\nFiles generated:")
    print(f"- complete_authentic_csv_replacement.txt")
    print(f"- csv_missing_indicators_report.txt")
    
    print(f"\nCountry summary:")
    for country_code, data in country_data.items():
        available = len(csv_available.get(country_code, []))
        missing = len(csv_missing.get(country_code, []))
        print(f"{country_code}: {available} authentic, {missing} missing")

if __name__ == "__main__":
    generate_complete_authentic_replacement()