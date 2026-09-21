# Mitwirken

Die Anwendung ist ein didaktisches Energiespiel für Bochum. Neue Beiträge sollen
Spielregeln nachvollziehbar halten und räumliche Entscheidungen verständlich
machen. Einstieg: [Architektur](docs/architecture.md) und
[Spielregeln](docs/game-rules.md).

## Entwicklungsumgebung

Node.js 22 oder neuer und npm verwenden. `.nvmrc` und der Docker-Build verwenden
Node 22. `frontend/package-lock.json` ist die verbindliche Abhängigkeitsauflösung.

```sh
cd frontend
npm ci
npm run dev
```

Ein API-Key ist für die Entwicklung nicht erforderlich. Optionale Konfiguration
steht in `.env.example` im Repository-Stamm. Die Datei als `.env` kopieren und
den Server nach Änderungen neu starten. Variablen mit `VITE_` oder `CARTO_`
werden von Vite für den Browser freigegeben; dort dürfen keine Geheimnisse stehen.

## Änderungen vorbereiten

1. Für größere Änderungen zunächst Problem, erwartetes Verhalten und betroffene
   Modellannahmen in einem Issue beschreiben.
2. Einen eigenen Branch erstellen und eine zusammenhängende Änderung umsetzen.
3. Neue Regeln durch Tests absichern; Fehler möglichst mit einem reproduzierbaren
   Test beschreiben. Bestehende Spielstände und UI-Texte berücksichtigen.
4. Dokumentation und gegebenenfalls Python-Vergleichsmodell mitführen.
5. Pull Request mit Problem, Lösung, ausgeführten Prüfungen und bekannten Grenzen
   öffnen. Screenshots helfen bei sichtbaren Änderungen.

## Prüfungen

In `frontend/`:

```sh
npm run typecheck
npm run test:run
npm run build
npx playwright install chromium
npm run test:e2e
```

Der Browser-Test baut die Anwendung selbst und startet einen Preview-Server auf
`127.0.0.1:4174`. Der Port muss frei sein. `npm test` startet den interaktiven
Vitest-Watch-Modus. Die CI führt Frontend-Prüfungen unter Linux und Windows aus.

Für Änderungen am Vergleichsmodell aus dem Repository-Stamm:

```sh
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
python -m pip install -r simulations/requirements.txt
python -m unittest discover -s simulations -p "test_*.py"
```

Python 3.12 ist die CI-Referenz. Ergebnisse eines Sweeps bewusst aktualisieren:
Die CSV-/JSON-Dateien sind Vergleichsdaten, keine temporären Testausgaben.

## Wo Änderungen hingehören

| Änderung | Einstiegspunkt | Mitprüfen |
|---|---|---|
| Preise, Produktion, Bauzeit | `frontend/src/data/itemDefinitions.ts` | Monatsbilanz, Platzierung, Python-Modell |
| Budget, Nachfrage, Spieldauer | `frontend/src/data/gameBalance.ts`, `energyDemand.ts` | Niederlage, Score, Spielregeln |
| Förderungen | `frontend/src/data/subsidyPrograms.ts`, `simulation/subsidySimulation.ts` | private Anlagen, Einnahmen, Historie |
| Kennzahlen | `frontend/src/simulation/kpiCalculation.ts` | Rundung, Grenzen, Fortschreibung |
| Platzierungsregeln | `frontend/src/simulation/placementRules.ts` | Reducer und UI-Feedback |
| Karteninteraktion | `frontend/src/map/`, `app/usePlacement.ts` | Drag, Zonenkarte, Ebenen und Reset |
| Speicherung | `frontend/src/persistence/` | ältere Spielstände, defekte Daten, gesperrter Speicher |

## Konventionen

- TypeScript im Strict-Modus; neue Schnittstellen konkret typisieren.
- Spiellogik bleibt unabhängig von React, DOM und `localStorage`.
- Zustände nicht direkt verändern; Spielaktionen laufen durch `gameReducer`.
- Kommentare erklären fachliche Gründe, Reihenfolge oder Grenzen.
- Nutzersprache ist Deutsch; Codebezeichner sind Englisch.
- Keine lokalen Schlüssel, Buildausgaben oder Entwicklungsnotizen einchecken.
- Abhängigkeiten mit npm aktualisieren und die Lockdatei im selben Beitrag ändern.

## Nutzungsrechte

Eine Projektlizenz ist noch nicht festgelegt. Beiträge und mitgelieferte Medien
benötigen nachvollziehbare Nutzungsrechte. Den aktuellen Stand dokumentiert
[Daten und Medien](docs/data-and-assets.md); eine öffentliche Bereitstellung ist
noch keine pauschale Freigabe unter einer Open-Source-Lizenz.
