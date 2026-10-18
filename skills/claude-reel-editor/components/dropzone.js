// DROP ZONE: a big code window with a dashed drop area. On the word "drop" your raw clip flies in on an arc and lands
// with a small squash. Its waveform rises bar by bar, the bad sections lift out in grey, and the working files
// fly in from both sides, one per word, and file themselves under the waveform.
//
// dropZone(t, {
//   start: 4.0,                   beat start (the window tilts in)
//   dropAt: 4.3,                  the clip lands
//   clip: 'assets/raw.jpg',       a 16:9 still of the raw take
//   clipLabel: 'raw.mp4 · 2:44',  optional
//   waveAt: 4.7,                  the waveform rises
//   badAt: 5.4,                   the grey bad sections lift out
//   files: [{ name: 'cut-audio.wav', icon: 'wave', at: 4.8 }, { name: 'words.json', icon: 'doc', at: 5.1 }],
//   title: 'assistant  ~/my-reel' optional window title
// })
function dropZone(t, o) {
  const PX = 74, PW = 932, TOP = 220, N = 34, BAD = o.bad || [5, 6, 7, 15, 16, 24, 25, 26];
  const g = P(t, o.dropAt, .4), k = 1 - g, squash = g >= 1 ? 1 - .05 * Math.sin(Math.PI * Math.min(1, (t - o.dropAt - .4) / .18)) : 1;
  const bars = Array.from({ length: N }, (_, i) => { const bad = BAD.includes(i), h = 36 + Math.abs(Math.sin(i * 1.9 + 1)) * 104, up = eo(P(t, o.waveAt + i * .012, .22)), lift = bad ? P(t, o.badAt + (i % 3) * .05, .35) : 0;
    return `<i style="display:inline-block;width:18px;margin:0 3px;height:${f2(h * up)}px;border-radius:9px;vertical-align:middle;background:${bad ? '#C7CBD3' : BRAND.accent};transform:translateY(${f2(-lift * lift * 240)}px) rotate(${f2(lift * (i % 2 ? 24 : -24))}deg);opacity:${f2(1 - lift)}"></i>`; }).join('');
  const clip = `<div style="position:absolute;left:${PX + 186}px;top:${TOP + 70}px;width:560px;height:316px;transform:translate(${f2(k * k * 560)}px,${f2(-k * (2 - k) * 420)}px) rotate(${f2(k * 14)}deg) scaleY(${squash.toFixed(3)});transform-origin:50% 100%;opacity:${f2(cl((t - o.dropAt + .08) / .08))}">
    <div style="width:100%;height:100%;border-radius:24px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.06),0 24px 50px rgba(0,0,0,.16);position:relative">${pic(o.clip)}
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><div style="width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="50" height="50" fill="${BRAND.ink}"><path d="M8 5v14l11-7z"/></svg></div></div>
      ${o.clipLabel ? `<div style="position:absolute;left:18px;bottom:16px;padding:8px 16px;border-radius:12px;background:rgba(0,0,0,.6);color:#fff;font:600 28px ${BRAND.mono};opacity:${fade(t, o.dropAt + .4)}">${o.clipLabel}</div>` : ''}</div></div>`;
  const files = (o.files || []).map((f, i) => { const s = i % 2 ? 1 : -1, u = eo(P(t, f.at, .42)), q = 1 - u; if (t < f.at) return '';
    return `<div style="position:absolute;left:${f2(PX + 90 + i * 400 + s * q * 520)}px;top:${f2(TOP + 590 - q * 300)}px;display:flex;align-items:center;gap:14px;padding:12px 22px 12px 12px;border-radius:20px;${BRAND.card};transform:rotate(${f2(q * s * 18)}deg) scale(${f2(1 + q * .2)});opacity:${f2(Math.min(1, u * 3))}">${tileSym(f.icon || 'doc', 52)}<span style="font:600 30px ${BRAND.mono};white-space:nowrap">${f.name}</span></div>`; }).join('');
  const win = `<div style="position:absolute;inset:0;${e3(t, o.start, .55, { rx: 46, y: 120 })}">${code.win(PX, TOP, PW, 660, '', '', o.title)}
    <div style="position:absolute;left:${PX + 30}px;top:${TOP + 76}px;width:${PW - 60}px;height:560px;border-radius:24px;border:4px dashed color-mix(in srgb,${BRAND.accent} ${f2(40 * (1 - eo(P(t, o.dropAt + .27, .3))))}%,transparent)"></div>
    <div style="position:absolute;left:${PX}px;width:${PW}px;top:${TOP + 470}px;text-align:center;white-space:nowrap">${bars}</div></div>`;
  return camH(t, o.start, win + clip + files, { rx0: -30, ry0: -18 });
}
