// CODE WINDOW DEMO: a real-looking AI coding window. The prompt types as you say it, sends, then the tool lines
// appear one per word and a file lifts out of the window on the payoff word.
// Type the REAL command or prompt you used. A made-up command is the first thing a viewer will try and fail.
//
// codeDemo(t, {
//   start: 2.0,                         the window tilts in
//   prompt: '/init',                    what you type
//   typeFrom: 2.3, typeTo: 2.8,         it types between these two times (your words)
//   sendAt: 3.0,                        it sends
//   lines: [{ at: 3.2, tool: 'Read', arg: '2 files' }, { at: 3.6, tool: 'Write', arg: 'NOTES.md', res: 'Wrote 24 lines', resAt: 3.9 }],
//   fileAt: 3.9, fileIcon: 'doc',       optional, a file tile lifts out of the window
//   title: 'assistant  ~/my-reel',
//   L: 74, T: 330, W: 932, H: 540
// })
function codeDemo(t, o) {
  const L = o.L ?? 74, T = o.T ?? 330, W = o.W ?? 932, H = o.H ?? 540, sent = t >= o.sendAt;
  const lines = sent ? code.user(o.prompt, `opacity:${fade(t, o.sendAt, .1)}`) + (o.lines || []).filter(x => t >= x.at)
    .map(x => code.tool(x.tool, x.arg, x.res && t >= (x.resAt ?? x.at) ? x.res : '', `opacity:${fade(t, x.at, .1)}`)).join('') : '';
  const body = lines + `<div style="position:absolute;left:30px;right:30px;bottom:26px">${code.input(sent ? '' : typed(o.prompt, t, o.typeFrom, o.typeTo), true)}</div>`;
  const win = code.win(L, T, W, H, body, e3(t, o.start, .6, { rx: 30, y: -24 }), o.title);
  const k = o.fileAt ? land(t, o.fileAt, .5) : 0;
  const file = o.fileAt && t >= o.fileAt ? `<div style="position:absolute;left:${L + W - 230}px;top:${f2(T + 100 - k * 150)}px;transform:rotate(${f2(8 * k)}deg);opacity:${fade(t, o.fileAt, .1)}">${tileSym(o.fileIcon || 'doc', 150)}</div>` + ring(L + W - 155, T + 25, t, o.fileAt + .16, BRAND.accent, 60, 1.0) : '';
  return cam(t, o.start, win + file);
}
