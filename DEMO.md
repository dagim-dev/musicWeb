# DgLabs — 3-Minute Demo Script

## Setup (before presenting)

**Local LAN demo (recommended):**

1. Start the backend and frontend on your Mac.
2. Open `http://YOUR-MAC-LAN-IP:5173` on your Android phone (Chrome) while both devices are on the same Wi‑Fi network.
3. Open **Settings** once to confirm the theme controls, backup tools, and download-folder guidance are available.

**Local fallback:**

1. Start the stack with `docker compose up --build` (or run backend + frontend dev servers directly).
2. Open `http://localhost:5173` on the same Mac or use Chrome DevTools mobile emulation.
3. Confirm the app can analyze a known public YouTube URL before you begin the live presentation.

## Script

### 1. Install the PWA (30 seconds)

> "DgLabs is a Progressive Web App designed to feel like a native Android app."

- Show the **Install App** banner
- Tap Install → Add to Home Screen
- Launch from home screen — point out **standalone mode** if available

### 2. Download a single track (45 seconds)

> "I'll paste a YouTube link and DgLabs analyzes the metadata before downloading."

- Paste a short YouTube video URL
- Tap **Analyze** — show title, artist, thumbnail
- Tap **Add to Queue**
- Point out live progress stages: Downloading → Converting → Embedding metadata
- When complete, note the toast: **"Saved to Downloads"**

### 3. Download a playlist (60 seconds)

> "DgLabs supports full playlists and album-style collections."

- Paste a YouTube playlist URL
- Show track selection (deselect one track to demonstrate choice)
- Choose **Individual files** or **ZIP package**
- Show per-track progress: "Track 4 of 12 — Converting 67%"
- For ZIP mode, tap **Download ZIP** when the job completes

### 4. Library & duplicate detection (30 seconds)

> "All download history is stored locally and works offline."

- Switch to **Library** tab
- Show previously downloaded tracks with cover art
- Search by artist or title
- Return to Home, paste the same URL again
- Show the **Already downloaded** modal — choose Skip or Download anyway

### 5. Samsung Music (15 seconds)

> "Files save to Downloads with full ID3 tags. Samsung Music picks them up automatically."

- Open Samsung Music on the device
- Show the downloaded track with correct artist, album, and cover art

## Troubleshooting

| Issue                                       | Fix                                                                                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Install banner missing                      | Use Chrome on Android; local HTTP may behave differently from HTTPS                                                                       |
| “Failed to fetch” on local demo             | Check the LAN IP, confirm the backend is running, and ensure the backend CORS list includes your Mac’s address                            |
| “Sign in to confirm you’re not a bot”       | Try a different public video or playlist and confirm `yt-dlp` is up to date on the Mac backend                                           |
| Backend unreachable (local)                 | Check `docker compose ps` or confirm `uvicorn` is running on port 8000                                                                    |
| Download fails (403 / format not available) | Ensure Python 3.11+ and a current `yt-dlp` build are installed on the backend                                                             |
| Samsung Music doesn't show track            | Wait for media scan, or check Downloads folder                                                                                            |
