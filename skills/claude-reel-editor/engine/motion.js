// motion.js: the timing and motion helpers every beat uses.
// Every helper is a pure function of t (seconds on the CUT clock). Nothing keeps state between frames,
// so seek(t) draws the same frame every time and the render can jump to any frame in any order.

const cl = x => Math.max(0, Math.min(1, x));
const P = (t, a, d) => cl((t - a) / d);                 // progress 0 to 1 of a move that starts at a and lasts d
const eo = x => 1 - Math.pow(1 - x, 3);                 // ease out
const f2 = n => (+n).toFixed(2);
// critically damped settle: lands like a spring with no overshoot and no bounce
const spr = x => x <= 0 ? 0 : x >= 1 ? 1 : (1 - (1 + 7 * x) * Math.exp(-7 * x)) / (1 - 8 * Math.exp(-7));
const land = (t, a, d = .5) => spr(P(t, a, d));         // 0 to 1, settles on time
const fade = (t, a, d = .18) => f2(eo(P(t, a, d)));     // opacity string for a quick fade in
const on = (t, a) => t >= a;

// typed text: the string types out between a and b
const typed = (s, t, a, b) => s.slice(0, Math.round(s.length * cl((t - a) / (b - a))));
const caret = (t, h = 52) => (Math.floor(t * 2.4) % 2 ? '' : `<i style="display:inline-block;width:4px;height:${h}px;background:${BRAND.accent};vertical-align:-8px;margin-left:3px"></i>`);

// 3D entrance: comes from back and tilted, settles flat. Opacity leads so it never pops.
const e3 = (t, a, d = .7, o = {}) => { const s = spr(P(t, a, d)), f = eo(P(t, a, d * .45));
  return `opacity:${f2(f)};transform-origin:${o.org ?? '50% 0%'};transform:translate3d(0,${f2((1 - s) * (o.y ?? 40))}px,${f2((1 - s) * (o.z ?? -220))}px) rotateX(${f2((1 - s) * (o.rx ?? -38))}deg) rotateY(${f2((1 - s) * (o.ry ?? 0))}deg)`; };
// SLAM: a hard 3D entrance from deep (z -1300) with a big tilt. Use it on the spoken word.
const slam = (t, a, o = {}) => e3(t, a, o.d ?? .55, { rx: o.rx ?? -62, ry: o.ry ?? 0, y: o.y ?? 220, z: o.z ?? -1300, org: o.org ?? '50% 50%' });
// CRASH: gravity exit. Accelerates, tips and drops back into depth, so it never crosses the caption line.
const crash = (t, a, d = .5, o = {}) => { const k = P(t, a, d), e = k * k;
  return `transform-origin:50% 100%;transform:translate3d(0,${f2(e * (o.y ?? 160))}px,${f2(-e * (o.z ?? 1100))}px) rotateX(${f2(e * (o.rx ?? 80))}deg) rotateZ(${f2(e * (o.rz ?? 12))}deg);opacity:${f2(1 - P(t, a + d * .55, d * .45))}`; };

// CAMERA: wraps a layer in perspective. It starts tilted and settles once over d seconds, then holds still.
const cam = (t, a, html, o = {}) => { const k = eo(P(t, a, o.d ?? 2.4)), oy = o.oy ?? 520;
  const rx = (o.rx0 ?? -12) + ((o.rx1 ?? -4) - (o.rx0 ?? -12)) * k, ry = (o.ry0 ?? -12) + ((o.ry1 ?? -3) - (o.ry0 ?? -12)) * k;
  return `<div style="position:absolute;inset:0;perspective:${o.per ?? 2600}px;perspective-origin:540px ${oy}px"><div style="position:absolute;inset:0;transform-style:preserve-3d;transform-origin:540px ${oy}px;transform:rotateX(${f2(rx)}deg) rotateY(${f2(ry)}deg)">${html}</div></div>`; };
const camH = (t, a, html, o = {}) => cam(t, a, html, { rx0: -24, ry0: -26, rx1: -4, ry1: -2, d: 1.5, ...o });   // a harder tilt that settles faster

// letters cascade in one by one, each flipping up from below
const cascade = (s, t, a, col = BRAND.ink, gap = .035) => [...s].map((ch, i) => { const k = land(t, a + i * gap, .55);
  return `<span style="display:inline-block;white-space:pre;opacity:${fade(t, a + i * gap, .12)};transform:translateY(${f2((1 - k) * 60)}px) rotateX(${f2((1 - k) * -80)}deg);transform-origin:50% 100%;color:${col}">${ch}</span>`; }).join('');

// a ring that expands and fades from a point: the "hit" mark on a word. HTML version and SVG version.
const ring = (cx, cy, t, a, c = BRAND.accent, r = 30, g = 1.4) => { const k = P(t, a, .55); if (!(t >= a && k < 1)) return ''; const R = r + eo(k) * r * g;
  return `<div style="position:absolute;left:${f2(cx - R)}px;top:${f2(cy - R)}px;width:${f2(2 * R)}px;height:${f2(2 * R)}px;border-radius:50%;border:${f2(6 * (1 - k))}px solid ${c};opacity:${f2(1 - k)}"></div>`; };
const pulse = (q, t, a, c = BRAND.accent, r = 9, g = 2.4) => { const k = P(t, a, .5);
  return t >= a && k < 1 ? `<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="${f2(r + eo(k) * r * g)}" fill="none" stroke="${c}" stroke-width="${f2(r * .42 * (1 - k))}" opacity="${f2(1 - k)}"/>` : ''; };

// a ball that travels a cubic bezier with a short trail, then pulses where it lands (SVG)
const bz = (p, u) => { const m = 1 - u; return [0, 1].map(k => m * m * m * p[0][k] + 3 * m * m * u * p[1][k] + 3 * m * u * u * p[2][k] + u * u * u * p[3][k]); };
const ball = (pts, t, a, d, c = BRAND.accent, r = 9, g = 2.4) => {
  if (t < a) return ''; const u = P(t, a, d); let s = '';
  if (u < 1) { const ue = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    [.16, .1, .05].forEach((gg, i) => { const q = bz(pts, Math.max(0, ue - gg)); s += `<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="${f2(r * (.45 + i * .15))}" fill="${c}" opacity="${f2(.16 + i * .12)}"/>`; });
    const q = bz(pts, ue); s += `<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="${r}" fill="${c}" stroke="#fff" stroke-width="${f2(r * .45)}"/>`; }
  return s + pulse(pts[3], t, a + d, c, r, g);
};

// a label that flips over on rotateX at time at, from text a to text b
const flipTxt = (t, at, a, b, d = .14) => { const ang = t < at ? -90 * eo(P(t, at - d, d)) : 90 * (1 - eo(P(t, at, d + .04)));
  return { txt: t < at ? a : b, st: `transform:rotateX(${f2(ang)}deg)` }; };

// stretch a component's own clock so its payoff lands on a word: maps t so that time `from` plays at `to`
const stretch = (t, start, from, to) => start + (t - start) * ((from - start) / (to - start));
