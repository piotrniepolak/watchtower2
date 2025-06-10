#!/usr/bin/env python3
"""
Verify South Africa Data Against CSV
Extracts all South Africa indicators from CSV and compares with implementation
"""

import csv

def extract_south_africa_csv_data():
    """Extract ALL South Africa indicators from CSV with proper disaggregation priority"""
    
    # Disaggregation priority (highest to lowest)
    priority_order = [
        'NA',           # Main aggregate
        'BTSX',         # Both sexes
        'SEX_BTSX',     # Both sexes explicit
        'TOTAL',        # Total aggregate
        'ALL',          # All categories
        '',             # Empty disaggregation
    ]
    
    indicator_candidates = {}
    
    try:
        with open('attached_assets/Pasted-IndicatorName-IndicatorCode-Location-LocationCode-Year-Disaggregation-NumericValue-DisplayValue-Comm-1749582428287_1749582428290.txt', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                location = row['Location']
                location_code = row['LocationCode']
                indicator = row['IndicatorName']
                disaggregation = row['Disaggregation']
                numeric_value = row['NumericValue']
                
                # Only process South Africa
                if location_code == 'ZAF':
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
                            if indicator not in indicator_candidates or priority_score < indicator_candidates[indicator]['priority']:
                                indicator_candidates[indicator] = {
                                    'value': value,
                                    'priority': priority_score,
                                    'disaggregation': disaggregation
                                }
                        except ValueError:
                            continue
    
    except FileNotFoundError:
        print("CSV file not found")
        return None
    
    # Extract final values with only the highest priority entries
    south_africa_data = {indicator: data['value'] for indicator, data in indicator_candidates.items()}
    return south_africa_data

def get_implemented_south_africa_data():
    """Extract South Africa data from current implementation"""
    
    try:
        with open('client/src/components/world-health-map-simple.tsx', 'r') as f:
            content = f.read()
    except FileNotFoundError:
        print("Implementation file not found")
        return None
    
    # Find ZAF section
    zaf_start = content.find("'ZAF': {")
    if zaf_start == -1:
        print("ZAF not found in implementation")
        return None
    
    # Find the end of ZAF section
    zaf_end = content.find("    },", zaf_start + 1)
    if zaf_end == -1:
        print("Could not find end of ZAF section")
        return None
    
    zaf_section = content[zaf_start:zaf_end]
    
    # Extract indicators
    implemented_data = {}
    lines = zaf_section.split('\n')
    
    for line in lines:
        if "': " in line and not line.strip().startswith('name:') and not line.strip().startswith('indicators:'):
            try:
                # Extract indicator name and value
                parts = line.strip().split("': ")
                if len(parts) == 2:
                    indicator = parts[0].strip("'")
                    value_str = parts[1].rstrip(',')
                    value = float(value_str)
                    implemented_data[indicator] = value
            except (ValueError, IndexError):
                continue
    
    return implemented_data

def verify_south_africa_data():
    """Verify South Africa data matches CSV exactly"""
    
    csv_data = extract_south_africa_csv_data()
    implemented_data = get_implemented_south_africa_data()
    
    if not csv_data:
        print("Could not extract CSV data")
        return
    
    if not implemented_data:
        print("Could not extract implemented data")
        return
    
    print("=== SOUTH AFRICA (ZAF) DATA VERIFICATION ===\n")
    print(f"CSV indicators: {len(csv_data)}")
    print(f"Implemented indicators: {len(implemented_data)}")
    
    print("\n=== ALL SOUTH AFRICA CSV VALUES ===")
    for indicator, value in sorted(csv_data.items()):
        print(f"{indicator}: {value}")
    
    print("\n=== VERIFICATION RESULTS ===")
    
    matches = 0
    discrepancies = 0
    missing_in_implementation = 0
    extra_in_implementation = 0
    
    # Check CSV values against implementation
    for indicator, csv_value in csv_data.items():
        if indicator in implemented_data:
            impl_value = implemented_data[indicator]
            if csv_value == impl_value:
                matches += 1
            else:
                print(f"MISMATCH - {indicator}:")
                print(f"  CSV: {csv_value}")
                print(f"  Implementation: {impl_value}")
                discrepancies += 1
        else:
            print(f"MISSING - {indicator}: {csv_value} (in CSV but not in implementation)")
            missing_in_implementation += 1
    
    # Check for extra indicators in implementation
    for indicator, impl_value in implemented_data.items():
        if indicator not in csv_data:
            print(f"EXTRA - {indicator}: {impl_value} (in implementation but not in CSV)")
            extra_in_implementation += 1
    
    print(f"\n=== SUMMARY ===")
    print(f"Exact matches: {matches}")
    print(f"Value discrepancies: {discrepancies}")
    print(f"Missing from implementation: {missing_in_implementation}")
    print(f"Extra in implementation: {extra_in_implementation}")
    print(f"Total discrepancies: {discrepancies + missing_in_implementation + extra_in_implementation}")

if __name__ == "__main__":
    verify_south_africa_data()