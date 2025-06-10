import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Building2,
  ExternalLink,
  Heart,
  AlertTriangle
} from "lucide-react";

interface OpportunityCountry {
  name: string;
  iso3: string;
  healthScore: number;
  gdpPerCapita: number;
  opportunityScore: number;
  rank: number;
  healthChallenges: string[];
  diseases: string[];
  companies: PharmaCompany[];
}

interface PharmaCompany {
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}

interface CountryDetailModalProps {
  country: OpportunityCountry | null;
  isOpen: boolean;
  onClose: () => void;
}

function CountryDetailModal({ country, isOpen, onClose }: CountryDetailModalProps) {
  const [selectedCompany, setSelectedCompany] = useState<PharmaCompany | null>(null);

  if (!country) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            {country.name} — Health vs. Wealth Opportunity Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Overview Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Health Score</p>
                  <p className="text-2xl font-bold text-blue-700">{country.healthScore.toFixed(1)}</p>
                </div>
                <Heart className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">GDP per Capita</p>
                  <p className="text-2xl font-bold text-green-700">${country.gdpPerCapita.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Opportunity Score</p>
                  <p className="text-2xl font-bold text-orange-700">{country.opportunityScore.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Health Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Key Health Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Current Outbreaks & Issues</h4>
                  <div className="space-y-2">
                    {country.healthChallenges.map((challenge, index) => (
                      <Badge key={index} variant="destructive" className="mr-2">
                        {challenge}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Chronic Conditions</h4>
                  <div className="space-y-2">
                    {country.diseases.map((disease, index) => (
                      <Badge key={index} variant="secondary" className="mr-2">
                        {disease}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pharmaceutical Companies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Pharmaceutical Companies Operating in {country.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {country.companies.map((company, index) => (
                  <div 
                    key={index} 
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedCompany(company)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-semibold">{company.name}</h4>
                          <p className="text-sm text-gray-600">{company.ticker}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">${company.price.toFixed(2)}</p>
                        <p className={`text-sm ${company.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {company.change >= 0 ? '+' : ''}{company.changePercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TopOpportunityList() {
  const [selectedCountry, setSelectedCountry] = useState<OpportunityCountry | null>(null);

  const { data: opportunities = [], isLoading } = useQuery<OpportunityCountry[]>({
    queryKey: ['/api/health/wealth-opportunities'],
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });

  const getOpportunityColor = (score: number) => {
    if (score >= 1.5) return 'bg-red-500';
    if (score >= 1.2) return 'bg-orange-500';
    if (score >= 0.8) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600 animate-pulse" />
            Health vs. Wealth Opportunity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Top 10 Health vs. Wealth Opportunities
          </CardTitle>
          <p className="text-sm text-gray-600">
            Countries with high GDP per capita but low health scores, indicating strong market potential for pharmaceutical solutions
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {opportunities.slice(0, 10).map((country, index) => (
              <div 
                key={country.iso3}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-md"
                onClick={() => setSelectedCountry(country)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">{country.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Health Score: {country.healthScore.toFixed(1)}</span>
                        <span>GDP: ${country.gdpPerCapita.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold">{country.opportunityScore.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Opportunity Score</p>
                    </div>
                    
                    <div className={`w-3 h-3 rounded-full ${getOpportunityColor(country.opportunityScore)}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CountryDetailModal 
        country={selectedCountry}
        isOpen={!!selectedCountry}
        onClose={() => setSelectedCountry(null)}
      />
    </div>
  );
}