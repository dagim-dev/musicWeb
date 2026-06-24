#!/usr/bin/env bash
# Encode an exported cookies.txt (Netscape format) for Railway or TuneFetch paste.
# No keychain access — use after exporting with a browser extension.
set -euo pipefail

FILE="${1:-}"
if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  echo "Usage: $0 path/to/cookies.txt" >&2
  echo >&2
  echo "Export cookies first (no Terminal keychain prompt):" >&2
  echo "  1. Install 'Get cookies.txt LOCALLY' in Chrome" >&2
  echo "  2. Open https://www.youtube.com while signed in" >&2
  echo "  3. Click the extension → Export → save cookies.txt" >&2
  echo "  4. Run: $0 ~/Downloads/cookies.txt" >&2
  exit 1
fi

if ! head -1 "$FILE" | grep -q '# Netscape HTTP Cookie File'; then
  echo "Warning: file may not be Netscape format (expected '# Netscape HTTP Cookie File' header)." >&2
fi

if [[ ! -s "$FILE" ]]; then
  echo "Error: cookies file is empty." >&2
  exit 1
fi

echo "Option A — TuneFetch on your phone:" >&2
echo "  Settings → YouTube Session → Upload cookies file (.txt or .pdf)" >&2
echo "Option B — Railway (all users):" >&2
echo "  Railway → tunefetch → Variables → YOUTUBE_COOKIES_BASE64" >&2
echo
echo "YOUTUBE_COOKIES_BASE64="
base64 -i "$FILE" | tr -d '\n'
echo
