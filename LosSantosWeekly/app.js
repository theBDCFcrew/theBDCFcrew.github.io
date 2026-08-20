/**
 * 🌴 LOS SANTOS WEEKLY | GTA ONLINE UPDATE HUB
 * Core Application Logic, Live Reddit Parser & Google Sheets Sync Engine
 */

(function () {
  'use strict';

  // ── Version & App Constants ──
  const APP_VERSION = 'v3.7.0';


  // ── Default State & Fallback Current Week Data ──
  const DEFAULT_WEEK_DATA = {
    version: APP_VERSION,
    title: "Weekly Bonuses and Discounts - August 13th to August 20th",
    eventTitle: "Brand Wars Event (Week 1)",
    eventDesc: "Proclaim your loyalty in the Brand Wars Event! Boosted payouts on select Odd Jobs, Freemode Events, and sponsored Hotring Circuit Series Races. Weekly completion bonuses reset for a bigger initial payout on select Heists and Missions.",
    dateRange: "Aug 13 – Aug 20",
    podiumVehicle: "Pfister Astron",
    prizeRide: {
      vehicle: "Enus Deity",
      condition: "Place Top 4 in the LS Car Meet Series 3 days in a row"
    },
    weeklyChallenge: {
      task: "Complete 3 Business Battles",
      reward: "Impotent Rage Sweatsuit + 2.5X GTA$250,000 Bonus"
    },
    timeTrials: {
      regular: "End to End",
      hsw: "Terminal to Chiliad Mountain State Wilderness",
      premiumRace: "A Sign of Things to Come"
    },
    testRides: [
      "Vapid Clique Wagon",
      "Överflöd Autarch",
      "Pegassi Osiris",
      "HSW Premium: Karin S95"
    ],
    salvageRobberies: [
      { name: "The Podium Robbery", vehicle: "Truffade Z-Type", value: "~$380,000 - $420,000" },
      { name: "The Duggan Robbery", vehicle: "Übermacht Sentinel Classic", value: "~$340,000 - $380,000" },
      { name: "The Gangbanger Robbery", vehicle: "Vapid Caracara 4x4", value: "~$320,000 - $360,000" }
    ],
    fibPriorityFile: "The Black Box File",
    kortzTargets: ["Gone to Seed", "Chat on Fruit", "Juiced"],
    luxuryAutos: ["Benefactor LRC GT", "Pfister X-treme"],
    pdmShowroom: [
      { name: "Obey Tailgater S", type: "Sedan / Sports", discount: "30% Off" },
      { name: "Shitzu Keitora", type: "Compact Truck", discount: "30% Off" },
      { name: "Mammoth Patriot Mil-Spec", type: "Armored SUV", discount: "30% Off" },
      { name: "Benefactor Stirling GT", type: "Sports Classic", discount: "30% Off" },
      { name: "Progen GP1", type: "Supercar", discount: "30% Off" }
    ],
    dailyObjectives: [
      { day: "Thursday", task: "Complete a Special Vehicle Work" },
      { day: "Friday", task: "Participate in Carnage" },
      { day: "Saturday", task: "Participate in a Freemode Challenge" },
      { day: "Sunday", task: "Participate in a Land Race" },
      { day: "Monday", task: "Play a game of Darts" },
      { day: "Tuesday", task: "Participate in a Freemode Event" },
      { day: "Wednesday", task: "Complete a Project Overthrow mission" }
    ],
    bonuses: [
      {
        multiplier: "4X",
        label: "4X GTA$ & RP",
        tier: "4x",
        items: [
          "🏁 Hotring Circuit Series Races",
          "⚡ Freemode Challenges",
          "🌐 Freemode Events"
        ]
      },
      {
        multiplier: "3X",
        label: "3X GTA$ & RP",
        tier: "3x",
        items: [
          "📰 Paper Route Odd Jobs",
          "🚒 Firefighter Missions",
          "🏗️ Forklift Operator Odd Jobs",
          "🎨 Community Series Jobs"
        ]
      },
      {
        multiplier: "2X",
        label: "2X GTA$ & RP",
        tier: "2x",
        items: [
          "💼 Special Cargo Sell Missions",
          "🏢 Executive Office Sightseer & Hostile Takeover",
          "🔬 2X Bunker Research & Production Speed"
        ]
      }
    ],
    discounts: [
      { name: "Declasse Hotring Sabre (Sports)", category: "vehicles", rate: "Free", badgeClass: "rate-free" },
      { name: "Sprunk and eCola Bodysuits", category: "apparel", rate: "Free", badgeClass: "rate-free" },
      { name: "Sprunk x eCola Livery & Vanity Plates", category: "apparel", rate: "Free", badgeClass: "rate-free" },
      { name: "Unholy Hellbringer (Gun Van)", category: "weapons", rate: "Free", badgeClass: "rate-free" },
      { name: "Battle Rifle (Gun Van)", category: "weapons", rate: "50% Off", badgeClass: "rate-50" },
      { name: "Precision Rifle (Gun Van - GTA+)", category: "weapons", rate: "40% Off", badgeClass: "rate-40" },
      { name: "Hands On Car Wash", category: "properties", rate: "40% Off", badgeClass: "rate-40" },
      { name: "Bail Office Properties, Upgrades & Modifications", category: "properties", rate: "40% Off", badgeClass: "rate-40" },
      { name: "Bravado Hotring Hellfire (Sports)", category: "vehicles", rate: "40% Off", badgeClass: "rate-40" },
      { name: "Karin Hotring Everon (Sports)", category: "vehicles", rate: "40% Off", badgeClass: "rate-40" },
      { name: "Declasse Scramjet (Super)", category: "vehicles", rate: "40% Off", badgeClass: "rate-40" },
      { name: "Överflöd Autarch (Super)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Pegassi Osiris (Super)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Mammoth Patriot Mil-Spec (SUV)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Obey Tailgater S (Sedan)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Progen GP1 (Super)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Vapid Clique Wagon (Muscle)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Benefactor Stirling GT (Sports Classic)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Shitzu Keitora (Compact Truck)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Emperor ETR1 (Super)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Western Reever (Motorcycle)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Pfister Comet S2 (Sports)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Canis Terminus (Off-Road)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Dinka RT3000 (Sports)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Willard Eudora (Muscle)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Dinka Veto Modern (Sports)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Vapid Desert Raid (Off-Road)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "MTL Wastelander (Service)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Übermacht Sentinel Classic (Sports)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Vapid Trophy Truck (Off-Road)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" },
      { name: "Nagasaki Weaponized Dinghy (Boat)", category: "vehicles", rate: "30% Off", badgeClass: "rate-30" }
    ],
    gunVan: [
      { name: "Unholy Hellbringer", status: "100% FREE", isFree: true },
      { name: "Battle Rifle", status: "50% OFF", isFree: false },
      { name: "Precision Rifle", status: "40% OFF (GTA+)", isFree: false },
      { name: "Railgun", status: "In Stock", isFree: false },
      { name: "Up-n-Atomizer", status: "In Stock", isFree: false },
      { name: "Widowmaker", status: "In Stock", isFree: false },
      { name: "The Shocker", status: "In Stock", isFree: false }
    ]
  };

  let currentData = DEFAULT_WEEK_DATA;
  let taskCheckState = {};

  // ── Firebase Firestore Real-Time Cloud Sync Engine ──
  const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyBkOfgA2gmuns2-X--EYu1D0TeiPFN7w-U",
    authDomain:        "the-bdcf-crew.firebaseapp.com",
    projectId:         "the-bdcf-crew",
    storageBucket:     "the-bdcf-crew.firebasestorage.app",
    messagingSenderId: "798269256571",
    appId:             "1:798269256571:web:4077fad17160ee72ec03de"
  };

  async function initFirestoreSync() {
    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const { getFirestore, doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      const app = initializeApp(FIREBASE_CONFIG, 'LosSantosWeeklyApp');
      const db = getFirestore(app);
      const weeklyDocRef = doc(db, 'weekly', 'current');

      // Realtime listener for instant cloud updates
      onSnapshot(weeklyDocRef, (snap) => {
        if (snap.exists()) {
          const cloudData = snap.data();
          if (cloudData && (cloudData.podiumVehicle || cloudData.dateRange || cloudData.discounts)) {
            currentData = {
              ...DEFAULT_WEEK_DATA,
              ...cloudData,
              version: APP_VERSION
            };
            saveData(currentData);
            renderAll();
            updateLiveIndicator(true, cloudData.dateRange);
          }
        }
      }, (err) => {
        console.warn('[LosSantosWeekly] Firestore listener warning (using cached data):', err);
      });
    } catch (err) {
      console.warn('[LosSantosWeekly] Firestore SDK dynamic import skipped (offline/cached mode):', err);
    }
  }

  function updateLiveIndicator(isLive, dateRange) {
    const liveStatusText = document.getElementById('liveStatusText');
    const livePill = document.querySelector('.status-pill.live-pill');
    const redditSourceMeta = document.getElementById('redditSourceMeta');

    if (liveStatusText) {
      liveStatusText.textContent = isLive ? 'LIVE CLOUD' : 'SAVED DATA';
    }
    if (livePill && isLive) {
      livePill.title = 'Real-time sync active from BDCF Syndicate Firestore';
    }
    if (redditSourceMeta && dateRange) {
      redditSourceMeta.textContent = `Source: r/gtaonline • Synced via BDCF Cloud (${dateRange})`;
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
    initFirestoreSync();
  }

  // ── Local Storage Management ──
  function loadSavedData() {
    const saved = localStorage.getItem('gta_weekly_data');
    if (saved) {
      try {
        currentData = JSON.parse(saved);
      } catch (e) {
        currentData = DEFAULT_WEEK_DATA;
      }
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
    const navDateRange = document.getElementById('navDateRange');
    if (navDateRange) navDateRange.textContent = `📅 ${currentData.dateRange || 'Current Week'}`;

    const heroEventTitle = document.getElementById('heroEventTitle');
    if (heroEventTitle) heroEventTitle.textContent = currentData.eventTitle || currentData.title;

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

    container.innerHTML = currentData.dailyObjectives.map((obj, idx) => {
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
          ${b.items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}
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
      const isFree = d.rate.toLowerCase().includes('free');
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
  }

  // ── Live Countdown Timer to Next Thursday ──
  function initCountdownTimer() {
    function calculateNextReset() {
      const now = new Date();
      const next = new Date(now.getTime());
      
      // GTA Online weekly reset is every Thursday at 10:00 UTC (5:00 AM ET)
      const currentDay = now.getUTCDay(); // 0 is Sun, 4 is Thu
      let daysUntilThu = (4 - currentDay + 7) % 7;

      if (daysUntilThu === 0) {
        // Today is Thursday: check if past 10:00 UTC
        if (now.getUTCHours() >= 10) {
          daysUntilThu = 7;
        }
      }

      next.setUTCDate(now.getUTCDate() + daysUntilThu);
      next.setUTCHours(10, 0, 0, 0);

      const diff = next.getTime() - now.getTime();
      if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      return { d, h, m, s };
    }

    function updateTimers() {
      const { d, h, m, s } = calculateNextReset();
      const formatted = `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
      
      const navTimer = document.getElementById('countdownTimer');
      if (navTimer) navTimer.textContent = formatted;

      const heroTimer = document.getElementById('heroCountdown');
      if (heroTimer) heroTimer.textContent = `${d}d ${h}h ${m}m ${s}s`;
    }

    updateTimers();
    setInterval(updateTimers, 1000);
  }

  // ── Live Reddit Fetcher & Parser Engine ──
  async function fetchLatestFromReddit() {
    const refreshBtn = document.getElementById('refreshRedditBtn');
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '🔄 <span>Fetching...</span>';
    }

    showToast('📡 Connecting to Reddit r/gtaonline...', 'info');

    const redditSearchUrl = 'https://www.reddit.com/r/gtaonline/search.json?q=flair_name%3A%22:WU1::WU2::WU3::WU4::WU5::WU6:%22&sort=new&restrict_sr=1&limit=3';

    try {
      let res;
      try {
        res = await fetch(redditSearchUrl, { headers: { 'Accept': 'application/json' } });
      } catch (corsErr) {
        // Fallback via CORS proxy if blocked by browser origin
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(redditSearchUrl);
        res = await fetch(proxyUrl);
      }

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const json = await res.json();

      const posts = json?.data?.children;
      if (!posts || posts.length === 0) throw new Error("No weekly update posts found on r/gtaonline");

      const latestPost = posts[0].data;
      const parsedData = parseRedditPostText(latestPost.title, latestPost.selftext);

      saveData(parsedData);
      renderAll();
      showToast('✅ Latest Weekly Update synced from Reddit!', 'success');

      const sourceMeta = document.getElementById('redditSourceMeta');
      if (sourceMeta) {
        sourceMeta.innerHTML = `Source: <a href="https://reddit.com${latestPost.permalink}" target="_blank" style="color:var(--accent); text-decoration:none;">${escapeHTML(latestPost.title)}</a>`;
      }
    } catch (err) {
      console.warn("Reddit fetch failed, keeping active week data:", err);
      showToast('⚠️ Could not reach Reddit directly. Using active bundled week data.', 'error');
    } finally {
      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<span class="btn-icon">🔄</span> <span class="btn-label">Sync Reddit</span>';
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

    currentData.dailyObjectives.forEach(d => {
      tsv += `Daily Objective\t${d.day}: ${d.task}\tDaily Streak Reward\t${taskCheckState[`daily-${d.day.toLowerCase()}`] ? 'Completed' : 'Pending'}\n`;
    });

    currentData.bonuses.forEach(b => {
      b.items.forEach(item => {
        tsv += `Bonus Multiplier\t${b.label}\t${item}\tActive\n`;
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

    // Sync Reddit Buttons
    const refreshRedditBtn = document.getElementById('refreshRedditBtn');
    if (refreshRedditBtn) refreshRedditBtn.addEventListener('click', fetchLatestFromReddit);

    const footerSyncBtn = document.getElementById('footerSyncBtn');
    if (footerSyncBtn) footerSyncBtn.addEventListener('click', fetchLatestFromReddit);

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
    if (sheetsOverlay) sheetsOverlay.addEventListener('click', closeModal);

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
