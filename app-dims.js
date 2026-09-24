/* =====================================================================
   Physics Playground — explanation layers, dimension analysis
   (normal + Nightmare Mode), custom / wrong equation mode.
   Every famous equation goes through exactly this generic code.
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine, M = PP.model, U = PP.ui;
  const S = U.S;
  const { $, $$, esc } = U;

  const EP_LABEL = { math: 'Mathematische Aussage', model: 'Physikalisches Modell', approx: 'Näherung', measured: 'Empirisch / gemessen', assume: 'Theoretische Annahme' };
  const form = () => M.formOf(S.exp, S.form);

  /* ---------- symbol context (tex, names, dims) ---------- */
  function ctxOfForm(exp, f) {
    const texMap = {}, names = {};
    for (const k in M.C) { texMap[k] = M.C[k].tex; names[k] = M.C[k].name; }
    for (const k in exp.vars) { texMap[k] = exp.vars[k].tex; names[k] = exp.vars[k].name; }
    for (const k in exp.symbols || {}) { if (exp.symbols[k].name) names[k] = exp.symbols[k].name; }
    for (const o of f.c.outputs) { texMap[o.key] = o.tex; names[o.key] = o.name; }
    return { texMap, names, symDims: f.c.symDims };
  }

  /* ---------- level docs ---------- */
  function lvl(k, sub, body) {
    return '<div class="lvl"><div class="lk"><b>' + k + '</b>' + (sub || '') + '</div><div>' + body + '</div></div>';
  }
  function formulaDoc() {
    const exp = S.exp, f = form(), ex = exp.explain || {};
    const cx = ctxOfForm(exp, f);
    let h = '';
    h += lvl('Intuition', 'Ebene 1', '<div class="prose"><p>' + esc(ex.intuition || '') + '</p></div>');
    h += lvl('Mathematik', 'Ebene 2', '<div class="steps">' + (ex.math || []).map((s) => '<div class="step"><div class="d">' + esc(s.t) + '</div><div>' + U.tex(s.tex) + '</div></div>').join('') + '</div>');
    // variables & constants
    const used = new Set();
    f.c.outputs.forEach((o) => E.symbolsIn(o.ast).forEach((s) => used.add(s)));
    const rows = [];
    f.c.vars.forEach((v) => rows.push('<tr><td>' + U.tex(v.tex) + '</td><td>' + esc(v.name) + '</td><td>' + U.tex(E.dimTex(v.dimv)) + '</td><td class="mono">' + esc(U.unit(v.dimv) || '1') + '</td><td>' +
      (v.constant ? '<span class="tag ' + M.C[v.constant].kind + '">' + esc(M.KIND_LABEL[M.C[v.constant].kind]) + '</span> <span class="faint">' + esc(M.C[v.constant].src) + '</span>' : '<span class="faint">frei wählbar · ' + (v.scale === 'log' ? 'log. Regler' : 'lin. Regler') + '</span>') + '</td></tr>'));
    [...used].filter((s) => M.C[s] && !f.c.vars.some((v) => v.key === s)).forEach((s) => {
      const c = M.C[s];
      rows.push('<tr><td>' + U.tex(c.tex) + '</td><td>' + esc(c.name) + '</td><td>' + U.tex(E.dimTex(c.dimv)) + '</td><td class="mono">' + esc(U.unit(c.dimv) || '1') + '</td><td><span class="tag ' + c.kind + '">' + esc(M.KIND_LABEL[c.kind]) + '</span> <span class="faint">' + esc(c.src) + '</span></td></tr>');
    });
    h += lvl('Größen', 'Eingaben &amp; Konstanten', '<div class="scroll-x"><table class="t"><thead><tr><th>Symbol</th><th>Bedeutung</th><th>Dimension</th><th>SI-Einheit</th><th>Herkunft</th></tr></thead><tbody>' + rows.join('') + '</tbody></table></div>');
    h += lvl('Berechnet', 'aus der Formel-Engine', '<div class="scroll-x"><table class="t"><thead><tr><th>Größe</th><th>Formel, wie die Engine sie liest</th><th>Einheit</th><th>Bedeutung</th></tr></thead><tbody>' +
      f.c.outputs.map((o) => '<tr><td>' + U.tex(o.tex) + '</td><td>' + U.tex(E.toTex(o.ast, cx.texMap)) + '</td><td class="mono">' + esc(U.unit(o.dimv) || '1') + '</td><td>' + esc(o.name) + (o.note ? '<br><span class="faint">' + esc(o.note) + '</span>' : '') + '</td></tr>').join('') +
      '</tbody></table></div>');
    return h;
  }
  function physicsDoc() {
    const exp = S.exp, ex = exp.explain || {};
    let h = lvl('Physik', 'Ebene 3', '<div class="prose"><p>' + esc(ex.physics || '') + '</p></div>');
    h += lvl('Einordnung', 'Was ist was?', '<ul class="ep">' + (ex.epistemics || []).map((e) => '<li><span class="tag ' + e.type + '">' + EP_LABEL[e.type] + '</span><span>' + esc(e.text) + '</span></li>').join('') + '</ul>');
    const iss = (S.res.A ? S.res.A.issues : []).filter((i) => i.cat === 'assume' || i.cat === 'model');
    if (iss.length) h += lvl('Aktuell', 'für die eingestellten Werte', '<ul class="issues">' + iss.map((i) => '<li class="' + i.cat + '"><b>' + U.lab.CAT[i.cat] + '</b>' + esc(i.msg) + '</li>').join('') + '</ul>');
    if (exp.meta) {
      const m = exp.meta;
      h += lvl('Steckbrief', '', '<table class="t"><tbody><tr><td class="faint">Mathematischer Typ</td><td>' + esc(m.mathType) + '</td></tr><tr><td class="faint">Hauptdimension</td><td>' + esc(m.mainDim) + '</td></tr><tr><td class="faint">Gebiet</td><td>' + esc(m.domain) + '</td></tr></tbody></table>');
    }
    return h;
  }

  /* ---------- dimension analysis of one side ---------- */
  function powTex(base, p) {
    const s = E.rStr(p);
    return s === '1' ? base : '{' + base + '}^{' + s + '}';
  }
  function factorTex(node, cx) {
    if (node.type === 'var') return E.symTex(node.name, cx.texMap);
    const t = E.toTex(node, cx.texMap);
    return node.type === 'call' ? t : '\\left(' + t + '\\right)';
  }
  function analyzeTerm(node, cx) {
    const ff = E.flattenFactors(node);
    const facs = ff.factors.map((f) => {
      const an = E.dimAnalyze(f.node, cx.symDims);
      const absP = E.rval(f.pow) < 0 ? E.R(-f.pow.n, f.pow.d) : f.pow;
      return {
        node: f.node, pow: f.pow, absP, den: E.rval(f.pow) < 0, base: an.dim, errors: an.errors,
        dim: E.dimPow(an.dim, f.pow), tex: factorTex(f.node, cx),
        name: f.node.type === 'var' ? (cx.names[f.node.name] || '') : '',
        known: f.node.type !== 'var' || !!cx.symDims[f.node.name],
      };
    });
    const an = E.dimAnalyze(node, cx.symDims);
    return { node, facs, numeric: ff.numeric, negative: !!ff.negative, dim: an.dim, errors: an.errors };
  }
  function analyzeSide(ast, cx) {
    const terms = E.additiveTerms(ast).map((t) => Object.assign(analyzeTerm(t.node, cx), { sign: t.sign }));
    const an = E.dimAnalyze(ast, cx.symDims);
    const consistentTerms = terms.every((t) => E.dimEq(t.dim, terms[0].dim));
    return { ast, terms, dim: an.dim, errors: an.errors, consistentTerms };
  }

  const dimT = (d) => E.dimTex(d);
  function facCard(f) {
    return '<div class="fac' + (f.known ? '' : ' unk') + '">' +
      '<div>' + U.tex(powTex(f.tex, f.absP)) + (f.den ? ' <span class="faint" style="font-size:11px">im Nenner</span>' : '') + '</div>' +
      '<div class="dm">' + (f.known ? U.tex('\\left[' + powTex(f.tex, f.absP) + '\\right] = ' + dimT(E.dimPow(f.base, f.absP))) : '<span style="color:var(--red);font-size:12px">Dimension unbekannt</span>') + '</div>' +
      (f.name ? '<div class="nm">' + esc(f.name) + '</div>' : '') + '</div>';
  }
  function numCard(term, cx) {
    if (!term.numeric.length && !term.negative) return '';
    const one = (n) => { const t = n.node.type === 'num' ? E.toTex(n.node) : E.symTex(n.node.name, cx.texMap); const a = E.rval(n.pow) < 0 ? E.R(-n.pow.n, n.pow.d) : n.pow; return powTex(t, a); };
    const nu = term.numeric.filter((n) => E.rval(n.pow) > 0).map(one);
    const de = term.numeric.filter((n) => E.rval(n.pow) < 0).map(one);
    let t = (nu.length ? nu.join('\\,') : '1');
    if (de.length) t = '\\frac{' + t + '}{' + de.join('\\,') + '}';
    if (term.negative) t = '-' + t;
    return '<div class="fac num"><div>' + U.tex(t) + '</div><div class="dm">reine Zahlen · dimensionslos</div></div>';
  }
  function combineTex(term) {
    const bracket = (f) => '\\left(' + dimT(E.dimPow(f.base, f.absP)) + '\\right)';
    const num = term.facs.filter((f) => !f.den).map(bracket);
    const den = term.facs.filter((f) => f.den).map(bracket);
    const n = num.length ? num.join('\\,') : '1';
    const body = den.length ? '\\frac{' + n + '}{' + den.join('\\,') + '}' : n;
    return body + ' = ' + dimT(term.dim);
  }

  /* ---------- Nightmare Mode ---------- */
  function nightmare(term) {
    const facs = term.facs.filter((f) => f.known);
    if (!facs.length) return '<div class="faint">Keine dimensionsbehafteten Faktoren – das ist eine reine Zahl.</div>';
    // 1) expanded, nothing cancelled yet
    const raw = (f) => {
      const inner = '\\left(' + dimT(f.base) + '\\right)';
      return E.rStr(f.absP) === '1' ? inner : inner + '^{' + E.rStr(f.absP) + '}';
    };
    const num = facs.filter((f) => !f.den).map(raw), den = facs.filter((f) => f.den).map(raw);
    const expanded = den.length ? '\\frac{' + (num.join('\\,') || '1') + '}{' + den.join('\\,') + '}' : num.join('\\,');
    // 2) SI path
    const si = facs.filter((f) => f.node.type === 'var').map((f) => {
      const di = E.dimInfo(f.base);
      return esc(f.node.name) + ': ' + esc(di.unit) + (di.unit !== di.si ? ' = ' + esc(di.si) : '');
    });
    // 3) ledger
    const bases = E.BASES.map((b, i) => i).filter((i) => facs.some((f) => f.base[i].n !== 0));
    let cell = 0;
    const rows = bases.map((i) => {
      let sum = E.R(0);
      const cells = facs.map((f) => {
        const c = E.R(f.base[i].n * f.pow.n, f.base[i].d * f.pow.d);
        sum = E.R(sum.n * c.d + c.n * sum.d, sum.d * c.d);
        const delay = (cell++) * 45;
        if (c.n === 0) return '<td class="c z" style="animation-delay:' + delay + 'ms">·</td>';
        const s = E.rStr(c);
        return '<td class="c" style="animation-delay:' + delay + 'ms">' + (c.n > 0 ? '+' : '−') + esc(s.replace('-', '')) + '</td>';
      });
      return { i, sum, html: cells.join('') };
    });
    const endDelay = cell * 45 + 120;
    const gone = rows.filter((r) => r.sum.n === 0).length;
    let h = '<div class="nm-head">Jeder Faktor wird bis auf die SI-Basisgrößen aufgelöst. Nichts wird vorher gekürzt.</div>';
    h += '<div class="expand">' + U.tex(expanded) + '</div>';
    if (si.length) h += '<div class="si-path">' + si.join('   ·   ') + '</div>';
    h += '<div class="scroll-x"><table class="ledger"><thead><tr><th></th>' + facs.map((f) => '<th>' + U.tex(powTex(f.tex, f.pow)) + '</th>').join('') + '<th>Summe</th></tr></thead><tbody>' +
      rows.map((r) => '<tr class="' + (r.sum.n === 0 ? 'gone' : '') + '"><td class="b">' + esc(E.BASE_NAMES ? E.BASE_NAMES[r.i] : E.BASES[r.i]) + ' <span class="faint">(' + esc(E.BASES[r.i]) + ')</span></td>' + r.html +
        '<td class="sum" style="animation-delay:' + endDelay + 'ms">' + (r.sum.n === 0 ? '0' : esc(E.rStr(r.sum))) + '</td></tr>').join('') +
      '</tbody></table></div>';
    h += '<div class="faint" style="text-align:center;font-size:12.5px">' + facs.length + (facs.length === 1 ? ' Faktor · ' : ' Faktoren · ') + bases.length + (bases.length === 1 ? ' Basisgröße beteiligt · ' : ' Basisgrößen beteiligt · ') +
      (gone ? gone + (gone === 1 ? ' davon kürzt sich vollständig heraus' : ' davon kürzen sich vollständig heraus') : 'nichts kürzt sich vollständig') + '</div>';
    const di = E.dimInfo(term.dim);
    h += '<div class="result-big">' + U.tex(dimT(term.dim)) + '<small>' + esc(di.name ? di.name + ' · ' : '') + esc(di.unit) + '</small></div>';
    return h;
  }

  /* ---------- equation card ---------- */
  function sideBlock(side, label, cx) {
    let h = '';
    const multi = side.terms.length > 1;
    side.terms.forEach((t, k) => {
      const lbl = multi ? label + ' · Term ' + (k + 1) + ': ' : label + ': ';
      h += '<div class="term">';
      h += '<div class="side-lbl">' + esc(lbl) + '</div>' + U.tex((t.sign < 0 ? '-' : '') + E.toTex(t.node, cx.texMap));
      if (S.nightmare) h += nightmare(t);
      else {
        h += '<div class="facs" style="margin-top:8px">' + t.facs.map(facCard).join('') + numCard(t, cx) + '</div>';
        if (t.facs.length > 1 || t.facs.some((f) => E.rStr(f.pow) !== '1')) h += '<div class="combine">' + U.tex('\\left[\\,\\cdot\\,\\right] = ' + combineTex(t)) + '</div>';
      }
      h += '</div>';
    });
    if (multi) {
      h += '<div class="' + (side.consistentTerms ? 'faint' : 'mism') + '" style="font-size:13px">' +
        (side.consistentTerms ? 'Alle Terme haben dieselbe Dimension ' + U.tex(dimT(side.terms[0].dim)) + ' – nur deshalb dürfen sie addiert werden.'
          : 'Die Terme haben unterschiedliche Dimensionen: ' + side.terms.map((t) => U.tex(dimT(t.dim))).join(' vs. ') + '. So eine Summe ist physikalisch sinnlos.') + '</div>';
    }
    return h;
  }
  function eqCard(q, cx, opts = {}) {
    const chk = E.checkEquation(q, cx.symDims);
    const rhs = analyzeSide(q.rhs, cx);
    const lhs = q.lhs ? analyzeSide(q.lhs, cx) : null;
    const errors = [].concat(rhs.errors, lhs ? lhs.errors : []);
    const ok = chk.consistent && errors.length === 0;
    const eqTex = (q.lhs ? E.toTex(q.lhs, cx.texMap) + ' = ' : '') + E.toTex(q.rhs, cx.texMap);
    let h = '<article class="deq"><header><h4>' + esc(q.label || 'Gleichung') + '</h4><span class="verdict ' + (ok ? 'ok' : 'bad') + '">' + (ok ? '✓ dimensionskonsistent' : '✗ dimensional inkonsistent') + '</span></header>';
    h += '<div class="eqrow">' + U.tex(eqTex) + '</div><div class="body">';
    if (lhs && !(opts.skipTrivialLhs && lhs.terms.length === 1 && lhs.terms[0].facs.length === 1 && lhs.terms[0].facs[0].node.type === 'var')) h += sideBlock(lhs, 'Linke Seite', cx);
    h += sideBlock(rhs, 'Rechte Seite', cx);
    if (errors.length) h += '<ul class="issues">' + errors.map((e) => '<li class="math"><b>Fehler in der Dimensionsanalyse</b>' + esc(e.msg) + '</li>').join('') + '</ul>';
    if (lhs) {
      const same = E.dimEq(lhs.dim, rhs.dim);
      const li = E.dimInfo(lhs.dim), ri = E.dimInfo(rhs.dim);
      h += '<div class="balance' + (same ? '' : ' bad') + '"><div class="pan">' + U.tex(dimT(lhs.dim)) + '<small>links · ' + esc(li.name || li.unit) + '</small></div><div class="eqs">' + (same ? '=' : '≠') + '</div><div class="pan">' + U.tex(dimT(rhs.dim)) + '<small>rechts · ' + esc(ri.name || ri.unit) + '</small></div></div>';
      if (!same) {
        const extra = chk.mismatch.ratio;
        h += '<div class="mism">Die rechte Seite hat gegenüber der linken den Überschuss ' + U.tex(dimT(extra)) + (E.dimInfo(extra).name ? ' (' + esc(E.dimInfo(extra).name) + ')' : '') + '. Genau an dieser Stelle bricht die Gleichung.</div>';
      }
    }
    h += '</div></article>';
    return { html: h, ok, chk, lhs, rhs, errors };
  }

  /* ---------- page (tab) ---------- */
  function notesHTML(exp) {
    return (exp.notes || []).map((n) => '<div class="notebox"><h4>' + esc(n.t) + '</h4><div class="chain">' +
      n.steps.map((s, i) => (i ? '<div class="ar">⇓</div>' : '') + U.tex(s)).join('') + '</div>' + (n.after ? '<p class="faint" style="margin:10px 0 0;font-size:13px;text-align:center">' + esc(n.after) + '</p>' : '') + '</div>').join('');
  }
  function page() {
    const exp = S.exp, f = form();
    const cx = ctxOfForm(exp, f);
    let h = '<div class="dimtop"><label class="switch"><input type="checkbox" id="nmm"' + (S.nightmare ? ' checked' : '') + '><span>Dimensional Analysis Nightmare Mode<small>jeden Faktor bis auf die Basisgrößen auflösen</small></span></label></div>';
    h += '<details class="dimwhat"><summary>Was ist Dimensionsanalyse?</summary><div>' +
      '<p>Jede physikalische Größe hat eine <b>Dimension</b> – sie sagt, <i>welche Art</i> von Größe das ist, unabhängig von der Einheit. Alles lässt sich auf wenige Basisgrößen zurückführen: Länge ' + U.tex('L') + ', Masse ' + U.tex('M') + ', Zeit ' + U.tex('T') + ', Temperatur ' + U.tex('\\Theta') + ' und einige mehr. Eine Kraft ist zum Beispiel ' + U.tex('\\mathrm{M}\\,\\mathrm{L}\\,\\mathrm{T}^{-2}') + ', eine Energie ' + U.tex('\\mathrm{M}\\,\\mathrm{L}^{2}\\,\\mathrm{T}^{-2}') + '.</p>' +
      '<p>Die Grundregel: <b>Nur Gleiches lässt sich vergleichen.</b> Beide Seiten einer Gleichung müssen dieselbe Dimension haben, und addieren darf man nur Terme gleicher Dimension. Diese Seite zerlegt jede Gleichung des Experiments in ihre Faktoren und prüft genau das.</p>' +
      '<p><a href="#view=theorie&amp;sec=dim">Ausführlicher, mit Beispiel zum Herleiten →</a></p></div></details>';
    h += '<p class="honest"><b>Was diese Prüfung leistet – und was nicht:</b> Passen die Dimensionen nicht zusammen, ist die Gleichung sicher falsch. Passen sie zusammen, ist sie deshalb noch nicht richtig. Reine Zahlenfaktoren wie ½ oder 2π haben keine Dimension und bleiben für die Prüfung unsichtbar. Ob das Modell hinter der Gleichung in der betrachteten Situation überhaupt gilt, kann sie ebenfalls nicht beurteilen. Dimensionsanalyse ist ein Ausschlusstest, kein Beweis.</p>';
    if (exp.meta && /Tensor/.test(exp.meta.mathType || '')) {
      h += '<div class="callout"><b>Tensorgleichung:</b> Geprüft wird die Dimension <i>jeder einzelnen Komponente</i>. Alle 10 unabhängigen Komponenten haben dieselbe Dimension. Über die Tensorstruktur, die Indizes oder die Lösbarkeit sagt diese Prüfung nichts. Die Metrik ist hier dimensionslos gewählt (alle Koordinaten als Längen, x⁰ = ct). <a href="#view=theorie&amp;sec=idx">Was bedeuten die Indizes μν?</a></div>';
    }
    h += notesHTML(exp);
    const eqs = f.c.equations;
    h += eqs.map((q) => eqCard(q, cx, { skipTrivialLhs: true }).html).join('');
    if (f.c.equations !== f.c.autoEq && f.c.autoEq.length) {
      const all = f.c.autoEq.map((q) => E.checkEquation(q, cx.symDims).consistent);
      h += '<p class="faint" style="font-size:12.5px">Zusätzlich automatisch geprüft: alle ' + all.length + ' berechneten Größen dieses Experiments gegen ihre deklarierte Dimension – ' + (all.every(Boolean) ? 'alle konsistent.' : all.filter((x) => !x).length + ' inkonsistent!') + '</p>';
    }
    return h;
  }
  function bind(c) {
    const cb = $('#nmm', c);
    if (cb) cb.addEventListener('change', () => { S.nightmare = cb.checked; c.innerHTML = page(); bind(c); });
  }

  /* ================== Custom / wrong equation mode ================== */
  const USER_SYMS = Object.assign(Object.create(null), {
    F: ['M L T^-2', 'Kraft'], m: ['M', 'Masse'], M: ['M', 'Masse'], m1: ['M', 'Masse'], m2: ['M', 'Masse'],
    r: ['L', 'Abstand / Radius'], R: ['L', 'Radius'], x: ['L', 'Ort'], s: ['L', 'Weg'], d: ['L', 'Strecke'], l: ['L', 'Länge'], L: ['L', 'Länge'], lambda: ['L', 'Wellenlänge'],
    A: ['L^2', 'Fläche'], V: ['L^3', 'Volumen'], t: ['T', 'Zeit'], tau: ['T', 'Zeitspanne'],
    v: ['L T^-1', 'Geschwindigkeit'], u: ['L T^-1', 'Geschwindigkeit'], a: ['L T^-2', 'Beschleunigung'], g: ['L T^-2', 'Fallbeschleunigung'],
    E: ['M L^2 T^-2', 'Energie'], U: ['M L^2 T^-2', 'Energie'], W: ['M L^2 T^-2', 'Arbeit'], p: ['M L T^-1', 'Impuls'], P: ['M L^2 T^-3', 'Leistung'],
    omega: ['T^-1', 'Kreisfrequenz'], f: ['T^-1', 'Frequenz'], k: ['M T^-2', 'Federkonstante'], rho: ['M L^-3', 'Dichte'],
    q: ['I T', 'Ladung'], Q: ['I T', 'Ladung'], T: ['Θ', 'Temperatur'], S: ['M L^2 T^-2 Θ^-1', 'Entropie'],
    n: ['', 'Anzahl / Quantenzahl'], N: ['', 'Anzahl'], beta: ['', 'v/c'], gamma: ['', 'Lorentz-Faktor'], theta: ['', 'Winkel (rad)'], phi: ['', 'Winkel (rad)'],
    l_P: ['L', 'Planck-Länge'], t_P: ['T', 'Planck-Zeit'], m_P: ['M', 'Planck-Masse'], T_P: ['Θ', 'Planck-Temperatur'], E_P: ['M L^2 T^-2', 'Planck-Energie'],
    T_H: ['Θ', 'Hawking-Temperatur'], r_s: ['L', 'Schwarzschild-Radius'], S_BH: ['M L^2 T^-2 Θ^-1', 'BH-Entropie'], psi: ['L^-1/2', 'Wellenfunktion (1D)'],
    E_k: ['M L^2 T^-2', 'kinetische Energie'], X: [null, 'unbekannt'], Y: [null, 'unbekannt'], Z: [null, 'unbekannt'],
  });
  // Symbole mit zwei gängigen Bedeutungen. Die Standard-Lesung bleibt, aber die andere ist einen Klick entfernt.
  const AMBIG = Object.assign(Object.create(null), {
    h: { std: 'Planck-Konstante', alt: 'L', altName: 'Höhe' },
    T: { std: 'Temperatur', alt: 'T', altName: 'Periodendauer / Zeit' },
    e: { std: 'Elementarladung', alt: '', altName: 'Eulersche Zahl (für e^x besser exp(x))' },
  });
  const has = E.has;
  const isAlt = (s) => has(AMBIG, s) && has(S.custom.dims, s) && S.custom.dims[s] === AMBIG[s].alt;
  const altButton = (s) => '<button class="btn sm" data-alt="' + esc(s) + '">' + (isAlt(s) ? 'Wieder als ' + esc(AMBIG[s].std) + ' lesen' : 'Als ' + esc(AMBIG[s].altName.replace(/ \(.*\)$/, '')) + ' lesen') + '</button>';
  const DIM_PRESETS = [['', 'dimensionslos'], ['L', 'Länge'], ['M', 'Masse'], ['T', 'Zeit'], ['Θ', 'Temperatur'], ['L T^-1', 'Geschwindigkeit'], ['L T^-2', 'Beschleunigung'], ['M L T^-2', 'Kraft'], ['M L^2 T^-2', 'Energie'], ['L^2', 'Fläche'], ['T^-1', 'Frequenz'], ['M L^2 T^-2 Θ^-1', 'Entropie']];
  const EXAMPLES = [
    { src: 'X = G M / c', dims: { X: 'L' }, note: 'X soll eine Länge sein' },
    { src: 'r_s = 2 G M / c^2', dims: {} },
    { src: 'E = m c^3', dims: {} },
    { src: 'F = m a + m v', dims: {} },
    { src: 'T_H = ħ c^3 / (8 π G M k_B)', dims: {} },
    { src: 'l_P = sqrt(ħ G / c^5)', dims: {} },
    { src: 'X = sqrt(ħ c / G)', dims: {} },
    { src: 'E = sin(v) m c^2', dims: {} },
  ];

  function customCtx(syms) {
    const symDims = Object.create(null), texMap = Object.create(null), names = Object.create(null), rows = [];
    for (const k in E.NUMERIC_SYMBOLS) symDims[k] = E.dimless();
    for (const s of syms) {
      const over = has(S.custom.dims, s) ? S.custom.dims[s] : undefined;
      let src, str, err = null;
      if (over !== undefined) { src = 'eigene Angabe'; str = String(over); }
      else if (has(M.C, s)) { src = 'Konstante'; str = M.C[s].dim; }
      else if (has(USER_SYMS, s) && USER_SYMS[s][0] !== null) { src = 'Standard-Annahme'; str = USER_SYMS[s][0]; }
      else { src = 'unbekannt'; str = null; }
      if (str !== null) {
        try { symDims[s] = E.dimParse(str.replace(/Θ/g, 'Θ')); } catch (e) { err = e.message; }
      }
      if (has(M.C, s)) { texMap[s] = M.C[s].tex; names[s] = M.C[s].name; }
      else if (has(USER_SYMS, s)) names[s] = USER_SYMS[s][1];
      if (isAlt(s)) names[s] = AMBIG[s].altName;
      rows.push({ s, src, str, err, ambig: has(AMBIG, s) });
    }
    return { symDims, texMap, names, rows };
  }

  function suggestFix(ratio) {
    // find c^a G^b ħ^d k_B^e (small exponents) with the dimension of the surplus
    const keys = ['c', 'G', 'hbar', 'k_B'];
    const dims = keys.map((k) => M.C[k].dimv);
    let best = null;
    for (let a = -4; a <= 4; a++) for (let b = -2; b <= 2; b++) for (let d = -2; d <= 2; d++) for (let e = -2; e <= 2; e++) {
      const cost = Math.abs(a) + Math.abs(b) + Math.abs(d) + Math.abs(e);
      if (!cost || (best && cost >= best.cost)) continue;
      let dm = E.dimless();
      [a, b, d, e].forEach((p, i) => { if (p) dm = E.dimMul(dm, E.dimPow(dims[i], E.R(p))); });
      if (E.dimEq(dm, ratio)) best = { cost, exps: [a, b, d, e] };
    }
    if (!best) return null;
    // the RHS must be DIVIDED by the surplus
    const parts = best.exps.map((p, i) => (p ? powTex(M.C[keys[i]].tex, E.R(-p)) : '')).filter(Boolean);
    return parts.join('\\,');
  }

  function markSrc(src, ranges) {
    const rs = ranges.filter((r) => r && r[1] > r[0]).sort((a, b) => a[0] - b[0]);
    const merged = [];
    rs.forEach((r) => { const l = merged[merged.length - 1]; if (l && r[0] <= l[1]) l[1] = Math.max(l[1], r[1]); else merged.push(r.slice()); });
    let out = '', p = 0;
    merged.forEach(([a, b]) => { out += esc(src.slice(p, a)) + '<mark>' + esc(src.slice(a, b)) + '</mark>'; p = b; });
    return out + esc(src.slice(p));
  }

  function customResult() {
    const src = S.custom.src;
    let parsed;
    try { parsed = E.parseEquation(src); }
    catch (e) {
      const nsrc = E.normalize(src);
      const sp = e.span || [0, 0];
      return '<div class="srcview">' + markSrc(nsrc, [[sp[0], Math.max(sp[1], sp[0] + 1)]]) + '<span class="caret">' + ' '.repeat(sp[0]) + '^ ' + esc(e.message) + '</span></div>' +
        '<p class="faint" style="font-size:13px">Syntax: <span class="kbd">*</span> oder Leerzeichen für Mal, <span class="kbd">/</span>, <span class="kbd">^</span>, <span class="kbd">sqrt( )</span>, Unicode wie ħ, π, ² ist erlaubt.</p>';
    }
    const syms = new Set();
    if (parsed.lhs) E.symbolsIn(parsed.lhs, syms);
    E.symbolsIn(parsed.rhs, syms);
    const list = [...syms].filter((s) => !has(E.NUMERIC_SYMBOLS, s));
    const cx = customCtx(list);
    // unknown single-symbol LHS → infer its dimension instead of failing
    let inferred = null;
    if (parsed.lhs && parsed.lhs.type === 'var' && !cx.symDims[parsed.lhs.name]) {
      const an = E.dimAnalyze(parsed.rhs, cx.symDims);
      if (an.ok) { inferred = { name: parsed.lhs.name, dim: an.dim }; cx.symDims[parsed.lhs.name] = an.dim; }
    }
    const card = eqCard({ label: 'Deine Gleichung', lhs: parsed.lhs, rhs: parsed.rhs }, cx);
    const ranges = card.errors.map((e) => e.node && e.node.span);
    if (card.chk.mismatch && !card.errors.length) ranges.push(parsed.rhs.span);
    let h = '<div class="srcview" aria-label="Eingabe mit markierten Fehlerstellen">' + markSrc(parsed.src, ranges) + '</div>';
    // „a / b c“ ist formal (a/b)·c – meist aber a/(b c) gemeint. Hinweis mit Ein-Klick-Korrektur.
    const amb = (parsed.lhs ? E.implicitAfterDivision(parsed.lhs) : []).concat(E.implicitAfterDivision(parsed.rhs));
    if (amb.length) {
      const map = [];
      E.normalize(src, map);
      h += amb.map((a) => {
        const i0 = map[a.span[0]], i1 = map[a.span[1]];
        const fixed = src.slice(0, i0) + '(' + src.slice(i0, i1) + ')' + src.slice(i1);
        return '<div class="callout"><b>Schreibweise prüfen:</b> Mal und Geteilt werden von links nach rechts gelesen, deshalb steht hier ' + U.tex(E.toTex(a.node, cx.texMap)) +
          '. Falls ' + U.tex(E.toTex(a.alt, cx.texMap)) + ' gemeint ist, fehlen Klammern. <button class="btn sm" data-fixsrc="' + esc(fixed) + '">Klammern setzen</button></div>';
      }).join('');
    }
    // symbol table
    h += '<h2 class="sec" style="margin-top:20px">Symbole und angenommene Dimensionen</h2>';
    h += '<div class="scroll-x"><table class="t symtab"><thead><tr><th>Symbol</th><th>Herkunft</th><th>Dimension</th><th></th><th>Bedeutung</th></tr></thead><tbody>' +
      cx.rows.map((r) => {
        const isInf = inferred && inferred.name === r.s;
        return '<tr><td>' + U.tex(E.symTex(r.s, cx.texMap)) + '</td><td class="' + (r.src === 'unbekannt' ? '' : 'faint') + '" style="' + (r.src === 'unbekannt' && !isInf ? 'color:var(--red)' : '') + '">' + (isInf ? 'aus rechter Seite abgeleitet' : r.src) + '</td>' +
          '<td><input data-sym="' + esc(r.s) + '" value="' + esc(r.str === null ? '' : r.str) + '" placeholder="' + (isInf ? esc(E.dimStr(inferred.dim)) : 'z. B. L T^-1') + '" class="' + (r.err ? 'bad' : '') + '" aria-label="Dimension von ' + esc(r.s) + '" spellcheck="false"></td>' +
          '<td><select data-symsel="' + esc(r.s) + '" aria-label="Dimension wählen"><option value="">wählen…</option>' + DIM_PRESETS.map(([d, n]) => '<option value="' + esc(d) + '">' + n + '</option>').join('') + (has(S.custom.dims, r.s) ? '<option value="__reset">Standard wiederherstellen</option>' : '') + '</select></td>' +
          '<td class="faint">' + esc(cx.names[r.s] || '') + (r.ambig ? ' ' + altButton(r.s) : '') + (r.err ? '<br><span style="color:var(--red)">' + esc(r.err) + '</span>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    h += '<p class="faint" style="font-size:12px">Dimensionen als Produkt der Basisgrößen M, L, T, Θ (auch „Th“), I, N, J mit Exponenten, z. B. <span class="kbd">M L^2 T^-2</span> oder <span class="kbd">L^-1/2</span>. Leer lassen = unbekannt.</p>';
    // verdict + fix
    h += '<h2 class="sec">Analyse</h2>';
    if (inferred) h += '<div class="callout">Für <b>' + esc(inferred.name) + '</b> ist keine Dimension festgelegt. Aus der rechten Seite folgt: ' + U.tex(dimT(inferred.dim)) + (E.dimInfo(inferred.dim).name ? ' – ' + esc(E.dimInfo(inferred.dim).name) : '') + '. Lege oben eine erwartete Dimension fest, um die Gleichung wirklich zu prüfen.</div>';
    h += card.html;
    const ambigDefault = cx.rows.filter((r) => r.ambig && !has(S.custom.dims, r.s));
    if (!card.ok && ambigDefault.length) {
      h += '<div class="callout">' + ambigDefault.map((r) => '<b>' + esc(r.s) + '</b> wurde als ' + esc(AMBIG[r.s].std) + ' gelesen. ').join('') +
        'Falls etwas anderes gemeint ist: ' + ambigDefault.map((r) => altButton(r.s)).join(' ') + '</div>';
    }
    if (card.chk.mismatch && !card.errors.length) {
      const fix = suggestFix(card.chk.mismatch.ratio);
      if (fix) h += '<div class="fix">Rein dimensional würde die Gleichung stimmen, wenn die rechte Seite zusätzlich mit ' + U.tex(fix) + ' multipliziert wird. <span class="faint">Ob das physikalisch richtig ist, kann die Dimensionsanalyse nicht sagen – ein fehlender Faktor 2 oder π bleibt unsichtbar.</span></div>';
    }
    if (card.ok) h += '<div class="honest" style="margin-top:12px"><b>Dimensionskonsistent heißt nicht physikalisch korrekt.</b> Die Prüfung sagt nur, dass links und rechts dieselbe Art von Größe steht.</div>';
    // numeric value if everything on the RHS is a constant
    const rsyms = [...E.symbolsIn(parsed.rhs)];
    if (rsyms.length && rsyms.every((s) => (has(M.C, s) && !has(S.custom.dims, s)) || has(E.NUMERIC_SYMBOLS, s))) {
      const r = E.evaluate(parsed.rhs, M.CONST_ENV);
      const rd = E.dimAnalyze(parsed.rhs, cx.symDims);
      if (r.ok) h += '<div class="callout">Die rechte Seite enthält nur Konstanten. Ihr Wert: <b class="mono" style="color:var(--accent)">' + esc(E.fmt(U.num(r), 6)) + ' ' + esc(U.unit(rd.dim)) + '</b></div>';
    }
    return h;
  }

  function customRender(el) {
    let h = '<header class="xhead"><div><div class="crumb">Famous Equations</div><h1>Eigene Gleichung prüfen</h1><div class="sub">Artificial / Wrong Equation Mode – dieselbe Engine wie bei allen anderen Formeln</div></div></header>';
    h += '<div class="eqin"><input id="eqsrc" value="' + esc(S.custom.src) + '" aria-label="Gleichung eingeben" spellcheck="false" autocomplete="off"></div>';
    h += '<div class="presets" style="margin:10px 0 18px">' + EXAMPLES.map((x, i) => '<button class="chip" data-ex="' + i + '" title="' + esc(x.note || '') + '"><span class="mono" style="font-size:12px">' + esc(x.src) + '</span></button>').join('') + '</div>';
    h += '<div id="cres"></div>';
    el.innerHTML = h;
    const inp = $('#eqsrc', el), res = $('#cres', el);
    const redo = () => { res.innerHTML = customResult(); U.writeHash(); };
    let t = 0;
    inp.addEventListener('input', () => { S.custom.src = inp.value; clearTimeout(t); t = setTimeout(redo, 220); });
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ex]');
      if (b) {
        const x = EXAMPLES[Number(b.dataset.ex)];
        S.custom.src = x.src; S.custom.dims = Object.assign({}, x.dims);
        inp.value = x.src; redo();
        return;
      }
      const fx = e.target.closest('[data-fixsrc]');
      if (fx) { S.custom.src = fx.getAttribute('data-fixsrc'); inp.value = S.custom.src; redo(); return; }
      const al = e.target.closest('[data-alt]');
      if (al) {
        const k = al.getAttribute('data-alt');
        if (!has(AMBIG, k)) return;
        if (isAlt(k)) delete S.custom.dims[k]; else S.custom.dims[k] = AMBIG[k].alt;
        redo();
      }
    });
    res.addEventListener('change', (e) => {
      const t2 = e.target;
      if (t2.dataset.sym !== undefined) {
        const v = t2.value.trim();
        const k = t2.dataset.sym;
        if (v === '' && !(has(M.C, k) || (has(USER_SYMS, k) && USER_SYMS[k][0] !== null))) delete S.custom.dims[k];
        else S.custom.dims[k] = v;
        redo();
      } else if (t2.dataset.symsel !== undefined) {
        if (t2.value === '__reset') delete S.custom.dims[t2.dataset.symsel];
        else if (t2.value !== '' || t2.selectedIndex > 0) S.custom.dims[t2.dataset.symsel] = t2.value;
        redo();
      }
    });
    redo();
  }

  U.docs = { formula: formulaDoc, physics: physicsDoc, EP_LABEL };
  U.dims = { page, bind, eqCard, ctxOfForm, analyzeSide, suggestFix, customResult, EXAMPLES };
  U.views.custom = { title: 'Eigene Gleichung', render: customRender };
})(globalThis.PP = globalThis.PP || {});
