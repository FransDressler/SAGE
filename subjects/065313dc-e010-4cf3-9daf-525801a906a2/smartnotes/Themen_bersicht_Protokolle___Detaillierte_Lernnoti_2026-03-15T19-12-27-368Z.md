# Themenübersicht Protokolle – Detaillierte Lernnotizen

## 1) Grundlagen & Schichtenmodell: Was sind Protokolle und wie greifen sie ineinander?

### Themenübersicht (Statistische Physik, Thermodynamik, Quantenstatistik) – Unterthemen & Wichtigkeits-Ranking
| Thema | Unterthemen (absteigend nach Wichtigkeit) |
|---|---|
| **Statistische Physik** | 1. **Ensembles & Zustandsvariablen**: mikrokanonisch $(E,V,N)$, kanonisch $(T,V,N)$, großkanonisch $(T,V,\mu)$; „isoliert/geschlossen/offen“  2. **Zustandssummen / Zählgrößen**: $\Omega$ (mikrokanonisch), $Z=\sum_r e^{-\beta E_r}$ (kanonisch)  3. **Mikro ↔ Makro**: Makrogrößen aus mikroskopischen Zuständen (Phasenraum), Mittelwerte  4. **Fluktuationen & thermodynamischer Limes**: relative Fluktuation $\propto \frac{1}{\sqrt{N}}$  5. **Wahrscheinlichkeitsverteilungen**: Binomial $P(r)=\binom{n}{r}p^r(1-p)^{n-r}$, Poisson (bei ungleichen/seltenen Ereignissen) |
| **Thermodynamik** | 1. **Hauptsätze**: 0., 1. $dE=\delta W+\delta Q$, 2. $dS\ge \frac{\delta Q}{T}$ (reversibel: Gleichheit), 3. (Konzept)  2. **Zustands- vs. Prozessgrößen**: totale Differentiale vs. wegabhängig; $\delta Q,\delta W$  3. **Fundamentale Gleichung**: $dE=T\,dS-p\,dV+\mu\,dN$  4. **Zustandsgleichung ideales Gas**: Beziehung zwischen $p,V,T$ (ggf. $N$)  5. **Thermodynamische Potentiale & Legendre-Transformation** (z. B. je nach kontrollierten Variablen) |
| **Quantenstatistik** | 1. **Teilchenstatistiken & Spin**: Fermionen (antisymmetrisch, Pauli), Bosonen (symmetrisch)  2. **Besetzungszahlen/Verteilungen**: Fermi-Dirac, Bose-Einstein, Maxwell-Boltzmann (klassischer Grenzfall bei hoher $T$/großer Energie)  3. **Bose-Einstein-Kondensation**: makroskopische Grundzustandsbesetzung, Phasenübergang  4. **Wärmekapazität (qualitativ)**: charakteristische $T$-Abhängigkeiten; Unstetigkeit/Phasenübergang bei Bosonen (konzeptionell) |

### Protokoll (Protocol): Definition & Zweck
- **Protokoll** = verbindliches Regelwerk für Kommunikation zwischen Systemen:
  - **Syntax**: Format/Struktur von Nachrichten (Header, Felder, Reihenfolge).
  - **Semantik**: Bedeutung der Felder/Operationen (z. B. „ACK“, „GET“, „Statuscode“).
  - **Timing**: wann/wie schnell gesendet wird (Timeouts, Retransmits, Reihenfolgen).

### Schichtenmodelle: OSI vs. TCP/IP (Einordnung)
| OSI-Schicht | TCP/IP-Entsprechung | Typische Aufgaben | Beispiele |
|---|---|---|---|
| 7 Anwendung | Application | Anwendungsprotokolle, Datenformate | HTTP, DNS, SMTP |
| 6 Darstellung | (oft Application) | Kodierung, Kompression | UTF‑8, JSON, TLS-*Datenformate* |
| 5 Sitzung | (oft Application) | Sitzungssteuerung | (meist in App/TLS integriert) |
| 4 Transport | Transport | Ende-zu-Ende-Transport, Ports, Zuverlässigkeit | TCP, UDP |
| 3 Vermittlung | Internet | Routing zwischen Netzen, IP-Adressierung | IP, ICMP |
| 2 Sicherung | Link | lokale Zustellung im Netzsegment, MAC | Ethernet, WLAN (802.11) |
| 1 Bitübertragung | (Teil von Link) | Signale/Übertragungsmedium | Funk, Kupfer, Glasfaser |

- Merksatz: **TCP/IP ist praxisnäher**, OSI ist **didaktischer Referenzrahmen**.

### Kapselung & Entkapselung (Encapsulation)
- Beim **Senden**: jede Schicht nimmt Nutzdaten der oberen Schicht und fügt **Header** (ggf. Trailer) hinzu → **Kapselung**.
- Beim **Empfangen**: Header werden schrittweise entfernt und ausgewertet → **Entkapselung**.
- Ziel: **Modularität** (Schichten können intern geändert werden, solange die Schnittstellen stabil bleiben).

### PDU-Begriffe (Protocol Data Units)
| Schicht | PDU-Name | Typischer Inhalt |
|---|---|---|
| Link (Ethernet/WLAN) | **Frame** | MAC-Header (+ Trailer), trägt IP-Paket |
| Internet (IP) | **Packet** (IP-Paket/Datagram) | IP-Header, trägt TCP/UDP |
| Transport (TCP) | **Segment** | TCP-Header, trägt z. B. HTTP/TLS-Daten |

### Adressierung: Wer adressiert was?
- **MAC-Adresse (Layer 2)**: Zustellung **im lokalen Netz** (zum nächsten Hop, z. B. Router oder Zielgerät im gleichen LAN).
- **IP-Adresse (Layer 3)**: Zustellung **end-to-end über Netze** (Routing).
- **Port (Layer 4)**: Zustellung **an Prozess/Service** auf einem Host (z. B. TCP 443 für HTTPS).
- Zusammenspiel: **IP findet den Host**, **Port findet die Anwendung**, **MAC bringt das Paket zum nächsten Hop**.

### Standards & Interoperabilität
- **IETF** publiziert **RFCs** (Internet-Standards, z. B. IP, TCP, TLS/QUIC-nahe Standards).
- **IEEE** standardisiert u. a. **802.x** (z. B. **Ethernet 802.3**, **WLAN 802.11**).
- **Interoperabilität**: Geräte/Software verschiedener Hersteller kommunizieren, weil sie **dieselben Standards** implementieren.

### End-to-End-Beispiel: Webaufruf (HTTPS)
**HTTP über TLS über TCP über IP über Ethernet/WLAN**

- **Application (HTTP)**:
  - Request/Response (z. B. `GET /`, Statuscodes, Header, Body).
- **Security (TLS)** (logisch zwischen App und Transport):
  - **Vertraulichkeit, Integrität, Authentizität** (Zertifikate, Handshake, Verschlüsselung).
- **Transport (TCP)**:
  - **Zuverlässig, geordnet**, Fluss-/Staukontrolle, **Ports** (Client-Ephemeralport → Serverport 443).
- **Internet (IP)**:
  - **Routing** über mehrere Netze, **IP-Quell/Zieladresse**, Fragmentierung (historisch) / MTU-Aspekte.
- **Link (Ethernet/WLAN)**:
  - Übertragung zum **nächsten Hop** per **MAC**, Rahmenbildung (Frames), Medienzugriff (insb. WLAN).
- Auf Empfangsseite: Entkapselung in umgekehrter Reihenfolge, bis die HTTP-Anfrage in der Anwendung ankommt.

### Zentrale Designprinzipien
- **End-to-End-Prinzip**:
  - Intelligenz/Zuverlässigkeit möglichst **an die Endsysteme**, das Netz dazwischen bleibt eher **einfach** (z. B. IP liefert „best effort“, TCP macht zuverlässig).
- **Stateless vs. Stateful**:
  - **Stateless**: Server merkt sich zwischen Requests keinen Zustand (skalierbarer; typisch: HTTP/1.1 im Prinzip stateless).
  - **Stateful**: Protokoll hält Zustand über Zeit (z. B. **TCP-Verbindung** mit Sequenznummern; NAT/Firewalls oft stateful).
- **Protokoll vs. Dienst (Service)**:
  - **Service** = *was* eine Schicht der oberen anbietet (z. B. „zuverlässiger Bytestrom“).
  - **Protokoll** = *wie* die Kommunikation zwischen Peers umgesetzt wird (Header, Nachrichtenabläufe, Zustände).

## 2) Kernprotokolle im Netz: Link, Internet und Transport (Ethernet/WLAN, IP, ICMP, ARP/NDP, TCP/UDP/QUIC)

### Link-Ebene (Ethernet/WLAN): Frames, MTU, VLAN, Broadcast
- **Ethernet (802.3)**
  - **Frame-Aufbau (vereinfacht):** Ziel-MAC | Quell-MAC | (optional) **802.1Q VLAN-Tag** | EtherType | Payload | FCS
  - **MAC-Adressen:** L2-Adressierung innerhalb einer **Broadcast-Domäne** (typisch: ein Switch/VLAN).
  - **MTU:** meist **1500 Byte** (Payload auf IP-Ebene). Wichtige Auswirkungen:
    - Zu große Pakete ⇒ Fragmentierung (IPv4) oder Drop + ICMP (IPv6/PMTUD).
    - MTU-Probleme erzeugen „**läuft manchmal / hängt**“-Fehlerbilder (v. a. bei blockiertem ICMP).
- **VLAN (802.1Q)**
  - **Ziel:** Trennung von Broadcast-Domänen auf derselben physischen Infrastruktur.
  - **Access-Port:** untagged in genau einem VLAN. **Trunk-Port:** tagged, mehrere VLANs.
  - **Typische Fehler:** falsches VLAN am Port, Native-VLAN-Mismatch, „nur manche Hosts erreichbar“.
- **Broadcast/Multicast**
  - **Broadcast** (z. B. ARP) skaliert schlecht; VLANs reduzieren die Reichweite.
  - **Multicast** benötigt oft spezielle Switch-/Router-Konfiguration (IGMP/MLD Snooping etc.).
- **WLAN (802.11) Grundlagen**
  - **Shared Medium:** „airtime“ wird geteilt; **CSMA/CA**, kein vollduplex wie Ethernet.
  - Einfluss auf **Durchsatz/Latenz**:
    - Mehr Clients/Interferenzen ⇒ mehr Contention/Backoff ⇒ höhere Latenz, geringerer Durchsatz.
    - Rate Adaptation, Retries und schwaches Signal erhöhen Latenz/Jitter.
  - **Praktisch:** WLAN kann „schnelle PHY-Rate“ anzeigen, aber reale TCP-Rate deutlich geringer.

---

### Internet-Ebene (IP): IPv4/IPv6, Routing, CIDR, typische Fehlerbilder
- **IPv4 vs. IPv6 (Kernunterschiede)**
  - **Adressierung:**
    - IPv4: 32-bit, z. B. 192.0.2.1
    - IPv6: 128-bit, z. B. 2001:db8::1 (häufig /64 in LANs)
  - **Header:**
    - IPv4: variabel (Options), enthält Header-Checksumme
    - IPv6: fix (40 Byte), Erweiterungsheader, keine Header-Checksumme
  - **Fragmentierung:**
    - IPv4: Router dürfen fragmentieren (wenn DF=0)
    - IPv6: Router fragmentieren **nicht**; nur Sender (Fragment Header) ⇒ PMTUD zentral
  - **TTL/Hop Limit:** verhindert Loops (IPv4 **TTL**, IPv6 **Hop Limit**)
- **Routing (Grundidee)**
  - **Longest Prefix Match:** die spezifischste Route gewinnt.
  - **Default Route:** 0.0.0.0/0 bzw. ::/0, wenn nichts Spezifisches passt.
  - **Fehlerbilder:** asymmetrisches Routing, fehlende Rückroute, falsches Gateway.
- **Subnetting/CIDR**
  - Notation: z. B. 10.0.0.0/24 oder 2001:db8:1::/64
  - Wichtige Punkte:
    - Netz/Host-Anteil durch Prefix-Länge
    - Überlappende Netze oder falsche Masken ⇒ Erreichbarkeitsprobleme, ARP/NDP „komisch“
- **NAT/Firewall als Realitätsschicht**
  - NAT typisch bei IPv4, seltener nötig bei IPv6.
  - Firewalls beeinflussen Protokollwahl (z. B. blockiertes UDP/ICMP ⇒ QUIC/PMTUD-Probleme).

---

### ARP (IPv4) und NDP (IPv6): L2/L3-Auflösung
- **Problem:** IP braucht für die Zustellung im LAN eine **L2-Zieladresse** (MAC).
- **ARP (IPv4)**
  - „Wer hat IP X? Bitte MAC melden.“ (Broadcast Request, Unicast Reply)
  - **Caches** (ARP-Table) beschleunigen, können aber **veralten**.
  - **Typische Angriffe/Probleme:** ARP-Spoofing, Duplicate IPs, „falscher MAC im Cache“.
- **NDP (IPv6, Teil von ICMPv6)**
  - Ersetzt ARP durch **Neighbor Solicitation/Advertisement** (typisch via Multicast).
  - Zusätze: **Router Solicitation/Advertisement** (SLAAC), Duplicate Address Detection.
  - **Typische Fehler:** ICMPv6 geblockt ⇒ IPv6 wirkt „kaputt“ (NDP benötigt ICMPv6).

---

### ICMP/ICMPv6: Diagnose und Fehlermeldungen
- **Funktion:** Kontroll-/Fehlerprotokoll für IP, kein „Daten“-Transport.
- **Wichtige Typen/Use-Cases**
  - **Ping:** ICMP Echo Request/Reply (Erreichbarkeit, Latenz grob).
  - **Traceroute:** nutzt TTL/Hop Limit + ICMP Time Exceeded.
  - **Path MTU Discovery (PMTUD)**
    - IPv4: „Fragmentation Needed“ (Type 3 Code 4) bei DF=1
    - IPv6: „Packet Too Big“
  - **Fehlerbild:** ICMP blockiert ⇒ **PMTUD bricht** ⇒ „große Downloads hängen“, TLS/HTTP sporadisch.

---

### Transport-Ebene: TCP vs. UDP vs. QUIC
- **TCP (zuverlässig, verbindungsorientiert)**
  - **3-Way Handshake:** SYN → SYN/ACK → ACK (Verbindungsaufbau)
  - **Sequenznummern/ACKs:** geordnete, zuverlässige Byte-Stream-Übertragung
  - **Flusskontrolle:** Receiver Window (Schutz des Empfängers)
  - **Congestion Control:** Schutz des Netzes (z. B. Slow Start, Congestion Avoidance)
  - **Retransmission:** bei Verlust (Timeout/Fast Retransmit)
  - **TIME_WAIT:** nach aktivem Close zur Vermeidung von „alten“ Segmenten; kann viele Ports binden
  - **Head-of-Line Blocking (TCP):** ein Verlust kann nachfolgende Daten im Stream ausbremsen
- **UDP (minimal, verbindungslos)**
  - Sehr kleiner Overhead, keine Garantie für Zustellung/Reihenfolge.
  - Gut für:
    - **Echtzeit** (VoIP, Gaming): lieber kleine Verluste als zusätzliche Latenz durch Retransmits
    - eigene Reliability/Timing auf Anwendungsebene (RTP, custom)
  - NAT/Firewall: UDP-„Mappings“ können schneller auslaufen; oft Keepalives nötig.
- **QUIC (über UDP, Transport + Security)**
  - **TLS 1.3 integriert**, typ. **1-RTT**, optional **0-RTT** (Achtung Replay-Risiko bei 0-RTT-Daten).
  - **Stream-Multiplexing ohne Transport-HoL:** Verluste in einem Stream blockieren andere Streams nicht (im Gegensatz zu „alles über einen TCP-Stream“).
  - **Connection Migration:** besser bei IP-Wechsel (z. B. WLAN ↔ Mobilfunk).
  - Einsatz: **HTTP/3** nutzt QUIC (Performance + robust bei Verlust/Latenz).

---

### Beispiele & Praxis: „Warum dieses Protokoll?“
- **VoIP typischerweise UDP**
  - Ziel: niedrige **Latenz/Jitter**; ein verlorenes Paket ist weniger schlimm als späte Pakete.
  - Häufig mit RTP/RTCP; Paketverluste werden durch Concealment kompensiert.
- **Web zunehmend HTTP/3 über QUIC**
  - Besser bei Paketverlust/hoher RTT: weniger Blockierung durch Multiplexing, schnellerer (Wieder-)Aufbau.
  - Funktioniert oft „besser“ durch NATs als exotische TCP-Optionen, aber UDP kann in restriktiven Netzen blockiert sein.
- **MTU/Fragmentierung & Middleboxes beeinflussen die Wahl**
  - **IPv6 braucht funktionierendes ICMPv6** für PMTUD/NDP.
  - **Fragmentierte Pakete** werden von Firewalls/NATs häufiger gedroppt ⇒ vermeide Fragmentierung (MSS-Clamping, PMTUD).
  - QUIC über UDP kann an „UDP-blocking“ scheitern; Fallback ist meist HTTP/2 über TCP.  

---

### Themenübersicht (Studiennotizen): Statistische Physik, Thermodynamik, Quantenstatistik — Unterthemen nach Wichtigkeit
| Thema | Unterthemen (absteigend nach Wichtigkeit) |
|---|---|
| **Statistische Physik** | **(1)** Mikro-/Makrozustände, Entropie, Wahrscheinlichkeiten bei Vielteilchensystemen ($\sim 10^{23}$) **(2)** Ensembles (mikrokanonisch/kanonisch/großkanonisch) und Zustandsgrößen **(3)** Fluktuationen und Zusammenhang zu Messgrößen (z. B. Suszeptibilitäten) **(4)** Phasenübergänge, kritisches Verhalten, Gesetz der korrespondierenden Zustände |
| **Thermodynamik** | **(1)** 1. Hauptsatz: $\mathrm{d}E=\delta Q+\delta W$; Zustandsgrößen vs. Prozessgrößen **(2)** 2. Hauptsatz, Entropie, irreversibel/reversibel **(3)** Wärmekraftmaschinen, Carnot-Wirkungsgrad/Schranken **(4)** Maxwell-Relationen und Potenziale (Legendre-Transformationen) |
| **Quantenstatistik** | **(1)** Anwendbarkeitskriterium: thermische Wellenlänge $\lambda_T=\frac{h}{\sqrt{2\pi m k_B T}}$ vs. mittlerer Teilchenabstand **(2)** Bose- vs. Fermi-Gase (Symmetrie, Spin, Pauli-Prinzip) **(3)** Verteilungen: Bose-Einstein/Fermi-Dirac/Maxwell-Boltzmann und klassischer Grenzfall **(4)** Charakteristische Effekte (z. B. Fermi-Kante bei $T\to 0$) |

## 3) Anwendungsprotokolle, Sicherheit & Betrieb: HTTP(S), DNS, E-Mail, DHCP, SSH – plus Monitoring und Troubleshooting

### Themenübersicht (Physik) — mit Unterthemen & Wichtigkeits-Ranking
> Hinweis: Dieses Ranking ist prüfungs- und grundlagenorientiert (typische Kernkonzepte zuerst).

#### Statistische Physik
- **(1) Ensembles & Zustandsgrößen**
  - Mikrokanonisch, kanonisch, großkanonisch
  - Zustandssumme $Z$, freie Energien, Erwartungswerte
  - Thermodynamischer Limes, Äquivalenz der Ensembles
- **(2) Entropie & Wahrscheinlichkeit**
  - Boltzmann-Entropie $S = k_\mathrm{B}\ln \Omega$
  - Gibbs-Entropie, Informationsinterpretation
- **(3) Verteilungen & zentrale Sätze**
  - Maxwell-Boltzmann-Verteilung, Fluktuationen
  - Zentraler Grenzwertsatz, Skalen $\propto 1/\sqrt{N}$
- **(4) Ideale Gase & klassische Näherungen**
  - Zustandsgleichung, Equipartition (Grenzen)

#### Thermodynamik
- **(1) Hauptsätze (0.–3.)**
  - $0.$ HS (Temperatur), $1.$ HS $\mathrm{d}E=\delta Q+\delta W$
  - $2.$ HS $\mathrm{d}S\ge \delta Q/T$; isoliert: $\mathrm{d}S\ge 0$
  - $3.$ HS (Grenzverhalten $T\to 0$)
- **(2) Thermodynamische Potentiale & totale Differentiale**
  - $E, H, F, G$; Abhängigkeiten, Legendre-Transformationen
  - Maxwell-Relationen (Schwarz’scher Satz), „nur drei unabhängige Variablen“
- **(3) Kreisprozesse & Diagramme**
  - Carnot-Prozess, Wärmekraftmaschine vs. Wärmepumpe
  - $T\!-\!S$- und $p\!-\!V$-Diagramme, Wirkungsgrad
- **(4) Reversibilität, Prozesse & Arbeit/Wärme**
  - Prozessgrößen vs. Zustandsgrößen, Pfadabhängigkeit

#### Quantenstatistik
- **(1) Bose-/Fermi-Statistik**
  - Besetzungszahlen, chemisches Potential $\mu$
  - Bose-Einstein-Kondensation (Qualitativ), Fermi-See
- **(2) Großkanonisches Ensemble**
  - Rolle von $\mu$, Teilchenzahlschwankungen
- **(3) Niedertemperatur-Grenzfälle**
  - Entartung, Wärmekapazitäten (qualitativ)
- **(4) Vergleich zur klassischen Statistik**
  - Quantenklassischer Übergang, MB-Grenzfall

---

### HTTP: Grundlagen & Versionen (HTTP/1.1 vs HTTP/2 vs HTTP/3)
- **HTTP-Modell**
  - **Request/Response**: Methode (GET/POST/PUT/DELETE), URL, Statuscodes (2xx/3xx/4xx/5xx)
  - **Header**: Host, Accept*, Content-Type, Authorization, Cache-Control, ETag, Cookie/Set-Cookie
  - **Bodies**: JSON, HTML, Formdaten, Datei-Uploads (multipart)
- **Caching (wichtig für Betrieb/Performance)**
  - **Freshness**: `Cache-Control: max-age`, `Expires`
  - **Validation**: `ETag`/`If-None-Match`, `Last-Modified`/`If-Modified-Since` $\rightarrow$ **304 Not Modified**
  - **Vary** (Content Negotiation), CDN-Verhalten beachten
- **Cookies & Sessions**
  - Attribute: **Secure**, **HttpOnly**, **SameSite**
  - Typisch: Session-ID (Server-side), JWT (Client-side, vorsichtig)
- **Content Negotiation**
  - `Accept`, `Accept-Encoding` (gzip/br), `Accept-Language`
- **HTTP/1.1**
  - Keep-Alive möglich, aber **Head-of-Line** auf TCP-Ebene bei Paketverlust
  - Mehrere Requests häufig über mehrere Verbindungen (früher „Domain Sharding“)
- **HTTP/2**
  - **Multiplexing** (mehrere Streams über *eine* TCP-Verbindung)
  - Header-Kompression (HPACK), Priorisierung (praktisch oft eingeschränkt)
  - **Server Push**: historisch, heute i. d. R. **nicht mehr Best Practice**
- **HTTP/3**
  - Läuft über **QUIC (UDP)**: schnellere Verbindungsaufnahme, weniger Latenz bei Verlust (kein TCP-HoL)
  - TLS 1.3 ist integriert (Handshake/Keys im QUIC-Design)
- **Heutige Best Practices (kurz)**
  - HTTP/2 oder HTTP/3 aktivieren, **TLS korrekt**, sinnvolles Caching, **Server Push vermeiden**
  - Kompression (br/gzip), klare Timeouts, Rate Limits, saubere Redirects (HSTS beachten)

---

### TLS & HTTPS (inkl. QUIC-Einbettung)
- **Ziele**
  - **Vertraulichkeit**, **Integrität**, **Authentizität** (Server i. d. R.)
- **Handshake (grobe Schritte)**
  - ClientHello: Versionen, Cipher Suites, **SNI**, **ALPN**
  - ServerHello: Auswahl, Zertifikatskette, (EC)DHE-Schlüsselanteil
  - Schlüsselableitung $\rightarrow$ symmetrische Sitzungsschlüssel
- **Zertifikate & PKI**
  - X.509-Kette: Leaf $\rightarrow$ Intermediate $\rightarrow$ Root (Trust Store)
  - Validierung: Name (SAN), Zeit, Signatur, ggf. Revocation (OCSP/Stapling)
- **SNI & ALPN**
  - **SNI**: richtiger Hostname bei Virtual Hosting
  - **ALPN**: Aushandlung von HTTP/1.1 vs h2 vs h3
- **Forward Secrecy**
  - Durch (EC)DHE: kompromittierter Server-Key entschlüsselt nicht rückwirkend alte Sessions
- **Typische TLS-Fehlerbilder**
  - Zertifikat abgelaufen/Name falsch/Chain unvollständig $\rightarrow$ Browser: „certificate error“
  - Zeit/Clock-Skew auf Client
  - ALPN-/Protokoll-Mismatch, veraltete Cipher Suites
- **Einbettung**
  - **HTTPS**: HTTP über TLS über TCP
  - **HTTP/3**: HTTP über QUIC, TLS 1.3 im QUIC-Handshake

---

### DNS: Grundlagen, Sicherheit, moderne Transporte
- **Auflösung**
  - **Rekursiv** (Client $\rightarrow$ Resolver) vs. **iterativ** (Resolver $\rightarrow$ Root/TLD/Auth)
  - **Caching** mit **TTL**: schneller, aber Fehler/Änderungen propagieren verzögert
- **Wichtige Record-Typen**
  - **A/AAAA** (IPv4/IPv6), **CNAME** (Alias), **MX** (Mail), **TXT** (SPF/Verifikation), **NS**, **SOA**, **SRV**
- **DNSSEC (Kernidee)**
  - Signierte Zonen-Daten (RRSIG), Chain of Trust (DS)
  - Schützt gegen **Cache Poisoning** (Integrität/Authentizität der DNS-Antwort), **keine** Verschlüsselung
- **DoT/DoH**
  - **DoT**: DNS over TLS (typ. Port 853)
  - **DoH**: DNS over HTTPS (Port 443), schwerer zu filtern, Betrieb/Policy beachten
- **Betriebsrelevante Fehler**
  - NXDOMAIN vs. SERVFAIL, falsche Delegation/NS, zu lange TTL, kaputte DNSSEC-Kette

---

### DHCP: Host-Konfiguration (IP, Gateway, DNS)
- **Lease-Konzept**
  - Zeitlich begrenzte Zuweisung; Renewal (T1/T2), Rebinding
- **DORA-Prozess**
  - **Discover** $\rightarrow$ **Offer** $\rightarrow$ **Request** $\rightarrow$ **Ack**
- **Typische Optionen**
  - IP/Netmask, Default Gateway, DNS-Server, Domain Search, NTP
- **Fehlerbilder**
  - Kein Lease (VLAN/Relay/Firewall), falsches Gateway/DNS, IP-Konflikte

---

### E-Mail: SMTP, IMAP, POP3 + Anti-Spoofing
- **SMTP (Versand/Relay)**
  - Client $\rightarrow$ Submission (typ. 587 mit STARTTLS), Server-zu-Server (25)
  - Auth (SASL), Queueing/Retry bei temporären Fehlern (4xx)
- **IMAP/POP3 (Abruf)**
  - IMAP: serverseitige Mailbox/Sync (typ. 993 TLS)
  - POP3: Abholen (typ. 995 TLS), weniger Sync-Funktionen
- **SPF / DKIM / DMARC**
  - **SPF (TXT)**: welche Server dürfen für Domain senden (IP/Include)
  - **DKIM**: Signatur im Header, Public Key via DNS (Integrität/Domainbindung)
  - **DMARC**: Policy + Alignment (SPF/DKIM), Reports (rua/ruf)
- **Typische Betriebsprobleme**
  - Fehlende Reverse DNS/HELO-Policy, kaputte SPF/DKIM, TLS-Probleme, Blacklisting

---

### SSH: Sicheres Remote-Management
- **Auth**
  - Passwort (vermeiden), **Public-Key** (empfohlen)
  - Key-Typen: ed25519 (modern), RSA (legacy)
- **ssh-agent**
  - Schlüssel im Agent statt auf Platte/Passphrase-Prompts; Forwarding vorsichtig
- **Port Forwarding**
  - **Local (-L)**: lokalen Port auf Remote-Ziel tunneln
  - **Remote (-R)**: Remote-Port auf lokalen Dienst
  - **Dynamic (-D)**: SOCKS-Proxy (Tunnel für mehrere Ziele)
- **Hardening (kurz)**
  - Root-Login aus, MFA/2FA wo möglich, Fail2ban, AllowLists

---

### Ports, Firewall/NAT, Logs (Betrieb)
| Dienst | Typische Ports | Hinweise |
|---|---:|---|
| HTTP | 80/tcp | Redirect auf HTTPS, ACME Challenges |
| HTTPS | 443/tcp | TLS, HTTP/2 via ALPN |
| HTTP/3 | 443/udp | QUIC; UDP-Freigaben nötig |
| DNS | 53/udp,tcp | TCP für große Antworten/Zone Transfers |
| DoT | 853/tcp | Policy/Inspection schwieriger |
| SMTP | 25/tcp | Server-zu-Server |
| Submission | 587/tcp | Client-Versand, STARTTLS |
| SMTPS | 465/tcp | TLS „implicit“ |
| IMAPS | 993/tcp | TLS |
| POP3S | 995/tcp | TLS |
| DHCP | 67/udp, 68/udp | Broadcast/Relay, VLAN-Grenzen |
| SSH | 22/tcp | Admin-Zugriff, Bastion-Design |

- **Firewall/NAT-Auswirkungen**
  - NAT kann **Inbound** brechen (Port-Forward nötig), **UDP** für QUIC oft geblockt
  - PMTU/ICMP-Blocking $\rightarrow$ MTU-Probleme („stalls“, große TLS Records)
- **Logs**
  - Web: Access/Error Logs (Statuscodes, Latenzen)
  - DNS: Resolver-Logs, SERVFAIL/NXDOMAIN-Raten
  - Mail: SMTP-Logs (Queue, Rejections), Auth-Logs
  - System: journald/syslog, Auth (sshd)

---

### Monitoring & Troubleshooting: Tools + Beispiel-Workflows
#### Standard-Tools (was sie zeigen)
- **curl**: HTTP/TLS-Tests (`-v`, `--http2`, `--http3`, `-I`)
- **dig/nslookup**: DNS-Auflösung, TTL, Authoritative Answers, DNSSEC (`+dnssec`)
- **tcpdump/Wireshark**: Paketebene (SYN/SYN-ACK, Retransmits, TLS Alerts, QUIC)
- **traceroute / mtr**: Pfad, Paketverlust/Latenz pro Hop (Routing/Peering)
- **ss/netstat**: lokale Sockets/Listening Ports
- **openssl s_client**: Zertifikatskette, SNI, ALPN, Fehlerdetails

#### Workflow: DNS-Fehler vs. TLS-Fehler vs. Routing vs. MTU
- **1) DNS prüfen**
  - `dig A/AAAA example.com` $\rightarrow$ NXDOMAIN? falsche IP? TTL?
  - `dig +trace` $\rightarrow$ Delegation/NS-Fehler lokalisieren
  - DNSSEC: SERVFAIL nur bei validierenden Resolvern? `dig +dnssec`
- **2) TCP/UDP Erreichbarkeit**
  - `mtr host` $\rightarrow$ Routing/Packetloss-Hinweise
  - QUIC/HTTP3: UDP 443 geblockt? (Fallback auf TCP möglich, aber langsam/anders)
- **3) TLS isolieren**
  - `openssl s_client -servername host -connect host:443` $\rightarrow$ Chain/SNI/ALPN
  - Typisch: falsches Zertifikat (SNI fehlt), Intermediate fehlt, Uhrzeit falsch
- **4) HTTP-Level**
  - `curl -v https://host/path` $\rightarrow$ Redirect-Loops, 403/WAF, Caching-Header
- **5) MTU/PMTU-Verdacht**
  - Symptome: Handshake hängt, große Responses brechen, nur bestimmte Netze betroffen
  - In Capture: Retransmits, Fragmentation/ICMP blackhole (wenn ICMP geblockt)

---

---

## Quick Reference: Key Formulas

### Statistische Physik – Ensembles & Zustandssummen
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Mikrokanonische Zustandssumme (Anzahl zugänglicher Zustände im Energiefenster) | $$\Omega=\sum_{E \leq \mathcal{H} \leq E+\Delta E} 1$$ | $\Omega$: Multiplizität; $\mathcal{H}$: Hamiltonfunktion; $E$: Energie; $\Delta E$: Energiefenster |
| Kanonische Zustandssumme (Partition function) | $$Z=\sum_{r}\mathrm{e}^{-\beta E_{r}}$$ | $Z$: Zustandssumme; $r$: Mikrozustand/Levelindex; $E_r$: Energie des Zustands $r$; $\beta$: inverse Temperaturgröße |

---

### Wahrscheinlichkeitsverteilungen (Statistik)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Binomialverteilung (z. B. Random Walk: $r$ Schritte nach rechts in $n$ Schritten) | $$P(r)=\binom{n}{r}p^{r}(1-p)^{n-r}$$ | $P(r)$: Wahrscheinlichkeit; $n$: Anzahl Versuche/Schritte; $r$: Anzahl Erfolge/Rechtsschritte; $p$: Erfolgswahrscheinlichkeit pro Schritt |

---

### Thermodynamik – Hauptsätze & fundamentale Gleichung
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| 1. Hauptsatz (Energieerhaltung) | $$\mathrm{d}E=\delta W+\delta Q$$ | $E$: (innere) Energie; $\delta W$: Arbeit (Prozessgröße); $\delta Q$: Wärme (Prozessgröße) |
| 1. Hauptsatz (äquivalente Schreibweise) | $$\mathrm{d}E=\delta Q+\delta W$$ | wie oben (nur vertauschte Reihenfolge) |
| 2. Hauptsatz (Clausius-Ungleichung) | $$\mathrm{d}S \geq \frac{\delta Q}{T}$$ | $S$: Entropie; $\delta Q$: zu-/abgeführte Wärme; $T$: Temperatur |
| Fundamentale Zustandsgleichung / Gibbs’sche Fundamentalgleichung | $$dE=T\,dS-p\,dV+\mu\,dN$$ | $T$: Temperatur; $S$: Entropie; $p$: Druck; $V$: Volumen; $\mu$: chemisches Potential; $N$: Teilchenzahl |

---

### Quantenstatistik – Wärmekapazität (qualitative Skalierungen)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Grenzwert der Wärmekapazität (angegeben) | $$\frac{3}{2}k_{b}N$$ | $k_b$: Boltzmann-Konstante; $N$: Teilchenzahl |
| Tiefe Temperaturen (Bosonen, Korrektur im Text) | $$\mathrm{C}_{V}\propto T^{\frac{3}{2}}$$ | $\mathrm{C}_V$: Wärmekapazität bei konstantem Volumen; $T$: Temperatur |
| Temperaturabhängigkeit vor dem Übergang (Bosonen, angegeben) | $$\propto T^{\frac{3}{2}}$$ | proportional zu $T^{3/2}$ (Kontext: Anstieg einer Kurve vor dem Phasenübergang); $T$: Temperatur |

---

### Ising-/Mean-Field-ähnliche Umformungen (wie im Material notiert)
| Formelname / Beschreibung | Formel (LaTeX) | Variablen (kurz) |
|---|---|---|
| Fluktuationsvariable (Verschiebung um den Mittelwert) | $$\sigma_{i}^{\prime}=\sigma_{i}-\langle\sigma\rangle$$ | $\sigma_i$: Spin/Variable am Gitterplatz $i$; $\langle\sigma\rangle$: Mittelwert; $\sigma_i'$: Abweichung |
| Hamiltonian nach Einsetzen (Nearest-Neighbor-Summe; Schritt 1) | $$H=J \sum_{i} \sum_{k,\text{ nearestneighbor }}\left(\sigma_{i}^{\prime}-\langle\sigma\rangle\right)\left(\sigma_{k}^{\prime}-\langle\sigma\rangle\right)$$ | $H$: Hamiltonoperator/-funktion; $J$: Kopplung; $i$: Gitterindex; $k$: nächster Nachbar; $\langle\sigma\rangle$: Mittelwert |
| Ausmultiplizierte Form (wie im Text) | $$H=J \sum_{i} \sum_{k,\text{ nearestneighbor }}\left(\sigma_{i}^{\prime}\sigma_{k}^{\prime}+\langle\sigma\rangle^{2}-\langle\sigma\rangle o_{i}^{\prime}-\langle\sigma\rangle \sigma_{k}^{\prime}\right)=-2J<\sigma>\sum_{i}\sigma_{i}^{\prime}$$ | gleiche Variablen wie oben; zusätzlich im Text: $o_i'$ (steht dort so, vermutlich gemeint $\sigma_i'$); $<\sigma>$ ist identisch zu $\langle\sigma\rangle$ (Mittelwert) |
