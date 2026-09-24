# Roadmap: Offene Fragen

Stand 24.09.2026. Plan für die nächste Ausbaustufe – nichts davon ist umgesetzt.

Ein neuer Bereich „Offene Fragen“ (engl. „Open questions“) zeigt Stellen, an denen allgemeine Relativitätstheorie (ART) und Quantentheorie an ihre Grenze kommen oder sich widersprechen. Die App soll dort dasselbe leisten wie überall: zeigen, was gesichert ist, was eine Annahme ist und wo genau die offene Stelle liegt – mit Zahlen aus derselben Engine.

## Leitlinien

Es gelten die Regeln aus README und CHANGELOG:

- Experimente sind reine Daten in `src/data/experiments.js`.
- Texte immer als `{ de, en }`; der Test auf deutsche Reste in englischen Texten bleibt grün.
- Zahlen kommen nur aus der Engine; die Oberfläche rechnet keine Formel nach.
- Epistemische Linie: Mathematik, Modell, Näherung, Messung und Annahme getrennt benennen.

Neu für diesen Bereich: **theoriefrei jenseits von ART und Quantentheorie.**

- Grundlage ist nur, was ART und Quantentheorie selbst sagen – QM, Quantenfeldtheorie (auch auf gekrümmter Raumzeit, also semiklassisch), Thermodynamik und Statistik – plus Messungen.
- Methoden der semiklassischen Gravitation gehören dazu (Hawkings Rechnung, euklidisches Pfadintegral, Wald-Entropie).
- Keine Querverweise auf Kandidaten einer Quantengravitation (Stringtheorie, Schleifenquantengravitation, asymptotische Sicherheit, kausale Mengen …) und keine Erweiterungen der QM (etwa Kollapsmodelle). Auch nicht als Ausblick, in Fußnoten oder in den Quellen.
- Eine offene Frage bleibt eine Frage. Keine Antwort aus einem Kandidaten, keine Namen von Auflösungsvorschlägen. Wo etwas offen ist, steht „offen“.

Zur Entscheidung: Abschnitt 10 der Grundlagen („Warum beide Theorien (noch) nicht zusammenpassen“) nennt unter „Lösungsansätze“ bereits Stringtheorie und Schleifenquantengravitation, als Hypothese markiert. Der neue Bereich verlinkt nicht auf diesen Absatz. Ob er so bleibt, ist eine eigene Entscheidung.

## Form

- **Themenfeld:** eigener Eintrag `open` in `U.FIELDS` mit Icon und Farbe, in der Seitenleiste zwischen Grundlagen und Werkzeuge. Keine Datenfarbe: Orange ist das Hauptergebnis, Rot die Warnung, Cyan der Bezug, Grün „in Ordnung“.
- **Seiten:** eine Übersicht (das Anforderungsprofil, Punkt 5) und eine Seite je Frage, nach dem Muster der Grundlagen: Lesespalte, breite Widgets, Inhaltsverzeichnis, `h3.th-deep` für Vertiefungen, „Weiter zu“ am Ende.
- **Steckbrief**, gleich für jede Frage:
  1. Die Frage in einem Satz
  2. Was gesichert ist, mit Epistemik-Tag
  3. Wo genau es offen ist
  4. Was es entscheiden würde: Messung, Rechnung oder Konsistenz
  5. Live in der App: Experiment oder Widget, Zahlen aus der Engine
- **Status je Frage**, zusätzlich zu den Epistemik-Tags: *offen* · *teilweise verstanden* · *semiklassisch geklärt*.
- **Querverweise** dorthin, wo die Fragen schon vorkommen:

  | Stelle in der App | Frage |
  | --- | --- |
  | Hawking-Temperatur | Informationsparadoxon |
  | BH-Entropie | Warum 1/4 |
  | Feldgleichungen, Konstante Λ | Λ-Problem |
  | Grundlagen 8 | Messproblem |
  | Grundlagen 10 | Anforderungsprofil |

## Themen, in dieser Reihenfolge

Die Punkte 1 und 2 zuerst. Beide lassen sich vollständig mit der Engine zeigen und bauen auf Vorhandenem auf. Beide haben eine klare Pointe: Die 1/4 sieht aus wie eine Konvention und ist erzwungen. Die „120 Größenordnungen“ sehen aus wie ein Ergebnis und hängen an einer Annahme.

### 1. Warum genau 1/4 in S = k_B A/(4 l_P²)?

**Frage:** Woher kommt der Faktor 1/4 – und was zählt diese Entropie?

**Gesichert (semiklassisch):**

- Mit Hawkings Temperatur T_H und dem ersten Hauptsatz dE = T dS (E = Mc²) ist der Vorfaktor festgelegt: Nur 1/4 ist konsistent. Bekenstein hatte das Flächengesetz vorher, konnte den Vorfaktor aber nur abschätzen.
- Die 1/4 hängt an 8π = 4 · 2π aus dem Hawking-Block, also an der 2π der Quantenperiodizität.
- Ein zweiter, unabhängiger Weg innerhalb der semiklassischen ART liefert denselben Wert: das euklidische Pfadintegral (Gibbons und Hawking 1977). Wald (1993) erhält ihn als Noether-Ladung; das steht schon im Abschnitt Entropie.

**Offen:** Welche Mikrozustände S_BH zählt. Die App nennt dafür keine Kandidaten.

**Live:**

- Datenexperiment mit freiem Vorfaktor η in S_η = η k_B A/l_P².
- Die Engine rechnet T_H · (dS_η/dM)/c² als Formel in den Daten. Analytisch ist das 4η; die UI rechnet es nicht nach.
- Nur bei η = 1/4 ist dE = T dS erfüllt; sonst meldet ein Check, dass der erste Hauptsatz verletzt ist.
- Voreinstellungen: 1/4, 1/2, 1 und Bekensteins Schätzung von 1973. Deren Wert vor der Aufnahme an der Originalarbeit prüfen.

**Epistemik:** Konsistenzargument (Mathematik plus die Annahme, dass T_H gilt), kein Beweis der Mikrophysik.

**Tests:**

- η = 1/4 ergibt Verhältnis 1, η = 1/2 ergibt 2.
- Das Verhältnis ist dimensionslos.

### 2. Λ: Warum ist die kosmologische Konstante so klein?

**Frage:** Warum ist die gemessene Energiedichte des Vakuums so viel kleiner als die Beiträge, die die Quantenfeldtheorie abschätzt?

**Gesichert:**

- Gemessen: Λ ≈ 1,1 × 10⁻⁵² m⁻², ein Planck-2018-Wert aus dem ΛCDM-Modell. Er ist modellabhängig; so steht er schon in den Konstanten.
- Daraus folgt die Energiedichte ρ_Λc² = Λc⁴/(8πG) ≈ 5 × 10⁻¹⁰ J/m³. Die zugehörige Energieskala (ρ_Λc² · (ħc)³)^(1/4) liegt bei rund 2 meV.
- In der Quantenfeldtheorie tragen Nullpunktsenergien zur Vakuumenergie bei. Vakuumenergie gravitiert wie Λ.

**Offen, und die Pointe:**

- Die berühmten „120 Größenordnungen“ sind keine Vorhersage. Sie folgen aus einer Annahme: Man schneidet die Nullpunktsenergie bei der Planck-Energie ab, ρ_vac ~ E_c⁴/(ħc)³.
- Mit 1 TeV als Grenze sind es etwa 59 Größenordnungen, andere Rechenwege liefern wieder andere Zahlen.
- Robust ist nur: Beiträge bekannter Teilchen liegen je nach Rechenweg viele Größenordnungen über dem gemessenen Wert und müssten sich fast vollständig wegheben. Das eigentliche Problem ist diese Feinabstimmung.

**Live:**

- Regler für die Abschneide-Energie E_c, logarithmisch von meV bis zur Planck-Energie.
- Die Engine rechnet ρ_vac ≈ E_c⁴/(ħc)³ und ρ_Λc² aus Λ der Registry, dazu log₁₀ des Verhältnisses.
- Voreinstellungen: Λ-Skala (≈ 2 meV), Elektronmasse, 1 TeV, Planck-Energie.
- Der Vorfaktor der Abschätzung (etwa 1/(16π²)) ist Konvention; als Näherung markieren. Er verschiebt das Ergebnis um rund zwei von 120 Größenordnungen.

**Epistemik:**

- Λ ist gemessen, aber modellabhängig.
- ρ_vac ist eine Abschätzung.
- Die Abschneide-Energie ist eine Annahme.
- Kein Lösungsvorschlag.

**Tests:**

- E_c = E_P ergibt ein Verhältnis zwischen 10¹²⁰ und 10¹²⁴.
- E_c auf der Λ-Skala ergibt ein Verhältnis nahe 1.
- Das Verhältnis ist dimensionslos.

### 3. Informationsparadoxon

**Frage:** Geht Information verloren, wenn ein Schwarzes Loch vollständig verdampft?

**Gesichert (semiklassisch):** Hawkings Rechnung ergibt thermische Strahlung, deren Entropie bis zum Ende wächst. Ein reiner Anfangszustand wäre am Ende gemischt – im Widerspruch zur Unitarität der Quantenmechanik.

**Erwartung bei Unitarität:** die Page-Kurve (Page 1993). Die Entropie der Strahlung steigt, kippt etwa dann, wenn das Loch die Hälfte seiner Entropie abgegeben hat (Page-Zeit), und fällt bis zum Ende auf null.

**Stand:** Neuere semiklassische Rechnungen (seit 2019) reproduzieren die Page-Kurve. Wie die Information physikalisch herauskommt, ist offen. Beobachtet ist nichts davon, denn T_H astrophysikalischer Löcher liegt weit unter der Temperatur der Hintergrundstrahlung.

**Live:** ein Graph über t/t_evap, mit t_evap aus dem Hawking-Experiment (Ausgabe `tev`, dort schon als grobe Abschätzung markiert):

- S_BH(t) = S₀ (1 − t/t_evap)^(2/3).
- Hawking-Kurve: S_rad = S₀ − S_BH. Das ist eine Vereinfachung, weil die Entropie der Strahlung in Wahrheit etwas größer ist als die Entropie, die das Loch verliert. Als Näherung markieren.
- Page-Kurve: min(S_rad, S_BH).
- Die Engine rechnet die Page-Zeit als Schnittpunkt, in dieser Vereinfachung t = (1 − 2^(−3/2)) t_evap ≈ 0,65 t_evap.
- Jede Kurve trägt ihren eigenen Status: berechnet (semiklassisch), erwartet (Unitarität), in Rechnungen reproduziert mit offenem Mechanismus.

### 4. Messproblem

**Frage:** Warum liefert eine Messung genau ein Ergebnis, obwohl die Schrödinger-Gleichung Überlagerungen linear weiterentwickelt?

**Gesichert:**

- Die Born-Regel sagt die Häufigkeiten in allen Tests richtig vorher.
- Dekohärenz ist gemessen: Wechselwirkung mit der Umgebung löscht Interferenz, etwa bei Fullerenen, die Wärmestrahlung abgeben. Sie erklärt, warum man keine Überlagerungen sieht, aber nicht, warum ein bestimmtes Ergebnis eintritt.
- Interferenz ist bis zu Molekülen mit über 25 000 u nachgewiesen (2019). Eine Grenze für Überlagerungen wurde bisher nicht gefunden.

**Offen:** Was genau eine Messung ist und warum ein Ergebnis eintritt.

**Deutungen:** Abschnitt 8 nennt sie bereits, mit dem Hinweis, dass sie dieselben Vorhersagen machen. Dabei bleibt es; keine Modelle, die die QM abändern.

**Live:**

- Eher Text mit einer Vergleichstabelle: was die QM sagt, was gemessen ist, was offen ist.
- Optional ein Widget: Sichtbarkeit der Interferenz bei wachsender Kopplung an die Umgebung. Das ist ein Modell mit einem Parameter und so zu markieren.

**Brücke zur Gravitation:** Frage 1 in Abschnitt 10, „Welche Geometrie hat eine Überlagerung?“.

### 5. Anforderungsprofil: Was muss eine Quantengravitation leisten?

Die Übersichtsseite des Bereichs. Sie listet Anforderungen und bewertet keine Ansätze; es gibt also keine Tabelle „welcher Kandidat erfüllt was“. Jeder Punkt verlinkt die Stelle in der App, an der er schon vorkommt.

1. Bei kleinen Energien und Krümmungen die ART reproduzieren.
2. In nahezu flacher Raumzeit die Quantenfeldtheorie reproduzieren.
3. Vorhersagekraft auch bei der Planck-Energie, wo die Kopplung α_G ~ (E/E_P)² aus Abschnitt 10 die Größenordnung 1 erreicht.
4. S_BH = k_B A/(4 l_P²) mikroskopisch erklären, mit der 1/4 (Frage 1).
5. Unitarität erhalten (Frage 3).
6. Etwas über die Singularitäten sagen: Urknall und das Innere Schwarzer Löcher.
7. Das Problem der Zeit lösen (Abschnitt 10).
8. Nichts verletzen, was gemessen ist, zum Beispiel:
   - keine energieabhängige Lichtgeschwindigkeit bis über die Planck-Energie (Gammablitz GRB 090510, Fermi 2009),
   - Äquivalenzprinzip auf etwa 10⁻¹⁵ (MICROSCOPE),
   - Gravitationswellen laufen mit c, auf etwa 10⁻¹⁵ genau (GW170817).
9. Möglichst testbar sein. Vorgeschlagen, noch nicht durchgeführt: Kann Gravitation zwei Massen verschränken?

Nicht zwingend, aber an derselben Schnittstelle: Λ (Frage 2). Ob eine Quantengravitation Λ erklären muss, ist selbst offen.

## Technik

- **Seiten:** `sectionPage`, `foldDeep` und `charBar` in `src/ui/theory.js` sind das Vorbild. Für ein zweites Themenfeld mit Seiten lohnt es sich, das Muster zu verallgemeinern statt es zu kopieren.
- **Experimente:**
  - reine Daten; neue Größen wie das Verhältnis in Frage 1 sind Formeln in den Daten;
  - Hilfsgrößen mit `aux`;
  - Modellgrenzen mit `why` und `on`, damit Schraffuren ihren Grund nennen;
  - Standardbereiche über `graph.view`.
- **Symbolkarten:** Der Schnittpunkt-Block (`src/ui/crossroads.js`) passt auch für andere Formeln, etwa ρ_Λ = Λc²/(8πG).
- **Prüfung:** Tests je Frage (siehe oben) in `tests/tests.js`, neue Seiten in `scripts/check-ui.js`.
- **Quellen:** im Tab „Quellen“, jede DOI über Crossref geprüft. Kandidaten:
  - Bekenstein 1973, Hawking 1975, Gibbons und Hawking 1977;
  - Page 1993, Wald 1993;
  - Planck 2018;
  - Fermi zu GRB 090510, LIGO/Virgo zu GW170817;
  - Molekül-Interferenz 2019.

## Kleinere offene Punkte

- Der Hawking-Block ist auf dem Handy sehr hoch.
- Tabs „Formel & Variablen“ und „Physik & Grenzen“: Fließtext bis 760 px breit, bei 14 px Schrift rund 110 Zeichen je Zeile. Auf breiten Bildschirmen bleibt rechts Fläche frei. Bei der Breiten-Anpassung bewusst nicht angefasst, weil die Spalte mit der Tab-Leiste fluchtet.
- Die Testseite ist eine lange, einspaltige Liste.
