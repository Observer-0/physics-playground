/* =====================================================================
   Physics Playground — „Probier mal“: kleine Aufgaben je Experiment
   done(x) prüft den aktuellen Zustand mit denselben Zahlen wie die Anzeige:
     x.v        Eingabewerte           x.o(key)   Ergebnis der Engine
     x.ob(key)  Ergebnis beim Bezug (Preset bzw. Ausgangswert)
     x.b        Eingabewerte des Bezugs  x.C / x.C0  Konstanten (ggf. verstellt) / Originalwerte
     x.cats     Warnkategorien der Engine  x.form, x.opts (Einstellungen der Visualisierung)
   demo: ein Zustand, der die Aufgabe löst. Die Tests rechnen ihn nach, damit jede
   Aufgabe mit den regulären Reglern lösbar bleibt.
   ===================================================================== */
(function (PP) {
  'use strict';
  const I = PP.i18n, M = PP.model, C = M.C;
  const near = (a, b, rel) => isFinite(a) && isFinite(b) && b !== 0 && Math.abs(a / b - 1) <= rel;
  const dex = (a, b, d) => a > 0 && b > 0 && Math.abs(Math.log10(a / b)) <= d;
  const same = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
  const MS = C.M_sun.value;

  const TASKS = {
    'newton-gravity': [
      { q: { de: 'Mach die Kraft 100-mal so groß – nur mit dem Abstand.', en: 'Make the force 100 times larger – using only the distance.' },
        hint: { de: 'F ∝ 1/r²: Welcher Faktor im Abstand ergibt im Quadrat 100?', en: 'F ∝ 1/r²: which factor in the distance gives 100 when squared?' },
        done: (x) => x.b && same(x.v.m1, x.b.m1) && same(x.v.m2, x.b.m2) && dex(x.o('F') / x.ob('F'), 100, 0.01),
        demo: { base: { m1: 1, m2: 1, r: 1 }, vals: { m1: 1, m2: 1, r: 0.1 } } },
      { q: { de: 'Finde einen Zustand, in dem Newtons Gesetz laut Engine nicht mehr gilt.', en: 'Find a state in which, according to the engine, Newton’s law no longer holds.' },
        hint: { de: 'Sehr kleine Abstände – oder zwei Schwarze Löcher kurz vor der Verschmelzung.', en: 'Very small distances – or two black holes just before merging.' },
        done: (x) => x.cats.has('model'),
        demo: { vals: { r: 1e-5 } } },
      { q: { de: 'Erde und Apfel: Welche Apfelmasse ergibt an der Erdoberfläche genau 1 N?', en: 'Earth and apple: which apple mass gives exactly 1 N at the Earth’s surface?' },
        hint: { de: 'Preset „Erde – Apfel“ wählen, dann nur m₂ ändern. F ist proportional zu m₂.', en: 'Choose the preset “Earth – apple”, then change only m₂. F is proportional to m₂.' },
        done: (x) => near(x.v.m1, C.M_earth.value, 1e-3) && near(x.v.r, C.R_earth.value, 1e-3) && near(x.o('F'), 1, 0.01),
        demo: { vals: { m1: C.M_earth.value, m2: 0.1018, r: C.R_earth.value } } },
    ],
    kinematics: [
      { q: { de: 'Ein Auto fährt mit v₀ = 20 m/s. Mit welcher Beschleunigung steht es nach genau 4 s?', en: 'A car travels at v₀ = 20 m/s. With what acceleration does it come to rest after exactly 4 s?' },
        hint: { de: 'v = v₀ + a·t soll 0 werden.', en: 'v = v₀ + a·t should become 0.' },
        done: (x) => near(x.v.v0, 20, 0.02) && near(x.v.t, 4, 0.02) && Math.abs(x.o('v')) < 0.1,
        demo: { vals: { v0: 20, a: -5, t: 4 } } },
      { q: { de: 'Lass den Körper mit positiver Anfangsgeschwindigkeit zum Start zurückkehren (Δs = 0 nach t > 0).', en: 'Starting with a positive initial velocity, make the body return to where it started (Δs = 0 after t > 0).' },
        hint: { de: 'a muss gegen v₀ wirken. Δs = v₀t + ½at² ist null für t = −2v₀/a.', en: 'a has to act against v₀. Δs = v₀t + ½at² is zero for t = −2v₀/a.' },
        done: (x) => x.v.v0 > 0 && x.v.t > 0.5 && Math.abs(x.o('ds')) < 0.5,
        demo: { vals: { s0: 0, v0: 10, a: -5, t: 4 } } },
    ],
    'free-fall': [
      { q: { de: 'Aus welcher Höhe dauert der Fall auf der Erde genau 3 s?', en: 'From what height does a fall on Earth take exactly 3 s?' },
        hint: { de: 't_Fall = √(2h₀/g). Tipp: Die Zahl lässt sich auch direkt eintippen.', en: 't_fall = √(2h₀/g). Tip: you can also type the number in directly.' },
        done: (x) => near(x.v.g, C.g_n.value, 1e-3) && near(x.o('tf'), 3, 0.005),
        demo: { vals: { h0: 44.13, g: C.g_n.value } } },
      { q: { de: 'Stell g so ein, dass ein Körper aus 100 m mit genau 20 m/s aufschlägt.', en: 'Set g so that a body dropped from 100 m hits the ground at exactly 20 m/s.' },
        hint: { de: 'v_Aufprall = √(2gh₀), also g = v²/(2h₀).', en: 'v_impact = √(2gh₀), so g = v²/(2h₀).' },
        done: (x) => near(x.v.h0, 100, 1e-3) && near(x.o('vi'), 20, 0.0075),
        demo: { vals: { h0: 100, g: 2 } } },
    ],
    spring: [
      { q: { de: 'Verdopple die Periodendauer – nur mit der Masse.', en: 'Double the period – using only the mass.' },
        hint: { de: 'T ∝ √m: Um welchen Faktor muss m wachsen?', en: 'T ∝ √m: by what factor does m have to grow?' },
        done: (x) => x.b && same(x.v.k, x.b.k) && near(x.o('T') / x.ob('T'), 2, 0.02),
        demo: { base: { k: 50, m: 1, x: 0.1 }, vals: { k: 50, m: 4, x: 0.1 } } },
      { q: { de: 'Ändere nur die Auslenkung x. Was passiert mit der Periodendauer?', en: 'Change only the displacement x. What happens to the period?' },
        hint: { de: 'Achte auf T im Ergebnis – und auf F und E.', en: 'Watch T in the result – and F and E.' },
        done: (x) => x.b && same(x.v.k, x.b.k) && same(x.v.m, x.b.m) && Math.abs(x.v.x - x.b.x) > 0.05 && near(x.o('T'), x.ob('T'), 1e-9),
        demo: { base: { k: 50, m: 1, x: 0.1 }, vals: { k: 50, m: 1, x: 0.3 } } },
    ],
    circular: [
      { q: { de: 'Erzeuge auf einer Bahn mit r = 5 m genau 1 g Zentripetalbeschleunigung.', en: 'Produce exactly 1 g of centripetal acceleration on a path with r = 5 m.' },
        hint: { de: 'a = v²/r = g_n, also v = √(g_n r).', en: 'a = v²/r = g_n, so v = √(g_n r).' },
        done: (x) => near(x.v.r, 5, 1e-3) && near(x.o('ag'), 1, 0.02),
        demo: { vals: { v: 7, r: 5, m: 1 } } },
      { q: { de: 'Verdopple die Geschwindigkeit bei gleichem Radius. Um welchen Faktor wächst a?', en: 'Double the speed at the same radius. By what factor does a grow?' },
        hint: { de: 'Die Faktoren stehen im Bild neben den Werten.', en: 'The factors are shown in the picture next to the values.' },
        done: (x) => x.b && same(x.v.r, x.b.r) && near(x.v.v / x.b.v, 2, 0.02),
        demo: { base: { v: 10, r: 5, m: 1 }, vals: { v: 20, r: 5, m: 1 } } },
    ],
    pendulum: [
      { q: { de: 'Ab welcher Amplitude liegt die Kleinwinkelnäherung um 1 % daneben?', en: 'From what amplitude is the small-angle approximation off by 1 %?' },
        hint: { de: 'Den Winkel langsam erhöhen und auf den Fehler achten – oder im Graphen, wo die Schraffur beginnt.', en: 'Increase the angle slowly and watch the error – or look where the hatching starts in the graph.' },
        done: (x) => x.o('err') >= 1 && x.o('err') < 1.3,
        demo: { vals: { th: 24 } } },
      { q: { de: 'Lass das Pendel waagerecht los (90°). Um wie viel Prozent dauert eine Schwingung länger als die Näherung sagt?', en: 'Release the pendulum horizontally (90°). By what percentage does one swing take longer than the approximation says?' },
        hint: { de: 'Schau auf T/T₀ im Ergebnis.', en: 'Look at T/T₀ in the result.' },
        done: (x) => near(x.v.th, 90, 0.005),
        demo: { vals: { th: 90 } } },
      { q: { de: 'Bau ein Sekundenpendel: Bei kleiner Amplitude (≤ 5°) soll T genau 2 s dauern.', en: 'Build a seconds pendulum: at a small amplitude (≤ 5°), T should be exactly 2 s.' },
        hint: { de: 'T₀ = 2π√(L/g), also L = g·(T/2π)².', en: 'T₀ = 2π√(L/g), so L = g·(T/2π)².' },
        done: (x) => Math.abs(x.v.th) <= 5 && near(x.v.g, C.g_n.value, 1e-3) && near(x.o('T'), 2, 0.002),
        demo: { vals: { L: 0.9935, th: 3, g: C.g_n.value } } },
    ],
    projectile: [
      { q: { de: 'Finde den Winkel mit der größten Weite.', en: 'Find the angle with the greatest range.' },
        hint: { de: 'Der Graph zeigt R über α.', en: 'The graph shows R against α.' },
        done: (x) => Math.abs(x.v.al - 45) < 0.3,
        demo: { vals: { al: 45 } } },
      { q: { de: 'Finde einen zweiten Winkel, der genauso weit fliegt wie 30°.', en: 'Find a second angle that flies exactly as far as 30°.' },
        hint: { de: 'sin 2α hat für α und 90° − α denselben Wert.', en: 'sin 2α has the same value for α and 90° − α.' },
        done: (x) => Math.abs(x.v.al - 60) < 0.3,
        demo: { vals: { al: 60 } } },
      { q: { de: 'Wie hoch fliegt ein Ball, den man mit 20 m/s senkrecht nach oben wirft?', en: 'How high does a ball go if you throw it straight up at 20 m/s?' },
        hint: { de: 'Senkrecht heißt α = 90°. Die Scheitelhöhe steht als H im Ergebnis.', en: 'Straight up means α = 90°. The maximum height is H in the result.' },
        done: (x) => near(x.v.al, 90, 1e-3) && near(x.v.v0, 20, 0.01) && near(x.v.g, C.g_n.value, 1e-3),
        demo: { vals: { v0: 20, al: 90, g: C.g_n.value } } },
    ],
    'ideal-gas': [
      { q: { de: 'Verdopple die Temperatur bei gleichem Volumen. Was passiert mit dem Druck?', en: 'Double the temperature at constant volume. What happens to the pressure?' },
        hint: { de: 'Die Faktorzeile im Bild zeigt, welcher Faktor wie viel beiträgt.', en: 'The factor line in the picture shows how much each factor contributes.' },
        done: (x) => x.b && same(x.v.V, x.b.V) && same(x.v.N, x.b.N) && near(x.v.T / x.b.T, 2, 0.02),
        demo: { base: {}, vals: { T: 546.3 } } },
      { q: { de: 'Halbiere das Volumen bei gleicher Temperatur (Boyle-Mariotte).', en: 'Halve the volume at constant temperature (Boyle–Mariotte).' },
        hint: { de: 'p ∝ 1/V.', en: 'p ∝ 1/V.' },
        done: (x) => x.b && same(x.v.T, x.b.T) && same(x.v.N, x.b.N) && near(x.v.V / x.b.V, 0.5, 0.02),
        demo: { base: {}, vals: { V: 0.011207 } } },
      { q: { de: 'Bei welcher Temperatur ist die thermische Energie k_B T genau 1 eV?', en: 'At what temperature is the thermal energy k_B T exactly 1 eV?' },
        hint: { de: '1 K entspricht 8,617 × 10⁻⁵ eV.', en: '1 K corresponds to 8.617 × 10⁻⁵ eV.' },
        done: (x) => near(x.o('kT') / C.eV.value, 1, 0.01),
        demo: { vals: { T: 11604.5 } } },
      { q: { de: 'Kühle das Gas so weit ab, bis die Engine meldet, dass das Modell nicht mehr gilt.', en: 'Cool the gas until the engine reports that the model no longer applies.' },
        hint: { de: 'Achte auf den Physikalischen Status.', en: 'Watch the physical status.' },
        done: (x) => x.cats.has('model') && x.v.T < 273.15,
        demo: { vals: { T: 80 } } },
    ],
    'special-rel': [
      { q: { de: 'Bei welcher Geschwindigkeit geht eine bewegte Uhr nur halb so schnell (γ = 2)?', en: 'At what speed does a moving clock run at only half the rate (γ = 2)?' },
        hint: { de: 'γ = 1/√(1 − β²) = 2 ergibt β = √3/2.', en: 'γ = 1/√(1 − β²) = 2 gives β = √3/2.' },
        done: (x) => near(x.o('gamma'), 2, 0.005),
        demo: { vals: { beta: 0.866 } } },
      { q: { de: 'Gib β = 1 ein. Was sagt die Engine – und was zeigt das Bild?', en: 'Enter β = 1. What does the engine say – and what does the picture show?' },
        hint: { de: 'Die Zahl lässt sich direkt ins Eingabefeld tippen.', en: 'You can type the number straight into the input field.' },
        done: (x) => x.cats.has('math'),
        demo: { vals: { beta: 1 } } },
    ],
    hawking: [
      { q: { de: 'Finde die Masse, bei der T_H so warm ist wie die kosmische Hintergrundstrahlung (2,7 K).', en: 'Find the mass at which T_H is as warm as the cosmic microwave background (2.7 K).' },
        hint: { de: 'T_H ∝ 1/M. Eine Sonnenmasse ergibt etwa 6 × 10⁻⁸ K – um welchen Faktor muss M kleiner werden?', en: 'T_H ∝ 1/M. One solar mass gives about 6 × 10⁻⁸ K – by what factor does M have to shrink?' },
        done: (x) => dex(x.o('TH'), C.T_cmb.value, 0.02),
        demo: { vals: { M: 4.5e22 } } },
      { q: { de: 'Welches Loch würde nach grober Abschätzung genau im Alter des Universums (≈ 1,38 × 10¹⁰ Jahre) verdampfen?', en: 'Which hole would, by the rough estimate, evaporate in exactly the age of the universe (≈ 1.38 × 10¹⁰ years)?' },
        hint: { de: 't_evap ∝ M³ – kleine Änderungen von M wirken dreifach.', en: 't_evap ∝ M³ – small changes in M count three times over.' },
        done: (x) => dex(x.o('tevy'), 1.38e10, 0.05),
        demo: { vals: { M: 1.73e11 } } },
    ],
    'bh-entropy': [
      { q: { de: 'Verdopple die Masse. Um welchen Faktor wächst die Entropie?', en: 'Double the mass. By what factor does the entropy grow?' },
        hint: { de: 'S ∝ A ∝ r_s² ∝ M².', en: 'S ∝ A ∝ r_s² ∝ M².' },
        done: (x) => x.form === 'mass' && x.b && near(x.v.M / x.b.M, 2, 0.02),
        demo: { form: 'mass', base: { M: MS }, vals: { M: 2 * MS } } },
      { q: { de: 'Welche Masse hat ein Schwarzes Loch, dessen Horizont so groß ist wie ein Fußballfeld (≈ 7140 m²)?', en: 'What is the mass of a black hole whose horizon is as large as a football pitch (≈ 7140 m²)?' },
        hint: { de: 'A = 4π r_s² und r_s = 2GM/c². Ergebnis: einige Jupitermassen.', en: 'A = 4π r_s² and r_s = 2GM/c². Result: a few Jupiter masses.' },
        done: (x) => x.form === 'mass' && dex(x.o('A'), 7140, 0.02),
        demo: { form: 'mass', vals: { M: 1.605e28 } } },
    ],
    efe: [
      { q: { de: 'Bei welcher Energiedichte ist die Krümmungsskala ℓ genau so groß wie die Erdbahn (1 au)?', en: 'At what energy density is the curvature scale ℓ exactly as large as the Earth’s orbit (1 au)?' },
        hint: { de: 'Wasser liegt bei ℓ ≈ 1,5 au. ℓ ∝ 1/√u.', en: 'Water gives ℓ ≈ 1.5 au. ℓ ∝ 1/√u.' },
        done: (x) => dex(x.o('Lc'), C.au.value, 0.02),
        demo: { vals: { u: 2.15e20 } } },
      { q: { de: 'Wann krümmt Materie den Raum so schwach wie die kosmologische Konstante (K/Λ = 1)?', en: 'When does matter curve space as weakly as the cosmological constant does (K/Λ = 1)?' },
        hint: { de: 'K = κu. Gesucht ist u = Λ/κ – weit unter der Dichte von interstellarem Gas.', en: 'K = κu. You are looking for u = Λ/κ – far below the density of interstellar gas.' },
        done: (x) => dex(x.o('KL'), 1, 0.05),
        demo: { vals: { u: 5.3e-10 } } },
    ],
    schroedinger: [
      { q: { de: 'Wie breit muss der Kasten sein, damit ein Elektron im Grundzustand genau 1 eV hat?', en: 'How wide must the box be for an electron in the ground state to have exactly 1 eV?' },
        hint: { de: 'E₁ ∝ 1/L². Bei 1 nm sind es 0,376 eV.', en: 'E₁ ∝ 1/L². At 1 nm it is 0.376 eV.' },
        done: (x) => near(x.v.m, C.m_e.value, 1e-3) && x.v.n === 1 && near(x.o('E') / C.eV.value, 1, 0.02),
        demo: { vals: { m: C.m_e.value, L: 6.132e-10, n: 1 } } },
      { q: { de: 'Schalte die Überlagerung ein: Warum bewegt sich |ψ|² jetzt?', en: 'Switch on the superposition: why does |ψ|² move now?' },
        hint: { de: 'Zwei Energien, zwei Phasengeschwindigkeiten – sie laufen gegeneinander.', en: 'Two energies, two phase speeds – they drift against each other.' },
        done: (x) => !!x.opts.superpos,
        demo: { opts: { superpos: true } } },
      { q: { de: 'Mach den Kasten so eng, dass die nichtrelativistische Rechnung laut Engine nicht mehr reicht.', en: 'Make the box so narrow that, according to the engine, the non-relativistic calculation is no longer enough.' },
        hint: { de: 'Es kommt auf E_n/(mc²) an – ab 1 % meldet die Engine eine Modellgrenze.', en: 'What matters is E_n/(mc²) – from 1 % on, the engine reports a model limit.' },
        done: (x) => x.cats.has('model'),
        demo: { vals: { L: 1e-12 } } },
    ],
    planck: [
      { q: { de: 'Schalte „Break the Physics“ ein und verdopple G. Um welchen Faktor wächst l_P?', en: 'Switch on “Break the Physics” and double G. By what factor does l_P grow?' },
        hint: { de: 'l_P ∝ √G.', en: 'l_P ∝ √G.' },
        done: (x) => near(x.C.G / x.C0.G, 2, 0.01),
        demo: { consts: { G: 2 * C.G.value } } },
      { q: { de: 'Wechsle in der Visualisierung auf „Temperatur“: Wie viele Größenordnungen fehlen vom heißesten Labor bis T_P?', en: 'Switch the visualisation to “Temperature”: how many orders of magnitude are missing from the hottest lab to T_P?' },
        hint: { de: 'Die rote Beschriftung über der Skala sagt es.', en: 'The red label above the scale tells you.' },
        done: (x) => x.opts.q === 'T',
        demo: { opts: { q: 'T' } } },
    ],
  };
  for (const id in TASKS) if (M.byId[id]) M.byId[id].tasks = I.localize(TASKS[id]);
  PP.tasks = { ids: Object.keys(TASKS) };
})(globalThis.PP = globalThis.PP || {});
