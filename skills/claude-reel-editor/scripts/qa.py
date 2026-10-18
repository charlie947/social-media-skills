#!/usr/bin/env python3
"""qa.py: the measured check on the finished file, before it goes anywhere.

usage: python3 qa.py <reel-ig.mp4> [--out DIR]
Writes DIR/qa.md, DIR/sheet.jpg (one frame a second) and DIR/deadzone.jpg (Instagram's covered zones in red).
Every line prints PASS, FAIL or NOT RUN. A model cannot hear lip sync or judge taste, so those print NOT RUN:
watch the file yourself, full size, with sound. Exit 1 if any line FAILs.
Needs numpy and Pillow: pip install numpy pillow
"""
import argparse, io, json, os, re, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser(); ap.add_argument('mp4'); ap.add_argument('--out')
a = ap.parse_args()
OUT = a.out or os.path.splitext(a.mp4)[0] + '-qa'; os.makedirs(OUT, exist_ok=True)
run = lambda *c: subprocess.run(c, capture_output=True, text=True)
lines, fails = [], []
def rep(name, ok, msg):
    tag = 'PASS' if ok is True else ('NOT RUN' if ok is None else 'FAIL')
    s = f'- [{tag}] {name}: {msg}'; lines.append(s); print(s)
    if ok is False: fails.append(s)

p = json.loads(run('ffprobe', '-v', 'error', '-count_frames', '-show_entries', 'stream=codec_type,codec_name,color_range,pix_fmt,nb_read_frames,width,height,r_frame_rate,duration:format=duration,size', '-of', 'json', a.mp4).stdout)
v = next(s for s in p['streams'] if s['codec_type'] == 'video'); au = next((s for s in p['streams'] if s['codec_type'] == 'audio'), None)
num, den = map(int, v['r_frame_rate'].split('/')); fps = num / den; vd = int(v['nb_read_frames']) / fps
rep('format', v['codec_name'] == 'h264' and v.get('pix_fmt') == 'yuv420p', f"{v['codec_name']}, {v.get('pix_fmt')}")
rep('colour range', v.get('color_range') == 'tv', f"{v.get('color_range')} (Instagram wants limited range: tv)")
rep('size', (int(v['width']), int(v['height'])) == (1080, 1920), f"{v['width']}x{v['height']}, {v['nb_read_frames']} frames at {fps:g}fps = {vd:.3f}s, {int(p['format']['size']) / 1e6:.1f} MB")
if au:
    ad = float(au.get('duration') or p['format']['duration'])
    rep('audio length', abs(ad - vd) <= .05, f'audio {ad:.3f}s vs video {vd:.3f}s')
    # the container duration can hide missing audio packets, so count DECODED samples and look for gaps
    dec = len(subprocess.run(['ffmpeg', '-v', 'error', '-i', a.mp4, '-vn', '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], capture_output=True).stdout) / 16000
    rep('decoded audio', abs(dec - vd) <= .05, f'{dec:.3f}s decoded vs video {vd:.3f}s (drift here means the voice runs ahead of the lips)')
    pts = [float(m) for m in re.findall(r'^(-?[\d.]+)', run('ffprobe', '-v', 'error', '-select_streams', 'a:0', '-show_packets', '-show_entries', 'packet=pts_time', '-of', 'csv=p=0', a.mp4).stdout, re.M)]
    gaps = [f'{q:.2f}-{r:.2f}' for q, r in zip(pts, pts[1:]) if r - q > .03]
    rep('audio gaps', not gaps, f'{len(gaps)} packet gaps' + (f" at {', '.join(gaps[:6])}" if gaps else ''))
    o = run('ffmpeg', '-hide_banner', '-nostats', '-i', a.mp4, '-af', 'ebur128=peak=true', '-f', 'null', '-').stderr
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1]); TP = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', o)[-1])
    rep('loudness', -15 <= I <= -13, f'{I} LUFS (target -14)')
    rep('true peak', TP <= -1.5, f'{TP} dB (limit -1.5)')
else:
    rep('audio', False, 'no audio stream')
rep('lip sync', None, 'play it with sound and watch three joins. A model cannot hear it')

# frozen picture: 6 samples a second, a run of 1.5s or more with no change fails
W, H = 180, 320
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.mp4, '-vf', f'fps=6,scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.int16)
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2)); runs, cur, st = [], 0, 0
for i, s in enumerate(d < .35):
    if s: cur += 1; st = st if cur > 1 else i
    else:
        if cur: runs.append((st / 6, cur / 6)); cur = 0
if cur: runs.append((st / 6, cur / 6))
long = [(round(t, 1), round(l, 1)) for t, l in runs if l >= 1.5]
rep('frozen picture', not long, 'stretches of 1.5s or more: ' + (', '.join(f'{t}s for {l}s' for t, l in long) or 'none'))
cuts = int((d > 25).sum()); rep('pace', None, f'{cuts} hard cuts ({cuts / vd * 60:.0f} a minute). Judge it on the sheet')

# empty band: a flat light strip of 20% or more of the frame height, from y220 down, held 1.5s or more = a blank panel
bw, bh = 108, 192; bs = 1920 / bh
braw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.mp4, '-vf', f'fps=2,scale={bw}:{bh}:flags=area,gblur=sigma=1.5', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
bf = np.frombuffer(braw, np.uint8).reshape(-1, bh, bw).astype(np.float32)[:, int(220 / bs):]
pct = []
for f in bf:
    flat = (np.abs(np.diff(f, axis=1)).max(axis=1) < 3) & (f.mean(axis=1) > 170); best = c = 0
    for x in flat: c = c + 1 if x else 0; best = max(best, c)
    pct.append(best * bs / 1920 * 100)
bad, k = [], 0
while k < len(pct):
    if pct[k] >= 20:
        j = k
        while j < len(pct) and pct[j] >= 20: j += 1
        if (j - k) / 2 >= 1.5: bad.append((k / 2, (j - k) / 2, max(pct[k:j])))
        k = j
    else: k += 1
rep('empty band', not bad, 'blank strips of 20%+ held 1.5s: ' + (', '.join(f'{t:g}s for {l:g}s ({m:.0f}%)' for t, l, m in bad) or 'none'))

# sheets
def grab(t):
    png = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.2f}', '-i', a.mp4, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    return Image.open(io.BytesIO(png)).convert('RGB')
ts = [t + .5 for t in range(int(vd))]; ims = [grab(t) for t in ts]
Z = [(0, 0, 1080, 210), (0, 1520, 1080, 1920), (950, 960, 1080, 1520)]
def sheet(name, zones):
    tw, th, cols = 216, 384, 10; rows = (len(ims) + cols - 1) // cols
    c = Image.new('RGB', (cols * (tw + 4), rows * (th + 24)), 'white'); dr = ImageDraw.Draw(c)
    for k, (t, im) in enumerate(zip(ts, ims)):
        im = im.copy()
        if zones:
            ov = Image.new('RGBA', im.size); o = ImageDraw.Draw(ov)
            for z in Z: o.rectangle(z, fill=(255, 0, 0, 70), outline=(255, 0, 0, 255), width=5)
            im = Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB')
        x, y = (k % cols) * (tw + 4), (k // cols) * (th + 24)
        c.paste(im.resize((tw, th)), (x, y + 22)); dr.text((x + 4, y + 4), f'{t:.1f}s', fill=(0, 0, 0))
    c.save(os.path.join(OUT, name))
sheet('sheet.jpg', False); sheet('deadzone.jpg', True)
rep('dead zones', None, f'look at {OUT}/deadzone.jpg: nothing you need to read inside the red')
rep('the look', None, f'look at {OUT}/sheet.jpg tile by tile: caption over a graphic, anything cropped, a small object in an empty panel')
open(os.path.join(OUT, 'qa.md'), 'w', encoding='utf-8').write(f'# qa {os.path.basename(a.mp4)}\n\n' + '\n'.join(lines) + '\n')
print(f'\n{len(fails)} FAIL · report {OUT}/qa.md')
sys.exit(1 if fails else 0)
