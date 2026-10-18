// TIMELINE HOOK: the text hook IS the opening animation, never a flat title card on top of the video.
// The title cascades in letter by letter while a tilted 3D edit timeline (video clips, graphic clips, a waveform)
// scrolls sideways below it, and an accent playhead slices every track on the words you name.
//
// timelineHook(t, {
//   lines: ['Edit your reel', 'with code'],   the hook, two short lines. The second is in the accent colour
//   cuts: [0.6, 1.1, 1.6],                    the playhead slices on these words
//   frames: ['f1.jpg', ... 9 images],         stills for the video track (frames of your raw take)
//   icon: 'assets/mark.svg',                  optional, a mark that lands on the title
//   size: 118                                 title px. Keep it 92 or more so it reads on a phone
// })
function timelineHook(t, o) {
  const TL = { top: 500, rowH: 104, gap: 16, speed: 150, ph: 540 }, CUTS = o.cuts || [];
  const drift = -t * TL.speed - 120;
  // a cut made at time c sits at content x = playhead - drift(c). Everything right of it opens by 26px
  const cutsX = CUTS.map(c => TL.ph - (-c * TL.speed - 120));
  const shift = x => CUTS.reduce((s, c, i) => s + (x > cutsX[i] ? 26 * eo(P(t, c, .16)) : 0), 0);
  const track = (row, items) => items.map(([x, w, st, inner]) => `<div style="position:absolute;left:${f2(x + drift + shift(x))}px;top:${TL.top + row * (TL.rowH + TL.gap)}px;width:${w}px;height:${TL.rowH}px;border-radius:16px;overflow:hidden;${st}">${inner}</div>`).join('');
  const lane = (n, w, f) => Array.from({ length: n }, (_, i) => f(i, i * (w + 10), w));
  const FR = o.frames || [];
  const video = lane(9, 200, (i, x, w) => [x, w, 'background:#D9DDE3;box-shadow:0 10px 24px -10px rgba(0,19,47,.4)', FR.length ? pic(FR[i % FR.length]) : '']);
  const gfx = lane(7, 260, (i, x, w) => [x + 60, w, `background:linear-gradient(180deg,${BRAND.accentLight},${BRAND.accent})`, `<div style="margin:30px 0 0 26px;width:${f2(w * .5)}px;height:16px;border-radius:8px;background:rgba(255,255,255,.85)"></div><div style="margin:14px 0 0 26px;width:${f2(w * .3)}px;height:16px;border-radius:8px;background:rgba(255,255,255,.55)"></div>`]);
  const audio = [[0, 2000, `background:${BRAND.soft};display:flex;align-items:center;gap:6px;padding:0 12px`, Array.from({ length: 150 }, (_, i) => `<i style="flex:none;width:7px;height:${f2(14 + Math.abs(Math.sin(i * .9)) * 80)}px;border-radius:4px;background:${BRAND.accent};opacity:.75"></i>`).join('')]];
  const rows = track(0, video) + track(1, gfx) + track(2, audio);
  // playhead fixed at the centre, the timeline runs under it. A flash on each cut
  const hit = CUTS.filter(c => t >= c).pop(), flash = hit === undefined ? 0 : 1 - P(t, hit, .22), H = 3 * (TL.rowH + TL.gap);
  const head = `<div style="position:absolute;left:${TL.ph - 4}px;top:${TL.top - 46}px;width:8px;height:${H + 50}px;border-radius:4px;background:${BRAND.accent};box-shadow:0 0 0 ${f2(4 + 14 * flash)}px color-mix(in srgb,${BRAND.accent} ${f2(15 + 35 * flash)}%,transparent)"></div>
    <div style="position:absolute;left:${TL.ph - 26}px;top:${TL.top - 70}px;width:52px;height:40px;border-radius:12px 12px 26px 26px;background:${BRAND.accent}"></div>`;
  const wall = `<div style="position:absolute;inset:0;perspective:1500px;perspective-origin:540px 560px"><div style="position:absolute;inset:0;transform-origin:540px 680px;transform:rotateX(24deg) rotateZ(-4deg) scale(1.06);opacity:${fade(t, 0, .2)}">${rows}${head}</div></div>`;
  const [l1, l2 = ''] = o.lines, sz = o.size || 118;
  const title = cam(t, 0, `<div style="position:absolute;left:${CL}px;top:240px;width:${CW}px;text-align:center;font:800 ${sz}px/1.02 ${BRAND.font};letter-spacing:-.04em">${cascade(l1, t, .05)}<br>${cascade(l2, t, .45, BRAND.accent)}</div>
    ${o.icon ? `<div style="position:absolute;left:${CL + CW - 150}px;top:${240 + sz * 2 + 10}px;${e3(t, 1.0, .6, { rx: -50, y: -40, z: 200 })}">${tileImg(o.icon, 120)}</div>` : ''}`, { rx0: -10, rx1: -3, ry0: -10, ry1: -2 });
  return `<div style="position:absolute;inset:0;${e3(t, .3, .7, { rx: 40, y: 60 })}">${wall}</div>` + title;
}
