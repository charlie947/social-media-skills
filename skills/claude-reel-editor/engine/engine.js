// engine.js: draws any moment of the reel. window.seek(t) puts frame t on screen and nothing else.
//
// The reel is a list of beats. One beat = one spoken line = one big graphic.
//   { a, b,            start and end on the CUT clock (seconds)
//     lay,             'split' = graphic on top, face card below
//                      'full'  = graphic fills the frame, no face
//                      'face'  = the face fills the frame (a hard cut, for a break)
//     still,           the time the storyboard shoots for this beat (the payoff moment)
//     move,            one plain sentence: what the graphic does, and on which word
//     draw(t, beat),   returns the HTML for time t
//     hits: [t],       optional. The graphic punches 5% on each of these words
//     carry: true,     optional. This beat hands its object to the next one, so no zoom-through between them
//     cap: 1300 }      optional. Caption y for this beat, when the hero needs the seam line
//
// Frame sizes are fixed: 1080x1920. The zones below are where things may go.
const ZONE = {
  panel: { x: 74, y: 170, w: 932, h: 710 },     // the hero fills this on split beats (x74-1006, y170-880)
  low: { x: 40, y: 1114, w: 1000, h: 618 },     // the face card on split beats, the second box on full beats
  capBand: [930, 990],                          // the caption line. Nothing crosses it
  dead: { top: 210, bottom: 1520, right: 950, rightFrom: 960 },   // Instagram covers these: no text there
};
const CL = ZONE.panel.x, CW = ZONE.panel.w;
const $ = id => document.getElementById(id);
const pad5 = n => String(Math.max(0, n)).padStart(5, '0');

// CUT holds the cut transcript and the cut list. data.js sets it (scripts/make-data.js writes data.js).
window.CUT = window.CUT || { words: [], segs: [], dur: 0 };
// word('3D') = the first word "3D" in the cut. word('step', 2) = the third "step". Use it so every hit lands on its word.
const word = (txt, n = 0) => { const k = String(txt).toLowerCase().replace(/[^a-z0-9%']/g, '');
  const hits = CUT.words.filter(w => w.word.toLowerCase().replace(/[^a-z0-9%']/g, '') === k);
  if (!hits[n]) throw new Error(`word("${txt}", ${n}) is not in the cut transcript`);
  return hits[n].start; };
const wordEnd = (txt, n = 0) => { const s = word(txt, n); return CUT.words.find(w => w.start === s).end; };

// cut time -> raw time, from the cut list. The face frame always comes from the true raw time, so lip sync never drifts across a join.
const rawOf = c => { const S = CUT.segs; if (!S || !S.length) return c; let acc = 0;
  for (const [a, b] of S) { if (c < acc + (b - a)) return a + (c - acc); acc += b - a; }
  return S[S.length - 1][1] - 1e-3; };
const faceIndex = t => Math.round(rawOf(t) * (REEL.faceFps || 30));

document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${BRAND.fontsUrl}"><style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;overflow:hidden;background:${BRAND.bg};font-family:${BRAND.font};color:${BRAND.ink};position:relative;-webkit-font-smoothing:antialiased}
#bg{position:absolute;inset:-60px;background-image:linear-gradient(rgba(16,24,40,${BRAND.gridOpacity}) 1px,transparent 1px),linear-gradient(90deg,rgba(16,24,40,${BRAND.gridOpacity}) 1px,transparent 1px);background-size:${BRAND.gridSize}px ${BRAND.gridSize}px}
#port{position:absolute;inset:0;display:none;background:#D9DDE3}#port img{width:1080px;height:1920px;object-fit:cover;display:block}
#fcard{position:absolute;left:${ZONE.low.x}px;top:${ZONE.low.y}px;width:${ZONE.low.w}px;height:${ZONE.low.h}px;border-radius:48px;overflow:hidden;background:#D9DDE3;box-shadow:0 2px 6px rgba(16,24,40,.08),0 24px 60px rgba(16,24,40,.16);display:none}
#fcard img{width:1000px;height:640px;object-fit:cover;display:block}
#pop{position:absolute;left:${ZONE.low.x}px;top:1000px;width:1000px;height:114px;overflow:hidden;z-index:8;display:none;pointer-events:none}
#pop img{position:absolute}
.bt{position:absolute;inset:0;display:none}
#cap{position:absolute;left:40px;width:1000px;top:${BRAND.caption.y}px;text-align:center;font:${BRAND.caption.weight} ${BRAND.caption.size}px ${BRAND.font};letter-spacing:-.022em;color:${BRAND.ink};text-shadow:0 0 2px #fff,0 0 14px rgba(255,255,255,.95),0 0 28px rgba(255,255,255,.85);white-space:nowrap;z-index:20}
#cap span{display:inline-block;margin:0 6px}
#cap.chest{top:${BRAND.caption.faceY}px;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.55),0 0 2px rgba(0,0,0,.4)}
#cta{position:absolute;left:90px;width:900px;top:240px;z-index:10;display:none;padding:40px 46px;border-radius:44px;background:#fff;box-shadow:0 2px 6px rgba(16,24,40,.1),0 30px 70px rgba(0,0,0,.28)}
#cta .lb{font:600 38px ${BRAND.font};color:${BRAND.mute}}#cta .kw{font:800 104px ${BRAND.font};letter-spacing:-.03em;display:flex;align-items:center;gap:26px}
#cta .ic{width:92px;height:92px;border-radius:24px;background:${BRAND.accent};display:flex;align-items:center;justify-content:center}
</style>`);

// captions: chunks of up to 4 words from the CUT transcript, broken at punctuation and at pauses. Each word blurs in on its start.
function buildCaps(words) {
  const out = []; let cur = [];
  const flush = () => { if (cur.length) { out.push({ a: cur[0].start, b: cur[cur.length - 1].end, w: cur }); cur = []; } };
  words.forEach((w, i) => { cur.push(w); const nx = words[i + 1], len = cur.map(x => x.text).join(' ').length;
    if (/[.,?!]$/.test(w.text) || cur.length >= 4 || len > 20 || (nx && nx.start - w.end > .3)) flush(); });
  flush();
  out.forEach((c, i) => { c.b = out[i + 1] ? out[i + 1].a : c.b + .5; });
  return out;
}
let CAPS = [];
function caps(t, B) {
  const el = $('cap'); el.className = B.lay === 'face' ? 'chest' : '';
  el.style.top = B.cap && B.lay !== 'face' ? B.cap + 'px' : '';
  const c = CAPS.find(k => t >= k.a && t < k.b);
  if (!c) { el.innerHTML = ''; return; }
  el.innerHTML = c.w.map(w => { const p = eo(P(t, w.start - .04, .22));
    return `<span style="opacity:${p.toFixed(3)};filter:blur(${((1 - p) * 7).toFixed(2)}px);transform:translateY(${((1 - p) * 10).toFixed(1)}px)">${w.text}</span>`; }).join('');
}

// head pop-out: the card image is scaled up and lifted so the head crosses the card top. A strip above the card shows only
// the cut-out of the same frame (scripts/matte.py), so only the person breaks out of the box, never the background.
const POP = { s: 1.10, dx: -50, dy: -86 };

function init() {
  if (typeof REEL === 'undefined') throw new Error('beats.js must define REEL');
  REEL.dur = REEL.dur || CUT.dur || Math.max(...REEL.beats.map(b => b.b));
  const words = (REEL.fix ? REEL.fix(CUT.words) : CUT.words).map(w => ({ ...w, text: (REEL.spell && REEL.spell[w.word]) || w.word }));
  CAPS = buildCaps(words);
  document.body.insertAdjacentHTML('afterbegin', `<div id="bg"></div><div id="port"><img id="portI"></div><div id="fcard"><img id="faceI"></div><div id="pop"><img id="popI"></div><div id="cap"></div>
    <div id="cta"><div class="lb">${REEL.cta ? REEL.cta.label || 'Comment' : ''}</div><div class="kw"><div class="ic"><svg viewBox="0 0 24 24" width="56" height="56" fill="#fff"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 2-2z"/></svg></div><span>${REEL.cta ? REEL.cta.word : ''}</span></div></div>`);
  if (REEL.pop) {
    const fi = $('faceI'), pi = $('popI');
    fi.style.cssText = `width:${1000 * POP.s}px;height:${640 * POP.s}px;object-fit:cover;transform:translate(${POP.dx}px,${POP.dy}px)`;
    pi.style.cssText = `left:${POP.dx}px;top:${ZONE.low.y - 1000 + POP.dy}px;width:${1000 * POP.s}px;height:${640 * POP.s}px`;
  }
  REEL.beats.forEach((b, i) => { const d = document.createElement('div'); d.className = 'bt'; d.id = 'b' + i; document.body.insertBefore(d, $('cap')); b.el = d; b.i = i; });
}

const setSrc = (img, src) => { if (img.getAttribute('src') !== src) img.setAttribute('src', src); };
window.seek = function (t) {
  const bi = REEL.beats.findIndex(b => t >= b.a && t < b.b), B = REEL.beats[bi < 0 ? REEL.beats.length - 1 : bi];
  REEL.beats.forEach(b => { b.el.style.display = b === B ? 'block' : 'none'; });
  B.el.innerHTML = B.draw ? B.draw(t, B) : '';
  // layouts
  $('port').style.display = B.lay === 'face' ? 'block' : 'none';
  $('fcard').style.display = B.lay === 'split' ? 'block' : 'none';
  $('pop').style.display = B.lay === 'split' && REEL.pop ? 'block' : 'none';
  if (REEL.frames) {
    const k = pad5(faceIndex(t));
    if (B.lay === 'face') setSrc($('portI'), `${REEL.frames}/portrait/${k}.jpg`);
    if (B.lay === 'split') { setSrc($('faceI'), `${REEL.frames}/split/${k}.jpg`); if (REEL.pop) setSrc($('popI'), `${REEL.frames}/cutout/${k}.png`); }
  }
  // the end card
  const C = REEL.cta;
  $('cta').style.cssText = C && t >= C.at ? 'display:block;' + e3(t, C.at, .4, { y: 40, rx: -30 }) : 'display:none';
  caps(t, B);
  // transitions. Face cuts are hard cuts. Between two graphic beats the old one zooms through into the new one.
  B.el.style.transform = ''; B.el.style.filter = ''; B.el.style.opacity = ''; REEL._tr = 0;
  if (B.lay === 'face') return;
  const prv = REEL.beats[B.i - 1], nxt = REEL.beats[B.i + 1], zt = REEL.zoomThrough !== false;
  const zin = zt && prv && prv.lay !== 'face' && !prv.carry ? 1 - eo(P(t, B.a, .32)) : 0;
  const zo = zt && nxt && nxt.lay !== 'face' && !B.carry ? P(t, B.b - .2, .2) : 0, e = zo * zo;
  const hit = (B.hits || []).filter(h => t >= h).pop();
  const punch = hit === undefined ? 1 : 1 + .05 * Math.sin(Math.PI * Math.min(1, (t - hit) / .28));
  REEL._tr = Math.max(zin, zo);   // the checks skip frames that are mid zoom-through
  const s = (1 - .2 * zin) * punch * (1 + 1.2 * e);
  if (s !== 1) { B.el.style.transformOrigin = '540px 520px'; B.el.style.transform = `scale(${s.toFixed(4)})`; }
  const bl = 9 * zin + 16 * e;
  if (bl > .05) B.el.style.filter = `blur(${f2(bl)}px)`;
  if (zin || e) B.el.style.opacity = f2((1 - .85 * zin) * (1 - e));
};

// The page modes. reel.html#play plays the reel with sound (click, space, arrow keys jump 2s).
// reel.html#4,6 loops 4s to 6s. No hash = frame 0, which is what the render and the checks use.
function startPage() {
  init();
  const H = location.hash.slice(1);
  if (H === 'play') {
    const au = new Audio(REEL.audio || 'cut-audio.wav'); let raf = 0;
    document.body.insertAdjacentHTML('beforeend', `<div id="pl" style="position:absolute;inset:0;z-index:99;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.35);cursor:pointer"><div style="width:260px;height:260px;border-radius:50%;background:${BRAND.accent};display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="120" height="120" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div></div><div id="pb" style="position:absolute;left:0;bottom:0;height:14px;width:0;background:${BRAND.accent};z-index:98"></div>`);
    const pl = $('pl'), pb = $('pb');
    const loop = () => { seek(au.currentTime); pb.style.width = (au.currentTime / REEL.dur * 100) + '%'; if (!au.paused) raf = requestAnimationFrame(loop); };
    const tog = () => { if (au.paused) { au.play(); pl.style.display = 'none'; loop(); } else { au.pause(); pl.style.display = 'flex'; } };
    addEventListener('click', tog);
    addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); tog(); } if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') { au.currentTime = Math.max(0, au.currentTime + (e.code === 'ArrowRight' ? 2 : -2)); seek(au.currentTime); } });
    // the storyboard page posts {t} when a card is clicked: jump there and play with sound
    addEventListener('message', e => { const d = e.data || {}; if (typeof d.t === 'number') { au.currentTime = d.t; seek(d.t); if (au.paused) tog(); } });
    au.addEventListener('ended', () => { pl.style.display = 'flex'; au.currentTime = 0; });
    seek(0);
  } else {
    const N = H.split(',').map(Number);
    if (N.length === 2 && N.every(n => !isNaN(n))) { const [a, b] = N, t0 = performance.now(); const f = () => { const e = ((performance.now() - t0) / 1000) % (b - a + .8); seek(Math.min(b - .01, a + e)); requestAnimationFrame(f); }; f(); }
    else seek(0);
  }
}
