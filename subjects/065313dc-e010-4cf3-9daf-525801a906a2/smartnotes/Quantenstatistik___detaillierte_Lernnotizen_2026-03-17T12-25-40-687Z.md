# Quantenstatistik – detaillierte Lernnotizen

## 1) Motivation und Einordnung in die Statistische Physik

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-04_741_1634_427_369.jpg)

### 1.1 Warum überhaupt (Quanten‑)Statistik bei Vielteilchensystemen?
In makroskopischer Materie sind typischerweise $N\sim 10^{23}$ Teilchen beteiligt. Selbst wenn man die **Mikrodynamik** exakt kennt (klassisch: Hamilton-Gleichungen, quantenmechanisch: Schrödingergleichung), ist eine vollständige Beschreibung über Einzeldetails praktisch und konzeptionell unmöglich:

- **Komplexität des Zustandsraums**
  - Klassisch: Phasenraumdimension $6N$ (3 Orts- + 3 Impulskoordinaten pro Teilchen).
  - Quantenmechanisch: Zustandsraum wächst exponentiell; viele Teilchen $\Rightarrow$ astronomisch große Hilberträume.
- **Empfindlichkeit gegenüber Anfangsbedingungen / chaotische Dynamik**
  - Schon minimale Unsicherheiten in Anfangsbedingungen führen zu völlig verschiedenen Trajektorien.
- **Messbare Größen sind makroskopisch und robust**
  - Beobachtbar sind i.d.R. **gemittelte** Größen (z. B. Teilchenzahl in einem Volumen, Energie, Dichte, Spektren), nicht die Bahn jedes Teilchens.

**Kernidee:** Man ersetzt die Beschreibung einzelner Trajektorien (oder einer einzelnen Wellenfunktion im riesigen Vielteilchenraum) durch eine Beschreibung über **Wahrscheinlichkeiten** über viele kompatible Mikrozustände (**Ensembles**). Physikalische Vorhersagen sind dann **Ensemblemittelwerte**.

---

### 1.2 Quantenstatistik: Was ist der spezifische „quantum“ Anteil?
Quantenstatistik ist der Teil der statistischen Beschreibung, der zwingend wird, wenn:

1. **Zustände quantisiert** sind (diskrete Niveaus, Besetzungszahlen),
2. Teilchen **ununterscheidbar** sind,
3. die Vielteilchen-Wellenfunktion unter Teilchenaustausch eine feste Symmetrie besitzt:
   - **Bosonen**: symmetrisch $\Rightarrow$ Bose-Einstein-Statistik
   - **Fermionen**: antisymmetrisch $\Rightarrow$ Fermi-Dirac-Statistik und **Pauli-Prinzip**

Diese Punkte ändern nicht nur Details, sondern erzeugen qualitativ neue kollektive Phänomene (siehe unten).

---

### 1.3 Warum Ensembles statt „einzelner Trajektorien“ (quantum und praktisch)?
In der Quantenmechanik ist eine „Trajektorie“ ohnehin nicht fundamental. Stattdessen arbeitet man mit:

- **Energieeigenzuständen** $|r\rangle$ (mit Energien $E_r$) und deren Wahrscheinlichkeiten.
- **Dichtematrix** $\rho$ für gemischte Zustände (praktisch unvermeidlich bei makroskopischen Systemen).

**Typische Ensemblemittelwerte**
für Observablen $A$ sind
$$
\langle A\rangle=\mathrm{Tr}(\rho A).
$$

In vielen Situationen kann man die Wahrscheinlichkeiten über ein Ensemble parametrisieren (z. B. über $T,\mu,V$) und erhält so direkt mittlere Besetzungszahlen, Energien, Fluktuationen etc., ohne die mikroskopische Zeitentwicklung im Detail zu lösen.

---

### 1.4 Abgrenzung: klassischer Grenzfall vs. quantenstatistische Notwendigkeit
Quantenstatistik „reduziert“ sich im geeigneten Grenzfall zur klassischen Maxwell-Boltzmann-Statistik (MB). Die zentrale Kontrollgröße ist die **quantum degeneracy**: Überlappen die Materiewellen stark oder nicht?

#### Thermische de-Broglie-Wellenlänge
$$
\lambda_{\mathrm{th}}=\frac{h}{\sqrt{2\pi m k_B T}}.
$$

#### Degenerationsparameter
$$
n\lambda_{\mathrm{th}}^{3}\,,
$$
mit Teilchendichte $n=N/V$.

- **Klassischer Grenzfall (MB gültig):**
  $$
  n\lambda_{\mathrm{th}}^{3}\ll 1
  $$
  Teilchen sind effektiv unterscheidbar, Austauschprozesse sind unwichtig.
- **Quantenregime (FD/BE nötig):**
  $$
  n\lambda_{\mathrm{th}}^{3}\gtrsim 1
  $$
  Ununterscheidbarkeit und Austausch-Symmetrie dominieren die Statistik.

**Beispiele (Faustbilder):**
- Heißes, verdünntes Gas $\Rightarrow$ MB oft ausreichend.
- Elektronen in Metallen bei Raumtemperatur: trotz $T\approx 300\,$K stark quantendegeneriert, weil $n$ groß und $m$ klein $\Rightarrow$ **Fermi-Statistik zwingend**.
- Ultrakalte atomare Gase ($T$ im nK–$\mu$K Bereich): $\lambda_{\mathrm{th}}$ groß $\Rightarrow$ **Bose-Kondensation** oder **Fermi-Entartung**.

**Edge case:** Quantenstatistik kann relevant sein, obwohl $T$ nicht „sehr klein“ ist, wenn $n$ extrem groß ist (z. B. Elektronen in Festkörpern, dichte astrophysikalische Materie).

---

### 1.5 Zentrale quantenstatistische Phänomene (warum MB versagt)

#### (A) Entartung (Degeneracy) und Fermi-Energie
Für Fermionen führt das Pauli-Prinzip dazu, dass Zustände bis zur **Fermi-Energie** $E_F$ bei $T\to 0$ aufgefüllt werden. Viele Eigenschaften (z. B. Elektronengas in Metallen) werden dadurch bestimmt, nicht durch $k_B T$.

- **Wesentliche Konsequenz:** Auch bei niedriger Anregung sind nicht „alle“ Teilchen thermisch aktiv; nur Zustände nahe $E_F$ tragen bei (z. B. zu Wärmekapazität, Transport).

#### (B) Pauli-Prinzip (Fermi-Dirac)
- Pro Einteilchenzustand gilt für Fermionen:
  $$
  n_i\in\{0,1\}.
  $$
- **Physikalische Folgen:**
  - Stabilität der Materie (Elektronen können nicht alle in den Grundzustand kollabieren).
  - **Entartungsdruck** (z. B. in Weißen Zwergen, Neutronensternen; Konzeptuell: Druck ohne „thermische“ Bewegung im klassischen Sinn).
  - Struktur der Elektronenschalen in Atomen (als quantenstatistisches Besetzungsproblem).

#### (C) Bose-Einstein-Kondensation (BEC) und makroskopische Besetzung
Für Bosonen gilt:
$$
n_i\in\{0,1,2,\dots\}.
$$
Bei genügend großer Dichte/kleinem $T$ kann der Grundzustand makroskopisch besetzt werden:
- **BEC:** Viele Teilchen teilen sich denselben Quantenzustand.
- **Konsequenzen:** Superfluidität (z. B. $^4$He), kohärente Materiewellen in ultrakalten Gasen.

#### (D) Schwarzkörperstrahlung / Planck-Spektrum (Photonen als Bosonen)
Photonen haben keine Teilchenzahlerhaltung $\Rightarrow$ chemisches Potential $\mu=0$; die richtige Strahlungsverteilung folgt nur aus Bose-Statistik und Quantisierung:
- Klassische Vorhersage (Rayleigh-Jeans) liefert UV-Katastrophe.
- Quantenstatistik (Planck) behebt dies durch diskrete Energiepakete $\hbar\omega$ und Bose-Besetzung.

---

### 1.6 Einordnung über Besetzungszahlen: die Kernformeln (Überblick)
In Quantenstatistik wird Vielteilchenphysik oft als **Besetzungsproblem** von Einteilchenzuständen $i$ mit Energie $\varepsilon_i$ formuliert. Die mittlere Besetzung lautet im großkanonischen Formalismus:

$$
\bar n_i=\frac{1}{\exp(\beta(\varepsilon_i-\mu))\pm 1},
$$

- **Fermi-Dirac (Fermionen):** Pluszeichen $+$ im Nenner
  $$
  \bar n_i=\frac{1}{\exp(\beta(\varepsilon_i-\mu))+1}.
  $$
- **Bose-Einstein (Bosonen):** Minuszeichen $-$ im Nenner
  $$
  \bar n_i=\frac{1}{\exp(\beta(\varepsilon_i-\mu))-1}.
  $$

**Klassischer Grenzfall (Maxwell-Boltzmann)**
wenn $\exp(\beta(\varepsilon_i-\mu))\gg 1$:
$$
\bar n_i \approx \exp(-\beta(\varepsilon_i-\mu)).
$$

**Merke (Edge case bei Bosonen):** Für Bose-Gase muss $\mu\le \varepsilon_0$ gelten (sonst Divergenz), und nahe $\mu\to \varepsilon_0$ kann BEC auftreten.

---

### 1.7 Typische Systeme, die quantenstatistisch behandelt werden müssen
| System | Teilchentyp | Warum Quantenstatistik? | Typische Effekte |
|---|---|---|---|
| Elektronen in Metallen | Fermionen | hohe Dichte $\Rightarrow n\lambda_{\mathrm{th}}^3\gg 1$ | Fermi-See, Pauli-Blockierung |
| Neutronensternmaterie | Fermionen | extreme Dichten | Entartungsdruck |
| Photonen (Strahlung) | Bosonen | $\mu=0$, Quantisierung essenziell | Planck-Spektrum |
| Phononen/Magnonen (Quasiteilchen) | Bosonen | kollektive Moden quantisiert | Bose-Besetzung, Wärmetransport |
| Ultrakalte Atome | Bosonen/Fermionen | $\lambda_{\mathrm{th}}$ groß | BEC / Fermi-Entartung |
| Helium-4 / Helium-3 | Boson/Fermion | Quantenflüssigkeit | Superfluidität (unterschiedliche Mechanismen) |

---

### 1.8 Grenzen und „Randfälle“ (wann Quantenstatistik *nicht* die Hauptrolle spielt)
- **Hohe Temperaturen und/oder geringe Dichten:** $n\lambda_{\mathrm{th}}^3\ll 1$ $\Rightarrow$ MB-Approximation genügt.
- **Starke Wechselwirkungen:** Quantenstatistik bleibt formal gültig, aber einfache Idealgas‑Formeln (freie Fermionen/Bosonen) reichen nicht aus; dennoch sind **Pauli-Prinzip** bzw. **Bose-Symmetrie** weiterhin strukturbestimmend.
- **Ununterscheidbarkeit vs. effektive Unterscheidbarkeit:** In manchen Situationen (z. B. lokalisierte Teilchen in tiefen Potentialmulden) kann Austausch stark unterdrückt sein; dann nähert man sich wieder klassischem Verhalten, obwohl das System quantenmechanisch ist.

---

### 1.9 Quintessenz (für die Quantenstatistik)
- Quantenstatistik ist die statistische Beschreibung **ununterscheidbarer** Vielteilchensysteme mit **Boson-/Fermion-Symmetrie**.
- Sie wird unvermeidlich im **degenerierten Regime** $n\lambda_{\mathrm{th}}^3\gtrsim 1$.
- Die zentralen „Zwangsphänomene“ sind:
  - **Pauli-Prinzip** $\Rightarrow$ Fermi-Entartung, Fermi-See, Entartungsdruck
  - **Bose-Verstärkung** $\Rightarrow$ Bose-Einstein-Kondensation, kohärente makroskopische Zustände
  - **Quantisierung** + **Bose-Statistik** für Photonen $\Rightarrow$ Planck-Spektrum statt klassischer Katastrophen

## 2) Kriterium für Quantenstatistik: thermische Wellenlänge und Entartungsparameter

### Motivation: Wann „muss“ man Quantenstatistik verwenden?
In einem verdünnten, warmen Gas kann man Teilchen oft als **unterscheidbare** klassische Punkte behandeln (Maxwell–Boltzmann). Quantenstatistik (Bose–Einstein / Fermi–Dirac) wird notwendig, sobald die **räumliche Ausdehnung der Einteilchen-Wellenfunktionen** mit dem **mittleren Teilchenabstand** vergleichbar wird: Dann überlappen Wellenfunktionen, und **(Un-)Unterscheidbarkeit** sowie **(Anti-)Symmetrisierung** der Vielteilchen-Wellenfunktion werden physikalisch relevant.

Zur Erinnerung an die unterschiedlichen Verteilungsfunktionen:
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-30_306_656_311_1650.jpg)

(Fermionen: Fermi-Kante bei $T=0$ und Aufweitung bei $T>0$)
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-30_280_673_730_1641.jpg)

---

### Thermische Wellenlänge $\lambda_T$ als temperaturabhängige Längenskala

#### Herleitung (physikalische Abschätzung)
- Ein Teilchen im thermischen Gleichgewicht hat typischerweise Impulsgröße
  $$
  p_\text{th}\sim \sqrt{m k_B T}
  $$
  (bis auf Faktoren der Ordnung 1).
- Zu einem Impuls gehört eine de-Broglie-Wellenlänge
  $$
  \lambda \sim \frac{h}{p}.
  $$
- Daraus folgt eine charakteristische Längenskala der Quantenunschärfe/Wellennatur:
  $$
  \lambda_T \propto \frac{h}{\sqrt{m k_B T}}.
  $$

**Standarddefinition (in der Quantenstatistik besonders praktisch):**
$$
\boxed{\lambda_T=\frac{h}{\sqrt{2\pi m k_B T}}}
$$

**Bedeutung der Parameterabhängigkeit:**
- $\lambda_T\propto T^{-1/2}$: **Je kälter**, desto größer die Wellenpakete $\Rightarrow$ mehr Überlappung $\Rightarrow$ Quantenstatistik.
- $\lambda_T\propto m^{-1/2}$: **Je leichter** die Teilchen (z.B. Elektronen), desto größer $\lambda_T$ bei gegebener Temperatur.

#### Interpretationen von $\lambda_T$
- **Räumliche Ausdehnung** eines „thermischen“ Wellenpakets.
- **Zellgröße im Phasenraum**: In der Zustandssumme klassischer Teilchen taucht $\lambda_T$ als Normierung auf; grob entspricht $\lambda_T^3$ dem **„effektiven Volumen pro Quantenzustand“** im Ortsraum (genauer: über die Phasenraumzellgröße $h^3$).

---

### Überlappungskriterium und mittlerer Teilchenabstand

#### Mittlerer Teilchenabstand
Für Teilchendichte $n$ (Anzahl pro Volumen) ist der typische mittlere Abstand
$$
\ell \sim n^{-1/3}.
$$

#### Überlappungskriterium
- **Klassischer Grenzfall**: Wellenfunktionen überlappen kaum
  $$
  \lambda_T \ll \ell.
  $$
- **Quantenstatistischer Bereich**: deutlicher Überlapp
  $$
  \lambda_T \gtrsim \ell.
  $$

Diese Formulierung ist äquivalent zum Entartungsparameter (nächster Abschnitt).

---

### Entartungsparameter $n\lambda_T^3$ (dimensionsloses Kriterium)

#### Definition und Kernkriterium
Setzt man $\ell\sim n^{-1/3}$ in $\lambda_T \gtrsim \ell$ ein, erhält man:
$$
\lambda_T \gtrsim n^{-1/3}
\quad\Longleftrightarrow\quad
n\lambda_T^3 \gtrsim 1.
$$

**Entartungsparameter:**
$$
\boxed{\;\;n\lambda_T^3\;\;}
$$

**Interpretation:**
- $n\lambda_T^3$ ist grob die **Zahl der Teilchen in einem Volumen $\lambda_T^3$** (also im „Quantenvolumen“ eines thermischen Wellenpakets).
- Alternativ: Maß dafür, ob die Besetzung von Einteilchenzuständen so hoch ist, dass **Quantensymmetrie** (Bose/Fermi) spürbar wird.

#### Regime
- **Klassisch (Maxwell–Boltzmann gültig):**
  $$
  \boxed{n\lambda_T^3\ll 1}
  $$
  - Teilchen sind effektiv unterscheidbar, Quantenstatistik-Korrekturen klein.
- **Quantenstatistisch (Bose–Einstein / Fermi–Dirac nötig):**
  $$
  \boxed{n\lambda_T^3\gtrsim 1}
  $$
  - Überlapp groß, (Anti-)Symmetrisierung entscheidend.
  - Für Bosonen kann dann BEC-Nähe relevant werden; für Fermionen tritt starke Entartung/Pauli-Blocking auf.

---

### Typische Größenordnungen (Beispiele)

> In allen Beispielen ist $n$ die Teilchendichte in $\mathrm{m^{-3}}$, und $\lambda_T=\frac{h}{\sqrt{2\pi m k_B T}}$.

#### Übersichtstabelle: Größenordnungen von $n\lambda_T^3$
| System | typische Parameter | typische $\lambda_T$ | typisches $n\lambda_T^3$ | Regime |
|---|---:|---:|---:|---|
| Luft (N$_2$/O$_2$) bei Raumtemp. | $T\sim 300\,\mathrm{K}$, $n\sim 2{,}5\times 10^{25}$ | $\sim 10^{-11}\,\mathrm{m}$ | $\sim 10^{-8}$ bis $10^{-7}$ | klar klassisch |
| Verdünntes Gas im Hochvakuum | $T\sim 300\,\mathrm{K}$, $n\ll 10^{20}$ | $\sim 10^{-11}\,\mathrm{m}$ | $\ll 10^{-12}$ | extrem klassisch |
| Leitungselektronen in Metallen | $T\sim 300\,\mathrm{K}$, $n\sim 10^{28}$ | $\sim \text{nm}$ | $\gg 1$ | stark quantenstatistisch (Fermi-Gas) |
| Ultrakalte Atome (BEC/Fermi-Gas) | $T\sim 10^{-6}\,\mathrm{K}$, $n\sim 10^{19}$–$10^{21}$ | $\sim 10^{-6}\,\mathrm{m}$ | $\sim 1$ bis $\gg 1$ | Quantenstatistik dominiert |

---

### Ausgerechnete Beispielabschätzungen (mit Zahlen)

#### 1) „Normales“ Gas (z.B. Luft) bei $T=300\,\mathrm{K}$
- Molekülmasse grob $m\sim 5\times 10^{-26}\,\mathrm{kg}$ (z.B. N$_2$).
- Dichte bei 1 bar: $n\sim 2{,}5\times 10^{25}\,\mathrm{m^{-3}}$.
- Thermische Wellenlänge:
  $$
  \lambda_T=\frac{h}{\sqrt{2\pi m k_B T}}
  \approx \frac{6{,}63\times 10^{-34}}{\sqrt{2\pi\,(5\times10^{-26})\,(1{,}38\times10^{-23})\,300}}
  \sim 6\times 10^{-12}\,\mathrm{m}.
  $$
- Entartungsparameter:
  $$
  n\lambda_T^3\sim 2{,}5\times 10^{25}\,(6\times 10^{-12})^3
  \sim 5\times 10^{-8}\ll 1.
  $$
**Folge:** Maxwell–Boltzmann ist ausgezeichnet.

**Edge case:** Selbst wenn man auf sehr hohe Dichten geht (z.B. nahe Flüssigkeiten), ist bei schweren Molekülen meist weiterhin $T$ nicht klein genug; Quantenstatistik wird dort eher durch andere Physik überlagert (Bindung/Wechselwirkungen). Für das reine „ideale Gas“-Bild bleibt: bei Raumtemperatur klassisch.

---

#### 2) Elektronengas (Leitungselektronen im Metall)
- Elektronenmasse $m_e=9{,}11\times 10^{-31}\,\mathrm{kg}$, $T\sim 300\,\mathrm{K}$.
- Typische Elektronendichte: $n\sim 10^{28}\,\mathrm{m^{-3}}$.
- Thermische Wellenlänge:
  $$
  \lambda_T \approx \frac{6{,}63\times10^{-34}}{\sqrt{2\pi\,(9{,}11\times10^{-31})\,(1{,}38\times10^{-23})\,300}}
  \sim 4\times 10^{-9}\,\mathrm{m}\;(\text{einige nm}).
  $$
- Entartungsparameter:
  $$
  n\lambda_T^3\sim 10^{28}\,(4\times10^{-9})^3\sim 6\times 10^{2}\gg 1.
  $$
**Folge:** Stark entartetes **Fermi-System**; klassische Statistik ist selbst bei Raumtemperatur völlig ungeeignet.

**Wichtige Nuance (Edge case):** Bei Fermionen ist das „richtige“ Maß für Entartung oft auch $T/T_F$ (Fermi-Temperatur). Metalle haben typischerweise $T_F\sim 10^4$–$10^5\,\mathrm{K}$, also $T\ll T_F$, was die starke Entartung konsistent erklärt. Das Kriterium $n\lambda_T^3\gtrsim 1$ liefert hier die gleiche qualitative Aussage.

---

#### 3) Ultrakalte atomare Gase (BEC / entartetes Fermi-Gas)
Typisch: $n\sim 10^{20}\,\mathrm{m^{-3}}$ (stark verdünnt im Vergleich zu Luft!), aber extrem kleine $T$.

- Nehmen wir $^{87}$Rb: $m\approx 1{,}44\times 10^{-25}\,\mathrm{kg}$, $T=1\,\mu\mathrm{K}=10^{-6}\,\mathrm{K}$.
- Thermische Wellenlänge:
  $$
  \lambda_T \approx \frac{6{,}63\times10^{-34}}{\sqrt{2\pi\,(1{,}44\times10^{-25})\,(1{,}38\times10^{-23})\,10^{-6}}}
  \sim 2\times 10^{-7}\,\mathrm{m}\;(0{,}2\,\mu\mathrm{m}).
  $$
- Entartungsparameter:
  $$
  n\lambda_T^3\sim 10^{20}\,(2\times10^{-7})^3\sim 0{,}8\sim \mathcal{O}(1).
  $$
**Folge:** Genau im Übergangsbereich zur Quantenstatistik; bei etwas höherem $n$ oder kleinerem $T$ wird $n\lambda_T^3\gg 1$ und Bose-/Fermi-Entartung klar sichtbar.

**Edge case:** Obwohl das Gas sehr verdünnt ist, erzwingt die kleine Temperatur die Quantenstatistik. Das zeigt: **hohe Dichte ist nicht nötig**, wenn $T$ extrem klein ist.

---

### Praktische Merksätze und typische Fallen

- **Merksatz 1:** Quantenstatistik wird wichtig, wenn **mindestens eines** gilt:
  - $T$ sehr klein,
  - $m$ sehr klein,
  - $n$ sehr groß.
- **Merksatz 2 (einzeilig):**
  $$
  \boxed{\text{Klassisch: } n\lambda_T^3\ll 1 \qquad\text{Quanten: } n\lambda_T^3\gtrsim 1}
  $$
- **Falle:** Das Kriterium ist für **(nahezu) ideale** Gase gedacht. Bei sehr hoher Dichte können **Wechselwirkungen** dominieren; dennoch bleibt $n\lambda_T^3$ das Standardmaß, ob **Austausch-/Symmetrieeffekte** relevant sind.
- **Falle bei Fermionen:** Auch wenn $n\lambda_T^3\gtrsim 1$, ist das System nicht automatisch „exotisch“ — für Elektronen in Festkörpern ist das der Normalfall; die Quantenstatistik bildet dort die Baseline.

## 3) Mikrozustände, Ununterscheidbarkeit und Zählstatistik

### 3.1 Mikrozustände in der Quantenstatistik: Zustände vs. Besetzungen
In der Quantenstatistik werden Mikrozustände (Vielteilchenzustände) am saubersten über **Besetzungszahlen** beschrieben:

- Es gebe **Einteilchenzustände** (single-particle states) $i=1,\dots,M$ mit Energien $\varepsilon_i$ (ggf. inkl. Entartung).
- Ein Vielteilchen-Mikrozustand wird dann durch ein **Besetzungszahlen-Set** beschrieben:
  $$
  \{n_i\}_{i=1}^M,\qquad n_i\in\mathbb{N}_0,\qquad \sum_{i=1}^M n_i = N.
  $$
- Physikalischer Makrozustand im Sinne der Quantenstatistik (hier ohne Thermodynamik): häufig ist die relevante Information **nur** die Verteilung $\{n_i\}$, nicht „welches Teilchen ist wo“.

Wichtig: Ob jede Besetzungszahl-Konfiguration erlaubt ist, entscheidet die **Teilchenart** (Bosonen/Fermionen) über das **Symmetrieprinzip**.

---

### 3.2 Prinzip der Ununterscheidbarkeit identischer Teilchen
**Identische Quantenobjekte** (gleiche Masse, Ladung, Spin, etc.) sind **ununterscheidbar**: Vertauscht man zwei Teilchenlabels, entsteht **kein neuer physikalisch unterscheidbarer Zustand**.

Formal: Für $N$ Teilchen und Permutationsoperator $P$ (Permutation der Teilchenlabels) gilt für die Vielteilchenwellenfunktion $\Psi$:

- **Bosonen (symmetrisch)**:
  $$
  P\,\Psi = +\,\Psi
  $$
- **Fermionen (antisymmetrisch)**:
  $$
  P\,\Psi = \mathrm{sgn}(P)\,\Psi
  $$
  insbesondere beim Tausch zweier Teilchen: $\Psi(\dots,x_i,\dots,x_j,\dots)=-\Psi(\dots,x_j,\dots,x_i,\dots)$.

**Konsequenz (Pauli-Prinzip):** Für Fermionen kann kein Einteilchenzustand doppelt besetzt sein:
$$
n_i\in\{0,1\}\quad\text{(Fermionen)}.
$$
Für Bosonen gilt dagegen:
$$
n_i\in\{0,1,2,\dots\}\quad\text{(Bosonen)}.
$$

---

### 3.3 Rolle von Permutationen: Warum „klassische“ Zählung überzählt
Wenn man Teilchen **künstlich labelt** (klassische Vorstellung „Teilchen 1, 2, …, N“), dann führt eine Verteilung der Teilchen auf Zustände zu vielen scheinbar verschiedenen Mikrozuständen, die sich **nur durch Permutation** der Labels unterscheiden.

- Anzahl der Permutationen der $N$ Labels: $N!$.
- Bei identischen Teilchen sind diese Permutationen **nicht** physikalisch unterscheidbar (in der QM werden sie über Symmetrisierung/Antisymmetrisierung zusammengefasst).

**Merksatz:**  
- *Distinguishable counting* zählt **Zuordnungen** Teilchen $\to$ Zustände.  
- Quantenstatistik zählt **Besetzungsmuster** (mit Symmetrieeinschränkungen).

---

### 3.4 Vergleich der Zählstatistiken (M Zustände, N Teilchen)

Wir betrachten nur die reine kombinatorische Frage: *Wie viele Vielteilchenzustände gibt es, wenn $N$ Teilchen auf $M$ Einteilchenzustände verteilt werden?* (keine Energiegewichtung).

| Statistik / Teilchentyp | Ununterscheidbarkeit | Zulässige Besetzungen $n_i$ | Anzahl der Mikrozustände $W(M,N)$ |
|---|---:|---:|---:|
| **klassisch (distinguishable)** | nein (Labels) | $n_i\ge 0$ (keine Einschr.) | $M^N$ |
| **Maxwell–Boltzmann korrekt (Gibbs-Korrektur)** | effektiv ja | $n_i\ge 0$ | $\dfrac{M^N}{N!}$ (als Korrektur der Überzählung) |
| **Bose–Einstein (Bosonen)** | ja | $n_i\in\mathbb{N}_0$ | $\dbinom{N+M-1}{N}=\dfrac{(N+M-1)!}{N!(M-1)!}$ |
| **Fermi–Dirac (Fermionen)** | ja | $n_i\in\{0,1\}$ | $\dbinom{M}{N}=\dfrac{M!}{N!(M-N)!}$ (für $N\le M$, sonst $0$) |

#### Herleitungen (kurz, aber zentral)

**(a) Distinguishable: $M^N$**  
Jedes der $N$ gelabelten Teilchen kann unabhängig einen von $M$ Zuständen einnehmen $\Rightarrow M\cdot M\cdots M = M^N$.

**(b) Bose: „stars and bars“**  
Gesucht: Anzahl nichtnegativer Lösungen von $\sum_{i=1}^M n_i=N$.  
Mit $N$ „Sternen“ und $M-1$ Trennstrichen:
$$
W_{\mathrm{BE}} = \binom{N+M-1}{N}.
$$

**(c) Fermi:**  
Besetzungen sind binär ($0/1$). Man wählt aus $M$ Zuständen genau $N$ aus, die besetzt sind:
$$
W_{\mathrm{FD}}=\binom{M}{N}.
$$

---

### 3.5 Gibbs-Korrektur: Bedeutung und Grenze (Quantenbezug)
In vielen Rechnungen (insbesondere in Näherungen) taucht die **Gibbs-Korrektur** als Division durch $N!$ auf:
$$
W_{\text{MB,korr}} \sim \frac{W_{\text{klassisch}}}{N!}.
$$`

Interpretation im Kontext der Ununterscheidbarkeit:
- Die klassische Zählung mit Labels **überzählt** um die $N!$ möglichen Permutationen der Teilchen.
- Die Division durch $N!$ korrigiert diese Überzählung, wenn die Zustände so besetzt sind, dass Austausch praktisch nicht auflösbar ist (klassische Grenze geringer Besetzung pro Zustand).

**Wichtig (Edge Case / Fallstrick):**  
Die Gibbs-Korrektur allein macht aus klassischer Zählung **nicht** automatisch Bose- oder Fermi-Statistik, denn:
- Sie implementiert keine **Symmetrisierung/Antisymmetrisierung**.
- Sie erzwingt weder $n_i\le 1$ (Pauli) noch die bosonische Austauschkorrelation.
- Sie ist eine **Näherung** zur ununterscheidbaren MB-Grenze, während BE/FD echte quantenmechanische Zählungen sind.

---

### 3.6 Symmetrisierung/Antisymmetrisierung: von „Produktzuständen“ zu erlaubten Vielteilchenzuständen

#### (a) Ausgangspunkt: Produktzustände mit Labels
Ein naiver (gelabelter) Produktzustand für zwei Teilchen in Einteilchenzuständen $a,b$ wäre:
$$
|a\rangle_1|b\rangle_2.
$$

#### (b) Bosonen: symmetrische Kombination
Physikalischer Zustand (bis Normierung):
$$
|a,b\rangle_S \propto |a\rangle_1|b\rangle_2 + |b\rangle_1|a\rangle_2.
$$
- Falls $a=b$: der Zustand ist erlaubt und entspricht Doppelbesetzung.

#### (c) Fermionen: antisymmetrische Kombination (Slater-Determinante)
$$
|a,b\rangle_A \propto |a\rangle_1|b\rangle_2 - |b\rangle_1|a\rangle_2.
$$
- Falls $a=b$, dann ist
  $$
  |a,a\rangle_A = 0,
  $$
  also **verboten** $\Rightarrow$ Pauli-Prinzip.

---

### 3.7 Beispiele und „Edge Cases“

#### Beispiel 1: $N=2$ Teilchen, $M=2$ Zustände ($\{1,2\}$)
- **Distinguishable:** $M^N=2^2=4$:  
  $(1,1),(1,2),(2,1),(2,2)$ (als Zuordnung „Teilchen 1/2“).
- **Bosonen:** $\binom{2+2-1}{2}=\binom{3}{2}=3$:  
  Besetzungen: $(n_1,n_2)=(2,0),(1,1),(0,2)$.
- **Fermionen:** $\binom{2}{2}=1$:  
  Nur $(1,1)$ (je ein Teilchen pro Zustand); Doppelbesetzung verboten.

#### Beispiel 2: Fermionen mit $N>M$
Wenn $N>M$, dann
$$
W_{\mathrm{FD}}=\binom{M}{N}=0.
$$
Interpretation: Es gibt zu wenige Einteilchenzustände, um alle Fermionen unter Pauli unterzubringen.

#### Beispiel 3: Entartung / Spin als zusätzliche Zustände
Häufig sind „Zustände“ in $M$ so zu verstehen, dass **Spin** bereits enthalten ist.  
Hat ein Orbital $g$-fache Entartung, dann zählt es effektiv als $g$ verschiedene Einteilchenzustände.

- Für Elektronen: typischerweise $g=2$ (Spin $\uparrow,\downarrow$) pro räumlichem Orbital.  
  Dann ist „Doppelbesetzung“ eines Orbitals möglich, aber nur als Besetzung von **zwei verschiedenen Spin-Zuständen**; für jeden Spin-Zustand gilt weiter $n\in\{0,1\}$.

#### Beispiel 4: Klassische Grenze (Übergang zu Maxwell–Boltzmann)
In der **dünn besetzten** Grenze (mittlere Besetzung pro Zustand $\ll 1$) nähern sich BE und FD der MB-Statistik an. Intuitiv:
- Wenn praktisch nie zwei Teilchen denselben Einteilchenzustand beanspruchen, spielt „Mehrfachbesetzung“ (Bosonen) bzw. „Ausschluss“ (Fermionen) kaum eine Rolle.
- Austauschkorrelationen werden vernachlässigbar.

(Die zugehörigen Kurven/Verteilungen werden typischerweise so illustriert:)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-30_306_656_311_1650.jpg)

---

### 3.8 Zusammenhang: Zählstatistik $\Rightarrow$ Besetzungsstatistiken (konzeptionell)
Die unterschiedlichen **Besetzungsstatistiken** (BE/FD/MB) folgen im Kern aus zwei Zutaten:

1. **Ununterscheidbarkeit**: Mikrozustände entsprechen Besetzungen $\{n_i\}$ statt Teilchenzuordnungen.  
2. **Symmetrieklasse** unter Permutationen:
   - Bosonen: symmetrische Vielteilchenzustände $\Rightarrow$ $n_i$ unbegrenzt.
   - Fermionen: antisymmetrische Vielteilchenzustände $\Rightarrow$ $n_i\le 1$.

Damit ist die kombinatorische Basis gelegt, aus der später (über geeignete Ensembles) die bekannten mittleren Besetzungszahlen resultieren:
$$
\langle n(\varepsilon)\rangle_{\mathrm{BE}}=\frac{1}{e^{\beta(\varepsilon-\mu)}-1},\qquad
\langle n(\varepsilon)\rangle_{\mathrm{FD}}=\frac{1}{e^{\beta(\varepsilon-\mu)}+1},
$$
und in der klassischen Grenze
$$
\langle n(\varepsilon)\rangle_{\mathrm{MB}}\approx e^{-\beta(\varepsilon-\mu)}.
$$

Für Fermionen wird die typische Form (mit scharfem „Fermi-Rand“ bei $T=0$) oft so skizziert:

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-30_280_673_730_1641.jpg)

---

### 3.9 Typische Prüfungsformeln (kompakt)
Für $M$ Einteilchenzustände und $N$ Teilchen:

- **Bosonen (BE):**
  $$
  W_{\mathrm{BE}}(M,N)=\frac{(N+M-1)!}{N!(M-1)!}
  $$
- **Fermionen (FD), $N\le M$:**
  $$
  W_{\mathrm{FD}}(M,N)=\frac{M!}{N!(M-N)!}
  $$
- **Klassisch (distinguishable):**
  $$
  W_{\mathrm{klass}}(M,N)=M^N
  $$
- **Gibbs-korrigiert (MB, ununterscheidbar im klassischen Grenzfall):**
  $$
  W_{\mathrm{MB,korr}}(M,N)\sim \frac{M^N}{N!}
  $$

---

### 3.10 Visuelle Einordnung aus dem Material
Die folgende Abbildung (aus dem Lernmaterial) unterstützt die Einordnung „Viele Teilchen“ und die Idee, dass nur makroskopische Größen zugänglich sind; für Quantenstatistik relevant ist hier insbesondere, dass bei identischen Teilchen die Mikrozustandszählung ohne Teilchenlabels erfolgen muss:

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-04_741_1634_427_369.jpg)

(Weitere Abbildungen aus dem Material sind eher Ensemble-/Phasenraum-bezogen und für diesen Quantenstatistik-Fokus nur am Rand hilfreich.)

## 4) Bose-Einstein- und Fermi-Dirac-Statistik: Verteilungen und physikalische Bedeutung

### 4.1 Wann braucht man Quantenstatistik?
Quantenstatistik wird relevant, wenn **Ununterscheidbarkeit** und **Wellenfunktionsüberlapp** nicht vernachlässigbar sind (typisch: mittlerer Teilchenabstand $\sim$ thermische de-Broglie-Wellenlänge). Dann entscheidet die **Symmetrie** der Vielteilchenwellenfunktion:

- **Bosonen** (ganzzahliger Spin): Wellenfunktion **symmetrisch** $\Rightarrow$ beliebig viele Teilchen pro Einteilchenzustand möglich.
- **Fermionen** (halbzahliger Spin): Wellenfunktion **antisymmetrisch** $\Rightarrow$ **Pauli-Prinzip**: pro Einteilchenzustand max. 1 Teilchen (pro Spin-Zustand).

---

### 4.2 Großkanonisches Ensemble als Ausgangspunkt (Kernidee)
Im **großkanonischen Ensemble** kann das System **Energie und Teilchen** mit einem Reservoir austauschen. Fix sind:
- Temperatur $T$
- chemisches Potential $\mu$

Zentrale Größe ist die großkanonische Gewichtung eines Vielteilchenzustands $|\{n_i\}\rangle$ (Besetzungszahlen $n_i$ der Einteilchenzustände $i$ mit Energie $\epsilon_i$):
$$
P(\{n_i\}) \propto \exp\left[-\beta\left(E(\{n_i\})-\mu N(\{n_i\})\right)\right],
\quad \beta=\frac{1}{k_B T}.
$$
Für **nicht wechselwirkende** Teilchen gilt
$$
E=\sum_i n_i \epsilon_i,\qquad N=\sum_i n_i,
$$
und die Zustandssumme **faktorisiert** über Einteilchenzustände:
$$
\mathcal{Z}_G=\prod_i \mathcal{Z}_i,\qquad 
\mathcal{Z}_i=\sum_{n_i} e^{-\beta(\epsilon_i-\mu)n_i}.
$$

---

### 4.3 Ableitung der mittleren Besetzungszahl $\langle n_i\rangle$
Für jeden Einteilchenzustand $i$ ist
$$
\langle n_i\rangle=\frac{1}{\mathcal{Z}_i}\sum_{n_i} n_i\, e^{-\beta(\epsilon_i-\mu)n_i}.
$$

#### (A) Bosonen $\Rightarrow$ Bose-Einstein-Verteilung
Erlaubte Besetzungen: $n_i=0,1,2,\dots$

Geometrische Reihen:
$$
\mathcal{Z}_i^{(B)}=\sum_{n=0}^\infty q^n=\frac{1}{1-q},\qquad q=e^{-\beta(\epsilon_i-\mu)}.
$$
Dann
$$
\langle n_i\rangle_B=\frac{q}{1-q}=\frac{1}{e^{\beta(\epsilon_i-\mu)}-1}.
$$

**Existenzbedingung:** Die Reihe konvergiert nur für $|q|<1 \Rightarrow \epsilon_i-\mu>0$. Insbesondere muss für konservierte Bosonen gelten:
$$
\mu \le \epsilon_0
$$
(Grundzustandsenergie $\epsilon_0$), sonst divergiert $\langle n_i\rangle$.

#### (B) Fermionen $\Rightarrow$ Fermi-Dirac-Verteilung
Erlaubte Besetzungen (Pauli): $n_i=0$ oder $1$

Dann
$$
\mathcal{Z}_i^{(F)}=1+e^{-\beta(\epsilon_i-\mu)},
$$
und
$$
\langle n_i\rangle_F=\frac{e^{-\beta(\epsilon_i-\mu)}}{1+e^{-\beta(\epsilon_i-\mu)}}=\frac{1}{e^{\beta(\epsilon_i-\mu)}+1}.
$$

**Besetzungsgrenze:**
$$
0\le \langle n_i\rangle_F \le 1.
$$

---

### 4.4 Gemeinsame Schreibweise, klassische Grenze
Beide Verteilungen lassen sich schreiben als
$$
\boxed{\;\langle n(\epsilon)\rangle=\frac{1}{e^{\beta(\epsilon-\mu)}\mp 1}\;}
$$
mit
- $-$ für **Bosonen** (BE),
- $+$ für **Fermionen** (FD).

#### Maxwell-Boltzmann-Grenzfall (klassisch)
Für **hohe Temperaturen / geringe Dichte** ist die Besetzung klein:
$$
e^{\beta(\epsilon-\mu)}\gg 1 \quad \Rightarrow\quad \langle n\rangle \approx e^{-\beta(\epsilon-\mu)}.
$$
Dann „verschwindet“ das $\pm 1$ und man erhält die **Maxwell-Boltzmann**-Form.

---

### 4.5 Graphische Interpretation (wichtig für Prüfungen)
Die qualitative Form der Kurven (BE, FD, MB) als Funktion von $\epsilon-\mu$ bzw. $\beta(\epsilon-\mu)$:

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-03_379_753_659_367.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-23_688_875_423_1538.jpg)

Weitere typische Darstellung (inkl. $T=0$-Grenze für Fermionen):

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-10_302_878_577_141.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-30_306_656_311_1650.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-30_280_673_730_1641.jpg)

**Was liest man ab?**
- **Fermionen:** $\langle n\rangle\le 1$ (Pauli-Blockierung) und bei $T\to 0$ eine **Stufenfunktion** (Fermikante).
- **Bosonen:** für $\epsilon\to \mu^+$ kann $\langle n\rangle$ **sehr groß** werden (Bose-Verstärkung); bei konservierten Bosonen ist das der Vorläufer der **Bose-Einstein-Kondensation**.

---

### 4.6 Physikalische Bedeutung von $T$ und $\mu$ (quantenstatistisch)
#### Temperatur $T$ (über $\beta=1/k_BT$)
- Steuert die **Verschmierung** der Besetzungen um die „Grenzenergie“ $\epsilon\approx \mu$.
- Typische Energieskala thermischer Anregungen: $\Delta \epsilon \sim k_BT$.

**Bei Fermionen:** Nur Zustände in einer Schale der Breite $\sim k_BT$ um die Fermikante tragen zu Änderungen (z. B. Energie, Transport) bei.

#### Chemisches Potential $\mu$
- Legt fest, **wo** die Besetzungsfunktion im Energiespektrum „zentriert“ ist.
- Wird so eingestellt, dass die **mittlere Teilchenzahl** passt:
$$
\langle N\rangle=\sum_i \langle n_i\rangle
\quad (\text{bzw. } \int d\epsilon\, g(\epsilon)\langle n(\epsilon)\rangle).
$$

**Spezialfälle/Interpretation:**
- **Fermionen bei $T=0$:** $\mu$ fällt mit der **Fermi-Energie** $\epsilon_F$ zusammen:
$$
\mu(T=0)=\epsilon_F.
$$
- **Konservierte Bosonen:** stets $\mu\le \epsilon_0$; bei Annäherung $\mu\to \epsilon_0$ steigt die Grundzustandsbesetzung stark an.
- **Nicht konservierte Bosonen** (z. B. Photonen/Phononen im Gleichgewicht): Teilchenzahl nicht fix $\Rightarrow$ typischerweise
$$
\mu=0.
$$

---

### 4.7 Konsequenzen: Bose-Verstärkung vs. Pauli-Blockierung
#### Bose-Verstärkung (Bose enhancement)
Für Bosonen ist die Übergangswahrscheinlichkeit in einen Zustand mit Besetzung $n$ oft proportional zu $(n+1)$: „**je voller, desto attraktiver**“.
- Führt zu **starken Besetzungen** niedriger Energien.
- Grundlage für **Bose-Einstein-Kondensation** (makroskopische Besetzung des Grundzustands) und kohärente Phänomene (z. B. Laser als stimulierte Emission).

**Edge Case:** Wenn $\epsilon\to \mu^+$, dann
$$
\langle n(\epsilon)\rangle_B \approx \frac{1}{\beta(\epsilon-\mu)} \to \infty.
$$
Das zeigt die mögliche Divergenz (in endlichen Systemen durch endliche Zustandsdichte/Grundzustand „abgefangen“).

#### Pauli-Blockierung (Pauli blocking)
Für Fermionen verhindert die bereits vorhandene Besetzung das Auffüllen:
- Maximal **ein Fermion pro Zustand** (pro Spinprojektion).
- „**Füllung von unten**“ bis zur Fermienergie.

**Konsequenz für Anregungen:**
- Bei kleinen $T$ können nur Fermionen nahe $\epsilon_F$ angeregt werden, weil darunter „alles voll“ ist.

---

### 4.8 Besetzungsgrenzen und Grenzfälle
| Aspekt | Bosonen (BE) | Fermionen (FD) |
|---|---|---|
| erlaubte $n_i$ | $0,1,2,\dots$ | $0,1$ |
| $\langle n\rangle$ | $0\le \langle n\rangle<\infty$ | $0\le \langle n\rangle\le 1$ |
| Bedingung an $\mu$ | $\mu\le \epsilon_0$ (konserviert) | keine analoge Obergrenze |
| $T\to 0$ (typisch) | alle in Grundzustand (bei konserviert) | Stufenfunktion bis $\epsilon_F$ |
| klassischer Grenzfall | $\langle n\rangle \approx e^{-\beta(\epsilon-\mu)}$ | $\langle n\rangle \approx e^{-\beta(\epsilon-\mu)}$ |

---

### 4.9 Qualitative Unterschiede in Wärme- und Transportverhalten (quantenstatistische Sicht)
Hier zählt die **Verfügbarkeit von anregbaren Zuständen**:

#### Fermionen (z. B. Elektronen in Metallen)
- Bei $T\ll T_F$ (Fermitemperatur) sind fast alle Zustände unterhalb $\epsilon_F$ besetzt.
- **Nur ein Bruchteil** $\sim k_BT/\epsilon_F$ der Teilchen nahe der Fermikante kann zu Anregungen beitragen.
- Daraus folgt qualitativ:
  - **kleine** temperaturabhängige Änderungen vieler Größen,
  - Wärmekapazität (elektronischer Beitrag) steigt typischerweise **linear** in $T$:
    $$
    C_V \propto T \quad (\text{weil nur Zustände in Breite } \sim k_BT \text{ beitragen}).
    $$

#### Bosonen (z. B. Bose-Gas, Phononen, Photonen)
- Viele Bosonen können denselben niedrigen Zustand besetzen.
- Für konservierte Bosonen: unterhalb einer kritischen Temperatur kann ein makroskopischer Anteil im Grundzustand landen (BEC), und die Anregungen sind dann anders verteilt.
- Typisches qualitatives Verhalten (abhängig von System/Dispersion):
  - **stärkere** Potenzgesetze bei tiefen Temperaturen (z. B. bei idealem Bose-Gas häufig $C_V \propto T^{3/2}$ unterhalb $T_c$; bei Phononen typischerweise $T^3$).

**Merksatz:**  
- Fermionen: „**Anregungen nur an der Fermikante**“ $\Rightarrow$ oft schwache $T$-Abhängigkeit, linearer $C_V$-Trend.  
- Bosonen: „**Kollektives Besetzen niedriger Energien**“ $\Rightarrow$ starke Niedrig-$T$-Effekte, ggf. Kondensation/Verstärkung.

---

### 4.10 Beispiele (typisch und prüfungsnah)
- **Fermi-Dirac:** Leitungselektronen in Metallen/Halbleitern; Neutronen im Neutronenstern (degeneriertes Fermigas).
  - Bei $T=0$: $\langle n(\epsilon)\rangle=\Theta(\mu-\epsilon)$ (idealisierte Fermikante).
- **Bose-Einstein (konserviert):** ultrakalte Atome (Rb, Na) $\Rightarrow$ Bose-Einstein-Kondensation bei tiefen $T$.
- **Bose-Einstein (nicht konserviert, $\mu=0$):** Photonen (Planck-Spektrum), Phononen (Gitterschwingungen).

Zusätzliche relevante Abbildungen aus dem Material:
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-35_317_637_1383_431.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-35_295_633_541_1660.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/45b9640c-df1b-483c-80ae-f1b50ae8932d/630cdfdd-75d2-41aa-b463-169487efe21f-01_703_1189_655_1574.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/45b9640c-df1b-483c-80ae-f1b50ae8932d/630cdfdd-75d2-41aa-b463-169487efe21f-06_698_1712_1447_137.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/45b9640c-df1b-483c-80ae-f1b50ae8932d/630cdfdd-75d2-41aa-b463-169487efe21f-11_683_2209_1547_301.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/45b9640c-df1b-483c-80ae-f1b50ae8932d/630cdfdd-75d2-41aa-b463-169487efe21f-12_339_619_406_179.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/45b9640c-df1b-483c-80ae-f1b50ae8932d/630cdfdd-75d2-41aa-b463-169487efe21f-12_672_1274_380_1373.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/25906d8d-306b-423d-b55c-822cea313118/52845d4e-f44d-416c-b06f-fa983d26a72e-13_651_1121_63_1843.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/360c9b27-7239-49bb-b5c3-1790ec3c8f12/95d38105-dabe-4631-a371-24ef87ae58b0-07_799_2606_982_221.jpg)

---

### 4.11 Kernformeln (zum Auswendiglernen)
$$
\beta=\frac{1}{k_B T}
$$

$$
\boxed{\langle n(\epsilon)\rangle_B=\frac{1}{e^{\beta(\epsilon-\mu)}-1}},\qquad
\boxed{\langle n(\epsilon)\rangle_F=\frac{1}{e^{\beta(\epsilon-\mu)}+1}}
$$

Klassischer Grenzfall:
$$
\boxed{\langle n(\epsilon)\rangle \approx e^{-\beta(\epsilon-\mu)}\quad \text{für } e^{\beta(\epsilon-\mu)}\gg 1}
$$

Fermionen bei $T=0$:
$$
\boxed{\langle n(\epsilon)\rangle=\Theta(\mu-\epsilon),\quad \mu=\epsilon_F}
$$

Bosonen (konserviert): notwendige Bedingung
$$
\boxed{\mu\le \epsilon_0}
$$

## 5) Klassischer Grenzfall: Maxwell-Boltzmann-Verteilung als Näherung

### Überblick: Wann wird Quantenstatistik klassisch?
Die **Maxwell-Boltzmann-(MB)-Statistik** ist der klassische Grenzfall sowohl der **Bose-Einstein-(BE)** als auch der **Fermi-Dirac-(FD)**-Statistik. Physikalisch gilt:

- **Klassisch**, wenn die Teilchen **selten „ineinanderlaufen“** im Phasenraum, d. h. wenn die quantenmechanischen Wellenpakete sich kaum überlappen.
- Das wird quantitativ durch den **Entartungsparameter** beschrieben:
  $$
  n\lambda_T^3 \ll 1
  $$
  mit Teilchendichte $n=N/V$ und thermischer de-Broglie-Wellenlänge
  $$
  \lambda_T=\frac{h}{\sqrt{2\pi m k_B T}}.
  $$

Äquivalent formuliert man den klassischen Grenzfall oft über die **Fugazität**
$$
z=e^{\beta\mu},\qquad \beta=\frac{1}{k_B T},
$$
wobei **klassisch** bedeutet:
$$
z\ll 1 \quad (\Rightarrow\ \mu\ll -k_B T).
$$

---

### Gemeinsame Ausgangsformel: BE/FD-Besetzungszahl
Für ein Einteilchenniveau der Energie $E$ lautet die mittlere Besetzung
$$
\bar n(E)=\frac{1}{e^{\beta(E-\mu)}\mp 1}
=\frac{1}{\frac{e^{\beta E}}{z}\mp 1},
$$
- **Bosonen (BE)**: Minus im Nenner $(-)$
- **Fermionen (FD)**: Plus im Nenner $(+)$

**MB-Grenzfall**: Wenn $\frac{e^{\beta E}}{z}\gg 1$ (also $z\ll 1$), ist das $\mp 1$ im Nenner vernachlässigbar:
$$
\bar n(E)\approx z\,e^{-\beta E}=e^{-\beta(E-\mu)}.
$$
Das ist genau die **Maxwell-Boltzmann-Verteilung** (in großkanonischer Form).

---

### Mathematische Herleitung via Reihenentwicklung (kleines $z$)
Setze $x=z e^{-\beta E}$. Dann gilt

- **Bose-Einstein**
  $$
  \bar n_{BE}(E)=\frac{1}{x^{-1}-1}=\frac{x}{1-x}=x+x^2+x^3+\cdots
  $$
- **Fermi-Dirac**
  $$
  \bar n_{FD}(E)=\frac{1}{x^{-1}+1}=\frac{x}{1+x}=x-x^2+x^3-\cdots
  $$

In beiden Fällen ist der **führende Term** identisch:
$$
\bar n(E)=x+\mathcal O(x^2)=z e^{-\beta E}+\mathcal O(z^2).
$$

**Interpretation der Korrekturen**:
- Bosonen: $+x^2$ … **„statistische Anziehung“** (Bunching, höhere Mehrfachbesetzung wahrscheinlicher)
- Fermionen: $-x^2$ … **„statistische Abstoßung“** (Pauli-Blockade, Mehrfachbesetzung unterdrückt)

---

### Verbindung zu $n\lambda_T^3\ll 1$: Warum ist das das richtige Kriterium?
Für ideale 3D-Quantengase kann man schreiben:

- **Fermi-Gas** (Spin-Entartung $g_S$):
  $$
  n\lambda_T^3=g_S\,f_{3/2}(z)
  $$
- **Bose-Gas**:
  $$
  n\lambda_T^3=\lambda_T^3 n_0 + g_{3/2}(z),\qquad n_0=\frac{1}{V}\frac{z}{1-z}
  $$

Für **kleines $z$** gelten (beide Statistiken unterscheiden sich erst in Ordnung $z^2$):
$$
f_{3/2}(z)\simeq z-\frac{z^2}{2^{3/2}}+\cdots,\qquad
g_{3/2}(z)\simeq z+\frac{z^2}{2^{3/2}}+\cdots
$$
Damit folgt unmittelbar:
$$
n\lambda_T^3 \approx g_S z \quad \Rightarrow \quad z\approx \frac{n\lambda_T^3}{g_S}\ll 1.
$$

**Physikalische Intuition**:
- $\lambda_T$ ist die typische Ausdehnung des Wellenpakets.
- $n^{-1/3}$ ist der typische Teilchenabstand.
- **Klassisch** ist
  $$
  \lambda_T \ll n^{-1/3}\quad \Leftrightarrow\quad n\lambda_T^3\ll 1.
  $$

---

### Visualisierung: BE/FD $\to$ MB
Die MB-Verteilung fällt exponentiell in $E-\mu$ ab, während
- BE bei $E\to\mu^+$ stark anwachsen kann,
- FD bei tiefen Energien durch $\bar n\le 1$ „abgeschnitten“ ist.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3e5e289-2c37-474f-bb8f-e020c06a8c45/0982277a-4da9-4fb1-bc0a-66f7dcfd778b-15_638_1194_785_213.jpg)

---

### Erste Quantenkorrekturen: Welche Observablen „merken es zuerst“?
Wenn MB gilt, erhält man klassische Resultate. Quantenstatistik zeigt sich zuerst in Größen, die **sensitiv auf Besetzungs-Korrelationen** sind:

- **Druck / Zustandsgleichung (ideales Quantengas)** zeigt bereits in Ordnung $n\lambda_T^3$ statistische Korrekturen:
  - **Fermionen** (Verdünnungsgrenzfall):
    $$
    pV \simeq Nk_B T\left(1+\frac{n\lambda_T^3}{2^{5/2}g_S}\right)
    $$
    (Druck etwas **größer** als klassisch: Pauli-„Abstoßung“)
  - **Bosonen** (Verdünnungsgrenzfall):
    $$
    pV \simeq Nk_B T\left(1-\frac{n\lambda_T^3}{2^{5/2}}\right)
    $$
    (Druck etwas **kleiner** als klassisch: Bose-„Anziehung“)

- **Teilchenzahlfluktuationen / Korrelationen**:
  - Bosonen: **Bunching** (größere Fluktuationen)
  - Fermionen: **Antibunching** (unterdrückte Fluktuationen)

- **Verteilungsfunktion nahe $\mu$**:
  - FD: Pauli-Sättigung $\bar n\le 1$ wird relevant, sobald Zustände „voll“ werden.
  - BE: starke Besetzung tiefer Energien (bis hin zu BEC) wird relevant, wenn $z\to 1^-$.

Merksatz: **Quantenkorrekturen treten zuerst auf, wenn viele Teilchen um dieselben Einteilchenzustände konkurrieren** (FD) oder sich bevorzugt darin sammeln (BE).

---

### Konkrete Beispiele

#### Beispiel A: Ideales verdünntes Gas (klassisch ausreichend)
Typische Bedingungen: **Raumtemperatur**, **moderate Dichten** (z. B. Luft).

- Für „schwere“ Teilchen ist $\lambda_T$ klein (wegen großer Masse $m$), also ist $n\lambda_T^3$ meist winzig.
- Dann gilt:
  - Besetzungen: $\bar n(E)\approx e^{-\beta(E-\mu)}$
  - Quantenkorrekturen: erst sehr klein (Ordnung $n\lambda_T^3$)

**Edge Case**: Sehr leichte Teilchen (z. B. Helium) und tiefe Temperaturen → $\lambda_T$ wächst, klassischer Grenzfall kann brechen (BEC/Entartung).

---

#### Beispiel B: Entartetes Elektronengas (klassisch oft *nicht* ausreichend)
Elektronen in Metallen haben hohe Dichten und kleine Masse, daher ist $\lambda_T$ groß genug, dass oft
$$
n\lambda_T^3 \gtrsim 1
$$
gilt: **stark quantenentartet**.

Kennzeichen:
- Bei $T\to 0$:
  $$
  \bar n_{FD}(E)=
  \begin{cases}
  1,& E<\mu\\
  0,& E>\mu
  \end{cases}
  $$
  (**Fermi-Kante**, nicht MB-artig)
- Für $0<T\ll T_F$ wird die Kante nur in einem Bereich
  $$
  \Delta E\sim k_B T
  $$
  „verschmiert“ — dennoch bleibt die Verteilung fundamental FD.

**Physikalische Konsequenz (quantitativ im Ansatz)**:
- Viele Zustände sind „gefüllt“, Pauli-Blockade bestimmt Kinetik/Transport.
- Bereits ohne Wechselwirkung entsteht ein **Fermi-Druck** (auch bei $T=0$), der im klassischen Bild fehlt.

---

### Grenzfälle und Fallstricke
- **Hohe Temperatur allein** garantiert nicht klassisches Verhalten, wenn gleichzeitig die Dichte extrem hoch ist (dann kann $n\lambda_T^3$ trotzdem $\gtrsim 1$ bleiben).
- **Niedrige Dichte allein** kann klassisch sein, aber bei **Bosonen** muss man aufpassen: Nähe zur **BEC-Bedingung** bedeutet $z\to 1^-$ und damit *nicht* klassisch.
- **MB ist immer nur eine Näherung**: der kontrollierte kleine Parameter ist $z$ bzw. $n\lambda_T^3$ (nicht einfach „$T$ groß“).

---

### Zusammenfassung (Kernformeln)
- **BE/FD**:
  $$
  \bar n(E)=\frac{1}{e^{\beta(E-\mu)}\mp 1}
  $$
- **Klassischer Grenzfall**:
  $$
  z=e^{\beta\mu}\ll 1
  \qquad \Leftrightarrow\qquad
  n\lambda_T^3\ll 1
  $$
- **Maxwell-Boltzmann-Näherung**:
  $$
  \bar n(E)\approx e^{-\beta(E-\mu)}=z e^{-\beta E}
  $$
- **Erste Quantenkorrekturen** (Druck, ideales Gas):
  $$
  pV \simeq Nk_B T\left(1\mp \frac{n\lambda_T^3}{2^{5/2}g_S}\right)
  $$
  mit **$-$ für Bosonen**, **$+$ für Fermionen** (Vorzeichen = statistische „Anziehung“ vs. „Abstoßung“).

## 6) Ensemble-Formalismus und Verbindung zu Thermodynamik

### 6.1 Kanonische Zustandssumme $Z$ und freie Energie $F$
**Setting (Quantenstatistik):** Feste Teilchenzahl $N$, Volumen $V$, Temperatur $T$ (also $NVT$ / kanonisches Ensemble). Mikrozustände $r$ mit Energien $E_r$.

- **Kanonische Zustandssumme**
  $$
  Z(N,V,T)=\sum_{r} e^{-\beta E_r},\qquad \beta=\frac{1}{k_B T}
  $$
  (Summe über alle Vielteilchen-Eigenzustände; in der Praxis oft über Einteilchenzustände + Besetzungszahlen formuliert.)

- **Freie Energie (Helmholtz)**
  $$
  F(N,V,T)=-k_B T\ln Z
  $$

- **Ableitungsrezepte (Kernformeln)**
  - **Innere Energie**
    $$
    U=\langle E\rangle =-\frac{\partial}{\partial \beta}\ln Z
    $$
  - **Entropie** (aus $F$ und $U$)
    $$
    S=-\left(\frac{\partial F}{\partial T}\right)_{V,N}
    =k_B\left(\ln Z+\beta U\right)
    $$
  - **Wärmekapazität** bei konstantem Volumen
    $$
    C_V=\left(\frac{\partial U}{\partial T}\right)_{V,N}
    $$
  - **Druck** (für Gase aus $F(V)$)
    $$
    p=-\left(\frac{\partial F}{\partial V}\right)_{T,N}
    $$

**Bezug zur Quantenstatistik:** Für ideale Bose-/Fermi-Gase ist das kanonische Ensemble oft unhandlich (Teilchenzahlfixierung). Man rechnet typischerweise **großkanonisch** und bestimmt $N$ über $\mu$.

---

### 6.2 Großkanonische Zustandssumme $Z_G$ (Grand Partition Function)
**Setting:** Offenes System mit Austausch von Energie und Teilchen: $(\mu, V, T)$.

- **Definition**
  $$
  Z_G(\mu,V,T)=\sum_{N=0}^{\infty} e^{\beta\mu N}\, Z(N,V,T)
  $$
  oder als Summe über alle Vielteilchenzustände $\nu$ (mit $N_\nu$ und $E_\nu$):
  $$
  Z_G=\sum_{\nu} e^{-\beta(E_\nu-\mu N_\nu)}.
  $$

- **Großpotential (Grand potential)**
  $$
  \Omega(\mu,V,T)=-k_B T\ln Z_G
  $$
  Für homogene Systeme (Box, thermodynamischer Limes) gilt zentral:
  $$
  \Omega=-pV
  $$

- **Ableitungsrezepte (wichtigste Zustandsgrößen aus $\Omega$)**
  $$
  N=-\left(\frac{\partial \Omega}{\partial \mu}\right)_{T,V},
  \qquad
  S=-\left(\frac{\partial \Omega}{\partial T}\right)_{\mu,V},
  \qquad
  p=-\frac{\Omega}{V}.
  $$
  Außerdem
  $$
  U=\Omega+TS+\mu N.
  $$

---

### 6.3 Ideale Quanten-Gase im Großkanonischen Formalismus
Für **nichtwechselwirkende** Bosonen/Fermionen faktorisiert $Z_G$ über Einteilchenzustände $k$ (Energie $E_k$). Fugazität $z=e^{\beta\mu}$.

#### 6.3.1 Faktorisierung und Besetzungszahlen
- **Fermionen (Fermi-Dirac):**
  - pro Zustand: $n_k\in\{0,1\}$
  - großkanonische Zustandssumme:
    $$
    Z_G^{(F)}=\prod_k \left(1+z e^{-\beta E_k}\right)^{g_S}
    $$
  - mittlere Besetzung:
    $$
    \langle n_k\rangle =\frac{1}{e^{\beta(E_k-\mu)}+1}
    $$
- **Bosonen (Bose-Einstein):**
  - pro Zustand: $n_k\in\{0,1,2,\dots\}$
  - großkanonische Zustandssumme:
    $$
    Z_G^{(B)}=\prod_k \left(\frac{1}{1-z e^{-\beta E_k}}\right)^{g_S}
    $$
  - mittlere Besetzung:
    $$
    \langle n_k\rangle =\frac{1}{e^{\beta(E_k-\mu)}-1}
    $$
  - **Edge case (Wichtig):** Konvergenz verlangt $z e^{-\beta E_k}<1$ für alle $k$.
    Für ein Gas in einer Box mit Grundzustand $E_0=0$ folgt **$\mu\le 0$** (bei Bosonen).

Dabei ist $g_S=2S+1$ die Spinentartung.

---

### 6.4 Kontinuumsgrenze, Zustandsdichte und das typische Auftauchen von $1/\lambda_T^3$
In der Box (3D) wird die Summe über $k$ bei großem Volumen zur Energieintegration über die **Zustandsdichte** $D(E)$:
$$
\sum_k \to \int_0^\infty dE\, D(E).
$$

Für das freie Teilchen in 3D (Box) ist
$$
D(E)=\frac{g_S V}{4\pi^2}\left(\frac{2m}{\hbar^2}\right)^{3/2}\sqrt{E}.
$$

Setzt man $x=\beta E$, dann entsteht der charakteristische Skalenfaktor
$$
\left(\frac{2\pi m k_B T}{h^2}\right)^{3/2}=\lambda_T^{-3},
\qquad
\lambda_T=\frac{h}{\sqrt{2\pi m k_B T}}
$$
(**thermische de-Broglie-Wellenlänge**).

**Merksatz:** In 3D gilt für ideale Quanten-Gase fast immer
$$
N \sim \frac{V}{\lambda_T^3}\times(\text{dimensionslose Funktion von } z),
\qquad
p \sim \frac{k_B T}{\lambda_T^3}\times(\text{dimensionslose Funktion von } z).
$$
Physikalisch: $V/\lambda_T^3$ zählt, wie viele thermische „Quantenzellen“ ins Volumen passen; Quantenstatistik wird wichtig bei **hoher Dichte** bzw. **kleinem $\lambda_T$** (tiefer $T$ bzw. großer $m$).

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b7483e54-ba04-4936-ae7c-fca5ab34ab5f/c38ca8bf-ac8d-47a3-b1d4-da6d5fd8e5f0-03_555_735_1627_179.jpg)

---

### 6.5 Quantenstatistik in Zustandsgleichungen: $f_\nu(z)$ und $g_\nu(z)$
Definiere die standardisierten **Fermi-** bzw. **Bose-Integrale** (oft auch als Polylogarithmen darstellbar):
- Fermionen:
  $$
  f_\nu(z)=\frac{1}{\Gamma(\nu)}\int_0^\infty dx\,\frac{x^{\nu-1}}{z^{-1}e^x+1}
  $$
- Bosonen:
  $$
  g_\nu(z)=\frac{1}{\Gamma(\nu)}\int_0^\infty dx\,\frac{x^{\nu-1}}{z^{-1}e^x-1}
  $$
  mit **$0<z\le 1$** (für Box und $E_0=0$).

Dann gilt für das ideale Gas in 3D (Box):
- **Teilchenzahl**
  $$
  N=g_S\frac{V}{\lambda_T^3}
  \begin{cases}
  f_{3/2}(z), & \text{Fermionen}\\[4pt]
  g_{3/2}(z), & \text{Bosonen (ohne Kondensat-Anteil)}
  \end{cases}
  $$
- **Druck** (über $\Omega=-pV$ bzw. $\ln Z_G$)
  $$
  p=\frac{k_B T}{\lambda_T^3}g_S
  \begin{cases}
  f_{5/2}(z), & \text{Fermionen}\\[4pt]
  g_{5/2}(z), & \text{Bosonen}
  \end{cases}
  $$
- **Innere Energie**
  $$
  U=\frac{3}{2}pV
  $$
  (gilt für das nichtrelativistische ideale Gas in 3D; folgt aus $E\propto p^2$ und der Skalierung von $D(E)$).

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/6ccb05fe-9bab-418a-b393-2a61bc5cd08f/c29bc0c8-2695-4a08-99bf-a6cb3ddd19b8-4_566_825_142_2023.jpg)

#### Klassischer Grenzfall (Maxwell-Boltzmann) als Konsistenzcheck
Für $z\ll 1$:
$$
f_\nu(z)\approx z,\qquad g_\nu(z)\approx z
$$
und damit
$$
N\approx g_S\frac{V}{\lambda_T^3}z
\quad\Rightarrow\quad
z\approx \frac{N\lambda_T^3}{g_S V}.
$$
Dann
$$
p\approx \frac{k_B T}{\lambda_T^3}g_S z=\frac{Nk_B T}{V},
$$
also die klassische ideale Gasgleichung; Quantenstatistik steckt in Korrekturen in Potenzen von $z$.

---

### 6.6 Vorgehen: Energie, Entropie, Wärmekapazität für ideale Bose-/Fermi-Gase
Hier ein **praktisches Rechenrezept**, das in Klausuren fast immer funktioniert.

#### Schritt 1: Wähle Ensemble und Grundformeln
- Nutze großkanonisch:
  $$
  \Omega(\mu,V,T)=-k_B T\ln Z_G
  $$
- Bestimme Zustandsgrößen aus Ableitungen:
  $$
  N=-\left(\frac{\partial \Omega}{\partial \mu}\right)_{T,V},
  \quad
  S=-\left(\frac{\partial \Omega}{\partial T}\right)_{\mu,V},
  \quad
  U=\Omega+TS+\mu N.
  $$

#### Schritt 2: Ersetze $\sum_k$ durch Integrale (thermodynamischer Limes)
- Verwende $D(E)$ und die jeweilige Verteilung $N_{F/B}(E)$:
  $$
  N=\int_0^\infty dE\,D(E)\,N_{F/B}(E),
  \qquad
  U=\int_0^\infty dE\,D(E)\,E\,N_{F/B}(E).
  $$

#### Schritt 3: Skaliere mit $x=\beta E$ und schreibe Ergebnis mit $f_\nu, g_\nu$
Für 3D Box resultiert typischerweise:
$$
N=g_S\frac{V}{\lambda_T^3}\,\mathcal{F}_{3/2}(z),
\qquad
U=\frac{3}{2}k_B T\,g_S\frac{V}{\lambda_T^3}\,\mathcal{F}_{5/2}(z),
$$
wobei $\mathcal{F}_\nu=f_\nu$ (Fermi) bzw. $g_\nu$ (Bose).

#### Schritt 4: Eliminiere $\mu$ (bzw. $z$) über die Teilchenzahlnormierung
- Gegeben $N,V,T$: Löse
  $$
  \frac{N\lambda_T^3}{g_S V}=
  \begin{cases}
  f_{3/2}(z)\\
  g_{3/2}(z)
  \end{cases}
  $$
  nach $z$ (analytisch nur in Grenzfällen, sonst numerisch/graphisch).

#### Schritt 5: Entropie $S$ und Wärmekapazität $C_V$
- Entropie über großkanonische Identität
  $$
  S=-\left(\frac{\partial \Omega}{\partial T}\right)_{\mu,V},
  \qquad
  \Omega=-pV
  $$
  bzw. über
  $$
  S=\frac{U-\Omega-\mu N}{T}.
  $$
- Wärmekapazität
  $$
  C_V=\left(\frac{\partial U}{\partial T}\right)_{V,N}.
  $$
  **Achtung (Edge case):** $U(T,\mu)$ ist einfach, aber $C_V$ verlangt Ableitung bei **festem $N$**, daher ist $\mu=\mu(T)$ implizit durch $N=\text{const}$ bestimmt:
  $$
  \left(\frac{\partial U}{\partial T}\right)_{N}
  =
  \left(\frac{\partial U}{\partial T}\right)_{\mu}
  +
  \left(\frac{\partial U}{\partial \mu}\right)_{T}
  \left(\frac{\partial \mu}{\partial T}\right)_{N}.
  $$
  $\left(\frac{\partial \mu}{\partial T}\right)_N$ erhält man durch Differentiation der Normierungsgleichung für $N$.

---

### 6.7 Spezifische Edge Cases: Bose-Einstein-Kondensation (BEC) in der Box
Für Bosonen (3D Box, Grundzustand $E_0=0$):
- Beim Abkühlen wächst $z\to 1$ (also $\mu\to 0^-$).
- Die maximale Zahl an Teilchen, die in angeregten Zuständen Platz hat, ist
  $$
  N_{\mathrm{ex,max}}(T)=\frac{V}{\lambda_T^3}\,g_{3/2}(1)
  =
  \frac{V}{\lambda_T^3}\,\zeta\!\left(\frac{3}{2}\right).
  $$
- Für gegebenes $N$ definiert dies die kritische Temperatur $T_c$ via
  $$
  N=\frac{V}{\lambda_{T_c}^3}\zeta\!\left(\frac{3}{2}\right).
  $$
- Für $T<T_c$:
  $$
  N=N_0+N_{\mathrm{ex}},
  \qquad
  N_{\mathrm{ex}}=\frac{V}{\lambda_T^3}\zeta\!\left(\frac{3}{2}\right),
  \qquad
  \mu=0.
  $$
  Der Überschuss geht in den Kondensatanteil $N_0$:
  $$
  \frac{N_0}{N}=1-\left(\frac{T}{T_c}\right)^{3/2}.
  $$

**Konsequenz für $U,S,C_V$ unterhalb $T_c$:**
- Kondensatteilchen im Grundzustand tragen (für $E_0=0$) **nicht** zur Energie bei, daher:
  $$
  U(T<T_c)=\frac{3}{2}k_B T\frac{V}{\lambda_T^3}\zeta\!\left(\frac{5}{2}\right)\propto T^{5/2}.
  $$
- Damit
  $$
  C_V(T<T_c)\propto T^{3/2}.
  $$
- Bei $T\approx T_c$ zeigt $C_V$ eine charakteristische nicht-analytische Struktur (in idealisierter Theorie cusp/Knicks).

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/f03e3eba-4180-49e1-97b8-e2fe9e2a3eff/14cadde9-f499-439f-bb02-45c3799994d3-13_804_1438_1003_179.jpg)
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/f03e3eba-4180-49e1-97b8-e2fe9e2a3eff/14cadde9-f499-439f-bb02-45c3799994d3-13_667_1169_1003_1732.jpg)

**Wichtige Dimensionalitäts-Edge-Case (Box):** Ob BEC auftritt hängt von der Konvergenz von $g_{d/2}(1)$ ab. In 1D/2D (homogene Box) divergiert die entsprechende Bose-Integralstruktur so, dass im thermodynamischen Limes **keine** BEC bei $T>0$ auftritt (ideales homogenes Gas).

---

### 6.8 Beispiel: Photonengas als Bosonengas mit $\mu=0$
Photonen sind Bosonen, aber ihre Teilchenzahl ist nicht konserviert $\Rightarrow \mu=0$ (also $z=1$).

- mittlere Besetzung:
  $$
  \langle n(\omega)\rangle=\frac{1}{e^{\beta\hbar\omega}-1}
  $$
- Spektrale Energiedichte (3D):
  $$
  u(\omega,T)=\frac{\hbar\omega^3}{\pi^2 c^3}\frac{1}{e^{\beta\hbar\omega}-1}.
  $$

**Wie würde es in 1D aussehen (typische Klausurfrage)?**
- In $d$ Dimensionen skaliert die Modendichte wie $\omega^{d-1}$.
- Daher in **1D** (bis auf Polarisations-/Randbedingungen):
  $$
  u_{1D}(\omega,T)\propto \frac{\hbar \omega^{1}}{c^{1}}\frac{1}{e^{\beta\hbar\omega}-1}.
  $$
Genauer hängt der Vorfaktor von der Normierung (Länge $L$ statt $V$, Zahl der Polarisationsfreiheitsgrade) ab; die **entscheidende Änderung** ist $\omega^{3}\to \omega^{1}$.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/dc59a0fd-14ba-4c92-9c4a-0742272405db/848d139f-d2df-4714-b2bd-c649e5f2248b-17_857_1232_1373_1737.jpg)

---

### 6.9 Kompakte Übersicht (3D Box, ideales Gas)
| Größe | Fermionen | Bosonen (oberhalb $T_c$) |
|---|---:|---:|
| Fugazität | $z=e^{\beta\mu}$ (beliebig $>0$) | $0<z\le 1$ |
| Teilchenzahl | $N=g_S\frac{V}{\lambda_T^3}f_{3/2}(z)$ | $N=\frac{V}{\lambda_T^3}g_{3/2}(z)$ |
| Druck | $p=g_S\frac{k_BT}{\lambda_T^3}f_{5/2}(z)$ | $p=\frac{k_BT}{\lambda_T^3}g_{5/2}(z)$ |
| Großpotential | $\Omega=-pV$ | $\Omega=-pV$ |
| Energie | $U=\frac{3}{2}pV$ | $U=\frac{3}{2}pV$ |

**Merke:** Der ganze „Quanten“-Inhalt der Zustandsgleichungen steckt (für ideale Gase) in den Funktionen $f_\nu(z)$ bzw. $g_\nu(z)$ und der Skala $V/\lambda_T^3$.

## 7) Typische Phänomene: Bose-Einstein-Kondensation und entartetes Fermigas

### 7.1 Überblick: Warum treten „typische“ Quantengas-Phänomene auf?
- **Bosonen**: symmetrische Vielteilchenwellenfunktion $\Rightarrow$ **beliebige Mehrfachbesetzung** eines Einteilchenzustands möglich.  
- **Fermionen**: antisymmetrische Vielteilchenwellenfunktion $\Rightarrow$ **Pauli-Prinzip** (max. 1 Teilchen pro Quantenzustand und Spin).
- Quantenstatistik wird relevant, wenn die **thermische de-Broglie-Wellenlänge** $\lambda_T$ mit dem mittleren Teilchenabstand vergleichbar wird (hohe Dichte oder kleine $T$):
  $$\lambda_T \sim \frac{h}{\sqrt{2\pi m k_B T}}, \qquad n\lambda_T^3 \gtrsim 1.$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-35_317_637_1383_431.jpg)

---

### 7.2 Bose-Einstein-Kondensation (BEK)

#### 7.2.1 Kernaussage: makroskopische Grundzustandsbesetzung
- Für ein ideales Bosegas gilt die mittlere Besetzung
  $$\langle n(\varepsilon)\rangle = \frac{1}{\exp\!\left(\frac{\varepsilon-\mu}{k_B T}\right)-1}.$$
- **Wesentlich**: Für Bosonen muss $\mu\le \varepsilon_0$ gelten (Grundzustandsenergie).  
  Im Kontinuum (frei, $\varepsilon_0=0$) gilt **$\mu\le 0$**.
- Beim Abkühlen wächst $\mu$ gegen $0$. Ab einer **kritischen Temperatur** $T_c$ kann die Anregungswolke (angeregte Zustände) nicht mehr alle Teilchen „aufnehmen“:
  - Die **maximal mögliche** Teilchenzahl in angeregten Zuständen ist endlich.
  - Der „Überschuss“ geht in den Grundzustand: **Kondensat** mit Teilchenzahl $N_0$.

#### 7.2.2 Kritische Temperatur $T_c$ (ideales, homogenes 3D-Gas)
- Teilchendichte $n=N/V$. Für $T\ge T_c$ gilt (keine makroskopische Grundzustandsbesetzung) näherungsweise:
  $$n = \frac{1}{\lambda_T^3}\, g_{3/2}(z), \qquad z=e^{\mu/(k_BT)}\le 1,$$
  wobei $g_\nu(z)=\sum_{l=1}^\infty \frac{z^l}{l^\nu}$ (Bose-Funktion/Polylogarithmus).
- Am kritischen Punkt ist $z\to 1$ und $g_{3/2}(1)=\zeta(3/2)\approx 2{,}612$:
  $$n=\frac{\zeta(3/2)}{\lambda_{T_c}^3} \quad \Rightarrow \quad
  T_c=\frac{2\pi\hbar^2}{m k_B}\left(\frac{n}{\zeta(3/2)}\right)^{2/3}.$$
- **Kondensatfraktion** für $T<T_c$ (homogen, ideal, 3D):
  $$\frac{N_0}{N}=1-\left(\frac{T}{T_c}\right)^{3/2}.$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/360c9b27-7239-49bb-b5c3-1790ec3c8f12/95d38105-dabe-4631-a371-24ef87ae58b0-07_799_2606_982_221.jpg)

#### 7.2.3 Konsequenzen für spezifische Wärme und Kohärenz (quantenstatistisch)
**Spezifische Wärme $C_V$ (ideales Bosegas):**
- Bei $T=T_c$ tritt ein **nicht-analytisches Verhalten** („Knick“/Sprung in der Ableitung) auf: typisches Signal des BEK-Übergangs im idealen Modell.
- Typische Skalierung im Tieftemperaturbereich (für das ideale Bosegas im Kontinuum; häufig als Merksatz verwendet):
  - **unterhalb $T_c$**: $C_V$ fällt stark ab (oft angegeben als Potenzgesetz, z. B. $C_V\propto T^{3/2}$ für das ideale homogene Bosegas; in vielen Kursnotizen wird auch ein $T^3$-Verhalten im Kontext anderer Anregungsspektren diskutiert—entscheidend ist: *stark unterklassisch und nicht konstant*).
  - **oberhalb $T_c$**: klassischer Grenzwert wird wieder erreicht (für ein ideales monatomes Gas)  
    $$C_V \to \frac{3}{2} N k_B \quad (T\gg T_c).$$

> Prüfungs-typisch: **„Bei $T_c$ ist $C_V$ nicht glatt“** (Knick/Übergang) und **klassischer Grenzwert** für große $T$.

**Kohärenz (physikalische Bedeutung der makroskopischen Besetzung):**
- Ein makroskopisch besetzter Einteilchenzustand kann als **materiewellenartige** kohärente Komponente beschrieben werden.
- Typische Konsequenzen/Signaturen:
  - **Interferenz** zweier Kondensate (Phasenbezug sichtbar in Dichteinterferenzmustern).
  - **Long-range coherence** (starke Korrelationen/Phasensteifigkeit) im Kondensatanteil.
  - In realen Systemen mit Wechselwirkungen: Verbindung zu **Superfluidität** (aber: BEK $\neq$ automatisch Superfluidität; dennoch eng verwandt).

#### 7.2.4 Wichtige Randfälle / „Edge Cases“ zur BEK
- **Dimensionsabhängigkeit (ideales homogenes Gas):**
  - In **1D und 2D** gibt es bei endlicher Temperatur **keine** echte BEK im thermodynamischen Limes (Infrared-Divergenzen).  
  - In endlichen Systemen oder mit Fallenpotentialen kann dennoch eine „kondensatähnliche“ makroskopische Besetzung auftreten.
- **Fallen (ultrakalte Atome):** Harmonische Falle $\Rightarrow$ Zustandsdichte anders $\Rightarrow$ andere Potenzen, z. B. Kondensatfraktion oft
  $$\frac{N_0}{N}=1-\left(\frac{T}{T_c}\right)^3 \quad \text{(harmonische 3D-Falle, ideal).}$$
- **Wechselwirkungen:** verschieben $T_c$ leicht und ändern Anregungsspektrum (Bogoliubov-Phononen). Grundidee bleibt: **makroskopische Besetzung** + **Bose-Verstärkung**.

#### 7.2.5 Anwendungen/Experimente (Beispiele)
- **Ultrakalte Atomgase** (z. B. $^{87}\mathrm{Rb}$, $^{23}\mathrm{Na}$): BEK durch Laserkühlung + evaporative cooling; Nachweis über **Zeitflugbild** (bimodale Verteilung) und **Interferenz**.
- **Quasiteilchen-Kondensate**: z. B. Exziton-Polaritonen (nicht immer im thermischen Gleichgewicht; dennoch kondensatartige Kohärenz).

---

### 7.3 Entartetes Fermigas

#### 7.3.1 Kernaussage: Fermi-See und Fermi-Kante
- Fermi-Dirac-Besetzung:
  $$\langle n(\varepsilon)\rangle = \frac{1}{\exp\!\left(\frac{\varepsilon-\mu}{k_B T}\right)+1}.$$
- Bei $T=0$ ist $\mu=\varepsilon_F$ und die Verteilung wird zur **Stufenfunktion**:
  $$\langle n(\varepsilon)\rangle =
  \begin{cases}
  1,& \varepsilon<\varepsilon_F\\
  0,& \varepsilon>\varepsilon_F
  \end{cases}
  $$
  → alle Zustände bis zur **Fermi-Energie** sind gefüllt (**Fermi-See**), darüber leer.
- Für $T>0$ wird die Kante um eine Energieskala $\sim k_B T$ „verschmiert“, und
  $$\langle n(\varepsilon=\mu)\rangle = \frac{1}{2}.$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/360c9b27-7239-49bb-b5c3-1790ec3c8f12/95d38105-dabe-4631-a371-24ef87ae58b0-12_418_846_792_174.jpg)

#### 7.3.2 Fermi-Energie und Fermi-Temperatur (homogenes 3D-Gas)
Für nichtrelativistische Fermionen der Masse $m$ mit Spinentartung $g$ (z. B. Elektronen: $g=2$):
- Fermiwellenzahl:
  $$k_F=\left(\frac{6\pi^2 n}{g}\right)^{1/3}.$$
- Fermi-Energie:
  $$\varepsilon_F=\frac{\hbar^2 k_F^2}{2m}.$$
- Fermi-Temperatur:
  $$T_F=\frac{\varepsilon_F}{k_B}.$$
**Entartungsregime:** $T\ll T_F$.

#### 7.3.3 Eigenschaften bei $T\ll T_F$ (typische Konsequenzen)
- **Nur Fermionen nahe der Fermikante sind thermisch aktiv:**  
  Anregungen betreffen eine dünne Energieschale der Breite $\sim k_B T$ um $\varepsilon_F$.
- **Spezifische Wärme** ist daher stark reduziert gegenüber dem klassischen Gas und **linear in $T$**:
  $$C_V \propto N k_B \frac{T}{T_F} \quad (T\ll T_F).$$
  (Merksatz: **Fermigas: $C_V\sim T$**, weil nur ein Anteil $\sim T/T_F$ der Teilchen beiträgt.)
- **Entartungsdruck (Pauli-Druck):**
  - Selbst bei $T=0$ besitzt das Gas endlichen Druck, weil Impulszustände bis $k_F$ gefüllt sind.
  - Nichtrelativistisch (3D, ideal):
    $$P=\frac{2}{5} n\,\varepsilon_F.$$
  - Physikalisch: Druck entsteht **ohne** thermische Bewegung, rein aus der **Zustandsfüllung** (Ununterscheidbarkeit + Pauli-Prinzip).

#### 7.3.4 Beispiele und Anwendungen
- **Elektronen in Metallen (Elektronengas):**
  - Typisch $T_F$ von Elektronen ist sehr groß (oft $\sim 10^4$–$10^5\,\mathrm{K}$) $\Rightarrow$ bei Raumtemperatur ist $T\ll T_F$.
  - Konsequenz: Elektronenbeiträge zu Wärmekapazitäten sind klein und **linear in $T$** (im Gegensatz zu klassischen Erwartungen).
- **Astrophysik: Druckentartung**
  - **Weiße Zwerge:** Elektronen-Entartungsdruck stützt gegen gravitative Kompression.
  - **Neutronensterne:** Neutronen-Entartungsdruck (und Kernwechselwirkungen) tragen zur Stabilisierung bei.
  - Edge case: bei extrem hohen Dichten werden Fermionen **relativistisch** $\Rightarrow$ Zustandsgleichung/Skalierungen ändern sich (relativistische Fermi-Gase).
- **Ultrakalte Fermigase** (z. B. $^{6}\mathrm{Li}$, $^{40}\mathrm{K}$):
  - Realisierung entarteter Fermigase in optischen Fallen.
  - Charakterisierung über $T/T_F$; Pauli-Blocking beeinflusst Stoßraten und Dichteprofile.

---

### 7.4 Direktvergleich (Merktabelle)

| Aspekt | Bosegas (Bosonen) | Fermigas (Fermionen) |
|---|---|---|
| Symmetrie | symmetrisch | antisymmetrisch |
| Besetzung eines Zustands | beliebig groß | max. 1 (pro Spin) |
| Typisches Phänomen | **BEK**: makroskopisches $N_0$ im Grundzustand | **Entartung**: gefüllte Fermi-See bis $\varepsilon_F$ |
| Energieskala | $T_c$ | $T_F$ |
| Tieftemperatur-Verhalten | Kondensatfraktion $N_0/N=1-(T/T_c)^{3/2}$ (homogen, ideal, 3D) | nur Schale $\sim k_BT$ um $\varepsilon_F$ aktiv |
| Wärmekapazität (Merksatz) | nicht-analytisch bei $T_c$, stark unterklassisch bei $T<T_c$ | **linear**: $C_V\propto T$ für $T\ll T_F$ |
| Anwendungen | ultrakalte Atome, kohärente Materiewellen | Metalle (Elektronen), Astrophysik (Entartungsdruck) |

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b911bcad-5d5e-49c5-b4cc-917a24fdc673/7f204057-7a31-4341-beca-2b377aeceffb-09_546_1084_1082_232.jpg)

## 8) Konzeptuelle Kontraste: Rolle von Ergodizität und Messgrößen in der Quantenstatistik

### 8.1 Klassische Intuition: Trajektorien, Zeitmittel, Ergodenhypothese
In der klassischen Statistik ist die zentrale Intuition oft:

- Ein abgeschlossenes System mit fixer Energie $E$ bewegt sich **deterministisch** auf der **Energiehyperfläche** $H(q,p)=E$ im Phasenraum.
- Eine Messgröße $A(q,p)$ schwankt entlang der Trajektorie; der **Zeitmittelwert**
  $$\overline{A}=\lim_{T\to\infty}\frac{1}{T}\int_0^T A(q(t),p(t))\,dt$$
  wird (unter geeigneten Bedingungen) mit dem **Ensemblemittelwert** über die Energiefläche gleichgesetzt.
- **Ergodenhypothese (klassisch)**: Die Trajektorie „füllt“ die Energiehyperfläche so, dass Zeit- und Ensemblemittel (für „vernünftige“ Observablen) zusammenfallen.

Die Bildidee: links eine Trajektorie, die die Energiefläche dicht „erkundet“, rechts Ensemble-Punkte auf der Energiefläche.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c3f11257-bac0-4d04-a400-59bbf93443d6/25d076b2-b147-4a3b-9d72-efd9651588eb-08_804_1131_739_1817.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c3f11257-bac0-4d04-a400-59bbf93443d6/25d076b2-b147-4a3b-9d72-efd9651588eb-10_799_1142_253_1679.jpg)

**Konzeptueller Bruch in der Quantenstatistik:** Es gibt keine klassischen Trajektorien im Phasenraum als fundamentale Beschreibung. Stattdessen sind **Zustände**, **Dichtematrizen** und **Erwartungswerte** zentral.

---

### 8.2 Quantenstatistik: Zustand, Dichtematrix, Ensemble statt Zeitmittel
#### (a) Zustände und Observablen
- Ein quantenmechanischer Zustand ist durch einen Vektor $|\psi\rangle$ (reiner Zustand) oder allgemeiner durch eine **Dichtematrix** $\rho$ (gemischter Zustand) beschrieben.
- Eine Messgröße ist ein **Hermitescher Operator** $A$.
- Der (Ensemble‑)Erwartungswert lautet
  $$\langle A\rangle_\rho=\mathrm{Tr}(\rho\,A).$$

**Wichtig:** In der Quantenstatistik ist $\rho$ nicht nur „Unwissen“, sondern kann auch echte statistische Mischung darstellen (z.B. durch Verschränkung mit einer Umgebung oder durch Präparationsverfahren).

#### (b) Zeitentwicklung vs. Stationarität
Für ein abgeschlossenes System mit Hamiltonoperator $H$ gilt (unitär):
$$\rho(t)=U(t)\rho(0)U^\dagger(t),\qquad U(t)=e^{-iHt/\hbar}.$$

- **Stationärer Zustand**: $[\rho,H]=0 \Rightarrow \rho(t)=\rho$ und damit $\langle A\rangle$ zeitlich konstant.
- Ein Energieeigenzustand $|E_n\rangle$ ist stationär (bis auf Phase); trotzdem können **nicht-kommutierende** Observablen in reinen Zuständen nicht „klassisch“ wie Koordinaten entlang einer Bahn interpretiert werden.

---

### 8.3 Quanten-Analogon der Ergodizität: Welche Gleichsetzung ist gemeint?
In der Praxis möchte man oft eine Brücke schlagen zwischen:

- **zeitabhängiger Dynamik eines isolierten Systems** (aus einem Anfangszustand)
- und **Gleichgewichtsrechnungen** mit einem Ensemble (mikrokanonisch/kanonisch/großkanonisch).

Dafür werden in der Quantenstatistik typischerweise **zwei** (verwandte, aber verschiedene) Aussagen diskutiert:

#### (1) Gleichsetzung von Zeitmitteln und „diagonalem Ensemble“
Für einen reinen Anfangszustand $|\psi(0)\rangle=\sum_n c_n |E_n\rangle$ gilt für die zeitliche Entwicklung von Erwartungswerten:
$$\langle A\rangle(t)=\langle \psi(t)|A|\psi(t)\rangle.$$

Der **Langzeit‑Zeitmittelwert** (unter milden Nicht‑Entartungsannahmen der Energiedifferenzen) wird
$$\overline{\langle A\rangle}=\lim_{T\to\infty}\frac{1}{T}\int_0^T \langle A\rangle(t)\,dt
= \sum_n |c_n|^2\, A_{nn},\qquad A_{nn}=\langle E_n|A|E_n\rangle.$$

Das entspricht einem Ensemble mit
$$\rho_{\mathrm{diag}}=\sum_n |c_n|^2 |E_n\rangle\langle E_n|,\qquad
\overline{\langle A\rangle}=\mathrm{Tr}(\rho_{\mathrm{diag}}A).$$

**Interpretation:** Das „Zeitmittel“ löscht Kohärenzen im Energiebasis-Sinne (Dephasierung), ohne dass das System mit einem Bad wechselwirken muss.

#### (2) Thermalisation: Warum wird daraus ein thermisches Ensemble?
Damit man in der Praxis $\rho_{\mathrm{diag}}$ durch ein **thermisches** $\rho$ ersetzt, braucht man zusätzliche Annahmen. Typische Formulierungen:

- **Mikrokanonische Typicality:** Wenn $|c_n|^2$ im Wesentlichen nur in einem schmalen Energiefenster um $E$ ungleich null ist (kleine relative Energiefluktuation), dann können viele Observablen gut durch ein mikrokanonisches Ensemble beschrieben werden:
  $$\rho_{\mathrm{mc}} \propto \sum_{E_n\in [E-\Delta,E+\Delta]} |E_n\rangle\langle E_n|.$$
- **ETH (Eigenstate Thermalization Hypothesis)** für nicht‑integrable (chaotische) Systeme: Für „einfache“ (lokale, wenige Freiheitsgrade betreffende) Observablen $A$ sind die Diagonalelemente $A_{nn}$ glatte Funktionen der Energie, sodass
  $$A_{nn}\approx A(E_n)\quad\Rightarrow\quad \sum_n |c_n|^2 A_{nn}\approx A(E)$$
  und $A(E)$ mit dem mikrokanonischen (und oft auch kanonischen) Mittelwert übereinstimmt.

**Merke:** In der Quantenstatistik bedeutet „Ergodizität“ in Rechnungen meist nicht „Trajektorie füllt die Energiefläche“, sondern „Langzeitwerte einfacher Observablen werden durch ein Ensemble (oft thermisch) reproduziert“.

---

### 8.4 Messgrößen: Was ist „typisch“ und was kann schiefgehen?
#### (a) Observablenklassen
In vielen Vielteilchensystemen ist entscheidend, **welche** Messgrößen betrachtet werden:

- **Lokale / wenige‑Teilchen‑Observablen** (z.B. Dichte an einem Ort, lokale Korrelationen) thermalisierten oft gut.
- **Hochgradig nicht‑lokale Observablen** (z.B. Projektor auf einen speziellen Viele‑Teilchen‑Basiszustand) können extrem empfindlich auf Mikrodynamik sein und müssen nicht „thermisch“ aussehen.
- **Erhaltungsgrößen** (kommutieren mit $H$) bleiben konstant und können Thermalisation einschränken.

#### (b) Fluktuationen und Rekurrenzen (Edge Cases)
Auch wenn Zeitmittelwerte existieren, heißt das nicht:

- dass $\langle A\rangle(t)$ **konstant** ist (nur das Zeitmittel ist fix),
- oder dass es keine **Quantenrekurrenzen** gibt (bei endlichem Hilbertraum bzw. diskretem Spektrum können Zustände näherungsweise zurückkehren; Rekurrenzzeiten sind oft astronomisch groß).

Für praktische Quantenstatistik nimmt man häufig an:
- interessierende Zeiten $\ll$ Rekurrenzzeit,
- Messapparatur/Umgebung bewirken zusätzliche Dephasierung (effektive Irreversibilität).

---

### 8.5 Gleichgewicht in der Quantenstatistik: stationär vs. „thermisch“
Eine zentrale Unterscheidung:

| Begriff | Quantendefinition | Konsequenz für Messgrößen |
|---|---|---|
| **stationär** | $[\rho,H]=0$ | $\langle A\rangle$ zeitlich konstant, aber nicht zwingend „thermisch“ |
| **thermisch (Gleichgewicht im statistischen Sinn)** | $\rho$ hat Gibbs-Form (z.B. kanonisch) oder reproduziert Gleichgewichtswerte für relevante Observablen | typische lokale Observablen stimmen mit Ensemblewerten überein |

Beispiel: Ein System kann in einem stationären Zustand sein, der stark von Gibbs abweicht (z.B. Projektor auf ein einzelnes Energieeigenstate bei integrablen Systemen), und dennoch sind viele Observablen zeitunabhängig.

---

### 8.6 Typische Ensembles als Dichtematrizen (Kernformeln)
In der Quantenstatistik sind Ensembles direkt als Dichteoperatoren formuliert:

- **Kanonisches Ensemble**:
  $$\rho_{\mathrm{can}}=\frac{e^{-\beta H}}{Z},\qquad Z=\mathrm{Tr}\left(e^{-\beta H}\right),\qquad \langle A\rangle=\mathrm{Tr}(\rho_{\mathrm{can}}A).$$
- **Großkanonisches Ensemble** (für Teilchenzahloperator $N$):
  $$\rho_{\mathrm{gc}}=\frac{e^{-\beta(H-\mu N)}}{\Xi},\qquad \Xi=\mathrm{Tr}\left(e^{-\beta(H-\mu N)}\right).$$

**Konzeptueller Punkt:** Diese $\rho$ sind nicht „aus Zeitmitteln hergeleitet“, sondern werden als effektive Beschreibung benutzt, wenn:
- das System (oder ein Teilsystem) mit einem Reservoir gekoppelt ist, oder
- Typicality/ETH‑Argumente nahelegen, dass lokale Observablen so aussehen, **als ob** $\rho$ von Gibbs‑Form wäre.

---

### 8.7 Integrabilität, Quantenchaos, Thermalisation: Wann funktioniert die Ersatzbeschreibung?
#### (a) Nicht‑integrable („chaotische“) Systeme
Typisches Bild in der Quantenstatistik:
- wenige Erhaltungsgrößen (Energie, evtl. Teilchenzahl),
- ETH gilt (für lokale Observablen),
- **Thermalisation**: Nach Relaxation sind lokale Observablen gut durch mikrokanonisch/kanonisch beschreibbar.

Praktische Konsequenz: Man kann Erwartungswerte oft berechnen als
$$\langle A\rangle \approx \mathrm{Tr}(\rho_{\mathrm{can}}A)$$
selbst wenn das Gesamtsystem isoliert ist, solange man nur „grobe“/lokale Observablen betrachtet und der Anfangszustand ein schmales Energiefenster hat.

#### (b) Integrable Systeme (viele Erhaltungsgrößen)
Bei Integrabilität gibt es viele zusätzliche, miteinander kommutierende Erhaltungsgrößen $I_k$.

- Dann ist die naive Gibbs‑Form oft **falsch** für Langzeitwerte.
- Stattdessen tritt häufig ein **Generalized Gibbs Ensemble (GGE)** auf:
  $$\rho_{\mathrm{GGE}}\propto \exp\left(-\sum_k \lambda_k I_k\right),\qquad
  \langle I_k\rangle \text{ wird durch }\lambda_k\text{ fixiert.}$$

**Edge Case:** Freie Fermionen/Bosonen (quadratische Hamiltonians) sind prototypisch integrabel; viele Modenbesetzungen sind erhalten.

#### (c) Many‑Body Localization (MBL) / starke Unordnung (wichtiger Grenzfall)
- Systeme können trotz Wechselwirkung **nicht thermalisieren** (lokalisierte Eigenzustände).
- Es existieren effektiv viele lokale Integrale der Bewegung; lokale Observablen behalten Gedächtnis an den Anfangszustand.
- Ensemblemittelwerte (Gibbs) sind dann keine gute Beschreibung der Langzeitwerte.

---

### 8.8 Messprozess und Ensemble: Warum Quantenstatistik „ensemble‑zentriert“ ist
Ein weiterer konzeptueller Unterschied zur klassischen Intuition:

- Einzelmessungen liefern Eigenwerte, aber **Statistik** entsteht erst über Wiederholungen (Ensemble identisch präparierter Systeme) oder über viele Freiheitsgrade/Teilsysteme.
- Der Dichteoperator $\rho$ ist die zentrale Brücke zwischen Präparation und Messstatistik:
  - Für Projektivmessung mit Projektoren $\Pi_a$ gilt Born:
    $$p(a)=\mathrm{Tr}(\rho\,\Pi_a).$$
  - Erwartungswerte sind lineare Funktionale in $\rho$:
    $$\langle A\rangle=\mathrm{Tr}(\rho A).$$

**Kernaussage:** In der Quantenstatistik ersetzt die Arbeit mit $\rho$ und Ensemble‑Mittelwerten den klassischen Rückgriff auf Trajektorien und Zeitmittelwerte. Zeitmittel spielen eher eine Rolle als **Begründung**, warum gewisse (diagonale/thermische) $\rho$ effektiv sind.

---

### 8.9 Mini-Beispiele (mit typischen Fallstricken)
- **Zweizustandssystem (sehr kleiner Hilbertraum):** Quantenrekurrenzen sind schnell; „Relaxation“ ist oft nur Quasiperiodizität. Ein thermisches Ensemble ist als Beschreibung eines isolierten Systems kaum motivierbar.
- **Großes Vielteilchensystem, nicht‑integrabel:** Lokale Observablen relaxieren; $\rho_{\mathrm{can}}$ oder $\rho_{\mathrm{mc}}$ liefert korrekte Werte (praktische Rechenbasis).
- **Integrables Gittermodell (z.B. freie Fermionen):** Relaxation ja, aber zu GGE statt Gibbs; falsche Wahl von $\rho$ führt zu systematischen Fehlern in Korrelationen/Besetzungszahlen.
- **MBL:** Keine Thermalisation; Anfangszustandsabhängigkeit bleibt, Ensemble-Ansatz scheitert für viele lokale Observablen.

---

---

## Quick Reference: Key Formulas

### Statistische Physik / Ensembles (Zustandssummen)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Mikrokanonische Zustandssumme (Anzahl zugänglicher Zustände) | $$\Omega=\sum_{E \leq \mathcal{H} \leq E+\Delta E} 1$$ | $\Omega$: Zahl der Mikrozustände; $\mathcal{H}$: Hamiltonfunktion; $E$: Energie; $\Delta E$: Energiefenster |
| Kanonische Zustandssumme (Partition function) | $$Z=\sum_{r} \mathrm{e}^{-\beta E_{r}}$$ | $Z$: Zustandssumme; Summe über Zustände $r$; $E_r$: Energie des Zustands $r$; $\beta$: inverse Temperatur ($=1/(k_B T)$, implizit) |

---

### Thermodynamik
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Erster Hauptsatz (Differentialform) | $$\mathrm{d}U=\delta Q+\delta W$$ | $U$: innere Energie; $\delta Q$: zu-/abgeführte Wärme; $\delta W$: verrichtete/zugeführte Arbeit |
| Wirkungsgrad (angegeben inkl. Temperaturform) | $$\eta=1-\frac{\Delta W}{\delta Q}=1-\frac{T_{1}}{T_{2}}$$ | $\eta$: Wirkungsgrad; $\Delta W$: (Netto-)Arbeit; $\delta Q$: zugeführte Wärme; $T_1,T_2$: Temperaturen (wie im Material angegeben) |
| Zusammenhang \(Q\) und Entropie-Ableitung (wie angegeben) | $$Q=\frac{\partial S}{\partial T}$$ | $Q$: Wärme (wie notiert); $S$: Entropie; $T$: Temperatur |

---

### Quantenstatistik (Kriterium für Quantenentartung)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Thermische Wellenlänge | $$\lambda=\frac{h}{\sqrt{2 \pi m k_{B} T}}$$ | $\lambda$: thermische de-Broglie-Wellenlänge; $h$: Planck-Konstante; $m$: Masse; $k_B$: Boltzmann-Konstante; $T$: Temperatur |
| Mittlerer Teilchenabstand aus Dichte | $$l=\left(\frac{1}{\rho}\right)^{1 / 3}$$ | $l$: mittlerer Teilchenabstand; $\rho$: Teilchendichte |

---

### Schwarzer Strahler / Planckverteilung
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Spektrale Energiedichte (wie im Material angegeben, 3D) | $$u(\omega)=\frac{\hbar \omega^{3}}{\pi^{2} c^{3} \mathrm{e}^{\beta \hbar \omega}}$$ | $u(\omega)$: spektrale Energiedichte; $\omega$: Kreisfrequenz; $\hbar$: reduzierte Planck-Konstante; $c$: Lichtgeschwindigkeit; $\beta$: inverse Temperatur |
| Planckverteilung in 1D (wie im Material angegeben) | $$u(\omega)=\frac{\hbar \omega}{\pi c \mathrm{e}^{-\beta \hbar \omega}-1}$$ | $u(\omega)$: spektrale Größe; $\omega$: Kreisfrequenz; $\hbar$: reduzierte Planck-Konstante; $c$: Lichtgeschwindigkeit; $\beta$: inverse Temperatur |

---

### Kombinatorik / Zählfaktoren (Besetzungen, wie notiert)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Anzahl Konfigurationen (zwei Varianten wie angegeben) | $$M^{N} \quad \text { bzw. } \quad \frac{M^{N}}{N!}$$ | $M$: Anzahl verfügbarer Zustände/Plätze (wie impliziert); $N$: Teilchenzahl; $N!$: Faktor für Ununterscheidbarkeit (wie angedeutet) |
