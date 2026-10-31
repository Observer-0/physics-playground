/* =====================================================================
   Physics Playground — Quellen je Experiment (Tab „Quellen“)
   Originalarbeiten, Messungen und Referenzwerte. Jede DOI wurde über Crossref
   geprüft (Titel, Autoren, Jahr); ältere Werke ohne DOI stehen mit Erscheinungsort.
   kind: orig (Originalarbeit) · meas (Messung/Beobachtung) · ref (Referenzwert)
         trans (Übersetzung) · book (Nachschlagewerk)
   ===================================================================== */
(function (PP) {
  'use strict';
  const I = PP.i18n, M = PP.model;
  const src = (who, year, title, where, kind, note, link) => Object.assign({ who, year, title, where, kind, note }, link || {});

  const CODATA = src('P. J. Mohr, D. B. Newell, B. N. Taylor, E. Tiesinga', 2025, 'CODATA recommended values of the fundamental physical constants: 2022', 'Reviews of Modern Physics 97, 025002', 'ref',
    { de: 'Werte der Naturkonstanten in dieser App (CODATA 2022)', en: 'Values of the constants of nature used in this app (CODATA 2022)' }, { doi: '10.1103/RevModPhys.97.025002' });
  const SI = src('BIPM', 2019, 'The International System of Units (SI), 9th edition', 'Bureau International des Poids et Mesures', 'ref',
    { de: 'Seit 2019 sind h, e, k_B und N_A exakt festgelegt', en: 'Since 2019, h, e, k_B and N_A have been fixed exactly' }, { url: 'https://www.bipm.org/en/publications/si-brochure' });
  const GALILEI = src('G. Galilei', 1638, 'Discorsi e dimostrazioni matematiche intorno a due nuove scienze', 'Leiden: Elzevir', 'orig',
    { de: 'Gleichmäßig beschleunigte Bewegung (s ∝ t²), freier Fall, Wurfparabel, Pendel', en: 'Uniformly accelerated motion (s ∝ t²), free fall, the projectile parabola, the pendulum' }, { lang: 'it' });
  const HUYGENS = src('C. Huygens', 1673, 'Horologium Oscillatorium', 'Paris: F. Muguet', 'orig',
    { de: 'Pendeluhr und Zykloidenpendel; im Anhang die Sätze zur Zentrifugalkraft (a = v²/r)', en: 'The pendulum clock and cycloidal pendulum; the appendix contains the theorems on centrifugal force (a = v²/r)' }, { lang: 'la' });
  const BOLTZ = src('L. Boltzmann', 1877, 'Über die Beziehung zwischen dem zweiten Hauptsatze der mechanischen Wärmetheorie und der Wahrscheinlichkeitsrechnung …', 'Sitzungsberichte der Kaiserlichen Akademie der Wissenschaften Wien 76, 373–435', 'orig',
    { de: 'Entropie als Zahl der Mikrozustände – der Kern von S = k_B ln Ω', en: 'Entropy as the number of microstates – the core of S = k_B ln Ω' }, { lang: 'de' });
  const BOLTZ_EN = src('K. Sharp, F. Matschinsky', 2015, 'Translation of Ludwig Boltzmann’s paper “On the relationship between the second fundamental theorem of the mechanical theory of heat and probability calculations …”', 'Entropy 17, 1971–2009', 'trans',
    { de: 'Englische Übersetzung von Boltzmanns Arbeit von 1877', en: 'English translation of Boltzmann’s 1877 paper' }, { doi: '10.3390/e17041971' });
  const GW150914 = src('B. P. Abbott et al. (LIGO, Virgo)', 2016, 'Observation of gravitational waves from a binary black hole merger', 'Physical Review Letters 116, 061102', 'meas',
    { de: 'Erste direkt gemessene Gravitationswelle; zwei Schwarze Löcher mit ≈ 36 und ≈ 29 Sonnenmassen', en: 'First directly measured gravitational wave; two black holes of ≈ 36 and ≈ 29 solar masses' }, { doi: '10.1103/PhysRevLett.116.061102' });
  const EHT = src('Event Horizon Telescope Collaboration (K. Akiyama et al.)', 2019, 'First M87 Event Horizon Telescope results. I. The shadow of the supermassive black hole', 'The Astrophysical Journal Letters 875, L1', 'meas',
    { de: 'Erstes Bild eines Schwarzen Lochs; Masse von M87* ≈ 6,5 × 10⁹ Sonnenmassen', en: 'First image of a black hole; mass of M87* ≈ 6.5 × 10⁹ solar masses' }, { doi: '10.3847/2041-8213/ab0ec7' });
  const PLANCK18 = src('Planck Collaboration (N. Aghanim et al.)', 2020, 'Planck 2018 results. VI. Cosmological parameters', 'Astronomy & Astrophysics 641, A6', 'meas',
    { de: 'Λ, H₀ ≈ 67 km/s/Mpc und kritische Dichte (ΛCDM)', en: 'Λ, H₀ ≈ 67 km/s/Mpc and the critical density (ΛCDM)' }, { doi: '10.1051/0004-6361/201833910' });
  const HAWK75 = src('S. W. Hawking', 1975, 'Particle creation by black holes', 'Communications in Mathematical Physics 43, 199–220', 'orig',
    { de: 'Ausführliche Herleitung der Hawking-Strahlung und ihrer Temperatur', en: 'Full derivation of Hawking radiation and its temperature' }, { doi: '10.1007/BF02345020' });

  // Verschränkung über Gravitation: Vorschläge, keine Ergebnisse (Messproblem und Grundlagen §10)
  const BOSE17 = src('S. Bose et al.', 2017, 'Spin entanglement witness for quantum gravity', 'Physical Review Letters 119, 240401', 'orig',
    { de: 'Vorschlag: Verschränken sich zwei Massen nur über ihre Gravitation, muss die Gravitation Quanteneigenschaften haben – noch nicht durchgeführt', en: 'Proposal: if two masses become entangled only through their gravity, gravity must have quantum properties – not yet carried out' }, { doi: '10.1103/PhysRevLett.119.240401' });
  const MARLETTO17 = src('C. Marletto, V. Vedral', 2017, 'Gravitationally induced entanglement between two massive particles is sufficient evidence of quantum effects in gravity', 'Physical Review Letters 119, 240402', 'orig',
    { de: 'Derselbe Gedanke, unabhängig formuliert', en: 'The same idea, formulated independently' }, { doi: '10.1103/PhysRevLett.119.240402' });

  const SOURCES = {
    'newton-gravity': [
      src('I. Newton', 1687, 'Philosophiæ Naturalis Principia Mathematica', 'London: Royal Society', 'orig', { de: 'Das Gravitationsgesetz F ∝ m₁m₂/r²', en: 'The law of gravitation F ∝ m₁m₂/r²' }, { lang: 'la' }),
      src('H. Cavendish', 1798, 'Experiments to determine the density of the Earth', 'Philosophical Transactions of the Royal Society of London 88, 469–526', 'meas',
        { de: 'Erste Messung der Anziehung zwischen Labormassen – daraus folgt G', en: 'First measurement of the attraction between laboratory masses – G follows from it' }, { doi: '10.1098/rstl.1798.0022' }),
      src('J. D. Bekenstein', 1981, 'Universal upper bound on the entropy-to-energy ratio for bounded systems', 'Physical Review D 23, 287–298', 'orig', { de: 'Bekenstein-Schranke S ≤ 2πk_B ER/(ħc) – ohne G; Schwarze Löcher erreichen sie genau', en: 'Bekenstein bound S ≤ 2πk_B ER/(ħc) – without G; black holes attain it exactly' }, { doi: '10.1103/PhysRevD.23.287' }),
      src('H. Casini', 2008, 'Relative entropy and the Bekenstein bound', 'Classical and Quantum Gravity 25, 205021', 'orig', { de: 'Präzise Fassung der Schranke in der Quantenfeldtheorie: folgt aus der Positivität der relativen Entropie', en: 'Precise version of the bound in quantum field theory: follows from the positivity of relative entropy' }, { doi: '10.1088/0264-9381/25/20/205021' }),
      src('G. W. Gibbons, S. W. Hawking', 1977, 'Cosmological event horizons, thermodynamics, and particle creation', 'Physical Review D 15, 2738–2751', 'orig', { de: 'Auch der Horizont einer Raumzeit mit Λ hat Temperatur und Entropie – S = k_B A/(4 l_P²)', en: 'The horizon of a spacetime with Λ has a temperature and an entropy as well – S = k_B A/(4 l_P²)' }, { doi: '10.1103/PhysRevD.15.2738' }),
      src('D. J. Kapner et al.', 2007, 'Tests of the gravitational inverse-square law below the dark-energy length scale', 'Physical Review Letters 98, 021101', 'meas',
        { de: 'Das 1/r²-Gesetz gilt nachweislich bis hinunter zu etwa 56 µm', en: 'The 1/r² law has been shown to hold down to about 56 µm' }, { doi: '10.1103/PhysRevLett.98.021101' }),
      GW150914,
      src('A. Prša et al.', 2016, 'Nominal values for selected solar and planetary quantities: IAU 2015 Resolution B3', 'The Astronomical Journal 152, 41', 'ref',
        { de: 'Nominalwerte GM☉ und GM⊕ für Sonnen- und Erdmasse', en: 'Nominal values GM☉ and GM⊕ for the masses of the Sun and the Earth' }, { doi: '10.3847/0004-6256/152/2/41' }),
      CODATA,
    ],
    kinematics: [GALILEI],
    'free-fall': [
      GALILEI,
      src('P. Touboul et al. (MICROSCOPE)', 2022, 'MICROSCOPE mission: final results of the test of the equivalence principle', 'Physical Review Letters 129, 121102', 'meas',
        { de: 'Träge und schwere Masse gleich auf etwa 10⁻¹⁵ – deshalb fällt alles gleich schnell', en: 'Inertial and gravitational mass equal to about 10⁻¹⁵ – which is why everything falls equally fast' }, { doi: '10.1103/PhysRevLett.129.121102' }),
    ],
    spring: [src('R. Hooke', 1678, 'Lectures de Potentia Restitutiva, or of Spring', 'London: John Martyn', 'orig', { de: '„Ut tensio, sic vis“ – die Kraft wächst proportional zur Dehnung', en: '“Ut tensio, sic vis” – the force grows in proportion to the extension' })],
    circular: [HUYGENS],
    pendulum: [
      GALILEI, HUYGENS,
      src('F. W. J. Olver et al.', 2010, 'NIST Digital Library of Mathematical Functions, §19.8', 'National Institute of Standards and Technology', 'book',
        { de: 'Elliptisches Integral K über das arithmetisch-geometrische Mittel (Formel 19.8.5) – so rechnet die App', en: 'The elliptic integral K via the arithmetic–geometric mean (formula 19.8.5) – this is how the app computes it' }, { url: 'https://dlmf.nist.gov/19.8' }),
    ],
    projectile: [GALILEI],
    'special-rel': [
      src('A. Einstein', 1905, 'Zur Elektrodynamik bewegter Körper', 'Annalen der Physik 322, 891–921', 'orig', { de: 'Spezielle Relativitätstheorie: Zeitdilatation, Längenkontraktion', en: 'Special relativity: time dilation, length contraction' }, { doi: '10.1002/andp.19053221004', lang: 'de' }),
      src('A. Einstein', 1905, 'Ist die Trägheit eines Körpers von seinem Energieinhalt abhängig?', 'Annalen der Physik 323, 639–641', 'orig', { de: 'E = mc²', en: 'E = mc²' }, { doi: '10.1002/andp.19053231314', lang: 'de' }),
      src('B. Rossi, D. B. Hall', 1941, 'Variation of the rate of decay of mesotrons with momentum', 'Physical Review 59, 223–228', 'meas', { de: 'Zeitdilatation an Myonen der Höhenstrahlung', en: 'Time dilation of cosmic-ray muons' }, { doi: '10.1103/PhysRev.59.223' }),
      src('J. C. Hafele, R. E. Keating', 1972, 'Around-the-world atomic clocks: predicted relativistic time gains', 'Science 177, 166–168', 'meas', { de: 'Atomuhren im Flugzeug: Zeitdilatation mit makroskopischen Uhren', en: 'Atomic clocks on aircraft: time dilation with macroscopic clocks' }, { doi: '10.1126/science.177.4044.166' }),
      CODATA,
    ],
    'ideal-gas': [
      src('É. Clapeyron', 1834, 'Mémoire sur la puissance motrice de la chaleur', 'Journal de l’École Polytechnique 14, 153–190', 'orig', { de: 'Erste Form der Zustandsgleichung des idealen Gases', en: 'First form of the ideal gas equation of state' }, { lang: 'fr' }),
      BOLTZ, BOLTZ_EN, CODATA, SI,
    ],
    hawking: [
      src('S. W. Hawking', 1974, 'Black hole explosions?', 'Nature 248, 30–31', 'orig', { de: 'Erste Vorhersage, dass Schwarze Löcher thermisch strahlen', en: 'First prediction that black holes radiate thermally' }, { doi: '10.1038/248030a0' }),
      HAWK75,
      src('J. Steinhauer', 2016, 'Observation of quantum Hawking radiation and its entanglement in an analogue black hole', 'Nature Physics 12, 959–965', 'meas',
        { de: 'Analogexperiment im Bose-Einstein-Kondensat – keine Messung an einem echten Schwarzen Loch', en: 'Analogue experiment in a Bose–Einstein condensate – not a measurement on a real black hole' }, { doi: '10.1038/nphys3863' }),
      src('GRAVITY Collaboration (R. Abuter et al.)', 2022, 'Mass distribution in the Galactic Center based on interferometric astrometry of multiple stellar orbits', 'Astronomy & Astrophysics 657, L12', 'meas',
        { de: 'Masse von Sagittarius A* ≈ 4,3 × 10⁶ Sonnenmassen', en: 'Mass of Sagittarius A* ≈ 4.3 × 10⁶ solar masses' }, { doi: '10.1051/0004-6361/202142465' }),
      EHT,
      src('D. J. Fixsen', 2009, 'The temperature of the cosmic microwave background', 'The Astrophysical Journal 707, 916–920', 'meas', { de: 'T_CMB = 2,7255 K', en: 'T_CMB = 2.7255 K' }, { doi: '10.1088/0004-637X/707/2/916' }),
    ],
    'bh-entropy': [
      src('J. D. Bekenstein', 1973, 'Black holes and entropy', 'Physical Review D 7, 2333–2346', 'orig', { de: 'Entropie eines Schwarzen Lochs proportional zur Horizontfläche', en: 'Entropy of a black hole proportional to the horizon area' }, { doi: '10.1103/PhysRevD.7.2333' }),
      src('J. M. Bardeen, B. Carter, S. W. Hawking', 1973, 'The four laws of black hole mechanics', 'Communications in Mathematical Physics 31, 161–170', 'orig', { de: 'Die Gesetze der Schwarzloch-Mechanik – formal wie die Thermodynamik', en: 'The laws of black hole mechanics – formally like thermodynamics' }, { doi: '10.1007/BF01645742' }),
      Object.assign({}, HAWK75, { note: { de: 'Legt den Faktor 1/4 in S = k_B A/(4 l_P²) fest', en: 'Fixes the factor 1/4 in S = k_B A/(4 l_P²)' } }),
    ],
    // Offene Fragen, Frage 1 „Warum genau 1/4?“ – erscheint auch auf der Seite der Frage (src/ui/open.js)
    'bh-eta': [
      src('J. D. Bekenstein', 1973, 'Black holes and entropy', 'Physical Review D 7, 2333–2346', 'orig', { de: 'Entropie proportional zur Horizontfläche; der Vorfaktor nur abgeschätzt', en: 'Entropy proportional to the horizon area; the prefactor only estimated' }, { doi: '10.1103/PhysRevD.7.2333' }),
      Object.assign({}, HAWK75, { note: { de: 'Hawking-Temperatur – mit dem ersten Hauptsatz folgt daraus der Faktor 1/4', en: 'The Hawking temperature – together with the first law it gives the factor 1/4' } }),
      src('G. W. Gibbons, S. W. Hawking', 1977, 'Action integrals and partition functions in quantum gravity', 'Physical Review D 15, 2752–2756', 'orig', { de: 'Dieselbe Entropie aus dem euklidischen Pfadintegral', en: 'The same entropy from the Euclidean path integral' }, { doi: '10.1103/PhysRevD.15.2752' }),
      src('R. M. Wald', 1993, 'Black hole entropy is the Noether charge', 'Physical Review D 48, R3427–R3431', 'orig', { de: 'Entropie als Noether-Ladung am Horizont; für die ART wieder A/(4 l_P²)', en: 'Entropy as a Noether charge on the horizon; for GR again A/(4 l_P²)' }, { doi: '10.1103/PhysRevD.48.R3427' }),
      src('L. Bombelli, R. K. Koul, J. Lee, R. D. Sorkin', 1986, 'Quantum source of entropy for black holes', 'Physical Review D 34, 373–383', 'orig', { de: 'Verschränkungsentropie eines Quantenfelds vor dem Hintergrund eines Schwarzen Lochs', en: 'Entanglement entropy of a quantum field on the background of a black hole' }, { doi: '10.1103/PhysRevD.34.373' }),
      src('M. Srednicki', 1993, 'Entropy and area', 'Physical Review Letters 71, 666–669', 'orig', { de: 'Verschränkungsentropie in flacher Raumzeit wächst mit der Fläche; Vorfaktor hängt vom Cutoff ab', en: 'Entanglement entropy in flat spacetime grows with the area; the prefactor depends on the cutoff' }, { doi: '10.1103/PhysRevLett.71.666' }),
      src('S. W. Hawking', 1971, 'Gravitational radiation from colliding black holes', 'Physical Review Letters 26, 1344–1346', 'orig', { de: 'Flächensatz: Die Horizontfläche nimmt klassisch nie ab', en: 'Area theorem: classically, the horizon area never decreases' }, { doi: '10.1103/PhysRevLett.26.1344' }),
      src('M. Isi, W. M. Farr, M. Giesler, M. A. Scheel, S. A. Teukolsky', 2021, 'Testing the black-hole area law with GW150914', 'Physical Review Letters 127, 011103', 'meas', { de: 'Flächensatz an GW150914 geprüft – sagt nichts über den Faktor 1/4', en: 'Area theorem tested with GW150914 – says nothing about the factor 1/4' }, { doi: '10.1103/PhysRevLett.127.011103' }),
      src('LIGO Scientific, Virgo and KAGRA Collaborations (A. G. Abac et al.)', 2025, 'GW250114: Testing Hawking’s area law and the Kerr nature of black holes', 'Physical Review Letters 135, 111403', 'meas', { de: 'Deutlich genauerer Test des Flächensatzes', en: 'A much more precise test of the area theorem' }, { doi: '10.1103/kw5g-d732' }),
    ],
    // Offene Fragen, Frage 2 „Warum ist Λ so klein?“ – erscheint auch auf der Seite der Frage
    'lambda-vac': [
      src('A. Einstein', 1917, 'Kosmologische Betrachtungen zur allgemeinen Relativitätstheorie', 'Sitzungsberichte der Königlich Preußischen Akademie der Wissenschaften (Berlin), 142–152', 'orig', { de: 'Führt Λ in die Feldgleichungen ein – damals für ein statisches Universum', en: 'Introduces Λ into the field equations – at the time for a static universe' }, { lang: 'de' }),
      src('A. G. Riess et al.', 1998, 'Observational evidence from supernovae for an accelerating universe and a cosmological constant', 'The Astronomical Journal 116, 1009–1038', 'meas', { de: 'Beschleunigte Expansion aus fernen Supernovae vom Typ Ia', en: 'Accelerating expansion from distant type Ia supernovae' }, { doi: '10.1086/300499' }),
      src('S. Perlmutter et al.', 1999, 'Measurements of Ω and Λ from 42 high-redshift supernovae', 'The Astrophysical Journal 517, 565–586', 'meas', { de: 'Unabhängige Bestätigung mit einer zweiten Supernova-Stichprobe: Λ > 0', en: 'Independent confirmation with a second supernova sample: Λ > 0' }, { doi: '10.1086/307221' }),
      Object.assign({}, PLANCK18, { note: { de: 'Λ ≈ 1,1 × 10⁻⁵² m⁻² im ΛCDM-Modell – der Wert in dieser App', en: 'Λ ≈ 1.1 × 10⁻⁵² m⁻² within the ΛCDM model – the value used in this app' } }),
      src('DESI Collaboration (M. Abdul-Karim et al.)', 2025, 'DESI DR2 results. II. Measurements of baryon acoustic oscillations and cosmological constraints', 'Physical Review D 112, 083515', 'meas', { de: 'Hinweise auf zeitlich veränderliche Dunkle Energie: 2,8 bis 4,2 σ je nach Datenkombination – kein Nachweis', en: 'Hints of time-varying dark energy: 2.8 to 4.2 σ depending on the data combination – not a detection' }, { doi: '10.1103/tr6y-kpc6' }),
      src('S. Weinberg', 1989, 'The cosmological constant problem', 'Reviews of Modern Physics 61, 1–23', 'orig', { de: 'Die klassische Übersicht: warum die Vakuumenergie das Problem macht', en: 'The classic review: why the vacuum energy creates the problem' }, { doi: '10.1103/RevModPhys.61.1' }),
      src('J. Martin', 2012, 'Everything you always wanted to know about the cosmological constant problem (but were afraid to ask)', 'Comptes Rendus Physique 13, 566–665', 'orig', { de: 'Lorentz-invariante Rechnung: weit unter den oft zitierten 10¹²², aber immer noch viel zu groß; Lamb-Verschiebung, Casimir-Effekt, Phasenübergänge', en: 'Lorentz-invariant calculation: far below the often-quoted 10¹²², but still far too large; Lamb shift, Casimir effect, phase transitions' }, { doi: '10.1016/j.crhy.2012.04.008' }),
      src('D. J. Kapner et al.', 2007, 'Tests of the gravitational inverse-square law below the dark-energy length scale', 'Physical Review Letters 98, 021101', 'meas', { de: 'Newtons 1/r²-Gesetz gilt bis ≈ 56 µm – unterhalb von ħc/E_Λ ≈ 0,09 mm', en: 'Newton’s 1/r² law holds down to ≈ 56 µm – below ħc/E_Λ ≈ 0.09 mm' }, { doi: '10.1103/PhysRevLett.98.021101' }),
      CODATA,
    ],
    // Offene Fragen, Frage 3 „Geht Information verloren?“ – erscheint auch auf der Seite der Frage
    'bh-page': [
      Object.assign({}, HAWK75, { note: { de: 'Thermische Strahlung: Das Loch verliert Masse und wird dabei heißer', en: 'Thermal radiation: the hole loses mass and becomes hotter in the process' } }),
      src('S. W. Hawking', 1976, 'Breakdown of predictability in gravitational collapse', 'Physical Review D 14, 2460–2473', 'orig', { de: 'Das Informationsparadoxon: Aus einem reinen würde ein gemischter Zustand', en: 'The information paradox: a pure state would turn into a mixed one' }, { doi: '10.1103/PhysRevD.14.2460' }),
      src('D. N. Page', 1993, 'Average entropy of a subsystem', 'Physical Review Letters 71, 1291–1294', 'orig', { de: 'Bei einem zufälligen reinen Gesamtzustand ist das kleinere Teilsystem fast maximal verschränkt – daher das Minimum', en: 'For a random pure total state, the smaller subsystem is almost maximally entangled – hence the minimum' }, { doi: '10.1103/PhysRevLett.71.1291' }),
      src('D. N. Page', 1993, 'Information in black hole radiation', 'Physical Review Letters 71, 3743–3746', 'orig', { de: 'Die Page-Kurve: Entropie der Strahlung bei unitärer Verdampfung', en: 'The Page curve: entropy of the radiation for unitary evaporation' }, { doi: '10.1103/PhysRevLett.71.3743' }),
      src('D. N. Page', 2013, 'Time dependence of Hawking radiation entropy', 'Journal of Cosmology and Astroparticle Physics 2013 (09), 028', 'orig', { de: 'β ≈ 1,4847 für Photonen und Gravitonen; Maximum nach ≈ 53,81 % der Verdampfungszeit', en: 'β ≈ 1.4847 for photons and gravitons; maximum after ≈ 53.81 % of the evaporation time' }, { doi: '10.1088/1475-7516/2013/09/028' }),
      src('A. Almheiri, T. Hartman, J. Maldacena, E. Shaghoulian, A. Tajdini', 2020, 'Replica wormholes and the entropy of Hawking radiation', 'Journal of High Energy Physics 2020 (05), 013', 'orig', { de: 'Semiklassische Rechnung in einem zweidimensionalen Modell: Die Entropie der Strahlung folgt der Page-Kurve', en: 'Semiclassical calculation in a two-dimensional model: the entropy of the radiation follows the Page curve' }, { doi: '10.1007/JHEP05(2020)013' }),
      src('J. Steinhauer', 2016, 'Observation of quantum Hawking radiation and its entanglement in an analogue black hole', 'Nature Physics 12, 959–965', 'meas',
        { de: 'Analogexperiment im Bose-Einstein-Kondensat – kein Schwarzes Loch und kein Test des Paradoxons', en: 'Analogue experiment in a Bose–Einstein condensate – not a black hole and not a test of the paradox' }, { doi: '10.1038/nphys3863' }),
    ],
    // Offene Fragen, Frage 4 „Das Messproblem“ – erscheint auch auf der Seite der Frage
    decoherence: [
      src('M. Born', 1926, 'Zur Quantenmechanik der Stoßvorgänge', 'Zeitschrift für Physik 37, 863–867', 'orig', { de: 'Wahrscheinlichkeitsdeutung der Wellenfunktion; das Betragsquadrat steht in einer Fußnote, die bei der Korrektur hinzukam', en: 'Probability interpretation of the wave function; the absolute square appears in a footnote added in proof' }, { doi: '10.1007/BF01397477', lang: 'de' }),
      src('J. von Neumann', 1932, 'Mathematische Grundlagen der Quantenmechanik', 'Berlin: Springer', 'orig', { de: 'Messung als eigener Vorgang neben der Schrödinger-Gleichung; der Schnitt zwischen Objekt, Gerät und Beobachter lässt sich beliebig verschieben', en: 'Measurement as a separate process alongside the Schrödinger equation; the cut between object, apparatus and observer can be shifted at will' }, { lang: 'de' }),
      src('H. D. Zeh', 1970, 'On the interpretation of measurement in quantum theory', 'Foundations of Physics 1, 69–76', 'orig', { de: 'Erste Arbeit zur Dekohärenz: Makroskopische Systeme sind nie isoliert', en: 'First paper on decoherence: macroscopic systems are never isolated' }, { doi: '10.1007/BF00708656' }),
      src('W. H. Zurek', 2003, 'Decoherence, einselection, and the quantum origins of the classical', 'Reviews of Modern Physics 75, 715–775', 'orig', { de: 'Übersicht: Dekohärenz, bevorzugte Zustände (Einselektion) und der Übergang zum Klassischen', en: 'Review: decoherence, preferred states (einselection) and the transition to the classical' }, { doi: '10.1103/RevModPhys.75.715' }),
      src('B.-G. Englert', 1996, 'Fringe visibility and which-way information: an inequality', 'Physical Review Letters 77, 2154–2157', 'orig', { de: 'V² + D² ≤ 1 für Sichtbarkeit und Weginformation; bei reinem Gesamtzustand gilt das Gleichheitszeichen', en: 'V² + D² ≤ 1 for visibility and which-path information; for a pure total state the equality holds' }, { doi: '10.1103/PhysRevLett.77.2154' }),
      src('M. Brune et al.', 1996, 'Observing the progressive decoherence of the “meter” in a quantum measurement', 'Physical Review Letters 77, 4887–4890', 'meas', { de: 'Dekohärenz einer Überlagerung von Feldzuständen im Resonator, beobachtet, während sie abläuft', en: 'Decoherence of a superposition of field states in a cavity, observed as it unfolds' }, { doi: '10.1103/PhysRevLett.77.4887' }),
      src('K. Hornberger et al.', 2003, 'Collisional decoherence observed in matter wave interferometry', 'Physical Review Letters 90, 160401', 'meas', { de: 'Fullerene im Interferometer: Die Sichtbarkeit fällt exponentiell mit dem Gasdruck', en: 'Fullerenes in an interferometer: the visibility falls exponentially with the gas pressure' }, { doi: '10.1103/PhysRevLett.90.160401' }),
      src('L. Hackermüller et al.', 2004, 'Decoherence of matter waves by thermal emission of radiation', 'Nature 427, 711–714', 'meas', { de: 'Je heißer die Fullerene, desto mehr Wärmephotonen – die Sichtbarkeit fällt von 47 % auf null', en: 'The hotter the fullerenes, the more thermal photons – the visibility falls from 47 % to zero' }, { doi: '10.1038/nature02276' }),
      src('U. Sinha et al.', 2010, 'Ruling out multi-order interference in quantum mechanics', 'Science 329, 418–421', 'meas', { de: 'Test der Born-Regel mit drei Spalten: keine Interferenz dritter Ordnung, höchstens ein Hundertstel der Interferenz zweier Wege', en: 'Test of the Born rule with three slits: no third-order interference, at most one hundredth of the interference of two paths' }, { doi: '10.1126/science.1190545' }),
      src('Y. Y. Fein et al.', 2019, 'Quantum superposition of molecules beyond 25 kDa', 'Nature Physics 15, 1242–1245', 'meas', { de: 'Interferenz von Molekülen über 25 000 u mit bis zu 2000 Atomen', en: 'Interference of molecules above 25,000 u with up to 2000 atoms' }, { doi: '10.1038/s41567-019-0663-9' }),
      BOSE17,
      MARLETTO17,
    ],
    efe: [
      src('A. Einstein', 1915, 'Die Feldgleichungen der Gravitation', 'Sitzungsberichte der Königlich Preußischen Akademie der Wissenschaften (Berlin), 844–847', 'orig', { de: 'Die Feldgleichungen in ihrer endgültigen Form', en: 'The field equations in their final form' }, { lang: 'de' }),
      src('A. Einstein', 1916, 'Die Grundlage der allgemeinen Relativitätstheorie', 'Annalen der Physik 354, 769–822', 'orig', { de: 'Zusammenfassende Darstellung der Allgemeinen Relativitätstheorie', en: 'Comprehensive presentation of general relativity' }, { doi: '10.1002/andp.19163540702', lang: 'de' }),
      GW150914, EHT,
      PLANCK18,
    ],
    schroedinger: [
      src('E. Schrödinger', 1926, 'Quantisierung als Eigenwertproblem (Erste Mitteilung)', 'Annalen der Physik 384, 361–376', 'orig', { de: 'Stationäre Wellengleichung und Energieniveaus', en: 'Stationary wave equation and energy levels' }, { doi: '10.1002/andp.19263840404', lang: 'de' }),
      src('E. Schrödinger', 1926, 'Quantisierung als Eigenwertproblem (Vierte Mitteilung)', 'Annalen der Physik 386, 109–139', 'orig', { de: 'Die zeitabhängige Schrödinger-Gleichung', en: 'The time-dependent Schrödinger equation' }, { doi: '10.1002/andp.19263861802', lang: 'de' }),
      CODATA,
    ],
    planck: [
      src('M. Planck', 1900, 'Ueber irreversible Strahlungsvorgänge', 'Annalen der Physik 306, 69–122', 'orig', { de: 'Natürliche Maßeinheiten aus Naturkonstanten (zuerst 1899 in den Berliner Sitzungsberichten)', en: 'Natural units built from constants of nature (first published 1899 in the Berlin Sitzungsberichte)' }, { doi: '10.1002/andp.19003060105', lang: 'de' }),
      src('M. Planck', 1901, 'Ueber das Gesetz der Energieverteilung im Normalspectrum', 'Annalen der Physik 309, 553–563', 'orig', { de: 'Strahlungsgesetz; hier führt Planck h und k ein', en: 'The radiation law; this is where Planck introduces h and k' }, { doi: '10.1002/andp.19013090310', lang: 'de' }),
      BOLTZ, BOLTZ_EN, CODATA, SI,
      src('S. Grundmann et al.', 2020, 'Zeptosecond birth time delay in molecular photoionization', 'Science 370, 339–341', 'meas', { de: 'Kürzeste gemessene Zeitspanne: ≈ 247 zs (Skala „Zeit“)', en: 'Shortest time span measured: ≈ 247 zs (“Time” scale)' }, { doi: '10.1126/science.abb9318' }),
      src('C. Deppner et al.', 2021, 'Collective-mode enhanced matter-wave optics', 'Physical Review Letters 127, 100401', 'meas', { de: 'Kälteste Laborwolke: ≈ 38 pK (Skala „Temperatur“)', en: 'Coldest lab cloud: ≈ 38 pK (“Temperature” scale)' }, { doi: '10.1103/PhysRevLett.127.100401' }),
      src('ALICE Collaboration (J. Adam et al.)', 2016, 'Direct photon production in Pb–Pb collisions at √s_NN = 2.76 TeV', 'Physics Letters B 754, 235–248', 'meas', { de: 'Quark-Gluon-Plasma mit T ≈ 304 MeV/k_B ≈ 3,5 × 10¹² K (Skala „Temperatur“)', en: 'Quark–gluon plasma at T ≈ 304 MeV/k_B ≈ 3.5 × 10¹² K (“Temperature” scale)' }, { doi: '10.1016/j.physletb.2016.01.020' }),
      src('D. J. Bird et al.', 1995, 'Detection of a cosmic ray with measured energy well beyond the expected spectral cutoff due to cosmic microwave radiation', 'The Astrophysical Journal 441, 144', 'meas', { de: 'Energiereichstes gemessenes Teilchen: ≈ 3,2 × 10²⁰ eV (Skala „Energie“)', en: 'Most energetic particle measured: ≈ 3.2 × 10²⁰ eV (“Energy” scale)' }, { doi: '10.1086/175344' }),
    ],
  };
  const KIND = I.localize({
    orig: { de: 'Originalarbeit', en: 'Original paper' }, meas: { de: 'Messung', en: 'Measurement' }, ref: { de: 'Referenzwert', en: 'Reference value' },
    trans: { de: 'Übersetzung', en: 'Translation' }, book: { de: 'Nachschlagewerk', en: 'Reference work' },
  });
  // Eigenes Verzeichnis statt am Experiment: Die Originaltitel bleiben in ihrer Sprache
  const byId = Object.create(null);
  for (const id in SOURCES) if (M.byId[id]) byId[id] = I.localize(SOURCES[id].map((s) => Object.assign({}, s)));
  // Quellen zu Abschnitten der Grundlagen (src/ui/theory.js): die Messgrenzen und Vorschläge bei den Anforderungen an eine Quantengravitation
  const THEORY = {
    gap: [
      src('A. A. Abdo et al. (Fermi LAT, Fermi GBM)', 2009, 'A limit on the variation of the speed of light arising from quantum gravity effects', 'Nature 462, 331–334', 'meas',
        { de: 'GRB 090510, Photonen bis ≈ 31 GeV: Eine linear von der Energie abhängige Lichtgeschwindigkeit setzt – wenn überhaupt – erst oberhalb von 1,2 E_P ein', en: 'GRB 090510, photons up to ≈ 31 GeV: a speed of light that depends linearly on energy sets in – if at all – only above 1.2 E_P' }, { doi: '10.1038/nature08574' }),
      src('P. Touboul et al. (MICROSCOPE)', 2022, 'MICROSCOPE mission: final results of the test of the equivalence principle', 'Physical Review Letters 129, 121102', 'meas',
        { de: 'Titan und Platin fallen gleich schnell: η = (−1,5 ± 2,3 ± 1,5) × 10⁻¹⁵', en: 'Titanium and platinum fall equally fast: η = (−1.5 ± 2.3 ± 1.5) × 10⁻¹⁵' }, { doi: '10.1103/PhysRevLett.129.121102' }),
      src('B. P. Abbott et al. (LIGO, Virgo, Fermi GBM, INTEGRAL)', 2017, 'Gravitational waves and gamma-rays from a binary neutron star merger: GW170817 and GRB 170817A', 'The Astrophysical Journal Letters 848, L13', 'meas',
        { de: 'Ankunft im Abstand von 1,74 s: Gravitation und Licht gleich schnell bis auf −3 × 10⁻¹⁵ … +7 × 10⁻¹⁶', en: 'Arrival 1.74 s apart: gravity and light equally fast to within −3 × 10⁻¹⁵ … +7 × 10⁻¹⁶' }, { doi: '10.3847/2041-8213/aa920c' }),
      BOSE17, MARLETTO17,
    ],
  };
  const theory = Object.create(null);
  for (const id in THEORY) theory[id] = I.localize(THEORY[id].map((s) => Object.assign({}, s)));
  PP.sources = { KIND, byId, theory };
})(globalThis.PP = globalThis.PP || {});
