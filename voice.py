# © 2026 Stuart Parkins. Makes the AI voiceover: one WAV per scene, plus durations.json.
# Uses Kokoro (open-source text-to-speech, runs offline). British voices: bf_emma, bf_isabella,
# bf_alice, bf_lily, bm_george, bm_lewis, bm_daniel, bm_fable.
# Usage: python3 voice.py <app folder> <out folder> [model folder]
import json, os, subprocess, sys

app_dir, out_dir = sys.argv[1], sys.argv[2]
model_dir = sys.argv[3] if len(sys.argv) > 3 else os.path.expanduser('~/tts')
os.makedirs(out_dir, exist_ok=True)

# Read scene text and voice settings from the app's app.js via node, so there's one source of truth.
cfg = json.loads(subprocess.check_output(['node', '-e',
    "const a=require(process.argv[1]);console.log(JSON.stringify({voice:a.voice,scenes:a.scenes.map(s=>({id:s.id,text:s.tts||s.say}))}))",
    os.path.abspath(os.path.join(app_dir, 'app.js'))]))

from kokoro_onnx import Kokoro
import soundfile as sf
k = Kokoro(os.path.join(model_dir, 'kokoro-v1.0.onnx'), os.path.join(model_dir, 'voices-v1.0.bin'))
durations = {}
for s in cfg['scenes']:
    samples, sr = k.create(s['text'], voice=cfg['voice']['name'], speed=cfg['voice'].get('speed', 1.0), lang='en-gb')
    path = os.path.join(out_dir, s['id'] + '.wav')
    sf.write(path, samples, sr)
    durations[s['id']] = round(len(samples) / sr, 3)
    print(f"{s['id']:<10} {durations[s['id']]:.2f}s")
json.dump(durations, open(os.path.join(out_dir, 'durations.json'), 'w'), indent=1)
print('total', round(sum(durations.values()), 1), 's')
