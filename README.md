# DgLabs

DgLabs is a Progressive Web App (PWA) that downloads YouTube audio as **320 kbps MP3** files with full ID3 metadata (artist, album, track number, cover art). Built as an Android-first university project with a native-app feel.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Android PWA (React + Vite + Tailwind)                      │
│  Zustand queue · Dexie library · TanStack Query · Socket.IO │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST + WebSocket
┌───────────────────────────▼─────────────────────────────────┐
│  FastAPI Backend (local Mac + phone over Wi‑Fi)              │
│  yt-dlp → FFmpeg (320k MP3) → mutagen ID3 → file delivery   │
└─────────────────────────────────────────────────────────────┘
```

### Tech stack

| Layer    | Tools                                    |
| -------- | ---------------------------------------- |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| State    | Zustand, TanStack Query, Dexie.js        |
| PWA      | vite-plugin-pwa, Workbox                 |
| Backend  | FastAPI, python-socketio, uvicorn        |
| Media    | yt-dlp, FFmpeg, mutagen, Pillow          |
| Security | CORS, slowapi rate limiting              |
| Workflow | Local dev + LAN access on the same Wi‑Fi |

## Features

- Installable PWA with standalone display and custom icons
- YouTube video, playlist, and album-style playlist support
- Per-track progress: downloading → converting → tagging → delivering
- Real-time Socket.IO updates with REST polling fallback
- Local music library with offline metadata browsing
- Duplicate detection before re-downloading
- Download queue with cancel support
- Individual MP3 files or ZIP packaging for playlists
- Library export/import (JSON backup)

## Quick start (local)

### Prerequisites

- **Python 3.11+** and **FFmpeg**
- Node.js 22+
- A phone and Mac on the same Wi‑Fi network

### Run the backend

```bash
cd backend
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Use Python **3.11 or newer** — older versions (e.g. 3.9) ship with an outdated yt-dlp that cannot download from YouTube. Confirm at `/api/v1/health` that `ytdlp_version` is **2026.6.0** or later.

### Run the frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

The Vite dev server proxies `/api` and `/socket.io` to `localhost:8000`.

### Access from your phone

Open this URL on your phone’s browser while both devices are on the same Wi‑Fi network:

```text
http://YOUR-MAC-LAN-IP:5173
```

The backend stays on `127.0.0.1:8000` and is reached locally by the Vite proxy, so no public deployment is required.

## Local development notes

- The frontend already uses the Vite proxy for `/api` and `/socket.io`.
- Keep `VITE_API_URL` and `VITE_SOCKET_URL` empty in the frontend env so the app uses the relative-path proxy.
- Your backend CORS list should include your Mac’s LAN address, for example `http://192.168.x.x:5173`.

## API overview

| Method | Endpoint                            | Description                                           |
| ------ | ----------------------------------- | ----------------------------------------------------- |
| GET    | `/api/v1/health`                    | Server health, FFmpeg, yt-dlp, `youtube_cookies` flag |
| POST   | `/api/v1/analyze`                   | Parse YouTube URL, return track list                  |
| POST   | `/api/v1/jobs`                      | Start download/conversion job                         |
| GET    | `/api/v1/jobs/{id}`                 | Job status (polling fallback)                         |
| GET    | `/api/v1/jobs/{id}/tracks/{n}/file` | Download MP3 file                                     |
| GET    | `/api/v1/jobs/{id}/zip`             | Download playlist ZIP                                 |
| DELETE | `/api/v1/jobs/{id}`                 | Cancel job                                            |

### Socket.IO events (room: `job:{id}`)

- `job:started`, `track:progress`, `track:complete`, `track:error`, `job:complete`

## Android / Samsung Music notes

PWAs save files via the browser download pipeline (typically the **Downloads** folder). Samsung Music scans storage for new MP3 files — proper ID3v2.3 tags (artist, album, track number, APIC cover art) ensure tracks appear correctly.

After each download, open Samsung Music to play your tracks.

## Demo script (3 minutes)

See [DEMO.md](./DEMO.md) for a step-by-step presentation script.

## Android APK (Capacitor)

See [CAPACITOR.md](./CAPACITOR.md) to build the native Android app. For the APK, point the app at your Mac’s LAN IP instead of a public URL.

## Project structure

```
musicWebsite/
├── frontend/          # React PWA
├── backend/           # FastAPI + media pipeline
├── docs/              # Cookies and local setup notes
└── docker-compose.yml
```

## University disclaimer

This project is for educational demonstration only and is not intended for production use.
