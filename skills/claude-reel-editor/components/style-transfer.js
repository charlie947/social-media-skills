// STYLE TRANSFER CHIPS: your reference style slams in big on the left, the flat version slams in grey on the right.
// On "same look" its colour, its type and its card style fly across as three chips, one per word, and the right
// card turns to full colour. On the last word both cards turn to face the camera.
//
// styleTransfer(t, {
//   from: 'assets/style.jpg',   the look you are matching (portrait, about 4:5)
//   to: 'assets/flat.jpg',      the flat frame that takes the look (9:16)
//   fromAt: 2.0, toAt: 2.6,     the two cards slam in
//   chips: [3.0, 3.2, 3.4],     the three chips fly across, one per word
//   faceAt: 4.0,                both cards face the camera (the payoff word)
//   start: 1.9                  beat start
// })
function styleTransfer(t, o) {
  const face = eo(P(t, o.faceAt, .5)), C = o.chips, from = [344, 470], to = [810, 470];
  const col = C.reduce((a, c) => a + eo(P(t, c + .35, .2)), 0) / C.length;
  const chip = [`<div style="width:84px;height:84px;border-radius:50%;background:linear-gradient(180deg,${BRAND.accentLight},${BRAND.accent})"></div>`,
    `<div style="width:96px;height:96px;border-radius:24px;${BRAND.card};display:flex;align-items:center;justify-content:center;font:800 46px ${BRAND.font};letter-spacing:-.03em">Aa</div>`,
    `<div style="width:120px;height:84px;border-radius:20px;${BRAND.card};padding:18px"><div style="height:12px;width:70%;border-radius:6px;background:${BRAND.accent}"></div><div style="height:12px;width:45%;margin-top:12px;border-radius:6px;background:#C7CBD3"></div></div>`];
  const chips = C.map((c, i) => { const u = eo(P(t, c, .35)); if (t < c || u >= 1) return '';
    const x = from[0] + (to[0] - from[0]) * u, y = from[1] + (to[1] - from[1]) * u - Math.sin(Math.PI * u) * 230 + (i - 1) * 90;
    return `<div style="position:absolute;left:${f2(x)}px;top:${f2(y)}px;transform:translate(-50%,-50%) scale(${f2(1.15 - .35 * u)}) rotate(${f2((1 - u) * (i - 1) * 20)}deg)">${chip[i % 3]}</div>`; }).join('');
  const left = `<div style="position:absolute;left:84px;top:196px;width:520px;height:650px;${slam(t, o.fromAt, { ry: -60, rx: -30, z: -1500, d: .5 })}"><div style="width:100%;height:100%;border-radius:26px;overflow:hidden;box-shadow:${BRAND.shadow};transform:rotateY(${f2(16 * (1 - face))}deg) translateZ(${f2(face * 40)}px)">${pic(o.from, 'object-position:50% 0')}</div></div>`;
  const right = `<div style="position:absolute;left:644px;top:212px;width:340px;height:604px;${slam(t, o.toAt, { ry: 60, rx: -30, z: -1500, d: .5 })}"><div style="width:100%;height:100%;border-radius:26px;overflow:hidden;box-shadow:${BRAND.shadow},0 0 0 ${f2(6 * eo(P(t, C[C.length - 1] + .35, .2)) * (1 - face))}px ${BRAND.accent};transform:rotateY(${f2(-16 * (1 - face))}deg) translateZ(${f2(face * 40)}px);filter:grayscale(${f2(1 - col)}) contrast(${f2(.85 + .15 * col)})">${pic(o.to)}</div></div>`;
  return camH(t, o.start, `<div style="position:absolute;inset:0;perspective:1800px;perspective-origin:540px 520px">${left}${right}</div>${chips}` + C.map(c => ring(814, 514, t, c + .35, BRAND.accent, 60, 1.2)).join(''), { rx0: -16, ry0: 20 });
}
