#!/usr/bin/env python3
"""raw-probe.py: check a raw phone recording before the first cut.

usage: python3 raw-probe.py <raw.mp4>
Three phone traps, all measured with ffprobe:
1. A rotation tag: the file says 1920x1080 but plays 1080x1920. Read the size after rotation. (info)
2. More than one audio track: some phones add a spatial track. Map the normal one with -map 0:a:0. (FAIL)
3. Sound starts later than the picture (start_time differs by more than 0.02s): words land late on the lips.
   Fix the offset before any cut. (FAIL)
Exit 1 on a FAIL.
"""
import json, subprocess, sys

if len(sys.argv) != 2:
    print(__doc__); sys.exit(2)
p = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', sys.argv[1]], capture_output=True, text=True).stdout or '{}')
st = p.get('streams', [])
v = [s for s in st if s.get('codec_type') == 'video']; au = [s for s in st if s.get('codec_type') == 'audio']
fails = []
if not v:
    print('FAIL  no video stream'); sys.exit(1)
v0 = v[0]
rot = int(float(v0.get('tags', {}).get('rotate', 0) or 0))
for sd in v0.get('side_data_list', []) or []:
    if 'rotation' in sd: rot = int(float(sd['rotation']))
w, h = int(v0['width']), int(v0['height'])
if abs(rot) in (90, 270): w, h = h, w
print(f"INFO  video {w}x{h} as played (rotation tag {rot}), {v0.get('codec_name')}, {float(p.get('format', {}).get('duration', 0)):.2f}s")
if len(au) > 1: fails.append(f'{len(au)} audio tracks: map the normal one with -map 0:a:0 in every ffmpeg call')
if au:
    off = float(au[0].get('start_time', 0)) - float(v0.get('start_time', 0))
    print(f'INFO  sound starts {off:+.3f}s against the picture')
    if abs(off) > 0.02: fails.append(f'sound offset {off:+.3f}s: shift the audio by {-off:+.3f}s before cutting')
else:
    fails.append('no audio track')
for f in fails: print('FAIL ', f)
if not fails: print('PASS  ready to cut')
sys.exit(1 if fails else 0)
