/* =====================================================================
   Physics Playground — Grundlagen, Teil 3:
   Einstein-Hilbert-Wirkung (mit Demo zum Prinzip der kleinsten Wirkung)
   und „Die Köpfe hinter der ART“ (Poincaré, Minkowski, Grossmann, Hilbert, Noether).
   Hängt sich hinter den Tensor-Abschnitt in U.theory.sections.
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

  /* ============ Widget: Prinzip der kleinsten Wirkung ============ */
  // Ball, m = 1 kg, fliegt in T = 2 s von (0|0) nach (10 m|0). Echte Bahn: Wurfparabel.
  // Probeweg: echte Bahn + ε1·sin(πt/T) + ε2·sin(2πt/T). Wirkung S = ∫ (T_kin − V) dt.
  const M = 1, G = 9.81, TT = 2, D = 10, N = 400;
  const yTrue = (tt) => 0.5 * G * tt * (TT - tt);
  const vyTrue = (tt) => 0.5 * G * (TT - 2 * tt);
  // Numerische Wirkung eines Probewegs (Mittelpunktsregel). Wird nur noch in den Tests benutzt,
  // um die geschlossene Form unten zu prüfen.
  function action(e1, e2) {
    let s = 0;
    const dt = TT / N, vx = D / TT;
    for (let i = 0; i < N; i++) {
      const tt = (i + 0.5) * dt;
      const y = yTrue(tt) + e1 * Math.sin(Math.PI * tt / TT) + e2 * Math.sin(2 * Math.PI * tt / TT);
      const vy = vyTrue(tt) + e1 * Math.PI / TT * Math.cos(Math.PI * tt / TT) + e2 * 2 * Math.PI / TT * Math.cos(2 * Math.PI * tt / TT);
      s += (0.5 * M * (vx * vx + vy * vy) - M * G * y) * dt;
    }
    return s;
  }
  // Geschlossene Form. Mit η = ε₁ sin(πt/T) + ε₂ sin(2πt/T) und linearem Potential m g y gilt exakt
  // ΔS = S[y+η] − S[y] = ½m ∫ η̇² dt  (der in ε lineare Teil verschwindet, weil y die Bewegungsgleichung
  // erfüllt; einen quadratischen Potentialterm gibt es nicht). Die Moden sind orthogonal, also
  // ΔS = m π² / (4T) · (ε₁² + 4 ε₂²).  Wirkung der echten Bahn: S₀ = m D²/(2T) − m g² T³/24.
  const dS = (e1, e2) => M * Math.PI * Math.PI / (4 * TT) * (e1 * e1 + 4 * e2 * e2);
  const S0 = M * D * D / (2 * TT) - M * G * G * TT * TT * TT / 24;
  U.actionDemo = { action, dS, S0 };

  function actHTML() {
    return '<div class="tw" id="tw-act">' +
      '<div class="tw-ctrl"><span class="faint" style="font-size:13px">Ball, 1 kg, fliegt in 2 s von links nach rechts. Verbiege den Weg:</span><button class="btn" id="ta-play"></button></div>' +
      '<canvas class="tw-canvas" id="ta-cv" style="height:340px" role="img" aria-label="Probewege und ihre Wirkung"></canvas>' +
      '<div class="tw-ctrl"><label class="tw-sl"><span class="ta-l">Beule ε₁</span><input type="range" id="ta-e1" min="0" max="1000" step="1"></label></div>' +
      '<div class="tw-ctrl"><label class="tw-sl"><span class="ta-l">Welle ε₂</span><input type="range" id="ta-e2" min="0" max="1000" step="1"></label></div>' +
      '<div class="tw-read" id="ta-read"></div></div>';
  }
  function mountAct(root) {
    const box = root.querySelector('#tw-act');
    if (!box) return null;
    const cv = box.querySelector('#ta-cv'), s1 = box.querySelector('#ta-e1'), s2 = box.querySelector('#ta-e2'), play = box.querySelector('#ta-play');
    const EM = 2; // ε-Bereich ±2 m
    const st = { e1: 1.2, e2: 0, playing: !S.paused, clock: 0 };
    let ro = null, lastRead = '';
    const f = (x, n = 2) => (Math.abs(x) < 0.5 * Math.pow(10, -n) ? 0 : x).toFixed(n).replace('.', ',').replace('-', '−');

    function sync() {
      [[s1, st.e1], [s2, st.e2]].forEach(([el, v]) => {
        const p = (v + EM) / (2 * EM);
        el.value = Math.round(p * 1000);
        el.style.setProperty('--p', (p * 100).toFixed(1) + '%');
      });
      play.textContent = st.playing ? '❚❚ Anhalten' : '▶ Animieren';
    }
    function draw() {
      const C = PP.colors();
      const dpr = globalThis.devicePixelRatio || 1;
      const W = cv.clientWidth || 640, H = cv.clientHeight || 340;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const ctx = cv.getContext && cv.getContext('2d');
      const Sc = S0 + dS(st.e1, st.e2);
      readout(Sc);
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.font = '12.5px ' + C.mono; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const narrow = W < 560;
      // Bereiche: Bahn (links/oben) und S(ε1)-Plot (rechts/unten)
      const A = narrow ? { x: 8, y: 8, w: W - 16, h: H * 0.58 } : { x: 8, y: 8, w: W * 0.6, h: H - 16 };
      const B = narrow ? { x: 44, y: H * 0.58 + 22, w: W - 60, h: H * 0.42 - 44 } : { x: W * 0.6 + 56, y: 22, w: W * 0.4 - 72, h: H - 58 };
      // --- Bahn ---
      const ymin = -2.2, ymax = 7.2;
      const sx = A.w / (D + 1), sy = A.h / (ymax - ymin), sc = Math.min(sx, sy);
      const ox = A.x + (A.w - D * sc) / 2, oy = A.y + A.h - (0 - ymin) * sc;
      const P = (x, y) => [ox + x * sc, oy - y * sc];
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(A.x, oy); ctx.lineTo(A.x + A.w, oy); ctx.stroke();
      const path = (e1, e2) => {
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const tt = TT * i / 120;
          const p = P(D * tt / TT, yTrue(tt) + e1 * Math.sin(Math.PI * tt / TT) + e2 * Math.sin(2 * Math.PI * tt / TT));
          if (i) ctx.lineTo(...p); else ctx.moveTo(...p);
        }
        ctx.stroke();
      };
      // Geisterwege: ein Fächer möglicher Wege
      ctx.save(); ctx.globalAlpha = 0.14; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
      for (let k = -4; k <= 4; k++) if (k) path(k * 0.45, (k % 2) * 0.5);
      ctx.restore();
      ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = C.accent; ctx.lineWidth = 1.6; path(0, 0); ctx.restore();
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.4; path(st.e1, st.e2);
      // Ball, der den Probeweg abfliegt
      const ph = (st.clock * 0.5) % 1, tb = ph * TT;
      const pb = P(D * tb / TT, yTrue(tb) + st.e1 * Math.sin(Math.PI * tb / TT) + st.e2 * Math.sin(2 * Math.PI * tb / TT));
      ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(pb[0], pb[1], 5, 0, 7); ctx.fill();
      ctx.fillStyle = C.ink; [P(0, 0), P(D, 0)].forEach((p) => { ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, 7); ctx.fill(); });
      ctx.fillStyle = C.ink3; ctx.fillText('Start', P(0, 0)[0] - 14, oy + 16); ctx.fillText('Ziel', P(D, 0)[0] - 12, oy + 16);
      ctx.fillStyle = C.accent; ctx.fillText('echte Bahn', ...P(D * 0.5 - 1.3, yTrue(1) + 0.35));
      // --- S(ε1) ---
      const eMax = EM, sAt = (e) => dS(e, st.e2);
      const top = Math.max(sAt(eMax), 1e-9) * 1.08;
      const X = (e) => B.x + (e + eMax) / (2 * eMax) * B.w, Y = (v) => B.y + B.h - v / top * B.h;
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(B.x, B.y); ctx.lineTo(B.x, B.y + B.h); ctx.lineTo(B.x + B.w, B.y + B.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0), B.y + B.h); ctx.lineTo(X(0), B.y + B.h + 4); ctx.stroke();
      ctx.fillStyle = C.ink3;
      ctx.fillText('ε₁', B.x + B.w - 12, B.y + B.h + 16); ctx.fillText('0', X(0) - 3, B.y + B.h + 16);
      ctx.fillText('S − S_echt', B.x - 40, B.y - 8);
      ctx.strokeStyle = C.violet; ctx.lineWidth = 1.8; ctx.beginPath();
      for (let i = 0; i <= 80; i++) { const e = -eMax + 2 * eMax * i / 80; const p = [X(e), Y(sAt(e))]; if (i) ctx.lineTo(...p); else ctx.moveTo(...p); }
      ctx.stroke();
      const pc = [X(st.e1), Y(Sc - S0)];
      ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.cyan; ctx.beginPath(); ctx.moveTo(pc[0], B.y + B.h); ctx.lineTo(...pc); ctx.stroke(); ctx.restore();
      ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(pc[0], pc[1], 5, 0, 7); ctx.fill();
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(X(0), Y(0), 4, 0, 7); ctx.fill(); ctx.fillText('echt', X(0) + 7, Y(0) - 6);
    }
    function readout(Sc) {
      const h =
        '<div><span class="faint">Wirkung echte Bahn</span> S = ' + f(S0) + ' J·s</div>' +
        '<div><span class="faint">Wirkung Probeweg</span> S = <b>' + f(Sc) + '</b> J·s</div>' +
        '<div class="inv"><span class="faint">Unterschied</span> ΔS = ' + f(Sc - S0) + ' J·s ' + (Sc - S0 < 1e-6 ? '← kleinster Wert' : '≥ 0') + '</div>' +
        '<div><span class="faint">Formel</span> S = ∫ (E<sub>kin</sub> − E<sub>pot</sub>) dt <span class="faint">· Vorzeichen egal, es zählt der Vergleich</span></div>';
      if (h !== lastRead) { box.querySelector('#ta-read').innerHTML = h; lastRead = h; }
    }
    // Der Ball fliegt den Probeweg ab, solange Animationen an sind oder das Widget selbst läuft.
    function step(dt) {
      if (S.paused && !st.playing) return false;
      st.clock += dt;
      if (st.playing) {
        st.e1 = 1.7 * Math.sin(st.clock * 0.55);
        st.e2 = 0.9 * Math.sin(st.clock * 0.9 + 1.1);
        sync();
      }
      return true;
    }
    const onSlide = () => {
      st.playing = false;
      st.e1 = -EM + 2 * EM * s1.value / 1000;
      st.e2 = -EM + 2 * EM * s2.value / 1000;
      sync(); draw();
    };
    s1.addEventListener('input', onSlide); s2.addEventListener('input', onSlide);
    play.addEventListener('click', () => {
      st.playing = !st.playing;
      if (st.playing) st.clock = Math.asin(Math.max(-1, Math.min(1, st.e1 / 1.7))) / 0.55;
      sync(); loop.invalidate();
    });
    const loop = U.widgetLoop(box, { step, draw, onPause: (p) => { st.playing = !p; sync(); } });
    if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(() => loop.invalidate()); ro.observe(cv); }
    sync(); draw();
    redrawHook = draw;
    return () => {
      loop.stop();
      if (ro) ro.disconnect();
      redrawHook = null;
    };
  }
  let redrawHook = null;
  const prevRedraw = U.redrawAll;
  U.redrawAll = () => { if (prevRedraw) prevRedraw(); if (redrawHook) redrawHook(); };

  /* ================== Abschnitt: Einstein-Hilbert-Wirkung ================== */
  const ACTION = {
    id: 'action', title: 'Die Einstein-Hilbert-Wirkung: die ART in einer Zeile',
    mount: mountAct,
    body: () =>
      '<p>Die Feldgleichungen kann man auch ganz anders gewinnen: nicht als Gleichung, die man aufstellt, sondern als Folge eines einzigen Prinzips. Es ist dasselbe Prinzip, das die gesamte Physik durchzieht.</p>' +
      '<h3 class="th-h3">Das Prinzip der kleinsten Wirkung</h3>' +
      '<p>Man ordnet jedem denkbaren Weg eines Systems eine Zahl zu, die <b>Wirkung</b> ' + t('S') + '. In der Mechanik ist das die über die Zeit aufsummierte Differenz aus Bewegungs- und Lageenergie:</p>' +
      d(R`S = \int \left(E_{\text{kin}} - E_{\text{pot}}\right) dt`) +
      '<p>Die Natur wählt den Weg, bei dem ' + t('S') + ' <b>stationär</b> ist – kleine Änderungen am Weg ändern ' + t('S') + ' in erster Ordnung nicht. Meist ist das ein Minimum. Aus dieser einen Forderung folgt ' + t('F = ma') + ', ohne dass man Kräfte als Pfeile zeichnen muss. Probier es mit einem geworfenen Ball: Jede Verformung der echten Bahn macht die Wirkung größer.</p>' +
      actHTML() +
      '<p>Das Diagramm daneben zeigt die Wirkung in Abhängigkeit von der Beule ' + t(R`\varepsilon_1`) + '. Die Kurve hat ihr Minimum genau bei null, also bei der echten Wurfparabel. Die Welle hebt die ganze Kurve zusätzlich an – jede Abweichung kostet.</p>' +
      '<p>Für diesen Wurf lässt sich das sogar exakt ausrechnen. Mit der Masse ' + t('m') + ' und der Flugzeit ' + t(R`\tau = 2\,\mathrm{s}`) + ' gilt</p>' +
      d(R`\Delta S = S - S_{\text{echt}} = \frac{m\,\pi^{2}}{4\,\tau}\left(\varepsilon_1^{2} + 4\,\varepsilon_2^{2}\right)`) +
      '<p>Warum so einfach? Alle Beiträge, die linear in den ' + t(R`\varepsilon`) + ' sind, fallen weg, weil die echte Bahn die Bewegungsgleichung erfüllt – genau das bedeutet „stationär“. Und weil die Schwerkraft hier konstant ist, wächst die Lageenergie nur linear mit der Höhe und liefert keinen weiteren Term. Übrig bleibt allein die zusätzliche Bewegungsenergie der Verformung, und die ist nie negativ. Deshalb ist die echte Bahn hier nicht nur stationär, sondern ein echtes Minimum. Beule und Welle stören sich dabei nicht: Das Produkt ihrer Geschwindigkeitsanteile mittelt sich über den Flug zu null. Die Welle verschiebt die Parabel deshalb nur nach oben, ihr Tiefpunkt bleibt bei ' + t(R`\varepsilon_1 = 0`) + '.</p>' +
      '<p>Dass die Natur einem solchen Prinzip folgt, ist kein Zufall der Mechanik. Licht nimmt den Weg kürzester Laufzeit (Fermat), Felder gehorchen Wirkungsprinzipien, und in der Quantenmechanik summiert Feynman über <i>alle</i> Wege, jeweils gewichtet mit ' + t(R`e^{iS/\hbar}`) + '. Der klassische Weg ist der, bei dem sich die Nachbarwege nicht gegenseitig auslöschen.</p>' +
      '<h3 class="th-h3">Die Wirkung der Raumzeit</h3>' +
      '<p>1915 fragte David Hilbert: Welche Wirkung hat die Geometrie selbst? Seine Antwort, die <b>Einstein-Hilbert-Wirkung</b>:</p>' +
      d(R`S = \frac{c^{3}}{16\pi G}\int R\,\sqrt{-g}\;d^{4}x \;+\; S_{\text{Materie}}`) +
      '<div class="th-scroll"><table class="t th-cmp"><tbody>' +
      [[t('R'), 'Ricci-Skalar – die Krümmung an jedem Punkt, zu einer einzigen Zahl zusammengefasst (siehe ' + sec('tensor', 'Kette von der Metrik zur Krümmung') + ')'],
        [t(R`\sqrt{-g}`), 'Wurzel aus (minus) der Determinante der Metrik. Sie misst, wie groß ein Stück Raumzeit wirklich ist, und macht das Integral unabhängig von der Wahl der Koordinaten'],
        [t(R`d^{4}x`), 'über die ganze Raumzeit integrieren – Raum <i>und</i> Zeit'],
        [t(R`\frac{c^{3}}{16\pi G}`), 'Umrechnungsfaktor von Geometrie in Wirkung; hier steckt die Stärke der Gravitation'],
        [t(R`S_{\text{Materie}}`), 'die Wirkung von allem, was in der Raumzeit steckt – Teilchen, Felder, Licht']]
        .map(([a, b]) => '<tr><td style="white-space:nowrap">' + a + '</td><td>' + b + '</td></tr>').join('') +
      '</tbody></table></div>' +
      '<p>Man verlangt nun, dass ' + t('S') + ' stationär ist, wenn man die Metrik ' + t(R`g_{\mu\nu}`) + ' ein klein wenig verändert – genau wie beim Ball, nur dass jetzt statt einer Bahn die Geometrie selbst „verbogen“ wird. Heraus kommen die Feldgleichungen:</p>' +
      d(R`\frac{\delta S}{\delta g^{\mu\nu}} = 0 \quad\Rightarrow\quad G_{\mu\nu} = \frac{8\pi G}{c^{4}}\, T_{\mu\nu}`) +
      '<p>Die linke Seite stammt aus dem Krümmungsteil, die rechte aus der Variation der Materiewirkung: So ist ' + t(R`T_{\mu\nu}`) + ' eigentlich definiert. Eine kosmologische Konstante erhält man, indem man ' + t('R') + ' durch ' + t(R`R - 2\Lambda`) + ' ersetzt.</p>' +
      '<h3 class="th-h3">Warum gerade R?</h3>' +
      '<p>' + t('R') + ' ist der einfachste Skalar, den man aus der Krümmung bauen kann. Dass die Wahl nicht willkürlich ist, zeigte David Lovelock 1971: In vier Dimensionen sind Einsteins Gleichungen (mit ' + t(R`\Lambda`) + ') die <b>einzig möglichen</b> Feldgleichungen, die nur von der Metrik und ihren ersten beiden Ableitungen abhängen. Wer mehr will, braucht zusätzliche Felder, höhere Ableitungen oder mehr Dimensionen.</p>' +
      '<h3 class="th-h3">Dimensionsanalyse: Hier wartet die Planck-Länge</h3>' +
      '<p>Mit ' + t(R`x^{0} = ct`) + ' hat ' + t(R`d^{4}x`) + ' die Dimension ' + t(R`\mathrm{L}^{4}`) + ' und die Krümmung ' + t('R') + ' die Dimension ' + t(R`\mathrm{L}^{-2}`) + '. Das Integral ist also eine Fläche. Der Vorfaktor ' + t(R`c^{3}/G`) + ' hat die Dimension ' + t(R`\mathrm{M}\,\mathrm{T}^{-1}`) + ', und zusammen ergibt das ' + t(R`\mathrm{M}\,\mathrm{L}^{2}\,\mathrm{T}^{-1}`) + ' = J·s – genau die Einheit einer Wirkung und dieselbe wie die von ' + t(R`\hbar`) + '. Teilt man durch ' + t(R`\hbar`) + ', wie es die Quantentheorie im Exponenten ' + t(R`e^{iS/\hbar}`) + ' verlangt, bleibt</p>' +
      d(R`\frac{S}{\hbar} = \frac{1}{16\pi}\,\frac{1}{l_P^{2}}\int R\,\sqrt{-g}\;d^{4}x \qquad l_P^{2} = \frac{\hbar G}{c^{3}}`) +
      '<p>Die Wirkung der Raumzeit zählt Krümmung in Einheiten der Planck-Fläche. Solange Krümmungsradien riesig gegen ' + t(R`l_P \approx 1{,}6 \times 10^{-35}\,\mathrm{m}`) + ' sind, ist ' + t(R`S/\hbar`) + ' gigantisch, ein einziger klassischer Weg dominiert, und die Geometrie verhält sich klassisch. Erst wenn die Krümmung auf der Planck-Skala liegt, wird ' + t(R`S \sim \hbar`) + ', und viele Geometrien tragen gleichberechtigt bei – die Raumzeit selbst müsste „quanteln“. Genau dort beginnt das Problem aus ' + sec('gap', 'Abschnitt „Warum beide nicht zusammenpassen“') + '. ' + exp('planck', 'Zu den Planck-Einheiten') + '.</p>' +
      '<div class="honest"><b>Einordnung:</b> Die Einstein-Hilbert-Wirkung ist klassisch hervorragend bestätigt – sie <i>ist</i> die ART. Die Summe über alle Geometrien (' + t(R`\int \mathrm{D}g\; e^{iS/\hbar}`) + ') ist dagegen ein formaler Ausdruck, den bisher niemand im Allgemeinen sauber definieren oder ausrechnen kann.</div>',
  };

  /* ================== Abschnitt: Geschichte ================== */
  const TL = [
    ['1896–1900', 'Einstein studiert an der ETH Zürich. Einer seiner Mathematikprofessoren ist <b>Hermann Minkowski</b>. Einstein schwänzt viele Vorlesungen – Minkowski soll sich später gewundert haben, dass ausgerechnet dieser Student so etwas zustande bringt.'],
    ['1905', 'Einstein veröffentlicht die Spezielle Relativitätstheorie – in Worten und Formeln, aber ohne geometrisches Bild. Raum und Zeit sind bei ihm noch zwei Dinge, die sich gegenseitig beeinflussen.'],
    ['1905–1906', 'Unabhängig davon benennt <b>Henri Poincaré</b> die Lorentz-Transformationen, zeigt, dass sie eine Gruppe bilden, und findet die Größe ' + t(R`x^{2} + y^{2} + z^{2} - c^{2}t^{2}`) + ', die dabei unverändert bleibt. Er rechnet sogar mit einer imaginären Zeit als vierter Koordinate – denkt das aber nicht als Geometrie zu Ende.'],
    ['1907', 'Einsteins „glücklichster Gedanke“: Ein frei fallender Mensch spürt sein eigenes Gewicht nicht. Aus dem ' + sec('inertia', 'Äquivalenzprinzip') + ' wird der Weg zur ART.'],
    ['1907–1908', 'Minkowski, inzwischen in Göttingen, erkennt: Die SRT ist in Wahrheit <b>Geometrie in vier Dimensionen</b>. Er nimmt Poincarés vierte Koordinate wörtlich und macht daraus die Raumzeit mit Weltlinien, Lichtkegeln und einem durchgängigen Kalkül aus Vierervektoren – alles, was in ' + sec('idx', 'Abschnitt 4') + ' und ' + sec('tensor', '5') + ' vorkommt. Im September 1908 hält er in Köln den Vortrag „Raum und Zeit“.'],
    ['Jan. 1909', 'Minkowski stirbt mit 44 Jahren an einer Blinddarmentzündung. Er erlebt die ART nicht mehr.'],
    ['1912', 'Einstein merkt, dass Gravitation <b>gekrümmte</b> Raumzeit bedeutet – aber ihm fehlt die Mathematik. Sein Studienfreund, der Mathematiker <b>Marcel Grossmann</b>, zeigt ihm Riemanns Geometrie und den Tensorkalkül von Ricci-Curbastro und Levi-Civita.'],
    ['1913', 'Einstein und Grossmann veröffentlichen den „Entwurf“: fast richtig. Die korrekten, kovarianten Gleichungen hatten sie bereits in der Hand, verwarfen sie aber aus physikalischen Bedenken.'],
    ['Sommer 1915', 'Einstein hält in Göttingen Vorträge über seine Theorie. David Hilbert ist begeistert – und beginnt selbst daran zu arbeiten.'],
    ['Nov. 1915', 'Ein Wettlauf in Briefen und Sitzungen. Am 18. November erklärt Einstein die Periheldrehung des Merkur. Am 20. November reicht Hilbert seine Arbeit mit dem Wirkungsprinzip ein. Am 25. November legt Einstein der Preußischen Akademie die endgültigen Feldgleichungen vor.'],
    ['1916', 'Karl Schwarzschild findet – als Soldat an der Ostfront – die erste exakte Lösung: die ' + sec('idx', 'Metrik um eine Kugelmasse') + ', aus der später die Schwarzen Löcher werden. Er stirbt im selben Jahr.'],
    ['1918', '<b>Emmy Noether</b>, von Hilbert nach Göttingen geholt, klärt ein Rätsel der Energieerhaltung in der ART. Nebenbei beweist sie das <b>Noether-Theorem</b>: Jede Symmetrie einer Wirkung liefert eine Erhaltungsgröße. Zeitsymmetrie ergibt Energieerhaltung, Raumsymmetrie Impulserhaltung.'],
    ['1919', 'Eddingtons Sonnenfinsternis-Expedition misst die Lichtablenkung an der Sonne. Einstein wird über Nacht weltberühmt.'],
  ];
  const HISTORY = {
    id: 'history', title: 'Die Köpfe hinter der ART',
    body: () =>
      '<p>Die ART gilt als Einsteins Werk, und das zu Recht. Aber sie steht auf Fundamenten, die andere gegossen haben – und die gehen oft vergessen.</p>' +
      '<h3 class="th-h3">Henri Poincaré – der Vorläufer</h3>' +
      '<p>Der französische Mathematiker Henri Poincaré war an vielen Stellen schneller als Einstein und Minkowski. In seiner Arbeit über die Dynamik des Elektrons (Kurzfassung im Juni 1905, die ausführliche Fassung erschien 1906) gab er den Lorentz-Transformationen ihren Namen und zeigte, dass sie eine mathematische Gruppe bilden. Er bemerkte, dass dabei die Kombination</p>' +
      d(R`x^{2} + y^{2} + z^{2} - c^{2}t^{2}`) +
      '<p>unverändert bleibt, und behandelte die Zeit – mit der imaginären Einheit ' + t('i') + ' multipliziert – wie eine vierte Raumkoordinate. Damit lag der Kern der späteren Raumzeit auf dem Tisch. Nebenbei verlangte er, dass sich auch die Gravitation mit Lichtgeschwindigkeit ausbreitet, und sprach von Gravitationswellen. Den letzten Schritt ging er aber nicht: Die vierdimensionale Schreibweise blieb für ihn ein Rechenhilfsmittel, und eine konsequente Übersetzung der Physik in vierdimensionale Geometrie hielt er für viel Aufwand bei wenig Nutzen.</p>' +
      '<h3 class="th-h3">Hermann Minkowski – der Schmied der Raumzeit</h3>' +
      '<p>Einstein hatte 1905 gezeigt, <i>dass</i> sich Zeit und Länge für bewegte Beobachter ändern. Wo Poincaré ein Rechenhilfsmittel sah, nahm Minkowski die vierte Dimension wörtlich und zeigte, <i>was dahintersteckt</i>: Raum und Zeit sind zwei Richtungen eines einzigen, vierdimensionalen Gebildes. Zeitdilatation und Längenkontraktion sind darin einfach die Folge davon, dass verschiedene Beobachter dieselbe Raumzeit aus verschiedenen Winkeln „schneiden“ – so wie im ' + sec('tensor', 'Boost-Diagramm') + '. Seinen Kölner Vortrag von 1908 eröffnete er mit dem berühmten Satz:</p>' +
      '<blockquote class="th-quote">„Von Stund an sollen Raum für sich und Zeit für sich völlig zu Schatten herabsinken und nur noch eine Art Union der beiden soll Selbständigkeit bewahren.“<cite>Hermann Minkowski, Köln 1908</cite></blockquote>' +
      '<p>Einstein war davon zunächst nicht angetan. Überliefert ist, dass er die Vierdimensionalität als „überflüssige Gelehrsamkeit“ abtat. Er änderte seine Meinung gründlich: Ohne Minkowskis Geometrie wäre die ART undenkbar, denn die ART ist genau Minkowskis Raumzeit – nur <b>gekrümmt</b>. In seiner großen Zusammenfassung von 1916 würdigte Einstein ausdrücklich, dass Minkowskis Formulierung ihm den Weg erheblich erleichtert habe.</p>' +
      '<div class="callout"><b>Genau genommen:</b> Minkowski hat die ART nicht mehr erlebt – er starb 1909. Sein Beitrag ist die Bühne: die flache Raumzeit mit ihrer Metrik ' + t(R`\eta_{\mu\nu}`) + '. Einsteins Schritt war, diese Bühne selbst beweglich zu machen, ' + t(R`\eta_{\mu\nu} \to g_{\mu\nu}(x)`) + '.</div>' +
      '<h3 class="th-h3">Marcel Grossmann – der Übersetzer</h3>' +
      '<p>Oft übersehen: Der Physiker Einstein konnte 1912 die nötige Mathematik schlicht nicht. Grossmann, sein Kommilitone, der ihm schon im Studium seine Mitschriften geliehen hatte, fand in der Bibliothek, was Einstein brauchte: Riemanns gekrümmte Geometrie und den Tensorkalkül. Ohne ihn keine Tensoren in der ART.</p>' +
      '<h3 class="th-h3">David Hilbert – der Mathematiker im Wettlauf</h3>' +
      '<p>Hilbert war der vielleicht einflussreichste Mathematiker seiner Zeit und machte Göttingen zum Zentrum der mathematischen Welt. Er wollte die Physik auf ein axiomatisches Fundament stellen. Nach Einsteins Göttinger Vorträgen 1915 arbeitete er parallel an der Gravitation, und beide schrieben sich in diesen Wochen intensiv. Hilberts Beitrag ist die ' + sec('action', 'Wirkung') + ': Er leitete die Gleichungen als Erster aus einem Variationsprinzip ab.</p>' +
      '<p>Wer zuerst die richtigen Feldgleichungen hatte, war lange umstritten. Hilberts Arbeit ist fünf Tage vor Einsteins letztem Vortrag eingereicht. 1997 aufgetauchte Druckfahnen deuten aber darauf hin, dass Hilbert seine Arbeit vor der Veröffentlichung noch überarbeitet hat und die explizite, endgültige Form der Gleichungen in der ursprünglichen Fassung fehlte. Ganz geklärt ist das nicht, weil ein Stück der Druckfahnen fehlt. Der heutige Konsens: <b>Die Feldgleichungen sind Einsteins, das Wirkungsprinzip ist Hilberts</b> – daher der Doppelname. Hilbert selbst hat Einstein die Theorie nie streitig gemacht und ihn stets als deren Urheber bezeichnet.</p>' +
      '<h3 class="th-h3">Zeitleiste</h3>' +
      '<ol class="th-tl">' + TL.map(([y, x]) => '<li><span class="th-tl-y">' + esc(y) + '</span><div>' + x + '</div></li>').join('') + '</ol>' +
      '<div class="honest"><b>Hinweis zu den Anekdoten:</b> Die Zitate und Einzelheiten zu den Begegnungen sind überwiegend durch Briefe und Erinnerungen von Zeitgenossen überliefert. Minkowskis Satz aus dem Kölner Vortrag ist wörtlich belegt, die übrigen Aussprüche sind sinngemäß wiedergegeben.</div>',
  };

  const list = U.theory.sections;
  const at = list.findIndex((s) => s.id === 'tensor');
  list.splice(at + 1, 0, ACTION, HISTORY);
})(globalThis.PP = globalThis.PP || {});
