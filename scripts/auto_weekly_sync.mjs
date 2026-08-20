import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper: Clean markdown
function cleanMarkdown(str) {
  if (!str) return '';
  return str
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .trim();
}

// ── Multi-Source Reddit Fetcher ──
async function fetchRedditPost() {
  const endpoints = [
    'https://www.reddit.com/r/gtaonline/search.json?q=flair_name%3A%22:WU1::WU2::WU3::WU4::WU5::WU6:%22&sort=new&restrict_sr=1&limit=3',
    'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.reddit.com/r/gtaonline/search.json?q=flair_name%3A%22:WU1::WU2::WU3::WU4::WU5::WU6:%22&sort=new&restrict_sr=1&limit=3')
  ];

  for (const url of endpoints) {
    try {
      console.log(`Trying fetch from: ${url}`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });
      if (!res.ok) continue;
      const json = await res.json();
      const posts = json?.data?.children;
      if (posts && posts.length > 0) {
        return posts[0].data;
      }
    } catch (err) {
      console.warn(`Fetch error for ${url}:`, err.message);
    }
  }
  return null;
}

// ── Post Parser Engine ──
function parseRedditPost(postTitle, selftext) {
  const data = {
    title: postTitle,
    eventTitle: "Weekly Event",
    eventDesc: "Boosted payouts, discounts, and rewards for this week.",
    dateRange: "Active Week",
    podiumVehicle: "TBD",
    prizeRide: { vehicle: "TBD", condition: "TBD" },
    weeklyChallenge: { task: "Complete Weekly Challenge", reward: "GTA$250,000 Bonus" },
    timeTrials: { regular: "TBD", hsw: "TBD", premiumRace: "TBD" },
    testRides: [],
    salvageRobberies: [
      { name: "The Podium Robbery", vehicle: "TBD", value: "~$380,000" },
      { name: "The Duggan Robbery", vehicle: "TBD", value: "~$340,000" },
      { name: "The Gangbanger Robbery", vehicle: "TBD", value: "~$320,000" }
    ],
    dailyObjectives: [],
    bonuses: [],
    discounts: [],
    gunVan: []
  };

  const dateMatch = postTitle.match(/([A-Za-z]+\s+\d+(?:st|nd|rd|th)?\s+to\s+[A-Za-z]+\s+\d+(?:st|nd|rd|th)?)/i);
  if (dateMatch) {
    data.dateRange = dateMatch[1].replace(/(\d+)(?:st|nd|rd|th)/g, '$1').replace(/\s+to\s+/i, ' – ');
  }

  if (!selftext) return data;

  const podiumMatch = selftext.match(/Podium Vehicle[^:]*:\s*([^\n\r]+)/i);
  if (podiumMatch) data.podiumVehicle = cleanMarkdown(podiumMatch[1]);

  const prizeRideMatch = selftext.match(/Prize Ride Vehicle[^:]*:\s*([^\n\r]+)/i);
  if (prizeRideMatch) data.prizeRide.vehicle = cleanMarkdown(prizeRideMatch[1]);

  const prizeCondMatch = selftext.match(/Prize Ride Challenge[^:]*:\s*([^\n\r]+)/i);
  if (prizeCondMatch) data.prizeRide.condition = cleanMarkdown(prizeCondMatch[1]);

  const timeTrialMatch = selftext.match(/Time Trial[^:]*:\s*([^\n\r]+)/i);
  if (timeTrialMatch) data.timeTrials.regular = cleanMarkdown(timeTrialMatch[1]);

  const hswMatch = selftext.match(/HSW Time Trial[^:]*:\s*([^\n\r]+)/i);
  if (hswMatch) data.timeTrials.hsw = cleanMarkdown(hswMatch[1]);

  const premRaceMatch = selftext.match(/Premium Race[^:]*:\s*([^\n\r]+)/i);
  if (premRaceMatch) data.timeTrials.premiumRace = cleanMarkdown(premRaceMatch[1]);

  const salvageMatch1 = selftext.match(/The Podium Robbery:\s*([^\n\r]+)/i);
  const salvageMatch2 = selftext.match(/The Duggan Robbery:\s*([^\n\r]+)/i);
  const salvageMatch3 = selftext.match(/(?:The Gangbanger Robbery|he Gangbanger Robbery):\s*([^\n\r]+)/i);

  if (salvageMatch1) data.salvageRobberies[0].vehicle = cleanMarkdown(salvageMatch1[1]);
  if (salvageMatch2) data.salvageRobberies[1].vehicle = cleanMarkdown(salvageMatch2[1]);
  if (salvageMatch3) data.salvageRobberies[2].vehicle = cleanMarkdown(salvageMatch3[1]);

  const days = ["Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
  days.forEach((day) => {
    const regex = new RegExp(`\\*\\*${day}:?\\*\\*\\s*([^\\n\\r]+)`, 'i');
    const match = selftext.match(regex);
    if (match) {
      data.dailyObjectives.push({ day, task: cleanMarkdown(match[1]) });
    }
  });

  return data;
}

// ── Main Execution ──
async function run() {
  console.log('🌴 [Set & Forget] Starting GTA Online Weekly Update Auto-Sync...');
  const post = await fetchRedditPost();
  if (!post) {
    console.log('No new Reddit post retrieved at this time.');
    return;
  }

  console.log(`Found post: "${post.title}"`);
  const parsed = parseRedditPost(post.title, post.selftext);
  console.log(`Parsed Date Range: ${parsed.dateRange}`);
  console.log(`Parsed Podium: ${parsed.podiumVehicle}`);
  console.log(`Parsed Prize Ride: ${parsed.prizeRide.vehicle}`);
  console.log('✓ Auto-sync completed check.');
}

run();
