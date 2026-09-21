# Strategiehilfe aus den Entscheidungsabhängigkeiten

Diese Strategiehilfe leitet Spielentscheidungen aus dem aktuellen MVP-Regelwerk ab. Die Zahlen sind Spiel- und Balancingwerte, keine reale Energieprognose.

## Die wichtigste Schleife

```text
Wetterprognose lesen
        ↓
Technologie und Zone wählen
        ↓
Budget, Kapazität und Akzeptanz prüfen
        ↓
Anlage bauen / Förderung setzen
        ↓
Monat wechseln: Produktion, Speicher, Importe und Kosten auswerten
        ↓
Nächste Entscheidung an Defizit oder Überschuss anpassen
```

## Was eine Entscheidung auslöst

| Entscheidung | Direkte Wirkung | Wichtigster Zielkonflikt |
|---|---|---|
| Solaranlage | 7 Produktion × Solarfaktor; +1 Bürgerwirkung; 1,2 Mio. €; 35.000 €/Monat | saisonal schwach im Winter |
| Kleinwindanlage | 14 Produktion × Windfaktor; 2,8 Mio. €; 80.000 €/Monat | −3 Bürgerwirkung × Akzeptanzfaktor |
| Energiespeicher | 10 Einheiten Kapazität; 1,7 Mio. €; 45.000 €/Monat | erzeugt keinen Strom, bindet aber Budget |
| Solar-Förderung | je Level 250.000 €/Monat; +2 private Solar-Einheiten je Level und Monat | laufende Kosten gegen privaten Ausbau |
| Speicher-Förderung | je Level 180.000 €/Monat; +3 private Speicher-Einheiten je Level und Monat | laufende Kosten gegen Versorgungssicherheit |
| Zone | bestimmt erlaubte Technologie, Kapazität und Akzeptanzfaktor | gute Flächen sind begrenzt |
| Monatswechsel | aktiviert Anlagen nach 1 Monat und rechnet Bilanz ab | zu spätes Bauen verpasst Produktionsmonate |

## Zonen als strategische Entscheidung

| Zone | Erlaubt | Kapazität Solar / Wind / Speicher | Akzeptanz | Lesart |
|---|---|---:|---|---|
| Mitte | Solar, Speicher | 12 / 0 / 5 | hoch (1,5) | starke Solar- und Speicherbasis, kein Wind |
| Wattenscheid | Solar, Wind, Speicher | 10 / 2 / 4 | mittel (1,0) | flexibler Mischstandort |
| Nord | Solar, Wind, Speicher | 9 / 2 / 3 | niedrig (0,5) | guter Windstandort mit geringerer Akzeptanzstrafe |
| Ost | Solar, Wind, Speicher | 10 / 2 / 4 | mittel (1,0) | zweiter flexibler Mischstandort |
| Süd | Solar, Speicher | 9 / 0 / 4 | hoch (1,5) | Solar für Zufriedenheit und Campusprofil |
| Südwest | Solar, Speicher | 9 / 0 / 4 | hoch (1,5) | Solar für Wohnprofil und Akzeptanz |

Wichtig: Wind ist nur in Wattenscheid, Nord und Ost erlaubt. Die niedrigere Akzeptanzsensitivität in Nord reduziert dort die negative Bürgerwirkung von Wind.

## Strategie 1: Stabiler Start

Ziel: Budget schützen, früh Autarkie aufbauen und keine großen Importkosten erzeugen.

1. Mit Solar in einer Zone mit hoher Akzeptanz starten, insbesondere Mitte, Süd oder Südwest.
2. Früh mindestens einen Speicher einplanen, sobald die Produktion Überschüsse erzeugen kann.
3. Nicht das gesamte Startbudget ausgeben: Jede Anlage ist erst im Folgemonat aktiv und verursacht danach Betriebskosten.
4. Nach jedem Monatswechsel prüfen, ob ein Defizit aus Importen oder ein ungenutzter Überschuss entsteht.

Diese Linie nutzt die hohe Gewichtung der Energieautarkie (35 %) und hält Bürgerzufriedenheit sowie Budgeteffizienz stabil.

## Strategie 2: Winter- und Versorgungssicherheit

Ziel: hohe Nachfrage und schwache Solar-Monate abfedern.

1. Vor Herbst und Winter Speicher aufbauen, statt ausschließlich weitere Solarproduktion zu kaufen.
2. Wind in Nord, Wattenscheid oder Ost einsetzen, wenn die Prognose windige oder stürmische Monate ankündigt.
3. Die negative Windwirkung auf die Bürgerzufriedenheit durch die Wahl von Nord oder eine ausgewogene Solar-/Speichermischung abfedern.
4. Speicherförderung nutzen, wenn die monatlichen Förderkosten durch vermiedene Importe gerechtfertigt sind.

Diese Linie stärkt Versorgungssicherheit (25 %) und reduziert Importkosten von 60.000 € je fehlender Energieeinheit.

## Strategie 3: Autarkie und Score maximieren

Ziel: Energieautarkie und Versorgungssicherheit gemeinsam erhöhen.

1. Solar und Wind mischen: Der aktuelle Regelstand gibt bei mindestens einer aktiven Solar- und Windanlage einen Versorgungssicherheits-Mixbonus von 2.
2. Solar bevorzugt in Süd, Südwest oder Mitte platzieren, um Produktion und Bürgerzufriedenheit zu verbinden.
3. Wind eher in Nord sowie den flexiblen Mischzonen einsetzen und die höheren Investitions- und Betriebskosten einplanen.
4. Speicher nachziehen, damit Überschüsse nicht vollständig verloren gehen und Defizite nicht sofort importiert werden müssen.

Der Mix ist wirkungsvoll, aber teurer. Er sollte erst verfolgt werden, wenn das Budget die laufenden Kosten und die einmonatige Bauverzögerung verkraftet.

## Wetter- und Monatslogik

| Phase | Spielregel | Konsequenz |
|---|---|---|
| Januar / Februar | Windfaktor 1,25 / 1,20; Nachfrage 95 / 90 | Wind und Speicher sind wertvoll, Solar allein ist schwächer |
| Mai bis August | Solarfaktor 1,20–1,40; Nachfrage 65–60 | Solar liefert starke Überschüsse, Speicher verhindert Verschwendung |
| Oktober bis Dezember | Nachfrage 78–100; Windfaktor bis 1,35 | vorgezogener Speicher- und Windaufbau kann Importe senken |
| Monatswechsel allgemein | neue Anlagen werden erst im Folgemonat aktiv | nicht erst im Defizitmonat bauen |

## KPI-Priorität

Der Endscore wird aktuell so gewichtet:

- Energieautarkie: 35 %
- Versorgungssicherheit: 25 %
- Bürgerzufriedenheit: 20 %
- Budgeteffizienz: 20 %

Daraus folgt: Eine Strategie nur für das Budget ist nicht optimal. Der größte Hebel ist zusätzliche Produktion, aber sie muss mit Speicher, Akzeptanz und laufenden Kosten zusammenpassen.

## Monats-Checkliste

- Welche Wetterfaktoren gelten für die nächsten drei Monate?
- Wie hoch ist die Nachfrage im kommenden Monat?
- Welche Zone erlaubt die gewünschte Technologie noch und hat freie Kapazität?
- Reicht das Budget für Kaufpreis, Betriebskosten und Förderkosten?
- Ist ein Speicher nötig, um Überschüsse zu nutzen oder Defizite abzufedern?
- Wird die Anlage rechtzeitig vor dem kritischen Monat gebaut?
- Welcher KPI ist aktuell der schwächste: Autarkie, Sicherheit, Zufriedenheit oder Budget?

## Grenzen der aktuellen Strategiehilfe

Die Strategien beschreiben das aktuelle MVP-Verhalten. Besonders die Produktionswerte, Bürgerwirkungen, Nachfrage und Förderwirkungen sind als `mvp-playtest-value` bzw. Balancingwerte modelliert. Wenn sich diese Werte ändern, muss auch die Strategiehilfe neu bewertet werden.
