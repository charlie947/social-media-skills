// check-frames.js: Claude's own check before you see anything. A frame every 0.25s, every beat.
// usage: node scripts/check-frames.js <project dir> [beat numbers...] [--no-shots] [--allow-fallback]
// Flags, each one a reason to fix before showing:
//   DEADZONE      text where Instagram covers it: the top 210px, below y1520, or right of x950 in the lower half
//   OFF-FRAME     text cut off by the edge of the frame
//   CAP-OVER      the caption touches a graphic
// Frames mid zoom-through are skipped for these three: everything is moving, blurred and fading there.
//   SMALL-HERO    on a split beat, after its first 0.6s, the graphic covers under 45% of the panel (x74-1006, y170-880)
//   DEAD-STRETCH  the graphic does not change for 1.5s or more (captions do not count)
// Prints NO FLAGS and exits 0 when clean. Exits 1 on any flag. Saves the frames and a contact sheet to <project>/check/.
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const { loadProject, launch, openReel, seekAndWait, extractFrames } = require('./lib');
const args = process.argv.slice(2), P = loadProject(args[0]);
const only = args.slice(1).filter(a => /^\d+$/.test(a)).map(Number), shots = !args.includes('--no-shots');

function inspect() {   // runs inside the page after seek(t)
  const B = REEL.beats.find(b => b.el.style.display === 'block'), o = [];
  const opac = e => { let op = 1; while (e && e !== document.body) { op *= +getComputedStyle(e).opacity; e = e.parentElement; } return op; };
  const cap = [...document.querySelectorAll('#cap span')].map(s => s.getBoundingClientRect()).filter(r => r.width);
  const hit = (r, c) => r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top;
  // text
  const w = document.createTreeWalker(B.el, NodeFilter.SHOW_TEXT); let x;
  while (!REEL._tr && (x = w.nextNode())) { const s = x.textContent.trim(); if (!s || opac(x.parentElement) < .3) continue;
    const rg = document.createRange(); rg.selectNodeContents(x);
    for (const r of rg.getClientRects()) { if (!r.width) continue; const lab = s.slice(0, 18);
      if (r.top < 210) o.push(`DEADZONE top "${lab}"`);
      if (r.bottom > 1522) o.push(`DEADZONE bottom "${lab}" y${Math.round(r.bottom)}`);
      if (r.right > 952 && r.top > 960) o.push(`DEADZONE right "${lab}" x${Math.round(r.right)}`);
      if (r.left < -2 || r.right > 1082) o.push(`OFF-FRAME "${lab}"`);
      if (cap.some(c => hit(r, c))) o.push(`CAP-OVER text "${lab}"`); } }
  // painted things: images, svg, and anything with a fill, border or shadow. Full-frame wrappers paint nothing, so they never count.
  const painted = [];
  for (const e of B.el.querySelectorAll('*')) { const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue;
    const cs = getComputedStyle(e), tag = e.tagName.toLowerCase();
    const paints = tag === 'img' || tag === 'svg' || cs.backgroundImage !== 'none' || !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor) || parseFloat(cs.borderTopWidth) > 0;
    if (!paints || tag === 'circle' || tag === 'path' || tag === 'polygon' || tag === 'rect' || opac(e) < .3) continue;
    if (tag === 'svg') {   // an svg box is often the whole frame: measure the shapes inside it (client rects include CSS 3D transforms)
      const sh = [...e.querySelectorAll('rect,polygon,circle,ellipse,path,line,text')].filter(x => !x.closest('defs') && +(x.getAttribute('opacity') ?? 1) > .3).map(x => x.getBoundingClientRect()).filter(q => q.width > 1);
      if (sh.length) painted.push(sh.reduce((a, q) => ({ left: Math.min(a.left, q.left), top: Math.min(a.top, q.top), right: Math.max(a.right, q.right), bottom: Math.max(a.bottom, q.bottom) }), { left: 1e9, top: 1e9, right: -1e9, bottom: -1e9 }));
      continue; }
    painted.push(r); }
  if (!REEL._tr) for (const r of painted) if (cap.some(c => hit({ left: r.left + 6, right: r.right - 6, top: r.top + 6, bottom: r.bottom - 6 }, c))) { o.push(`CAP-OVER object y${Math.round(r.top)}-${Math.round(r.bottom)}`); break; }
  // how much of the panel the hero covers (union box of everything painted, clipped to the panel)
  let fill = null;
  if (B.lay === 'split' && painted.length) { const X0 = 74, X1 = 1006, Y0 = 170, Y1 = 880;
    const u = painted.reduce((a, r) => ({ l: Math.min(a.l, r.left), t: Math.min(a.t, r.top), r: Math.max(a.r, r.right), b: Math.max(a.b, r.bottom) }), { l: 1e9, t: 1e9, r: -1e9, b: -1e9 });
    fill = Math.max(0, Math.min(X1, u.r) - Math.max(X0, u.l)) * Math.max(0, Math.min(Y1, u.b) - Math.max(Y0, u.t)) / ((X1 - X0) * (Y1 - Y0)); }
  return { i: B.i, lay: B.lay, a: B.a, flags: [...new Set(o)], fill, hash: B.el.innerHTML.length + ':' + B.el.style.cssText + ':' + B.el.innerHTML };
}

(async () => {
  extractFrames(P);
  const br = await launch();
  const { pg, errs } = await openReel(br, P, { allowFallback: args.includes('--allow-fallback') });
  const beats = await pg.evaluate(() => REEL.beats.map(b => ({ a: b.a, b: b.b, lay: b.lay })));
  const OUT = path.join(P.dir, 'check');
  if (shots) { fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true }); }
  const flags = []; let n = 0, samples = 0;
  for (const [i, b] of beats.entries()) {
    if (only.length && !only.includes(i)) continue;
    let prev = null, same = 0, sameFrom = 0;
    for (let t = b.a + .05; t < b.b; t += .25) {
      await seekAndWait(pg, t); samples++;
      const r = await pg.evaluate(inspect);
      const f = [...r.flags];
      if (r.fill !== null && t > b.a + .6 && r.fill < .45) f.push(`SMALL-HERO ${(r.fill * 100).toFixed(0)}% of the panel`);
      if (b.lay !== 'face') { if (r.hash === prev) { if (!same) sameFrom = t - .25; same++; } else same = 0; prev = r.hash;
        if (same === 6) f.push(`DEAD-STRETCH graphic still since ${sameFrom.toFixed(2)}s`); }
      if (f.length) flags.push(`beat ${i} t=${t.toFixed(2)}: ${f.join(' | ')}`);
      if (shots) await pg.screenshot({ path: path.join(OUT, `c${String(n++).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 60 });
    }
  }
  await br.close();
  if (shots && n) {
    const cols = 10, rows = Math.ceil(n / cols);
    spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(OUT, 'c%05d.jpg'), '-vf', `scale=216:384,tile=${cols}x${rows}:padding=4:color=white`, '-frames:v', '1', path.join(OUT, 'sheet.jpg')]);
  }
  console.log(`${samples} frames checked${shots ? `, sheet ${path.join(OUT, 'sheet.jpg')}` : ''}`);
  if (errs.length) { console.error('PAGE ERRORS\n' + errs.join('\n')); process.exit(2); }
  console.log(flags.length ? flags.join('\n') + `\n${flags.length} FLAGS` : 'NO FLAGS');
  process.exit(flags.length ? 1 : 0);
})().catch(e => { console.error('FAILED', e.message); process.exit(2); });
