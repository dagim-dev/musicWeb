# DgLabs

DgLabs is a local-only Progressive Web App (PWA) for downloading YouTube audio as **320 kbps MP3** files with full ID3 metadata. It is designed to run on your Mac and be accessed from your phone over the same Wi-Fi network.

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
| Workflow | Local development + LAN access |

## Features

- Installable PWA with a mobile-friendly UI
- YouTube video, playlist, and album-style playlist support
- Per-track progress updates for downloading, converting, tagging, and delivery
- Real-time Socket.IO updates with REST polling fallback
- Local library history with export/import support
- Duplicate detection before re-downloading
- Individual MP3 downloads or ZIP packaging for playlists

## Quick start

### Prerequisites

- Python **3.11+**
- `ffmpeg`
- Node.js **22+**
- A Mac and phone on the same Wi-Fi network

### Run the backend

```bash
cd /Users/dagi/musicWebsite/backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Confirm `yt-dlp` is recent enough for YouTube extraction:

```bash
/Users/dagi/musicWebsite/backend/.venv/bin/yt-dlp --version
```

### Run the frontend

```bash
cd /Users/dagi/musicWebsite/frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

The Vite dev server proxies `/api` and `/socket.io` to `localhost:8000`.

### Open it on your phone

```text
http://YOUR-MAC-LAN-IP:5173
```

Keep `VITE_API_URL` and `VITE_SOCKET_URL` unset for the browser PWA so it uses the local proxy. If you need LAN access, include your Mac's LAN origin in `backend/.env`.

## API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/v1/analyze` | Parse a YouTube URL and return track metadata |
| POST | `/api/v1/jobs` | Start a download or conversion job |
| GET | `/api/v1/jobs/{id}` | Fetch job status for polling fallback |
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

The browser PWA saves through the normal Downloads flow. The Capacitor APK can save to `Downloads/DgLabs/`. Samsung Music picks up new files after a media scan, so the embedded ID3 metadata matters.

## Additional docs

- [DEMO.md](./DEMO.md) for the 3-minute presentation flow
- [CAPACITOR.md](./CAPACITOR.md) for the Android APK build
- [SUBMISSION.md](./SUBMISSION.md) for the university handoff summary

## Project structure

```text
musicWebsite/
├── frontend/          # React PWA
├── backend/           # FastAPI media pipeline
├── docs/              # Additional local notes
└── docker-compose.yml
```

## University disclaimer

This project is for educational demonstration only and is not intended for production use.
