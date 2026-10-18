// brand.js: every colour, font and finish the reel uses lives here and nowhere else.
// Change these values to make the reel yours. Nothing else in engine/ or components/ hard-codes a brand value.
window.BRAND = {
  // The one accent colour. Everything that "happens" on screen uses it: the lit step, the tick, the progress ring.
  // EDIT ME. Pick one strong colour and keep it for every reel so your feed reads as one brand.
  accent: '#0071E3',
  accentLight: '#3D95F0',   // top of the accent gradient on balls, ticks and lit steps
  accentDark: '#0053AE',    // the shaded side of a lit 3D step

  bg: '#FFFFFF',            // the canvas
  ink: '#1D1D1F',           // main text
  mute: '#86868B',          // secondary text, the thing being acted on
  line: '#E5E5EA',          // empty tracks, unlit cells
  soft: '#EEF1F6',          // unlit 3D faces, empty ring track
  good: '#34C759',          // "pass" text, a green tool dot
  rec: '#FF3B30',           // the red record dot

  // Background grid behind everything. Set gridOpacity to 0 for a plain canvas.
  gridOpacity: 0.05,
  gridSize: 54,

  // The card finish: white, a 1px hairline and two soft shadows. Every card, window and tile uses it.
  card: 'background:#fff;border:1px solid rgba(0,0,0,.07);box-shadow:0 1px 2px rgba(0,0,0,.04),0 12px 40px rgba(0,0,0,.08)',
  shadow: '0 44px 80px -26px rgba(0,19,47,.5),0 3px 10px rgba(0,19,47,.12)',   // under big objects (phones, reel cards)

  // Fonts. Inter and JetBrains Mono are free (SIL Open Font License) and load from Google Fonts.
  // To use your own font, change the family names and the URL. Keep a fallback after the name.
  font: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
  fontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=block',
  // The render waits for these before the first frame, so frame 0 never shows a fallback font.
  fontChecks: ["800 100px 'Inter'", "600 40px 'Inter'", "600 40px 'JetBrains Mono'"],

  // Captions: one line, centred, on the seam between the graphic and the face card.
  caption: { size: 52, weight: 650, y: 930, faceY: 1380 },
};
