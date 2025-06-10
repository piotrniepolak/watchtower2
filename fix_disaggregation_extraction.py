#!/usr/bin/env python3
"""
Fix Disaggregation Extraction
Corrects data extraction to use proper aggregate values with disaggregation priority
"""

import csv
import re
from collections import defaultdict

def extract_correct_aggregates():
    """Extract correct aggregate values with proper disaggregation priority"""
    
    country_data = defaultdict(lambda: defaultdict(dict))
    
    # Disaggregation priority (highest to lowest)
    priority_order = [
        'NA',           # Main aggregate
        'BTSX',         # Both sexes
        'SEX_BTSX',     # Both sexes explicit
        'TOTAL',        # Total aggregate
        'ALL',          # All categories
        '',             # Empty disaggregation
    ]
    
    try:
        with open('attached_assets/Pasted-IndicatorName-IndicatorCode-Location-LocationCode-Year-Disaggregation-NumericValue-DisplayValue-Comm-1749582428287_1749582428290.txt', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                location = row['Location']
                location_code = row['LocationCode']
                indicator = row['IndicatorName']
                disaggregation = row['Disaggregation']
                numeric_value = row['NumericValue']
                
                # Skip regional aggregates
                if location in ['Global', 'African Region', 'Eastern Mediterranean Region', 'European Region', 'Region of the Americas', 'South-East Asia Region', 'Western Pacific Region']:
                    continue
                
                # Only process countries with valid 3-letter codes
                if len(location_code) == 3 and location_code.isalpha():
                    if numeric_value and numeric_value.strip() and numeric_value != 'NO DATA':
                        try:
                            value = float(numeric_value)
                            
                            # Determine priority score for this disaggregation
                            priority_score = len(priority_order)  # Default lowest priority
                            for i, priority_pattern in enumerate(priority_order):
                                if priority_pattern in disaggregation or disaggregation == priority_pattern:
                                    priority_score = i
                                    break
                            
                            # Store if this is higher priority than existing entry
                            if indicator not in country_data[location_code] or priority_score < country_data[location_code][indicator]['priority']:
                                country_data[location_code][indicator] = {
                                    'value': value,
                                    'priority': priority_score,
                                    'disaggregation': disaggregation,
                                    'location': location
                                }
                        except ValueError:
                            continue
    
    except FileNotFoundError:
        print("CSV file not found")
        return None
    
    # Extract final values with only the highest priority entries
    final_data = {}
    for location_code, indicators in country_data.items():
        if len(indicators) >= 15:  # Only countries with substantial data
            final_data[location_code] = {
                'name': indicators[list(indicators.keys())[0]]['location'],
                'indicators': {indicator: data['value'] for indicator, data in indicators.items()}
            }
    
    return final_data

def escape_js_string(text):
    """Properly escape JavaScript string literals"""
    text = text.replace('\\', '\\\\')
    text = text.replace("'", "\\'")
    text = text.replace('"', '\\"')
    return text

def generate_corrected_replacement():
    """Generate replacement with corrected aggregate values"""
    
    country_data = extract_correct_aggregates()
    
    if not country_data:
        print("No data extracted")
        return
    
    print(f"Countries with corrected aggregates: {len(country_data)}")
    
    # Generate replacement code with proper escaping
    replacement_code = ""
    
    for country_code, data in country_data.items():
        escaped_name = escape_js_string(data['name'])
        
        replacement_code += f"    '{country_code}': {{\n"
        replacement_code += f"      name: '{escaped_name}',\n"
        replacement_code += f"      indicators: {{\n"
        
        for indicator, value in data['indicators'].items():
            escaped_indicator = escape_js_string(indicator)
            replacement_code += f"        '{escaped_indicator}': {value},\n"
        
        replacement_code += f"      }}\n"
        replacement_code += f"    }},\n"
    
    return replacement_code

def implement_corrected_aggregates():
    """Implement countries with corrected aggregate values"""
    
    replacement_code = generate_corrected_replacement()
    if not replacement_code:
        return
    
    # Read current React component
    try:
        with open('client/src/components/world-health-map-simple.tsx', 'r') as f:
            content = f.read()
    except FileNotFoundError:
        print("React component file not found")
        return
    
    # Find and replace the countries object
    pattern = r"const countries: Record<string, any> = \{(.*?)\n  \};"
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        new_countries_content = f"const countries: Record<string, any> = {{\n{replacement_code}\n  }};"
        new_content = content.replace(match.group(0), new_countries_content)
        
        # Write updated content
        with open('client/src/components/world-health-map-simple.tsx', 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"Successfully implemented {len(replacement_code.split('name:'))-1} countries with corrected aggregates")
    else:
        print("Could not find countries object pattern")

if __name__ == "__main__":
    implement_corrected_aggregates()