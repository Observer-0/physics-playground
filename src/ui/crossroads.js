/* =====================================================================
   Physics Playground — Schnittpunkt-Block über dem Labor (Hawking-Temperatur)
   und Wörterbuch Schwarzes Loch ↔ Thermodynamik (Hawking und BH-Entropie).
   Zeichnet exp.crossroads bzw. exp.dict aus src/data/experiments.js:
   · Formel mit anklickbaren Symbolen, Legende und Karte je Symbol – die
     interaktive Gleichung aus src/ui/eqx.js mit den Daten aus src/data/equations.js
   · Kette Geometrie → Temperatur, „Aha“-Kasten, Epistemik-Zeile
   Jede Zahl kommt aus PP.model.compute (Ausgaben dieses oder des verknüpften
   Experiments) – hier wird nur formatiert, nie nachgerechnet.
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine, M = PP.model, U = PP.ui, T = PP.i18n.T;
  const S = U.S;
  const { esc } = U;
  const X = U.eqx, slot = X.slot;

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
    return '<details class="xr-box xr-dict xr-dict-c"><summary><b>' + esc(d.title) + '</b> ' + linkTo(exp, d) + '</summary>' + dictBody(d) + '</details>';
  }
  function epHTML(list) {
    return '<ul class="ep xr-ep">' + list.map((e) => '<li><span class="tag ' + e.type + '">' + esc(U.docs.EP_LABEL[e.type]) + '</span><span>' + esc(e.text) +
      (e.value ? slot(e.value, 2) : '') + (e.after ? esc(e.after) : '') + '</span></li>').join('') + '</ul>';
  }

  function html(exp) {
    const xr = exp.crossroads;
    const f = M.formOf(exp, S.form), prim = f.c.outputs.find((o) => o.primary) || f.c.outputs[0];
    const di = E.dimInfo(prim.dimv);
    return '<section class="xr" id="xr" aria-label="' + T('Schnittpunkt der Theorien', 'Crossroads of theories') + '">' +
      '<div class="xr-top"><div class="xr-left"><div class="xr-formula">' + X.formula(exp) + '</div>' +
      '<div class="xr-dim">' + T('Dimension von ', 'Dimension of ') + U.tex(prim.tex) + ': ' + U.tex(E.dimTex(prim.dimv)) + ' · ' + esc(di.name || '') + (U.unit(prim.dimv) ? ' · ' + esc(U.unit(prim.dimv)) : '') + '</div>' +
      X.legend(exp) + '<p class="xr-hint">' + esc(X.hint(exp)) + '</p>' +
      '<p class="xr-lead">' + esc(xr.lead) + ' <a href="#view=theorie&amp;sec=gap">' + esc(xr.gapLink) + '</a></p></div>' +
      X.card(exp) + '</div>' +
      '<div class="xr-grid">' + chainHTML(xr.chain) + ahaHTML(xr.aha) + '</div>' +
      (xr.dict ? dictHTML(exp, xr.dict) : '') +
      epHTML(xr.epistemic) + '</section>';
  }

  U.crossroads = { html, dictCompact };
})(globalThis.PP = globalThis.PP || {});
