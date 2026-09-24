/* =====================================================================
   Physics Playground — Grundlagen, Teil 4: Entropie
   Clausius, Boltzmann/Gibbs, Shannon, von Neumann, Bekenstein-Hawking,
   Wald – plus die häufigsten Verwechslungen. Interaktiv: Ehrenfest-Modell
   (Teilchen springen zufällig zwischen zwei Kammerhälften).
   Hängt sich hinter den Quantenmechanik-Abschnitt in U.theory.sections.
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

  /* ============ Widget: Mikrozustände zählen (Ehrenfest-Modell) ============ */
  const LNF = [0];
  for (let i = 1; i <= 200; i++) LNF[i] = LNF[i - 1] + Math.log(i);
  const lnC = (n, k) => LNF[n] - LNF[k] - LNF[n - k];
  function fmtBig(ln) {           // ln(x) → schön formatierte Zahl
    const l10 = ln / Math.LN10;
    if (l10 < 6) return Math.round(Math.exp(ln)).toLocaleString(I.locale());
    const e = Math.floor(l10), m = Math.pow(10, l10 - e);
    return I.dec(m.toFixed(2)) + ' × 10<sup>' + e + '</sup>';
  }
  const f2 = (x) => I.dec(x.toFixed(2));

  function entHTML() {
    return '<div class="tw" id="tw-ent">' +
      '<div class="tw-ctrl"><div class="seg" role="tablist">' + [4, 10, 50, 100].map((n) => '<button data-n="' + n + '"' + (n === 50 ? ' class="on"' : '') + '>N = ' + n + '</button>').join('') + '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn" id="te-reset">' + T('Alle nach links', 'All to the left') + '</button><button class="btn" id="te-play"></button></div></div>' +
      '<canvas class="tw-canvas" id="te-cv" style="height:380px" role="img" aria-label="' + T('Teilchen in zwei Kammerhälften und Zahl der Mikrozustände', 'Particles in two halves of a box and the number of microstates') + '"></canvas>' +
      '<div class="tw-read" id="te-read"></div></div>';
  }
  function mountEnt(root) {
    const box = root.querySelector('#tw-ent');
    if (!box) return null;
    const cv = box.querySelector('#te-cv'), play = box.querySelector('#te-play');
    const st = { N: 50, parts: [], hist: [], playing: !S.paused, acc: 0, clock: 0 };
    let ro = null, lastRead = '';
    const rnd = Math.random;
    function place(p, side) { p.side = side; p.tx = side ? 0.53 + rnd() * 0.44 : 0.03 + rnd() * 0.44; p.ty = 0.05 + rnd() * 0.9; }
    function reset() {
      st.parts = [];
      for (let i = 0; i < st.N; i++) { const p = {}; place(p, 0); p.x = p.tx; p.y = p.ty; st.parts.push(p); }
      st.hist = [st.N];
    }
    const nLeft = () => st.parts.reduce((a, p) => a + (p.side ? 0 : 1), 0);
    function jump() {                                  // ein zufälliges Teilchen wechselt die Seite
      const p = st.parts[Math.floor(rnd() * st.N)];
      place(p, 1 - p.side);
      st.hist.push(nLeft());
      if (st.hist.length > 400) st.hist.shift();
    }
    function sync() {
      play.textContent = st.playing ? T('❚❚ Anhalten', '❚❚ Pause') : T('▶ Laufen lassen', '▶ Run');
      box.querySelectorAll('[data-n]').forEach((b) => b.classList.toggle('on', +b.getAttribute('data-n') === st.N));
    }
    function draw() {
      const C = PP.colors();
      const dpr = globalThis.devicePixelRatio || 1;
      const W = cv.clientWidth || 640;
      const narrow = W < 560;
      const wantH = narrow ? 540 : 380;
      if (cv.clientHeight !== wantH) cv.style.height = wantH + 'px';
      const H = wantH;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const nL = nLeft();
      readout(nL);
      const ctx = cv.getContext && cv.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.font = '12px ' + C.mono;
      const pad = 12;
      const Bx = narrow ? { x: pad, y: pad, w: W - 2 * pad, h: 170 } : { x: pad, y: pad, w: W * 0.44, h: 230 };
      const Hx = narrow ? { x: pad + 30, y: 232, w: W - 2 * pad - 36, h: 140 } : { x: W * 0.44 + 60, y: pad + 16, w: W * 0.56 - 76, h: 196 };
      const Tx = narrow ? { x: pad + 30, y: 424, w: W - 2 * pad - 36, h: 92 } : { x: pad + 30, y: 282, w: W - 2 * pad - 36, h: 70 };
      // --- Kasten ---
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.strokeRect(Bx.x, Bx.y, Bx.w, Bx.h);
      ctx.save(); ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(Bx.x + Bx.w / 2, Bx.y); ctx.lineTo(Bx.x + Bx.w / 2, Bx.y + Bx.h); ctx.stroke(); ctx.restore();
      const r = st.N > 60 ? 3 : st.N > 20 ? 4.5 : 7;
      st.parts.forEach((p) => {
        ctx.fillStyle = p.side ? C.cyan : C.accent;
        ctx.beginPath(); ctx.arc(Bx.x + p.x * Bx.w, Bx.y + p.y * Bx.h, r, 0, 7); ctx.fill();
      });
      ctx.fillStyle = C.accent; ctx.fillText(T('links ', 'left ') + nL, Bx.x + 6, Bx.y + Bx.h + 16);
      ctx.fillStyle = C.cyan; const rt = T('rechts ', 'right ') + (st.N - nL); ctx.fillText(rt, Bx.x + Bx.w - ctx.measureText(rt).width - 6, Bx.y + Bx.h + 16);
      // --- Ω(n) ---
      const lnMax = lnC(st.N, Math.floor(st.N / 2));
      ctx.fillStyle = C.ink3; ctx.fillText(narrow ? T('Ω(n): Mikrozustände, n Teilchen links', 'Ω(n): microstates, n particles on the left') : T('Ω(n) – Zahl der Mikrozustände mit n Teilchen links', 'Ω(n) – number of microstates with n particles on the left'), Hx.x - 30, Hx.y - 6);
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(Hx.x, Hx.y + 4); ctx.lineTo(Hx.x, Hx.y + Hx.h); ctx.lineTo(Hx.x + Hx.w, Hx.y + Hx.h); ctx.stroke();
      const bw = Hx.w / (st.N + 1);
      for (let n = 0; n <= st.N; n++) {
        const v = Math.exp(lnC(st.N, n) - lnMax), h = v * (Hx.h - 8);
        ctx.fillStyle = n === nL ? C.accent : C.violet;
        ctx.globalAlpha = n === nL ? 1 : 0.55;
        ctx.fillRect(Hx.x + n * bw + bw * 0.12, Hx.y + Hx.h - h, Math.max(1, bw * 0.76), Math.max(h, n === nL ? 2 : 0));
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.ink3;
      ctx.fillText('0', Hx.x - 3, Hx.y + Hx.h + 14); const nt = String(st.N); ctx.fillText(nt, Hx.x + Hx.w - ctx.measureText(nt).width, Hx.y + Hx.h + 14);
      ctx.fillText('n', Hx.x + Hx.w / 2 - 3, Hx.y + Hx.h + 14);
      // --- Zeitverlauf ---
      ctx.fillStyle = C.ink3; ctx.fillText(T('Verlauf: Teilchen links', 'History: particles on the left'), Tx.x - 30, Tx.y - 6);
      ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(Tx.x, Tx.y); ctx.lineTo(Tx.x, Tx.y + Tx.h); ctx.lineTo(Tx.x + Tx.w, Tx.y + Tx.h); ctx.stroke();
      ctx.save(); ctx.setLineDash([3, 4]); ctx.globalAlpha = 0.6; const ym = Tx.y + Tx.h / 2;
      ctx.beginPath(); ctx.moveTo(Tx.x, ym); ctx.lineTo(Tx.x + Tx.w, ym); ctx.stroke(); ctx.restore();
      ctx.fillText(String(st.N), Tx.x - 26, Tx.y + 8); ctx.fillText('N/2', Tx.x - 28, ym + 4);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 1.6; ctx.beginPath();
      st.hist.forEach((v, i) => { const p = [Tx.x + i / 400 * Tx.w, Tx.y + Tx.h - v / st.N * Tx.h]; if (i) ctx.lineTo(...p); else ctx.moveTo(...p); });
      ctx.stroke();
    }
    function readout(nL) {
      const lnO = lnC(st.N, nL);
      const h =
        '<div><span class="faint">' + T('Makrozustand', 'Macrostate') + '</span> ' + nL + T(' links · ', ' left · ') + (st.N - nL) + T(' rechts', ' right') + '</div>' +
        '<div><span class="faint">' + T('Mikrozustände', 'Microstates') + '</span> Ω = <b>' + fmtBig(lnO) + '</b></div>' +
        '<div class="inv"><span class="faint">Boltzmann</span> S / k<sub>B</sub> = ln Ω = ' + f2(lnO) + '</div>' +
        '<div class="inv"><span class="faint">Shannon</span> log<sub>2</sub> Ω = ' + f2(lnO / Math.LN2) + ' bit</div>' +
        '<div><span class="faint">' + T('Maximum bei n = N/2', 'Maximum at n = N/2') + '</span> S<sub>max</sub> / k<sub>B</sub> = ' + f2(lnC(st.N, Math.floor(st.N / 2))) + '</div>' +
        '<div><span class="faint">' + T('Chance „alle links“', 'Odds of “all on the left”') + '</span> 1 : ' + fmtBig(st.N * Math.LN2) + '</div>';
      if (h !== lastRead) { box.querySelector('#te-read').innerHTML = h; lastRead = h; }
    }
    // true, solange sich etwas bewegt: Sprünge im Lauf oder Teilchen, die noch zu ihrem Platz gleiten
    function step(dt) {
      let moved = false;
      if (st.playing) {
        st.acc += dt * Math.max(6, st.N * 0.35);          // Sprünge pro Sekunde
        while (st.acc >= 1) { jump(); st.acc -= 1; }
        moved = true;
      }
      const k = 1 - Math.exp(-dt * 7);
      st.parts.forEach((p) => {
        const dx = p.tx - p.x, dy = p.ty - p.y;
        if (Math.abs(dx) > 1e-4 || Math.abs(dy) > 1e-4) { p.x += dx * k; p.y += dy * k; moved = true; }
        if (st.playing) { p.ty = Math.max(0.04, Math.min(0.96, p.ty + (rnd() - 0.5) * 0.01)); }
      });
      return moved;
    }
    box.addEventListener('click', (e) => {
      const nb = e.target.closest('[data-n]');
      if (nb) { st.N = +nb.getAttribute('data-n'); reset(); sync(); draw(); return; }
      if (e.target.id === 'te-reset') { reset(); draw(); }
      if (e.target === play) { st.playing = !st.playing; sync(); loop.invalidate(); }
    });
    const loop = U.widgetLoop(box, { step, draw, onPause: (p) => { st.playing = !p; sync(); } });
    if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(() => loop.invalidate()); ro.observe(cv); }
    reset(); sync(); draw();
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

  /* ================== Abschnitt ================== */
  const OVERVIEW = () => '<div class="th-scroll"><table class="t th-cmp"><thead><tr><th>Name</th><th>' + T('Formel', 'Formula') + '</th><th>' + T('Was wird gemessen?', 'What is measured?') + '</th><th>' + T('Einheit', 'Unit') + '</th></tr></thead><tbody>' +
    [['Clausius (1865)', R`dS = \delta Q_{\text{rev}}/T`, T('umkehrbar ausgetauschte Wärme pro Temperatur', 'heat exchanged reversibly per temperature'), 'J/K'],
      ['Boltzmann (1877)', R`S = k_B \ln \Omega`, T('Zahl der Mikrozustände eines Makrozustands', 'number of microstates of a macrostate'), 'J/K'],
      ['Gibbs (1902)', R`S = -k_B \sum p_i \ln p_i`, T('dasselbe mit ungleichen Wahrscheinlichkeiten', 'the same with unequal probabilities'), 'J/K'],
      ['Shannon (1948)', R`H = -\sum p_i \log_{2} p_i`, T('fehlende Information / Überraschung', 'missing information / surprise'), 'bit'],
      ['von Neumann (1932)', R`S = -k_B\,\mathrm{Tr}(\rho\ln\rho)`, T('Unwissen über einen Quantenzustand; Verschränkung', 'ignorance about a quantum state; entanglement'), T('J/K oder bit', 'J/K or bit')],
      [T('Bekenstein-Hawking (1974)', 'Bekenstein–Hawking (1974)'), R`S = k_B A / 4 l_P^{2}`, T('Entropie eines Schwarzen Lochs, aus der Horizontfläche', 'entropy of a black hole, from the horizon area'), 'J/K'],
      ['Wald (1993)', T(R`S = \text{Noether-Ladung}`, R`S = \text{Noether charge}`), T('Verallgemeinerung auf beliebige Gravitationstheorien', 'generalisation to arbitrary theories of gravity'), 'J/K']]
      .map(([a, b, c, e]) => '<tr><td style="white-space:nowrap">' + a + '</td><td style="white-space:nowrap">' + t(b) + '</td><td>' + c + '</td><td>' + e + '</td></tr>').join('') +
    '</tbody></table></div>';

  const ENTROPY = {
    id: 'entropy', title: { de: 'Entropie – ein Wort, viele Bedeutungen', en: 'Entropy – one word, many meanings' },
    mount: mountEnt,
    body: {
      de: () =>
        '<p>Kaum ein Begriff der Physik wird so oft benutzt und so oft missverstanden. Das liegt auch daran, dass „Entropie“ heute gut ein halbes Dutzend verschiedene, aber verwandte Größen bezeichnet. Sie wurden über hundert Jahre hinweg in ganz unterschiedlichen Gebieten erfunden.</p>' +
        '<p class="th-lead">Zuerst zum Ausprobieren, was Entropie im Kleinen bedeutet: Alle Teilchen starten links, dann springt jeweils ein zufälliges Teilchen auf die andere Seite. Das Modell zählt, auf wie viele Arten Ω sich jeder Stand verwirklichen lässt – Physiker sagen: wie viele <b>Mikrozustände</b> zu einem <b>Makrozustand</b> gehören.</p>' +
        entHTML() +
        '<p>Das System läuft zur Mitte und bleibt dort, weil dort fast alle Mikrozustände liegen. Die Teilchen „wollen“ nichts, es gibt einfach überwältigend mehr Möglichkeiten, halb verteilt zu sein. Bei ' + t('N = 4') + ' kehrt der Zustand „alle links“ oft zurück. Bei ' + t('N = 100') + ' stehen die Chancen 1 zu 10³⁰. In einem Liter Luft sind es rund 10²² Moleküle. Der zweite Hauptsatz ist also <b>kein Naturgesetz im strengen Sinn, sondern Statistik</b> – aber eine, deren Ausnahmen man in der Lebensdauer des Universums nie beobachten wird.</p>' +

        '<h3 class="th-h3">1865 – Clausius: der Begriff entsteht</h3>' +
        '<p>Rudolf Clausius suchte eine Größe, die beschreibt, warum Wärme von selbst nur vom Warmen zum Kalten fließt. Er definierte sie über die Wärme ' + t(R`\delta Q`) + ', die bei der Temperatur ' + t('T') + ' umkehrbar zugeführt wird:</p>' +
        d(R`dS = \frac{\delta Q_{\text{rev}}}{T} \qquad [S] = \mathrm{J/K}`) +
        '<p>Den Namen bildete er bewusst aus dem griechischen <i>tropē</i> (Wendung, Verwandlung) und wählte ihn so, dass er dem Wort „Energie“ möglichst ähnlich klingt – die beiden Größen seien in ihrer Bedeutung so verwandt, dass auch ihre Namen verwandt sein sollten. Seine Arbeit schließt mit zwei Sätzen, die die Thermodynamik zusammenfassen:</p>' +
        '<blockquote class="th-quote">„Die Energie der Welt ist constant. Die Entropie der Welt strebt einem Maximum zu.“<cite>Rudolf Clausius, 1865</cite></blockquote>' +
        '<p>Clausius’ Entropie ist rein <b>makroskopisch</b>: Man misst Wärme und Temperatur. Was sie „ist“, sagt die Definition nicht.</p>' +

        '<h3 class="th-h3">1877 – Boltzmann: Entropie heißt Abzählen</h3>' +
        '<p>Ludwig Boltzmann fand die mikroskopische Bedeutung. Ein <b>Makrozustand</b> (Druck, Temperatur, „wie viele Teilchen links“) lässt sich durch sehr viele <b>Mikrozustände</b> verwirklichen – verschiedene Anordnungen der einzelnen Teilchen, die von außen gleich aussehen. Die Entropie zählt diese Anordnungen:</p>' +
        d(R`S = k_B \ln \Omega`) +
        '<p>' + t('k_B') + ' rechnet nur die Einheiten auf J/K um. Die Formel ist auf Boltzmanns Grab in Wien eingraviert; in genau dieser Form aufgeschrieben hat sie allerdings erst Max Planck. Genau diese Anordnungen Ω zählt das Modell oben.</p>' +
        '<p>Josiah Willard Gibbs verallgemeinerte die Formel auf Mikrozustände, die nicht alle gleich wahrscheinlich sind:</p>' +
        d(R`S = -k_B \sum_{i} p_i \ln p_i`) +

        '<h3 class="th-h3">1948 – Shannon: Entropie als Information</h3>' +
        '<p>Der Ingenieur Claude Shannon suchte bei den Bell Labs ein Maß dafür, wie viel Information eine Nachricht trägt – oder anders: wie überrascht man im Schnitt ist, wenn man sie liest. Heraus kam dieselbe Formel ohne ' + t('k_B') + ':</p>' +
        d(R`H = -\sum_{i} p_i \log_{2} p_i \qquad [H] = \text{bit}`) +
        '<p>Eine faire Münze hat 1 bit, eine gezinkte, die immer Kopf zeigt, 0 bit. Überliefert ist, dass John von Neumann Shannon zum Namen „Entropie“ geraten habe – die Formel sehe ohnehin so aus, und niemand wisse wirklich, was Entropie sei, man habe in jeder Diskussion also den Vorteil. Die Verbindung ist tiefer als ein Wortspiel: Die thermodynamische Entropie ist die Shannon-Information, die einem über den Mikrozustand fehlt, umgerechnet mit ' + t(R`k_B \ln 2`) + ' pro bit. Das Widget oben zeigt beide Zahlen nebeneinander.</p>' +
        '<p>Dass das physikalisch ernst gemeint ist, zeigt das <b>Landauer-Prinzip</b> (1961): Das Löschen von einem bit Information erzeugt mindestens ' + t(R`k_B T \ln 2`) + ' Wärme. 2012 wurde das im Labor mit einem einzelnen Kolloid-Teilchen bestätigt. Information ist physikalisch.</p>' +

        '<h3 class="th-h3 th-deep">1927/32 – von Neumann: Entropie der Quantenwelt</h3>' +
        '<p>In der Quantenmechanik ersetzt die Dichtematrix ' + t(R`\rho`) + ' die Wahrscheinlichkeiten ' + t('p_i') + ':</p>' +
        d(R`S = -k_B\, \mathrm{Tr}\left(\rho \ln \rho\right)`) +
        '<p>Ein vollständig bekannter Quantenzustand hat die Entropie null. Das Überraschende kommt mit der ' + sec('qm', 'Verschränkung') + ': Sind zwei Teilchen verschränkt, hat das Paar als Ganzes die Entropie null, jedes einzelne Teilchen für sich aber eine positive. Man weiß alles über das Ganze und trotzdem nicht alles über die Teile. Diese <b>Verschränkungsentropie</b> ist heute ein zentrales Werkzeug der Quanteninformation – und der Quantengravitation.</p>' +

        '<h3 class="th-h3">1972–1975 – Bekenstein und Hawking: die Entropie Schwarzer Löcher</h3>' +
        '<p>John Wheeler stellte seinem Doktoranden Jacob Bekenstein eine scheinbar harmlose Frage: Wenn man eine Tasse heißen Tee in ein Schwarzes Loch kippt, ist ihre Entropie verschwunden – wird dann der zweite Hauptsatz verletzt? Bekensteins Antwort: Nein, denn das Schwarze Loch muss selbst Entropie haben, und zwar proportional zur <b>Fläche</b> seines Horizonts. Hawking hielt das zunächst für falsch – bis er 1974 selbst zeigte, dass Schwarze Löcher eine Temperatur haben und strahlen. Damit war auch der Vorfaktor festgelegt:</p>' +
        d(R`S_{BH} = \frac{k_B\, c^{3} A}{4 G \hbar} = k_B\,\frac{A}{4\, l_P^{2}}`) +
        '<p>Auf vier Planck-Flächen kommt also eine Einheit ' + t('k_B') + ', umgerechnet etwa 0,36 bit pro Planck-Fläche. Das ist gewaltig: Ein Schwarzes Loch mit der Masse der Sonne hätte etwa ' + t(R`10^{77}\,k_B`) + ', die Sonne selbst hat rund ' + t(R`10^{58}\,k_B`) + '. Für ihre Größe sind Schwarze Löcher die entropiereichsten Objekte, die es geben kann. ' + exp('bh-entropy', 'Zum Experiment Bekenstein-Hawking-Entropie') + '.</p>' +
        '<p>Dass die Entropie mit der <i>Fläche</i> wächst und nicht mit dem Volumen, ist rätselhaft. Bei jedem gewöhnlichen System ist es umgekehrt. Daraus entstand das <b>holographische Prinzip</b>: die Vermutung, dass die Information in einem Raumgebiet grundsätzlich auf dessen Rand passt. In dieser Formel stehen ' + t('c') + ', ' + t('G') + ', ' + t(R`\hbar`) + ' und ' + t('k_B') + ' gleichzeitig. Sie ist einer der wenigen festen Anhaltspunkte, die jede künftige Quantengravitation reproduzieren muss.</p>' +

        '<h3 class="th-h3 th-deep">1993 – Wald: Entropie aus der Wirkung</h3>' +
        '<p>Robert Wald stellte die Frage allgemeiner: Woher kommt die Formel ' + t('A/4') + ' eigentlich? Seine Antwort: Die Entropie eines Schwarzen Lochs ist eine <b>Noether-Ladung</b>. Man erhält sie aus der ' + sec('action', 'Wirkung') + ' und der Zeitverschiebungs-Symmetrie am Horizont – mit derselben Idee, mit der ' + sec('history', 'Emmy Noether') + ' Energieerhaltung erklärt hat. Für die Einstein-Hilbert-Wirkung kommt genau ' + t('A/4') + ' heraus. Für abgewandelte Gravitationstheorien mit zusätzlichen Krümmungstermen liefert die <b>Wald-Entropie</b> Korrekturen. Die Flächenformel ist also eine Eigenschaft von Einsteins Theorie, die Wald-Formel die allgemeine Regel dahinter.</p>' +

        '<h3 class="th-h3">Alle auf einen Blick</h3>' + OVERVIEW() +

        '<h3 class="th-h3">Die häufigsten Verwechslungen</h3>' +
        '<p><b>„Entropie ist Unordnung.“</b> Das ist eine Eselsbrücke, die oft in die Irre führt. Entropie zählt Möglichkeiten, nicht Unordnung. Harte Kugeln, die man dicht genug packt, ordnen sich von selbst zu einem Kristall – <i>weil</i> dabei die Entropie steigt: Im geordneten Gitter hat jede Kugel mehr Spielraum zum Wackeln. Und unter Gravitation ist es genau umgekehrt wie im Gas im Kasten: Ein gleichmäßig verteiltes Gas hat <i>niedrige</i> Entropie, und Klumpen – Sterne, Galaxien, am Ende Schwarze Löcher – erhöhen sie.</p>' +
        '<p><b>Shannon- und thermodynamische Entropie gleichsetzen.</b> Die Formeln gleichen sich, aber die Shannon-Entropie ist eine Eigenschaft einer <i>Wahrscheinlichkeitsverteilung</i>, also einer Beschreibung. Die thermodynamische ist der Spezialfall, in dem die Verteilung die physikalischen Mikrozustände eines Systems im Gleichgewicht meint. Die Entropie eines Textes hat mit der Wärme im Papier nichts zu tun.</p>' +
        '<p><b>„Entropie ist eine Form von Energie.“</b> Nein. Entropie hat die Einheit J/K, erst ' + t('T S') + ' ist eine Energie – der Teil der Energie, der sich nicht mehr in Arbeit umwandeln lässt.</p>' +
        '<p><b>„Entropie steigt immer.“</b> Nur in einem abgeschlossenen System und nur im statistischen Mittel. Lokal sinkt sie ständig: im Kühlschrank, in jeder lebenden Zelle – auf Kosten von mehr Entropie anderswo. Und subtiler: Die von-Neumann-Entropie eines vollständig abgeschlossenen Quantensystems bleibt <i>exakt konstant</i>. Dass wir trotzdem einen Anstieg sehen, liegt daran, dass wir nur Teile beobachten oder grob hinschauen. Warum das Universum mit so niedriger Entropie begonnen hat, dass es überhaupt einen Zeitpfeil gibt, ist eine offene Frage der Kosmologie.</p>' +
        '<p><b>„Schwarze Löcher vernichten Information.“</b> Das war Hawkings ursprüngliche Schlussfolgerung und ist genau das ' + sec('gap', 'Informationsparadoxon') + '. Die Mehrheit der Forschenden erwartet heute, dass die Information in der Hawking-Strahlung wieder herauskommt. Rechnungen zur Verschränkungsentropie der Strahlung haben seit 2019 starke Hinweise dafür geliefert – vollständig verstanden ist der Mechanismus aber noch nicht.</p>' +
        '<div class="honest"><b>Der rote Faden:</b> Alle diese Entropien messen im Kern dasselbe – wie viel man über ein System <i>nicht</i> weiß, gegeben das, was man weiß. Sie unterscheiden sich darin, was man als „die Möglichkeiten“ zählt: Wärme, Teilchenanordnungen, Nachrichten, Quantenzustände oder Geometrien.</div>',
      en: () =>
        '<p>Hardly any concept in physics is used so often and misunderstood so often. One reason is that “entropy” today refers to a good half-dozen different but related quantities. They were invented over a hundred years in quite different fields.</p>' +
        '<p class="th-lead">First, something to try out – what entropy means on a small scale: all particles start on the left, then one random particle at a time jumps to the other side. The model counts in how many ways Ω each state can be realised – physicists say: how many <b>microstates</b> belong to a <b>macrostate</b>.</p>' +
        entHTML() +
        '<p>The system runs to the middle and stays there, because that is where almost all the microstates are. The particles do not “want” anything; there are simply overwhelmingly more ways of being spread out half and half. With ' + t('N = 4') + ', the state “all on the left” returns often. With ' + t('N = 100') + ', the odds are 1 in 10³⁰. A litre of air contains around 10²² molecules. So the second law is <b>not a law of nature in the strict sense but statistics</b> – but statistics whose exceptions you will never observe in the lifetime of the universe.</p>' +

        '<h3 class="th-h3">1865 – Clausius: the concept is born</h3>' +
        '<p>Rudolf Clausius was looking for a quantity that describes why heat flows by itself only from hot to cold. He defined it through the heat ' + t(R`\delta Q`) + ' that is supplied reversibly at temperature ' + t('T') + ':</p>' +
        d(R`dS = \frac{\delta Q_{\text{rev}}}{T} \qquad [S] = \mathrm{J/K}`) +
        '<p>He deliberately formed the name from the Greek <i>tropē</i> (turning, transformation) and chose it to sound as much as possible like the word “energy” – the two quantities, he argued, were so closely related in meaning that their names should be related too. His paper ends with two sentences that sum up thermodynamics:</p>' +
        '<blockquote class="th-quote">“The energy of the universe is constant. The entropy of the universe tends to a maximum.”<cite>Rudolf Clausius, 1865</cite></blockquote>' +
        '<p>Clausius’ entropy is purely <b>macroscopic</b>: you measure heat and temperature. The definition does not say what it “is”.</p>' +

        '<h3 class="th-h3">1877 – Boltzmann: entropy means counting</h3>' +
        '<p>Ludwig Boltzmann found the microscopic meaning. A <b>macrostate</b> (pressure, temperature, “how many particles are on the left”) can be realised by a great many <b>microstates</b> – different arrangements of the individual particles that look the same from outside. Entropy counts these arrangements:</p>' +
        d(R`S = k_B \ln \Omega`) +
        '<p>' + t('k_B') + ' merely converts the units to J/K. The formula is engraved on Boltzmann’s grave in Vienna, although it was Max Planck who first wrote it down in exactly this form. These are exactly the arrangements Ω that the model above counts.</p>' +
        '<p>Josiah Willard Gibbs generalised the formula to microstates that are not all equally likely:</p>' +
        d(R`S = -k_B \sum_{i} p_i \ln p_i`) +

        '<h3 class="th-h3">1948 – Shannon: entropy as information</h3>' +
        '<p>At Bell Labs, the engineer Claude Shannon was looking for a measure of how much information a message carries – or put differently: how surprised you are, on average, when you read it. Out came the same formula without ' + t('k_B') + ':</p>' +
        d(R`H = -\sum_{i} p_i \log_{2} p_i \qquad [H] = \text{bit}`) +
        '<p>A fair coin has 1 bit; a rigged one that always shows heads has 0 bits. John von Neumann is said to have advised Shannon to call it “entropy” – the formula looked like it anyway, and nobody really knew what entropy was, so he would always have the advantage in a debate. The connection runs deeper than a pun: thermodynamic entropy is the Shannon information you are missing about the microstate, converted at ' + t(R`k_B \ln 2`) + ' per bit. The widget above shows both numbers side by side.</p>' +
        '<p>That this is meant physically is shown by <b>Landauer’s principle</b> (1961): erasing one bit of information produces at least ' + t(R`k_B T \ln 2`) + ' of heat. In 2012 this was confirmed in the lab with a single colloidal particle. Information is physical.</p>' +

        '<h3 class="th-h3 th-deep">1927/32 – von Neumann: the entropy of the quantum world</h3>' +
        '<p>In quantum mechanics, the density matrix ' + t(R`\rho`) + ' replaces the probabilities ' + t('p_i') + ':</p>' +
        d(R`S = -k_B\, \mathrm{Tr}\left(\rho \ln \rho\right)`) +
        '<p>A completely known quantum state has zero entropy. The surprise comes with ' + sec('qm', 'entanglement') + ': if two particles are entangled, the pair as a whole has zero entropy, but each particle on its own has a positive entropy. You know everything about the whole and yet not everything about the parts. This <b>entanglement entropy</b> is now a central tool of quantum information – and of quantum gravity.</p>' +

        '<h3 class="th-h3">1972–1975 – Bekenstein and Hawking: the entropy of black holes</h3>' +
        '<p>John Wheeler put a seemingly harmless question to his doctoral student Jacob Bekenstein: if you tip a cup of hot tea into a black hole, its entropy has vanished – is the second law violated? Bekenstein’s answer: no, because the black hole must itself have entropy, proportional to the <b>area</b> of its horizon. Hawking thought this was wrong at first – until in 1974 he himself showed that black holes have a temperature and radiate. That also fixed the prefactor:</p>' +
        d(R`S_{BH} = \frac{k_B\, c^{3} A}{4 G \hbar} = k_B\,\frac{A}{4\, l_P^{2}}`) +
        '<p>So every four Planck areas contribute one unit of ' + t('k_B') + ', which works out at about 0.36 bits per Planck area. That is enormous: a black hole with the mass of the Sun would have about ' + t(R`10^{77}\,k_B`) + ', while the Sun itself has around ' + t(R`10^{58}\,k_B`) + '. For their size, black holes are the most entropy-rich objects there can be. ' + exp('bh-entropy', 'To the Bekenstein–Hawking entropy experiment') + '.</p>' +
        '<p>That the entropy grows with the <i>area</i> and not with the volume is puzzling. For every ordinary system it is the other way round. This gave rise to the <b>holographic principle</b>: the conjecture that the information in a region of space fundamentally fits on its boundary. The formula contains ' + t('c') + ', ' + t('G') + ', ' + t(R`\hbar`) + ' and ' + t('k_B') + ' all at once. It is one of the few firm reference points that any future theory of quantum gravity has to reproduce.</p>' +

        '<h3 class="th-h3 th-deep">1993 – Wald: entropy from the action</h3>' +
        '<p>Robert Wald asked the question more generally: where does the formula ' + t('A/4') + ' actually come from? His answer: the entropy of a black hole is a <b>Noether charge</b>. You get it from the ' + sec('action', 'action') + ' and the time-translation symmetry at the horizon – with the same idea that ' + sec('history', 'Emmy Noether') + ' used to explain energy conservation. For the Einstein–Hilbert action, exactly ' + t('A/4') + ' comes out. For modified theories of gravity with additional curvature terms, the <b>Wald entropy</b> gives corrections. So the area formula is a property of Einstein’s theory, and Wald’s formula the general rule behind it.</p>' +

        '<h3 class="th-h3">All of them at a glance</h3>' + OVERVIEW() +

        '<h3 class="th-h3">The most common mix-ups</h3>' +
        '<p><b>“Entropy is disorder.”</b> That is a mnemonic that often leads you astray. Entropy counts possibilities, not disorder. Hard spheres packed densely enough arrange themselves into a crystal on their own – <i>because</i> entropy increases in the process: in the ordered lattice, each sphere has more room to jiggle. And under gravity it is exactly the other way round from a gas in a box: an evenly spread gas has <i>low</i> entropy, and clumping – stars, galaxies, ultimately black holes – increases it.</p>' +
        '<p><b>Equating Shannon and thermodynamic entropy.</b> The formulas look alike, but Shannon entropy is a property of a <i>probability distribution</i>, i.e. of a description. Thermodynamic entropy is the special case in which the distribution refers to the physical microstates of a system in equilibrium. The entropy of a text has nothing to do with the heat in the paper.</p>' +
        '<p><b>“Entropy is a form of energy.”</b> No. Entropy has the unit J/K; only ' + t('T S') + ' is an energy – the part of the energy that can no longer be turned into work.</p>' +
        '<p><b>“Entropy always increases.”</b> Only in an isolated system, and only on statistical average. Locally it decreases all the time: in a refrigerator, in every living cell – at the cost of more entropy elsewhere. And more subtly: the von Neumann entropy of a completely isolated quantum system stays <i>exactly constant</i>. That we still see an increase is because we only observe parts, or look only coarsely. Why the universe began with such low entropy that there is an arrow of time at all is an open question in cosmology.</p>' +
        '<p><b>“Black holes destroy information.”</b> That was Hawking’s original conclusion, and it is exactly the ' + sec('gap', 'information paradox') + '. Most researchers today expect the information to come back out in the Hawking radiation. Calculations of the entanglement entropy of the radiation have provided strong evidence for this since 2019 – but the mechanism is not yet fully understood.</p>' +
        '<div class="honest"><b>The common thread:</b> at their core, all these entropies measure the same thing – how much you do <i>not</i> know about a system, given what you do know. They differ in what they count as “the possibilities”: heat, arrangements of particles, messages, quantum states or geometries.</div>',
    },
  };

  const list = U.theory.sections;
  const at = list.findIndex((s) => s.id === 'qm');
  list.splice(at + 1, 0, I.localize(ENTROPY));
})(globalThis.PP = globalThis.PP || {});
