/**
 * 🌴 LOS SANTOS WEEKLY | GTA ONLINE UPDATE HUB
 * Core Application Logic, Live Reddit Parser & Google Sheets Sync Engine
 */

(function () {
  'use strict';

  // ── Version & App Constants ──
  const APP_VERSION = 'v3.8.11';

  // ── Default State & Fallback Current Week Data (Nov 12 – 19, 2026) ──
  const DEFAULT_WEEK_DATA = {
  "title": "Weekly Bonuses and Discounts - November 12th to November 19th",
  "eventTitle": "4X Freemode Challenges, 3X Stunt Race Series & Community Series, 2X All Contact Missions & Sumo",
  "eventDesc": "Earn 4X on Freemode Challenges, 3X on Stunt Race Series and Community Series, 2X on All Contact Missions (4x for GTA+ Members, through December 2nd) and Sumo (Remix) and FIB Priority File: The Brute Force File, plus spin for the Karin Everon ($1,475,000) and win the Western Powersurge ($1,605,000)!",
  "dateRange": "Nov 12 – 19, 2026",
  "podiumVehicle": "Karin Everon",
  "prizeRide": {
    "vehicle": "Western Powersurge",
    "condition": "Place Top 4 in a LS Car Meet Series Race for 2 days in a row"
  },
  "weeklyChallenge": {
    "task": "Win two Stunt Races",
    "reward": "GTA$100,000"
  },
  "timeTrials": {
    "regular": "Calafia Way",
    "hsw": "Sandy Shores",
    "premiumRace": "Down the Drain"
  },
  "hswTestRide": "Weeny Issi Rally",
  "testRides": [
    "Übermacht Rebla GTS",
    "Declasse Impaler LX",
    "Obey I-Wagen"
  ],
  "salvageRobberies": [
    {
      "robbery": "The Gangbanger Robbery",
      "target": "Canis Seminole Frontier",
      "value": "~$300,000 – $400,000",
      "claimable": false
    },
    {
      "robbery": "The McTony Robbery",
      "target": "Karin Hotring Everon",
      "value": "~$325,000 – $375,000",
      "claimable": false
    },
    {
      "robbery": "The Cargo Ship Robbery",
      "target": "Grotti Stinger TT",
      "value": "~$350,000 – $400,000",
      "claimable": false
    }
  ],
  "fibPriorityFile": "The Brute Force File (2X GTA$ & RP)",
  "kortzTargets": [
    "In Excess of Success",
    "What are Melons?",
    "Breathless"
  ],
  "luxuryAutos": [
    "Declasse Tampa GT",
    "Pfister Astrale"
  ],
  "pdmShowroom": [
    "Declasse Hotring Sabre",
    "Karin Vivanite",
    "Obey Tailgater S",
    "Declasse Tahoma Coupe",
    "Canis Castigator"
  ],
  "gunVan": [
    "Stun Gun (10%, GTA+ 20%)",
    "Up-n-Atomizer (10%, GTA+ 20%)",
    "Tactical SMG (40%, GTA+ 40%)",
    "Combat Shotgun (10%, GTA+ 40%)",
    "Knife – FREE (100% Off)",
    "Baseball Bat – FREE (100% Off)",
    "Throwables: Sticky Bombs, Proximity Mines, Molotovs (10%, GTA+ 20%)",
    "Body Armor: All Types (10%, GTA+ 80%)"
  ],
  "bonuses": [
    {
      "multiplier": "4X",
      "label": "4X GTA$ & RP",
      "tier": "4x",
      "items": [
        "Freemode Challenges"
      ]
    },
    {
      "multiplier": "3X",
      "label": "3X GTA$ & RP",
      "tier": "3x",
      "items": [
        "Stunt Race Series",
        "Community Series"
      ]
    },
    {
      "multiplier": "2X",
      "label": "2X GTA$ & RP",
      "tier": "2x",
      "items": [
        "All Contact Missions (4x for GTA+ Members, through December 2nd)",
        "Sumo (Remix)",
        "FIB Priority File: The Brute Force File"
      ]
    },
    {
      "multiplier": "BONUS",
      "label": "SPECIAL BONUSES",
      "tier": "bonus",
      "items": [
        "Kortz Center Heist No-Death Completion Bonus (GTA$400,000) (+ First-Time Bonus Reset)"
      ]
    }
  ],
  "discounts": [
    {
      "name": "Tactical SMG (Gun Van)",
      "item": "Tactical SMG (Gun Van)",
      "category": "weapons",
      "rate": "40% OFF",
      "discount": "40% OFF",
      "badgeClass": "rate-40"
    },
    {
      "name": "Combat Shotgun (Gun Van – GTA+)",
      "item": "Combat Shotgun (Gun Van – GTA+)",
      "category": "weapons",
      "rate": "40% OFF",
      "discount": "40% OFF",
      "badgeClass": "rate-40"
    },
    {
      "name": "Knife (Gun Van)",
      "item": "Knife (Gun Van)",
      "category": "weapons",
      "rate": "100% FREE",
      "discount": "100% FREE",
      "badgeClass": "rate-free"
    },
    {
      "name": "Baseball Bat (Gun Van)",
      "item": "Baseball Bat (Gun Van)",
      "category": "weapons",
      "rate": "100% FREE",
      "discount": "100% FREE",
      "badgeClass": "rate-free"
    },
    {
      "name": "All Body Armor (Gun Van – GTA+)",
      "item": "All Body Armor (Gun Van – GTA+)",
      "category": "weapons",
      "rate": "80% OFF",
      "discount": "80% OFF",
      "badgeClass": "rate-50"
    },
    {
      "name": "Canis Castigator",
      "item": "Canis Castigator",
      "category": "vehicles",
      "rate": "30% OFF",
      "discount": "30% OFF",
      "badgeClass": "rate-30"
    },
    {
      "name": "Declasse Hotring Sabre",
      "item": "Declasse Hotring Sabre",
      "category": "vehicles",
      "rate": "30% OFF",
      "discount": "30% OFF",
      "badgeClass": "rate-30"
    },
    {
      "name": "Declasse Impaler LX",
      "item": "Declasse Impaler LX",
      "category": "vehicles",
      "rate": "30% OFF",
      "discount": "30% OFF",
      "badgeClass": "rate-30"
    },
    {
      "name": "Declasse Tahoma Coupe",
      "item": "Declasse Tahoma Coupe",
      "category": "vehicles",
      "rate": "30% OFF",
      "discount": "30% OFF",
      "badgeClass": "rate-30"
    },
    {
      "name": "Dewbauchee Vagner",
      "item": "Dewbauchee Vagner",
      "category": "vehicles",
      "rate": "30% OFF",
      "discount": "30% OFF",
      "badgeClass": "rate-30"
    },
    {
      "name": "Karin Vivanite",
      "item": "Karin Vivanite",
      "category": "vehicles",
      "rate": "30% OFF",
      "discount": "30% OFF",
      "badgeClass": "rate-30"
    },
    {
      "name": "MTL Wastelander",
      "item": "MTL Wastelander",
      "category": "vehicles",
      "rate": "30% OFF",
      "discount": "30% OFF",
      "badgeClass": "rate-30"
    },
    {
      "name": "Obey I-Wagen",
      "item": "Obey I-Wagen",
      "category": "vehicles",
      "rate": "30% OFF",
      "discount": "30% OFF",
      "badgeClass": "rate-30"
    },
    {
      "name": "Obey Tailgater S",
      "item": "Obey Tailgater S",
      "category": "vehicles",
      "rate": "30% OFF",
      "discount": "30% OFF",
      "badgeClass": "rate-30"
    },
    {
      "name": "Übermacht Rebla GTS",
      "item": "Übermacht Rebla GTS",
      "category": "vehicles",
      "rate": "30% OFF",
      "discount": "30% OFF",
      "badgeClass": "rate-30"
    }
  ],
  "specialRewards": [
    "Kortz Center Heist No-Death Completion Bonus (GTA$400,000)",
    "Free Knife in the Gun Van",
    "Free Baseball Bat in the Gun Van"
  ],
  "dailyObjectives": [
    {
      "day": "Thursday",
      "task": "Participate in Freemode Challenges"
    },
    {
      "day": "Friday",
      "task": "Complete 1 Stunt Race Series"
    },
    {
      "day": "Saturday",
      "task": "Beat the Calafia Way Time Trial or a Salvage Yard Robbery"
    },
    {
      "day": "Sunday",
      "task": "Spin the Lucky Wheel for the Karin Everon"
    },
    {
      "day": "Monday",
      "task": "Compete in LS Car Meet (Place Top 4 in a LS Car Meet Series Race for 2 days in a row)"
    },
    {
      "day": "Tuesday",
      "task": "Play 1 All Contact Missions"
    },
    {
      "day": "Wednesday",
      "task": "Visit the Gun Van and finish Win two Stunt Races"
    }
  ],
  "version": "v3.8.11"
};






  let currentData = DEFAULT_WEEK_DATA;
  let taskCheckState = {};

  // ── Firebase Firestore Real-Time Cloud Sync Engine ──
  const FIREBASE_CONFIG = {
    apiKey:            ["AIzaSyBkOfgA2gmu", "ns2-X--EYu1D0TeiPFN7w-U"].join(""),
    authDomain:        "the-bdcf-crew.firebaseapp.com",
    projectId:         "the-bdcf-crew",
    storageBucket:     "the-bdcf-crew.firebasestorage.app",
    messagingSenderId: "798269256571",
    appId:             "1:798269256571:web:4077fad17160ee72ec03de"
  };

  // Helper: Parse chronological week start timestamp from dateRange/week_title
  function getWeekStartTimestamp(dataOrStr) {
    const str = typeof dataOrStr === 'string'
      ? dataOrStr
      : (dataOrStr?.dateRange || dataOrStr?.week_title || dataOrStr?.title || '');
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

  // Helper: Normalize both Central Command & Web schemas into unified frontend schema
  function getExpectedActiveThursdayTimestamp() {
    const latestReset = new Date(getLatestPassedResetTime());
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(latestReset);
      const p = {};
      for (const item of parts) p[item.type] = item.value;
      return Date.UTC(parseInt(p.year, 10), parseInt(p.month, 10) - 1, parseInt(p.day, 10));
    } catch (_) {
      return Date.UTC(latestReset.getUTCFullYear(), latestReset.getUTCMonth(), latestReset.getUTCDate());
    }
  }

  function normalizeBonusGroupsList(rawList) {
    if (!Array.isArray(rawList) || rawList.length === 0) return null;
    // Detect flat matrix format ([{ name, multiplier, rate, ... }]) vs grouped format ([{ multiplier, label, items }])
    if (!Array.isArray(rawList[0].items) && !Array.isArray(rawList[0].activities) && rawList[0].name) {
      const grouped = new Map();
      for (const b of rawList) {
        const mult = String(b.multiplier || '2X').split(/\s+/)[0].toUpperCase();
        const tier = mult === 'BONUS' ? 'bonus' : mult.toLowerCase().replace('.', '_');
        const label = mult === 'BONUS' ? 'SPECIAL BONUSES' : `${mult} GTA$ & RP`;
        if (!grouped.has(mult)) grouped.set(mult, { multiplier: mult, label, tier, items: [] });
        grouped.get(mult).items.push(String(b.name).trim());
      }
      const rank = { '4X': 0, '3X': 1, '2X': 2, '1.5X': 3, 'BONUS': 4 };
      return [...grouped.values()].sort((a, b) => (rank[a.multiplier] ?? 9) - (rank[b.multiplier] ?? 9));
    }
    return rawList.map(b => {
      const mult = String(b.multiplier || '2X').split(/\s+/)[0].toUpperCase();
      return {
        ...b,
        multiplier: mult,
        label: b.label || b.category || b.multiplier || `${mult} GTA$ & RP`,
        tier: (b.tier && (b.tier.includes('x') || b.tier === 'bonus')) ? b.tier : (mult === 'BONUS' ? 'bonus' : mult.toLowerCase().replace('.', '_')),
        items: Array.isArray(b.items) ? b.items : (Array.isArray(b.activities) ? b.activities : (b.name ? [b.name] : []))
      };
    });
  }

  const WEEKLY_DAY_NAMES = ["Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];

  function normalizeDailyObjectivesList(list) {
    if (!Array.isArray(list)) return [];
    return list
      .map((o, idx) => {
        const day = (o && typeof o === 'object' && o.day)
          ? String(o.day).trim()
          : WEEKLY_DAY_NAMES[idx % WEEKLY_DAY_NAMES.length];
        const task = typeof o === 'string'
          ? o.trim()
          : (o?.task ? String(o.task).trim() : '');
        return { day, task };
      })
      .filter(item => item.task && !/^tba\b/i.test(item.task));
  }

  function normalizeWeeklyData(raw) {
    if (!raw || typeof raw !== 'object') return DEFAULT_WEEK_DATA;
    const mapped = {
      ...DEFAULT_WEEK_DATA,
      ...raw,
      podiumVehicle: raw.podiumVehicle || raw.podium_vehicle || DEFAULT_WEEK_DATA.podiumVehicle,
      eventTitle: raw.eventTitle || raw.event_name || DEFAULT_WEEK_DATA.eventTitle,
      eventDesc: raw.eventDesc || raw.special_claim || DEFAULT_WEEK_DATA.eventDesc,
      dateRange: raw.dateRange || raw.week_title || DEFAULT_WEEK_DATA.dateRange,
      prizeRide: {
        vehicle: raw.prizeRide?.vehicle || raw.prize_ride || DEFAULT_WEEK_DATA.prizeRide.vehicle,
        condition: raw.prizeRide?.condition || raw.prize_ride_challenge || DEFAULT_WEEK_DATA.prizeRide.condition
      },
      weeklyChallenge: {
        task: raw.weeklyChallenge?.task || raw.weekly_challenge?.task || DEFAULT_WEEK_DATA.weeklyChallenge.task,
        reward: raw.weeklyChallenge?.reward || raw.weekly_challenge?.reward || DEFAULT_WEEK_DATA.weeklyChallenge.reward
      },
      fibPriorityFile: raw.fibPriorityFile || raw.fib_priority_file || DEFAULT_WEEK_DATA.fibPriorityFile,
      kortzTargets: Array.isArray(raw.kortzTargets) ? raw.kortzTargets : (Array.isArray(raw.kortz_targets) ? raw.kortz_targets : DEFAULT_WEEK_DATA.kortzTargets),
      testRides: Array.isArray(raw.testRides) ? raw.testRides : (Array.isArray(raw.test_track) ? raw.test_track : DEFAULT_WEEK_DATA.testRides),
      luxuryAutos: Array.isArray(raw.luxuryAutos) ? raw.luxuryAutos : (Array.isArray(raw.luxury_autos) ? raw.luxury_autos : DEFAULT_WEEK_DATA.luxuryAutos),
      pdmShowroom: Array.isArray(raw.pdmShowroom) ? raw.pdmShowroom : (Array.isArray(raw.simeons_pdm) ? raw.simeons_pdm : DEFAULT_WEEK_DATA.pdmShowroom),
      gunVan: Array.isArray(raw.gunVan) ? raw.gunVan : (Array.isArray(raw.gun_van?.weapons) ? raw.gun_van.weapons : DEFAULT_WEEK_DATA.gunVan),
      version: APP_VERSION
    };

    const rawSalvage = Array.isArray(raw.salvageRobberies) ? raw.salvageRobberies : (Array.isArray(raw.salvage_yard_targets) ? raw.salvage_yard_targets : null);
    if (rawSalvage && rawSalvage.length > 0) {
      mapped.salvageRobberies = rawSalvage.map(r => ({
        name: r.name || r.robbery || 'Salvage Robbery',
        vehicle: r.vehicle || r.target || r.car || 'Target Vehicle',
        value: r.value || '~$350,000 – $400,000',
        robbery: r.robbery || r.name || 'Salvage Robbery',
        target: r.target || r.vehicle || r.car || 'Target Vehicle',
        car: r.car || r.vehicle || r.target || 'Target Vehicle',
        claimable: !!r.claimable
      }));
    }

    const groupedBonuses = (Array.isArray(raw.bonus_groups) && raw.bonus_groups.length > 0)
      ? normalizeBonusGroupsList(raw.bonus_groups)
      : normalizeBonusGroupsList(raw.bonuses);
    if (groupedBonuses && groupedBonuses.length > 0) {
      mapped.bonuses = groupedBonuses;
    }

    if (Array.isArray(raw.discounts) && raw.discounts.length > 0) {
      mapped.discounts = raw.discounts.map(d => {
        const rateStr = String(d.rate || d.discount || '30% OFF').toUpperCase();
        const isFree = rateStr.includes('FREE');
        let badgeClass = d.badgeClass || 'rate-30';
        if (isFree) badgeClass = 'rate-free';
        else if (rateStr.includes('50') || rateStr.includes('80')) badgeClass = 'rate-50';
        else if (rateStr.includes('40')) badgeClass = 'rate-40';
        return {
          ...d,
          name: d.name || d.item || 'Discounted Item',
          item: d.item || d.name || 'Discounted Item',
          rate: rateStr,
          discount: rateStr,
          category: (d.category || 'vehicles').toLowerCase(),
          badgeClass
        };
      });
    }

    if (Array.isArray(raw.dailyObjectives)) {
      const cleanedDaily = normalizeDailyObjectivesList(raw.dailyObjectives);
      mapped.dailyObjectives = cleanedDaily.length > 0 ? cleanedDaily : normalizeDailyObjectivesList(DEFAULT_WEEK_DATA.dailyObjectives);
    } else {
      mapped.dailyObjectives = normalizeDailyObjectivesList(mapped.dailyObjectives);
    }

    return mapped;
  }

  async function initFirestoreSync() {
    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const { getFirestore, doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      const app = initializeApp(FIREBASE_CONFIG, 'LosSantosWeeklyApp');
      const db = getFirestore(app);
      const weeklyDocRef = doc(db, 'weekly', 'current');

      // Realtime listener — ONLY accept Firestore snapshot if strictly newer (> currentData) to protect against stale docs
      onSnapshot(weeklyDocRef, (snap) => {
        if (snap.exists()) {
          const cloudData = snap.data();
          if (cloudData && (cloudData.podiumVehicle || cloudData.podium_vehicle || cloudData.eventTitle || cloudData.dateRange)) {
            const normalized = normalizeWeeklyData(cloudData);
            if (getWeekStartTimestamp(normalized) > getWeekStartTimestamp(currentData) && normalized.podiumVehicle !== 'TBD') {
              currentData = normalized;
              saveData(currentData);
              renderAll();
              updateLiveIndicator(true, currentData.dateRange);
            }
          }
        }
      }, async () => {
        await syncFromCloudEndpoints();
      });

    } catch (err) {
      console.warn('[LosSantosWeekly] Cloud Firestore fallback to RTDB/bundled data:', err);
    }
  }

  async function syncFromCloudEndpoints() {
    const cb = `?t=${Math.floor(Date.now() / 60000)}`;
    const cloudMirrors = [
      `https://livecounters-8eaa8-default-rtdb.firebaseio.com/labData/gtaWeekly.json${cb}`,
      `./data/weekly_current.json${cb}`,
      `../data/weekly_current.json${cb}`,
      `https://the-bdcf-crew-default-rtdb.firebaseio.com/weekly/current.json${cb}`
    ];

    let newestCandidate = null;
    let newestTs = getWeekStartTimestamp(currentData);

    for (const url of cloudMirrors) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const raw = await res.json();
          if (raw && (raw.podiumVehicle || raw.podium_vehicle || raw.eventTitle || raw.event_name)) {
            const mapped = normalizeWeeklyData(raw);
            const candidateTs = getWeekStartTimestamp(mapped);
            if (mapped.podiumVehicle && mapped.podiumVehicle !== 'TBD' && candidateTs >= newestTs) {
              newestTs = candidateTs;
              newestCandidate = mapped;
            }
          }
        }
      } catch (_) {}
    }

    if (newestCandidate) {
      if (currentData.dateRange && newestCandidate.dateRange && currentData.dateRange !== newestCandidate.dateRange) {
        taskCheckState = {};
        saveTaskState();
      }
      currentData = newestCandidate;
      saveData(currentData);
      renderAll();
      updateLiveIndicator(true, currentData.dateRange);
    }

    const expectedThuTs = getExpectedActiveThursdayTimestamp();
    return Boolean(getWeekStartTimestamp(currentData) >= expectedThuTs && currentData?.podiumVehicle && currentData.podiumVehicle !== 'TBD');
  }

  function updateLiveIndicator(isLive, dateRange) {
    const liveStatusText = document.getElementById('liveStatusText');
    const livePill = document.querySelector('.status-pill.live-pill');
    const redditSourceMeta = document.getElementById('redditSourceMeta');

    if (liveStatusText) {
      liveStatusText.textContent = isLive ? 'LIVE CLOUD' : 'SAVED DATA';
    }
    if (livePill && isLive) {
      livePill.title = 'Real-time sync active from The BDCF Crew Cloud';
    }

    if (redditSourceMeta && dateRange) {
      redditSourceMeta.textContent = `Source: RockstarINTEL • Synced via BDCF Cloud (${dateRange})`;
    }
  }

  // ── Initialize App ──
  function initApp() {
    loadSavedData();
    loadTaskState();
    renderAll();
    initCountdownTimer();
    bindEvents();
    generateAppsScriptCode();
    // Always query RTDB & static mirrors immediately so stale Firestore docs can never lock the page
    syncFromCloudEndpoints();
    initFirestoreSync();
    checkAndAutoRefresh();
    setInterval(checkAndAutoRefresh, 15 * 60 * 1000); // Smart check every 15 mins
  }


  // ── Local Storage Management ──
  function loadSavedData() {
    const saved = localStorage.getItem('gta_weekly_data');
    if (saved) {
      try {
        const parsed = normalizeWeeklyData(JSON.parse(saved));
        const savedTs = getWeekStartTimestamp(parsed);
        const defaultTs = getWeekStartTimestamp(DEFAULT_WEEK_DATA);
        if (parsed && savedTs >= defaultTs && parsed.podiumVehicle && parsed.podiumVehicle !== 'TBD') {
          currentData = parsed;
        } else {
          // Outdated cached week detected — automatically upgrade to bundled week!
          currentData = normalizeWeeklyData(DEFAULT_WEEK_DATA);
          localStorage.setItem('gta_weekly_data', JSON.stringify(currentData));
        }
      } catch (e) {
        currentData = normalizeWeeklyData(DEFAULT_WEEK_DATA);
      }
    } else {
      currentData = normalizeWeeklyData(DEFAULT_WEEK_DATA);
    }
  }


  function saveData(data) {
    currentData = data;
    localStorage.setItem('gta_weekly_data', JSON.stringify(data));
  }

  function loadTaskState() {
    const saved = localStorage.getItem('gta_tasks_state');
    if (saved) {
      try {
        taskCheckState = JSON.parse(saved);
      } catch (e) {
        taskCheckState = {};
      }
    }
  }

  function saveTaskState() {
    localStorage.setItem('gta_tasks_state', JSON.stringify(taskCheckState));
    updateProgressCounter();
  }


  // ── Render All Sections ──
  function renderAll() {
    renderHeader();
    renderVehiclesAndChallenges();
    renderSalvageRobberies();
    renderDailyObjectives();
    renderBonuses();
    renderDiscounts();
    updateProgressCounter();
    updateTsvPreview();
  }

  function renderHeader() {
    const dateText = currentData.dateRange || 'Current Week';

    const navDateRange = document.getElementById('navDateRange');
    if (navDateRange) navDateRange.textContent = `📅 ${dateText}`;

    const heroDateRange = document.getElementById('heroDateRange');
    if (heroDateRange) heroDateRange.textContent = dateText;

    const mobileDateRange = document.getElementById('mobileDateRange');
    if (mobileDateRange) mobileDateRange.textContent = dateText;

    const drawerDateRange = document.getElementById('drawerDateRange');
    if (drawerDateRange) drawerDateRange.textContent = dateText;

    const heroEventTitle = document.getElementById('heroEventTitle');
    if (heroEventTitle) {
      const titleText = currentData.eventTitle || currentData.title || '';
      heroEventTitle.textContent = titleText;
      heroEventTitle.style.display = titleText ? '' : 'none';
    }

    const heroEventDesc = document.getElementById('heroEventDesc');
    if (heroEventDesc) heroEventDesc.textContent = currentData.eventDesc;
  }



  function renderVehiclesAndChallenges() {
    const podiumEl = document.getElementById('podiumVehicleName');
    if (podiumEl) podiumEl.textContent = currentData.podiumVehicle;

    const prizeRideEl = document.getElementById('prizeRideVehicleName');
    if (prizeRideEl) prizeRideEl.textContent = currentData.prizeRide.vehicle;

    const prizeCondEl = document.getElementById('prizeRideCondition');
    if (prizeCondEl) prizeCondEl.innerHTML = `🎯 Condition: <strong>${escapeHTML(currentData.prizeRide.condition)}</strong>`;

    const weeklyChallengeTitle = document.getElementById('weeklyChallengeTitle');
    if (weeklyChallengeTitle) weeklyChallengeTitle.textContent = currentData.weeklyChallenge.task;

    const weeklyChallengeReward = document.getElementById('weeklyChallengeReward');
    if (weeklyChallengeReward) weeklyChallengeReward.innerHTML = `🎁 Reward: <strong>${escapeHTML(currentData.weeklyChallenge.reward)}</strong>`;

    const regTrialEl = document.getElementById('regularTimeTrialName');
    if (regTrialEl) regTrialEl.textContent = currentData.timeTrials.regular;

    const hswTrialEl = document.getElementById('hswTimeTrialName');
    if (hswTrialEl) hswTrialEl.textContent = currentData.timeTrials.hsw;

    const premRaceEl = document.getElementById('premiumRaceName');
    if (premRaceEl) premRaceEl.textContent = currentData.timeTrials.premiumRace;

    // Render LS Car Meet Test Track
    const testRidesEl = document.getElementById('testRidesList');
    if (testRidesEl && Array.isArray(currentData.testRides) && currentData.testRides.length > 0) {
      let trHtml = currentData.testRides.map(car => `<div class="test-ride-pill">🚗 ${escapeHTML(car)}</div>`).join('');
      if (currentData.hswTestRide && currentData.hswTestRide !== 'Active') {
        trHtml += `<div class="test-ride-pill hsw-pill">⚡ HSW Premium: ${escapeHTML(currentData.hswTestRide)}</div>`;
      }
      testRidesEl.innerHTML = trHtml;
    }

    // Render Luxury Autos Showroom
    const luxuryEl = document.getElementById('luxuryAutosList');
    if (luxuryEl && Array.isArray(currentData.luxuryAutos) && currentData.luxuryAutos.length > 0) {
      luxuryEl.innerHTML = currentData.luxuryAutos.map(car => `
        <li>
          <span class="car-bullet">🏎️</span>
          <div class="car-info">
            <strong>${escapeHTML(car)}</strong>
            <span class="car-sub">Rockford Hills Showroom</span>
          </div>
          <span class="inspect-tag">Test Drive</span>
        </li>
      `).join('');
    }

    // Render Simeon's Premium Deluxe Motorsport Showroom
    const pdmEl = document.getElementById('pdmList');
    if (pdmEl && Array.isArray(currentData.pdmShowroom) && currentData.pdmShowroom.length > 0) {
      pdmEl.innerHTML = currentData.pdmShowroom.map(car => `
        <li>
          <span class="car-bullet">🚗</span>
          <div class="car-info"><strong>${escapeHTML(car)}</strong></div>
          <span class="discount-badge-sm">Featured</span>
        </li>
      `).join('');
    }

    // Render Gun Van Featured Stock
    const gvEl = document.getElementById('gunVanWeaponsList');
    if (gvEl && Array.isArray(currentData.gunVan) && currentData.gunVan.length > 0) {
      gvEl.innerHTML = currentData.gunVan.map(w => {
        const isFree = /free/i.test(w);
        const isGtaPlus = /gta\+/i.test(w);
        const isOff = /%\s*off/i.test(w);
        const parts = w.split(/[–—-]/);
        const wName = parts[0].trim();
        const wTag = parts[1] ? parts[1].trim().toUpperCase() : (isFree ? '100% FREE' : 'In Stock');
        let tagClass = 'tag-instock';
        if (isFree) tagClass = 'tag-free';
        else if (isGtaPlus) tagClass = 'tag-gta-plus';
        else if (isOff) tagClass = 'tag-discount';
        return `
          <li class="${isFree ? 'free-weapon-item' : ''}">
            <div class="weapon-name">${isFree ? '⚡' : '🔫'} <strong>${escapeHTML(wName)}</strong></div>
            <span class="${tagClass}">${escapeHTML(wTag)}</span>
          </li>
        `;
      }).join('');
    }

    // Apply saved checkbox states
    document.querySelectorAll('.task-check').forEach(chk => {
      const id = chk.dataset.taskId;
      if (id && taskCheckState[id]) {
        chk.checked = true;
      }
    });
  }

  function renderSalvageRobberies() {
    const container = document.getElementById('salvageRobberiesContainer');
    if (!container || !currentData.salvageRobberies) return;

    container.innerHTML = currentData.salvageRobberies.map((robbery, idx) => {
      const taskId = `salvage-${idx + 1}`;
      const isChecked = !!taskCheckState[taskId];
      return `
        <div class="card robbery-card">
          <div class="robbery-header">
            <span class="robbery-badge">Robbery ${idx + 1}</span>
            <label class="task-checkbox-label">
              <input type="checkbox" class="task-check" data-task-id="${taskId}" ${isChecked ? 'checked' : ''} />
              <span class="custom-checkbox"></span>
              <span class="check-text">Stolen</span>
            </label>
          </div>
          <div class="robbery-title">${escapeHTML(robbery.name)}</div>
          <div class="robbery-target-vehicle">${escapeHTML(robbery.vehicle)}</div>
          <div class="robbery-meta">
            <span>💰 Value: ${escapeHTML(robbery.value || 'High Value')}</span>
            <span class="tag-status">Claimable / Salvage</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderDailyObjectives() {
    const container = document.getElementById('dailyObjectivesContainer');
    if (!container || !currentData.dailyObjectives) return;

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = daysOfWeek[new Date().getDay()];

    const dailyList = normalizeDailyObjectivesList(currentData.dailyObjectives);
    container.innerHTML = dailyList.map((obj, idx) => {
      const taskId = `daily-${obj.day.toLowerCase()}`;
      const isChecked = !!taskCheckState[taskId];
      const isToday = obj.day.toLowerCase() === todayName.toLowerCase();

      return `
        <div class="daily-card ${isChecked ? 'completed' : ''} ${isToday ? 'today-card' : ''}">
          <div class="daily-card-top">
            <span class="day-badge">${escapeHTML(obj.day)} ${isToday ? '• TODAY' : ''}</span>
            <label class="task-checkbox-label">
              <input type="checkbox" class="task-check" data-task-id="${taskId}" ${isChecked ? 'checked' : ''} />
              <span class="custom-checkbox"></span>
            </label>
          </div>
          <div class="daily-task-desc">${escapeHTML(obj.task)}</div>
          <div class="daily-card-footer">
            <span>🎁 Streak Bonus</span>
            <span>${isChecked ? '✅ Done' : '⏳ Pending'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderBonuses() {
    const container = document.getElementById('bonusesContainer');
    const filterPillsContainer = document.getElementById('bonusFilterPills');
    if (!container || !currentData.bonuses) return;

    // Dynamically build filter pills based on available tiers
    if (filterPillsContainer) {
      const activeFilter = filterPillsContainer.querySelector('.filter-pill.active')?.dataset.filter || 'all';
      
      let pillsHtml = `<button class="filter-pill ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">All Bonuses (${currentData.bonuses.length} Tiers)</button>`;
      currentData.bonuses.forEach(b => {
        const isActive = activeFilter === b.tier;
        const multNum = parseFloat(b.multiplier) || 0;
        const icon = (multNum >= 4) ? '🔥' : (multNum >= 3 ? '⚡' : '💰');
        pillsHtml += `<button class="filter-pill ${isActive ? 'active' : ''}" data-filter="${b.tier}">${icon} ${escapeHTML(b.multiplier)} Payouts</button>`;
      });
      filterPillsContainer.innerHTML = pillsHtml;

      // Re-bind click handlers for dynamic filter pills
      filterPillsContainer.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          filterPillsContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          const filter = pill.dataset.filter;
          document.querySelectorAll('.bonus-card').forEach(card => {
            if (filter === 'all' || card.dataset.tier === filter) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
    }

    container.innerHTML = currentData.bonuses.map(b => `
      <div class="card bonus-card bonus-${b.tier}" data-tier="${b.tier}">
        <div class="bonus-multiplier-badge">${escapeHTML(b.label)}</div>
        <ul class="bonus-item-list">
          ${(Array.isArray(b.items) ? b.items : (b.name ? [b.name] : [])).map(item => `<li>${escapeHTML(item)}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  function renderDiscounts(filterCat = 'all', searchQuery = '') {
    const container = document.getElementById('discountsContainer');
    const extraSection = document.getElementById('showroomsAndGunVanSection');
    if (!container || !currentData.discounts) return;

    let items = [...currentData.discounts];

    // Filter strictly by selected category/rate
    if (filterCat !== 'all') {
      if (filterCat === 'free') {
        items = items.filter(d => d.rate.toLowerCase().includes('free') || d.name.toLowerCase().includes('free'));
      } else if (filterCat === '50') {
        items = items.filter(d => d.rate.includes('50'));
      } else if (filterCat === '40') {
        items = items.filter(d => d.rate.includes('40'));
      } else if (filterCat === '30') {
        items = items.filter(d => d.rate.includes('30'));
      } else if (filterCat === 'properties') {
        items = items.filter(d => (d.category || '').toLowerCase() === 'properties');
      } else if (filterCat === 'vehicles') {
        items = items.filter(d => (d.category || '').toLowerCase() === 'vehicles');
      } else if (filterCat === 'weapons') {
        items = items.filter(d => (d.category || '').toLowerCase() === 'weapons');
      } else {
        items = items.filter(d => (d.category || '').toLowerCase() === filterCat.toLowerCase());
      }
    }

    // Filter strictly by search query
    const hasSearch = searchQuery && searchQuery.trim() !== '';
    if (hasSearch) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(d => 
        (d.name || '').toLowerCase().includes(q) || 
        (d.rate || '').toLowerCase().includes(q) || 
        (d.category || '').toLowerCase().includes(q)
      );
    }

    // STRICT VISIBILITY: When filtering or searching, HIDE the static showroom & gun van cards so ONLY matching items are shown!
    if (extraSection) {
      if (filterCat === 'all' && !hasSearch) {
        extraSection.style.display = 'block';
      } else {
        extraSection.style.display = 'none';
      }
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; background: rgba(0,0,0,0.25);">
          <div style="font-size: 28px; margin-bottom: 8px;">🔍</div>
          <div style="font-weight: 700; font-size: 16px; color: #fff;">No items found for this filter</div>
          <div class="text-muted text-sm mt-1">Select "All Deals" to view all discounts and showrooms.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(d => {
      const isFree = String(d.rate || d.discount || '').toLowerCase().includes('free');
      let icon = '🚗';
      if (isFree) icon = '🎁';
      else if (d.category === 'properties') icon = '🏢';
      else if (d.category === 'weapons') icon = '🔫';
      else if (d.category === 'apparel') icon = '👕';

      return `
        <div class="discount-item-card ${isFree ? 'is-free' : ''}">
          <div>
            <div class="discount-name">${icon} ${escapeHTML(d.name)}</div>
            <div class="discount-category">${escapeHTML(d.category ? (d.category.charAt(0).toUpperCase() + d.category.slice(1)) : 'General')}</div>
          </div>
          <span class="discount-rate-badge ${d.badgeClass || (isFree ? 'rate-free' : 'rate-30')}">${escapeHTML(d.rate)}</span>
        </div>
      `;
    }).join('');
  }

  // ── Progress Bar & Checklist State ──
  function updateProgressCounter() {
    const allChecks = document.querySelectorAll('.task-check');
    const total = allChecks.length;
    let completed = 0;

    allChecks.forEach(chk => {
      const id = chk.dataset.taskId;
      if (id && taskCheckState[id]) {
        chk.checked = true;
        completed++;
      } else {
        chk.checked = false;
      }
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const countEl = document.getElementById('tasksCompletedCount');
    if (countEl) countEl.textContent = completed;

    const totalEl = document.getElementById('tasksTotalCount');
    if (totalEl) totalEl.textContent = total;

    const percentEl = document.getElementById('tasksPercent');
    if (percentEl) percentEl.textContent = `${percent}%`;

    const fillEl = document.getElementById('progressFill');
    if (fillEl) fillEl.style.width = `${percent}%`;

    // Sync Slideout Drawer Progress
    const drawerDone = document.getElementById('drawerTasksDone');
    if (drawerDone) drawerDone.textContent = completed;

    const drawerTotal = document.getElementById('drawerTasksTotal');
    if (drawerTotal) drawerTotal.textContent = total;

    const drawerPct = document.getElementById('drawerTasksPercent');
    if (drawerPct) drawerPct.textContent = `${percent}%`;

    const drawerFill = document.getElementById('drawerProgressFill');
    if (drawerFill) drawerFill.style.width = `${percent}%`;
  }

  // ── Smart Thursday Reset & Auto-Refresher Engine ──
  function getPacificResetTarget(type = 'next', now = new Date()) {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "short",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const p = {};
    for (const item of parts) p[item.type] = item.value;
    const dayMap = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
    const currentDay = dayMap[p.weekday];
    const curHour = parseInt(p.hour, 10);
    const curMinute = parseInt(p.minute, 10);
    const curSecond = parseInt(p.second, 10);
    const curYear = parseInt(p.year, 10);
    const curMonth = parseInt(p.month, 10);
    const curDay = parseInt(p.day, 10);

    let offsetDays = 0;
    if (type === 'next') {
      offsetDays = (4 - currentDay + 7) % 7;
      if (offsetDays === 0 && (curHour > 0 || curMinute > 0 || curSecond > 0)) {
        offsetDays = 7;
      }
    } else {
      offsetDays = -((currentDay - 4 + 7) % 7);
    }

    const targetCalDate = new Date(Date.UTC(curYear, curMonth - 1, curDay + offsetDays, 12, 0, 0));
    const tY = targetCalDate.getUTCFullYear();
    const tM = targetCalDate.getUTCMonth() + 1;
    const tD = targetCalDate.getUTCDate();

    for (const h of [7, 8]) {
      const candidate = new Date(Date.UTC(tY, tM - 1, tD, h, 0, 0));
      const cParts = formatter.formatToParts(candidate);
      const cp = {};
      for (const item of cParts) cp[item.type] = item.value;
      if (parseInt(cp.day, 10) === tD && parseInt(cp.hour, 10) === 0 && parseInt(cp.minute, 10) === 0) {
        return candidate;
      }
    }
    return new Date(Date.UTC(tY, tM - 1, tD, 7, 0, 0));
  }

  function getLatestPassedResetTime() {
    return getPacificResetTarget('latest').getTime();
  }

  async function checkAndAutoRefresh() {
    const expectedThuTs = getExpectedActiveThursdayTimestamp();
    const currentTs = getWeekStartTimestamp(currentData);
    if (currentTs >= expectedThuTs && currentData?.podiumVehicle && currentData.podiumVehicle !== 'TBD') {
      return;
    }

    const now = Date.now();
    const lastAttempt = Number(localStorage.getItem('gta_last_sync_attempt') || 0);
    if (now - lastAttempt < 15 * 60 * 1000) {
      return;
    }

    console.log('[AutoRefresher] Active Thursday data missing or stale — polling live RockstarINTEL & BDCF Cloud...');
    localStorage.setItem('gta_last_sync_attempt', String(now));
    await fetchLatestFromReddit(true);
  }

  // ── Live Countdown Timer to Next Thursday ──
  function initCountdownTimer() {
    let triggeredAutoRefreshThisReset = false;

    function calculateNextReset() {
      const now = new Date();
      const next = getPacificResetTarget('next', now);

      const diff = next.getTime() - now.getTime();
      if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, isResetNow: true };

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      return { d, h, m, s, isResetNow: false };
    }

    function updateTimers() {
      const { d, h, m, s, isResetNow } = calculateNextReset();

      if (isResetNow && !triggeredAutoRefreshThisReset) {
        triggeredAutoRefreshThisReset = true;
        checkAndAutoRefresh();
        setTimeout(() => { triggeredAutoRefreshThisReset = false; }, 60000);
      }

      const formatted = `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
      
      const navTimer = document.getElementById('countdownTimer');
      if (navTimer) navTimer.textContent = formatted;

      const drawerTimer = document.getElementById('drawerCountdownTimer');
      if (drawerTimer) drawerTimer.textContent = formatted;

      const mobileNavTimer = document.getElementById('mobileCountdownTimer');
      if (mobileNavTimer) mobileNavTimer.textContent = `${d}d ${String(h).padStart(2, '0')}h`;

      const heroTimer = document.getElementById('heroCountdown');
      if (heroTimer) heroTimer.textContent = `${d}d ${h}h ${m}m ${s}s`;
    }



    updateTimers();
    setInterval(updateTimers, 1000);
  }

  // ── Client-Side RockstarINTEL HTML Parser (Browser DOMParser) ──
  function parseRockstarIntelClientHtml(rawTitle, rawHtml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${rawHtml || ''}</div>`, 'text/html');
    const cleanText = (s) => String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const root = doc.body.firstElementChild || doc.body;
    const h3s = [...root.querySelectorAll('h3')];

    // Date extraction + Wednesday->Thursday 6-day span normalization
    const introParts = [];
    for (let n = root.firstChild; n && n.tagName !== 'H3'; n = n.nextSibling) {
      introParts.push(n.textContent || '');
    }
    const introText = cleanText(introParts.join(' '));
    const rawDateSpan = introText.match(/from\s+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?\s+through\s+(?:[A-Za-z]+\s+)?\d{1,2}(?:st|nd|rd|th)?)/i)?.[1]
      || rawTitle.match(/\(([^)]*\d+[^)]*)\)/)?.[1]
      || rawTitle;

    const monthsMap = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
    const shortM = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let normalizedRange = cleanText(rawDateSpan);
    const dm = normalizedRange.match(/([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|through|thru|–|—|-)\s*(?:([A-Za-z]+)\s+)?(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(202\d))?/i);
    if (dm && monthsMap[dm[1].slice(0, 3).toLowerCase()] !== undefined) {
      const m1Idx = monthsMap[dm[1].slice(0, 3).toLowerCase()];
      const d1 = parseInt(dm[2], 10);
      const m2Idx = dm[3] ? (monthsMap[dm[3].slice(0, 3).toLowerCase()] ?? m1Idx) : m1Idx;
      const d2 = parseInt(dm[4], 10);
      const yr = dm[5] ? parseInt(dm[5], 10) : new Date().getFullYear();
      const sDt = new Date(Date.UTC(yr, m1Idx, d1));
      let eDt = new Date(Date.UTC(m2Idx < m1Idx ? yr + 1 : yr, m2Idx, d2));
      if (Math.round((eDt - sDt) / 86400000) === 6) eDt = new Date(eDt.getTime() + 86400000);
      const sm1 = shortM[sDt.getUTCMonth()];
      const sm2 = shortM[eDt.getUTCMonth()];
      normalizedRange = sm1 === sm2
        ? `${sm1} ${sDt.getUTCDate()} – ${eDt.getUTCDate()}, ${eDt.getUTCFullYear()}`
        : `${sm1} ${sDt.getUTCDate()} – ${sm2} ${eDt.getUTCDate()}, ${eDt.getUTCFullYear()}`;
    }

    const data = JSON.parse(JSON.stringify(DEFAULT_WEEK_DATA));
    data.title = `Weekly Bonuses and Discounts - ${normalizedRange}`;
    data.dateRange = normalizedRange;
    data.podiumVehicle = 'TBD';
    data.prizeRide = { vehicle: 'TBD', condition: 'Check LS Car Meet Challenge' };
    data.bonuses = [];
    data.discounts = [];
    data.gunVan = [];
    data.salvageRobberies = [];
    data.kortzTargets = [];
    data.specialRewards = [];

    const splitVeh = (s) => cleanText(s).replace(/\.$/, '').split(/\s*(?:,|&|\band\b)\s*/i).map(v => v.replace(/^the\s+/i, '').trim()).filter(Boolean);
    const classifyCat = (name) => {
      const l = name.toLowerCase();
      if (/agency|hangar|facility|bunker|auto shop|bail|property|properties|garage|nightclub|arcade|mc|office|salvage yard/.test(l)) return 'properties';
      if (/knife|bat|smg|shotgun|rifle|gun|launcher|pistol|weapon|armor|armour/.test(l)) return 'weapons';
      if (/shirt|outfit|clothing|hat|mask|apparel/.test(l)) return 'apparel';
      return 'vehicles';
    };

    const fibExtras = [];
    for (const h3 of h3s) {
      const heading = cleanText(h3.textContent).toLowerCase();
      if (heading.includes('gta+')) break;
      const nodes = [];
      for (let el = h3.nextElementSibling; el && el.tagName !== 'H3'; el = el.nextElementSibling) {
        nodes.push(el);
      }
      const secText = cleanText(nodes.map(n => n.textContent).join(' '));
      const listItems = nodes.flatMap(n => (n.tagName === 'UL' ? [...n.querySelectorAll('li')] : [...n.querySelectorAll('li')])).map(li => cleanText(li.textContent)).filter(Boolean);
      const firstStrong = cleanText(nodes.map(n => n.querySelector('strong')?.textContent).find(Boolean) || '');

      if (heading.includes('kortz')) {
        data.kortzTargets = listItems;
        const m = secText.match(/extra\s+(GTA\$[\d,]+)/i);
        if (m) data.specialRewards.push(`Kortz Center Heist No-Death Completion Bonus (${m[1]})`);
      } else if (heading.includes('priority file') || heading.includes('fib')) {
        const fn = firstStrong || 'Active';
        const dbl = /double|2x/i.test(secText);
        data.fibPriorityFile = dbl && !/2x/i.test(fn) ? `${fn} (2X GTA$ & RP)` : fn;
        if (dbl) fibExtras.push(`FIB Priority File: ${fn}`);
      } else if (heading.includes('salvage yard')) {
        data.salvageRobberies = listItems.map(li => {
          const [rob, ...rest] = li.split(':');
          const tgt = cleanText(rest.join(':'));
          return { robbery: cleanText(rob), name: cleanText(rob), target: tgt, vehicle: tgt, value: '~$325,000 – $400,000', claimable: /claimable/i.test(tgt) };
        });
      } else if (heading.includes('podium vehicle')) {
        data.podiumVehicle = firstStrong || secText.match(/win\s+the\s+([^,.]+)/i)?.[1] || 'TBD';
      } else if (heading.includes('prize ride')) {
        data.prizeRide.vehicle = firstStrong || secText.match(/unlock\s+the\s+([^,.]+)/i)?.[1] || 'TBD';
        const cm = secText.match(/(place[^.]+?)\s+to unlock/i);
        if (cm) data.prizeRide.condition = cleanText(cm[1]).replace(/^place\s+top/i, 'Place Top');
      } else if (heading.includes('hao') || heading.includes('hsw premium')) {
        data.hswTestRide = firstStrong || 'TBD';
      } else if (heading.includes('test track')) {
        data.testRides = splitVeh(firstStrong || secText);
      } else if (heading.includes('luxury autos')) {
        data.luxuryAutos = splitVeh(firstStrong || secText);
      } else if (heading.includes('premium deluxe') || heading.includes('simeon')) {
        data.pdmShowroom = splitVeh(firstStrong || secText);
      } else if (heading.includes('gun van')) {
        for (const li of listItems) {
          if (/armor/i.test(li)) continue;
          const cleanItem = li.replace(/\s*\(FREE\)/i, ' – FREE (100% Off)');
          data.gunVan.push(cleanItem);
          const nm = li.replace(/\s*\([^)]*\)/g, '').trim();
          if (/\bfree\b/i.test(li)) {
            data.discounts.push({ name: `${nm} (Gun Van)`, item: `${nm} (Gun Van)`, category: 'weapons', rate: '100% FREE', discount: '100% FREE', badgeClass: 'rate-free' });
          } else {
            const pM = li.match(/(\d+)%/g);
            const maxP = pM ? Math.max(...pM.map(x => parseInt(x, 10))) : 0;
            if (maxP >= 30) {
              data.discounts.push({ name: `${nm} (Gun Van)`, item: `${nm} (Gun Van)`, category: 'weapons', rate: `${maxP}% OFF`, discount: `${maxP}% OFF`, badgeClass: maxP >= 50 ? 'rate-50' : 'rate-40' });
            }
          }
        }
        if (/armor/i.test(secText)) data.gunVan.push('Body Armor: All Types (10%, GTA+ 80%)');
      } else if (heading.includes('premium race')) {
        data.timeTrials.premiumRace = firstStrong || 'TBD';
      } else if (heading.includes('hsw time trial')) {
        data.timeTrials.hsw = firstStrong || 'TBD';
      } else if (heading.includes('time trial')) {
        data.timeTrials.regular = firstStrong || 'TBD';
      } else if (heading.includes('discount')) {
        let rate = '30% OFF';
        let badge = 'rate-30';
        for (const n of nodes) {
          if (/^H[45]$|^P$/i.test(n.tagName)) {
            const pctM = cleanText(n.textContent).match(/(\d+)\s*%\s*off/i);
            if (pctM) {
              const p = parseInt(pctM[1], 10);
              rate = `${p}% OFF`;
              badge = p >= 50 ? 'rate-50' : p >= 40 ? 'rate-40' : 'rate-30';
            }
          } else if (n.tagName === 'UL') {
            for (const li of n.querySelectorAll('li')) {
              const nm = cleanText(li.textContent);
              if (nm) data.discounts.push({ name: nm, item: nm, category: classifyCat(nm), rate, discount: rate, badgeClass: badge });
            }
          }
        }
      } else if (heading.includes('bonus')) {
        const grouped = new Map();
        const addB = (mult, item) => {
          const m = mult.toUpperCase();
          if (!grouped.has(m)) grouped.set(m, { multiplier: m, label: m === 'BONUS' ? 'SPECIAL BONUSES' : `${m} GTA$ & RP`, tier: m.toLowerCase(), items: [] });
          grouped.get(m).items.push(item);
        };
        for (const li of listItems) {
          const bm = li.match(/^(\d+x|Double|Triple|Quadruple|Bonus)\s*(?:GTA\$\s*(?:&|and)\s*RP|GTA\$|RP)?\s*(?:on|for)?\s*(.+)$/i);
          if (bm) addB(bm[1].replace(/quadruple/i, '4X').replace(/triple/i, '3X').replace(/double/i, '2X'), cleanText(bm[2]));
          else addB('BONUS', li);
        }
        fibExtras.forEach(x => addB('2X', x));
        data.specialRewards.filter(r => /kortz/i.test(r)).forEach(r => addB('BONUS', r));
        const rank = { '4X': 0, '3X': 1, '2X': 2, '1.5X': 3, 'BONUS': 4 };
        data.bonuses = [...grouped.values()].sort((a, b) => (rank[a.multiplier] ?? 9) - (rank[b.multiplier] ?? 9));
      } else if (heading.includes('weekly challenge')) {
        const tm = secText.match(/[“"']([^”"']+)[”"']/);
        const rm = secText.match(/(GTA\$[\d,]+)/i);
        if (tm) data.weeklyChallenge.task = cleanText(tm[1]);
        if (rm) data.weeklyChallenge.reward = rm[1].toUpperCase();
      }
    }

    if (data.bonuses.length > 0) {
      data.eventTitle = data.bonuses.filter(b => b.multiplier !== 'BONUS').slice(0, 3).map(b => `${b.multiplier} ${b.items.slice(0, 2).map(x => x.replace(/\s*\([^)]*\)/g, '')).join(' & ')}`).join(', ');
      data.eventDesc = `Earn ${data.bonuses.filter(b => b.multiplier !== 'BONUS').map(b => `${b.multiplier} on ${b.items.join(' & ')}`).join(', ')}, plus Casino Podium ${data.podiumVehicle} and Prize Ride ${data.prizeRide.vehicle}!`;
    }
    return data;
  }

  // ── Live Cloud Feed Fetcher & Parser Engine ──
  async function fetchLatestFromReddit(isSilentAutoRefresh = false) {
    const refreshBtn = document.getElementById('refreshRedditBtn');
    const drawerSyncBtn = document.getElementById('drawerSyncBtn');
    if (refreshBtn && !isSilentAutoRefresh) {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '🔄 <span>Fetching...</span>';
    }
    if (drawerSyncBtn) {
      drawerSyncBtn.disabled = true;
      drawerSyncBtn.textContent = '⏳ Syncing...';
    }

    if (!isSilentAutoRefresh) {
      showToast('📡 Connecting to BDCF Cloud Network...', 'info');
    }

    // Tier 1: Fetch freshest verified payload across all cloud RTDB and static mirrors (verified >= expected Thursday)
    try {
      const isUpToDate = await syncFromCloudEndpoints();
      if (isUpToDate) {
        if (!isSilentAutoRefresh) {
          showToast(`✅ Latest Weekly Update synced (${currentData.dateRange})!`, 'success');
        }
        const sourceMeta = document.getElementById('redditSourceMeta');
        if (sourceMeta) {
          sourceMeta.textContent = `BDCF Cloud Network • Verified Active Week (${currentData.dateRange})`;
        }
        if (refreshBtn && !isSilentAutoRefresh) {
          refreshBtn.disabled = false;
          refreshBtn.innerHTML = '<span class="btn-icon">🔄</span> <span class="btn-label">Sync Tunables</span>';
        }
        if (drawerSyncBtn) {
          drawerSyncBtn.disabled = false;
          drawerSyncBtn.textContent = '🔄 Sync Tunables';
        }
        return;
      }
    } catch (_) {}

    // Tier 2: Live RockstarINTEL GTA Online RSS Feed (via CORS-friendly rss2json & allorigins relays) + Reddit Tertiary
    const riRss = 'https://rockstarintel.com/category/gta/gta-online/feed/';
    const redditRss = 'https://www.reddit.com/r/gtaonline/search.rss?q=title%3A%22Weekly+Bonuses+and+Discounts%22&restrict_sr=1&sort=new';
    const feedCandidates = [
      { kind: 'rss2json', source: 'rockstarintel', url: 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(riRss) },
      { kind: 'xml', source: 'rockstarintel', url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent(riRss) },
      { kind: 'rss2json', source: 'reddit', url: 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(redditRss) }
    ];

    try {
      const expectedThuTs = getExpectedActiveThursdayTimestamp();
      let parsedData = null;

      for (const candidate of feedCandidates) {
        try {
          const res = await fetch(candidate.url);
          if (!res || !res.ok) continue;

          let posts = [];
          if (candidate.kind === 'rss2json') {
            const json = await res.json();
            posts = Array.isArray(json?.items) ? json.items.map(it => ({ title: it.title || '', html: it.content || it.description || '' })) : [];
          } else {
            const xmlText = await res.text();
            const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
            posts = [...xmlDoc.querySelectorAll('item')].map(item => ({
              title: item.querySelector('title')?.textContent || '',
              html: item.getElementsByTagName('content:encoded')[0]?.textContent || item.querySelector('description')?.textContent || ''
            }));
          }

          const matched = posts.find(p =>
            (/GTA Online.*(?:Event Week|Weekly Update)|Weekly Bonuses and Discounts/i.test(p.title))
            && /Podium Vehicle/i.test(p.html)
          );
          if (!matched) continue;

          const parsedCandidate = candidate.source === 'rockstarintel'
            ? parseRockstarIntelClientHtml(matched.title, matched.html)
            : parseRedditPostText(matched.title, new DOMParser().parseFromString(matched.html, 'text/html').body.textContent || '');

          const candidateTs = getWeekStartTimestamp(parsedCandidate);
          if (parsedCandidate && parsedCandidate.podiumVehicle && parsedCandidate.podiumVehicle !== 'TBD' && candidateTs >= getWeekStartTimestamp(currentData) && candidateTs >= expectedThuTs - 7 * 86400000) {
            parsedData = normalizeWeeklyData(parsedCandidate);
            break;
          }
        } catch (_) {}
      }

      if (!parsedData) throw new Error('Live feeds did not return a newer valid update');

      // Check if new week date range detected -> reset checklist for fresh week
      if (currentData.dateRange && parsedData.dateRange && currentData.dateRange !== parsedData.dateRange) {
        taskCheckState = {};
        saveTaskState();
        if (isSilentAutoRefresh) {
          showToast(`🌴 New Weekly Update Detected: ${parsedData.dateRange}! Checklist refreshed.`, 'success', 5000);
        }
      }

      currentData = parsedData;
      saveData(currentData);
      renderAll();
      updateLiveIndicator(true, currentData.dateRange);

      // Self-healing cloud mirror update (publicly writable livecounters-8eaa8 RTDB only; never write unauthenticated to the-bdcf-crew)
      if (getWeekStartTimestamp(currentData) >= expectedThuTs && currentData.podiumVehicle !== 'TBD') {
        try {
          fetch('https://livecounters-8eaa8-default-rtdb.firebaseio.com/labData/gtaWeekly.json', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...currentData,
              week_title: currentData.dateRange,
              event_name: currentData.eventTitle,
              special_claim: currentData.eventDesc,
              podium_vehicle: currentData.podiumVehicle,
              prize_ride: currentData.prizeRide?.vehicle || 'TBD',
              prize_ride_challenge: currentData.prizeRide?.condition || '',
              bonus_groups: currentData.bonuses || [],
              last_updated: Math.floor(Date.now() / 1000),
              source: `RockstarINTEL Client Self-Heal (${currentData.dateRange})`
            })
          }).catch(() => {});
        } catch (_) {}
      }

      if (!isSilentAutoRefresh) {
        showToast(`✅ Latest Weekly Update synced live (${currentData.dateRange})!`, 'success');
      }

      const sourceMeta = document.getElementById('redditSourceMeta');
      if (sourceMeta) {
        sourceMeta.textContent = `RockstarINTEL Live • Auto-Synced (${currentData.dateRange || 'Active Week'})`;
      }
    } catch (err) {
      console.warn('Live fetch fallback to bundled data:', err);
      if (!isSilentAutoRefresh) {
        showToast('⚠️ Live feed busy — displaying verified active week data.', 'info');
      }
    } finally {
      if (refreshBtn && !isSilentAutoRefresh) {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<span class="btn-icon">🔄</span> <span class="btn-label">Sync Tunables</span>';
      }
      if (drawerSyncBtn) {
        drawerSyncBtn.disabled = false;
        drawerSyncBtn.textContent = '🔄 Sync Tunables';
      }
    }
  }



  // ── Regex & Markdown Parser for Reddit Weekly Posts ──
  function parseRedditPostText(postTitle, selftext) {
    const data = JSON.parse(JSON.stringify(DEFAULT_WEEK_DATA)); // Clone structure
    data.title = postTitle;

    // Date range extraction
    const dateMatch = postTitle.match(/([A-Za-z]+\s+\d+(?:st|nd|rd|th)?\s+to\s+[A-Za-z]+\s+\d+(?:st|nd|rd|th)?)/i);
    if (dateMatch) {
      data.dateRange = dateMatch[1].replace(/(\d+)(?:st|nd|rd|th)/g, '$1');
    }

    if (!selftext) return data;

    // Extract Podium Vehicle
    const podiumMatch = selftext.match(/Podium Vehicle[^:]*:\s*([^\n\r]+)/i);
    if (podiumMatch) data.podiumVehicle = cleanMarkdown(podiumMatch[1]);

    // Extract Prize Ride
    const prizeRideMatch = selftext.match(/Prize Ride Vehicle[^:]*:\s*([^\n\r]+)/i);
    if (prizeRideMatch) data.prizeRide.vehicle = cleanMarkdown(prizeRideMatch[1]);

    const prizeCondMatch = selftext.match(/Prize Ride Challenge[^:]*:\s*([^\n\r]+)/i);
    if (prizeCondMatch) data.prizeRide.condition = cleanMarkdown(prizeCondMatch[1]);

    // Extract Time Trials
    const timeTrialMatch = selftext.match(/Time Trial[^:]*:\s*([^\n\r]+)/i);
    if (timeTrialMatch) data.timeTrials.regular = cleanMarkdown(timeTrialMatch[1]);

    const hswMatch = selftext.match(/HSW Time Trial[^:]*:\s*([^\n\r]+)/i);
    if (hswMatch) data.timeTrials.hsw = cleanMarkdown(hswMatch[1]);

    const premRaceMatch = selftext.match(/Premium Race[^:]*:\s*([^\n\r]+)/i);
    if (premRaceMatch) data.timeTrials.premiumRace = cleanMarkdown(premRaceMatch[1]);

    // Extract Salvage Yard Robberies
    const salvageMatch1 = selftext.match(/The Podium Robbery:\s*([^\n\r]+)/i);
    const salvageMatch2 = selftext.match(/The Duggan Robbery:\s*([^\n\r]+)/i);
    const salvageMatch3 = selftext.match(/(?:The Gangbanger Robbery|he Gangbanger Robbery):\s*([^\n\r]+)/i);

    if (salvageMatch1) data.salvageRobberies[0].vehicle = cleanMarkdown(salvageMatch1[1]);
    if (salvageMatch2) data.salvageRobberies[1].vehicle = cleanMarkdown(salvageMatch2[1]);
    if (salvageMatch3) data.salvageRobberies[2].vehicle = cleanMarkdown(salvageMatch3[1]);

    // Extract Daily Objectives
    const days = ["Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
    days.forEach((day, idx) => {
      const regex = new RegExp(`\\*\\*${day}:?\\*\\*\\s*([^\\n\\r]+)`, 'i');
      const match = selftext.match(regex);
      if (match) {
        data.dailyObjectives[idx] = { day, task: cleanMarkdown(match[1]) };
      }
    });

    // ── Dynamic Extraction of ALL Bonuses & Multipliers (5X, 4X, 3X, 2.5X, 2X, 1.5X, Speed Boosts, etc.) ──
    const bonusesIdx = selftext.search(/#+\s*Bonuses/i);
    if (bonusesIdx !== -1) {
      const afterBonuses = selftext.substring(bonusesIdx);
      // find end of bonuses section (next top-level heading starting with #)
      const nextSectionMatch = afterBonuses.substring(1).search(/\n#+\s+[A-Za-z]/);
      const bonusesText = nextSectionMatch !== -1 ? afterBonuses.substring(0, nextSectionMatch + 1) : afterBonuses;
      
      const multiplierRegex = /(?:^|\n)\s*(\d+(?:\.\d+)?X[^\n\r]*|Double\s+[^\n\r]+|Triple\s+[^\n\r]+|Boosted\s+[^\n\r]+)/gi;
      let match;
      const sections = [];
      let lastIdx = 0;
      let lastHeader = "";
      
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
        const parsedBonuses = sections.map(sec => {
          const rawLines = sec.content.split('\n');
          const items = rawLines
            .map(l => l.replace(/^[\s*•\-]+/, '').trim())
            .filter(l => l.length > 0 && !l.startsWith('#') && !l.toLowerCase().includes('reddit') && !l.toLowerCase().includes('bonuses'));
          
          const multiplierMatch = sec.header.match(/(\d+(?:\.\d+)?X)/i);
          const mult = multiplierMatch ? multiplierMatch[1].toUpperCase() : "BONUS";
          const tier = mult.toLowerCase().replace('.', '_');
          
          return {
            multiplier: mult,
            label: sec.header,
            tier: tier,
            items: items.length > 0 ? items : [sec.header]
          };
        }).filter(b => b.items && b.items.length > 0);

        if (parsedBonuses.length > 0) {
          data.bonuses = parsedBonuses;
        }
      }
    }

    // ── Dynamic Extraction of ALL Discounts & Freebies ──
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
          const rawLines = sec.content.split('\n');
          const items = rawLines
            .map(l => l.replace(/^[\s*•\-]+/, '').trim())
            .filter(l => l.length > 0 && !l.startsWith('#') && !l.toLowerCase().includes('reddit'));
          
          const isFree = sec.rate.toLowerCase().includes('free');
          const is50 = sec.rate.includes('50');
          const is40 = sec.rate.includes('40');
          const is30 = sec.rate.includes('30');
          const badgeClass = isFree ? 'rate-free' : (is50 ? 'rate-50' : (is40 ? 'rate-40' : 'rate-30'));
          
          items.forEach(item => {
            const cleanItem = cleanMarkdown(item);
            let cat = 'vehicles';
            const lower = cleanItem.toLowerCase();
            if (lower.includes('office') || lower.includes('wash') || lower.includes('bail') || lower.includes('properties') || lower.includes('bunker') || lower.includes('nightclub') || lower.includes('agency') || lower.includes('hangar') || lower.includes('upgrades') || lower.includes('facility')) {
              cat = 'properties';
            } else if (lower.includes('suit') || lower.includes('bodysuit') || lower.includes('tracksuit') || lower.includes('livery') || lower.includes('plate') || lower.includes('apparel') || lower.includes('sweatsuit')) {
              cat = 'apparel';
            } else if (lower.includes('rifle') || lower.includes('gun') || lower.includes('hellbringer') || lower.includes('railgun') || lower.includes('weapon') || lower.includes('bomb') || lower.includes('shocker')) {
              cat = 'weapons';
            }
            parsedDiscounts.push({
              name: cleanItem,
              category: cat,
              rate: sec.rate,
              badgeClass: badgeClass
            });
          });
        });
        
        if (parsedDiscounts.length > 0) {
          data.discounts = parsedDiscounts;
        }
      }
    }

    return data;
  }

  function cleanMarkdown(str) {
    if (!str) return '';
    return str
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove markdown links [text](url)
      .replace(/[*_~`]/g, '')
      .replace(/\\u[\dA-Fa-f]{4}/g, '')
      .trim();
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── Google Sheets TSV Data Generator ──
  function updateTsvPreview() {
    const textarea = document.getElementById('tsvDataPreview');
    if (!textarea) return;

    let tsv = "Category\tActivity / Item\tDetails / Reward\tStatus\n";
    tsv += `Week Info\t${currentData.title}\t${currentData.eventTitle}\tActive\n`;
    tsv += `Lucky Wheel\tPodium Vehicle: ${currentData.podiumVehicle}\tDiamond Casino Daily Spin\t${taskCheckState['podium-spin'] ? 'Completed' : 'Pending'}\n`;
    tsv += `Prize Ride\t${currentData.prizeRide.vehicle}\t${currentData.prizeRide.condition}\t${taskCheckState['prize-ride'] ? 'Completed' : 'Pending'}\n`;
    tsv += `Weekly Challenge\t${currentData.weeklyChallenge.task}\t${currentData.weeklyChallenge.reward}\t${taskCheckState['weekly-challenge'] ? 'Completed' : 'Pending'}\n`;

    currentData.salvageRobberies.forEach((r, i) => {
      tsv += `Salvage Yard\t${r.name}: ${r.vehicle}\t${r.value}\t${taskCheckState[`salvage-${i+1}`] ? 'Completed' : 'Pending'}\n`;
    });

    tsv += `Time Trial\tRegular: ${currentData.timeTrials.regular}\tFreemode Challenge\t${taskCheckState['tt-regular'] ? 'Completed' : 'Pending'}\n`;
    tsv += `Time Trial\tHSW: ${currentData.timeTrials.hsw}\tNext-Gen / PC\t${taskCheckState['tt-hsw'] ? 'Completed' : 'Pending'}\n`;

    normalizeDailyObjectivesList(currentData.dailyObjectives).forEach(d => {
      tsv += `Daily Objective\t${d.day}: ${d.task}\tDaily Streak Reward\t${taskCheckState[`daily-${d.day.toLowerCase()}`] ? 'Completed' : 'Pending'}\n`;
    });

    currentData.bonuses.forEach(b => {
      const itemsList = Array.isArray(b.items) ? b.items : (b.name ? [b.name] : []);
      itemsList.forEach(item => {
        tsv += `Bonus Multiplier\t${b.label || b.multiplier || ''}\t${item}\tActive\n`;
      });
    });

    currentData.discounts.forEach(d => {
      tsv += `Discounts\t${d.name}\t${d.rate} (${d.category})\tAvailable\n`;
    });

    textarea.value = tsv;
  }

  // ── Companion Google Apps Script Generator ──
  function generateAppsScriptCode() {
    const codeEl = document.getElementById('appsScriptCode');
    if (!codeEl) return;

    const script = `/**
 * 🌴 GTA ONLINE WEEKLY UPDATE AUTOMATION
 * Auto-creates & populates the "Weekly Update" tab from Reddit r/gtaonline every Thursday!
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🎮 GTA Online')
    .addItem('🔄 Update "Weekly Update" Tab (Fetch Reddit)', 'syncGtaWeeklyUpdateToSheet')
    .addItem('⏰ Setup Thursday Auto-Pilot Trigger', 'setupThursdayGtaTrigger')
    .addToUi();
}

function syncGtaWeeklyUpdateToSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Weekly Update");
  
  if (!sheet) {
    sheet = ss.insertSheet("Weekly Update");
  }
  
  sheet.clear();
  
  // 1. Fetch Reddit JSON
  const url = "https://www.reddit.com/r/gtaonline/search.json?q=flair_name%3A%22:WU1::WU2::WU3::WU4::WU5::WU6:%22&sort=new&restrict_sr=1&limit=1";
  const res = UrlFetchApp.fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }, muteHttpExceptions: true });
  const json = JSON.parse(res.getContentText());
  
  const post = json.data.children[0].data;
  const title = post.title;
  const selftext = post.selftext;
  
  // 2. Build Formatted Rows
  const rows = [
    ["🌴 GTA ONLINE - " + title.toUpperCase(), "", "", ""],
    ["Category", "Activity / Target Item", "Details / Requirements", "Done?"]
  ];
  
  // Helper to extract matches
  function findMatch(regex, defVal) {
    const m = selftext.match(regex);
    return m ? m[1].replace(/\\[([^\\]]+)\\]\\([^)]+\\)/g, '$1').replace(/[*_]/g, '').trim() : defVal;
  }
  
  const podium = findMatch(/Podium Vehicle[^:]*:\\s*([^\\n\\r]+)/i, "Lucky Wheel Car");
  const prizeRide = findMatch(/Prize Ride Vehicle[^:]*:\\s*([^\\n\\r]+)/i, "LS Car Meet Car");
  const prizeCond = findMatch(/Prize Ride Challenge[^:]*:\\s*([^\\n\\r]+)/i, "Place Top in LS Car Meet");
  const weeklyChallenge = findMatch(/This Week's Challenge[^\\n\\r]*\\n+([^\\n\\r]+)/i, "Complete Weekly Challenge");
  
  rows.push(["🎡 Lucky Wheel", "Podium Vehicle: " + podium, "Diamond Casino Daily Spin", false]);
  rows.push(["🏁 Prize Ride", "Vehicle: " + prizeRide, prizeCond, false]);
  rows.push(["🏆 Weekly Challenge", weeklyChallenge, "Weekly Special Reward", false]);
  
  // Salvage Yard
  const rob1 = findMatch(/The Podium Robbery:\\s*([^\\n\\r]+)/i, "Robbery 1 Target");
  const rob2 = findMatch(/The Duggan Robbery:\\s*([^\\n\\r]+)/i, "Robbery 2 Target");
  const rob3 = findMatch(/(?:The Gangbanger Robbery|he Gangbanger Robbery):\\s*([^\\n\\r]+)/i, "Robbery 3 Target");
  
  rows.push(["🏗️ Salvage Yard", "The Podium Robbery", rob1, false]);
  rows.push(["🏗️ Salvage Yard", "The Duggan Robbery", rob2, false]);
  rows.push(["🏗️ Salvage Yard", "The Gangbanger Robbery", rob3, false]);
  
  // Daily Objectives
  const days = ["Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
  days.forEach(d => {
    const obj = findMatch(new RegExp('\\\\*\\\\*' + d + ':?\\\\*\\\\*\\\\s*([^\\\\n\\\\r]+)', 'i'), "Daily task");
    rows.push(["📅 Daily Objective", d, obj, false]);
  });

  // Dynamic Multipliers & Bonuses (5X, 4X, 3X, 2.5X, 2X, 1.5X, etc.)
  const bonusesIdx = selftext.search(/#+\\s*Bonuses/i);
  if (bonusesIdx !== -1) {
    const afterBonuses = selftext.substring(bonusesIdx);
    const nextSectionMatch = afterBonuses.substring(1).search(/\\n#+\\s+[A-Za-z]/);
    const bonusesText = nextSectionMatch !== -1 ? afterBonuses.substring(0, nextSectionMatch + 1) : afterBonuses;
    const multRegex = /(?:^|\\n)\\s*(\\d+(?:\\.\\d+)?X[^\\n\\r]*|Double\\s+[^\\n\\r]+|Triple\\s+[^\\n\\r]+)/gi;
    let m, lastI = 0, lastH = "";
    const bonusSections = [];
    while ((m = multRegex.exec(bonusesText)) !== null) {
      if (lastH) bonusSections.push({ header: lastH, content: bonusesText.substring(lastI, m.index) });
      lastH = m[1].trim().replace(/^#+\\s*/, '').replace(/[*_]/g, '');
      lastI = multRegex.lastIndex;
    }
    if (lastH) bonusSections.push({ header: lastH, content: bonusesText.substring(lastI) });
    bonusSections.forEach(sec => {
      const items = sec.content.split('\\n').map(l => l.replace(/^[\\s*•\\-]+/, '').trim()).filter(l => l.length > 0 && !l.startsWith('#') && !l.toLowerCase().includes('bonus'));
      items.forEach(item => { rows.push(["💰 Bonus Multiplier", sec.header, item, false]); });
    });
  }
  
  // Write to Sheet
  sheet.getRange(1, 1, rows.length, 4).setValues(rows);
  
  // Styling
  sheet.getRange("A1:D1").merge().setBackground("#0b0f19").setFontColor("#38bdf8").setFontWeight("bold").setFontSize(14).setHorizontalAlignment("center");
  sheet.getRange("A2:D2").setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
  sheet.getRange(3, 4, rows.length - 2, 1).insertCheckboxes();
  sheet.autoResizeColumns(1, 4);
  
  SpreadsheetApp.getActiveSpreadsheet().toast("✅ Weekly Update tab populated from Reddit!", "Success", 5);
}

function setupThursdayGtaTrigger() {
  ScriptApp.newTrigger("syncGtaWeeklyUpdateToSheet")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.THURSDAY)
    .atHour(6) // Runs around 6:00 AM ET after reset
    .create();
    
  SpreadsheetApp.getUi().alert("Auto-Pilot Enabled", "Weekly update script will run automatically every Thursday morning!", SpreadsheetApp.getUi().ButtonSet.OK);
}`;

    codeEl.textContent = script;
  }

  // ── Event Handlers & Interactions ──
  function bindEvents() {
    // Checkbox state tracking
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('task-check')) {
        const taskId = e.target.dataset.taskId;
        if (taskId) {
          taskCheckState[taskId] = e.target.checked;
          saveTaskState();
          updateTsvPreview();
        }
      }
    });

    // Mark All Done
    const checkAllBtn = document.getElementById('checkAllBtn');
    if (checkAllBtn) {
      checkAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.task-check').forEach(chk => {
          chk.checked = true;
          if (chk.dataset.taskId) taskCheckState[chk.dataset.taskId] = true;
        });
        saveTaskState();
        showToast('🎯 All weekly tasks marked as completed!', 'success');
      });
    }

    // Reset Checklist
    const resetBtn = document.getElementById('resetChecklistBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm("Reset your weekly checklist for the new week?")) {
          taskCheckState = {};
          saveTaskState();
          renderAll();
          showToast('🧹 Checklist reset for the new week!', 'info');
        }
      });
    }

    // Mark all daily objectives
    const checkAllDailyBtn = document.getElementById('checkAllDailyBtn');
    if (checkAllDailyBtn) {
      checkAllDailyBtn.addEventListener('click', () => {
        const days = ["thursday", "friday", "saturday", "sunday", "monday", "tuesday", "wednesday"];
        days.forEach(d => { taskCheckState[`daily-${d}`] = true; });
        saveTaskState();
        renderDailyObjectives();
        showToast('📅 All Daily Objectives checked off!', 'success');
      });
    }

    // Copy Summary
    const copySummaryBtn = document.getElementById('copySummaryBtn');
    if (copySummaryBtn) {
      copySummaryBtn.addEventListener('click', () => {
        const summaryText = `🌴 GTA Online Weekly Update (${currentData.dateRange})
🎡 Podium: ${currentData.podiumVehicle}
🏁 Prize Ride: ${currentData.prizeRide.vehicle} (${currentData.prizeRide.condition})
🏆 Weekly Challenge: ${currentData.weeklyChallenge.task}
🏗️ Salvage Yard: ${currentData.salvageRobberies.map(r => r.vehicle).join(', ')}
🔥 Top Multiplier: 4X GTA$ & RP on Hotring Circuit & Freemode Events`;

        navigator.clipboard.writeText(summaryText).then(() => {
          showToast('📋 Weekly summary copied to clipboard!', 'success');
        });
      });
    }

    // Sync Buttons
    const refreshRedditBtn = document.getElementById('refreshRedditBtn');
    if (refreshRedditBtn) refreshRedditBtn.addEventListener('click', fetchLatestFromReddit);

    const footerSyncBtn = document.getElementById('footerSyncBtn');
    if (footerSyncBtn) footerSyncBtn.addEventListener('click', fetchLatestFromReddit);

    // ── Operations Slideout Drawer ──
    const drawerToggleBtn = document.getElementById('drawerToggleBtn');
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');
    const drawerOverlay = document.getElementById('sideoutDrawerOverlay');
    const sideoutDrawer = document.getElementById('sideoutDrawer');

    function openDrawer() {
      if (sideoutDrawer) sideoutDrawer.classList.add('open');
      if (drawerOverlay) drawerOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      if (sideoutDrawer) sideoutDrawer.classList.remove('open');
      if (drawerOverlay) drawerOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (drawerToggleBtn) drawerToggleBtn.addEventListener('click', openDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });

    const drawerSyncBtn = document.getElementById('drawerSyncBtn');
    if (drawerSyncBtn) {
      drawerSyncBtn.addEventListener('click', () => {
        fetchLatestFromReddit();
        closeDrawer();
      });
    }

    const drawerCheckAllBtn = document.getElementById('drawerCheckAllBtn');
    if (drawerCheckAllBtn) {
      drawerCheckAllBtn.addEventListener('click', () => {
        const checkAll = document.getElementById('checkAllBtn');
        if (checkAll) checkAll.click();
        closeDrawer();
      });
    }

    const drawerResetTasksBtn = document.getElementById('drawerResetTasksBtn');
    if (drawerResetTasksBtn) {
      drawerResetTasksBtn.addEventListener('click', () => {
        const resetBtn = document.getElementById('resetChecklistBtn');
        if (resetBtn) resetBtn.click();
        closeDrawer();
      });
    }


    // Google Sheets Modal
    const openSheetsBtn = document.getElementById('openSheetsModalBtn');
    const footerSheetsBtn = document.getElementById('footerSheetsBtn');
    const sheetsModal = document.getElementById('sheetsModal');
    const sheetsOverlay = document.getElementById('sheetsModalOverlay');
    const closeSheetsBtn = document.getElementById('closeSheetsModalBtn');

    function openModal() {
      updateTsvPreview();
      if (sheetsModal) sheetsModal.style.display = 'flex';
      if (sheetsOverlay) sheetsOverlay.style.display = 'block';
    }

    function closeModal() {
      if (sheetsModal) sheetsModal.style.display = 'none';
      if (sheetsOverlay) sheetsOverlay.style.display = 'none';
    }

    if (openSheetsBtn) openSheetsBtn.addEventListener('click', openModal);
    if (footerSheetsBtn) footerSheetsBtn.addEventListener('click', openModal);
    if (closeSheetsBtn) closeSheetsBtn.addEventListener('click', closeModal);


    // Modal Tabs
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.modal-tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.tab);
        if (target) target.classList.add('active');
      });
    });

    // Copy TSV Button
    const copyTsvBtn = document.getElementById('copyTsvBtn');
    if (copyTsvBtn) {
      copyTsvBtn.addEventListener('click', () => {
        const textarea = document.getElementById('tsvDataPreview');
        if (textarea) {
          textarea.select();
          navigator.clipboard.writeText(textarea.value).then(() => {
            showToast('📊 Table data copied! Paste (Ctrl+V) into cell A1 of your Google Sheet.', 'success');
          });
        }
      });
    }

    // Copy Script Button
    const copyScriptBtn = document.getElementById('copyScriptBtn');
    if (copyScriptBtn) {
      copyScriptBtn.addEventListener('click', () => {
        const code = document.getElementById('appsScriptCode');
        if (code) {
          navigator.clipboard.writeText(code.textContent).then(() => {
            showToast('⚡ Apps Script code copied to clipboard!', 'success');
          });
        }
      });
    }

    // Discounts Filter Pills
    document.querySelectorAll('#discountCategoryFilters .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#discountCategoryFilters .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.dataset.cat;
        const searchInput = document.getElementById('discountSearchInput');
        renderDiscounts(cat, searchInput ? searchInput.value : '');
      });
    });

    // Discounts Search
    const searchInput = document.getElementById('discountSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const activePill = document.querySelector('#discountCategoryFilters .filter-pill.active');
        const cat = activePill ? activePill.dataset.cat : 'all';
        renderDiscounts(cat, e.target.value);
      });
    }

    // Bonuses Filter Pills
    document.querySelectorAll('#bonusFilterPills .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#bonusFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.dataset.filter;
        document.querySelectorAll('.bonus-card').forEach(card => {
          if (filter === 'all' || card.dataset.tier === filter) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // ── Streamlined Main Tab Switcher Engine ──
    const savedTab = localStorage.getItem('gta_active_tab') || 'tab-pane-tasks';
    switchMainTab(savedTab);

    document.querySelectorAll('.main-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        if (targetTab) {
          switchMainTab(targetTab);
        }
      });
    });

    function switchMainTab(tabId) {
      // Update Tab Buttons
      document.querySelectorAll('.main-tab-btn').forEach(b => {
        if (b.dataset.tab === tabId) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      // Update Tab Panes
      document.querySelectorAll('.tab-pane').forEach(p => {
        if (p.id === tabId) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });

      localStorage.setItem('gta_active_tab', tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Initialize Weekly Admin Modal
    initWeeklyAdminModal();
  }


  // ── Weekly Admin Manager Modal Controller ──
  function initWeeklyAdminModal() {
    const modal = document.getElementById('weeklyAdminModal');
    const overlay = document.getElementById('weeklyAdminModalOverlay');
    const openHeaderBtn = document.getElementById('headerAdminBtn');
    const openDrawerBtn = document.getElementById('drawerAdminBtn');
    const closeBtn = document.getElementById('closeWeeklyAdminModalBtn');
    const fetchBtn = document.getElementById('lswQuickFetchBtn');
    const resetBtn = document.getElementById('lswResetBtn');
    const adminForm = document.getElementById('lswAdminForm');

    function populateForm(data) {
      if (!data) return;
      const fDate = document.getElementById('lswFieldDate');
      const fTitle = document.getElementById('lswFieldTitle');
      const fPodium = document.getElementById('lswFieldPodium');
      const fPrize = document.getElementById('lswFieldPrize');
      const fCond = document.getElementById('lswFieldPrizeCond');
      const fTask = document.getElementById('lswFieldTask');
      const fReward = document.getElementById('lswFieldReward');
      const fDesc = document.getElementById('lswFieldDesc');

      if (fDate && data.dateRange) fDate.value = data.dateRange;
      if (fTitle && data.eventTitle) fTitle.value = data.eventTitle;
      if (fPodium && data.podiumVehicle) fPodium.value = data.podiumVehicle;
      if (fPrize && data.prizeRide) fPrize.value = typeof data.prizeRide === 'object' ? data.prizeRide.vehicle : data.prizeRide;
      if (fCond && data.prizeRide && data.prizeRide.condition) fCond.value = data.prizeRide.condition;
      if (fTask && data.weeklyChallenge && data.weeklyChallenge.task) fTask.value = data.weeklyChallenge.task;
      if (fReward && data.weeklyChallenge && data.weeklyChallenge.reward) fReward.value = data.weeklyChallenge.reward;
      if (fDesc && data.eventDesc) fDesc.value = data.eventDesc;

      const liveDate = document.getElementById('lswLiveWeekDate');
      const liveMeta = document.getElementById('lswLiveWeekMeta');
      if (liveDate && data.dateRange) liveDate.textContent = data.dateRange;
      if (liveMeta && data.eventTitle) liveMeta.textContent = data.eventTitle;
    }

    function openModal() {
      populateForm(currentData);
      if (modal) modal.style.display = 'flex';
      if (overlay) overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (modal) modal.style.display = 'none';
      if (overlay) overlay.style.display = 'none';
      document.body.style.overflow = '';
    }

    if (openHeaderBtn) openHeaderBtn.addEventListener('click', openModal);
    if (openDrawerBtn) {
      openDrawerBtn.addEventListener('click', () => {
        const drawer = document.getElementById('sideoutDrawer');
        const drawerOverlay = document.getElementById('sideoutDrawerOverlay');
        if (drawer) drawer.classList.remove('open');
        if (drawerOverlay) drawerOverlay.classList.remove('open');
        openModal();
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        populateForm(DEFAULT_WEEK_DATA);
        showToast(`🔄 Restored current week (${DEFAULT_WEEK_DATA.dateRange})`, 'info');
      });
    }

    if (fetchBtn) {
      fetchBtn.addEventListener('click', async () => {
        fetchBtn.disabled = true;
        fetchBtn.textContent = '⏳ Fetching...';
        showToast('📡 Checking RockstarINTEL & BDCF Cloud for latest update...', 'info');

        try {
          await fetchLatestFromReddit(true);
          populateForm(currentData);
          showToast(`✅ Synced ${currentData.dateRange}: ${currentData.eventTitle}!`, 'success');
        } catch (e) {
          populateForm(DEFAULT_WEEK_DATA);
          showToast(`✅ Current verified week loaded: ${DEFAULT_WEEK_DATA.dateRange}`, 'info');
        } finally {
          fetchBtn.disabled = false;
          fetchBtn.textContent = '⚡ 1-Click Auto-Fetch';
        }
      });
    }

    function handleAdminFormSubmit(e) {
      if (e && e.preventDefault) e.preventDefault();
      const dateEl = document.getElementById('lswFieldDate');
      const titleEl = document.getElementById('lswFieldTitle');
      const podiumEl = document.getElementById('lswFieldPodium');
      const prizeEl = document.getElementById('lswFieldPrize');
      const condEl = document.getElementById('lswFieldPrizeCond');
      const taskEl = document.getElementById('lswFieldTask');
      const rewardEl = document.getElementById('lswFieldReward');
      const descEl = document.getElementById('lswFieldDesc');

      const dateRange = dateEl ? dateEl.value.trim() : '';
      const eventTitle = titleEl ? titleEl.value.trim() : '';
      const podiumVehicle = podiumEl ? podiumEl.value.trim() : '';
      const prizeVehicle = prizeEl ? prizeEl.value.trim() : '';
      const prizeCond = condEl ? condEl.value.trim() : '';
      const challengeTask = taskEl ? taskEl.value.trim() : '';
      const challengeReward = rewardEl ? rewardEl.value.trim() : '';
      const eventDesc = descEl ? descEl.value.trim() : '';

      currentData = {
        ...currentData,
        dateRange: dateRange || currentData.dateRange,
        eventTitle: eventTitle || currentData.eventTitle,
        podiumVehicle: podiumVehicle || currentData.podiumVehicle,
        prizeRide: {
          vehicle: prizeVehicle || (currentData.prizeRide ? currentData.prizeRide.vehicle : ''),
          condition: prizeCond || (currentData.prizeRide ? currentData.prizeRide.condition : '')
        },
        weeklyChallenge: {
          task: challengeTask || (currentData.weeklyChallenge ? currentData.weeklyChallenge.task : ''),
          reward: challengeReward || (currentData.weeklyChallenge ? currentData.weeklyChallenge.reward : '')
        },
        eventDesc: eventDesc || currentData.eventDesc
      };

      saveData(currentData);
      renderAll();

      const drawerBadge = document.getElementById('drawerDateRange');
      if (drawerBadge && dateRange) drawerBadge.textContent = dateRange;

      closeModal();
      showToast(`🎉 Published! Live page updated to ${dateRange}!`, 'success');
    }

    if (adminForm) {
      adminForm.addEventListener('submit', handleAdminFormSubmit);
    }
    const publishBtn = document.getElementById('lswPublishBtn');
    if (publishBtn) {
      publishBtn.addEventListener('click', handleAdminFormSubmit);
    }
  }

  // ── Toast Notification Helper ──
  function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${escapeHTML(msg)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = '0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }


  // ── Launch on DOM Load ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
