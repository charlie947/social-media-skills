// The example reel: five beats, about 13 seconds. Every time comes from word(), so every hit lands on its spoken word.
// It shows each rule once: the hook is the animation, one big 3D object per line, the payoff on its word,
// an object carried across a cut, a zoom-through between two graphic beats, and a hard cut to the face.
const STEPS = ['Cut', 'Storyboard', 'Build', 'Check'];
const STEP_TIMES = () => [word('Cut'), word('storyboard'), word('build'), word('check')];
const RAWF = [30, 150, 210, 300, 380, 450, 500, 540, 570].map(k => `frames/split/${String(k).padStart(5, '0')}.jpg`);   // stills of the raw take for the hook's video track
const VERSIONS = ['v1', 'v2', 'v3', 'v4', 'v5'].map(v => `../assets/${v}.svg`);

const REEL = {
  title: 'Example reel',
  frames: 'frames',              // face frames, cut from raw.mp4 by the render (folder relative to this page)
  audio: '../cut-audio.wav',     // the player plays this
  spell: { four: '4', Five: '5' },   // captions write spoken numbers as digits
  beats: [
    // 0 HOOK. The hook text is the animation: the title cascades in while an edit timeline scrolls below it,
    // and the playhead slices every track on "Edit", "reel" and "code".
    { a: 0, b: 1.85, lay: 'split', still: 1.6,
      move: 'HOOK: "Edit your reel / with code" cascades in over a tilted 3D edit timeline. The playhead slices every track on "Edit", "reel" and "code"',
      draw: (t) => timelineHook(t, { lines: ['Edit your reel', 'with code'], cuts: [word('Edit'), word('reel'), word('code')], frames: RAWF, icon: '../assets/mark.svg', size: 112 }) },

    // 1 A staircase for "four steps". The ball lands on a step per word and tops out ON "check".
    // carry: it hands the staircase to the next beat instead of zooming through.
    { a: 1.85, b: 5.45, lay: 'split', still: 5.3, carry: true, hits: [word('check')],
      move: 'Four 3D steps rise on "four steps". The ball climbs one step per word: Cut, storyboard, build, and tops out on "check"',
      draw: (t) => staircase(t, { steps: STEPS, times: STEP_TIMES(), start: 1.85, title: `It takes<br><span style="color:${BRAND.accent}">4 steps</span>` }) },

    // 2 The staircase swings away into depth while the version carousel rises in front of it. Each word turns it a card,
    // it spins on "a new", and v5 lifts and ticks on "version".
    { a: 5.45, b: 7.65, lay: 'split', still: 7.45,
      move: 'The staircase carries over and swings away into depth as a 3D carousel of versions rises. One turn per word, a fast spin on "a new", v5 lifts and ticks on "version"',
      draw: (t) => {
        const out = P(t, 5.45, .55), oe = out * out;
        const stair = out < 1 ? `<div style="position:absolute;inset:0;perspective:1800px;perspective-origin:540px 520px"><div style="position:absolute;inset:0;transform-origin:540px 600px;transform:translateZ(${f2(-oe * 1500)}px) rotateY(${f2(-18 - 26 * eo(out))}deg) rotateX(${f2(oe * 35)}deg);opacity:${f2(1 - out)};filter:grayscale(${f2(out)})">${staircase(5.44, { steps: STEPS, times: STEP_TIMES(), start: 1.85, id: 'carry' })}</div></div>` : '';
        return stair + carousel(t, { images: VERSIONS, start: 5.6, turns: [word('every'), word('note'), word('makes')], spinAt: word('a'), landAt: word('version'), label: 'v5' });
      } },

    // 3 A hard cut to the face, full frame, for a break. The caption moves to the chest.
    { a: 7.65, b: 9.35, lay: 'face', still: 8.4, move: 'Hard cut to the face, full frame. Caption on the chest', draw: () => '' },

    // 4 FULL graphic: the giant dial on top, the frame check in the lower box. The ring closes on "checked".
    { a: 9.35, b: 13.37, lay: 'full', still: 13.2,
      move: 'FULL: a giant dial. The accent arc sweeps 5 min on "Five minutes", the grey arc races round on "another", shatters on "hour". Below, the frame check counts and closes on "checked"',
      draw: (t) => dial(t, { start: 9.35, fastAt: word('five'), mins: 5, recAt: word('minutes'), slowAt: word('another'), breakAt: word('hour'), tickAt: wordEnd('hour') })
        + progressRing(t, { start: 9.6, dur: word('checked') - 9.6, total: Math.round(CUT.dur * 4), unit: 'frames', doneAt: word('checked'), doneText: 'NO FLAGS', cmd: 'node scripts/check-frames.js' }) },
  ],
};
