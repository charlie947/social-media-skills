---
name: claude-reel-editor
description: >
  Edit a raw talking-head video into a finished Instagram reel with motion graphics. Cuts on true silence, builds a storyboard for approval before any render, draws one big 3D graphic per spoken line that lands on the word, checks every quarter second, renders frame by frame in headless Chrome and exports for Instagram. Use when someone says "edit my reel", "edit this video", "cut this take", "make the graphics for my reel" or gives you a raw video to turn into a reel.
---

# Claude reel editor

You are the video editor. The person gives you one raw take of themselves talking to camera. You hand back a finished 1080x1920 reel.

The edit is one web page. `window.seek(t)` draws any moment of it. A renderer screenshots that page frame by frame in headless Chrome with Puppeteer, and ffmpeg joins the frames. No editing app is opened.

`KIT` below means the folder this file is in (usually `~/.claude/skills/claude-reel-editor`).

## The rules every step serves

1. Cut only in true silence, never inside a word.
2. Build every graphic on the CUT transcript's timings, never the raw take's.
3. Show a storyboard and wait for a yes before any video render.
4. One big 3D object per spoken line. It fills the top panel (x74 to 1006, y170 to 880). A denser list or a small card in an empty panel is a fail.
5. Every hit lands on its spoken word. The payoff lands ON its word, not after the cut.
6. Carry the object across a cut, or zoom through to the next graphic. A beat never opens on an empty object.
7. Show real things: the real app, the real command, real screenshots. Never a stand-in. Never the same example twice in one reel.
8. The hook is the opening animation, never a flat title card.
9. Nothing moves after it lands (no drift, no bob). No strike lines or scribbles: a rejected item goes grey and lifts out.
10. Never show the person a version that has not passed the checks.

Every step below ends with a check that can fail. Do not move on until it passes. When a check is NOT RUN, say NOT RUN. Never report a result you did not get.

## Step 0. Set up the reel folder (once per reel)

```bash
node KIT/scripts/new-reel.js ~/reels/my-reel        # makes reel.config.json, page/reel.html, page/beats.js, page/lib/
```

Put the raw take in that folder as `raw.mp4`. Run `npm run setup` in `KIT` once per machine (Puppeteer and its Chrome).
Ask for the brand once: background, text colour, ONE accent colour, font. Write them into `page/lib/brand.js` and nowhere else.

Check: `ls ~/reels/my-reel/raw.mp4 ~/reels/my-reel/page/lib/brand.js` both exist.

## Step 1. Probe the raw take

```bash
python3 KIT/scripts/cut/raw-probe.py raw.mp4
```

Check: exit 0. It fails on a second audio track (phones add a spatial one) and on sound that starts late against the picture. Fix those before any cut.

## Step 2. Transcribe the raw take

```bash
python3 KIT/scripts/cut/transcribe.py raw.mp4 raw-words.json
```

On an Apple Silicon Mac this runs `mlx-whisper` (small.en) through `uvx`. Elsewhere it uses `faster-whisper`.

Check: the word count is not zero and the text reads like what was said.

## Step 3. Cut on true silence

```bash
python3 KIT/scripts/cut/silences.py raw.mp4 segs.json --words raw-words.json
```

It lists every island of speech between silences (under -52 dB for 0.25s), with the words inside it. Read the whole list, then run it again with `--drop` for every island to remove:
- a fluffed or repeated take. Keep the LAST clean take of each line. Look at the end of the recording for a re-recorded hook.
- a take rejected out loud ("scratch that", "let me start again"), even with no pause round it.
- an aside that points at something off screen.

Show the person a table of every cut: start, end, and the words either side. Then:

```bash
python3 KIT/scripts/cut/join-check.py raw.mp4 segs.json     # no join clips a word (waveform, -48 dB)
python3 KIT/scripts/cut/pause-check.py raw.mp4 segs.json    # no pause over 0.25s left inside a segment
```

Check: both exit 0. A clipped join is fixed by moving that cut into true silence, never by hoping.

## Step 4. Make the cut and transcribe it again

```bash
python3 KIT/scripts/cut/make-cut.py raw.mp4 segs.json cut-audio.wav     # 30ms fades at each join
python3 KIT/scripts/cut/transcribe.py cut-audio.wav cut-words.json
python3 KIT/scripts/cut/words-check.py cut-words.json
node KIT/scripts/make-data.js .                                          # writes page/data.js
```

Check: `words-check.py` exits 0 (no um, no doubled word, no half word, no rejected take). Read the cut transcript end to end: nothing said twice, nothing that refers to something the viewer has not heard yet.

## Step 5. Plan the beats

Write `page/beats.js`. One beat per spoken line, `{ a, b, lay, still, move, draw }`. Read `KIT/example/page/beats.js` first, it shows every rule once.

- `lay`: `split` (graphic top, face card below), `full` (graphic fills the frame) or `face` (full-frame face, a hard cut). Change layout every 3 to 5 seconds. Use `face` about twice per reel for a break.
- Times come from `word('3D')` and `wordEnd('hour')`, never typed by hand. `word()` throws if the word is not in the cut, so a re-cut cannot silently break the timing.
- Pick a component from `KIT/components/` for each line. Each file's top comment says what it acts out and which times it takes: staircase, carousel, dropZone, filmstripScan, cutStrip, progressRing, countUp, dial, codeDemo, timelineHook, styleTransfer.
- Give a long beat two or three hits, each on its own word. Use `slam()` to enter and `crash()` to leave.
- `carry: true` hands a beat's object to the next beat (draw it swinging away for the first 0.55s of the next beat). Without it, two graphic beats meet with a zoom-through. A face beat is always a hard cut.
- Real assets: icons at 512px or more, pictures 1000px wide or more. Count every screen you will fill (phones, cards, covers) and fetch that many DIFFERENT real ones.
- Captions are automatic from the cut words. Fix spellings and write spoken numbers as digits with `spell: { twenty: '20' }`.

Check: `node --check page/beats.js` exits 0, and every line of the cut transcript is inside exactly one beat.

## Step 6. Storyboard, then wait

```bash
node KIT/scripts/storyboard.js .
```

Open `storyboard/STORYBOARD.html` for the person. One card per beat: the still, the time, the exact words, the layout and the one move. Clicking a card plays that beat with sound. They leave notes in the bar at the bottom and paste them back to you.

Check: the person has said yes to this storyboard. No yes, no render. Each round of notes: change the beats, run the storyboard again, show it again.

## Step 7. Check every quarter of a second

```bash
node KIT/scripts/check-frames.js .
```

It screenshots every beat every 0.25s and flags: text in Instagram's hidden zones (top 210px, below y1520, right of x950 in the lower half), text cut off at the frame edge, the caption touching a graphic, a split beat whose graphic covers under 45% of the panel, and a graphic that does not change for 1.5s. Look at `check/sheet.jpg` yourself as well.

Check: it prints `NO FLAGS` and exits 0. Fix every flag, then run it again. A font that did not load stops the check too.

## Step 8. Render

```bash
node KIT/scripts/render.js .
```

It cuts the face frames from the raw take, renders 60fps in several Chrome workers, blends to 30fps and encodes H.264. Each frame's face comes from the TRUE raw time for that cut time, so lip sync never drifts across a join. The 13 second example renders in about 17 seconds with 4 workers on a 10-core Mac mini.

Check: it prints `frames: N of N` and `DONE` with `h264 1080 1920 yuv420p tv`. A missing frame stops it before the encode.

## Step 9. Head pop-out (optional)

```bash
python3 KIT/scripts/matte.py page/frames      # needs torch. Cuts the person out of every face-card frame
```

Set `pop: true` in `REEL`. The head now breaks out over the top of the face card on split beats. Run Step 7 and Step 8 again. Run the matte again whenever the raw take or the crop changes.

Check: `page/frames/cutout` holds as many files as `page/frames/split`.

## Step 10. Music and the Instagram export

```bash
python3 KIT/scripts/music-steady.py music.wav
bash KIT/scripts/export.sh out/reel.mp4 music.wav out/reel-ig.mp4
```

The music must be a track they have the rights to. It loops to the full length, sits 12 dB under the voice, and the mix gets one static gain to -14 LUFS with a limiter that never raises the level.

Check: `music-steady.py` exits 0 and `export.sh` prints `PASS` with the codec, colour range, length and loudness.

## Step 11. QA, then show it

```bash
python3 KIT/scripts/qa.py out/reel-ig.mp4
```

Check: `0 FAIL`. Then look at `out/reel-ig-qa/sheet.jpg` and `deadzone.jpg` tile by tile. Lip sync and taste print NOT RUN because a model cannot hear or judge them: tell the person to play it with sound and watch three joins.

Report the ffprobe line, the loudness, the QA result, and the path to the file.

## Then one sentence per change

The person watches it and types one note at a time ("make it 3D", "use the real app screen", "I don't want to see the same example twice"). For each note, change the beats, then run Step 6 (if the plan changed), Step 7 and Step 8 again. Give every fix with its time in the NEW version, because a cut moves every later time. Never swap an approved concept for a new one: level up the motion inside it.

## When something goes wrong

- A word is clipped at a join: move that cut into true silence, run Step 3 checks again.
- The graphics land late: they used raw timings. Transcribe `cut-audio.wav` again, run `make-data.js`.
- A caption sits on a graphic: Step 7 flags it. Move the object, never the caption.
- The graphics feel weak: one bigger 3D object per line that fills the panel and hits on the word.
- The music fades early: loop its own bars to fill the end, then run `music-steady.py`.
- Chrome is missing: `npx puppeteer browsers install chrome`.
