// new-reel.js: start a reel folder from the kit, so every reel carries its own copy of the engine and never breaks when the kit changes.
// usage: node scripts/new-reel.js <folder>      (put your raw take in that folder as raw.mp4)
// Makes: reel.config.json, page/reel.html, page/beats.js (one starter beat), page/lib/ (engine + components).
const fs = require('fs'), path = require('path');
const KIT = path.resolve(__dirname, '..'), dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/new-reel.js <folder>'); process.exit(2); }
const D = path.resolve(dir), LIB = path.join(D, 'page/lib');
if (fs.existsSync(path.join(D, 'page/beats.js'))) { console.error(`${D} already has page/beats.js. Not touching it.`); process.exit(1); }
fs.mkdirSync(LIB, { recursive: true });
const engine = ['brand.js', 'motion.js', 'ui.js', 'engine.js'], comps = fs.readdirSync(path.join(KIT, 'components')).filter(f => f.endsWith('.js')).sort();
for (const f of engine) fs.copyFileSync(path.join(KIT, 'engine', f), path.join(LIB, f));
for (const f of comps) fs.copyFileSync(path.join(KIT, 'components', f), path.join(LIB, f));
fs.writeFileSync(path.join(D, 'reel.config.json'), JSON.stringify({ page: 'page/reel.html', raw: 'raw.mp4', segs: 'segs.json', audio: 'cut-audio.wav', words: 'cut-words.json', frames: 'page/frames',
  splitCrop: 'iw:iw*0.64:0:(ih-iw*0.64)/3', portraitCrop: 'ih*9/16:ih:(iw-ih*9/16)/2:0', fps: 60, workers: 4, out: 'out/reel.mp4' }, null, 2) + '\n');
fs.writeFileSync(path.join(D, 'page/reel.html'), `<!doctype html><html><head><meta charset="utf-8"><title>${path.basename(D)}</title></head><body>
${[...engine, ...comps].map(f => `<script src="lib/${f}"></script>`).join('\n')}
<script src="data.js"></script>
<script src="beats.js"></script>
<script>startPage();</script>
</body></html>
`);
fs.writeFileSync(path.join(D, 'page/beats.js'), `// One beat per spoken line. Times come from word() so every hit lands on its word. See the kit's example/page/beats.js.
const REEL = {
  title: '${path.basename(D)}',
  frames: 'frames',
  audio: '../cut-audio.wav',
  spell: {},                 // caption fixes: { 'twenty': '20' }
  // pop: true,              // head pop-out, after scripts/matte.py
  // cta: { at: 12.0, label: 'Comment', word: 'EDIT' },
  beats: [
    { a: 0, b: 2.0, lay: 'split', still: 1.8, move: 'HOOK: the title cascades in over a scrolling edit timeline',
      draw: (t) => timelineHook(t, { lines: ['Your hook', 'goes here'], cuts: [0.5, 1.0, 1.5] }) },
  ],
};
`);
console.log(`new reel at ${D}\nNext: put your raw take in it as raw.mp4, then follow the steps in SKILL.md.`);
