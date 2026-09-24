/* =====================================================================
   Physics Playground — Test suite (runs in Node and in the browser)
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine, M = PP.model;
  const T = [];
  const test = (group, name, fn) => T.push({ group, name, fn });

  function close(a, b, rel = 1e-9, msg = '') {
    if (!(Math.abs(a - b) <= rel * Math.abs(b))) throw new Error(`${msg} erwartet ≈ ${b}, erhalten ${a}`);
  }
  function ok(c, msg) { if (!c) throw new Error(msg || 'Bedingung nicht erfüllt'); }
  const run = (id, vals, form) => {
    const exp = M.byId[id];
    const v = Object.assign(M.defaults(exp), vals || {});
    return M.compute(exp, form || exp.forms[0].id, v);
  };
  const val = (r, k) => E.toDouble(r.out[k]);
  const D = E.dimParse;
  const symDims = () => { const s = {}; for (const k in M.C) s[k] = M.C[k].dimv; return s; };

  /* --- Newton gravity --- */
  test('Gravitation', 'G=6.67430e-11, m₁=m₂=r=1 → F ≈ 6.67430e-11 N', () => {
    const r = run('newton-gravity', { m1: 1, m2: 1, r: 1 });
    close(val(r, 'F'), 6.67430e-11, 1e-12);
  });
  test('Gravitation', 'Abstand ×2 → Kraft /4', () => {
    const a = val(run('newton-gravity', { r: 3 }), 'F'), b = val(run('newton-gravity', { r: 6 }), 'F');
    close(a / b, 4, 1e-12);
  });
  test('Gravitation', 'Erde–Apfel liefert ≈ 0,98 N', () => {
    const r = run('newton-gravity', M.byId['newton-gravity'].presets[1].values);
    close(val(r, 'F'), 0.982, 0.01);
  });
  test('Gravitation', 'Division durch 0 (r = 0) → kein Absturz, Kategorie „math“', () => {
    const r = run('newton-gravity', { r: 0 });
    ok(!r.out.F.ok, 'F sollte als undefiniert markiert sein');
    ok(r.issues.some((i) => i.cat === 'math' && /Division durch 0/.test(i.msg)), 'math-Issue fehlt');
  });
  test('Gravitation', 'Veränderte Konstante G wird als „unrealistisch“ erkannt', () => {
    const r = run('newton-gravity', { G: 6.6743e-5 });
    ok(r.issues.some((i) => i.cat === 'unreal'), 'unreal-Issue fehlt');
  });
  test('Gravitation', 'Schwarze Löcher bei 350 km → „außerhalb des Modells“', () => {
    const exp = M.byId['newton-gravity'];
    const r = run('newton-gravity', exp.presets.find((p) => /Schwarze/.test(p.name)).values);
    ok(r.issues.some((i) => i.cat === 'model'), 'model-Issue fehlt');
  });
  test('Gravitation', 'NaN-Eingabe → sauber gemeldet, kein NaN-Ergebnis als Zahl', () => {
    const r = run('newton-gravity', { m1: NaN });
    ok(!r.out.F.ok, 'F sollte ungültig sein');
    ok(r.issues.some((i) => i.cat === 'math'), 'math-Issue fehlt');
    ok(E.fmt(r.out.F) === '—', 'Formatierung sollte „—“ liefern');
  });
  test('Gravitation', 'Unsicherheit aus G ≈ 2,2 × 10⁻⁵ relativ', () => {
    const exp = M.byId['newton-gravity'];
    const u = M.uncertainty(exp, 'main', M.defaults(exp), 'F');
    close(u.rel, 0.00015 / 6.6743, 1e-3);
  });

  /* --- Extreme magnitudes --- */
  test('Numerik', 'Overflow: m₁ = m₂ = 10³⁰⁰ kg, r = 10⁻³⁰⁰ m → log-Auswertung', () => {
    const r = run('newton-gravity', { m1: 1e300, m2: 1e300, r: 1e-300 });
    ok(r.out.F.ok, 'F sollte berechenbar sein');
    close(r.out.F.l, Math.log10(6.6743e-11) + 1200, 1e-12);
    ok(r.issues.some((i) => i.cat === 'numeric'), 'numeric-Issue fehlt');
    ok(/10¹¹⁸⁹/.test(E.fmt(r.out.F)), 'Formatierung: ' + E.fmt(r.out.F));
  });
  test('Numerik', 'Underflow: 10⁻³⁰⁰ · 10⁻³⁰⁰ bleibt als 10⁻⁶⁰⁰ erhalten', () => {
    const x = E.evaluate(E.parse('a*b'), { a: 1e-300, b: 1e-300 });
    ok(x.ok && x.s === 1, 'sollte positiv sein');
    close(x.l, -600, 1e-12);
  });
  test('Numerik', 'Log-Addition großer Zahlen: 10³⁰⁸·10 + 10³⁰⁸·10', () => {
    const x = E.evaluate(E.parse('a*10 + a*10'), { a: 1e308 });
    close(x.l, 309 + Math.log10(2), 1e-12);
  });
  test('Numerik', 'Wurzel aus negativer Zahl → math-Issue statt NaN', () => {
    const x = E.evaluate(E.parse('sqrt(a)'), { a: -1 });
    ok(!x.ok && x.issues[0].cat === 'math');
  });
  test('Numerik', 'β = 1 → γ undefiniert, β = 1,2 → imaginär, beides ohne Absturz', () => {
    const a = run('special-rel', { beta: 1 }), b = run('special-rel', { beta: 1.2 });
    ok(!a.out.gamma.ok && !b.out.gamma.ok);
    ok(a.issues.some((i) => i.cat === 'math') && b.issues.some((i) => i.cat === 'math'));
  });
  test('Numerik', 'E_kin bei β = 10⁻⁹ stabil (naiv wäre 0)', () => {
    const r = run('special-rel', { beta: 1e-9, m: 1 });
    close(val(r, 'Ek'), 0.5 * 1 * (1e-9 * 299792458) ** 2, 1e-9);
  });
  test('Numerik', 'LHC-Proton: γ ≈ 7247', () => {
    const exp = M.byId['special-rel'];
    const r = run('special-rel', exp.presets.find((p) => /LHC/.test(p.name)).values);
    close(val(r, 'gamma'), 7247.4, 1e-6);
  });

  /* --- Units & dimensions --- */
  test('Einheiten', '[G] = m³ kg⁻¹ s⁻²', () => {
    ok(E.siUnitStr(M.C.G.dimv) === 'm³ kg⁻¹ s⁻²', E.siUnitStr(M.C.G.dimv));
  });
  test('Einheiten', '[G][m][m]/[r]² = N', () => {
    const d = E.dimAnalyze(E.parse('G*m1*m2/r^2'), Object.assign(symDims(), { m1: D('M'), m2: D('M'), r: D('L') }));
    ok(d.ok && E.dimInfo(d.dim).unit === 'N', E.dimInfo(d.dim).unit);
  });
  test('Einheiten', 'Unicode-Eingabe: ħc³/(8πGMk_B) wird geparst', () => {
    const ast = E.parse('ħ·c³/(8π G M k_B)');
    const d = E.dimAnalyze(ast, Object.assign(symDims(), { M: D('M') }));
    ok(d.ok && E.dimEq(d.dim, D('Θ')), E.dimStr(d.dim));
  });
  test('Dimensionsanalyse', 'Hawking-Temperatur hat die Dimension Θ', () => {
    const exp = M.byId.hawking, f = exp.forms[0];
    const q = f.c.equations[0];
    const res = E.checkEquation(q, f.c.symDims);
    ok(res.consistent && E.dimEq(res.rhs.dim, D('Θ')), E.dimStr(res.rhs.dim));
  });
  test('Dimensionsanalyse', 'S_BH hat die Dimension einer Entropie, S/k_B ist dimensionslos', () => {
    const f = M.byId['bh-entropy'].forms[0];
    for (const q of f.c.equations) ok(E.checkEquation(q, f.c.symDims).consistent, q.label);
    const d = E.dimAnalyze(E.parse('k_B*c^3*A/(4*G*hbar)'), Object.assign(symDims(), { A: D('L^2') }));
    ok(E.dimEq(d.dim, D('M L^2 T^-2 Θ^-1')));
  });
  test('Dimensionsanalyse', 'Feldgleichungen: beide Seiten L⁻²', () => {
    const f = M.byId.efe.forms[0];
    const res = E.checkEquation(f.c.equations[0], f.c.symDims);
    ok(res.consistent, 'inkonsistent');
    ok(E.dimEq(res.rhs.dim, D('L^-2')), E.dimStr(res.rhs.dim));
  });
  test('Dimensionsanalyse', 'Schrödinger: alle Terme Energie × [ψ], [ψ] = L⁻¹ᐟ²', () => {
    const f = M.byId.schroedinger.forms[0];
    for (const q of f.c.equations) ok(E.checkEquation(q, f.c.symDims).consistent, q.label);
    const res = E.checkEquation(f.c.equations[0], f.c.symDims);
    ok(E.dimEq(res.rhs.dim, D('M L^2 T^-2 L^-1/2')), E.dimStr(res.rhs.dim));
  });
  test('Dimensionsanalyse', 'Planck-Einheiten: L, T, M, Θ', () => {
    const f = M.byId.planck.forms[0];
    for (const q of f.c.equations) ok(E.checkEquation(q, f.c.symDims).consistent, q.label);
  });
  test('Dimensionsanalyse', 'Alle Ausgabeformeln aller Experimente sind dimensionskonsistent', () => {
    for (const exp of M.registry) for (const f of exp.forms) {
      for (const q of f.c.autoEq) {
        const r = E.checkEquation(q, f.c.symDims);
        ok(r.consistent, exp.id + '/' + q.label + ': ' + (r.mismatch ? E.dimStr(r.mismatch.left) + ' ≠ ' + E.dimStr(r.mismatch.right) : r.rhs.errors.map((e) => e.msg).join('; ')));
      }
      for (const q of f.c.equations) ok(E.checkEquation(q, f.c.symDims).consistent, exp.id + '/' + q.label);
    }
  });
  test('Dimensionsanalyse', 'X = G M / c mit [X] = L ist inkonsistent (rechts L² T⁻¹)', () => {
    const q = E.parseEquation('X = G M / c');
    const res = E.checkEquation(q, Object.assign(symDims(), { X: D('L'), M: D('M') }));
    ok(!res.consistent && res.mismatch, 'sollte inkonsistent sein');
    ok(E.dimEq(res.mismatch.right, D('L^2 T^-1')), E.dimStr(res.mismatch.right));
  });
  test('Dimensionsanalyse', 'Summe inkompatibler Dimensionen wird lokalisiert', () => {
    const q = E.parseEquation('v = G*M + c');
    const res = E.checkEquation(q, Object.assign(symDims(), { v: D('L T^-1'), M: D('M') }));
    const err = res.rhs.errors[0];
    ok(err && err.kind === 'sum', 'Summenfehler fehlt');
    ok(q.src.slice(err.node.span[0], err.node.span[1]).trim() === 'G*M + c', 'Span: ' + q.src.slice(err.node.span[0], err.node.span[1]));
  });
  test('Dimensionsanalyse', 'E = ½mc² ist konsistent – obwohl physikalisch falsch für die Ruheenergie', () => {
    const q = E.parseEquation('E = 0.5*m*c^2');
    ok(E.checkEquation(q, Object.assign(symDims(), { E: D('M L^2 T^-2'), m: D('M') })).consistent);
  });
  test('Dimensionsanalyse', 'Exponent mit Dimension wird abgelehnt', () => {
    const d = E.dimAnalyze(E.parse('x^t'), { x: D('L'), t: D('T') });
    ok(!d.ok);
  });
  test('Dimensionsanalyse', 'exp(Länge) wird abgelehnt', () => {
    const d = E.dimAnalyze(E.parse('exp(x)'), { x: D('L') });
    ok(!d.ok);
  });

  /* --- Reference values --- */
  test('Referenzwerte', 'Planck-Länge ≈ 1,61626 × 10⁻³⁵ m (CODATA: 1,616255(18))', () => {
    close(val(run('planck'), 'lP'), 1.616255e-35, 2e-6);
  });
  test('Referenzwerte', 'Planck-Masse ≈ 2,176434 × 10⁻⁸ kg', () => {
    close(val(run('planck'), 'mP'), 2.176434e-8, 2e-6);
  });
  test('Referenzwerte', 'Planck-Temperatur ≈ 1,416784 × 10³² K', () => {
    close(val(run('planck'), 'TP'), 1.416784e32, 2e-6);
  });
  test('Referenzwerte', 'Hawking-Temperatur einer Sonnenmasse ≈ 6,17 × 10⁻⁸ K', () => {
    close(val(run('hawking', { M: M.C.M_sun.value }), 'TH'), 6.17e-8, 2e-3);
  });
  test('Referenzwerte', 'S/k_B einer Sonnenmasse ≈ 1,05 × 10⁷⁷', () => {
    close(val(run('bh-entropy', { M: M.C.M_sun.value }, 'mass'), 'SkB'), 1.05e77, 1e-2);
  });
  test('Referenzwerte', 'Schwarzschild-Radius der Sonne ≈ 2953 m', () => {
    close(val(run('hawking', { M: M.C.M_sun.value }), 'rs'), 2953.25, 1e-4);
  });
  test('Referenzwerte', 'Beide Entropie-Formen stimmen überein', () => {
    const a = run('bh-entropy', { M: 1e31 }, 'mass');
    const b = run('bh-entropy', { A: val(a, 'A') }, 'area');
    close(val(b, 'S'), val(a, 'S'), 1e-10);
    close(val(b, 'Meq'), 1e31, 1e-10);
  });
  test('Referenzwerte', 'Einstein-Kopplung 8πG/c⁴ ≈ 2,077 × 10⁻⁴³', () => {
    close(val(run('efe'), 'kappa'), 2.0766e-43, 1e-4);
  });
  test('Referenzwerte', 'Elektron im 1-nm-Kasten: E₁ ≈ 0,376 eV', () => {
    const r = run('schroedinger', { m: M.C.m_e.value, L: 1e-9, n: 1 });
    close(val(r, 'E') / M.C.eV.value, 0.376, 1e-2);
  });
  test('Referenzwerte', 'Freier Fall 100 m: t ≈ 4,52 s', () => {
    close(val(run('free-fall', { h0: 100, g: 9.80665 }), 'tf'), 4.5160, 1e-4);
  });
  test('Referenzwerte', 'Feder k=50, m=1: T = 2π/√50', () => {
    close(val(run('spring'), 'T'), 2 * Math.PI / Math.sqrt(50), 1e-12);
  });
  test('Referenzwerte', 'Kinematik: s = 0 + 5·3 + ½·2·9 = 24 m', () => {
    close(val(run('kinematics'), 's'), 24, 1e-12);
  });
  test('Referenzwerte', 'ISS: a ≈ 8,6 m/s²', () => {
    const exp = M.byId.circular;
    close(val(run('circular', exp.presets.find((p) => p.name === 'ISS').values), 'a'), 8.64, 5e-3);
  });

  /* --- Parser --- */
  test('Parser', 'Punkt vor Strich, rechtsassoziative Potenz, unäres Minus', () => {
    const f = (s) => E.evaluate(E.parse(s), {}).value;
    close(f('2+3*4'), 14); close(f('2^3^2'), 512); close(f('-2^2'), -4); close(f('2^-1'), 0.5);
  });
  test('Parser', 'Syntaxfehler liefert Position', () => {
    let err;
    try { E.parse('G*(m1+'); } catch (e) { err = e; }
    ok(err && err.kind === 'parse' && Array.isArray(err.span), 'Fehler mit Span erwartet');
  });
  test('Parser', 'Rationale Exponenten: sqrt(L) → L¹ᐟ²', () => {
    const d = E.dimAnalyze(E.parse('sqrt(x)'), { x: D('L') });
    ok(E.dimStr(d.dim) === 'L¹ᐟ²', E.dimStr(d.dim));
  });
  test('Parser', 'Funktionen verlangen genau ein Argument: sqrt(4, 5) ist ein Syntaxfehler', () => {
    let err;
    try { E.parse('sqrt(4, 5)'); } catch (e) { err = e; }
    ok(err && err.kind === 'parse' && /genau ein Argument/.test(err.message), err ? err.message : 'kein Fehler');
  });
  test('Parser', 'Namen wie constructor/toString sind unbekannt, __proto__ wird abgelehnt', () => {
    for (const s of ['constructor', 'toString', 'valueOf(2)', 'hasOwnProperty']) {
      const r = E.evaluate(E.parse(s), M.CONST_ENV);
      ok(!r.ok && /Unbekanntes Symbol/.test(r.issues[0].msg), s + ': ' + JSON.stringify(r.issues));
      const d = E.dimAnalyze(E.parse(s), symDims());
      ok(!d.ok && /keine bekannte Dimension/.test(d.errors[0].msg), s + ': Dimension');
    }
    let err;
    try { E.parse('X = __proto__'); } catch (e) { err = e; }
    ok(err && err.kind === 'parse', '__proto__ sollte abgelehnt werden');
  });
  test('Parser', '„ħc / G M“ wird als mehrdeutig gemeldet, „1/2 m v²“ und „a/(b c)“ nicht', () => {
    const hit = E.implicitAfterDivision(E.parse('hbar c / G M'));
    ok(hit.length === 1, 'Treffer erwartet');
    ok(E.toTex(hit[0].alt) === '\\frac{\\hbar\\,c}{G\\,M}', E.toTex(hit[0].alt));
    ok(!E.implicitAfterDivision(E.parse('1/2 m v^2')).length, '1/2 m v^2 fälschlich gemeldet');
    ok(!E.implicitAfterDivision(E.parse('a/(b c)')).length, 'a/(b c) fälschlich gemeldet');
    ok(E.implicitAfterDivision(E.parse('sqrt(a / b c)')).length === 1, 'in Funktionsargumenten übersehen');
  });
  test('Parser', 'Positionszuordnung nach normalize: ħ und ³ zeigen auf die Originalzeichen', () => {
    const raw = 'ħ c³ / G M', map = [];
    const n = E.normalize(raw, map);
    ok(map.length === n.length + 1, 'Länge der Zuordnung');
    ok(raw[map[n.indexOf('c')]] === 'c' && raw[map[n.indexOf('G')]] === 'G', 'falsche Zuordnung');
    ok(map[n.length] === raw.length, 'Ende');
  });
  test('Numerik', '0⁰ → eigene Meldung, keine „Division durch 0“', () => {
    const r = E.evaluate(E.parse('0^0'), {});
    ok(!r.ok && /0⁰/.test(r.issues[0].msg) && !/Division/.test(r.issues[0].msg), r.issues[0].msg);
  });
  test('Numerik', 'exp(10⁴⁰⁰) und cos(10⁴⁰⁰) → math-Issue statt „NaN × 10^Infinity“', () => {
    for (const s of ['exp(10^400)', 'exp(-10^400)', 'cos(10^400)']) {
      const r = E.evaluate(E.parse(s), {});
      ok(!r.ok && r.issues[0].cat === 'math' && /Double-Bereichs/.test(r.issues[0].msg), s + ': ' + JSON.stringify(r.issues));
    }
  });
  test('Einheiten', 'Dimensionsangabe mit Nenner 0 (L^1/0) wird abgelehnt', () => {
    let err;
    try { D('L^1/0'); } catch (e) { err = e; }
    ok(err && /Nenner 0/.test(err.message), err ? err.message : 'kein Fehler');
  });
  test('Formatierung', '6.6743e-11 → „6.6743 × 10⁻¹¹“', () => {
    ok(E.fmt(6.6743e-11) === '6.6743 × 10⁻¹¹', E.fmt(6.6743e-11));
  });

  // UI-level: custom-equation mode must agree with the experiment definitions
  test('UI (im Browser)', 'Eigene Gleichung: Hawking-Formel mit π und ħ ist konsistent, X = GM/c nicht', () => {
    if (!PP.ui || !PP.ui.dims) return; // UI-Module nur im Browser geladen
    const S = PP.ui.S, keep = { src: S.custom.src, dims: S.custom.dims };
    try {
      S.custom.src = 'T_H = ħ c^3 / (8 π G M k_B)'; S.custom.dims = {};
      const h = PP.ui.dims.customResult();
      if (!/✓ dimensionskonsistent/.test(h) || /✗/.test(h)) throw new Error('als inkonsistent gemeldet');
      S.custom.src = 'X = G M / c'; S.custom.dims = { X: 'L' };
      if (!/✗ dimensional inkonsistent/.test(PP.ui.dims.customResult())) throw new Error('X = GM/c nicht erkannt');
    } finally { S.custom.src = keep.src; S.custom.dims = keep.dims; }
  });
  test('UI (im Browser)', 'E = m g h: h zuerst Planck-Konstante mit Hinweis, als Höhe konsistent', () => {
    if (!PP.ui || !PP.ui.dims) return;
    const S = PP.ui.S, keep = { src: S.custom.src, dims: S.custom.dims };
    try {
      S.custom.src = 'E = m g h'; S.custom.dims = {};
      let h = PP.ui.dims.customResult();
      ok(/✗ dimensional inkonsistent/.test(h) && /data-alt="h"/.test(h), 'Hinweis auf h fehlt');
      S.custom.dims = { h: 'L' };
      h = PP.ui.dims.customResult();
      ok(/✓ dimensionskonsistent/.test(h) && !/✗/.test(h), 'mit h als Höhe nicht konsistent');
      S.custom.src = 'E = h f'; S.custom.dims = {};
      ok(/✓ dimensionskonsistent/.test(PP.ui.dims.customResult()), 'E = h f sollte konsistent sein');
    } finally { S.custom.src = keep.src; S.custom.dims = keep.dims; }
  });
  test('UI (im Browser)', 'Eigene Gleichung: „constructor“ und „toString“ lassen die Ansicht nicht abstürzen', () => {
    if (!PP.ui || !PP.ui.dims) return;
    const S = PP.ui.S, keep = { src: S.custom.src, dims: S.custom.dims };
    try {
      for (const src of ['X = constructor', 'E = toString m']) {
        S.custom.src = src; S.custom.dims = {};
        ok(/unbekannt/.test(PP.ui.dims.customResult()), src);
      }
    } finally { S.custom.src = keep.src; S.custom.dims = keep.dims; }
  });
  test('UI (im Browser)', 'Eigene Gleichung: Klammer-Vorschlag bei „ħ c / G M“ behält ħ und ³ bei', () => {
    if (!PP.ui || !PP.ui.dims) return;
    const S = PP.ui.S, keep = { src: S.custom.src, dims: S.custom.dims };
    try {
      S.custom.src = 'X = ħ c³ / G M'; S.custom.dims = {};
      const m = /data-fixsrc="([^"]*)"/.exec(PP.ui.dims.customResult());
      ok(m && m[1] === 'X = ħ c³ / (G M)', m ? m[1] : 'kein Vorschlag');
    } finally { S.custom.src = keep.src; S.custom.dims = keep.dims; }
  });
  test('UI (im Browser)', 'URL mit #exp=constructor oder #view=toString wird ignoriert', () => {
    if (!PP.ui || !PP.ui.applyState) return;
    ok(!PP.ui.applyState('#exp=constructor') && !PP.ui.applyState('#view=toString'), 'unbekannte Namen akzeptiert');
  });
  test('UI (im Browser)', 'Wirkungs-Demo: geschlossene Form ΔS = mπ²/(4T)·(ε₁² + 4ε₂²) stimmt mit der Integration überein', () => {
    if (!PP.ui || !PP.ui.actionDemo) return;
    const A = PP.ui.actionDemo, S0n = A.action(0, 0);
    close(A.S0, S0n, 1e-4, 'S₀'); // Toleranz = Fehler der Mittelpunktsregel mit 400 Schritten (≈ 6 × 10⁻⁵)
    for (const [a, b] of [[1, 0], [0, 1], [1.3, -0.7], [-2, 2]]) close(A.dS(a, b), A.action(a, b) - S0n, 1e-4, 'ΔS(' + a + ', ' + b + ')');
  });

  function runAll() {
    const results = [];
    for (const t of T) {
      try { t.fn(); results.push({ group: t.group, name: t.name, pass: true }); }
      catch (e) { results.push({ group: t.group, name: t.name, pass: false, err: e.message }); }
    }
    return results;
  }
  PP.tests = { list: T, runAll };
})(globalThis.PP = globalThis.PP || {});
