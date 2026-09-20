# Quick Start, Niederlage und Punktesystem

## Ziel

Neue Spieler sollen das Spiel ohne externe Erklärung verstehen. Die Anleitung soll freundlich, kurz und im bestehenden Cozy-Gaming-Stil erscheinen. Das Spiel soll außerdem eine eindeutige Niederlage und eine leicht verständliche Endpunktzahl haben.

## Quick-Start-Ablauf

- Beim ersten Start zeigt die App einen kurzen Loading-Screen.
- Danach wird das Spiel sichtbar, der Hintergrund leicht abgedunkelt/geb­lurt und ein zentrales Willkommen-Popup angezeigt.
- Das Willkommen-Popup erklärt Ziel und Grundidee des Spiels und bietet „Anleitung starten“ sowie „Anleitung überspringen“.
- Die geführte Anleitung hebt die Sidebar-Gruppen von oben nach unten hervor. Die erklärten Gruppen sind Spielstatus/Monat, Budget und KPIs, Wetter, Förderungen, Bauoptionen sowie Reset/Spielsteuerung.
- Jeder Schritt hat „Weiter“. Der letzte Schritt endet mit einer freundlichen „Viel Spaß!“-Nachricht.
- Skip und Abschluss speichern einen separaten Quick-Start-Schlüssel in `localStorage`.
- Browser-Refresh öffnet die Anleitung nicht erneut.
- „Spiel zurücksetzen“ und „Neustart“ nach einem Endscreen löschen den Quick-Start-Schlüssel und öffnen eine neue Runde mit der Anleitung.
- Falls `localStorage` nicht verfügbar ist, funktioniert die Anleitung in-memory; die bestehende Speicherwarnung bleibt unverändert.

## Verlustregeln

`GameStatus` erhält den Zustand `lost` und `LossReason` die Werte `bankrupt` und `voted_out`.

- Budget kleiner oder gleich 0: `lost` mit `bankrupt`.
- Bürgerzufriedenheit kleiner oder gleich 0: `lost` mit `voted_out`.
- Die Prüfung erfolgt nach Platzieren eines Assets, nach dem Monatswechsel und nach anderen Aktionen, die den Zustand ändern können.
- Wenn beide Grenzen gleichzeitig erreicht werden, hat Bankrott Vorrang.
- Der Endscreen bleibt für Niederlagen sichtbar und zeigt den konkreten Grund sowie die erzielten Punkte.

## Punktesystem

Die KPI-Werte bleiben Prozentwerte von 0 bis 100. Die Endpunktzahl wird so berechnet:

```text
Budgetpunkte = floor(max(0, Budget) / 1.000.000)
Energieautarkie-Punkte = floor(Energieautarkie / 10)
Bürgerzufriedenheits-Punkte = floor(Bürgerzufriedenheit / 10)
Versorgungssicherheits-Punkte = floor(Versorgungssicherheit / 10)
Gesamtpunkte = Summe der vier Werte
```

Die Endscreen-Karten zeigen je Kategorie die Punkte; beim Budget wird zusätzlich der Endbetrag angezeigt. Die qualitative Zusammenfassung verwendet Schwellen passend zur neuen Gesamtpunktzahl.

## UI-Regeln

- Quick-Start und Endscreen verwenden die vorhandenen Cozy-Farben, Kartenradien, Schatten und Button-Stile.
- Die Anleitung ist keyboard-bedienbar und stellt Fokus auf das Popup.
- Die hervorzuhebende Sidebar-Gruppe erhält eine sichtbare, aber nicht aggressive Umrandung.
- Die Anleitung darf die bestehende Spielinteraktion blockieren, bis sie übersprungen oder beendet wird.
