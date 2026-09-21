# Daten und Medien

## Karten

Die Dateien `frontend/src/data/*.osm.geojson` enthalten aus OpenStreetMap
abgeleitete Geometrien für Stadtgrenze, Postleitzahlen und Stadtbezirke.
Herkunftsangaben in diesen Daten und die sichtbare Kartenattribution bleiben
erhalten. `frontend/src/map/mapTiles.ts` definiert die Attribution der externen
Kachelanbieter. Eine Änderung des Anbieters erfordert eine Prüfung seiner
aktuellen Nutzungsbedingungen.

Die Spielzonen entsprechen den sechs Stadtbezirken. Begriffe wie „Stadtteil“ in
der Oberfläche sind eine didaktische Vereinfachung. Spielanlagen und private
Standorte bilden keine verifizierte kommunale Anlageninventur ab.

## Illustrationen

`frontend/public/icons/` enthält Anlagenillustrationen mit Bau- und Auswahlzustand.
`frontend/public/photos/` enthält illustrative Zonenbilder. Aus dem Verzeichnisnamen
folgt keine Zusicherung, dass es sich um dokumentarische Aufnahmen handelt.
Ein vollständiges Quellen- und Rechteverzeichnis dieser Bilddateien liegt derzeit
nicht bei; es muss vor einer Weiterlizenzierung geklärt werden.

`frontend/public/strategy-sweep.png` ist eine Kopie einer Modellauswertung aus
`simulations/results/`. Die reproduzierbare Erzeugung ist im Simulations-README
beschrieben. Die Grafik ist kein empirischer Nachweis für Lernwirkung oder reale
Versorgungssicherheit.

## Begleitmaterial

Die beiden Word-Dokumente im Repository-Stamm sind frühere Spezifikationen.
Bei abweichenden Parametern gelten Implementierung und aktuelle Spielregeln.
Der lokal vorhandene Antragstext unter `docs/` ist externes Begleitmaterial.
Er ist über `.gitignore` von der Versionierung ausgeschlossen, solange seine
Weitergaberechte ungeklärt sind. Build und Laufzeit benötigen ihn nicht.

## Lizenzstand

Für den Projektcode ist derzeit keine Lizenz festgelegt. Abhängigkeiten und
externe Daten behalten ihre eigenen Bedingungen. Die noch offenen Projekt- und
Medienrechte sind vor einer Freigabe zur allgemeinen Weiterverwendung zu klären.
