#!/usr/bin/env python3
"""
System-Wide Verification of All WHO Data
Comprehensive verification of all 195 countries and all indicators against CSV
"""

import csv
import re
from collections import defaultdict

def extract_all_csv_data():
    """Extract ALL countries and indicators from CSV with proper disaggregation priority"""
    
    # Disaggregation priority (highest to lowest)
    priority_order = [
        'NA',           # Main aggregate
        'BTSX',         # Both sexes
        'SEX_BTSX',     # Both sexes explicit
        'TOTAL',        # Total aggregate
        'ALL',          # All categories
        '',             # Empty disaggregation
    ]
    
    country_data = defaultdict(lambda: defaultdict(dict))
    
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
        return {}
    
    # Extract final values with only the highest priority entries
    final_data = {}
    for location_code, indicators in country_data.items():
        if len(indicators) >= 10:  # Only countries with substantial data
            final_data[location_code] = {
                'name': indicators[list(indicators.keys())[0]]['location'],
                'indicators': {indicator: data['value'] for indicator, data in indicators.items()}
            }
    
    return final_data

def extract_all_implementation_data():
    """Extract ALL countries and indicators from current implementation"""
    
    try:
        with open('client/src/components/world-health-map-simple.tsx', 'r') as f:
            content = f.read()
    except FileNotFoundError:
        print("Implementation file not found")
        return {}
    
    # Extract countries object using regex
    pattern = r"const countries: Record<string, any> = \{(.*?)\n  \};"
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print("Could not find countries object in implementation")
        return {}
    
    countries_content = match.group(1)
    
    # Extract individual country data
    country_pattern = r"'([A-Z]{3})':\s*\{\s*name:\s*'([^']*)',\s*indicators:\s*\{([^}]*)\}\s*\}"
    country_matches = re.finditer(country_pattern, countries_content, re.DOTALL)
    
    implementation_data = {}
    
    for country_match in country_matches:
        country_code = country_match.group(1)
        country_name = country_match.group(2)
        indicators_content = country_match.group(3)
        
        # Extract indicators
        indicator_pattern = r"'([^']+)':\s*([\d.-]+),"
        indicator_matches = re.findall(indicator_pattern, indicators_content)
        
        indicators = {}
        for indicator, value in indicator_matches:
            try:
                indicators[indicator] = float(value)
            except ValueError:
                continue
        
        if indicators:
            implementation_data[country_code] = {
                'name': country_name,
                'indicators': indicators
            }
    
    return implementation_data

def perform_system_wide_verification():
    """Perform comprehensive verification of all data"""
    
    print("=== SYSTEM-WIDE WHO DATA VERIFICATION ===\n")
    print("Extracting CSV data with proper disaggregation priority...")
    csv_data = extract_all_csv_data()
    
    print("Extracting implementation data...")
    impl_data = extract_all_implementation_data()
    
    print(f"\nCSV countries: {len(csv_data)}")
    print(f"Implementation countries: {len(impl_data)}")
    
    # Overall statistics
    total_countries_verified = 0
    total_indicators_verified = 0
    total_exact_matches = 0
    total_discrepancies = 0
    countries_with_discrepancies = []
    missing_countries = []
    extra_countries = []
    
    # Check for missing countries
    csv_countries = set(csv_data.keys())
    impl_countries = set(impl_data.keys())
    
    missing_from_impl = csv_countries - impl_countries
    extra_in_impl = impl_countries - csv_countries
    
    if missing_from_impl:
        missing_countries = list(missing_from_impl)
        print(f"\nCountries in CSV but missing from implementation: {len(missing_countries)}")
        for country in sorted(missing_countries)[:10]:  # Show first 10
            print(f"  - {country}: {csv_data[country]['name']}")
        if len(missing_countries) > 10:
            print(f"  ... and {len(missing_countries) - 10} more")
    
    if extra_in_impl:
        extra_countries = list(extra_in_impl)
        print(f"\nCountries in implementation but not in CSV: {len(extra_countries)}")
        for country in sorted(extra_countries)[:10]:  # Show first 10
            print(f"  - {country}: {impl_data[country]['name']}")
        if len(extra_countries) > 10:
            print(f"  ... and {len(extra_countries) - 10} more")
    
    # Verify each country
    common_countries = csv_countries & impl_countries
    print(f"\n=== VERIFYING {len(common_countries)} COMMON COUNTRIES ===\n")
    
    critical_indicators = [
        'Life expectancy at birth (years)',
        'Healthy life expectancy at birth (years)',
        'Maternal mortality ratio (per 100 000 live births)',
        'Under-five mortality rate (per 1000 live births)',
        'UHC: Service coverage index'
    ]
    
    critical_discrepancies = []
    
    for country_code in sorted(common_countries):
        csv_country = csv_data[country_code]
        impl_country = impl_data[country_code]
        
        csv_indicators = csv_country['indicators']
        impl_indicators = impl_country['indicators']
        
        country_matches = 0
        country_discrepancies = 0
        country_critical_issues = []
        
        # Check each indicator
        for indicator in csv_indicators:
            if indicator in impl_indicators:
                csv_val = csv_indicators[indicator]
                impl_val = impl_indicators[indicator]
                
                if abs(csv_val - impl_val) < 0.001:
                    country_matches += 1
                else:
                    country_discrepancies += 1
                    if indicator in critical_indicators:
                        country_critical_issues.append({
                            'country': country_code,
                            'country_name': csv_country['name'],
                            'indicator': indicator,
                            'csv_value': csv_val,
                            'impl_value': impl_val
                        })
        
        total_countries_verified += 1
        total_indicators_verified += len(csv_indicators)
        total_exact_matches += country_matches
        total_discrepancies += country_discrepancies
        
        if country_discrepancies > 0:
            countries_with_discrepancies.append({
                'code': country_code,
                'name': csv_country['name'],
                'matches': country_matches,
                'discrepancies': country_discrepancies,
                'total_indicators': len(csv_indicators)
            })
        
        if country_critical_issues:
            critical_discrepancies.extend(country_critical_issues)
        
        # Progress indicator for large verification
        if total_countries_verified % 20 == 0:
            print(f"Verified {total_countries_verified}/{len(common_countries)} countries...")
    
    # Report critical discrepancies
    if critical_discrepancies:
        print(f"\n=== CRITICAL INDICATOR DISCREPANCIES ===")
        for issue in critical_discrepancies[:20]:  # Show first 20
            print(f"{issue['country']} ({issue['country_name']}) - {issue['indicator']}:")
            print(f"  CSV: {issue['csv_value']}")
            print(f"  Implementation: {issue['impl_value']}")
            print()
    
    # Report countries with most discrepancies
    if countries_with_discrepancies:
        print(f"\n=== COUNTRIES WITH DISCREPANCIES ===")
        countries_with_discrepancies.sort(key=lambda x: x['discrepancies'], reverse=True)
        for country in countries_with_discrepancies[:10]:  # Show worst 10
            accuracy = (country['matches'] / country['total_indicators']) * 100
            print(f"{country['code']} ({country['name']}): {country['discrepancies']} discrepancies, {accuracy:.1f}% accurate")
    
    # Final summary
    print(f"\n=== SYSTEM-WIDE VERIFICATION SUMMARY ===")
    print(f"Countries verified: {total_countries_verified}")
    print(f"Total indicators verified: {total_indicators_verified}")
    print(f"Exact matches: {total_exact_matches}")
    print(f"Total discrepancies: {total_discrepancies}")
    print(f"Countries with discrepancies: {len(countries_with_discrepancies)}")
    print(f"Critical indicator discrepancies: {len(critical_discrepancies)}")
    
    if total_indicators_verified > 0:
        overall_accuracy = (total_exact_matches / total_indicators_verified) * 100
        print(f"Overall system accuracy: {overall_accuracy:.2f}%")
    
    if total_discrepancies == 0:
        print("\n🎯 PERFECT DATA INTEGRITY ACHIEVED")
        print("All displayed values match WHO Statistical Annex CSV exactly")
    else:
        print(f"\n⚠️  DATA INTEGRITY ISSUES DETECTED")
        print(f"   {total_discrepancies} values do not match authentic WHO CSV data")
    
    return {
        'total_countries': total_countries_verified,
        'total_indicators': total_indicators_verified,
        'exact_matches': total_exact_matches,
        'discrepancies': total_discrepancies,
        'accuracy': (total_exact_matches / total_indicators_verified) * 100 if total_indicators_verified > 0 else 0,
        'countries_with_issues': len(countries_with_discrepancies),
        'critical_issues': len(critical_discrepancies)
    }

if __name__ == "__main__":
    results = perform_system_wide_verification()