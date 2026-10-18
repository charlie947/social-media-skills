#!/usr/bin/env python3
"""join-check.py: fail if any cut clips speech.

usage: python3 join-check.py <raw.mp4|wav> <segs.json>
  segs.json  [[start, end], ...] in raw seconds (the parts you keep)

Measured on the waveform, never on whisper's word edges: whisper stretches a word's start back to the previous
word's end, and it will still transcribe a word whole while a slice of it is cut. Each cut lands on a 30fps frame.
At every cut-out, the loudest 20ms slice from 40ms before to 60ms after must sit under -48 dB.
At every cut-in, the 100ms before must sit under -48 dB.
Exit 0 = every join is clean. Exit 1 = at least one join clips speech. Fix it with: "Re-cut that join in true silence."
"""
import json, subprocess, sys
import numpy as np

if len(sys.argv) != 3:
    print(__doc__); sys.exit(2)
src, segs = sys.argv[1], json.load(open(sys.argv[2]))
TH = -48.0
a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-map', '0:a:0', '-f', 's16le', '-ac', '1', '-ar', '16000', '-'],
                                 capture_output=True).stdout, dtype=np.int16).astype(float)
def db(t0, t1):
    x = a[max(0, int(t0 * 16000)):int(t1 * 16000)]
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) / 32768 + 1e-9) if len(x) else -120
def loud(t0, t1):
    return max(db(t, t + .02) for t in np.arange(t0, t1 - .019, .01))
bad = 0
for i, (s, e) in enumerate(segs):
    fs, fe = round(s * 30) / 30, round(e * 30) / 30
    flags = []
    end = loud(fe - .04, fe + .06)
    if end > TH: flags.append(f'END {fe:.2f} clips speech (loudest 20ms {end:.1f} dB within -40/+60ms)')
    if i > 0:
        st = loud(fs - .10, fs)
        if st > TH: flags.append(f'START {fs:.2f} cuts into speech ({st:.1f} dB in the 100ms before)')
    bad += bool(flags)
    print(f"seg {i + 1:2d} {fs:8.2f}-{fe:8.2f}  {'; '.join(flags) or 'ok'}")
print('FAIL' if bad else 'PASS', f'{bad} join(s) clip speech')
sys.exit(1 if bad else 0)
