# TuneFetch — Production Deployment (M6)

Deploy the backend to **Railway** and the frontend to **Vercel**. This gives you a public HTTPS URL for your university demo (installable PWA, no laptop required).

## Prerequisites

- GitHub repo pushed to `main`
- [Railway](https://railway.app) account
- [Vercel](https://vercel.com) account

---

## Step 1: Deploy backend (Railway)

1. **New Project** → **Deploy from GitHub repo** → select this repository.
2. Railway reads [`railway.toml`](./railway.toml) and builds `backend/Dockerfile` (includes FFmpeg).
3. **Variables** (Railway → your service → Variables):

   | Variable | Value |
   |----------|--------|
   | `CORS_ORIGINS` | `https://YOUR-APP.vercel.app` (add local URLs too if you still dev against prod API) |

   Example with local dev:

   ```
   CORS_ORIGINS=http://localhost:5173,https://tunefetch.vercel.app
   ```

4. **Networking** → **Generate domain** (e.g. `https://tunefetch-production.up.railway.app`).
5. Verify: open `https://YOUR-RAILWAY-URL/api/v1/health` — expect `"status": "ok"` and non-null `ffmpeg`.

---

## Step 2: Deploy frontend (Vercel)

1. **Add New Project** → import the same GitHub repo.
2. **Root Directory:** `frontend`
3. **Framework Preset:** Vite (auto-detected)
4. **Environment variables** (Production):

   | Variable | Value |
   |----------|--------|
   | `VITE_API_URL` | `https://YOUR-RAILWAY-URL` (no trailing slash) |
   | `VITE_SOCKET_URL` | same Railway URL |

5. Deploy. Note your Vercel URL (e.g. `https://tunefetch.vercel.app`).

---

## Step 3: Link CORS (round-trip)

1. Copy your **final Vercel URL**.
2. In Railway, update `CORS_ORIGINS` to include it exactly (scheme + host, no path).
3. Redeploy or restart the Railway service if CORS was wrong on first try.

---

## Step 4: Smoke test

On your **Samsung phone** (Chrome):

1. Open the Vercel URL.
2. **Settings** → confirm API / FFmpeg / yt-dlp are green.
3. Paste a short YouTube URL → **Analyze** → **Add to Queue**.
4. Confirm progress updates and MP3 saves to Downloads.
5. Open **Samsung Music** — check artist, title, and cover art.
6. **Add to Home Screen** for standalone PWA demo (HTTPS required — works on Vercel).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| API calls fail / CORS error | `CORS_ORIGINS` must include exact Vercel origin (`https://…`) |
| Socket stuck at 0% | Progress still works via REST polling every 2s; check `VITE_SOCKET_URL` |
| Download 403 / format error | Railway image uses `requirements.txt`; ensure yt-dlp ≥ 2026.6.0 in health check |
| ZIP download empty | Job must be in `zip` mode and at least one track completed |
| Cold start slow | First request after idle may take 10–30s on free Railway tier |

---

## Optional: custom domains

- **Vercel:** Project → Settings → Domains
- **Railway:** Service → Settings → Networking → Custom Domain

Update `CORS_ORIGINS` and `VITE_*` URLs if you change domains.

---

## CI (already in repo)

- `.github/workflows/frontend-deploy.yml` — builds frontend on PR/push
- `.github/workflows/backend-deploy.yml` — builds Docker image on PR/push

Auto-deploy to Vercel/Railway is configured in each platform’s dashboard (connect GitHub), not in these workflow files.
