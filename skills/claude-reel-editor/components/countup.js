// COUNT-UP STAT: a big stat card slams in from deep on its word and the number counts up with its label under it.
// Chain two for "29 reels from 13 creators": the first one fades as the second lands.
//
// countUp(t, {
//   n: 29, label: 'viral reels',   the number and what it counts
//   at: 3.1,                       the spoken number (use word('29'))
//   d: .7,                         how long the count takes
//   outAt: 4.5,                    optional, the card fades out here
//   x: 310, y: 330, w: 380         position and width
// })
function countUp(t, o) {
  if (t < o.at || (o.outAt && t > o.outAt + .2)) return '';
  const n = Math.round(o.n * eo(P(t, o.at, o.d ?? .7))), out = o.outAt ? 1 - P(t, o.outAt, .2) : 1;
  return stat(n, o.label, `left:${o.x ?? 310}px;top:${o.y ?? 330}px;width:${o.w ?? 380}px;${slam(t, o.at, { z: 500, rx: 30, y: 0, d: .4 })};opacity:${f2(out)}`);
}
