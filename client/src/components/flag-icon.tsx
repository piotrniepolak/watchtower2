interface FlagIconProps {
  countryCode: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function FlagIcon({ countryCode, size = "sm", className = "" }: FlagIconProps) {
  const sizeClasses = {
    sm: "w-4 h-3 text-xs",
    md: "w-5 h-4 text-sm", 
    lg: "w-6 h-5 text-base"
  };

  const countryNameToCode: Record<string, string> = {
    // Major conflict participants
    "Russia": "RU",
    "Ukraine": "UA", 
    "Israel": "IL",
    "Palestine": "PS",
    "Iran": "IR",
    "Syria": "SY",
    "Turkey": "TR",
    "Saudi Arabia": "SA",
    "Yemen": "YE",
    "Georgia": "GE",
    "China": "CN",
    "Taiwan": "TW",
    "United States": "US",
    "North Korea": "KP",
    "South Korea": "KR",
    "India": "IN",
    "Pakistan": "PK",
    "Lebanon": "LB",
    "Iraq": "IQ",
    "Afghanistan": "AF",
    "Myanmar": "MM",
    "Ethiopia": "ET",
    "Sudan": "SD",
    "Mali": "ML",
    "Nigeria": "NG",
    "Somalia": "SO",
    "Libya": "LY",
    "Egypt": "EG",
    "Morocco": "MA",
    "Algeria": "DZ",
    "Armenia": "AM",
    "Azerbaijan": "AZ",
    "Venezuela": "VE",
    "Colombia": "CO",
    "Mexico": "MX",
    "Haiti": "HT",
    "France": "FR",
    "United Kingdom": "GB",
    "Germany": "DE",
    // Additional regions/entities
    "South Ossetia": "XX", // Not recognized state
    "Abkhazia": "XX", // Not recognized state
    "Donetsk": "XX", // Not recognized state  
    "Luhansk": "XX", // Not recognized state
    "Gaza": "PS", // Use Palestine flag
    "West Bank": "PS", // Use Palestine flag
    "Kurdistan": "XX", // Not recognized state
    "Hezbollah": "LB", // Use Lebanon flag
    "Hamas": "PS", // Use Palestine flag
    "ISIS": "XX", // No flag
    "Houthis": "YE", // Use Yemen flag
    // Military and political entities
    "Myanmar Military": "MM", // Use Myanmar flag
    "Opposition Forces": "MM", // Use Myanmar flag
    "Sudanese Armed Forces": "SD", // Use Sudan flag
    "Rapid Support Forces": "SD", // Use Sudan flag
    "Philippines": "PH",
    "Vietnam": "VN",
    "Malaysia": "MY",
    "Thai Military": "TH",
    "Cambodian Government": "KH",
    "Ethiopian Federal Forces": "ET",
    "Tigray Forces": "ET",
    "Nigerian Military": "NG",
    "Boko Haram": "NG",
    "Malian Government": "ML",
    "Wagner Group": "RU", // Use Russia flag
    "Taliban": "AF", // Use Afghanistan flag
    "Islamic State": "XX", // No flag
    "Al-Qaeda": "XX", // No flag
    "PKK": "TR", // Use Turkey flag (Kurdish organization)
    "Peshmerga": "IQ", // Use Iraq flag
    // Congo M23 Crisis
    "DRC Government": "CD", // Democratic Republic of Congo
    "M23": "XX", // Rebel group - will show as text
    "Rwanda": "RW",
    // Iran-Israel Shadow War
    "Proxies": "XX", // Generic proxy forces - will show as text
    // West Africa Sahel Crisis
    "Niger": "NE", 
    "Burkina Faso": "BF",
    "Jihadist Groups": "XX" // Generic jihadist groups - will show as text
  };

  const getFlagEmoji = (input: string) => {
    if (!input) return "🏳️";
    
    // First try to use input as country code (2 letters)
    let code = input.length === 2 ? input.toUpperCase() : null;
    
    // If not a 2-letter code, try to map from country name
    if (!code) {
      code = countryNameToCode[input] || null;
    }
    
    // If no valid code found, return the first 2 letters of the input
    if (!code || code === "XX") {
      return input.slice(0, 2).toUpperCase();
    }
    
    // Convert to flag emoji
    const codePoints = code
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // Get display name for tooltip
  const getDisplayName = (input: string) => {
    if (input.length === 2) {
      // If it's a country code, find the name
      const foundName = Object.keys(countryNameToCode).find(name => countryNameToCode[name] === input.toUpperCase());
      return foundName || input;
    }
    return input; // Already a country name
  };

  return (
    <span 
      className={`inline-flex items-center justify-center ${sizeClasses[size]} rounded border border-gray-200 bg-white shadow-sm overflow-hidden flex-shrink-0 ${className}`}
      title={getDisplayName(countryCode)}
      style={{ minWidth: size === "sm" ? "16px" : size === "md" ? "20px" : "24px" }}
    >
      {getFlagEmoji(countryCode)}
    </span>
  );
}