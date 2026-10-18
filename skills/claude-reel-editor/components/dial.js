// GIANT DIAL: one huge 3D clock face fills the panel. An accent arc sweeps the short time ("five minutes"),
// REC lights, then a grey arc races round the long time ("another hour"), shatters and falls, and the number
// snaps back to the short time. The shards fall back into depth, never down across the caption line. A tick lands on the last word.
//
// dial(t, {
//   start: 8.0,                beat start (the dial swings in)
//   fastAt: 8.2, mins: 5,      the accent arc sweeps to `mins` on the short time's word
//   recAt: 8.8,                optional, REC lights
//   slowAt: 9.2, slowMins: 60, the grey arc races round on the long time's word
//   breakAt: 9.6,              the grey arc shatters and falls
//   tickAt: 10.2,              the tick (the payoff word)
//   unit: 'min'
// })
function dial(t, o) {
  const cx = 540, cy = 520, r = 270, full = o.slowMins || 60;
  const arc = (a0, a1) => { const p = a => [cx + (r - 6) * Math.sin(a * Math.PI * 2), cy - (r - 6) * Math.cos(a * Math.PI * 2)], [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M${f2(x0)} ${f2(y0)} A${r - 6} ${r - 6} 0 ${a1 - a0 > .5 ? 1 : 0} 1 ${f2(x1)} ${f2(y1)}`; };
  const blue = eo(P(t, o.fastAt, .5)) * (o.mins / full), grey = P(t, o.slowAt, .36), brk = P(t, o.breakAt, .5);
  const mins = t < o.slowAt ? Math.round(blue * full) : t < o.breakAt ? Math.max(o.mins, Math.round(grey * full)) : o.mins, hot = t >= o.slowAt && t < o.breakAt;
  const ticks = Array.from({ length: 60 }, (_, i) => { const a = i / 60 * Math.PI * 2, L = i % 5 ? 14 : 30;
    return `<line x1="${f2(cx + Math.sin(a) * (r - 38))}" y1="${f2(cy - Math.cos(a) * (r - 38))}" x2="${f2(cx + Math.sin(a) * (r - 38 - L))}" y2="${f2(cy - Math.cos(a) * (r - 38 - L))}" stroke="${i % 5 ? '#D3D7DE' : '#9AA0AA'}" stroke-width="${i % 5 ? 3 : 5}" stroke-linecap="round"/>`; }).join('');
  const shards = grey > 0 && brk < 1 ? Array.from({ length: 12 }, (_, i) => { const a0 = i / 12, a1 = Math.min(grey, (i + 1) / 12); if (a1 <= a0) return ''; const fall = brk * brk;
    return `<path d="${arc(a0, a1 - .004)}" fill="none" stroke="#B7BCC6" stroke-width="30" transform="translate(${f2(Math.sin(i) * 120 * fall)} ${f2(fall * 160)}) rotate(${f2((i % 2 ? 1 : -1) * 40 * fall)} ${cx} ${cy})" opacity="${f2(1 - brk)}"/>`; }).join('') : '';
  const face = `<svg width="1080" height="1000" viewBox="0 0 1080 1000" style="position:absolute;left:0;top:0;overflow:visible">
    <defs><radialGradient id="dialg" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${BRAND.soft}"/></radialGradient><filter id="dialb"><feGaussianBlur stdDeviation="18"/></filter></defs>
    <circle cx="${cx}" cy="${cy + 26}" r="${r + 8}" fill="rgba(0,19,47,.12)" filter="url(#dialb)"/>
    <circle cx="${cx}" cy="${cy}" r="${r + 12}" fill="url(#dialg)" stroke="rgba(0,19,47,.10)" stroke-width="3"/>${ticks}
    <circle cx="${cx}" cy="${cy}" r="${r - 6}" fill="none" stroke="${BRAND.soft}" stroke-width="30"/>${shards}
    ${blue > 0 ? `<path d="${arc(0, Math.max(.001, blue))}" fill="none" stroke="${BRAND.accent}" stroke-width="30" stroke-linecap="round"/>` : ''}</svg>
    <div style="position:absolute;left:0;right:0;top:${cy - 92}px;text-align:center;font:800 150px/1 ${BRAND.font};letter-spacing:-.05em;color:${hot ? '#9AA0AA' : BRAND.ink}">${mins}<span style="font-size:64px;letter-spacing:-.02em;color:${hot ? '#9AA0AA' : BRAND.accent}"> ${o.unit || 'min'}</span></div>
    ${o.recAt ? `<div style="position:absolute;left:${cx - 70}px;top:${cy + 86}px;width:140px;padding:10px 0;border-radius:30px;text-align:center;font:700 30px ${BRAND.font};background:${t >= o.recAt ? BRAND.ink : '#E5E7EB'};color:#fff;opacity:${fade(t, o.recAt, .15)}"><span style="color:${BRAND.rec}">●</span> REC</div>` : ''}
    ${t >= o.tickAt ? `<div style="position:absolute;left:${cx + r - 40}px;top:${cy - r - 10}px;${e3(t, o.tickAt, .4, { rx: -60, y: -40, z: 300 })}">${tick(96)}</div>` : ''}`;
  return camH(t, o.start, `<div style="position:absolute;inset:0;${e3(t, o.start, .5, { rx: -50, y: 160, z: -900, org: '50% 50%' })}">${face}</div>`, { rx0: -22, ry0: -16 });
}
