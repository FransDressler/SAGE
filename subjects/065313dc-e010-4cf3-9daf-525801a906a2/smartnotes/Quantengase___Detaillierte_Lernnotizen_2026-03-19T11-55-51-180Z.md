# Quantengase – Detaillierte Lernnotizen

## 1. Grundlagen: Was ist ein Quantengas?

Ein **Quantengas** ist ein Vielteilchensystem (typisch $N\sim 10^{23}$, aber auch deutlich kleiner in kalten Atomgasen), dessen thermodynamische Eigenschaften **nicht** mehr durch klassische Teilchenstatistik (Maxwell–Boltzmann) beschrieben werden können, weil **Quantenmechanik und Teilchen-Ununterscheidbarkeit** dominieren. Die zentrale Unterscheidung zu klassischen Gasen ist: In einem Quantengas sind die Einteilchen-Wellenfunktionen so ausgedehnt, dass sie **überlappen**, und die Vielteilchen-Wellenfunktion muss **Symmetriebedingungen** unter Teilchenvertauschung erfüllen.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/360c9b27-7239-49bb-b5c3-1790ec3c8f12/95d38105-dabe-4631-a371-24ef87ae58b0-12_418_846_792_174.jpg)

---

### 1.1 Abgrenzung: klassisches ideales Gas vs. Quantengas

**Klassisches ideales Gas (Maxwell–Boltzmann, MB):**
- Teilchen sind (effektiv) **unterscheidbar**, oder Ununterscheidbarkeit ist praktisch irrelevant.
- **Besetzungszahlen** pro Einteilchenzustand sind klein: $n_i \ll 1$ (keine statistische Korrelation durch Symmetrie).
- Gültig bei **hohen Temperaturen** und/oder **niedrigen Dichten**.
- Zustandsgleichung: $pV = Nk_B T$ (für nicht-wechselwirkende Teilchen; Wechselwirkungen werden vernachlässigt).

**Quantengas (Bose- oder Fermi-Gas):**
- Teilchen sind **fundamental ununterscheidbar**.
- Die Vielteilchen-Wellenfunktion ist
  - **symmetrisch** (Bosonen) oder
  - **antisymmetrisch** (Fermionen) unter Teilchenaustausch.
- Daraus folgen **kollektive** und **statistische** Effekte (Pauli-Blockade, Bose-Verstärkung), selbst ohne Wechselwirkungen.

> Merke: Ein Gas kann **ideal** (nicht wechselwirkend) sein und dennoch ein **Quantengas**, wenn die Quantenstatistik relevant ist.

---

### 1.2 Wann werden Quanteneffekte relevant? Thermische de-Broglie-Wellenlänge

Ein praktisches Kriterium ist der Vergleich von
- **thermischer de-Broglie-Wellenlänge** $\lambda_T$ und
- **mittlerem Teilchenabstand** $\ell$.

**Thermische Wellenlänge:**
$$
\lambda_T=\frac{h}{\sqrt{2\pi m k_B T}}
$$

**Mittlerer Abstand (bei Teilchendichte $n=N/V$):**
$$
\ell \sim n^{-1/3}
$$

**Quantendegenerations-Bedingung:**
- Quantenstatistik wird wichtig, wenn sich Wellenfunktionen überlappen:
$$
\lambda_T \gtrsim \ell
\quad \Longleftrightarrow \quad
n\lambda_T^3 \gtrsim 1
$$

**Interpretation:**
- $\lambda_T$ wird groß bei **kleiner Masse $m$** und **tiefer Temperatur $T$**.
- Überlapp wird wahrscheinlicher bei **hoher Dichte $n$**.

**Edge Cases / wichtige Hinweise:**
- Für **sehr schwere Teilchen** (z. B. große Moleküle) ist $\lambda_T$ bei gleichen $T$ kleiner → Quantenstatistik erst bei extrem tiefen $T$ oder extrem hoher $n$.
- In **niedrigen Dimensionen** (2D/1D) ändern sich Skalen und Phasenübergänge: z. B. in 2D keine ideale BEC im homogenen System im thermodynamischen Limes; stattdessen z. B. Kosterlitz–Thouless-Physik (trotzdem bleibt $n\lambda_T^d$ eine nützliche Degenerationsintuition).
- Bei sehr hoher Dichte können **Wechselwirkungen** oder **Relativistik** dominant werden (z. B. Elektronen in Weißen Zwergen). Dann ist „ideales Quantengas“ nur ein Startpunkt.

---

### 1.3 Ununterscheidbarkeit und Symmetrie der Vielteilchen-Wellenfunktion

Für identische Teilchen erzwingt Quantenmechanik beim Vertauschen zweier Teilchen $1\leftrightarrow 2$:

- **Bosonen (ganzzahliger Spin):**
  $$
  \Psi(\dots,\mathbf{r}_1,\dots,\mathbf{r}_2,\dots)=+\Psi(\dots,\mathbf{r}_2,\dots,\mathbf{r}_1,\dots)
  $$
  Konsequenz: **Mehrfachbesetzung** eines Zustands erlaubt $\Rightarrow$ Tendenz zu **Bunching**, Möglichkeit der **Bose–Einstein-Kondensation (BEC)**.

- **Fermionen (halbzahliger Spin):**
  $$
  \Psi(\dots,\mathbf{r}_1,\dots,\mathbf{r}_2,\dots,\mathbf{r}_1,\dots)=-\Psi(\dots,\mathbf{r}_2,\dots,\mathbf{r}_1,\dots)
  $$
  Konsequenz: **Pauli-Prinzip**: Kein Einteilchenzustand kann doppelt besetzt werden (pro Spin-Zustand). Das führt zu **Fermi-Druck** und **Pauli-Blockade**.

---

### 1.4 Zentrale Skalen: Phasenraumdichte und Entartungsparameter

#### (a) Phasenraumdichte $D = n\lambda_T^3$

Die dimensionslose Größe
$$
D := n\lambda_T^3
$$
heißt **Phasenraumdichte**. Sie misst anschaulich:
- wie viele Teilchen sich „im Volumen“ eines quantenmechanischen Wellenpakets befinden,
- bzw. wie stark **Quantenüberlappung** ist.

**Regime:**
- $D \ll 1$: klassisches, nicht-entartetes Gas (MB-Grenze).
- $D \gtrsim 1$: Quantengas (Bose- oder Fermi-Statistik nötig).
- $D \gg 1$: stark entartet (tiefe $T$, hohe $n$).

> Für ideale Bosegase ist $D$ auch direkt mit dem Auftreten von BEC verknüpft (im 3D-homogenen Fall liegt der kritische Wert bei $D_c \approx 2{,}612$).

#### (b) Entartungsparameter über Energieskalen: $T/T_F$ bzw. $T/T_c$

Oft nutzt man statt $D$ ein Verhältnis von Temperatur zu einer charakteristischen Quantenskala.

**Fermigas (Fermi-Temperatur $T_F$):**
- Bei $T=0$ sind Zustände bis zur **Fermi-Energie** $E_F$ gefüllt.
- $T_F$ definiert über $E_F = k_B T_F$.
- Quantendegeneration: $T \ll T_F$.

**Bosegas (kritische Temperatur $T_c$ für BEC, ideal/homogen/3D):**
- BEC tritt auf, wenn $T \lesssim T_c$.
- Quantendegeneration: $T \lesssim T_c$.

Diese Parameter sind besonders praktisch in Experimenten, weil $T$, $n$ und die Fallen-Geometrie (bei ultrakalten Gasen) oft direkt messbar oder steuerbar sind.

---

### 1.5 Besetzungszahlen und chemisches Potential (Qualitativ)

In der Quantenstatistik betrachtet man **Einteilchenzustände** mit Energie $E$ und deren mittlere Besetzung $\langle n(E)\rangle$ im großkanonischen Ensemble. Zentral ist das **chemische Potential** $\mu$, das die Teilchenzahl kontrolliert (Teilchenaustausch mit Reservoir).

| Statistik | Teilchen | mittlere Besetzung $\langle n(E)\rangle$ | Charakteristika |
|---|---|---|---|
| Maxwell–Boltzmann (klassisch) | „klassisch“ | $$\langle n\rangle = e^{-(E-\mu)/k_BT}$$ | gültig für $\langle n\rangle \ll 1$ |
| Fermi–Dirac | Fermionen | $$\langle n\rangle=\frac{1}{e^{(E-\mu)/k_BT}+1}$$ | $\langle n\rangle \le 1$ (pro Zustand) |
| Bose–Einstein | Bosonen | $$\langle n\rangle=\frac{1}{e^{(E-\mu)/k_BT}-1}$$ | Divergenz möglich für $E\to \mu$ (BEC) |

**Klassischer Grenzfall:**
- Für $E-\mu \gg k_B T$ gilt näherungsweise
$$
\frac{1}{e^{(E-\mu)/k_BT}\pm 1} \approx e^{-(E-\mu)/k_BT}
$$
⇒ Beide Quantengas-Verteilungen gehen in MB über.

**Wichtige Aussagen über $\mu$:**
- **Fermionen:** Bei $T\to 0$ gilt typischerweise $\mu \to E_F$.
- **Bosonen:** Für ein ideales Bosegas gilt stets $\mu \le E_0$ (Grundzustandsenergie, oft $E_0=0$ gesetzt). Für $T\downarrow T_c$ nähert sich $\mu$ von unten dem Grundzustand an, $\mu \to E_0^{-}$; unterhalb $T_c$ wird der Überschuss an Teilchen im Kondensat gesammelt.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-30_306_656_311_1650.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-30_280_673_730_1641.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-35_317_637_1383_431.jpg)

---

### 1.6 Qualitative Beispiele (inkl. Randfälle)

#### (a) Elektronengas in Metallen: entartetes Fermigas
- Leitungselektronen haben hohe Dichte $n$ und kleine Masse $m$ ⇒ $n\lambda_T^3 \gg 1$ bei Raumtemperatur.
- Konsequenzen:
  - Nur Elektronen nahe $E_F$ können thermisch angeregt werden ⇒ viele Eigenschaften skalieren mit $T/T_F \ll 1$.
  - **Fermi-Druck** existiert schon ohne Wechselwirkung und stabilisiert Materie (auch in extremen astrophysikalischen Objekten).

**Randfall:** Bei extrem hohen Dichten werden Elektronen relativistisch; dann ändern sich Dispersion und Zustandsgleichung (Theorie: relativistisches Fermigas).

#### (b) Ultrakalte Atomgase: „saubere“ Bose- und Fermi-Quantengase
- Verdünnte Gase in magneto-optischen/optischen Fallen bei $T$ im $\mu$K–nK-Bereich ⇒ $\lambda_T$ wird groß.
- Eigenschaften:
  - **Bosegase** (z. B. $^{87}$Rb, $^{23}$Na): BEC mit makroskopischer Grundzustandsbesetzung, Kohärenz.
  - **Fermigase** (z. B. $^{6}$Li, $^{40}$K): Fermi-See, Pauli-Blockade; bei Wechselwirkungen Superfluidität (BCS–BEC-Crossover).

**Edge Case:** Wechselwirkungen sind oft klein, aber nicht null:
- „Ideales Quantengas“ ist die Referenz; reale ultrakalte Gase erlauben jedoch gezielte Tuning der Wechselwirkung (z. B. Feshbach-Resonanzen), wodurch neue Phänomene über reine Statistik hinaus auftreten.

---

### 1.7 Einordnung: „Quantengas“ ist nicht gleich „Quantenflüssigkeit“
- **Quantengas** bezieht sich primär auf die Notwendigkeit von **Bose-/Fermi-Statistik** (Ununterscheidbarkeit, Symmetrie, Besetzungszahlen, $\mu$).
- Bei sehr hoher Dichte oder starken Wechselwirkungen kann das System eher eine **Quantenflüssigkeit** werden (z. B. flüssiges Helium), wo Korrelationen/Wechselwirkungen entscheidend sind.
- Dennoch bleibt das idealisierte Bose-/Fermi-Gas der Ausgangspunkt zum Verständnis.

---

### 1.8 Kurz-Zusammenfassung (Prüfungsstil)
- **Quantenstatistik nötig**, wenn $\lambda_T$ mit mittlerem Teilchenabstand vergleichbar ist: $n\lambda_T^3 \gtrsim 1$.
- **Bosonen:** symmetrische Vielteilchenwellenfunktion ⇒ Mehrfachbesetzung ⇒ BEC möglich.
- **Fermionen:** antisymmetrisch ⇒ Pauli-Prinzip ⇒ Besetzungen $\le 1$ ⇒ Fermi-Kante/Fermi-Druck.
- **Chemisches Potential $\mu$** steuert Besetzungen: FD/BE-Verteilung; im Grenzfall $E-\mu\gg k_BT$ ergibt sich MB.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-09_357_405_1437_1806.jpg)

## 3. Ideales Fermigas: Entartungsdruck und kollektive Skalen

### 3.1 Motivation & Quantengas-Kriterium (kollektive Skalen)
Ein **ideales Fermigas** besteht aus **nicht wechselwirkenden** Fermionen (Spin $S$), deren Vielteilchenwellenfunktion **antisymmetrisch** ist. Daraus folgt das **Pauli-Prinzip**: Pro Einteilchenzustand maximal eine Besetzung (pro Spin).

**Wann wird Quantenstatistik wichtig?**
- Quantenentartung, wenn die **thermische Wellenlänge**
  $$\lambda_T=\sqrt{\frac{h^2}{2\pi m k_B T}}$$
  mit dem mittleren Teilchenabstand vergleichbar wird:
  $$n\lambda_T^3 \gtrsim 1,\qquad n=\frac{N}{V}.$$
- Für Fermionen entsteht dann eine neue Energieskala: **Fermi-Energie** $E_F$ (bzw. **Fermi-Temperatur** $T_F=E_F/k_B$). Typisch gilt oft $T\ll T_F$ (z.B. Elektronen in Metallen).

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-04_741_1634_427_369.jpg)

---

### 3.2 Besetzungszahlen: Fermi–Dirac-Verteilung, chemisches Potential
Im großkanonischen Ensemble ist die mittlere Besetzung eines Zustands der Energie $E$:
$$f_{FD}(E)=\langle n(E)\rangle=\frac{1}{e^{\beta(E-\mu)}+1},\qquad \beta=\frac{1}{k_B T}.$$

**Wichtige Eigenschaften**
- $0\le f_{FD}\le 1$ (Pauli-Prinzip).
- Bei $T\to 0$ wird $f_{FD}$ zur **Stufenfunktion**:
  $$f_{FD}(E)\xrightarrow[T\to0]{}\Theta(E_F-E),\qquad \mu(T=0)=E_F.$$
- Bei hohen Temperaturen / kleiner Fugazität $z=e^{\beta\mu}\ll 1$ geht $f_{FD}$ in die **Maxwell–Boltzmann**-Form über:
  $$f_{FD}(E)\approx z e^{-\beta E}.$$

**Chemisches Potential**
- Für ein stark entartetes Fermigas ($T\ll T_F$) gilt näherungsweise:
  $$\mu(T)\approx E_F\left[1-\frac{\pi^2}{12}\left(\frac{T}{T_F}\right)^2+\dots\right].$$
  (Die Abnahme ist klein: Nur Zustände nahe $E_F$ werden thermisch „verwischt“.)

---

### 3.3 Zustandsdichte in 3D (Box) und Fermi-Kugel
Für freie Teilchen in 3D mit Dispersion $E=\frac{\hbar^2 k^2}{2m}$ ist die **Zustandsdichte**
$$D(E)=\frac{g_S V}{4\pi^2}\left(\frac{2m}{\hbar^2}\right)^{3/2}\sqrt{E},\qquad g_S=2S+1.$$

#### Fermi-Kugel (Impulsraum)
Bei $T=0$ werden alle Zustände bis zum **Fermi-Vektor** $k_F$ gefüllt:
- Besetzter Bereich: $|\mathbf{k}|\le k_F$ = **Fermi-Kugel**
- Fermi-Energie:
  $$E_F=\frac{\hbar^2 k_F^2}{2m}.$$
- Zusammenhang mit Dichte $n=N/V$:
  $$N=g_S\frac{V}{6\pi^2}k_F^3\quad\Rightarrow\quad k_F=\left(\frac{6\pi^2 n}{g_S}\right)^{1/3}.$$

**Weitere kollektive Skalen**
- **Fermi-Geschwindigkeit**: $v_F=\hbar k_F/m$
- **Fermi-Temperatur**: $T_F=E_F/k_B$

---

### 3.4 Entartungsdruck bei $T\approx 0$: rein quantenmechanisch
Auch bei $T=0$ besitzt das Fermigas wegen der notwendigen Auffüllung bis $E_F$ eine endliche kinetische Energie und damit einen endlichen Druck: **Entartungsdruck**.

#### Energie und Druck bei $T=0$ (nichtrelativistisch)
Gesamtenergie:
$$U_0=\int_0^{E_F} dE\, E\, D(E)=\frac{3}{5}N E_F.$$

Druck (für freie Teilchen, nichtrelativistisch gilt virialartig):
$$p_0=\frac{2}{3}\frac{U_0}{V}=\frac{2}{5}nE_F.$$

Alternative Form in $k_F$:
$$p_0=\frac{g_S}{15\pi^2}\frac{\hbar^2}{m}k_F^5.$$

**Interpretation (Warum gibt es Druck ohne Temperatur?)**
- Klassisch wäre bei $T=0$ alles im Grundzustand $\Rightarrow p=0$.
- Für Fermionen verhindert das Pauli-Prinzip die „Akkumulation“ im Grundzustand: Viele Impulszustände müssen besetzt werden $\Rightarrow$ endliche mittlere Impulse $\Rightarrow$ Impulsfluss an die Wand $\Rightarrow$ Druck.

**Kompressibilität / Skalenverhalten**
- Nichtrelativistisch: $E_F\propto n^{2/3}\Rightarrow p_0\propto n^{5/3}$.
- Damit ist das Fermigas bei hoher Dichte „steif“: Druck wächst schneller als linear mit $n$.

---

### 3.5 Endliche Temperatur: Zustandsgleichungen und Fermi-Integrale
Für das ideale Fermigas (3D) lassen sich Teilchenzahl und Druck mit **Fermi-Integralen** ausdrücken. Definiere
- Fugazität $z=e^{\beta\mu}$
- $\lambda_T=\sqrt{\frac{h^2}{2\pi m k_BT}}$

Dann gilt:
$$\frac{N}{V}=\frac{g_S}{\lambda_T^3}f_{3/2}(z),\qquad
\frac{p}{k_BT}=\frac{g_S}{\lambda_T^3}f_{5/2}(z),$$
und für freie Teilchen weiterhin
$$U=\frac{3}{2}pV.$$

Hier sind $f_\nu(z)$ die (dimensionslosen) Fermi–Dirac-Integrale:
$$f_\nu(z)=\frac{1}{\Gamma(\nu)}\int_0^\infty dx\,\frac{x^{\nu-1}}{z^{-1}e^x+1}.$$

**Grenzfälle**
- **Klassisch** ($z\ll1$): $f_\nu(z)\approx z$  
  $\Rightarrow pV\approx Nk_BT$.
- **Stark entartet** ($T\ll T_F$): thermische Korrekturen sind $\propto (T/T_F)^2$ für $U,p,\mu$.

---

### 3.6 Wärmekapazität $C_V$: linear in $T$ (Sommerfeld-Argument)
Beim entarteten Fermigas ($T\ll T_F$) können nur Teilchen in einem Energieband der Breite $\sim k_BT$ um $E_F$ angeregt werden. Der Anteil der „aktiven“ Teilchen ist daher $\sim T/T_F$.

Ergebnis (3D, nichtrelativistisch):
$$C_V=\left(\frac{\partial U}{\partial T}\right)_V \approx \frac{\pi^2}{2}N k_B\frac{T}{T_F}.$$

**Kontrast**
- Klassisches ideales Gas: $C_V=\frac{3}{2}Nk_B$ (temperaturunabhängig).
- Fermigas: bei kleinen $T$ viel kleiner, wächst **linear**.

**Edge Case:** Für $T\gtrsim T_F$ verschwindet die Entartung; $C_V$ nähert sich wieder dem klassischen Wert $\frac{3}{2}Nk_B$ (von unten).

---

### 3.7 Anwendungen in der Festkörperphysik: Elektronengas (Sommerfeld-Modell)
Im **Sommerfeld-Modell** werden Leitungselektronen als nahezu freie Fermionen in einem Volumen $V$ behandelt (effektive Masse $m^\ast$ möglich).

#### Typische Größenordnung
- Metalle: $n\sim 10^{28}\,\mathrm{m^{-3}}$, $g_S=2$
- Daraus: $E_F$ im Bereich **einiger eV**, $T_F\sim 10^4$–$10^5\,\mathrm{K}$
- Bei Raumtemperatur ($T\sim 300\,\mathrm{K}$) gilt meist **stark entartet**: $T/T_F\ll 1$

**Konsequenzen**
- Elektronischer Beitrag zur Wärmekapazität:
  $$C_V^{(el)}=\gamma T,\qquad \gamma\propto D(E_F).$$
  (In Metallen beobachtet man zusätzlich den phononischen Beitrag $\propto T^3$ bei tiefen $T$.)

---

### 3.8 Pauli-Paramagnetismus: Suszeptibilität $\chi$ (Spin-1/2-Fermigas)
Ein äußeres Magnetfeld $B$ spaltet Spin-Zustände (Zeeman-Energie $\pm \mu_B B$). Bei $T\ll T_F$ können nur Elektronen nahe $E_F$ umgeordnet werden.

Ergebnis für die **Pauli-Suszeptibilität** (qualitativ und Kernformel):
- Magnetisierung $M\propto D(E_F)\mu_B^2 B$
- Suszeptibilität (feldlinear):
  $$\chi_P=\mu_0 \mu_B^2 D(E_F) \quad \text{(für Spin-1/2, freie Elektronen)}.$$

**Wichtige Punkte**
- $\chi_P$ ist (bei tiefen $T$) nahezu **temperaturunabhängig**.
- Unterscheidung zu **Curie-Paramagnetismus** lokalisierter Momente: $\chi\propto 1/T$.
- **Edge Case:** Sehr starke Felder oder sehr tiefe Temperaturen $\Rightarrow$ Sättigungseffekte möglich, sobald Zeeman-Splitting mit der relevanten Energiefensterbreite konkurriert.

---

### 3.9 Astrophysik: Elektronen- und Neutronen-Entartungsdruck
In kompakten Sternen ist die Materie extrem dicht und oft kalt im Sinne von $T\ll T_F$; daher dominiert der Entartungsdruck.

#### Weiße Zwerge: Elektronen-Entartungsdruck
- Ionen liefern Masse/Gravitation, Elektronen liefern primär den Druck.
- Bei steigender Dichte werden Elektronen relativistisch: $E\approx pc$.

**Skalierung des Entartungsdrucks**
- Nichtrelativistisch: $p\propto n_e^{5/3}$
- Ultrarelativistisch: $p\propto n_e^{4/3}$

Diese Änderung in der Steifigkeit der Zustandsgleichung ist zentral für die Existenz einer maximalen stabilen Masse (Chandrasekhar-Grenze; Details oft in Astrophysik behandelt).

#### Neutronensterne: Neutronen-Entartungsdruck (und Wechselwirkungen)
- Nach Kollaps: Elektronen + Protonen $\to$ Neutronen (via inverser Beta-Prozesse).
- Druck kommt stark von **Neutronen-Entartung**, zusätzlich sind **starke Wechselwirkungen** wichtig (ideales Fermigas ist dann nur Startpunkt).

**Edge Cases / Grenzen der Idealisierung**
- Sehr hohe Dichten: relativistische Effekte + Wechselwirkungen $\Rightarrow$ Abweichung vom idealen Fermigas.
- Sehr niedrige Dichten/höhere Temperaturen: Übergang zum klassischen Gas.

---

### 3.10 Überblick: zentrale Formeln (3D, freie Fermionen)

| Größe | $T=0$ (nichtrelativistisch) | Interpretation |
|---|---:|---|
| Fermi-Vektor | $k_F=\left(\frac{6\pi^2 n}{g_S}\right)^{1/3}$ | Radius der Fermi-Kugel |
| Fermi-Energie | $E_F=\frac{\hbar^2 k_F^2}{2m}$ | chem. Potential bei $T=0$ |
| Gesamtenergie | $U_0=\frac{3}{5}NE_F$ | Nullpunktsenergie durch Pauli |
| Entartungsdruck | $p_0=\frac{2}{5}nE_F$ | Druck bei $T=0$ |
| Wärmekapazität | $C_V\approx \frac{\pi^2}{2}Nk_B\frac{T}{T_F}$ | nur Zustände nahe $E_F$ aktiv |

---

### 3.11 Bildbezug (aus dem Material): Zustandsgrößen & „klassisch vs. quanten“
Die folgenden Abbildungen im Skript kontrastieren klassische Thermodynamik (Zustandsgleichungen) mit dem Quantenbild der Besetzungen/Entartung:

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c134a79d-211c-48b2-8149-eecc863d2479/0e8667e3-37d6-412b-8e95-93029ab5c7af-13_524_2622_845_147.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/6fac9b6b-164b-458b-8641-d3de80d95941/d0653f65-ad75-4a1e-b8e9-95eed85c6bb5-11_624_788_322_2123.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/6fac9b6b-164b-458b-8641-d3de80d95941/d0653f65-ad75-4a1e-b8e9-95eed85c6bb5-11_662_656_1415_137.jpg)

---

### 3.12 Typische Prüfungsfragen / Stolperstellen
- **Warum** ist $C_V$ bei Fermionen für kleine $T$ **linear**?  
  $\Rightarrow$ Nur ein Bruchteil $\sim T/T_F$ der Teilchen nahe $E_F$ kann Energie aufnehmen.
- **Warum** gibt es bei Fermionen einen Druck bei $T=0$?  
  $\Rightarrow$ Pauli-Prinzip erzwingt endliche Impulse (Fermi-Kugel).
- **Wie** unterscheiden sich Bose- und Fermiverteilungen grafisch?  
  Fermionen: S-förmige Kurve, bei $T\to 0$ Stufe; Bosonen können makroskopisch besetzen.
- **Welche Rolle spielt $\mu$?**  
  Bei Fermionen bleibt $\mu$ bei tiefen $T$ nahe $E_F$ und bestimmt die Lage der „Fermi-Kante“.
- **Wo versagt** das ideale Fermigas?  
  Starke Wechselwirkungen (Neutronensterne), Bandstruktur/Wechselwirkungen in Festkörpern (Fermi-Fläche statt Kugel), relativistische Korrekturen bei extremen Dichten.

## 4. Ideales Bosegas: Bose-Einstein-Kondensation (BEC)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-04_741_1634_427_369.jpg)

### 4.1 Ausgangspunkt: Bose-Einstein-Verteilung, Fugazität und chemisches Potential
- Für **nichtwechselwirkende** Bosonen (ideales Bosegas) im großkanonischen Ensemble:
  - **Besetzungszahl** eines Einteilchenzustands mit Energie $E$:
    $$\bar{n}(E)=\frac{1}{z^{-1}e^{\beta E}-1}=\frac{1}{e^{\beta(E-\mu)}-1},\qquad z=e^{\beta\mu},\ \beta=\frac{1}{k_BT}.$$
- Zentrale Einschränkung für Bosonen im Gleichgewicht:
  - Damit $\bar{n}(E)\ge 0$ endlich bleibt, muss für das **Energiespektrum mit Grundzustand** $E_0$ gelten:
    $$\mu\le E_0.$$
  - Üblich: Nullpunkt so wählen, dass $E_0=0$ $\Rightarrow$ **$\mu\le 0$** und **$0<z\le 1$**.
- **Thermische de-Broglie-Wellenlänge**:
  $$\lambda_T=\sqrt{\frac{2\pi\hbar^2}{mk_BT}}.$$
  Sie quantifiziert, wann das Gas „quantendegeneriert“ ist: $n\lambda_T^3\gtrsim 1$.

---

### 4.2 Zustandsgrößen im 3D-Kasten (Kontinuumsnäherung für angeregte Zustände)
Für ein 3D-Gas im Volumen $V$ (Kastenpotential) mit Spin-Entartung $g_S=2S+1$:

- Teilchenzahlzerlegung in **Grundzustand** und **angeregte Zustände**:
  $$N = N_0 + N_{\mathrm{ex}}.$$
- Grundzustand ($E_0=0$):
  $$N_0=\frac{z}{1-z}.$$
  (Im Kasten **nicht** mit $V$ wachsend als Formel; die Makroskopie kommt über $z\to 1$ im Thermodynamik-Limes.)
- Angeregte Zustände (Kontinuum) führen auf Bose-Funktionen (Polylogarithmen):
  $$N_{\mathrm{ex}}= \frac{g_S V}{\lambda_T^3}\,g_{3/2}(z),\qquad
  p=\frac{g_S k_BT}{\lambda_T^3}\,g_{5/2}(z),$$
  mit
  $$g_\nu(z)=\sum_{\ell=1}^\infty \frac{z^\ell}{\ell^\nu}=\mathrm{Li}_\nu(z).$$

> Merke: Der **Grundzustand** muss separat behandelt werden; die Kontinuumsnäherung (Integral über Zustandsdichte) erfasst ihn nicht korrekt.

---

### 4.3 Mechanismus der BEC: Sättigung der angeregten Zustände
- Für gegebenes $T$ ist die maximale Anzahl Teilchen, die in angeregte Zustände passen, erreicht bei **$z\to 1$** (also $\mu\to 0$):
  $$N_{\mathrm{ex}}^{\max}(T)=\frac{g_S V}{\lambda_T^3}\,g_{3/2}(1)
  =\frac{g_S V}{\lambda_T^3}\,\zeta\!\left(\frac{3}{2}\right).$$
- **Sättigung**: Wenn $N > N_{\mathrm{ex}}^{\max}(T)$, können die Überschussteilchen nicht mehr in angeregte Zustände „untergebracht“ werden und sammeln sich im Grundzustand:
  $$N_0 = N - N_{\mathrm{ex}}^{\max}(T)\quad (T\le T_c).$$
- Das ist die statistische Ursache der **Bose-Einstein-Kondensation**: **makroskopische Besetzung** eines einzelnen Quantenzustands.

---

### 4.4 Herleitung der kritischen Temperatur $T_c$ (3D, homogenes ideales Bosegas)
Kriterium am Übergang: Bei $T=T_c$ ist gerade **kein** Kondensat vorhanden ($N_0\to 0$), und $z\to 1$:

$$N = N_{\mathrm{ex}}^{\max}(T_c)=\frac{g_S V}{\lambda_{T_c}^3}\zeta\!\left(\frac{3}{2}\right).$$

Mit $n=N/V$ und $\lambda_{T_c}^{-3}=\left(\frac{mk_BT_c}{2\pi\hbar^2}\right)^{3/2}$ folgt:

$$n = g_S\left(\frac{mk_BT_c}{2\pi\hbar^2}\right)^{3/2}\zeta\!\left(\frac{3}{2}\right)$$

und damit

$$T_c=\frac{2\pi\hbar^2}{mk_B}\left(\frac{n}{g_S\,\zeta(3/2)}\right)^{2/3}.$$

**Interpretation**
- Höhere Dichte $n$ $\Rightarrow$ höheres $T_c$.
- Größere Masse $m$ $\Rightarrow$ kleineres $T_c$ (schwerere Atome kondensieren bei tieferen Temperaturen).
- Spin-Entartung $g_S$ reduziert $T_c$ (mehr interne Zustände „vergrößern“ die thermische Kapazität der Anregungen).

---

### 4.5 Kondensatfraktion $N_0/N$ unterhalb von $T_c$
Für $T\le T_c$ gilt $z=1$ (im Thermodynamik-Limes), also

$$N_{\mathrm{ex}}(T)=\frac{g_S V}{\lambda_T^3}\zeta\!\left(\frac{3}{2}\right)
\propto T^{3/2}.$$

Da bei $T_c$ gilt $N=\frac{g_S V}{\lambda_{T_c}^3}\zeta(3/2)$, folgt

$$\frac{N_{\mathrm{ex}}(T)}{N}=\left(\frac{T}{T_c}\right)^{3/2},\qquad
\frac{N_0}{N}=1-\left(\frac{T}{T_c}\right)^{3/2}.$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/a7aa9f1c-2a6a-45ac-8404-134590f2874c/f04397a4-520f-46e5-841e-d79ca59bab25-13_682_1333_1278_1436.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/360c9b27-7239-49bb-b5c3-1790ec3c8f12/95d38105-dabe-4631-a371-24ef87ae58b0-04_815_1570_1399_1378.jpg)

**Grenzfälle**
- $T\to 0$: $\frac{N_0}{N}\to 1$ (alle Teilchen im Grundzustand; im idealen Gas ohne Wechselwirkung ist das ein reiner Einteilchenzustand).
- $T\to T_c^-$: $N_0/N\to 0$ kontinuierlich, aber thermodynamische Ableitungen zeigen Nicht-Analytizität (z. B. Knick in $C_V$).

---

### 4.6 Rolle von $\mu$ und $z$ oberhalb/unterhalb von $T_c$
- **Oberhalb** $T_c$:
  - Kein Kondensat: $N_0$ ist nicht makroskopisch.
  - $z<1$ bzw. $\mu<0$ wird so eingestellt, dass $N=\frac{g_S V}{\lambda_T^3}g_{3/2}(z)$.
- **Unterhalb** $T_c$:
  - Angeregte Zustände sind **gesättigt**: $z=1$ (also $\mu=0$ bei $E_0=0$).
  - Zusätzliche Teilchen gehen in $N_0$, ohne $\mu$ weiter zu erhöhen (es kann nicht $>0$ werden).

**Wichtiges Konzept (Prüfungsfalle):**
- „$\mu=0$“ ist nicht „klassisch“, sondern die Signatur der Kondensation (bei Wahl $E_0=0$).  
- Im klassischen Grenzfall gilt typischerweise $z\ll 1$ ($\mu\ll -k_BT$), und dann wird die BE-Verteilung zur Maxwell–Boltzmann-Verteilung.

---

### 4.7 Physikalische Bedeutung: Makroskopische Besetzung, Ordnung und Kohärenz
- **Makroskopische Besetzung** bedeutet:
  $$N_0 \sim \mathcal{O}(N)\quad \text{für }T<T_c.$$
- Das Kondensat lässt sich häufig durch eine makroskopische Wellenfunktion (Order Parameter) beschreiben:
  $$\Psi(\mathbf{r})=\langle \hat{\psi}(\mathbf{r})\rangle,$$
  wobei $|\Psi|^2$ die Kondensatdichte approximiert (in realen Gasen mit schwacher Wechselwirkung besonders passend: Gross-Pitaevskii-Theorie).
- **Kohärenz**:
  - Erste Ordnung: $g^{(1)}(\mathbf{r})=\langle \hat{\psi}^\dagger(\mathbf{r})\hat{\psi}(0)\rangle$ fällt im Kondensat nur langsam ab $\Rightarrow$ **lange Kohärenzlänge**.
  - In einem idealen homogenen BEC kann $g^{(1)}$ im Prinzip über Systemgröße kohärent sein (praktisch begrenzen Fallen, Temperatur, Wechselwirkungen, Dimension).

---

### 4.8 Beobachtbare Signaturen der BEC (Experiment)
Typische „Smoking Guns“:

1. **Impulsverteilung / Time-of-flight (TOF)**
   - Beim Abschalten der Falle expandiert die Wolke; nach langer Flugzeit $t$ wird Ortsverteilung zu Impulsverteilung:
     $$\mathbf{r}\approx \frac{\mathbf{p}}{m}t.$$
   - BEC zeigt einen **schmalen Peak** um $\mathbf{p}\approx 0$ (hohe Besetzung kleiner Impulse) plus thermischen Untergrund.

2. **Interferenz zweier Kondensate**
   - Überlagert man zwei unabhängig erzeugte Kondensate, erscheinen **Interferenzstreifen** (Phasenkohärenz); die absolute Phase kann zufällig sein, aber die **Kontrastbildung** ist robust.

3. **Lange Kohärenzlänge / Off-diagonal long-range order (ODLRO)**
   - Messbar über Interferenz, Bragg-Spektroskopie oder Korrelationsmessungen.

4. **Thermodynamische Signatur**
   - Idealisiertes Bosegas: Nicht-Analytizität in $C_V$ bei $T_c$ (typisch „Knick“/Änderung der Steigung); in realen Fallen und endlichem $N$ wird das abgerundet.

---

### 4.9 Beispiele und Kontraste

#### 4.9.1 Ultrakalte Atomgase: Rubidium-87 und Natrium-23
- Realisierte BECs in magneto-optischen/optischen Fallen bei $T\sim 10^{-7}\,\mathrm{K}$ bis $10^{-6}\,\mathrm{K}$, typischerweise:
  - $^{87}\mathrm{Rb}$ (Boson), $^{23}\mathrm{Na}$ (Boson)
- Charakteristika:
  - **Dichte** eher gering ($n$ viel kleiner als in Flüssigkeiten), aber extrem niedrige $T$ $\Rightarrow$ $n\lambda_T^3\gtrsim 1$.
  - Wechselwirkungen sind **schwach, aber wichtig** für reale Observablen (Stabilität, Form in der Falle, Anregungsspektrum), dennoch liefert das **ideale** Bosegas oft die richtige Skalierung und Intuition für $T_c$ und $N_0/N$.

#### 4.9.2 Photonengas (Schwarzkörperstrahlung) – kein BEC im Vakuumgleichgewicht
- Für Photonen ist die Teilchenzahl **nicht erhalten** $\Rightarrow$ im thermischen Gleichgewicht:
  $$\mu_\gamma = 0 \quad \text{für alle }T.$$
- Daher ist die Situation **nicht** wie beim Atomgas: Eine „Sättigung“ der angeregten Zustände erzwingt kein Kondensat, weil $N$ sich anpasst.
- Ausnahme/Modifikationen (Konzept): In speziellen Systemen kann man eine effektive Photonen-Zahlerhaltung erreichen (z. B. in Mikroresonatoren mit Pumping) und dann kondensationsähnliche Phänomene beobachten.

#### 4.9.3 Helium-4: BEC-Idee vs. starke Wechselwirkungen
- $^4\mathrm{He}$ ist ein **Boson**, zeigt **Superfluidität** bei $T_\lambda\approx 2{,}17\,\mathrm{K}$.
- Aber: flüssiges Helium ist **stark wechselwirkend** und dicht:
  - Das ideale Bosegas ist quantitativ ungeeignet.
  - Es gibt zwar eine Kondensatfraktion, aber typischerweise **deutlich kleiner als 1** selbst bei $T\to 0$ (Depletion durch Wechselwirkungen).
- Superfluidität und BEC sind verwandt, aber nicht identisch; bei Helium dominiert Korrelation/Wechselwirkung.

---

### 4.10 Edge Cases & typische Fallstricke
- **Dimension**:
  - Homogenes ideales Bosegas kondensiert nur in **$d\ge 3$** bei endlichem $T$.
  - In **1D/2D** verhindert die starke thermische Phasenfluktuation (im Thermodynamik-Limes) echte langreichweitige Ordnung; in Fallen/bei endlichem System können jedoch **quasi-Kondensate** und in 2D ein **BKT-Übergang** auftreten (mit Wechselwirkungen relevant).
- **Endliche Teilchenzahl / Falle**:
  - In Experimenten ist $N$ endlich $\Rightarrow$ Übergang wird **abgerundet**, $T_c$ verschiebt sich leicht.
- **Grundzustand separat**:
  - Wer den Grundzustand nicht separat behandelt, erhält fälschlich „kein Kondensat“ oder Divergenzen; korrekt ist:
    $$N_0=\frac{z}{1-z}\ \text{und}\ z\to 1\ \Rightarrow\ N_0\ \text{makroskopisch}.$$
- **Klassischer Grenzfall**:
  - Für $z\ll 1$ gilt $g_\nu(z)\approx z$ und man erhält klassische Idealgas-Resultate (Maxwell–Boltzmann).

---

### 4.11 Mini-Übersicht (Formeln)
| Größe (3D, homogen) | oberhalb $T_c$ | unterhalb $T_c$ |
|---|---:|---:|
| Fugazität $z$ / chem. Potential $\mu$ | $z<1$ ($\mu<0$) | $z=1$ ($\mu\to 0$ bei $E_0=0$) |
| Angeregte Teilchen | $N_{\mathrm{ex}}=\frac{g_S V}{\lambda_T^3}g_{3/2}(z)$ | $N_{\mathrm{ex}}=\frac{g_S V}{\lambda_T^3}\zeta(3/2)$ |
| Kondensat | klein | $N_0=N-N_{\mathrm{ex}}$ |
| Kritische Temperatur | \- | $T_c=\frac{2\pi\hbar^2}{mk_B}\left(\frac{n}{g_S\zeta(3/2)}\right)^{2/3}$ |
| Kondensatfraktion | $0$ | $\frac{N_0}{N}=1-(T/T_c)^{3/2}$ |

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c134a79d-211c-48b2-8149-eecc863d2479/0e8667e3-37d6-412b-8e95-93029ab5c7af-13_524_2622_845_147.jpg)

## 8. Erweiterte Themen und Anwendungen: Niedrige Dimensionen, Gitter, Quanteninformation

### 8.1 Quantengase in niedrigen Dimensionen (1D/2D): Fluktuationen dominieren
In 1D und 2D sind **thermische und quantenmechanische Fluktuationen** viel stärker als in 3D. Das verändert die Natur von Ordnung, Phasenübergängen und auch die beobachtbaren **Besetzungszahlen** $n(\epsilon)$.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-04_741_1634_427_369.jpg)

#### Dimension und Zustandsdichte (Kerngrund für „besondere Rolle“)
Viele Effekte folgen aus der **Zustandsdichte** $g(\epsilon)$, die in $d$ Dimensionen skaliert wie
$$
g(\epsilon)\propto \epsilon^{\frac{d}{2}-1}.
$$
Konsequenzen (ideales Gas, homogene Geometrie):
- **3D**: $g(\epsilon)\propto \sqrt{\epsilon}$ ⇒ „genug“ Zustände im Kontinuum, Standard-BEC möglich.
- **2D**: $g(\epsilon)\propto \text{const}$ ⇒ integrale Randfälle, starke Fluktuationen; im homogenen unendlichen System keine echte BEC bei $T>0$.
- **1D**: $g(\epsilon)\propto 1/\sqrt{\epsilon}$ ⇒ noch stärkere Infrarot-Probleme; Ordnung wird leicht zerstört.

#### Besetzungszahlen und chemisches Potential $\mu$ in 1D/2D
Allgemein:
- **Fermionen**:
  $$
  n_F(\epsilon)=\frac{1}{e^{\beta(\epsilon-\mu)}+1},\qquad 0\le n_F\le 1.
  $$
- **Bosonen**:
  $$
  n_B(\epsilon)=\frac{1}{e^{\beta(\epsilon-\mu)}-1},\qquad \mu<\epsilon_0.
  $$
Wichtig in niedrigen Dimensionen:
- Für Bosonen nähert sich $\mu$ bei starker Besetzung dem Grundzustand $\epsilon_0$ an, **aber** Fluktuationen verhindern oft eine echte langreichweitige Ordnung.
- In 2D/1D entstehen häufig **Quasi-Kondensate**: große Besetzungszahlen in niedrigen Impulsmoden, aber keine echte globale Phasensteifigkeit.

#### Mermin–Wagner(-Hohenberg)-Theorem (Heuristik)
Für Systeme mit kontinuierlicher Symmetrie (z.B. U(1) Phase eines Bosefeldes) gilt im thermodynamischen Limes:
- In **1D und 2D** bei **endlicher Temperatur** $T>0$: keine **echte** langreichweitige Ordnung (LRO) für kurzreichweitige Wechselwirkungen.
- Ergebnis: statt LRO oft **Quasi-Ordnung** (algebraischer Abfall von Korrelationen) oder gar exponentieller Abfall.

> **Edge Case:** In endlichen Systemen (Trap, endliche Gittergröße) sieht man oft „BEC-ähnliche“ Signaturen, obwohl im strengen thermodynamischen Sinn keine BEC existiert. Ebenso kann eine harmonische Falle die Zustandsdichte so verändern, dass kondensatartige Phänomene möglich werden.

---

### 8.2 Quasi-Ordnung und BKT/KT-Übergang in 2D
In 2D-Bosegasen ist der zentrale Phasenübergang oft der **Berezinski–Kosterlitz–Thouless (BKT/KT)-Übergang**: ein **topologischer** Übergang, gesteuert durch Wirbel (Vortices).

#### Korrelationsfunktionen: LRO vs. Quasi-LRO
Betrachte die Einteilchenkorrelation
$$
g^{(1)}(r)=\langle \psi^\dagger(\mathbf{r})\psi(0)\rangle.
$$
- **Quasi-LRO (superfluid, unterhalb $T_\text{BKT}$):**
  $$
  g^{(1)}(r)\sim r^{-\eta(T)} \quad \text{(algebraischer Abfall)}.
  $$
- **Disorder (oberhalb $T_\text{BKT}$):**
  $$
  g^{(1)}(r)\sim e^{-r/\xi} \quad \text{(exponentiell)}.
  $$

#### Wirbelphysik: gebundene vs. freie Vortex-Antivortex-Paare
- Unterhalb $T_\text{BKT}$: **Vortex–Antivortex** sind **gebunden** ⇒ Phase ist lokal steif ⇒ Superfluidität möglich.
- Oberhalb $T_\text{BKT}$: Wirbel **entbinden** ⇒ starke Phasenfluktuationen ⇒ Superfluidität verschwindet.

Typisches Kennzeichen: **sprunghafter** (universal) Beitrag in der Superfluiddichte $\rho_s$:
$$
\rho_s(T_\text{BKT}^-)=\frac{2 m k_B T_\text{BKT}}{\pi\hbar^2}.
$$

#### Zusammenhang zu Besetzungszahlen
- Unterhalb $T_\text{BKT}$ ist die Besetzung niedriger Impulse groß (kohärente Anteile), aber nicht als $\delta(\mathbf{k})$-Peak wie bei idealer 3D-BEC im thermodynamischen Limes.
- Experimentell: Momentumverteilung $n(\mathbf{k})$ zeigt starke Gewichtung bei kleinem $|\mathbf{k}|$, deren Form durch algebraische Korrelationen bestimmt ist.

---

### 8.3 1D-Bosegas: Tonks–Girardeau-Gas (stark wechselwirkend)
In 1D führen starke Repulsionen zu einem Regime, in dem Bosonen „fermionisieren“.

#### Modell und Kopplungsparameter
Kontaktwechselwirkung (Lieb–Liniger-Modell):
$$
H=\sum_i \left(-\frac{\hbar^2}{2m}\frac{\partial^2}{\partial x_i^2}\right) + g_{1D}\sum_{i<j}\delta(x_i-x_j).
$$
Dimensionsloser Parameter:
$$
\gamma=\frac{m g_{1D}}{\hbar^2 n_{1D}}.
$$
- $\gamma\ll 1$: schwach wechselwirkend (quasi-kondensatartig).
- $\gamma\gg 1$: **Tonks–Girardeau (TG)**-Regime.

#### Fermionisierung: was heißt das?
Im TG-Limes ($g_{1D}\to\infty$):
- Bosonen können einander nicht passieren ⇒ Wellenfunktion verschwindet bei Teilchenkoinzidenz.
- Viele Observablen (z.B. Dichteprofile) entsprechen einem **idealen 1D-Fermigas**, obwohl die Teilchen Bosonen sind.

**Wichtiges Detail:**  
- **Dichte-Korrelationen** und **Energie** ähneln Fermionen.  
- **Impulsverteilung** bleibt bosonisch (typisch mit langen $k$-Tails), also nicht identisch zu Fermionen.

#### Besetzungszahlen und chemisches Potential
- Für ein ideales 1D-Fermigas (und im TG-Limes für viele Thermodynamik-Aspekte) ist bei $T=0$ das chemische Potential
  $$
  \mu(T=0)=\epsilon_F=\frac{\hbar^2 k_F^2}{2m},\qquad k_F=\pi n_{1D}.
  $$
- Die Besetzungszahl ist bei Fermionen weiterhin
  $$
  n_F(\epsilon)=\frac{1}{e^{\beta(\epsilon-\mu)}+1},
  $$
  während für TG-Bosonen die effektive Thermodynamik fermionisch sein kann, jedoch die Quantenstatistik der Feldoperatoren bosonisch bleibt.

> **Edge Case:** In realen Experimenten ist 1D oft „quasi-1D“ (starke transversale Konfinierung). Bei zu hoher Temperatur oder zu starker Anregung transversaler Moden bricht die 1D-Beschreibung.

---

### 8.4 Optische Gitter: Realisierung von Hubbard-Modellen
Optische Gitter entstehen durch stehende Lichtwellen:
$$
V(x)=V_0\sin^2(k_L x),
$$
und analog in 2D/3D. Sie liefern eine **periodische Potentiallandschaft**, in der Atome in Wannier-Zuständen lokalisieren können.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/360c9b27-7239-49bb-b5c3-1790ec3c8f12/95d38105-dabe-4631-a371-24ef87ae58b0-12_418_846_792_174.jpg)

#### Tight-Binding und Parameter
Im tiefen Gitter:
- **Tunneling** $t$: Übergang zwischen Nachbarplätzen.
- **On-site Wechselwirkung** $U$: Energie bei Doppelbesetzung.
- **chemisches Potential** $\mu$: steuert mittlere Teilchenzahl/Besetzung pro Platz.

---

### 8.5 Bose–Hubbard-Modell: Superfluid vs. Mott-Isolator
Hamiltonoperator:
$$
H=-t\sum_{\langle i,j\rangle}\left(b_i^\dagger b_j+\text{h.c.}\right)+\frac{U}{2}\sum_i n_i(n_i-1)-\mu\sum_i n_i,
$$
mit $n_i=b_i^\dagger b_i$.

#### Phasenbild (Nulltemperatur, idealisiert)
- **Superfluid (SF)**: $t\gg U$
  - delokalisierte Bosonen, lange (quasi-)kohärente Phase
  - **Zahlfluktuationen** groß: $\Delta n_i^2$ groß
  - makroskopische Besetzung niedriger Bloch-Zustände (große Besetzungszahlen in $k\approx 0$)
- **Mott-Isolator (MI)**: $U\gg t$ bei **ganzzahliger Füllung** $\langle n\rangle \in \mathbb{Z}$
  - lokal feste Besetzung, z.B. $n_i=1$ überall
  - **Lücke** für Teilchen/Loch-Anregungen $\sim U$
  - **Kompressibilität** klein:
    $$
    \kappa=\frac{\partial n}{\partial \mu}\approx 0
    $$
  - unterdrückte Zahlfluktuationen (Fock-Zustände)

#### Rolle von $\mu$ und Besetzungszahlen: „Mott-Lobes“
Im $(\mu/U,\;t/U)$-Diagramm:
- Bei kleinen $t/U$ existieren Bereiche, in denen die Besetzung pro Platz fix ist:
  - $n=1$ stabil für $\mu$ in einem Intervall der Breite $\sim U$.
- Außerhalb dieser Bereiche wird das System kompressibel und tendenziell superfluid.

**Edge Cases / Realistik:**
- **Harmonische Falle** führt zu inhomogener lokaler Chemie:
  $$
  \mu(\mathbf{r})=\mu_0 - V_\text{trap}(\mathbf{r}),
  $$
  ⇒ „Wedding-cake“-Struktur: abwechselnde MI-Schalen mit unterschiedlichen $n$.
- Bei endlicher Temperatur wird der MI durch thermische Defekte (Teilchen/Loch) „aufgeweicht“.

---

### 8.6 Fermi–Hubbard-Modell: Korrelationen, Magnetismus, Mott-Physik
Hamiltonoperator:
$$
H=-t\sum_{\langle i,j\rangle,\sigma}\left(c_{i\sigma}^\dagger c_{j\sigma}+\text{h.c.}\right)
+U\sum_i n_{i\uparrow}n_{i\downarrow}-\mu\sum_{i,\sigma}n_{i\sigma}.
$$

#### Physikalische Regime (Beispiele)
- **Halbfüllung** ($\langle n\rangle\approx 1$ pro Platz, zwei Spins):
  - bei großem $U/t$ → **Mott-Isolator** (Ladungslücke)
  - bei tiefen Temperaturen → **antiferromagnetische** Korrelationen (Superexchange)
    $$
    J \sim \frac{4t^2}{U}.
    $$
- **Dotierung** (weg von Halbfüllung, durch $\mu$ gesteuert):
  - mobile Ladungsträger, starke Korrelationen
  - Plattform für Analogie zu Hoch-$T_c$-Supraleitung (Quantensimulation)

#### Besetzungszahlen (Pauli-Prinzip) im Gitter
- Pro Platz und Spin gilt $n_{i\sigma}\in\{0,1\}$.
- Doppelte Besetzung $n_{i\uparrow}n_{i\downarrow}$ wird durch $U$ energetisch bestraft.
- Messbar: **Double occupancy** als Indikator für Korrelationen und Temperatur.

---

### 8.7 Bandstruktur, Bloch-Zustände und Bloch-Oszillationen
Periodisches Potential ⇒ Energiebandstruktur $E_n(\mathbf{q})$ (Bandindex $n$, Quasimomentum $\mathbf{q}$ in der 1. Brillouin-Zone).

#### Grundbegriffe
- **Bloch-Zustände**: Eigenzustände mit Quasimomentum $\mathbf{q}$.
- **Bandlücke** zwischen Bändern, Tunneling bestimmt Bandbreite.
- In Tight-Binding (1D, nächster Nachbar):
  $$
  E(q)\approx -2t\cos(qa).
  $$

#### Bloch-Oszillationen (konstante Kraft)
Unter konstanter Kraft $F$ (z.B. durch Neigung/Gravitation):
$$
\hbar\frac{dq}{dt}=F \quad\Rightarrow\quad q(t)=q(0)+\frac{F}{\hbar}t.
$$
Da $q$ modulo $2\pi/a$ definiert ist, resultieren **Oszillationen** mit Frequenz
$$
\omega_B=\frac{Fa}{\hbar}.
$$
- Beobachtbar in kalten Atomen sehr sauber (geringe Streuung/Defekte).
- **Edge Case:** Starke Wechselwirkungen oder hohe Temperaturen führen zu Dämpfung/Dephasierung.

---

### 8.8 Anwendungen und Ausblick
#### (A) Quantensimulation kondensierter Materie
Optische Gitter + kontrollierbare Parameter ($t,U,\mu$, Dimensionalität, Geometrie) ermöglichen „analoge“ Simulation:
- **Mott-Übergänge**, Magnetismus, Supraleitungsanaloga (Fermi-Hubbard).
- **Frustration** (trianguläre/hexagonale Gitter), Spinmodelle.
- **Nichtgleichgewicht**: Quenches, thermalisierung vs. Many-Body Localization.

#### (B) Topologische Phasen
Realisierbar durch:
- künstliche Gauge-Felder, Spin–Orbit-Coupling, Floquet-Engineering.
Beispiele:
- **Chern-Isolatoren**, **topologische Bänder** mit Randzuständen.
- **Quantisierte Transporteigenschaften** (robust gegen Störungen).

#### (C) Präzisionsmetrologie: Atominterferometrie
Kalte Atome als kohärente Materiewellen:
- Messung von Beschleunigung/Rotation/Gravitation über Phasenverschiebung
  $$
  \Delta\phi \propto k_\text{eff}\, a\, T^2.
  $$
- Verbindung zu Quantenstatistik:
  - **Bosegase**: hohe Kohärenz, aber Wechselwirkungen können Phasenrauschen erzeugen.
  - **Fermigase**: Pauli-Unterdrückung von Stößen kann Dekohärenz reduzieren (je nach Regime).

#### (D) Bausteine für Quanteninformation
Ultrakalte Atome/Ionen in Gittern oder Tweezers:
- **Qubits**: interne Zustände (Hyperfein) oder Besetzungszustände pro Platz.
- **Gatter** durch kontrollierte Wechselwirkungen (z.B. Rydberg-Blockade, kollisionsbasierte Phasen).
- **Skalierung** durch Gitter/Tweezer-Arrays, Fehlerdiagnostik via Ortsauflösung.

---

### 8.9 Kompaktübersicht (Merktabelle)
| Thema | Schlüsselidee | Rolle von $\mu$ / Besetzung |
|---|---|---|
| 2D Bosegas | keine echte LRO bei $T>0$, dafür BKT | $\mu\to \epsilon_0$ möglich, aber Quasi-Ordnung; $n(\mathbf{k}\approx 0)$ groß ohne echte $\delta$-Kondensation |
| 1D Bosegas (TG) | starke Repulsion ⇒ Fermionisierung | Thermodynamik teils fermionisch; lokale Besetzungen durch starke Korrelationen begrenzt |
| Bose-Hubbard | SF–MI Übergang | $\mu$ legt Füllung fest; MI bei ganzzahliger Besetzung, $\kappa\approx 0$ |
| Fermi-Hubbard | Mott-Physik, Magnetismus | Halbfüllung via $\mu$; Double occupancy durch $U$ unterdrückt |
| Bandstruktur/Bloch | periodisches Potential ⇒ Bänder | Besetzung der Bänder bestimmt Transport; bei Kraft Bloch-Oszillationen |

---

---

## Quick Reference: Key Formulas

### Thermodynamik – Hauptsätze / Entropie
| Formel (Name/Beschreibung) | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| 1. Hauptsatz (Energieerhaltung) | $$\mathrm{d}E=\delta W+\delta Q$$ | $E$ innere Energie; $\delta W$ verrichtete Arbeit; $\delta Q$ zu-/abgeführte Wärme |
| 2. Hauptsatz (Clausius-Ungleichung) | $$\mathrm{d}S \ge \frac{\delta Q}{T}$$ | $S$ Entropie; $\delta Q$ Wärme; $T$ absolute Temperatur (Gleichheit bei reversibel) |
| Isoliertes System (aus 2. HS erwähnt) | $$\mathrm{d}S \ge 0$$ | $S$ Entropie (für isolierte Systeme nicht abnehmend) |

---

### Quantenstatistik – Kriterium für Quantengase
| Formel (Name/Beschreibung) | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Thermische de-Broglie-Wellenlänge | $$\lambda_T=\frac{h}{\sqrt{2\pi m k_B T}}$$ | $\lambda_T$ thermische Wellenlänge; $h$ Planck-Konstante; $m$ Teilchenmasse; $k_B$ Boltzmann-Konstante; $T$ Temperatur |
| Mittlerer Teilchenabstand (aus Dichte) | $$l=\left(\frac{1}{\rho}\right)^{1/3}$$ | $l$ mittlerer Abstand; $\rho$ Teilchendichte |

---

### Wärmekraftmaschinen / Wirkungsgrad-Vergleich (aus der Argumentationskette)
| Formel (Name/Beschreibung) | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| 2. HS-Bedingung im Vergleich | $$Q_2 \le Q_2'$$ | $Q_2, Q_2'$ abgegebene Wärmemengen (z. B. an kaltes Reservoir) in zwei Prozessen |
| Verhältnis-Ungleichung | $$\frac{Q_2}{Q_1}\le\frac{Q_2'}{Q_1'}$$ | $Q_1,Q_1'$ aufgenommene Wärmemengen (z. B. vom warmen Reservoir); $Q_2,Q_2'$ siehe oben |
| Umgeformte Ungleichung (für Wirkungsgrade) | $$1-\frac{Q_2}{Q_1}\ge 1-\frac{Q_2'}{Q_1'}$$ | linke/rechte Seite entspricht jeweils einem Ausdruck der Form „$1-\frac{Q_2}{Q_1}$“ |
| Vergleich der Wirkungsgrade | $$\eta_C \ge \eta_X$$ | $\eta_C$ (Carnot-)Wirkungsgrad; $\eta_X$ Wirkungsgrad einer anderen Maschine/Prozess |

---

### Fermigas bei $T=0$ (im Text genannt)
| Formel (Name/Beschreibung) | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Chemisches Potential bei $T=0$ (wie angegeben) | $$\mu=E$$ | $\mu$ chemisches Potential; $E$ (im Text als „E“ angegeben, kontextuell Energie) |

---

### Wärmekapazität (Bosonen, Tieftemperaturverhalten)
| Formel (Name/Beschreibung) | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Tieftemperatur-Skalierung (Bosonen) | $$C_\nu \propto T^{3/2}$$ | $C_\nu$ Wärmekapazität (bei konstantem Volumen, wie notiert); $T$ Temperatur; $\propto$ „proportional zu“ |
