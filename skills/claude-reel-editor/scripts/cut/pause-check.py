#!/usr/bin/env python3
"""pause-check.py: fail if the cut keeps a pause longer than 0.25s inside a kept segment.

usage: python3 pause-check.py <raw.mp4|wav> <segs.json> [max_pause=0.25]
A slow edit loses people. Silence here = 20ms slices under -42 dB.
Careful: soft words ("tests", "keys") can also sit under -42 dB. Split a segment inside a flagged pause only where
no word of the raw transcript overlaps the part you remove, then run join-check.py again.
Exit 0 = no long pause, 1 = at least one.
"""
import json, subprocess, sys
import numpy as np

if len(sys.argv) < 3:
    print(__doc__); sys.exit(2)
src, segs = sys.argv[1], json.load(open(sys.argv[2]))
MAX = float(sys.argv[3]) if len(sys.argv) > 3 else 0.25
a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-map', '0:a:0', '-f', 's16le', '-ac', '1', '-ar', '16000', '-'],
                                 capture_output=True).stdout, dtype=np.int16).astype(float)
bad = 0
for i, (s, e) in enumerate(segs):
    t, run0 = s + .10, None
    while t < e - .10:
        x = a[int(t * 16000):int((t + .02) * 16000)]
        quiet = 20 * np.log10(np.sqrt(np.mean(x ** 2)) / 32768 + 1e-9) < -42
        if quiet and run0 is None: run0 = t
        if not quiet and run0 is not None:
            if t - run0 > MAX: print(f'seg {i + 1}: pause {run0:.2f}-{t:.2f} ({t - run0:.2f}s)'); bad += 1
            run0 = None
        t += .02
print('FAIL' if bad else 'PASS', f'{bad} pause(s) over {MAX}s')
sys.exit(1 if bad else 0)
