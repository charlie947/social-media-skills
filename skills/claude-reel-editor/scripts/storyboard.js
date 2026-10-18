// storyboard.js: one still per beat on one page, BEFORE any video is rendered. Nothing renders until you say yes.
// usage: node scripts/storyboard.js <project dir> [--allow-fallback]
// Writes <project>/storyboard/STORYBOARD.html: each card has the still, the time, the exact words, the layout and the one move.
// Click a card and that beat plays with sound in the player. One notes bar at the bottom: pick a beat, type or dictate, Add,
// then "Copy all feedback" and paste it to Claude.
const fs = require('fs'), path = require('path');
const { loadProject, launch, openReel, seekAndWait, extractFrames } = require('./lib');
const P = loadProject(process.argv[2]), allowFallback = process.argv.includes('--allow-fallback');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

(async () => {
  extractFrames(P);
  const OUT = path.join(P.dir, 'storyboard'); fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });
  const br = await launch();
  const { pg, errs } = await openReel(br, P, { allowFallback });
  const info = await pg.evaluate(() => ({ title: REEL.title || document.title, dur: REEL.dur, words: CUT.words,
    beats: REEL.beats.map(b => ({ a: b.a, b: b.b, lay: b.lay, move: b.move || '', still: b.still ?? b.a + (b.b - b.a) * .75 })) }));
  const cards = [];
  for (const [i, b] of info.beats.entries()) {
    await seekAndWait(pg, b.still);
    const f = path.join(OUT, 'stills', `s${String(i).padStart(2, '0')}.jpg`);
    await pg.screenshot({ path: f, type: 'jpeg', quality: 86 });
    const words = info.words.filter(w => w.start >= b.a && w.start < b.b).map(w => w.word).join(' ');
    const head = `${String(i + 1).padStart(2, '0')} · ${b.a.toFixed(1)}-${b.b.toFixed(1)}s · ${b.lay.toUpperCase()}`;
    cards.push(`<div class=c data-t="${b.a}" data-h="${esc(head)}"><div class=im><img src="stills/${path.basename(f)}"><span class=pb>▶ Play</span></div><div class=m><b>${esc(head)}</b><p class=w>“${esc(words)}”</p><p>${esc(b.move)}</p><div class=mine></div></div></div>`);
  }
  await br.close();
  if (errs.length) { console.error('page errors:\n' + errs.join('\n')); process.exit(1); }
  const player = path.relative(OUT, P.page).split(path.sep).join('/') + '#play';
  const opts = info.beats.map((b, i) => `<option>${esc(`${String(i + 1).padStart(2, '0')} · ${b.a.toFixed(1)}-${b.b.toFixed(1)}s · ${b.lay.toUpperCase()}`)}</option>`).join('');
  const key = 'storyboard:' + path.basename(P.dir);
  const html = `<!doctype html><html lang="en-GB"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(info.title)} storyboard</title><style>
body{margin:0;background:#fff;color:#1d1d1f;font:15px/1.45 system-ui,-apple-system,sans-serif}main{max-width:1240px;margin:0 auto;padding:36px 16px 260px}
h1{font-size:36px;letter-spacing:-.03em;margin:0 0 6px}.lede{color:#6e6e73;margin:0 0 20px}
.top{display:grid;grid-template-columns:400px 1fr;gap:28px;align-items:start;margin-bottom:34px}
.fr{width:400px;height:711px;overflow:hidden;border-radius:24px;box-shadow:0 20px 50px rgba(0,19,47,.18);position:sticky;top:16px}iframe{width:1080px;height:1920px;border:0;transform:scale(.37037);transform-origin:0 0}
.how{background:#f5f5f7;border-radius:18px;padding:18px 22px}.how li{margin:4px 0}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}.c{border:1.5px solid #e5e5ea;border-radius:18px;overflow:hidden;cursor:pointer}
.c.sel{border-color:#0071E3;box-shadow:0 0 0 3px rgba(0,113,227,.18)}.im{position:relative}.c img{width:100%;display:block}
.pb{position:absolute;left:12px;top:12px;background:#1d1d1f;color:#fff;border-radius:980px;padding:6px 14px;font-weight:600;font-size:13px}
.m{padding:12px 14px}.m b{font-size:13px}.w{font-weight:600}.mine p{background:#f2f8ff;border-left:3px solid #0071E3;padding:8px 10px;border-radius:8px;margin:6px 0 0}
.bar{position:fixed;left:0;right:0;bottom:0;background:rgba(255,255,255,.97);border-top:1px solid #e5e5ea;padding:12px 16px;z-index:9}
.row{max-width:1240px;margin:0 auto;display:flex;gap:10px;align-items:flex-end}
select{font:600 15px system-ui,sans-serif;padding:12px;border-radius:12px;border:1.5px solid #d2d2d7;background:#fff;max-width:230px}
#fb{flex:1;min-height:56px;max-height:200px;border:1.5px solid #d2d2d7;border-radius:14px;padding:14px 16px;font:16px/1.4 system-ui,sans-serif;resize:vertical;box-sizing:border-box}
button{background:#1d1d1f;color:#fff;border:0;border-radius:980px;padding:14px 22px;font:600 15px system-ui,sans-serif;cursor:pointer;white-space:nowrap}button.g2{background:#f5f5f7;color:#1d1d1f}
.st{max-width:1240px;margin:6px auto 0;color:#6e6e73;font-size:13px}
@media(max-width:800px){.top{grid-template-columns:1fr}.fr{position:static;width:100%;max-width:400px;height:auto;aspect-ratio:9/16}.row{flex-wrap:wrap}}</style>
<main><h1>${esc(info.title)}: storyboard</h1><p class=lede>${info.dur.toFixed(1)}s, ${info.beats.length} beats. No video has been rendered yet.</p>
<div class=top><div class=fr><iframe id=pl allow="autoplay" src="${esc(player)}"></iframe></div><div class=how><b>How to use this page</b><ol>
<li>Click a card. That beat plays with sound in the player.</li><li>Type or dictate a note in the bar at the bottom, then press Add.</li>
<li>Press Copy all feedback and paste it to Claude. Claude changes the beats and makes a new storyboard.</li><li>When it is right, type YES under Overall. Only then does Claude render the video.</li></ol></div></div>
<div class=g>${cards.join('')}</div></main>
<div class=bar><div class=row><select id=to><option value="Overall">Overall</option>${opts}</select><textarea id=fb placeholder="Type or dictate your note, then press Add (or Cmd+Enter)"></textarea><button id=add>Add</button><button id=cp>Copy all feedback</button><button class=g2 id=clr>Clear</button></div><div class=st id=cnt></div></div>
<script>
const K=${JSON.stringify(key)},$=id=>document.getElementById(id),fb=$('fb'),to=$('to');
let N=[];try{N=JSON.parse(localStorage.getItem(K)||'[]')}catch(e){}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(N))}catch(e){}};
function draw(){document.querySelectorAll('.c').forEach(c=>{c.querySelector('.mine').innerHTML=N.filter(n=>n.h===c.dataset.h).map(n=>'<p>'+n.x.replace(/[<&]/g,s=>s=='<'?'&lt;':'&amp;')+'</p>').join('')});
 $('cnt').textContent=N.length?N.length+' note'+(N.length>1?'s':'')+' saved. Press Copy all feedback, then paste it to Claude.':'No notes yet. Type YES under Overall to approve the storyboard.'}
function add(){const x=fb.value.trim();if(!x)return;N.push({h:to.value,x});fb.value='';save();draw();fb.focus()}
$('add').onclick=add;fb.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();add()}});
document.querySelectorAll('.c').forEach(c=>c.onclick=()=>{document.querySelectorAll('.c').forEach(x=>x.classList.remove('sel'));c.classList.add('sel');to.value=c.dataset.h;try{$('pl').contentWindow.postMessage({t:+c.dataset.t},'*')}catch(e){};fb.focus()});
$('cp').onclick=async e=>{if(fb.value.trim())add();if(!N.length)return;const t='Storyboard feedback:\\n'+N.map(n=>'- '+n.h+': '+n.x).join('\\n');
 try{await navigator.clipboard.writeText(t)}catch(x){const a=document.createElement('textarea');a.value=t;document.body.append(a);a.select();document.execCommand('copy');a.remove()}
 e.target.textContent='Copied';setTimeout(()=>e.target.textContent='Copy all feedback',2000)};
$('clr').onclick=()=>{N=[];save();draw()};draw();
</script></html>`;
  fs.writeFileSync(path.join(OUT, 'STORYBOARD.html'), html);
  console.log(`storyboard: ${info.beats.length} stills -> ${path.join(OUT, 'STORYBOARD.html')}`);
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
