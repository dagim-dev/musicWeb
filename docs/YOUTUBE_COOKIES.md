# YouTube cookies setup (fix “Sign in to confirm you’re not a bot”)

YouTube blocks cloud downloads unless the backend has a valid logged-in session. Use a **browser extension** to export cookies — no Terminal keychain prompts.

---

## Recommended: extension + upload on your phone

### On your Mac (or any computer with Chrome)

1. Install **[Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)** in Chrome.
2. Open **https://www.youtube.com** and confirm you are **signed in**.
3. Click the extension icon → export **cookies.txt** (save to Downloads).

### On your phone

1. Send `cookies.txt` to your phone (AirDrop, email, Google Drive, etc.).
2. Open **TuneFetch** → **Settings** → **YouTube Session**.
3. Tap **Upload cookies.txt** and pick the file.
4. Try a download again.

Cookies stay **only on your device**.

---

## Optional: set cookies for everyone (Railway)

After exporting `cookies.txt` on your Mac:

```bash
cd /Users/dagi/musicWebsite
chmod +x scripts/cookies-file-to-base64.sh
./scripts/cookies-file-to-base64.sh ~/Downloads/cookies.txt
```

1. Copy the `YOUTUBE_COOKIES_BASE64=` line (the long string after `=`).
2. [Railway](https://railway.app) → **tunefetch** → **Variables** → add `YOUTUBE_COOKIES_BASE64` → paste → save.
3. Wait ~1–2 min for redeploy.
4. Check: https://tunefetch-production.up.railway.app/api/v1/health → `"youtube_cookies": true`

Then **all users** can download without uploading cookies on each phone.

---

## Advanced: Terminal + yt-dlp (uses macOS Keychain)

Only if you prefer automation and are OK with the Chrome “Safe Storage” keychain prompt:

```bash
cd /Users/dagi/musicWebsite
./scripts/encode-youtube-cookies.sh chrome
```

Click **Always Allow** when macOS asks for Keychain access.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Still get bot check after upload | Re-export cookies while signed into YouTube; old cookies expire every few weeks |
| Upload does nothing | File must be `.txt` Netscape format from the extension |
| Server still shows cookies missing | Railway variable not set — use upload on phone **or** set Railway |
| Extension not on phone | Export on desktop, transfer file — extensions are desktop Chrome only |

**Security:** Treat `cookies.txt` like a password. Never commit it to git or share publicly.
