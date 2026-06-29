# Gewinngenerierung durch Stromverkauf Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement profit/revenue generation by selling electricity to citizens at a fixed tariff of 40,000 € per unit of seasonal demand, charging import costs for deficit, and deducting operating costs, displaying the budget delta in the UI.

**Architecture:** Extend GameState types, selectors, and monthly simulation logic to track and compute Stromverkauf (revenue), operating costs, and net monthly delta. Update the sidebar UI to render the budget delta and the detailed financial split.

**Tech Stack:** React, TypeScript, Vitest, CSS.

## Global Constraints
- Fixed tariff rate of 40,000 € per unit of demand.
- Import cost rate of 60,000 € per unit of deficit.
- Schonfrist in Month 0: display delta in UI, but actually deduct/apply it only when advancing the month.

---

### Task 1: Type Definitions Update

**Files:**
- Modify: [game.ts](file:///d:/BochumSmartCitySimulation/frontend/src/types/game.ts#L54-L63)

**Interfaces:**
- Consumes: `MonthlySnapshot` from `types/game.ts`
- Produces: Updated `MonthlySnapshot` type signature including financial fields.

- [ ] **Step 1: Update type definition for MonthlySnapshot**
  Add the following fields to `MonthlySnapshot` in `frontend/src/types/game.ts`:
  ```typescript
  revenueFromSales: number;
  operatingCosts: number;
  netMonthlyDelta: number;
  ```

- [ ] **Step 2: Run build to verify type checking**
  Run: `npm run build`
  Expected: Compile errors in `frontend/src/testing/mockGameState.ts` and `frontend/src/simulation/monthlySimulation.ts` due to missing fields in initializations or returns.

- [ ] **Step 3: Update `mockGameState.ts` with mock values**
  Modify: [mockGameState.ts](file:///d:/BochumSmartCitySimulation/frontend/src/testing/mockGameState.ts)
  Add mock values for `revenueFromSales`, `operatingCosts`, and `netMonthlyDelta` to all snapshots in `monthlyHistory` of `midgameMockState`.
  For example, for month index 0:
  ```typescript
  energyDemand: 95, energyProduction: 0, energySaldo: -95, importCost: 5700000, storedEnergy: 0,
  revenueFromSales: 3800000, operatingCosts: 0, netMonthlyDelta: -1900000
  ```
  Fill appropriate mock values for other months as well (Revenue = Demand * 40k, OperatingCosts = 0 for initial, some for midgame, NetDelta = Revenue - ImportCost - OperatingCosts).

- [ ] **Step 4: Run build to verify type errors are partially resolved**
  Run: `npm run build`
  Expected: Only `monthlySimulation.ts` and tests will have type errors.

- [ ] **Step 5: Commit**
  ```bash
  git add frontend/src/types/game.ts frontend/src/testing/mockGameState.ts
  git commit -m "chore: add financial fields to MonthlySnapshot type and mock states"
  ```

---

### Task 2: Implement selectors

**Files:**
- Modify: [selectors.ts](file:///d:/BochumSmartCitySimulation/frontend/src/game/selectors.ts)
- Create: `frontend/tests/game/selectors.test.ts`

**Interfaces:**
- Consumes: `GameState` from `types/game.ts`
- Produces: `getCurrentRevenueFromSales(state: GameState): number`, `getCurrentOperatingCosts(state: GameState): number`, `getCurrentNetMonthlyDelta(state: GameState): number`

- [ ] **Step 1: Write selectors test file**
  Create `frontend/tests/game/selectors.test.ts` with tests for the new selectors.
  ```typescript
  import { describe, expect, it } from 'vitest';
  import { createInitialGameState } from '../../src/game/initialGameState';
  import { getCurrentRevenueFromSales, getCurrentOperatingCosts, getCurrentNetMonthlyDelta } from '../../src/game/selectors';

  describe('energy finance selectors', () => {
    it('calculates initial revenue from sales and operating costs', () => {
      const state = createInitialGameState();
      // Month 0 demand is 95. Revenue should be 95 * 40,000 = 3,800,000.
      expect(getCurrentRevenueFromSales(state)).toBe(3800000);
      expect(getCurrentOperatingCosts(state)).toBe(0);
      // Net Delta: 3,800,000 (revenue) - 5,700,000 (import) - 0 (operating) = -1,900,000
      expect(getCurrentNetMonthlyDelta(state)).toBe(-1900000);
    });
  });
  ```

- [ ] **Step 2: Run test to verify selectors fail/are undefined**
  Run: `npm test -- tests/game/selectors.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement selectors in `selectors.ts`**
  Add implementation to `frontend/src/game/selectors.ts`:
  ```typescript
  export function getCurrentRevenueFromSales(state: GameState): number {
    const demand = getCurrentEnergyDemand(state);
    return demand * 40_000;
  }

  export function getCurrentOperatingCosts(state: GameState): number {
    const activeAssets = state.playerAssets.filter((a) => a.status === 'active');
    return activeAssets.reduce((sum, asset) => {
      const def = getItemDefinition(asset.itemType);
      return sum + (def?.operatingCost ?? 0);
    }, 0);
  }

  export function getCurrentNetMonthlyDelta(state: GameState): number {
    const revenue = getCurrentRevenueFromSales(state);
    const importCost = getCurrentImportCost(state);
    const operatingCosts = getCurrentOperatingCosts(state);
    return revenue - importCost - operatingCosts;
  }
  ```

- [ ] **Step 4: Run selectors test to verify they pass**
  Run: `npm test -- tests/game/selectors.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add frontend/src/game/selectors.ts frontend/tests/game/selectors.test.ts
  git commit -m "feat: implement selectors for energy revenue, operating costs, and net delta"
  ```

---

### Task 3: Update Monthly Simulation Logic

**Files:**
- Modify: [monthlySimulation.ts](file:///d:/BochumSmartCitySimulation/frontend/src/simulation/monthlySimulation.ts)

**Interfaces:**
- Consumes: `selectors.ts`
- Produces: GameState with updated budget and snapshot fields during monthly advance.

- [ ] **Step 1: Write failing test for advanceMonth budget changes**
  Modify: [monthlySimulation.test.ts](file:///d:/BochumSmartCitySimulation/frontend/tests/simulation/monthlySimulation.test.ts)
  Add a test to verify budget is updated by the net monthly delta:
  ```typescript
  it('updates budget by net monthly delta on advanceMonth', () => {
    const state = createInitialGameState();
    // Initially, demand is 95. Revenue = 3.8M. Import cost = 5.7M. Operating cost = 0.
    // Net delta = -1.9M.
    const next = advanceMonth(state);
    expect(next.budget).toBe(18000000 - 1900000);
  });
  ```

- [ ] **Step 2: Run tests to verify failure**
  Run: `npm test -- tests/simulation/monthlySimulation.test.ts`
  Expected: FAIL

- [ ] **Step 3: Update `monthlySimulation.ts`**
  Modify: `frontend/src/simulation/monthlySimulation.ts`
  1. Change `calculateNextBudget` signature and logic:
  ```typescript
  function calculateNextBudget(
    state: GameState,
    netMonthlyDelta: number
  ): number {
    return Math.max(0, Math.round(state.budget + netMonthlyDelta));
  }
  ```
  2. In `advanceMonth(state)`:
  Compute the financial values and update budget and snapshot:
  ```typescript
  const revenueFromSales = energyBalance.demand * 40_000;
  const operatingCosts = activeAssets.reduce((sum, asset) => {
    const itemDefinition = getItemDefinition(asset.itemType);
    return sum + (itemDefinition?.operatingCost ?? 0);
  }, 0);
  const netMonthlyDelta = revenueFromSales - energyBalance.importCost - operatingCosts;

  const nextState: GameState = {
    ...state,
    currentMonthIndex: nextMonthIndex,
    budget: calculateNextBudget(state, netMonthlyDelta),
    kpis: calculateNextKpis(state, activeAssets),
    playerAssets,
    storedEnergy: energyBalance.newStoredEnergy,
    undoStack: [],
    monthlyHistory: [
      ...state.monthlyHistory,
      {
        monthIndex: state.currentMonthIndex,
        budget: state.budget,
        kpis: state.kpis,
        energyDemand: energyBalance.demand,
        energyProduction: energyBalance.production,
        energySaldo: energyBalance.saldo,
        importCost: energyBalance.importCost,
        storedEnergy: state.storedEnergy,
        revenueFromSales,
        operatingCosts,
        netMonthlyDelta
      }
    ],
    forecast: createForecast(nextMonthIndex),
    status
  };
  ```

- [ ] **Step 4: Run tests to verify success**
  Run: `npm test -- tests/simulation/monthlySimulation.test.ts`
  Expected: PASS.
  *Note: If other monthlyHistory snapshot assertions fail, update them to include or match the new fields.*

- [ ] **Step 5: Commit**
  ```bash
  git add frontend/src/simulation/monthlySimulation.ts frontend/tests/simulation/monthlySimulation.test.ts
  git commit -m "feat: calculate budget using net monthly delta and populate MonthlySnapshot financial fields"
  ```

---

### Task 4: UI integration in KpiDashboard

**Files:**
- Modify: [KpiDashboard.tsx](file:///d:/BochumSmartCitySimulation/frontend/src/sidebar/KpiDashboard.tsx)
- Modify: [Sidebar.tsx](file:///d:/BochumSmartCitySimulation/frontend/src/sidebar/Sidebar.tsx)
- Modify: [App.tsx](file:///d:/BochumSmartCitySimulation/frontend/src/app/App.tsx)

**Interfaces:**
- Consumes: Updated `EnergyStatusProps` and `KpiDashboardProps`
- Produces: Renders budget delta and revenue details in UI.

- [ ] **Step 1: Write failing test in KpiDashboard.test.tsx**
  Modify: [KpiDashboard.test.tsx](file:///d:/BochumSmartCitySimulation/frontend/tests/sidebar/KpiDashboard.test.tsx)
  Add a test to verify rendering of budget delta:
  ```typescript
  it('renders budget delta correctly', () => {
    const customStatus = { ...mockEnergyStatus, netMonthlyDelta: 1200000 };
    render(<KpiDashboard budget={18000000} kpis={mockKpis} energyStatus={customStatus} />);
    expect(screen.getByText(/\+1\.200\.000/)).toBeInTheDocument();
  });
  ```

- [ ] **Step 2: Run test to verify failure**
  Run: `npm test -- tests/sidebar/KpiDashboard.test.tsx`
  Expected: FAIL

- [ ] **Step 3: Update `KpiDashboard.tsx` interfaces and rendering**
  Modify: `frontend/src/sidebar/KpiDashboard.tsx`
  1. Add `netMonthlyDelta: number; revenueFromSales: number;` to `EnergyStatusProps`.
  2. In `KpiDashboard`, render the budget delta next to the budget value:
  ```typescript
  const deltaVal = energyStatus.netMonthlyDelta;
  const deltaFormatted = `${deltaVal >= 0 ? '+' : ''}${deltaVal.toLocaleString('de-DE')} €/Monat`;
  const deltaClass = deltaVal >= 0 ? 'budget-delta-positive' : 'budget-delta-negative';
  // Render:
  <strong className="budget-value" data-testid="budget-value">
    {formattedBudget}
    <span className={`budget-delta ${deltaClass}`}> ({deltaFormatted})</span>
  </strong>
  ```
  3. In `EnergyStatusRow`, display the Stromverkauf revenue:
  ```typescript
  const revenueFormatted = revenueFromSales.toLocaleString('de-DE');
  // Inside the deficit/surplus renders, add:
  <span className="saldo-detail">
    💰 Stromverkauf: +{revenueFormatted} €
  </span>
  ```

- [ ] **Step 4: Update `Sidebar.tsx` and `App.tsx`**
  Modify: `frontend/src/sidebar/Sidebar.tsx` and `frontend/src/app/App.tsx`
  Pass `netMonthlyDelta: getCurrentNetMonthlyDelta(state)` and `revenueFromSales: getCurrentRevenueFromSales(state)` through the `energyStatus` prop to `Sidebar` and `KpiDashboard`.

- [ ] **Step 5: Run tests to verify all pass**
  Run: `npm test`
  Expected: All tests pass. Update any tests in `Sidebar.test.tsx` or `KpiDashboard.test.tsx` if props mismatch.

- [ ] **Step 6: Commit**
  ```bash
  git add frontend/src/sidebar/KpiDashboard.tsx frontend/src/sidebar/Sidebar.tsx frontend/src/app/App.tsx frontend/tests/sidebar/KpiDashboard.test.tsx frontend/tests/sidebar/Sidebar.test.tsx
  git commit -m "feat: integrate budget delta and revenue details in KpiDashboard UI"
  ```

---

### Task 5: Style updates

**Files:**
- Modify: [App.css](file:///d:/BochumSmartCitySimulation/frontend/src/app/App.css)

- [ ] **Step 1: Add budget-delta CSS rules**
  Add styles for the new budget delta classes in `frontend/src/app/App.css`:
  ```css
  .budget-delta {
    font-size: 0.85rem;
    font-weight: 700;
  }
  .budget-delta-positive {
    color: #3db87a;
  }
  .budget-delta-negative {
    color: #e05252;
  }
  ```

- [ ] **Step 2: Verify build**
  Run: `npm run build`
  Expected: Success

- [ ] **Step 3: Commit**
  ```bash
  git add frontend/src/app/App.css
  git commit -m "style: add CSS rules for budget delta rendering"
  ```
