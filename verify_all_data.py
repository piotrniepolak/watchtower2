#!/usr/bin/env python3
import csv
import re

def extract_csv_data():
    """Extract all authentic WHO data from CSV file"""
    countries_data = {}
    
    with open('attached_assets/Pasted-IndicatorName-IndicatorCode-Location-LocationCode-Year-Disaggregation-NumericValue-DisplayValue-Comm-1749576445239_1749576445242.txt', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            country = row['Location']
            code = row['LocationCode']
            indicator = row['IndicatorName']
            
            try:
                value = float(row['NumericValue']) if row['NumericValue'].strip() else None
            except (ValueError, AttributeError):
                continue
            
            if code not in countries_data:
                countries_data[code] = {'name': country, 'indicators': {}}
            
            if value is not None:
                countries_data[code]['indicators'][indicator] = value
    
    return countries_data

def extract_current_implementation():
    """Extract current values from implementation"""
    current_data = {}
    
    with open('client/src/components/world-health-map-simple.tsx', 'r') as f:
        content = f.read()
        
        # Find country blocks
        country_pattern = r"'([A-Z]{3})':\s*\{\s*name:\s*'([^']+)',\s*indicators:\s*\{([^}]+)\}"
        matches = re.findall(country_pattern, content, re.DOTALL)
        
        for match in matches:
            code, name, indicators_block = match
            current_data[code] = {'name': name, 'indicators': {}}
            
            # Extract indicator values
            indicator_pattern = r"'([^']+)':\s*([\d.]+),"
            indicator_matches = re.findall(indicator_pattern, indicators_block)
            
            for indicator, value in indicator_matches:
                try:
                    current_data[code]['indicators'][indicator] = float(value)
                except ValueError:
                    continue
    
    return current_data

def compare_data():
    """Compare CSV data with current implementation"""
    csv_data = extract_csv_data()
    current_data = extract_current_implementation()
    
    target_countries = ['USA', 'CHN', 'DEU', 'FRA', 'GBR', 'JPN', 'IND', 'BRA', 'RUS', 'CAN', 'AUS', 'NGA', 'ETH', 'ZAF', 'KEN', 'MEX', 'IDN', 'TUR', 'ARG']
    
    discrepancies = []
    
    for code in target_countries:
        if code not in current_data:
            print(f"ERROR: {code} not found in current implementation")
            continue
            
        if code not in csv_data:
            print(f"ERROR: {code} not found in CSV data")
            continue
            
        current_indicators = current_data[code]['indicators']
        csv_indicators = csv_data[code]['indicators']
        
        for indicator in current_indicators:
            current_value = current_indicators[indicator]
            
            if indicator in csv_indicators:
                csv_value = csv_indicators[indicator]
                
                # Check for differences (allowing small floating point variations)
                if abs(current_value - csv_value) > 0.01:
                    discrepancies.append({
                        'country': code,
                        'country_name': current_data[code]['name'],
                        'indicator': indicator,
                        'current_value': current_value,
                        'csv_value': csv_value,
                        'difference': abs(current_value - csv_value)
                    })
            else:
                discrepancies.append({
                    'country': code,
                    'country_name': current_data[code]['name'],
                    'indicator': indicator,
                    'current_value': current_value,
                    'csv_value': 'NO DATA',
                    'difference': 'N/A'
                })
    
    # Print summary
    print(f"\nDATA VERIFICATION SUMMARY")
    print(f"Countries checked: {len(target_countries)}")
    print(f"Total discrepancies found: {len(discrepancies)}")
    print(f"="*80)
    
    if discrepancies:
        for disc in discrepancies:
            print(f"\n{disc['country']} ({disc['country_name']}):")
            print(f"  Indicator: {disc['indicator']}")
            print(f"  Current: {disc['current_value']}")
            print(f"  CSV: {disc['csv_value']}")
            if disc['difference'] != 'N/A':
                print(f"  Difference: {disc['difference']}")
    else:
        print("\nNo discrepancies found - all values match CSV data!")
    
    return discrepancies

if __name__ == "__main__":
    compare_data()