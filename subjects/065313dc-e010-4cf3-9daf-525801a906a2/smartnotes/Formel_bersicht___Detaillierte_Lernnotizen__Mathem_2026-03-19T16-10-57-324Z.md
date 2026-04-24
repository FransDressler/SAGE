# Formelübersicht – Detaillierte Lernnotizen (Mathematik, Physik & Statistik)

## 1) Grundlagen: Formeln lesen, umstellen und Einheiten prüfen

### 1.1 Variablen, Konstanten, Parameter (richtig „lesen“)
- **Variable**: ändert sich im Problemkontext (z. B. $T,\,V,\,N,\,p,\,E$).
- **Konstante**: fest (z. B. $k_\mathrm{B}$, $\hbar$), ggf. auch **dimensionslos** (z. B. $2$, $\pi$).
- **Parameter**: wird in einer Rechnung als gegeben behandelt, kann aber zwischen Aufgaben variieren (z. B. $m$, Kopplung $g$, äußeres Feld $B$).
- **Zustandsgrößen vs. Prozessgrößen (Thermo-Notation)**:
  - Zustandsgröße: totales Differential, z. B. $\mathrm{d}E,\,\mathrm{d}S$
  - Prozessgröße: kein totales Differential, z. B. $\delta Q,\,\delta W$
  - Beispiel (1. Hauptsatz):
    $$\mathrm{d}E=\delta Q+\delta W$$

### 1.2 Typische Notationen (Indizes, Beträge, Summen, Integrale)
- **Indizes** (diskrete Freiheitsgrade/Teilchen):
  - $x_i$ (i-tes Teilchen), $E_n$ (n-ter Zustand), $\varepsilon_\mathbf{k}$ (Impulsmodus)
- **Betrag/Norm**:
  - $|x|$, $|\mathbf{k}|$, $|A|$ (Kontext: Betrag vs. Determinante)
- **Summenzeichen** (diskrete Summe, Zustandssumme):
  $$\sum_{i=1}^{N} a_i,\qquad Z=\sum_{s} e^{-\beta E_s}$$
- **Integralzeichen** (kontinuierliche Freiheitsgrade; oft als Grenzfall einer Summe):
  $$\int f(x)\,\mathrm{d}x,\qquad Z=\int \mathrm{d}\Gamma\,e^{-\beta H(\Gamma)}$$
- **Kurznotationen**:
  - $\beta=\frac{1}{k_\mathrm{B}T}$, **immer Einheiten prüfen** (hier: $[\beta]=1/\mathrm{J}$)
  - Fugazität $z=e^{\beta\mu}$ ist **dimensionslos**

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/3471c5fc-fa67-490d-8096-3b119835f77d/6b757ef2-ab76-47ac-9115-bdb64168b6e8-04_429_2420_517_174.jpg)

### 1.3 Äquivalenzumformungen: Gleichungen sicher nach einer Größe umstellen
**Prinzip:** Auf beiden Seiten **dieselbe** (invertierbare) Operation anwenden, dabei **Klammern** und **Vorzeichen** strikt mitführen.

| Operation | Erlaubt, wenn… | Typischer Stolperstein |
|---|---|---|
| $\pm c$ | immer | Vorzeichenfehler |
| $\cdot c$ / $:c$ | $c\neq 0$ | Division durch $0$ |
| Potenzieren | ggf. Definitionsbereich beachten | Scheinlösungen (z. B. Quadrieren) |
| Wurzelziehen | i. d. R. Nichtnegativität nötig | $\sqrt{x^2}=|x|$ |
| $\ln(\cdot)$ / $\exp(\cdot)$ | Argument von $\ln$ muss $>0$; **Argument muss dimensionslos sein** | Einheiten im Logarithmus |

#### Beispiele (klassisch)
- (a) Aus $v=\frac{s}{t}$ nach $s$:
  $$s=v\,t$$
- (b) Aus $F=m\,a$ nach $a$:
  $$a=\frac{F}{m}$$
- (c) Energieformel umstellen:
  $$E=\frac12 m v^2 \;\Rightarrow\; v=\sqrt{\frac{2E}{m}} \quad (\text{mit } v\ge 0 \text{ als Geschwindigkeit})$$

### 1.4 Definitionsbereiche & typische Fehler
- **Klammern**: $-(a+b)\neq -a+b$  
- **Vorzeichen bei Logarithmen**: $\ln(a/b)=\ln a-\ln b$ (nur für $a,b>0$)
- **Scheinlösungen** (z. B. durch Quadrieren):
  - Start: $\sqrt{x}= -1$ hat **keine** Lösung (weil $\sqrt{x}\ge 0$)
- **Dimensionslosigkeit**:
  - $\exp(x)$ und $\ln(x)$ verlangen **dimensionsloses** Argument  
    z. B. $e^{-\beta E}$ ist ok, weil $\beta E$ dimensionslos ist.

### 1.5 Dimensional Analysis / Einheitenanalyse (Plausibilitätscheck)
**Ziel:** Jede Gleichung muss dimensionskonsistent sein: linke und rechte Seite gleiche Dimension.

#### SI-Basis & abgeleitete Einheiten (Auswahl)
| Größe | Einheit | In Basiseinheiten |
|---|---|---|
| Geschwindigkeit $v$ | $\mathrm{m/s}$ | $\mathrm{m\,s^{-1}}$ |
| Kraft $F$ | $\mathrm{N}$ | $\mathrm{kg\,m\,s^{-2}}$ |
| Energie $E$ | $\mathrm{J}$ | $\mathrm{kg\,m^2\,s^{-2}}$ |
| Druck $p$ | $\mathrm{Pa}$ | $\mathrm{N/m^2}=\mathrm{kg\,m^{-1}\,s^{-2}}$ |

#### Präfixe (sicher umrechnen)
| Präfix | Symbol | Faktor |
|---|---:|---:|
| kilo | $k$ | $10^3$ |
| mega | $M$ | $10^6$ |
| milli | $m$ | $10^{-3}$ |
| mikro | $\mu$ | $10^{-6}$ |
| nano | $n$ | $10^{-9}$ |

#### Einheitencheck (Beispiel)
$$E=\frac12 m v^2$$
- $[m]=\mathrm{kg}$, $[v^2]=\mathrm{m^2/s^2}$
- Also:
  $$[E]=\mathrm{kg}\cdot \mathrm{m^2/s^2}=\mathrm{J}$$

#### Schnellregeln (für Statistische Physik nützlich)
- **Boltzmannfaktor**: $e^{-\beta E}$ nur sinnvoll, wenn $\beta E$ **dimensionslos**:
  $$\beta=\frac{1}{k_\mathrm{B}T}\quad\Rightarrow\quad [\beta]=1/\mathrm{J}$$
- **Chemisches Potential** $\mu$ hat Einheit **Energie** (z. B. $\mathrm{J}$), daher $z=e^{\beta\mu}$ dimensionslos.
- **Hamiltonian** hat Einheit **Energie**:
  $$H=\sum_i \frac{\mathbf{p}_i^2}{2m}+V(\{\mathbf{x}_i\}) \quad\Rightarrow\quad [H]=\mathrm{J}$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c3f11257-bac0-4d04-a400-59bbf93443d6/25d076b2-b147-4a3b-9d72-efd9651588eb-04_820_1470_211_126.jpg)

## 2) Algebra & Funktionen: zentrale Rechen- und Funktionsformeln

### 2.1 Binomische Formeln & Faktorisierung
**Binomische Formeln**
$$
(a+b)^2=a^2+2ab+b^2,\qquad (a-b)^2=a^2-2ab+b^2
$$
$$
(a+b)(a-b)=a^2-b^2
$$

**Häufige Faktorisierungen**
- **Differenz von Quadraten**
  $$
  x^2-a^2=(x-a)(x+a)
  $$
  Beispiel:
  $$
  x^2-9=(x-3)(x+3)
  $$
- **Quadratische Ergänzung**
  $$
  x^2+bx+c=\left(x+\frac{b}{2}\right)^2+\left(c-\frac{b^2}{4}\right)
  $$
- **Gemeinsamen Faktor ausklammern**
  $$
  ax+ay=a(x+y)
  $$

### 2.2 Potenzgesetze, Wurzeln, Brüche
**Potenzgesetze** (für $a\neq 0$)
$$
a^m\cdot a^n=a^{m+n},\qquad \frac{a^m}{a^n}=a^{m-n},\qquad (a^m)^n=a^{mn}
$$
$$
(ab)^n=a^n b^n,\qquad \left(\frac{a}{b}\right)^n=\frac{a^n}{b^n}
$$
$$
a^{-n}=\frac{1}{a^n},\qquad a^0=1
$$

**Wurzeln als Potenzen**
$$
\sqrt[n]{a}=a^{1/n},\qquad \sqrt{a}\sqrt{b}=\sqrt{ab}\ \ (a,b\ge 0)
$$
$$
\sqrt{\frac{a}{b}}=\frac{\sqrt{a}}{\sqrt{b}}\ \ (a\ge 0,\ b>0)
$$

**Bruchregeln**
$$
\frac{a}{b}\pm \frac{c}{d}=\frac{ad\pm bc}{bd},\qquad \frac{a}{b}\cdot\frac{c}{d}=\frac{ac}{bd},\qquad \frac{a}{b}:\frac{c}{d}=\frac{ad}{bc}
$$

### 2.3 Exponential- und Logarithmusgesetze (zentral in Stat. Physik)
**Exponentialgesetze**
$$
e^{x+y}=e^x e^y,\qquad e^{x-y}=\frac{e^x}{e^y},\qquad (e^x)^a=e^{ax}
$$

**Logarithmusgesetze** (für $a,b>0$)
$$
\ln(ab)=\ln a+\ln b,\qquad \ln\left(\frac{a}{b}\right)=\ln a-\ln b,\qquad \ln(a^r)=r\ln a
$$
**Basiswechsel**
$$
\log_{10}(a)=\frac{\ln a}{\ln 10},\qquad \log_b(a)=\frac{\ln a}{\ln b}
$$
**Umformungsbeispiel**
$$
10^x=a\ \Rightarrow\ x=\log_{10}(a)
$$
Allgemein:
$$
b^x=a\ \Rightarrow\ x=\log_b(a)=\frac{\ln a}{\ln b}
$$

### 2.4 Reihenentwicklungen (oft für Näherungen/Grand Canonical)
**Geometrische Reihe**
$$
\sum_{n=0}^{\infty} r^n=\frac{1}{1-r}\quad (|r|<1)
$$

**Taylor (kleines $x$)**
$$
e^x=\sum_{n=0}^\infty \frac{x^n}{n!}=1+x+\frac{x^2}{2}+\ldots
$$
$$
\ln(1+x)=\sum_{n=1}^\infty (-1)^{n+1}\frac{x^n}{n}=x-\frac{x^2}{2}+\frac{x^3}{3}-\ldots\quad (|x|<1)
$$

**Nützlich in Zustandssummen**
- Bei Produkten/Summen von Beiträgen führt $\ln$ oft zu **Summen**:
  $$
  \ln\prod_i A_i=\sum_i \ln A_i
  $$
- Kleine Fugazität $z=e^{\beta\mu}\ll 1$ (klassisches, nicht-entartetes Gas): $\ln(1+x)$-Entwicklung.

### 2.5 Standardfunktionen & Parameterinterpretation
| Funktionstyp | Form | Parameterbedeutung |
|---|---|---|
| **linear** | $f(x)=mx+b$ | $m$ Steigung, $b$ Achsenabschnitt |
| **quadratisch (Parabel)** | $f(x)=ax^2+bx+c$ | $a$ Öffnung/Skalierung, $b,c$ Lage |
| **Scheitelpunktform** | $f(x)=a(x-h)^2+k$ | Scheitel $(h,k)$, $a$ Öffnung/„Breite“ |
| **rational** | $f(x)=\frac{p(x)}{q(x)}$ | Nullstellen aus $p(x)=0$, Polstellen aus $q(x)=0$ |
| **exponentiell** | $f(x)=A e^{kx}$ | $A$ Skalierung, $k$ Wachstums-/Abklingrate |
| **logarithmisch** | $f(x)=A\ln(x)+B$ | langsames Wachstum; Verschiebung/Skalierung |

**Beispiel: schnelle Grapheninterpretation**
$$
f(x)=a(x-h)^2+k
$$
- Scheitel: $(h,k)$  
- Symmetrieachse: $x=h$  
- $a>0$ nach oben geöffnet, $a<0$ nach unten; $|a|$ größer $\Rightarrow$ schmaler

### 2.6 Zustandssummen, Potentiale, Hamiltonian (Formel-Werkzeugkasten)
**Definitionen**
- Inverse Temperatur: $\beta=\frac{1}{k_B T}$
- **Hamiltonian** (typisch): $H(p,q)=K(p)+V(q)$

**(A) Kanonische Zustandssumme (diskret/quantisiert)**
$$
Z(\beta,V,N)=\sum_{\nu} e^{-\beta E_\nu}
$$
- Wahrscheinlichkeiten:
  $$
  P_\nu=\frac{e^{-\beta E_\nu}}{Z}
  $$

**(B) Kanonische Zustandssumme (kontinuierlich/klassisch, Phasenraum)**
$$
Z_N(\beta,V)=\frac{1}{N!\,h^{3N}}\int d^{3N}q\,d^{3N}p\; e^{-\beta H(p,q)}
$$
Für **ideales Gas** ($V(q)=0$):
$$
H=\sum_{i=1}^N \frac{p_i^2}{2m}
$$

**(C) Freie Energie (Helmholtz)**
$$
F(T,V,N)=-k_B T\ln Z
$$
Nützliche Ableitungen:
$$
U=-\frac{\partial}{\partial \beta}\ln Z,\qquad S=-\left(\frac{\partial F}{\partial T}\right)_{V,N}
$$
Druck:
$$
p=-\left(\frac{\partial F}{\partial V}\right)_{T,N}=k_B T\left(\frac{\partial \ln Z}{\partial V}\right)_{T,N}
$$

**(D) Großkanonische Zustandssumme (Fugazität $z=e^{\beta\mu}$)**
$$
\Xi(\beta,V,\mu)=\sum_{N=0}^{\infty} z^N Z_N(\beta,V)
$$
Großkanonisches Potential:
$$
\Omega(T,V,\mu)=-k_B T\ln \Xi
$$
Teilchenzahl:
$$
\langle N\rangle=z\frac{\partial}{\partial z}\ln \Xi=\frac{1}{\beta}\frac{\partial}{\partial \mu}\ln \Xi
$$

**(E) Zusammenhang „Potentiale aus Zustandssummen“ (Merksätze)**
$$
F=-k_B T\ln Z,\qquad \Omega=-k_B T\ln \Xi,\qquad p=-\frac{\Omega}{V}
$$
Legendre-Transformations-Logik: „passendes Potential“ wählt die natürlichen Variablen.

### 2.7 Typische Hamiltonians (ideal / (Quanten-)Gase) & Potenziale
**Klassisches ideales Gas**
$$
H=\sum_{i=1}^N \frac{p_i^2}{2m}
$$

**Klassisches Gas im äußeren Potential $\Phi(\mathbf{r})$**
$$
H=\sum_{i=1}^N \left[\frac{p_i^2}{2m}+\Phi(\mathbf{r}_i)\right]
$$

**Wechselwirkendes Gas (Paarpotential $u(r)$)**
$$
H=\sum_{i=1}^N \frac{p_i^2}{2m}+\sum_{i<j} u\!\left(|\mathbf{r}_i-\mathbf{r}_j|\right)
$$

**Ideales Quantengas (Einteilchenenergien $\varepsilon_{\mathbf{k}}$)**
- Bosonen/Fermionen im Besetzungszahlbild:
$$
\hat{H}=\sum_{\mathbf{k}} \varepsilon_{\mathbf{k}}\, \hat{n}_{\mathbf{k}},\qquad \hat{n}_{\mathbf{k}}=\hat{a}^\dagger_{\mathbf{k}}\hat{a}_{\mathbf{k}}
$$
mit
$$
\varepsilon_{\mathbf{k}}=\frac{\hbar^2 k^2}{2m}\quad (\text{frei})
$$
- Großkanonisch tritt häufig $\hat{H}-\mu \hat{N}$ auf:
$$
\hat{K}=\hat{H}-\mu \hat{N},\qquad \hat{N}=\sum_{\mathbf{k}}\hat{n}_{\mathbf{k}}
$$
und in Spuren:
$$
\Xi=\mathrm{Tr}\left(e^{-\beta(\hat{H}-\mu \hat{N})}\right)
$$

**Merker (Algebraisch wichtig):** Exponential- und Logarithmusgesetze erlauben das Umschreiben von Produkten über Moden in Summen über $\ln(\cdot)$ und umgekehrt, z. B.
$$
\Xi=\prod_{\mathbf{k}}\Xi_{\mathbf{k}}
\quad\Rightarrow\quad
\ln\Xi=\sum_{\mathbf{k}}\ln \Xi_{\mathbf{k}}
$$

## 3) Geometrie & Trigonometrie: Längen, Flächen, Volumina und Winkelbeziehungen

### Grundbegriffe & Notation
- **Umfang** $U$ (Länge des Randes), **Fläche** $A$, **Volumen** $V$
- **Winkel** in **Grad** $(^\circ)$ oder **Bogenmaß** (Radiant) $(\mathrm{rad})$
- **Rechtwinkliges Dreieck**: Katheten $a,b$, Hypotenuse $c$ (gegenüber dem rechten Winkel)

---

### Ebene Geometrie: Umfang- und Flächenformeln
| Form | Umfang $U$ | Fläche $A$ |
|---|---:|---:|
| **Rechteck** (Seiten $a,b$) | $U=2(a+b)$ | $A=ab$ |
| **Parallelogramm** (Grundseite $a$, Höhe $h_a$) | $U=2(a+b)$ | $A=a\,h_a$ |
| **Dreieck** (Grundseite $g$, Höhe $h$) | $U=a+b+c$ | $A=\frac{1}{2}gh$ |
| **Trapez** (Parallelseiten $a,c$, Höhe $h$) | $U=a+b+c+d$ | $A=\frac{a+c}{2}\,h$ |
| **Kreis** (Radius $r$, Durchmesser $d=2r$) | $U=2\pi r=\pi d$ | $A=\pi r^2$ |

**Kreissektor** (Winkel $\varphi$ im Bogenmaß):
- **Bogenlänge** $$s=r\varphi$$
- **Sektorfläche** $$A_{\text{Sektor}}=\frac{1}{2}r^2\varphi$$

---

### Raumgeometrie: Volumina und Oberflächen
| Körper | Volumen $V$ | Oberfläche $O$ |
|---|---:|---:|
| **Quader** $(a,b,c)$ | $V=abc$ | $O=2(ab+ac+bc)$ |
| **Zylinder** (Radius $r$, Höhe $h$) | $V=\pi r^2h$ | $O=2\pi r^2+2\pi rh$ |
| **Kegel** (Radius $r$, Höhe $h$, Mantellinie $s$) | $V=\frac{1}{3}\pi r^2h$ | $O=\pi r^2+\pi rs$ |
| **Kugel** (Radius $r$) | $V=\frac{4}{3}\pi r^3$ | $O=4\pi r^2$ |

Für den **Kegel**:
$$s=\sqrt{r^2+h^2}$$

---

### Satz des Pythagoras (rechtwinkliges Dreieck)
Für Katheten $a,b$ und Hypotenuse $c$:
$$c^2=a^2+b^2$$

**Typische Anwendungen**
- **Diagonale im Rechteck** $(a,b)$: $$d=\sqrt{a^2+b^2}$$
- **Raumdiagonale im Quader** $(a,b,c)$: $$d=\sqrt{a^2+b^2+c^2}$$

---

### Trigonometrie im rechtwinkligen Dreieck
Sei $\alpha$ ein spitzer Winkel, dann gelten (bezogen auf $\alpha$):

- **Sinus**: $$\sin(\alpha)=\frac{\text{Gegenkathete}}{\text{Hypotenuse}}$$
- **Kosinus**: $$\cos(\alpha)=\frac{\text{Ankathete}}{\text{Hypotenuse}}$$
- **Tangens**: $$\tan(\alpha)=\frac{\text{Gegenkathete}}{\text{Ankathete}}=\frac{\sin(\alpha)}{\cos(\alpha)}$$

Nützliche Umstellungen:
$$\text{Gegenkathete}=c\sin(\alpha),\quad \text{Ankathete}=c\cos(\alpha)$$

---

### Gradmaß und Bogenmaß (Radiant)
Zusammenhang über den Vollkreis:
$$360^\circ = 2\pi\,\mathrm{rad}$$

Umrechnung:
$$\varphi_{\mathrm{rad}}=\varphi_{^\circ}\cdot\frac{\pi}{180^\circ},\qquad
\varphi_{^\circ}=\varphi_{\mathrm{rad}}\cdot\frac{180^\circ}{\pi}$$

---

### Allgemeine Dreiecke: Sinus- und Kosinussatz
Bezeichne Seiten $a,b,c$ gegenüber den Winkeln $\alpha,\beta,\gamma$.

#### Sinussatz
$$\frac{a}{\sin\alpha}=\frac{b}{\sin\beta}=\frac{c}{\sin\gamma}$$
**Einsatz**: wenn ein **Seiten-Winkel-Gegenüber**-Paar bekannt ist (z. B. $a$ und $\alpha$) und eine weitere Seite/Winkel gesucht wird.

#### Kosinussatz
$$c^2=a^2+b^2-2ab\cos(\gamma)$$
Analog:
$$a^2=b^2+c^2-2bc\cos(\alpha),\qquad b^2=a^2+c^2-2ac\cos(\beta)$$

**Einsatz**
- **Seite gesucht** bei zwei Seiten und **eingeschlossenem Winkel** (SAS), z. B. $c$ aus $a,b,\gamma$
- **Winkel gesucht** bei drei Seiten (SSS), z. B.
$$\cos(\gamma)=\frac{a^2+b^2-c^2}{2ab}$$

---

### Beispiele (Formelfokus)
- **Kreis**: $$A=\pi r^2,\qquad U=2\pi r$$
- **Pythagoras (Diagonale)**: $$c=\sqrt{a^2+b^2}$$
- **Kosinussatz** (Seite bei eingeschlossenem Winkel):  
$$c^2=a^2+b^2-2ab\cos(\gamma)$$

---

### Relevante Abbildungen aus dem Skript
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-04_741_1634_427_369.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c3f11257-bac0-4d04-a400-59bbf93443d6/25d076b2-b147-4a3b-9d72-efd9651588eb-07_815_979_1024_237.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3e5e289-2c37-474f-bb8f-e020c06a8c45/0982277a-4da9-4fb1-bc0a-66f7dcfd778b-05_629_1649_1595_116.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/5287657c-ab74-49fd-84ac-c2a222d4fea5/48e43ce3-1a5f-4fd8-a565-44081b4cc6c0-07_622_746_237_290.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/5287657c-ab74-49fd-84ac-c2a222d4fea5/48e43ce3-1a5f-4fd8-a565-44081b4cc6c0-07_682_698_245_1700.jpg)

## 4) Analysis (Differential- & Integralrechnung): Änderungsraten und Flächen

### Differentialrechnung: Ableitung = Momentanänderung / Steigung
- **Definition (Differenzenquotient)**  
  $$f'(x)=\lim_{\Delta x\to 0}\frac{f(x+\Delta x)-f(x)}{\Delta x}$$
- **Interpretation**
  - **Steigung** der Tangente an $y=f(x)$ bei $x$
  - **Momentanänderungsrate** (z. B. $v(t)=s'(t)$, $a(t)=v'(t)=s''(t)$)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c134a79d-211c-48b2-8149-eecc863d2479/0e8667e3-37d6-412b-8e95-93029ab5c7af-06_339_899_607_1965.jpg)

### Standardableitungen (häufig)
| Funktion $f(x)$ | Ableitung $f'(x)$ |
|---|---|
| $x^n$ | $n x^{n-1}$ |
| $e^x$ | $e^x$ |
| $\ln x$ | $\frac{1}{x}$ (für $x>0$), allgemein $\frac{d}{dx}\ln|x|=\frac{1}{x}$ |
| $\sin x$ | $\cos x$ |
| $\cos x$ | $-\sin x$ |

Beispiel (aus Formelsammlung):  
$$(a)\quad \frac{d}{dx}(x^n)=n\,x^{n-1}$$

### Ableitungsregeln (Rechenregeln)
- **Linearität**
  $$\frac{d}{dx}\big(a f(x)+b g(x)\big)=a f'(x)+b g'(x)$$
- **Produktregel**
  $$(fg)'=f'g+fg'$$
- **Quotientenregel**
  $$\left(\frac{f}{g}\right)'=\frac{f'g-fg'}{g^2}\qquad (g\neq 0)$$
- **Kettenregel**
  $$\frac{d}{dx}f(g(x))=f'(g(x))\cdot g'(x)$$

Beispiel (typisch in StatMech/TD):  
$$\frac{d}{dx}\big(x\ln x-x\big)=\ln x$$

### Extremstellen, Monotonie, Krümmung
- **Kritische Stellen / Extremstellen (notwendig)**
  $$f'(x^\*)=0\quad \text{(oder $f'$ nicht definiert)}$$
- **Monotonie**
  - $f'(x)>0$ $\Rightarrow$ streng monoton steigend
  - $f'(x)<0$ $\Rightarrow$ streng monoton fallend
- **2. Ableitung / Krümmung**
  - $f''(x)>0$ $\Rightarrow$ **konvex** (linksgekrümmt)
  - $f''(x)<0$ $\Rightarrow$ **konkav** (rechtsgekrümmt)
- **2.-Ableitungstest (hinreichend, falls $f'(x^\*)=0$)**
  - $f''(x^\*)>0$ Minimum, $f''(x^\*)<0$ Maximum, $f''(x^\*)=0$ unentschieden

### Tangente und Normale
- **Tangente** an $x_0$:
  $$y_T(x)=f(x_0)+f'(x_0)(x-x_0)$$
- **Normale** (falls $f'(x_0)\neq 0$):
  $$y_N(x)=f(x_0)-\frac{1}{f'(x_0)}(x-x_0)$$

---

### Integralrechnung: Stammfunktion, Fläche, aufsummierte Größe
- **Unbestimmtes Integral / Stammfunktion**
  $$\int f(x)\,dx = F(x)+C\quad \text{mit }F'(x)=f(x)$$
- **Bestimmtes Integral**
  $$\int_a^b f(x)\,dx = F(b)-F(a)$$
  Interpretation:
  - **Fläche mit Vorzeichen** zwischen Kurve und $x$-Achse
  - **Aufsummierte Größe** (z. B. Masse, Ladung, Weg, Energie)

### Standardintegrale und Regeln
- **Linearität**
  $$\int \big(a f(x)+b g(x)\big)\,dx=a\int f(x)\,dx+b\int g(x)\,dx$$
- **Potenzregel**
  $$(b)\quad \int x^n\,dx=\frac{x^{n+1}}{n+1}+C\qquad (n\neq -1)$$
- **Logarithmusfall**
  $$(c)\quad \int \frac{1}{x}\,dx=\ln|x|+C$$
- **Substitution (Standardverfahren)**
  - Setze $u=g(x)$, dann $du=g'(x)\,dx$
  $$\int f(g(x))g'(x)\,dx=\int f(u)\,du$$

### Mittelwert einer Funktion
- **Funktionsmittelwert** auf $[a,b]$:
  $$\overline{f}=\frac{1}{b-a}\int_a^b f(x)\,dx$$

---

### Anwendungen in Physik (kurz, formelfokussiert)
- **Weg aus Geschwindigkeit**
  $$s(t)-s(t_0)=\int_{t_0}^{t} v(\tau)\,d\tau$$
- **Arbeit aus Kraft entlang Weg (1D)**
  $$W=\int_{x_1}^{x_2} F(x)\,dx$$
  **Allgemein (Linienintegral):**
  $$W=\int_{\mathcal C}\mathbf F\cdot d\mathbf s$$

---

### Diskret $\leftrightarrow$ kontinuierlich: Zustandssummen, Integrale, Potentiale (Thermo/StatMech)
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c3f11257-bac0-4d04-a400-59bbf93443d6/25d076b2-b147-4a3b-9d72-efd9651588eb-04_820_1470_211_126.jpg)

- **Diskrete Summe $\to$ Integral (Dichte der Zustände)**
  $$\sum_i \;\longrightarrow\; \int d\Gamma\;\rho(\Gamma),\qquad d\Gamma=\frac{d^{3N}q\,d^{3N}p}{N!\,h^{3N}}$$
- **Mikrokanonisch: Zustandszahl**
  $$\Omega(E,V,N,\Delta)=\int_{E-\Delta<H(\Gamma)<E} d\Gamma$$
  Entropie:
  $$S(E,V,N)=k_B\ln\Omega \quad (\text{oder }S=k_B\ln\Phi \text{ je nach Konvention})$$
- **Kanonische Zustandssumme (Partition Function)**
  $$Z(\beta,V,N)=\int d\Gamma\,e^{-\beta H(\Gamma)}$$
  Helmholtz-Potential:
  $$F(T,V,N)=-k_B T\ln Z$$
- **Großkanonische Zustandssumme**
  $$\mathcal Z(\beta,V,\mu)=\sum_{N=0}^\infty \int d\Gamma_N\,e^{-\beta\left(H_N-\mu N\right)}$$
  Großpotential:
  $$J(T,V,\mu)=-k_B T\ln\mathcal Z\qquad \text{und (Gleichgewicht)}\quad J=-pV$$
- **Hamiltonian (Beispiele)**
  - Klassisches ideales Gas:
    $$H(\mathbf q,\mathbf p)=\sum_{i=1}^N \frac{\mathbf p_i^2}{2m}$$
  - Mit Potential $U(\mathbf q)$:
    $$H=\sum_{i=1}^N \frac{\mathbf p_i^2}{2m}+U(\mathbf q)$$
  - Quantengase (Operatorform, schematisch):
    $$\hat H=\sum_k \varepsilon_k \,\hat n_k \;(+\ \text{Wechselwirkungsterm})$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/3471c5fc-fa67-490d-8096-3b119835f77d/6b757ef2-ab76-47ac-9115-bdb64168b6e8-04_429_2420_517_174.jpg)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/3471c5fc-fa67-490d-8096-3b119835f77d/6b757ef2-ab76-47ac-9115-bdb64168b6e8-06_682_1977_1458_258.jpg)

- **Nützliche Ableitungen der Potentiale (Bezug Analysis)**
  $$E=-\frac{\partial}{\partial\beta}\ln Z,\qquad \langle N\rangle=\frac{\partial}{\partial(\beta\mu)}\ln\mathcal Z,\qquad p=\frac{1}{\beta}\frac{\partial}{\partial V}\ln Z$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/bfd41859-8c82-4eb1-9147-efa039676633/6398403a-787a-4b31-9062-a9b7ea039cc3-17_825_1490_243_787.jpg)

## 5) Physik & Statistik: häufige Formelsammlungen und typische Anwendungen

### 5.1 Physik (Mechanik-Grundformeln)

#### Kinematik (geradlinig, konstante Beschleunigung)
- **Grundgrößen & Einheiten**:  
  $s\,[\mathrm{m}]$, $v\,[\mathrm{m\,s^{-1}}]$, $a\,[\mathrm{m\,s^{-2}}]$, $t\,[\mathrm{s}]$
- **Gleichförmige Bewegung**:
  $$s=v\,t$$
- **Gleichmäßig beschleunigt**:
  $$v=v_0+a\,t$$
  $$s=s_0+v_0 t+\frac12 a t^2$$
- **Spezialfall „Start aus Ruhe“** ($v_0=0$, oft auch $s_0=0$):
  $$v=a\,t,\qquad s=\frac12 a t^2$$
- **Einsatzgrenze**: nur für **konstantes** $a$ (bzw. stückweise konstant).

#### Newtonsche Gesetze
- **2. Newton (Kraftgesetz)**:
  $$\vec F=m\,\vec a$$
  Einheiten: $F\,[\mathrm{N}=\mathrm{kg\,m\,s^{-2}}]$, $m\,[\mathrm{kg}]$
- **Impulsform** (nützlich bei Stoßproblemen):
  $$\vec p=m\,\vec v,\qquad \vec F=\frac{\mathrm d \vec p}{\mathrm dt}$$
- **Einsatzgrenze**: klassisch (nicht-relativistisch), Inertialsysteme.

#### Arbeit, Leistung, Energie
- **Arbeit** (konstante Kraft parallel zum Weg):
  $$W=F\,s$$
  Allgemein:
  $$W=\int \vec F\cdot \mathrm d\vec s$$
  Einheit: $W\,[\mathrm{J}=\mathrm{N\,m}]$
- **Leistung**:
  $$P=\frac{W}{t}$$
  Umgestellt (Beispiel (a)):
  $$W=P\,t$$
  Einheit: $P\,[\mathrm{W}=\mathrm{J\,s^{-1}}]$
- **Kinetische Energie**:
  $$E_\mathrm{kin}=\frac12 m v^2$$
- **Potentielle Energie** (nahe Erdoberfläche, konstantes $g$):
  $$E_\mathrm{pot}=m g h$$
  mit $g\approx 9{,}81\,\mathrm{m\,s^{-2}}$, $h\,[\mathrm{m}]$
- **Einsatzgrenze**: $E_\mathrm{pot}=mgh$ gilt für **homogenes** Schwerefeld (kleine Höhenänderungen).

#### Dichte und Druck
- **Dichte**:
  $$\rho=\frac{m}{V}$$
  Einheit: $\rho\,[\mathrm{kg\,m^{-3}}]$
- **Druck**:
  $$p=\frac{F}{A}$$
  Einheit: $p\,[\mathrm{Pa}=\mathrm{N\,m^{-2}}]$

---

### 5.2 Statistische Physik (Zustandssummen, Potentiale, Hamiltonian)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-04_741_1634_427_369.jpg)

#### Ensembles & Zustandssummen (diskret/kontinuierlich)
- **Mikrokanonisch** $(E,V,N)$  
  Zustandszahl (zugängliche Mikrozustände im Energiefenster):
  $$\Omega(E,V,N)=\sum_i \mathbf 1_{E\le E_i < E+\Delta E}$$
  kontinuierlich (mit Phasenraummaß):
  $$\Omega(E)=\frac{1}{N!\,h^{3N}}\int \mathrm d^{3N}q\,\mathrm d^{3N}p\;\delta\!\big(E-H(\mathbf p,\mathbf q)\big)$$
- **Kanonisch** $(T,V,N)$  
  Zustandssumme:
  $$Z(T,V,N)=\sum_i e^{-\beta E_i},\qquad \beta=\frac{1}{k_\mathrm B T}$$
  kontinuierlich:
  $$Z=\frac{1}{N!\,h^{3N}}\int \mathrm d^{3N}q\,\mathrm d^{3N}p\;e^{-\beta H(\mathbf p,\mathbf q)}$$
- **Großkanonisch** $(T,V,\mu)$  
  großkanonische Zustandssumme:
  $$\Xi(T,V,\mu)=\sum_{N=0}^{\infty}\sum_i e^{-\beta(E_{i,N}-\mu N)}=\sum_{N=0}^{\infty} e^{\beta\mu N} Z_N(T,V)$$
  Fugazität: $z=e^{\beta\mu}$.

#### Thermodynamische Potentiale aus Zustandssummen
- **Entropie (mikrokanonisch)**:
  $$S(E,V,N)=k_\mathrm B \ln \Omega(E,V,N)$$
- **Helmholtz-Freie Energie (kanonisch)**:
  $$F(T,V,N)=-k_\mathrm B T\ln Z$$
- **Großkanonisches Potential (Landau-/Großpotential)**:
  $$\Phi_G(T,V,\mu)=-k_\mathrm B T\ln \Xi$$
  Beziehung zum Druck:
  $$\Phi_G=-pV\quad (\text{für homogene Systeme})$$

#### Mittelwerte (kanonisch/großkanonisch)
- **Energie**:
  $$\langle E\rangle=-\frac{\partial}{\partial \beta}\ln Z$$
- **Teilchenzahl (großkanonisch)**:
  $$\langle N\rangle=\frac{1}{\beta}\frac{\partial}{\partial \mu}\ln \Xi = z\frac{\partial}{\partial z}\ln \Xi$$
- **Energie (großkanonisch)**:
  $$\langle E\rangle=-\frac{\partial}{\partial \beta}\ln \Xi+\mu\langle N\rangle$$

#### Hamiltonian $H$ und zugehörige Potentiale
- **Allgemein (klassisch, $N$ Teilchen)**:
  $$H(\mathbf p,\mathbf q)=\sum_{i=1}^{N}\frac{\mathbf p_i^2}{2m}+U(\mathbf q_1,\dots,\mathbf q_N)$$
  - **Potentialenergie** $U$ bestimmt Wechselwirkungen $\Rightarrow$ beeinflusst $Z,\Xi$ und damit $F,\Phi_G,\dots$
- **Ideales (klassisches) Gas** ($U=0$):
  $$H=\sum_{i=1}^{N}\frac{\mathbf p_i^2}{2m}$$
  Kanonisch faktorisierbar:
  $$Z_N=\frac{1}{N!}\left(\frac{V}{\lambda_T^3}\right)^N,\qquad \lambda_T=\frac{h}{\sqrt{2\pi m k_\mathrm B T}}$$

#### Quantenstatistik: Besetzungszahlen (MB/FD/BE)
![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/60c721e6-dd61-42a3-a112-9c1aed895f5a/ee7e44a7-39e3-4e5a-b2f8-4915a9769c0c-03_379_753_659_367.jpg)

- **Mittlere Besetzung eines Einteilchenzustands** (Energie $\varepsilon$):
  - **Fermi–Dirac**:
    $$\bar n(\varepsilon)=\frac{1}{e^{\beta(\varepsilon-\mu)}+1}$$
  - **Bose–Einstein**:
    $$\bar n(\varepsilon)=\frac{1}{e^{\beta(\varepsilon-\mu)}-1}$$
  - **Maxwell–Boltzmann** (klassischer Grenzfall, $\bar n\ll 1$):
    $$\bar n(\varepsilon)\approx e^{-\beta(\varepsilon-\mu)}$$
- **Großkanonischer Formalismus** (Nichtwechselwirkende Quantengase, Einteilchenenergien $\varepsilon_k$):
  - Fermionen:
    $$\ln\Xi=\sum_k \ln\!\left(1+z e^{-\beta\varepsilon_k}\right)$$
  - Bosonen:
    $$\ln\Xi=-\sum_k \ln\!\left(1-z e^{-\beta\varepsilon_k}\right)$$

---

### 5.3 Statistik (Lage, Streuung, Korrelation, Regression, Wahrscheinlichkeit)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/5287657c-ab74-49fd-84ac-c2a222d4fea5/48e43ce3-1a5f-4fd8-a565-44081b4cc6c0-07_573_2426_1498_463.jpg)

#### Lage- und Streuungsmaße (Stichprobe $x_1,\dots,x_n$)
- **Mittelwert**:
  $$\bar x=\frac{1}{n}\sum_{i=1}^{n}x_i$$
- **Median**: mittlerer Wert der sortierten Daten (robust gegen Ausreißer).
- **Varianz**:
  - **Population**:
    $$\mathrm{Var}(X)=\mathbb E[(X-\mu)^2]=\mathbb E[X^2]-\mu^2$$
  - **Stichprobe (unverzerrt)**:
    $$s^2=\frac{1}{n-1}\sum_{i=1}^{n}(x_i-\bar x)^2$$
  Beispiel (b) (Streuung als „mittlere quadratische Abweichung“):
  $$\sigma=\sqrt{\mathrm{Var}},\qquad s=\sqrt{s^2}$$
- **Einheiten**: $\bar x$ wie $x$, Varianz in $[x]^2$, Standardabweichung in $[x]$.

#### Pearson-Korrelation (linearer Zusammenhang)
- **Kovarianz**:
  $$\mathrm{Cov}(X,Y)=\mathbb E[(X-\mu_X)(Y-\mu_Y)]$$
- **Pearson $r$ (Stichprobe)**:
  $$r=\frac{\sum_{i=1}^n(x_i-\bar x)(y_i-\bar y)}{\sqrt{\sum_{i=1}^n(x_i-\bar x)^2}\sqrt{\sum_{i=1}^n(y_i-\bar y)^2}}$$
- **Interpretation**: $r\in[-1,1]$, dimensionslos; misst **nur lineare** Abhängigkeit.

#### Einfache lineare Regression
- Modell:
  $$y=\beta_0+\beta_1 x+\varepsilon$$
- OLS-Schätzer:
  $$\hat\beta_1=\frac{\sum_{i}(x_i-\bar x)(y_i-\bar y)}{\sum_{i}(x_i-\bar x)^2},\qquad \hat\beta_0=\bar y-\hat\beta_1\bar x$$
- Zusammenhang zu Korrelation:
  $$\hat\beta_1=r\,\frac{s_y}{s_x}$$

#### Grundregeln der Wahrscheinlichkeit
- **Additionsregel**:
  $$P(A\cup B)=P(A)+P(B)-P(A\cap B)$$
  Falls disjunkt: $P(A\cap B)=0 \Rightarrow P(A\cup B)=P(A)+P(B)$.
- **Multiplikationsregel / bedingte Wahrscheinlichkeit**:
  $$P(A\cap B)=P(A\mid B)\,P(B)=P(B\mid A)\,P(A)$$
  $$P(A\mid B)=\frac{P(A\cap B)}{P(B)}\quad (P(B)>0)$$
- **Bayes (Beispiel (c), Update von Wahrscheinlichkeiten)**:
  $$P(A\mid B)=\frac{P(B\mid A)\,P(A)}{P(B)}$$
  mit
  $$P(B)=\sum_i P(B\mid A_i)\,P(A_i)\quad \text{(Partition } \{A_i\}\text{)}$$

---

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-13_586_1057_112_1647.jpg)

---

## Quick Reference: Key Formulas

### Thermodynamik: Hauptsätze, Fundamentalrelation, Wirkungsgrad
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| 1. Hauptsatz (Energieerhaltung) | $$\mathrm{d}E=\delta Q+\delta W$$ | $E$: innere Energie; $\delta Q$: zu-/abgeführte Wärme (Prozessgröße); $\delta W$: verrichtete Arbeit (Prozessgröße) |
| Fundamentalgleichung / Fundamentalrelation (für $E$) | $$\mathrm{d}E=T\,\mathrm{d}S-p\,\mathrm{d}V+\mu\,\mathrm{d}N$$ | $T$: Temperatur; $S$: Entropie; $p$: Druck; $V$: Volumen; $\mu$: chemisches Potential; $N$: Teilchenzahl |
| Wirkungsgrad eines Kreisprozesses | $$\eta=\frac{W_{\mathrm{nuz}}}{Q_{\mathrm{zu}}}$$ | $\eta$: Wirkungsgrad; $W_{\mathrm{nuz}}$: Nutzarbeit; $Q_{\mathrm{zu}}$: zugeführte Wärme |
| 2. Hauptsatz (Clausius-Ungleichung) | $$\mathrm{d}S\ge \frac{\delta Q}{T}$$ | $S$: Entropie; $\delta Q$: Wärme; $T$: Temperatur (Gleichheit im reversiblen Fall) |

---

### Kritische Phänomene / Kritische Exponenten
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Skalierung der spezifischen Volumina nahe Kritikalität (Proportionalität) | $$v_{\mathrm{g}}-v_{\mathrm{f}} \propto \left(T_{\mathrm{krit}}-T\right)^{\frac{1}{2}}$$ | $v_{\mathrm{g}}$: spezifisches Volumen Gasphase; $v_{\mathrm{f}}$: spezifisches Volumen Flüssigkeitsphase; $T_{\mathrm{krit}}$: kritische Temperatur; $T$: Temperatur |

---

### Quantenmechanik: Viele-Teilchen-Schrödingergleichung
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Wellenfunktion eines $N$-Teilchen-Systems | $$\Psi(t)\equiv \Psi\!\left(t,\vec{x}_1,\vec{x}_2,\ldots,\vec{x}_N\right)$$ | $\Psi$: Wellenfunktion; $t$: Zeit; $\vec{x}_i$: Koordinate des $i$-ten Teilchens; $N$: Teilchenzahl |
| Zeitabhängige Schrödingergleichung (mit externem Potential und Wechselwirkung) | $$i\hbar\,\frac{\partial}{\partial t}\Psi(t)=\left[\sum_i-\frac{\hbar^2}{2m}\,\vec{\nabla}_i^{\,2}+V(\vec{x}_i)+\frac12\sum_{i\ne j}U_{ij}\!\left(\{\vec{x}_i\}\right)\right]\Psi(t)$$ | $\hbar$: reduz. Planck-Konstante; $m$: Masse; $\vec{\nabla}_i^{\,2}$: Laplace-Operator bzgl. $\vec{x}_i$; $V$: externes Potential; $U_{ij}$: Wechselwirkung; $i,j$: Teilchenindizes |

---

### Quantenstatistik / Integrale, Reihen, Gammafunktion (Fermi-artige Integrale)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Integral-zu-Reihen-Entwicklung | $$\int_{0}^{\infty}\frac{y^{\alpha-1}}{\left(e^{y}/z\right)+1}\,\mathrm{d}y=\sum_{n=1}^{\infty}(-1)^{n+1}z^{n}\int_{0}^{\infty}\mathrm{d}y\,y^{\alpha-1}e^{-yn}$$ | $\alpha$: Parameter; $z$: Fugazität/Parameter; $y$: Integrationsvariable; $n$: Summationsindex |
| Substitution (wie im Material angegeben) | $$x=yn$$ | $x,y$: Variablen; $n$: Summationsindex |
| Ergebnis mit Potenzreihe in $n$ | $$\sum_{n=1}^{\infty}(-1)^{n+1}z^{n}\int_{0}^{\infty}\mathrm{d}y\,y^{\alpha-1}e^{-yn}=\sum_{n=1}^{\infty}(-1)^{n+1}\frac{z^{n}}{n^{\alpha}}\int_{0}^{\infty}\mathrm{d}x\,x^{\alpha-1}e^{-x}$$ | $z,\alpha,n$ wie oben; $x$: neue Integrationsvariable |
| Definition der Gammafunktion (Integralform) | $$\int_{0}^{\infty}\mathrm{d}x\,x^{\alpha-1}e^{-x}=\Gamma(\alpha)$$ | $\Gamma(\alpha)$: Gammafunktion; $\alpha$: Parameter |
| Endform (Gammafaktor mal Reihe) | $$\int_{0}^{\infty}\frac{y^{\alpha-1}}{\left(e^{y}/z\right)+1}\,\mathrm{d}y=\Gamma(\alpha)\sum_{n=1}^{\infty}(-1)^{n+1}\frac{z^{n}}{n^{\alpha}}$$ | $\Gamma(\alpha)$: Gammafunktion; $z$: Parameter; $\alpha$: Parameter; $n$: Summationsindex |

---

### Statistik / Grenzwertsätze / Verteilungen (Schwankungen, Mittelwert, Varianz)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Relative Schwankungen skalieren wie $1/\sqrt{N}$ | $$\sim \frac{1}{\sqrt{N}}$$ | $N$: Teilchenzahl/Anzahl unabhängiger Beiträge; Ausdruck beschreibt typische relative Fluktuationsgröße |
| Relative Energieabweichung im thermodynamischen Limes | $$\frac{\Delta E}{\langle E\rangle}\propto \frac{1}{\sqrt{N}}$$ | $\Delta E$: Energieschwankung; $\langle E\rangle$: mittlere Energie; $N$: Systemgröße/Teilchenzahl |
| Binomialfaktoren (Fragment aus Binomialverteilung) | $$n!(N-n)!$$ | $N$: Anzahl Versuche; $n$: Anzahl „Erfolge“ (tritt als Faktor im Nenner von $\binom{N}{n}$ auf) |
| Binomialgewichte für $p=0{,}5$ (Fragment) | $$0.5^{n}\,0.5^{(N-n)}$$ | $p=0{,}5$: Erfolgswahrscheinlichkeit; $n$: Erfolge; $N$: Versuche |
| Erwartungswert (für $p=0{,}5$ im Kontext genannt) | $$\mu=\frac{N}{2}$$ | $\mu$: Mittelwert; $N$: Anzahl Versuche |
| (So notiert) „Sigma“-Ausdruck über Abweichungen | $$\sigma=\sum_{n} P\cdot(n-\mu)$$ | $\sigma$: hier so im Material angegeben; $P$: Wahrscheinlichkeit (zu $n$); $n$: Zufallsvariable; $\mu$: Mittelwert |
