import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Users, Building2, ExternalLink, Star, StarOff } from "lucide-react";
import CompanyLogo from "@/components/company-logo";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useSimpleAuth";
import { useLocalWatchlist } from "@/hooks/useLocalWatchlist";
import type { Stock } from "@shared/schema";

export default function Markets() {
  const { isAuthenticated } = useAuth();
  const watchlist = useLocalWatchlist();
  
  const { data: stocks, isLoading } = useQuery({
    queryKey: ["/api/stocks"],
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Generate mock historical data for each stock
  const generateStockHistory = (currentPrice: number, symbol: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      price: currentPrice * (0.85 + (index * 0.03) + Math.random() * 0.1)
    }));
  };

  const companyProfiles = {
    "LMT": {
      fullName: "Lockheed Martin Corporation",
      description: "Global aerospace, defense, arms, security, and advanced technologies company with worldwide interests.",
      headquarters: "Bethesda, Maryland, USA",
      employees: "116,000",
      founded: "1995",
      ceo: "James Taiclet",
      specialties: ["Aeronautics", "Missiles & Fire Control", "Rotary & Mission Systems", "Space"],
      majorContracts: ["F-35 Lightning II", "Aegis Combat System", "THAAD", "Orion Spacecraft"],
      website: "https://www.lockheedmartin.com"
    },
    "RTX": {
      fullName: "RTX Corporation",
      description: "Aerospace and defense company providing advanced systems and services for commercial, military and government customers.",
      headquarters: "Arlington, Virginia, USA", 
      employees: "185,000",
      founded: "2020 (merger)",
      ceo: "Greg Hayes",
      specialties: ["Commercial Aerospace", "Defense Systems", "Intelligence & Space"],
      majorContracts: ["Patriot Missile System", "Tomahawk Cruise Missile", "AN/TPY-2 Radar"],
      website: "https://www.rtx.com"
    },
    "NOC": {
      fullName: "Northrop Grumman Corporation",
      description: "Global aerospace and defense technology company providing solutions in autonomous systems, cyber, space and strike.",
      headquarters: "Falls Church, Virginia, USA",
      employees: "95,000", 
      founded: "1994",
      ceo: "Kathy Warden",
      specialties: ["Aeronautics Systems", "Defense Systems", "Mission Systems", "Space Systems"],
      majorContracts: ["B-21 Raider", "Global Hawk", "James Webb Space Telescope", "Ground Based Strategic Deterrent"],
      website: "https://www.northropgrumman.com"
    },
    "GD": {
      fullName: "General Dynamics Corporation",
      description: "Global aerospace and defense company offering a broad portfolio of products and services in business aviation, combat vehicles, weapons systems and munitions.",
      headquarters: "Reston, Virginia, USA",
      employees: "106,000",
      founded: "1952",
      ceo: "Phebe Novakovic", 
      specialties: ["Aerospace", "Combat Systems", "Information Technology", "Marine Systems"],
      majorContracts: ["Abrams Tank", "Stryker Vehicle", "Columbia-class Submarine", "Gulfstream Aircraft"],
      website: "https://www.gd.com"
    },
    "BA": {
      fullName: "The Boeing Company",
      description: "Multinational corporation that designs, manufactures, and sells airplanes, rotorcraft, rockets, satellites, telecommunications equipment, and missiles.",
      headquarters: "Chicago, Illinois, USA",
      employees: "156,000",
      founded: "1916", 
      ceo: "Dave Calhoun",
      specialties: ["Commercial Airplanes", "Defense Space & Security", "Global Services"],
      majorContracts: ["KC-46 Tanker", "P-8 Poseidon", "F/A-18 Super Hornet", "SLS Rocket"],
      website: "https://www.boeing.com"
    },
    "HII": {
      fullName: "Huntington Ingalls Industries",
      description: "America's largest military shipbuilding company and a provider of professional services to partners in government and industry.",
      headquarters: "Newport News, Virginia, USA",
      employees: "44,000",
      founded: "2011",
      ceo: "Chris Kastner",
      specialties: ["Ingalls Shipbuilding", "Newport News Shipbuilding", "HII Technologies", "Mission Technologies"],
      majorContracts: ["Gerald R. Ford-class Aircraft Carrier", "Virginia-class Submarine", "Arleigh Burke-class Destroyer"],
      website: "https://www.huntingtoningalls.com"
    },
    "LHX": {
      fullName: "L3Harris Technologies",
      description: "Technology company serving customers in over 130 countries, providing mission-critical solutions for defense, civil government and commercial markets.",
      headquarters: "Melbourne, Florida, USA",
      employees: "47,000",
      founded: "2019 (merger)",
      ceo: "Christopher Kubasik",
      specialties: ["Space & Airborne Systems", "Integrated Mission Systems", "Communication Systems", "Aerojet Rocketdyne"],
      majorContracts: ["Falcon SATCOM", "WESCAM MX-Series", "Night Vision Systems", "RS-25 Rocket Engine"],
      website: "https://www.l3harris.com"
    },
    "TDG": {
      fullName: "TransDigm Group",
      description: "Leading global designer, producer and supplier of highly engineered aircraft components for use on nearly all commercial and military aircraft in service today.",
      headquarters: "Cleveland, Ohio, USA",
      employees: "26,000",
      founded: "1993",
      ceo: "Kevin Stein",
      specialties: ["Power & Control", "Airframe", "Non-aviation", "Aftermarket Services"],
      majorContracts: ["Aircraft Ignition Systems", "Cargo Loading Systems", "Aircraft Lighting", "Flight Safety Components"],
      website: "https://www.transdigm.com"
    },
    "LDOS": {
      fullName: "Leidos Holdings",
      description: "Science and technology solutions leader working to solve the world's toughest challenges in the defense, intelligence, civil, and health markets.",
      headquarters: "Reston, Virginia, USA",
      employees: "47,000",
      founded: "2013",
      ceo: "Thomas Bell",
      specialties: ["Defense Solutions", "Civil", "Health", "Intelligence"],
      majorContracts: ["DISA Encore III", "DHS OASIS", "NASA CIO-SP3", "DOD SEWP V"],
      website: "https://www.leidos.com"
    },
    "CACI": {
      fullName: "CACI International",
      description: "Information solutions and services company dedicated to helping its customers differentiate themselves and gain a competitive advantage.",
      headquarters: "Reston, Virginia, USA",
      employees: "23,000",
      founded: "1962",
      ceo: "John Mengucci",
      specialties: ["Enterprise IT", "Mission & Domain Expertise", "Cyber Security", "Intelligence Services"],
      majorContracts: ["Army DCGS-A", "Navy SeaPort-e", "DISA Encore III", "GSA Alliant 2"],
      website: "https://www.caci.com"
    },
    "SAIC": {
      fullName: "Science Applications International",
      description: "Technology integrator providing full life cycle services and solutions in the technical, engineering and enterprise information technology markets.",
      headquarters: "Reston, Virginia, USA",
      employees: "25,500",
      founded: "2013",
      ceo: "Nazzic Keene",
      specialties: ["Digital Modernization", "Mission Solutions", "Defense Systems", "Space & Intelligence"],
      majorContracts: ["Navy SeaPort-NxG", "DISA Encore III", "GSA OASIS", "Army CIO-SP3"],
      website: "https://www.saic.com"
    },
    "RHM.DE": {
      fullName: "Rheinmetall AG",
      description: "German automotive and arms manufacturer focusing on mobility and security technologies including defense systems and military vehicles.",
      headquarters: "Düsseldorf, Germany",
      employees: "25,000",
      founded: "1889",
      ceo: "Armin Papperger",
      specialties: ["Defence", "Automotive", "Electronic Solutions", "Digital Solutions"],
      majorContracts: ["Lynx Infantry Fighting Vehicle", "Leopard 2 Tank Systems", "Oerlikon Air Defence", "Future Combat Air System"],
      website: "https://www.rheinmetall.com"
    },
    "BA.L": {
      fullName: "BAE Systems plc",
      description: "British multinational arms, security, and aerospace company providing defense, aerospace and security solutions globally.",
      headquarters: "London, United Kingdom",
      employees: "93,500",
      founded: "1999",
      ceo: "Charles Woodburn",
      specialties: ["Air", "Maritime", "Land & Armaments", "Electronic Systems", "Cyber & Intelligence"],
      majorContracts: ["Eurofighter Typhoon", "F-35 Lightning II Components", "Type 26 Frigate", "M777 Howitzer"],
      website: "https://www.baesystems.com"
    },
    "HWM": {
      fullName: "Howmet Aerospace Inc",
      description: "Leading global provider of advanced engineered solutions for the aerospace and transportation industries.",
      headquarters: "Pittsburgh, Pennsylvania, USA",
      employees: "22,500",
      founded: "2020",
      ceo: "John Plant",
      specialties: ["Engine Products", "Fastening Systems", "Engineered Structures", "Forged Wheels"],
      majorContracts: ["F-35 Engine Components", "Boeing 787 Fasteners", "Airbus A350 Structures", "Commercial Engine Parts"],
      website: "https://www.howmet.com"
    },
    "KTOS": {
      fullName: "Kratos Defense & Security Solutions Inc",
      description: "Specialized technology company providing mission critical products, solutions and services for United States national security priorities.",
      headquarters: "San Diego, California, USA",
      employees: "4,200",
      founded: "1994",
      ceo: "Eric DeMarco",
      specialties: ["Unmanned Systems", "Satellite Communications", "Cyber Warfare", "Microwave Electronics"],
      majorContracts: ["BQM-167 Aerial Target", "UTAP-22 Mako", "DroneDefender", "OpenSpace Platform"],
      website: "https://www.kratosdefense.com"
    },
    "AVAV": {
      fullName: "AeroVironment Inc",
      description: "Global leader in intelligent, multi-domain robotic systems, providing customers with actionable intelligence for better decisions.",
      headquarters: "Arlington, Virginia, USA",
      employees: "1,000",
      founded: "1971",
      ceo: "Wahid Nawabi",
      specialties: ["Small Unmanned Aircraft", "Tactical Missile Systems", "High Altitude Pseudo-Satellites", "Commercial Solutions"],
      majorContracts: ["Switchblade Loitering Munition", "Raven Drone System", "Puma Unmanned Aircraft", "JUMP 20 VTOL"],
      website: "https://www.avinc.com"
    },
    "CW": {
      fullName: "Curtiss-Wright Corporation",
      description: "Global integrated business that provides highly engineered products and services to the commercial, industrial, defense and energy markets.",
      headquarters: "Davidson, North Carolina, USA",
      employees: "8,600",
      founded: "1929",
      ceo: "Lynn Bamford",
      specialties: ["Defense Solutions", "Commercial/Industrial", "Power Generation", "Naval & Land Systems"],
      majorContracts: ["Nuclear Reactor Controls", "Flight Test Equipment", "Weapons Handling Systems", "Naval Propulsion Components"],
      website: "https://www.curtisswright.com"
    },
    "MRCY": {
      fullName: "Mercury Systems Inc",
      description: "Technology company serving the aerospace and defense industry, enabling customers to respond to evolving threats with secure processing power.",
      headquarters: "Andover, Massachusetts, USA",
      employees: "2,500",
      founded: "1981",
      ceo: "William Ballhaus",
      specialties: ["Mission Computers", "Radio Frequency Solutions", "Microelectronics", "Software & Services"],
      majorContracts: ["F-35 Mission Computer", "Aegis Combat System", "Patriot Missile Defense", "Electronic Warfare Systems"],
      website: "https://www.mrcy.com"
    },
    "TXT": {
      fullName: "Textron Inc",
      description: "Multi-industry company leveraging global network of aircraft, defense, industrial and finance businesses to provide customers innovative solutions.",
      headquarters: "Providence, Rhode Island, USA",
      employees: "35,000",
      founded: "1923",
      ceo: "Scott Donnelly",
      specialties: ["Aviation", "Defense", "Industrial", "Finance"],
      majorContracts: ["V-22 Osprey", "AH-1Z Viper Helicopter", "Shadow Drone", "Ship-to-Shore Connector"],
      website: "https://www.textron.com"
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
            <div className="grid gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-96 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Defense Contractor Markets
          </h2>
          <p className="text-slate-600 mb-6">
            Comprehensive analysis of major defense contractors and their market performance
          </p>

          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Defense Index</p>
                    <p className="text-2xl font-bold text-slate-900">$319.07</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+3.2%</span>
                  <span className="text-slate-600 ml-1">today</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Market Cap</p>
                    <p className="text-2xl font-bold text-slate-900">$766.1B</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+2.1%</span>
                  <span className="text-slate-600 ml-1">this week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Companies</p>
                    <p className="text-2xl font-bold text-slate-900">{(stocks as Stock[] || []).length}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-slate-600">Major contractors</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Details */}
          <div className="space-y-8">
            {(stocks as Stock[] || []).map((stock) => {
              const profile = companyProfiles[stock.symbol as keyof typeof companyProfiles];
              const chartData = generateStockHistory(stock.price, stock.symbol);
              
              return (
                <Card key={stock.symbol} className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <CompanyLogo symbol={stock.symbol} name={stock.name} size="lg" />
                        <div className="ml-4">
                          <CardTitle className="text-xl">{profile?.fullName || stock.name}</CardTitle>
                          <p className="text-slate-600 mt-1">{stock.symbol} • {profile?.headquarters}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">${stock.price.toFixed(2)}</div>
                        <div className={`flex items-center ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.changePercent >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                          <span className="font-medium">
                            {stock.changePercent >= 0 ? '+' : ''}${stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Company Overview</h4>
                          <p className="text-slate-700 leading-relaxed">{profile?.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-600">Founded:</span>
                            <div className="text-slate-900">{profile?.founded}</div>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">CEO:</span>
                            <div className="text-slate-900">{profile?.ceo}</div>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Employees:</span>
                            <div className="text-slate-900">{profile?.employees}</div>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Market Cap:</span>
                            <div className="text-slate-900">{stock.marketCap}</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Specialties</h4>
                          <div className="flex flex-wrap gap-2">
                            {profile?.specialties.map((specialty, index) => (
                              <Badge key={index} variant="secondary">{specialty}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Major Contracts</h4>
                          <ul className="space-y-1">
                            {profile?.majorContracts.map((contract, index) => (
                              <li key={index} className="text-slate-700 text-sm">• {contract}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-4">6-Month Price Chart</h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px'
                                  }}
                                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="price" 
                                  stroke="#0ea5e9" 
                                  strokeWidth={2}
                                  dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-slate-50 rounded-lg p-4">
                            <span className="font-medium text-slate-600">Volume</span>
                            <div className="text-lg font-bold text-slate-900">{stock.volume.toLocaleString()}</div>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-4">
                            <span className="font-medium text-slate-600">Last Updated</span>
                            <div className="text-lg font-bold text-slate-900">{new Date(stock.lastUpdated).toLocaleDateString()}</div>
                          </div>
                        </div>

                        <div className="pt-4 border-t flex justify-between items-center">
                          <Button variant="outline" size="sm" asChild>
                            <a href={profile?.website} target="_blank" rel="noopener noreferrer">
                              Visit Company Website
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                          
                          {isAuthenticated && (
                            <Button
                              variant={watchlist.isStockWatched(stock.symbol) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                if (watchlist.isStockWatched(stock.symbol)) {
                                  watchlist.removeFromStockWatchlist(stock.symbol);
                                } else {
                                  watchlist.addToStockWatchlist(stock.symbol);
                                }
                              }}
                            >
                              {watchlist.isStockWatched(stock.symbol) ? (
                                <>
                                  <StarOff className="w-4 h-4 mr-2" />
                                  Remove from Watchlist
                                </>
                              ) : (
                                <>
                                  <Star className="w-4 h-4 mr-2" />
                                  Add to Watchlist
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}