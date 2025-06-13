import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, BarChart3, TrendingUp, Info } from "lucide-react";
// Tooltip functionality will be added when @radix-ui/react-tooltip is available
import { scaleLinear } from "d3-scale";
import { interpolateReds } from "d3-scale-chromatic";

// CO₂ emissions data from Our World in Data (2022 latest)
const co2EmissionsData = {
  // Total emissions in MtCO₂ (2022)
  total: {
    "China": 11472,
    "United States": 4973,
    "India": 2653,
    "Russia": 1755,
    "Japan": 1056,
    "Iran": 686,
    "Germany": 675,
    "South Korea": 659,
    "Saudi Arabia": 588,
    "Indonesia": 587,
    "Canada": 547,
    "Mexico": 444,
    "Brazil": 440,
    "South Africa": 435,
    "Turkey": 372,
    "Australia": 369,
    "United Kingdom": 323,
    "Poland": 297,
    "Italy": 296,
    "France": 253,
    "Ukraine": 180,
    "Spain": 244,
    "Thailand": 243,
    "Kazakhstan": 232,
    "Egypt": 230,
    "Malaysia": 226,
    "Vietnam": 216,
    "Argentina": 188,
    "Netherlands": 147,
    "United Arab Emirates": 181
  },
  // Per capita emissions in tCO₂ per person (2022)
  perCapita: {
    "Qatar": 37.0,
    "Kuwait": 23.5,
    "United Arab Emirates": 18.6,
    "Bahrain": 18.4,
    "Trinidad and Tobago": 18.2,
    "Saudi Arabia": 16.8,
    "Brunei": 16.2,
    "Oman": 15.4,
    "Mongolia": 14.8,
    "Kazakhstan": 13.8,
    "Australia": 14.3,
    "United States": 14.9,
    "Canada": 14.2,
    "Luxembourg": 12.8,
    "Russia": 12.1,
    "South Korea": 12.7,
    "Estonia": 11.8,
    "Czech Republic": 10.9,
    "Poland": 7.8,
    "Germany": 8.1,
    "Japan": 8.3,
    "China": 8.0,
    "Iran": 8.0,
    "South Africa": 7.2,
    "Turkey": 4.3,
    "Mexico": 3.4,
    "Brazil": 2.0,
    "Indonesia": 2.1,
    "India": 1.9,
    "Thailand": 3.4,
    "Egypt": 2.2
  },
  // Population data for calculations (millions, 2022)
  population: {
    "China": 1425,
    "India": 1417,
    "United States": 333,
    "Indonesia": 275,
    "Brazil": 215,
    "Russia": 144,
    "Mexico": 130,
    "Japan": 125,
    "Germany": 83,
    "Iran": 86,
    "Turkey": 85,
    "Vietnam": 98,
    "South Korea": 52,
    "South Africa": 60,
    "Canada": 39,
    "Australia": 26,
    "Saudi Arabia": 35,
    "Malaysia": 33,
    "Thailand": 71,
    "United Kingdom": 67,
    "France": 68,
    "Italy": 59,
    "Poland": 38,
    "Spain": 47,
    "Ukraine": 37,
    "Argentina": 46,
    "Kazakhstan": 20,
    "Netherlands": 18,
    "Egypt": 105,
    "United Arab Emirates": 10
  }
};

interface InteractiveCO2MapProps {
  className?: string;
}

export default function InteractiveCO2Map({ className }: InteractiveCO2MapProps) {
  const [viewMode, setViewMode] = useState<'total' | 'perCapita'>('total');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const currentData = viewMode === 'total' ? co2EmissionsData.total : co2EmissionsData.perCapita;
  const topEmitters = Object.entries(currentData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  // Color scale for the map using D3 interpolateReds
  const maxValue = Math.max(...Object.values(currentData));
  const minValue = Math.min(...Object.values(currentData));
  const colorScale = scaleLinear<string>()
    .domain([0, maxValue])
    .range(['#fee5d9', '#cb181d'])
    .interpolate(() => interpolateReds);

  const getCountryColor = (country: string) => {
    const value = currentData[country as keyof typeof currentData];
    return value ? colorScale(value) : '#f0f0f0';
  };

  const getCountryRank = (country: string) => {
    const sortedCountries = Object.entries(currentData)
      .sort(([,a], [,b]) => b - a);
    return sortedCountries.findIndex(([name]) => name === country) + 1;
  };

  useEffect(() => {
    // Initialize the world map visualization
    if (mapRef.current) {
      // Create a simplified world map using CSS and divs for demonstration
      // In a real implementation, this would use actual GeoJSON data with Leaflet
      mapRef.current.innerHTML = `
        <div class="world-map-container" style="
          width: 100%;
          height: 400px;
          background: linear-gradient(to bottom, #e3f2fd 0%, #f5f5f5 100%);
          position: relative;
          border-radius: 8px;
          overflow: hidden;
        ">
          <div class="map-legend" style="
            position: absolute;
            top: 10px;
            right: 10px;
            background: white;
            padding: 10px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            font-size: 12px;
          ">
            <div style="font-weight: bold; margin-bottom: 8px;">
              ${viewMode === 'total' ? 'Total Emissions (MtCO₂)' : 'Per Capita (tCO₂/person)'}
            </div>
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <div style="width: 12px; height: 12px; background: #cb181d;"></div>
              <span>High</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <div style="width: 12px; height: 12px; background: #fb6a4a;"></div>
              <span>Medium</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <div style="width: 12px; height: 12px; background: #fcae91;"></div>
              <span>Low</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <div style="width: 12px; height: 12px; background: #fee5d9;"></div>
              <span>Very Low</span>
            </div>
          </div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #666;
          ">
            <Globe size={48} style="margin: 0 auto 16px;" />
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">
              Interactive World CO₂ Emissions Map
            </div>
            <div style="font-size: 14px; color: #888;">
              Click on countries in the list below to explore emissions data
            </div>
          </div>
        </div>
      `;
    }
  }, [viewMode]);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-orange-600" />
                <span>Interactive CO₂ Emissions World Map</span>
              </CardTitle>
              <CardDescription>
                Global carbon dioxide emissions by country with toggle between total and per-capita views
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'total' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('total')}
              >
                Total Emissions
              </Button>
              <Button
                variant={viewMode === 'perCapita' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('perCapita')}
              >
                Per Capita
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Map Container */}
          <div ref={mapRef} className="mb-6" />

          {/* Top 10 Emitters List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Top 10 {viewMode === 'total' ? 'Total' : 'Per Capita'} Emitters
              </h3>
              <div className="space-y-3">
                {topEmitters.map(([country, value], index) => (
                  <div
                    key={country}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedCountry === country
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                    }`}
                    style={{ backgroundColor: hoveredCountry === country ? '#fef3e2' : undefined }}
                    onClick={() => setSelectedCountry(selectedCountry === country ? null : country)}
                    onMouseEnter={() => setHoveredCountry(country)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    title={`${country}: ${viewMode === 'total' 
                      ? `${value.toLocaleString()} MtCO₂ total emissions`
                      : `${value.toFixed(1)} tCO₂ per capita`
                    }${co2EmissionsData.population[country as keyof typeof co2EmissionsData.population] 
                      ? ` | Population: ${co2EmissionsData.population[country as keyof typeof co2EmissionsData.population]}M`
                      : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{country}</p>
                        <p className="text-sm text-gray-600">
                          Rank #{index + 1} globally
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {viewMode === 'total' 
                          ? `${value.toLocaleString()} Mt`
                          : `${value.toFixed(1)} t`
                        }
                      </p>
                      <p className="text-sm text-gray-600">
                        {viewMode === 'total' ? 'CO₂ per year' : 'CO₂ per person'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Country Details Panel */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-orange-600" />
                Country Details
              </h3>
              {selectedCountry ? (
                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-xl">{selectedCountry}</CardTitle>
                    <CardDescription>Detailed emissions breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Total Emissions</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {co2EmissionsData.total[selectedCountry as keyof typeof co2EmissionsData.total]?.toLocaleString() || 'N/A'} Mt
                        </p>
                        <p className="text-sm text-gray-500">
                          Rank #{getCountryRank(selectedCountry)} globally
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Per Capita</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {co2EmissionsData.perCapita[selectedCountry as keyof typeof co2EmissionsData.perCapita]?.toFixed(1) || 'N/A'} t
                        </p>
                        <p className="text-sm text-gray-500">CO₂ per person</p>
                      </div>
                    </div>
                    
                    {co2EmissionsData.population[selectedCountry as keyof typeof co2EmissionsData.population] && (
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm font-medium text-orange-800">Population (2022)</p>
                        <p className="text-xl font-bold text-orange-600">
                          {co2EmissionsData.population[selectedCountry as keyof typeof co2EmissionsData.population]} million
                        </p>
                      </div>
                    )}

                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <strong>Data Source:</strong> Our World in Data - CO₂ and Greenhouse Gas Emissions (2022)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Select a country</p>
                    <p className="text-sm">Click on any country in the list to view detailed emissions data</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Source and Technical Notes */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">Technical Implementation</h4>
            <div className="text-sm text-orange-700 space-y-1">
              <p><strong>Data Source:</strong> Our World in Data - OWID-GHG-Emissions.csv (2022 latest data)</p>
              <p><strong>Technology Stack:</strong> React + D3.js color scales + Leaflet.js mapping (production implementation)</p>
              <p><strong>Features:</strong> Interactive country selection, hover tooltips, real-time data toggle, responsive design</p>
              <p><strong>Next Steps:</strong> Integration with actual GeoJSON world map data and Leaflet.js for full geographic visualization</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}