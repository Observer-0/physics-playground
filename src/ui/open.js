/* =====================================================================
   Physics Playground — Offene Fragen
   Wo Allgemeine Relativitätstheorie und Quantentheorie an ihre Grenzen
   kommen: was gesichert ist, was offen bleibt, was es entscheiden würde.
   Regeln (ROADMAP.md): nur ART, QM, QFT (auch semiklassische Gravitation),
   Thermodynamik, statistische Physik und Experimente. Keine Kandidaten
   für eine Quantengravitation, keine spekulativen Antworten – Ungelöstes
   heißt „offen“. Alle Zahlen kommen aus der Engine (Experimente mit
   field: 'open' in src/data/experiments.js).
   Jede Frage: { id, status, exp?, title, body } – Seitenaufbau wie die
   Grundlagen (U.sectionPage in src/ui/theory.js).
   ===================================================================== */
(function (PP) {
  'use strict';
  const U = PP.ui, I = PP.i18n, T = I.T, S = U.S;
  const { esc } = U;
  const R = String.raw;
  const t = (s) => U.tex(s);
  const d = (s) => '<div class="th-eq">' + U.tex(s, true) + '</div>';
  const xq = (id) => U.eqx.inline(id);
  const exp = (id, label) => '<a href="#exp=' + id + '">' + esc(label) + '</a>';
  const sec = (id, label) => '<a href="#view=theorie&amp;sec=' + id + '">' + esc(label) + '</a>';
  // Etikett für eine einzelne Aussage (der Status beschreibt dagegen die ganze Frage)
  const kind = (k) => '<span class="th-kind">' + esc(k) + '</span>';
  const live = (id, label) => '<p><a class="btn oq-live" href="#exp=' + id + '">' + esc(label) + ' →</a></p>';
  // Quellen am Ende einer Frage: dieselbe Liste wie im Tab „Quellen“ ihres Experiments (src/data/sources.js)
  const srcs = (id) => (PP.sources && PP.sources.byId[id] ? '<h3 class="th-h3">' + T('Quellen', 'Sources') + '</h3>' + U.sourceList(PP.sources.byId[id]) : '');

  /* Status einer Frage. Bewusst ohne Datenfarbe: Der Name trägt die Bedeutung, der Kreis (leer, halb, voll) wiederholt sie. */
  const STATUS = I.localize({
    open: { name: { de: 'Offen', en: 'Open' }, text: { de: 'Die Frage ist ungelöst.', en: 'The question is unresolved.' } },
    partial: { name: { de: 'Teilweise verstanden', en: 'Partially understood' }, text: { de: 'Ein Teil ist geklärt, ein wesentlicher Teil nicht.', en: 'Part of it is settled, an essential part is not.' } },
    semi: { name: { de: 'Semiklassisch geklärt', en: 'Semiclassically resolved' }, text: { de: 'Im Rahmen der semiklassischen Gravitation beantwortet – eine tiefere Erklärung kann trotzdem fehlen.', en: 'Answered within semiclassical gravity – a deeper explanation may still be missing.' } },
  });
  const chip = (k) => '<span class="oq-status"><i data-s="' + k + '" aria-hidden="true"></i>' + esc(STATUS[k].name) + '</span>';

  const QUESTIONS = I.localize([
    /* ------------------------------------------------------------ */
    {
      id: 'quarter', status: 'partial', exp: 'bh-eta', title: { de: 'Warum genau 1/4?', en: 'Why exactly 1/4?' },
      body: {
        de: () => {
          const MATH = 'Mathematik', SEMI = 'semiklassisch', OPEN = 'offen', MEAS = 'Messung', QFT = 'Quantenfeldtheorie';
          return '<h3 class="th-h3">Die Frage</h3>' +
            '<p>Die Entropie eines Schwarzen Lochs wächst mit der Fläche seines Horizonts – gezählt in Planck-Flächen, mit einem Vorfaktor von genau einem Viertel:</p>' +
            xq('entropy-bh') +
            '<p>Daran hängen zwei Fragen. Woher kommt genau dieser Faktor 1/4? Und was zählt diese Entropie eigentlich – welche Zustände stecken hinter ihr?</p>' +
            '<h3 class="th-h3">Was gesichert ist</h3>' +
            '<p>' + kind(SEMI) + ' Für ein Schwarzschild-Loch liefern Hawkings Rechnung (1975) und die Geometrie des Horizonts Temperatur und Fläche:</p>' +
            d(R`T_{\mathrm{H}} = \frac{\hbar c^{3}}{8\pi G M k_{\mathrm{B}}}`) + d(R`A = 4\pi r_{\mathrm{s}}^{2} = \frac{16\pi G^{2} M^{2}}{c^{4}}`) +
            '<p>' + kind(MATH) + ' Setzt man beides in den ersten Hauptsatz ' + t(R`\mathrm{d}E = T_{\mathrm{H}}\,\mathrm{d}S`) + ' mit ' + t(R`\mathrm{d}E = c^{2}\,\mathrm{d}M`) + ' ein und integriert von ' + t('M = 0') + ' an, bleibt kein freier Faktor übrig:</p>' +
            d(R`\mathrm{d}S = \frac{c^{2}\,\mathrm{d}M}{T_{\mathrm{H}}} = \frac{8\pi G k_{\mathrm{B}}}{\hbar c}\,M\,\mathrm{d}M`) +
            d(R`\Rightarrow\; S = \frac{4\pi G k_{\mathrm{B}}}{\hbar c}\,M^{2} = \frac{k_{\mathrm{B}}\,A}{4\,l_{\mathrm{P}}^{2}}`) +
            '<p>Bekenstein hatte 1973 aus Gedankenexperimenten gefolgert, dass die Entropie proportional zur Fläche sein muss; den Vorfaktor konnte er nur abschätzen. Erst die Hawking-Temperatur legte ihn fest. Ein anderer Vorfaktor verletzt den ersten Hauptsatz – das zeigt das Experiment am Ende dieser Seite.</p>' +
            '<p>' + kind(SEMI) + ' Zwei weitere Wege führen zum selben Wert. Gibbons und Hawking (1977) berechneten die Entropie aus dem euklidischen Pfadintegral der Gravitation. Wald (1993) zeigte, dass sie eine Noether-Ladung ist: eine Größe, die aus der Koordinatenunabhängigkeit der Gravitationsgesetze folgt und am Horizont ausgewertet wird. Seine Formel gilt auch für andere Gravitationstheorien und ergibt für die Allgemeine Relativitätstheorie wieder ' + t(R`S/k_{\mathrm{B}} = A/(4\,l_{\mathrm{P}}^{2})`) + '.</p>' +
            '<div class="honest"><b>Einordnung:</b> Innerhalb der semiklassischen Gravitation ist 1/4 nicht willkürlich, sondern durch Konsistenz festgelegt. Die Zerlegung 8π = 4 · 2π (Horizontgeometrie mal Quantenperiodizität, siehe ' + exp('hawking', 'Hawking-Temperatur') + ') ordnet die Zahl nur zu – sie erklärt nicht, woher der Faktor physikalisch kommt.</div>' +
            '<h3 class="th-h3">Was offen ist</h3>' +
            '<p>' + kind(OPEN) + ' Die mikroskopische Deutung. In der statistischen Physik ist ' + t(R`S/k_{\mathrm{B}} = \ln\Omega`) + ', der Logarithmus der Zahl der Mikrozustände (siehe ' + sec('entropy', 'Entropie') + '). Für ein Loch mit Sonnenmasse wäre ' + t(R`\Omega \approx e^{10^{77}}`) + '. Welche Zustände das sind, sagt die semiklassische Rechnung nicht: Sie liefert die Entropie, ohne Zustände zu zählen.</p>' +
            '<p>' + kind(OPEN) + ' Ebenso offen ist, wo diese Freiheitsgrade sitzen – auf dem Horizont, im Inneren oder in den Korrelationen zwischen innen und außen – und warum eine Fläche zählt und kein Volumen. Bei gewöhnlicher Materie wächst die Entropie mit dem Volumen.</p>' +
            '<h3 class="th-h3 th-deep">Ein Befund aus der Quantenfeldtheorie</h3>' +
            '<p>' + kind(QFT) + ' Auch in flacher Raumzeit, ganz ohne Gravitation, wächst die Verschränkungsentropie eines Quantenfelds mit der Fläche einer gedachten Trennfläche und nicht mit dem Volumen dahinter (Srednicki 1993; ähnlich schon Bombelli, Koul, Lee und Sorkin 1986 vor dem Hintergrund eines Schwarzen Lochs). Ihr Vorfaktor hängt aber von einer frei gewählten kleinsten Länge ab, dem Cutoff, und ist ohne Gravitation nicht festgelegt.</p>' +
            '<p>' + kind(OPEN) + ' Ob dieser Befund ' + t(R`S_{\mathrm{BH}}`) + ' erklärt, ist offen.</p>' +
            '<h3 class="th-h3">Was es entscheiden würde</h3>' +
            '<p>Theoretisch: eine mikroskopische Beschreibung, deren Zustandszählung ' + t(R`\ln\Omega = A/(4\,l_{\mathrm{P}}^{2})`) + ' mit genau diesem Vorfaktor liefert und zugleich die semiklassischen Ergebnisse oben reproduziert.</p>' +
            '<p>' + kind(MEAS) + ' Experimentell ist die Frage außer Reichweite: Hawking-Strahlung astrophysikalischer Löcher ist viel schwächer als die kosmische Hintergrundstrahlung und wurde nie beobachtet. Getestet ist ein klassischer Verwandter, Hawkings Flächensatz (1971): Die Horizontfläche nimmt nie ab. Bei den Verschmelzungen GW150914 (Isi u. a. 2021) und – deutlich genauer – GW250114 (LIGO, Virgo, KAGRA 2025) hatte das entstandene Loch eine größere Horizontfläche als beide Ausgangslöcher zusammen. Über den Faktor 1/4 sagt das nichts.</p>' +
            '<h3 class="th-h3">Live in der App</h3>' +
            '<p>Im Experiment ist der Vorfaktor ein Regler: ' + t(R`S_\eta = \eta\,k_{\mathrm{B}}A/l_{\mathrm{P}}^{2}`) + '. Die Engine rechnet dazu das Konsistenzverhältnis</p>' +
            d(R`R_\eta = \frac{T_{\mathrm{H}}}{c^{2}}\,\frac{\mathrm{d}S_\eta}{\mathrm{d}M} = 4\eta`) +
            '<p>' + t(R`R_\eta = 1`) + ' heißt: Der erste Hauptsatz ist erfüllt. Die Presets η = 1/4, 1/2 und 1 ergeben R = 1, 2 und 4 – bei jeder Masse, denn M kürzt sich heraus. Nur η = 1/4 passt, unter den Annahmen der Rechnung: Schwarzschild-Loch, T_H aus Hawkings Rechnung, E = Mc².</p>' +
            live('bh-eta', 'Zum Experiment: Vorfaktor η') + srcs('bh-eta');
        },
        en: () => {
          const MATH = 'mathematics', SEMI = 'semiclassical', OPEN = 'open', MEAS = 'measurement', QFT = 'quantum field theory';
          return '<h3 class="th-h3">The question</h3>' +
            '<p>The entropy of a black hole grows with the area of its horizon – counted in Planck areas, with a prefactor of exactly one quarter:</p>' +
            xq('entropy-bh') +
            '<p>Two questions follow. Where does exactly this factor of 1/4 come from? And what does this entropy actually count – which states lie behind it?</p>' +
            '<h3 class="th-h3">What is established</h3>' +
            '<p>' + kind(SEMI) + ' For a Schwarzschild black hole, Hawking’s calculation (1975) and the geometry of the horizon give the temperature and the area:</p>' +
            d(R`T_{\mathrm{H}} = \frac{\hbar c^{3}}{8\pi G M k_{\mathrm{B}}}`) + d(R`A = 4\pi r_{\mathrm{s}}^{2} = \frac{16\pi G^{2} M^{2}}{c^{4}}`) +
            '<p>' + kind(MATH) + ' Insert both into the first law ' + t(R`\mathrm{d}E = T_{\mathrm{H}}\,\mathrm{d}S`) + ' with ' + t(R`\mathrm{d}E = c^{2}\,\mathrm{d}M`) + ', integrate from ' + t('M = 0') + ', and no free factor is left:</p>' +
            d(R`\mathrm{d}S = \frac{c^{2}\,\mathrm{d}M}{T_{\mathrm{H}}} = \frac{8\pi G k_{\mathrm{B}}}{\hbar c}\,M\,\mathrm{d}M`) +
            d(R`\Rightarrow\; S = \frac{4\pi G k_{\mathrm{B}}}{\hbar c}\,M^{2} = \frac{k_{\mathrm{B}}\,A}{4\,l_{\mathrm{P}}^{2}}`) +
            '<p>In 1973 Bekenstein concluded from thought experiments that the entropy must be proportional to the area; he could only estimate the prefactor. Only the Hawking temperature fixed it. Any other prefactor violates the first law – the experiment at the end of this page shows this.</p>' +
            '<p>' + kind(SEMI) + ' Two further routes lead to the same value. Gibbons and Hawking (1977) calculated the entropy from the Euclidean path integral of gravity. Wald (1993) showed that it is a Noether charge: a quantity that follows from the coordinate independence of the laws of gravity and is evaluated on the horizon. His formula also holds for other theories of gravity and, for general relativity, gives back ' + t(R`S/k_{\mathrm{B}} = A/(4\,l_{\mathrm{P}}^{2})`) + '.</p>' +
            '<div class="honest"><b>Perspective:</b> within semiclassical gravity, 1/4 is not arbitrary but fixed by consistency. Splitting 8π = 4 · 2π (horizon geometry times quantum periodicity, see ' + exp('hawking', 'Hawking temperature') + ') only assigns the number – it does not explain where the factor physically comes from.</div>' +
            '<h3 class="th-h3">What remains open</h3>' +
            '<p>' + kind(OPEN) + ' The microscopic interpretation. In statistical physics, ' + t(R`S/k_{\mathrm{B}} = \ln\Omega`) + ', the logarithm of the number of microstates (see ' + sec('entropy', 'Entropy') + '). For a hole of one solar mass, ' + t(R`\Omega \approx e^{10^{77}}`) + '. Which states these are, the semiclassical calculation does not say: it delivers the entropy without counting states.</p>' +
            '<p>' + kind(OPEN) + ' Just as open is where these degrees of freedom are located – on the horizon, in the interior or in the correlations between inside and outside – and why an area counts rather than a volume. For ordinary matter, entropy grows with the volume.</p>' +
            '<h3 class="th-h3 th-deep">A finding from quantum field theory</h3>' +
            '<p>' + kind(QFT) + ' Even in flat spacetime, with no gravity at all, the entanglement entropy of a quantum field grows with the area of an imagined dividing surface rather than with the volume behind it (Srednicki 1993; similarly Bombelli, Koul, Lee and Sorkin 1986, on the background of a black hole). Its prefactor, however, depends on a freely chosen shortest length, the cutoff, and is not fixed without gravity.</p>' +
            '<p>' + kind(OPEN) + ' Whether this finding explains ' + t(R`S_{\mathrm{BH}}`) + ' is open.</p>' +
            '<h3 class="th-h3">What would settle it</h3>' +
            '<p>Theoretically: a microscopic description whose count of states gives ' + t(R`\ln\Omega = A/(4\,l_{\mathrm{P}}^{2})`) + ' with exactly this prefactor and at the same time reproduces the semiclassical results above.</p>' +
            '<p>' + kind(MEAS) + ' Experimentally, the question is out of reach: Hawking radiation from astrophysical black holes is far weaker than the cosmic microwave background and has never been observed. What has been tested is a classical relative, Hawking’s area theorem (1971): the horizon area never decreases. In the mergers GW150914 (Isi et al. 2021) and – much more precisely – GW250114 (LIGO, Virgo, KAGRA 2025), the resulting hole had a larger horizon area than the two original holes combined. That says nothing about the factor 1/4.</p>' +
            '<h3 class="th-h3">Live in the app</h3>' +
            '<p>In the experiment the prefactor is a slider: ' + t(R`S_\eta = \eta\,k_{\mathrm{B}}A/l_{\mathrm{P}}^{2}`) + '. The engine also calculates the consistency ratio</p>' +
            d(R`R_\eta = \frac{T_{\mathrm{H}}}{c^{2}}\,\frac{\mathrm{d}S_\eta}{\mathrm{d}M} = 4\eta`) +
            '<p>' + t(R`R_\eta = 1`) + ' means the first law holds. The presets η = 1/4, 1/2 and 1 give R = 1, 2 and 4 – for every mass, because M cancels out. Only η = 1/4 fits, under the assumptions of the calculation: a Schwarzschild hole, T_H from Hawking’s calculation, E = Mc².</p>' +
            live('bh-eta', 'To the experiment: prefactor η') + srcs('bh-eta');
        },
      },
    },
    /* ------------------------------------------------------------ */
    {
      id: 'info', status: 'open', exp: 'bh-page', title: { de: 'Geht Information verloren?', en: 'Is information lost?' },
      body: {
        de: () => {
          const MATH = 'Mathematik', SEMI = 'semiklassisch', OPEN = 'offen', MEAS = 'Messung', QM = 'Quantenmechanik', UNIT = 'Erwartung bei Unitarität';
          return '<h3 class="th-h3">Die Frage</h3>' +
            '<p>Ein Schwarzes Loch entsteht aus Materie in einem bestimmten Quantenzustand. Dann strahlt es, wird leichter und verdampft. Bleibt die Information über den Anfangszustand erhalten – steckt sie am Ende in der Strahlung –, oder geht sie verloren?</p>' +
            '<h3 class="th-h3">Was gesichert ist</h3>' +
            '<p>' + kind(SEMI) + ' Hawkings Rechnung (1975) liefert thermische Strahlung mit einer Temperatur ' + t(R`T_{\mathrm{H}} \propto 1/M`) + ' (' + exp('hawking', 'Hawking-Temperatur') + '). Das Loch verliert Masse, wird dabei heißer und strahlt immer stärker. Seine Lebensdauer wächst wie ' + t('M^{3}') + ' – für eine Sonnenmasse grob 10⁶⁷ Jahre.</p>' +
            '<p>' + kind(SEMI) + ' Daraus folgt das Paradoxon (Hawking 1976). Nimmt man zusammen: einen reinen Anfangszustand, vollständige Verdampfung ohne Rest und exakt thermische Strahlung, dann wird aus einem reinen ein gemischter Zustand. Das widerspricht der unitären Zeitentwicklung der Quantenmechanik, nach der Information nie verloren geht.</p>' +
            '<p>' + kind(QM) + ' Page (1993): Ist ein zufälliger Gesamtzustand rein, ist das kleinere von zwei Teilsystemen fast maximal mit dem größeren verschränkt. Geht keine Information verloren, kann die Entropie der Strahlung deshalb nie größer sein als die des verbleibenden Lochs. Sie steigt, erreicht ein Maximum und fällt am Ende auf null – das ist die Page-Kurve:</p>' +
            d(R`S_{\mathrm{Page}} = \min\left(S_{\mathrm{rad}},\, S_{\mathrm{BH}}\right)`) +
            '<p>' + kind(MATH) + ' Im einfachsten Modell nimmt ' + t('M^{3}') + ' linear in der Zeit ab, also ' + t(R`S_{\mathrm{BH}} = S_0\,(1 - \tau)^{2/3}`) + ' mit ' + t(R`\tau = t/t_{\mathrm{evap}}`) + '. Trägt die Strahlung genau die Entropie weg, die das Loch verliert, schneiden sich beide Kurven bei</p>' +
            d(R`\tau_{\mathrm{Page}} = 1 - 2^{-3/2}`) +
            '<p>also nach etwa 64,6 % der Verdampfungszeit. Nach Page kommt die Information vor allem danach heraus: Vorher zeigt die Strahlung kaum Spuren von ihr.</p>' +
            '<p>' + kind(SEMI) + ' Seit 2019 reproduzieren semiklassische Rechnungen diesen Verlauf in speziellen theoretischen Modellen, vor allem in zwei Dimensionen. Das ist eine Rechnung, keine Beobachtung an einem Schwarzen Loch.</p>' +
            '<div class="honest"><b>Einordnung:</b> Die Zahl 0,646 gehört zum einfachsten Modell. Realistisch erzeugt die Abstrahlung mehr Entropie, als das Loch verliert – für Photonen und Gravitonen etwa das 1,48-Fache (Page 2013). Dann liegt das Maximum schon bei etwa 53,8 % der Verdampfungszeit. Die Form der Kurve bleibt, ihre Zahlen hängen an den Annahmen.</div>' +
            '<h3 class="th-h3">Was offen ist</h3>' +
            '<p>' + kind(OPEN) + ' Der Mechanismus: Wie gelangt die Information in die Strahlung, und wo ist sie vorher? Hawkings Rechnung zeigt dafür keinen Weg.</p>' +
            '<p>' + kind(OPEN) + ' Ob die Verdampfung überhaupt unitär verläuft. Die Page-Kurve ist die Erwartung unter dieser Annahme, gemessen ist sie nicht.</p>' +
            '<p>' + kind(OPEN) + ' Die Endphase: Nahe der Planck-Masse versagt die semiklassische Rechnung. Ob das Loch ganz verschwindet oder ein Rest bleibt, ist offen.</p>' +
            '<h3 class="th-h3 th-deep">Warum ausgerechnet das Minimum?</h3>' +
            '<p>' + kind(QM) + ' Ein reiner Zustand hat die Entropie null. Teilt man ihn in zwei Teile, haben beide dieselbe Verschränkungsentropie – und die kann höchstens so groß sein wie die größtmögliche Entropie des kleineren Teils. Page zeigte 1993, dass ein zufälliger reiner Zustand diese Grenze fast erreicht: Dem kleineren Teil fehlt im Mittel weniger als eine halbe Einheit Information.</p>' +
            '<p>Für die Verdampfung heißt das: Solange die Strahlung das kleinere System ist, wächst ihre Entropie wie bei Hawking. Sobald das verbleibende Loch kleiner ist, begrenzt seine Entropie die der Strahlung – daher ' + t(R`\min(S_{\mathrm{rad}}, S_{\mathrm{BH}})`) + '.</p>' +
            '<h3 class="th-h3">Was es entscheiden würde</h3>' +
            '<p>Theoretisch: eine Rechnung für realistische Schwarze Löcher, die zeigt, wie die Information herauskommt – oder warum nicht – und die dabei Hawkings Ergebnis für frühe Zeiten reproduziert.</p>' +
            '<p>' + kind(MEAS) + ' Experimentell ist die Frage außer Reichweite: Die Strahlung astrophysikalischer Löcher ist viel schwächer als die kosmische Hintergrundstrahlung. Kleine primordiale Löcher, die heute verdampfen würden, sind hypothetisch und nie beobachtet worden. Analogexperimente, etwa in Bose-Einstein-Kondensaten (Steinhauer 2016), untersuchen Hawking-artige Strahlung und ihre Verschränkung – sie sind aber keine Schwarzen Löcher und testen das Paradoxon nicht.</p>' +
            '<h3 class="th-h3">Live in der App</h3>' +
            '<p>Das Experiment lässt ein Loch im Zeitraffer verdampfen: ' + t(R`\tau = t/t_{\mathrm{evap}}`) + ' läuft von 0 bis 1, Masse, Temperatur und Entropien kommen aus der Engine. Im Bild entstehen drei Kurven:</p>' +
            '<ul><li><b>S_BH</b> ' + kind(SEMI) + ' die Entropie des verbleibenden Lochs,</li><li><b>S_rad</b> ' + kind(SEMI) + ' Hawkings thermische Strahlung, deren Entropie bis zum Schluss wächst,</li><li><b>S_Page</b> ' + kind(UNIT) + ' die Page-Kurve, seit 2019 in speziellen Modellen semiklassisch reproduziert.</li></ul>' +
            '<p>Mit β stellst du die Entropiebilanz ein: β = 1 ist das einfachste Modell, β ≈ 1,48 der Wert für Photonen und Gravitonen. Die Engine rechnet die Page-Zeit ' + t(R`1 - \left(\beta/(1 + \beta)\right)^{3/2}`) + ' aus – für β ≈ 1,4847 kommen Pages 53,8 % heraus.</p>' +
            live('bh-page', 'Zum Experiment: Verdampfung und Page-Kurve') + srcs('bh-page');
        },
        en: () => {
          const MATH = 'mathematics', SEMI = 'semiclassical', OPEN = 'open', MEAS = 'measurement', QM = 'quantum mechanics', UNIT = 'expected under unitarity';
          return '<h3 class="th-h3">The question</h3>' +
            '<p>A black hole forms from matter in a definite quantum state. Then it radiates, becomes lighter and evaporates. Is the information about the initial state preserved – does it end up in the radiation – or is it lost?</p>' +
            '<h3 class="th-h3">What is established</h3>' +
            '<p>' + kind(SEMI) + ' Hawking’s calculation (1975) gives thermal radiation with a temperature ' + t(R`T_{\mathrm{H}} \propto 1/M`) + ' (' + exp('hawking', 'Hawking temperature') + '). The hole loses mass, becomes hotter in the process and radiates ever more strongly. Its lifetime grows like ' + t('M^{3}') + ' – roughly 10⁶⁷ years for one solar mass.</p>' +
            '<p>' + kind(SEMI) + ' This leads to the paradox (Hawking 1976). Put together a pure initial state, complete evaporation without a remnant and exactly thermal radiation, and a pure state turns into a mixed one. That contradicts the unitary time evolution of quantum mechanics, according to which information is never lost.</p>' +
            '<p>' + kind(QM) + ' Page (1993): if a random total state is pure, the smaller of two subsystems is almost maximally entangled with the larger one. So if no information is lost, the entropy of the radiation can never exceed that of the remaining hole. It rises, reaches a maximum and falls back to zero at the end – that is the Page curve:</p>' +
            d(R`S_{\mathrm{Page}} = \min\left(S_{\mathrm{rad}},\, S_{\mathrm{BH}}\right)`) +
            '<p>' + kind(MATH) + ' In the simplest model ' + t('M^{3}') + ' decreases linearly in time, so ' + t(R`S_{\mathrm{BH}} = S_0\,(1 - \tau)^{2/3}`) + ' with ' + t(R`\tau = t/t_{\mathrm{evap}}`) + '. If the radiation carries away exactly the entropy the hole loses, the two curves cross at</p>' +
            d(R`\tau_{\mathrm{Page}} = 1 - 2^{-3/2}`) +
            '<p>that is, after about 64.6 % of the evaporation time. According to Page, the information comes out mainly after that: before, the radiation shows hardly any trace of it.</p>' +
            '<p>' + kind(SEMI) + ' Since 2019, semiclassical calculations have reproduced this behaviour in specific theoretical models, mostly in two dimensions. That is a calculation, not an observation of a black hole.</p>' +
            '<div class="honest"><b>Perspective:</b> the number 0.646 belongs to the simplest model. Realistically, the emission produces more entropy than the hole loses – about 1.48 times as much for photons and gravitons (Page 2013). Then the maximum already comes at about 53.8 % of the evaporation time. The shape of the curve stays; its numbers depend on the assumptions.</div>' +
            '<h3 class="th-h3">What remains open</h3>' +
            '<p>' + kind(OPEN) + ' The mechanism: how does the information get into the radiation, and where is it before? Hawking’s calculation shows no way for this.</p>' +
            '<p>' + kind(OPEN) + ' Whether evaporation is unitary at all. The Page curve is the expectation under this assumption; it has not been measured.</p>' +
            '<p>' + kind(OPEN) + ' The final stage: near the Planck mass the semiclassical calculation breaks down. Whether the hole disappears completely or leaves a remnant is open.</p>' +
            '<h3 class="th-h3 th-deep">Why the minimum, of all things?</h3>' +
            '<p>' + kind(QM) + ' A pure state has zero entropy. Split it into two parts, and both have the same entanglement entropy – which can be at most as large as the largest possible entropy of the smaller part. Page showed in 1993 that a random pure state almost reaches this limit: on average, the smaller part lacks less than half a unit of information.</p>' +
            '<p>For evaporation this means: as long as the radiation is the smaller system, its entropy grows as in Hawking’s calculation. As soon as the remaining hole is smaller, its entropy limits that of the radiation – hence ' + t(R`\min(S_{\mathrm{rad}}, S_{\mathrm{BH}})`) + '.</p>' +
            '<h3 class="th-h3">What would settle it</h3>' +
            '<p>Theoretically: a calculation for realistic black holes that shows how the information comes out – or why it does not – and at the same time reproduces Hawking’s result for early times.</p>' +
            '<p>' + kind(MEAS) + ' Experimentally, the question is out of reach: the radiation from astrophysical black holes is far weaker than the cosmic microwave background. Small primordial holes that would be evaporating today are hypothetical and have never been observed. Analogue experiments, for example in Bose–Einstein condensates (Steinhauer 2016), study Hawking-like radiation and its entanglement – but they are not black holes and do not test the paradox.</p>' +
            '<h3 class="th-h3">Live in the app</h3>' +
            '<p>The experiment lets a hole evaporate in time-lapse: ' + t(R`\tau = t/t_{\mathrm{evap}}`) + ' runs from 0 to 1; mass, temperature and entropies come from the engine. Three curves build up in the picture:</p>' +
            '<ul><li><b>S_BH</b> ' + kind(SEMI) + ' the entropy of the remaining hole,</li><li><b>S_rad</b> ' + kind(SEMI) + ' Hawking’s thermal radiation, whose entropy grows until the end,</li><li><b>S_Page</b> ' + kind(UNIT) + ' the Page curve, reproduced semiclassically in specific models since 2019.</li></ul>' +
            '<p>β sets the entropy balance: β = 1 is the simplest model, β ≈ 1.48 the value for photons and gravitons. The engine calculates the Page time ' + t(R`1 - \left(\beta/(1 + \beta)\right)^{3/2}`) + ' – for β ≈ 1.4847 this gives Page’s 53.8 %.</p>' +
            live('bh-page', 'To the experiment: evaporation and the Page curve') + srcs('bh-page');
        },
      },
    },
  ]);

  const TITLE = () => T('Offene Fragen', 'Open questions');
  const META = I.localize({
    quarter: { short: { de: 'Warum genau 1/4?', en: 'Why exactly 1/4?' }, teaser: { de: 'Der Vorfaktor der Entropie Schwarzer Löcher ist festgelegt – was sie zählt, ist offen.', en: 'The prefactor of black hole entropy is fixed – what it counts is open.' } },
    info: { short: { de: 'Geht Information verloren?', en: 'Is information lost?' }, teaser: { de: 'Ein Schwarzes Loch verdampft. Steckt die Information über seinen Anfang am Ende in der Strahlung?', en: 'A black hole evaporates. Does the information about its beginning end up in the radiation?' } },
  });
  const meta = (q) => META[q.id] || { short: q.title, teaser: '' };
  const href = (id) => '#view=offen&amp;sec=' + id;
  const CFG = { list: QUESTIONS, meta, title: TITLE, field: 'open', view: 'offen', sub: (q) => ' ' + chip(q.status) };

  // Seitenleiste (src/ui/core.js): Übersicht und je Frage ein Unterpunkt; auch das Experiment einer Frage markiert sie
  U.openNav = () => {
    const cur = S.view === 'offen' ? S.theorySec : S.view === 'exp' && S.exp ? (QUESTIONS.find((q) => q.exp === S.exp.id) || {}).id : undefined;
    return '<a href="#view=offen" class="' + (S.view === 'offen' && !cur ? 'on' : '') + '">' + T('Übersicht', 'Overview') + '</a>' +
      QUESTIONS.map((q, i) => '<a href="' + href(q.id) + '" class="sub' + (cur === q.id ? ' on' : '') + '"><span><span class="th-n">' + (i + 1) + '</span>' + esc(meta(q).short) + '</span></a>').join('');
  };
  // Rückweg im Kopf eines Experiments, das zu einer Frage gehört (src/ui/lab.js)
  U.backLink = (e) => {
    const i = QUESTIONS.findIndex((q) => q.exp === e.id);
    return i < 0 ? null : { href: href(QUESTIONS[i].id), label: TITLE() + ' · ' + (i + 1) + '. ' + meta(QUESTIONS[i]).short };
  };

  function overview(el) {
    let h = '<header class="xhead">' + U.fieldBanner('open') + '<div><h1>' + esc(TITLE()) + '</h1><div class="sub">' +
      T('Wo Relativitätstheorie und Quantentheorie an ihre Grenzen kommen', 'Where relativity and quantum theory reach their limits') + '</div></div></header>';
    h += '<div class="prose oq-intro">' + T(
      '<p>Hier geht es um die Stellen, an denen die Allgemeine Relativitätstheorie und die Quantentheorie an ihre Grenzen kommen oder wichtige Fragen offenlassen. Jede Seite trennt drei Dinge: was gesichert ist, was offen bleibt und was die Frage entscheiden würde. Was ungelöst ist, heißt hier „offen“ – spekulative Antworten gibt es nicht. Die Zahlen kommen aus derselben Engine wie überall in der App.</p>',
      '<p>This is about the places where general relativity and quantum theory reach their limits or leave important questions unanswered. Every page separates three things: what is established, what remains open and what would settle the question. Whatever is unresolved is called “open” here – there are no speculative answers. The numbers come from the same engine as everywhere else in the app.</p>') +
      '<ul class="oq-legend">' + ['open', 'partial', 'semi'].map((k) => '<li>' + chip(k) + esc(STATUS[k].text) + '</li>').join('') + '</ul>' +
      '<p class="faint">' + T('Der Status beschreibt die Frage als Ganzes. Die Etiketten im Text – Mathematik, semiklassisch, Messung, offen – kennzeichnen einzelne Aussagen.',
        'The status describes the question as a whole. The labels in the text – mathematics, semiclassical, measurement, open – mark individual statements.') + '</p></div>';
    h += '<div class="th-cards">' + QUESTIONS.map((q, i) => '<a class="th-card" href="' + href(q.id) + '"><span class="th-card-n">' + (i + 1) + '</span><div><h3>' + esc(q.title) + '</h3><p>' + esc(meta(q).teaser) + '</p>' + chip(q.status) + '</div></a>').join('') + '</div>';
    h += '<p class="oq-next">' + T('In Vorbereitung: die kosmologische Konstante, das Messproblem und die Anforderungen an eine Quantengravitation.',
      'In preparation: the cosmological constant, the measurement problem and the requirements for quantum gravity.') + '</p>';
    el.innerHTML = h;
  }

  function render(el) {
    // Feldfarbe für Karten, Inhaltsverzeichnis und Status (styles.css: .oq)
    el.innerHTML = '<div class="oq" data-field="open"></div>';
    const box = el.firstChild;
    const i = QUESTIONS.findIndex((q) => q.id === S.theorySec);
    if (i < 0) { S.theorySec = null; overview(box); } else U.sectionPage(box, CFG, i);
  }

  U.open = { questions: QUESTIONS, meta, STATUS };
  U.views.offen = { sections: true, get title() { const q = QUESTIONS.find((x) => x.id === S.theorySec); return q ? meta(q).short + ' · ' + TITLE() : TITLE(); }, render };
})(globalThis.PP = globalThis.PP || {});
