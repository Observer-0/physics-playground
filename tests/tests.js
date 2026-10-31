/* =====================================================================
   Physics Playground — Test suite (runs in Node and in the browser)
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine, M = PP.model, I = PP.i18n;
  const T = [];
  // Gruppen und Namen werden auf Deutsch geschrieben; die englische Fassung steht in EN.
  // Die Prüfungen selbst laufen immer auf Deutsch (siehe runAll), weil sie Meldungstexte vergleichen.
  const EN = {
    'Gravitation': 'Gravity', 'Numerik': 'Numerics', 'Einheiten': 'Units', 'Dimensionsanalyse': 'Dimensional analysis', 'Referenzwerte': 'Reference values',
    'Parser': 'Parser', 'Formatierung': 'Formatting', 'Sprache': 'Language', 'UI (im Browser)': 'UI (in the browser)', 'Visualisierung': 'Visualisation', 'Aufgaben': 'Tasks',
    'G=6.67430e-11, m₁=m₂=r=1 → F ≈ 6.67430e-11 N': 'G=6.67430e-11, m₁=m₂=r=1 → F ≈ 6.67430e-11 N',
    'Abstand ×2 → Kraft /4': 'Distance ×2 → force /4',
    'Erde–Apfel liefert ≈ 0,98 N': 'Earth–apple gives ≈ 0.98 N',
    'Division durch 0 (r = 0) → kein Absturz, Kategorie „math“': 'Division by 0 (r = 0) → no crash, category “math”',
    'Veränderte Konstante G wird als „unrealistisch“ erkannt': 'A changed constant G is flagged as “unrealistic”',
    'Schwarze Löcher bei 350 km → „außerhalb des Modells“': 'Black holes at 350 km → “outside the model”',
    'NaN-Eingabe → sauber gemeldet, kein NaN-Ergebnis als Zahl': 'NaN input → reported cleanly, no NaN result shown as a number',
    'Unsicherheit aus G ≈ 2,2 × 10⁻⁵ relativ': 'Uncertainty from G ≈ 2.2 × 10⁻⁵ relative',
    'Overflow: m₁ = m₂ = 10³⁰⁰ kg, r = 10⁻³⁰⁰ m → log-Auswertung': 'Overflow: m₁ = m₂ = 10³⁰⁰ kg, r = 10⁻³⁰⁰ m → log evaluation',
    'Underflow: 10⁻³⁰⁰ · 10⁻³⁰⁰ bleibt als 10⁻⁶⁰⁰ erhalten': 'Underflow: 10⁻³⁰⁰ · 10⁻³⁰⁰ is kept as 10⁻⁶⁰⁰',
    'Log-Addition großer Zahlen: 10³⁰⁸·10 + 10³⁰⁸·10': 'Log addition of large numbers: 10³⁰⁸·10 + 10³⁰⁸·10',
    'Wurzel aus negativer Zahl → math-Issue statt NaN': 'Square root of a negative number → math issue instead of NaN',
    'β = 1 → γ undefiniert, β = 1,2 → imaginär, beides ohne Absturz': 'β = 1 → γ undefined, β = 1.2 → imaginary, neither crashes',
    'E_kin bei β = 10⁻⁹ stabil (naiv wäre 0)': 'E_kin stable at β = 10⁻⁹ (naively it would be 0)',
    'LHC-Proton: γ ≈ 7247': 'LHC proton: γ ≈ 7247',
    '[G] = m³ kg⁻¹ s⁻²': '[G] = m³ kg⁻¹ s⁻²',
    '[G][m][m]/[r]² = N': '[G][m][m]/[r]² = N',
    'Unicode-Eingabe: ħc³/(8πGMk_B) wird geparst': 'Unicode input: ħc³/(8πGMk_B) is parsed',
    'Hawking-Temperatur hat die Dimension Θ': 'The Hawking temperature has dimension Θ',
    'S_BH hat die Dimension einer Entropie, S/k_B ist dimensionslos': 'S_BH has the dimension of an entropy, S/k_B is dimensionless',
    'Feldgleichungen: beide Seiten L⁻²': 'Field equations: both sides L⁻²',
    'Schrödinger: alle Terme Energie × [ψ], [ψ] = L⁻¹ᐟ²': 'Schrödinger: all terms energy × [ψ], [ψ] = L⁻¹ᐟ²',
    'Planck-Einheiten: L, T, M, Θ': 'Planck units: L, T, M, Θ',
    'Alle Ausgabeformeln aller Experimente sind dimensionskonsistent': 'Every output formula of every experiment is dimensionally consistent',
    'X = G M / c mit [X] = L ist inkonsistent (rechts L² T⁻¹)': 'X = G M / c with [X] = L is inconsistent (right-hand side L² T⁻¹)',
    'Summe inkompatibler Dimensionen wird lokalisiert': 'A sum of incompatible dimensions is located',
    'E = ½mc² ist konsistent – obwohl physikalisch falsch für die Ruheenergie': 'E = ½mc² is consistent – although physically wrong for the rest energy',
    'Exponent mit Dimension wird abgelehnt': 'An exponent with a dimension is rejected',
    'exp(Länge) wird abgelehnt': 'exp(length) is rejected',
    'Planck-Länge ≈ 1,61626 × 10⁻³⁵ m (CODATA: 1,616255(18))': 'Planck length ≈ 1.61626 × 10⁻³⁵ m (CODATA: 1.616255(18))',
    'Planck-Masse ≈ 2,176434 × 10⁻⁸ kg': 'Planck mass ≈ 2.176434 × 10⁻⁸ kg',
    'Planck-Temperatur ≈ 1,416784 × 10³² K': 'Planck temperature ≈ 1.416784 × 10³² K',
    'Hawking-Temperatur einer Sonnenmasse ≈ 6,17 × 10⁻⁸ K': 'Hawking temperature of one solar mass ≈ 6.17 × 10⁻⁸ K',
    'S/k_B einer Sonnenmasse ≈ 1,05 × 10⁷⁷': 'S/k_B of one solar mass ≈ 1.05 × 10⁷⁷',
    'Schwarzschild-Radius der Sonne ≈ 2953 m': 'Schwarzschild radius of the Sun ≈ 2953 m',
    'Beide Entropie-Formen stimmen überein': 'Both forms of the entropy agree',
    'Einstein-Kopplung 8πG/c⁴ ≈ 2,077 × 10⁻⁴³': 'Einstein coupling 8πG/c⁴ ≈ 2.077 × 10⁻⁴³',
    'Elektron im 1-nm-Kasten: E₁ ≈ 0,376 eV': 'Electron in a 1 nm box: E₁ ≈ 0.376 eV',
    'Freier Fall 100 m: t ≈ 4,52 s': 'Free fall 100 m: t ≈ 4.52 s',
    'Feder k=50, m=1: T = 2π/√50': 'Spring k=50, m=1: T = 2π/√50',
    'Kinematik: s = 0 + 5·3 + ½·2·9 = 24 m': 'Kinematics: s = 0 + 5·3 + ½·2·9 = 24 m',
    'ISS: a ≈ 8,6 m/s²': 'ISS: a ≈ 8.6 m/s²',
    'Punkt vor Strich, rechtsassoziative Potenz, unäres Minus': 'Operator precedence, right-associative powers, unary minus',
    'Syntaxfehler liefert Position': 'A syntax error reports its position',
    'Rationale Exponenten: sqrt(L) → L¹ᐟ²': 'Rational exponents: sqrt(L) → L¹ᐟ²',
    'Funktionen verlangen genau ein Argument: sqrt(4, 5) ist ein Syntaxfehler': 'Functions take exactly one argument: sqrt(4, 5) is a syntax error',
    'Namen wie constructor/toString sind unbekannt, __proto__ wird abgelehnt': 'Names like constructor/toString are unknown, __proto__ is rejected',
    '„ħc / G M“ wird als mehrdeutig gemeldet, „1/2 m v²“ und „a/(b c)“ nicht': '“ħc / G M” is flagged as ambiguous, “1/2 m v²” and “a/(b c)” are not',
    'Positionszuordnung nach normalize: ħ und ³ zeigen auf die Originalzeichen': 'Position mapping after normalize: ħ and ³ point to the original characters',
    '0⁰ → eigene Meldung, keine „Division durch 0“': '0⁰ → its own message, not “division by 0”',
    'exp(10⁴⁰⁰) und cos(10⁴⁰⁰) → math-Issue statt „NaN × 10^Infinity“': 'exp(10⁴⁰⁰) and cos(10⁴⁰⁰) → math issue instead of “NaN × 10^Infinity”',
    'Dimensionsangabe mit Nenner 0 (L^1/0) wird abgelehnt': 'A dimension with denominator 0 (L^1/0) is rejected',
    '6.6743e-11 → „6.6743 × 10⁻¹¹“': '6.6743e-11 → “6.6743 × 10⁻¹¹”',
    'Eigene Gleichung: Hawking-Formel mit π und ħ ist konsistent, X = GM/c nicht': 'Own equation: the Hawking formula with π and ħ is consistent, X = GM/c is not',
    'E = m g h: h zuerst Planck-Konstante mit Hinweis, als Höhe konsistent': 'E = m g h: h is first the Planck constant with a hint, consistent as a height',
    'Eigene Gleichung: „constructor“ und „toString“ lassen die Ansicht nicht abstürzen': 'Own equation: “constructor” and “toString” do not crash the view',
    'Eigene Gleichung: Klammer-Vorschlag bei „ħ c / G M“ behält ħ und ³ bei': 'Own equation: the bracket suggestion for “ħ c / G M” keeps ħ and ³',
    'URL mit #exp=constructor oder #view=toString wird ignoriert': 'A URL with #exp=constructor or #view=toString is ignored',
    'Wirkungs-Demo: geschlossene Form ΔS = mπ²/(4T)·(ε₁² + 4ε₂²) stimmt mit der Integration überein': 'Action demo: the closed form ΔS = mπ²/(4T)·(ε₁² + 4ε₂²) agrees with the integration',
    'Alle Visualisierungen zeichnen Standardwerte und Presets ohne Fehler und ohne „NaN“': 'All visualisations draw default values and presets without errors and without “NaN”',
    'β = 1: Die Visualisierung zeigt γ als nicht definiert statt einer Zahl': 'β = 1: the visualisation shows γ as undefined instead of a number',
    'Schwarzes Loch: r_s, A, S_BH und T_H im Bild stammen aus der Engine, Exponenten 1, 2, 2, −1': 'Black hole: r_s, A, S_BH and T_H in the picture come from the engine, exponents 1, 2, 2, −1',
    'Gravitation: Die Faktoren im Bild zeigen F ∝ m₁m₂/r² (m₁ ×2, r ×½ → F ×8)': 'Gravity: the factors in the picture show F ∝ m₁m₂/r² (m₁ ×2, r ×½ → F ×8)',
    'Feldgleichungen: Das Bild ist als schematische Projektion gekennzeichnet': 'Field equations: the picture is labelled as a schematic projection',
    'Schrödinger: Ein nicht ganzzahliges n wird nicht als Welle gezeichnet': 'Schrödinger: a non-integer n is not drawn as a wave',
    'Planck-Einheiten: Jede Skala zeigt den Wert aus der Engine (l_P, t_P, m_P, T_P, E_P)': 'Planck units: every scale shows the value from the engine (l_P, t_P, m_P, T_P, E_P)',
    'Planck-Temperatur: k_B im Bild ist E_P / T_P = 1,380649 × 10⁻²³ J/K, mit zweiter Achse in eV': 'Planck temperature: k_B in the picture is E_P / T_P = 1.380649 × 10⁻²³ J/K, with a second axis in eV',
    'Elliptisches Integral: K(0) = π/2, K(1/√2) ≈ 1,8540746773, K(0,5) ≈ 1,6857503548': 'Elliptic integral: K(0) = π/2, K(1/√2) ≈ 1.8540746773, K(0.5) ≈ 1.6857503548',
    'Elliptisches Integral: k = 1 divergiert, |k| > 1 ist nicht reell – beides als math-Issue': 'Elliptic integral: k = 1 diverges, |k| > 1 is not real – both reported as math issues',
    'ellipk(Länge) wird abgelehnt': 'ellipk(length) is rejected',
    'Fadenpendel: T/T₀ bei 90° ≈ 1,1803406': 'Pendulum: T/T₀ at 90° ≈ 1.1803406',
    'Ideales Gas: 1 mol bei 273,15 K in 22,414 l → 101,325 kPa': 'Ideal gas: 1 mol at 273.15 K in 22.414 l → 101.325 kPa',
    'Schiefer Wurf: 30° und 60° fliegen gleich weit, 45° am weitesten': 'Projectile: 30° and 60° fly equally far, 45° furthest',
    'Quellen: jedes Experiment hat Quellen, DOIs sind gültig geformt, englische Notizen ohne deutsche Reste': 'Sources: every experiment has sources, DOIs are well-formed, English notes contain no German',
    'Jede „Probier mal“-Aufgabe ist ein Auftrag ohne Fragesatz, mit den Reglern lösbar und am Anfang noch offen': 'Every “Try this” task is an instruction without a question, can be solved with the sliders and is still open at the start',
    'Engine-Meldungen und Dimensionsnamen gibt es auf Deutsch und Englisch': 'Engine messages and dimension names exist in German and English',
    'Umschalten wirkt auch auf die kompilierten Kopien der Experimente': 'Switching also affects the compiled copies of the experiments',
    'Keine deutschen Reste in den englischen Texten der Experimente und Konstanten': 'No German left in the English texts of the experiments and constants',
    'Jeder Test hat einen englischen Namen': 'Every test has an English name',
    'Keine deutschen Reste in den englischen Beschriftungen der Visualisierungen': 'No German left in the English labels of the visualisations',
    'Hawking-Temperatur': 'Hawking temperature',
    'Offene Fragen': 'Open questions',
    'min und max: richtig auch für negative Zahlen, null und Werte jenseits von 10³⁰⁸; nur Größen derselben Dimension': 'min and max: correct for negative numbers, zero and values beyond 10³⁰⁸; only quantities of the same dimension',
    'Page-Kurve: Page-Zeit 1 − 2^(−3/2) mit Maximum S₀/2; für β ≈ 1,4847 Pages 53,81 % und 59,75 %; null am Anfang und am Ende': 'Page curve: Page time 1 − 2^(−3/2) with maximum S₀/2; for β ≈ 1.4847 Page’s 53.81 % and 59.75 %; zero at the start and the end',
    'Verdampfung: t_evap und S₀ wie bei Hawking-Temperatur und BH-Entropie, T_H wächst wie (1 − τ)^(−1/3), bei τ = 1 ist T_H undefiniert': 'Evaporation: t_evap and S₀ as for the Hawking temperature and BH entropy, T_H grows like (1 − τ)^(−1/3), at τ = 1 T_H is undefined',
    'Jacobi-Funktion: sn(K) = 1, sn(K/2) = 1/√(1 + k′), sn(3K) = −1, k = 0 → sin, k = 1 → tanh': 'Jacobi function: sn(K) = 1, sn(K/2) = 1/√(1 + k′), sn(3K) = −1, k = 0 → sin, k = 1 → tanh',
    'sn braucht genau zwei Argumente, beide dimensionslos; arcsin außerhalb von [−1, 1] und |k| > 1 sind math-Issues': 'sn takes exactly two arguments, both dimensionless; arcsin outside [−1, 1] and |k| > 1 are math issues',
    'Fadenpendel: θ(t) aus Jacobi-sn stimmt mit einer numerischen Integration (RK4) auf 10⁻⁷ Grad überein – bei 10°, 90° und 170°': 'Pendulum: θ(t) from Jacobi sn agrees with a numerical integration (RK4) to 10⁻⁷ degrees – at 10°, 90° and 170°',
    'Fadenpendel: θ(0) = θ₀, θ(T/4) = 0, θ(T/2) = −θ₀, θ(T) = θ₀; bei 2° weicht die Näherung höchstens 0,001° ab, bei 170° um mehr als 100°': 'Pendulum: θ(0) = θ₀, θ(T/4) = 0, θ(T/2) = −θ₀, θ(T) = θ₀; at 2° the approximation is off by at most 0.001°, at 170° by more than 100°',
    'Fadenpendel: Das Bild zeigt in „Bewegung θ(t)“ t, θ und θₐ aus der Engine, in „Periodendauer“ den Zeitmaßstab': 'Pendulum: in “Motion θ(t)” the picture shows t, θ and θₐ from the engine, in “Period” the time scale',
    'Pendeln um einen festen Wert (sweep.center) bleibt im Regler-Bereich': 'Oscillating around a fixed value (sweep.center) stays within the slider range',
    'Warum 1/4: R_η = 4η bei jeder Masse, nur η = 1/4 erfüllt den ersten Hauptsatz, S_η(1/4) = S_BH, R ohne Messunsicherheit': 'Why 1/4: R_η = 4η for every mass, only η = 1/4 satisfies the first law, S_η(1/4) = S_BH, R without measurement uncertainty',
    'Kosmologische Konstante: bei der Planck-Energie u_vac/u_Λ zwischen 10¹²⁰ und 10¹²⁴ und gleich 8π/(Λ l_P²), bei der Energieskala von Λ gleich 1; u_vac ∝ E_c⁴; Verhältnisse dimensionslos': 'Cosmological constant: at the Planck energy u_vac/u_Λ lies between 10¹²⁰ and 10¹²⁴ and equals 8π/(Λ l_P²), at the energy scale of Λ it is 1; u_vac ∝ E_c⁴; ratios are dimensionless',
    'Kosmologische Konstante: ℓ_Λ = 1/√Λ ≈ 10¹⁰ Lichtjahre, Λ l_P² ≈ 2,9 × 10⁻¹²², lg(ℓ_Λ/l_P) = −lg(Λ l_P²)/2; ħc/E_Λ ist bis auf (8π)^¼ das geometrische Mittel von l_P und ℓ_Λ; die Zahlen der Seite stimmen mit der Engine': 'Cosmological constant: ℓ_Λ = 1/√Λ ≈ 10¹⁰ light years, Λ l_P² ≈ 2.9 × 10⁻¹²², lg(ℓ_Λ/l_P) = −lg(Λ l_P²)/2; up to (8π)^¼, ħc/E_Λ is the geometric mean of l_P and ℓ_Λ; the numbers on the page agree with the engine',
    'Kosmologische Konstante: über der Planck-Energie „außerhalb des Modells“, ein verändertes Λ weicht vom „beobachteten“ Wert ab; alle drei Ansichten zeigen Werte aus der Engine': 'Cosmological constant: above the Planck energy “outside the model”, a changed Λ differs from the “observed” value; all three views show values from the engine',
    'Λ-Horizont: S_dS = 3π k_B/(Λ l_P²) ≈ 3,3 × 10¹²² k_B, T_dS ≈ 2,2 × 10⁻³⁰ K; Schwarze Löcher erreichen die Bekenstein-Schranke 2πk_B ER/(ħc); beide Horizonte folgen S = k_B πr²/l_P²': 'Λ horizon: S_dS = 3π k_B/(Λ l_P²) ≈ 3.3 × 10¹²² k_B, T_dS ≈ 2.2 × 10⁻³⁰ K; black holes attain the Bekenstein bound 2πk_B ER/(ħc); both horizons follow S = k_B πr²/l_P²',
    'Dekohärenz: V = 2√(p₁p₂)·e^(−N(1−γ)) ist die Poisson-Summe Σ Pois(k; N)·γ^k; V² + D² = 1 und Tr ρ² = 1 − 2p₁p₂(1 − |⟨E₁|E₂⟩|²) bei allen Einstellungen': 'Decoherence: V = 2√(p₁p₂)·e^(−N(1−γ)) is the Poisson sum Σ Pois(k; N)·γ^k; V² + D² = 1 and Tr ρ² = 1 − 2p₁p₂(1 − |⟨E₁|E₂⟩|²) for all settings',
    'Dekohärenz: Presets V = 1, e⁻², e⁻¹⁰ und 0,6 mit P = D = 0,8; I(x) hat bei V = 1 Nullstellen; p₁ oder γ außerhalb von 0 bis 1 und N < 0 sind „unreal“': 'Decoherence: presets V = 1, e⁻², e⁻¹⁰ and 0.6 with P = D = 0.8; I(x) has zeros at V = 1; p₁ or γ outside 0 to 1 and N < 0 are “unreal”',
    'Dekohärenz: Schirm und Wegzustand zeigen V, D und die Matrixeinträge aus der Engine; ein Treffer bleibt liegen, wenn neue dazukommen': 'Decoherence: screen and path state show V, D and the matrix entries from the engine; a hit stays put when new ones arrive',
    'Keine Kandidaten für eine Quantengravitation – weder im Experiment noch in seinen Quellen noch auf den Seiten': 'No quantum-gravity candidates – not in the experiment, its sources or the pages',
    'Offene Fragen: jede Frage hat Status, Kurztitel, eine Einleitung, die vier Abschnitte, keine Fragesätze im Text und ein Experiment im Feld „open“; der Direktlink #view=offen&sec=… bleibt im Zustand': 'Open questions: every question has a status, a short title, an introduction, the four sections, no questions in the text and an experiment in the “open” field; the direct link #view=offen&sec=… stays in the state',
    'Graph': 'Graph',
    'Grundlagen: jeder Abschnitt hat Kurztitel und Kurzbeschreibung, der Direktlink #view=theorie&sec=… bleibt im Zustand': 'Foundations: every section has a short title and a one-line summary, the direct link #view=theorie&sec=… stays in the state',
    'Schraffur je Größe: „nach der Landung“ betrifft y(t) und x(t), aber nicht R und H': 'Hatching per quantity: “after landing” affects y(t) and x(t), but not R and H',
    'Schraffur je Größe: Die Kleinwinkelnäherung betrifft T₀, nicht die exakte Periodendauer T': 'Hatching per quantity: the small-angle approximation affects T₀, not the exact period T',
    'Jede Modellgrenze aus einem Check hat einen kurzen Grund, auf Englisch ohne deutsche Reste': 'Every model limit from a check has a short reason, in English without German',
    'Standardbereich: verweist auf vorhandene Ausgaben und liegt im Regler-Bereich; freier Fall endet kurz nach dem Aufprall': 'Default range: refers to existing outputs and lies within the slider range; free fall ends shortly after impact',
    'Formelsatz: tfrac12 ist der Bruch ½, frac{12}{3} bleibt zweistellig, circ und ddot werden gesetzt, {,} ist ein Dezimalkomma ohne Abstand': 'Typesetting: tfrac12 is the fraction ½, frac{12}{3} keeps two digits, circ and ddot are typeset, {,} is a decimal comma without a gap',
    'Drei Wege, ein Wert: ħc³/(8πGMk_B) = ħκ/(2πck_B) = T_P·m_P/(8πM), κ = c⁴/(4GM)': 'Three routes, one value: ħc³/(8πGMk_B) = ħκ/(2πck_B) = T_P·m_P/(8πM), κ = c⁴/(4GM)',
    'Grenzfälle im Break-Modus: G → 0 „außerhalb des Modells“, G = 0 undefiniert, ħ = 0 ergibt T_H = 0, k_B·T_H bleibt bei k_B ÷ 1000': 'Limits in Break mode: G → 0 “outside the model”, G = 0 undefined, ħ = 0 gives T_H = 0, k_B·T_H is unchanged for k_B ÷ 1000',
    'Schnittpunkt-Block: Symbole, Kette, Aha-Kasten und Wörterbuch verweisen nur auf vorhandene Engine-Größen': 'Crossroads block: symbols, chain, aha box and dictionary only refer to existing engine quantities',
    'Schwarzes Loch: G = 0, ħ = 0, k_B = 0 und c × 10¹² zeichnen ohne „NaN“': 'Black hole: G = 0, ħ = 0, k_B = 0 and c × 10¹² draw without “NaN”',
    'Interaktive Gleichungen': 'Interactive equations',
    'Jede Gleichung ist interaktiv und ohne Marker gesetzt genau ihre Formel exp.tex': 'Every equation is interactive and, typeset without markers, is exactly its formula exp.tex',
    'Jedes Symbol: eine Quelle, Farbe, Kurzlabel, Rolle und Bedeutung auf Deutsch und Englisch, je höchstens drei Sätze; Werte nur aus PP.model.C': 'Every symbol: one source, colour, short label, role and meaning in German and English, at most three sentences each; values only from PP.model.C',
    'Interaktive Gleichung: Zeigen und Klick wählen ein Symbol samt Karte, × und Esc schließen sie': 'Interactive equation: pointing and clicking select a symbol and its card, × and Esc close it',
    'Grundlagen: Zu jedem Marker einer Kerngleichung gibt es ein Symbol und umgekehrt, auf Deutsch und Englisch': 'Foundations: every marker of a core equation has a symbol and vice versa, in German and English',
    'Grundlagen: Jede Kerngleichung steht in einem Abschnitt, jedes ihrer Symbole ist ein Knopf': 'Foundations: every core equation appears in a section, and each of its symbols is a button',
    'Grundlagen: Klick öffnet die schwebende Karte, × schließt sie, beim Abbau verschwindet sie': 'Foundations: a click opens the floating card, × closes it, and teardown removes it',
  };
  const pair = (de) => (Object.prototype.hasOwnProperty.call(EN, de) ? { de, en: EN[de] } : de);
  const test = (group, name, fn) => T.push(I.localize({ group: pair(group), name: pair(name), fn }));

  function close(a, b, rel = 1e-9, msg = '') {
    if (!(Math.abs(a - b) <= rel * Math.abs(b))) throw new Error(`${msg} erwartet ≈ ${b}, erhalten ${a}`);
  }
  function ok(c, msg) { if (!c) throw new Error(msg || 'Bedingung nicht erfüllt'); }
  const run = (id, vals, form) => {
    const exp = M.byId[id];
    const v = Object.assign(M.defaults(exp), vals || {});
    return M.compute(exp, form || exp.forms[0].id, v);
  };
  const val = (r, k) => E.toDouble(r.out[k]);
  const D = E.dimParse;
  const symDims = () => { const s = {}; for (const k in M.C) s[k] = M.C[k].dimv; return s; };

  /* --- Newton gravity --- */
  test('Gravitation', 'G=6.67430e-11, m₁=m₂=r=1 → F ≈ 6.67430e-11 N', () => {
    const r = run('newton-gravity', { m1: 1, m2: 1, r: 1 });
    close(val(r, 'F'), 6.67430e-11, 1e-12);
  });
  test('Gravitation', 'Abstand ×2 → Kraft /4', () => {
    const a = val(run('newton-gravity', { r: 3 }), 'F'), b = val(run('newton-gravity', { r: 6 }), 'F');
    close(a / b, 4, 1e-12);
  });
  test('Gravitation', 'Erde–Apfel liefert ≈ 0,98 N', () => {
    const r = run('newton-gravity', M.byId['newton-gravity'].presets[1].values);
    close(val(r, 'F'), 0.982, 0.01);
  });
  test('Gravitation', 'Division durch 0 (r = 0) → kein Absturz, Kategorie „math“', () => {
    const r = run('newton-gravity', { r: 0 });
    ok(!r.out.F.ok, 'F sollte als undefiniert markiert sein');
    ok(r.issues.some((i) => i.cat === 'math' && /Division durch 0/.test(i.msg)), 'math-Issue fehlt');
  });
  test('Gravitation', 'Veränderte Konstante G wird als „unrealistisch“ erkannt', () => {
    const r = run('newton-gravity', { G: 6.6743e-5 });
    ok(r.issues.some((i) => i.cat === 'unreal'), 'unreal-Issue fehlt');
  });
  test('Gravitation', 'Schwarze Löcher bei 350 km → „außerhalb des Modells“', () => {
    const exp = M.byId['newton-gravity'];
    const r = run('newton-gravity', exp.presets.find((p) => /Schwarze/.test(p.name)).values);
    ok(r.issues.some((i) => i.cat === 'model'), 'model-Issue fehlt');
  });
  test('Gravitation', 'NaN-Eingabe → sauber gemeldet, kein NaN-Ergebnis als Zahl', () => {
    const r = run('newton-gravity', { m1: NaN });
    ok(!r.out.F.ok, 'F sollte ungültig sein');
    ok(r.issues.some((i) => i.cat === 'math'), 'math-Issue fehlt');
    ok(E.fmt(r.out.F) === '—', 'Formatierung sollte „—“ liefern');
  });
  test('Gravitation', 'Unsicherheit aus G ≈ 2,2 × 10⁻⁵ relativ', () => {
    const exp = M.byId['newton-gravity'];
    const u = M.uncertainty(exp, 'main', M.defaults(exp), 'F');
    close(u.rel, 0.00015 / 6.6743, 1e-3);
  });

  /* --- Extreme magnitudes --- */
  test('Numerik', 'Overflow: m₁ = m₂ = 10³⁰⁰ kg, r = 10⁻³⁰⁰ m → log-Auswertung', () => {
    const r = run('newton-gravity', { m1: 1e300, m2: 1e300, r: 1e-300 });
    ok(r.out.F.ok, 'F sollte berechenbar sein');
    close(r.out.F.l, Math.log10(6.6743e-11) + 1200, 1e-12);
    ok(r.issues.some((i) => i.cat === 'numeric'), 'numeric-Issue fehlt');
    ok(/10¹¹⁸⁹/.test(E.fmt(r.out.F)), 'Formatierung: ' + E.fmt(r.out.F));
  });
  test('Numerik', 'Underflow: 10⁻³⁰⁰ · 10⁻³⁰⁰ bleibt als 10⁻⁶⁰⁰ erhalten', () => {
    const x = E.evaluate(E.parse('a*b'), { a: 1e-300, b: 1e-300 });
    ok(x.ok && x.s === 1, 'sollte positiv sein');
    close(x.l, -600, 1e-12);
  });
  test('Numerik', 'Log-Addition großer Zahlen: 10³⁰⁸·10 + 10³⁰⁸·10', () => {
    const x = E.evaluate(E.parse('a*10 + a*10'), { a: 1e308 });
    close(x.l, 309 + Math.log10(2), 1e-12);
  });
  test('Numerik', 'Wurzel aus negativer Zahl → math-Issue statt NaN', () => {
    const x = E.evaluate(E.parse('sqrt(a)'), { a: -1 });
    ok(!x.ok && x.issues[0].cat === 'math');
  });
  test('Numerik', 'β = 1 → γ undefiniert, β = 1,2 → imaginär, beides ohne Absturz', () => {
    const a = run('special-rel', { beta: 1 }), b = run('special-rel', { beta: 1.2 });
    ok(!a.out.gamma.ok && !b.out.gamma.ok);
    ok(a.issues.some((i) => i.cat === 'math') && b.issues.some((i) => i.cat === 'math'));
  });
  test('Numerik', 'E_kin bei β = 10⁻⁹ stabil (naiv wäre 0)', () => {
    const r = run('special-rel', { beta: 1e-9, m: 1 });
    close(val(r, 'Ek'), 0.5 * 1 * (1e-9 * 299792458) ** 2, 1e-9);
  });
  test('Numerik', 'LHC-Proton: γ ≈ 7247', () => {
    const exp = M.byId['special-rel'];
    const r = run('special-rel', exp.presets.find((p) => /LHC/.test(p.name)).values);
    close(val(r, 'gamma'), 7247.4, 1e-6);
  });

  /* --- Units & dimensions --- */
  test('Einheiten', '[G] = m³ kg⁻¹ s⁻²', () => {
    ok(E.siUnitStr(M.C.G.dimv) === 'm³ kg⁻¹ s⁻²', E.siUnitStr(M.C.G.dimv));
  });
  test('Einheiten', '[G][m][m]/[r]² = N', () => {
    const d = E.dimAnalyze(E.parse('G*m1*m2/r^2'), Object.assign(symDims(), { m1: D('M'), m2: D('M'), r: D('L') }));
    ok(d.ok && E.dimInfo(d.dim).unit === 'N', E.dimInfo(d.dim).unit);
  });
  test('Einheiten', 'Unicode-Eingabe: ħc³/(8πGMk_B) wird geparst', () => {
    const ast = E.parse('ħ·c³/(8π G M k_B)');
    const d = E.dimAnalyze(ast, Object.assign(symDims(), { M: D('M') }));
    ok(d.ok && E.dimEq(d.dim, D('Θ')), E.dimStr(d.dim));
  });
  test('Dimensionsanalyse', 'Hawking-Temperatur hat die Dimension Θ', () => {
    const exp = M.byId.hawking, f = exp.forms[0];
    const q = f.c.equations[0];
    const res = E.checkEquation(q, f.c.symDims);
    ok(res.consistent && E.dimEq(res.rhs.dim, D('Θ')), E.dimStr(res.rhs.dim));
  });
  test('Dimensionsanalyse', 'S_BH hat die Dimension einer Entropie, S/k_B ist dimensionslos', () => {
    const f = M.byId['bh-entropy'].forms[0];
    for (const q of f.c.equations) ok(E.checkEquation(q, f.c.symDims).consistent, q.label);
    const d = E.dimAnalyze(E.parse('k_B*c^3*A/(4*G*hbar)'), Object.assign(symDims(), { A: D('L^2') }));
    ok(E.dimEq(d.dim, D('M L^2 T^-2 Θ^-1')));
  });
  test('Dimensionsanalyse', 'Feldgleichungen: beide Seiten L⁻²', () => {
    const f = M.byId.efe.forms[0];
    const res = E.checkEquation(f.c.equations[0], f.c.symDims);
    ok(res.consistent, 'inkonsistent');
    ok(E.dimEq(res.rhs.dim, D('L^-2')), E.dimStr(res.rhs.dim));
  });
  test('Dimensionsanalyse', 'Schrödinger: alle Terme Energie × [ψ], [ψ] = L⁻¹ᐟ²', () => {
    const f = M.byId.schroedinger.forms[0];
    for (const q of f.c.equations) ok(E.checkEquation(q, f.c.symDims).consistent, q.label);
    const res = E.checkEquation(f.c.equations[0], f.c.symDims);
    ok(E.dimEq(res.rhs.dim, D('M L^2 T^-2 L^-1/2')), E.dimStr(res.rhs.dim));
  });
  test('Dimensionsanalyse', 'Planck-Einheiten: L, T, M, Θ', () => {
    const f = M.byId.planck.forms[0];
    for (const q of f.c.equations) ok(E.checkEquation(q, f.c.symDims).consistent, q.label);
  });
  test('Dimensionsanalyse', 'Alle Ausgabeformeln aller Experimente sind dimensionskonsistent', () => {
    for (const exp of M.registry) for (const f of exp.forms) {
      for (const q of f.c.autoEq) {
        const r = E.checkEquation(q, f.c.symDims);
        ok(r.consistent, exp.id + '/' + q.label + ': ' + (r.mismatch ? E.dimStr(r.mismatch.left) + ' ≠ ' + E.dimStr(r.mismatch.right) : r.rhs.errors.map((e) => e.msg).join('; ')));
      }
      for (const q of f.c.equations) ok(E.checkEquation(q, f.c.symDims).consistent, exp.id + '/' + q.label);
    }
  });
  test('Dimensionsanalyse', 'X = G M / c mit [X] = L ist inkonsistent (rechts L² T⁻¹)', () => {
    const q = E.parseEquation('X = G M / c');
    const res = E.checkEquation(q, Object.assign(symDims(), { X: D('L'), M: D('M') }));
    ok(!res.consistent && res.mismatch, 'sollte inkonsistent sein');
    ok(E.dimEq(res.mismatch.right, D('L^2 T^-1')), E.dimStr(res.mismatch.right));
  });
  test('Dimensionsanalyse', 'Summe inkompatibler Dimensionen wird lokalisiert', () => {
    const q = E.parseEquation('v = G*M + c');
    const res = E.checkEquation(q, Object.assign(symDims(), { v: D('L T^-1'), M: D('M') }));
    const err = res.rhs.errors[0];
    ok(err && err.kind === 'sum', 'Summenfehler fehlt');
    ok(q.src.slice(err.node.span[0], err.node.span[1]).trim() === 'G*M + c', 'Span: ' + q.src.slice(err.node.span[0], err.node.span[1]));
  });
  test('Dimensionsanalyse', 'E = ½mc² ist konsistent – obwohl physikalisch falsch für die Ruheenergie', () => {
    const q = E.parseEquation('E = 0.5*m*c^2');
    ok(E.checkEquation(q, Object.assign(symDims(), { E: D('M L^2 T^-2'), m: D('M') })).consistent);
  });
  test('Dimensionsanalyse', 'Exponent mit Dimension wird abgelehnt', () => {
    const d = E.dimAnalyze(E.parse('x^t'), { x: D('L'), t: D('T') });
    ok(!d.ok);
  });
  test('Dimensionsanalyse', 'exp(Länge) wird abgelehnt', () => {
    const d = E.dimAnalyze(E.parse('exp(x)'), { x: D('L') });
    ok(!d.ok);
  });

  /* --- Reference values --- */
  test('Referenzwerte', 'Planck-Länge ≈ 1,61626 × 10⁻³⁵ m (CODATA: 1,616255(18))', () => {
    close(val(run('planck'), 'lP'), 1.616255e-35, 2e-6);
  });
  test('Referenzwerte', 'Planck-Masse ≈ 2,176434 × 10⁻⁸ kg', () => {
    close(val(run('planck'), 'mP'), 2.176434e-8, 2e-6);
  });
  test('Referenzwerte', 'Planck-Temperatur ≈ 1,416784 × 10³² K', () => {
    close(val(run('planck'), 'TP'), 1.416784e32, 2e-6);
  });
  test('Referenzwerte', 'Hawking-Temperatur einer Sonnenmasse ≈ 6,17 × 10⁻⁸ K', () => {
    close(val(run('hawking', { M: M.C.M_sun.value }), 'TH'), 6.17e-8, 2e-3);
  });
  test('Referenzwerte', 'S/k_B einer Sonnenmasse ≈ 1,05 × 10⁷⁷', () => {
    close(val(run('bh-entropy', { M: M.C.M_sun.value }, 'mass'), 'SkB'), 1.05e77, 1e-2);
  });
  test('Referenzwerte', 'Schwarzschild-Radius der Sonne ≈ 2953 m', () => {
    close(val(run('hawking', { M: M.C.M_sun.value }), 'rs'), 2953.25, 1e-4);
  });
  test('Referenzwerte', 'Beide Entropie-Formen stimmen überein', () => {
    const a = run('bh-entropy', { M: 1e31 }, 'mass');
    const b = run('bh-entropy', { A: val(a, 'A') }, 'area');
    close(val(b, 'S'), val(a, 'S'), 1e-10);
    close(val(b, 'Meq'), 1e31, 1e-10);
  });
  test('Referenzwerte', 'Einstein-Kopplung 8πG/c⁴ ≈ 2,077 × 10⁻⁴³', () => {
    close(val(run('efe'), 'kappa'), 2.0766e-43, 1e-4);
  });
  test('Referenzwerte', 'Elektron im 1-nm-Kasten: E₁ ≈ 0,376 eV', () => {
    const r = run('schroedinger', { m: M.C.m_e.value, L: 1e-9, n: 1 });
    close(val(r, 'E') / M.C.eV.value, 0.376, 1e-2);
  });
  test('Referenzwerte', 'Freier Fall 100 m: t ≈ 4,52 s', () => {
    close(val(run('free-fall', { h0: 100, g: 9.80665 }), 'tf'), 4.5160, 1e-4);
  });
  test('Referenzwerte', 'Feder k=50, m=1: T = 2π/√50', () => {
    close(val(run('spring'), 'T'), 2 * Math.PI / Math.sqrt(50), 1e-12);
  });
  test('Referenzwerte', 'Kinematik: s = 0 + 5·3 + ½·2·9 = 24 m', () => {
    close(val(run('kinematics'), 's'), 24, 1e-12);
  });
  test('Referenzwerte', 'ISS: a ≈ 8,6 m/s²', () => {
    const exp = M.byId.circular;
    close(val(run('circular', exp.presets.find((p) => p.name === 'ISS').values), 'a'), 8.64, 5e-3);
  });

  /* --- Parser --- */
  test('Parser', 'Punkt vor Strich, rechtsassoziative Potenz, unäres Minus', () => {
    const f = (s) => E.evaluate(E.parse(s), {}).value;
    close(f('2+3*4'), 14); close(f('2^3^2'), 512); close(f('-2^2'), -4); close(f('2^-1'), 0.5);
  });
  test('Parser', 'Syntaxfehler liefert Position', () => {
    let err;
    try { E.parse('G*(m1+'); } catch (e) { err = e; }
    ok(err && err.kind === 'parse' && Array.isArray(err.span), 'Fehler mit Span erwartet');
  });
  test('Parser', 'Rationale Exponenten: sqrt(L) → L¹ᐟ²', () => {
    const d = E.dimAnalyze(E.parse('sqrt(x)'), { x: D('L') });
    ok(E.dimStr(d.dim) === 'L¹ᐟ²', E.dimStr(d.dim));
  });
  test('Parser', 'Funktionen verlangen genau ein Argument: sqrt(4, 5) ist ein Syntaxfehler', () => {
    let err;
    try { E.parse('sqrt(4, 5)'); } catch (e) { err = e; }
    ok(err && err.kind === 'parse' && /genau ein Argument/.test(err.message), err ? err.message : 'kein Fehler');
  });
  test('Parser', 'Namen wie constructor/toString sind unbekannt, __proto__ wird abgelehnt', () => {
    for (const s of ['constructor', 'toString', 'valueOf(2)', 'hasOwnProperty']) {
      const r = E.evaluate(E.parse(s), M.CONST_ENV);
      ok(!r.ok && /Unbekanntes Symbol/.test(r.issues[0].msg), s + ': ' + JSON.stringify(r.issues));
      const d = E.dimAnalyze(E.parse(s), symDims());
      ok(!d.ok && /keine bekannte Dimension/.test(d.errors[0].msg), s + ': Dimension');
    }
    let err;
    try { E.parse('X = __proto__'); } catch (e) { err = e; }
    ok(err && err.kind === 'parse', '__proto__ sollte abgelehnt werden');
  });
  test('Parser', '„ħc / G M“ wird als mehrdeutig gemeldet, „1/2 m v²“ und „a/(b c)“ nicht', () => {
    const hit = E.implicitAfterDivision(E.parse('hbar c / G M'));
    ok(hit.length === 1, 'Treffer erwartet');
    ok(E.toTex(hit[0].alt) === '\\frac{\\hbar\\,c}{G\\,M}', E.toTex(hit[0].alt));
    ok(!E.implicitAfterDivision(E.parse('1/2 m v^2')).length, '1/2 m v^2 fälschlich gemeldet');
    ok(!E.implicitAfterDivision(E.parse('a/(b c)')).length, 'a/(b c) fälschlich gemeldet');
    ok(E.implicitAfterDivision(E.parse('sqrt(a / b c)')).length === 1, 'in Funktionsargumenten übersehen');
  });
  test('Parser', 'Positionszuordnung nach normalize: ħ und ³ zeigen auf die Originalzeichen', () => {
    const raw = 'ħ c³ / G M', map = [];
    const n = E.normalize(raw, map);
    ok(map.length === n.length + 1, 'Länge der Zuordnung');
    ok(raw[map[n.indexOf('c')]] === 'c' && raw[map[n.indexOf('G')]] === 'G', 'falsche Zuordnung');
    ok(map[n.length] === raw.length, 'Ende');
  });
  test('Numerik', '0⁰ → eigene Meldung, keine „Division durch 0“', () => {
    const r = E.evaluate(E.parse('0^0'), {});
    ok(!r.ok && /0⁰/.test(r.issues[0].msg) && !/Division/.test(r.issues[0].msg), r.issues[0].msg);
  });
  test('Numerik', 'exp(10⁴⁰⁰) und cos(10⁴⁰⁰) → math-Issue statt „NaN × 10^Infinity“', () => {
    for (const s of ['exp(10^400)', 'exp(-10^400)', 'cos(10^400)']) {
      const r = E.evaluate(E.parse(s), {});
      ok(!r.ok && r.issues[0].cat === 'math' && /Double-Bereichs/.test(r.issues[0].msg), s + ': ' + JSON.stringify(r.issues));
    }
  });
  test('Einheiten', 'Dimensionsangabe mit Nenner 0 (L^1/0) wird abgelehnt', () => {
    let err;
    try { D('L^1/0'); } catch (e) { err = e; }
    ok(err && /Nenner 0/.test(err.message), err ? err.message : 'kein Fehler');
  });
  test('Formatierung', '6.6743e-11 → „6.6743 × 10⁻¹¹“', () => {
    ok(E.fmt(6.6743e-11) === '6.6743 × 10⁻¹¹', E.fmt(6.6743e-11));
  });

  // UI-level: custom-equation mode must agree with the experiment definitions
  test('UI (im Browser)', 'Eigene Gleichung: Hawking-Formel mit π und ħ ist konsistent, X = GM/c nicht', () => {
    if (!PP.ui || !PP.ui.dims) return; // UI-Module nur im Browser geladen
    const S = PP.ui.S, keep = { src: S.custom.src, dims: S.custom.dims };
    try {
      S.custom.src = 'T_H = ħ c^3 / (8 π G M k_B)'; S.custom.dims = {};
      const h = PP.ui.dims.customResult();
      if (!/✓ dimensionskonsistent/.test(h) || /✗/.test(h)) throw new Error('als inkonsistent gemeldet');
      S.custom.src = 'X = G M / c'; S.custom.dims = { X: 'L' };
      if (!/✗ dimensional inkonsistent/.test(PP.ui.dims.customResult())) throw new Error('X = GM/c nicht erkannt');
    } finally { S.custom.src = keep.src; S.custom.dims = keep.dims; }
  });
  test('UI (im Browser)', 'E = m g h: h zuerst Planck-Konstante mit Hinweis, als Höhe konsistent', () => {
    if (!PP.ui || !PP.ui.dims) return;
    const S = PP.ui.S, keep = { src: S.custom.src, dims: S.custom.dims };
    try {
      S.custom.src = 'E = m g h'; S.custom.dims = {};
      let h = PP.ui.dims.customResult();
      ok(/✗ dimensional inkonsistent/.test(h) && /data-alt="h"/.test(h), 'Hinweis auf h fehlt');
      S.custom.dims = { h: 'L' };
      h = PP.ui.dims.customResult();
      ok(/✓ dimensionskonsistent/.test(h) && !/✗/.test(h), 'mit h als Höhe nicht konsistent');
      S.custom.src = 'E = h f'; S.custom.dims = {};
      ok(/✓ dimensionskonsistent/.test(PP.ui.dims.customResult()), 'E = h f sollte konsistent sein');
    } finally { S.custom.src = keep.src; S.custom.dims = keep.dims; }
  });
  test('UI (im Browser)', 'Eigene Gleichung: „constructor“ und „toString“ lassen die Ansicht nicht abstürzen', () => {
    if (!PP.ui || !PP.ui.dims) return;
    const S = PP.ui.S, keep = { src: S.custom.src, dims: S.custom.dims };
    try {
      for (const src of ['X = constructor', 'E = toString m']) {
        S.custom.src = src; S.custom.dims = {};
        ok(/unbekannt/.test(PP.ui.dims.customResult()), src);
      }
    } finally { S.custom.src = keep.src; S.custom.dims = keep.dims; }
  });
  test('UI (im Browser)', 'Eigene Gleichung: Klammer-Vorschlag bei „ħ c / G M“ behält ħ und ³ bei', () => {
    if (!PP.ui || !PP.ui.dims) return;
    const S = PP.ui.S, keep = { src: S.custom.src, dims: S.custom.dims };
    try {
      S.custom.src = 'X = ħ c³ / G M'; S.custom.dims = {};
      const m = /data-fixsrc="([^"]*)"/.exec(PP.ui.dims.customResult());
      ok(m && m[1] === 'X = ħ c³ / (G M)', m ? m[1] : 'kein Vorschlag');
    } finally { S.custom.src = keep.src; S.custom.dims = keep.dims; }
  });
  test('UI (im Browser)', 'URL mit #exp=constructor oder #view=toString wird ignoriert', () => {
    if (!PP.ui || !PP.ui.applyState) return;
    ok(!PP.ui.applyState('#exp=constructor') && !PP.ui.applyState('#view=toString'), 'unbekannte Namen akzeptiert');
  });
  test('UI (im Browser)', 'Wirkungs-Demo: geschlossene Form ΔS = mπ²/(4T)·(ε₁² + 4ε₂²) stimmt mit der Integration überein', () => {
    if (!PP.ui || !PP.ui.actionDemo) return;
    const A = PP.ui.actionDemo, S0n = A.action(0, 0);
    close(A.S0, S0n, 1e-4, 'S₀'); // Toleranz = Fehler der Mittelpunktsregel mit 400 Schritten (≈ 6 × 10⁻⁵)
    for (const [a, b] of [[1, 0], [0, 1], [1.3, -0.7], [-2, 2]]) close(A.dS(a, b), A.action(a, b) - S0n, 1e-4, 'ΔS(' + a + ', ' + b + ')');
  });

  /* --- Erweiterung der Engine: vollständiges elliptisches Integral K(k) --- */
  test('Numerik', 'Elliptisches Integral: K(0) = π/2, K(1/√2) ≈ 1,8540746773, K(0,5) ≈ 1,6857503548', () => {
    const K = (k) => E.toDouble(E.evaluate(E.parse('ellipk(k)'), { k }));
    close(K(0), Math.PI / 2, 1e-15, 'K(0)');
    close(K(Math.SQRT1_2), 1.8540746773013719, 1e-14, 'K(1/√2)');
    close(K(0.5), 1.685750354812596, 1e-14, 'K(0,5)');
    close(K(-0.5), K(0.5), 1e-15, 'K(−k) = K(k)');
  });
  test('Numerik', 'Elliptisches Integral: k = 1 divergiert, |k| > 1 ist nicht reell – beides als math-Issue', () => {
    for (const k of [1, 1.2, -1]) {
      const x = E.evaluate(E.parse('ellipk(k)'), { k });
      ok(!x.ok && x.issues[0].cat === 'math', 'k = ' + k);
    }
  });
  /* --- Erweiterung der Engine: Jacobi-Funktion sn(u, k) und arcsin – für die Bewegung des Fadenpendels --- */
  test('Numerik', 'Jacobi-Funktion: sn(K) = 1, sn(K/2) = 1/√(1 + k′), sn(3K) = −1, k = 0 → sin, k = 1 → tanh', () => {
    const ev = (src, env) => E.toDouble(E.evaluate(E.parse(src), env));
    for (const k of [0, 0.3, 0.5, 0.9, 0.99, 0.99996]) {
      const K = ev('ellipk(k)', { k }), kp = Math.sqrt(1 - k * k);
      close(ev('sn(K, k)', { K, k }), 1, 1e-14, 'sn(K), k = ' + k + ':');
      close(ev('sn(K/2, k)', { K, k }), 1 / Math.sqrt(1 + kp), 1e-13, 'sn(K/2), k = ' + k + ':');
      close(ev('sn(3*K, k)', { K, k }), -1, 1e-13, 'sn(3K), k = ' + k + ':');
      close(ev('sn(0.4, -k)', { k }) || 1e-300, ev('sn(0.4, k)', { k }) || 1e-300, 1e-15, 'sn(u, −k) = sn(u, k):');
    }
    close(ev('sn(0.7, 0)', {}), Math.sin(0.7), 1e-15, 'k = 0:');
    close(ev('sn(0.7, 1)', {}), Math.tanh(0.7), 1e-15, 'k = 1:');
    close(ev('asin(0.5)', {}), Math.PI / 6, 1e-15, 'arcsin(0,5):');
  });
  test('Parser', 'sn braucht genau zwei Argumente, beide dimensionslos; arcsin außerhalb von [−1, 1] und |k| > 1 sind math-Issues', () => {
    let msg = '';
    try { E.parse('sn(1)'); } catch (e) { msg = e.message; }
    ok(/genau 2 Argumente/.test(msg), msg || 'sn(1) wurde akzeptiert');
    ok(!E.dimAnalyze(E.parse('sn(x, 0.5)'), { x: D('L') }).ok && !E.dimAnalyze(E.parse('sn(0.5, x)'), { x: D('L') }).ok && E.dimAnalyze(E.parse('sn(x, y)'), { x: D(''), y: D('') }).ok, 'Dimensionen');
    for (const src of ['asin(1.5)', 'sn(1, 1.2)']) { const x = E.evaluate(E.parse(src), {}); ok(!x.ok && x.issues[0].cat === 'math', src); }
    ok(/arcsin/.test(E.toTex(E.parse('asin(x)'))) && /operatorname\{sn\}.*, /.test(E.toTex(E.parse('sn(u, k)'))), E.toTex(E.parse('sn(u, k)')));
  });
  test('Numerik', 'min und max: richtig auch für negative Zahlen, null und Werte jenseits von 10³⁰⁸; nur Größen derselben Dimension', () => {
    const ev = (src) => E.evaluate(E.parse(src), {});
    const v = (src) => E.toDouble(ev(src));
    ok(v('min(2, 3)') === 2 && v('max(2, 3)') === 3 && v('min(-2, 3)') === -2 && v('min(-2, -3)') === -3 && v('max(-2, -3)') === -2, 'Vorzeichen');
    ok(v('min(0, -1)') === -1 && v('min(0, 1)') === 0 && v('max(0, -1)') === 0, 'null');
    const big = ev('max(10^400, 10^300)'), small = ev('min(10^400, 10^300)');
    ok(Math.abs(big.l - 400) < 1e-9 && Math.abs(small.l - 300) < 1e-9, 'jenseits von 10^308: ' + big.l + ', ' + small.l);
    ok(!E.dimAnalyze(E.parse('min(x, y)'), { x: D('L'), y: D('T') }).ok, 'L gegen T');
    const r = E.dimAnalyze(E.parse('max(x, y)'), { x: D('L'), y: D('L') });
    ok(r.ok && E.dimInfo(r.dim).unit === 'm', 'Ergebnis behält die Dimension');
  });
  test('Dimensionsanalyse', 'ellipk(Länge) wird abgelehnt', () => {
    ok(!E.dimAnalyze(E.parse('ellipk(x)'), { x: D('L') }).ok && E.dimAnalyze(E.parse('ellipk(x)'), { x: D('') }).ok);
  });
  test('Referenzwerte', 'Fadenpendel: T/T₀ bei 90° ≈ 1,1803406', () => {
    close(val(run('pendulum', { th: 90 }), 'q'), 1.1803405990160962, 1e-12);
    close(val(run('pendulum', { L: 1, g: 9.80665, th: 0 }), 'T'), 2 * Math.PI * Math.sqrt(1 / 9.80665), 1e-14, 'θ₀ = 0');
  });
  // θ(t) über die Engine (Form „motion“), in Grad
  const swing = (vals, t) => val(M.compute(M.byId.pendulum, 'motion', Object.assign(M.defaults(M.byId.pendulum), vals, { t }), { skipChecks: true }), 'thx');
  test('Referenzwerte', 'Fadenpendel: θ(t) aus Jacobi-sn stimmt mit einer numerischen Integration (RK4) auf 10⁻⁷ Grad überein – bei 10°, 90° und 170°', () => {
    const L = 1, g = 9.80665, h = 2e-4, f = (x) => -(g / L) * Math.sin(x);
    for (const th of [10, 90, 170]) {
      let x = (th * Math.PI) / 180, w = 0, worst = 0;
      for (let i = 0; i <= 15000; i++) {   // 3 s, verglichen alle 0,1 s
        if (i % 500 === 0) worst = Math.max(worst, Math.abs(swing({ L, g, th }, i * h) - (x * 180) / Math.PI));
        const k1x = w, k1w = f(x), k2x = w + (h / 2) * k1w, k2w = f(x + (h / 2) * k1x), k3x = w + (h / 2) * k2w, k3w = f(x + (h / 2) * k2x), k4x = w + h * k3w, k4w = f(x + h * k3x);
        x += (h / 6) * (k1x + 2 * k2x + 2 * k3x + k4x); w += (h / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);
      }
      ok(worst < 1e-7, th + '°: Abweichung ' + worst + '°');
    }
  });
  test('Referenzwerte', 'Fadenpendel: θ(0) = θ₀, θ(T/4) = 0, θ(T/2) = −θ₀, θ(T) = θ₀; bei 2° weicht die Näherung höchstens 0,001° ab, bei 170° um mehr als 100°', () => {
    for (const th of [2, 90, 170]) {
      const T = val(run('pendulum', { th }), 'T');
      close(swing({ th }, 0), th, 1e-12, th + '°, t = 0:');
      ok(Math.abs(swing({ th }, T / 4)) < 1e-9 * th, th + '°, t = T/4: ' + swing({ th }, T / 4));
      close(swing({ th }, T / 2), -th, 1e-12, th + '°, t = T/2:');
      close(swing({ th }, T), th, 1e-12, th + '°, t = T:');
    }
    const r2 = run('pendulum', { th: 2, t: 0.3 }, 'motion');
    ok(Math.abs(val(r2, 'dth')) < 1e-3, '2°: ' + val(r2, 'dth'));
    const T170 = val(run('pendulum', { th: 170 }), 'T0');
    ok(Math.abs(val(run('pendulum', { th: 170, t: T170 / 2 }, 'motion'), 'dth')) > 100, '170°: Näherung sollte weit daneben liegen');
  });
  test('Referenzwerte', 'Ideales Gas: 1 mol bei 273,15 K in 22,414 l → 101,325 kPa', () => {
    close(val(run('ideal-gas', { N: M.C.N_A.value, T: 273.15, V: 0.022414 }), 'p'), 101325, 2e-5);
  });
  test('Referenzwerte', 'Schiefer Wurf: 30° und 60° fliegen gleich weit, 45° am weitesten', () => {
    const R = (al) => val(run('projectile', { v0: 20, al, g: 9.80665 }), 'R');
    close(R(30), R(60), 1e-12, '30° ↔ 60°');
    ok(R(45) > R(44) && R(45) > R(46), '45° maximal');
    close(R(45), 400 / 9.80665, 1e-12, 'R(45°) = v₀²/g');
  });

  /* --- Aufgaben: jede lösbar, keine schon am Anfang gelöst --- */
  test('Aufgaben', 'Jede „Probier mal“-Aufgabe ist ein Auftrag ohne Fragesatz, mit den Reglern lösbar und am Anfang noch offen', () => {
    const bad = [];
    const state = (exp, form, vals, base, consts, opts) => {
      const v = Object.assign(M.defaults(exp), vals || {}), b = Object.assign(M.defaults(exp), base || {});
      const r = M.compute(exp, form, v, { consts: consts || {} }), rb = M.compute(exp, form, b, { skipChecks: true });
      const num = (x) => (x && x.ok ? E.toDouble(x) : NaN);
      return { v, b, o: (k) => num(r.out[k]), ob: (k) => num(rb.out[k]), C: Object.assign({}, M.CONST_ENV, consts || {}), C0: M.CONST_ENV, cats: new Set(r.issues.map((i) => i.cat)), form, opts: opts || {} };
    };
    let n = 0;
    for (const exp of M.registry) (exp.tasks || []).forEach((t, i) => {
      n++;
      const d = t.demo || {}, form = d.form || exp.forms[0].id, name = exp.id + ' #' + (i + 1);
      // Aufträge statt Fragen: „Finde …“, „Lies ab, …“ – auch im Tipp kein Fragesatz
      for (const lang of ['de', 'en']) I.with(lang, () => { if (/\?/.test(t.q) || /\?/.test(t.hint || '')) bad.push(name + ' (' + lang + '): Fragesatz'); });
      if (!t.done(state(exp, form, d.vals, d.base, d.consts, d.opts))) bad.push(name + ': Beispiellösung erfüllt die Aufgabe nicht');
      if (t.done(state(exp, exp.forms[0].id, {}, {}, {}, {}))) bad.push(name + ': schon bei den Ausgangswerten erfüllt');
      for (const k in d.vals || {}) {
        const dv = exp.vars[k];
        if (!dv || dv.constant) continue;
        if (!(d.vals[k] >= dv.min && d.vals[k] <= dv.max)) bad.push(name + ': ' + k + ' = ' + d.vals[k] + ' liegt außerhalb des Regler-Bereichs');
      }
    });
    ok(n >= 30, 'nur ' + n + ' Aufgaben');
    ok(!bad.length, bad.join(' | '));
  });

  test('Aufgaben', 'Quellen: jedes Experiment hat Quellen, DOIs sind gültig geformt, englische Notizen ohne deutsche Reste', () => {
    if (!PP.sources) return;
    const bad = [];
    for (const exp of M.registry) {
      const list = PP.sources.byId[exp.id];
      if (!list || !list.length) { bad.push(exp.id + ': keine Quellen'); continue; }
      list.forEach((s) => {
        if (!s.who || !s.title || !s.where || !(s.year > 1600 && s.year < 2100)) bad.push(exp.id + ': unvollständig – ' + s.title);
        if (s.doi && !/^10\.\d{4,9}\/\S+$/.test(s.doi)) bad.push(exp.id + ': DOI ' + s.doi);
        if (s.url && !/^https:\/\//.test(s.url)) bad.push(exp.id + ': URL ' + s.url);
        if (!PP.sources.KIND[s.kind]) bad.push(exp.id + ': Art ' + s.kind);
        const en = I.with('en', () => s.note).replace(/Schrödinger|Göttingen/g, '');
        if (/[„äöüÄÖÜß]/.test(en) || /\b(und|der|die|das|nicht|mit)\b/.test(en)) bad.push(exp.id + ': ' + en);
      });
    }
    ok(!bad.length, bad.slice(0, 3).join(' | '));
  });

  /* --- Visualisierung: zeichnet nur, was die Engine liefert --- */
  // Zeichenkontext, der nur die geschriebenen Texte aufzeichnet
  function recCtx() {
    const texts = [], noop = () => {}, grad = { addColorStop: noop };
    const t = { texts, measureText: (x) => ({ width: String(x).length * 7 }), createRadialGradient: () => grad, createLinearGradient: () => grad, fillText: (x) => texts.push(String(x)) };
    return new Proxy(t, { get: (o, k) => (k in o ? o[k] : noop), set: (o, k, v) => { o[k] = v; return true; } });
  }
  const COL = { bg: '#000', panel: '#111', panel2: '#222', ink: '#eee', ink2: '#bbb', ink3: '#777', grid: '#333', accent: '#fa0', cyan: '#0cd', red: '#f55', green: '#5c5', violet: '#a8f', mono: 'monospace', sans: 'sans-serif' };
  const draw = (id, vals, o = {}) => {
    const exp = M.byId[id], form = o.form || exp.forms[0].id, ctx = recCtx();
    const S = PP.vizState({ exp, form, vals: Object.assign(M.defaults(exp), vals || {}), consts: o.consts || {}, base: o.base ? Object.assign(M.defaults(exp), o.base) : null, baseLabel: 'Test', t: o.t || 1.3, opts: o.opts || {}, col: COL });
    PP.viz[exp.viz](ctx, o.W || 640, o.H || 330, S);
    return ctx.texts;
  };
  // Alle Einstellungen der Bedienelemente einer Visualisierung (Schalter: aus/an, Auswahl: jede Option)
  const optSets = (exp) => (exp.vizControls || []).reduce((sets, c) => sets.flatMap((o) => (c.options ? c.options.map((x) => x.v) : [false, true]).map((v) => Object.assign({}, o, { [c.key]: v }))), [{}]);
  const fmtOut = (r, k) => E.fmt({ s: r.out[k].s, l: r.out[k].l, d: r.out[k].value }, 3);
  test('Visualisierung', 'Alle Visualisierungen zeichnen Standardwerte und Presets ohne Fehler und ohne „NaN“', () => {
    if (!PP.viz || !PP.vizState) return;
    for (const exp of M.registry) {
      if (!exp.viz) continue;
      const cases = [{}].concat((exp.presets || []).map((p) => ({ vals: p.values, form: p.form })));
      for (const c of cases) for (const W of [640, 360]) for (const opts of optSets(exp)) {
        let texts;
        try { texts = draw(exp.id, c.vals, { form: c.form, W, H: W < 400 ? 260 : 330, base: c.vals, opts }); }
        catch (e) { throw new Error(exp.id + ' (' + W + ' px): ' + e.message); }
        const bad = texts.find((x) => /NaN|undefined|Infinity/.test(x));
        ok(!bad, exp.id + ': „' + bad + '“');
      }
    }
  });
  test('Visualisierung', 'Fadenpendel: Das Bild zeigt in „Bewegung θ(t)“ t, θ und θₐ aus der Engine, in „Periodendauer“ den Zeitmaßstab', () => {
    if (!PP.viz) return;
    const r = run('pendulum', { th: 90, t: 0.5 }, 'motion'), fo = (k) => fmtOut(r, k);
    const m = draw('pendulum', { th: 90, t: 0.5 }, { form: 'motion' });
    ok(m.some((x) => x.includes('t = 0.5 s') || x.includes('t = 0,5 s')), m.join(' | '));
    ok(m.some((x) => x.includes('θ = ' + fo('thx'))) && m.some((x) => x.includes('θₐ = ' + fo('tha'))), m.join(' | '));
    const p = draw('pendulum', { th: 90 });
    ok(p.some((x) => /Jacobi/.test(x)), p.join(' | '));
    ok(!m.concat(p).some((x) => /NaN|undefined|Infinity/.test(x)), 'NaN im Bild');
  });
  test('Visualisierung', 'Pendeln um einen festen Wert (sweep.center) bleibt im Regler-Bereich', () => {
    for (const exp of M.registry) {
      const sw = exp.sweep;
      if (!sw || !sw.center) continue;
      const d = exp.vars[sw.key];
      ok(d && sw.center / sw.span >= d.min && sw.center * sw.span <= d.max && sw.span > 1, exp.id + ': ' + sw.center + ' ×/÷ ' + sw.span);
    }
    ok(M.byId['bh-eta'].sweep && M.byId['bh-eta'].sweep.center === 0.25, 'bh-eta pendelt nicht um 1/4');
  });
  test('Visualisierung', 'β = 1: Die Visualisierung zeigt γ als nicht definiert statt einer Zahl', () => {
    if (!PP.viz) return;
    const texts = draw('special-rel', { beta: 1 });
    ok(texts.some((x) => /γ ist für \|β\| ≥ 1 nicht definiert/.test(x)), 'Hinweis fehlt');
    ok(!texts.some((x) => /^γ = /.test(x)), 'γ als Zahl gezeichnet');
  });
  test('Visualisierung', 'Schwarzes Loch: r_s, A, S_BH und T_H im Bild stammen aus der Engine, Exponenten 1, 2, 2, −1', () => {
    if (!PP.viz) return;
    const Msun = M.C.M_sun.value;
    const hk = run('hawking', { M: Msun }), be = run('bh-entropy', { M: Msun }, 'mass');
    for (const [id, form] of [['hawking'], ['bh-entropy', 'mass']]) {
      const texts = draw(id, { M: Msun }, { form });
      for (const want of [fmtOut(hk, 'rs') + ' m', fmtOut(be, 'A') + ' m²', fmtOut(be, 'S') + ' J/K', fmtOut(hk, 'TH') + ' K']) ok(texts.includes(want), id + ': ' + want + ' fehlt');
      ok(texts.filter((x) => x === '∝ M').length === 1 && texts.filter((x) => x === '∝ M²').length === 2 && texts.filter((x) => x === '∝ M⁻¹').length === 1, id + ': Exponenten ' + texts.filter((x) => x.startsWith('∝')).join(', '));
    }
  });
  test('Visualisierung', 'Gravitation: Die Faktoren im Bild zeigen F ∝ m₁m₂/r² (m₁ ×2, r ×½ → F ×8)', () => {
    if (!PP.viz) return;
    const texts = draw('newton-gravity', { m1: 2, m2: 1, r: 0.5 }, { base: { m1: 1, m2: 1, r: 1 } });
    const i = texts.indexOf('F / F₀');
    ok(i >= 0, 'Faktorzeile fehlt');
    const f = texts.filter((x) => /^×/.test(x));
    ok(f.join(' ') === '×8 ×2 ×1 ×4', f.join(' '));
  });
  test('Visualisierung', 'Feldgleichungen: Das Bild ist als schematische Projektion gekennzeichnet', () => {
    if (!PP.viz) return;
    for (const W of [640, 360]) ok(draw('efe', {}, { W }).some((x) => /Schematische Projektion \(Modell\)/.test(x)), W + ' px');
  });
  test('Visualisierung', 'Schrödinger: Ein nicht ganzzahliges n wird nicht als Welle gezeichnet', () => {
    if (!PP.viz) return;
    const texts = draw('schroedinger', { n: 2.5 });
    ok(texts.some((x) => /n muss eine positive ganze Zahl sein/.test(x)) && !texts.includes('|ψ|²'), texts.slice(0, 3).join(' | '));
  });

  test('Visualisierung', 'Planck-Einheiten: Jede Skala zeigt den Wert aus der Engine (l_P, t_P, m_P, T_P, E_P)', () => {
    if (!PP.viz) return;
    const r = run('planck');
    for (const [q, k, unit] of [['l', 'lP', 'm'], ['t', 'tP', 's'], ['m', 'mP', 'kg'], ['T', 'TP', 'K'], ['E', 'EP', 'J']]) {
      const texts = draw('planck', {}, { opts: { q } });
      ok(texts.includes(fmtOut(r, k) + ' ' + unit), q + ': ' + fmtOut(r, k) + ' ' + unit + ' fehlt');
    }
  });
  test('Visualisierung', 'Planck-Temperatur: k_B im Bild ist E_P / T_P = 1,380649 × 10⁻²³ J/K, mit zweiter Achse in eV', () => {
    if (!PP.viz) return;
    const texts = draw('planck', {}, { opts: { q: 'T' } });
    ok(texts.some((x) => x.startsWith('k_B = 1.380649 × 10⁻²³ J/K')), texts.find((x) => x.startsWith('k_B')) || 'k_B-Zeile fehlt');
    ok(texts.includes('k_B T in eV'), 'zweite Achse fehlt');
  });

  /* --- Sprache --- */
  test('UI (im Browser)', 'Grundlagen: jeder Abschnitt hat Kurztitel und Kurzbeschreibung, der Direktlink #view=theorie&sec=… bleibt im Zustand', () => {
    if (!PP.ui || !PP.ui.theory || !PP.ui.stateString) return;
    const U = PP.ui;
    for (const lang of ['de', 'en']) I.with(lang, () => U.theory.sections.forEach((sec) => { const m = U.theory.meta(sec); ok(m.short && m.teaser, lang + ': ' + sec.id); }));
    const prev = { view: U.S.view, sec: U.S.theorySec };
    try {
      U.S.view = 'theorie'; U.S.theorySec = 'gap';
      ok(/view=theorie&sec=gap/.test(U.stateString()), U.stateString());
    } finally { U.S.view = prev.view; U.S.theorySec = prev.sec; }
  });

  /* --- Hawking-Temperatur: Schnittpunkt der vier Theorien --- */
  test('Hawking-Temperatur', 'Drei Wege, ein Wert: ħc³/(8πGMk_B) = ħκ/(2πck_B) = T_P·m_P/(8πM), κ = c⁴/(4GM)', () => {
    for (const Mx of [M.C.M_sun.value, 1e12, 6.5e9 * M.C.M_sun.value]) {
      const r = run('hawking', { M: Mx });
      close(val(r, 'THk'), val(r, 'TH'), 1e-12, 'T aus κ');
      close(val(r, 'THp'), val(r, 'TH'), 1e-12, 'T_P·m_P/(8πM)');
      close(val(r, 'kappa'), Math.pow(M.C.c.value, 4) / (4 * M.C.G.value * Mx), 1e-12, 'κ');
      close(val(r, 'MmP') * val(r, 'mP'), Mx, 1e-12, 'M/m_P');
    }
    const p = run('planck');
    close(val(run('hawking'), 'TP'), val(p, 'TP'), 1e-12, 'T_P wie bei den Planck-Einheiten');
  });
  test('Hawking-Temperatur', 'Grenzfälle im Break-Modus: G → 0 „außerhalb des Modells“, G = 0 undefiniert, ħ = 0 ergibt T_H = 0, k_B·T_H bleibt bei k_B ÷ 1000', () => {
    const exp = M.byId.hawking, v = M.defaults(exp), C = M.C;
    const at = (consts) => M.compute(exp, 'main', v, { consts });
    const base = at({});
    ok(!base.issues.some((i) => i.cat === 'model'), 'ohne Änderung keine Modellgrenze: ' + base.issues.map((i) => i.msg).join(' | '));
    const g = at({ G: C.G.value * 1e-3 });
    ok(g.issues.some((i) => i.cat === 'model' && /Horizont/.test(i.msg)), 'G ÷ 1000: Modellgrenze fehlt');
    close(val(g, 'TH'), val(base, 'TH') * 1e3, 1e-9, 'T_H ∝ 1/G');
    const g0 = at({ G: 0 });
    ok(!g0.out.TH.ok && g0.issues.some((i) => i.cat === 'math') && g0.issues.some((i) => i.cat === 'model' && /G ≤ 0/.test(i.msg)), 'G = 0: ' + g0.issues.map((i) => i.cat).join(','));
    ok(at({ c: C.c.value * 10 }).issues.some((i) => i.cat === 'model' && /c → ∞/.test(i.msg)), 'c × 10: Hinweis auf c → ∞ fehlt');
    const h0 = at({ hbar: 0 });
    ok(h0.out.TH.ok && h0.out.TH.s === 0 && h0.issues.some((i) => i.cat === 'info' && /ħ → 0/.test(i.msg)), 'ħ = 0: T_H = 0 und Hinweis erwartet');
    const k = at({ k_B: C.k_B.value * 1e-3 });
    close(val(k, 'TH') * C.k_B.value * 1e-3, val(base, 'TH') * C.k_B.value, 1e-12, 'k_B·T_H');
    ok(k.issues.some((i) => i.cat === 'info' && /k_B rechnet nur/.test(i.msg)), 'k_B: Hinweis fehlt');
  });
  test('Hawking-Temperatur', 'Schnittpunkt-Block: Symbole, Kette, Aha-Kasten und Wörterbuch verweisen nur auf vorhandene Engine-Größen', () => {
    const exp = M.byId.hawking, xr = exp.crossroads;
    const outOf = (id, form) => M.formOf(M.byId[id], form).c.outputs.map((o) => o.key);
    Object.values(PP.equations.byId.hawking.symbols).forEach((s) => { if (s.live && s.live.c) ok(M.C[s.live.c], 'Konstante ' + s.live.c); if (s.live && s.live.v) ok(exp.vars[s.live.v], 'Eingabe ' + s.live.v); });
    const main = outOf('hawking');
    xr.chain.steps.concat(xr.aha.parts).forEach((p) => ok(main.includes(p.key), 'Ausgabe ' + p.key));
    xr.epistemic.filter((e) => e.value).forEach((e) => ok(main.includes(e.value.key), 'Ausgabe ' + e.value.key));
    for (const id of xr.dict.pair) ok(M.byId[id] && (M.byId[id].dict || (M.byId[id].crossroads || {}).dict) === xr.dict, id + ' zeigt das Wörterbuch nicht');
    xr.dict.rows.forEach((r) => [r.l.src, r.r.src].forEach((s) => ok(s.var ? M.byId.hawking.vars[s.var] : outOf(s.exp, s.form).includes(s.key), JSON.stringify(s))));
  });
  test('Visualisierung', 'Schwarzes Loch: G = 0, ħ = 0, k_B = 0 und c × 10¹² zeichnen ohne „NaN“', () => {
    if (!PP.viz) return;
    for (const consts of [{ G: 0 }, { hbar: 0 }, { k_B: 0 }, { c: M.C.c.value * 1e12 }]) {
      const bad = draw('hawking', {}, { consts }).find((x) => /NaN|undefined|Infinity/.test(x));
      ok(!bad, JSON.stringify(consts) + ': „' + bad + '“');
    }
  });

  /* --- Offene Fragen (src/ui/open.js, Experimente mit field: 'open') --- */
  test('Offene Fragen', 'Warum 1/4: R_η = 4η bei jeder Masse, nur η = 1/4 erfüllt den ersten Hauptsatz, S_η(1/4) = S_BH, R ohne Messunsicherheit', () => {
    const MS = M.C.M_sun.value, exp = M.byId['bh-eta'];
    for (const eta of [0.25, 0.5, 1]) for (const Mx of [1e8, MS, 6.5e9 * MS]) close(val(run('bh-eta', { eta, M: Mx }), 'R'), 4 * eta, 1e-12, 'η = ' + eta + ', M = ' + Mx + ':');
    ok(exp.presets.map((p) => Math.round(val(run('bh-eta', p.values), 'R') * 1e9) / 1e9).join() === '1,2,4,1', 'Presets');
    close(val(run('bh-eta', { eta: 0.25, M: MS }), 'S'), val(run('bh-entropy', { M: MS }, 'mass'), 'S'), 1e-12, 'S_η(1/4) gegen S_BH:');
    ok(exp.forms[0].c.outputs.find((o) => o.key === 'R').dim === '', 'R hat eine Dimension');
    const u = M.uncertainty(exp, 'main', M.defaults(exp), 'R');
    ok(u && u.rel < 1e-9, 'R hängt von G ab: ' + JSON.stringify(u));
    const msgs = (eta) => run('bh-eta', { eta }).issues.map((i) => i.msg).join(' | ');
    ok(/R_η = 1: Mit η = 1\/4/.test(msgs(0.25)) && !/verletzt/.test(msgs(0.25)), msgs(0.25));
    ok(/≠ 1/.test(msgs(0.5)) && /verletzt/.test(msgs(0.5)), msgs(0.5));
  });
  test('Offene Fragen', 'Page-Kurve: Page-Zeit 1 − 2^(−3/2) mit Maximum S₀/2; für β ≈ 1,4847 Pages 53,81 % und 59,75 %; null am Anfang und am Ende', () => {
    const P = (vals) => run('bh-page', vals);
    const tP = 1 - Math.pow(2, -1.5);
    close(val(P({}), 'tauP'), tP, 1e-14, 'Page-Zeit:');
    const atP = P({ tau: tP });
    close(val(atP, 'sBH'), 0.5, 1e-12, 'S_BH an der Page-Zeit:');
    close(val(atP, 'sRad'), 0.5, 1e-12, 'S_rad an der Page-Zeit:');
    let last = -1, peak = 0;
    for (let i = 0; i <= 200; i++) {
      const t = i / 200, s = val(P({ tau: t }), 'sPage');
      ok(s <= 0.5 + 1e-12, 'über dem Maximum bei τ = ' + t);
      if (t < tP - 0.01) ok(s > last, 'fällt vor der Page-Zeit bei τ = ' + t);
      if (t > tP + 0.01) ok(s < last, 'steigt nach der Page-Zeit bei τ = ' + t);
      peak = Math.max(peak, s); last = s;
    }
    ok(peak > 0.49, 'Maximum ' + peak);
    ok(val(P({ tau: 0 }), 'sPage') === 0 && val(P({ tau: 1 }), 'sPage') === 0, 'Anfang und Ende');
    close(val(P({ tau: 1, beta: 1.3 }), 'sRad'), 1.3, 1e-12, 'S_rad am Ende = β S₀:');
    const pg = P({ beta: 1.4847 }), tP2 = val(pg, 'tauP');
    ok(Math.abs(tP2 - 0.5381) < 5e-4, 'β = 1,4847: Page-Zeit ' + tP2);
    ok(Math.abs(val(P({ beta: 1.4847, tau: tP2 }), 'sPage') - 0.5975) < 5e-4, 'β = 1,4847: Maximum');
  });
  test('Offene Fragen', 'Verdampfung: t_evap und S₀ wie bei Hawking-Temperatur und BH-Entropie, T_H wächst wie (1 − τ)^(−1/3), bei τ = 1 ist T_H undefiniert', () => {
    for (const Mx of [1e11, M.C.M_sun.value, 1e40]) {
      close(val(run('bh-page', { M0: Mx }), 'tev'), val(run('hawking', { M: Mx }), 'tev'), 1e-12, 't_evap:');
      close(val(run('bh-page', { M0: Mx }), 'S0'), val(run('bh-entropy', { M: Mx }, 'mass'), 'SkB'), 1e-12, 'S₀:');
    }
    const T0 = val(run('bh-page', { tau: 0 }), 'TH');
    close(T0, val(run('hawking', { M: M.C.M_sun.value }), 'TH'), 1e-12, 'T_H am Anfang:');
    close(val(run('bh-page', { tau: 0.999 }), 'TH') / T0, 10, 1e-9, 'T_H bei 99,9 %:');
    const end = run('bh-page', { tau: 1 });
    ok(end.issues.some((i) => i.cat === 'math' && i.out === 'TH') && end.issues.some((i) => i.cat === 'model'), 'τ = 1: ' + end.issues.map((i) => i.cat).join());
    ok(end.out.sPage.ok && end.out.M.ok && val(end, 'M') === 0, 'τ = 1: Page-Kurve und Masse bleiben definiert');
  });
  test('Offene Fragen', 'Kosmologische Konstante: bei der Planck-Energie u_vac/u_Λ zwischen 10¹²⁰ und 10¹²⁴ und gleich 8π/(Λ l_P²), bei der Energieskala von Λ gleich 1; u_vac ∝ E_c⁴; Verhältnisse dimensionslos', () => {
    const L = (vals) => run('lambda-vac', vals), exp = M.byId['lambda-vac'];
    const p = L(), R = val(p, 'R');
    ok(R > 1e120 && R < 1e124, 'Planck: ' + R);
    close(R, val(p, 'RP'), 1e-9, 'u_vac(E_P)/u_Λ gegen 8π/(Λ l_P²):');
    close(val(p, 'EcP'), 1, 1e-12, 'Standardwert E_c = E_P:');
    close(val(L({ Ec: val(p, 'EL') }), 'R'), 1, 1e-9, 'Energieskala von Λ:');
    close(val(L({ Ec: val(p, 'EL') }), 'uV'), val(p, 'uL'), 1e-9, 'u_vac(E_Λ) = u_Λ:');
    close(val(L({ Ec: 1e8 }), 'R') / val(L({ Ec: 1e9 }), 'R'), 1e-4, 1e-9, 'E_c ÷ 10 → u_vac ÷ 10⁴:');
    close(val(p, 'lgR') - val(p, 'lgR1'), Math.log10(16 * Math.PI * Math.PI), 1e-9, 'Vorfaktor 1/(16π²):');
    const lg = (vals) => val(L(vals), 'lgR');
    ok(Math.abs(lg({ Ec: 1e12 * M.C.eV.value }) - 58.6) < 0.05 && Math.abs(lg({ Ec: 1e11 * M.C.eV.value }) - 54.6) < 0.05 && Math.abs(lg({ Ec: M.C.m_e.value * M.C.c.value ** 2 }) - 33.4) < 0.05, 'TeV, 100 GeV, Elektron');
    ok(exp.presets.map((x) => Math.round(val(L(x.values), 'lgR'))).join() === '123,59,55,33,0,0', 'Presets: ' + exp.presets.map((x) => val(L(x.values), 'lgR').toFixed(2)).join());
    const dims = Object.fromEntries(exp.forms[0].c.outputs.map((o) => [o.key, o.dim]));
    for (const k of ['R', 'lgR', 'lgR1', 'LlP2', 'RP', 'nl', 'nE']) ok(dims[k] === '', k + ' hat eine Dimension');
    ok(E.dimEq(exp.vars.Lambda.dimv, D('L^-2')), '[Λ] = ' + E.dimStr(exp.vars.Lambda.dimv));
  });
  test('Offene Fragen', 'Kosmologische Konstante: ℓ_Λ = 1/√Λ ≈ 10¹⁰ Lichtjahre, Λ l_P² ≈ 2,9 × 10⁻¹²², lg(ℓ_Λ/l_P) = −lg(Λ l_P²)/2; ħc/E_Λ ist bis auf (8π)^¼ das geometrische Mittel von l_P und ℓ_Λ; die Zahlen der Seite stimmen mit der Engine', () => {
    const L = (vals) => run('lambda-vac', vals), p = L(), lam = M.C.Lambda.value;
    close(val(p, 'lL'), 1 / Math.sqrt(lam), 1e-12, 'ℓ_Λ:');
    ok(Math.abs(val(p, 'lLly') / 1.008e10 - 1) < 0.01, 'ℓ_Λ in Lichtjahren: ' + val(p, 'lLly'));
    const x = val(p, 'LlP2');
    ok(x > 2.8e-122 && x < 3.0e-122, 'Λ l_P² = ' + x);
    close(val(p, 'nl'), -val(p, 'lgLl') / 2, 1e-12, 'Länge gegen Krümmung:');
    close(val(L({ Lambda: 100 * lam }), 'lL'), val(p, 'lL') / 10, 1e-12, 'Λ × 100 → ℓ_Λ ÷ 10:');
    close(val(p, 'lamL') / Math.sqrt(val(p, 'lP') * val(p, 'lL')), Math.pow(8 * Math.PI, 0.25), 1e-9, 'geometrisches Mittel:');
    close(val(p, 'nE') * 4, val(p, 'lgR'), 1e-9, 'Energie gegen Energiedichte:');
    // Tabelle und Text auf der Seite der Frage (src/ui/open.js): 60,8 · 121,5 · 30,7 · 122,9; 2,2 meV; dreieinhalb Protonen; 17 Mrd. Lichtjahre
    const r1 = (v) => Math.round(v * 10) / 10;
    ok([r1(val(p, 'nl')), r1(-val(p, 'lgLl')), r1(val(p, 'nE')), r1(val(p, 'lgR'))].join() === '60.8,121.5,30.7,122.9', 'Tabelle');
    close(r1(-val(p, 'lgLl') + Math.log10(8 * Math.PI)), r1(val(p, 'lgR')), 1e-12, '122,9 = 121,5 + lg 8π:');
    ok(r1(val(p, 'ELmeV')) === 2.2 && Math.abs(val(p, 'np') - 3.5) < 0.1 && Math.round(val(p, 'rdSly') / 1e9) === 17 && Math.abs(val(p, 'lamL') - 9e-5) < 5e-6, 'E_Λ, Protonen, de-Sitter-Radius, ħc/E_Λ');
  });
  test('Offene Fragen', 'Kosmologische Konstante: über der Planck-Energie „außerhalb des Modells“, ein verändertes Λ weicht vom „beobachteten“ Wert ab; alle drei Ansichten zeigen Werte aus der Engine', () => {
    const L = (vals) => run('lambda-vac', vals), exp = M.byId['lambda-vac'];
    const base = L();
    ok(!base.issues.some((i) => i.cat === 'model' || i.cat === 'unreal'), base.issues.map((i) => i.cat).join());
    const big = L({ Ec: 2 * exp.vars.Ec.max });
    ok(big.issues.some((i) => i.cat === 'model' && /Planck-Energie/.test(i.why)), 'E_c > E_P: ' + big.issues.map((i) => i.cat).join());
    const lam = L({ Lambda: 1e-50 });
    ok(lam.issues.some((i) => i.cat === 'unreal' && /beobachteten Wert/.test(i.msg)), lam.issues.map((i) => i.msg).join(' | '));
    if (!PP.viz) return;
    for (const W of [640, 360]) {
      const len = draw('lambda-vac', {}, { W, H: W < 400 ? 260 : 330, opts: { view: 'len' } }), rho = draw('lambda-vac', {}, { W, H: W < 400 ? 260 : 330, opts: { view: 'rho' } });
      ok(len.some((s) => s.includes(fmtOut(base, 'lL') + ' m')) && len.includes(fmtOut(base, 'LlP2')), W + ' px, Λ = 1/ℓ²: ' + len.slice(0, 6).join(' | '));
      ok(len.some((s) => s.startsWith('1/l_P²')) && len.some((s) => /≈ 121\.5/.test(s)) && len.some((s) => /≈ 60\.8/.test(s)), W + ' px: Größenordnungen in Länge und Krümmung');
      ok(rho.includes(fmtOut(base, 'R')) && rho.some((s) => /≈ 122\.9/.test(s)) && rho.some((s) => /≈ 30\.7/.test(s)), W + ' px, Energiedichte: ' + rho.slice(0, 6).join(' | '));
      const hor = draw('lambda-vac', {}, { W, H: W < 400 ? 260 : 330, opts: { view: 'hor' } });
      ok(hor.includes(fmtOut(base, 'SdS') + ' k_B') && hor.includes(fmtOut(base, 'TdS') + ' K') && hor.some((s) => /≈ 61 /.test(s)) && hor.some((s) => /≈ 122 /.test(s)) && hor.includes('M87*'), W + ' px, Horizonte: ' + hor.slice(0, 8).join(' | '));
    }
    const same = draw('lambda-vac', { Ec: val(base, 'EL') }, { opts: { view: 'rho' } });
    ok(same.includes('u_vac ≈ u_Λ'), 'Verhältnis 1: ' + same.join(' | '));
  });
  test('Offene Fragen', 'Λ-Horizont: S_dS = 3π k_B/(Λ l_P²) ≈ 3,3 × 10¹²² k_B, T_dS ≈ 2,2 × 10⁻³⁰ K; Schwarze Löcher erreichen die Bekenstein-Schranke 2πk_B ER/(ħc); beide Horizonte folgen S = k_B πr²/l_P²', () => {
    const L = (vals) => run('lambda-vac', vals), p = L(), C = M.C;
    close(val(p, 'SdS'), 3 * Math.PI / val(p, 'LlP2'), 1e-12, 'S_dS gegen 3π/(Λ l_P²):');
    ok(val(p, 'SdS') > 3.2e122 && val(p, 'SdS') < 3.4e122, 'S_dS = ' + val(p, 'SdS'));
    close(val(p, 'TdS'), C.hbar.value * C.c.value * Math.sqrt(C.Lambda.value / 3) / (2 * Math.PI * C.k_B.value), 1e-12, 'T_dS = ħH/(2πk_B):');
    ok(Math.abs(val(p, 'TdS') / 2.2e-30 - 1) < 0.01, 'T_dS = ' + val(p, 'TdS'));
    close(val(L({ Lambda: C.Lambda.value / 100 }), 'SdS'), 100 * val(p, 'SdS'), 1e-12, 'Λ ÷ 100 → S_dS × 100:');
    close(val(p, 'nS'), 2 * val(p, 'nR'), 1e-12, 'eine Größenordnung im Radius = zwei in der Entropie:');
    const lP2 = val(p, 'lP') ** 2;
    close(val(p, 'SdS'), Math.PI * val(p, 'rdS') ** 2 / lP2, 1e-12, 'Λ-Horizont: S = πr²/l_P²:');
    for (const Mx of [C.M_sun.value, 4.3e6 * C.M_sun.value, 6.5e9 * C.M_sun.value]) {
      const bh = run('bh-entropy', { M: Mx }, 'mass'), rs = val(bh, 'rs');
      close(2 * Math.PI * Mx * C.c.value ** 2 * rs / (C.hbar.value * C.c.value), val(bh, 'SkB'), 1e-12, 'Bekenstein-Schranke bei M = ' + Mx + ':');
      close(val(bh, 'SkB'), Math.PI * rs * rs / lP2, 1e-12, 'Schwarzes Loch: S = πr²/l_P²:');
    }
  });
  test('Offene Fragen', 'Dekohärenz: V = 2√(p₁p₂)·e^(−N(1−γ)) ist die Poisson-Summe Σ Pois(k; N)·γ^k; V² + D² = 1 und Tr ρ² = 1 − 2p₁p₂(1 − |⟨E₁|E₂⟩|²) bei allen Einstellungen', () => {
    // unabhängig gerechnet: Mittel von γ^k über die Poisson-Verteilung
    const pois = (N, g) => { let s = 0, t = Math.exp(-N); for (let k = 0; k < 400; k++) { s += t * Math.pow(g, k); t *= N / (k + 1); } return s; };
    for (const p1 of [0, 0.1, 0.5, 0.9, 1]) for (const N of [0, 1, 7.5, 40]) for (const g of [0, 0.3, 0.95, 1]) {
      const r = run('decoherence', { p1, N, g }), at = 'p₁ = ' + p1 + ', N = ' + N + ', γ = ' + g + ':', p2 = 1 - p1, ov = val(r, 'D');
      ok(Math.abs(ov - pois(N, g)) < 1e-12, at + ' Überlapp ' + ov + ' statt ' + pois(N, g));
      ok(Math.abs(val(r, 'V') - 2 * Math.sqrt(p1 * p2) * Math.exp(-N * (1 - g))) < 1e-12, at + ' V = ' + val(r, 'V'));
      ok(Math.abs(val(r, 'VD') - 1) < 1e-12, at + ' V² + D² = ' + val(r, 'VD'));
      ok(Math.abs(val(r, 'pur') - (1 - 2 * p1 * p2 * (1 - ov * ov))) < 1e-12, at + ' Tr ρ² = ' + val(r, 'pur'));
      ok(val(r, 'pur') >= 0.5 - 1e-12 && val(r, 'pur') <= 1 + 1e-12, at + ' Tr ρ² außerhalb von ½ bis 1');
    }
  });
  test('Offene Fragen', 'Dekohärenz: Presets V = 1, e⁻², e⁻¹⁰ und 0,6 mit P = D = 0,8; I(x) hat bei V = 1 Nullstellen; p₁ oder γ außerhalb von 0 bis 1 und N < 0 sind „unreal“', () => {
    const r = M.byId.decoherence.presets.map((p) => run('decoherence', p.values));
    close(val(r[0], 'V'), 1, 1e-12, 'ohne Umgebung:');
    close(val(r[1], 'V'), Math.exp(-2), 1e-12, 'viele schwache Stöße:');
    close(val(r[2], 'V'), Math.exp(-10), 1e-12, 'Welcher-Weg-Detektor:');
    close(val(r[3], 'V'), 0.6, 1e-12, 'ungleiche Wege, V:'); close(val(r[3], 'P'), 0.8, 1e-12, 'ungleiche Wege, P:'); close(val(r[3], 'DE'), 0.8, 1e-12, 'ungleiche Wege, D:');
    const I = (x) => val(run('decoherence', { x }), 'I');
    ok(Math.abs(I(0.5)) < 1e-12 && Math.abs(I(-1.5)) < 1e-12, 'Minima bei V = 1: ' + I(0.5) + ', ' + I(-1.5));
    close(I(0), 2, 1e-12, 'Maximum bei x = 0:');
    const cats = (v) => new Set(run('decoherence', v).issues.map((i) => i.cat));
    ok(cats({ p1: 1.2 }).has('unreal') && cats({ g: 1.5 }).has('unreal') && cats({ N: -1 }).has('unreal'), '„unreal“ fehlt');
    ok(!cats({}).has('unreal') && cats({ N: 10, g: 0 }).has('info'), 'Hinweise');
  });
  test('Offene Fragen', 'Dekohärenz: Schirm und Wegzustand zeigen V, D und die Matrixeinträge aus der Engine; ein Treffer bleibt liegen, wenn neue dazukommen', () => {
    if (!PP.viz) return;
    const r = run('decoherence', { N: 10, g: 0.5 });
    for (const W of [640, 360]) {
      const H = W < 400 ? 260 : 330, s = draw('decoherence', { N: 10, g: 0.5, n: 600 }, { W, H });
      ok(s.includes(fmtOut(r, 'V')) && s.includes(fmtOut(r, 'DE')) && s.includes('n = 600'), W + ' px: ' + s.slice(0, 6).join(' | '));
      ok(s.some((x) => /Treffer zufällig aus \|ψ\|²/.test(x)), W + ' px: Hinweis auf den Zufallsgenerator fehlt');
      const st = draw('decoherence', { N: 10, g: 0.5 }, { W, H, opts: { view: 'state' } });
      ok(st.includes(fmtOut(r, 'pur')) && st.includes(E.fmt(val(r, 'r12'), 2)) && st.filter((x) => x === '0.5').length >= 2, W + ' px: ' + st.slice(0, 10).join(' | '));
    }
    // Fester Startwert: Die ersten n Treffer liegen an derselben Stelle, wenn einer dazukommt
    const exp = M.byId.decoherence;
    const dots = (n) => {
      const out = [], t = { measureText: (x) => ({ width: String(x).length * 7 }), fillRect: (x, y, w) => { if (w === 1.6) out.push(x.toFixed(3) + ',' + y.toFixed(3)); } };
      const ctx = new Proxy(t, { get: (o, k) => (k in o ? o[k] : () => {}), set: () => true });
      PP.viz.decoherence(ctx, 640, 330, PP.vizState({ exp, form: exp.forms[0].id, vals: Object.assign(M.defaults(exp), { n }), consts: {}, opts: {}, col: COL }));
      return out;
    };
    const a = dots(10), b = dots(11);
    ok(a.length === 10 && b.length === 11 && a.every((x, i) => x === b[i]), a.length + ' / ' + b.length + ' Treffer');
  });
  test('Offene Fragen', 'Keine Kandidaten für eine Quantengravitation – weder im Experiment noch in seinen Quellen noch auf den Seiten', () => {
    const banned = /string|schleifenquant|loop quantum|asymptoti\w* (sicherheit|safety)|kausale menge|causal set|holograph|AdS\/CFT|M-theor/i;
    const bad = [], seen = new WeakSet();
    const walk = (o, path) => {
      if (!o || typeof o !== 'object' || seen.has(o)) return;
      seen.add(o);
      for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === 'string') { if (banned.test(v)) bad.push(path + '.' + k + ': ' + v.slice(0, 60)); } else walk(v, path + '.' + k); }
    };
    for (const lang of ['de', 'en']) I.with(lang, () => {
      M.registry.filter((e) => e.field === 'open').forEach((e) => {
        walk(e, e.id);
        if (PP.sources && PP.sources.byId[e.id]) walk(PP.sources.byId[e.id], 'sources.' + e.id);
        if (PP.equations && PP.equations.byId[e.id]) walk(PP.equations.byId[e.id], 'equations.' + e.id);
      });
      if (PP.ui && PP.ui.open) PP.ui.open.questions.forEach((q) => { const x = q.body().replace(/<[^>]+>/g, ' '); if (banned.test(x)) bad.push(q.id + ' (' + lang + '): ' + x.match(banned)[0]); });
    });
    ok(M.registry.some((e) => e.field === 'open'), 'kein Experiment im Feld open');
    ok(!bad.length, bad.slice(0, 3).join(' | '));
  });
  test('UI (im Browser)', 'Offene Fragen: jede Frage hat Status, Kurztitel, eine Einleitung, die vier Abschnitte, keine Fragesätze im Text und ein Experiment im Feld „open“; der Direktlink #view=offen&sec=… bleibt im Zustand', () => {
    if (!PP.ui || !PP.ui.open || !PP.ui.stateString) return;
    const U = PP.ui;
    const heads = { de: ['Was gesichert ist', 'Was offen ist', 'Was es entscheiden würde', 'Live in der App'], en: ['What is established', 'What remains open', 'What would settle it', 'Live in the app'] };
    for (const lang of ['de', 'en']) I.with(lang, () => U.open.questions.forEach((q) => {
      const m = U.open.meta(q);
      ok(m.short && m.teaser, lang + ': ' + q.id);
      ok(U.open.STATUS[q.status], q.id + ': Status ' + q.status);
      ok(!q.exp || (M.byId[q.exp] && M.byId[q.exp].field === 'open'), q.id + ': Experiment ' + q.exp);
      const h3 = [...q.body().matchAll(/<h3 class="th-h3">([^<]*)<\/h3>/g)].map((x) => x[1]);
      ok(heads[lang].every((x) => h3.includes(x)), q.id + ' (' + lang + '): ' + h3.join(', '));
      // Die Seite beginnt mit einer Einleitung; Fragen sind nur der Titel und der Kurztitel
      ok(/^<p class="oq-lead">/.test(q.body()), q.id + ' (' + lang + '): keine Einleitung am Anfang');
      const txt = q.body().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      ok(!txt.includes('?') && !m.teaser.includes('?'), q.id + ' (' + lang + '): Fragesatz „' + (txt.match(/[^.:]*\?/) || [m.teaser])[0].trim() + '“');
      if (q.exp) ok(U.backLink(M.byId[q.exp]).href.endsWith('sec=' + q.id), q.id + ': Rückweg');
    }));
    const prev = { view: U.S.view, sec: U.S.theorySec };
    try {
      U.S.view = 'offen'; U.S.theorySec = 'quarter';
      ok(/view=offen&sec=quarter/.test(U.stateString()), U.stateString());
    } finally { U.S.view = prev.view; U.S.theorySec = prev.sec; }
  });

  /* --- Interaktive Gleichungen (src/data/equations.js, src/ui/eqx.js) --- */
  const EQ_COLORS = ['q', 'rel', 'grav', 'thermo', 'cosmo', 'mass', 'geo', 'res'];
  const xsKeys = (tex) => [...tex.matchAll(/\\xs\{([^}]*)\}/g)].map((m) => m[1]);
  test('Interaktive Gleichungen', 'Jede Gleichung ist interaktiv und ohne Marker gesetzt genau ihre Formel exp.tex', () => {
    for (const { id } of M.registry) {
      const eq = PP.equations.byId[id];
      ok(eq, id + ': keine interaktive Gleichung');
      if (PP.tex) ok(PP.tex.render(eq.tex) === PP.tex.render(M.byId[id].tex), id + ': Formel weicht von exp.tex ab');
      const keys = new Set(xsKeys(eq.tex)), sym = Object.keys(eq.symbols);
      ok(sym.every((k) => keys.has(k)) && [...keys].every((k) => sym.includes(k)), id + ': Symbole und \\xs-Marker passen nicht zusammen');
      ok(sym.includes(eq.pre), id + ': pre');
    }
  });
  test('Interaktive Gleichungen', 'Jedes Symbol: eine Quelle, Farbe, Kurzlabel, Rolle und Bedeutung auf Deutsch und Englisch, je höchstens drei Sätze; Werte nur aus PP.model.C', () => {
    const sentences = (t) => t.split(/[.!?](?=\s+\S|\s*$)/).filter((x) => x.trim()).length;
    const bad = [];
    // Experimente (byId) und Kerngleichungen der Grundlagen (theory, ohne Experiment)
    const all = Object.keys(PP.equations.byId).map((id) => [id, M.byId[id], PP.equations.byId[id], true])
      .concat(Object.keys(PP.equations.theory).map((id) => ['theory:' + id, null, PP.equations.theory[id], false]));
    for (const [id, exp, eq, isExp] of all) {
      if (isExp && !exp) { bad.push(id + ': kein Experiment'); continue; }
      for (const [k, s] of Object.entries(eq.symbols)) {
        const at = id + '.' + k;
        const srcs = ['c', 'v', 'o', 's', 'q', 'm', 'n'].filter((x) => s[x] !== undefined);
        if (srcs.length !== 1) bad.push(at + ': Quellen ' + srcs.join(','));
        if (!isExp && (s.v !== undefined || s.o !== undefined || s.s !== undefined)) bad.push(at + ': Verweis auf ein Experiment');
        if (s.c !== undefined && !E.has(M.C, s.c)) bad.push(at + ': Konstante ' + s.c);
        if (isExp && s.v !== undefined && !exp.vars[s.v]) bad.push(at + ': Eingabe ' + s.v);
        if (isExp && s.o !== undefined && !exp.forms.some((f) => f.c.outputs.some((o) => o.key === s.o))) bad.push(at + ': Ausgabe ' + s.o);
        if (isExp && s.s !== undefined && !(exp.symbols && exp.symbols[s.s])) bad.push(at + ': Symbol ' + s.s);
        for (const d of [s.q, s.dim]) if (d !== undefined) { try { E.dimParse(d); } catch (e) { bad.push(at + ': Dimension ' + d); } }
        // Ohne Experiment gibt es keinen Namen aus einer Eingabe oder Ausgabe
        if ((s.q !== undefined || s.m !== undefined || s.s !== undefined) && !I.with('de', () => s.name)) bad.push(at + ': Name fehlt');
        if (s.n !== undefined && !Number.isFinite(s.n)) bad.push(at + ': Zahl');
        if (s.m !== undefined && (typeof s.m !== 'string' || !s.tex)) bad.push(at + ': Funktion braucht Namen und tex');
        if ('value' in s) bad.push(at + ': eigener Zahlenwert – Konstanten kommen aus PP.model.C');
        if (!EQ_COLORS.includes(s.color)) bad.push(at + ': Farbe ' + s.color);
        if (s.c === undefined && s.v === undefined && s.o === undefined && !s.tex) bad.push(at + ': tex fehlt');
        for (const lang of ['de', 'en']) I.with(lang, () => {
          const texts = { tag: s.tag, role: s.role, meaning: s.c !== undefined ? PP.equations.meaning[s.c] : s.meaning };
          for (const [f, t] of Object.entries(texts)) {
            if (f === 'meaning' && s.n !== undefined && !t) continue; // reine Zahl: Bedeutung freiwillig
            if (typeof t !== 'string' || !t.trim()) bad.push(at + ': ' + f + ' fehlt (' + lang + ')');
            else if (f !== 'tag' && sentences(t) > 3) bad.push(at + ': ' + f + ' hat ' + sentences(t) + ' Sätze (' + lang + ')');
          }
        });
        if (s.live && s.live.c && !E.has(M.C, s.live.c)) bad.push(at + ': live ' + s.live.c);
        if (s.live && s.live.v && !exp.vars[s.live.v]) bad.push(at + ': live ' + s.live.v);
      }
    }
    ok(!bad.length, bad.slice(0, 4).join(' | '));
  });
  test('Interaktive Gleichungen', 'Grundlagen: Zu jedem Marker einer Kerngleichung gibt es ein Symbol und umgekehrt, auf Deutsch und Englisch', () => {
    for (const [id, q] of Object.entries(PP.equations.theory)) for (const lang of ['de', 'en']) I.with(lang, () => {
      const keys = new Set(xsKeys(q.tex)), sym = Object.keys(q.symbols);
      ok(sym.every((k) => keys.has(k)) && [...keys].every((k) => sym.includes(k)), id + ' (' + lang + '): Symbole und Marker passen nicht zusammen');
    });
  });
  test('UI (im Browser)', 'Grundlagen: Jede Kerngleichung steht in einem Abschnitt, jedes ihrer Symbole ist ein Knopf', () => {
    if (!PP.ui || !PP.ui.theory || typeof document === 'undefined') return;
    for (const lang of ['de', 'en']) I.with(lang, () => {
      const div = document.createElement('div');
      div.innerHTML = PP.ui.theory.sections.map((x) => x.body()).join('');
      for (const [id, q] of Object.entries(PP.equations.theory)) {
        const el = div.querySelector('[data-xq="' + id + '"]');
        ok(el, id + ' steht in keinem Abschnitt (' + lang + ')');
        const keys = new Set([...el.querySelectorAll('button[data-xs]')].map((b) => b.dataset.xs));
        ok(Object.keys(q.symbols).every((k) => keys.has(k)), id + ': nicht jedes Symbol ist ein Knopf (' + lang + ')');
      }
    });
  });
  test('UI (im Browser)', 'Grundlagen: Klick öffnet die schwebende Karte, × schließt sie, beim Abbau verschwindet sie', () => {
    if (!PP.ui || !PP.ui.eqx || typeof document === 'undefined') return;
    const U = PP.ui, box = document.createElement('div');
    box.innerHTML = U.eqx.inline('rel-gamma');
    document.body.appendChild(box);
    const down = U.eqx.bindFloat(box);
    try {
      const pop = () => document.getElementById('xpop');
      const c = box.querySelector('[data-xs="c"]');
      ok(pop() && pop().hidden, 'Karte fehlt oder ist schon offen');
      c.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      ok(!pop().hidden && pop().textContent.includes(M.C.c.name) && c.getAttribute('aria-expanded') === 'true', 'Klick auf c öffnet nicht');
      pop().querySelector('[data-xpclose]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      ok(pop().hidden && c.getAttribute('aria-expanded') === 'false', '× schließt nicht');
    } finally { down(); box.remove(); }
    ok(!document.getElementById('xpop'), 'Karte bleibt nach dem Abbau im Dokument');
  });
  test('UI (im Browser)', 'Interaktive Gleichung: Zeigen und Klick wählen ein Symbol samt Karte, × und Esc schließen sie', () => {
    if (!PP.ui || !PP.ui.eqx || typeof document === 'undefined') return;
    const U = PP.ui, S = U.S, keep = { exp: S.exp, form: S.form, xsel: S.xsel };
    try {
      const exp = M.byId.efe;
      S.exp = exp; S.form = exp.forms[0].id; S.xsel = {};
      const el = document.createElement('div');
      el.innerHTML = U.eqx.hero(exp, '');
      U.eqx.bind(el);
      const on = () => [...new Set([...el.querySelectorAll('[aria-pressed="true"]')].map((b) => b.dataset.xs))].join(',');
      const card = () => el.querySelector('#xr-card');
      ok(on() === 'Gmn' && /Einstein-Tensor/.test(card().textContent), 'Start: ' + on());
      el.querySelector('.big [data-xs="Lambda"]').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      ok(on() === 'Lambda' && card().textContent.includes(E.fmt(M.C.Lambda.value, 12)), 'Zeigen auf Λ: ' + on());
      el.querySelector('.xr-chip[data-xs="G"]').click();
      ok(on() === 'G' && card().textContent.includes(M.C.G.name) && /In dieser Gleichung/.test(card().textContent), 'Klick auf G: ' + on());
      el.querySelector('[data-xclose]').click();
      ok(on() === '' && card().querySelector('.xr-hint') && S.xsel.efe === null, '× schließt nicht');
      const b = el.querySelector('.big [data-xs="Tmn"]');
      b.click();
      ok(on() === 'Tmn', 'Klick auf T_μν: ' + on());
      ok(U.eqx.escape(el) && on() === '' && S.xsel.efe === null && !U.eqx.escape(el), 'Esc schließt nicht');
    } finally { S.exp = keep.exp; S.form = keep.form; S.xsel = keep.xsel; }
  });

  /* --- Graph: Schraffur je Größe, Gründe, Standardbereich --- */
  const issue = (r, re) => r.issues.find((i) => re.test(i.msg));
  test('Graph', 'Schraffur je Größe: „nach der Landung“ betrifft y(t) und x(t), aber nicht R und H', () => {
    const exp = M.byId.projectile, f = exp.forms[0];
    const r = run('projectile', { al: 10, t: 1 });
    const i = issue(r, /gelandet/);
    ok(i && i.why === 'nach der Landung', 'Warnung mit Grund fehlt');
    for (const k of ['R', 'H', 'tf', 'vx']) ok(!M.affects(f, i, k), k + ' sollte nicht betroffen sein');
    for (const k of ['x', 'y', 'vy']) ok(M.affects(f, i, k), k + ' sollte betroffen sein');
    const m = run('projectile', { v0: 100 });
    ok(M.affects(f, issue(m, /Luftwiderstand/), 'R'), 'Luftwiderstand betrifft alle Größen');
  });
  test('Graph', 'Schraffur je Größe: Die Kleinwinkelnäherung betrifft T₀, nicht die exakte Periodendauer T', () => {
    const f = M.byId.pendulum.forms[0], i = issue(run('pendulum', { th: 60 }), /Kleinwinkelnäherung sin θ/);
    ok(i, 'Warnung fehlt');
    ok(M.affects(f, i, 'T0') && M.affects(f, i, 'q') && !M.affects(f, i, 'T') && !M.affects(f, i, 'vmax'), 'falsche Zuordnung');
    const g0 = M.compute(M.byId.hawking, 'main', M.defaults(M.byId.hawking), { consts: { G: 0 } });
    const dz = g0.issues.find((j) => j.cat === 'math' && j.out === 'TH');
    ok(dz && M.affects(M.byId.hawking.forms[0], dz, 'TH') && !M.affects(M.byId.hawking.forms[0], dz, 'rs'), 'Engine-Fehler: nur T_H und davon abhängige Größen');
  });
  test('Graph', 'Jede Modellgrenze aus einem Check hat einen kurzen Grund, auf Englisch ohne deutsche Reste', () => {
    const bad = [];
    const german = /[äöüÄÖÜß]|\b(und|der|die|das|nicht|mit|unter|nach|Grenze)\b/;
    for (const exp of M.registry) {
      const cases = [{}].concat((exp.presets || []).map((p) => p.values), [{ t: 60 }, { al: 5, t: 1 }, { th: 120 }, { T: 20 }, { T: 5e4 }, { h0: 2e5 }, { r: 1e-6 }, { M: 1e-7 }, { v0: 9000 }, { x: 0.4 }]);
      for (const c of cases) for (const f of exp.forms) {
        const v = Object.assign(M.defaults(exp), c);
        for (const lang of ['de', 'en']) I.with(lang, () => M.compute(exp, f.id, v).issues).forEach((i) => {
          if (!['math', 'unreal', 'model'].includes(i.cat) || i.out) return;
          if (!i.why) bad.push(exp.id + ': ohne Grund – ' + i.msg.slice(0, 50));
          else if (lang === 'en' && german.test(i.why)) bad.push(exp.id + ': ' + i.why);
        });
      }
    }
    ok(!bad.length, [...new Set(bad)].slice(0, 4).join(' | '));
  });
  test('Graph', 'Standardbereich: verweist auf vorhandene Ausgaben und liegt im Regler-Bereich; freier Fall endet kurz nach dem Aufprall', () => {
    for (const exp of M.registry) for (const f of exp.forms) {
      const gc = M.graphOf(exp, f.id), gv = gc && gc.view;
      if (!gv) continue;
      const xv = exp.vars[gc.x];
      ok(f.c.vars.some((v) => v.key === gc.x), exp.id + ' (' + f.id + '): x = ' + gc.x);
      if (gv.to) ok(f.c.outputs.some((o) => o.key === gv.to), exp.id + ' (' + f.id + '): ' + gv.to);
      if (gv.range) ok(gv.range[0] >= xv.min && gv.range[1] <= xv.max && gv.range[0] < gv.range[1], exp.id + ': ' + gv.range);
    }
    const tf = val(run('free-fall'), 'tf'), gv = M.byId['free-fall'].graph.view;
    ok(tf * gv.f < M.byId['free-fall'].vars.t.max / 2, 'Standardbereich des freien Falls ist kaum kürzer als der Regler-Bereich');
  });
  test('Formatierung', 'Formelsatz: tfrac12 ist der Bruch ½, frac{12}{3} bleibt zweistellig, circ und ddot werden gesetzt, {,} ist ein Dezimalkomma ohne Abstand', () => {
    if (!PP.tex) return;
    const r = PP.tex.render, R = String.raw;
    ok(/<span class="mnu"><span class="mn">1<\/span><\/span><span class="mde"><span class="mn">2<\/span><\/span>/.test(r(R`h_0 - \tfrac12\, g t^2`)), '½ falsch gesetzt');
    ok(/<span class="mnu"><span class="mn">12<\/span><\/span>/.test(r(R`\frac{12}{3}`)), '12/3 falsch gesetzt');
    ok(!/circ|ddot/.test(r(R`\ddot\theta = 45^{\circ}`).replace(/<[^>]+>/g, '')), 'Befehlsname im Text');
    ok(r(R`0{,}646`).includes('<span class="mn">0</span><span class="mn">,</span><span class="mn">646</span>') && r('f(a, b)').includes('<span class="mp">,</span>'), 'Dezimalkomma');
  });

  test('Sprache', 'Engine-Meldungen und Dimensionsnamen gibt es auf Deutsch und Englisch', () => {
    const msg = () => E.evaluate(E.parse('1/0'), {}).issues[0].msg;
    ok(/Division durch 0/.test(I.with('de', msg)), I.with('de', msg));
    ok(/Division by 0/.test(I.with('en', msg)), I.with('en', msg));
    const force = () => E.dimInfo(D('M L T^-2')).name;
    ok(I.with('de', force) === 'Kraft' && I.with('en', force) === 'force', 'Dimensionsname');
    ok(I.with('en', () => E.BASE_NAMES[1]) === 'length', 'Basisgröße');
  });
  test('Sprache', 'Umschalten wirkt auch auf die kompilierten Kopien der Experimente', () => {
    const f = M.byId['newton-gravity'].forms[0];
    ok(I.with('de', () => f.c.outputs[0].name) === 'Gravitationskraft (Betrag)', 'de');
    ok(I.with('en', () => f.c.outputs[0].name) === 'Gravitational force (magnitude)', 'en');
    ok(I.with('en', () => f.c.equations[0].label) === 'Newton’s law of gravitation', 'Gleichung');
    ok(I.with('en', () => M.byId.hawking.forms[0].c.autoEq[0].label) === 'Hawking temperature', 'autoEq');
  });
  test('Sprache', 'Keine deutschen Reste in den englischen Texten der Experimente und Konstanten', () => {
    // „ und Umlaute verraten deutsche Texte; Eigennamen dürfen sie behalten
    const german = /[„äöüÄÖÜß]/, names = /Schrödinger|Eötvös|Göttingen|Hackermüller/g;
    const skip = new Set(['ast', 'lhs', 'rhs', 'symDims', 'dimv', 'values', 'checks']);
    const bad = [], seen = new WeakSet();
    const walk = (o, path) => {
      if (!o || typeof o !== 'object' || seen.has(o)) return;
      seen.add(o);
      for (const k of Object.keys(o)) {
        if (skip.has(k)) continue;
        const v = o[k];
        if (typeof v === 'string') { if (german.test(v.replace(names, ''))) bad.push(path + '.' + k + ': ' + v.slice(0, 60)); }
        else walk(v, path + '.' + k);
      }
    };
    I.with('en', () => { M.registry.forEach((e) => walk(e, e.id)); walk(M.C, 'C'); walk(M.KIND_LABEL, 'KIND_LABEL'); if (PP.equations) walk(PP.equations, 'equations'); });
    ok(!bad.length, bad.slice(0, 3).join(' | '));
  });
  test('Sprache', 'Keine deutschen Reste in den englischen Beschriftungen der Visualisierungen', () => {
    if (!PP.viz) return;
    const german = /[„äöüÄÖÜß]|\b(und|der|die|das|nicht|mit|ist|bei|oder|Abstand|Bezug|Zeit|Kraft|Anzeige|Punkte)\b/;
    const bad = [];
    I.with('en', () => {
      for (const exp of M.registry) {
        if (!exp.viz) continue;
        for (const c of [{}].concat((exp.presets || []).map((p) => ({ vals: p.values, form: p.form })))) for (const W of [640, 360]) for (const opts of optSets(exp)) {
          draw(exp.id, c.vals, { form: c.form, W, base: c.vals, opts }).forEach((x) => { if (german.test(x)) bad.push(exp.id + ': ' + x); });
        }
      }
      draw('special-rel', { beta: 1 }).concat(draw('free-fall', { t: 9 }), draw('schroedinger', { n: 2.5 })).forEach((x) => { if (german.test(x)) bad.push(x); });
    });
    ok(!bad.length, [...new Set(bad)].slice(0, 3).join(' | '));
  });
  test('Sprache', 'Jeder Test hat einen englischen Namen', () => {
    const has = (k) => Object.prototype.hasOwnProperty.call(EN, k);
    const missing = T.map((t) => I.with('de', () => [t.group, t.name])).filter(([g, n]) => !has(g) || !has(n)).map(([, n]) => n);
    ok(!missing.length, missing.join(' | '));
  });

  // Die Prüfungen laufen auf Deutsch (sie vergleichen deutsche Meldungen); Namen erscheinen in der aktiven Sprache
  function runAll() {
    const errs = I.with('de', () => T.map((t) => { try { t.fn(); return null; } catch (e) { return e.message; } }));
    return T.map((t, i) => ({ group: t.group, name: t.name, pass: errs[i] === null, err: errs[i] || undefined }));
  }
  PP.tests = { list: T, runAll };
})(globalThis.PP = globalThis.PP || {});
