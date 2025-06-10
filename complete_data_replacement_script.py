#!/usr/bin/env python3

import pandas as pd
import re

# Read the CSV file
df = pd.read_csv('attached_assets/Pasted-IndicatorName-IndicatorCode-Location-LocationCode-Year-Disaggregation-NumericValue-DisplayValue-Comm-1749576445239_1749576445242.txt')

# Filter for 2022 data and specific countries
target_countries = ['USA', 'CHN', 'JPN', 'DEU', 'GBR', 'FRA', 'ITA', 'ESP', 'NLD', 'SWE', 
                   'CAN', 'AUS', 'IND', 'BRA', 'RUS', 'MEX', 'IDN', 'TUR', 'ARG', 'AFG']

df_2022 = df[(df['Year'] == 2022) & (df['LocationCode'].isin(target_countries))]

# Build complete replacement data structure
def build_complete_replacement():
    result = "  const AUTHENTIC_WHO_DATA = {\n"
    
    for country_code in target_countries:
        country_data = df_2022[df_2022['LocationCode'] == country_code]
        
        if len(country_data) == 0:
            continue
            
        # Get country name
        country_name = country_data['Location'].iloc[0]
        
        result += f"    '{country_code}': {{\n"
        result += f"      name: '{country_name}',\n"
        result += f"      indicators: {{\n"
        
        # Process each indicator
        for _, row in country_data.iterrows():
            indicator = row['IndicatorName']
            value = row['NumericValue']
            
            if pd.notna(value):
                # Format the value properly
                if isinstance(value, (int, float)):
                    if value == int(value):
                        formatted_value = int(value)
                    else:
                        formatted_value = f"{value:.6f}".rstrip('0').rstrip('.')
                else:
                    formatted_value = value
                
                result += f"        '{indicator}': {formatted_value},\n"
            else:
                result += f"        // '{indicator}': NO DATA IN CSV,\n"
        
        result += f"      }}\n"
        result += f"    }},\n"
    
    result += "  };\n"
    return result

# Generate the complete replacement
replacement_code = build_complete_replacement()

# Write to file
with open('complete_authentic_data_structure.txt', 'w') as f:
    f.write(replacement_code)

print("Complete authentic data structure generated in complete_authentic_data_structure.txt")
print(f"Total countries processed: {len(target_countries)}")
print("Ready for mass replacement implementation")