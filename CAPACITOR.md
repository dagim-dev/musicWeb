# DgLabs — Capacitor Android App

The Capacitor build wraps the same React app in a native Android shell. On the APK, downloads are saved to **`Downloads/DgLabs/`** (created automatically).

The PWA on Vercel is unchanged — browser installs still save to the default Downloads location.

---

## Prerequisites

- Node.js 20+
- [Android Studio](https://developer.android.com/studio) (Ladybug or newer)
- Android SDK with API 34+
- JDK 17+

---

## Build the APK

From the repo root:

```bash
cd frontend

# Point the native app at production API (required for APK)
export VITE_API_URL=https://tunefetch-production.up.railway.app
export VITE_SOCKET_URL=https://tunefetch-production.up.railway.app

npm run build:android
npm run cap:open:android
```

In Android Studio:

1. Wait for Gradle sync to finish
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. APK output: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

Transfer the APK to your Samsung phone and install (allow "Install unknown apps" if prompted).

---

## Download folder behavior

| Platform | Save location |
|----------|---------------|
| **Android APK** | `Downloads/DgLabs/{artist} - {title}.mp3` |
| **PWA (browser)** | Default Downloads (no subfolder — browser limitation) |

The native save uses Android MediaStore on Android 10+ so Samsung Music can scan the files after download.

---

## Development workflow

```bash
cd frontend
npm run dev          # Web dev server (PWA mode)
npm run build        # Production web build
npm run cap:sync     # Copy dist → android project
npm run cap:open:android
```

After code changes:

```bash
npm run build:android
```

Then rebuild/run from Android Studio.

---

## Live reload (optional)

Uncomment and set in `capacitor.config.ts` for LAN testing:

```typescript
server: {
  url: 'http://192.168.x.x:5173',
  cleartext: true,
},
```

Run `npm run dev` on your Mac, then run the app from Android Studio.

---

## Plugins

| Package | Purpose |
|---------|---------|
| `@capacitor/filesystem` | Capacitor file APIs (reserved for future use) |
| `@capacitor/share` | Share sheet (reserved for Samsung Music share intent) |
| **DgLabsSaver** (custom) | Saves MP3 to `Downloads/DgLabs/` via MediaStore |

Custom plugin source: `android/app/src/main/java/com/dglabs/tunefetch/DgLabsSaverPlugin.java`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Downloads fail in APK (bot check) | Upload cookies in Settings → YouTube Session, or set `YOUTUBE_COOKIES_BASE64` on Railway — [`docs/YOUTUBE_COOKIES.md`](./docs/YOUTUBE_COOKIES.md) |
| Gradle sync fails | Open Android Studio → SDK Manager → install API 34 |
| Files not in Samsung Music | Open Samsung Music once; it scans `Downloads/DgLabs/` |
| Save permission error | Reinstall APK; Android 10+ does not need storage permission for MediaStore Downloads |
