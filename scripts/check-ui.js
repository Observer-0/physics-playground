/* =====================================================================
   Browsertest ohne zusätzliche Abhängigkeiten
   Lädt dist/index.html in einem Headless-Chrome oder -Edge – für jedes Experiment
   mit allen Tabs, alle Seiten und einige Sonderzustände, jeweils auf Deutsch und
   Englisch – und prüft den fertig gerenderten DOM:
     · Seite aufgebaut, keine Fehlermeldung (auch nicht im Bild: dessen Text steht in #vizdesc)
     · kein „NaN“, <html lang> passt
     · auf Englisch keine deutschen Reste (fremdsprachige Originaltitel tragen ein lang-Attribut)
     · Seite „Tests“: alle Tests bestanden – dort laufen auch die UI-Tests, die Node überspringt
   Aufruf:  npm run build && npm run check:ui
   Browser: wird gesucht; alternativ CHROME_PATH=/pfad/zum/browser
   ===================================================================== */
'use strict';
const { execFile } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const { pathToFileURL } = require('url');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist', 'index.html');
if (!fs.existsSync(dist)) { console.error('dist/index.html fehlt – zuerst „npm run build“ ausführen.'); process.exit(1); }

const browser = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find((p) => p && fs.existsSync(p));
if (!browser) { console.error('Kein Chrome/Edge gefunden – Pfad über CHROME_PATH angeben.'); process.exit(1); }

// Experimente und ihre Tabs aus den Daten der App
require(path.join(root, 'src/core/i18n.js')); require(path.join(root, 'src/core/engine.js'));
require(path.join(root, 'src/core/model.js')); require(path.join(root, 'src/data/experiments.js'));
require(path.join(root, 'src/data/sources.js'));
const M = globalThis.PP.model;
const hashes = [];
for (const e of M.registry) {
  for (const tab of (e.hall ? ['lab', 'formula', 'dims', 'physics'] : ['formula', 'dims', 'physics'])) hashes.push('exp=' + e.id + '&tab=' + tab);
  if (globalThis.PP.sources.byId[e.id]) hashes.push('exp=' + e.id + '&tab=sources');
}
for (const v of ['hall', 'custom', 'theorie', 'constants', 'saved', 'about']) hashes.push('view=' + v);
// Grundlagen: jeder Abschnitt hat eine eigene Seite
for (const sec of ['dim', 'inertia', 'rel', 'idx', 'tensor', 'action', 'history', 'qm', 'entropy', 'gap']) hashes.push('view=theorie&sec=' + sec);
hashes.push('exp=newton-gravity&cmp=1&b=m1:2;m2:1;r:0.5', 'exp=special-rel&a=beta:1;tau:1;L0:1;m:1', 'exp=planck&vo=q:T', 'exp=newton-gravity&brk=1', 'view=custom&eq=E%20%3D%20m%20g%20h');
let jobs = [];
for (const lang of ['de', 'en']) { for (const h of hashes) jobs.push({ h, lang }); jobs.push({ h: 'view=tests', lang, tests: true }); }
// Nur einen Teil prüfen, z. B. CHECK_ONLY=exp=planck
if (process.env.CHECK_ONLY) jobs = jobs.filter((j) => j.h.includes(process.env.CHECK_ONLY));

const base = pathToFileURL(dist).href;
function dump(url) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-check-'));
  const args = ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    '--user-data-dir=' + profile, '--virtual-time-budget=4000', '--dump-dom', url];
  return new Promise((resolve) => {
    execFile(browser, args, { timeout: 60000, maxBuffer: 64 * 1024 * 1024, windowsHide: true }, (err, out) => {
      try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) { /* Profil darf liegen bleiben */ }
      resolve({ err, out: String(out || '') });
    });
  });
}

const GERMAN = /[„äöüÄÖÜß]|\b(und|der|das|ist|nicht|mit|eine|einen|wird|zum|zur|oder|sich|auch|werden|kann|über|für|bei)\b/;
const NAMES = /Schrödinger|Eötvös|Göttingen|Zürich|Böhm|Kölner|Königlich|Preußischen/g;
function check(job, html) {
  const problems = [];
  const lang = (html.match(/<html[^>]*\blang="(\w+)"/) || [])[1];
  if (lang !== job.lang) problems.push('<html lang="' + lang + '"> statt „' + job.lang + '“');
  let body = (html.match(/<div id="root"[\s\S]*?(?=<script)/) || [''])[0];
  const text = (s) => s.replace(/<annotation[\s\S]*?<\/annotation>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;/g, ' ').replace(/\s+/g, ' ');
  const t = text(body);
  if (t.length < 200) problems.push('Seite fast leer (' + t.length + ' Zeichen)');
  // Auf der Tests-Seite kommt „NaN“ in Testnamen vor – dort zählt nur das Ergebnis
  const e = t.match(job.tests ? /konnte nicht aufgebaut|could not be built/ : /konnte nicht aufgebaut|could not be built|keine sinnvolle Darstellung|no meaningful picture|\bNaN\b|\[object Object\]/);
  if (e) problems.push('Fehlertext: „' + e[0] + '“');
  if (job.lang === 'en') {
    // Texte in anderer Sprache (lang="de", "fr" …) sind gewollt, etwa Originaltitel von Quellen
    body = body.replace(/<(\w+)[^>]*\blang="(?!en)\w+"[^>]*>[\s\S]*?<\/\1>/g, ' ');
    const attrs = [...body.matchAll(/(?:aria-label|title|placeholder)="([^"]*)"/g)].map((m) => m[1]).join(' | ');
    const all = (text(body) + ' | ' + attrs).replace(NAMES, '');
    const m = new RegExp(GERMAN.source).exec(all);
    if (m) problems.push('deutsch? …' + all.slice(Math.max(0, m.index - 50), m.index + 50) + '…');
  }
  if (job.tests) {
    const r = t.match(/(\d+)\s*\/\s*(\d+)/);
    if (!r) problems.push('Testergebnis nicht gefunden');
    else if (r[1] !== r[2]) problems.push('Tests im Browser: ' + r[1] + ' / ' + r[2] + ' – ' + (t.match(/✗[^✓✗]{0,160}/g) || []).slice(0, 3).join(' | '));
  }
  return problems;
}

(async () => {
  const started = Date.now();
  const failures = [];
  let next = 0, done = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      const { err, out } = await dump(base + '#' + job.h + '&lang=' + job.lang);
      const problems = err && !out ? ['Browser: ' + err.message.split('\n')[0]] : check(job, out);
      if (problems.length) failures.push({ job, problems });
      if (++done % 20 === 0) process.stdout.write(done + '/' + jobs.length + ' ');
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, os.cpus().length || 2) }, worker));
  console.log('\n' + jobs.length + ' Seiten in ' + Math.round((Date.now() - started) / 1000) + ' s geprüft (' + path.basename(browser) + ')');
  for (const f of failures) console.log('✗ #' + f.job.h + ' [' + f.job.lang + ']\n    ' + f.problems.join('\n    '));
  if (failures.length) { console.log(failures.length + ' Seiten mit Problemen'); process.exit(1); }
  console.log('Alle Seiten in Ordnung.');
})();
