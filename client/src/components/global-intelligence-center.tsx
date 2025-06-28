import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Pill, Zap, Globe } from "lucide-react";
import { FourStepIntelligenceBrief } from "./four-step-intelligence-brief";

const sectorConfig = {
  defense: {
    name: "Defense Intelligence",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  pharmaceutical: {
    name: "Pharmaceutical Intelligence", 
    icon: Pill,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  energy: {
    name: "Energy Intelligence",
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  }
};

export function GlobalIntelligenceCenter() {
  const [selectedSector, setSelectedSector] = useState<keyof typeof sectorConfig>("defense");
  
  const config = sectorConfig[selectedSector];
  const IconComponent = config.icon;

  return (
    <Card className={`${config.borderColor} border-2`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="h-6 w-6 text-slate-600" />
            <div>
              <CardTitle className="text-xl">Global Intelligence Center</CardTitle>
              <p className="text-sm text-slate-600">4-Step methodology with authentic source extraction</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-700">Sector:</span>
            <Select value={selectedSector} onValueChange={(value: string) => setSelectedSector(value as keyof typeof sectorConfig)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-4 w-4 ${config.color}`} />
                    <span>{config.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defense">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span>Defense Intelligence</span>
                  </div>
                </SelectItem>
                <SelectItem value="pharmaceutical">
                  <div className="flex items-center space-x-2">
                    <Pill className="h-4 w-4 text-green-600" />
                    <span>Pharmaceutical Intelligence</span>
                  </div>
                </SelectItem>
                <SelectItem value="energy">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span>Energy Intelligence</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`${config.bgColor} rounded-lg`}>
        <FourStepIntelligenceBrief sector={selectedSector} />
      </CardContent>
    </Card>
  );
}