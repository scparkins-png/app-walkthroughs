# © 2026 Stuart Parkins. Joins the cards, recordings and voiceover into the finished videos:
#   <name>-walkthrough-16x9.mp4   widescreen, phone beside the scene title (YouTube, website)
#   <name>-short-9x16.mp4         upright Short, with short labels burned in for muted viewing
#   <name>-captions.srt           captions for the widescreen video (upload to YouTube separately)
# Usage: python3 assemble.py <app folder> <work folder> <output folder>
import json, os, re, subprocess, sys

app_dir, work, out_dir = (os.path.abspath(a) for a in sys.argv[1:4])
os.makedirs(out_dir, exist_ok=True)
app = json.loads(subprocess.check_output(['node', '-e',
    "const a=require(process.argv[1]);console.log(JSON.stringify({name:a.name,scenes:a.scenes.map(s=>({id:s.id,say:s.say,card:s.card||null}))}))",
    os.path.join(app_dir, 'app.js')]))
timings = json.load(open(os.path.join(work, 'timings.json')))
voice = json.load(open(os.path.join(work, 'voice', 'durations.json')))
layout = json.load(open(os.path.join(work, 'cards', 'layout.json')))
lead = timings['_meta']['lead']
cards, segs = os.path.join(work, 'cards'), os.path.join(work, 'segments')
os.makedirs(segs, exist_ok=True)
slug = re.sub(r'[^a-z0-9]+', '-', app['name'].lower()).strip('-')
FPS = 30
ENC = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', str(FPS),
       '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2']

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-2500:]); sys.exit(1)

def segment(scene, fmt):
    sid, dur = scene['id'], timings[scene['id']]['duration']
    wav = os.path.join(work, 'voice', sid + '.wav')
    out = os.path.join(segs, f'{fmt}-{sid}.mp4')
    audio = f'[a0]adelay={int(lead*1000)}|{int(lead*1000)},apad,atrim=0:{dur:.3f}[a]'
    if scene['card']:
        png = os.path.join(cards, f"{scene['card']}-{fmt}.png")
        fade = f"fade=t=in:st=0:d=0.35" if scene['card'] == 'intro' else f"fade=t=out:st={dur-0.5:.3f}:d=0.5"
        run(['ffmpeg', '-y', '-loop', '1', '-framerate', str(FPS), '-i', png, '-i', wav,
             '-filter_complex', f'[0]format=yuv420p,{fade}[v];[1]aformat=channel_layouts=stereo,volume=4dB[a0];{audio}',
             '-map', '[v]', '-map', '[a]', '-t', f'{dur:.3f}', *ENC, out])
    else:
        g = layout[fmt]
        frames = os.path.join(work, 'frames', sid, 'list.ffconcat')
        bg = os.path.join(cards, f'bg-{fmt}-{sid}.png')
        mask = os.path.join(cards, f'mask-{fmt}.png')
        fc = (f"[1]fps={FPS},scale={g['phoneW']}:{g['phoneH']}:flags=lanczos,format=rgba[ph];"
              f"[2]format=gray,scale={g['phoneW']}:{g['phoneH']}[m];[ph][m]alphamerge[phr];"
              f"[0][phr]overlay={g['x']}:{g['y']}:shortest=0,format=yuv420p[v];"
              f"[3]aformat=channel_layouts=stereo,volume=4dB[a0];{audio}")
        run(['ffmpeg', '-y', '-loop', '1', '-framerate', str(FPS), '-i', bg,
             '-f', 'concat', '-safe', '0', '-i', frames, '-loop', '1', '-i', mask, '-i', wav,
             '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-t', f'{dur:.3f}', *ENC, out])
    return out

def join(files, out):
    lst = os.path.join(segs, os.path.basename(out) + '.txt')
    open(lst, 'w').write(''.join(f"file '{f}'\n" for f in files))
    run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', out])

def ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'

def wrap(text, width=42):
    words, lines, cur = text.split(), [], ''
    for w in words:
        if cur and len(cur) + 1 + len(w) > width: lines.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    lines.append(cur)
    return lines

def captions():
    # One caption block per sentence (two lines at most), timed by its share of the line's length.
    n, t, blocks = 1, 0.0, []
    for s in app['scenes']:
        start, vd = t + lead, voice[s['id']]
        parts = re.split(r'(?<=[.?!])\s+', s['say'].strip())
        chunks = []
        for p in parts:
            # Split long sentences into evenly sized blocks of up to two lines, so no word is left on its own.
            pieces = [p]
            if len(p) > 80:   # split at the comma nearest the middle, or failing that the middle word
                commas = [m.end() for m in re.finditer(r',\s', p)]
                cut = min(commas, key=lambda c: abs(c - len(p) / 2)) if commas else None
                if cut is None or abs(cut - len(p) / 2) > len(p) * 0.3:
                    w = p.split(); cut = len(' '.join(w[:len(w) // 2])) + 1
                pieces = [p[:cut].strip(), p[cut:].strip()]
            for chunk in pieces:
                ls = wrap(chunk, max(24, -(-len(chunk) // 2) + 6)) if len(chunk) > 42 else [chunk]
                chunks.append('\n'.join(ls))
        total = sum(len(c) for c in chunks); c0 = start
        for c in chunks:
            d = vd * len(c) / total
            blocks.append(f'{n}\n{ts(c0)} --> {ts(c0 + d)}\n{c}\n'); n += 1; c0 += d
        t += timings[s['id']]['duration']
    open(os.path.join(out_dir, f'{slug}-captions.srt'), 'w').write('\n'.join(blocks))

for fmt, name in (('wide', f'{slug}-walkthrough-16x9.mp4'), ('tall', f'{slug}-short-9x16.mp4')):
    files = []
    for s in app['scenes']:
        print(f'{fmt:<5} {s["id"]}'); files.append(segment(s, fmt))
    join(files, os.path.join(out_dir, name))
captions()
total = sum(timings[s['id']]['duration'] for s in app['scenes'])
print(f'done: {total:.1f}s per video ->', out_dir)
