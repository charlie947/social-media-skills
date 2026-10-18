#!/usr/bin/env python3
"""retime-words.py: move a RAW transcript onto the CUT clock, using the cut list.

usage: python3 retime-words.py <raw-words.json> <segs.json> <cut-words.json>
Words inside a kept segment keep their place, shifted to cut time. Words in a dropped part go.
Use it only when you cannot transcribe the cut itself (the example reel has tone bursts, not speech).
For a real reel, transcribe cut-audio.wav with transcribe.py: that is always the more accurate clock.
"""
import json, sys

if len(sys.argv) != 4:
    print(__doc__); sys.exit(2)
W = json.load(open(sys.argv[1])); W = W['words'] if isinstance(W, dict) else W
S = json.load(open(sys.argv[2]))
out, acc = [], 0.0
for s, e in S:
    for w in W:
        ws, we = w.get('start', w.get('s')), w.get('end', w.get('e'))
        if ws >= s - 1e-3 and we <= e + 1e-3:
            out.append({'word': w.get('word', w.get('w', '')).strip(), 'start': round(ws - s + acc, 3), 'end': round(we - s + acc, 3)})
    acc += e - s
json.dump(out, open(sys.argv[3], 'w'), indent=1)
print(f'{len(out)} of {len(W)} words kept, cut clock ends {acc:.2f}s -> {sys.argv[3]}')
