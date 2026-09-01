# Stage Reader

Lokaler, installierbarer Reader fuer PDF-Noten, Guitar-Pro-Dateien und Setlisten. Die Anwendung enthaelt weder Audio, Playback, Cursor, Metronom noch Cloud-Anbindung. Alle Dateien und Einstellungen werden ausschliesslich in IndexedDB auf dem jeweiligen Geraet gespeichert.

## Funktionen

- PDF, GP3, GP4, GP5, GPX und GP importieren, lokal speichern und wieder herunterladen
- Bibliothek mit Suche, Favoriten und Sortierung
- Seiten-, versetzter Halbseiten- und Endlosmodus
- Manuelle Touch- und Tastaturnavigation, Zoom und gespeicherte Leseposition
- Lokale Setlisten, JSON-Metadatenexport und validierter Import
- Offline-App-Shell und Installationsunterstuetzung als PWA

## Voraussetzungen und Entwicklung

Node.js 22 oder neuer installieren, dann im Projektordner ausfuehren:

```powershell
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

Die Entwicklungsadresse wird von Vite ausgegeben. Der Produktionsordner ist `dist`.

## GitHub Pages

### Direkter Datei-Upload

Nach `npm run build` nur den **Inhalt** des Ordners `dist` in das Stammverzeichnis eines neuen GitHub-Repository hochladen. Nicht den Ordner `dist` selbst hochladen.

Die flache Upload-Struktur lautet:

```text
index.html
manifest.webmanifest
sw.js
workbox-2fbc6a65.js
assets/
icons/
```

Die beiden Unterordner muessen erhalten bleiben, weil sie die gebuendelte App, PDF.js und die App-Icons enthalten. In GitHub unter **Settings > Pages > Source** dann **Deploy from a branch**, Branch `main` und Ordner `/(root)` auswaehlen.

### GitHub Actions

Alternativ den gesamten Projektordner inklusive `.github/workflows/deploy.yml` in ein Repository pushen und unter **Settings > Pages > Source** **GitHub Actions** auswaehlen. Der Workflow testet, typprueft, baut und veroeffentlicht automatisch.

Die Vite-Konfiguration verwendet relative Asset-Pfade und der HashRouter vermeidet Server-Rewrite-Anforderungen. Damit funktioniert die App auch unter `https://BENUTZERNAME.github.io/REPOSITORYNAME/`.

## Android und Offline-Test

In Chrome die GitHub-Pages-Adresse einmal vollstaendig laden. Anschliessend im Browsermenue **App installieren** waehlen. Nach der Installation Flugmodus aktivieren und die App oeffnen; importierte Dateien, Bibliothek und Reader muessen verfuegbar bleiben.

Manuelle Pruefliste: PDF- und GP5-Import; Hoch- und Querformat; Seitenwechsel per Touch und Bluetooth-Tastatur; PWA-Installation; Flugmodus; grosse Dateien; Update-Hinweis; Project-Pages-Unterpfad.

## Browsergrenzen

Die Wake Lock API und dauerhafter Speicher sind optionale Browserfunktionen. Falls nicht vorhanden, arbeitet die App weiter ohne diese Optimierungen. Lautstaerketasten koennen durch Browser-PWAs nicht verlaesslich verarbeitet werden. Die JSON-Sicherung sichert nur Metadaten, Setlisten und Einstellungen, niemals die Originaldateien.

## Abhaengigkeiten und Lizenz

Die App nutzt React, Dexie, PDF.js, alphaTab, Vite und Workbox via vite-plugin-pwa. Deren jeweilige Lizenztexte gelten zusaetzlich. Dieses Repository steht unter der MIT-Lizenz; keine urheberrechtlich geschuetzten Noten sind enthalten.
