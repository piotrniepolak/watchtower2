import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Globe, Users, Calendar, AlertTriangle, Star, StarOff } from "lucide-react";
import Navigation from "@/components/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLocalWatchlist } from "@/hooks/useLocalWatchlist";
import ConflictTimeline from "@/components/conflict-timeline";
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
      casualties: "Over 1 million+ military casualties combined, tens of thousands of civilian deaths (June 2025)",
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
      casualties: "Over 1,200 Israeli deaths on October 7, over 55,000 Palestinian deaths in Gaza (June 2025)",
      impact: "Thousands of casualties, humanitarian crisis in Gaza, regional tension escalation, global diplomatic efforts for ceasefire.",
      economicImpact: "Disruption to Israeli economy, Gaza infrastructure destruction, regional shipping routes affected",
      internationalResponse: "UN Security Council resolutions, International Court of Justice proceedings, increased humanitarian aid"
    },
    "Mali Security Crisis": {
      summary: "The Mali security crisis involves political instability, military coups, and security challenges including insurgency groups and international military interventions since the 2012 Tuareg rebellion.",
      background: "Mali has faced challenges from ethnic tensions, weak governance, drought, and the spread of jihadist groups from Libya and Algeria following regional instability. The country has experienced multiple coups and foreign interventions.",
      keyEvents: [
        "2012: Tuareg rebellion in northern Mali and military coup",
        "2013: French Operation Serval intervention",
        "2014: UN peacekeeping mission MINUSMA established",
        "2020: Military coup removes President Ibrahim Boubacar Keïta",
        "2021: Second military coup led by Colonel Assimi Goïta",
        "2022: France announces withdrawal of forces",
        "2023: MINUSMA mission ends, Wagner Group presence increases"
      ],
      casualties: "Thousands of military and civilian deaths, hundreds of peacekeepers killed",
      impact: "Displacement of over 400,000 people, humanitarian crisis, regional security concerns spreading to neighboring countries.",
      economicImpact: "Economic decline, loss of foreign investment, reduced agricultural production, impact on regional trade",
      internationalResponse: "UN peacekeeping operations, French military intervention, EU training missions, African Union involvement"
    },
    "Ethiopia Tigray Conflict": {
      summary: "The Tigray War was an armed conflict from November 2020 to November 2022 between the Ethiopian federal government and Eritrea against the Tigray People's Liberation Front (TPLF).",
      background: "The conflict arose from political tensions between the TPLF, which had dominated Ethiopian politics for decades, and Prime Minister Abiy Ahmed's reforms. Ethnic federalism disputes and regional autonomy issues contributed to the escalation.",
      keyEvents: [
        "November 4, 2020: Ethiopian forces attack TPLF in Tigray region",
        "November 2020: Eritrean forces join Ethiopian military",
        "June 2021: TPLF retakes regional capital Mekelle",
        "November 2021: TPLF advances toward Addis Ababa",
        "January 2022: Ethiopian government regains territory",
        "November 2, 2022: Cessation of hostilities agreement signed in Pretoria"
      ],
      casualties: "Estimated 385,000-600,000 deaths, hundreds of thousands displaced",
      impact: "Severe humanitarian crisis, ethnic tensions, regional instability, international concern over war crimes allegations.",
      economicImpact: "Agricultural disruption, infrastructure damage, impact on Ethiopia's economic growth, international aid suspension",
      internationalResponse: "African Union mediation, UN humanitarian operations, international sanctions discussions, peace negotiations"
    },
    "Sudan Civil War": {
      summary: "The Sudan Civil War began on April 15, 2023, between the Sudanese Armed Forces (SAF) and the Rapid Support Forces (RSF), leading to devastating humanitarian crisis and widespread displacement.",
      background: "Tensions arose from disagreements over the integration of RSF into the national army as part of Sudan's transition to civilian rule following the 2019 revolution that ousted Omar al-Bashir.",
      keyEvents: [
        "April 15, 2023: Fighting erupts between SAF and RSF in Khartoum",
        "April 2023: International evacuation of foreign nationals",
        "May 2023: Darfur region experiences severe violence",
        "June 2023: RSF gains control of parts of Khartoum",
        "2024: Conflict spreads to eastern Sudan",
        "2025: Ongoing fighting with no clear resolution (June 2025)"
      ],
      casualties: "Over 40,000 deaths, millions displaced (June 2025)",
      impact: "8.5 million internally displaced, 1.8 million refugees in neighboring countries, collapse of healthcare and education systems.",
      economicImpact: "Economic collapse, oil production disrupted, agricultural sector devastated, massive humanitarian funding needed",
      internationalResponse: "AU and IGAD mediation efforts, UN humanitarian operations, sanctions on both sides, peace talks in Jeddah"
    },
    "Myanmar Civil War": {
      summary: "The Myanmar Civil War intensified following the February 1, 2021 military coup that overthrew the civilian government, leading to armed resistance and widespread civil disobedience.",
      background: "Myanmar's military (Tatmadaw) seized power claiming election fraud, ending a decade of democratic transition. This sparked nationwide protests and armed resistance from various ethnic groups and pro-democracy forces.",
      keyEvents: [
        "February 1, 2021: Military coup overthrows civilian government",
        "February-March 2021: Nationwide protests and civil disobedience",
        "March 2021: Military crackdown intensifies, hundreds killed",
        "September 2021: National Unity Government declares 'defensive war'",
        "2022: Formation of People's Defense Forces across the country",
        "2023-2024: Coordinated offensives by opposition forces",
        "2025: Resistance forces control significant territory (June 2025)"
      ],
      casualties: "Over 15,000 deaths, thousands detained (June 2025)",
      impact: "1.5 million internally displaced, economic collapse, humanitarian crisis, regional refugee flows to Thailand and India.",
      economicImpact: "GDP contracted by 30%, currency devaluation, foreign investment withdrawal, sanctions impact",
      internationalResponse: "ASEAN diplomatic efforts, international sanctions, arms embargoes, humanitarian aid restrictions"
    },
    "Mexico Drug War": {
      summary: "The Mexican Drug War is an ongoing asymmetric conflict between Mexican government forces and various drug trafficking organizations, characterized by extreme violence and corruption.",
      background: "The conflict intensified in 2006 when President Felipe Calderón launched military operations against cartels. Violence escalated as cartels fragmented and competed for territory and routes.",
      keyEvents: [
        "December 2006: President Calderón deploys military against cartels",
        "2008-2012: Peak violence period with over 15,000 deaths annually",
        "2014: Capture of major cartel leaders leads to fragmentation",
        "2019: El Chapo sentenced to life in US prison",
        "2020-2023: Rise of CJNG and continued territorial disputes",
        "2024-2025: Ongoing violence despite government strategies (June 2025)"
      ],
      casualties: "Over 400,000 deaths since 2006, 100,000+ disappeared (June 2025)",
      impact: "Massive internal displacement, corruption of institutions, impact on tourism and economy, cross-border security concerns.",
      economicImpact: "Estimated 1.2% GDP loss annually, tourism sector impact, increased security costs, US-Mexico trade affected",
      internationalResponse: "US cooperation through Merida Initiative, DEA operations, extradition agreements, border security measures"
    },
    "Kashmir Border Tensions": {
      summary: "The Kashmir conflict involves territorial disputes between India and Pakistan over the Kashmir region, with ongoing military presence and periodic escalations since 1947.",
      background: "Following partition of British India in 1947, both countries claimed Kashmir. Three wars have been fought over the region, with China also controlling some territory (Aksai Chin). The dispute involves religious, strategic, and water resource considerations.",
      keyEvents: [
        "1947-48: First Kashmir War following partition",
        "1965: Second Kashmir War between India and Pakistan",
        "1999: Kargil War escalation",
        "2016: Uri attack and surgical strikes",
        "2019: Pulwama attack and Balakot airstrikes",
        "2019: Article 370 revocation by India",
        "2020: Galwan Valley clash with China"
      ],
      casualties: "Estimated 70,000+ deaths since 1989, thousands of security forces killed",
      impact: "Ongoing military presence of 500,000+ troops, human rights concerns, regional nuclear tensions.",
      economicImpact: "Tourism industry severely affected, development hindered by conflict, massive military expenditure burden",
      internationalResponse: "UN resolutions, international mediation attempts, global concerns over nuclear escalation risks"
    },
    "Taiwan Strait Tensions": {
      summary: "Rising tensions across Taiwan Strait involve China's claims over Taiwan and increasing military activities around the island, with Taiwan maintaining de facto independence.",
      background: "Taiwan has been self-governed since 1949 when Chinese Nationalists retreated there after the civil war. China considers Taiwan a breakaway province while Taiwan operates as a democratic state with its own government.",
      keyEvents: [
        "1996: Third Taiwan Strait Crisis with Chinese missile tests",
        "2016: Election of independence-leaning President Tsai Ing-wen",
        "2020: Increased Chinese military flights in Taiwan's air defense zone",
        "2022: Nancy Pelosi visit triggers major Chinese military exercises",
        "2023: Record number of Chinese military incursions",
        "2024: Taiwan elections amid continued Chinese pressure"
      ],
      casualties: "No direct military casualties in recent tensions, but preparation for potential conflict ongoing",
      impact: "Regional military buildup, global semiconductor supply chain concerns, diplomatic isolation of Taiwan.",
      economicImpact: "Taiwan produces 63% of world's semiconductors, potential disruption to global technology supply chains",
      internationalResponse: "US military support and weapons sales, Japanese and Australian security cooperation, EU concerns over stability"
    },
    "DRC Eastern Conflicts": {
      summary: "Multiple armed groups operate in eastern Democratic Republic of Congo, fighting over resources and territory in ongoing conflicts affecting millions of civilians.",
      background: "Conflicts stem from 1990s Rwandan genocide aftermath, ethnic tensions, competition for mineral resources including cobalt and gold, and weak state control over vast territories.",
      keyEvents: [
        "1996-2003: First and Second Congo Wars",
        "2012: M23 rebellion and capture of Goma",
        "2018: Ebola outbreak complicated by ongoing conflict",
        "2021: Islamic State affiliate attacks increase",
        "2022: M23 resurges with significant territorial gains",
        "2023-2025: Regional mediation efforts and peacekeeping operations continue (June 2025)"
      ],
      casualties: "Over 6 million deaths since 1996, ongoing violence claims thousands annually (June 2025)",
      impact: "Massive displacement of 5.6 million people, sexual violence epidemic, child soldier recruitment, humanitarian crisis.",
      economicImpact: "Illegal mining of cobalt, gold, and other minerals funding armed groups, economic devastation in eastern regions",
      internationalResponse: "UN peacekeeping mission MONUSCO, regional military interventions, humanitarian aid operations, sanctions on armed groups"
    },
    "Syria Civil War": {
      summary: "The Syrian Civil War began in 2011 as part of the Arab Spring, evolving into a complex multi-sided conflict involving government forces, opposition groups, and international powers.",
      background: "Protests against Bashar al-Assad's government in 2011 escalated into armed conflict. The war involves multiple factions including government forces, opposition groups, Kurdish forces, and various international actors.",
      keyEvents: [
        "March 2011: Initial protests in Daraa spark nationwide demonstrations",
        "2012: Free Syrian Army formed, conflict militarizes",
        "2013: Chemical weapons attack in Ghouta",
        "2014-2017: Rise and fall of ISIS in Syrian territory",
        "2015: Russian military intervention begins",
        "2016: Battle of Aleppo, government retakes city",
        "2018-2025: Ongoing low-level conflict and reconstruction efforts (June 2025)"
      ],
      casualties: "Over 500,000 deaths, 13 million displaced (June 2025)",
      impact: "Massive refugee crisis affecting neighboring countries, destruction of cultural heritage, fragmentation of state control.",
      economicImpact: "Estimated $400+ billion in damages, currency collapse, oil production severely reduced",
      internationalResponse: "UN peace efforts, international sanctions, humanitarian aid operations, various military interventions"
    },
    "Yemen Civil War": {
      summary: "The Yemen Civil War escalated in 2014 when Houthi rebels seized control of the capital Sanaa, leading to Saudi-led coalition intervention and ongoing humanitarian crisis.",
      background: "Yemen's civil war stems from political transition failures after the Arab Spring, regional power struggles between Saudi Arabia and Iran, and historical north-south divisions.",
      keyEvents: [
        "2014: Houthi rebels capture Sanaa, government flees",
        "March 2015: Saudi-led coalition begins airstrikes",
        "2016: UN-mediated peace talks fail repeatedly",
        "2018: Battle for Hodeidah port threatens humanitarian supplies",
        "2019: Attack on Saudi oil facilities escalates tensions",
        "2022: UN-brokered truce provides temporary relief",
        "2023-2025: Continued low-level fighting despite peace efforts (June 2025)"
      ],
      casualties: "Over 380,000 deaths, 24 million need humanitarian aid (June 2025)",
      impact: "World's worst humanitarian crisis, cholera outbreak, mass starvation, economic collapse.",
      economicImpact: "GDP contracted by 50%, currency devaluation, oil exports disrupted, massive reconstruction needs",
      internationalResponse: "UN humanitarian operations, peace mediation efforts, arms embargoes, international donor support"
    },
    "South China Sea Disputes": {
      summary: "Multiple nations claim territorial rights in the South China Sea, with China asserting broad claims through artificial island construction and military presence.",
      background: "Rich fishing grounds, potential oil and gas reserves, and strategic shipping lanes make the South China Sea a focal point for territorial disputes involving China, Philippines, Vietnam, Malaysia, and others.",
      keyEvents: [
        "2009: China submits nine-dash line claim to UN",
        "2012: Scarborough Shoal standoff between China and Philippines",
        "2014-2016: Large-scale Chinese artificial island construction",
        "2016: International tribunal rules against China's claims",
        "2020: Increased Chinese coast guard presence",
        "2023-2024: Multiple incidents between Chinese and Philippine vessels",
        "2025: Ongoing tensions with regular confrontations (June 2025)"
      ],
      casualties: "No major military casualties, but regular incidents and confrontations",
      impact: "Regional military buildup, disruption to fishing activities, international shipping route tensions.",
      economicImpact: "Potential disruption to $3.4 trillion in annual trade, fishing industry impacts, energy exploration disputes",
      internationalResponse: "ASEAN diplomatic efforts, US freedom of navigation operations, international legal proceedings"
    },
    "Afghanistan Taliban Control": {
      summary: "Taliban regained control of Afghanistan in August 2021 following US withdrawal, establishing Islamic Emirate and facing international isolation amid humanitarian crisis.",
      background: "After 20 years of war, Taliban returned to power as US and NATO forces withdrew. The group faces challenges governing, economic collapse, and resistance movements.",
      keyEvents: [
        "August 2021: Taliban captures Kabul, US completes withdrawal",
        "September 2021: Taliban announces interim government",
        "2022: Women banned from education and most employment",
        "2023: International aid restrictions continue",
        "2024: Economic crisis deepens, banking system struggles",
        "2025: Ongoing humanitarian crisis and international isolation (June 2025)"
      ],
      casualties: "Thousands killed during takeover, ongoing casualties from resistance and ISIS-K attacks",
      impact: "Humanitarian crisis affecting 28 million people, refugee flows to neighboring countries, women's rights eliminated.",
      economicImpact: "Economic collapse, currency devaluation, international aid frozen, opium trade increases",
      internationalResponse: "No formal recognition, humanitarian aid conditional, Taliban diplomatic isolation"
    },
    "Nagorno-Karabakh Conflict": {
      summary: "Armenia-Azerbaijan conflict over Nagorno-Karabakh region culminated in Azerbaijan's 2023 military operation, leading to Armenian exodus and territorial resolution.",
      background: "Decades-long dispute over Armenian-majority enclave within Azerbaijan borders, involving ethnic tensions, territorial claims, and regional power dynamics.",
      keyEvents: [
        "1988-1994: First Nagorno-Karabakh War",
        "September 2020: 44-day war, Azerbaijan gains territory",
        "2021-2022: Occasional border clashes and tensions",
        "September 2023: Azerbaijan launches operation in Karabakh",
        "December 2023: Nagorno-Karabakh Republic dissolved",
        "2024-2025: Post-conflict normalization efforts ongoing (June 2025)"
      ],
      casualties: "Over 7,000 deaths in 2020 war, hundreds in 2023 operation",
      impact: "Displacement of 100,000 Armenians from Karabakh, altered regional balance, refugee integration challenges.",
      economicImpact: "Infrastructure damage, energy corridor implications, reconstruction costs, displaced population burden",
      internationalResponse: "Russian peacekeeping mission ended, EU monitoring mission, international mediation attempts"
    },
    "Iran-Israel Shadow War": {
      summary: "Ongoing covert conflict between Iran and Israel involving cyber attacks, proxy warfare, assassinations, and regional power projection across the Middle East.",
      background: "Long-standing rivalry intensified after Iran's 1979 revolution, centered on Iran's nuclear program, support for anti-Israeli groups, and competing regional influence.",
      keyEvents: [
        "2010-2012: Stuxnet cyber attacks on Iranian nuclear facilities",
        "2018: Israel reveals Iran's nuclear archive theft",
        "2020: Assassination of Iranian nuclear scientist Mohsen Fakhrizadeh",
        "2021-2023: Escalating attacks on Iranian nuclear facilities",
        "2024: Direct military exchanges and drone attacks",
        "2025: Continued proxy conflicts in Syria, Lebanon, and Gaza (June 2025)"
      ],
      casualties: "Hundreds of casualties from proxy conflicts, targeted assassinations, and indirect confrontations",
      impact: "Regional destabilization, nuclear proliferation concerns, proxy warfare across multiple countries.",
      economicImpact: "Billions spent on defense systems, sanctions impact on Iranian economy, regional trade disruption",
      internationalResponse: "US sanctions on Iran, European diplomatic efforts, IAEA monitoring, regional security partnerships"
    },
    "West Africa Sahel Crisis": {
      summary: "Multi-country insurgency involving jihadist groups across Mali, Burkina Faso, Niger, and Chad, creating regional security and humanitarian crisis.",
      background: "Crisis began with 2012 Tuareg rebellion in Mali, exploited by jihadist groups including JNIM and Islamic State affiliates, spreading across Sahel region.",
      keyEvents: [
        "2012: Tuareg rebellion and jihadist takeover in northern Mali",
        "2013: French Operation Serval intervention in Mali",
        "2014-2020: Expansion of violence to Burkina Faso and Niger",
        "2021-2023: Military coups in Mali, Burkina Faso, and Niger",
        "2023: French forces withdraw from region",
        "2024-2025: Continued insurgency and regional instability (June 2025)"
      ],
      casualties: "Over 20,000 deaths since 2012, millions displaced across the region",
      impact: "State collapse risks, massive displacement, humanitarian crisis, democratic backsliding.",
      economicImpact: "Agricultural disruption, mining operations threatened, foreign investment withdrawal, aid dependency",
      internationalResponse: "UN peacekeeping missions, French military intervention, EU training missions, regional cooperation efforts"
    },
    "Georgia-Russia Border Tensions": {
      summary: "Ongoing tensions between Georgia and Russia over occupied territories of South Ossetia and Abkhazia, with periodic escalations and borderization activities.",
      background: "Conflict stems from 1990s civil wars and 2008 Russo-Georgian War, resulting in Russian occupation of 20% of Georgian territory.",
      keyEvents: [
        "1992-1993: Abkhazia and South Ossetia conflicts",
        "August 2008: Five-day war, Russian recognition of breakaway regions",
        "2009-present: 'Borderization' process by Russian forces",
        "2019-2021: Periodic detentions and border incidents",
        "2022: Impact of Ukraine war on regional dynamics",
        "2023-2025: Continued occupation and international mediation efforts (June 2025)"
      ],
      casualties: "Over 400 deaths in 2008 war, occasional casualties from border incidents",
      impact: "Territorial occupation, 280,000 internally displaced persons, frozen conflict status.",
      economicImpact: "Loss of territory and resources, trade route disruption, limited foreign investment in occupied regions",
      internationalResponse: "EU monitoring mission, Geneva International Discussions, US support for Georgia, international non-recognition policy"
    },
    "Venezuela Border Crisis": {
      summary: "Multi-faceted crisis involving mass migration, territorial disputes with neighbors, and internal political conflict affecting regional stability.",
      background: "Economic collapse since 2013 led to massive emigration, while territorial disputes with Guyana over Essequibo region have escalated.",
      keyEvents: [
        "2015: Beginning of major migration crisis",
        "2019: Political crisis and disputed presidential election",
        "2020: Failed maritime invasion attempt",
        "2023: Guyana-Venezuela Essequibo territorial dispute escalation",
        "2024: Referendum on Essequibo annexation",
        "2025: Continued regional tensions and migration flows (June 2025)"
      ],
      casualties: "Thousands of deaths from violence and humanitarian crisis, border incidents with irregular armed groups",
      impact: "7.7 million Venezuelan migrants and refugees, regional destabilization, humanitarian emergency.",
      economicImpact: "Economic collapse with 75% GDP contraction, hyperinflation, oil industry deterioration, migration costs for neighbors",
      internationalResponse: "Lima Group sanctions, US sanctions, humanitarian aid programs, regional migration agreements"
    },
    "Haiti Gang Crisis": {
      summary: "Complete breakdown of state authority in Haiti with criminal gangs controlling majority of territory, creating humanitarian catastrophe and regional security concerns.",
      background: "Political vacuum following 2021 presidential assassination led to gang alliance 'G9' seizing control of capital and countryside.",
      keyEvents: [
        "July 2021: Assassination of President Jovenel Moïse",
        "2022: Gang alliance G9 gains control of Port-au-Prince",
        "2023: Cholera outbreak amid gang violence",
        "2024: Prime minister resigns, transitional council formed",
        "2025: International intervention discussions, continued gang control (June 2025)"
      ],
      casualties: "Over 8,000 deaths in 2023 alone, thousands more injured and kidnapped",
      impact: "State collapse, 5.5 million facing acute hunger, mass displacement, complete breakdown of public services.",
      economicImpact: "Economic activity ceased, infrastructure destroyed, complete dependence on humanitarian aid",
      internationalResponse: "UN Security Council resolutions, Kenya-led international intervention force, humanitarian aid operations"
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
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-2 leading-tight">{conflict.name}</CardTitle>
                      <div className="flex items-center flex-wrap gap-3 text-xs text-slate-600">
                        <div className="flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          {conflict.region}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {conflict.duration}
                        </div>
                        <div className="flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          <Badge variant={getSeverityColor(conflict.severity)} className="ml-1 text-xs">
                            {conflict.severity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(conflict.status)} className="text-xs flex-shrink-0 ml-2">
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

                      {((details as any).internationalResponse || (details as any).militarySupport || (details as any).militaryPresence) && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3">International Response</h4>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-700 text-sm">
                              {(details as any).internationalResponse || (details as any).militarySupport || (details as any).militaryPresence}
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

        {/* Timeline Section */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Conflict Timeline</h2>
            <p className="text-slate-600">
              Interactive timeline showing key events and developments across global conflicts
            </p>
          </div>
          <ConflictTimeline />
        </div>
      </main>
    </div>
  );
}