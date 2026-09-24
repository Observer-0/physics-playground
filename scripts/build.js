// Bundles everything into dist/index.html (single self-contained file)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
// Load order matters: every file extends the global PP namespace; ui/sections/* hook into ui/theory.js.
const ORDER = [
  'src/core/engine.js', 'src/core/model.js', 'src/data/experiments.js', 'tests/tests.js',
  'src/render/tex.js', 'src/render/plot.js', 'src/render/viz.js',
  'src/ui/core.js', 'src/ui/lab.js', 'src/ui/dims.js', 'src/ui/pages.js', 'src/ui/theory.js',
  'src/ui/sections/tensor.js', 'src/ui/sections/action.js', 'src/ui/sections/entropy.js',
];
const css = fs.readFileSync(path.join(ROOT, 'src/styles.css'), 'utf8');
const js = ORDER.map((f) => '/* ---- ' + f + ' ---- */\n' + fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n').replace(/<\/script/gi, '<\\/script');
const html = `<!doctype html>
<html lang="de" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Physics Playground</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪐</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=STIX+Two+Text:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body>
<div id="root"><noscript>Der Physics Playground braucht JavaScript.</noscript></div>
<script>
${js}
PP.ui.boot(document.getElementById('root'));
</script>
</body>
</html>
`;
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'index.html'), html);
console.log('dist/index.html', (html.length / 1024).toFixed(0) + ' KB');
