/* =====================================================================
   Physics Playground — Sprache (Deutsch / Englisch)
   Zwei Werkzeuge, beide ohne DOM, damit sie auch in Node (Tests) laufen:
   · T('Deutsch', 'English') – wählt im Code direkt den passenden Text.
   · localize(obj) – ersetzt in Daten jedes Paar { de: …, en: … } durch einen
     Getter, der immer die aktive Sprache liefert. Code, der die Daten liest
     (exp.title, C.G.name …), muss davon nichts wissen.
   ===================================================================== */
(function (PP) {
  'use strict';
  const LANGS = ['de', 'en'];
  const listeners = [];

  function detect() {
    if (typeof document === 'undefined') return 'de'; // Node: Tests sind auf Deutsch formuliert
    try { const s = JSON.parse(localStorage.getItem('pp.lang')); if (LANGS.includes(s)) return s; } catch (_) { /* gesperrt */ }
    const nav = (typeof navigator !== 'undefined' && (navigator.language || '')) || '';
    return /^de\b/i.test(nav) ? 'de' : 'en';
  }

  const I = (PP.i18n = {
    LANGS,
    lang: detect(),
    T: (de, en) => (I.lang === 'en' ? en : de),
    locale: () => (I.lang === 'en' ? 'en-US' : 'de-DE'),
    // Dezimalzeichen für fertig formatierte Zahlen (toFixed …): 1.5 → „1,5“ auf Deutsch
    dec: (s) => (I.lang === 'en' ? String(s) : String(s).replace('.', ',')),
    set(lang, opts = {}) {
      if (!LANGS.includes(lang) || lang === I.lang) return false;
      I.lang = lang;
      if (!opts.silent) {
        try { localStorage.setItem('pp.lang', JSON.stringify(lang)); } catch (_) { /* gesperrt */ }
        listeners.forEach((f) => f(lang));
      }
      return true;
    },
    // Kurz in einer Sprache arbeiten (Tests), danach zurück – ohne Speichern und ohne Neuzeichnen
    with(lang, fn) {
      const prev = I.lang;
      I.lang = lang;
      try { return fn(); } finally { I.lang = prev; }
    },
    onChange: (f) => listeners.push(f),
    isPair,
    localize,
  });

  function isPair(v) {
    if (!v || typeof v !== 'object' || Array.isArray(v) || Object.getPrototypeOf(v) !== Object.prototype) return false;
    const k = Object.keys(v);
    return k.length === 2 && k.includes('de') && k.includes('en');
  }

  function localize(root, seen = new WeakSet()) {
    if (!root || typeof root !== 'object' || seen.has(root)) return root;
    seen.add(root);
    for (const k of Object.keys(root)) {
      const desc = Object.getOwnPropertyDescriptor(root, k);
      if (!desc || !('value' in desc)) continue; // schon ein Getter
      const v = desc.value;
      if (isPair(v)) {
        Object.defineProperty(root, k, {
          enumerable: true, configurable: true,
          get: () => (I.lang === 'en' ? v.en : v.de),
          // Wer das Feld überschreibt, bekommt wieder einen normalen Wert
          set(x) { Object.defineProperty(root, k, { value: x, writable: true, enumerable: true, configurable: true }); },
        });
      } else if (v && typeof v === 'object') localize(v, seen);
    }
    return root;
  }
})(globalThis.PP = globalThis.PP || {});
