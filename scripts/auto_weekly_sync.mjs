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
    .replace(/\\u[\dA-Fa-f]{4}/g, '')
    .trim();
}

// ── Multi-Source Fetcher (Direct RSS XML, Reddit JSON, & Proxy Relays) ──
async function fetchWeeklyPost() {
  const sources = [
    {
      type: 'rss',
      url: 'https://www.reddit.com/r/gtaonline/search.rss?q=flair_name%3A%22:WU1::WU2::WU3::WU4::WU5::WU6:%22&sort=new&restrict_sr=1'
    },
    {
      type: 'rss',
      url: 'https://www.reddit.com/r/gtaonline/hot.rss?limit=10'
    },
    {
      type: 'json',
      url: 'https://www.reddit.com/r/gtaonline/search.json?q=flair_name%3A%22:WU1::WU2::WU3::WU4::WU5::WU6:%22&sort=new&restrict_sr=1&limit=3'
    }
  ];

  for (const src of sources) {
    try {
      console.log(`[Sync] Attempting fetch from: ${src.url}`);
      const res = await fetch(src.url, {
        signal: AbortSignal.timeout(6000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': src.type === 'json' ? 'application/json' : 'application/xml, text/xml, */*'
        }
      });

      if (!res.ok) {
        console.warn(`[Sync] HTTP ${res.status} from ${src.url}`);
        continue;
      }


      if (src.type === 'json') {
        const json = await res.json();
        const posts = json?.data?.children;
        if (posts && posts.length > 0) {
          console.log(`[Sync] Successfully retrieved JSON post: "${posts[0].data.title}"`);
          return { title: posts[0].data.title, selftext: posts[0].data.selftext };
        }
      } else if (src.type === 'rss') {
        const text = await res.text();
        const entryMatch = text.match(/<entry>[\s\S]*?<\/entry>/);
        if (entryMatch) {
          const entryXml = entryMatch[0];
          const titleMatch = entryXml.match(/<title[^>]*>([\s\S]*?)<\/title>/);
          const contentMatch = entryXml.match(/<content[^>]*>([\s\S]*?)<\/content>/);
          if (titleMatch) {
            const rawTitle = titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            const rawContent = contentMatch ? contentMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/<[^>]+>/g, '\n') : '';
            console.log(`[Sync] Successfully retrieved RSS post: "${rawTitle}"`);
            return { title: rawTitle, selftext: rawContent };
          }
        }
      }
    } catch (err) {
      console.warn(`[Sync] Error for ${src.url}:`, err.message);
    }
  }

  return null;
}

// ── Post Parser Engine ──
function parseWeeklyPost(postTitle, selftext) {
  const data = {
    title: postTitle,
    eventTitle: "GTA Online Weekly Event",
    eventDesc: "Boosted payouts, discounts, and rewards for this week.",
    dateRange: "Active Week",
    podiumVehicle: "TBD",
    prizeRide: { vehicle: "TBD", condition: "Place Top in LS Car Meet Series" },
    weeklyChallenge: { task: "Complete Weekly Challenge", reward: "$100,000 + Special Bonus" },
    timeTrials: { regular: "Active", hsw: "Active", premiumRace: "Active" },
    testRides: [],
    salvageRobberies: [
      { name: "The Podium Robbery", vehicle: "Target Vehicle", value: "~$380,000" },
      { name: "The Duggan Robbery", vehicle: "Target Vehicle", value: "~$340,000" },
      { name: "The Gangbanger Robbery", vehicle: "Target Vehicle", value: "~$320,000" }
    ],
    fibPriorityFile: "The Black Box File",
    kortzTargets: ["Gone to Seed", "Chat on Fruit", "Juiced"],
    luxuryAutos: [],
    pdmShowroom: [],
    dailyObjectives: [
      { day: "Thursday", task: "Participate in a Freemode Event" },
      { day: "Friday", task: "Complete a VIP Work" },
      { day: "Saturday", task: "Participate in a Race" },
      { day: "Sunday", task: "Spin the Lucky Wheel" },
      { day: "Monday", task: "Win a Race" },
      { day: "Tuesday", task: "Complete a Delivery" },
      { day: "Wednesday", task: "Visit the LS Car Meet" }
    ],
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

  const challengeMatch = selftext.match(/Weekly Challenge[^:]*:\s*([^\n\r]+)/i);
  if (challengeMatch) data.weeklyChallenge.task = cleanMarkdown(challengeMatch[1]);

  const timeTrialMatch = selftext.match(/Time Trial[^:]*:\s*([^\n\r]+)/i);
  if (timeTrialMatch) data.timeTrials.regular = cleanMarkdown(timeTrialMatch[1]);

  const hswMatch = selftext.match(/HSW Time Trial[^:]*:\s*([^\n\r]+)/i);
  if (hswMatch) data.timeTrials.hsw = cleanMarkdown(hswMatch[1]);

  const premRaceMatch = selftext.match(/Premium Race[^:]*:\s*([^\n\r]+)/i);
  if (premRaceMatch) data.timeTrials.premiumRace = cleanMarkdown(premRaceMatch[1]);

  const salvageMatch1 = selftext.match(/The Podium Robbery:\s*([^\n\r]+)/i);
  const salvageMatch2 = selftext.match(/The Duggan Robbery:\s*([^\n\r]+)/i);
  const salvageMatch3 = selftext.match(/(?:The Gangbanger Robbery|he Gangbanger Robbery|The Cargo Ship Robbery):\s*([^\n\r]+)/i);

  if (salvageMatch1) data.salvageRobberies[0].vehicle = cleanMarkdown(salvageMatch1[1]);
  if (salvageMatch2) data.salvageRobberies[1].vehicle = cleanMarkdown(salvageMatch2[1]);
  if (salvageMatch3) data.salvageRobberies[2].vehicle = cleanMarkdown(salvageMatch3[1]);

  // Extract Bonuses
  const bonusesIdx = selftext.search(/#+\s*Bonuses/i);
  if (bonusesIdx !== -1) {
    const afterBonuses = selftext.substring(bonusesIdx);
    const nextSectionMatch = afterBonuses.substring(1).search(/\n#+\s+[A-Za-z]/);
    const bonusesText = nextSectionMatch !== -1 ? afterBonuses.substring(0, nextSectionMatch + 1) : afterBonuses;
    
    const multiplierRegex = /(?:^|\n)\s*(\d+(?:\.\d+)?X[^\n\r]*|Double\s+[^\n\r]+|Triple\s+[^\n\r]+|Boosted\s+[^\n\r]+)/gi;
    let match;
    const sections = [];
    let lastIdx = 0, lastHeader = "";
    
    while ((match = multiplierRegex.exec(bonusesText)) !== null) {
      if (lastHeader) {
        sections.push({ header: lastHeader, content: bonusesText.substring(lastIdx, match.index) });
      }
      lastHeader = match[1].trim().replace(/^#+\s*/, '').replace(/[*_]/g, '');
      lastIdx = multiplierRegex.lastIndex;
    }
    if (lastHeader) {
      sections.push({ header: lastHeader, content: bonusesText.substring(lastIdx) });
    }
    
    if (sections.length > 0) {
      data.bonuses = sections.map(sec => {
        const rawLines = sec.content.split('\n');
        const items = rawLines
          .map(l => l.replace(/^[\s*•\-]+/, '').trim())
          .filter(l => l.length > 0 && !l.startsWith('#') && !l.toLowerCase().includes('reddit') && !l.toLowerCase().includes('bonuses'));
        
        const multMatch = sec.header.match(/(\d+(?:\.\d+)?X)/i);
        const mult = multMatch ? multMatch[1].toUpperCase() : "BONUS";
        return {
          multiplier: mult,
          label: sec.header,
          tier: mult.toLowerCase().replace('.', '_'),
          items: items.length > 0 ? items : [sec.header]
        };
      }).filter(b => b.items && b.items.length > 0);
    }
  }

  // Extract Discounts
  const discountsIdx = selftext.search(/#+\s*Discounts/i);
  if (discountsIdx !== -1) {
    const afterDiscounts = selftext.substring(discountsIdx);
    const nextSectionMatch = afterDiscounts.substring(1).search(/\n#+\s+[A-Za-z]/);
    const discountsText = nextSectionMatch !== -1 ? afterDiscounts.substring(0, nextSectionMatch + 1) : afterDiscounts;
    
    const rateRegex = /(?:^|\n)\s*(Free|\d+%\s*Off[^\n\r]*)/gi;
    let m, lastI = 0, lastRate = "";
    const discountSections = [];
    
    while ((m = rateRegex.exec(discountsText)) !== null) {
      if (lastRate) {
        discountSections.push({ rate: lastRate, content: discountsText.substring(lastI, m.index) });
      }
      lastRate = m[1].trim().replace(/^#+\s*/, '').replace(/[*_]/g, '');
      lastI = rateRegex.lastIndex;
    }
    if (lastRate) {
      discountSections.push({ rate: lastRate, content: discountsText.substring(lastI) });
    }

    if (discountSections.length > 0) {
      const parsedDiscounts = [];
      discountSections.forEach(sec => {
        const lines = sec.content.split('\n');
        const rateNorm = sec.rate.toLowerCase();
        let badgeClass = 'rate-40';
        if (rateNorm.includes('free')) badgeClass = 'rate-free';
        else if (rateNorm.includes('50%')) badgeClass = 'rate-50';
        else if (rateNorm.includes('40%')) badgeClass = 'rate-40';
        else if (rateNorm.includes('30%')) badgeClass = 'rate-30';

        lines.forEach(l => {
          const item = l.replace(/^[\s*•\-]+/, '').trim();
          if (!item || item.startsWith('#') || item.toLowerCase().includes('discounts') || item.toLowerCase().includes('gun van')) return;
          
          let cat = 'vehicles';
          const itemLower = item.toLowerCase();
          if (itemLower.includes('hangar') || itemLower.includes('facility') || itemLower.includes('bunker') || itemLower.includes('auto shop') || itemLower.includes('bail') || itemLower.includes('property') || itemLower.includes('garage')) {
            cat = 'properties';
          } else if (itemLower.includes('rifle') || itemLower.includes('gun') || itemLower.includes('launcher') || itemLower.includes('shotgun') || itemLower.includes('pistol') || itemLower.includes('smg') || itemLower.includes('weapon')) {
            cat = 'weapons';
          } else if (itemLower.includes('suit') || itemLower.includes('outfit') || itemLower.includes('clothing') || itemLower.includes('hat') || itemLower.includes('mask') || itemLower.includes('apparel')) {
            cat = 'apparel';
          }

          parsedDiscounts.push({
            name: cleanMarkdown(item),
            category: cat,
            rate: sec.rate,
            badgeClass: badgeClass
          });
        });
      });
      if (parsedDiscounts.length > 0) data.discounts = parsedDiscounts;
    }
  }

  return data;
}

// ── Update Codebase Files with New Week Data ──
function applyUpdateToCodebase(data) {
  const appJsPath = path.join(rootDir, 'app.js');
  const weeklyAppJsPath = path.join(rootDir, 'LosSantosWeekly', 'app.js');

  const files = [appJsPath, weeklyAppJsPath];
  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if dateRange is already up to date
    if (content.includes(`dateRange: "${data.dateRange}"`)) {
      console.log(`[Sync] ${path.basename(filePath)} is already up to date for "${data.dateRange}".`);
      continue;
    }

    console.log(`[Sync] Updating ${path.basename(filePath)} to "${data.dateRange}"...`);
    const startMarker = 'const DEFAULT_WEEK_DATA = {';
    const startIdx = content.indexOf(startMarker);
    if (startIdx !== -1) {
      let braceCount = 1;
      let endIdx = startIdx + startMarker.length;
      while (endIdx < content.length && braceCount > 0) {
        if (content[endIdx] === '{') braceCount++;
        else if (content[endIdx] === '}') braceCount--;
        endIdx++;
      }
      if (braceCount === 0) {
        const replacement = `const DEFAULT_WEEK_DATA = ${JSON.stringify({ ...data, version: 'v3.8.2' }, null, 2)}`;
        content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Updated ${path.basename(filePath)}`);
      }
    }
  }
}

// ── Main Execution Entry ──
async function run() {
  console.log('🌴 [Automated Sync] Checking for live GTA Online Weekly Update...');
  const post = await fetchWeeklyPost();
  if (!post || !post.title) {
    console.log('[Sync] No new update post found. Codebase remains current.');
    return;
  }

  const parsed = parseWeeklyPost(post.title, post.selftext);
  console.log(`[Sync] Detected Date Range: "${parsed.dateRange}"`);
  console.log(`[Sync] Podium Vehicle: "${parsed.podiumVehicle}"`);
  console.log(`[Sync] Prize Ride: "${parsed.prizeRide?.vehicle}"`);

  applyUpdateToCodebase(parsed);
  console.log('✓ [Automated Sync] Complete.');
}

run();

