# Physics Playground

Interaktive Physik-Experimentierumgebung nach dem Prinzip **„Was passiert, wenn ich das ändere?“**
Regler bewegen → Zahlen, Graph und Visualisierung reagieren sofort. Die App sagt dabei ehrlich,
wann ein Ergebnis nur noch Mathematik ist.

## Starten

`dist/index.html` im Browser öffnen – fertig. Kein Server, kein Build nötig.

Entwicklung (Node ≥ 18):

```bash
node run-tests.js   # Tests (59; die 6 UI-Tests laufen vollständig nur im Browser unter „Tests“)
node build.js       # bündelt alles nach dist/index.html
```

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

```
Formel (Text) → AST → Variablen → Einheiten → Dimensionen → Auswertung → Visualisierung → Erklärung
```

| Datei | Aufgabe |
|---|---|
| `engine.js` | Lexer/Parser (Unicode, implizite Multiplikation), Dimensionen als rationale Exponentenvektoren über 7 SI-Basisgrößen, Auswertung in `{Vorzeichen, log₁₀}`-Darstellung (Werte jenseits 10^±308), Fehlerlokalisierung per Zeichenposition, TeX-Ausgabe, Formatierung |
| `model.js` | Konstanten-Registry mit Art (exakt / gemessen / Konvention / astronomisch / modellabhängig) und Quelle; Experiment-Modell; `compute()` wirft nie und liefert Warnkategorien; Fehlerfortpflanzung aus gemessenen Konstanten |
| `experiments.js` | Experiment-Definitionen: Variablen, Formeln, Gleichungen, Checks, Presets, Graph-Defaults, Erklärungen in drei Ebenen, epistemische Einordnung |
| `tests.js` | Referenzwerte (CODATA 2022 u. a.), Numerik-Grenzfälle, Dimensionsprüfung aller Formeln, Parser |
| `tex.js` | kleiner eigener Formelsatz (ersetzt KaTeX, dessen Webfonts in einer gehosteten Einzeldatei nicht laden) |
| `plot.js` | Canvas-Graph in transformierten Koordinaten |
| `viz.js` | Canvas-Visualisierungen |
| `app-core.js` | Zustand, Routing, URL-State, Speichern, Navigation, gemeinsame Animationsschleife der Theorie-Widgets (`U.widgetLoop`) |
| `app-lab.js` | Labor: Parameter, Ergebnisse, Status, Graph, Animation, Vergleich |
| `app-dims.js` | Erklär-Ebenen, Dimensionsanalyse, Nightmare Mode, eigene Gleichungen (mit Hinweisen auf mehrdeutige Symbole wie h, T, e und auf „a / b c“) |
| `app-pages.js` | Hall of Fame, Konstanten, Gespeichert, Tests, Über |
| `app-tensor.js` | Abschnitte „Indizes μν“ und „Tensor-Aufbau“ mit interaktiven Widgets; hängt sich in `app-theory.js` ein |
| `app-action.js` | Abschnitte „Einstein-Hilbert-Wirkung“ (Wirkungs-Demo mit exakter Formel ΔS = mπ²/(4τ)·(ε₁² + 4ε₂²)) und „Die Köpfe hinter der ART“ |
| `app-entropy.js` | Abschnitt „Entropie – ein Wort, viele Bedeutungen“ mit Ehrenfest-Modell |
| `app-theory.js` | Grundlagen-Seite (Theorie-Abschnitte als Daten, Direktlink per `#view=theorie&sec=dim` / `inertia` / `rel` / `idx` / `tensor` / `action` / `history` / `qm` / `entropy` / `gap`) |

### Neues Experiment hinzufügen

Ein weiterer `define({ … })`-Block in `experiments.js`:

```js
define({
  id: 'mein-exp', group: 'Mechanik', title: 'Titel', short: 'Kurz', tex: 'E = m c^2',
  vars:    { m: { label: 'm', tex: 'm', name: 'Masse', dim: 'M', default: 1, min: 1e-3, max: 1e3, scale: 'log', positive: true } },
  outputs: [{ key: 'E', sym: 'E', tex: 'E', name: 'Energie', expr: 'm*c^2', dim: 'M L^2 T^-2', primary: true }],
  equations: [{ label: 'Ruheenergie', eq: 'E = m*c^2' }],
  presets: [], graph: { x: 'm', y: 'E' }, viz: null,
  explain: { intuition: '…', math: [], physics: '…', epistemics: [] },
});
```

Dimensionsanalyse, Graph, Vergleich, URL-State und die automatische Dimensionsprüfung in den Tests
funktionieren dann ohne weiteren Code. Für eine eigene Visualisierung eine Funktion
`PP.viz.name = (ctx, W, H, S) => { … }` ergänzen.

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
- Nicht maßstäbliche Visualisierungen sind gekennzeichnet
- Dimensionskonsistenz wird nie als Beweis physikalischer Korrektheit dargestellt

## Abhängigkeiten & Lizenzen

Keine JavaScript-Bibliotheken. Schriften über Google Fonts (IBM Plex Sans/Mono, STIX Two Text –
SIL Open Font License), mit System-Fallbacks. Die Tests der UI-Schicht liefen zusätzlich
automatisiert mit jsdom + node-canvas (nur Entwicklung, nicht im Bundle).

## Robustheit

- Namen werden nur als eigene Einträge nachgeschlagen: `constructor`, `toString` usw. sind in Formeln unbekannte Symbole, `__proto__` wird abgelehnt, unbekannte `#exp=`/`#view=` in der URL werden ignoriert
- Theorie-Widgets zeichnen nur bei Änderungen und nur, solange sie sichtbar sind; der Schalter „Animationen“ (Standard: aus bei `prefers-reduced-motion`) wirkt sofort auf alle Widgets

## Bekannte Grenzen

- Formelsatz deckt das in der App verwendete TeX-Subset ab, kein vollständiges LaTeX
- Tensorgleichungen werden komponentenweise dimensional geprüft, nicht strukturell
- Gespeicherte Zustände liegen nur im lokalen Browser; zum Weitergeben den Zustands-Code nutzen
