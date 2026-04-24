# Magnetismus – Detaillierte Studiennotizen

## 1) Grundlagen und magnetische Größen

### 1.1 Magnetismus als Phänomen: Pole, Kräfte, Dipole
- **Magnetpole**: Ein Stabmagnet besitzt zwei Pole (**Nord**- und **Südpol**).
  - **Gleichnamige** Pole stoßen sich ab, **ungleichnamige** ziehen sich an.
  - Isolierte magnetische Monopole werden im klassischen Kontext nicht beobachtet; magnetische Quellen treten effektiv als **Dipole** auf.
- **Magnetischer Dipol**: Grundbaustein vieler magnetischer Strukturen (z. B. atomare magnetische Momente durch **Spin** und **Bahndrehimpuls**).
  - Dipolmoment $\vec{\mu}$ „richtet sich“ in einem äußeren Feld bevorzugt so aus, dass die Energie minimal wird (siehe auch Thermodynamik magnetischer Systeme).

### 1.2 Feldlinienbild und qualitative Interpretation
- **Magnetfeldlinien** sind ein anschauliches Hilfsmittel:
  - Sie verlaufen **außerhalb** eines Stabmagneten von **Nord nach Süd**, **innerhalb** zurück (geschlossene Linien).
  - **Dichte der Feldlinien** $\Rightarrow$ Maß für die Stärke des Feldes (qualitativ für $|\vec{B}|$).
  - Feldlinien **schneiden sich nicht** (sonst wäre die Feldrichtung nicht eindeutig).
- Typisches Feldlinienbild und die Verbindung zur Magnetisierung (mikroskopische Momente):
  
  ![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3f33bea-e4f2-4e48-8b54-d1a2c64d4d1b/068d9395-c565-403d-8da9-0d02f2e87960-01_1004_2151_972_734.jpg)

### 1.3 Zentrale Größen: $B$, $H$, $\Phi$, $\mu$
Die wichtigsten makroskopischen Feldgrößen (SI-Einheiten):

| Größe | Symbol | Bedeutung | Einheit |
|---|---:|---|---:|
| **Magnetische Flussdichte** | $\vec{B}$ | „Induktion“; beschreibt das wirkende Magnetfeld (u. a. Kraft-/Drehmomentwirkung) | $\mathrm{T}$ (Tesla) |
| **Magnetische Feldstärke** | $\vec{H}$ | Feldgröße, die durch freie Ströme/äußere Anregung „erzeugt“ wird; nützlich zur Materialbeschreibung | $\mathrm{A/m}$ |
| **Magnetischer Fluss** | $\Phi$ | Gesamtfluss von $\vec{B}$ durch eine Fläche | $\mathrm{Wb}$ (Weber) |
| **Permeabilität** | $\mu$ | Kopplung zwischen $H$ und $B$ im Material | $\mathrm{H/m}$ |

- **Magnetischer Fluss** durch eine Fläche $A$:
  $$
  \Phi=\int_A \vec{B}\cdot d\vec{A}
  $$
  Für homogenes Feld und senkrechte Fläche: $\Phi=BA$.

- **Permeabilität**:
  $$
  \mu=\mu_0\mu_r
  $$
  mit **Vakuumpermeabilität** $\mu_0$ und **relativer Permeabilität** $\mu_r$ (dimensionslos).
  - Für viele nicht-ferromagnetische Stoffe gilt näherungsweise $\mu_r\approx 1$.
  - Für ferromagnetische Stoffe kann $\mu_r\gg 1$ sein (stark material- und feldabhängig).

### 1.4 Abgrenzung von $B$- und $H$-Feld (Materialabhängigkeit)
- In Materie ist es sinnvoll, zwischen „Anregung“ und „Antwort“ zu unterscheiden:
  - $\vec{H}$: wird wesentlich durch **freie Ströme** und äußere Geometrie festgelegt.
  - $\vec{B}$: ist das „resultierende“ Feld **im Material** (inkl. Beitrag durch magnetische Momente).
- Häufig verwendete (lineare) Materialbeziehung:
  $$
  \vec{B}=\mu\,\vec{H}=\mu_0\mu_r\,\vec{H}
  $$
  (gilt gut für lineare Medien; Ferromagnete sind oft **nichtlinear** und zeigen Hysterese).

### 1.5 Magnetisierung und mikroskopische Momente (Brücke zur Statistischen Physik)
- **Magnetisierung** $\vec{M}$: mittleres magnetisches Moment pro Volumen:
  $$
  \vec{M}(\vec{r})=\frac{1}{\Delta V}\sum_{i\in \Delta V}\vec{\mu}_i
  $$
  (anschaulich: Mittelung über viele atomare Momente, siehe Abbildung oben).
- Für die gesamte Probe:
  $$
  \overrightarrow{\mathcal{M}}=\int_V \vec{M}\,d^3r=\sum_i \vec{\mu}_i
  $$
- **Energie in äußerem Feld** (zentrale Kopplung, später wichtig für Paramagnetismus/Ising):
  $$
  \hat{H}=-\hat{\mathcal{M}}\cdot \vec{B}
  $$

### 1.6 Magnetische Arbeit (thermodynamische Einordnung)
- Änderung der magnetischen Arbeit bei Änderung des Moments in einem äußeren Feld:
  
  ![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c134a79d-211c-48b2-8149-eecc863d2479/0e8667e3-37d6-412b-8e95-93029ab5c7af-20_344_609_1521_1605.jpg)

  In Differentialform (typische Konvention in den Folien):
  $$
  \delta W_{\mathrm{mag}}=\vec{B}\cdot d\overrightarrow{\mathcal{M}}
  $$
  Diese Kopplung liefert im Ising-/Spin-Kontext den **Feldterm** („$h$-Term“): äußeres Feld begünstigt Ausrichtung der Spins.

### 1.7 Superpositionsprinzip (qualitativ)
- **Linearer Bereich**: Magnetfelder überlagern sich näherungsweise linear:
  $$
  \vec{B}_\text{ges}\approx \sum_k \vec{B}_k
  $$
- Wichtiges Bild: Ein makroskopisches Feld kann als Überlagerung vieler **Dipolfelder** (atomare Momente/Spins) verstanden werden — Grundlage für Modellbildungen wie (ungekoppelte) Paramagnete und gekoppelte Spinmodelle (Ising/Heisenberg).

## 2) Ursprung des Magnetismus: Atome, Elektronenspin und Domänen

### Mikroskopischer Ursprung magnetischer Momente
Magnetismus entsteht aus **magnetischen Dipolmomenten** von Elektronen. Es gibt zwei Beiträge:

- **Orbitaler Beitrag (Bahndrehimpuls $\vec{L}$):** Umlaufbewegung geladener Teilchen $\Rightarrow$ Stromschleife $\Rightarrow$ magnetisches Moment.
- **Spinbeitrag (Elektronenspin $\vec{S}$):** intrinsisches quantenmechanisches Moment (klassisches Bild: „Eigendrehimpuls“).

Für ein Elektron gilt (Vorzeichen wegen negativer Ladung):
$$
\vec{\mu}=-\frac{\mu_B}{\hbar}\left(\vec{L}+g_s\hbar\,\vec{S}\right),\qquad g_s\simeq 2,\qquad \mu_B=\frac{e\hbar}{2m_e}.
$$

**Wichtige Konsequenzen:**
- **Quantisierung:** Projektionen sind diskret (z.B. für $S=1/2$: „up“/„down“).
- In vielen Festkörpern ist der **Spinbeitrag dominant**, weil $\vec{L}$ durch Kristallfelder oft **„gequencht“** wird (eingeschränkt durch Bindung/Symmetrie).

### Mikroskopisch $\rightarrow$ makroskopisch: Magnetisierung $M$
Die Magnetisierung ist das **mittlere magnetische Moment pro Volumen**:
- Gesamtmoment der Probe:
$$
\overrightarrow{\mathcal{M}}=\int_V \vec{M}(\vec{r})\,d^3r=\sum_i \vec{\mu}_i.
$$
- Lokale/mesoskopische Definition über ein kleines Volumenelement $\Delta V$:
$$
\vec{M}(\vec{r})=\frac{1}{\Delta V}\sum_{i\in \Delta V}\vec{\mu}_i.
$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3f33bea-e4f2-4e48-8b54-d1a2c64d4d1b/068d9395-c565-403d-8da9-0d02f2e87960-01_1004_2151_972_734.jpg)

Thermodynamisch koppelt ein äußeres Feld über die Zeeman-Energie:
$$
\hat{H}=-\hat{\mathcal{M}}\cdot \vec{B}.
$$

### Materialklassen: Dia-, Para- und Ferromagnetismus (mit typischen $\chi$)
Für schwache, lineare Antwort gilt oft:
$$
\vec{M}=\chi\,\vec{H}\qquad (\text{in SI: } \chi \text{ dimensionslos}).
$$

| Klasse | Mikroskopisches Bild | Vorzeichen/Größenordnung von $\chi$ (typisch) | Beispiele |
|---|---|---:|---|
| **Diamagnetisch** | Induzierte Kreisströme wirken dem Feld entgegen (Lenz’sche Regel) | $\chi<0$, klein: $\sim -10^{-6}\dots -10^{-5}$ | Cu, Ag, Au, Graphit, Wasser |
| **Paramagnetisch** | **Ungepaarte Spins** richten sich teilweise im Feld aus, thermisch gestört | $\chi>0$, klein: $\sim 10^{-6}\dots 10^{-3}$; oft $\chi\propto 1/T$ | Al (schwach), Salze/ Ionen mit ungepaarten Elektronen, Störstellen |
| **Ferromagnetisch** | **Austauschwechselwirkung** koppelt Nachbarspins $\Rightarrow$ kollektive Ordnung, spontane $M$ | sehr groß, effektiv $\mu_r\gg 1$; nichtlinear, Hysterese | Fe, Co, Ni; viele Legierungen |

**Paramagnetismus ungekoppelter Spins (Spin-$1/2$-Bild):**
- Zwei Energieniveaus im Feld $B$:
$$
\varepsilon_{\uparrow}=+\mu B,\qquad \varepsilon_{\downarrow}=-\mu B.
$$
- Zustandsgleichung (idealer Paramagnet):
$$
\mathcal{M}=N\mu\,\tanh\left(\frac{\mu B}{k_BT}\right).
$$
- Für schwache Felder/hohe $T$: $\tanh x\simeq x$ (Curie-Gesetz)
$$
\chi\simeq \frac{1}{V}\frac{\partial \mathcal{M}}{\partial B}\Big|_T\simeq \frac{N}{V}\frac{\mu^2}{k_BT}\propto \frac{1}{T}.
$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3f33bea-e4f2-4e48-8b54-d1a2c64d4d1b/068d9395-c565-403d-8da9-0d02f2e87960-06_429_1565_575_1336.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3f33bea-e4f2-4e48-8b54-d1a2c64d4d1b/068d9395-c565-403d-8da9-0d02f2e87960-08_914_1269_338_1658.jpg)

### Austauschwechselwirkung: warum Ferromagnetismus nicht „nur“ Dipol-Dipol ist
- Die magnetische **Dipol-Dipol-Wechselwirkung** zwischen Elektronen ist für typische Abstände **zu schwach**, um starke ferromagnetische Ordnung (z.B. in Fe) zu erklären.
- Entscheidend ist die **Austauschwechselwirkung**: Effekt aus **Pauli-Prinzip** + **Coulomb-Abstoßung** identischer Fermionen. Sie kann energetisch **parallele** oder **antiparallele** Spin-Anordnung bevorzugen (Material-/Bandstrukturabhängig).

Modellbeschreibung:
- **Heisenberg-Modell (vektoriell):**
$$
H=-J\sum_{\langle i,k\rangle}\vec{S}_i\cdot \vec{S}_k-\sum_i \vec{\mu}_i\cdot\vec{B},
$$
mit $J>0$ (ferromagnetisch), $J<0$ (antiferromagnetisch).
- **Ising-Modell (nur eine Achse, z.B. $z$):**
$$
H=-J\sum_{\langle i,k\rangle}\sigma_i\sigma_k-h\sum_i\sigma_i,\qquad \sigma_i=\pm 1.
$$
Interpretation: $h$ modelliert das äußere Feld (Zeeman), $J$ die Austauschkopplung zwischen Nachbarn.

**Merke (Fokus Ising):**
- In **1D** (kurzreichweitig, $B=0$) gibt es bei $T>0$ **keine** echte ferromagnetische Ordnung (keinen Phasenübergang).
- In **2D** existiert ein **endlicher** Phasenübergang bei $T_c>0$ (spontane Symmetriebrechung der $Z_2$-Symmetrie).

### Ferromagnetische Domänen (Weiß-Bezirke) und Domänenwände
Ferromagnete sind bei $T<T_c$ oft nicht „einheitlich“ magnetisiert, sondern in **Domänen** aufgeteilt:

- **Domäne:** Bereich nahezu **gleich ausgerichteter** Magnetisierung.
- **Domänenwände:** Übergangsregionen, in denen die Magnetisierung **dreht** (nicht sprunghaft), um Austauschenergie klein zu halten.

Zwei konkurrierende Energien erklären Domänenbildung:
- **Austauschenergie** bevorzugt **gleichgerichtete** Spins (große Domänen, dünne Wände).
- **Magnetostatische Energie (Streufeld)** wird durch Aufteilung in Domänen reduziert (kleinere Domänen).

**Ausrichtung durch äußeres Feld $B$:**
- Zunächst wachsen Domänen, die günstig zum Feld stehen (**Domänenwandbewegung**).
- Danach Drehung der Magnetisierung innerhalb der Domänen.
- Schließlich **Sättigungsmagnetisierung** $M_s$: nahezu alle Momente parallel.

Hysterese (Domänenwände werden an Defekten „gepinnt“):
- Beim Umpolen muss ein endliches Gegenfeld überwunden werden (**Koerzitivfeld**).
- Remanenz: endliche Magnetisierung bei $B=0$ nach Magnetisierung.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3f33bea-e4f2-4e48-8b54-d1a2c64d4d1b/068d9395-c565-403d-8da9-0d02f2e87960-11_830_1120_380_1870.jpg)

### Temperatur, Curie-Temperatur und Kristallstruktur
- Für **$T<T_c$**: **spontane Magnetisierung** auch bei $B=0$ (geordnetes Spin-System).
- Für **$T>T_c$**: thermische Fluktuationen zerstören die Ordnung $\Rightarrow$ **paramagnetisch**.
- **Bei $T=T_c$**: kontinuierlicher Phasenübergang (kritische Fluktuationen, lange Korrelationslängen).

**Rolle der Kristallstruktur:**
- Austauschpfade, Bandstruktur und Symmetrie bestimmen **Vorzeichen und Stärke** von $J$ sowie die **leichte Achse** (magnetische Ordnung hängt stark vom Gitter ab).

### Anisotropie und Defekte (Realität vs. Idealmodell)
- **Magnetische Anisotropie:** bestimmte Kristallrichtungen sind energetisch bevorzugt (**easy axis**). Sie ist zentral, damit ein Ising-artiges „nur $\pm$ entlang einer Achse“ als Näherung sinnvoll ist.
- **Defekte, Korngrenzen, Verspannungen:** pinnen Domänenwände $\Rightarrow$ beeinflussen
  - Koerzitivfeldstärke,
  - Hystereseform,
  - erreichbare Sättigung bei gegebenem Feld.

### Anschauliches Beispiel für komplexe Spintexturen (optional)
Unter bestimmten Wechselwirkungen/Feldern können nichttriviale Strukturen (z.B. Skyrmion-Gitter) auftreten:

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c134a79d-211c-48b2-8149-eecc863d2479/0e8667e3-37d6-412b-8e95-93029ab5c7af-12_503_846_538_1764.jpg)

## 3) Elektromagnetismus: Ströme als Magnetfeldquellen und Kräfte

### 3.1 Grundidee: Ströme erzeugen Magnetfelder
- **Stationäre Ströme** (Magnetostatik) erzeugen ein **wirbelförmiges Magnetfeld** $\vec B$ um den Leiter (Rechte-Hand-Regel).
- Zentrale Größe: **magnetische Flussdichte** $\vec B$ (Einheit Tesla, $\mathrm T$), häufig mit $\mu_0=4\pi\cdot10^{-7}\,\mathrm{H/m}$.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3f33bea-e4f2-4e48-8b54-d1a2c64d4d1b/068d9395-c565-403d-8da9-0d02f2e87960-06_429_1565_575_1336.jpg)

---

### 3.2 Biot–Savart-Gesetz (Feld aus Stromverteilungen)
Für ein Stromelement $I\,\mathrm d\vec \ell$ am Ort $\vec r'$ und Beobachtungspunkt $\vec r$:
$$
\mathrm d\vec B(\vec r)=\frac{\mu_0}{4\pi}\,I\,\frac{\mathrm d\vec \ell\times(\vec r-\vec r')}{|\vec r-\vec r'|^3}.
$$
- Richtung durch Kreuzprodukt (**Rechte-Hand-Regel**).
- Betrag fällt typischerweise wie $1/R^2$ (im Integrand), resultierende Felder oft wie $1/R$ (z. B. langer Leiter).

**Standardresultate**
- **Unendlich langer gerader Leiter** (Abstand $r$):
$$
B(r)=\frac{\mu_0 I}{2\pi r},\qquad \vec B \parallel \text{Azimutrichtung}.
$$
- **Kreisförmige Leiterschleife** (Radius $R$) im Zentrum:
$$
B(0)=\frac{\mu_0 I}{2R}.
$$
  Für $N$ Windungen: $B\to N B$.

---

### 3.3 Ampèresches Gesetz (symmetriegestützte Berechnung)
Magnetostatisch:
$$
\oint_{\mathcal C}\vec B\cdot \mathrm d\vec \ell = \mu_0\,I_\text{eingeschlossen}.
$$
- Besonders mächtig bei hoher **Symmetrie** (zylindrisch / translational / toroidal).
- Vorgehen: geeignete **Ampereschleife** wählen, sodass $\vec B$ auf Teilen konstant und tangential ist.

#### Anwendungen (lange Leiter, Solenoid, Toroid)

| Geometrie | Feld (Ideal/innen) | Bemerkung |
|---|---:|---|
| Langer gerader Leiter | $B(r)=\frac{\mu_0 I}{2\pi r}$ | wie Biot–Savart |
| **Langes Solenoid** (Windungsdichte $n=N/L$) | $B\approx \mu_0 n I$ | innen nahezu homogen, außen klein |
| **Toroid** (N Windungen, Radius $r$ im Kern) | $B(r)=\frac{\mu_0 N I}{2\pi r}$ | Feld weitgehend im Kern eingeschlossen |

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3f33bea-e4f2-4e48-8b54-d1a2c64d4d1b/068d9395-c565-403d-8da9-0d02f2e87960-01_1004_2151_972_734.jpg)

---

### 3.4 Lorentzkraft: Kraft auf bewegte Ladungen
Für eine Ladung $q$ mit Geschwindigkeit $\vec v$:
$$
\vec F = q\,\vec v\times \vec B.
$$
- Betrag: $F=|q|vB\sin\theta$.
- $\vec F$ ist stets **senkrecht** zu $\vec v$ $\Rightarrow$ verrichtet (ideal) **keine Arbeit** am Teilchen, ändert aber die Bewegungsrichtung (Kreis-/Helixbahn).

---

### 3.5 Kraft auf stromdurchflossene Leiter
Aus der Lorentzkraft auf viele bewegte Ladungen:
$$
\mathrm d\vec F = I\,\mathrm d\vec \ell \times \vec B,
\qquad \text{bei homogenem Feld:}\qquad
\vec F = I\,\vec \ell \times \vec B.
$$
- $\vec \ell$: Vektor entlang des Leiterstücks (Richtung des konventionellen Stroms).
- Grundlage für **Elektromotor**, **Lautsprecher**, **Galvanometer**.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3f33bea-e4f2-4e48-8b54-d1a2c64d4d1b/068d9395-c565-403d-8da9-0d02f2e87960-11_830_1120_380_1870.jpg)

---

### 3.6 Drehmoment auf Leiterschleifen & Prinzip des Elektromotors
Eine rechteckige/kreisförmige **Stromschleife** im homogenen Feld erfährt ein **Drehmoment**:
$$
\vec \tau = \vec \mu \times \vec B.
$$
Dabei ist das **magnetische Dipolmoment** der Schleife:
$$
\vec \mu = I\,\vec A,\qquad |\vec A|=A,\quad \vec A \perp \text{Schleifenfläche (Rechte-Hand-Regel)}.
$$
Für $N$ Windungen: $\vec\mu = N I \vec A$.

**Potenzielle Energie** des Dipols im Feld:
$$
U(\theta)=-\vec\mu\cdot \vec B = -\mu B\cos\theta,
$$
$\Rightarrow$ stabile Ausrichtung bei $\vec\mu \parallel \vec B$.

**Elektromotor-Prinzip**
- In der Schleife wirken auf gegenüberliegende Leiterstücke entgegengesetzte Kräfte $\Rightarrow$ **reines Drehmoment**.
- Ein **Kommutator** (Gleichstrommotor) oder Wechselstromansteuerung sorgt dafür, dass das Drehmoment nicht das Vorzeichen wechselt.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3e5e289-2c37-474f-bb8f-e020c06a8c45/0982277a-4da9-4fb1-bc0a-66f7dcfd778b-01_1512_2552_575_396.jpg)

---

### 3.7 Kräfte zwischen parallelen Leitern
Zwei lange parallele Leiter im Abstand $d$ mit Strömen $I_1,I_2$:
- Feld von Leiter 1 am Ort von Leiter 2: $B_1(d)=\frac{\mu_0 I_1}{2\pi d}$.
- Kraft pro Länge auf Leiter 2:
$$
\frac{F}{L}= I_2 B_1 = \frac{\mu_0 I_1 I_2}{2\pi d}.
$$
**Richtung**
- **Gleichgerichtete** Ströme $\Rightarrow$ **Anziehung**.
- **Entgegengesetzte** Ströme $\Rightarrow$ **Abstoßung**.

---

### 3.8 Induktion als Brücke (ohne volle Maxwell-Theorie)
Magnetfelder können nicht nur Kräfte ausüben, sondern auch **Spannungen/Ströme induzieren**, wenn sich der **magnetische Fluss** ändert.

**Magnetischer Fluss**
$$
\Phi_B = \int \vec B\cdot \mathrm d\vec A.
$$

**Faradaysches Induktionsgesetz (Formel, Idee)**
$$
\mathcal E = -\frac{\mathrm d\Phi_B}{\mathrm dt},
\qquad \text{für $N$ Windungen:}\qquad
\mathcal E = -N\frac{\mathrm d\Phi_B}{\mathrm dt}.
$$

**Lenzsche Regel (Richtungskriterium)**
- Das Minuszeichen bedeutet: Der induzierte Strom wirkt **der Flussänderung entgegen**.
- Merksatz: *Induktion “wehrt” die Ursache ab* (Energieerhaltung: mechanische Arbeit $\to$ elektrische Energie/Wärmeverluste).

**Typische Induktionsszenarien**
- bewegter Leiter im Feld (Generatorprinzip),
- zeitlich veränderliches $B(t)$ durch Spulenstromänderung (Selbstinduktion, gegenseitige Induktion).

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b911bcad-5d5e-49c5-b4cc-917a24fdc673/7f204057-7a31-4341-beca-2b377aeceffb-17_588_804_1605_132.jpg)

---

### 3.9 Verbindung zur Magnetismus-Thermodynamik (Begriffe aus dem Fokusbereich)
- Das **magnetische Dipolmoment** $\vec\mu$ einer Stromschleife ist das klassische Analogon zu **mikroskopischen Momenten** (Spin/Orbit), die in der Statistischen Physik zur **Magnetisierung** beitragen.
- Makroskopische **Magnetisierung** als Dichte magnetischer Momente:
$$
\vec M(\vec r)=\frac{1}{\Delta V}\sum_{i\in \Delta V}\vec\mu_i.
$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3f33bea-e4f2-4e48-8b54-d1a2c64d4d1b/068d9395-c565-403d-8da9-0d02f2e87960-04_864_553_260_142.jpg)
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3e5e289-2c37-474f-bb8f-e020c06a8c45/0982277a-4da9-4fb1-bc0a-66f7dcfd778b-03_926_958_253_147.jpg)
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c134a79d-211c-48b2-8149-eecc863d2479/0e8667e3-37d6-412b-8e95-93029ab5c7af-20_344_609_1521_1605.jpg)
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b911bcad-5d5e-49c5-b4cc-917a24fdc673/7f204057-7a31-4341-beca-2b377aeceffb-17_688_926_1500_1542.jpg)
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-04_741_1634_427_369.jpg)

## 4) Magnetische Materialien in Technik: Hysterese, Permanentmagnete und Wechselfelder

### 4.1 Makroskopische Größen und B–H–M-Zusammenhang
- **Magnetisierung** $\vec{M}$: magnetisches Moment pro Volumen; mikroskopisch als Mittelung vieler Dipolmomente.
  
  ![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3f33bea-e4f2-4e48-8b54-d1a2c64d4d1b/068d9395-c565-403d-8da9-0d02f2e87960-01_1004_2151_972_734.jpg)

- **Feldgrößen** (in Materie, SI):
  - $\vec{B}$: magnetische Flussdichte (T)
  - $\vec{H}$: magnetische Feldstärke (A/m)
  - Typisch gilt (einfacher, isotroper Fall):  
    $$\vec{B}=\mu_0(\vec{H}+\vec{M})=\mu_0\mu_r\vec{H}$$
- **Magnetische Arbeit / Energiezufuhr** (thermodynamischer Anschluss):
  $$\delta W_{\mathrm{mag}}=\vec{B}\cdot \delta\overrightarrow{\mathcal{M}}$$
  ![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c134a79d-211c-48b2-8149-eecc863d2479/0e8667e3-37d6-412b-8e95-93029ab5c7af-20_344_609_1521_1605.jpg)

### 4.2 Hysterese in B–H-Kennlinien (ferromagnetische Stoffe)
**Ferromagnete** (z. B. Fe, Co, Ni) zeigen unterhalb $T_c$ eine **spontane Magnetisierung** und **Hysterese** (Gedächtnis des Materials).

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3f33bea-e4f2-4e48-8b54-d1a2c64d4d1b/068d9395-c565-403d-8da9-0d02f2e87960-11_830_1120_380_1870.jpg)

Wichtige Kenngrößen:
- **Remanenz** $B_r$ (oder $M_r$): verbleibende Flussdichte nach Zurückfahren auf $H=0$.
- **Koerzitivfeldstärke** $H_c$: Gegenfeld, das nötig ist, um $B=0$ (bzw. $M=0$) zu erreichen.
- **Sättigung** $B_s$ / $M_s$: obere Grenze, wenn (nahezu) alle Domänen ausgerichtet sind.  
  (Sättigung ist auch in einfachen Paramagnet-Kurven sichtbar: $\tanh$-ähnlicher Verlauf.)
  
  ![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3f33bea-e4f2-4e48-8b54-d1a2c64d4d1b/068d9395-c565-403d-8da9-0d02f2e87960-08_914_1269_338_1658.jpg)

**Energieverlust pro Zyklus (Hystereseverlust):**
- Bei periodischer Ummagnetisierung entspricht die **Fläche der Hystereseschleife** dem Energieverlust pro Volumen:
  $$W_{\mathrm{hyst}}=\oint \vec{H}\cdot d\vec{B}\quad (\text{pro Zyklus, pro Volumen})$$
- In Wechselfeldern führt das zu **Erwärmung** (Kernverluste) und reduziert den Wirkungsgrad von Trafos/Induktivitäten.

**Mikroskopische Einordnung (Bezug zum Ising-/Austauschbild):**
- Hysterese entsteht u. a. durch **Domänenwandbewegung** und **Pinning** an Defekten/Anisotropiebarrieren (metastabile Zustände).  
- In vereinfachten Modellen (Ising/Heisenberg) liefert die **Austauschwechselwirkung** die Tendenz zur parallelen Ausrichtung; Energiebarrieren und Unordnung führen praktisch zu Hysterese.

### 4.3 Weichmagnetische vs. hartmagnetische Materialien
| Eigenschaft | **Weichmagnetisch** | **Hartmagnetisch (Permanentmagnet)** |
|---|---|---|
| Ziel | leicht ummagnetisierbar | Magnetisierung „festhalten“ |
| $H_c$ | klein | groß |
| $B_r$ | eher moderat | hoch (je nach Typ) |
| Schleifenfläche | klein $\Rightarrow$ geringe Verluste | groß (nicht primär für AC gedacht) |
| Typische Anwendungen | Transformatorbleche, Induktivitäten, Elektromagnete | Motoren, Generatoren, Sensorik, Lautsprecher |

**Auswahlkriterien (Kurzcheck):**
- **Transformatorbleche (50/60 Hz, Leistung):**  
  - weichmagnetisch, **kleine Hystereseverluste**, **hohe Permeabilität**, **hohe Sättigungsflussdichte**, **geringe Wirbelstromverluste** (→ Laminierung).
- **Induktivitäten (insb. höhere Frequenzen):**
  - Ferrite/ Pulverkerne je nach Frequenz und Flussdichte; wichtig: **Kernverluste** (Hysterese + Wirbelströme), **Sättigung**.
- **Elektromagnete / Relais:**
  - weichmagnetisch, geringe Remanenz (sonst „Kleben“), hohe $\mu_r$ (große Kraft bei gegebenem Strom).
- **Permanentmagnete:**
  - hartmagnetisch, hohe $H_c$ und $B_r$; wichtig ist auch das maximal nutzbare Energieprodukt (vereinfacht):  
    $$(BH)_{\max}$$

**Beispiele:**
- **NdFeB (Neodym-Eisen-Bor):** sehr hohes $(BH)_{\max}$, starke Magnete; Nachteil: Temperatur-/Korrosionssensibilität je nach Güte.
- **Ferrite (hartmagnetisch oder weichmagnetisch je nach Typ):** günstiger, korrosionsarm, elektrisch schlecht leitend (gut gegen Wirbelströme), aber meist geringere Remanenz als NdFeB.

### 4.4 Wechselfelder: Wirbelströme, Laminierung und Sättigung
**Wirbelströme (Eddy currents):**
- Zeitlich veränderliche Flussdichte induziert elektrische Felder (Faraday):
  $$\vec{\nabla}\times \vec{E}=-\frac{\partial \vec{B}}{\partial t}$$
- In leitfähigen Kernen fließen **Wirbelströme** $\Rightarrow$ **Joule-Verluste** $P\sim I^2R$ und zusätzliche Erwärmung.
- Gegenmaßnahmen:
  - **Laminierung** (dünne, isolierte Bleche) → unterbricht Stromschleifen.
  - **Ferrite** (hoher elektrischer Widerstand) → besonders geeignet bei höheren Frequenzen.

**Magnetische Sättigung:**
- Wenn $B\to B_s$, sinkt die effektive Permeabilität stark: $\mu_{\mathrm{diff}}=dB/dH$ wird klein.
- Praktische Folgen:
  - Induktivität fällt ab (Drosseln „brechen ein“),
  - höhere Verzerrungen/Überstromrisiken,
  - Auslegung: ausreichender Kernquerschnitt, ggf. **Luftspalt** zur Linearisierung (erhöht Reluktanz, reduziert Sättigungsneigung).

### 4.5 Magnetostriktion und praktische Effekte (Trafo-Brummen)
- **Magnetostriktion**: feldabhängige elastische Längenänderung magnetischer Materialien.
- In Trafos führt das (bei $B(t)$) zu periodischen Kräften/Schwingungen → **hörbares Brummen** (typisch bei $2f$, da Dehnung oft $\propto B^2$).
- Minimierung:
  - geeignete Blechsorten/Legierungen,
  - mechanische Verspannung/Verguss,
  - Betrieb mit kleinerer Flussdichte (unterhalb starker Nichtlinearität).

### 4.6 Magnetkreis-Analogie (Ingenieurswerkzeug)
Analog zur elektrischen Schaltung:
- **Magnetomotorische Kraft (mmf)**:
  $$\mathcal{F}=NI$$
- **Magnetischer Fluss**:
  $$\Phi=\int \vec{B}\cdot d\vec{A}$$
- **Reluktanz** (magnetischer Widerstand):
  $$\mathcal{R}=\frac{\ell}{\mu A}$$
- „Ohm’sches Gesetz“ des Magnetkreises:
  $$\Phi=\frac{\mathcal{F}}{\mathcal{R}}$$

Wichtige Konsequenzen:
- **Luftspalte** dominieren oft die Reluktanz, weil $\mu_{\text{Luft}}\approx \mu_0$ klein ist → sie „bestimmen“ den Fluss und machen das Verhalten berechenbarer/linearer.
- Energie im Magnetkreis (nützlich zur Kraftabschätzung in Aktoren) steckt wesentlich im Feld, oft besonders im Luftspalt.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/204ead23-7ec3-4dd2-a9ff-40b5f38aa220/28642244-d175-43cc-88d7-d1a09b8e51d0-10_638_645_1792_576.jpg)

## 5) Anwendungen, Messmethoden und aktuelle Themen

### 5.1 Konkrete Anwendungen magnetischer Effekte

#### Kompass & Erdmagnetfeld (Deklination/Inklination)
- Ein **Kompass** richtet sich entlang der lokalen Richtung des Erdmagnetfeldes $\vec B_\oplus$ aus (Dipol-ähnliche Struktur, regional gestört durch Geologie/Metall).
- **Deklination** $D$: Winkel zwischen geografischem Norden und der Horizontalprojektion von $\vec B_\oplus$ (Abweichung „magnetischer Nordpol“ vs. geografischer).
- **Inklination** $I$: Winkel zwischen $\vec B_\oplus$ und der Horizontalen.
  - Am magnetischen Äquator: $I\approx 0^\circ$, an magnetischen Polen: $I\approx \pm 90^\circ$.
- Typische Größenordnung: $|\vec B_\oplus|\sim 25\text{–}65\,\mu\text{T}$.

#### Generator & Induktion (Energieumwandlung)
- **Faradaysches Induktionsgesetz**: zeitliche Änderung des magnetischen Flusses $\Phi$ erzeugt eine Induktionsspannung
  $$U_\text{ind}=-N\frac{d\Phi}{dt},\qquad \Phi=\int \vec B\cdot d\vec A.$$
- Im **Generator**: mechanische Arbeit $\rightarrow$ elektrische Energie (Rotation von Spulen/Leitern in $\vec B$ oder Änderung von $\vec B$ durch bewegte Magnete).
- Thermodynamische Sicht: Magnetische Arbeit bei Änderung der Magnetisierung (je nach Konvention)
  $$\delta W_\text{mag}=\vec B\cdot \delta \vec M.$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c134a79d-211c-48b2-8149-eecc863d2479/0e8667e3-37d6-412b-8e95-93029ab5c7af-20_344_609_1521_1605.jpg)

#### Magnetlager (magnetische Levitation)
- **Kontaktlose Lagerung** durch magnetische Kräfte: weniger Reibung, hohe Drehzahlen, geringerer Verschleiß.
- Realisierungen:
  - **Aktive Magnetlager** (Regelung mit Sensorik/Aktuatoren).
  - **Supraleitende Lager** (Flux-Pinning, stabile Levitation).
- Stabilität: rein statische Permanentmagnet-Konfigurationen sind i.A. eingeschränkt (Earnshaw-Theorem); praktische Systeme umgehen dies durch Regelung, Supraleitung oder Rotation.

#### Lautsprecher (Lorentzkraft)
- Spule im Magnetfeld: **Lorentzkraft** auf stromdurchflossenen Leiter
  $$\vec F=I\,\vec L\times \vec B.$$
- Wechselstrom $\rightarrow$ wechselnde Kraft $\rightarrow$ Membran schwingt $\rightarrow$ Schall.

#### Sensorik: Hall-Effekt & magnetoresistive Sensoren
- **Hall-Effekt**: Querfeld $B$ erzeugt Hall-Spannung $U_H$ in stromdurchflossenem Leiter/Halbleiter.
  - Für Hall-Plättchen: $U_H \propto \dfrac{IB}{nq\,t}$ (Materialparameter $n$, Dicke $t$).
  - Anwendungen: Strommessung (galvanisch getrennt), Positions-/Drehzahlsensorik.
- **Magnetoresistive Sensoren**: Widerstandsänderung durch Magnetisierungszustand/Spinanordnung (AMR, GMR, TMR).
  - Vorteile: hohe Empfindlichkeit, integrierbar in Chips; genutzt in Kompassen (Elektronik), Winkelsensoren, Datenspeichern.

#### Medizinische Bildgebung: MRI (Grundprinzipien)
- **NMR/MRI** nutzt die Präzession von Kernspins (v.a. $^1\text{H}$) im starken statischen Feld $B_0$:
  $$\omega_L=\gamma B_0 \quad \text{(Larmor-Frequenz)}.$$
- **RF-Anregung** kippt die Magnetisierung; Signal entsteht durch induzierte Spannung in Empfangsspulen (Relaxation $T_1$, $T_2$).
- **Ortskodierung** durch Gradientenfelder: $B(\vec r)=B_0+\Delta B(\vec r)$, dadurch positionsabhängige $\omega_L(\vec r)$.
- Bezug zu Ferromagnetismus/Materialien: starke, homogene $B_0$-Felder typischerweise mit (superleitenden) Elektromagneten.

#### Teilchenbahnen in Magnetfeldern (Zyklotronradius)
- Geladene Teilchen in homogenem $\vec B$ bewegen sich (bei $\vec v\perp \vec B$) auf Kreisbahnen:
  $$r_c=\frac{p_\perp}{|q|B}=\frac{m v_\perp}{|q|B},\qquad \omega_c=\frac{|q|B}{m}.$$
- Anwendungen: Massenspektrometrie, Teilchenbeschleuniger (Zyklotron/Synchrotron), Plasmaeinschluss.

---

### 5.2 Messmethoden für Magnetfelder $B$

| Methode | Messprinzip | Stärken | Typische Grenzen/Anmerkungen |
|---|---|---|---|
| **Hall-Sonde** | Hall-Spannung $\propto B$ | robust, günstig, lokal | Drift/Temperaturabhängigkeit, Kalibrierung nötig |
| **Fluxgate** | periodische Kernsättigung, Auswertung harmonischer Signale | sehr empfindlich, vektoriell (bis nT) | begrenzter Bereich, empfindlich gegen Störungen |
| **Gaussmeter** | Gerät + Sonde (Hall/Fluxgate) | direkte Anzeige, praxisnah | Genauigkeit abhängig von Sonde/Kalibrierung |
| **Induktionsspule (Suchspule)** | $U_\text{ind}\propto d\Phi/dt$ | gut für AC-Felder | misst Änderungen, nicht statisches $B$ ohne Bewegung |

#### Bestimmung von $B$ in Spulen/Elektromagneten
- **Lange Spule (idealisierte Näherung)**:
  $$B \approx \mu_0 \mu_r n I,\qquad n=\frac{N}{L}.$$
- **Helmholtz-Spulen** (nahezu homogenes Feld im Zentrum):
  - Zwei gleiche Spulen, Abstand $\approx$ Spulenradius; $B$ aus Geometrie und Strom berechenbar.
- **Elektromagnet mit Eisenkern**:
  - Erhöhung durch $\mu_r\gg 1$, aber **Sättigung**: $B(H)$ wird nichtlinear.
  - Praktisch: $B$ im Luftspalt oft entscheidend; Messung mit Hall-Sonde im Spalt üblich.
- **Kalibrier-/Fehlerquellen**:
  - Ausrichtung der Sonde (misst meist eine Komponente), Sensor-Offset, Temperaturdrift, Feldinhomogenität, Streufelder, Remanenz von Ferromagneten.

---

### 5.3 Moderne Themen (Bezug zu Spin/Ising/Materialforschung)

#### Spintronics (Spin als Freiheitsgrad)
- Ziel: Nutzung von **Elektronenspin** zusätzlich zur Ladung (Spinpolarisation, Spinströme).
- Verbindung zu Kursinhalten:
  - **Ising-Modell** als Minimalmodell für kollektive Spinanordnung (Ferro-/Antiferromagnetismus, Phasenübergänge in 2D).
  - Thermische Fluktuationen vs. Austauschwechselwirkung $J$: beeinflussen Magnetisierung, Domänen, Schaltvorgänge.

#### GMR / TMR (magnetischer Widerstand in Schichtsystemen)
- **GMR (Giant Magnetoresistance)**: Widerstand hängt von relativer Magnetisierungsrichtung ferromagnetischer Schichten ab (parallel vs. antiparallel).
- **TMR (Tunneling Magnetoresistance)**: analog, aber mit Tunnelbarriere; Grundlage von **Magnetic Tunnel Junctions (MTJ)**, MRAM.
- Physikalische Idee: **spindependente Streuung/Tunnelwahrscheinlichkeit** $\Rightarrow R(\text{parallel})\neq R(\text{antiparallel})$.

#### Magnonen & Materialforschung
- **Magnonen**: quantisierte Spinwellen (kollektive Anregungen geordneter Spins).
- Relevanz:
  - Transport von Energie/Information ohne Ladungsstrom (geringe Joule-Verluste).
  - Bestimmen Beiträge zu Wärmekapazität/Relaxation und beeinflussen magnetische Dynamik.
- Experimentell: z.B. inelastische Neutronenstreuung, Ferromagnetische Resonanz (FMR).

---

### 5.4 Sicherheitsaspekte starker Magnetfelder
- **Projektilrisiko**: Ferromagnetische Objekte werden stark beschleunigt $\rightarrow$ besonders kritisch bei MRI.
- **Einfluss auf Implantate/Devices**:
  - **Schrittmacher/ICDs**, Cochlea-Implantate, Insulinpumpen: mögliche Fehlfunktion, Erwärmung, Kräfte/Drehmomente.
- **Induzierte Effekte**:
  - Bewegungen in Gradientenfeldern können Wirbelströme/Induktion erzeugen (z.B. Schwindel, Nervenstimulation bei hohen $dB/dt$).
- **Praxis**: Zugangskontrollen, metallfreie Zonen, Screening, Kennzeichnung magnetischer Werkzeuge/Materialien.

---

## Quick Reference: Key Formulas

### Elektromagnetismus (ladungsfreier Raum) – Maxwell-Gleichungen
| Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Gaußsches Gesetz (E-Feld) | $$\vec{\nabla}\cdot\vec{E}=0$$ | $\vec{E}$ elektrisches Feld |
| Gaußsches Gesetz (B-Feld) | $$\vec{\nabla}\cdot\vec{B}=0$$ | $\vec{B}$ magnetisches Feld |
| Faradaysches Induktionsgesetz | $$\vec{\nabla}\times\vec{E}=-\frac{\partial\vec{B}}{\partial t}$$ | $t$ Zeit |
| Ampère-Maxwell-Gesetz (ohne Ströme) | $$\vec{\nabla}\times\vec{B}=\frac{1}{c^{2}}\frac{\partial\vec{E}}{\partial t}$$ | $c$ Lichtgeschwindigkeit |

---

### Magnetische Arbeit / 1. Hauptsatz (magnetische Systeme)
| Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Magnetische Arbeit (differenziell) | $$\delta W_{\mathrm{mag}}=\vec{B}\cdot \delta\overrightarrow{\mathcal{M}}$$ | $\delta W_{\mathrm{mag}}$ magnetische Arbeit, $\overrightarrow{\mathcal{M}}$ magnetisches Moment |
| 1. Hauptsatz für magnetische Systeme | $$dE(S,\overrightarrow{\mathcal{M}})=T\,dS+\delta W_{\mathrm{mag}}=T\,dS+\vec{B}\,d\overrightarrow{\mathcal{M}}$$ | $E$ Energie, $S$ Entropie, $T$ Temperatur |
| Thermodynamische Definition von $\vec{B}$ | $$\vec{B}_k=\frac{\partial E}{\partial \overrightarrow{\mathcal{M}}_k}$$ | Index $k$ Feld-/Momentkomponente |

---

### Magnetisierung & Hamiltonoperator (QM/StatMech)
| Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Hamiltonoperator im homogenen äußeren Feld | $$\hat{H}=-\hat{\overrightarrow{\mathcal{M}}}\cdot\vec{B}$$ | $\hat{H}$ Hamiltonoperator, $\hat{\overrightarrow{\mathcal{M}}}$ Operator des Gesamtmoments |
| Gesamtmagnetisches Moment (Probe) | $$\overrightarrow{\mathcal{M}}=\int_V \vec{M}\,d^{3}r=\sum_i \vec{\mu}_i$$ | $\vec{M}$ Magnetisierung (Dichte), $V$ Volumen, $\vec{\mu}_i$ mikr. Dipolmomente |

---

### Kanonisches Ensemble: Zustandssumme, freie Energie, Ableitungen
| Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Freie Energie (kanonisch) | $$F(T,\vec{B})=-k_B T\ln Z_{\mathrm{K}}$$ | $k_B$ Boltzmann-Konstante, $Z_{\mathrm{K}}$ Zustandssumme |
| Kanonische Zustandssumme | $$Z_{\mathrm{K}}=\operatorname{Sp}\left\{e^{-\beta \hat{H}(\vec{B})}\right\}$$ | $\operatorname{Sp}$ Spur, $\beta$ inverse Temperatur |
| Entropie aus $F$ | $$S=-\left.\frac{\partial F}{\partial T}\right|_{\vec{B}}$$ | Ableitung bei konstantem $\vec{B}$ |
| Mittlere Energie aus $Z_{\mathrm{K}}$ | $$E=\langle\hat{H}\rangle=-\frac{\partial}{\partial\beta}\ln Z_{\mathrm{K}}$$ | $\langle\cdot\rangle$ thermischer Mittelwert |
| Magnetisches Moment aus $F$ (Komponente) | $$\mathcal{M}_k=-\left.\frac{\partial F}{\partial B_k}\right|_{T}=\left.\frac{1}{\beta}\frac{\partial \ln Z_{\mathrm{K}}}{\partial B_k}\right|_{T}$$ | $B_k$ Feldkomponente, $\mathcal{M}_k$ Momentkomponente |

---

### Zweite Ableitungen: Wärmekapazität & Suszeptibilität
| Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Spezifische Wärme bei konstantem Feld | $$C_B=\left.\frac{\partial E}{\partial T}\right|_{\vec{B}}=\left.\frac{\partial E}{\partial S}\frac{\partial S}{\partial T}\right|_{\vec{B}}=-\left.T\frac{\partial^{2}F}{\partial T^{2}}\right|_{\vec{B}}$$ | $C_B$ Wärmekapazität bei konstantem $\vec{B}$ |
| Isotherme magnetische Suszeptibilität | $$\chi=\left.\frac{1}{V}\frac{\partial \mathcal{M}}{\partial B}\right|_{T}=-\left.\frac{1}{V}\frac{\partial^{2}F}{\partial B^{2}}\right|_{T}\quad(\overrightarrow{\mathcal{M}}\parallel\vec{B})$$ | $\chi$ Suszeptibilität, $V$ Volumen |

---

### Legendre-Transformationen: Enthalpie & freie Enthalpie (Gibbs)
| Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Enthalpie für magnetische Systeme | $$H(S,\vec{B})=E-\vec{B}\cdot\overrightarrow{\mathcal{M}}$$ | $H$ (magnetische) Enthalpie |
| Freie Enthalpie (Gibbs) | $$G(T,\vec{B})=H-TS$$ | $G$ Gibbs-Potenzial |
| Differential von $G$ | $$dG(T,\vec{B})=-S\,dT-\overrightarrow{\mathcal{M}}\,d\vec{B}$$ | natürliche Variablen: $T,\vec{B}$ |
| Ableitungen von $G$ | $$S=-\left.\frac{\partial G}{\partial T}\right|_{\vec{B}},\quad \mathcal{M}_k=-\left.\frac{\partial G}{\partial B_k}\right|_{T}$$ | Definitionen von $S$ und $\mathcal{M}_k$ |

---

### Idealer Paramagnet (nicht wechselwirkende Spins im Feld)
| Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Hamiltonfunktion (klassisch/QM-analog, ohne Kopplungen) | $$H=-\sum_{i=1}^{N}\vec{\mu}_i\cdot\vec{B}$$ | $N$ Anzahl Momente/Teilchen |
| Spin-$\tfrac12$-Modell-Hamiltonian | $$H=\mu B\sum_{i=1}^{N}\sigma_z^{i}$$ | $\mu$ (hier $\mu\equiv\mu_B$), $\sigma_z^i$ Pauli-$z$ von Spin $i$ |
| Energieeigenwerte (Spin up/down) | $$\varepsilon_{\uparrow}=+\mu B,\qquad \varepsilon_{\downarrow}=-\mu B$$ | $\varepsilon$ Einteilchen-Energieniveaus |
| Zustandssumme (Summe/Produktform) | $$Z_{\mathrm{K}}=\sum_{m_i=\pm}e^{-\beta \mu B\sum_i m_i}=\prod_i\left(e^{\frac{\mu B}{k_B T}}+e^{-\frac{\mu B}{k_B T}}\right)=\left[2\cosh\left(\frac{\mu B}{k_B T}\right)\right]^N$$ | $m_i=\pm$ Spinvariable, $T$ Temperatur |
| Freie Energie des idealen Paramagneten | $$F(T,B)=-k_B T\ln Z_{\mathrm{K}}=-Nk_B T\ln\left[2\cosh\left(\frac{\mu B}{k_B T}\right)\right]$$ | $B$ Feldstärke (Skalar, Feld entlang Achse) |
| Magnetisches Moment (Definition) | $$\mathcal{M}=\left\langle\sum_i \mu_z^{i}\right\rangle=-\left.\frac{\partial F}{\partial B}\right|_{T}$$ | $\mu_z^i$ $z$-Komponente des Moments |
| Zustandsgleichung (Magnetisierung) | $$\mathcal{M}=N\mu\,\tanh\left(\frac{\mu B}{k_B T}\right)$$ | $\tanh$ Hyperbelfunktion |
| Näherung für schwache Felder/hohe Temperaturen | $$\tanh(x)\simeq x$$ | $x$ kleines Argument |
| Linearisierte Magnetisierung | $$\mathcal{M}\simeq N\mu^{2}\frac{B}{k_B T}$$ | Curie-Verhalten im linearen Regime |
| Suszeptibilität (Curie-Gesetz, linearisiert) | $$\chi=\left.\frac{1}{V}\frac{\partial \mathcal{M}}{\partial B}\right|_{T}\simeq \frac{N}{V}\frac{\mu^{2}}{k_B T}\sim \frac{1}{T}$$ | $\chi\propto 1/T$ |
| Exakte Suszeptibilität (aus $\mathcal{M}$) | $$\chi=\left.\frac{1}{V}\frac{\partial \mathcal{M}}{\partial B}\right|_{T}=\frac{N}{V}\frac{\mu^{2}}{k_B T}\left[\cosh\left(\frac{\mu B}{k_B T}\right)\right]^{-2}$$ | $\cosh$ Hyperbelfunktion |
| Fluktuations-Dissipations-Bezug | $$\chi=\frac{1}{V k_B T}\,\operatorname{Var}(\mathcal{M})$$ | $\operatorname{Var}(\mathcal{M})$ Varianz der Magnetisierung |

---

### Ising-Modell (aus Klausurmaterial)
| Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Ising-Hamiltonfunktion (Feldterm + NN-Kopplung) | $$H=h\sum_i \sigma_i+J\sum_i\sum_{k,\ \text{nearestneighbor}}\sigma_i\sigma_k$$ | $\sigma_i$ Spinvariable (z-Komponente), $h$ äußerer Feld-/Bias-Term, $J$ Kopplungskonstante, $k$ nächste Nachbarn |
