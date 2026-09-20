# Bochum Smart City Simulation

Frontend-only MVP fuer ein Smart-City-/Energiewende-Simulationsspiel in Bochum.

Spieler platzieren Solaranlagen, Windmuehlen und Energiespeicher auf einer vereinfachten Bochum-Karte. Ziel ist ein guter Mix aus Energieautarkie, Budgeteffizienz, Buergerzufriedenheit und Versorgungssicherheit ueber 60 Monate.

## Aktueller MVP-Umfang

- React + TypeScript + Vite Single Page App
- Leaflet-Karte mit begrenztem Bochum-Ausschnitt
- Vereinfachte MVP-Spielzonen als statische Daten
- Cozy-Kartenstil mit CARTO-Light-Kacheln und OpenStreetMap-Fallback
- Sichtbare Stadtgrenze und dauerhaft sichtbare Stadtteilgrenzen
- Dauerhaft sichtbare Stadtteilnamen unterhalb der Karten-Overlay-Layer
- Keine vorplatzierten Bestandsanlagen; alle Anlagen werden im Spiel platziert
- Platzierung per Pointer-Drag mit eigener Drag Preview
- Live-Zonenfeedback fuer erlaubte und blockierte Platzierungen
- Budget-, Zonen- und Kapazitaetsvalidierung im Reducer
- Spieleranlagen mit Bau- und Aktivstatus
- Undo fuer Aktionen im aktuellen Monat
- Monatswechsel mit Curtain-Effekt, Wetter, KPI-Deltas und Aktivierung von Anlagen
- Verkauf von Spieleranlagen mit Undo
- Endscreen mit Gesamt-Score und vier Einzelwerten
- Lokale Persistenz ueber `localStorage`
- Keine eigene API, kein Backend, keine Datenbank

## Voraussetzungen

- Node.js
- npm

## Setup

```bash
cd frontend
npm install
```

Optional kann im Projektroot eine `.env` mit einem CARTO-Key angelegt werden:

```text
CARTO_API_KEY=dein-carto-api-key
```

Die `.env` ist in `.gitignore` eingetragen und darf nicht committed werden. Ohne Key nutzt die Karte den OpenStreetMap-Fallback.

## Entwicklung

```bash
cd frontend
npm run dev
```

Die App laeuft standardmaessig unter:

```text
http://localhost:5173
```

## Tests und Build

```bash
cd frontend
npm run test:run
npm run build
```

Die heutigen Architektur- und UI-Entscheidungen sind in [docs/DECISIONS-2026-09-20.md](docs/DECISIONS-2026-09-20.md) dokumentiert. Die daraus abgeleiteten Entscheidungswege und Spielstrategien stehen in [docs/strategy-guide.md](docs/strategy-guide.md); das editierbare Abhängigkeitsdiagramm liegt in [docs/decision-dependencies.drawio](docs/decision-dependencies.drawio).

Production Preview nach erfolgreichem Build:

```bash
cd frontend
npm run preview
```

## Projektstruktur

```text
frontend/
  src/
    app/          App-Komposition und State-Integration
    components/   Wiederverwendbare UI-Komponenten
    data/         Statische MVP-Daten
    game/         Actions, Reducer, Selectors, initialer State
    map/          Leaflet-Karte, Zonen und Marker
    persistence/  localStorage-Store
    sidebar/      Sidebar, KPIs, Bauoptionen, Details, Endscreen
    simulation/   Placement, Wetter, Monatssimulation, Scoring
    types/        Gemeinsame TypeScript-Typen
    ui/           Icons und Animationen
  tests/          Unit- und Integrationstests
```

## Wichtige Schnittstellen

- `createInitialGameState()`
- `loadGameState()`
- `saveGameState(state)`
- `clearGameState()`
- `canPlaceItem(state, itemType, zoneId)`
- `getRemainingCapacity(state, itemType, zoneId)`
- `findZoneForPoint(latLng, zonesGeoJson)`
- `gameReducer(state, action)`
- `getUndoTooltip(state)`
- `createForecast(currentMonthIndex)`
- `advanceMonth(state)`
- `calculateFinalScore(state)`

## Datenhinweis

Die Zonen und Balancing-Werte sind MVP-Spielwerte und duerfen nicht als reale Tatsachenbehauptung verstanden werden.

## QA-Status

Der integrierte MVP-Flow wurde auf `main` technisch und manuell geprueft:

- `npm run test:run`: bestanden
- `npm run build`: bestanden
- Production Preview: bestanden
- Pointer-Drag-Platzierung: bestanden
- Mock Harness im Production Preview: nicht sichtbar

## Deployment

Die App ist statisch baubar. Fuer Vercel oder vergleichbares Static Hosting:

- Build Command: `npm run build`
- Output Directory: `dist`
- Project Root: `frontend`

Für ein Deployment muss `CARTO_API_KEY` als Client-Build-Variable gesetzt sein, wenn CARTO statt des OpenStreetMap-Fallbacks verwendet werden soll. Der Key sollte beim Anbieter auf die erlaubte Domain bzw. Nutzung eingeschränkt werden.
