# Änderungen

## 2026-09-24

**Themenfelder, Hawking-Temperatur, Diagramme, Grundlagen**

- **Themenfelder sofort erkennbar:** Mechanik, Relativität, Thermodynamik, Famous Equations, Grundlagen und Werkzeuge haben ein Icon und eine eigene Farbe. Die Gruppenköpfe in der Seitenleiste sind groß, fett und in Versalien; jede Seite beginnt mit einem Banner des Themenfelds. Die Feldfarben sind keine Datenfarben (Orange bleibt das Hauptergebnis); Famous Equations behält Violett, ihre bisherige Kennfarbe. Icon und Name stehen immer dabei.
- **Hawking-Temperatur als Schnittpunkt:** Über dem Labor zeigt ein Block die Formel mit farbigen Symbolen. Ein Klick auf ħ, c, G, k_B, M oder 8π öffnet eine Karte mit Theorie, Beitrag und Grenzfall (ħ → 0: T_H → 0, das Loch ist klassisch schwarz; c → ∞ und G → 0: kein Horizont). Knöpfe zeigen den Grenzfall live im Break-Modus; G → 0 und c → ∞ meldet die Engine als „Außerhalb des Modells“. Dazu die Kette κ = c⁴/(4GM) → T = ħκ/(2πck_B) mit 8π = 4 · 2π, der „Aha“-Kasten T_H = T_P · m_P/(8πM), ein Wörterbuch κ ↔ T, A ↔ S, M ↔ E (auch auf der Seite der BH-Entropie, gegenseitig verlinkt) und eine Epistemik-Zeile: semiklassisch, nicht beobachtet, Elektromagnetismus fehlt. Formuliert als Schnittpunkt, nicht als Vereinigung. Alle Zahlen kommen aus der Engine (neue Ausgaben κ und E sowie Hilfsgrößen, die nicht in der Ergebnisliste stehen).
- **Diagramme:** Der Standardbereich lässt den gültigen Bereich dominieren (freier Fall bis kurz nach dem Aufprall, ideales Gas 1 … 12 000 K). Jede Schraffur nennt ihren Grund in Legende und Tooltip („nach dem Aufprall“, „nahe der Planck-Masse“ …) und gilt nur für die Größen, die von der verletzten Größe abhängen: Beim schiefen Wurf schraffiert „nach der Landung“ nicht mehr R und H über α, beim Pendel wird nur T₀ jenseits von ≈ 23° gestrichelt.
- **Formelsatz:** ½ in h(t) = h₀ − ½ g t² erschien als „12“ über leerem Nenner; `\tfrac12` ist jetzt ein Bruch. Auch 45° und θ̈ werden gesetzt.
- **Grundlagen:** Übersicht mit einer Karte je Abschnitt, jeder Abschnitt als eigene Seite (Direktlinks #view=theorie&sec=… bleiben gültig) und als Unterpunkt in der Seitenleiste. Text in Lesebreite, Widgets breit, Vertiefungen aufklappbar, sticky Inhaltsverzeichnis, „Weiter zu“ am Ende. Tensor- und Ehrenfest-Demo stehen direkt nach dem ersten Absatz. Die Tags „Charakter der Theorie“ sind eine Vergleichsleiste in den Abschnitten 3, 8 und 10.
- **Formulierung:** Semiklassische Gravitation führt bei makroskopischen Überlagerungen zu Widersprüchen in Gedankenexperimenten – experimentell entschieden ist das nicht (vorher: „experimentell ausgeschlossen“).
- **Lesbarkeit und Tabs:** Schrift im Bild mindestens 11,5 px, Fußnoten und Hinweise größer. Alle Experimente haben dieselben Tabs direkt unter dem Kopf und öffnen mit „Graph & Labor“.

**Tests:** 80 → 90 (drei Wege zu T_H, Grenzfälle im Break-Modus, Verweise des Schnittpunkt-Blocks, Bild bei G = 0 und ħ = 0, Schraffur je Größe, Gründe für jede Modellgrenze, Standardbereiche, Formelsatz, Grundlagen-Direktlinks). `npm run check:ui` prüft jetzt 184 Seiten, darunter jeden Grundlagen-Abschnitt und den Labor-Tab jedes Experiments.


**Bedienung**

- Unter 1180 px Fensterbreite stehen die Regler direkt unter dem Bild, danach Ergebnis und Status, zuletzt der Graph. Vorher lagen sie unter dem Graphen. Auf dem Handy hochkant bleibt das Bild beim Scrollen durch die Regler oben stehen.
- Bei den berühmten Gleichungen öffnet zuerst „Graph & Labor“; die Formel darüber ist dort kompakt.
- Graphen schraffieren Bereiche, in denen die Engine „außerhalb des Modells“ oder „undefiniert“ meldet, z. B. beim freien Fall nach dem Aufschlag oder beim Pendel jenseits von ≈ 23°. Warnungen, die im ganzen Bereich gelten, werden nicht schraffiert. γ(β) startet mit logarithmischer y-Achse.
- Vergleich A/B: Der andere Satz erscheint blass im Bild, mit demselben Bezug wie Satz A.
- Die Einstellungen der Visualisierung (Planck-Größe, Überlagerung) stehen im geteilten Link.
- Screenreader: Das Bild bekommt eine Textbeschreibung mit seinen Beschriftungen und Werten.

**Neu**

- **„Probier mal“**: 34 kleine Aufgaben in allen Experimenten, die die App selbst prüft, z. B. „Finde die Masse, bei der T_H so warm ist wie die Hintergrundstrahlung“. Gelöste Aufgaben merkt sich der Browser.
- **Tab „Quellen“** in jedem Experiment: Originalarbeiten, Messungen und Referenzwerte, von Newton, Cavendish und Einstein bis GW150914 und CODATA 2022. Jede DOI wurde über Crossref geprüft; Originaltitel sind in ihrer Sprache gekennzeichnet.
- **Drei Experimente**: *Fadenpendel* (Kleinwinkelnäherung gegen exakte Lösung, zwei Pendel nebeneinander), *Schiefer Wurf* (Bahn aus der Engine, Geschwindigkeit in Komponenten, Komplementwinkel mit gleicher Weite) und *Ideales Gas* (pV = N k_B T mit Faktorzeile, Grenzen bei Kondensation, hohem Druck, Plasma und Quantenentartung).
- **Erweiterung der Engine**: die Funktion `ellipk`, das vollständige elliptische Integral 1. Art, berechnet über das arithmetisch-geometrische Mittel (NIST DLMF 19.8.5). Begründung: Die exakte Periodendauer des Fadenpendels lässt sich ohne K nicht ausdrücken, eine Reihe wäre wieder eine Näherung. Bestehende Funktionen und Parser-Regeln sind unverändert; `ellipk` verlangt ein dimensionsloses Argument und meldet k = 1 (Divergenz) und |k| > 1 als mathematisch undefiniert.
- Planck-Skala „Temperatur“: Das Quark-Gluon-Plasma steht jetzt beim veröffentlichten ALICE-Wert (304 MeV ≈ 3,5 × 10¹² K) statt beim vorläufigen Wert von 2012.

**Entwicklung**

- `npm run lint` (ESLint). Er hat einen echten Fehler in einem neuen Test gefunden: Statt der Wortgrenze `\b` stand ein Steuerzeichen im regulären Ausdruck, der Test erkannte deshalb nur Umlaute. Im validierten Rechenkern bleibt ein harmloses, überflüssiges try/catch bewusst stehen; die Regel ist nur dort abgeschaltet.
- `npm run check:ui`: lädt jede Seite in beiden Sprachen in Headless-Chrome/-Edge (146 Seiten) und prüft Aufbau, Fehlermeldungen, „NaN“, `<html lang>` und deutsche Reste im Englischen. Auf der Seite „Tests“ laufen dabei auch die UI-Tests, die Node überspringt. Keine zusätzlichen Abhängigkeiten.
- Die CI führt Lint, Tests, Build und Browsertest aus und veröffentlicht erst danach.
- `dist/index.html` wird nicht mehr eingecheckt, die CI baut die Datei. Lokal öffnet man `src/index.html` oder baut mit `npm run build`.

**Tests:** 72 → 80. Neu sind `ellipk` (Referenzwerte, Divergenz, Dimension), Referenzwerte der drei neuen Experimente, die Lösbarkeit aller Aufgaben (jede mit Beispiellösung im Regler-Bereich, keine schon zu Beginn gelöst) und die Vollständigkeit der Quellen. Die bestehenden Tests sind unverändert.

**Planck-Einheiten: alle Größen, dazu Boltzmann und k_B**

- Die Visualisierung zeigt jetzt nicht nur die Planck-Länge. Ein Umschalter wechselt zwischen **Länge, Zeit, Masse, Temperatur und Energie**. Jede Skala hat Vergleichswerte, markiert den experimentell erreichten Bereich und nennt die Lücke bis zum Planck-Wert, z. B. „≈ 25 Größenordnungen ohne direkte Messung“ bei der Zeit. Der Planck-Wert kommt aus der Engine und wandert im Break-Modus mit den Konstanten.
- Masse und Energie zeigen, dass m_P ≈ 22 µg und E_P ≈ 543 kWh im Alltag nicht extrem sind. Extrem wäre erst, sie in ein einziges Teilchen zu packen: 15 bzw. 8 Größenordnungen über dem LHC bzw. dem energiereichsten gemessenen kosmischen Teilchen.
- Temperatur mit zweiter Achse k_B T in eV: So wird sichtbar, dass k_B nur zwischen Temperatur und Energie umrechnet. Die Hawking-Temperatur eines Schwarzen Lochs mit Sonnenmasse ist markiert und kommt aus dem Hawking-Experiment.
- Neuer Abschnitt **Boltzmann und k_B** im Tab „Physik“: Boltzmanns Entropie, Plancks Einführung der Konstante, k_B T als thermische Energie, die exakte Festlegung seit 2019 und T_P = E_P / k_B. Dazu ein Link zum Entropie-Abschnitt der Grundlagen.
- Tab „Dimensionen“: Herleitung, wie k_B aus einer Energie eine Temperatur macht, und zwei neue geprüfte Gleichungen (E_P = √(ħc⁵/G), T_P = E_P / k_B). Die Mathematik-Ebene nennt jetzt auch E_P.

**Tests:** 70 → 72 (jede Planck-Skala zeigt den Engine-Wert; k_B im Bild ist E_P / T_P). Die Tests der Visualisierungen prüfen jetzt jede Stellung des Umschalters.

**Visualisierungen: die Mathematik sichtbar machen**

- Alle Zahlen im Bild kommen aus der Rechen-Engine. Vorher rechneten einige Bilder Formeln selbst nach (Spur beim freien Fall, Kinematik, Federkraft, Phasen und Energieleiter bei Schrödinger); das ist entfallen.
- Warnhinweise der Engine stehen jetzt direkt im Kopf der Visualisierung, z. B. „Außerhalb des Modells“. Ist ein Ergebnis mathematisch undefiniert (etwa γ bei β = 1), steht die Animation still, und es wird keine Zahl gezeichnet.
- Jede Animation hat einen Knopf **Anhalten**; er ist mit dem Schalter „Animationen“ gekoppelt.
- **Schwarzes Loch** (Hawking-Temperatur, BH-Entropie aus der Masse): r_s, A, S_BH und T_H ändern sich gleichzeitig mit dem Masse-Regler. Alle Balken haben denselben Maßstab je Zehnerpotenz. Deshalb wandern A und S_BH doppelt so schnell wie r_s, und T_H läuft entgegen (∝ M, M², M², M⁻¹). Die Exponenten werden aus Engine-Werten bestimmt, die Temperatur der Hintergrundstrahlung ist markiert.
- **Feldgleichungen**: eine langsam drehende, schematische Projektion mit Quelle und Testkörper samt Spur und Bewegungsrichtung. Die Tiefe folgt log K. Die Terme der Gleichung haben die Farben der zugehörigen Bildteile, und im Bild steht „Schematische Projektion (Modell)“.
- **Gravitation**: Eine Faktorzeile F/F₀ = m₁/m₁₀ · m₂/m₂₀ · (r₀/r)² zeigt die Werte gegenüber Preset bzw. Ausgangswert, die Kraftpfeile sind proportional zu F/F₀. Mit **Abstand pendeln lassen** schwingt r zwischen der Hälfte und dem Doppelten; Ergebnisse und Graph laufen mit.
- **Freier Fall**: Neben der Fallszene laufen s(t), v(t) und a(t) mit (∝ t², ∝ t, konstant).
- **Kreisbewegung**: Die Pfeile für v und a sind proportional zum Wert, und der überstrichene Winkel φ = ωt ist eingezeichnet. Neben jedem Wert steht der Faktor gegenüber dem Bezug.
- **Spezielle Relativität**: γ(β) mit der Asymptote bei β = 1 und dem aktuellen Punkt; unter den Uhren steht Δt = γ·Δτ aus dem Experiment.
- **Schrödinger**: Der Zeitmaßstab kommt aus ω_n („Anzeige 1,1 × 10¹⁵× langsamer“), in der Überlagerung steht die echte Periode 2π/Δω. Ein nicht ganzzahliges n (Break-Modus) wird nicht als Welle gezeichnet.
- „gegenüber Preset“ im Ergebnis bleibt richtig, wenn man nach einem Preset einen Regler bewegt (vorher hieß es dann „Ausgangswert“).

**Tests:** 63 → 70. Neu ist die Gruppe „Visualisierung“. Die Bilder werden in Node mit einem Zeichenkontext geprüft, der nur die Texte aufzeichnet. Geprüft wird, ob Engine-Werte im Bild stehen, ob Faktoren und Modellgrenzen stimmen und ob nirgends „NaN“ auftaucht. Dazu kommt ein Sprachtest für die englischen Beschriftungen. Die bisherigen 63 Tests sind unverändert.

**Neu: Englisch**

- Knopf **DE / EN** in der Seitenleiste und in der Kopfzeile auf dem Handy. Alle Texte sind übersetzt: Oberfläche, alle Experimente mit Presets, Hinweisen und Erklärungen, Konstanten und Quellen, Fehlermeldungen der Engine, alle Grundlagen-Abschnitte, Beschriftungen in den Visualisierungen und Graphen sowie die Namen der Tests.
- Die Wahl wird im Browser gespeichert; ohne gespeicherte Wahl gilt die Browsersprache. Beim Umschalten bleiben Experiment, Werte, Tab und Scrollposition erhalten. `#…&lang=en` in einem Link setzt die Sprache für diese Sitzung.
- Zahlen in Texten folgen der Sprache (Deutsch 2,7 K, Englisch 2.7 K); `<html lang>` und Seitentitel wechseln mit.
- Technik: neues Modul `src/core/i18n.js`. Texte stehen als Paare `{ de, en }` direkt neben den Daten bzw. als `T('…', '…')` im Code.

**Tests:** 59 → 63. Neu ist eine Gruppe „Sprache“, die unter anderem prüft, dass in den englischen Texten der Experimente keine deutschen Reste stehen. Die übrigen Prüfungen vergleichen deutsche Meldungen und laufen deshalb immer auf Deutsch; die Testnamen erscheinen in der gewählten Sprache.

## 2026-09-23

**Fehler behoben**

- Gleichungsprüfer: `h` war immer die Planck-Konstante, `E = m g h` wurde deshalb als inkonsistent gemeldet. Mehrdeutige Symbole (`h`, `T`, `e`) behalten ihre Standard-Lesung, lassen sich aber per Klick umdeuten („Als Höhe lesen“). Bei einem ✗ weist die Analyse darauf hin.
- Namen wie `constructor`, `toString` oder `__proto__` in einer Formel ließen die Ansicht abstürzen, `#exp=constructor` in der URL ebenso. Nachschlagen erfolgt jetzt nur noch über eigene Einträge; unbekannte Namen sind unbekannte Symbole.
- Theorie-Tabelle „Warum beide nicht zusammenpassen“: In der QFT „tickt die Zeit nicht für alle gleich“ – sie ist relativistisch, aber nicht dynamisch. Zeile korrigiert.
- `0^0` meldete „Division durch 0“, `exp(10^400)` zeigte „NaN × 10^Infinity“, `cos(10^400)` eine irreführende NaN-Meldung, `sqrt(4, 5)` ignorierte das zweite Argument, `L^1/0` wurde als Dimension akzeptiert.

**Verbesserungen**

- „Die Köpfe hinter der ART“: neuer Abschnitt zu Henri Poincaré (Lorentz-Gruppe, invariantes x² + y² + z² − c²t², imaginäre Zeit als vierte Koordinate). Die Zeitleiste schreibt Minkowski das Abstandsquadrat nicht mehr allein zu.
- Wirkungs-Demo rechnet mit der exakten Formel ΔS = mπ²/(4τ)·(ε₁² + 4ε₂²) statt ~80 numerischen Integrationen pro Frame. Formel und Begründung stehen jetzt auch im Text.
- Theorie-Widgets zeichnen nur bei Änderungen und nur, solange sie sichtbar sind; die Anzeige wird nur neu geschrieben, wenn sich ihr Inhalt ändert. Der Schalter „Animationen“ wirkt sofort auf alle Widgets, bei `prefers-reduced-motion` fliegt auch der Ball der Wirkungs-Demo nicht mehr.
- Gleichungsprüfer: Hinweis bei „a / b c“ (wird als (a/b)·c gelesen) mit Knopf „Klammern setzen“, der die Eingabe inklusive ħ, π und Hochzahlen korrekt ergänzt. Reine Zahlbrüche wie `1/2 m v^2` lösen keinen Hinweis aus.

**Tests:** 47 → 59, alle grün (in Node und im Browser).
