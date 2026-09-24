/* =====================================================================
   Physics Playground — Grundlagen, Teil „Sprache der ART“:
   Indizes (μ, ν) mit interaktiver 4×4-Tabelle und Tensor-Aufbau mit
   Transformations-Demo (Drehung im Raum / Lorentz-Boost).
   Hängt sich hinter den Relativitäts-Abschnitt in U.theory.sections.
   ===================================================================== */
(function (PP) {
  'use strict';
  const U = PP.ui, I = PP.i18n, T = I.T;
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
    if (m === 0 && n === 0) return T('<b>Energiedichte</b> – wie viel Energie (einschließlich der Ruheenergie mc²) in einem Kubikmeter steckt. Bei gewöhnlicher Materie ist das mit großem Abstand der größte Eintrag.',
      '<b>Energy density</b> – how much energy (including the rest energy mc²) there is in a cubic metre. For ordinary matter this is by far the largest entry.');
    if (m === 0 || n === 0) {
      const i = AX[m || n];
      return T('<b>Energiefluss in ' + i + '-Richtung</b> (geteilt durch c) – und zugleich <b>Impulsdichte in ' + i + '-Richtung</b> (mal c). Dass beides dieselbe Zahl ist, folgt aus E = mc²: Wo Energie strömt, strömt auch Masse und damit Impuls.',
        '<b>Energy flux in the ' + i + ' direction</b> (divided by c) – and at the same time <b>momentum density in the ' + i + ' direction</b> (times c). That both are the same number follows from E = mc²: where energy flows, mass – and therefore momentum – flows too.');
    }
    if (m === n) return T('<b>Druck in ' + a + '-Richtung</b> – genauer: wie viel ' + a + '-Impuls pro Sekunde durch eine Fläche senkrecht zur ' + a + '-Achse fließt. Auch Druck krümmt die Raumzeit, nicht nur Masse.',
      '<b>Pressure in the ' + a + ' direction</b> – more precisely: how much ' + a + ' momentum per second flows through a surface perpendicular to the ' + a + ' axis. Pressure curves spacetime too, not just mass.');
    return T('<b>Scherspannung</b> – ' + a + '-Impuls, der in ' + b + '-Richtung fließt. Tritt etwa in zähen Flüssigkeiten oder verformten Festkörpern auf.',
      '<b>Shear stress</b> – ' + a + ' momentum flowing in the ' + b + ' direction. It occurs, for example, in viscous fluids or deformed solids.');
  };
  const Z = '0';
  const diag = (a, b, c, e) => [[a, Z, Z, Z], [Z, b, Z, Z], [Z, Z, c, Z], [Z, Z, Z, e]];
  // Texte als Funktionen, damit sie beim Zeichnen in der aktiven Sprache entstehen
  const PRESETS = [
    { key: 'mean', label: () => T('Bedeutung', 'Meaning'), sym: 'T', up: true, labels: AX,
      intro: () => T('Energie-Impuls-Tensor ', 'The stress–energy tensor ') + t(R`T^{\mu\nu}`) + T(': die rechte Seite der Feldgleichungen. Tippe eine Zelle an.', ': the right-hand side of the field equations. Tap a cell.'),
      info: tMeaning },
    { key: 'dust', label: () => T('Staub', 'Dust'), sym: 'T', up: true, labels: AX, vals: diag(R`\rho c^{2}`, Z, Z, Z),
      intro: () => T('Ruhende Materie ohne Druck – Staub oder, in guter Näherung, die Galaxien im großen Maßstab. Nur ein einziger Eintrag ist ungleich null.', 'Matter at rest without pressure – dust or, to a good approximation, the galaxies on large scales. Only a single entry is non-zero.'),
      info: tMeaning },
    { key: 'fluid', label: () => T('Ideale Flüssigkeit', 'Perfect fluid'), sym: 'T', up: true, labels: AX, vals: diag(R`\rho c^{2}`, 'p', 'p', 'p'),
      intro: () => T('Sterninneres, Gas, Neutronenstern: zusätzlich Druck ' + t('p') + ' auf der Diagonalen. In der Sonne ist ' + t('p') + ' nur etwa ein Millionstel von ' + t(R`\rho c^{2}`) + ' – deshalb reicht dort fast immer Newton. In Neutronensternen nicht mehr.',
        'Stellar interiors, gas, neutron stars: pressure ' + t('p') + ' on the diagonal as well. In the Sun, ' + t('p') + ' is only about a millionth of ' + t(R`\rho c^{2}`) + ' – which is why Newton is almost always enough there. In neutron stars it no longer is.'),
      info: tMeaning },
    { key: 'light', label: () => T('Lichtstrahl', 'Light beam'), sym: 'T', up: true, labels: AX, vals: [['u', 'u', Z, Z], ['u', 'u', Z, Z], [Z, Z, Z, Z], [Z, Z, Z, Z]],
      intro: () => T('Ein Lichtstrahl in x-Richtung mit Energiedichte ' + t('u') + ': Energie, Energiefluss und Druck in Strahlrichtung sind gleich groß. Licht trägt Impuls – darauf beruhen Sonnensegel.',
        'A light beam in the x direction with energy density ' + t('u') + ': energy, energy flux and pressure along the beam are all equal. Light carries momentum – that is what solar sails rely on.'),
      info: tMeaning },
    { key: 'eta', label: () => T('Metrik flach', 'Flat metric'), sym: R`\eta`, up: false, labels: AX, vals: diag('-1', '1', '1', '1'),
      intro: () => T('Die Minkowski-Metrik ' + t(R`\eta_{\mu\nu}`) + ': das „Lineal“ der flachen Raumzeit (Vorzeichenkonvention −,+,+,+; manche Bücher nehmen +,−,−,−).',
        'The Minkowski metric ' + t(R`\eta_{\mu\nu}`) + ': the “ruler” of flat spacetime (sign convention −,+,+,+; some books use +,−,−,−).'),
      info: (m, n) => m !== n ? T('<b>0</b> – die Richtungen stehen senkrecht aufeinander, es gibt keine Mischterme.', '<b>0</b> – the directions are perpendicular to each other; there are no mixed terms.')
        : m === 0 ? T('<b>−1</b> – dieses eine Minuszeichen macht die Zeit zur Zeit. Es sorgt dafür, dass der Abstand ' + t('ds^{2}') + ' für Licht genau null ist.', '<b>−1</b> – this one minus sign is what makes time time. It ensures that the interval ' + t('ds^{2}') + ' is exactly zero for light.')
          : T('<b>+1</b> – ganz normaler Pythagoras in ' + AX[m] + '-Richtung.', '<b>+1</b> – plain old Pythagoras in the ' + AX[m] + ' direction.') },
    { key: 'schw', label: () => T('Metrik Schwarzes Loch', 'Black hole metric'), sym: 'g', up: false, labels: ['t', 'r', R`\theta`, R`\phi`],
      vals: diag(R`-\left(1-\frac{r_s}{r}\right)`, R`\left(1-\frac{r_s}{r}\right)^{-1}`, 'r^{2}', R`r^{2}\sin^{2}\theta`),
      intro: () => T('Die Schwarzschild-Metrik um eine kugelförmige Masse, in Kugelkoordinaten (t, r, θ, φ). Das ist gekrümmte Raumzeit – und trotzdem dieselbe Tabellenform.', 'The Schwarzschild metric around a spherical mass, in spherical coordinates (t, r, θ, φ). This is curved spacetime – and still the same table format.'),
      info: (m, n) => m !== n ? T('<b>0</b> – auch hier keine Mischterme; die Raumzeit ist kugelsymmetrisch und zeitlich konstant.', '<b>0</b> – no mixed terms here either; spacetime is spherically symmetric and constant in time.')
        : m === 0 ? T('Wird am Horizont ' + t('r = r_s') + ' null: Von außen gesehen bleiben Uhren dort stehen – gravitative Zeitdilatation. Deshalb muss auch GPS korrigieren. ' + exp('hawking', 'Zum Schwarzen Loch'), 'Becomes zero at the horizon ' + t('r = r_s') + ': seen from outside, clocks stop there – gravitational time dilation. It is also why GPS has to correct. ' + exp('hawking', 'To the black hole'))
          : m === 1 ? T('Radiale Abstände sind gedehnt: Zwischen zwei Kugelschalen liegt mehr Raum, als ihr Umfang vermuten lässt. Am Horizont divergiert der Eintrag – das liegt an den Koordinaten, nicht an der Physik dort.', 'Radial distances are stretched: there is more space between two spherical shells than their circumferences would suggest. At the horizon the entry diverges – that is due to the coordinates, not to the physics there.')
            : T('Gewöhnliche Kugelgeometrie. Weit weg (' + t(R`r \gg r_s`) + ') wird die ganze Tabelle zur flachen Minkowski-Metrik in Kugelkoordinaten.', 'Ordinary spherical geometry. Far away (' + t(R`r \gg r_s`) + ') the whole table becomes the flat Minkowski metric in spherical coordinates.') },
  ];

  function gridHTML() {
    return '<div class="tw" id="tw-grid">' +
      '<div class="tw-presets">' + PRESETS.map((p, i) => '<button class="btn' + (i ? '' : ' on') + '" data-preset="' + p.key + '">' + esc(p.label()) + '</button>').join('') + '</div>' +
      '<p class="tw-intro" id="tw-intro"></p>' +
      '<div class="tw-gridwrap"><div class="th-scroll"><table class="tw-grid" id="tw-table"></table></div>' +
      '<div class="tw-info" id="tw-info" aria-live="polite"></div></div>' +
      '<p class="faint tw-count">' + T('16 Einträge · symmetrisch · <span class="tw-key up"></span> 4 Diagonale + 6 darüber = <b>10 unabhängige</b> · <span class="tw-key lo"></span> 6 Spiegelbilder', '16 entries · symmetric · <span class="tw-key up"></span> 4 diagonal + 6 above = <b>10 independent</b> · <span class="tw-key lo"></span> 6 mirror images') + '</p>' +
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
          h += '<td class="' + cls.join(' ') + '"><button data-m="' + m + '" data-n="' + n + '" aria-label="' + T('Komponente ', 'Component ') + m + n + '">' +
            '<span class="tw-sym' + (v === null ? ' big' : '') + '">' + t(preset.sym + idx(m, n)) + '</span>' + (v !== null ? '<span class="tw-val">' + t(v) + '</span>' : '') + '</button></td>';
        }
        h += '</tr>';
      }
      box.querySelector('#tw-table').innerHTML = h + '</tbody>';
      box.querySelector('#tw-intro').innerHTML = preset.intro();
      const [m, n] = sel;
      let info = '<div class="tw-info-h">' + t(preset.sym + idx(m, n)) + (preset.vals ? ' ' + t('= ' + preset.vals[m][n]) : '') + '</div>' + preset.info(m, n);
      if (m !== n) info += '<div class="faint" style="margin-top:8px;font-size:12.5px">' + T('Spiegelpartner ', 'Its mirror partner ') + t(preset.sym + idx(n, m)) + T(' hat wegen der Symmetrie denselben Wert.', ' has the same value because of the symmetry.') + '</div>';
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
      '<div class="tw-ctrl"><div class="seg" role="tablist"><button class="on" data-mode="rot">' + T('Drehung im Raum', 'Rotation in space') + '</button><button data-mode="boost">' + T('Boost in der Raumzeit', 'Boost in spacetime') + '</button></div>' +
      '<button class="btn" id="tw-play"></button></div>' +
      '<canvas class="tw-canvas" id="tw-cv" role="img" aria-label="' + T('Koordinatentransformation', 'Coordinate transformation') + '"></canvas>' +
      '<div class="tw-ctrl"><label class="tw-sl"><span id="tw-sl-l"></span><input type="range" id="tw-sl" min="0" max="1000" step="1"></label></div>' +
      '<div class="tw-read" id="tw-read"></div></div>';
  }
  function mountXform(root) {
    const box = root.querySelector('#tw-x');
    if (!box) return null;
    const cv = box.querySelector('#tw-cv'), sl = box.querySelector('#tw-sl'), play = box.querySelector('#tw-play');
    const st = { mode: 'rot', th: 30 * Math.PI / 180, beta: 0.4, playing: !S.paused, clock: 0 };
    let ro = null, lastRead = '';

    const f2 = (x) => I.dec((Math.abs(x) < 5e-3 ? 0 : x).toFixed(2)).replace('-', '−');
    const sep = () => T('; ', ', ');   // Trenner im Zahlenpaar: (1,5; 2) bzw. (1.5, 2)
    function syncSlider() {
      const v = st.mode === 'rot' ? (((st.th * 180 / Math.PI) % 360) + 360) % 360 / 360 : (st.beta + 0.9) / 1.8;
      sl.value = Math.round(v * 1000);
      sl.style.setProperty('--p', (v * 100).toFixed(1) + '%');
      box.querySelector('#tw-sl-l').textContent = st.mode === 'rot' ? T('Drehwinkel θ', 'Rotation angle θ') : T('Geschwindigkeit β = v/c', 'Speed β = v/c');
      play.textContent = st.playing ? T('❚❚ Anhalten', '❚❚ Pause') : T('▶ Animieren', '▶ Animate');
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
        ctx.fillStyle = C.ink3; ctx.fillText(T('Kreis: |v| bleibt gleich', 'Circle: |v| stays the same'), 10, H - 10);
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
        ctx.fillStyle = C.violet; ctx.fillText(T('Licht', 'light'), ...P(-Math.min(lc, 3.6) - 0.1, Math.min(lc, 3.6) - 0.25));
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
        ctx.fillStyle = C.accent; ctx.fillText(T('Ereignis', 'event'), E[0] + 9, E[1] + 4);
        ctx.fillStyle = C.ink3; ctx.fillText(T('Hyperbel: −(ct)² + x² bleibt gleich', 'Hyperbola: −(ct)² + x² stays the same'), 10, H - 8);
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
          '<div><span class="faint">' + T('alte Achsen', 'old axes') + '</span> (v<sub>x</sub>, v<sub>y</sub>) = (' + f2(V.x) + sep() + f2(V.y) + ')</div>' +
          '<div><span class="faint">' + T('neue Achsen', 'new axes') + '</span> (v<sub>x\'</sub>, v<sub>y\'</sub>) = (<b>' + f2(ax) + '</b>' + sep() + '<b>' + f2(ay) + '</b>)</div>' +
          '<div class="inv"><span class="faint">invariant</span> v<sub>x\'</sub>² + v<sub>y\'</sub>² = ' + f2(ax * ax + ay * ay) + '</div>';
      } else {
        const b = st.beta, g = 1 / Math.sqrt(1 - b * b);
        const ctp = g * (EV.ct - b * EV.x), xp = g * (EV.x - b * EV.ct);
        h = '<div><span class="faint">β</span> ' + f2(b) + ' · <span class="faint">γ</span> ' + f2(g) + '</div>' +
          '<div><span class="faint">' + T('ruhender Beobachter', 'observer at rest') + '</span> (ct, x) = (' + f2(EV.ct) + sep() + f2(EV.x) + ')</div>' +
          '<div><span class="faint">' + T('bewegter Beobachter', 'moving observer') + '</span> (ct\', x\') = (<b>' + f2(ctp) + '</b>' + sep() + '<b>' + f2(xp) + '</b>)</div>' +
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
    id: 'idx', title: { de: 'Indizes lesen: Was bedeuten μ und ν?', en: 'Reading indices: what do μ and ν mean?' },
    mount: mountGrid,
    body: {
      de: () =>
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
      en: () =>
        '<p>' + t(R`\mu`) + ' (“mu”) and ' + t(R`\nu`) + ' (“nu”) are simply Greek letters. They are placeholders for a direction in spacetime – like the “i” in “row i”. The convention: <b>Greek indices run from 0 to 3</b> and cover time and space; Latin indices (i, j, k) run over space only, from 1 to 3.</p>' +
        d(R`x^{\mu} = \left(x^{0},\, x^{1},\, x^{2},\, x^{3}\right) = \left(ct,\; x,\; y,\; z\right)`) +
        '<p>So one index means four numbers. An example is the four-momentum ' + t(R`p^{\mu} = \left(E/c,\; p_x,\; p_y,\; p_z\right)`) + ', which packs energy and momentum into one object. Two indices mean 4 × 4 = 16 numbers, which can be written as a table. ' + t(R`G_{\mu\nu}`) + ' is therefore not a single quantity but shorthand for a whole table. The row is ' + t(R`\mu`) + ', the column ' + t(R`\nu`) + '.</p>' +
        gridHTML() +
        '<h3 class="th-h3">Why 10 and not 16?</h3>' +
        '<p>' + t(R`G_{\mu\nu}`) + ', ' + t(R`T_{\mu\nu}`) + ' and ' + t(R`g_{\mu\nu}`) + ' are <b>symmetric</b>: the entry in row 1, column 2 is the same as in row 2, column 1. Only the 4 entries on the diagonal plus the 6 above it are independent. The field equations are therefore really <b>10 coupled equations</b>, one per slot in the table: curvature in the ' + t(R`\mu\nu`) + ' direction equals matter in the ' + t(R`\mu\nu`) + ' direction. ' + exp('efe', 'To the field equations') + '.</p>' +
        '<h3 class="th-h3">The 00 component is Newton</h3>' +
        '<p>For slowly moving matter and weak fields, ' + t(R`T_{00} = \rho c^{2}`) + ' outweighs all other entries by far. The 00 component of the field equations then becomes</p>' +
        d(R`\nabla^{2}\Phi = 4\pi G \rho`) +
        '<p>– which is Newton’s law of gravitation in field form. General relativity contains Newton as a limiting case, as a single entry of the table. ' + exp('newton-gravity', 'To Newton') + '.</p>' +
        '<h3 class="th-h3">Einstein summation convention</h3>' +
        '<p>If the same index appears once up and once down, it is automatically summed over all four values. The summation sign is simply left out. The squared interval in spacetime</p>' +
        d(R`ds^{2} = \eta_{\mu\nu}\, dx^{\mu}\, dx^{\nu}`) +
        '<p>therefore stands for 16 terms. In flat spacetime 12 of them are zero, leaving</p>' +
        d(R`ds^{2} = -c^{2}dt^{2} + dx^{2} + dy^{2} + dz^{2}`) +
        '<p>With a plus in front of ' + t(R`c^{2}dt^{2}`) + ' this would be Pythagoras’ theorem in four dimensions. That one minus sign is the whole difference between space and time. The next section shows what it does.</p>' +
        '<div class="callout"><b>Without a Greek keyboard:</b> in physics forums people simply write <span class="mono">G_mu_nu</span> or <span class="mono">G_{mu nu}</span> – everyone understands that. If you do need the characters: on Windows, <span class="kbd">Win</span> + <span class="kbd">.</span> opens a symbol picker; on a Mac, <span class="kbd">Ctrl</span> + <span class="kbd">Cmd</span> + <span class="kbd">Space</span>.</div>',
    },
  };

  const TENSOR = {
    id: 'tensor', title: { de: 'Wie ist ein Tensor aufgebaut?', en: 'How is a tensor built?' },
    mount: mountXform,
    body: {
      de: () =>
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
        chain([
          'Metrik – Abstände und Zeiten; 10 Funktionen von Ort und Zeit',
          'Christoffel-Symbole – erste Ableitungen der Metrik; sie legen fest, was „geradeaus“ heißt (selbst kein Tensor)',
          'Riemann-Tensor – die eigentliche Krümmung, aus zweiten Ableitungen',
          'Ricci-Tensor und Ricci-Skalar – die Krümmung zusammengefasst („gemittelt“)',
          'Einstein-Tensor – die linke Seite der Feldgleichungen']) +
        '<p>Den Riemann-Tensor kann man sich so vorstellen: Schiebt man einen Pfeil auf einer Kugel entlang eines Dreiecks, ohne ihn zu drehen, zeigt er am Ende trotzdem in eine andere Richtung. Auf einer flachen Ebene passiert das nie. Der Einstein-Tensor ist genau die Kombination, deren „Quellenfreiheit“ automatisch zur Erhaltung von Energie und Impuls auf der rechten Seite passt. Deshalb steht er in den Feldgleichungen – und nicht der Riemann-Tensor selbst.</p>',
      en: () =>
        '<p>You often hear: “A tensor is a multi-dimensional table of numbers.” That is only half the truth. The table is the packaging. What makes a tensor a tensor is <b>how its numbers change when you switch coordinate systems</b>.</p>' +
        '<h3 class="th-h3">The ranks</h3>' +
        '<div class="th-scroll"><table class="t th-cmp"><thead><tr><th>Rank</th><th>Indices</th><th>Numbers in 4D</th><th>Examples</th></tr></thead><tbody>' +
        [['0 – scalar', '–', '1', 'mass, charge, proper time ' + t(R`\tau`)],
          ['1 – vector', t(R`p^{\mu}`), '4', 'four-momentum, four-velocity'],
          ['2', t(R`g_{\mu\nu}`), '16', 'metric, stress–energy tensor, Einstein tensor'],
          ['4', t(R`R^{\rho}_{\sigma\mu\nu}`), '256 (only 20 independent)', 'Riemann curvature tensor']]
          .map((r) => '<tr>' + r.map((c) => '<td>' + c + '</td>').join('') + '</tr>').join('') +
        '</tbody></table></div>' +
        '<h3 class="th-h3">What really matters: how the numbers transform</h3>' +
        '<p>An arrow points in the same direction however you lay a set of coordinate axes over it. Rotate the axes, though, and its components – its “shadows” on the axes – still change. But they change according to a fixed rule, in exactly such a way that the arrow itself stays the same. Try it:</p>' +
        xformHTML() +
        '<p>In a rotation in space, ' + t(R`x^{2} + y^{2}`) + ' stays the same: the tip always lies on the same circle. In spacetime, the <b>Lorentz boost</b> takes the place of the rotation – switching to a moving observer. What stays unchanged there is ' + t(R`-(ct)^{2} + x^{2}`) + ', so the event lies on a <b>hyperbola</b> instead of a circle. The moving observer’s axes close in on the light line like a pair of scissors. Both come from the minus sign in ' + t(R`\eta_{00}`) + ', and time dilation and length contraction follow from it. ' + exp('special-rel', 'To the Lorentz factor') + '.</p>' +
        '<p>For comparison: a pair of numbers such as (temperature, pressure) is <i>not</i> a vector. Rotate the axes and both numbers simply stay as they are – they do not mix.</p>' +
        '<div class="callout"><b>Why physicists love tensors:</b> if a tensor is zero in one coordinate system, it is zero in every one. An equation between tensors therefore holds for all observers at once. The principle of relativity from ' + sec('inertia', 'section 2') + ' and ' + sec('rel', '3') + ' comes for free mathematically. That is why Einstein wrote physics in tensors.</div>' +
        '<h3 class="th-h3">Upper and lower indices</h3>' +
        '<p>The position of an index carries information. Upper indices (<i>contravariant</i>) belong to quantities like displacements ' + t(R`dx^{\mu}`) + ', lower ones (<i>covariant</i>) to quantities like gradients. The metric translates between the two: ' + t(R`v_{\mu} = g_{\mu\nu}\, v^{\nu}`) + ' (with the summation convention). In flat spacetime this only flips the sign of the time component. Combining an upper with a lower index gives a scalar that all observers agree on – for the four-momentum, for example:</p>' +
        d(R`p_{\mu}\, p^{\mu} = -\frac{E^{2}}{c^{2}} + |\vec{p}\,|^{2} = -m^{2}c^{2}`) +
        '<p>For a particle at rest (' + t(R`\vec{p} = 0`) + ') this reads ' + t(R`E = mc^{2}`) + '. So the most famous formula in physics is the statement that the “length” of the four-momentum is the same for everyone.</p>' +
        '<h3 class="th-h3">From the metric to curvature</h3>' +
        '<p>In general relativity, everything starts with the metric ' + t(R`g_{\mu\nu}`) + ', the ruler that fixes at every point how distances and times are measured. The table above shows it under “Black hole metric”. From it you build the left-hand side of the field equations step by step:</p>' +
        chain([
          'Metric – distances and times; 10 functions of position and time',
          'Christoffel symbols – first derivatives of the metric; they determine what “straight ahead” means (not a tensor themselves)',
          'Riemann tensor – the actual curvature, from second derivatives',
          'Ricci tensor and Ricci scalar – the curvature condensed (“averaged”)',
          'Einstein tensor – the left-hand side of the field equations']) +
        '<p>You can picture the Riemann tensor like this: slide an arrow around a triangle on a sphere without rotating it, and at the end it still points in a different direction. On a flat plane that never happens. The Einstein tensor is exactly the combination whose “source-freeness” automatically matches the conservation of energy and momentum on the right-hand side. That is why it – and not the Riemann tensor itself – appears in the field equations.</p>',
    },
  };

  function chain(captions) {
    const F = [R`g_{\mu\nu}`, R`\Gamma^{\rho}_{\mu\nu}`, R`R^{\rho}_{\sigma\mu\nu}`, R`R_{\mu\nu},\;\; R`, R`G_{\mu\nu} = R_{\mu\nu} - \tfrac{1}{2}\, R\, g_{\mu\nu}`];
    return '<div class="th-chain">' + F.map((f, i) => (i ? '<div class="ar">⇓</div>' : '') + '<div class="th-step">' + U.tex(f, true) + '<small>' + esc(captions[i]) + '</small></div>').join('') + '</div>';
  }

  // hinter „Relativitätstheorie“ einhängen
  const list = U.theory.sections;
  const at = list.findIndex((s) => s.id === 'rel');
  list.splice(at + 1, 0, I.localize(IDX), I.localize(TENSOR));
})(globalThis.PP = globalThis.PP || {});
