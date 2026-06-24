# TuneFetch — University Submission Package

> **Live demo URL:** https://music-web-dagimak.vercel.app  
> **Repository:** https://github.com/dagim-dev/musicWeb  
> **API:** https://tunefetch-production.up.railway.app/api/v1/health

---

## Project summary

TuneFetch is an **Android-first Progressive Web App** that downloads YouTube audio as **320 kbps MP3** files with full **ID3v2.3 metadata** (artist, album, track number, embedded cover art). Files save to the device Downloads folder and appear in **Samsung Music** after a media scan.

Built as a full-stack university project: React/Vite frontend on Vercel, FastAPI media pipeline on Railway, real-time progress via Socket.IO.

---

## Milestone checklist (all verified)

| # | Milestone | Status |
|---|-----------|--------|
| M0 | Dev environment — health OK, FFmpeg detected | ✅ |
| M1 | Paste URL → MP3 in Android Downloads with tags | ✅ |
| M2 | Add to Home Screen → standalone PWA | ✅ |
| M3 | Playlist/album download with per-track progress | ✅ |
| M4 | Library visible offline (local metadata) | ✅ |
| M5 | Re-paste URL → duplicate detection modal | ✅ |
| M6 | Public Vercel + Railway deployment | ✅ |
| M7 | 3-minute demo flow (install → download → Samsung Music) | ✅ |

---

## Architecture

```mermaid
flowchart TB
    subgraph client [Android PWA — Vercel]
        UI[React UI]
        Zustand[Zustand Queue]
        Dexie[Dexie IndexedDB]
        SW[Service Worker]
    end

    subgraph server [FastAPI — Railway]
        API[REST API]
        SIO[Socket.IO]
        YTDLP[yt-dlp]
        FFMPEG[FFmpeg 320k]
        TAGS[mutagen ID3]
    end

    UI -->|analyze / jobs| API
    UI <-->|progress| SIO
    API --> YTDLP --> FFMPEG --> TAGS
    UI -->|save MP3| Downloads[Device Downloads]
    Downloads --> Samsung[Samsung Music]
```

### Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4 |
| Client state | Zustand, TanStack Query, Dexie.js |
| PWA | vite-plugin-pwa, Workbox, install prompt |
| Backend | FastAPI, python-socketio, uvicorn |
| Media | yt-dlp, FFmpeg (libmp3lame 320k), mutagen, Pillow |
| Security | CORS origin lock, slowapi rate limits |
| Deploy | Vercel (CDN frontend), Railway (Docker backend) |

---

## Key features demonstrated

- Installable PWA with custom icons and dark/light theme
- YouTube video, playlist, and album-style URL analysis
- Per-track pipeline stages: download → convert → tag → deliver
- Real-time Socket.IO progress with REST polling fallback
- Download queue with reorder, cancel, retry failed tracks
- Individual MP3 or streaming ZIP for playlists
- Local library with offline metadata and cached cover thumbnails
- Duplicate detection before re-downloading
- Library export/import (JSON backup)
- Samsung Music integration (post-download shortcut)

---

## 3-minute demo script

See [`DEMO.md`](./DEMO.md) for the full presenter script.

**Quick flow:**

1. Open https://music-web-dagimak.vercel.app on Android Chrome
2. Install to Home Screen → launch standalone
3. Paste a YouTube URL → Analyze → Add to Queue
4. Show per-track progress stages
5. Tap **Open Samsung Music** → verify artist, album, cover art
6. Library tab → show offline history and duplicate detection

---

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/health` | Server status, FFmpeg, yt-dlp version |
| POST | `/api/v1/analyze` | Parse YouTube URL |
| POST | `/api/v1/jobs` | Start download job |
| GET | `/api/v1/jobs/{id}` | Job status (polling) |
| GET | `/api/v1/jobs/{id}/tracks/{n}/file` | MP3 download |
| GET | `/api/v1/jobs/{id}/zip` | Playlist ZIP |
| DELETE | `/api/v1/jobs/{id}` | Cancel job |

---

## Local development

```bash
docker compose up --build
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000/api/v1/health
```

See [`README.md`](./README.md) and [`DEPLOY.md`](./DEPLOY.md) for full setup.

---

## Known limitations (documented)

- PWA saves to Downloads via browser pipeline — not direct Samsung Music library injection
- 320 kbps re-encodes best available YouTube source (cannot exceed source quality)
- Cloud downloads require YouTube session cookies — upload in **Settings → YouTube Session** (extension export) or set `YOUTUBE_COOKIES_BASE64` on Railway for all users (see [`docs/YOUTUBE_COOKIES.md`](./docs/YOUTUBE_COOKIES.md))
- No user accounts or in-app audio player (out of scope)

---

## Disclaimer

This project is for **educational demonstration only**. It is not intended for production use or copyright-infringing distribution.
