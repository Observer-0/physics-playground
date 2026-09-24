/* =====================================================================
   Physics Playground — Constants registry + experiment model layer
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine;
  const I = PP.i18n, T = I.T;

  /* ---------- Constants registry ----------
     kind: 'exact'      – exakt per SI-Definition (seit 2019)
           'measured'   – gemessen, mit Standardunsicherheit u (CODATA)
           'convention' – per Konvention festgelegt, keine Naturkonstante
           'astro'      – astronomischer Referenzwert, näherungsweise
           'cosmo'      – modellabhängiger kosmologischer Parameter
  */
  const h = 6.62607015e-34;
  const G = 6.67430e-11;
  // Objekte ohne Prototyp: Nachschlagen per Name findet nur echte Einträge (kein „constructor“ o. Ä.)
  const SI19 = { de: 'SI-Definition (2019), CODATA 2022', en: 'SI definition (2019), CODATA 2022' };
  const C = I.localize(Object.assign(Object.create(null), {
    c:      { tex: 'c', name: { de: 'Lichtgeschwindigkeit im Vakuum', en: 'Speed of light in vacuum' }, value: 299792458, dim: 'L T^-1', kind: 'exact', u: 0, src: SI19 },
    h:      { tex: 'h', name: { de: 'Planck-Konstante', en: 'Planck constant' }, value: h, dim: 'M L^2 T^-1', kind: 'exact', u: 0, src: SI19 },
    hbar:   { tex: '\\hbar', name: { de: 'Reduzierte Planck-Konstante ħ = h/2π', en: 'Reduced Planck constant ħ = h/2π' }, value: h / (2 * Math.PI), dim: 'M L^2 T^-1', kind: 'exact', u: 0, src: { de: 'abgeleitet aus h (exakt)', en: 'derived from h (exact)' } },
    k_B:    { tex: 'k_{\\mathrm{B}}', name: { de: 'Boltzmann-Konstante', en: 'Boltzmann constant' }, value: 1.380649e-23, dim: 'M L^2 T^-2 Θ^-1', kind: 'exact', u: 0, src: SI19 },
    e:      { tex: 'e', name: { de: 'Elementarladung', en: 'Elementary charge' }, value: 1.602176634e-19, dim: 'I T', kind: 'exact', u: 0, src: SI19 },
    N_A:    { tex: 'N_{\\mathrm{A}}', name: { de: 'Avogadro-Konstante', en: 'Avogadro constant' }, value: 6.02214076e23, dim: 'N^-1', kind: 'exact', u: 0, src: SI19 },
    G:      { tex: 'G', name: { de: 'Gravitationskonstante', en: 'Gravitational constant' }, value: G, dim: 'L^3 M^-1 T^-2', kind: 'measured', u: 0.00015e-11, src: { de: 'CODATA 2022 (Wert unverändert seit 2018)', en: 'CODATA 2022 (value unchanged since 2018)' } },
    eps0:   { tex: '\\varepsilon_0', name: { de: 'Elektrische Feldkonstante', en: 'Vacuum electric permittivity' }, value: 8.8541878188e-12, dim: 'M^-1 L^-3 T^4 I^2', kind: 'measured', u: 0.0000000014e-12, src: { de: 'CODATA 2022 (seit 2019 Messgröße)', en: 'CODATA 2022 (a measured quantity since 2019)' } },
    mu0:    { tex: '\\mu_0', name: { de: 'Magnetische Feldkonstante', en: 'Vacuum magnetic permeability' }, value: 1.25663706127e-6, dim: 'M L T^-2 I^-2', kind: 'measured', u: 0.00000000020e-6, src: { de: 'CODATA 2022 (seit 2019 Messgröße)', en: 'CODATA 2022 (a measured quantity since 2019)' } },
    m_e:    { tex: 'm_e', name: { de: 'Elektronenmasse', en: 'Electron mass' }, value: 9.1093837139e-31, dim: 'M', kind: 'measured', u: 0.0000000028e-31, src: 'CODATA 2022' },
    m_p:    { tex: 'm_p', name: { de: 'Protonenmasse', en: 'Proton mass' }, value: 1.67262192595e-27, dim: 'M', kind: 'measured', u: 0.00000000052e-27, src: 'CODATA 2022' },
    eV:     { tex: '\\mathrm{eV}', name: { de: 'Elektronvolt (in Joule)', en: 'Electronvolt (in joules)' }, value: 1.602176634e-19, dim: 'M L^2 T^-2', kind: 'exact', u: 0, src: { de: 'folgt exakt aus e', en: 'follows exactly from e' } },
    g_n:    { tex: 'g_n', name: { de: 'Normfallbeschleunigung', en: 'Standard acceleration of gravity' }, value: 9.80665, dim: 'L T^-2', kind: 'convention', u: 0, src: { de: 'Konvention (3. CGPM 1901); lokales g variiert ca. 9,78–9,83 m/s²', en: 'Convention (3rd CGPM 1901); local g varies roughly 9.78–9.83 m/s²' } },
    au:     { tex: '\\mathrm{au}', name: { de: 'Astronomische Einheit', en: 'Astronomical unit' }, value: 149597870700, dim: 'L', kind: 'convention', u: 0, src: { de: 'IAU 2012, exakt definiert', en: 'IAU 2012, exactly defined' } },
    M_sun:  { tex: 'M_\\odot', name: { de: 'Sonnenmasse', en: 'Solar mass' }, value: 1.3271244e20 / G, dim: 'M', kind: 'astro', u: 1.3271244e20 / G * 2.2e-5, src: { de: 'IAU 2015 nominal GM☉ / G; Unsicherheit dominiert von G', en: 'IAU 2015 nominal GM☉ / G; uncertainty dominated by G' } },
    M_earth:{ tex: 'M_\\oplus', name: { de: 'Erdmasse', en: 'Earth mass' }, value: 3.986004e14 / G, dim: 'M', kind: 'astro', u: 3.986004e14 / G * 2.2e-5, src: 'IAU 2015 nominal GM⊕ / G' },
    M_moon: { tex: 'M_{☾}', name: { de: 'Mondmasse', en: 'Moon mass' }, value: 7.346e22, dim: 'M', kind: 'astro', u: 0.001e22, src: 'NASA Moon Fact Sheet (≈)' },
    R_earth:{ tex: 'R_\\oplus', name: { de: 'Mittlerer Erdradius', en: 'Mean Earth radius' }, value: 6.371e6, dim: 'L', kind: 'astro', u: 0, src: { de: 'mittlerer Radius (≈); Erde ist abgeplattet', en: 'mean radius (≈); the Earth is flattened' } },
    d_moon: { tex: 'd_{☾}', name: { de: 'Große Halbachse der Mondbahn', en: 'Semi-major axis of the Moon’s orbit' }, value: 3.844e8, dim: 'L', kind: 'astro', u: 0, src: { de: 'NASA Moon Fact Sheet (≈); Abstand schwankt ca. 356 000–407 000 km', en: 'NASA Moon Fact Sheet (≈); the distance varies roughly 356,000–407,000 km' } },
    Lambda: { tex: '\\Lambda', name: { de: 'Kosmologische Konstante', en: 'Cosmological constant' }, value: 1.1e-52, dim: 'L^-2', kind: 'cosmo', u: 0, src: { de: 'Planck 2018 (ΛCDM), ≈ – modellabhängig', en: 'Planck 2018 (ΛCDM), ≈ – model-dependent' } },
    T_cmb:  { tex: 'T_{\\mathrm{CMB}}', name: { de: 'Temperatur der kosmischen Hintergrundstrahlung', en: 'Temperature of the cosmic microwave background' }, value: 2.7255, dim: 'Θ', kind: 'measured', u: 0.0006, src: 'Fixsen 2009 (COBE/FIRAS)' },
    pi:     { tex: '\\pi', name: { de: 'Kreiszahl', en: 'Pi' }, value: Math.PI, dim: '', kind: 'math', u: 0, src: { de: 'Mathematik', en: 'Mathematics' } },
  }));
  for (const k in C) C[k].dimv = E.dimParse(C[k].dim);
  const CONST_ENV = Object.assign(Object.create(null), Object.fromEntries(Object.entries(C).map(([k, v]) => [k, v.value])));
  const KIND_LABEL = I.localize({
    exact: { de: 'exakt (SI)', en: 'exact (SI)' }, measured: { de: 'gemessen', en: 'measured' }, convention: { de: 'Konvention', en: 'convention' },
    astro: { de: 'astronomisch, ≈', en: 'astronomical, ≈' }, cosmo: { de: 'modellabhängig, ≈', en: 'model-dependent, ≈' }, math: { de: 'mathematisch', en: 'mathematical' },
  });

  /* ---------- Experiment model ---------- */
  const registry = [];
  const byId = Object.create(null);
  function define(exp) {
    registry.push(exp);
    byId[exp.id] = exp;
    compile(exp);
    // Erst nach compile(): compile kopiert Ausgaben und Gleichungen, die Kopien sollen ebenfalls umschalten
    I.localize(exp);
    return exp;
  }

  function compileForm(exp, form) {
    const vars = form.vars.map((k) => exp.vars[k]);
    const symDims = {};
    for (const k in C) symDims[k] = C[k].dimv;
    for (const k in exp.vars) exp.vars[k].dimv = E.dimParse(exp.vars[k].dim);
    for (const v of vars) symDims[v.key] = v.dimv;
    for (const k in exp.symbols || {}) symDims[k] = E.dimParse(exp.symbols[k].dim);
    const outputs = form.outputs.map((o) => {
      const ast = E.parse(o.expr);
      const dimv = E.dimParse(o.dim);
      const out = Object.assign({}, o, { ast, dimv });
      symDims[o.key] = dimv;
      return out;
    });
    const equations = (form.equations || []).map((q) => {
      const src = q.eq;
      const parsed = E.parseEquation(src);
      return Object.assign({}, q, parsed);
    });
    // Every output formula is also dimension-checked against its declared dimension
    const autoEq = outputs.filter((o) => !o.noEq).map((o) => ({
      label: o.name, lhs: { type: 'var', name: o.key, span: [0, 0], id: -1 }, rhs: o.ast, auto: true,
    }));
    form.c = { vars, outputs, symDims, equations: equations.concat(equations.length ? [] : autoEq), autoEq };
  }
  function compile(exp) {
    for (const k in exp.vars) exp.vars[k].key = k;
    if (!exp.forms) exp.forms = [{ id: 'main', label: '', vars: Object.keys(exp.vars), outputs: exp.outputs, equations: exp.equations }];
    for (const f of exp.forms) compileForm(exp, f);
  }
  const formOf = (exp, id) => exp.forms.find((f) => f.id === id) || exp.forms[0];

  function defaults(exp) {
    const v = {};
    for (const k in exp.vars) {
      const d = exp.vars[k];
      v[k] = d.constant ? C[d.constant].value : d.default;
    }
    return v;
  }

  // Compute all outputs for a value set. Never throws.
  function compute(exp, formId, values, opts = {}) {
    const form = formOf(exp, formId);
    const consts = opts.consts || {};
    const env = Object.assign({}, CONST_ENV, consts);
    const issues = [];
    for (const v of form.c.vars) {
      const x = values[v.key];
      if (typeof x !== 'number' || Number.isNaN(x)) {
        issues.push({ cat: 'math', msg: T('Eingabe für ' + v.label + ' ist keine Zahl', 'The input for ' + v.label + ' is not a number') });
        env[v.key] = NaN;
      } else if (!isFinite(x)) {
        issues.push({ cat: 'numeric', msg: v.label + T(' ist unendlich – nicht auswertbar', ' is infinite – cannot be evaluated') });
        env[v.key] = NaN;
      } else env[v.key] = x;
    }
    const out = {};
    for (const o of form.c.outputs) {
      let r;
      const bad = [...E.symbolsIn(o.ast)].some((s) => typeof env[s] === 'number' && Number.isNaN(env[s]));
      if (bad) r = { ok: false, s: 0, l: NaN, value: NaN, representable: false, issues: [] };
      else r = E.evaluate(o.ast, env);
      r.issues.forEach((i) => issues.push(Object.assign({ out: o.key }, i, { msg: o.sym + ': ' + i.msg })));
      out[o.key] = r;
      // chain: later outputs may use earlier ones. Unrepresentable → NaN (blocks dependents cleanly)
      env[o.key] = r.ok && r.representable ? r.value : (r.ok ? { s: r.s, l: r.l, d: NaN } : NaN);
    }
    // Object-valued env entries (log-domain) are accepted by the engine
    if (!opts.skipChecks) {
      // Overridden constants (Break-the-Physics) → physically unrealistic
      for (const k in consts) {
        const ref = C[k] && C[k].value;
        if (ref && isFinite(consts[k]) && Math.abs(consts[k] / ref - 1) > 1e-9) {
          issues.push({ cat: 'unreal', why: T('Konstante verändert', 'constant changed'), msg: C[k].name + ' (' + k + ')' + T(' ist verändert (Faktor ', ' has been changed (factor ') + E.fmt(consts[k] / ref, 3) + T('). Mathematisch möglich – so ist unser Universum aber nicht.', '). Mathematically possible – but that is not our universe.') });
        }
      }
      // Modified constants → physically unrealistic
      for (const v of form.c.vars) {
        if (v.constant) {
          const ref = C[v.constant].value;
          const x = values[v.key];
          if (isFinite(x) && Math.abs(x / ref - 1) > 1e-9) {
            issues.push({ cat: 'unreal', why: T('Konstante verändert', 'constant changed'), msg: v.label + T(' weicht vom ' + (C[v.constant].kind === 'measured' ? 'gemessenen' : 'festgelegten') + ' Wert ab (Faktor ', ' differs from the ' + (C[v.constant].kind === 'measured' ? 'measured' : 'defined') + ' value (factor ') + E.fmt(x / ref, 3) + T('). Mathematisch möglich – so ist unser Universum aber nicht.', '). Mathematically possible – but that is not our universe.') });
          }
        }
        if (v.positive && values[v.key] <= 0) {
          issues.push({ cat: 'unreal', why: v.label + ' ≤ 0', on: [v.key], msg: v.label + ' ≤ 0: ' + (v.negNote || T('für diese Größe physikalisch nicht sinnvoll.', 'not physically meaningful for this quantity.')) });
        }
      }
      if (exp.checks) {
        const val = (k) => (out[k] && out[k].ok ? E.toDouble(out[k]) : NaN);
        try { exp.checks({ v: values, o: val, out, C: Object.assign({}, CONST_ENV, consts), issues, fmt: E.fmt }); }
        catch (e) { issues.push({ cat: 'numeric', msg: T('Prüfung fehlgeschlagen: ', 'Check failed: ') + e.message }); }
      }
    }
    return { out, issues, form };
  }

  /* Welche Ausgaben betrifft eine Warnung? Ein Engine-Fehler (out) seine Ausgabe und alles, was davon
     abhängt; ein Check mit `on` alle Ausgaben, die (auch über frühere Ausgaben) von diesen Symbolen abhängen;
     alle anderen Warnungen betreffen alles. Beispiel: „nach der Landung“ (on: t) betrifft y(t), aber nicht R. */
  function depsOf(form) {
    if (form.c.deps) return form.c.deps;
    const d = Object.create(null);
    for (const o of form.c.outputs) {
      const s = new Set();
      E.symbolsIn(o.ast).forEach((x) => { s.add(x); if (d[x]) d[x].forEach((y) => s.add(y)); });
      d[o.key] = s;
    }
    return (form.c.deps = d);
  }
  function affects(form, issue, key) {
    const syms = issue.out ? [issue.out] : issue.on;
    if (!syms) return true;
    const d = depsOf(form)[key];
    return syms.some((s) => s === key || (d && d.has(s)));
  }

  // Relative uncertainty contributed by measured constants (power-law sensitivity)
  function uncertainty(exp, formId, values, outKey) {
    const form = formOf(exp, formId);
    const o = form.c.outputs.find((x) => x.key === outKey);
    const base = compute(exp, formId, values, { skipChecks: true }).out[outKey];
    if (!base || !base.ok || base.s === 0) return null;
    const used = new Set();
    // constants may enter directly or via earlier outputs
    const collect = (ast) => E.symbolsIn(ast).forEach((s) => {
      if (C[s]) used.add(s);
      const prev = form.c.outputs.find((x) => x.key === s);
      if (prev && prev !== o) collect(prev.ast);
      const v = form.c.vars.find((x) => x.key === s);
      if (v && v.constant && Math.abs(values[s] / C[v.constant].value - 1) < 1e-9) used.add('var:' + s);
    });
    collect(o.ast);
    let sum = 0;
    const parts = [];
    for (const u of used) {
      const isVar = u.startsWith('var:');
      const key = isVar ? u.slice(4) : u;
      const cst = isVar ? C[form.c.vars.find((x) => x.key === key).constant] : C[key];
      if (!cst.u || (cst.kind !== 'measured')) continue;
      const rel = cst.u / cst.value;
      const delta = 1e-6;
      let l2;
      if (isVar) {
        l2 = compute(exp, formId, Object.assign({}, values, { [key]: values[key] * (1 + delta) }), { skipChecks: true }).out[outKey];
      } else {
        const saved = CONST_ENV[key];
        CONST_ENV[key] = saved * (1 + delta);
        try { l2 = compute(exp, formId, values, { skipChecks: true }).out[outKey]; }
        finally { CONST_ENV[key] = saved; }
      }
      if (!l2 || !l2.ok) continue;
      const sens = (l2.l - base.l) / Math.log10(1 + delta);
      if (Math.abs(sens) < 1e-6) continue;
      sum += (sens * rel) ** 2;
      parts.push({ key, sens, rel });
    }
    return parts.length ? { rel: Math.sqrt(sum), parts } : { rel: 0, parts: [] };
  }

  PP.model = { C, CONST_ENV, KIND_LABEL, registry, byId, define, compute, defaults, uncertainty, formOf, affects };
})(globalThis.PP = globalThis.PP || {});
