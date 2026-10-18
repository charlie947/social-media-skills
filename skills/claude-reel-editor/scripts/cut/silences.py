#!/usr/bin/env python3
"""silences.py: find every stretch of speech between TRUE silences and propose the cut list.

Cut a talking-head take ONLY on these edges. Whisper's word timings are loose, so a cut placed on them can clip a
word or leave a doubled one. A silence here is measured on the waveform: under -52 dB for 0.25s or more, every 10ms.

usage: python3 silences.py <raw.mp4|wav> <segs.json> [--words raw-words.json] [--drop 2,5] [--pad 0.08]
  --words  a transcript of the RAW take (from transcribe.py). Each island prints the words inside it,
           so you can see which islands are fluffed takes.
  --drop   island numbers to leave out (the fluffed takes, the "let me start again"). Keep the LAST clean take of each line.
  --pad    seconds of silence kept either side of each island (0.08 keeps the joins at 0.15 to 0.2s)
Writes segs.json = [[start, end], ...] in raw seconds, the parts you keep, in order.
Then run join-check.py and pause-check.py on it.
"""
import argparse, json, subprocess, sys
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--words'); ap.add_argument('--drop', default='')
ap.add_argument('--pad', type=float, default=0.08)
ap.add_argument('--db', type=float, default=-52); ap.add_argument('--min', type=float, default=0.25)
a = ap.parse_args()
SR = 16000
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.src, '-map', '0:a:0', '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
x = np.frombuffer(raw, np.float32)
if not len(x):
    sys.exit('no audio decoded: check the file has a sound track')
hop = SR // 100
fr = x[:len(x) // hop * hop].reshape(-1, hop)
db = 20 * np.log10(np.sqrt((fr ** 2).mean(axis=1)) + 1e-9)
dur = len(x) / SR

sil, st = [], None
for i, v in enumerate(np.append(db, 0)):
    if v < a.db:
        st = i if st is None else st
    else:
        if st is not None and (i - st) / 100 >= a.min:
            sil.append((st / 100, i / 100))
        st = None
if not sil or sil[0][0] > 0: sil.insert(0, (0.0, 0.0))            # speech from the very first frame
if sil[-1][1] < dur - .01: sil.append((dur, dur))                   # speech to the very last frame

W = json.load(open(a.words)) if a.words else []
W = W['words'] if isinstance(W, dict) else W
drop = {int(k) for k in a.drop.split(',') if k.strip()}
segs, n = [], 0
for (s0, s1), (e0, e1) in zip(sil, sil[1:]):
    if e0 - s1 < .05: continue
    n += 1
    inn = max(s0 + (s1 - s0) / 2, s1 - a.pad); out = min(e0 + (e1 - e0) / 2, e0 + a.pad)
    txt = ' '.join(w.get('word', w.get('w', '')).strip() for w in W if s1 - .05 <= w.get('start', w.get('s', 0)) < e0 + .05)
    mark = 'DROP' if n in drop else 'keep'
    print(f"{n:3d} {mark}  {s1:8.2f}-{e0:8.2f}  [silence before {s1 - s0:.2f}s | after {e1 - e0:.2f}s]  {txt}")
    if n not in drop: segs.append([round(inn, 3), round(out, 3)])
json.dump(segs, open(a.out, 'w'), indent=1)
kept = sum(e - s for s, e in segs)
print(f"\n{n} islands, kept {len(segs)}, cut length {kept:.2f}s of {dur:.2f}s raw -> {a.out}")
