# Bochum Smart City Simulation

Frontend-only MVP fuer ein Smart-City-/Energiewende-Simulationsspiel in Bochum.

Spieler platzieren Solaranlagen, Windmuehlen und Energiespeicher auf einer vereinfachten Bochum-Karte. Ziel ist ein guter Mix aus Energieautarkie, Budgeteffizienz, Buergerzufriedenheit und Versorgungssicherheit ueber 60 Monate.

## Aktueller MVP-Umfang

- React + TypeScript + Vite Single Page App
- Leaflet-Karte mit begrenztem Bochum-Ausschnitt
- Vereinfachte MVP-Spielzonen als statische Daten
- Platzierung per Pointer-Drag mit eigener Drag Preview
- Live-Zonenfeedback fuer erlaubte und blockierte Platzierungen
- Budget-, Zonen- und Kapazitaetsvalidierung im Reducer
- Spieleranlagen mit Bau- und Aktivstatus
- Undo fuer Aktionen im aktuellen Monat
- Monatswechsel mit Curtain-Effekt, Wetter, KPI-Deltas und Aktivierung von Anlagen
- Verkauf von Spieleranlagen mit Undo
- Endscreen mit Gesamt-Score und vier Einzelwerten
- Lokale Persistenz ueber `localStorage`
- Keine API, kein Backend, keine Datenbank

## Voraussetzungen

- Node.js
- npm

## Setup

```bash
cd frontend
npm install
```

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

Die Zonen, Bestandsanlagen und Balancing-Werte sind MVP-Spielwerte. Nicht verifizierte reale Anlagen sind als MVP-Spielplatzhalter markiert und duerfen nicht als reale Tatsachenbehauptung verstanden werden.

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
