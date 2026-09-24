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
  const HAWK75 = src('S. W. Hawking', 1975, 'Particle creation by black holes', 'Communications in Mathematical Physics 43, 199–220', 'orig',
    { de: 'Ausführliche Herleitung der Hawking-Strahlung und ihrer Temperatur', en: 'Full derivation of Hawking radiation and its temperature' }, { doi: '10.1007/BF02345020' });

  const SOURCES = {
    'newton-gravity': [
      src('I. Newton', 1687, 'Philosophiæ Naturalis Principia Mathematica', 'London: Royal Society', 'orig', { de: 'Das Gravitationsgesetz F ∝ m₁m₂/r²', en: 'The law of gravitation F ∝ m₁m₂/r²' }, { lang: 'la' }),
      src('H. Cavendish', 1798, 'Experiments to determine the density of the Earth', 'Philosophical Transactions of the Royal Society of London 88, 469–526', 'meas',
        { de: 'Erste Messung der Anziehung zwischen Labormassen – daraus folgt G', en: 'First measurement of the attraction between laboratory masses – G follows from it' }, { doi: '10.1098/rstl.1798.0022' }),
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
    efe: [
      src('A. Einstein', 1915, 'Die Feldgleichungen der Gravitation', 'Sitzungsberichte der Königlich Preußischen Akademie der Wissenschaften (Berlin), 844–847', 'orig', { de: 'Die Feldgleichungen in ihrer endgültigen Form', en: 'The field equations in their final form' }, { lang: 'de' }),
      src('A. Einstein', 1916, 'Die Grundlage der allgemeinen Relativitätstheorie', 'Annalen der Physik 354, 769–822', 'orig', { de: 'Zusammenfassende Darstellung der Allgemeinen Relativitätstheorie', en: 'Comprehensive presentation of general relativity' }, { doi: '10.1002/andp.19163540702', lang: 'de' }),
      GW150914, EHT,
      src('Planck Collaboration (N. Aghanim et al.)', 2020, 'Planck 2018 results. VI. Cosmological parameters', 'Astronomy & Astrophysics 641, A6', 'meas', { de: 'Λ, H₀ ≈ 67 km/s/Mpc und kritische Dichte (ΛCDM)', en: 'Λ, H₀ ≈ 67 km/s/Mpc and the critical density (ΛCDM)' }, { doi: '10.1051/0004-6361/201833910' }),
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
  PP.sources = { KIND, byId };
})(globalThis.PP = globalThis.PP || {});
