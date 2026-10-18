// render.js: record the reel page frame by frame in headless Chrome, then join the frames with ffmpeg.
// usage: node scripts/render.js <project dir> [--workers 4] [--fps 60] [--from 0 --to 120] [--allow-fallback]
//
// 1 cuts the face frames from the raw take (lib.extractFrames), once per raw take and crop
// 2 renders frame n = seek(n / fps) in several Chrome workers at once. The page swaps in the face frame from the TRUE
//   raw time for that cut time (the cut list), so lip sync never drifts across a join
// 3 blends frame pairs 60 -> 30fps (a light motion blur) and encodes H.264, 1080x1920, limited range, bt709, with the cut audio
// The output has your voice only. Add music and set loudness with scripts/export.sh.
const fs = require('fs'), path = require('path'), { spawn, spawnSync } = require('child_process');
const { loadProject, launch, openReel, seekAndWait, extractFrames } = require('./lib');
const argv = process.argv.slice(2), flag = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
const P = loadProject(argv[0]);
const FPS = +flag('fps', P.fps), allowFallback = !!flag('allow-fallback', false);
const TMP = path.join(path.dirname(P.out), 'frames-' + path.basename(P.out, '.mp4'));

async function worker(a, b) {
  const br = await launch();
  try {
    const { pg, errs } = await openReel(br, P, { allowFallback });
    for (let n = a; n < b; n++) {
      await seekAndWait(pg, n / FPS);
      await pg.screenshot({ path: path.join(TMP, `f${String(n).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 94 });
    }
    if (errs.length) throw new Error('page error: ' + errs[0]);
  } finally { await br.close(); }
}

async function main() {
  if (!P.audio || !fs.existsSync(P.audio)) { console.error(`cut audio not found: ${P.audio}. Run scripts/cut/make-cut.py first.`); process.exit(2); }
  extractFrames(P);
  const dur = +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', P.audio], { encoding: 'utf8' }).stdout;
  const N = Math.floor(dur * FPS), from = +flag('from', 0), to = Math.min(N, +flag('to', N));
  const W = Math.max(1, Math.min(+flag('workers', P.workers), to - from)), step = Math.ceil((to - from) / W);
  fs.rmSync(TMP, { recursive: true, force: true }); fs.mkdirSync(TMP, { recursive: true });
  console.log(`rendering frames ${from}-${to} of ${N} (${dur.toFixed(2)}s at ${FPS}fps) in ${W} workers`);
  const t0 = Date.now();
  const jobs = Array.from({ length: W }, (_, i) => [from + i * step, Math.min(to, from + (i + 1) * step)]).filter(([a, b]) => b > a)
    .map(([a, b]) => new Promise(res => { const c = spawn(process.execPath, [__filename, argv[0], '--worker', a, b, ...(allowFallback ? ['--allow-fallback'] : []), '--fps', FPS], { stdio: 'inherit' }); c.on('exit', res); }));
  const codes = await Promise.all(jobs);
  const got = fs.readdirSync(TMP).filter(f => f.endsWith('.jpg')).length;
  console.log(`frames: ${got} of ${to - from} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  if (codes.some(c => c) || got !== to - from) { console.error('FAIL a worker died or frames are missing. Nothing encoded.'); process.exit(1); }
  if (from !== 0 || to !== N) { console.log(`partial render: frames kept in ${TMP}`); return; }
  fs.mkdirSync(path.dirname(P.out), { recursive: true });
  const vf = (FPS >= 50 ? 'tmix=frames=2,fps=30,' : '') + 'scale=1080:1920:in_range=full:out_range=limited,format=yuv420p';
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(TMP, 'f%05d.jpg'), '-i', P.audio,
    '-filter_complex', `[0:v]${vf}[v]`, '-map', '[v]', '-map', '1:a', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow',
    '-b:v', '14M', '-maxrate', '16M', '-bufsize', '24M', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-movflags', '+faststart', '-shortest', P.out], { stdio: 'inherit' });
  if (r.status) { console.error('FAIL ffmpeg encode'); process.exit(1); }
  if (!flag('keep-frames', false)) fs.rmSync(TMP, { recursive: true, force: true });
  const pr = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,pix_fmt,color_range,nb_frames', '-of', 'default=nw=1', P.out], { encoding: 'utf8' }).stdout.trim().replace(/\n/g, ' ');
  console.log(`DONE ${P.out}\n${pr}`);
}

if (argv[1] === '--worker') worker(+argv[2], +argv[3]).then(() => process.exit(0)).catch(e => { console.error('FAILED', e.message); process.exit(1); });
else main().catch(e => { console.error('FAILED', e.message); process.exit(1); });
