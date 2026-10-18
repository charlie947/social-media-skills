#!/usr/bin/env python3
"""motion-check.py: prove a rendered clip actually moves the whole way through.

A clip whose animation finishes early and then holds is a still with an intro. It looks animated on one frame
and reads as dead in the edit. Your eyes will not catch it. Frame differencing does.

usage: python3 motion-check.py clip.mp4 [--step 0.25] [--threshold 0.35] [--allow-lead 0.5] [--max-still 1.5]
Prints the change between samples. FAIL when the picture holds still for --max-still seconds or more.
Exit 0 = moves throughout. Exit 2 = a static stretch: give that beat another hit on another word.
Needs Pillow: pip install pillow
"""
import argparse, io, subprocess, sys
try:
    from PIL import Image, ImageChops
except ImportError:
    sys.exit('needs pillow: python3 -m pip install pillow')

ap = argparse.ArgumentParser(); ap.add_argument('clip')
ap.add_argument('--step', type=float, default=0.25); ap.add_argument('--threshold', type=float, default=0.35)
ap.add_argument('--allow-lead', type=float, default=0.5); ap.add_argument('--max-still', type=float, default=1.5)
a = ap.parse_args()
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.clip], capture_output=True, text=True).stdout.strip())
def frame(t):
    out = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', a.clip, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    return Image.open(io.BytesIO(out)).convert('L').resize((270, 480)) if out else None
prev, rows, t = None, [], 0.0
while t < dur:
    im = frame(t)
    if im is not None:
        if prev is not None: rows.append((t, sum(ImageChops.difference(im, prev).getdata()) / (270 * 480)))
        prev = im
    t += a.step
print(f'{a.clip}  ({dur:.1f}s, {len(rows)} samples)')
runs, cur = [], []
for t, m in rows:
    still = m < a.threshold and t > a.allow_lead
    print(f"  {t:6.2f}  {m:6.2f}  {'#' * int(min(m, 30))}{'  <-- still' if still else ''}")
    if still: cur.append(t)
    elif cur: runs.append(cur); cur = []
if cur: runs.append(cur)
long = [r for r in runs if len(r) * a.step >= a.max_still]
if long:
    for r in long: print(f'FAIL still from {r[0] - a.step:.2f}s to {r[-1]:.2f}s ({len(r) * a.step:.2f}s)')
    sys.exit(2)
print(f'PASS no still stretch of {a.max_still}s or more')
