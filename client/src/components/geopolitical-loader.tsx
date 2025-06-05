import { useState, useEffect } from "react";
import { Globe, Radar, TrendingUp, Shield, Zap, Target } from "lucide-react";

interface GeopoliticalLoaderProps {
  type?: "global" | "intelligence" | "market" | "defense" | "analysis" | "conflict";
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

const loaderConfigs = {
  global: {
    icon: Globe,
    messages: [
      "Analyzing global conflict patterns...",
      "Processing geopolitical intelligence...",
      "Monitoring regional stability...",
      "Assessing international tensions...",
      "Tracking diplomatic developments..."
    ],
    colors: "text-blue-600",
    bgColors: "bg-blue-50"
  },
  intelligence: {
    icon: Radar,
    messages: [
      "Gathering intelligence data...",
      "Scanning threat indicators...",
      "Analyzing security patterns...",
      "Processing classified information...",
      "Correlating intelligence sources..."
    ],
    colors: "text-green-600",
    bgColors: "bg-green-50"
  },
  market: {
    icon: TrendingUp,
    messages: [
      "Fetching defense market data...",
      "Calculating correlation coefficients...",
      "Analyzing stock performance...",
      "Processing market indicators...",
      "Updating portfolio analytics..."
    ],
    colors: "text-purple-600",
    bgColors: "bg-purple-50"
  },
  defense: {
    icon: Shield,
    messages: [
      "Monitoring defense contracts...",
      "Analyzing military expenditures...",
      "Tracking defense industry trends...",
      "Processing security updates...",
      "Evaluating strategic positions..."
    ],
    colors: "text-red-600",
    bgColors: "bg-red-50"
  },
  analysis: {
    icon: Zap,
    messages: [
      "Running AI analysis algorithms...",
      "Generating predictive models...",
      "Processing conflict scenarios...",
      "Calculating risk assessments...",
      "Synthesizing intelligence reports..."
    ],
    colors: "text-yellow-600",
    bgColors: "bg-yellow-50"
  },
  conflict: {
    icon: Target,
    messages: [
      "Mapping conflict zones...",
      "Analyzing casualty reports...",
      "Tracking escalation patterns...",
      "Processing humanitarian data...",
      "Monitoring ceasefire violations..."
    ],
    colors: "text-orange-600",
    bgColors: "bg-orange-50"
  }
};

export default function GeopoliticalLoader({ 
  type = "global", 
  size = "md", 
  message,
  className = ""
}: GeopoliticalLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [dots, setDots] = useState("");

  const config = loaderConfigs[type];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const containerSizes = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % config.messages.length);
    }, 2000);

    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, [config.messages.length]);

  const displayMessage = message || config.messages[currentMessageIndex];

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${containerSizes[size]} ${className}`}>
      {/* Animated Icon with Pulsing Effect */}
      <div className={`relative ${config.bgColors} rounded-full p-6`}>
        <Icon 
          className={`${sizeClasses[size]} ${config.colors} animate-spin`}
          style={{ 
            animation: type === 'global' ? 'spin 3s linear infinite' : 
                      type === 'intelligence' ? 'pulse 2s ease-in-out infinite' :
                      type === 'market' ? 'bounce 1s ease-in-out infinite' :
                      type === 'defense' ? 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' :
                      type === 'analysis' ? 'pulse 1.5s ease-in-out infinite' :
                      'spin 2s linear infinite'
          }}
        />
        
        {/* Radar Effect for Intelligence */}
        {type === 'intelligence' && (
          <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping"></div>
        )}
        
        {/* Market Pulse Effect */}
        {type === 'market' && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-purple-300 animate-ping animation-delay-100"></div>
            <div className="absolute inset-0 rounded-full border border-purple-200 animate-ping animation-delay-200"></div>
          </>
        )}
        
        {/* Defense Shield Effect */}
        {type === 'defense' && (
          <div className="absolute inset-0 rounded-full bg-red-100 animate-pulse"></div>
        )}
      </div>

      {/* Loading Message */}
      <div className="text-center space-y-2">
        <p className={`text-sm font-medium ${config.colors} min-h-[20px]`}>
          {displayMessage}{dots}
        </p>
        
        {/* Progress Bar */}
        <div className="w-48 bg-gray-200 rounded-full h-1.5">
          <div 
            className={`${config.colors.replace('text-', 'bg-')} h-1.5 rounded-full animate-pulse`}
            style={{
              width: '100%',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          ></div>
        </div>
      </div>

      {/* Floating Elements for Visual Interest */}
      <div className="relative w-32 h-8 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 ${config.colors.replace('text-', 'bg-')} rounded-full opacity-70`}
            style={{
              left: `${i * 20}px`,
              animation: `float 3s ease-in-out infinite ${i * 0.5}s`,
              animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
            }}
          />
        ))}
      </div>


    </div>
  );
}

// Mini loader for inline use
export function MiniGeopoliticalLoader({ type = "global", className = "" }: { type?: GeopoliticalLoaderProps['type']; className?: string }) {
  const config = loaderConfigs[type!];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <Icon className={`w-4 h-4 ${config.colors} animate-spin`} />
      <span className={`text-sm ${config.colors}`}>Loading...</span>
    </div>
  );
}

// Full screen loader
export function FullScreenGeopoliticalLoader({ type = "global", message }: { type?: GeopoliticalLoaderProps['type']; message?: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
      <GeopoliticalLoader type={type} size="lg" message={message} />
    </div>
  );
}