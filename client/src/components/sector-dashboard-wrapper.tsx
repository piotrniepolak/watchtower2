import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import EnhancedMultiSectorDashboard from "./enhanced-multi-sector-dashboard";

export default function SectorDashboardWrapper() {
  const [location] = useLocation();
  const [sector, setSector] = useState<string>('defense');

  useEffect(() => {
    // Extract sector from URL path
    if (location.startsWith('/defense')) {
      setSector('defense');
    } else if (location.startsWith('/health')) {
      setSector('health');
    } else if (location.startsWith('/energy')) {
      setSector('energy');
    }
  }, [location]);

  return <EnhancedMultiSectorDashboard defaultSector={sector} />;
}