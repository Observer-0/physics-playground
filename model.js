/* =====================================================================
   Physics Playground — Constants registry + experiment model layer
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine;

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
  const C = Object.assign(Object.create(null), {
    c:      { tex: 'c', name: 'Lichtgeschwindigkeit im Vakuum', value: 299792458, dim: 'L T^-1', kind: 'exact', u: 0, src: 'SI-Definition (2019), CODATA 2022' },
    h:      { tex: 'h', name: 'Planck-Konstante', value: h, dim: 'M L^2 T^-1', kind: 'exact', u: 0, src: 'SI-Definition (2019), CODATA 2022' },
    hbar:   { tex: '\\hbar', name: 'Reduzierte Planck-Konstante ħ = h/2π', value: h / (2 * Math.PI), dim: 'M L^2 T^-1', kind: 'exact', u: 0, src: 'abgeleitet aus h (exakt)' },
    k_B:    { tex: 'k_{\\mathrm{B}}', name: 'Boltzmann-Konstante', value: 1.380649e-23, dim: 'M L^2 T^-2 Θ^-1', kind: 'exact', u: 0, src: 'SI-Definition (2019), CODATA 2022' },
    e:      { tex: 'e', name: 'Elementarladung', value: 1.602176634e-19, dim: 'I T', kind: 'exact', u: 0, src: 'SI-Definition (2019), CODATA 2022' },
    N_A:    { tex: 'N_{\\mathrm{A}}', name: 'Avogadro-Konstante', value: 6.02214076e23, dim: 'N^-1', kind: 'exact', u: 0, src: 'SI-Definition (2019), CODATA 2022' },
    G:      { tex: 'G', name: 'Gravitationskonstante', value: G, dim: 'L^3 M^-1 T^-2', kind: 'measured', u: 0.00015e-11, src: 'CODATA 2022 (Wert unverändert seit 2018)' },
    eps0:   { tex: '\\varepsilon_0', name: 'Elektrische Feldkonstante', value: 8.8541878188e-12, dim: 'M^-1 L^-3 T^4 I^2', kind: 'measured', u: 0.0000000014e-12, src: 'CODATA 2022 (seit 2019 Messgröße)' },
    mu0:    { tex: '\\mu_0', name: 'Magnetische Feldkonstante', value: 1.25663706127e-6, dim: 'M L T^-2 I^-2', kind: 'measured', u: 0.00000000020e-6, src: 'CODATA 2022 (seit 2019 Messgröße)' },
    m_e:    { tex: 'm_e', name: 'Elektronenmasse', value: 9.1093837139e-31, dim: 'M', kind: 'measured', u: 0.0000000028e-31, src: 'CODATA 2022' },
    m_p:    { tex: 'm_p', name: 'Protonenmasse', value: 1.67262192595e-27, dim: 'M', kind: 'measured', u: 0.00000000052e-27, src: 'CODATA 2022' },
    eV:     { tex: '\\mathrm{eV}', name: 'Elektronvolt (in Joule)', value: 1.602176634e-19, dim: 'M L^2 T^-2', kind: 'exact', u: 0, src: 'folgt exakt aus e' },
    g_n:    { tex: 'g_n', name: 'Normfallbeschleunigung', value: 9.80665, dim: 'L T^-2', kind: 'convention', u: 0, src: 'Konvention (3. CGPM 1901); lokales g variiert ca. 9,78–9,83 m/s²' },
    au:     { tex: '\\mathrm{au}', name: 'Astronomische Einheit', value: 149597870700, dim: 'L', kind: 'convention', u: 0, src: 'IAU 2012, exakt definiert' },
    M_sun:  { tex: 'M_\\odot', name: 'Sonnenmasse', value: 1.3271244e20 / G, dim: 'M', kind: 'astro', u: 1.3271244e20 / G * 2.2e-5, src: 'IAU 2015 nominal GM☉ / G; Unsicherheit dominiert von G' },
    M_earth:{ tex: 'M_\\oplus', name: 'Erdmasse', value: 3.986004e14 / G, dim: 'M', kind: 'astro', u: 3.986004e14 / G * 2.2e-5, src: 'IAU 2015 nominal GM⊕ / G' },
    M_moon: { tex: 'M_{☾}', name: 'Mondmasse', value: 7.346e22, dim: 'M', kind: 'astro', u: 0.001e22, src: 'NASA Moon Fact Sheet (≈)' },
    R_earth:{ tex: 'R_\\oplus', name: 'Mittlerer Erdradius', value: 6.371e6, dim: 'L', kind: 'astro', u: 0, src: 'mittlerer Radius (≈); Erde ist abgeplattet' },
    d_moon: { tex: 'd_{☾}', name: 'Große Halbachse der Mondbahn', value: 3.844e8, dim: 'L', kind: 'astro', u: 0, src: 'NASA Moon Fact Sheet (≈); Abstand schwankt ca. 356 000–407 000 km' },
    Lambda: { tex: '\\Lambda', name: 'Kosmologische Konstante', value: 1.1e-52, dim: 'L^-2', kind: 'cosmo', u: 0, src: 'Planck 2018 (ΛCDM), ≈ – modellabhängig' },
    T_cmb:  { tex: 'T_{\\mathrm{CMB}}', name: 'Temperatur der kosmischen Hintergrundstrahlung', value: 2.7255, dim: 'Θ', kind: 'measured', u: 0.0006, src: 'Fixsen 2009 (COBE/FIRAS)' },
    pi:     { tex: '\\pi', name: 'Kreiszahl', value: Math.PI, dim: '', kind: 'math', u: 0, src: 'Mathematik' },
  });
  for (const k in C) C[k].dimv = E.dimParse(C[k].dim);
  const CONST_ENV = Object.assign(Object.create(null), Object.fromEntries(Object.entries(C).map(([k, v]) => [k, v.value])));
  const KIND_LABEL = { exact: 'exakt (SI)', measured: 'gemessen', convention: 'Konvention', astro: 'astronomisch, ≈', cosmo: 'modellabhängig, ≈', math: 'mathematisch' };

  /* ---------- Experiment model ---------- */
  const registry = [];
  const byId = Object.create(null);
  function define(exp) {
    registry.push(exp);
    byId[exp.id] = exp;
    compile(exp);
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
        issues.push({ cat: 'math', msg: 'Eingabe für ' + v.label + ' ist keine Zahl' });
        env[v.key] = NaN;
      } else if (!isFinite(x)) {
        issues.push({ cat: 'numeric', msg: v.label + ' ist unendlich – nicht auswertbar' });
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
          issues.push({ cat: 'unreal', msg: C[k].name + ' (' + k + ') ist verändert (Faktor ' + E.fmt(consts[k] / ref, 3) + '). Mathematisch möglich – so ist unser Universum aber nicht.' });
        }
      }
      // Modified constants → physically unrealistic
      for (const v of form.c.vars) {
        if (v.constant) {
          const ref = C[v.constant].value;
          const x = values[v.key];
          if (isFinite(x) && Math.abs(x / ref - 1) > 1e-9) {
            issues.push({ cat: 'unreal', msg: v.label + ' weicht vom ' + (C[v.constant].kind === 'measured' ? 'gemessenen' : 'festgelegten') + ' Wert ab (Faktor ' + E.fmt(x / ref, 3) + '). Mathematisch möglich – so ist unser Universum aber nicht.' });
          }
        }
        if (v.positive && values[v.key] <= 0) {
          issues.push({ cat: 'unreal', msg: v.label + ' ≤ 0: ' + (v.negNote || 'für diese Größe physikalisch nicht sinnvoll.') });
        }
      }
      if (exp.checks) {
        const val = (k) => (out[k] && out[k].ok ? E.toDouble(out[k]) : NaN);
        try { exp.checks({ v: values, o: val, out, C: Object.assign({}, CONST_ENV, consts), issues, fmt: E.fmt }); }
        catch (e) { issues.push({ cat: 'numeric', msg: 'Prüfung fehlgeschlagen: ' + e.message }); }
      }
    }
    return { out, issues, form };
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

  PP.model = { C, CONST_ENV, KIND_LABEL, registry, byId, define, compute, defaults, uncertainty, formOf };
})(globalThis.PP = globalThis.PP || {});
