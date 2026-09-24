/* =====================================================================
   Physics Playground — Visualizations (canvas 2D)
   draw(ctx, W, H, S) with S = { v, o(key)→double (clamped to the double range),
   fo(key, abs)→exact formatted string, col, t (anim seconds), opts }
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const map = (x, a, b, c, d) => lerp(c, d, clamp((x - a) / (b - a), 0, 1));
  const f3 = (x) => E.fmt(x, 3);

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
  function label(ctx, s, x, y, col, opts = {}) {
    ctx.font = (opts.size || 12) + 'px ' + (opts.mono ? col.mono : col.sans);
    ctx.fillStyle = opts.color || col.ink2;
    ctx.textAlign = opts.align || 'left';
    ctx.textBaseline = opts.base || 'alphabetic';
    ctx.fillText(s, x, y);
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

  const V = {};

  V.gravity = (ctx, W, H, S) => {
    const { v, o, col } = S;
    grid(ctx, W, H, col);
    const F = o('F');
    const cy = H * 0.46;
    const rad = (m) => (m > 0 ? map(Math.log10(m), -3, 42, 7, Math.min(46, H * 0.17)) : 8);
    const r1 = rad(v.m1), r2 = rad(v.m2);
    const sep = v.r > 0 ? map(Math.log10(v.r), -6, 14, W * 0.2, W * 0.64) : 0;
    const gap = Math.max(sep, r1 + r2 + 24);
    const x1 = W / 2 - gap / 2, x2 = W / 2 + gap / 2;
    [[x1, r1, v.m1, 'm₁'], [x2, r2, v.m2, 'm₂']].forEach(([x, r, m, name]) => {
      const g = ctx.createRadialGradient(x - r * 0.35, cy - r * 0.35, r * 0.1, x, cy, r);
      g.addColorStop(0, col.ink); g.addColorStop(1, col.ink3);
      ctx.fillStyle = m > 0 ? g : 'transparent';
      ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2); ctx.fill();
      if (!(m > 0)) { ctx.setLineDash([3, 3]); ctx.strokeStyle = col.red; ctx.stroke(); ctx.setLineDash([]); }
      label(ctx, name + ' = ' + f3(m) + ' kg', x, cy + Math.max(r1, r2) + 22, col, { align: 'center', mono: true, size: 12, color: col.ink });
    });
    // distance bracket
    const by = cy + Math.max(r1, r2) + 44;
    ctx.strokeStyle = col.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, by - 5); ctx.lineTo(x1, by + 5); ctx.moveTo(x2, by - 5); ctx.lineTo(x2, by + 5); ctx.moveTo(x1, by); ctx.lineTo(x2, by); ctx.stroke();
    label(ctx, 'r = ' + f3(v.r) + ' m', (x1 + x2) / 2, by + 18, col, { align: 'center', mono: true, color: col.ink });
    // force arrows
    if (isFinite(F) && F !== 0) {
      const len = map(Math.log10(Math.abs(F)), -40, 60, 12, Math.min(W * 0.2, gap / 2 - 6));
      const dir = F > 0 ? 1 : -1; // negative G → repulsion
      const c = F > 0 ? col.accent : col.red;
      if (dir > 0) {
        arrow(ctx, x1 + r1 + 4, cy, x1 + r1 + 4 + len, cy, c, 2.5, 10);
        arrow(ctx, x2 - r2 - 4, cy, x2 - r2 - 4 - len, cy, c, 2.5, 10);
      } else {
        arrow(ctx, x1 - r1 - 4, cy, x1 - r1 - 4 - len, cy, c, 2.5, 10);
        arrow(ctx, x2 + r2 + 4, cy, x2 + r2 + 4 + len, cy, c, 2.5, 10);
      }
      label(ctx, 'F = ' + (S.fo ? S.fo('F', true) : f3(Math.abs(F))) + ' N' + (dir < 0 ? '  (abstoßend)' : ''), W / 2, cy - Math.max(r1, r2) - 18, col, { align: 'center', mono: true, color: c, size: 13 });
    } else if (!isFinite(F)) {
      invalid(ctx, W, H * 0.25, col, 'F ist hier nicht definiert');
    }
    note(ctx, 'Nicht maßstäblich: Größen und Abstand logarithmisch, Pfeillänge ~ log F', W, H, col);
  };

  V.kinematics = (ctx, W, H, S) => {
    const { v, o, col } = S;
    grid(ctx, W, H, col);
    const tmax = Math.max(v.t, 1) * 1.15;
    const sAt = (t) => v.s0 + v.v0 * t + 0.5 * v.a * t * t;
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i <= 60; i++) { const s = sAt((tmax * i) / 60); lo = Math.min(lo, s); hi = Math.max(hi, s); }
    if (!isFinite(lo) || !isFinite(hi)) return invalid(ctx, W, H, col, 'Werte nicht darstellbar');
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
    const vmax = Math.max(Math.abs(v.v0), Math.abs(v.v0 + v.a * tmax), 1e-9);
    const vl = (vel / vmax) * W * 0.18;
    arrow(ctx, bx, ty - 34, bx + vl, ty - 34, col.cyan, 2.5);
    if (v.a !== 0) arrow(ctx, bx, ty - 48, bx + Math.sign(v.a) * 26, ty - 48, col.accent, 2, 7);
    label(ctx, 'v', bx + vl + (vl >= 0 ? 6 : -14), ty - 30, col, { color: col.cyan });
    label(ctx, 't = ' + E.fmt(v.t, 3) + ' s    s = ' + f3(s) + ' m    v = ' + f3(vel) + ' m/s', 16, 24, col, { mono: true, color: col.ink });
    label(ctx, 'Punkte: Position zu jeder vollen Sekunde', 16, 42, col, { size: 11, color: col.ink3 });
  };

  V.freefall = (ctx, W, H, S) => {
    const { v, o, col } = S;
    grid(ctx, W, H, col);
    const ground = H - 34, top = 28;
    const hmax = Math.max(v.h0, 1e-9);
    const Y = (h) => ground - (clamp(h, 0, hmax) / hmax) * (ground - top);
    ctx.fillStyle = col.panel2; ctx.fillRect(0, ground, W, H - ground);
    ctx.strokeStyle = col.ink3; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(W, ground); ctx.stroke();
    // ruler
    const rx = 56;
    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(rx, top); ctx.lineTo(rx, ground); ctx.stroke();
    for (let i = 0; i <= 5; i++) {
      const h = (hmax * i) / 5;
      ctx.beginPath(); ctx.moveTo(rx - 6, Y(h)); ctx.lineTo(rx, Y(h)); ctx.stroke();
      label(ctx, E.fmt(h, 3) + ' m', rx - 10, Y(h) + 4, col, { align: 'right', size: 10, mono: true, color: col.ink3 });
    }
    const h = o('h'), tf = o('tf'), vi = o('vi');
    const landed = h < 0;
    const bx = W * 0.5;
    // ghosts
    if (isFinite(tf) && tf > 0) {
      for (let i = 0; i <= 8; i++) {
        const t = (tf * i) / 8;
        if (t > v.t) break;
        ctx.fillStyle = col.cyan; ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.arc(bx, Y(v.h0 - 0.5 * v.g * t * t), 6, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    const by = landed ? ground - 11 : Y(h) - 0;
    ctx.fillStyle = landed ? col.red : col.ink;
    ctx.beginPath(); ctx.arc(bx, Math.min(by, ground - 11), 11, 0, 7); ctx.fill();
    const vel = o('v');
    if (!landed && isFinite(vi) && vi > 0) arrow(ctx, bx + 22, by, bx + 22, by + (vel / vi) * (ground - top) * 0.35, col.cyan, 2.5);
    label(ctx, 't = ' + E.fmt(v.t, 3) + ' s', W - 16, 30, col, { align: 'right', mono: true, color: col.ink });
    label(ctx, 'h = ' + (landed ? '0 (am Boden)' : f3(h) + ' m'), W - 16, 48, col, { align: 'right', mono: true, color: landed ? col.red : col.ink });
    label(ctx, 'v = ' + f3(landed ? vi : vel) + ' m/s', W - 16, 66, col, { align: 'right', mono: true, color: col.cyan });
    if (landed) label(ctx, 'Aufschlag bei t = ' + E.fmt(tf, 3) + ' s', bx, ground + 22, col, { align: 'center', color: col.red });
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
      invalid(ctx, W, H * 0.3, col, 'Keine Schwingung: k und m müssen positiv sein');
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
    const Fnow = -v.k * x, Fmax = Math.abs(v.k * v.x) || 1;
    arrow(ctx, mx, cy - 34, mx + (Fnow / Fmax) * W * 0.16, cy - 34, col.accent, 2.5);
    label(ctx, 'F = −kx', mx, cy - 44, col, { align: 'center', color: col.accent, size: 11 });
    if (isFinite(T) && T > 0) {
      const f = T / Tdisp;
      const txt = Math.abs(f - 1) < 1e-6 ? 'Echtzeit' : f < 1 ? 'Zeitlupe: ' + E.fmt(1 / f, 3) + '× langsamer' : 'Zeitraffer: ' + E.fmt(f, 3) + '× schneller';
      label(ctx, 'T = ' + f3(T) + ' s   (' + txt + ')', 16, 24, col, { mono: true, color: col.ink });
    }
  };

  V.circular = (ctx, W, H, S) => {
    const { o, col, t } = S;
    grid(ctx, W, H, col);
    const T = o('T');
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.34;
    ctx.strokeStyle = col.ink3; ctx.setLineDash([4, 5]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = col.ink3; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill();
    if (!isFinite(T) || T <= 0) return invalid(ctx, W, H, col, 'Keine Umlaufbewegung darstellbar');
    const Tdisp = clamp(T, 2.5, 8);
    const ang = -(2 * Math.PI * t) / Tdisp;
    const px = cx + R * Math.cos(ang), py = cy + R * Math.sin(ang);
    ctx.strokeStyle = col.ink3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    label(ctx, 'r', (cx + px) / 2 + 6, (cy + py) / 2 - 6, col, { size: 12 });
    const tx = Math.sin(ang), ty = -Math.cos(ang);
    arrow(ctx, px, py, px + tx * R * 0.55, py + ty * R * 0.55, col.cyan, 2.5);
    arrow(ctx, px, py, px + (cx - px) * 0.45, py + (cy - py) * 0.45, col.accent, 2.5);
    ctx.fillStyle = col.ink; ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.fill();
    label(ctx, 'v', px + tx * R * 0.55 + 6, py + ty * R * 0.55, col, { color: col.cyan });
    label(ctx, 'a (zur Mitte)', 16, 44, col, { color: col.accent, size: 12 });
    label(ctx, 'v (tangential)', 16, 62, col, { color: col.cyan, size: 12 });
    const f = T / Tdisp;
    label(ctx, 'T = ' + f3(T) + ' s' + (Math.abs(f - 1) < 1e-6 ? '' : '   (Anzeige ' + E.fmt(f > 1 ? f : 1 / f, 3) + '× ' + (f > 1 ? 'schneller' : 'langsamer') + ')'), 16, 24, col, { mono: true, color: col.ink });
  };

  V.relativity = (ctx, W, H, S) => {
    const { v, o, col, t } = S;
    grid(ctx, W, H, col);
    const g = o('gamma');
    if (!isFinite(g)) return invalid(ctx, W, H, col, 'γ ist für |β| ≥ 1 nicht definiert');
    const L = W * 0.56, x0 = W * 0.36;
    const rowY = [H * 0.16, H * 0.34];
    label(ctx, 'Stab in Ruhe: L₀', 16, rowY[0] + 5, col, { size: 12 });
    ctx.fillStyle = col.ink2; ctx.fillRect(x0, rowY[0] - 7, L, 14);
    label(ctx, 'gemessen im Labor: L = L₀/γ', 16, rowY[1] + 5, col, { size: 12 });
    const Lc = L / g;
    const drift = ((t * 60) % (L - Math.max(Lc, 2) + 1));
    ctx.fillStyle = col.accent; ctx.fillRect(x0 + drift, rowY[1] - 7, Math.max(Lc, 1.5), 14);
    if (Lc < 3) label(ctx, '(kürzer als ein Pixel)', x0 + drift + 6, rowY[1] - 12, col, { size: 10, color: col.ink3 });
    arrow(ctx, x0 + drift + Math.max(Lc, 2) + 6, rowY[1], x0 + drift + Math.max(Lc, 2) + 40, rowY[1], col.accent, 2, 7);
    // clocks
    const cyc = H * 0.66, rC = Math.min(52, H * 0.16);
    const clocks = [[W * 0.3, 1, 'Laboruhr', col.ink], [W * 0.7, 1 / g, 'Bewegte Uhr (Eigenzeit)', col.accent]];
    clocks.forEach(([cx, rate, name, c]) => {
      ctx.strokeStyle = col.ink3; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cyc, rC, 0, 7); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * rC * 0.85, cyc + Math.sin(a) * rC * 0.85); ctx.lineTo(cx + Math.cos(a) * rC, cyc + Math.sin(a) * rC); ctx.stroke();
      }
      const ang = -Math.PI / 2 + ((t * rate) / 4) * Math.PI * 2;
      arrow(ctx, cx, cyc, cx + Math.cos(ang) * rC * 0.8, cyc + Math.sin(ang) * rC * 0.8, c, 2.5, 6);
      label(ctx, name, cx, cyc + rC + 20, col, { align: 'center', size: 12, color: c });
    });
    label(ctx, 'γ = ' + E.fmt(g, 6) + '   β = ' + E.fmt(v.beta, 8), 16, H - 14, col, { mono: true, color: col.ink });
    note(ctx, 'Gemessene, nicht gesehene Längen (Terrell-Penrose)', W, H - 14, col);
  };

  const STARS = (() => { const r = rng(7); return Array.from({ length: 90 }, () => [r(), r(), r()]); })();
  function stars(ctx, W, H, col) {
    ctx.fillStyle = col.ink3;
    for (const [x, y, s] of STARS) { ctx.globalAlpha = 0.3 + s * 0.5; ctx.fillRect(x * W, y * H, s > 0.8 ? 2 : 1, s > 0.8 ? 2 : 1); }
    ctx.globalAlpha = 1;
  }

  V.blackhole = (ctx, W, H, S) => {
    const { v, o, col, t } = S;
    stars(ctx, W, H, col);
    const T = o('TH');
    if (!isFinite(T)) return invalid(ctx, W, H, col, 'T_H ist für M ≤ 0 nicht definiert');
    const cx = W / 2, cy = H * 0.46;
    const R = map(Math.log10(Math.max(v.M, 1)), 8, 42, 14, Math.min(W, H) * 0.26);
    const lt = Math.log10(T);
    const hot = map(lt, -15, 15, 0, 1);
    // emitted quanta (schematic: count ~ hotness)
    const n = Math.round(4 + hot * 60);
    const r = rng(3);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, sp = 0.4 + r() * 0.6, off = r();
      const d = R + ((t * 40 * sp + off * 200) % (Math.min(W, H) * 0.45));
      ctx.fillStyle = hot > 0.5 ? col.accent : col.cyan;
      ctx.globalAlpha = 0.25 + hot * 0.6;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1.6, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const glow = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.6);
    glow.addColorStop(0, hot > 0.5 ? col.accent : col.cyan); glow.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.15 + hot * 0.5; ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, R * 1.6, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.strokeStyle = col.ink3; ctx.lineWidth = 1; ctx.stroke();
    label(ctx, 'T_H = ' + f3(T) + ' K', cx, cy + R + 30, col, { align: 'center', mono: true, size: 14, color: col.ink });
    const cmb = PP.model.C.T_cmb.value;
    label(ctx, T < cmb ? 'kälter als die Hintergrundstrahlung (2,7 K)' : 'heißer als die Hintergrundstrahlung (2,7 K)', cx, cy + R + 50, col, { align: 'center', size: 12, color: T < cmb ? col.cyan : col.accent });
    label(ctx, 'r_s = ' + f3(o('rs')) + ' m', 16, 24, col, { mono: true, color: col.ink2 });
    note(ctx, 'Schematisch: Größe ~ log M, Teilchenzahl ~ log T', W, H, col);
  };

  V.horizon = (ctx, W, H, S) => {
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
    label(ctx, isFinite(skb) ? 'S/k_B = A/(4 l_P²) ≈ ' + f3(skb) : 'S/k_B nicht definiert', cx, cy + R + 32, col, { align: 'center', mono: true, size: 14, color: col.ink });
    label(ctx, 'dimensionslos: eine reine Zahl', cx, cy + R + 52, col, { align: 'center', size: 12, color: col.ink2 });
    note(ctx, 'Schematisch: Jede Zelle steht für unvorstellbar viele Planck-Flächen', W, H, col);
  };

  V.spacetime = (ctx, W, H, S) => {
    const { v, o, col } = S;
    grid(ctx, W, H, col, 32);
    const K = o('K');
    const depth = isFinite(K) && K > 0 ? map(Math.log10(K), -62, 0, 0.05, 1) : 0;
    const cx = W / 2, cy = H * 0.42;
    const N = 14, span = Math.min(W * 0.9, 620);
    const P = (i, j) => {
      const x = (i / N - 0.5) * span, z = (j / N - 0.5) * span;
      const r = Math.hypot(x, z) / (span * 0.2);
      const dip = -depth * H * 0.32 / (1 + r * r);
      return [cx + x + z * 0.35, cy + z * 0.32 - dip];
    };
    ctx.strokeStyle = col.cyan; ctx.globalAlpha = 0.6; ctx.lineWidth = 1;
    for (let i = 0; i <= N; i++) {
      ctx.beginPath();
      for (let j = 0; j <= N * 2; j++) { const [x, y] = P(i, j / 2); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      ctx.beginPath();
      for (let j = 0; j <= N * 2; j++) { const [x, y] = P(j / 2, i); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const [bx, by] = P(N / 2, N / 2);
    const br = map(Math.log10(Math.max(v.u, 1e-30)), -15, 40, 4, 22);
    ctx.fillStyle = col.accent; ctx.beginPath(); ctx.arc(bx, by - br, br, 0, 7); ctx.fill();
    label(ctx, 'Geometrie: G_μν ~ L⁻²', 16, H - 36, col, { size: 12, color: col.cyan });
    label(ctx, 'Materie/Energie: (8πG/c⁴) T_μν ~ L⁻²', W - 16, H - 36, col, { size: 12, color: col.accent, align: 'right' });
    label(ctx, 'K ~ ' + f3(K) + ' m⁻²   ℓ ~ ' + f3(o('Lc')) + ' m', 16, 24, col, { mono: true, color: col.ink });
    note(ctx, 'Schematisch – keine Lösung der Feldgleichungen', W, H, col);
  };

  V.wavefunction = (ctx, W, H, S) => {
    const { v, col, t, opts } = S;
    grid(ctx, W, H, col);
    const n = Math.max(1, Math.round(v.n));
    const x0 = 40, x1 = W - 120, top = 30, bot = H - 40, mid = (top + bot) / 2;
    ctx.fillStyle = col.panel2;
    ctx.fillRect(x0 - 14, top - 10, 14, bot - top + 20); ctx.fillRect(x1, top - 10, 14, bot - top + 20);
    ctx.strokeStyle = col.ink3; ctx.beginPath(); ctx.moveTo(x0, mid); ctx.lineTo(x1, mid); ctx.stroke();
    const amp = (bot - top) * 0.38;
    const sup = opts && opts.superpos;
    const base = 3; // display period of ground-state phase, seconds
    const w = (k) => (2 * Math.PI * (k * k)) / (base * n * n);
    const psi = (xi) => {
      const s1 = Math.sin(n * Math.PI * xi);
      if (!sup) return [s1 * Math.cos(w(n) * t), -s1 * Math.sin(w(n) * t)];
      const s2 = Math.sin((n + 1) * Math.PI * xi);
      const k = Math.SQRT1_2;
      return [k * (s1 * Math.cos(w(n) * t) + s2 * Math.cos(w(n + 1) * t)), -k * (s1 * Math.sin(w(n) * t) + s2 * Math.sin(w(n + 1) * t))];
    };
    const M = 240;
    // |ψ|²
    ctx.beginPath(); ctx.moveTo(x0, mid);
    for (let i = 0; i <= M; i++) { const xi = i / M; const [re, im] = psi(xi); ctx.lineTo(lerp(x0, x1, xi), mid - (re * re + im * im) * amp * (sup ? 0.5 : 1)); }
    ctx.lineTo(x1, mid); ctx.closePath();
    ctx.fillStyle = col.accent; ctx.globalAlpha = 0.28; ctx.fill(); ctx.globalAlpha = 1;
    const curve = (idx, c, wdt) => {
      ctx.strokeStyle = c; ctx.lineWidth = wdt; ctx.beginPath();
      for (let i = 0; i <= M; i++) { const xi = i / M; const y = mid - psi(xi)[idx] * amp * (sup ? 0.7 : 1); i ? ctx.lineTo(lerp(x0, x1, xi), y) : ctx.moveTo(lerp(x0, x1, xi), y); }
      ctx.stroke();
    };
    curve(0, col.cyan, 2); curve(1, col.red, 1.2);
    label(ctx, '|ψ|²', 16, 22, col, { color: col.accent }); label(ctx, 'Re ψ', 60, 22, col, { color: col.cyan }); label(ctx, 'Im ψ', 112, 22, col, { color: col.red });
    label(ctx, '0', x0, bot + 18, col, { align: 'center', size: 11 }); label(ctx, 'L', x1, bot + 18, col, { align: 'center', size: 11 });
    // level ladder
    const lx = W - 70, kmax = Math.max(5, n + 2);
    const LY = (k) => bot - ((k * k) / (kmax * kmax)) * (bot - top);
    ctx.strokeStyle = col.ink3; ctx.beginPath(); ctx.moveTo(lx - 20, bot); ctx.lineTo(lx - 20, top); ctx.stroke();
    for (let k = 1; k <= kmax; k++) {
      const on = k === n || (sup && k === n + 1);
      ctx.strokeStyle = on ? col.accent : col.ink3; ctx.lineWidth = on ? 2.5 : 1;
      ctx.beginPath(); ctx.moveTo(lx - 14, LY(k)); ctx.lineTo(lx + 20, LY(k)); ctx.stroke();
      if (k <= 6 || on) label(ctx, 'n=' + k, lx + 24, LY(k) + 4, col, { size: 10, color: on ? col.accent : col.ink3 });
    }
    label(ctx, 'E ∝ n²', lx - 20, top - 12, col, { size: 11, align: 'center' });
    note(ctx, sup ? 'Überlagerung: |ψ|² schwappt hin und her' : 'Einzelzustand: |ψ|² bleibt konstant, nur die Phase dreht sich', W - 120, H, col);
  };

  V.scales = (ctx, W, H, S) => {
    const { o, col } = S;
    grid(ctx, W, H, col);
    const lo = -36, hi = 28, y = H * 0.52;
    const X = (l) => map(l, lo, hi, 24, W - 24);
    ctx.strokeStyle = col.ink3; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(lo), y); ctx.lineTo(X(hi), y); ctx.stroke();
    for (let k = lo; k <= hi; k += 4) { ctx.beginPath(); ctx.moveTo(X(k), y - 4); ctx.lineTo(X(k), y + 4); ctx.stroke(); label(ctx, '10' + E.sup(k), X(k), y + 36, col, { align: 'center', size: 10, mono: true, color: col.ink3 }); }
    // experimentally accessible band (≈ down to 1e-19 m)
    ctx.fillStyle = col.cyan; ctx.globalAlpha = 0.12; ctx.fillRect(X(-19), y - 14, X(hi) - X(-19), 28); ctx.globalAlpha = 1;
    ctx.fillStyle = col.red; ctx.globalAlpha = 0.08; ctx.fillRect(X(Math.log10(o('lP'))), y - 14, X(-19) - X(Math.log10(o('lP'))), 28); ctx.globalAlpha = 1;
    label(ctx, '≈ 16 Größenordnungen ohne experimentellen Zugang', X(Math.log10(o('lP'))), y - 84, col, { align: 'left', size: 11, color: col.red });
    label(ctx, 'direkt vermessen (bis ≈ 10⁻¹⁹ m)', Math.min(X(-19), W - 200), y - 64, col, { align: 'left', size: 11, color: col.cyan });
    const marks = [
      [Math.log10(o('lP')), 'Planck-Länge', col.accent],
      [Math.log10(8.4e-16), 'Proton ≈ 0,84 fm', col.ink],
      [-10, 'Atom ≈ 10⁻¹⁰ m', col.ink],
      [Math.log10(1.7), 'Mensch', col.ink],
      [Math.log10(1.2742e7), 'Erde (Ø)', col.ink],
      [Math.log10(8.8e26), 'beobachtbares Universum (Ø ≈)', col.ink],
    ];
    marks.forEach(([l, s, c], i) => {
      const up = i % 2 === 0;
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X(l), y, 4, 0, 7); ctx.fill();
      ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(X(l), y); ctx.lineTo(X(l), up ? y - 26 : y + 50); ctx.stroke();
      label(ctx, s, X(l), up ? y - 32 : y + 64, col, { align: i === 0 ? 'left' : i === marks.length - 1 ? 'right' : 'center', size: 11, color: c });
    });
    note(ctx, 'Logarithmische Längenskala in Metern', W, H, col);
  };

  PP.viz = V;
})(globalThis.PP = globalThis.PP || {});
