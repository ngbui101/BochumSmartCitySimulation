# Startwert-Simulation

Dieses Verzeichnis simuliert die aktuelle MVP-Spielökonomie unabhängig von der React-Webanwendung.

## Ausführen

Mit Python 3.12 (CI-Referenz) oder einer kompatiblen neueren Version:

```text
python simulations/start_value_sweep.py --seeds 100
```

Die Ergebnisse werden nach `simulations/results/` geschrieben:

- `start-value-sweep.json` enthält vollständige Monatsverläufe.
- `start-value-sweep.csv` enthält eine Zeile pro Sitzung.

Verglichen werden ein historisches Startprofil (`current`) und die aktuellen Start-KPIs (`challenge`):

```text
Historisch (current): Budget 18.000.000 €, Autarkie 18, Zufriedenheit 72, Sicherheit 58
Produktionsstart (challenge): Budget 18.000.000 €, Autarkie 0,  Zufriedenheit 50, Sicherheit 0
```

Die Simulation verwendet reproduzierbare Wetter-Seeds und die Strategien `solar_first`,
`wind_first`, `balanced`, `storage_first`, `subsidy_first` und `adaptive`.

**Abgleich mit der Webanwendung:** Im Verbrauchs-Sweep entspricht `challenge` mit Endfaktor **1,35** den aktuellen Start- und Nachfrageparametern. Der einfache Startwertvergleich verwendet weiterhin einen Endfaktor von 2,0 als Belastungsszenario.

Regeln des Vergleichs:

- Der Monatsverbrauch wächst linear von 100 % auf 200 % im 60. Monat.
- Ab dem dritten öffentlichen Bauwerk in einem Stadtteil wird einmalig je weiterem
  Bauwerk ein Bürgerzufriedenheitspunkt abgezogen.
- Private Solaranlagen entlasten das Netz mit 7 Einheiten je Anlage, private Speicher
  mit 10 Reserveeinheiten je Anlage – jeweils wie die öffentliche Entsprechung.
- Private Energie senkt den von der Stadt versorgten Restbedarf und erzeugt für diesen
  privaten Anteil keine städtischen Einnahmen.
- Energieautarkie und Versorgungssicherheit werden jeden Monat aus der aktuellen
  Energiedeckung, Speicherstruktur und Erzeugungsmischung neu berechnet; sie steigen
  nicht allein durch Zeitablauf.

Zusätzlich führt der Standardlauf einen Verbrauchs-Sweep mit den Endwerten 125 %,
130 %, 135 %, 140 %, 145 %, 150 %, 160 %, 175 % und 200 % durch. Die zusammengefassten Ergebnisse stehen in
`demand-growth-sweep.csv` und `demand-growth-sweep.json`.

Das Matplotlib-Diagramm mit den Erfolgsquoten aller Strategien sowie der Markierung
des Produktions-Sweet-Spots von 135 % bis 200 % wird so erzeugt:

```text
python -m pip install -r simulations/requirements.txt
python simulations/start_value_sweep.py --seeds 100
python simulations/plot_sweep.py
```

Die Grafik wird als `simulations/results/demand-growth-sweep-challenge.png` gespeichert.
