# Refactoring für die Veröffentlichung

## Ziel und Grenzen

Die bestehende React-/TypeScript-Anwendung wird leichter wartbar. Spielregeln,
Oberfläche, Speicherformat und öffentliche Einstiegspunkte bleiben kompatibel.
Die vorhandenen lokalen Docker- und Dokumentationsarbeiten werden übernommen.
Die Veröffentlichung selbst und Änderungen der Git-Historie sind nicht Teil
dieser Überarbeitung. Eine Projektlizenz bleibt vorerst offen.

## Arbeitsschritte

- [x] Ausgangsstand mit Frontend- und Python-Tests prüfen.
- [x] Energieproduktion, Speicher, private Versorgung und Kosten in einem reinen
  Berechnungsmodul bündeln; Vorschau und Monatsabrechnung verwenden dieselben
  Regeln mit ihren jeweils passenden Eingabedaten.
- [x] Platzierungsfeedback und Pointer-Zustand aus `App.tsx` extrahieren;
  Leaflet-Ereignisse und Zoneninformationen aus `BochumMap.tsx` lösen.
- [x] Regressionen für Energiebilanz, Abrechnung und Interaktionen absichern.
- [x] Tests unter Windows und Linux startbar machen, CI und lokale
  Konfigurationsbeispiele ergänzen.
- [x] README, Architektur, Entwicklungsabläufe und Veröffentlichungscheckliste
  konsolidieren; überholte Arbeitspläne durch dauerhafte Dokumentation ersetzen.
- [x] Gesamttests, TypeScript, Produktionsbuild, Browser-Smoke-Test und
  unabhängige Codeprüfung durchführen.

## Schnittstellen

`calculateMonthlyBalance(state, activeAssets, monthIndex, subsidies)` berechnet
Energie und Wirtschaft ohne Seiteneffekte. Der Monatswechsel liefert bereits
aktivierte Anlagen und fortgeschriebene Förderungen; die Vorschau verwendet den
aktuellen Bestand. `advanceMonth` verantwortet weiter Reihenfolge, Historie,
Verlustprüfung und Spielende. Bestehende Selectors bleiben aufrufbar.

`usePlacement(state, dispatch)` verwaltet nur vorübergehende Eingaben und
Feedback. Zulässigkeit und Budget werden weiterhin durch die Spiellogik geprüft.
Die Karte übersetzt Bildschirmkoordinaten in geografische Positionen.

## Besondere Prüffälle

- Der erste Monat zeigt keine Importkosten, die Saldo-Vorschau berücksichtigt sie.
- Neue öffentliche und private Anlagen wirken beim bisherigen Monatswechsel.
- Speicherüberschuss, leere Speicher und private Reserve bleiben konsistent.
- Ablegen außerhalb einer Zone, abgebrochene Eingaben und Neustart bereinigen
  den temporären Zustand.
- Alte Spielstände, nicht verfügbarer Browser-Speicher und Spielende bleiben
  durch die vorhandenen Integrationstests abgedeckt.

## Prüfstand vom 21. September 2026

- Ausgangsstand: 172 Frontend-Tests und 10 Python-Tests bestanden.
- Nach Refactoring: 181 Frontend-Tests in 34 Dateien bestanden.
- TypeScript einschließlich Vite-/Playwright-Konfiguration geprüft.
- Produktionsbuild und Playwright-Smoke-Test für Speichern, Neuladen, Reset
  und Neustart bestanden.
- Bibliotheken liegen in einem separaten, cachebaren Build-Chunk.
- Lokale Dokumentationslinks und `git diff --check` ohne Befund.
- Unabhängige Codeprüfung ohne blockierende Befunde.
- Docker-Compose-Konfiguration validiert. Containerlauf nicht ausgeführt,
  da die lokale Docker-Engine nicht läuft. Die neue CI ist lokal vorbereitet;
  ein erfolgreicher Lauf auf GitHub ist noch zu prüfen.

Die Umsetzung erfolgt auf `codex/publication-refactor`. Ein Deployment und das
Umschreiben bestehender Git-Historie sind nicht Teil dieses Refactorings.
