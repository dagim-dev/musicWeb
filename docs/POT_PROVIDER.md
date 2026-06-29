# PO token provider (fix bot checks on Railway's IP)

When YouTube bot-checks the backend **even though valid cookies are applied**, the
problem is the server's IP being flagged (common on datacenter hosts like Railway),
not the cookies. A PO token (proof-of-origin) makes yt-dlp traffic look more
legitimate and can get past the block.

> A PO token is not guaranteed to bypass a heavily-flagged IP. If this still fails,
> the remaining option is routing yt-dlp through a residential/non-datacenter IP
> (proxy). See the note at the bottom.

The backend integrates the
[bgutil PO token provider](https://github.com/Brainicism/bgutil-ytdlp-pot-provider):

- The plugin `bgutil-ytdlp-pot-provider` is in `backend/requirements.txt`.
- yt-dlp is pointed at a running provider HTTP server via `POT_PROVIDER_BASE_URL`.

## Railway setup

1. **Add the provider service.** In your Railway project (`dagilabs`):
   - **New** → **Service** → **Docker Image**
   - Image: `brainicism/bgutil-ytdlp-pot-provider:latest`
   - Name it e.g. `bgutil-provider`. It listens on port **4416**.
   - It needs **no** public domain — backend reaches it over the private network.

2. **Point the backend at it.** On the **backend** service → **Variables**, add:

   ```
   POT_PROVIDER_BASE_URL=http://bgutil-provider.railway.internal:4416
   ```

   Replace `bgutil-provider` with the exact provider service name. Railway exposes
   each service at `<service-name>.railway.internal` on the private network.

3. **Redeploy** the backend (Variables change triggers it). Then verify:

   ```bash
   curl -s https://dagilabs.up.railway.app/api/v1/health
   ```

   You want `"pot_provider": true`. Keep `YOUTUBE_COOKIES_BASE64` (or per-device
   cookies) configured as well — PO token and cookies work together.

## Local development

Run the provider with Docker, then export the base URL:

```bash
docker run --name bgutil-provider -d --init -p 4416:4416 \
  brainicism/bgutil-ytdlp-pot-provider
export POT_PROVIDER_BASE_URL=http://127.0.0.1:4416
```

Verify yt-dlp sees the provider (look for `bgutil:http` under `PO Token Providers`):

```bash
yt-dlp -v "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --skip-download \
  --extractor-args "youtubepot-bgutilhttp:base_url=http://127.0.0.1:4416"
```

## If PO token still isn't enough

If health shows `"pot_provider": true` and cookies are configured but YouTube still
bot-checks, the IP is hard-blocked. Route yt-dlp through a residential proxy
(provider of your choice) or host the backend on a non-datacenter IP. The proxy can
be added to `build_ydl_opts` via a `proxy` option / env var if you want to go that
route.
