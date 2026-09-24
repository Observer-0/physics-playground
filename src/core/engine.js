/* =====================================================================
   Physics Playground — Formula Engine
   Formula → AST → Dimensions → Evaluation (double + log10 domain)
   Pure logic, no DOM. Runs in the browser and in Node (tests).
   ===================================================================== */
(function (PP) {
  'use strict';

  // Nur eigene Einträge zählen. Sonst wären Namen wie „constructor“ oder „toString“
  // in jedem Objekt „bekannt“ und würden als Konstante, Funktion oder Dimension gelesen.
  const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
  const I = PP.i18n, T = I.T;

  /* ---------- Rational numbers (for exponents like L^-1/2) ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }
  function R(n, d = 1) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
  }
  const Rz = R(0);
  const radd = (a, b) => R(a.n * b.d + b.n * a.d, a.d * b.d);
  const rmul = (a, b) => R(a.n * b.n, a.d * b.d);
  const rneg = (a) => R(-a.n, a.d);
  const rzero = (a) => a.n === 0;
  const rval = (a) => a.n / a.d;
  function rFromNumber(x, maxDen = 64) {
    if (!isFinite(x)) return null;
    for (let d = 1; d <= maxDen; d++) {
      const n = Math.round(x * d);
      if (Math.abs(n / d - x) < 1e-9) return R(n, d);
    }
    return null;
  }

  /* ---------- Dimensions: exponents of 7 SI base quantities ---------- */
  const BASES = ['M', 'L', 'T', 'Θ', 'I', 'N', 'J'];
  const SI_BASE = ['kg', 'm', 's', 'K', 'A', 'mol', 'cd'];
  const BASE_NAMES = I.localize([{ de: 'Masse', en: 'mass' }, { de: 'Länge', en: 'length' }, { de: 'Zeit', en: 'time' }, { de: 'Temperatur', en: 'temperature' },
    { de: 'Stromstärke', en: 'electric current' }, { de: 'Stoffmenge', en: 'amount of substance' }, { de: 'Lichtstärke', en: 'luminous intensity' }]);

  const dimless = () => BASES.map(() => Rz);
  function dimParse(str) {
    const d = dimless();
    if (!str || str.trim() === '1' || str.trim() === '') return d;
    const re = /(Θ|Th|M|L|T|I|N|J)(?:\^(-?\d+)(?:\/(\d+))?)?/g;
    let m, consumed = '';
    while ((m = re.exec(str))) {
      const key = m[1] === 'Th' ? 'Θ' : m[1];
      const i = BASES.indexOf(key);
      if (m[3] && parseInt(m[3], 10) === 0) throw new Error(T('Ungültige Dimensionsangabe: Nenner 0 im Exponenten von ', 'Invalid dimension: zero denominator in the exponent of ') + key);
      const e = R(m[2] ? parseInt(m[2], 10) : 1, m[3] ? parseInt(m[3], 10) : 1);
      d[i] = radd(d[i], e);
      consumed += m[0];
    }
    if (consumed.replace(/\s/g, '') !== str.replace(/\s/g, '')) throw new Error(T('Ungültige Dimensionsangabe: ', 'Invalid dimension: ') + str);
    return d;
  }
  const dimMul = (a, b) => a.map((x, i) => radd(x, b[i]));
  const dimDiv = (a, b) => a.map((x, i) => radd(x, rneg(b[i])));
  const dimPow = (a, p) => a.map((x) => rmul(x, p));
  const dimEq = (a, b) => a.every((x, i) => x.n === b[i].n && x.d === b[i].d);
  const dimIsless = (a) => a.every(rzero);
  const dimKey = (a) => a.map((x) => x.n + '/' + x.d).join(',');

  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '/': 'ᐟ' };
  const sup = (s) => String(s).split('').map((c) => SUP[c] || c).join('');
  const rStr = (r) => (r.d === 1 ? String(r.n) : r.n + '/' + r.d);
  const rTex = (r) => (r.d === 1 ? String(r.n) : r.n + '/' + r.d);

  function dimStr(a) {
    const parts = [];
    a.forEach((e, i) => { if (!rzero(e)) parts.push(BASES[i] + (e.n === 1 && e.d === 1 ? '' : sup(rStr(e)))); });
    return parts.length ? parts.join(' ') : '1';
  }
  function dimTex(a) {
    const parts = [];
    a.forEach((e, i) => {
      if (rzero(e)) return;
      const b = BASES[i] === 'Θ' ? '\\Theta' : '\\mathsf{' + BASES[i] + '}';
      parts.push(e.n === 1 && e.d === 1 ? b : b + '^{' + rTex(e) + '}');
    });
    return parts.length ? parts.join('\\,') : '1';
  }
  function siUnitStr(a) {
    const pos = [], neg = [];
    a.forEach((e, i) => {
      if (rzero(e)) return;
      const s = SI_BASE[i] + (e.n === 1 && e.d === 1 ? '' : sup(rStr(e)));
      (rval(e) > 0 ? pos : neg).push(s);
    });
    const all = pos.concat(neg);
    return all.length ? all.join(' ') : '1';
  }

  // Named derived units and quantity names (lookup by dimension)
  const NAMED = I.localize([
    ['M L T^-2', 'N', 'Kraft', 'force'],
    ['M L^2 T^-2', 'J', 'Energie', 'energy'],
    ['M L^2 T^-3', 'W', 'Leistung', 'power'],
    ['M L^-1 T^-2', 'Pa = J/m³', 'Druck / Energiedichte', 'pressure / energy density'],
    ['M L^2 T^-2 Θ^-1', 'J/K', 'Entropie', 'entropy'],
    ['M L^2 T^-1', 'J s', 'Wirkung / Drehimpuls', 'action / angular momentum'],
    ['L T^-1', 'm/s', 'Geschwindigkeit', 'velocity'],
    ['L T^-2', 'm/s²', 'Beschleunigung', 'acceleration'],
    ['T^-1', 's⁻¹', 'Frequenz / Rate', 'frequency / rate'],
    ['L^2', 'm²', 'Fläche', 'area'],
    ['L^3', 'm³', 'Volumen', 'volume'],
    ['L^-2', 'm⁻²', 'Krümmung', 'curvature'],
    ['M L T^-1', 'kg m/s', 'Impuls', 'momentum'],
    ['M T^-2', 'N/m', 'Federkonstante', 'spring constant'],
    ['I T', 'C', 'Ladung', 'charge'],
    ['L^3 M^-1 T^-2', 'm³ kg⁻¹ s⁻²', 'Gravitationskopplung', 'gravitational coupling'],
    ['M^-1 L^-1 T^2', 's² kg⁻¹ m⁻¹', 'Einstein-Kopplung', 'Einstein coupling'],
    ['M L T^-2 I^-2', 'N/A²', 'Permeabilität', 'permeability'],
    ['M^-1 L^-3 T^4 I^2', 'F/m', 'Permittivität', 'permittivity'],
    ['L^-1/2', 'm⁻¹ᐟ²', 'Wellenfunktion (1D)', 'wave function (1D)'],
    ['L^-3/2', 'm⁻³ᐟ²', 'Wellenfunktion (3D)', 'wave function (3D)'],
    ['M', 'kg', 'Masse', 'mass'], ['L', 'm', 'Länge', 'length'], ['T', 's', 'Zeit', 'time'], ['Θ', 'K', 'Temperatur', 'temperature'],
    ['I', 'A', 'Stromstärke', 'electric current'], ['N', 'mol', 'Stoffmenge', 'amount of substance'], ['N^-1', 'mol⁻¹', 'pro Stoffmenge', 'per amount of substance'],
    ['', '1', 'dimensionslos', 'dimensionless'],
  ].map(([d, u, de, en]) => ({ key: dimKey(dimParse(d)), unit: u, name: { de, en } })));
  const NAMED_MAP = new Map(NAMED.map((x) => [x.key, x]));
  function dimInfo(a) {
    const hit = NAMED_MAP.get(dimKey(a));
    const si = siUnitStr(a);
    return { dim: dimStr(a), tex: dimTex(a), si, unit: hit ? hit.unit : si, name: hit ? hit.name : null };
  }

  /* ---------- Lexer / Parser → AST ---------- */
  const SUBS = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
  const SUPS = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
  function normalize(src, map) {
    // Map pretty unicode to ASCII. Positions shift (ħ → hbar); if `map` is an array,
    // map[j] receives the raw index of normalized character j (map[out.length] = src.length).
    let out = '';
    const emit = (s, at) => { out += s; if (map) for (let k = 0; k < s.length; k++) map.push(at); };
    for (let i = 0; i < src.length; i++) {
      const ch = src[i], at = i;
      if (ch === 'ħ') emit('hbar', at);
      else if (ch === 'π') emit('pi', at);
      else if (ch === 'Λ') emit('Lambda', at);
      else if (ch === '·' || ch === '×' || ch === '⋅') emit('*', at);
      else if (ch === '−' || ch === '–') emit('-', at);
      else if (has(SUBS, ch)) emit(SUBS[ch], at);
      else if (has(SUPS, ch)) {
        let s = '';
        while (i < src.length && has(SUPS, src[i])) { s += SUPS[src[i]]; i++; }
        i--;
        emit('^' + (s.startsWith('-') ? '(' + s + ')' : s), at);
      } else if (ch === '√') emit('sqrt', at);
      else emit(ch, at);
    }
    if (map) map.push(src.length);
    return out;
  }

  function tokenize(src) {
    const toks = [];
    const re = /\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|(\S))/y;
    let m;
    re.lastIndex = 0;
    while (re.lastIndex < src.length) {
      const start = re.lastIndex;
      m = re.exec(src);
      if (!m) break;
      const pos = start + m[0].length - (m[1] || m[2] || m[3] || '').length;
      if (m[1] !== undefined) toks.push({ t: 'num', v: parseFloat(m[1]), s: pos, e: pos + m[1].length });
      else if (m[2] !== undefined) {
        if (m[2] === '__proto__') throw parseError(T('Der Name „__proto__“ ist reserviert – bitte anders benennen', 'The name “__proto__” is reserved – please choose another one'), pos, pos + m[2].length);
        toks.push({ t: 'id', v: m[2], s: pos, e: pos + m[2].length });
      }
      else if (m[3] !== undefined) {
        if (!'+-*/^(),='.includes(m[3])) throw parseError(T('Unerwartetes Zeichen „' + m[3] + '“', 'Unexpected character “' + m[3] + '”'), pos, pos + 1);
        toks.push({ t: 'op', v: m[3], s: pos, e: pos + 1 });
      }
    }
    return toks;
  }
  function parseError(msg, s, e) { const err = new Error(msg); err.kind = 'parse'; err.span = [s, e]; return err; }

  let NODE_ID = 0;
  const node = (type, props, s, e) => Object.assign({ type, id: ++NODE_ID, span: [s, e] }, props);

  function parse(srcRaw) {
    const src = normalize(srcRaw);
    const toks = tokenize(src);
    let p = 0;
    const peek = () => toks[p];
    const isOp = (v) => toks[p] && toks[p].t === 'op' && toks[p].v === v;
    const eat = (v) => {
      if (!isOp(v)) {
        const t = toks[p];
        throw parseError(T('Erwartet „' + v + '“' + (t ? ' statt „' + t.v + '“' : ' am Ende'), 'Expected “' + v + '”' + (t ? ' instead of “' + t.v + '”' : ' at the end')), t ? t.s : src.length, t ? t.e : src.length);
      }
      return toks[p++];
    };
    function parseExpr() {
      let left = parseTerm();
      while (isOp('+') || isOp('-')) {
        const op = toks[p++].v;
        const right = parseTerm();
        left = node(op === '+' ? 'add' : 'sub', { a: left, b: right }, left.span[0], right.span[1]);
      }
      return left;
    }
    function startsPrimary(t) { return t && (t.t === 'num' || t.t === 'id' || (t.t === 'op' && t.v === '(')); }
    function parseTerm() {
      let left = parseUnary();
      for (;;) {
        if (isOp('*') || isOp('/')) {
          const op = toks[p++].v;
          const right = parseUnary();
          left = node(op === '*' ? 'mul' : 'div', { a: left, b: right }, left.span[0], right.span[1]);
        } else if (startsPrimary(peek())) {
          // implicit multiplication: "G M / c"
          const right = parseUnary();
          left = node('mul', { a: left, b: right, implicit: true }, left.span[0], right.span[1]);
        } else break;
      }
      return left;
    }
    function parseUnary() {
      if (isOp('-')) { const t = toks[p++]; const a = parseUnary(); return node('neg', { a }, t.s, a.span[1]); }
      if (isOp('+')) { p++; return parseUnary(); }
      return parsePow();
    }
    function parsePow() {
      const base = parsePrimary();
      if (isOp('^')) {
        p++;
        const exp = parseUnary(); // right-assoc, allows 2^-1
        return node('pow', { a: base, b: exp }, base.span[0], exp.span[1]);
      }
      return base;
    }
    function parsePrimary() {
      const t = toks[p];
      if (!t) throw parseError(T('Ausdruck endet unerwartet', 'Expression ends unexpectedly'), src.length, src.length);
      if (t.t === 'num') { p++; return node('num', { v: t.v }, t.s, t.e); }
      if (t.t === 'id') {
        p++;
        if (isOp('(') && has(FUNCS, t.v)) {
          eat('(');
          const args = [parseExpr()];
          while (isOp(',')) { p++; args.push(parseExpr()); }
          const close = eat(')');
          if (args.length !== 1) throw parseError(t.v + T('(…) erwartet genau ein Argument, bekommt aber ', '(…) takes exactly one argument but got ') + args.length, t.s, close.e);
          return node('call', { name: t.v, args }, t.s, close.e);
        }
        return node('var', { name: t.v }, t.s, t.e);
      }
      if (isOp('(')) {
        const open = toks[p++];
        const inner = parseExpr();
        const close = eat(')');
        inner.paren = true;
        inner.span = [open.s, close.e];
        return inner;
      }
      throw parseError(T('Unerwartetes Symbol „' + t.v + '“', 'Unexpected symbol “' + t.v + '”'), t.s, t.e);
    }
    const ast = parseExpr();
    if (p < toks.length) {
      const t = toks[p];
      throw parseError(T('Unerwartetes „' + t.v + '“', 'Unexpected “' + t.v + '”'), t.s, t.e);
    }
    ast.src = src;
    return ast;
  }

  function parseEquation(srcRaw) {
    const src = normalize(srcRaw);
    const idx = src.indexOf('=');
    if (idx < 0) return { lhs: null, rhs: parse(src), src };
    const lhsSrc = src.slice(0, idx), rhsSrc = src.slice(idx + 1);
    let lhs, rhs;
    try { lhs = parse(lhsSrc); } catch (e) { throw e; }
    try { rhs = parse(rhsSrc); } catch (e) { if (e.span) e.span = [e.span[0] + idx + 1, e.span[1] + idx + 1]; throw e; }
    shiftSpans(rhs, idx + 1);
    return { lhs, rhs, src };
  }
  function shiftSpans(n, k) {
    n.span = [n.span[0] + k, n.span[1] + k];
    ['a', 'b'].forEach((c) => n[c] && shiftSpans(n[c], k));
    if (n.args) n.args.forEach((x) => shiftSpans(x, k));
  }

  function symbolsIn(ast, set = new Set()) {
    if (!ast) return set;
    if (ast.type === 'var') set.add(ast.name);
    ['a', 'b'].forEach((c) => ast[c] && symbolsIn(ast[c], set));
    if (ast.args) ast.args.forEach((x) => symbolsIn(x, set));
    return set;
  }

  /* ---------- Numeric evaluation: sign + log10 + double ---------- */
  // Num = { s: -1|0|1, l: log10|x|, d: double or NaN (NaN = not representable) }
  const LN10 = Math.LN10;
  function mk(x) {
    if (typeof x === 'object') return x;
    if (Number.isNaN(x)) throw mathError(T('Ungültiger Zahlenwert (NaN) als Eingabe', 'Invalid numeric input (NaN)'));
    if (x === 0) return { s: 0, l: -Infinity, d: 0 };
    if (!isFinite(x)) throw mathError(T('Unendlicher Eingabewert', 'Infinite input value'));
    return { s: Math.sign(x), l: Math.log10(Math.abs(x)), d: x };
  }
  function mathError(msg, n) { const e = new Error(msg); e.kind = 'math'; e.node = n; return e; }
  const ZERO = { s: 0, l: -Infinity, d: 0 };
  function fromLog(s, l) {
    if (s === 0) return ZERO;
    let d = s * Math.pow(10, l);
    if (!isFinite(d) || d === 0) d = NaN;
    return { s, l, d };
  }
  function clean(d, s, l) {
    // keep exact double only if representable and consistent
    if (!isFinite(d) || (d === 0 && s !== 0)) return { s, l, d: NaN };
    return { s, l, d };
  }
  const N = {
    mul(a, b) {
      if (a.s === 0 || b.s === 0) return ZERO;
      const s = a.s * b.s, l = a.l + b.l;
      return clean(a.d * b.d, s, l);
    },
    div(a, b, n) {
      if (b.s === 0) throw mathError(T('Division durch 0 – der Ausdruck ist hier mathematisch undefiniert (Singularität)', 'Division by 0 – the expression is mathematically undefined here (singularity)'), n);
      if (a.s === 0) return ZERO;
      const s = a.s * b.s, l = a.l - b.l;
      return clean(a.d / b.d, s, l);
    },
    add(a, b) {
      if (a.s === 0) return b;
      if (b.s === 0) return a;
      if (isFinite(a.d) && isFinite(b.d)) {
        const d = a.d + b.d;
        if (isFinite(d)) {
          if (d === 0) return ZERO;
          return { s: Math.sign(d), l: Math.log10(Math.abs(d)), d };
        }
      }
      // log-domain addition
      const [big, small] = a.l >= b.l ? [a, b] : [b, a];
      const r = Math.pow(10, small.l - big.l);
      if (big.s === small.s) return fromLog(big.s, big.l + Math.log10(1 + r));
      if (r === 1) return ZERO;
      return fromLog(big.s, big.l + Math.log10(1 - r));
    },
    neg(a) { return a.s === 0 ? ZERO : { s: -a.s, l: a.l, d: -a.d }; },
    pow(a, b, n) {
      const k = toDouble(b);
      if (a.s === 0) {
        if (k > 0) return ZERO;
        if (k === 0) throw mathError(T('0⁰ ist mathematisch nicht eindeutig festgelegt (unbestimmter Ausdruck)', '0⁰ has no unique mathematical value (indeterminate form)'), n);
        throw mathError(T('0 hoch ' + k + ' ist undefiniert (Division durch 0)', '0 to the power ' + k + ' is undefined (division by 0)'), n);
      }
      let s = 1;
      if (a.s < 0) {
        if (!Number.isInteger(k)) throw mathError(T('Negative Basis mit nicht-ganzzahligem Exponenten – Ergebnis wäre komplex', 'Negative base with a non-integer exponent – the result would be complex'), n);
        s = k % 2 === 0 ? 1 : -1;
      }
      return clean(Math.pow(a.d, k), s, a.l * k);
    },
  };
  function toDouble(x) {
    if (x.s === 0) return 0;
    if (isFinite(x.d)) return x.d;
    return x.s * Math.pow(10, x.l); // may be ±Infinity or 0
  }

  // Argument als Double; jenseits von ≈10^±308 gibt es für exp und Winkelfunktionen keinen sinnvollen Wert
  function finiteArg(a, name, n) {
    const x = toDouble(a);
    if (!isFinite(x)) throw mathError(T('Argument von ' + name + '(…) liegt außerhalb des Double-Bereichs (≈10^±308) – das Ergebnis ist dort nicht mehr sinnvoll darstellbar', 'The argument of ' + name + '(…) lies outside the double range (≈10^±308) – no meaningful result can be represented there'), n);
    return x;
  }
  const trig = (name, fn) => ({ dim: 'less', f: (a, n) => mk(fn(finiteArg(a, name, n))) });
  const FUNCS = Object.assign(Object.create(null), {
    sqrt: { dim: 'half', f: (a, n) => { if (a.s < 0) throw mathError(T('Wurzel aus negativer Zahl – Ergebnis wäre imaginär', 'Square root of a negative number – the result would be imaginary'), n); return a.s === 0 ? ZERO : clean(Math.sqrt(a.d), 1, a.l / 2); } },
    abs: { dim: 'same', f: (a) => (a.s < 0 ? N.neg(a) : a) },
    exp: { dim: 'less', f: (a, n) => { const x = finiteArg(a, 'exp', n); const d = Math.exp(x); return isFinite(d) && d !== 0 ? mk(d) : { s: 1, l: x / LN10, d: NaN }; } },
    ln: { dim: 'less', f: (a, n) => { if (a.s <= 0) throw mathError(T('Logarithmus nur für positive Zahlen definiert', 'Logarithm is only defined for positive numbers'), n); return mk(a.l * LN10); } },
    log10: { dim: 'less', f: (a, n) => { if (a.s <= 0) throw mathError(T('Logarithmus nur für positive Zahlen definiert', 'Logarithm is only defined for positive numbers'), n); return mk(a.l); } },
    sin: trig('sin', Math.sin),
    cos: trig('cos', Math.cos),
    tan: trig('tan', Math.tan),
    // Vollständiges elliptisches Integral 1. Art, K(k) mit Modul k (nicht Parameter m = k²).
    // Über das arithmetisch-geometrische Mittel: K(k) = π / (2·AGM(1, √(1 − k²))), NIST DLMF 19.8.5
    ellipk: { dim: 'less', f: (a, n) => {
      const k = Math.abs(finiteArg(a, 'ellipk', n));
      if (k === 1) throw mathError(T('K(k) divergiert für k = 1 (logarithmische Singularität)', 'K(k) diverges at k = 1 (logarithmic singularity)'), n);
      if (k > 1) throw mathError(T('K(k) ist für |k| > 1 nicht reell', 'K(k) is not real for |k| > 1'), n);
      let x = 1, y = Math.sqrt((1 - k) * (1 + k));
      for (let i = 0; i < 60 && Math.abs(x - y) > 1e-15 * x; i++) [x, y] = [(x + y) / 2, Math.sqrt(x * y)];
      return mk(Math.PI / (x + y));
    } },
  });

  function evalNode(n, env) {
    switch (n.type) {
      case 'num': return mk(n.v);
      case 'var': {
        if (!has(env, n.name)) throw mathError(T('Unbekanntes Symbol „' + n.name + '“', 'Unknown symbol “' + n.name + '”'), n);
        return mk(env[n.name]);
      }
      case 'neg': return N.neg(evalNode(n.a, env));
      case 'add': return N.add(evalNode(n.a, env), evalNode(n.b, env));
      case 'sub': return N.add(evalNode(n.a, env), N.neg(evalNode(n.b, env)));
      case 'mul': return N.mul(evalNode(n.a, env), evalNode(n.b, env));
      case 'div': return N.div(evalNode(n.a, env), evalNode(n.b, env), n);
      case 'pow': return N.pow(evalNode(n.a, env), evalNode(n.b, env), n);
      case 'call': {
        const F = has(FUNCS, n.name) ? FUNCS[n.name] : null;
        if (!F) throw mathError(T('Unbekannte Funktion ', 'Unknown function ') + n.name, n);
        return F.f(evalNode(n.args[0], env), n);
      }
    }
    throw mathError(T('Unbekannter Knoten ', 'Unknown node ') + n.type, n);
  }

  // Safe evaluation: never throws, never returns bare NaN.
  function evaluate(ast, env) {
    try {
      const r = evalNode(ast, env);
      const issues = [];
      const d = toDouble(r);
      if (r.s !== 0 && (!isFinite(d) || d === 0)) {
        issues.push({ cat: 'numeric', msg: T('Ergebnis liegt außerhalb des Double-Bereichs (≈10^±308) und wurde logarithmisch berechnet.', 'The result lies outside the double range (≈10^±308) and was computed logarithmically.') });
      } else if (r.s !== 0 && !isFinite(r.d)) {
        issues.push({ cat: 'numeric', msg: T('Zwischenergebnisse lagen außerhalb des Double-Bereichs; Auswertung über log₁₀ stabilisiert.', 'Intermediate results lay outside the double range; evaluation stabilised via log₁₀.') });
      }
      return { ok: true, s: r.s, l: r.l, value: d, representable: r.s === 0 || (isFinite(d) && d !== 0), issues };
    } catch (e) {
      if (e.kind === 'math') return { ok: false, s: 0, l: NaN, value: NaN, representable: false, issues: [{ cat: 'math', msg: e.message, span: e.node && e.node.span }] };
      throw e;
    }
  }

  /* ---------- Dimensional analysis ---------- */
  function dimAnalyze(ast, symDims) {
    const errors = [];
    function numericConst(n) {
      // exponent must be a fixed number (only numbers / dimensionless constants like pi)
      const syms = [...symbolsIn(n)];
      if (syms.some((s) => !has(NUMERIC_SYMBOLS, s))) return null;
      const r = evaluate(n, NUMERIC_SYMBOLS);
      return r.ok ? r.value : null;
    }
    function go(n) {
      switch (n.type) {
        case 'num': return dimless();
        case 'var': {
          const d = has(symDims, n.name) ? symDims[n.name] : null;
          if (!d) { errors.push({ node: n, msg: T('Symbol „' + n.name + '“ hat keine bekannte Dimension', 'Symbol “' + n.name + '” has no known dimension') }); return dimless(); }
          return d;
        }
        case 'neg': return go(n.a);
        case 'add': case 'sub': {
          const a = go(n.a), b = go(n.b);
          if (!dimEq(a, b)) {
            errors.push({ node: n, kind: 'sum', msg: (n.type === 'add' ? T('Addition', 'Addition') : T('Subtraktion', 'Subtraction')) + T(' inkompatibler Dimensionen: [', ' of incompatible dimensions: [') + dimStr(a) + '] ' + (n.type === 'add' ? '+' : '−') + ' [' + dimStr(b) + ']', left: a, right: b });
          }
          return a;
        }
        case 'mul': return dimMul(go(n.a), go(n.b));
        case 'div': return dimDiv(go(n.a), go(n.b));
        case 'pow': {
          const base = go(n.a);
          const ed = go(n.b);
          if (!dimIsless(ed)) errors.push({ node: n.b, msg: T('Exponent muss dimensionslos sein, hat aber [', 'An exponent must be dimensionless, but this one has [') + dimStr(ed) + ']' });
          if (dimIsless(base)) return dimless();
          const k = numericConst(n.b);
          if (k === null) { errors.push({ node: n.b, msg: T('Eine dimensionsbehaftete Größe darf nur mit einer festen Zahl potenziert werden', 'A quantity with a dimension can only be raised to a fixed number') }); return base; }
          const r = rFromNumber(k);
          if (!r) { errors.push({ node: n.b, msg: T('Exponent ' + k + ' ist nicht rational darstellbar – Dimension undefiniert', 'Exponent ' + k + ' is not a simple fraction – dimension undefined') }); return base; }
          return dimPow(base, r);
        }
        case 'call': {
          const F = has(FUNCS, n.name) ? FUNCS[n.name] : null;
          const a = go(n.args[0]);
          if (!F) { errors.push({ node: n, msg: T('Unbekannte Funktion ', 'Unknown function ') + n.name }); return dimless(); }
          if (F.dim === 'half') return dimPow(a, R(1, 2));
          if (F.dim === 'same') return a;
          if (!dimIsless(a)) errors.push({ node: n, msg: n.name + T('(…) braucht ein dimensionsloses Argument, bekommt aber [', '(…) needs a dimensionless argument, but got [') + dimStr(a) + ']' });
          return dimless();
        }
      }
      return dimless();
    }
    const dim = go(ast);
    return { dim, errors, ok: errors.length === 0 };
  }

  function checkEquation(eq, symDims) {
    // eq = {lhs: AST, rhs: AST}
    const R_ = dimAnalyze(eq.rhs, symDims);
    const result = { rhs: R_, lhs: null, consistent: R_.ok, mismatch: null };
    if (eq.lhs) {
      const L_ = dimAnalyze(eq.lhs, symDims);
      result.lhs = L_;
      result.consistent = R_.ok && L_.ok;
      if (!dimEq(L_.dim, R_.dim)) {
        result.consistent = false;
        result.mismatch = { left: L_.dim, right: R_.dim, ratio: dimDiv(R_.dim, L_.dim) };
      }
    }
    return result;
  }

  /* ---------- Factor flattening (for step-by-step derivations) ---------- */
  function flattenFactors(n, pow = R(1), out = { factors: [], numeric: [] }) {
    switch (n.type) {
      case 'mul': flattenFactors(n.a, pow, out); flattenFactors(n.b, pow, out); break;
      case 'div': flattenFactors(n.a, pow, out); flattenFactors(n.b, rneg(pow), out); break;
      case 'neg': out.negative = !out.negative; flattenFactors(n.a, pow, out); break;
      case 'num': out.numeric.push({ node: n, pow }); break;
      case 'pow': {
        const syms = [...symbolsIn(n.b)];
        const k = syms.every((s) => has(NUMERIC_SYMBOLS, s)) ? evaluate(n.b, NUMERIC_SYMBOLS) : null;
        const r = k && k.ok ? rFromNumber(k.value) : null;
        if (r) flattenFactors(n.a, rmul(pow, r), out);
        else out.factors.push({ node: n, pow });
        break;
      }
      case 'call':
        if (n.name === 'sqrt') flattenFactors(n.args[0], rmul(pow, R(1, 2)), out);
        else out.factors.push({ node: n, pow });
        break;
      case 'var':
        if (has(NUMERIC_SYMBOLS, n.name)) out.numeric.push({ node: n, pow });
        else out.factors.push({ node: n, pow });
        break;
      default: out.factors.push({ node: n, pow });
    }
    return out;
  }
  function additiveTerms(n, sign = 1, out = []) {
    if (n.type === 'add') { additiveTerms(n.a, sign, out); additiveTerms(n.b, sign, out); }
    else if (n.type === 'sub') { additiveTerms(n.a, sign, out); additiveTerms(n.b, -sign, out); }
    else out.push({ node: n, sign });
    return out;
  }

  /* ---------- Mehrdeutige Schreibweise „a / b c“ ---------- */
  // Formal gilt links nach rechts: a / b c = (a/b)·c. In der Physik meint „ħc / G M“ aber fast
  // immer ħc/(GM). Gemeldet wird jede implizite Multiplikation direkt hinter einer Division
  // ohne Klammern – außer bei reinen Zahlbrüchen wie „1/2 m v^2“, die eindeutig gemeint sind.
  // Liefert je Fundstelle: node (so gelesen), alt (die andere Lesart) und span (Nenner + Faktoren).
  function implicitAfterDivision(ast, out = []) {
    if (!ast) return out;
    if (ast.type === 'mul' && ast.implicit) {
      const extra = [ast.b];
      let n = ast.a;
      while (n.type === 'mul' && n.implicit && !n.paren) { extra.unshift(n.b); n = n.a; }
      if (n.type === 'div' && !n.paren && !(n.a.type === 'num' && n.b.type === 'num')) {
        const den = extra.reduce((acc, x) => ({ type: 'mul', a: acc, b: x, implicit: true }), n.b);
        out.push({ node: ast, alt: { type: 'div', a: n.a, b: den }, span: [n.b.span[0], extra[extra.length - 1].span[1]] });
        [n.a, n.b].concat(extra).forEach((x) => implicitAfterDivision(x, out));
        return out;
      }
    }
    ['a', 'b'].forEach((c) => ast[c] && implicitAfterDivision(ast[c], out));
    if (ast.args) ast.args.forEach((x) => implicitAfterDivision(x, out));
    return out;
  }

  /* ---------- AST → TeX ---------- */
  const DEFAULT_TEX = {
    hbar: '\\hbar', pi: '\\pi', k_B: 'k_{\\mathrm{B}}', Lambda: '\\Lambda', eps0: '\\varepsilon_0', mu0: '\\mu_0',
    beta: '\\beta', gamma: '\\gamma', omega: '\\omega', tau: '\\tau', psi: '\\psi', kappa: '\\kappa', lambda: '\\lambda',
    M_sun: 'M_\\odot', m_e: 'm_e', m_p: 'm_p', l_P: 'l_{\\mathrm{P}}', t_P: 't_{\\mathrm{P}}', m_P: 'm_{\\mathrm{P}}', T_P: 'T_{\\mathrm{P}}', E_P: 'E_{\\mathrm{P}}',
    G_mn: 'G_{\\mu\\nu}', g_mn: 'g_{\\mu\\nu}', T_mn: 'T_{\\mu\\nu}', d_t: '\\partial_t', lap: '\\nabla^2', dx: '\\mathrm{d}x', i: 'i',
    r_s: 'r_{\\mathrm{s}}', S_kB: 'S/k_{\\mathrm{B}}', g_n: 'g_n', eV: '\\mathrm{eV}', T_H: 'T_{\\mathrm{H}}', S_BH: 'S_{\\mathrm{BH}}',
  };
  function symTex(name, map) {
    if (has(map, name) && map[name]) return map[name];
    if (has(DEFAULT_TEX, name)) return DEFAULT_TEX[name];
    let m = /^([A-Za-z]+)_?(\d+)$/.exec(name);
    if (m) return (m[1].length > 1 ? '\\mathrm{' + m[1] + '}' : m[1]) + '_{' + m[2] + '}';
    m = /^([A-Za-z])_([A-Za-z0-9]+)$/.exec(name);
    if (m) return m[1] + '_{\\mathrm{' + m[2] + '}}';
    return name.length > 1 ? '\\mathrm{' + name + '}' : name;
  }
  function numTex(v) {
    if (Number.isInteger(v) && Math.abs(v) < 1e6) return String(v);
    const f = fmtParts(mk(v), 4);
    return f.exp === 0 ? f.mant : f.mant + '\\times 10^{' + f.exp + '}';
  }
  function toTex(n, map) {
    const T = (x) => toTex(x, map);
    const wrap = (x, s) => (x.type === 'add' || x.type === 'sub' || x.type === 'neg' ? '\\left(' + s + '\\right)' : s);
    switch (n.type) {
      case 'num': return numTex(n.v);
      case 'var': return symTex(n.name, map);
      case 'neg': return '-' + wrap(n.a, T(n.a));
      case 'add': return T(n.a) + ' + ' + T(n.b);
      case 'sub': return T(n.a) + ' - ' + (n.b.type === 'add' || n.b.type === 'sub' ? '\\left(' + T(n.b) + '\\right)' : T(n.b));
      case 'mul': {
        const l = wrap(n.a, T(n.a)), r = wrap(n.b, T(n.b));
        const sep = n.b.type === 'num' || (n.a.type === 'num' && n.b.type === 'num') ? ' \\cdot ' : '\\,';
        return l + sep + r;
      }
      case 'div': return '\\frac{' + T(n.a) + '}{' + T(n.b) + '}';
      case 'pow': {
        const b = n.a.type === 'var' || n.a.type === 'num' || n.a.type === 'call' ? T(n.a) : '\\left(' + T(n.a) + '\\right)';
        const bb = n.a.type === 'var' && /[_^]/.test(b) ? '{' + b + '}' : b;
        return bb + '^{' + T(n.b) + '}';
      }
      case 'call':
        if (n.name === 'sqrt') return '\\sqrt{' + T(n.args[0]) + '}';
        return '\\operatorname{' + n.name + '}\\left(' + n.args.map(T).join(', ') + '\\right)';
    }
    return '?';
  }

  /* ---------- Number formatting ---------- */
  function fmtParts(num, digits = 6) {
    // num: {s,l}; returns {sign, mant, exp}
    if (num.s === 0) return { sign: '', mant: '0', exp: 0 };
    let e = Math.floor(num.l);
    let m = Math.pow(10, num.l - e);
    let ms = m.toPrecision(digits);
    if (parseFloat(ms) >= 10) { e += 1; ms = (m / 10).toPrecision(digits); }
    return { sign: num.s < 0 ? '−' : '', mant: ms, exp: e };
  }
  function fmt(num, digits = 6, opts = {}) {
    if (typeof num === 'number') {
      if (Number.isNaN(num)) return '—';
      if (!isFinite(num)) return num > 0 ? '∞' : '−∞';
      num = mk(num);
    }
    if (!num || Number.isNaN(num.l)) return '—';
    if (num.s === 0) return '0';
    const p = fmtParts(num, digits);
    if (p.exp >= -3 && p.exp < (opts.maxFixed ?? 5)) {
      const v = num.s * Math.pow(10, num.l);
      let s = Number(v.toPrecision(digits)).toString();
      if (opts.keepZeros) s = v.toPrecision(digits);
      return s.replace('-', '−');
    }
    const mant = opts.trim === false ? p.mant : p.mant.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    return p.sign + mant + ' × 10' + sup(p.exp);
  }
  function fmtTex(num, digits = 6) {
    if (typeof num === 'number') num = Number.isFinite(num) ? mk(num) : null;
    if (!num || Number.isNaN(num.l)) return '\\text{—}';
    if (num.s === 0) return '0';
    const p = fmtParts(num, digits);
    const mant = p.mant.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    const sg = num.s < 0 ? '-' : '';
    if (p.exp >= -3 && p.exp < 5) return sg + Number((num.s * Math.pow(10, num.l)).toPrecision(digits));
    return sg + mant + '\\times 10^{' + p.exp + '}';
  }

  const NUMERIC_SYMBOLS = Object.assign(Object.create(null), { pi: Math.PI });

  PP.engine = {
    R, rStr, rval, rFromNumber, BASES, SI_BASE, BASE_NAMES,
    dimless, dimParse, dimMul, dimDiv, dimPow, dimEq, dimIsless, dimKey, dimStr, dimTex, dimInfo, siUnitStr, sup,
    parse, parseEquation, normalize, symbolsIn, evaluate, evalNode, mk, N, toDouble, FUNCS, has,
    dimAnalyze, checkEquation, flattenFactors, additiveTerms, implicitAfterDivision, toTex, symTex, fmt, fmtTex, fmtParts, NUMERIC_SYMBOLS,
  };
})(globalThis.PP = globalThis.PP || {});
