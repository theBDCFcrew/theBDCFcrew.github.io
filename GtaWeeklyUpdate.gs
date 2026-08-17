/**
 * 🌴 LOS SANTOS WEEKLY | GTA ONLINE APPS SCRIPT AUTOMATION
 * Auto-creates & populates the "Weekly Update" tab from Reddit r/gtaonline every Thursday!
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🎮 GTA Online')
    .addItem('🔄 Update "Weekly Update" Tab (Fetch Reddit)', 'syncGtaWeeklyUpdateToSheet')
    .addItem('⏰ Setup Thursday Auto-Pilot Trigger', 'setupThursdayGtaTrigger')
    .addToUi();
}

/**
 * Main function to fetch Reddit's latest weekly update and populate the "Weekly Update" sheet tab
 */
function syncGtaWeeklyUpdateToSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Weekly Update");
  
  if (!sheet) {
    sheet = ss.insertSheet("Weekly Update");
  }
  
  sheet.clear();
  
  // 1. Fetch Reddit JSON
  const url = "https://www.reddit.com/r/gtaonline/search.json?q=flair_name%3A%22:WU1::WU2::WU3::WU4::WU5::WU6:%22&sort=new&restrict_sr=1&limit=1";
  const res = UrlFetchApp.fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" },
    muteHttpExceptions: true
  });
  
  const json = JSON.parse(res.getContentText());
  if (!json || !json.data || !json.data.children || json.data.children.length === 0) {
    SpreadsheetApp.getUi().alert("Error", "Could not fetch latest Weekly Update post from Reddit.", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  const post = json.data.children[0].data;
  const title = post.title;
  const selftext = post.selftext;
  
  // Helper to extract matches
  function findMatch(regex, defVal) {
    const m = selftext.match(regex);
    return m ? m[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_~`]/g, '').trim() : defVal;
  }
  
  // 2. Build Formatted Rows
  const rows = [
    ["🌴 GTA ONLINE - " + title.toUpperCase(), "", "", ""],
    ["Category", "Activity / Target Item", "Details / Requirements", "Done?"]
  ];
  
  // Vehicles & Challenges
  const podium = findMatch(/Podium Vehicle[^:]*:\s*([^\n\r]+)/i, "Lucky Wheel Car");
  const prizeRide = findMatch(/Prize Ride Vehicle[^:]*:\s*([^\n\r]+)/i, "LS Car Meet Car");
  const prizeCond = findMatch(/Prize Ride Challenge[^:]*:\s*([^\n\r]+)/i, "Place Top in LS Car Meet");
  const weeklyChallenge = findMatch(/This Week's Challenge[^\n\r]*\n+([^\n\r]+)/i, "Complete Weekly Challenge");
  
  rows.push(["🎡 Lucky Wheel", "Podium Vehicle: " + podium, "Diamond Casino Daily Spin", false]);
  rows.push(["🏁 Prize Ride", "Vehicle: " + prizeRide, prizeCond, false]);
  rows.push(["🏆 Weekly Challenge", weeklyChallenge, "Weekly Special Reward", false]);
  
  // Time Trials
  const regTrial = findMatch(/Time Trial[^:]*:\s*([^\n\r]+)/i, "End to End");
  const hswTrial = findMatch(/HSW Time Trial[^:]*:\s*([^\n\r]+)/i, "HSW Time Trial");
  const premRace = findMatch(/Premium Race[^:]*:\s*([^\n\r]+)/i, "Premium Race");
  
  rows.push(["⏱️ Time Trial", "Regular: " + regTrial, "Freemode Challenge ($100K+)", false]);
  rows.push(["⏱️ Time Trial", "HSW: " + hswTrial, "Next-Gen / PC ($250K+)", false]);
  rows.push(["🏎️ Premium Race", premRace, "Stunt Race (Triple RP)", false]);
  
  // Salvage Yard Robberies
  const rob1 = findMatch(/The Podium Robbery:\s*([^\n\r]+)/i, "Robbery 1 Target");
  const rob2 = findMatch(/The Duggan Robbery:\s*([^\n\r]+)/i, "Robbery 2 Target");
  const rob3 = findMatch(/(?:The Gangbanger Robbery|he Gangbanger Robbery):\s*([^\n\r]+)/i, "Robbery 3 Target");
  
  rows.push(["🏗️ Salvage Yard", "The Podium Robbery", rob1, false]);
  rows.push(["🏗️ Salvage Yard", "The Duggan Robbery", rob2, false]);
  rows.push(["🏗️ Salvage Yard", "The Gangbanger Robbery", rob3, false]);
  
  // Daily Objectives (Thursday – Wednesday)
  const days = ["Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
  days.forEach(d => {
    const obj = findMatch(new RegExp('\\*\\*' + d + ':?\\*\\*\\s*([^\\n\\r]+)', 'i'), "Daily task");
    rows.push(["📅 Daily Objective", d, obj, false]);
  });

  // Dynamic Extraction of ALL Bonuses & Multipliers (5X, 4X, 3X, 2.5X, 2X, 1.5X, etc.)
  const bonusesIdx = selftext.search(/#+\s*Bonuses/i);
  if (bonusesIdx !== -1) {
    const afterBonuses = selftext.substring(bonusesIdx);
    const nextSectionMatch = afterBonuses.substring(1).search(/\n#+\s+[A-Za-z]/);
    const bonusesText = nextSectionMatch !== -1 ? afterBonuses.substring(0, nextSectionMatch + 1) : afterBonuses;
    
    const multRegex = /(?:^|\n)\s*(\d+(?:\.\d+)?X[^\n\r]*|Double\s+[^\n\r]+|Triple\s+[^\n\r]+)/gi;
    let m;
    const bonusSections = [];
    let lastI = 0;
    let lastH = "";
    
    while ((m = multRegex.exec(bonusesText)) !== null) {
      if (lastH) {
        bonusSections.push({ header: lastH, content: bonusesText.substring(lastI, m.index) });
      }
      lastH = m[1].trim().replace(/^#+\s*/, '').replace(/[*_]/g, '');
      lastI = multRegex.lastIndex;
    }
    if (lastH) {
      bonusSections.push({ header: lastH, content: bonusesText.substring(lastI) });
    }
    
    bonusSections.forEach(sec => {
      const items = sec.content.split('\n')
        .map(l => l.replace(/^[\s*•\-]+/, '').trim())
        .filter(l => l.length > 0 && !l.startsWith('#') && !l.toLowerCase().includes('bonus'));
      
      items.forEach(item => {
        rows.push(["💰 Bonus Multiplier", sec.header, item, false]);
      });
    });
  }
  
  // Freebies & Top Gun Van Item
  const gunVanFree = findMatch(/Gun Van Inventory[^\n\r]*\n+[\s\S]*?([^\n\r]+-\s*Free)/i, "");
  if (gunVanFree) {
    rows.push(["🎁 Freebies", "Gun Van Free Weapon", gunVanFree, false]);
  }
  
  // 3. Write Data to Sheet
  sheet.getRange(1, 1, rows.length, 4).setValues(rows);
  
  // 4. Formatting & Styling
  // Title Row
  sheet.getRange("A1:D1").merge()
    .setBackground("#0b0f19")
    .setFontColor("#38bdf8")
    .setFontWeight("bold")
    .setFontSize(13)
    .setHorizontalAlignment("center");
  
  // Header Row
  sheet.getRange("A2:D2")
    .setBackground("#1e293b")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("left");
    
  // Checkbox Column
  sheet.getRange(3, 4, rows.length - 2, 1).insertCheckboxes();
  sheet.getRange(3, 4, rows.length - 2, 1).setHorizontalAlignment("center");
  
  // Auto-fit columns
  sheet.autoResizeColumns(1, 4);
  
  SpreadsheetApp.getActiveSpreadsheet().toast("✅ Weekly Update tab successfully populated from Reddit!", "Success", 5);
}

/**
 * Sets up a time-driven trigger to run every Thursday morning automatically
 */
function setupThursdayGtaTrigger() {
  // Clean up any existing triggers to prevent duplicates
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "syncGtaWeeklyUpdateToSheet") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  ScriptApp.newTrigger("syncGtaWeeklyUpdateToSheet")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.THURSDAY)
    .atHour(6) // Runs around 6:00 AM ET / 10:00 UTC
    .create();
    
  SpreadsheetApp.getUi().alert("Auto-Pilot Enabled", "The Weekly Update tab will now update automatically every Thursday morning!", SpreadsheetApp.getUi().ButtonSet.OK);
}
