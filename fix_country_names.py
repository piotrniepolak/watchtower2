#!/usr/bin/env python3
"""
Fix Country Names with Special Characters
Escapes special characters in country names to prevent JavaScript syntax errors
"""

import re

def fix_country_names_in_file():
    """Fix special characters in country names in the React component"""
    
    try:
        with open('client/src/components/world-health-map-simple.tsx', 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print("React component file not found")
        return
    
    # Fix common problematic country names
    fixes = [
        ("name: 'Côte d'Ivoire',", "name: 'Cote d\\'Ivoire',"),
        ("name: 'Bolivia (Plurinational State of)',", "name: 'Bolivia (Plurinational State of)',"),
        ("name: 'Iran (Islamic Republic of)',", "name: 'Iran (Islamic Republic of)',"),
        ("name: 'Venezuela (Bolivarian Republic of)',", "name: 'Venezuela (Bolivarian Republic of)',"),
        ("name: 'China, Hong Kong SAR',", "name: 'China, Hong Kong SAR',"),
        ("name: 'China, Macao SAR',", "name: 'China, Macao SAR',"),
        ("name: 'United Kingdom of Great Britain and Northern Ireland',", "name: 'United Kingdom of Great Britain and Northern Ireland',"),
        ("name: 'United Republic of Tanzania',", "name: 'United Republic of Tanzania',"),
        ("name: 'Republic of Korea',", "name: 'Republic of Korea',"),
        ("name: 'Republic of Moldova',", "name: 'Republic of Moldova',"),
        ("name: 'Democratic People's Republic of Korea',", "name: 'Democratic People\\'s Republic of Korea',"),
        ("name: 'Lao People's Democratic Republic',", "name: 'Lao People\\'s Democratic Republic',"),
    ]
    
    # Apply fixes
    for old_text, new_text in fixes:
        content = content.replace(old_text, new_text)
    
    # General fix for any remaining single quotes in names
    # Find all name: 'text with quotes' patterns and escape them
    pattern = r"name: '([^']*'[^']*)',\n"
    
    def escape_quotes(match):
        name_content = match.group(1)
        escaped_name = name_content.replace("'", "\\'")
        return f"name: '{escaped_name}',\n"
    
    content = re.sub(pattern, escape_quotes, content)
    
    # Write fixed content
    with open('client/src/components/world-health-map-simple.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Country name fixes applied successfully")

if __name__ == "__main__":
    fix_country_names_in_file()