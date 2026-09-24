/* =====================================================================
   Physics Playground — Grundlagen: Dimensionsanalyse, Inertialprinzip
   & Trägheit, Relativitätstheorie, Quantenmechanik und warum beide
   Theorien (noch) nicht zusammenpassen
   Jeder Abschnitt: { id, title: { de, en }, body: { de: () => html, en: () => html } }
   ===================================================================== */
(function (PP) {
  'use strict';
  const U = PP.ui, I = PP.i18n, T = I.T;
  const { esc } = U;
  const R = String.raw;
  const t = (s) => U.tex(s);            // Formel im Fließtext
  const d = (s) => '<div class="th-eq">' + U.tex(s, true) + '</div>'; // abgesetzte Formel
  const exp = (id, label) => '<a href="#exp=' + id + '">' + esc(label) + '</a>';
  const kind = (k) => '<span class="th-kind">' + esc(k) + '</span>';
  const table = (head, rows) => '<div class="th-scroll"><table class="t th-cmp"><thead><tr><th></th>' + head.map((h) => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
    rows.map((r) => '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('') + '</tbody></table></div>';

  const sec = (id, label) => '<a href="#view=theorie&amp;sec=' + id + '">' + esc(label) + '</a>';
  /* Vergleichsleiste „Charakter der Theorie“: dieselbe Leiste in den Abschnitten zur Relativität, zur
     Quantenmechanik und zur Lücke zwischen beiden – hervorgehoben ist jeweils die Theorie des Abschnitts */
  const CHAR = I.localize({
    cols: [{ de: 'Größen', en: 'Quantities' }, { de: 'Vorhersagen', en: 'Predictions' }, { de: 'Raum und Zeit', en: 'Space and time' }],
    rows: [
      { key: 'gr', sec: 'rel', name: { de: 'Allgemeine Relativitätstheorie', en: 'General relativity' },
        tags: [{ de: 'klassisch – stets bestimmte Werte', en: 'classical – always definite values' }, { de: 'deterministisch', en: 'deterministic' }, { de: 'kontinuierlich und dynamisch', en: 'continuous and dynamic' }] },
      { key: 'qm', sec: 'qm', name: { de: 'Quantentheorie (QM, QFT)', en: 'Quantum theory (QM, QFT)' },
        tags: [{ de: 'quantisiert – Operatoren, Unschärfe', en: 'quantised – operators, uncertainty' }, { de: 'probabilistisch bei Messung', en: 'probabilistic upon measurement' }, { de: 'feste Raumzeit als Bühne', en: 'fixed spacetime as a stage' }] },
    ],
  });
  function charBar(focus, note) {
    const n = (id) => SECTIONS.findIndex((x) => x.id === id) + 1;
    const also = ['rel', 'qm', 'gap'].map((id) => sec(id, String(n(id)))).join(', ');
    return '<div class="th-char th-wide"><div class="th-char-h"><b>' + T('Charakter der Theorie', 'Character of the theory') + '</b><span class="faint"> · ' + T('dieselbe Leiste in den Abschnitten ', 'the same bar in sections ') + also + '</span></div>' +
      '<div class="th-scroll"><table><thead><tr><th></th>' + CHAR.cols.map((c) => '<th scope="col">' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' +
      CHAR.rows.map((r) => '<tr class="' + (focus === 'both' || focus === r.key ? 'on' : 'off') + '"><th scope="row">' + sec(r.sec, r.name) + '</th>' + r.tags.map((x) => '<td><span class="th-kind">' + esc(x) + '</span></td>').join('') + '</tr>').join('') +
      '</tbody></table></div>' + (note ? '<p>' + note + '</p>' : '') + '</div>';
  }

  const SECTIONS = I.localize([
    /* ------------------------------------------------------------ */
    {
      id: 'dim', title: { de: 'Was ist Dimensionsanalyse?', en: 'What is dimensional analysis?' },
      body: {
        de: () =>
          '<p>Jede physikalische Größe ist eine Zahl <i>mal</i> eine Einheit: 9,81 m/s², 300 000 km/s, 70 kg. Die <b>Dimension</b> sagt, <i>welche Art</i> von Größe das ist – unabhängig davon, ob man in Metern, Fuß oder Lichtjahren misst. Das SI-System baut alles aus sieben Basisgrößen auf: Länge ' + t('L') + ', Masse ' + t('M') + ', Zeit ' + t('T') + ', Stromstärke ' + t('I') + ', Temperatur ' + t(R`\Theta`) + ', Stoffmenge ' + t('N') + ' und Lichtstärke ' + t('J') + '. Jede andere Größe ist ein Produkt aus Potenzen davon, zum Beispiel die Kraft:</p>' +
          d(R`[F] = [m]\,[a] = \mathrm{M}\,\mathrm{L}\,\mathrm{T}^{-2}`) +
          '<p>Daraus folgt eine einzige, aber sehr strenge Regel: <b>Man kann nur Gleiches mit Gleichem vergleichen.</b> Beide Seiten einer Gleichung müssen dieselbe Dimension haben, und nur Terme gleicher Dimension dürfen addiert werden. Äpfel plus Meter ergibt nichts. Außerdem muss alles, was in einer Exponential-, Winkel- oder Logarithmusfunktion steht, dimensionslos sein – ' + t(R`\sin(3\,\mathrm{kg})`) + ' ist sinnlos.</p>' +
          '<h3 class="th-h3">Wofür man sie benutzt</h3>' +
          '<p><b>1. Prüfen.</b> Eine Gleichung mit falschen Dimensionen ist garantiert falsch. Das ist die schnellste Fehlerkontrolle der Physik – genau das macht der Tab „Dimensionsanalyse“ in jedem Experiment.</p>' +
          '<p><b>2. Herleiten.</b> Oft kann man ein Ergebnis fast erraten, bevor man etwas ausrechnet. Wovon hängt die Schwingungsdauer ' + t(R`\tau`) + ' eines Fadenpendels ab? Kandidaten: Fadenlänge ' + t('l') + ' (L), Fallbeschleunigung ' + t('g') + ' (L T⁻²), Masse ' + t('m') + ' (M). Der Ansatz ' + t(R`\tau \propto l^{a}\, g^{b}\, m^{c}`) + ' muss die Dimension T haben:</p>' +
          d(R`\mathrm{T}^{1} = \mathrm{L}^{a+b}\;\mathrm{T}^{-2b}\;\mathrm{M}^{c} \;\Rightarrow\; c = 0,\;\; b = -\tfrac{1}{2},\;\; a = \tfrac{1}{2}`) +
          d(R`\tau \propto \sqrt{\frac{l}{g}}`) +
          '<p>Die Masse fällt heraus, ohne dass man eine einzige Bewegungsgleichung gelöst hat. Das Verfahren dahinter heißt allgemein <i>Buckingham-Π-Theorem</i>: Jedes physikalische Gesetz lässt sich als Beziehung zwischen dimensionslosen Kombinationen schreiben.</p>' +
          '<p><b>3. Natürliche Skalen finden.</b> Kombiniert man ' + t(R`\hbar`) + ', ' + t('G') + ' und ' + t('c') + ' so, dass eine Länge herauskommt, erhält man die Planck-Länge ' + t(R`l_P = \sqrt{\hbar G / c^{3}} \approx 1{,}6\times 10^{-35}\,\mathrm{m}`) + ' – reine Dimensionsanalyse, siehe ' + exp('planck', 'Planck-Einheiten') + '.</p>' +
          '<h3 class="th-h3">Wo sie blind ist</h3>' +
          '<p>Die exakte Pendelformel lautet ' + t(R`\tau = 2\pi\sqrt{l/g}`) + '. Den Faktor ' + t(R`2\pi`) + ' kann die Dimensionsanalyse nicht liefern, denn reine Zahlen haben keine Dimension. Eine Gleichung mit ' + t(R`\pi`) + ' statt ' + t(R`2\pi`) + ' besteht die Prüfung genauso. Ebenso wenig erkennt sie, ob das zugrunde liegende Modell überhaupt gilt: Die Pendelformel stimmt nur für kleine Auslenkungen, Newtons Gravitationsgesetz nicht in der Nähe eines Schwarzen Lochs – dimensional sind beide trotzdem einwandfrei.</p>' +
          '<div class="honest"><b>Kurz:</b> Falsche Dimensionen beweisen einen Fehler. Richtige Dimensionen beweisen nichts – sie bestehen nur die erste Hürde.</div>',
        en: () =>
          '<p>Every physical quantity is a number <i>times</i> a unit: 9.81 m/s², 300,000 km/s, 70 kg. The <b>dimension</b> tells you <i>what kind</i> of quantity it is – regardless of whether you measure in metres, feet or light years. The SI system builds everything from seven base quantities: length ' + t('L') + ', mass ' + t('M') + ', time ' + t('T') + ', electric current ' + t('I') + ', temperature ' + t(R`\Theta`) + ', amount of substance ' + t('N') + ' and luminous intensity ' + t('J') + '. Every other quantity is a product of powers of these, force for example:</p>' +
          d(R`[F] = [m]\,[a] = \mathrm{M}\,\mathrm{L}\,\mathrm{T}^{-2}`) +
          '<p>From this follows a single but very strict rule: <b>you can only compare like with like.</b> Both sides of an equation must have the same dimension, and only terms of the same dimension may be added. Apples plus metres gives nothing. In addition, anything inside an exponential, trigonometric or logarithmic function must be dimensionless – ' + t(R`\sin(3\,\mathrm{kg})`) + ' is meaningless.</p>' +
          '<h3 class="th-h3">What it is used for</h3>' +
          '<p><b>1. Checking.</b> An equation with the wrong dimensions is guaranteed to be wrong. It is the quickest error check in physics – and exactly what the “Dimensional analysis” tab does in every experiment.</p>' +
          '<p><b>2. Deriving.</b> You can often almost guess a result before calculating anything. What does the period ' + t(R`\tau`) + ' of a simple pendulum depend on? Candidates: the length of the string ' + t('l') + ' (L), gravitational acceleration ' + t('g') + ' (L T⁻²), the mass ' + t('m') + ' (M). The ansatz ' + t(R`\tau \propto l^{a}\, g^{b}\, m^{c}`) + ' must have the dimension T:</p>' +
          d(R`\mathrm{T}^{1} = \mathrm{L}^{a+b}\;\mathrm{T}^{-2b}\;\mathrm{M}^{c} \;\Rightarrow\; c = 0,\;\; b = -\tfrac{1}{2},\;\; a = \tfrac{1}{2}`) +
          d(R`\tau \propto \sqrt{\frac{l}{g}}`) +
          '<p>The mass drops out without solving a single equation of motion. The general method behind this is the <i>Buckingham Π theorem</i>: every physical law can be written as a relation between dimensionless combinations.</p>' +
          '<p><b>3. Finding natural scales.</b> Combine ' + t(R`\hbar`) + ', ' + t('G') + ' and ' + t('c') + ' so that a length comes out, and you get the Planck length ' + t(R`l_P = \sqrt{\hbar G / c^{3}} \approx 1.6\times 10^{-35}\,\mathrm{m}`) + ' – pure dimensional analysis, see ' + exp('planck', 'Planck units') + '.</p>' +
          '<h3 class="th-h3">Where it is blind</h3>' +
          '<p>The exact pendulum formula is ' + t(R`\tau = 2\pi\sqrt{l/g}`) + '. Dimensional analysis cannot supply the factor ' + t(R`2\pi`) + ', because pure numbers have no dimension. An equation with ' + t(R`\pi`) + ' instead of ' + t(R`2\pi`) + ' passes the check just as well. Nor can it tell whether the underlying model applies at all: the pendulum formula only holds for small amplitudes, Newton’s law of gravitation not near a black hole – yet dimensionally both are flawless.</p>' +
          '<div class="honest"><b>In short:</b> wrong dimensions prove an error. Right dimensions prove nothing – they only clear the first hurdle.</div>',
      },
    },
    /* ------------------------------------------------------------ */
    {
      id: 'inertia', title: { de: 'Inertialprinzip und Trägheit', en: 'The principle of inertia' },
      body: {
        de: () =>
          '<p>Aristoteles glaubte, dass ein bewegter Körper von selbst zur Ruhe kommt, wenn niemand ihn antreibt. Galilei erkannte, dass das an der Reibung liegt, nicht am Körper. Newton formulierte daraus sein erstes Gesetz, das <b>Inertialprinzip</b> (lat. <i>inertia</i> = Trägheit):</p>' +
          '<div class="notebox"><p style="margin:0">Ein Körper bleibt in Ruhe oder in gleichförmiger, geradliniger Bewegung, solange keine resultierende Kraft auf ihn wirkt.</p></div>' +
          d(R`\sum \vec{F} = 0 \;\leftrightarrow\; \vec{v} = \text{konstant}`) +
          '<p>Bewegung selbst braucht also keine Ursache – nur die <i>Änderung</i> von Bewegung. Eine Raumsonde fliegt ohne Antrieb jahrzehntelang weiter; bremsen müsste man sie aktiv.</p>' +
          '<h3 class="th-h3">Inertialsysteme</h3>' +
          '<p>Das erste Gesetz ist mehr als ein Spezialfall von ' + t(R`F = ma`) + '. Es legt fest, <i>von wo aus</i> man die Welt beschreiben darf: Ein <b>Inertialsystem</b> ist ein Bezugssystem, in dem kräftefreie Körper tatsächlich geradlinig und gleichförmig laufen. In einem beschleunigten oder rotierenden System (Karussell, bremsender Zug) scheinen Körper ohne Ursache zu beschleunigen. Um das zu beschreiben, braucht man <b>Scheinkräfte</b> wie Zentrifugal- und Corioliskraft – sie haben keinen Verursacher, sondern entstehen allein durch die Wahl des Bezugssystems. Siehe ' + exp('circular', 'Kreisbewegung') + '.</p>' +
          '<p>Daraus folgt das <b>Relativitätsprinzip nach Galilei</b>: In allen Inertialsystemen gelten dieselben Gesetze. In einem gleichmäßig fahrenden Zug mit verdunkelten Fenstern gibt es kein Experiment, das verrät, ob der Zug fährt oder steht. Absolute Ruhe lässt sich nicht messen.</p>' +
          '<h3 class="th-h3">Trägheit und träge Masse</h3>' +
          '<p>Trägheit ist der Widerstand eines Körpers gegen jede Änderung seines Bewegungszustands. Ihr Maß ist die <b>träge Masse</b> im zweiten Newtonschen Gesetz:</p>' +
          d(R`m_{\text{träge}} = \frac{F}{a}`) +
          '<p>Dieselbe Kraft beschleunigt einen Einkaufswagen kräftig und einen Lkw kaum. Masse taucht in der Physik aber noch ein zweites Mal auf – als <b>schwere Masse</b>, die bestimmt, wie stark die Gravitation an einem Körper zieht. Begrifflich sind das zwei verschiedene Dinge. Gemessen sind sie gleich: Experimente von Eötvös bis zur Satellitenmission MICROSCOPE bestätigen die Gleichheit auf etwa 10⁻¹⁵. Deshalb fallen im Vakuum alle Körper gleich schnell, die Masse kürzt sich heraus – ausprobieren im Experiment ' + exp('free-fall', 'Freier Fall') + '.</p>' +
          '<div class="callout"><b>Brücke zu Einstein:</b> Newton nahm die Gleichheit von träger und schwerer Masse als Zufall hin. Einstein machte daraus ein Prinzip – das <i>Äquivalenzprinzip</i> – und damit den Ausgangspunkt der Allgemeinen Relativitätstheorie. Ein frei fallender Beobachter spürt keine Schwerkraft; frei fallen <i>ist</i> dort die trägheitsgetriebene, „kräftefreie“ Bewegung.</div>',
        en: () =>
          '<p>Aristotle believed that a moving body comes to rest by itself if nothing keeps pushing it. Galileo realised that this is due to friction, not to the body. Newton turned this into his first law, the <b>principle of inertia</b> (Latin <i>inertia</i> = idleness, sluggishness):</p>' +
          '<div class="notebox"><p style="margin:0">A body remains at rest or in uniform motion in a straight line as long as no net force acts on it.</p></div>' +
          d(R`\sum \vec{F} = 0 \;\leftrightarrow\; \vec{v} = \text{constant}`) +
          '<p>So motion itself needs no cause – only a <i>change</i> of motion does. A space probe keeps flying for decades without propulsion; to stop it, you would have to brake it actively.</p>' +
          '<h3 class="th-h3">Inertial frames</h3>' +
          '<p>The first law is more than a special case of ' + t(R`F = ma`) + '. It determines <i>from where</i> you are allowed to describe the world: an <b>inertial frame</b> is a frame of reference in which force-free bodies really do move in straight lines at constant speed. In an accelerating or rotating frame (a merry-go-round, a braking train), bodies seem to accelerate without any cause. To describe that, you need <b>fictitious forces</b> such as the centrifugal and Coriolis forces – nothing causes them; they arise purely from the choice of reference frame. See ' + exp('circular', 'Circular motion') + '.</p>' +
          '<p>This leads to <b>Galilean relativity</b>: the same laws hold in all inertial frames. In a train moving smoothly with its windows blacked out, there is no experiment that reveals whether the train is moving or standing still. Absolute rest cannot be measured.</p>' +
          '<h3 class="th-h3">Inertia and inertial mass</h3>' +
          '<p>Inertia is a body’s resistance to any change in its state of motion. Its measure is the <b>inertial mass</b> in Newton’s second law:</p>' +
          d(R`m_{\text{inertial}} = \frac{F}{a}`) +
          '<p>The same force gives a shopping trolley a strong push and barely moves a lorry. But mass appears in physics a second time – as <b>gravitational mass</b>, which determines how strongly gravity pulls on a body. Conceptually these are two different things. Measured, they are the same: experiments from Eötvös to the MICROSCOPE satellite mission confirm their equality to about 10⁻¹⁵. That is why all bodies fall equally fast in a vacuum – the mass cancels out. Try it in the experiment ' + exp('free-fall', 'Free fall') + '.</p>' +
          '<div class="callout"><b>Bridge to Einstein:</b> Newton accepted the equality of inertial and gravitational mass as a coincidence. Einstein turned it into a principle – the <i>equivalence principle</i> – and with it the starting point of general relativity. A freely falling observer feels no gravity; free fall <i>is</i> the inertia-driven, “force-free” motion there.</div>',
      },
    },
    /* ------------------------------------------------------------ */
    {
      id: 'rel', title: { de: 'Relativitätstheorie – die Idee', en: 'Relativity – the idea' },
      body: {
        de: () =>
          '<h3 class="th-h3">Spezielle Relativitätstheorie (1905)</h3>' +
          '<p>Einstein kombinierte Galileis Relativitätsprinzip mit einem experimentellen Befund: Die Lichtgeschwindigkeit ist für jeden Beobachter gleich, egal wie schnell er sich bewegt. Beide Aussagen gleichzeitig zu halten geht nur, wenn Raum und Zeit selbst nicht absolut sind. Die Folgen:</p>' +
          '<p><b>Zeitdilatation</b> – bewegte Uhren gehen langsamer. <b>Längenkontraktion</b> – bewegte Maßstäbe sind in Bewegungsrichtung kürzer. <b>Relativität der Gleichzeitigkeit</b> – was für den einen gleichzeitig passiert, ist es für den anderen nicht. Alles wird vom Lorentz-Faktor gesteuert:</p>' +
          d(R`\gamma = \frac{1}{\sqrt{1 - v^{2}/c^{2}}}`) +
          '<p>Bei Alltagsgeschwindigkeiten ist ' + t(R`\gamma`) + ' praktisch 1, deshalb merken wir nichts. Nahe ' + t('c') + ' wächst er gegen unendlich: Kein massebehafteter Körper erreicht die Lichtgeschwindigkeit. Raum und Zeit verschmelzen zur <b>Raumzeit</b>, und Masse erweist sich als Form von Energie: ' + t(R`E_0 = mc^{2}`) + '. Überprüft unter anderem durch die verlängerte Lebensdauer schneller Myonen und täglich in Teilchenbeschleunigern. ' + exp('special-rel', 'Zum Experiment Lorentz-Faktor') + '.</p>' +
          '<h3 class="th-h3">Allgemeine Relativitätstheorie (1915)</h3>' +
          '<p>Die SRT gilt nur für Inertialsysteme und kennt keine Gravitation. Einsteins Ausweg über das Äquivalenzprinzip: <b>Gravitation ist keine Kraft, sondern Krümmung der Raumzeit.</b> Masse und Energie krümmen die Raumzeit; frei fallende Körper folgen darin den „geradesten möglichen“ Bahnen (Geodäten). Die Erde zieht den Apfel nicht – der Apfel bewegt sich kräftefrei durch eine gekrümmte Raumzeit. John Wheeler fasste das so zusammen: Materie sagt der Raumzeit, wie sie sich krümmen soll, und die Raumzeit sagt der Materie, wie sie sich bewegen soll. Mathematisch sind das die Feldgleichungen:</p>' +
          d(R`G_{\mu\nu} + \Lambda\, g_{\mu\nu} = \frac{8\pi G}{c^{4}}\, T_{\mu\nu}`) +
          '<p>Links steht die Geometrie, rechts Energie und Impuls der Materie. Bestätigte Vorhersagen: die Periheldrehung des Merkur, die Lichtablenkung an der Sonne, langsamer gehende Uhren im Gravitationsfeld (GPS muss das korrigieren), Gravitationswellen (LIGO, 2015) und Schwarze Löcher (Event Horizon Telescope, 2019). ' + exp('efe', 'Zu den Feldgleichungen') + '.</p>' +
          charBar('gr', 'Die Raumzeit ist ein glattes, dynamisches Gebilde; jede Größe hat zu jedem Zeitpunkt einen bestimmten Wert. Das wird im ' + sec('gap', 'letzten Abschnitt') + ' wichtig.'),
        en: () =>
          '<h3 class="th-h3">Special relativity (1905)</h3>' +
          '<p>Einstein combined Galileo’s principle of relativity with an experimental finding: the speed of light is the same for every observer, however fast they are moving. Holding on to both statements at once is only possible if space and time themselves are not absolute. The consequences:</p>' +
          '<p><b>Time dilation</b> – moving clocks run slow. <b>Length contraction</b> – moving rulers are shorter along the direction of motion. <b>Relativity of simultaneity</b> – what happens simultaneously for one observer does not for another. All of this is governed by the Lorentz factor:</p>' +
          d(R`\gamma = \frac{1}{\sqrt{1 - v^{2}/c^{2}}}`) +
          '<p>At everyday speeds ' + t(R`\gamma`) + ' is practically 1, which is why we notice nothing. Near ' + t('c') + ' it grows towards infinity: no body with mass reaches the speed of light. Space and time merge into <b>spacetime</b>, and mass turns out to be a form of energy: ' + t(R`E_0 = mc^{2}`) + '. Verified, among other things, by the extended lifetime of fast muons and every day in particle accelerators. ' + exp('special-rel', 'To the Lorentz factor experiment') + '.</p>' +
          '<h3 class="th-h3">General relativity (1915)</h3>' +
          '<p>Special relativity only holds in inertial frames and knows nothing about gravity. Einstein’s way out, via the equivalence principle: <b>gravity is not a force but the curvature of spacetime.</b> Mass and energy curve spacetime; freely falling bodies follow the “straightest possible” paths in it (geodesics). The Earth does not pull the apple – the apple moves free of forces through curved spacetime. John Wheeler summed it up like this: matter tells spacetime how to curve, and spacetime tells matter how to move. Mathematically, these are the field equations:</p>' +
          d(R`G_{\mu\nu} + \Lambda\, g_{\mu\nu} = \frac{8\pi G}{c^{4}}\, T_{\mu\nu}`) +
          '<p>On the left is geometry, on the right the energy and momentum of matter. Confirmed predictions: the perihelion precession of Mercury, the bending of light by the Sun, clocks running slower in a gravitational field (GPS has to correct for this), gravitational waves (LIGO, 2015) and black holes (Event Horizon Telescope, 2019). ' + exp('efe', 'To the field equations') + '.</p>' +
          charBar('gr', 'Spacetime is a smooth, dynamic structure; every quantity has a definite value at every moment. This becomes important in the ' + sec('gap', 'last section') + '.'),
      },
    },
    /* ------------------------------------------------------------ */
    {
      id: 'qm', title: { de: 'Quantenmechanik – die Idee', en: 'Quantum mechanics – the idea' },
      body: {
        de: () =>
          '<p>Um 1900 passten Experimente mit Licht und Atomen nicht mehr zur klassischen Physik. Planck musste annehmen, dass Energie nur in Portionen ausgetauscht wird, ' + t(R`E = hf`) + '. Einstein zeigte, dass Licht aus solchen Portionen (Photonen) besteht, de Broglie, dass umgekehrt auch Materie Wellencharakter hat: ' + t(R`\lambda = h/p`) + '. Bis 1926 entstand daraus die Quantenmechanik.</p>' +
          '<h3 class="th-h3">Die Kernideen</h3>' +
          '<p><b>Zustand statt Bahn.</b> Ein Teilchen wird nicht durch Ort und Geschwindigkeit beschrieben, sondern durch eine Wellenfunktion ' + t(R`\psi`) + '. Sie entwickelt sich völlig deterministisch nach der Schrödinger-Gleichung:</p>' +
          d(R`i\hbar\,\frac{\partial \psi}{\partial t} = \hat{H}\,\psi`) +
          '<p><b>Wahrscheinlichkeit bei der Messung.</b> Was man misst, sagt ' + t(R`\psi`) + ' nur statistisch voraus: ' + t(R`|\psi|^{2}`) + ' ist die Wahrscheinlichkeitsdichte, den Messwert zu finden (Bornsche Regel). Das ist keine Messungenauigkeit, sondern Teil der Theorie.</p>' +
          '<p><b>Superposition und Verschränkung.</b> Ein System kann sich in einer Überlagerung mehrerer Zustände befinden, und mehrere Teilchen können so verschränkt sein, dass sich ihr gemeinsamer Zustand nicht in Einzelzustände zerlegen lässt.</p>' +
          '<p><b>Unschärfe.</b> Ort und Impuls sind nicht gleichzeitig beliebig scharf festgelegt:</p>' +
          d(R`\Delta x\,\Delta p \;\geq\; \frac{\hbar}{2}`) +
          '<p><b>Quantisierung.</b> Diskrete Energieniveaus – etwa im Atom – ergeben sich, weil die Wellenfunktion bestimmte Randbedingungen erfüllen muss, ähnlich wie eine eingespannte Saite nur bestimmte Töne erzeugt. ' + exp('schroedinger', 'Zur Schrödinger-Gleichung') + '.</p>' +
          '<p>Die Quantenmechanik ist die am genauesten getestete Theorie überhaupt: Beim magnetischen Moment des Elektrons stimmen Rechnung und Messung auf etwa 12 Stellen überein. Halbleiter, Laser, LEDs und MRT beruhen auf ihr. Ihre Verbindung mit der Speziellen Relativitätstheorie ist die <b>Quantenfeldtheorie</b>, die Grundlage des Standardmodells der Teilchenphysik – sie beschreibt drei der vier Grundkräfte.</p>' +
          charBar('qm', 'Die Mathematik ist unumstritten; was eine Messung physikalisch „ist“ (das Messproblem), ist eine offene Interpretationsfrage – Kopenhagen, Viele-Welten, Bohm und andere machen dieselben Vorhersagen.'),
        en: () =>
          '<p>Around 1900, experiments with light and atoms no longer fitted classical physics. Planck had to assume that energy is only exchanged in portions, ' + t(R`E = hf`) + '. Einstein showed that light consists of such portions (photons), and de Broglie that, conversely, matter also behaves like a wave: ' + t(R`\lambda = h/p`) + '. By 1926 this had grown into quantum mechanics.</p>' +
          '<h3 class="th-h3">The core ideas</h3>' +
          '<p><b>A state instead of a trajectory.</b> A particle is not described by position and velocity but by a wave function ' + t(R`\psi`) + '. It evolves completely deterministically according to the Schrödinger equation:</p>' +
          d(R`i\hbar\,\frac{\partial \psi}{\partial t} = \hat{H}\,\psi`) +
          '<p><b>Probability upon measurement.</b> ' + t(R`\psi`) + ' only predicts what you will measure statistically: ' + t(R`|\psi|^{2}`) + ' is the probability density of finding a given result (the Born rule). This is not measurement inaccuracy; it is part of the theory.</p>' +
          '<p><b>Superposition and entanglement.</b> A system can be in a superposition of several states, and several particles can be entangled in such a way that their joint state cannot be split into individual states.</p>' +
          '<p><b>Uncertainty.</b> Position and momentum cannot both be arbitrarily sharp at the same time:</p>' +
          d(R`\Delta x\,\Delta p \;\geq\; \frac{\hbar}{2}`) +
          '<p><b>Quantisation.</b> Discrete energy levels – in an atom, for instance – arise because the wave function has to satisfy certain boundary conditions, much as a string clamped at both ends can only produce certain notes. ' + exp('schroedinger', 'To the Schrödinger equation') + '.</p>' +
          '<p>Quantum mechanics is the most precisely tested theory there is: for the magnetic moment of the electron, calculation and measurement agree to about 12 digits. Semiconductors, lasers, LEDs and MRI all rest on it. Its union with special relativity is <b>quantum field theory</b>, the foundation of the Standard Model of particle physics – which describes three of the four fundamental forces.</p>' +
          charBar('qm', 'The mathematics is undisputed; what a measurement physically “is” (the measurement problem) is an open question of interpretation – Copenhagen, many-worlds, Bohm and others all make the same predictions.'),
      },
    },
    /* ------------------------------------------------------------ */
    {
      id: 'gap', title: { de: 'Warum beide Theorien (noch) nicht zusammenpassen', en: 'Why the two theories don’t fit together (yet)' },
      body: {
        de: () =>
          '<p>Beide Theorien sind in ihrem Bereich extrem erfolgreich, und es gibt <b>kein heutiges Experiment, das ihnen widerspricht</b>. Das Problem ist ein anderes: Sie beschreiben die Welt mit unvereinbaren Grundannahmen, und es gibt Situationen, in denen man beide gleichzeitig bräuchte.</p>' +
          charBar('both', 'Die Leisten aus den Abschnitten zur Relativität und zur Quantenmechanik nebeneinander: In jeder Spalte widersprechen sich die Grundannahmen. Die Tabelle zeigt die Einzelheiten.') +
          table(['Allgemeine Relativitätstheorie', 'Quantenfeldtheorie'], [
            ['Raumzeit', 'dynamisch – wird von Materie verformt und ist selbst ein physikalisches Objekt', 'feste Bühne, auf der die Felder spielen'],
            ['Größen', 'haben stets bestimmte Werte', 'sind Operatoren, haben Unschärfen, können überlagert sein'],
            ['Zeit', 'Teil der dynamischen Geometrie – es gibt keine Uhr von außen', 'Koordinate einer fest vorgegebenen Raumzeit: relativistisch (Zeitdilatation gilt), aber selbst nicht dynamisch'],
            ['Vorhersagen', 'deterministisch', 'Wahrscheinlichkeiten bei Messung']]) +
          '<h3 class="th-h3">1. Welche Geometrie hat eine Überlagerung?</h3>' +
          '<p>Die rechte Seite der Feldgleichungen, ' + t(R`T_{\mu\nu}`) + ', braucht einen bestimmten Wert. Eine Masse in Superposition – „hier und dort zugleich“ – hat keinen. Soll die Raumzeit dann in beide Richtungen gleichzeitig gekrümmt sein? Die Notlösung setzt den quantenmechanischen Mittelwert ein, ' + t(R`\langle T_{\mu\nu}\rangle`) + ' (<i>semiklassische Gravitation</i>). Das funktioniert als Näherung, führt aber bei makroskopischen Überlagerungen zu Vorhersagen, die experimentell ausgeschlossen wurden. Konsequent wäre, auch die Geometrie zu quantisieren – und genau daran scheitert man bisher.</p>' +
          '<h3 class="th-h3">2. Quantisierte Gravitation explodiert bei hohen Energien</h3>' +
          '<p>Die anderen drei Kräfte hat man erfolgreich quantisiert: Unendlichkeiten in den Rechnungen lassen sich durch endlich viele gemessene Parameter auffangen (<i>Renormierung</i>). Macht man dasselbe mit der Gravitation – mit einem Austauschteilchen, dem Graviton –, braucht man unendlich viele neue Parameter; die Theorie ist <b>nicht renormierbar</b>. Das lässt sich mit Dimensionsanalyse sehen: Die Gravitationskonstante ' + t('G') + ' hat, anders als die Kopplung des Elektromagnetismus, eine Dimension. Die dimensionslose Stärke der Gravitation zwischen zwei Teilchen der Energie ' + t('E') + ' ist</p>' +
          d(R`\alpha_G \sim \frac{G\,E^{2}}{\hbar\, c^{5}} = \left(\frac{E}{E_P}\right)^{2}`) +
          '<p>Sie wächst mit der Energie und erreicht bei der Planck-Energie ' + t(R`E_P \approx 10^{19}\,\mathrm{GeV}`) + ' die Größenordnung 1. Darunter funktioniert Quantengravitation als <i>effektive Theorie</i> sehr gut – darüber verliert sie jede Vorhersagekraft.</p>' +
          '<h3 class="th-h3">3. Das Problem der Zeit</h3>' +
          '<p>Die Schrödinger-Gleichung beschreibt, wie sich ein Zustand <i>in der Zeit</i> ändert. In der ART gibt es aber keine äußere Zeit – sie ist Teil der Raumzeit, die selbst quantisiert werden soll. Versucht man es formal (Wheeler-DeWitt-Gleichung), verschwindet die Zeit ganz aus der Gleichung. Was „Veränderung“ dann bedeutet, ist ungeklärt.</p>' +
          '<h3 class="th-h3">4. Schwarze Löcher: das Informationsparadoxon</h3>' +
          '<p>Hawking kombinierte beide Theorien am Ereignishorizont und fand: Schwarze Löcher strahlen thermisch und verdampfen (' + exp('hawking', 'Hawking-Temperatur') + '). Die Strahlung scheint aber keine Information über das Hineingefallene zu tragen. Das widerspricht einem Grundprinzip der Quantenmechanik, nach dem Information nie verloren geht (Unitarität). Wie das Paradoxon aufgelöst wird, ist eines der aktivsten Forschungsfelder.</p>' +
          '<h3 class="th-h3">Wo der Konflikt zählt – und wo nicht</h3>' +
          '<p>Relevant wird das Problem erst, wenn gleichzeitig enorme Massen und winzige Abstände im Spiel sind: nahe der Planck-Länge ' + t(R`l_P \approx 1{,}6\times 10^{-35}\,\mathrm{m}`) + ', im Inneren Schwarzer Löcher und in den ersten Augenblicken nach dem Urknall. Bei allem, was wir heute messen können, ist entweder die Gravitation vernachlässigbar (Teilchenphysik) oder die Quanteneffekte sind es (Astronomie). Deshalb funktionieren beide Theorien in der Praxis tadellos nebeneinander.</p>' +
          '<h3 class="th-h3">Lösungsansätze</h3>' +
          '<p>' + kind('Hypothese') + ' <b>Stringtheorie</b> ersetzt punktförmige Teilchen durch schwingende Strings und enthält das Graviton automatisch. ' + kind('Hypothese') + ' <b>Schleifenquantengravitation</b> quantisiert die Raumzeit direkt, die dann eine körnige Struktur hätte. Dazu kommen asymptotische Sicherheit, kausale Mengen und weitere Ansätze. Keiner davon ist bisher experimentell bestätigt. Vorgeschlagene Tischexperimente sollen prüfen, ob Gravitation zwei Massen verschränken kann – das wäre ein direkter Hinweis, dass die Gravitation selbst quantenhaft ist.</p>' +
          '<div class="honest"><b>Einordnung:</b> Das ist keine Krise im Sinne von „die Physik ist falsch“. Beide Theorien sind hervorragend bestätigt. Es ist eine offene Lücke: Wir wissen, dass es eine umfassendere Theorie geben muss, aber noch nicht, wie sie aussieht.</div>',
        en: () =>
          '<p>Both theories are extremely successful in their own domains, and <b>no experiment today contradicts them</b>. The problem is a different one: they describe the world with incompatible basic assumptions, and there are situations in which you would need both at the same time.</p>' +
          charBar('both', 'The bars from the sections on relativity and quantum mechanics side by side: in every column the basic assumptions contradict each other. The table shows the details.') +
          table(['General relativity', 'Quantum field theory'], [
            ['Spacetime', 'dynamic – deformed by matter and itself a physical object', 'a fixed stage on which the fields play'],
            ['Quantities', 'always have definite values', 'are operators, have uncertainties, can be superposed'],
            ['Time', 'part of the dynamic geometry – there is no clock outside', 'a coordinate of a fixed, given spacetime: relativistic (time dilation applies), but not itself dynamic'],
            ['Predictions', 'deterministic', 'probabilities upon measurement']]) +
          '<h3 class="th-h3">1. What geometry does a superposition have?</h3>' +
          '<p>The right-hand side of the field equations, ' + t(R`T_{\mu\nu}`) + ', needs a definite value. A mass in superposition – “here and there at once” – does not have one. Should spacetime then be curved both ways at the same time? The stopgap is to insert the quantum-mechanical expectation value, ' + t(R`\langle T_{\mu\nu}\rangle`) + ' (<i>semiclassical gravity</i>). That works as an approximation, but for macroscopic superpositions it leads to predictions that have been ruled out experimentally. The consistent step would be to quantise the geometry as well – and that is exactly where attempts have failed so far.</p>' +
          '<h3 class="th-h3">2. Quantised gravity blows up at high energies</h3>' +
          '<p>The other three forces have been quantised successfully: infinities in the calculations can be absorbed into a finite number of measured parameters (<i>renormalisation</i>). Do the same with gravity – with an exchange particle, the graviton – and you need infinitely many new parameters; the theory is <b>not renormalisable</b>. Dimensional analysis shows why: unlike the coupling of electromagnetism, the gravitational constant ' + t('G') + ' has a dimension. The dimensionless strength of gravity between two particles of energy ' + t('E') + ' is</p>' +
          d(R`\alpha_G \sim \frac{G\,E^{2}}{\hbar\, c^{5}} = \left(\frac{E}{E_P}\right)^{2}`) +
          '<p>It grows with energy and reaches order 1 at the Planck energy ' + t(R`E_P \approx 10^{19}\,\mathrm{GeV}`) + '. Below that, quantum gravity works very well as an <i>effective theory</i> – above it, it loses all predictive power.</p>' +
          '<h3 class="th-h3">3. The problem of time</h3>' +
          '<p>The Schrödinger equation describes how a state changes <i>in time</i>. In general relativity, however, there is no external time – it is part of spacetime, which itself is supposed to be quantised. Try it formally (the Wheeler–DeWitt equation) and time disappears from the equation altogether. What “change” then means is unclear.</p>' +
          '<h3 class="th-h3">4. Black holes: the information paradox</h3>' +
          '<p>Hawking combined both theories at the event horizon and found that black holes radiate thermally and evaporate (' + exp('hawking', 'Hawking temperature') + '). But the radiation seems to carry no information about what fell in. That contradicts a basic principle of quantum mechanics, according to which information is never lost (unitarity). How the paradox is resolved is one of the most active fields of research.</p>' +
          '<h3 class="th-h3">Where the conflict matters – and where it doesn’t</h3>' +
          '<p>The problem only becomes relevant when enormous masses and tiny distances are involved at the same time: near the Planck length ' + t(R`l_P \approx 1.6\times 10^{-35}\,\mathrm{m}`) + ', inside black holes and in the first moments after the Big Bang. In everything we can measure today, either gravity is negligible (particle physics) or quantum effects are (astronomy). That is why the two theories work side by side flawlessly in practice.</p>' +
          '<h3 class="th-h3">Approaches to a solution</h3>' +
          '<p>' + kind('hypothesis') + ' <b>String theory</b> replaces point-like particles with vibrating strings and contains the graviton automatically. ' + kind('hypothesis') + ' <b>Loop quantum gravity</b> quantises spacetime directly, which would then have a grainy structure. Add asymptotic safety, causal sets and other approaches. None of them has been confirmed experimentally so far. Proposed tabletop experiments aim to test whether gravity can entangle two masses – that would be direct evidence that gravity itself is quantum.</p>' +
          '<div class="honest"><b>Perspective:</b> this is not a crisis in the sense of “physics is wrong”. Both theories are superbly confirmed. It is an open gap: we know there must be a more comprehensive theory, but not yet what it looks like.</div>',
      },
    },
  ]);

  /* ---------- Seitenleiste, Übersicht, Einzelseiten ----------
     #view=theorie            Übersicht mit einer Karte je Abschnitt
     #view=theorie&sec=<id>   ein Abschnitt: Text in Lesebreite, Widgets breit, Vertiefungen aufklappbar,
                              sticky Inhaltsverzeichnis und „Weiter zu“ am Ende */
  const S = U.S;
  const TITLE = () => T('Theorie kurz erklärt', 'Theory in brief');
  // Kurztitel (Seitenleiste) und ein Satz je Abschnitt (Übersicht, Untertitel)
  const META = I.localize({
    dim: { short: { de: 'Dimensionsanalyse', en: 'Dimensional analysis' }, teaser: { de: 'Warum man nur Gleiches mit Gleichem vergleichen kann – und wo die Methode blind ist.', en: 'Why you can only compare like with like – and where the method is blind.' } },
    inertia: { short: { de: 'Inertialprinzip & Trägheit', en: 'Principle of inertia' }, teaser: { de: 'Bewegung braucht keine Ursache, nur ihre Änderung – und warum träge und schwere Masse gleich sind.', en: 'Motion needs no cause, only a change of motion does – and why inertial and gravitational mass are equal.' } },
    rel: { short: { de: 'Relativitätstheorie', en: 'Relativity' }, teaser: { de: 'Raum und Zeit sind nicht absolut, und Gravitation ist Krümmung der Raumzeit.', en: 'Space and time are not absolute, and gravity is the curvature of spacetime.' } },
    idx: { short: { de: 'Indizes μν', en: 'Indices μν' }, teaser: { de: 'Wie aus zwei griechischen Buchstaben eine 4×4-Tabelle wird – zum Antippen.', en: 'How two Greek letters turn into a 4×4 table – tap the cells.' } },
    tensor: { short: { de: 'Tensor-Aufbau', en: 'How a tensor is built' }, teaser: { de: 'Mehr als eine Tabelle: Entscheidend ist, wie sich die Zahlen beim Wechsel der Koordinaten verwandeln.', en: 'More than a table: what matters is how the numbers transform when the coordinates change.' } },
    action: { short: { de: 'Einstein-Hilbert-Wirkung', en: 'Einstein–Hilbert action' }, teaser: { de: 'Die ganze ART aus einem Prinzip – dem der kleinsten Wirkung, ausprobiert an einem geworfenen Ball.', en: 'All of general relativity from one principle – least action, tried out on a thrown ball.' } },
    history: { short: { de: 'Die Köpfe hinter der ART', en: 'The minds behind GR' }, teaser: { de: 'Poincaré, Minkowski, Grossmann, Hilbert und Noether: die Fundamente unter Einsteins Theorie.', en: 'Poincaré, Minkowski, Grossmann, Hilbert and Noether: the foundations beneath Einstein’s theory.' } },
    qm: { short: { de: 'Quantenmechanik', en: 'Quantum mechanics' }, teaser: { de: 'Zustand statt Bahn, Wahrscheinlichkeit bei der Messung, Unschärfe und Quantisierung.', en: 'A state instead of a trajectory, probability upon measurement, uncertainty and quantisation.' } },
    entropy: { short: { de: 'Entropie', en: 'Entropy' }, teaser: { de: 'Ein Wort, viele Bedeutungen – von Clausius bis Wald, mit einem Modell zum Abzählen von Mikrozuständen.', en: 'One word, many meanings – from Clausius to Wald, with a model for counting microstates.' } },
    gap: { short: { de: 'Warum (noch) nicht vereint', en: 'Why not (yet) united' }, teaser: { de: 'Beide Theorien sind bestens bestätigt und passen trotzdem nicht zusammen. Wo genau es hakt.', en: 'Both theories are superbly confirmed and still do not fit together. Where exactly it snags.' } },
  });
  const meta = (s) => META[s.id] || { short: s.title, teaser: '' };
  const secHref = (id) => '#view=theorie&amp;sec=' + id;
  const badge = () => '<span class="th-badge">' + T('interaktiv', 'interactive') + '</span>';

  // Unterpunkte der Grundlagen in der Seitenleiste (src/ui/core.js ruft das auf)
  U.theoryNav = () => {
    const cur = S.view === 'theorie' ? S.theorySec : undefined;
    return '<a href="#view=theorie" class="' + (S.view === 'theorie' && !cur ? 'on' : '') + '">' + esc(TITLE()) + '</a>' +
      SECTIONS.map((s, i) => '<a href="' + secHref(s.id) + '" class="sub' + (cur === s.id ? ' on' : '') + '"><span><span class="th-n">' + (i + 1) + '</span>' + esc(meta(s).short) + '</span>' +
        (s.mount ? '<small class="th-ia" title="' + T('interaktiv', 'interactive') + '" aria-label="' + T('interaktiv', 'interactive') + '">◆</small>' : '') + '</a>').join('');
  };

  function overview(el) {
    let h = '<header class="xhead">' + U.fieldBanner('found') + '<div><h1>' + esc(TITLE()) + '</h1><div class="sub">' + T('Die Ideen hinter den Experimenten – ohne Formelballast, aber ehrlich', 'The ideas behind the experiments – without excess formulas, but honest') + '</div></div></header>';
    h += '<div class="th-cards">' + SECTIONS.map((s, i) => '<a class="th-card" href="' + secHref(s.id) + '"><span class="th-card-n">' + (i + 1) + '</span><div><h3>' + esc(s.title) + '</h3><p>' + esc(meta(s).teaser) + '</p>' + (s.mount ? badge() : '') + '</div></a>').join('') + '</div>';
    el.innerHTML = h;
  }

  // Vertiefungen: eine Zwischenüberschrift mit class="th-deep" wird mit allem bis zur nächsten Überschrift aufklappbar
  function foldDeep(root) {
    root.querySelectorAll('h3.th-deep').forEach((h3) => {
      const d = document.createElement('details');
      d.className = 'th-more';
      const sm = document.createElement('summary');
      sm.innerHTML = '<span class="th-more-k">' + T('Vertiefung', 'In depth') + '</span> ' + h3.innerHTML;
      sm.dataset.title = h3.textContent.trim();
      d.appendChild(sm);
      h3.replaceWith(d);
      while (d.nextElementSibling && !/^H[23]$/.test(d.nextElementSibling.tagName) && !d.nextElementSibling.classList.contains('th-more')) d.appendChild(d.nextElementSibling);
    });
  }

  function sectionPage(el, i) {
    const s = SECTIONS[i], prev = SECTIONS[i - 1], next = SECTIONS[i + 1];
    let h = '<header class="xhead">' + U.fieldBanner('found') + '<div><a class="th-back" href="#view=theorie">← ' + esc(TITLE()) + '</a><h1>' + (i + 1) + '. ' + esc(s.title) + '</h1><div class="sub">' + esc(meta(s).teaser) + (s.mount ? ' ' + badge() : '') + '</div></div></header>';
    h += '<div class="th-page"><article class="prose th th-article" id="th-' + s.id + '">' + s.body() + '</article>' +
      '<aside class="th-side"><nav class="th-stoc" aria-label="' + T('Auf dieser Seite', 'On this page') + '"><div class="th-stoc-h">' + T('Auf dieser Seite', 'On this page') + '</div><ol id="th-stoc"></ol></nav></aside></div>';
    h += '<nav class="th-foot" aria-label="' + T('Weitere Abschnitte', 'More sections') + '">' +
      (prev ? '<a class="th-prev" href="' + secHref(prev.id) + '"><small>← ' + T('Zurück', 'Back') + '</small>' + (i) + '. ' + esc(meta(prev).short) + '</a>' : '<a class="th-prev" href="#view=theorie"><small>← ' + T('Übersicht', 'Overview') + '</small>' + esc(TITLE()) + '</a>') +
      (next ? '<a class="th-next" href="' + secHref(next.id) + '"><small>' + T('Weiter zu', 'Continue to') + ' →</small>' + (i + 2) + '. ' + esc(meta(next).short) + '</a>' : '<a class="th-next" href="#view=theorie"><small>' + T('Weiter zu', 'Continue to') + ' →</small>' + T('Übersicht', 'Overview') + '</a>') + '</nav>';
    el.innerHTML = h;
    const art = el.querySelector('.th-article');
    foldDeep(art);
    // Inhaltsverzeichnis aus den Zwischenüberschriften (auch den aufklappbaren)
    const heads = [...art.querySelectorAll(':scope > h3, :scope > details.th-more > summary')];
    heads.forEach((x, k) => { x.id = 'th-' + s.id + '-' + (k + 1); });
    const toc = el.querySelector('#th-stoc');
    toc.innerHTML = heads.map((x) => '<li><button type="button" data-jump="' + x.id + '">' + esc(x.dataset.title || x.textContent.trim()) + '</button></li>').join('');
    if (!heads.length) el.querySelector('.th-side').hidden = true;
    const downs = [];
    if (s.mount) { const f = s.mount(el); if (f) downs.push(f); }
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-jump]');
      if (!b) return;
      const t = document.getElementById(b.getAttribute('data-jump'));
      if (!t) return;
      if (t.tagName === 'SUMMARY') t.parentElement.open = true;
      if (t.scrollIntoView) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    // Markierung im Inhaltsverzeichnis: die zuletzt oberhalb der Bildschirmmitte liegende Überschrift
    if (typeof IntersectionObserver === 'function' && heads.length) {
      const io = new IntersectionObserver(() => {
        let cur = null;
        heads.forEach((x) => { const r = x.getBoundingClientRect(); if (r.top < window.innerHeight * 0.4) cur = x.id; });
        toc.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.getAttribute('data-jump') === cur));
      }, { rootMargin: '0px 0px -55% 0px', threshold: [0, 1] });
      heads.forEach((x) => io.observe(x));
      downs.push(() => io.disconnect());
    }
    if (downs.length) U.teardown = () => downs.forEach((f) => f());
  }

  function render(el) {
    const i = SECTIONS.findIndex((s) => s.id === S.theorySec);
    if (i < 0) { S.theorySec = null; overview(el); } else sectionPage(el, i);
  }

  U.theory = { sections: SECTIONS, meta };
  // Seitentitel folgt dem Abschnitt
  U.views.theorie = { get title() { const s = SECTIONS.find((x) => x.id === S.theorySec); return s ? meta(s).short + ' · ' + TITLE() : TITLE(); }, render };
})(globalThis.PP = globalThis.PP || {});
