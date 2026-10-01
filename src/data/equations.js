/* =====================================================================
   Physics Playground — Interaktive Gleichungen (Famous Equations)
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
                n: 8π      reine Zahl
              color    Farbe xc-* (styles.css): q Quantenmechanik, rel Relativität,
                       grav Gravitation, thermo Thermodynamik, cosmo Kosmologie,
                       mass das physikalische Objekt bzw. die Eingabe, geo reine Zahl
                       oder Mathematik, res Ergebnis bzw. gesuchte Größe
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
          role: { de: 'Die linke Seite ist Geometrie. Die Indizes μ, ν laufen über die Zeit und drei Raumrichtungen; weil G_μν symmetrisch ist, stehen hier 10 unabhängige Gleichungen.',
            en: 'The left-hand side is geometry. The indices μ, ν run over time and the three directions of space; since G_μν is symmetric, this is 10 independent equations.' },
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
          role: { de: 'Die Gleichung enthält nur die erste Zeitableitung: Kennt man ψ zu einem Zeitpunkt, ist ψ für alle späteren Zeiten festgelegt. Zufall kommt erst bei der Messung ins Spiel.',
            en: 'The equation contains only the first time derivative: if ψ is known at one moment, ψ is fixed for all later times. Chance only enters with the measurement.' },
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
  };

  PP.equations = PP.i18n.localize({ meaning, byId });
})(globalThis.PP = globalThis.PP || {});
