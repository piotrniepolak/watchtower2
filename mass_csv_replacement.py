#!/usr/bin/env python3
"""
Mass CSV Replacement Script
Replaces ALL country data in the React component with authentic WHO CSV values
"""

import re

def read_authentic_csv_data():
    """Read the complete authentic CSV replacement data"""
    try:
        with open('complete_authentic_csv_replacement.txt', 'r') as f:
            content = f.read()
        
        # Extract the country data from the JavaScript object
        start = content.find('const authenticWHOData = {') + len('const authenticWHOData = {')
        end = content.rfind('};')
        data_content = content[start:end].strip()
        
        return data_content
    except FileNotFoundError:
        print("Authentic CSV replacement file not found")
        return None

def perform_mass_replacement():
    """Replace all country data in the React component"""
    
    # Read authentic data
    authentic_data = read_authentic_csv_data()
    if not authentic_data:
        print("No authentic data available")
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
    
    # Replace with authentic data
    new_countries_content = f"const countries: Record<string, any> = {{\n{authentic_data}\n  }};"
    
    # Perform replacement
    new_content = content.replace(match.group(0), new_countries_content)
    
    # Write updated content
    with open('client/src/components/world-health-map-simple.tsx', 'w') as f:
        f.write(new_content)
    
    print("Mass replacement completed successfully")
    print(f"Replaced {len(authentic_data.split('name:'))-1} countries with authentic CSV data")

if __name__ == "__main__":
    perform_mass_replacement()