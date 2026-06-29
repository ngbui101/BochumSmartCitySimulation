# Design-Spezifikation: Gewinngenerierung durch Stromverkauf

Dieses Dokument beschreibt das Design für die Implementierung von Einnahmen und Gewinn in der Bochum Smart City Simulation. Bisher hatte die Stadt nur Ausgaben. Nun verdient die Stadt Geld durch den Verkauf von Strom an ihre Bürger, während Defizite weiterhin zu Importkosten führen und betriebsbereite Anlagen laufende Kosten verursachen.

## 1. Mathematisches Modell (Finanzbilanz)

Für jeden Monatsschritt (`ADVANCE_MONTH`) gelten folgende Regeln:

1. **Stromverkauf an Bürger (Einnahmen):**
   Die Stadt verkauft Strom zur Deckung des saisonalen Bedarfs (60–100 Einheiten) an die Bürger zu einem festen Tarif von **40.000 € pro Einheit**.
   $$\text{Stromverkauf} = \text{Bedarf} \times 40.000\,€$$

2. **Betriebskosten (Ausgaben):**
   Laufende monatliche Betriebskosten für alle aktiven Anlagen (Solar: 35.000 €, Wind: 80.000 €, Speicher: 45.000 €).
   $$\text{Betriebskosten} = \sum \text{operatingCost}$$

3. **Stromimport (Ausgaben bei Defizit):**
   Falls die Produktion plus gespeicherte Energie den Bedarf nicht deckt, entstehen Importkosten von **60.000 € pro fehlender Einheit**.
   $$\text{Importkosten} = \max(0, \text{Bedarf} - (\text{Produktion} + \text{gespeicherte Energie})) \times 60.000\,€$$

4. **Netto-Monats-Delta (Gewinn / Verlust):**
   $$\text{Monats-Delta} = \text{Stromverkauf} - \text{Importkosten} - \text{Betriebskosten}$$

5. **Budget-Aktualisierung:**
   $$\text{Budget}_{neu} = \text{Budget} + \text{Monats-Delta}$$

*Schonfrist:* In Monat 0 wird das Monats-Delta berechnet und in der UI angezeigt, aber das Budget wird noch nicht verändert. Ab Monat 1 wird das Delta voll auf das Budget angewendet.

---

## 2. Änderungen an Datenstrukturen

### `MonthlySnapshot` in `types/game.ts`
Wir erweitern den Snapshot, um die finanziellen Details historisch zu tracken:
```typescript
export type MonthlySnapshot = {
  monthIndex: number;
  budget: number;
  kpis: GameKpis;
  energyDemand: number;
  energyProduction: number;
  energySaldo: number;
  importCost: number;
  storedEnergy: number;
  // NEUE FELDER:
  revenueFromSales: number; // Einnahmen aus Stromverkauf (Bedarf * 40.000)
  operatingCosts: number;   // Betriebskosten aller aktiven Anlagen
  netMonthlyDelta: number;  // Netto-Gewinn/Verlust dieses Monats
};
```

---

## 3. Benutzeroberfläche (UI) im KpiDashboard

Das `KpiDashboard` wird um das monatliche Budget-Delta und die finanzielle Aufschlüsselung erweitert.

### Budget-Delta (Ansatz C)
Rechts neben dem Budget-Wert wird das berechnete Monats-Delta angezeigt:
- Positives Delta (Gewinn): `18.000.000 Euro (+1.240.000 €/Monat)` in grün.
- Negatives Delta (Verlust): `18.000.000 Euro (-1.900.000 €/Monat)` in rot.

### Aufschlüsselung der Einnahmen/Ausgaben (Ansatz A)
Die `EnergyStatusRow` zeigt neben dem Energie-Saldo und eventuellen Importkosten auch die Stromverkaufseinnahmen an:
- `⚡ Energie-Saldo: -12 Einh.`
- `💰 Stromverkauf: +3,8 Mio. € | Import: -720.000 €`

---

## 4. Test- & Verifikationsplan

### Automatisierte Tests
- **Unit Tests (`monthlySimulation.test.ts`):** Verifikation, dass Stromverkauf, Betriebskosten und Importkosten korrekt berechnet und mit dem Budget verrechnet werden.
- **Selector Tests:** Testen der neuen Selektoren für Einnahmen, Betriebskosten und Monats-Delta.
- **UI Tests:** Verifikation, dass das Budget-Delta im `KpiDashboard` gerendert wird.

### Manuelle Tests
- Start des Spiels in Monat 0: Delta wird mit ca. -1,9 Mio. € angezeigt (Bedarf 95 × 40.000 = 3,8 Mio. Einnahmen minus 95 × 60.000 = 5,7 Mio. Import). Budget bleibt bei 18.000.000 € (Schonfrist).
- Klick auf "Nächster Monat": Budget sinkt auf 16.100.000 € (Verlust von 1,9 Mio. € abgezogen).
- Bau von Wind- und Solaranlagen: Das Delta nähert sich 0 oder wird positiv.
- Bau von Speichern: Überschüssiger Strom wird gepuffert, wodurch im nächsten Wintermonat weniger Importkosten anfallen und das Monats-Delta positiv bleibt.
