// lib.js: shared by render.js, storyboard.js and check-frames.js.
// A reel project is a folder with reel.config.json in it. See example/reel.config.json.
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');

function loadProject(dir) {
  const d = path.resolve(dir || '.'), f = path.join(d, 'reel.config.json');
  if (!fs.existsSync(f)) { console.error(`No reel.config.json in ${d}`); process.exit(2); }
  const c = JSON.parse(fs.readFileSync(f, 'utf8')), r = k => (c[k] ? path.resolve(d, c[k]) : null);
  return { dir: d, cfg: c, page: r('page'), raw: r('raw'), segs: r('segs'), audio: r('audio'), words: r('words'), frames: r('frames'),
    out: r('out') || path.join(d, 'out/reel.mp4'), fps: c.fps || 60, workers: c.workers || 4 };
}

// Puppeteer drives a real Chrome. npm install in the kit folder gets it, or point PUPPETEER_PATH at an existing install.
function puppeteer() {
  try { return require(process.env.PUPPETEER_PATH || 'puppeteer'); }
  catch (e) { console.error('Puppeteer not found. Run "npm install" in the kit folder, or set PUPPETEER_PATH to a puppeteer folder.'); process.exit(2); }
}
const launch = () => puppeteer().launch({ headless: true, args: ['--allow-file-access-from-files', '--disable-web-security', '--font-render-hinting=none', '--force-color-profile=srgb', '--use-mock-keychain', '--no-first-run'] })
  .catch(e => { if (/Could not find|Browser was not found/i.test(e.message)) console.error('Chrome for Puppeteer is missing. Run: npx puppeteer browsers install chrome'); throw e; });

// Open the reel page, draw frame 0, then wait for the brand fonts. document.fonts.ready alone is not enough:
// it can resolve before anything has asked for the font, and frame 0 would render in a fallback font.
async function openReel(browser, P, { allowFallback = false } = {}) {
  const pg = await browser.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await pg.goto('file://' + P.page, { waitUntil: 'load' });
  if (errs.length) throw new Error('page error: ' + errs.join(' | '));
  const fonts = await pg.evaluate(async () => {
    seek(0);
    await Promise.all(BRAND.fontChecks.map(f => document.fonts.load(f).catch(() => [])));
    await document.fonts.ready;
    return BRAND.fontChecks.map(f => { const fam = (f.match(/'([^']+)'/) || [])[1];
      return { f, ok: [...document.fonts].some(x => x.family.replace(/["']/g, '') === fam && x.status === 'loaded') }; });
  });
  const bad = fonts.filter(x => !x.ok);
  if (bad.length) {
    const msg = `font not loaded: ${bad.map(x => x.f).join(', ')} (no network, or a wrong name in brand.js)`;
    if (!allowFallback) throw new Error(msg + '. Pass --allow-fallback to render anyway.');
    console.warn('WARN ' + msg);
  }
  return { pg, errs };
}

async function seekAndWait(pg, t) {
  await pg.evaluate(async t => {
    seek(t);
    await Promise.all([...document.images].filter(i => i.getAttribute('src')).map(i => (i.complete && i.naturalWidth) ? 0 : i.decode().catch(() => 0)));
  }, t);
}

// Face frames come from the RAW take at 30fps: frame k = raw time k/30. Two crops per frame:
// split = the face card (1000x640, a little taller than the card so the head pop-out has room), portrait = full frame.
// The crops are per recording. Set them in reel.config.json as ffmpeg crop values w:h:x:y.
function extractFrames(P) {
  if (!P.raw || !P.frames) return false;
  if (!fs.existsSync(P.raw)) { console.error(`raw take not found: ${P.raw}`); process.exit(2); }
  const stamp = JSON.stringify({ raw: P.raw, m: fs.statSync(P.raw).mtimeMs, s: P.cfg.splitCrop, p: P.cfg.portraitCrop });
  const done = path.join(P.frames, '.done');
  if (fs.existsSync(done) && fs.readFileSync(done, 'utf8') === stamp) return false;
  for (const s of ['split', 'portrait']) { fs.rmSync(path.join(P.frames, s), { recursive: true, force: true }); fs.mkdirSync(path.join(P.frames, s), { recursive: true }); }
  const sc = P.cfg.splitCrop || 'iw:iw*0.64:0:(ih-iw*0.64)/3', pc = P.cfg.portraitCrop || 'ih*9/16:ih:(iw-ih*9/16)/2:0';
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', P.raw, '-filter_complex',
    `[0:v]fps=30,split=2[a][b];[a]crop=${sc},scale=1000:640[s];[b]crop=${pc},scale=1080:1920[p]`,
    '-map', '[s]', '-q:v', '3', '-start_number', '0', path.join(P.frames, 'split/%05d.jpg'),
    '-map', '[p]', '-q:v', '3', '-start_number', '0', path.join(P.frames, 'portrait/%05d.jpg')], { stdio: 'inherit' });
  if (r.status) { console.error('ffmpeg could not cut the face frames'); process.exit(1); }
  fs.writeFileSync(done, stamp);
  console.log(`face frames: ${fs.readdirSync(path.join(P.frames, 'split')).length} from ${path.basename(P.raw)}`);
  return true;
}

module.exports = { loadProject, puppeteer, launch, openReel, seekAndWait, extractFrames };
