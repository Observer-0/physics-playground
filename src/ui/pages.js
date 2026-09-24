/* =====================================================================
   Physics Playground — overview pages: Hall of Fame, constants,
   saved states, tests, about
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine, M = PP.model, U = PP.ui, I = PP.i18n, T = I.T;
  const { $, esc } = U;

  function head(field, title, sub) {
    return '<header class="xhead">' + U.fieldBanner(field) + '<div><h1>' + esc(title) + '</h1>' + (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div></header>';
  }
  function eqStatus(exp) {
    let n = 0, ok = 0;
    for (const f of exp.forms) {
      const cx = U.dims.ctxOfForm(exp, f);
      for (const q of f.c.equations.concat(f.c.equations === f.c.autoEq ? [] : f.c.autoEq)) {
        n++;
        if (E.checkEquation(q, cx.symDims).consistent) ok++;
      }
    }
    return { n, ok };
  }

  /* ---------- Hall of Fame ---------- */
  function hall(el) {
    const exps = PP.hallOrder.map((id) => M.byId[id]);
    let h = '<div class="hallx">' + head('famous', 'The Physics Hall of Fame');
    h += '<p class="hall-intro">' + T('Berühmte Gleichungen, zerlegt mit derselben Engine wie jedes andere Experiment: Formel → Variablen → Einheiten → Dimensionen → Auswertung → Visualisierung → Erklärung. Keine Sonderfälle, keine hart codierten Ergebnisse.',
      'Famous equations, taken apart by the same engine as every other experiment: formula → variables → units → dimensions → evaluation → visualisation → explanation. No special cases, no hard-coded results.') + '</p>';
    h += '<div class="wall">' + exps.map((e) => {
      const f = e.forms[0];
      const prim = f.c.outputs.find((o) => o.primary) || f.c.outputs[0];
      return '<a href="#exp=' + e.id + '"><div class="f">' + U.tex(e.tex) + '</div><div><h3>' + esc(e.title) + '</h3><p>' + esc(e.subtitle || (e.meta && e.meta.domain) || '') + '</p>' +
        '<div class="dd">' + U.tex('[' + prim.tex + '] = ' + E.dimTex(prim.dimv)) + ' · ' + esc(e.meta ? e.meta.mathType : '') + '</div></div></a>';
    }).join('') + '</div>';
    h += '<h2 class="sec">' + T('Vergleich', 'Comparison') + '</h2>';
    h += '<p class="muted" style="margin-top:0;font-size:13.5px">' + T('Eine Einordnung, keine Rangliste. Keine dieser Gleichungen ist „wichtiger“ als die andere – sie beantworten unterschiedliche Fragen.', 'An overview, not a ranking. None of these equations is “more important” than the others – they answer different questions.') + '</p>';
    h += '<div class="panel scroll-x"><table class="t"><thead><tr><th>' + T('Gleichung', 'Equation') + '</th><th>' + T('Mathematischer Typ', 'Mathematical type') + '</th><th>' + T('Hauptdimensionen', 'Main dimensions') + '</th><th>' + T('Gebiet', 'Field') + '</th><th>Status</th><th>' + T('Dimensionscheck', 'Dimension check') + '</th></tr></thead><tbody>' +
      exps.map((e) => {
        const st = eqStatus(e);
        const status = e.meta.status || '—';
        return '<tr><td><a href="#exp=' + e.id + '">' + esc(e.title) + '</a></td><td>' + esc(e.meta.mathType) + '</td><td>' + esc(e.meta.mainDim) + '</td><td>' + esc(e.meta.domain) + '</td><td class="faint">' + status + '</td>' +
          '<td><span class="verdict ' + (st.ok === st.n ? 'ok' : 'bad') + '">' + st.ok + ' / ' + st.n + T(' konsistent', ' consistent') + '</span></td></tr>';
      }).join('') + '</tbody></table></div>';
    h += '<p class="faint" style="font-size:12.5px">' + T('„Status“ fasst die Einordnung aus dem jeweiligen Physik-Tab zusammen. Planck-Einheiten sind Kombinationen gemessener Konstanten; ihre Deutung als Skala der Quantengravitation ist eine Erwartung.', '“Status” summarises the classification from each Physics tab. Planck units are combinations of measured constants; reading them as the scale of quantum gravity is an expectation.') + '</p>';
    h += '<h2 class="sec">' + T('Selbst ausprobieren', 'Try it yourself') + '</h2><p class="muted" style="margin-top:0">' + T('Erfinde eine Gleichung – die Engine zeigt, ob und wo sie dimensional bricht. <a href="#view=custom">Zur Gleichungsprüfung</a>', 'Make up an equation – the engine shows whether and where it breaks dimensionally. <a href="#view=custom">Go to the equation checker</a>') + '</p>';
    h += '</div>';
    el.innerHTML = h;
  }

  /* ---------- constants ---------- */
  function constants(el) {
    let h = head('tools', T('Konstanten', 'Constants'), T('Zentrale Registry – jede Formel bezieht ihre Werte von hier', 'Central registry – every formula takes its values from here'));
    h += '<p class="muted" style="max-width:760px">' + T('Seit der SI-Reform 2019 sind c, h, e, k_B und N_A per Definition exakt. G ist dagegen eine der am ungenauesten gemessenen Naturkonstanten. Astronomische Werte sind Referenzwerte (≈); Λ hängt vom kosmologischen Modell ab.', 'Since the 2019 SI reform, c, h, e, k_B and N_A are exact by definition. G, by contrast, is one of the least precisely measured constants of nature. Astronomical values are reference values (≈); Λ depends on the cosmological model.') + '</p>';
    h += '<div class="panel scroll-x"><table class="t const"><thead><tr><th>Symbol</th><th>Name</th><th>' + T('Wert', 'Value') + '</th><th>' + T('Einheit', 'Unit') + '</th><th>Dimension</th><th>' + T('Art', 'Kind') + '</th><th>' + T('rel. Unsicherheit', 'rel. uncertainty') + '</th><th>' + T('Quelle', 'Source') + '</th></tr></thead><tbody>' +
      Object.keys(M.C).map((k) => {
        const c = M.C[k];
        const rel = c.u ? E.fmt(c.u / c.value, 2) : (c.kind === 'exact' || c.kind === 'math' || c.kind === 'convention' ? T('0 (exakt)', '0 (exact)') : '—');
        return '<tr><td>' + U.tex(c.tex) + '<div class="faint mono" style="font-size:11px">' + esc(k) + '</div></td><td>' + esc(c.name) + '</td><td class="mono" style="white-space:nowrap">' + esc(E.fmt(c.value, 12)) + '</td><td class="mono">' + esc(U.unit(c.dimv) || '1') + '</td><td>' + U.tex(E.dimTex(c.dimv)) + '</td>' +
          '<td><span class="tag ' + c.kind + '">' + esc(M.KIND_LABEL[c.kind]) + '</span></td><td class="mono">' + esc(rel) + '</td><td class="faint" style="font-size:12px">' + esc(c.src) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    h += '<p class="faint" style="font-size:12.5px">' + T('Tipp: In jedes Zahlenfeld kannst du auch Ausdrücke mit diesen Symbolen tippen, etwa <span class="kbd">10*M_sun</span> oder <span class="kbd">c/2</span>.', 'Tip: you can also type expressions with these symbols into any number field, such as <span class="kbd">10*M_sun</span> or <span class="kbd">c/2</span>.') + '</p>';
    el.innerHTML = h;
  }

  /* ---------- saved ---------- */
  function saved(el) {
    const list = U.saved.list();
    let h = head('tools', T('Gespeicherte Experimente', 'Saved experiments'), T('Lokal in diesem Browser', 'Stored locally in this browser'));
    h += list.length
      ? '<div class="panel scroll-x"><table class="t savedlist"><thead><tr><th>Name</th><th>Experiment</th><th>' + T('Gespeichert', 'Saved') + '</th><th></th></tr></thead><tbody>' +
        list.map((s) => '<tr><td>' + esc(s.name) + '</td><td class="muted">' + esc(s.exp) + '</td><td class="faint mono" style="font-size:12px">' + esc(new Date(s.date).toLocaleString(I.locale())) + '</td>' +
          '<td style="text-align:right;white-space:nowrap"><button class="btn sm" data-load="' + s.id + '">' + T('Öffnen', 'Open') + '</button> <button class="btn sm" data-code="' + s.id + '">' + T('Code kopieren', 'Copy code') + '</button> <button class="btn sm" data-del="' + s.id + '">' + T('Löschen', 'Delete') + '</button></td></tr>').join('') +
        '</tbody></table></div>'
      : '<p class="muted">' + T('Noch nichts gespeichert. In jedem Experiment gibt es oben „Speichern“.', 'Nothing saved yet. Every experiment has a “Save” button at the top.') + '</p>';
    h += '<h2 class="sec">' + T('Zustands-Code einfügen', 'Paste a state code') + '</h2><div class="eqin"><input id="imp" placeholder="' + T('exp=newton-gravity&amp;a=…  oder ein kompletter Link', 'exp=newton-gravity&amp;a=…  or a complete link') + '" spellcheck="false"><button class="btn" data-imp="1">' + T('Öffnen', 'Open') + '</button></div>';
    el.innerHTML = h;
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const find = (id) => U.saved.list().find((x) => x.id === id);
      if (b.dataset.load) { const s = find(b.dataset.load); if (s && U.applyState(s.state)) U.render(true); }
      else if (b.dataset.code) { const s = find(b.dataset.code); if (s) U.copy(s.state).then((ok) => U.toast(ok ? T('Code kopiert', 'Code copied') : T('Kopieren fehlgeschlagen', 'Copying failed'))); }
      else if (b.dataset.del) { U.saved.remove(b.dataset.del); U.render(false); }
      else if (b.dataset.imp) {
        const v = $('#imp').value.trim();
        if (v && U.applyState(v)) U.render(true);
        else U.toast(T('Code nicht erkannt', 'Code not recognised'));
      }
    });
  }

  /* ---------- tests ---------- */
  function tests(el) {
    el.innerHTML = head('tools', T('Tests der Formula Engine', 'Formula engine tests'), T('Laufen hier direkt im Browser', 'Running right here in the browser')) + '<div id="tout"><p class="muted">' + T('Läuft …', 'Running …') + '</p></div>';
    const run = () => {
      const t0 = performance.now();
      const res = PP.tests.runAll();
      const ms = performance.now() - t0;
      const fail = res.filter((r) => !r.pass);
      const groups = {};
      res.forEach((r) => { (groups[r.group] = groups[r.group] || []).push(r); });
      let h = '<p><b style="color:' + (fail.length ? 'var(--red)' : 'var(--green)') + '">' + (res.length - fail.length) + ' / ' + res.length + T(' bestanden', ' passed') + '</b> <span class="faint">in ' + ms.toFixed(0) + ' ms</span> <button class="btn sm" id="rerun">' + T('Erneut ausführen', 'Run again') + '</button></p>';
      if (I.lang === 'en') h += '<p class="faint" style="font-size:12.5px">The checks compare the engine’s messages in German, the language they were written in; a separate group checks the English texts.</p>';
      for (const g in groups) {
        h += '<h2 class="sec" style="margin-top:20px;font-size:14px">' + esc(g) + '</h2><ul class="tst">' + groups[g].map((r) => '<li><span class="' + (r.pass ? 'ok' : 'no') + '">' + (r.pass ? '✓' : '✗') + '</span> ' + esc(r.name) + (r.pass ? '' : '<br><span class="no">→ ' + esc(r.err) + '</span>') + '</li>').join('') + '</ul>';
      }
      $('#tout').innerHTML = h;
      $('#rerun').addEventListener('click', run);
    };
    setTimeout(run, 30);
  }

  /* ---------- about ---------- */
  function about(el) {
    const nEq = M.registry.reduce((a, e) => a + e.forms.reduce((b, f) => b + f.c.equations.length, 0), 0);
    let h = head('tools', T('Über den Physics Playground', 'About the Physics Playground'));
    h += '<div class="prose">';
    h += T('<p>Eine Experimentierumgebung nach dem Prinzip <b>„Was passiert, wenn ich das ändere?“</b> Regler bewegen, Zahlen und Graphen reagieren sofort, und die App sagt ehrlich, wann ein Ergebnis nur noch Mathematik ist.</p>',
      '<p>An environment for experimenting, built around one question: <b>“What happens if I change this?”</b> Move a slider, and numbers and graphs respond instantly – and the app tells you honestly when a result is only mathematics any more.</p>');
    h += '<h2 class="sec">' + T('Architektur', 'Architecture') + '</h2><p>' + T('Alle ' + M.registry.length + ' Experimente – auch die berühmten Gleichungen – sind reine Datenbeschreibungen. Eine gemeinsame Pipeline verarbeitet sie: <b>Formel → Syntaxbaum → Variablen → Einheiten → Dimensionen → Auswertung → Visualisierung → Erklärung</b>. Derzeit prüft die Engine ' + nEq + ' deklarierte Gleichungen plus jede berechnete Größe gegen ihre Dimension.',
      'All ' + M.registry.length + ' experiments – the famous equations included – are pure data descriptions. One shared pipeline processes them: <b>formula → syntax tree → variables → units → dimensions → evaluation → visualisation → explanation</b>. The engine currently checks ' + nEq + ' declared equations, plus every computed quantity, against their dimensions.') + '</p>';
    h += '<table class="t"><tbody>' + [
      ['core/i18n.js', T('Sprache: Umschalter Deutsch/Englisch, Texte als Paare direkt neben den Daten', 'Language: German/English switch, texts as pairs right next to the data')],
      ['core/engine.js', T('Parser (Unicode, implizite Multiplikation), Dimensionsanalyse mit rationalen Exponenten, numerisch stabile Auswertung in log₁₀-Darstellung, Fehlerlokalisierung', 'Parser (Unicode, implicit multiplication), dimensional analysis with rational exponents, numerically stable evaluation in log₁₀ form, error localisation')],
      ['core/model.js', T('Konstanten-Registry mit Quellen, Experiment-Modell, Plausibilitäts-Kategorien, Fehlerfortpflanzung aus gemessenen Konstanten', 'Constants registry with sources, experiment model, plausibility categories, error propagation from measured constants')],
      ['data/experiments.js', T('alle Experimente als Daten: Variablen, Formeln, Gleichungen, Checks, Presets, Erklärungen', 'all experiments as data: variables, formulas, equations, checks, presets, explanations')],
      ['data/tasks.js · sources.js', T('„Probier mal“-Aufgaben, die die App selbst prüft; Quellen mit geprüften DOIs', '“Try this” tasks the app checks itself; sources with verified DOIs')],
      ['tests/tests.js', T('Referenzwerte (CODATA u. a.), Numerik-Grenzfälle, Dimensionsprüfung, Parser', 'Reference values (CODATA and others), numerical edge cases, dimension checks, parser')],
      ['render/tex.js', T('kleiner eigener Formelsatz (Brüche, Wurzeln, Indizes) – ohne externe Abhängigkeit', 'a small typesetter of its own (fractions, roots, indices) – no external dependency')],
      ['render/plot.js · viz.js', T('Canvas-Graph mit log-Achsen jenseits von 10³⁰⁸, Zoom, Tooltips; Visualisierungen', 'Canvas graph with log axes beyond 10³⁰⁸, zoom, tooltips; visualisations')],
      ['ui/*.js', T('Oberfläche, Zustand, URL-State, Speichern', 'Interface, state, URL state, saving')],
    ].map(([a, b]) => '<tr><td class="mono" style="white-space:nowrap">' + a + '</td><td>' + b + '</td></tr>').join('') + '</tbody></table>';
    h += '<h2 class="sec">' + T('Die vier Warnkategorien', 'The four warning categories') + '</h2><ul class="issues">' + T(
      '<li class="math"><b>Mathematisch undefiniert</b>Division durch null, Wurzel aus negativen Zahlen, γ bei β ≥ 1.</li>' +
      '<li class="numeric"><b>Numerisch problematisch</b>Werte jenseits des Gleitkomma-Bereichs. Die Engine rechnet dann logarithmisch weiter und sagt das.</li>' +
      '<li class="unreal"><b>Physikalisch unrealistisch</b>Mathematisch in Ordnung, aber nicht unser Universum: veränderte Konstanten, negative Massen, v &gt; c.</li>' +
      '<li class="model"><b>Außerhalb des Modells</b>Die Formel liefert eine Zahl, aber das zugrunde liegende Modell gilt dort nicht mehr (Newton nahe r_s, Schrödinger bei relativistischen Energien).</li>',
      '<li class="math"><b>Mathematically undefined</b>Division by zero, square roots of negative numbers, γ at β ≥ 1.</li>' +
      '<li class="numeric"><b>Numerically problematic</b>Values beyond the floating-point range. The engine then carries on logarithmically and says so.</li>' +
      '<li class="unreal"><b>Physically unrealistic</b>Mathematically fine, but not our universe: changed constants, negative masses, v &gt; c.</li>' +
      '<li class="model"><b>Outside the model</b>The formula returns a number, but the underlying model no longer applies there (Newton near r_s, Schrödinger at relativistic energies).</li>') + '</ul>';
    h += '<h2 class="sec">' + T('Wissenschaftliche Ehrlichkeit', 'Scientific honesty') + '</h2><p>' + T('Jede Erklärung trennt mathematische Aussagen, physikalische Modelle, Näherungen, gemessene Größen und theoretische Annahmen. Angezeigte Stellen werden durch die Unsicherheit gemessener Konstanten begrenzt, damit keine falsche Präzision entsteht. Visualisierungen, die nicht maßstäblich sind, sagen das. Dimensionskonsistenz wird nie als Beweis physikalischer Korrektheit ausgegeben.',
      'Every explanation separates mathematical statements, physical models, approximations, measured quantities and theoretical assumptions. The digits shown are limited by the uncertainty of measured constants, so no false precision creeps in. Visualisations that are not to scale say so. Dimensional consistency is never presented as proof of physical correctness.') + '</p>';
    h += '<h2 class="sec">' + T('Abhängigkeiten &amp; Lizenzen', 'Dependencies &amp; licences') + '</h2><p>' + T('Keine JavaScript-Bibliotheken. Schriften: IBM Plex Sans/Mono und STIX Two Text (beide SIL Open Font License) über Google Fonts, mit System-Fallbacks. KaTeX wurde bewusst ersetzt, weil eine einzelne gehostete Datei dessen Webfonts nicht laden kann.',
      'No JavaScript libraries. Fonts: IBM Plex Sans/Mono and STIX Two Text (both SIL Open Font License) via Google Fonts, with system fallbacks. KaTeX was deliberately replaced because a single hosted file cannot load its web fonts.') + '</p>';
    h += '<h2 class="sec">' + T('Bedienung', 'How to use it') + '</h2><p>' + T('Zahlenfelder verstehen <span class="kbd">6.674e-11</span>, <span class="kbd">6,674×10^-11</span> und Ausdrücke wie <span class="kbd">2*M_sun</span>. Graph: Mausrad zoomt, Ziehen verschiebt, Doppelklick setzt zurück. Der Zustand steckt in der Adresse und lässt sich über „Teilen“ weitergeben. Der Knopf DE/EN oben in der Seitenleiste wechselt die Sprache. Unter jedem Bild stehen „Probier mal“-Aufgaben; der Tab „Quellen“ führt zu den Originalarbeiten.',
      'Number fields understand <span class="kbd">6.674e-11</span>, <span class="kbd">6.674×10^-11</span> and expressions such as <span class="kbd">2*M_sun</span>. Graph: the mouse wheel zooms, dragging pans, a double-click resets. The state lives in the address and can be passed on via “Share”. The DE/EN button at the top of the sidebar switches the language. Under each picture you will find “Try this” tasks; the “Sources” tab leads to the original papers.') + '</p>';
    h += '<h2 class="sec">' + T('Erweitern', 'Extending it') + '</h2><p>' + T('Ein neues Experiment ist ein weiterer <span class="mono">define({…})</span>-Block in <span class="mono">src/data/experiments.js</span>: Variablen mit Dimension und Bereich, Formeln als Text, optional Checks, Presets und Erklärungen – jeder Text als Paar <span class="mono">{ de, en }</span>. Visualisierung, Graph, Dimensionsanalyse, Vergleich und Tests funktionieren dann automatisch.',
      'A new experiment is one more <span class="mono">define({…})</span> block in <span class="mono">src/data/experiments.js</span>: variables with dimension and range, formulas as text, and optionally checks, presets and explanations – each text as a <span class="mono">{ de, en }</span> pair. Visualisation, graph, dimensional analysis, comparison and tests then work automatically.') + '</p>';
    h += '</div>';
    el.innerHTML = h;
  }

  Object.assign(U.views, I.localize({
    hall: { title: 'Famous Equations', render: hall },
    constants: { title: { de: 'Konstanten', en: 'Constants' }, render: constants },
    saved: { title: { de: 'Gespeichert', en: 'Saved' }, render: saved },
    tests: { title: 'Tests', render: tests },
    about: { title: { de: 'Über', en: 'About' }, render: about },
  }));
})(globalThis.PP = globalThis.PP || {});
