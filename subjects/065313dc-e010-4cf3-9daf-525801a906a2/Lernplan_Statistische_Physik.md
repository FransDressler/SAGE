# Lernplan: Theoretische Physik 4A — Statistische Physik

*Basierend auf der Analyse von ~15 Altklausur-Protokollen (Alim, Brambilla, Garbrecht, Gerland, Kaiser, Knap, Knolle, Pollmann, Tancredi, Vairo, Weiler, Zacharias)*

---

## Prüfungsformat

Die Prüfung dauert ca. 30 Minuten und ist in **drei gleich gewichtete Blöcke** aufgeteilt: Statistische Physik, Thermodynamik und Quantenstatistik (je ~10 min). Der Fokus liegt auf **Verständnis**, nicht auf Herleitungen. Formeln sollten als Proportionalitäten bekannt sein — exakte Vorfaktoren sind weniger wichtig.

---

## Teil 1: Statistische Physik

### 1.1 Motivation & Grundidee ⭐ (kommt fast immer)
- **Warum statistische Physik?** Makroskopische Systeme mit N ≈ 10²³ Teilchen — Bewegungsgleichungen nicht lösbar, auch nicht von Interesse
- Übergang von mikroskopischen zu makroskopischen Größen durch Wahrscheinlichkeiten und Mittelwerte
- **Zeitmittel = Ensemblemittel** (Ergodenhypothese): Trajektorie kommt jedem Phasenraumpunkt beliebig nahe
- Liouville-Gleichung: Wahrscheinlichkeitsdichte konstant entlang Trajektorie

### 1.2 Statistische Ensembles ⭐ (kommt immer)

| Ensemble | System | Variablen | Potential | Zustandssumme |
|---|---|---|---|---|
| Mikrokanonisch | isoliert | E, V, N | Entropie S | Ω = Σ 1 (über Energieschale) |
| Kanonisch | geschlossen | T, V, N | Freie Energie F | Z = Σ exp(−βEᵣ) |
| Großkanonisch | offen | T, V, μ | Großkan. Pot. Φ | Z = Σ exp(−β(Eᵣ − μNᵣ)) |

- **Grundpostulat** (mikrokanonisch): Alle Mikrozustände gleichwahrscheinlich
- **Kanonisches Ensemble**: Boltzmann-Faktor als Gewichtung, Herleitung über System + Reservoir
- **Energie aus Zustandssumme**: U = −∂ln(Z)/∂β
- **Äquivalenz der Ensembles**: Relative Schwankung ΔE/⟨E⟩ ∝ 1/√N → verschwindet im thermodynamischen Limes

### 1.3 Wahrscheinlichkeitsverteilungen ⭐ (kommt sehr oft)
- **Binomialverteilung** (diskret): P(r,N) = C(N,r) · pʳ · (1−p)^(N−r) — z.B. Random Walk
- **Gaußverteilung**: Grenzwert der Binomialverteilung für großes N bei p = const (zentraler Grenzwertsatz)
- **Poissonverteilung**: Grenzwert wenn Np = const (eine Wahrscheinlichkeit dominiert, p ≪ 1)
- **Zentraler Grenzwertsatz**: Summe unabhängiger Zufallsvariablen → Gaußverteilung für N → ∞
- Gaußverteilung hat genau **zwei Momente**: Erwartungswert und Varianz

### 1.4 Ideales Gas & Reales Gas ⭐
- **Ideales Gas**: Keine Wechselwirkung, punktförmige Teilchen, pV = NkBT
- **Kalorische Zustandsgleichung**: E = (3/2)NkBT (volumenunabhängig!)
- **Reales Gas — Van-der-Waals-Gleichung**: p = kBT/(V−b) − a/V²
  - b = Kovolumen (Eigenvolumen der Moleküle, Hardcore-Potential)
  - a = Kohäsionsdruck (attraktive WW verringert Druck)
- **Virialentwicklung**: Systematische Entwicklung in der Dichte für schwache Wechselwirkungen
- **Lennard-Jones-Potential**: Beschreibt WW zwischen Molekülen (repulsiv bei kleinem r, attraktiv bei großem r)

### 1.5 Phasenübergänge & Kritischer Punkt
- **p-V-Diagramm realer Gase**: Isothermen für T > Tkrit, T = Tkrit, T < Tkrit
- Am kritischen Punkt: 1. und 2. Ableitung = 0 (Wendepunkt)
- Unterhalb Tkrit: Koexistenz zweier Phasen (Flüssigkeit/Gas)
- **Kritische Exponenten**: Universelles Verhalten am kritischen Punkt
- **Gesetz der korrespondierenden Zustände**: Mit reduzierten Variablen verhalten sich alle Gase gleich

---

## Teil 2: Thermodynamik

### 2.1 Hauptsätze der Thermodynamik ⭐ (kommt immer)

**0. Hauptsatz:** Wenn A im Gleichgewicht mit B und B im Gleichgewicht mit C, dann auch A mit C. → Definiert Temperatur als Zustandsgröße.

**1. Hauptsatz (Energieerhaltung):**
dE = δQ + δW (bzw. dE = δQ − δW je nach Konvention!)
- Energie kann nur durch Wärme oder Arbeit geändert werden

**2. Hauptsatz (Entropie):**
dS ≥ δQ/T
- Gleichheit für reversible Prozesse
- Ungleichheit für irreversible Prozesse
- Isoliertes System (δQ = 0): dS ≥ 0

**3. Hauptsatz:**
lim(T→0) S(T)/N = 0
- Entropiedichte geht gegen Null (Entartung des Grundzustands möglich!)
- Absoluter Nullpunkt ist nicht erreichbar

### 2.2 Zustandsgrößen vs. Prozessgrößen ⭐ (kommt sehr oft)
- **Zustandsgrößen**: Wegunabhängig, totales Differential existiert (T, S, p, V, E, ...)
- **Prozessgrößen**: Wegabhängig, kein totales Differential (δQ, δW)
- Temperatur T ist ein **integrierender Faktor**: macht aus δQ ein totales Differential dS = δQ/T

### 2.3 Thermodynamische Potentiale ⭐ (kommt sehr oft)
- Alle Potentiale enthalten die vollständige Information über das System
- Umrechnung durch **Legendretransformation**

| Potential | Differential | Natürliche Variablen |
|---|---|---|
| Innere Energie E | dE = TdS − pdV + μdN | S, V, N |
| Freie Energie F | dF = −SdT − pdV + μdN | T, V, N |
| Enthalpie H | dH = TdS + Vdp + μdN | S, p, N |
| Freie Enthalpie G | dG = −SdT + Vdp + μdN | T, p, N |
| Großkan. Pot. Φ | dΦ = −SdT − pdV − Ndμ | T, V, μ |

- **Warum nur 3 Variablen?** Die Zustandsgrößen sind über Zustandsgleichungen verknüpft (nicht alle unabhängig)
- **Warum verschiedene Potentiale?** Je nach Situation sind andere Variablen gegeben

### 2.4 Maxwell-Relationen ⭐ (kommt oft)
- Folgen aus der **Integrabilitätsbedingung** (Satz von Schwarz) der totalen Differentiale
- Beispiel für innere Energie: (∂T/∂V)_S = −(∂p/∂S)_V
- Verknüpfen verschiedene Zustandsgrößen miteinander

### 2.5 Carnot-Prozess & Kreisprozesse ⭐ (kommt fast immer)
- **Carnot-Prozess**: 4 Schritte — isotherme Expansion, adiabatische Expansion, isotherme Kompression, adiabatische Kompression
- **p-V-Diagramm**: Geschlossene Kurve (zeichnen können!)
- **T-S-Diagramm**: Rechteck (viel einfacher!) — Adiabaten sind vertikal (dS=0), Isothermen horizontal
- **Arbeit** = eingeschlossene Fläche im Diagramm
- **Wirkungsgrad**: η = W/Q_H = 1 − T_K/T_H
- **Carnot'sches Theorem**: Kein Wirkungsgrad kann höher sein als der des Carnot-Prozesses
- Beweis: Zusammenschalten einer beliebigen Maschine mit umgekehrter Carnot-Maschine + 2. Hauptsatz
- Rechts laufend = Wärmekraftmaschine, links laufend = Wärmepumpe

### 2.6 Freie Expansion (Gay-Lussac-Versuch)
- Gas expandiert in Vakuum (Box wird geöffnet)
- **Ideales Gas**: E = (3/2)NkBT → E unabhängig von V → Temperatur bleibt gleich
- **Reales Gas**: Kalorische Zustandsgl. hängt von V ab → Temperaturänderung

---

## Teil 3: Quantenstatistik

### 3.1 Wann braucht man Quantenstatistik? ⭐ (kommt immer)
- Wenn die **thermische Wellenlänge** λ = h/√(2πmkBT) in der Größenordnung des **mittleren Teilchenabstands** l = (1/ρ)^(1/3) liegt
- Das passiert bei: kleiner Masse m, niedriger Temperatur T, oder hoher Dichte ρ

### 3.2 Bosonen & Fermionen ⭐ (kommt immer)
- **Fermionen**: Antisymmetrische Wellenfunktion, halbzahliger Spin → Pauli-Prinzip (max. 1 Teilchen pro Zustand)
- **Bosonen**: Symmetrische Wellenfunktion, ganzzahliger Spin → Mehrfachbesetzung möglich
- Anzahl der Zustände (M Niveaus, N Teilchen):
  - Fermionen: M! / (N!(M−N)!)
  - Bosonen: (N+M−1)! / (N!(M−1)!)
  - Klassisch (mit Boltzmann-Zählung): M^N / N!

### 3.3 Besetzungszahlen ⭐ (Diagramm zeichnen können!)
- **Fermi-Dirac**: n(ε) = 1 / (exp(β(ε−μ)) + 1)
- **Bose-Einstein**: n(ε) = 1 / (exp(β(ε−μ)) − 1)
- **Maxwell-Boltzmann** (klassisch): n(ε) = exp(−β(ε−μ))
- Diagramm: ⟨N⟩ vs. (E−μ) für alle drei Verteilungen
- Für hohe T: Beide Quantenstatistiken → Maxwell-Boltzmann

### 3.4 Fermi-Gas ⭐
- **T = 0**: Alle Zustände bis zur Fermi-Energie besetzt (scharfe Fermikante)
- **T > 0**: Fermikante verschmiert (thermische Anregungen um kBT)
- **Wärmekapazität** C_V ∝ T (linear!) bei niedrigen T
  - Intuition: Nur Fermionen in der Schale ~kBT um die Fermi-Energie können angeregt werden
  - Hochtemperatur: C_V → (3/2)NkB (klassisches Dulong-Petit)
- **Fermi-Druck**: Auch bei T = 0 nicht verschwindender Druck (wegen Pauli-Prinzip)

### 3.5 Bose-Gas & Bose-Einstein-Kondensat ⭐
- Bei T < T_krit: Makroskopische Besetzung des Grundzustands → **Bose-Einstein-Kondensat**
- **Wärmekapazität**: C_V ∝ T^(3/2) unterhalb T_krit, dann Annäherung an (3/2)NkB
- Bei T_krit: Knick in C_V → Phasenübergang (C_V nicht differenzierbar)
- **Druck**: Im BEC-Bereich ist der Druck konstant (Grundzustandsteilchen tragen nicht bei)

### 3.6 Schwarzer Körper & Planck'sches Strahlungsgesetz ⭐ (kommt sehr oft)
- **Schwarzer Körper**: Absorbiert alle einfallende Strahlung, thermisches Gleichgewicht
- **Planck'sche Strahlungsformel (3D)**:
  u(ω) = (ℏ/π²c³) · ω³ / (exp(βℏω) − 1)
  - ω³ erklärt sich durch: ℏω (Photonenenergie) × ω² (aus Kugelkoordinaten/Zustandsdichte)
  - 1/(exp(βℏω)−1) = Bose-Einstein-Besetzungszahl (μ = 0 für Photonen)
- **1D-Version**: ω³ → ω (keine Integration über Kugeloberfläche)
- **Grenzfälle**:
  - Kleine ω (Rayleigh-Jeans): u ∝ ω² → divergiert für große ω (**UV-Katastrophe**)
  - Große ω (Wien): u ∝ exp(−βℏω)

### 3.7 Phononen & Wärmekapazität von Festkörpern
- Gitterschwingungen → 3N harmonische Oszillatoren (harmonische Näherung)
- **Debye-Modell**: C_V ∝ T³ bei niedrigen T
- **Hochtemperaturlimes**: Dulong-Petit C_V = 3NkB
- Mikroskopischer Unterschied Wärme vs. Arbeit: Wärme ändert Besetzungszahlen, Arbeit ändert Energieniveaus

### 3.8 Landau-Ginzburg-Theorie (selten, aber möglich)
- Beschreibt Phasenübergänge nahe des kritischen Punkts
- Entwicklung der freien Energie in **Ordnungsparametern** (z.B. Magnetisierung)
- Ginzburg-Landau: Räumlich variierende Ordnungsparameter (nicht Mean-Field)

---

## Prioritäten-Ranking

Die folgende Einteilung basiert auf der Häufigkeit in den Altklausuren:

**Muss sitzen (kommt fast immer):**
1. Warum stat. Physik? / Motivation
2. Die drei Ensembles (Variablen, Zustandssummen, Potentiale)
3. Binomial → Gauß / Poisson (Zusammenhänge!)
4. Alle vier Hauptsätze der Thermodynamik
5. Zustandsgrößen vs. Prozessgrößen
6. Thermodynamische Potentiale & Legendretransformation
7. Carnot-Prozess (p-V und T-S Diagramm + Wirkungsgrad)
8. Wann Quantenstatistik? (thermische Wellenlänge)
9. Besetzungszahlen (Diagramm zeichnen!)
10. Planck'sches Strahlungsgesetz (3D und 1D, Grenzfälle)

**Sollte sitzen (kommt oft):**
11. Maxwell-Relationen (eine herleiten können)
12. Ideales vs. reales Gas / Van-der-Waals
13. Wärmekapazität Fermi-Gas (linear in T) und Bose-Gas (T^3/2)
14. Bose-Einstein-Kondensat
15. Carnot'sches Theorem (Beweis-Idee)
16. Freie Expansion / Gay-Lussac

**Gut zu wissen (kommt gelegentlich):**
17. Virialentwicklung
18. Kritische Exponenten / korrespondierende Zustände
19. Phononen / Debye-Modell
20. Landau-Ginzburg-Theorie

---

## Empfohlene Lernstrategie (aus den Protokollen)

- **Zeitrahmen**: 1.5–2 Wochen intensiv
- **Methode**: Skript als Karteikarten zusammenfassen, dann auswendig lernen
- **Literatur**: Vorlesungsskript + "Einführung in die statistische Physik" von Kerson Huang (kurz und prägnant)
- **Fokus**: Verständnis > Formeln. Proportionalitäten kennen, exakte Vorfaktoren weniger wichtig
- **Diagramme üben**: Besetzungszahlen, Carnot (p-V und T-S), Wärmekapazitäten, p-V realer Gase
- **Altklausuren durchgehen**: Wiederkehrende Fragen identifizieren und Antworten vorbereiten
