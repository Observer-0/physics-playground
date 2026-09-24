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

Oder lokal `src/index.html` im Browser öffnen – kein Server, kein Build nötig. Die Seite lädt die
Quelldateien einzeln; Änderungen sind nach einem Neuladen sichtbar. Eine einzelne, in sich
geschlossene HTML-Datei erzeugt `npm run build` (`dist/index.html`). Sie wird nicht mehr
eingecheckt: Die Online-Version baut GitHub Actions bei jedem Push selbst.

Jeder Push auf `main` prüft den Code mit ESLint, lässt die Tests laufen, baut die App, testet sie
im Browser und veröffentlicht `dist/` auf GitHub Pages (`.github/workflows/pages.yml`).

Entwicklung (Node ≥ 18; `npm install` holt nur ESLint):

```bash
npm test          # 90 Tests in Node (die 7 UI-Tests laufen vollständig nur im Browser)
npm run lint      # ESLint
npm run build     # bündelt alles nach dist/index.html
npm run check:ui  # lädt jede Seite in beiden Sprachen in Headless-Chrome/-Edge und prüft sie,
                  # einschließlich der UI-Tests im Browser (Browser über CHROME_PATH wählbar)
npm run check     # alles zusammen, wie in der CI
```

Die Ladereihenfolge der Dateien steht nur in `src/index.html`; `npm run build` liest sie aus.

## Inhalt

| Bereich | Experimente |
|---|---|
| Mechanik | Newtonsche Gravitation · Kinematik · Freier Fall · Federpendel · Kreisbewegung · Fadenpendel (Kleinwinkelnäherung gegen exakte Lösung) · Schiefer Wurf |
| Relativität | Lorentz-Faktor (Zeitdilatation, Längenkontraktion, Energie) |
| Thermodynamik | Ideales Gas (pV = N k_B T) |
| Famous Equations | Hawking-Temperatur · Bekenstein-Hawking-Entropie · Einsteinsche Feldgleichungen · Schrödinger-Gleichung · Planck-Einheiten (Länge, Zeit, Masse, Temperatur, Energie; mit Boltzmann und k_B) |
| Grundlagen | Theorie kurz erklärt – Übersicht mit Karten, jeder Abschnitt als eigene Seite: Dimensionsanalyse · Inertialprinzip & Trägheit · Relativitätstheorie · Indizes μν (interaktive 4×4-Tabelle) · Tensor-Aufbau (Drehung/Boost-Demo) · Einstein-Hilbert-Wirkung (Demo zum Prinzip der kleinsten Wirkung) · Die Köpfe hinter der ART (Poincaré, Minkowski, Grossmann, Hilbert, Noether) · Quantenmechanik · Entropie (Clausius bis Wald, mit Mikrozustands-Demo) · Warum beide (noch) nicht zusammenpassen |
| Werkzeuge | Eigene/falsche Gleichungen prüfen · Konstanten · Gespeichert · Tests im Browser |

Funktionen: log/lin-Regler, freie Zahleneingabe (auch `3×10^8`, `2*M_sun`), Graph mit freier
Achsenwahl, lin/log, Zoom, Tooltips, mehreren Kurven und schraffierten Modellgrenzen (mit Grund, nur bei
den Größen, die eine Grenze betrifft; Standardbereich so, dass der gültige Bereich das Bild bestimmt),
Vergleichsmodus A/B mit Verhältnis und %-Änderung (Satz B blass im Bild), Presets mit Quellen,
„Probier mal“-Aufgaben mit automatischer Prüfung, Tab „Quellen“ mit Originalarbeiten und DOIs,
Break-the-Physics-Modus, Nightmare Mode der Dimensionsanalyse, Zustand in der URL (auch die
Einstellungen der Visualisierung), lokales Speichern, helles und dunkles Theme. Jedes Experiment
hat dieselben Tabs (Graph & Labor, Formel & Variablen, Dimensionsanalyse, Physik & Grenzen, Quellen)
und öffnet mit dem Labor; auf dem Handy bleibt das Bild beim Scrollen durch die Regler oben stehen.
Die Hawking-Temperatur zeigt über dem Labor, wie sich Quantenmechanik, Relativität, Gravitation und
Thermodynamik in ihr treffen – mit Grenzfällen, die sich im Break-Modus live ausprobieren lassen.

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
│   ├── data/          Experimente, Aufgaben und Quellen als reine Daten
│   ├── render/        Formelsatz, Graph, Visualisierungen (Canvas)
│   ├── ui/            Oberfläche: Zustand, Labor, Seiten, Grundlagen
│   │   └── sections/  einzelne Grundlagen-Abschnitte mit Widgets
│   ├── styles.css
│   └── index.html     Entwicklungsversion, lädt die Dateien einzeln
├── tests/             Testfälle (laufen in Node und im Browser) + Node-Runner
├── scripts/
│   ├── build.js       bündelt src/index.html zu einer einzigen HTML-Datei
│   └── check-ui.js    Browsertest aller Seiten (Headless-Chrome/-Edge, ohne Abhängigkeiten)
├── eslint.config.mjs
└── dist/index.html    gebaute App (entsteht mit npm run build, nicht eingecheckt)
```

Alle Dateien erweitern den globalen Namensraum `PP`; die Ladereihenfolge steht in
`src/index.html`.

| Datei | Aufgabe |
|---|---|
| `src/core/i18n.js` | Sprache: `T('Deutsch', 'English')` für Texte im Code; `localize(obj)` macht aus jedem Paar `{ de, en }` in Daten ein Feld, das der aktiven Sprache folgt; Umschalten, Speichern, `with(lang, fn)` für Tests |
| `src/core/engine.js` | Lexer/Parser (Unicode, implizite Multiplikation), Dimensionen als rationale Exponentenvektoren über 7 SI-Basisgrößen, Auswertung in `{Vorzeichen, log₁₀}`-Darstellung (Werte jenseits 10^±308), Fehlerlokalisierung per Zeichenposition, TeX-Ausgabe, Formatierung; Funktionen sqrt, abs, exp, ln, log10, sin, cos, tan und das vollständige elliptische Integral `ellipk` (über das arithmetisch-geometrische Mittel, für das Fadenpendel) |
| `src/core/model.js` | Konstanten-Registry mit Art (exakt / gemessen / Konvention / astronomisch / modellabhängig) und Quelle; Experiment-Modell; `compute()` wirft nie und liefert Warnkategorien; Fehlerfortpflanzung aus gemessenen Konstanten |
| `src/data/experiments.js` | Experiment-Definitionen: Variablen, Formeln, Gleichungen, Checks, Presets, Graph-Defaults, Erklärungen in drei Ebenen, epistemische Einordnung |
| `src/data/tasks.js` | „Probier mal“-Aufgaben je Experiment: `done(x)` prüft den Zustand mit Engine-Werten; `demo` ist eine Beispiellösung, mit der die Tests die Lösbarkeit prüfen |
| `src/data/sources.js` | Quellen je Experiment (Originalarbeiten, Messungen, Referenzwerte); jede DOI über Crossref geprüft, Originaltitel mit `lang`-Attribut |
| `tests/tests.js` | Referenzwerte (CODATA 2022 u. a.), Numerik-Grenzfälle, Dimensionsprüfung aller Formeln, Parser, Visualisierungen (mit einem Zeichenkontext, der nur Texte aufzeichnet) |
| `src/render/tex.js` | kleiner eigener Formelsatz (ersetzt KaTeX, dessen Webfonts in einer gehosteten Einzeldatei nicht laden) |
| `src/render/plot.js` | Canvas-Graph in transformierten Koordinaten |
| `src/render/viz.js` | Canvas-Visualisierungen. `PP.vizState` liefert alle Zahlen aus der Engine: `o`/`lg`/`fo` für die Ergebnisse, `at(änderungen)` für dieselben Formeln mit anderen Eingaben (Spuren, Kurven, Skalen) oder für ein anderes Experiment, dazu die Warnkategorien und die Bezugswerte (Preset/Ausgangswert). Die Zeichenfunktionen rechnen keine Formel selbst nach |
| `src/ui/core.js` | Zustand, Routing, URL-State, Speichern, Navigation, gemeinsame Animationsschleife der Theorie-Widgets (`U.widgetLoop`) |
| `src/ui/lab.js` | Labor: Parameter, Ergebnisse, Status, Graph mit schraffierten Modellgrenzen (Grund `why`, betroffene Größen über `on` und `PP.model.affects`, Standardbereich `graph.view`), Animation (Anhalten, Pendeln eines Werts), Warnhinweise im Kopf der Visualisierung, Vergleich (Satz B blass im Bild), „Probier mal“, Tab „Quellen“, Textbeschreibung des Bildes für Screenreader |
| `src/ui/crossroads.js` | Schnittpunkt-Block der Hawking-Temperatur (`exp.crossroads`): Formel mit anklickbaren Symbolen und Karten je Theorie, Grenzfälle live im Break-Modus, Kette κ → T, „Aha“-Kasten, Epistemik-Zeile; Wörterbuch Schwarzes Loch ↔ Thermodynamik (`exp.dict`) auf der Hawking- und der Entropie-Seite. Zahlen kommen aus der Engine |
| `src/ui/dims.js` | Erklär-Ebenen, Dimensionsanalyse, Nightmare Mode, eigene Gleichungen (mit Hinweisen auf mehrdeutige Symbole wie h, T, e und auf „a / b c“) |
| `src/ui/pages.js` | Hall of Fame, Konstanten, Gespeichert, Tests, Über |
| `src/ui/sections/tensor.js` | Abschnitte „Indizes μν“ und „Tensor-Aufbau“ mit interaktiven Widgets; hängt sich in `src/ui/theory.js` ein |
| `src/ui/sections/action.js` | Abschnitte „Einstein-Hilbert-Wirkung“ (Wirkungs-Demo mit exakter Formel ΔS = mπ²/(4τ)·(ε₁² + 4ε₂²)) und „Die Köpfe hinter der ART“ |
| `src/ui/sections/entropy.js` | Abschnitt „Entropie – ein Wort, viele Bedeutungen“ mit Ehrenfest-Modell |
| `src/ui/theory.js` | Grundlagen: Übersicht mit einer Karte je Abschnitt (`#view=theorie`), jeder Abschnitt als eigene Seite (`#view=theorie&sec=dim` / `inertia` / `rel` / `idx` / `tensor` / `action` / `history` / `qm` / `entropy` / `gap`) mit Text in Lesebreite, breiten Widgets, aufklappbaren Vertiefungen (`<h3 class="th-h3 th-deep">`), sticky Inhaltsverzeichnis und „Weiter zu“; Unterpunkte in der Seitenleiste; Vergleichsleiste „Charakter der Theorie“ |

### Neues Experiment hinzufügen

Ein weiterer `define({ … })`-Block in `src/data/experiments.js`. Jeder Text steht als Paar
`{ de, en }` direkt neben den Daten; was in beiden Sprachen gleich ist, bleibt ein einfacher String:

```js
define({
  id: 'mein-exp', group: MECH, field: 'mech', title: { de: 'Ruheenergie', en: 'Rest energy' }, short: { de: 'Ruheenergie', en: 'Rest energy' }, tex: 'E = m c^2',
  vars:    { m: { label: 'm', tex: 'm', name: { de: 'Masse', en: 'Mass' }, dim: 'M', default: 1, min: 1e-3, max: 1e3, scale: 'log', positive: true } },
  outputs: [{ key: 'E', sym: 'E', tex: 'E', name: { de: 'Energie', en: 'Energy' }, expr: 'm*c^2', dim: 'M L^2 T^-2', primary: true }],
  equations: [{ label: { de: 'Ruheenergie', en: 'Rest energy' }, eq: 'E = m*c^2' }],
  presets: [], graph: { x: 'm', y: 'E' }, viz: null,
  explain: { intuition: { de: '…', en: '…' }, math: [], physics: { de: '…', en: '…' }, epistemics: [] },
});
```

`field` ordnet das Experiment einem Themenfeld zu (`mech`, `rel`, `thermo`, `famous`). Name, Icon und
Farbe des Felds stehen in `src/ui/core.js` (`U.FIELDS`) bzw. `src/styles.css` (`[data-field]`); ohne
bekanntes `field` bekommt das Experiment eine neutrale Gruppe mit seinem `group`-Namen.

Aufgaben kommen nach `src/data/tasks.js`, Quellen nach `src/data/sources.js`.

Meldungen in `checks()` schreibt man als `T('…', '…')`. Der Test „Keine deutschen Reste in den
englischen Texten der Experimente und Konstanten“ meldet vergessene Übersetzungen.

Dimensionsanalyse, Graph, Vergleich, URL-State und die automatische Dimensionsprüfung in den Tests
funktionieren dann ohne weiteren Code. Für eine eigene Visualisierung eine Funktion
`PP.viz.name = (ctx, W, H, S) => { … }` in `src/render/viz.js` ergänzen. Zahlen kommen dabei immer aus
`S.o('key')` bzw. `S.at({ t: 2 }).o('key')` – nie aus einer nachgebauten Formel. `vizControls` sind Schalter oder, mit `options`, eine Auswahl im Kopf der Visualisierung (Wert in
`S.opts`). Mit
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
- Visualisierungen zeigen nur Werte der Engine und übernehmen ihre Warnkategorien: Hinweis im Kopf der Visualisierung, bei „mathematisch undefiniert“ keine Animation und keine Zahl; Graphen schraffieren Bereiche außerhalb des Modells
- Originalarbeiten und Messungen je Experiment im Tab „Quellen“, mit geprüften DOIs
- Dimensionskonsistenz wird nie als Beweis physikalischer Korrektheit dargestellt

## Abhängigkeiten & Lizenzen

Keine JavaScript-Bibliotheken in der App. Schriften über Google Fonts (IBM Plex Sans/Mono, STIX
Two Text – SIL Open Font License), mit System-Fallbacks. Zum Entwickeln wird nur ESLint installiert;
der Browsertest nutzt einen vorhandenen Chrome oder Edge.

## Robustheit

- Namen werden nur als eigene Einträge nachgeschlagen: `constructor`, `toString` usw. sind in Formeln unbekannte Symbole, `__proto__` wird abgelehnt, unbekannte `#exp=`/`#view=` in der URL werden ignoriert
- Theorie-Widgets zeichnen nur bei Änderungen und nur, solange sie sichtbar sind; der Schalter „Animationen“ (Standard: aus bei `prefers-reduced-motion`) wirkt sofort auf alle Widgets und ist mit dem Knopf „Anhalten“ an jeder Animation gekoppelt

## Bekannte Grenzen

- Formelsatz deckt das in der App verwendete TeX-Subset ab, kein vollständiges LaTeX
- Tensorgleichungen werden komponentenweise dimensional geprüft, nicht strukturell
- Gespeicherte Zustände und gelöste Aufgaben liegen nur im lokalen Browser; zum Weitergeben den Zustands-Code nutzen
- Fadenpendel: Die Periodendauern sind exakt, die Bewegung wird aber als Kosinus gezeichnet – bei großen Amplituden ist die echte Schwingung flacher

## Weiterentwicklung

Geplant ist ein Bereich „Offene Fragen“ (Warum 1/4, Λ, Informationsparadoxon, Messproblem, Anforderungen an eine Quantengravitation). Plan, Leitlinien und die Regel „theoriefrei jenseits von ART und Quantentheorie“ stehen in [ROADMAP.md](ROADMAP.md).
