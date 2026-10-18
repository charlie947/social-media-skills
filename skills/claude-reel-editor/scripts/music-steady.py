#!/usr/bin/env python3
"""music-steady.py: check a music bed plays at one level to the last frame.

usage: python3 music-steady.py <music.wav> [--drop 6] [--skip 1.0]
Run it on the MUSIC on its own, before the mix (the voice hides a fade in the mix).
Measures 1s windows after the first --skip seconds (a fade in is fine). FAIL if any window sits more than --drop dB
under the median, or goes silent. A track that fades out early fails: loop its own bars to fill the end instead.
Exit 0 pass, 1 fail.
"""
import argparse, math, struct, subprocess, sys

ap = argparse.ArgumentParser(); ap.add_argument('stem'); ap.add_argument('--drop', type=float, default=6.0); ap.add_argument('--skip', type=float, default=1.0)
a = ap.parse_args()
SR = 8000
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.stem, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
n = len(raw) // 2
if n < SR * 2:
    print(f'FAIL stem too short or unreadable ({n / SR:.2f}s)'); sys.exit(1)
x = struct.unpack(f'<{n}h', raw[:n * 2])
def db(seg):
    r = math.sqrt(sum(v * v for v in seg) / len(seg)) / 32768
    return 20 * math.log10(r) if r > 0 else -120.0
wins = [(i / SR, db(x[i:i + SR])) for i in range(int(a.skip * SR), n - SR // 2, SR)]
levels = sorted(l for _, l in wins); med = levels[len(levels) // 2]
bad = [(t, l) for t, l in wins if l < med - a.drop or l < -60]
print(f'music {n / SR:.2f}s, median {med:.1f} dBFS, lowest {levels[0]:.1f} dBFS, {len(wins)} windows of 1s')
for t, l in bad: print(f'FAIL {t:6.2f}-{t + 1:6.2f}s at {l:.1f} dBFS ({med - l:.1f} dB under the median)')
if bad: sys.exit(1)
print(f'PASS every 1s window within {a.drop:.0f} dB of the median to the end')
