# Projektstatus – 20. September 2026

> Historisches Dokument. Aktuelle Regeln stehen in [Spielregeln](game-rules.md),
> technische Abläufe in [Architektur](architecture.md). Frühere Prüfzahlen und
> Parameter beschreiben ausschließlich den damaligen Stand.

## Kurzfassung

Das Bochum-Smart-City-Projekt ist ein spielbares, clientseitiges MVP. Der aktuelle `main`-Branch ist für ein statisches Vercel-Deployment vorbereitet und enthält den vollständigen Spielablauf ohne Login, eigenes Backend oder Datenbank.

## Aktueller Funktionsumfang

- Spielstart mit leerem Anlagenbestand; Anlagen werden per Pointer-Drag auf der Karte platziert.
- Cozy-Gaming-Kartenstil mit sichtbarer Stadtgrenze, Stadtteilgrenzen und Stadtteilnamen.
- CARTO-Kartenkacheln mit `CARTO_API_KEY`; ohne Key wird der OpenStreetMap-Fallback genutzt.
- Persistenz des Spielstands über `localStorage`: Ein Browser-Refresh erhält den Spielstand.
- Bewusstes Zurücksetzen nach Bestätigung löscht den Spielstand und startet eine neue Runde.
- Quick-Start nur beim ersten Start und nach einem Reset/Neustart:
  1. Loading Screen
  2. Willkommen mit Start/Überspringen
  3. Sechs freundliche Hinweise für die Sidebar
  4. Abschluss mit „Viel Spaß!“
- Die Quick-Start-Erledigung wird getrennt vom Spielstand gespeichert.
- Der aktuelle Erklärungshinweis steht neben dem markierten Sidebar-Element. Die Sidebar scrollt bei unteren Elementen automatisch nach, und das markierte Element bleibt über dem Blur scharf sichtbar.
- Monatswechsel, Wetter, Förderungen, Anlagenstatus, Undo, Verkauf und Endscreen sind integriert.
- Sofortige Niederlage bei Budget <= 0 („Bankrott“) oder Bürgerzufriedenheit <= 0 („Abgewählt“).
- Punkteberechnung:
  - 1 Punkt je volle 1.000.000 Euro Budget
  - 1 Punkt je volle 10 Prozent Energieautarkie
  - 1 Punkt je volle 10 Prozent Bürgerzufriedenheit
  - 1 Punkt je volle 10 Prozent Versorgungssicherheit

## Technischer Stand

- Stack: React 18, TypeScript, Vite, Leaflet, React-Leaflet.
- Hosting: statisches Vercel-Deployment, Produktions-Branch `main`.
- Speicherung: ausschließlich Browser-`localStorage`; keine Synchronisierung zwischen Geräten oder Browsern.
- Produktionsstand auf GitHub: Commit `0107643` (`merge: fix quick start spotlight positioning`).

## Qualitätssicherung

Der zusammengeführte `main`-Stand wurde geprüft:

- Vitest: 31 Testdateien, 163 Tests bestanden.
- TypeScript: `tsc --noEmit` bestanden.
- Vite: Produktions-Build bestanden.
- Playwright: Produktions-Smoke-Test bestanden.
- Browserprüfung: Quick-Start-Hinweis neben Sidebar-Ziel, Auto-Scroll für untere Ziele und scharfe Hervorhebung über dem Blur bestätigt.

## Deployment-Vertrag

Für Vercel gelten:

- Project Root: `frontend`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`
- Production Branch: `main`
- `CARTO_API_KEY`: als Vercel-Production-Variable setzen und bei CARTO auf die eigene Domain beschränken.

## Bekannte Grenzen und nächste sinnvolle Schritte

- `localStorage` ist browser- und gerätegebunden; ein gemeinsamer Spielstand oder Mehrgeräte-Synchronisierung ist nicht Teil des MVP.
- Der CARTO-Key ist in einer Browser-Anwendung technisch sichtbar und muss deshalb über Domain- und Nutzungsbeschränkungen abgesichert werden.
- Vor einer öffentlichen Bekanntmachung sollte noch ein kurzer manueller Abnahmetest auf Mobilgröße, Desktopgröße, Refresh, Reset und Niederlage durchgeführt werden.
- Balancing-Werte bleiben Spielwerte und sind keine realen Energieprognosen.
