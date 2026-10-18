// STAIRCASE: "N steps" as real 3D blocks. They rise from the floor, a ball climbs one step per spoken word,
// each step lights as the ball lands, and the name of the current step flips over in a pill.
// The payoff is the ball reaching the top step ON its word: pass that word's time as the last entry of `times`.
//
// staircase(t, {
//   steps: ['Cut', 'Storyboard', ...],   labels, one per step
//   times: [2.4, 2.7, ...],              when the ball lands on each step (use word('...'))
//   start: 2.2,                          beat start: blocks rise from here
//   title: 'Edit in <b>4 steps</b>',     optional title top left (HTML)
//   full: false,                         true = full-frame height (a FULL beat), false = fits the split panel
// })
function staircase(t, o) {
  const S = o.steps, n = S.length, a0 = o.start, id = o.id || 'st';
  const full = !!o.full, W = Math.min(210, Math.floor(840 / n)), DX = 26, DY = 22;
  const BASE = full ? 1610 : 846, top0 = full ? 1440 : 772, rise = (full ? 940 : 480) / n;
  const x = i => 74 + i * W, yt = i => top0 - i * rise, arr = i => o.times[i];
  const cur = S.reduce((c, s, i) => t >= arr(i) ? i : c, -1);
  const lit = BRAND.accent, litTop = `color-mix(in srgb,${BRAND.accent} 50%,#fff)`, litSide = BRAND.accentDark;
  let g = `<defs><linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${BRAND.accentLight}"/><stop offset="1" style="stop-color:${BRAND.accentDark}"/></linearGradient>
    <linearGradient id="${id}o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="${BRAND.soft}"/></linearGradient>
    <radialGradient id="${id}f"><stop offset="0" stop-color="rgba(0,19,47,.20)"/><stop offset="1" stop-color="rgba(0,19,47,0)"/></radialGradient></defs>
    <ellipse cx="${x(n / 2)}" cy="${BASE + 6}" rx="520" ry="26" fill="url(#${id}f)" opacity="${f2(eo(P(t, a0 + .06, .5)))}"/>`;
  for (let i = 0; i < n; i++) {   // low to high, so each taller step hides the side of the one below it
    const k = spr(P(t, a0 + .04 + i * .045, .55)), top = BASE - (BASE - yt(i)) * k, L = t >= arr(i);
    const press = L ? 5 * Math.sin(Math.PI * P(t, arr(i), .22)) : 0, y = top + press, X = x(i);
    if (k <= 0) continue;
    g += `<g opacity="${f2(eo(P(t, a0 + .04 + i * .045, .15)))}">
      <polygon points="${X + W},${f2(y)} ${X + W + DX},${f2(y - DY)} ${X + W + DX},${BASE - DY} ${X + W},${BASE}" style="fill:${L ? litSide : '#DCE1EA'}"/>
      <rect x="${X}" y="${f2(y)}" width="${W}" height="${f2(BASE - y)}" fill="url(#${id}${L ? 'l' : 'o'})" stroke="${L ? 'rgba(0,40,100,.25)' : 'rgba(0,19,47,.10)'}" stroke-width="1.5"/>
      <polygon points="${X},${f2(y)} ${X + DX},${f2(y - DY)} ${X + W + DX},${f2(y - DY)} ${X + W},${f2(y)}" style="fill:${L ? litTop : '#FFFFFF'}" stroke="rgba(0,19,47,.10)" stroke-width="1.5"/>
      <text x="${X + W / 2}" y="${f2(y + Math.min(60, W * .62))}" text-anchor="middle" style="font:800 ${Math.round(Math.min(56, W * .48))}px ${BRAND.font};fill:${L ? '#fff' : '#AEB4BF'}">${i + 1}</text></g>`;
  }
  // the ball hops from step top to step top on an arc, with a pulse on each landing
  const tp = i => [x(i) + W / 2 + DX / 2, yt(i) - DY / 2 - 14];
  if (t >= arr(0) - .25) {
    let q;
    if (t < arr(0)) { const u = eo(P(t, arr(0) - .25, .25)); q = [tp(0)[0], tp(0)[1] - 80 * (1 - u)]; }
    else if (cur < n - 1) { const u = P(t, arr(cur) + .05, Math.min(.22, arr(cur + 1) - arr(cur) - .05)), a = tp(cur), b = tp(cur + 1); q = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - Math.sin(Math.PI * u) * 46]; }
    else q = tp(n - 1);
    g += `<circle cx="${f2(q[0])}" cy="${f2(q[1])}" r="15" fill="${lit}" stroke="#fff" stroke-width="6"/>`;
  }
  g += S.map((s, i) => pulse([tp(i)[0], tp(i)[1] + 14], t, arr(i), lit, 16, 1.6)).join('');
  // the current step's name in one fixed pill under the title, flipping over as each step lands
  let lab = '';
  if (cur >= 0) { const f = eo(P(t, arr(cur), .18));
    lab = `<div style="position:absolute;left:74px;top:${full ? 620 : 466}px;perspective:500px"><div style="height:72px;padding:0 28px 0 12px;border-radius:36px;display:inline-flex;align-items:center;gap:16px;font:650 36px ${BRAND.font};letter-spacing:-.02em;white-space:nowrap;${BRAND.card};transform-origin:50% 0;transform:rotateX(${f2(-80 * (1 - f))}deg)"><b style="width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font:800 26px ${BRAND.font};background:linear-gradient(180deg,${BRAND.accentLight},${BRAND.accent})">${cur + 1}</b>${S[cur]}</div></div>`; }
  const title = o.title ? `<div style="position:absolute;left:74px;top:${full ? 350 : 250}px;font:800 76px/1.02 ${BRAND.font};letter-spacing:-.035em;${e3(t, a0, .6, { rx: 30, y: full ? 60 : -30 })}">${o.title}</div>` : '';
  return cam(t, a0, title + `<svg style="position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:visible">${g}</svg>` + lab, { rx0: -10, rx1: -3, ry0: -14, ry1: -5 });
}
