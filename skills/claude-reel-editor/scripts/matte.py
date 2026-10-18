#!/usr/bin/env python3
"""matte.py: cut the person out of every face-card frame, for the head pop-out. Optional.

usage: python3 matte.py <frames dir>      (the "frames" folder from reel.config.json, after a storyboard or render)
Reads frames/split/NNNNN.jpg and writes frames/cutout/NNNNN.png: the same frame with the background made clear.
Then set pop: true in REEL (beats.js) and the head breaks out over the top of the face card on every split beat.

It uses Robust Video Matting (github.com/PeterL1n/RobustVideoMatting, GPL-3.0). The model downloads on first run,
about 100 MB. Runs on an Apple GPU (mps), NVIDIA (cuda) or the CPU (slow).
Needs: pip install torch torchvision numpy pillow
Run it again every time the raw take or the crop changes, or the cut-out drifts off the head.
"""
import glob, os, sys
try:
    import numpy as np, torch
    from PIL import Image
except ImportError:
    sys.exit('needs torch, torchvision, numpy and pillow: pip install torch torchvision numpy pillow')

if len(sys.argv) != 2:
    print(__doc__); sys.exit(2)
D = sys.argv[1]; F = sorted(glob.glob(os.path.join(D, 'split', '*.jpg')))
if not F:
    sys.exit(f'no frames in {D}/split. Run the storyboard or the render first, it cuts them')
os.makedirs(os.path.join(D, 'cutout'), exist_ok=True)
dev = 'mps' if torch.backends.mps.is_available() else ('cuda' if torch.cuda.is_available() else 'cpu')
m = torch.hub.load('PeterL1n/RobustVideoMatting', 'resnet50', trust_repo=True).eval().to(dev)
rec = [None] * 4
with torch.no_grad():
    for i, f in enumerate(F):
        im = np.asarray(Image.open(f).convert('RGB'))
        x = torch.from_numpy(im.copy()).to(dev).permute(2, 0, 1).unsqueeze(0).float() / 255
        fgr, pha, *rec = m(x, *rec, downsample_ratio=0.4)
        al = (pha[0, 0].clamp(0, 1).cpu().numpy() * 255).astype(np.uint8)
        Image.fromarray(np.dstack([im, al]), 'RGBA').save(os.path.join(D, 'cutout', os.path.basename(f)[:-4] + '.png'), compress_level=1)
        if i % 300 == 0: print('matte', i, 'of', len(F), flush=True)
print('done', len(F), 'frames on', dev)
