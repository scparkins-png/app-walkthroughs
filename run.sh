#!/usr/bin/env bash
# © 2026 Stuart Parkins. Makes the walkthrough videos for one app, start to finish.
# Usage: ./run.sh <app> [work folder] [output folder]
#   e.g. ./run.sh smartdrinktracker      (the app's settings are in apps/smartdrinktracker)
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
app="$here/apps/${1:?Give the app name, e.g. smartdrinktracker}"
[ -f "$app/app.js" ] || { echo "No apps/$1/app.js"; exit 1; }
work="${2:-$here/.work/$(basename "$app")}"
out="${3:-$here/output/$(basename "$app")}"
models="${KOKORO_DIR:-$HOME/tts}"

if [ ! -f "$models/kokoro-v1.0.onnx" ]; then
  echo "Getting the Kokoro voice model (about 350 MB, once only)..."
  mkdir -p "$models"
  base=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
  curl -sSL -o "$models/kokoro-v1.0.onnx" "$base/kokoro-v1.0.onnx"
  curl -sSL -o "$models/voices-v1.0.bin" "$base/voices-v1.0.bin"
fi
python3 -c "import kokoro_onnx, soundfile" 2>/dev/null || pip install --break-system-packages -q kokoro-onnx soundfile

# Get the latest copy of the app's code (unless APP_CODE already points at one).
if [ -z "${APP_CODE:-}" ]; then
  repo="$(node -e "console.log(require(process.argv[1]).repo)" "$app/app.js")"
  export APP_CODE="$here/apps-code/${repo#*/}"
  if [ -d "$APP_CODE/.git" ]; then git -C "$APP_CODE" pull -q --ff-only
  else git clone -q --depth 1 "https://github.com/$repo" "$APP_CODE"; fi
fi
echo "App code: $APP_CODE"

mkdir -p "$work" "$out"
echo "1/4 Voiceover";   python3 "$here/voice.py" "$app" "$work/voice" "$models"
echo "2/4 Recording";   node "$here/record.js" "$app" "$work"
echo "3/4 Cards";       node "$here/cards.js" "$app" "$work"
echo "4/4 Videos";      python3 "$here/assemble.py" "$app" "$work" "$out"
mkdir -p "$out/screenshots" && cp "$work"/shots/*.png "$out/screenshots/"
cp "$work/cards/intro-wide.png" "$out/thumbnail-16x9.png"
echo "Done. Files are in $out"
