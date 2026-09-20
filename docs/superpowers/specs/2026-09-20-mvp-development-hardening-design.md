# MVP Development-Härtung – Technische Spezifikation

**Datum:** 20. September 2026  
**Scope:** Development only; Deployment wird in einem separaten Arbeitsblock behandelt.

## Ziel

Das MVP soll ohne Login, Backend oder Datenbank zuverlässig im Browser spielbar sein. Ein normaler Browser-Refresh erhält den Spielstand. Nutzer können ein laufendes oder abgeschlossenes Spiel bewusst zurücksetzen und anschließend mit einem leeren Startspielstand beginnen.

## Nicht-Ziele

- Kein Benutzerkonto und keine serverseitige Identität
- Keine zentrale Speicherung, Rangliste oder geräteübergreifende Synchronisierung
- Keine Hosting-, Domain-, CI/CD- oder Produktionsumgebungs-Konfiguration
- Keine Änderung der aktuellen Kartenoptik oder Spielbalance

## Verbindliche Anforderungen

### 1. Lokale Persistenz

- Der Spielstand wird weiterhin ausschließlich über `localStorage` gespeichert.
- Ein Browser-Refresh innerhalb derselben Origin lädt den zuletzt gespeicherten gültigen Zustand.
- Ungültiges JSON, unbekannte Versionen, blockierter Storage und `QuotaExceededError` dürfen nicht zu einer weißen Seite oder einem unbehandelten Fehler führen.
- Bei nicht verfügbarem Storage läuft das Spiel im Speicher weiter; die UI zeigt einen verständlichen Hinweis, dass der Spielstand beim Refresh verloren gehen kann.
- Die bestehende Normalisierung `existingAssets: []` bleibt erhalten.
- Schreib- und Löschoperationen müssen ihren Erfolg an den App-State zurückmelden, damit die UI einen Storage-Hinweis anzeigen kann.

### 2. Reset jederzeit im laufenden Spiel

- Ein sichtbarer Button `Spiel zurücksetzen` ist während des laufenden Spiels erreichbar.
- Vor dem Zurücksetzen wird eine Bestätigung verlangt.
- Nach Bestätigung werden alle folgenden Dinge zurückgesetzt:
  - persistierter Spielstand
  - Reducer-State
  - ausgewählter Anlagentyp
  - ausgewählte Anlage
  - Undo-Stack
  - Platzierungs- und Zonenfeedback
  - laufender Drag-Zustand
- Der Endscreen verwendet denselben Reset-Pfad, ohne eine zweite Reset-Implementierung.
- Nach dem Reset wird der normale initiale Spielstand sofort gespeichert, damit ein anschließender Refresh ebenfalls den leeren Startzustand zeigt.

### 3. Fehlerbehandlung

- Ein globaler React-Fehler wird über eine Error-Boundary abgefangen.
- Die Fehleransicht bleibt auf Deutsch verständlich und bietet eine Möglichkeit zum erneuten Laden.
- Die Error-Boundary darf keine Spielstände löschen.
- Storage-Warnungen und Rendering-Fehler werden getrennt behandelt.

### 4. Build-Hygiene

- Ein Produktions-Build leert das konfigurierte `dist`-Verzeichnis vor dem Schreiben neuer Artefakte.
- Die Development-Änderung darf keine Deployment-Provider oder Domain-Annahmen einführen.
- Der Build bleibt mit `tsc --noEmit` und `vite build` prüfbar.

### 5. Browser-Smoke-Tests

Es wird ein kleiner echter Browser-Test gegen eine gebaute/servierte Anwendung vorbereitet. Er muss mindestens prüfen:

1. App öffnet im Real-State-Modus.
2. Eine Spielaktion erzeugt einen persistierbaren Zustand.
3. Ein Reload erhält den Zustand.
4. `Spiel zurücksetzen` leert den Spielstand nach Bestätigung.
5. Ein Reload nach dem Reset zeigt wieder den initialen Zustand.
6. Der Endscreen-Neustart nutzt denselben Reset-Pfad.

Die bestehenden Vitest-/Testing-Library-Tests bleiben erhalten und decken weiterhin Reducer, Store und Komponenten isoliert ab.

## Technischer Entwurf

### Persistenzgrenze

`frontend/src/persistence/localStorageStore.ts` bleibt die einzige Stelle, die direkt auf `localStorage` zugreift. Die öffentlichen Store-Funktionen fangen Browser-Storage-Fehler ab und liefern einen auswertbaren Erfolg-/Fehlerstatus zurück. `frontend/src/app/appState.ts` übersetzt diesen Status in einen UI-relevanten Storage-Hinweis, ohne die Spiellogik mit Browser-API-Aufrufen zu vermischen.

### Reset-Datenfluss

`App` besitzt weiterhin den zentralen Reset-Handler. `BottomControls` erhält einen zusätzlichen Reset-Callback. `EndScreen` und `BottomControls` rufen denselben Handler auf. Der Handler löscht den gespeicherten Zustand, dispatcht `RESET_GAME` und räumt alle transienten App-State-Werte auf.

### Fehlergrenze

Die Error-Boundary wird um die bestehende App-Komposition gelegt. Sie ist eine reine UI-Sicherheitsgrenze und verändert weder `GameState` noch die lokale Persistenz.

### Testgrenzen

- Store-Tests simulieren Storage-Fehler und prüfen den zurückgegebenen Status.
- App-Integrationstests prüfen den Reset-Button und das vollständige Zurücksetzen transienter UI-Zustände.
- Ein echter Browser-Smoke-Test prüft Refresh und Reset auf dem gebauten Frontend.
- Deployment-Tests, Domain-Tests und Provider-Konfiguration gehören nicht in diesen Development-Block.

## Erfolgskriterien

Der Development-Block ist abgeschlossen, wenn:

- ein laufendes Spiel über `Spiel zurücksetzen` mit Bestätigung sauber neu gestartet werden kann;
- ein normaler Refresh den Zustand unter normalen Browserbedingungen erhält;
- Storage-Ausfälle eine verständliche Warnung statt eines Absturzes erzeugen;
- unerwartete React-Fehler eine Fehleransicht statt einer leeren Seite erzeugen;
- `dist` bei jedem Build sauber neu erzeugt wird;
- Vitest, TypeScript, Vite-Build und Browser-Smoke-Test erfolgreich sind;
- keine Deployment-Dateien oder Hosting-Annahmen hinzugefügt wurden.

