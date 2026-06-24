# YouTube cookies setup (fix “Sign in to confirm you’re not a bot”)

YouTube blocks cloud downloads unless the backend has a valid logged-in session. The **recommended fix** uses a Chrome extension — no Terminal or macOS Keychain prompts.

---

## Recommended: extension + upload on your phone

### On your Mac (or any computer with Chrome)

1. Install **[Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)** in Chrome.
2. Open **https://www.youtube.com** and confirm you are **signed in**.
3. Click the extension icon on the YouTube tab.
4. Choose **Export** (or **Export as…** and save as `cookies.txt`).
   - Do **not** use **Export all cookies**.
   - Do **not** use Print → PDF — use **Export** so you get a real `.txt` file.
5. Find `cookies.txt` in **Downloads** (first line should be `# Netscape HTTP Cookie File`).

### On your phone

1. Send the file to your phone (AirDrop, email, Google Drive, etc.).
2. Open **TuneFetch** → **Settings** → **YouTube Session**.
3. Tap **Upload cookies file** and pick `cookies.txt` (`.pdf` also accepted if needed).
4. Confirm **YouTube cookies (this device): Configured**.
5. Try a download again.

Cookies stay **only on your device**. Settings → Server Status may still show server cookies as “Missing” — that is OK when this device has cookies configured.

---

## Optional: set cookies for everyone (Railway)

Use this if you do not want every user to upload cookies on their own phone.

After exporting `cookies.txt` on your Mac:

```bash
cd /Users/dagi/musicWebsite
chmod +x scripts/cookies-file-to-base64.sh
./scripts/cookies-file-to-base64.sh ~/Downloads/cookies.txt
```

1. Copy the long string after `YOUTUBE_COOKIES_BASE64=`.
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

## Extension menu cheat sheet

| Option | Use? |
|--------|------|
| **Export** | **Yes** — cookies for youtube.com → `cookies.txt` |
| **Export as…** | **Yes** — same, you pick the filename |
| **Export all cookies** | No — all sites, unnecessary |
| **Copy** | Only if you paste into a `.txt` file yourself |
| Print → PDF | Avoid — `.txt` is more reliable; PDF upload is supported but may fail |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Still get bot check after upload | Re-export while signed into YouTube; cookies expire every few weeks |
| Upload rejected / invalid file | Use extension **Export** on youtube.com; prefer `.txt` over PDF |
| PDF upload fails validation | Re-export as `.txt` instead of Print to PDF |
| Server shows cookies missing | Normal if only **this device** has cookies — or set Railway variable for everyone |
| Extension not on phone | Export on desktop, transfer file — extensions are desktop Chrome only |
| Keychain prompt on Mac script | Use extension method instead (no keychain) |

**Security:** Treat `cookies.txt` like a password. Never commit it to git or share publicly.
