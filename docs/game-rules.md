# Spielregeln: Bochum Smart City Simulation

**Als neuer Bürgermeister: 60 Monate lang Energieversorgung sichern trotz Wetter, Verbrauch, Budget und Bürgerreaktionen.**

Ein kartenbasiertes Planspiel für Bochum: Du baust städtische Solar- und Windanlagen, setzt Speicher ein und förderst private Anlagen. Deine Entscheidungen beeinflussen die Energiebilanz, die Stadtkasse und die Bürgerzufriedenheit.

**Titel der Projektarbeit:** Entwicklung eines Planspiels zur Simulation einer Smart City mit Fokus auf Smart Environment und Smart Energy anhand einer 2D-Karte

Der spielbare MVP konzentriert sich auf Smart Energy. Smart Environment bildet den thematischen Rahmen; eine eigene CO₂-Bilanz oder umfassende Umweltsimulation ist bislang nicht implementiert.

## Spielstart und Ziel

| Startwert | Aktueller Wert |
|---|---:|
| Amtszeit / Spieldauer | 60 Monate |
| Budget | 18.000.000 € |
| Energieautarkie | 0 % |
| Bürgerzufriedenheit | 50 % |
| Versorgungssicherheit | 0 % |
| Öffentliche und private Anlagen | keine |
| Gespeicherte Energie | 0 Einheiten |
| Förderstufen | jeweils 0 |

Ziel ist, die 60 Monate mit tragfähigem Budget und Bürgerunterstützung zu absolvieren und einen hohen Endscore zu erreichen. Die Runde endet vorzeitig bei Budget ≤ 0 € (**Bankrott**) oder Bürgerzufriedenheit ≤ 0 (**Abgewählt**). Fehlende Energie wird importiert und verursacht Kosten.

## So spielt sich eine Runde

1. Wetterprognose für den aktuellen und die zwei folgenden Monate ansehen.
2. Technologie und passende Spielzone auswählen.
3. Anlage auf die Karte ziehen oder eine Förderstufe einstellen.
4. Kaufpreis, Bauzeit, Betriebskosten und Bürgerwirkung berücksichtigen.
5. Mit **Nächster Monat** die Monatsabrechnung auslösen.
6. Energiebilanz, Budget und Kennzahlen prüfen und die Strategie anpassen.

Neue öffentliche Anlagen kosten sofort Geld und werden beim nächsten Monatswechsel nach einem Monat Bauzeit aktiviert. Sie gehen dann in die Monatsabrechnung ein. Platzierungen und Verkäufe lassen sich innerhalb des laufenden Monats rückgängig machen; beim Monatswechsel wird der Undo-Verlauf geleert.

Die Einführung erklärt beim ersten Start und nach einem Neustart Spielstatus, Kennzahlen, Wetter, Förderungen, Bauoptionen und Steuerung.

## Anlagen und Standortwahl

Alle Werte sind **MVP-Balancingwerte**. Energieeinheiten entsprechen keiner festgelegten realen kWh- oder MWh-Menge.

| Öffentliche Anlage | Kaufpreis | Erzeugung / Kapazität | Betriebskosten pro Monat | Bürgerwirkung pro aktivem Monat vor Standortfaktor |
|---|---:|---|---:|---:|
| Solaranlage | 1.200.000 € | 7 × aktueller Solarfaktor | 35.000 € | +1 Punkt |
| Kleinwindanlage | 2.800.000 € | 14 × aktueller Windfaktor | 400.000 € | −3 Punkte |
| Energiespeicher | 1.700.000 € | 10 Speichereinheiten, keine Erzeugung | 45.000 € | 0 Punkte |

Die Karte enthält sechs Spielzonen auf Ebene der Bochumer Stadtbezirke: Mitte, Wattenscheid, Nord, Ost, Süd und Südwest. Die Oberfläche verwendet dafür auch den Begriff „Stadtteil“.

| Spielzone | Kapazität Solar / Wind / Speicher | Faktor für Bürgerwirkung |
|---|---|---:|
| Mitte | 12 / 0 / 5 | 1,5 |
| Wattenscheid | 10 / 2 / 4 | 1,0 |
| Nord | 9 / 2 / 3 | 0,5 |
| Ost | 10 / 2 / 4 | 1,0 |
| Süd | 9 / 0 / 4 | 1,5 |
| Südwest | 9 / 0 / 4 | 1,5 |

Windanlagen sind nur in Wattenscheid, Nord und Ost erlaubt. Der Reducer prüft Budget, erlaubte Technologie und freie Kapazität vor jeder Platzierung.

**Baukonzentration:** Ab der dritten öffentlichen Anlage in derselben Zone zieht jeder zusätzliche Bau einmalig einen Punkt Bürgerzufriedenheit ab. Private Anlagen zählen dabei nicht mit.

## Förderung und private Anlagen

| Programm | Stufen | Monatliche Kosten je Stufe | Kapazität je privater Anlage |
|---|---|---:|---|
| Solarförderung | 0–3 | 250.000 € | 7 × aktueller Solarfaktor |
| Speicherförderung | 0–3 | 180.000 € | 10 Reserveeinheiten |

Je Programm entsteht bei jeweils **600.000 € kumulierten Förderausgaben** automatisch eine private Anlage auf der Karte. Restbeträge bleiben für die nächste Anlage erhalten.

- Private Anlagen haben eigene Marker, sind nicht veränderbar und können nicht verkauft werden.
- Für die Stadt entstehen **0 € Betriebskosten** dieser Anlagen; die eingestellte Förderung kostet weiterhin monatlich Geld.
- Private Solarproduktion reduziert den von der Stadt zu versorgenden Restbedarf.
- Private Speicher gleichen bei einem Defizit bis zu **25 % ihrer gesamten Kapazität pro Monat** aus. Das ist eine vereinfachte Reservewirkung ohne eigenen persistenten Ladezustand.
- Private Versorgung erzeugt **keine städtischen Verkaufserlöse**.
- Förderstufen erhöhen zusätzlich die monatliche Bürgerzufriedenheit um 0,4 Punkte je Solarstufe und 0,25 Punkte je Speicherstufe, vor Rundung des Gesamtwerts.

Private und öffentliche Anlagen haben dieselben nominalen Produktions- bzw. Kapazitätswerte. Die Speicherlogik unterscheidet sich jedoch: Öffentliche Speicher werden aus Überschüssen geladen und behalten ihre gespeicherte Energie zwischen den Monaten.

## Wetter, Verbrauch und Wirtschaft

Jede neue Sitzung erhält einen Wetter-Seed. Gleicher Seed und gleiche Entscheidungen ermöglichen einen reproduzierbaren Verlauf. Die Auswahl gewichtet sonnige Monate beispielsweise im Sommer mit 70 % und im Winter mit 20 %.

**Aktuelle Modellgrenze:** Das Wetter hängt vom Kalendermonat und vom Seed modulo 100 ab. Deshalb wiederholt sich die Wetterfolge innerhalb einer Sitzung jährlich; unterschiedliche Seeds können dieselbe Folge ergeben. Die Prognose zeigt diese berechnete Folge, die Konfidenzlabels erzeugen keinen zusätzlichen Prognosefehler.

Der saisonale Grundbedarf beträgt von Januar bis Dezember:

```text
95, 90, 80, 72, 65, 60, 60, 63, 70, 78, 88, 100 Energieeinheiten
```

Darauf wirkt ein linearer Wachstumsfaktor von **1,00 bis 1,35** über 60 Monate. Am Spielende beträgt der Bedarf damit **135 % des jeweiligen saisonalen Grundbedarfs**, also **35 % mehr**. Durch die Saisonalität steigt der tatsächliche Verbrauch nicht jeden Monat.

Die monatliche Wirtschaft rechnet mit:

- **38.000 € Erlös je Energieeinheit** des Bedarfs nach Abzug privater Versorgung, einschließlich importierter Energie.
- **70.000 € Importkosten je fehlender Energieeinheit** nach Produktion und Speicherentlastung.
- Betriebskosten aller aktiven öffentlichen Anlagen.
- Kosten der eingestellten Förderstufen.

```text
Monatlicher Budgetsaldo = Verkaufserlöse − Importkosten − Betriebskosten − Förderkosten
```

Überschüsse füllen den öffentlichen Speicher bis zu seiner Kapazität. Darüber hinausgehende Energie verfällt; das Modell zahlt keinen Exporterlös.

## Kennzahlen und Endscore

**Energieautarkie** wird bei jeder Monatsabrechnung aus dem lokal gedeckten Bedarf neu berechnet:

```text
Autarkie = (Bedarf − notwendiger Import) / Bedarf × 100
```

Dabei zählen öffentliche Produktion, gespeicherte Energie und private Versorgung. Wetter und wachsender Verbrauch können die Autarkie auch bei unverändertem Anlagenbestand verändern.

**Versorgungssicherheit** wird aus dem aktuellen Bestand neu berechnet:

```text
Sicherheit = 0,5 × aktive öffentliche Speicherkapazität
             + 2 Punkte bei mindestens einer aktiven öffentlichen Solar- und Windanlage
             + min(4; 0,08 × private Speicherkapazität)
```

Sie ist eine vereinfachte Strukturkennzahl und keine berechnete Ausfallwahrscheinlichkeit. Wetter, aktueller Speicherfüllstand und Verbrauch gehen derzeit nicht direkt in diesen Wert ein. Bei unverändertem Bestand bleibt er gleich. Die Resilienzidee steckt in den Berechnungsregeln; eine zusätzliche Resilienzkennzahl in der UI gibt es nicht.

**Bürgerzufriedenheit** entwickelt sich dagegen über die Monate fortlaufend aus Anlagenwirkungen, Standortfaktoren, Förderung und unmittelbaren Bauabzügen. Alle drei KPIs werden auf ganze Werte gerundet und auf 0–100 begrenzt.

Autarkie und Versorgungssicherheit werden **nicht mehr zum Wert des Vormonats addiert**. Bestehende Spielstände erhalten die neu berechneten Werte bei der nächsten Monatsabrechnung.

Der Endscore addiert:

| Bestandteil | Punkte |
|---|---|
| Verbleibendes Budget | 1 je volle 1.000.000 € |
| Energieautarkie | 1 je volle 10 Prozentpunkte |
| Bürgerzufriedenheit | 1 je volle 10 Prozentpunkte |
| Versorgungssicherheit | 1 je volle 10 Prozentpunkte |

Es gibt keine prozentuale Gewichtung der vier Bestandteile. Der Endscreen zeigt Gesamtwert und Teilwerte.

## Oberfläche und Speicherung

- 2D-Karte mit Leaflet, CARTO-Light im Cozy-Stil und OpenStreetMap als Alternative ohne CARTO-Key.
- Sichtbare Stadtgrenze sowie dauerhaft sichtbare Zonengrenzen und Namen unterhalb der interaktiven Anlagenebene.
- Ausgeblendete blaue Postleitzahlgrenzen.
- Pointer-Drag mit Vorschau und Zonenfeedback, Anlagendetails, Verkauf und Undo.
- Sidebar mit Wetter, Kennzahlen, Förderungen, Bauoptionen und statischer Strategie-Sweep-Grafik.
- Monatswechsel mit Übergangseffekt und KPI-Veränderungen.
- Spielstand und Einführungsstatus im Browser-`localStorage`.
- Ein Neuladen erhält den Spielstand. Zurücksetzen erfordert eine Bestätigung und beginnt eine neue Sitzung.

Es gibt kein Login, eigenes Backend oder eine Datenbank. Spielstände sind an Browser und Gerät gebunden. Kartenkacheln kommen von externen Diensten.
