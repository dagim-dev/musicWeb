const SAMSUNG_MUSIC_PACKAGE = 'com.sec.android.app.music'

/** Best-effort launch of Samsung Music on Android (no-op elsewhere). */
export function openSamsungMusic() {
  const intent = `intent://#Intent;package=${SAMSUNG_MUSIC_PACKAGE};action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end`
  window.location.href = intent
}
