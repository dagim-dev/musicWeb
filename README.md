# TuneFetch

TuneFetch is a Progressive Web App (PWA) that downloads YouTube audio as **320 kbps MP3** files with full ID3 metadata (artist, album, track number, cover art). Built as an Android-first university project with a native-app feel.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Android PWA (React + Vite + Tailwind)                      │
│  Zustand queue · Dexie library · TanStack Query · Socket.IO │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST + WebSocket
┌───────────────────────────▼─────────────────────────────────┐
│  FastAPI Backend (Docker / Railway)                           │
│  yt-dlp → FFmpeg (320k MP3) → mutagen ID3 → file delivery   │
└─────────────────────────────────────────────────────────────┘
```

### Tech stack

| Layer | Tools |
|-------|-------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| State | Zustand, TanStack Query, Dexie.js |
| PWA | vite-plugin-pwa, Workbox |
| Backend | FastAPI, python-socketio, uvicorn |
| Media | yt-dlp, FFmpeg, mutagen, Pillow |
| Security | CORS, slowapi rate limiting |
| Deploy | Vercel (frontend), Railway (backend), Docker |

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

- Docker & Docker Compose (recommended)
- **Python 3.11+** and **FFmpeg** (required for local backend without Docker)
- Node.js 22+ (optional, for local frontend without Docker)

### Run with Docker Compose

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Health check: http://localhost:8000/api/v1/health

### Run without Docker

**Backend:**

```bash
cd backend
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Use Python **3.11 or newer** — older versions (e.g. 3.9) ship with an outdated yt-dlp that cannot download from YouTube. Confirm at `/api/v1/health` that `ytdlp_version` is **2026.6.0** or later.

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` and `/socket.io` to `localhost:8000`.

## Deployment

See [DEPLOY.md](./DEPLOY.md) for step-by-step Railway + Vercel setup.

### Frontend (Vercel)

1. Import the repository and set root directory to `frontend`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variables:
   - `VITE_API_URL` = your Railway backend URL
   - `VITE_SOCKET_URL` = same Railway backend URL

### Backend (Railway)

1. Create a new Railway project from this repo
2. Railway uses `railway.toml` and `backend/Dockerfile`
3. Set environment variable:
   - `CORS_ORIGINS` = your Vercel frontend URL

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Server health, FFmpeg & yt-dlp versions |
| POST | `/api/v1/analyze` | Parse YouTube URL, return track list |
| POST | `/api/v1/jobs` | Start download/conversion job |
| GET | `/api/v1/jobs/{id}` | Job status (polling fallback) |
| GET | `/api/v1/jobs/{id}/tracks/{n}/file` | Download MP3 file |
| GET | `/api/v1/jobs/{id}/zip` | Download playlist ZIP |
| DELETE | `/api/v1/jobs/{id}` | Cancel job |

### Socket.IO events (room: `job:{id}`)

- `job:started`, `track:progress`, `track:complete`, `track:error`, `job:complete`

## Android / Samsung Music notes

PWAs save files via the browser download pipeline (typically the **Downloads** folder). Samsung Music scans storage for new MP3 files — proper ID3v2.3 tags (artist, album, track number, APIC cover art) ensure tracks appear correctly.

After each download, open Samsung Music to play your tracks.

## Demo script (3 minutes)

See [DEMO.md](./DEMO.md) for a step-by-step presentation script.

## Project structure

```
musicWebsite/
├── frontend/          # React PWA
├── backend/           # FastAPI + media pipeline
├── docker-compose.yml
├── railway.toml
└── .github/workflows/ # CI pipelines
```

## University disclaimer

This project is for educational demonstration only and is not intended for production use.
