# Thermodynamik – strukturierte Lernnotizen von Grundlagen bis statistischer Fundierung

## 1) Gegenstand der Thermodynamik und Zustandsbeschreibung makroskopischer Systeme

### Was behandelt die Thermodynamik?
**Thermodynamik** ist eine **phänomenologische** Theorie: Sie beschreibt **Gleichgewichtszustände** makroskopischer Systeme und **Übergänge** zwischen solchen Zuständen, ohne die Bewegung jedes einzelnen Teilchens zu verfolgen.

- Betrachtete Systeme: Gase, Flüssigkeiten, Festkörper, Mischungen, Strahlung im Hohlraum, …
- Zentral: **Energieaustausch** (Wärme), **Arbeit**, **Stoffaustausch**, **Entropie** und **Temperatur**
- Ziel: einfache, messbare Beziehungen zwischen wenigen **makroskopischen Zustandsgrößen**

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/e0652a01-6a7d-4bd0-aaa0-a9a028111ae4/57621203-6e11-4798-9404-9f79b747bcea-04_741_1634_427_369.jpg)

---

### Warum „makroskopisch“? (Motivation)
Für Systeme mit $N \gg 1$ (typisch $N\sim 10^{23}$) ist eine mikroskopische Beschreibung praktisch und konzeptionell unpassend:

- **Zu viele Freiheitsgrade**: In der klassischen Mechanik bräuchte man (grob) $\sim 6N$ Variablen plus Wechselwirkungen.
- **Messbar sind makroskopische Mittelwerte**: Druck, Temperatur, Volumen usw. sind robust gegen mikroskopische Details.
- **Gleichgewicht**: Im Gleichgewicht verschwinden viele „Details“; der Zustand wird durch wenige Größen vollständig charakterisiert.

> Kerngedanke: **Viele Mikrozustände** entsprechen **demselben Makrozustand**; Thermodynamik arbeitet direkt auf der Ebene dieser Makrozustände.

Als anschauliches Modell (Teilchen in zwei Teilvolumina) zeigt sich: es gibt extrem viele mögliche Konfigurationen—aber makroskopisch relevante Größen sind stabil/typisch.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c134a79d-211c-48b2-8149-eecc863d2479/0e8667e3-37d6-412b-8e95-93029ab5c7af-03_440_925_221_158.jpg)

---

### Zustandsgrößen vs. Prozessgrößen
**Zustandsgrößen** hängen nur vom Zustand ab, nicht davon, *wie* man ihn erreicht hat (**wegunabhängig**). Mathematisch sind ihre Differentiale **total**.

**Prozessgrößen** beschreiben Austausch *während* eines Prozesses; sie sind **wegabhängig** und i. A. **keine totalen Differentiale**.

| Kategorie | Typische Größen | Notation | Merksatz |
|---|---|---|---|
| **Zustandsgrößen** | $U$ (innere Energie), $S$ (Entropie), $T$, $p$, $V$, $N$ | $dU,\, dS,\dots$ | hängt nur von Anfang/Ende ab |
| **Prozessgrößen** | Wärme, Arbeit | $\delta Q,\ \delta W$ | hängt vom *Weg* ab |

**Erster Hauptsatz (als Formelsprache für Austausch):**
$$
dU=\delta Q+\delta W
$$
(Das Vorzeichen von $\delta W$ ist konventionsabhängig; wichtig ist: **Wärme/Arbeit sind Prozessgrößen**.)

---

### Zustandsbeschreibung: wenige Variablen genügen
Ein Gleichgewichtszustand wird durch eine geeignete Menge unabhängiger Zustandsgrößen beschrieben, z. B.
- $(p,V,T,N)$ für ein einfaches kompressibles System (nicht alle unabhängig)
- Alternativ: $(S,V,N)$ als „natürliche“ Variablen der inneren Energie

**Fundamentale thermodynamische Relation (für einfache Systeme):**
$$
dU = T\,dS - p\,dV + \mu\,dN
$$
- macht deutlich, welche Größen „zusammengehören“ (Intensiv/Extensiv)
- $\mu$ ist das **chemische Potential** (relevant bei Stoffaustausch)

---

### Intensiv vs. extensiv (Struktur der Zustandsgrößen)
- **Extensiv**: skaliert mit Systemgröße (additiv)  
  $U,\ S,\ V,\ N$
- **Intensiv**: unabhängig von Systemgröße (gleich in homogenen Teilsystemen im Gleichgewicht)  
  $T,\ p,\ \mu$

Diese Trennung ist wichtig, weil Gleichgewicht häufig über **Gleichheit intensiver Größen** charakterisiert wird (z. B. gleiche Temperatur im Wärmekontakt).

---

### Prototyp: ideales Gas (Zustandsgleichung)
Das ideale Gas ist das Standardbeispiel, weil es eine einfache **Zustandsgleichung** besitzt:
$$
pV = N k_B T
$$

Ergänzend (kalorische Zustandsgleichung, monoatomar):
$$
U = \frac{3}{2} N k_B T
$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c134a79d-211c-48b2-8149-eecc863d2479/0e8667e3-37d6-412b-8e95-93029ab5c7af-13_524_2622_845_147.jpg)

**Warum ist das wichtig?**
- Eine **Zustandsgleichung** reduziert die Zahl unabhängiger Variablen: Kennt man z. B. $p,V,N$, ist $T$ festgelegt.
- Thermodynamik arbeitet typischerweise mit solchen Relationen (für reale Stoffe: komplizierter, aber gleiches Prinzip).

---

### Prozesse: quasistatisch, reversibel, irreversibel
Thermodynamische Gesetze werden am klarsten formuliert, wenn man Prozesse in Klassen einteilt:

#### Quasistatischer Prozess
- läuft so langsam, dass das System **zu jedem Zeitpunkt nahe am Gleichgewicht** ist
- kann als Kurve durch Gleichgewichtszustände im Zustandsraum beschrieben werden  
  (z. B. im $p$-$V$-Diagramm)

#### Reversibler Prozess
- idealisierte Grenzklasse: Prozess lässt sich durch infinitesimale Änderung der äußeren Bedingungen **umkehren**, ohne Netto-Entropieproduktion
- dient als Referenz für maximale Arbeit/ideale Wirkungsgrade

#### Irreversibler Prozess
- realer Standardfall (Reibung, endliche Temperaturdifferenzen, freie Expansion, Mischung, …)
- erzeugt Entropie; nicht vollständig umkehrbar

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3e5e289-2c37-474f-bb8f-e020c06a8c45/0982277a-4da9-4fb1-bc0a-66f7dcfd778b-12_524_1385_1267_348.jpg)

**Merke:**  
- *quasistatisch* $\Rightarrow$ „immer Gleichgewicht“, aber nicht automatisch reversibel (Reibung kann trotzdem da sein).  
- *reversibel* $\Rightarrow$ quasistatisch **und** ohne dissipative Effekte.

---

### Einordnung: System, Umgebung, Reservoir
Für Prozesse unterscheidet man häufig:
- **System** (was untersucht wird)
- **Umgebung** (Rest der Welt)
- **Reservoir** (ideal groß, bleibt praktisch bei konstanter Zustandsgröße, z. B. konstantes $T$)

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c134a79d-211c-48b2-8149-eecc863d2479/0e8667e3-37d6-412b-8e95-93029ab5c7af-12_503_846_538_1764.jpg)

Das liefert den Rahmen, um Energie- und Wärmeströme sauber zu bilanzieren und später Kreisprozesse (Maschinen/Wärmepumpen) zu verstehen.

## 2) Temperaturbegriff und 1. Hauptsatz (Energieerhaltung, Wärme und Arbeit)

### Temperatur als Zustandsgröße (0. Hauptsatz als Grundlage)
- **0. Hauptsatz (Transitivität des thermischen Gleichgewichts):**  
  Sind $A$ und $B$ im thermischen Gleichgewicht und $B$ und $C$ ebenfalls, dann sind auch $A$ und $C$ im Gleichgewicht.  
  ⇒ Es gibt eine **Zustandsgröße Temperatur $T$**, deren **Gleichheit** thermisches Gleichgewicht kennzeichnet.
- **Kerngedanke:** Temperatur misst nicht „Wärmemenge“, sondern ist die Größe, die die **Richtung** spontanen Wärmeaustauschs festlegt: Wärme fließt spontan von **hohem $T$** nach **niedrigem $T$**.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3e5e289-2c37-474f-bb8f-e020c06a8c45/0982277a-4da9-4fb1-bc0a-66f7dcfd778b-15_638_1194_785_213.jpg)

---

### Absolute Temperaturskala (Kelvin) und absoluter Nullpunkt
- **Celsius vs. Kelvin:**
  - Celsius ist relativ zu Wasser-Fixpunkten definiert.
  - **Kelvin-Skala** ist **absolut** (keine willkürliche Verschiebung), in Thermodynamik die natürliche Skala.
- Zusammenhang:
  $$T[\mathrm{K}] = \vartheta[^\circ\mathrm{C}] + 273{,}15$$
- **Absoluter Nullpunkt:** $T=0\,\mathrm{K}$ ist die untere Grenze; klassisch-thermodynamisch: ein Grenzpunkt, der **nicht in endlich vielen Schritten erreichbar** ist (Verbindung zum 3. Hauptsatz).  
- **Wichtig für später:** Viele Beziehungen (z.B. Wirkungsgrade, Gleichgewichtsbedingungen) funktionieren nur korrekt mit **absoluter Temperatur $T$ in Kelvin**.

---

### Zustandsgrößen vs. Prozessgrößen (Wegabhängigkeit)
- **Zustandsgrößen** hängen nur von Zustand (Anfang/Ende) ab: $U,\,p,\,V,\,T$  
  ⇒ Differential ist **vollständig**: $dU$.
- **Prozessgrößen** sind *Energieübertragungsarten* und hängen vom Weg ab:
  - Wärme $\delta Q$
  - Arbeit $\delta W$  
  ⇒ Differential ist **unvollständig**: $\delta Q$, $\delta W$.  
- Sprachtest: Man spricht vom „**Volumen** eines Systems“, aber nicht von der „**Arbeit** eines Systems“ (Arbeit wird **verrichtet/zugeführt**).

---

### 1. Hauptsatz als Bilanzgleichung (Energieerhaltung)
- **Aussage:** Die Änderung der **inneren Energie $U$** eines geschlossenen Systems entsteht durch **Wärme** und **Arbeit** über die Systemgrenze.
- **Bilanzform (hier verwendete Konvention, wie oft in Physik):**
  $$dU=\delta Q+\delta W$$
  - $\delta Q>0$: **Wärme wird dem System zugeführt**
  - $\delta W>0$: **Arbeit wird am System verrichtet** (Energiezufuhr durch Arbeit)
- Alternative (in manchen Ingenieur-Konventionen): $dU=\delta Q-\delta W_\text{vom System}$; wichtig ist **Konsistenz**.

#### Physikalische Bedeutung: „Wärme ist Energie“ (R. Mayer)
- **Wärme** ist keine „Stoffmenge“, sondern eine **Form der Energieübertragung** (genau wie Arbeit).  
- Daher kann mechanische Arbeit vollständig in Wärme bzw. innere Energie übergehen (z.B. Reibung, Rühren).

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c134a79d-211c-48b2-8149-eecc863d2479/0e8667e3-37d6-412b-8e95-93029ab5c7af-20_677_1348_285_158.jpg)

---

### Mechanische Volumenarbeit: Kolbenarbeit $p\,dV$
- Für ein Gas im Zylinder mit Kolben (quasistatisch, äußeres $p$ passend):
  $$\delta W = -p\,dV \quad \text{(Arbeit am System)}$$
  - **Expansion**: $dV>0 \Rightarrow \delta W<0$  
    (System verrichtet Arbeit nach außen, seine $U$ sinkt ohne Wärme ggf.)
  - **Kompression**: $dV<0 \Rightarrow \delta W>0$  
    (von außen wird Arbeit zugeführt, $U$ steigt)
- Im $p$-$V$-Diagramm ist die **Nettoarbeit** über einen Prozess:
  $$W=\int \delta W = -\int p\,dV$$
  ⇒ Betrag entspricht der **Fläche unter der Kurve** (Vorzeichen über Richtung).

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3e5e289-2c37-474f-bb8f-e020c06a8c45/0982277a-4da9-4fb1-bc0a-66f7dcfd778b-01_1512_2552_575_396.jpg)

---

### Anwendung des 1. Hauptsatz auf einfache Prozesse (Idee + wichtigste Formeln)
Im Folgenden: geschlossenes System, nur $pV$-Arbeit, keine chemische Arbeit etc.

| Prozess | Bedingung | Konsequenz aus $dU=\delta Q+\delta W$ | Merksatz |
|---|---:|---|---|
| **Isochor** | $dV=0$ | $\delta W=-p\,dV=0 \Rightarrow dU=\delta Q$ | Bei festem Volumen geht Wärme direkt in $U$ |
| **Isotherm** (ideales Gas) | $dT=0$ | Für ideales Gas $dU=dU(T)=0 \Rightarrow \delta Q=-\delta W$ | Zugeführte Wärme wird komplett zu Arbeit (bzw. umgekehrt) |
| **Isobar** | $dp=0$ | $\delta W=-p\,dV$, $dU=\delta Q-p\,dV$ | Wärme teilt sich in $U$-Änderung und Volumenarbeit |
| **Adiabatisch** | $\delta Q=0$ | $dU=\delta W=-p\,dV$ | Änderung von $U$ kommt nur durch Arbeit |

**Wichtige Verbindung:**  
- Isochor: *keine* mechanische Energieabgabe/aufnahme über Volumenänderung.  
- Adiabatisch: *kein* Wärmeaustausch; Temperatur kann sich trotzdem ändern (durch Kompression/Expansion).

---

### Anschauliche Beispiele
#### Joule’sches Experiment (mechanische Arbeit → innere Energie/Wärme)
- In einem thermisch isolierten Gefäß wird durch Rühren (Reibung) **mechanische Arbeit** eingebracht.
- Da $\delta Q=0$ (adiabatisch), folgt direkt:
  $$\Delta U = W \quad (\text{hier: } W>0 \text{ Arbeit am System})$$
- Interpretation: Die zugeführte Arbeit erscheint als Zunahme der inneren Energie (Temperaturanstieg).  
  ⇒ Untermauert den Energiecharakter von Wärme/innerer Energie.

#### Kolben mit Gewicht (Vorzeichen verstehen)
- Gas unter einem Kolben hebt bei Expansion ein Gewicht: Das Gas gibt Energie als Arbeit ab.  
- Mit $\delta W=-p\,dV$ ist bei Expansion $\delta W<0$; damit muss (ohne Wärme) $dU<0$ gelten ⇒ Gas kühlt (adiabatisch).

---

### Mini-Checkliste (typische Klausurfallen)
- **$U$ ist Zustandsgröße**, $Q$ und $W$ sind **wegabhängig**.  
- **Vorzeichenkonvention sauber festlegen** (hier: $dU=\delta Q+\delta W$ und $\delta W=-p\,dV$).  
- **Kelvin verwenden** für absolute Aussagen (z.B. Effizienzgrenzen, Temperaturverhältnisse).

## 3) 2. Hauptsatz und Entropie: Irreversibilität, Clausius-Formulierung und Zustandsfunktion

### 3.1 Kernaussage: Irreversibilität als Prinzip
Der **2. Hauptsatz** bringt eine zusätzliche Naturgesetzlichkeit über die reine Energieerhaltung (1. HS) hinaus: **Nicht jeder energetisch erlaubte Prozess läuft spontan ab**. Es gibt eine bevorzugte Richtung („spontan“), die mit **Irreversibilität** zusammenhängt.

- **Reversibler Prozess**: idealisiert, quasistatisch, ohne dissipative Effekte (keine Reibung, keine endlichen Temperaturdifferenzen beim Wärmeaustausch). Durch infinitesimale Änderung der Randbedingungen umkehrbar, **ohne** dass „Spuren“ in der Umgebung bleiben.
- **Irreversibler Prozess**: realistisch; dissipativ (Reibung, Wärmeleitung über endliches $\Delta T$, Mischung, freie Expansion). Umkehrung erfordert zusätzliche Änderungen in Umgebung → „Spuren“ bleiben.

### 3.2 Clausius-Formulierung und Kelvin-Planck (äquivalent)
Zwei klassische Formulierungen (inhaltlich äquivalent):

- **Clausius**: *Wärme fließt nicht von selbst von kalt nach warm.*  
  Spontan gilt: Wärmestrom von **warm** $\to$ **kalt**.
- **Kelvin-Planck**: *Keine periodisch arbeitende Maschine kann als einzigen Effekt Wärme aus **einem** Reservoir vollständig in Arbeit umwandeln.*

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3e5e289-2c37-474f-bb8f-e020c06a8c45/0982277a-4da9-4fb1-bc0a-66f7dcfd778b-12_524_1385_1267_348.jpg)

**Wichtige Konsequenz**: Eine Wärmekraftmaschine braucht immer **mindestens zwei Reservoirs** (heiß/kalt); es gibt immer Abwärme.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/9c30fad5-c8b6-433f-86a0-2f681028c6ad/4028e0a2-efec-4c96-959b-5032026f3a45-02_566_830_486_1859.jpg)

---

### 3.3 Entropie nach Clausius: Zustandsfunktion aus reversibler Wärme
**Wärme $\delta Q$** ist eine **Prozessgröße** (kein totales Differential). Clausius’ Idee: Es gibt einen **integrierenden Faktor** $1/T$, der aus $\delta Q$ eine Zustandsänderung macht.

- **Definition der Entropie $S$** über reversiblen Wärmeaustausch:
  $$dS=\frac{\delta Q_{\mathrm{rev}}}{T}$$
  Damit ist $S$ eine **Zustandsgröße**: $\Delta S$ hängt nur von Anfangs- und Endzustand ab.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3e5e289-2c37-474f-bb8f-e020c06a8c45/0982277a-4da9-4fb1-bc0a-66f7dcfd778b-10_519_1881_892_861.jpg)

- Für endliche Änderungen (beliebiger Weg), berechnet man $\Delta S$ oft über einen **gedachten reversiblen Pfad** zwischen denselben Zuständen:
  $$\Delta S=\int_{\text{rev}} \frac{\delta Q}{T}$$

**Interpretation**: $T$ fungiert als „integrierender Faktor“, der die Wegabhängigkeit von $\delta Q$ „korrigiert“.

---

### 3.4 Clausius-Ungleichung und Entropieproduktion
Für reale (auch irreversible) Prozesse gilt die **Clausius-Ungleichung**:
$$dS \ge \frac{\delta Q}{T}$$
- Gleichheit: **reversibel**
- Striktes „$>$“: **irreversibel**

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3e5e289-2c37-474f-bb8f-e020c06a8c45/0982277a-4da9-4fb1-bc0a-66f7dcfd778b-10_334_1887_1753_792.jpg)

Praktisch zerlegt man oft:
$$dS = dS_{\mathrm{austausch}} + dS_{\mathrm{prod}}$$
mit
- $$dS_{\mathrm{austausch}}=\frac{\delta Q}{T} \quad (\text{Entropiestrom über Systemgrenze})$$
- $$dS_{\mathrm{prod}}\ge 0 \quad (\text{Entropieproduktion im System, Maß der Irreversibilität})$$

**Spezialfall isoliertes System** ($\delta Q=0$):
$$dS = dS_{\mathrm{prod}} \ge 0$$
→ Entropie steigt oder bleibt konstant (bei reversiblen inneren Prozessen).

---

### 3.5 Richtung von Prozessen, Gleichgewicht, „Pfeil der Zeit“
- **Spontane Richtung**: Prozesse laufen so, dass die **Gesamtentropie** (System + Umgebung) nicht abnimmt:
  $$\Delta S_{\mathrm{gesamt}}=\Delta S_{\mathrm{sys}}+\Delta S_{\mathrm{umg}} \ge 0$$
- **Gleichgewicht** (isoliertes System): $S$ ist **maximal**; kleine Änderungen senken $S$ nicht weiter.
- **Pfeil der Zeit**: Irreversibilität zeigt sich makroskopisch in $S_{\mathrm{prod}}>0$ → bevorzugte Zeitrichtung (ohne statistische Deutung nötig).

---

### 3.6 Beispiele (typische irreversible Entropieproduktion)

#### (a) Wärmestrom von warm nach kalt
Wärme $\delta Q$ fließt von $T_1>T_2$:

- Entropieänderungen der Reservoirs:
  $$\Delta S_1 = -\frac{\delta Q}{T_1},\qquad \Delta S_2 = +\frac{\delta Q}{T_2}$$
- Gesamt:
  $$\Delta S_{\mathrm{gesamt}}=\delta Q\left(\frac{1}{T_2}-\frac{1}{T_1}\right) >0$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/b3e5e289-2c37-474f-bb8f-e020c06a8c45/0982277a-4da9-4fb1-bc0a-66f7dcfd778b-11_281_1184_1341_364.jpg)

#### (b) Mischungsvorgänge
Zwei Stoffe (oder Gase) mischen sich spontan: Rücktrennung erfordert Arbeit/geeignete Maschinen → **irreversibel**, typischerweise $S_{\mathrm{prod}}>0$.

- Merksatz: **Mischen erhöht Entropie**, weil „Ordnung/Trennung“ verloren geht (thermodynamisch: freie Energie sinkt; hier genügt die Richtungsaussage).

#### (c) Freie Expansion (Joule-Expansion)
Gas expandiert in Vakuum:
- Keine äußere Arbeit: $\delta W=0$
- (im isolierten Aufbau) keine Wärme: $\delta Q=0$
- Trotzdem: Prozess läuft spontan und ist **irreversibel** → für isoliertes System:
  $$\Delta S>0 \quad (\text{obwohl } Q=0)$$
**Idee**: Entropie ist nicht „Wärmeinhalt“, sondern misst auch Irreversibilität/„Verteiltheit“ der Energie.

---

### 3.7 Konsequenzen für Wärmekraftmaschinen (Carnot als Motivation)
Für einen Kreisprozess gilt $\Delta S_{\mathrm{sys}}=0$. Reversibel folgt aus der Clausius-Gleichung:
$$\oint \frac{\delta Q_{\mathrm{rev}}}{T}=0$$
Für eine Maschine zwischen heißem Reservoir $T_H$ und kaltem $T_K$ (reversibel) ergibt sich:
$$\frac{Q_H}{T_H}=\frac{Q_K}{T_K} \quad (\text{Beträge, mit Vorzeichenkonvention beachten})$$
und der maximale Wirkungsgrad (Carnot):
$$\eta=\frac{W}{Q_H}=1-\frac{T_K}{T_H}$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/9c30fad5-c8b6-433f-86a0-2f681028c6ad/4028e0a2-efec-4c96-959b-5032026f3a45-07_429_598_1077_1722.jpg)

| Aussage | Reversibel | Irreversibel |
|---|---:|---:|
| Entropieproduktion $S_{\mathrm{prod}}$ | $=0$ | $>0$ |
| Maschine (Wärmekraft) | maximaler $\eta$ | kleinerer $\eta$ |
| Prozessrichtung | gerade umkehrbar | bevorzugte Richtung (Pfeil der Zeit) |

---

## 4) Fundamentalgleichung, Euler-Gleichung und thermodynamische Potentiale als „Gesamtinformation“

### Fundamentalgleichung = systematische „Gesamtinformation“
- Idee: Ein **thermodynamischer Zustand** ist durch wenige **Zustandsgrößen** beschrieben. Mathematisch heißt das: Es gibt eine **Fundamentalgleichung** (Fundamentalrelation), aus der alle anderen Beziehungen folgen.
- Typisch wählt man die **innere Energie** als Funktion ihrer **natürlichen Variablen** (extensive Größen):
  $$
  E = E(S,V,N)\quad\text{(ein Komponentensystem)}
  $$
- Dann ist das totale Differential (reversibel/quasistatisch):
  $$
  dE = T\,dS - p\,dV + \mu\,dN
  $$
  mit den **konjugierten Variablen** (intensive „Kräfte“):
  $$
  T=\left(\frac{\partial E}{\partial S}\right)_{V,N},\qquad
  -p=\left(\frac{\partial E}{\partial V}\right)_{S,N},\qquad
  \mu=\left(\frac{\partial E}{\partial N}\right)_{S,V}.
  $$

> Wichtiges Strukturprinzip: Zu jeder extensiven Koordinate (wie $S,V,N$) gehört eine intensive konjugierte Größe (wie $T,-p,\mu$). **Beides gleichzeitig** (z. B. $p$ und $V$) kann i. A. nicht unabhängig als Zustandsvariablen gewählt werden, da sie über eine **Zustandsgleichung** gekoppelt sind.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/360c9b27-7239-49bb-b5c3-1790ec3c8f12/95d38105-dabe-4631-a371-24ef87ae58b0-07_799_2606_982_221.jpg)

---

### Mehrkomponentensysteme und weitere Kopplungen
- **Mehrere Teilchensorten**:
  $$
  dE = T\,dS - p\,dV + \sum_i \mu_i\,dN_i.
  $$
- **Weitere äußere Parameter/Felder** können ergänzt werden (Thermodynamik ist hier nicht „begrenzt“):
  - Magnetisches System (eine übliche Schreibweise):
    $$
    dE = T\,dS - p\,dV + \mu\,dN + \mathbf{B}\cdot d\mathbf{m}
    $$
    (hier sind $\mathbf{B}$ und Magnetisierung/ magnetisches Moment $\mathbf{m}$ konjugiert; Vorzeichenkonventionen können je nach Fachgebiet variieren).
- Allgemeines Muster:
  $$
  dE = T\,dS - p\,dV + \sum_i \mu_i\,dN_i + \sum_k X_k\,dx_k,
  $$
  wobei $x_k$ „extensive“ Kopplungskoordinaten und $X_k$ deren konjugierte „intensive“ Felder/Kräfte sind.

---

### Homogenität extensiver Größen → Euler-Gleichung
- Für einfache Systeme gilt (im thermodynamischen Limes): **Extensive Größen skalieren linear** mit der Systemgröße:
  $$
  E(\lambda S,\lambda V,\lambda N)=\lambda\,E(S,V,N).
  $$
  Das heißt: $E$ ist **homogen vom Grad 1** in $(S,V,N)$.
- Mit dem Eulerschen Homogenitätssatz folgt:
  $$
  E = TS - pV + \mu N
  $$
  bzw. für Mehrkomponentensysteme:
  $$
  E = TS - pV + \sum_i \mu_i N_i.
  $$

**Folge: Gibbs-Duhem-Relation**
- Differential der Euler-Gleichung und Vergleich mit $dE$ liefert:
  $$
  0 = S\,dT - V\,dp + N\,d\mu \quad (\text{ein Komponentensystem})
  $$
  bzw.
  $$
  0 = S\,dT - V\,dp + \sum_i N_i\,d\mu_i.
  $$
- Kernaussage: Von den intensiven Größen sind **nicht alle unabhängig** (z. B. können nicht $T,p,\mu$ beliebig unabhängig variiert werden).

---

### Thermodynamische Potentiale: Legendre-Transformation und natürliche Variablen
**Warum Potentiale?**
- Jedes Potential ist „gleichwertig“ im Informationsgehalt: Aus seinem Differential lassen sich durch Ableitungen sofort wichtige Größen gewinnen.
- Man wählt das Potential so, dass seine **natürlichen Variablen** den **äußeren Kontrollparametern** des Experiments entsprechen (z. B. $T$ durch ein Wärmebad, $p$ durch Umgebung).

**Legendre-Transformation (Prinzip)**
- Man ersetzt eine Variable durch ihre konjugierte:
  - von $S$ zu $T$: $E\to F=E-TS$
  - von $V$ zu $p$: $E\to H=E+pV$
  - beides: $E\to G=E+pV-TS$

---

### Die wichtigsten Potentiale im Überblick
| Potential | Definition | Natürliche Variablen | Differential | Nützliche Ableitungen / Interpretation |
|---|---|---|---|---|
| Innere Energie $E$ | $E(S,V,N)$ | $S,V,N$ | $dE=T\,dS-p\,dV+\mu\,dN$ | $T=\left(\frac{\partial E}{\partial S}\right)$, $-p=\left(\frac{\partial E}{\partial V}\right)$, $\mu=\left(\frac{\partial E}{\partial N}\right)$ |
| Helmholtz freie Energie $F$ | $F=E-TS$ | $T,V,N$ | $dF=-S\,dT-p\,dV+\mu\,dN$ | Gleichgewicht bei **konstant $T,V,N$**: $F$ minimal; $S=-\left(\frac{\partial F}{\partial T}\right)_{V,N}$ |
| Enthalpie $H$ | $H=E+pV$ | $S,p,N$ | $dH=T\,dS+V\,dp+\mu\,dN$ | Gut bei **konstantem $p$** (z. B. Umgebungsluftdruck) und adiabatischen Betrachtungen |
| Gibbs freie Enthalpie $G$ | $G=E+pV-TS$ | $T,p,N$ | $dG=-S\,dT+V\,dp+\mu\,dN$ | Gleichgewicht bei **konstant $T,p,N$**: $G$ minimal; bei festem $T,p$: $dG=\mu\,dN$ |
| Großkanonisches Potential $J$ (oft $\Omega$) | $J=E-TS-\mu N$ | $T,V,\mu$ | $dJ=-S\,dT-p\,dV-N\,d\mu$ | Praktisch für **offene Systeme** mit festem $\mu$; liefert direkt $p$: $J=-pV$ (für homogene Systeme) |

---

### Maxwell-Relationen: Verknüpfungen aus Integrabilität
- Weil $E,F,H,G,J$ **Zustandsgrößen** sind, sind ihre Differentiale **vollständig**. Daraus folgt die Symmetrie gemischter Ableitungen (Satz von Schwarz) und damit **Maxwell-Relationen**.

Beispiele (je ein typisches Paar):
- Aus $dF=-S\,dT-p\,dV$ (bei festem $N$):
  $$
  \left(\frac{\partial S}{\partial V}\right)_{T}
  =
  \left(\frac{\partial p}{\partial T}\right)_{V}.
  $$
- Aus $dG=-S\,dT+V\,dp$ (bei festem $N$):
  $$
  \left(\frac{\partial S}{\partial p}\right)_{T}
  =
  -\left(\frac{\partial V}{\partial T}\right)_{p}.
  $$
- Aus $dE=T\,dS-p\,dV$ (bei festem $N$):
  $$
  \left(\frac{\partial T}{\partial V}\right)_{S}
  =
  -\left(\frac{\partial p}{\partial S}\right)_{V}.
  $$

**Nutzen:** Maxwell-Relationen erlauben, schwer messbare Ableitungen (z. B. Entropieänderungen) durch leichter zugängliche Größen (z. B. $p(T)$) auszudrücken.

---

### Typische Anwendungsfälle (Merkliste)
- **Konstant $T,V,N$** (Wärmebad, starres Gefäß): Gleichgewicht durch Minimierung von $F(T,V,N)$.
- **Konstant $T,p,N$** (Wärmebad + „Druckreservoir“): Gleichgewicht durch Minimierung von $G(T,p,N)$.
- **Konstant $S,p,N$** (adiabatisch + Druckkontrolle): $H(S,p,N)$ ist oft die passende Beschreibung.
- **Konstant $T,V,\mu$** (offenes System mit Teilchenreservoir): Minimierung von $J(T,V,\mu)$; außerdem $J=-pV$ für homogene Systeme.

**Merksatz:** *Das „richtige“ Potential ist dasjenige, dessen natürliche Variablen den kontrollierten Randbedingungen entsprechen; dann liefern Ableitungen sofort die gesuchten thermodynamischen Größen.*

## 5) Statistische Physik als Fundament: Mikrokanonisches Ensemble, 3. Hauptsatz und Anwendungen (Fermi-Gas)

### Motivation: Warum Ensembles? (Brücke zur Thermodynamik)
- **Thermodynamik** beschreibt Makrogrößen wie $U,S,T,p,V,N$ und ihre Beziehungen (Hauptsätze), ohne die Mikrodynamik im Detail zu kennen.
- **Statistische Physik** erklärt diese Makrogesetze aus **vielen** Mikrozuständen:
  - Ein Makrozustand (z. B. festes $E,V,N$) entspricht typischerweise **sehr vielen** Mikrozuständen.
  - Weil die exakte Mikrobewegung bei $N\sim 10^{23}$ nicht verfolgbar ist, arbeitet man mit **Wahrscheinlichkeiten** und **Ensemblemittelwerten**.
- Zentrale Idee für Thermodynamik: **Makroskopische Größen sind Mittelwerte**, und im **thermodynamischen Limes** ($N\to\infty$) werden relative Schwankungen klein → reproduzierbare Thermodynamik.

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/25906d8d-306b-423d-b55c-822cea313118/52845d4e-f44d-416c-b06f-fa983d26a72e-13_651_1121_63_1843.jpg)

---

### Mikrokanonisches Ensemble: isoliertes System als Referenz
**Setting (thermodynamisch):**
- Isoliertes System: **kein** Energie- und **kein** Teilchenaustausch
- Kontrollparameter: $E, V, N$ (Energie oft mit kleiner Breite $\Delta E$)

**Grundpostulat (Gleichverteilung):**
- Alle Mikrozustände, die mit $E$ (innerhalb $\Delta E$) kompatibel sind, sind gleichwahrscheinlich:
  - Anzahl zugänglicher Zustände: $\Omega(E,V,N)$
  - Dichte (Wahrscheinlichkeit) über diesen Zuständen:
    $$\rho = \frac{1}{\Omega}\quad \text{(für zugängliche Zustände)}$$

**Entropie als Zustandszählung (Boltzmann-Formel):**
$$S(E,V,N) = k_B \ln \Omega(E,V,N)$$

![](http://localhost:5001/subjects/065313dc-e010-4cf3-9daf-525801a906a2/images/c3f11257-bac0-4d04-a400-59bbf93443d6/25d076b2-b147-4a3b-9d72-efd9651588eb-15_788_640_834_2155.jpg)

**Warum ist das „Thermodynamik“?**
- Aus $S(E,V,N)$ folgen die thermodynamischen Intensivgrößen über Ableitungen, z. B.
  $$\frac{1}{T}=\left(\frac{\partial S}{\partial E}\right)_{V,N},\qquad \frac{p}{T}=\left(\frac{\partial S}{\partial V}\right)_{E,N}$$
- Damit wird die **phänomenologische** Thermodynamik auf eine **mikroskopische** Zählgröße zurückgeführt.

---

### 3. Hauptsatz (Nernst) in mikrokanonischer Sicht: Rolle des Grundzustands
**Thermodynamische Aussage (Idee):**
- Beim Abkühlen gegen $T\to 0$ „verschwindet“ die thermische Unordnung; Entropieunterschiede werden klein.
- Statistisch hängt das davon ab, wie viele Zustände bei sehr kleiner Energie überhaupt noch zugänglich sind.

**Diskrete Energieniveaus und Grundzustandsentartung $g$:**
- Bei $T\to 0$ dominiert der **Grundzustand**.
- Ist der Grundzustand **$g$-fach entartet**, bleiben $g$ gleichwahrscheinliche Mikrozustände übrig:
  $$\Omega(T\to 0)\to g \quad\Rightarrow\quad S(T\to 0)\to k_B\ln g$$

**Spezialfall: eindeutiger Grundzustand**
- Für $g=1$ folgt
  $$S(T\to 0)\to 0$$
- Das ist die oft zitierte Form des 3. Hauptsatzes („Entropie geht gegen Null“), gilt aber **nur**, wenn der Grundzustand **nicht** entartet ist (und idealisiert: perfekte Ordnung, keine eingefrorenen Freiheitsgrade).

**Merksatz (thermodynamisch-statistisch):**
- Der 3. Hauptsatz verbindet die **Tieftemperatur-Entropie** mit der **Zahl mikroskopisch unterscheidbarer Grundzustände**.

---

### Anwendung/Intuition: (Entartetes) Fermi-Gas bei tiefen Temperaturen – thermodynamische Konsequenz
> Fokus hier: **thermodynamische** Aussage, nicht die Details der Quantenstatistik.

**Energieskala: Fermi-Energie $E_F$**
- $E_F$ setzt eine charakteristische Skala: „bis hierhin sind Zustände bei $T\approx 0$ im Wesentlichen besetzt“.
- Tieftemperatur-Regime: 
  $$k_B T \ll E_F$$

**Warum ändern sich thermodynamische Größen nur durch Zustände nahe $E_F$?**
- Bei kleinen $T$ können nur Teilchen in einem **schmalen Energiefenster** um $E_F$ effektiv Energie aufnehmen/abgeben.
- Zustände weit unterhalb von $E_F$ bleiben praktisch „eingefroren“ (Belegung ändert sich kaum), Zustände weit oberhalb sind kaum beteiligt.
- Thermodynamisch heißt das:
  - **Nur ein kleiner Bruchteil** der Freiheitsgrade trägt zu **$U(T)$**, **$S(T)$** und **$C_V(T)$** bei.
  - Daher ist z. B. die Wärmekapazität bei tiefen $T$ **ungewöhnlich klein** im Vergleich zu klassischen Erwartungen.

**Kernaussage für die Wärmekapazität (qualitativ):**
- Klassisch würde man oft $C_V \sim \text{konstant}$ erwarten (viele aktive Freiheitsgrade).
- Beim entarteten Fermi-Gas sind bei $k_BT\ll E_F$ nur „Randzustände“ aktiv → **stark reduzierte** Temperaturantwort.
- Merkhilfe: **„Nur die Schale um $E_F$ zählt“** → Thermodynamik wird durch eine kleine Zustandsmenge kontrolliert.

---

### Mini-Zusammenfassung (Prüfungsformulierung)
- Mikrokanonisch: isoliert, $E,V,N$ fest; Gleichverteilung über $\Omega$ zugängliche Mikrozustände, $\rho=1/\Omega$.
- Entropie: $S=k_B\ln\Omega$ als Brücke von Mikro zu Makro; daraus folgen $T,p,\dots$ über Ableitungen.
- 3. Hauptsatz: Bei $T\to 0$ bleibt nur Grundzustandsvielfalt $g$ → $S(0)=k_B\ln g$; bei $g=1$ folgt $S(0)=0$.
- Fermi-Gas (tiefe $T$): $E_F$ als Skala; nur Zustände nahe $E_F$ sind temperaturaktiv → thermische Größen (z. B. $C_V$) werden von diesem kleinen Energiebereich bestimmt.

---

## Quick Reference: Key Formulas

### Thermodynamik – Hauptsätze, Differentiale, Zustands- und Prozessgrößen

| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Prozessgröße Wärme (Beispiel) | $$\delta Q$$ | $\delta Q$: infinitesimale zugeführte Wärme (wegabhängig, kein totales Differential) |
| Prozessgröße Arbeit (Beispiel) | $$\delta W$$ | $\delta W$: infinitesimale Arbeit (wegabhängig, kein totales Differential) |
| 1. Hauptsatz (allgemein, Energieänderung) | $$dE=\delta Q+\delta W$$ | $E$: Energie (z. B. innere Energie), $\delta Q$: Wärme, $\delta W$: Arbeit |
| 1. Hauptsatz (mit innerer Energie) | $$\mathrm{d}U=\delta Q+\delta W$$ | $U$: innere Energie, $\delta Q$: Wärme, $\delta W$: Arbeit |
| Fundamentale Zustandsgleichung / Gibbs’sche Fundamentalform | $$dE=T\,dS-p\,dV+\mu\,dN$$ | $T$: Temperatur, $S$: Entropie, $p$: Druck, $V$: Volumen, $\mu$: chemisches Potential, $N$: Teilchenzahl |
| Reversibler Prozess (genannte Eigenschaft) | $$dS=0$$ | $S$: Entropie; Bedingung, wie im Material genannt (für „reversibel“ angegeben) |
| Wärme auf Isothermen im $T$-$S$-Diagramm | $$\Delta Q=T\,\Delta S$$ | $\Delta Q$: zu-/abgeführte Wärme, $T$: konstante Temperatur (isotherm), $\Delta S$: Entropieänderung |
| Adiabate Bedingung (genannt) | $$\Delta Q=0$$ | $\Delta Q$: Wärmeaustausch; adiabatisch bedeutet kein Wärmeaustausch |
| (Aus 1. HS, andere Vorzeichenkonvention – im Material so angegeben) | $$\Delta W=\Delta Q$$ | $\Delta W$: (Netto-)Arbeit, $\Delta Q$: (Netto-)Wärme; Gleichsetzung für den betrachteten Zusammenhang im Kreisprozess (laut Material, „andere Vorzeichenkonvention“) |

---

### Thermodynamik – Kreisprozesse & Carnot-Wirkungsgrad

| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Wirkungsgrad (Definition für Carnot-Prozess im Material) | $$\eta=\frac{\Delta W}{Q_{\mathrm{H}}}=\frac{Q_{\mathrm{H}}-Q_{\mathrm{K}}}{Q_{\mathrm{H}}}$$ | $\eta$: Wirkungsgrad, $\Delta W$: Nettoarbeit pro Zyklus, $Q_{\mathrm{H}}$: aufgenommene Wärme (heißes Reservoir), $Q_{\mathrm{K}}$: abgegebene Wärme (kaltes Reservoir) |

---

### Ideales Gas / Zustandsgleichung

| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Zustandsgleichung ideales Gas | $$pV=N\,k_{B}\,T$$ | $p$: Druck, $V$: Volumen, $N$: Teilchenzahl, $k_B$: Boltzmann-Konstante, $T$: Temperatur |

---

### Statistische Physik – Teilchenaufteilung, Wahrscheinlichkeiten, Kombinatorik

| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Teilchenzahl-Aufteilung | $$N=N_{1}+N_{2}$$ | $N$: Gesamtteilchenzahl, $N_1,N_2$: Teilchen in Teilvolumen 1 bzw. 2 |
| Volumen-Aufteilung | $$V=V_{1}+V_{2}$$ | $V$: Gesamtvolumen, $V_1,V_2$: Teilvolumen 1 bzw. 2 |
| Aufenthaltswahrscheinlichkeit in Volumen 1 | $$p_{1}=\frac{V_{1}}{V}$$ | $p_1$: Wahrscheinlichkeit für Teilchen in $V_1$, $V_1$: Teilvolumen, $V$: Gesamtvolumen |
| Aufenthaltswahrscheinlichkeit in Volumen 2 | $$p_{2}=\frac{V_{2}}{V}$$ | $p_2$: Wahrscheinlichkeit für Teilchen in $V_2$, $V_2$: Teilvolumen, $V$: Gesamtvolumen |
| Beziehung der Wahrscheinlichkeiten | $$p_{2}=1-p_{1}$$ | $p_1,p_2$: Komplementärwahrscheinlichkeiten |
| Anzahl möglicher Konfigurationen (2-Volumen-Modell) | $$2^{N}$$ | $N$: Teilchenzahl; jedes Teilchen kann in 1 oder 2 sein |

---

### Skalierung / Abschätzungen (mikroskopische Beschreibung)

| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Exponentielle Skalierung der Anzahl von „Diffgln.“ (Diskretisierung) | $$\sim\left(\frac{L}{\Delta z}\right)^{3N}$$ | $L$: Längenskala/Systemgröße, $\Delta z$: Diskretisierungsschritt, $N$: Teilchenzahl; $3N$ Freiheitsgrade in 3D |
