/* =====================================================================
   Physics Playground — Experiment definitions (pure data + checks)
   Every experiment — ordinary or "famous" — uses the same structure:
   vars → outputs (formulas) → equations (dimension analysis) → checks
   → presets → graph defaults → visualization → explanation.
   Texte stehen als { de, en }-Paare direkt nebeneinander; define()
   macht daraus Felder, die der aktiven Sprache folgen (src/core/i18n.js).
   ===================================================================== */
(function (PP) {
  'use strict';
  const { define, C } = PP.model;
  const T = PP.i18n.T;
  const MS = C.M_sun.value;
  const MECH = { de: 'Mechanik', en: 'Mechanics' };
  const NEG_MASS = { de: 'Negative Masse ist eine rein hypothetische Idee – beobachtet wurde sie nie.', en: 'Negative mass is a purely hypothetical idea – it has never been observed.' };

  /* ============================ MECHANIK ============================ */

  define({
    id: 'newton-gravity', group: MECH, field: 'mech', title: { de: 'Newtonsche Gravitation', en: 'Newtonian gravity' }, short: { de: 'Gravitation', en: 'Gravity' },
    tex: 'F = G\\,\\frac{m_1\\, m_2}{r^2}',
    vars: {
      G:  { label: 'G', tex: 'G', name: { de: 'Gravitationskonstante', en: 'Gravitational constant' }, dim: 'L^3 M^-1 T^-2', constant: 'G', min: 1e-15, max: 1e-3, scale: 'log' },
      m1: { label: 'm₁', tex: 'm_1', name: { de: 'Masse 1', en: 'Mass 1' }, dim: 'M', default: 1, min: 1e-3, max: 1e42, scale: 'log', positive: true, negNote: NEG_MASS },
      m2: { label: 'm₂', tex: 'm_2', name: { de: 'Masse 2', en: 'Mass 2' }, dim: 'M', default: 1, min: 1e-3, max: 1e42, scale: 'log', positive: true, negNote: NEG_MASS },
      r:  { label: 'r', tex: 'r', name: { de: 'Abstand der Schwerpunkte', en: 'Distance between the centres of mass' }, dim: 'L', default: 1, min: 1e-6, max: 1e14, scale: 'log', positive: true,
        negNote: { de: 'Ein Abstand ist nie negativ. Weil r quadriert wird, liefert die Formel für r < 0 trotzdem eine Zahl.', en: 'A distance is never negative. Because r is squared, the formula still returns a number for r < 0.' } },
    },
    outputs: [
      { key: 'F', sym: 'F', tex: 'F', name: { de: 'Gravitationskraft (Betrag)', en: 'Gravitational force (magnitude)' }, expr: 'G*m1*m2/r^2', dim: 'M L T^-2', primary: true },
      { key: 'a1', sym: 'a₁', tex: 'a_1', name: { de: 'Beschleunigung von m₁', en: 'Acceleration of m₁' }, expr: 'G*m2/r^2', dim: 'L T^-2' },
      { key: 'a2', sym: 'a₂', tex: 'a_2', name: { de: 'Beschleunigung von m₂', en: 'Acceleration of m₂' }, expr: 'G*m1/r^2', dim: 'L T^-2' },
      { key: 'U', sym: 'U', tex: 'U', name: { de: 'Potentielle Energie', en: 'Potential energy' }, expr: '-G*m1*m2/r', dim: 'M L^2 T^-2' },
      { key: 'rs', sym: 'r_s', tex: 'r_{\\mathrm{s}}', name: { de: 'Schwarzschild-Radius von m₁+m₂ (Modellcheck)', en: 'Schwarzschild radius of m₁+m₂ (model check)' }, expr: '2*G*(m1+m2)/c^2', dim: 'L' },
    ],
    equations: [
      { label: { de: 'Newtonsches Gravitationsgesetz', en: 'Newton’s law of gravitation' }, eq: 'F = G*m1*m2/r^2' },
      { label: { de: 'Potentielle Energie', en: 'Potential energy' }, eq: 'U = -G*m1*m2/r' },
    ],
    symbols: {},
    checks({ v, o, issues, fmt }) {
      const rs = o('rs');
      if (v.r > 0 && isFinite(rs) && rs > 0) {
        const q = rs / v.r;
        if (q >= 1) issues.push({ cat: 'model', why: T('innerhalb von r_s', 'inside r_s'), msg: T('r liegt innerhalb des Schwarzschild-Radius der Gesamtmasse (r_s ≈ ' + fmt(rs, 3) + ' m). Das Newton-Bild verliert hier jede Bedeutung.', 'r lies inside the Schwarzschild radius of the total mass (r_s ≈ ' + fmt(rs, 3) + ' m). The Newtonian picture loses all meaning here.') });
        else if (q > 0.01) issues.push({ cat: 'model', why: T('starkes Feld: ART nötig', 'strong field: GR needed'), msg: T('r ist nur ' + fmt(1 / q, 3) + ' r_s: starkes Gravitationsfeld – hier braucht es die Allgemeine Relativitätstheorie.', 'r is only ' + fmt(1 / q, 3) + ' r_s: a strong gravitational field – this needs general relativity.') });
        else if (q > 1e-9) issues.push({ cat: 'info', msg: T('Schwachfeld-Parameter r_s/r ≈ ' + fmt(q, 2) + ': relativistische Korrekturen sind klein, aber je nach Präzision messbar (vgl. Periheldrehung des Merkur).', 'Weak-field parameter r_s/r ≈ ' + fmt(q, 2) + ': relativistic corrections are small but, depending on precision, measurable (cf. the perihelion precession of Mercury).') });
      }
      if (v.r > 0 && v.r < 5e-5) issues.push({ cat: 'model', why: T('unter 50 µm nicht getestet', 'untested below 50 µm'), msg: T('Das 1/r²-Gesetz ist experimentell nur bis hinunter zu etwa 50 µm getestet (Torsionswaagen). Darunter ist das eine Extrapolation.', 'The 1/r² law has only been tested experimentally down to about 50 µm (torsion balances). Below that it is an extrapolation.') });
      issues.push({ cat: 'assume', msg: T('Punktmassen oder kugelsymmetrische Körper; r ist der Abstand der Schwerpunkte.', 'Point masses or spherically symmetric bodies; r is the distance between the centres of mass.') });
    },
    presets: [
      { name: { de: 'Zwei 1-kg-Massen', en: 'Two 1 kg masses' }, values: { m1: 1, m2: 1, r: 1 } },
      { name: { de: 'Erde – Apfel', en: 'Earth – apple' }, note: { de: 'Apfel 0,1 kg an der Erdoberfläche (r = mittlerer Erdradius)', en: '0.1 kg apple at the Earth’s surface (r = mean Earth radius)' }, values: { m1: C.M_earth.value, m2: 0.1, r: C.R_earth.value } },
      { name: { de: 'Erde – Mond', en: 'Earth – Moon' }, note: { de: 'mittlere Entfernung (große Halbachse), Werte ≈', en: 'mean distance (semi-major axis), values ≈' }, values: { m1: C.M_earth.value, m2: C.M_moon.value, r: C.d_moon.value } },
      { name: { de: 'Sonne – Erde', en: 'Sun – Earth' }, note: { de: 'r = 1 au (≈ mittlere Entfernung)', en: 'r = 1 au (≈ mean distance)' }, values: { m1: MS, m2: C.M_earth.value, r: C.au.value } },
      { name: { de: 'Zwei Schwarze Löcher', en: 'Two black holes' }, note: { de: 'GW150914-ähnliche Massen (≈36 und ≈29 M☉), r = 350 km illustrativ kurz vor der Verschmelzung – hier versagt Newton bewusst', en: 'GW150914-like masses (≈36 and ≈29 M☉), r = 350 km, illustratively just before the merger – Newton deliberately fails here' }, values: { m1: 36 * MS, m2: 29 * MS, r: 3.5e5 } },
    ],
    graph: { x: 'r', y: 'F' },
    viz: 'gravity',
    sweep: { key: 'r', span: 2, period: 4, label: { de: 'Abstand pendeln lassen', en: 'Oscillate the distance' } },
    explain: {
      intuition: {
        de: 'Zwei Massen ziehen sich an. Doppelte Masse bedeutet doppelte Kraft, doppelter Abstand nur noch ein Viertel der Kraft. Die Kraft wirkt auf beide Körper gleich stark, aber der leichtere wird viel stärker beschleunigt.',
        en: 'Two masses attract each other. Twice the mass means twice the force; twice the distance means only a quarter of the force. The force acts equally on both bodies, but the lighter one is accelerated much more.',
      },
      math: [
        { t: { de: 'Kraftgesetz', en: 'Force law' }, tex: 'F = G\\,\\frac{m_1 m_2}{r^2}' },
        { t: { de: 'Nach r umgestellt', en: 'Solved for r' }, tex: 'r = \\sqrt{\\frac{G\\, m_1 m_2}{F}}' },
        { t: { de: 'Skalierung: Abstand ×k', en: 'Scaling: distance ×k' }, tex: 'F(k\\,r) = \\frac{F(r)}{k^2}' },
        { t: { de: 'Beschleunigung von m₁ (m₁ kürzt sich)', en: 'Acceleration of m₁ (m₁ cancels)' }, tex: 'a_1 = \\frac{F}{m_1} = \\frac{G\\,m_2}{r^2}' },
      ],
      physics: {
        de: 'Newtons Gesetz ist ein Modell der klassischen Mechanik. Es beschreibt Gravitation als instantane Fernwirkung zwischen Massen. Die Allgemeine Relativitätstheorie ersetzt das durch gekrümmte Raumzeit; Newton ist ihr Grenzfall für schwache Felder (r ≫ r_s) und kleine Geschwindigkeiten (v ≪ c). Außerhalb davon – nahe Schwarzer Löcher, bei Neutronensternen oder für Lichtablenkung – liefert Newton falsche Ergebnisse.',
        en: 'Newton’s law is a model of classical mechanics. It describes gravity as an instantaneous action at a distance between masses. General relativity replaces this with curved spacetime; Newton is its limiting case for weak fields (r ≫ r_s) and low speeds (v ≪ c). Outside that regime – near black holes, for neutron stars or for the bending of light – Newton gives wrong results.',
      },
      epistemics: [
        { type: 'math', text: { de: 'F ∝ m₁m₂/r² ist eine mathematische Funktion; sie ist für r = 0 undefiniert.', en: 'F ∝ m₁m₂/r² is a mathematical function; it is undefined at r = 0.' } },
        { type: 'model', text: { de: 'Klassisches Gravitationsmodell (Newton, 1687).', en: 'Classical model of gravity (Newton, 1687).' } },
        { type: 'approx', text: { de: 'Schwachfeld- und Langsamkeitsgrenzfall der Allgemeinen Relativitätstheorie.', en: 'Weak-field, low-speed limit of general relativity.' } },
        { type: 'measured', text: { de: 'G ist gemessen (CODATA 2022: 6,67430(15) × 10⁻¹¹ m³ kg⁻¹ s⁻², relative Unsicherheit 2,2 × 10⁻⁵ – eine der am ungenauesten bekannten Konstanten).', en: 'G is measured (CODATA 2022: 6.67430(15) × 10⁻¹¹ m³ kg⁻¹ s⁻², relative uncertainty 2.2 × 10⁻⁵ – one of the least precisely known constants).' } },
        { type: 'assume', text: { de: 'Punktmassen bzw. kugelsymmetrische Massenverteilungen (Schalentheorem).', en: 'Point masses or spherically symmetric mass distributions (shell theorem).' } },
      ],
    },
  });

  define({
    id: 'kinematics', group: MECH, field: 'mech', title: { de: 'Gleichmäßig beschleunigte Bewegung', en: 'Uniformly accelerated motion' }, short: { de: 'Kinematik', en: 'Kinematics' },
    tex: 's(t) = s_0 + v_0\\,t + \\tfrac12\\,a\\,t^2',
    vars: {
      s0: { label: 's₀', tex: 's_0', name: { de: 'Startposition', en: 'Initial position' }, dim: 'L', default: 0, min: -100, max: 100, scale: 'lin' },
      v0: { label: 'v₀', tex: 'v_0', name: { de: 'Anfangsgeschwindigkeit', en: 'Initial velocity' }, dim: 'L T^-1', default: 5, min: -50, max: 50, scale: 'lin' },
      a:  { label: 'a', tex: 'a', name: { de: 'Beschleunigung (konstant)', en: 'Acceleration (constant)' }, dim: 'L T^-2', default: 2, min: -20, max: 20, scale: 'lin' },
      t:  { label: 't', tex: 't', name: { de: 'Zeit', en: 'Time' }, dim: 'T', default: 3, min: 0, max: 20, scale: 'lin', time: true },
    },
    outputs: [
      { key: 's', sym: 's', tex: 's', name: { de: 'Position', en: 'Position' }, expr: 's0 + v0*t + 0.5*a*t^2', dim: 'L', primary: true },
      { key: 'v', sym: 'v', tex: 'v', name: { de: 'Geschwindigkeit', en: 'Velocity' }, expr: 'v0 + a*t', dim: 'L T^-1' },
      { key: 'ds', sym: 'Δs', tex: '\\Delta s', name: { de: 'Verschiebung seit t = 0', en: 'Displacement since t = 0' }, expr: 'v0*t + 0.5*a*t^2', dim: 'L' },
    ],
    equations: [
      { label: { de: 'Ort-Zeit-Gesetz', en: 'Position–time law' }, eq: 's = s0 + v0*t + 0.5*a*t^2' },
      { label: { de: 'Geschwindigkeit-Zeit-Gesetz', en: 'Velocity–time law' }, eq: 'v = v0 + a*t' },
    ],
    checks({ v, o, issues, C }) {
      if (v.t < 0) issues.push({ cat: 'info', msg: T('Negative Zeit: Die Formel extrapoliert rückwärts. Mathematisch zulässig, sofern die Beschleunigung vorher schon konstant war.', 'Negative time: the formula extrapolates backwards. Mathematically fine, provided the acceleration was already constant before.') });
      const vel = Math.abs(o('v'));
      if (vel > 0.1 * C.c) issues.push({ cat: 'model', why: T('|v| > 0,1 c: relativistisch', '|v| > 0.1 c: relativistic'), msg: T('|v| > 0,1 c: nichtrelativistische Kinematik ist hier ungenau.', '|v| > 0.1 c: non-relativistic kinematics is inaccurate here.') });
      if (vel > C.c) issues.push({ cat: 'unreal', why: T('schneller als Licht', 'faster than light'), msg: T('Schneller als Licht – nach der Relativitätstheorie für massive Körper ausgeschlossen. Konstante Beschleunigung kann nicht beliebig lange andauern.', 'Faster than light – ruled out for massive bodies by relativity. Constant acceleration cannot go on indefinitely.') });
      issues.push({ cat: 'assume', msg: T('Die Beschleunigung ist über die ganze Zeit exakt konstant.', 'The acceleration is exactly constant the whole time.') });
    },
    presets: [
      { name: { de: 'Anfahrendes Auto', en: 'Car pulling away' }, values: { s0: 0, v0: 0, a: 3, t: 5 } },
      { name: { de: 'Vollbremsung aus 108 km/h', en: 'Emergency stop from 108 km/h' }, values: { s0: 0, v0: 30, a: -8, t: 3.75 } },
      { name: { de: 'Senkrechter Wurf (1D)', en: 'Vertical throw (1D)' }, note: { de: 'a = −g_n, Luftwiderstand vernachlässigt', en: 'a = −g_n, air resistance neglected' }, values: { s0: 0, v0: 15, a: -C.g_n.value, t: 1.5 } },
    ],
    graph: { x: 't', y: 's', also: ['v'] },
    viz: 'kinematics', animateVar: 't',
    explain: {
      intuition: {
        de: 'Wer konstant beschleunigt, legt in jeder Sekunde ein Stück mehr Weg zurück als in der vorherigen. Deshalb wächst die Position quadratisch mit der Zeit, die Geschwindigkeit nur linear.',
        en: 'If you accelerate steadily, you cover a bit more distance each second than in the one before. That is why position grows quadratically with time, while velocity grows only linearly.',
      },
      math: [
        { t: { de: 'Ort', en: 'Position' }, tex: 's(t) = s_0 + v_0 t + \\tfrac12 a t^2' },
        { t: { de: 'Ableitung liefert die Geschwindigkeit', en: 'The derivative gives the velocity' }, tex: 'v(t) = \\frac{\\mathrm{d}s}{\\mathrm{d}t} = v_0 + a t' },
        { t: { de: 'Zeitfrei', en: 'Without time' }, tex: 'v^2 = v_0^2 + 2a\\,(s - s_0)' },
      ],
      physics: {
        de: 'Die Gleichung ist exakt, sofern die Beschleunigung wirklich konstant ist – das ist eine mathematische Folge, kein Naturgesetz. Reale Bewegungen haben meist veränderliche Beschleunigung (Reibung, Luftwiderstand, Motorkennlinie). Für Geschwindigkeiten nahe c gilt die spezielle Relativitätstheorie.',
        en: 'The equation is exact as long as the acceleration really is constant – that is a mathematical consequence, not a law of nature. Real motion usually has varying acceleration (friction, air resistance, engine characteristics). For speeds close to c, special relativity applies.',
      },
      epistemics: [
        { type: 'math', text: { de: 'Zweifache Integration einer konstanten Beschleunigung – exakt.', en: 'Integrating a constant acceleration twice – exact.' } },
        { type: 'model', text: { de: 'Newtonsche Kinematik eines Massenpunkts in einer Dimension.', en: 'Newtonian kinematics of a point mass in one dimension.' } },
        { type: 'assume', text: { de: 'a = konstant; keine Reibung; v ≪ c.', en: 'a = constant; no friction; v ≪ c.' } },
      ],
    },
  });

  define({
    id: 'free-fall', group: MECH, field: 'mech', title: { de: 'Freier Fall', en: 'Free fall' }, short: { de: 'Freier Fall', en: 'Free fall' },
    tex: 'h(t) = h_0 - \\tfrac12\\, g\\, t^2',
    vars: {
      h0: { label: 'h₀', tex: 'h_0', name: { de: 'Starthöhe', en: 'Initial height' }, dim: 'L', default: 100, min: 0, max: 1000, scale: 'lin' },
      g:  { label: 'g', tex: 'g', name: { de: 'Fallbeschleunigung', en: 'Gravitational acceleration' }, dim: 'L T^-2', default: C.g_n.value, min: 0.1, max: 30, scale: 'lin', positive: true },
      t:  { label: 't', tex: 't', name: { de: 'Zeit', en: 'Time' }, dim: 'T', default: 2, min: 0, max: 15, scale: 'lin', time: true },
    },
    outputs: [
      { key: 'h', sym: 'h', tex: 'h', name: { de: 'Höhe', en: 'Height' }, expr: 'h0 - 0.5*g*t^2', dim: 'L', primary: true },
      { key: 'v', sym: 'v', tex: 'v', name: { de: 'Fallgeschwindigkeit (Betrag)', en: 'Falling speed (magnitude)' }, expr: 'g*t', dim: 'L T^-1' },
      { key: 'tf', sym: { de: 't_Fall', en: 't_fall' }, tex: { de: 't_{\\mathrm{Fall}}', en: 't_{\\mathrm{fall}}' }, name: { de: 'Fallzeit bis zum Boden', en: 'Time to reach the ground' }, expr: 'sqrt(2*h0/g)', dim: 'T' },
      { key: 'vi', sym: { de: 'v_Aufprall', en: 'v_impact' }, tex: { de: 'v_{\\mathrm{Aufprall}}', en: 'v_{\\mathrm{impact}}' }, name: { de: 'Aufprallgeschwindigkeit', en: 'Impact speed' }, expr: 'sqrt(2*g*h0)', dim: 'L T^-1' },
    ],
    equations: [
      { label: { de: 'Höhe', en: 'Height' }, eq: 'h = h0 - 0.5*g*t^2' },
      { label: { de: 'Fallzeit', en: 'Fall time' }, eq: 't_F = sqrt(2*h0/g)' },
    ],
    symbols: { t_F: { dim: 'T' } },
    checks({ v, o, issues }) {
      if (o('h') < 0) issues.push({ cat: 'model', why: T('nach dem Aufprall', 'after impact'), on: ['t'], msg: T('h < 0: Der Körper wäre schon bei t ≈ ' + PP.engine.fmt(o('tf'), 3) + ' s aufgeschlagen. Danach beschreibt die Formel nichts Reales mehr.', 'h < 0: the body would already have hit the ground at t ≈ ' + PP.engine.fmt(o('tf'), 3) + ' s. After that the formula no longer describes anything real.') });
      if (v.h0 < 0) issues.push({ cat: 'unreal', why: T('Start unter dem Boden', 'start below the ground'), msg: T('Negative Starthöhe: Der Körper läge unter dem Boden.', 'Negative initial height: the body would be below the ground.') });
      if (o('v') > 30) issues.push({ cat: 'model', why: T('in Luft: Luftwiderstand (v > 30 m/s)', 'in air: drag (v > 30 m/s)'), on: ['t'], msg: T('In Luft wäre der Luftwiderstand bei über 30 m/s bereits erheblich. Das Modell gilt streng nur im Vakuum.', 'In air, drag would already be considerable above 30 m/s. Strictly, the model only holds in a vacuum.') });
      if (v.h0 > 1e5) issues.push({ cat: 'model', why: T('über 100 km: g nicht konstant', 'above 100 km: g not constant'), msg: T('Über ~100 km Höhe nimmt g merklich ab; konstantes g ist dann eine schlechte Näherung.', 'Above ~100 km altitude g drops noticeably; a constant g is then a poor approximation.') });
      issues.push({ cat: 'assume', msg: T('Vakuum, konstantes g, Start aus der Ruhe.', 'Vacuum, constant g, starting from rest.') });
    },
    presets: [
      { name: { de: 'Erde (g_n)', en: 'Earth (g_n)' }, note: { de: 'Normfallbeschleunigung, Konvention', en: 'standard gravity, a convention' }, values: { h0: 100, g: C.g_n.value, t: 2 } },
      { name: { de: 'Mond', en: 'Moon' }, note: { de: 'g ≈ 1,62 m/s²', en: 'g ≈ 1.62 m/s²' }, values: { h0: 100, g: 1.62, t: 5 } },
      { name: 'Mars', note: { de: 'g ≈ 3,72 m/s²', en: 'g ≈ 3.72 m/s²' }, values: { h0: 100, g: 3.72, t: 4 } },
      { name: { de: 'Jupiter (Wolkenobergrenze)', en: 'Jupiter (cloud tops)' }, note: { de: 'g ≈ 24,8 m/s²', en: 'g ≈ 24.8 m/s²' }, values: { h0: 100, g: 24.79, t: 1.5 } },
      { name: { de: 'Fallturm Bremen', en: 'Bremen Drop Tower' }, note: { de: 'Fallstrecke ≈ 110 m in einer evakuierten Röhre', en: 'drop height ≈ 110 m in an evacuated tube' }, values: { h0: 110, g: C.g_n.value, t: 3 } },
    ],
    graph: { x: 't', y: 'h', also: ['v'], view: { to: 'tf', f: 1.1 } },
    viz: 'freefall', animateVar: 't', animateUntil: 'tf',
    explain: {
      intuition: {
        de: 'Ohne Luft fallen Feder und Hammer gleich schnell. Die Geschwindigkeit wächst jede Sekunde um g – auf der Erde also um knapp 10 m/s.',
        en: 'Without air, a feather and a hammer fall equally fast. The speed grows by g every second – on Earth by just under 10 m/s.',
      },
      math: [
        { t: { de: 'Höhe', en: 'Height' }, tex: 'h(t) = h_0 - \\tfrac12 g t^2' },
        { t: { de: 'Aus h = 0 folgt die Fallzeit', en: 'Setting h = 0 gives the fall time' }, tex: { de: 't_{\\mathrm{Fall}} = \\sqrt{\\frac{2h_0}{g}}', en: 't_{\\mathrm{fall}} = \\sqrt{\\frac{2h_0}{g}}' } },
        { t: { de: 'Aufprallgeschwindigkeit', en: 'Impact speed' }, tex: 'v = \\sqrt{2 g h_0}' },
      ],
      physics: {
        de: 'Spezialfall der Kinematik mit a = −g. Der Wert 9,80665 m/s² ist eine Konvention; das tatsächliche g hängt von Breitengrad, Höhe und lokaler Geologie ab. Die Masse kommt nicht vor, weil schwere und träge Masse gleich sind (Äquivalenzprinzip, experimentell auf etwa 10⁻¹⁵ geprüft).',
        en: 'A special case of kinematics with a = −g. The value 9.80665 m/s² is a convention; the actual g depends on latitude, altitude and local geology. Mass does not appear because gravitational and inertial mass are equal (equivalence principle, tested experimentally to about 10⁻¹⁵).',
      },
      epistemics: [
        { type: 'model', text: { de: 'Freier Fall im homogenen Schwerefeld.', en: 'Free fall in a uniform gravitational field.' } },
        { type: 'approx', text: { de: 'Konstantes g gilt nur für Höhen ≪ Erdradius.', en: 'A constant g only holds for heights ≪ the Earth’s radius.' } },
        { type: 'measured', text: { de: 'Gleichheit von träger und schwerer Masse: experimentell sehr genau bestätigt (z. B. MICROSCOPE-Mission).', en: 'Equality of inertial and gravitational mass: confirmed experimentally to high precision (e.g. the MICROSCOPE mission).' } },
        { type: 'assume', text: { de: 'Kein Luftwiderstand.', en: 'No air resistance.' } },
      ],
    },
  });

  define({
    id: 'spring', group: MECH, field: 'mech', title: { de: 'Federpendel (Hookesches Gesetz)', en: 'Mass on a spring (Hooke’s law)' }, short: { de: 'Feder', en: 'Spring' },
    tex: 'F = -k\\,x',
    vars: {
      k: { label: 'k', tex: 'k', name: { de: 'Federkonstante', en: 'Spring constant' }, dim: 'M T^-2', default: 50, min: 0.1, max: 1e6, scale: 'log', positive: true },
      m: { label: 'm', tex: 'm', name: { de: 'Masse', en: 'Mass' }, dim: 'M', default: 1, min: 0.01, max: 1000, scale: 'log', positive: true },
      x: { label: 'x', tex: 'x', name: { de: 'Auslenkung (Startwert der Schwingung)', en: 'Displacement (initial amplitude)' }, dim: 'L', default: 0.1, min: -0.5, max: 0.5, scale: 'lin' },
    },
    outputs: [
      { key: 'F', sym: 'F', tex: 'F', name: { de: 'Rückstellkraft', en: 'Restoring force' }, expr: '-k*x', dim: 'M L T^-2', primary: true },
      { key: 'omega', sym: 'ω', tex: '\\omega', name: { de: 'Kreisfrequenz', en: 'Angular frequency' }, expr: 'sqrt(k/m)', dim: 'T^-1' },
      { key: 'T', sym: 'T', tex: 'T', name: { de: 'Periodendauer', en: 'Period' }, expr: '2*pi*sqrt(m/k)', dim: 'T' },
      { key: 'E', sym: 'E', tex: 'E', name: { de: 'Gespeicherte Energie', en: 'Stored energy' }, expr: '0.5*k*x^2', dim: 'M L^2 T^-2' },
      { key: 'vmax', sym: 'v_max', tex: 'v_{\\max}', name: { de: 'Maximalgeschwindigkeit', en: 'Maximum speed' }, expr: 'abs(x)*sqrt(k/m)', dim: 'L T^-1' },
    ],
    equations: [
      { label: { de: 'Hookesches Gesetz', en: 'Hooke’s law' }, eq: 'F = -k*x' },
      { label: { de: 'Periodendauer', en: 'Period' }, eq: 'T = 2*pi*sqrt(m/k)' },
    ],
    checks({ v, issues }) {
      if (Math.abs(v.x) > 0.3) issues.push({ cat: 'model', why: T('Feder nicht mehr linear', 'spring no longer linear'), msg: T('Große Auslenkung: Reale Federn verlassen irgendwann den linearen Bereich – dann gilt F = −kx nicht mehr.', 'Large displacement: real springs eventually leave the linear range – then F = −kx no longer holds.') });
      issues.push({ cat: 'assume', msg: T('Ideale, masselose Feder ohne Dämpfung.', 'Ideal, massless spring without damping.') });
    },
    presets: [
      { name: { de: 'Weiche Feder', en: 'Soft spring' }, values: { k: 10, m: 0.5, x: 0.2 } },
      { name: { de: 'Harte Feder', en: 'Stiff spring' }, values: { k: 2000, m: 1, x: 0.02 } },
      { name: { de: 'Autofederung (grob)', en: 'Car suspension (rough)' }, note: { de: 'Viertelfahrzeug, Größenordnung ≈', en: 'quarter-car model, order of magnitude ≈' }, values: { k: 2e4, m: 300, x: 0.05 } },
    ],
    graph: { x: 'x', y: 'F' },
    viz: 'spring',
    explain: {
      intuition: {
        de: 'Je weiter man eine Feder zieht, desto stärker zieht sie zurück – proportional. Das erzeugt eine Schwingung, deren Takt nicht von der Auslenkung abhängt, sondern nur von Masse und Federhärte.',
        en: 'The further you stretch a spring, the harder it pulls back – in proportion. This produces an oscillation whose rhythm does not depend on the amplitude, only on the mass and the stiffness of the spring.',
      },
      math: [
        { t: { de: 'Bewegungsgleichung', en: 'Equation of motion' }, tex: 'm\\,\\ddot x = -k\\,x' },
        { t: { de: 'Lösung', en: 'Solution' }, tex: 'x(t) = x_0 \\cos(\\omega t),\\quad \\omega = \\sqrt{k/m}' },
        { t: { de: 'Periodendauer', en: 'Period' }, tex: 'T = 2\\pi\\sqrt{m/k}' },
      ],
      physics: {
        de: 'Das Hookesche Gesetz ist eine lineare Näherung für kleine Auslenkungen: Fast jede Kraft um ein stabiles Gleichgewicht sieht in erster Ordnung so aus. Deshalb ist der harmonische Oszillator eines der wichtigsten Modelle der Physik – bis in die Quantenfeldtheorie.',
        en: 'Hooke’s law is a linear approximation for small displacements: almost any force around a stable equilibrium looks like this to first order. That is why the harmonic oscillator is one of the most important models in physics – all the way up to quantum field theory.',
      },
      epistemics: [
        { type: 'approx', text: { de: 'Lineare Näherung (Taylor-Entwicklung erster Ordnung um das Gleichgewicht).', en: 'Linear approximation (first-order Taylor expansion around the equilibrium).' } },
        { type: 'model', text: { de: 'Idealer harmonischer Oszillator: keine Dämpfung, masselose Feder.', en: 'Ideal harmonic oscillator: no damping, massless spring.' } },
        { type: 'math', text: { de: 'Die Periodendauer ist exakt unabhängig von der Amplitude – solange das Modell gilt.', en: 'The period is exactly independent of the amplitude – as long as the model holds.' } },
      ],
    },
  });

  define({
    id: 'circular', group: MECH, field: 'mech', title: { de: 'Gleichförmige Kreisbewegung', en: 'Uniform circular motion' }, short: { de: 'Kreisbewegung', en: 'Circular motion' },
    tex: 'a = \\frac{v^2}{r}',
    vars: {
      v: { label: 'v', tex: 'v', name: { de: 'Bahngeschwindigkeit', en: 'Orbital speed' }, dim: 'L T^-1', default: 10, min: 0.01, max: 1e6, scale: 'log', positive: true },
      r: { label: 'r', tex: 'r', name: { de: 'Bahnradius', en: 'Radius of the path' }, dim: 'L', default: 5, min: 0.01, max: 1e12, scale: 'log', positive: true },
      m: { label: 'm', tex: 'm', name: { de: 'Masse', en: 'Mass' }, dim: 'M', default: 1, min: 1e-3, max: 1e30, scale: 'log', positive: true },
    },
    outputs: [
      { key: 'a', sym: 'a', tex: 'a', name: { de: 'Zentripetalbeschleunigung', en: 'Centripetal acceleration' }, expr: 'v^2/r', dim: 'L T^-2', primary: true },
      { key: 'ag', sym: 'a/g_n', tex: 'a/g_n', name: { de: 'in Vielfachen von g_n', en: 'in multiples of g_n' }, expr: 'v^2/r/g_n', dim: '' },
      { key: 'F', sym: 'F', tex: 'F', name: { de: 'Zentripetalkraft', en: 'Centripetal force' }, expr: 'm*v^2/r', dim: 'M L T^-2' },
      { key: 'T', sym: 'T', tex: 'T', name: { de: 'Umlaufzeit', en: 'Period of revolution' }, expr: '2*pi*r/v', dim: 'T' },
      { key: 'omega', sym: 'ω', tex: '\\omega', name: { de: 'Winkelgeschwindigkeit', en: 'Angular velocity' }, expr: 'v/r', dim: 'T^-1' },
    ],
    equations: [
      { label: { de: 'Zentripetalbeschleunigung', en: 'Centripetal acceleration' }, eq: 'a = v^2/r' },
      { label: { de: 'Zentripetalkraft', en: 'Centripetal force' }, eq: 'F = m*v^2/r' },
    ],
    checks({ v, issues, C }) {
      if (v.v > C.c) issues.push({ cat: 'unreal', why: 'v > c', msg: T('v > c: Kein massiver Körper erreicht Lichtgeschwindigkeit.', 'v > c: no massive body reaches the speed of light.') });
      else if (v.v > 0.1 * C.c) issues.push({ cat: 'model', why: T('v > 0,1 c: relativistisch', 'v > 0.1 c: relativistic'), msg: T('v > 0,1 c: relativistische Korrekturen werden wichtig.', 'v > 0.1 c: relativistic corrections become important.') });
      issues.push({ cat: 'assume', msg: T('Konstanter Betrag der Geschwindigkeit, exakte Kreisbahn.', 'Constant speed, exactly circular path.') });
    },
    presets: [
      { name: { de: 'Karussell', en: 'Merry-go-round' }, values: { v: 5, r: 5, m: 70 } },
      { name: { de: 'Laborzentrifuge', en: 'Lab centrifuge' }, note: { de: 'Größenordnung ≈ 10 000 g', en: 'order of magnitude ≈ 10,000 g' }, values: { v: 100, r: 0.1, m: 0.01 } },
      { name: 'ISS', note: { de: 'Bahnhöhe ≈ 420 km, v ≈ 7,66 km/s, m ≈ 420 t', en: 'altitude ≈ 420 km, v ≈ 7.66 km/s, m ≈ 420 t' }, values: { v: 7660, r: 6.791e6, m: 4.2e5 } },
      { name: { de: 'Mond um die Erde', en: 'Moon around the Earth' }, note: { de: 'mittlere Werte ≈ (die Bahn ist leicht elliptisch)', en: 'mean values ≈ (the orbit is slightly elliptical)' }, values: { v: 1022, r: C.d_moon.value, m: C.M_moon.value } },
    ],
    graph: { x: 'v', y: 'a' },
    viz: 'circular',
    explain: {
      intuition: {
        de: 'Wer im Kreis fährt, wird ständig zur Mitte hin beschleunigt – auch bei konstantem Tempo, denn die Richtung ändert sich laufend. Doppeltes Tempo heißt vierfache Beschleunigung.',
        en: 'Anything moving in a circle is constantly accelerated towards the centre – even at constant speed, because its direction keeps changing. Twice the speed means four times the acceleration.',
      },
      math: [
        { t: { de: 'Zentripetalbeschleunigung', en: 'Centripetal acceleration' }, tex: 'a = \\frac{v^2}{r} = \\omega^2 r' },
        { t: { de: 'Umlaufzeit', en: 'Period of revolution' }, tex: 'T = \\frac{2\\pi r}{v}' },
        { t: { de: 'Kreisbahn durch Gravitation (Beispiel ISS)', en: 'Circular orbit due to gravity (e.g. the ISS)' }, tex: '\\frac{v^2}{r} = \\frac{G M}{r^2}' },
      ],
      physics: {
        de: 'a = v²/r ist reine Kinematik und gilt für jede gleichförmige Kreisbewegung, egal welche Kraft sie verursacht (Seil, Reibung, Gravitation). Für die ISS entspricht a fast dem lokalen g – die Astronauten sind nicht schwerelos, weil die Schwerkraft fehlt, sondern weil sie ständig mitfallen.',
        en: 'a = v²/r is pure kinematics and holds for any uniform circular motion, whatever force causes it (a rope, friction, gravity). For the ISS, a is almost the local g – the astronauts are not weightless because gravity is missing, but because they are constantly falling along with the station.',
      },
      epistemics: [
        { type: 'math', text: { de: 'Geometrische Folge der Kreisbahn – exakt.', en: 'A geometric consequence of the circular path – exact.' } },
        { type: 'model', text: { de: 'Massenpunkt auf idealer Kreisbahn; nichtrelativistisch.', en: 'Point mass on an ideal circular path; non-relativistic.' } },
      ],
    },
  });

  define({
    id: 'pendulum', group: MECH, field: 'mech', title: { de: 'Fadenpendel: Näherung und exakte Lösung', en: 'Simple pendulum: approximation and exact solution' }, short: { de: 'Fadenpendel', en: 'Pendulum' },
    tex: 'T = 4\\sqrt{\\frac{L}{g}}\\;K\\left(\\sin\\frac{\\theta_0}{2}\\right)',
    vars: {
      L: { label: 'L', tex: 'L', name: { de: 'Fadenlänge', en: 'Length of the string' }, dim: 'L', default: 1, min: 0.01, max: 100, scale: 'log', positive: true },
      g: { label: 'g', tex: 'g', name: { de: 'Fallbeschleunigung', en: 'Gravitational acceleration' }, dim: 'L T^-2', default: C.g_n.value, min: 0.1, max: 30, scale: 'lin', positive: true },
      th: { label: 'θ₀', tex: '\\theta_0', name: { de: 'Amplitude (Startwinkel in Grad)', en: 'Amplitude (starting angle in degrees)' }, dim: '', default: 10, min: 0, max: 179, scale: 'lin' },
    },
    outputs: [
      { key: 'T', sym: 'T', tex: 'T', name: { de: 'Periodendauer (exakt)', en: 'Period (exact)' }, expr: '4*sqrt(L/g)*ellipk(sin(th*pi/360))', dim: 'T', primary: true },
      { key: 'T0', sym: 'T₀', tex: 'T_0', name: { de: 'Periodendauer (Kleinwinkelnäherung)', en: 'Period (small-angle approximation)' }, expr: '2*pi*sqrt(L/g)', dim: 'T' },
      { key: 'q', sym: 'T/T₀', tex: 'T/T_0', name: { de: 'Verhältnis exakt zu Näherung', en: 'Ratio of exact to approximate' }, expr: 'T/T0', dim: '', digits: 8 },
      { key: 'err', sym: { de: 'Fehler / %', en: 'error / %' }, tex: '\\Delta T/T', name: { de: 'Fehler der Näherung in Prozent', en: 'Error of the approximation in per cent' }, expr: '(T - T0)/T*100', dim: '' },
      { key: 'vmax', sym: 'v_max', tex: 'v_{\\max}', name: { de: 'Geschwindigkeit am tiefsten Punkt', en: 'Speed at the lowest point' }, expr: 'sqrt(2*g*L*(1 - cos(th*pi/180)))', dim: 'L T^-1' },
    ],
    equations: [
      { label: { de: 'Kleinwinkelnäherung', en: 'Small-angle approximation' }, eq: 'T0 = 2*pi*sqrt(L/g)' },
      { label: { de: 'Exakte Periodendauer', en: 'Exact period' }, eq: 'T = 4*sqrt(L/g)*ellipk(sin(th*pi/360))' },
      { label: { de: 'Energieerhaltung', en: 'Conservation of energy' }, eq: 'v_max = sqrt(2*g*L*(1 - cos(th*pi/180)))' },
    ],
    symbols: { v_max: { dim: 'L T^-1' } },
    checks({ v, o, issues, fmt }) {
      const err = o('err');
      if (v.th < 0) issues.push({ cat: 'info', msg: T('Negativer Winkel heißt nur: zur anderen Seite ausgelenkt. T hängt von |θ₀| ab.', 'A negative angle just means a swing to the other side. T depends on |θ₀|.') });
      if (isFinite(err) && err >= 1) issues.push({ cat: 'model', why: T('Kleinwinkelnäherung ≥ 1 % daneben', 'small-angle approximation off by ≥ 1 %'), on: ['T0'], msg: T('Die Kleinwinkelnäherung sin θ ≈ θ liegt hier um ' + fmt(err, 2) + ' % daneben: T₀ ist zu kurz. Die exakte Periodendauer T bleibt gültig.', 'The small-angle approximation sin θ ≈ θ is off by ' + fmt(err, 2) + ' % here: T₀ is too short. The exact period T remains valid.') });
      else if (isFinite(err) && err >= 0.1) issues.push({ cat: 'info', msg: T('Die Kleinwinkelnäherung weicht um ' + fmt(err, 2) + ' % ab – für eine Pendeluhr schon viel.', 'The small-angle approximation is off by ' + fmt(err, 2) + ' % – already a lot for a pendulum clock.') });
      if (Math.abs(v.th) > 90) issues.push({ cat: 'model', why: T('über 90°: Faden schlaff', 'beyond 90°: string goes slack'), msg: T('Über 90° würde ein Faden anfangs schlaff: Das Modell gilt dann nur für eine starre Stange.', 'Beyond 90° a string would go slack at first: the model then only applies to a rigid rod.') });
      issues.push({ cat: 'assume', msg: T('Punktmasse an masseloser, starrer Aufhängung; keine Reibung; konstantes g.', 'Point mass on a massless, rigid suspension; no friction; constant g.') });
    },
    presets: [
      { name: { de: 'Kleine Auslenkung (5°)', en: 'Small swing (5°)' }, values: { L: 1, g: C.g_n.value, th: 5 } },
      { name: { de: 'Große Auslenkung (60°)', en: 'Large swing (60°)' }, values: { L: 1, g: C.g_n.value, th: 60 } },
      { name: { de: 'Waagerecht losgelassen (90°)', en: 'Released horizontally (90°)' }, values: { L: 1, g: C.g_n.value, th: 90 } },
      { name: { de: 'Fast Überschlag (170°)', en: 'Almost upside down (170°)' }, note: { de: 'nur mit starrer Stange möglich', en: 'only possible with a rigid rod' }, values: { L: 1, g: C.g_n.value, th: 170 } },
      { name: { de: 'Sekundenpendel', en: 'Seconds pendulum' }, note: { de: 'L ≈ 0,994 m: Jede Halbschwingung dauert 1 s', en: 'L ≈ 0.994 m: each half-swing takes 1 s' }, values: { L: 0.9936, g: C.g_n.value, th: 3 } },
    ],
    graph: { x: 'th', y: 'T', also: ['T0'] },
    viz: 'pendulum',
    explain: {
      intuition: {
        de: 'Bei kleinen Ausschlägen schwingt ein Pendel in festem Takt, egal wie weit man es auslenkt. Das stimmt aber nur näherungsweise: Je größer die Amplitude, desto länger dauert eine Schwingung. Bei 90° sind es schon 18 % mehr.',
        en: 'For small swings, a pendulum keeps a fixed rhythm no matter how far you pull it out. But that is only approximately true: the larger the amplitude, the longer a swing takes. At 90° it is already 18 % more.',
      },
      math: [
        { t: { de: 'Bewegungsgleichung', en: 'Equation of motion' }, tex: '\\ddot\\theta = -\\frac{g}{L}\\sin\\theta' },
        { t: { de: 'Kleinwinkelnäherung sin θ ≈ θ', en: 'Small-angle approximation sin θ ≈ θ' }, tex: 'T_0 = 2\\pi\\sqrt{L/g}' },
        { t: { de: 'Exakt, mit dem vollständigen elliptischen Integral K', en: 'Exact, with the complete elliptic integral K' }, tex: 'T = 4\\sqrt{\\frac{L}{g}}\\;K\\left(\\sin\\frac{\\theta_0}{2}\\right)' },
        { t: { de: 'K über das arithmetisch-geometrische Mittel', en: 'K via the arithmetic–geometric mean' }, tex: 'K(k) = \\frac{\\pi}{2\\,\\mathrm{AGM}\\left(1, \\sqrt{1-k^2}\\right)}' },
        { t: { de: 'Für kleine Winkel', en: 'For small angles' }, tex: 'T \\approx T_0\\left(1 + \\frac{\\theta_0^2}{16}\\right)' },
      ],
      physics: {
        de: 'Das Fadenpendel zeigt im Kleinen, was eine Modellgrenze ist. Die Näherung sin θ ≈ θ macht die Gleichung linear und die Periodendauer unabhängig von der Amplitude – Galilei hat das beobachtet, Huygens hat damit Pendeluhren gebaut. Bei 5° ist der Fehler kleiner als 0,05 %, bei rund 23° erreicht er 1 %. Die exakte Periodendauer braucht das vollständige elliptische Integral K, das die App über das arithmetisch-geometrische Mittel berechnet. Für θ₀ → 180° wächst T über alle Grenzen: Ein Pendel, das genau oben balanciert, kommt nie wieder herunter.',
        en: 'The simple pendulum shows on a small scale what a model limit is. The approximation sin θ ≈ θ makes the equation linear and the period independent of the amplitude – Galileo observed this, and Huygens built pendulum clocks on it. At 5° the error is below 0.05 %, at about 23° it reaches 1 %. The exact period needs the complete elliptic integral K, which the app computes via the arithmetic–geometric mean. As θ₀ → 180°, T grows without limit: a pendulum balanced exactly at the top never comes down again.',
      },
      epistemics: [
        { type: 'math', text: { de: 'Die exakte Periodendauer folgt ohne Näherung aus der Bewegungsgleichung; K wird numerisch auf Maschinengenauigkeit berechnet.', en: 'The exact period follows from the equation of motion without approximation; K is computed numerically to machine precision.' } },
        { type: 'approx', text: { de: 'T₀ = 2π√(L/g) ist die Kleinwinkelnäherung (sin θ ≈ θ).', en: 'T₀ = 2π√(L/g) is the small-angle approximation (sin θ ≈ θ).' } },
        { type: 'model', text: { de: 'Mathematisches Pendel: Punktmasse, masselose starre Aufhängung, keine Reibung, konstantes g.', en: 'Mathematical pendulum: point mass, massless rigid suspension, no friction, constant g.' } },
      ],
    },
  });

  define({
    id: 'projectile', group: MECH, field: 'mech', title: { de: 'Schiefer Wurf', en: 'Projectile motion' }, short: { de: 'Schiefer Wurf', en: 'Projectile' },
    tex: 'R = \\frac{v_0^2\\,\\sin 2\\alpha}{g}',
    vars: {
      v0: { label: 'v₀', tex: 'v_0', name: { de: 'Abwurfgeschwindigkeit', en: 'Launch speed' }, dim: 'L T^-1', default: 20, min: 0.1, max: 1000, scale: 'log', positive: true },
      al: { label: 'α', tex: '\\alpha', name: { de: 'Abwurfwinkel in Grad', en: 'Launch angle in degrees' }, dim: '', default: 30, min: 0, max: 90, scale: 'lin' },
      g: { label: 'g', tex: 'g', name: { de: 'Fallbeschleunigung', en: 'Gravitational acceleration' }, dim: 'L T^-2', default: C.g_n.value, min: 0.1, max: 30, scale: 'lin', positive: true },
      t: { label: 't', tex: 't', name: { de: 'Zeit', en: 'Time' }, dim: 'T', default: 1, min: 0, max: 60, scale: 'lin', time: true },
    },
    outputs: [
      { key: 'R', sym: 'R', tex: 'R', name: { de: 'Wurfweite', en: 'Range' }, expr: 'v0^2*sin(2*al*pi/180)/g', dim: 'L', primary: true },
      { key: 'H', sym: 'H', tex: 'H', name: { de: 'Scheitelhöhe', en: 'Maximum height' }, expr: 'v0^2*sin(al*pi/180)^2/(2*g)', dim: 'L' },
      { key: 'tf', sym: { de: 't_Flug', en: 't_flight' }, tex: { de: 't_{\\mathrm{Flug}}', en: 't_{\\mathrm{flight}}' }, name: { de: 'Flugdauer', en: 'Time of flight' }, expr: '2*v0*sin(al*pi/180)/g', dim: 'T' },
      { key: 'x', sym: 'x', tex: 'x', name: { de: 'Ort waagerecht zur Zeit t', en: 'Horizontal position at time t' }, expr: 'v0*cos(al*pi/180)*t', dim: 'L' },
      { key: 'y', sym: 'y', tex: 'y', name: { de: 'Höhe zur Zeit t', en: 'Height at time t' }, expr: 'v0*sin(al*pi/180)*t - 0.5*g*t^2', dim: 'L' },
      { key: 'vx', sym: 'v_x', tex: 'v_x', name: { de: 'Geschwindigkeit waagerecht (konstant)', en: 'Horizontal velocity (constant)' }, expr: 'v0*cos(al*pi/180)', dim: 'L T^-1' },
      { key: 'vy', sym: 'v_y', tex: 'v_y', name: { de: 'Geschwindigkeit senkrecht zur Zeit t', en: 'Vertical velocity at time t' }, expr: 'v0*sin(al*pi/180) - g*t', dim: 'L T^-1' },
    ],
    equations: [
      { label: { de: 'Wurfweite', en: 'Range' }, eq: 'R = v0^2*sin(2*al*pi/180)/g' },
      { label: { de: 'Scheitelhöhe', en: 'Maximum height' }, eq: 'H = v0^2*sin(al*pi/180)^2/(2*g)' },
      { label: { de: 'Bahnkurve y(x)', en: 'Trajectory y(x)' }, eq: 'y = x*tan(al*pi/180) - g*x^2/(2*v0^2*cos(al*pi/180)^2)' },
    ],
    checks({ v, o, issues, fmt }) {
      if (o('y') < 0 && v.t > 0) issues.push({ cat: 'model', why: T('nach der Landung', 'after landing'), on: ['t'], msg: T('y < 0: Der Körper ist schon bei t ≈ ' + fmt(o('tf'), 3) + ' s gelandet. Danach beschreibt die Formel nichts Reales mehr.', 'y < 0: the body already landed at t ≈ ' + fmt(o('tf'), 3) + ' s. After that the formula no longer describes anything real.') });
      if (v.v0 > 7900) issues.push({ cat: 'model', why: T('Erde nicht mehr flach', 'Earth no longer flat'), msg: T('Nahe der ersten kosmischen Geschwindigkeit (≈ 7,9 km/s) ist die Erde nicht mehr flach und g nicht konstant – die Bahn wird zur Ellipse.', 'Close to orbital speed (≈ 7.9 km/s) the Earth is no longer flat and g not constant – the path becomes an ellipse.') });
      else if (v.v0 > 30) issues.push({ cat: 'model', why: T('in Luft: Luftwiderstand (v₀ > 30 m/s)', 'in air: drag (v₀ > 30 m/s)'), msg: T('Bei über 30 m/s bremst in Luft der Luftwiderstand schon deutlich: Reale Weiten sind kürzer, und der beste Winkel liegt unter 45°.', 'Above 30 m/s, air resistance already slows things down noticeably in air: real ranges are shorter, and the best angle is below 45°.') });
      issues.push({ cat: 'assume', msg: T('Kein Luftwiderstand, flacher Boden, konstantes g; Abwurf und Landung auf gleicher Höhe.', 'No air resistance, flat ground, constant g; launch and landing at the same height.') });
    },
    presets: [
      { name: { de: 'Wurf unter 45°', en: 'Throw at 45°' }, values: { v0: 20, al: 45, g: C.g_n.value, t: 1 } },
      { name: { de: 'Flach: 15°', en: 'Flat: 15°' }, note: { de: 'fliegt genauso weit wie 75°', en: 'flies exactly as far as 75°' }, values: { v0: 20, al: 15, g: C.g_n.value, t: 0.5 } },
      { name: { de: 'Steil: 75°', en: 'Steep: 75°' }, note: { de: 'fliegt genauso weit wie 15°', en: 'flies exactly as far as 15°' }, values: { v0: 20, al: 75, g: C.g_n.value, t: 2 } },
      { name: { de: 'Kugelstoß (≈ 14 m/s)', en: 'Shot put (≈ 14 m/s)' }, note: { de: 'Abwurfhöhe von gut 2 m hier nicht berücksichtigt', en: 'release height of about 2 m not included here' }, values: { v0: 14, al: 40, g: C.g_n.value, t: 1 } },
      { name: { de: 'Auf dem Mond', en: 'On the Moon' }, note: { de: 'g ≈ 1,62 m/s²', en: 'g ≈ 1.62 m/s²' }, values: { v0: 20, al: 45, g: 1.62, t: 5 } },
    ],
    graph: { x: 'al', y: 'R', also: ['H'] },
    viz: 'projectile', animateVar: 't', animateUntil: 'tf',
    explain: {
      intuition: {
        de: 'Ein schräg geworfener Körper bewegt sich waagerecht mit konstanter Geschwindigkeit und fällt gleichzeitig frei. Zusammen ergibt das eine Parabel. Ohne Luftwiderstand fliegt er unter 45° am weitesten, und 30° reicht genauso weit wie 60°.',
        en: 'A body thrown at an angle moves horizontally at constant speed while falling freely at the same time. Together this gives a parabola. Without air resistance it flies furthest at 45°, and 30° reaches exactly as far as 60°.',
      },
      math: [
        { t: { de: 'Bahn in zwei unabhängigen Richtungen', en: 'Motion in two independent directions' }, tex: 'x = v_0\\cos\\alpha\\;t,\\qquad y = v_0\\sin\\alpha\\;t - \\tfrac12 g t^2' },
        { t: { de: 'Wurfweite', en: 'Range' }, tex: 'R = \\frac{v_0^2\\,\\sin 2\\alpha}{g}' },
        { t: { de: 'Scheitelhöhe', en: 'Maximum height' }, tex: 'H = \\frac{v_0^2\\,\\sin^2\\alpha}{2g}' },
        { t: { de: 'Größte Weite, weil sin 2α höchstens 1 ist', en: 'Greatest range, because sin 2α is at most 1' }, tex: '\\sin 2\\alpha = 1 \\;\\Rightarrow\\; \\alpha = 45^{\\circ}' },
      ],
      physics: {
        de: 'Galilei zeigte 1638 in den „Discorsi“, dass sich die Bewegung in zwei unabhängige Teile zerlegen lässt. Das Modell gilt im Vakuum über flachem Boden bei konstantem g. In Luft verkürzt der Luftwiderstand die Weite schon bei Ballgeschwindigkeiten deutlich, und der günstigste Winkel liegt dann unter 45°. Bei sehr großen Weiten ist die Erde nicht mehr flach – dann wird aus der Parabel das Stück einer Ellipse, einer Kepler-Bahn.',
        en: 'In 1638, in his “Discorsi”, Galileo showed that the motion can be split into two independent parts. The model holds in a vacuum over flat ground with constant g. In air, drag shortens the range noticeably even at ball speeds, and the best angle is then below 45°. Over very large distances the Earth is no longer flat – then the parabola becomes part of an ellipse, a Kepler orbit.',
      },
      epistemics: [
        { type: 'math', text: { de: 'Die Zerlegung in waagerechte und senkrechte Bewegung ist exakt, solange die Kraft nur senkrecht wirkt.', en: 'Splitting into horizontal and vertical motion is exact as long as the force acts only vertically.' } },
        { type: 'model', text: { de: 'Massenpunkt im homogenen Schwerefeld, ohne Luftwiderstand.', en: 'Point mass in a uniform gravitational field, without air resistance.' } },
        { type: 'approx', text: { de: 'Flacher Boden und konstantes g gelten nur für Weiten und Höhen ≪ Erdradius.', en: 'Flat ground and constant g only hold for ranges and heights ≪ the Earth’s radius.' } },
      ],
    },
  });

  /* ======================= SPEZIELLE RELATIVITÄT ======================= */

  define({
    id: 'special-rel', group: { de: 'Relativität', en: 'Relativity' }, field: 'rel', title: { de: 'Spezielle Relativität: Lorentz-Faktor', en: 'Special relativity: Lorentz factor' }, short: { de: 'Lorentz-Faktor', en: 'Lorentz factor' },
    tex: '\\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}}',
    vars: {
      beta: { label: 'β = v/c', tex: '\\beta', name: { de: 'Geschwindigkeit in Einheiten von c', en: 'Speed in units of c' }, dim: '', default: 0.8, min: 0, max: 1, scale: 'toone', toone: 12 },
      tau:  { label: 'Δτ', tex: '\\Delta\\tau', name: { de: 'Eigenzeit (Uhr im bewegten System)', en: 'Proper time (clock in the moving frame)' }, dim: 'T', default: 1, min: 1e-6, max: 1e9, scale: 'log', positive: true },
      L0:   { label: 'L₀', tex: 'L_0', name: { de: 'Ruhelänge', en: 'Rest length' }, dim: 'L', default: 1, min: 1e-6, max: 1e9, scale: 'log', positive: true },
      m:    { label: 'm', tex: 'm', name: { de: 'Ruhemasse', en: 'Rest mass' }, dim: 'M', default: 1, min: 1e-31, max: 1e6, scale: 'log', positive: true },
    },
    outputs: [
      { key: 'gamma', sym: 'γ', tex: '\\gamma', name: { de: 'Lorentz-Faktor', en: 'Lorentz factor' }, expr: '1/sqrt((1-beta)*(1+beta))', dim: '', primary: true, digits: 8 },
      { key: 'v', sym: 'v', tex: 'v', name: { de: 'Geschwindigkeit', en: 'Velocity' }, expr: 'beta*c', dim: 'L T^-1' },
      { key: 'dt', sym: 'Δt', tex: '\\Delta t', name: { de: 'Zeitdilatation: Dauer im Laborsystem', en: 'Time dilation: duration in the lab frame' }, expr: 'gamma*tau', dim: 'T' },
      { key: 'L', sym: 'L', tex: 'L', name: { de: 'Längenkontraktion: gemessene Länge', en: 'Length contraction: measured length' }, expr: 'L0/gamma', dim: 'L' },
      { key: 'E', sym: 'E', tex: 'E', name: { de: 'Gesamtenergie', en: 'Total energy' }, expr: 'gamma*m*c^2', dim: 'M L^2 T^-2' },
      { key: 'Ek', sym: 'E_kin', tex: 'E_{\\mathrm{kin}}', name: { de: 'Kinetische Energie (stabil berechnet)', en: 'Kinetic energy (computed stably)' }, expr: 'm*c^2*beta^2/(sqrt((1-beta)*(1+beta))*(1+sqrt((1-beta)*(1+beta))))', dim: 'M L^2 T^-2' },
      { key: 'p', sym: 'p', tex: 'p', name: { de: 'Impuls', en: 'Momentum' }, expr: 'gamma*m*beta*c', dim: 'M L T^-1' },
    ],
    equations: [
      { label: { de: 'Lorentz-Faktor', en: 'Lorentz factor' }, eq: 'gamma = 1/sqrt(1 - v^2/c^2)' },
      { label: { de: 'Zeitdilatation', en: 'Time dilation' }, eq: 'dt = gamma*tau' },
      { label: { de: 'Relativistische Energie', en: 'Relativistic energy' }, eq: 'E = gamma*m*c^2' },
      { label: { de: 'Kinetische Energie (umgeformt)', en: 'Kinetic energy (rearranged)' }, eq: 'E_k = m*c^2*beta^2/(sqrt(1-beta^2)*(1+sqrt(1-beta^2)))' },
    ],
    symbols: { v: { dim: 'L T^-1' }, E_k: { dim: 'M L^2 T^-2' } },
    checks({ v, issues }) {
      if (v.beta >= 1) issues.push({ cat: 'math', why: 'β ≥ 1', msg: T('β ≥ 1: Für β = 1 wird γ unendlich, für β > 1 imaginär. Massive Körper können c nicht erreichen.', 'β ≥ 1: at β = 1, γ becomes infinite; for β > 1 it becomes imaginary. Massive bodies cannot reach c.') });
      if (v.beta < 0) issues.push({ cat: 'info', msg: T('Negatives β bedeutet nur die Gegenrichtung; γ hängt von β² ab.', 'A negative β just means the opposite direction; γ depends on β².') });
      if (v.beta > 0 && v.beta < 1e-4) issues.push({ cat: 'info', msg: T('γ − 1 ≈ β²/2 ist winzig. E_kin wird deshalb über eine umgeformte Formel berechnet – die naive Differenz (γ−1)mc² würde hier durch Rundung ausgelöscht.', 'γ − 1 ≈ β²/2 is tiny. E_kin is therefore computed from a rearranged formula – the naive difference (γ−1)mc² would be wiped out by rounding here.') });
      issues.push({ cat: 'assume', msg: T('Inertialsysteme, flache Raumzeit (keine Gravitation).', 'Inertial frames, flat spacetime (no gravity).') });
    },
    presets: [
      { name: { de: 'β = 0,8', en: 'β = 0.8' }, values: { beta: 0.8, tau: 1, L0: 1, m: 1 } },
      { name: { de: 'Myon aus der Höhenstrahlung', en: 'Cosmic-ray muon' }, note: { de: 'β ≈ 0,998, mittlere Lebensdauer ≈ 2,197 µs, m ≈ 1,884 × 10⁻²⁸ kg', en: 'β ≈ 0.998, mean lifetime ≈ 2.197 µs, m ≈ 1.884 × 10⁻²⁸ kg' }, values: { beta: 0.998, tau: 2.197e-6, L0: 1, m: 1.8835e-28 } },
      { name: { de: 'LHC-Proton (6,8 TeV)', en: 'LHC proton (6.8 TeV)' }, note: { de: 'γ ≈ 7247 aus E / (m_p c²)', en: 'γ ≈ 7247 from E / (m_p c²)' }, values: { beta: 1 - 1 / (2 * 7247.4 ** 2), tau: 1, L0: 1, m: C.m_p.value } },
      { name: { de: 'GPS-Satellit (nur SRT-Anteil)', en: 'GPS satellite (special-relativity part only)' }, note: { de: 'v ≈ 3,9 km/s. Der gravitative ART-Effekt ist größer und entgegengesetzt – hier nicht enthalten', en: 'v ≈ 3.9 km/s. The gravitational effect from general relativity is larger and opposite – not included here' }, values: { beta: 3900 / C.c.value, tau: 86400, L0: 1, m: 1 } },
    ],
    graph: { x: 'beta', y: 'gamma', ylog: true },
    viz: 'relativity',
    explain: {
      intuition: {
        de: 'Bewegte Uhren gehen – vom ruhenden Beobachter aus gemessen – langsamer, bewegte Maßstäbe sind in Bewegungsrichtung kürzer. Bei Alltagsgeschwindigkeiten ist das unmessbar klein, nahe c wächst es unbegrenzt.',
        en: 'Moving clocks run slow – as measured by an observer at rest – and moving rulers are shorter along the direction of motion. At everyday speeds this is immeasurably small; near c it grows without limit.',
      },
      math: [
        { t: { de: 'Lorentz-Faktor', en: 'Lorentz factor' }, tex: '\\gamma = \\frac{1}{\\sqrt{1-\\beta^2}},\\quad \\beta = v/c' },
        { t: { de: 'Numerisch stabil geschrieben', en: 'Written in a numerically stable way' }, tex: '1-\\beta^2 = (1-\\beta)(1+\\beta)' },
        { t: { de: 'Kinetische Energie ohne Auslöschung', en: 'Kinetic energy without cancellation' }, tex: '(\\gamma-1)\\,mc^2 = \\frac{\\beta^2\\, mc^2}{\\sqrt{1-\\beta^2}\\,\\bigl(1+\\sqrt{1-\\beta^2}\\bigr)}' },
        { t: { de: 'Kleine Geschwindigkeiten', en: 'Low speeds' }, tex: 'E_{\\mathrm{kin}} \\approx \\tfrac12 m v^2' },
      ],
      physics: {
        de: 'Die Effekte sind keine optischen Täuschungen, sondern Folgen der Lorentz-Transformation und vielfach gemessen (Myonen-Lebensdauer, Teilchenbeschleuniger, Atomuhren). Wichtig: Längenkontraktion beschreibt die gemessene Länge im Laborsystem. Ein Foto eines schnellen Objekts sähe wegen unterschiedlicher Lichtlaufzeiten anders aus – eher gedreht als verkürzt (Terrell-Penrose-Effekt).',
        en: 'These effects are not optical illusions but consequences of the Lorentz transformation, and they have been measured many times (muon lifetimes, particle accelerators, atomic clocks). Note: length contraction describes the length measured in the lab frame. A photograph of a fast object would look different because of differing light travel times – rotated rather than shortened (Terrell–Penrose effect).',
      },
      epistemics: [
        { type: 'model', text: { de: 'Spezielle Relativitätstheorie (Einstein, 1905): gilt in flacher Raumzeit.', en: 'Special relativity (Einstein, 1905): holds in flat spacetime.' } },
        { type: 'measured', text: { de: 'Zeitdilatation ist experimentell hochpräzise bestätigt (Myonen-Speicherring, Ionen-Uhren).', en: 'Time dilation is confirmed experimentally to high precision (muon storage rings, ion clocks).' } },
        { type: 'math', text: { de: 'γ ist für |β| < 1 reell und ≥ 1; bei β → 1 divergiert es.', en: 'γ is real and ≥ 1 for |β| < 1; it diverges as β → 1.' } },
        { type: 'assume', text: { de: 'Unbeschleunigte Bezugssysteme, keine Gravitation.', en: 'Non-accelerated reference frames, no gravity.' } },
      ],
    },
  });

  /* ========================= THERMODYNAMIK ========================= */

  const NA = C.N_A.value;
  define({
    id: 'ideal-gas', group: { de: 'Thermodynamik', en: 'Thermodynamics' }, field: 'thermo', title: { de: 'Ideales Gas', en: 'Ideal gas' }, short: { de: 'Ideales Gas', en: 'Ideal gas' },
    tex: 'p\\,V = N\\,k_{\\mathrm{B}}\\,T',
    vars: {
      N: { label: 'N', tex: 'N', name: { de: 'Teilchenzahl', en: 'Number of particles' }, dim: '', default: NA, min: 1, max: 1e30, scale: 'log', positive: true },
      T: { label: 'T', tex: 'T', name: { de: 'Temperatur', en: 'Temperature' }, dim: 'Θ', default: 273.15, min: 1, max: 1e5, scale: 'log', positive: true },
      V: { label: 'V', tex: 'V', name: { de: 'Volumen', en: 'Volume' }, dim: 'L^3', default: 0.022414, min: 1e-9, max: 1e6, scale: 'log', positive: true },
      m: { label: 'm', tex: 'm', name: { de: 'Masse eines Teilchens', en: 'Mass of one particle' }, dim: 'M', default: 4.6518e-26, min: 1e-27, max: 1e-24, scale: 'log', positive: true },
    },
    outputs: [
      { key: 'p', sym: 'p', tex: 'p', name: { de: 'Druck', en: 'Pressure' }, expr: 'N*k_B*T/V', dim: 'M L^-1 T^-2', primary: true },
      { key: 'n', sym: 'n', tex: 'n', name: { de: 'Stoffmenge', en: 'Amount of substance' }, expr: 'N/N_A', dim: 'N' },
      { key: 'kT', sym: 'k_B T', tex: 'k_{\\mathrm{B}}T', name: { de: 'Thermische Energie pro Teilchen', en: 'Thermal energy per particle' }, expr: 'k_B*T', dim: 'M L^2 T^-2', alt: { unit: 'eV', div: 'eV' } },
      { key: 'Ek', sym: 'E_kin', tex: 'E_{\\mathrm{kin}}', name: { de: 'Mittlere Bewegungsenergie pro Teilchen (3/2 k_B T)', en: 'Mean kinetic energy per particle (3/2 k_B T)' }, expr: '1.5*k_B*T', dim: 'M L^2 T^-2', alt: { unit: 'eV', div: 'eV' } },
      { key: 'vrms', sym: 'v_rms', tex: 'v_{\\mathrm{rms}}', name: { de: 'Typische Teilchengeschwindigkeit', en: 'Typical particle speed' }, expr: 'sqrt(3*k_B*T/m)', dim: 'L T^-1' },
      { key: 'd', sym: 'd', tex: 'd', name: { de: 'Mittlerer Teilchenabstand', en: 'Mean distance between particles' }, expr: '(V/N)^(1/3)', dim: 'L' },
      { key: 'lam', sym: 'λ_th', tex: '\\lambda_{\\mathrm{th}}', name: { de: 'Thermische de-Broglie-Wellenlänge', en: 'Thermal de Broglie wavelength' }, expr: 'h/sqrt(2*pi*m*k_B*T)', dim: 'L' },
    ],
    equations: [
      { label: { de: 'Zustandsgleichung', en: 'Equation of state' }, eq: 'p*V = N*k_B*T' },
      { label: { de: 'Mit der Stoffmenge: R = N_A k_B', en: 'With the amount of substance: R = N_A k_B' }, eq: 'p*V = n*N_A*k_B*T' },
      { label: { de: 'Mittlere Bewegungsenergie', en: 'Mean kinetic energy' }, eq: 'E_k = 3/2*k_B*T' },
    ],
    symbols: { E_k: { dim: 'M L^2 T^-2' } },
    checks({ v, o, issues, fmt }) {
      const d = o('d'), lam = o('lam');
      if (isFinite(d) && isFinite(lam) && d < 10 * lam) issues.push({ cat: 'model', why: T('Quantenentartung', 'quantum degeneracy'), msg: T('Die Teilchen stehen so dicht (d ≈ ' + fmt(d, 2) + ' m), dass ihre Wellenlänge (λ ≈ ' + fmt(lam, 2) + ' m) vergleichbar wird. Dann braucht es Quantenstatistik statt des idealen Gases.', 'The particles are so close together (d ≈ ' + fmt(d, 2) + ' m) that their wavelength (λ ≈ ' + fmt(lam, 2) + ' m) becomes comparable. Then quantum statistics is needed instead of the ideal gas.') });
      if (o('p') > 1e7) issues.push({ cat: 'model', why: T('über 100 bar: reales Gas', 'above 100 bar: real gas'), msg: T('Über ≈ 100 bar weichen reale Gase deutlich ab: Die Teilchen brauchen Platz und ziehen sich an (van-der-Waals-Gleichung).', 'Above ≈ 100 bar real gases deviate noticeably: the particles take up space and attract each other (van der Waals equation).') });
      if (v.T < 90) issues.push({ cat: 'model', why: T('unter 90 K: Kondensation', 'below 90 K: condensation'), msg: T('Unter ≈ 90 K sind Stickstoff und Sauerstoff bei Normaldruck flüssig. Das ideale Gas kennt keine Kondensation.', 'Below ≈ 90 K, nitrogen and oxygen are liquid at normal pressure. The ideal gas knows nothing about condensation.') });
      if (v.T > 1e4) issues.push({ cat: 'model', why: T('über 10 000 K: Plasma', 'above 10,000 K: plasma'), msg: T('Über ≈ 10 000 K zerfallen Moleküle, und Atome werden ionisiert – aus dem Gas wird ein Plasma.', 'Above ≈ 10,000 K molecules break apart and atoms are ionised – the gas turns into a plasma.') });
      if (v.N < 1000) issues.push({ cat: 'info', msg: T('Bei so wenigen Teilchen schwankt der Druck stark; p ist nur noch ein Mittelwert.', 'With this few particles the pressure fluctuates strongly; p is only an average.') });
      issues.push({ cat: 'assume', msg: T('Punktförmige Teilchen ohne Anziehung, nur elastische Stöße; thermisches Gleichgewicht.', 'Point-like particles without attraction, only elastic collisions; thermal equilibrium.') });
    },
    presets: [
      { name: { de: '1 mol bei 0 °C in 22,4 l', en: '1 mol at 0 °C in 22.4 l' }, note: { de: 'molares Normvolumen: ergibt 1 atm = 101 325 Pa', en: 'molar volume at standard conditions: gives 1 atm = 101,325 Pa' }, values: { N: NA, T: 273.15, V: 0.022414, m: 4.6518e-26 } },
      { name: { de: 'Luft im Zimmer', en: 'Air in a room' }, note: { de: '≈ 50 m³ bei 20 °C und 1 atm; mittlere Molekülmasse der Luft', en: '≈ 50 m³ at 20 °C and 1 atm; mean molecular mass of air' }, values: { N: 1.2518e27, T: 293.15, V: 50, m: 4.810e-26 } },
      { name: { de: 'Heliumballon', en: 'Helium balloon' }, note: { de: '≈ 10 l bei 20 °C und 1 atm', en: '≈ 10 l at 20 °C and 1 atm' }, values: { N: 2.504e23, T: 293.15, V: 0.01, m: 6.6465e-27 } },
      { name: { de: 'Interstellares Gas', en: 'Interstellar gas' }, note: { de: '≈ 1 Wasserstoffatom pro cm³ bei ≈ 100 K', en: '≈ 1 hydrogen atom per cm³ at ≈ 100 K' }, values: { N: 1e6, T: 100, V: 1, m: 1.6735e-27 } },
    ],
    graph: { x: 'T', y: 'p', xlog: false, ylog: false, view: { range: [1, 12000] } },
    viz: 'gas',
    explain: {
      intuition: {
        de: 'Ein Gas besteht aus sehr vielen Teilchen, die umherfliegen und gegen die Wände stoßen. Mehr Teilchen, schnellere (wärmere) Teilchen oder weniger Platz – jedes davon erhöht den Druck.',
        en: 'A gas consists of a huge number of particles flying around and hitting the walls. More particles, faster (warmer) particles or less room – each of these raises the pressure.',
      },
      math: [
        { t: { de: 'Zustandsgleichung', en: 'Equation of state' }, tex: 'pV = N k_{\\mathrm{B}} T = n R T' },
        { t: { de: 'Gaskonstante', en: 'Gas constant' }, tex: 'R = N_{\\mathrm{A}}\\,k_{\\mathrm{B}}' },
        { t: { de: 'Mittlere Bewegungsenergie pro Teilchen', en: 'Mean kinetic energy per particle' }, tex: 'E_{\\mathrm{kin}} = \\tfrac32\\,k_{\\mathrm{B}} T' },
        { t: { de: 'Typische Geschwindigkeit', en: 'Typical speed' }, tex: 'v_{\\mathrm{rms}} = \\sqrt{3 k_{\\mathrm{B}} T / m}' },
      ],
      physics: {
        de: 'Die Gleichung fasst die Gesetze von Boyle-Mariotte (p ∝ 1/V), Gay-Lussac (p ∝ T) und Avogadro (V ∝ N) zusammen; Clapeyron schrieb sie 1834 zuerst in dieser Form auf. Mikroskopisch erklärt sie die kinetische Gastheorie von Clausius, Maxwell und Boltzmann: Temperatur ist mittlere Bewegungsenergie, Druck der Impuls, den die Stöße auf die Wände übertragen. k_B verbindet beide Ebenen – pro Teilchen k_B T, pro Mol R T. Reale Gase weichen bei hohem Druck und tiefer Temperatur ab, weil ihre Teilchen Platz brauchen und einander anziehen.',
        en: 'The equation combines the laws of Boyle and Mariotte (p ∝ 1/V), Gay-Lussac (p ∝ T) and Avogadro (V ∝ N); Clapeyron first wrote it in this form in 1834. At the microscopic level it is explained by the kinetic theory of gases of Clausius, Maxwell and Boltzmann: temperature is mean kinetic energy, pressure is the momentum the collisions transfer to the walls. k_B connects the two levels – per particle k_B T, per mole R T. Real gases deviate at high pressure and low temperature because their particles take up space and attract each other.',
      },
      epistemics: [
        { type: 'model', text: { de: 'Ideales Gas: punktförmige Teilchen ohne Wechselwirkung außer elastischen Stößen.', en: 'Ideal gas: point-like particles with no interaction apart from elastic collisions.' } },
        { type: 'measured', text: { de: 'Luft unter Normalbedingungen weicht um weniger als 0,1 % vom idealen Gas ab.', en: 'Air at standard conditions deviates from the ideal gas by less than 0.1 %.' } },
        { type: 'math', text: { de: 'R = N_A k_B ist seit 2019 exakt, weil N_A und k_B festgelegt sind.', en: 'R = N_A k_B has been exact since 2019, because N_A and k_B are fixed.' } },
      ],
    },
  });

  /* ======================== FAMOUS EQUATIONS ======================== */

  const BH_THERMO = { de: 'Thermodynamik Schwarzer Löcher', en: 'Black hole thermodynamics' };
  const SCALAR = { de: 'skalar', en: 'scalar' };
  // Gemessene bzw. festgelegte Werte – für die Checks im Break-Modus („Konstante verkleinert?“)
  const K0 = { hbar: C.hbar.value, c: C.c.value, G: C.G.value, k_B: C.k_B.value };

  /* Wörterbuch Mechanik Schwarzer Löcher ↔ Thermodynamik – steht auf der Hawking- und der Entropie-Seite.
     src: woher die Zahl kommt (Ausgabe eines Experiments oder Eingabe); gerechnet wird immer in der Engine. */
  const BH_DICT = {
    pair: ['hawking', 'bh-entropy'],
    title: { de: 'Wörterbuch: Schwarzes Loch ↔ Thermodynamik', en: 'Dictionary: black hole ↔ thermodynamics' },
    rows: [
      { l: { tex: '\\kappa', name: { de: 'Oberflächengravitation', en: 'surface gravity' }, src: { exp: 'hawking', key: 'kappa' } },
        r: { tex: 'T', name: { de: 'Temperatur', en: 'temperature' }, src: { exp: 'hawking', key: 'TH' } } },
      { l: { tex: 'A', name: { de: 'Horizontfläche', en: 'horizon area' }, src: { exp: 'bh-entropy', form: 'mass', key: 'A' } },
        r: { tex: 'S', name: { de: 'Entropie', en: 'entropy' }, src: { exp: 'bh-entropy', form: 'mass', key: 'S' } } },
      { l: { tex: 'M', name: { de: 'Masse', en: 'mass' }, src: { var: 'M' } },
        r: { tex: 'E = Mc^2', name: { de: 'Energie', en: 'energy' }, src: { exp: 'hawking', key: 'E' } } },
    ],
    law: 'c^2\\,\\mathrm{d}M = \\frac{\\kappa\\, c^2}{8\\pi G}\\,\\mathrm{d}A \\;\\;\\longleftrightarrow\\;\\; \\mathrm{d}E = T\\,\\mathrm{d}S',
    both: '\\xc{res}{T_{\\mathrm{H}}} = \\frac{\\xc{q}{\\hbar}\\,\\xc{rel}{c^3}}{8\\pi\\,\\xc{grav}{G}\\,M\\,\\xc{thermo}{k_{\\mathrm{B}}}} \\qquad \\xc{res}{S_{\\mathrm{BH}}} = \\frac{\\xc{thermo}{k_{\\mathrm{B}}}\\,\\xc{rel}{c^3}\\,A}{4\\,\\xc{grav}{G}\\,\\xc{q}{\\hbar}}',
    text: {
      de: 'Bardeen, Carter und Hawking fanden 1973 für Schwarze Löcher Gesetze, die genau wie die Hauptsätze der Thermodynamik aussehen. Zunächst war das eine formale Analogie. Mit T_H und S_BH wurde daraus – im Rahmen der semiklassischen Gravitation – eine physikalische Aussage. Beide Formeln enthalten alle vier Konstanten ħ, c, G und k_B.',
      en: 'In 1973 Bardeen, Carter and Hawking found laws for black holes that look exactly like the laws of thermodynamics. At first this was a formal analogy. With T_H and S_BH it became a physical statement – within semiclassical gravity. Both formulas contain all four constants ħ, c, G and k_B.',
    },
    link: {
      hawking: { de: 'Zur Hawking-Temperatur →', en: 'To the Hawking temperature →' },
      'bh-entropy': { de: 'Zur Bekenstein-Hawking-Entropie →', en: 'To the Bekenstein–Hawking entropy →' },
    },
  };

  /* Schnittpunkt-Block der Hawking-Seite (src/ui/crossroads.js zeichnet ihn).
     color: q = Quantenmechanik, rel = Relativität, grav = Gravitation/Geometrie, thermo = Thermodynamik,
            mass = das Schwarze Loch, geo = reine Zahl. live: Knopf, der die Größe im Break-Modus verändert. */
  const HAWKING_XR = {
    lhs: 'T_{\\mathrm{H}}', num: ['hbar', 'c'], den: ['8pi', 'G', 'M', 'k_B'],
    lead: {
      de: 'Ein Schnittpunkt, keine Vereinigung: Vier Theorien berühren sich hier in einer Zeile. Eine gemeinsame Theorie der Quantengravitation gibt es noch nicht.',
      en: 'A crossroads, not a unification: four theories touch here in a single line. A common theory of quantum gravity does not exist yet.',
    },
    gapLink: { de: 'Warum beide (noch) nicht zusammenpassen →', en: 'Why the two don’t fit together (yet) →' },
    hint: { de: 'Zeig auf ein Symbol oder tippe es an: Welche Theorie steckt dahinter – und was passiert, wenn man sie abschaltet?', en: 'Point at a symbol or tap it: which theory is behind it – and what happens if you switch it off?' },
    symbols: {
      hbar: {
        tex: '\\hbar', color: 'q', theory: { de: 'Quantenmechanik', en: 'Quantum mechanics' },
        role: { de: 'Das Wirkungsquantum bringt die Quantenfeldtheorie ins Spiel: Hawking rechnete mit Quantenfeldern auf der gekrümmten Raumzeit vor dem Horizont. T_H ist proportional zu ħ.',
          en: 'The quantum of action brings in quantum field theory: Hawking calculated with quantum fields on the curved spacetime outside the horizon. T_H is proportional to ħ.' },
        limit: '\\hbar \\to 0 \\;\\Rightarrow\\; T_{\\mathrm{H}} \\to 0',
        limitText: { de: 'Klassisch ist ein Schwarzes Loch vollkommen schwarz: Es verschluckt alles und strahlt nichts ab. Hawking-Strahlung ist ein reiner Quanteneffekt.',
          en: 'Classically a black hole is perfectly black: it swallows everything and emits nothing. Hawking radiation is a pure quantum effect.' },
        live: { c: 'hbar', f: 1e-3, zero: true },
      },
      c: {
        tex: 'c^3', color: 'rel', theory: { de: 'Relativität', en: 'Relativity' },
        role: { de: 'Die Lichtgeschwindigkeit legt fest, wo der Horizont liegt: Innerhalb von r_s = 2GM/c² kann nicht einmal Licht entkommen. Sie steht in dritter Potenz im Zähler.',
          en: 'The speed of light fixes where the horizon lies: inside r_s = 2GM/c² not even light can escape. It appears to the third power in the numerator.' },
        limit: 'c \\to \\infty \\;\\Rightarrow\\; r_{\\mathrm{s}} \\to 0',
        limitText: { de: 'Relativität „abschalten“ heißt c → ∞, das ist Newtons Physik. Dann schrumpft r_s auf null, und es gibt keinen Ereignishorizont – den kennt erst die Relativitätstheorie.',
          en: 'Switching relativity “off” means c → ∞, which is Newton’s physics. Then r_s shrinks to zero and there is no event horizon – only relativity knows about horizons.' },
        live: { c: 'c', f: 10 },
      },
      G: {
        tex: 'G', color: 'grav', theory: { de: 'Gravitation – Geometrie der Raumzeit', en: 'Gravity – the geometry of spacetime' },
        role: { de: 'G sagt, wie stark Masse die Raumzeit krümmt. Mehr G heißt ein größerer Horizont und damit ein kälteres Loch: T_H ist proportional zu 1/G.',
          en: 'G says how strongly mass curves spacetime. More G means a larger horizon and therefore a colder hole: T_H is proportional to 1/G.' },
        limit: 'G \\to 0 \\;\\Rightarrow\\; r_{\\mathrm{s}} \\to 0',
        limitText: { de: 'Ohne Gravitation gibt es keinen Horizont und kein Schwarzes Loch. Die Formel liefert trotzdem eine immer höhere Temperatur – ein Zeichen, dass sie dort nicht mehr gilt. Die App meldet das als „Außerhalb des Modells“.',
          en: 'Without gravity there is no horizon and no black hole. The formula still returns an ever higher temperature – a sign that it no longer applies there. The app reports this as “Outside the model”.' },
        live: { c: 'G', f: 1e-3, zero: true },
      },
      k_B: {
        tex: 'k_{\\mathrm{B}}', color: 'thermo', theory: { de: 'Thermodynamik', en: 'Thermodynamics' },
        role: { de: 'Die Boltzmann-Konstante macht aus einer Energie eine Temperatur. Durch sie wird das Schwarze Loch zu einem thermischen Körper – mit Temperatur und mit Entropie.',
          en: 'The Boltzmann constant turns an energy into a temperature. Through it the black hole becomes a thermal body – with a temperature and with an entropy.' },
        limit: 'k_{\\mathrm{B}} \\to 0 \\;\\Rightarrow\\; T_{\\mathrm{H}} \\to \\infty',
        limitText: { de: 'Die Temperatur in Kelvin divergiert, die Energie k_B·T_H = ħc³/(8πGM) bleibt aber gleich. k_B rechnet nur zwischen Energie und Temperatur um; seit 2019 ist ihr Wert exakt festgelegt.',
          en: 'The temperature in kelvin diverges, but the energy k_B·T_H = ħc³/(8πGM) stays the same. k_B only converts between energy and temperature; since 2019 its value has been fixed exactly.' },
        live: { c: 'k_B', f: 1e-3 },
      },
      M: {
        tex: 'M', color: 'mass', theory: { de: 'Das Schwarze Loch selbst', en: 'The black hole itself' },
        role: { de: 'Die Masse ist die einzige Eigenschaft eines ungeladenen, nicht rotierenden Lochs – und die einzige Größe, die du hier frei wählst. Sie steht im Nenner: Je schwerer, desto kälter.',
          en: 'The mass is the only property of an uncharged, non-rotating hole – and the only quantity you choose freely here. It sits in the denominator: the heavier, the colder.' },
        limit: 'M \\to \\infty \\;\\Rightarrow\\; T_{\\mathrm{H}} \\to 0',
        limitText: { de: 'Große Löcher sind kalt, kleine heiß. Für M → 0 würde T_H divergieren – doch nahe der Planck-Masse (≈ 22 µg) versagt die semiklassische Rechnung.',
          en: 'Large holes are cold, small ones hot. As M → 0, T_H would diverge – but near the Planck mass (≈ 22 µg) the semiclassical calculation breaks down.' },
        live: { v: 'M', f: 1e-3 },
      },
      '8pi': {
        tex: '8\\pi', color: 'geo', theory: { de: 'Geometrie + Quantenperiodizität', en: 'Geometry + quantum periodicity' },
        role: { de: '8π = 4 · 2π. Die 4 stammt aus der Geometrie des Horizonts (κ = c⁴/4GM), die 2π aus der Periodizität der Quantenfelder in imaginärer Zeit – derselbe Faktor wie beim Unruh-Effekt.',
          en: '8π = 4 · 2π. The 4 comes from the geometry of the horizon (κ = c⁴/4GM), the 2π from the periodicity of the quantum fields in imaginary time – the same factor as in the Unruh effect.' },
        limit: '8\\pi = 4 \\cdot 2\\pi',
        limitText: { de: 'Eine reine Zahl – die Dimensionsanalyse kann sie nicht liefern. Sie ergibt ħc³/(GMk_B) nur bis auf einen solchen Faktor; erst die vollständige Rechnung zeigt, dass es 8π ist.',
          en: 'A pure number – dimensional analysis cannot supply it. It gives ħc³/(GMk_B) only up to such a factor; only the full calculation shows that it is 8π.' },
      },
    },
    chain: {
      title: { de: 'Von der Geometrie zur Temperatur', en: 'From geometry to temperature' },
      steps: [
        { tex: '\\kappa = \\frac{\\xc{rel}{c^4}}{\\xc{geo}{4}\\,\\xc{grav}{G}\\,M}', key: 'kappa', text: { de: 'Oberflächengravitation des Horizonts – reine Geometrie', en: 'Surface gravity of the horizon – pure geometry' } },
        { tex: 'T_{\\mathrm{H}} = \\frac{\\xc{q}{\\hbar}\\,\\kappa}{\\xc{geo}{2\\pi}\\,\\xc{rel}{c}\\,\\xc{thermo}{k_{\\mathrm{B}}}}', key: 'THk', text: { de: 'Temperatur über die Quantenperiodizität', en: 'Temperature via the quantum periodicity' } },
      ],
      note: { de: '8π = 4 · 2π: Die 4 kommt aus der Horizontgeometrie, die 2π aus der Quantenperiodizität. Nach demselben Muster misst ein gleichmäßig beschleunigter Beobachter im leeren Raum die Unruh-Temperatur T = ħa/(2πck_B).',
        en: '8π = 4 · 2π: the 4 comes from the horizon geometry, the 2π from the quantum periodicity. Following the same pattern, a uniformly accelerated observer in empty space measures the Unruh temperature T = ħa/(2πck_B).' },
    },
    aha: {
      title: { de: 'Aha: die Planck-Temperatur, verdünnt', en: 'Aha: the Planck temperature, diluted' },
      tex: 'T_{\\mathrm{H}} = T_{\\mathrm{P}} \\cdot \\frac{m_{\\mathrm{P}}}{8\\pi M}',
      parts: [{ key: 'TP', tex: 'T_{\\mathrm{P}}' }, { key: 'MmP', tex: 'M/m_{\\mathrm{P}}' }, { key: 'THp', tex: 'T_{\\mathrm{H}}' }],
      text: { de: 'Ein Loch mit Planck-Masse hätte – bis auf den Faktor 8π – die Planck-Temperatur. Jede Verzehnfachung der Masse macht es zehnmal kälter.',
        en: 'A hole with the Planck mass would have the Planck temperature – up to the factor 8π. Every tenfold increase in mass makes it ten times colder.' },
    },
    epistemic: [
      { type: 'assume', text: { de: 'Semiklassisch: Quantenfelder auf einer klassischen, gekrümmten Raumzeit (Hawking 1974/75) – kein Ergebnis einer Quantengravitation.', en: 'Semiclassical: quantum fields on a classical, curved spacetime (Hawking 1974/75) – not a result of quantum gravity.' } },
      { type: 'measured', text: { de: 'Nicht direkt beobachtet. Sonnenmasse: T_H ≈ ', en: 'Not observed directly. Solar mass: T_H ≈ ' }, value: { key: 'TH', at: { M: MS } },
        after: { de: ' – kälter als die kosmische Hintergrundstrahlung (≈ 2,7 K).', en: ' – colder than the cosmic microwave background (≈ 2.7 K).' } },
      { type: 'model', text: { de: 'Elektromagnetismus fehlt: Weder e noch ε₀ kommen vor. Die Formel gilt für ungeladene, nicht rotierende Löcher.', en: 'Electromagnetism is missing: neither e nor ε₀ appears. The formula holds for uncharged, non-rotating holes.' } },
    ],
    dict: BH_DICT,
  };

  define({
    id: 'hawking', group: 'Famous Equations', field: 'famous', hall: true, title: { de: 'Hawking-Temperatur', en: 'Hawking temperature' }, short: { de: 'Hawking-Temperatur', en: 'Hawking temperature' },
    subtitle: { de: 'Wo Quantenmechanik, Relativität, Gravitation und Thermodynamik in einer Zeile zusammentreffen.', en: 'Where quantum mechanics, relativity, gravity and thermodynamics meet in a single line.' },
    crossroads: HAWKING_XR,
    tex: 'T_{\\mathrm{H}} = \\frac{\\hbar\\, c^3}{8\\pi\\, G\\, M\\, k_{\\mathrm{B}}}',
    meta: { mathType: SCALAR, mainDim: { de: 'Temperatur', en: 'Temperature' }, domain: BH_THERMO, status: { de: 'theoretische Vorhersage, nicht beobachtet', en: 'theoretical prediction, not observed' } },
    vars: {
      M: { label: 'M', tex: 'M', name: { de: 'Masse des Schwarzen Lochs', en: 'Mass of the black hole' }, dim: 'M', default: MS, min: 1e8, max: 1e42, scale: 'log', positive: true },
    },
    outputs: [
      { key: 'TH', sym: 'T_H', tex: 'T_{\\mathrm{H}}', name: { de: 'Hawking-Temperatur', en: 'Hawking temperature' }, expr: 'hbar*c^3/(8*pi*G*M*k_B)', dim: 'Θ', primary: true },
      { key: 'Msun', sym: 'M/M☉', tex: 'M/M_\\odot', name: { de: 'Masse in Sonnenmassen', en: 'Mass in solar masses' }, expr: 'M/M_sun', dim: '' },
      { key: 'rs', sym: 'r_s', tex: 'r_{\\mathrm{s}}', name: { de: 'Schwarzschild-Radius', en: 'Schwarzschild radius' }, expr: '2*G*M/c^2', dim: 'L' },
      { key: 'tev', sym: 't_evap', tex: 't_{\\mathrm{evap}}', name: { de: 'Verdampfungszeit (grobe Abschätzung)', en: 'Evaporation time (rough estimate)' }, expr: '5120*pi*G^2*M^3/(hbar*c^4)', dim: 'T', note: { de: 'nur Photonen, ohne Greybody-Faktoren, ohne Einstrahlung', en: 'photons only, without greybody factors, without incoming radiation' } },
      { key: 'tevy', sym: { de: 't_evap / Jahr', en: 't_evap / year' }, tex: 't_{\\mathrm{evap}}/\\mathrm{a}', name: { de: 'Verdampfungszeit in Jahren', en: 'Evaporation time in years' }, expr: 'tev/31557600', dim: '', noEq: true },
      { key: 'kappa', sym: 'κ', tex: '\\kappa', name: { de: 'Oberflächengravitation am Horizont', en: 'Surface gravity at the horizon' }, expr: 'c^4/(4*G*M)', dim: 'L T^-2' },
      // Hilfsgrößen (aux) für den Schnittpunkt-Block: dieselbe Temperatur auf zwei anderen Wegen, nicht in der Ergebnisliste
      { key: 'THk', sym: 'T_H(κ)', tex: 'T_{\\mathrm{H}}(\\kappa)', name: { de: 'Hawking-Temperatur aus κ: ħκ/(2π c k_B)', en: 'Hawking temperature from κ: ħκ/(2π c k_B)' }, expr: 'hbar*kappa/(2*pi*c*k_B)', dim: 'Θ', aux: true },
      { key: 'TP', sym: 'T_P', tex: 'T_{\\mathrm{P}}', name: { de: 'Planck-Temperatur', en: 'Planck temperature' }, expr: 'sqrt(hbar*c^5/(G*k_B^2))', dim: 'Θ', aux: true },
      { key: 'mP', sym: 'm_P', tex: 'm_{\\mathrm{P}}', name: { de: 'Planck-Masse', en: 'Planck mass' }, expr: 'sqrt(hbar*c/G)', dim: 'M', aux: true },
      { key: 'MmP', sym: 'M/m_P', tex: 'M/m_{\\mathrm{P}}', name: { de: 'Masse in Planck-Massen', en: 'Mass in Planck masses' }, expr: 'M/mP', dim: '', aux: true },
      { key: 'THp', sym: 'T_H(Planck)', tex: 'T_{\\mathrm{P}}\\,m_{\\mathrm{P}}/(8\\pi M)', name: { de: 'Hawking-Temperatur aus Planck-Größen: T_P · m_P / (8πM)', en: 'Hawking temperature from Planck quantities: T_P · m_P / (8πM)' }, expr: 'TP*mP/(8*pi*M)', dim: 'Θ', aux: true },
      { key: 'E', sym: 'E', tex: 'E', name: { de: 'Energie Mc²', en: 'Energy Mc²' }, expr: 'M*c^2', dim: 'M L^2 T^-2', aux: true },
    ],
    equations: [
      { label: { de: 'Hawking-Temperatur', en: 'Hawking temperature' }, eq: 'T_H = hbar*c^3/(8*pi*G*M*k_B)' },
      { label: { de: 'Schwarzschild-Radius', en: 'Schwarzschild radius' }, eq: 'r_s = 2*G*M/c^2' },
    ],
    symbols: { T_H: { dim: 'Θ' }, r_s: { dim: 'L' } },
    checks({ v, o, issues, C, fmt }) {
      const Th = o('TH');
      if (isFinite(Th) && Th < C.T_cmb) issues.push({ cat: 'info', msg: T('T_H ≈ ' + fmt(Th, 3) + ' K liegt unter der Temperatur der Hintergrundstrahlung (≈ 2,7 K). Heute absorbiert so ein Loch mehr Strahlung, als es abgibt – es wächst netto.', 'T_H ≈ ' + fmt(Th, 3) + ' K is below the temperature of the cosmic microwave background (≈ 2.7 K). Today such a hole absorbs more radiation than it emits – it grows on balance.') });
      if (v.M > 0 && v.M < 1e-6) issues.push({ cat: 'model', why: T('nahe der Planck-Masse', 'near the Planck mass'), msg: T('Nahe der Planck-Masse (≈ 2,2 × 10⁻⁸ kg) versagt die semiklassische Rechnung – dafür bräuchte es eine Quantengravitation.', 'Near the Planck mass (≈ 2.2 × 10⁻⁸ kg) the semiclassical calculation breaks down – that would take a theory of quantum gravity.') });
      if (v.M > 0 && v.M < 5e11) issues.push({ cat: 'info', msg: T('Für so kleine Massen wäre die abgeschätzte Lebensdauer kürzer als das Alter des Universums. Solche primordialen Schwarzen Löcher sind hypothetisch.', 'For masses this small, the estimated lifetime would be shorter than the age of the universe. Such primordial black holes are hypothetical.') });
      // Break-Modus: eine der vier Theorien „abschalten“
      const rs = o('rs');
      if (!(C.G > 0)) issues.push({ cat: 'model', why: T('kein Horizont (G ≤ 0)', 'no horizon (G ≤ 0)'), msg: T('G ≤ 0: Ohne Gravitation gibt es keinen Horizont (r_s = 0) und damit kein Schwarzes Loch. T_H hat hier keine Bedeutung.', 'G ≤ 0: without gravity there is no horizon (r_s = 0) and therefore no black hole. T_H has no meaning here.') });
      else if (C.G < K0.G * (1 - 1e-9)) issues.push({ cat: 'model', why: T('Horizont schrumpft (G → 0)', 'horizon shrinks (G → 0)'), msg: T('G ist kleiner als gemessen: r_s schrumpft mit G (hier ≈ ' + fmt(rs, 3) + ' m), T_H wächst wie 1/G. Für G → 0 verschwindet der Horizont – ohne Horizont gibt es kein Schwarzes Loch und keine Hawking-Strahlung. Dass die Formel dann eine immer höhere Temperatur liefert, heißt nur: Sie gilt dort nicht mehr.',
        'G is smaller than measured: r_s shrinks with G (here ≈ ' + fmt(rs, 3) + ' m), and T_H grows like 1/G. As G → 0 the horizon disappears – without a horizon there is no black hole and no Hawking radiation. That the formula then returns an ever higher temperature only means that it no longer applies there.') });
      if (C.c > K0.c * (1 + 1e-9)) issues.push({ cat: 'model', why: T('Horizont schrumpft (c → ∞)', 'horizon shrinks (c → ∞)'), msg: T('c ist größer als gemessen: r_s ∝ 1/c² schrumpft (hier ≈ ' + fmt(rs, 3) + ' m). Im Grenzfall c → ∞ – Newtons Physik – gibt es keinen Ereignishorizont; den kennt erst die Relativitätstheorie.',
        'c is larger than measured: r_s ∝ 1/c² shrinks (here ≈ ' + fmt(rs, 3) + ' m). In the limit c → ∞ – Newton’s physics – there is no event horizon; only relativity knows about horizons.') });
      if (C.hbar < K0.hbar * (1 - 1e-9)) issues.push({ cat: 'info', msg: T('ħ ist kleiner als gemessen, und T_H ∝ ħ sinkt mit. Im Grenzfall ħ → 0 ist T_H = 0: Klassisch ist ein Schwarzes Loch vollkommen schwarz – Hawking-Strahlung ist ein reiner Quanteneffekt.',
        'ħ is smaller than measured, and T_H ∝ ħ drops with it. In the limit ħ → 0, T_H = 0: classically a black hole is perfectly black – Hawking radiation is a pure quantum effect.') });
      if (C.k_B < K0.k_B * (1 - 1e-9)) issues.push({ cat: 'info', msg: T('k_B ist kleiner als festgelegt: T_H in Kelvin steigt, die Energie k_B·T_H bleibt aber gleich. k_B rechnet nur zwischen Energie und Temperatur um.',
        'k_B is smaller than defined: T_H in kelvin rises, but the energy k_B·T_H stays the same. k_B only converts between energy and temperature.') });
      issues.push({ cat: 'assume', msg: T('Idealisiertes Schwarzschild-Loch (ungeladen, nicht rotierend) in semiklassischer Gravitation.', 'Idealised Schwarzschild black hole (uncharged, non-rotating) in semiclassical gravity.') });
    },
    presets: [
      { name: { de: '1 Sonnenmasse', en: '1 solar mass' }, values: { M: MS } },
      { name: { de: 'Stellares Loch, 10 M☉', en: 'Stellar black hole, 10 M☉' }, values: { M: 10 * MS } },
      { name: 'Sagittarius A*', note: { de: '≈ 4,3 × 10⁶ M☉ (GRAVITY-Kollaboration)', en: '≈ 4.3 × 10⁶ M☉ (GRAVITY collaboration)' }, values: { M: 4.3e6 * MS } },
      { name: 'M87*', note: { de: '≈ 6,5 × 10⁹ M☉ (Event Horizon Telescope 2019)', en: '≈ 6.5 × 10⁹ M☉ (Event Horizon Telescope 2019)' }, values: { M: 6.5e9 * MS } },
      { name: { de: 'Mondmasse (hypothetisch)', en: 'Moon mass (hypothetical)' }, values: { M: C.M_moon.value } },
      { name: { de: '10¹² kg (hypothetisch, primordial)', en: '10¹² kg (hypothetical, primordial)' }, values: { M: 1e12 } },
    ],
    graph: { x: 'M', y: 'TH', xlog: true, ylog: true, refs: [{ y: 'TH', value: C.T_cmb.value, label: { de: 'T_CMB ≈ 2,7 K', en: 'T_CMB ≈ 2.7 K' } }] },
    viz: 'blackhole',
    explain: {
      intuition: {
        de: 'Schwarze Löcher sollten laut Theorie wie ein extrem kalter Körper strahlen. Je schwerer das Loch, desto kälter – ein Loch mit Sonnenmasse hätte nur etwa 60 Milliardstel Kelvin.',
        en: 'According to theory, black holes should glow like an extremely cold body. The heavier the hole, the colder it is – a black hole with the mass of the Sun would be only about 60 billionths of a kelvin.',
      },
      math: [
        { t: { de: 'Hawking-Temperatur', en: 'Hawking temperature' }, tex: 'T_{\\mathrm{H}} = \\frac{\\hbar c^3}{8\\pi G M k_{\\mathrm{B}}}' },
        { t: { de: 'Antiproportional zur Masse', en: 'Inversely proportional to the mass' }, tex: 'T_{\\mathrm{H}} \\propto \\frac{1}{M}' },
        { t: { de: 'Mit dem Schwarzschild-Radius', en: 'In terms of the Schwarzschild radius' }, tex: 'k_{\\mathrm{B}} T_{\\mathrm{H}} = \\frac{\\hbar c}{4\\pi\\, r_{\\mathrm{s}}}' },
        { t: { de: 'Grobe Verdampfungszeit', en: 'Rough evaporation time' }, tex: 't_{\\mathrm{evap}} \\approx \\frac{5120\\,\\pi\\, G^2 M^3}{\\hbar c^4}' },
      ],
      physics: {
        de: 'In der Formel treffen sich Quantenmechanik (ħ), Relativität (c), Gravitation (G) und Thermodynamik (k_B). Sie folgt aus der semiklassischen Gravitation: Quantenfelder auf einer klassischen, gekrümmten Raumzeit. Hawking-Strahlung eines astrophysikalischen Schwarzen Lochs wurde nie beobachtet – sie wäre viel schwächer als die kosmische Hintergrundstrahlung. Analogexperimente (etwa in Bose-Einstein-Kondensaten) untersuchen verwandte Effekte, sind aber keine Messung an Schwarzen Löchern.',
        en: 'Quantum mechanics (ħ), relativity (c), gravity (G) and thermodynamics (k_B) all meet in this formula. It follows from semiclassical gravity: quantum fields on a classical, curved spacetime. Hawking radiation from an astrophysical black hole has never been observed – it would be far weaker than the cosmic microwave background. Analogue experiments (for example in Bose–Einstein condensates) study related effects, but they are not measurements on black holes.',
      },
      epistemics: [
        { type: 'assume', text: { de: 'Theoretische Vorhersage im Rahmen der semiklassischen Gravitation (Hawking, 1974/75).', en: 'Theoretical prediction within semiclassical gravity (Hawking, 1974/75).' } },
        { type: 'model', text: { de: 'Idealisiertes Schwarzschild-Loch; rotierende oder geladene Löcher haben andere Temperaturen.', en: 'Idealised Schwarzschild black hole; rotating or charged holes have different temperatures.' } },
        { type: 'approx', text: { de: 'Die Verdampfungszeit ist eine Größenordnungsabschätzung (nur Photonen, ohne Greybody-Faktoren).', en: 'The evaporation time is an order-of-magnitude estimate (photons only, without greybody factors).' } },
        { type: 'measured', text: { de: 'Nicht direkt gemessen. Die Massen der Beispiel-Löcher stammen aus Beobachtungen (Sternbahnen, EHT).', en: 'Not measured directly. The masses of the example black holes come from observations (stellar orbits, EHT).' } },
      ],
    },
  });

  const BH_ENTROPY = { de: 'Bekenstein-Hawking-Entropie', en: 'Bekenstein–Hawking entropy' };
  const DIMLESS_S = { de: 'Dimensionslose Entropie', en: 'Dimensionless entropy' };
  const HORIZON = { de: 'Horizontfläche', en: 'Horizon area' };
  const SCHW_R = { de: 'Schwarzschild-Radius', en: 'Schwarzschild radius' };

  define({
    id: 'bh-entropy', group: 'Famous Equations', field: 'famous', hall: true, title: BH_ENTROPY, short: { de: 'BH-Entropie', en: 'BH entropy' },
    dict: BH_DICT,
    tex: 'S_{\\mathrm{BH}} = \\frac{k_{\\mathrm{B}}\\, c^3 A}{4\\, G\\, \\hbar}',
    meta: { mathType: SCALAR, mainDim: { de: 'Entropie', en: 'Entropy' }, domain: BH_THERMO, status: { de: 'theoretisches Ergebnis, nicht gemessen', en: 'theoretical result, not measured' } },
    vars: {
      M: { label: 'M', tex: 'M', name: { de: 'Masse (Schwarzschild)', en: 'Mass (Schwarzschild)' }, dim: 'M', default: MS, min: 1e-8, max: 1e42, scale: 'log', positive: true },
      A: { label: 'A', tex: 'A', name: HORIZON, dim: 'L^2', default: 1.1e8, min: 1e-60, max: 1e30, scale: 'log', positive: true },
    },
    forms: [
      {
        id: 'mass', label: { de: 'Schwarzschild: aus der Masse', en: 'Schwarzschild: from the mass' }, vars: ['M'],
        outputs: [
          { key: 'rs', sym: 'r_s', tex: 'r_{\\mathrm{s}}', name: SCHW_R, expr: '2*G*M/c^2', dim: 'L' },
          { key: 'A', sym: 'A', tex: 'A', name: HORIZON, expr: '4*pi*rs^2', dim: 'L^2' },
          { key: 'S', sym: 'S_BH', tex: 'S_{\\mathrm{BH}}', name: BH_ENTROPY, expr: 'k_B*c^3*A/(4*G*hbar)', dim: 'M L^2 T^-2 Θ^-1', primary: true },
          { key: 'SkB', sym: 'S/k_B', tex: 'S_{\\mathrm{BH}}/k_{\\mathrm{B}}', name: DIMLESS_S, expr: 'S/k_B', dim: '' },
        ],
        equations: [
          { label: BH_ENTROPY, eq: 'S_BH = k_B*c^3*A/(4*G*hbar)' },
          { label: { de: 'Horizontfläche (Schwarzschild)', en: 'Horizon area (Schwarzschild)' }, eq: 'A = 4*pi*r_s^2' },
          { label: SCHW_R, eq: 'r_s = 2*G*M/c^2' },
          { label: DIMLESS_S, eq: 'S_kB = S_BH/k_B' },
        ],
      },
      {
        id: 'area', label: { de: 'Allgemein: aus der Fläche', en: 'General: from the area' }, vars: ['A'],
        outputs: [
          { key: 'S', sym: 'S_BH', tex: 'S_{\\mathrm{BH}}', name: BH_ENTROPY, expr: 'k_B*c^3*A/(4*G*hbar)', dim: 'M L^2 T^-2 Θ^-1', primary: true },
          { key: 'SkB', sym: 'S/k_B', tex: 'S_{\\mathrm{BH}}/k_{\\mathrm{B}}', name: DIMLESS_S, expr: 'S/k_B', dim: '' },
          { key: 'Meq', sym: 'M_Schw', tex: 'M_{\\mathrm{Schw}}', name: { de: 'Masse, falls Schwarzschild-Loch', en: 'Mass, if it is a Schwarzschild hole' }, expr: 'c^2/(2*G)*sqrt(A/(4*pi))', dim: 'M' },
        ],
        equations: [
          { label: BH_ENTROPY, eq: 'S_BH = k_B*c^3*A/(4*G*hbar)' },
          { label: DIMLESS_S, eq: 'S_kB = S_BH/k_B' },
        ],
      },
    ],
    symbols: { S_BH: { dim: 'M L^2 T^-2 Θ^-1' }, S_kB: { dim: '' }, r_s: { dim: 'L' } },
    checks({ v, issues }) {
      if (v.M > 0 && v.M < 1e-6) issues.push({ cat: 'model', why: T('nahe der Planck-Masse', 'near the Planck mass'), msg: T('Nahe der Planck-Masse ist die Flächenformel nicht mehr verlässlich.', 'Near the Planck mass the area formula is no longer reliable.') });
      issues.push({ cat: 'assume', msg: T('Semiklassisches Ergebnis für Ereignishorizonte.', 'Semiclassical result for event horizons.') });
    },
    presets: [
      { name: { de: '1 Sonnenmasse', en: '1 solar mass' }, form: 'mass', values: { M: MS } },
      { name: 'Sagittarius A*', form: 'mass', note: { de: '≈ 4,3 × 10⁶ M☉', en: '≈ 4.3 × 10⁶ M☉' }, values: { M: 4.3e6 * MS } },
      { name: { de: 'Planck-Masse', en: 'Planck mass' }, form: 'mass', note: { de: 'm_P ≈ 2,18 × 10⁻⁸ kg – Formel hier nicht mehr belastbar', en: 'm_P ≈ 2.18 × 10⁻⁸ kg – the formula can no longer be trusted here' }, values: { M: 2.176434e-8 } },
      { name: { de: 'Fläche 1 m²', en: 'Area 1 m²' }, form: 'area', values: { A: 1 } },
    ],
    graph: { x: 'M', y: 'S', xlog: true, ylog: true },
    viz: 'horizon',
    explain: {
      intuition: {
        de: 'Die Entropie eines Schwarzen Lochs wächst mit der Oberfläche seines Horizonts, nicht mit seinem Volumen. Pro Planck-Fläche kommt etwa ein Viertel „Einheit“ Entropie hinzu – das ergibt gigantische Zahlen.',
        en: 'The entropy of a black hole grows with the surface area of its horizon, not with its volume. Each Planck area adds about a quarter “unit” of entropy – which adds up to gigantic numbers.',
      },
      math: [
        { t: { de: 'Flächenform', en: 'Area form' }, tex: 'S_{\\mathrm{BH}} = \\frac{k_{\\mathrm{B}} c^3 A}{4 G \\hbar} = k_{\\mathrm{B}}\\,\\frac{A}{4\\, l_{\\mathrm{P}}^2}' },
        { t: { de: 'Schwarzschild-Horizont', en: 'Schwarzschild horizon' }, tex: 'A = 4\\pi r_{\\mathrm{s}}^2,\\quad r_{\\mathrm{s}} = \\frac{2GM}{c^2}' },
        { t: { de: 'Eingesetzt', en: 'Substituted' }, tex: 'S_{\\mathrm{BH}} = \\frac{4\\pi G k_{\\mathrm{B}}}{\\hbar c}\\, M^2' },
        { t: { de: 'Dimensionslos', en: 'Dimensionless' }, tex: '\\frac{S_{\\mathrm{BH}}}{k_{\\mathrm{B}}} = \\frac{A}{4\\,l_{\\mathrm{P}}^2}\\;\\in\\; \\mathbb{R}' },
      ],
      physics: {
        de: 'S/k_B ist eine reine Zahl: k_B hat genau die Dimension einer Entropie (J/K) und kürzt sie heraus. In der statistischen Physik wäre S/k_B = ln Ω, der Logarithmus der Anzahl von Mikrozuständen. Welche Mikrozustände ein Schwarzes Loch hat, ist offene Forschung; für spezielle (etwa extremale) Löcher liefern Stringtheorie und andere Ansätze Herleitungen.',
        en: 'S/k_B is a pure number: k_B has exactly the dimension of an entropy (J/K) and cancels it out. In statistical physics, S/k_B = ln Ω, the logarithm of the number of microstates. Which microstates a black hole has is an open research question; for special (e.g. extremal) holes, string theory and other approaches provide derivations.',
      },
      epistemics: [
        { type: 'assume', text: { de: 'Theoretisches Ergebnis (Bekenstein 1972/73, Hawking 1975); nicht direkt gemessen.', en: 'Theoretical result (Bekenstein 1972/73, Hawking 1975); not measured directly.' } },
        { type: 'model', text: { de: 'Die Form S(M) gilt nur für Schwarzschild-Löcher; die Flächenform ist allgemeiner.', en: 'The form S(M) only holds for Schwarzschild holes; the area form is more general.' } },
        { type: 'math', text: { de: 'S/k_B ist dimensionslos – das folgt exakt aus der Dimensionsanalyse.', en: 'S/k_B is dimensionless – this follows exactly from dimensional analysis.' } },
      ],
    },
  });

  define({
    id: 'efe', group: 'Famous Equations', field: 'famous', hall: true, title: { de: 'Einsteinsche Feldgleichungen', en: 'Einstein field equations' }, short: { de: 'Feldgleichungen', en: 'Field equations' },
    tex: 'G_{\\mu\\nu} + \\Lambda\\, g_{\\mu\\nu} = \\frac{8\\pi G}{c^4}\\, T_{\\mu\\nu}',
    meta: {
      mathType: { de: 'Tensorgleichung (10 gekoppelte nichtlineare PDGs)', en: 'Tensor equation (10 coupled nonlinear PDEs)' },
      mainDim: { de: 'Krümmung (L⁻²)', en: 'Curvature (L⁻²)' }, domain: { de: 'Allgemeine Relativitätstheorie', en: 'General relativity' },
      status: { de: 'vielfach experimentell bestätigt', en: 'confirmed by many experiments' },
    },
    vars: {
      u: { label: 'u', tex: 'u', name: { de: 'Energiedichte (≈ ρc² für Staub)', en: 'Energy density (≈ ρc² for dust)' }, dim: 'M L^-1 T^-2', default: 1000 * C.c.value ** 2, min: 1e-15, max: 1e40, scale: 'log', positive: true },
    },
    outputs: [
      { key: 'kappa', sym: 'κ', tex: '\\kappa', name: { de: 'Einstein-Kopplung 8πG/c⁴', en: 'Einstein coupling 8πG/c⁴' }, expr: '8*pi*G/c^4', dim: 'M^-1 L^-1 T^2' },
      { key: 'K', sym: 'K ~ κu', tex: 'K \\sim \\kappa u', name: { de: 'Krümmungsskala (Größenordnung)', en: 'Curvature scale (order of magnitude)' }, expr: 'kappa*u', dim: 'L^-2', primary: true },
      { key: 'Lc', sym: 'ℓ = 1/√K', tex: '\\ell', name: { de: 'Zugehörige Längenskala', en: 'Corresponding length scale' }, expr: '1/sqrt(K)', dim: 'L' },
      { key: 'KL', sym: 'K/Λ', tex: 'K/\\Lambda', name: { de: 'Verglichen mit Λ', en: 'Compared with Λ' }, expr: 'K/Lambda', dim: '' },
    ],
    equations: [
      { label: { de: 'Feldgleichungen – Dimension jeder Komponente', en: 'Field equations – dimension of each component' }, eq: 'G_mn + Lambda*g_mn = 8*pi*G/c^4*T_mn' },
      { label: { de: 'Einstein-Kopplung', en: 'Einstein coupling' }, eq: 'kappa = 8*pi*G/c^4' },
      { label: { de: 'Kopplung × Energiedichte = Krümmung', en: 'Coupling × energy density = curvature' }, eq: 'G_mn = kappa*T_mn' },
    ],
    symbols: {
      G_mn: { dim: 'L^-2', name: { de: 'Einstein-Tensor (Krümmung)', en: 'Einstein tensor (curvature)' } },
      g_mn: { dim: '', name: { de: 'Metrik (dimensionslos bei Koordinaten in Längeneinheiten)', en: 'Metric (dimensionless when all coordinates are lengths)' } },
      T_mn: { dim: 'M L^-1 T^-2', name: { de: 'Energie-Impuls-Tensor (Energiedichte, Druck)', en: 'Stress–energy tensor (energy density, pressure)' } },
    },
    checks({ issues }) {
      issues.push({ cat: 'model', why: T('nur Größenordnung', 'order of magnitude only'), msg: T('Nur eine Größenordnung: Die tatsächliche Krümmung folgt erst aus einer vollständigen Lösung (Symmetrie, Druck, Randbedingungen).', 'Only an order of magnitude: the actual curvature follows only from a full solution (symmetry, pressure, boundary conditions).') });
      issues.push({ cat: 'assume', msg: T('Energiedichte ≈ ρc² (Staub, Druck vernachlässigt).', 'Energy density ≈ ρc² (dust, pressure neglected).') });
    },
    presets: [
      { name: { de: 'Kritische Dichte des Universums', en: 'Critical density of the universe' }, note: { de: 'ρ ≈ 8,5 × 10⁻²⁷ kg/m³ (H₀ ≈ 67 km/s/Mpc, Planck 2018; lokale H₀-Messungen liegen höher)', en: 'ρ ≈ 8.5 × 10⁻²⁷ kg/m³ (H₀ ≈ 67 km/s/Mpc, Planck 2018; local H₀ measurements come out higher)' }, values: { u: 8.5e-27 * C.c.value ** 2 } },
      { name: { de: 'Interstellares Gas', en: 'Interstellar gas' }, note: { de: '≈ 1 Wasserstoffatom pro cm³', en: '≈ 1 hydrogen atom per cm³' }, values: { u: 1e6 * C.m_p.value * C.c.value ** 2 } },
      { name: { de: 'Luft', en: 'Air' }, note: { de: 'ρ ≈ 1,2 kg/m³', en: 'ρ ≈ 1.2 kg/m³' }, values: { u: 1.2 * C.c.value ** 2 } },
      { name: { de: 'Wasser', en: 'Water' }, note: 'ρ ≈ 1000 kg/m³', values: { u: 1000 * C.c.value ** 2 } },
      { name: { de: 'Sonnenkern', en: 'Solar core' }, note: { de: 'ρ ≈ 1,5 × 10⁵ kg/m³', en: 'ρ ≈ 1.5 × 10⁵ kg/m³' }, values: { u: 1.5e5 * C.c.value ** 2 } },
      { name: { de: 'Kernmaterie / Neutronenstern', en: 'Nuclear matter / neutron star' }, note: { de: 'ρ ≈ 2,3 × 10¹⁷ kg/m³', en: 'ρ ≈ 2.3 × 10¹⁷ kg/m³' }, values: { u: 2.3e17 * C.c.value ** 2 } },
    ],
    graph: { x: 'u', y: 'K', xlog: true, ylog: true, refs: [{ y: 'K', value: C.Lambda.value, label: { de: 'Λ ≈ 1,1 × 10⁻⁵² m⁻²', en: 'Λ ≈ 1.1 × 10⁻⁵² m⁻²' } }] },
    viz: 'spacetime',
    explain: {
      intuition: {
        de: 'Materie und Energie sagen der Raumzeit, wie sie sich krümmen soll; die Krümmung sagt der Materie, wie sie sich bewegen soll. Links steht Geometrie, rechts steht, was drin ist.',
        en: 'Matter and energy tell spacetime how to curve; curvature tells matter how to move. The left-hand side is geometry, the right-hand side is what is in it.',
      },
      math: [
        { t: { de: 'Feldgleichungen', en: 'Field equations' }, tex: 'G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}' },
        { t: { de: 'Einstein-Tensor aus Ricci-Tensor und -Skalar', en: 'Einstein tensor from the Ricci tensor and scalar' }, tex: 'G_{\\mu\\nu} = R_{\\mu\\nu} - \\tfrac12 R\\, g_{\\mu\\nu}' },
        { t: { de: 'Indizes μ, ν laufen über 0…3; beide Seiten sind symmetrisch', en: 'The indices μ, ν run over 0…3; both sides are symmetric' }, tex: { de: '4 \\times 4 \\;\\Rightarrow\\; 10 \\text{ unabhängige Gleichungen}', en: '4 \\times 4 \\;\\Rightarrow\\; 10 \\text{ independent equations}' } },
        { t: { de: 'Schematische Lesart – keine vollständige Gleichung', en: 'Schematic reading – not a complete equation' }, tex: { de: '\\text{Geometrie} \\;\\longleftrightarrow\\; \\text{Materie/Energie}', en: '\\text{geometry} \\;\\longleftrightarrow\\; \\text{matter/energy}' } },
      ],
      physics: {
        de: 'Das ist keine skalare Gleichung, sondern eine Gleichung zwischen Tensoren: zehn gekoppelte, nichtlineare partielle Differentialgleichungen für die Metrik g_μν. G_μν beschreibt die Krümmung (Dimension 1/Länge²), T_μν die Energie- und Impulsdichte (Dimension Energie/Volumen). Der Faktor 8πG/c⁴ übersetzt das eine ins andere – und er ist winzig: ≈ 2 × 10⁻⁴³ s²/(kg m). Deshalb braucht es enorme Energiedichten für spürbare Krümmung. Λ ist die kosmologische Konstante; ihr Wert stammt aus kosmologischen Beobachtungen im ΛCDM-Modell, ihre physikalische Natur ist ungeklärt. Die Dimension von g_μν hängt von der Wahl der Koordinaten ab; hier sind alle Koordinaten Längen (x⁰ = ct).',
        en: 'This is not a scalar equation but an equation between tensors: ten coupled, nonlinear partial differential equations for the metric g_μν. G_μν describes curvature (dimension 1/length²), T_μν the density of energy and momentum (dimension energy/volume). The factor 8πG/c⁴ translates one into the other – and it is tiny: ≈ 2 × 10⁻⁴³ s²/(kg m). That is why noticeable curvature takes enormous energy densities. Λ is the cosmological constant; its value comes from cosmological observations within the ΛCDM model, its physical nature is unknown. The dimension of g_μν depends on the choice of coordinates; here all coordinates are lengths (x⁰ = ct).',
      },
      epistemics: [
        { type: 'model', text: { de: 'Allgemeine Relativitätstheorie (Einstein, 1915).', en: 'General relativity (Einstein, 1915).' } },
        { type: 'measured', text: { de: 'Vielfach bestätigt: Periheldrehung, Lichtablenkung, Shapiro-Verzögerung, Gravitationswellen, EHT-Bilder.', en: 'Confirmed many times: perihelion precession, light deflection, Shapiro delay, gravitational waves, EHT images.' } },
        { type: 'assume', text: { de: 'Λ als Konstante ist eine Modellannahme; der Wert ist aus Beobachtungen abgeleitet (≈).', en: 'Λ being a constant is a model assumption; its value is inferred from observations (≈).' } },
        { type: 'approx', text: { de: 'Die hier berechnete Krümmungsskala K ~ κu ist nur eine Dimensionsabschätzung.', en: 'The curvature scale K ~ κu computed here is only a dimensional estimate.' } },
      ],
    },
  });

  const ENERGY = { de: 'Energie', en: 'Energy' };

  define({
    id: 'schroedinger', group: 'Famous Equations', field: 'famous', hall: true, title: { de: 'Schrödinger-Gleichung', en: 'Schrödinger equation' }, short: 'Schrödinger',
    tex: 'i\\hbar\\,\\frac{\\partial \\psi}{\\partial t} = \\Bigl[-\\frac{\\hbar^2}{2m}\\nabla^2 + V\\Bigr]\\psi',
    meta: {
      mathType: { de: 'lineare partielle Differentialgleichung', en: 'linear partial differential equation' },
      mainDim: { de: 'Energie × [ψ]', en: 'Energy × [ψ]' }, domain: { de: 'nichtrelativistische Quantenmechanik', en: 'non-relativistic quantum mechanics' },
      status: { de: 'im Gültigkeitsbereich präzise bestätigt', en: 'confirmed precisely within its domain' },
    },
    vars: {
      m: { label: 'm', tex: 'm', name: { de: 'Teilchenmasse', en: 'Particle mass' }, dim: 'M', default: C.m_e.value, min: 1e-31, max: 1e-3, scale: 'log', positive: true },
      L: { label: 'L', tex: 'L', name: { de: 'Breite des Potentialtopfs', en: 'Width of the potential well' }, dim: 'L', default: 1e-9, min: 1e-16, max: 1e-2, scale: 'log', positive: true },
      n: { label: 'n', tex: 'n', name: { de: 'Quantenzahl', en: 'Quantum number' }, dim: '', default: 1, min: 1, max: 12, scale: 'lin', integer: true },
    },
    outputs: [
      { key: 'E', sym: 'E_n', tex: 'E_n', name: { de: 'Energie des Zustands n', en: 'Energy of state n' }, expr: 'n^2*pi^2*hbar^2/(2*m*L^2)', dim: 'M L^2 T^-2', primary: true, alt: { unit: 'eV', div: 'eV' } },
      { key: 'dE', sym: 'E₂ − E₁', tex: 'E_2 - E_1', name: { de: 'Abstand der untersten Niveaus', en: 'Gap between the two lowest levels' }, expr: '3*pi^2*hbar^2/(2*m*L^2)', dim: 'M L^2 T^-2', alt: { unit: 'eV', div: 'eV' } },
      { key: 'lam', sym: 'λ_n', tex: '\\lambda_n', name: { de: 'Wellenlänge der stehenden Welle', en: 'Wavelength of the standing wave' }, expr: '2*L/n', dim: 'L' },
      { key: 'omega', sym: 'ω_n', tex: '\\omega_n', name: { de: 'Phasen-Kreisfrequenz', en: 'Phase angular frequency' }, expr: 'E/hbar', dim: 'T^-1' },
      { key: 'amp', sym: '√(2/L)', tex: '\\sqrt{2/L}', name: { de: 'Amplitude von ψ (Normierung)', en: 'Amplitude of ψ (normalisation)' }, expr: 'sqrt(2/L)', dim: 'L^-1/2' },
      { key: 'ratio', sym: 'E_n / (mc²)', tex: 'E_n/(mc^2)', name: { de: 'Relativistischer Check', en: 'Relativistic check' }, expr: 'E/(m*c^2)', dim: '' },
    ],
    equations: [
      { label: { de: 'Zeitabhängige Schrödinger-Gleichung (1D)', en: 'Time-dependent Schrödinger equation (1D)' }, eq: 'i*hbar*d_t*psi = -hbar^2/(2*m)*lap*psi + V*psi' },
      { label: { de: 'Zeitableitungs-Operator', en: 'Time-derivative operator' }, eq: 'E_op = hbar*d_t' },
      { label: { de: 'Kinetischer Operator', en: 'Kinetic operator' }, eq: 'E_op = hbar^2/(2*m)*lap' },
      { label: { de: 'Normierung ∫|ψ|² dx = 1', en: 'Normalisation ∫|ψ|² dx = 1' }, eq: 'one = psi^2*dx' },
      { label: { de: 'Kastenpotential: Energieniveaus', en: 'Box potential: energy levels' }, eq: 'E_n = n^2*pi^2*hbar^2/(2*m*L^2)' },
    ],
    symbols: {
      i: { dim: '', name: { de: 'imaginäre Einheit', en: 'imaginary unit' } },
      d_t: { dim: 'T^-1', name: { de: 'Zeitableitung ∂/∂t', en: 'time derivative ∂/∂t' } },
      lap: { dim: 'L^-2', name: { de: 'Laplace-Operator ∇² (in 1D: ∂²/∂x²)', en: 'Laplace operator ∇² (in 1D: ∂²/∂x²)' } },
      psi: { dim: 'L^-1/2', name: { de: 'Wellenfunktion (1D, normiert)', en: 'wave function (1D, normalised)' } },
      V: { dim: 'M L^2 T^-2', name: { de: 'Potential (Energie)', en: 'potential (energy)' } },
      E_op: { dim: 'M L^2 T^-2', name: ENERGY },
      E_n: { dim: 'M L^2 T^-2', name: ENERGY },
      one: { dim: '', name: { de: 'reine Zahl 1', en: 'the pure number 1' } },
      dx: { dim: 'L', name: { de: 'Längenelement', en: 'length element' } },
    },
    notes: [
      { t: { de: 'Warum ψ eine Dimension hat (1D)', en: 'Why ψ has a dimension (1D)' }, steps: [
        '\\int_{-\\infty}^{\\infty} |\\psi(x)|^2\\,\\mathrm{d}x = 1',
        '[\\psi]^2 \\cdot [\\mathrm{d}x] = [1]',
        '[\\psi]^2 \\cdot \\mathsf{L} = 1',
        '[\\psi] = \\mathsf{L}^{-1/2}',
      ], after: { de: 'In drei Dimensionen ist d³x ein Volumen, deshalb gilt dort [ψ] = L⁻³ᐟ².', en: 'In three dimensions d³x is a volume, so there [ψ] = L⁻³ᐟ².' } },
    ],
    checks({ o, issues }) {
      const r = o('ratio');
      if (isFinite(r) && r > 0.01) issues.push({ cat: 'model', why: T('relativistisch: E_n > 1 % mc²', 'relativistic: E_n > 1 % mc²'), msg: T('E_n ist mehr als 1 % der Ruheenergie mc²: Die nichtrelativistische Schrödinger-Gleichung reicht nicht mehr (Dirac-Gleichung, Quantenfeldtheorie).', 'E_n is more than 1 % of the rest energy mc²: the non-relativistic Schrödinger equation is no longer enough (Dirac equation, quantum field theory).') });
      issues.push({ cat: 'assume', msg: T('Unendlich hohe Wände (idealer Potentialtopf), ein einzelnes Teilchen ohne Spin.', 'Infinitely high walls (ideal potential well), a single particle without spin.') });
    },
    presets: [
      { name: { de: 'Elektron, 1 nm', en: 'Electron, 1 nm' }, note: { de: 'Größenordnung von Quantenpunkten – grobe Näherung', en: 'the size of quantum dots – a rough approximation' }, values: { m: C.m_e.value, L: 1e-9, n: 1 } },
      { name: { de: 'Elektron, 0,1 nm', en: 'Electron, 0.1 nm' }, note: { de: 'Atomgröße – sehr grobe Näherung für ein Atom', en: 'the size of an atom – a very rough approximation for an atom' }, values: { m: C.m_e.value, L: 1e-10, n: 1 } },
      { name: { de: 'Proton, 10 fm', en: 'Proton, 10 fm' }, note: { de: 'Kerngröße – das Kastenmodell ist hier nur ein Spielzeug', en: 'the size of a nucleus – the box model is only a toy here' }, values: { m: C.m_p.value, L: 1e-14, n: 1 } },
      { name: { de: 'Staubkorn, 1 µm', en: 'Dust grain, 1 µm' }, note: { de: 'm = 10⁻¹⁵ kg: die Quantisierung ist unmessbar klein', en: 'm = 10⁻¹⁵ kg: the quantisation is immeasurably small' }, values: { m: 1e-15, L: 1e-6, n: 1 } },
    ],
    graph: { x: 'L', y: 'E', xlog: true, ylog: true },
    viz: 'wavefunction',
    vizControls: [{ key: 'superpos', label: { de: 'Überlagerung von n und n+1', en: 'Superposition of n and n+1' } }],
    explain: {
      intuition: {
        de: 'Die Schrödinger-Gleichung beschreibt, wie sich eine Wellenfunktion mit der Zeit ändert. Sperrt man ein Teilchen in einen Kasten, passen nur stehende Wellen hinein – deshalb gibt es nur bestimmte Energien.',
        en: 'The Schrödinger equation describes how a wave function changes over time. If you lock a particle in a box, only standing waves fit inside – which is why only certain energies are allowed.',
      },
      math: [
        { t: { de: 'Zeitabhängig', en: 'Time-dependent' }, tex: 'i\\hbar\\,\\partial_t \\psi = \\hat H \\psi' },
        { t: { de: 'Hamilton-Operator für ein Teilchen im Potential', en: 'Hamiltonian for a particle in a potential' }, tex: '\\hat H = -\\frac{\\hbar^2}{2m}\\nabla^2 + V' },
        { t: { de: 'Stationäre Zustände', en: 'Stationary states' }, tex: '\\psi(x,t) = \\phi(x)\\, e^{-iEt/\\hbar}' },
        { t: { de: 'Kastenpotential der Breite L', en: 'Box potential of width L' }, tex: '\\phi_n(x) = \\sqrt{\\tfrac{2}{L}}\\,\\sin\\!\\bigl(\\tfrac{n\\pi x}{L}\\bigr),\\quad E_n = \\frac{n^2\\pi^2\\hbar^2}{2mL^2}' },
      ],
      physics: {
        de: 'Die Gleichung gilt für nichtrelativistische Teilchen ohne Spin. Innerhalb dieses Bereichs ist sie eine der am besten bestätigten Gleichungen der Physik (Atomspektren, Chemie, Halbleiter). Der unendlich tiefe Kasten ist dagegen ein Lehrbuchmodell – reale Potentiale sind endlich. Die Wellenfunktion selbst ist nicht direkt messbar; messbar sind Wahrscheinlichkeiten |ψ|². Ein Einzelzustand hat deshalb eine zeitlich konstante Aufenthaltswahrscheinlichkeit; erst eine Überlagerung erzeugt sichtbare Dynamik.',
        en: 'The equation holds for non-relativistic particles without spin. Within that domain it is one of the best-confirmed equations in physics (atomic spectra, chemistry, semiconductors). The infinitely deep box, on the other hand, is a textbook model – real potentials are finite. The wave function itself cannot be measured directly; what can be measured are probabilities |ψ|². A single stationary state therefore has a probability density that does not change in time; only a superposition produces visible dynamics.',
      },
      epistemics: [
        { type: 'model', text: { de: 'Nichtrelativistische Quantenmechanik (Schrödinger, 1926).', en: 'Non-relativistic quantum mechanics (Schrödinger, 1926).' } },
        { type: 'measured', text: { de: 'Vorhersagen im Gültigkeitsbereich experimentell sehr präzise bestätigt.', en: 'Predictions within its domain confirmed experimentally to high precision.' } },
        { type: 'approx', text: { de: 'Kein Spin (→ Pauli-Gleichung), keine Relativität (→ Dirac-Gleichung, QFT).', en: 'No spin (→ Pauli equation), no relativity (→ Dirac equation, QFT).' } },
        { type: 'assume', text: { de: 'Idealer Potentialtopf mit unendlich hohen Wänden.', en: 'Ideal potential well with infinitely high walls.' } },
      ],
    },
  });

  define({
    id: 'planck', group: 'Famous Equations', field: 'famous', hall: true, title: { de: 'Planck-Einheiten', en: 'Planck units' }, short: { de: 'Planck-Einheiten', en: 'Planck units' },
    subtitle: { de: 'Wenn Dimensionen zu Physik werden', en: 'When dimensions turn into physics' },
    tex: 'l_{\\mathrm{P}} = \\sqrt{\\frac{\\hbar G}{c^3}}',
    meta: {
      mathType: { de: 'skalare Kombinationen von Konstanten', en: 'scalar combinations of constants' }, mainDim: 'L, T, M, Θ',
      domain: { de: 'Dimensionsanalyse / Quantengravitation (spekulativ)', en: 'Dimensional analysis / quantum gravity (speculative)' },
      status: { de: 'Werte aus Messgrößen; Deutung ist Erwartung', en: 'values from measured quantities; the interpretation is an expectation' },
    },
    vars: {},
    outputs: [
      { key: 'lP', sym: 'l_P', tex: 'l_{\\mathrm{P}}', name: { de: 'Planck-Länge', en: 'Planck length' }, expr: 'sqrt(hbar*G/c^3)', dim: 'L', primary: true },
      { key: 'tP', sym: 't_P', tex: 't_{\\mathrm{P}}', name: { de: 'Planck-Zeit', en: 'Planck time' }, expr: 'sqrt(hbar*G/c^5)', dim: 'T' },
      { key: 'mP', sym: 'm_P', tex: 'm_{\\mathrm{P}}', name: { de: 'Planck-Masse', en: 'Planck mass' }, expr: 'sqrt(hbar*c/G)', dim: 'M' },
      { key: 'TP', sym: 'T_P', tex: 'T_{\\mathrm{P}}', name: { de: 'Planck-Temperatur', en: 'Planck temperature' }, expr: 'sqrt(hbar*c^5/(G*k_B^2))', dim: 'Θ' },
      { key: 'EP', sym: 'E_P', tex: 'E_{\\mathrm{P}}', name: { de: 'Planck-Energie', en: 'Planck energy' }, expr: 'sqrt(hbar*c^5/G)', dim: 'M L^2 T^-2' },
    ],
    equations: [
      { label: { de: 'Planck-Länge', en: 'Planck length' }, eq: 'l_P = sqrt(hbar*G/c^3)' },
      { label: { de: 'Planck-Zeit', en: 'Planck time' }, eq: 't_P = sqrt(hbar*G/c^5)' },
      { label: { de: 'Planck-Masse', en: 'Planck mass' }, eq: 'm_P = sqrt(hbar*c/G)' },
      { label: { de: 'Planck-Temperatur', en: 'Planck temperature' }, eq: 'T_P = sqrt(hbar*c^5/(G*k_B^2))' },
      { label: { de: 'Planck-Energie', en: 'Planck energy' }, eq: 'E_P = sqrt(hbar*c^5/G)' },
      { label: { de: 'Temperatur aus Energie: k_B rechnet um', en: 'Temperature from energy: k_B converts' }, eq: 'T_P = E_P/k_B' },
    ],
    symbols: { l_P: { dim: 'L' }, t_P: { dim: 'T' }, m_P: { dim: 'M' }, T_P: { dim: 'Θ' }, E_P: { dim: 'M L^2 T^-2' } },
    notes: [
      { t: { de: 'Wie k_B aus einer Energie eine Temperatur macht', en: 'How k_B turns an energy into a temperature' }, steps: [
        '[k_{\\mathrm{B}}] = \\mathrm{J/K} = \\mathsf{M}\\,\\mathsf{L}^{2}\\,\\mathsf{T}^{-2}\\,\\Theta^{-1}',
        'T_{\\mathrm{P}} = \\frac{E_{\\mathrm{P}}}{k_{\\mathrm{B}}}',
        '[T_{\\mathrm{P}}] = \\frac{\\mathsf{M}\\,\\mathsf{L}^{2}\\,\\mathsf{T}^{-2}}{\\mathsf{M}\\,\\mathsf{L}^{2}\\,\\mathsf{T}^{-2}\\,\\Theta^{-1}} = \\Theta',
      ], after: { de: 'In ħ, G und c kommt keine Temperatur vor. Erst k_B bringt die Dimension Θ ins Spiel – als reiner Umrechnungsfaktor.', en: 'No temperature appears in ħ, G or c. Only k_B brings in the dimension Θ – purely as a conversion factor.' } },
    ],
    checks({ issues }) {
      issues.push({ cat: 'info', msg: T('Die Werte folgen allein aus Konstanten. Ihre Unsicherheit stammt fast vollständig von G.', 'The values follow from constants alone. Their uncertainty comes almost entirely from G.') });
    },
    presets: [],
    graph: null,
    viz: 'scales',
    vizControls: [{ key: 'q', label: { de: 'Größe', en: 'Quantity' }, options: [
      { v: 'l', label: { de: 'Länge', en: 'Length' } }, { v: 't', label: { de: 'Zeit', en: 'Time' } }, { v: 'm', label: { de: 'Masse', en: 'Mass' } },
      { v: 'T', label: { de: 'Temperatur', en: 'Temperature' } }, { v: 'E', label: { de: 'Energie', en: 'Energy' } },
    ] }],
    explain: {
      intuition: {
        de: 'Aus ħ, G, c und k_B lässt sich genau eine Länge, eine Zeit, eine Masse und eine Temperatur bauen. Das sind die Planck-Einheiten – natürliche Maßstäbe, die ohne menschliche Konventionen auskommen.',
        en: 'From ħ, G, c and k_B you can build exactly one length, one time, one mass and one temperature. These are the Planck units – natural scales that need no human conventions.',
      },
      math: [
        { t: { de: 'Länge', en: 'Length' }, tex: 'l_{\\mathrm{P}} = \\sqrt{\\hbar G / c^3}' },
        { t: { de: 'Zeit', en: 'Time' }, tex: 't_{\\mathrm{P}} = \\sqrt{\\hbar G / c^5} = l_{\\mathrm{P}}/c' },
        { t: { de: 'Masse', en: 'Mass' }, tex: 'm_{\\mathrm{P}} = \\sqrt{\\hbar c / G}' },
        { t: { de: 'Energie', en: 'Energy' }, tex: 'E_{\\mathrm{P}} = \\sqrt{\\hbar c^5 / G} = m_{\\mathrm{P}} c^2' },
        { t: { de: 'Temperatur: die Planck-Energie, mit k_B umgerechnet', en: 'Temperature: the Planck energy, converted with k_B' }, tex: 'T_{\\mathrm{P}} = \\sqrt{\\hbar c^5 / (G k_{\\mathrm{B}}^2)} = \\frac{E_{\\mathrm{P}}}{k_{\\mathrm{B}}} = \\frac{m_{\\mathrm{P}} c^2}{k_{\\mathrm{B}}}' },
      ],
      physics: {
        de: 'Die Planck-Einheiten sind zunächst ein Ergebnis der Dimensionsanalyse. Man erwartet, dass bei diesen Skalen Quanteneffekte der Gravitation wichtig werden – das ist eine Erwartung, keine Messung. Oft liest man, die Planck-Länge sei die „kleinste mögliche Länge“ oder der Raum sei dort „gepixelt“. Das ist nicht nachgewiesen und folgt auch nicht aus der Dimensionsanalyse. Außerdem gilt: Welche Kombination man „die“ Planck-Einheit nennt, ist teils Konvention (manche Autoren verwenden 8πG statt G).',
        en: 'The Planck units are first of all a result of dimensional analysis. At these scales, quantum effects of gravity are expected to become important – that is an expectation, not a measurement. You often read that the Planck length is the “smallest possible length” or that space is “pixelated” there. That has not been shown and does not follow from dimensional analysis either. Also, which combination you call “the” Planck unit is partly a convention (some authors use 8πG instead of G).',
      },
      epistemics: [
        { type: 'math', text: { de: 'Eindeutige Kombination der Konstanten mit der gewünschten Dimension (bis auf dimensionslose Vorfaktoren).', en: 'The unique combination of the constants with the desired dimension (up to dimensionless prefactors).' } },
        { type: 'assume', text: { de: 'Die physikalische Bedeutung als Skala der Quantengravitation ist eine theoretische Erwartung.', en: 'Their physical meaning as the scale of quantum gravity is a theoretical expectation.' } },
        { type: 'measured', text: { de: 'Die Zahlenwerte hängen am gemessenen G (relative Unsicherheit ≈ 1,1 × 10⁻⁵ für √G).', en: 'The numerical values depend on the measured G (relative uncertainty ≈ 1.1 × 10⁻⁵ for √G).' } },
        { type: 'math', text: { de: 'k_B ist seit 2019 exakt festgelegt: T_P = E_P / k_B ist eine Umrechnung ohne zusätzliche Unsicherheit.', en: 'k_B has been fixed exactly since 2019: T_P = E_P / k_B is a conversion with no extra uncertainty.' } },
      ],
      more: [{
        t: { de: 'Boltzmann und k_B', en: 'Boltzmann and k_B' }, sub: { de: 'Hintergrund', en: 'Background' },
        paras: [
          { de: 'Ludwig Boltzmann (1844–1906) erklärte Wärme als ungeordnete Bewegung sehr vieler Teilchen. Sein Kerngedanke: Die Entropie zählt, auf wie viele Arten Ω sich ein Zustand mikroskopisch verwirklichen lässt, S = k_B ln Ω. Die Formel steht auf seinem Grab in Wien.',
            en: 'Ludwig Boltzmann (1844–1906) explained heat as the disordered motion of a huge number of particles. His key idea: entropy counts in how many ways Ω a state can be realised microscopically, S = k_B ln Ω. The formula is on his grave in Vienna.' },
          { de: 'Die Konstante selbst führte Max Planck 1900 ein, bei der Herleitung seines Strahlungsgesetzes – im selben Zug wie h. Boltzmann hat sie nie als eigene Konstante geschrieben; der Name ehrt ihn nachträglich.',
            en: 'The constant itself was introduced by Max Planck in 1900, while deriving his radiation law – together with h. Boltzmann never wrote it as a constant of its own; the name honours him after the fact.' },
          { de: 'k_B ist ein Umrechnungsfaktor zwischen Temperatur und Energie. k_B T ist die typische thermische Energie pro Teilchen (genauer ½ k_B T je Freiheitsgrad, der quadratisch in die Energie eingeht). Bei Raumtemperatur sind das etwa 4 × 10⁻²¹ J, rund 1/40 eV. Zusammen mit der Avogadro-Konstante ergibt k_B die Gaskonstante R = N_A k_B.',
            en: 'k_B is a conversion factor between temperature and energy. k_B T is the typical thermal energy per particle (more precisely ½ k_B T per degree of freedom that enters the energy quadratically). At room temperature this is about 4 × 10⁻²¹ J, roughly 1/40 eV. Together with the Avogadro constant, k_B gives the gas constant R = N_A k_B.' },
          { de: 'Seit 2019 ist k_B = 1,380649 × 10⁻²³ J/K exakt festgelegt. Damit ist das Kelvin über die Energie definiert und nicht mehr über den Tripelpunkt des Wassers.',
            en: 'Since 2019, k_B = 1.380649 × 10⁻²³ J/K has been fixed exactly. This defines the kelvin through energy rather than through the triple point of water.' },
          { de: 'In den Planck-Einheiten bringt k_B keine neue Physik: T_P = E_P / k_B ist die Planck-Energie, als Temperatur ausgedrückt. Wer Temperaturen gleich in Energieeinheiten angibt (k_B = 1, in der theoretischen Physik üblich), erhält für T_P und E_P dieselbe Zahl. Die Visualisierung zeigt beide Achsen: Kelvin oben, k_B T in Elektronvolt darunter.',
            en: 'In the Planck units, k_B adds no new physics: T_P = E_P / k_B is the Planck energy expressed as a temperature. If you give temperatures directly in energy units (k_B = 1, common in theoretical physics), T_P and E_P are the same number. The visualisation shows both axes: kelvin on top, k_B T in electronvolts below.' },
        ],
        link: { href: '#view=theorie&sec=entropy', label: { de: 'Mehr zu Boltzmann und Entropie in den Grundlagen →', en: 'More on Boltzmann and entropy in the basics →' } },
      }],
    },
  });

  // Order in the "Famous Equations" comparison table
  PP.hallOrder = ['hawking', 'bh-entropy', 'efe', 'schroedinger', 'planck'];
})(globalThis.PP = globalThis.PP || {});
