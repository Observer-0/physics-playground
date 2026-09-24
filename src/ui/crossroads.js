/* =====================================================================
   Physics Playground — Schnittpunkt-Block über dem Labor (Hawking-Temperatur)
   und Wörterbuch Schwarzes Loch ↔ Thermodynamik (Hawking und BH-Entropie).
   Zeichnet exp.crossroads bzw. exp.dict aus src/data/experiments.js:
   · Formel mit anklickbaren Symbolen; Karte je Symbol mit Theorie, Beitrag
     und Grenzfall, dazu Knöpfe, die den Grenzfall im Break-Modus live zeigen
   · Kette Geometrie → Temperatur, „Aha“-Kasten, Epistemik-Zeile
   Jede Zahl kommt aus PP.model.compute (Ausgaben dieses oder des verknüpften
   Experiments) – hier wird nur formatiert, nie nachgerechnet.
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine, M = PP.model, U = PP.ui, T = PP.i18n.T;
  const S = U.S;
  const { $, $$, esc } = U;

  /* ---------- Zahlen: Platzhalter, die update() nach jeder Rechnung füllt ---------- */
  let slots = [];
  const slot = (src, digits) => { slots.push({ src, digits }); return '<span class="xv" data-xv="' + (slots.length - 1) + '">—</span>'; };
  const formVars = () => M.formOf(S.exp, S.form).c.vars.map((v) => v.key);

  // src: { key, exp?, form?, at? } – Ausgabe eines Experiments; { var } – Eingabe.
  // Ergebnis { n, dimv } (n = null: nicht definiert) oder null, wenn die Zahl hier nicht bestimmbar ist
  function resolve(src) {
    const set = S.edit, vals = S.vals[set], have = formVars();
    if (src.var) return have.includes(src.var) ? { n: vals[src.var], dimv: S.exp.vars[src.var].dimv } : null;
    const exp = src.exp ? M.byId[src.exp] : S.exp;
    if (!exp) return null;
    const fid = src.form || (exp === S.exp ? S.form : exp.forms[0].id);
    const o = M.formOf(exp, fid).c.outputs.find((x) => x.key === src.key);
    if (!o) return null;
    let r;
    // Referenzwert (z. B. Sonnenmasse): mit den echten Konstanten, unabhängig vom Break-Modus
    if (src.at) r = M.compute(exp, fid, Object.assign(M.defaults(exp), src.at), { skipChecks: true }).out[src.key];
    else if (exp === S.exp && fid === S.form) r = (S.res[set] || S.res.A).out[src.key];
    else {
      // anderes Experiment: nur, wenn alle seine Eingaben hier gerade eingestellt werden
      const need = M.formOf(exp, fid).c.vars.map((v) => v.key);
      if (!need.every((k) => have.includes(k))) return null;
      const v2 = {};
      need.forEach((k) => { v2[k] = vals[k]; });
      r = M.compute(exp, fid, v2, { consts: S.consts[set], skipChecks: true }).out[src.key];
    }
    return { n: r && r.ok ? U.num(r) : null, dimv: o.dimv };
  }
  function show(v, digits) {
    if (!v) return '—';
    if (v.n === null || v.n === undefined || (typeof v.n === 'number' && !isFinite(v.n))) return T('nicht definiert', 'not defined');
    const u = U.unit(v.dimv);
    return E.fmt(v.n, digits || 3) + (u ? ' ' + u : '');
  }
  function update() {
    if (!S.exp || !S.res || !S.res.A || !$('[data-xv]')) return;
    $$('[data-xv]').forEach((el) => {
      const s = slots[Number(el.dataset.xv)];
      if (!s) return;
      let t;
      try { t = show(resolve(s.src), s.digits); } catch (_) { t = '—'; }
      if (el.textContent !== t) el.textContent = t;
    });
  }

  /* ---------- Formel mit Symbolen, Legende, Karte ---------- */
  const texOf = (s) => PP.tex.render(s);
  function symBtn(xr, k) {
    const s = xr.symbols[k];
    return '<button type="button" class="xsym xc-' + s.color + '" data-xs="' + k + '" aria-pressed="' + (S.xsym === k) + '" aria-controls="xr-card" title="' + esc(s.theory) + '">' + texOf(s.tex) + '</button>';
  }
  function formulaHTML(xr) {
    const gap = '<span class="msp" style="margin-right:.1em"></span>';
    return '<div class="xr-formula"><span class="math"><span class="xc xc-res">' + texOf(xr.lhs) + '</span><span class="mo">=</span>' +
      '<span class="mfr"><span class="mnu">' + xr.num.map((k) => symBtn(xr, k)).join(gap) + '</span><span class="mde">' + xr.den.map((k) => symBtn(xr, k)).join(gap) + '</span></span></span></div>';
  }
  function legendHTML(xr) {
    return '<div class="xr-legend" role="group" aria-label="' + T('Symbole und Theorien', 'Symbols and theories') + '">' + Object.keys(xr.symbols).map((k) => {
      const s = xr.symbols[k];
      return '<button type="button" class="xr-chip" data-xs="' + k + '" aria-pressed="' + (S.xsym === k) + '" aria-controls="xr-card"><span class="math xc xc-' + s.color + '">' + texOf(s.tex) + '</span><span>' + esc(s.theory) + '</span></button>';
    }).join('') + '</div>';
  }
  const opLabel = (f) => (f < 1 ? '÷ ' + String(Math.round(1 / f)) : '× ' + String(f));
  function liveHTML(L) {
    const set = S.edit;
    const isC = !!L.c, k = isC ? L.c : L.v;
    const sym = U.tex(isC ? M.C[k].tex : S.exp.vars[k].tex);
    const spec = (isC ? 'c:' : 'v:') + k;
    let h = '<div class="xr-live"><span class="xr-live-k">' + T('Live ausprobieren:', 'Try it live:') + '</span>' +
      '<button type="button" class="btn sm" data-live="' + spec + '" data-f="' + L.f + '">' + sym + ' ' + opLabel(L.f) + '</button>';
    if (L.zero) h += '<button type="button" class="btn sm" data-live="' + spec + '" data-f="0">' + sym + ' = 0</button>';
    if (isC && E.has(S.consts[set], k)) {
      const x = S.consts[set][k], x0 = M.C[k].value;
      h += '<button type="button" class="btn sm" data-live="' + spec + '" data-f="orig">' + T('Originalwert', 'Original value') + '</button>' +
        '<span class="xr-live-now">' + T('jetzt: ', 'now: ') + sym + ' ' + (x === 0 ? '= 0' : '× ' + esc(E.fmt(x / x0, 3).replace(/^1 × /, ''))) + '</span>';
    }
    if (isC && !S.brk) h += '<span class="xr-live-note">' + T('schaltet „Break the Physics“ ein', 'turns on “Break the Physics”') + '</span>';
    return h + '</div>';
  }
  function cardHTML(xr) {
    const k = S.xsym, s = k && E.has(xr.symbols, k) ? xr.symbols[k] : null;
    if (!s) return '<p class="xr-hint">' + esc(xr.hint) + '</p>';
    return '<div class="xr-card-h"><span class="math xc xc-' + s.color + '">' + texOf(s.tex) + '</span><b>' + esc(s.theory) + '</b></div>' +
      '<p>' + esc(s.role) + '</p>' +
      '<div class="xr-lim"><div class="xr-lim-f">' + U.tex(s.limit) + '</div><p>' + esc(s.limitText) + '</p></div>' +
      (s.live ? liveHTML(s.live) : '');
  }
  function cardClass(xr) { const s = S.xsym && E.has(xr.symbols, S.xsym) ? xr.symbols[S.xsym] : null; return 'xr-card' + (s ? ' xc-' + s.color : ''); }

  /* ---------- Kette, Aha, Wörterbuch, Epistemik ---------- */
  function chainHTML(ch) {
    return '<div class="xr-box xr-chain"><h4>' + esc(ch.title) + '</h4>' + ch.steps.map((st, i) => (i ? '<div class="xr-ar" aria-hidden="true">⇓</div>' : '') +
      '<div class="xr-step"><div class="xr-step-f">' + U.tex(st.tex) + '<span class="xr-step-v"> ≈ ' + slot({ key: st.key }) + '</span></div><small>' + esc(st.text) + '</small></div>').join('') +
      '<p class="xr-note">' + esc(ch.note) + '</p></div>';
  }
  function ahaHTML(a) {
    return '<div class="xr-box xr-aha"><h4>' + esc(a.title) + '</h4><div class="xr-step-f">' + U.tex(a.tex) + '</div>' +
      '<dl class="xr-vals">' + a.parts.map((p) => '<dt>' + U.tex(p.tex) + '</dt><dd>≈ ' + slot({ key: p.key }) + '</dd>').join('') + '</dl>' +
      '<p class="xr-note">' + esc(a.text) + '</p></div>';
  }
  function dictBody(d) {
    const cell = (c) => '<td class="xr-d-sym">' + U.tex(c.tex) + '</td><td><span class="xr-d-nm">' + esc(c.name) + '</span><span class="xr-d-v">' + slot(c.src) + '</span></td>';
    return '<div class="xr-dict-body"><div class="scroll-x"><table class="xr-dt"><thead><tr><th colspan="2">' + T('Schwarzes Loch', 'Black hole') + '</th><th></th><th colspan="2">' + T('Thermodynamik', 'Thermodynamics') + '</th></tr></thead><tbody>' +
      d.rows.map((r) => '<tr>' + cell(r.l) + '<td class="xr-d-ar" aria-label="' + T('entspricht', 'corresponds to') + '">↔</td>' + cell(r.r) + '</tr>').join('') + '</tbody></table></div>' +
      '<div><div class="xr-law">' + U.tex(d.law) + '</div><div class="xr-both">' + U.tex(d.both) + '</div></div></div>' +
      '<p class="xr-note">' + esc(d.text) + '</p>';
  }
  function linkTo(exp, d) {
    const other = d.pair.find((id) => id !== exp.id);
    return other && M.byId[other] ? '<a class="xr-link" href="#exp=' + other + '">' + esc(d.link[other]) + '</a>' : '';
  }
  function dictHTML(exp, d) {
    return '<div class="xr-box xr-dict"><h4>' + esc(d.title) + ' ' + linkTo(exp, d) + '</h4>' + dictBody(d) + '</div>';
  }
  // Kompakt (z. B. auf der Entropie-Seite): Titel und Link sichtbar, Tabelle zum Aufklappen
  function dictCompact(exp) {
    const d = exp.dict;
    if (!d) return '';
    slots = [];
    return '<details class="xr-box xr-dict xr-dict-c"><summary><b>' + esc(d.title) + '</b> ' + linkTo(exp, d) + '</summary>' + dictBody(d) + '</details>';
  }
  function epHTML(list) {
    return '<ul class="ep xr-ep">' + list.map((e) => '<li><span class="tag ' + e.type + '">' + esc(U.docs.EP_LABEL[e.type]) + '</span><span>' + esc(e.text) +
      (e.value ? slot(e.value, 2) : '') + (e.after ? esc(e.after) : '') + '</span></li>').join('') + '</ul>';
  }

  function html(exp) {
    const xr = exp.crossroads;
    slots = [];
    // Zu Beginn ist die Karte des ersten Symbols offen (ħ), damit sofort sichtbar ist, was die Karten zeigen
    if (S.xsym === undefined) S.xsym = xr.num[0];
    const f = M.formOf(exp, S.form), prim = f.c.outputs.find((o) => o.primary) || f.c.outputs[0];
    const di = E.dimInfo(prim.dimv);
    return '<section class="xr" id="xr" aria-label="' + T('Schnittpunkt der Theorien', 'Crossroads of theories') + '">' +
      '<div class="xr-top"><div class="xr-left">' + formulaHTML(xr) +
      '<div class="xr-dim">' + T('Dimension von ', 'Dimension of ') + U.tex(prim.tex) + ': ' + U.tex(E.dimTex(prim.dimv)) + ' · ' + esc(di.name || '') + (U.unit(prim.dimv) ? ' · ' + esc(U.unit(prim.dimv)) : '') + '</div>' +
      legendHTML(xr) + '<p class="xr-hint">' + esc(xr.hint) + '</p>' +
      '<p class="xr-lead">' + esc(xr.lead) + ' <a href="#view=theorie&amp;sec=gap">' + esc(xr.gapLink) + '</a></p></div>' +
      '<div class="' + cardClass(xr) + '" id="xr-card">' + cardHTML(xr) + '</div></div>' +
      '<div class="xr-grid">' + chainHTML(xr.chain) + ahaHTML(xr.aha) + '</div>' +
      (xr.dict ? dictHTML(exp, xr.dict) : '') +
      epHTML(xr.epistemic) + '</section>';
  }

  /* ---------- Bedienung ---------- */
  function pick(el, k) {
    const xr = S.exp && S.exp.crossroads;
    if (!xr || S.xsym === k) return;
    S.xsym = k;
    const c = $('#xr-card', el);
    if (c) { c.className = cardClass(xr); c.innerHTML = cardHTML(xr); }
    $$('[data-xs]', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.xs === k)));
  }
  // Grenzfall live: Konstante (Break-Modus) oder Eingabe um den Faktor f ändern, 0 setzen oder zurücksetzen
  function live(spec, f) {
    const [kind, k] = spec.split(':'), set = S.edit;
    S.tab = 'lab';
    if (kind === 'c') {
      if (!E.has(M.C, k)) return;
      const cv = S.consts[set], cur = E.has(cv, k) ? cv[k] : M.C[k].value;
      if (f === 'orig') delete cv[k];
      else cv[k] = Number(f) === 0 ? 0 : cur * Number(f);
      if (!S.brk) U.setBreak(true); else U.render(false);
      return;
    }
    const d = S.exp.vars[k];
    if (!d) return;
    const x = S.vals[set][k] * Number(f);
    S.vals[set][k] = x;
    S.preset = null;
    // außerhalb des Regler-Bereichs geht es nur im Break-Modus weiter
    if (!S.brk && (x < d.min || x > d.max)) U.setBreak(true); else U.render(false);
  }
  function bind(el) {
    if (!S.exp || !(S.exp.crossroads || S.exp.dict)) return;
    const over = (e) => { const b = e.target.closest('[data-xs]'); if (b && el.contains(b)) pick(el, b.dataset.xs); };
    el.addEventListener('mouseover', over);
    el.addEventListener('focusin', over);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-xs]');
      if (b) { pick(el, b.dataset.xs); return; }
      const l = e.target.closest('[data-live]');
      if (l) live(l.dataset.live, l.dataset.f);
    });
  }

  U.crossroads = { html, dictCompact, bind, update, resolve };
})(globalThis.PP = globalThis.PP || {});
