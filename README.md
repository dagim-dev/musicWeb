# DgLabs

DgLabs is a local-only Progressive Web App (PWA) that turns online audio into **320 kbps MP3** files with full ID3 metadata. The backend runs on your Mac, and you use the app from your phone over the same Wi-Fi network, with live progress for every track.

**[Read the case study →](https://dagimak.netlify.app/projects/dglabs)**

## Architecture

```text
Android PWA (React + Vite + Tailwind)
    -> REST + WebSocket
FastAPI backend on your Mac
    -> yt-dlp -> FFmpeg -> mutagen -> file delivery
```

### Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| State | Zustand, TanStack Query, Dexie |
| PWA | vite-plugin-pwa, Workbox |
| Backend | FastAPI, python-socketio, uvicorn |
| Media | yt-dlp, FFmpeg, mutagen, Pillow |
| Android | Capacitor |
| CI | GitHub Actions (frontend build, backend image build) |

## Features

- Installable PWA with a mobile-friendly UI
- Single videos, playlists, and album-style playlists
- Per-track progress for downloading, converting, tagging, and delivery
- Real-time Socket.IO updates with REST polling as a fallback
- Local library history with export and import
- Duplicate detection before re-downloading
- Individual MP3 downloads, or a ZIP for playlists

## Quick start

### Prerequisites

- Python **3.11+**
- Node.js **22+**
- FFmpeg (`brew install ffmpeg` on macOS)
- A Mac and a phone on the same Wi-Fi network

### 1. Clone the repo

```bash
git clone https://github.com/dagim-dev/musicWeb.git
cd musicWeb
```

### 2. Start the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

YouTube extraction breaks when yt-dlp is out of date. Check the version with `yt-dlp --version`, and update it with `pip install -U yt-dlp` if downloads start failing.

### 3. Start the frontend

In a second terminal, from the repo root:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

The Vite dev server proxies `/api` and `/socket.io` to `localhost:8000`, so the phone only needs to reach port 5173.

### 4. Open it on your phone

```text
http://YOUR-MAC-LAN-IP:5173
```

Leave `VITE_API_URL` and `VITE_SOCKET_URL` unset for the browser PWA so it uses the dev-server proxy. If you need the phone to call the backend directly, add your Mac's LAN origin to `CORS_ORIGINS` in `backend/.env`, for example:

```text
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://192.168.1.20:5173
```

## API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/v1/analyze` | Parse a URL and return track metadata |
| POST | `/api/v1/jobs` | Start a download and conversion job |
| GET | `/api/v1/jobs/{id}` | Fetch job status (polling fallback) |
| GET | `/api/v1/jobs/{id}/tracks/{n}/file` | Download an MP3 file |
| GET | `/api/v1/jobs/{id}/zip` | Download a playlist ZIP |
| DELETE | `/api/v1/jobs/{id}` | Cancel a running job |

### Socket.IO events

- `job:started`
- `track:progress`
- `track:complete`
- `track:error`
- `job:complete`

## Android / Samsung Music notes

The browser PWA saves files through the normal Downloads flow. The Capacitor APK can save to `Downloads/DgLabs/`. Samsung Music picks up new files after a media scan, which is why the embedded ID3 metadata matters.

## Additional docs

- [DEMO.md](./DEMO.md): the 3-minute presentation flow
- [CAPACITOR.md](./CAPACITOR.md): building the Android APK
- [SUBMISSION.md](./SUBMISSION.md): the university hand-off summary

## Project structure

```text
musicWeb/
├── frontend/            # React PWA (plus the Capacitor Android project)
├── backend/             # FastAPI media pipeline
├── .github/workflows/   # CI for the frontend and backend
└── docker-compose.yml
```

## Disclaimer

DgLabs is a university project built for educational demonstration only. It is not a hosted service and is not intended for production use. Only download audio you own or have permission to use, and follow the terms of service of the sites you use it with.
