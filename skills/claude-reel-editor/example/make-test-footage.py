#!/usr/bin/env python3
"""Make test footage for the example reel, so every step runs on a fresh machine with no camera and no voice.

Writes, next to this file:
  raw.mp4         1080x1920, 30fps. The picture is ffmpeg's testsrc, which prints a frame counter, so you can
                  check lip sync: the counter in the face card must jump exactly where the cut list says.
  raw-words.json  the "transcript" of raw.mp4 on the raw clock. It stands in for whisper, because the sound
                  is tone bursts, not speech. Each burst is one word.
  music.wav       a steady test pad for the music step. Replace it with your own licensed track.

The raw take has real silences between lines, one long pause, and one fluffed take ("It takes, um") that
the cut must drop. That is what a real recording looks like.
Needs Python 3 and ffmpeg. No other packages.
"""
import json, math, os, random, struct, subprocess, sys, wave

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
random.seed(7)

LINES = [   # (words, pause after the line in seconds). The pause is what the cut removes.
    ("Edit your reel with code.", 0.9),
    ("It takes, um", 0.8),                                   # a fluffed take: the cut drops it
    ("It takes four steps. Cut, storyboard, build, check.", 0.6),
    ("Every note makes a new version.", 1.3),                # a long pause
    ("And you stay in charge.", 0.5),
    ("Five minutes, not another hour.", 0.7),
    ("And every frame is checked.", 0.0),
]
LEAD, TAIL = 0.7, 0.8

def word_len(w):
    return 0.10 + 0.045 * len([c for c in w if c.isalpha()])

words, t = [], LEAD
for li, (line, pause) in enumerate(LINES):
    ws = line.split()
    for i, w in enumerate(ws):
        d = word_len(w)
        words.append({"word": w, "start": round(t, 3), "end": round(t + d, 3), "line": li})
        t += d
        if i < len(ws) - 1:
            t += 0.18 if w.endswith(",") or w.endswith(".") else 0.06
    t += pause if pause else 0
dur = t + TAIL

# tone bursts: a voiced buzz with harmonics and a syllable wobble, a soft attack and release, on a -70 dB noise floor
n = int(dur * SR)
buf = [random.gauss(0, 10.4) for _ in range(n)]
for k, w in enumerate(words):
    f0 = 150 + (k * 37) % 90
    a, b = int(w["start"] * SR), int(w["end"] * SR)
    for i in range(a, min(b, n)):
        x = (i - a) / SR
        env = min(1, x / .015, (b - i) / SR / .025)
        wob = .75 + .25 * math.sin(2 * math.pi * 5 * x)
        s = math.sin(2 * math.pi * f0 * x) + .5 * math.sin(4 * math.pi * f0 * x) + .25 * math.sin(6 * math.pi * f0 * x)
        buf[i] += 5200 * env * wob * s

def write_wav(path, data):
    with wave.open(path, "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes(b"".join(struct.pack("<h", max(-32767, min(32767, int(v)))) for v in data))

wav = os.path.join(HERE, "raw-audio.wav")
write_wav(wav, buf)
json.dump([{k: w[k] for k in ("word", "start", "end")} for w in words], open(os.path.join(HERE, "raw-words.json"), "w"), indent=1)

out = os.path.join(HERE, "raw.mp4")
r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"testsrc=size=1080x1920:rate=30:duration={dur:.3f}",
                    "-i", wav, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast", "-crf", "23",
                    "-c:a", "aac", "-b:a", "128k", "-shortest", out])
if r.returncode:
    sys.exit("ffmpeg failed making raw.mp4")
os.remove(wav)

# music: a steady three-note pad, 20 seconds, about -24 dBFS. The export loops it to the reel's length.
m = []
for i in range(20 * SR):
    x = i / SR
    v = sum(math.sin(2 * math.pi * f * x) for f in (220.0, 261.63, 329.63)) / 3
    m.append(2000 * v * (1 + .05 * math.sin(2 * math.pi * .25 * x)))
write_wav(os.path.join(HERE, "music.wav"), m)
print(f"raw.mp4 {dur:.2f}s, {len(words)} words, music.wav 20s")
