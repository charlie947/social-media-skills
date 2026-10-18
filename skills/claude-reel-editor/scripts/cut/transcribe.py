#!/usr/bin/env python3
"""transcribe.py: speech to text with a timestamp on every word.

usage: python3 transcribe.py <audio-or-video> <words.json> [--model small.en]
Writes words.json = [{"word": "Claude", "start": 0.0, "end": 0.42}, ...]

Apple Silicon Mac: runs mlx-whisper through uv, nothing to install by hand except uv (brew install uv):
  uvx --python 3.11 --from mlx-whisper mlx_whisper audio.wav --model mlx-community/whisper-small.en-mlx \
      --output-format json --word-timestamps True
Windows, Linux or an Intel Mac: uses faster-whisper (pip install faster-whisper).
Set ASR=faster to force faster-whisper on a Mac.
Run it twice per reel: once on the raw take (to pick takes), once on cut-audio.wav (the clock every graphic uses).
"""
import argparse, glob, json, os, platform, shutil, subprocess, sys, tempfile

ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('out'); ap.add_argument('--model', default='small.en')
a = ap.parse_args()
mac = platform.system() == 'Darwin' and platform.machine() == 'arm64' and os.environ.get('ASR') != 'faster'
words = []
if mac:
    if not shutil.which('uvx'):
        sys.exit('uvx not found. Install uv first: brew install uv')
    tmp = tempfile.mkdtemp()
    wav = os.path.join(tmp, 'audio.wav')   # whisper wants 16kHz mono. This also strips the video
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.src, '-map', '0:a:0', '-ac', '1', '-ar', '16000', wav], check=True)
    subprocess.run(['uvx', '--python', '3.11', '--from', 'mlx-whisper', 'mlx_whisper', wav, '--model', f'mlx-community/whisper-{a.model}-mlx',
                    '--output-format', 'json', '--word-timestamps', 'True', '--output-dir', tmp], check=True)
    js = [p for p in glob.glob(os.path.join(tmp, '*.json'))]
    if not js:
        sys.exit('mlx_whisper wrote no json')
    r = json.load(open(js[0]))
    for s in r.get('segments', []):
        for w in s.get('words', []):
            words.append({'word': w['word'].strip(), 'start': round(w['start'], 3), 'end': round(w['end'], 3)})
    shutil.rmtree(tmp, ignore_errors=True)
else:
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit('faster-whisper not installed: pip install faster-whisper')
    m = WhisperModel(a.model, device='auto', compute_type='auto')
    segs, _ = m.transcribe(a.src, word_timestamps=True, condition_on_previous_text=False)
    for s in segs:
        for w in (s.words or []):
            words.append({'word': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3)})
json.dump(words, open(a.out, 'w'), indent=1)
print(f'{len(words)} words -> {a.out}')
print(' '.join(w['word'] for w in words)[:400])
