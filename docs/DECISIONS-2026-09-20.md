# Entscheidungsprotokoll – 20. September 2026

> Historisches Dokument. Aktuelle Regeln stehen in [Spielregeln](game-rules.md),
> technische Abläufe in [Architektur](architecture.md). Frühere Prüfzahlen und
> Parameter beschreiben ausschließlich den damaligen Stand.

Dieses Protokoll hält die heute gemeinsam festgelegten Produkt- und Technikentscheidungen für die Bochum Smart City Simulation fest.

## Produktentscheidungen

### Spielstart ohne Bestandsanlagen

- Es gibt keine bestehenden oder vorplatzierten Anlagen mehr.
- Der Spielstand startet mit einem leeren Anlagenbestand; Anlagen werden ausschließlich vom Spieler platziert.
- Auch geladene ältere Spielstände werden auf `existingAssets: []` normalisiert, damit keine veralteten Bestandsanlagen wieder erscheinen.
- Nicht verifizierte reale Anlagen werden nicht als Spielplatzhalter angezeigt.

### Kartenoptik und UI

- Die frühere, bevorzugte UI bleibt erhalten.
- Die Karte soll im Cozy-Gaming-Stil bleiben: helle Kartengrundlage, sanfte Grüntöne und dezente Beschriftungen.
- Die Stadtgrenze von Bochum bleibt als rote, sichtbare Linie erhalten.
- Die Stadtteilgrenzen bleiben als dezente grüne Linien immer sichtbar; sie sind nicht mehr von Hover abhängig.
- Die blaue Postleitzahlengrenze wird nicht gezeichnet (`opacity: 0`), die zugrunde liegenden Daten bleiben für eine spätere Reaktivierung im Projekt.

### Stadtteilnamen

- Die Namen aller Stadtteile sind dauerhaft sichtbar und müssen nicht mehr per Hover eingeblendet werden.
- Die Beschriftungen liegen in einer eigenen Leaflet-Pane (`zone-labels`) mit `z-index: 350` unterhalb der Karten-Overlay-Pane (`z-index: 400`).
- Die Labels sind nicht interaktiv, damit sie Platzierung, Hover und Klick nicht blockieren.
- Ein Klick auf einen Stadtteil öffnet weiterhin die vorhandene Detailkarte; Hover bleibt für visuelles Feedback verfügbar.

### Produktions-Sweet-Spot für Wetter und Wirtschaft

- Jede neue Spielsitzung verwendet einen eigenen Wetter-Seed; dadurch ist das Wetter pro Sitzung unterschiedlich, innerhalb einer Sitzung aber reproduzierbar.
- Das Wetterprofil nutzt 70 % sonnige Sommermonate und 20 % sonnige Wintermonate. Frühling und Herbst behalten gemischte saisonale Wahrscheinlichkeiten.
- Alte Spielstände ohne Wetter-Seed erhalten aus ihrer `gameId` einen stabilen Seed und werden mit einer passenden Prognose weitergeführt.
- Die für den Produktionskandidaten ausgewählten Wirtschaftsparameter sind: 70.000 € Importkosten je fehlender Einheit, 38.000 € Erlös je verkaufter Einheit und 400.000 € monatliche Betriebskosten für Kleinwindanlagen.
- Förderprogramme erzeugen 0,1 private Kapazität je Förderstufe und Monat. Private Anlagen bleiben bei 600.000 € kumulierter Förderung sichtbar und nicht veränderbar.
- Diese Kombination ist der aktuelle Balance-Kandidat aus dem Strategiesweep: 22 von 28 getesteten Wetterprofilen lagen im Sweet Spot; sechs Profile sind bewusst anspruchsvoll.
- Der React-StrictMode-Lifecycle ist berücksichtigt: Die Label-Pane wird nicht beim Effect-Cleanup entfernt, weil Leaflet sie intern weiterverwaltet.

### Quick-Start-Anleitung

- Beim ersten Spielstart erscheint zunächst ein kurzer Loading Screen, danach ein Willkommen-Fenster mit den Aktionen „Anleitung starten“ und „Anleitung überspringen“.
- Die Anleitung erklärt die sechs Sidebar-Gruppen in fester Reihenfolge: Spielstatus, Kennzahlen, Wetter, Förderungen, Bauoptionen sowie Monatswechsel und Zurücksetzen.
- Die Quick-Start-Erledigung wird getrennt vom Spielstand in `localStorage` gespeichert. Ein Browser-Refresh zeigt die Anleitung daher nicht erneut; ein bewusstes Zurücksetzen oder ein Neustart über den Endscreen öffnet sie wieder.
- Während eines Erklärungsschritts wird der Hinweis direkt neben dem markierten Sidebar-Element angezeigt. Das aktive Element wird automatisch in den sichtbaren Sidebar-Bereich gescrollt.
- Das aktive Element bleibt über dem Blur des Overlays scharf sichtbar; der Hinweis liegt in einer darüberliegenden Ebene. Willkommen und Loading bleiben zentriert.

### Verlust und Punkte

- Das Spiel endet sofort mit „Bankrott“, wenn das Budget auf null oder darunter fällt.
- Das Spiel endet sofort mit „Abgewählt“, wenn die Bürgerzufriedenheit auf null oder darunter fällt.
- Der Endscreen zeigt auch bei einer Niederlage die erreichten Punkte und die Einzelwerte.
- Je volle 1.000.000 Euro Budget zählt ein Punkt.
- Je volle 10 Prozent Energieautarkie, Bürgerzufriedenheit und Versorgungssicherheit zählt jeweils ein Punkt. Negative Werte werden für die Punkteberechnung auf null begrenzt.

## Kartenanbieter und API-Key

- Für die helle Kartengrundlage wird CARTO verwendet, wenn `CARTO_API_KEY` gesetzt ist.
- Ohne Key fällt die Anwendung auf öffentliche OpenStreetMap-Kacheln zurück, damit die lokale Entwicklung weiterhin funktioniert.
- Die frühere CARTO-Anzeige „API KEY REQUIRED“ samt Schloss-Symbol wird dadurch vermieden; ohne Key greift der OpenStreetMap-Fallback.
- Der Key wird nicht in den Quellcode geschrieben und nicht in Git eingecheckt.
- Die lokale Datei `.env` im Projektroot ist über `.gitignore` ausgeschlossen.
- Vite liest die Root-`.env` über `envDir: '..'`; `CARTO_API_KEY` ist als zulässige Client-Umgebungsvariable freigegeben.
- Da der Key für eine Browser-Anwendung in der Kachel-URL verwendet wird, sollte er beim CARTO-Anbieter auf erlaubte Domains bzw. Nutzung eingeschränkt werden.
- OpenStreetMap- und CARTO-Attribution bleiben sichtbar.

## Technischer Arbeitsstand

- Frontend-Stack: React, TypeScript, Vite, Leaflet und React-Leaflet.
- Kein eigenes Backend, keine eigene API und keine Datenbank.
- Persistenz erfolgt lokal über `localStorage`.
- Die Entwicklungsanleitung lautet:

  ```powershell
  cd frontend
  npm install
  npm run dev
  ```

- Tests und Produktionsprüfung:

  ```powershell
  cd frontend
  npm run test:run
  npm run build
  ```

- Stand der heutigen Prüfung: 31 Testdateien und 163 Tests bestanden, TypeScript-Prüfung bestanden, Produktions-Build bestanden und der Playwright-Produktions-Smoke-Test bestanden.
- `main` ist der Produktions-Branch und wurde nach GitHub gepusht. Die App ist für statisches Vercel-Hosting ohne eigenes Backend und ohne Datenbank vorbereitet.

## Relevante Dateien

- `frontend/src/map/BochumMap.tsx` – Layer-Reihenfolge, Stadtteilgrenzen, Labels und Karteninteraktion
- `frontend/src/map/mapTiles.ts` – CARTO-Konfiguration und OpenStreetMap-Fallback
- `frontend/vite.config.ts` – Root-`.env` und `CARTO_API_KEY`
- `frontend/src/game/initialGameState.ts` – leerer Startbestand
- `frontend/src/persistence/localStorageStore.ts` – Normalisierung geladener Spielstände
- `frontend/src/persistence/quickStartStore.ts` – separater Quick-Start-Marker
- `frontend/src/components/QuickStart.tsx` – Loading Screen, Willkommen und geführte Anleitung
- `frontend/src/sidebar/Sidebar.tsx` – stabile Quick-Start-Ziele in der Sidebar
- `frontend/src/app/App.css` – Cozy-Karten- und Label-Styling
- `frontend/tests/components/QuickStart.test.tsx` – Reihenfolge, Positionierung und Auto-Scroll
- `frontend/tests/ui/BochumMap.test.tsx` – Layer-, Label- und StrictMode-Regressionstests
