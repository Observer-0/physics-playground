/* =====================================================================
   Physics Playground — Grundlagen, Teil 4: Entropie
   Clausius, Boltzmann/Gibbs, Shannon, von Neumann, Bekenstein-Hawking,
   Wald – plus die häufigsten Verwechslungen. Interaktiv: Ehrenfest-Modell
   (Teilchen springen zufällig zwischen zwei Kammerhälften).
   Hängt sich hinter den Quantenmechanik-Abschnitt in U.theory.sections.
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

  /* ============ Widget: Mikrozustände zählen (Ehrenfest-Modell) ============ */
  const LNF = [0];
  for (let i = 1; i <= 200; i++) LNF[i] = LNF[i - 1] + Math.log(i);
  const lnC = (n, k) => LNF[n] - LNF[k] - LNF[n - k];
  function fmtBig(ln) {           // ln(x) → schön formatierte Zahl
    const l10 = ln / Math.LN10;
    if (l10 < 6) return Math.round(Math.exp(ln)).toLocaleString('de-DE');
    const e = Math.floor(l10), m = Math.pow(10, l10 - e);
    return m.toFixed(2).replace('.', ',') + ' × 10<sup>' + e + '</sup>';
  }
  const f2 = (x) => x.toFixed(2).replace('.', ',');

  function entHTML() {
    return '<div class="tw" id="tw-ent">' +
      '<div class="tw-ctrl"><div class="seg" role="tablist">' + [4, 10, 50, 100].map((n) => '<button data-n="' + n + '"' + (n === 50 ? ' class="on"' : '') + '>N = ' + n + '</button>').join('') + '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn" id="te-reset">Alle nach links</button><button class="btn" id="te-play"></button></div></div>' +
      '<canvas class="tw-canvas" id="te-cv" style="height:380px" role="img" aria-label="Teilchen in zwei Kammerhälften und Zahl der Mikrozustände"></canvas>' +
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
      play.textContent = st.playing ? '❚❚ Anhalten' : '▶ Laufen lassen';
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
      ctx.fillStyle = C.accent; ctx.fillText('links ' + nL, Bx.x + 6, Bx.y + Bx.h + 16);
      ctx.fillStyle = C.cyan; const rt = 'rechts ' + (st.N - nL); ctx.fillText(rt, Bx.x + Bx.w - ctx.measureText(rt).width - 6, Bx.y + Bx.h + 16);
      // --- Ω(n) ---
      const lnMax = lnC(st.N, Math.floor(st.N / 2));
      ctx.fillStyle = C.ink3; ctx.fillText(narrow ? 'Ω(n): Mikrozustände, n Teilchen links' : 'Ω(n) – Zahl der Mikrozustände mit n Teilchen links', Hx.x - 30, Hx.y - 6);
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
      ctx.fillStyle = C.ink3; ctx.fillText('Verlauf: Teilchen links', Tx.x - 30, Tx.y - 6);
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
        '<div><span class="faint">Makrozustand</span> ' + nL + ' links · ' + (st.N - nL) + ' rechts</div>' +
        '<div><span class="faint">Mikrozustände</span> Ω = <b>' + fmtBig(lnO) + '</b></div>' +
        '<div class="inv"><span class="faint">Boltzmann</span> S / k<sub>B</sub> = ln Ω = ' + f2(lnO) + '</div>' +
        '<div class="inv"><span class="faint">Shannon</span> log<sub>2</sub> Ω = ' + f2(lnO / Math.LN2) + ' bit</div>' +
        '<div><span class="faint">Maximum bei n = N/2</span> S<sub>max</sub> / k<sub>B</sub> = ' + f2(lnC(st.N, Math.floor(st.N / 2))) + '</div>' +
        '<div><span class="faint">Chance „alle links“</span> 1 : ' + fmtBig(st.N * Math.LN2) + '</div>';
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
  const ENTROPY = {
    id: 'entropy', title: 'Entropie – ein Wort, viele Bedeutungen',
    mount: mountEnt,
    body: () =>
      '<p>Kaum ein Begriff der Physik wird so oft benutzt und so oft missverstanden. Das liegt auch daran, dass „Entropie“ heute gut ein halbes Dutzend verschiedene, aber verwandte Größen bezeichnet. Sie wurden über hundert Jahre hinweg in ganz unterschiedlichen Gebieten erfunden.</p>' +

      '<h3 class="th-h3">1865 – Clausius: der Begriff entsteht</h3>' +
      '<p>Rudolf Clausius suchte eine Größe, die beschreibt, warum Wärme von selbst nur vom Warmen zum Kalten fließt. Er definierte sie über die Wärme ' + t(R`\delta Q`) + ', die bei der Temperatur ' + t('T') + ' umkehrbar zugeführt wird:</p>' +
      d(R`dS = \frac{\delta Q_{\text{rev}}}{T} \qquad [S] = \mathrm{J/K}`) +
      '<p>Den Namen bildete er bewusst aus dem griechischen <i>tropē</i> (Wendung, Verwandlung) und wählte ihn so, dass er dem Wort „Energie“ möglichst ähnlich klingt – die beiden Größen seien in ihrer Bedeutung so verwandt, dass auch ihre Namen verwandt sein sollten. Seine Arbeit schließt mit zwei Sätzen, die die Thermodynamik zusammenfassen:</p>' +
      '<blockquote class="th-quote">„Die Energie der Welt ist constant. Die Entropie der Welt strebt einem Maximum zu.“<cite>Rudolf Clausius, 1865</cite></blockquote>' +
      '<p>Clausius’ Entropie ist rein <b>makroskopisch</b>: Man misst Wärme und Temperatur. Was sie „ist“, sagt die Definition nicht.</p>' +

      '<h3 class="th-h3">1877 – Boltzmann: Entropie heißt Abzählen</h3>' +
      '<p>Ludwig Boltzmann fand die mikroskopische Bedeutung. Ein <b>Makrozustand</b> (Druck, Temperatur, „wie viele Teilchen links“) lässt sich durch sehr viele <b>Mikrozustände</b> verwirklichen – verschiedene Anordnungen der einzelnen Teilchen, die von außen gleich aussehen. Die Entropie zählt diese Anordnungen:</p>' +
      d(R`S = k_B \ln \Omega`) +
      '<p>' + t('k_B') + ' rechnet nur die Einheiten auf J/K um. Die Formel ist auf Boltzmanns Grab in Wien eingraviert; in genau dieser Form aufgeschrieben hat sie allerdings erst Max Planck. Probier es aus: Alle Teilchen starten links, dann springt jeweils ein zufälliges Teilchen auf die andere Seite.</p>' +
      entHTML() +
      '<p>Das System läuft zur Mitte und bleibt dort, weil dort fast alle Mikrozustände liegen. Die Teilchen „wollen“ nichts, es gibt einfach überwältigend mehr Möglichkeiten, halb verteilt zu sein. Bei ' + t('N = 4') + ' kehrt der Zustand „alle links“ oft zurück. Bei ' + t('N = 100') + ' stehen die Chancen 1 zu 10³⁰. In einem Liter Luft sind es rund 10²² Moleküle. Der zweite Hauptsatz ist also <b>kein Naturgesetz im strengen Sinn, sondern Statistik</b> – aber eine, deren Ausnahmen man in der Lebensdauer des Universums nie beobachten wird.</p>' +
      '<p>Josiah Willard Gibbs verallgemeinerte die Formel auf Mikrozustände, die nicht alle gleich wahrscheinlich sind:</p>' +
      d(R`S = -k_B \sum_{i} p_i \ln p_i`) +

      '<h3 class="th-h3">1948 – Shannon: Entropie als Information</h3>' +
      '<p>Der Ingenieur Claude Shannon suchte bei den Bell Labs ein Maß dafür, wie viel Information eine Nachricht trägt – oder anders: wie überrascht man im Schnitt ist, wenn man sie liest. Heraus kam dieselbe Formel ohne ' + t('k_B') + ':</p>' +
      d(R`H = -\sum_{i} p_i \log_{2} p_i \qquad [H] = \text{bit}`) +
      '<p>Eine faire Münze hat 1 bit, eine gezinkte, die immer Kopf zeigt, 0 bit. Überliefert ist, dass John von Neumann Shannon zum Namen „Entropie“ geraten habe – die Formel sehe ohnehin so aus, und niemand wisse wirklich, was Entropie sei, man habe in jeder Diskussion also den Vorteil. Die Verbindung ist tiefer als ein Wortspiel: Die thermodynamische Entropie ist die Shannon-Information, die einem über den Mikrozustand fehlt, umgerechnet mit ' + t(R`k_B \ln 2`) + ' pro bit. Das Widget oben zeigt beide Zahlen nebeneinander.</p>' +
      '<p>Dass das physikalisch ernst gemeint ist, zeigt das <b>Landauer-Prinzip</b> (1961): Das Löschen von einem bit Information erzeugt mindestens ' + t(R`k_B T \ln 2`) + ' Wärme. 2012 wurde das im Labor mit einem einzelnen Kolloid-Teilchen bestätigt. Information ist physikalisch.</p>' +

      '<h3 class="th-h3">1927/32 – von Neumann: Entropie der Quantenwelt</h3>' +
      '<p>In der Quantenmechanik ersetzt die Dichtematrix ' + t(R`\rho`) + ' die Wahrscheinlichkeiten ' + t('p_i') + ':</p>' +
      d(R`S = -k_B\, \mathrm{Tr}\left(\rho \ln \rho\right)`) +
      '<p>Ein vollständig bekannter Quantenzustand hat die Entropie null. Das Überraschende kommt mit der ' + sec('qm', 'Verschränkung') + ': Sind zwei Teilchen verschränkt, hat das Paar als Ganzes die Entropie null, jedes einzelne Teilchen für sich aber eine positive. Man weiß alles über das Ganze und trotzdem nicht alles über die Teile. Diese <b>Verschränkungsentropie</b> ist heute ein zentrales Werkzeug der Quanteninformation – und der Quantengravitation.</p>' +

      '<h3 class="th-h3">1972–1975 – Bekenstein und Hawking: die Entropie Schwarzer Löcher</h3>' +
      '<p>John Wheeler stellte seinem Doktoranden Jacob Bekenstein eine scheinbar harmlose Frage: Wenn man eine Tasse heißen Tee in ein Schwarzes Loch kippt, ist ihre Entropie verschwunden – wird dann der zweite Hauptsatz verletzt? Bekensteins Antwort: Nein, denn das Schwarze Loch muss selbst Entropie haben, und zwar proportional zur <b>Fläche</b> seines Horizonts. Hawking hielt das zunächst für falsch – bis er 1974 selbst zeigte, dass Schwarze Löcher eine Temperatur haben und strahlen. Damit war auch der Vorfaktor festgelegt:</p>' +
      d(R`S_{BH} = \frac{k_B\, c^{3} A}{4 G \hbar} = k_B\,\frac{A}{4\, l_P^{2}}`) +
      '<p>Auf vier Planck-Flächen kommt also eine Einheit ' + t('k_B') + ', umgerechnet etwa 0,36 bit pro Planck-Fläche. Das ist gewaltig: Ein Schwarzes Loch mit der Masse der Sonne hätte etwa ' + t(R`10^{77}\,k_B`) + ', die Sonne selbst hat rund ' + t(R`10^{58}\,k_B`) + '. Für ihre Größe sind Schwarze Löcher die entropiereichsten Objekte, die es geben kann. ' + exp('bh-entropy', 'Zum Experiment Bekenstein-Hawking-Entropie') + '.</p>' +
      '<p>Dass die Entropie mit der <i>Fläche</i> wächst und nicht mit dem Volumen, ist rätselhaft. Bei jedem gewöhnlichen System ist es umgekehrt. Daraus entstand das <b>holographische Prinzip</b>: die Vermutung, dass die Information in einem Raumgebiet grundsätzlich auf dessen Rand passt. In dieser Formel stehen ' + t('c') + ', ' + t('G') + ', ' + t(R`\hbar`) + ' und ' + t('k_B') + ' gleichzeitig. Sie ist einer der wenigen festen Anhaltspunkte, die jede künftige Quantengravitation reproduzieren muss.</p>' +

      '<h3 class="th-h3">1993 – Wald: Entropie aus der Wirkung</h3>' +
      '<p>Robert Wald stellte die Frage allgemeiner: Woher kommt die Formel ' + t('A/4') + ' eigentlich? Seine Antwort: Die Entropie eines Schwarzen Lochs ist eine <b>Noether-Ladung</b>. Man erhält sie aus der ' + sec('action', 'Wirkung') + ' und der Zeitverschiebungs-Symmetrie am Horizont – mit derselben Idee, mit der ' + sec('history', 'Emmy Noether') + ' Energieerhaltung erklärt hat. Für die Einstein-Hilbert-Wirkung kommt genau ' + t('A/4') + ' heraus. Für abgewandelte Gravitationstheorien mit zusätzlichen Krümmungstermen liefert die <b>Wald-Entropie</b> Korrekturen. Die Flächenformel ist also eine Eigenschaft von Einsteins Theorie, die Wald-Formel die allgemeine Regel dahinter.</p>' +

      '<h3 class="th-h3">Alle auf einen Blick</h3>' +
      '<div class="th-scroll"><table class="t th-cmp"><thead><tr><th>Name</th><th>Formel</th><th>Was wird gemessen?</th><th>Einheit</th></tr></thead><tbody>' +
      [['Clausius (1865)', R`dS = \delta Q_{\text{rev}}/T`, 'umkehrbar ausgetauschte Wärme pro Temperatur', 'J/K'],
        ['Boltzmann (1877)', R`S = k_B \ln \Omega`, 'Zahl der Mikrozustände eines Makrozustands', 'J/K'],
        ['Gibbs (1902)', R`S = -k_B \sum p_i \ln p_i`, 'dasselbe mit ungleichen Wahrscheinlichkeiten', 'J/K'],
        ['Shannon (1948)', R`H = -\sum p_i \log_{2} p_i`, 'fehlende Information / Überraschung', 'bit'],
        ['von Neumann (1932)', R`S = -k_B\,\mathrm{Tr}(\rho\ln\rho)`, 'Unwissen über einen Quantenzustand; Verschränkung', 'J/K oder bit'],
        ['Bekenstein-Hawking (1974)', R`S = k_B A / 4 l_P^{2}`, 'Entropie eines Schwarzen Lochs, aus der Horizontfläche', 'J/K'],
        ['Wald (1993)', R`S = \text{Noether-Ladung}`, 'Verallgemeinerung auf beliebige Gravitationstheorien', 'J/K']]
        .map(([a, b, c, e]) => '<tr><td style="white-space:nowrap">' + a + '</td><td style="white-space:nowrap">' + t(b) + '</td><td>' + c + '</td><td>' + e + '</td></tr>').join('') +
      '</tbody></table></div>' +

      '<h3 class="th-h3">Die häufigsten Verwechslungen</h3>' +
      '<p><b>„Entropie ist Unordnung.“</b> Das ist eine Eselsbrücke, die oft in die Irre führt. Entropie zählt Möglichkeiten, nicht Unordnung. Harte Kugeln, die man dicht genug packt, ordnen sich von selbst zu einem Kristall – <i>weil</i> dabei die Entropie steigt: Im geordneten Gitter hat jede Kugel mehr Spielraum zum Wackeln. Und unter Gravitation ist es genau umgekehrt wie im Gas im Kasten: Ein gleichmäßig verteiltes Gas hat <i>niedrige</i> Entropie, und Klumpen – Sterne, Galaxien, am Ende Schwarze Löcher – erhöhen sie.</p>' +
      '<p><b>Shannon- und thermodynamische Entropie gleichsetzen.</b> Die Formeln gleichen sich, aber die Shannon-Entropie ist eine Eigenschaft einer <i>Wahrscheinlichkeitsverteilung</i>, also einer Beschreibung. Die thermodynamische ist der Spezialfall, in dem die Verteilung die physikalischen Mikrozustände eines Systems im Gleichgewicht meint. Die Entropie eines Textes hat mit der Wärme im Papier nichts zu tun.</p>' +
      '<p><b>„Entropie ist eine Form von Energie.“</b> Nein. Entropie hat die Einheit J/K, erst ' + t('T S') + ' ist eine Energie – der Teil der Energie, der sich nicht mehr in Arbeit umwandeln lässt.</p>' +
      '<p><b>„Entropie steigt immer.“</b> Nur in einem abgeschlossenen System und nur im statistischen Mittel. Lokal sinkt sie ständig: im Kühlschrank, in jeder lebenden Zelle – auf Kosten von mehr Entropie anderswo. Und subtiler: Die von-Neumann-Entropie eines vollständig abgeschlossenen Quantensystems bleibt <i>exakt konstant</i>. Dass wir trotzdem einen Anstieg sehen, liegt daran, dass wir nur Teile beobachten oder grob hinschauen. Warum das Universum mit so niedriger Entropie begonnen hat, dass es überhaupt einen Zeitpfeil gibt, ist eine offene Frage der Kosmologie.</p>' +
      '<p><b>„Schwarze Löcher vernichten Information.“</b> Das war Hawkings ursprüngliche Schlussfolgerung und ist genau das ' + sec('gap', 'Informationsparadoxon') + '. Die Mehrheit der Forschenden erwartet heute, dass die Information in der Hawking-Strahlung wieder herauskommt. Rechnungen zur Verschränkungsentropie der Strahlung haben seit 2019 starke Hinweise dafür geliefert – vollständig verstanden ist der Mechanismus aber noch nicht.</p>' +
      '<div class="honest"><b>Der rote Faden:</b> Alle diese Entropien messen im Kern dasselbe – wie viel man über ein System <i>nicht</i> weiß, gegeben das, was man weiß. Sie unterscheiden sich darin, was man als „die Möglichkeiten“ zählt: Wärme, Teilchenanordnungen, Nachrichten, Quantenzustände oder Geometrien.</div>',
  };

  const list = U.theory.sections;
  const at = list.findIndex((s) => s.id === 'qm');
  list.splice(at + 1, 0, ENTROPY);
})(globalThis.PP = globalThis.PP || {});
