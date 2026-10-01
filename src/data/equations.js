/* =====================================================================
   Physics Playground — Interaktive Gleichungen (jedes Experiment)
   Daten für src/ui/eqx.js: Formel mit anklickbaren Symbolen und je Symbol
   eine Karte mit Name, Wert/Einheit, Bedeutung und Rolle in der Gleichung.

   byId[Experiment-ID]:
     tex      Formel mit Markern \xs{Schlüssel}{…}. Ohne Marker gelesen muss sie
              exp.tex ergeben (Test „Interaktive Gleichungen“) – die Formel selbst
              wird hier nicht verändert, nur anklickbar gemacht.
     pre      zu Beginn ausgewähltes Symbol
     hint     Hinweis unter der Legende (optional, sonst ein allgemeiner)
     legend   Name der Legende für Screenreader (optional)
     symbols  in Legenden-Reihenfolge. Genau eine Quelle je Symbol:
                c: 'G'     Naturkonstante aus PP.model.C – Name, Wert, Einheit kommen
                           von dort, die Bedeutung aus meaning[…] unten
                v: 'M'     Eingabe des Experiments (Name, Einheit, eingestellter Wert)
                o: 'TH'    Ausgabe des Experiments (Name, Einheit, berechneter Wert)
                s: 'psi'   Symbol aus exp.symbols (Einheit aus seiner Dimension)
                m: 'ellipk' mathematische Funktion (Einheit aus dim, sonst dimensionslos)
                n: 8π      reine Zahl
              color    Farbe xc-* (styles.css): q Quantenmechanik, rel Relativität,
                       grav Gravitation, thermo Thermodynamik, cosmo Kosmologie,
                       mass das physikalische Objekt bzw. die Eingabe, geo reine Zahl
                       oder Mathematik, res Ergebnis bzw. gesuchte Größe; g als Eingabe: grav
              tag      Kurzlabel in Legende und Karte (bei T_H: die Theorie)
              name     Name (optional; sonst aus der Quelle)
              meaning  was die Größe physikalisch bedeutet (bei Konstanten: zentral in meaning)
              role     welche Rolle sie in genau dieser Gleichung spielt
              tex      Symbol in Legende und Karte (optional bei c, v und o)
              unitNote Zusatz zur Einheit, die aus der Dimension folgt (optional)
              src, at  Zahl aus der Engine, die die Karte zeigt, und ihre Beschriftung (optional;
                       bei v und o automatisch der eingestellte bzw. berechnete Wert)
              limit, limitText, live   optional: Grenzfall und Knöpfe, die ihn im Break-Modus zeigen
   ===================================================================== */
(function (PP) {
  'use strict';

  /* Bedeutung je Naturkonstante – einmal für alle Gleichungen. Die Zahlenwerte stehen nur in src/core/model.js. */
  const meaning = {
    hbar: { de: 'Das Wirkungsquantum h, geteilt durch 2π. Es legt die Skala der Quantenphysik fest: Energie und Kreisfrequenz eines Quants hängen über E = ħω zusammen, Drehimpulse ändern sich in Schritten von ħ.',
      en: 'The quantum of action h divided by 2π. It sets the scale of quantum physics: the energy and angular frequency of a quantum are linked by E = ħω, and angular momenta change in steps of ħ.' },
    c: { de: 'Die Lichtgeschwindigkeit im Vakuum ist die höchste Geschwindigkeit, mit der sich Signale ausbreiten können. Sie verknüpft Raum und Zeit sowie Masse und Energie (E = mc²); seit 1983 ist ihr Wert festgelegt und definiert das Meter.',
      en: 'The speed of light in vacuum is the highest speed at which signals can travel. It links space and time as well as mass and energy (E = mc²); since 1983 its value has been fixed and defines the metre.' },
    G: { de: 'Die Gravitationskonstante gibt an, wie stark sich Massen anziehen (Newton: F = G m₁m₂/r²) – in der Allgemeinen Relativitätstheorie, wie stark Energie die Raumzeit krümmt. Sie ist nur auf etwa 2 × 10⁻⁵ genau bekannt, viel ungenauer als ħ, c oder k_B, die exakt festgelegt sind.',
      en: 'The gravitational constant states how strongly masses attract each other (Newton: F = G m₁m₂/r²) – in general relativity, how strongly energy curves spacetime. It is known only to about 2 × 10⁻⁵, far less precisely than ħ, c or k_B, which are fixed exactly.' },
    k_B: { de: 'Die Boltzmann-Konstante verknüpft Temperatur und Energie: k_B·T ist die typische thermische Energie pro Teilchen. Seit 2019 ist ihr Wert exakt festgelegt; damit ist das Kelvin über die Energie definiert.',
      en: 'The Boltzmann constant links temperature and energy: k_B·T is the typical thermal energy per particle. Since 2019 its value has been fixed exactly, which defines the kelvin in terms of energy.' },
    Lambda: { de: 'Die kosmologische Konstante wirkt wie eine Energiedichte des leeren Raums, die überall gleich ist. Im kosmologischen Standardmodell (ΛCDM) erklärt sie die beschleunigte Expansion des Universums; ihr Wert ist aus Beobachtungen abgeleitet, ihre physikalische Ursache ist ungeklärt.',
      en: 'The cosmological constant acts like an energy density of empty space that is the same everywhere. In the standard model of cosmology (ΛCDM) it explains the accelerating expansion of the universe; its value is inferred from observations, its physical origin is unknown.' },
  };

  const RESULT = { de: 'Ergebnis', en: 'Result' }, NUMBER = { de: 'Zahlenfaktor', en: 'Numerical factor' };
  const QM = { de: 'Quantenmechanik', en: 'Quantum mechanics' }, REL = { de: 'Relativität', en: 'Relativity' }, GRAV = { de: 'Gravitation', en: 'Gravity' };
  const THERMO = { de: 'Thermodynamik', en: 'Thermodynamics' }, BH = { de: 'Das Schwarze Loch selbst', en: 'The black hole itself' };
  const PI8 = { de: 'Zahlenfaktor 8π', en: 'Numerical factor 8π' };
  // Mechanik, Relativität, Wärme: wiederkehrende Kurzlabels und Texte
  const TIME = { de: 'Zeit', en: 'Time' }, START = { de: 'Startwert', en: 'Initial value' }, GRAVITY = { de: 'Schwerkraft', en: 'Gravity' };
  const HALF = { de: 'Faktor ½', en: 'Factor ½' };
  const DEGREES = { de: 'Eingabe in Grad; Winkel sind dimensionslos', en: 'entered in degrees; angles are dimensionless' };
  const SET_DEG = { de: 'Eingestellt (in Grad)', en: 'Set to (in degrees)' };

  const byId = {
    /* Hawking-Temperatur – steht im Schnittpunkt-Block (src/ui/crossroads.js); tag ist hier die Theorie hinter dem Symbol */
    hawking: {
      tex: '\\xs{TH}{T_{\\mathrm{H}}} = \\frac{\\xs{hbar}{\\hbar}\\, \\xs{c}{c^3}}{\\xs{8pi}{8\\pi}\\, \\xs{G}{G}\\, \\xs{M}{M}\\, \\xs{k_B}{k_{\\mathrm{B}}}}',
      pre: 'hbar',
      legend: { de: 'Symbole und Theorien', en: 'Symbols and theories' },
      hint: { de: 'Zeig auf ein Symbol oder tippe es an: Welche Theorie steckt dahinter – und was passiert, wenn man sie abschaltet?', en: 'Point at a symbol or tap it: which theory is behind it – and what happens if you switch it off?' },
      symbols: {
        TH: {
          o: 'TH', color: 'res', tag: RESULT,
          meaning: { de: 'Die Temperatur der Wärmestrahlung, die ein Schwarzes Loch nach der semiklassischen Rechnung abgibt. Ihr Spektrum ist – bis auf Korrekturen durch das Gravitationsfeld vor dem Horizont – das eines schwarzen Körpers dieser Temperatur.',
            en: 'The temperature of the thermal radiation that a black hole emits according to the semiclassical calculation. Its spectrum is that of a black body at this temperature – up to corrections from the gravitational field outside the horizon.' },
          role: { de: 'Das, was die Formel liefert. Außer der Masse M stehen rechts nur Naturkonstanten und die Zahl 8π.',
            en: 'What the formula delivers. Apart from the mass M, the right-hand side contains only constants of nature and the number 8π.' },
        },
        hbar: {
          c: 'hbar', color: 'q', tag: QM,
          role: { de: 'Das Wirkungsquantum bringt die Quantenfeldtheorie ins Spiel: Hawking rechnete mit Quantenfeldern auf der gekrümmten Raumzeit vor dem Horizont. T_H ist proportional zu ħ.',
            en: 'The quantum of action brings in quantum field theory: Hawking calculated with quantum fields on the curved spacetime outside the horizon. T_H is proportional to ħ.' },
          limit: '\\hbar \\to 0 \\;\\Rightarrow\\; T_{\\mathrm{H}} \\to 0',
          limitText: { de: 'Klassisch ist ein Schwarzes Loch vollkommen schwarz: Es verschluckt alles und strahlt nichts ab. Hawking-Strahlung ist ein reiner Quanteneffekt.',
            en: 'Classically a black hole is perfectly black: it swallows everything and emits nothing. Hawking radiation is a pure quantum effect.' },
          live: { c: 'hbar', f: 1e-3, zero: true },
        },
        c: {
          c: 'c', tex: 'c^3', color: 'rel', tag: REL,
          role: { de: 'Die Lichtgeschwindigkeit legt fest, wo der Horizont liegt: Innerhalb von r_s = 2GM/c² kann nicht einmal Licht entkommen. Sie steht in dritter Potenz im Zähler.',
            en: 'The speed of light fixes where the horizon lies: inside r_s = 2GM/c² not even light can escape. It appears to the third power in the numerator.' },
          limit: 'c \\to \\infty \\;\\Rightarrow\\; r_{\\mathrm{s}} \\to 0',
          limitText: { de: 'Relativität „abschalten“ heißt c → ∞, das ist Newtons Physik. Dann schrumpft r_s auf null, und es gibt keinen Ereignishorizont – den kennt erst die Relativitätstheorie.',
            en: 'Switching relativity “off” means c → ∞, which is Newton’s physics. Then r_s shrinks to zero and there is no event horizon – only relativity knows about horizons.' },
          live: { c: 'c', f: 10 },
        },
        G: {
          c: 'G', color: 'grav', tag: { de: 'Gravitation – Geometrie der Raumzeit', en: 'Gravity – the geometry of spacetime' },
          role: { de: 'G sagt, wie stark Masse die Raumzeit krümmt. Mehr G heißt ein größerer Horizont und damit ein kälteres Loch: T_H ist proportional zu 1/G.',
            en: 'G says how strongly mass curves spacetime. More G means a larger horizon and therefore a colder hole: T_H is proportional to 1/G.' },
          limit: 'G \\to 0 \\;\\Rightarrow\\; r_{\\mathrm{s}} \\to 0',
          limitText: { de: 'Ohne Gravitation gibt es keinen Horizont und kein Schwarzes Loch. Die Formel liefert trotzdem eine immer höhere Temperatur – ein Zeichen, dass sie dort nicht mehr gilt. Die App meldet das als „Außerhalb des Modells“.',
            en: 'Without gravity there is no horizon and no black hole. The formula still returns an ever higher temperature – a sign that it no longer applies there. The app reports this as “Outside the model”.' },
          live: { c: 'G', f: 1e-3, zero: true },
        },
        k_B: {
          c: 'k_B', color: 'thermo', tag: THERMO,
          role: { de: 'Die Boltzmann-Konstante macht aus einer Energie eine Temperatur. Durch sie wird das Schwarze Loch zu einem thermischen Körper – mit Temperatur und mit Entropie.',
            en: 'The Boltzmann constant turns an energy into a temperature. Through it the black hole becomes a thermal body – with a temperature and with an entropy.' },
          limit: 'k_{\\mathrm{B}} \\to 0 \\;\\Rightarrow\\; T_{\\mathrm{H}} \\to \\infty',
          limitText: { de: 'Die Temperatur in Kelvin divergiert, die Energie k_B·T_H = ħc³/(8πGM) bleibt aber gleich. k_B rechnet nur zwischen Energie und Temperatur um; seit 2019 ist ihr Wert exakt festgelegt.',
            en: 'The temperature in kelvin diverges, but the energy k_B·T_H = ħc³/(8πGM) stays the same. k_B only converts between energy and temperature; since 2019 its value has been fixed exactly.' },
          live: { c: 'k_B', f: 1e-3 },
        },
        M: {
          v: 'M', color: 'mass', tag: BH,
          meaning: { de: 'Die Gesamtmasse des Schwarzen Lochs. Bei realen Löchern bestimmt man sie aus den Bahnen von Sternen oder Gas in ihrer Umgebung.',
            en: 'The total mass of the black hole. For real holes it is determined from the orbits of stars or gas around them.' },
          role: { de: 'Die Masse ist die einzige Eigenschaft eines ungeladenen, nicht rotierenden Lochs – und die einzige Größe, die du hier frei wählst. Sie steht im Nenner: Je schwerer, desto kälter.',
            en: 'The mass is the only property of an uncharged, non-rotating hole – and the only quantity you choose freely here. It sits in the denominator: the heavier, the colder.' },
          limit: 'M \\to \\infty \\;\\Rightarrow\\; T_{\\mathrm{H}} \\to 0',
          limitText: { de: 'Große Löcher sind kalt, kleine heiß. Für M → 0 würde T_H divergieren – doch nahe der Planck-Masse (≈ 22 µg) versagt die semiklassische Rechnung.',
            en: 'Large holes are cold, small ones hot. As M → 0, T_H would diverge – but near the Planck mass (≈ 22 µg) the semiclassical calculation breaks down.' },
          live: { v: 'M', f: 1e-3 },
        },
        '8pi': {
          n: 8 * Math.PI, tex: '8\\pi', color: 'geo', name: PI8, tag: { de: 'Geometrie + Quantenperiodizität', en: 'Geometry + quantum periodicity' },
          role: { de: '8π = 4 · 2π. Die 4 stammt aus der Geometrie des Horizonts (κ = c⁴/4GM), die 2π aus der Periodizität der Quantenfelder in imaginärer Zeit – derselbe Faktor wie beim Unruh-Effekt.',
            en: '8π = 4 · 2π. The 4 comes from the geometry of the horizon (κ = c⁴/4GM), the 2π from the periodicity of the quantum fields in imaginary time – the same factor as in the Unruh effect.' },
          limit: '8\\pi = 4 \\cdot 2\\pi',
          limitText: { de: 'Eine reine Zahl – die Dimensionsanalyse kann sie nicht liefern. Sie ergibt ħc³/(GMk_B) nur bis auf einen solchen Faktor; erst die vollständige Rechnung zeigt, dass es 8π ist.',
            en: 'A pure number – dimensional analysis cannot supply it. It gives ħc³/(GMk_B) only up to such a factor; only the full calculation shows that it is 8π.' },
        },
      },
    },

    /* Bekenstein-Hawking-Entropie */
    'bh-entropy': {
      tex: '\\xs{S}{S_{\\mathrm{BH}}} = \\frac{\\xs{k_B}{k_{\\mathrm{B}}}\\, \\xs{c}{c^3} \\xs{A}{A}}{\\xs{four}{4}\\, \\xs{G}{G}\\, \\xs{hbar}{\\hbar}}',
      pre: 'A',
      symbols: {
        S: {
          o: 'S', color: 'res', tag: RESULT,
          meaning: { de: 'Die Entropie eines Schwarzen Lochs. In der statistischen Physik wäre S/k_B der Logarithmus der Zahl seiner Mikrozustände; welche Mikrozustände das bei einem Schwarzen Loch sind, ist offene Forschung.',
            en: 'The entropy of a black hole. In statistical physics, S/k_B would be the logarithm of the number of its microstates; what these microstates are for a black hole is an open research question.' },
          role: { de: 'Die Formel macht die Entropie proportional zur Fläche des Horizonts, nicht zu seinem Volumen. Für ein Loch mit Sonnenmasse ergibt das S/k_B ≈ 10⁷⁷.',
            en: 'The formula makes the entropy proportional to the area of the horizon, not to its volume. For a hole of one solar mass this gives S/k_B ≈ 10⁷⁷.' },
        },
        k_B: {
          c: 'k_B', color: 'thermo', tag: THERMO,
          role: { de: 'Gibt der Entropie ihre Einheit J/K. Teilt man durch k_B, bleibt eine reine Zahl: S_BH/k_B = A/(4 l_P²) mit der Planck-Länge l_P.',
            en: 'Gives the entropy its unit J/K. Dividing by k_B leaves a pure number: S_BH/k_B = A/(4 l_P²), with the Planck length l_P.' },
        },
        c: {
          c: 'c', tex: 'c^3', color: 'rel', tag: REL,
          role: { de: 'Steht in dritter Potenz im Zähler. Zusammen mit G und ħ bildet c die Planck-Fläche l_P² = ħG/c³ – in Vielfachen davon wird die Horizontfläche gezählt.',
            en: 'Appears to the third power in the numerator. Together with G and ħ, c forms the Planck area l_P² = ħG/c³ – the horizon area is counted in multiples of it.' },
        },
        A: {
          v: 'A', color: 'mass', tag: BH,
          meaning: { de: 'Die Fläche des Ereignishorizonts. Für ein ungeladenes, nicht rotierendes Loch ist A = 4π r_s² mit dem Schwarzschild-Radius r_s = 2GM/c².',
            en: 'The area of the event horizon. For an uncharged, non-rotating hole, A = 4π r_s² with the Schwarzschild radius r_s = 2GM/c².' },
          role: { de: 'Die Entropie wächst linear mit A: doppelte Fläche, doppelte Entropie. Bei gewöhnlicher Materie wächst die Entropie dagegen mit dem Volumen.',
            en: 'The entropy grows linearly with A: twice the area, twice the entropy. For ordinary matter, by contrast, entropy grows with the volume.' },
        },
        four: {
          n: 4, tex: '4', color: 'geo', tag: NUMBER, name: { de: 'Faktor 4 im Nenner', en: 'Factor 4 in the denominator' },
          role: { de: 'Der Faktor 1/4 folgt aus Hawkings Rechnung: Bekenstein hatte S ∝ A vorgeschlagen, erst die Hawking-Temperatur legte den Vorfaktor fest. Pro Planck-Fläche trägt der Horizont damit k_B/4 zur Entropie bei.',
            en: 'The factor 1/4 follows from Hawking’s calculation: Bekenstein had proposed S ∝ A, and only the Hawking temperature fixed the prefactor. Each Planck area of the horizon thus contributes k_B/4 to the entropy.' },
        },
        G: {
          c: 'G', color: 'grav', tag: GRAV,
          role: { de: 'Steht im Nenner. Bei gleicher Fläche A wird die Entropie mit größerem G kleiner, weil die Planck-Fläche ħG/c³ größer wird.',
            en: 'Appears in the denominator. For the same area A, a larger G means a smaller entropy, because the Planck area ħG/c³ becomes larger.' },
        },
        hbar: {
          c: 'hbar', color: 'q', tag: QM,
          role: { de: 'Steht im Nenner: Für ħ → 0 würde S_BH unendlich groß. Erst die Quantentheorie gibt einem Schwarzen Loch eine endliche Entropie.',
            en: 'Appears in the denominator: as ħ → 0, S_BH would become infinite. Only quantum theory gives a black hole a finite entropy.' },
        },
      },
    },

    /* Einsteinsche Feldgleichungen */
    efe: {
      tex: '\\xs{Gmn}{G_{\\mu\\nu}} + \\xs{Lambda}{\\Lambda}\\, \\xs{gmn}{g_{\\mu\\nu}} = \\frac{\\xs{8pi}{8\\pi} \\xs{G}{G}}{\\xs{c}{c^4}}\\, \\xs{Tmn}{T_{\\mu\\nu}}',
      pre: 'Gmn',
      symbols: {
        Gmn: {
          s: 'G_mn', tex: 'G_{\\mu\\nu}', color: 'res', tag: { de: 'Krümmung', en: 'Curvature' }, name: { de: 'Einstein-Tensor', en: 'Einstein tensor' },
          meaning: { de: 'Der Einstein-Tensor beschreibt, wie die Raumzeit gekrümmt ist. Er wird aus der Metrik und ihren ersten und zweiten Ableitungen gebildet: G_μν = R_μν − ½ R g_μν.',
            en: 'The Einstein tensor describes how spacetime is curved. It is built from the metric and its first and second derivatives: G_μν = R_μν − ½ R g_μν.' },
          role: { de: 'Die linke Seite ist Geometrie. Die Indizes μ, ν laufen über die Zeit und drei Raumrichtungen; weil G_μν symmetrisch ist, sind es 10 Gleichungen – eine je unabhängiger Komponente.',
            en: 'The left-hand side is geometry. The indices μ, ν run over time and the three directions of space; since G_μν is symmetric, these are 10 equations – one for each independent component.' },
          src: { key: 'K' }, at: { de: 'Größenordnung hier (K ~ κu)', en: 'Order of magnitude here (K ~ κu)' },
        },
        Lambda: {
          c: 'Lambda', color: 'cosmo', tag: { de: 'Kosmologie', en: 'Cosmology' },
          role: { de: 'Ein Zusatzterm, den Einstein 1917 einführte. Er krümmt die Raumzeit auch dort, wo keine Materie ist (T_μν = 0); auf kosmischen Skalen bewirkt ein positives Λ eine beschleunigte Expansion.',
            en: 'An extra term that Einstein introduced in 1917. It curves spacetime even where there is no matter (T_μν = 0); on cosmic scales a positive Λ causes an accelerating expansion.' },
        },
        gmn: {
          s: 'g_mn', tex: 'g_{\\mu\\nu}', color: 'res', tag: { de: 'Metrik', en: 'Metric' }, name: { de: 'Metrik', en: 'Metric' },
          unitNote: { de: 'wenn alle Koordinaten Längen sind (x⁰ = ct)', en: 'if all coordinates are lengths (x⁰ = ct)' },
          meaning: { de: 'Die Metrik legt fest, wie man in der Raumzeit Abstände und Zeitdauern misst. Sie ist die eigentliche Unbekannte: Die Feldgleichungen sind Differentialgleichungen für g_μν.',
            en: 'The metric determines how distances and durations are measured in spacetime. It is the actual unknown: the field equations are differential equations for g_μν.' },
          role: { de: 'Hier steht sie als Faktor beim Λ-Term. Zusätzlich steckt sie mit ihren Ableitungen in G_μν – deshalb sind die Gleichungen nichtlinear.',
            en: 'Here it appears as the factor in the Λ term. It also enters G_μν through its derivatives – which is why the equations are nonlinear.' },
        },
        '8pi': {
          n: 8 * Math.PI, tex: '8\\pi', color: 'geo', tag: NUMBER, name: PI8,
          role: { de: 'Der Faktor ist so gewählt, dass für schwache Felder und langsame Massen Newtons Gravitationsgesetz herauskommt (∇²Φ = 4πGρ).',
            en: 'The factor is chosen so that Newton’s law of gravity comes out for weak fields and slow masses (∇²Φ = 4πGρ).' },
        },
        G: {
          c: 'G', color: 'grav', tag: GRAV,
          role: { de: 'Bestimmt zusammen mit c⁴, wie stark Energie die Raumzeit krümmt. Der Faktor 8πG/c⁴ ≈ 2 × 10⁻⁴³ s²/(kg m) ist winzig – deshalb braucht spürbare Krümmung enorme Energiedichten.',
            en: 'Together with c⁴, it determines how strongly energy curves spacetime. The factor 8πG/c⁴ ≈ 2 × 10⁻⁴³ s²/(kg m) is tiny – which is why noticeable curvature takes enormous energy densities.' },
        },
        c: {
          c: 'c', tex: 'c^4', color: 'rel', tag: REL,
          role: { de: 'Steht in vierter Potenz im Nenner und rechnet so Energiedichte (J/m³) in Krümmung (1/m²) um. Weil G/c⁴ so klein ist, krümmt selbst dichte Materie die Raumzeit nur schwach.',
            en: 'Appears to the fourth power in the denominator and so converts energy density (J/m³) into curvature (1/m²). Because G/c⁴ is so small, even dense matter curves spacetime only weakly.' },
        },
        Tmn: {
          s: 'T_mn', tex: 'T_{\\mu\\nu}', color: 'mass', tag: { de: 'Materie und Energie', en: 'Matter and energy' }, name: { de: 'Energie-Impuls-Tensor', en: 'Stress–energy tensor' },
          meaning: { de: 'Beschreibt Energiedichte, Impulsdichte, Druck und Spannungen von Materie und Strahlung. Seine Zeit-Zeit-Komponente T₀₀ ist die Energiedichte, für ruhende Materie ohne Druck ρc².',
            en: 'Describes the energy density, momentum density, pressure and stresses of matter and radiation. Its time–time component T₀₀ is the energy density, ρc² for matter at rest without pressure.' },
          role: { de: 'Die rechte Seite ist die Quelle der Krümmung. Nicht nur Masse krümmt die Raumzeit, sondern auch Druck und Energieströme.',
            en: 'The right-hand side is the source of curvature. Not only mass curves spacetime, but also pressure and flows of energy.' },
          src: { var: 'u' }, at: { de: 'T₀₀ hier (eingestellte Energiedichte u)', en: 'T₀₀ here (the energy density u you set)' },
        },
      },
    },

    /* Schrödinger-Gleichung – ħ und ψ kommen mehrfach vor; alle Vorkommen gehören zu einem Symbol */
    schroedinger: {
      tex: '\\xs{i}{i}\\xs{hbar}{\\hbar}\\,\\frac{\\xs{dt}{\\partial} \\xs{psi}{\\psi}}{\\xs{dt}{\\partial t}} = \\Bigl[-\\frac{\\xs{hbar}{\\hbar^2}}{2\\xs{m}{m}}\\xs{lap}{\\nabla^2} + \\xs{V}{V}\\Bigr]\\xs{psi}{\\psi}',
      pre: 'psi',
      symbols: {
        psi: {
          s: 'psi', tex: '\\psi', color: 'res', tag: { de: 'Zustand', en: 'State' }, name: { de: 'Wellenfunktion', en: 'Wave function' },
          unitNote: { de: 'in einer Dimension, damit ∫|ψ|² dx = 1 ist', en: 'in one dimension, so that ∫|ψ|² dx = 1' },
          meaning: { de: 'Beschreibt den quantenmechanischen Zustand des Teilchens. |ψ|² ist die Wahrscheinlichkeitsdichte, es bei einer Messung an einem bestimmten Ort zu finden (Born-Regel).',
            en: 'Describes the quantum state of the particle. |ψ|² is the probability density of finding it at a given position in a measurement (Born rule).' },
          role: { de: 'Die Unbekannte, nach der die Gleichung gelöst wird. ψ steht in jedem Term genau einmal (linear): Summen von Lösungen sind wieder Lösungen – das Superpositionsprinzip.',
            en: 'The unknown the equation is solved for. ψ appears exactly once in every term (linearly): sums of solutions are again solutions – the superposition principle.' },
        },
        i: {
          s: 'i', tex: 'i', color: 'geo', tag: { de: 'Mathematik', en: 'Mathematics' }, name: { de: 'Imaginäre Einheit', en: 'Imaginary unit' },
          meaning: { de: 'Die Zahl mit i² = −1. Mit ihr sind Wellenfunktionen komplexwertig: Sie haben einen Betrag und eine Phase.',
            en: 'The number with i² = −1. With it, wave functions are complex-valued: they have a magnitude and a phase.' },
          role: { de: 'Durch i beschreibt die Gleichung Wellen: Ein Zustand fester Energie ändert nur seine Phase, ψ ∝ e^(−iEt/ħ). Ohne i hätte sie die Form einer Diffusionsgleichung, und ψ würde abklingen.',
            en: 'Because of i the equation describes waves: a state of definite energy only changes its phase, ψ ∝ e^(−iEt/ħ). Without i it would have the form of a diffusion equation, and ψ would decay.' },
        },
        hbar: {
          c: 'hbar', color: 'q', tag: QM,
          role: { de: 'Kommt zweimal vor. Links macht iħ ∂/∂t aus der zeitlichen Änderung eine Energie (E = ħω); rechts stammt ħ²/2m aus der kinetischen Energie p²/2m mit dem Impulsoperator p = −iħ∇.',
            en: 'Appears twice. On the left, iħ ∂/∂t turns the rate of change into an energy (E = ħω); on the right, ħ²/2m comes from the kinetic energy p²/2m with the momentum operator p = −iħ∇.' },
        },
        dt: {
          s: 'd_t', tex: '\\partial/\\partial t', color: 'geo', tag: { de: 'Zeitentwicklung', en: 'Time evolution' }, name: { de: 'Partielle Zeitableitung', en: 'Partial time derivative' },
          meaning: { de: 'Gibt an, wie schnell sich ψ an einem festen Ort mit der Zeit t ändert.',
            en: 'States how fast ψ changes with time t at a fixed position.' },
          role: { de: 'Die Gleichung enthält nur die erste Zeitableitung: Kennt man ψ zu einem Zeitpunkt, ist ψ für alle späteren Zeiten festgelegt. Wahrscheinlichkeiten treten erst bei der Messung auf (Born-Regel).',
            en: 'The equation contains only the first time derivative: if ψ is known at one moment, ψ is fixed for all later times. Probabilities only enter with the measurement (Born rule).' },
        },
        lap: {
          s: 'lap', tex: '\\nabla^2', color: 'geo', tag: { de: 'Ortsableitung', en: 'Spatial derivative' }, name: { de: 'Laplace-Operator', en: 'Laplace operator' },
          meaning: { de: 'Die Summe der zweiten Ableitungen nach den Ortskoordinaten, in einer Dimension ∂²/∂x². Er misst, wie stark ψ gekrümmt ist.',
            en: 'The sum of the second derivatives with respect to the spatial coordinates, in one dimension ∂²/∂x². It measures how strongly ψ is curved.' },
          role: { de: 'Zusammen mit −ħ²/2m bildet er die kinetische Energie: Je stärker ψ auf kurzer Strecke schwingt, desto größer sind Impuls und Energie.',
            en: 'Together with −ħ²/2m it forms the kinetic energy: the faster ψ oscillates over a short distance, the larger the momentum and the energy.' },
        },
        m: {
          v: 'm', color: 'mass', tag: { de: 'Teilchen', en: 'Particle' },
          meaning: { de: 'Die Masse des Teilchens, etwa eines Elektrons (≈ 9,1 × 10⁻³¹ kg).',
            en: 'The mass of the particle, for example an electron (≈ 9.1 × 10⁻³¹ kg).' },
          role: { de: 'Steht im Nenner der kinetischen Energie. Im Kasten liegen die Energieniveaus deshalb für schwere Teilchen dichter: E_n ∝ 1/m.',
            en: 'Appears in the denominator of the kinetic energy. In the box, the energy levels are therefore closer together for heavy particles: E_n ∝ 1/m.' },
        },
        V: {
          s: 'V', tex: 'V', color: 'mass', tag: { de: 'Umgebung', en: 'Surroundings' }, name: { de: 'Potential (potentielle Energie)', en: 'Potential (potential energy)' },
          meaning: { de: 'Die potentielle Energie des Teilchens an jedem Ort, etwa im elektrischen Feld eines Atomkerns.',
            en: 'The potential energy of the particle at each position, for example in the electric field of an atomic nucleus.' },
          role: { de: 'Beschreibt, worin sich das Teilchen bewegt. Hier ist es ein Kasten: V = 0 zwischen zwei unendlich hohen Wänden im Abstand L – deshalb sind nur bestimmte Energien möglich.',
            en: 'Describes what the particle moves in. Here it is a box: V = 0 between two infinitely high walls a distance L apart – which is why only certain energies are allowed.' },
        },
      },
    },

    /* Planck-Länge – die Formel im Kopf der Seite Planck-Einheiten */
    planck: {
      tex: '\\xs{lP}{l_{\\mathrm{P}}} = \\sqrt{\\frac{\\xs{hbar}{\\hbar} \\xs{G}{G}}{\\xs{c}{c^3}}}',
      pre: 'lP',
      symbols: {
        lP: {
          o: 'lP', color: 'res', tag: RESULT,
          meaning: { de: 'Die Länge, die sich allein aus ħ, G und c bilden lässt (bis auf Zahlenfaktoren). Man erwartet, dass bei dieser Skala Quanteneffekte der Gravitation wichtig werden – gemessen ist das nicht.',
            en: 'The length that can be built from ħ, G and c alone (up to numerical factors). Quantum effects of gravity are expected to matter at this scale – this has not been measured.' },
          role: { de: 'Das Ergebnis der Gleichung, ganz ohne menschlich gewählten Maßstab. Mit ≈ 1,6 × 10⁻³⁵ m liegt es rund 20 Größenordnungen unter dem Radius eines Protons.',
            en: 'The result of the equation, free of any human-chosen standard. At ≈ 1.6 × 10⁻³⁵ m it lies about 20 orders of magnitude below the radius of a proton.' },
        },
        hbar: {
          c: 'hbar', color: 'q', tag: QM,
          role: { de: 'Bringt die Quantentheorie ein. ħ steht unter der Wurzel im Zähler: l_P ∝ √ħ.',
            en: 'Brings in quantum theory. ħ sits under the square root in the numerator: l_P ∝ √ħ.' },
        },
        G: {
          c: 'G', color: 'grav', tag: GRAV,
          role: { de: 'Bringt die Gravitation ein: l_P ∝ √G. Weil ħ und c exakt festgelegt sind, stammt die gesamte Unsicherheit von l_P aus G.',
            en: 'Brings in gravity: l_P ∝ √G. Because ħ and c are fixed exactly, all of the uncertainty of l_P comes from G.' },
        },
        c: {
          c: 'c', tex: 'c^3', color: 'rel', tag: REL,
          role: { de: 'Bringt die Relativität ein und steht in dritter Potenz im Nenner: l_P ∝ c⁻³ᐟ². Nur mit dieser Potenz hat ħG/c³ die Dimension einer Fläche.',
            en: 'Brings in relativity and appears to the third power in the denominator: l_P ∝ c⁻³ᐟ². Only with this power does ħG/c³ have the dimension of an area.' },
        },
      },
    },

    /* ---------- Die übrigen Experimente: vorgewählt ist das Ergebnis, seine Rolle beschreibt den Aufbau der Formel ---------- */

    /* Newtonsche Gravitation – G ist hier ein Regler, der im Break-Modus freigegeben wird */
    'newton-gravity': {
      tex: '\\xs{F}{F} = \\xs{G}{G}\\,\\frac{\\xs{m1}{m_1}\\, \\xs{m2}{m_2}}{\\xs{r}{r^2}}',
      pre: 'F',
      symbols: {
        F: {
          o: 'F', color: 'res', tag: RESULT,
          meaning: { de: 'Der Betrag der Kraft, mit der sich zwei Massen gegenseitig anziehen. Sie wirkt auf beide Körper gleich stark, aber in entgegengesetzte Richtungen (actio = reactio).',
            en: 'The magnitude of the force with which two masses attract each other. It acts on both bodies with equal strength but in opposite directions (action = reaction).' },
          role: { de: 'Aufbau: Produkt der beiden Massen, geteilt durch das Quadrat des Abstands, mal G. Doppelte Masse heißt doppelte Kraft, doppelter Abstand ein Viertel der Kraft.',
            en: 'Structure: the product of the two masses, divided by the square of the distance, times G. Twice the mass means twice the force, twice the distance a quarter of the force.' },
        },
        G: {
          c: 'G', color: 'grav', tag: GRAV,
          role: { de: 'Macht aus „Masse mal Masse durch Abstand²“ eine Kraft in Newton. Ihr kleiner Wert erklärt, warum man die Anziehung zwischen Alltagsgegenständen kaum bemerkt: Zwei Massen von je 1 kg im Abstand von 1 m ziehen sich mit rund 7 × 10⁻¹¹ N an.',
            en: 'Turns “mass times mass over distance²” into a force in newtons. Its small value explains why the attraction between everyday objects is hardly noticeable: two masses of 1 kg each, 1 m apart, attract each other with about 7 × 10⁻¹¹ N.' },
        },
        m1: {
          v: 'm1', color: 'mass', tag: { de: 'Körper 1', en: 'Body 1' },
          meaning: { de: 'Die Masse des ersten Körpers. Hier tritt sie als schwere Masse auf: Sie bestimmt, wie stark der Körper Gravitation erzeugt und spürt.',
            en: 'The mass of the first body. Here it appears as gravitational mass: it determines how strongly the body produces and feels gravity.' },
          role: { de: 'Steht linear im Zähler: Doppelte Masse, doppelte Kraft. m₁ und m₂ lassen sich vertauschen – die Kraft ist für beide Körper gleich groß.',
            en: 'Appears linearly in the numerator: twice the mass, twice the force. m₁ and m₂ can be swapped – the force is the same for both bodies.' },
        },
        m2: {
          v: 'm2', color: 'mass', tag: { de: 'Körper 2', en: 'Body 2' },
          meaning: { de: 'Die Masse des zweiten Körpers, etwa eines Apfels, den die Erde (m₁) anzieht.',
            en: 'The mass of the second body, for example an apple attracted by the Earth (m₁).' },
          role: { de: 'Steht ebenfalls linear im Zähler. Die Beschleunigung des zweiten Körpers, a₂ = F/m₂ = G m₁/r², hängt von m₂ nicht ab – deshalb fallen alle Körper gleich schnell.',
            en: 'Also appears linearly in the numerator. The acceleration of the second body, a₂ = F/m₂ = G m₁/r², does not depend on m₂ – which is why all bodies fall equally fast.' },
        },
        r: {
          v: 'r', color: 'mass', tag: { de: 'Abstand', en: 'Distance' },
          meaning: { de: 'Der Abstand zwischen den Schwerpunkten der beiden Körper. Bei kugelsymmetrischen Körpern wirkt die Masse so, als säße sie ganz im Mittelpunkt.',
            en: 'The distance between the centres of mass of the two bodies. For spherically symmetric bodies the mass acts as if it were concentrated at the centre.' },
          role: { de: 'Steht im Quadrat im Nenner: Doppelter Abstand gibt ein Viertel der Kraft. Das 1/r² passt zur Verteilung über eine Kugeloberfläche, die mit r² wächst.',
            en: 'Appears squared in the denominator: twice the distance gives a quarter of the force. The 1/r² matches spreading over the surface of a sphere, which grows like r².' },
        },
      },
    },

    /* Gleichmäßig beschleunigte Bewegung – t kommt dreimal vor */
    kinematics: {
      tex: '\\xs{s}{s}(\\xs{t}{t}) = \\xs{s0}{s_0} + \\xs{v0}{v_0}\\,\\xs{t}{t} + \\xs{half}{\\tfrac12}\\,\\xs{a}{a}\\,\\xs{t}{t^2}',
      pre: 's',
      symbols: {
        s: {
          o: 's', color: 'res', tag: RESULT,
          meaning: { de: 'Der Ort des Körpers zur Zeit t, gemessen entlang einer geraden Bahn.',
            en: 'The position of the body at time t, measured along a straight path.' },
          role: { de: 'Aufbau: Startort plus der Weg, den die Anfangsgeschwindigkeit allein brächte, plus der Zusatzweg durch die Beschleunigung. Der letzte Term wächst mit t² – deshalb ist die Kurve eine Parabel.',
            en: 'Structure: the starting position, plus the distance the initial velocity alone would cover, plus the extra distance due to the acceleration. The last term grows with t² – which is why the curve is a parabola.' },
        },
        t: {
          v: 't', color: 'mass', tag: TIME,
          meaning: { de: 'Die Zeit seit dem Start der Bewegung (t = 0).',
            en: 'The time since the motion started (t = 0).' },
          role: { de: 'Kommt dreimal vor: als Argument in s(t), linear in v₀t und quadratisch in ½at². Für kleine t überwiegt der lineare Term, für große t der quadratische.',
            en: 'Appears three times: as the argument of s(t), linearly in v₀t and squared in ½at². For small t the linear term dominates, for large t the quadratic one.' },
        },
        s0: {
          v: 's0', color: 'mass', tag: START,
          meaning: { de: 'Der Ort zur Zeit t = 0. Wo der Nullpunkt liegt, ist frei gewählt.',
            en: 'The position at time t = 0. Where the zero point lies is a free choice.' },
          role: { de: 'Verschiebt die ganze Kurve nach oben oder unten, ändert aber weder Geschwindigkeit noch Beschleunigung.',
            en: 'Shifts the whole curve up or down but changes neither the velocity nor the acceleration.' },
        },
        v0: {
          v: 'v0', color: 'mass', tag: START,
          meaning: { de: 'Die Geschwindigkeit zur Zeit t = 0; ein negativer Wert heißt Bewegung in Gegenrichtung.',
            en: 'The velocity at time t = 0; a negative value means motion in the opposite direction.' },
          role: { de: 'Liefert den linearen Anteil v₀t – den Weg, den der Körper ohne Beschleunigung zurücklegen würde.',
            en: 'Supplies the linear part v₀t – the distance the body would cover without acceleration.' },
        },
        half: {
          n: 0.5, tex: '\\tfrac12', color: 'geo', tag: NUMBER, name: HALF,
          role: { de: 'Kommt aus dem Mittelwert: Der Geschwindigkeitszuwachs steigt gleichmäßig von 0 auf a·t, im Mittel also auf ½at – mal die Zeit t ergibt ½at².',
            en: 'Comes from the average: the gain in velocity rises steadily from 0 to a·t, so on average it is ½at – times the time t this gives ½at².' },
        },
        a: {
          v: 'a', color: 'mass', tag: { de: 'Beschleunigung', en: 'Acceleration' },
          meaning: { de: 'Um wie viel sich die Geschwindigkeit pro Sekunde ändert, hier konstant. Ein negatives a bremst eine Bewegung in positiver Richtung.',
            en: 'How much the velocity changes per second, constant here. A negative a slows down a motion in the positive direction.' },
          role: { de: 'Bestimmt den quadratischen Anteil ½at². Die Formel gilt nur, solange a wirklich konstant ist.',
            en: 'Determines the quadratic part ½at². The formula only holds as long as a really is constant.' },
        },
      },
    },

    /* Freier Fall */
    'free-fall': {
      tex: '\\xs{h}{h}(\\xs{t}{t}) = \\xs{h0}{h_0} - \\xs{half}{\\tfrac12}\\, \\xs{g}{g}\\, \\xs{t}{t^2}',
      pre: 'h',
      symbols: {
        h: {
          o: 'h', color: 'res', tag: RESULT,
          meaning: { de: 'Die Höhe des fallenden Körpers über dem Boden zur Zeit t.',
            en: 'The height of the falling body above the ground at time t.' },
          role: { de: 'Aufbau: Starthöhe minus Fallweg ½gt². Das Minuszeichen sagt, dass sich der Körper nach unten bewegt. Die Masse kommt nicht vor – ohne Luft fallen alle Körper gleich schnell.',
            en: 'Structure: the initial height minus the falling distance ½gt². The minus sign says that the body moves downwards. The mass does not appear – without air, all bodies fall equally fast.' },
        },
        t: {
          v: 't', color: 'mass', tag: TIME,
          meaning: { de: 'Die Zeit seit dem Loslassen; der Körper startet aus der Ruhe.',
            en: 'The time since release; the body starts from rest.' },
          role: { de: 'Steht im Quadrat: In doppelter Zeit fällt der Körper viermal so weit. Nach der Fallzeit t_fall = √(2h₀/g) liegt er am Boden, danach gilt die Formel nicht mehr.',
            en: 'Appears squared: in twice the time the body falls four times as far. After the fall time t_fall = √(2h₀/g) it lies on the ground, and the formula no longer applies.' },
        },
        h0: {
          v: 'h0', color: 'mass', tag: START,
          meaning: { de: 'Die Höhe, aus der der Körper losgelassen wird.',
            en: 'The height from which the body is released.' },
          role: { de: 'Der Startwert, von dem der Fallweg abgezogen wird. Er bestimmt, wie lange der Fall dauert: t_fall ∝ √h₀.',
            en: 'The starting value from which the falling distance is subtracted. It determines how long the fall lasts: t_fall ∝ √h₀.' },
        },
        half: {
          n: 0.5, tex: '\\tfrac12', color: 'geo', tag: NUMBER, name: HALF,
          role: { de: 'Kommt aus dem Mittelwert: Die Fallgeschwindigkeit steigt gleichmäßig von 0 auf g·t, im Mittel also auf ½gt – mal die Zeit t ergibt den Fallweg ½gt².',
            en: 'Comes from the average: the falling speed rises steadily from 0 to g·t, so on average it is ½gt – times the time t this gives the falling distance ½gt².' },
        },
        g: {
          v: 'g', color: 'grav', tag: GRAVITY,
          meaning: { de: 'Die Fallbeschleunigung: Ohne Luftwiderstand wächst die Fallgeschwindigkeit pro Sekunde um g. Auf der Erde sind es je nach Ort etwa 9,78 bis 9,83 m/s², auf dem Mond rund 1,6 m/s².',
            en: 'The gravitational acceleration: without air resistance, the falling speed grows by g every second. On Earth it is about 9.78 to 9.83 m/s² depending on location, on the Moon about 1.6 m/s².' },
          role: { de: 'Bestimmt, wie schnell der Fallweg wächst. Bei sechsmal kleinerem g (Mond) dauert derselbe Fall √6 ≈ 2,4-mal so lange.',
            en: 'Determines how fast the falling distance grows. With a g six times smaller (Moon), the same fall takes √6 ≈ 2.4 times as long.' },
        },
      },
    },

    /* Federpendel: Hookesches Gesetz – das Vorzeichen ist eigenes Symbol, weil es die Schwingung erst möglich macht */
    spring: {
      tex: '\\xs{F}{F} = \\xs{minus}{-}\\xs{k}{k}\\,\\xs{x}{x}',
      pre: 'F',
      symbols: {
        F: {
          o: 'F', color: 'res', tag: RESULT,
          meaning: { de: 'Die Kraft, mit der die Feder an der Masse zieht oder sie wegdrückt.',
            en: 'The force with which the spring pulls on the mass or pushes it away.' },
          role: { de: 'Aufbau: Federkonstante mal Auslenkung, mit umgekehrtem Vorzeichen. Weil die Kraft proportional zur Auslenkung ist, entsteht eine harmonische Schwingung mit T = 2π√(m/k).',
            en: 'Structure: the spring constant times the displacement, with the opposite sign. Because the force is proportional to the displacement, the result is a harmonic oscillation with T = 2π√(m/k).' },
        },
        minus: {
          n: -1, tex: '-', color: 'geo', tag: { de: 'Vorzeichen', en: 'Sign' }, name: { de: 'Minuszeichen', en: 'Minus sign' },
          role: { de: 'Die Kraft zeigt immer zur Ruhelage zurück: Zieht man die Masse nach rechts (x > 0), zieht die Feder nach links (F < 0). Ohne dieses Vorzeichen gäbe es keine Schwingung – die Auslenkung würde immer weiter wachsen.',
            en: 'The force always points back towards the equilibrium position: pull the mass to the right (x > 0) and the spring pulls to the left (F < 0). Without this sign there would be no oscillation – the displacement would keep growing.' },
        },
        k: {
          v: 'k', color: 'mass', tag: { de: 'Feder', en: 'Spring' },
          meaning: { de: 'Die Federkonstante gibt an, wie steif die Feder ist: wie viel Kraft pro Meter Auslenkung nötig ist.',
            en: 'The spring constant states how stiff the spring is: how much force is needed per metre of displacement.' },
          role: { de: 'Der Proportionalitätsfaktor zwischen Auslenkung und Kraft. Eine steifere Feder schwingt schneller: ω = √(k/m).',
            en: 'The proportionality factor between displacement and force. A stiffer spring oscillates faster: ω = √(k/m).' },
        },
        x: {
          v: 'x', color: 'mass', tag: { de: 'Auslenkung', en: 'Displacement' },
          meaning: { de: 'Wie weit die Masse aus der Ruhelage verschoben ist; das Vorzeichen gibt die Richtung an.',
            en: 'How far the mass is displaced from the equilibrium position; the sign gives the direction.' },
          role: { de: 'Die Kraft wächst linear mit x. Das gilt nur für kleine Auslenkungen – weit gedehnt wird jede reale Feder nichtlinear.',
            en: 'The force grows linearly with x. That only holds for small displacements – stretched far, every real spring becomes nonlinear.' },
        },
      },
    },

    /* Gleichförmige Kreisbewegung */
    circular: {
      tex: '\\xs{a}{a} = \\frac{\\xs{v}{v^2}}{\\xs{r}{r}}',
      pre: 'a',
      symbols: {
        a: {
          o: 'a', color: 'res', tag: RESULT,
          meaning: { de: 'Die Beschleunigung zum Kreismittelpunkt hin. Sie ändert nicht den Betrag der Geschwindigkeit, nur ihre Richtung.',
            en: 'The acceleration towards the centre of the circle. It does not change the magnitude of the velocity, only its direction.' },
          role: { de: 'Aufbau: Quadrat der Bahngeschwindigkeit, geteilt durch den Radius. Welche Kraft diese Beschleunigung liefert – Seil, Reibung oder Gravitation –, lässt die Formel offen.',
            en: 'Structure: the square of the orbital speed divided by the radius. Which force provides this acceleration – a rope, friction or gravity – is left open by the formula.' },
        },
        v: {
          v: 'v', color: 'mass', tag: { de: 'Geschwindigkeit', en: 'Speed' },
          meaning: { de: 'Der Betrag der Bahngeschwindigkeit; er bleibt bei der gleichförmigen Kreisbewegung konstant.',
            en: 'The magnitude of the orbital velocity; it stays constant in uniform circular motion.' },
          role: { de: 'Steht im Quadrat: Doppelte Geschwindigkeit braucht die vierfache Beschleunigung. Ein Faktor v kommt daher, wie schnell sich die Richtung dreht (v/r), der andere von der Länge des Geschwindigkeitspfeils.',
            en: 'Appears squared: twice the speed needs four times the acceleration. One factor v comes from how fast the direction turns (v/r), the other from the length of the velocity arrow.' },
        },
        r: {
          v: 'r', color: 'mass', tag: { de: 'Radius', en: 'Radius' },
          meaning: { de: 'Der Radius der Kreisbahn, gemessen vom Mittelpunkt.',
            en: 'The radius of the circular path, measured from the centre.' },
          role: { de: 'Steht im Nenner: Bei gleicher Geschwindigkeit ist eine enge Kurve stärker gekrümmt und braucht mehr Beschleunigung.',
            en: 'Appears in the denominator: at the same speed a tight bend is more strongly curved and needs more acceleration.' },
        },
      },
    },

    /* Fadenpendel, exakte Periodendauer */
    pendulum: {
      tex: '\\xs{T}{T} = \\xs{four}{4}\\sqrt{\\frac{\\xs{L}{L}}{\\xs{g}{g}}}\\;\\xs{K}{K}\\left(\\sin\\frac{\\xs{th}{\\theta_0}}{2}\\right)',
      pre: 'T',
      symbols: {
        T: {
          o: 'T', color: 'res', tag: RESULT,
          meaning: { de: 'Die Dauer einer vollen Schwingung, hin und zurück.',
            en: 'The duration of one full swing, there and back.' },
          role: { de: 'Aufbau: ein Zeitmaßstab √(L/g) mal ein Faktor, der nur von der Amplitude abhängt. Für kleine Ausschläge ist K ≈ π/2, und es bleibt die bekannte Näherung T₀ = 2π√(L/g).',
            en: 'Structure: a time scale √(L/g) times a factor that depends only on the amplitude. For small swings K ≈ π/2, which leaves the familiar approximation T₀ = 2π√(L/g).' },
        },
        four: {
          n: 4, tex: '4', color: 'geo', tag: NUMBER, name: { de: 'Faktor 4', en: 'Factor 4' },
          role: { de: 'Eine volle Schwingung besteht aus vier gleich langen Vierteln: von außen zur Mitte, zur anderen Seite, zurück zur Mitte, zurück nach außen. K·√(L/g) ist die Dauer eines Viertels.',
            en: 'A full swing consists of four equally long quarters: from the edge to the middle, to the other side, back to the middle, back to the edge. K·√(L/g) is the duration of one quarter.' },
        },
        L: {
          v: 'L', color: 'mass', tag: { de: 'Pendel', en: 'Pendulum' },
          meaning: { de: 'Die Länge des Fadens vom Aufhängepunkt bis zur Pendelmasse.',
            en: 'The length of the string from the pivot to the bob.' },
          role: { de: 'Steht unter der Wurzel: Ein viermal so langes Pendel braucht doppelt so lange für eine Schwingung. Die Masse kommt in der Formel nicht vor.',
            en: 'Appears under the square root: a pendulum four times as long takes twice as long for one swing. The mass does not appear in the formula.' },
        },
        g: {
          v: 'g', color: 'grav', tag: GRAVITY,
          meaning: { de: 'Die Fallbeschleunigung am Ort des Pendels, auf der Erde etwa 9,81 m/s².',
            en: 'The gravitational acceleration where the pendulum is, about 9.81 m/s² on Earth.' },
          role: { de: 'Steht unter der Wurzel im Nenner: Stärkere Schwerkraft lässt das Pendel schneller schwingen. Deshalb hat man g früher mit Pendeln gemessen.',
            en: 'Appears under the square root in the denominator: stronger gravity makes the pendulum swing faster. That is why g used to be measured with pendulums.' },
        },
        K: {
          m: 'ellipk', tex: 'K', color: 'geo', tag: { de: 'Mathematik', en: 'Mathematics' }, name: { de: 'Vollständiges elliptisches Integral erster Art', en: 'Complete elliptic integral of the first kind' },
          meaning: { de: 'Eine Funktion, die sich nicht durch Wurzeln, Winkelfunktionen oder Logarithmen ausdrücken lässt. Die App berechnet sie über das arithmetisch-geometrische Mittel.',
            en: 'A function that cannot be written in terms of roots, trigonometric functions or logarithms. The app computes it via the arithmetic–geometric mean.' },
          role: { de: 'Enthält die ganze Abhängigkeit von der Amplitude: K(0) = π/2, bei θ₀ = 90° ist K um 18 % größer. Für θ₀ → 180° wächst K über alle Grenzen.',
            en: 'Contains the entire dependence on the amplitude: K(0) = π/2, and at θ₀ = 90° K is 18 % larger. As θ₀ → 180°, K grows without limit.' },
        },
        th: {
          v: 'th', color: 'mass', tag: { de: 'Amplitude', en: 'Amplitude' }, unitNote: DEGREES, at: SET_DEG,
          meaning: { de: 'Der größte Ausschlagwinkel; aus ihm wird das Pendel losgelassen.',
            en: 'The largest angle of the swing; the pendulum is released from it.' },
          role: { de: 'Geht als sin(θ₀/2) in K ein. Bis etwa 23° weicht T um weniger als 1 % von der Näherung T₀ ab.',
            en: 'Enters K as sin(θ₀/2). Up to about 23°, T differs from the approximation T₀ by less than 1 %.' },
        },
      },
    },

    /* Schiefer Wurf: Wurfweite */
    projectile: {
      tex: '\\xs{R}{R} = \\frac{\\xs{v0}{v_0^2}\\,\\sin 2\\xs{al}{\\alpha}}{\\xs{g}{g}}',
      pre: 'R',
      symbols: {
        R: {
          o: 'R', color: 'res', tag: RESULT,
          meaning: { de: 'Wie weit der Körper fliegt, gemessen auf der Höhe des Abwurfpunkts.',
            en: 'How far the body flies, measured at the height of the launch point.' },
          role: { de: 'Aufbau: Geschwindigkeit zum Quadrat, mal ein Winkelfaktor zwischen 0 und 1, geteilt durch g. Das gilt ohne Luftwiderstand über ebenem Boden.',
            en: 'Structure: the speed squared, times an angle factor between 0 and 1, divided by g. This holds without air resistance over flat ground.' },
        },
        v0: {
          v: 'v0', color: 'mass', tag: START,
          meaning: { de: 'Der Betrag der Geschwindigkeit beim Abwurf.',
            en: 'The magnitude of the velocity at launch.' },
          role: { de: 'Steht im Quadrat: Doppelte Abwurfgeschwindigkeit, vierfache Weite. Ein Faktor v₀ steckt in der Flugdauer, der andere in der waagerechten Geschwindigkeit.',
            en: 'Appears squared: twice the launch speed, four times the range. One factor v₀ is in the time of flight, the other in the horizontal velocity.' },
        },
        al: {
          v: 'al', color: 'mass', tag: { de: 'Winkel', en: 'Angle' }, unitNote: DEGREES, at: SET_DEG,
          meaning: { de: 'Der Winkel zwischen Abwurfrichtung und Waagerechter.',
            en: 'The angle between the launch direction and the horizontal.' },
          role: { de: 'Geht als sin 2α ein: Die Weite ist waagerechte Geschwindigkeit (∝ cos α) mal Flugdauer (∝ sin α), und 2 sin α cos α = sin 2α. Deshalb liegt das Maximum bei 45°, und 30° reicht genauso weit wie 60°.',
            en: 'Enters as sin 2α: the range is the horizontal velocity (∝ cos α) times the time of flight (∝ sin α), and 2 sin α cos α = sin 2α. That is why the maximum is at 45°, and 30° reaches exactly as far as 60°.' },
        },
        g: {
          v: 'g', color: 'grav', tag: GRAVITY,
          meaning: { de: 'Die Fallbeschleunigung; sie zieht den Körper während des ganzen Flugs gleichmäßig nach unten.',
            en: 'The gravitational acceleration; it pulls the body down steadily throughout the flight.' },
          role: { de: 'Steht im Nenner: Auf dem Mond, wo g etwa sechsmal kleiner ist, fliegt derselbe Wurf etwa sechsmal so weit.',
            en: 'Appears in the denominator: on the Moon, where g is about six times smaller, the same throw goes about six times as far.' },
        },
      },
    },

    /* Lorentz-Faktor – v wird über β = v/c eingestellt */
    'special-rel': {
      tex: '\\xs{gamma}{\\gamma} = \\frac{1}{\\sqrt{1 - \\xs{v}{v^2}/\\xs{c}{c^2}}}',
      pre: 'gamma',
      symbols: {
        gamma: {
          o: 'gamma', color: 'res', tag: RESULT,
          meaning: { de: 'Der Lorentz-Faktor gibt an, um wie viel bewegte Uhren langsamer gehen und bewegte Maßstäbe in Bewegungsrichtung kürzer sind – jeweils vom ruhenden Beobachter aus gemessen.',
            en: 'The Lorentz factor states by how much moving clocks run slow and moving rulers are shorter along the direction of motion – each as measured by an observer at rest.' },
          role: { de: 'Aufbau: eins durch die Wurzel aus 1 − v²/c². γ ist immer mindestens 1; bei Alltagsgeschwindigkeiten kaum von 1 zu unterscheiden, für v → c wächst es über alle Grenzen.',
            en: 'Structure: one over the square root of 1 − v²/c². γ is always at least 1; at everyday speeds it is barely distinguishable from 1, and as v → c it grows without limit.' },
        },
        v: {
          o: 'v', color: 'mass', tag: { de: 'Bewegung', en: 'Motion' }, at: { de: 'Eingestellt (über β = v/c)', en: 'Set (via β = v/c)' },
          meaning: { de: 'Die Geschwindigkeit des bewegten Systems gegenüber dem Beobachter. Hier stellst du sie als Bruchteil β = v/c der Lichtgeschwindigkeit ein.',
            en: 'The speed of the moving frame relative to the observer. Here you set it as the fraction β = v/c of the speed of light.' },
          role: { de: 'Geht nur als Verhältnis v²/c² ein. Bei v = 0,8 c ist γ = 5/3, bei 0,99 c bereits etwa 7,1.',
            en: 'Enters only as the ratio v²/c². At v = 0.8 c, γ = 5/3; at 0.99 c it is already about 7.1.' },
        },
        c: {
          c: 'c', tex: 'c^2', color: 'rel', tag: REL,
          role: { de: 'Setzt den Maßstab: Es zählt nicht v allein, sondern v im Verhältnis zu c. Weil c so groß ist, sind relativistische Effekte im Alltag winzig – messbar nur mit Atomuhren.',
            en: 'Sets the scale: what matters is not v on its own, but v relative to c. Because c is so large, relativistic effects are tiny in everyday life – measurable only with atomic clocks.' },
        },
      },
    },

    /* Ideales Gas */
    'ideal-gas': {
      tex: '\\xs{p}{p}\\,\\xs{V}{V} = \\xs{N}{N}\\,\\xs{k_B}{k_{\\mathrm{B}}}\\,\\xs{T}{T}',
      pre: 'p',
      symbols: {
        p: {
          o: 'p', color: 'res', tag: RESULT,
          meaning: { de: 'Der Druck des Gases: die Kraft pro Fläche, die die Stöße der Teilchen auf die Wände ausüben.',
            en: 'The pressure of the gas: the force per area exerted on the walls by the impacts of the particles.' },
          role: { de: 'Aufbau: Links steht pV, rechts N k_B T – beides eine Energie. Die App löst nach dem Druck auf: p = N k_B T / V.',
            en: 'Structure: on the left pV, on the right N k_B T – both an energy. The app solves for the pressure: p = N k_B T / V.' },
        },
        V: {
          v: 'V', color: 'mass', tag: { de: 'Behälter', en: 'Container' },
          meaning: { de: 'Das Volumen, das dem Gas zur Verfügung steht.',
            en: 'The volume available to the gas.' },
          role: { de: 'Bei gleicher Temperatur und Teilchenzahl ist p umgekehrt proportional zu V (Boyle-Mariotte): halbes Volumen, doppelter Druck.',
            en: 'At the same temperature and number of particles, p is inversely proportional to V (Boyle–Mariotte): half the volume, twice the pressure.' },
        },
        N: {
          v: 'N', color: 'mass', tag: { de: 'Teilchen', en: 'Particles' },
          meaning: { de: 'Die Zahl der Gasteilchen, Atome oder Moleküle. Ein Mol sind N_A ≈ 6,022 × 10²³ Teilchen.',
            en: 'The number of gas particles, atoms or molecules. One mole is N_A ≈ 6.022 × 10²³ particles.' },
          role: { de: 'Mehr Teilchen bei gleichem Volumen und gleicher Temperatur heißt mehr Stöße und proportional mehr Druck (Avogadro). Welche Teilchen es sind, spielt keine Rolle.',
            en: 'More particles at the same volume and temperature mean more impacts and proportionally more pressure (Avogadro). Which particles they are does not matter.' },
        },
        k_B: {
          c: 'k_B', color: 'thermo', tag: THERMO,
          role: { de: 'Rechnet die Temperatur in eine Energie pro Teilchen um. Pro Mol statt pro Teilchen gerechnet wird daraus die Gaskonstante R = N_A k_B.',
            en: 'Converts the temperature into an energy per particle. Counted per mole instead of per particle, it becomes the gas constant R = N_A k_B.' },
        },
        T: {
          v: 'T', color: 'mass', tag: { de: 'Temperatur', en: 'Temperature' },
          meaning: { de: 'Die absolute Temperatur in Kelvin. Sie ist ein Maß für die mittlere Bewegungsenergie der Teilchen: E_kin = 3/2 k_B T.',
            en: 'The absolute temperature in kelvin. It is a measure of the mean kinetic energy of the particles: E_kin = 3/2 k_B T.' },
          role: { de: 'Bei festem Volumen steigt der Druck proportional zu T (Gay-Lussac). T muss in Kelvin stehen – in Grad Celsius gerechnet stimmt die Gleichung nicht.',
            en: 'At fixed volume, the pressure rises in proportion to T (Gay-Lussac). T must be in kelvin – calculated in degrees Celsius, the equation is wrong.' },
        },
      },
    },
  };

  /* ===================== Grundlagen („Theorie kurz erklärt“) =====================
     Die Kerngleichungen im Lesetext, gezeichnet von U.eqx.inline (schwebende Karte). Es gibt kein Experiment,
     deshalb statt v/o/s die Symbolart q: Größe mit ihrer Dimension. tex darf ein Paar { de, en } sein, wenn die
     Formel Text enthält. Ohne Marker gelesen ist tex genau die Formel, die vorher im Abschnitt stand. */
  // Symbole einer Famous-Equations-Gleichung für die Grundlagen: Verweise aufs Experiment durch die Dimension ersetzen
  const asTheory = (symbols, dims, extra) => Object.assign(Object.fromEntries(Object.entries(symbols).map(([k, x]) => {
    const { s: ref, o, v, src, at, ...rest } = x; // eslint-disable-line no-unused-vars
    return [k, ref !== undefined || o !== undefined || v !== undefined ? Object.assign(rest, { q: dims[k] }) : rest];
  })), extra || {});
  const RES = 'res', QTY = 'mass';
  const ENERGY_Q = { de: 'Energie', en: 'Energy' }, PROB = { de: 'Wahrscheinlichkeit', en: 'Probability' }, MATH = { de: 'Mathematik', en: 'Mathematics' };
  const ENTROPY_DIM = 'M L^2 T^-2 Θ^-1';
  const KB_ENT = { c: 'k_B', tex: 'k_B', color: 'thermo', tag: THERMO,
    role: { de: 'Rechnet die reine Zahl in eine Entropie mit der Einheit J/K um. Mehr steckt nicht darin – mit k_B = 1 wäre die Entropie dimensionslos.',
      en: 'Converts the pure number into an entropy with the unit J/K. That is all it does – with k_B = 1 the entropy would be dimensionless.' } };
  const LN_GIBBS = { m: 'ln', tex: '\\ln', color: 'geo', tag: MATH, name: { de: 'Natürlicher Logarithmus', en: 'Natural logarithm' },
    meaning: { de: 'Die Umkehrung der Exponentialfunktion; er macht aus Produkten Summen.', en: 'The inverse of the exponential function; it turns products into sums.' },
    role: { de: '−ln p_i misst die „Überraschung“ eines Mikrozustands: Seltene Zustände tragen viel bei, ein sicherer (p = 1) gar nichts.',
      en: '−ln p_i measures the “surprise” of a microstate: rare states contribute a lot, a certain one (p = 1) nothing at all.' } };
  const SUM_I = { m: 'sum', tex: '\\sum_i', color: 'geo', tag: MATH, name: { de: 'Summe über i', en: 'Sum over i' } };

  const theory = {
    /* 2 Inertialprinzip: erstes Newtonsches Gesetz */
    'inertia-law': {
      tex: { de: '\\xs{F}{\\sum \\vec{F}} = 0 \\;\\leftrightarrow\\; \\xs{v}{\\vec{v}} = \\text{konstant}', en: '\\xs{F}{\\sum \\vec{F}} = 0 \\;\\leftrightarrow\\; \\xs{v}{\\vec{v}} = \\text{constant}' },
      symbols: {
        F: {
          q: 'M L T^-2', tex: '\\sum \\vec{F}', color: QTY, tag: { de: 'Kraft', en: 'Force' }, name: { de: 'Resultierende Kraft', en: 'Resultant force' },
          meaning: { de: 'Die Vektorsumme aller Kräfte, die auf den Körper wirken. Heben sie sich gegenseitig auf, ist sie null – auch wenn die einzelnen Kräfte groß sind.',
            en: 'The vector sum of all forces acting on the body. If they cancel each other out, it is zero – even if the individual forces are large.' },
          role: { de: 'Links steht die Bedingung: keine resultierende Kraft. Der Doppelpfeil sagt, dass das in einem Inertialsystem genau dann gilt, wenn sich der Bewegungszustand nicht ändert.',
            en: 'The left-hand side is the condition: no resultant force. The double arrow says that, in an inertial frame, this holds exactly when the state of motion does not change.' },
        },
        v: {
          q: 'L T^-1', tex: '\\vec{v}', color: QTY, tag: { de: 'Bewegungszustand', en: 'State of motion' }, name: { de: 'Geschwindigkeit', en: 'Velocity' },
          meaning: { de: 'Ein Vektor aus Betrag und Richtung der Bewegung. Konstant heißt: weder schneller noch langsamer und keine Kurve.',
            en: 'A vector made of the magnitude and direction of the motion. Constant means: neither faster nor slower, and no turning.' },
          role: { de: 'Rechts steht die Folge: v bleibt, wie es ist, Ruhe (v = 0) eingeschlossen. Bewegung selbst braucht keine Ursache, nur ihre Änderung.',
            en: 'The right-hand side is the consequence: v stays as it is, rest (v = 0) included. Motion itself needs no cause, only a change of motion does.' },
        },
      },
    },
    /* 2 Träge Masse: zweites Newtonsches Gesetz */
    'inertia-mass': {
      tex: { de: '\\xs{m}{m_{\\text{träge}}} = \\frac{\\xs{F}{F}}{\\xs{a}{a}}', en: '\\xs{m}{m_{\\text{inertial}}} = \\frac{\\xs{F}{F}}{\\xs{a}{a}}' },
      symbols: {
        m: {
          q: 'M', tex: { de: 'm_{\\text{träge}}', en: 'm_{\\text{inertial}}' }, color: RES, tag: { de: 'Trägheit', en: 'Inertia' }, name: { de: 'Träge Masse', en: 'Inertial mass' },
          meaning: { de: 'Das Maß für den Widerstand eines Körpers gegen jede Änderung seiner Bewegung. Gemessen ist sie gleich der schweren Masse, die die Gravitation bestimmt – geprüft auf etwa 10⁻¹⁵.',
            en: 'The measure of a body’s resistance to any change in its motion. As measured, it equals the gravitational mass that determines gravity – tested to about 10⁻¹⁵.' },
          role: { de: 'Hier ist sie über das zweite Newtonsche Gesetz definiert: die Kraft geteilt durch die Beschleunigung, die diese Kraft bewirkt.',
            en: 'Here it is defined through Newton’s second law: the force divided by the acceleration that this force produces.' },
        },
        F: {
          q: 'M L T^-2', tex: 'F', color: QTY, tag: { de: 'Ursache', en: 'Cause' }, name: { de: 'Kraft', en: 'Force' },
          meaning: { de: 'Die resultierende Kraft auf den Körper, gemessen in Newton (1 N = 1 kg·m/s²).',
            en: 'The resultant force on the body, measured in newtons (1 N = 1 kg·m/s²).' },
          role: { de: 'Steht im Zähler: Für dieselbe Beschleunigung braucht ein doppelt so träger Körper die doppelte Kraft.',
            en: 'Appears in the numerator: for the same acceleration, a body with twice the inertia needs twice the force.' },
        },
        a: {
          q: 'L T^-2', tex: 'a', color: QTY, tag: { de: 'Wirkung', en: 'Effect' }, name: { de: 'Beschleunigung', en: 'Acceleration' },
          meaning: { de: 'Wie schnell sich die Geschwindigkeit ändert, nach Betrag oder Richtung.',
            en: 'How fast the velocity changes, in magnitude or direction.' },
          role: { de: 'Steht im Nenner: Dieselbe Kraft beschleunigt einen trägeren Körper weniger – einen Einkaufswagen kräftig, einen Lkw kaum.',
            en: 'Appears in the denominator: the same force accelerates a body with more inertia less – a shopping trolley strongly, a lorry hardly at all.' },
        },
      },
    },
    /* 3 Lorentz-Faktor */
    'rel-gamma': {
      tex: '\\xs{gamma}{\\gamma} = \\frac{1}{\\sqrt{1 - \\xs{v}{v^{2}}/\\xs{c}{c^{2}}}}',
      symbols: {
        gamma: {
          q: '', tex: '\\gamma', color: RES, tag: RESULT, name: { de: 'Lorentz-Faktor', en: 'Lorentz factor' },
          meaning: { de: 'Gibt an, um wie viel bewegte Uhren langsamer gehen und bewegte Maßstäbe kürzer sind – jeweils vom ruhenden Beobachter aus gemessen.',
            en: 'States by how much moving clocks run slow and moving rulers are shorter – each as measured by the observer at rest.' },
          role: { de: 'Steuert alle Effekte der Speziellen Relativitätstheorie: Zeitdilatation Δt = γΔτ, Längenkontraktion L = L₀/γ, Energie E = γmc².',
            en: 'Controls all the effects of special relativity: time dilation Δt = γΔτ, length contraction L = L₀/γ, energy E = γmc².' },
        },
        v: {
          q: 'L T^-1', tex: 'v', color: QTY, tag: { de: 'Bewegung', en: 'Motion' }, name: { de: 'Relativgeschwindigkeit', en: 'Relative speed' },
          meaning: { de: 'Die Geschwindigkeit, mit der sich zwei Beobachter gegeneinander bewegen.',
            en: 'The speed at which two observers move relative to each other.' },
          role: { de: 'Geht nur als Verhältnis v²/c² ein. Bei 0,8 c ist γ = 5/3, bei 0,99 c etwa 7,1.',
            en: 'Enters only as the ratio v²/c². At 0.8 c, γ = 5/3; at 0.99 c it is about 7.1.' },
        },
        c: {
          c: 'c', tex: 'c^2', color: 'rel', tag: REL,
          role: { de: 'Ist für alle Beobachter gleich – die Ausgangsannahme der Theorie. Für v → c geht die Wurzel gegen null und γ gegen unendlich: Kein Körper mit Masse erreicht c.',
            en: 'Is the same for all observers – the starting assumption of the theory. As v → c, the root goes to zero and γ to infinity: no body with mass reaches c.' },
        },
      },
    },
    /* 3 Feldgleichungen – Symboltexte wie bei den Famous Equations */
    'rel-efe': {
      tex: byId.efe.tex,
      symbols: asTheory(byId.efe.symbols, { Gmn: 'L^-2', gmn: '', Tmn: 'M L^-1 T^-2' }),
    },
    /* 4 Schrödinger-Gleichung mit Hamilton-Operator */
    'qm-schroedinger': {
      tex: '\\xs{i}{i}\\xs{hbar}{\\hbar}\\,\\frac{\\xs{dt}{\\partial} \\xs{psi}{\\psi}}{\\xs{dt}{\\partial t}} = \\xs{H}{\\hat{H}}\\,\\xs{psi}{\\psi}',
      symbols: asTheory({ psi: byId.schroedinger.symbols.psi, i: byId.schroedinger.symbols.i }, { psi: 'L^-3/2', i: '' }, {
        hbar: {
          c: 'hbar', color: 'q', tag: QM,
          role: { de: 'Verknüpft die zeitliche Änderung mit der Energie: Auf einen Zustand fester Energie E wirkt iħ ∂/∂t wie die Multiplikation mit E (E = ħω).',
            en: 'Links the rate of change with energy: on a state of definite energy E, iħ ∂/∂t acts like multiplication by E (E = ħω).' },
        },
        dt: asTheory({ dt: byId.schroedinger.symbols.dt }, { dt: 'T^-1' }).dt,
        H: {
          q: 'M L^2 T^-2', tex: '\\hat{H}', color: QTY, tag: ENERGY_Q, name: { de: 'Hamilton-Operator', en: 'Hamiltonian' },
          meaning: { de: 'Der Operator der Gesamtenergie, kinetische plus potentielle Energie. Für ein Teilchen im Potential ist Ĥ = −ħ²∇²/(2m) + V.',
            en: 'The operator of the total energy, kinetic plus potential. For a particle in a potential, Ĥ = −ħ²∇²/(2m) + V.' },
          role: { de: 'Enthält die ganze Physik des Systems: welche Kräfte wirken, welche Teilchen beteiligt sind. Seine Eigenwerte sind die möglichen Messwerte der Energie.',
            en: 'Contains all the physics of the system: which forces act, which particles are involved. Its eigenvalues are the possible measured values of the energy.' },
        },
      }),
    },
    /* 4 Unschärferelation */
    'qm-uncertainty': {
      tex: '\\xs{dx}{\\Delta x}\\,\\xs{dp}{\\Delta p} \\;\\geq\\; \\frac{\\xs{hbar}{\\hbar}}{\\xs{two}{2}}',
      symbols: {
        dx: {
          q: 'L', tex: '\\Delta x', color: QTY, tag: { de: 'Ort', en: 'Position' }, name: { de: 'Ortsunschärfe', en: 'Position uncertainty' },
          meaning: { de: 'Die Streuung der Ortswerte, die man an vielen gleich präparierten Systemen misst. Sie ist eine Eigenschaft des Zustands, keine Ungenauigkeit des Messgeräts.',
            en: 'The spread of the position values measured on many identically prepared systems. It is a property of the state, not an inaccuracy of the instrument.' },
          role: { de: 'Je schärfer der Ort festgelegt ist, desto größer muss Δp sein: Das Produkt kann ħ/2 nicht unterschreiten.',
            en: 'The more sharply the position is fixed, the larger Δp has to be: the product cannot drop below ħ/2.' },
        },
        dp: {
          q: 'M L T^-1', tex: '\\Delta p', color: QTY, tag: { de: 'Impuls', en: 'Momentum' }, name: { de: 'Impulsunschärfe', en: 'Momentum uncertainty' },
          meaning: { de: 'Die Streuung der Impulswerte an vielen gleich präparierten Systemen.',
            en: 'The spread of the momentum values on many identically prepared systems.' },
          role: { de: 'Wird klein, wenn ψ eine gut bestimmte Wellenlänge hat (λ = h/p). Dann ist ψ aber räumlich ausgedehnt und Δx groß.',
            en: 'Becomes small when ψ has a well-defined wavelength (λ = h/p). But then ψ is spread out in space and Δx is large.' },
        },
        hbar: {
          c: 'hbar', color: 'q', tag: QM,
          role: { de: 'Setzt die untere Grenze. Weil ħ so klein ist, spürt man die Unschärfe nur bei sehr kleinen Massen und Abständen.',
            en: 'Sets the lower limit. Because ħ is so small, the uncertainty only matters for very small masses and distances.' },
        },
        two: {
          n: 2, tex: '2', color: 'geo', tag: NUMBER, name: { de: 'Faktor 2 im Nenner', en: 'Factor 2 in the denominator' },
          role: { de: 'Die Schranke ħ/2 ist scharf: Ein Gaußsches Wellenpaket erreicht sie genau, alle anderen Zustände liegen darüber.',
            en: 'The bound ħ/2 is sharp: a Gaussian wave packet reaches it exactly, all other states lie above it.' },
        },
      },
    },
    /* 10 Warum nicht vereint: dimensionslose Stärke der Gravitation */
    'gap-coupling': {
      tex: '\\xs{aG}{\\alpha_G} \\sim \\frac{\\xs{G}{G}\\,\\xs{E}{E^{2}}}{\\xs{hbar}{\\hbar}\\, \\xs{c}{c^{5}}} = \\left(\\frac{\\xs{E}{E}}{\\xs{EP}{E_P}}\\right)^{2}',
      symbols: {
        aG: {
          q: '', tex: '\\alpha_G', color: RES, tag: RESULT, name: { de: 'Gravitative Kopplungsstärke', en: 'Gravitational coupling strength' },
          meaning: { de: 'Eine reine Zahl dafür, wie stark die Gravitation zwischen zwei Teilchen der Energie E im Vergleich zur Quantenskala ist. Für zwei ruhende Protonen (E = m_p c²) ist sie etwa 6 × 10⁻³⁹.',
            en: 'A pure number for how strong gravity is between two particles of energy E compared with the quantum scale. For two protons at rest (E = m_p c²) it is about 6 × 10⁻³⁹.' },
          role: { de: 'Das Zeichen ∼ heißt: nur die Größenordnung. α_G wächst mit dem Quadrat der Energie; bei E ≈ E_P wird es von der Größenordnung 1, und die quantisierte Gravitation verliert ihre Vorhersagekraft.',
            en: 'The symbol ∼ means: order of magnitude only. α_G grows with the square of the energy; at E ≈ E_P it reaches order 1, and quantised gravity loses its predictive power.' },
        },
        G: {
          c: 'G', color: 'grav', tag: GRAV,
          role: { de: 'G hat eine Dimension. Erst zusammen mit ħ und c entsteht eine reine Zahl – und die hängt dann von der Energie ab. Daran scheitert die Renormierung.',
            en: 'G has a dimension. Only together with ħ and c does it form a pure number – and that number then depends on the energy. This is where renormalisation fails.' },
        },
        E: {
          q: 'M L^2 T^-2', tex: 'E', color: QTY, tag: ENERGY_Q, name: { de: 'Energie der Teilchen', en: 'Energy of the particles' },
          meaning: { de: 'Die Energie der beteiligten Teilchen, etwa in einem Beschleuniger oder kurz nach dem Urknall.',
            en: 'The energy of the particles involved, for example in an accelerator or shortly after the Big Bang.' },
          role: { de: 'Steht im Quadrat: zehnfache Energie, hundertfache Kopplung. Bei den Energien heutiger Beschleuniger (rund 10⁴ GeV) liegt α_G noch etwa 30 Größenordnungen unter 1.',
            en: 'Appears squared: ten times the energy, a hundred times the coupling. At the energies of today’s accelerators (around 10⁴ GeV), α_G is still about 30 orders of magnitude below 1.' },
        },
        hbar: {
          c: 'hbar', color: 'q', tag: QM,
          role: { de: 'Steht im Nenner: Zusammen mit c macht ħ aus G eine Energieskala, die Planck-Energie. Gravitation zwischen Quanten wird erst relevant, wenn G E² mit ħ c⁵ vergleichbar ist.',
            en: 'Appears in the denominator: together with c, ħ turns G into an energy scale, the Planck energy. Gravity between quanta only matters when G E² is comparable to ħ c⁵.' },
        },
        c: {
          c: 'c', tex: 'c^5', color: 'rel', tag: REL,
          role: { de: 'Fünfte Potenz im Nenner, damit G E²/(ħ c⁵) dimensionslos wird.',
            en: 'Fifth power in the denominator, so that G E²/(ħ c⁵) is dimensionless.' },
        },
        EP: {
          q: 'M L^2 T^-2', tex: 'E_P', color: QTY, tag: { de: 'Planck-Skala', en: 'Planck scale' }, name: { de: 'Planck-Energie', en: 'Planck energy' },
          meaning: { de: 'E_P = √(ħc⁵/G) ≈ 1,2 × 10¹⁹ GeV ≈ 2 × 10⁹ J – die Energie, die sich allein aus ħ, c und G bilden lässt.',
            en: 'E_P = √(ħc⁵/G) ≈ 1.2 × 10¹⁹ GeV ≈ 2 × 10⁹ J – the energy that can be built from ħ, c and G alone.' },
          role: { de: 'Die zweite Form zeigt: α_G ist einfach (E/E_P)². Bei E = E_P ist die Kopplung von der Größenordnung 1.',
            en: 'The second form shows that α_G is simply (E/E_P)². At E = E_P the coupling is of order 1.' },
        },
      },
    },
    /* 5 Indizes: 00-Komponente der Feldgleichungen = Newton in Feldform */
    'idx-poisson': {
      tex: '\\xs{lap}{\\nabla^{2}}\\xs{Phi}{\\Phi} = \\xs{four}{4\\pi} \\xs{G}{G} \\xs{rho}{\\rho}',
      symbols: {
        lap: {
          m: 'laplace', dim: 'L^-2', tex: '\\nabla^2', color: 'geo', tag: { de: 'Ortsableitung', en: 'Spatial derivative' }, name: { de: 'Laplace-Operator', en: 'Laplace operator' },
          meaning: { de: 'Die Summe der zweiten Ableitungen nach x, y und z. Er misst, wie stark Φ an einem Punkt vom Mittel seiner Umgebung abweicht.',
            en: 'The sum of the second derivatives with respect to x, y and z. It measures how much Φ at a point differs from the average of its surroundings.' },
          role: { de: 'Macht aus der Gravitation eine Feldgleichung: Hier steht nicht die Kraft zwischen zwei Körpern, sondern wie sich das Potential von Punkt zu Punkt ändert.',
            en: 'Turns gravity into a field equation: what appears here is not the force between two bodies, but how the potential changes from point to point.' },
        },
        Phi: {
          q: 'L^2 T^-2', tex: '\\Phi', color: RES, tag: { de: 'Feld', en: 'Field' }, name: { de: 'Gravitationspotential', en: 'Gravitational potential' },
          meaning: { de: 'Die potentielle Energie pro Masse an jedem Ort. Ihr Gefälle ist die Fallbeschleunigung: g = −∇Φ.',
            en: 'The potential energy per mass at each point. Its gradient gives the gravitational acceleration: g = −∇Φ.' },
          role: { de: 'In der ART steckt Φ in der Metrik, für schwache Felder ist g₀₀ ≈ −(1 + 2Φ/c²). So wird die 00-Komponente der Feldgleichungen zu dieser Gleichung.',
            en: 'In general relativity, Φ sits in the metric: for weak fields, g₀₀ ≈ −(1 + 2Φ/c²). That is how the 00 component of the field equations becomes this equation.' },
        },
        four: {
          n: 4 * Math.PI, tex: '4\\pi', color: 'geo', tag: NUMBER, name: { de: 'Faktor 4π', en: 'Factor 4π' },
          role: { de: '4π ist die Oberfläche der Einheitskugel. Mit diesem Faktor ergibt sich für eine kugelförmige Masse genau Newtons 1/r²-Gesetz.',
            en: '4π is the surface area of the unit sphere. With this factor, a spherical mass gives exactly Newton’s 1/r² law.' },
        },
        G: {
          c: 'G', color: 'grav', tag: GRAV,
          role: { de: 'Koppelt die Masse an das Potential – dieselbe Konstante wie in Newtons Kraftgesetz.',
            en: 'Couples mass to the potential – the same constant as in Newton’s force law.' },
        },
        rho: {
          q: 'M L^-3', tex: '\\rho', color: QTY, tag: { de: 'Quelle', en: 'Source' }, name: { de: 'Massendichte', en: 'Mass density' },
          meaning: { de: 'Die Masse pro Volumen am betrachteten Ort.',
            en: 'The mass per volume at the point considered.' },
          role: { de: 'Die Quelle des Feldes. In der ART steht an dieser Stelle T₀₀ = ρc², die Energiedichte.',
            en: 'The source of the field. In general relativity, T₀₀ = ρc², the energy density, takes its place.' },
        },
      },
    },
    /* 5 Indizes: Abstandsquadrat mit Summenkonvention */
    'idx-interval': {
      tex: '\\xs{ds}{ds^{2}} = \\xs{eta}{\\eta_{\\mu\\nu}}\\, \\xs{dx}{dx^{\\mu}}\\, \\xs{dx}{dx^{\\nu}}',
      symbols: {
        ds: {
          q: 'L^2', tex: 'ds^2', color: RES, tag: RESULT, name: { de: 'Abstandsquadrat in der Raumzeit', en: 'Squared spacetime interval' },
          meaning: { de: 'Das Quadrat des Abstands zweier benachbarter Ereignisse in der Raumzeit. Alle Beobachter messen dafür denselben Wert, auch wenn sie Zeit- und Ortsabstände verschieden messen.',
            en: 'The square of the separation of two neighbouring events in spacetime. All observers measure the same value for it, even though they measure time and space separations differently.' },
          role: { de: 'Steht hier in Kurzschrift: Über μ und ν wird nach der Summenkonvention summiert, das sind 16 Summanden.',
            en: 'Written here in shorthand: μ and ν are summed over by the summation convention, which makes 16 terms.' },
        },
        eta: {
          q: '', tex: '\\eta_{\\mu\\nu}', color: QTY, tag: { de: 'Metrik', en: 'Metric' }, name: { de: 'Minkowski-Metrik', en: 'Minkowski metric' },
          unitNote: { de: 'wenn alle Koordinaten Längen sind (x⁰ = ct)', en: 'if all coordinates are lengths (x⁰ = ct)' },
          meaning: { de: 'Die Metrik der flachen Raumzeit ohne Gravitation: eine 4×4-Tabelle mit −1, 1, 1, 1 auf der Diagonale und sonst Nullen.',
            en: 'The metric of flat spacetime without gravity: a 4×4 table with −1, 1, 1, 1 on the diagonal and zeros elsewhere.' },
          role: { de: 'Legt fest, wie die Komponenten verrechnet werden. Der eine negative Eintrag ist der Unterschied zwischen Zeit und Raum; in der ART wird aus η_μν die gekrümmte g_μν.',
            en: 'Determines how the components are combined. The one negative entry is the difference between time and space; in general relativity, η_μν becomes the curved g_μν.' },
        },
        dx: {
          q: 'L', tex: 'dx^{\\mu}', color: QTY, tag: { de: 'Verschiebung', en: 'Displacement' }, name: { de: 'Koordinatendifferenz', en: 'Coordinate difference' },
          meaning: { de: 'Die vier kleinen Abstände zwischen den beiden Ereignissen: c·dt, dx, dy, dz.',
            en: 'The four small separations between the two events: c·dt, dx, dy, dz.' },
          role: { de: 'Kommt zweimal vor, einmal mit μ, einmal mit ν. Der Index steht oben, bei η_μν unten – so wird über ihn summiert.',
            en: 'Appears twice, once with μ and once with ν. The index is up here and down on η_μν – that is how it gets summed over.' },
        },
      },
    },
    /* 6 Tensor-Aufbau: Viererimpuls */
    'tensor-momentum': {
      tex: '\\xs{p}{p_{\\mu}}\\, \\xs{p}{p^{\\mu}} = -\\frac{\\xs{E}{E^{2}}}{\\xs{c}{c^{2}}} + \\xs{pv}{|\\vec{p}\\,|^{2}} = -\\xs{m}{m^{2}}\\xs{c}{c^{2}}',
      symbols: {
        p: {
          q: 'M L T^-1', tex: 'p^{\\mu}', color: RES, tag: { de: 'Vierervektor', en: 'Four-vector' }, name: { de: 'Viererimpuls', en: 'Four-momentum' },
          meaning: { de: 'Fasst Energie und Impuls zusammen: p^μ = (E/c, p_x, p_y, p_z). Mit unterem Index, p_μ, ist das Vorzeichen der Zeitkomponente umgedreht.',
            en: 'Combines energy and momentum: p^μ = (E/c, p_x, p_y, p_z). With a lower index, p_μ, the sign of the time component is flipped.' },
          role: { de: 'p_μ p^μ ist die „Länge zum Quadrat“ dieses Vektors, summiert über μ. Weil ein oberer mit einem unteren Index zusammentrifft, ist das Ergebnis für alle Beobachter gleich.',
            en: 'p_μ p^μ is the “squared length” of this vector, summed over μ. Because an upper index meets a lower one, the result is the same for all observers.' },
        },
        E: {
          q: 'M L^2 T^-2', tex: 'E', color: QTY, tag: { de: 'Zeitkomponente', en: 'Time component' }, name: { de: 'Energie', en: 'Energy' },
          meaning: { de: 'Die Gesamtenergie des Teilchens, einschließlich seiner Ruheenergie.',
            en: 'The total energy of the particle, including its rest energy.' },
          role: { de: 'Liefert die Zeitkomponente, mit Minuszeichen – dasselbe Minus wie vor c²dt² im Abstandsquadrat.',
            en: 'Supplies the time component, with a minus sign – the same minus as in front of c²dt² in the squared interval.' },
        },
        c: {
          c: 'c', tex: 'c^2', color: 'rel', tag: REL,
          role: { de: 'Rechnet zwischen Energie und Impuls um: E/c hat die Einheit eines Impulses, mc die einer Masse mal Geschwindigkeit.',
            en: 'Converts between energy and momentum: E/c has the unit of a momentum, and so does mc.' },
        },
        pv: {
          q: 'M L T^-1', tex: '|\\vec{p}\\,|', color: QTY, tag: { de: 'Raumkomponenten', en: 'Space components' }, name: { de: 'Betrag des Impulses', en: 'Magnitude of the momentum' },
          meaning: { de: 'Der Betrag des gewöhnlichen, dreidimensionalen Impulses.',
            en: 'The magnitude of the ordinary three-dimensional momentum.' },
          role: { de: 'Die drei Raumkomponenten zählen positiv. Für ein ruhendes Teilchen ist |p| = 0, und es folgt E = mc².',
            en: 'The three space components count positively. For a particle at rest |p| = 0, and E = mc² follows.' },
        },
        m: {
          q: 'M', tex: 'm', color: QTY, tag: { de: 'Invariante', en: 'Invariant' }, name: { de: 'Ruhemasse', en: 'Rest mass' },
          meaning: { de: 'Die Masse im Ruhesystem des Teilchens; sie ist für alle Beobachter gleich.',
            en: 'The mass in the rest frame of the particle; it is the same for all observers.' },
          role: { de: 'Die rechte Seite hängt nur von m ab. Daraus folgt E² = (mc²)² + (pc)², für Photonen mit m = 0 also E = pc.',
            en: 'The right-hand side depends only on m. From this follows E² = (mc²)² + (pc)², so for photons with m = 0, E = pc.' },
        },
      },
    },
    /* 7 Wirkung in der Mechanik */
    'action-mechanics': {
      tex: '\\xs{S}{S} = \\xs{int}{\\int} \\left(\\xs{Ek}{E_{\\text{kin}}} - \\xs{Ep}{E_{\\text{pot}}}\\right) \\xs{int}{dt}',
      symbols: {
        S: {
          q: 'M L^2 T^-1', tex: 'S', color: RES, tag: RESULT, name: { de: 'Wirkung', en: 'Action' },
          meaning: { de: 'Eine Zahl, die jedem denkbaren Weg eines Systems zugeordnet wird. Ihre Einheit J·s ist dieselbe wie die von ħ.',
            en: 'A number assigned to every conceivable path of a system. Its unit J·s is the same as that of ħ.' },
          role: { de: 'Die Natur wählt den Weg, auf dem S stationär ist: Kleine Änderungen des Weges ändern S in erster Ordnung nicht.',
            en: 'Nature picks the path on which S is stationary: small changes to the path do not change S to first order.' },
        },
        int: {
          m: 'integral', dim: 'T', tex: '\\int dt', color: 'geo', tag: MATH, name: { de: 'Integral über die Zeit', en: 'Integral over time' },
          meaning: { de: 'Summiert die Größe in der Klammer über die ganze Dauer des Weges auf.',
            en: 'Adds up the quantity in brackets over the whole duration of the path.' },
          role: { de: 'Deshalb hat S die Einheit Energie mal Zeit. Das Prinzip bewertet den Weg als Ganzes, nicht einzelne Augenblicke.',
            en: 'That is why S has the unit energy times time. The principle judges the path as a whole, not individual moments.' },
        },
        Ek: {
          q: 'M L^2 T^-2', tex: 'E_{\\text{kin}}', color: QTY, tag: ENERGY_Q, name: { de: 'Bewegungsenergie', en: 'Kinetic energy' },
          meaning: { de: 'Die Energie der Bewegung, für einen Massepunkt ½ m v².',
            en: 'The energy of motion, ½ m v² for a point mass.' },
          role: { de: 'Geht mit Pluszeichen ein: Schnelle Umwege kosten Wirkung.',
            en: 'Enters with a plus sign: fast detours cost action.' },
        },
        Ep: {
          q: 'M L^2 T^-2', tex: 'E_{\\text{pot}}', color: QTY, tag: ENERGY_Q, name: { de: 'Lageenergie', en: 'Potential energy' },
          meaning: { de: 'Die Energie der Lage in einem Kraftfeld, im Schwerefeld m g h.',
            en: 'The energy of position in a force field, m g h in a gravitational field.' },
          role: { de: 'Geht mit Minuszeichen ein. Gerade die Differenz statt der Summe sorgt dafür, dass aus der Forderung „stationär“ genau F = ma folgt.',
            en: 'Enters with a minus sign. It is precisely the difference rather than the sum that makes F = ma follow from the requirement “stationary”.' },
        },
      },
    },
    /* 7 Einstein-Hilbert-Wirkung */
    'action-eh': {
      tex: { de: '\\xs{S}{S} = \\frac{\\xs{c}{c^{3}}}{\\xs{n16}{16\\pi} \\xs{G}{G}}\\xs{int}{\\int} \\xs{R}{R}\\,\\xs{g}{\\sqrt{-g}}\\;\\xs{int}{d^{4}x} \\;+\\; \\xs{SM}{S_{\\text{Materie}}}',
        en: '\\xs{S}{S} = \\frac{\\xs{c}{c^{3}}}{\\xs{n16}{16\\pi} \\xs{G}{G}}\\xs{int}{\\int} \\xs{R}{R}\\,\\xs{g}{\\sqrt{-g}}\\;\\xs{int}{d^{4}x} \\;+\\; \\xs{SM}{S_{\\text{matter}}}' },
      symbols: {
        S: {
          q: 'M L^2 T^-1', tex: 'S', color: RES, tag: RESULT, name: { de: 'Einstein-Hilbert-Wirkung', en: 'Einstein–Hilbert action' },
          meaning: { de: 'Die Wirkung der Raumzeit samt Materie. Sie ordnet jeder denkbaren Geometrie eine Zahl zu.',
            en: 'The action of spacetime together with matter. It assigns a number to every conceivable geometry.' },
          role: { de: 'Verlangt man, dass S stationär ist, wenn man die Metrik ein wenig verändert, folgen daraus die Feldgleichungen.',
            en: 'Requiring S to be stationary when the metric is changed slightly yields the field equations.' },
        },
        c: {
          c: 'c', tex: 'c^3', color: 'rel', tag: REL,
          role: { de: 'Bildet mit G den Vorfaktor c³/(16πG) mit der Dimension Masse pro Zeit; zusammen mit dem Integral ergibt das die Einheit einer Wirkung, J·s.',
            en: 'Forms the prefactor c³/(16πG) with G, with the dimension mass per time; together with the integral this gives the unit of an action, J·s.' },
        },
        n16: {
          n: 16 * Math.PI, tex: '16\\pi', color: 'geo', tag: NUMBER, name: { de: 'Faktor 16π', en: 'Factor 16π' },
          role: { de: 'So gewählt, dass die Variation genau 8πG/c⁴ vor T_μν ergibt – und damit im Grenzfall Newtons Gesetz.',
            en: 'Chosen so that the variation gives exactly 8πG/c⁴ in front of T_μν – and therefore Newton’s law in the limit.' },
        },
        G: {
          c: 'G', color: 'grav', tag: GRAV,
          role: { de: 'Steht im Nenner des Vorfaktors: Je kleiner G, desto mehr Wirkung „kostet“ Krümmung – und desto weniger krümmt dieselbe Materie die Raumzeit.',
            en: 'Appears in the denominator of the prefactor: the smaller G, the more action curvature “costs” – and the less the same matter curves spacetime.' },
        },
        int: {
          m: 'integral', dim: 'L^4', tex: '\\int d^4x', color: 'geo', tag: MATH, name: { de: 'Integral über die Raumzeit', en: 'Integral over spacetime' },
          unitNote: { de: 'mit x⁰ = ct ist d⁴x = c·dt·dx·dy·dz ein Raumzeit-Volumen', en: 'with x⁰ = ct, d⁴x = c·dt·dx·dy·dz is a spacetime volume' },
          meaning: { de: 'Summiert über alle Punkte der Raumzeit, über Raum und Zeit zugleich.',
            en: 'Adds up over all points of spacetime, over space and time at once.' },
          role: { de: 'Wie beim Ball das Integral über die Zeit – nur bewertet es jetzt die ganze Geschichte der Geometrie.',
            en: 'Like the integral over time for the ball – except that it now judges the whole history of the geometry.' },
        },
        R: {
          q: 'L^-2', tex: 'R', color: QTY, tag: { de: 'Krümmung', en: 'Curvature' }, name: { de: 'Ricci-Skalar', en: 'Ricci scalar' },
          meaning: { de: 'Die einfachste Zahl, die sich aus der Krümmung der Raumzeit an einem Punkt bilden lässt. In flacher Raumzeit ist R = 0.',
            en: 'The simplest number that can be formed from the curvature of spacetime at a point. In flat spacetime R = 0.' },
          role: { de: 'Der Anteil der Geometrie an der Wirkung. Lovelock zeigte: In vier Dimensionen führt nur diese Wahl (plus Λ) auf Gleichungen mit höchstens zweiten Ableitungen der Metrik.',
            en: 'The geometry’s contribution to the action. Lovelock showed that in four dimensions only this choice (plus Λ) leads to equations with at most second derivatives of the metric.' },
        },
        g: {
          q: '', tex: '\\sqrt{-g}', color: QTY, tag: { de: 'Metrik', en: 'Metric' }, name: { de: 'Volumenfaktor √−g', en: 'Volume factor √−g' },
          meaning: { de: 'g ist die Determinante der Metrik g_μν. √−g macht aus d⁴x ein Volumen, das nicht von der Wahl der Koordinaten abhängt.',
            en: 'g is the determinant of the metric g_μν. √−g turns d⁴x into a volume that does not depend on the choice of coordinates.' },
          role: { de: 'Sorgt dafür, dass alle Beobachter dieselbe Wirkung berechnen. Das Minus steht da, weil g in der Raumzeit negativ ist.',
            en: 'Makes sure all observers compute the same action. The minus sign is there because g is negative in spacetime.' },
        },
        SM: {
          q: 'M L^2 T^-1', tex: { de: 'S_{\\text{Materie}}', en: 'S_{\\text{matter}}' }, color: QTY, tag: { de: 'Materie', en: 'Matter' }, name: { de: 'Wirkung der Materie', en: 'Matter action' },
          meaning: { de: 'Die Wirkung aller Felder und Teilchen in der Raumzeit, etwa des elektromagnetischen Feldes.',
            en: 'The action of all fields and particles in spacetime, for example the electromagnetic field.' },
          role: { de: 'Ihre Variation nach der Metrik liefert die rechte Seite der Feldgleichungen – so ist T_μν eigentlich definiert.',
            en: 'Its variation with respect to the metric gives the right-hand side of the field equations – that is how T_μν is actually defined.' },
        },
      },
    },
    /* 9 Entropie: Clausius */
    'entropy-clausius': {
      tex: '\\xs{dS}{dS} = \\frac{\\xs{dQ}{\\delta Q_{\\text{rev}}}}{\\xs{T}{T}} \\qquad [S] = \\mathrm{J/K}',
      symbols: {
        dS: {
          q: ENTROPY_DIM, tex: 'dS', color: RES, tag: RESULT, name: { de: 'Änderung der Entropie', en: 'Change in entropy' },
          meaning: { de: 'Um wie viel die Entropie bei einem kleinen Schritt zunimmt. Clausius definierte nur Änderungen, keinen absoluten Wert.',
            en: 'How much the entropy increases in a small step. Clausius defined only changes, not an absolute value.' },
          role: { de: 'In einem abgeschlossenen System nimmt S nie ab (zweiter Hauptsatz). Daraus folgt, dass Wärme von selbst nur vom Warmen zum Kalten fließt.',
            en: 'In an isolated system, S never decreases (second law). It follows that heat flows by itself only from warm to cold.' },
        },
        dQ: {
          q: 'M L^2 T^-2', tex: '\\delta Q_{\\text{rev}}', color: QTY, tag: { de: 'Wärme', en: 'Heat' }, name: { de: 'Umkehrbar zugeführte Wärme', en: 'Heat supplied reversibly' },
          meaning: { de: 'Eine kleine Wärmemenge, die auf umkehrbarem Weg zugeführt wird – so langsam, dass das System dabei stets im Gleichgewicht bleibt.',
            en: 'A small amount of heat supplied reversibly – so slowly that the system stays in equilibrium throughout.' },
          role: { de: 'Das δ statt d zeigt: Wärme ist keine Zustandsgröße, sie hängt vom Weg ab. Erst geteilt durch T entsteht mit dS eine Zustandsgröße.',
            en: 'The δ instead of d shows that heat is not a state variable; it depends on the path. Only after dividing by T does dS become one.' },
        },
        T: {
          q: 'Θ', tex: 'T', color: QTY, tag: { de: 'Temperatur', en: 'Temperature' }, name: { de: 'Absolute Temperatur', en: 'Absolute temperature' },
          meaning: { de: 'Die Temperatur in Kelvin, bei der die Wärme zugeführt wird.',
            en: 'The temperature in kelvin at which the heat is supplied.' },
          role: { de: 'Steht im Nenner: Dieselbe Wärme erhöht die Entropie bei tiefer Temperatur stärker. Deshalb wächst die Gesamtentropie, wenn Wärme vom Warmen zum Kalten fließt.',
            en: 'Appears in the denominator: the same heat raises the entropy more at a low temperature. That is why the total entropy grows when heat flows from warm to cold.' },
        },
      },
    },
    /* 9 Entropie: Boltzmann */
    'entropy-boltzmann': {
      tex: '\\xs{S}{S} = \\xs{kB}{k_B} \\xs{ln}{\\ln} \\xs{Om}{\\Omega}',
      symbols: {
        S: {
          q: ENTROPY_DIM, tex: 'S', color: RES, tag: RESULT, name: { de: 'Entropie (Boltzmann)', en: 'Entropy (Boltzmann)' },
          meaning: { de: 'Die Entropie eines Makrozustands, berechnet aus seinen Mikrozuständen.',
            en: 'The entropy of a macrostate, calculated from its microstates.' },
          role: { de: 'Verbindet die makroskopische Entropie von Clausius mit dem Abzählen von Anordnungen: Mehr Möglichkeiten heißt mehr Entropie.',
            en: 'Connects Clausius’s macroscopic entropy with counting arrangements: more possibilities mean more entropy.' },
        },
        kB: KB_ENT,
        ln: {
          m: 'ln', tex: '\\ln', color: 'geo', tag: MATH, name: { de: 'Natürlicher Logarithmus', en: 'Natural logarithm' },
          meaning: { de: 'Die Umkehrung der Exponentialfunktion; er macht aus Produkten Summen.', en: 'The inverse of the exponential function; it turns products into sums.' },
          role: { de: 'Macht die Entropie additiv: Zwei unabhängige Systeme haben Ω₁·Ω₂ Mikrozustände, der Logarithmus macht daraus S₁ + S₂. Außerdem bändigt er riesige Zahlen.',
            en: 'Makes entropy additive: two independent systems have Ω₁·Ω₂ microstates, and the logarithm turns this into S₁ + S₂. It also tames huge numbers.' },
        },
        Om: {
          q: '', tex: '\\Omega', color: QTY, tag: { de: 'Abzählen', en: 'Counting' }, name: { de: 'Zahl der Mikrozustände', en: 'Number of microstates' },
          meaning: { de: 'Auf wie viele verschiedene Arten sich ein Makrozustand mikroskopisch verwirklichen lässt. Das Modell oben auf der Seite zählt genau diese Zahl.',
            en: 'In how many different ways a macrostate can be realised microscopically. The model at the top of the page counts exactly this number.' },
          role: { de: 'Steht im Logarithmus. Die Formel setzt voraus, dass alle Mikrozustände gleich wahrscheinlich sind.',
            en: 'Sits inside the logarithm. The formula assumes that all microstates are equally likely.' },
        },
      },
    },
    /* 9 Entropie: Gibbs */
    'entropy-gibbs': {
      tex: '\\xs{S}{S} = -\\xs{kB}{k_B} \\xs{sum}{\\sum_{i}} \\xs{p}{p_i} \\xs{ln}{\\ln} \\xs{p}{p_i}',
      symbols: {
        S: {
          q: ENTROPY_DIM, tex: 'S', color: RES, tag: RESULT, name: { de: 'Entropie (Gibbs)', en: 'Entropy (Gibbs)' },
          meaning: { de: 'Die Entropie, wenn die Mikrozustände verschieden wahrscheinlich sind.',
            en: 'The entropy when the microstates have different probabilities.' },
          role: { de: 'Verallgemeinert Boltzmann: Sind alle Ω Mikrozustände gleich wahrscheinlich (p_i = 1/Ω), ergibt sich wieder S = k_B ln Ω.',
            en: 'Generalises Boltzmann: if all Ω microstates are equally likely (p_i = 1/Ω), S = k_B ln Ω comes out again.' },
        },
        kB: KB_ENT,
        sum: Object.assign({}, SUM_I, {
          meaning: { de: 'Addiert die Beiträge aller Mikrozustände i.', en: 'Adds up the contributions of all microstates i.' },
          role: { de: 'Jeder Mikrozustand trägt −p_i ln p_i bei. S ist damit der Mittelwert von −k_B ln p.',
            en: 'Each microstate contributes −p_i ln p_i. S is therefore the average of −k_B ln p.' },
        }),
        p: {
          q: '', tex: 'p_i', color: QTY, tag: PROB, name: { de: 'Wahrscheinlichkeit des Mikrozustands i', en: 'Probability of microstate i' },
          meaning: { de: 'Mit welcher Wahrscheinlichkeit sich das System im Mikrozustand i befindet; alle p_i zusammen ergeben 1.',
            en: 'The probability that the system is in microstate i; all p_i add up to 1.' },
          role: { de: 'Kommt zweimal vor: als Gewicht und im Logarithmus. Weil ln p_i ≤ 0 ist, macht das Minuszeichen vorn die Entropie positiv.',
            en: 'Appears twice: as a weight and inside the logarithm. Because ln p_i ≤ 0, the minus sign in front makes the entropy positive.' },
        },
        ln: LN_GIBBS,
      },
    },
    /* 9 Entropie: Shannon */
    'entropy-shannon': {
      tex: '\\xs{H}{H} = -\\xs{sum}{\\sum_{i}} \\xs{p}{p_i} \\xs{log}{\\log_{2}} \\xs{p}{p_i} \\qquad [H] = \\text{bit}',
      symbols: {
        H: {
          q: '', tex: 'H', color: RES, tag: RESULT, name: { de: 'Shannon-Entropie', en: 'Shannon entropy' },
          unitNote: { de: 'gezählt in bit (Logarithmus zur Basis 2)', en: 'counted in bits (logarithm to base 2)' },
          meaning: { de: 'Wie viel Information eine Nachricht im Mittel trägt – oder wie überrascht man im Schnitt ist, wenn man sie liest.',
            en: 'How much information a message carries on average – or how surprised you are on average when you read it.' },
          role: { de: 'Dieselbe Form wie bei Gibbs, nur ohne k_B und mit log₂. Eine faire Münze hat 1 bit, eine, die immer gleich fällt, 0 bit.',
            en: 'The same form as Gibbs’s, only without k_B and with log₂. A fair coin has 1 bit, one that always lands the same way 0 bits.' },
        },
        sum: Object.assign({}, SUM_I, {
          meaning: { de: 'Addiert über alle möglichen Zeichen oder Nachrichten i.', en: 'Adds up over all possible symbols or messages i.' },
          role: { de: 'Mittelt die Überraschung −log₂ p_i, gewichtet mit der Häufigkeit des Zeichens.',
            en: 'Averages the surprise −log₂ p_i, weighted by how often each symbol occurs.' },
        }),
        p: {
          q: '', tex: 'p_i', color: QTY, tag: PROB, name: { de: 'Wahrscheinlichkeit des Zeichens i', en: 'Probability of symbol i' },
          meaning: { de: 'Wie häufig das Zeichen oder die Nachricht i vorkommt.',
            en: 'How often the symbol or message i occurs.' },
          role: { de: 'Gleich wahrscheinliche Zeichen geben die größte Entropie: Bei n gleichen Möglichkeiten ist H = log₂ n.',
            en: 'Equally likely symbols give the largest entropy: with n equal possibilities, H = log₂ n.' },
        },
        log: {
          m: 'log2', tex: '\\log_2', color: 'geo', tag: MATH, name: { de: 'Logarithmus zur Basis 2', en: 'Logarithm to base 2' },
          meaning: { de: 'log₂ x gibt an, wie oft man 2 mit sich selbst multiplizieren muss, um x zu erhalten.',
            en: 'log₂ x states how many times you have to multiply 2 by itself to get x.' },
          role: { de: 'Die Basis 2 macht bit zur Einheit: Eine Ja-Nein-Entscheidung ist 1 bit. Mit ln statt log₂ und mal k_B wird daraus die Gibbs-Entropie – 1 bit entspricht k_B ln 2.',
            en: 'Base 2 makes the bit the unit: one yes/no decision is 1 bit. With ln instead of log₂ and times k_B, it becomes the Gibbs entropy – 1 bit corresponds to k_B ln 2.' },
        },
      },
    },
    /* 9 Entropie: von Neumann */
    'entropy-vonneumann': {
      tex: '\\xs{S}{S} = -\\xs{kB}{k_B}\\, \\xs{Tr}{\\mathrm{Tr}}\\left(\\xs{rho}{\\rho} \\xs{ln}{\\ln} \\xs{rho}{\\rho}\\right)',
      symbols: {
        S: {
          q: ENTROPY_DIM, tex: 'S', color: RES, tag: RESULT, name: { de: 'Von-Neumann-Entropie', en: 'Von Neumann entropy' },
          meaning: { de: 'Die Entropie eines Quantenzustands. Ein vollständig bekannter, reiner Zustand hat S = 0.',
            en: 'The entropy of a quantum state. A completely known, pure state has S = 0.' },
          role: { de: 'Die Quantenfassung der Gibbs-Formel: Statt einer Liste von Wahrscheinlichkeiten steht die Dichtematrix da. In ihrer Eigenbasis wird daraus wieder −k_B Σ p_i ln p_i.',
            en: 'The quantum version of the Gibbs formula: the density matrix replaces the list of probabilities. In its eigenbasis it becomes −k_B Σ p_i ln p_i again.' },
        },
        kB: KB_ENT,
        Tr: {
          m: 'trace', tex: '\\mathrm{Tr}', color: 'geo', tag: MATH, name: { de: 'Spur', en: 'Trace' },
          meaning: { de: 'Die Summe der Diagonaleinträge einer Matrix. Sie hängt nicht von der gewählten Basis ab.',
            en: 'The sum of the diagonal entries of a matrix. It does not depend on the chosen basis.' },
          role: { de: 'Ersetzt die Summe Σ_i der Gibbs-Formel. Weil die Spur basisunabhängig ist, ist es auch die Entropie.',
            en: 'Replaces the sum Σ_i of the Gibbs formula. Because the trace is independent of the basis, so is the entropy.' },
        },
        rho: {
          q: '', tex: '\\rho', color: QTY, tag: { de: 'Zustand', en: 'State' }, name: { de: 'Dichtematrix', en: 'Density matrix' },
          meaning: { de: 'Beschreibt einen Quantenzustand einschließlich klassischer Unkenntnis darüber, welcher Zustand vorliegt. Ihre Eigenwerte sind Wahrscheinlichkeiten.',
            en: 'Describes a quantum state, including classical ignorance about which state is present. Its eigenvalues are probabilities.' },
          role: { de: 'Kommt zweimal vor, wie p_i bei Gibbs. Bei einem reinen Zustand hat ρ einen Eigenwert 1 und sonst nur 0 – dann ist S = 0.',
            en: 'Appears twice, like p_i in Gibbs’s formula. For a pure state, ρ has one eigenvalue 1 and otherwise only 0 – then S = 0.' },
        },
        ln: {
          m: 'ln', tex: '\\ln', color: 'geo', tag: MATH, name: { de: 'Logarithmus einer Matrix', en: 'Matrix logarithm' },
          meaning: { de: 'In der Eigenbasis der Matrix wird einfach jeder Eigenwert logarithmiert.',
            en: 'In the eigenbasis of the matrix, each eigenvalue is simply replaced by its logarithm.' },
          role: { de: 'Spielt dieselbe Rolle wie ln p_i bei Gibbs: Er misst die Überraschung.',
            en: 'Plays the same role as ln p_i in Gibbs’s formula: it measures the surprise.' },
        },
      },
    },
    /* 9 Entropie: Bekenstein-Hawking – Symboltexte wie bei den Famous Equations, dazu die Planck-Fläche */
    'entropy-bh': {
      tex: '\\xs{S}{S_{BH}} = \\frac{\\xs{k_B}{k_B}\\, \\xs{c}{c^{3}} \\xs{A}{A}}{\\xs{four}{4} \\xs{G}{G} \\xs{hbar}{\\hbar}} = \\xs{k_B}{k_B}\\,\\frac{\\xs{A}{A}}{\\xs{four}{4}\\, \\xs{lP}{l_P^{2}}}',
      symbols: asTheory(byId['bh-entropy'].symbols, { S: ENTROPY_DIM, A: 'L^2' }, {
        lP: {
          q: 'L^2', tex: 'l_P^2', color: QTY, tag: { de: 'Planck-Skala', en: 'Planck scale' }, name: { de: 'Planck-Fläche', en: 'Planck area' },
          meaning: { de: 'l_P² = ħG/c³ ≈ 2,6 × 10⁻⁷⁰ m², das Quadrat der Planck-Länge.',
            en: 'l_P² = ħG/c³ ≈ 2.6 × 10⁻⁷⁰ m², the square of the Planck length.' },
          role: { de: 'Die zweite Form zeigt: Die Entropie zählt die Horizontfläche in Planck-Flächen – ein Viertel k_B pro Planck-Fläche.',
            en: 'The second form shows that the entropy counts the horizon area in Planck areas – a quarter of k_B per Planck area.' },
        },
      }),
    },
  };
  // Symbole, deren tex und Name bei den Famous Equations aus dem Experiment kamen
  theory['entropy-bh'].symbols.S.tex = 'S_{\\mathrm{BH}}';
  theory['entropy-bh'].symbols.A.tex = 'A';
  theory['entropy-bh'].symbols.S.name = { de: 'Bekenstein-Hawking-Entropie', en: 'Bekenstein–Hawking entropy' };
  theory['entropy-bh'].symbols.A.name = { de: 'Horizontfläche', en: 'Horizon area' };
  theory['qm-schroedinger'].symbols.psi.unitNote = { de: 'in drei Dimensionen, damit ∫|ψ|² d³x = 1 ist', en: 'in three dimensions, so that ∫|ψ|² d³x = 1' };

  PP.equations = PP.i18n.localize({ meaning, byId, theory });
})(globalThis.PP = globalThis.PP || {});
