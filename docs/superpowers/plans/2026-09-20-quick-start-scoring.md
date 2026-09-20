# Quick Start and Scoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ergänze einen persistenten Quick Start, klare Niederlagen und das neue transparente Punktesystem für den Cozy-Gaming-MVP.

**Architecture:** Der Quick-Start wird als eigene UI-/Persistence-Schicht neben dem gespeicherten Spielstand geführt. Die Spielregeln bleiben in `GameState`, Reducer und Monats-Simulation; ein gemeinsamer Loss-Resolver setzt Status und Grund deterministisch. Der bestehende Endscreen wird um Status/Grund erweitert, ohne den Spielzustand außerhalb des Reducers zu verändern.

**Tech Stack:** React 18, TypeScript, Vitest, Testing Library, bestehende CSS-Datei und `localStorage`.

**Spec:** `docs/superpowers/specs/2026-09-20-quick-start-scoring.md`

## Global Constraints

- Keine neue Runtime-Abhängigkeit.
- KPI-Werte bleiben Prozentwerte zwischen 0 und 100.
- Quick-Start-Schlüssel bleibt getrennt vom Spielstand-Schlüssel.
- Bestehende Persistenz- und Reset-Tests müssen weiter funktionieren.
- Neue sichtbare Texte bleiben deutsch, freundlich und einfach verständlich.

## Review Focus

- Alter gespeicherter Spielstand mit `running` oder `finished`: muss weiterhin laden.
- Quick-Start nach Refresh, Skip, Abschluss, Sidebar-Reset und Endscreen-Neustart: muss jeweils korrekt sichtbar oder verborgen sein.
- Genau 0 Budget beziehungsweise genau 0 Bürgerzufriedenheit: muss sofort die passende Niederlage auslösen.
- Gleichzeitige Verlustbedingungen: Bankrott muss deterministisch Vorrang haben.
- Prozentwerte unter 10 und Budget unter 1 Mio.: müssen korrekt abrunden und dürfen keine negativen Punkte erzeugen.

### Task 1: Spieltypen, Loss-Resolver und Punktesystem

**Files:**
- Modify: `frontend/src/types/game.ts`
- Modify: `frontend/src/simulation/scoring.ts`
- Create: `frontend/src/game/lossRules.ts`
- Test: `frontend/tests/simulation/scoring.test.ts`
- Test: `frontend/tests/game/lossRules.test.ts`

**Interfaces:**
- Produces `LossReason`, `resolveLossReason(state)`, and a point-based `FinalScore` breakdown.

- [x] Write tests for the exact point formula, new loss reasons, zero-boundary behavior, and bankrupt priority.
- [x] Run the focused tests and verify they fail because the new types/functions do not exist.
- [x] Implement the minimal types, resolver, and point calculation.
- [x] Run the focused tests and the existing scoring tests until green.

### Task 2: Reducer and monthly simulation loss integration

**Files:**
- Modify: `frontend/src/game/reducer.ts`
- Modify: `frontend/src/simulation/monthlySimulation.ts`
- Modify: `frontend/src/game/initialGameState.ts` only if new optional fields require explicit initialization
- Test: `frontend/tests/game/reducer.test.ts`
- Test: `frontend/tests/simulation/monthlySimulation.test.ts`

**Interfaces:**
- Consumes `resolveLossReason` from Task 1.
- Produces `lost` states with `lossReason` and `finalScore` after a loss.

- [x] Add failing tests for asset placement and month advancement crossing each loss boundary.
- [x] Run the focused tests and verify the expected failures.
- [x] Apply the loss resolver after state-changing budget/KPI actions and make loss take precedence over normal month-60 completion.
- [x] Run reducer and simulation tests plus the full unit suite.

### Task 3: Persistence and Quick-Start state

**Files:**
- Modify: `frontend/src/persistence/localStorageStore.ts`
- Create: `frontend/src/persistence/quickStartStore.ts`
- Modify: `frontend/src/app/appState.ts`
- Test: `frontend/tests/persistence/localStorageStore.test.ts`
- Create: `frontend/tests/persistence/quickStartStore.test.ts`

**Interfaces:**
- Produces `hasCompletedQuickStart()`, `completeQuickStart()`, and `clearQuickStart()`.
- `resetGame()` clears both game state and the quick-start completion marker.

- [x] Write failing tests for a separate key, completion, clear, and storage failure fallback.
- [x] Run the persistence tests and verify red.
- [x] Implement the small store and connect reset behavior.
- [x] Run persistence tests and the full unit suite.

### Task 4: Quick-Start UI and Sidebar targets

**Files:**
- Create: `frontend/src/components/QuickStart.tsx`
- Modify: `frontend/src/sidebar/Sidebar.tsx`
- Modify: `frontend/src/app/App.tsx`
- Modify: `frontend/src/app/App.css`
- Create: `frontend/tests/components/QuickStart.test.tsx`
- Modify: `frontend/tests/sidebar/Sidebar.test.tsx`

**Interfaces:**
- QuickStart receives `onComplete` and exposes testable start, skip, next, and finish controls.
- Sidebar groups receive stable `data-onboarding` hooks and the active group gets a highlight class.

- [x] Write failing component tests for welcome buttons, ordered steps, skip, finish, and group highlighting.
- [x] Run the component tests and verify red.
- [x] Implement the modal, loading curtain, simple focus handling, and Cozy styling.
- [x] Connect first-load detection and reset/restart reopening in `App.tsx`.
- [x] Run component and integration tests.

### Task 5: Endscreen, integration coverage and documentation

**Files:**
- Modify: `frontend/src/sidebar/EndScreen.tsx`
- Modify: `frontend/src/app/App.tsx`
- Modify: `frontend/src/app/App.css`
- Modify: `frontend/tests/sidebar/EndScreen.test.tsx`
- Modify: `frontend/tests/app/App.integration.test.tsx`
- Modify: `frontend/tests/e2e/mvp.smoke.spec.ts`

**Interfaces:**
- EndScreen receives `status`, optional `lossReason`, and `finalScore`; `onRestart` starts a new round and reopens Quick Start.

- [x] Add failing tests for normal completion, bankruptcy/voted-out copy, point cards, and restart reopening Quick Start.
- [x] Run focused tests and verify red.
- [x] Implement the endscreen variants and integration wiring.
- [x] Run all unit tests, build, and Playwright smoke tests.
- [x] Inspect the final diff and commit the feature branch.

## Self-review

- Spec coverage: loading/welcome/steps/persistence are covered by Tasks 3–4; losses by Tasks 1–2 and 5; score formula by Tasks 1 and 5; styling and keyboard behavior by Task 4.
- Placeholder scan: no TODO/TBD implementation steps are used.
- Type consistency: `lossReason` is optional on `GameState`; `FinalScore.breakdown` uses `budgetPoints`, `energyAutarkyPoints`, `citizenSatisfactionPoints`, and `supplySecurityPoints` consistently.
- Review focus: every listed boundary and reset path has an owning test task.
