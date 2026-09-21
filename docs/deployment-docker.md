# Docker-Betrieb

## Mit Docker Compose starten

Voraussetzung: Docker Engine mit Compose v2 bzw. Docker Desktop mit Linux-Containern. Node.js und Python müssen für diesen Startweg nicht auf dem Host installiert sein.

Im Repository-Stamm ausführen:

```bash
docker compose up -d --build
```

Das Spiel ist anschließend unter **http://localhost:8080** erreichbar. Der mehrstufige Build installiert die Frontend-Abhängigkeiten mit `npm ci`, erzeugt den Vite-Build und stellt ihn über Nginx bereit. Compose prüft die Erreichbarkeit der Startseite per Healthcheck.

Optionale Einstellungen in der vorhandenen `.env` im Repository-Stamm ergänzen:

```dotenv
CARTO_API_KEY=dein-carto-api-key
APP_PORT=8080
APP_BIND_ADDRESS=127.0.0.1
```

Ohne `CARTO_API_KEY` verwendet das Spiel OpenStreetMap. Compose reicht den Key als Build-Argument weiter; die `.env` selbst gelangt dank `.dockerignore` nicht in den Build-Kontext. Der Key bleibt als Bestandteil der Browser-Anwendung clientseitig sichtbar. Nach einer Key- oder Codeänderung erneut `docker compose up -d --build` ausführen.

Die Standardadresse bindet den Dienst nur lokal. Für Zugriff über das Netzwerk `APP_BIND_ADDRESS=0.0.0.0` setzen und den gewählten Port am Host freigeben. Die Konfiguration bietet HTTP; für einen öffentlichen Betrieb mit HTTPS einen TLS-Reverse-Proxy vorschalten.

Status, Logs und Stoppen:

```bash
docker compose ps
docker compose logs --tail=100 web
docker compose down
```

Ein Datenbankdienst oder Datenvolume ist nicht erforderlich. Spielstände bleiben im Browser gespeichert, auch wenn der Container neu erstellt wird. Hostname, Protokoll und Port bestimmen den Browser-Speicherbereich: Ein Spielstand unter `localhost:5173` erscheint nicht automatisch unter `localhost:8080`.

Referenz: [Docker Compose und `.env`-Variablen](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/).
