import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, ExternalLink } from "lucide-react";
import FlagIcon from "@/components/flag-icon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    "South China Sea Dispute": {
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
        "2012: Tuareg rebellion and military coup",
        "2020: Military coup removes civilian government",
        "2021: Second military coup",
        "2022: Withdrawal of French forces announced"
      ],
      impact: "Displacement of populations, humanitarian crisis, regional security concerns.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Mali_War"
    },
    "Ethiopia-Tigray": {
      summary: "The Tigray War was an armed conflict from November 2020 to November 2022 between the Ethiopian federal government and Eritrea against the Tigray People's Liberation Front (TPLF).",
      keyEvents: [
        "November 2020: Conflict begins with federal intervention",
        "November 2021: TPLF advances toward Addis Ababa",
        "January 2022: Ethiopian government regains territory",
        "November 2022: Cessation of hostilities agreement signed"
      ],
      impact: "Hundreds of thousands killed, millions displaced, severe humanitarian crisis.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Tigray_War"
    },
    "Burkina Faso Insurgency": {
      summary: "An ongoing Islamist insurgency in Burkina Faso began in 2015, linked to regional jihadist movements and exacerbated by political instability and military coups.",
      keyEvents: [
        "2015: First major terrorist attacks begin",
        "2019: Escalation with increased attacks on civilians",
        "2022: Military coups amid security deterioration",
        "2023: Continued displacement and humanitarian crisis"
      ],
      impact: "Over 2 million internally displaced, thousands killed, regional destabilization.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Insurgency_in_the_Sahel"
    },
    "Democratic Republic Congo": {
      summary: "The ongoing conflicts in the Democratic Republic of Congo involve multiple armed groups, foreign interventions, and resource-related violence, particularly in the eastern provinces.",
      keyEvents: [
        "1998: Second Congo War begins",
        "2012: M23 rebellion escalates tensions",
        "2021: Renewed M23 offensive",
        "2022: Regional diplomatic efforts intensify"
      ],
      impact: "Millions of deaths over decades, ongoing displacement, resource exploitation conflicts.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Kivu_conflict"
    },
    "Kashmir Conflict": {
      summary: "The Kashmir conflict is a territorial dispute over the Kashmir region between India and Pakistan since 1947, with periodic escalations and ongoing tensions.",
      keyEvents: [
        "1947: First Indo-Pakistani War over Kashmir",
        "1999: Kargil War escalation",
        "2019: Balakot airstrikes following Pulwama attack",
        "2020-2024: Periodic border clashes and tensions"
      ],
      impact: "Decades of military confrontation, civilian casualties, regional nuclear risk.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Kashmir_conflict"
    },
    "Syria Civil War": {
      summary: "The Syrian civil war began in 2011 as part of the Arab Spring, evolving into a complex multi-sided conflict involving multiple foreign powers and non-state actors.",
      keyEvents: [
        "2011: Peaceful protests turn violent",
        "2014: Rise of ISIS in Syrian territory",
        "2015: Russian military intervention begins",
        "2019: Turkish operations in northern Syria"
      ],
      impact: "Over 500,000 deaths, 13+ million displaced, regional refugee crisis.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Syrian_civil_war"
    },
    "Yemen Civil War": {
      summary: "The Yemen civil war began in 2014 when Houthi forces took control of the capital Sanaa, leading to a Saudi-led coalition intervention in 2015.",
      keyEvents: [
        "2014: Houthis capture Sanaa",
        "2015: Saudi-led coalition intervention begins",
        "2019: Attacks on Saudi oil facilities",
        "2022-2024: Renewed peace efforts and ceasefires"
      ],
      impact: "Hundreds of thousands dead, worst humanitarian crisis globally, economic collapse.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Yemeni_civil_war_(2014–present)"
    },
    "Taiwan Strait Tensions": {
      summary: "Cross-strait tensions between China and Taiwan have escalated since 2020, with increased military activities and diplomatic pressure from Beijing.",
      keyEvents: [
        "2020: Increased PLA air incursions",
        "2022: Pelosi visit triggers military exercises",
        "2023: Record number of Chinese warplane crossings",
        "2024: Taiwan presidential election increases tensions"
      ],
      impact: "Regional military buildup, global semiconductor supply concerns, US-China strategic competition.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Cross-Strait_relations"
    },
    "Afghanistan Taliban": {
      summary: "Following the Taliban's return to power in August 2021 after the US withdrawal, Afghanistan faces ongoing security challenges and humanitarian crisis.",
      keyEvents: [
        "2021: Taliban captures Kabul, US withdrawal",
        "2021-2022: ISIS-K attacks continue",
        "2022: International recognition debates",
        "2023-2024: Humanitarian aid challenges"
      ],
      impact: "Humanitarian crisis, women's rights restrictions, regional security concerns.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Taliban_insurgency"
    },
    "Nigeria Boko Haram": {
      summary: "Boko Haram's insurgency in northeastern Nigeria began in 2009, spreading to neighboring countries and causing massive displacement and casualties.",
      keyEvents: [
        "2009: Founding leader killed, insurgency begins",
        "2014: Chibok schoolgirls kidnapping",
        "2015-2017: Military operations intensify",
        "2018-2024: Continued attacks and counteroperations"
      ],
      impact: "Over 350,000 deaths, 3+ million displaced, regional humanitarian crisis.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Boko_Haram_insurgency"
    },
    "Somalia Al-Shabaab": {
      summary: "Al-Shabaab's insurgency in Somalia began in 2006, controlling territory and conducting attacks across the Horn of Africa region.",
      keyEvents: [
        "2006: Emerges from Islamic Courts Union",
        "2011: Famine exploitation and territorial losses",
        "2017: Deadliest attack in Mogadishu history",
        "2022-2024: ATMIS operations and government offensives"
      ],
      impact: "Tens of thousands killed, persistent instability, regional security threat.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Somali_Civil_War_(2009–present)"
    },
    "Myanmar Civil War": {
      summary: "Myanmar's civil war began following the military coup on February 1, 2021, leading to widespread resistance and armed conflict across the country.",
      keyEvents: [
        "February 2021: Military coup removes elected government",
        "March 2021: Civilian resistance movement begins",
        "2022: Armed resistance groups coordinate",
        "2023: Opposition gains territory in border regions"
      ],
      impact: "Thousands killed, 2+ million displaced, economic collapse, humanitarian crisis.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Myanmar_civil_war_(2021–present)"
    },
    "Colombia-Venezuela Border": {
      summary: "Border tensions between Colombia and Venezuela have escalated due to migration crisis, drug trafficking, and political differences between the governments.",
      keyEvents: [
        "2019: Venezuelan migration crisis peaks",
        "2020: COVID-19 border closures",
        "2021: Diplomatic relations strain",
        "2022-2024: Renewed cooperation efforts"
      ],
      impact: "7+ million Venezuelan migrants, regional stability concerns, humanitarian challenges.",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Colombia–Venezuela_relations"
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Global Conflicts Analysis
          </h2>
          <p className="text-slate-600 mb-6">
            Detailed analysis of ongoing global conflicts and their geopolitical impact
          </p>
          
          {/* Conflicts Overview Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                List of Ongoing Armed Conflicts
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                This is a list of ongoing armed conflicts that are taking place around the world.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conflict</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Parties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(conflicts as Conflict[] || []).map((conflict) => (
                    <TableRow key={conflict.id}>
                      <TableCell className="font-medium">
                        {conflict.name}
                      </TableCell>
                      <TableCell>{conflict.region}</TableCell>
                      <TableCell>{conflict.duration}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(conflict.status)}>
                          {conflict.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(conflict.severity)}>
                          {conflict.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {conflict.parties?.slice(0, 4).map((party, index) => (
                            <FlagIcon key={index} countryCode={party} size="sm" />
                          ))}
                          {conflict.parties && conflict.parties.length > 4 && (
                            <span className="text-xs text-slate-500 ml-1">
                              +{conflict.parties.length - 4}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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