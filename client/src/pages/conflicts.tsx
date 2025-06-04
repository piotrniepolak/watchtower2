import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Globe, Users, Calendar, AlertTriangle, Star, StarOff } from "lucide-react";
import Navigation from "@/components/navigation";
import { useAuth } from "@/hooks/useSimpleAuth";
import { useLocalWatchlist } from "@/hooks/useLocalWatchlist";
import type { Conflict } from "@shared/schema";

export default function Conflicts() {
  const { isAuthenticated } = useAuth();
  const watchlist = useLocalWatchlist();
  
  const { data: conflicts, isLoading } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  const conflictDetails = {
    "Ukraine-Russia Conflict": {
      summary: "The Russia-Ukraine conflict began on February 24, 2022, when Russia launched a full-scale invasion of Ukraine. The conflict has its roots in the 2014 annexation of Crimea and support for separatist regions in eastern Ukraine.",
      background: "Following Ukraine's 2014 revolution and desire to align with Western institutions, Russia annexed Crimea and supported separatist movements in Donetsk and Luhansk regions. Tensions escalated over NATO expansion and Ukraine's EU aspirations.",
      keyEvents: [
        "February 24, 2022: Russia begins full-scale invasion across multiple fronts",
        "March 2022: Siege of Mariupol and civilian evacuations",
        "April 2022: Russian withdrawal from Kyiv region, Bucha massacre revealed",
        "September 2022: Ukrainian counteroffensive in Kharkiv region",
        "October 2022: Systematic attacks on Ukrainian energy infrastructure",
        "November 2022: Liberation of Kherson city",
        "2023: Ongoing fighting in eastern and southern Ukraine"
      ],
      casualties: "Over 500,000 military casualties combined, tens of thousands of civilian deaths",
      impact: "Over 10 million displaced, significant infrastructure damage, global food and energy supply disruptions, strengthened NATO unity.",
      economicImpact: "Global grain and energy price spikes, sanctions on Russia worth hundreds of billions, massive reconstruction costs estimated at $750+ billion",
      militarySupport: "Western military aid exceeding $200 billion, including advanced weapons systems and air defense"
    },
    "Israel-Gaza Conflict": {
      summary: "The Israel-Gaza conflict escalated on October 7, 2023, following Hamas attacks on Israel and subsequent Israeli military response in Gaza. The conflict is part of the broader Israeli-Palestinian conflict spanning decades.",
      background: "Gaza has been under Israeli blockade since 2007 when Hamas took control. The territory houses 2.3 million Palestinians in one of the world's most densely populated areas, with limited access to resources and movement.",
      keyEvents: [
        "October 7, 2023: Hamas launches Operation Al-Aqsa Flood with rockets and ground infiltration",
        "October 2023: Israeli Operation Swords of Iron begins with airstrikes",
        "October 2023: Ground invasion of northern Gaza",
        "November 2023: Temporary humanitarian pauses and hostage releases",
        "December 2023: Expansion of operations to southern Gaza",
        "2024: Continued military operations and humanitarian crisis"
      ],
      casualties: "Over 1,200 Israeli deaths on October 7, over 30,000 Palestinian deaths in Gaza",
      impact: "Thousands of casualties, humanitarian crisis in Gaza, regional tension escalation, global diplomatic efforts for ceasefire.",
      economicImpact: "Disruption to Israeli economy, Gaza infrastructure destruction, regional shipping routes affected",
      internationalResponse: "UN Security Council resolutions, International Court of Justice proceedings, increased humanitarian aid"
    },
    "South China Sea Dispute": {
      summary: "The South China Sea territorial disputes involve competing claims by China, Philippines, Vietnam, Malaysia, Brunei, and Taiwan over islands, reefs, and maritime rights in this strategically vital waterway.",
      background: "The South China Sea contains crucial shipping lanes carrying $3.4 trillion in annual trade, significant oil and gas reserves, and rich fishing grounds. China claims most of the sea based on historical rights.",
      keyEvents: [
        "2009: China submits nine-dash line claim to UN",
        "2016: International tribunal rules against China's claims in favor of Philippines",
        "2018-2019: Increased military presence and artificial island construction",
        "2020: China establishes administrative districts over disputed areas",
        "2021: Philippine protests over 200+ Chinese vessels at Whitsun Reef",
        "2023: Renewed tensions over Second Thomas Shoal incidents"
      ],
      casualties: "Limited military confrontations, several incidents with injuries",
      impact: "Trade route disruptions, fishing industry conflicts, military buildups in the region, diplomatic tensions among ASEAN nations.",
      economicImpact: "Potential disruption to $3.4 trillion annual trade, fishing rights disputes, energy exploration tensions",
      militaryPresence: "Chinese artificial islands with military installations, increased US freedom of navigation operations, regional military buildups"
    },
    "Mali Crisis": {
      summary: "The Mali crisis involves political instability, military coups, and security challenges including insurgency groups and international military interventions since the 2012 Tuareg rebellion.",
      background: "Mali has faced challenges from ethnic tensions, weak governance, drought, and the spread of jihadist groups from Libya and Algeria following regional instability.",
      keyEvents: [
        "2012: Tuareg rebellion in northern Mali and military coup",
        "2013: French Operation Serval intervention",
        "2014: UN peacekeeping mission MINUSMA established",
        "2020: Military coup removes President Ibrahim Boubacar Keïta",
        "2021: Second military coup led by Colonel Assimi Goïta",
        "2022: France announces withdrawal of forces",
        "2023: MINUSMA mission ends, Wagner Group presence"
      ],
      casualties: "Thousands of military and civilian deaths, hundreds of peacekeepers killed",
      impact: "Displacement of over 400,000 people, humanitarian crisis, regional security concerns spreading to neighboring countries.",
      economicImpact: "Economic decline, loss of foreign investment, reduced agricultural production",
      internationalResponse: "UN peacekeeping, French military intervention, EU training missions, African Union involvement"
    },
    "Mexico Drug War": {
      summary: "The Mexican Drug War is an ongoing armed conflict between the Mexican government, drug cartels, and the United States since 2006, characterized by extreme violence and trafficking disputes.",
      background: "Mexico became a major transit route for drugs to the US market. President Felipe Calderón declared war on cartels in 2006, leading to militarization of anti-drug efforts and cartel fragmentation.",
      keyEvents: [
        "December 2006: President Calderón deploys military against cartels",
        "2010-2012: Peak violence period with over 25,000 deaths annually",
        "2016: Capture and escape of El Chapo Guzmán",
        "2019: Culiacán battle between military and Sinaloa Cartel",
        "2020: Arrest of General Salvador Cienfuegos on drug charges",
        "2023: Arrest of Ovidio Guzmán triggers violent cartel response"
      ],
      casualties: "Over 350,000 deaths and 100,000 disappeared persons since 2006",
      impact: "Massive human rights crisis, corruption of institutions, displacement of communities, cross-border violence affecting the United States.",
      economicImpact: "Estimated $40+ billion annual drug trade, damage to tourism and investment, costs of militarization",
      internationalResponse: "US-Mexico cooperation through Mérida Initiative, DEA operations, extradition agreements, border security measures"
    },
    "Yemen Civil War": {
      summary: "The Yemen Civil War began in 2014 between the internationally recognized government and Houthi rebels, escalating in 2015 with Saudi-led coalition intervention.",
      background: "Political transition following Arab Spring protests led to power struggles. Houthi rebels, backed by Iran, seized control of the capital Sanaa, prompting Saudi-led intervention to restore the government.",
      keyEvents: [
        "2014: Houthis capture Sanaa and government institutions",
        "2015: Saudi-led coalition begins Operation Decisive Storm",
        "2016: UN-mediated peace talks collapse",
        "2018: Battle for Hodeidah port city",
        "2019: Drone attacks on Saudi oil facilities",
        "2022: UN-brokered truce agreement"
      ],
      casualties: "Over 377,000 deaths, including 150,000 from violence",
      impact: "World's worst humanitarian crisis with 24 million needing aid, cholera outbreaks, famine conditions.",
      economicImpact: "Economic collapse, currency devaluation, infrastructure destruction, oil production disruption",
      internationalResponse: "Saudi-UAE coalition, Iranian support for Houthis, US intelligence and weapons support, UN humanitarian operations"
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "destructive";
      case "ongoing": return "default";
      case "ceasefire": return "secondary";
      case "low-intensity": return "outline";
      case "post-conflict": return "secondary";
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Global Conflicts Analysis</h1>
          <p className="text-slate-600">
            Comprehensive overview of current global conflicts and their geopolitical implications
          </p>
        </div>

        {/* Conflicts Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Current Global Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conflict</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  {isAuthenticated && <TableHead>Watchlist</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(conflicts as Conflict[] || []).map((conflict) => (
                  <TableRow key={conflict.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{conflict.name}</TableCell>
                    <TableCell>{conflict.region}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(conflict.severity)}>
                        {conflict.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(conflict.status)}>
                        {conflict.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{conflict.duration}</TableCell>
                    {isAuthenticated && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (watchlist.isConflictWatched(conflict.id)) {
                              watchlist.removeFromConflictWatchlist(conflict.id);
                            } else {
                              watchlist.addToConflictWatchlist(conflict.id);
                            }
                          }}
                        >
                          {watchlist.isConflictWatched(conflict.id) ? (
                            <StarOff className="w-4 h-4" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detailed Conflict Information */}
        <div className="grid gap-8">
          {(conflicts as Conflict[] || []).map((conflict) => {
            const details = conflictDetails[conflict.name as keyof typeof conflictDetails];
            if (!details) return null;

            return (
              <Card key={conflict.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{conflict.name}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-1" />
                          {conflict.region}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {conflict.duration}
                        </div>
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          <Badge variant={getSeverityColor(conflict.severity)} className="ml-1">
                            {conflict.severity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(conflict.status)} className="text-sm">
                      {conflict.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Overview</h4>
                        <p className="text-slate-700 leading-relaxed">{details.summary}</p>
                      </div>

                      {details.background && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3">Background</h4>
                          <p className="text-slate-700 leading-relaxed">{details.background}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Key Timeline</h4>
                        <ul className="space-y-2">
                          {details.keyEvents.map((event, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-slate-700 text-sm">{event}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {details.casualties && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Casualties & Impact
                          </h4>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 text-sm font-medium mb-2">Human Cost</p>
                            <p className="text-red-700 text-sm">{details.casualties}</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Humanitarian Impact</h4>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <p className="text-orange-700 text-sm">{details.impact}</p>
                        </div>
                      </div>

                      {details.economicImpact && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3">Economic Impact</h4>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-700 text-sm">{details.economicImpact}</p>
                          </div>
                        </div>
                      )}

                      {(details.internationalResponse || details.militarySupport || details.militaryPresence) && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3">International Response</h4>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-700 text-sm">
                              {details.internationalResponse || details.militarySupport || details.militaryPresence}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}