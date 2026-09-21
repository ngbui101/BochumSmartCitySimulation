# Bochum Smart City Simulation

Ein browserbasiertes Planspiel zur kommunalen Energieversorgung. Über 60 Monate
werden Solar- und Windanlagen, Speicher und Förderprogramme eingesetzt. Budget,
Wetter, Nachfrage und Bürgerzufriedenheit bestimmen den Verlauf.

Die Anwendung verwendet bewusst vereinfachte Spielwerte. Sie ist keine reale
Netzsimulation oder kommunale Potenzialanalyse. Die vollständigen Regeln und
Modellgrenzen stehen in den [Spielregeln](docs/game-rules.md).

## Schnellstart

Voraussetzungen: **Node.js 22 oder neuer und npm**.

```sh
cd frontend
npm ci
npm run dev
```

Vite zeigt die lokale Adresse an, normalerweise `http://localhost:5173`.
Ohne API-Key verwendet die Karte OpenStreetMap. Optional `.env.example` im
Repository-Stamm nach `.env` kopieren und `CARTO_API_KEY` setzen. Dieser Key
wird im Browser-Build sichtbar; nur dafür vorgesehene öffentliche Schlüssel
verwenden. Nach Konfigurationsänderungen neu starten beziehungsweise neu bauen.

Alternativ mit Docker im Repository-Stamm:

```sh
docker compose up -d --build
```

Die Anwendung läuft dann unter `http://localhost:8080`.
Details: [Docker-Betrieb](docs/deployment-docker.md).

## Entwicklung und Prüfungen

In `frontend/`:

```sh
npm run typecheck
npm run test:run
npm run build
npx playwright install chromium
npm run test:e2e
```

Der Build erzeugt `frontend/dist/`. `npm run preview` zeigt ihn lokal an.
Der Browser-Test baut selbst und benötigt Port 4174. Die CI prüft das Frontend
unter Windows und Linux sowie die Python-Simulation unter Linux.

Anleitung für neue Mitwirkende: [CONTRIBUTING.md](CONTRIBUTING.md).

## Projektaufbau

```text
frontend/
  src/app/          App-Komposition, Zustand und Platzierungssteuerung
  src/game/         Reducer, Selectors, Startzustand und Verlustregeln
  src/simulation/   Energie, Wirtschaft, Wetter, Förderung und KPIs
  src/map/          Leaflet-Karte, Pointer-Eingaben und Zoneninformationen
  src/persistence/  Browser-Speicher und Kompatibilitätsdefaults
  src/data/         Spielparameter und GeoJSON
  src/types/        Gemeinsame TypeScript-Typen
  src/components/   Einführung, Kennzahlen und Steuerung
  src/sidebar/      Spielinformationen und Bauoptionen
  src/ui/           Icons und Medien
  tests/            Unit-, Integrations- und Browser-Tests
  public/           Illustrationen und Strategieauswertung
simulations/        Eigenständiges Python-Vergleichsmodell
docs/               Architektur, Regeln und Begleitmaterial
docker/             Webserver-Konfiguration
```

React 18, TypeScript, Vite und Leaflet bilden eine clientseitige Anwendung.
Es gibt kein eigenes Backend, Login oder Datenbank. Spielstände liegen im
`localStorage` des jeweiligen Browsers. Kartenkacheln kommen von externen Diensten.

## Simulation und Balancing

Die Python-Auswertung läuft unabhängig von der Anwendung:

```sh
python -m pip install -r simulations/requirements.txt
python -m unittest discover -s simulations -p "test_*.py"
python simulations/start_value_sweep.py --seeds 100
python simulations/plot_sweep.py
```

Das Profil `challenge` entspricht den Start-KPIs der Anwendung; `current`
bezeichnet ältere Vergleichswerte. Für den aktuellen Produktionsvergleich gilt
ein Endbedarfsfaktor von **1,35**. Ergebnisse und Modellgrenzen beschreibt das
[Simulations-README](simulations/README.md).

## Dokumentation

- [Architektur und Datenfluss](docs/architecture.md)
- [Mitwirken und Entwicklungsablauf](CONTRIBUTING.md)
- [Spielregeln und Modellgrenzen](docs/game-rules.md)
- [Abhängigkeiten der Spielelemente](docs/element-dependencies.md)
- [Strategiehilfe](docs/strategy-guide.md)
- [Entscheidungsdiagramm](docs/decision-dependencies.drawio)
- [Vercel-Deployment](docs/deployment-vercel.md) und [Docker-Betrieb](docs/deployment-docker.md)
- [Checkliste für die Veröffentlichung](docs/release-checklist.md)
- [Daten, Medien und Nutzungsrechte](docs/data-and-assets.md)
- [Präsentationsaufbau](docs/presentation-outline.md) und [Literaturrecherche](docs/literature-research.md)

Datierte Statusdokumente und die Word-Spezifikationen beschreiben frühere Stände.
Bei abweichenden Angaben gelten Implementierung und aktuelle Spielregeln.

## Lizenzstand

Eine Projektlizenz ist **noch nicht festgelegt**. Die Nutzungsrechte von Bildern
und externem Begleitmaterial sind gesondert zu klären. Das Projekt ist damit
derzeit nicht ausdrücklich unter einer Open-Source-Lizenz freigegeben.
