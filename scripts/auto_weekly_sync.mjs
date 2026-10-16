import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper: Clean markdown & residual entities
function cleanMarkdown(str) {
  if (!str) return '';
  return str
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/\\u[\dA-Fa-f]{4}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper: Convert Reddit RSS HTML content into clean line-by-line text without breaking inline tags
function htmlToCleanLines(rawHtml) {
  if (!rawHtml) return '';
  // 1. Decode HTML entities first (since RSS <content> escapes HTML as &lt;p&gt;...)
  let decoded = rawHtml
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#32;/g, ' ')
    .replace(/&nbsp;/g, ' ');

  // 2. Strip inline formatting tags WITHOUT adding newlines (keeps "<strong>Podium Vehicle</strong>: Foo" on ONE line!)
  decoded = decoded.replace(/<\/?(?:strong|b|em|i|a|span|code|del|sup|sub|small|u)[^>]*>/gi, '');

  // 3. Convert block-level tags to newlines
  decoded = decoded.replace(/<\/?(?:p|li|ul|ol|div|br|h[1-6]|tr|table|blockquote|hr)[^>]*>/gi, '\n');

  // 4. Strip any remaining tags
  decoded = decoded.replace(/<[^>]+>/g, '');

  // 5. Decode second-level HTML entities if any (e.g. &amp;amp; -> &amp; -> &)
  decoded = decoded
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // 6. Collapse multiple spaces on the same line, fix "Key\n: Value" if any, and trim lines
  decoded = decoded.replace(/\n\s*:\s*/g, ': ');
  return decoded
    .split(/\r?\n/)
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(l => l.length > 0)
    .join('\n');
}

// Helper: Parse a week start timestamp from a dateRange or title string (e.g., "Oct 15 – 22, 2026" or "October 15th to October 22nd")
function getWeekStartTimestamp(str) {
  if (!str) return 0;
  const months = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  const m = String(str).match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})/i);
  if (!m) return 0;
  const monIdx = months[m[1].slice(0, 3).toLowerCase()];
  const day = parseInt(m[2], 10);
  const yearMatch = String(str).match(/\b(202\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
  return Date.UTC(year, monIdx, day);
}

// Helper: Compute the UTC timestamp (midnight) of the most recent active GTA Thursday (or Wednesday pre-release)
function getExpectedActiveThursdayTimestamp() {
  const now = new Date();
  // GTA weekly thread goes up Wednesday ~20:00 UTC for Thursday reset
  const shifted = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const utcYear = shifted.getUTCFullYear();
  const utcMonth = shifted.getUTCMonth();
  const utcDate = shifted.getUTCDate();
  const utcDay = shifted.getUTCDay(); // 0=Sun, 4=Thu
  const daysSinceThu = (utcDay - 4 + 7) % 7;
  return Date.UTC(utcYear, utcMonth, utcDate - daysSinceThu);
}

// Format "October 15th to October 22nd" -> "Oct 15 – 22, 2026"
function formatCleanDateRange(rawRange) {
  if (!rawRange) return 'Active Week';
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const months = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  const m = rawRange.match(/([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|–|-)\s*(?:([A-Za-z]+)\s+)?(\d{1,2})(?:st|nd|rd|th)?/i);
  const year = new Date().getFullYear();
  if (m) {
    const m1 = shortMonths[months[m[1].slice(0, 3).toLowerCase()] ?? 0];
    const d1 = m[2];
    const m2Raw = m[3] ? shortMonths[months[m[3].slice(0, 3).toLowerCase()] ?? 0] : m1;
    const d2 = m[4];
    if (m1 === m2Raw) {
      return `${m1} ${d1} – ${d2}, ${year}`;
    }
    return `${m1} ${d1} – ${m2Raw} ${d2}, ${year}`;
  }
  return rawRange.replace(/(\d+)(?:st|nd|rd|th)/gi, '$1').replace(/\s+to\s+/i, ' – ');
}

// ── Multi-Source Fetcher (Direct Reddit RSS XML for PapaXan + Validated Cloud Fallback) ──
async function fetchWeeklyPost() {
  const expectedThuTs = getExpectedActiveThursdayTimestamp();
  console.log(`[Sync] Expected active Thursday week start: ${new Date(expectedThuTs).toISOString().slice(0, 10)}`);

  // 1. Primary Authoritative Sources: Direct Reddit Atom RSS feeds for "Weekly Bonuses and Discounts" & /u/PapaXan
  const rssSources = [
    'https://www.reddit.com/r/gtaonline/search.rss?q=Weekly+Bonuses+and+Discounts&sort=new&restrict_sr=1',
    'https://www.reddit.com/user/PapaXan/submitted.rss',
    'https://www.reddit.com/r/gtaonline/search.rss?q=flair_name%3A%22:WU1::WU2::WU3::WU4::WU5::WU6:%22&sort=new&restrict_sr=1',
    'https://www.reddit.com/r/gtaonline/hot.rss?limit=15'
  ];

  for (const url of rssSources) {
    try {
      console.log(`[Sync] Querying RSS feed: ${url}`);
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'application/atom+xml, application/xml, text/xml, */*'
        }
      });

      if (!res.ok) {
        console.warn(`[Sync] HTTP ${res.status} from ${url}`);
        continue;
      }

      const xml = await res.text();
      const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)];
      for (const match of entries) {
        const entryXml = match[1];
        const titleMatch = entryXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const contentMatch = entryXml.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
        if (!titleMatch || !contentMatch) continue;

        const rawTitle = cleanMarkdown(titleMatch[1]);
        // Must be the text megathread ("Weekly Bonuses and Discounts"), NOT a video post
        if (!/Weekly Bonuses and Discounts/i.test(rawTitle)) continue;

        const cleanBody = htmlToCleanLines(contentMatch[1]);
        if (cleanBody.includes('Podium Vehicle')) {
          console.log(`[Sync] ✓ Matched official megathread: "${rawTitle}"`);
          return { title: rawTitle, selftext: cleanBody };
        }
      }
    } catch (err) {
      console.warn(`[Sync] RSS fetch error (${url}):`, err.message);
    }
  }

  // 2. Fallback: Check Firebase Cloud RTDB only if its week start timestamp is >= expectedThuTs
  try {
    const cloudUrl = 'https://livecounters-8eaa8-default-rtdb.firebaseio.com/labData/gtaWeekly.json';
    const cRes = await fetch(cloudUrl, { signal: AbortSignal.timeout(6000) });
    if (cRes.ok) {
      const cData = await cRes.json();
      const cloudWeekStr = cData?.dateRange || cData?.week_title || '';
      const cloudTs = getWeekStartTimestamp(cloudWeekStr);
      if (cData && (cData.podiumVehicle || cData.podium_vehicle) && cloudTs >= expectedThuTs) {
        console.log(`[Sync] Using verified current-week cloud payload: "${cloudWeekStr}"`);
        return { isStructured: true, structuredData: cData };
      } else {
        console.log(`[Sync] Cloud RTDB has older week ("${cloudWeekStr}"), skipping stale short-circuit.`);
      }
    }
  } catch (cErr) {
    console.warn('[Sync] Cloud fallback notice:', cErr.message);
  }

  return null;
}

// ── Comprehensive Megathread Parser Engine ──
function parseWeeklyPost(postTitle, selftext) {
  const cleanTitle = postTitle.replace(/\s*\(Not live until[^)]*\)/i, '').trim();
  const data = {
    title: cleanTitle,
    eventTitle: "GTA Online Weekly Update",
    eventDesc: "Boosted payouts, discounts, and rewards for this week.",
    dateRange: formatCleanDateRange(cleanTitle),
    podiumVehicle: "TBD",
    prizeRide: { vehicle: "TBD", condition: "Place Top in LS Car Meet Series" },
    weeklyChallenge: { task: "Complete Weekly Challenge", reward: "GTA$100,000 + Bonus" },
    timeTrials: { regular: "Active", hsw: "Active", premiumRace: "Active" },
    hswTestRide: "Active",
    testRides: [],
    salvageRobberies: [],
    fibPriorityFile: "Active File",
    kortzTargets: [],
    luxuryAutos: [],
    pdmShowroom: [],
    dailyObjectives: [],
    bonuses: [],
    discounts: [],
    gunVan: []
  };

  if (!selftext) return data;
  const lines = selftext.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract intro description (first 1-2 narrative lines before "Weekly Challenges")
  const introLines = [];
  for (const line of lines.slice(0, 6)) {
    if (/^(?:Completing|Weekly Challenges|October \d|Podium Vehicle)/i.test(line)) break;
    if (line.length > 25) introLines.push(line);
  }
  if (introLines.length > 0) {
    data.eventDesc = introLines.slice(0, 2).join(' ');
  }

  // Single-line key: value extractors
  const extractField = (regex) => {
    const m = selftext.match(regex);
    return m ? cleanMarkdown(m[1]) : null;
  };

  const podium = extractField(/Podium Vehicle\s*:\s*([^\n\r]+)/i);
  if (podium) data.podiumVehicle = podium;

  const prizeRide = extractField(/Prize Ride Vehicle\s*:\s*([^\n\r]+)/i);
  if (prizeRide) data.prizeRide.vehicle = prizeRide;

  const prizeCond = extractField(/Prize Ride Challenge\s*:\s*([^\n\r]+)/i);
  if (prizeCond) data.prizeRide.condition = prizeCond;

  const timeTrial = extractField(/(?:^|\n)Time Trial\s*:\s*([^\n\r]+)/i);
  if (timeTrial) data.timeTrials.regular = timeTrial;

  const hswTrial = extractField(/HSW Time Trial\s*:\s*([^\n\r]+)/i);
  if (hswTrial) data.timeTrials.hsw = hswTrial;

  const premRace = extractField(/Premium Race\s*:\s*([^\n\r]+)/i);
  if (premRace) data.timeTrials.premiumRace = premRace;

  const hswRide = extractField(/Premium Test Ride\s*:\s*([^\n\r]+)/i);
  if (hswRide) data.hswTestRide = hswRide;

  // Test Rides 1, 2, 3
  const tr1 = extractField(/Test Ride 1\s*:\s*([^\n\r]+)/i);
  const tr2 = extractField(/Test Ride 2\s*:\s*([^\n\r]+)/i);
  const tr3 = extractField(/Test Ride 3\s*:\s*([^\n\r]+)/i);
  data.testRides = [tr1, tr2, tr3].filter(Boolean);

  // Salvage Yard Robberies (supports all 5 Rockstar robbery types)
  const robberyTypes = [
    'The Podium Robbery',
    'The Cargo Ship Robbery',
    'The Gangbanger Robbery',
    'The Duggan Robbery',
    'The McTony Robbery'
  ];
  for (const rName of robberyTypes) {
    const pat = new RegExp(`${rName.replace(/^The\s+/i, '(?:The\\s+|he\\s+)?')}\\s*:\\s*([^\\n\\r]+)`, 'i');
    const m = selftext.match(pat);
    if (m) {
      const veh = cleanMarkdown(m[1]);
      data.salvageRobberies.push({
        name: rName,
        vehicle: veh,
        value: '~$350,000 – $400,000',
        robbery: rName,
        car: veh,
        claimable: veh.toLowerCase().includes('claimable')
      });
    }
  }

  // Helper: Extract lines between two section headers
  function getSectionLines(startRegex, endRegexList) {
    const startIdx = lines.findIndex(l => startRegex.test(l));
    if (startIdx === -1) return [];
    const result = [];
    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (endRegexList.some(rx => rx.test(line))) break;
      result.push(line);
    }
    return result;
  }

  // This Week's Challenge
  const challengeLines = getSectionLines(/^This Week['’]?s Challenge$/i, [/^This Week['’]?s/i, /^FIB Priority/i, /^Luxury Autos/i]);
  if (challengeLines.length > 0) {
    const chLine = challengeLines[0];
    const chSplit = chLine.match(/^(.+?)\s+to\s+(?:receive|get|earn)\s+(?:the\s+)?(.+)$/i);
    if (chSplit) {
      data.weeklyChallenge = {
        task: cleanMarkdown(chSplit[1]),
        reward: cleanMarkdown(chSplit[2])
      };
    } else {
      data.weeklyChallenge = {
        task: cleanMarkdown(chLine),
        reward: "GTA$100,000 + Weekly Bonus"
      };
    }
  }

  // FIB Priority File
  const fibLines = getSectionLines(/FIB Priority File/i, [/^Luxury Autos/i, /^Premium Deluxe/i, /^Daily Objectives/i]);
  if (fibLines.length > 0) {
    data.fibPriorityFile = cleanMarkdown(fibLines[0]);
  }

  // Kortz Center Heist Primary Targets
  const kortzLines = getSectionLines(/Kortz Center Heist Primary Targets/i, [/Salvage Yard/i, /^This Week/i]);
  if (kortzLines.length > 0) {
    data.kortzTargets = kortzLines.slice(0, 3).map(cleanMarkdown);
  }

  // Luxury Autos
  const luxuryLines = getSectionLines(/^Luxury Autos$/i, [/^Premium Deluxe Motorsports/i, /^Daily Objectives/i, /^Bonuses/i]);
  if (luxuryLines.length > 0) {
    data.luxuryAutos = luxuryLines.map(cleanMarkdown);
  }

  // Premium Deluxe Motorsports (Simeon's PDM)
  const pdmLines = getSectionLines(/^Premium Deluxe Motorsports$/i, [/^Daily Objectives/i, /^Bonuses/i, /^Discounts/i]);
  if (pdmLines.length > 0) {
    data.pdmShowroom = pdmLines.map(cleanMarkdown);
  }

  // Daily Objectives
  const days = ['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'];
  for (const day of days) {
    const rx = new RegExp(`^${day}\\s*:\\s*(.+)$`, 'i');
    const found = lines.find(l => rx.test(l));
    if (found) {
      const m = found.match(rx);
      data.dailyObjectives.push({ day, task: cleanMarkdown(m[1]) });
    }
  }

  // Bonuses Section
  const bonusLines = getSectionLines(/^Bonuses$/i, [/^Discounts$/i, /^Gun Van Inventory$/i, /^New Content/i]);
  if (bonusLines.length > 0) {
    const specialRewards = [];
    const multiplierGroups = [];
    let currentGroup = null;

    for (const line of bonusLines) {
      const multHeader = line.match(/^(\d+(?:\.\d+)?X)\s+(.+)$/i);
      if (multHeader) {
        if (currentGroup && currentGroup.items.length > 0) {
          multiplierGroups.push(currentGroup);
        }
        const mult = multHeader[1].toUpperCase();
        currentGroup = {
          multiplier: mult,
          label: `${mult} ${multHeader[2].replace(/\band\b/i, '&')}`,
          tier: mult.toLowerCase().replace('.', '_'),
          items: []
        };
      } else if (currentGroup) {
        currentGroup.items.push(cleanMarkdown(line));
      } else {
        specialRewards.push(cleanMarkdown(line));
      }
    }
    if (currentGroup && currentGroup.items.length > 0) {
      multiplierGroups.push(currentGroup);
    }
    if (specialRewards.length > 0) {
      multiplierGroups.push({
        multiplier: 'BONUS',
        label: 'SPECIAL EVENT BONUSES & REWARDS',
        tier: '2x',
        items: specialRewards
      });
    }
    data.bonuses = multiplierGroups;
  }

  // Build dynamic eventTitle from top bonuses
  if (data.bonuses.length > 0 && data.bonuses[0].items.length > 0) {
    const topMult = data.bonuses[0].multiplier;
    const topItem = data.bonuses[0].items[0].split(':')[0].trim();
    const secondItem = (data.bonuses[0].items[1] || data.bonuses[1]?.items?.[0] || '').split(':')[0].trim();
    data.eventTitle = secondItem
      ? `${topMult} ${topItem}, ${secondItem} & Weekly Bonuses`
      : `${topMult} ${topItem} & Weekly Bonuses`;
  }

  // Discounts Section
  const discountLines = getSectionLines(/^Discounts$/i, [/^Gun Van Inventory$/i, /^New Content/i, /^Returning Content/i, /^GTA\+/i]);
  if (discountLines.length > 0) {
    let currentRate = '30% Off';
    for (const line of discountLines) {
      const rateMatch = line.match(/^(Free|\d+%\s*Off)$/i);
      if (rateMatch) {
        currentRate = rateMatch[1];
        continue;
      }
      const item = cleanMarkdown(line);
      if (!item) continue;

      const rateNorm = currentRate.toLowerCase();
      let badgeClass = 'rate-30';
      if (rateNorm.includes('free')) badgeClass = 'rate-free';
      else if (rateNorm.includes('50')) badgeClass = 'rate-50';
      else if (rateNorm.includes('40')) badgeClass = 'rate-40';

      let cat = 'vehicles';
      const itemLower = item.toLowerCase();
      if (/agency|hangar|facility|bunker|auto shop|bail|property|properties|garage|nightclub|arcade|mc|office|upgrades|modifications|renovations/.test(itemLower)) {
        cat = 'properties';
      } else if (/rifle|gun|launcher|shotgun|pistol|smg|weapon|shocker|carbine|bat|knife/.test(itemLower)) {
        cat = 'weapons';
      } else if (/shirt|outfit|clothing|hat|mask|apparel|onesie/.test(itemLower)) {
        cat = 'apparel';
      }

      data.discounts.push({
        name: item,
        item: item,
        category: cat,
        rate: currentRate.toUpperCase(),
        discount: currentRate.toUpperCase(),
        badgeClass
      });
    }
  }

  // Gun Van Inventory
  const gunVanLines = getSectionLines(/^Gun Van Inventory$/i, [/^New Content/i, /^Returning Content/i, /^GTA\+/i, /^Subreddit Resources/i]);
  if (gunVanLines.length > 0) {
    data.gunVan = gunVanLines.map(cleanMarkdown);
    // Add any Free Gun Van weapons to the top of discounts so they show under Free filter too
    for (const gvItem of data.gunVan) {
      if (/\bfree\b/i.test(gvItem)) {
        const weaponName = gvItem.split(/[–-]/)[0].trim();
        data.discounts.unshift({
          name: `${weaponName} (Gun Van)`,
          item: `${weaponName} (Gun Van)`,
          category: 'weapons',
          rate: '100% FREE',
          discount: '100% FREE',
          badgeClass: 'rate-free'
        });
      }
    }
  }

  return data;
}

// ── Update Codebase Files with New Week Data ──
function applyUpdateToCodebase(data) {
  const appJsPath = path.join(rootDir, 'app.js');
  const weeklyAppJsPath = path.join(rootDir, 'LosSantosWeekly', 'app.js');
  const indexHtmlPath = path.join(rootDir, 'index.html');

  const files = [appJsPath, weeklyAppJsPath, indexHtmlPath];
  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');

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
        const verMatch = content.match(/const APP_VERSION = ['"]([^'"]+)['"]/);
        const currentVersion = verMatch ? verMatch[1] : 'v3.8.9';
        const replacement = `const DEFAULT_WEEK_DATA = ${JSON.stringify({ ...data, version: currentVersion }, null, 2)}`;
        content = (content.substring(0, startIdx) + replacement + content.substring(endIdx)).replace(/\r\n/g, '\n');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Updated ${path.relative(rootDir, filePath)} (${data.dateRange})`);
      }
    }
  }
}

// ── Push Synchronized Data to Live Cloud RTDB Mirror ──
async function pushToCloudMirror(data) {
  try {
    // Build dual-compatible payload supporting both LosSantosWeekly web app & BDC Central Command
    const cloudPayload = {
      ...data,
      week_title: data.dateRange,
      event_name: data.eventTitle,
      special_claim: data.eventDesc,
      podium_vehicle: data.podiumVehicle,
      prize_ride: data.prizeRide?.vehicle || 'TBD',
      prize_ride_challenge: data.prizeRide?.condition || '',
      hsw_vehicle: data.hswTestRide || data.timeTrials?.hsw || 'Active',
      test_track: data.testRides || [],
      luxury_autos: data.luxuryAutos || [],
      simeons_pdm: data.pdmShowroom || [],
      salvage_yard_targets: data.salvageRobberies || [],
      fib_priority_file: data.fibPriorityFile || 'Active',
      weekly_challenge: data.weeklyChallenge || {},
      bonuses: data.matrixBonuses || data.bonuses || [],
      bonus_groups: data.bonuses || [],
      special_rewards: data.specialRewards || [],
      gun_van: {
        location: 'Daily Rotating Location',
        discount_item: (data.gunVan && data.gunVan[0]) || 'Featured Weapon',
        weapons: data.gunVan || []
      },
      last_updated: Math.floor(Date.now() / 1000),
      source: `r/gtaonline Official Verified Intel (${data.dateRange})`
    };

    const rtdbUrl = 'https://livecounters-8eaa8-default-rtdb.firebaseio.com/labData/gtaWeekly.json';
    const res = await fetch(rtdbUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cloudPayload),
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) {
      console.log(`✓ Pushed live weekly payload to Firebase RTDB (${data.dateRange})`);
    } else {
      console.warn(`[Sync] Firebase RTDB PUT returned HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn('[Sync] Cloud mirror push notice:', err.message);
  }
}

// ── Main Execution Entry ──
async function run() {
  console.log('🌴 [Automated Sync] Checking for live GTA Online Weekly Update...');
  const post = await fetchWeeklyPost();
  if (!post) {
    console.log('[Sync] No update post found. Codebase remains current.');
    return;
  }

  let parsed;
  if (post.isStructured && post.structuredData) {
    parsed = post.structuredData;
  } else if (post.title) {
    parsed = parseWeeklyPost(post.title, post.selftext);
  } else {
    console.log('[Sync] Invalid post format.');
    return;
  }

  console.log(`[Sync] Detected Date Range : "${parsed.dateRange}"`);
  console.log(`[Sync] Event Title         : "${parsed.eventTitle}"`);
  console.log(`[Sync] Podium Vehicle      : "${parsed.podiumVehicle}"`);
  console.log(`[Sync] Prize Ride          : "${parsed.prizeRide?.vehicle}" (${parsed.prizeRide?.condition})`);
  console.log(`[Sync] Weekly Challenge    : "${parsed.weeklyChallenge?.task}" -> "${parsed.weeklyChallenge?.reward}"`);
  console.log(`[Sync] Salvage Robberies   : ${parsed.salvageRobberies?.length || 0} targets`);
  console.log(`[Sync] Bonuses Tiers       : ${parsed.bonuses?.length || 0} groups`);
  console.log(`[Sync] Discounts Count     : ${parsed.discounts?.length || 0} items`);

  applyUpdateToCodebase(parsed);

  // Write static data files in both root and LosSantosWeekly
  const staticDirs = [
    path.join(rootDir, 'data'),
    path.join(rootDir, 'LosSantosWeekly', 'data')
  ];
  for (const dir of staticDirs) {
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const staticJsonPath = path.join(dir, 'weekly_current.json');
      fs.writeFileSync(staticJsonPath, JSON.stringify(parsed, null, 2), 'utf8');
      console.log(`✓ Generated static fallback: ${path.relative(rootDir, staticJsonPath)}`);
    } catch (err) {
      console.warn('[Sync] Could not write static data fallback:', err.message);
    }
  }

  await pushToCloudMirror(parsed);
  console.log('✓ [Automated Sync] Complete.');
}

run();
