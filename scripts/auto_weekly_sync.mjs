import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper: Decode HTML entities (including WordPress numeric & curly entities) and strip CDATA
function decodeHtmlEntities(str) {
  if (!str) return '';
  return String(str)
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&rsquo;|&lsquo;|&#39;/gi, "'")
    .replace(/&rdquo;|&ldquo;|&quot;/gi, '"')
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/\u00a0/g, ' ');
}

// Helper: Clean markdown & residual entities
function cleanMarkdown(str) {
  if (!str) return '';
  return decodeHtmlEntities(str)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/\\u[\dA-Fa-f]{4}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper: Convert RSS HTML content into clean line-by-line text without breaking inline tags
function htmlToCleanLines(rawHtml) {
  if (!rawHtml) return '';
  let decoded = decodeHtmlEntities(rawHtml);

  // Strip inline formatting tags WITHOUT adding newlines (keeps "<strong>Podium Vehicle</strong>: Foo" on ONE line)
  decoded = decoded.replace(/<\/?(?:strong|b|em|i|a|span|code|del|sup|sub|small|u)[^>]*>/gi, '');

  // Convert block-level tags to newlines
  decoded = decoded.replace(/<\/?(?:p|li|ul|ol|div|br|h[1-6]|tr|table|blockquote|hr)[^>]*>/gi, '\n');

  // Strip any remaining tags
  decoded = decoded.replace(/<[^>]+>/g, '');

  // Second-level entity decode (in case of double-encoded entities)
  decoded = decodeHtmlEntities(decoded);

  // Collapse multiple spaces on the same line, fix "Key\n: Value" if any, and trim lines
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

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_INDEX = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function parseDateSpanFromText(rawRange) {
  if (!rawRange) return null;
  const cleaned = decodeHtmlEntities(rawRange);
  const m = cleaned.match(/([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|through|thru|–|—|-)\s*(?:([A-Za-z]+)\s+)?(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(202\d))?/i);
  if (!m) return null;
  const m1Idx = MONTH_INDEX[m[1].slice(0, 3).toLowerCase()];
  if (m1Idx === undefined) return null;
  const d1 = parseInt(m[2], 10);
  const m2Idx = m[3] ? (MONTH_INDEX[m[3].slice(0, 3).toLowerCase()] ?? m1Idx) : m1Idx;
  const d2 = parseInt(m[4], 10);
  const now = new Date();
  const baseYear = m[5] ? parseInt(m[5], 10) : now.getUTCFullYear();
  const endYear = m2Idx < m1Idx ? baseYear + 1 : baseYear;
  const startDate = new Date(Date.UTC(baseYear, m1Idx, d1));
  let endDate = new Date(Date.UTC(endYear, m2Idx, d2));

  // RockstarINTEL writes inclusive Wednesday end dates (e.g. Nov 12-18); normalize 6-day span to Thursday reset (+1 day)
  const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
  if (diffDays === 6) {
    endDate = new Date(endDate.getTime() + 86400000);
  }
  return { startDate, endDate };
}

// Format "October 15th to October 22nd" or "November 12th-18th" -> "Nov 12 – 19, 2026"
function formatCleanDateRange(rawRange) {
  if (!rawRange) return 'Active Week';
  const span = parseDateSpanFromText(rawRange);
  if (span) {
    const { startDate, endDate } = span;
    const m1 = SHORT_MONTHS[startDate.getUTCMonth()];
    const d1 = startDate.getUTCDate();
    const m2 = SHORT_MONTHS[endDate.getUTCMonth()];
    const d2 = endDate.getUTCDate();
    const y2 = endDate.getUTCFullYear();
    if (m1 === m2) return `${m1} ${d1} – ${d2}, ${y2}`;
    return `${m1} ${d1} – ${m2} ${d2}, ${y2}`;
  }
  return cleanMarkdown(rawRange).replace(/(\d+)(?:st|nd|rd|th)/gi, '$1').replace(/\s+(?:to|through)\s+/i, ' – ');
}

function formatFullTitleFromSpan(rawRange) {
  const span = parseDateSpanFromText(rawRange);
  if (!span) return null;
  const { startDate, endDate } = span;
  const m1 = FULL_MONTHS[startDate.getUTCMonth()];
  const d1 = getOrdinal(startDate.getUTCDate());
  const m2 = FULL_MONTHS[endDate.getUTCMonth()];
  const d2 = getOrdinal(endDate.getUTCDate());
  return `Weekly Bonuses and Discounts - ${m1} ${d1} to ${m2} ${d2}`;
}

// ── Multi-Source Fetcher (RockstarINTEL RSS Primary + Reddit Secondary + Cloud Fallback) ──
function extractMatchesFromRssXml(xml) {
  const results = [];
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)];
  for (const match of entries) {
    const entryXml = match[1];
    const titleMatch = entryXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const contentMatch = entryXml.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
    if (!titleMatch || !contentMatch) continue;
    results.push({
      rawTitle: cleanMarkdown(titleMatch[1]),
      rawHtml: contentMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '')
    });
  }
  const rssItems = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  for (const match of rssItems) {
    const itemXml = match[1];
    const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    // WordPress <item> puts short excerpt in <description> before <content:encoded> — ALWAYS prefer <content:encoded> first!
    const contentEncodedMatch = itemXml.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i);
    const contentMatch = contentEncodedMatch || itemXml.match(/<(?:content|description)[^>]*>([\s\S]*?)<\/(?:content|description)>/i);
    if (!titleMatch || !contentMatch) continue;
    results.push({
      rawTitle: cleanMarkdown(titleMatch[1]),
      rawHtml: contentMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '')
    });
  }
  return results;
}

function pickBestWeeklyCandidate(candidates, expectedThuTs, preferredSourceType = null) {
  let fallback = null;
  for (const item of candidates) {
    const rawTitle = cleanMarkdown(item.rawTitle || '');
    const rawHtml = item.rawHtml || '';
    const isRedditFormat = /Weekly Bonuses and Discounts/i.test(rawTitle);
    const isRockstarIntelFormat = /GTA Online.*(?:Event Week|Weekly Update)/i.test(rawTitle) || /Podium Vehicle[\s\S]*Discounts/i.test(rawHtml);

    if (!isRedditFormat && !isRockstarIntelFormat) continue;
    const cleanBody = htmlToCleanLines(rawHtml);
    if (!/Podium Vehicle/i.test(cleanBody) || !/(?:Bonuses|Discounts)/i.test(cleanBody)) continue;

    // Extract timestamp from title OR first intro paragraph ("November 12th through 18th")
    const introSlice = cleanBody.split('\n').slice(0, 6).join(' ');
    const postTs = getWeekStartTimestamp(rawTitle) || getWeekStartTimestamp(introSlice);
    const detectedSourceType = preferredSourceType || (isRedditFormat ? 'reddit' : 'rockstarintel');
    const candidate = {
      sourceType: detectedSourceType,
      title: rawTitle,
      rawHtml,
      selftext: cleanBody,
      ts: postTs
    };

    if (postTs >= expectedThuTs) {
      return candidate;
    }
    if (!fallback || postTs > fallback.ts) {
      fallback = candidate;
    }
  }
  return fallback;
}

async function fetchWeeklyPost() {
  const expectedThuTs = getExpectedActiveThursdayTimestamp();
  console.log(`[Sync] Expected active Thursday week start: ${new Date(expectedThuTs).toISOString().slice(0, 10)}`);

  // Tier 1: RockstarINTEL Official GTA Online RSS Feed (XML Direct + rss2json Backup)
  const rockstarIntelFeeds = [
    'https://rockstarintel.com/category/gta/gta-online/feed/',
    'https://rockstarintel.com/feed/'
  ];

  for (const riUrl of rockstarIntelFeeds) {
    try {
      console.log(`[Sync] Querying Tier 1A (RockstarINTEL XML): ${riUrl}`);
      const res = await fetch(riUrl, {
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        }
      });
      if (res.ok) {
        const xml = await res.text();
        const matched = pickBestWeeklyCandidate(extractMatchesFromRssXml(xml), expectedThuTs, 'rockstarintel');
        if (matched && matched.ts >= expectedThuTs) {
          console.log(`[Sync] ✓ Matched RockstarINTEL Weekly Update: "${matched.title}"`);
          return matched;
        }
      } else {
        console.warn(`[Sync] Tier 1A HTTP ${res.status} from ${riUrl}`);
      }
    } catch (err) {
      console.warn(`[Sync] Tier 1A error (${riUrl}):`, err.message);
    }

    try {
      const relayUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(riUrl)}`;
      console.log(`[Sync] Querying Tier 1B (RockstarINTEL via rss2json): ${riUrl}`);
      const res = await fetch(relayUrl, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json?.items) ? json.items.map(it => ({
          rawTitle: it.title || '',
          rawHtml: it.content || it.description || ''
        })) : [];
        const matched = pickBestWeeklyCandidate(items, expectedThuTs, 'rockstarintel');
        if (matched && matched.ts >= expectedThuTs) {
          console.log(`[Sync] ✓ Matched RockstarINTEL via rss2json: "${matched.title}"`);
          return matched;
        }
      } else {
        console.warn(`[Sync] Tier 1B HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn(`[Sync] Tier 1B error (${riUrl}):`, err.message);
    }
  }

  // Tier 2: Reddit RSS Secondary Fallback (in case RockstarINTEL ever delays or fails)
  const redditFeeds = [
    'https://www.reddit.com/r/gtaonline/search.rss?q=title%3A%22Weekly+Bonuses+and+Discounts%22&restrict_sr=1&sort=new',
    'https://www.reddit.com/user/PapaXan/submitted.rss'
  ];

  for (const feedUrl of redditFeeds) {
    try {
      const relayUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
      console.log(`[Sync] Querying Tier 2A (Reddit rss2json): ${feedUrl}`);
      const res = await fetch(relayUrl, { signal: AbortSignal.timeout(9000) });
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json?.items) ? json.items.map(it => ({
          rawTitle: it.title || '',
          rawHtml: it.content || it.description || ''
        })) : [];
        const matched = pickBestWeeklyCandidate(items, expectedThuTs, 'reddit');
        if (matched && matched.ts >= expectedThuTs) {
          console.log(`[Sync] ✓ Matched Reddit via rss2json: "${matched.title}"`);
          return matched;
        }
      }
    } catch (err) {
      console.warn(`[Sync] Tier 2A error (${feedUrl}):`, err.message);
    }

    try {
      console.log(`[Sync] Querying Tier 2B (Reddit Direct RSS): ${feedUrl}`);
      const res = await fetch(feedUrl, {
        signal: AbortSignal.timeout(8000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'application/atom+xml, application/xml, text/xml, */*'
        }
      });
      if (res.ok) {
        const xml = await res.text();
        const matched = pickBestWeeklyCandidate(extractMatchesFromRssXml(xml), expectedThuTs, 'reddit');
        if (matched && matched.ts >= expectedThuTs) {
          console.log(`[Sync] ✓ Matched Reddit Direct RSS: "${matched.title}"`);
          return matched;
        }
      }
    } catch (err) {
      console.warn(`[Sync] Tier 2B error (${feedUrl}):`, err.message);
    }
  }

  // Tier 3: Firebase Cloud RTDB fallback ONLY if its week start timestamp is >= expectedThuTs
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
    if (/^(?:Completing|Weekly Challenges|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d|Podium Vehicle)/i.test(line)) break;
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

function classifyDiscountCategory(itemName) {
  const lower = String(itemName || '').toLowerCase();
  if (/armor|armour|vest/.test(lower)) return 'weapons';
  if (/agency|hangar|facility|bunker|auto shop|bail|property|properties|garage|nightclub|arcade|mc|office|upgrades|modifications|renovations|clubhouse|salvage yard/.test(lower)) {
    return 'properties';
  }
  if (/rifle|gun|launcher|shotgun|pistol|smg|weapon|shocker|carbine|bat|knife|railgun|atomizer|grenade|sticky|molotov|mine/.test(lower)) {
    return 'weapons';
  }
  if (/shirt|outfit|clothing|hat|mask|apparel|onesie|jacket|boots/.test(lower)) {
    return 'apparel';
  }
  return 'vehicles';
}

function splitVehicleList(rawText) {
  if (!rawText) return [];
  const cleaned = cleanMarkdown(rawText).replace(/\.$/, '').trim();
  if (!cleaned) return [];
  return cleaned
    .split(/\s*(?:,|&|\band\b)\s*/i)
    .map(s => s.replace(/^the\s+/i, '').trim())
    .filter(s => s.length > 1);
}

// ── Comprehensive RockstarINTEL HTML Weekly Parser ──
function parseRockstarIntelPost(rawTitle, rawHtml) {
  const cleanedTitleRaw = cleanMarkdown(rawTitle || '');
  // Trim trailing footer/newsletter/social boilerplate and collapse nested WordPress <strong><strong>...</strong></strong>
  let html = decodeHtmlEntities(rawHtml || '')
    .replace(/<h3[^>]*>\s*GTA\+\s*Benefits[\s\S]*$/i, '')
    .replace(/<div[^>]*class="[^"]*wp-block-tnp-minimal[^"]*"[\s\S]*$/i, '')
    .replace(/<p>\s*The post\s*<a[\s\S]*$/i, '')
    .replace(/<strong>\s*<strong>/gi, '<strong>')
    .replace(/<\/strong>\s*<\/strong>/gi, '</strong>');

  // Extract <h3> sections
  const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  const matches = [...html.matchAll(h3Regex)];
  const introHtml = matches.length > 0 ? html.slice(0, matches[0].index) : html;
  const sections = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : html.length;
    sections.push({
      heading: cleanMarkdown(matches[i][1].replace(/<[^>]+>/g, '')).replace(/:$/, '').trim(),
      html: html.slice(start, end)
    });
  }

  const introLines = htmlToCleanLines(introHtml);
  const dateSource = introLines.match(/from\s+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?\s+through\s+(?:[A-Za-z]+\s+)?\d{1,2}(?:st|nd|rd|th)?)/i)?.[1]
    || cleanedTitleRaw.match(/\(([^)]*\d+[^)]*)\)/)?.[1]
    || cleanedTitleRaw;

  const dateRange = formatCleanDateRange(dateSource);
  const normalizedTitle = formatFullTitleFromSpan(dateSource) || cleanedTitleRaw;

  const data = {
    title: normalizedTitle,
    eventTitle: 'Weekly Bonuses, Discounts & Prize Vehicles',
    eventDesc: 'Explore active GTA Online multipliers, Casino Podium & LS Car Meet Prize Ride vehicles, Gun Van deals, and weekly Showroom discounts.',
    dateRange,
    podiumVehicle: 'TBD',
    prizeRide: { vehicle: 'TBD', condition: 'Check LS Car Meet Challenge' },
    weeklyChallenge: { task: 'Complete Weekly Challenge', reward: 'GTA$100,000' },
    timeTrials: { regular: 'TBD', hsw: 'TBD', premiumRace: 'TBD' },
    hswTestRide: 'TBD',
    testRides: [],
    salvageRobberies: [],
    fibPriorityFile: 'Active',
    kortzTargets: [],
    luxuryAutos: [],
    pdmShowroom: [],
    gunVan: [],
    bonuses: [],
    discounts: [],
    specialRewards: [],
    dailyObjectives: [
      { day: 'Thursday', task: 'Complete a featured Bonus Mode or Mission' },
      { day: 'Friday', task: 'Beat the active Time Trial par time' },
      { day: 'Saturday', task: 'Check Gun Van for Free & Discounted Gear' }
    ]
  };

  let podiumPrice = '';
  let prizePrice = '';
  const fibExtras = [];

  for (const sec of sections) {
    const h = sec.heading.toLowerCase();
    const linesText = htmlToCleanLines(sec.html);
    const listItems = [...sec.html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m =>
      cleanMarkdown(m[1].replace(/<[^>]+>/g, ''))
    ).filter(Boolean);
    const strongItems = [...sec.html.matchAll(/<strong[^>]*>([\s\S]*?)<\/strong>/gi)].map(m =>
      cleanMarkdown(m[1].replace(/<[^>]+>/g, ''))
    ).filter(Boolean);

    if (h.includes('kortz')) {
      data.kortzTargets = listItems;
      const bonusMoneyMatch = linesText.match(/extra\s+(GTA\$[\d,]+)/i);
      if (bonusMoneyMatch || /without dying/i.test(linesText)) {
        const amt = bonusMoneyMatch ? bonusMoneyMatch[1] : 'GTA$400,000';
        const rewardText = `Kortz Center Heist No-Death Completion Bonus (${amt})`;
        data.specialRewards.push(rewardText);
      }
    } else if (h.includes('priority file') || h.includes('fib')) {
      const fileName = strongItems[0] || linesText.match(/is\s+([^.]+)\./i)?.[1] || 'Active';
      const paysDouble = /double|2x/i.test(linesText);
      data.fibPriorityFile = paysDouble && !/2x/i.test(fileName) ? `${fileName} (2X GTA$ & RP)` : fileName;
      if (paysDouble) fibExtras.push(`FIB Priority File: ${fileName}`);
    } else if (h.includes('salvage yard')) {
      const defaultVals = {
        gangbanger: '~$300,000 – $400,000',
        mctony: '~$325,000 – $375,000',
        cargo: '~$350,000 – $400,000',
        duggan: '~$350,000 – $400,000',
        podium: '~$300,000 – $390,000'
      };
      data.salvageRobberies = listItems.map(li => {
        const parts = li.split(':');
        const robberyName = (parts[0] || 'Salvage Robbery').trim();
        const rawTarget = parts.slice(1).join(':').trim();
        const claimable = /claimable/i.test(rawTarget);
        const target = rawTarget.replace(/\((?:non[- ]?claimable|claimable)\)/gi, '').trim();
        const key = robberyName.toLowerCase();
        const matchedKey = Object.keys(defaultVals).find(k => key.includes(k));
        return {
          robbery: robberyName,
          target: target || 'Featured Vehicle',
          value: defaultVals[matchedKey] || '~$300,000 – $400,000',
          claimable
        };
      });
    } else if (h.includes('podium vehicle')) {
      data.podiumVehicle = strongItems[0]
        || linesText.match(/win\s+the\s+([A-Z0-9][^,.]+?)(?:,|\s+which|\.)/i)?.[1]?.trim()
        || 'TBD';
      podiumPrice = linesText.match(/(\$[\d,]+)/)?.[1] || '';
    } else if (h.includes('prize ride')) {
      data.prizeRide.vehicle = strongItems[0]
        || linesText.match(/unlock\s+the\s+([A-Z0-9][^,.]+?)(?:\s+as\s+the|\.|,)/i)?.[1]?.trim()
        || 'TBD';
      prizePrice = linesText.match(/(\$[\d,]+)/)?.[1] || '';
      const condMatch = linesText.match(/(?:in GTA Online,\s*)?(place[^.]+?)\s+to unlock/i);
      if (condMatch) {
        let cond = condMatch[1].trim().replace(/^place\s+top/i, 'Place Top');
        cond = cond.replace(/\bLS Car Meet Race\b/i, 'LS Car Meet Series Race');
        data.prizeRide.condition = cond;
      }
    } else if (h.includes('hao') || h.includes('hsw premium')) {
      data.hswTestRide = strongItems[0]
        || linesText.match(/Vehicle is\s+the\s+([A-Z0-9][^,.]+?)(?:\s+for\s+|\.)/i)?.[1]?.trim()
        || 'TBD';
    } else if (h.includes('test track')) {
      const listStr = strongItems[0] || linesText.match(/Vehicles are\s+(?:the\s+)?([^.]+)/i)?.[1] || '';
      data.testRides = splitVehicleList(listStr);
    } else if (h.includes('luxury autos')) {
      const listStr = strongItems[0] || linesText.match(/cars this week are\s+(?:the\s+)?([^.]+)/i)?.[1] || '';
      data.luxuryAutos = splitVehicleList(listStr);
    } else if (h.includes('premium deluxe') || h.includes('simeon')) {
      const listStr = strongItems[0] || linesText.match(/They are\s+(?:the\s+)?([^.]+)/i)?.[1] || '';
      data.pdmShowroom = splitVehicleList(listStr);
    } else if (h.includes('gun van')) {
      // Parse sub-sections inside Gun Van Contents: Weapons, Throwables, Body Armor
      const subBlocks = sec.html.split(/<p[^>]*>\s*<strong[^>]*>/i);
      const gunVanItems = [];
      for (const blk of subBlocks) {
        const subNameMatch = blk.match(/^([^<]+)<\/strong>/i);
        const subName = subNameMatch ? cleanMarkdown(subNameMatch[1]).toLowerCase() : 'weapons';
        const items = [...blk.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m => cleanMarkdown(m[1].replace(/<[^>]+>/g, ''))).filter(Boolean);
        if (items.length === 0) continue;

        if (subName.includes('throwable')) {
          const names = items.map(i => i.replace(/\s*\([^)]*\)/g, '').trim());
          const rateInfo = items[0].match(/\(([^)]+)\)/)?.[1] || '10%, GTA+ 20%';
          gunVanItems.push(`Throwables: ${names.join(', ')} (${rateInfo})`);
        } else if (subName.includes('armor')) {
          const rateInfo = items[0].match(/\(([^)]+)\)/)?.[1] || '10%, GTA+ 80%';
          gunVanItems.push(`Body Armor: All Types (${rateInfo})`);
          const gtPlusPct = rateInfo.match(/GTA\+\s*(\d+)%/i)?.[1];
          const stdPct = rateInfo.match(/^(\d+)%/)?.[1];
          const bestPct = gtPlusPct ? `${gtPlusPct}%` : (stdPct ? `${stdPct}%` : null);
          if (bestPct && parseInt(bestPct, 10) >= 30) {
            const label = gtPlusPct ? 'All Body Armor (Gun Van – GTA+)' : 'All Body Armor (Gun Van)';
            data.discounts.push({
              name: label,
              item: label,
              category: 'weapons',
              rate: `${bestPct} OFF`,
              discount: `${bestPct} OFF`,
              badgeClass: parseInt(bestPct, 10) >= 50 ? 'rate-50' : parseInt(bestPct, 10) >= 40 ? 'rate-40' : 'rate-30'
            });
          }
        } else {
          for (const it of items) {
            const cleanItem = it.replace(/\s*\(FREE\)/i, ' – FREE (100% Off)');
            gunVanItems.push(cleanItem);
            const nameOnly = it.replace(/\s*\([^)]*\)/g, '').trim();
            if (/\bfree\b/i.test(it)) {
              data.discounts.push({
                name: `${nameOnly} (Gun Van)`,
                item: `${nameOnly} (Gun Van)`,
                category: 'weapons',
                rate: '100% FREE',
                discount: '100% FREE',
                badgeClass: 'rate-free'
              });
              data.specialRewards.push(`Free ${nameOnly} in the Gun Van`);
            } else {
              const stdPct = parseInt(it.match(/\((\d+)%/)?.[1] || '0', 10);
              const gtaPct = parseInt(it.match(/GTA\+\s*(\d+)%/i)?.[1] || '0', 10);
              const bestPct = Math.max(stdPct, gtaPct);
              if (bestPct >= 30) {
                const isGtaPlusOnly = gtaPct > stdPct && stdPct < 30;
                const label = isGtaPlusOnly ? `${nameOnly} (Gun Van – GTA+)` : `${nameOnly} (Gun Van)`;
                data.discounts.push({
                  name: label,
                  item: label,
                  category: 'weapons',
                  rate: `${bestPct}% OFF`,
                  discount: `${bestPct}% OFF`,
                  badgeClass: bestPct >= 50 ? 'rate-50' : bestPct >= 40 ? 'rate-40' : 'rate-30'
                });
              }
            }
          }
        }
      }
      data.gunVan = gunVanItems;
    } else if (h.includes('premium race')) {
      data.timeTrials.premiumRace = strongItems[0] || linesText.match(/Premium Race is\s+([^.]+)/i)?.[1]?.trim() || 'TBD';
    } else if (h.includes('hsw time trial')) {
      data.timeTrials.hsw = strongItems[0] || linesText.match(/HSW Time Trial is\s+([^.]+)/i)?.[1]?.trim() || 'TBD';
    } else if (h.includes('time trial')) {
      data.timeTrials.regular = strongItems[0] || linesText.match(/Time Trial is\s+([^.]+)/i)?.[1]?.trim() || 'TBD';
    } else if (h.includes('discount')) {
      // Sequential scan of rate headings (<h4>/<h5>/<p><strong>) and following <ul>...</ul>
      const blockRegex = /<(h[45]|p|strong|ul)[^>]*>([\s\S]*?)<\/\1>/gi;
      let currentRate = '30% OFF';
      let currentBadge = 'rate-30';
      let blkMatch;
      while ((blkMatch = blockRegex.exec(sec.html)) !== null) {
        const tag = blkMatch[1].toLowerCase();
        const inner = blkMatch[2];
        if (tag !== 'ul') {
          const headingText = cleanMarkdown(inner.replace(/<[^>]+>/g, ''));
          if (/\bfree\b/i.test(headingText)) {
            currentRate = '100% FREE';
            currentBadge = 'rate-free';
          } else {
            const pctM = headingText.match(/(\d+)\s*%\s*off/i);
            if (pctM) {
              const pct = parseInt(pctM[1], 10);
              currentRate = `${pct}% OFF`;
              currentBadge = pct >= 50 ? 'rate-50' : pct >= 40 ? 'rate-40' : 'rate-30';
            }
          }
        } else {
          const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m => cleanMarkdown(m[1].replace(/<[^>]+>/g, ''))).filter(Boolean);
          for (const itemName of items) {
            data.discounts.push({
              name: itemName,
              item: itemName,
              category: classifyDiscountCategory(itemName),
              rate: currentRate,
              discount: currentRate,
              badgeClass: currentBadge
            });
          }
        }
      }
    } else if (h.includes('bonus')) {
      const grouped = new Map();
      const addBonusItem = (multRaw, itemText) => {
        const norm = multRaw.toUpperCase().replace('QUADRUPLE', '4X').replace('TRIPLE', '3X').replace('DOUBLE', '2X');
        const tier = norm === 'BONUS' ? 'bonus' : norm.toLowerCase();
        const label = norm === 'BONUS' ? 'SPECIAL BONUSES' : `${norm} GTA$ & RP`;
        if (!grouped.has(norm)) {
          grouped.set(norm, { multiplier: norm, label, tier, items: [] });
        }
        grouped.get(norm).items.push(itemText);
      };

      for (const li of listItems) {
        const bm = li.match(/^(\d+x|Double|Triple|Quadruple|Bonus)\s*(?:GTA\$\s*(?:&|and)\s*RP|GTA\$|RP)?\s*(?:on|for)?\s*(.+)$/i);
        if (bm) {
          addBonusItem(bm[1], bm[2].trim());
        } else {
          addBonusItem('BONUS', li);
        }
      }
      for (const fibItem of fibExtras) {
        const existing2x = grouped.get('2X')?.items || [];
        if (!existing2x.some(x => x.toLowerCase().includes('priority file'))) {
          addBonusItem('2X', fibItem);
        }
      }
      if (data.kortzTargets.length > 0 && !data.specialRewards.some(r => r.toLowerCase().includes('kortz'))) {
        data.specialRewards.push('Kortz Center Heist New Primary Targets & First-Time Bonus Reset');
      }
      for (const sr of data.specialRewards) {
        if (/kortz/i.test(sr)) {
          addBonusItem('BONUS', `${sr} (+ First-Time Bonus Reset)`);
        }
      }

      const rank = { '4X': 0, '3X': 1, '2X': 2, '1.5X': 3, 'BONUS': 4 };
      data.bonuses = [...grouped.values()].sort((a, b) => (rank[a.multiplier] ?? 9) - (rank[b.multiplier] ?? 9));
    } else if (h.includes('weekly challenge')) {
      const taskM = linesText.match(/[“"']([^”"']+)[”"']/);
      const rewardM = linesText.match(/(GTA\$[\d,]+)/i);
      if (taskM) data.weeklyChallenge.task = taskM[1].trim();
      if (rewardM) data.weeklyChallenge.reward = rewardM[1].toUpperCase();
    }
  }

  // Build concise, punchy dynamic eventTitle & eventDesc
  if (data.bonuses.length > 0) {
    const headlineParts = data.bonuses
      .filter(b => b.multiplier !== 'BONUS')
      .slice(0, 3)
      .map(b => `${b.multiplier} ${b.items.slice(0, 2).map(x => x.replace(/\s*\([^)]*\)/g, '').trim()).join(' & ')}`);
    if (headlineParts.length > 0) {
      data.eventTitle = headlineParts.join(', ');
    }
    const allBonusSummary = data.bonuses
      .filter(b => b.multiplier !== 'BONUS')
      .map(b => `${b.multiplier} on ${b.items.join(' and ')}`)
      .join(', ');
    const podNote = data.podiumVehicle !== 'TBD'
      ? `spin for the ${data.podiumVehicle}${podiumPrice ? ` (${podiumPrice})` : ''}`
      : 'check the Lucky Wheel';
    const prizeNote = data.prizeRide.vehicle !== 'TBD'
      ? `win the ${data.prizeRide.vehicle}${prizePrice ? ` (${prizePrice})` : ''}`
      : 'unlock the Prize Ride';
    data.eventDesc = `Earn ${allBonusSummary}, plus ${podNote} and ${prizeNote}!`;
  }

  // Contextual Daily Objectives reflecting current active activities across Thu-Wed
  const topMode = data.bonuses[0]?.items[0]?.replace(/\s*\([^)]*\)/g, '').trim() || 'a Featured Bonus Activity';
  const secMode = data.bonuses[1]?.items[0]?.replace(/\s*\([^)]*\)/g, '').trim() || 'Stunt Race or Contact Mission';
  const thirdMode = data.bonuses[2]?.items[0]?.replace(/\s*\([^)]*\)/g, '').trim() || 'Featured Adversary Mode or Contact Mission';
  const ttLabel = data.timeTrials.regular !== 'TBD' ? data.timeTrials.regular : 'Weekly';
  data.dailyObjectives = [
    { day: 'Thursday', task: `Participate in ${topMode}` },
    { day: 'Friday', task: `Complete 1 ${secMode}` },
    { day: 'Saturday', task: `Beat the ${ttLabel} Time Trial or a Salvage Yard Robbery` },
    { day: 'Sunday', task: `Spin the Lucky Wheel for the ${data.podiumVehicle || 'Podium Vehicle'}` },
    { day: 'Monday', task: `Compete in LS Car Meet (${data.prizeRide.condition || 'Prize Ride Challenge'})` },
    { day: 'Tuesday', task: `Play 1 ${thirdMode}` },
    { day: 'Wednesday', task: `Visit the Gun Van and finish ${data.weeklyChallenge.task || 'the Weekly Challenge'}` }
  ];

  return data;
}

// Build rich Grinder's Profit Matrix rows for BDC Central Command & Discord briefings
function buildMatrixBonuses(data) {
  const estimates = {
    '4X': { rate: '4X GTA$ & RP', hourly: '~$450K – $750K/hr', solo: 'Public / Solo Friendly', tip: 'Trigger quick sessions between cooldowns for maximum payout.' },
    '3X': { rate: '3X GTA$ & RP', hourly: '~$350K – $550K/hr', solo: '1–16 Players', tip: 'Run full lobbies or 2-lap rotations for fast cash & RP.' },
    '2X': { rate: '2X GTA$ & RP', hourly: '~$300K – $500K/hr', solo: 'Solo / Co-op', tip: 'Pair with CEO/MC/FIB cooldown loops for steady income.' },
    'BONUS': { rate: 'BONUS PAYOUT', hourly: '~$400K+ Bonus', solo: 'Crew / Co-op', tip: 'Complete bonus criteria cleanly to secure the one-time payout.' }
  };
  const matrix = [];
  let idx = 1;
  for (const grp of (data.bonuses || [])) {
    const mult = String(grp.multiplier || '2X').toUpperCase();
    const meta = estimates[mult] || estimates['2X'];
    for (const rawName of (grp.items || [])) {
      const name = String(rawName).trim();
      if (!name) continue;
      const isGtaPlus = /gta\+/i.test(name);
      const isSoloFriendly = /freemode|contact|priority|cluckin|agency|salvage|payphone|bunker|acid/i.test(name);
      matrix.push({
        id: `bonus_${idx++}`,
        name,
        multiplier: mult,
        rate: isGtaPlus ? `${mult} (Up to 4X GTA+)` : meta.rate,
        hourly: mult === 'BONUS' && /400,000/.test(name) ? 'GTA$400,000 Extra Bonus' : meta.hourly,
        tier: grp.tier || mult.toLowerCase(),
        solo: isSoloFriendly ? 'Yes (1–4 Players)' : meta.solo,
        tip: meta.tip
      });
    }
  }
  return matrix;
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
        const currentVersion = verMatch ? verMatch[1] : 'v3.8.11';
        const replacement = `const DEFAULT_WEEK_DATA = ${JSON.stringify({ ...data, version: currentVersion }, null, 2)}`;
        content = (content.substring(0, startIdx) + replacement + content.substring(endIdx)).replace(/\r\n/g, '\n');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Updated ${path.relative(rootDir, filePath)} (${data.dateRange})`);
      }
    }
  }
}

// ── Push Synchronized Data to Live Cloud RTDB Mirror (livecounters-8eaa8 only; authenticated the-bdcf-crew synced via CLI) ──
async function pushToCloudMirror(data) {
  try {
    const matrixBonuses = buildMatrixBonuses(data);
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
      kortz_targets: data.kortzTargets || [],
      weekly_challenge: data.weeklyChallenge || {},
      bonuses: matrixBonuses.length > 0 ? matrixBonuses : (data.bonuses || []),
      bonus_groups: data.bonuses || [],
      special_rewards: data.specialRewards || [],
      gun_van: {
        location: 'Daily Rotating Location',
        discount_item: (data.gunVan && data.gunVan[0]) || 'Featured Weapon',
        weapons: data.gunVan || []
      },
      last_updated: Math.floor(Date.now() / 1000),
      source: `RockstarINTEL Verified Weekly Feed (${data.dateRange})`
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
  } else if (post.sourceType === 'rockstarintel' && post.rawHtml) {
    parsed = parseRockstarIntelPost(post.title, post.rawHtml);
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
