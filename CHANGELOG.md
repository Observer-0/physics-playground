# Änderungen

## 2026-10-31

**Formulierungen und Layout: Aussagen statt Fragesätze, Experiment-Seiten neu geordnet**

- Offene Fragen: Jede Seite beginnt mit einer kurzen Einleitung statt mit dem Abschnitt „Die Frage“. Fragesätze im Text sind Aussagen geworden – Fragen sind nur noch die Titel. Die Vertiefungen heißen „Woher das Minimum kommt“ und „Mischung ohne festen Weg“, die Kurztexte der Übersicht sind Aussagen.
- Seite zur kosmologischen Konstante neu geordnet: erst Messung, Vakuumenergie und Abschätzung, dann ein eigener Abschnitt „Die Dimension von Λ“ mit Krümmung, Längen, Vergleichstabelle und Horizont-Entropie. Die Tabelle steht jetzt nach der Abschätzung, auf die sie sich bezieht. Beim Messproblem steht die Zusammenfassung nach „Was offen ist“.
- Grundlagen: „1. Die Geometrie einer Überlagerung“ statt einer Frage als Überschrift; zwei Fragesätze im Text umformuliert.
- Experiment-Seiten: Tabs „Labor, Erklärung, Formel, Dimensionen, Quellen“; „Erklärung“ führt von der Intuition über die Mathematik zur Physik. Vergleich A/B und Zurücksetzen stehen bei den Reglern, Speichern und Teilen im Kopf. Jedes Experiment hat eine Unterzeile, Hinweise und Unterzeilen sind Aussagen.
- Ergebnisliste: Symbol und Wert in einer Zeile, die Beschreibung darunter über die ganze Breite – kein Wert wird mehr abgeschnitten, auch nicht in der schmalen Spalte rechts. Namen der Regler zweizeilig statt nach wenigen Zeichen abgeschnitten.
- Handy: Im Labor ist die Karte der Gleichung zuerst zu, damit das Experiment nicht eine Bildschirmhöhe tiefer beginnt. Zwei Formeln, die durch `\qquad` getrennt sind, brechen bei Bedarf in zwei Zeilen um. Die fünf Tabs passen in eine Zeile.
- „Probier mal“: alle 48 Aufgaben und ihre Tipps als Aufträge statt als Fragen („Finde …“, „Lies ab, …“).

**Tests:** weiterhin 115. Der Aufbau-Test der Offenen Fragen verlangt Einleitung, vier Abschnitte und keine Fragesätze im Text, der Aufgaben-Test Aufträge ohne Fragezeichen.

**Offene Fragen, Frage 4: „Das Messproblem“ – Dekohärenz im Interferometer**

- Neue Seite `#view=offen&sec=mess` (Status: offen). Die Frage: Die Schrödinger-Gleichung macht aus einer Überlagerung samt Messgerät eine größere Überlagerung (von Neumann 1932) – abgelesen wird aber immer genau ein Ergebnis. Gesichert: die Born-Regel (in der Standardformulierung ein Postulat, geprüft mit drei Spalten, Sinha u. a. 2010), Interferenz von Molekülen über 25 000 u (Fein u. a. 2019) und Dekohärenz: V = 2√(p₁p₂)|⟨E₁|E₂⟩| mit V² + D² = 1 (Englert 1996), gemessen im Resonator (Brune u. a. 1996) und an Fullerenen (Hornberger u. a. 2003, Hackermüller u. a. 2004). Eine Tabelle stellt Theorie, Experimente und Offenes nebeneinander. Offen: das einzelne Ergebnis, der Status der Born-Regel, was eine Messung ist (die Interpretationen bleiben in Grundlagen §8) und wie eine Überlagerung gravitiert (Verweis auf §10). Vertiefungen: warum die Streifen exponentiell verschwinden; Mischung oder Überlagerung. Verschränkung über Gravitation steht als Vorschlag da, nicht als Ergebnis.
- Neues Experiment „Dekohärenz: Weginformation und Interferenz“ (als Modell gekennzeichnet): Regler p₁, N (mittlere Zahl der Stöße), γ (Überlapp je Stoß), Ort x und Zahl n der Teilchen. Die Engine rechnet |⟨E₁|E₂⟩| = e^{−N(1−γ)} (Poisson-Mittel von γ^k), V, D, V² + D², |ρ₁₂|, Tr ρ² und das schematische Schirmbild I(x). Presets: ohne Umgebung, viele schwache Stöße (V = e⁻²), Welcher-Weg-Detektor, ungleiche Wege (V = 0,6, P = 0,8).
- Visualisierung „Schirm“: Die Teilchen kommen einzeln an, „Teilchen schicken“ lässt 50 pro Sekunde los. Die Treffer zieht das Bild aus |ψ|² der Engine – mit einem Zufallsgenerator, wie es im Bild steht. Histogramm und erwartete Verteilung sind gleich skaliert, ein Treffer bleibt liegen, wenn neue dazukommen. Links die zwei Wege (Strichstärke ∝ Gewicht) und die Umgebung. „Wegzustand ρ“: die Dichtematrix (Fläche ∝ Betrag), ihre Reinheit und V² + D² als Balken.
- Interaktive Gleichung, vier Aufgaben, zwölf Quellen (DOIs geprüft). Die Grundlagen verweisen im Abschnitt Quantenmechanik auf die neue Seite. Neu: `animateLabel` benennt den Abspielknopf um.

**Tests:** 112 → 115 (V und Poisson-Summe, V² + D² = 1 und Tr ρ² bei 80 Einstellungen; Presets, Nullstellen von I(x), „unreal“ außerhalb der Bereiche; Bild mit Werten aus der Engine, feste Treffer). `npm run check:ui` prüft die neue Seite und beide Ansichten.

**Offene Fragen, Frage 2: 1/Länge² verbindet Geometrie und Quantentheorie – die Entropie von Horizonten**

- Neuer Absatz auf der Seite „Warum ist die kosmologische Konstante so klein?“: In Λ l_P² stehen zwei Größen mit 1/Länge² – Λ aus der Geometrie, 1/l_P² = c³/(ħG) mit dem Wirkungsquantum. Die Bekenstein-Schranke S ≤ 2πk_B ER/(ħc) enthält ħ, aber kein G (präzise Fassung in der Quantenfeldtheorie: Casini 2008). Mit E ≤ Rc⁴/(2G) wird daraus k_B πR²/l_P² = k_B A/(4 l_P²), die Bekenstein-Hawking-Entropie – Schwarze Löcher erreichen die Schranke. Gibbons und Hawking (1977): Auch der Λ-Horizont hat Temperatur und Entropie, S_dS = 3π k_B/(Λ l_P²) ≈ 3,3 × 10¹²² k_B bei T_dS ≈ 2 × 10⁻³⁰ K. Die kleine Zahl ist also der Kehrwert einer Entropie: Λ l_P² = 3π k_B/S_dS. Offen bleibt, was S_dS zählt – und die Umrechnung erklärt Λ nicht.
- Experiment: neue Ausgaben S_dS/k_B = π r_dS²/l_P² und T_dS = ħc/(2πk_B r_dS). Dritte Ansicht „Horizonte S ∝ r²“: oben der Radius eines Horizonts, unten seine Entropie. Schwarze Löcher (1 M☉, Sgr A*, M87* – Werte aus dem Experiment „Bekenstein-Hawking-Entropie“) und der Λ-Horizont liegen auf denselben Achsen; aus 61 Größenordnungen im Radius werden 122 in der Entropie. Eine neue Aufgabe, drei neue Quellen (Bekenstein 1981, Casini 2008, Gibbons und Hawking 1977; DOIs geprüft).
- Ansicht „Λ = 1/ℓ²“ nennt die Herkunft der beiden Krümmungen (Λ aus der Geometrie, 1/l_P² = c³/(ħG) mit ħ). Kopf- und Fußzeilen der Λ-Ansichten werden kleiner gesetzt, wenn sie sonst nicht ins Bild passen.

**Tests:** 111 → 112 (S_dS = 3π k_B/(Λ l_P²), T_dS = ħH/(2πk_B), S_dS ∝ 1/Λ; Bekenstein-Schranke Schwarzer Löcher gleich S_BH; beide Horizonte mit S = k_B πr²/l_P²). Der Ansichten-Test prüft auch „Horizonte“, `npm run check:ui` die dritte Ansicht.

**Offene Fragen, Frage 2: „Warum ist die kosmologische Konstante so klein?“ – Λ als Krümmung, 1/Länge²**

- Neue Seite `#view=offen&sec=lambda` (Status: offen), in der Reihenfolge der Roadmap an zweiter Stelle; „Geht Information verloren?“ ist jetzt Frage 3. Gesichert: die beschleunigte Expansion (Supernovae 1998/99) und Λ ≈ 1,1 × 10⁻⁵² m⁻² im ΛCDM-Modell. Als eigener Absatz die Dimension: Λ steht neben dem Einstein-Tensor und ist eine Krümmung, 1/Länge². Daraus folgen die Länge ℓ_Λ = 1/√Λ ≈ 10 Milliarden Lichtjahre, die reine Zahl Λ l_P² ≈ 3 × 10⁻¹²² und – als Energiedichte gelesen – u_Λ = Λc⁴/(8πG), dreieinhalb Protonenmassen pro Kubikmeter. Eine Tabelle zeigt dieselbe Lücke in vier Dimensionen: Länge 60,8, Krümmung 121,5, Energie 30,7, Energiedichte 122,9 Größenordnungen.
- Die Abschätzung der Vakuumenergie bis zu einer Abschneide-Energie, u_vac ~ E_c⁴/(ħc)³, ist als Abschätzung gekennzeichnet, nicht als Vorhersage: Ein harter Cutoff verletzt die Lorentz-Invarianz, eine Lorentz-invariante Rechnung ergibt rund 55 Größenordnungen (Martin 2012). Offen bleiben das alte Problem (warum die Vakuumenergie nicht so gravitiert), das Koinzidenzproblem und ob Λ konstant ist (DESI 2025: Hinweise mit 2,8 bis 4,2 σ, kein Nachweis). Als Vertiefung: woher das E⁴ kommt.
- Neues Experiment „Kosmologische Konstante und Vakuumenergie“ mit zwei Reglern, E_c und Λ. Die Engine rechnet u_Λ, u_vac, ihr Verhältnis, die Längen ℓ_Λ, ħc/E_Λ und ħc/E_c und Λ l_P². Bei der Planck-Energie ist das Verhältnis 8π/(Λ l_P²) ≈ 8,7 × 10¹²²; der Vorfaktor 1/(16π²) eines einzelnen Feldes ist eine eigene Ausgabe. Presets: Planck-Energie, 1 TeV, 100 GeV, Elektron, Energieskala von Λ (Verhältnis 1) und Λ so groß, wie die Planck-Abschätzung es verlangen würde. „E_c pendeln lassen“ fährt von der Λ-Skala bis zur Planck-Energie.
- Visualisierung mit zwei gekoppelten logarithmischen Achsen. „Λ = 1/ℓ²“: oben Längen, unten Krümmungen an derselben Stelle – aus 61 Größenordnungen zwischen l_P und ℓ_Λ werden 122 zwischen 1/l_P² und Λ; dazu ħc/E_Λ ≈ 88 µm fast genau in der Mitte. „Energiedichte ∝ E⁴“: oben die Abschneide-Energie, unten u_vac – eine Größenordnung Energie sind vier Größenordnungen Energiedichte. Die Enden der unteren Achsen rechnet die Engine aus.
- Interaktive Gleichung, drei Aufgaben, neun Quellen (DOIs geprüft). Die Grundlagen verweisen im Abschnitt Dimensionsanalyse auf die neue Seite.
- Ein veränderter Regler mit einer kosmologischen Konstante weicht jetzt vom „beobachteten“ Wert ab (statt vom „festgelegten“). Formelsatz: `{,}` ist ein Dezimalkomma ohne Abstand – „1,1“ statt „1, 1“, auch in bestehenden Seiten. `\lg` wird als Funktion gesetzt.

**Tests:** 108 → 111 (Verhältnis bei der Planck-Energie zwischen 10¹²⁰ und 10¹²⁴ und gleich 8π/(Λ l_P²), 1 bei der Energieskala von Λ, u_vac ∝ E_c⁴, Presets; ℓ_Λ, Λ l_P², geometrisches Mittel und die Zahlen der Seite gegen die Engine; Modellgrenze über der Planck-Energie, verändertes Λ, beide Ansichten mit Werten aus der Engine). Der Formelsatz-Test prüft das Dezimalkomma. `npm run check:ui` prüft die neue Seite und die Ansicht „Energiedichte“.

**Offene Fragen, Frage 2: „Geht Information verloren?“ – Verdampfung und Page-Kurve**

- Neue Seite `#view=offen&sec=info` (Status: offen) mit den fünf Teilen: Hawkings thermische Strahlung, das Paradoxon von 1976, Pages Argument mit dem Minimum, die Page-Zeit im einfachsten Modell, semiklassische Rechnungen seit 2019 als Rechnung in speziellen Modellen – nicht als Beobachtung. Offen bleiben der Mechanismus, die Unitarität selbst und die Endphase. Als Vertiefung: warum ausgerechnet das Minimum.
- Neues Experiment „Verdampfung und Page-Kurve“: τ = t/t_evap als Regler, „Zeit laufen lassen“ lässt das Loch in 10 s verdampfen. Masse, Temperatur und Entropien kommen aus der Engine: S_BH = S₀(1 − τ)^{2/3}, S_rad = β(S₀ − S_BH), S_Page = min(S_rad, S_BH). Die Page-Zeit rechnet die Engine aus, τ_Page = 1 − (β/(1 + β))^{3/2}: 0,6464 im einfachsten Modell (β = 1), Pages 53,81 % für Photonen und Gravitonen (β ≈ 1,4847).
- Visualisierung: links das Loch, das schrumpft, heller wird und immer stärker strahlt; rechts die drei Kurven, die bis zur aktuellen Zeit kräftig gezeichnet werden, mit der Page-Zeit als Linie. Am Ende: „verdampft“, T_H undefiniert, die Endphase als Modellgrenze markiert.
- Interaktive Gleichung, drei Aufgaben, sieben Quellen (DOIs geprüft). Die Grundlagen verweisen im Abschnitt zum Informationsparadoxon auf die neue Seite.
- Engine: `min` und `max` für zwei Größen derselben Dimension, auch jenseits des Double-Bereichs. `animateRate` legt fest, wie schnell „Zeit laufen lassen“ läuft. Während die Zeit läuft, gilt – wie beim Pendeln – keine Aufgabe als gelöst; wer an der richtigen Stelle anhält, löst sie.

**Tests:** 105 → 108 (min und max; Page-Kurve mit Page-Zeit, Maximum und Pages Zahlen für β ≈ 1,4847; Verdampfung konsistent mit Hawking-Temperatur und BH-Entropie, T_H bei 99,9 %, Verhalten bei τ = 1). `npm run check:ui` prüft die neue Seite.

**Animationen: exaktes Fadenpendel und η pendeln**

- Fadenpendel: Das exakte Pendel bewegt sich jetzt wirklich exakt. Bisher war seine Bewegung als Kosinus gezeichnet (bekannte Einschränkung in der README); jetzt kommt der Winkel aus der Engine: θ(t) = 2 arcsin(k · sn(K(k) − ω₀t, k)) mit k = sin(θ₀/2). Bei großen Amplituden verweilt das Pendel sichtbar an den Umkehrpunkten. Die Näherung θ₀ cos ω₀t kommt ebenfalls aus der Engine. Das Bild nennt den Zeitmaßstab (Echtzeit, Zeitraffer oder Zeitlupe).
- Fadenpendel, neue Form „Bewegung θ(t)“: mit der Zeit t als Regler und „Zeit laufen lassen“ in Echtzeit. Der Graph zeigt θ(t) und θₐ(t) über zwei Perioden – bei 170° bleibt die exakte Kurve oben flach, während der Kosinus schon zurückschwingt. Neue Ausgaben θ(t), θₐ(t), θ − θₐ und ω₀; neue Aufgabe zu 170°. Die Form „Periodendauer“ ist unverändert.
- Engine: Funktionen können mehrere Argumente haben. Neu sind die Jacobi-Funktion `sn(u, k)` (über das arithmetisch-geometrische Mittel, NIST DLMF 22.20) und `asin`. Geprüft gegen eine numerische Integration der Pendelgleichung (RK4): Abweichung unter 10⁻⁷ Grad, auch bei 170°.
- Vorfaktor η: neuer Knopf „η pendeln lassen“. η schwingt um 1/4 zwischen 1/16 und 1, R_η läuft zwischen 1/4 und 4 und dabei durch 1. Die Balken haben dafür einen festen Maßstab bis R = 4. Pendeln kann jetzt um einen festen Wert (`sweep.center`) und beginnt ohne Sprung beim aktuellen Wert. Während ein Wert pendelt, gilt keine Aufgabe als gelöst.
- Graph-Vorgaben gibt es jetzt auch je Form (`forms[].graph`).

**Tests:** 99 → 105 (sn-Identitäten und Grenzfälle k = 0 und k = 1, arcsin; zwei Argumente und Dimensionen; θ(t) gegen RK4 bei 10°, 90° und 170°; θ an den Viertelperioden; Pendelbild in beiden Formen; Pendeln um einen festen Wert bleibt im Regler-Bereich). Der Test zum Standardbereich prüft auch die Graph-Vorgaben der Formen.

**Offene Fragen: Grundgerüst und Frage 1 „Warum genau 1/4?“**

- Neues Themenfeld „Offene Fragen“ in der Seitenleiste zwischen Grundlagen und Werkzeuge, mit eigenem Icon und eigener Farbe (Sand – keine Datenfarbe). Übersicht unter `#view=offen`: die Regeln der Rubrik, die drei Status (offen, teilweise verstanden, semiklassisch geklärt) und eine Karte je Frage.
- Jede Frage hat eine eigene Seite (`#view=offen&sec=…`) mit fünf Teilen: die Frage, was gesichert ist, was offen ist, was es entscheiden würde, live in der App. Einzelne Aussagen tragen Etiketten (Mathematik, semiklassisch, Messung, offen, Quantenfeldtheorie), die Frage als Ganzes ihren Status. Am Ende stehen die Quellen.
- Frage 1 „Warum genau 1/4?“ (Status: teilweise verstanden): Herleitung des Faktors aus T_H und dem ersten Hauptsatz, die Wege über das euklidische Pfadintegral (Gibbons–Hawking) und die Noether-Ladung (Wald), offen die mikroskopische Deutung, als Vertiefung die Flächenskalierung der Verschränkungsentropie in der QFT, dazu die Tests des Flächensatzes mit GW150914 und GW250114.
- Neues Experiment „Vorfaktor η“: S_η = η k_B A/l_P² mit η als Regler. Die Engine rechnet R_η = T_H · dS_η/dM / c² aus T_H und der Ableitung – heraus kommt 4η, für jede Masse. Presets η = 1/4, 1/2, 1 und 1/4 bei M87*. Eigene Visualisierung: zwei Balken, c² dM und T_H dS_η, die bei η = 1/4 gleich lang sind. Interaktive Gleichung, zwei Aufgaben, neun Quellen (DOIs geprüft).
- Die Seiten der Grundlagen und der Offenen Fragen teilen sich `U.sectionPage` (vorher nur in `src/ui/theory.js`). Experimente einer Frage zeigen über dem Titel den Rückweg zu ihr. Die Quellenliste ist als `U.sourceList` wiederverwendbar.
- `npm run check:ui` zählt auf der Testseite nur noch die Zeile „n / m bestanden“ – „1/4“ in der Seitenleiste wurde sonst als Testergebnis gelesen.

**Tests:** 96 → 99 (R_η = 4η bei jeder Masse und ohne Messunsicherheit, S_η(1/4) = S_BH; keine Kandidaten für eine Quantengravitation im Experiment, in seinen Quellen oder auf den Seiten; jede Frage mit Status, fünf Teilen und Direktlink). `npm run check:ui` prüft zusätzlich die Übersicht und die Seite der Frage und alle Tabs des neuen Experiments.

## 2026-10-01

**Grundlagen: Kerngleichungen interaktiv**

- 18 Kerngleichungen in „Theorie kurz erklärt“ erklären ihre Symbole wie die Experimente: erstes Newtonsches Gesetz, träge Masse, Lorentz-Faktor, Feldgleichungen, Schrödinger-Gleichung, Unschärferelation, Kopplungsstärke der Gravitation, Poisson-Gleichung, Abstandsquadrat, Viererimpuls, Wirkung, Einstein-Hilbert-Wirkung sowie die Entropie nach Clausius, Boltzmann, Gibbs, Shannon, von Neumann und Bekenstein-Hawking.
- Die Karte schwebt über dem Lesetext, damit der Text sich nie verschiebt: Zeigen blendet sie ein, Klick oder Tippen hält sie fest, ×, Esc oder ein Klick daneben schließt sie. Mit der Tastatur öffnet der Fokus auf einem Symbol die Karte.
- Rechenwege und Zwischenschritte (Dimensionsherleitung, ausgeschriebenes Abstandsquadrat, ΔS des Balls, δS/δg = 0, S/ħ, Intervall im Geschichtsabschnitt) bleiben unverändert statisch. Der Formeltext aller Abschnitte ist gleich geblieben (Vergleich vorher/nachher).

**Tests:** 93 → 96 (Marker und Symbole der Kerngleichungen in beiden Sprachen, jede Kerngleichung steht in einem Abschnitt, schwebende Karte öffnen, schließen und abbauen).

**Jede Gleichung interaktiv**

- Auch die neun übrigen Experimente (Gravitation, gleichmäßig beschleunigte Bewegung, freier Fall, Feder, Kreisbewegung, Fadenpendel, schiefer Wurf, Lorentz-Faktor, ideales Gas) zeigen ihre Formel jetzt groß mit anklickbaren Symbolen, Legende und Karte – wie die Famous Equations. Vorgewählt ist das Ergebnis; seine Karte erklärt den Aufbau der ganzen Formel (z. B. „Produkt der Massen, geteilt durch das Abstandsquadrat, mal G“). Die kleine Formel neben dem Titel entfällt dafür.
- Auch Vorzeichen und Zahlenfaktoren, die die Physik tragen, sind Symbole: das Minus in F = −kx, das ½ in ½gt², die 4 und das elliptische Integral K beim Pendel. Winkel zeigen ihren Wert in Grad. Ist eine Konstante im Experiment ein Regler (G bei der Gravitation), nennt die Karte auch den eingestellten Wert.

**Tests:** Der Test „ohne Marker gleich `exp.tex`“ prüft jetzt alle 14 Experimente.

**Famous Equations: jede Formel interaktiv**

- Alle fünf berühmten Gleichungen (Hawking-Temperatur, Bekenstein-Hawking-Entropie, Einsteinsche Feldgleichungen, Schrödinger-Gleichung, Planck-Länge) bedienen sich jetzt wie bisher nur T_H: Jede Naturkonstante und jede Größe in der Formel lässt sich zeigen, antippen oder anklicken. Die Karte daneben nennt Name und Symbol, bei Konstanten Wert, Einheit und Quelle, bei Ein- und Ausgaben den aktuellen Wert, dazu die physikalische Bedeutung und die Rolle in genau dieser Gleichung. Das gewählte Symbol ist in der Formel hervorgehoben, mehrfach vorkommende (ħ und ψ bei Schrödinger) an jeder Stelle. × oder Esc schließt die Karte.
- Gemeinsame Komponente `src/ui/eqx.js`, Daten in `src/data/equations.js`. Die Zahlenwerte der Konstanten kommen nur aus `src/core/model.js`, ihre Bedeutung steht einmal für alle Gleichungen. Die Formeln selbst sind unverändert (Test).
- Hawking-Temperatur: Bedienung, Grenzfälle und Live-Knöpfe wie vorher. Neu sind das anklickbare T_H, Name, Wert und Bedeutung auf jeder Karte sowie das ×.

**Tests:** 90 → 93 (jede berühmte Gleichung interaktiv und ohne Marker gleich `exp.tex`; vollständige Symboldaten auf Deutsch und Englisch; Auswahl, × und Esc im Browser).

## 2026-09-24

**Breite Bildschirme**

- Der Inhalt ist höchstens 1760 px breit und steht mittig; bis etwa 2000 px Fensterbreite ändert sich dadurch nichts.
- Grundlagen-Seiten: Der Text bleibt in Lesebreite (ca. 66 Zeichen) und steht mittig, der Titel fluchtet mit ihm. Tabellen und Vertiefungen sind breiter, Widgets am breitesten, das Inhaltsverzeichnis steht rechts. Ab 1600 px ist die Schrift etwas größer, die Lesebreite wächst mit.
- Übersicht der Grundlagen: Die Karten nutzen die ganze Breite (bei 1920 px fünf Spalten).
- „Über“: eine Lesespalte in der Mitte. Hall of Fame: Formel und Beschreibung teilen sich die Zeile je zur Hälfte.

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
