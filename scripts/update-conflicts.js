import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { conflicts } from '../shared/schema.js';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const newConflicts = [
  {
    name: "Ukraine-Russia Conflict",
    region: "Eastern Europe",
    status: "Active",
    severity: "Critical",
    startDate: new Date('2022-02-24'),
    description: "Ongoing military conflict between Russia and Ukraine",
    duration: "2+ years",
    latitude: 50.4501,
    longitude: 30.5234,
    parties: ["Russia", "Ukraine"]
  },
  {
    name: "Israel-Gaza Conflict",
    region: "Middle East",
    status: "Active",
    severity: "High",
    startDate: new Date('2023-10-07'),
    description: "Military conflict between Israel and Hamas in Gaza",
    duration: "8+ months",
    latitude: 31.3547,
    longitude: 34.3088,
    parties: ["Israel", "Hamas", "Palestine"]
  },
  {
    name: "Sudan Civil War",
    region: "Africa",
    status: "Active",
    severity: "Critical",
    startDate: new Date('2023-04-15'),
    description: "Civil war between Sudanese Armed Forces and Rapid Support Forces",
    duration: "1+ year",
    latitude: 15.5007,
    longitude: 32.5599,
    parties: ["Sudanese Armed Forces", "Rapid Support Forces"]
  },
  {
    name: "Myanmar Civil War",
    region: "Southeast Asia",
    status: "Active",
    severity: "High",
    startDate: new Date('2021-02-01'),
    description: "Civil conflict following military coup in Myanmar",
    duration: "3+ years",
    latitude: 19.7633,
    longitude: 96.0785,
    parties: ["Myanmar Military", "Opposition Forces"]
  },
  {
    name: "South China Sea Tensions",
    region: "East Asia",
    status: "Active",
    severity: "Medium",
    startDate: new Date('2009-01-01'),
    description: "Territorial disputes in the South China Sea",
    duration: "15+ years",
    latitude: 12.0000,
    longitude: 113.0000,
    parties: ["China", "Philippines", "Vietnam", "Malaysia"]
  },
  {
    name: "Taiwan Strait Tensions",
    region: "East Asia",
    status: "Active",
    severity: "High",
    startDate: new Date('1949-01-01'),
    description: "Cross-strait tensions between China and Taiwan",
    duration: "75+ years",
    latitude: 23.8041,
    longitude: 120.9114,
    parties: ["China", "Taiwan"]
  },
  {
    name: "Democratic Republic of Congo M23 Crisis",
    region: "Central Africa",
    status: "Active",
    severity: "High",
    startDate: new Date('2021-11-01'),
    description: "Conflict involving M23 rebel group in eastern DRC",
    duration: "2+ years",
    latitude: -1.2921,
    longitude: 29.2975,
    parties: ["DRC Government", "M23", "Rwanda"]
  },
  {
    name: "Iran-Israel Shadow War",
    region: "Middle East",
    status: "Active",
    severity: "Medium",
    startDate: new Date('2018-01-01'),
    description: "Covert operations and proxy conflicts between Iran and Israel",
    duration: "6+ years",
    latitude: 32.4279,
    longitude: 53.6880,
    parties: ["Iran", "Israel", "Proxies"]
  },
  {
    name: "West Africa Sahel Crisis",
    region: "West Africa",
    status: "Active",
    severity: "High",
    startDate: new Date('2012-01-01'),
    description: "Security crisis across Sahel region with multiple insurgent groups",
    duration: "12+ years",
    latitude: 15.0000,
    longitude: 0.0000,
    parties: ["Mali", "Niger", "Burkina Faso", "Jihadist Groups"]
  },
  {
    name: "Georgia-Russia Border Tensions",
    region: "Caucasus",
    status: "Active",
    severity: "Medium",
    startDate: new Date('2008-08-01'),
    description: "Ongoing tensions over South Ossetia and Abkhazia",
    duration: "16+ years",
    latitude: 42.3154,
    longitude: 43.3569,
    parties: ["Georgia", "Russia", "South Ossetia", "Abkhazia"]
  },
  {
    name: "Mexico Drug War",
    region: "North America",
    status: "Active",
    severity: "High",
    startDate: new Date('2006-12-01'),
    description: "Ongoing conflict between Mexican government and drug cartels",
    duration: "18+ years",
    latitude: 23.6345,
    longitude: -102.5528,
    parties: ["Mexican Government", "Drug Cartels"]
  },
  {
    name: "Venezuela Border Crisis",
    region: "South America",
    status: "Active",
    severity: "Medium",
    startDate: new Date('2015-01-01'),
    description: "Border tensions and refugee crisis involving Venezuela",
    duration: "9+ years",
    latitude: 6.4238,
    longitude: -66.5897,
    parties: ["Venezuela", "Colombia", "Brazil", "Guyana"]
  },
  {
    name: "Haiti Gang Crisis",
    region: "Caribbean",
    status: "Active",
    severity: "High",
    startDate: new Date('2021-07-01'),
    description: "Gang violence and political instability in Haiti",
    duration: "3+ years",
    latitude: 18.9712,
    longitude: -72.2852,
    parties: ["Haitian Government", "Gang Coalitions"]
  }
];

async function updateConflicts() {
  try {
    console.log('Clearing existing conflicts...');
    await db.delete(conflicts);
    
    console.log('Inserting new conflicts...');
    for (const conflict of newConflicts) {
      await db.insert(conflicts).values(conflict);
      console.log(`Added: ${conflict.name}`);
    }
    
    console.log('Successfully updated all conflicts!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating conflicts:', error);
    process.exit(1);
  }
}

updateConflicts();