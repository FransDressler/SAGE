# Statistische Physik – detaillierte Studiennotizen

## 1) Motivation und Brücke zur Thermodynamik (Viele-Teilchen-Problem)

### Warum braucht man statistische Physik?
Makroskopische Systeme (Gas, Festkörper, Flüssigkeiten) enthalten typischerweise **$N \sim 10^{23}$** Teilchen. Damit wird eine „mikroskopisch-exakte“ Beschreibung praktisch unmöglich:

- **Klassisch:** Ein System aus $N$ Teilchen hat in 3D pro Teilchen $3$ Orts- und $3$ Impulskomponenten  
  $$\Rightarrow \text{Phasenraumdimension} = 6N.$$
  Die Newtonschen Bewegungsgleichungen für alle Teilchen sind nicht nur extrem zahlreich, sondern wegen Stößen/Wechselwirkungen auch **chaotisch empfindlich** gegenüber Anfangsbedingungen.

- **Quantenmechanisch:** Der Zustandsraum (Hilbertraum) wächst typischerweise **exponentiell** mit $N$ (Tensorproduktstruktur). Eine direkte Lösung der **Vielteilchen-Schrödingergleichung** ist daher selbst konzeptionell schnell unhandhabbar.

Konsequenz: Statt einzelner Trajektorien bzw. Wellenfunktionen interessieren **kollektive makroskopische Größen**, z.B.  
**$T, p, V, S, E, N$** (Zustandsgrößen) und daraus abgeleitete **Potentiale** (z.B. freie Energien).

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-04_741_1634_427_369.jpg)

---

### Thermodynamik vs. statistische Mechanik: phänomenologisch ↔ mikroskopisch
- **Thermodynamik** formuliert allgemeine, experimentell motivierte Beziehungen und Gesetze (z.B. Zustandsgleichungen, Hauptsätze), ohne die **mikroskopische Herkunft** der Zustandsgleichungen/Parameter zu erklären.
- **Statistische Mechanik** liefert die **mikroskopische Untermauerung**: Sie leitet Zustandgrößen und Potentiale aus
  - **Mikrozuständen** (Punkte im Phasenraum bzw. Eigenzustände),
  - **Wahrscheinlichkeitsverteilungen** (Ensembles),
  - **Zustandszählung** und **Mittelwertbildung**
  her.

**Mikro ↔ Makro (Prinzip):** Makrogrößen sind (Ensemble‑)Mittelwerte über Mikrozustände $r$:
$$\langle A \rangle = \sum_r P(r)\,A(r) \quad (\text{diskret}), \qquad \langle A \rangle = \int \mathrm{d}\Gamma\, \rho(\Gamma)\,A(\Gamma) \quad (\text{kontinuierlich})$$
mit Phasenraumelement $\mathrm{d}\Gamma$ und Verteilung $\rho$.

---

### Ensembles & Zustandsvariablen (isoliert/geschlossen/offen)
Die Wahl des Ensembles spiegelt wider, welche Größen durch die Umgebung fixiert sind:

| Ensemble | Fixiert | Systemtyp | Zähl-/Erzeugergröße |
|---|---|---|---|
| **mikrokanonisch** | $(E,V,N)$ | **isoliert** (kein Energie-/Teilchenaustausch) | **$\Omega(E,V,N)$** (Zustandszahl) |
| **kanonisch** | $(T,V,N)$ | **geschlossen** (Energieaustausch, kein Teilchenaustausch) | **$Z(T,V,N)=\sum_r e^{-\beta E_r}$** |
| **großkanonisch** | $(T,V,\mu)$ | **offen** (Energie- und Teilchenaustausch) | grand canonical $\,\Xi(T,V,\mu)$ |

Dabei ist
$$\beta = \frac{1}{k_B T}.$$

---

### Zustandssummen / Zählgrößen als Brücke zu Thermodynamik
- **Mikrokanonisch:** Die zentrale Größe ist die **Zustandszahl**
  $$\Omega(E,V,N) = \text{Anzahl zugänglicher Mikrozustände bei }(E,V,N).$$
  Daraus wird Entropie als mikroskopische Zählgröße motiviert:
  $$S = k_B \ln \Omega \quad (\text{bis auf Konventionen}).$$

- **Kanonisch:** Die **Zustandssumme**
  $$Z(T,V,N)=\sum_r e^{-\beta E_r}$$
  bündelt die mikroskopische Information. Viele makroskopische Größen folgen aus Ableitungen von $\ln Z$ (z.B. Energie, Druck), und thermodynamische Potentiale werden dadurch mikroskopisch berechenbar.

---

### Beispiel: ideales Gas (Makrogesetz ↔ Mikrodeutung)
**Makroskopisch (Thermodynamik):** Zustandsgleichung
$$pV = Nk_B T \quad (\text{bzw. } pV=nRT).$$

**Mikroskopisch (statistische Mechanik):**
- Druck entsteht aus Impulsübertrag bei Stößen an die Wand (Mittelwert über viele Teilchenzustände).
- Die Zustandsgleichung folgt aus der **Zustandszählung im Phasenraum** bzw. aus der **kanonischen Verteilung** und dem Zusammenhang von $Z$ mit $p$:
  $$p = k_B T \,\frac{\partial \ln Z}{\partial V}.$$
Damit wird das empirische Makrogesetz als Konsequenz mikroskopischer Statistik verständlich.

---

### Fluktuationen & thermodynamischer Limes
Warum wirken makroskopische Größen „glatt“ und gut definiert?

- Für Summen über viele Teilchen wachsen typische absolute Schwankungen oft wie $\sqrt{N}$, während Mittelwerte wie $N$ wachsen.
- Daher sind **relative Fluktuationen** typischerweise klein:
  $$\frac{\Delta A}{\langle A\rangle} \propto \frac{1}{\sqrt{N}}.$$

Im **thermodynamischen Limes** ($N\to\infty$, $V\to\infty$ bei konstanter Dichte $N/V$) werden Fluktuationen relativ vernachlässigbar; thermodynamische Zustandsgleichungen werden dadurch präzise.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/69ee0e11-9f5b-4f77-af5c-beb77eb66c85/2ef6db1e-52f6-455f-a25c-3fe530829b9c-05_741_1823_1505_692.jpg)

---

### Wahrscheinlichkeitsverteilungen: Binomial als einfaches Modell
Ein Minimodell für „Makro aus vielen Mikroentscheidungen“:

- $N$ unabhängige Teilchen, jedes ist mit Wahrscheinlichkeit $p$ links/rechts.
- Wahrscheinlichkeit, dass genau $k$ Teilchen links sind (Binomialverteilung):
  $$P(k)=\binom{N}{k}p^k(1-p)^{N-k}.$$
- Erwartungswert und Varianz:
  $$\langle k\rangle = Np,\qquad \mathrm{Var}(k)=Np(1-p).$$
- Relative Breite:
  $$\frac{\sqrt{\mathrm{Var}(k)}}{\langle k\rangle}=\sqrt{\frac{1-p}{Np}} \sim \frac{1}{\sqrt{N}}.$$

Das illustriert, warum makroskopische Observablen bei großem $N$ stabil erscheinen.

---

### Entropie und warum sie in realen Makrosystemen effektiv nie exakt Null wird
- **$S$ misst (über $\Omega$) die Anzahl zugänglicher Mikrozustände.** Selbst bei sehr tiefen Temperaturen bleiben in realen Systemen häufig viele Mikrozustände praktisch zugänglich:
  - **Mischungen/Unordnung:** schon die Frage „welches Teilchen sitzt wo?“ erzeugt kombinatorisch viele Konfigurationen (Konfigurationsentropie).
  - **Gläser/Defekte/Mehrdeutigkeiten** im Grundzustand (nicht perfektes Kristallgitter) führen zu **Restentropie**.
- Thermodynamisch wird dies im Kontext des **3. Hauptsatzes** diskutiert (idealisierter perfekter Kristall vs. reale Proben): Realistische Systeme erreichen wegen eingeschränkter Präparation und verbleibender mikroskopischer „Unterscheidbarkeiten“ praktisch selten den idealisierten Grenzfall $S=0$.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3e5e289-2c37-474f-bb8f-e020c06a8c45/0982277a-4da9-4fb1-bc0a-66f7dcfd778b-11_281_1184_1341_364.jpg)

## 2) Wahrscheinlichkeit, Zufallsvariablen und Korrelationen als Fundament

### 2.1 Diskrete und kontinuierliche Wahrscheinlichkeiten
**Zufallsvariable** $X$: nimmt zufällig Werte an.

- **Diskret:** $X\in\{X_n\}$ mit Wahrscheinlichkeiten $P(X_n)\equiv P(X=X_n)$  
  Eigenschaften:
  - $0\le P(X_n)\le 1$
  - **Normierung:** $\sum_n P(X_n)=1$
  - **Relative Häufigkeit (Interpretation):** Bei $M\to\infty$ Wiederholungen tritt $X=X_n$ im Mittel
    $$N_n \approx P(X_n)\,M$$
    mal auf.

- **Kontinuierlich:** Dichte $p(x)$ (probability density)  
  $$P(X\in[A,B])=\int_A^B p(x)\,dx,\qquad p(x)\ge 0,\qquad \int_{-\infty}^{\infty}p(x)\,dx=1$$
  Für kleines Intervall $[x_0,x_0+dx]$ gilt näherungsweise:
  $$P(X\in[x_0,x_0+dx])\simeq p(x_0)\,dx$$

---

### 2.2 Erwartungswert, Momente und Varianz (Fluktuationen)
**Erwartungswert / Mittelwert**
- diskret:
  $$\langle X\rangle=\sum_n X_n\,P(X_n)$$
- kontinuierlich:
  $$\langle X\rangle=\int_{-\infty}^{\infty} x\,p(x)\,dx$$

**Momente**
- $k$-tes Moment: $\langle X^k\rangle$
- zentrales $k$-tes Moment: $\langle (X-\langle X\rangle)^k\rangle$

**Varianz** (mittlere quadratische Abweichung)
$$\langle \Delta X^2\rangle=\left\langle (X-\langle X\rangle)^2\right\rangle=\langle X^2\rangle-\langle X\rangle^2$$
**Standardabweichung:** $\sigma_X=\sqrt{\langle \Delta X^2\rangle}$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-12_819_1109_1152_165.jpg)

**Merke (physikalische Lesart):** Nur wenn Fluktuationen klein gegenüber dem Mittelwert sind (z.B. $\sigma_X\ll \langle X\rangle$), ist $\langle X\rangle$ eine „stabile“ Makrogröße.

---

### 2.3 Rechenbeispiele (diskret)

#### (a) Zweizustandssystem (z.B. Spin $s=\pm 1$)
Sei $P(s=+1)=p$, $P(s=-1)=1-p$.
- Mittelwert:
  $$\langle s\rangle= (+1)p+(-1)(1-p)=2p-1$$
- Zweites Moment:
  $$\langle s^2\rangle=1$$
- Varianz:
  $$\langle \Delta s^2\rangle=\langle s^2\rangle-\langle s\rangle^2=1-(2p-1)^2=4p(1-p)$$

#### (b) Fairer Würfel $X\in\{1,2,3,4,5,6\}$, $P=1/6$
- Mittelwert:
  $$\langle X\rangle=\frac{1}{6}\sum_{k=1}^6 k=\frac{7}{2}$$
- Zweites Moment:
  $$\langle X^2\rangle=\frac{1}{6}\sum_{k=1}^6 k^2=\frac{91}{6}$$
- Varianz:
  $$\langle \Delta X^2\rangle=\frac{91}{6}-\left(\frac{7}{2}\right)^2=\frac{35}{12}$$

---

### 2.4 Binomialverteilung (wichtig für Zählprozesse, Random Walk, Spins)
**Setup:** $N$ unabhängige Versuche, „Erfolg“ mit Wahrscheinlichkeit $p$. Zufallsvariable $r=$ Anzahl Erfolge.  
**Binomialverteilung:**
$$P(r)=\binom{N}{r}p^r(1-p)^{N-r}$$

Wichtige Größen:
$$\langle r\rangle=Np,\qquad \langle \Delta r^2\rangle=Np(1-p),\qquad \frac{\sigma_r}{\langle r\rangle}=\frac{\sqrt{Np(1-p)}}{Np}\sim \frac{1}{\sqrt{N}}$$

**Thermodynamischer Limes / Stabilität:** Relative Fluktuationen skalieren typischerweise wie $1/\sqrt{N}$ und gehen für $N\to\infty$ gegen $0$ → Makrogrößen werden scharf.

**Grenzfälle (aus der Prüfungspraxis wichtig):**
- Für $N\to\infty$ bei festem $p$: Binomial $\to$ **Gauß/Normalverteilung** (Zentraler Grenzwertsatz).
- Für $N\to\infty$, $p\to 0$ mit $\lambda=Np=\text{const.}$: Binomial $\to$ **Poissonverteilung**
  $$P(r)=e^{-\lambda}\frac{\lambda^r}{r!}$$

---

### 2.5 Mehrvariablenstatistik: gemeinsame, marginale und bedingte Wahrscheinlichkeiten
Für zwei Zufallsvariablen $X,Y$:

- **Gemeinsame Verteilung:** $P(X=x,\,Y=y)\equiv P(x,y)$
- **Marginalverteilungen (diskret):**
  $$P_X(x)=\sum_y P(x,y),\qquad P_Y(y)=\sum_x P(x,y)$$
- **Bedingte Wahrscheinlichkeit:**
  $$P(x|y)=\frac{P(x,y)}{P_Y(y)}\quad\text{(für }P_Y(y)>0\text{)}$$
  Produktregel:
  $$P(x,y)=P(x|y)\,P_Y(y)=P(y|x)\,P_X(x)$$

---

### 2.6 Statistische Unabhängigkeit und Korrelationen
**Unabhängigkeit** bedeutet:
$$P(x,y)=P_X(x)\,P_Y(y)$$
Dann folgt automatisch $P(x|y)=P_X(x)$: Wissen über $Y$ ändert nichts an $X$.

#### Kovarianz als Maß linearer Korrelation
**Kovarianz**
$$C_{XY}=\langle XY\rangle-\langle X\rangle\langle Y\rangle=\langle (X-\langle X\rangle)(Y-\langle Y\rangle)\rangle$$

Interpretation:
- $C_{XY}>0$: tendenziell „gemeinsam groß/klein“ (positive lineare Korrelation)
- $C_{XY}<0$: antikorreliert
- $C_{XY}=0$: **unkorreliert** (aber nicht zwingend unabhängig)

**Wichtig:**
- Unabhängigkeit $\Rightarrow C_{XY}=0$ (sofern Momente existieren)
- Umkehrung gilt **im Allgemeinen nicht**: $C_{XY}=0 \nRightarrow$ unabhängig (nichtlineare Abhängigkeiten möglich)

(Optional nützlich) **Korrelationskoeffizient**
$$\rho_{XY}=\frac{C_{XY}}{\sigma_X\sigma_Y}\in[-1,1]$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-14_477_619_105_243.jpg)
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-14_477_598_105_1209.jpg)
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-14_477_609_105_2144.jpg)

---

### 2.7 Physikalische Einordnung: unkorreliert vs. korreliert, Fluktuationen und Stabilität
- **Ideales Gas:** Teilchenwechselwirkungen vernachlässigbar → viele Größen (näherungsweise) **unkorreliert**, Korrelationen kurzreichweitig. Das unterstützt die Vorstellung, dass Makrogrößen durch Mittelwerte gut beschrieben werden.
- **Nahe eines Phasenübergangs (kritischer Punkt):** Korrelationen werden stark und oft langreichweitig → Fluktuationen werden groß, Verteilungen weniger „scharf“. Makroskopische Stabilität nimmt ab.

**Zusammenhang Fluktuation–Makrostabilität:**
- Für Summen vieler (schwach korrelierter) Beiträge gilt typischerweise
  $$\frac{\sigma}{\langle X\rangle}\propto \frac{1}{\sqrt{N}}$$
  → im thermodynamischen Limes $N\to\infty$ werden Makrogrößen praktisch deterministisch.
- Starke Korrelationen können diese Unterdrückung von Fluktuationen abschwächen (besonders relevant nahe kritischer Phänomene).

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-12_855_1121_1152_1728.jpg)
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-13_586_1057_112_1647.jpg)

---

### 2.8 Mini-Spickzettel (Formeln)
| Begriff | Diskret | Kontinuierlich |
|---|---|---|
| Normierung | $\sum_n P(X_n)=1$ | $\int p(x)\,dx=1$ |
| Mittelwert | $\langle X\rangle=\sum_n X_nP(X_n)$ | $\langle X\rangle=\int x p(x)\,dx$ |
| Varianz | $\langle \Delta X^2\rangle=\langle X^2\rangle-\langle X\rangle^2$ | gleich |
| Gemeinsame Verteilung | $P(x,y)$ | $p(x,y)$ |
| Marginalisierung | $P_X(x)=\sum_y P(x,y)$ | $p_X(x)=\int p(x,y)\,dy$ |
| Unabhängigkeit | $P(x,y)=P_X(x)P_Y(y)$ | $p(x,y)=p_X(x)p_Y(y)$ |
| Kovarianz | $C_{XY}=\langle XY\rangle-\langle X\rangle\langle Y\rangle$ | gleich |

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/bfd41859-8c82-4eb1-9147-efa039676633/6398403a-787a-4b31-9062-a9b7ea039cc3-17_825_1490_243_787.jpg)
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/5287657c-ab74-49fd-84ac-c2a222d4fea5/48e43ce3-1a5f-4fd8-a565-44081b4cc6c0-03_772_1153_1030_1822.jpg)
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/5287657c-ab74-49fd-84ac-c2a222d4fea5/48e43ce3-1a5f-4fd8-a565-44081b4cc6c0-07_573_2426_1498_463.jpg)

## 3) Ensembles und statistische Mechanik: Von Mikrozuständen zu Zustandsgrößen

### Grundidee (Gibbs): Ensemble statt einzelner Trajektorie
- Ein **Ensemble** ist eine *gedankliche Sammlung* sehr vieler **gleich präparierter** Systeme (gleiche äußere Randbedingungen), die sich in **verschiedenen Mikrozuständen** befinden können.
- Zweck: **Wahrscheinlichkeiten** $p_r$ für Mikrozustände $r$ definieren und daraus **makroskopische Größen** als Ensemble-Mittelwerte berechnen.
- Verbindung zur Dynamik:
  - In realen Vielteilchensystemen ändert sich der Mikrozustand ständig; Messwerte sind effektiv **gemittelt**.
  - **Ergodenhypothese** (motiviert): Zeitmittel $\approx$ Ensemblemittel, wenn die Trajektorie den zugänglichen Phasenraum „typisch“ erkundet.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/25906d8d-306b-423d-b55c-822cea313118/52845d4e-f44d-416c-b06f-fa983d26a72e-13_651_1121_63_1843.jpg)

---

### Mikrozustand vs. Makrozustand
- **Mikrozustand**: vollständige mikroskopische Beschreibung (klassisch: Punkt im **Phasenraum** $(\mathbf{q},\mathbf{p})$; quantenmechanisch: Zustand/Vektor oder Besetzungszahlen). Er hat z. B. eine Energie $E_r$.
- **Makrozustand**: durch wenige **Zustandsgrößen** (z. B. $E,V,N,T,p,\mu$) charakterisiert; viele Mikrozustände sind damit **verträglich**.
- **Zustandszählung**:
  - Mikrokanonisch zählt man Mikrozustände in einem Energiefenster $[E,E+\Delta E]$.
  - Kanonisch/grandkanonisch werden Mikrozustände mit **Gewichten** versehen (Boltzmann-Faktor etc.).

---

### Typische Ensemble-Typen und Randbedingungen (isoliert/geschlossen/offen)

| Ensemble | Charakter | Kontrollgrößen | Fluktuieren | Zähl-/Zustandssumme (Orientierung) |
|---|---|---|---|---|
| **Mikrokanonisch** | **isoliert** (kein Energie- und Teilchenaustausch) | $(E,V,N)$ | praktisch nur Mikrozustände innerhalb $\Delta E$ | $\Omega(E,V,N)=\sum_{E\le \mathcal{H}\le E+\Delta E}1$ |
| **Kanonisch** | **geschlossen** (Energieaustausch mit Wärmebad) | $(T,V,N)$ | $E$ | $Z(T,V,N)=\sum_r e^{-\beta E_r},\quad \beta=\frac{1}{k_B T}$ |
| **Großkanonisch** | **offen** (Energie- und Teilchenaustausch) | $(T,V,\mu)$ | $E,N$ | $\mathcal{Z}(T,V,\mu)=\sum_r e^{-\beta(E_r-\mu N_r)}=\sum_r z^{N_r}e^{-\beta E_r},\ z=e^{\beta\mu}$ |

**Motivation der Wahl**: Man wählt das Ensemble so, dass es die **physikalischen Randbedingungen** (Kontakt zu Reservoirs) am einfachsten ausdrückt. Im thermodynamischen Limes liefern die Ensembles für viele Observablen dieselben makroskopischen Resultate (Ensemble-Äquivalenz), weil Fluktuationen relativ klein werden.

---

### Von Mikrozuständen zu Zustandsgrößen: Mittelwerte und Fluktuationen
- Sei $A$ eine Observablenfunktion (abhängig vom Mikrozustand $r$). Dann:
  - **Ensemblemittelwert**
    $$\langle A\rangle=\sum_r p_r\,A_r \quad (\text{bzw. Integrale im kontinuierlichen Phasenraum}).$$
  - **Fluktuation / Varianz**
    $$\mathrm{Var}(A)=\langle A^2\rangle-\langle A\rangle^2.$$
- Typisches Skalengesetz (thermodynamischer Limes):
  - Für extensive Größen (Summe vieler schwach korrelierter Beiträge) gilt häufig
    $$\frac{\Delta A}{\langle A\rangle}\propto \frac{1}{\sqrt{N}},$$
    d. h. **relative Fluktuationen** verschwinden für $N\to\infty$.

---

### Zustandssummen als „Generatoren“ makroskopischer Information
- **Kanonisches Ensemble**:
  - Wahrscheinlichkeit für Mikrozustand $r$:
    $$p_r=\frac{e^{-\beta E_r}}{Z}.$$
  - **Mittlere Energie (innere Energie)**
    $$U=\langle E\rangle=\sum_r p_r E_r=-\frac{\partial \ln Z}{\partial \beta}.$$
  - (Orientierung) Die freie Energie ist natürlich in diesem Ensemble: $F=-k_BT\ln Z$.
- **Großkanonisches Ensemble**:
  - Mikrozustände tragen Gewicht $e^{-\beta(E_r-\mu N_r)}$.
  - (Orientierung) Mittelwerte folgen aus Ableitungen von $\ln\mathcal{Z}$, z. B.
    $$\langle N\rangle=\frac{1}{\beta}\frac{\partial \ln \mathcal{Z}}{\partial \mu}.$$

---

### Beispiele (konzeptionell)

#### (1) Energieverteilung im kanonischen Ensemble
- Ein System im Wärmebad bei $T$ hat **nicht feste Energie**; stattdessen gilt:
  - Mikrozustände werden durch den **Boltzmann-Faktor** $e^{-\beta E_r}$ unterdrückt.
- **Interpretation**: Höhere Energien sind möglich, aber exponentiell unwahrscheinlicher; die Breite der Energieverteilung (Fluktuationen) wird relativ klein für große Systeme ($\propto 1/\sqrt{N}$).

#### (2) Teilchenzahlfluktuationen im großkanonischen Ensemble (Binomial-Intuition)
- Wenn ein System Teilchen mit einem Reservoir austauscht, ist $N$ **zufällig**.
- **Anschauliches Modell** (ohne viel Formalismus): Viele „Austauschgelegenheiten“ (z. B. Plätze/Teilvolumina), jedes mit Wahrscheinlichkeit $p$ besetzt $\Rightarrow$ **Binomialverteilung**
  $$P(N)=\binom{n}{N}p^N(1-p)^{n-N}.$$
- Für großes $n$ werden die **relativen** Schwankungen klein:
  - $\langle N\rangle=np$, $\mathrm{Var}(N)=np(1-p)$
  - $$\frac{\Delta N}{\langle N\rangle}\sim \frac{\sqrt{np(1-p)}}{np}\propto \frac{1}{\sqrt{n}}.$$
- Das illustriert, warum grandkanonische Fluktuationen für große Systeme makroskopisch oft vernachlässigbar sind.

---

### Thermodynamischer Limes und Phasenübergänge (Nichtanalytizitäten)
- Für **endliche** Systeme sind Zustandssummen $Z,\mathcal{Z}$ (als endliche Summen/Integrale) typischerweise **analytisch** in Parametern wie $T,\mu$.
- **Phasenübergänge** erscheinen als **Nichtanalytizitäten** thermodynamischer Potentiale (z. B. Sprünge/Knicks in Ableitungen).
- Das wird erst im **thermodynamischen Limes** möglich:
  $$N\to\infty,\quad V\to\infty,\quad \frac{N}{V}=\text{konstant}.$$
- Ensemble-Sprache ist dafür „natürlich“, weil:
  - Potentiale wie $F=-k_BT\ln Z$ oder (großkanonisch) $-k_BT\ln\mathcal{Z}$ direkt aus Zustandssummen folgen,
  - und Nichtanalytizitäten mit dem Grenzübergang $N,V\to\infty$ zusammenhängen (Konkurrenz mehrerer makroskopischer Zustände/Phasen).

---

## 4) Quantenstatistik und Dichteoperator: Reine und gemischte Zustände

### Motivation: Warum Dichteoperator?
In der Quantenmechanik ist ein System im Idealfall durch einen **reinen Zustand** $|\psi\rangle$ vollständig beschrieben. In der statistischen Physik kennt man den Zustand aber oft **nicht exakt**, sondern nur als **Ensemble** möglicher Zustände mit Wahrscheinlichkeiten $p_n$ (analog zu mikrokanonisch/kanonisch/großkanonisch als Makrobeschreibungen).

- **Statistische Unkenntnis**: Anfangszustand ist nur mit Wahrscheinlichkeiten bekannt.
- **Thermischer Kontakt** (kanonisch / großkanonisch): Das System tauscht Energie (und ggf. Teilchen) mit der Umgebung aus → effektiv gemischte Zustände.
- **Subsysteme**: Betrachtet man nur einen Teil eines Gesamtsystems, ist der Zustand i. A. gemischt (Reduktion via partieller Spur).

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/6ccb05fe-9bab-418a-b393-2a61bc5cd08f/c29bc0c8-2695-4a08-99bf-a6cb3ddd19b8-3_767_1401_169_1489.jpg)

---

### Definition: Dichteoperator $\hat{\rho}$
Gegeben sei ein Ensemble reiner Zustände $\{|\psi_n\rangle\}$ mit Wahrscheinlichkeiten $\{p_n\}$, $p_n\ge 0$, $\sum_n p_n=1$. Dann:

$$\hat{\rho}=\sum_n p_n\,|\psi_n\rangle\langle \psi_n|$$

**Eigenschaften**
- **Hermitesch**: $\hat{\rho}^\dagger=\hat{\rho}$
- **Positiv**: $\langle \phi|\hat{\rho}|\phi\rangle\ge 0$
- **Normiert**: $\mathrm{Sp}\{\hat{\rho}\}=1$

**Reiner Zustand als Spezialfall**
$$\hat{\rho}=|\psi\rangle\langle\psi|, \qquad \hat{\rho}^2=\hat{\rho}, \qquad \mathrm{Sp}\{\hat{\rho}^2\}=1$$

**Gemischter Zustand**
$$\hat{\rho}^2\neq \hat{\rho}, \qquad \mathrm{Sp}\{\hat{\rho}^2\}<1$$

---

### Erwartungswerte: Spurformel
Für eine Observable $\hat{A}$ gilt allgemein:

$$\langle \hat{A}\rangle=\mathrm{Sp}\{\hat{A}\hat{\rho}\}$$

- Für reinen Zustand $|\psi\rangle$: $\langle \hat{A}\rangle=\langle \psi|\hat{A}|\psi\rangle$.
- Für Ensemble: $\langle \hat{A}\rangle=\sum_n p_n \langle \psi_n|\hat{A}|\psi_n\rangle$ (äquivalent zur Spurformel).

---

### Basisdarstellung: Populationsanteile und Kohärenzen
Wähle eine Orthonormalbasis $\{|i\rangle\}$. Matrixelemente:

$$\rho_{ij}=\langle i|\hat{\rho}|j\rangle$$

**Physikalische Interpretation**
- **Diagonalelemente** $\rho_{ii}$: **Populationen** (Wahrscheinlichkeit, im Zustand $|i\rangle$ zu sein, wenn in dieser Basis gemessen wird).
- **Off-Diagonalelemente** $\rho_{ij}$ mit $i\neq j$: **Kohärenzen** (Phasenbeziehungen; verantwortlich für Interferenz- und Superpositionseffekte).

---

### Beispiel: statistisches Gemisch vs. kohärente Superposition (Zwei-Niveau-System)
#### (A) Gemischter Zustand (klassisches „Entweder-oder“)
In der Basis $\{|0\rangle,|1\rangle\}$:

$$\hat{\rho}=p_0|0\rangle\langle 0|+p_1|1\rangle\langle 1|$$

Matrixdarstellung:

$$\rho= \begin{pmatrix} p_0 & 0\\ 0 & p_1 \end{pmatrix}$$

- Nur Populationen, **keine Kohärenzen**.
- Interferenz-sensitive Messgrößen (die auf Off-Diagonalelemente reagieren) zeigen **keine** kohärenten Effekte.

#### (B) Reiner Zustand als Superposition (quantenmechanisches „Sowohl-als-auch“)
$$|\psi\rangle=\alpha|0\rangle+\beta|1\rangle,\qquad |\alpha|^2+|\beta|^2=1$$

$$\hat{\rho}=|\psi\rangle\langle\psi|= \begin{pmatrix} |\alpha|^2 & \alpha\beta^*\\ \alpha^*\beta & |\beta|^2 \end{pmatrix}$$

- Off-Diagonal: $\rho_{01}=\alpha\beta^*$, $\rho_{10}=\alpha^*\beta$ (**Kohärenz**).
- **Interferenz** entsteht genau durch diese Terme.

| Zustandstyp | Mathematisch | Diagonale | Off-Diagonale | Interferenz? |
|---|---|---|---|---|
| Gemisch | $\sum_n p_n|\psi_n\rangle\langle\psi_n|$ | ja | oft 0 (basisabhängig) | i. A. unterdrückt |
| Reiner Zustand | $|\psi\rangle\langle\psi|$ | ja | i. A. $\neq 0$ | ja |

---

### Wann braucht man Quantenstatistik? (Überlappende Wellenfunktionen)
Quantenstatistik wird wichtig, wenn sich die Wellenpakete der Teilchen **räumlich überlappen**. Das passiert, wenn die **thermische de-Broglie-Wellenlänge** $\lambda_T$ in die Größenordnung des **mittleren Teilchenabstands** $n^{-1/3}$ kommt.

- Kriterium (qualitativ):
$$n\,\lambda_T^3 \gtrsim 1$$
mit Teilchendichte $n=N/V$.

**Regime**
- **Klassische Grenze**: hohe Temperaturen / geringe Dichten  
  $$n\lambda_T^3\ll 1$$  
  → Maxwell-Boltzmann-Statistik, Teilchen praktisch unterscheidbar, kaum Überlappung.
- **Quantenregime**: niedrige Temperaturen / hohe Dichten  
  $$n\lambda_T^3\sim 1 \text{ oder größer}$$  
  → Ununterscheidbarkeit + (Anti-)Symmetrie der Vielteilchenwellenfunktion wird entscheidend.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/360c9b27-7239-49bb-b5c3-1790ec3c8f12/95d38105-dabe-4631-a371-24ef87ae58b0-15_825_2801_174_126.jpg)

---

### Bosonen- vs. Fermionen-Regime (qualitativ)
- **Bosonen** (symmetrische Zustände): Tendenz zur **Bündelung** in gleiche Einteilchenzustände → bei tiefen $T$ kann ein **Bose-Einstein-Kondensat** auftreten (makroskopische Besetzung des Grundzustands).
- **Fermionen** (antisymmetrische Zustände): **Pauli-Prinzip** verhindert Mehrfachbesetzung → bei tiefen $T$ entsteht eine Fermi-See; selbst bei $T=0$ bleiben Impulse bis zur Fermi-Kante besetzt (führt qualitativ zu „Fermi-Druck“).

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/360c9b27-7239-49bb-b5c3-1790ec3c8f12/95d38105-dabe-4631-a371-24ef87ae58b0-16_915_1926_793_215.jpg)

---

### Messgrößen, die Kohärenzen sichtbar machen
Ob ein System „quantenmechanisch kohärent“ ist, zeigt sich daran, ob Observablen auf Off-Diagonal-Elemente $\rho_{ij}$ reagieren:

- **Interferenzexperimente** (z. B. zwei Wege/Moden): benötigen Kohärenzen.
- **Phasen-sensitive Observablen**: messen nicht nur Populationen, sondern auch relative Phasen.
- **Dekohärenz** (durch Kopplung an Umgebung): Off-Diagonal-Elemente werden unterdrückt → $\hat{\rho}$ wird (in geeigneter Basis) näherungsweise diagonal und wirkt „klassischer“.

---

### (Kontext) Ensemble-Idee: Mikro ↔ Makro
Wie in der klassischen statistischen Mechanik betrachtet man viele kompatible Mikrozustände pro Makrozustand; im Quantenfall geschieht dies über $\hat{\rho}$ statt über eine Phasenraumdichte.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c3f11257-bac0-4d04-a400-59bbf93443d6/25d076b2-b147-4a3b-9d72-efd9651588eb-09_809_1464_1384_132.jpg)

*(Die thermodynamischen Ensembles $(E,V,N)$ mikrokanonisch, $(T,V,N)$ kanonisch, $(T,V,\mu)$ großkanonisch liefern jeweils die passenden Wahrscheinlichkeitsgewichte; im Quantenfall werden sie kompakt durch den Dichteoperator kodiert.)*

## 5) Entropie, 1. Hauptsatz und mikroskopische Deutung von Wärme und Arbeit

### 5.1 Von-Neumann-Entropie als Informations-/Zustandsmaß
Für einen quantenstatistischen Zustand mit Dichtematrix $\hat{\rho}$ ist die **von-Neumann-Entropie**
$$S(\hat{\rho})=-k_B\,\mathrm{Sp}\{\hat{\rho}\ln \hat{\rho}\}.$$
- **Bedeutung:** Maß für die „Unbestimmtheit“/Informationsignoranz über den Mikrozustand (analog zu $S=k_B\ln\Omega$ im mikrokanonischen Fall).
- Für eine Diagonaldarstellung $\hat{\rho}=\sum_k p_k |k\rangle\langle k|$ folgt
  $$S=-k_B\sum_k p_k\ln p_k,$$
  also die Shannon-Entropie der Besetzungswahrscheinlichkeiten $p_k$.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c3f11257-bac0-4d04-a400-59bbf93443d6/25d076b2-b147-4a3b-9d72-efd9651588eb-15_788_640_834_2155.jpg)

### 5.2 Variation von $S$ bei Spurerhaltung
Ausgehend von
$$S=-k_B\,\mathrm{Sp}\{\hat{\rho}\ln\hat{\rho}\}$$
ergibt die Variation
$$dS=-k_B\,\mathrm{Sp}\{d\hat{\rho}\,\ln\hat{\rho}+\hat{\rho}\,d(\ln\hat{\rho})\}.$$
Nutze nun die **Spurerhaltung** $\mathrm{Sp}\{\hat{\rho}\}=1 \Rightarrow \mathrm{Sp}\{d\hat{\rho}\}=0$ sowie die Identität
$$\mathrm{Sp}\{\hat{\rho}\,d(\ln\hat{\rho})\}=\mathrm{Sp}\{d\hat{\rho}\}.$$
Damit folgt kompakt
$$dS=-k_B\,\mathrm{Sp}\{(\ln\hat{\rho})\,d\hat{\rho}\}.$$
Interpretation: Entropie ändert sich durch **Änderung der Zustandsinformation** (d. h. durch $d\hat{\rho}$).

### 5.3 Mittlere Energie und Zerlegung von $dE$
Die **mittlere Energie** ist
$$E=\langle \hat{H}\rangle=\mathrm{Sp}\{\hat{H}\hat{\rho}\}.$$
Daraus folgt durch Produktregel
$$dE=\mathrm{Sp}\{(d\hat{H})\,\hat{\rho}\}+\mathrm{Sp}\{\hat{H}\,d\hat{\rho}\}.$$
- $\mathrm{Sp}\{(d\hat{H})\,\hat{\rho}\}$: Änderung durch **Verschiebung des Hamiltonoperators** (äußere Parameter).
- $\mathrm{Sp}\{\hat{H}\,d\hat{\rho}\}$: Änderung durch **Umpopulation**/Zustandsänderung (bei festem $\hat{H}$).

### 5.4 Statistische Form des 1. Hauptsatzes
Für Gleichgewichtszustände gilt (im reversiblen/quasistatischen Kontext) die Identifikation
$$\mathrm{Sp}\{\hat{H}\,d\hat{\rho}\}=T\,dS.$$
Damit erhält man die statistische Interpretation des 1. Hauptsatzes:
$$dE=T\,dS+\mathrm{Sp}\{(d\hat{H})\,\hat{\rho}\}.$$
Hängt $\hat{H}$ von äußeren Parametern $X_i$ ab, $\hat{H}=\hat{H}(X_i)$, dann
$$d\hat{H}=\sum_i \frac{\partial \hat{H}}{\partial X_i}\,dX_i, \qquad \Rightarrow\qquad \mathrm{Sp}\{(d\hat{H})\,\hat{\rho}\}=\sum_i \left\langle \frac{\partial \hat{H}}{\partial X_i}\right\rangle dX_i.$$
Mit der (häufigen) Konvention
$$\hat{F}_i:=-\frac{\partial \hat{H}}{\partial X_i}$$
folgt
$$dE=T\,dS+\sum_i \langle \hat{F}_i\rangle\,dX_i$$
(bis auf Vorzeichen je nach Definition von „generalisierter Kraft“ und „Arbeit am System“).

### 5.5 Mikroskopische Unterscheidung: Wärme vs. Arbeit
Betrachte die Eigenbasis von $\hat{H}$ mit Energieniveaus $E_k$ und Besetzungen $p_k$ (diagonales $\hat{\rho}$). Dann ist
$$E=\sum_k p_k E_k \quad\Rightarrow\quad dE=\sum_k E_k\,dp_k+\sum_k p_k\,dE_k.$$
Damit:

| Beitrag | mikroskopisch | typisch | Interpretation |
|---|---|---|---|
| **Wärme** $\delta Q$ | $\delta Q=\sum_k E_k\,dp_k$ | $dp_k\neq 0$, aber $dE_k=0$ | Umpopulation der Niveaus → Informations-/Entropieänderung |
| **Arbeit** $\delta W$ | $\delta W=\sum_k p_k\,dE_k$ | $dE_k\neq 0$ durch $d\hat{H}\neq 0$ | äußere Parameter verschieben das Spektrum |

Äquivalent zur „Parameterform“:
$$\delta W=\mathrm{Sp}\{(d\hat{H})\hat{\rho}\}=\sum_i \langle \hat{F}_i\rangle dX_i.$$

**Merksatz:**  
- **Wärme** ändert die **Populationen** (und damit i. Allg. $S$).  
- **Arbeit** ändert die **Energieniveaus** (durch äußere „Knöpfe“ $X_i$).

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3e5e289-2c37-474f-bb8f-e020c06a8c45/0982277a-4da9-4fb1-bc0a-66f7dcfd778b-01_1512_2552_575_396.jpg)

### 5.6 Beispiele (zwei-Niveau-System)
**System:** $E_0=0$, $E_1=\Delta$, Besetzungen $p_0, p_1$ mit $p_0+p_1=1$.

1) **Arbeit durch Level-Splitting ändern** (äußerer Parameter $\Delta$):
- $\Delta\to \Delta+d\Delta$, aber $p_k$ (zunächst) fest  
$$\delta W=\sum_k p_k\,dE_k=p_1\,d\Delta,\qquad \delta Q=\sum_k E_k\,dp_k=0.$$
Interpretation: Spektrum wird „auseinandergezogen“, ohne dass sich Populationen ändern müssen.

2) **Wärme durch thermische Relaxation** bei festem Hamiltonoperator:
- $\hat{H}$ fest $\Rightarrow dE_k=0$, aber $p_k$ relaxieren (Kontakt mit Bad)  
$$\delta Q=\Delta\,dp_1,\qquad \delta W=0.$$
Interpretation: Energieänderung kommt aus **Umpopulation** (typisch: Entropie nimmt zu).

### 5.7 Rolle von $T\,dS$ als „Wärmeanteil“ im Gleichgewicht
Im **reversiblen/quasistatischen Gleichgewichtskontext** kann man identifizieren:
$$\delta Q_\mathrm{rev}=T\,dS.$$
Wichtig:
- $\delta Q$ und $\delta W$ sind **Prozessgrößen** (wegabhängig, keine Zustandsfunktionen).
- $S$ und $E$ sind **Zustandsgrößen** (totale Differentiale).
- Für irreversible Prozesse gilt (Clausius):
$$dS\ge \frac{\delta Q}{T},$$
Gleichheit nur im reversiblen Grenzfall.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3e5e289-2c37-474f-bb8f-e020c06a8c45/0982277a-4da9-4fb1-bc0a-66f7dcfd778b-11_281_1184_1341_364.jpg)

---

## Quick Reference: Key Formulas

### Thermodynamik / Entropie (Hauptsätze)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Clausius-Ungleichung (2. Hauptsatz) | $\Delta S \geq \frac{\delta Q}{T}$ | $\Delta S$ Entropieänderung, $\delta Q$ zu-/abgeführte Wärme (infinitesimal), $T$ absolute Temperatur |

### Thermodynamik / Ideales Gas
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Zustandsgleichung ideales Gas | $pV = N k_{B} T$ | $p$ Druck, $V$ Volumen, $N$ Teilchenzahl, $k_B$ Boltzmann-Konstante, $T$ Temperatur |

### Wahrscheinlichkeitstheorie / Binomialverteilung (inkl. Random Walk)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Binomialverteilung (Form 1) | $P(r)=\binom{N}{r}\, p^{r}(1-p)^{N-r}$ | $P(r)$ Wahrscheinlichkeit für $r$ Erfolge, $\binom{n}{r}$ Binomialkoeffizient, $p$ Erfolgswahrscheinlichkeit, $n,N$ Anzahl Versuche (wie im Material notiert), $r$ Anzahl Erfolge |
| Binomialverteilung (Form 2, Random-Walk-Notation) | $P(N,k)=\binom{N}{k}\, p^{k}(1-p)^{N-k}$ | $P(N,k)$ Wahrscheinlichkeit für $k$ Erfolge in $N$ Schritten/Versuchen, $\binom{N}{k}$ Binomialkoeffizient, $p$ Erfolgswahrscheinlichkeit, $N$ Anzahl Versuche, $k$ Anzahl Erfolge |

### Fluktuationen / Thermodynamischer Limes
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Relative Schwankungen (Skalierung) | $\sim \frac{1}{\sqrt{N}}$ | $N$ Teilchenzahl (oder Anzahl unabhängiger Beiträge); Ausdruck beschreibt die Größenordnung relativer Fluktuationen |
| Zusammenhang Kompressibilität–Fluktuationen (wie angegeben) | $\kappa_{\mathrm{T}} \propto (\Delta N)^{2}$ | $\kappa_{\mathrm{T}}$ isotherme Kompressibilität, $\Delta N$ Teilchenzahl-Fluktuation; $\propto$ bedeutet proportional |

### Skalierung / Anzahl der Gleichungen (Komplexität)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Exponentielle Skalierung der Anzahl von Differentialgleichungen (wie notiert) | $\sim\left(\frac{L}{\Delta z}\right)^{3N}$ | $L$ charakteristische Systemgröße, $\Delta z$ Gitter-/Auflösungsskala, $N$ Teilchenzahl; Ausdruck gibt die Skalierung an |
