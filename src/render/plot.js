/* =====================================================================
   Physics Playground — Plot (canvas). Works in transformed coordinates:
   a log axis uses log10 values directly (from the engine's {s,l}),
   so curves beyond the double range still render.
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine, tr = PP.i18n.T;
  const escH = (x) => String(x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Schraffur eines Bereichs; pat wählt die Richtung, damit angrenzende Gründe unterscheidbar bleiben
  function hatch(ctx, za, zb, top, h, pat, step = 9) {
    ctx.beginPath();
    if (pat % 3 === 2) { for (let x = za + 3; x < zb; x += step - 2) { ctx.moveTo(x, top); ctx.lineTo(x, top + h); } }
    else {
      const dir = pat % 3 === 0 ? 1 : -1;
      for (let x = za - h; x < zb + h; x += step) {
        const x0 = x, x1 = x + h * dir;
        // Strecke (x0, top+h) → (x1, top), auf [za, zb] geschnitten
        const t0 = Math.max(0, Math.min(1, (za - x0) / (x1 - x0))), t1 = Math.max(0, Math.min(1, (zb - x0) / (x1 - x0)));
        const ta = Math.min(t0, t1), tb = Math.max(t0, t1);
        if (tb <= ta) continue;
        ctx.moveTo(x0 + (x1 - x0) * ta, top + h - h * ta); ctx.lineTo(x0 + (x1 - x0) * tb, top + h - h * tb);
      }
    }
    ctx.stroke();
  }

  function niceStep(span, target) {
    const raw = span / Math.max(1, target);
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / p;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  }
  function ticks(a, b, target, isLog) {
    const span = b - a;
    if (!(span > 0) || !isFinite(span)) return [];
    let step = niceStep(span, target);
    if (isLog && span > 2) step = Math.max(1, Math.round(step));
    const out = [];
    for (let v = Math.ceil(a / step) * step; v <= b + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
    return out;
  }
  function tickLabel(v, isLog, step) {
    if (isLog) {
      if (Math.abs(v - Math.round(v)) < 1e-9) {
        const k = Math.round(v);
        if (k === 0) return '1';
        if (k === 1) return '10';
        return '10' + E.sup(k);
      }
      return E.fmt(E.mk(10 ** v), 2).replace(' × ', '×');
    }
    const a = Math.abs(v);
    if (v === 0) return '0';
    if (a >= 1e5 || a < 1e-3) return E.fmt(v, 2).replace(' × ', '×');
    const dec = Math.max(0, -Math.floor(Math.log10(step || 1)));
    return Number(v.toFixed(Math.min(dec, 6))).toString().replace('-', '−');
  }

  class Plot {
    constructor(canvas, tip) {
      this.c = canvas; this.tip = tip;
      this.ctx = canvas.getContext ? canvas.getContext('2d') : null;
      this.cfg = null; this.view = null; this.hover = null;
      this.drag = null;
      this.onZoom = null;
      this._bind();
    }
    _bind() {
      const c = this.c;
      if (!c.addEventListener) return;
      c.addEventListener('wheel', (e) => {
        if (!this.cfg) return;
        e.preventDefault();
        const r = c.getBoundingClientRect();
        this.zoomAt((e.clientX - r.left) , e.deltaY > 0 ? 1.25 : 0.8);
      }, { passive: false });
      c.addEventListener('pointerdown', (e) => {
        if (!this.cfg) return;
        this.drag = { x: e.clientX, v: this.curView() };
        try { c.setPointerCapture(e.pointerId); } catch (_) { /* ohne Pointer-Capture geht Ziehen trotzdem */ }
      });
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        if (this.drag && this.cfg) {
          const dxPx = e.clientX - this.drag.x;
          if (Math.abs(dxPx) > 2) {
            const [a, b] = this.drag.v;
            const d = (dxPx / this.pw) * (b - a);
            this.hover = null;
            this.setView([a - d, b - d]);
            return;
          }
        }
        this.hover = e.clientX - r.left;
        this.draw();
      });
      const end = () => { this.drag = null; };
      c.addEventListener('pointerup', end);
      c.addEventListener('pointercancel', end);
      c.addEventListener('pointerleave', () => { this.hover = null; this.draw(); });
      c.addEventListener('dblclick', () => this.reset());
    }
    // Ansicht: vom Nutzer gezoomt, sonst der Standardbereich (view0), sonst der ganze Bereich
    curView() { return this.view || this.cfg.view0T || this.cfg.xdomT; }
    zoomAt(px, f) {
      const [a, b] = this.curView();
      const x = a + ((px - this.pl) / this.pw) * (b - a);
      this.setView([x - (x - a) * f, x + (b - x) * f]);
    }
    setView(v, silent) {
      this.view = v;
      this.draw();
      if (!silent && this.onView) this.onView(v);
    }
    zoom(f) { this.zoomAt(this.pl + this.pw / 2, f); }
    reset(silent) { this.setView(null, silent); }
    set(cfg) {
      const keepView = this.cfg && cfg && this.cfg.key === cfg.key;
      this.cfg = cfg;
      if (!keepView) this.view = null;
      const tx = (d) => (cfg.xlog ? [Math.log10(d[0]), Math.log10(d[1])] : d.slice());
      if (cfg) { cfg.xdomT = tx(cfg.xdom); cfg.view0T = cfg.view0 ? tx(cfg.view0) : null; }
      this.draw();
    }
    toT(num, isLog) {
      if (!num) return null;
      if (isLog) return num.s > 0 ? num.l : null;
      const d = E.toDouble(num);
      return isFinite(d) ? d : null;
    }
    sample() {
      const cfg = this.cfg;
      const [a, b] = this.curView();
      const n = cfg.samples || 320;
      const ck = cfg.sampleKey != null ? cfg.key + '|' + cfg.sampleKey + '|' + a + '|' + b : null;
      if (ck && ck === this._sk) return this._ss;
      const series = cfg.series.map((s) => {
        const pts = [];
        for (let i = 0; i <= n; i++) {
          let xt = a + ((b - a) * i) / n;
          if (s.integer) xt = cfg.xlog ? xt : Math.round(xt);
          const x = cfg.xlog ? Math.pow(10, xt) : xt;
          let y = null;
          try { y = this.toT(s.fn(x), cfg.ylog); } catch (_) { y = null; }
          pts.push([xt, y]);
        }
        return Object.assign({}, s, { pts });
      });
      this._sk = ck; this._ss = series;
      return series;
    }
    draw() {
      const ctx = this.ctx, cfg = this.cfg;
      if (!ctx) return;
      const dpr = (globalThis.devicePixelRatio || 1);
      const W = this.c.clientWidth || 600, H = this.c.clientHeight || 300;
      if (this.c.width !== Math.round(W * dpr) || this.c.height !== Math.round(H * dpr)) {
        this.c.width = Math.round(W * dpr); this.c.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const col = PP.colors();
      if (!cfg) return;
      const series = this.sample();
      const [x0, x1] = this.curView();
      let ymin = Infinity, ymax = -Infinity;
      for (const s of series) for (const [, y] of s.pts) if (y !== null) { if (y < ymin) ymin = y; if (y > ymax) ymax = y; }
      const refs = (cfg.refs || []).map((r) => Object.assign({}, r, { t: this.toT(E.mk(r.value), cfg.ylog) })).filter((r) => r.t !== null);
      const marker = cfg.marker ? { x: cfg.xlog ? (cfg.marker.x > 0 ? Math.log10(cfg.marker.x) : null) : cfg.marker.x, y: this.toT(cfg.marker.y, cfg.ylog) } : null;
      for (const r of refs) { if (r.t < ymin || r.t > ymax) { if (isFinite(ymin)) { ymin = Math.min(ymin, r.t); ymax = Math.max(ymax, r.t); } } }
      const empty = !isFinite(ymin);
      if (empty) { ymin = 0; ymax = 1; }
      if (ymax - ymin < (cfg.ylog ? 1e-9 : Math.abs(ymax) * 1e-12 + 1e-300)) { const m = cfg.ylog ? 0.5 : Math.abs(ymax) * 0.5 || 1; ymin -= m; ymax += m; }
      const pad = (ymax - ymin) * 0.07;
      ymin -= pad; ymax += pad;

      ctx.font = '11px ' + col.mono;
      const yt = ticks(ymin, ymax, Math.max(3, Math.floor(H / 55)), cfg.ylog);
      const ystep = yt.length > 1 ? yt[1] - yt[0] : 1;
      const ylabels = yt.map((v) => tickLabel(v, cfg.ylog, ystep));
      const lw = Math.max(34, ...ylabels.map((s) => ctx.measureText(s).width)) + 12;
      const pl = (this.pl = lw + 24), pr = 14, pt = 14, pb = 44;
      const pw = (this.pw = Math.max(10, W - pl - pr)), ph = Math.max(10, H - pt - pb);
      const X = (x) => pl + ((x - x0) / (x1 - x0)) * pw;
      const Y = (y) => pt + ph - ((y - ymin) / (ymax - ymin)) * ph;

      // grid
      ctx.strokeStyle = col.grid; ctx.lineWidth = 1; ctx.fillStyle = col.ink3;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      yt.forEach((v, i) => { const y = Math.round(Y(v)) + 0.5; ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(pl + pw, y); ctx.stroke(); ctx.fillText(ylabels[i], pl - 8, y); });
      const xt = ticks(x0, x1, Math.max(3, Math.floor(pw / 90)), cfg.xlog);
      const xstep = xt.length > 1 ? xt[1] - xt[0] : 1;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      xt.forEach((v) => {
        const x = Math.round(X(v)) + 0.5, s = tickLabel(v, cfg.xlog, xstep);
        ctx.beginPath(); ctx.moveTo(x, pt); ctx.lineTo(x, pt + ph); ctx.stroke();
        // am rechten Rand nicht abschneiden
        const w = ctx.measureText(s).width;
        ctx.fillText(s, Math.min(x, W - 2 - w / 2), pt + ph + 6);
      });
      ctx.strokeStyle = col.ink3; ctx.strokeRect(pl + 0.5, pt + 0.5, pw, ph);
      // zero line
      if (!cfg.ylog && ymin < 0 && ymax > 0) { ctx.strokeStyle = col.ink3; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(pl, Y(0)); ctx.lineTo(pl + pw, Y(0)); ctx.stroke(); ctx.setLineDash([]); }
      // axis titles
      ctx.fillStyle = col.ink2; ctx.font = '12px ' + col.sans;
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText(cfg.xlabel + (cfg.xlog ? '  (log)' : ''), pl + pw, H - 4);
      ctx.save(); ctx.translate(12, pt); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      ctx.fillText(cfg.ylabel + (cfg.ylog ? '  (log)' : ''), 0, 0); ctx.restore();

      ctx.save();
      ctx.beginPath(); ctx.rect(pl, pt, pw, ph); ctx.clip();
      // Modellgrenzen: schraffierte Bereiche, in denen die Engine eine Warnung meldet
      const zones = (cfg.zones || []).filter((z) => z.b > x0 && z.a < x1);
      zones.forEach((z) => {
        const za = Math.max(pl, X(z.a)), zb = Math.min(pl + pw, X(z.b));
        // Grund betrifft nur einzelne Kurven: schmaler Streifen am unteren Rand, die Kurven selbst werden gestrichelt
        const top = z.part ? pt + ph - 8 : pt, hh = z.part ? 8 : ph;
        ctx.fillStyle = z.color; ctx.globalAlpha = z.part ? 0.18 : 0.07; ctx.fillRect(za, top, zb - za, hh);
        ctx.globalAlpha = z.part ? 0.7 : 0.3; ctx.strokeStyle = z.color; ctx.lineWidth = 1;
        hatch(ctx, za, zb, top, hh, z.pat || 0, z.part ? 5 : 9);
        // Grenzlinie, wo der Bereich beginnt bzw. endet
        ctx.globalAlpha = 0.6; ctx.setLineDash([3, 3]); ctx.beginPath();
        if (X(z.a) > pl + 1) { ctx.moveTo(Math.round(za) + 0.5, pt); ctx.lineTo(Math.round(za) + 0.5, pt + ph); }
        if (X(z.b) < pl + pw - 1) { ctx.moveTo(Math.round(zb) + 0.5, pt); ctx.lineTo(Math.round(zb) + 0.5, pt + ph); }
        ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      });
      // refs
      refs.forEach((r) => {
        ctx.strokeStyle = r.color || col.ink3; ctx.setLineDash([6, 4]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pl, Y(r.t)); ctx.lineTo(pl + pw, Y(r.t)); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = col.ink2; ctx.font = '11px ' + col.sans; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
        ctx.fillText(r.label, pl + 6, Y(r.t) - 3);
      });
      // curves
      const curve = (s) => {
        ctx.beginPath();
        let pen = false;
        for (const [x, y] of s.pts) {
          if (y === null) { pen = false; continue; }
          const py = Math.max(-1e4, Math.min(1e4, Y(y)));
          if (!pen) { ctx.moveTo(X(x), py); pen = true; } else ctx.lineTo(X(x), py);
        }
        ctx.stroke();
      };
      for (const s of series) {
        ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2;
        const own = zones.filter((z) => z.part && s.key && z.keys && z.keys.includes(s.key));
        if (!own.length) { ctx.setLineDash(s.dash || []); curve(s); ctx.setLineDash([]); continue; }
        // außerhalb der eigenen Grenzen durchgezogen, innerhalb gestrichelt und blasser
        const rects = (c) => own.forEach((z) => { const za = Math.max(pl, X(z.a)), zb = Math.min(pl + pw, X(z.b)); if (zb > za) c.rect(za, pt - 2, zb - za, ph + 4); });
        ctx.save(); ctx.beginPath(); ctx.rect(pl, pt - 2, pw, ph + 4); rects(ctx); ctx.clip('evenodd');
        ctx.setLineDash(s.dash || []); curve(s); ctx.restore();
        ctx.save(); ctx.beginPath(); rects(ctx); ctx.clip();
        ctx.setLineDash([5, 4]); ctx.globalAlpha = 0.75; curve(s); ctx.restore();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
      // current marker
      if (marker && marker.x !== null && marker.y !== null) {
        ctx.fillStyle = col.accent; ctx.strokeStyle = col.bg; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(X(marker.x), Y(marker.y), 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
      // Legende der schraffierten Bereiche
      // Legende: Muster und Grund je schraffiertem Bereich, auf einem Hintergrund, damit Kurven sie nicht verdecken
      const zl = [...new Map(zones.map((z) => [z.label, z])).values()];
      if (zl.length) {
        ctx.font = '12px ' + col.sans; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        const lines = zl.map((z) => z.legend || tr('schraffiert: ', 'hatched: ') + z.label);
        const w = Math.min(pw - 12, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 30), lh = 17;
        const bx = pl + pw - 6 - w, by = pt + 6;
        ctx.fillStyle = col.panel; ctx.globalAlpha = 0.88; ctx.fillRect(bx, by, w, zl.length * lh + 4); ctx.globalAlpha = 1;
        zl.forEach((z, i) => {
          const y = by + 2 + i * lh;
          ctx.save(); ctx.beginPath(); ctx.rect(bx + 5, y + 3, 14, lh - 6); ctx.clip();
          ctx.fillStyle = z.color; ctx.globalAlpha = 0.15; ctx.fillRect(bx + 5, y + 3, 14, lh - 6);
          ctx.globalAlpha = 0.9; ctx.strokeStyle = z.color; ctx.lineWidth = 1; hatch(ctx, bx + 5, bx + 19, y + 3, lh - 6, z.pat || 0, 4);
          ctx.restore();
          ctx.fillStyle = z.color; ctx.fillText(lines[i], bx + 24, y + lh / 2, w - 28);
        });
      }
      if (empty) {
        ctx.fillStyle = col.ink2; ctx.font = '13px ' + col.sans; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(cfg.ylog ? tr('Keine positiven Werte – auf lineare y-Achse umschalten', 'No positive values – switch to a linear y axis') : tr('Keine darstellbaren Werte in diesem Bereich', 'No values that can be shown in this range'), pl + pw / 2, pt + ph / 2);
      }

      // hover
      const tip = this.tip;
      if (this.hover !== null && this.hover >= pl && this.hover <= pl + pw && !empty) {
        const xt_ = x0 + ((this.hover - pl) / pw) * (x1 - x0);
        ctx.strokeStyle = col.ink3; ctx.beginPath(); ctx.moveTo(this.hover + 0.5, pt); ctx.lineTo(this.hover + 0.5, pt + ph); ctx.stroke();
        const lines = [];
        const xv = cfg.xlog ? Math.pow(10, xt_) : xt_;
        lines.push(cfg.xsym + ' = ' + E.fmt(E.mk(xv), 4) + ' ' + (cfg.xunit || ''));
        // Grund der Schraffur an dieser Stelle
        zones.filter((z) => xt_ >= z.a && xt_ <= z.b).forEach((z) => lines.push('<b style="color:' + z.color + '">▨ ' + escH(z.label) + '</b>' + (z.catLabel ? ' <span style="opacity:.7">(' + escH(z.catLabel) + ')</span>' : '')));
        for (const s of series) {
          const i = Math.round(((xt_ - x0) / (x1 - x0)) * (s.pts.length - 1));
          const p = s.pts[Math.max(0, Math.min(s.pts.length - 1, i))];
          if (!p || p[1] === null) continue;
          const num = cfg.ylog ? { s: 1, l: p[1] } : E.mk(p[1]);
          lines.push('<i style="background:' + s.color + '"></i>' + s.label + ' = ' + E.fmt(num, 4) + ' ' + (cfg.yunit || ''));
          ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 3.5, 0, Math.PI * 2); ctx.fill();
        }
        if (tip) {
          tip.innerHTML = lines.join('<br>');
          tip.hidden = false;
          const left = this.hover + 14 + 220 > W ? this.hover - 14 - Math.min(260, tip.offsetWidth || 200) : this.hover + 14;
          tip.style.left = Math.max(4, left) + 'px';
          tip.style.top = pt + 8 + 'px';
        }
      } else if (tip) tip.hidden = true;
    }
  }
  PP.Plot = Plot;
})(globalThis.PP = globalThis.PP || {});
