/* =====================================================================
   Physics Playground — Test suite (runs in Node and in the browser)
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine, M = PP.model, I = PP.i18n;
  const T = [];
  // Gruppen und Namen werden auf Deutsch geschrieben; die englische Fassung steht in EN.
  // Die Prüfungen selbst laufen immer auf Deutsch (siehe runAll), weil sie Meldungstexte vergleichen.
  const EN = {
    'Gravitation': 'Gravity', 'Numerik': 'Numerics', 'Einheiten': 'Units', 'Dimensionsanalyse': 'Dimensional analysis', 'Referenzwerte': 'Reference values',
    'Parser': 'Parser', 'Formatierung': 'Formatting', 'Sprache': 'Language', 'UI (im Browser)': 'UI (in the browser)', 'Visualisierung': 'Visualisation', 'Aufgaben': 'Tasks',
    'G=6.67430e-11, m₁=m₂=r=1 → F ≈ 6.67430e-11 N': 'G=6.67430e-11, m₁=m₂=r=1 → F ≈ 6.67430e-11 N',
    'Abstand ×2 → Kraft /4': 'Distance ×2 → force /4',
    'Erde–Apfel liefert ≈ 0,98 N': 'Earth–apple gives ≈ 0.98 N',
    'Division durch 0 (r = 0) → kein Absturz, Kategorie „math“': 'Division by 0 (r = 0) → no crash, category “math”',
    'Veränderte Konstante G wird als „unrealistisch“ erkannt': 'A changed constant G is flagged as “unrealistic”',
    'Schwarze Löcher bei 350 km → „außerhalb des Modells“': 'Black holes at 350 km → “outside the model”',
    'NaN-Eingabe → sauber gemeldet, kein NaN-Ergebnis als Zahl': 'NaN input → reported cleanly, no NaN result shown as a number',
    'Unsicherheit aus G ≈ 2,2 × 10⁻⁵ relativ': 'Uncertainty from G ≈ 2.2 × 10⁻⁵ relative',
    'Overflow: m₁ = m₂ = 10³⁰⁰ kg, r = 10⁻³⁰⁰ m → log-Auswertung': 'Overflow: m₁ = m₂ = 10³⁰⁰ kg, r = 10⁻³⁰⁰ m → log evaluation',
    'Underflow: 10⁻³⁰⁰ · 10⁻³⁰⁰ bleibt als 10⁻⁶⁰⁰ erhalten': 'Underflow: 10⁻³⁰⁰ · 10⁻³⁰⁰ is kept as 10⁻⁶⁰⁰',
    'Log-Addition großer Zahlen: 10³⁰⁸·10 + 10³⁰⁸·10': 'Log addition of large numbers: 10³⁰⁸·10 + 10³⁰⁸·10',
    'Wurzel aus negativer Zahl → math-Issue statt NaN': 'Square root of a negative number → math issue instead of NaN',
    'β = 1 → γ undefiniert, β = 1,2 → imaginär, beides ohne Absturz': 'β = 1 → γ undefined, β = 1.2 → imaginary, neither crashes',
    'E_kin bei β = 10⁻⁹ stabil (naiv wäre 0)': 'E_kin stable at β = 10⁻⁹ (naively it would be 0)',
    'LHC-Proton: γ ≈ 7247': 'LHC proton: γ ≈ 7247',
    '[G] = m³ kg⁻¹ s⁻²': '[G] = m³ kg⁻¹ s⁻²',
    '[G][m][m]/[r]² = N': '[G][m][m]/[r]² = N',
    'Unicode-Eingabe: ħc³/(8πGMk_B) wird geparst': 'Unicode input: ħc³/(8πGMk_B) is parsed',
    'Hawking-Temperatur hat die Dimension Θ': 'The Hawking temperature has dimension Θ',
    'S_BH hat die Dimension einer Entropie, S/k_B ist dimensionslos': 'S_BH has the dimension of an entropy, S/k_B is dimensionless',
    'Feldgleichungen: beide Seiten L⁻²': 'Field equations: both sides L⁻²',
    'Schrödinger: alle Terme Energie × [ψ], [ψ] = L⁻¹ᐟ²': 'Schrödinger: all terms energy × [ψ], [ψ] = L⁻¹ᐟ²',
    'Planck-Einheiten: L, T, M, Θ': 'Planck units: L, T, M, Θ',
    'Alle Ausgabeformeln aller Experimente sind dimensionskonsistent': 'Every output formula of every experiment is dimensionally consistent',
    'X = G M / c mit [X] = L ist inkonsistent (rechts L² T⁻¹)': 'X = G M / c with [X] = L is inconsistent (right-hand side L² T⁻¹)',
    'Summe inkompatibler Dimensionen wird lokalisiert': 'A sum of incompatible dimensions is located',
    'E = ½mc² ist konsistent – obwohl physikalisch falsch für die Ruheenergie': 'E = ½mc² is consistent – although physically wrong for the rest energy',
    'Exponent mit Dimension wird abgelehnt': 'An exponent with a dimension is rejected',
    'exp(Länge) wird abgelehnt': 'exp(length) is rejected',
    'Planck-Länge ≈ 1,61626 × 10⁻³⁵ m (CODATA: 1,616255(18))': 'Planck length ≈ 1.61626 × 10⁻³⁵ m (CODATA: 1.616255(18))',
    'Planck-Masse ≈ 2,176434 × 10⁻⁸ kg': 'Planck mass ≈ 2.176434 × 10⁻⁸ kg',
    'Planck-Temperatur ≈ 1,416784 × 10³² K': 'Planck temperature ≈ 1.416784 × 10³² K',
    'Hawking-Temperatur einer Sonnenmasse ≈ 6,17 × 10⁻⁸ K': 'Hawking temperature of one solar mass ≈ 6.17 × 10⁻⁸ K',
    'S/k_B einer Sonnenmasse ≈ 1,05 × 10⁷⁷': 'S/k_B of one solar mass ≈ 1.05 × 10⁷⁷',
    'Schwarzschild-Radius der Sonne ≈ 2953 m': 'Schwarzschild radius of the Sun ≈ 2953 m',
    'Beide Entropie-Formen stimmen überein': 'Both forms of the entropy agree',
    'Einstein-Kopplung 8πG/c⁴ ≈ 2,077 × 10⁻⁴³': 'Einstein coupling 8πG/c⁴ ≈ 2.077 × 10⁻⁴³',
    'Elektron im 1-nm-Kasten: E₁ ≈ 0,376 eV': 'Electron in a 1 nm box: E₁ ≈ 0.376 eV',
    'Freier Fall 100 m: t ≈ 4,52 s': 'Free fall 100 m: t ≈ 4.52 s',
    'Feder k=50, m=1: T = 2π/√50': 'Spring k=50, m=1: T = 2π/√50',
    'Kinematik: s = 0 + 5·3 + ½·2·9 = 24 m': 'Kinematics: s = 0 + 5·3 + ½·2·9 = 24 m',
    'ISS: a ≈ 8,6 m/s²': 'ISS: a ≈ 8.6 m/s²',
    'Punkt vor Strich, rechtsassoziative Potenz, unäres Minus': 'Operator precedence, right-associative powers, unary minus',
    'Syntaxfehler liefert Position': 'A syntax error reports its position',
    'Rationale Exponenten: sqrt(L) → L¹ᐟ²': 'Rational exponents: sqrt(L) → L¹ᐟ²',
    'Funktionen verlangen genau ein Argument: sqrt(4, 5) ist ein Syntaxfehler': 'Functions take exactly one argument: sqrt(4, 5) is a syntax error',
    'Namen wie constructor/toString sind unbekannt, __proto__ wird abgelehnt': 'Names like constructor/toString are unknown, __proto__ is rejected',
    '„ħc / G M“ wird als mehrdeutig gemeldet, „1/2 m v²“ und „a/(b c)“ nicht': '“ħc / G M” is flagged as ambiguous, “1/2 m v²” and “a/(b c)” are not',
    'Positionszuordnung nach normalize: ħ und ³ zeigen auf die Originalzeichen': 'Position mapping after normalize: ħ and ³ point to the original characters',
    '0⁰ → eigene Meldung, keine „Division durch 0“': '0⁰ → its own message, not “division by 0”',
    'exp(10⁴⁰⁰) und cos(10⁴⁰⁰) → math-Issue statt „NaN × 10^Infinity“': 'exp(10⁴⁰⁰) and cos(10⁴⁰⁰) → math issue instead of “NaN × 10^Infinity”',
    'Dimensionsangabe mit Nenner 0 (L^1/0) wird abgelehnt': 'A dimension with denominator 0 (L^1/0) is rejected',
    '6.6743e-11 → „6.6743 × 10⁻¹¹“': '6.6743e-11 → “6.6743 × 10⁻¹¹”',
    'Eigene Gleichung: Hawking-Formel mit π und ħ ist konsistent, X = GM/c nicht': 'Own equation: the Hawking formula with π and ħ is consistent, X = GM/c is not',
    'E = m g h: h zuerst Planck-Konstante mit Hinweis, als Höhe konsistent': 'E = m g h: h is first the Planck constant with a hint, consistent as a height',
    'Eigene Gleichung: „constructor“ und „toString“ lassen die Ansicht nicht abstürzen': 'Own equation: “constructor” and “toString” do not crash the view',
    'Eigene Gleichung: Klammer-Vorschlag bei „ħ c / G M“ behält ħ und ³ bei': 'Own equation: the bracket suggestion for “ħ c / G M” keeps ħ and ³',
    'URL mit #exp=constructor oder #view=toString wird ignoriert': 'A URL with #exp=constructor or #view=toString is ignored',
    'Wirkungs-Demo: geschlossene Form ΔS = mπ²/(4T)·(ε₁² + 4ε₂²) stimmt mit der Integration überein': 'Action demo: the closed form ΔS = mπ²/(4T)·(ε₁² + 4ε₂²) agrees with the integration',
    'Alle Visualisierungen zeichnen Standardwerte und Presets ohne Fehler und ohne „NaN“': 'All visualisations draw default values and presets without errors and without “NaN”',
    'β = 1: Die Visualisierung zeigt γ als nicht definiert statt einer Zahl': 'β = 1: the visualisation shows γ as undefined instead of a number',
    'Schwarzes Loch: r_s, A, S_BH und T_H im Bild stammen aus der Engine, Exponenten 1, 2, 2, −1': 'Black hole: r_s, A, S_BH and T_H in the picture come from the engine, exponents 1, 2, 2, −1',
    'Gravitation: Die Faktoren im Bild zeigen F ∝ m₁m₂/r² (m₁ ×2, r ×½ → F ×8)': 'Gravity: the factors in the picture show F ∝ m₁m₂/r² (m₁ ×2, r ×½ → F ×8)',
    'Feldgleichungen: Das Bild ist als schematische Projektion gekennzeichnet': 'Field equations: the picture is labelled as a schematic projection',
    'Schrödinger: Ein nicht ganzzahliges n wird nicht als Welle gezeichnet': 'Schrödinger: a non-integer n is not drawn as a wave',
    'Planck-Einheiten: Jede Skala zeigt den Wert aus der Engine (l_P, t_P, m_P, T_P, E_P)': 'Planck units: every scale shows the value from the engine (l_P, t_P, m_P, T_P, E_P)',
    'Planck-Temperatur: k_B im Bild ist E_P / T_P = 1,380649 × 10⁻²³ J/K, mit zweiter Achse in eV': 'Planck temperature: k_B in the picture is E_P / T_P = 1.380649 × 10⁻²³ J/K, with a second axis in eV',
    'Elliptisches Integral: K(0) = π/2, K(1/√2) ≈ 1,8540746773, K(0,5) ≈ 1,6857503548': 'Elliptic integral: K(0) = π/2, K(1/√2) ≈ 1.8540746773, K(0.5) ≈ 1.6857503548',
    'Elliptisches Integral: k = 1 divergiert, |k| > 1 ist nicht reell – beides als math-Issue': 'Elliptic integral: k = 1 diverges, |k| > 1 is not real – both reported as math issues',
    'ellipk(Länge) wird abgelehnt': 'ellipk(length) is rejected',
    'Fadenpendel: T/T₀ bei 90° ≈ 1,1803406': 'Pendulum: T/T₀ at 90° ≈ 1.1803406',
    'Ideales Gas: 1 mol bei 273,15 K in 22,414 l → 101,325 kPa': 'Ideal gas: 1 mol at 273.15 K in 22.414 l → 101.325 kPa',
    'Schiefer Wurf: 30° und 60° fliegen gleich weit, 45° am weitesten': 'Projectile: 30° and 60° fly equally far, 45° furthest',
    'Quellen: jedes Experiment hat Quellen, DOIs sind gültig geformt, englische Notizen ohne deutsche Reste': 'Sources: every experiment has sources, DOIs are well-formed, English notes contain no German',
    'Jede „Probier mal“-Aufgabe ist mit den Reglern lösbar und am Anfang noch offen': 'Every “Try this” task can be solved with the sliders and is still open at the start',
    'Engine-Meldungen und Dimensionsnamen gibt es auf Deutsch und Englisch': 'Engine messages and dimension names exist in German and English',
    'Umschalten wirkt auch auf die kompilierten Kopien der Experimente': 'Switching also affects the compiled copies of the experiments',
    'Keine deutschen Reste in den englischen Texten der Experimente und Konstanten': 'No German left in the English texts of the experiments and constants',
    'Jeder Test hat einen englischen Namen': 'Every test has an English name',
    'Keine deutschen Reste in den englischen Beschriftungen der Visualisierungen': 'No German left in the English labels of the visualisations',
  };
  const pair = (de) => (Object.prototype.hasOwnProperty.call(EN, de) ? { de, en: EN[de] } : de);
  const test = (group, name, fn) => T.push(I.localize({ group: pair(group), name: pair(name), fn }));

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

  /* --- Erweiterung der Engine: vollständiges elliptisches Integral K(k) --- */
  test('Numerik', 'Elliptisches Integral: K(0) = π/2, K(1/√2) ≈ 1,8540746773, K(0,5) ≈ 1,6857503548', () => {
    const K = (k) => E.toDouble(E.evaluate(E.parse('ellipk(k)'), { k }));
    close(K(0), Math.PI / 2, 1e-15, 'K(0)');
    close(K(Math.SQRT1_2), 1.8540746773013719, 1e-14, 'K(1/√2)');
    close(K(0.5), 1.685750354812596, 1e-14, 'K(0,5)');
    close(K(-0.5), K(0.5), 1e-15, 'K(−k) = K(k)');
  });
  test('Numerik', 'Elliptisches Integral: k = 1 divergiert, |k| > 1 ist nicht reell – beides als math-Issue', () => {
    for (const k of [1, 1.2, -1]) {
      const x = E.evaluate(E.parse('ellipk(k)'), { k });
      ok(!x.ok && x.issues[0].cat === 'math', 'k = ' + k);
    }
  });
  test('Dimensionsanalyse', 'ellipk(Länge) wird abgelehnt', () => {
    ok(!E.dimAnalyze(E.parse('ellipk(x)'), { x: D('L') }).ok && E.dimAnalyze(E.parse('ellipk(x)'), { x: D('') }).ok);
  });
  test('Referenzwerte', 'Fadenpendel: T/T₀ bei 90° ≈ 1,1803406', () => {
    close(val(run('pendulum', { th: 90 }), 'q'), 1.1803405990160962, 1e-12);
    close(val(run('pendulum', { L: 1, g: 9.80665, th: 0 }), 'T'), 2 * Math.PI * Math.sqrt(1 / 9.80665), 1e-14, 'θ₀ = 0');
  });
  test('Referenzwerte', 'Ideales Gas: 1 mol bei 273,15 K in 22,414 l → 101,325 kPa', () => {
    close(val(run('ideal-gas', { N: M.C.N_A.value, T: 273.15, V: 0.022414 }), 'p'), 101325, 2e-5);
  });
  test('Referenzwerte', 'Schiefer Wurf: 30° und 60° fliegen gleich weit, 45° am weitesten', () => {
    const R = (al) => val(run('projectile', { v0: 20, al, g: 9.80665 }), 'R');
    close(R(30), R(60), 1e-12, '30° ↔ 60°');
    ok(R(45) > R(44) && R(45) > R(46), '45° maximal');
    close(R(45), 400 / 9.80665, 1e-12, 'R(45°) = v₀²/g');
  });

  /* --- Aufgaben: jede lösbar, keine schon am Anfang gelöst --- */
  test('Aufgaben', 'Jede „Probier mal“-Aufgabe ist mit den Reglern lösbar und am Anfang noch offen', () => {
    const bad = [];
    const state = (exp, form, vals, base, consts, opts) => {
      const v = Object.assign(M.defaults(exp), vals || {}), b = Object.assign(M.defaults(exp), base || {});
      const r = M.compute(exp, form, v, { consts: consts || {} }), rb = M.compute(exp, form, b, { skipChecks: true });
      const num = (x) => (x && x.ok ? E.toDouble(x) : NaN);
      return { v, b, o: (k) => num(r.out[k]), ob: (k) => num(rb.out[k]), C: Object.assign({}, M.CONST_ENV, consts || {}), C0: M.CONST_ENV, cats: new Set(r.issues.map((i) => i.cat)), form, opts: opts || {} };
    };
    let n = 0;
    for (const exp of M.registry) (exp.tasks || []).forEach((t, i) => {
      n++;
      const d = t.demo || {}, form = d.form || exp.forms[0].id, name = exp.id + ' #' + (i + 1);
      if (!t.done(state(exp, form, d.vals, d.base, d.consts, d.opts))) bad.push(name + ': Beispiellösung erfüllt die Aufgabe nicht');
      if (t.done(state(exp, exp.forms[0].id, {}, {}, {}, {}))) bad.push(name + ': schon bei den Ausgangswerten erfüllt');
      for (const k in d.vals || {}) {
        const dv = exp.vars[k];
        if (!dv || dv.constant) continue;
        if (!(d.vals[k] >= dv.min && d.vals[k] <= dv.max)) bad.push(name + ': ' + k + ' = ' + d.vals[k] + ' liegt außerhalb des Regler-Bereichs');
      }
    });
    ok(n >= 30, 'nur ' + n + ' Aufgaben');
    ok(!bad.length, bad.join(' | '));
  });

  test('Aufgaben', 'Quellen: jedes Experiment hat Quellen, DOIs sind gültig geformt, englische Notizen ohne deutsche Reste', () => {
    if (!PP.sources) return;
    const bad = [];
    for (const exp of M.registry) {
      const list = PP.sources.byId[exp.id];
      if (!list || !list.length) { bad.push(exp.id + ': keine Quellen'); continue; }
      list.forEach((s) => {
        if (!s.who || !s.title || !s.where || !(s.year > 1600 && s.year < 2100)) bad.push(exp.id + ': unvollständig – ' + s.title);
        if (s.doi && !/^10\.\d{4,9}\/\S+$/.test(s.doi)) bad.push(exp.id + ': DOI ' + s.doi);
        if (s.url && !/^https:\/\//.test(s.url)) bad.push(exp.id + ': URL ' + s.url);
        if (!PP.sources.KIND[s.kind]) bad.push(exp.id + ': Art ' + s.kind);
        const en = I.with('en', () => s.note).replace(/Schrödinger|Göttingen/g, '');
        if (/[„äöüÄÖÜß]/.test(en) || /\b(und|der|die|das|nicht|mit)\b/.test(en)) bad.push(exp.id + ': ' + en);
      });
    }
    ok(!bad.length, bad.slice(0, 3).join(' | '));
  });

  /* --- Visualisierung: zeichnet nur, was die Engine liefert --- */
  // Zeichenkontext, der nur die geschriebenen Texte aufzeichnet
  function recCtx() {
    const texts = [], noop = () => {}, grad = { addColorStop: noop };
    const t = { texts, measureText: (x) => ({ width: String(x).length * 7 }), createRadialGradient: () => grad, createLinearGradient: () => grad, fillText: (x) => texts.push(String(x)) };
    return new Proxy(t, { get: (o, k) => (k in o ? o[k] : noop), set: (o, k, v) => { o[k] = v; return true; } });
  }
  const COL = { bg: '#000', panel: '#111', panel2: '#222', ink: '#eee', ink2: '#bbb', ink3: '#777', grid: '#333', accent: '#fa0', cyan: '#0cd', red: '#f55', green: '#5c5', violet: '#a8f', mono: 'monospace', sans: 'sans-serif' };
  const draw = (id, vals, o = {}) => {
    const exp = M.byId[id], form = o.form || exp.forms[0].id, ctx = recCtx();
    const S = PP.vizState({ exp, form, vals: Object.assign(M.defaults(exp), vals || {}), consts: {}, base: o.base ? Object.assign(M.defaults(exp), o.base) : null, baseLabel: 'Test', t: o.t || 1.3, opts: o.opts || {}, col: COL });
    PP.viz[exp.viz](ctx, o.W || 640, o.H || 330, S);
    return ctx.texts;
  };
  // Alle Einstellungen der Bedienelemente einer Visualisierung (Schalter: aus/an, Auswahl: jede Option)
  const optSets = (exp) => (exp.vizControls || []).reduce((sets, c) => sets.flatMap((o) => (c.options ? c.options.map((x) => x.v) : [false, true]).map((v) => Object.assign({}, o, { [c.key]: v }))), [{}]);
  const fmtOut = (r, k) => E.fmt({ s: r.out[k].s, l: r.out[k].l, d: r.out[k].value }, 3);
  test('Visualisierung', 'Alle Visualisierungen zeichnen Standardwerte und Presets ohne Fehler und ohne „NaN“', () => {
    if (!PP.viz || !PP.vizState) return;
    for (const exp of M.registry) {
      if (!exp.viz) continue;
      const cases = [{}].concat((exp.presets || []).map((p) => ({ vals: p.values, form: p.form })));
      for (const c of cases) for (const W of [640, 360]) for (const opts of optSets(exp)) {
        let texts;
        try { texts = draw(exp.id, c.vals, { form: c.form, W, H: W < 400 ? 260 : 330, base: c.vals, opts }); }
        catch (e) { throw new Error(exp.id + ' (' + W + ' px): ' + e.message); }
        const bad = texts.find((x) => /NaN|undefined|Infinity/.test(x));
        ok(!bad, exp.id + ': „' + bad + '“');
      }
    }
  });
  test('Visualisierung', 'β = 1: Die Visualisierung zeigt γ als nicht definiert statt einer Zahl', () => {
    if (!PP.viz) return;
    const texts = draw('special-rel', { beta: 1 });
    ok(texts.some((x) => /γ ist für \|β\| ≥ 1 nicht definiert/.test(x)), 'Hinweis fehlt');
    ok(!texts.some((x) => /^γ = /.test(x)), 'γ als Zahl gezeichnet');
  });
  test('Visualisierung', 'Schwarzes Loch: r_s, A, S_BH und T_H im Bild stammen aus der Engine, Exponenten 1, 2, 2, −1', () => {
    if (!PP.viz) return;
    const Msun = M.C.M_sun.value;
    const hk = run('hawking', { M: Msun }), be = run('bh-entropy', { M: Msun }, 'mass');
    for (const [id, form] of [['hawking'], ['bh-entropy', 'mass']]) {
      const texts = draw(id, { M: Msun }, { form });
      for (const want of [fmtOut(hk, 'rs') + ' m', fmtOut(be, 'A') + ' m²', fmtOut(be, 'S') + ' J/K', fmtOut(hk, 'TH') + ' K']) ok(texts.includes(want), id + ': ' + want + ' fehlt');
      ok(texts.filter((x) => x === '∝ M').length === 1 && texts.filter((x) => x === '∝ M²').length === 2 && texts.filter((x) => x === '∝ M⁻¹').length === 1, id + ': Exponenten ' + texts.filter((x) => x.startsWith('∝')).join(', '));
    }
  });
  test('Visualisierung', 'Gravitation: Die Faktoren im Bild zeigen F ∝ m₁m₂/r² (m₁ ×2, r ×½ → F ×8)', () => {
    if (!PP.viz) return;
    const texts = draw('newton-gravity', { m1: 2, m2: 1, r: 0.5 }, { base: { m1: 1, m2: 1, r: 1 } });
    const i = texts.indexOf('F / F₀');
    ok(i >= 0, 'Faktorzeile fehlt');
    const f = texts.filter((x) => /^×/.test(x));
    ok(f.join(' ') === '×8 ×2 ×1 ×4', f.join(' '));
  });
  test('Visualisierung', 'Feldgleichungen: Das Bild ist als schematische Projektion gekennzeichnet', () => {
    if (!PP.viz) return;
    for (const W of [640, 360]) ok(draw('efe', {}, { W }).some((x) => /Schematische Projektion \(Modell\)/.test(x)), W + ' px');
  });
  test('Visualisierung', 'Schrödinger: Ein nicht ganzzahliges n wird nicht als Welle gezeichnet', () => {
    if (!PP.viz) return;
    const texts = draw('schroedinger', { n: 2.5 });
    ok(texts.some((x) => /n muss eine positive ganze Zahl sein/.test(x)) && !texts.includes('|ψ|²'), texts.slice(0, 3).join(' | '));
  });

  test('Visualisierung', 'Planck-Einheiten: Jede Skala zeigt den Wert aus der Engine (l_P, t_P, m_P, T_P, E_P)', () => {
    if (!PP.viz) return;
    const r = run('planck');
    for (const [q, k, unit] of [['l', 'lP', 'm'], ['t', 'tP', 's'], ['m', 'mP', 'kg'], ['T', 'TP', 'K'], ['E', 'EP', 'J']]) {
      const texts = draw('planck', {}, { opts: { q } });
      ok(texts.includes(fmtOut(r, k) + ' ' + unit), q + ': ' + fmtOut(r, k) + ' ' + unit + ' fehlt');
    }
  });
  test('Visualisierung', 'Planck-Temperatur: k_B im Bild ist E_P / T_P = 1,380649 × 10⁻²³ J/K, mit zweiter Achse in eV', () => {
    if (!PP.viz) return;
    const texts = draw('planck', {}, { opts: { q: 'T' } });
    ok(texts.some((x) => x.startsWith('k_B = 1.380649 × 10⁻²³ J/K')), texts.find((x) => x.startsWith('k_B')) || 'k_B-Zeile fehlt');
    ok(texts.includes('k_B T in eV'), 'zweite Achse fehlt');
  });

  /* --- Sprache --- */
  test('Sprache', 'Engine-Meldungen und Dimensionsnamen gibt es auf Deutsch und Englisch', () => {
    const msg = () => E.evaluate(E.parse('1/0'), {}).issues[0].msg;
    ok(/Division durch 0/.test(I.with('de', msg)), I.with('de', msg));
    ok(/Division by 0/.test(I.with('en', msg)), I.with('en', msg));
    const force = () => E.dimInfo(D('M L T^-2')).name;
    ok(I.with('de', force) === 'Kraft' && I.with('en', force) === 'force', 'Dimensionsname');
    ok(I.with('en', () => E.BASE_NAMES[1]) === 'length', 'Basisgröße');
  });
  test('Sprache', 'Umschalten wirkt auch auf die kompilierten Kopien der Experimente', () => {
    const f = M.byId['newton-gravity'].forms[0];
    ok(I.with('de', () => f.c.outputs[0].name) === 'Gravitationskraft (Betrag)', 'de');
    ok(I.with('en', () => f.c.outputs[0].name) === 'Gravitational force (magnitude)', 'en');
    ok(I.with('en', () => f.c.equations[0].label) === 'Newton’s law of gravitation', 'Gleichung');
    ok(I.with('en', () => M.byId.hawking.forms[0].c.autoEq[0].label) === 'Hawking temperature', 'autoEq');
  });
  test('Sprache', 'Keine deutschen Reste in den englischen Texten der Experimente und Konstanten', () => {
    // „ und Umlaute verraten deutsche Texte; Eigennamen dürfen sie behalten
    const german = /[„äöüÄÖÜß]/, names = /Schrödinger|Eötvös|Göttingen/g;
    const skip = new Set(['ast', 'lhs', 'rhs', 'symDims', 'dimv', 'values', 'checks']);
    const bad = [], seen = new WeakSet();
    const walk = (o, path) => {
      if (!o || typeof o !== 'object' || seen.has(o)) return;
      seen.add(o);
      for (const k of Object.keys(o)) {
        if (skip.has(k)) continue;
        const v = o[k];
        if (typeof v === 'string') { if (german.test(v.replace(names, ''))) bad.push(path + '.' + k + ': ' + v.slice(0, 60)); }
        else walk(v, path + '.' + k);
      }
    };
    I.with('en', () => { M.registry.forEach((e) => walk(e, e.id)); walk(M.C, 'C'); walk(M.KIND_LABEL, 'KIND_LABEL'); });
    ok(!bad.length, bad.slice(0, 3).join(' | '));
  });
  test('Sprache', 'Keine deutschen Reste in den englischen Beschriftungen der Visualisierungen', () => {
    if (!PP.viz) return;
    const german = /[„äöüÄÖÜß]|\b(und|der|die|das|nicht|mit|ist|bei|oder|Abstand|Bezug|Zeit|Kraft|Anzeige|Punkte)\b/;
    const bad = [];
    I.with('en', () => {
      for (const exp of M.registry) {
        if (!exp.viz) continue;
        for (const c of [{}].concat((exp.presets || []).map((p) => ({ vals: p.values, form: p.form })))) for (const W of [640, 360]) for (const opts of optSets(exp)) {
          draw(exp.id, c.vals, { form: c.form, W, base: c.vals, opts }).forEach((x) => { if (german.test(x)) bad.push(exp.id + ': ' + x); });
        }
      }
      draw('special-rel', { beta: 1 }).concat(draw('free-fall', { t: 9 }), draw('schroedinger', { n: 2.5 })).forEach((x) => { if (german.test(x)) bad.push(x); });
    });
    ok(!bad.length, [...new Set(bad)].slice(0, 3).join(' | '));
  });
  test('Sprache', 'Jeder Test hat einen englischen Namen', () => {
    const has = (k) => Object.prototype.hasOwnProperty.call(EN, k);
    const missing = T.map((t) => I.with('de', () => [t.group, t.name])).filter(([g, n]) => !has(g) || !has(n)).map(([, n]) => n);
    ok(!missing.length, missing.join(' | '));
  });

  // Die Prüfungen laufen auf Deutsch (sie vergleichen deutsche Meldungen); Namen erscheinen in der aktiven Sprache
  function runAll() {
    const errs = I.with('de', () => T.map((t) => { try { t.fn(); return null; } catch (e) { return e.message; } }));
    return T.map((t, i) => ({ group: t.group, name: t.name, pass: errs[i] === null, err: errs[i] || undefined }));
  }
  PP.tests = { list: T, runAll };
})(globalThis.PP = globalThis.PP || {});
