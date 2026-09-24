# Änderungen

## 2026-09-24

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
