#!/usr/bin/env python3
"""
Mass Sanitized Countries Replacement Script
Replaces current countries with all 196 sanitized countries using exact same approach
"""

import re

def read_sanitized_countries_data():
    """Read the complete sanitized countries CSV replacement data"""
    try:
        with open('all_sanitized_countries_replacement.txt', 'r') as f:
            content = f.read()
        
        # Extract the country data from the JavaScript object
        start = content.find('const allSanitizedCountriesWHOData = {') + len('const allSanitizedCountriesWHOData = {')
        end = content.rfind('};')
        data_content = content[start:end].strip()
        
        return data_content
    except FileNotFoundError:
        print("Sanitized countries replacement file not found")
        return None

def perform_sanitized_countries_replacement():
    """Replace current countries with all 196 sanitized countries"""
    
    # Read all sanitized countries authentic data
    sanitized_countries_data = read_sanitized_countries_data()
    if not sanitized_countries_data:
        print("No sanitized countries data available")
        return
    
    # Read current React component
    try:
        with open('client/src/components/world-health-map-simple.tsx', 'r') as f:
            content = f.read()
    except FileNotFoundError:
        print("React component file not found")
        return
    
    # Find the countries object pattern
    pattern = r"const countries: Record<string, any> = \{(.*?)\n  \};"
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print("Could not find countries object pattern")
        return
    
    # Replace with all sanitized countries authentic data
    new_countries_content = f"const countries: Record<string, any> = {{\n{sanitized_countries_data}\n  }};"
    
    # Perform replacement
    new_content = content.replace(match.group(0), new_countries_content)
    
    # Write updated content
    with open('client/src/components/world-health-map-simple.tsx', 'w') as f:
        f.write(new_content)
    
    print("Sanitized countries replacement completed successfully")
    print(f"Replaced with {len(sanitized_countries_data.split('name:'))-1} countries with authentic CSV data")

if __name__ == "__main__":
    perform_sanitized_countries_replacement()