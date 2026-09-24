/* =====================================================================
   Physics Playground — overview pages: Hall of Fame, constants,
   saved states, tests, about
   ===================================================================== */
(function (PP) {
  'use strict';
  const E = PP.engine, M = PP.model, U = PP.ui;
  const S = U.S;
  const { $, esc } = U;

  function head(crumb, title, sub) {
    return '<header class="xhead"><div><div class="crumb">' + esc(crumb) + '</div><h1>' + esc(title) + '</h1>' + (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div></header>';
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
    let h = '<div class="hallx">' + head('Famous Equations', 'The Physics Hall of Fame');
    h += '<p class="hall-intro">Berühmte Gleichungen, zerlegt mit derselben Engine wie jedes andere Experiment: Formel → Variablen → Einheiten → Dimensionen → Auswertung → Visualisierung → Erklärung. Keine Sonderfälle, keine hart codierten Ergebnisse.</p>';
    h += '<div class="wall">' + exps.map((e) => {
      const f = e.forms[0];
      const prim = f.c.outputs.find((o) => o.primary) || f.c.outputs[0];
      return '<a href="#exp=' + e.id + '"><div class="f">' + U.tex(e.tex) + '</div><div><h3>' + esc(e.title) + '</h3><p>' + esc(e.subtitle || (e.meta && e.meta.domain) || '') + '</p>' +
        '<div class="dd">' + U.tex('[' + prim.tex + '] = ' + E.dimTex(prim.dimv)) + ' · ' + esc(e.meta ? e.meta.mathType : '') + '</div></div></a>';
    }).join('') + '</div>';
    h += '<h2 class="sec">Vergleich</h2>';
    h += '<p class="muted" style="margin-top:0;font-size:13.5px">Eine Einordnung, keine Rangliste. Keine dieser Gleichungen ist „wichtiger“ als die andere – sie beantworten unterschiedliche Fragen.</p>';
    h += '<div class="panel scroll-x"><table class="t"><thead><tr><th>Gleichung</th><th>Mathematischer Typ</th><th>Hauptdimensionen</th><th>Gebiet</th><th>Status</th><th>Dimensionscheck</th></tr></thead><tbody>' +
      exps.map((e) => {
        const st = eqStatus(e);
        const status = e.meta.status || '—';
        return '<tr><td><a href="#exp=' + e.id + '">' + esc(e.title) + '</a></td><td>' + esc(e.meta.mathType) + '</td><td>' + esc(e.meta.mainDim) + '</td><td>' + esc(e.meta.domain) + '</td><td class="faint">' + status + '</td>' +
          '<td><span class="verdict ' + (st.ok === st.n ? 'ok' : 'bad') + '">' + st.ok + ' / ' + st.n + ' konsistent</span></td></tr>';
      }).join('') + '</tbody></table></div>';
    h += '<p class="faint" style="font-size:12.5px">„Status“ fasst die Einordnung aus dem jeweiligen Physik-Tab zusammen. Planck-Einheiten sind Kombinationen gemessener Konstanten; ihre Deutung als Skala der Quantengravitation ist eine Erwartung.</p>';
    h += '<h2 class="sec">Selbst ausprobieren</h2><p class="muted" style="margin-top:0">Erfinde eine Gleichung – die Engine zeigt, ob und wo sie dimensional bricht. <a href="#view=custom">Zur Gleichungsprüfung</a></p>';
    h += '</div>';
    el.innerHTML = h;
  }

  /* ---------- constants ---------- */
  function constants(el) {
    let h = head('Werkzeuge', 'Konstanten', 'Zentrale Registry – jede Formel bezieht ihre Werte von hier');
    h += '<p class="muted" style="max-width:760px">Seit der SI-Reform 2019 sind c, h, e, k_B und N_A per Definition exakt. G ist dagegen eine der am ungenauesten gemessenen Naturkonstanten. Astronomische Werte sind Referenzwerte (≈); Λ hängt vom kosmologischen Modell ab.</p>';
    h += '<div class="panel scroll-x"><table class="t const"><thead><tr><th>Symbol</th><th>Name</th><th>Wert</th><th>Einheit</th><th>Dimension</th><th>Art</th><th>rel. Unsicherheit</th><th>Quelle</th></tr></thead><tbody>' +
      Object.keys(M.C).map((k) => {
        const c = M.C[k];
        const rel = c.u ? E.fmt(c.u / c.value, 2) : (c.kind === 'exact' || c.kind === 'math' || c.kind === 'convention' ? '0 (exakt)' : '—');
        return '<tr><td>' + U.tex(c.tex) + '<div class="faint mono" style="font-size:11px">' + esc(k) + '</div></td><td>' + esc(c.name) + '</td><td class="mono" style="white-space:nowrap">' + esc(E.fmt(c.value, 12)) + '</td><td class="mono">' + esc(U.unit(c.dimv) || '1') + '</td><td>' + U.tex(E.dimTex(c.dimv)) + '</td>' +
          '<td><span class="tag ' + c.kind + '">' + esc(M.KIND_LABEL[c.kind]) + '</span></td><td class="mono">' + esc(rel) + '</td><td class="faint" style="font-size:12px">' + esc(c.src) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    h += '<p class="faint" style="font-size:12.5px">Tipp: In jedes Zahlenfeld kannst du auch Ausdrücke mit diesen Symbolen tippen, etwa <span class="kbd">10*M_sun</span> oder <span class="kbd">c/2</span>.</p>';
    el.innerHTML = h;
  }

  /* ---------- saved ---------- */
  function saved(el) {
    const list = U.saved.list();
    let h = head('Werkzeuge', 'Gespeicherte Experimente', 'Lokal in diesem Browser');
    h += list.length
      ? '<div class="panel scroll-x"><table class="t savedlist"><thead><tr><th>Name</th><th>Experiment</th><th>Gespeichert</th><th></th></tr></thead><tbody>' +
        list.map((s) => '<tr><td>' + esc(s.name) + '</td><td class="muted">' + esc(s.exp) + '</td><td class="faint mono" style="font-size:12px">' + esc(new Date(s.date).toLocaleString('de-DE')) + '</td>' +
          '<td style="text-align:right;white-space:nowrap"><button class="btn sm" data-load="' + s.id + '">Öffnen</button> <button class="btn sm" data-code="' + s.id + '">Code kopieren</button> <button class="btn sm" data-del="' + s.id + '">Löschen</button></td></tr>').join('') +
        '</tbody></table></div>'
      : '<p class="muted">Noch nichts gespeichert. In jedem Experiment gibt es oben „Speichern“.</p>';
    h += '<h2 class="sec">Zustands-Code einfügen</h2><div class="eqin"><input id="imp" placeholder="exp=newton-gravity&amp;a=…  oder ein kompletter Link" spellcheck="false"><button class="btn" data-imp="1">Öffnen</button></div>';
    el.innerHTML = h;
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const find = (id) => U.saved.list().find((x) => x.id === id);
      if (b.dataset.load) { const s = find(b.dataset.load); if (s && U.applyState(s.state)) U.render(true); }
      else if (b.dataset.code) { const s = find(b.dataset.code); if (s) U.copy(s.state).then((ok) => U.toast(ok ? 'Code kopiert' : 'Kopieren fehlgeschlagen')); }
      else if (b.dataset.del) { U.saved.remove(b.dataset.del); U.render(false); }
      else if (b.dataset.imp) {
        const v = $('#imp').value.trim();
        if (v && U.applyState(v)) U.render(true);
        else U.toast('Code nicht erkannt');
      }
    });
  }

  /* ---------- tests ---------- */
  function tests(el) {
    el.innerHTML = head('Werkzeuge', 'Tests der Formula Engine', 'Laufen hier direkt im Browser') + '<div id="tout"><p class="muted">Läuft …</p></div>';
    const run = () => {
      const t0 = performance.now();
      const res = PP.tests.runAll();
      const ms = performance.now() - t0;
      const fail = res.filter((r) => !r.pass);
      const groups = {};
      res.forEach((r) => { (groups[r.group] = groups[r.group] || []).push(r); });
      let h = '<p><b style="color:' + (fail.length ? 'var(--red)' : 'var(--green)') + '">' + (res.length - fail.length) + ' / ' + res.length + ' bestanden</b> <span class="faint">in ' + ms.toFixed(0) + ' ms</span> <button class="btn sm" id="rerun">Erneut ausführen</button></p>';
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
    let h = head('Werkzeuge', 'Über den Physics Playground');
    h += '<div class="prose">';
    h += '<p>Eine Experimentierumgebung nach dem Prinzip <b>„Was passiert, wenn ich das ändere?“</b> Regler bewegen, Zahlen und Graphen reagieren sofort, und die App sagt ehrlich, wann ein Ergebnis nur noch Mathematik ist.</p>';
    h += '<h2 class="sec">Architektur</h2><p>Alle ' + M.registry.length + ' Experimente – auch die berühmten Gleichungen – sind reine Datenbeschreibungen. Eine gemeinsame Pipeline verarbeitet sie: <b>Formel → Syntaxbaum → Variablen → Einheiten → Dimensionen → Auswertung → Visualisierung → Erklärung</b>. Derzeit prüft die Engine ' + nEq + ' deklarierte Gleichungen plus jede berechnete Größe gegen ihre Dimension.</p>';
    h += '<table class="t"><tbody>' + [
      ['engine.js', 'Parser (Unicode, implizite Multiplikation), Dimensionsanalyse mit rationalen Exponenten, numerisch stabile Auswertung in log₁₀-Darstellung, Fehlerlokalisierung'],
      ['model.js', 'Konstanten-Registry mit Quellen, Experiment-Modell, Plausibilitäts-Kategorien, Fehlerfortpflanzung aus gemessenen Konstanten'],
      ['experiments.js', 'alle Experimente als Daten: Variablen, Formeln, Gleichungen, Checks, Presets, Erklärungen'],
      ['tests.js', 'Referenzwerte (CODATA u. a.), Numerik-Grenzfälle, Dimensionsprüfung, Parser'],
      ['tex.js', 'kleiner eigener Formelsatz (Brüche, Wurzeln, Indizes) – ohne externe Abhängigkeit'],
      ['plot.js · viz.js', 'Canvas-Graph mit log-Achsen jenseits von 10³⁰⁸, Zoom, Tooltips; Visualisierungen'],
      ['app-*.js', 'Oberfläche, Zustand, URL-State, Speichern'],
    ].map(([a, b]) => '<tr><td class="mono" style="white-space:nowrap">' + a + '</td><td>' + b + '</td></tr>').join('') + '</tbody></table>';
    h += '<h2 class="sec">Die vier Warnkategorien</h2><ul class="issues">' +
      '<li class="math"><b>Mathematisch undefiniert</b>Division durch null, Wurzel aus negativen Zahlen, γ bei β ≥ 1.</li>' +
      '<li class="numeric"><b>Numerisch problematisch</b>Werte jenseits des Gleitkomma-Bereichs. Die Engine rechnet dann logarithmisch weiter und sagt das.</li>' +
      '<li class="unreal"><b>Physikalisch unrealistisch</b>Mathematisch in Ordnung, aber nicht unser Universum: veränderte Konstanten, negative Massen, v &gt; c.</li>' +
      '<li class="model"><b>Außerhalb des Modells</b>Die Formel liefert eine Zahl, aber das zugrunde liegende Modell gilt dort nicht mehr (Newton nahe r_s, Schrödinger bei relativistischen Energien).</li></ul>';
    h += '<h2 class="sec">Wissenschaftliche Ehrlichkeit</h2><p>Jede Erklärung trennt mathematische Aussagen, physikalische Modelle, Näherungen, gemessene Größen und theoretische Annahmen. Angezeigte Stellen werden durch die Unsicherheit gemessener Konstanten begrenzt, damit keine falsche Präzision entsteht. Visualisierungen, die nicht maßstäblich sind, sagen das. Dimensionskonsistenz wird nie als Beweis physikalischer Korrektheit ausgegeben.</p>';
    h += '<h2 class="sec">Abhängigkeiten &amp; Lizenzen</h2><p>Keine JavaScript-Bibliotheken. Schriften: IBM Plex Sans/Mono und STIX Two Text (beide SIL Open Font License) über Google Fonts, mit System-Fallbacks. KaTeX wurde bewusst ersetzt, weil eine einzelne gehostete Datei dessen Webfonts nicht laden kann.</p>';
    h += '<h2 class="sec">Bedienung</h2><p>Zahlenfelder verstehen <span class="kbd">6.674e-11</span>, <span class="kbd">6,674×10^-11</span> und Ausdrücke wie <span class="kbd">2*M_sun</span>. Graph: Mausrad zoomt, Ziehen verschiebt, Doppelklick setzt zurück. Der Zustand steckt in der Adresse und lässt sich über „Teilen“ weitergeben.</p>';
    h += '<h2 class="sec">Erweitern</h2><p>Ein neues Experiment ist ein weiterer <span class="mono">define({…})</span>-Block in <span class="mono">experiments.js</span>: Variablen mit Dimension und Bereich, Formeln als Text, optional Checks, Presets und Erklärungen. Visualisierung, Graph, Dimensionsanalyse, Vergleich und Tests funktionieren dann automatisch.</p>';
    h += '</div>';
    el.innerHTML = h;
  }

  Object.assign(U.views, {
    hall: { title: 'Famous Equations', render: hall },
    constants: { title: 'Konstanten', render: constants },
    saved: { title: 'Gespeichert', render: saved },
    tests: { title: 'Tests', render: tests },
    about: { title: 'Über', render: about },
  });
})(globalThis.PP = globalThis.PP || {});
