# Strukturfaktor – detaillierte Studiennotizen (Kristallstreuung, Basis, Auslöschungen, Debye-Waller)

## 1) Motivation und physikalische Bedeutung des Strukturfaktors

### Warum ist der Strukturfaktor zentral?
In Beugungsexperimenten (Röntgen-, Neutronen-, Elektronenbeugung) misst man **Reflexpositionen** (Winkel/Richtungen) und vor allem **Reflexintensitäten**.  
Die **Reflexpositionen** werden durch die **Periodizität** des Kristalls festgelegt (reziprokes Gitter, Laue-/Bragg-Bedingung). Die **Reflexintensitäten** tragen dagegen die **chemische und strukturelle Information**: welche Atome wo sitzen, wie stark sie streuen, und wie stark sie thermisch schwingen. Genau diese Verknüpfung leistet der **Strukturfaktor**.

**Merksatz (klausurrelevant):**  
- **Geometrie/„Wo sind Reflexe?“** $\Rightarrow$ Bravaisgitter $\Rightarrow$ reziprokes Gitter, Laue-/Bragg-Bedingung.  
- **„Wie stark sind die Reflexe?“** $\Rightarrow$ Basis $\Rightarrow$ Strukturfaktor $F_{hkl}$ und Intensität $I_{hkl}\propto |F_{hkl}|^2$.

---

### Prinzip: kohärente elastische Streuung und Interferenz vieler Streuzentren
Wir betrachten (idealisierend) **kohärente elastische Streuung**:
- **elastisch:** $|\boldsymbol{k}|=|\boldsymbol{k}_0|=2\pi/\lambda$ (keine Energieänderung)
- **kohärent:** Phasenbeziehungen bleiben erhalten → **Interferenz** der von vielen Atomen gestreuten Wellen

Die einfallende ebene Welle sei
$$
\psi_0(\boldsymbol{r}) \propto e^{i\boldsymbol{k}_0\cdot \boldsymbol{r}}.
$$
Ein Streuzentrum am Ort $\boldsymbol{r}_j$ erzeugt (im Fernfeld) einen Beitrag mit einer **Phasenverschiebung** $\propto e^{i(\boldsymbol{k}-\boldsymbol{k}_0)\cdot \boldsymbol{r}_j}$. Die **Streuamplitude** (komplex!) ist damit eine Summe über alle Streuzentren:
$$
A(\Delta\boldsymbol{k}) \propto \sum_{j} f_j(\Delta\boldsymbol{k})\,e^{i\Delta\boldsymbol{k}\cdot \boldsymbol{r}_j},
\quad \Delta\boldsymbol{k}=\boldsymbol{k}-\boldsymbol{k}_0.
$$

**Warum Intensität $\boldsymbol{\propto |F|^2}$?**  
Detektoren messen Intensität $\propto$ (zeitlich gemitteltes) Betragsquadrat des Feldes:
$$
I(\Delta\boldsymbol{k}) \propto |A(\Delta\boldsymbol{k})|^2.
$$
Damit entstehen Kreuzterme $e^{i\Delta\boldsymbol{k}\cdot(\boldsymbol{r}_j-\boldsymbol{r}_{j'})}$, die **konstruktive/destruktive Interferenz** beschreiben. Genau hier steckt die gesamte Strukturinformation.

---

### Trennung: Bravaisgitter vs. Basis (klausurrelevant)
Ein Kristall lässt sich als **Bravaisgitter + Basis** schreiben. Die Atompositionen sind
$$
\boldsymbol{r}_{n\alpha}=\boldsymbol{R}_n+\boldsymbol{r}_\alpha,
$$
mit
- $\boldsymbol{R}_n$: Gittervektoren des Bravaisgitters (Periodizität)
- $\boldsymbol{r}_\alpha$: Positionen der Atome in der Basis innerhalb der Einheitszelle (chemische Information), $\alpha=1,\dots,N_\text{Basis}$

Diese Aufspaltung ist in den folgenden Skizzen visualisiert (Ortsvektorzerlegung, Basisatome als Kugeln mit Radius $R_\alpha$):

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/37d8a2ea-26e9-4b8e-b544-da4cc4e21078/a01e5df1-1111-4d9c-84f4-4a0eed37ea19-14_1210_1895_452_197.jpg)

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/e1fcdaa7-8677-4481-b666-37d988cc42f4/0924f87f-cd38-49a9-8018-bc8a5406ce2d-1_1215_1895_447_197.jpg)

Setzt man $\boldsymbol{r}_{n\alpha}$ in die Amplitudensumme ein, faktorisiert sie:
$$
A(\Delta\boldsymbol{k}) \propto 
\underbrace{\sum_n e^{i\Delta\boldsymbol{k}\cdot \boldsymbol{R}_n}}_{\text{Gitterfaktor (Periodizität)}}
\;\cdot\;
\underbrace{\sum_\alpha f_\alpha(\Delta\boldsymbol{k})\,e^{i\Delta\boldsymbol{k}\cdot \boldsymbol{r}_\alpha}}_{\text{Strukturfaktor der Basis }F(\Delta\boldsymbol{k})}.
$$

**Beugungsbedingung (Laue):** Nur wenn $\Delta\boldsymbol{k}$ einem reziproken Gittervektor $\boldsymbol{G}_{hkl}$ entspricht, addiert sich der Gitterfaktor konstruktiv:
$$
\Delta\boldsymbol{k}=\boldsymbol{G}_{hkl}.
$$

**Definition (klausurrelevant):**
$$
F_{hkl} \equiv F(\boldsymbol{G}_{hkl})
= \sum_{\alpha=1}^{N_\text{Basis}} f_\alpha(\boldsymbol{G}_{hkl})\,e^{i\boldsymbol{G}_{hkl}\cdot \boldsymbol{r}_\alpha}.
$$

**Intensität eines Reflexes (ideales Einkristallbild):**
$$
I_{hkl}\propto |F_{hkl}|^2.
$$

> Wichtig: Das Bravaisgitter sagt *welche* $(hkl)$ prinzipiell auftreten können (Positionen im reziproken Raum), die Basis entscheidet über **systematische Auslöschungen** und relative Intensitäten.

---

### Physikalische Bedeutung von $F_{hkl}$ als „Fourierkomponente“ der Dichte
Allgemein ist die Streuung eng mit einer Fouriertransformierten der streuenden Dichte verknüpft:
- Röntgen: Elektronendichte $\rho_e(\boldsymbol{r})$
- Elektronen: (effektive) Ladungsverteilung/elektrostatisches Potential
- Neutronen: Kerne (Streulängen) und ggf. magnetische Dichte

Für Röntgenbeugung kann man (innerhalb einer Einheitszelle) schreiben:
$$
F(\boldsymbol{G})=\int_{\text{EZ}} \rho_e(\boldsymbol{r})\,e^{i\boldsymbol{G}\cdot \boldsymbol{r}}\,d^3r,
$$
d. h. $F_{hkl}$ ist die **Fourierkomponente** der Dichte bei $\boldsymbol{G}_{hkl}$.

---

### Atomformfaktor $f$ (und warum er wichtig ist)
Der Strukturfaktor enthält die Beiträge einzelner Atome über den **Atomformfaktor** $f_\alpha(\Delta\boldsymbol{k})$ (auch Atom-Strukturfaktor). Dieser beschreibt, dass ein Atom **kein Punktstreuer** ist, sondern eine ausgedehnte Dichte besitzt.

Für Röntgenstreuung gilt sinngemäß:
$$
f(\Delta\boldsymbol{k})=\int \rho(\boldsymbol{r}')\,e^{i\Delta\boldsymbol{k}\cdot \boldsymbol{r}'}\,d^3r'.
$$

Typisches Verhalten: $f$ **nimmt mit wachsendem Streuvektor** (größerem Winkel) ab, weil „feinere“ Strukturen in der Dichte weniger kohärent beitragen. Das ist in den Kurven zu $f(K)$ sichtbar:

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/e1fcdaa7-8677-4481-b666-37d988cc42f4/0924f87f-cd38-49a9-8018-bc8a5406ce2d-5_1215_2645_273_304.jpg)

Außerdem unterscheiden sich Röntgen- und Neutronenstreufaktoren qualitativ (Röntgen stark $K$-abhängig; Neutronen-Streulängen oft näherungsweise konstant, teils sogar negativ):

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/e1fcdaa7-8677-4481-b666-37d988cc42f4/0924f87f-cd38-49a9-8018-bc8a5406ce2d-6_1097_1468_461_760.jpg)

**Konsequenzen (prüfungsrelevant als Argumentation):**
- **Röntgen:** schwere Elemente dominieren oft Intensitäten (mehr Elektronen $\Rightarrow$ größeres $f$).
- **Neutronen:** leichte Elemente (z. B. H) können sehr gut sichtbar sein; Isotope unterscheiden sich stark.
- **Elektronen:** starke Wechselwirkung → sehr hohe Streuquerschnitte, Mehrfachstreuung kann wichtig werden (Grenze zur kinematischen Näherung).

---

### Beispiele: Wie die Basis zu Auslöschungen und Intensitätsregeln führt

#### Beispiel A: Einatomige Basis (monatomar)
Eine Basis mit nur einem Atom bei $\boldsymbol{r}_1=\boldsymbol{0}$:
$$
F_{hkl}=f_1(\boldsymbol{G}_{hkl}).
$$
→ Keine zusätzlichen Auslöschungen durch die Basis (nur durch Gitterzentrierung etc., falls vorhanden).

#### Beispiel B: Zweiatomige Basis bei $\boldsymbol{0}$ und $\boldsymbol{d}$
$$
F_{hkl}=f_1+f_2 e^{i\boldsymbol{G}_{hkl}\cdot \boldsymbol{d}}.
$$
- Falls $f_1=f_2$ und $\boldsymbol{G}\cdot \boldsymbol{d}=\pi$ (mod $2\pi$), dann
  $$
  F_{hkl}=f(1-1)=0
  $$
  → **systematische Auslöschung** (Reflex verschwindet trotz erfüllter Laue-Bedingung).
- Falls $f_1\neq f_2$, ist die Auslöschung **unvollständig**: $|F|$ klein, aber nicht null.

**Edge Case (wichtig):** „Erlaubter“ Reflex im reziproken Gitter kann dennoch **intensitätslos** sein, weil $F_{hkl}=0$.

---

### Was man experimentell wirklich sieht: Intensitäten im Diffraktogramm
Im Drehkristall-/Diffraktometerexperiment erscheinen Peaks nur an den erlaubten Winkeln; deren Höhen hängen von $|F_{hkl}|^2$ ab (zusätzlich zu instrumentellen/geometrischen Faktoren). Beispiel für ein $\theta$–$2\theta$-Spektrum (nur $(00\ell)$-Reflexe aufgrund der Orientierung):

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/37d8a2ea-26e9-4b8e-b544-da4cc4e21078/a01e5df1-1111-4d9c-84f4-4a0eed37ea19-12_1230_1860_78_784.jpg)

---

### Grenzen, Sonderfälle und „Realitätschecks“
#### Kinematische Näherung vs. dynamische Beugung
Die einfache Beziehung $I_{hkl}\propto |F_{hkl}|^2$ gilt sauber in der **kinematischen Näherung** (einmalige Streuung, dünne Proben, schwache Wechselwirkung).  
**Elektronenbeugung** und sehr perfekte/ dicke Einkristalle können **Mehrfachstreuung** zeigen → Intensitäten weichen ab (dynamische Theorie nötig).

#### Thermische Bewegung (Debye–Waller-Faktor)
Thermische Schwingungen reduzieren die kohärente elastische Intensität (typisch stärker bei großen $|\boldsymbol{G}|$). Häufig modelliert durch einen Faktor
$$
F_{hkl}\rightarrow F_{hkl}\,e^{-W(\boldsymbol{G}_{hkl})},
$$
wodurch $I_{hkl}$ zusätzlich abnimmt.

#### Oberflächen/2D-Periodizität (Stangen im reziproken Raum)
Bei 2D-periodischen Strukturen (Oberflächen) entstehen **reziproke Stäbe** statt Punkte; die Ewald-Konstruktion schneidet diese Stäbe und liefert Reflexe entlang kontinuierlicher Linien—die Intensitätsmodulation wird weiterhin von einem (verallgemeinerten) Strukturfaktor bestimmt:

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/44589bf5-96cf-4bc0-b71a-06314f28658f/f411d17f-4c40-4616-a50a-0dd59c152daf-1_952_2317_390_421.jpg)

---

### Zusammenfassung (Formeln mit Klausurrelevanz)
| Konzept | Kernaussage | Formel |
|---|---|---|
| Streuvektor | Impulsübertrag der elastischen Streuung | $\Delta\boldsymbol{k}=\boldsymbol{k}-\boldsymbol{k}_0$ |
| Laue-Bedingung | konstruktive Interferenz durch Periodizität | $\Delta\boldsymbol{k}=\boldsymbol{G}_{hkl}$ |
| Strukturfaktor | Basis-Interferenz & atomare Streuung | $F_{hkl}=\sum_\alpha f_\alpha(\boldsymbol{G}_{hkl})e^{i\boldsymbol{G}_{hkl}\cdot \boldsymbol{r}_\alpha}$ |
| Intensität | Messgröße am Detektor | $I_{hkl}\propto |F_{hkl}|^2$ |
| Atomformfaktor | ausgedehnte Dichte des Atoms | $f(\Delta\boldsymbol{k})=\int \rho(\boldsymbol{r}')e^{i\Delta\boldsymbol{k}\cdot \boldsymbol{r}'}\,d^3r'$ |

**Prüfungs-Takeaway:** Der Strukturfaktor ist die „Brücke“ vom **Mikroskopischen** (Atomarten/Positionen/Schwingungen) zum **Makroskopisch Messbaren** (Peakintensitäten) in Beugungsexperimenten.

## 2) Streugeometrie: reziprokes Gitter und Laue-Bedingung

### 2.1 Reziprokes Gitter als „Selektor“ erlaubter Wellenvektoren

**Definition (klausurrelevant):** Zu einem direkten Gitter mit primitiven Translationsvektoren $\mathbf{a}_1,\mathbf{a}_2,\mathbf{a}_3$ gehört das **reziproke Gitter** mit Basis $\mathbf{b}_1,\mathbf{b}_2,\mathbf{b}_3$ definiert durch
$$
\mathbf{a}_i\cdot \mathbf{b}_j = 2\pi\,\delta_{ij}.
$$
Jeder reziproke Gittervektor ist eine ganzzahlige Linearkombination
$$
\mathbf{G} = h\mathbf{b}_1 + k\mathbf{b}_2 + l\mathbf{b}_3,\qquad h,k,l\in\mathbb{Z}.
$$
Die Tripel $(hkl)$ sind die **Miller-Indizes**; häufig schreibt man auch $\mathbf{G}_{hkl}$.

**Explizite Formeln (3D, sehr klausurrelevant):** Mit dem Zellvolumen $V=\mathbf{a}_1\cdot(\mathbf{a}_2\times\mathbf{a}_3)$ gilt
$$
\mathbf{b}_1 = 2\pi\,\frac{\mathbf{a}_2\times\mathbf{a}_3}{V},\quad
\mathbf{b}_2 = 2\pi\,\frac{\mathbf{a}_3\times\mathbf{a}_1}{V},\quad
\mathbf{b}_3 = 2\pi\,\frac{\mathbf{a}_1\times\mathbf{a}_2}{V}.
$$

**Intuition:** Ebenenwellen $e^{i\mathbf{k}\cdot\mathbf{r}}$ haben auf allen Gitterplätzen $\mathbf{R}$ dieselbe Phase, wenn $\mathbf{k}\cdot\mathbf{R}=2\pi n$. Genau diese „phasenkohärenten“ $\mathbf{k}$ liegen auf dem reziproken Gitter.

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/66bb6fb1-f8a5-4600-a5b7-fa012b02d11a/cede9339-abdf-43d6-bfe6-32e4f6ce7f86-01_1046_1541_560_334.jpg)

**Minimaler reziproker Gittervektor (1D-Anschaulichkeit):** Für 1D mit Gitterkonstante $d$ ist
$$
G_{\min}=\frac{2\pi}{d}.
$$
Wellenlängen $\lambda\ge d$ können auf allen Gitterpunkten gleiche Werte annehmen, für zu große $\lambda$ (zu kleiner $k$) geht das nicht mehr → der reziproke Raum ist „quantisiert“ in Schritten $2\pi/d$.

---

### 2.2 Streuvektoren und Laue-Bedingung in Vektorform

Wir betrachten elastische Streuung (Röntgen, Neutronen, Elektronen) an einem ideal periodischen Kristall.

- einfallender Wellenvektor: $\mathbf{k}_0$
- gestreuter Wellenvektor: $\mathbf{k}$
- **Streuvektor (Impulsübertrag):**
  $$
  \Delta\mathbf{k}=\mathbf{k}-\mathbf{k}_0 \equiv \mathbf{q}.
  $$
- **elastisch:** $|\mathbf{k}|=|\mathbf{k}_0|=\frac{2\pi}{\lambda}$

**Laue-Bedingung (klausurrelevant, Vektorform):**
$$
\Delta\mathbf{k}=\mathbf{G}.
$$
Interpretation: **Konstruktive Interferenz** entsteht nur, wenn der Impulsübertrag genau einem reziproken Gittervektor entspricht. Damit „wählt“ das reziproke Gitter die erlaubten Streuvektoren aus.

#### Kurze Herleitung über die Phasenbedingung (klausurrelevante Argumentationskette)
Für Streuung an allen Gitterplätzen $\mathbf{R}$ ist die relative Phase zwischen Beiträgen $\propto e^{i(\mathbf{k}-\mathbf{k}_0)\cdot\mathbf{R}}=e^{i\mathbf{q}\cdot\mathbf{R}}$. Summation über alle $\mathbf{R}$ liefert nur dann einen makroskopischen Peak, wenn
$$
e^{i\mathbf{q}\cdot\mathbf{R}}=1\quad \forall\,\mathbf{R}
\;\;\Longleftrightarrow\;\;
\mathbf{q}\cdot\mathbf{R}=2\pi n.
$$
Das ist genau die Definition von $\mathbf{q}$ als reziproker Gittervektor $\mathbf{G}$.

---

### 2.3 Konsequenzen aus Elastizität: Bragg-Geometrie aus Laue

Aus $|\mathbf{k}|=|\mathbf{k}_0|$ und $\mathbf{k}=\mathbf{k}_0+\mathbf{G}$ folgt
$$
|\mathbf{k}_0+\mathbf{G}|^2 = |\mathbf{k}_0|^2
\;\Longrightarrow\;
\mathbf{G}^2 + 2\mathbf{k}_0\cdot\mathbf{G}=0.
$$
Damit
$$
\mathbf{k}_0\cdot\hat{\mathbf{G}} = -\frac{|\mathbf{G}|}{2}
\quad\text{mit}\quad \hat{\mathbf{G}}=\frac{\mathbf{G}}{|\mathbf{G}|}.
$$
Das ist die geometrische Bragg-Bedingung im reziproken Raum: $\mathbf{k}_0$ muss so orientiert sein, dass $\mathbf{G}$ die passende Projektion hat. (Da mit $\mathbf{G}$ auch $-\mathbf{G}$ im reziproken Gitter liegt, ist das Vorzeichen physikalisch nur eine Frage der Orientierung.)

**Bezug zur Ebenenabstandsformel (Merksatz):** Für die Netzebenen $(hkl)$ gilt typischerweise
$$
|\mathbf{G}_{hkl}|=\frac{2\pi}{d_{hkl}}.
$$
Kombiniert mit der Bragg-Bedingung ergibt sich die bekannte Form
$$
2d_{hkl}\sin\theta = n\lambda,
$$
wobei $n$ effektiv in der Wahl $(hkl)$ bzw. in Vielfachen von $\mathbf{G}$ steckt (höhere Ordnung ↔ größerer $|\mathbf{G}|$).

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/66bb6fb1-f8a5-4600-a5b7-fa012b02d11a/cede9339-abdf-43d6-bfe6-32e4f6ce7f86-11_817_1131_587_341.jpg)

---

### 2.4 Geometrische Bedeutung von $\mathbf{G}$: Bragg-Ebenen und „halbierende Ebene“

Die Bedingung $\mathbf{G}^2 + 2\mathbf{k}_0\cdot\mathbf{G}=0$ bedeutet geometrisch:

- Die Endpunkte von $\mathbf{k}_0$ und $\mathbf{k}$ liegen auf einer Kugel gleichen Radius.
- $\mathbf{G}$ ist die Verbindung zwischen diesen Endpunkten.
- Konstruktive Interferenz tritt auf, wenn die Spitze von $\mathbf{k}_0$ auf einer **Bragg-Ebene** liegt, die einen reziproken Gittervektor „halbiert“ (senkrecht zu $\mathbf{G}$).

Diese Bragg-Ebenen sind genau die Grenzflächen, die später die **Brillouin-Zonen** definieren (Wigner-Seitz-Zelle im reziproken Raum).

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/66bb6fb1-f8a5-4600-a5b7-fa012b02d11a/cede9339-abdf-43d6-bfe6-32e4f6ce7f86-14_1080_1295_437_341.jpg)

---

### 2.5 Ewald-Konstruktion (Ewald-Kugel) als graphische Laue-Bedingung

**Ziel:** Sichtbar machen, wann es für gegebenes $\lambda$ und Kristallorientierung überhaupt Reflexe gibt.

**Konstruktion (klausurrelevant):**
1. Trage $\mathbf{k}_0$ vom Ursprung in den reziproken Raum ein.
2. Zeichne eine Kugel (in 2D: Kreis) mit Radius $|\mathbf{k}_0|=2\pi/\lambda$ um die Spitze von $\mathbf{k}_0$.
3. **Laue erfüllt**, wenn ein reziproker Gitterpunkt auf der Kugeloberfläche liegt: Dann existiert ein $\mathbf{k}$ mit
   $$
   \mathbf{k}-\mathbf{k}_0=\mathbf{G},\qquad |\mathbf{k}|=|\mathbf{k}_0|.
   $$

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/37d8a2ea-26e9-4b8e-b544-da4cc4e21078/a01e5df1-1111-4d9c-84f4-4a0eed37ea19-08_1060_1063_221_1980.jpg)

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/37d8a2ea-26e9-4b8e-b544-da4cc4e21078/a01e5df1-1111-4d9c-84f4-4a0eed37ea19-09_902_1029_495_2069.jpg)

**Wichtige Konsequenz / Edge Case:** Für „beliebige“ Orientierung bei festem $\lambda$ liegt **oft kein** Gitterpunkt auf der Ewald-Kugel → **keine Bragg-Peaks**. Experimentell bekommt man Reflexe typischerweise durch:
- Drehen des Kristalls (ändert Orientierung der reziproken Punkte relativ zur Kugel),
- Variation von $\lambda$ (ändert Kugelradius),
- Pulverprobe (alle Orientierungen gleichzeitig).

---

### 2.6 Äquivalente Wellenvektoren und Umklapp (Zurückfalten in die 1. Brillouin-Zone)

In periodischen Systemen sind Wellenvektoren **modulo reziproker Gittervektoren** äquivalent:

$$
\mathbf{k} \sim \mathbf{k}+\mathbf{G}.
$$

**Warum? (klausurtypischer Begründungssatz):** Für jeden Gitterplatz $\mathbf{R}$ gilt
$$
e^{i(\mathbf{k}+\mathbf{G})\cdot\mathbf{R}}=e^{i\mathbf{k}\cdot\mathbf{R}}\,e^{i\mathbf{G}\cdot\mathbf{R}}
=e^{i\mathbf{k}\cdot\mathbf{R}}\cdot 1,
$$
da $\mathbf{G}\cdot\mathbf{R}=2\pi n$.

**Umklapp/Zurückfalten:** Wenn ein berechneter oder gemessener Wellenvektor $\mathbf{k}$ außerhalb der 1. Brillouin-Zone liegt, kann man ihn durch Subtraktion eines passenden $\mathbf{G}$ in die 1. Zone „zurückfalten“:
$$
\mathbf{k}_{\text{BZ1}}=\mathbf{k}-\mathbf{G}.
$$
Physikalisch bedeutet das: Der Kristall kann Impuls in Einheiten $\hbar\mathbf{G}$ aufnehmen/abgeben; erhalten bleibt der **Quasiimpuls** modulo $\mathbf{G}$.

**Beispiel (1D):** 1. BZ ist $-\pi/a \le k < \pi/a$.
- Gemessen: $k=1.3\,\pi/a$ (außerhalb)
- Wähle $G=2\pi/a$:
  $$
  k' = k - G = 1.3\,\frac{\pi}{a} - 2\,\frac{\pi}{a} = -0.7\,\frac{\pi}{a}\in \text{BZ1}.
  $$

**Edge Case:** Liegt $k$ genau auf der Zonen-Grenze ($k=\pm\pi/a$), ist das Zurückfalten nicht eindeutig (zwei äquivalente Repräsentanten) → typisch relevant für Bandlücken an Zonenrändern.

---

### 2.7 Warum Strukturfaktoren immer als Funktion von $\mathbf{G}$ bzw. $(hkl)$ auftreten

Die **Streuamplitude** eines Kristalls faktorisiert konzeptionell in:
- Summe über **Elementarzellen** (liefert die Laue-Auswahlregel $\mathbf{q}=\mathbf{G}$),
- Summe über **Basisatome innerhalb der Zelle** (liefert den **Strukturfaktor**).

Formal (typischer Klausuransatz):
- Streudichte in einer Zelle: $\rho(\mathbf{r})$
- Fourier-Koeffizienten:
  $$
  \rho_{\mathbf{G}}=\frac{1}{V_{\text{Zelle}}}\int_{\text{Zelle}} \rho(\mathbf{r})\,e^{-i\mathbf{G}\cdot\mathbf{r}}\,d^3r.
  $$
Diese Fourier-Koeffizienten existieren **nur** auf dem reziproken Gitter, weil die Kristallperiodizität nur diese Wellenzahlen zulässt.

Für eine Basis aus Atomen bei Positionen $\mathbf{r}_j$ (in der Zelle) mit atomarem Formfaktor $f_j$:
$$
F(\mathbf{G})=\sum_{j} f_j\,e^{i\mathbf{G}\cdot\mathbf{r}_j}.
$$
Dann ist die Intensität eines Bragg-Reflexes typischerweise
$$
I(\mathbf{G})\propto |F(\mathbf{G})|^2
\quad\text{(zusätzlich: Lorentz-, Polarisations-, Debye-Waller-Faktoren je nach Kontext).}
$$

**Kernaussage:** Da die Beugungsbedingung $\mathbf{q}=\Delta\mathbf{k}$ bereits $\mathbf{q}$ auf diskrete Werte $\mathbf{G}_{hkl}$ „einschnappt“, erscheinen **Strukturfaktoren stets als $F(\mathbf{G})$ bzw. $F(hkl)$**.

**Typische Edge Cases / Auswahlregeln:**
- **Systematische Auslöschungen:** $F(\mathbf{G})=0$ für bestimmte $(hkl)$ (z. B. durch Zentrierungen oder Basis-Symmetrien) → Reflex existiert geometrisch (Laue), aber hat **keine Intensität**.
- **Endlicher Kristall:** Peaks sind nicht unendlich scharf; Laue wird zu einer Peakform mit endlicher Breite (Scherrer-Breite), aber Maximum weiterhin bei $\mathbf{q}=\mathbf{G}$.

---

### 2.8 Beispiele zur Einordnung von direktem und reziprokem Gitter

**2D-Beispiel (Konstruktion):** Reales Gitter (schwarz) und reziprokes (blau); $\mathbf{b}_1\perp \mathbf{a}_2$, $\mathbf{b}_2\perp \mathbf{a}_1$ bei schiefwinkligen Gittern (nicht allgemein orthogonal, aber diese Senkrechtbeziehung gilt für die jeweils anderen Basisvektoren in 2D-Darstellungen).

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/66bb6fb1-f8a5-4600-a5b7-fa012b02d11a/cede9339-abdf-43d6-bfe6-32e4f6ce7f86-03_1199_1169_478_515.jpg)

**3D-Beispiel (kubisch primitiv):** Für ein einfach kubisches Gitter mit Gitterkonstante $a$ ist das reziproke Gitter ebenfalls einfach kubisch mit
$$
|\mathbf{b}_i|=\frac{2\pi}{a}.
$$

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/66bb6fb1-f8a5-4600-a5b7-fa012b02d11a/cede9339-abdf-43d6-bfe6-32e4f6ce7f86-04_1121_1367_420_280.jpg)

---

### 2.9 Sonderfall: 2D-Periodizität (Oberflächen) und reziproke „Stäbe“

Bei einer **periodischen Oberfläche** ist die Periodizität nur in zwei Richtungen gegeben. Im reziproken Raum entstehen statt diskreter Punkte häufig **Stäbe (rods)** entlang der nicht-periodischen Richtung. Die Ewald-Konstruktion schneidet diese Stäbe → Beugungsbedingungen sind „leichter“ erfüllbar als im 3D-Fall (wichtige qualitative Abgrenzung).

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/44589bf5-96cf-4bc0-b71a-06314f28658f/f411d17f-4c40-4616-a50a-0dd59c152daf-1_952_2317_390_421.jpg)

---

### 2.10 Klausur-Merkkasten: die wichtigsten Gleichungen

| Konzept | Formel | Bedeutung |
|---|---|---|
| Reziproke Basis | $\mathbf{a}_i\cdot\mathbf{b}_j=2\pi\delta_{ij}$ | Definition des reziproken Gitters |
| Reziproker Vektor | $\mathbf{G}=h\mathbf{b}_1+k\mathbf{b}_2+l\mathbf{b}_3$ | erlaubte „Kristall-Wellenzahlen“ |
| Streuvektor | $\mathbf{q}=\Delta\mathbf{k}=\mathbf{k}-\mathbf{k}_0$ | Impulsübertrag |
| **Laue** | $\mathbf{k}-\mathbf{k}_0=\mathbf{G}$ | Beugungsbedingung in Vektorform |
| Elastizität | $|\mathbf{k}|=|\mathbf{k}_0|=2\pi/\lambda$ | Ewald-Kugel-Radius |
| Folgerung | $\mathbf{G}^2+2\mathbf{k}_0\cdot\mathbf{G}=0$ | Bragg-Geometrie im reziproken Raum |
| Ebenenabstand | $|\mathbf{G}_{hkl}|=2\pi/d_{hkl}$ | Verbindung zu Netzebenen |
| Strukturfaktor | $F(\mathbf{G})=\sum_j f_j e^{i\mathbf{G}\cdot\mathbf{r}_j}$ | Intensitäten: $I\propto|F|^2$ |
| Äquivalenz | $\mathbf{k}\sim \mathbf{k}+\mathbf{G}$ | Zurückfalten/Umklapp, 1. BZ |

## 3) Mathematische Definition: Strukturfaktor als Summe über Atome (Basis)

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/37d8a2ea-26e9-4b8e-b544-da4cc4e21078/a01e5df1-1111-4d9c-84f4-4a0eed37ea19-14_1210_1895_452_197.jpg)

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/e1fcdaa7-8677-4481-b666-37d988cc42f4/0924f87f-cd38-49a9-8018-bc8a5406ce2d-1_1215_1895_447_197.jpg)

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/e1fcdaa7-8677-4481-b666-37d988cc42f4/0924f87f-cd38-49a9-8018-bc8a5406ce2d-5_1215_2645_273_304.jpg)

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/f661e86b-c34e-49fd-a300-4177dad3e575/2be9d089-8465-4f30-acff-4bb053ecc13f-04_1127_1367_517_380.jpg)

### 3.1 Ortsvektor-Zerlegung: Gittertranslation + Basisvektor (klausurrelevant)

Ein Kristall kann als **Bravais-Gitter** plus **Basis** beschrieben werden. Jeder Streuzentrum-Ortsvektor $\boldsymbol{r}_j$ lässt sich zerlegen in

$$
\boldsymbol{r}_{n\alpha}=\boldsymbol{R}_n+\boldsymbol{\tau}_\alpha,
$$

- $\boldsymbol{R}_n$: **Gittertranslationsvektor** (läuft über alle primitiven Zellen), z.B. $\boldsymbol{R}_n=n_1\boldsymbol{a}_1+n_2\boldsymbol{a}_2+n_3\boldsymbol{a}_3$ mit $n_i\in\mathbb{Z}$
- $\boldsymbol{\tau}_\alpha$: **Basisvektor** (Atomposition innerhalb der primitiven Einheitszelle), $\alpha=1,\dots,N_\text{Basis}$

Diese Zerlegung ist die Grundlage dafür, die Streuamplitude in einen **Gitterfaktor** und einen **Basis-/Strukturfaktor** zu trennen.

---

### 3.2 Strukturfaktor als Summe über Basisatome $\alpha$

Für elastische Streuung ist der relevante Streuvektor (bei Bragg-Reflexen) ein **reziproker Gittervektor** $\boldsymbol{G}$.

Die (komplexe) Streuamplitude eines Kristalls ist proportional zu einer Summe über alle Atome:

$$
A(\boldsymbol{G}) \propto \sum_{n}\sum_{\alpha} f_\alpha(\boldsymbol{G})\,e^{-i\boldsymbol{G}\cdot(\boldsymbol{R}_n+\boldsymbol{\tau}_\alpha)}.
$$

Hierbei:

- $f_\alpha(\boldsymbol{G})$: **Atomformfaktor / atomarer Streufaktor** des Atoms $\alpha$ (Gewicht des Beitrags)
- $e^{-i\boldsymbol{G}\cdot\boldsymbol{\tau}_\alpha}$: **Phasenfaktor** (kodiert die Atomposition innerhalb der Zelle)
- $e^{-i\boldsymbol{G}\cdot\boldsymbol{R}_n}$: Phasenfaktor der Gittertranslation

**Trennung (Faktorisierung):**

$$
A(\boldsymbol{G}) \propto 
\underbrace{\sum_{n} e^{-i\boldsymbol{G}\cdot\boldsymbol{R}_n}}_{\text{Gitterfaktor }L(\boldsymbol{G})}
\;
\underbrace{\sum_{\alpha} f_\alpha(\boldsymbol{G})\,e^{-i\boldsymbol{G}\cdot\boldsymbol{\tau}_\alpha}}_{\text{Strukturfaktor }F(\boldsymbol{G})}.
$$

Damit ist der **Strukturfaktor der Basis**:

$$
\boxed{
F(\boldsymbol{G})=\sum_{\alpha=1}^{N_\text{Basis}} f_\alpha(\boldsymbol{G})\,e^{-i\boldsymbol{G}\cdot\boldsymbol{\tau}_\alpha}
}
$$

und die Intensität eines Reflexes (vereinfacht) ist

$$
I(\boldsymbol{G})\propto |A(\boldsymbol{G})|^2 \propto |L(\boldsymbol{G})|^2\,|F(\boldsymbol{G})|^2.
$$

**Merksatz (Systematik der Reflexe):**
- **$L(\boldsymbol{G})$** bestimmt, *wo* überhaupt Maxima auftreten (Bragg-Bedingung, endliche Kristallgröße, Peakbreite).
- **$F(\boldsymbol{G})$** bestimmt, *wie stark* ein erlaubter Reflex ist, inkl. **Auslöschungen** (systematische Abwesenheiten) durch destruktive Interferenz der Basis.

---

### 3.3 Atomformfaktor $f_\alpha(\boldsymbol{G})$ (Gewicht) und seine Konsequenzen

Der atomare Streufaktor ist (modellabhängig) die Fourier-Transformierte der Elektronendichte bzw. Streudichte des Atoms:

$$
f(\Delta\boldsymbol{k})=\int_V \rho(\boldsymbol{r}')\,e^{-i\Delta\boldsymbol{k}\cdot \boldsymbol{r}'}\,dV'
\quad\text{mit}\quad \Delta\boldsymbol{k}\equiv \boldsymbol{G}.
$$

Wichtige Konsequenzen (klausurrelevant in Argumentationen):

- **$f_\alpha$ hängt von $|\boldsymbol{G}|$** bzw. vom Streuvektorbetrag $K=\frac{4\pi\sin\theta}{\lambda}$ ab: typischerweise fällt $f$ mit wachsendem $K$ ab.  
  $\Rightarrow$ hohe Winkel / große $|\boldsymbol{G}|$: schwächere Reflexe.
- Unterschiedliche Atomsorten haben unterschiedliche $f_\alpha(\boldsymbol{G})$.  
  $\Rightarrow$ **Gewichtung** der Beiträge in $F(\boldsymbol{G})$ (z.B. schwere Atome dominieren bei Röntgenstreuung oft).

---

### 3.4 Phasenfaktor $e^{-i\boldsymbol{G}\cdot\boldsymbol{\tau}_\alpha}$ (Position) und Auslöschungen

Der Phasenfaktor sorgt dafür, dass Beiträge verschiedener Basisatome je nach $\boldsymbol{G}$ konstruktiv oder destruktiv interferieren.

Schreibe die Basispositionen oft als **fraktionale Koordinaten** in der primitiven Zelle:

$$
\boldsymbol{\tau}_\alpha = x_\alpha \boldsymbol{a}_1 + y_\alpha \boldsymbol{a}_2 + z_\alpha \boldsymbol{a}_3.
$$

Für reziproke Basisvektoren $\boldsymbol{b}_i$ gilt $\boldsymbol{a}_i\cdot \boldsymbol{b}_j = 2\pi\delta_{ij}$ und

$$
\boldsymbol{G}=h\boldsymbol{b}_1+k\boldsymbol{b}_2+l\boldsymbol{b}_3
\quad\Rightarrow\quad
\boldsymbol{G}\cdot\boldsymbol{\tau}_\alpha = 2\pi(hx_\alpha+ky_\alpha+lz_\alpha).
$$

Damit:

$$
\boxed{
F_{hkl}=\sum_{\alpha} f_\alpha(hkl)\,\exp\left(-i2\pi(hx_\alpha+ky_\alpha+lz_\alpha)\right)
}
$$

Das ist eine der **wichtigsten Klausurformeln** zur Reflexsystematik.

---

### 3.5 Beispiele (typische Klausurfälle)

#### Beispiel A: Einatomige Basis
Basis: ein Atom bei $\boldsymbol{\tau}_1=\boldsymbol{0}$.

$$
F(\boldsymbol{G})=f_1(\boldsymbol{G})\,e^{-i\boldsymbol{G}\cdot \boldsymbol{0}}=f_1(\boldsymbol{G}).
$$

- Keine positionsbedingten Auslöschungen durch die Basis.
- Intensitäten folgen im Wesentlichen dem Abfall von $f(\boldsymbol{G})$ (plus Debye-Waller, Polarisation usw., falls betrachtet).

---

#### Beispiel B: Zweiatomige Basis (gleiche Atomsorte) bei $\boldsymbol{\tau}_1=\boldsymbol{0}$ und $\boldsymbol{\tau}_2=\frac{1}{2}(\boldsymbol{a}_1+\boldsymbol{a}_2+\boldsymbol{a}_3)$ (bcc-artige Basis in konventioneller Darstellung)
Angenommen $f_1=f_2=f$:

$$
F_{hkl}=f\left[1+\exp\left(-i2\pi\left(\tfrac{h}{2}+\tfrac{k}{2}+\tfrac{l}{2}\right)\right)\right]
=f\left[1+e^{-i\pi(h+k+l)}\right].
$$

Da $e^{-i\pi(h+k+l)}=(-1)^{h+k+l}$:

$$
F_{hkl}=f\left[1+(-1)^{h+k+l}\right]
=
\begin{cases}
2f,& h+k+l\ \text{gerade}\\
0,& h+k+l\ \text{ungerade}
\end{cases}
$$

**Ergebnis:** systematische Auslöschung für $h+k+l$ ungerade.

---

#### Beispiel C: Zweiatomige Basis (unterschiedliche Atomsorten) bei denselben Positionen
Jetzt $f_1\neq f_2$:

$$
F_{hkl}=f_1+f_2(-1)^{h+k+l}.
$$

- Für $h+k+l$ gerade: $F=f_1+f_2$
- Für $h+k+l$ ungerade: $F=f_1-f_2$ (nicht zwingend 0!)

**Edge Case:**  
Wenn $f_1\approx f_2$ (z.B. ähnliche Ordnungszahlen bei Röntgen), dann sind die „ungeraden“ Reflexe **sehr schwach** (Superstrukturreflexe) statt exakt ausgelöscht. Das ist experimentell wichtig bei **Ordnungs-/Unordnungsphänomenen**.

---

### 3.6 Praktische Bedeutung: „Gewicht“ und „Phase“ bestimmen Reflexe

| Bestandteil in $F(\boldsymbol{G})$ | Mathematisch | Physikalische Bedeutung | Typische Auswirkung im Beugungsbild |
|---|---|---|---|
| **Gewicht** | $f_\alpha(\boldsymbol{G})$ | Streukraft des Atoms (abhängig von $|\boldsymbol{G}|$) | schwere Atome dominieren; Intensität fällt bei großem $|\boldsymbol{G}|$ |
| **Phase** | $e^{-i\boldsymbol{G}\cdot\boldsymbol{\tau}_\alpha}$ | relative Lage der Atome in der Basis | konstruktive/destruktive Interferenz → Auslöschungen, Intensitätsmodulation |

**Klausurtypische Kernaussage:**  
Auch wenn ein Reflex durch das Gitter (Bragg-Bedingung) „erlaubt“ ist, kann er durch den **Strukturfaktor der Basis** **(teilweise oder vollständig)** unterdrückt werden.

---

### 3.7 Häufige Stolperstellen / Randfälle

- **Wahl der Einheitszelle (primitiv vs. konventionell):**  
  $F(\boldsymbol{G})$ muss zur gewählten Basis $\{\boldsymbol{\tau}_\alpha\}$ passen. Andere Zellwahl $\Rightarrow$ andere Basisliste, aber gleiche Physik (gleiches Streubild).
- **Ursprungswahl:**  
  Verschiebt man den Ursprung um $\boldsymbol{r}_0$, dann gilt
  $$
  F'(\boldsymbol{G})=e^{-i\boldsymbol{G}\cdot\boldsymbol{r}_0}\,F(\boldsymbol{G}).
  $$
  Intensitäten bleiben gleich, da $|F'|^2=|F|^2$, aber **Phasen** ändern sich (wichtig bei Strukturbestimmung).
- **Nicht-reziproker Vektor:**  
  Für $\boldsymbol{q}\neq \boldsymbol{G}$ addieren sich die Beiträge der verschiedenen $\boldsymbol{R}_n$ i.A. nicht kohärent zu einem scharfen Maximum; es entsteht kein Bragg-Peak, sondern diffuse Streuung/Untergrund.

## 4) Strukturfaktor $S_{hkl}$: hkl-Notation und Fourierkomponente der Dichte

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/37d8a2ea-26e9-4b8e-b544-da4cc4e21078/a01e5df1-1111-4d9c-84f4-4a0eed37ea19-14_1210_1895_452_197.jpg)

### 4.1 Übergang zur Miller-Index-Formulierung (Klausurstandard)
- In einem Kristall ist die (Elektronen‑)Dichte $\rho(\mathbf{r})$ **periodisch**: $\rho(\mathbf{r}+\mathbf{R})=\rho(\mathbf{r})$ für alle Gittertranslationen $\mathbf{R}$.
- Periodische Funktionen lassen sich als **Fourier-Reihe** über reziproke Gittervektoren $\mathbf{G}$ schreiben:
  $$\rho(\mathbf{r})=\frac{1}{V_\text{Zelle}}\sum_{\mathbf{G}} \rho_{\mathbf{G}}\,e^{i\mathbf{G}\cdot\mathbf{r}}$$
  mit
  $$\rho_{\mathbf{G}}=\int_{V_\text{Zelle}} \rho(\mathbf{r})\,e^{-i\mathbf{G}\cdot\mathbf{r}}\,d^3r$$
- Für Beugung betrachtet man diskrete $\mathbf{G}$, die durch **Miller-Indizes** $h,k,l\in\mathbb{Z}$ beschrieben werden:
  $$\mathbf{G}_{hkl}=h\mathbf{b}_1+k\mathbf{b}_2+l\mathbf{b}_3$$
  wobei $\mathbf{b}_i$ die Basisvektoren des **reziproken Gitters** sind.

**Kernaussage:** Der **Strukturfaktor** $S_{hkl}$ ist (bis auf Konventionen/Skalierung) die **Fourierkomponente** der Streu-/Elektronendichte in der (primitiven) Einheitszelle bei $\mathbf{G}_{hkl}$.

---

### 4.2 Explizite Summenformel mit fraktionellen Koordinaten (SEHR klausurrelevant)
Man schreibt die Position jedes Atoms $\alpha$ in der **primitiven Zelle** mittels **fraktioneller Koordinaten** $(u_\alpha,v_\alpha,w_\alpha)$:
$$\mathbf{r}_\alpha=u_\alpha\mathbf{a}_1+v_\alpha\mathbf{a}_2+w_\alpha\mathbf{a}_3,\qquad u_\alpha,v_\alpha,w_\alpha\in[0,1)$$

Dann lautet der (kristallographische) Strukturfaktor:
$$S_{hkl}=\sum_{\alpha} f_\alpha(\mathbf{G}_{hkl})\;\exp\!\left[-2\pi i\left(h u_\alpha+k v_\alpha+l w_\alpha\right)\right]$$

- $\alpha$ läuft über alle Atome der **Basis** in der primitiven Zelle.
- $f_\alpha$ ist der **Atomformfaktor** (X‑Ray: Elektronendichte des Atoms; Neutronen: Streulänge $b_\alpha$; Elektronenbeugung: effektiver Coulomb‑Faktor).
- Das Argument $-2\pi i(hu_\alpha+kv_\alpha+lw_\alpha)$ ist die **Phase**, die allein aus der Atomposition kommt.

**Merksatz (Phase):**  
- **Position $\Rightarrow$ Phase**  
- **Streuvermögen $\Rightarrow$ Amplitude (Gewicht) $f_\alpha$**

---

### 4.3 Interpretation als Fourier-Analyse der Dichte
#### (a) Von diskreten Atomen zur Fourierkomponente
Für punktförmige Streuzentren (idealisierte Dichte) in der Zelle:
$$\rho(\mathbf{r})\approx \sum_\alpha \rho_\alpha(\mathbf{r}-\mathbf{r}_\alpha)$$
Dann folgt für die Fourierkomponente (Faltung):
$$\rho_{\mathbf{G}}=\sum_\alpha f_\alpha(\mathbf{G})\,e^{-i\mathbf{G}\cdot\mathbf{r}_\alpha}$$
und in Miller-Schreibweise genau die Summenformel aus 4.2.

#### (b) Warum gemessene Intensitäten Information über $\rho(\mathbf{r})$ enthalten
- Experimentell misst man bei einem Reflex $(hkl)$ typischerweise eine Intensität
  $$I_{hkl}\propto |S_{hkl}|^2$$
- Damit hat man Zugriff auf den **Betrag** der Fourierkomponente der Dichte:
  $$|S_{hkl}| \sim |\rho_{\mathbf{G}_{hkl}}|$$
- Um $\rho(\mathbf{r})$ durch inverse Fourier-Summe zu rekonstruieren, bräuchte man jedoch **Amplitude und Phase**:
  $$\rho(\mathbf{r})\propto \sum_{hkl} S_{hkl}\,e^{+2\pi i(hu+kv+lw)}$$
  (hier ist $(u,v,w)$ die fraktionelle Koordinate von $\mathbf{r}$).

#### (c) Phasenproblem (edge case, prüfungsrelevant als Konzept)
- Beugung liefert $|S_{hkl}|^2$, aber **nicht** die Phase $\varphi_{hkl}$ von
  $$S_{hkl}=|S_{hkl}|e^{i\varphi_{hkl}}$$
- Ohne Phasen ist die Rekonstruktion von $\rho(\mathbf{r})$ **nicht eindeutig**: das ist das **Phasenproblem** der Kristallographie.

---

### 4.4 Beispiele (Rechenmuster + typische Auslöschungen)

#### Beispiel 1: Ein Atom in der primitiven Zelle
Ein Atom bei $(u,v,w)=(0,0,0)$:
$$S_{hkl}=f\,e^{-2\pi i\cdot 0}=f\quad \Rightarrow\quad I_{hkl}\propto f^2$$
**Interpretation:** Keine positionsbedingte Phasenverschiebung, alle Reflexe prinzipiell erlaubt (Selektion kommt dann z.B. über das Bravaisgitter/weitere Basisatome).

---

#### Beispiel 2: Zwei identische Atome (Interferenz, systematische Auslöschung)
Zwei gleiche Atome ($f_1=f_2=f$) bei
$$(0,0,0)\quad \text{und}\quad \left(\tfrac{1}{2},\tfrac{1}{2},\tfrac{1}{2}\right)$$
Dann:
$$S_{hkl}=f\left[1+e^{-2\pi i\left(\frac{h+k+l}{2}\right)}\right]
=f\left[1+e^{-\pi i(h+k+l)}\right]
=f\left[1+(-1)^{h+k+l}\right]$$
Damit:
- falls $h+k+l$ **gerade**: $S_{hkl}=2f$ (konstruktive Interferenz)
- falls $h+k+l$ **ungerade**: $S_{hkl}=0$ (**Auslöschung**)

**Typisches Ergebnis:** bcc‑artige Bedingung (weil genau die bcc‑Basisverschiebung).

---

#### Beispiel 3: fcc-„Gitterauswahlregel“ (klassischer Klausurfall)
Für ein **fcc-Bravaisgitter** kann man (je nach Darstellung) vier Gitterpunkte in der konventionellen Zelle als Beiträge mit Phasenfaktoren auffassen. Daraus folgt die bekannte Auswahlregel:
- Reflexe nur, wenn $h,k,l$ **alle gerade oder alle ungerade**.
- Bei gemischter Parität ist $S_{hkl}=0$ (systematische Auslöschungen).

> Hinweis: In Aufgaben wird das oft als Produkt „Bravais‑Teil $\times$ Basis‑Teil“ behandelt (Faltungs-/Produktidee).

---

### 4.5 Nützliche Eigenschaften und Randfälle
#### (a) Komplexe Konjugation und Friedel’s law (idealer Fall)
Wenn $\rho(\mathbf{r})$ **reell** ist (keine Absorption/anomale Dispersion), gilt:
$$S_{-h,-k,-l}=S_{hkl}^\ast \quad\Rightarrow\quad I_{-h,-k,-l}=I_{hkl}$$
Das erklärt die (ideale) Intensitätssymmetrie von Friedel-Paaren.

#### (b) Ursprung/Koordinatenwahl (Phase ändert sich, Intensität nicht)
Verschiebt man den Ursprung um $(\Delta u,\Delta v,\Delta w)$, dann:
$$S_{hkl}\rightarrow S'_{hkl}=S_{hkl}\,e^{-2\pi i(h\Delta u+k\Delta v+l\Delta w)}$$
- **Phase** ändert sich,
- **Intensität** bleibt invariant: $|S'_{hkl}|^2=|S_{hkl}|^2$.

#### (c) Spezialreflex $h=k=l=0$
$$S_{000}=\sum_\alpha f_\alpha(0)$$
- Bei Röntgenstreuung ist $f_\alpha(0)\approx Z_\alpha$ (Zahl der Elektronen) $\Rightarrow S_{000}$ misst die „Gesamtladung“ pro Zelle.
- $I_{000}$ ist experimentell meist nicht als normaler Beugungsreflex zugänglich (entspricht dem ungestreuten Strahl / Vorwärtsstreuung).

#### (d) Wenn Atome unterschiedlich sind (z.B. Zinkblende statt Diamant)
Sind $f_1\neq f_2$, dann heben sich Beiträge ggf. **nicht vollständig** auf:
- Auslöschungen können **verschwinden** oder werden „unvollständig“ (Intensitäten klein, aber nicht Null).
- Sehr klausurtypisch: „Warum hat Diamant zusätzliche Auslöschungen gegenüber fcc?“ bzw. „Was ändert sich bei Zinkblende?“

---

### 4.6 Klausur-Checkliste (was man sicher können sollte)
- **Strukturfaktorformel** mit fraktionellen Koordinaten:
  $$S_{hkl}=\sum_{\alpha} f_\alpha\,e^{-2\pi i(hu_\alpha+kv_\alpha+lw_\alpha)}$$
- Phasenbeiträge aus Positionen korrekt einsetzen (inkl. $\tfrac{1}{2},\tfrac{1}{4}$ etc.).
- **Auslöschungsbedingungen** aus Paritäten/Phasenfaktoren ableiten.
- Zusammenhang **Intensität** $I_{hkl}\propto |S_{hkl}|^2$ und **Phasenproblem** qualitativ erklären.

## 5) Atomformfaktor / Atom-Strukturfaktor $f_\alpha(\boldsymbol{G})$: Ursprung und Abhängigkeiten

### Motivation: Warum braucht man einen Atomformfaktor?
In der Beugung (Röntgen/Neutronen) ist ein Atom **kein Punktstreuer**. Insbesondere beim **Röntgenfall** streuen die **Elektronen** eines Atoms; deren Ladungsdichte ist räumlich ausgedehnt. Daher hängt die Streuamplitude eines Atoms von der **Streuvektorgröße** ab.

Anschaulich: Je größer $|\boldsymbol{G}|$ (höhere Winkel / höhere Auflösung), desto „feiner“ tastet man die Elektronenwolke ab → Beiträge aus verschiedenen Bereichen des Atoms interferieren **destruktiver** → die effektive Streuamplitude nimmt ab.

---

### Definition (klausurrelevant): Atomformfaktor als Fourier-Transformierte der Ladungsdichte (Röntgen)
Für ein Atom der Sorte $\alpha$ mit Elektronen- bzw. Ladungsdichte $\rho_\alpha(\boldsymbol{r}')$ (relativ zum **Atomzentrum**) ist der **Atomformfaktor** (auch Atom-Strukturfaktor) definiert als

$$
f_\alpha(\boldsymbol{\Delta k})
= \int_{V_\alpha} \rho_\alpha(\boldsymbol{r}')\, e^{-i\,\boldsymbol{\Delta k}\cdot \boldsymbol{r}'}\, \mathrm{d}V'
\quad,\qquad \boldsymbol{\Delta k}\equiv \boldsymbol{G}
$$

- In der Kristallbeugung ist $\boldsymbol{\Delta k}$ bei einem Bragg-Reflex gleich einem reziproken Gittervektor $\boldsymbol{G}$.
- Wichtiges Konzept: **$f_\alpha$ hängt nur von den Eigenschaften des Streuzentrums (Atoms/Ions) ab, nicht von der Kristallstruktur.**

In vielen Darstellungen wird statt $|\boldsymbol{G}|$ der Skalar
$$
K=\frac{4\pi\sin\theta}{\lambda}
$$
verwendet (gleiche Physik: Impulsübertrag / Streuvektorgröße).

---

### Geometrische Aufspaltung (Anschaulichkeit, Bezug zur Herleitung)
Die Ortsvektoren werden typischerweise aufgespalten in
- **Zellposition** $\boldsymbol{R}_m$ (welche Elementarzelle),
- **Atomposition in der Zelle** $\boldsymbol{r}_\alpha$ (Atomzentrum),
- **Position innerhalb des Atoms** $\boldsymbol{r}'$ (im „Atomvolumen“ um das Zentrum).

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/37d8a2ea-26e9-4b8e-b544-da4cc4e21078/a01e5df1-1111-4d9c-84f4-4a0eed37ea19-14_1210_1895_452_197.jpg)

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/e1fcdaa7-8677-4481-b666-37d988cc42f4/0924f87f-cd38-49a9-8018-bc8a5406ce2d-1_1215_1895_447_197.jpg)

Diese Aufspaltung ist der Kern, warum der **Strukturfaktor** in einen Teil „Geometrie der Basis“ und einen Teil „Streuvermögen des Atoms“ zerfällt.

---

### Zentrale Abhängigkeit: Warum nimmt $f_\alpha$ mit wachsendem $|\boldsymbol{G}|$ ab?
**Kerngedanke:** $f_\alpha(\boldsymbol{G})$ ist die Fourier-Transformierte einer **ausgedehnten** Dichte. Fourier-Transformierte glatter/ausgedehnter Funktionen fallen typischerweise mit zunehmender Frequenz (hier: $|\boldsymbol{G}|$).

- **Grenzfall $|\boldsymbol{G}|\to 0$ (Forward Scattering):**
  Dann ist $e^{-i\boldsymbol{G}\cdot\boldsymbol{r}'}\approx 1$ und
  $$
  f_\alpha(\boldsymbol{0})=\int \rho_\alpha(\boldsymbol{r}')\,\mathrm{d}V'
  $$
  Im Röntgenfall entspricht das (bis auf Konventionen) der **Gesamtzahl der Elektronen**:
  $$
  f_\alpha(0)\approx Z_\alpha \quad \text{(neutrales Atom)}
  $$
  bzw. für Ionen: $f_\alpha(0)\approx Z_\alpha - q_\alpha$ (mit Ladungszustand $q_\alpha$ in Einheiten $e$).

- **Für großes $|\boldsymbol{G}|$:**
  Die Phase $\boldsymbol{G}\cdot\boldsymbol{r}'$ oszilliert schnell über das Atomvolumen → starke Auslöschung → $f_\alpha$ wird klein.

**Wichtig für Klausuren:**  
Höhere Beugungsordnungen / größere Streuwinkel (größeres $K$ bzw. $|\boldsymbol{G}|$) sind bei Röntgen typischerweise **deutlich schwächer**, weil $f_\alpha$ abfällt.

---

### Anschauliches Modell: Atom als kugelförmiges Gebilde mit Radius $R_\alpha$
In den Folien wird das Atom als **kugelförmiges Streuzentrum** mit Radius $R_\alpha$ modelliert.

- Für eine grobe Abschätzung kann man sagen:
  - Wenn $|\boldsymbol{G}|R_\alpha \ll 1$: Atom wirkt fast wie Punktstreuer → $f_\alpha$ nahe Maximum.
  - Wenn $|\boldsymbol{G}|R_\alpha \gtrsim 1$: deutlicher Abfall/„Formfaktor-Effekt“.

**Merksatz:** Je größer das reale Objekt, desto schneller fällt sein Formfaktor im reziproken Raum.

---

### Beispiele (grafisch): $f_\alpha(K)$ für H und Al
Die typische Form ist: Start bei $f(0)$ (Elektronenzahl) und monotones Abfallen mit $K$.

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/e1fcdaa7-8677-4481-b666-37d988cc42f4/0924f87f-cd38-49a9-8018-bc8a5406ce2d-5_1215_2645_273_304.jpg)

- **Wasserstoff:** sehr kleines $Z=1$, schneller relativer Abfall sichtbar.
- **Aluminium:** $f_{\mathrm{Al}}(0)\approx 13$; experimentelle Punkte bei verschiedenen Reflexen zeigen denselben Trend (größerer $K$ → kleinerer Formfaktor).

---

### Röntgen vs. Neutronen: unterschiedliche „Streulängen“
Für die **Röntgenstreuung**
- streuen Elektronen → **Formfaktor $f_\alpha(\boldsymbol{G})$ ist stark $|\boldsymbol{G}|$-abhängig**.

Für die **Neutronenstreuung**
- streuen Kerne (starke Wechselwirkung) → beschrieben durch eine **(kohärente) Streulänge** $b_\alpha$.
- Idealisiert (für viele Aufgaben): $b_\alpha$ ist **nahezu unabhängig** von $|\boldsymbol{G}|$ (also kein starker Formfaktor-Abfall wie bei Röntgen).
- Konsequenz: Neutronenintensitäten zeigen oft viel weniger „Abfall“ mit Winkel als Röntgenintensitäten (bis auf andere Effekte wie Debye-Waller).

Vergleich (typische Tendenz in den Folien):

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/e1fcdaa7-8677-4481-b666-37d988cc42f4/0924f87f-cd38-49a9-8018-bc8a5406ce2d-6_1097_1468_461_760.jpg)

**Edge Case / wichtiges Detail:**  
Bei Neutronen kann $b_\alpha$ je nach Isotop stark variieren und sogar **negativ** sein → Vorzeichenwechsel beeinflusst Interferenz im Strukturfaktor drastisch (bei Röntgen ist $f_\alpha$ i. d. R. positiv).

---

### Verknüpfung mit dem Strukturfaktor und der Intensität eines Reflexes (klausurrelevant)
Der **Strukturfaktor** eines Reflexes $\boldsymbol{G}$ (Basis mit Atomen $\alpha$ in der Zelle) hat die typische Form

$$
F(\boldsymbol{G})=\sum_{\alpha} f_\alpha(\boldsymbol{G})\, e^{-i\,\boldsymbol{G}\cdot \boldsymbol{r}_\alpha}
$$

- Die Phase $e^{-i\boldsymbol{G}\cdot \boldsymbol{r}_\alpha}$ kodiert **Geometrie/Positionen** der Atome in der Basis.
- **$f_\alpha(\boldsymbol{G})$ setzt das relative Gewicht der Atomsorte $\alpha$**:
  - schwere Atome (großes $Z$) dominieren Röntgenstreuung besonders bei kleinen $|\boldsymbol{G}|$,
  - bei großem $|\boldsymbol{G}|$ werden Beiträge aller Atome durch den Formfaktor gedämpft, aber unterschiedlich stark.

Die gemessene Intensität eines Bragg-Reflexes ist (bis auf experimentelle Faktoren) proportional zu

$$
I(\boldsymbol{G})\propto |F(\boldsymbol{G})|^2
$$

**Konsequenzen / typische Prüfungsfragen:**
- **Warum sind Hochwinkelreflexe schwächer?**  
  Weil $f_\alpha(\boldsymbol{G})$ (Röntgen) mit $|\boldsymbol{G}|$ abnimmt.
- **Warum „sieht“ Röntgen Beugung schwere Atome besser?**  
  Weil $f_\alpha(0)\approx Z_\alpha$.
- **Warum eignen sich Neutronen gut für leichte Elemente (z. B. H) und Isotopenkontrast?**  
  Weil $b_\alpha$ nicht mit $Z$ skaliert und isotopenabhängig ist.

---

### Kurz-Zusammenfassung (Formeln & Merksätze)
- **Definition (Röntgen):**
  $$
  f_\alpha(\boldsymbol{G})=\int \rho_\alpha(\boldsymbol{r}')\,e^{-i\boldsymbol{G}\cdot\boldsymbol{r}'}\,\mathrm{d}V'
  $$
- **Grenzwert:**
  $$
  f_\alpha(0)\approx Z_\alpha \quad (\text{neutral})
  $$
- **Trend:**
  $$
  |\boldsymbol{G}| \uparrow \;\Rightarrow\; f_\alpha(\boldsymbol{G}) \downarrow \quad (\text{endliche Elektronenwolke})
  $$
- **Strukturfaktor:**
  $$
  F(\boldsymbol{G})=\sum_\alpha f_\alpha(\boldsymbol{G})\,e^{-i\boldsymbol{G}\cdot\boldsymbol{r}_\alpha},\qquad I\propto |F|^2
  $$
- **Neutronen:** ersetze $f_\alpha(\boldsymbol{G})$ häufig durch (nahezu konstante) Streulänge $b_\alpha$ (mit möglichem Vorzeichen).

## 6) Auslöschungsregeln und Symmetrie: konstruktive/destruktive Interferenz

### 6.1 Strukturfaktor in Summenform (klausurrelevant)
Die Intensität eines Bragg-Reflexes ist (bis auf geometrische Faktoren) proportional zu
$$
I_{hkl} \propto |F_{hkl}|^2 .
$$

Der **Strukturfaktor** ist die kohärente Summe aller Streubeiträge innerhalb der (konventionellen) Einheitszelle:
$$
F_{hkl}=\sum_{j=1}^{N} f_j\,\exp\!\left(-i\,\mathbf{G}_{hkl}\cdot\mathbf{r}_j\right).
$$

Für kubische Gitter mit Gitterkonstante $a$ und Atomen bei fraktionalen Koordinaten $\mathbf{r}_j=a(x_j,y_j,z_j)$ gilt
$$
\mathbf{G}_{hkl}=\frac{2\pi}{a}(h,k,l)\quad\Rightarrow\quad 
\mathbf{G}\cdot\mathbf{r}_j = 2\pi\,(h x_j+k y_j+l z_j).
$$
Damit:
$$
F_{hkl}=\sum_{j} f_j\,\exp\!\left(-i2\pi(hx_j+ky_j+l z_j)\right).
$$

**Merksatz (Phasenfaktoren):** Auslöschung entsteht, wenn sich die komplexen Summanden aufgrund von Symmetrie/Basis **zu Null addieren** (vollständige destruktive Interferenz). Teilweise Auslöschung bedeutet: $F_{hkl}\neq 0$, aber kleiner als maximal.

---

### 6.2 Ursprung typischer Auslöschungen: Translationen, Zentrierungen, Basis
Viele systematische Fehlreflexe lassen sich als Produkt zweier Beiträge verstehen:
- **Bravais-Gitter/ Zentrierung** (Positionen der Gitterpunkte in der konventionellen Zelle),
- **Basis** (mehrere Atome pro Gitterpunkt).

Formal oft:
$$
F_{hkl} = \underbrace{\left(\sum_{\mu\in\text{Zentrierung}} e^{-i\mathbf{G}\cdot \mathbf{p}_\mu}\right)}_{\text{Zentrierungsfaktor }S^{\text{Bravais}}_{hkl}}
\;\times\;
\underbrace{\left(\sum_{j\in\text{Basis}} f_j e^{-i\mathbf{G}\cdot \mathbf{q}_j}\right)}_{\text{Basisfaktor }S^{\text{Basis}}_{hkl}}.
$$
Dabei sind $\mathbf{p}_\mu$ die Zentrierungs-Translationen (z.B. $(0,0,0)$ und $(\tfrac12,\tfrac12,\tfrac12)$ für bcc) und $\mathbf{q}_j$ die Basispositionen relativ zu einem Gitterpunkt.

---

### 6.3 Klassische Paritätsregeln (kubisch): sc, bcc, fcc (klausurrelevant)

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/f744c725-2deb-4f86-9aad-e0a328038316/0fe11e98-82e7-4e8a-9bd0-66c23fc24d58-4_194_678_337_708.jpg)

#### (a) Simple cubic (sc)
Zentrierung: nur $\mathbf{p}=(0,0,0)$  
$$
S^{\text{sc}}_{hkl}=1 \quad\Rightarrow\quad \text{keine systematischen Auslöschungen durch Zentrierung.}
$$
(Fehlreflexe können nur durch **Basis** oder zusätzliche Symmetrieoperatoren entstehen.)

---

#### (b) Body-centered cubic (bcc): Regel über $h+k+l$
Zentrierung: $\mathbf{p}_1=(0,0,0)$, $\mathbf{p}_2=(\tfrac12,\tfrac12,\tfrac12)$  
$$
S^{\text{bcc}}_{hkl}=1+e^{-i\mathbf{G}\cdot(\frac12,\frac12,\frac12)a}
=1+e^{-i\pi(h+k+l)}.
$$
Da $e^{-i\pi n}=(-1)^n$:
$$
S^{\text{bcc}}_{hkl}=1+(-1)^{h+k+l}
=\begin{cases}
2,& h+k+l\ \text{gerade}\\
0,& h+k+l\ \text{ungerade}
\end{cases}
$$

**Auslöschungsregel bcc:** Reflex nur erlaubt, wenn $h+k+l$ **gerade**.

**Interpretation über Phasen:** Der zweite Gitterpunkt ist um $\Delta\phi=\pi(h+k+l)$ phasenverschoben.  
- $h+k+l$ gerade $\Rightarrow \Delta\phi=2\pi m$ konstruktiv  
- $h+k+l$ ungerade $\Rightarrow \Delta\phi=(2m+1)\pi$ destruktiv $\Rightarrow$ Auslöschung

**Anschaulich (Ebenenargument):** benachbarte Netzebenen streuen mit Phasensprung $\pi$ und löschen sich aus, z.B. (100) beim bcc.

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/e1fcdaa7-8677-4481-b666-37d988cc42f4/0924f87f-cd38-49a9-8018-bc8a5406ce2d-2_1132_1733_443_385.jpg)

**Beispiele bcc (erlaubt/verboten):**
- (110): $1+1+0=2$ gerade $\Rightarrow$ **erlaubt** (typisch erster starker Peak)
- (100): $1$ ungerade $\Rightarrow$ **verboten**
- (211): $2+1+1=4$ gerade $\Rightarrow$ **erlaubt**
- (111): $3$ ungerade $\Rightarrow$ **verboten**

---

#### (c) Face-centered cubic (fcc): Regel „alle gerade oder alle ungerade“
Zentrierung: 
$$
(0,0,0),\ \left(0,\tfrac12,\tfrac12\right),\ \left(\tfrac12,0,\tfrac12\right),\ \left(\tfrac12,\tfrac12,0\right).
$$
Damit
$$
S^{\text{fcc}}_{hkl}
=1+e^{-i\pi(k+l)}+e^{-i\pi(h+l)}+e^{-i\pi(h+k)}.
$$
Da $e^{-i\pi m}=(-1)^m$, folgt:

- Sind $h,k,l$ **alle gerade** oder **alle ungerade**, dann sind $(h+k),(h+l),(k+l)$ jeweils **gerade**, also alle Exponenten liefern $+1$:
$$
S^{\text{fcc}}_{hkl}=4.
$$
- Ist **genau einer** der Indizes ungerade (bzw. genau einer gerade), dann sind zwei der Summanden $-1$ und zwei $+1$ → vollständige Auslöschung:
$$
S^{\text{fcc}}_{hkl}=0.
$$

**Auslöschungsregel fcc:** Reflex erlaubt nur, wenn $h,k,l$ **gleiche Parität** haben (alle gerade oder alle ungerade).

**Beispiele fcc:**
- (111): alle ungerade $\Rightarrow$ **erlaubt** (oft erster Peak)
- (200): alle gerade $\Rightarrow$ **erlaubt**
- (100): gemischt $\Rightarrow$ **verboten**
- (110): gemischt $\Rightarrow$ **verboten**
- (210): gemischt $\Rightarrow$ **verboten**

---

### 6.4 Diagnostik über systematische Fehlreflexe (Gittertyp erkennen)
Typische „Fingerprints“ (kubisch, 1 Atomsorte, gleiche Formfaktoren):

| Struktur | Erlaubte Reflexe (Auswahl) | Systematisch fehlend |
|---|---|---|
| sc | (100), (110), (111), (200), … | keine (durch Zentrierung) |
| bcc | (110), (200), (211), (220), … | alle mit $h+k+l$ ungerade: (100), (111), (210), … |
| fcc | (111), (200), (220), (311), (222), … | alle „gemischten“: (100), (110), (210), (221), … |

**Klausurtypisches Vorgehen:**  
Aus dem ersten beobachteten Peak (kleinstes $h^2+k^2+l^2$ unter den erlaubten) und den fehlenden Ordnungen auf bcc vs. fcc schließen.

---

### 6.5 Diamantartige Basis (diamond cubic): zusätzliche Auslöschungen/Abschwächungen
Diamantstruktur = **fcc-Bravaisgitter** + **zweiatomige Basis**:
$$
\mathbf{q}_1=(0,0,0),\qquad \mathbf{q}_2=\left(\tfrac14,\tfrac14,\tfrac14\right).
$$
Für gleiche Atomsorte mit Formfaktor $f$:
$$
S^{\text{Basis}}_{hkl}=f\left[1+e^{-i2\pi\left(\frac{h+k+l}{4}\right)}\right]
=f\left[1+e^{-i\frac{\pi}{2}(h+k+l)}\right].
$$

Setze $n=h+k+l$ und nutze die Werte von $e^{-i\frac{\pi}{2}n}$:
- $n=4m$: $e^{-i2\pi m}=1 \Rightarrow S^{\text{Basis}}_{hkl}=2f$ (maximal)
- $n=4m+2$: $e^{-i(\pi+2\pi m)}=-1 \Rightarrow S^{\text{Basis}}_{hkl}=0$ (**zusätzliche Auslöschung**)
- $n=4m+1$: $e^{-i(\frac{\pi}{2}+2\pi m)}=-i \Rightarrow S^{\text{Basis}}_{hkl}=f(1-i)$
- $n=4m+3$: $e^{-i(\frac{3\pi}{2}+2\pi m)}=+i \Rightarrow S^{\text{Basis}}_{hkl}=f(1+i)$

Damit (diamond):
1. Zuerst muss die **fcc-Regel** erfüllt sein (alle Indizes gleichparitätig), sonst sowieso $F_{hkl}=0$.
2. Zusätzlich gilt für die erlaubten fcc-Reflexe:
   - Wenn $h,k,l$ alle **gerade** und $h+k+l=4m+2$ $\Rightarrow$ **Auslöschung** (z.B. (200): $2+0+0=2$ → fehlt!)
   - Wenn alle gerade und $h+k+l=4m$ $\Rightarrow$ stark (z.B. (220): $2+2+0=4$)
   - Wenn alle ungerade $\Rightarrow$ kein vollständiges Verschwinden durch die Basis, aber anderer komplexer Faktor (Intensität $\propto |1\pm i|^2=2$ gegenüber $|2|^2=4$)

**Typische erlaubte/fehlende Peaks (Diamant, gleiche Atome):**
- (111): fcc-erlaubt, $n=3$ → vorhanden (moderat)
- (200): fcc-erlaubt, $n=2=4m+2$ → **systematisch fehlend**
- (220): $n=4$ → stark
- (311): $n=5$ → vorhanden
- (222): $n=6=4m+2$ → **fehlend**

**Diagnostischer Hinweis:** Wenn ein Material „wie fcc“ aussieht, aber z.B. (200) und (222) fehlen, ist das ein starkes Indiz für **diamond/zinkblende-artige** Basis.

---

### 6.6 fcc + zweiatomige Basis mit zwei Atomarten: Zinkblende / NaCl / CsCl (Edge Cases)
Bei **verschiedenen Atomarten** ($f_A\neq f_B$) werden perfekte Auslöschungen durch die Basis oft zu **partiellen** Auslöschungen.

#### (a) Allgemein: zweiatomige Basis bei $\mathbf{q}_1=(0,0,0)$, $\mathbf{q}_2=\mathbf{d}$
$$
S^{\text{Basis}}_{hkl}=f_A+f_B e^{-i\mathbf{G}\cdot \mathbf{d}}.
$$
- Falls $e^{-i\mathbf{G}\cdot \mathbf{d}}=-1$ und $f_A=f_B$ → **vollständige** Auslöschung
- Falls $f_A\neq f_B$ → **nicht vollständig**, sondern
$$
|S|^2 = |f_A-f_B|^2 \neq 0.
$$
**Konsequenz:** „verbotene“ Reflexe können bei Neutronen-/Röntgenstreuung je nach Kontrast der Streulängen/Formfaktoren schwach sichtbar sein.

#### (b) CsCl-Struktur (sc-Bravaisgitter + Basis bei $(0,0,0)$ und $(\tfrac12,\tfrac12,\tfrac12)$)
Basis:
$$
S^{\text{Basis}}_{hkl}=f_{\text{Cs}}+f_{\text{Cl}}e^{-i\pi(h+k+l)}.
$$
- $h+k+l$ gerade: $S=f_{\text{Cs}}+f_{\text{Cl}}$
- $h+k+l$ ungerade: $S=f_{\text{Cs}}-f_{\text{Cl}}$ (**nicht zwingend 0**)

**Wichtiger Edge Case:** Obwohl geometrisch „bcc-ähnlich“, hat CsCl **keine systematischen Fehlreflexe wie bcc**, solange $f_{\text{Cs}}\neq f_{\text{Cl}}$.

---

### 6.7 Zusammenhang zu Symmetrie (Phasenpaare) – Interpretation
Auslöschungen entstehen häufig durch **Paarbildung** von Beiträgen, die durch Symmetrie verknüpft sind:

- **Zentrierungstranslation** $\mathbf{t}$: Beiträge kommen als $1+e^{-i\mathbf{G}\cdot \mathbf{t}}$  
  $\Rightarrow$ Auslöschung, wenn $\mathbf{G}\cdot\mathbf{t}=(2m+1)\pi$.

- **Spiegel/Rotationen** verändern Positionen, aber bei Bragg-Streuung zählt am Ende der **Phasenfaktor** $e^{-i\mathbf{G}\cdot\mathbf{r}}$. Symmetrie kann dafür sorgen, dass sich viele Summanden zu Null addieren.

Zur Illustration der allgemeinen Symmetrieidee (nicht direkt Auslöschungsregel, aber wichtiges Denken in Symmetrieoperationen):

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/456f4735-0658-4530-8f1b-ee711c6925cc/a8d78fc4-0562-407b-b1bc-b95d40f26c45-4_334_235_468_945.jpg)

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/456f4735-0658-4530-8f1b-ee711c6925cc/a8d78fc4-0562-407b-b1bc-b95d40f26c45-4_278_313_1018_906.jpg)

---

### 6.8 Mini-Spickzettel: Auslöschungsregeln (kubisch) + typische Prüfungsfragen
**Kernformeln:**
- bcc:
$$
F_{hkl}\propto 1+e^{-i\pi(h+k+l)}\Rightarrow \begin{cases}
\neq 0,& h+k+l\ \text{gerade}\\
0,& h+k+l\ \text{ungerade}
\end{cases}
$$
- fcc:
$$
F_{hkl}\propto 1+e^{-i\pi(k+l)}+e^{-i\pi(h+l)}+e^{-i\pi(h+k)}
\Rightarrow \text{nur alle gerade oder alle ungerade}
$$
- Diamant (zusätzlich zur fcc-Regel):
$$
S^{\text{Basis}}_{hkl}\propto 1+e^{-i\frac{\pi}{2}(h+k+l)}
\Rightarrow \text{Auslöschung bei } h,k,l\ \text{alle gerade und } h+k+l=4m+2.
$$

**Typische Klausurfragen:**
- „Welche Reflexe fehlen beim bcc/fcc und warum?“ → Paritätsregeln + Phasenfaktorargument.
- „Sie sehen Peaks bei (110), (200), (211), aber nicht bei (100)/(111)“ → Diagnose **bcc**.
- „fcc-typische Peaks, aber (200) fehlt“ → Hinweis auf **diamantartige Basis** (oder Basis mit Phasenauslöschung).
- „Warum tauchen ‘verbotene’ Reflexe manchmal schwach auf?“ → $f_A\neq f_B$, Ordnung/Unordnung, Defekte, Mehrfachstreuung (ideales Modell verletzt).  

---

### 6.9 Kontext: reziprokes Gitter und Brillouin-Zone (Einordnung)
Die Auslöschungsregeln entscheiden, **welche reziproken Gitterpunkte** tatsächlich Intensität tragen (nicht jeder geometrisch erreichbare Punkt ist erlaubt).

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/37d8a2ea-26e9-4b8e-b544-da4cc4e21078/a01e5df1-1111-4d9c-84f4-4a0eed37ea19-05_974_1234_457_310.jpg)

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/37d8a2ea-26e9-4b8e-b544-da4cc4e21078/a01e5df1-1111-4d9c-84f4-4a0eed37ea19-06_759_770_708_2385.jpg)

Diese Bilder helfen, die **Reziprozität fcc $\leftrightarrow$ bcc** zu verorten; die **systematischen Fehlreflexe** kommen jedoch aus dem **Strukturfaktor** (Zentrierung/Basis), nicht aus der bloßen Existenz des reziproken Gitters.

## 7) Thermische Bewegung und Debye-Waller-Faktor: Einfluss auf $F$ und Intensitäten

### Motivation: Atome schwingen um ihre Gitterplätze
- Im **idealen, starren Kristall** sitzen Atome an festen Gleichgewichtslagen $\boldsymbol{\tau}_a$ (Basispositionen in der Einheitszelle).
- Bei **endlicher Temperatur** führen Atome **Gitterschwingungen (Phononen)** aus. Modelliert wird dies als **zeitabhängige Verschiebung**
  $$\boldsymbol{\tau}_a \rightarrow \boldsymbol{\tau}_a + \boldsymbol{u}_a(t).$$
- Wichtig: Trotz Schwingungen bleibt im Mittel die Periodizität erhalten:
  $$\langle \boldsymbol{u}_a(t)\rangle_t = \boldsymbol{0},\qquad \text{aber}\qquad \langle u_a^2\rangle_t \neq 0.$$
  Dabei ist $\langle u^2\rangle$ das **mittlere Auslenkungsquadrat**.

---

### Konsequenz für die Beugung: weniger kohärent-elastisch, mehr diffus (thermisch-diffus)
Die Streuamplitude enthält Phasenfaktoren $e^{i\boldsymbol{K}\cdot\boldsymbol{r}}$ (mit Streuvektor/Momentumtransfer $\boldsymbol{K}=\Delta\boldsymbol{k}$). Durch die thermische Verschiebung wird daraus
$$e^{i\boldsymbol{K}\cdot(\boldsymbol{\tau}_a+\boldsymbol{u}_a(t))} = e^{i\boldsymbol{K}\cdot\boldsymbol{\tau}_a}\, e^{i\boldsymbol{K}\cdot\boldsymbol{u}_a(t)}.$$

- **Kohärente elastische Streuung (Bragg-Peaks):** entspricht dem **zeitlichen (oder Ensemblemittel)** der Amplitude. Dabei tritt der Faktor
  $$\left\langle e^{i\boldsymbol{K}\cdot\boldsymbol{u}_a}\right\rangle$$
  auf, der **kleiner als 1** ist → **Bragg-Intensitäten sinken**.
- **Diffuses Untergrundsignal (thermisch-diffuse Streuung, i. A. inelastisch):**
  - Die „fehlende“ Intensität verschwindet nicht, sondern wird in **Streuung mit Phonon-Anregung/-Vernichtung** umverteilt.
  - Diese Beiträge erfüllen **nicht** streng die Laue-/Bragg-Bedingungen → erscheinen als **breiter Untergrund** um/zwischen Bragg-Peaks.

> Kernaussage: **Temperaturerhöhung führt typischerweise nicht zur Verbreiterung idealer Bragg-Linien, sondern primär zur Reduktion der Bragg-Intensität und zur Zunahme des diffusen Untergrunds** (bei perfektem Kristall, ohne zusätzliche Defekt-/Instrumentverbreiterung).

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/44589bf5-96cf-4bc0-b71a-06314f28658f/f411d17f-4c40-4616-a50a-0dd59c152daf-5_766_1765_625_1075.jpg)

---

### Debye-Waller-Faktor: Klausurformeln und typische Schreibweisen
Für isotrope, harmonische Schwingungen ergibt sich für die **kohärent-elastische** (Bragg-)Intensität häufig die Form
$$I = \frac{I_0}{p}\,\exp\!\left[-\frac{1}{3}\langle u^2\rangle K^2\right].$$

- $I_0$: Intensität ohne thermische Bewegung (z. B. $T\to 0$ als Referenz)
- $p$: ggf. **Polarisations-/Geometriefaktor** (je nach Kontext/Experiment; manchmal in $I_0$ absorbiert)
- $K=|\boldsymbol{K}|$: Betrag des Streuvektors (oft auch $|\boldsymbol{G}|$ am Bragg-Punkt)
- $\langle u^2\rangle$: mittleres Auslenkungsquadrat (material- und temperaturabhängig)

**Äquivalente Schreibweisen (sehr klausurrelevant):**
- In der Strukturamplitude (Strukturfaktor) als Dämpfung:
  $$F(\boldsymbol{G},T)=F(\boldsymbol{G},0)\,e^{-W(\boldsymbol{G})}$$
  mit
  $$W(\boldsymbol{G})=\frac{1}{6}\langle u^2\rangle G^2\quad\text{(isotrop)}.$$
  Dann folgt für Intensitäten (weil $I\propto |F|^2$):
  $$I(\boldsymbol{G},T)=I(\boldsymbol{G},0)\,e^{-2W} = I(\boldsymbol{G},0)\exp\!\left[-\frac{1}{3}\langle u^2\rangle G^2\right].$$
- Häufig in Kristallographie über den **B-Faktor**:
  $$I = I_0\,\exp\!\left[-B\left(\frac{\sin\theta}{\lambda}\right)^2\right],\qquad B=8\pi^2\langle u^2\rangle.$$
  (Umrechnung nutzt $K=\frac{4\pi\sin\theta}{\lambda}$.)

**Merksatz:**  
- **Amplitude** bekommt $e^{-W}$,  
- **Intensität** bekommt $e^{-2W}$.

---

### Interpretation: Abhängigkeiten und „wer ist besonders betroffen?“
Der Exponent ist $\propto \langle u^2\rangle K^2$ (bzw. $G^2$). Daher:

#### 1) Temperaturabhängigkeit
- Mit steigender Temperatur steigen die Schwingungsamplituden:
  $$T\uparrow \ \Rightarrow\ \langle u^2\rangle \uparrow \ \Rightarrow\ I_{\text{Bragg}}\downarrow.$$
- Qualitativ:
  - bei tiefen $T$: oft dominiert **Nullpunktsbewegung** (auch bei $T=0$ ist $\langle u^2\rangle \neq 0$ möglich),
  - bei hohen $T$: $\langle u^2\rangle$ wächst typischerweise näherungsweise $\propto T$ (harmonischer Grenzfall, klassisch).

![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/44589bf5-96cf-4bc0-b71a-06314f28658f/f411d17f-4c40-4616-a50a-0dd59c152daf-6_1322_1319_389_314.jpg)

#### 2) $|G|$-/$|K|$-Abhängigkeit (Streuwinkel/Ordnung)
- Für Bragg-Reflexe gilt am Maximum $\boldsymbol{K}\approx \boldsymbol{G}$.
- **Höhere Ordnung** (größere Miller-Indizes) $\Rightarrow$ größeres $|G|$ $\Rightarrow$ stärkere Dämpfung:
  $$|G|\uparrow \Rightarrow \exp\!\left[-\frac{1}{3}\langle u^2\rangle G^2\right]\downarrow.$$
- Praktische Konsequenz: Reflexe wie (800), (10 00) fallen mit $T$ deutlich schneller ab als (200).

#### 3) Materialabhängigkeit
$\langle u^2\rangle$ hängt ab von:
- **Masse** der Atome (leichter $\Rightarrow$ größere Auslenkungen),
- **Bindungsstärke / Phononenspektrum** (steifer Kristall $\Rightarrow$ kleinere Auslenkungen),
- **Debye-Temperatur** $\Theta_D$ (großes $\Theta_D$ $\Rightarrow$ tendenziell kleinere thermische Auslenkungen bei gegebenem $T$).

---

### Einfluss auf den Strukturfaktor $F$: „wo“ taucht der Faktor auf?
Für den (statischen) Strukturfaktor (ohne Thermik):
$$F(\boldsymbol{G})=\sum_a f_a(\boldsymbol{G})\,e^{i\boldsymbol{G}\cdot\boldsymbol{\tau}_a}.$$

Mit thermischer Bewegung wird im **kohärent-elastischen Anteil** effektiv:
$$F_T(\boldsymbol{G})=\sum_a f_a(\boldsymbol{G})\,e^{i\boldsymbol{G}\cdot\boldsymbol{\tau}_a}\,\left\langle e^{i\boldsymbol{G}\cdot\boldsymbol{u}_a}\right\rangle.$$

Für isotrope, harmonische Schwingungen:
$$\left\langle e^{i\boldsymbol{G}\cdot\boldsymbol{u}}\right\rangle=\exp\!\left[-\frac{1}{6}\langle u^2\rangle G^2\right].$$

**Mehratomige Basis (edge case):**  
- Wenn verschiedene Atomsorten/Positionen unterschiedliche $\langle u_a^2\rangle$ besitzen, bekommt **jedes Atom seinen eigenen Debye-Waller-Faktor**:
  $$F_T(\boldsymbol{G})=\sum_a f_a(\boldsymbol{G})\,e^{i\boldsymbol{G}\cdot\boldsymbol{\tau}_a}\,e^{-W_a(\boldsymbol{G})}.$$
  Dadurch ändern sich **relative Intensitäten** zwischen Reflexen zusätzlich (nicht nur ein globaler Skalierungsfaktor).

---

### Visualisierung: starke Reflexe werden bei $T>0$ „ausgedünnt“, Untergrund wächst
![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/dc8f24dc-48f9-4c05-a9a5-42bb7f92579b/39f94241-0469-4f3e-9eeb-9fd7567211fb-2_145_553_656_1082.jpg)

---

### Beispiele & typische Klausur-Argumente

#### Beispiel 1: Vergleich zweier Reflexe bei gleicher Temperatur
Gegeben gleiche $\langle u^2\rangle$, aber $G_2=2G_1$:
$$\frac{I(G_2)}{I(G_1)}=\frac{I_0(G_2)}{I_0(G_1)}\exp\!\left[-\frac{1}{3}\langle u^2\rangle (G_2^2-G_1^2)\right]
=\frac{I_0(G_2)}{I_0(G_1)}\exp\!\left[-\frac{1}{3}\langle u^2\rangle (3G_1^2)\right].$$
**Interpretation:** Hochordnungsreflexe brechen exponentiell stärker ein.

#### Beispiel 2: Temperaturerhöhung um $\Delta T$
Wenn näherungsweise $\langle u^2\rangle \approx aT$ (klassischer Bereich), dann:
$$\ln I = \ln\!\left(\frac{I_0}{p}\right) - \frac{1}{3}(aT)K^2.$$
**Plot-Idee:** $\ln I$ gegen $T$ ist linear, Steigung $\propto -K^2$.

---

### Edge Cases / wichtige Einschränkungen
| Situation | Was ändert sich? | Merke |
|---|---|---|
| **$T\to 0$** | Bragg-Intensität maximal, aber nicht zwingend $=I_0$ ohne Dämpfung, da **Nullpunktsbewegung** möglich | Debye-Waller kann auch bei $0\,\text{K}$ $\neq 1$ sein |
| **Sehr große $|G|$ / großer Streuwinkel** | Debye-Waller-Dämpfung dominiert; Reflexe evtl. praktisch nicht mehr messbar | „Hochordnungsreflexe sterben zuerst“ |
| **Anisotrope Schwingungen** (z. B. Schichtkristalle) | Ersetzung von $\langle u^2\rangle$ durch Tensor $U_{ij}$: $W=\frac{1}{2}\sum_{ij}G_iG_jU_{ij}$ | Richtung von $\boldsymbol{G}$ wichtig |
| **Statische Unordnung/Defekte** | Kann Peaks verbreitern/zusätzliche diffuse Streuung erzeugen (nicht rein thermisch) | Debye-Waller beschreibt **thermische** Bewegung, nicht Defektbreite |
| **Mehratomige Basis mit unterschiedlichen $W_a$** | Temperatur ändert Relativintensitäten, nicht nur absolute Skala | jedes Atom: eigener Faktor $e^{-W_a}$ |

---

### Klausur-„Formelblock“ (kompakt)
$$I(\boldsymbol{G},T)=\frac{I_0(\boldsymbol{G})}{p}\exp\!\left[-\frac{1}{3}\langle u^2\rangle G^2\right]$$
$$F(\boldsymbol{G},T)=F(\boldsymbol{G},0)\,e^{-W},\qquad W=\frac{1}{6}\langle u^2\rangle G^2\quad(\text{isotrop})$$
$$K=\frac{4\pi\sin\theta}{\lambda}\quad\Rightarrow\quad I=I_0\exp\!\left[-\frac{1}{3}\langle u^2\rangle K^2\right]$$

## 8) Praktische Anwendung: Von Intensitäten zu Strukturinformation (und Grenzen)

### 8.1 Workflow der Strukturanalyse (Big Picture)
**Ziel:** Aus gemessenen Reflexintensitäten $I_{hkl}$ auf **Atompositionen**, **Besetzungen** und letztlich die **Elektronendichte** $\rho(\mathbf{r})$ schließen.

Typischer Ablauf:
1. **Messung** eines Beugungsdatensatzes: Reflexe $(hkl)$ mit Intensitäten $I_{hkl}^{\text{meas}}$.
2. **Korrekturen** (Geometrie/Strahloptik/Statistik): $\Rightarrow$ “integrierte Intensitäten” $\propto |F_{hkl}|^2$.
3. **Indexierung** (Zuordnung der Peaks zu $(hkl)$) und Bestimmung der **Gitterparameter**.
4. **Modellbildung** (Startstruktur): Raumgruppe, ungefähre Atomlagen, chemische Zusammensetzung.
5. **Refinement (Verfeinerung):** Parameter so anpassen, dass $|F_{hkl}^{\text{calc}}|^2$ zu $I_{hkl}^{\text{corr}}$ passt.
6. **Elektronendichtekarte** $\rho(\mathbf{r})$ (Fourier) und Plausibilitätschecks.

---

### 8.2 Intensität $\rightarrow$ Strukturfaktor: klausurrelevante Grundgleichungen
In elastischer Beugung ist die **Reflexintensität** im Kern proportional zum Quadrat des **Strukturfaktors**:
$$
I_{hkl} \propto |F_{hkl}|^2
$$

**Praktisch** (Kontext: typische Korrekturfaktoren):
$$
I_{hkl}^{\text{meas}} = C \; L(\theta)\; P(\theta)\; p_{hkl}\; A(\theta)\; |F_{hkl}|^2
$$

- $C$: Skalenfaktor (Instrument, Probenvolumen, Messzeit)
- **Lorentz-Faktor** $L(\theta)$: geometrische/zeitliche Abtastung der Reflexbedingungen  
- **Polarisation** $P(\theta)$: Polarisationszustand der Strahlung (v. a. Röntgen)
- **Multiplikität** $p_{hkl}$: Anzahl symmetrieäquivalenter Reflexe mit gleichem $d_{hkl}$ (Powder besonders wichtig)
- **Absorption** $A(\theta)$: Abschwächung in der Probe (Material/Geometrie-abhängig)

> **Merke (Klausur):** Ohne korrekte $L/P/p$-Behandlung sind Intensitätsvergleiche zwischen Reflexen systematisch verzerrt; erst nach Korrektur ist $I_{hkl}\sim |F_{hkl}|^2$ sinnvoll interpretierbar.

---

### 8.3 Strukturfaktor als Summe über Atome (inkl. Besetzung & thermischer Bewegung)
Für eine Elementarzelle mit Atomen $j$ an Positionen $\mathbf{r}_j=(x_j,y_j,z_j)$ (in Einheitszellkoordinaten):
$$
F_{hkl} = \sum_{j} o_j \; f_j(\sin\theta/\lambda)\; T_j(hkl)\; e^{2\pi i (h x_j + k y_j + l z_j)}
$$

- $o_j$: **Besetzungsfaktor** (Occupancy), $0\le o_j \le 1$
- $f_j$: **Atomformfaktor** (XRD; bei Neutronen: Streulänge $b_j$ statt $f_j$)
- $T_j(hkl)$: **Debye-Waller-Faktor** (Temperatur-/Unordnungseffekt)
- Exponentialterm kodiert die **Phasenlage** durch Atomposition

**Ortsvektoren & Aufspaltung (Geometrieintuition):**  
![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/37d8a2ea-26e9-4b8e-b544-da4cc4e21078/a01e5df1-1111-4d9c-84f4-4a0eed37ea19-14_1210_1895_452_197.jpg)  
![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/e1fcdaa7-8677-4481-b666-37d988cc42f4/0924f87f-cd38-49a9-8018-bc8a5406ce2d-1_1215_1895_447_197.jpg)

---

### 8.4 Atomformfaktor $f$: warum Intensitäten mit Streuvektor abfallen
Für Röntgenstreuung ist $f$ die Fourier-Transformierte der **Elektronendichte des Atoms** (anschaulich: “ausgedehntes Streuzentrum”):
$$
f(\mathbf{K}) = \int_V \rho(\mathbf{r})\, e^{-i \mathbf{K}\cdot \mathbf{r}}\, dV
$$
mit Streuvektorbetrag (im üblichen Skalarparameter):
$$
K = \frac{4\pi \sin\theta}{\lambda}
$$

**Konsequenz:** Mit wachsendem $K$ (große Winkel, hohe Auflösung) nimmt $f$ typischerweise ab $\Rightarrow$ **hohe** $(hkl)$ sind oft **schwächer**.

Beispielhafte Verläufe:
![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/e1fcdaa7-8677-4481-b666-37d988cc42f4/0924f87f-cd38-49a9-8018-bc8a5406ce2d-5_1215_2645_273_304.jpg)

**XRD vs. Neutronen (wichtige Prüfungsintuition):**
- **Röntgen:** Streuamplitude $\sim$ Elektronenzahl, aber **winkelabhängig** über $f(K)$; schwere Atome dominieren Intensitäten.
- **Neutronen:** Streulängen $b$ sind näherungsweise **winkelunabhängig** und isotopenspezifisch; leichte Atome (z. B. H) können “sichtbarer” sein.

Illustration:
![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/e1fcdaa7-8677-4481-b666-37d988cc42f4/0924f87f-cd38-49a9-8018-bc8a5406ce2d-6_1097_1468_461_760.jpg)

**Edge Cases / typische Effekte:**
- **Nahe Absorptionskante (XRD):** anomale Dispersion $\Rightarrow f = f_0 + f' + i f''$ (Phasen-/Kontraständerung; wichtig für Phasenbestimmung/Elementunterscheidung).
- **Ionenladung:** $f$ ändert sich leicht (Elektronenverteilung), kann bei präzisen Daten relevant sein.
- **Sehr hohe Winkel:** $f\to$ klein $\Rightarrow$ Messrauschen und DW-Dämpfung dominieren.

---

### 8.5 Debye-Waller-Faktor: Temperatur/Unordnung dämpft Bragg-Intensitäten
Thermische Schwingungen (und statische Unordnung) reduzieren kohärente elastische Streuung:

Isotrop (häufige Klausurform):
$$
T_j(hkl)= e^{-B_j \left(\frac{\sin\theta}{\lambda}\right)^2}
\quad\text{mit}\quad
B_j = 8\pi^2 \langle u_j^2\rangle
$$

Alternativ (vektorielle Darstellung):
$$
T_j = e^{-2W},\qquad W \propto \langle (\mathbf{K}\cdot \mathbf{u})^2\rangle
$$

**Konsequenzen (sehr klausurrelevant):**
- Dämpfung ist **stärker bei großen $|\mathbf{K}|$** $\Rightarrow$ hohe Indizes $(h+k+l)$ fallen mit $T$ besonders ab.
- Intensität wird **aus Bragg-Peaks in diffusen Untergrund** umverteilt (bei steigender Temperatur).

Abbildungen (Temperaturabhängigkeit/Untergrund):
![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/44589bf5-96cf-4bc0-b71a-06314f28658f/f411d17f-4c40-4616-a50a-0dd59c152daf-5_766_1765_625_1075.jpg)  
![](http://localhost:5001/subjects/9a4c3586-ca6c-46a7-b5d7-96e1b9a41680/images/44589bf5-96cf-4bc0-b71a-06314f28658f/f411d17f-4c40-4616-a50a-0dd59c152daf-6_1322_1319_389_314.jpg)

**Edge Cases:**
- **Anisotropes ADP:** statt eines $B$-Werts ein Tensor $U_{ij}$; wichtig bei gerichteten Schwingungen/Schichtstrukturen.
- **Statische Fehlordnung** kann wie ein großes $B$ aussehen (scheinbar “heißes” Atom) $\Rightarrow$ Modellambiguität.

---

### 8.6 Von $F_{hkl}$ zur Elektronendichte $\rho(\mathbf{r})$
Die Elektronendichte in der Elementarzelle erhält man als inverse Fourier-Reihe:
$$
\rho(\mathbf{r}) = \frac{1}{V}\sum_{hkl} F_{hkl}\; e^{-2\pi i (h x + k y + l z)}
$$

Da experimentell primär **Intensitäten** gemessen werden:
$$
I_{hkl}\propto |F_{hkl}|^2
$$
fehlt die Phase $\varphi_{hkl}$ in
$$
F_{hkl}=|F_{hkl}| e^{i\varphi_{hkl}}
$$

**Praktischer Weg trotzdem zur Struktur:**
- Man startet mit einem **Strukturmodell** $\Rightarrow$ liefert **Phasen** $\varphi_{hkl}^{\text{calc}}$.
- Daraus erzeugt man Elektronendichtekarten, z. B. **(Differenz-)Fourier**:
$$
\Delta \rho(\mathbf{r})=\frac{1}{V}\sum_{hkl}\left(F_{hkl}^{\text{obs}}-F_{hkl}^{\text{calc}}\right)e^{-2\pi i \mathbf{h}\cdot \mathbf{r}}
$$
(typisch genutzt, um fehlende Atome/Fehlmodellierung sichtbar zu machen)

**Interpretation von $\rho(\mathbf{r})$:**
- **Maxima** $\approx$ Atomlagen (bei XRD besonders für schwere Elemente).
- Peak-Höhen/Volumina korrelieren mit **Elektronenzahl** und **Besetzung** (aber verfälscht durch $B$, Auflösung, Skalierung).
- **Bindungselektronendichte** (kovalente Bindung) ist nur bei sehr hochqualitativen Daten & geeigneter Modellierung sichtbar.

---

### 8.7 Refinement: Welche Parameter werden aus Intensitäten bestimmt?
Im Refinement werden Parameter so angepasst, dass berechnete Intensitäten zu den korrigierten Messdaten passen (Least Squares, Maximum Likelihood):

**Typische verfeinerte Parameter (und wie sie in $F_{hkl}$ wirken):**

| Parameter | Symbol | Wirkung auf Intensitäten | Typische Korrelationen / Fallen |
|---|---:|---|---|
| Atomposition | $(x,y,z)$ | ändert Phasen $e^{2\pi i(hx+ky+lz)}$ $\Rightarrow$ Interferenz | kann bei hoher Symmetrie “schwach determiniert” sein |
| Besetzung (Occupancy) | $o$ | skaliert Beitrag des Atoms linear in $F$ | stark korreliert mit $B$ |
| Isotroper DW | $B$ | dämpft v. a. hohe Winkel | korreliert mit $o$, Skalierung, Fehlordnung |
| Anisotroper DW | $U_{ij}$ | richtungsabhängige Dämpfung | benötigt viele/hochaufgelöste Reflexe |
| Skalenfaktor | $C$ | globale Intensitätsskala | kann $o$ maskieren |
| Extinktion/Mosaizität (Kontext) | — | verändert starke Reflexe | besonders bei perfekten Einkristallen |

**Beispiel (klassische Ambiguität $o$ vs. $B$):**
- Ein Atom mit **geringer Besetzung** $o<1$ reduziert $F_{hkl}$ für alle Winkel ähnlich.
- Ein zu großer **$B$-Wert** reduziert v. a. hohe Winkel stärker.  
Bei begrenzter Winkelreichweite oder hohem Rauschen können beide Effekte teilweise ähnlich aussehen $\Rightarrow$ sorgfältige Datenqualität/Constraints nötig.

---

### 8.8 Grenzen & typische Nicht-Eindeutigkeiten (warum Intensitäten nicht alles sind)
#### (1) Phasenproblem (grundlegend)
- Gemessen wird $|F_{hkl}|^2$, nicht $F_{hkl}$ selbst $\Rightarrow$ **Phasen fehlen direkt**.
- Ohne Phasen kann $\rho(\mathbf{r})$ nicht eindeutig rekonstruiert werden.
- Praxis: Phasen aus **Modell**, **Symmetrie**, **Patterson**, **(anomaler) Dispersion**, **Direkte Methoden** etc.

#### (2) Thermische Parameter vs. Fehlordnung
- **Thermische Schwingungen** (Debye-Waller) und **statische Fehlordnung** (z. B. Split-Positionen) können zu ähnlichen Intensitätsmustern führen.
- Ergebnis: Ein Modell mit großem $B$ kann eine reale Positionsfehlordnung “verstecken”.

**Edge Case:**  
- **Substitutionsmischkristall**: Atom A/B teilt sich einen Gitterplatz. Dann ist effektiv
$$
F_{hkl}\sim o_A f_A + o_B f_B
$$
Mit nur XRD kann A/B bei ähnlichen $f$ schlecht unterscheidbar sein; Neutronen oder anomale XRD helfen.

#### (3) Dominanz schwerer Atome (XRD)
- Schwere Elemente dominieren $F_{hkl}$; leichte Atome (H, Li) sind schwer lokalisierbar.
- **Konsequenz:** Atompositionen leichter Elemente können unsicher sein; oft Kombination mit Neutronenbeugung sinnvoll.

#### (4) Systematische Messfehler (können “Struktur” imitieren)
- Unzureichende Absorptionskorrektur $A(\theta)$, bevorzugte Orientierung (Powder), Extinktion, Detektorsättigung  
$\Rightarrow$ verzerrte $|F|^2$ und scheinbar “komische” $B$-Werte/Occupancies.

---

### 8.9 Mini-Beispiele (intensitätsbasierte Aussagen)
- **Auslöschungsregeln / fehlende Reflexe:** systematische Abwesenheiten $\Rightarrow$ Raumgruppe/Gitterzentrierung (z. B. fcc: nur “alle gerade oder alle ungerade”).
- **Temperaturerhöhung:** Bragg-Intensitäten sinken, besonders bei hohen $(hkl)$; diffuser Untergrund wächst (Debye-Waller/Phononen).
- **Besetzungsänderung (Dotierung):** bestimmte Reflexe ändern sich, wenn Kontrast $f_A-f_B$ groß ist; bei kleinem Kontrast kaum sichtbar.

> **Take-away:** In der Praxis ist Strukturbestimmung ein Zusammenspiel aus **korrekt interpretierter Intensität** ($|F|^2$ mit $L/P/p/A$), **physikalischen Modellen** ($f$, Debye-Waller, Occupancy) und dem Umgang mit der zentralen Grenze: **Phaseninformation fehlt direkt**.

---

## Quick Reference: Key Formulas

### Reziprokes Gitter / Fourier-Beschreibung
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Minimaler reziproker Gittervektor (1D, Gitterkonstante \(d\)) | $$G_{\min}=\frac{2\pi}{d}$$ | \(G_{\min}\): kleinster reziproker Gittervektor, \(d\): Gitterabstand/Gitterkonstante |
| (Wiederholt als „Minimaler reziproker Gittervektor“) | $$\frac{2\boldsymbol{\pi}}{\boldsymbol{d}}$$ | \(\pi\): Kreiszahl, \(d\): Gitterabstand (Vektorschreibweise wie in den Folien) |
| Dualitätsbedingung reale/reziproke Basisvektoren | $$\boldsymbol{a}_{i}\cdot\boldsymbol{b}_{j}=2\pi\,\delta_{ij}$$ | \(\boldsymbol{a}_i\): Basisvektoren im Realraum, \(\boldsymbol{b}_j\): Basisvektoren im reziproken Raum, \(\delta_{ij}\): Kronecker-Delta |

---

### Beugung / Laue-Bedingung (Streugeometrie)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Streuvektor (Differenz der Wellenvektoren) | $$\boldsymbol{G}=\boldsymbol{k}-\boldsymbol{k}_{0}$$ | \(\boldsymbol{k}_0\): einfallender Wellenvektor, \(\boldsymbol{k}\): gestreuter Wellenvektor, \(\boldsymbol{G}\): reziproker Gittervektor/Streuvektor |
| Laue-Bedingung (Beugungsbedingung) | $$\boldsymbol{k}-\boldsymbol{k}_{0}=\boldsymbol{G}$$ | \(\boldsymbol{k}_0\): einfallend, \(\boldsymbol{k}\): gestreut, \(\boldsymbol{G}\): reziproker Gittervektor (erlaubter Reflex) |

---

### Atom-/Formfaktor (Streutheorie)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Betrag/Definition des Streuvektors in der Winkel-/Wellenlängenform | $$K=\frac{4\pi\sin\theta}{\lambda}$$ | \(K\): (Betrag des) Streuvektors, \(\theta\): Streuwinkel (Bragg-Halbwinkeldeutung üblich), \(\lambda\): Wellenlänge |
| Atom-Strukturfaktor / Atomformfaktor als Fourier-Transformierte der Ladungsdichte | $$f(\boldsymbol{\Delta k})=\int_{V}\rho(\boldsymbol{r})\,e^{-\boldsymbol{\Delta k}\cdot\boldsymbol{r}^{\prime}}\,dV^{\prime}$$ | \(f\): Atomformfaktor, \(\rho(\boldsymbol{r})\): (Elektronen-)Ladungsdichte, \(\boldsymbol{\Delta k}\): Streuvektor (hier statt \(\boldsymbol{G}\)), \(\boldsymbol{r}'\): Ortsvektor im Integrationsvolumen, \(V\): Integrationsvolumen |

---

### Bloch-Elektronen / Impulsbegriffe
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Erwartungswert des Impulses beim freien Elektron (Hinweis aus den Bemerkungen) | $$\langle\boldsymbol{p}\rangle_{n,\mathbf{k}}=\hbar\,\mathbf{k}$$ | \(\langle\boldsymbol{p}\rangle_{n,\mathbf{k}}\): Impuls-Erwartungswert im Band \(n\) bei Wellenvektor \(\mathbf{k}\), \(\hbar\): reduziertes Planck-Quantum, \(\mathbf{k}\): Kristallwellenvektor |
| Mechanischer Impuls (klassisch/QM-Erwartungswert) | $$\boldsymbol{p}=m\,\mathbf{v}$$ | \(\boldsymbol{p}\): mechanischer Impuls, \(m\): Masse, \(\mathbf{v}\): Geschwindigkeit |

---

### Magnetfeld / Zyklotronresonanz
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Zyklotronfrequenz (effektive Masse) | $$\omega_{c}=\frac{qB}{m^{*}}$$ | \(\omega_c\): Zyklotronfrequenz, \(q\): Ladung, \(B\): Magnetfeld, \(m^*\): effektive Masse |

---

### Tight-Binding / Gitterphasen (magnetischer Fluss in Plaquette)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Akkumulierte Phase um ein Plaquette (entspricht effektivem Fluss) | $$\Phi=\sum \varphi_{ij}\neq 0$$ | \(\Phi\): Gesamtphase/effektiver Fluss, \(\varphi_{ij}\): Phasen auf Bindungen zwischen Gitterplätzen \(i,j\) |

---

### Fermi-Niveau (Bandlücke)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Fermi-Niveau (Symbol) | $$E_{F}$$ | \(E_F\): Fermi-Energie/Fermi-Niveau (Lage relativ zu Valenzband/Leitungsband/Bandlücke) |
