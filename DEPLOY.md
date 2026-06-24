# TuneFetch — Production Deployment (M6)

Deploy the backend to **Railway** and the frontend to **Vercel**. This gives you a public HTTPS URL for your university demo (installable PWA, no laptop required).

---

## Resume here (current project state)

**As of 2026-06-24 — app works on Android (downloads + albums). Polish deployed in repo; push to `main` for Vercel.**

| What | Status |
|------|--------|
| GitHub repo | ✅ https://github.com/dagim-dev/musicWeb (`main`) |
| Railway backend | ✅ https://tunefetch-production.up.railway.app |
| Vercel frontend | ✅ **https://music-web-dagimak.vercel.app** ← use this URL |
| CORS | ✅ Fixed (`CORS_ORIGINS` + `*.vercel.app` regex) |
| Vercel env vars | ✅ `VITE_API_URL` / `VITE_SOCKET_URL` → Railway URL |
| Android downloads | ✅ Verified by user (single + playlist/album) |
| PWA icons + theme | ✅ In repo — push `main` to update Vercel |
| **YouTube cookies (cloud)** | ⚠️ Health shows `false` — set if production API downloads fail |

### Next on device (~10 min)

1. **Add to Home Screen** from https://music-web-dagimak.vercel.app (M2)
2. Run [`DEMO.md`](./DEMO.md) script (M7)

### If Vercel downloads fail with bot check

YouTube blocks Railway without a logged-in session. **Easiest fix (no Terminal keychain):**

1. On your Mac: install Chrome extension **Get cookies.txt LOCALLY**.
2. Open https://www.youtube.com (signed in) → export `cookies.txt`.
3. On your phone: TuneFetch → **Settings** → **YouTube Session** → **Upload cookies.txt**.

Full guide: [`docs/YOUTUBE_COOKIES.md`](./docs/YOUTUBE_COOKIES.md)

**Optional — fix for all users on Railway:**

```bash
cd /Users/dagi/musicWebsite
chmod +x scripts/cookies-file-to-base64.sh
./scripts/cookies-file-to-base64.sh ~/Downloads/cookies.txt
```

Paste the output into Railway → **tunefetch** → **Variables** → `YOUTUBE_COOKIES_BASE64`.

Verify: https://tunefetch-production.up.railway.app/api/v1/health → `"youtube_cookies": true`

**Security:** Never commit cookies to git or paste them in chat. Treat like a password. Re-export when they expire (every few weeks).

See also: [`progressTracker.md`](./progressTracker.md) for full project status.

---

## Prerequisites (for a fresh deploy)

- GitHub repo pushed to `main`
- [Railway](https://railway.app) account
- [Vercel](https://vercel.com) account

---

## Step 1: Deploy backend (Railway)

**Already done for this project.** Reference for redeploys or new environments.

1. **New Project** → **Deploy from GitHub repo** → select repository.
2. Railway reads root [`railway.toml`](./railway.toml) and root [`Dockerfile`](./Dockerfile) (copies `backend/` into the image).
3. **Variables** (Railway → service → Variables):

   | Variable | Value |
   |----------|--------|
   | `CORS_ORIGINS` | `http://localhost:5173,https://music-web-dagimak.vercel.app` (add your Vercel URL) |
   | `YOUTUBE_COOKIES_BASE64` | Base64 Netscape `cookies.txt` — **required for downloads** |

   Export cookies:

   ```bash
   ./scripts/encode-youtube-cookies.sh chrome
   ```

   Or manually:

   ```bash
   yt-dlp --cookies-from-browser chrome --cookies cookies.txt --skip-download "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
   base64 -i cookies.txt | tr -d '\n'
   ```

4. **Networking** → public domain (e.g. `https://tunefetch-production.up.railway.app`).
5. Verify health: `"status": "ok"`, `ffmpeg` set, **`youtube_cookies": true`**.

### Railway monorepo note

This repo uses a **root `Dockerfile`** with `COPY backend/...` because Railway’s build context is the repo root. Do not set Root Directory to `backend` unless you switch back to `backend/Dockerfile`.

---

## Step 2: Deploy frontend (Vercel)

**Already done.** Production URL: **https://music-web-dagimak.vercel.app**

1. **Add New Project** → import GitHub repo.
2. **Root Directory:** `frontend`
3. **Environment variables** (Production):

   | Variable | Value |
   |----------|--------|
   | `VITE_API_URL` | `https://tunefetch-production.up.railway.app` |
   | `VITE_SOCKET_URL` | `https://tunefetch-production.up.railway.app` |

   No trailing slash. If you change these after first deploy, **Redeploy** in Vercel.

4. Deploy. Per-deploy preview URLs (`music-xxxxx-dagimak.vercel.app`) also work via CORS regex; use the main production URL for demos.

---

## Step 3: Link CORS (round-trip)

**Done.** Backend allows `CORS_ORIGINS` list plus `https://.*\.vercel\.app` regex.

If you add a custom domain later, update `CORS_ORIGINS` on Railway.

---

## Step 4: Smoke test

On **Samsung phone** (Chrome), open **https://music-web-dagimak.vercel.app**:

1. **Settings** → API ok, FFmpeg, yt-dlp, **YouTube cookies: Configured**
2. Paste a short YouTube URL → **Analyze** → **Add to Queue**
3. MP3 saves to Downloads; check Samsung Music for artist + cover
4. **Add to Home Screen** (standalone PWA — M2)

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| “Failed to fetch” on analyze/download | CORS — add Vercel URL to `CORS_ORIGINS`; hard-refresh app |
| “Sign in to confirm you’re not a bot” | Set `YOUTUBE_COOKIES_BASE64` on Railway (see [Resume here](#resume-here-current-project-state)) |
| Settings shows “YouTube cookies: Missing” | Same as above; redeploy Railway after setting variable |
| Socket stuck at 0% | REST polling still works every 2s; check `VITE_SOCKET_URL` |
| Download 403 / format error | Ensure yt-dlp ≥ 2026.6.0 in health check |
| Vercel build missing API URL | Redeploy after setting `VITE_*` env vars |
| Cold start slow | First Railway request after idle may take 10–30s |

---

## Optional: custom domains

- **Vercel:** Project → Settings → Domains
- **Railway:** Service → Settings → Networking → Custom Domain

Update `CORS_ORIGINS` and `VITE_*` URLs if you change domains.

---

## CI (already in repo)

- `.github/workflows/frontend-deploy.yml` — builds frontend on PR/push
- `.github/workflows/backend-deploy.yml` — builds Docker image on PR/push

Auto-deploy is configured in Railway/Vercel dashboards (GitHub connected to `main`).
