/* =====================================================================
   Physics Playground — UI core: helpers, state, routing, shell
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine, M = PP.model, I = PP.i18n, T = I.T;
  const U = (PP.ui = PP.ui || {});
  U.T = T;

  /* ---------- helpers ---------- */
  U.$ = (s, r = document) => r.querySelector(s);
  U.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  U.esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  U.tex = (s, d) => PP.tex.tex(s, d);
  U.store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (_) { return false; } },
  };
  let colCache = null;
  PP.colors = () => {
    if (colCache) return colCache;
    const cs = getComputedStyle(document.documentElement);
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    const FB = light
      ? { bg: '#f3f4f1', panel: '#ffffff', panel2: '#eaece7', ink: '#14181d', ink2: '#4b5560', ink3: '#8a939c', grid: 'rgba(40,50,60,0.07)', accent: '#a8650a', cyan: '#137f8e', red: '#c03838', green: '#2a8744', violet: '#6446bd' }
      : { bg: '#0a0d11', panel: '#10151b', panel2: '#161c24', ink: '#e7ebf0', ink2: '#9ba7b4', ink3: '#5e6976', grid: 'rgba(140,162,190,0.075)', accent: '#f3b34c', cyan: '#62c6d4', red: '#ef6a6a', green: '#7fcf93', violet: '#b69cf2' };
    FB['font-mono'] = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
    FB['font-sans'] = '"IBM Plex Sans", system-ui, sans-serif';
    const g = (k) => cs.getPropertyValue('--' + k).trim() || FB[k];
    colCache = {
      bg: g('bg'), panel: g('panel'), panel2: g('panel2'), ink: g('ink'), ink2: g('ink2'), ink3: g('ink3'),
      grid: g('grid'), accent: g('accent'), cyan: g('cyan'), red: g('red'), green: g('green'), violet: g('violet'),
      mono: g('font-mono'), sans: g('font-sans'),
    };
    return colCache;
  };
  U.resetColors = () => { colCache = null; };

  let toastT = 0;
  U.toast = (msg) => {
    let t = U.$('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200);
  };
  U.copy = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* fallback */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch (_) { return false; }
  };
  U.unit = (dimv) => { const u = E.dimInfo(dimv).unit; return u === '1' ? '' : u; };
  U.num = (r) => (r && r.ok ? { s: r.s, l: r.l, d: r.value } : null);

  const SUPMAP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
  // Accepts 6.674e-11, 6,674·10^-11, 6.674 × 10⁻¹¹, and expressions like 10*M_sun or c/2
  U.parseNum = (raw) => {
    let s = String(raw).trim();
    if (!s) return null;
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (m) => '^' + m.split('').map((c) => SUPMAP[c]).join(''));
    s = s.replace(/−/g, '-').replace(/(\d),(\d)/g, '$1.$2');
    s = s.replace(/([0-9.])\s*[×x·*]\s*10\s*\^\s*\(?\s*([+-]?\d+)\s*\)?/g, '$1e$2');
    if (/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) { const x = Number(s); return isFinite(x) ? x : null; }
    try {
      const r = E.evaluate(E.parse(s), M.CONST_ENV);
      return r.ok && r.representable ? r.value : null;
    } catch (_) { return null; }
  };
  U.fmtInput = (x) => {
    if (typeof x !== 'number' || !isFinite(x)) return String(x);
    if (x === 0) return '0';
    const a = Math.abs(x);
    if (a >= 1e-3 && a < 1e6) return String(Number(x.toPrecision(6)));
    return x.toExponential(4).replace(/\.?0+e/, 'e').replace('e+', 'e');
  };

  /* ---------- state ---------- */
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const S = (U.S = {
    view: 'exp', exp: null, form: null,
    vals: { A: {}, B: {} }, consts: { A: {}, B: {} }, base: null,
    edit: 'A', cmp: false, brk: !!U.store.get('pp.brk', false),
    graph: null, tab: 'lab', nightmare: false, vizOpts: {},
    paused: reduced, playing: false, preset: null, clock: 0,
    custom: { src: 'X = G M / c', dims: { X: 'L' } },
    res: {}, pop: null,
  });

  U.copyVals = (o) => Object.assign({}, o);

  /* ---------- Animationsschleife für die Theorie-Widgets ----------
     Zeichnet nur, wenn sich etwas geändert hat und das Widget sichtbar ist.
     step(dt) → true, wenn sich etwas bewegt hat; draw() zeichnet;
     onPause(paused) wird aufgerufen, wenn der Schalter „Animationen“ umgelegt wird.
     Rückgabe: { invalidate(), stop() }. */
  U.widgetLoop = (box, { step, draw, onPause }) => {
    let raf = 0, last = 0, visible = true, dirty = true, paused = S.paused, io = null;
    const hasRaf = typeof requestAnimationFrame === 'function';
    function tick(ts) {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.1, (ts - last) / 1000) : 0;
      last = ts;
      if (S.paused !== paused) { paused = S.paused; if (onPause) onPause(paused); dirty = true; }
      if (!visible) return;
      if (step && step(dt)) dirty = true;
      if (dirty) { dirty = false; draw(); }
    }
    if (typeof IntersectionObserver === 'function') {
      io = new IntersectionObserver((entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (visible) { last = 0; dirty = true; }
      });
      io.observe(box);
    }
    if (hasRaf) raf = requestAnimationFrame(tick);
    return {
      invalidate() { if (hasRaf) dirty = true; else draw(); },
      stop() {
        if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
        if (io) io.disconnect();
      },
    };
  };

  U.defaultGraph = (exp, formId) => {
    const g = exp.graph;
    if (!g) return null;
    const form = M.formOf(exp, formId);
    const vars = form.c.vars;
    if (!vars.length) return null;
    const x = vars.find((v) => v.key === g.x) ? g.x : vars[0].key;
    const outs = form.c.outputs;
    const prim = outs.find((o) => o.primary) || outs[0];
    const y = outs.find((o) => o.key === g.y) ? g.y : prim.key;
    const xv = exp.vars[x];
    const xlog = g.xlog != null && x === g.x ? g.xlog : xv.scale === 'log';
    const ylog = g.ylog != null && y === g.y ? g.ylog : xv.scale === 'log';
    const extra = (g.also || []).filter((k) => outs.some((o) => o.key === k));
    return { x, y, xlog: xlog && xv.min > 0, ylog, extra };
  };

  // Aus URL oder Speicher kommende Werte: nur Schlüssel übernehmen, die es wirklich gibt
  const pick = (o, allowed) => { const r = {}; for (const k in o || {}) if (E.has(o, k) && E.has(allowed, k)) r[k] = o[k]; return r; };

  U.loadExp = (id, opts = {}) => {
    const exp = (E.has(M.byId, id) && M.byId[id]) || M.registry[0];
    const changed = S.exp !== exp;
    S.view = 'exp';
    S.exp = exp;
    S.form = opts.form && exp.forms.some((f) => f.id === opts.form) ? opts.form : exp.forms[0].id;
    const d = M.defaults(exp);
    S.vals = { A: Object.assign({}, d, pick(opts.a, d)), B: Object.assign({}, d, pick(opts.b || opts.a, d)) };
    S.consts = { A: pick(opts.ca, M.C), B: pick(opts.cb || opts.ca, M.C) };
    S.base = { vals: Object.assign({}, S.vals.A), consts: Object.assign({}, S.consts.A), form: S.form };
    S.cmp = !!opts.cmp && exp.forms.some((f) => f.vars.length);
    S.edit = 'A';
    S.graph = U.defaultGraph(exp, S.form);
    if (opts.g && S.graph) Object.assign(S.graph, opts.g);
    // Jedes Experiment öffnet mit dem Labor
    S.tab = opts.tab || 'lab';
    S.preset = null; S.playing = false;
    if (changed) { S.vizOpts = {}; S.nightmare = false; }
  };

  /* ---------- URL state ---------- */
  const encVals = (o) => Object.keys(o).map((k) => k + ':' + (typeof o[k] === 'number' ? Number(o[k].toPrecision(15)) : o[k])).join(';');
  const decVals = (s) => {
    const o = {};
    (s || '').split(';').forEach((p) => { const i = p.indexOf(':'); if (i > 0) { const x = Number(p.slice(i + 1)); if (!Number.isNaN(x)) o[p.slice(0, i)] = x; } });
    return o;
  };
  U.stateString = () => {
    const q = new URLSearchParams();
    if (S.view === 'exp' && S.exp) {
      q.set('exp', S.exp.id);
      if (S.exp.forms.length > 1) q.set('f', S.form);
      const a = encVals(S.vals.A); if (a) q.set('a', a);
      const ca = encVals(S.consts.A); if (ca) q.set('ca', ca);
      if (S.cmp) { q.set('cmp', '1'); q.set('b', encVals(S.vals.B)); const cb = encVals(S.consts.B); if (cb) q.set('cb', cb); }
      if (S.tab !== 'lab') q.set('tab', S.tab);
      if (S.graph) q.set('g', [S.graph.x, S.graph.y, S.graph.xlog ? 1 : 0, S.graph.ylog ? 1 : 0, S.graph.extra.join('+')].join(','));
      // Einstellungen der Visualisierung (z. B. Planck-Größe, Überlagerung)
      const vo = Object.keys(S.vizOpts).filter((k) => S.vizOpts[k] !== false && S.vizOpts[k] != null).map((k) => k + ':' + (S.vizOpts[k] === true ? '1' : S.vizOpts[k])).join(';');
      if (vo) q.set('vo', vo);
    } else {
      q.set('view', S.view);
      if (S.view === 'theorie' && S.theorySec) q.set('sec', S.theorySec);
      if (S.view === 'custom') {
        q.set('eq', S.custom.src);
        const d = Object.keys(S.custom.dims).map((k) => k + ':' + S.custom.dims[k]).join(';');
        if (d) q.set('d', d);
      }
    }
    if (S.brk) q.set('brk', '1');
    return q.toString();
  };
  U.applyState = (str) => {
    const q = new URLSearchParams(String(str || '').replace(/^.*?#/, '').replace(/^\?/, ''));
    if (q.has('brk')) S.brk = q.get('brk') === '1';
    // #…&lang=en: Sprache für diese Sitzung, ohne die gespeicherte Wahl zu ändern
    if (I.LANGS.includes(q.get('lang'))) I.set(q.get('lang'), { silent: true });
    if (q.get('exp') && E.has(M.byId, q.get('exp'))) {
      let g = null;
      if (q.get('g')) {
        const [x, y, xl, yl, ex] = q.get('g').split(',');
        g = { x, y, xlog: xl === '1', ylog: yl === '1', extra: ex ? ex.split('+') : [] };
      }
      U.loadExp(q.get('exp'), { form: q.get('f'), a: decVals(q.get('a')), b: q.get('b') ? decVals(q.get('b')) : null, ca: decVals(q.get('ca')), cb: q.get('cb') ? decVals(q.get('cb')) : null, cmp: q.get('cmp') === '1', tab: q.get('tab'), g });
      const exp = S.exp, form = M.formOf(exp, S.form);
      // Nur bekannte Bedienelemente und erlaubte Werte übernehmen
      (q.get('vo') || '').split(';').forEach((p) => {
        const i = p.indexOf(':'), k = p.slice(0, i), x = p.slice(i + 1);
        const c = (exp.vizControls || []).find((cc) => cc.key === k);
        if (!c) return;
        if (c.options) { if (c.options.some((o) => o.v === x)) S.vizOpts[k] = x; } else S.vizOpts[k] = x === '1';
      });
      if (S.graph && (!form.c.vars.some((v) => v.key === S.graph.x) || !form.c.outputs.some((o) => o.key === S.graph.y))) S.graph = U.defaultGraph(exp, S.form);
      return true;
    }
    const v = q.get('view');
    if (v && E.has(U.views, v)) {
      S.view = v;
      if (v === 'theorie') S.theorySec = /^[a-z]+$/.test(q.get('sec') || '') ? q.get('sec') : null;
      if (v === 'custom' && q.get('eq')) {
        S.custom.src = q.get('eq');
        S.custom.dims = {};
        (q.get('d') || '').split(';').forEach((p) => { const i = p.indexOf(':'); if (i > 0 && p.slice(0, i) !== '__proto__') S.custom.dims[p.slice(0, i)] = p.slice(i + 1); });
      }
      return true;
    }
    return false;
  };
  let lastHash = null, hashT = 0;
  U.writeHash = () => {
    clearTimeout(hashT);
    hashT = setTimeout(() => {
      const h = '#' + U.stateString();
      if (h === location.hash) return;
      lastHash = h;
      try { history.replaceState(null, '', h); } catch (_) { /* sandboxed */ }
    }, 250);
  };
  function onHash() {
    if (location.hash === lastHash) return;
    lastHash = location.hash;
    const lang = I.lang;
    if (!U.applyState(location.hash)) U.loadExp('newton-gravity');
    if (I.lang !== lang) { document.documentElement.lang = I.lang; U.renderShell(U.$('#root') || document.body); }
    U.render(true);
  }

  /* ---------- saved experiments ---------- */
  U.saved = {
    list: () => U.store.get('pp.saved.v1', []),
    add(name) {
      const l = U.saved.list();
      l.unshift({ id: Date.now().toString(36), name, exp: S.exp ? S.exp.title : S.view, date: new Date().toISOString(), state: U.stateString() });
      return U.store.set('pp.saved.v1', l.slice(0, 100));
    },
    remove(id) { U.store.set('pp.saved.v1', U.saved.list().filter((x) => x.id !== id)); },
  };

  /* ---------- Themenfelder ----------
     Name, Icon und Farbe je Bereich. Die Farbe steht in styles.css unter [data-field="…"]
     und ist bewusst keine der Datenfarben (Orange = Hauptergebnis, Rot = Warnung …).
     Farbe ist nie das einzige Merkmal: Icon und Name stehen immer dabei. */
  const svg = (d) => '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  const ICON = {
    mech: svg('<path d="M3 2.5h10M8 2.5l2.9 7.1"/><circle cx="11.6" cy="11.6" r="2.2"/>'),
    rel: svg('<path d="M2.5 2.5l11 11M13.5 2.5l-11 11"/><ellipse cx="8" cy="2.8" rx="5.3" ry="1.3"/><ellipse cx="8" cy="13.2" rx="5.3" ry="1.3"/>'),
    thermo: svg('<path d="M6.5 9.3V3a1.5 1.5 0 0 1 3 0v6.3"/><circle cx="8" cy="11.5" r="2.6"/><path d="M8 5v5"/>'),
    famous: svg('<path d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z"/>'),
    found: svg('<path d="M8 4.2C6.6 3 4.5 2.6 2 2.8v9.6c2.5-.2 4.6.2 6 1.4 1.4-1.2 3.5-1.6 6-1.4V2.8c-2.5-.2-4.6.2-6 1.4zM8 4.2v9.6"/>'),
    tools: svg('<path d="M10.2 2.2a3.3 3.3 0 0 0-3.8 4.4L2.2 10.8a1.4 1.4 0 0 0 2 2l4.2-4.2a3.3 3.3 0 0 0 4.4-3.8l-2 2-1.8-.4-.4-1.8z"/>'),
  };
  U.FIELDS = I.localize({
    mech: { name: { de: 'Mechanik', en: 'Mechanics' } },
    rel: { name: { de: 'Relativität', en: 'Relativity' } },
    thermo: { name: { de: 'Thermodynamik', en: 'Thermodynamics' } },
    famous: { name: 'Famous Equations' },
    found: { name: { de: 'Grundlagen', en: 'Foundations' } },
    tools: { name: { de: 'Werkzeuge', en: 'Tools' } },
  });
  U.fieldIcon = (key) => ICON[key] || '';
  // Feld eines Experiments; ohne bekanntes `field` gilt: berühmte Gleichung → famous, sonst keins (eigene Gruppe)
  U.fieldOf = (exp) => (exp && E.has(U.FIELDS, exp.field) ? exp.field : exp && exp.hall ? 'famous' : null);
  // Großes Banner über dem Seitentitel: Feldname, Icon, Farbstreifen
  U.fieldBanner = (key, fallback) => {
    const f = E.has(U.FIELDS, key) ? U.FIELDS[key] : null;
    return '<div class="fband"' + (f ? ' data-field="' + key + '"' : '') + '>' + (f ? '<span class="fic">' + ICON[key] + '</span>' : '') + '<span class="fnm">' + U.esc(f ? f.name : fallback || '') + '</span></div>';
  };
  U.fieldHead = (key, fallback) => '<h6><span class="fic">' + (ICON[key] || '') + '</span>' + U.esc(E.has(U.FIELDS, key) ? U.FIELDS[key].name : fallback || '') + '</h6>';

  /* ---------- shell ---------- */
  U.views = Object.create(null); // filled by other modules: name → { title, render(main), mount?() }

  const LOGO = '<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><rect x="0.5" y="0.5" width="29" height="29" rx="6" fill="none" stroke="var(--line2)"/><path d="M5 22 C 10 22, 12 8, 15 8 S 20 22, 25 22" fill="none" stroke="var(--accent)" stroke-width="1.8"/><circle cx="15" cy="8" r="2.2" fill="var(--ink)"/><path d="M5 25.5 H25" stroke="var(--ink3)"/></svg>';

  function navHTML() {
    const cur = S.view === 'exp' && S.exp ? S.exp.id : null;
    // Gruppen nach Themenfeld; Experimente ohne bekanntes Feld bilden eine eigene Gruppe mit ihrem group-Namen
    const groups = new Map();
    M.registry.filter((e) => !e.hall).forEach((e) => {
      const f = U.fieldOf(e), k = f || 'g:' + e.group;
      if (!groups.has(k)) groups.set(k, { f, label: e.group, items: [] });
      groups.get(k).items.push(e);
    });
    const block = (f, label, links) => '<div class="ng"' + (f ? ' data-field="' + f + '"' : '') + '>' + U.fieldHead(f, label) + links + '</div>';
    let h = '';
    for (const g of groups.values()) {
      h += block(g.f, g.label, g.items.map((e) => '<a href="#exp=' + e.id + '" class="' + (cur === e.id ? 'on' : '') + '">' + U.esc(e.short) + '</a>').join(''));
    }
    h += block('famous', '', '<a href="#view=hall" class="hall ' + (S.view === 'hall' ? 'on' : '') + '">' + T('Übersicht &amp; Vergleich', 'Overview &amp; comparison') + '</a>' +
      PP.hallOrder.map((id) => { const e = M.byId[id]; return '<a href="#exp=' + id + '" class="hall ' + (cur === id ? 'on' : '') + '">' + U.esc(e.short) + '</a>'; }).join('') +
      '<a href="#view=custom" class="hall ' + (S.view === 'custom' ? 'on' : '') + '">' + T('Eigene Gleichung prüfen', 'Check your own equation') + '</a>');
    h += block('found', '', U.theoryNav ? U.theoryNav() : '<a href="#view=theorie" class="' + (S.view === 'theorie' ? 'on' : '') + '">' + T('Theorie kurz erklärt', 'Theory in brief') + '</a>');
    const n = U.saved.list().length;
    h += block('tools', '', [['constants', T('Konstanten', 'Constants'), M.registry.length ? Object.keys(M.C).length : ''], ['saved', T('Gespeichert', 'Saved'), n || ''], ['tests', 'Tests', PP.tests ? PP.tests.list.length : ''], ['about', T('Über', 'About'), '']].map(([v, t, c]) =>
      '<a href="#view=' + v + '" class="' + (S.view === v ? 'on' : '') + '">' + t + (c !== '' ? '<small>' + c + '</small>' : '') + '</a>').join(''));
    return h;
  }

  // Ein Knopf, zwei Sprachen: die aktive ist hervorgehoben, ein Klick wechselt
  const langButton = () => '<button class="lang" data-act="lang" lang="' + (I.lang === 'en' ? 'de' : 'en') + '" title="' + T('Switch to English', 'Auf Deutsch umschalten') + '" aria-label="' + T('Sprache: Deutsch. Switch to English', 'Language: English. Auf Deutsch umschalten') + '">' +
    I.LANGS.map((l) => '<span class="' + (l === I.lang ? 'on' : '') + '">' + l.toUpperCase() + '</span>').join('') + '</button>';

  U.renderShell = (root) => {
    root.innerHTML =
      '<div class="app" id="app">' +
      '<div class="topbar"><button class="btn icon" data-act="nav" aria-label="' + T('Navigation öffnen', 'Open navigation') + '">≡</button><b>Physics Playground</b>' + langButton() + '</div>' +
      '<aside class="side" aria-label="Navigation">' +
      '<div class="brand">' + LOGO + '<div><b>Physics Playground</b><span>' + T('Was passiert, wenn ich das ändere?', 'What happens if I change this?') + '</span>' + langButton() + '</div></div>' +
      '<nav class="nav" id="nav"></nav>' +
      '<div class="side-foot">' +
      '<label class="switch"><input type="checkbox" id="brk"' + (S.brk ? ' checked' : '') + '><span>Break the Physics<small>' + T('Konstanten und Grenzen freigeben', 'Unlock constants and limits') + '</small></span></label>' +
      '<label class="switch plain"><input type="checkbox" id="anim"' + (S.paused ? '' : ' checked') + '><span>' + T('Animationen', 'Animations') + '</span></label>' +
      '<label class="switch plain"><input type="checkbox" id="theme"' + (document.documentElement.getAttribute('data-theme') === 'light' ? ' checked' : '') + '><span>' + T('Helles Labor', 'Light lab') + '</span></label>' +
      '</div></aside>' +
      '<main id="main" tabindex="-1"></main></div>';
    U.$('#brk').addEventListener('change', (e) => U.setBreak(e.target.checked));
    U.$('#anim').addEventListener('change', (e) => { S.paused = !e.target.checked; if (U.onPause) U.onPause(); });
    U.$('#theme').addEventListener('change', (e) => {
      document.documentElement.setAttribute('data-theme', e.target.checked ? 'light' : 'dark');
      U.store.set('pp.theme', e.target.checked ? 'light' : 'dark');
      U.resetColors();
      if (U.redrawAll) U.redrawAll();
    });
  };
  function bindRoot(root) {
    root.addEventListener('click', (e) => {
      const a = e.target.closest('[data-act="nav"]');
      if (a) U.$('#app').classList.toggle('nav-open');
      else if (e.target.closest('[data-act="lang"]')) { langFrom = e.target.closest('.topbar') ? '.topbar' : '.side'; I.set(I.lang === 'en' ? 'de' : 'en'); }
      else if (e.target.closest('.nav a')) U.$('#app').classList.remove('nav-open');
    });
  }
  // Sprachwechsel: Shell und aktuelle Ansicht neu aufbauen, Zustand (Werte, Tab, Scrollposition) bleibt
  let langFrom = null;
  function onLang(root) {
    document.documentElement.lang = I.lang;
    const y = typeof window.scrollY === 'number' ? window.scrollY : 0;
    if (U.teardown) { U.teardown(); U.teardown = null; }
    U.renderShell(root);
    U.render(false);
    try { window.scrollTo(0, y); } catch (_) { /* jsdom */ }
    const b = langFrom && U.$(langFrom + ' [data-act="lang"]');
    if (b) b.focus();
    langFrom = null;
  }

  U.setBreak = (on) => {
    S.brk = on;
    U.store.set('pp.brk', on);
    const cb = U.$('#brk'); if (cb) cb.checked = on;
    if (!on && S.exp) {
      let changed = false;
      for (const set of ['A', 'B']) {
        const vals = S.vals[set];
        for (const k in S.exp.vars) {
          const d = S.exp.vars[k];
          if (!(k in vals)) continue;
          let x = vals[k];
          if (d.constant) x = M.C[d.constant].value;
          else {
            if (!(x >= d.min)) x = d.min;
            if (x > d.max) x = d.max;
          }
          if (x !== vals[k]) { vals[k] = x; changed = true; }
        }
        if (Object.keys(S.consts[set]).length) { S.consts[set] = {}; changed = true; }
      }
      if (changed) U.toast(T('Werte in den regulären Bereich zurückgesetzt', 'Values reset to the regular range'));
    }
    U.render(false);
  };

  U.render = (routeChanged) => {
    const main = U.$('#main');
    if (!main) return;
    U.$('#nav').innerHTML = navHTML();
    if (U.teardown) { U.teardown(); U.teardown = null; }
    let h = '';
    if (S.brk) h += '<div class="brk-banner">' + T('<b>Break-the-Physics-Modus.</b> Konstanten und Bereichsgrenzen sind freigegeben. Die App rechnet weiter und sagt dir, ob ein Ergebnis mathematisch undefiniert, numerisch heikel, physikalisch unrealistisch oder außerhalb des Modells ist.',
      '<b>Break-the-Physics mode.</b> Constants and range limits are unlocked. The app keeps calculating and tells you whether a result is mathematically undefined, numerically delicate, physically unrealistic or outside the model.') + '</div>';
    const v = S.view === 'exp' ? U.views.exp : U.views[S.view];
    main.innerHTML = h + '<div id="view"></div>';
    try {
      v.render(U.$('#view'));
      document.title = (S.view === 'exp' ? S.exp.title : v.title) + ' · Physics Playground';
    } catch (err) {
      U.$('#view').innerHTML = '<div class="callout warn"><b>' + T('Diese Ansicht konnte nicht aufgebaut werden.', 'This view could not be built.') + '</b> ' + U.esc(err.message) + '</div>';
      if (typeof console !== 'undefined') console.error(err);
    }
    if (routeChanged) { try { window.scrollTo(0, 0); } catch (_) { /* jsdom */ } }
    U.writeHash();
  };

  U.boot = (root) => {
    const th = U.store.get('pp.theme', null);
    if (th) document.documentElement.setAttribute('data-theme', th);
    if (!U.applyState(location.hash)) U.loadExp('newton-gravity');
    document.documentElement.lang = I.lang;
    U.renderShell(root);
    bindRoot(root);
    I.onChange(() => onLang(root));
    U.render(true);
    window.addEventListener('hashchange', onHash);
    lastHash = location.hash;
  };
})(globalThis.PP = globalThis.PP || {});
