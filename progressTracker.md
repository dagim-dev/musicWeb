# TuneFetch — Progress Tracker

> **Last updated:** 2026-06-24  
> **Source of truth:** [`fullPlan.md`](./fullPlan.md)  
> **Target version:** Version 1 (Full-Stack Cloud) + V4 local Docker scaffolding  
> **Overall status:** ~99% — **Android downloads verified; polish + demo milestones remain**

---

## Resume here (start next session)

**Android single-track + playlist/album downloads work.** Core app is feature-complete. This session added PWA icons, theme toggle, and form polish.

### Do this first (device, ~10 minutes)

1. Open **https://music-web-dagimak.vercel.app** on your Android phone (Chrome).
2. **Add to Home Screen** — tap Install banner or Chrome menu → Add to Home Screen (M2).
3. Launch from home screen — confirm **no browser URL bar** (standalone PWA).
4. Run through [`DEMO.md`](./DEMO.md) end-to-end (M7).

### If production downloads fail (“Sign in to confirm you’re not a bot”)

Railway health currently shows `youtube_cookies: false`. Set cookies once:

```bash
cd /Users/dagi/musicWebsite
./scripts/encode-youtube-cookies.sh chrome
```

Paste output into Railway → **tunefetch** → **Variables** → `YOUTUBE_COOKIES_BASE64` → redeploy.  
Verify: https://tunefetch-production.up.railway.app/api/v1/health → `"youtube_cookies": true`

*(If you tested on local/LAN instead of Vercel, production still needs this step.)*

### Then (optional)

- [ ] Push latest frontend polish to `main` (icons, theme toggle) so Vercel redeploys
- [ ] Record or rehearse the 3-min demo for submission (M7)
- [ ] Stretch: Capacitor share-to-Samsung-Music (V3 in fullPlan)

---

## Live URLs (production)

| Service | URL | Status |
|---------|-----|--------|
| **App (use this)** | **https://music-web-dagimak.vercel.app** | Live — share this for demos |
| Backend API | https://tunefetch-production.up.railway.app | Live — health OK |
| Health check | https://tunefetch-production.up.railway.app/api/v1/health | `youtube_cookies` must be `true` for cloud downloads |
| GitHub | https://github.com/dagim-dev/musicWeb | `main` auto-deploys to Railway + Vercel |

**Vercel env (Production):** `VITE_API_URL` and `VITE_SOCKET_URL` = `https://tunefetch-production.up.railway.app` (no trailing slash).

---

## At a Glance

| Metric | Status |
|--------|--------|
| **Architecture version** | V1 (V4 Docker Compose included; V3 Capacitor not started) |
| **Core app** | Built and verified on Mac + Android (single + playlist/album) |
| **Production deploy** | Railway + Vercel live |
| **Device verification** | Android downloads + Samsung Music tags verified by user |
| **Estimated completion** | MVP ~100% · Full V1 ~99% · M6 ~95% · M7 open |

---

## Plan To-Dos (from fullPlan.md)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| `scaffold-monorepo` | Monorepo: React/Vite + FastAPI + Docker | ✅ Completed | `frontend/`, `backend/`, root `Dockerfile`, `docker-compose.yml`. |
| `backend-pipeline` | yt-dlp → FFmpeg 320k → mutagen ID3 | ✅ Completed | Cookie support for cloud (`ytdlp_config.py`). |
| `socket-progress` | Socket.IO per-track progress | ✅ Completed | Works locally; polling fallback on production. |
| `pwa-shell` | PWA manifest, icons, install prompt, mobile shell | ✅ Completed | Icons generated (`public/icons/`), `favicon.ico`, install banner, onboarding. |
| `download-queue-ui` | Zustand queue, TanStack Query, progress UI, file save | ✅ Completed | Reorder, retry, `showSaveFilePicker` fallback. |
| `dexie-library` | Library, history, duplicate detection | ✅ Completed | Re-download action wired. |
| `playlist-zip` | Multi-track jobs + ZIP packaging | ✅ Completed | `zipstream-ng` streaming ZIP. |
| `deploy-harden` | Railway, Vercel, CORS, rate limits | 🟡 Partially Completed | Deployed. Set `YOUTUBE_COOKIES_BASE64` if using production API. |
| `demo-polish` | UX polish, README, demo script | 🟡 Partially Completed | Dark/light theme, `@tailwindcss/forms`, `DEMO.md` — run demo on device (M7). |

---

## Development Phases (fullPlan.md §4)

| Phase | Deliverable | Status | Notes |
|-------|-------------|--------|-------|
| 0 — Scaffold | Monorepo, Docker local, CI skeleton | ✅ Completed | |
| 1 — Backend core | Analyze + single-track MP3 pipeline | ✅ Completed | |
| 2 — Socket.IO | Stage events + FFmpeg progress | ✅ Completed | |
| 3 — Frontend + PWA | Installable app, routing, design system | ✅ Completed | |
| 4 — Download flow | Queue, progress UI, file save | ✅ Completed | |
| 5 — Library + duplicates | Dexie, library screen | ✅ Completed | |
| 6 — Playlist/album | Multi-track jobs, ZIP | ✅ Completed | |
| 7 — Deploy + harden | Vercel/Railway, CORS, rate limits | 🟡 Partially Completed | Live; cookies optional if testing locally only. |
| 8 — Polish + demo | UX pass, README, demo script | 🟡 Partially Completed | Theme + icons done; M7 demo run pending. |

---

## Milestones (fullPlan.md § Milestone Checklist)

| # | Milestone | Status | Notes |
|---|-----------|--------|-------|
| M0 | `docker compose up` → health OK, FFmpeg detected | 🟡 Partially Completed | Local venv verified; Docker not tested. |
| M1 | Paste URL → MP3 in Android Downloads with tags | ✅ Completed | Artist + cover verified in Samsung Music. |
| M2 | Add to Home Screen → standalone, no URL bar | 🟡 Partially Completed | HTTPS on Vercel ready; user should install from production URL. |
| M3 | 10-track playlist with per-track progress | ✅ Completed | User verified playlist + album on Android. |
| M4 | Library visible offline (metadata) | 🟡 Partially Completed | Implemented; re-test on installed PWA. |
| M5 | Re-paste URL → duplicate modal | 🟡 Partially Completed | Implemented; not verified on production. |
| M6 | Public Vercel + Railway, rate limits on | 🟡 Partially Completed | Deployed; cloud downloads need cookies if not already set. |
| M7 | 3-min demo: install → playlist → Samsung Music | ⏳ Not Started | Follow [`DEMO.md`](./DEMO.md) on device. |

---

## Blocked Items

| Item | Status | Reason |
|------|--------|--------|
| Production YouTube cookies | ⚠️ Optional | Only needed for Vercel → Railway downloads. Health: `youtube_cookies: false` as of 2026-06-24. |
| YouTube cookie expiry | ⏳ Ongoing | Re-run `scripts/encode-youtube-cookies.sh` every few weeks when cloud downloads fail. |

---

## Session Log

| Date | Summary |
|------|---------|
| 2026-06-23 | Initial V1 implementation: monorepo, backend pipeline, PWA frontend, Dexie library, deploy configs, README + DEMO. |
| 2026-06-23 | Fixed YouTube 403 locally (Python 3.11 + yt-dlp 2026.06.09). Single-track API verified. |
| 2026-06-23 | Closed V1 gaps: queue reorder/retry, filename template, save picker, library re-download, job TTL. |
| 2026-06-23 | Android playlist OK; fixed artist + cover art in ID3 tags. |
| 2026-06-23 | Production prep: `DEPLOY.md`, `vercel.json`, zipstream-ng ZIP streaming. |
| 2026-06-23 | Deploy session: GitHub, Railway, Vercel live, CORS fix, YouTube cookie code added. |
| 2026-06-24 | User confirmed Android downloads (music + albums). Added PWA icons, `favicon.ico`, dark/light/system theme, `@tailwindcss/forms`. |

---

## Quick Reference

| Resource | Path |
|----------|------|
| Architecture plan | [`fullPlan.md`](./fullPlan.md) |
| **Deploy + resume guide** | [`DEPLOY.md`](./DEPLOY.md) |
| Cookie export script | [`scripts/encode-youtube-cookies.sh`](./scripts/encode-youtube-cookies.sh) |
| Regenerate PWA icons | `cd frontend && npm run icons` |
| Run locally | `docker compose up --build` or see README |
| Demo script | [`DEMO.md`](./DEMO.md) |
| API prefix | `/api/v1` |

---

*Update **Last updated**, **Resume here**, and **Session Log** after each development session.*
