/* =====================================================================
   Physics Playground — Grundlagen: Dimensionsanalyse, Inertialprinzip
   & Trägheit, Relativitätstheorie, Quantenmechanik und warum beide
   Theorien (noch) nicht zusammenpassen
   ===================================================================== */
(function (PP) {
  'use strict';
  const U = PP.ui;
  const { esc } = U;
  const R = String.raw;
  const t = (s) => U.tex(s);            // Formel im Fließtext
  const d = (s) => '<div class="th-eq">' + U.tex(s, true) + '</div>'; // abgesetzte Formel
  const exp = (id, label) => '<a href="#exp=' + id + '">' + esc(label) + '</a>';
  const kind = (k) => '<span class="th-kind">' + esc(k) + '</span>';

  const SECTIONS = [
    /* ------------------------------------------------------------ */
    {
      id: 'dim', title: 'Was ist Dimensionsanalyse?',
      body: () =>
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
    },
    /* ------------------------------------------------------------ */
    {
      id: 'inertia', title: 'Inertialprinzip und Trägheit',
      body: () =>
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
    },
    /* ------------------------------------------------------------ */
    {
      id: 'rel', title: 'Relativitätstheorie – die Idee',
      body: () =>
        '<h3 class="th-h3">Spezielle Relativitätstheorie (1905)</h3>' +
        '<p>Einstein kombinierte Galileis Relativitätsprinzip mit einem experimentellen Befund: Die Lichtgeschwindigkeit ist für jeden Beobachter gleich, egal wie schnell er sich bewegt. Beide Aussagen gleichzeitig zu halten geht nur, wenn Raum und Zeit selbst nicht absolut sind. Die Folgen:</p>' +
        '<p><b>Zeitdilatation</b> – bewegte Uhren gehen langsamer. <b>Längenkontraktion</b> – bewegte Maßstäbe sind in Bewegungsrichtung kürzer. <b>Relativität der Gleichzeitigkeit</b> – was für den einen gleichzeitig passiert, ist es für den anderen nicht. Alles wird vom Lorentz-Faktor gesteuert:</p>' +
        d(R`\gamma = \frac{1}{\sqrt{1 - v^{2}/c^{2}}}`) +
        '<p>Bei Alltagsgeschwindigkeiten ist ' + t(R`\gamma`) + ' praktisch 1, deshalb merken wir nichts. Nahe ' + t('c') + ' wächst er gegen unendlich: Kein massebehafteter Körper erreicht die Lichtgeschwindigkeit. Raum und Zeit verschmelzen zur <b>Raumzeit</b>, und Masse erweist sich als Form von Energie: ' + t(R`E_0 = mc^{2}`) + '. Überprüft unter anderem durch die verlängerte Lebensdauer schneller Myonen und täglich in Teilchenbeschleunigern. ' + exp('special-rel', 'Zum Experiment Lorentz-Faktor') + '.</p>' +
        '<h3 class="th-h3">Allgemeine Relativitätstheorie (1915)</h3>' +
        '<p>Die SRT gilt nur für Inertialsysteme und kennt keine Gravitation. Einsteins Ausweg über das Äquivalenzprinzip: <b>Gravitation ist keine Kraft, sondern Krümmung der Raumzeit.</b> Masse und Energie krümmen die Raumzeit; frei fallende Körper folgen darin den „geradesten möglichen“ Bahnen (Geodäten). Die Erde zieht den Apfel nicht – der Apfel bewegt sich kräftefrei durch eine gekrümmte Raumzeit. John Wheeler fasste das so zusammen: Materie sagt der Raumzeit, wie sie sich krümmen soll, und die Raumzeit sagt der Materie, wie sie sich bewegen soll. Mathematisch sind das die Feldgleichungen:</p>' +
        d(R`G_{\mu\nu} + \Lambda\, g_{\mu\nu} = \frac{8\pi G}{c^{4}}\, T_{\mu\nu}`) +
        '<p>Links steht die Geometrie, rechts Energie und Impuls der Materie. Bestätigte Vorhersagen: die Periheldrehung des Merkur, die Lichtablenkung an der Sonne, langsamer gehende Uhren im Gravitationsfeld (GPS muss das korrigieren), Gravitationswellen (LIGO, 2015) und Schwarze Löcher (Event Horizon Telescope, 2019). ' + exp('efe', 'Zu den Feldgleichungen') + '.</p>' +
        '<div class="callout"><b>Charakter der Theorie:</b> ' + kind('klassisch') + ' ' + kind('deterministisch') + ' ' + kind('kontinuierlich') + ' Die Raumzeit ist ein glattes, dynamisches Gebilde; jede Größe hat zu jedem Zeitpunkt einen bestimmten Wert. Das wird im letzten Abschnitt wichtig.</div>',
    },
    /* ------------------------------------------------------------ */
    {
      id: 'qm', title: 'Quantenmechanik – die Idee',
      body: () =>
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
        '<div class="callout"><b>Charakter der Theorie:</b> ' + kind('quantisiert') + ' ' + kind('probabilistisch bei Messung') + ' ' + kind('feste Raumzeit als Bühne') + ' Die Mathematik ist unumstritten; was eine Messung physikalisch „ist“ (das Messproblem), ist eine offene Interpretationsfrage – Kopenhagen, Viele-Welten, Bohm und andere machen dieselben Vorhersagen.</div>',
    },
    /* ------------------------------------------------------------ */
    {
      id: 'gap', title: 'Warum beide Theorien (noch) nicht zusammenpassen',
      body: () =>
        '<p>Beide Theorien sind in ihrem Bereich extrem erfolgreich, und es gibt <b>kein heutiges Experiment, das ihnen widerspricht</b>. Das Problem ist ein anderes: Sie beschreiben die Welt mit unvereinbaren Grundannahmen, und es gibt Situationen, in denen man beide gleichzeitig bräuchte.</p>' +
        '<div class="th-scroll"><table class="t th-cmp"><thead><tr><th></th><th>Allgemeine Relativitätstheorie</th><th>Quantenfeldtheorie</th></tr></thead><tbody>' +
        [['Raumzeit', 'dynamisch – wird von Materie verformt und ist selbst ein physikalisches Objekt', 'feste Bühne, auf der die Felder spielen'],
         ['Größen', 'haben stets bestimmte Werte', 'sind Operatoren, haben Unschärfen, können überlagert sein'],
         ['Zeit', 'Teil der dynamischen Geometrie – es gibt keine Uhr von außen', 'Koordinate einer fest vorgegebenen Raumzeit: relativistisch (Zeitdilatation gilt), aber selbst nicht dynamisch'],
         ['Vorhersagen', 'deterministisch', 'Wahrscheinlichkeiten bei Messung']].map((r) => '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('') +
        '</tbody></table></div>' +
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
    },
  ];

  function render(el) {
    let h = '<header class="xhead"><div><div class="crumb">Grundlagen</div><h1>Theorie kurz erklärt</h1><div class="sub">Die Ideen hinter den Experimenten – ohne Formelballast, aber ehrlich</div></div></header>';
    h += '<nav class="th-toc" aria-label="Inhalt">' + SECTIONS.map((s, i) => '<button class="btn" data-jump="' + s.id + '">' + (i + 1) + '. ' + esc(s.title) + '</button>').join('') + '</nav>';
    h += '<div class="prose th">' + SECTIONS.map((s, i) => '<section id="th-' + s.id + '"><h2 class="sec">' + (i + 1) + '. ' + esc(s.title) + '</h2>' + s.body() + '</section>').join('') + '</div>';
    el.innerHTML = h;
    const downs = SECTIONS.map((s) => (s.mount ? s.mount(el) : null)).filter(Boolean);
    if (downs.length) U.teardown = () => downs.forEach((f) => f());
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-jump]');
      if (!b) return;
      const sec = document.getElementById('th-' + b.getAttribute('data-jump'));
      if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    if (U.S.theorySec) {
      const sec = document.getElementById('th-' + U.S.theorySec);
      U.S.theorySec = null;
      if (sec && sec.scrollIntoView) setTimeout(() => sec.scrollIntoView({ block: 'start' }), 0);
    }
  }

  U.theory = { sections: SECTIONS };
  Object.assign(U.views, { theorie: { title: 'Theorie kurz erklärt', render } });
})(globalThis.PP = globalThis.PP || {});
