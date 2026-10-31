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
      id: 'lambda', status: 'open', exp: 'lambda-vac', title: { de: 'Warum ist die kosmologische Konstante so klein?', en: 'Why is the cosmological constant so small?' },
      body: {
        de: () => {
          const MATH = 'Mathematik', MEAS = 'Messung', OPEN = 'offen', QFT = 'Quantenfeldtheorie', EST = 'Abschätzung', SEMI = 'semiklassisch';
          return '<h3 class="th-h3">Die Frage</h3>' +
            '<p>Einstein schrieb 1917 einen zusätzlichen Term in seine Feldgleichungen: ' + t(R`\Lambda\, g_{\mu\nu}`) + ' mit der kosmologischen Konstante Λ.</p>' +
            xq('rel-efe') +
            '<p>Heute ist Λ die einfachste Erklärung dafür, dass sich das Universum beschleunigt ausdehnt. Ihr Wert ist winzig. Die Quantenfeldtheorie sagt aber: Auch der leere Raum hat Energie, und die Gravitation spürt jede Energie. Jede naheliegende Abschätzung dieser Vakuumenergie liegt viele Größenordnungen über dem, was Λ entspricht. Warum ist Λ so klein – und warum trotzdem nicht null?</p>' +
            '<h3 class="th-h3">Was gesichert ist</h3>' +
            '<p>' + kind(MEAS) + ' Ferne Supernovae vom Typ Ia zeigen seit 1998, dass sich die Expansion beschleunigt (Riess u. a. 1998, Perlmutter u. a. 1999). Hintergrundstrahlung und baryonische akustische Oszillationen bestätigen das. Im kosmologischen Standardmodell ΛCDM folgt ' + t(R`\Lambda \approx 1{,}1 \times 10^{-52}\,\mathrm{m}^{-2}`) + ' (Planck 2018) – ein modellabhängiger Wert.</p>' +
            '<div class="oq-dim"><p><b>Λ ist eine Krümmung.</b> ' + kind(MATH) + ' In den Feldgleichungen steht ' + t(R`\Lambda\, g_{\mu\nu}`) + ' neben ' + t(R`G_{\mu\nu}`) + '. Der Einstein-Tensor ist aus zweiten Ableitungen der Metrik gebaut und hat die Dimension 1/Länge²; die Metrik selbst ist dimensionslos. Also hat Λ die Dimension einer Krümmung – es ist die Krümmung, die die Raumzeit auch ganz ohne Materie hätte.</p>' +
            '<p>Jede Krümmung ist „eins durch Länge zum Quadrat“: Eine Kugel mit dem Radius ' + t('r') + ' hat die Krümmung ' + t('1/r^{2}') + '. Deshalb gehört zu Λ eine Länge:</p>' +
            d(R`\ell_\Lambda = \frac{1}{\sqrt{\Lambda}}`) +
            '<p>Das sind ' + t(R`9{,}5 \times 10^{25}\,\mathrm{m}`) + ', rund 10 Milliarden Lichtjahre – vergleichbar mit dem Hubble-Radius ' + t(R`c/H_0`) + ' von etwa 14 Milliarden Lichtjahren. Enthielte die Raumzeit nur Λ, läge ihr Horizont bei ' + t(R`\sqrt{3/\Lambda}`) + ', etwa 17 Milliarden Lichtjahren.</p>' +
            '<p>Weil Λ eine inverse Fläche ist, wird sie in Planck-Einheiten zu einer reinen Zahl – dem Verhältnis zweier Flächen:</p>' +
            d(R`\Lambda\, l_{\mathrm{P}}^{2} = \left(\frac{l_{\mathrm{P}}}{\ell_\Lambda}\right)^{2}`) +
            '<p>Die beiden Längen trennen 61 Größenordnungen. Λ geht mit der Länge hoch minus zwei – also trennen Λ und die Planck-Krümmung ' + t(R`1/l_{\mathrm{P}}^{2}`) + ' 122 Größenordnungen: ' + t(R`\Lambda\, l_{\mathrm{P}}^{2} \approx 3 \times 10^{-122}`) + '. Das ist die berühmte kleine Zahl.</p>' +
            '<p>Rechts vom Gleichheitszeichen gelesen, ist der Λ-Term eine Energiedichte des leeren Raums, überall gleich und für jeden Beobachter dieselbe:</p>' +
            d(R`u_\Lambda = \frac{\Lambda\, c^{4}}{8\pi G}`) +
            '<p>Das sind ' + t(R`5{,}3 \times 10^{-10}\,\mathrm{J/m^{3}}`) + ' – so viel wie die Ruheenergie von dreieinhalb Protonen pro Kubikmeter. Ihr Druck ist minus ihre Energiedichte; deshalb beschleunigt sie die Expansion, statt sie zu bremsen.</p>' +
            '<p>In natürlichen Einheiten (' + t(R`\hbar = c = 1`) + ') ist eine Energiedichte eine Energie hoch vier. Zu ' + t(R`u_\Lambda`) + ' gehört deshalb die Energie ' + t(R`E_\Lambda = \left(u_\Lambda\, (\hbar c)^{3}\right)^{1/4} \approx 2{,}2\,\mathrm{meV}`) + ' und die Länge ' + t(R`\hbar c/E_\Lambda \approx 0{,}09\,\mathrm{mm}`) + ' – etwa die Dicke eines Haares. Auf der logarithmischen Skala liegt sie fast genau in der Mitte zwischen Planck-Länge und ' + t(R`\ell_\Lambda`) + ':</p>' +
            d(R`\frac{\hbar c}{E_\Lambda} = (8\pi)^{1/4} \sqrt{l_{\mathrm{P}}\, \ell_\Lambda}`) +
            '<p>Wie viele Größenordnungen „die“ Lücke hat, hängt also an der Dimension, in der man vergleicht:</p>' +
            '<div class="th-scroll"><table class="t th-cmp"><thead><tr><th>Vergleich</th><th>Dimension</th><th>Größenordnungen</th></tr></thead><tbody>' +
            '<tr><td>' + t(R`\ell_\Lambda / l_{\mathrm{P}}`) + '</td><td>Länge</td><td>≈ 60,8</td></tr>' +
            '<tr><td>' + t(R`1/(\Lambda\, l_{\mathrm{P}}^{2})`) + '</td><td>Krümmung, 1/Länge²</td><td>≈ 121,5</td></tr>' +
            '<tr><td>' + t(R`E_{\mathrm{P}} / E_\Lambda`) + '</td><td>Energie</td><td>≈ 30,7</td></tr>' +
            '<tr><td>' + t(R`u_{\mathrm{vac}}(E_{\mathrm{P}}) / u_\Lambda`) + '</td><td>Energiedichte, Energie⁴/(ħc)³</td><td>≈ 122,9</td></tr>' +
            '</tbody></table></div>' +
            '<p>Länge und Krümmung verbindet der Exponent 2, Energie und Energiedichte der Exponent 4. Beide Paare hängen über ' + t(R`u_\Lambda = \Lambda c^{4}/(8\pi G)`) + ' zusammen: 122,9 = 121,5 + lg 8π.</p></div>' +
            '<div class="oq-dim"><p><b>Zwei Größen mit 1/Länge², eine Entropie.</b> In ' + t(R`\Lambda\, l_{\mathrm{P}}^{2}`) + ' stehen zwei Größen derselben Dimension. Λ kommt aus der Geometrie der Raumzeit. ' + t(R`1/l_{\mathrm{P}}^{2} = c^{3}/(\hbar G)`) + ' enthält das Wirkungsquantum, also die Quantentheorie. Wo beide zusammenkommen, zeigt die Entropie von Horizonten.</p>' +
            '<p>' + kind(QFT) + ' Bekenstein fand 1981 eine Obergrenze für die Entropie eines Körpers mit der Energie ' + t('E') + ' in einer Kugel vom Radius ' + t('R') + ':</p>' +
            d(R`S \le \frac{2\pi k_{\mathrm{B}}\, E R}{\hbar c}`) +
            '<p>Darin stehen ħ und c, aber kein G. Formuliert ist sie für Körper, deren eigene Gravitation keine Rolle spielt. In einer präzisen Fassung folgt sie in der Quantenfeldtheorie aus der Positivität der relativen Entropie (Casini 2008).</p>' +
            '<p>' + kind(MATH) + ' Mehr Energie, als ein gleich großes Schwarzes Loch hat, passt nicht in die Kugel: ' + t(R`E \le R c^{4}/(2G)`) + '. Setzt man das ein, kommt G hinzu – und aus der Schranke wird eine Fläche, gezählt in Planck-Flächen:</p>' +
            d(R`S \le \frac{\pi k_{\mathrm{B}} R^{2}}{l_{\mathrm{P}}^{2}} = \frac{k_{\mathrm{B}} A}{4\, l_{\mathrm{P}}^{2}}`) +
            '<p>' + kind(SEMI) + ' Das ist genau die Bekenstein-Hawking-Entropie: Schwarze Löcher erreichen die Schranke (Bekenstein 1981; zum Faktor 1/4 siehe <a href="#view=offen&amp;sec=quarter">Frage 1</a>).</p>' +
            '<p>' + kind(SEMI) + ' Gibbons und Hawking zeigten 1977: Auch der Horizont einer Raumzeit mit Λ hat eine Temperatur und eine Entropie – nach demselben Flächengesetz. Sein Radius ist ' + t(R`r_{\mathrm{dS}} = \sqrt{3/\Lambda}`) + ', also</p>' +
            d(R`S_{\mathrm{dS}} = \frac{3\pi\, k_{\mathrm{B}}}{\Lambda\, l_{\mathrm{P}}^{2}}`) +
            '<p>Das sind ' + t(R`3{,}3 \times 10^{122}\, k_{\mathrm{B}}`) + ' bei einer Temperatur von ' + t(R`T_{\mathrm{dS}} = \hbar c/(2\pi k_{\mathrm{B}}\, r_{\mathrm{dS}}) \approx 2 \times 10^{-30}\,\mathrm{K}`) + '. Auf diesen Horizont läuft ein Universum mit Λ im ΛCDM-Modell zu.</p>' +
            '<p>' + kind(MATH) + ' Die kleine Zahl von oben ist also der Kehrwert einer Entropie: ' + t(R`\Lambda\, l_{\mathrm{P}}^{2} = 3\pi k_{\mathrm{B}}/S_{\mathrm{dS}}`) + '. Die Geometrie liefert Λ, die Quantentheorie das ħ in ' + t(R`l_{\mathrm{P}}^{2}`) + ' – und ihr Verhältnis zählt die Planck-Flächen auf dem Horizont.</p></div>' +
            '<p>' + kind(QFT) + ' Ohne Gravitation zählen in der Quantenfeldtheorie nur Energieunterschiede; den Nullpunkt der Energie kann man frei wählen. Die Gravitation dagegen spürt jede Energie, auch die des Vakuums. Eine Energiedichte des leeren Raums, die für jeden Beobachter gleich aussieht, hat genau die Form des Λ-Terms – sie wirkt wie ein Beitrag zu Λ. Nullpunktschwankungen sind dabei kein Rechentrick: Lamb-Verschiebung und Casimir-Effekt hängen mit ihnen zusammen. Gemessen werden dort aber Energieunterschiede, nicht die Energiedichte des Vakuums selbst.</p>' +
            '<p>' + kind(EST) + ' Zählt man die Nullpunktenergien ' + t(R`\tfrac{1}{2}\hbar\omega`) + ' aller Feldmoden bis zu einer Abschneide-Energie ' + t(R`E_{\mathrm{c}}`) + ', wächst die Summe wie ' + t(R`E_{\mathrm{c}}^{4}`) + ':</p>' +
            d(R`u_{\mathrm{vac}} \sim \frac{E_{\mathrm{c}}^{4}}{(\hbar c)^{3}}`) +
            '<p>' + kind(MATH) + ' Bei der Planck-Energie hängt das Verhältnis nur noch an der kleinen Zahl von oben:</p>' +
            d(R`\frac{u_{\mathrm{vac}}(E_{\mathrm{P}})}{u_\Lambda} = \frac{8\pi}{\Lambda\, l_{\mathrm{P}}^{2}}`) +
            '<p>Das sind etwa ' + t(R`10^{123}`) + ', mit dem Vorfaktor ' + t(R`1/(16\pi^{2})`) + ' eines einzelnen freien Feldes etwa ' + t(R`10^{121}`) + ' – daher die oft zitierten „120 Größenordnungen“. Bei 1 TeV bleiben etwa ' + t(R`10^{59}`) + ', beim Elektron ' + t(R`10^{33}`) + ' – mit Physik, die gut getestet ist.</p>' +
            '<div class="honest"><b>Einordnung:</b> Die 120 Größenordnungen sind keine Vorhersage der Quantenfeldtheorie. Ein harter Cutoff zeichnet ein Bezugssystem aus und verletzt die Lorentz-Invarianz; die so gezählte Energie verhält sich wie Strahlung, nicht wie Λ. Eine Lorentz-invariante Rechnung ergibt für die bekannten Teilchen eine Vakuumenergie von der Größenordnung ' + t(R`(100\,\mathrm{GeV})^{4}`) + ', rund 55 Größenordnungen über ' + t(R`u_\Lambda`) + ' (Martin 2012). Ähnlich groß ist der Sprung der Vakuumenergie, den das Standardmodell für den elektroschwachen Übergang im frühen Universum vorhersagt. Das Problem wird kleiner, aber es verschwindet nicht.</div>' +
            '<h3 class="th-h3">Was offen ist</h3>' +
            '<p>' + kind(OPEN) + ' Warum die Vakuumenergie nicht so gravitiert, wie die Abschätzungen es nahelegen – oder warum sich alle Beiträge mit einer zusätzlichen Konstante auf Dutzende Stellen genau aufheben. Eine solche Feinabstimmung ist mathematisch erlaubt, aber unerklärt. Das ist das alte Problem der kosmologischen Konstante (Weinberg 1989).</p>' +
            '<p>' + kind(OPEN) + ' Warum Λ trotzdem nicht null ist – und warum ihre Energiedichte gerade heute mit der der Materie vergleichbar ist, etwa 69 zu 31 Prozent (Planck 2018). Im ΛCDM-Modell überwog früher die Materie, künftig bestimmt Λ allein die Expansion. Dieses „Warum gerade jetzt?“ heißt Koinzidenzproblem.</p>' +
            '<p>' + kind(OPEN) + ' Ob Λ wirklich konstant ist. DESI fand 2025 Hinweise, dass sich die Dunkle Energie mit der Zeit ändert – je nach Kombination der Daten mit 2,8 bis 4,2 σ. Für einen Nachweis reicht das noch nicht.</p>' +
            '<p>' + kind(OPEN) + ' Was die Entropie des Λ-Horizonts zählt – das ist so offen wie bei Schwarzen Löchern. Und die Umrechnung ' + t(R`\Lambda\, l_{\mathrm{P}}^{2} = 3\pi k_{\mathrm{B}}/S_{\mathrm{dS}}`) + ' erklärt nicht, warum Λ so klein ist: Sie macht aus der Frage nur eine andere – warum diese Entropie so groß ist.</p>' +
            '<h3 class="th-h3 th-deep">Woher das E⁴ kommt</h3>' +
            '<p>' + kind(MATH) + ' Aus ħ, c und einer Energie ' + t(R`E_{\mathrm{c}}`) + ' lässt sich nur auf eine Weise eine Energiedichte bauen: ' + t(R`E_{\mathrm{c}}^{4}/(\hbar c)^{3}`) + ', eine Energie ' + t(R`E_{\mathrm{c}}`) + ' pro Würfel mit der Kantenlänge ' + t(R`\hbar c/E_{\mathrm{c}}`) + '. Die Dimensionsanalyse legt die Form fest, nur den Vorfaktor liefert die Rechnung. Für ein freies Feld trägt jede Mode die Energie ' + t(R`\tfrac{1}{2}\hbar c k`) + ', und die Zahl der Moden pro Volumen wächst wie ' + t('k^{3}') + ':</p>' +
            d(R`u_{\mathrm{vac},1} = \int_0^{k_{\mathrm{c}}} \frac{4\pi k^{2}\,\mathrm{d}k}{(2\pi)^{3}}\,\frac{\hbar c k}{2} = \frac{E_{\mathrm{c}}^{4}}{16\pi^{2}\,(\hbar c)^{3}}`) +
            '<p>Dabei ist ' + t(R`k_{\mathrm{c}} = E_{\mathrm{c}}/(\hbar c)`) + ' die größte mitgezählte Wellenzahl. Der Vorfaktor ' + t(R`1/(16\pi^{2}) \approx 1/158`) + ' nimmt gut zwei Größenordnungen weg – am Bild ändert das nichts.</p>' +
            '<h3 class="th-h3">Was es entscheiden würde</h3>' +
            '<p>Theoretisch: eine Rechnung, die erklärt, warum die Vakuumenergie der bekannten Felder nicht in dieser Größe gravitiert oder warum sich ihre Beiträge ohne Feinabstimmung aufheben – und die den beobachteten Wert von Λ ergibt. Ob dafür eine Theorie der Quantengravitation nötig ist, ist selbst offen.</p>' +
            '<p>' + kind(MEAS) + ' Ob Λ konstant ist, entscheiden Beobachtungen: Eine kosmologische Konstante verlangt zu allen Zeiten Druck gleich minus Energiedichte. Die vollständigen DESI-Daten und weitere Durchmusterungen werden zeigen, ob die Hinweise von 2025 halten. Ein Nachweis veränderlicher Dunkler Energie löste das alte Problem allerdings nicht – warum die Vakuumenergie nicht riesig ist, bliebe offen.</p>' +
            '<p>' + kind(MEAS) + ' Messbar ist auch die Länge ' + t(R`\hbar c/E_\Lambda \approx 0{,}09\,\mathrm{mm}`) + ': Im Labor gilt Newtons Gravitationsgesetz mit ' + t('1/r^{2}') + ' bis hinunter zu etwa 56 µm, also bis unter diese Länge – ohne Abweichung (Kapner u. a. 2007).</p>' +
            '<h3 class="th-h3">Live in der App</h3>' +
            '<p>Das Experiment hat zwei Regler: die Abschneide-Energie ' + t(R`E_{\mathrm{c}}`) + ' der Abschätzung und Λ selbst. Die Engine rechnet ' + t(R`u_\Lambda`) + ', ' + t(R`u_{\mathrm{vac}}`) + ', ihr Verhältnis, die Längen und die Entropie des Λ-Horizonts aus. Drei Ansichten zeigen, was die Dimension mit den Größenordnungen macht:</p>' +
            '<ul><li><b>Λ = 1/ℓ²</b> ' + kind(MATH) + ' oben Längen, unten Krümmungen 1/Länge² – an derselben Stelle. Aus ≈ 61 Größenordnungen zwischen ' + t(R`l_{\mathrm{P}}`) + ' und ' + t(R`\ell_\Lambda`) + ' werden ≈ 122 zwischen ' + t(R`1/l_{\mathrm{P}}^{2}`) + ' und Λ.</li>' +
            '<li><b>Energiedichte ∝ E⁴</b> ' + kind(EST) + ' oben die Abschneide-Energie, unten die abgeschätzte Energiedichte: Eine Größenordnung in der Energie sind vier in der Energiedichte.</li>' +
            '<li><b>Horizonte S ∝ r²</b> ' + kind(SEMI) + ' oben der Radius eines Horizonts, unten seine Entropie ' + t(R`k_{\mathrm{B}}\pi r^{2}/l_{\mathrm{P}}^{2}`) + ' – für Schwarze Löcher wie für den Λ-Horizont. Aus 61 Größenordnungen im Radius werden 122 in der Entropie.</li></ul>' +
            '<p>Die Presets reichen von der Planck-Energie über 1 TeV, die elektroschwache Skala und das Elektron bis zur Energieskala von Λ, bei der das Verhältnis 1 ist. Das letzte dreht die Frage um: Λ so groß, wie die Planck-Abschätzung es verlangen würde – dann wäre ' + t(R`\ell_\Lambda`) + ' kleiner als die Planck-Länge. „E_c pendeln lassen“ fährt die Abschneide-Energie zwischen der Energieskala von Λ und der Planck-Energie hin und her.</p>' +
            '<p><a class="btn oq-live" href="#exp=lambda-vac">Zum Experiment: Λ = 1/ℓ² →</a> <a class="btn oq-live" href="#exp=lambda-vac&amp;vo=view:rho">Energiedichte ∝ E⁴ →</a> <a class="btn oq-live" href="#exp=lambda-vac&amp;vo=view:hor">Horizonte S ∝ r² →</a></p>' + srcs('lambda-vac');
        },
        en: () => {
          const MATH = 'mathematics', MEAS = 'measurement', OPEN = 'open', QFT = 'quantum field theory', EST = 'estimate', SEMI = 'semiclassical';
          return '<h3 class="th-h3">The question</h3>' +
            '<p>In 1917 Einstein added an extra term to his field equations: ' + t(R`\Lambda\, g_{\mu\nu}`) + ' with the cosmological constant Λ.</p>' +
            xq('rel-efe') +
            '<p>Today Λ is the simplest explanation for the fact that the universe is expanding at an accelerating rate. Its value is tiny. Quantum field theory, however, says that empty space has energy too, and gravity feels every energy. Every obvious estimate of this vacuum energy lies many orders of magnitude above what Λ corresponds to. Why is Λ so small – and why is it not zero after all?</p>' +
            '<h3 class="th-h3">What is established</h3>' +
            '<p>' + kind(MEAS) + ' Since 1998, distant type Ia supernovae have shown that the expansion is accelerating (Riess et al. 1998, Perlmutter et al. 1999). The cosmic microwave background and baryon acoustic oscillations confirm this. In the standard model of cosmology, ΛCDM, it follows that ' + t(R`\Lambda \approx 1.1 \times 10^{-52}\,\mathrm{m}^{-2}`) + ' (Planck 2018) – a model-dependent value.</p>' +
            '<div class="oq-dim"><p><b>Λ is a curvature.</b> ' + kind(MATH) + ' In the field equations, ' + t(R`\Lambda\, g_{\mu\nu}`) + ' stands next to ' + t(R`G_{\mu\nu}`) + '. The Einstein tensor is built from second derivatives of the metric and has the dimension 1/length²; the metric itself is dimensionless. So Λ has the dimension of a curvature – it is the curvature spacetime would have even without any matter.</p>' +
            '<p>Every curvature is “one over length squared”: a sphere of radius ' + t('r') + ' has the curvature ' + t('1/r^{2}') + '. That is why Λ comes with a length:</p>' +
            d(R`\ell_\Lambda = \frac{1}{\sqrt{\Lambda}}`) +
            '<p>That is ' + t(R`9.5 \times 10^{25}\,\mathrm{m}`) + ', around 10 billion light years – comparable to the Hubble radius ' + t(R`c/H_0`) + ' of about 14 billion light years. If spacetime contained only Λ, its horizon would lie at ' + t(R`\sqrt{3/\Lambda}`) + ', about 17 billion light years.</p>' +
            '<p>Because Λ is an inverse area, in Planck units it becomes a pure number – the ratio of two areas:</p>' +
            d(R`\Lambda\, l_{\mathrm{P}}^{2} = \left(\frac{l_{\mathrm{P}}}{\ell_\Lambda}\right)^{2}`) +
            '<p>61 orders of magnitude separate the two lengths. Λ goes with length to the power of minus two – so 122 orders of magnitude separate Λ from the Planck curvature ' + t(R`1/l_{\mathrm{P}}^{2}`) + ': ' + t(R`\Lambda\, l_{\mathrm{P}}^{2} \approx 3 \times 10^{-122}`) + '. That is the famous small number.</p>' +
            '<p>Read on the right-hand side of the equals sign, the Λ term is an energy density of empty space, the same everywhere and the same for every observer:</p>' +
            d(R`u_\Lambda = \frac{\Lambda\, c^{4}}{8\pi G}`) +
            '<p>That is ' + t(R`5.3 \times 10^{-10}\,\mathrm{J/m^{3}}`) + ' – as much as the rest energy of three and a half protons per cubic metre. Its pressure is minus its energy density; that is why it accelerates the expansion instead of slowing it down.</p>' +
            '<p>In natural units (' + t(R`\hbar = c = 1`) + '), an energy density is an energy to the fourth power. So ' + t(R`u_\Lambda`) + ' comes with the energy ' + t(R`E_\Lambda = \left(u_\Lambda\, (\hbar c)^{3}\right)^{1/4} \approx 2.2\,\mathrm{meV}`) + ' and the length ' + t(R`\hbar c/E_\Lambda \approx 0.09\,\mathrm{mm}`) + ' – about the thickness of a hair. On a logarithmic scale it lies almost exactly halfway between the Planck length and ' + t(R`\ell_\Lambda`) + ':</p>' +
            d(R`\frac{\hbar c}{E_\Lambda} = (8\pi)^{1/4} \sqrt{l_{\mathrm{P}}\, \ell_\Lambda}`) +
            '<p>So how many orders of magnitude “the” gap has depends on the dimension in which you compare:</p>' +
            '<div class="th-scroll"><table class="t th-cmp"><thead><tr><th>Comparison</th><th>Dimension</th><th>Orders of magnitude</th></tr></thead><tbody>' +
            '<tr><td>' + t(R`\ell_\Lambda / l_{\mathrm{P}}`) + '</td><td>length</td><td>≈ 60.8</td></tr>' +
            '<tr><td>' + t(R`1/(\Lambda\, l_{\mathrm{P}}^{2})`) + '</td><td>curvature, 1/length²</td><td>≈ 121.5</td></tr>' +
            '<tr><td>' + t(R`E_{\mathrm{P}} / E_\Lambda`) + '</td><td>energy</td><td>≈ 30.7</td></tr>' +
            '<tr><td>' + t(R`u_{\mathrm{vac}}(E_{\mathrm{P}}) / u_\Lambda`) + '</td><td>energy density, energy⁴/(ħc)³</td><td>≈ 122.9</td></tr>' +
            '</tbody></table></div>' +
            '<p>Length and curvature are linked by the exponent 2, energy and energy density by the exponent 4. The two pairs are connected through ' + t(R`u_\Lambda = \Lambda c^{4}/(8\pi G)`) + ': 122.9 = 121.5 + lg 8π.</p></div>' +
            '<div class="oq-dim"><p><b>Two quantities with 1/length², one entropy.</b> ' + t(R`\Lambda\, l_{\mathrm{P}}^{2}`) + ' contains two quantities of the same dimension. Λ comes from the geometry of spacetime. ' + t(R`1/l_{\mathrm{P}}^{2} = c^{3}/(\hbar G)`) + ' contains the quantum of action, i.e. quantum theory. Where the two meet is shown by the entropy of horizons.</p>' +
            '<p>' + kind(QFT) + ' In 1981 Bekenstein found an upper limit for the entropy of a body with energy ' + t('E') + ' inside a sphere of radius ' + t('R') + ':</p>' +
            d(R`S \le \frac{2\pi k_{\mathrm{B}}\, E R}{\hbar c}`) +
            '<p>It contains ħ and c, but no G. It is formulated for bodies whose own gravity plays no role. In a precise version it follows in quantum field theory from the positivity of relative entropy (Casini 2008).</p>' +
            '<p>' + kind(MATH) + ' No more energy fits into the sphere than a black hole of the same size has: ' + t(R`E \le R c^{4}/(2G)`) + '. Insert this and G comes in – and the bound turns into an area, counted in Planck areas:</p>' +
            d(R`S \le \frac{\pi k_{\mathrm{B}} R^{2}}{l_{\mathrm{P}}^{2}} = \frac{k_{\mathrm{B}} A}{4\, l_{\mathrm{P}}^{2}}`) +
            '<p>' + kind(SEMI) + ' That is exactly the Bekenstein–Hawking entropy: black holes attain the bound (Bekenstein 1981; for the factor 1/4 see <a href="#view=offen&amp;sec=quarter">question 1</a>).</p>' +
            '<p>' + kind(SEMI) + ' Gibbons and Hawking showed in 1977 that the horizon of a spacetime with Λ also has a temperature and an entropy – following the same area law. Its radius is ' + t(R`r_{\mathrm{dS}} = \sqrt{3/\Lambda}`) + ', so</p>' +
            d(R`S_{\mathrm{dS}} = \frac{3\pi\, k_{\mathrm{B}}}{\Lambda\, l_{\mathrm{P}}^{2}}`) +
            '<p>That is ' + t(R`3.3 \times 10^{122}\, k_{\mathrm{B}}`) + ' at a temperature of ' + t(R`T_{\mathrm{dS}} = \hbar c/(2\pi k_{\mathrm{B}}\, r_{\mathrm{dS}}) \approx 2 \times 10^{-30}\,\mathrm{K}`) + '. In the ΛCDM model, a universe with Λ approaches this horizon.</p>' +
            '<p>' + kind(MATH) + ' So the small number from above is the inverse of an entropy: ' + t(R`\Lambda\, l_{\mathrm{P}}^{2} = 3\pi k_{\mathrm{B}}/S_{\mathrm{dS}}`) + '. Geometry supplies Λ, quantum theory the ħ in ' + t(R`l_{\mathrm{P}}^{2}`) + ' – and their ratio counts the Planck areas on the horizon.</p></div>' +
            '<p>' + kind(QFT) + ' Without gravity, only energy differences count in quantum field theory; the zero of energy can be chosen freely. Gravity, by contrast, feels every energy, including that of the vacuum. An energy density of empty space that looks the same to every observer has exactly the form of the Λ term – it acts like a contribution to Λ. Zero-point fluctuations are not a trick of the calculation: the Lamb shift and the Casimir effect are connected with them. What is measured there, however, are energy differences, not the energy density of the vacuum itself.</p>' +
            '<p>' + kind(EST) + ' If you count the zero-point energies ' + t(R`\tfrac{1}{2}\hbar\omega`) + ' of all field modes up to a cutoff energy ' + t(R`E_{\mathrm{c}}`) + ', the sum grows like ' + t(R`E_{\mathrm{c}}^{4}`) + ':</p>' +
            d(R`u_{\mathrm{vac}} \sim \frac{E_{\mathrm{c}}^{4}}{(\hbar c)^{3}}`) +
            '<p>' + kind(MATH) + ' At the Planck energy, the ratio depends only on the small number from above:</p>' +
            d(R`\frac{u_{\mathrm{vac}}(E_{\mathrm{P}})}{u_\Lambda} = \frac{8\pi}{\Lambda\, l_{\mathrm{P}}^{2}}`) +
            '<p>That is about ' + t(R`10^{123}`) + ', and with the prefactor ' + t(R`1/(16\pi^{2})`) + ' of a single free field about ' + t(R`10^{121}`) + ' – hence the often-quoted “120 orders of magnitude”. At 1 TeV about ' + t(R`10^{59}`) + ' remain, at the electron ' + t(R`10^{33}`) + ' – with physics that is well tested.</p>' +
            '<div class="honest"><b>Perspective:</b> the 120 orders of magnitude are not a prediction of quantum field theory. A hard cutoff singles out a frame of reference and violates Lorentz invariance; the energy counted this way behaves like radiation, not like Λ. A Lorentz-invariant calculation gives a vacuum energy of the order of ' + t(R`(100\,\mathrm{GeV})^{4}`) + ' for the known particles, around 55 orders of magnitude above ' + t(R`u_\Lambda`) + ' (Martin 2012). The jump in vacuum energy that the Standard Model predicts for the electroweak transition in the early universe is of a similar size. The problem becomes smaller, but it does not go away.</div>' +
            '<h3 class="th-h3">What remains open</h3>' +
            '<p>' + kind(OPEN) + ' Why the vacuum energy does not gravitate the way the estimates suggest – or why all contributions cancel against an additional constant to dozens of digits. Such fine-tuning is mathematically allowed, but unexplained. This is the old cosmological constant problem (Weinberg 1989).</p>' +
            '<p>' + kind(OPEN) + ' Why Λ is not zero after all – and why its energy density is comparable to that of matter just now, about 69 to 31 per cent (Planck 2018). In the ΛCDM model matter dominated earlier; in the future Λ alone will determine the expansion. This “why just now?” is called the coincidence problem.</p>' +
            '<p>' + kind(OPEN) + ' Whether Λ is really constant. In 2025 DESI found hints that dark energy changes over time – at 2.8 to 4.2 σ, depending on how the data are combined. That is not yet enough for a detection.</p>' +
            '<p>' + kind(OPEN) + ' What the entropy of the Λ horizon counts – that is as open as for black holes. And the conversion ' + t(R`\Lambda\, l_{\mathrm{P}}^{2} = 3\pi k_{\mathrm{B}}/S_{\mathrm{dS}}`) + ' does not explain why Λ is so small: it only turns the question into another one – why this entropy is so large.</p>' +
            '<h3 class="th-h3 th-deep">Where the E⁴ comes from</h3>' +
            '<p>' + kind(MATH) + ' From ħ, c and an energy ' + t(R`E_{\mathrm{c}}`) + ' you can build an energy density in only one way: ' + t(R`E_{\mathrm{c}}^{4}/(\hbar c)^{3}`) + ', one energy ' + t(R`E_{\mathrm{c}}`) + ' per cube with the edge length ' + t(R`\hbar c/E_{\mathrm{c}}`) + '. Dimensional analysis fixes the form; only the prefactor needs the calculation. For a free field, each mode carries the energy ' + t(R`\tfrac{1}{2}\hbar c k`) + ', and the number of modes per volume grows like ' + t('k^{3}') + ':</p>' +
            d(R`u_{\mathrm{vac},1} = \int_0^{k_{\mathrm{c}}} \frac{4\pi k^{2}\,\mathrm{d}k}{(2\pi)^{3}}\,\frac{\hbar c k}{2} = \frac{E_{\mathrm{c}}^{4}}{16\pi^{2}\,(\hbar c)^{3}}`) +
            '<p>Here ' + t(R`k_{\mathrm{c}} = E_{\mathrm{c}}/(\hbar c)`) + ' is the largest wave number counted. The prefactor ' + t(R`1/(16\pi^{2}) \approx 1/158`) + ' takes away a little over two orders of magnitude – it does not change the picture.</p>' +
            '<h3 class="th-h3">What would settle it</h3>' +
            '<p>Theoretically: a calculation that explains why the vacuum energy of the known fields does not gravitate at this size, or why its contributions cancel without fine-tuning – and that gives the observed value of Λ. Whether this requires a theory of quantum gravity is itself open.</p>' +
            '<p>' + kind(MEAS) + ' Whether Λ is constant will be decided by observations: a cosmological constant requires pressure equal to minus the energy density at all times. The full DESI data and further surveys will show whether the hints from 2025 hold up. A detection of time-varying dark energy would not solve the old problem, though – why the vacuum energy is not huge would remain open.</p>' +
            '<p>' + kind(MEAS) + ' The length ' + t(R`\hbar c/E_\Lambda \approx 0.09\,\mathrm{mm}`) + ' can be probed as well: in the laboratory, Newton’s law of gravitation with ' + t('1/r^{2}') + ' holds down to about 56 µm, i.e. below this length – with no deviation (Kapner et al. 2007).</p>' +
            '<h3 class="th-h3">Live in the app</h3>' +
            '<p>The experiment has two sliders: the cutoff energy ' + t(R`E_{\mathrm{c}}`) + ' of the estimate and Λ itself. The engine calculates ' + t(R`u_\Lambda`) + ', ' + t(R`u_{\mathrm{vac}}`) + ', their ratio, the lengths and the entropy of the Λ horizon. Three views show what the dimension does to the orders of magnitude:</p>' +
            '<ul><li><b>Λ = 1/ℓ²</b> ' + kind(MATH) + ' lengths on top, curvatures 1/length² below – at the same place. ≈ 61 orders of magnitude between ' + t(R`l_{\mathrm{P}}`) + ' and ' + t(R`\ell_\Lambda`) + ' become ≈ 122 between ' + t(R`1/l_{\mathrm{P}}^{2}`) + ' and Λ.</li>' +
            '<li><b>Energy density ∝ E⁴</b> ' + kind(EST) + ' the cutoff energy on top, the estimated energy density below: one order of magnitude in energy is four in energy density.</li>' +
            '<li><b>Horizons S ∝ r²</b> ' + kind(SEMI) + ' the radius of a horizon on top, its entropy ' + t(R`k_{\mathrm{B}}\pi r^{2}/l_{\mathrm{P}}^{2}`) + ' below – for black holes as for the Λ horizon. 61 orders of magnitude in radius become 122 in entropy.</li></ul>' +
            '<p>The presets range from the Planck energy via 1 TeV, the electroweak scale and the electron down to the energy scale of Λ, where the ratio is 1. The last one turns the question around: Λ as large as the Planck estimate would require – then ' + t(R`\ell_\Lambda`) + ' would be smaller than the Planck length. “Oscillate E_c” moves the cutoff energy back and forth between the energy scale of Λ and the Planck energy.</p>' +
            '<p><a class="btn oq-live" href="#exp=lambda-vac">To the experiment: Λ = 1/ℓ² →</a> <a class="btn oq-live" href="#exp=lambda-vac&amp;vo=view:rho">Energy density ∝ E⁴ →</a> <a class="btn oq-live" href="#exp=lambda-vac&amp;vo=view:hor">Horizons S ∝ r² →</a></p>' + srcs('lambda-vac');
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
    /* ------------------------------------------------------------ */
    {
      id: 'mess', status: 'open', exp: 'decoherence', title: { de: 'Das Messproblem', en: 'The measurement problem' },
      body: {
        de: () => {
          const MATH = 'Mathematik', QM = 'Quantenmechanik', OPEN = 'offen', MEAS = 'Messung';
          return '<h3 class="th-h3">Die Frage</h3>' +
            '<p>Ein Teilchen fliegt durch ein Interferometer mit zwei Wegen. Die Quantenmechanik beschreibt es als Überlagerung ' + t(R`|\psi\rangle = a\,|1\rangle + b\,|2\rangle`) + ' – nicht als Teilchen auf Weg 1 oder auf Weg 2. Auf dem Schirm landet es trotzdem an genau einer Stelle. Erst viele Teilchen zusammen zeichnen Streifen, und die entstehen nur, wenn beide Wege beteiligt waren.</p>' +
            '<p>Die Schrödinger-Gleichung ist linear. Misst ein Gerät den Weg, wird es nach ihr selbst Teil der Überlagerung (von Neumann 1932):</p>' +
            d(R`|\psi\rangle|M_0\rangle \;\rightarrow\; a\,|1\rangle|M_1\rangle + b\,|2\rangle|M_2\rangle`) +
            '<p>Abgelesen wird aber immer genau eine Zeigerstellung, ' + t('M_1') + ' oder ' + t('M_2') + ', mit den Wahrscheinlichkeiten ' + t(R`|a|^{2}`) + ' und ' + t(R`|b|^{2}`) + '. Wie wird aus dem „und“ der Gleichung das „oder“ der Messung?</p>' +
            '<h3 class="th-h3">Was gesichert ist</h3>' +
            '<p>' + kind(QM) + ' Die Wahrscheinlichkeiten folgen aus den Amplituden, ' + t(R`p_1 = |a|^{2}`) + ' und ' + t(R`p_2 = |b|^{2}`) + ' (Born 1926). In der Standardformulierung ist diese Born-Regel ein Postulat, und sie ist genau geprüft: Bei drei Spalten gibt es nach ihr nur Interferenz zwischen Paaren von Wegen. Ein Anteil, an dem alle drei zugleich beteiligt wären, ist kleiner als ein Hundertstel der gewöhnlichen Interferenz (Sinha u. a. 2010).</p>' +
            '<p>' + kind(MEAS) + ' Überlagerungen sind nicht auf kleine Teilchen beschränkt: Moleküle mit bis zu 2000 Atomen und mehr als 25 000 u zeigen Interferenz (Fein u. a. 2019). Eine Grenze, ab der die Quantenmechanik nicht mehr gilt, hat kein Experiment gefunden.</p>' +
            '<p>' + kind(QM) + ' Kein Teilchen ist ganz isoliert. Stößt ein Gasmolekül oder ein Wärmephoton an, hängt dessen Zustand danach davon ab, welchen Weg das Teilchen nahm – die Umgebung wird zum Messgerät:</p>' +
            d(R`|\Psi\rangle = a\,|1\rangle|E_1\rangle + b\,|2\rangle|E_2\rangle`) +
            '<p>' + kind(MATH) + ' Wer nur auf das Teilchen schaut, findet Streifen mit der Sichtbarkeit</p>' +
            d(R`V = 2\sqrt{p_1 p_2}\,\left|\langle E_1 | E_2 \rangle\right|`) +
            '<p>Sind die Zustände der Umgebung gleich, bleiben die Streifen. Sind sie verschieden – die Umgebung „weiß“, welchen Weg das Teilchen nahm –, verschwinden sie. Das ist <b>Dekohärenz</b> (Zeh 1970). Zur Sichtbarkeit gehört die Weginformation ' + t('D') + ': wie gut sich der Weg vorhersagen oder an der Umgebung ablesen lässt. Ist der Gesamtzustand rein, gilt genau (Englert 1996)</p>' +
            d(R`V^{2} + D^{2} = 1`) +
            '<p>' + kind(MEAS) + ' Dekohärenz ist gemessen. Haroche und seine Gruppe sahen 1996, wie eine Überlagerung zweier Feldzustände in einem Resonator nach und nach zur Mischung wurde (Brune u. a. 1996). Bei Fullerenen fällt die Sichtbarkeit exponentiell mit dem Gasdruck (Hornberger u. a. 2003) und verschwindet, wenn die Moleküle heiß genug sind, um Wärmephotonen abzustrahlen (Hackermüller u. a. 2004).</p>' +
            '<div class="honest"><b>Einordnung:</b> Dekohärenz erklärt, warum man an Alltagsgegenständen keine Interferenz sieht und warum ein Zeiger stabil „hier“ oder „dort“ steht: Die Umgebung bevorzugt die Zustände, die sie nicht zerstört (Zurek 2003). Sie erklärt nicht, warum genau ein Ergebnis eintritt. Der Gesamtzustand bleibt eine Überlagerung – das „oder“ der Mischung ist ein „und“, das man nur nicht mehr sieht.</div>' +
            '<p>Zusammengefasst:</p>' +
            '<div class="th-scroll"><table class="t th-cmp"><thead><tr><th>Die Theorie sagt</th><th>Experimente zeigen</th><th>Offen ist</th></tr></thead><tbody>' +
            '<tr><td><b>Überlagerung:</b> lineare Zeitentwicklung, auch für Messgeräte</td><td>Interferenz bis über 25 000 u (2019)</td><td>warum nie eine Überlagerung von Zeigerstellungen abgelesen wird</td></tr>' +
            '<tr><td><b>Wahrscheinlichkeiten:</b> Born-Regel, ' + t(R`p = |a|^{2}`) + '</td><td>bestätigt; Interferenz dritter Ordnung unter einem Hundertstel (2010)</td><td>ob die Born-Regel aus den übrigen Annahmen folgt</td></tr>' +
            '<tr><td><b>Dekohärenz:</b> Die Sichtbarkeit fällt mit dem Überlapp der Umgebungszustände</td><td>gemessen im Resonator (1996) und an Fullerenen (2003, 2004)</td><td>warum genau ein Ergebnis eintritt</td></tr>' +
            '<tr><td><b>Gravitation:</b> Die Feldgleichungen brauchen einen bestimmten Wert für ' + t(R`T_{\mu\nu}`) + '</td><td>noch kein Experiment mit Massen in Überlagerung, das ihre Gravitation misst; Tests vorgeschlagen (2017)</td><td>wie eine Überlagerung gravitiert</td></tr>' +
            '</tbody></table></div>' +
            '<h3 class="th-h3">Was offen ist</h3>' +
            '<p>' + kind(OPEN) + ' Das einzelne Ergebnis: Warum zeigt eine Messung genau eines, wenn die Schrödinger-Gleichung nur Überlagerungen liefert? Dekohärenz trennt die Möglichkeiten so, dass sie sich nicht mehr stören – eine auswählen tut sie nicht.</p>' +
            '<p>' + kind(OPEN) + ' Die Wahrscheinlichkeiten: Ob die Born-Regel aus den übrigen Grundannahmen folgt oder ein eigenes Postulat bleiben muss, ist umstritten.</p>' +
            '<p>' + kind(OPEN) + ' Was eine Messung physikalisch ist. Die Interpretationen der Quantenmechanik beantworten das verschieden und machen für alle bisherigen Experimente dieselben Vorhersagen (siehe ' + sec('qm', 'Quantenmechanik – die Idee') + '). Welche zutrifft, ist offen.</p>' +
            '<p>' + kind(OPEN) + ' Wie eine Masse in Überlagerung gravitiert. Die Feldgleichungen brauchen einen bestimmten Wert für ' + t(R`T_{\mu\nu}`) + ' (siehe ' + sec('gap', 'Welche Geometrie hat eine Überlagerung?') + '). Ob die Gravitation zwei Massen verschränken kann, ist experimentell nicht entschieden.</p>' +
            '<h3 class="th-h3 th-deep">Warum die Streifen exponentiell verschwinden</h3>' +
            '<p>' + kind(MATH) + ' Jeder Stoß hinterlässt die Umgebung in einem von zwei Zuständen, je nach Weg; ihr Überlapp sei ' + t(R`\gamma`) + '. Nach ' + t('k') + ' Stößen multiplizieren sich die Überlappe zu ' + t(R`\gamma^{k}`) + '. Ist die Zahl der Stöße Poisson-verteilt mit dem Mittelwert ' + t('N') + ', ist der Überlapp ' + t(R`\left|\langle E_1 | E_2 \rangle\right|`) + ' im Mittel</p>' +
            d(R`\sum_{k=0}^{\infty} \frac{N^{k} e^{-N}}{k!}\,\gamma^{k} = e^{-N(1-\gamma)}`) +
            '<p>' + t('N') + ' wächst mit dem Gasdruck – daher der exponentielle Abfall, den Hornberger u. a. 2003 gemessen haben. Es zählt nur ' + t(R`N(1-\gamma)`) + ': Viele Stöße, die wenig verraten, wirken wie wenige, die viel verraten. Bei ' + t(R`\gamma = 0`) + ' verrät jeder Stoß den Weg ganz. Streifen kommen dann nur noch von den Teilchen, die gar nicht gestoßen wurden – im Mittel der Anteil ' + t(R`e^{-N}`) + '.</p>' +
            '<h3 class="th-h3 th-deep">Mischung oder Überlagerung?</h3>' +
            '<p>' + kind(QM) + ' Das Teilchen allein beschreibt eine Dichtematrix ' + t(R`\rho`) + '. Auf ihrer Diagonale stehen die Wahrscheinlichkeiten ' + t('p_1') + ' und ' + t('p_2') + ', außerhalb die Kohärenz</p>' +
            d(R`|\rho_{12}| = \sqrt{p_1 p_2}\,\left|\langle E_1 | E_2 \rangle\right|`) +
            '<p>Dekohärenz löscht nur die Kohärenz. Danach sieht ' + t(R`\rho`) + ' genauso aus wie bei einem Teilchen, das mit der Wahrscheinlichkeit ' + t('p_1') + ' den einen und mit ' + t('p_2') + ' den anderen Weg nahm – für jede Messung am Teilchen allein. Dasselbe ist es trotzdem nicht: Hier steht kein Weg fest, den man nur nicht kennt. Teilchen und Umgebung zusammen sind weiter in einer Überlagerung, ihr gemeinsamer Zustand bleibt rein.</p>' +
            '<h3 class="th-h3">Was es entscheiden würde</h3>' +
            '<p>Theoretisch: eine Herleitung, warum eine Messung genau ein Ergebnis liefert, und zwar mit den Wahrscheinlichkeiten der Born-Regel – ohne die Vorhersagen zu ändern, die so genau bestätigt sind. Solange alle Interpretationen dieselben Vorhersagen machen, kann kein Experiment zwischen ihnen entscheiden.</p>' +
            '<p>' + kind(MEAS) + ' Prüfen lässt sich, ob Überlagerungen bei immer größeren Massen bestehen bleiben. Eine Abweichung, die sich nicht durch Dekohärenz erklären lässt, wäre ein Hinweis, dass die Quantenmechanik dort nicht mehr gilt. Bisher gibt es keine.</p>' +
            '<p>' + kind(MEAS) + ' Vorgeschlagen sind Tischexperimente, in denen sich zwei Massen nur über ihre Gravitation verschränken sollen (Bose u. a. 2017; Marletto und Vedral 2017). Gelänge das, hätte die Gravitation Quanteneigenschaften. Dafür müssten Teilchen von etwa ' + t(R`10^{-14}\,\mathrm{kg}`) + ' rund eine Sekunde lang in einer Überlagerung bleiben, deren Teile Hunderte Mikrometer auseinanderliegen – rund acht Größenordnungen schwerer als die schwersten Moleküle, die bisher interferiert haben. Durchgeführt ist es noch nicht.</p>' +
            '<h3 class="th-h3">Live in der App</h3>' +
            '<p>Das Experiment schickt Teilchen einzeln durch ein Interferometer mit zwei Wegen. Mit ' + t('p_1') + ' stellst du die Gewichte der Wege ein, mit ' + t('N') + ' und ' + t(R`\gamma`) + ' die Umgebung. Die Engine rechnet die Sichtbarkeit ' + t('V') + ', die Weginformation ' + t('D') + ' und den Zustand des Teilchens aus. Zwei Ansichten:</p>' +
            '<ul><li><b>Schirm</b> ' + kind(QM) + ' Jeder Punkt ist ein einzelnes Ergebnis, die Kurve die Verteilung ' + t(R`|\psi|^{2}`) + ' aus der Engine. Erst viele Punkte zeigen die Streifen. Welcher Punkt als Nächstes kommt, entscheidet im Bild ein Zufallsgenerator – die Theorie sagt nur die Verteilung voraus.</li>' +
            '<li><b>Wegzustand ρ</b> ' + kind(QM) + ' die Dichtematrix des Teilchens: Mit der Umgebung verschwindet die Kohärenz, die Wahrscheinlichkeiten bleiben. Daneben ' + t(R`V^{2} + D^{2} = 1`) + ' als Balken.</li></ul>' +
            '<p>„Teilchen schicken“ lässt 50 Teilchen pro Sekunde los. Die Presets zeigen ein Interferometer ohne Umgebung, viele schwache Stöße wie im Gas, einen Welcher-Weg-Detektor und ungleich gewichtete Wege. Der Schirm ist schematisch; die Formeln für ' + t('V') + ', ' + t('D') + ' und ' + t(R`\rho`) + ' gelten für jedes Interferometer mit zwei Wegen, das Stoßmodell ist eine Vereinfachung.</p>' +
            '<p><a class="btn oq-live" href="#exp=decoherence">Zum Experiment: Schirm →</a> <a class="btn oq-live" href="#exp=decoherence&amp;vo=view:state">Wegzustand ρ →</a></p>' + srcs('decoherence');
        },
        en: () => {
          const MATH = 'mathematics', QM = 'quantum mechanics', OPEN = 'open', MEAS = 'measurement';
          return '<h3 class="th-h3">The question</h3>' +
            '<p>A particle flies through an interferometer with two paths. Quantum mechanics describes it as a superposition ' + t(R`|\psi\rangle = a\,|1\rangle + b\,|2\rangle`) + ' – not as a particle on path 1 or on path 2. Yet it lands at exactly one place on the screen. Only many particles together draw fringes, and these arise only if both paths were involved.</p>' +
            '<p>The Schrödinger equation is linear. If a device measures the path, according to the equation the device itself becomes part of the superposition (von Neumann 1932):</p>' +
            d(R`|\psi\rangle|M_0\rangle \;\rightarrow\; a\,|1\rangle|M_1\rangle + b\,|2\rangle|M_2\rangle`) +
            '<p>Yet what is read off is always exactly one pointer position, ' + t('M_1') + ' or ' + t('M_2') + ', with the probabilities ' + t(R`|a|^{2}`) + ' and ' + t(R`|b|^{2}`) + '. How does the “and” of the equation become the “or” of the measurement?</p>' +
            '<h3 class="th-h3">What is established</h3>' +
            '<p>' + kind(QM) + ' The probabilities follow from the amplitudes, ' + t(R`p_1 = |a|^{2}`) + ' and ' + t(R`p_2 = |b|^{2}`) + ' (Born 1926). In the standard formulation this Born rule is a postulate, and it has been tested precisely: with three slits, it allows interference only between pairs of paths. A contribution involving all three at once is smaller than one hundredth of the ordinary interference (Sinha et al. 2010).</p>' +
            '<p>' + kind(MEAS) + ' Superpositions are not limited to small particles: molecules with up to 2000 atoms and more than 25,000 u show interference (Fein et al. 2019). No experiment has found a limit beyond which quantum mechanics no longer holds.</p>' +
            '<p>' + kind(QM) + ' No particle is completely isolated. If a gas molecule or a thermal photon bumps into it, the state of that molecule or photon afterwards depends on which path the particle took – the environment becomes a measuring device:</p>' +
            d(R`|\Psi\rangle = a\,|1\rangle|E_1\rangle + b\,|2\rangle|E_2\rangle`) +
            '<p>' + kind(MATH) + ' Looking at the particle alone, you find fringes with the visibility</p>' +
            d(R`V = 2\sqrt{p_1 p_2}\,\left|\langle E_1 | E_2 \rangle\right|`) +
            '<p>If the states of the environment are the same, the fringes remain. If they differ – the environment “knows” which path the particle took – they disappear. That is <b>decoherence</b> (Zeh 1970). Visibility comes with the which-path information ' + t('D') + ': how well the path can be predicted or read off from the environment. If the total state is pure, exactly (Englert 1996)</p>' +
            d(R`V^{2} + D^{2} = 1`) +
            '<p>' + kind(MEAS) + ' Decoherence has been measured. In 1996 Haroche and his group watched a superposition of two field states in a cavity gradually turn into a mixture (Brune et al. 1996). With fullerenes, the visibility falls exponentially with the gas pressure (Hornberger et al. 2003) and disappears when the molecules are hot enough to emit thermal photons (Hackermüller et al. 2004).</p>' +
            '<div class="honest"><b>Perspective:</b> decoherence explains why no interference is seen with everyday objects and why a pointer stays stably “here” or “there”: the environment favours the states it does not destroy (Zurek 2003). It does not explain why exactly one outcome occurs. The total state remains a superposition – the “or” of the mixture is an “and” that can no longer be seen.</div>' +
            '<p>In summary:</p>' +
            '<div class="th-scroll"><table class="t th-cmp"><thead><tr><th>Theory says</th><th>Experiments show</th><th>Open</th></tr></thead><tbody>' +
            '<tr><td><b>Superposition:</b> linear time evolution, also for measuring devices</td><td>interference up to more than 25,000 u (2019)</td><td>why a superposition of pointer positions is never read off</td></tr>' +
            '<tr><td><b>Probabilities:</b> Born rule, ' + t(R`p = |a|^{2}`) + '</td><td>confirmed; third-order interference below one hundredth (2010)</td><td>whether the Born rule follows from the other assumptions</td></tr>' +
            '<tr><td><b>Decoherence:</b> the visibility falls with the overlap of the environment states</td><td>measured in a cavity (1996) and with fullerenes (2003, 2004)</td><td>why exactly one outcome occurs</td></tr>' +
            '<tr><td><b>Gravity:</b> the field equations need a definite value for ' + t(R`T_{\mu\nu}`) + '</td><td>no experiment yet that measures the gravity of masses in superposition; tests proposed (2017)</td><td>how a superposition gravitates</td></tr>' +
            '</tbody></table></div>' +
            '<h3 class="th-h3">What remains open</h3>' +
            '<p>' + kind(OPEN) + ' The single outcome: why does a measurement show exactly one, if the Schrödinger equation only yields superpositions? Decoherence separates the possibilities so that they no longer interfere – it does not pick one.</p>' +
            '<p>' + kind(OPEN) + ' The probabilities: whether the Born rule follows from the other basic assumptions or has to remain a postulate of its own is disputed.</p>' +
            '<p>' + kind(OPEN) + ' What a measurement physically is. The interpretations of quantum mechanics answer this differently and make the same predictions for all experiments so far (see ' + sec('qm', 'Quantum mechanics – the idea') + '). Which one is right is open.</p>' +
            '<p>' + kind(OPEN) + ' How a mass in superposition gravitates. The field equations need a definite value for ' + t(R`T_{\mu\nu}`) + ' (see ' + sec('gap', 'What geometry does a superposition have?') + '). Whether gravity can entangle two masses has not been decided experimentally.</p>' +
            '<h3 class="th-h3 th-deep">Why the fringes disappear exponentially</h3>' +
            '<p>' + kind(MATH) + ' Each collision leaves the environment in one of two states, depending on the path; let their overlap be ' + t(R`\gamma`) + '. After ' + t('k') + ' collisions the overlaps multiply to ' + t(R`\gamma^{k}`) + '. If the number of collisions is Poisson-distributed with mean ' + t('N') + ', the overlap ' + t(R`\left|\langle E_1 | E_2 \rangle\right|`) + ' is on average</p>' +
            d(R`\sum_{k=0}^{\infty} \frac{N^{k} e^{-N}}{k!}\,\gamma^{k} = e^{-N(1-\gamma)}`) +
            '<p>' + t('N') + ' grows with the gas pressure – hence the exponential decrease that Hornberger et al. measured in 2003. Only ' + t(R`N(1-\gamma)`) + ' counts: many collisions that reveal little act like a few that reveal a lot. At ' + t(R`\gamma = 0`) + ' every collision reveals the path completely. The fringes then come only from the particles that were not hit at all – on average the fraction ' + t(R`e^{-N}`) + '.</p>' +
            '<h3 class="th-h3 th-deep">Mixture or superposition?</h3>' +
            '<p>' + kind(QM) + ' The particle on its own is described by a density matrix ' + t(R`\rho`) + '. Its diagonal holds the probabilities ' + t('p_1') + ' and ' + t('p_2') + ', the off-diagonal the coherence</p>' +
            d(R`|\rho_{12}| = \sqrt{p_1 p_2}\,\left|\langle E_1 | E_2 \rangle\right|`) +
            '<p>Decoherence erases only the coherence. Afterwards ' + t(R`\rho`) + ' looks exactly like that of a particle that took one path with probability ' + t('p_1') + ' and the other with ' + t('p_2') + ' – for every measurement on the particle alone. Still, it is not the same: here no path is fixed that is merely unknown. Particle and environment together are still in a superposition; their joint state remains pure.</p>' +
            '<h3 class="th-h3">What would settle it</h3>' +
            '<p>Theoretically: a derivation of why a measurement yields exactly one outcome, and with the probabilities of the Born rule – without changing the predictions that are so precisely confirmed. As long as all interpretations make the same predictions, no experiment can decide between them.</p>' +
            '<p>' + kind(MEAS) + ' What can be tested is whether superpositions persist for ever larger masses. A deviation that decoherence cannot explain would be a sign that quantum mechanics no longer holds there. So far there is none.</p>' +
            '<p>' + kind(MEAS) + ' Tabletop experiments have been proposed in which two masses are to become entangled only through their gravity (Bose et al. 2017; Marletto and Vedral 2017). If that succeeded, gravity would have quantum properties. It would require particles of about ' + t(R`10^{-14}\,\mathrm{kg}`) + ' to stay for around a second in a superposition whose parts are hundreds of micrometres apart – some eight orders of magnitude heavier than the heaviest molecules that have shown interference so far. It has not been carried out yet.</p>' +
            '<h3 class="th-h3">Live in the app</h3>' +
            '<p>The experiment sends particles one at a time through an interferometer with two paths. ' + t('p_1') + ' sets the weights of the paths, ' + t('N') + ' and ' + t(R`\gamma`) + ' the environment. The engine calculates the visibility ' + t('V') + ', the which-path information ' + t('D') + ' and the state of the particle. Two views:</p>' +
            '<ul><li><b>Screen</b> ' + kind(QM) + ' each dot is a single outcome, the curve the distribution ' + t(R`|\psi|^{2}`) + ' from the engine. Only many dots show the fringes. Which dot comes next is decided in the picture by a random number generator – the theory only predicts the distribution.</li>' +
            '<li><b>Path state ρ</b> ' + kind(QM) + ' the density matrix of the particle: with the environment, the coherence disappears while the probabilities remain. Next to it, ' + t(R`V^{2} + D^{2} = 1`) + ' as a bar.</li></ul>' +
            '<p>“Send particles” releases 50 particles per second. The presets show an interferometer without an environment, many weak collisions as in a gas, a which-path detector and unequally weighted paths. The screen is schematic; the formulas for ' + t('V') + ', ' + t('D') + ' and ' + t(R`\rho`) + ' hold for every interferometer with two paths, the collision model is a simplification.</p>' +
            '<p><a class="btn oq-live" href="#exp=decoherence">To the experiment: screen →</a> <a class="btn oq-live" href="#exp=decoherence&amp;vo=view:state">Path state ρ →</a></p>' + srcs('decoherence');
        },
      },
    },
  ]);

  const TITLE = () => T('Offene Fragen', 'Open questions');
  const META = I.localize({
    quarter: { short: { de: 'Warum genau 1/4?', en: 'Why exactly 1/4?' }, teaser: { de: 'Der Vorfaktor der Entropie Schwarzer Löcher ist festgelegt – was sie zählt, ist offen.', en: 'The prefactor of black hole entropy is fixed – what it counts is open.' } },
    lambda: { short: { de: 'Warum ist Λ so klein?', en: 'Why is Λ so small?' }, teaser: { de: 'Λ ist eine Krümmung, 1/Länge². In Planck-Einheiten ist sie 10⁻¹²² – weit kleiner als jede Abschätzung der Vakuumenergie.', en: 'Λ is a curvature, 1/length². In Planck units it is 10⁻¹²² – far smaller than any estimate of the vacuum energy.' } },
    info: { short: { de: 'Geht Information verloren?', en: 'Is information lost?' }, teaser: { de: 'Ein Schwarzes Loch verdampft. Steckt die Information über seinen Anfang am Ende in der Strahlung?', en: 'A black hole evaporates. Does the information about its beginning end up in the radiation?' } },
    mess: { short: { de: 'Das Messproblem', en: 'The measurement problem' }, teaser: { de: 'Die Schrödinger-Gleichung kennt nur Überlagerungen. Warum liefert eine Messung genau ein Ergebnis?', en: 'The Schrödinger equation knows only superpositions. Why does a measurement give exactly one result?' } },
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
      '<p class="faint">' + T('Der Status beschreibt die Frage als Ganzes. Die Etiketten im Text – Mathematik, semiklassisch, Abschätzung, Messung, offen – kennzeichnen einzelne Aussagen.',
        'The status describes the question as a whole. The labels in the text – mathematics, semiclassical, estimate, measurement, open – mark individual statements.') + '</p></div>';
    h += '<div class="th-cards">' + QUESTIONS.map((q, i) => '<a class="th-card" href="' + href(q.id) + '"><span class="th-card-n">' + (i + 1) + '</span><div><h3>' + esc(q.title) + '</h3><p>' + esc(meta(q).teaser) + '</p>' + chip(q.status) + '</div></a>').join('') + '</div>';
    h += '<p class="oq-next">' + T('In Vorbereitung: die Anforderungen an eine Quantengravitation.',
      'In preparation: the requirements for quantum gravity.') + '</p>';
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
