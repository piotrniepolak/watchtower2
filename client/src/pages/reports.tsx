import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Clock, Target, DollarSign, FileText, Shield, Zap } from "lucide-react";
import CompanyLogo from "@/components/company-logo";
import type { Stock } from "@shared/schema";

export default function Reports() {
  const { data: stocks } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const investmentStrategies = [
    {
      strategy: "Conflict Escalation Entry",
      description: "Enter positions within 24-48 hours of major conflict announcements for maximum upside capture.",
      timeframe: "1-3 months",
      riskLevel: "High",
      expectedReturn: "8-15%",
      bestStocks: ["LMT", "NOC", "RTX"],
      signals: [
        "Breaking news of military action",
        "Defense budget increases announced", 
        "International sanctions imposed",
        "NATO Article 5 discussions"
      ]
    },
    {
      strategy: "Sustained Conflict Hold",
      description: "Long-term positions during prolonged conflicts with regular contract announcements.",
      timeframe: "6-18 months", 
      riskLevel: "Medium",
      expectedReturn: "12-25%",
      bestStocks: ["LMT", "RTX", "GD"],
      signals: [
        "Multi-year military aid packages",
        "Increased defense manufacturing capacity",
        "Rising military expenditure trends",
        "Geopolitical tension persistence"
      ]
    },
    {
      strategy: "Peace Dividend Exit",
      description: "Systematic exit strategy when conflicts show signs of resolution to lock in gains.",
      timeframe: "1-2 weeks",
      riskLevel: "Low", 
      expectedReturn: "Profit protection",
      bestStocks: ["All positions"],
      signals: [
        "Ceasefire negotiations progress",
        "Diplomatic breakthrough announcements",
        "Conflict de-escalation statements",
        "Peace treaty discussions"
      ]
    }
  ];

  const companyBenefits = [
    {
      symbol: "LMT",
      name: "Lockheed Martin",
      primaryBenefit: "Advanced Weapons Systems",
      conflictExposure: "Very High",
      keyProducts: ["F-35 Fighter Jets", "HIMARS Systems", "Patriot Missiles", "THAAD Defense"],
      revenueFromConflicts: "65%",
      contractPipeline: "$147B",
      strategicAdvantage: "Cutting-edge technology with long development cycles creates sustained demand during extended conflicts."
    },
    {
      symbol: "RTX", 
      name: "RTX Corporation",
      primaryBenefit: "Missile & Defense Systems",
      conflictExposure: "High",
      keyProducts: ["Tomahawk Missiles", "Patriot Systems", "Javelin Missiles", "AIM-120 AMRAAM"],
      revenueFromConflicts: "58%",
      contractPipeline: "$89B",
      strategicAdvantage: "Dominant position in precision-guided munitions with high consumption rates during active conflicts."
    },
    {
      symbol: "NOC",
      name: "Northrop Grumman", 
      primaryBenefit: "Aerospace & Cyber",
      conflictExposure: "High",
      keyProducts: ["B-21 Bomber", "Global Hawk Drones", "Cyber Solutions", "Space Systems"],
      revenueFromConflicts: "52%",
      contractPipeline: "$76B",
      strategicAdvantage: "Next-generation platforms and cybersecurity capabilities essential for modern warfare."
    },
    {
      symbol: "GD",
      name: "General Dynamics",
      primaryBenefit: "Ground Systems & Naval",
      conflictExposure: "Medium-High", 
      keyProducts: ["Abrams Tanks", "Stryker Vehicles", "Submarines", "Artillery Systems"],
      revenueFromConflicts: "48%",
      contractPipeline: "$62B",
      strategicAdvantage: "Heavy ground equipment and naval systems with long production cycles and upgrade potential."
    },
    {
      symbol: "BA",
      name: "Boeing",
      primaryBenefit: "Military Aircraft",
      conflictExposure: "Medium",
      keyProducts: ["F/A-18 Super Hornet", "KC-46 Tanker", "P-8 Poseidon", "Apache Helicopter"],
      revenueFromConflicts: "32%",
      contractPipeline: "$51B", 
      strategicAdvantage: "Dual-use platforms serving both military and commercial markets with global service networks."
    },
    {
      symbol: "RHM.DE",
      name: "Rheinmetall AG",
      primaryBenefit: "Artillery & Ammunition",
      conflictExposure: "Very High",
      keyProducts: ["Leopard Tank Systems", "Artillery Shells", "Air Defense", "Military Vehicles"],
      revenueFromConflicts: "78%",
      contractPipeline: "€15B",
      strategicAdvantage: "European leader in ammunition production with massive capacity expansion during conflicts, especially Ukraine."
    },
    {
      symbol: "BA.L",
      name: "BAE Systems",
      primaryBenefit: "Naval & Electronic Warfare",
      conflictExposure: "High",
      keyProducts: ["Type 26 Frigates", "M777 Howitzers", "Electronic Warfare Systems", "Cyber Defense"],
      revenueFromConflicts: "61%",
      contractPipeline: "£42B",
      strategicAdvantage: "Global naval systems and advanced electronic warfare capabilities with strong government relationships."
    },
    {
      symbol: "LDOS",
      name: "Leidos Holdings",
      primaryBenefit: "Intelligence & IT Services",
      conflictExposure: "Medium-High",
      keyProducts: ["Cybersecurity Solutions", "Intelligence Systems", "Command & Control", "Surveillance"],
      revenueFromConflicts: "45%",
      contractPipeline: "$31B",
      strategicAdvantage: "Critical intelligence and IT infrastructure support with high-security clearance requirements."
    },
    {
      symbol: "LHX",
      name: "L3Harris Technologies",
      primaryBenefit: "Communications & Electronics",
      conflictExposure: "High",
      keyProducts: ["Military Radios", "Night Vision", "Electronic Warfare", "Space Systems"],
      revenueFromConflicts: "56%",
      contractPipeline: "$28B",
      strategicAdvantage: "Essential communication systems and electronic warfare technologies with rapid deployment capabilities."
    },
    {
      symbol: "HWM",
      name: "Howmet Aerospace",
      primaryBenefit: "Advanced Materials",
      conflictExposure: "Medium",
      keyProducts: ["Turbine Components", "Armor Materials", "Aerospace Fasteners", "Engine Parts"],
      revenueFromConflicts: "38%",
      contractPipeline: "$12B",
      strategicAdvantage: "Specialized materials and components critical for aircraft engines and military systems."
    },
    {
      symbol: "KTOS",
      name: "Kratos Defense",
      primaryBenefit: "Unmanned Systems & Missiles",
      conflictExposure: "Very High",
      keyProducts: ["Target Drones", "Unmanned Aircraft", "Tactical Missiles", "Satellite Communications"],
      revenueFromConflicts: "72%",
      contractPipeline: "$8B",
      strategicAdvantage: "Next-generation unmanned systems and low-cost attritable aircraft for modern warfare."
    },
    {
      symbol: "AVAV",
      name: "AeroVironment",
      primaryBenefit: "Small Drones & Tactical UAS",
      conflictExposure: "Very High",
      keyProducts: ["Switchblade Loitering Munitions", "Raven Drones", "Puma Surveillance", "Tactical Missiles"],
      revenueFromConflicts: "81%",
      contractPipeline: "$4.2B",
      strategicAdvantage: "Market leader in small tactical drones with proven combat effectiveness and rapid production scaling."
    },
    {
      symbol: "CW",
      name: "Curtiss-Wright",
      primaryBenefit: "Defense Electronics & Controls",
      conflictExposure: "Medium-High",
      keyProducts: ["Naval Systems", "Ground Vehicle Controls", "Flight Test Equipment", "Defense Electronics"],
      revenueFromConflicts: "47%",
      contractPipeline: "$9B",
      strategicAdvantage: "Critical control systems and ruggedized electronics for harsh combat environments."
    },
    {
      symbol: "MRCY",
      name: "Mercury Systems",
      primaryBenefit: "Signal Processing & Computing",
      conflictExposure: "High",
      keyProducts: ["Signal Processing", "Secure Computing", "RF Solutions", "Electronic Warfare"],
      revenueFromConflicts: "68%",
      contractPipeline: "$3.8B",
      strategicAdvantage: "Advanced signal processing and secure computing solutions for intelligence and electronic warfare."
    },
    {
      symbol: "TXT",
      name: "Textron",
      primaryBenefit: "Aircraft & Ground Systems",
      conflictExposure: "Medium",
      keyProducts: ["Bell Helicopters", "Cessna Aircraft", "TAPV Vehicles", "Unmanned Systems"],
      revenueFromConflicts: "41%",
      contractPipeline: "$14B",
      strategicAdvantage: "Diverse portfolio of aircraft and ground systems with strong aftermarket support and training services."
    }
  ];

  const timingGuide = [
    {
      phase: "Pre-Conflict Indicators",
      timeframe: "2-4 weeks before",
      action: "Begin position building",
      indicators: ["Diplomatic tensions rising", "Military buildup reports", "Economic sanctions threats"],
      allocation: "20-30%"
    },
    {
      phase: "Conflict Initiation", 
      timeframe: "Day 1-3",
      action: "Accelerate buying",
      indicators: ["Military action begins", "Emergency UN meetings", "Market volatility spikes"],
      allocation: "50-70%"
    },
    {
      phase: "Escalation Period",
      timeframe: "Week 1-4", 
      action: "Hold and monitor",
      indicators: ["Increased military aid", "Contract announcements", "Production ramp-up"],
      allocation: "Maintain positions"
    },
    {
      phase: "Sustained Conflict",
      timeframe: "Month 2-12",
      action: "Selective additions",
      indicators: ["Long-term contracts", "Budget increases", "Technology upgrades"],
      allocation: "Add on dips"
    },
    {
      phase: "Peace Negotiations",
      timeframe: "Variable",
      action: "Begin scaling out", 
      indicators: ["Ceasefire talks", "Diplomatic progress", "Conflict fatigue"],
      allocation: "Reduce 30-50%"
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Investment Strategy Reports
          </h2>
          <p className="text-slate-600 mb-6">
            Strategic analysis and timing guidance for defense contractor investments during global conflicts
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-amber-800 mb-1">Investment Disclaimer</h3>
                <p className="text-sm text-amber-700">
                  This analysis is for educational purposes only. Defense investments carry significant ethical considerations and market risks. 
                  Past performance does not guarantee future results. Consult with financial advisors before making investment decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Investment Strategies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Core Investment Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {investmentStrategies.map((strategy, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">{strategy.strategy}</h4>
                        <p className="text-slate-600 mt-1">{strategy.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getRiskColor(strategy.riskLevel)} className="mb-2">
                          {strategy.riskLevel} Risk
                        </Badge>
                        <div className="text-sm text-slate-600">
                          Expected: <span className="font-bold text-green-600">{strategy.expectedReturn}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Key Entry Signals</h5>
                        <ul className="space-y-1">
                          {strategy.signals.map((signal, idx) => (
                            <li key={idx} className="text-sm text-slate-700">• {signal}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Recommended Stocks</h5>
                        <div className="flex space-x-2">
                          {strategy.bestStocks.map((symbol, idx) => (
                            <div key={idx} className="flex items-center bg-slate-100 rounded px-3 py-1">
                              {symbol !== "All positions" && <CompanyLogo symbol={symbol} name="" size="sm" />}
                              <span className="ml-1 text-sm font-medium">{symbol}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-sm text-slate-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Timeframe: {strategy.timeframe}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Company Conflict Benefits */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                How Each Company Benefits from Conflicts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {companyBenefits.map((company) => (
                  <div key={company.symbol} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <CompanyLogo symbol={company.symbol} name={company.name} size="lg" />
                        <div className="ml-4">
                          <h4 className="font-semibold text-slate-900 text-lg">{company.name}</h4>
                          <p className="text-slate-600">{company.primaryBenefit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          {company.conflictExposure} Exposure
                        </Badge>
                        <div className="text-sm text-slate-600">
                          Revenue: <span className="font-bold">{company.revenueFromConflicts}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Key Products</h5>
                        <ul className="space-y-1">
                          {company.keyProducts.map((product, idx) => (
                            <li key={idx} className="text-sm text-slate-700">• {product}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Financial Metrics</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Contract Pipeline:</span>
                            <span className="font-bold">{company.contractPipeline}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Conflict Revenue:</span>
                            <span className="font-bold">{company.revenueFromConflicts}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Strategic Advantage</h5>
                        <p className="text-sm text-slate-700">{company.strategicAdvantage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timing Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Optimal Entry & Exit Timing
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                Phase-based investment approach for maximum profit capture
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timingGuide.map((phase, index) => (
                  <div key={index} className="relative">
                    {index < timingGuide.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-200"></div>
                    )}
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-blue-600 font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1 border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{phase.phase}</h4>
                          <Badge variant="outline">{phase.allocation}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-600">Timeframe:</span>
                            <div className="text-slate-900">{phase.timeframe}</div>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Action:</span>
                            <div className="text-slate-900">{phase.action}</div>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Key Indicators:</span>
                            <div className="text-slate-700">{phase.indicators.join(", ")}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}