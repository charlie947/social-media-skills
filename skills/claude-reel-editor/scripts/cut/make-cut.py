#!/usr/bin/env python3
"""make-cut.py: build the cut audio from the raw take and the cut list.

usage: python3 make-cut.py <raw.mp4> <segs.json> <cut-audio.wav> [--preview cut.mp4]
Every join gets a 30ms fade each side so nothing clicks. The gain is untouched (no normaliser here).
--preview also writes a cut video, handy to watch the cut or to transcribe it.
Transcribe cut-audio.wav next (transcribe.py), and build every graphic on THOSE timings, never the raw take's.
"""
import argparse, json, os, subprocess, sys, tempfile

ap = argparse.ArgumentParser(); ap.add_argument('raw'); ap.add_argument('segs'); ap.add_argument('out'); ap.add_argument('--preview')
a = ap.parse_args()
S = json.load(open(a.segs)); F = .03
parts, labels, vparts = [], '', []
for i, (s, e) in enumerate(S):
    d = e - s
    parts.append(f"[0:a:0]atrim={s:.4f}:{e:.4f},asetpts=PTS-STARTPTS,afade=t=in:d={F},afade=t=out:st={max(0, d - F):.4f}:d={F}[a{i}]")
    vparts.append(f"[0:v:0]trim={s:.4f}:{e:.4f},setpts=PTS-STARTPTS[v{i}]")
def run(graph, maps, out, extra):
    with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False) as f:
        f.write(';\n'.join(graph)); path = f.name
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.raw, '-filter_complex_script', path, *maps, *extra, out])
    os.remove(path)
    if r.returncode: sys.exit(f'ffmpeg failed on {out}')
n = len(S)
run(parts + [''.join(f'[a{i}]' for i in range(n)) + f'concat=n={n}:v=0:a=1[a]'], ['-map', '[a]'], a.out, ['-ar', '48000'])
if a.preview:
    run(parts + vparts + [''.join(f'[v{i}][a{i}]' for i in range(n)) + f'concat=n={n}:v=1:a=1[v][a]'], ['-map', '[v]', '-map', '[a]'], a.preview,
        ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-pix_fmt', 'yuv420p', '-c:a', 'aac'])
dur = sum(e - s for s, e in S)
print(f'{n} segments, cut length {dur:.2f}s -> {a.out}' + (f' and {a.preview}' if a.preview else ''))
