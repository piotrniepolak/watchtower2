#!/usr/bin/env python3
"""
Mass All Countries Replacement Script
Replaces the current 17-country dataset with all 196 countries from WHO CSV
"""

import re

def read_all_countries_data():
    """Read the complete all countries CSV replacement data"""
    try:
        with open('all_countries_authentic_csv_replacement.txt', 'r') as f:
            content = f.read()
        
        # Extract the country data from the JavaScript object
        start = content.find('const allCountriesAuthenticWHOData = {') + len('const allCountriesAuthenticWHOData = {')
        end = content.rfind('};')
        data_content = content[start:end].strip()
        
        return data_content
    except FileNotFoundError:
        print("All countries CSV replacement file not found")
        return None

def perform_all_countries_replacement():
    """Replace current 17-country data with all 196 countries"""
    
    # Read all countries authentic data
    all_countries_data = read_all_countries_data()
    if not all_countries_data:
        print("No all countries data available")
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
    
    # Replace with all countries authentic data
    new_countries_content = f"const countries: Record<string, any> = {{\n{all_countries_data}\n  }};"
    
    # Perform replacement
    new_content = content.replace(match.group(0), new_countries_content)
    
    # Write updated content
    with open('client/src/components/world-health-map-simple.tsx', 'w') as f:
        f.write(new_content)
    
    print("All countries replacement completed successfully")
    print(f"Replaced with {len(all_countries_data.split('name:'))-1} countries with authentic CSV data")

if __name__ == "__main__":
    perform_all_countries_replacement()