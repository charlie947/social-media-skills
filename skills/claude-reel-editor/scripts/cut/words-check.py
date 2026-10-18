#!/usr/bin/env python3
"""words-check.py: read the CUT transcript and flag words that should not survive the edit.

usage: python3 words-check.py <cut-words.json>
FAIL (exit 1): a filler sound (um, uh, er, erm, hmm, ah), the same word twice in a row, a word cut off halfway ("wo-"),
or a take you rejected out loud ("scratch that", "let me start again"). A rejected take goes, even with no pause around it.
REVIEW (printed, exit 0): soft fillers (like, you know, I mean, basically). Keep them only when they carry meaning.
"""
import json, re, sys

HARD = {'um', 'uh', 'er', 'erm', 'hmm', 'mm', 'ah', 'uhm'}
SOFT = ['you know', 'i mean', 'basically', 'like']
REJECT = ['scratch that', 'start again', 'let me start again', 'let me try again', 'let me redo', 'take two',
          'one more time', 'no wait', 'wait no', 'hang on', 'sorry let me', 'from the top']
if len(sys.argv) != 2:
    print(__doc__); sys.exit(2)
d = json.load(open(sys.argv[1], encoding='utf-8')); d = d['words'] if isinstance(d, dict) else d
words = [(str(x.get('word', x.get('w', ''))).strip(), float(x.get('start', x.get('s', 0)))) for x in d]
norm = [re.sub(r"[^a-z0-9'-]", '', t.lower()) for t, _ in words]
fails, review = [], []
for i, (n, (t, s)) in enumerate(zip(norm, words)):
    if n.strip('-') in HARD: fails.append(f'{s:7.2f}s filler "{t}"')
    if n.endswith('-') and len(n) > 1: fails.append(f'{s:7.2f}s word cut off halfway "{t}"')
    if i and n and n == norm[i - 1] and n not in ('that', 'had'): fails.append(f'{s:7.2f}s doubled word "{words[i - 1][0]} {t}"')
text = ' '.join(norm); starts, pos = [], 0
for n in norm: starts.append(pos); pos += len(n) + 1
def time_at(ch): return words[max(i for i, p in enumerate(starts) if p <= ch)][1]
for ph in REJECT:
    for m in re.finditer(r'\b' + re.escape(ph) + r'\b', text): fails.append(f'{time_at(m.start()):7.2f}s rejected take "{ph}": cut the whole take, keep the retake')
for ph in SOFT:
    for m in re.finditer(r'\b' + re.escape(ph) + r'\b', text): review.append(f'{time_at(m.start()):7.2f}s soft filler "{ph}": keep only if it carries meaning')
for f in sorted(fails): print('FAIL  ', f)
for r in sorted(review): print('REVIEW', r)
print(f'{len(words)} words, {len(fails)} fail, {len(review)} to review')
sys.exit(1 if fails else 0)
