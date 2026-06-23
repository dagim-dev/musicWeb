# TuneFetch — 3-Minute Demo Script

## Setup (before presenting)

1. Start the stack: `docker compose up --build`
2. Open http://localhost:5173 on your Android phone (same Wi‑Fi) or use Chrome DevTools mobile emulation
3. Confirm backend health at `/api/v1/health` shows FFmpeg and **yt-dlp 2026.6.0+**

## Script

### 1. Install the PWA (30 seconds)

> "TuneFetch is a Progressive Web App designed to feel like a native Android app."

- Show the **Install App** banner
- Tap Install → Add to Home Screen
- Launch from home screen — point out **no browser URL bar** (standalone mode)

### 2. Download a single track (45 seconds)

> "I'll paste a YouTube link and TuneFetch analyzes the metadata before downloading."

- Paste a short YouTube video URL
- Tap **Analyze** — show title, artist, thumbnail
- Tap **Add to Queue**
- Point out live progress stages: Downloading → Converting → Embedding metadata
- When complete, note the toast: **"Saved to Downloads"**

### 3. Download a playlist (60 seconds)

> "TuneFetch supports full playlists and album-style collections."

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

| Issue | Fix |
|-------|-----|
| Install banner missing | Use Chrome on Android; ensure HTTPS or localhost |
| Backend unreachable | Check `docker compose ps` and health endpoint |
| Download fails (403 / format not available) | Use **Python 3.11+** for the backend venv, then update yt-dlp: `pip install -U yt-dlp` in `backend/`. Re-check `/api/v1/health` for `ytdlp_version` ≥ 2026.6.0. Redeploy Railway after bumping `requirements.txt`. |
| Samsung Music doesn't show track | Wait for media scan, or check Downloads folder |
