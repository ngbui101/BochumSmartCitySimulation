# UI, Map & Interaction (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a responsive, props-driven UI for the Bochum Smart City Simulation (MVP 1), featuring an interactive Leaflet map restricted to Bochum's boundaries, a KPI sidebar with dynamic delta animations, bottom controls (Undo & Next Month), and a dev-only mock harness to test all components in isolation.

**Architecture:** All UI components will be props-driven, consuming data and callbacks. A `mockGameState` harness will supply test states (initial, midgame, completed) via a top-right dropdown in development mode.

**Tech Stack:** React, Leaflet, React-Leaflet, CSS, Vitest, React Testing Library.

## Global Constraints
* No game simulation logic in UI components (no placement rules, weather progression, or budget subtraction inside components).
* All components must be props-driven to allow seamless integration in Phase 2.
* Leaflet maps must use CartoDB Positron with proper attribution and be constrained to Bochum's coordinates.

---

### Task 1: Setup Mock Game States & Icons
**Files:**
* Create: `frontend/src/testing/mockGameState.ts`
* Create: `frontend/src/ui/icons.tsx`

- [ ] **Step 1: Implement `mockGameState.ts`**
  Write mock game states representing:
  - `initialMockState`: Month 1, budget 18,000,000, autarky 18, satisfaction 72, security 58, 3-month forecast.
  - `midgameMockState`: Month 14, budget 13,400,000, autarky 34 (+5), satisfaction 68 (-4), security 62 (+2), 2 player assets.
  - `finishMockState`: Month 60, status 'finished', final score computed.
- [ ] **Step 2: Implement `icons.tsx`**
  Define and export SVG components for Solar, Wind, Storage, Existing Assets (grey/locked), and Construction badges.
- [ ] **Step 3: Verify build**
  Run: `npm run build`

### Task 2: Configure Map Bounds and Render Leaflet Map (Task 12)
**Files:**
* Create: `frontend/src/map/mapBounds.ts`
* Create: `frontend/src/map/BochumMap.tsx`

- [ ] **Step 1: Implement `mapBounds.ts`**
  Define `bochumBounds = [[51.35, 7.05], [51.58, 7.40]]`, `minZoom = 12`, `maxZoom = 16`.
- [ ] **Step 2: Implement `BochumMap.tsx`**
  Renders the Leaflet `MapContainer`, the GeoJSON zone layer with hover highlights, and sets bounds/zooms.
- [ ] **Step 3: Verify build**
  Run: `npm run build`

### Task 3: Implement Asset Markers and Details Panel (Task 15)
**Files:**
* Create: `frontend/src/map/AssetMarkers.tsx`
* Create: `frontend/src/sidebar/AssetDetailsPanel.tsx`

- [ ] **Step 1: Implement `AssetMarkers.tsx`**
  Renders markers for existing assets and player-placed assets. Includes construction Cog/Crane overlays if status is `under_construction`.
- [ ] **Step 2: Implement `AssetDetailsPanel.tsx`**
  Displays type, zone, status, operational costs, and sell action (button hidden for existing assets).
- [ ] **Step 3: Verify build**
  Run: `npm run build`

### Task 4: Sidebar Dashboard and Delta Animations (Task 17)
**Files:**
* Create: `frontend/src/components/KpiBar.tsx`
* Create: `frontend/src/sidebar/KpiDashboard.tsx`
* Create: `frontend/src/sidebar/WeatherForecast.tsx`
* Create: `frontend/src/sidebar/BuyableItemList.tsx`
* Create: `frontend/src/sidebar/Sidebar.tsx`
* Modify: `frontend/src/ui/animations.css`

- [ ] **Step 1: Implement KPI Bars and Deltas in `KpiBar.tsx`**
  Renders autarky, satisfaction, and security with animations triggered by delta changes.
- [ ] **Step 2: Implement `KpiDashboard.tsx`, `WeatherForecast.tsx`, `BuyableItemList.tsx`, and `Sidebar.tsx`**
  Assembles sidebar sections.
- [ ] **Step 3: Update `animations.css`**
  Define delta improve/worsen keyframes.
- [ ] **Step 4: Verify build**
  Run: `npm run build`

### Task 5: Bottom Controls & App Layout Integration
**Files:**
* Create: `frontend/src/components/BottomControls.tsx`
* Modify: `frontend/src/app/App.tsx`
* Modify: `frontend/src/app/App.css`

- [ ] **Step 1: Implement `BottomControls.tsx`**
  Displays `Undo` and `Next Month` buttons with month-transition curtain animation.
- [ ] **Step 2: Update `App.tsx` and `App.css`**
  Lays out Sidebar and Map container side-by-side and attaches mock harness dropdown.
- [ ] **Step 3: Verify build and tests**
  Run: `npm run test:run; npm run build`
