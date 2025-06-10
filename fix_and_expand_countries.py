#!/usr/bin/env python3
"""
Fix and Expand Countries with Proper Character Escaping
Adds all countries while properly escaping JavaScript special characters
"""

import csv
import json
from collections import defaultdict

def escape_js_string(text):
    """Properly escape JavaScript string literals"""
    # Replace backslashes first
    text = text.replace('\\', '\\\\')
    # Replace single quotes
    text = text.replace("'", "\\'")
    # Replace double quotes
    text = text.replace('"', '\\"')
    return text

def extract_all_countries_with_escaping():
    """Extract all countries with proper JavaScript string escaping"""
    
    country_data = defaultdict(dict)
    
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
                
                # Only process countries with valid 3-letter codes
                if len(location_code) == 3 and location_code.isalpha():
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
    
    # Filter countries with substantial data (at least 15 indicators)
    substantial_countries = {code: data for code, data in country_data.items() 
                           if len(data['indicators']) >= 15}
    
    return substantial_countries

def generate_properly_escaped_replacement():
    """Generate replacement with proper JavaScript escaping"""
    
    country_data = extract_all_countries_with_escaping()
    
    if not country_data:
        print("No data extracted")
        return
    
    print(f"Countries with substantial data: {len(country_data)}")
    
    # Generate replacement code with proper escaping
    replacement_code = ""
    
    for country_code, data in country_data.items():
        # Properly escape the country name
        escaped_name = escape_js_string(data['name'])
        
        replacement_code += f"    '{country_code}': {{\n"
        replacement_code += f"      name: '{escaped_name}',\n"
        replacement_code += f"      indicators: {{\n"
        
        for indicator, value in data['indicators'].items():
            # Properly escape indicator names
            escaped_indicator = escape_js_string(indicator)
            replacement_code += f"        '{escaped_indicator}': {value},\n"
        
        replacement_code += f"      }}\n"
        replacement_code += f"    }},\n"
    
    return replacement_code

def implement_escaped_countries():
    """Implement countries with proper escaping"""
    
    replacement_code = generate_properly_escaped_replacement()
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
    import re
    pattern = r"const countries: Record<string, any> = \{(.*?)\n  \};"
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        new_countries_content = f"const countries: Record<string, any> = {{\n{replacement_code}\n  }};"
        new_content = content.replace(match.group(0), new_countries_content)
        
        # Write updated content
        with open('client/src/components/world-health-map-simple.tsx', 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"Successfully implemented {len(replacement_code.split('name:'))-1} countries with proper escaping")
    else:
        print("Could not find countries object pattern")

if __name__ == "__main__":
    implement_escaped_countries()