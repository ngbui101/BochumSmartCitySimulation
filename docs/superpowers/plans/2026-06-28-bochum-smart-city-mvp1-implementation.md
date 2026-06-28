# Bochum Smart City MVP 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build MVP 1 of the Bochum Smart City Simulation Game as a frontend-only React + TypeScript + Leaflet web app with local browser persistence.

**Architecture:** The app is a static single-page application. UI, map rendering, game-state transitions, simulation rules, persistence, static data, and shared types are separated so the simulation can later move to Go + MongoDB without being embedded in React components.

**Tech Stack:** React, TypeScript, Leaflet, Vite, Vitest, React Testing Library, Playwright later for stable UI flows, browser `localStorage`, static TypeScript/JSON/GeoJSON data files, Vercel static deployment.

---

## 1. Kurzer Ueberblick

### Ziel

MVP 1 ist ein spielbarer Frontend-Prototyp fuer ein Smart-City-/Energiewende-Simulationsspiel in Bochum. Der Spieler baut ueber 60 Monate Solaranlagen, Windmuehlen und Energiespeicher auf einer echten, spielerisch stilisierten Bochum-Karte und versucht, Energieautarkie, Budgeteffizienz, Buergerzufriedenheit und Versorgungssicherheit ausgewogen zu verbessern.

### Architektur

Die App besteht aus einer linken Sidebar und einer grossen Leaflet-Karte rechts. Die Sidebar zeigt Budget, Energieautarkie, Buergerzufriedenheit, Versorgungssicherheit, aktuellen Monat, Wetterprognose und kaufbare Items. Die Karte zeigt Bochum, Bestandsanlagen, Spieleranlagen, Bauzustaende, Drag-and-Drop-Platzierung, Zonen-Hover, Tooltips und unten mittig die Controls `[ ↶ Undo ] [ Naechster Monat ]`.

Die Simulationslogik liegt in `frontend/src/simulation/` und `frontend/src/game/`, nicht in UI-Komponenten. Statische Daten liegen in `frontend/src/data/`. Persistenz liegt ausschliesslich in `frontend/src/persistence/localStorageStore.ts`.

### Tech Stack

- React + TypeScript
- Leaflet fuer Karte
- Vite als empfohlene React-Build-Variante
- Vitest fuer Unit-Tests
- React Testing Library fuer Komponenten
- Playwright fuer spaetere E2E-Flows, sobald UI stabil ist
- `localStorage` fuer lokalen Spielstand
- Vercel oder vergleichbares Static Hosting

### Bewusst ausgeschlossene Dinge fuer MVP 1

- Kein Go Backend
- Keine MongoDB
- Keine API
- Keine Authentifizierung
- Kein Login
- Keine User Accounts
- Kein Multiplayer
- Kein Leaderboard
- Kein Admin Panel
- Keine serverseitige Speicherung
- Keine Analytics
- Keine echte GIS-Flaechenanalyse
- Keine reale Dachflaechenberechnung
- Keine reale Windabstandsberechnung
- Keine echte energetische Fachberechnung
- Keine Mobile-/Touch-Optimierung
- Keine mehreren Staedte
- Keine mehreren Itemgroessen
- Keine Upgrades oder Modernisierung von Bestandsanlagen
- Kein Tutorial
- Keine permanente Legende
- Kein separater Monatsbericht

### Annahmen und offene Fragen aus den Dokumenten

- Annahme: Vite wird fuer MVP 1 verwendet, weil es in den technischen Entscheidungen empfohlen ist.
- Annahme: Zahlenwerte fuer Startbudget, Kosten, Produktion, Betriebskosten, Foerderboni, Score-Gewichtung und Zonenkapazitaeten duerfen als klar markierte spielerische Balancing-Werte im Frontend gepflegt werden, bis finale Werte entschieden sind.
- Offene Frage: Exakte Quelle und Form der Bochum-Zonen-Polygone.
- Offene Frage: Exakte reale Bestandsanlagen inklusive gepruefter Standorte.
- Offene Frage: Exakte visuelle Ausarbeitung der cartoonhaften Icons.
- Offene Frage: Exakte Leaflet-Erweiterungen fuer Drag-and-Drop und Marker-Animationen.

---

## 2. Vorgeschlagene Projektstruktur

Der aktuelle Workspace enthaelt nur die beiden Projektdokumente. Die Umsetzung legt deshalb `frontend/` neu an.

```text
frontend/
  package.json
  index.html
  vite.config.ts
  vercel.json
  tsconfig.json
  tsconfig.node.json
  src/
    main.tsx
    app/
      App.tsx
      appState.ts
      App.css
    components/
      BottomControls.tsx
      EndScreen.tsx
      KpiBar.tsx
      Tooltip.tsx
    data/
      bochumZones.geojson
      zoneRules.ts
      itemDefinitions.ts
      initialAssets.ts
      weatherProfiles.ts
    game/
      actions.ts
      reducer.ts
      selectors.ts
      initialGameState.ts
    map/
      BochumMap.tsx
      ZoneLayer.tsx
      AssetMarkers.tsx
      mapBounds.ts
    persistence/
      localStorageStore.ts
    sidebar/
      Sidebar.tsx
      KpiDashboard.tsx
      WeatherForecast.tsx
      BuyableItemList.tsx
      AssetDetailsPanel.tsx
    simulation/
      placementRules.ts
      zoneDetection.ts
      monthlySimulation.ts
      weatherSimulation.ts
      scoring.ts
    types/
      assets.ts
      game.ts
      zones.ts
      weather.ts
    ui/
      icons.tsx
      animations.css
  tests/
    game/
      reducer.test.ts
      selectors.test.ts
    persistence/
      localStorageStore.test.ts
    simulation/
      placementRules.test.ts
      zoneDetection.test.ts
      monthlySimulation.test.ts
      weatherSimulation.test.ts
      scoring.test.ts
    sidebar/
      BuyableItemList.test.tsx
      KpiDashboard.test.tsx
    map/
      dragPlacement.test.tsx
```

### Verantwortlichkeiten jeder Datei

- `frontend/package.json`: Scripts, Dependencies und Dev-Dependencies fuer die Frontend-only App.
- `frontend/index.html`: Vite HTML-Einstiegspunkt.
- `frontend/vite.config.ts`: React + TypeScript Build- und Testkonfiguration.
- `frontend/vercel.json`: SPA-Rewrite auf `index.html` fuer statisches Deployment.
- `frontend/src/main.tsx`: React-Root mounten.
- `frontend/src/app/App.tsx`: Top-Level-Layout, Verbindung von Sidebar, Karte, Controls und Endscreen.
- `frontend/src/app/appState.ts`: Hook/Provider fuer Reducer, Persistenz-Load/Save und abgeleitete UI-Aktionen.
- `frontend/src/app/App.css`: Globales App-Layout, Sidebar/Karte, Desktop-first Styling.
- `frontend/src/components/BottomControls.tsx`: Undo-Button und Monatswechsel-Button unten mittig auf der Karte.
- `frontend/src/components/EndScreen.tsx`: Endscreen-UI fuer Gesamt-Score, vier Einzelwerte und qualitative Einordnung.
- `frontend/src/components/KpiBar.tsx`: Wiederverwendbarer KPI-Balken mit Delta-Anzeige und Hover-Replay.
- `frontend/src/components/Tooltip.tsx`: Gemeinsame Tooltip-Darstellung fuer Sidebar, Karte, Zonen und Undo.
- `frontend/src/data/bochumZones.geojson`: Vereinfachte Bochum-Spielzonen als GeoJSON.
- `frontend/src/data/zoneRules.ts`: Kapazitaeten, erlaubte Itemtypen, Akzeptanzsensitivitaet und Lastprofile pro Zone.
- `frontend/src/data/itemDefinitions.ts`: Drei kaufbare Standard-Items mit Kosten, Bauzeit, Produktions-/Speicherwerten und Betriebskosten als Balancing-Werte.
- `frontend/src/data/initialAssets.ts`: Bestandsanlagen als sichtbare, anklickbare, nicht veraenderbare Daten. Reale Namen nur verwenden, wenn vorher geprueft; sonst klar als spielerische Platzhalter markieren.
- `frontend/src/data/weatherProfiles.ts`: Monats-/Saisonprofile, Wettertypen und Prognoseunsicherheit.
- `frontend/src/game/actions.ts`: Union-Typen fuer Platzieren, Verkaufen, Undo, Monatswechsel und Auswahl.
- `frontend/src/game/reducer.ts`: Reine State-Transitions ohne React- oder DOM-Abhaengigkeit.
- `frontend/src/game/selectors.ts`: Abgeleitete Werte wie Restkapazitaet, kaufbare Items, letzte Undo-Beschreibung und Endscreen-Daten.
- `frontend/src/game/initialGameState.ts`: Erzeugt neuen lokalen Spielstand ohne Login.
- `frontend/src/map/BochumMap.tsx`: Leaflet-Karte, kontrollierte Bounds/Zoomstufen und Integration von Zonen/Assets.
- `frontend/src/map/ZoneLayer.tsx`: GeoJSON-Zonen, Hover/Drag-Highlighting, gruen/rot Feedback und Restkapazitaets-Tooltip.
- `frontend/src/map/AssetMarkers.tsx`: Marker fuer Bestandsanlagen, Spieleranlagen und Bauzustand.
- `frontend/src/map/mapBounds.ts`: Bochum-Bounds, feste Zoomstufen und Kartenbegrenzung.
- `frontend/src/persistence/localStorageStore.ts`: Save/Load/Clear mit Versionierung und defensiver Validierung.
- `frontend/src/sidebar/Sidebar.tsx`: Sidebar-Komposition.
- `frontend/src/sidebar/KpiDashboard.tsx`: Budget, Autarkie, Zufriedenheit und Versorgungssicherheit.
- `frontend/src/sidebar/WeatherForecast.tsx`: 3-Monats-Prognose mit Unsicherheit.
- `frontend/src/sidebar/BuyableItemList.tsx`: Sichtbare kaufbare Items, Drag-Start, deaktivierte Budget-Zustaende und Hover-Gruende.
- `frontend/src/sidebar/AssetDetailsPanel.tsx`: Detailansicht fuer Bestands- und Spieleranlagen, inklusive Verkauf nur fuer Spieleranlagen.
- `frontend/src/simulation/placementRules.ts`: Prueft Zone, Item-Erlaubnis, Restkapazitaet und Platzierungsgruende.
- `frontend/src/simulation/zoneDetection.ts`: Reine, testbare Funktion `findZoneForPoint(latLng, zonesGeoJson)` fuer Drop- und Hover-Zonenerkennung.
- `frontend/src/simulation/monthlySimulation.ts`: Monatswechsel, Aktivierung von Bauanlagen, Produktion, Kosten/Einsparungen/Foerderboni und KPI-Deltas.
- `frontend/src/simulation/weatherSimulation.ts`: Wetter fuer aktuellen Monat und 3-Monats-Prognose.
- `frontend/src/simulation/scoring.ts`: Endscore 0-100 plus vier Einzelbewertungen.
- `frontend/src/types/assets.ts`: `ItemType`, `ItemDefinition`, `PlayerAsset`, `ExistingAsset`, Asset-Status.
- `frontend/src/types/game.ts`: `GameState`, `GameKpis`, `ScoreBreakdown`, `GameAction`, `MonthlySnapshot`, `GameStatus`. `GameState.budget` ist der laufende Spielwert; `ScoreBreakdown.budgetEfficiency` ist nur ein Endscore-Wert.
- `frontend/src/types/zones.ts`: `ZoneId`, `ZoneRule`, Kapazitaets- und Platzierungsantworten.
- `frontend/src/types/weather.ts`: Wettertypen, Monatsprofil, Forecast-Typen.
- `frontend/src/ui/icons.tsx`: Cartoonhafte, einfache React-Icons fuer Solar, Wind, Speicher, Bauzustand.
- `frontend/src/ui/animations.css`: KPI-Delta, Monatswechsel und Marker-Zustaende.

---

## 3. Implementierungsphasen und Tasks

### Task 1: Projektgrundlage aufsetzen

**Ziel:** Eine statisch deploybare React-TypeScript-App in `frontend/` schaffen.

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/index.html`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/app/App.tsx`
- Create: `frontend/src/app/appState.ts`
- Create: `frontend/src/app/App.css`
- Create: `frontend/src/ui/animations.css`

**Owner:** Phase 0 / gemeinsame Grundlage. Kann von Agent B vorbereitet werden, muss aber vor echter Parallelisierung stabil sein.

**Abhaengigkeiten:** Keine.

**Nicht parallel mit:** Task 17 und Task 18, falls diese bereits `App.tsx`, `appState.ts` oder `animations.css` ausbauen.

**Vorab abzustimmende Interfaces:** `App.tsx` rendert spaeter Sidebar, Karte, Bottom Controls und Endscreen; `appState.ts` exportiert spaeter einen Hook/Provider fuer `state` und `dispatch`.

- [ ] Lege ein Vite React-TypeScript-Projekt unter `frontend/` an.
- [ ] Installiere nur Frontend-Abhaengigkeiten: `react`, `react-dom`, `leaflet`, `react-leaflet`.
- [ ] Installiere Test-/Build-Abhaengigkeiten: `typescript`, `vite`, `@vitejs/plugin-react`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.
- [ ] Richte Scripts ein: `dev`, `build`, `preview`, `test`, `test:run`.
- [ ] Erstelle `App.tsx` mit einem leeren Desktop-Layout aus Sidebar-Bereich und Karten-Bereich.
- [ ] Erstelle `appState.ts` als leere, typisierte Integrationsdatei mit noch minimalem Hook/Provider-Platz fuer den spaeteren Reducer.
- [ ] Erstelle CSS fuer Desktop/Web-first: linke Sidebar fix in der Breite, rechte Kartenflaeche flexibel.
- [ ] Erstelle `animations.css` mit leeren Klassen-Namen fuer spaetere KPI-, Monatswechsel- und Marker-Animationen, damit UI-Tasks dieselbe Datei erweitern.
- [ ] Fuehre `npm run build` aus.

**Erwartetes Ergebnis:** `frontend/` baut erfolgreich als statische React-TypeScript-App.

**Teststrategie:** `npm run build` muss ohne TypeScript-Fehler durchlaufen. Noch keine UI-Logik testen.

**Commit-Vorschlag:** `chore: set up frontend app`

### Task 2: Zentrale TypeScript-Typen definieren

**Ziel:** Gemeinsame Typen schaffen, bevor Daten, Simulation und UI entstehen.

**Files:**
- Create: `frontend/src/types/assets.ts`
- Create: `frontend/src/types/game.ts`
- Create: `frontend/src/types/zones.ts`
- Create: `frontend/src/types/weather.ts`

**Owner:** Agent A.

**Abhaengigkeiten:** Task 1.

**Nicht parallel mit:** Task 3 bis Task 21 sollten nicht mit eigenen Typdefinitionen starten, bevor Task 2 stabil ist.

**Vorab abzustimmende Interfaces:** Alle Agents verwenden ausschliesslich Typen aus `frontend/src/types/*`.

- [ ] Definiere `ItemType` exakt als `'solar' | 'wind' | 'storage'`.
- [ ] Definiere Asset-Status exakt als `'under_construction' | 'active'`.
- [ ] Definiere `PlayerAsset` mit `id`, `itemType`, `zoneId`, `position`, `status`, `placedMonthIndex`, `activeFromMonthIndex`, `purchasePrice`.
- [ ] Definiere `ExistingAsset` mit `id`, `name`, `assetTypeLabel`, `zoneId`, `position`, `statusLabel`, `roleDescription`, `modifiable: false`.
- [ ] Definiere `GameKpis` nur fuer laufende Spiel-KPIs: `energyAutarky`, `citizenSatisfaction`, `supplySecurity`. `budget` gehoert nicht in `GameKpis`, sondern bleibt als laufender Spielwert direkt auf `GameState`.
- [ ] Definiere `ScoreBreakdown` fuer Endscreen-/Scoring-Werte: `energyAutarky`, `budgetEfficiency`, `citizenSatisfaction`, `supplySecurity`. `budgetEfficiency` darf nicht als laufender Budgetwert verwendet werden.
- [ ] Definiere `GameState` gemaess technischem Entscheidungsdokument mit klarer Budget-Trennung: `gameId`, `currentMonthIndex`, `budget`, `kpis`, `playerAssets`, `existingAssets`, `undoStack`, `monthlyHistory`, `forecast`, `status` und optional `finalScore`, wenn `status === 'finished'`.
- [ ] Definiere `ZoneId` fuer die sieben MVP-Zonen: `innenstadt`, `wattenscheid`, `querenburg`, `langendreer`, `gerthe_harpen`, `weitmar_linden`, `stiepel`.
- [ ] Definiere Wettertypen und Forecast-Typen fuer 3 Monate mit Unsicherheit.
- [ ] Fuehre `npm run build` aus.

**Erwartetes Ergebnis:** Alle weiteren Tasks koennen dieselben Typen importieren.

**Teststrategie:** TypeScript-Build prueft Typkonsistenz.

**Commit-Vorschlag:** `feat: define core game types`

### Task 3: Statische Daten fuer Items, Zonen, Bestandsanlagen und Wetter anlegen

**Ziel:** Alle MVP-Daten im Frontend als statische Dateien bereitstellen.

**Files:**
- Create: `frontend/src/data/itemDefinitions.ts`
- Create: `frontend/src/data/zoneRules.ts`
- Create: `frontend/src/data/initialAssets.ts`
- Create: `frontend/src/data/weatherProfiles.ts`
- Create: `frontend/src/data/bochumZones.geojson`

**Owner:** Agent A.

**Abhaengigkeiten:** Task 2.

**Nicht parallel mit:** Task 6 und Task 6a sollten erst nach stabilen `zoneRules.ts` und `bochumZones.geojson` beginnen.

**Vorab abzustimmende Interfaces:** `itemDefinitions.ts`, `zoneRules.ts` und `bochumZones.geojson` sind gemeinsame Schnittstellen fuer Agent A und Agent B.

- [ ] Lege exakt drei Items an: Solaranlage, Windmuehle, Energiespeicher.
- [ ] Verwende je Item genau eine Standardgroesse.
- [ ] Markiere alle nicht final bestaetigten Zahlen als `balancingSource: 'mvp-playtest-value'`.
- [ ] Lege fuer jede der sieben Zonen Regeln an: erlaubte Itemtypen, Kapazitaeten je Itemtyp, Akzeptanzsensitivitaet und Lastprofil.
- [ ] Stelle sicher: Innenstadt erlaubt keine Windmuehlen, aber Solar und Speicher, weil dies als Beispiel in der Spezifikation genannt ist.
- [ ] Triff vor Implementierung eine explizite Entscheidung fuer Bestandsanlagen: Entweder gepruefte reale Bestandsanlagen mit verifizierten Namen und Standorten verwenden oder klar als MVP-Spielplatzhalter markieren. Keine ungeprueften realen Tatsachen behaupten.
- [ ] Lege `initialAssets.ts` so an, dass Bestandsanlagen sichtbar und anklickbar, aber nicht veraenderbar sind. Wenn keine geprueften realen Anlagen vorliegen, muessen Name, Rolle und Daten klar als spielerische Platzhalter gekennzeichnet sein.
- [ ] Lege `weatherProfiles.ts` mit Sommerstaerke fuer Solar und Winter-/Windstaerke fuer Wind an.
- [ ] Lege `bochumZones.geojson` mit vereinfachten Spielzonen an. Falls finale Polygone noch fehlen, verwende vereinfachte, klar als MVP-Spielzonen markierte Polygone rund um Bochum.

**Erwartetes Ergebnis:** Die App kann Zonen, Items, Wetterprofile und Bestandsanlagen ohne Backend laden.

**Teststrategie:** TypeScript-Build fuer `.ts`-Daten; fuer GeoJSON spaeter in Task 6/11 via Placement- und Map-Tests pruefen.

**Commit-Vorschlag:** `feat: add static mvp game data`

### Task 4: Initialen Game State erzeugen

**Ziel:** Einen neuen lokalen Spielstand ohne Login und ohne Server erzeugen.

**Files:**
- Create: `frontend/src/game/initialGameState.ts`
- Create: `frontend/tests/game/initialGameState.test.ts`

**Owner:** Agent A.

**Abhaengigkeiten:** Task 2, Task 3.

**Nicht parallel mit:** Task 5, wenn beide gleichzeitig `appState.ts` oder Initialisierungslogik verdrahten.

**Vorab abzustimmende Interfaces:** `createInitialGameState()` gibt einen vollstaendigen `GameState` zurueck.

- [ ] Schreibe zuerst Tests fuer `createInitialGameState()`.
- [ ] Teste: `currentMonthIndex` ist `0`.
- [ ] Teste: `status` ist `'running'`.
- [ ] Teste: `playerAssets` ist leer.
- [ ] Teste: `existingAssets` kommt aus `initialAssets`.
- [ ] Teste: `undoStack` ist leer.
- [ ] Teste: Forecast enthaelt 3 Monate.
- [ ] Implementiere `createInitialGameState()` als reine Funktion.
- [ ] Fuehre `npm run test:run -- tests/game/initialGameState.test.ts` aus.

**Erwartetes Ergebnis:** Jeder neue Spielstand startet reproduzierbar im Monat 0 mit statischen Bestandsanlagen und Forecast.

**Teststrategie:** Unit-Test fuer Struktur und Startwerte.

**Commit-Vorschlag:** `feat: create initial game state`

### Task 5: localStorage-Persistenz

**Ziel:** Spielstand lokal im Browser speichern und nach Reload laden.

**Files:**
- Create: `frontend/src/persistence/localStorageStore.ts`
- Create: `frontend/tests/persistence/localStorageStore.test.ts`
- Modify: `frontend/src/app/appState.ts`

**Owner:** Agent A fuer Store, Integration mit Agent B abstimmen, sobald `appState.ts` UI-seitig genutzt wird.

**Abhaengigkeiten:** Task 1, Task 2, Task 4.

**Nicht parallel mit:** Task 17, Task 18 und Integrationsteilen von Task 14, wenn diese `appState.ts` gleichzeitig umbauen.

**Vorab abzustimmende Interfaces:** `loadGameState(): GameState | null`, `saveGameState(state: GameState): void`, `clearGameState(): void`.

- [ ] Schreibe Tests fuer `saveGameState`, `loadGameState` und `clearGameState`.
- [ ] Verwende einen versionierten Storage-Key, z. B. `bochum-smart-city:mvp1:v1`.
- [ ] Teste: gespeicherter State kann geladen werden.
- [ ] Teste: ungueltiges JSON gibt `null` zurueck und wirft keinen UI-crashenden Fehler.
- [ ] Teste: falsche Version gibt `null` zurueck.
- [ ] Implementiere defensives Laden mit minimaler Strukturpruefung.
- [ ] Verdrahte `appState.ts`, sodass beim Start geladen wird und bei State-Aenderung gespeichert wird.
- [ ] Fuehre Persistenztests und Build aus.

**Erwartetes Ergebnis:** Der Spielstand bleibt nach Browser-Reload im gleichen Browser erhalten.

**Teststrategie:** Unit-Tests mit Mock Storage und ein manueller Reload-Test im Browser.

**Commit-Vorschlag:** `feat: persist game state locally`

### Task 6: Platzierungsregeln und Restkapazitaet

**Ziel:** Zone, Item-Erlaubnis, Kapazitaet und erklaerende Texte als reine Simulation pruefen.

**Files:**
- Create: `frontend/src/simulation/placementRules.ts`
- Create: `frontend/tests/simulation/placementRules.test.ts`

**Owner:** Agent A.

**Abhaengigkeiten:** Task 2, Task 3.

**Nicht parallel mit:** Task 14 darf echte Placement Rules erst anbinden, wenn dieser Task stabil ist.

**Vorab abzustimmende Interfaces:** `canPlaceItem(state, itemType, zoneId)` und `getRemainingCapacity(state, itemType, zoneId)` werden von Karte, Drag-and-Drop und Reducer genutzt.

- [ ] Schreibe Tests fuer erlaubte Platzierung.
- [ ] Schreibe Test: Windmuehle in Innenstadt ist nicht erlaubt.
- [ ] Schreibe Test: Platzierung scheitert, wenn Zonenkapazitaet fuer Itemtyp erschoepft ist.
- [ ] Schreibe Test: Restkapazitaet reduziert sich durch bestehende Spieleranlagen in derselben Zone.
- [ ] Schreibe Test: Budget wird hier nicht geprueft, weil `placementRules.ts` nur Zonen- und Kapazitaetsregeln bewertet. Die Budget-Sicherheitspruefung gehoert in den Reducer.
- [ ] Implementiere `canPlaceItem(state, itemType, zoneId)`.
- [ ] Implementiere `getRemainingCapacity(state, itemType, zoneId)`.
- [ ] Implementiere erklaerende Ergebnisobjekte mit `allowed`, `reason`, `remaining`, `capacity`.
- [ ] Fuehre Placement-Tests aus.

**Erwartetes Ergebnis:** Karte und Sidebar koennen dieselben Platzierungsregeln verwenden.

**Teststrategie:** Unit-Tests fuer Zonenregeln, Kapazitaeten und Begruendungstexte.

**Commit-Vorschlag:** `feat: add placement rules`

### Task 6a: Zone-Erkennung fuer Drop-Positionen

**Ziel:** Eine reine, testbare Funktion bereitstellen, die aus einer Kartenposition die passende Spielzone findet.

**Files:**
- Create: `frontend/src/simulation/zoneDetection.ts`
- Create: `frontend/tests/simulation/zoneDetection.test.ts`

**Owner:** Agent A.

**Abhaengigkeiten:** Task 2, Task 3.

**Nicht parallel mit:** Task 13 und Task 14 duerfen Drop-/Hover-Zonenlogik erst final verdrahten, wenn `findZoneForPoint` stabil ist.

**Vorab abzustimmende Interfaces:** `findZoneForPoint(latLng, zonesGeoJson)` gibt `ZoneId | null` zurueck. `latLng` nutzt `{ lat: number; lng: number }`.

- [ ] Schreibe Test: Punkt innerhalb eines bekannten Test-Polygons liefert die erwartete `ZoneId`.
- [ ] Schreibe Test: Punkt ausserhalb aller Polygone liefert `null`.
- [ ] Schreibe Test: Punkt auf Polygon-Grenze wird deterministisch behandelt und im Test dokumentiert.
- [ ] Implementiere `findZoneForPoint(latLng, zonesGeoJson)` ohne React- und Leaflet-Abhaengigkeit.
- [ ] Nutze einen einfachen Point-in-Polygon-Algorithmus fuer GeoJSON-Polygon und MultiPolygon.
- [ ] Stelle sicher: Hover und Drop koennen dieselbe Funktion verwenden, damit der zuletzt gehoverte Zonen-Kontext und die Drop-Position nicht auseinanderlaufen.
- [ ] Fuehre Zone-Detection-Tests aus.

**Erwartetes Ergebnis:** Drop-Positionen koennen zuverlaessig einer Zone zugeordnet werden, ohne sich auf Leaflet-Komponentenstatus allein zu verlassen.

**Teststrategie:** Unit-Tests fuer Punkt-in-Polygon, ausserhalb aller Zonen und Grenzverhalten.

**Commit-Vorschlag:** `feat: detect zone for map points`

### Task 7: Game Actions und Reducer fuer Platzierung, Verkauf und Auswahl

**Ziel:** State-Aenderungen als reine Reducer-Logik implementieren.

**Files:**
- Create: `frontend/src/game/actions.ts`
- Create: `frontend/src/game/reducer.ts`
- Create: `frontend/tests/game/reducer.test.ts`

**Owner:** Agent A.

**Abhaengigkeiten:** Task 2, Task 3, Task 6.

**Nicht parallel mit:** Task 8, Task 10, Task 16 und Task 18, weil diese denselben Reducer stark veraendern.

**Vorab abzustimmende Interfaces:** Action Payloads aus `actions.ts` muessen vor UI-Integration stabil sein, besonders `PLACE_ASSET`, `SELL_ASSET`, `UNDO_LAST_ACTION`, `ADVANCE_MONTH`.

- [ ] Definiere Actions: `PLACE_ASSET`, `SELL_ASSET`, `UNDO_LAST_ACTION`, `ADVANCE_MONTH`, `SELECT_ASSET`, `CLEAR_SELECTION`.
- [ ] Schreibe Test: Erfolgreiche Platzierung reduziert Budget sofort.
- [ ] Schreibe Test: `PLACE_ASSET` baut keine Anlage, wenn `state.budget` kleiner als die Itemkosten ist, auch wenn die Sidebar den Drag faelschlich ausloesen wuerde.
- [ ] Schreibe Test: Erfolgreiche Platzierung erzeugt Spieleranlage mit Status `under_construction`.
- [ ] Schreibe Test: Platzierung fuegt eine Undo-Aktion hinzu.
- [ ] Schreibe Test: Verkauf einer Spieleranlage gibt 60 Prozent des Kaufpreises zurueck.
- [ ] Schreibe Test: Bestandsanlage kann nicht verkauft werden.
- [ ] Implementiere Reducer ohne React-Abhaengigkeit.
- [ ] Implementiere Budget-Sicherheitspruefung direkt in `PLACE_ASSET`, bevor Asset, Budget oder Undo-Stack veraendert werden.
- [ ] Fuehre Reducer-Tests aus.

**Erwartetes Ergebnis:** Platzieren und Verkaufen funktionieren als getestete State-Transitions.

**Teststrategie:** Unit-Tests fuer Budget, Asset-Zustaende, Verkaufswert und Undo-Eintraege.

**Commit-Vorschlag:** `feat: handle asset placement and sale`

### Task 8: Undo-System fuer aktuellen Monat

**Ziel:** Jede Aktion des aktuellen Monats schrittweise rueckgaengig machen.

**Files:**
- Modify: `frontend/src/game/reducer.ts`
- Modify: `frontend/src/game/actions.ts`
- Create: `frontend/src/game/selectors.ts`
- Create: `frontend/tests/game/selectors.test.ts`
- Modify: `frontend/tests/game/reducer.test.ts`

**Owner:** Agent A.

**Abhaengigkeiten:** Task 7.

**Nicht parallel mit:** Task 7, Task 10, Task 16 und Task 18, weil alle `reducer.ts` oder `actions.ts` beruehren.

**Vorab abzustimmende Interfaces:** `getUndoTooltip(state)` wird von `BottomControls.tsx` genutzt.

- [ ] Schreibe Test: Undo nach Platzierung entfernt Anlage, gibt Budget zurueck und gibt Kapazitaet frei.
- [ ] Schreibe Test: Mehrfaches Undo nimmt Aktionen in umgekehrter Reihenfolge zurueck.
- [ ] Schreibe Test: Undo nach Verkauf stellt Anlage wieder her, zieht Verkaufserloes ab und belegt Kapazitaet wieder.
- [ ] Schreibe Test: Leerer Undo-Stack laesst State unveraendert.
- [ ] Implementiere `UNDO_LAST_ACTION`.
- [ ] Implementiere Selector `getUndoTooltip(state)`.
- [ ] Teste Tooltip-Text fuer letzte Aktion und fuer leeren Undo-Stack.
- [ ] Fuehre Reducer- und Selector-Tests aus.

**Erwartetes Ergebnis:** Undo gilt nur fuer Aktionen im aktuellen Monat und kann mehrfach geklickt werden.

**Teststrategie:** Unit-Tests fuer alle undo-faehigen Aktionen.

**Commit-Vorschlag:** `feat: add current-month undo stack`

### Task 9: Wetter, Saisonalitaet und Forecast

**Ziel:** Vereinfachtes monatliches Wetter mit 3-Monats-Prognose bereitstellen.

**Files:**
- Create: `frontend/src/simulation/weatherSimulation.ts`
- Create: `frontend/tests/simulation/weatherSimulation.test.ts`

**Owner:** Agent A.

**Abhaengigkeiten:** Task 2, Task 3.

**Nicht parallel mit:** Task 10, wenn dort Wetterfunktionen direkt eingebunden werden.

**Vorab abzustimmende Interfaces:** `createForecast(currentMonthIndex)` und aktuelle Monatsfaktoren werden von `monthlySimulation.ts` und `WeatherForecast.tsx` genutzt.

- [ ] Schreibe Test: Forecast enthaelt immer drei Monate.
- [ ] Schreibe Test: Forecast-Sicherheit nimmt fuer fernere Monate ab oder bleibt niedriger als beim naechsten Monat.
- [ ] Schreibe Test: Sommermonate haben hoehere Solar-Faktoren als Wintermonate.
- [ ] Schreibe Test: Winter-/windige Monate koennen hoehere Wind-Faktoren haben.
- [ ] Implementiere deterministische Wetterberechnung anhand `currentMonthIndex`, damit Tests stabil bleiben.
- [ ] Implementiere `createForecast(currentMonthIndex)`.
- [ ] Fuehre Wettertests aus.

**Erwartetes Ergebnis:** Sidebar und Monatswechsel erhalten stabile Wetterdaten ohne Backend.

**Teststrategie:** Unit-Tests fuer Forecast-Laenge, Unsicherheit und Saisonfaktoren.

**Commit-Vorschlag:** `feat: add weather simulation`

### Task 10: Monatssimulation

**Ziel:** Beim Klick auf "Naechster Monat" Produktion, Bauaktivierung, Budget und KPIs aktualisieren.

**Files:**
- Create: `frontend/src/simulation/monthlySimulation.ts`
- Create: `frontend/tests/simulation/monthlySimulation.test.ts`
- Modify: `frontend/src/game/reducer.ts`

**Owner:** Agent A.

**Abhaengigkeiten:** Task 7, Task 8, Task 9.

**Nicht parallel mit:** Task 7, Task 8, Task 16 und Task 18 wegen Reducer-Aenderungen.

**Vorab abzustimmende Interfaces:** `advanceMonth(state)` erzeugt neuen `GameState`, KPI-Deltas und aktualisierte Forecast-Daten.

- [ ] Schreibe Test: Anlagen aus dem Vormonat werden beim Monatswechsel aktiv.
- [ ] Schreibe Test: Undo-Stack wird beim Monatswechsel geleert.
- [ ] Schreibe Test: `currentMonthIndex` steigt um 1.
- [ ] Schreibe Test: Solarproduktion steigt in sonnigeren Monaten relativ zum gleichen Anlagenbestand.
- [ ] Schreibe Test: Speicher verbessert Versorgungssicherheit.
- [ ] Schreibe Test: Energiemix aus Solar und Wind gibt einen Versorgungssicherheitsbonus gegenueber nur einem Erzeugungstyp.
- [ ] Schreibe Test: Buergerzufriedenheit kann durch Wind in sensiblen Zonen sinken, blockiert aber keine Aktionen.
- [ ] Implementiere `advanceMonth(state)` als reine Funktion.
- [ ] Speichere Monats-Snapshot in `monthlyHistory`.
- [ ] Berechne letzte KPI-Deltas fuer UI-Animationen.
- [ ] Fuehre Monatssimulationstests aus.

**Erwartetes Ergebnis:** Der Monatswechsel bildet den Kernloop ab und schreibt historische Snapshots.

**Teststrategie:** Unit-Tests fuer Aktivierung, Wetterwirkung, Budgetwirkung, KPI-Aenderungen und Undo-Leerung.

**Commit-Vorschlag:** `feat: simulate monthly progression`

### Task 11: Endscore und Endscreen-Daten

**Ziel:** Nach 60 Monaten Spiel beenden und Score-Daten bereitstellen.

**Files:**
- Create: `frontend/src/simulation/scoring.ts`
- Create: `frontend/tests/simulation/scoring.test.ts`
- Modify: `frontend/src/game/reducer.ts`
- Modify: `frontend/src/game/selectors.ts`

**Owner:** Agent A.

**Abhaengigkeiten:** Task 10.

**Nicht parallel mit:** Task 19, wenn Endscreen-Daten-Selectors gleichzeitig geaendert werden.

**Vorab abzustimmende Interfaces:** `calculateFinalScore(state)` gibt Gesamt-Score, `ScoreBreakdown` und qualitative Einordnung zurueck.

- [ ] Schreibe Test: Bei Monat 60 wird `status` auf `'finished'` gesetzt.
- [ ] Schreibe Test: Gesamt-Score liegt zwischen 0 und 100.
- [ ] Schreibe Test: Score enthaelt vier Einzelwerte: Energieautarkie, Budgeteffizienz, Buergerzufriedenheit, Versorgungssicherheit.
- [ ] Schreibe Test: `budgetEfficiency` kommt aus `ScoreBreakdown` und wird nicht mit `GameState.budget` oder `GameKpis` verwechselt.
- [ ] Schreibe Test: Sehr niedrige Zufriedenheit reduziert den Gesamt-Score.
- [ ] Implementiere Score-Formel mit klar markierten MVP-Balancing-Gewichten.
- [ ] Implementiere qualitative Einordnung fuer Endscreen.
- [ ] Fuehre Scoring-Tests aus.

**Erwartetes Ergebnis:** Das Spiel endet nach 60 Monaten mit Gesamt-Score und vier Einzelbewertungen.

**Teststrategie:** Unit-Tests fuer Grenzen, Einzelwerte und Zufriedenheitswirkung.

**Commit-Vorschlag:** `feat: calculate final score`

### Task 12: Leaflet-Karte und kontrollierte Bochum-Ansicht

**Ziel:** Eine echte, kontrollierte Bochum-Karte als Hauptspielfeld anzeigen.

**Files:**
- Create: `frontend/src/map/mapBounds.ts`
- Create: `frontend/src/map/BochumMap.tsx`
- Modify: `frontend/src/app/App.tsx`
- Modify: `frontend/src/app/App.css`

**Owner:** Agent B.

**Abhaengigkeiten:** Task 1, Task 2.

**Nicht parallel mit:** Task 13 und Task 14, wenn `BochumMap.tsx` gleichzeitig grundlegend aufgebaut wird.

**Vorab abzustimmende Interfaces:** `BochumMap` akzeptiert spaeter `state`, Drag-Kontext und Dispatch/Callback-Props aus `appState.ts`.

- [ ] Definiere Bochum-Bounds und feste Zoomstufen in `mapBounds.ts`.
- [ ] Richte Leaflet so ein, dass Bochum und hoechstens direkter Randbereich sichtbar sind.
- [ ] Verhindere freies Erkunden anderer Staedte durch `maxBounds`.
- [ ] Verwende fuer MVP 1 einen einfachen Leaflet Tile-Layer mit korrekter Attribution.
- [ ] Dokumentiere bewusst: Der genaue game-artige Kartenstil bleibt fuer MVP 1 offen; Game-Art entsteht zunaechst ueber Overlays, Zonenfarben, Icons, Marker, Tooltips und reduzierte UI.
- [ ] Binde `BochumMap` rechts im Layout ein.
- [ ] Fuehre manuellen Browser-Test aus: Karte sichtbar, zoombar in festen Grenzen, kein Wechsel in andere Staedte.

**Erwartetes Ergebnis:** Die rechte Hauptflaeche zeigt eine kontrollierte Leaflet-Karte fuer Bochum.

**Teststrategie:** Build-Test plus manueller Kartencheck. E2E erst spaeter, wenn Drag-and-Drop stabil ist.

**Commit-Vorschlag:** `feat: render controlled bochum map`

### Task 13: Zonen-Layer, Hover und Drag-Highlighting

**Ziel:** Zonengrenzen nur bei Drag/Hover sichtbar machen und ganze Zone gruen/rot markieren.

**Files:**
- Create: `frontend/src/map/ZoneLayer.tsx`
- Modify: `frontend/src/map/BochumMap.tsx`
- Modify: `frontend/src/components/Tooltip.tsx`
- Create: `frontend/tests/map/dragPlacement.test.tsx`

**Owner:** Agent B fuer UI, Integration mit Agent A fuer `findZoneForPoint` und `canPlaceItem`.

**Abhaengigkeiten:** Task 6, Task 6a, Task 12.

**Nicht parallel mit:** Task 14, wenn beide `BochumMap.tsx` und `ZoneLayer.tsx` veraendern.

**Vorab abzustimmende Interfaces:** `ZoneLayer` nutzt `findZoneForPoint` fuer Hover-/Pointer-Kontext und `canPlaceItem` fuer gruen/rot.

- [ ] Rendere `bochumZones.geojson` als Leaflet GeoJSON-Layer.
- [ ] Standardzustand: Zonengrenzen nicht dauerhaft auffaellig sichtbar.
- [ ] Hover ueber Zone: Grenze/Zone sichtbar und Restkapazitaet im Tooltip, wenn Kontext relevant ist.
- [ ] Nutze fuer Hover-Kontext und Drop-Kontext dieselbe Zone-Erkennung: Pointer-Position in Leaflet-LatLng umrechnen und an `findZoneForPoint(latLng, bochumZonesGeoJson)` uebergeben.
- [ ] Drag ueber erlaubte Zone: gesamte Zone gruen.
- [ ] Drag ueber nicht erlaubte Zone: gesamte Zone rot.
- [ ] Tooltip zeigt Grund und Restkapazitaet, z. B. "Solaranlage in Innenstadt moeglich. Restkapazitaet: 7/10." oder "Windmuehle nicht moeglich. Innenstadt hat keine Windkraft-Kapazitaet."
- [ ] Schreibe Komponententest fuer erlaubten und nicht erlaubten Drag-Kontext.
- [ ] Fuehre Tests aus.

**Erwartetes Ergebnis:** Zonenfeedback folgt den MVP-Regeln ohne permanente Legende.

**Teststrategie:** Komponententest fuer Style-/Textzustand; manueller Browser-Test fuer Leaflet-Interaktion.

**Commit-Vorschlag:** `feat: show contextual zone feedback`

### Task 14: Drag-and-Drop-Platzierung aus der Sidebar

**Ziel:** Kaufbare Items per Maus aus der Sidebar exakt auf der Karte platzieren.

**Files:**
- Create: `frontend/src/sidebar/BuyableItemList.tsx`
- Modify: `frontend/src/map/BochumMap.tsx`
- Modify: `frontend/src/map/ZoneLayer.tsx`
- Modify: `frontend/src/game/reducer.ts`
- Modify: `frontend/tests/map/dragPlacement.test.tsx`
- Create: `frontend/tests/sidebar/BuyableItemList.test.tsx`

**Owner:** Agent B fuer UI/Interaktion; Agent A bleibt Owner der Reducer-Sicherheitslogik.

**Abhaengigkeiten:** Task 6, Task 6a, Task 7, Task 12, Task 13.

**Nicht parallel mit:** Task 13 und Task 18, wenn `BochumMap.tsx`, `ZoneLayer.tsx` oder `reducer.ts` gleichzeitig geaendert werden.

**Vorab abzustimmende Interfaces:** Drop dispatcht `PLACE_ASSET` mit `itemType`, `zoneId`, `position`; UI darf Budget-Deaktivierung machen, Reducer bleibt letzte Sicherheitsinstanz.

- [ ] Sidebar zeigt genau Solaranlage, Windmuehle und Energiespeicher.
- [ ] Item ist aktiv, wenn Budget reicht.
- [ ] Item bleibt sichtbar und ausgegraut, wenn Budget nicht reicht.
- [ ] Hover ueber ausgegrautes Item zeigt fehlenden Budgetbetrag.
- [ ] Drag aktiv nur fuer kaufbare Items.
- [ ] Beim Drag folgt eine Icon-Vorschau der Maus.
- [ ] Drop auf erlaubter Zone erzeugt Spieleranlage an Drop-Position, reduziert Budget und zeigt Bauzustand.
- [ ] Beim Drop Leaflet-Pixelposition in LatLng umrechnen, `findZoneForPoint` aufrufen und nur bei gefundener Zone plus erlaubter Placement Rule `PLACE_ASSET` dispatchen.
- [ ] Drop auf nicht erlaubter Zone erzeugt keine Anlage und veraendert Budget nicht.
- [ ] Nach erfolgreichem Drop bleibt Zone kurz gruen hervorgehoben und zeigt neue Restkapazitaet.
- [ ] Schreibe Tests fuer Budget-Deaktivierung und Drop-Ergebnis.

**Erwartetes Ergebnis:** Der Kernloop "Item ziehen, Zone pruefen, platzieren" funktioniert.

**Teststrategie:** Komponententests fuer Sidebar; Komponententest oder E2E-naher Test fuer Drop; manuelle Pruefung in Browser wegen Leaflet-Koordinaten.

**Commit-Vorschlag:** `feat: place assets by dragging from sidebar`

### Task 15: Asset Marker, Bauzustand und Detailansicht

**Ziel:** Bestandsanlagen und Spieleranlagen sichtbar, anklickbar und unterscheidbar machen.

**Files:**
- Create: `frontend/src/map/AssetMarkers.tsx`
- Create: `frontend/src/sidebar/AssetDetailsPanel.tsx`
- Create: `frontend/src/ui/icons.tsx`
- Modify: `frontend/src/map/BochumMap.tsx`
- Modify: `frontend/src/sidebar/Sidebar.tsx`

**Owner:** Agent B.

**Abhaengigkeiten:** Task 2, Task 3, Task 12.

**Nicht parallel mit:** Task 16, wenn `AssetDetailsPanel.tsx` gleichzeitig Verkauf verdrahtet.

**Vorab abzustimmende Interfaces:** Asset-Auswahl nutzt `SELECT_ASSET` und `CLEAR_SELECTION` aus `actions.ts`.

- [ ] Zeige Bestandsanlagen als anklickbare Icons.
- [ ] Zeige Spieleranlagen als Solar-, Wind- oder Speicher-Icons.
- [ ] Zeige neue Spieleranlagen bis zum naechsten Monat als "im Bau" mit Baustellen-Overlay, Fortschrittsring oder vergleichbarem Bauzustand.
- [ ] Markiere ausgewaehlte Anlage mit weichem Highlight oder Pulsieren.
- [ ] Detailansicht fuer Spieleranlage zeigt Itemtyp, Zone, Status, maximale Produktion oder Speicherwert, aktuellen Monatseffekt, Betriebskosten falls konfiguriert, Verkaufswert und Button "Verkaufen".
- [ ] Detailansicht fuer Bestandsanlage zeigt Name, Typ, Zone, Status, Rolle und Hinweis "Keine Aenderung moeglich".
- [ ] Bestandsanlagen haben keinen Verkaufen-Button.
- [ ] Fuehre manuellen Browser-Test fuer Klick und Detailansicht aus.

**Erwartetes Ergebnis:** Anlagen sind erklaerbar, unterscheidbar und Spieleranlagen koennen verkauft werden.

**Teststrategie:** React-Komponententests fuer Detailpanel; manuelle Karte wegen Marker-Interaktion.

**Commit-Vorschlag:** `feat: show asset markers and details`

### Task 16: Verkauf mit Verlust

**Ziel:** Spieleranlagen fuer 60 Prozent des Kaufpreises verkaufen, inklusive Undo.

**Files:**
- Modify: `frontend/src/sidebar/AssetDetailsPanel.tsx`
- Modify: `frontend/src/game/reducer.ts`
- Modify: `frontend/tests/game/reducer.test.ts`

**Owner:** Integration: Agent A fuer Reducer, Agent B fuer Detailpanel.

**Abhaengigkeiten:** Task 7, Task 8, Task 15.

**Nicht parallel mit:** Task 7, Task 8, Task 10 und Task 15, wenn dieselben Dateien aktiv bearbeitet werden.

**Vorab abzustimmende Interfaces:** `SELL_ASSET` Payload enthaelt Spieleranlagen-ID; Verkaufserloes wird im Reducer berechnet, nicht im UI.

- [ ] Verbinde "Verkaufen"-Button mit `SELL_ASSET`.
- [ ] Stelle sicher: Nur Spieleranlagen koennen verkauft werden.
- [ ] Stelle sicher: Verkauf bringt exakt 60 Prozent des urspruenglichen Kaufpreises zurueck.
- [ ] Stelle sicher: Zonen-Kapazitaet wird frei.
- [ ] Stelle sicher: Verkauf wird auf Undo-Stack gelegt.
- [ ] Teste Undo nach Verkauf erneut auf Budget, Asset-Wiederherstellung und Kapazitaetsbelegung.

**Erwartetes Ergebnis:** Verkauf ist Teil des aktuellen Monats und bleibt nach Monatswechsel festgeschrieben.

**Teststrategie:** Reducer-Tests plus Komponenten-Test fuer sichtbaren Button nur bei Spieleranlagen.

**Commit-Vorschlag:** `feat: sell player assets with loss`

### Task 17: Sidebar, KPI-Balken und Delta-Animationen

**Ziel:** Linke Sidebar mit allen bestaetigten MVP-Informationen bauen.

**Files:**
- Create: `frontend/src/sidebar/Sidebar.tsx`
- Create: `frontend/src/sidebar/KpiDashboard.tsx`
- Create: `frontend/src/sidebar/WeatherForecast.tsx`
- Create: `frontend/src/components/KpiBar.tsx`
- Create: `frontend/tests/sidebar/KpiDashboard.test.tsx`
- Modify: `frontend/src/ui/animations.css`
- Modify: `frontend/src/app/App.tsx`

**Owner:** Agent B.

**Abhaengigkeiten:** Task 1, Task 2, Task 9 fuer echte Forecast-Daten; kann in Phase 1 mit Mock-State starten.

**Nicht parallel mit:** Task 1 und Task 18, wenn `App.tsx` oder `animations.css` gleichzeitig strukturell geaendert werden.

**Vorab abzustimmende Interfaces:** Sidebar liest laufendes `state.budget` direkt und laufende KPIs aus `state.kpis`; sie liest `budgetEfficiency` nur aus Endscore-/Scoring-Daten, nicht im laufenden Dashboard.

- [ ] Sidebar zeigt Budget.
- [ ] Sidebar zeigt Energieautarkie.
- [ ] Sidebar zeigt Buergerzufriedenheit.
- [ ] Sidebar zeigt Versorgungssicherheit.
- [ ] Sidebar zeigt aktuellen Monat und Jahr innerhalb 60 Monaten.
- [ ] Sidebar zeigt Wetterprognose fuer die naechsten 3 Monate.
- [ ] KPI-Balken zeigen aktuellen Wert.
- [ ] Nach Monatswechsel zeigt KPI kurz Delta gruen bei Verbesserung und rot bei Verschlechterung.
- [ ] Danach kehrt Balken zur neutralen Farbe zurueck.
- [ ] Hover ueber KPI zeigt letzte Veraenderung erneut und spielt Delta-Animation kurz ab.
- [ ] Schreibe Tests fuer KPI-Werte, Delta-Texte und Hover-Replay.

**Erwartetes Ergebnis:** Die Sidebar ist das zentrale Dashboard des Spiels.

**Teststrategie:** React Testing Library fuer KPI-Rendering und Hover-Verhalten; manuelle visuelle Pruefung der Animation.

**Commit-Vorschlag:** `feat: build sidebar dashboard`

### Task 18: Bottom Controls und Monatswechsel-Effekt

**Ziel:** Unten mittig auf der Karte `[ ↶ Undo ] [ Naechster Monat ]` anzeigen und Monatswechsel ausloesen.

**Files:**
- Create: `frontend/src/components/BottomControls.tsx`
- Modify: `frontend/src/app/App.tsx`
- Modify: `frontend/src/game/reducer.ts`
- Modify: `frontend/src/ui/animations.css`
- Modify: `frontend/tests/game/reducer.test.ts`

**Owner:** Integration: Agent B fuer UI, Agent A fuer Reducer-Actions.

**Abhaengigkeiten:** Task 8, Task 10, Task 17.

**Nicht parallel mit:** Task 8, Task 10 und Task 17, wenn `reducer.ts`, `App.tsx` oder `animations.css` gleichzeitig geaendert werden.

**Vorab abzustimmende Interfaces:** `BottomControls` dispatcht `UNDO_LAST_ACTION` und `ADVANCE_MONTH`; Tooltip nutzt `getUndoTooltip(state)`.

- [ ] Zeige Buttons in exakt dieser Reihenfolge: Undo links, Naechster Monat rechts.
- [ ] Undo-Button zeigt Tooltip mit letzter undo-faehiger Aktion.
- [ ] Wenn kein Undo verfuegbar ist, zeigt Tooltip: "Keine Aktion in diesem Monat zum Rueckgaengig machen."
- [ ] Klick auf Undo dispatcht `UNDO_LAST_ACTION`.
- [ ] Klick auf "Naechster Monat" startet kurzen "Augen zu / Augen auf"-Effekt.
- [ ] Nach Effekt dispatcht Monatswechsel.
- [ ] Nach Monatswechsel sind KPI-Deltas sichtbar.
- [ ] Kein separater Monatsbericht wird angezeigt.
- [ ] Fuehre manuelle Pruefung des Effekts aus.

**Erwartetes Ergebnis:** Monatswechsel und Undo sind prominent auf der Karte erreichbar.

**Teststrategie:** Reducer-Tests fuer Monatswechsel; Komponententest fuer Button-Reihenfolge und Tooltips; manuelle Animationspruefung.

**Commit-Vorschlag:** `feat: add bottom controls`

### Task 19: Endscreen

**Ziel:** Nach 60 Monaten Endwertung anzeigen.

**Files:**
- Create: `frontend/src/components/EndScreen.tsx`
- Modify: `frontend/src/app/App.tsx`
- Modify: `frontend/src/game/selectors.ts`

**Owner:** Agent B fuer UI, Agent A fuer Scoring-Selectors.

**Abhaengigkeiten:** Task 11, Task 17.

**Nicht parallel mit:** Task 11, wenn `selectors.ts` gleichzeitig geaendert wird.

**Vorab abzustimmende Interfaces:** Endscreen nutzt `ScoreBreakdown` aus `scoring.ts` oder einem Selector; laufendes `budget` wird nicht als `budgetEfficiency` angezeigt.

- [ ] Wenn `state.status === 'finished'`, Karte/Sidebar durch Endscreen oder klaren Endzustand ersetzen.
- [ ] Zeige Gesamt-Score 0-100.
- [ ] Zeige vier Einzelwerte: Energieautarkie, Budgeteffizienz, Buergerzufriedenheit, Versorgungssicherheit.
- [ ] Zeige kurze qualitative Einordnung.
- [ ] Biete keinen Login, keine Score-Uebertragung und kein Leaderboard an.
- [ ] Schreibe Komponententest fuer Endscreen-Werte.

**Erwartetes Ergebnis:** Der 60-Monats-Lauf endet sichtbar mit Score und Einzelbewertungen.

**Teststrategie:** Unit-Test fuer Scoring und Komponententest fuer Darstellung.

**Commit-Vorschlag:** `feat: show final score screen`

### Task 20: Vercel Deployment-Konfiguration

**Ziel:** App als statische Website deploybar machen.

**Files:**
- Create: `frontend/vercel.json`
- Modify: `frontend/package.json`

**Owner:** Integration oder Agent B.

**Abhaengigkeiten:** Task 1.

**Nicht parallel mit:** Task 1, wenn `package.json` gleichzeitig eingerichtet wird.

**Vorab abzustimmende Interfaces:** Keine App-Interfaces; nur Build-Script `npm run build` und Output `dist`.

- [ ] Fuege `vercel.json` mit SPA-Rewrite auf `/index.html` hinzu.
- [ ] Stelle sicher: Build Command ist `npm run build`.
- [ ] Stelle sicher: Output Directory ist `dist`.
- [ ] Fuehre `npm run build` aus.
- [ ] Fuehre optional `npm run preview` aus und pruefe Reload auf direkter Route, falls Routing eingefuehrt wurde.

**Erwartetes Ergebnis:** Vercel oder ein vergleichbarer Static-Hosting-Anbieter kann die App ohne Backend deployen.

**Teststrategie:** Lokaler Production-Build. Kein Backend-Healthcheck, keine Datenbankverbindung.

**Commit-Vorschlag:** `chore: configure static deployment`

### Task 21: Testabdeckung und stabiler Grundspiel-Flow

**Ziel:** MVP-Regeln mit Unit- und Komponententests absichern.

**Files:**
- Modify: alle Testdateien unter `frontend/tests/`
- Optional Create: `frontend/tests/e2e/basicGameFlow.spec.ts`, wenn Playwright im Projekt eingerichtet wird.

**Owner:** Integration, beide Agents.

**Abhaengigkeiten:** Task 1 bis Task 20.

**Nicht parallel mit:** Feature-Tasks, solange dieselben Tests aktiv umgebaut werden. Stabilisierung nach Feature-Freeze gemeinsam ausfuehren.

**Vorab abzustimmende Interfaces:** Alle gemeinsamen Schnittstellen muessen eingefroren sein: Types, Daten, Actions, Reducer, Selectors, Placement Rules, Zone Detection.

- [ ] Fuehre alle Unit-Tests aus.
- [ ] Fuehre Build aus.
- [ ] Ergaenze fehlende Tests fuer Zonenregeln, Budgetpruefung, Platzierung, Undo, Verkauf, Monatswechsel, Wetter/Saisonalitaet, KPI-Berechnung, localStorage Save/Load und Endscore.
- [ ] Wenn Playwright eingefuehrt wird, teste nur den stabilen Grundflow: App laden, Item aus Sidebar ziehen, erlaubte Zone markieren, Drop, Undo, Monatswechsel.
- [ ] Halte Playwright aus dem kritischen Pfad heraus, falls Leaflet-DnD noch zu instabil ist; Unit-Tests bleiben Pflicht.

**Erwartetes Ergebnis:** Zentrale MVP-Regeln sind automatisiert geprueft.

**Teststrategie:** `npm run test:run` und `npm run build`; optional Playwright fuer stabilen UI-Flow.

**Commit-Vorschlag:** `test: cover mvp game flow`

---

## 4. Parallelisierungsplan fuer 2 Coding Agents

### Phase 0: Gemeinsame Grundlage

Diese Phase muss zuerst abgeschlossen werden, bevor Agent A und Agent B wirklich parallel arbeiten. Sie stabilisiert die Schnittstellen, damit spaeter keine Features doppelt gebaut werden.

- Task 1: Projektgrundlage aufsetzen
- Task 2: Zentrale TypeScript-Typen definieren
- Task 3: Statische Datenstruktur fuer Items, Zonen, Bestandsanlagen und Wetter anlegen
- Minimaler Basis-Layout-Rahmen in `App.tsx`
- Testsetup ueber Vitest und React Testing Library

Gemeinsame Schnittstellen, die nach Phase 0 nur bewusst geaendert werden:

- `frontend/src/types/*`
- `frontend/src/data/itemDefinitions.ts`
- `frontend/src/data/zoneRules.ts`
- `frontend/src/data/bochumZones.geojson`
- `frontend/src/game/actions.ts`
- `frontend/src/game/reducer.ts`
- `frontend/src/game/selectors.ts`
- `frontend/src/simulation/placementRules.ts`
- `frontend/src/simulation/zoneDetection.ts`

### Phase 1: Parallelisierung

Agent A arbeitet an Core Game Logic & State:

- Task 4: Initialer Game State
- Task 5: localStorage-Persistenz
- Task 6: Placement Rules
- Task 6a: Zone-Erkennung / `findZoneForPoint`
- Task 7: Actions und Reducer
- Task 8: Undo-System
- Task 9: Wetter-/Saisonalitaetslogik
- Task 10: Monatswechsel
- Task 11: Scoring / Endscreen-Daten
- Unit-Tests fuer Simulation, Reducer, Persistenz und Datenlogik

Agent B arbeitet an UI, Map & Interaction:

- Task 12: Leaflet-Karte und kontrollierte Bochum-Ansicht
- Task 13: Zonen-Layer, Hover und Drag-Highlighting, zunaechst gegen stabile Interfaces oder Mock-State
- Task 15: Asset Marker, Icons und Detailansicht ohne Verkaufsverdrahtung
- Task 17: Sidebar, KPI-Balken, Weather Forecast und Delta-Animationen mit Mock-State oder minimalem `GameState`
- Erste Komponenten-Tests und manuelle UI-Pruefung

In Phase 1 darf Agent B keine eigene Spiellogik implementieren. UI darf Mock-State verwenden, muss aber spaeter die Agent-A-Funktionen anbinden.

### Phase 2: Integration

- Task 14: Drag-and-Drop ruft echte `findZoneForPoint` und echte Placement Rules auf.
- Task 16: Verkauf verbindet Detailpanel mit echter `SELL_ASSET` Reducer-Logik.
- Task 18: Bottom Controls dispatchen echte Reducer Actions.
- Task 17 Integration: Sidebar zeigt echte Selectors, echten Forecast und echte KPI-Deltas.
- Task 19: Endscreen UI nutzt echte Scoring-Daten und `ScoreBreakdown`.

In Phase 2 muessen Aenderungen an `appState.ts`, `reducer.ts`, `selectors.ts`, `BochumMap.tsx` und `AssetDetailsPanel.tsx` koordiniert werden. Diese Dateien sind Integrationspunkte und sollten nicht parallel ohne Absprache geaendert werden.

### Phase 3: Stabilisierung

- Task 20: Vercel-Konfiguration pruefen.
- Task 21: Gemeinsame Testlaeufe, Integration-Bugfixes, Build pruefen und manuelle MVP-Abnahme.
- Beide Agents fuehren `npm run test:run` und `npm run build` aus.
- Agent B prueft manuell: Karte sichtbar, Drag-Feedback, Tooltips, Sidebar, Monatswechsel-Effekt, Endscreen.
- Agent A prueft fachlich: Zonenregeln, Budget-Sicherheitspruefung, Undo, Monatswechsel, Wetter, Scoring, localStorage.

### Agent A: Core Game Logic & State

Agent A besitzt die UI-unabhaengige Spiellogik:

- zentrale TypeScript-Typen
- statische Spieldaten
- initialer Game State
- localStorage-Persistenz
- Placement Rules
- Zone-Erkennung / `findZoneForPoint`
- Reducer
- Undo-System
- Monatswechsel
- Wetter-/Saisonalitaetslogik
- Scoring / Endscreen-Daten
- Unit-Tests fuer Simulation, Reducer, Persistenz und Datenlogik

Agent A aendert bevorzugt:

- `frontend/src/types/*`
- `frontend/src/data/*`
- `frontend/src/game/*`
- `frontend/src/simulation/*`
- `frontend/src/persistence/localStorageStore.ts`
- `frontend/tests/game/*`
- `frontend/tests/simulation/*`
- `frontend/tests/persistence/*`

### Agent B: UI, Map & Interaction

Agent B besitzt sichtbare Oberflaeche und Interaktion:

- App-Layout
- Sidebar
- KPI-Balken und Delta-Animationen
- Leaflet-Karte
- Zonen-Layer
- Drag-and-Drop-Interaktion
- Asset Marker
- Tooltips/Hover
- Asset Detail Panel
- Bottom Controls
- Endscreen UI
- Komponenten-Tests und manuelle UI-Pruefung

Agent B aendert bevorzugt:

- `frontend/src/app/App.tsx`
- `frontend/src/app/App.css`
- `frontend/src/components/*`
- `frontend/src/map/*`
- `frontend/src/sidebar/*`
- `frontend/src/ui/*`
- `frontend/tests/sidebar/*`
- `frontend/tests/map/*`

### Gemeinsame Schnittstellen

Diese Dateien muessen zuerst stabil sein und danach nur bewusst geaendert werden:

- `frontend/src/types/*`
- `frontend/src/data/itemDefinitions.ts`
- `frontend/src/data/zoneRules.ts`
- `frontend/src/data/bochumZones.geojson`
- `frontend/src/game/actions.ts`
- `frontend/src/game/reducer.ts`
- `frontend/src/game/selectors.ts`
- `frontend/src/simulation/placementRules.ts`
- `frontend/src/simulation/zoneDetection.ts`

Verbindliche Schnittstellen:

- `GameState.budget` ist der laufende Budgetwert fuer Sidebar und Reducer.
- `GameKpis` enthaelt laufende KPIs ohne `budgetEfficiency`.
- `ScoreBreakdown.budgetEfficiency` ist nur Endscore-/Scoring-Wert.
- `PLACE_ASSET` validiert im Reducer Budget, Zone und Kapazitaet final.
- `findZoneForPoint(latLng, zonesGeoJson)` ist die gemeinsame Quelle fuer Hover- und Drop-Zonenerkennung.
- `canPlaceItem(state, itemType, zoneId)` ist die gemeinsame Quelle fuer gruen/rot und Platzierungserlaubnis.

### Konfliktvermeidung

- Task 1, Task 17 und Task 18 duerfen nicht gleichzeitig `App.tsx`, `appState.ts` oder `animations.css` grundlegend umbauen.
- Task 7, Task 8, Task 10, Task 16 und Task 18 duerfen nicht gleichzeitig `reducer.ts` oder `actions.ts` veraendern.
- Task 11 und Task 19 duerfen nicht gleichzeitig `selectors.ts` veraendern, ohne Selector-Namen vorher abzustimmen.
- Task 12, Task 13 und Task 14 duerfen nicht gleichzeitig `BochumMap.tsx` oder `ZoneLayer.tsx` grundlegend umbauen.
- Task 15 und Task 16 duerfen nicht gleichzeitig `AssetDetailsPanel.tsx` veraendern.
- Agent B darf keine zweite Placement-, Weather-, Undo- oder Scoring-Logik in UI-Komponenten bauen.
- Agent A darf keine dauerhafte UI-Interaktionslogik in Simulation oder Reducer einbauen.

### Kurze Task-Zuordnung

- Agent A: Tasks 2, 3, 4, 5, 6, 6a, 7, 8, 9, 10, 11.
- Agent B: Tasks 12, 13, 15, 17.
- Integration: Tasks 1, 14, 16, 18, 19, 20, 21.

---

## 5. Testing-Plan

### Zonenregeln

- Unit-Test: Windmuehle in Innenstadt ist nicht erlaubt.
- Unit-Test: Solar in Innenstadt ist erlaubt, solange Restkapazitaet vorhanden ist.
- Unit-Test: Speicher in Innenstadt ist erlaubt, solange Restkapazitaet vorhanden ist.
- Unit-Test: Wenn Kapazitaet erschoepft ist, liefert `canPlaceItem` `allowed: false` und einen lesbaren Grund.
- Unit-Test: Restkapazitaet beruecksichtigt nur Spieleranlagen in derselben Zone und desselben Itemtyps.
- Unit-Test: `findZoneForPoint(latLng, zonesGeoJson)` liefert fuer Punkte innerhalb einer Zone die erwartete `ZoneId`.
- Unit-Test: `findZoneForPoint(latLng, zonesGeoJson)` liefert ausserhalb aller Spielzonen `null`.
- Unit-Test: Hover- und Drop-Kontext nutzen dieselbe Zone-Erkennung.

### Budgetpruefung

- Component-Test: Item bleibt sichtbar, wenn Budget zu niedrig ist.
- Component-Test: Item ist ausgegraut und nicht dragbar, wenn Budget zu niedrig ist.
- Component-Test: Hover ueber ausgegrautes Item zeigt fehlenden Budgetbetrag.
- Reducer-Test: Erfolgreiche Platzierung reduziert Budget um Itemkosten.
- Reducer-Test: `PLACE_ASSET` erzeugt keine Anlage und veraendert den State nicht, wenn `state.budget` kleiner als die Itemkosten ist.
- Reducer-Test: Nicht erlaubter Drop veraendert Budget nicht.

### Platzierung

- Unit-Test: Platzierung erzeugt `PlayerAsset` mit Drop-Position, Zone und Status `under_construction`.
- Unit-Test: Platzierung setzt `activeFromMonthIndex` auf Folgemonat.
- Component-/E2E-Test: Drag ueber erlaubte Zone faerbt ganze Zone gruen.
- Component-/E2E-Test: Drag ueber nicht erlaubte Zone faerbt ganze Zone rot.
- Component-/E2E-Test: Tooltip zeigt Grund und Restkapazitaet.

### Undo

- Reducer-Test: Undo nach Platzierung entfernt Anlage, gibt Budget zurueck und gibt Kapazitaet frei.
- Reducer-Test: Mehrfaches Undo arbeitet LIFO.
- Reducer-Test: Undo nach Verkauf stellt Anlage wieder her und zieht Verkaufserloes ab.
- Reducer-Test: Monatswechsel leert Undo-Stack.
- Component-Test: Undo-Tooltip zeigt letzte Aktion oder leeren Zustand.

### Verkauf

- Reducer-Test: Verkauf bringt exakt 60 Prozent des Kaufpreises zurueck.
- Reducer-Test: Verkauf entfernt oder deaktiviert Spieleranlage und gibt Kapazitaet frei.
- Reducer-Test: Bestandsanlage kann nicht verkauft werden.
- Component-Test: Verkaufsbutton erscheint nur fuer Spieleranlagen.
- Component-Test: Detailpanel fuer Bestandsanlage zeigt "Keine Aenderung moeglich".

### Monatswechsel

- Unit-Test: `currentMonthIndex` steigt um 1.
- Unit-Test: Anlagen aus dem Vormonat werden aktiv.
- Unit-Test: Undo-Stack wird geleert.
- Unit-Test: `monthlyHistory` erhaelt Snapshot.
- Component-Test: Klick auf "Naechster Monat" zeigt Monatswechsel-Effekt und danach KPI-Delta.
- Unit-Test: Nach Monat 60 wird `status` zu `finished`.

### Wetter/Saisonalitaet

- Unit-Test: Forecast enthaelt immer drei Monate.
- Unit-Test: Forecast enthaelt Wettertyp und Sicherheit.
- Unit-Test: Solar-Faktor ist in Sommermonaten hoeher als in Wintermonaten.
- Unit-Test: Wind-Faktor ist in windigen bzw. winterlichen Monaten hoeher als in schwachen Windmonaten.
- Unit-Test: Forecast bleibt deterministisch fuer denselben Monat, damit Tests stabil sind.

### KPI-Berechnung

- Unit-Test: Solar und Wind erhoehen Energieautarkie ueber aktive Produktion.
- Unit-Test: Speicher erhoeht Versorgungssicherheit.
- Unit-Test: Mix aus Solar und Wind gibt Bonus auf Versorgungssicherheit.
- Unit-Test: Wind in sensiblen Zonen kann Buergerzufriedenheit senken.
- Unit-Test: Niedrige Buergerzufriedenheit blockiert keine Platzierung.
- Component-Test: Positive Delta-Anzeige ist gruen, negative Delta-Anzeige rot.
- Component-Test: KPI-Hover spielt letzte Delta-Anzeige erneut ab.

### localStorage Save/Load

- Unit-Test: Gueltiger State wird gespeichert und geladen.
- Unit-Test: Ungueltiges JSON gibt `null` zurueck.
- Unit-Test: Falsche Version gibt `null` zurueck.
- Unit-Test: `clearGameState` entfernt gespeicherten State.
- Manueller Test: Spielstand bleibt nach Browser-Reload erhalten.

### Endscore

- Unit-Test: Gesamt-Score liegt immer zwischen 0 und 100.
- Unit-Test: Vier Einzelwerte werden berechnet.
- Unit-Test: `ScoreBreakdown.budgetEfficiency` wird aus Endscore-Logik berechnet und nicht mit `GameState.budget` verwechselt.
- Unit-Test: Schlechte Buergerzufriedenheit reduziert Score.
- Unit-Test: Schlechte Versorgungssicherheit reduziert Score.
- Component-Test: Endscreen zeigt Gesamt-Score, vier Einzelwerte und qualitative Einordnung.

---

## 6. Risiken und technische Entscheidungen

### Leaflet + React Drag-and-Drop Risiko

Leaflet verwaltet Pointer-Events und Kartenkoordinaten ausserhalb des React-DOM-Flows. Drag-and-Drop aus der Sidebar auf eine Leaflet-Karte kann deshalb instabil werden, wenn HTML5-DnD, Pointer-Events und Leaflet-Panning gleichzeitig aktiv sind.

Entscheidung fuer MVP 1: Drag-State zentral in React halten, Kartenkoordinate beim Hover und Drop ueber Leaflet bestimmen, `findZoneForPoint(latLng, zonesGeoJson)` als gemeinsame Zone-Erkennung verwenden und Zonenvalidierung ueber `placementRules.ts` ausfuehren. Falls HTML5-DnD mit Leaflet stoert, auf Pointer-Events mit eigener Drag-Preview wechseln.

### Drop-Position zu Zone

Die Drop-Position darf nicht nur aus einem zuletzt gesetzten React-Hover-State abgeleitet werden, weil Leaflet-Pointer-Events und React-Updates zeitlich auseinanderlaufen koennen.

Entscheidung fuer MVP 1: `frontend/src/simulation/zoneDetection.ts` stellt `findZoneForPoint(latLng, zonesGeoJson)` bereit. Beim Hover und beim Drop wird die aktuelle Leaflet-LatLng berechnet und durch dieselbe Funktion in eine `ZoneId | null` umgewandelt. Der zuletzt gehoverte Kontext darf fuer visuelles Feedback genutzt werden, aber der Drop validiert die Zone erneut aus der Drop-Position.

### GeoJSON-Zonenqualitaet

Die exakte Quelle und Form der Bochum-Zonen-Polygone ist offen. Echte GIS-Analyse ist ausgeschlossen, aber die Karte soll echte Bochum-Kartendaten zeigen.

Entscheidung fuer MVP 1: Zonen als vereinfachte Spielzonen behandeln. Polygone duerfen spielerisch approximiert sein, muessen aber als MVP-Spielzonen markiert werden, solange keine geprueften Daten vorliegen.

### Leaflet Tile-Quelle und Game-Art-Stil

Der exakte Kartenstil ist noch offen. Fuer MVP 1 reicht ein einfacher Tile-Layer mit korrekter Attribution.

Entscheidung fuer MVP 1: Die Karte nutzt zunaechst einen normalen, korrekt attribuierten Tile-Layer. Der game-artige Stil entsteht im MVP ueber kontrollierte Bounds, feste Zoomstufen, reduzierte UI, Zonen-Overlays, Farben, Tooltips und cartoonhafte Energie-Icons. Ein eigener Tile-Stil ist keine Voraussetzung fuer MVP 1.

### localStorage-Grenzen

`localStorage` ist browser- und geraetespezifisch, synchron, begrenzt und fuer den Nutzer manipulierbar.

Entscheidung fuer MVP 1: Das ist akzeptiert, weil es keinen Login, keine serverseitigen Spielstaende, keine Anti-Cheat-Anforderung und keine personenbezogenen Daten gibt. Store versionieren und robust gegen fehlerhafte Daten laden.

### Spielbalancing ohne Backend

Alle Werte liegen im Frontend und sind sichtbar/manipulierbar. Exakte Kosten, Produktionswerte, Betriebskosten, Foerderboni, Kapazitaeten und Score-Gewichte sind nicht final festgelegt.

Entscheidung fuer MVP 1: Balancing-Werte werden statisch und klar als MVP-Playtest-Werte gepflegt. Keine Admin-Konfiguration, keine API und keine Datenbank einfuehren.

### Spaetere Migration zu Go + MongoDB

Go + MongoDB ist fuer MVP 1 ausgeschlossen, aber fuer spaetere Versionen denkbar.

Entscheidung fuer MVP 1: Simulation und State-Transitions werden als reine Funktionen ohne React- oder DOM-Abhaengigkeit geschrieben. Dadurch koennen Placement, Monatswechsel, Wetter und Scoring spaeter in ein Backend verschoben werden.

---

## 7. Scope-Grenzen

Dieser Plan implementiert ausschliesslich MVP 1. MVP-2-Themen duerfen hoechstens als spaetere Erweiterung in Architekturentscheidungen beruecksichtigt werden, aber nicht als Feature eingeplant oder gebaut werden.

Nicht implementieren:

- Go Backend
- MongoDB
- API
- Login
- User Accounts
- Leaderboard
- Multiplayer
- Admin Panel
- Serverseitige Speicherung
- Echte GIS-Flaechenanalyse
- Echte energetische Fachberechnung
- Mehrere Staedte
- Mobile-/Touch-Optimierung
- Mehrere Itemgroessen
- Weitere kaufbare Technologien
- Upgrades von Bestandsanlagen
- Separater Monatsbericht
- Tutorial
- Permanente Legende

---

## 8. Self-Review

### Sind alle MVP-Anforderungen aus den Dokumenten abgedeckt?

Ja. Der Plan deckt Frontend-only, React + TypeScript + Leaflet, lokale `localStorage`-Persistenz, statische Daten, Bochum-Karte, Sidebar, drei kaufbare Items, Drag-and-Drop, Zonen-Highlighting, Tooltips, Budget-Deaktivierung, Undo, Monatswechsel, KPI-Deltas, Wetter/Saisonalitaet, Bauzeit, Verkauf mit 60 Prozent Rueckerstattung, Bestandsanlagen, Detailansicht, 60 Monate Spielzeit, Endscreen und statisches Deployment ab.

### Gibt es technische Widersprueche?

Kein harter Widerspruch. Vite ist im technischen Dokument empfohlen, aber nicht ausdruecklich als Pflicht bestaetigt; dieser Plan nimmt Vite als MVP-Umsetzung an. Die Dokumente erlauben vereinfachte Spielzonen, warnen aber vor ungeprueften realen Behauptungen; der Plan markiert ungepruefte Zonen, Bestandsanlagen und Zahlen deshalb als MVP-Spiel-/Balancing-Daten.

### Gibt es bewusst ausgeschlossene Features?

Ja. Backend, MongoDB, API, Login, Accounts, Multiplayer, Leaderboard, Admin Panel, serverseitige Speicherung, echte GIS-/Energieberechnung, Mobile-/Touch-Optimierung, Tutorial, permanente Legende und Monatsbericht sind bewusst ausgeschlossen.

### Welche offenen Fragen muessen vor der Implementierung geklaert werden?

- Duerfen fuer den ersten spielbaren Build bewusst markierte MVP-Balancing-Werte verwendet werden, oder muessen Startbudget, Kosten, Produktion, Betriebskosten, Foerderboni, Kapazitaeten und Score-Gewichte vor Task 3 final entschieden werden?
- Welche Quelle soll fuer vereinfachte Bochum-Zonen-Polygone verwendet werden?
- Sollen Bestandsanlagen im ersten Build als gepruefte reale Daten erscheinen oder als klar markierte spielerische Platzhalter? Ohne Pruefung sind nur Platzhalter erlaubt.
- Welche konkrete Tile-Quelle mit korrekter Attribution soll fuer MVP 1 verwendet werden? Ein eigener Game-Art-Tile-Stil ist nicht erforderlich.
- Soll Playwright direkt in MVP 1 eingerichtet werden oder erst nach stabiler Leaflet-Drag-and-Drop-Interaktion?
