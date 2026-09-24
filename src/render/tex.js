/* =====================================================================
   Physics Playground — mini TeX → HTML renderer
   Covers the TeX subset produced by the engine and the experiment data
   (fractions, roots, scripts, delimiters, Greek, operators, \text …).
   Why not KaTeX: a hosted single-file page cannot load KaTeX's web fonts,
   and this subset is small enough to typeset with CSS alone.
   ===================================================================== */
(function (PP) {
  'use strict';
  const SYM = {
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ϵ', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ',
    kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', varphi: 'φ',
    chi: 'χ', psi: 'ψ', omega: 'ω',
    Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
    hbar: 'ħ', partial: '∂', nabla: '∇', infty: '∞', odot: '☉', oplus: '⊕', ell: 'ℓ', langle: '⟨', rangle: '⟩', circ: '∘',
  };
  const UPRIGHT_GREEK = new Set(['Gamma', 'Delta', 'Theta', 'Lambda', 'Pi', 'Sigma', 'Phi', 'Psi', 'Omega', 'infty', 'nabla', 'partial', 'odot', 'oplus', 'langle', 'rangle', 'circ']);
  const OPS = {
    times: '×', cdot: '·', propto: '∝', Rightarrow: '⇒', rightarrow: '→', to: '→', longleftrightarrow: '⟷',
    leftrightarrow: '↔', in: '∈', approx: '≈', sim: '∼', le: '≤', ge: '≥', leq: '≤', geq: '≥', neq: '≠', ne: '≠',
    ll: '≪', gg: '≫', pm: '±', equiv: '≡',
  };
  const SPACES = { ',': 0.17, ';': 0.28, ':': 0.22, quad: 1, qquad: 2, '!': -0.17, ' ': 0.25 };
  const FUNCNAMES = new Set(['sin', 'cos', 'tan', 'exp', 'ln', 'log', 'max', 'min', 'lim']);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function tokenize(src) {
    const t = [];
    let i = 0;
    while (i < src.length) {
      const ch = src[i];
      if (ch === '\\') {
        const m = /^\\([A-Za-z]+|.)/.exec(src.slice(i));
        t.push({ k: 'cmd', v: m[1] });
        i += m[0].length;
        if (/^[A-Za-z]/.test(m[1])) while (src[i] === ' ') i++;
      } else if (ch === ' ') { i++; }
      else { t.push({ k: 'ch', v: ch }); i++; }
    }
    return t;
  }

  function render(src, opts = {}) {
    const toks = tokenize(String(src));
    let p = 0;
    const peek = () => toks[p];
    function group(stop) {
      let out = '';
      let hasFrac = false;
      while (p < toks.length) {
        const t = peek();
        if (stop && t.k === 'ch' && t.v === stop) { p++; break; }
        if (stop === 'right' && t.k === 'cmd' && t.v === 'right') break;
        const a = atom();
        if (a === null) break;
        if (a.frac) hasFrac = true;
        out += scripts(a);
      }
      return { html: out, frac: hasFrac };
    }
    function arg(mode) {
      const t = toks[p++];
      if (!t) return { html: '', frac: false };
      if (t.k === 'ch' && t.v === '{') return mode === 'raw' ? { raw: rawUntilClose() } : group('}');
      if (mode === 'raw') return { raw: t.v };
      // Ohne Klammern ist ein Argument genau ein Zeichen, wie in TeX: \tfrac12 = ½, nicht „12“ über nichts
      if (t.k === 'ch' && /[0-9]/.test(t.v)) return { html: '<span class="mn">' + t.v + '</span>', frac: false };
      p--;
      const a = atom();
      return a ? { html: a.html, frac: a.frac } : { html: '' };
    }
    function rawUntilClose() {
      let depth = 1, s = '';
      while (p < toks.length) {
        const t = toks[p++];
        if (t.k === 'ch' && t.v === '{') depth++;
        if (t.k === 'ch' && t.v === '}' && --depth === 0) break;
        s += t.k === 'cmd' ? (t.v.length === 1 ? t.v : '\\' + t.v) : t.v;
      }
      return s;
    }
    function scripts(a) {
      let sup = null, sub = null;
      while (p < toks.length) {
        const t = peek();
        if (t.k === 'ch' && t.v === '^') { p++; sup = arg().html; }
        else if (t.k === 'ch' && t.v === '_') { p++; sub = arg().html; }
        else break;
      }
      if (sup === null && sub === null) return a.html;
      const base = '<span class="mb' + (a.big ? ' mbig' : '') + '">' + a.html + '</span>';
      if (sup !== null && sub !== null) return '<span class="msc">' + base + '<span class="mss"><span class="msup2">' + sup + '</span><span class="msub2">' + sub + '</span></span></span>';
      if (sup !== null) return '<span class="msc">' + base + '<sup class="msup">' + sup + '</sup></span>';
      return '<span class="msc">' + base + '<sub class="msub">' + sub + '</sub></span>';
    }
    function delim(ch, big) {
      const m = { '(': '(', ')': ')', '[': '[', ']': ']', '|': '|', '.': '', '\\{': '{', '\\}': '}', '{': '{', '}': '}' };
      const s = m[ch] !== undefined ? m[ch] : ch;
      return s ? '<span class="md' + (big ? ' mdbig' : '') + '">' + esc(s) + '</span>' : '';
    }
    function nextDelim() {
      const t = toks[p++];
      if (!t) return '.';
      return t.k === 'cmd' ? '\\' + t.v : t.v;
    }
    function atom() {
      const t = toks[p++];
      if (!t) return null;
      if (t.k === 'ch') {
        const c = t.v;
        if (c === '{') { const g = group('}'); return { html: '<span class="mg">' + g.html + '</span>', frac: g.frac }; }
        if (c === '}') return { html: '' };
        if (/[A-Za-z]/.test(c)) return { html: '<i class="mi">' + c + '</i>' };
        if (/[0-9.]/.test(c)) {
          let s = c;
          while (p < toks.length && toks[p].k === 'ch' && /[0-9.]/.test(toks[p].v)) s += toks[p++].v;
          return { html: '<span class="mn">' + s + '</span>' };
        }
        if (c === '-') return { html: '<span class="mo">−</span>' };
        if (c === '+' || c === '=' || c === '<' || c === '>') return { html: '<span class="mo">' + esc(c) + '</span>' };
        if (c === ',') return { html: '<span class="mp">,</span>' };
        if (c === '/') return { html: '<span class="msl">/</span>' };
        if (c === '(' || c === ')' || c === '[' || c === ']' || c === '|') return { html: '<span class="md">' + c + '</span>' };
        if (c === '~') return { html: '<span class="msp" style="margin-right:.25em"></span>' };
        return { html: '<span class="mu">' + esc(c) + '</span>' };
      }
      const c = t.v;
      if (c in SPACES) return { html: '<span class="msp" style="margin-right:' + SPACES[c] + 'em"></span>' };
      if (c === '{' || c === '}') return { html: '<span class="md">' + c + '</span>' };
      if (c === '\\') return { html: '<br>' };
      if (c === 'frac' || c === 'tfrac' || c === 'dfrac') {
        const a = arg(), b = arg();
        return { html: '<span class="mfr' + (c === 'tfrac' ? ' mt' : '') + '"><span class="mnu">' + a.html + '</span><span class="mde">' + b.html + '</span></span>', frac: true };
      }
      if (c === 'sqrt') {
        const a = arg();
        return { html: '<span class="msq' + (a.frac ? ' msqbig' : '') + '"><span class="mrad">√</span><span class="msqc">' + a.html + '</span></span>', frac: a.frac };
      }
      if (c === 'left') {
        const open = nextDelim();
        const g = group('right');
        if (peek() && peek().k === 'cmd' && peek().v === 'right') p++;
        const close = nextDelim();
        return { html: delim(open, g.frac) + g.html + delim(close, g.frac), frac: g.frac };
      }
      if (/^[Bb]igg?[lr]?$/.test(c)) return { html: delim(nextDelim(), true) };
      if (c === 'right') return { html: delim(nextDelim(), false) };
      if (c === 'text' || c === 'mbox') return { html: '<span class="mtx">' + esc(arg('raw').raw) + '</span>' };
      if (c === 'mathrm' || c === 'operatorname' || c === 'rm') {
        const r = arg('raw').raw;
        return { html: '<span class="mrm">' + render(r, { upright: true }) + '</span>' };
      }
      if (c === 'mathsf') return { html: '<span class="msf">' + esc(arg('raw').raw) + '</span>' };
      if (c === 'mathbf') return { html: '<b class="mbf">' + render(arg('raw').raw, { upright: true }) + '</b>' };
      if (c === 'mathbb') { const r = arg('raw').raw; return { html: '<span class="mu">' + ({ R: 'ℝ', C: 'ℂ', N: 'ℕ', Z: 'ℤ' }[r] || r) + '</span>' }; }
      // \xc{Farbe}{…}: Teilformel in einer benannten Farbe (Klasse xc-Farbe in styles.css), z. B. \xc{q}{\hbar}
      if (c === 'xc') { const k = String(arg('raw').raw).replace(/[^a-z]/g, ''); const a = arg(); return { html: '<span class="xc xc-' + k + '">' + a.html + '</span>', frac: a.frac }; }
      if (c === 'hat') { const a = arg(); return { html: '<span class="mhat">' + a.html + '</span>' }; }
      if (c === 'dot' || c === 'ddot') { const a = arg(); return { html: '<span class="m' + c + '">' + a.html + '</span>' }; }
      if (c === 'vec') { const a = arg(); return { html: '<span class="mvec">' + a.html + '</span>' }; }
      if (c === 'int') return { html: '<span class="mint">∫</span>', big: true };
      if (c === 'sum') return { html: '<span class="mint">∑</span>', big: true };
      if (FUNCNAMES.has(c)) return { html: '<span class="mrm mfn">' + c + '</span>' };
      if (c in OPS) return { html: '<span class="mo">' + OPS[c] + '</span>' };
      if (c in SYM) {
        const upright = UPRIGHT_GREEK.has(c) || opts.upright;
        return { html: upright ? '<span class="mu">' + SYM[c] + '</span>' : '<i class="mi">' + SYM[c] + '</i>' };
      }
      if (c === '|') return { html: '<span class="md">‖</span>' };
      if (c === '%') return { html: '%' };
      return { html: '<span class="mu">' + esc(c) + '</span>' };
    }
    let html = group(null).html;
    if (opts.upright) html = html.replace(/<i class="mi">/g, '<span class="mu">').replace(/<\/i>/g, '</span>');
    return html;
  }

  function tex(src, display) {
    return '<span class="math' + (display ? ' mathd' : '') + '">' + render(src) + '</span>';
  }

  PP.tex = { render, tex };
})(globalThis.PP = globalThis.PP || {});
