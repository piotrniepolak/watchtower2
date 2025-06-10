#!/usr/bin/env python3
"""
Test Health Score Distribution
Verify that corrected WHO data produces proper score distribution across 0-100 range
"""

import re

def extract_health_scores_from_implementation():
    """Extract a sample of countries and their indicators to test score calculation"""
    
    with open('client/src/components/world-health-map-simple.tsx', 'r') as f:
        content = f.read()
    
    # Sample countries to test
    test_countries = ['USA', 'CHN', 'NOR', 'AFG', 'ZAF', 'JPN', 'DEU', 'TCD', 'SWE', 'SOM']
    
    countries_data = {}
    
    for country_code in test_countries:
        # Find country section
        country_pattern = f"'{country_code}':\\s*{{[^}}]*?name:\\s*'([^']*)',[^}}]*?indicators:\\s*{{([^}}]*?)}}"
        match = re.search(country_pattern, content, re.DOTALL)
        
        if match:
            country_name = match.group(1)
            indicators_content = match.group(2)
            
            # Extract indicators
            indicator_pattern = r"'([^']+)':\\s*([\d.-]+),"
            indicators = dict(re.findall(indicator_pattern, indicators_content))
            
            countries_data[country_code] = {
                'name': country_name,
                'indicators': {k: float(v) for k, v in indicators.items()}
            }
    
    return countries_data

def simulate_health_score_calculation(countries_data):
    """Simulate the health score calculation to verify distribution"""
    
    # All WHO indicators for normalization
    all_indicators = set()
    for country_data in countries_data.values():
        all_indicators.update(country_data['indicators'].keys())
    
    all_indicators = list(all_indicators)
    
    def is_positive_direction(indicator):
        positive_keywords = ['coverage', 'access', 'births', 'skilled', 'immunization', 'expectancy', 'density']
        negative_keywords = ['mortality', 'death', 'disease', 'malnutrition', 'incidence']
        
        indicator_lower = indicator.lower()
        if any(keyword in indicator_lower for keyword in positive_keywords):
            return True
        if any(keyword in indicator_lower for keyword in negative_keywords):
            return False
        return True  # Default
    
    def normalize_indicator(all_values, value, is_positive):
        min_val = min(all_values)
        max_val = max(all_values)
        if max_val == min_val:
            return 0.5
        if is_positive:
            return (value - min_val) / (max_val - min_val)
        else:
            return (max_val - value) / (max_val - min_val)
    
    # Calculate scores for each country
    country_scores = {}
    
    for country_code, country_data in countries_data.items():
        total_score = 0
        valid_indicators = 0
        weight = 1 / len(all_indicators)
        
        for indicator in all_indicators:
            if indicator in country_data['indicators']:
                value = country_data['indicators'][indicator]
                
                # Get all values for this indicator across countries
                all_values = []
                for other_country in countries_data.values():
                    if indicator in other_country['indicators']:
                        all_values.append(other_country['indicators'][indicator])
                
                if len(all_values) > 1:
                    is_positive = is_positive_direction(indicator)
                    normalized_value = normalize_indicator(all_values, value, is_positive)
                    total_score += normalized_value * weight
                    valid_indicators += 1
        
        # Scale and calibrate
        if valid_indicators > 0:
            adjustment_factor = len(all_indicators) / valid_indicators
            raw_score = total_score * 100 * adjustment_factor
            
            # Apply calibration (25-66 -> 0-100)
            observed_min = 25
            observed_max = 66
            calibrated_score = max(0, min(100, ((raw_score - observed_min) / (observed_max - observed_min)) * 100))
            
            country_scores[country_code] = {
                'name': country_data['name'],
                'raw_score': raw_score,
                'calibrated_score': calibrated_score,
                'valid_indicators': valid_indicators
            }
    
    return country_scores

def test_color_distribution(scores):
    """Test how scores distribute across color categories"""
    
    color_categories = {
        'Dark Green (80-100)': 0,
        'Green (60-79)': 0,
        'Amber (40-59)': 0,
        'Red (20-39)': 0,
        'Dark Red (0-19)': 0
    }
    
    for country_code, data in scores.items():
        score = data['calibrated_score']
        if score >= 80:
            color_categories['Dark Green (80-100)'] += 1
        elif score >= 60:
            color_categories['Green (60-79)'] += 1
        elif score >= 40:
            color_categories['Amber (40-59)'] += 1
        elif score >= 20:
            color_categories['Red (20-39)'] += 1
        else:
            color_categories['Dark Red (0-19)'] += 1
    
    return color_categories

if __name__ == "__main__":
    print("=== HEALTH SCORE DISTRIBUTION TEST ===\n")
    
    countries_data = extract_health_scores_from_implementation()
    print(f"Extracted data for {len(countries_data)} test countries")
    
    scores = simulate_health_score_calculation(countries_data)
    
    print("\n=== INDIVIDUAL COUNTRY SCORES ===")
    for country_code, data in sorted(scores.items(), key=lambda x: x[1]['calibrated_score'], reverse=True):
        print(f"{country_code} ({data['name']}): {data['calibrated_score']:.1f} (raw: {data['raw_score']:.1f})")
    
    color_distribution = test_color_distribution(scores)
    
    print(f"\n=== COLOR DISTRIBUTION ===")
    for category, count in color_distribution.items():
        print(f"{category}: {count} countries")
    
    score_range = [data['calibrated_score'] for data in scores.values()]
    print(f"\nScore range: {min(score_range):.1f} - {max(score_range):.1f}")
    
    if max(score_range) - min(score_range) < 30:
        print("⚠️  WARNING: Score range is too narrow - calibration may need adjustment")
    else:
        print("✓ Score distribution looks appropriate")