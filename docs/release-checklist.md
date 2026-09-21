# Veröffentlichung prüfen

## Technische Abnahme

- [ ] Frischen Checkout mit Node 22 und `npm ci` installieren.
- [ ] `npm run typecheck`, `npm run test:run` und `npm run test:e2e` ausführen.
- [ ] Python-Abhängigkeiten installieren und alle Simulationstests ausführen.
- [ ] CI unter Windows und Linux prüfen.
- [ ] Auf Desktop- und Mobilgröße Einführung, Platzieren, Verkauf, Undo,
  Monatswechsel, Neuladen, Reset und Spielende prüfen.
- [ ] `.env` und andere lokale Geheimnisse aus dem Commit ausschließen;
  nur absichtlich öffentliche Browser-Variablen konfigurieren.
- [ ] Kartenattribution und Kachelzugriff auf der Zieladresse kontrollieren.
- [ ] Bei Nutzung des Containers `docker compose up -d --build` und den
  Healthcheck prüfen; HTTPS am vorgeschalteten Server bereitstellen.

## Inhaltliche Abnahme

- [ ] Projektlizenz bewusst festlegen oder den offenen Lizenzstand beibehalten.
- [ ] Lizenz zur Weiterverwendung der Illustrationen bei einer entsprechenden Freigabe festlegen.
- [ ] Sicherstellen, dass vertrauliches Begleitmaterial nicht in Commit, Release-Archiv
  oder Deployment enthalten ist; lokale Dateien nicht pauschal als Archiv veröffentlichen.
- [ ] Spielregeln, Parameter und Python-Vergleichsmodell auf Konsistenz prüfen.
- [ ] Modellannahmen nicht als reale Bochumer Messwerte darstellen.
- [ ] Gewünschten Commitumfang einschließlich bislang lokaler Begleitdateien prüfen.

## Bereitstellung und Rücknahme

Buildausgabe ist `frontend/dist/`. Sie kann statisch bereitgestellt werden;
eine Datenbankmigration ist nicht erforderlich. Der Browser-Speicher hängt von
Protokoll, Host und Port ab. Eine neue Domain übernimmt Spielstände nicht.

Die Freigabe erfolgt nach Review des konkreten Commits und des Vorschau-Deployments.
Bei Problemen die letzte geprüfte Buildversion wieder bereitstellen. Ein Rollback
setzt bereits gespeicherte Browser-Spielstände nicht zurück; bei künftigen
Speicherformatänderungen ist dies in der Migrationsplanung zu berücksichtigen.
