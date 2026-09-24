/* =====================================================================
   Physics Playground — experiment view: parameters, results, status,
   graph, visualization, compare mode, save/share
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine, M = PP.model, U = PP.ui, T = PP.i18n.T;
  const S = U.S;
  const { $, $$, esc } = U;

  const CAT = PP.i18n.localize({
    math: { de: 'Mathematisch undefiniert', en: 'Mathematically undefined' }, numeric: { de: 'Numerisch problematisch', en: 'Numerically problematic' },
    unreal: { de: 'Physikalisch unrealistisch', en: 'Physically unrealistic' }, model: { de: 'Außerhalb des Modells', en: 'Outside the model' },
    info: { de: 'Hinweis', en: 'Note' }, assume: { de: 'Modellannahme', en: 'Model assumption' },
  });
  const CAT_ORDER = ['math', 'numeric', 'unreal', 'model', 'info', 'assume'];
  const ANIM = new Set(['spring', 'circular', 'wavefunction', 'relativity', 'blackhole', 'horizon', 'spacetime']);
  const VIZ_CATS = ['math', 'numeric', 'unreal', 'model'];
  const form = () => M.formOf(S.exp, S.form);

  /* ---------- slider mapping ---------- */
  function toPos(d, x) {
    let p;
    if (d.scale === 'log') p = x > 0 ? (Math.log10(x) - Math.log10(d.min)) / (Math.log10(d.max) - Math.log10(d.min)) : 0;
    else if (d.scale === 'toone') {
      const k = d.toone || 9;
      if (!(x > 0)) p = 0;
      else if (x <= 0.9) p = (0.4 * x) / 0.9;
      else if (x >= 1) p = 1;
      else p = 0.4 + (0.6 * (-Math.log10(1 - x) - 1)) / (k - 1);
    } else p = (x - d.min) / (d.max - d.min);
    return Math.max(0, Math.min(1, Number.isFinite(p) ? p : 0));
  }
  function fromPos(d, p) {
    let x;
    if (d.scale === 'log') x = Math.pow(10, Math.log10(d.min) + p * (Math.log10(d.max) - Math.log10(d.min)));
    else if (d.scale === 'toone') {
      const k = d.toone || 9;
      x = p <= 0.4 ? (p / 0.4) * 0.9 : 1 - Math.pow(10, -(1 + ((p - 0.4) / 0.6) * (k - 1)));
      if (p >= 1) x = 1 - Math.pow(10, -k);
    } else x = d.min + p * (d.max - d.min);
    if (d.integer) x = Math.round(x);
    else if (d.scale === 'log') x = Number(x.toPrecision(4));
    else if (d.scale === 'lin') x = Number(x.toPrecision(4));
    return x;
  }
  const outOfRange = (d, x) => !(x >= d.min && x <= d.max) || (d.positive && !(x > 0));
  const SCL = { log: 'log', lin: 'lin', toone: '→1' };

  /* ---------- computation ---------- */
  function computeSet(set) {
    return M.compute(S.exp, S.form, S.vals[set], { consts: S.consts[set] });
  }
  function recompute() {
    S.res = { A: computeSet('A') };
    if (S.cmp) S.res.B = computeSet('B');
    if (S.base && S.base.form === S.form) S.baseRes = M.compute(S.exp, S.form, S.base.vals, { consts: S.base.consts, skipChecks: true });
    else S.baseRes = null;
  }

  function digitsFor(o, set) {
    const base = o.digits || 6;
    if (Object.keys(S.consts[set]).length) return { d: base, u: null };
    let u = null;
    try { u = M.uncertainty(S.exp, S.form, S.vals[set], o.key); } catch (_) { u = null; }
    if (u && u.rel > 0) return { d: Math.max(2, Math.min(base, Math.ceil(-Math.log10(u.rel)) + 1)), u };
    return { d: base, u };
  }
  function fmtR(r, digits) {
    if (!r) return '—';
    if (!r.ok) return null;
    return E.fmt(U.num(r), digits);
  }
  function altR(o, r) {
    if (!o.alt || !r || !r.ok || r.s === 0) return '';
    const div = M.C[o.alt.div].value;
    return E.fmt({ s: r.s, l: r.l - Math.log10(div), d: NaN }, 4) + ' ' + o.alt.unit;
  }
  function ratio(rA, rB) {
    if (!rA || !rB || !rA.ok || !rB.ok) return { t: '—', p: '' };
    if (rA.s === 0) return { t: rB.s === 0 ? '×1' : '—', p: '' };
    if (rB.s === 0) return { t: '×0', p: '−100 %' };
    const s = rA.s * rB.s, l = rB.l - rA.l;
    const t = '×' + E.fmt({ s, l, d: NaN }, 4);
    let p = '';
    if (Math.abs(l) < 7) {
      const pct = (s * Math.pow(10, l) - 1) * 100;
      if (Math.abs(pct) < 5e-7) p = '±0 %';
      else p = (pct > 0 ? '+' : '') + E.fmt(pct, 3) + ' %';
    } else p = (s > 0 && l > 0 ? '+' : '') + '≈ 10' + E.sup(Math.round(l)) + ' %';
    return { t, p };
  }

  /* ---------- page ---------- */
  function headerHTML(exp) {
    const hasVars = exp.forms.some((f) => f.vars.length);
    return '<header class="xhead">' +
      '<div><div class="crumb">' + esc(exp.group) + '</div><h1>' + esc(exp.title) + '</h1>' + (exp.subtitle ? '<div class="sub">' + esc(exp.subtitle) + '</div>' : '') + '</div>' +
      (exp.hall ? '' : '<div class="eq">' + U.tex(exp.tex) + '</div>') +
      '<div class="acts">' +
      (hasVars ? '<button class="btn' + (S.cmp ? ' on' : '') + '" data-a="cmp" aria-pressed="' + S.cmp + '">' + T('Vergleich A/B', 'Compare A/B') + '</button>' +
        '<button class="btn" data-a="reset" title="' + T('Alle Werte auf den Ausgangszustand', 'Reset all values to the starting state') + '">' + T('Zurücksetzen', 'Reset') + '</button>' : '') +
      '<button class="btn" data-a="save">' + T('Speichern', 'Save') + '</button>' +
      '<button class="btn" data-a="share">' + T('Teilen', 'Share') + '</button>' +
      '<div class="pop" id="pop" hidden></div>' +
      '</div></header>';
  }
  function heroHTML(exp) {
    const f = form();
    const prim = f.c.outputs.find((o) => o.primary) || f.c.outputs[0];
    const di = E.dimInfo(prim.dimv);
    const m = exp.meta || {};
    return '<section class="hero">' +
      '<div class="big">' + U.tex(exp.tex) + '</div>' +
      '<div class="dimline"><span>' + T('Dimension von ', 'Dimension of ') + U.tex(prim.tex) + '</span>' + U.tex(E.dimTex(prim.dimv)) + '<span>' + esc(di.name || '') + (U.unit(prim.dimv) ? ' · ' + esc(U.unit(prim.dimv)) : '') + '</span></div>' +
      '<div class="meta-row">' +
      (m.mathType ? '<span><b>' + T('Typ', 'Type') + '</b>' + esc(m.mathType) + '</span>' : '') +
      (m.mainDim ? '<span><b>' + T('Hauptdimension', 'Main dimension') + '</b>' + esc(m.mainDim) + '</span>' : '') +
      (m.domain ? '<span><b>' + T('Gebiet', 'Field') + '</b>' + esc(m.domain) + '</span>' : '') +
      '</div></section>';
  }
  function labHTML(exp) {
    const f = form();
    const hasVars = f.c.vars.length > 0;
    const showGraph = !!S.graph && hasVars;
    const vc = (exp.vizControls || []).map((c) => '<label class="switch plain"><input type="checkbox" data-vo="' + c.key + '"' + (S.vizOpts[c.key] ? ' checked' : '') + '><span>' + esc(c.label) + '</span></label>').join('') +
      (exp.sweep ? '<button class="btn sm" data-v="sweep"></button>' : '') +
      (ANIM.has(exp.viz) ? '<button class="btn sm" data-v="pause"></button>' : '');
    const forms = exp.forms.length > 1
      ? '<div class="seg" role="group" aria-label="' + T('Formel-Variante', 'Formula variant') + '">' + exp.forms.map((x) => '<button data-form="' + x.id + '" class="' + (x.id === S.form ? 'on' : '') + '">' + esc(x.label) + '</button>').join('') + '</div>' : '';
    const ab = S.cmp ? '<div class="seg" role="group" aria-label="' + T('Parametersatz bearbeiten', 'Edit parameter set') + '"><button data-edit="A" class="' + (S.edit === 'A' ? 'on' : '') + '">' + T('Satz A', 'Set A') + '</button><button data-edit="B" class="' + (S.edit === 'B' ? 'on' : '') + '">' + T('Satz B', 'Set B') + '</button></div>' : '';
    const presets = (exp.presets || []).filter((p) => !p.form || p.form === S.form);
    return '<div class="lab" id="lab">' +
      '<div class="stage">' +
      '<section class="panel"><div class="ph"><h3>' + T('Visualisierung', 'Visualisation') + (S.cmp ? T(' · Satz ', ' · Set ') + S.edit : '') + '</h3><span class="vbadges" id="vbadges"></span>' + vc + '</div><div class="vizwrap"><canvas id="vizc" role="img" aria-label="' + T('Visualisierung von ', 'Visualisation of ') + esc(exp.title) + '"></canvas></div></section>' +
      (showGraph ? '<section class="panel" id="gpanel"></section>' : '') +
      '</div>' +
      '<div class="controls">' +
      '<section class="panel"><div class="ph"><h3>' + T('Parameter', 'Parameters') + '</h3>' + ab + '</div>' +
      '<div class="pb">' + (forms ? '<div style="margin-bottom:10px">' + forms + '</div>' : '') +
      (presets.length ? '<div class="presets">' + presets.map((p) => '<button class="chip" data-preset="' + exp.presets.indexOf(p) + '">' + esc(p.name) + '</button>').join('') + '</div><div class="pnote" id="pnote"></div>' : '') +
      '<div id="prms"></div><div id="cprms"></div></div></section>' +
      '<section class="panel"><div class="ph"><h3>' + T('Ergebnis', 'Result') + '</h3></div><div class="pb" id="res" aria-live="polite"></div></section>' +
      '<section class="panel"><div class="ph"><h3>' + T('Physikalischer Status', 'Physical status') + '</h3></div><div class="pb" id="stat"></div></section>' +
      '</div></div>';
  }

  function render(el) {
    const exp = S.exp;
    const tabs = exp.hall
      ? [['formula', T('Formel', 'Formula')], ['dims', T('Dimensionen', 'Dimensions')], ['physics', T('Physik', 'Physics')], ['lab', T('Graph & Labor', 'Graph & lab')]]
      : [['formula', T('Formel & Variablen', 'Formula & variables')], ['dims', T('Dimensionsanalyse', 'Dimensional analysis')], ['physics', T('Physik & Grenzen', 'Physics & limits')]];
    if (!tabs.some((t) => t[0] === S.tab)) S.tab = tabs[0][0];
    let h = '<div class="' + (exp.hall ? 'hallx' : '') + '">' + headerHTML(exp);
    if (exp.hall) h += heroHTML(exp);
    else h += labHTML(exp);
    h += '<div class="tabs" role="tablist">' + tabs.map(([k, t]) => '<button role="tab" aria-selected="' + (S.tab === k) + '" data-tab="' + k + '" class="' + (S.tab === k ? 'on' : '') + '">' + t + '</button>').join('') + '</div>';
    h += '<div id="tabc"></div></div>';
    el.innerHTML = h;
    bindPage(el);
    renderTab();
    if (!exp.hall) mountLab();
  }

  function renderTab() {
    const c = $('#tabc');
    if (!c) return;
    if (S.tab === 'lab') { c.innerHTML = labHTML(S.exp); mountLab(); return; }
    if (S.exp.hall) unmountLab(true);
    recompute();
    if (S.tab === 'formula') c.innerHTML = U.docs.formula();
    else if (S.tab === 'physics') c.innerHTML = U.docs.physics();
    else if (S.tab === 'dims') { c.innerHTML = U.dims.page(); U.dims.bind(c); }
  }

  function bindPage(el) {
    el.addEventListener('click', (e) => {
      const t = e.target.closest('button');
      if (!t || !el.contains(t)) return;
      if (t.dataset.tab) {
        S.tab = t.dataset.tab;
        $$('.tabs button', el).forEach((b) => { b.classList.toggle('on', b === t); b.setAttribute('aria-selected', b === t); });
        renderTab(); U.writeHash(); return;
      }
      const a = t.dataset.a;
      if (a === 'cmp') {
        S.cmp = !S.cmp;
        if (S.cmp) { S.vals.B = Object.assign({}, S.vals.A); S.consts.B = Object.assign({}, S.consts.A); }
        S.edit = 'A';
        U.render(false);
      } else if (a === 'reset') {
        U.loadExp(S.exp.id, { form: S.form, tab: S.tab, cmp: S.cmp });
        U.render(false);
      } else if (a === 'save') openPop('save', t);
      else if (a === 'share') openPop('share', t);
      else if (a === 'dosave') {
        const name = ($('#savename').value || '').trim() || S.exp.title;
        if (U.saved.add(name)) { U.toast(T('Gespeichert: ', 'Saved: ') + name); closePop(); U.render(false); }
        else U.toast(T('Speichern nicht möglich – der Browser-Speicher ist hier gesperrt', 'Cannot save – browser storage is blocked here'));
      } else if (a === 'copylink' || a === 'copycode') {
        const inp = $(a === 'copylink' ? '#sharelink' : '#sharecode');
        U.copy(inp.value).then((ok) => U.toast(ok ? T('Kopiert', 'Copied') : T('Kopieren fehlgeschlagen – bitte manuell markieren', 'Copying failed – please select the text manually')));
      } else if (a === 'closepop') closePop();
    });
    document.addEventListener('keydown', escClose);
    U.teardown = () => { document.removeEventListener('keydown', escClose); unmountLab(); };
  }
  function escClose(e) { if (e.key === 'Escape') closePop(); }
  function openPop(kind, btn) {
    const p = $('#pop');
    if (!p) return;
    if (!p.hidden && p.dataset.kind === kind) return closePop();
    p.dataset.kind = kind;
    const st = U.stateString();
    if (kind === 'save') {
      p.innerHTML = '<label for="savename">' + T('Name für diesen Zustand', 'Name for this state') + '</label><input id="savename" value="' + esc(S.exp.title + (S.cmp ? ' (A/B)' : '')) + '"><div class="row"><button class="btn on" data-a="dosave">' + T('Speichern', 'Save') + '</button><button class="btn" data-a="closepop">' + T('Abbrechen', 'Cancel') + '</button></div><div class="faint" style="font-size:12px">' + T('Wird lokal in diesem Browser gespeichert.', 'Stored locally in this browser.') + '</div>';
    } else {
      let href = '';
      try { href = location.href.split('#')[0] + '#' + st; } catch (_) { href = '#' + st; }
      p.innerHTML = '<label for="sharelink">' + T('Link auf genau diesen Zustand', 'Link to exactly this state') + '</label><div class="row"><input id="sharelink" readonly value="' + esc(href) + '"><button class="btn sm" data-a="copylink">' + T('Kopieren', 'Copy') + '</button></div>' +
        '<label for="sharecode">' + T('Zustands-Code (zum Einfügen unter „Gespeichert“)', 'State code (to paste under “Saved”)') + '</label><div class="row"><input id="sharecode" readonly value="' + esc(st) + '"><button class="btn sm" data-a="copycode">' + T('Kopieren', 'Copy') + '</button></div>' +
        '<div class="faint" style="font-size:12px">' + T('Wenn die App in einer Vorschau läuft, funktioniert der Code zuverlässiger als der Link.', 'If the app is running inside a preview, the code works more reliably than the link.') + '</div>';
    }
    p.hidden = false;
    const f = p.querySelector('input'); if (f) { f.focus(); f.select(); }
    if (kind === 'save') f.addEventListener('keydown', (e) => { if (e.key === 'Enter') p.querySelector('[data-a="dosave"]').click(); });
  }
  function closePop() { const p = $('#pop'); if (p) p.hidden = true; }

  /* ---------- lab mount ---------- */
  let raf = 0, lastTs = 0, ro = null;
  S.plots = [];

  function mountLab() {
    unmountLab(true);
    const lab = $('#lab');
    if (!lab) return;
    recompute();
    renderParams();
    renderGraphPanel();
    update();
    lab.addEventListener('input', onLabInput);
    lab.addEventListener('change', onLabChange);
    lab.addEventListener('click', onLabClick);
    lab.addEventListener('focusout', onLabBlur);
    lab.addEventListener('keydown', onLabKey);
    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(() => { drawViz(); S.plots.forEach((p) => p.draw()); });
      $$('canvas', lab).forEach((c) => ro.observe(c));
    }
    lastTs = 0;
    if (typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(tick);
  }
  function unmountLab(keepListeners) {
    if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
    raf = 0;
    if (ro) { ro.disconnect(); ro = null; }
    S.plots = [];
    S.playing = false;
    stopSweep(true);
    pauseShown = null;
    void keepListeners;
  }

  function tick(ts) {
    raf = requestAnimationFrame(tick);
    const dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0;
    lastTs = ts;
    if (!$('#vizc')) return;
    if (document.hidden) return;
    if (S.playing) {
      const exp = S.exp, k = exp.animateVar, d = exp.vars[k];
      let lim = d.max;
      if (exp.animateUntil) {
        const r = S.res.A && S.res[S.edit].out[exp.animateUntil];
        if (r && r.ok && r.value > 0 && isFinite(r.value)) lim = Math.min(lim, r.value);
      }
      let x = S.vals[S.edit][k] + dt;
      if (x >= lim) { x = lim; S.playing = false; }
      S.vals[S.edit][k] = x;
      update();
      if (!S.playing) renderParams();
      return;
    }
    if (S.sweep) {
      const sw = S.sweep, cfg = sw.cfg;
      sw.ph += dt;
      sw.vals[sw.key] = Number((sw.base * Math.pow(cfg.span, Math.sin((2 * Math.PI * sw.ph) / cfg.period))).toPrecision(6));
      if (!S.paused && !S.vizFrozen && ANIM.has(S.exp.viz)) S.clock += dt;
      update();
      return;
    }
    if (pauseShown !== S.paused) syncVizButtons();
    if (!S.paused && !S.vizFrozen && ANIM.has(S.exp.viz)) { S.clock += dt; drawViz(); }
  }

  /* ---------- Knöpfe der Visualisierung: Anhalten, Pendeln ---------- */
  let pauseShown = null;
  function syncVizButtons() {
    pauseShown = S.paused;
    const p = $('[data-v="pause"]');
    if (p) {
      p.textContent = S.paused ? T('Abspielen', 'Play') : T('Anhalten', 'Pause');
      p.setAttribute('aria-pressed', String(S.paused));
      p.title = T('Gilt für alle Animationen, wie der Schalter „Animationen“', 'Applies to all animations, like the “Animations” switch');
    }
    const s = $('[data-v="sweep"]');
    if (s && S.exp.sweep) {
      s.textContent = S.sweep ? T('Pendeln anhalten', 'Stop oscillating') : S.exp.sweep.label;
      s.classList.toggle('on', !!S.sweep);
      s.setAttribute('aria-pressed', String(!!S.sweep));
    }
  }
  // Pendeln: der Wert schwingt um seinen Ausgangswert (Faktor span hoch ±1), alles andere rechnet live mit
  function startSweep() {
    const k = S.exp.sweep.key, x = S.vals[S.edit][k];
    if (!(x > 0) || !isFinite(x)) { U.toast(T('Pendeln geht nur mit einem positiven Wert', 'Oscillating only works with a positive value')); return; }
    S.playing = false;
    S.sweep = { set: S.edit, vals: S.vals[S.edit], key: k, base: x, ph: 0, cfg: S.exp.sweep };
  }
  function stopSweep(restore) {
    if (!S.sweep) return;
    // Nach Zurücksetzen oder Wechsel des Experiments gibt es neue Wertesätze – dann nichts zurückschreiben
    if (restore && S.vals[S.sweep.set] === S.sweep.vals) S.sweep.vals[S.sweep.key] = S.sweep.base;
    S.sweep = null;
    syncVizButtons();
  }
  function renderVizBadges() {
    const b = $('#vbadges');
    const res = S.res[S.edit] || S.res.A;
    const cats = new Set(res.issues.map((i) => i.cat));
    S.vizFrozen = cats.has('math');
    if (!b) return;
    const on = VIZ_CATS.filter((c) => cats.has(c));
    const key = on.join() + '|' + PP.i18n.lang;
    if (b.dataset.k === key) return;
    b.dataset.k = key;
    b.innerHTML = on.map((c) => '<span class="vb vb-' + c + '">' + esc(CAT[c]) + '</span>').join('');
  }
  function baseLabel() {
    const p = S.base && S.base.preset;
    return p ? T('Preset „' + p.name + '“', 'preset “' + p.name + '”') : T('Ausgangswerte', 'starting values');
  }

  /* ---------- parameters ---------- */
  function prmHTML(d, x) {
    const locked = d.constant && !S.brk;
    const off = outOfRange(d, x) && !(d.constant && x === M.C[d.constant].value);
    const di = U.unit(d.dimv);
    let extra = '';
    if (d.constant) {
      const c = M.C[d.constant];
      extra += '<span>' + T('Naturkonstante · ', 'Constant of nature · ') + esc(M.KIND_LABEL[c.kind]) + '</span>';
      if (S.brk) extra += ' <button class="btn sm" data-op="div" data-k="' + d.key + '">÷10</button><button class="btn sm" data-op="mul" data-k="' + d.key + '">×10</button><button class="btn sm" data-op="orig" data-k="' + d.key + '">' + T('Originalwert', 'Original value') + '</button>';
      else extra += ' <span class="faint">' + T('· im Break-Modus veränderbar', '· adjustable in Break mode') + '</span>';
    } else if (S.brk) {
      extra += '<button class="btn sm" data-op="neg" data-k="' + d.key + '" title="' + T('Vorzeichen umkehren', 'Flip sign') + '">±</button><button class="btn sm" data-op="div" data-k="' + d.key + '">÷10</button><button class="btn sm" data-op="mul" data-k="' + d.key + '">×10</button>';
    }
    if (S.exp.animateVar === d.key) {
      extra += '<button class="btn sm' + (S.playing ? ' on' : '') + '" data-op="play" data-k="' + d.key + '">' + (S.playing ? T('Anhalten', 'Pause') : T('Zeit laufen lassen', 'Let time run')) + '</button>';
    }
    if (off && !locked) extra += '<span style="color:var(--red)">' + T('außerhalb des Slider-Bereichs', 'outside the slider range') + '</span>';
    return '<div class="prm' + (locked ? ' locked' : '') + (off ? ' off' : '') + '" data-k="' + d.key + '">' +
      '<div class="lab2">' + U.tex(d.tex) + '<span class="nm" title="' + esc(d.name) + '">' + esc(d.name) + '</span></div>' +
      '<div class="valbox"><input class="num" data-k="' + d.key + '" value="' + esc(U.fmtInput(x)) + '" inputmode="decimal" spellcheck="false" aria-label="' + esc(d.name) + ' in ' + esc(di || T('Einheit 1', 'unit 1')) + '"' + (locked ? ' readonly' : '') + '><span class="unit">' + esc(di) + '</span></div>' +
      '<div class="sl"><input type="range" min="0" max="1000" step="1" data-k="' + d.key + '" aria-label="' + esc(d.name) + T(' Schieberegler', ' slider') + '"' + (locked ? ' disabled' : '') + '><span class="scl">' + SCL[d.scale] + '</span></div>' +
      (extra ? '<div class="extra">' + extra + '</div>' : '') +
      '</div>';
  }
  function usedConstants() {
    const f = form();
    const set = new Set();
    const varKeys = new Set(f.c.vars.map((v) => v.key));
    f.c.outputs.forEach((o) => E.symbolsIn(o.ast).forEach((s) => { if (M.C[s] && !varKeys.has(s) && M.C[s].kind !== 'math') set.add(s); }));
    return [...set];
  }
  function renderParams() {
    const box = $('#prms');
    if (!box) return;
    const f = form();
    const vals = S.vals[S.edit];
    box.innerHTML = f.c.vars.length
      ? f.c.vars.map((d) => prmHTML(d, vals[d.key])).join('')
      : '<p class="muted" style="margin:0;font-size:13px">' + T('Keine freien Parameter: Hier rechnen nur Naturkonstanten.', 'No free parameters: only constants of nature go into this calculation.') + (S.brk ? T(' Unten kannst du sie verstellen.', ' You can adjust them below.') : T(' Im Break-Modus kannst du sie verstellen.', ' You can adjust them in Break mode.')) + '</p>';
    const cb = $('#cprms');
    if (S.brk) {
      const cs = usedConstants();
      const cv = S.consts[S.edit];
      cb.innerHTML = cs.length ? '<div class="side-lbl" style="margin-top:14px">' + T('Naturkonstanten in diesen Formeln', 'Constants of nature in these formulas') + '</div>' + cs.map((k) => {
        const c = M.C[k];
        const x = k in cv ? cv[k] : c.value;
        const changed = k in cv && Math.abs(x / c.value - 1) > 1e-12;
        return '<div class="prm' + (changed ? ' off' : '') + '" data-c="' + k + '"><div class="lab2">' + U.tex(c.tex) + '<span class="nm">' + esc(c.name) + '</span></div>' +
          '<div class="valbox"><input class="num" data-c="' + k + '" value="' + esc(U.fmtInput(x)) + '" inputmode="decimal" aria-label="' + esc(c.name) + '"><span class="unit">' + esc(U.unit(c.dimv)) + '</span></div>' +
          '<div class="extra"><button class="btn sm" data-cop="div" data-c="' + k + '">÷10</button><button class="btn sm" data-cop="mul" data-c="' + k + '">×10</button><button class="btn sm" data-cop="orig" data-c="' + k + '">' + T('Originalwert', 'Original value') + '</button>' + (changed ? '<span style="color:var(--red)">' + T('verändert: ×', 'changed: ×') + esc(E.fmt(x / c.value, 3)) + '</span>' : '') + '</div></div>';
      }).join('') : '';
    } else cb.innerHTML = '';
    syncInputs();
  }
  function syncInputs() {
    const vals = S.vals[S.edit];
    $$('#prms input[type=range]').forEach((r) => {
      const d = S.exp.vars[r.dataset.k];
      const p = toPos(d, vals[d.key]) * 1000;
      r.value = String(Math.round(p));
      r.style.setProperty('--p', (p / 10) + '%');
    });
    $$('#prms input.num').forEach((i) => {
      if (i === document.activeElement) return;
      i.value = U.fmtInput(vals[i.dataset.k]);
      i.classList.remove('bad');
    });
  }
  function setVal(k, x, fromSlider) {
    const d = S.exp.vars[k];
    const vals = S.vals[S.edit];
    if (!S.brk && !fromSlider) {
      if (d.constant) return false;
      if (d.integer) x = Math.round(x);
      const clamped = Math.min(d.max, Math.max(d.min, x));
      if (clamped !== x) U.toast(d.label + T(': regulärer Bereich ', ': regular range ') + E.fmt(d.min, 3) + ' … ' + E.fmt(d.max, 3) + T(' – im Break-Modus frei', ' – unrestricted in Break mode'));
      x = clamped;
    }
    const wasOff = outOfRange(d, vals[k]);
    if (S.sweep && S.sweep.key === k) stopSweep(false);
    vals[k] = x;
    if (S.preset !== null) { S.preset = null; const n = $('#pnote'); if (n) n.textContent = ''; $$('.presets .chip').forEach((c) => c.classList.remove('on')); }
    if (wasOff !== outOfRange(d, x) && S.brk) { renderParams(); }
    if (fromSlider) scheduleUpdate(); else update();
    return true;
  }
  let pending = false;
  function scheduleUpdate() {
    if (typeof requestAnimationFrame !== 'function') return update();
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; update(); });
  }
  function onLabInput(e) {
    const t = e.target;
    if (t.type === 'range' && t.dataset.k) {
      const d = S.exp.vars[t.dataset.k];
      setVal(d.key, fromPos(d, Number(t.value) / 1000), true);
    }
  }
  function commitNum(t) {
    const x = U.parseNum(t.value);
    if (x === null) { t.classList.add('bad'); t.title = T('Nicht lesbar. Beispiele: 6.674e-11 · 1,5 · 3×10^8 · 2*M_sun', 'Not readable. Examples: 6.674e-11 · 1.5 · 3×10^8 · 2*M_sun'); return; }
    t.classList.remove('bad'); t.title = '';
    if (t.dataset.c) { S.consts[S.edit][t.dataset.c] = x; renderParams(); update(); return; }
    const d = S.exp.vars[t.dataset.k];
    if (!S.brk && d.positive && !(x > 0)) { t.classList.add('bad'); U.toast(d.label + T(' muss positiv sein – im Break-Modus erlaubt', ' must be positive – allowed in Break mode')); return; }
    setVal(t.dataset.k, x, false);
    t.value = U.fmtInput(S.vals[S.edit][t.dataset.k]);
  }
  function onLabChange(e) {
    const t = e.target;
    if (t.classList.contains('num')) commitNum(t);
    else if (t.dataset.vo) { S.vizOpts[t.dataset.vo] = t.checked; drawViz(); }
    else if (t.dataset.g) onGraphSelect(t);
  }
  function onLabKey(e) {
    if (e.key === 'Enter' && e.target.classList.contains('num')) { e.preventDefault(); commitNum(e.target); }
  }
  function onLabBlur(e) {
    const t = e.target;
    if (t.classList && t.classList.contains('num') && !t.classList.contains('bad')) {
      const v = t.dataset.c ? (S.consts[S.edit][t.dataset.c] ?? M.C[t.dataset.c].value) : S.vals[S.edit][t.dataset.k];
      t.value = U.fmtInput(v);
    }
  }
  function onLabClick(e) {
    const b = e.target.closest('button');
    if (!b) return;
    const vals = S.vals[S.edit];
    if (b.dataset.preset !== undefined) {
      stopSweep(false);
      const p = S.exp.presets[Number(b.dataset.preset)];
      Object.assign(vals, p.values);
      S.consts[S.edit] = {};
      S.base = { vals: Object.assign({}, vals), consts: {}, form: S.form, preset: p };
      S.preset = p;
      S.playing = false;
      $$('.presets .chip').forEach((c) => c.classList.toggle('on', c === b));
      const n = $('#pnote'); if (n) n.textContent = p.note ? p.note : '';
      renderParams(); update();
    } else if (b.dataset.v) {
      if (b.dataset.v === 'pause') {
        S.paused = !S.paused;
        const a = $('#anim'); if (a) a.checked = !S.paused;
      } else if (S.sweep) { stopSweep(true); update(); }
      else startSweep();
      syncVizButtons();
    } else if (b.dataset.op) {
      const k = b.dataset.k, d = S.exp.vars[k];
      if (S.sweep && S.sweep.key === k) stopSweep(false);
      if (b.dataset.op === 'play') {
        if (S.playing) S.playing = false;
        else {
          let lim = d.max;
          const r = S.exp.animateUntil && S.res[S.edit].out[S.exp.animateUntil];
          if (r && r.ok && r.value > 0) lim = Math.min(lim, r.value);
          if (vals[k] >= lim - 1e-9 || vals[k] < d.min) vals[k] = d.min;
          S.playing = true;
        }
        renderParams(); return;
      }
      let x = vals[k];
      if (b.dataset.op === 'mul') x *= 10;
      else if (b.dataset.op === 'div') x /= 10;
      else if (b.dataset.op === 'neg') x = -x;
      else if (b.dataset.op === 'orig') x = M.C[d.constant].value;
      vals[k] = x;
      renderParams(); update();
    } else if (b.dataset.cop) {
      const k = b.dataset.c, c = M.C[k], cv = S.consts[S.edit];
      const x = k in cv ? cv[k] : c.value;
      if (b.dataset.cop === 'orig') delete cv[k];
      else cv[k] = b.dataset.cop === 'mul' ? x * 10 : x / 10;
      renderParams(); update();
    } else if (b.dataset.form) {
      S.form = b.dataset.form;
      S.graph = U.defaultGraph(S.exp, S.form);
      S.base = { vals: Object.assign({}, S.vals.A), consts: Object.assign({}, S.consts.A), form: S.form };
      S.preset = null;
      U.render(false);
    } else if (b.dataset.edit) {
      stopSweep(true);
      S.edit = b.dataset.edit;
      S.playing = false;
      $$('[data-edit]').forEach((x) => x.classList.toggle('on', x === b));
      const h = $('#lab .ph h3'); if (h) h.textContent = T('Visualisierung · Satz ', 'Visualisation · Set ') + S.edit;
      renderParams(); update();
    } else if (b.dataset.gx) {
      S.graph.xlog = b.dataset.gx === 'log'; renderGraphPanel(); updatePlots(); U.writeHash();
    } else if (b.dataset.gy) {
      S.graph.ylog = b.dataset.gy === 'log'; renderGraphPanel(); updatePlots(); U.writeHash();
    } else if (b.dataset.gz) {
      const z = b.dataset.gz;
      S.plots.forEach((p, i) => { if (z === 'reset') p.reset(i > 0); else if (i === 0) p.zoom(z === 'in' ? 0.7 : 1.4); });
    } else if (b.dataset.gextra) {
      const k = b.dataset.gextra, ex = S.graph.extra;
      const i = ex.indexOf(k);
      if (i >= 0) ex.splice(i, 1); else ex.push(k);
      renderGraphPanel(); updatePlots(); U.writeHash();
    }
  }

  /* ---------- results + status ---------- */
  function renderResults() {
    const box = $('#res');
    if (!box) return;
    const f = form();
    const outs = f.c.outputs;
    const prim = outs.find((o) => o.primary) || outs[0];
    const A = S.res.A;
    let h = '';
    if (!S.cmp) {
      const r = A.out[prim.key];
      const dg = digitsFor(prim, 'A');
      const v = fmtR(r, dg.d);
      const di = E.dimInfo(prim.dimv);
      h += '<div class="rp"><div class="line">' + U.tex(prim.tex) + '<span class="mo">=</span>' +
        (v === null ? '<span class="v" style="color:var(--red)">' + T('nicht definiert', 'not defined') + '</span>' : '<span class="v">' + esc(v) + '</span><span class="u">' + esc(U.unit(prim.dimv)) + '</span>') + '</div>';
      const alt = altR(prim, r);
      const meta = [];
      if (alt) meta.push('= ' + alt);
      if (di.name) meta.push(di.name);
      if (U.unit(prim.dimv) && di.si !== U.unit(prim.dimv)) meta.push('SI: ' + di.si);
      if (dg.u && dg.u.rel > 0) meta.push(T('rel. Unsicherheit ≈ ', 'rel. uncertainty ≈ ') + E.fmt(dg.u.rel, 2) + T(' (aus ', ' (from ') + dg.u.parts.map((p) => p.key).join(', ') + ')');
      else if (dg.u && !Object.keys(S.consts.A).length) meta.push(T('keine Unsicherheit aus Konstanten', 'no uncertainty from constants'));
      h += '<div class="meta">' + esc(meta.join(' · ')) + '</div>';
      if (S.baseRes && r && r.ok) {
        const q = ratio(S.baseRes.out[prim.key], r);
        h += '<div class="delta">' + T('gegenüber ' + (S.base.preset ? 'Preset' : 'Ausgangswert'), 'compared with the ' + (S.base.preset ? 'preset' : 'starting value')) + ': ' + esc(q.t) + (q.p ? '  (' + esc(q.p) + ')' : '') + '</div>';
      }
      h += '</div>';
      h += '<table class="t rlist"><tbody>' + outs.filter((o) => o !== prim).map((o) => {
        const rr = A.out[o.key];
        const vv = fmtR(rr, digitsFor(o, 'A').d);
        const alt2 = altR(o, rr);
        return '<tr><td class="k">' + U.tex(o.tex) + '</td><td class="nm">' + esc(o.name) + (o.note ? '<br><span class="faint">' + esc(o.note) + '</span>' : '') + '</td>' +
          (vv === null ? '<td class="val err">' + T('nicht definiert', 'not defined') + '</td>' : '<td class="val">' + esc(vv) + ' ' + esc(U.unit(o.dimv)) + (alt2 ? '<span class="alt">' + esc(alt2) + '</span>' : '') + '</td>') + '</tr>';
      }).join('') + '</tbody></table>';
    } else {
      const B = S.res.B;
      h += '<div class="scroll-x"><table class="t rlist cmp"><thead><tr><th>' + T('Größe', 'Quantity') + '</th><th>A</th><th>B</th><th>B / A</th></tr></thead><tbody>' + outs.map((o) => {
        const ra = A.out[o.key], rb = B.out[o.key];
        const d = Math.min(digitsFor(o, 'A').d, 5);
        const va = fmtR(ra, d), vb = fmtR(rb, d);
        const q = ratio(ra, rb);
        const u = U.unit(o.dimv);
        return '<tr><td class="k">' + U.tex(o.tex) + (o.primary ? ' <span class="faint">★</span>' : '') + '</td>' +
          '<td class="val">' + (va === null ? '<span style="color:var(--red)">' + T('undef.', 'undef.') + '</span>' : esc(va)) + '</td>' +
          '<td class="val">' + (vb === null ? '<span style="color:var(--red)">' + T('undef.', 'undef.') + '</span>' : esc(vb)) + '</td>' +
          '<td class="ratio">' + esc(q.t) + '<br><span class="faint">' + esc(q.p) + '</span></td></tr>' +
          (u ? '' : '');
      }).join('') + '</tbody></table></div>';
      const diffs = form().c.vars.filter((v) => S.vals.A[v.key] !== S.vals.B[v.key]);
      h += '<div class="meta faint" style="font-size:12px;margin-top:8px">' + T('Einheiten wie in der Einzelansicht. ', 'Units as in the single view. ') +
        (diffs.length ? T('Unterschiede: ', 'Differences: ') + diffs.map((v) => esc(v.label) + ' ' + esc(ratio({ ok: true, ...E.mk(S.vals.A[v.key]) }, { ok: true, ...E.mk(S.vals.B[v.key]) }).t)).join(', ') : T('A und B sind noch identisch – wähle „Satz B“ und verändere einen Wert.', 'A and B are still identical – choose “Set B” and change a value.')) + '</div>';
    }
    box.innerHTML = h;
  }

  function collectIssues() {
    const list = [];
    const seen = new Set();
    const add = (i, pre) => {
      const key = i.cat + i.msg;
      if (seen.has(key)) return;
      seen.add(key);
      list.push(Object.assign({}, i, { msg: (pre || '') + i.msg }));
    };
    S.res.A.issues.forEach((i) => add(i, S.cmp ? 'A: ' : ''));
    if (S.cmp) S.res.B.issues.forEach((i) => { if (!S.res.A.issues.some((j) => j.msg === i.msg)) add(i, 'B: '); });
    list.sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat));
    return list;
  }
  function renderStatus() {
    const box = $('#stat');
    if (!box) return;
    const list = collectIssues();
    const has = (c) => list.some((i) => i.cat === c);
    const chips = [
      ['math', T('Mathematisch definiert', 'Mathematically defined'), T('Mathematisch undefiniert', 'Mathematically undefined'), ''],
      ['numeric', T('Numerisch unauffällig', 'Numerically sound'), T('Numerik abgefangen', 'Numerics handled'), 'soft'],
      ['unreal', T('Physikalisch realistisch', 'Physically realistic'), T('Physikalisch unrealistisch', 'Physically unrealistic'), ''],
      ['model', T('Im Gültigkeitsbereich', 'Within the model’s range'), T('Außerhalb des Modells', 'Outside the model'), ''],
    ];
    let h = '<div class="stat">' + chips.map(([c, ok, bad, cls]) => '<div class="st ' + (has(c) ? 'warn ' + cls : '') + '">' + (has(c) ? bad : ok) + '</div>').join('') + '</div>';
    h += '<ul class="issues">' + list.map((i) => '<li class="' + i.cat + '"><b>' + CAT[i.cat] + '</b>' + esc(i.msg) + '</li>').join('') + '</ul>';
    box.innerHTML = h;
  }

  /* ---------- visualization ---------- */
  function sizeCanvas(c) {
    const dpr = globalThis.devicePixelRatio || 1;
    const W = c.clientWidth || 640, H = c.clientHeight || 330;
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    const ctx = c.getContext && c.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, W, H };
  }
  function drawViz() {
    const c = $('#vizc');
    if (!c || !S.res.A) return;
    const { ctx, W, H } = sizeCanvas(c);
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    const fn = PP.viz[S.exp.viz];
    if (!fn) return;
    const st = PP.vizState({
      exp: S.exp, form: S.form, vals: S.vals[S.edit], consts: S.consts[S.edit], res: S.res[S.edit] || S.res.A,
      base: S.base && S.base.form === S.form ? S.base.vals : null, baseLabel: baseLabel(),
      t: S.clock, opts: S.vizOpts, col: PP.colors(),
    });
    try { fn(ctx, W, H, st); }
    catch (err) {
      const col = PP.colors();
      ctx.fillStyle = col.red; ctx.font = '13px ' + col.sans; ctx.textAlign = 'center';
      ctx.fillText(T('Für diese Werte gibt es keine sinnvolle Darstellung.', 'There is no meaningful picture for these values.'), W / 2, H / 2);
    }
  }

  /* ---------- graph ---------- */
  function plotSpecs() {
    const g = S.graph;
    if (!g) return [];
    const outs = form().c.outputs;
    const y = outs.find((o) => o.key === g.y);
    const same = g.extra.filter((k) => { const o = outs.find((x) => x.key === k); return o && k !== g.y && E.dimEq(o.dimv, y.dimv); });
    const other = g.extra.filter((k) => { const o = outs.find((x) => x.key === k); return o && k !== g.y && !E.dimEq(o.dimv, y.dimv); });
    return [{ ys: [g.y].concat(same), ylog: g.ylog }].concat(other.map((k) => ({ ys: [k], ylog: g.ylog, small: true })));
  }
  function renderGraphPanel() {
    const p = $('#gpanel');
    if (!p) return;
    const g = S.graph, f = form();
    const xv = S.exp.vars[g.x];
    const opt = (list, cur) => list.map((o) => '<option value="' + o.key + '"' + (o.key === cur ? ' selected' : '') + '>' + esc(o.sym || o.label) + ' – ' + esc(o.name) + '</option>').join('');
    const specs = plotSpecs();
    const palette = plotColors();
    let h = '<div class="ph"><div class="gsel"><select data-g="y" aria-label="' + T('y-Achse', 'y axis') + '">' + opt(f.c.outputs, g.y) + '</select><span>' + T('über', 'vs.') + '</span><select data-g="x" aria-label="' + T('x-Achse', 'x axis') + '">' + opt(f.c.vars, g.x) + '</select></div>' +
      '<span style="margin-left:auto"></span>' +
      '<div class="seg" title="' + T('x-Achse', 'x axis') + '"><button data-gx="lin" class="' + (!g.xlog ? 'on' : '') + '">x lin</button><button data-gx="log" class="' + (g.xlog ? 'on' : '') + '"' + (xv.min > 0 ? '' : ' disabled title="' + T('Bereich enthält Werte ≤ 0', 'The range contains values ≤ 0') + '"') + '>x log</button></div>' +
      '<div class="seg" title="' + T('y-Achse', 'y axis') + '"><button data-gy="lin" class="' + (!g.ylog ? 'on' : '') + '">y lin</button><button data-gy="log" class="' + (g.ylog ? 'on' : '') + '">y log</button></div>' +
      '<div class="seg"><button data-gz="out" aria-label="' + T('Herauszoomen', 'Zoom out') + '">−</button><button data-gz="in" aria-label="' + T('Hineinzoomen', 'Zoom in') + '">+</button><button data-gz="reset">Reset</button></div></div>';
    const others = f.c.outputs.filter((o) => o.key !== g.y);
    let ci = 1;
    h += '<div class="legend">' + '<span class="chip on" style="cursor:default"><i style="background:' + palette[0] + '"></i>' + esc(f.c.outputs.find((o) => o.key === g.y).sym) + '</span>' +
      others.map((o) => {
        const on = g.extra.includes(o.key);
        const col = on ? palette[(ci++) % palette.length] : 'transparent';
        return '<button class="chip' + (on ? ' on' : '') + '" data-gextra="' + o.key + '" aria-pressed="' + on + '"><i style="background:' + col + '"></i>' + esc(o.sym) + '</button>';
      }).join('') + (S.cmp ? '<span class="chip" style="cursor:default">' + T('durchgezogen = A · gestrichelt = B', 'solid = A · dashed = B') + '</span>' : '') + '</div>';
    h += specs.map((s, i) => '<div class="plotwrap' + (s.small ? ' small' : '') + '"><canvas data-plot="' + i + '" role="img" aria-label="' + T('Graph ', 'Graph of ') + esc(s.ys.join(', ')) + T(' über ', ' vs. ') + esc(g.x) + '"></canvas><div class="tip" hidden></div></div>').join('');
    h += '<div class="ghint">' + T('Mausrad: Zoom · Ziehen: verschieben · Doppelklick: zurücksetzen · Weitere Größen oben zuschalten', 'Mouse wheel: zoom · Drag: pan · Double-click: reset · Add more quantities above') + (specs.length > 1 ? T(' (andere Einheit → eigener Graph)', ' (different unit → separate graph)') : '') + '</div>';
    p.innerHTML = h;
    S.plots = $$('canvas[data-plot]', p).map((c) => new PP.Plot(c, c.nextElementSibling));
    S.plots.forEach((pl, i) => {
      pl.onView = (v) => S.plots.forEach((q, j) => { if (j !== i) q.setView(v, true); });
    });
    if (ro) $$('canvas', p).forEach((c) => ro.observe(c));
  }
  function plotColors() { const c = PP.colors(); return [c.accent, c.cyan, c.violet, c.green, c.red]; }
  function onGraphSelect(t) {
    const g = S.graph;
    if (t.dataset.g === 'x') {
      g.x = t.value;
      const xv = S.exp.vars[g.x];
      g.xlog = xv.scale === 'log' && xv.min > 0;
    } else {
      g.y = t.value;
      g.extra = g.extra.filter((k) => k !== g.y);
    }
    renderGraphPanel(); updatePlots(); U.writeHash();
  }
  function updatePlots() {
    if (!S.plots.length) return;
    const g = S.graph, exp = S.exp, f = form();
    const xv = exp.vars[g.x];
    let dom = [xv.min, xv.scale === 'toone' ? 1 - 1e-4 : xv.max];
    const sets = S.cmp ? ['A', 'B'] : ['A'];
    const xlog = g.xlog && dom[0] > 0;
    for (const s of sets) {
      const x = S.vals[s][g.x];
      if (!isFinite(x)) continue;
      if (xlog) { if (x > 0) { dom[0] = Math.min(dom[0], x / 3); dom[1] = Math.max(dom[1], x * 3); } }
      else if (x < dom[0] || x > dom[1]) { dom = [Math.min(dom[0], x), Math.max(dom[1], x)]; const pad = (dom[1] - dom[0]) * 0.05; dom[0] -= pad; dom[1] += pad; }
    }
    const pal = plotColors();
    const colorOf = {};
    colorOf[g.y] = pal[0];
    let ci = 1;
    f.c.outputs.forEach((o) => { if (o.key !== g.y && g.extra.includes(o.key)) colorOf[o.key] = pal[(ci++) % pal.length]; });
    const xunit = U.unit(xv.dimv);
    plotSpecs().forEach((spec, i) => {
      const pl = S.plots[i];
      if (!pl) return;
      const outs = spec.ys.map((k) => f.c.outputs.find((o) => o.key === k));
      const series = [];
      for (const o of outs) for (const set of sets) {
        const vals = S.vals[set], consts = S.consts[set];
        series.push({
          label: o.sym + (S.cmp ? ' ' + set : ''), color: colorOf[o.key], dash: set === 'B' ? [7, 5] : [], integer: !!xv.integer,
          fn: (x) => { const v = Object.assign({}, vals); v[g.x] = x; const r = M.compute(exp, S.form, v, { skipChecks: true, consts }).out[o.key]; return U.num(r); },
        });
      }
      const skey = JSON.stringify([sets.map((s) => { const v = Object.assign({}, S.vals[s]); delete v[g.x]; return [v, S.consts[s]]; })]);
      const yunit = U.unit(outs[0].dimv);
      const y0 = outs[0].key;
      const cur = S.res[S.edit] && S.res[S.edit].out[y0];
      pl.set({
        key: [exp.id, S.form, g.x, spec.ys.join('+'), xlog, spec.ylog, S.cmp].join('|'),
        sampleKey: skey,
        xdom: dom, xlog, ylog: spec.ylog, series,
        samples: xv.integer ? 200 : 320,
        refs: ((exp.graph && exp.graph.refs) || []).filter((r) => r.y === y0).map((r) => ({ value: r.value, label: r.label, color: PP.colors().cyan })),
        marker: { x: S.vals[S.edit][g.x], y: U.num(cur) },
        xlabel: xv.label + (xunit ? ' [' + xunit + ']' : ''), xsym: xv.label, xunit,
        ylabel: outs.map((o) => o.sym).join(', ') + (yunit ? ' [' + yunit + ']' : ''), yunit,
      });
      if (i > 0 && S.plots[0].view) pl.setView(S.plots[0].view, true);
    });
  }

  function update() {
    if (!S.exp || !$('#lab')) return;
    recompute();
    syncInputs();
    renderResults();
    renderStatus();
    renderVizBadges();
    if (pauseShown === null) syncVizButtons();
    drawViz();
    updatePlots();
    U.writeHash();
  }

  U.onPause = () => syncVizButtons();
  U.redrawAll = () => { drawViz(); if (S.plots.length) { renderGraphPanel(); updatePlots(); } };
  U.lab = { toPos, fromPos, update, recompute, ratio, collectIssues, CAT, CAT_ORDER };
  U.views.exp = { title: 'Experiment', render };
})(globalThis.PP = globalThis.PP || {});
