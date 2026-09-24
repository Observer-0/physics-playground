/* =====================================================================
   Physics Playground — Visualizations (canvas 2D)
   draw(ctx, W, H, S) – S kommt aus PP.vizState (unten):
     v            Eingabewerte
     o(key)       Ergebnis als Double (zum Zeichnen auf den Double-Bereich begrenzt)
     lg(key)      log₁₀|Ergebnis|, exakt auch jenseits von 10^±308
     num(key)     Ergebnis als { s, l } (Vorzeichen, log₁₀) für Verhältnisse
     fo(key, abs) Ergebnis formatiert (3 Stellen)
     at(änderungen, expId?, formId?)  dieselben Formeln mit geänderten Eingaben
                  bzw. die eines anderen Experiments – liefert wieder o/lg/num/fo
     issues       Warnkategorien der Engine (math, numeric, unreal, model, …)
     base, baseLabel  Vergleichswerte (Preset oder Ausgangswert)
     col, t (Animationszeit in s), opts, exp, form
   Die Zeichenfunktionen rechnen keine Formeln nach: Jede physikalische Größe
   kommt aus PP.model.compute. Hier wird nur abgebildet, skaliert und beschriftet.
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine, tr = PP.i18n.T;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const map = (x, a, b, c, d) => lerp(c, d, clamp((x - a) / (b - a), 0, 1));
  const f3 = (x) => E.fmt(x, 3);

  /* ---------- Zustand: alle Zahlen aus der Engine ---------- */
  const toD = (r) => {
    if (!r || !r.ok) return NaN;
    if (r.s === 0) return 0;
    if (r.l > 308) return r.s * 1.7e308;
    if (r.l < -307) return r.s * 1e-307;
    return E.toDouble({ s: r.s, l: r.l, d: r.value });
  };
  function reader(res) {
    const out = res.out;
    const num = (k) => (out[k] && out[k].ok ? { s: out[k].s, l: out[k].l, d: out[k].value } : null);
    return {
      o: (k) => toD(out[k]),
      lg: (k) => (out[k] && out[k].ok && out[k].s !== 0 ? out[k].l : NaN),
      num,
      fo: (k, abs, digits = 3) => {
        const n = num(k);
        if (!n) return '—';
        if (abs && n.s < 0) { n.s = 1; n.d = Math.abs(n.d); }
        return E.fmt(n, digits);
      },
      issues: new Set(res.issues.map((i) => i.cat)),
    };
  }
  // Kleiner Zwischenspeicher: Kurven und Spuren fragen je Bild dieselben Punkte ab
  const cache = new Map();
  function calc(exp, form, vals, consts) {
    const key = exp.id + '|' + form + '|' + JSON.stringify(vals) + '|' + JSON.stringify(consts || {});
    let r = cache.get(key);
    if (!r) {
      if (cache.size > 600) cache.clear();
      r = reader(PP.model.compute(exp, form, vals, { consts, skipChecks: true }));
      cache.set(key, r);
    }
    return r;
  }
  PP.vizState = ({ exp, form, vals, consts, res, base, baseLabel, t, opts, col }) => {
    const M = PP.model;
    const S = reader(res || M.compute(exp, form, vals, { consts }));
    S.at = (over, id, fid) => {
      const e = id ? M.byId[id] : exp;
      const f = id ? fid || e.forms[0].id : form;
      return calc(e, f, Object.assign(id ? M.defaults(e) : Object.assign({}, vals), over), consts);
    };
    return Object.assign(S, { v: vals, exp, form, base: base || null, baseLabel: baseLabel || '', t: t || 0, opts: opts || {}, col });
  };
  // Verhältnis zweier Engine-Werte als { s, l }; null, wenn eines fehlt
  const ratio = (a, b) => (!a || !b || b.s === 0 ? null : a.s === 0 ? { s: 0, l: -Infinity, d: 0 } : { s: a.s * b.s, l: a.l - b.l, d: NaN });
  const rd = (q) => (!q ? NaN : q.s === 0 ? 0 : q.s * Math.pow(10, clamp(q.l, -300, 300)));
  const mk = (x) => (typeof x === 'number' && isFinite(x) ? E.mk(x) : null);
  const fx = (q) => (!q ? '—' : Math.abs(q.l) < 2e-5 && q.s > 0 ? '×1' : '×' + E.fmt(q, 3));
  const fxColor = (q, col) => (!q || (q.s > 0 && Math.abs(q.l) < 2e-5) ? col.ink3 : q.s > 0 && q.l > 0 ? col.accent : col.cyan);

  /* ---------- Zeichenhelfer ---------- */
  function arrow(ctx, x1, y1, x2, y2, color, w = 2, head = 8) {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
    if (L < 1) return;
    const ux = dx / L, uy = dy / L;
    const h = Math.min(head, L * 0.6);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * h * 0.8, y2 - uy * h * 0.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ux * h - uy * h * 0.5, y2 - uy * h + ux * h * 0.5);
    ctx.lineTo(x2 - ux * h + uy * h * 0.5, y2 - uy * h - ux * h * 0.5);
    ctx.closePath(); ctx.fill();
  }
  // Pfeil mit Länge len, höchstens max; wird er gekürzt, markieren zwei Striche die Unterbrechung
  function vec(ctx, x, y, ux, uy, len, max, color, w = 2.5) {
    const cut = len > max;
    const L = clamp(len, 0, max);
    arrow(ctx, x, y, x + ux * L, y + uy * L, color, w);
    if (cut && L > 24) {
      const mx = x + ux * L * 0.55, my = y + uy * L * 0.55;
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      for (const o of [-3, 3]) { ctx.beginPath(); ctx.moveTo(mx + ux * o - uy * 6, my + uy * o + ux * 6); ctx.lineTo(mx + ux * o + uy * 6, my + uy * o - ux * 6); ctx.stroke(); }
    }
    return L;
  }
  function dashedArrow(ctx, x1, y1, x2, y2, color) {
    ctx.save(); ctx.globalAlpha = 0.55; ctx.setLineDash([4, 4]);
    arrow(ctx, x1, y1, x2, y2, color, 1.2, 7);
    ctx.restore();
  }
  function font(ctx, col, size, mono) { ctx.font = size + 'px ' + (mono ? col.mono : col.sans); }
  function label(ctx, s, x, y, col, opts = {}) {
    font(ctx, col, opts.size || 12, opts.mono);
    ctx.fillStyle = opts.color || col.ink2;
    ctx.textAlign = opts.align || 'left';
    ctx.textBaseline = opts.base || 'alphabetic';
    ctx.fillText(s, x, y);
  }
  const textW = (ctx, s) => ctx.measureText(s).width;
  // Mehrfarbige Zeile: parts = [[text, farbe], …]; gibt das Zeilenende zurück
  function segs(ctx, parts, x, y, col, opts = {}) {
    font(ctx, col, opts.size || 12, opts.mono);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    for (const [s, c] of parts) { ctx.fillStyle = c; ctx.fillText(s, x, y); x += textW(ctx, s); }
    return x;
  }
  function grid(ctx, W, H, col, step = 24) {
    ctx.strokeStyle = col.grid; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = step; x < W; x += step) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); }
    for (let y = step; y < H; y += step) { ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(W, Math.round(y) + 0.5); }
    ctx.stroke();
  }
  function note(ctx, s, W, H, col) { label(ctx, s, W - 10, H - 10, col, { align: 'right', size: 11, color: col.ink3 }); }
  function invalid(ctx, W, H, col, msg) {
    label(ctx, msg, W / 2, H / 2, col, { align: 'center', base: 'middle', size: 14, color: col.red });
  }
  function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
  // Kleiner Zeitverlauf: Kurve y(t) auf [0, tEnd] mit Marke (tc, yc)
  function spark(ctx, x0, y0, w, h, pts, tc, yc, tEnd, color, col, ymaxIn) {
    let ymax = ymaxIn || 0;
    if (!ymaxIn) for (const [, y] of pts) if (isFinite(y)) ymax = Math.max(ymax, y);
    if (!(ymax > 0)) ymax = 1;
    const X = (t) => x0 + (t / tEnd) * w, Y = (y) => y0 + h - (clamp(y, 0, ymax) / ymax) * h * 0.92;
    ctx.strokeStyle = col.ink3; ctx.lineWidth = 1; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + h); ctx.lineTo(x0 + w, y0 + h); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
    let first = true;
    for (const [t, y] of pts) { if (!isFinite(y)) continue; if (first) { ctx.moveTo(X(t), Y(y)); first = false; } else ctx.lineTo(X(t), Y(y)); }
    ctx.stroke();
    ctx.strokeStyle = col.ink3; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(tc), y0); ctx.lineTo(X(tc), y0 + h); ctx.stroke(); ctx.setLineDash([]);
    if (isFinite(yc)) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X(tc), Y(yc), 4, 0, 7); ctx.fill(); }
  }

  const V = {};

  /* ---------- Gravitation: F ∝ m₁m₂/r² sichtbar als Faktoren ---------- */
  V.gravity = (ctx, W, H, S) => {
    const { v, col } = S;
    grid(ctx, W, H, col);
    const narrow = W < 480;
    const Fn = S.num('F'), F = S.o('F');
    const cy = H * (narrow ? 0.57 : 0.53);
    const rmax = Math.min(38, H * 0.12);
    const rad = (m) => (m > 0 ? map(Math.log10(m), -3, 42, 6, rmax) : 7);
    const r1 = rad(v.m1), r2 = rad(v.m2), R = Math.max(r1, r2);
    const sep = v.r > 0 ? map(Math.log10(v.r), -6, 14, W * 0.22, W * 0.62) : 0;
    const gap = Math.max(sep, r1 + r2 + 24);
    const x1 = W / 2 - gap / 2, x2 = W / 2 + gap / 2;
    [[x1, r1, v.m1, 'm₁'], [x2, r2, v.m2, 'm₂']].forEach(([x, r, m, name]) => {
      const g = ctx.createRadialGradient(x - r * 0.35, cy - r * 0.35, r * 0.1, x, cy, r);
      g.addColorStop(0, col.ink); g.addColorStop(1, col.ink3);
      ctx.fillStyle = m > 0 ? g : 'transparent';
      ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2); ctx.fill();
      if (!(m > 0)) { ctx.setLineDash([3, 3]); ctx.strokeStyle = col.red; ctx.stroke(); ctx.setLineDash([]); }
      label(ctx, name + ' = ' + f3(m) + ' kg', x, cy + R + 18, col, { align: 'center', mono: true, size: narrow ? 11 : 12, color: col.ink });
    });
    const by = cy + R + 34;
    ctx.strokeStyle = col.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, by - 5); ctx.lineTo(x1, by + 5); ctx.moveTo(x2, by - 5); ctx.lineTo(x2, by + 5); ctx.moveTo(x1, by); ctx.lineTo(x2, by); ctx.stroke();
    label(ctx, 'r = ' + f3(v.r) + ' m', (x1 + x2) / 2, by + 16, col, { align: 'center', mono: true, color: col.ink });

    if (!Fn || !isFinite(F)) {
      invalid(ctx, W, H * 0.4, col, tr('F ist hier nicht definiert', 'F is not defined here'));
      return;
    }
    // Vergleich mit dem Preset/Ausgangswert: jeder Faktor einzeln aus der Engine
    const B = S.base, F0 = B ? S.at(B).num('F') : null;
    const q = ratio(Fn, F0);
    const terms = [];
    if (q) {
      const part = (k) => ratio(S.at(Object.assign({}, B, { [k]: v[k] })).num('F'), F0);
      terms.push(['F / F₀', q], ['m₁/m₁₀', part('m1')], ['m₂/m₂₀', part('m2')], ['(r₀/r)²', part('r')]);
      if (v.G !== B.G) terms.push(['G/G₀', part('G')]);
    }
    const dir = F > 0 ? 1 : -1; // negatives G → Abstoßung
    const c = dir > 0 ? col.accent : col.red;
    // Pfeile: Länge ∝ F/F₀ (linear), je Körper eine eigene Spur – gleich lang, entgegengesetzt
    // F₀ entspricht 22 % des Abstands im Bild: Faktoren bis ×4 passen zwischen die Körper, darüber wird gekürzt
    const L0 = clamp(gap * 0.22, 18, 70);
    const len = Math.max(4, L0 * Math.abs(rd(q) || 1));
    const ya = cy - R - 26, yb = cy - R - 12;
    const max1 = dir > 0 ? gap - 8 : x1 - 20, max2 = dir > 0 ? gap - 8 : W - 20 - x2;
    if (q && Math.abs(q.l) > 0.004) { dashedArrow(ctx, x1, ya, x1 + dir * Math.min(L0, max1), ya, col.ink2); dashedArrow(ctx, x2, yb, x2 - dir * Math.min(L0, max2), yb, col.ink2); }
    vec(ctx, x1, ya, dir, 0, len, max1, c);
    vec(ctx, x2, yb, -dir, 0, len, max2, c);
    label(ctx, 'F = ' + S.fo('F', true) + ' N' + (dir < 0 ? tr('  (abstoßend)', '  (repulsive)') : ''), 16, 22, col, { mono: true, color: c, size: 13 });
    if (terms.length) {
      const sz = narrow ? 11 : 12, sp = narrow ? ' · ' : '  ·  ', eq = narrow ? ' = ' : '  =  ';
      font(ctx, col, sz, true);
      let x = 16;
      terms.forEach(([t, f], i) => {
        const w = textW(ctx, t);
        label(ctx, t, x, 42, col, { mono: true, size: sz, color: col.ink2 });
        label(ctx, fx(f), x + w / 2, 59, col, { mono: true, size: sz, align: 'center', color: fxColor(f, col) });
        x += w + (i < terms.length - 1 ? textW(ctx, i === 0 ? eq : sp) : 0);
        if (i < terms.length - 1) label(ctx, i === 0 ? eq : sp, x - textW(ctx, i === 0 ? eq : sp), 42, col, { mono: true, size: sz, color: col.ink3 });
      });
      label(ctx, tr('₀ = Bezug: ', '₀ = reference: ') + S.baseLabel, 16, 75, col, { size: 11, color: col.ink3 });
    }
    note(ctx, tr('Nicht maßstäblich: Größen und Abstand log., Pfeillänge ∝ F/F₀', 'Not to scale: sizes and distance log, arrow length ∝ F/F₀'), W, H, col);
  };

  V.kinematics = (ctx, W, H, S) => {
    const { v, o, col } = S;
    grid(ctx, W, H, col);
    const tmax = Math.max(v.t, 1) * 1.15;
    const sAt = (t) => S.at({ t }).o('s');
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i <= 60; i++) { const s = sAt((tmax * i) / 60); lo = Math.min(lo, s); hi = Math.max(hi, s); }
    if (!isFinite(lo) || !isFinite(hi)) return invalid(ctx, W, H, col, tr('Werte nicht darstellbar', 'Values cannot be displayed'));
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
    const X = (s) => map(s, lo, hi, 40, W - 40);
    const ty = H * 0.55;
    ctx.strokeStyle = col.ink3; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30, ty); ctx.lineTo(W - 30, ty); ctx.stroke();
    // ticks
    const step = Math.pow(10, Math.floor(Math.log10((hi - lo) / 5)));
    const st = (hi - lo) / step > 10 ? step * 2 : step;
    ctx.lineWidth = 1;
    for (let s = Math.ceil(lo / st) * st; s <= hi; s += st) {
      ctx.beginPath(); ctx.moveTo(X(s), ty); ctx.lineTo(X(s), ty + 6); ctx.stroke();
      label(ctx, E.fmt(s, 3), X(s), ty + 20, col, { align: 'center', size: 10, mono: true, color: col.ink3 });
    }
    label(ctx, 's in m', W - 30, ty + 36, col, { align: 'right', size: 11, color: col.ink3 });
    // trail: one mark per second
    const n = Math.min(60, Math.floor(v.t));
    for (let i = 0; i <= n; i++) {
      ctx.fillStyle = col.cyan; ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.arc(X(sAt(i)), ty, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // start marker
    ctx.strokeStyle = col.ink3; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(X(v.s0), ty - 40); ctx.lineTo(X(v.s0), ty); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 's₀', X(v.s0), ty - 44, col, { align: 'center', size: 11 });
    // body
    const s = o('s'), vel = o('v');
    const bx = X(s);
    ctx.fillStyle = col.ink;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx - 16, ty - 22, 32, 18, 4) : ctx.rect(bx - 16, ty - 22, 32, 18); ctx.fill();
    ctx.fillStyle = col.bg; ctx.beginPath(); ctx.arc(bx - 8, ty - 3, 4, 0, 7); ctx.arc(bx + 8, ty - 3, 4, 0, 7); ctx.fill();
    const vmax = Math.max(Math.abs(S.at({ t: 0 }).o('v')), Math.abs(S.at({ t: tmax }).o('v')), 1e-9);
    const vl = (vel / vmax) * W * 0.18;
    arrow(ctx, bx, ty - 34, bx + vl, ty - 34, col.cyan, 2.5);
    if (v.a !== 0) arrow(ctx, bx, ty - 48, bx + Math.sign(v.a) * 26, ty - 48, col.accent, 2, 7);
    label(ctx, 'v', bx + vl + (vl >= 0 ? 6 : -14), ty - 30, col, { color: col.cyan });
    label(ctx, 't = ' + E.fmt(v.t, 3) + ' s    s = ' + f3(s) + ' m    v = ' + f3(vel) + ' m/s', 16, 24, col, { mono: true, color: col.ink });
    label(ctx, tr('Punkte: Position zu jeder vollen Sekunde', 'Dots: position at every full second'), 16, 42, col, { size: 11, color: col.ink3 });
  };

  /* ---------- Freier Fall: t, s, v, a laufen nebeneinander mit ---------- */
  V.freefall = (ctx, W, H, S) => {
    const { v, col } = S;
    grid(ctx, W, H, col);
    const tf = S.o('tf'), h = S.o('h'), vel = S.o('v'), vi = S.o('vi');
    const hasTf = isFinite(tf) && tf > 0;
    const landed = h < 0;
    const sw = clamp(W * 0.42, 150, 300);
    const ground = H - 30, top = 50;
    const hmax = Math.max(v.h0, 1e-9);
    const Y = (hh) => ground - (clamp(hh, 0, hmax) / hmax) * (ground - top);
    ctx.fillStyle = col.panel2; ctx.fillRect(0, ground, sw, H - ground);
    ctx.strokeStyle = col.ink3; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(sw, ground); ctx.stroke();
    // ruler
    const rx = 52;
    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(rx, top); ctx.lineTo(rx, ground); ctx.stroke();
    for (let i = 0; i <= 5; i++) {
      const hh = (hmax * i) / 5;
      ctx.beginPath(); ctx.moveTo(rx - 6, Y(hh)); ctx.lineTo(rx, Y(hh)); ctx.stroke();
      label(ctx, E.fmt(hh, 3) + ' m', rx - 10, Y(hh) + 4, col, { align: 'right', size: 10, mono: true, color: col.ink3 });
    }
    const bx = rx + (sw - rx) * 0.55;
    // Positionen in gleichen Zeitabständen (Werte aus der Engine): die Abstände wachsen
    if (hasTf) {
      for (let i = 0; i <= 8; i++) {
        const t = (tf * i) / 8;
        if (t > v.t) break;
        ctx.fillStyle = col.cyan; ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.arc(bx, Y(S.at({ t }).o('h')), 6, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    const by = landed ? ground - 11 : Y(h);
    ctx.fillStyle = landed ? col.red : col.ink;
    ctx.beginPath(); ctx.arc(bx, Math.min(by, ground - 11), 11, 0, 7); ctx.fill();
    if (!landed && isFinite(vi) && vi > 0) arrow(ctx, bx + 22, by, bx + 22, by + (vel / vi) * (ground - top) * 0.35, col.cyan, 2.5);
    label(ctx, 't = ' + E.fmt(v.t, 3) + ' s', 16, 20, col, { mono: true, color: col.ink, size: 13 });
    label(ctx, 'h = ' + (landed ? tr('0 (am Boden)', '0 (on the ground)') : f3(h) + ' m'), 16, 38, col, { mono: true, color: landed ? col.red : col.ink2 });
    if (landed) label(ctx, tr('Aufschlag bei t = ', 'Impact at t = ') + E.fmt(tf, 3) + ' s', sw / 2 + 20, ground + 20, col, { align: 'center', color: col.red, size: 11 });
    else if (hasTf) label(ctx, tr('Punkte: gleiche Zeitabstände', 'Dots: equal time steps'), sw / 2 + 20, ground + 20, col, { align: 'center', color: col.ink3, size: 11 });

    // Zeitverläufe s(t), v(t), a(t) bis zum Aufschlag
    const px0 = sw + 18, px1 = W - 14;
    if (px1 - px0 < 110) return;
    const tEnd = hasTf ? tf : Math.max(v.t, 1);
    const tc = Math.min(Math.max(v.t, 0), tEnd);
    const N = 40, pts = [];
    for (let i = 0; i <= N; i++) { const t = (tEnd * i) / N; const r = S.at({ t }); pts.push([t, v.h0 - r.o('h'), r.o('v')]); }
    const now = S.at({ t: tc });
    const sNow = v.h0 - now.o('h'), vNow = now.o('v');
    const rows = [
      { t: 's = h₀ − h', val: f3(sNow) + ' m', y: sNow, hint: '∝ t²', color: col.accent, pts: pts.map((p) => [p[0], p[1]]) },
      { t: 'v = g·t', val: now.fo('v') + ' m/s', y: vNow, hint: '∝ t', color: col.cyan, pts: pts.map((p) => [p[0], p[2]]) },
      { t: 'a = g', val: f3(v.g) + ' m/s²', y: v.g, hint: tr('konstant', 'constant'), color: col.violet, pts: pts.map((p) => [p[0], v.g]), ymax: Math.abs(v.g) / 0.7 },
    ];
    const rh = (H - 14) / 3;
    rows.forEach((r, i) => {
      const y0 = 8 + i * rh;
      segs(ctx, [[r.t + ' = ', col.ink2], [r.val, r.color]], px0, y0 + 12, col, { mono: true, size: 11 });
      label(ctx, r.hint, px1, y0 + 12, col, { align: 'right', size: 11, color: col.ink3 });
      spark(ctx, px0, y0 + 18, px1 - px0, rh - 30, r.pts, tc, r.y, tEnd, r.color, col, r.ymax);
    });
    label(ctx, '0', px0, H - 4, col, { size: 10, mono: true, color: col.ink3 });
    label(ctx, (hasTf ? (tr('t_Fall = ', 't_fall = ')) : 't = ') + E.fmt(tEnd, 3) + ' s', px1, H - 4, col, { align: 'right', size: 10, mono: true, color: col.ink3 });
  };

  V.spring = (ctx, W, H, S) => {
    const { v, o, col, t } = S;
    grid(ctx, W, H, col);
    const T = o('T');
    const wx = 28, cy = H * 0.5;
    ctx.fillStyle = col.panel2; ctx.fillRect(0, cy - 60, wx, 120);
    ctx.strokeStyle = col.ink3; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(wx, cy - 60); ctx.lineTo(wx, cy + 60); ctx.stroke();
    const eq = W * 0.55;
    const scale = (W * 0.3) / Math.max(0.5, Math.abs(v.x));
    if (!isFinite(T) || T <= 0) {
      invalid(ctx, W, H * 0.3, col, tr('Keine Schwingung: k und m müssen positiv sein', 'No oscillation: k and m must be positive'));
    }
    const Tdisp = isFinite(T) && T > 0 ? clamp(T, 1.2, 6) : Infinity;
    const phase = isFinite(Tdisp) ? (2 * Math.PI * t) / Tdisp : 0;
    const x = v.x * Math.cos(phase);
    const mx = eq + x * scale;
    // spring zigzag
    const coils = 14, x0 = wx, x1 = mx - 26;
    ctx.strokeStyle = col.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0, cy);
    for (let i = 1; i < coils * 2; i++) {
      const px = lerp(x0 + 8, x1 - 8, i / (coils * 2));
      ctx.lineTo(px, cy + (i % 2 ? -12 : 12));
    }
    ctx.lineTo(x1, cy); ctx.stroke();
    ctx.setLineDash([3, 4]); ctx.strokeStyle = col.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(eq, cy - 60); ctx.lineTo(eq, cy + 60); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 'x = 0', eq, cy + 76, col, { align: 'center', size: 11 });
    ctx.fillStyle = col.ink; ctx.fillRect(mx - 26, cy - 22, 52, 44);
    label(ctx, f3(v.m) + ' kg', mx, cy + 4, col, { align: 'center', mono: true, size: 11, color: col.bg });
    // Rückstellkraft an der momentanen Auslenkung – aus der Engine (F = −kx)
    const Fnow = S.at({ x }).o('F'), Fmax = Math.abs(o('F')) || 1;
    arrow(ctx, mx, cy - 34, mx + (Fnow / Fmax) * W * 0.16, cy - 34, col.accent, 2.5);
    label(ctx, 'F = −kx', mx, cy - 44, col, { align: 'center', color: col.accent, size: 11 });
    if (isFinite(T) && T > 0) {
      const f = T / Tdisp;
      const txt = Math.abs(f - 1) < 1e-6 ? tr('Echtzeit', 'real time') : f < 1 ? tr('Zeitlupe: ' + E.fmt(1 / f, 3) + '× langsamer', 'slow motion: ' + E.fmt(1 / f, 3) + '× slower') : tr('Zeitraffer: ' + E.fmt(f, 3) + '× schneller', 'time-lapse: ' + E.fmt(f, 3) + '× faster');
      label(ctx, 'T = ' + f3(T) + ' s   (' + txt + ')', 16, 24, col, { mono: true, color: col.ink });
    }
  };

  /* ---------- Kreisbewegung: Pfeile proportional zu v und a, ω als Winkel ---------- */
  V.circular = (ctx, W, H, S) => {
    const { v, col, t } = S;
    grid(ctx, W, H, col);
    const T = S.o('T');
    if (!isFinite(T) || T <= 0) return invalid(ctx, W, H, col, tr('Keine Umlaufbewegung darstellbar', 'No orbital motion to display'));
    const narrow = W < 520;
    const B = S.base ? S.at(S.base) : null;
    const qv = B ? ratio(mk(v.v), mk(S.base.v)) : null, qa = B ? ratio(S.num('a'), B.num('a')) : null;
    const qr = B && S.base.r > 0 && v.r > 0 ? v.r / S.base.r : 1;
    const R0 = Math.min(W * 0.25, H * (narrow ? 0.27 : 0.3));
    const R = R0 * clamp(qr, 0.55, 1.15);
    const cx = W - R0 * 1.85 - 12, cy = narrow ? H * 0.6 : H * 0.52;
    const L0 = R0 * 0.45, Lmax = R0 * (narrow ? 0.75 : 0.95);
    ctx.strokeStyle = col.ink3; ctx.setLineDash([4, 5]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = col.ink3; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill();
    const Tdisp = clamp(T, 2.5, 8);
    const ang = -(2 * Math.PI * t) / Tdisp;
    // überstrichener Winkel φ = ωt seit dem Start der Runde
    const phi = ((-ang) % (2 * Math.PI));
    ctx.fillStyle = col.violet; ctx.globalAlpha = 0.14;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R * 0.42, 0, -phi, true); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = col.violet; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.42, 0, -phi, true); ctx.stroke();
    label(ctx, 'φ = ωt', cx + R * 0.3, cy + 16, col, { size: 11, color: col.violet });
    const px = cx + R * Math.cos(ang), py = cy + R * Math.sin(ang);
    ctx.strokeStyle = col.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    label(ctx, 'r', (cx + px) / 2 + 6, (cy + py) / 2 - 6, col, { size: 12 });
    const tx = Math.sin(ang), ty = -Math.cos(ang);
    const lv = vec(ctx, px, py, tx, ty, L0 * (rd(qv) || 1), Lmax, col.cyan);
    const ux = (cx - px) / R, uy = (cy - py) / R;
    vec(ctx, px, py, ux, uy, L0 * (rd(qa) || 1), Math.min(Lmax, R * 0.95), col.accent);
    ctx.fillStyle = col.ink; ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.fill();
    label(ctx, 'v', px + tx * lv + 6, py + ty * lv, col, { color: col.cyan });
    // Werte aus der Engine, daneben der Faktor gegenüber dem Vergleichswert
    const rows = [
      ['v = ', f3(v.v) + ' m/s', col.cyan, qv],
      [narrow ? 'a = ' : 'a = v²/r = ', S.fo('a') + ' m/s²', col.accent, qa],
      [narrow ? 'ω = ' : 'ω = v/r = ', S.fo('omega') + ' s⁻¹', col.violet, B ? ratio(S.num('omega'), B.num('omega')) : null],
      [narrow ? 'T = ' : 'T = 2πr/v = ', S.fo('T') + ' s', col.ink, B ? ratio(S.num('T'), B.num('T')) : null],
    ];
    rows.forEach(([k, val, c, q], i) => {
      const end = segs(ctx, [[k, col.ink2], [val, c]], 16, 22 + i * 18, col, { mono: true, size: narrow ? 11 : 12 });
      if (q) label(ctx, fx(q), end + 8, 22 + i * 18, col, { mono: true, size: 11, color: fxColor(q, col) });
    });
    const f = T / Tdisp;
    const speed = Math.abs(f - 1) < 1e-6 ? '' : tr('Anzeige ', 'shown ') + E.fmt(f > 1 ? f : 1 / f, 3) + '× ' + (f > 1 ? tr('schneller', 'faster') : tr('langsamer', 'slower'));
    if (B) label(ctx, tr('Pfeile ∝ Wert · Faktoren gegenüber Bezug: ', 'Arrows ∝ value · factors vs. reference: ') + S.baseLabel, 16, H - 28, col, { size: 11, color: col.ink3 });
    label(ctx, speed, 16, H - 12, col, { size: 11, color: col.ink3 });
  };

  /* ---------- Spezielle Relativität: Stab, zwei Uhren, γ(β) ---------- */
  V.relativity = (ctx, W, H, S) => {
    const { v, col, t } = S;
    grid(ctx, W, H, col);
    const g = S.o('gamma');
    if (!isFinite(g)) return invalid(ctx, W, H, col, tr('γ ist für |β| ≥ 1 nicht definiert', 'γ is not defined for |β| ≥ 1'));
    const wide = W >= 540;
    const L = W * 0.56, x0 = W * 0.36;
    const rowY = [H * 0.13, H * 0.28];
    label(ctx, tr('Stab in Ruhe: L₀', 'Rod at rest: L₀'), 16, rowY[0] + 5, col, { size: 12 });
    ctx.fillStyle = col.ink2; ctx.fillRect(x0, rowY[0] - 7, L, 14);
    label(ctx, tr('gemessen im Labor: L = L₀/γ', 'measured in the lab: L = L₀/γ'), 16, rowY[1] + 5, col, { size: 12 });
    const qL = ratio(S.num('L'), mk(v.L0));
    const Lc = qL ? L * rd(qL) : L / g;
    const drift = ((t * 60) % (L - Math.max(Lc, 2) + 1));
    ctx.fillStyle = col.accent; ctx.fillRect(x0 + drift, rowY[1] - 7, Math.max(Lc, 1.5), 14);
    if (Lc < 3) label(ctx, tr('(kürzer als ein Pixel)', '(shorter than a pixel)'), x0 + drift + 6, rowY[1] - 12, col, { size: 10, color: col.ink3 });
    arrow(ctx, x0 + drift + Math.max(Lc, 2) + 6, rowY[1], x0 + drift + Math.max(Lc, 2) + 40, rowY[1], col.accent, 2, 7);
    // Uhren: Laborzeit und Eigenzeit; unten die Werte der Engine (Δt = γ·Δτ)
    const cyc = H * 0.62, rC = Math.min(44, H * 0.13);
    const cxs = wide ? [W * 0.14, W * 0.38] : [W * 0.28, W * 0.72];
    const clocks = [
      [cxs[0], 1, tr('Laboruhr', 'Lab clock'), col.ink, 'Δt = ' + S.fo('dt') + ' s'],
      [cxs[1], 1 / g, tr('Bewegte Uhr (Eigenzeit)', 'Moving clock (proper time)'), col.accent, 'Δτ = ' + f3(v.tau) + ' s'],
    ];
    clocks.forEach(([cx, rate, name, c, val]) => {
      ctx.strokeStyle = col.ink3; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cyc, rC, 0, 7); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * rC * 0.85, cyc + Math.sin(a) * rC * 0.85); ctx.lineTo(cx + Math.cos(a) * rC, cyc + Math.sin(a) * rC); ctx.stroke();
      }
      const ang = -Math.PI / 2 + ((t * rate) / 4) * Math.PI * 2;
      arrow(ctx, cx, cyc, cx + Math.cos(ang) * rC * 0.8, cyc + Math.sin(ang) * rC * 0.8, c, 2.5, 6);
      label(ctx, name, cx, cyc + rC + 16, col, { align: 'center', size: W < 420 ? 11 : 12, color: c });
      label(ctx, val, cx, cyc + rC + 31, col, { align: 'center', size: 11, mono: true, color: col.ink2 });
    });
    label(ctx, 'γ = ' + E.fmt(g, 6) + '   β = ' + E.fmt(v.beta, 8), 16, H - 10, col, { mono: true, color: col.ink });
    if (!wide) return;
    // γ(β) mit der Asymptote bei β = 1; Kurve aus der Engine
    const bx0 = W * 0.56 + 18, bx1 = W - 20, by0 = H * 0.42, by1 = H - 42, gmax = 8;
    const X = (b) => bx0 + clamp(b, 0, 1) * (bx1 - bx0), Yg = (x) => by1 - ((clamp(x, 1, gmax) - 1) / (gmax - 1)) * (by1 - by0);
    ctx.strokeStyle = col.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx0, by0); ctx.lineTo(bx0, by1); ctx.lineTo(bx1, by1); ctx.stroke();
    [[1, '1'], [2, '2'], [4, '4'], [8, '8']].forEach(([y, s]) => label(ctx, s, bx0 - 5, Yg(y) + 4, col, { align: 'right', size: 10, mono: true, color: col.ink3 }));
    [[0, '0'], [0.5, E.fmt(0.5, 1)], [1, '1']].forEach(([b, s]) => label(ctx, s, X(b), by1 + 13, col, { align: 'center', size: 10, mono: true, color: col.ink3 }));
    label(ctx, 'β', bx1 + 4, by1 + 4, col, { size: 12, color: col.ink2 });
    label(ctx, 'γ', bx0, by0 - 6, col, { align: 'center', size: 12, color: col.ink2 });
    ctx.strokeStyle = col.red; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(X(1), by0); ctx.lineTo(X(1), by1); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 'β → 1: γ → ∞', X(1) - 4, by0 + 10, col, { align: 'right', size: 10, color: col.red });
    ctx.strokeStyle = col.accent; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 90; i++) {
      const b = (i / 90) * 0.992, gg = S.at({ beta: b }).o('gamma');
      if (!isFinite(gg) || gg > gmax) break;
      i ? ctx.lineTo(X(b), Yg(gg)) : ctx.moveTo(X(b), Yg(gg));
    }
    ctx.stroke();
    const bb = Math.abs(v.beta);
    ctx.fillStyle = col.accent;
    if (g <= gmax) { ctx.beginPath(); ctx.arc(X(bb), Yg(g), 4.5, 0, 7); ctx.fill(); }
    else { arrow(ctx, X(bb), by0 + 14, X(bb), by0 - 2, col.accent, 2, 6); label(ctx, 'γ = ' + E.fmt(g, 4), X(bb) - 8, by0 + 24, col, { align: 'right', size: 10, mono: true, color: col.accent }); }
    note(ctx, tr('Gemessene, nicht gesehene Längen (Terrell-Penrose)', 'Measured, not seen, lengths (Terrell–Penrose)'), W, H - 1, col);
  };

  const STARS = (() => { const r = rng(7); return Array.from({ length: 90 }, () => [r(), r(), r()]); })();
  function stars(ctx, W, H, col) {
    ctx.fillStyle = col.ink3;
    for (const [x, y, s] of STARS) { ctx.globalAlpha = 0.3 + s * 0.5; ctx.fillRect(x * W, y * H, s > 0.8 ? 2 : 1, s > 0.8 ? 2 : 1); }
    ctx.globalAlpha = 1;
  }

  /* ---------- Schwarzes Loch: r_s, A, S_BH, T_H synchron zur Masse ----------
     Jede Größe als Balken im gleichen Maßstab je Zehnerpotenz über den ganzen Regler-Bereich.
     Weil Q ∝ M^p gilt, ist der Balken |p|-mal so lang und die Marke wandert |p|-mal so schnell;
     der Exponent p wird aus den Engine-Werten an den Bereichsenden bestimmt. */
  const BH = [
    { key: 'rs', id: 'hawking', sym: 'r_s', unit: 'm', c: 'ink' },
    { key: 'A', id: 'bh-entropy', form: 'mass', sym: 'A', unit: 'm²', c: 'cyan' },
    { key: 'S', id: 'bh-entropy', form: 'mass', sym: 'S_BH', unit: 'J/K', c: 'violet' },
    { key: 'TH', id: 'hawking', sym: 'T_H', unit: 'K', c: 'accent' },
  ];
  const pLabel = (p) => (!isFinite(p) ? '' : '∝ M' + (p === 1 ? '' : E.sup(p)));
  function bhView(ctx, W, H, S) {
    const { v, col, t } = S;
    stars(ctx, W, H, col);
    const d = S.exp.vars.M, M = v.M;
    if (!(M > 0) || !isFinite(M)) return invalid(ctx, W, H, col, tr('Für M ≤ 0 gibt es kein Schwarzes Loch', 'There is no black hole for M ≤ 0'));
    const lo = Math.log10(d.min), hi = Math.log10(d.max);
    const rows = BH.map((q) => {
      const cur = S.at({ M }, q.id, q.form), a = S.at({ M: d.min }, q.id, q.form), b = S.at({ M: d.max }, q.id, q.form);
      const la = a.lg(q.key), lb = b.lg(q.key);
      return Object.assign({}, q, { l: cur.lg(q.key), lmin: Math.min(la, lb), lmax: Math.max(la, lb), p: Math.round(((lb - la) / (hi - lo)) * 100) / 100, txt: cur.fo(q.key), color: col[q.c] });
    });
    if (rows.some((r) => !isFinite(r.l))) return invalid(ctx, W, H, col, tr('Für diese Masse nicht auswertbar', 'Cannot be evaluated for this mass'));
    const narrow = W < 520;
    const pw = narrow ? Math.min(W * 0.32, H * 0.6) : Math.min(W * 0.36, H * 0.95);
    const cx = pw / 2 + 8, cy = H * 0.55;
    const frac = (r) => clamp((r.l - r.lmin) / (r.lmax - r.lmin || 1), 0, 1);
    const [rs, , , TH] = rows;
    const R = lerp(6, pw * 0.34, frac(rs));
    const hot = frac(TH);
    const cmb = PP.model.C.T_cmb.value;
    const cold = TH.l < Math.log10(cmb);
    // Bild: Horizont (Größe ~ log r_s) und Hawking-Strahlung (Menge ~ log T_H)
    ctx.save(); ctx.beginPath(); ctx.rect(0, 30, pw + 16, H - 30); ctx.clip();
    const n = Math.round(4 + hot * 56), r = rng(3);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, sp = 0.4 + r() * 0.6, off = r();
      const dd = R + ((t * 40 * sp + off * 200) % (pw * 0.5));
      ctx.fillStyle = cold ? col.cyan : col.accent;
      ctx.globalAlpha = 0.25 + hot * 0.6;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * dd, cy + Math.sin(a) * dd, 1.6, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const glow = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.7);
    glow.addColorStop(0, cold ? col.cyan : col.accent); glow.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.15 + hot * 0.5; ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, R * 1.7, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    // Horizontfläche: Gitter auf der Kugel
    ctx.strokeStyle = col.cyan; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.5;
    for (let i = -2; i <= 2; i++) { const y = (i / 3) * R, rr = Math.sqrt(R * R - y * y); ctx.beginPath(); ctx.ellipse(cx, cy + y, rr, rr * 0.2, 0, 0, 7); ctx.stroke(); }
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI + ((t * 0.15) % (Math.PI / 6)); ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(Math.cos(a)) * R, R, 0, 0, 7); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.strokeStyle = col.ink3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.restore();
    label(ctx, 'M = ' + E.fmt(M, 4) + ' kg  (' + S.at({ M }, 'hawking').fo('Msun') + ' M☉)', 16, 20, col, { mono: true, size: narrow ? 11 : 12, color: col.ink });
    // Balken
    const mx0 = pw + 28, mx1 = W - 16, Lfull = mx1 - mx0;
    const pmax = Math.max(1e-9, ...rows.map((q) => Math.abs(q.p)).filter(isFinite));
    const y0 = 36, rowH = (H - y0 - 22) / 4;
    rows.forEach((q, i) => {
      const ty = y0 + i * rowH + 13, by = ty + 11;
      const len = isFinite(q.p) ? (Lfull * Math.abs(q.p)) / pmax : 0;
      segs(ctx, [[q.sym + ' = ', col.ink2], [q.txt + ' ' + q.unit, q.color]], mx0, ty, col, { mono: true, size: narrow ? 11 : 12 });
      label(ctx, pLabel(q.p), mx1, ty, col, { align: 'right', mono: true, size: 12, color: col.ink });
      ctx.strokeStyle = col.ink3; ctx.globalAlpha = 0.35; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(mx0, by); ctx.lineTo(mx0 + len, by); ctx.stroke(); ctx.globalAlpha = 1;
      const mxp = mx0 + frac(q) * len;
      ctx.strokeStyle = q.color; ctx.beginPath(); ctx.moveTo(mx0, by); ctx.lineTo(mxp, by); ctx.stroke(); ctx.lineCap = 'butt';
      ctx.fillStyle = q.color; ctx.beginPath(); ctx.arc(mxp, by, 5, 0, 7); ctx.fill();
      // Bereichsenden; beim T-Balken zusätzlich die Hintergrundstrahlung – Beschriftungen, die sich überdecken würden, entfallen
      const lmin = '10' + E.sup(Math.round(q.lmin)), lmax = '10' + E.sup(Math.round(q.lmax));
      font(ctx, col, 10, true);
      let x0e = mx0 + textW(ctx, lmin) + 4, x1e = mx0 + len - textW(ctx, lmax) - 4;
      if (q.key === 'TH') {
        const fc = clamp((Math.log10(cmb) - q.lmin) / (q.lmax - q.lmin), 0, 1), xc = mx0 + fc * len, cl = tr('CMB 2,7 K', 'CMB 2.7 K');
        ctx.strokeStyle = col.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xc, by - 7); ctx.lineTo(xc, by + 7); ctx.stroke();
        font(ctx, col, 10);
        const hw = textW(ctx, cl) / 2;
        label(ctx, cl, xc, by + 15, col, { align: 'center', size: 10, color: col.ink2 });
        if (xc - hw < x0e) x0e = -1; if (xc + hw > x1e) x1e = -1;
      }
      if (x0e > 0) label(ctx, lmin, mx0, by + 15, col, { size: 10, mono: true, color: col.ink3 });
      if (x1e > 0) label(ctx, lmax, mx0 + len, by + 15, col, { align: 'right', size: 10, mono: true, color: col.ink3 });
    });
    note(ctx, tr('Schematisch · Balken logarithmisch, gleicher Maßstab je Zehnerpotenz', 'Schematic · bars logarithmic, same scale per power of ten'), W, H, col);
  }
  V.blackhole = bhView;

  V.horizon = (ctx, W, H, S) => {
    if (S.form === 'mass') return bhView(ctx, W, H, S);
    const { o, col, t } = S;
    stars(ctx, W, H, col);
    const skb = o('SkB');
    const cx = W / 2, cy = H * 0.45, R = Math.min(W, H) * 0.3;
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.strokeStyle = col.accent; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.55;
    const rot = t * 0.15;
    for (let i = -5; i <= 5; i++) {
      const y = (i / 6) * R, rr = Math.sqrt(R * R - y * y);
      ctx.beginPath(); ctx.ellipse(cx, cy + y, rr, rr * 0.18, 0, 0, 7); ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI + (rot % (Math.PI / 12));
      ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(Math.cos(a)) * R, R, 0, 0, 7); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = col.ink3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    label(ctx, isFinite(skb) ? 'S/k_B = A/(4 l_P²) ≈ ' + f3(skb) : tr('S/k_B nicht definiert', 'S/k_B not defined'), cx, cy + R + 32, col, { align: 'center', mono: true, size: 14, color: col.ink });
    label(ctx, tr('dimensionslos: eine reine Zahl', 'dimensionless: a pure number'), cx, cy + R + 52, col, { align: 'center', size: 12, color: col.ink2 });
    note(ctx, tr('Schematisch: Jede Zelle steht für unvorstellbar viele Planck-Flächen', 'Schematic: each cell stands for an unimaginable number of Planck areas'), W, H, col);
  };

  /* ---------- Feldgleichungen: drehbare Projektion, Tiefe aus K ----------
     Schematisch: Das Gitter ist eine Einbettung zur Anschauung, keine Lösung der Feldgleichungen.
     Die Tiefe folgt der Lage von log K im Regler-Bereich (Werte aus der Engine),
     die Bahn des Testkörpers ist konzeptionell. */
  V.spacetime = (ctx, W, H, S) => {
    const { v, col, t } = S;
    const lgK = S.lg('K');
    if (!isFinite(lgK)) return invalid(ctx, W, H, col, tr('K ist hier nicht definiert', 'K is not defined here'));
    const d = S.exp.vars.u;
    const k0 = S.at({ u: d.min }).lg('K'), k1 = S.at({ u: d.max }).lg('K');
    const depth = 0.08 + 0.92 * clamp((lgK - k0) / (k1 - k0 || 1), 0, 1);
    const narrow = W < 520;
    const yaw = 0.5 + t * 0.12, pitch = 0.5;
    const cx = W / 2, cy = H * 0.47, sc = Math.min(W * 0.38, H * 0.45);
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const zf = (x, y) => -depth * 0.6 / (1 + (x * x + y * y) / 0.06);
    const P = (x, y, z) => {
      const xr = x * cyw - y * syw, yr = x * syw + y * cyw;
      const yd = yr * cp - z * sp, zu = yr * sp + z * cp;
      const f = 1 / (1 + yd * 0.18);
      return [cx + sc * xr * f, cy - sc * zu * f];
    };
    // Gitter = Geometrie (linke Seite der Gleichung)
    const N = 16;
    ctx.strokeStyle = col.cyan; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
    for (let i = 0; i <= N; i++) {
      const a = -1 + (2 * i) / N;
      for (const along of [0, 1]) {
        ctx.beginPath();
        for (let j = 0; j <= 40; j++) {
          const b = -1 + (2 * j) / 40;
          const [x, y] = along ? [a, b] : [b, a];
          const [X, Y] = P(x, y, zf(x, y));
          j ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
        }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    // Quelle = Energiedichte (rechte Seite)
    const [mx, my] = P(0, 0, zf(0, 0));
    const br = map(Math.log10(Math.max(v.u, 1e-30)), -15, 40, 5, 20);
    const g = ctx.createRadialGradient(mx - br * 0.3, my - br * 1.3, br * 0.1, mx, my - br, br);
    g.addColorStop(0, col.ink); g.addColorStop(1, col.accent);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my - br, br, 0, 7); ctx.fill();
    // Testkörper auf einer konzeptionellen Bahn, mit Spur und Bewegungsrichtung
    const rho = 0.55, w = 0.5 + 1.3 * depth, th = t * w;
    const pos = (a) => { const x = rho * Math.cos(a), y = rho * Math.sin(a); return P(x, y, zf(x, y)); };
    ctx.strokeStyle = col.ink; ctx.lineWidth = 1.5;
    for (let k = 0; k < 36; k++) {
      const [ax, ay] = pos(th - k * 0.06), [bx, by] = pos(th - (k + 1) * 0.06);
      ctx.globalAlpha = 0.6 * (1 - k / 36); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const [px, py] = pos(th), [qx, qy] = pos(th + 0.25);
    const dl = Math.hypot(qx - px, qy - py) || 1;
    arrow(ctx, px, py, px + ((qx - px) / dl) * 30, py + ((qy - py) / dl) * 30, col.ink2, 1.8, 7);
    ctx.fillStyle = col.ink; ctx.beginPath(); ctx.arc(px, py, 5, 0, 7); ctx.fill();
    // Gleichung farbig: Gitter ↔ linke Seite, Kugel ↔ rechte Seite
    const sz = narrow ? 12 : 14;
    segs(ctx, [['G_μν + Λg_μν', col.cyan], [' = ', col.ink2], ['(8πG/c⁴) T_μν', col.accent]], 16, 24, col, { size: sz });
    label(ctx, 'K ~ ' + S.fo('K') + ' m⁻²   ℓ ~ ' + S.fo('Lc') + ' m', 16, 44, col, { mono: true, size: narrow ? 11 : 12, color: col.ink });
    const leg = [[tr('Gitter: Geometrie', 'Grid: geometry'), col.cyan], ['  ·  ', col.ink3], [tr('Kugel: Energiedichte u', 'Sphere: energy density u'), col.accent], ['  ·  ', col.ink3], [tr('Punkt: Testkörper', 'Dot: test body'), col.ink]];
    if (narrow) { segs(ctx, leg.slice(0, 3), 16, H - 30, col, { size: 11 }); segs(ctx, leg.slice(4), 16, H - 14, col, { size: 11 }); }
    else segs(ctx, leg, 16, H - 30, col, { size: 11 });
    label(ctx, narrow ? tr('Schematische Projektion (Modell)', 'Schematic projection (model)') : tr('Schematische Projektion (Modell): Tiefe ~ log K, Bahn konzeptionell', 'Schematic projection (model): depth ~ log K, orbit conceptual'), W - 10, narrow ? 44 : H - 12, col, { align: 'right', size: 11, color: col.ink3 });
  };

  /* ---------- Schrödinger: ψ und |ψ|², Zeitmaßstab aus ω_n ---------- */
  V.wavefunction = (ctx, W, H, S) => {
    const { v, col, t, opts } = S;
    grid(ctx, W, H, col);
    const n = v.n;
    if (!(n >= 1) || !Number.isInteger(n)) return invalid(ctx, W, H, col, tr('n muss eine positive ganze Zahl sein – sonst passt keine stehende Welle in den Kasten', 'n must be a positive integer – otherwise no standing wave fits into the box'));
    const wn = S.o('omega');
    if (!(wn > 0) || !isFinite(wn)) return invalid(ctx, W, H, col, tr('ω_n ist hier nicht definiert', 'ω_n is not defined here'));
    const x0 = 40, x1 = W - 120, top = 50, bot = H - 40, mid = (top + bot) / 2;
    ctx.fillStyle = col.panel2;
    ctx.fillRect(x0 - 14, top - 10, 14, bot - top + 20); ctx.fillRect(x1, top - 10, 14, bot - top + 20);
    ctx.strokeStyle = col.ink3; ctx.beginPath(); ctx.moveTo(x0, mid); ctx.lineTo(x1, mid); ctx.stroke();
    const amp = (bot - top) * 0.38;
    const sup = opts && opts.superpos;
    // Echte Kreisfrequenzen aus der Engine, für die Anzeige gemeinsam verlangsamt:
    // der Zustand n dreht seine Phase in der Anzeige einmal in 3 s
    const wn1 = S.at({ n: n + 1 }).o('omega');
    const k = (2 * Math.PI) / 3 / wn;
    const w0 = wn * k, w1 = wn1 * k;
    const psi = (xi) => {
      const s1 = Math.sin(n * Math.PI * xi);
      if (!sup) return [s1 * Math.cos(w0 * t), -s1 * Math.sin(w0 * t)];
      const s2 = Math.sin((n + 1) * Math.PI * xi);
      const c = Math.SQRT1_2;
      return [c * (s1 * Math.cos(w0 * t) + s2 * Math.cos(w1 * t)), -c * (s1 * Math.sin(w0 * t) + s2 * Math.sin(w1 * t))];
    };
    const Mn = 240;
    // |ψ|²
    ctx.beginPath(); ctx.moveTo(x0, mid);
    for (let i = 0; i <= Mn; i++) { const xi = i / Mn; const [re, im] = psi(xi); ctx.lineTo(lerp(x0, x1, xi), mid - (re * re + im * im) * amp * (sup ? 0.5 : 1)); }
    ctx.lineTo(x1, mid); ctx.closePath();
    ctx.fillStyle = col.accent; ctx.globalAlpha = 0.28; ctx.fill(); ctx.globalAlpha = 1;
    const curve = (idx, c, wdt) => {
      ctx.strokeStyle = c; ctx.lineWidth = wdt; ctx.beginPath();
      for (let i = 0; i <= Mn; i++) { const xi = i / Mn; const y = mid - psi(xi)[idx] * amp * (sup ? 0.7 : 1); i ? ctx.lineTo(lerp(x0, x1, xi), y) : ctx.moveTo(lerp(x0, x1, xi), y); }
      ctx.stroke();
    };
    curve(0, col.cyan, 2); curve(1, col.red, 1.2);
    label(ctx, '|ψ|²', 16, 18, col, { color: col.accent }); label(ctx, 'Re ψ', 60, 18, col, { color: col.cyan }); label(ctx, 'Im ψ', 112, 18, col, { color: col.red });
    // Zeitmaßstab: echte Werte aus der Engine
    const scale = 1 / k >= 1 ? tr('Anzeige ' + E.fmt(1 / k, 2) + '× langsamer', 'shown ' + E.fmt(1 / k, 2) + '× slower') : tr('Anzeige ' + E.fmt(k, 2) + '× schneller', 'shown ' + E.fmt(k, 2) + '× faster');
    const real = sup
      ? tr('|ψ|² pendelt real mit der Periode 2π/Δω = ', '|ψ|² oscillates in reality with period 2π/Δω = ') + E.fmt((2 * Math.PI) / (wn1 - wn), 3) + ' s · '
      : 'ω_n = ' + S.fo('omega') + ' s⁻¹ · ';
    font(ctx, col, 11);
    label(ctx, (textW(ctx, real + scale) < W - 130 ? real : '') + scale, 16, 34, col, { size: 11, color: col.ink3 });
    label(ctx, '0', x0, bot + 18, col, { align: 'center', size: 11 }); label(ctx, 'L', x1, bot + 18, col, { align: 'center', size: 11 });
    // Energieleiter: Niveaus E_k aus der Engine
    const lx = W - 70, kmax = Math.max(5, n + 2);
    const Emax = S.at({ n: kmax }).o('E');
    const LY = (kk) => bot - (S.at({ n: kk }).o('E') / Emax) * (bot - top);
    ctx.strokeStyle = col.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx - 20, bot); ctx.lineTo(lx - 20, top); ctx.stroke();
    for (let kk = 1; kk <= kmax; kk++) {
      const on = kk === n || (sup && kk === n + 1);
      ctx.strokeStyle = on ? col.accent : col.ink3; ctx.lineWidth = on ? 2.5 : 1;
      ctx.beginPath(); ctx.moveTo(lx - 14, LY(kk)); ctx.lineTo(lx + 20, LY(kk)); ctx.stroke();
      if (kk <= 6 || on) label(ctx, 'n=' + kk, lx + 24, LY(kk) + 4, col, { size: 10, color: on ? col.accent : col.ink3 });
    }
    label(ctx, 'E ∝ n²', lx - 20, top - 16, col, { size: 11, align: 'center' });
    const nt = sup ? tr('Überlagerung: |ψ|² schwappt hin und her', 'Superposition: |ψ|² sloshes back and forth') : tr('Einzelzustand: |ψ|² bleibt konstant, nur die Phase dreht sich', 'Single state: |ψ|² stays constant, only the phase rotates');
    font(ctx, col, 11);
    note(ctx, nt, textW(ctx, nt) < W - 140 ? W - 120 : W, H, col);
  };

  /* ---------- Planck-Einheiten: je Größe eine logarithmische Skala ----------
     Der Planck-Wert kommt aus der Engine (im Break-Modus wandert er mit den Konstanten).
     Vergleichswerte: Konstanten aus dem Register oder gerundete Literaturwerte:
     247 zs – Grundmann et al., Science 370, 339 (2020); 38 pK – Deppner et al., PRL 127, 100401 (2021);
     Quark-Gluon-Plasma ≈ 5,5 × 10¹² K – ALICE (2012); 3,2 × 10²⁰ eV – Fly's Eye (1991); LHC Run 3: 13,6 TeV;
     Alter des Universums 13,8 Mrd. Jahre – Planck 2018. */
  const lg10 = Math.log10;
  function planckScale(S, q) {
    const C = PP.model.C, ev = C.eV.value, c2 = C.c.value ** 2;
    const LHC = 13.6e12 * ev, OMG = 3.2e20 * ev;
    // k_B so, wie die Engine ihn verwendet hat (E_P / T_P) – im Break-Modus also auch ein verstellter Wert
    const kB = rd(ratio(S.num('EP'), S.num('TP')));
    switch (q) {
      case 't': return {
        key: 'tP', unit: 's', lo: -48, hi: 20, f: 't_P = √(ħG/c⁵)', pl: tr('Planck-Zeit', 'Planck time'),
        head2: tr('t_P = l_P / c: so lange braucht Licht für eine Planck-Länge', 't_P = l_P / c: the time light takes to cross one Planck length'),
        marks: [[lg10(2.47e-19), tr('kürzeste gemessene Zeitspanne ≈ 247 zs', 'shortest time span measured ≈ 247 zs')], [0, tr('1 Sekunde', '1 second'), true],
          [lg10(3.15576e7), tr('1 Jahr', '1 year'), true], [lg10(4.35e17), tr('Alter des Universums ≈ 13,8 Mrd. Jahre', 'age of the universe ≈ 13.8 billion years')]],
        reach: [lg10(2.47e-19), 20], reachLabel: tr('direkt gemessen (bis ≈ 10⁻¹⁹ s)', 'measured directly (down to ≈ 10⁻¹⁹ s)'),
        gap: (n) => tr('≈ ' + n + ' Größenordnungen ohne direkte Messung', '≈ ' + n + ' orders of magnitude without direct measurement'),
      };
      case 'm': return {
        key: 'mP', unit: 'kg', lo: -32, hi: 32, f: 'm_P = √(ħc/G)', pl: tr('Planck-Masse ≈ ', 'Planck mass ≈ ') + E.fmt(S.o('mP') * 1e9, 2) + ' µg',
        head2: tr('Für sich genommen keine extreme Masse – extrem wäre, sie in ein einziges Teilchen zu packen.', 'Not an extreme mass in itself – the extreme part would be packing it into a single particle.'),
        marks: [[lg10(C.m_e.value), tr('Elektron', 'electron')], [lg10(C.m_p.value), tr('Proton', 'proton'), true], [lg10(LHC / c2), tr('LHC-Kollision 13,6 TeV als E/c²', 'LHC collision 13.6 TeV as E/c²')],
          [lg10(70), tr('Mensch ≈ 70 kg', 'human ≈ 70 kg'), true], [lg10(C.M_earth.value), tr('Erde', 'Earth')], [lg10(C.M_sun.value), tr('Sonne', 'Sun')]],
        reach: [lg10(C.m_e.value), lg10(LHC / c2)], reachLabel: tr('im Beschleuniger erzeugt (bis E/c² am LHC)', 'produced in accelerators (up to E/c² at the LHC)'),
        gap: (n) => tr('≈ ' + n + ' Größenordnungen über dem LHC', '≈ ' + n + ' orders of magnitude above the LHC'),
      };
      case 'T': return {
        key: 'TP', unit: 'K', lo: -12, hi: 36, f: 'T_P = E_P / k_B', pl: tr('Planck-Temperatur', 'Planck temperature'),
        head2: 'k_B = ' + E.fmt(kB, 7) + ' J/K  ·  1 K ↔ ' + E.fmt(kB / ev, 4) + ' eV',
        marks: [[lg10(3.8e-11), tr('kältestes Labor ≈ 38 pK', 'coldest lab ≈ 38 pK')], [S.at({ M: C.M_sun.value }, 'hawking').lg('TH'), tr('Hawking-Temperatur, 1 M☉', 'Hawking temperature, 1 M☉'), true],
          [lg10(C.T_cmb.value), tr('Hintergrundstrahlung 2,7 K', 'cosmic background 2.7 K')], [lg10(293), tr('Raumtemperatur', 'room temperature'), true],
          [lg10(1.57e7), tr('Sonnenkern', 'solar core')], [lg10(5.5e12), tr('Quark-Gluon-Plasma (LHC)', 'quark–gluon plasma (LHC)')]],
        reach: [lg10(3.8e-11), lg10(5.5e12)], reachLabel: tr('im Labor erreicht', 'reached in the lab'),
        gap: (n) => tr('≈ ' + n + ' Größenordnungen darüber', '≈ ' + n + ' orders of magnitude above'),
        second: { shift: lg10(kB / ev), label: tr('k_B T in eV', 'k_B T in eV') },
      };
      case 'E': return {
        key: 'EP', unit: 'J', lo: -24, hi: 12, f: 'E_P = √(ħc⁵/G) = m_P c²', pl: tr('Planck-Energie', 'Planck energy'),
        head2: 'E_P ≈ ' + E.fmt(S.o('EP') / ev, 3) + ' eV ≈ ' + E.fmt(S.o('EP') / 3.6e6, 3) + ' kWh' + tr(' – im Alltag keine extreme Energie, für ein einzelnes Teilchen aber gewaltig', ' – not extreme in everyday terms, but enormous for a single particle'),
        marks: [[lg10(kB * 293), tr('k_B T bei Raumtemperatur', 'k_B T at room temperature'), true], [lg10(ev), '1 eV'], [lg10(LHC), tr('LHC-Kollision 13,6 TeV', 'LHC collision 13.6 TeV')],
          [lg10(OMG), tr('kosmisches Teilchen ≈ 3 × 10²⁰ eV (1991)', 'cosmic-ray particle ≈ 3 × 10²⁰ eV (1991)')], [lg10(3.6e6), '1 kWh', true]],
        reach: [-24, lg10(OMG)], reachLabel: tr('an einzelnen Teilchen gemessen', 'measured for single particles'),
        gap: (n) => tr('≈ ' + n + ' Größenordnungen darüber – pro Teilchen', '≈ ' + n + ' orders of magnitude above – per particle'),
        second: { shift: -lg10(ev), label: 'eV' },
      };
      default: return {
        key: 'lP', unit: 'm', lo: -36, hi: 28, f: 'l_P = √(ħG/c³)', pl: tr('Planck-Länge', 'Planck length'),
        head2: tr('rund 10' + E.sup(Math.round(lg10(8.4e-16) - S.lg('lP'))) + '-mal kleiner als ein Proton', 'roughly 10' + E.sup(Math.round(lg10(8.4e-16) - S.lg('lP'))) + ' times smaller than a proton'),
        marks: [[lg10(8.4e-16), tr('Proton ≈ 0,84 fm', 'proton ≈ 0.84 fm')], [-10, tr('Atom ≈ 10⁻¹⁰ m', 'atom ≈ 10⁻¹⁰ m')], [lg10(1.7), tr('Mensch', 'human'), true],
          [lg10(1.2742e7), tr('Erde (Ø)', 'Earth (Ø)')], [lg10(8.8e26), tr('beobachtbares Universum (Ø ≈)', 'observable universe (Ø ≈)')]],
        reach: [-19, 28], reachLabel: tr('direkt vermessen (bis ≈ 10⁻¹⁹ m)', 'measured directly (down to ≈ 10⁻¹⁹ m)'),
        gap: (n) => tr('≈ ' + n + ' Größenordnungen ohne experimentellen Zugang', '≈ ' + n + ' orders of magnitude beyond experimental reach'),
      };
    }
  }
  // Text in Zeilen umbrechen, die höchstens maxW breit sind
  function wrap(ctx, s, maxW) {
    const out = [];
    let line = '';
    for (const w of s.split(' ')) {
      const t = line ? line + ' ' + w : w;
      if (line && textW(ctx, t) > maxW) { out.push(line); line = w; } else line = t;
    }
    if (line) out.push(line);
    return out;
  }
  V.scales = (ctx, W, H, S) => {
    const { col } = S;
    grid(ctx, W, H, col);
    const sc = planckScale(S, S.opts.q);
    const pl = S.lg(sc.key);
    if (!isFinite(pl)) return invalid(ctx, W, H, col, sc.f.split(' =')[0] + tr(' ist hier nicht definiert', ' is not defined here'));
    const narrow = W < 520;
    // Abstand der Zehnerpotenzen so wählen, dass die Beschriftungen nicht aneinanderstoßen
    const ppd = (W - 48) / (sc.hi - sc.lo), step = [4, 8, 12, 16, 20].find((k) => k * ppd >= 40) || 20;
    const lo = Math.floor(Math.min(sc.lo, pl - 2) / step) * step, hi = Math.ceil(Math.max(sc.hi, pl + 2) / step) * step;
    const X = (l) => map(l, lo, hi, 24, W - 24);
    const y = H * 0.58;
    // Kopf: Formel und Wert aus der Engine
    segs(ctx, [[sc.f + ' = ', col.ink2], [S.fo(sc.key) + ' ' + sc.unit, col.accent]], 16, 22, col, { mono: true, size: narrow ? 12 : 13 });
    font(ctx, col, 11);
    wrap(ctx, sc.head2, W - 32).slice(0, 2).forEach((s, i) => label(ctx, s, 16, 39 + i * 13, col, { size: 11, color: col.ink2 }));
    // Achse, Zehnerpotenzen und – bei Temperatur und Energie – eine zweite Einheit darunter
    ctx.strokeStyle = col.ink3; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(lo), y); ctx.lineTo(X(hi), y); ctx.stroke();
    for (let k = lo; k <= hi; k += step) {
      ctx.beginPath(); ctx.moveTo(X(k), y - 4); ctx.lineTo(X(k), y + 4); ctx.stroke();
      label(ctx, '10' + E.sup(k), X(k), y + 17, col, { align: 'center', size: 10, mono: true, color: col.ink3 });
    }
    const sec = sc.second && isFinite(sc.second.shift) ? sc.second : null;
    if (sec) {
      for (let j = Math.ceil((lo + sec.shift) / step) * step; j - sec.shift <= hi; j += step) {
        const x = X(j - sec.shift);
        ctx.strokeStyle = col.cyan; ctx.beginPath(); ctx.moveTo(x, y + 20); ctx.lineTo(x, y + 24); ctx.stroke();
        label(ctx, '10' + E.sup(j), x, y + 34, col, { align: 'center', size: 10, mono: true, color: col.cyan });
      }
      label(ctx, sec.label, 16, y + 48, col, { size: 10, color: col.cyan });
    }
    // Bereiche: erreicht/gemessen (cyan) und die Lücke bis zum Planck-Wert (rot)
    const [ra, rb] = sc.reach;
    ctx.fillStyle = col.cyan; ctx.globalAlpha = 0.12; ctx.fillRect(X(ra), y - 12, X(rb) - X(ra), 24); ctx.globalAlpha = 1;
    font(ctx, col, 11);
    const cw = textW(ctx, sc.reachLabel);
    label(ctx, sc.reachLabel, clamp((X(ra) + X(rb)) / 2 - cw / 2, 8, W - 8 - cw), y - 58, col, { size: 11, color: col.cyan });
    const edge = pl < ra ? ra : pl > rb ? rb : null;
    if (edge !== null) {
      const a = Math.min(pl, edge), b = Math.max(pl, edge);
      ctx.fillStyle = col.red; ctx.globalAlpha = 0.1; ctx.fillRect(X(a), y - 12, X(b) - X(a), 24); ctx.globalAlpha = 1;
      const gl = sc.gap(Math.round(b - a));
      const gw = textW(ctx, gl);
      label(ctx, gl, clamp((X(a) + X(b)) / 2 - gw / 2, 8, W - 8 - gw), y - 76, col, { size: 11, color: col.red });
    }
    // Marken: erst der Planck-Wert, dann die Vergleichswerte; Beschriftungen weichen einander aus
    const used = { up: [[], []], down: [[], []] };
    const place = (x, w, sides) => {
      for (const tier of [0, 1]) for (const side of sides) {
        const x0 = clamp(x - w / 2, 4, W - 4 - w);
        if (used[side][tier].every(([a, b]) => x0 + w + 8 < a || x0 > b + 8)) { used[side][tier].push([x0, x0 + w]); return { side, tier, x0 }; }
      }
      const x0 = clamp(x - w / 2, 4, W - 4 - w);
      return { side: sides[0], tier: 1, x0 };
    };
    const downY = y + (sec ? 64 : 36);
    const mark = (l, s, c, size, sides) => {
      const x = X(l);
      font(ctx, col, size);
      const p = place(x, textW(ctx, s), sides);
      const ly = p.side === 'up' ? y - 22 - p.tier * 14 : downY + p.tier * 14;
      ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, p.side === 'up' ? ly + 3 : ly - 11); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, size > 11 ? 5 : 3.5, 0, Math.PI * 2); ctx.fill();
      label(ctx, s, p.x0, ly, col, { size, color: c });
    };
    mark(pl, sc.pl, col.accent, 12, ['up']);
    sc.marks.filter((m) => isFinite(m[0]) && m[0] >= lo && m[0] <= hi && !(narrow && m[2])).forEach(([l, s]) => mark(l, s, col.ink, 11, ['up', 'down']));
    note(ctx, tr('Zehnerpotenzen in ' + sc.unit + ' · Vergleichswerte gerundet', 'Powers of ten in ' + sc.unit + ' · reference values rounded'), W, H, col);
  };

  PP.viz = V;
})(globalThis.PP = globalThis.PP || {});
