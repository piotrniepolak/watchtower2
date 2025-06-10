#!/usr/bin/env python3
"""
Zero-Discrepancy WHO Data Replacement Script
Eliminates ALL discrepancies by using only authentic CSV data
Removes indicators completely when CSV shows "NO DATA"
"""

import csv
import json
import re

def extract_authentic_csv_data():
    """Extract all authentic WHO data from CSV file with zero tolerance for estimates"""
    try:
        with open('attached_assets/Pasted-IndicatorName-IndicatorCode-Location-LocationCode-Year-Disaggregation-NumericValue-DisplayValue-Comm-1749576445239_1749576445242.txt', 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            csv_data = list(reader)
    except FileNotFoundError:
        print("CSV file not found!")
        return {}
    
    # Country mappings to match component structure
    country_mappings = {
        'United States of America': 'USA',
        'China': 'CHN', 
        'India': 'IND',
        'Indonesia': 'IDN',
        'Pakistan': 'PAK',
        'Bangladesh': 'BGD',
        'Nigeria': 'NGA',
        'Brazil': 'BRA',
        'Russian Federation': 'RUS',
        'Mexico': 'MEX',
        'Japan': 'JPN',
        'Philippines': 'PHL',
        'Ethiopia': 'ETH',
        'Viet Nam': 'VNM',
        'Egypt': 'EGY',
        'Turkey': 'TUR',
        'Germany': 'DEU',
        'Islamic Republic of Iran': 'IRN',
        'Thailand': 'THA',
        'United Kingdom of Great Britain and Northern Ireland': 'GBR',
        'France': 'FRA',
        'Italy': 'ITA',
        'Tanzania': 'TZA',
        'South Africa': 'ZAF',
        'Myanmar': 'MMR',
        'Kenya': 'KEN',
        'Republic of Korea': 'KOR',
        'Colombia': 'COL',
        'Spain': 'ESP',
        'Uganda': 'UGA',
        'Argentina': 'ARG',
        'Algeria': 'DZA',
        'Sudan': 'SDN',
        'Ukraine': 'UKR',
        'Iraq': 'IRQ',
        'Afghanistan': 'AFG',
        'Poland': 'POL',
        'Canada': 'CAN',
        'Morocco': 'MAR',
        'Saudi Arabia': 'SAU',
        'Uzbekistan': 'UZB',
        'Peru': 'PER',
        'Angola': 'AGO',
        'Malaysia': 'MYS',
        'Mozambique': 'MOZ',
        'Ghana': 'GHA',
        'Yemen': 'YEM',
        'Nepal': 'NPL',
        'Venezuela': 'VEN',
        'Madagascar': 'MDG',
        'Cameroon': 'CMR',
        'Niger': 'NER',
        'Australia': 'AUS',
        'Democratic People\'s Republic of Korea': 'PRK',
        'Sri Lanka': 'LKA',
        'Burkina Faso': 'BFA',
        'Mali': 'MLI',
        'Romania': 'ROU',
        'Malawi': 'MWI',
        'Chile': 'CHL',
        'Kazakhstan': 'KAZ',
        'Zambia': 'ZMB',
        'Guatemala': 'GTM',
        'Ecuador': 'ECU',
        'Syria': 'SYR',
        'Netherlands': 'NLD',
        'Senegal': 'SEN',
        'Cambodia': 'KHM',
        'Chad': 'TCD',
        'Somalia': 'SOM',
        'Zimbabwe': 'ZWE',
        'Guinea': 'GIN',
        'Rwanda': 'RWA',
        'Benin': 'BEN',
        'Burundi': 'BDI',
        'Tunisia': 'TUN',
        'Bolivia': 'BOL',
        'Belgium': 'BEL',
        'Haiti': 'HTI',
        'Cuba': 'CUB',
        'South Sudan': 'SSD',
        'Dominican Republic': 'DOM',
        'Czech Republic': 'CZE',
        'Greece': 'GRC',
        'Jordan': 'JOR',
        'Portugal': 'PRT',
        'Azerbaijan': 'AZE',
        'Sweden': 'SWE',
        'Honduras': 'HND',
        'United Arab Emirates': 'ARE',
        'Hungary': 'HUN',
        'Tajikistan': 'TJK',
        'Belarus': 'BLR',
        'Austria': 'AUT',
        'Papua New Guinea': 'PNG',
        'Serbia': 'SRB',
        'Israel': 'ISR',
        'Switzerland': 'CHE',
        'Togo': 'TGO',
        'Sierra Leone': 'SLE',
        'Laos': 'LAO',
        'Paraguay': 'PRY',
        'Libya': 'LBY',
        'Bulgaria': 'BGR',
        'Lebanon': 'LBN',
        'Nicaragua': 'NIC',
        'Kyrgyzstan': 'KGZ',
        'El Salvador': 'SLV',
        'Turkmenistan': 'TKM',
        'Singapore': 'SGP',
        'Denmark': 'DNK',
        'Finland': 'FIN',
        'Congo': 'COG',
        'Slovakia': 'SVK',
        'Norway': 'NOR',
        'Oman': 'OMN',
        'Palestine': 'PSE',
        'Costa Rica': 'CRI',
        'Liberia': 'LBR',
        'Ireland': 'IRL',
        'Central African Republic': 'CAF',
        'New Zealand': 'NZL',
        'Mauritania': 'MRT',
        'Panama': 'PAN',
        'Kuwait': 'KWT',
        'Croatia': 'HRV',
        'Moldova': 'MDA',
        'Georgia': 'GEO',
        'Eritrea': 'ERI',
        'Uruguay': 'URY',
        'Bosnia and Herzegovina': 'BIH',
        'Mongolia': 'MNG',
        'Armenia': 'ARM',
        'Jamaica': 'JAM',
        'Qatar': 'QAT',
        'Albania': 'ALB',
        'Puerto Rico': 'PRI',
        'Lithuania': 'LTU',
        'Namibia': 'NAM',
        'Gambia': 'GMB',
        'Botswana': 'BWA',
        'Gabon': 'GAB',
        'Lesotho': 'LSO',
        'North Macedonia': 'MKD',
        'Slovenia': 'SVN',
        'Guinea-Bissau': 'GNB',
        'Latvia': 'LVA',
        'Bahrain': 'BHR',
        'Equatorial Guinea': 'GNQ',
        'Trinidad and Tobago': 'TTO',
        'Estonia': 'EST',
        'Timor-Leste': 'TLS',
        'Mauritius': 'MUS',
        'Cyprus': 'CYP',
        'Eswatini': 'SWZ',
        'Djibouti': 'DJI',
        'Fiji': 'FJI',
        'Reunion': 'REU',
        'Comoros': 'COM',
        'Guyana': 'GUY',
        'Bhutan': 'BTN',
        'Solomon Islands': 'SLB',
        'Montenegro': 'MNE',
        'Western Sahara': 'ESH',
        'Luxembourg': 'LUX',
        'Suriname': 'SUR',
        'Cabo Verde': 'CPV',  
        'Micronesia': 'FSM',
        'Maldives': 'MDV',
        'Malta': 'MLT',
        'Brunei': 'BRN',
        'Belize': 'BLZ',
        'Bahamas': 'BHS',
        'Iceland': 'ISL',
        'Vanuatu': 'VUT',
        'Barbados': 'BRB',
        'Sao Tome and Principe': 'STP',
        'Samoa': 'WSM',
        'Saint Lucia': 'LCA',
        'Kiribati': 'KIR',
        'Grenada': 'GRD',
        'Saint Vincent and the Grenadines': 'VCT',
        'Tonga': 'TON',
        'Seychelles': 'SYC',
        'Antigua and Barbuda': 'ATG',
        'Andorra': 'AND',
        'Dominica': 'DMA',
        'Marshall Islands': 'MHL',
        'Saint Kitts and Nevis': 'KNA',
        'Liechtenstein': 'LIE',
        'Monaco': 'MCO',
        'San Marino': 'SMR',
        'Palau': 'PLW',
        'Tuvalu': 'TUV',
        'Nauru': 'NRU',
        'Holy See': 'VAT'
    }
    
    authentic_data = {}
    
    # Process only authentic CSV entries
    for row in csv_data:
        location = row['Location']
        indicator = row['IndicatorName']
        
        # Skip if country not in our mappings
        if location not in country_mappings:
            continue
            
        country_code = country_mappings[location]
        numeric_value = row['NumericValue']
        
        # Only include if we have authentic numeric data (not empty/null)
        if numeric_value and str(numeric_value).strip() != '' and str(numeric_value).strip().lower() != 'nan':
            try:
                value = float(numeric_value)
                if country_code not in authentic_data:
                    authentic_data[country_code] = {}
                authentic_data[country_code][indicator] = value
            except ValueError:
                # Skip invalid numeric values
                continue
    
    return authentic_data

def generate_zero_discrepancy_replacement():
    """Generate complete replacement with ONLY authentic CSV data"""
    
    print("Extracting authentic WHO data from CSV...")
    authentic_data = extract_authentic_csv_data()
    
    if not authentic_data:
        print("No authentic data found!")
        return
    
    print(f"Found authentic data for {len(authentic_data)} countries")
    
    # Generate complete replacement code
    replacement_code = """
// ZERO-DISCREPANCY WHO DATA - AUTHENTIC CSV VALUES ONLY
// Generated with absolute zero tolerance for estimates or approximations
// Only indicators with authentic WHO Statistical Annex data are included

const generateAuthenticWHOData = () => {
  return {"""
    
    for country_code, indicators in authentic_data.items():
        country_name = get_country_name(country_code)
        replacement_code += f"""
    '{country_code}': {{
      name: '{country_name}',
      indicators: {{"""
        
        for indicator, value in indicators.items():
            # Format with full precision from CSV
            replacement_code += f"""
        '{indicator}': {value},"""
        
        replacement_code += """
      }
    },"""
    
    replacement_code += """
  };
};

export { generateAuthenticWHOData };"""
    
    # Write complete replacement
    with open('zero_discrepancy_complete.js', 'w') as f:
        f.write(replacement_code)
    
    print(f"Generated zero-discrepancy replacement with {sum(len(indicators) for indicators in authentic_data.values())} authentic data points")
    
    # Generate summary
    print("\nAUTHENTIC DATA SUMMARY:")
    for country_code, indicators in authentic_data.items():
        print(f"{country_code}: {len(indicators)} authentic indicators")

def get_country_name(code):
    """Get country name from ISO code"""
    name_mappings = {
        'USA': 'United States of America',
        'CHN': 'China',
        'IND': 'India',
        'IDN': 'Indonesia',
        'PAK': 'Pakistan',
        'BGD': 'Bangladesh',
        'NGA': 'Nigeria',
        'BRA': 'Brazil',
        'RUS': 'Russian Federation',
        'MEX': 'Mexico',
        'JPN': 'Japan',
        'PHL': 'Philippines',
        'ETH': 'Ethiopia',
        'VNM': 'Vietnam',
        'EGY': 'Egypt',
        'TUR': 'Turkey',
        'DEU': 'Germany',
        'IRN': 'Iran',
        'THA': 'Thailand',
        'GBR': 'United Kingdom',
        'FRA': 'France',
        'ITA': 'Italy',
        'TZA': 'Tanzania',
        'ZAF': 'South Africa',
        'MMR': 'Myanmar',
        'KEN': 'Kenya',
        'KOR': 'South Korea',
        'COL': 'Colombia',
        'ESP': 'Spain',
        'UGA': 'Uganda',
        'ARG': 'Argentina',
        'DZA': 'Algeria',
        'SDN': 'Sudan',
        'UKR': 'Ukraine',
        'IRQ': 'Iraq',
        'AFG': 'Afghanistan',
        'POL': 'Poland',
        'CAN': 'Canada',
        'MAR': 'Morocco',
        'SAU': 'Saudi Arabia',
        'UZB': 'Uzbekistan',
        'PER': 'Peru',
        'AGO': 'Angola',
        'MYS': 'Malaysia',
        'MOZ': 'Mozambique',
        'GHA': 'Ghana',
        'YEM': 'Yemen',
        'NPL': 'Nepal',
        'VEN': 'Venezuela',
        'MDG': 'Madagascar',
        'CMR': 'Cameroon',
        'NER': 'Niger',
        'AUS': 'Australia',
        'PRK': 'North Korea',
        'LKA': 'Sri Lanka',
        'BFA': 'Burkina Faso',
        'MLI': 'Mali',
        'ROU': 'Romania',
        'MWI': 'Malawi',
        'CHL': 'Chile',
        'KAZ': 'Kazakhstan',
        'ZMB': 'Zambia',
        'GTM': 'Guatemala',
        'ECU': 'Ecuador',
        'SYR': 'Syria',
        'NLD': 'Netherlands',
        'SEN': 'Senegal',
        'KHM': 'Cambodia',
        'TCD': 'Chad',
        'SOM': 'Somalia',
        'ZWE': 'Zimbabwe',
        'GIN': 'Guinea',
        'RWA': 'Rwanda',
        'BEN': 'Benin',
        'BDI': 'Burundi',
        'TUN': 'Tunisia',
        'BOL': 'Bolivia',
        'BEL': 'Belgium',
        'HTI': 'Haiti',
        'CUB': 'Cuba',
        'SSD': 'South Sudan',
        'DOM': 'Dominican Republic',
        'CZE': 'Czech Republic',
        'GRC': 'Greece',
        'JOR': 'Jordan',
        'PRT': 'Portugal',
        'AZE': 'Azerbaijan',
        'SWE': 'Sweden',
        'HND': 'Honduras',
        'ARE': 'United Arab Emirates',
        'HUN': 'Hungary',
        'TJK': 'Tajikistan',
        'BLR': 'Belarus',
        'AUT': 'Austria',
        'PNG': 'Papua New Guinea',
        'SRB': 'Serbia',
        'ISR': 'Israel',
        'CHE': 'Switzerland',
        'TGO': 'Togo',
        'SLE': 'Sierra Leone',
        'LAO': 'Laos',
        'PRY': 'Paraguay',
        'LBY': 'Libya',
        'BGR': 'Bulgaria',
        'LBN': 'Lebanon',
        'NIC': 'Nicaragua',
        'KGZ': 'Kyrgyzstan',
        'SLV': 'El Salvador',
        'TKM': 'Turkmenistan',
        'SGP': 'Singapore',
        'DNK': 'Denmark',
        'FIN': 'Finland',
        'COG': 'Congo',
        'SVK': 'Slovakia',
        'NOR': 'Norway',
        'OMN': 'Oman',
        'PSE': 'Palestine',
        'CRI': 'Costa Rica',
        'LBR': 'Liberia',
        'IRL': 'Ireland',
        'CAF': 'Central African Republic',
        'NZL': 'New Zealand',
        'MRT': 'Mauritania',
        'PAN': 'Panama',
        'KWT': 'Kuwait',
        'HRV': 'Croatia',
        'MDA': 'Moldova',
        'GEO': 'Georgia',
        'ERI': 'Eritrea',
        'URY': 'Uruguay',
        'BIH': 'Bosnia and Herzegovina',
        'MNG': 'Mongolia',
        'ARM': 'Armenia',
        'JAM': 'Jamaica',
        'QAT': 'Qatar',
        'ALB': 'Albania',
        'PRI': 'Puerto Rico',
        'LTU': 'Lithuania',
        'NAM': 'Namibia',
        'GMB': 'Gambia',
        'BWA': 'Botswana',
        'GAB': 'Gabon',
        'LSO': 'Lesotho',
        'MKD': 'North Macedonia',
        'SVN': 'Slovenia',
        'GNB': 'Guinea-Bissau',
        'LVA': 'Latvia',
        'BHR': 'Bahrain',
        'GNQ': 'Equatorial Guinea',
        'TTO': 'Trinidad and Tobago',
        'EST': 'Estonia',
        'TLS': 'Timor-Leste',
        'MUS': 'Mauritius',
        'CYP': 'Cyprus',
        'SWZ': 'Eswatini',
        'DJI': 'Djibouti',
        'FJI': 'Fiji',
        'COM': 'Comoros',
        'GUY': 'Guyana',
        'BTN': 'Bhutan',
        'SLB': 'Solomon Islands',
        'MNE': 'Montenegro',
        'LUX': 'Luxembourg',
        'SUR': 'Suriname',
        'CPV': 'Cabo Verde',
        'FSM': 'Micronesia',
        'MDV': 'Maldives',
        'MLT': 'Malta',
        'BRN': 'Brunei',
        'BLZ': 'Belize',
        'BHS': 'Bahamas',
        'ISL': 'Iceland',
        'VUT': 'Vanuatu',
        'BRB': 'Barbados',
        'STP': 'Sao Tome and Principe',
        'WSM': 'Samoa',
        'LCA': 'Saint Lucia',
        'KIR': 'Kiribati',
        'GRD': 'Grenada',
        'VCT': 'Saint Vincent and the Grenadines',
        'TON': 'Tonga',
        'SYC': 'Seychelles',
        'ATG': 'Antigua and Barbuda',
        'AND': 'Andorra',
        'DMA': 'Dominica',
        'MHL': 'Marshall Islands',
        'KNA': 'Saint Kitts and Nevis',
        'LIE': 'Liechtenstein',
        'MCO': 'Monaco',
        'SMR': 'San Marino',
        'PLW': 'Palau',
        'TUV': 'Tuvalu',
        'NRU': 'Nauru'
    }
    return name_mappings.get(code, code)

if __name__ == "__main__":
    generate_zero_discrepancy_replacement()