import { Building2, Plane, Shield, Ship, Satellite, Cog, Search, Radar, Zap } from "lucide-react";

interface CompanyLogoProps {
  symbol: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

export default function CompanyLogo({ symbol, name, size = "md" }: CompanyLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const getCompanyIcon = (symbol: string) => {
    switch (symbol.toUpperCase()) {
      case "LMT":
        return (
          <div className={`${sizeClasses[size]} bg-blue-600 rounded flex items-center justify-center`}>
            <Shield className="w-4 h-4 text-white" />
          </div>
        );
      case "BA":
        return (
          <div className={`${sizeClasses[size]} bg-blue-800 rounded flex items-center justify-center`}>
            <Plane className="w-4 h-4 text-white" />
          </div>
        );
      case "RTX":
        return (
          <div className={`${sizeClasses[size]} bg-red-600 rounded flex items-center justify-center`}>
            <span className="text-white font-bold text-xs">RTX</span>
          </div>
        );
      case "NOC":
        return (
          <div className={`${sizeClasses[size]} bg-blue-900 rounded flex items-center justify-center`}>
            <span className="text-white font-bold text-xs">NOC</span>
          </div>
        );
      case "GD":
        return (
          <div className={`${sizeClasses[size]} bg-gray-700 rounded flex items-center justify-center`}>
            <span className="text-white font-bold text-xs">GD</span>
          </div>
        );
      case "HII":
        return (
          <div className={`${sizeClasses[size]} bg-blue-700 rounded flex items-center justify-center`}>
            <Ship className="w-4 h-4 text-white" />
          </div>
        );
      case "LHX":
        return (
          <div className={`${sizeClasses[size]} bg-green-600 rounded flex items-center justify-center`}>
            <Satellite className="w-4 h-4 text-white" />
          </div>
        );
      case "TDG":
        return (
          <div className={`${sizeClasses[size]} bg-orange-600 rounded flex items-center justify-center`}>
            <Cog className="w-4 h-4 text-white" />
          </div>
        );
      case "LDOS":
        return (
          <div className={`${sizeClasses[size]} bg-purple-600 rounded flex items-center justify-center`}>
            <Search className="w-4 h-4 text-white" />
          </div>
        );
      case "CACI":
        return (
          <div className={`${sizeClasses[size]} bg-indigo-600 rounded flex items-center justify-center`}>
            <Shield className="w-4 h-4 text-white" />
          </div>
        );
      case "SAIC":
        return (
          <div className={`${sizeClasses[size]} bg-teal-600 rounded flex items-center justify-center`}>
            <Radar className="w-4 h-4 text-white" />
          </div>
        );
      case "KTOS":
        return (
          <div className={`${sizeClasses[size]} bg-yellow-600 rounded flex items-center justify-center`}>
            <Zap className="w-4 h-4 text-white" />
          </div>
        );
      default:
        return (
          <div className={`${sizeClasses[size]} bg-slate-300 rounded flex items-center justify-center`}>
            <Building2 className="w-4 h-4 text-slate-600" />
          </div>
        );
    }
  };

  return (
    <div className="flex items-center">
      {getCompanyIcon(symbol)}
      <div className="ml-3">
        <div className="text-sm font-medium text-slate-900">{name}</div>
        <div className="text-sm text-slate-500">{symbol}</div>
      </div>
    </div>
  );
}