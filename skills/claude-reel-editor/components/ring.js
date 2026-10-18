// PROGRESS RING + GRID: a ring counts up to a total while a grid lights cell by cell. When it closes, the number
// becomes a tick and the pass line types under the real command. Good for "checks 212 frames" or "40 posts scheduled".
// It sits inside a code window in the lower box by default. Every readable line stays above y1520 (Instagram's caption area).
//
// progressRing(t, {
//   start: 7.0, dur: 2.5,          the count runs from start for dur seconds
//   total: 212, unit: 'frames',    the number it counts to
//   doneAt: 9.6,                   the tick and the pass line (the payoff word)
//   doneText: 'NO FLAGS',
//   cmd: 'node scripts/check-frames.js',   the real command, shown as the tool line
//   L: 74, T: 1114, W: 932, H: 618         the box. Defaults to the lower box
// })
function progressRing(t, o) {
  const L = o.L ?? 74, T = o.T ?? 1114, W = o.W ?? 932, H = o.H ?? 618;
  const p = eo(P(t, o.start, o.dur)), n = Math.round(o.total * p), done = t >= o.doneAt, R = 110, C = 2 * Math.PI * R;
  const res = done ? `<span style="display:inline-block;color:${BRAND.good};font-weight:800;${slam(t, o.doneAt, { z: 500, rx: 30, y: 0, d: .4 })}">${o.doneText || 'DONE'}</span>` : '&nbsp;';
  const head = `<div style="margin:0 0 10px;white-space:nowrap;opacity:${fade(t, o.start - .1)}"><span style="color:${BRAND.good}">●</span> <b style="font-weight:700">Bash</b>(${o.cmd || 'check'})<div style="color:${BRAND.mute};padding-left:30px">⎿&nbsp; ${res}</div></div>`;
  const ringSvg = `<svg width="260" height="260" viewBox="0 0 260 260" style="position:absolute;left:0;top:0"><circle cx="130" cy="130" r="${R}" fill="none" stroke="${BRAND.soft}" stroke-width="20"/><circle cx="130" cy="130" r="${R}" fill="none" stroke="${BRAND.accent}" stroke-width="20" stroke-linecap="round" stroke-dasharray="${f2(C * p)} ${f2(C)}" transform="rotate(-90 130 130)"/></svg>
    <div style="position:absolute;left:0;top:0;width:260px;height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center">${done ? `<div style="${slam(t, o.doneAt, { z: 400, rx: 30, y: 0, d: .35 })}">${tick(100)}</div>` : `<div style="font:800 76px/1 ${BRAND.font};letter-spacing:-.04em;font-variant-numeric:tabular-nums">${n}</div><div style="font:600 24px ${BRAND.font};color:${BRAND.mute};margin-top:6px;white-space:nowrap">of ${o.total} ${o.unit || ''}</div>`}</div>`;
  const N = 32, cells = Array.from({ length: N }, (_, i) => { const lit = i < Math.floor(N * p), hot = i === Math.floor(N * p);
    return `<i style="display:block;width:46px;height:46px;border-radius:12px;background:${lit ? BRAND.accent : hot ? `color-mix(in srgb,${BRAND.accent} 30%,#fff)` : BRAND.soft};transform:scale(${hot ? 1.12 : 1})"></i>`; }).join('');
  const grid = `<div style="position:absolute;left:330px;top:10px;display:grid;grid-template-columns:repeat(8,46px);gap:12px">${cells}</div>`;
  return code.win(L, T, W, H, `${head}<div style="position:relative;height:270px">${ringSvg}${grid}</div>`, '', o.title);
}
