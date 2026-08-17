# 🌴 Los Santos Weekly — Changelog

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
