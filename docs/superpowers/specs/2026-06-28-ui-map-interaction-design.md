# Design Specification: UI, Map & Interaction (Phase 1)

**Date:** 2026-06-28  
**Author:** Agent B (UI, Map & Interaction)  
**Status:** Approved by User  

---

## 1. Goal

Design and implement the visual front-end elements for the Bochum Smart City Simulation (MVP 1), focusing on a clean, premium, and highly responsive user interface with an interactive Leaflet map, a KPI dashboard with delta animations, and a Dev-only UI Mock Harness for testing layout variations and states in isolation from the core game logic.

---

## 2. Component Architecture & Props-Driven Design

To ensure clean separation of concerns and allow seamless integration with Agent A's simulation logic in Phase 2, all UI elements are designed to be purely React components receiving their data and callbacks via props.

### 2.1 Dashboard & Sidebar

Located on the left side (`340px` width) with a dark green theme.

*   **`Sidebar` Component**: Main container that arranges:
    *   Header (Title, current month/year within 60 months).
    *   `KpiDashboard` (Autarky, Satisfaction, Security, budget).
    *   `WeatherForecast` (Displays weather type and confidence for the next 3 months).
    *   `BuyableItemList` (Displays Solar, Wind, Storage items).
    *   `AssetDetailsPanel` (Displays details of the selected asset).
*   **`KpiBar` Component**:
    *   **Props**: `label: string`, `value: number`, `delta?: number`, `unit?: string`
    *   **Delta animation**: If `delta` is non-zero, applies green highlight (positive) or red highlight (negative) and displays "+X%" / "-X%" text. Replays animation on hover.
*   **`BuyableItemList` Component**:
    *   **Props**: `items: ItemDefinition[]`, `budget: number`, `onDragStart: (itemType: ItemType) => void`
    *   **Budget check**: Greyed out if `cost > budget`. Shows tooltip: `"Nicht genügend Budget (Benötigt: X Euro)"`.
*   **`AssetDetailsPanel` Component**:
    *   **Props**: `selectedAsset?: PlayerAsset | ExistingAsset`, `onSell?: (id: string) => void`
    *   **Existing Asset**: Hides "Verkaufen" button and displays `"Keine Änderung möglich (Bestandsanlage)"`.
    *   **Player Asset**: Shows "Verkaufen" button.

### 2.2 Leaflet Map (`BochumMap`)

Located on the right side, occupying the remaining screen space.

*   **`BochumMap` Component**:
    *   **Props**:
        *   `playerAssets: PlayerAsset[]`
        *   `existingAssets: ExistingAsset[]`
        *   `selectedAssetId?: string`
        *   `onSelectAsset: (id: string | undefined) => void`
        *   `zoneFeedback?: { zoneId: string; status: 'allowed' | 'blocked'; message: string }` (Statically controlled for Demo purposes in Phase 1)
        *   `onDropAsset?: (position: { lat: number; lng: number }) => void`
    *   **Map Bounds**: Restricts exploration using `maxBounds: [[51.35, 7.05], [51.58, 7.40]]` (Bochum borders plus a small padding).
    *   **Zoom Bounds**: Restricts zoom level between `12` (minimum zoom to see whole city) and `16` (maximum zoom to see placement details).
    *   **Tile Layer**: CartoDB Positron with correct attribution.
    *   **Visual Game Art**: Cartoony icons for solar panels, wind turbines, energiespeicher, and construction sites.
*   **`AssetMarkers` Component**:
    *   **Props**: Same as map markers subset.
    *   **Construction status**: Renders a striped overlay or cog icon for assets with `status: 'under_construction'`.
    *   **Active status**: Renders full color icons.
    *   **Selection state**: Adds a soft white/pulsating ring around the active marker.

### 2.3 Bottom Controls & End Screen

*   **`BottomControls` Component**:
    *   **Props**: `canUndo: boolean`, `undoTooltip: string`, `onUndo: () => void`, `onNextMonth: () => void`
    *   **Visuals**: Positioned bottom-center, displays `[ ↶ Rückgängig ]` on the left and `[ Nächster Monat ➔ ]` on the right.
    *   **Transition Effect**: Triggers a 600ms dark curtain fade-out/fade-in overlay when "Nächster Monat" is clicked to simulate progression.
*   **`EndScreen` Component**:
    *   **Props**: `finalScore: FinalScore`
    *   **Visuals**: Renders a beautiful fullscreen panel showing the total score, score breakdown (Autarky, Budget Efficiency, Satisfaction, Security), and a qualitative summary, with a button to restart.

---

## 3. Dev-Only UI Mock Harness (`frontend/src/testing/mockGameState.ts`)

To allow interactive testing and visual validation of all screens, the UI is connected to a dev-only mock state selector.

*   `initialMockState`: Month 1, starting budget, no player assets, default KPIs, upcoming weather mixed/sunny.
*   `midgameMockState`: Month 14, 2 player assets (one solar in Innenstadt, one wind in Gerthe under construction), custom KPIs, delta animations ready, weather windy.
*   `finishMockState`: Month 60, status finished, budget remaining, final score calculated, end screen shown.

During development (`import.meta.env.DEV`), a small overlay dropdown in the top-right corner allows switching between these three mock snapshots instantly, triggering the full visual changes.

---

## 4. Verification Plan

*   **Automated Tests**:
    *   Unit tests for Sidebar components (`BuyableItemList.test.tsx`, `KpiDashboard.test.tsx`).
    *   Verify props-driven rendering of markers, selection, and grayed-out item state.
*   **Manual Verification**:
    *   Ensure Leaflet map is restricted to Bochum coordinates.
    *   Verify the cursor/drag-preview behavior.
    *   Check next month curtain transition effect (600ms dark overlay).
    *   Verify that delta animations (green/red background and text highlights) work when switching mock states.
