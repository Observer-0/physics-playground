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

  PP.equations = PP.i18n.localize({ meaning, byId });
})(globalThis.PP = globalThis.PP || {});
