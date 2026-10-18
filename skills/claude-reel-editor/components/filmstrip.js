// FILMSTRIP + SCANNER: the reel's own frames step under an accent scanner in 3D, each one ticked as it passes.
// On the stop word the frame under the scanner lifts out toward the camera. Good for "it checks every frame".
// Pass different frames: never show the same example twice in one reel.
//
// filmstripScan(t, {
//   frames: ['f00.jpg', ... 16 images],   9:16 frames
//   start: 3.0,                            beat start
//   stopAt: 5.0,                           the scanner stops and the centre frame lifts (the payoff word)
//   top: 210                               optional, y of the strip
// })
function filmstripScan(t, o) {
  const FR = o.frames, stopI = Math.min(8, FR.length - 1), a = o.start + .03, IV = (o.stopAt - a) / stopI;
  const raw = Math.max(0, Math.min(t, o.stopAt) - a) / IV, st = Math.min(stopI, Math.floor(raw) + eo(Math.min(1, (raw % 1) * 1.6))), off = st * 236, stop = land(t, o.stopAt, .45);
  const frames = FR.map((src, i) => { const d = Math.abs(i - st), lift = Math.max(0, 1 - d * 1.6) + (i === stopI ? stop * 1.4 : 0), done = i < st - .45;
    return `<div style="position:relative;width:220px;height:390px;flex:none;transform:translateZ(${f2(lift * 110)}px) translateY(${f2(-lift * 18)}px)"><div style="width:220px;height:390px;border-radius:20px;overflow:hidden;${BRAND.card};opacity:${d < .5 || (i === stopI && t >= o.stopAt) ? 1 : .55}">${pic(src)}</div>${done ? `<div style="position:absolute;right:-14px;top:-14px">${tick(50)}</div>` : ''}</div>`; }).join('');
  const scan = `<div style="position:absolute;left:${540 - 126}px;top:${f2(52 - stop * 20)}px;width:252px;height:${f2(426 + stop * 40)}px;border-radius:28px;border:7px solid ${BRAND.accent};box-shadow:0 0 0 10px color-mix(in srgb,${BRAND.accent} 12%,transparent);${slam(t, o.start + .15, { z: 600, rx: 0, y: 0, d: .35 })}"></div>`;
  const tilt = eo(P(t, o.start, 2.5));
  return `<div style="${slam(t, o.start, { rx: -40, ry: 50 })}"><div style="position:absolute;left:0;top:${o.top ?? 210}px;width:1080px;height:600px;perspective:1600px;perspective-origin:540px 260px"><div style="position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(${f2(16 - 8 * tilt)}deg) rotateY(${f2(-18 + 10 * tilt)}deg)"><div style="position:absolute;left:${f2(430 - off)}px;top:70px;display:flex;gap:16px;transform-style:preserve-3d">${frames}</div>${scan}</div></div></div>${ring(540, (o.top ?? 210) + 260, t, o.stopAt, BRAND.accent, 150, .5)}`;
}

// CUT STRIP: the raw take as a big 3D filmstrip with grey pauses between the clips. A playhead sweeps and every pause
// snaps shut, then a graphic card rises out of each clip, one per word, and the row locks in an accent box with a tick.
//
// cutStrip(t, {
//   clips: ['c1.jpg', ... up to 6],   stills from the raw take
//   graphics: ['g1.jpg', ...],        one graphic per clip (same count)
//   start: 3.0, cutAt: 3.3,           the playhead starts on "cut"
//   riseAt: 4.4,                      the graphics rise from here, one every 0.2s
//   lockAt: 6.0                       the accent box locks round the row
// })
function cutStrip(t, o) {
  const PX = 74, F = o.clips, G = o.graphics, cw = 136, gap0 = 34, head = P(t, o.cutAt, 1.0), x0 = PX + 18, sy = 400 + 240 * eo(P(t, o.riseAt - .05, .45));
  let x = x0;
  const clips = F.map((f, i) => { const shut = i === 0 ? 1 : eo(P(t, o.cutAt + i * .17, .12)), gap = i === 0 ? 0 : gap0 * (1 - shut) + 6; x += gap;
    const cx = x; x += cw; const rise = eo(P(t, o.riseAt + i * .16, .3));
    const pause = i === 0 ? '' : `<div style="position:absolute;left:${f2(cx - gap)}px;top:${f2(sy)}px;width:${f2(gap)}px;height:230px;border-radius:10px;background:#D8DCE3;opacity:${f2(1 - shut)}"></div>`;
    return `${pause}<div style="position:absolute;left:${f2(cx)}px;top:${f2(sy)}px;width:${cw}px;height:230px;border-radius:14px;overflow:hidden;box-shadow:0 14px 30px -12px rgba(0,19,47,.4)">${pic(f)}</div>
      <div style="position:absolute;left:${f2(cx)}px;top:206px;width:${cw}px;height:280px;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 24px 40px -18px rgba(0,19,47,.45),0 2px 6px rgba(0,19,47,.1);transform-origin:50% 100%;transform:perspective(900px) translateY(${f2((1 - rise) * 330)}px) rotateX(${f2((1 - rise) * -70)}deg) scale(${f2(.6 + .4 * rise)});opacity:${f2(rise)}">${pic(G[i], 'object-position:50% 0')}</div>`; }).join('');
  const ph = t >= o.cutAt && t < o.cutAt + 1.17 ? `<div style="position:absolute;left:${f2(x0 + head * (x - x0))}px;top:${f2(sy - 22)}px;width:8px;height:274px;border-radius:4px;background:${BRAND.accent}"></div>` : '';
  const lock = t >= o.lockAt ? `<div style="position:absolute;left:${PX + 4}px;top:186px;width:${f2(x - x0 + 28)}px;height:700px;border-radius:30px;border:10px solid ${BRAND.accent};transform:scale(${f2(1.12 - .12 * P(t, o.lockAt, .12))})"></div><div style="position:absolute;left:${f2(x - 30)}px;top:156px">${tick(64)}</div>` : '';
  const big = 1.45 - .45 * eo(P(t, o.riseAt - .05, .45));   // the strip fills the panel width until the graphics rise
  return camH(t, o.start, `<div style="position:absolute;inset:0;${e3(t, o.start, .5, { rx: 40, y: 140 })}"><div style="position:absolute;inset:0;transform-origin:540px ${f2(sy + 115)}px;transform:scale(${f2(big)})">${clips}${ph}</div>${lock}</div>`, { rx0: -26, ry0: 22 });
}
