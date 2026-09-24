require('../src/core/i18n.js'); require('../src/core/engine.js'); require('../src/core/model.js'); require('../src/data/experiments.js'); require('./tests.js');
const res = PP.tests.runAll();
let f = 0;
for (const r of res) { if (!r.pass) f++; console.log((r.pass ? '✓' : '✗') + ' [' + r.group + '] ' + r.name + (r.pass ? '' : '\n    → ' + r.err)); }
console.log(`\n${res.length - f}/${res.length} bestanden`);
process.exit(f ? 1 : 0);
