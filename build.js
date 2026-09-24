// Bundles everything into dist/index.html (single self-contained file)
const fs = require('fs');
const path = require('path');
const ORDER = ['engine.js', 'model.js', 'experiments.js', 'tests.js', 'tex.js', 'plot.js', 'viz.js', 'app-core.js', 'app-lab.js', 'app-dims.js', 'app-pages.js', 'app-theory.js', 'app-tensor.js', 'app-action.js', 'app-entropy.js'];
const css = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
const js = ORDER.map((f) => '/* ---- ' + f + ' ---- */\n' + fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n').replace(/<\/script/gi, '<\\/script');
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
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), html);
console.log('dist/index.html', (html.length / 1024).toFixed(0) + ' KB');
