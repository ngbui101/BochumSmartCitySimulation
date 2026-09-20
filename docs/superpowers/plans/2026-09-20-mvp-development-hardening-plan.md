# MVP Development-Härtung – Implementierungsplan

> **Für ausführende Agents:** Nutze `superpowers:executing-plans` und bearbeite die Aufgaben der Reihe nach. Jede Produktionsänderung folgt RED → GREEN → REFACTOR; Deployment bleibt außerhalb dieses Plans.

**Ziel:** Das Frontend bleibt ohne Login, Backend oder Datenbank nach einem Refresh spielbar, kann jederzeit sicher zurückgesetzt werden und zeigt bei Browser-/Storage-Fehlern eine verständliche UI statt einer weißen Seite.

**Architektur:** `localStorageStore` bleibt die einzige Browser-Storage-Grenze und liefert Erfolgsstatus. `useAppState` übersetzt diese Statuswerte in eine Warnung. `App` besitzt den einzigen Reset-Pfad, den laufende UI und Endscreen gemeinsam verwenden. Eine React-Error-Boundary umschließt die App. Der Build leert `dist` vor jedem Produktions-Build.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Testing Library, optional Playwright für den Browser-Smoke-Test.

**Spezifikation:** `docs/superpowers/specs/2026-09-20-mvp-development-hardening-design.md`

## Globale Einschränkungen

- Keine Deployment-, Hosting-, Domain- oder Provider-Dateien hinzufügen.
- Keine Änderung der Kartenoptik, Spielbalance oder bestehenden `existingAssets: []`-Normalisierung.
- Unrelated Änderungen aus anderen Agents nicht übernehmen oder überschreiben.
- Persistenzfehler dürfen den In-Memory-Spielablauf nicht blockieren.
- Der Reset löscht nie mehr als den für das MVP definierten Spielstand und speichert danach sofort den initialen Zustand.

## Aufgaben

### Aufgabe 1: Build-Hygiene und Test-/Arbeitsgrundlage

**Dateien:** `frontend/vite.config.ts`, `frontend/package.json`, neue Smoke-Test-Konfiguration falls benötigt.

**Schritte:**

1. Installiere die Frontend-Abhängigkeiten im isolierten Worktree, falls `node_modules` fehlt, und führe den bestehenden Test-/Build-Baseline-Check aus.
2. Schreibe zuerst einen kleinen Konfigurations-/Build-Nachweis, der einen veralteten Marker in `dist` vor dem Build nicht bestehen lässt; falls die vorhandene Toolchain dafür keinen stabilen Test bietet, dokumentiere die Konfigurationsausnahme und verifiziere über einen echten Build.
3. Ändere `emptyOutDir` auf die Vite-Standardbereinigung bzw. entferne die deaktivierende Einstellung.
4. Führe Vitest, TypeScript und Vite-Build aus und prüfe den Build-Ausgabeordner.

**Erwartung:** `dist` wird bei jedem Build sauber erzeugt; bestehende Tests bleiben grün.

**Commit:** `build: clean dist before production builds`

### Aufgabe 2: Fehlertolerante lokale Persistenz

**Dateien:** `frontend/src/persistence/localStorageStore.ts`, `frontend/src/app/appState.ts`, `frontend/src/app/App.tsx`, `frontend/src/app/App.css`, `frontend/tests/persistence/localStorageStore.test.ts`, passende Integrationstests.

**Schritte:**

1. Ergänze Store-Tests für blockiertes `getItem`, `setItem`, `removeItem` und `QuotaExceededError`; die Tests erwarten `null`/In-Memory-Fallback sowie einen auswertbaren Status.
2. Implementiere einen kleinen Statusvertrag (`available`/`unavailable`) und sichere alle Storage-Zugriffe mit `try/catch`. JSON-Fehler und unbekannte Versionen bleiben ungültig, ohne einen Fehler weiterzugeben.
3. Gib den Status über `useAppState` an die UI weiter. Speichern und Löschen aktualisieren den Status, ohne Reducer- oder Spiellogik mit Browser-APIs zu vermischen.
4. Zeige bei `unavailable` einen deutschsprachigen, nicht-blockierenden Hinweis mit dem Verhalten bei Refresh.

**Erwartung:** Ein Storage-Ausfall führt weder zum Absturz noch zum Verlust der laufenden In-Memory-Interaktion; die UI warnt verständlich.

**Commit:** `fix: handle unavailable browser storage gracefully`

### Aufgabe 3: Reset während des laufenden Spiels

**Dateien:** `frontend/src/app/App.tsx`, `frontend/src/components/BottomControls.tsx`, `frontend/src/app/App.css`, `frontend/tests/app/App.integration.test.tsx`, `frontend/tests/components/BottomControls.test.tsx`.

**Schritte:**

1. Ergänze Integrationstests, die eine Spielaktion, Auswahl-/Feedbackzustände und anschließend `Spiel zurücksetzen` abbilden. Der Test bestätigt den Dialog und prüft initialen State, leere Auswahl/Feedbacks und Persistenz.
2. Ergänze den sichtbaren Button und den Callback in `BottomControls`.
3. Implementiere in `App` einen zentralen Reset-Pfad. Der laufende Spiel-Reset fragt per Bestätigung nach; der Endscreen ruft denselben Handler ohne zweite Implementierung auf.
4. Setze Reducer-State, Undo-Stack, Auswahl, Map-Auswahl, Platzierungs-/Zonenfeedback und Drag-Zustand zurück. Speichere nach dem Reset den initialen Zustand sofort.

**Erwartung:** Laufende und abgeschlossene Spiele lassen sich reproduzierbar auf denselben initialen Zustand zurücksetzen; ein Refresh danach bleibt leer/initial.

**Commit:** `feat: allow resetting the game while playing`

### Aufgabe 4: Globale React-Fehlergrenze

**Dateien:** neue `frontend/src/app/AppErrorBoundary.tsx`, `frontend/src/main.tsx`, neue `frontend/tests/app/AppErrorBoundary.test.tsx`, `frontend/src/app/App.css`.

**Schritte:**

1. Schreibe einen Test mit absichtlich fehlerhaftem Kind, der die deutsche Fehleransicht und eine Reload-Aktion erwartet.
2. Implementiere eine React-Class-Error-Boundary mit verständlicher Meldung und `Seite neu laden`-Button. Sie darf keine Storage-Funktion aufrufen.
3. Umschließe die bestehende App-Komposition in `main.tsx` und verifiziere, dass normale Rendering-Fehler nicht als weiße Seite enden.

**Erwartung:** Rendering-Fehler zeigen die Fehleransicht; Spielstände bleiben unangetastet.

**Commit:** `fix: show a recoverable error screen for render failures`

### Aufgabe 5: Echter Browser-Smoke-Test und Abschlussverifikation

**Dateien:** `frontend/playwright.config.ts`, `frontend/tests/e2e/mvp.smoke.spec.ts`, `frontend/package.json`/Lockfile nur falls für Playwright nötig, ggf. kleine Test-Hilfsdateien.

**Schritte:**

1. Richte einen minimalen Playwright-Test gegen `vite preview` ein. Der Test darf keine Deployment-Konfiguration voraussetzen.
2. Prüfe Real-State-Modus, eine persistente Spielaktion, Reload-Erhalt, bestätigten laufenden Reset, initialen Zustand nach Reset-Reload und den Endscreen-Neustart über denselben Reset-Pfad.
3. Führe den Smoke-Test sowie Vitest, TypeScript und Vite-Build aus. Wenn ein lokaler Browser-Binary fehlt, dokumentiere genau die externe Voraussetzung und führe die übrigen Prüfungen trotzdem aus.

**Erwartung:** Die MVP-Kernreise ist in einem echten Browser nachvollziehbar und alle vorhandenen Unit-/Integrationstests bleiben grün.

**Commit:** `test: cover the mvp flow in a browser smoke test`

## Schnittstellen-Vereinbarungen

- Aufgabe 2 liefert `useAppState` einen auswertbaren Storage-Status; Aufgabe 3 darf den Reset nicht direkt mit `localStorage` implementieren.
- Aufgabe 3 liefert einen gemeinsamen Reset-Handler an `BottomControls` und `EndScreen`; Aufgabe 4 darf diesen Datenfluss nicht verändern.
- Aufgabe 5 testet nur öffentliche UI-Verträge und nutzt keine privaten React-State-Details.

## Review-Fokus

- Kein Storage-Zugriff außerhalb von `localStorageStore.ts`.
- Reset löscht nicht versehentlich andere Origins/Daten und speichert den initialen Zustand nach dem Löschen.
- Storage-Ausfälle, ungültiges JSON und Renderfehler ergeben nutzbare UI statt White-Screen.
- Endscreen und laufender Reset verwenden wirklich denselben Reset-Pfad.
- Keine Deployment-Annahmen oder Änderungen an Kartenoptik/Spielbalance.
