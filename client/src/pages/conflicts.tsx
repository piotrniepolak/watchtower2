import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, ExternalLink } from "lucide-react";
import FlagIcon from "@/components/flag-icon";
import GoogleMap from "@/components/google-map";
import type { Conflict } from "@shared/schema";

export default function Conflicts() {
  const { data: conflicts, isLoading } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  const conflictDetails = {
    "Ukraine-Russia": {
      summary: "The Russia-Ukraine conflict began on February 24, 2022, when Russia launched a full-scale invasion of Ukraine. The conflict has its roots in the 2014 annexation of Crimea and support for separatist regions in eastern Ukraine.",
      keyEvents: [
        "February 24, 2022: Russia begins full-scale invasion",
        "April 2022: Withdrawal from Kyiv region",
        "September 2022: Ukrainian counteroffensive in Kharkiv",
        "October 2022: Attacks on Ukrainian infrastructure"
      ],
      impact: "Over 10 million displaced, significant infrastructure damage, global food and energy supply disruptions.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Russian_invasion_of_Ukraine"
    },
    "Israel-Gaza": {
      summary: "The Israel-Gaza conflict escalated on October 7, 2023, following Hamas attacks on Israel and subsequent Israeli military response in Gaza. The conflict is part of the broader Israeli-Palestinian conflict.",
      keyEvents: [
        "October 7, 2023: Hamas launches coordinated attacks",
        "October 2023: Israeli ground operation begins",
        "November 2023: Humanitarian pause negotiations",
        "December 2023: Continued military operations"
      ],
      impact: "Thousands of casualties, humanitarian crisis in Gaza, regional tension escalation.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/2023_Israel–Hamas_war"
    },
    "Maritime Dispute": {
      summary: "The South China Sea territorial disputes involve competing claims by China, Philippines, Vietnam, Malaysia, and other nations over islands, reefs, and maritime rights in the strategically important waterway.",
      keyEvents: [
        "2016: International tribunal rules against China's claims",
        "2019: Increased military presence by all parties",
        "2021: Philippine protests over Chinese vessels",
        "2023: Renewed tensions over fishing rights"
      ],
      impact: "Trade route disruptions, fishing industry conflicts, military buildups in the region.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Territorial_disputes_in_the_South_China_Sea"
    },
    "Mali Crisis": {
      summary: "The Mali crisis involves political instability, military coups, and security challenges including insurgency groups and international military interventions since 2012.",
      keyEvents: [
        "2020: Military coup removes civilian government",
        "2021: Second military coup",
        "2022: Withdrawal of French forces announced",
        "2023: UN peacekeeping mission ends"
      ],
      impact: "Displacement of populations, humanitarian crisis, regional security concerns.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Mali_War"
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
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
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 rounded"></div>
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
            Global Conflicts Analysis
          </h2>
          <p className="text-slate-600 mb-6">
            Detailed analysis of ongoing global conflicts and their geopolitical impact
          </p>
          
          {/* Map Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Conflict Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <GoogleMap 
                  conflicts={conflicts as Conflict[] || []} 
                  className="w-full h-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Conflict Details */}
          <div className="grid gap-8">
            {(conflicts as Conflict[] || []).map((conflict) => {
              const details = conflictDetails[conflict.name as keyof typeof conflictDetails];
              
              return (
                <Card key={conflict.id} className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="flex space-x-1 mr-3">
                            {conflict.parties?.map((party, index) => (
                              <FlagIcon key={index} countryCode={party} size="md" />
                            ))}
                          </div>
                          <CardTitle className="text-xl">{conflict.name}</CardTitle>
                          <Badge variant={getSeverityColor(conflict.severity)} className="ml-3">
                            {conflict.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-slate-600 space-x-4">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {conflict.region}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Duration: {conflict.duration}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            Status: {conflict.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {details && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Overview</h4>
                          <p className="text-slate-700 leading-relaxed">{details.summary}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Key Events</h4>
                          <ul className="space-y-1">
                            {details.keyEvents.map((event, index) => (
                              <li key={index} className="text-slate-700 text-sm">
                                • {event}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Impact</h4>
                          <p className="text-slate-700">{details.impact}</p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-sm text-slate-500">
                            Last updated: {new Date(conflict.lastUpdated).toLocaleDateString()}
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={details.wikipediaUrl} target="_blank" rel="noopener noreferrer">
                              Read more on Wikipedia
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
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