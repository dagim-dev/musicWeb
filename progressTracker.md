# TuneFetch — Progress Tracker

> **Last updated:** 2026-06-23  
> **Source of truth:** [`fullPlan.md`](./fullPlan.md)  
> **Target version:** Version 1 (Full-Stack Cloud) + V4 local Docker scaffolding  
> **Overall status:** ~95% code-complete — **ready for production deploy (M6)**

---

## At a Glance

| Metric | Status |
|--------|--------|
| **Architecture version** | V1 (V4 Docker Compose included; V3 Capacitor not started) |
| **Core app (local)** | Built — frontend + backend + media pipeline |
| **Production deploy** | Not deployed (configs only) |
| **Device verification** | Android playlist + Samsung Music artist/cover verified by user |
| **Estimated completion** | MVP ~100% · Full V1 spec ~95% · M1/M3 partial on device · M6–M7 open |

**Resume here:** [Current Focus / Next Steps](#current-focus--next-steps)

---

## Plan To-Dos (from fullPlan.md)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| `scaffold-monorepo` | Monorepo: React/Vite + FastAPI + Docker | ✅ Completed | `frontend/`, `backend/`, `docker-compose.yml`, `Dockerfile`. Uses `requirements.txt` + pip instead of `uv` + `uv.lock` per plan. |
| `backend-pipeline` | yt-dlp → FFmpeg 320k → mutagen ID3 | ✅ Completed | `/api/v1/analyze`, `/api/v1/jobs`, track file + ZIP endpoints in place. |
| `socket-progress` | Socket.IO per-track progress | ✅ Completed | Events: `job:started`, `track:progress`, `track:complete`, `track:error`, `job:complete`. REST polling fallback in `HomePage`. |
| `pwa-shell` | PWA manifest, icons, install prompt, mobile shell | 🟡 Partially Completed | `vite-plugin-pwa`, icons, `InstallBanner`, bottom nav, dark UI. Missing: `favicon.ico`, `@tailwindcss/forms`. |
| `download-queue-ui` | Zustand queue, TanStack Query, progress UI, file save | 🟡 Partially Completed | Queue, cancel, reorder UI, retry failed, `showSaveFilePicker` fallback. |
| `dexie-library` | Library, history, duplicate detection | ✅ Completed | Dexie schema, Library page, search/sort, duplicate modal, re-download action. |
| `playlist-zip` | Multi-track jobs + ZIP packaging | ✅ Completed | `zipstream-ng` streaming ZIP endpoint; no on-disk zip buffer. |
| `deploy-harden` | Railway, Vercel, CORS, rate limits | 🟡 Partially Completed | `railway.toml`, `frontend/vercel.json`, `DEPLOY.md`, CORS, slowapi, CI. **Not live-deployed.** |
| `demo-polish` | UX polish, README, demo script | 🟡 Partially Completed | `README.md`, `DEMO.md`, onboarding carousel, skeleton loaders, toasts. Missing: retry/resume, haptics, dark-mode toggle. |

---

## Development Phases (fullPlan.md §4)

| Phase | Deliverable | Status | Notes |
|-------|-------------|--------|-------|
| 0 — Scaffold | Monorepo, Docker local, CI skeleton | ✅ Completed | CI builds frontend + Docker image; no auto-deploy workflows. |
| 1 — Backend core | Analyze + single-track MP3 pipeline | ✅ Completed | Full pipeline in `backend/app/services/`. |
| 2 — Socket.IO | Stage events + FFmpeg progress | ✅ Completed | FFmpeg `time=` parsing for convert %. Download-stage % simplified. |
| 3 — Frontend + PWA | Installable app, routing, design system | ✅ Completed | Tab-based nav (not react-router). Premium dark mobile UI. |
| 4 — Download flow | Queue, progress UI, file save | ✅ Completed | Reorder, retry, save picker fallback wired. |
| 5 — Library + duplicates | Dexie, library screen | ✅ Completed | Re-download from Library page. |
| 6 — Playlist/album | Multi-track jobs, ZIP | ✅ Completed | Streaming ZIP via zipstream-ng. |
| 7 — Deploy + harden | Vercel/Railway, CORS, rate limits | ⏳ Not Started | Config files exist; no public URLs. |
| 8 — Polish + demo | UX pass, README, demo script | 🟡 Partially Completed | Docs written; live demo not run. |

---

## Feature Checklist

### MVP-critical (Weeks 1–4)

| Feature | Status | Notes |
|---------|--------|-------|
| PWA install prompt + standalone + icons | ✅ Completed | `usePwaInstall`, manifest in `vite.config.ts`, PNG icons in `public/icons/`. |
| Paste URL → analyze video/playlist/album | ✅ Completed | `POST /api/v1/analyze`, track selection UI. |
| Per-track download stages | ✅ Completed | queued → downloading → converting → tagging → delivering → done |
| Real-time progress UI | ✅ Completed | Socket.IO + 2s REST polling fallback. |
| MP3 @ 320 kbps + ID3 metadata | ✅ Completed | `libmp3lame -b:a 320k`, ID3v2.3 via mutagen. |
| Android file save (Blob + download) | ✅ Completed | `useFileSave.ts` — anchor download + `showSaveFilePicker` fallback. |
| Local library (Dexie) | ✅ Completed | Tracks + download history + settings tables. |
| Duplicate detection | ✅ Completed | By `youtubeId`; modal with skip/continue. |
| Download queue | ✅ Completed | Add jobs, cancel, reorder, retry failed. |

### Polish (Weeks 5–6)

| Feature | Status | Notes |
|---------|--------|-------|
| ZIP + individual file modes | ✅ Completed | Mode toggle on Home; `GET /jobs/{id}/zip`. |
| Dark mode | 🟡 Partially Completed | Dark-first only; no light/dark toggle. |
| Haptic-style micro-interactions | ⏳ Not Started | — |
| Skeleton loaders | ✅ Completed | Library page loading state. |
| Offline app shell + cached thumbnails | ✅ Completed | Workbox + `thumbnailBlob` in Dexie. |
| Retry failed tracks / resume queue | ✅ Completed | Retry failed button on queue items. |
| Empty states + onboarding | ✅ Completed | Library empty state; `OnboardingCarousel`. |

### Stretch (Weeks 7–8)

| Feature | Status | Notes |
|---------|--------|-------|
| Filename template (`{artist} - {title}.mp3`) | ✅ Completed | Settings template applied on client save in `useFileSave.ts`. |
| Export/import library JSON | ✅ Completed | Settings page backup/restore. |
| Redis job persistence | ⏳ Not Started | In-memory jobs only; `job_ttl_seconds` in config unused. |
| Capacitor + Samsung Music share (V3 stretch) | ⏳ Not Started | Optional per plan; not begun. |

---

## Milestones (fullPlan.md § Milestone Checklist)

| # | Milestone | Status | Notes |
|---|-----------|--------|-------|
| M0 | `docker compose up` → health OK, FFmpeg detected | 🟡 Partially Completed | Verified without Docker: health OK, FFmpeg + yt-dlp 2026.06.09 on Python 3.11. Docker not tested in this environment. |
| M1 | Paste URL → MP3 in Android Downloads with tags | ✅ Completed | User verified on Android; artist + cover art fixed. |
| M2 | Add to Home Screen → standalone, no URL bar | 🟡 Partially Completed | PWA config in place; full install demo needs HTTPS (Vercel deploy). |
| M3 | 10-track playlist with per-track progress | ✅ Completed | User verified playlist download on Android. |
| M4 | Library visible offline (metadata) | 🟡 Partially Completed | Dexie + SW caching implemented; not manually verified. |
| M5 | Re-paste URL → duplicate modal | 🟡 Partially Completed | Implemented; not manually verified. |
| M6 | Public Vercel + Railway, rate limits on | ⏳ Not Started | Deploy configs only. |
| M7 | 3-min demo: install → playlist → Samsung Music | ⏳ Not Started | `DEMO.md` written; not executed. |

---

## Version Alignment

| Version | Description | Status |
|---------|-------------|--------|
| **V1** — Full-Stack Cloud | Primary target (React PWA + FastAPI + Railway/Vercel) | 🟡 ~85% — code built, deploy + verification open |
| **V2** — MVP-first phasing | Internal execution strategy | Superseded — features beyond MVP already merged |
| **V3** — Capacitor hybrid | Native file access + Samsung Music share | ⏳ Not Started |
| **V4** — Local Docker demo | `docker compose` local dev | 🟡 Scaffold included in repo |

---

## Infrastructure & Tooling Gaps

| Item | Plan spec | Current state |
|------|-----------|---------------|
| Python deps | `uv` + `uv.lock` | `requirements.txt` + pip in Dockerfile |
| ZIP streaming | `zipstream-ng` | `zipstream-ng` streaming in `zip_builder.py` + `GET /jobs/{id}/zip` |
| Job TTL cleanup | 1-hour cron/TTL | Implemented — background task every 5 min in `main.py` lifespan |
| Tailwind forms | `@tailwindcss/forms` | Not installed |
| Favicon | `favicon.ico` | `favicon.svg` only |
| CI/CD | Auto-deploy main | Build/lint CI only (`.github/workflows/`) |
| React Router | Listed in plan | Installed but unused — tab state via Zustand |

---

## Recent Accomplishments

- **Full monorepo scaffolded** — `frontend/` (React + Vite + TS) and `backend/` (FastAPI) with shared `docker-compose.yml`.
- **Media pipeline implemented** — yt-dlp extraction, FFmpeg 320 kbps MP3 conversion, mutagen ID3v2.3 tagging with Pillow cover art.
- **REST API complete** — analyze, jobs, health, per-track file download, ZIP download, job cancel.
- **Socket.IO realtime layer** — per-track progress events with REST polling fallback.
- **PWA configured** — manifest, service worker, install banner, app icons, offline shell.
- **Frontend feature set** — Home (URL paste, analyze, queue), Library (search/sort/delete), Settings (health, backup, Samsung tip).
- **Local persistence** — Dexie library with duplicate detection modal and export/import.
- **Deploy scaffolding** — `Dockerfile`, `railway.toml`, `vercel.json`, CORS, slowapi rate limits.
- **Documentation** — `README.md` architecture overview and `DEMO.md` presentation script.
- **Frontend production build** — `npm run build` passes.
- **YouTube download fix** — Bumped yt-dlp to ≥2026.6.0, Python 3.11+ venv, broader format fallback in `youtube.py`. Resolved 403 errors caused by outdated yt-dlp on Python 3.9.
- **V1 spec gaps closed** — queue reorder/retry/dismiss, filename template on save, `showSaveFilePicker` fallback, library re-download, job TTL cleanup.

---

## Current Focus / Next Steps

Priority order for resuming development:

### 1. Verify locally (M0–M3)
- [ ] Run `docker compose up --build`
- [x] Confirm `GET /api/v1/health` returns FFmpeg + yt-dlp versions
- [x] Test single-track download via UI on Mac
- [x] Test playlist download on Android Chrome
- [x] Confirm MP3 in Downloads with artist + cover in Samsung Music

### 2. Production deploy (M6) — **do this next**
- [ ] Follow [`DEPLOY.md`](./DEPLOY.md): Railway backend + Vercel frontend
- [ ] Set `CORS_ORIGINS`, `VITE_API_URL`, `VITE_SOCKET_URL`
- [ ] Smoke-test analyze + download on phone via public URL
- [ ] Test PWA install from Vercel (M2)

### 3. Close remaining V1 spec gaps
- [x] Wire queue **reorder** UI
- [x] Apply **filename template** on client save
- [x] Add **retry** for failed tracks
- [x] Implement **job TTL cleanup**
- [x] Add `showSaveFilePicker` fallback
- [x] Library **re-download**
- [x] ZIP **zipstream-ng** streaming

### 4. Polish (optional before submission)
- [ ] Run through `DEMO.md` on a Samsung device (M7)
- [ ] Add dark/light mode toggle (currently dark-only)
- [ ] Consider Capacitor (V3 stretch) if Samsung Music integration needs improvement

---

## Blocked Items

| Item | Status | Reason |
|------|--------|--------|
| — | — | No blockers recorded |

_Add rows here if development is blocked (e.g., Railway billing, yt-dlp breakage, device access)._

---

## Session Log

_Use this section to append brief notes after each dev session._

| Date | Summary |
|------|---------|
| 2026-06-23 | Initial V1 implementation: monorepo, backend pipeline, PWA frontend, Dexie library, deploy configs, README + DEMO. Production deploy and device testing not yet done. |
| 2026-06-23 | End-to-end download test: fixed YouTube 403 by upgrading to Python 3.11 + yt-dlp 2026.06.09. Single-track API flow verified; README/DEMO/progressTracker updated. |
| 2026-06-23 | User confirmed UI download works on Mac. Closed V1 gaps: queue reorder/retry/dismiss, filename template on save, showSaveFilePicker fallback, library re-download, job TTL cleanup. |
| 2026-06-23 | Android playlist test OK. Fixed artist + cover art: full yt-dlp metadata at download time, title parsing, channel fallback, hqdefault thumbnails, APIC embedding for Samsung Music. |
| 2026-06-23 | Production prep: `DEPLOY.md`, `frontend/vercel.json`, zipstream-ng ZIP streaming, backend `.env.example`. Ready for M6 deploy. |

---

## Quick Reference

| Resource | Path |
|----------|------|
| Architecture plan | [`fullPlan.md`](./fullPlan.md) |
| Run locally | `docker compose up --build` |
| Frontend dev | `cd frontend && npm run dev` |
| Backend dev | `cd backend && python3.11 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload` |
| Demo script | [`DEMO.md`](./DEMO.md) |
| Deploy guide | [`DEPLOY.md`](./DEPLOY.md) |
| API prefix | `/api/v1` |

---

*Update the **Last updated** date, status icons, and **Session Log** after each development session.*
