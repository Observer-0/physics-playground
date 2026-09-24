/* =====================================================================
   Physics Playground — Experiment definitions (pure data + checks)
   Every experiment — ordinary or "famous" — uses the same structure:
   vars → outputs (formulas) → equations (dimension analysis) → checks
   → presets → graph defaults → visualization → explanation.
   ===================================================================== */
(function (PP) {
  'use strict';
  const { define, C } = PP.model;
  const MS = C.M_sun.value;

  /* ============================ MECHANIK ============================ */

  define({
    id: 'newton-gravity', group: 'Mechanik', title: 'Newtonsche Gravitation', short: 'Gravitation',
    tex: 'F = G\\,\\frac{m_1\\, m_2}{r^2}',
    vars: {
      G:  { label: 'G', tex: 'G', name: 'Gravitationskonstante', dim: 'L^3 M^-1 T^-2', constant: 'G', min: 1e-15, max: 1e-3, scale: 'log' },
      m1: { label: 'm₁', tex: 'm_1', name: 'Masse 1', dim: 'M', default: 1, min: 1e-3, max: 1e42, scale: 'log', positive: true, negNote: 'Negative Masse ist eine rein hypothetische Idee – beobachtet wurde sie nie.' },
      m2: { label: 'm₂', tex: 'm_2', name: 'Masse 2', dim: 'M', default: 1, min: 1e-3, max: 1e42, scale: 'log', positive: true, negNote: 'Negative Masse ist eine rein hypothetische Idee – beobachtet wurde sie nie.' },
      r:  { label: 'r', tex: 'r', name: 'Abstand der Schwerpunkte', dim: 'L', default: 1, min: 1e-6, max: 1e14, scale: 'log', positive: true, negNote: 'Ein Abstand ist nie negativ. Weil r quadriert wird, liefert die Formel für r < 0 trotzdem eine Zahl.' },
    },
    outputs: [
      { key: 'F', sym: 'F', tex: 'F', name: 'Gravitationskraft (Betrag)', expr: 'G*m1*m2/r^2', dim: 'M L T^-2', primary: true },
      { key: 'a1', sym: 'a₁', tex: 'a_1', name: 'Beschleunigung von m₁', expr: 'G*m2/r^2', dim: 'L T^-2' },
      { key: 'a2', sym: 'a₂', tex: 'a_2', name: 'Beschleunigung von m₂', expr: 'G*m1/r^2', dim: 'L T^-2' },
      { key: 'U', sym: 'U', tex: 'U', name: 'Potentielle Energie', expr: '-G*m1*m2/r', dim: 'M L^2 T^-2' },
      { key: 'rs', sym: 'r_s', tex: 'r_{\\mathrm{s}}', name: 'Schwarzschild-Radius von m₁+m₂ (Modellcheck)', expr: '2*G*(m1+m2)/c^2', dim: 'L' },
    ],
    equations: [
      { label: 'Newtonsches Gravitationsgesetz', eq: 'F = G*m1*m2/r^2' },
      { label: 'Potentielle Energie', eq: 'U = -G*m1*m2/r' },
    ],
    symbols: {},
    checks({ v, o, issues, fmt }) {
      const rs = o('rs');
      if (v.r > 0 && isFinite(rs) && rs > 0) {
        const q = rs / v.r;
        if (q >= 1) issues.push({ cat: 'model', msg: 'r liegt innerhalb des Schwarzschild-Radius der Gesamtmasse (r_s ≈ ' + fmt(rs, 3) + ' m). Das Newton-Bild verliert hier jede Bedeutung.' });
        else if (q > 0.01) issues.push({ cat: 'model', msg: 'r ist nur ' + fmt(1 / q, 3) + ' r_s: starkes Gravitationsfeld – hier braucht es die Allgemeine Relativitätstheorie.' });
        else if (q > 1e-9) issues.push({ cat: 'info', msg: 'Schwachfeld-Parameter r_s/r ≈ ' + fmt(q, 2) + ': relativistische Korrekturen sind klein, aber je nach Präzision messbar (vgl. Periheldrehung des Merkur).' });
      }
      if (v.r > 0 && v.r < 5e-5) issues.push({ cat: 'model', msg: 'Das 1/r²-Gesetz ist experimentell nur bis hinunter zu etwa 50 µm getestet (Torsionswaagen). Darunter ist das eine Extrapolation.' });
      issues.push({ cat: 'assume', msg: 'Punktmassen oder kugelsymmetrische Körper; r ist der Abstand der Schwerpunkte.' });
    },
    presets: [
      { name: 'Zwei 1-kg-Massen', values: { m1: 1, m2: 1, r: 1 } },
      { name: 'Erde – Apfel', note: 'Apfel 0,1 kg an der Erdoberfläche (r = mittlerer Erdradius)', values: { m1: C.M_earth.value, m2: 0.1, r: C.R_earth.value } },
      { name: 'Erde – Mond', note: 'mittlere Entfernung (große Halbachse), Werte ≈', values: { m1: C.M_earth.value, m2: C.M_moon.value, r: C.d_moon.value } },
      { name: 'Sonne – Erde', note: 'r = 1 au (≈ mittlere Entfernung)', values: { m1: MS, m2: C.M_earth.value, r: C.au.value } },
      { name: 'Zwei Schwarze Löcher', note: 'GW150914-ähnliche Massen (≈36 und ≈29 M☉), r = 350 km illustrativ kurz vor der Verschmelzung – hier versagt Newton bewusst', values: { m1: 36 * MS, m2: 29 * MS, r: 3.5e5 } },
    ],
    graph: { x: 'r', y: 'F' },
    viz: 'gravity',
    explain: {
      intuition: 'Zwei Massen ziehen sich an. Doppelte Masse bedeutet doppelte Kraft, doppelter Abstand nur noch ein Viertel der Kraft. Die Kraft wirkt auf beide Körper gleich stark, aber der leichtere wird viel stärker beschleunigt.',
      math: [
        { t: 'Kraftgesetz', tex: 'F = G\\,\\frac{m_1 m_2}{r^2}' },
        { t: 'Nach r umgestellt', tex: 'r = \\sqrt{\\frac{G\\, m_1 m_2}{F}}' },
        { t: 'Skalierung: Abstand ×k', tex: 'F(k\\,r) = \\frac{F(r)}{k^2}' },
        { t: 'Beschleunigung von m₁ (m₁ kürzt sich)', tex: 'a_1 = \\frac{F}{m_1} = \\frac{G\\,m_2}{r^2}' },
      ],
      physics: 'Newtons Gesetz ist ein Modell der klassischen Mechanik. Es beschreibt Gravitation als instantane Fernwirkung zwischen Massen. Die Allgemeine Relativitätstheorie ersetzt das durch gekrümmte Raumzeit; Newton ist ihr Grenzfall für schwache Felder (r ≫ r_s) und kleine Geschwindigkeiten (v ≪ c). Außerhalb davon – nahe Schwarzer Löcher, bei Neutronensternen oder für Lichtablenkung – liefert Newton falsche Ergebnisse.',
      epistemics: [
        { type: 'math', text: 'F ∝ m₁m₂/r² ist eine mathematische Funktion; sie ist für r = 0 undefiniert.' },
        { type: 'model', text: 'Klassisches Gravitationsmodell (Newton, 1687).' },
        { type: 'approx', text: 'Schwachfeld- und Langsamkeitsgrenzfall der Allgemeinen Relativitätstheorie.' },
        { type: 'measured', text: 'G ist gemessen (CODATA 2022: 6,67430(15) × 10⁻¹¹ m³ kg⁻¹ s⁻², relative Unsicherheit 2,2 × 10⁻⁵ – eine der am ungenauesten bekannten Konstanten).' },
        { type: 'assume', text: 'Punktmassen bzw. kugelsymmetrische Massenverteilungen (Schalentheorem).' },
      ],
    },
  });

  define({
    id: 'kinematics', group: 'Mechanik', title: 'Gleichmäßig beschleunigte Bewegung', short: 'Kinematik',
    tex: 's(t) = s_0 + v_0\\,t + \\tfrac12\\,a\\,t^2',
    vars: {
      s0: { label: 's₀', tex: 's_0', name: 'Startposition', dim: 'L', default: 0, min: -100, max: 100, scale: 'lin' },
      v0: { label: 'v₀', tex: 'v_0', name: 'Anfangsgeschwindigkeit', dim: 'L T^-1', default: 5, min: -50, max: 50, scale: 'lin' },
      a:  { label: 'a', tex: 'a', name: 'Beschleunigung (konstant)', dim: 'L T^-2', default: 2, min: -20, max: 20, scale: 'lin' },
      t:  { label: 't', tex: 't', name: 'Zeit', dim: 'T', default: 3, min: 0, max: 20, scale: 'lin', time: true },
    },
    outputs: [
      { key: 's', sym: 's', tex: 's', name: 'Position', expr: 's0 + v0*t + 0.5*a*t^2', dim: 'L', primary: true },
      { key: 'v', sym: 'v', tex: 'v', name: 'Geschwindigkeit', expr: 'v0 + a*t', dim: 'L T^-1' },
      { key: 'ds', sym: 'Δs', tex: '\\Delta s', name: 'Verschiebung seit t = 0', expr: 'v0*t + 0.5*a*t^2', dim: 'L' },
    ],
    equations: [
      { label: 'Ort-Zeit-Gesetz', eq: 's = s0 + v0*t + 0.5*a*t^2' },
      { label: 'Geschwindigkeit-Zeit-Gesetz', eq: 'v = v0 + a*t' },
    ],
    checks({ v, o, issues, C }) {
      if (v.t < 0) issues.push({ cat: 'info', msg: 'Negative Zeit: Die Formel extrapoliert rückwärts. Mathematisch zulässig, sofern die Beschleunigung vorher schon konstant war.' });
      const vel = Math.abs(o('v'));
      if (vel > 0.1 * C.c) issues.push({ cat: 'model', msg: '|v| > 0,1 c: nichtrelativistische Kinematik ist hier ungenau.' });
      if (vel > C.c) issues.push({ cat: 'unreal', msg: 'Schneller als Licht – für massive Körper ausgeschlossen. Konstante Beschleunigung kann nicht beliebig lange andauern.' });
      issues.push({ cat: 'assume', msg: 'Die Beschleunigung ist über die ganze Zeit exakt konstant.' });
    },
    presets: [
      { name: 'Anfahrendes Auto', values: { s0: 0, v0: 0, a: 3, t: 5 } },
      { name: 'Vollbremsung aus 108 km/h', values: { s0: 0, v0: 30, a: -8, t: 3.75 } },
      { name: 'Senkrechter Wurf (1D)', note: 'a = −g_n, Luftwiderstand vernachlässigt', values: { s0: 0, v0: 15, a: -C.g_n.value, t: 1.5 } },
    ],
    graph: { x: 't', y: 's', also: ['v'] },
    viz: 'kinematics', animateVar: 't',
    explain: {
      intuition: 'Wer konstant beschleunigt, legt in jeder Sekunde ein Stück mehr Weg zurück als in der vorherigen. Deshalb wächst die Position quadratisch mit der Zeit, die Geschwindigkeit nur linear.',
      math: [
        { t: 'Ort', tex: 's(t) = s_0 + v_0 t + \\tfrac12 a t^2' },
        { t: 'Ableitung liefert die Geschwindigkeit', tex: 'v(t) = \\frac{\\mathrm{d}s}{\\mathrm{d}t} = v_0 + a t' },
        { t: 'Zeitfrei', tex: 'v^2 = v_0^2 + 2a\\,(s - s_0)' },
      ],
      physics: 'Die Gleichung ist exakt, sofern die Beschleunigung wirklich konstant ist – das ist eine mathematische Folge, kein Naturgesetz. Reale Bewegungen haben meist veränderliche Beschleunigung (Reibung, Luftwiderstand, Motorkennlinie). Für Geschwindigkeiten nahe c gilt die spezielle Relativitätstheorie.',
      epistemics: [
        { type: 'math', text: 'Zweifache Integration einer konstanten Beschleunigung – exakt.' },
        { type: 'model', text: 'Newtonsche Kinematik eines Massenpunkts in einer Dimension.' },
        { type: 'assume', text: 'a = konstant; keine Reibung; v ≪ c.' },
      ],
    },
  });

  define({
    id: 'free-fall', group: 'Mechanik', title: 'Freier Fall', short: 'Freier Fall',
    tex: 'h(t) = h_0 - \\tfrac12\\, g\\, t^2',
    vars: {
      h0: { label: 'h₀', tex: 'h_0', name: 'Starthöhe', dim: 'L', default: 100, min: 0, max: 1000, scale: 'lin' },
      g:  { label: 'g', tex: 'g', name: 'Fallbeschleunigung', dim: 'L T^-2', default: C.g_n.value, min: 0.1, max: 30, scale: 'lin', positive: true },
      t:  { label: 't', tex: 't', name: 'Zeit', dim: 'T', default: 2, min: 0, max: 15, scale: 'lin', time: true },
    },
    outputs: [
      { key: 'h', sym: 'h', tex: 'h', name: 'Höhe', expr: 'h0 - 0.5*g*t^2', dim: 'L', primary: true },
      { key: 'v', sym: 'v', tex: 'v', name: 'Fallgeschwindigkeit (Betrag)', expr: 'g*t', dim: 'L T^-1' },
      { key: 'tf', sym: 't_Fall', tex: 't_{\\mathrm{Fall}}', name: 'Fallzeit bis zum Boden', expr: 'sqrt(2*h0/g)', dim: 'T' },
      { key: 'vi', sym: 'v_Aufprall', tex: 'v_{\\mathrm{Aufprall}}', name: 'Aufprallgeschwindigkeit', expr: 'sqrt(2*g*h0)', dim: 'L T^-1' },
    ],
    equations: [
      { label: 'Höhe', eq: 'h = h0 - 0.5*g*t^2' },
      { label: 'Fallzeit', eq: 't_F = sqrt(2*h0/g)' },
    ],
    symbols: { t_F: { dim: 'T' } },
    checks({ v, o, issues }) {
      if (o('h') < 0) issues.push({ cat: 'model', msg: 'h < 0: Der Körper wäre schon bei t ≈ ' + PP.engine.fmt(o('tf'), 3) + ' s aufgeschlagen. Danach beschreibt die Formel nichts Reales mehr.' });
      if (v.h0 < 0) issues.push({ cat: 'unreal', msg: 'Negative Starthöhe: Der Körper läge unter dem Boden.' });
      if (o('v') > 30) issues.push({ cat: 'model', msg: 'In Luft wäre der Luftwiderstand bei über 30 m/s bereits erheblich. Das Modell gilt streng nur im Vakuum.' });
      if (v.h0 > 1e5) issues.push({ cat: 'model', msg: 'Über ~100 km Höhe nimmt g merklich ab; konstantes g ist dann eine schlechte Näherung.' });
      issues.push({ cat: 'assume', msg: 'Vakuum, konstantes g, Start aus der Ruhe.' });
    },
    presets: [
      { name: 'Erde (g_n)', note: 'Normfallbeschleunigung, Konvention', values: { h0: 100, g: C.g_n.value, t: 2 } },
      { name: 'Mond', note: 'g ≈ 1,62 m/s²', values: { h0: 100, g: 1.62, t: 5 } },
      { name: 'Mars', note: 'g ≈ 3,72 m/s²', values: { h0: 100, g: 3.72, t: 4 } },
      { name: 'Jupiter (Wolkenobergrenze)', note: 'g ≈ 24,8 m/s²', values: { h0: 100, g: 24.79, t: 1.5 } },
      { name: 'Fallturm Bremen', note: 'Fallstrecke ≈ 110 m in einer evakuierten Röhre', values: { h0: 110, g: C.g_n.value, t: 3 } },
    ],
    graph: { x: 't', y: 'h', also: ['v'] },
    viz: 'freefall', animateVar: 't', animateUntil: 'tf',
    explain: {
      intuition: 'Ohne Luft fallen Feder und Hammer gleich schnell. Die Geschwindigkeit wächst jede Sekunde um g – auf der Erde also um knapp 10 m/s.',
      math: [
        { t: 'Höhe', tex: 'h(t) = h_0 - \\tfrac12 g t^2' },
        { t: 'Aus h = 0 folgt die Fallzeit', tex: 't_{\\mathrm{Fall}} = \\sqrt{\\frac{2h_0}{g}}' },
        { t: 'Aufprallgeschwindigkeit', tex: 'v = \\sqrt{2 g h_0}' },
      ],
      physics: 'Spezialfall der Kinematik mit a = −g. Der Wert 9,80665 m/s² ist eine Konvention; das tatsächliche g hängt von Breitengrad, Höhe und lokaler Geologie ab. Die Masse kommt nicht vor, weil schwere und träge Masse gleich sind (Äquivalenzprinzip, experimentell auf etwa 10⁻¹⁵ geprüft).',
      epistemics: [
        { type: 'model', text: 'Freier Fall im homogenen Schwerefeld.' },
        { type: 'approx', text: 'Konstantes g gilt nur für Höhen ≪ Erdradius.' },
        { type: 'measured', text: 'Gleichheit von träger und schwerer Masse: experimentell sehr genau bestätigt (z. B. MICROSCOPE-Mission).' },
        { type: 'assume', text: 'Kein Luftwiderstand.' },
      ],
    },
  });

  define({
    id: 'spring', group: 'Mechanik', title: 'Federpendel (Hookesches Gesetz)', short: 'Feder',
    tex: 'F = -k\\,x',
    vars: {
      k: { label: 'k', tex: 'k', name: 'Federkonstante', dim: 'M T^-2', default: 50, min: 0.1, max: 1e6, scale: 'log', positive: true },
      m: { label: 'm', tex: 'm', name: 'Masse', dim: 'M', default: 1, min: 0.01, max: 1000, scale: 'log', positive: true },
      x: { label: 'x', tex: 'x', name: 'Auslenkung (Startwert der Schwingung)', dim: 'L', default: 0.1, min: -0.5, max: 0.5, scale: 'lin' },
    },
    outputs: [
      { key: 'F', sym: 'F', tex: 'F', name: 'Rückstellkraft', expr: '-k*x', dim: 'M L T^-2', primary: true },
      { key: 'omega', sym: 'ω', tex: '\\omega', name: 'Kreisfrequenz', expr: 'sqrt(k/m)', dim: 'T^-1' },
      { key: 'T', sym: 'T', tex: 'T', name: 'Periodendauer', expr: '2*pi*sqrt(m/k)', dim: 'T' },
      { key: 'E', sym: 'E', tex: 'E', name: 'Gespeicherte Energie', expr: '0.5*k*x^2', dim: 'M L^2 T^-2' },
      { key: 'vmax', sym: 'v_max', tex: 'v_{\\max}', name: 'Maximalgeschwindigkeit', expr: 'abs(x)*sqrt(k/m)', dim: 'L T^-1' },
    ],
    equations: [
      { label: 'Hookesches Gesetz', eq: 'F = -k*x' },
      { label: 'Periodendauer', eq: 'T = 2*pi*sqrt(m/k)' },
    ],
    checks({ v, issues }) {
      if (Math.abs(v.x) > 0.3) issues.push({ cat: 'model', msg: 'Große Auslenkung: Reale Federn verlassen irgendwann den linearen Bereich – dann gilt F = −kx nicht mehr.' });
      issues.push({ cat: 'assume', msg: 'Ideale, masselose Feder ohne Dämpfung.' });
    },
    presets: [
      { name: 'Weiche Feder', values: { k: 10, m: 0.5, x: 0.2 } },
      { name: 'Harte Feder', values: { k: 2000, m: 1, x: 0.02 } },
      { name: 'Autofederung (grob)', note: 'Viertelfahrzeug, Größenordnung ≈', values: { k: 2e4, m: 300, x: 0.05 } },
    ],
    graph: { x: 'x', y: 'F' },
    viz: 'spring',
    explain: {
      intuition: 'Je weiter man eine Feder zieht, desto stärker zieht sie zurück – proportional. Das erzeugt eine Schwingung, deren Takt nicht von der Auslenkung abhängt, sondern nur von Masse und Federhärte.',
      math: [
        { t: 'Bewegungsgleichung', tex: 'm\\,\\ddot x = -k\\,x' },
        { t: 'Lösung', tex: 'x(t) = x_0 \\cos(\\omega t),\\quad \\omega = \\sqrt{k/m}' },
        { t: 'Periodendauer', tex: 'T = 2\\pi\\sqrt{m/k}' },
      ],
      physics: 'Das Hookesche Gesetz ist eine lineare Näherung für kleine Auslenkungen: Fast jede Kraft um ein stabiles Gleichgewicht sieht in erster Ordnung so aus. Deshalb ist der harmonische Oszillator eines der wichtigsten Modelle der Physik – bis in die Quantenfeldtheorie.',
      epistemics: [
        { type: 'approx', text: 'Lineare Näherung (Taylor-Entwicklung erster Ordnung um das Gleichgewicht).' },
        { type: 'model', text: 'Idealer harmonischer Oszillator: keine Dämpfung, masselose Feder.' },
        { type: 'math', text: 'Die Periodendauer ist exakt unabhängig von der Amplitude – solange das Modell gilt.' },
      ],
    },
  });

  define({
    id: 'circular', group: 'Mechanik', title: 'Gleichförmige Kreisbewegung', short: 'Kreisbewegung',
    tex: 'a = \\frac{v^2}{r}',
    vars: {
      v: { label: 'v', tex: 'v', name: 'Bahngeschwindigkeit', dim: 'L T^-1', default: 10, min: 0.01, max: 1e6, scale: 'log', positive: true },
      r: { label: 'r', tex: 'r', name: 'Bahnradius', dim: 'L', default: 5, min: 0.01, max: 1e12, scale: 'log', positive: true },
      m: { label: 'm', tex: 'm', name: 'Masse', dim: 'M', default: 1, min: 1e-3, max: 1e30, scale: 'log', positive: true },
    },
    outputs: [
      { key: 'a', sym: 'a', tex: 'a', name: 'Zentripetalbeschleunigung', expr: 'v^2/r', dim: 'L T^-2', primary: true },
      { key: 'ag', sym: 'a/g_n', tex: 'a/g_n', name: 'in Vielfachen von g_n', expr: 'v^2/r/g_n', dim: '' },
      { key: 'F', sym: 'F', tex: 'F', name: 'Zentripetalkraft', expr: 'm*v^2/r', dim: 'M L T^-2' },
      { key: 'T', sym: 'T', tex: 'T', name: 'Umlaufzeit', expr: '2*pi*r/v', dim: 'T' },
      { key: 'omega', sym: 'ω', tex: '\\omega', name: 'Winkelgeschwindigkeit', expr: 'v/r', dim: 'T^-1' },
    ],
    equations: [
      { label: 'Zentripetalbeschleunigung', eq: 'a = v^2/r' },
      { label: 'Zentripetalkraft', eq: 'F = m*v^2/r' },
    ],
    checks({ v, issues, C }) {
      if (v.v > C.c) issues.push({ cat: 'unreal', msg: 'v > c: Kein massiver Körper erreicht Lichtgeschwindigkeit.' });
      else if (v.v > 0.1 * C.c) issues.push({ cat: 'model', msg: 'v > 0,1 c: relativistische Korrekturen werden wichtig.' });
      issues.push({ cat: 'assume', msg: 'Konstanter Betrag der Geschwindigkeit, exakte Kreisbahn.' });
    },
    presets: [
      { name: 'Karussell', values: { v: 5, r: 5, m: 70 } },
      { name: 'Laborzentrifuge', note: 'Größenordnung ≈ 10 000 g', values: { v: 100, r: 0.1, m: 0.01 } },
      { name: 'ISS', note: 'Bahnhöhe ≈ 420 km, v ≈ 7,66 km/s, m ≈ 420 t', values: { v: 7660, r: 6.791e6, m: 4.2e5 } },
      { name: 'Mond um die Erde', note: 'mittlere Werte ≈ (die Bahn ist leicht elliptisch)', values: { v: 1022, r: C.d_moon.value, m: C.M_moon.value } },
    ],
    graph: { x: 'v', y: 'a' },
    viz: 'circular',
    explain: {
      intuition: 'Wer im Kreis fährt, wird ständig zur Mitte hin beschleunigt – auch bei konstantem Tempo, denn die Richtung ändert sich laufend. Doppeltes Tempo heißt vierfache Beschleunigung.',
      math: [
        { t: 'Zentripetalbeschleunigung', tex: 'a = \\frac{v^2}{r} = \\omega^2 r' },
        { t: 'Umlaufzeit', tex: 'T = \\frac{2\\pi r}{v}' },
        { t: 'Kreisbahn durch Gravitation (Beispiel ISS)', tex: '\\frac{v^2}{r} = \\frac{G M}{r^2}' },
      ],
      physics: 'a = v²/r ist reine Kinematik und gilt für jede gleichförmige Kreisbewegung, egal welche Kraft sie verursacht (Seil, Reibung, Gravitation). Für die ISS entspricht a fast dem lokalen g – die Astronauten sind nicht schwerelos, weil die Schwerkraft fehlt, sondern weil sie ständig mitfallen.',
      epistemics: [
        { type: 'math', text: 'Geometrische Folge der Kreisbahn – exakt.' },
        { type: 'model', text: 'Massenpunkt auf idealer Kreisbahn; nichtrelativistisch.' },
      ],
    },
  });

  /* ======================= SPEZIELLE RELATIVITÄT ======================= */

  define({
    id: 'special-rel', group: 'Relativität', title: 'Spezielle Relativität: Lorentz-Faktor', short: 'Lorentz-Faktor',
    tex: '\\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}}',
    vars: {
      beta: { label: 'β = v/c', tex: '\\beta', name: 'Geschwindigkeit in Einheiten von c', dim: '', default: 0.8, min: 0, max: 1, scale: 'toone', toone: 12 },
      tau:  { label: 'Δτ', tex: '\\Delta\\tau', name: 'Eigenzeit (Uhr im bewegten System)', dim: 'T', default: 1, min: 1e-6, max: 1e9, scale: 'log', positive: true },
      L0:   { label: 'L₀', tex: 'L_0', name: 'Ruhelänge', dim: 'L', default: 1, min: 1e-6, max: 1e9, scale: 'log', positive: true },
      m:    { label: 'm', tex: 'm', name: 'Ruhemasse', dim: 'M', default: 1, min: 1e-31, max: 1e6, scale: 'log', positive: true },
    },
    outputs: [
      { key: 'gamma', sym: 'γ', tex: '\\gamma', name: 'Lorentz-Faktor', expr: '1/sqrt((1-beta)*(1+beta))', dim: '', primary: true, digits: 8 },
      { key: 'v', sym: 'v', tex: 'v', name: 'Geschwindigkeit', expr: 'beta*c', dim: 'L T^-1' },
      { key: 'dt', sym: 'Δt', tex: '\\Delta t', name: 'Zeitdilatation: Dauer im Laborsystem', expr: 'gamma*tau', dim: 'T' },
      { key: 'L', sym: 'L', tex: 'L', name: 'Längenkontraktion: gemessene Länge', expr: 'L0/gamma', dim: 'L' },
      { key: 'E', sym: 'E', tex: 'E', name: 'Gesamtenergie', expr: 'gamma*m*c^2', dim: 'M L^2 T^-2' },
      { key: 'Ek', sym: 'E_kin', tex: 'E_{\\mathrm{kin}}', name: 'Kinetische Energie (stabil berechnet)', expr: 'm*c^2*beta^2/(sqrt((1-beta)*(1+beta))*(1+sqrt((1-beta)*(1+beta))))', dim: 'M L^2 T^-2' },
      { key: 'p', sym: 'p', tex: 'p', name: 'Impuls', expr: 'gamma*m*beta*c', dim: 'M L T^-1' },
    ],
    equations: [
      { label: 'Lorentz-Faktor', eq: 'gamma = 1/sqrt(1 - v^2/c^2)' },
      { label: 'Zeitdilatation', eq: 'dt = gamma*tau' },
      { label: 'Relativistische Energie', eq: 'E = gamma*m*c^2' },
      { label: 'Kinetische Energie (umgeformt)', eq: 'E_k = m*c^2*beta^2/(sqrt(1-beta^2)*(1+sqrt(1-beta^2)))' },
    ],
    symbols: { v: { dim: 'L T^-1' }, E_k: { dim: 'M L^2 T^-2' } },
    checks({ v, issues }) {
      if (v.beta >= 1) issues.push({ cat: 'math', msg: 'β ≥ 1: Für β = 1 wird γ unendlich, für β > 1 imaginär. Massive Körper können c nicht erreichen.' });
      if (v.beta < 0) issues.push({ cat: 'info', msg: 'Negatives β bedeutet nur die Gegenrichtung; γ hängt von β² ab.' });
      if (v.beta > 0 && v.beta < 1e-4) issues.push({ cat: 'info', msg: 'γ − 1 ≈ β²/2 ist winzig. E_kin wird deshalb über eine umgeformte Formel berechnet – die naive Differenz (γ−1)mc² würde hier durch Rundung ausgelöscht.' });
      issues.push({ cat: 'assume', msg: 'Inertialsysteme, flache Raumzeit (keine Gravitation).' });
    },
    presets: [
      { name: 'β = 0,8', values: { beta: 0.8, tau: 1, L0: 1, m: 1 } },
      { name: 'Myon aus der Höhenstrahlung', note: 'β ≈ 0,998, mittlere Lebensdauer ≈ 2,197 µs, m ≈ 1,884 × 10⁻²⁸ kg', values: { beta: 0.998, tau: 2.197e-6, L0: 1, m: 1.8835e-28 } },
      { name: 'LHC-Proton (6,8 TeV)', note: 'γ ≈ 7247 aus E / (m_p c²)', values: { beta: 1 - 1 / (2 * 7247.4 ** 2), tau: 1, L0: 1, m: C.m_p.value } },
      { name: 'GPS-Satellit (nur SRT-Anteil)', note: 'v ≈ 3,9 km/s. Der gravitative ART-Effekt ist größer und entgegengesetzt – hier nicht enthalten', values: { beta: 3900 / C.c.value, tau: 86400, L0: 1, m: 1 } },
    ],
    graph: { x: 'beta', y: 'gamma' },
    viz: 'relativity',
    explain: {
      intuition: 'Bewegte Uhren gehen – vom ruhenden Beobachter aus gemessen – langsamer, bewegte Maßstäbe sind in Bewegungsrichtung kürzer. Bei Alltagsgeschwindigkeiten ist das unmessbar klein, nahe c wächst es unbegrenzt.',
      math: [
        { t: 'Lorentz-Faktor', tex: '\\gamma = \\frac{1}{\\sqrt{1-\\beta^2}},\\quad \\beta = v/c' },
        { t: 'Numerisch stabil geschrieben', tex: '1-\\beta^2 = (1-\\beta)(1+\\beta)' },
        { t: 'Kinetische Energie ohne Auslöschung', tex: '(\\gamma-1)\\,mc^2 = \\frac{\\beta^2\\, mc^2}{\\sqrt{1-\\beta^2}\\,\\bigl(1+\\sqrt{1-\\beta^2}\\bigr)}' },
        { t: 'Kleine Geschwindigkeiten', tex: 'E_{\\mathrm{kin}} \\approx \\tfrac12 m v^2' },
      ],
      physics: 'Die Effekte sind keine optischen Täuschungen, sondern Folgen der Lorentz-Transformation und vielfach gemessen (Myonen-Lebensdauer, Teilchenbeschleuniger, Atomuhren). Wichtig: Längenkontraktion beschreibt die gemessene Länge im Laborsystem. Ein Foto eines schnellen Objekts sähe wegen unterschiedlicher Lichtlaufzeiten anders aus – eher gedreht als verkürzt (Terrell-Penrose-Effekt).',
      epistemics: [
        { type: 'model', text: 'Spezielle Relativitätstheorie (Einstein, 1905): gilt in flacher Raumzeit.' },
        { type: 'measured', text: 'Zeitdilatation ist experimentell hochpräzise bestätigt (Myonen-Speicherring, Ionen-Uhren).' },
        { type: 'math', text: 'γ ist für |β| < 1 reell und ≥ 1; bei β → 1 divergiert es.' },
        { type: 'assume', text: 'Unbeschleunigte Bezugssysteme, keine Gravitation.' },
      ],
    },
  });

  /* ======================== FAMOUS EQUATIONS ======================== */

  define({
    id: 'hawking', group: 'Famous Equations', hall: true, title: 'Hawking-Temperatur', short: 'Hawking-Temperatur',
    tex: 'T_{\\mathrm{H}} = \\frac{\\hbar\\, c^3}{8\\pi\\, G\\, M\\, k_{\\mathrm{B}}}',
    meta: { mathType: 'skalar', mainDim: 'Temperatur', domain: 'Thermodynamik Schwarzer Löcher', status: 'theoretische Vorhersage, nicht beobachtet' },
    vars: {
      M: { label: 'M', tex: 'M', name: 'Masse des Schwarzen Lochs', dim: 'M', default: MS, min: 1e8, max: 1e42, scale: 'log', positive: true },
    },
    outputs: [
      { key: 'TH', sym: 'T_H', tex: 'T_{\\mathrm{H}}', name: 'Hawking-Temperatur', expr: 'hbar*c^3/(8*pi*G*M*k_B)', dim: 'Θ', primary: true },
      { key: 'Msun', sym: 'M/M☉', tex: 'M/M_\\odot', name: 'Masse in Sonnenmassen', expr: 'M/M_sun', dim: '' },
      { key: 'rs', sym: 'r_s', tex: 'r_{\\mathrm{s}}', name: 'Schwarzschild-Radius', expr: '2*G*M/c^2', dim: 'L' },
      { key: 'tev', sym: 't_evap', tex: 't_{\\mathrm{evap}}', name: 'Verdampfungszeit (grobe Abschätzung)', expr: '5120*pi*G^2*M^3/(hbar*c^4)', dim: 'T', note: 'nur Photonen, ohne Greybody-Faktoren, ohne Einstrahlung' },
      { key: 'tevy', sym: 't_evap / Jahr', tex: 't_{\\mathrm{evap}}/\\mathrm{a}', name: 'Verdampfungszeit in Jahren', expr: 'tev/31557600', dim: '', noEq: true },
    ],
    equations: [
      { label: 'Hawking-Temperatur', eq: 'T_H = hbar*c^3/(8*pi*G*M*k_B)' },
      { label: 'Schwarzschild-Radius', eq: 'r_s = 2*G*M/c^2' },
    ],
    symbols: { T_H: { dim: 'Θ' }, r_s: { dim: 'L' } },
    checks({ v, o, issues, C, fmt }) {
      const T = o('TH');
      if (isFinite(T) && T < C.T_cmb) issues.push({ cat: 'info', msg: 'T_H ≈ ' + fmt(T, 3) + ' K liegt unter der Temperatur der Hintergrundstrahlung (≈ 2,7 K). Heute absorbiert so ein Loch mehr Strahlung, als es abgibt – es wächst netto.' });
      if (v.M > 0 && v.M < 1e-6) issues.push({ cat: 'model', msg: 'Nahe der Planck-Masse (≈ 2,2 × 10⁻⁸ kg) versagt die semiklassische Rechnung – dafür bräuchte es eine Quantengravitation.' });
      if (v.M > 0 && v.M < 5e11) issues.push({ cat: 'info', msg: 'Für so kleine Massen wäre die abgeschätzte Lebensdauer kürzer als das Alter des Universums. Solche primordialen Schwarzen Löcher sind hypothetisch.' });
      issues.push({ cat: 'assume', msg: 'Idealisiertes Schwarzschild-Loch (ungeladen, nicht rotierend) in semiklassischer Gravitation.' });
    },
    presets: [
      { name: '1 Sonnenmasse', values: { M: MS } },
      { name: 'Stellares Loch, 10 M☉', values: { M: 10 * MS } },
      { name: 'Sagittarius A*', note: '≈ 4,3 × 10⁶ M☉ (GRAVITY-Kollaboration)', values: { M: 4.3e6 * MS } },
      { name: 'M87*', note: '≈ 6,5 × 10⁹ M☉ (Event Horizon Telescope 2019)', values: { M: 6.5e9 * MS } },
      { name: 'Mondmasse (hypothetisch)', values: { M: C.M_moon.value } },
      { name: '10¹² kg (hypothetisch, primordial)', values: { M: 1e12 } },
    ],
    graph: { x: 'M', y: 'TH', xlog: true, ylog: true, refs: [{ y: 'TH', value: C.T_cmb.value, label: 'T_CMB ≈ 2,7 K' }] },
    viz: 'blackhole',
    explain: {
      intuition: 'Schwarze Löcher sollten laut Theorie wie ein extrem kalter Körper strahlen. Je schwerer das Loch, desto kälter – ein Loch mit Sonnenmasse hätte nur etwa 60 Milliardstel Kelvin.',
      math: [
        { t: 'Hawking-Temperatur', tex: 'T_{\\mathrm{H}} = \\frac{\\hbar c^3}{8\\pi G M k_{\\mathrm{B}}}' },
        { t: 'Antiproportional zur Masse', tex: 'T_{\\mathrm{H}} \\propto \\frac{1}{M}' },
        { t: 'Mit dem Schwarzschild-Radius', tex: 'k_{\\mathrm{B}} T_{\\mathrm{H}} = \\frac{\\hbar c}{4\\pi\\, r_{\\mathrm{s}}}' },
        { t: 'Grobe Verdampfungszeit', tex: 't_{\\mathrm{evap}} \\approx \\frac{5120\\,\\pi\\, G^2 M^3}{\\hbar c^4}' },
      ],
      physics: 'In der Formel treffen sich Quantenmechanik (ħ), Relativität (c), Gravitation (G) und Thermodynamik (k_B). Sie folgt aus der semiklassischen Gravitation: Quantenfelder auf einer klassischen, gekrümmten Raumzeit. Hawking-Strahlung eines astrophysikalischen Schwarzen Lochs wurde nie beobachtet – sie wäre viel schwächer als die kosmische Hintergrundstrahlung. Analogexperimente (etwa in Bose-Einstein-Kondensaten) untersuchen verwandte Effekte, sind aber keine Messung an Schwarzen Löchern.',
      epistemics: [
        { type: 'assume', text: 'Theoretische Vorhersage im Rahmen der semiklassischen Gravitation (Hawking, 1974/75).' },
        { type: 'model', text: 'Idealisiertes Schwarzschild-Loch; rotierende oder geladene Löcher haben andere Temperaturen.' },
        { type: 'approx', text: 'Die Verdampfungszeit ist eine Größenordnungsabschätzung (nur Photonen, ohne Greybody-Faktoren).' },
        { type: 'measured', text: 'Nicht direkt gemessen. Die Massen der Beispiel-Löcher stammen aus Beobachtungen (Sternbahnen, EHT).' },
      ],
    },
  });

  define({
    id: 'bh-entropy', group: 'Famous Equations', hall: true, title: 'Bekenstein-Hawking-Entropie', short: 'BH-Entropie',
    tex: 'S_{\\mathrm{BH}} = \\frac{k_{\\mathrm{B}}\\, c^3 A}{4\\, G\\, \\hbar}',
    meta: { mathType: 'skalar', mainDim: 'Entropie', domain: 'Thermodynamik Schwarzer Löcher', status: 'theoretisches Ergebnis, nicht gemessen' },
    vars: {
      M: { label: 'M', tex: 'M', name: 'Masse (Schwarzschild)', dim: 'M', default: MS, min: 1e-8, max: 1e42, scale: 'log', positive: true },
      A: { label: 'A', tex: 'A', name: 'Horizontfläche', dim: 'L^2', default: 1.1e8, min: 1e-60, max: 1e30, scale: 'log', positive: true },
    },
    forms: [
      {
        id: 'mass', label: 'Schwarzschild: aus der Masse', vars: ['M'],
        outputs: [
          { key: 'rs', sym: 'r_s', tex: 'r_{\\mathrm{s}}', name: 'Schwarzschild-Radius', expr: '2*G*M/c^2', dim: 'L' },
          { key: 'A', sym: 'A', tex: 'A', name: 'Horizontfläche', expr: '4*pi*rs^2', dim: 'L^2' },
          { key: 'S', sym: 'S_BH', tex: 'S_{\\mathrm{BH}}', name: 'Bekenstein-Hawking-Entropie', expr: 'k_B*c^3*A/(4*G*hbar)', dim: 'M L^2 T^-2 Θ^-1', primary: true },
          { key: 'SkB', sym: 'S/k_B', tex: 'S_{\\mathrm{BH}}/k_{\\mathrm{B}}', name: 'Dimensionslose Entropie', expr: 'S/k_B', dim: '' },
        ],
        equations: [
          { label: 'Bekenstein-Hawking-Entropie', eq: 'S_BH = k_B*c^3*A/(4*G*hbar)' },
          { label: 'Horizontfläche (Schwarzschild)', eq: 'A = 4*pi*r_s^2' },
          { label: 'Schwarzschild-Radius', eq: 'r_s = 2*G*M/c^2' },
          { label: 'Dimensionslose Entropie', eq: 'S_kB = S_BH/k_B' },
        ],
      },
      {
        id: 'area', label: 'Allgemein: aus der Fläche', vars: ['A'],
        outputs: [
          { key: 'S', sym: 'S_BH', tex: 'S_{\\mathrm{BH}}', name: 'Bekenstein-Hawking-Entropie', expr: 'k_B*c^3*A/(4*G*hbar)', dim: 'M L^2 T^-2 Θ^-1', primary: true },
          { key: 'SkB', sym: 'S/k_B', tex: 'S_{\\mathrm{BH}}/k_{\\mathrm{B}}', name: 'Dimensionslose Entropie', expr: 'S/k_B', dim: '' },
          { key: 'Meq', sym: 'M_Schw', tex: 'M_{\\mathrm{Schw}}', name: 'Masse, falls Schwarzschild-Loch', expr: 'c^2/(2*G)*sqrt(A/(4*pi))', dim: 'M' },
        ],
        equations: [
          { label: 'Bekenstein-Hawking-Entropie', eq: 'S_BH = k_B*c^3*A/(4*G*hbar)' },
          { label: 'Dimensionslose Entropie', eq: 'S_kB = S_BH/k_B' },
        ],
      },
    ],
    symbols: { S_BH: { dim: 'M L^2 T^-2 Θ^-1' }, S_kB: { dim: '' }, r_s: { dim: 'L' } },
    checks({ v, issues }) {
      if (v.M > 0 && v.M < 1e-6) issues.push({ cat: 'model', msg: 'Nahe der Planck-Masse ist die Flächenformel nicht mehr verlässlich.' });
      issues.push({ cat: 'assume', msg: 'Semiklassisches Ergebnis für Ereignishorizonte.' });
    },
    presets: [
      { name: '1 Sonnenmasse', form: 'mass', values: { M: MS } },
      { name: 'Sagittarius A*', form: 'mass', note: '≈ 4,3 × 10⁶ M☉', values: { M: 4.3e6 * MS } },
      { name: 'Planck-Masse', form: 'mass', note: 'm_P ≈ 2,18 × 10⁻⁸ kg – Formel hier nicht mehr belastbar', values: { M: 2.176434e-8 } },
      { name: 'Fläche 1 m²', form: 'area', values: { A: 1 } },
    ],
    graph: { x: 'M', y: 'S', xlog: true, ylog: true },
    viz: 'horizon',
    explain: {
      intuition: 'Die Entropie eines Schwarzen Lochs wächst mit der Oberfläche seines Horizonts, nicht mit seinem Volumen. Pro Planck-Fläche kommt etwa ein Viertel „Einheit“ Entropie hinzu – das ergibt gigantische Zahlen.',
      math: [
        { t: 'Flächenform', tex: 'S_{\\mathrm{BH}} = \\frac{k_{\\mathrm{B}} c^3 A}{4 G \\hbar} = k_{\\mathrm{B}}\\,\\frac{A}{4\\, l_{\\mathrm{P}}^2}' },
        { t: 'Schwarzschild-Horizont', tex: 'A = 4\\pi r_{\\mathrm{s}}^2,\\quad r_{\\mathrm{s}} = \\frac{2GM}{c^2}' },
        { t: 'Eingesetzt', tex: 'S_{\\mathrm{BH}} = \\frac{4\\pi G k_{\\mathrm{B}}}{\\hbar c}\\, M^2' },
        { t: 'Dimensionslos', tex: '\\frac{S_{\\mathrm{BH}}}{k_{\\mathrm{B}}} = \\frac{A}{4\\,l_{\\mathrm{P}}^2}\\;\\in\\; \\mathbb{R}' },
      ],
      physics: 'S/k_B ist eine reine Zahl: k_B hat genau die Dimension einer Entropie (J/K) und kürzt sie heraus. In der statistischen Physik wäre S/k_B = ln Ω, der Logarithmus der Anzahl von Mikrozuständen. Welche Mikrozustände ein Schwarzes Loch hat, ist offene Forschung; für spezielle (etwa extremale) Löcher liefern Stringtheorie und andere Ansätze Herleitungen.',
      epistemics: [
        { type: 'assume', text: 'Theoretisches Ergebnis (Bekenstein 1972/73, Hawking 1975); nicht direkt gemessen.' },
        { type: 'model', text: 'Die Form S(M) gilt nur für Schwarzschild-Löcher; die Flächenform ist allgemeiner.' },
        { type: 'math', text: 'S/k_B ist dimensionslos – das folgt exakt aus der Dimensionsanalyse.' },
      ],
    },
  });

  define({
    id: 'efe', group: 'Famous Equations', hall: true, title: 'Einsteinsche Feldgleichungen', short: 'Feldgleichungen',
    tex: 'G_{\\mu\\nu} + \\Lambda\\, g_{\\mu\\nu} = \\frac{8\\pi G}{c^4}\\, T_{\\mu\\nu}',
    meta: { mathType: 'Tensorgleichung (10 gekoppelte nichtlineare PDGs)', mainDim: 'Krümmung (L⁻²)', domain: 'Allgemeine Relativitätstheorie', status: 'vielfach experimentell bestätigt' },
    vars: {
      u: { label: 'u', tex: 'u', name: 'Energiedichte (≈ ρc² für Staub)', dim: 'M L^-1 T^-2', default: 1000 * C.c.value ** 2, min: 1e-15, max: 1e40, scale: 'log', positive: true },
    },
    outputs: [
      { key: 'kappa', sym: 'κ', tex: '\\kappa', name: 'Einstein-Kopplung 8πG/c⁴', expr: '8*pi*G/c^4', dim: 'M^-1 L^-1 T^2' },
      { key: 'K', sym: 'K ~ κu', tex: 'K \\sim \\kappa u', name: 'Krümmungsskala (Größenordnung)', expr: 'kappa*u', dim: 'L^-2', primary: true },
      { key: 'Lc', sym: 'ℓ = 1/√K', tex: '\\ell', name: 'Zugehörige Längenskala', expr: '1/sqrt(K)', dim: 'L' },
      { key: 'KL', sym: 'K/Λ', tex: 'K/\\Lambda', name: 'Verglichen mit Λ', expr: 'K/Lambda', dim: '' },
    ],
    equations: [
      { label: 'Feldgleichungen – Dimension jeder Komponente', eq: 'G_mn + Lambda*g_mn = 8*pi*G/c^4*T_mn' },
      { label: 'Einstein-Kopplung', eq: 'kappa = 8*pi*G/c^4' },
      { label: 'Kopplung × Energiedichte = Krümmung', eq: 'G_mn = kappa*T_mn' },
    ],
    symbols: {
      G_mn: { dim: 'L^-2', name: 'Einstein-Tensor (Krümmung)' },
      g_mn: { dim: '', name: 'Metrik (dimensionslos bei Koordinaten in Längeneinheiten)' },
      T_mn: { dim: 'M L^-1 T^-2', name: 'Energie-Impuls-Tensor (Energiedichte, Druck)' },
    },
    checks({ issues }) {
      issues.push({ cat: 'model', msg: 'Nur eine Größenordnung: Die tatsächliche Krümmung folgt erst aus einer vollständigen Lösung (Symmetrie, Druck, Randbedingungen).' });
      issues.push({ cat: 'assume', msg: 'Energiedichte ≈ ρc² (Staub, Druck vernachlässigt).' });
    },
    presets: [
      { name: 'Kritische Dichte des Universums', note: 'ρ ≈ 8,5 × 10⁻²⁷ kg/m³ (H₀ ≈ 67 km/s/Mpc, Planck 2018; lokale H₀-Messungen liegen höher)', values: { u: 8.5e-27 * C.c.value ** 2 } },
      { name: 'Interstellares Gas', note: '≈ 1 Wasserstoffatom pro cm³', values: { u: 1e6 * C.m_p.value * C.c.value ** 2 } },
      { name: 'Luft', note: 'ρ ≈ 1,2 kg/m³', values: { u: 1.2 * C.c.value ** 2 } },
      { name: 'Wasser', note: 'ρ ≈ 1000 kg/m³', values: { u: 1000 * C.c.value ** 2 } },
      { name: 'Sonnenkern', note: 'ρ ≈ 1,5 × 10⁵ kg/m³', values: { u: 1.5e5 * C.c.value ** 2 } },
      { name: 'Kernmaterie / Neutronenstern', note: 'ρ ≈ 2,3 × 10¹⁷ kg/m³', values: { u: 2.3e17 * C.c.value ** 2 } },
    ],
    graph: { x: 'u', y: 'K', xlog: true, ylog: true, refs: [{ y: 'K', value: C.Lambda.value, label: 'Λ ≈ 1,1 × 10⁻⁵² m⁻²' }] },
    viz: 'spacetime',
    explain: {
      intuition: 'Materie und Energie sagen der Raumzeit, wie sie sich krümmen soll; die Krümmung sagt der Materie, wie sie sich bewegen soll. Links steht Geometrie, rechts steht, was drin ist.',
      math: [
        { t: 'Feldgleichungen', tex: 'G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}' },
        { t: 'Einstein-Tensor aus Ricci-Tensor und -Skalar', tex: 'G_{\\mu\\nu} = R_{\\mu\\nu} - \\tfrac12 R\\, g_{\\mu\\nu}' },
        { t: 'Indizes μ, ν laufen über 0…3; beide Seiten sind symmetrisch', tex: '4 \\times 4 \\;\\Rightarrow\\; 10 \\text{ unabhängige Gleichungen}' },
        { t: 'Schematische Lesart – keine vollständige Gleichung', tex: '\\text{Geometrie} \\;\\longleftrightarrow\\; \\text{Materie/Energie}' },
      ],
      physics: 'Das ist keine skalare Gleichung, sondern eine Gleichung zwischen Tensoren: zehn gekoppelte, nichtlineare partielle Differentialgleichungen für die Metrik g_μν. G_μν beschreibt die Krümmung (Dimension 1/Länge²), T_μν die Energie- und Impulsdichte (Dimension Energie/Volumen). Der Faktor 8πG/c⁴ übersetzt das eine ins andere – und er ist winzig: ≈ 2 × 10⁻⁴³ s²/(kg m). Deshalb braucht es enorme Energiedichten für spürbare Krümmung. Λ ist die kosmologische Konstante; ihr Wert stammt aus kosmologischen Beobachtungen im ΛCDM-Modell, ihre physikalische Natur ist ungeklärt. Die Dimension von g_μν hängt von der Wahl der Koordinaten ab; hier sind alle Koordinaten Längen (x⁰ = ct).',
      epistemics: [
        { type: 'model', text: 'Allgemeine Relativitätstheorie (Einstein, 1915).' },
        { type: 'measured', text: 'Vielfach bestätigt: Periheldrehung, Lichtablenkung, Shapiro-Verzögerung, Gravitationswellen, EHT-Bilder.' },
        { type: 'assume', text: 'Λ als Konstante ist eine Modellannahme; der Wert ist aus Beobachtungen abgeleitet (≈).' },
        { type: 'approx', text: 'Die hier berechnete Krümmungsskala K ~ κu ist nur eine Dimensionsabschätzung.' },
      ],
    },
  });

  define({
    id: 'schroedinger', group: 'Famous Equations', hall: true, title: 'Schrödinger-Gleichung', short: 'Schrödinger',
    tex: 'i\\hbar\\,\\frac{\\partial \\psi}{\\partial t} = \\Bigl[-\\frac{\\hbar^2}{2m}\\nabla^2 + V\\Bigr]\\psi',
    meta: { mathType: 'lineare partielle Differentialgleichung', mainDim: 'Energie × [ψ]', domain: 'nichtrelativistische Quantenmechanik', status: 'im Gültigkeitsbereich präzise bestätigt' },
    vars: {
      m: { label: 'm', tex: 'm', name: 'Teilchenmasse', dim: 'M', default: C.m_e.value, min: 1e-31, max: 1e-3, scale: 'log', positive: true },
      L: { label: 'L', tex: 'L', name: 'Breite des Potentialtopfs', dim: 'L', default: 1e-9, min: 1e-16, max: 1e-2, scale: 'log', positive: true },
      n: { label: 'n', tex: 'n', name: 'Quantenzahl', dim: '', default: 1, min: 1, max: 12, scale: 'lin', integer: true },
    },
    outputs: [
      { key: 'E', sym: 'E_n', tex: 'E_n', name: 'Energie des Zustands n', expr: 'n^2*pi^2*hbar^2/(2*m*L^2)', dim: 'M L^2 T^-2', primary: true, alt: { unit: 'eV', div: 'eV' } },
      { key: 'dE', sym: 'E₂ − E₁', tex: 'E_2 - E_1', name: 'Abstand der untersten Niveaus', expr: '3*pi^2*hbar^2/(2*m*L^2)', dim: 'M L^2 T^-2', alt: { unit: 'eV', div: 'eV' } },
      { key: 'lam', sym: 'λ_n', tex: '\\lambda_n', name: 'Wellenlänge der stehenden Welle', expr: '2*L/n', dim: 'L' },
      { key: 'omega', sym: 'ω_n', tex: '\\omega_n', name: 'Phasen-Kreisfrequenz', expr: 'E/hbar', dim: 'T^-1' },
      { key: 'amp', sym: '√(2/L)', tex: '\\sqrt{2/L}', name: 'Amplitude von ψ (Normierung)', expr: 'sqrt(2/L)', dim: 'L^-1/2' },
      { key: 'ratio', sym: 'E_n / (mc²)', tex: 'E_n/(mc^2)', name: 'Relativistischer Check', expr: 'E/(m*c^2)', dim: '' },
    ],
    equations: [
      { label: 'Zeitabhängige Schrödinger-Gleichung (1D)', eq: 'i*hbar*d_t*psi = -hbar^2/(2*m)*lap*psi + V*psi' },
      { label: 'Zeitableitungs-Operator', eq: 'E_op = hbar*d_t' },
      { label: 'Kinetischer Operator', eq: 'E_op = hbar^2/(2*m)*lap' },
      { label: 'Normierung ∫|ψ|² dx = 1', eq: 'one = psi^2*dx' },
      { label: 'Kastenpotential: Energieniveaus', eq: 'E_n = n^2*pi^2*hbar^2/(2*m*L^2)' },
    ],
    symbols: {
      i: { dim: '', name: 'imaginäre Einheit' },
      d_t: { dim: 'T^-1', name: 'Zeitableitung ∂/∂t' },
      lap: { dim: 'L^-2', name: 'Laplace-Operator ∇² (in 1D: ∂²/∂x²)' },
      psi: { dim: 'L^-1/2', name: 'Wellenfunktion (1D, normiert)' },
      V: { dim: 'M L^2 T^-2', name: 'Potential (Energie)' },
      E_op: { dim: 'M L^2 T^-2', name: 'Energie' },
      E_n: { dim: 'M L^2 T^-2', name: 'Energie' },
      one: { dim: '', name: 'reine Zahl 1' },
      dx: { dim: 'L', name: 'Längenelement' },
    },
    notes: [
      { t: 'Warum ψ eine Dimension hat (1D)', steps: [
        '\\int_{-\\infty}^{\\infty} |\\psi(x)|^2\\,\\mathrm{d}x = 1',
        '[\\psi]^2 \\cdot [\\mathrm{d}x] = [1]',
        '[\\psi]^2 \\cdot \\mathsf{L} = 1',
        '[\\psi] = \\mathsf{L}^{-1/2}',
      ], after: 'In drei Dimensionen ist d³x ein Volumen, deshalb gilt dort [ψ] = L⁻³ᐟ².' },
    ],
    checks({ o, issues }) {
      const r = o('ratio');
      if (isFinite(r) && r > 0.01) issues.push({ cat: 'model', msg: 'E_n ist mehr als 1 % der Ruheenergie mc²: Die nichtrelativistische Schrödinger-Gleichung reicht nicht mehr (Dirac-Gleichung, Quantenfeldtheorie).' });
      issues.push({ cat: 'assume', msg: 'Unendlich hohe Wände (idealer Potentialtopf), ein einzelnes Teilchen ohne Spin.' });
    },
    presets: [
      { name: 'Elektron, 1 nm', note: 'Größenordnung von Quantenpunkten – grobe Näherung', values: { m: C.m_e.value, L: 1e-9, n: 1 } },
      { name: 'Elektron, 0,1 nm', note: 'Atomgröße – sehr grobe Näherung für ein Atom', values: { m: C.m_e.value, L: 1e-10, n: 1 } },
      { name: 'Proton, 10 fm', note: 'Kerngröße – das Kastenmodell ist hier nur ein Spielzeug', values: { m: C.m_p.value, L: 1e-14, n: 1 } },
      { name: 'Staubkorn, 1 µm', note: 'm = 10⁻¹⁵ kg: die Quantisierung ist unmessbar klein', values: { m: 1e-15, L: 1e-6, n: 1 } },
    ],
    graph: { x: 'L', y: 'E', xlog: true, ylog: true },
    viz: 'wavefunction',
    vizControls: [{ key: 'superpos', label: 'Überlagerung von n und n+1' }],
    explain: {
      intuition: 'Die Schrödinger-Gleichung beschreibt, wie sich eine Wellenfunktion mit der Zeit ändert. Sperrt man ein Teilchen in einen Kasten, passen nur stehende Wellen hinein – deshalb gibt es nur bestimmte Energien.',
      math: [
        { t: 'Zeitabhängig', tex: 'i\\hbar\\,\\partial_t \\psi = \\hat H \\psi' },
        { t: 'Hamilton-Operator für ein Teilchen im Potential', tex: '\\hat H = -\\frac{\\hbar^2}{2m}\\nabla^2 + V' },
        { t: 'Stationäre Zustände', tex: '\\psi(x,t) = \\phi(x)\\, e^{-iEt/\\hbar}' },
        { t: 'Kastenpotential der Breite L', tex: '\\phi_n(x) = \\sqrt{\\tfrac{2}{L}}\\,\\sin\\!\\bigl(\\tfrac{n\\pi x}{L}\\bigr),\\quad E_n = \\frac{n^2\\pi^2\\hbar^2}{2mL^2}' },
      ],
      physics: 'Die Gleichung gilt für nichtrelativistische Teilchen ohne Spin. Innerhalb dieses Bereichs ist sie eine der am besten bestätigten Gleichungen der Physik (Atomspektren, Chemie, Halbleiter). Der unendlich tiefe Kasten ist dagegen ein Lehrbuchmodell – reale Potentiale sind endlich. Die Wellenfunktion selbst ist nicht direkt messbar; messbar sind Wahrscheinlichkeiten |ψ|². Ein Einzelzustand hat deshalb eine zeitlich konstante Aufenthaltswahrscheinlichkeit; erst eine Überlagerung erzeugt sichtbare Dynamik.',
      epistemics: [
        { type: 'model', text: 'Nichtrelativistische Quantenmechanik (Schrödinger, 1926).' },
        { type: 'measured', text: 'Vorhersagen im Gültigkeitsbereich experimentell sehr präzise bestätigt.' },
        { type: 'approx', text: 'Kein Spin (→ Pauli-Gleichung), keine Relativität (→ Dirac-Gleichung, QFT).' },
        { type: 'assume', text: 'Idealer Potentialtopf mit unendlich hohen Wänden.' },
      ],
    },
  });

  define({
    id: 'planck', group: 'Famous Equations', hall: true, title: 'Planck-Einheiten', short: 'Planck-Einheiten',
    subtitle: 'Wenn Dimensionen zu Physik werden',
    tex: 'l_{\\mathrm{P}} = \\sqrt{\\frac{\\hbar G}{c^3}}',
    meta: { mathType: 'skalare Kombinationen von Konstanten', mainDim: 'L, T, M, Θ', domain: 'Dimensionsanalyse / Quantengravitation (spekulativ)', status: 'Werte aus Messgrößen; Deutung ist Erwartung' },
    vars: {},
    outputs: [
      { key: 'lP', sym: 'l_P', tex: 'l_{\\mathrm{P}}', name: 'Planck-Länge', expr: 'sqrt(hbar*G/c^3)', dim: 'L', primary: true },
      { key: 'tP', sym: 't_P', tex: 't_{\\mathrm{P}}', name: 'Planck-Zeit', expr: 'sqrt(hbar*G/c^5)', dim: 'T' },
      { key: 'mP', sym: 'm_P', tex: 'm_{\\mathrm{P}}', name: 'Planck-Masse', expr: 'sqrt(hbar*c/G)', dim: 'M' },
      { key: 'TP', sym: 'T_P', tex: 'T_{\\mathrm{P}}', name: 'Planck-Temperatur', expr: 'sqrt(hbar*c^5/(G*k_B^2))', dim: 'Θ' },
      { key: 'EP', sym: 'E_P', tex: 'E_{\\mathrm{P}}', name: 'Planck-Energie', expr: 'sqrt(hbar*c^5/G)', dim: 'M L^2 T^-2' },
    ],
    equations: [
      { label: 'Planck-Länge', eq: 'l_P = sqrt(hbar*G/c^3)' },
      { label: 'Planck-Zeit', eq: 't_P = sqrt(hbar*G/c^5)' },
      { label: 'Planck-Masse', eq: 'm_P = sqrt(hbar*c/G)' },
      { label: 'Planck-Temperatur', eq: 'T_P = sqrt(hbar*c^5/(G*k_B^2))' },
    ],
    symbols: { l_P: { dim: 'L' }, t_P: { dim: 'T' }, m_P: { dim: 'M' }, T_P: { dim: 'Θ' } },
    checks({ issues }) {
      issues.push({ cat: 'info', msg: 'Die Werte folgen allein aus Konstanten. Ihre Unsicherheit stammt fast vollständig von G.' });
    },
    presets: [],
    graph: null,
    viz: 'scales',
    explain: {
      intuition: 'Aus ħ, G, c und k_B lässt sich genau eine Länge, eine Zeit, eine Masse und eine Temperatur bauen. Das sind die Planck-Einheiten – natürliche Maßstäbe, die ohne menschliche Konventionen auskommen.',
      math: [
        { t: 'Länge', tex: 'l_{\\mathrm{P}} = \\sqrt{\\hbar G / c^3}' },
        { t: 'Zeit', tex: 't_{\\mathrm{P}} = \\sqrt{\\hbar G / c^5} = l_{\\mathrm{P}}/c' },
        { t: 'Masse', tex: 'm_{\\mathrm{P}} = \\sqrt{\\hbar c / G}' },
        { t: 'Temperatur', tex: 'T_{\\mathrm{P}} = \\sqrt{\\hbar c^5 / (G k_{\\mathrm{B}}^2)} = m_{\\mathrm{P}} c^2 / k_{\\mathrm{B}}' },
      ],
      physics: 'Die Planck-Einheiten sind zunächst ein Ergebnis der Dimensionsanalyse. Man erwartet, dass bei diesen Skalen Quanteneffekte der Gravitation wichtig werden – das ist eine Erwartung, keine Messung. Oft liest man, die Planck-Länge sei die „kleinste mögliche Länge“ oder der Raum sei dort „gepixelt“. Das ist nicht nachgewiesen und folgt auch nicht aus der Dimensionsanalyse. Außerdem gilt: Welche Kombination man „die“ Planck-Einheit nennt, ist teils Konvention (manche Autoren verwenden 8πG statt G).',
      epistemics: [
        { type: 'math', text: 'Eindeutige Kombination der Konstanten mit der gewünschten Dimension (bis auf dimensionslose Vorfaktoren).' },
        { type: 'assume', text: 'Die physikalische Bedeutung als Skala der Quantengravitation ist eine theoretische Erwartung.' },
        { type: 'measured', text: 'Die Zahlenwerte hängen am gemessenen G (relative Unsicherheit ≈ 1,1 × 10⁻⁵ für √G).' },
      ],
    },
  });

  // Order in the "Famous Equations" comparison table
  PP.hallOrder = ['hawking', 'bh-entropy', 'efe', 'schroedinger', 'planck'];
})(globalThis.PP = globalThis.PP || {});
