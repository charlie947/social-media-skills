// VERSION CAROUSEL: a big 3D ring of 9:16 cards (your earlier versions) fills the panel. Each word turns it one card,
// then it spins fast to the winner, which lifts forward and gets a tick while the others grey back.
// Use real 9:16 frames of your own earlier renders, never landscape stills cropped to fit.
//
// carousel(t, {
//   images: ['v1.jpg', ..., 'v5.jpg'],   the last image is the winner
//   start: 6.6,                           beat start
//   turns: [6.9, 7.1, 7.3],               one turn per word
//   spinAt: 7.6,                          the fast spin to the winner
//   landAt: 8.3,                          the winner lifts and ticks (the payoff word)
//   label: 'v5'                           optional badge on the winner
// })
function carousel(t, o) {
  const IM = o.images, N = IM.length, win = N - 1;
  const spinSteps = ((win - o.turns.length) % N + N) % N || N;
  const s = P(t, o.spinAt, .5);
  const k = o.turns.reduce((a, h) => a + eo(P(t, h, .16)), 0) + spinSteps * (s < .5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2);
  const blur = s > 0 && s < 1 ? 5 * Math.sin(Math.PI * s) : 0, lift = land(t, o.landAt, .45), half = N / 2;
  const cards = IM.map((im, i) => { const d = ((i - k + half) % N + N) % N - half, ad = Math.abs(d); if (ad > 2.7) return ''; const front = i === win;
    const x = 540 + Math.sign(d) * 560 * (1 - Math.exp(-.9 * ad)), ry = -Math.max(-60, Math.min(60, d * 34)), z = -ad * 260 + (front ? lift * 80 : -lift * 120);
    return `<div style="position:absolute;left:${f2(x - 169)}px;top:240px;width:338px;height:600px;z-index:${100 - Math.round(ad * 10)};transform:translateZ(${f2(z)}px) rotateY(${f2(ry)}deg);filter:grayscale(${f2(front ? 0 : lift * .8)}) blur(${f2(ad < .5 ? 0 : blur)}px);opacity:${f2(Math.min(1, 2.7 - ad) * (front ? 1 : 1 - lift * .35))}">
      <div style="width:100%;height:100%;border-radius:30px;overflow:hidden;position:relative;box-shadow:${BRAND.shadow}">${pic(im)}
      ${front && o.label ? `<div style="position:absolute;left:20px;top:20px;padding:8px 20px;border-radius:22px;font:800 34px ${BRAND.font};background:${BRAND.accent};color:#fff;opacity:${fade(t, o.landAt - .2)}">${o.label}</div>` : ''}</div>
      ${front && t >= o.landAt ? `<div style="position:absolute;right:-34px;top:-34px;${slam(t, o.landAt, { z: 500, rx: 30, y: 0, d: .35 })}">${tick(96)}</div>` : ''}</div>`; }).join('');
  return camH(t, o.start, `<div style="position:absolute;inset:0;${e3(t, o.start, .55, { rx: 30, y: -40, z: -1100, org: '50% 50%' })}"><div style="position:absolute;inset:0;perspective:1700px;perspective-origin:540px 520px;transform-style:preserve-3d">${cards}</div></div>`, { rx0: -14, ry0: -18 });
}
