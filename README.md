# App walkthroughs

One shared tool that makes the YouTube walkthrough, the upright Short, the captions and
screenshots for each of my free apps, using an AI voice and made-up demo data.

The apps' code stays in their own repos. Each app has a small settings folder here, in `apps/`,
naming its repo. The tool downloads the latest copy of that repo before recording.

| App | Settings | Code |
|---|---|---|
| SmartDrinkTracker | `apps/smartdrinktracker` | scparkins-png/smart-drinks-tracker |
| Emergency Home Pack | `apps/emergencyhomepack` | scparkins-png/emrgency-home-pack |
| Do 30 Day Challenge | `apps/do30daychallenge` | scparkins-png/30-day-challenge |

## What it makes

| File | What it's for |
|---|---|
| `<app>-walkthrough-16x9.mp4` | The full walkthrough for YouTube and myhandyapps.com. Phone beside each scene title. |
| `<app>-short-9x16.mp4` | YouTube Short / phone version. Short labels in the picture for people watching muted. |
| `<app>-captions.srt` | Captions for the widescreen video. Upload to YouTube as a subtitle file. |
| `thumbnail-16x9.png` | The intro card, usable as a YouTube thumbnail. |
| `screenshots/` | One phone screenshot per scene, e.g. for the Buy Me a Coffee gallery. |

Every recorded scene shows a "Demo data" badge.

## Making the videos

```
./run.sh smartdrinktracker
```

Files land in `output/smartdrinktracker/`. Nothing in `output/`, `.work/` or `apps-code/` is saved to the repo. It takes a couple of minutes. The first run downloads
the Kokoro voice model (about 350 MB).

Needs Node with Playwright, Python 3 and ffmpeg.

## How it works

1. `voice.py` reads each scene's line and makes the voiceover with Kokoro, an open-source
   text-to-speech model that runs offline. The voice is set in the app's `app.js`.
2. `record.js` opens the app at phone size with the demo data loaded, carries out each
   scene's taps (with a visible tap marker) and records it, holding each scene for as long as
   its voice line.
3. `cards.js` draws the intro and outro cards, each scene's background and the phone mask.
4. `assemble.py` puts the phone recording into both layouts, adds the voice and joins the
   scenes, then writes the captions file.

## Changing the script or adding an app

Everything about an app is in its own folder in `apps/`:

- `app.js`: the app's repo, name, tagline, web address, colours, voice, outro wording and the scene list.
  Each scene has a title, a Short label, the voiceover line and the taps to carry out.
- `demo-data.js`: the made-up history loaded before recording.

To change a line, edit `say` in `app.js` and run again. If the AI voice mispronounces a word,
add a `tts` spelling for the voice only (for example "Smart Drink Tracker").

For another app, copy `apps/smartdrinktracker` to a new folder, then change `app.js` (starting
with `repo`) and `demo-data.js` to suit that app, and add it to the table above. To record a
local copy of an app instead of its repo, set `APP_CODE` to its folder.

If an app's screens depend on the date, add `clock` to its `app.js` (for example
`clock: '2026-11-19T09:30:00Z'`). The recording then starts at that date and time and runs normally from
there, so the demo data can use fixed dates. Apps without `clock` use the real date.

British voices available: `bf_emma`, `bf_isabella`, `bf_alice`, `bf_lily`, `bm_george`,
`bm_lewis`, `bm_daniel`, `bm_fable`.

© 2026 Stuart Parkins. All rights reserved.
