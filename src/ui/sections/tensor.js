/* =====================================================================
   Physics Playground — Grundlagen, Teil „Sprache der ART“:
   Indizes (μ, ν) mit interaktiver 4×4-Tabelle und Tensor-Aufbau mit
   Transformations-Demo (Drehung im Raum / Lorentz-Boost).
   Hängt sich hinter den Relativitäts-Abschnitt in U.theory.sections.
   ===================================================================== */
(function (PP) {
  'use strict';
  const U = PP.ui;
  const S = U.S;
  const { esc } = U;
  const R = String.raw;
  const t = (s) => U.tex(s);
  const d = (s) => '<div class="th-eq">' + U.tex(s, true) + '</div>';
  const exp = (id, label) => '<a href="#exp=' + id + '">' + esc(label) + '</a>';
  const sec = (id, label) => '<a href="#view=theorie&amp;sec=' + id + '">' + esc(label) + '</a>';

  /* ================== Widget 1: die 4×4-Tabelle ================== */
  const AX = ['t', 'x', 'y', 'z'];
  const tMeaning = (m, n) => {
    const a = AX[m], b = AX[n];
    if (m === 0 && n === 0) return '<b>Energiedichte</b> – wie viel Energie (einschließlich der Ruheenergie mc²) in einem Kubikmeter steckt. Bei gewöhnlicher Materie ist das mit großem Abstand der größte Eintrag.';
    if (m === 0 || n === 0) {
      const i = AX[m || n];
      return '<b>Energiefluss in ' + i + '-Richtung</b> (geteilt durch c) – und zugleich <b>Impulsdichte in ' + i + '-Richtung</b> (mal c). Dass beides dieselbe Zahl ist, folgt aus E = mc²: Wo Energie strömt, strömt auch Masse und damit Impuls.';
    }
    if (m === n) return '<b>Druck in ' + a + '-Richtung</b> – genauer: wie viel ' + a + '-Impuls pro Sekunde durch eine Fläche senkrecht zur ' + a + '-Achse fließt. Auch Druck krümmt die Raumzeit, nicht nur Masse.';
    return '<b>Scherspannung</b> – ' + a + '-Impuls, der in ' + b + '-Richtung fließt. Tritt etwa in zähen Flüssigkeiten oder verformten Festkörpern auf.';
  };
  const Z = '0';
  const diag = (a, b, c, e) => [[a, Z, Z, Z], [Z, b, Z, Z], [Z, Z, c, Z], [Z, Z, Z, e]];
  const PRESETS = [
    { key: 'mean', label: 'Bedeutung', sym: 'T', up: true, labels: AX,
      intro: 'Energie-Impuls-Tensor ' + t(R`T^{\mu\nu}`) + ': die rechte Seite der Feldgleichungen. Tippe eine Zelle an.',
      info: tMeaning },
    { key: 'dust', label: 'Staub', sym: 'T', up: true, labels: AX, vals: diag(R`\rho c^{2}`, Z, Z, Z),
      intro: 'Ruhende Materie ohne Druck – Staub oder, in guter Näherung, die Galaxien im großen Maßstab. Nur ein einziger Eintrag ist ungleich null.',
      info: tMeaning },
    { key: 'fluid', label: 'Ideale Flüssigkeit', sym: 'T', up: true, labels: AX, vals: diag(R`\rho c^{2}`, 'p', 'p', 'p'),
      intro: 'Sterninneres, Gas, Neutronenstern: zusätzlich Druck ' + t('p') + ' auf der Diagonalen. In der Sonne ist ' + t('p') + ' nur etwa ein Millionstel von ' + t(R`\rho c^{2}`) + ' – deshalb reicht dort fast immer Newton. In Neutronensternen nicht mehr.',
      info: tMeaning },
    { key: 'light', label: 'Lichtstrahl', sym: 'T', up: true, labels: AX, vals: [['u', 'u', Z, Z], ['u', 'u', Z, Z], [Z, Z, Z, Z], [Z, Z, Z, Z]],
      intro: 'Ein Lichtstrahl in x-Richtung mit Energiedichte ' + t('u') + ': Energie, Energiefluss und Druck in Strahlrichtung sind gleich groß. Licht trägt Impuls – darauf beruhen Sonnensegel.',
      info: tMeaning },
    { key: 'eta', label: 'Metrik flach', sym: R`\eta`, up: false, labels: AX, vals: diag('-1', '1', '1', '1'),
      intro: 'Die Minkowski-Metrik ' + t(R`\eta_{\mu\nu}`) + ': das „Lineal“ der flachen Raumzeit (Vorzeichenkonvention −,+,+,+; manche Bücher nehmen +,−,−,−).',
      info: (m, n) => m !== n ? '<b>0</b> – die Richtungen stehen senkrecht aufeinander, es gibt keine Mischterme.'
        : m === 0 ? '<b>−1</b> – dieses eine Minuszeichen macht die Zeit zur Zeit. Es sorgt dafür, dass der Abstand ' + t('ds^{2}') + ' für Licht genau null ist.'
          : '<b>+1</b> – ganz normaler Pythagoras in ' + AX[m] + '-Richtung.' },
    { key: 'schw', label: 'Metrik Schwarzes Loch', sym: 'g', up: false, labels: ['t', 'r', R`\theta`, R`\phi`],
      vals: diag(R`-\left(1-\frac{r_s}{r}\right)`, R`\left(1-\frac{r_s}{r}\right)^{-1}`, 'r^{2}', R`r^{2}\sin^{2}\theta`),
      intro: 'Die Schwarzschild-Metrik um eine kugelförmige Masse, in Kugelkoordinaten (t, r, θ, φ). Das ist gekrümmte Raumzeit – und trotzdem dieselbe Tabellenform.',
      info: (m, n) => m !== n ? '<b>0</b> – auch hier keine Mischterme; die Raumzeit ist kugelsymmetrisch und zeitlich konstant.'
        : m === 0 ? 'Wird am Horizont ' + t('r = r_s') + ' null: Von außen gesehen bleiben Uhren dort stehen – gravitative Zeitdilatation. Deshalb muss auch GPS korrigieren. ' + exp('hawking', 'Zum Schwarzen Loch')
          : m === 1 ? 'Radiale Abstände sind gedehnt: Zwischen zwei Kugelschalen liegt mehr Raum, als ihr Umfang vermuten lässt. Am Horizont divergiert der Eintrag – das liegt an den Koordinaten, nicht an der Physik dort.'
            : 'Gewöhnliche Kugelgeometrie. Weit weg (' + t(R`r \gg r_s`) + ') wird die ganze Tabelle zur flachen Minkowski-Metrik in Kugelkoordinaten.' },
  ];

  function gridHTML() {
    return '<div class="tw" id="tw-grid">' +
      '<div class="tw-presets">' + PRESETS.map((p, i) => '<button class="btn' + (i ? '' : ' on') + '" data-preset="' + p.key + '">' + esc(p.label) + '</button>').join('') + '</div>' +
      '<p class="tw-intro" id="tw-intro"></p>' +
      '<div class="tw-gridwrap"><div class="th-scroll"><table class="tw-grid" id="tw-table"></table></div>' +
      '<div class="tw-info" id="tw-info" aria-live="polite"></div></div>' +
      '<p class="faint tw-count">16 Einträge · symmetrisch · <span class="tw-key up"></span> 4 Diagonale + 6 darüber = <b>10 unabhängige</b> · <span class="tw-key lo"></span> 6 Spiegelbilder</p>' +
      '</div>';
  }
  function mountGrid(root) {
    const box = root.querySelector('#tw-grid');
    if (!box) return null;
    let preset = PRESETS[0], sel = [0, 0];
    const idx = (m, n) => preset.up ? '^{' + m + n + '}' : '_{' + m + n + '}';
    function draw() {
      const L = preset.labels;
      let h = '<thead><tr><th class="corner">' + t(R`\mu`) + ' ↓ ' + t(R`\nu`) + ' →</th>' +
        L.map((l, n) => '<th>' + n + ' ' + t('(' + l + ')') + '</th>').join('') + '</tr></thead><tbody>';
      for (let m = 0; m < 4; m++) {
        h += '<tr><th>' + m + ' ' + t('(' + L[m] + ')') + '</th>';
        for (let n = 0; n < 4; n++) {
          const v = preset.vals ? preset.vals[m][n] : null;
          const cls = [m > n ? 'lo' : 'up'];
          if (v === Z) cls.push('zero');
          if (sel[0] === m && sel[1] === n) cls.push('on');
          else if (sel[0] === n && sel[1] === m) cls.push('mir');
          h += '<td class="' + cls.join(' ') + '"><button data-m="' + m + '" data-n="' + n + '" aria-label="Komponente ' + m + n + '">' +
            '<span class="tw-sym' + (v === null ? ' big' : '') + '">' + t(preset.sym + idx(m, n)) + '</span>' + (v !== null ? '<span class="tw-val">' + t(v) + '</span>' : '') + '</button></td>';
        }
        h += '</tr>';
      }
      box.querySelector('#tw-table').innerHTML = h + '</tbody>';
      box.querySelector('#tw-intro').innerHTML = preset.intro;
      const [m, n] = sel;
      let info = '<div class="tw-info-h">' + t(preset.sym + idx(m, n)) + (preset.vals ? ' ' + t('= ' + preset.vals[m][n]) : '') + '</div>' + preset.info(m, n);
      if (m !== n) info += '<div class="faint" style="margin-top:8px;font-size:12.5px">Spiegelpartner ' + t(preset.sym + idx(n, m)) + ' hat wegen der Symmetrie denselben Wert.</div>';
      box.querySelector('#tw-info').innerHTML = info;
    }
    box.addEventListener('click', (e) => {
      const p = e.target.closest('[data-preset]');
      if (p) {
        preset = PRESETS.find((x) => x.key === p.getAttribute('data-preset'));
        box.querySelectorAll('[data-preset]').forEach((b) => b.classList.toggle('on', b === p));
        sel = [0, 0];
        draw();
        return;
      }
      const c = e.target.closest('[data-m]');
      if (c) { sel = [+c.getAttribute('data-m'), +c.getAttribute('data-n')]; draw(); }
    });
    draw();
    return null;
  }

  /* ============ Widget 2: Transformation (Drehung / Boost) ============ */
  const V = { x: 3, y: 2 };          // fester Pfeil im Raum
  const EV = { ct: 2.5, x: 1 };      // festes Ereignis in der Raumzeit
  function xformHTML() {
    return '<div class="tw" id="tw-x">' +
      '<div class="tw-ctrl"><div class="seg" role="tablist"><button class="on" data-mode="rot">Drehung im Raum</button><button data-mode="boost">Boost in der Raumzeit</button></div>' +
      '<button class="btn" id="tw-play"></button></div>' +
      '<canvas class="tw-canvas" id="tw-cv" role="img" aria-label="Koordinatentransformation"></canvas>' +
      '<div class="tw-ctrl"><label class="tw-sl"><span id="tw-sl-l"></span><input type="range" id="tw-sl" min="0" max="1000" step="1"></label></div>' +
      '<div class="tw-read" id="tw-read"></div></div>';
  }
  function mountXform(root) {
    const box = root.querySelector('#tw-x');
    if (!box) return null;
    const cv = box.querySelector('#tw-cv'), sl = box.querySelector('#tw-sl'), play = box.querySelector('#tw-play');
    const st = { mode: 'rot', th: 30 * Math.PI / 180, beta: 0.4, playing: !S.paused, clock: 0 };
    let ro = null, lastRead = '';

    const f2 = (x) => (Math.abs(x) < 5e-3 ? 0 : x).toFixed(2).replace('.', ',').replace('-', '−');
    function syncSlider() {
      const v = st.mode === 'rot' ? (((st.th * 180 / Math.PI) % 360) + 360) % 360 / 360 : (st.beta + 0.9) / 1.8;
      sl.value = Math.round(v * 1000);
      sl.style.setProperty('--p', (v * 100).toFixed(1) + '%');
      box.querySelector('#tw-sl-l').textContent = st.mode === 'rot' ? 'Drehwinkel θ' : 'Geschwindigkeit β = v/c';
      play.textContent = st.playing ? '❚❚ Anhalten' : '▶ Animieren';
    }
    function arrow(ctx, x0, y0, x1, y1, col, w) {
      const a = Math.atan2(y1 - y0, x1 - x0), L = 9;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w || 2;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - L * Math.cos(a - 0.4), y1 - L * Math.sin(a - 0.4));
      ctx.lineTo(x1 - L * Math.cos(a + 0.4), y1 - L * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
    }
    function axis(ctx, ox, oy, dx, dy, len, col, label, w) {
      ctx.strokeStyle = col; ctx.lineWidth = w || 1;
      ctx.beginPath(); ctx.moveTo(ox - dx * len, oy + dy * len); ctx.lineTo(ox + dx * len, oy - dy * len); ctx.stroke();
      if (label) { ctx.fillStyle = col; ctx.fillText(label, ox + dx * (len - 6) + 6, oy - dy * (len - 6) - 6); }
    }
    function dashed(ctx, x0, y0, x1, y1, col) {
      ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = col; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
    }
    function draw() {
      const C = PP.colors();
      const dpr = globalThis.devicePixelRatio || 1;
      const W = cv.clientWidth || 640, H = cv.clientHeight || 320;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const ctx = cv.getContext && cv.getContext('2d');
      if (!ctx) return readout();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.font = '13px ' + C.mono; ctx.lineCap = 'round';
      if (st.mode === 'rot') {
        const u = Math.min(W, H) / 9.5, ox = W / 2, oy = H / 2, len = Math.max(W, H);
        const P = (x, y) => [ox + x * u, oy - y * u];
        axis(ctx, ox, oy, 1, 0, len, C.ink3, null); axis(ctx, ox, oy, 0, 1, len, C.ink3, null);
        ctx.fillStyle = C.ink3; ctx.fillText('x', W - 16, oy - 6); ctx.fillText('y', ox + 6, 14);
        const r = Math.hypot(V.x, V.y);
        ctx.save(); ctx.setLineDash([3, 5]); ctx.strokeStyle = C.accent; ctx.globalAlpha = 0.55;
        ctx.beginPath(); ctx.arc(ox, oy, r * u, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
        const c = Math.cos(st.th), s = Math.sin(st.th);
        const ax = V.x * c + V.y * s, ay = -V.x * s + V.y * c;
        axis(ctx, ox, oy, c, s, len, C.cyan, null, 1.4); axis(ctx, ox, oy, -s, c, len, C.cyan, null, 1.4);
        const lab = Math.min(W, H) / 2 - 44;
        ctx.fillStyle = C.cyan; ctx.fillText("x'", ox + c * lab + 4, oy - s * lab - 4); ctx.fillText("y'", ox - s * lab + 4, oy - c * lab - 4);
        const tip = P(V.x, V.y), fx = P(ax * c, ax * s), fy = P(-ay * s, ay * c);
        dashed(ctx, tip[0], tip[1], fx[0], fx[1], C.cyan); dashed(ctx, tip[0], tip[1], fy[0], fy[1], C.cyan);
        ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(fx[0], fx[1], 3, 0, 7); ctx.arc(fy[0], fy[1], 3, 0, 7); ctx.fill();
        arrow(ctx, ox, oy, tip[0], tip[1], C.accent, 2.4);
        ctx.fillStyle = C.accent; ctx.fillText('v', tip[0] + 8, tip[1] - 6);
        ctx.fillStyle = C.ink3; ctx.fillText('Kreis: |v| bleibt gleich', 10, H - 10);
      } else {
        const u = (H - 76) / 5.0, ox = W / 2, oy = H - 58;
        const P = (x, ct) => [ox + x * u, oy - ct * u];
        const xm = W / 2 / u, tm = (oy - 6) / u;
        ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.moveTo(ox, H); ctx.lineTo(ox, 0); ctx.stroke();
        ctx.fillStyle = C.ink3; ctx.fillText('x', W - 16, oy - 6); ctx.fillText('ct', ox + 6, 14);
        ctx.save(); ctx.globalAlpha = 0.6; ctx.setLineDash([2, 4]); ctx.strokeStyle = C.violet;
        const lc = Math.min(xm, tm);
        ctx.beginPath(); ctx.moveTo(...P(-lc, lc)); ctx.lineTo(ox, oy); ctx.lineTo(...P(lc, lc)); ctx.stroke(); ctx.restore();
        ctx.fillStyle = C.violet; ctx.fillText('Licht', ...P(-Math.min(lc, 3.6) - 0.1, Math.min(lc, 3.6) - 0.25));
        const s2 = -EV.ct * EV.ct + EV.x * EV.x; // < 0: zeitartig
        ctx.save(); ctx.setLineDash([3, 5]); ctx.strokeStyle = C.accent; ctx.globalAlpha = 0.6; ctx.beginPath();
        for (let i = 0; i <= 160; i++) { const x = -xm + 2 * xm * i / 160, ct = Math.sqrt(x * x - s2); const p = P(x, ct); if (i) ctx.lineTo(...p); else ctx.moveTo(...p); }
        ctx.stroke(); ctx.restore();
        const b = st.beta;
        const far = Math.max(xm, tm) + 2;
        ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(...P(-b * 1.5, -1.5)); ctx.lineTo(...P(b * far, far)); ctx.stroke();       // ct'-Achse: x = β·ct
        ctx.beginPath(); ctx.moveTo(...P(-far, -b * far)); ctx.lineTo(...P(far, b * far)); ctx.stroke();       // x'-Achse: ct = β·x
        ctx.fillStyle = C.cyan;
        const tl = 0.72 * Math.min(tm, (xm - 0.4) / Math.max(Math.abs(b), 1e-6)); ctx.fillText("ct'", ...P(b * tl + 0.15, tl));
        const xl = 0.8 * Math.min(xm, (tm - 0.3) / Math.max(Math.abs(b), 1e-6)); const xs = b < -0.02 ? -xl : xl; ctx.fillText("x'", ...P(xs - (xs < 0 ? 0.3 : 0), b * xs + 0.2));
        const den = 1 - b * b, a = (EV.x - b * EV.ct) / den, bb = (EV.ct - b * EV.x) / den;
        const E = P(EV.x, EV.ct), Px = P(a, a * b), Pt = P(bb * b, bb);
        dashed(ctx, E[0], E[1], Px[0], Px[1], C.cyan); dashed(ctx, E[0], E[1], Pt[0], Pt[1], C.cyan);
        ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(Px[0], Px[1], 3, 0, 7); ctx.arc(Pt[0], Pt[1], 3, 0, 7); ctx.fill();
        arrow(ctx, ox, oy, E[0], E[1], C.accent, 2.4);
        ctx.fillStyle = C.accent; ctx.fillText('Ereignis', E[0] + 9, E[1] + 4);
        ctx.fillStyle = C.ink3; ctx.fillText('Hyperbel: −(ct)² + x² bleibt gleich', 10, H - 8);
      }
      readout();
    }
    function readout() {
      let h;
      if (st.mode === 'rot') {
        const c = Math.cos(st.th), s = Math.sin(st.th);
        const ax = V.x * c + V.y * s, ay = -V.x * s + V.y * c;
        const deg = ((st.th * 180 / Math.PI) % 360 + 360) % 360;
        h = '<div><span class="faint">θ</span> ' + deg.toFixed(0) + '°</div>' +
          '<div><span class="faint">alte Achsen</span> (v<sub>x</sub>, v<sub>y</sub>) = (' + f2(V.x) + '; ' + f2(V.y) + ')</div>' +
          '<div><span class="faint">neue Achsen</span> (v<sub>x\'</sub>, v<sub>y\'</sub>) = (<b>' + f2(ax) + '</b>; <b>' + f2(ay) + '</b>)</div>' +
          '<div class="inv"><span class="faint">invariant</span> v<sub>x\'</sub>² + v<sub>y\'</sub>² = ' + f2(ax * ax + ay * ay) + '</div>';
      } else {
        const b = st.beta, g = 1 / Math.sqrt(1 - b * b);
        const ctp = g * (EV.ct - b * EV.x), xp = g * (EV.x - b * EV.ct);
        h = '<div><span class="faint">β</span> ' + f2(b) + ' · <span class="faint">γ</span> ' + f2(g) + '</div>' +
          '<div><span class="faint">ruhender Beobachter</span> (ct, x) = (' + f2(EV.ct) + '; ' + f2(EV.x) + ')</div>' +
          '<div><span class="faint">bewegter Beobachter</span> (ct\', x\') = (<b>' + f2(ctp) + '</b>; <b>' + f2(xp) + '</b>)</div>' +
          '<div class="inv"><span class="faint">invariant</span> −(ct\')² + x\'² = ' + f2(-ctp * ctp + xp * xp) + '</div>';
      }
      if (h !== lastRead) { box.querySelector('#tw-read').innerHTML = h; lastRead = h; }
    }
    function step(dt) {
      if (!st.playing) return false;
      st.clock += dt;
      if (st.mode === 'rot') st.th += dt * 0.45;
      else st.beta = 0.85 * Math.sin(st.clock * 0.7);
      syncSlider();
      return true;
    }
    box.addEventListener('click', (e) => {
      const m = e.target.closest('[data-mode]');
      if (m) {
        st.mode = m.getAttribute('data-mode'); st.clock = 0;
        if (st.mode === 'boost') st.beta = 0.4;
        box.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('on', b === m));
        syncSlider(); draw();
      }
      if (e.target === play) { st.playing = !st.playing; if (st.playing && st.mode === 'boost') st.clock = Math.asin(Math.max(-1, Math.min(1, st.beta / 0.85))) / 0.7; syncSlider(); }
    });
    sl.addEventListener('input', () => {
      const v = sl.value / 1000;
      st.playing = false;
      if (st.mode === 'rot') st.th = v * 2 * Math.PI; else st.beta = -0.9 + 1.8 * v;
      syncSlider(); draw();
    });
    const loop = U.widgetLoop(box, { step, draw, onPause: (p) => { st.playing = !p; syncSlider(); } });
    if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(() => loop.invalidate()); ro.observe(cv); }
    syncSlider(); draw();
    redrawHook = draw;
    return () => {
      loop.stop();
      if (ro) ro.disconnect();
      redrawHook = null;
    };
  }

  // Theme-Wechsel: Canvas neu zeichnen (Farben kommen aus CSS-Variablen)
  let redrawHook = null;
  const prevRedraw = U.redrawAll;
  U.redrawAll = () => { if (prevRedraw) prevRedraw(); if (redrawHook) redrawHook(); };

  /* ================== die beiden Abschnitte ================== */
  const IDX = {
    id: 'idx', title: 'Indizes lesen: Was bedeuten μ und ν?',
    mount: mountGrid,
    body: () =>
      '<p>' + t(R`\mu`) + ' („mü“) und ' + t(R`\nu`) + ' („nü“) sind einfach griechische Buchstaben. Sie stehen als Platzhalter für eine Richtung in der Raumzeit – so wie das „i“ in „Zeile i“. Die Konvention: <b>griechische Indizes laufen von 0 bis 3</b> und meinen Zeit und Raum, lateinische Indizes (i, j, k) laufen nur über den Raum von 1 bis 3.</p>' +
      d(R`x^{\mu} = \left(x^{0},\, x^{1},\, x^{2},\, x^{3}\right) = \left(ct,\; x,\; y,\; z\right)`) +
      '<p>Ein Index bedeutet also vier Zahlen. Ein Beispiel ist der Viererimpuls ' + t(R`p^{\mu} = \left(E/c,\; p_x,\; p_y,\; p_z\right)`) + ', der Energie und Impuls in ein Objekt packt. Zwei Indizes bedeuten 4 × 4 = 16 Zahlen, die man als Tabelle schreiben kann. ' + t(R`G_{\mu\nu}`) + ' ist also keine einzelne Größe, sondern die Kurzschrift für eine ganze Tabelle. Die Zeile ist ' + t(R`\mu`) + ', die Spalte ' + t(R`\nu`) + '.</p>' +
      gridHTML() +
      '<h3 class="th-h3">Warum 10 und nicht 16?</h3>' +
      '<p>' + t(R`G_{\mu\nu}`) + ', ' + t(R`T_{\mu\nu}`) + ' und ' + t(R`g_{\mu\nu}`) + ' sind <b>symmetrisch</b>: Der Eintrag in Zeile 1, Spalte 2 ist derselbe wie in Zeile 2, Spalte 1. Unabhängig sind nur die 4 Einträge auf der Diagonale plus die 6 darüber. Die Feldgleichungen sind deshalb in Wahrheit <b>10 gekoppelte Gleichungen</b>, eine pro Tabellenplatz: Krümmung in Richtung ' + t(R`\mu\nu`) + ' gleich Materie in Richtung ' + t(R`\mu\nu`) + '. ' + exp('efe', 'Zu den Feldgleichungen') + '.</p>' +
      '<h3 class="th-h3">Die 00-Komponente ist Newton</h3>' +
      '<p>Bei langsam bewegter Materie und schwachen Feldern überwiegt ' + t(R`T_{00} = \rho c^{2}`) + ' alle anderen Einträge bei Weitem. Dann wird die 00-Komponente der Feldgleichungen zu</p>' +
      d(R`\nabla^{2}\Phi = 4\pi G \rho`) +
      '<p>– das ist Newtons Gravitationsgesetz in Feldform. Die Allgemeine Relativitätstheorie enthält Newton als Grenzfall, als einen einzigen Eintrag der Tabelle. ' + exp('newton-gravity', 'Zu Newton') + '.</p>' +
      '<h3 class="th-h3">Einsteinsche Summenkonvention</h3>' +
      '<p>Kommt derselbe Index einmal oben und einmal unten vor, wird automatisch über alle vier Werte summiert. Das Summenzeichen lässt man einfach weg. Das Abstandsquadrat in der Raumzeit</p>' +
      d(R`ds^{2} = \eta_{\mu\nu}\, dx^{\mu}\, dx^{\nu}`) +
      '<p>steht also für 16 Summanden. In der flachen Raumzeit sind 12 davon null, übrig bleibt</p>' +
      d(R`ds^{2} = -c^{2}dt^{2} + dx^{2} + dy^{2} + dz^{2}`) +
      '<p>Mit einem Plus vor ' + t(R`c^{2}dt^{2}`) + ' wäre das der Satz des Pythagoras in vier Dimensionen. Das eine Minuszeichen ist der ganze Unterschied zwischen Raum und Zeit. Im nächsten Abschnitt sieht man, was es anrichtet.</p>' +
      '<div class="callout"><b>Ohne griechische Tastatur:</b> In Physik-Foren schreibt man einfach <span class="mono">G_mu_nu</span> oder <span class="mono">G_{mu nu}</span> – das versteht jeder. Wer die Zeichen doch braucht: Unter Windows öffnet <span class="kbd">Win</span> + <span class="kbd">.</span> eine Symbolauswahl, auf dem Mac <span class="kbd">Ctrl</span> + <span class="kbd">Cmd</span> + <span class="kbd">Leertaste</span>.</div>',
  };

  const TENSOR = {
    id: 'tensor', title: 'Wie ist ein Tensor aufgebaut?',
    mount: mountXform,
    body: () =>
      '<p>Oft hört man: „Ein Tensor ist eine mehrdimensionale Zahlentabelle.“ Das ist nur die halbe Wahrheit. Die Tabelle ist die Verpackung. Was einen Tensor ausmacht, ist, <b>wie sich die Zahlen verändern, wenn man das Koordinatensystem wechselt</b>.</p>' +
      '<h3 class="th-h3">Die Stufen</h3>' +
      '<div class="th-scroll"><table class="t th-cmp"><thead><tr><th>Stufe</th><th>Indizes</th><th>Zahlen in 4D</th><th>Beispiele</th></tr></thead><tbody>' +
      [['0 – Skalar', '–', '1', 'Masse, Ladung, Eigenzeit ' + t(R`\tau`)],
        ['1 – Vektor', t(R`p^{\mu}`), '4', 'Viererimpuls, Vierergeschwindigkeit'],
        ['2', t(R`g_{\mu\nu}`), '16', 'Metrik, Energie-Impuls-Tensor, Einstein-Tensor'],
        ['4', t(R`R^{\rho}_{\sigma\mu\nu}`), '256 (nur 20 unabhängig)', 'Riemannscher Krümmungstensor']]
        .map((r) => '<tr>' + r.map((c) => '<td>' + c + '</td>').join('') + '</tr>').join('') +
      '</tbody></table></div>' +
      '<h3 class="th-h3">Das Entscheidende: wie sich die Zahlen verwandeln</h3>' +
      '<p>Ein Pfeil zeigt in dieselbe Richtung, egal wie man ein Koordinatenkreuz darüberlegt. Dreht man die Achsen, ändern sich trotzdem seine Komponenten, also seine „Schatten“ auf den Achsen. Sie ändern sich aber nach einer festen Regel, und zwar genau so, dass der Pfeil selbst gleich bleibt. Probier es aus:</p>' +
      xformHTML() +
      '<p>Bei der Drehung im Raum bleibt ' + t(R`x^{2} + y^{2}`) + ' gleich: Die Spitze liegt immer auf demselben Kreis. In der Raumzeit tritt der <b>Lorentz-Boost</b> an die Stelle der Drehung – der Wechsel zu einem bewegten Beobachter. Unverändert bleibt dort ' + t(R`-(ct)^{2} + x^{2}`) + ', und das Ereignis liegt deshalb auf einer <b>Hyperbel</b> statt auf einem Kreis. Die Achsen des bewegten Beobachters klappen dabei wie eine Schere auf die Lichtlinie zu. Beides kommt vom Minuszeichen in ' + t(R`\eta_{00}`) + ', und daraus folgen Zeitdilatation und Längenkontraktion. ' + exp('special-rel', 'Zum Lorentz-Faktor') + '.</p>' +
      '<p>Zum Vergleich: Ein Zahlenpaar wie (Temperatur, Druck) ist <i>kein</i> Vektor. Dreht man die Achsen, bleiben beide Zahlen einfach, wie sie sind – sie mischen sich nicht.</p>' +
      '<div class="callout"><b>Warum Physiker Tensoren lieben:</b> Ist ein Tensor in einem Koordinatensystem null, dann ist er in jedem null. Eine Gleichung zwischen Tensoren gilt deshalb für alle Beobachter zugleich. Das Relativitätsprinzip aus ' + sec('inertia', 'Abschnitt 2') + ' und ' + sec('rel', '3') + ' bekommt man so mathematisch geschenkt. Deshalb schrieb Einstein die Physik in Tensoren.</div>' +
      '<h3 class="th-h3">Indizes oben und unten</h3>' +
      '<p>Die Position des Index trägt Information. Obere Indizes (<i>kontravariant</i>) gehören zu Größen wie Verschiebungen ' + t(R`dx^{\mu}`) + ', untere (<i>kovariant</i>) zu Größen wie Gradienten. Die Metrik übersetzt zwischen beiden: ' + t(R`v_{\mu} = g_{\mu\nu}\, v^{\nu}`) + ' (mit Summenkonvention). In der flachen Raumzeit dreht das nur das Vorzeichen der Zeitkomponente um. Kombiniert man einen oberen mit einem unteren Index, entsteht ein Skalar, auf den sich alle Beobachter einigen, zum Beispiel beim Viererimpuls:</p>' +
      d(R`p_{\mu}\, p^{\mu} = -\frac{E^{2}}{c^{2}} + |\vec{p}\,|^{2} = -m^{2}c^{2}`) +
      '<p>Für ein ruhendes Teilchen (' + t(R`\vec{p} = 0`) + ') steht da ' + t(R`E = mc^{2}`) + '. Die berühmteste Formel der Physik ist also die Aussage, dass die „Länge“ des Viererimpulses für alle gleich ist.</p>' +
      '<h3 class="th-h3">Von der Metrik zur Krümmung</h3>' +
      '<p>In der ART beginnt alles mit der Metrik ' + t(R`g_{\mu\nu}`) + ', dem Lineal, das an jedem Punkt festlegt, wie Abstände und Zeiten gemessen werden. Die Tabelle oben zeigt sie unter „Metrik Schwarzes Loch“. Aus ihr baut man Schritt für Schritt die linke Seite der Feldgleichungen:</p>' +
      '<div class="th-chain">' + [
        [R`g_{\mu\nu}`, 'Metrik – Abstände und Zeiten; 10 Funktionen von Ort und Zeit'],
        [R`\Gamma^{\rho}_{\mu\nu}`, 'Christoffel-Symbole – erste Ableitungen der Metrik; sie legen fest, was „geradeaus“ heißt (selbst kein Tensor)'],
        [R`R^{\rho}_{\sigma\mu\nu}`, 'Riemann-Tensor – die eigentliche Krümmung, aus zweiten Ableitungen'],
        [R`R_{\mu\nu},\;\; R`, 'Ricci-Tensor und Ricci-Skalar – die Krümmung zusammengefasst („gemittelt“)'],
        [R`G_{\mu\nu} = R_{\mu\nu} - \tfrac{1}{2}\, R\, g_{\mu\nu}`, 'Einstein-Tensor – die linke Seite der Feldgleichungen'],
      ].map(([f, c], i) => (i ? '<div class="ar">⇓</div>' : '') + '<div class="th-step">' + U.tex(f, true) + '<small>' + esc(c) + '</small></div>').join('') + '</div>' +
      '<p>Den Riemann-Tensor kann man sich so vorstellen: Schiebt man einen Pfeil auf einer Kugel entlang eines Dreiecks, ohne ihn zu drehen, zeigt er am Ende trotzdem in eine andere Richtung. Auf einer flachen Ebene passiert das nie. Der Einstein-Tensor ist genau die Kombination, deren „Quellenfreiheit“ automatisch zur Erhaltung von Energie und Impuls auf der rechten Seite passt. Deshalb steht er in den Feldgleichungen – und nicht der Riemann-Tensor selbst.</p>',
  };

  // hinter „Relativitätstheorie“ einhängen
  const list = U.theory.sections;
  const at = list.findIndex((s) => s.id === 'rel');
  list.splice(at + 1, 0, IDX, TENSOR);
})(globalThis.PP = globalThis.PP || {});
