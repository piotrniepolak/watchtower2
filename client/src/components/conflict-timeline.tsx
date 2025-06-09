import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, AlertTriangle, TrendingUp, Filter } from "lucide-react";
import { useState } from "react";
import { MiniGeopoliticalLoader } from "@/components/geopolitical-loader";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Globe, TrendingUp as TrendingUpIcon } from "lucide-react";
import type { Conflict } from "@shared/schema";

interface TimelineEvent {
  id: string;
  conflictId: number;
  conflictName: string;
  date: Date;
  title: string;
  description: string;
  type: "start" | "escalation" | "ceasefire" | "resolution" | "milestone";
  severity: "Low" | "Medium" | "High" | "Critical";
  region: string;
  parties: string[];
  casualties?: number;
  economicImpact?: string;
}

interface FilterOptions {
  region: string;
  severity: string;
  type: string;
  timeRange: string;
}

export default function ConflictTimeline() {
  const [filters, setFilters] = useState<FilterOptions>({
    region: "all",
    severity: "all",
    type: "all",
    timeRange: "1year"
  });
  
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsEvent, setDetailsEvent] = useState<TimelineEvent | null>(null);

  const { data: conflicts = [] } = useQuery<Conflict[]>({
    queryKey: ['/api/conflicts'],
    refetchInterval: 30000,
  });

  // Generate timeline events from conflict data
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    conflicts.forEach(conflict => {
      // Start event
      events.push({
        id: `${conflict.id}-start`,
        conflictId: conflict.id,
        conflictName: conflict.name,
        date: new Date(conflict.startDate),
        title: `${conflict.name} Begins`,
        description: conflict.description || "Conflict initiated",
        type: "start",
        severity: conflict.severity as any,
        region: conflict.region,
        parties: conflict.parties || [],
        economicImpact: "Regional markets affected"
      });

      // Recent update event (if within last 30 days)
      const daysSinceUpdate = Math.floor((Date.now() - new Date(conflict.lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate <= 30) {
        events.push({
          id: `${conflict.id}-update`,
          conflictId: conflict.id,
          conflictName: conflict.name,
          date: new Date(conflict.lastUpdated),
          title: `${conflict.name} Update`,
          description: `Recent developments in ${conflict.region}`,
          type: conflict.severity === "Critical" ? "escalation" : "milestone",
          severity: conflict.severity as any,
          region: conflict.region,
          parties: conflict.parties || []
        });
      }

      // Add comprehensive historical events for each conflict
      if (conflict.name === "Ukraine-Russia Conflict") {
        const ukraineEvents = [
          { date: "2014-02-20", title: "Euromaidan Revolution", description: "Ukrainian revolution leads to government change", type: "start", severity: "Medium", casualties: 130 },
          { date: "2014-03-18", title: "Crimea Annexation", description: "Russia formally annexes Crimea following referendum", type: "escalation", severity: "High", casualties: 0, economicImpact: "Sanctions imposed, defense stocks rise 8%" },
          { date: "2014-04-06", title: "Donbas War Begins", description: "Pro-Russian separatists declare independence in eastern Ukraine", type: "escalation", severity: "High", casualties: 3000 },
          { date: "2014-07-17", title: "MH17 Shot Down", description: "Malaysian Airlines flight shot down over eastern Ukraine", type: "escalation", severity: "Critical", casualties: 298, economicImpact: "Aviation stocks plummet, defense stocks surge" },
          { date: "2014-09-05", title: "Minsk Protocol Signed", description: "First ceasefire agreement between Ukraine and separatists", type: "ceasefire", severity: "Medium" },
          { date: "2015-02-12", title: "Minsk II Agreement", description: "Second attempt at comprehensive ceasefire", type: "ceasefire", severity: "Medium" },
          { date: "2021-03-24", title: "Military Buildup", description: "Russia begins massive troop buildup near Ukrainian border", type: "escalation", severity: "High", economicImpact: "Defense contractors gain 12%" },
          { date: "2022-02-24", title: "Full-Scale Invasion", description: "Russia launches full-scale military invasion of Ukraine", type: "escalation", severity: "Critical", casualties: 10000, economicImpact: "Defense stocks surge 20%, energy crisis begins" },
          { date: "2022-03-16", title: "Mariupol Theater Bombing", description: "Russian forces bomb theater sheltering civilians", type: "escalation", severity: "Critical", casualties: 600 },
          { date: "2022-04-08", title: "Bucha Massacre Revealed", description: "Evidence of civilian massacres in liberated territories", type: "escalation", severity: "Critical", casualties: 458 },
          { date: "2022-05-20", title: "Mariupol Falls", description: "Last Ukrainian defenders surrender at Azovstal steel plant", type: "milestone", severity: "High" },
          { date: "2022-09-06", title: "Kharkiv Counteroffensive", description: "Ukrainian forces liberate significant territory in Kharkiv region", type: "milestone", severity: "High", casualties: 2000, economicImpact: "Defense stocks surge 8-12%" },
          { date: "2022-10-08", title: "Crimean Bridge Attack", description: "Strategic bridge connecting Russia to Crimea damaged", type: "escalation", severity: "Critical", economicImpact: "Oil prices spike 3%, defense contractors up 5%" },
          { date: "2022-11-11", title: "Kherson Liberation", description: "Ukrainian forces retake strategic city of Kherson", type: "milestone", severity: "High" },
          { date: "2023-06-06", title: "Kakhovka Dam Destroyed", description: "Critical infrastructure attack causes massive flooding", type: "escalation", severity: "Critical", casualties: 89 },
          { date: "2024-02-17", title: "Avdiivka Falls", description: "Ukrainian forces withdraw from strategic eastern city", type: "escalation", severity: "High" },
          { date: "2024-05-10", title: "Kharkiv Offensive", description: "Russia launches new offensive in northern Ukraine", type: "escalation", severity: "High", economicImpact: "Defense stocks rally 6%" }
        ];
        
        ukraineEvents.forEach((event, index) => {
          events.push({
            id: `${conflict.id}-ukraine-${index}`,
            conflictId: conflict.id,
            conflictName: conflict.name,
            date: new Date(event.date),
            title: event.title,
            description: event.description,
            type: event.type as any,
            severity: event.severity as any,
            region: conflict.region,
            parties: conflict.parties || [],
            casualties: event.casualties,
            economicImpact: event.economicImpact
          });
        });
      }
      
      if (conflict.name === "Israel-Palestine Conflict") {
        const israelPalestineEvents = [
          { date: "2000-09-28", title: "Second Intifada Begins", description: "Palestinian uprising following Ariel Sharon's Temple Mount visit", type: "start", severity: "High", casualties: 4000 },
          { date: "2005-08-15", title: "Gaza Disengagement", description: "Israel withdraws all settlements from Gaza Strip", type: "milestone", severity: "Medium" },
          { date: "2006-06-25", title: "Hamas Takes Gaza", description: "Hamas wins Palestinian elections, later takes control of Gaza", type: "escalation", severity: "High" },
          { date: "2008-12-27", title: "Operation Cast Lead", description: "Israel launches major military operation in Gaza", type: "escalation", severity: "Critical", casualties: 1400, economicImpact: "Defense stocks rise 15%" },
          { date: "2012-11-14", title: "Operation Pillar of Defense", description: "Eight-day conflict between Israel and Hamas", type: "escalation", severity: "High", casualties: 174 },
          { date: "2014-07-08", title: "Operation Protective Edge", description: "50-day war between Israel and Hamas in Gaza", type: "escalation", severity: "Critical", casualties: 2251, economicImpact: "Defense contractors surge 18%" },
          { date: "2021-05-10", title: "Operation Guardian of the Walls", description: "11-day conflict triggered by Jerusalem tensions", type: "escalation", severity: "High", casualties: 279 },
          { date: "2023-10-07", title: "Operation Al-Aqsa Flood", description: "Hamas launches large-scale attack on Israel", type: "escalation", severity: "Critical", casualties: 1200, economicImpact: "Defense stocks rally 20%, oil volatile" },
          { date: "2023-10-27", title: "Gaza Ground Invasion", description: "Israel launches ground offensive in Gaza Strip", type: "escalation", severity: "Critical", casualties: 8000 },
          { date: "2024-01-15", title: "Regional Escalation", description: "Conflict spreads with Hezbollah and regional actors", type: "escalation", severity: "Critical", economicImpact: "Defense stocks maintain elevated levels" },
          { date: "2024-07-30", title: "Haniyeh Assassination", description: "Hamas political leader killed in Tehran", type: "escalation", severity: "Critical", economicImpact: "Geopolitical risk premium spikes" }
        ];
        
        israelPalestineEvents.forEach((event, index) => {
          events.push({
            id: `${conflict.id}-israel-${index}`,
            conflictId: conflict.id,
            conflictName: conflict.name,
            date: new Date(event.date),
            title: event.title,
            description: event.description,
            type: event.type as any,
            severity: event.severity as any,
            region: conflict.region,
            parties: conflict.parties || [],
            casualties: event.casualties,
            economicImpact: event.economicImpact
          });
        });
      }
      
      if (conflict.name === "Syria Civil War") {
        const syriaEvents = [
          { date: "2011-03-15", title: "Syrian Uprising Begins", description: "Protests begin in Daraa following Arab Spring", type: "start", severity: "Medium", casualties: 100 },
          { date: "2011-07-29", title: "Free Syrian Army Formed", description: "Defected officers form opposition military force", type: "escalation", severity: "High" },
          { date: "2013-08-21", title: "Ghouta Chemical Attack", description: "Chemical weapons used against civilians in Damascus suburbs", type: "escalation", severity: "Critical", casualties: 1729 },
          { date: "2014-06-29", title: "ISIS Declares Caliphate", description: "Islamic State establishes control over large territories", type: "escalation", severity: "Critical", economicImpact: "Oil prices surge, defense spending increases" },
          { date: "2015-09-30", title: "Russian Intervention", description: "Russia begins direct military intervention supporting Assad", type: "escalation", severity: "Critical", economicImpact: "Defense stocks rally 12%" },
          { date: "2016-12-22", title: "Aleppo Falls", description: "Syrian government recaptures Aleppo after long siege", type: "milestone", severity: "High", casualties: 400 },
          { date: "2018-04-07", title: "Douma Chemical Attack", description: "Alleged chemical attack prompts Western airstrikes", type: "escalation", severity: "Critical", casualties: 43 },
          { date: "2019-10-09", title: "Turkish Invasion", description: "Turkey launches operation against Kurdish forces", type: "escalation", severity: "High", economicImpact: "Regional defense stocks rise" },
          { date: "2020-03-05", title: "Idlib Escalation", description: "Turkish-Syrian forces clash in Idlib province", type: "escalation", severity: "High", casualties: 55 }
        ];
        
        syriaEvents.forEach((event, index) => {
          events.push({
            id: `${conflict.id}-syria-${index}`,
            conflictId: conflict.id,
            conflictName: conflict.name,
            date: new Date(event.date),
            title: event.title,
            description: event.description,
            type: event.type as any,
            severity: event.severity as any,
            region: conflict.region,
            parties: conflict.parties || [],
            casualties: event.casualties,
            economicImpact: event.economicImpact
          });
        });
      }
      
      if (conflict.name === "Yemen Civil War") {
        const yemenEvents = [
          { date: "2014-09-21", title: "Houthis Capture Sanaa", description: "Houthi rebels seize control of Yemeni capital", type: "start", severity: "High", casualties: 500 },
          { date: "2015-03-26", title: "Saudi Coalition Intervention", description: "Saudi-led coalition begins bombing campaign", type: "escalation", severity: "Critical", economicImpact: "Oil prices spike 8%, defense stocks surge" },
          { date: "2016-10-08", title: "Funeral Hall Bombing", description: "Coalition airstrike kills 155 at funeral ceremony", type: "escalation", severity: "Critical", casualties: 155 },
          { date: "2017-12-04", title: "Saleh Killed", description: "Former president Ali Abdullah Saleh killed by Houthis", type: "escalation", severity: "High", casualties: 1 },
          { date: "2018-06-13", title: "Hodeidah Offensive", description: "Coalition launches assault on crucial port city", type: "escalation", severity: "Critical", economicImpact: "Humanitarian crisis deepens" },
          { date: "2019-09-14", title: "Saudi Oil Attacks", description: "Drone attacks on Saudi oil facilities", type: "escalation", severity: "Critical", economicImpact: "Oil prices jump 15%, defense stocks rally" },
          { date: "2022-04-02", title: "Nationwide Truce", description: "UN-brokered truce brings temporary calm", type: "ceasefire", severity: "Medium" }
        ];
        
        yemenEvents.forEach((event, index) => {
          events.push({
            id: `${conflict.id}-yemen-${index}`,
            conflictId: conflict.id,
            conflictName: conflict.name,
            date: new Date(event.date),
            title: event.title,
            description: event.description,
            type: event.type as any,
            severity: event.severity as any,
            region: conflict.region,
            parties: conflict.parties || [],
            casualties: event.casualties,
            economicImpact: event.economicImpact
          });
        });
      }
      
      if (conflict.name === "Iran-Israel Tensions") {
        const iranIsraelEvents = [
          { date: "2020-01-03", title: "Soleimani Assassination", description: "US kills Iranian general Qasem Soleimani in Iraq", type: "escalation", severity: "Critical", economicImpact: "Oil spikes 4%, defense stocks surge 12%" },
          { date: "2021-04-11", title: "Natanz Nuclear Facility Attack", description: "Explosion at Iranian nuclear facility attributed to Israel", type: "escalation", severity: "High" },
          { date: "2022-03-13", title: "Erbil Missile Attack", description: "Iran launches missiles at US consulate in Iraq", type: "escalation", severity: "High" },
          { date: "2024-04-01", title: "Damascus Consulate Strike", description: "Israel strikes Iranian consulate in Damascus", type: "escalation", severity: "Critical" },
          { date: "2024-04-13", title: "Iranian Retaliation", description: "Iran launches direct missile and drone attack on Israel", type: "escalation", severity: "Critical", economicImpact: "Defense stocks surge 15%, oil up 5%" },
          { date: "2024-10-01", title: "Iranian Missile Barrage", description: "Second major Iranian attack on Israeli territory", type: "escalation", severity: "Critical", economicImpact: "Regional tensions peak, defense rally continues" }
        ];
        
        iranIsraelEvents.forEach((event, index) => {
          events.push({
            id: `${conflict.id}-iran-${index}`,
            conflictId: conflict.id,
            conflictName: conflict.name,
            date: new Date(event.date),
            title: event.title,
            description: event.description,
            type: event.type as any,
            severity: event.severity as any,
            region: conflict.region,
            parties: conflict.parties || [],
            casualties: event.casualties,
            economicImpact: event.economicImpact
          });
        });
      }
      
      if (conflict.name === "South China Sea Disputes") {
        const southChinaSeaEvents = [
          { date: "2009-05-07", title: "Nine-Dash Line Submitted", description: "China submits controversial territorial claims to UN", type: "start", severity: "Medium" },
          { date: "2012-04-10", title: "Scarborough Shoal Standoff", description: "Naval standoff between China and Philippines", type: "escalation", severity: "High" },
          { date: "2014-05-02", title: "HD-981 Oil Rig Crisis", description: "China places oil rig in disputed waters near Vietnam", type: "escalation", severity: "High", economicImpact: "Regional shipping concerns rise" },
          { date: "2016-07-12", title: "Arbitration Ruling", description: "International tribunal rules against China's claims", type: "milestone", severity: "High" },
          { date: "2020-04-18", title: "Haiyang Dizhi Incident", description: "Chinese survey ship operates in Malaysian waters", type: "escalation", severity: "Medium" },
          { date: "2021-03-07", title: "Whitsun Reef Incident", description: "Over 200 Chinese vessels anchor at disputed reef", type: "escalation", severity: "High" },
          { date: "2023-08-05", title: "Taiwan Strait Tensions", description: "Increased military activity following diplomatic visits", type: "escalation", severity: "High", economicImpact: "Tech and shipping stocks volatile" }
        ];
        
        southChinaSeaEvents.forEach((event, index) => {
          events.push({
            id: `${conflict.id}-scs-${index}`,
            conflictId: conflict.id,
            conflictName: conflict.name,
            date: new Date(event.date),
            title: event.title,
            description: event.description,
            type: event.type as any,
            severity: event.severity as any,
            region: conflict.region,
            parties: conflict.parties || [],
            casualties: event.casualties,
            economicImpact: event.economicImpact
          });
        });
      }

      if (conflict.name === "Myanmar Civil War") {
        const myanmarEvents = [
          { date: "2021-02-01", title: "Military Coup", description: "Myanmar military seizes power, detains civilian leaders", type: "start", severity: "High", casualties: 0 },
          { date: "2021-02-06", title: "Civil Disobedience Movement", description: "Nationwide protests and strikes against military rule", type: "escalation", severity: "Medium", casualties: 50 },
          { date: "2021-03-27", title: "Armed Forces Day Massacre", description: "Security forces kill over 100 protesters in single day", type: "escalation", severity: "Critical", casualties: 114 },
          { date: "2021-05-05", title: "National Unity Government Formed", description: "Opposition leaders establish parallel government", type: "milestone", severity: "High" },
          { date: "2021-09-07", title: "People's Defense Force Declared", description: "Opposition announces armed wing to fight military", type: "escalation", severity: "High", economicImpact: "Foreign investment withdrawals accelerate" },
          { date: "2022-07-25", title: "Execution of Democracy Activists", description: "Military executes four pro-democracy activists", type: "escalation", severity: "Critical", casualties: 4 },
          { date: "2023-10-27", title: "Operation 1027 Begins", description: "Three Brothers Alliance launches coordinated offensive", type: "escalation", severity: "Critical", casualties: 3000, economicImpact: "Regional defense spending increases" },
          { date: "2024-01-30", title: "Shan State Offensive", description: "Ethnic armed groups capture key military installations", type: "escalation", severity: "High", casualties: 1500 }
        ];
        
        myanmarEvents.forEach((event, index) => {
          events.push({
            id: `${conflict.id}-myanmar-${index}`,
            conflictId: conflict.id,
            conflictName: conflict.name,
            date: new Date(event.date),
            title: event.title,
            description: event.description,
            type: event.type as any,
            severity: event.severity as any,
            region: conflict.region,
            parties: conflict.parties || [],
            casualties: event.casualties,
            economicImpact: event.economicImpact
          });
        });
      }

      if (conflict.name === "Sudan Civil War") {
        const sudanEvents = [
          { date: "2019-04-11", title: "Omar al-Bashir Ousted", description: "Military coup removes long-time dictator after protests", type: "start", severity: "High", casualties: 100 },
          { date: "2019-06-03", title: "Khartoum Massacre", description: "Security forces kill protesters at sit-in", type: "escalation", severity: "Critical", casualties: 128 },
          { date: "2019-08-17", title: "Transitional Government Formed", description: "Civilian-military power-sharing agreement signed", type: "milestone", severity: "Medium" },
          { date: "2021-10-25", title: "Second Military Coup", description: "Military dissolves transitional government", type: "escalation", severity: "High", casualties: 0 },
          { date: "2023-04-15", title: "RSF-SAF War Begins", description: "Rapid Support Forces clash with Sudanese Armed Forces", type: "escalation", severity: "Critical", casualties: 5000, economicImpact: "Oil production halted, refugee crisis" },
          { date: "2023-06-20", title: "Khartoum Battle Intensifies", description: "Fighting spreads throughout capital city", type: "escalation", severity: "Critical", casualties: 3000 },
          { date: "2024-02-14", title: "Darfur Ethnic Violence", description: "RSF accused of ethnic cleansing in West Darfur", type: "escalation", severity: "Critical", casualties: 2000 }
        ];
        
        sudanEvents.forEach((event, index) => {
          events.push({
            id: `${conflict.id}-sudan-${index}`,
            conflictId: conflict.id,
            conflictName: conflict.name,
            date: new Date(event.date),
            title: event.title,
            description: event.description,
            type: event.type as any,
            severity: event.severity as any,
            region: conflict.region,
            parties: conflict.parties || [],
            casualties: event.casualties,
            economicImpact: event.economicImpact
          });
        });
      }

      if (conflict.name === "Ethiopia Tigray Conflict") {
        const ethiopiaEvents = [
          { date: "2020-11-04", title: "Tigray War Begins", description: "Ethiopian federal forces attack Tigray regional government", type: "start", severity: "Critical", casualties: 1000, economicImpact: "Regional markets disrupted" },
          { date: "2020-11-28", title: "Mekelle Falls", description: "Federal forces capture Tigray regional capital", type: "milestone", severity: "High", casualties: 500 },
          { date: "2021-06-28", title: "Tigray Forces Counterattack", description: "TPLF launches successful counteroffensive", type: "escalation", severity: "High", casualties: 2000 },
          { date: "2021-11-02", title: "State of Emergency Declared", description: "Ethiopia declares nationwide state of emergency", type: "escalation", severity: "Critical" },
          { date: "2022-03-24", title: "Humanitarian Truce", description: "Government declares humanitarian truce", type: "ceasefire", severity: "Medium" },
          { date: "2022-11-02", title: "Pretoria Peace Agreement", description: "Warring parties sign comprehensive peace deal", type: "resolution", severity: "Low", economicImpact: "Markets rally on peace prospects" }
        ];
        
        ethiopiaEvents.forEach((event, index) => {
          events.push({
            id: `${conflict.id}-ethiopia-${index}`,
            conflictId: conflict.id,
            conflictName: conflict.name,
            date: new Date(event.date),
            title: event.title,
            description: event.description,
            type: event.type as any,
            severity: event.severity as any,
            region: conflict.region,
            parties: conflict.parties || [],
            casualties: event.casualties,
            economicImpact: event.economicImpact
          });
        });
      }

      if (conflict.name === "Afghanistan Taliban Control") {
        const afghanistanEvents = [
          { date: "2021-05-01", title: "US Withdrawal Begins", description: "NATO forces begin final withdrawal from Afghanistan", type: "milestone", severity: "High", economicImpact: "Defense contractor stocks decline" },
          { date: "2021-08-06", title: "Taliban Offensive Accelerates", description: "Taliban rapidly captures provincial capitals", type: "escalation", severity: "Critical", casualties: 2000 },
          { date: "2021-08-15", title: "Kabul Falls", description: "Taliban enters Kabul, government collapses", type: "escalation", severity: "Critical", casualties: 500, economicImpact: "Regional markets crash, refugee crisis" },
          { date: "2021-08-26", title: "Kabul Airport Attack", description: "ISIS-K bombing kills 170 at evacuation site", type: "escalation", severity: "Critical", casualties: 170 },
          { date: "2021-09-07", title: "Interim Government Announced", description: "Taliban announces all-male interim cabinet", type: "milestone", severity: "High" },
          { date: "2022-03-23", title: "Girls' Education Banned", description: "Taliban bans girls from secondary education", type: "escalation", severity: "High", economicImpact: "International aid frozen" },
          { date: "2022-11-24", title: "Women University Ban", description: "Taliban bans women from universities", type: "escalation", severity: "High" },
          { date: "2024-05-12", title: "Flooding Crisis", description: "Severe flooding kills hundreds, highlights governance challenges", type: "milestone", severity: "Medium", casualties: 300 }
        ];
        
        afghanistanEvents.forEach((event, index) => {
          events.push({
            id: `${conflict.id}-afghanistan-${index}`,
            conflictId: conflict.id,
            conflictName: conflict.name,
            date: new Date(event.date),
            title: event.title,
            description: event.description,
            type: event.type as any,
            severity: event.severity as any,
            region: conflict.region,
            parties: conflict.parties || [],
            casualties: event.casualties,
            economicImpact: event.economicImpact
          });
        });
      }

      if (conflict.name === "Taiwan Strait Tensions") {
        const taiwanEvents = [
          { date: "2022-08-02", title: "Pelosi Taiwan Visit", description: "US House Speaker visits Taiwan despite Chinese warnings", type: "escalation", severity: "High", economicImpact: "Tech stocks volatile, shipping disrupted" },
          { date: "2022-08-04", title: "China Military Drills", description: "PLA conducts unprecedented military exercises around Taiwan", type: "escalation", severity: "Critical", economicImpact: "Semiconductor stocks plunge 8%" },
          { date: "2023-04-05", title: "Tsai-McCarthy Meeting", description: "Taiwan president meets US House Speaker in California", type: "escalation", severity: "Medium", economicImpact: "Regional tensions increase" },
          { date: "2023-08-12", title: "Chinese Military Patrols", description: "Daily Chinese military incursions into Taiwan's ADIZ", type: "escalation", severity: "High" },
          { date: "2024-01-13", title: "Taiwan Elections", description: "DPP wins presidency, China denounces results", type: "escalation", severity: "Medium", economicImpact: "Tech stocks rally on stability" },
          { date: "2024-05-20", title: "Lai Inauguration", description: "New Taiwan president inaugurated amid Chinese threats", type: "escalation", severity: "High", economicImpact: "Defense stocks gain on regional tensions" }
        ];
        
        taiwanEvents.forEach((event, index) => {
          events.push({
            id: `${conflict.id}-taiwan-${index}`,
            conflictId: conflict.id,
            conflictName: conflict.name,
            date: new Date(event.date),
            title: event.title,
            description: event.description,
            type: event.type as any,
            severity: event.severity as any,
            region: conflict.region,
            parties: conflict.parties || [],
            casualties: event.casualties,
            economicImpact: event.economicImpact
          });
        });
      }

      if (conflict.name === "Armenia-Azerbaijan Tensions") {
        const armeniaAzerbaijanEvents = [
          { date: "2020-09-27", title: "Second Nagorno-Karabakh War", description: "Azerbaijan launches offensive to reclaim territories", type: "start", severity: "Critical", casualties: 7000, economicImpact: "Energy markets spike on regional instability" },
          { date: "2020-11-10", title: "Ceasefire Agreement", description: "Russia-brokered deal ends 44-day war", type: "ceasefire", severity: "High", economicImpact: "Regional stability improves" },
          { date: "2022-09-13", title: "Border Clashes Resume", description: "Deadliest fighting since 2020 war erupts", type: "escalation", severity: "High", casualties: 286 },
          { date: "2023-09-19", title: "Azerbaijan Offensive", description: "Baku launches operation against Armenian positions", type: "escalation", severity: "Critical", casualties: 200, economicImpact: "European gas supply concerns" },
          { date: "2023-09-28", title: "Nagorno-Karabakh Dissolved", description: "Ethnic Armenian enclave formally dissolved", type: "milestone", severity: "High" }
        ];
        
        armeniaAzerbaijanEvents.forEach((event, index) => {
          events.push({
            id: `${conflict.id}-armenia-${index}`,
            conflictId: conflict.id,
            conflictName: conflict.name,
            date: new Date(event.date),
            title: event.title,
            description: event.description,
            type: event.type as any,
            severity: event.severity as any,
            region: conflict.region,
            parties: conflict.parties || [],
            casualties: event.casualties,
            economicImpact: event.economicImpact
          });
        });
      }


    });

    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const timelineEvents = generateTimelineEvents();

  // Apply filters
  const filteredEvents = timelineEvents.filter(event => {
    if (filters.region !== "all" && event.region !== filters.region) return false;
    if (filters.severity !== "all" && event.severity !== filters.severity) return false;
    if (filters.type !== "all" && event.type !== filters.type) return false;
    
    const eventDate = new Date(event.date);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (filters.timeRange) {
      case "1month": return daysDiff <= 30;
      case "3months": return daysDiff <= 90;
      case "6months": return daysDiff <= 180;
      case "1year": return daysDiff <= 365;
      case "all": return true;
      default: return true;
    }
  });

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "start": return <Users className="h-4 w-4" />;
      case "escalation": return <TrendingUp className="h-4 w-4" />;
      case "ceasefire": return <Clock className="h-4 w-4" />;
      case "resolution": return <Calendar className="h-4 w-4" />;
      case "milestone": return <MapPin className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "start": return "bg-blue-100 text-blue-800 border-blue-200";
      case "escalation": return "bg-red-100 text-red-800 border-red-200";
      case "ceasefire": return "bg-green-100 text-green-800 border-green-200";
      case "resolution": return "bg-purple-100 text-purple-800 border-purple-200";
      case "milestone": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "destructive";
      case "High": return "destructive";
      case "Medium": return "default";
      case "Low": return "secondary";
      default: return "outline";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getUniqueRegions = () => {
    const regionSet = new Set(conflicts.map(c => c.region));
    const regions = Array.from(regionSet);
    return regions.sort();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Conflict Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Region</label>
              <select 
                value={filters.region}
                onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                className="w-full p-2 text-sm border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600"
              >
                <option value="all">All Regions</option>
                {getUniqueRegions().map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Severity</label>
              <select 
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                className="w-full p-2 text-sm border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600"
              >
                <option value="all">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Event Type</label>
              <select 
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-2 text-sm border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600"
              >
                <option value="all">All Types</option>
                <option value="start">Conflict Start</option>
                <option value="escalation">Escalation</option>
                <option value="ceasefire">Ceasefire</option>
                <option value="resolution">Resolution</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Time Range</label>
              <select 
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                className="w-full p-2 text-sm border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <MiniGeopoliticalLoader type="intelligence" />
                <p className="text-slate-600 dark:text-slate-400 mt-4">
                  No events found for the selected filters
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                
                {filteredEvents.map((event, index) => (
                  <div key={event.id} className="relative pl-16">
                    {/* Timeline dot */}
                    <div className={`absolute left-6 w-4 h-4 rounded-full border-2 ${
                      event.type === "escalation" ? "bg-red-500 border-red-600" :
                      event.type === "start" ? "bg-blue-500 border-blue-600" :
                      event.type === "ceasefire" ? "bg-green-500 border-green-600" :
                      event.type === "resolution" ? "bg-purple-500 border-purple-600" :
                      "bg-yellow-500 border-yellow-600"
                    }`}></div>
                    
                    {/* Event card */}
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedEvent?.id === event.id ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getEventTypeIcon(event.type)}
                            <h3 className="font-semibold text-sm">{event.title}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(event.severity) as any}>
                              {event.severity}
                            </Badge>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                              {event.type}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{event.region}</span>
                          </div>
                          

                          
                          <p className="text-sm">{event.description}</p>
                          
                          {selectedEvent?.id === event.id && (
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                              {event.casualties && (
                                <div className="flex items-center gap-2 text-red-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span className="text-xs">Est. {event.casualties.toLocaleString()} casualties</span>
                                </div>
                              )}
                              
                              {event.economicImpact && (
                                <div className="flex items-center gap-2 text-blue-600">
                                  <TrendingUp className="h-3 w-3" />
                                  <span className="text-xs">{event.economicImpact}</span>
                                </div>
                              )}
                              
                              <div className="flex gap-2 mt-3">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDetailsEvent(event);
                                    setDetailsModalOpen(true);
                                  }}
                                >
                                  View Details
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open('/analysis', '_self');
                                  }}
                                >
                                  Market Impact
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {filteredEvents.length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Total Events</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredEvents.filter(e => e.type === "escalation").length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Escalations</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredEvents.filter(e => e.type === "ceasefire").length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Ceasefires</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredEvents.filter(e => e.type === "start").length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">New Conflicts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {detailsEvent?.title}
            </DialogTitle>
          </DialogHeader>
          
          {detailsEvent && (
            <div className="space-y-6">
              {/* Event Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    <span className="font-medium">Date:</span>
                    <span>{formatDate(detailsEvent.date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-600" />
                    <span className="font-medium">Region:</span>
                    <span>{detailsEvent.region}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-slate-600" />
                    <span className="font-medium">Severity:</span>
                    <Badge variant={getSeverityColor(detailsEvent.severity) as any}>
                      {detailsEvent.severity}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Type:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(detailsEvent.type)}`}>
                      {detailsEvent.type}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {detailsEvent.parties.length > 0 && (
                    <div>
                      <span className="font-medium block mb-2">Involved Parties:</span>
                      <div className="flex flex-wrap gap-2">
                        {detailsEvent.parties.map(party => (
                          <div key={party} className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            <span className="text-xs">{party}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {detailsEvent.casualties && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Estimated Casualties:</span>
                      <span className="text-red-600">{detailsEvent.casualties.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {detailsEvent.economicImpact && (
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Economic Impact:</span>
                      <span className="text-blue-600">{detailsEvent.economicImpact}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Event Description</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {detailsEvent.description}
                </p>
              </div>
              
              {/* Detailed Analysis Based on Conflict */}
              <div>
                <h3 className="font-semibold mb-3">Detailed Analysis</h3>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-3">
                  {detailsEvent.conflictName === "Ukraine-Russia Conflict" && (
                    <div className="space-y-2">
                      <p><strong>Background:</strong> The conflict began on February 24, 2022, when Russia launched a full-scale invasion of Ukraine, escalating tensions that had been building since 2014.</p>
                      <p><strong>Key Developments:</strong> Major battles in Kyiv, Kharkiv, Mariupol, and ongoing fighting in eastern regions. International sanctions imposed on Russia.</p>
                      <p><strong>Global Impact:</strong> Significant disruption to global food and energy supplies, refugee crisis with over 6 million displaced persons.</p>
                    </div>
                  )}
                  
                  {detailsEvent.conflictName === "Israel-Palestine Conflict" && (
                    <div className="space-y-2">
                      <p><strong>Background:</strong> Long-standing territorial and political conflict with roots dating back to the mid-20th century.</p>
                      <p><strong>Recent Escalation:</strong> October 7, 2023 Hamas attack led to unprecedented escalation with ongoing military operations in Gaza.</p>
                      <p><strong>Regional Impact:</strong> Heightened tensions across the Middle East, affecting regional stability and oil markets.</p>
                    </div>
                  )}
                  
                  {detailsEvent.conflictName === "Iran-Israel Tensions" && (
                    <div className="space-y-2">
                      <p><strong>Background:</strong> Proxy conflicts and direct confrontations between Iran and Israel over regional influence and nuclear programs.</p>
                      <p><strong>Strategic Implications:</strong> Potential for wider Middle East conflict involving regional powers and international allies.</p>
                      <p><strong>Market Effects:</strong> Oil price volatility, defense spending increases across the region.</p>
                    </div>
                  )}
                  
                  {(detailsEvent.conflictName === "Myanmar Civil War" || 
                    detailsEvent.conflictName === "Sudan Civil War" || 
                    detailsEvent.conflictName === "South China Sea Tensions") && (
                    <div className="space-y-2">
                      <p><strong>Regional Significance:</strong> This conflict represents broader patterns of regional instability and international power competition.</p>
                      <p><strong>Humanitarian Impact:</strong> Significant civilian displacement and humanitarian needs requiring international attention.</p>
                      <p><strong>Strategic Considerations:</strong> Implications for regional security architecture and international trade routes.</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* External Resources */}
              <div>
                <h3 className="font-semibold mb-3">Additional Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      const searchQuery = encodeURIComponent(`${detailsEvent.conflictName} current news`);
                      window.open(`https://news.google.com/search?q=${searchQuery}`, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Latest News
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      window.open('/analysis', '_self');
                    }}
                  >
                    <TrendingUpIcon className="h-4 w-4 mr-2" />
                    Market Analysis
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      window.open('/conflicts', '_self');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Conflict Overview
                  </Button>
                </div>
              </div>
              
              {/* Timeline Context */}
              <div>
                <h3 className="font-semibold mb-3">Timeline Context</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This event occurred on <strong>{formatDate(detailsEvent.date)}</strong> as part of the ongoing {detailsEvent.conflictName}. 
                    The event had {detailsEvent.severity.toLowerCase()} severity impact and resulted in significant {detailsEvent.type === 'escalation' ? 'escalation' : 'developments'} 
                    in the conflict dynamics.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}