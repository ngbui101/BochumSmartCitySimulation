# Präsentationsaufbau: Entwicklung eines Planspiels zur Simulation einer Smart City mit Fokus auf Smart Environment und Smart Energy anhand einer 2D-Karte

## Rahmen

- Zielgruppe: Seminarvortrag mit technik- und energiewirtschaftlichem Hintergrund
- Gesamtdauer: ca. 28–32 Minuten inklusive Live-Demo
- Literatur- und Technikteil: maximal 8 Minuten
- Empfohlene Folienzahl: 20
- Gestaltung: klare weiße Fläche, rote Linie oben/unten, Hellblau für Abschnittstitel, dunkles Blau für Text. Die Farbidee orientiert sich an der gelieferten Agenda, ohne deren Folie zu kopieren.
- Wichtige Trennung: Reale Energiedaten erklären den Kontext. Die Werte des Spiels sind bewusst vereinfachte MVP-Balancingwerte und keine Prognose für Bochum.

## Folie 1 – Titel

**Titel auf der Folie**

> Entwicklung eines Planspiels zur Simulation einer Smart City mit Fokus auf Smart Environment und Smart Energy anhand einer 2D-Karte

Für die Titelfolie eignen sich Zeilenumbrüche nach „Smart City“ und nach „Smart Energy“. Der Wortlaut bleibt dabei unverändert.

**Untertitel**

Seminarprojekt | Name | Datum

**Sprechtext, ca. 1 Minute**

„Die Energiewende besteht nicht aus einer einzelnen richtigen Technologie. Eine Stadt muss gleichzeitig Versorgung sichern, Nachfrage decken, Investitionen finanzieren und Akzeptanz erhalten. Unser Projekt übersetzt diesen Zielkonflikt in eine spielbare Simulation für Bochum. Im Vortrag zeige ich zuerst den fachlichen Hintergrund, danach unser Konzept und schließlich die technische Umsetzung mit einer Live-Demo.“

## Folie 2 – Agenda

**Inhalt**

1. Einleitung: Problem und Zielsetzung
2. Stand der Literatur und Technik: Fakten und Forschungsbedarf
3. Eigenes Konzept: Spielmodell und Entscheidungsabhängigkeiten
4. Umsetzung: Anwendung, Simulation und Live-Demo
5. Fazit, Diskussion und Ausblick

**Zeitplanung**

| Teil | Zeit |
|---|---:|
| Einleitung | 2–3 Min. |
| Literatur und Technik | max. 8 Min. |
| Konzept | 6–7 Min. |
| Umsetzung und Live-Demo | 10–12 Min. |
| Fazit und Ausblick | 2–3 Min. |

**Sprechtext, ca. 30 Sekunden**

„Der Literaturteil bleibt bewusst kompakt. Er liefert nur die Fakten, die wir für die Modellierung brauchen. Der Schwerpunkt liegt auf der Verbindung zwischen Entscheidung, Monatsbilanz und sichtbarer Konsequenz im Spiel.“

## Teil 1 – Einleitung

## Folie 3 – Das Problem: Energieplanung wirkt zeitversetzt

**Kernaussage auf der Folie**

> Eine Entscheidung heute verändert Budget, Produktion, Akzeptanz und Versorgung erst über mehrere Monate.

**Drei kurze Punkte**

- Wetter verändert Solar- und Windproduktion.
- Nachfrage und Betriebskosten laufen weiter, auch wenn nicht gebaut wird.
- Bürgerzufriedenheit und Versorgungssicherheit reagieren auf den Anlagenmix.

**Visual**

Eine einfache Zeitachse: „Bauen“ → „1 Monat Bauzeit“ → „Aktivierung“ → „Wetter und Nachfrage“ → „Budget und KPIs“.

**Sprechtext, ca. 2 Minuten**

„Eine reine Liste von Anlagen erklärt den kommunalen Zielkonflikt nicht. Entscheidend ist die zeitliche Wirkung. Eine Anlage kostet sofort Geld, wird aber erst im Folgemonat aktiv. Danach hängt ihr Nutzen vom Wetter ab. Gleichzeitig wächst im Modell der Verbrauch über die Spielzeit. Dadurch kann eine Strategie anfangs erfolgreich wirken und später trotzdem in ein Defizit führen. Genau diese Verzögerung soll die Simulation erfahrbar machen.“

## Folie 4 – Zielsetzung und Forschungsfrage

**Forschungsfrage**

> Wie kann ein transparentes, spielbares Modell zeigen, dass kommunale Energieentscheidungen mehrere Ziele gleichzeitig beeinflussen?

**Projektziele**

- Zielkonflikte sichtbar machen, ohne eine reale Prognose zu behaupten.
- Wetter als zufällige, aber reproduzierbare Herausforderung modellieren.
- Frühe Entscheidungen bis zum Spielende wirksam machen.
- Eine Anwendung bauen, die sich direkt testen und durch Simulationen balancieren lässt.

**Sprechtext, ca. 1,5 Minuten**

„Wir entwickeln kein Netzberechnungsmodell für den realen Betrieb. Unser Ziel ist ein didaktisches Modell: Spielerinnen und Spieler sollen verstehen, warum Solar, Wind, Speicher, Förderung und Standortwahl unterschiedliche Folgen haben. Die zentrale Frage lautet deshalb nicht, welche Technologie allgemein die beste ist, sondern welche Entscheidung unter einem bestimmten Wetter- und Nachfrageverlauf tragfähig bleibt.“

## Teil 2 – Stand der Literatur und Technik, maximal 8 Minuten

## Folie 5 – Welche Literatur brauchen wir?

**Drei Rechercheachsen**

1. **Energiesystem:** Erzeugung, Nachfrage, Speicher, Netze und Versorgungssicherheit
2. **Kommune:** Klimaziele, lokale Umsetzung und Bürgerakzeptanz
3. **Simulation:** Serious Games, Entscheidungsunterstützung und transparente Modellgrenzen

**Begriffliche Abgrenzung**

- Energieautarkie: Anteil des aktuellen Bedarfs, den das Modell lokal deckt.
- Versorgungsresilienz: Fähigkeit des modellierten Systems, Wetter-, Nachfrage- und Erzeugungsschwankungen abzufedern.
- Im Spiel sind beide Kennzahlen bewusst reduzierte Spielmetriken.

**Sprechtext, ca. 1,5 Minuten**

„Für die Recherche müssen wir drei Ebenen trennen. Erstens die physische Ebene mit Erzeugung, Nachfrage und Speichern. Zweitens die kommunale Ebene mit Klimazielen und Akzeptanz. Drittens die methodische Ebene: Wie kann ein Serious Game komplexe Zusammenhänge vereinfachen, ohne seine Grenzen zu verschleiern? Diese drei Achsen bilden auch die Struktur des Rechercheleitfadens im Begleitdokument.“

## Folie 6 – Fakten: Der erneuerbare Anteil wächst, die Kennzahl hängt vom Nenner ab

**Zahlen auf der Folie**

- **54,4 %**: Anteil erneuerbarer Energien am deutschen Bruttostromverbrauch 2024.
- **284,0 TWh**: Bruttostromerzeugung aus erneuerbaren Energien 2024.
- **74,1 TWh**: Photovoltaik-Erzeugung 2024.
- Fraunhofer ISE weist für 2024 **62,7 %** erneuerbare Energien an der öffentlichen Nettostromerzeugung aus.

**Hinweis unter der Grafik**

> 54,4 % und 62,7 % widersprechen sich nicht: Die Institutionen verwenden unterschiedliche Bezugsgrößen.

**Quelle klein auf der Folie**

Umweltbundesamt, Daten zur Entwicklung erneuerbarer Energien 2024; Fraunhofer ISE, Öffentliche Stromerzeugung 2024.

**Visual**

Zwei nebeneinanderstehende Balken mit den Nennern „Bruttostromverbrauch“ und „öffentliche Nettostromerzeugung“.

**Sprechtext, ca. 2 Minuten**

„Die reale Energiewende liefert bereits große erneuerbare Anteile. Das Umweltbundesamt nennt für 2024 54,4 Prozent des Bruttostromverbrauchs und rund 284 Terawattstunden erneuerbare Erzeugung. Photovoltaik lag bei 74,1 Terawattstunden. Fraunhofer ISE kommt für die öffentliche Nettostromerzeugung auf 62,7 Prozent. Der wichtige methodische Punkt ist: Die Werte messen nicht exakt dasselbe. Im Vortrag sollten wir deshalb immer den Nenner nennen. Für unser Spiel bedeutet das: Eine Prozentzahl ist nur interpretierbar, wenn klar ist, ob sie sich auf Bedarf, Erzeugung oder Netzbezug bezieht.“

## Folie 7 – Fakten: Versorgungssicherheit bedeutet mehr als genug Jahresenergie

**Zahlen und Befunde**

- Die Bundesnetzagentur meldete für 2024 durchschnittlich **11,7 Minuten** Nichtverfügbarkeit je Letztverbraucher.
- 2023 waren es **12,8 Minuten**; das Zehnjahresmittel liegt bei **12,7 Minuten**.
- Der Versorgungssicherheitsbericht 2025 betrachtet die Entwicklung bis 2035 und betont zusätzliche steuerbare Kapazitäten sowie flexible Nachfrage.

**Übertragung ins Spiel**

- Speicher erhöhen den Puffer.
- Solar und Wind verringern die Abhängigkeit von Importen, liefern aber wetterabhängig.
- Ein gemischter Anlagenpark ist robuster als eine einseitige Strategie.

**Sprechtext, ca. 2 Minuten**

„Deutschland hat im internationalen Vergleich ein sehr zuverlässiges Stromnetz. Das zeigt, dass Versorgungssicherheit nicht einfach mit lokaler Autarkie gleichzusetzen ist. Trotzdem brauchen volatile Erzeuger Flexibilität, Speicher und steuerbare Reserven. Im Spiel übersetzen wir diese Systemebene nicht in eine reale Netzsimulation. Wir verwenden stattdessen eine transparente Metrik aus aktueller Erzeugungsmischung, Speicherstruktur und privater Entlastung. Diese Vereinfachung müssen wir offen benennen.“

## Folie 8 – Vom Forschungsstand zur Spielidee

**Kernaussage**

> Das Spiel braucht keinen Sieger-Technologietyp, sondern nachvollziehbare Zielkonflikte.

**Beispielhafte Konsequenzen**

| Entscheidung | Vorteil | Risiko |
|---|---|---|
| Solar | günstiger, positive Bürgerwirkung | wetter- und saisonabhängig |
| Wind | hohe Produktion, winterlich hilfreich | teuer, negative Bürgerwirkung |
| Speicher | puffert Überschüsse und Defizite | erzeugt keinen Strom, bindet Budget |
| Förderung | private Netz-Entlastung | laufende Kosten, keine städtischen Erlöse |

**Sprechtext, ca. 1,5 Minuten**

„Die Literatur liefert keine direkte Spielanleitung. Sie hilft uns, relevante Spannungen zu identifizieren. Solar und Wind ergänzen sich, Speicher verschieben Energie zeitlich, und Akzeptanz begrenzt die rein technische Optimierung. Daraus entsteht ein Modell, in dem keine feste Strategie immer gewinnt. Wetter und steigender Verbrauch verändern die Bedingungen jeder Runde.“

## Folie 9 – Rechercheleitfaden für die Literaturarbeit

**Text auf der Folie**

> Der vollständige Leitfaden steht in `docs/literature-research.md`.
> Er fordert 8–12 überprüfbare Quellen, Kennzahlen mit Einheit und Bezugsgröße, DOI/URL, Methodik, Limitationen und einen 8-Minuten-Sprechtext.

**Sprechtext, ca. 1 Minute**

„Für die Ausarbeitung sollte nicht einfach nach allgemeinen Artikeln gefragt werden. Der Leitfaden beschreibt Quellenpriorität, Zahlen mit Bezugsgröße und eine Prüfung widersprüchlicher Werte. Besonders wichtig ist die Regel: Keine Zahl ohne Quelle, keine erfundene Literaturangabe und eine klare Trennung zwischen realen Daten und unseren Spielparametern.“

## Teil 3 – Eigenes Konzept

## Folie 10 – Das Spielkonzept in einem Satz

**Hauptsatz**

> Die Stadt entwickelt über 60 Monate einen robusten Energiemix unter zufälligem Wetter, wachsendem Verbrauch, begrenztem Budget und Bürgerreaktionen.

**Startbedingungen**

- Budget: **18 Mio. €**
- Energieautarkie: **0**
- Bürgerzufriedenheit: **50**
- Versorgungssicherheit: **0**
- Keine vorplatzierten Bestandsanlagen

**Sprechtext, ca. 2 Minuten**

„Die aktuelle Runde startet bewusst ohne Bestandsanlagen. Damit ist der Ausgangspunkt verständlich: Es gibt zunächst keine lokale Erzeugung und keine Speicher. Die Zufriedenheit startet bei 50 Punkten. Das Budget beträgt 18 Millionen Euro. Jede Sitzung bekommt einen eigenen Wetter-Seed. Dadurch ist die Herausforderung neu, aber bei gleichem Seed reproduzierbar.“

## Folie 11 – Die zentrale Spielschleife

**Ablauf**

1. Drei-Monats-Wetterprognose lesen
2. Technologie und Stadtteil auswählen
3. Budget, Kapazität und Akzeptanz prüfen
4. Anlage bauen oder Förderung setzen
5. Monatswechsel ausführen
6. Produktion, Nachfrage, Speicher, Importe und KPIs auswerten
7. Entscheidung an die neue Lage anpassen

**Wichtig**

> Neue Anlagen werden erst nach einem Monat aktiv.

**Sprechtext, ca. 2 Minuten**

„Die Schleife erzeugt den Zeitdruck. Wer erst im Defizitmonat baut, erhält die Anlage zu spät. Wer zu früh zu viel baut, verliert Budget und Bürgerzufriedenheit. Der Monatswechsel ist deshalb die eigentliche Simulationsgrenze: Hier werden neue Anlagen aktiviert, das Wetter angewendet, der Bedarf berechnet, Speicher genutzt und das Budget aktualisiert.“

## Folie 12 – Abhängigkeiten der Entscheidungen

**Diagrammtext**

```text
Wetter-Seed + Jahreszeit
          ↓
Solar-/Windfaktor ───────┐
                         ↓
Technologie + Zone → aktive Anlagen → Produktion
        ↓                         ↓
   Kaufpreis                 Energiebilanz ← Nachfrage
        ↓                         ↓
      Budget             Speicher / Importe / Erlöse
        ↓                         ↓
Förderung → private Entlastung → KPIs und Endscore
        ↓
Bürgerzufriedenheit ← Anlagenmix + Standort + Überbauung
```

**Sprechtext, ca. 2,5 Minuten**

„Die Grafik zeigt, warum Entscheidungen voneinander abhängen. Wetter und Nachfrage bestimmen die monatliche Energiebilanz. Die Wahl von Technologie und Zone bestimmt Kosten, Produktion, Kapazität und Bürgerwirkung. Förderungen erzeugen private Anlagen, die das Netz entlasten, aber der Stadt keine direkten Verkaufserlöse bringen. Energieautarkie und Versorgungssicherheit werden aktuell aus dem laufenden Monat beziehungsweise dem aktuellen Anlagenmix neu berechnet. Sie steigen also nicht einfach durch Zeitablauf.“

## Folie 13 – Schwierigkeit und Sweet Spot

**Inhalt**

- Nachfrage wächst in der Produktion über 60 Monate auf **135 %** des Ausgangsniveaus.
- Die Python-Simulation testet zusätzlich Endwerte bis **200 %**.
- Mehrere Strategien werden über viele Wetter-Seeds verglichen.
- Ziel: keine Strategie soll unabhängig vom Wetter immer gewinnen.

**Visual**

Die vorhandene Grafik `frontend/public/strategy-sweep.png` oder `simulations/results/demand-growth-sweep-challenge.png` als Ergebnisabbildung einfügen.

**Sprechtext, ca. 2 Minuten**

„Der Produktions-Sweet-Spot liegt aktuell bei 135 Prozent Verbrauchswachstum. Das bedeutet nicht, dass jede Runde gleich endet. Es bedeutet, dass die Herausforderung spürbar wird, ohne die Runde sofort zu zerstören. Für die Balancierung testen wir darüber hinaus 140 bis 200 Prozent. Die Sweep-Ergebnisse zeigen, ob eine Strategie nur wegen eines günstigen Wetter-Seeds gewinnt oder ob sie unter vielen Wetterverläufen tragfähig ist.“

## Teil 4 – Umsetzung und Live-Demo

## Folie 14 – Technischer Aufbau der Anwendung

**Architektur auf der Folie**

```text
React + TypeScript + Vite
├── App / State-Integration
├── Game Reducer und Actions
├── Leaflet-Karte
│   ├── CARTO-Light oder OpenStreetMap-Fallback
│   ├── Stadtgrenze, Stadtteilgrenzen und Namen
│   └── Anlagenmarker
├── Sidebar
│   ├── Wetterprognose
│   ├── KPIs
│   ├── Förderungen
│   ├── Bauoptionen und Details
│   └── Endscreen
└── Simulation
    ├── Wetter
    ├── Platzierungsregeln
    ├── Monatsbilanz
    └── Scoring
```

**Sprechtext, ca. 2 Minuten**

„Die Anwendung ist ein frontend-only MVP. React verwaltet die Oberfläche, der Reducer verarbeitet Spielaktionen, und die Simulationsmodule berechnen Wetter, Platzierung, Monatsbilanz und Score. Die Karte ist eine räumliche Oberfläche für Zonen und Anlagen. Der Spielstand wird lokal im Browser gespeichert. Es gibt aktuell kein Backend und keine Datenbank.“

## Folie 15 – Monatswechsel als Rechenkern

**Reihenfolge auf der Folie**

1. Monat erhöhen und Anlagen aktivieren
2. Förderkosten und private Kapazität berechnen
3. Erzeugung, private Entlastung und Nachfrage bestimmen
4. Speicher laden oder entladen
5. Importe, Erlöse und Betriebskosten berechnen
6. Budget und KPIs aktualisieren
7. Prognose erzeugen und Verlust-/Endbedingungen prüfen

**Sprechtext, ca. 2 Minuten**

„Diese Reihenfolge ist wichtig. Eine neue Anlage produziert nicht sofort. Private Anlagen reduzieren den Restbedarf, bringen der Stadt aber keine Verkaufserlöse. Ein Defizit verursacht Importkosten. Ein Überschuss füllt zuerst den Speicher; der Rest verfällt. So entstehen sichtbare Konsequenzen aus jeder Entscheidung, ohne dass die Benutzeroberfläche mit technischen Details überladen wird.“

## Folie 16 – Sichtbare und versteckte Spielvariablen

**Für Spieler sichtbar**

- Budget
- Energieautarkie
- Bürgerzufriedenheit
- Versorgungssicherheit
- Monatsverbrauch und Wetterprognose
- Anlagen, Förderungen und Netz-Entlastung

**Im Algorithmus versteckt**

- Wetter-Seed
- saisonale Produktionsfaktoren
- monatliche Nachfrageentwicklung
- Importkosten, Erträge und Bauverzögerung
- Resilienzkomponenten aus Speicher und Erzeugungsmix

**Sprechtext, ca. 1,5 Minuten**

„Die UI zeigt nur die Kennzahlen, die für eine Entscheidung notwendig sind. Die genaue Berechnung der Resilienz bleibt im Algorithmus. Das hält die Oberfläche übersichtlich und verhindert, dass Spieler nur eine versteckte Formel optimieren. Gleichzeitig bleibt der Zusammenhang testbar, weil die Python-Simulation dieselbe Logik unabhängig durchspielen kann.“

## Folie 17 – Live-Demo: Ablauf und Sprechtext

**Vorbereitung**

- Produktions-Preview öffnen
- Neue Runde starten oder Spielstand zurücksetzen
- Browserfenster auf Karten- und Sidebar-Bereich skalieren

**Demo-Schritte**

1. **Start zeigen:** Budget 18 Mio. €, Autarkie 0, Zufriedenheit 50, Sicherheit 0.
2. **Prognose lesen:** drei Monate anzeigen und einen Standort mit erlaubten Technologien auswählen.
3. **Solar bauen:** Kosten, Bauzeit und Standortwirkung zeigen.
4. **Speicher ergänzen:** erklären, dass er keinen Strom erzeugt, aber Überschüsse und Defizite abfedert.
5. **Monatswechsel:** Aktivierung, Wetter, Nachfrage und KPI-Veränderung zeigen.
6. **Förderung aktivieren:** private Anlage ab Schwelle zeigen; Netz-Entlastung steigt, städtischer Erlös nicht.
7. **Fehlentscheidung demonstrieren:** zu viele Bauten in einer Zone oder teure Windanlage zeigen und Bürger-/Budgeteffekt erklären.
8. **Endscreen oder Simulationsergebnis:** Score und vier Teilwerte einordnen.

**Sprechtext für die Überleitung**

„Ich spiele keine optimale Runde vor, sondern zeige die Ursache-Wirkungs-Kette. Nach jeder Aktion frage ich: Was kostet sie sofort? Wann wird sie aktiv? Welche Wetterlage braucht sie? Und welcher KPI beziehungsweise Budgetposten reagiert beim nächsten Monatswechsel?“

## Folie 18 – Wie wir das Modell prüfen

**Prüfmethoden**

- Frontend-Tests für Reducer, Monatslogik, Wetter, Platzierung und UI-Flows
- Python-Simulation getrennt von der Webanwendung
- Wetter-Seeds für reproduzierbare Sessions
- Strategie- und Nachfrage-Sweeps
- visueller Test der Produktionsanwendung

**Ergebnisbotschaft**

> Balancing ist ein iterativer Prozess: Hypothese → Simulation → Spieltest → Anpassung.

**Sprechtext, ca. 1,5 Minuten**

„Wir prüfen das Spiel nicht nur durch einzelne manuelle Runden. Die Frontend-Tests schützen die Berechnung, die Python-Simulation vergleicht viele Wetterverläufe, und die Sweeps zeigen die Empfindlichkeit gegenüber Nachfragewachstum. Danach folgt der praktische Spieltest. So verbinden wir technische Korrektheit mit der Frage, ob die Konsequenzen für Menschen verständlich und interessant sind.“

## Teil 5 – Fazit, Diskussion und Ausblick

## Folie 19 – Fazit

**Drei Ergebnisse**

1. Das Modell macht verzögerte Energieentscheidungen spielbar.
2. Wetter, Nachfrage, Speicher, Budget und Akzeptanz erzeugen echte Zielkonflikte.
3. Die getrennte Simulation unterstützt die Suche nach einem fairen Sweet Spot.

**Sprechtext, ca. 1,5 Minuten**

„Unser wichtigstes Ergebnis ist kein einzelner optimaler Bauplan. Es ist ein nachvollziehbarer Entscheidungsraum. Der Spieler muss mit Unsicherheit umgehen und die Folgen früher Entscheidungen beobachten. Dadurch eignet sich die Anwendung als Diskussions- und Lernwerkzeug, solange wir ihre Spielwerte nicht mit realen Prognosen verwechseln.“

## Folie 20 – Grenzen und nächste Schritte

**Grenzen**

- keine reale Netzphysik und keine standortscharfe Potenzialanalyse
- MVP-Werte für Kosten, Produktion und Bürgerwirkung
- lokale Speicherung statt Mehrbenutzer- oder Kommunalplattform
- noch keine empirische Evaluation mit Zielgruppen

**Nächste Schritte**

- Literaturrecherche abschließen und Parameter transparent begründen
- Spieltest mit mehreren Nutzergruppen
- Sensitivitätsanalyse für Importpreis, Nachfragewachstum und Akzeptanz
- optional: historische Wetterdaten oder kommunale Energiedaten als Szenarien

**Abschlussfrage**

> Welche Vereinfachung hilft beim Lernen – und ab wann verzerrt sie die Entscheidung?

**Sprechtext, ca. 1,5 Minuten**

„Der nächste wissenschaftliche Schritt ist die Validierung der Annahmen. Wir müssen nicht jede reale Netzkomponente abbilden, aber wir sollten begründen können, warum eine Vereinfachung für das Lernziel ausreicht. Besonders interessant ist, ob unterschiedliche Spielgruppen dieselben Zielkonflikte erkennen und ob die Schwierigkeit als fair erlebt wird.“

## Quellen für den Literaturteil

- [Stadt Bochum: Klimaplan Bochum 2035](https://www.bochum.de/Klimaplan)
- [Umweltbundesamt: Erneuerbare Energien in Deutschland, Daten 2024](https://www.umweltbundesamt.de/system/files/medien/479/publikationen/hgp_erneuerbareenergien_2024.pdf)
- [Umweltbundesamt: Energieverbrauch und Energieeffizienz in Deutschland](https://www.umweltbundesamt.de/themen/klima-energie/energiesparen/energieverbrauch-energieeffizienz-in-deutschland-in)
- [Fraunhofer ISE: Öffentliche Stromerzeugung 2024](https://www.ise.fraunhofer.de/de/presse-und-medien/presseinformationen/2025/oeffentliche-stromerzeugung-2024-deutscher-strommix-so-sauber-wie-nie.html)
- [Bundesnetzagentur: Versorgungsunterbrechungen Strom 2024](https://www.bundesnetzagentur.de/1075952)
- [Bundesnetzagentur: Monitoring der Versorgungssicherheit](https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Versorgungssicherheit/Monitoring_Strom/start.html)

## Hinweise für die PowerPoint-Erstellung

- Pro Folie eine Kernaussage, nicht mehr als vier bis fünf kurze Textblöcke.
- Zahlen groß darstellen, Methodik und Quelle klein darunter.
- Reale Daten mit einem Label „Realwelt“ markieren.
- Spielwerte mit „MVP-Balancingwert“ markieren.
- Die Abhängigkeitsgrafik und die Monatsreihenfolge als editierbare Formen nachbauen.
- Für die Live-Demo keine Folie mit zu viel Text: Die Demo-Schritte als kleine Checkliste verwenden.
