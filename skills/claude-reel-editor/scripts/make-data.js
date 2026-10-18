// make-data.js: write page/data.js from the cut transcript and the cut list, so the page knows every word time.
// usage: node scripts/make-data.js <project dir>
// Run it again every time the cut changes. Cuts move every later time, so every beat time moves with them.
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const { loadProject } = require('./lib');
const P = loadProject(process.argv[2]);
const read = f => { if (!f || !fs.existsSync(f)) { console.error(`missing ${f}`); process.exit(2); } return JSON.parse(fs.readFileSync(f, 'utf8')); };
let words = read(P.words); words = words.words || words;
words = words.map(w => ({ word: String(w.word ?? w.w).trim(), start: +(w.start ?? w.s), end: +(w.end ?? w.e) })).filter(w => w.word);
const segs = P.segs && fs.existsSync(P.segs) ? read(P.segs) : [];
let dur = segs.length ? segs.reduce((s, [a, b]) => s + b - a, 0) : 0;
if (P.audio && fs.existsSync(P.audio)) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', P.audio], { encoding: 'utf8' });
  if (+r.stdout > 0) dur = +r.stdout;
}
const out = path.join(path.dirname(P.page), 'data.js');
fs.writeFileSync(out, `// written by scripts/make-data.js from ${path.basename(P.words)} and ${P.segs ? path.basename(P.segs) : 'no cut list'}. Do not edit by hand.\n` +
  `window.CUT = ${JSON.stringify({ dur: +dur.toFixed(3), segs, words })};\n`);
console.log(`${words.length} words, ${segs.length} segments, ${dur.toFixed(2)}s -> ${out}`);
