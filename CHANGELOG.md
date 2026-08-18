# 🌴 Los Santos Weekly — Changelog

## [3.5.5] - 2026-08-18
- **Update Alert Popup Modal & Instant Dismissal**:
  - Re-architected Update Alert notifications to display as a clean popup window modal with dark glassmorphic backdrop overlay.
  - Added instant dismissal: Clicking "INSTALL & APPLY UPDATE", "GOT IT", or close immediately closes the modal window, saves the seen version state, and applies the update with zero lingering banners.
  - Enhanced PWA Install flow to immediately hide the sticky dock and install dialogs upon action.
- **Service Worker Cache Refresh**: Bumped service worker cache identifier to `bdcf-pwa-cache-v3.5.5`.

## [3.5.4] - 2026-08-18
- **Navigation Menu Bar Fit & Tab Rename**:
  - Renamed primary navigation tab from `Video Theater` to `Theater` to prevent horizontal text truncation and ensure optimal fit on compact smartphone screens (Google Pixel 10 Pro, Pixel 10 XL, iPhone, Galaxy).
  - Optimized mobile navigation tab padding and gap spacing for clean alignment.
- **Service Worker Cache Refresh**: Bumped service worker cache identifier to `bdcf-pwa-cache-v3.5.4`.

## [3.5.3] - 2026-08-18
- **Pixel 10 Pro & Mobile Touch Drag Slider Engine**:
  - **Unified Pointer & Touch Drag-to-Scroll**: Built a direct 1:1 finger swipe drag engine for Google Pixel 10 Pro, Android, iPhone, and desktop browsers with drag velocity tracking.
  - **Touch Action CSS Optimization**: Applied explicit `touch-action: pan-x pan-y !important;` across all slider elements and card buttons so mobile Chrome does not lock or suppress horizontal swipes.
  - **Drag vs Tap Intelligence**: Smart gesture threshold detection suppresses accidental category selection while swiping.
  - **Soft Scroll Snap**: Changed to `scroll-snap-type: x proximity;` for fluid, non-rigid sliding on mobile devices.
- **Service Worker Cache Refresh**: Bumped service worker cache identifier to `bdcf-pwa-cache-v3.5.3`.

## [3.5.2] - 2026-08-18
- **Universal Horizontal Category Sliding Bar**:
  - Rebuilt the Category Series selector as a strict, non-wrapping horizontal sliding reel (`flex-direction: row; flex-wrap: nowrap; overflow-x: auto`) across all viewports (desktop, laptop, tablet, and mobile).
  - Fixed category card dimensions (`flex: 0 0 175px; min-width: 175px; max-width: 185px; height: 105px`) with video poster backdrops and dark gradient overlays.
  - Added header and floating interactive navigation arrow buttons (`◀` and `▶`) for 1-click sliding.
  - Added horizontal mouse wheel and swipe gesture listener for smooth scrolling on desktop and smartphones.
- **Cleaned Up Stacked Playlist Feed**:
  - Enforced structured vertical stack (`flex-direction: column`) with `max-height: 440px`, glowing purple neon scrollbar, and rich YouTube video thumbnails.
- **Service Worker Cache Refresh**: Bumped service worker cache identifier to `bdcf-pwa-cache-v3.5.2`.

## [3.5.1] - 2026-08-18
- **Full Video Theater Mockup Fidelity Overhaul**:
  - **High-Definition Video Thumbnails**: Integrated real YouTube video thumbnail previews (`https://img.youtube.com/vi/{id}/mqdefault.jpg`) on all playlist clips with ranking numbers (`#1`, `#2`, `#3`), timestamp `HD` badges, and glowing active borders.
  - **Series Cards with Video Poster Backdrops**: Every category card now renders authentic video backdrop imagery with dark gradient overlays, series icons, uppercase headers, and bright magenta/purple neon active states.
  - **Mockup Player & Now Playing Stats Bar**: Embedded 16:9 HD screen corner badge, prominent centered `▶ NOW PLAYING` glowing magenta pill, and syndicate stats strip (`👥 BDCF Syndicate` • `🌴 Series` • `⏱️ HD 1080p`).
  - **Header Section Hints**: Added `Swipe ➔` affordance pill to Category Series and `Scroll ➔` pill to Playlist feed.
- **Syndicate Update Alert System**:
  - **Interactive Update Modal (`#updateAlertModal`)**: Glassmorphic modal showcasing newly released features, changelog highlights, and 1-click `🔄 REFRESH & APPLY UPDATE`.
  - **Auto-Detection & Floating Banner (`#updateFloatingBanner`)**: Automatically alerts visitors when a newer cache/deployment is available.
  - **Header Trigger Pill (`⚡ v3.5.1 Update`)**: Clicking the update pill or version badge in the header instantly opens the update release notes.
- **Service Worker Cache Refresh**: Bumped service worker cache identifier to `bdcf-pwa-cache-v3.5.1`.

## [3.5.0] - 2026-08-18
- **Smartphone & Mobile Video Theater Redesign**: Completely cleaned up and restructured the BDCF Crew Video Theater for mobile screens (< 768px, < 640px, and < 480px) to eliminate visual clutter and endless single-column scrolling.
- **Horizontal Swipeable Series Reel**: Transformed the 500px+ vertical stack of category cards into a sleek horizontal-scrolling reel with smooth scroll snap (`scroll-snap-type: x mandatory`), compact badges, and touch-friendly padding (~80px tall).
- **Contained Scrollable Playlist Feed Drawer**: Enclosed all video clips inside a dedicated scrollable container with max-height limits (`max-height: 380px`), custom purple neon scrollbars, and `overscroll-behavior: contain` to prevent layout blowouts.
- **Enhanced Video Metadata Bar**: Re-aligned now playing tags, titles with fluid responsive typography, and social/HD badges into a clean, breathable hierarchy.
- **Visual "Playing Now" Indicators & Auto-Scroll**: Added pulsing green `PLAYING NOW` badges, active glowing highlights, and automatic smooth-scrolling into view when videos are selected.
- **Service Worker Cache Refresh**: Bumped service worker cache identifier to `bdcf-pwa-cache-v3.5.0` for immediate client-side cache updates.

## [3.4.1] - 2026-08-18
- **CSS Hierarchy & Bracket Balance Fix**: Removed a stray unmatched closing bracket in `style.css` at line 1351 that was interfering with downstream modal and admin layout styling in certain browser engines.
- **Resilient Service Worker Pre-Caching**: Updated `sw.js` cache installer to gracefully add assets individually to prevent 404/rejection cascading, and bumped cache identifier to `bdcf-pwa-cache-v3.4.1` for immediate client cache refresh.

## [3.4.0] - 2026-08-18
- **High-Visibility "In-Your-Face" PWA Install Banner & Dock**: Added an unmissable, floating glassmorphic smart app dock fixed to the bottom of the screen with glowing purple neon borders, green online status badge, and pulsing `⚡ INSTALL APP NOW` action button.
- **Auto-Slide In Animation**: The install dock automatically animates up onto the screen after 1.2s for mobile and desktop visitors.
- **Pulsing Header Install Button**: Transformed the header install button into a permanently glowing, pulsing action pill (`⚡ INSTALL APP`) whenever browsed outside standalone mode.
- **Smart Session Dismissal**: Added 1-click dismiss (`✕`) with session-based memory so users can close the dock if desired while keeping header and footer install triggers active.

## [3.3.0] - 2026-08-18
- **Full Progressive Web App (PWA) Transformation**: Converted the BDCF Syndicate Portal into an installable mobile & desktop web application just like `wosbdc`.
- **Android & Chrome Native Installation**: Built `beforeinstallprompt` interception, standalone display mode, and instant 1-click **📲 Install App** button in the header and footer.
- **Apple iOS (iPhone & iPad) Safari Web App**:
  - Configured `apple-mobile-web-app-capable`, `apple-touch-icon` assets, and full-screen standalone status bar.
  - Built an animated visual installation guide modal with step-by-step instructions for adding the BDCF Crew app to the iOS Home Screen via Safari Share.
- **High-Resolution Vector & Raster Icons**: Designed custom 192x192 and 512x512 maskable SVG and PNG syndicate icons (`icon-192.svg`, `icon-512.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`).
- **Service Worker (`sw.js`) Offline Engine**: High-performance network-first asset caching strategy with offline fallbacks and dynamic cache invalidation on version updates.

## [3.2.0] - 2026-08-17
- **API Rate-Limit Shield & Admin-Only Sync Gating**: Removed public visitor API sync buttons and automated polling from both the Los Santos Weekly Hub and the BDCF Theater to prevent quota exhaustion and API hammering.
- **Dedicated Weekly Hub & APIs Tab in Admin Menu**:
  - Moved **Reddit Weekly Sync** behind Google Auth Admin gate.
  - Moved **Google Sheets Export & Apps Script Importer** into the secure Admin Menu.
  - Added visual anti-hammering status shield indicator.
- **Cleaned Public Navigation**: Replaced public sync buttons with clean portal navigation links.

## [3.1.0] - 2026-08-17
- **Live YouTube Playlist Auto-Sync Engine**: The portal now automatically connects with YouTube's live RSS feed on series switch and initial page load to detect newly uploaded videos.
- **Instant Deduplication & Auto-Prepend**: New YouTube uploads are automatically detected and placed at the top of their corresponding Category Box with zero manual configuration.
- **🔄 Sync with YouTube Button**: Added an interactive sync button in the Theater series header with rotation spin animation so visitors and admins can force an instant refresh on demand.
- **🔄 Sync All Series with YouTube**: Added bulk sync tool in the Admin Categories manager to scan and update all series simultaneously.

## [3.0.0] - 2026-08-17
- **Multi-Playlist Category Theater System**: Rebuilt the BDCF Theater with 5 authentic GTAO series category cards:
  - 🌴 **GTAO: Crew** (15 clips) — Syndicate operations, combat training, heists & missions
  - 😂 **GTAO Bloopers** (13 clips) — Fails, funny chaos, driving over mines & friendly fire
  - 🃏 **GTAO Meet n Greet** (3 clips) — Encounters with famous pop-culture characters like The Joker
  - 🎯 **GTAO Tricks** (15 clips) — Stunts, precision jumps, aerial trickshots & vehicle skills
  - ⚡ **GTAO Glitches** (5 clips) — Secret spots, wallbreaches & physics bugs
- **Dynamic Category Switching**: Clicking any series card illuminates it with a glowing neon purple gradient and instantly loads its clips into the drawer below.
- **Auto-Play on Category Switch**: Switching series immediately queues and starts playing that series' featured clip.
- **Admin Series & Categories Manager**: Create new category boxes from any YouTube playlist URL, manage series, delete clips, and add single videos to targeted categories.
- **Clip Badging**: Numbered badges (`#1`, `#2`, ...) and active video highlights.

## [2.2.1] - 2026-08-17
- **Commander Master Authorization**: Linked Commander UID and verified Google account for permanent Commander privileges.
- **Selectable & Copyable Popups**: All toast notifications, popup messages, and code snippets now allow easy text selection with mouse hover-pause timer so notifications never vanish while copying.

## [2.1.3] - 2026-08-17
- **Master Commander Google Auth**: Configured Master Commander role with instant Google Sign-In access and zero database prerequisites.
- **Auto-Sync to Firestore**: Automatically syncs Commander login and creates admin document in Firestore upon first sign-in.
- **Updated Firestore Security Rules**: Granted Master Commander full admin read/write permissions in cloud security rules.


## [2.1.2] - 2026-08-17
- **Email & UID Admin Resolution**: Allowed admin authorization lookup by either Document ID = `email` (e.g. `brian@gmail.com`) or Document ID = `uid`.
- **Improved Setup Experience**: Denial notification displays both copyable Email and UID for instant Firestore entry setup.
- **Seeded Firestore Collections**: Initialized `stats/siteStats` and verified public real-time connection.

## [2.1.1] - 2026-08-17
- **Live Firestore Deployment**: Automated deployment of `firestore.rules`, `.firebaserc`, and `firebase.json` via Firebase CLI directly to `the-bdcf-crew`.
- **Database Initialization**: Enabled Cloud Firestore and deployed security rules for `admins`, `stats` (page views), and `sessions` (live visitors).

## [2.1.0] - 2026-08-17
- **Live Visitor Counter**: Purple pulsing pill in the site header shows how many people are viewing the site right now in real-time, powered by Firestore session presence.
- **Total Page View Counter**: Footer stats strip tracks and displays cumulative page views using Firestore atomic increment — updates live without refresh.
- **Session Heartbeat**: Each visitor tab registers a Firestore session document and sends a heartbeat every 45 seconds; sessions expire after 2 minutes of inactivity.
- **Graceful Degradation**: Counter pill auto-hides if Firestore is not yet configured, preventing visible errors.
- **Footer Stats Bar**: New purple stats bar in the footer shows both Online Now and Total Views side-by-side.

## [2.0.0] - 2026-08-17
- **Firebase Google Auth Admin Gate**: Admin Menu is now locked behind Google Sign-In via Firebase Authentication.
- **Firestore Admin Allowlist**: Authorized users stored in Firestore `admins/{uid}` collection — add/remove officers instantly from Firebase Console with no code changes.
- **Auth State Persistence**: Officers stay signed in across page refreshes via Firebase session management.
- **Auth Status Bar**: Admin modal header displays signed-in user avatar, display name, and ADMIN role badge.
- **Sign Out Button**: One-click sign-out from within the Admin modal.
- **Access Denial with UID**: Unauthorized sign-ins show a copyable UID in a toast for easy Firestore bootstrap setup.
- **Auth-Aware Button**: Header "⚙️ Admin" button changes to "🔑 Admin Login" when signed out.

## [1.9.1] - 2026-08-17
- **Playlist → Individual Clips Importer**: Replaced "Master Playlist Embed" mode with a smarter importer — paste a playlist URL, click "🔍 Fetch Videos", preview the full list with real titles, then click "⚡ Import All Clips" to add them all as individual cards in the Theater grid.
- **RSS-Powered Video Fetch**: New `fetchPlaylistVideos()` engine pulls individual video IDs and titles from YouTube's public RSS feed (`/feeds/videos.xml`) via a CORS proxy — no API key needed.
- **Scrollable Video Preview**: Fetched video list shows in a scrollable purple-bordered panel with numbered titles before import.

## [1.9.0] - 2026-08-17
- **Real GTAO Bloopers Playlist**: Replaced all 4 placeholder fake videos with the authentic 10-clip GTAO Bloopers playlist from `@BrianDivaCox`, with real titles fetched via YouTube oEmbed API.
- **Auto-Load Playlist Feature**: Added "🔍 Fetch Info" button in Admin → Import Playlist (Option 1) — paste any YouTube Playlist URL to instantly preview the playlist title and author before activating it in the Theater.
- **Playlist Preview Box**: New animated purple preview panel shows playlist title, author, and ID when fetched, before committing the activation.
- **fetchPlaylistInfo() Engine**: New async helper uses YouTube public oEmbed endpoint to resolve any playlist URL to its real display name — no API key required.

## [1.8.1] - 2026-08-17
- **Official YouTube Channel Badge**: Linked Brian Cox's official YouTube channel (`youtube.com/@BrianDivaCox`) directly into the BDCF Theater Player.


## [1.8.0] - 2026-08-17
- **YouTube Playlist Embed Mode**: Added 1-click official YouTube playlist embedding with auto-play and full clip drawer (`embed/videoseries?list=...`).
- **Bulk Multi-Link Video Importer**: Paste 10+ YouTube links at once; the system extracts all IDs and fetches titles automatically via oEmbed.
- **Quick Import Action**: Added direct `📥 Import Playlist / Bulk Links` button in the Theater header.

## [1.7.0] - 2026-08-17
- **Streamlined Tab Navigation**: Replaced the long scrolling page with 3 clean tabs (Video Theater, Los Santos Weekly, Join The Crew).
- **Eliminated Duplicate Buttons**: Removed redundant pill buttons and repetitive links across the header, hero, and cards for a clean, focused UI.
- **Active Tab Memory**: Portal remembers your active tab across page refreshes.

## [1.6.0] - 2026-08-17
- **BDCF Syndicate Purple Theme**: Integrated the crew's signature purple (`#9333ea` / `#a855f7`) across both the main portal and Los Santos Weekly.
- **BDCF Admin Menu Engine**: Added full in-browser management modal to add/edit/delete YouTube videos, reorder playlists, update the Join Form URL, and edit crew announcements.
- **Featured Video Updated**: Set primary theater showcase to `https://youtu.be/jgp3oTp5WVU`.

## [1.5.0] - 2026-08-17
- **BDCF Crew Video Theater**: Added interactive cinema lounge with switchable YouTube video playlist.
- **Join The BDCF Crew Recruitment**: Added clear 3-step application guide and high-converting CTA to the official Google Form (`forms.gle/oXgaNAtLArsshFyQ7`).
- **Streamlined Layout**: Cleaned up the main portal into 3 core sections (Theater, Weekly Hub, and Join Us).

## [1.4.1] - 2026-08-17
- **Polished AAA Coming Soon UI**: Replaced generic effects with a sleek, dark cyber-noir design, ambient mesh glows, and direct launch button.

## [1.4.0] - 2026-08-17
- **BDCF Crew Coming Soon Hub**: Created animated cyber-noir main landing page at `https://thebdcfcrew.github.io`.
- **LosSantosWeekly Subfolder**: Moved Weekly Update Dashboard to dedicated `/LosSantosWeekly/` URL path.
- **Cross-Navigation**: Added fast navigation pills between BDCF Crew HQ and Los Santos Weekly.

## [1.3.0] - 2026-08-14
- **Strict Discount Filters**: Filtering by category (e.g. Properties, 100% Free, 40% Off) now strictly hides all unrelated items and showrooms.
- **Category Icons**: Added clear icons for properties (🏢), weapons (🔫), clothes (👕), free items (🎁), and vehicles (🚗).
- **Auto Discounts Parser**: Live Reddit sync now automatically detects and extracts all discount rates and categories.

## [1.2.0] - 2026-08-14
- **Clean 4-Tab Layout**: Decluttered the long page into 4 focused tabs (Weekly Tasks, Daily Objectives, Bonuses, Discounts).
- **Tab Memory**: Remembers your active tab across page refreshes.

## [1.1.0] - 2026-08-14
- **All Multipliers Supported**: Added dynamic support for all bonus tiers (5X, 4X, 3X, 2X, 1.5X, and speed boosts).
- **Dynamic Filter Buttons**: Filter pills automatically adapt to whatever bonus tiers are live this week.

## [1.0.0] - 2026-08-14
- **Initial Release**: Complete GTA Online Weekly Update tracker with live Thursday reset countdown, interactive checklists, Reddit sync, and 1-click Google Sheets export.
