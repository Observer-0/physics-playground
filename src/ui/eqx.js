/* =====================================================================
   Physics Playground — Interaktive Gleichung
   Zeichnet eine Formel aus src/data/equations.js mit anklickbaren Symbolen,
   eine Legende und eine Karte zum ausgewählten Symbol. Benutzt vom
   Schnittpunkt-Block der Hawking-Seite (crossroads.js) und vom Kopf aller
   übrigen Experimentseiten (lab.js).
   · Auswahl: Zeigen (Maus), Fokus (Tastatur), Klick oder Antippen; je
     Gleichung gemerkt in S.xsel
   · Zahlen-Platzhalter: update() füllt sie nach jeder Rechnung aus
     PP.model.compute – hier wird nur formatiert, nie nachgerechnet.
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine, M = PP.model, U = PP.ui, T = PP.i18n.T;
  const S = U.S;
  const { $, $$, esc } = U;

  /* ---------- Zahlen: Platzhalter, die update() nach jeder Rechnung füllt ---------- */
  // Die Quelle steht im Element selbst – so gibt es keine Liste, die beim Neuzeichnen eines Teils veraltet
  const slot = (src, digits) => '<span class="xv" data-xv="' + esc(JSON.stringify(src)) + '"' + (digits ? ' data-xd="' + digits + '"' : '') + '>—</span>';
  const formVars = () => M.formOf(S.exp, S.form).c.vars.map((v) => v.key);

  // src: { key, exp?, form?, at? } – Ausgabe eines Experiments; { var } – Eingabe; eine Liste – die erste, die hier bestimmbar ist.
  // Ergebnis { n, dimv } (n = null: nicht definiert) oder null, wenn die Zahl hier nicht bestimmbar ist
  function resolve(src) {
    if (Array.isArray(src)) {
      for (const s of src) { const r = resolve(s); if (r) return r; }
      return null;
    }
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
      let t;
      try { t = show(resolve(JSON.parse(el.dataset.xv)), Number(el.dataset.xd) || 3); } catch (_) { t = '—'; }
      if (el.textContent !== t) el.textContent = t;
    });
  }

  /* ---------- Daten ---------- */
  const of = (exp) => (exp && PP.equations && E.has(PP.equations.byId, exp.id) ? PP.equations.byId[exp.id] : null);
  // Ausgewähltes Symbol der Gleichung; null = Karte geschlossen. Beim ersten Besuch ist eq.pre ausgewählt,
  // damit sofort sichtbar ist, was die Karten zeigen.
  function sel(exp, eq) {
    if (!E.has(S.xsel, exp.id)) S.xsel[exp.id] = eq.pre || null;
    const k = S.xsel[exp.id];
    return k && E.has(eq.symbols, k) ? k : null;
  }
  // Ausgabe eines Experiments, in welcher Formel-Variante auch immer sie vorkommt
  const outputOf = (exp, key) => exp.forms.map((f) => f.c.outputs.find((o) => o.key === key)).find(Boolean);
  // Symbol-TeX für Legende und Karte: eigenes tex, sonst das der Konstante, Eingabe bzw. Ausgabe
  function symTex(exp, s) {
    if (s.tex) return s.tex;
    if (s.c) return M.C[s.c].tex;
    if (s.v) return exp.vars[s.v].tex;
    if (s.o) return outputOf(exp, s.o).tex;
    return '';
  }
  const unitText = (dimv) => {
    const u = U.unit(dimv), n = E.dimInfo(dimv).name;
    return u ? u + (n ? ' · ' + n : '') : T('1 (dimensionslos)', '1 (dimensionless)');
  };
  // Was die Karte über ein Symbol sagt: Name, Fakten [Beschriftung, HTML, Zusatz], Bedeutung.
  // Konstanten: Wert, Einheit und Quelle nur aus PP.model.C, die Bedeutung aus PP.equations.meaning.
  function info(exp, s) {
    const facts = [];
    let name = s.name, dimv = null, src = s.src;
    if (s.c) {
      const C = M.C[s.c], set = S.edit, u = U.unit(C.dimv);
      const shownExactly = C.kind === 'exact' && Number(C.value.toPrecision(12)) === C.value;
      facts.push([T('Wert', 'Value'), esc((shownExactly ? '= ' : '≈ ') + E.fmt(C.value, 12) + (u ? ' ' + u : '')),
        C.src + (C.u > 0 ? ' · ' + T('relative Unsicherheit ', 'relative uncertainty ') + E.fmt(C.u / C.value, 2) : '')]);
      // Break-Modus: veränderter Wert – Symbole mit Live-Knöpfen zeigen ihn dort an
      if (!s.live && E.has(S.consts[set], s.c)) facts.push([T('Break-Modus', 'Break mode'), '<span class="xr-brk">= ' + esc(E.fmt(S.consts[set][s.c], 4) + (u ? ' ' + u : '')) + '</span>']);
      // Ist die Konstante hier ein Regler (z. B. G bei der Newtonschen Gravitation), zählt der eingestellte Wert
      const linked = M.formOf(exp, S.form).c.vars.find((d) => d.constant === s.c);
      if (linked) facts.push([T('Hier eingestellt', 'Set here'), '≈ ' + slot({ var: linked.key })]);
      return { name: name || C.name, facts, meaning: s.meaning || PP.equations.meaning[s.c] };
    }
    if (s.n !== undefined) {
      const exact = Number(s.n.toPrecision(6)) === s.n; // ½ und −1 exakt, 8π gerundet
      facts.push([T('Wert', 'Value'), esc((exact ? '= ' : '≈ ') + E.fmt(s.n, 4)), T('reine Zahl ohne Einheit', 'pure number without a unit')]);
      return { name, facts, meaning: s.meaning };
    }
    if (s.v) { const d = exp.vars[s.v]; name = name || d.name; dimv = d.dimv; src = src || [{ var: s.v }, { key: s.v }]; }
    else if (s.o) { const o = outputOf(exp, s.o); name = name || o.name; dimv = o.dimv; src = src || [{ key: s.o }, { var: s.o }]; }
    else if (s.s) dimv = E.dimParse(exp.symbols[s.s].dim);
    else if (s.m) dimv = E.dimParse(s.dim || ''); // mathematische Funktion, meist dimensionslos
    // Eingabe nur in der aktiven Formel-Variante; sonst (z. B. A bei „aus der Masse“) wird die Größe berechnet
    const isInput = s.v && M.formOf(exp, S.form).c.vars.some((x) => x.key === s.v);
    if (src) facts.push([s.at || (isInput ? T('Eingestellt', 'Set to') : T('Berechnet', 'Computed')), '≈ ' + slot(src)]);
    facts.push([T('Einheit', 'Unit'), esc(unitText(dimv)), s.unitNote]);
    return { name, facts, meaning: s.meaning };
  }
  const texOf = (s) => PP.tex.render(s);

  /* ---------- Formel, Legende, Karte ---------- */
  function formula(exp) {
    const eq = of(exp), k = sel(exp, eq);
    const btn = (key, inner) => {
      const s = E.has(eq.symbols, key) ? eq.symbols[key] : null;
      if (!s) return inner;
      return '<button type="button" class="xsym xc-' + s.color + '" data-xs="' + key + '" aria-pressed="' + (k === key) + '" aria-controls="xr-card" title="' + esc(s.tag) + '">' + inner + '</button>';
    };
    return '<span class="math">' + PP.tex.render(eq.tex, { sym: btn }) + '</span>';
  }
  function legend(exp) {
    const eq = of(exp), k = sel(exp, eq);
    return '<div class="xr-legend" role="group" aria-label="' + esc(eq.legend || T('Symbole der Gleichung', 'Symbols of the equation')) + '">' + Object.keys(eq.symbols).map((key) => {
      const s = eq.symbols[key];
      return '<button type="button" class="xr-chip" data-xs="' + key + '" aria-pressed="' + (k === key) + '" aria-controls="xr-card"><span class="math xc xc-' + s.color + '">' + texOf(symTex(exp, s)) + '</span><span>' + esc(s.tag) + '</span></button>';
    }).join('') + '</div>';
  }
  const hint = (exp) => {
    const eq = of(exp);
    return (eq && eq.hint) || T('Zeig auf ein Symbol oder tippe es an: Was bedeutet es, und welche Rolle spielt es in dieser Gleichung?', 'Point at a symbol or tap it: what does it mean, and what role does it play in this equation?');
  };

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
  function cardInner(exp) {
    const eq = of(exp), k = sel(exp, eq), s = k ? eq.symbols[k] : null;
    if (!s) return '<p class="xr-hint">' + esc(hint(exp)) + '</p>';
    const d = info(exp, s);
    return '<div class="xr-card-h"><span class="math xc xc-' + s.color + '">' + texOf(symTex(exp, s)) + '</span>' +
      '<span class="xr-card-t"><b>' + esc(d.name) + '</b><small>' + esc(s.tag) + '</small></span>' +
      '<button type="button" class="xr-x" data-xclose aria-label="' + T('Erklärung schließen', 'Close explanation') + '" title="' + T('Schließen (Esc)', 'Close (Esc)') + '">×</button></div>' +
      '<dl class="xr-facts">' + d.facts.map(([label, v, note]) => '<dt>' + esc(label) + '</dt><dd><span class="xr-fv">' + v + '</span>' + (note ? '<small>' + esc(note) + '</small>' : '') + '</dd>').join('') + '</dl>' +
      (d.meaning ? '<p class="xr-mean">' + esc(d.meaning) + '</p>' : '') +
      '<p class="xr-role"><b>' + T('In dieser Gleichung: ', 'In this equation: ') + '</b>' + esc(s.role) + '</p>' +
      (s.limit ? '<div class="xr-lim"><div class="xr-lim-f">' + U.tex(s.limit) + '</div><p>' + esc(s.limitText) + '</p></div>' : '') +
      (s.live ? liveHTML(s.live) : '');
  }
  function cardClass(exp) {
    const eq = of(exp), k = sel(exp, eq);
    return 'xr-card' + (k ? ' xc-' + eq.symbols[k].color : '');
  }
  // tabindex: Nach dem Schließen bekommt die Karte den Fokus, damit er nicht verloren geht
  const card = (exp) => '<div class="' + cardClass(exp) + '" id="xr-card" tabindex="-1">' + cardInner(exp) + '</div>';
  // Kopf der Experimentseiten ohne Schnittpunkt-Block: Formel, darunter top (Dimension, Typ …), Legende, Hinweis; daneben die Karte
  function hero(exp, top) {
    return '<div class="xr-top"><div class="xr-left"><div class="big">' + formula(exp) + '</div>' + top +
      legend(exp) + '<p class="xr-hint">' + esc(hint(exp)) + '</p></div>' + card(exp) + '</div>';
  }

  /* ---------- Bedienung ---------- */
  function pick(el, k) {
    const exp = S.exp, eq = of(exp);
    if (!eq || (k !== null && !E.has(eq.symbols, k)) || sel(exp, eq) === k) return;
    S.xsel[exp.id] = k;
    const c = $('#xr-card', el);
    if (c) { c.className = cardClass(exp); c.innerHTML = cardInner(exp); }
    $$('[data-xs]', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.xs === k)));
    update();
  }
  // Symbol, auf dem der Mauszeiger beim Schließen ruht: Es öffnet die Karte erst wieder, wenn der Zeiger es verlassen hat
  let quiet = null;
  // Letzte echte Mausposition. Ein mouseover an genau dieser Stelle kommt nicht von der Maus, sondern davon, dass sich
  // der Inhalt unter dem stillstehenden Zeiger verschoben hat (Mausrad, Neuzeichnen nach einem Live-Knopf) – das soll
  // keine andere Karte öffnen. Der Browser meldet mouseover vor dem mousemove derselben Bewegung.
  let lastMove = null;
  if (typeof document !== 'undefined') document.addEventListener('mousemove', (e) => { lastMove = e.clientX + ',' + e.clientY; }, { capture: true, passive: true });
  // Karte schließen (×, Esc). Lag der Fokus in der Karte, geht er auf die Karte selbst – ihr Inhalt wird gleich ersetzt.
  function close(el) {
    const c = $('#xr-card', el), inCard = c && c.contains(document.activeElement);
    const h = $('[data-xs]:hover', el);
    quiet = h ? h.dataset.xs : null;
    pick(el, null);
    if (inCard) c.focus({ preventScroll: true });
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
    if (!of(S.exp)) return;
    const over = (e) => {
      const b = e.target.closest('[data-xs]'), k = b && el.contains(b) ? b.dataset.xs : null;
      if (e.type === 'mouseover') {
        if (lastMove === e.clientX + ',' + e.clientY) return;
        if (quiet !== null) { if (k === quiet) return; quiet = null; }
      }
      if (k) pick(el, k);
    };
    el.addEventListener('mouseover', over);
    el.addEventListener('focusin', over);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-xs]');
      if (b) { pick(el, b.dataset.xs); return; }
      if (e.target.closest('[data-xclose]')) { close(el); return; }
      const l = e.target.closest('[data-live]');
      if (l) live(l.dataset.live, l.dataset.f);
    });
  }
  // Esc (lab.js ruft das auf, wenn kein Speichern/Teilen-Fenster offen ist): Karte schließen, wo auch immer der Fokus steht.
  // Rückgabe: ob etwas geschlossen wurde
  function escape(el) {
    const eq = of(S.exp);
    if (!eq || !sel(S.exp, eq)) return false;
    close(el || document);
    return true;
  }

  U.eqx = { of, formula, legend, hint, card, hero, bind, escape, slot, update, resolve };
})(globalThis.PP = globalThis.PP || {});
