#!/usr/bin/env python3
"""
Verify Multiple Countries Data Against CSV
Checks corrected disaggregation values across sample countries
"""

import csv
import re

def extract_country_csv_data(country_codes):
    """Extract data for specified countries with proper disaggregation priority"""
    
    # Disaggregation priority (highest to lowest)
    priority_order = [
        'NA',           # Main aggregate
        'BTSX',         # Both sexes
        'SEX_BTSX',     # Both sexes explicit
        'TOTAL',        # Total aggregate
        'ALL',          # All categories
        '',             # Empty disaggregation
    ]
    
    countries_data = {}
    
    try:
        with open('attached_assets/Pasted-IndicatorName-IndicatorCode-Location-LocationCode-Year-Disaggregation-NumericValue-DisplayValue-Comm-1749582428287_1749582428290.txt', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for country_code in country_codes:
                countries_data[country_code] = {}
            
            for row in reader:
                location = row['Location']
                location_code = row['LocationCode']
                indicator = row['IndicatorName']
                disaggregation = row['Disaggregation']
                numeric_value = row['NumericValue']
                
                if location_code in country_codes:
                    if numeric_value and numeric_value.strip() and numeric_value != 'NO DATA':
                        try:
                            value = float(numeric_value)
                            
                            # Determine priority score for this disaggregation
                            priority_score = len(priority_order)  # Default lowest priority
                            for i, priority_pattern in enumerate(priority_order):
                                if priority_pattern in disaggregation or disaggregation == priority_pattern:
                                    priority_score = i
                                    break
                            
                            # Initialize country data if not exists
                            if country_code not in countries_data:
                                countries_data[location_code] = {}
                            
                            # Store if this is higher priority than existing entry
                            if indicator not in countries_data[location_code] or priority_score < countries_data[location_code][indicator]['priority']:
                                countries_data[location_code][indicator] = {
                                    'value': value,
                                    'priority': priority_score,
                                    'disaggregation': disaggregation,
                                    'location': location
                                }
                        except ValueError:
                            continue
    
    except FileNotFoundError:
        print("CSV file not found")
        return {}
    
    # Extract final values with only the highest priority entries
    final_data = {}
    for country_code, indicators in countries_data.items():
        if indicators:  # Only if country has data
            final_data[country_code] = {
                'name': indicators[list(indicators.keys())[0]]['location'],
                'indicators': {indicator: data['value'] for indicator, data in indicators.items()}
            }
    
    return final_data

def get_implemented_countries_data(country_codes):
    """Extract specified countries data from current implementation"""
    
    try:
        with open('client/src/components/world-health-map-simple.tsx', 'r') as f:
            content = f.read()
    except FileNotFoundError:
        print("Implementation file not found")
        return {}
    
    implemented_data = {}
    
    for country_code in country_codes:
        # Find country section
        country_start = content.find(f"'{country_code}': {{")
        if country_start == -1:
            continue
            
        # Find the end of this country's data
        brace_count = 0
        country_end = country_start
        in_country = False
        
        for i in range(country_start, len(content)):
            char = content[i]
            if char == '{':
                brace_count += 1
                in_country = True
            elif char == '}':
                brace_count -= 1
                if in_country and brace_count == 0:
                    country_end = i + 1
                    break
        
        country_section = content[country_start:country_end]
        
        # Extract indicators using regex
        indicator_pattern = r"'([^']+)':\s*([\d.-]+),"
        matches = re.findall(indicator_pattern, country_section)
        
        indicators = {}
        for indicator, value in matches:
            try:
                indicators[indicator] = float(value)
            except ValueError:
                continue
        
        if indicators:
            implemented_data[country_code] = indicators
    
    return implemented_data

def verify_countries(country_codes):
    """Verify data for specified countries"""
    
    print(f"=== VERIFYING {len(country_codes)} COUNTRIES ===\n")
    
    csv_data = extract_country_csv_data(country_codes)
    implemented_data = get_implemented_countries_data(country_codes)
    
    total_matches = 0
    total_discrepancies = 0
    
    for country_code in country_codes:
        if country_code not in csv_data or country_code not in implemented_data:
            print(f"{country_code}: MISSING DATA")
            continue
            
        csv_indicators = csv_data[country_code]['indicators']
        impl_indicators = implemented_data[country_code]
        
        matches = 0
        discrepancies = 0
        
        print(f"{country_code} ({csv_data[country_code]['name']}):")
        print(f"  CSV indicators: {len(csv_indicators)}")
        print(f"  Implementation indicators: {len(impl_indicators)}")
        
        # Check life expectancy specifically
        life_exp_indicator = 'Life expectancy at birth (years)'
        if life_exp_indicator in csv_indicators and life_exp_indicator in impl_indicators:
            csv_val = csv_indicators[life_exp_indicator]
            impl_val = impl_indicators[life_exp_indicator]
            if abs(csv_val - impl_val) < 0.001:
                print(f"  ✓ Life expectancy: {impl_val} (matches CSV)")
                matches += 1
            else:
                print(f"  ✗ Life expectancy: CSV={csv_val}, Implementation={impl_val}")
                discrepancies += 1
        
        # Count all matches/discrepancies
        for indicator in csv_indicators:
            if indicator in impl_indicators:
                if abs(csv_indicators[indicator] - impl_indicators[indicator]) < 0.001:
                    matches += 1
                else:
                    discrepancies += 1
        
        print(f"  Exact matches: {matches}")
        print(f"  Discrepancies: {discrepancies}")
        print()
        
        total_matches += matches
        total_discrepancies += discrepancies
    
    print(f"=== OVERALL SUMMARY ===")
    print(f"Total exact matches: {total_matches}")
    print(f"Total discrepancies: {total_discrepancies}")
    print(f"Data accuracy: {(total_matches/(total_matches+total_discrepancies)*100):.1f}%" if (total_matches + total_discrepancies) > 0 else "No data")

if __name__ == "__main__":
    # Sample countries for verification
    sample_countries = ['USA', 'CHN', 'DEU', 'JPN', 'GBR', 'FRA', 'IND', 'BRA', 'CAN', 'AUS']
    verify_countries(sample_countries)