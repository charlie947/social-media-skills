# Claude reel editor

This is the system I use for my own reels.

You film one raw take of yourself talking to camera. Claude cuts it, builds a graphic for every line you say, checks its own work and hands back a finished Instagram reel. I don't open an editing app.

Here's how it works under the hood. The whole edit is one web page. Claude draws any moment of the reel on that page, then records it frame by frame in Chrome (with a free tool called Puppeteer) and joins the frames with ffmpeg.

One honest note. The code here is the real engine, the real components and the real checks. Your notes on each version still do a lot of the work. My last reel took seven rounds.

## What you need

- **Claude Code.** It comes with the Claude Pro plan and above. Install it from Terminal: `curl -fsSL https://claude.ai/install.sh | bash`
- **Node.js 18 or newer.** On a Mac: `brew install node`
- **ffmpeg.** On a Mac: `brew install ffmpeg`
- **Python 3** with numpy and Pillow, for cutting and checking: `pip3 install numpy pillow`
- **Transcription.** On an Apple Silicon Mac, install uv (`brew install uv`) and the kit runs mlx-whisper for you. On Windows or Linux: `pip3 install faster-whisper`
- **One raw take.** Film yourself in one go. Mistakes are fine.

The head pop-out is optional. It needs PyTorch: `pip3 install torch torchvision`

## Install

```bash
git clone https://github.com/charlie947/social-media-skills.git
cp -R social-media-skills/skills/claude-reel-editor ~/.claude/skills/
cd ~/.claude/skills/claude-reel-editor
npm run setup
```

`npm run setup` installs Puppeteer and the copy of Chrome it drives.

Check it works with the example reel. It makes test footage (a colour test pattern and tone bursts, no real face or voice), cuts it, builds the storyboard, checks every frame, renders and exports:

```bash
npm run example
```

You should see `NO FLAGS`, `DONE`, `PASS` and `0 FAIL`. The finished file is `example/out/reel-ig.mp4`.

## Make it yours

Every colour, font and card style lives in one file: `engine/brand.js`. Change the accent first. It's the one colour that does all the work.

The default font is Inter, which is free. Change the font name and the Google Fonts link in the same file if you want another one.

## The 8 steps

Open Claude Code in a new folder with your raw take in it. Then go step by step. What you type is under each one.

### 1. Cut the raw take

```text
Use the claude-reel-editor skill. My raw take is raw.mp4. Transcribe it, cut every pause and every take I fluffed, only in true silence. Show me the table of cuts before you go on.
```

Claude finds every stretch of speech between real silences, drops your bad takes and checks no join clips a word.

### 2. Storyboard before any render

```text
Build me the storyboard. One still per line, with the time, my words, the layout and the one move. Wait for my yes.
```

You get one page. Click a card and that line plays with sound. Type your notes in the bar at the bottom and paste them back.

### 3. One big graphic per line, on the word

```text
One big graphic per line. It fills the top half and I sit below. Each one acts out what I'm saying and changes on the exact word, using the timings from the cut. Cut to me full screen twice for a break.
```

### 4. Make it 3D and make it hit

```text
Make every graphic 3D. Each object slams in from deep on its word and lands with no bounce. When something leaves, it drops away into depth. No idle drifting.
```

### 5. Show real things, never stand-ins

```text
When I mention an app or a website, show the real thing. Real app icon, the real command, real screenshots. Never the same example twice.
```

You'll need to give Claude the real files, or tell it where to find them.

### 6. The hook is the animation

```text
For the first 2 seconds, build my hook text as an animation on my first words: [YOUR HOOK]. Keep it inside Instagram's safe area.
```

### 7. Check every quarter of a second

```text
Before you show me anything, check the edit every quarter of a second and fix every flag.
```

It screenshots every 0.25 seconds and flags any text Instagram covers, anything cut off, any caption touching a graphic, any graphic too small for its panel, and any stretch where nothing moves. Claude only shows you the edit when it says `NO FLAGS`.

### 8. Render, music and the Instagram export

```text
Render it. Add my music about 12 dB under my voice, level to the last frame. Export for Instagram and tell me the codec, colour range, length and loudness.
```

Use music you have the rights to. The export lands at -14 LUFS, H.264, 1080 by 1920, limited colour range.

## Then it's one sentence per change

Watch it and type one note at a time. "Make the staircase bigger." "Use the real screen here." "That card comes in too late." Each one comes back as a new version.

## What's in the box

| Folder | What it does |
|---|---|
| `SKILL.md` | The process Claude follows, step by step, with a check on every step |
| `engine/` | `brand.js` (your look), `engine.js` (draws any moment), `motion.js` (3D moves), `ui.js` (cards, ticks, a code window) |
| `components/` | The graphics: staircase, version carousel, drop zone, filmstrip and scanner, cut strip, progress ring, count-up, giant dial, code window demo, timeline hook, style transfer |
| `scripts/cut/` | Probe, transcribe, find silences, check every join, check pauses, check words |
| `scripts/` | Storyboard, the quarter-second check, render, matte, music check, export, QA, new reel |
| `example/` | A 13 second reel that runs end to end, plus a gallery page of every component |

## When something goes wrong

- **A word is clipped at a join.** Say: "Re-cut that join in true silence and check it again."
- **The graphics land late.** Say: "Transcribe the cut again and use those timings."
- **A caption sits on a graphic.** Say: "Run the quarter-second check and fix every flag."
- **The graphics feel weak.** Say: "One big 3D object per line that fills the panel and hits on the word."
- **The music fades early.** Say: "Loop the music's own bars so it stays level to the last frame."
- **Chrome is missing.** Run `npx puppeteer browsers install chrome`

## Licence

MIT. See `LICENSE`. The head pop-out downloads Robust Video Matting when you run it, which has its own GPL-3.0 licence.
