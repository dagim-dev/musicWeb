#!/usr/bin/env bash
# Export YouTube cookies from your browser and print a Railway-ready base64 value.
set -euo pipefail

BROWSER="${1:-chrome}"
OUT="$(mktemp /tmp/youtube-cookies.XXXXXX.txt)"
trap 'rm -f "$OUT"' EXIT

yt-dlp --cookies-from-browser "$BROWSER" --cookies "$OUT" --skip-download \
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ" >/dev/null

echo "Add this to Railway as YOUTUBE_COOKIES_BASE64:"
base64 -i "$OUT" | tr -d '\n'
echo
