#!/usr/bin/env bash
# Export YouTube cookies from your browser and print a Railway-ready base64 value.
set -euo pipefail

BROWSER="${1:-chrome}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
YTDLP=""

if command -v yt-dlp >/dev/null 2>&1; then
  YTDLP="yt-dlp"
elif [[ -x "$ROOT/backend/.venv/bin/yt-dlp" ]]; then
  YTDLP="$ROOT/backend/.venv/bin/yt-dlp"
else
  echo "yt-dlp not found. Install it or create backend/.venv first." >&2
  exit 1
fi

OUT="$(mktemp /tmp/youtube-cookies.XXXXXX.txt)"
trap 'rm -f "$OUT"' EXIT

echo "Exporting cookies from $BROWSER (you must be signed into YouTube in that browser)..." >&2

if ! "$YTDLP" --cookies-from-browser "$BROWSER" --cookies "$OUT" --skip-download \
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ" >/dev/null 2>"$OUT.err"; then
  cat "$OUT.err" >&2
  echo >&2
  echo "Cookie export failed. On macOS, run this script in Terminal.app (not inside an IDE sandbox)." >&2
  echo "Make sure you are logged into YouTube in $BROWSER, then try: $0 chrome|safari|firefox|brave" >&2
  exit 1
fi

if [[ ! -s "$OUT" ]]; then
  echo "Cookie file is empty — browser cookies could not be read." >&2
  exit 1
fi

echo "Option A — paste into TuneFetch on your phone:" >&2
echo "  Settings → YouTube Session → paste the base64 string below → Save" >&2
echo "Option B — set on Railway for all users:" >&2
echo "  Railway → tunefetch → Variables → YOUTUBE_COOKIES_BASE64" >&2
echo
echo "YOUTUBE_COOKIES_BASE64="
base64 -i "$OUT" | tr -d '\n'
echo
