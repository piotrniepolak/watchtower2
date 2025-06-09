import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Heart, Zap } from "lucide-react";
import { SectorConfig } from "@shared/sectors";

interface SectorSelectorProps {
  selectedSector: string;
  onSectorChange: (sectorKey: string) => void;
  className?: string;
}

const sectorIcons: Record<string, any> = {
  Shield: Shield,
  Heart: Heart,
  Zap: Zap,
};

export default function SectorSelector({ selectedSector, onSectorChange, className }: SectorSelectorProps) {
  const { data: sectors = [], isLoading } = useQuery<SectorConfig[]>({
    queryKey: ["/api/sectors"],
  });

  if (isLoading) {
    return (
      <div className="flex gap-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-slate-200 rounded-lg w-32"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      {sectors.map((sector) => {
        const IconComponent = sectorIcons[sector.icon] || Shield;
        const isSelected = selectedSector === sector.key;
        
        return (
          <Card 
            key={sector.key}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              isSelected 
                ? `border-2 shadow-lg` 
                : 'border hover:border-slate-300'
            }`}
            onClick={() => onSectorChange(sector.key)}
            style={isSelected ? { borderColor: sector.primaryColor } : {}}
          >
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="p-3 rounded-full"
                  style={{ 
                    backgroundColor: isSelected ? sector.primaryColor : '#f1f5f9',
                    color: isSelected ? 'white' : sector.primaryColor 
                  }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">
                    {sector.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {sector.description}
                  </p>
                </div>
                {isSelected && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    style={{ backgroundColor: `${sector.primaryColor}20`, color: sector.primaryColor }}
                  >
                    Active
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}