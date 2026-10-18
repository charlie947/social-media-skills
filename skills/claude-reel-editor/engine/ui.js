// ui.js: the building blocks a beat is made of. Cards, tiles, ticks, icons, phones and a code window.
// Image paths are passed in whole (relative to the reel page), so nothing here points at anyone's assets.

// line icons, 24x24, stroke only. Add your own: SYM.name = '<path d="..."/>'
const SYM = {
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  pen: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>',
  zap: '<path d="M13 2 4 14h8l-1 8 9-12h-8l1-8z"/>',
  layers: '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  box: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
  term: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7 9l3 3-3 3M12.5 15H17"/>',
  wave: '<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  spark: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
};

// a card with the brand finish at a fixed position
const box = (L, T, W, H, inner, st = '', r = 40) => `<div style="position:absolute;left:${L}px;top:${T}px;width:${W}px;height:${H}px;border-radius:${r}px;${BRAND.card};${st}">${inner}</div>`;
// an image that fills its parent
const pic = (src, st = '') => `<img src="${src}" style="width:100%;height:100%;object-fit:cover;display:block;${st}">`;
// an app-style tile holding an image (a logo or icon you supply)
const tileImg = (src, s, st = '') => `<div style="width:${s}px;height:${s}px;border-radius:${f2(s * .24)}px;${BRAND.card};display:flex;align-items:center;justify-content:center;flex:none;${st}"><img src="${src}" style="width:${f2(s * .6)}px;height:${f2(s * .6)}px;object-fit:contain"></div>`;
// a glossy 3D tile with a line icon from SYM, in any colour
const tileSym = (sy, s, c = BRAND.accent, st = '') => `<div style="width:${s}px;height:${s}px;border-radius:${f2(s * .24)}px;flex:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,color-mix(in srgb,${c} 72%,#fff),${c});box-shadow:inset 0 2px 0 rgba(255,255,255,.45),inset 0 -4px 0 rgba(0,0,0,.12),0 14px 30px color-mix(in srgb,${c} 35%,transparent);${st}"><svg viewBox="0 0 24 24" width="${f2(s * .54)}" height="${f2(s * .54)}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SYM[sy] || SYM.spark}</svg></div>`;
// the accent tick, glossy and round
const tick = (s, st = '') => `<div style="width:${s}px;height:${s}px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,${BRAND.accentLight},${BRAND.accent});box-shadow:inset 0 2px 0 rgba(255,255,255,.45),inset 0 -3px 0 rgba(0,0,0,.12),0 8px 18px color-mix(in srgb,${BRAND.accent} 35%,transparent);${st}"><svg viewBox="0 0 24 24" width="${f2(s * .58)}" height="${f2(s * .58)}" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>`;
// a phone with a 9:16 screen. inner = the screen content
const phone = (L, T, w, inner, st = '') => `<div style="position:absolute;left:${L}px;top:${T}px;width:${w}px;height:${f2(w * 16 / 9)}px;border-radius:${f2(w * .13)}px;padding:${f2(w * .035)}px;background:${BRAND.ink};box-shadow:0 30px 60px -20px rgba(0,19,47,.45);${st}"><div style="width:100%;height:100%;border-radius:${f2(w * .1)}px;overflow:hidden;background:#fff;position:relative">${inner}</div></div>`;
// a big number with a label under it
const stat = (n, label, st = '') => `<div style="position:absolute;${st};padding:20px 44px 22px;border-radius:32px;${BRAND.card};text-align:center"><div style="font:800 128px/1 ${BRAND.font};letter-spacing:-.045em;color:${BRAND.accent};font-variant-numeric:tabular-nums">${n}</div><div style="margin-top:8px;font:600 32px ${BRAND.font};color:${BRAND.mute};white-space:nowrap">${label}</div></div>`;

// CODE WINDOW: a light terminal-style chat window, drawn the way a real AI coding app looks.
// When you demo a tool on screen, type the REAL command you used, never a made-up one.
// code.win(L, T, W, H, inner, st, title) draws the window. The rest are the lines that go inside it.
const code = {
  icon: (s) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="${BRAND.accent}" stroke-width="2.4" stroke-linecap="round" style="vertical-align:-${f2(s * .14)}px">${SYM.spark}</svg>`,
  win: (L, T, W, H, inner, st = '', title = 'assistant  ~/my-reel') => box(L, T, W, H, `<div style="height:62px;display:flex;align-items:center;gap:12px;padding:0 26px;border-bottom:1.5px solid rgba(0,19,47,.07)">${'<i style="width:16px;height:16px;border-radius:50%;background:#E3E6EC"></i>'.repeat(3)}<span style="margin-left:12px;font:600 25px ${BRAND.mono};color:${BRAND.mute};white-space:nowrap">${title}</span></div><div style="padding:24px 30px;font:500 34px/1.5 ${BRAND.mono};color:${BRAND.ink}">${inner}</div>`, st, 30),
  input: (txt, cur, hint = '? for shortcuts', hc = BRAND.mute) => `<div style="border:2.5px solid #C7CBD3;border-radius:14px;padding:14px 20px;font:500 36px ${BRAND.mono};white-space:nowrap;overflow:hidden"><span style="color:${BRAND.mute}">&gt;&nbsp;</span>${txt}${cur ? `<i style="display:inline-block;width:16px;height:34px;background:${BRAND.ink};vertical-align:-6px;margin-left:2px"></i>` : ''}</div><div style="padding:8px 4px 0;font:500 27px ${BRAND.mono};color:${hc};white-space:nowrap">${hint}</div>`,
  user: (txt, st = '') => `<div style="background:#F2F3F6;border-radius:10px;padding:8px 16px;margin:0 0 14px;white-space:nowrap;${st}"><span style="color:${BRAND.mute}">&gt;&nbsp;</span>${txt}</div>`,
  tool: (nm, arg, res, st = '', dot = BRAND.good) => `<div style="margin:0 0 10px;white-space:nowrap;${st}"><span style="color:${dot}">●</span> <b style="font-weight:700">${nm}</b>(${arg})${res ? `<div style="color:${BRAND.mute};padding-left:30px">⎿&nbsp; ${res}</div>` : ''}</div>`,
  say: (txt, st = '') => `<div style="margin:0 0 10px;white-space:nowrap;${st}">● ${txt}</div>`,
  think: (t, st = '') => `<div style="margin:0 0 10px;color:${BRAND.mute};white-space:nowrap;${st}"><span style="display:inline-block;transform:rotate(${f2((t * 160) % 360)}deg)">${code.icon(30)}</span>&nbsp; Thinking…</div>`,
};
