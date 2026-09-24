// Bundles src/index.html into dist/index.html (single self-contained file):
// the stylesheet link becomes an inline <style>, the <script src> tags one inline <script>.
// Load order is taken from src/index.html, so it is defined in exactly one place.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const read = (f) => fs.readFileSync(f, 'utf8');

let html = read(path.join(SRC, 'index.html'));

const css = read(path.join(SRC, 'styles.css'));
html = html.replace('<link rel="stylesheet" href="styles.css">\n', () => '');
html = html.replace('</head>', () => '<style>\n' + css + '\n</style>\n</head>');

const SCRIPT = /<script src="([^"]+)"><\/script>\n/g;
const files = [...html.matchAll(SCRIPT)].map((m) => path.join(SRC, m[1]));
if (!files.length) throw new Error('src/index.html: keine <script src> gefunden');
const js = files
  .map((f) => '/* ---- ' + path.relative(ROOT, f).split(path.sep).join('/') + ' ---- */\n' + read(f))
  .join('\n')
  .replace(/<\/script/gi, '<\\/script');
let first = true;
html = html.replace(SCRIPT, () => (first ? ((first = false), '<script>\n' + js + '\n</script>\n') : ''));
html = html.replace(/<!-- Entwicklungsversion:[\s\S]*?-->\n/, '');

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'index.html'), html);
console.log('dist/index.html', (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB, ' + files.length + ' Dateien');
