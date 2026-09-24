# Physics Playground

Interaktive Physik-Experimentierumgebung nach dem Prinzip **„Was passiert, wenn ich das ändere?“**
Regler bewegen → Zahlen, Graph und Visualisierung reagieren sofort. Die App sagt dabei ehrlich,
wann ein Ergebnis nur noch Mathematik ist.

Die App ist zweisprachig: Der Knopf **DE / EN** oben in der Seitenleiste (auf dem Handy in der
Kopfzeile) schaltet alle Texte zwischen Deutsch und Englisch um. Die Wahl wird im Browser
gespeichert; ohne gespeicherte Wahl richtet sich die Sprache nach der Browsersprache. Ein Link
kann die Sprache mitgeben, z. B. `#exp=hawking&lang=en`.

## Starten

Online: **https://observer-0.github.io/physics-playground/**

Oder lokal `dist/index.html` im Browser öffnen – fertig. Kein Server, kein Build nötig.

Jeder Push auf `main` lässt über GitHub Actions die Tests laufen, baut die App neu und
veröffentlicht `dist/` auf GitHub Pages (`.github/workflows/pages.yml`).

Entwicklung (Node ≥ 18):

```bash
npm test        # Tests (70; die 6 UI-Tests laufen vollständig nur im Browser unter „Tests“)
npm run build   # bündelt alles nach dist/index.html
```

Beim Entwickeln `src/index.html` direkt im Browser öffnen: Sie lädt die Quelldateien einzeln,
Änderungen sind nach einem Neuladen sichtbar – ohne Build. Die Ladereihenfolge steht nur dort;
`npm run build` liest sie aus und bündelt die Seite zu `dist/index.html`. Vor dem Committen
bauen und `dist/index.html` mit committen – die gebündelte Datei ist die auslieferbare App.

## Inhalt

| Bereich | Experimente |
|---|---|
| Mechanik | Newtonsche Gravitation · Kinematik · Freier Fall · Federpendel · Kreisbewegung |
| Relativität | Lorentz-Faktor (Zeitdilatation, Längenkontraktion, Energie) |
| Famous Equations | Hawking-Temperatur · Bekenstein-Hawking-Entropie · Einsteinsche Feldgleichungen · Schrödinger-Gleichung · Planck-Einheiten |
| Grundlagen | Theorie kurz erklärt: Dimensionsanalyse · Inertialprinzip & Trägheit · Relativitätstheorie · Indizes μν (interaktive 4×4-Tabelle) · Tensor-Aufbau (Drehung/Boost-Demo) · Einstein-Hilbert-Wirkung (Demo zum Prinzip der kleinsten Wirkung) · Die Köpfe hinter der ART (Poincaré, Minkowski, Grossmann, Hilbert, Noether) · Quantenmechanik · Entropie (Clausius bis Wald, mit Mikrozustands-Demo) · Warum beide (noch) nicht zusammenpassen |
| Werkzeuge | Eigene/falsche Gleichungen prüfen · Konstanten · Gespeichert · Tests im Browser |

Funktionen: log/lin-Regler, freie Zahleneingabe (auch `3×10^8`, `2*M_sun`), Graph mit freier
Achsenwahl, lin/log, Zoom, Tooltips und mehreren Kurven, Vergleichsmodus A/B mit Verhältnis
und %-Änderung, Presets mit Quellen, Break-the-Physics-Modus, Nightmare Mode der
Dimensionsanalyse, Zustand in der URL, lokales Speichern, helles und dunkles Theme.

## Architektur

Alle Experimente – auch die berühmten Gleichungen – sind **reine Daten**. Eine gemeinsame
Pipeline verarbeitet sie:

```text
Formel (Text) → AST → Variablen → Einheiten → Dimensionen → Auswertung → Visualisierung → Erklärung
```

### Projektstruktur

```text
physics-playground/
├── src/
│   ├── core/          Rechenkern: Parser, Dimensionen, Konstanten, Modell
│   ├── data/          Experimente als reine Daten
│   ├── render/        Formelsatz, Graph, Visualisierungen (Canvas)
│   ├── ui/            Oberfläche: Zustand, Labor, Seiten, Grundlagen
│   │   └── sections/  einzelne Grundlagen-Abschnitte mit Widgets
│   ├── styles.css
│   └── index.html     Entwicklungsversion, lädt die Dateien einzeln
├── tests/             Testfälle (laufen in Node und im Browser) + Node-Runner
├── scripts/build.js   bündelt src/index.html zu einer einzigen HTML-Datei
└── dist/index.html    gebaute App (eingecheckt)
```

Alle Dateien erweitern den globalen Namensraum `PP`; die Ladereihenfolge steht in
`src/index.html`.

| Datei | Aufgabe |
|---|---|
| `src/core/i18n.js` | Sprache: `T('Deutsch', 'English')` für Texte im Code; `localize(obj)` macht aus jedem Paar `{ de, en }` in Daten ein Feld, das der aktiven Sprache folgt; Umschalten, Speichern, `with(lang, fn)` für Tests |
| `src/core/engine.js` | Lexer/Parser (Unicode, implizite Multiplikation), Dimensionen als rationale Exponentenvektoren über 7 SI-Basisgrößen, Auswertung in `{Vorzeichen, log₁₀}`-Darstellung (Werte jenseits 10^±308), Fehlerlokalisierung per Zeichenposition, TeX-Ausgabe, Formatierung |
| `src/core/model.js` | Konstanten-Registry mit Art (exakt / gemessen / Konvention / astronomisch / modellabhängig) und Quelle; Experiment-Modell; `compute()` wirft nie und liefert Warnkategorien; Fehlerfortpflanzung aus gemessenen Konstanten |
| `src/data/experiments.js` | Experiment-Definitionen: Variablen, Formeln, Gleichungen, Checks, Presets, Graph-Defaults, Erklärungen in drei Ebenen, epistemische Einordnung |
| `tests/tests.js` | Referenzwerte (CODATA 2022 u. a.), Numerik-Grenzfälle, Dimensionsprüfung aller Formeln, Parser, Visualisierungen (mit einem Zeichenkontext, der nur Texte aufzeichnet) |
| `src/render/tex.js` | kleiner eigener Formelsatz (ersetzt KaTeX, dessen Webfonts in einer gehosteten Einzeldatei nicht laden) |
| `src/render/plot.js` | Canvas-Graph in transformierten Koordinaten |
| `src/render/viz.js` | Canvas-Visualisierungen. `PP.vizState` liefert alle Zahlen aus der Engine: `o`/`lg`/`fo` für die Ergebnisse, `at(änderungen)` für dieselben Formeln mit anderen Eingaben (Spuren, Kurven, Skalen) oder für ein anderes Experiment, dazu die Warnkategorien und die Bezugswerte (Preset/Ausgangswert). Die Zeichenfunktionen rechnen keine Formel selbst nach |
| `src/ui/core.js` | Zustand, Routing, URL-State, Speichern, Navigation, gemeinsame Animationsschleife der Theorie-Widgets (`U.widgetLoop`) |
| `src/ui/lab.js` | Labor: Parameter, Ergebnisse, Status, Graph, Animation (Anhalten, Pendeln eines Werts), Warnhinweise im Kopf der Visualisierung, Vergleich |
| `src/ui/dims.js` | Erklär-Ebenen, Dimensionsanalyse, Nightmare Mode, eigene Gleichungen (mit Hinweisen auf mehrdeutige Symbole wie h, T, e und auf „a / b c“) |
| `src/ui/pages.js` | Hall of Fame, Konstanten, Gespeichert, Tests, Über |
| `src/ui/sections/tensor.js` | Abschnitte „Indizes μν“ und „Tensor-Aufbau“ mit interaktiven Widgets; hängt sich in `src/ui/theory.js` ein |
| `src/ui/sections/action.js` | Abschnitte „Einstein-Hilbert-Wirkung“ (Wirkungs-Demo mit exakter Formel ΔS = mπ²/(4τ)·(ε₁² + 4ε₂²)) und „Die Köpfe hinter der ART“ |
| `src/ui/sections/entropy.js` | Abschnitt „Entropie – ein Wort, viele Bedeutungen“ mit Ehrenfest-Modell |
| `src/ui/theory.js` | Grundlagen-Seite (Theorie-Abschnitte als Daten, Direktlink per `#view=theorie&sec=dim` / `inertia` / `rel` / `idx` / `tensor` / `action` / `history` / `qm` / `entropy` / `gap`) |

### Neues Experiment hinzufügen

Ein weiterer `define({ … })`-Block in `src/data/experiments.js`. Jeder Text steht als Paar
`{ de, en }` direkt neben den Daten; was in beiden Sprachen gleich ist, bleibt ein einfacher String:

```js
define({
  id: 'mein-exp', group: MECH, title: { de: 'Ruheenergie', en: 'Rest energy' }, short: { de: 'Ruheenergie', en: 'Rest energy' }, tex: 'E = m c^2',
  vars:    { m: { label: 'm', tex: 'm', name: { de: 'Masse', en: 'Mass' }, dim: 'M', default: 1, min: 1e-3, max: 1e3, scale: 'log', positive: true } },
  outputs: [{ key: 'E', sym: 'E', tex: 'E', name: { de: 'Energie', en: 'Energy' }, expr: 'm*c^2', dim: 'M L^2 T^-2', primary: true }],
  equations: [{ label: { de: 'Ruheenergie', en: 'Rest energy' }, eq: 'E = m*c^2' }],
  presets: [], graph: { x: 'm', y: 'E' }, viz: null,
  explain: { intuition: { de: '…', en: '…' }, math: [], physics: { de: '…', en: '…' }, epistemics: [] },
});
```

Meldungen in `checks()` schreibt man als `T('…', '…')`. Der Test „Keine deutschen Reste in den
englischen Texten der Experimente und Konstanten“ meldet vergessene Übersetzungen.

Dimensionsanalyse, Graph, Vergleich, URL-State und die automatische Dimensionsprüfung in den Tests
funktionieren dann ohne weiteren Code. Für eine eigene Visualisierung eine Funktion
`PP.viz.name = (ctx, W, H, S) => { … }` in `src/render/viz.js` ergänzen. Zahlen kommen dabei immer aus
`S.o('key')` bzw. `S.at({ t: 2 }).o('key')` – nie aus einer nachgebauten Formel. Mit
`sweep: { key, span, period, label }` bekommt die Visualisierung einen Knopf, der einen Wert um seinen
Ausgangswert pendeln lässt (Faktor `span` nach oben und unten).

## Warnkategorien

- **Mathematisch undefiniert** – Division durch 0, Wurzel aus negativen Zahlen, γ bei β ≥ 1
- **Numerisch problematisch** – jenseits des Gleitkommabereichs; wird logarithmisch weitergerechnet und gemeldet
- **Physikalisch unrealistisch** – veränderte Konstanten, negative Massen, v > c
- **Außerhalb des Modells** – Formel liefert eine Zahl, das Modell gilt dort aber nicht (Newton nahe r_s …)

Dazu Hinweise und Modellannahmen.

## Wissenschaftliche Genauigkeit

- Konstanten: CODATA 2022, IAU 2012/2015, Planck 2018, jeweils mit Quelle in der App
- Stellenzahl wird durch die Unsicherheit gemessener Konstanten begrenzt (keine falsche Präzision)
- Erklärungen trennen Mathematik, Modell, Näherung, Messung und Annahme
- Nicht maßstäbliche Visualisierungen sind gekennzeichnet; Projektionen (Feldgleichungen) als „schematisch (Modell)“
- Visualisierungen zeigen nur Werte der Engine und übernehmen ihre Warnkategorien: Hinweis im Kopf der Visualisierung, bei „mathematisch undefiniert“ keine Animation und keine Zahl
- Dimensionskonsistenz wird nie als Beweis physikalischer Korrektheit dargestellt

## Abhängigkeiten & Lizenzen

Keine JavaScript-Bibliotheken. Schriften über Google Fonts (IBM Plex Sans/Mono, STIX Two Text –
SIL Open Font License), mit System-Fallbacks. Die Tests der UI-Schicht liefen zusätzlich
automatisiert mit jsdom + node-canvas (nur Entwicklung, nicht im Bundle).

## Robustheit

- Namen werden nur als eigene Einträge nachgeschlagen: `constructor`, `toString` usw. sind in Formeln unbekannte Symbole, `__proto__` wird abgelehnt, unbekannte `#exp=`/`#view=` in der URL werden ignoriert
- Theorie-Widgets zeichnen nur bei Änderungen und nur, solange sie sichtbar sind; der Schalter „Animationen“ (Standard: aus bei `prefers-reduced-motion`) wirkt sofort auf alle Widgets und ist mit dem Knopf „Anhalten“ an jeder Animation gekoppelt

## Bekannte Grenzen

- Formelsatz deckt das in der App verwendete TeX-Subset ab, kein vollständiges LaTeX
- Tensorgleichungen werden komponentenweise dimensional geprüft, nicht strukturell
- Gespeicherte Zustände liegen nur im lokalen Browser; zum Weitergeben den Zustands-Code nutzen
