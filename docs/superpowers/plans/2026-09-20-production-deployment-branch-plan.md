# Production Deployment Branch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the development-only state harness from the app and prepare the `production` branch for a Vercel static deployment without changing gameplay behavior.

**Architecture:** `App` will use `useAppState()` as its only runtime state source. The mock-state selector, its source fixtures, and its CSS will be removed; production remains a client-only Vite bundle using browser `localStorage`. Vercel will build from `frontend` with npm and serve `frontend/dist`.

**Tech Stack:** React 18, TypeScript, Vite 5, Vitest, Playwright, npm, Vercel static hosting.

**Spec:** `docs/superpowers/specs/2026-09-20-production-deployment-branch-design.md`

## Global Constraints

- The public application exposes only the real game flow.
- `localStorage` remains the persistence layer; no backend, database, login, or shared multiplayer state is added.
- `npm run dev`, Vitest, Playwright, real gameplay drag preview, persistence messaging, reset confirmation, and end-screen restart remain available.
- Remove `DevStateMode`, mock-state runtime integration, the `Dev State-Modus` selector, `.dev-mock-harness` CSS, and source mock-state fixtures that no longer have consumers.
- Vercel project settings use `frontend` as root, `npm ci` as install command, `npm run build` as build command, `dist` as output directory, and `CARTO_API_KEY` as an environment variable.
- Do not stage or modify unrelated changes in the original `main` checkout.
- Do not push, merge, or configure an external Vercel project in this implementation task.

## Review Focus

- The real state must remain the only runtime state source after the harness is removed; the App integration test must assert that the dev harness is absent.
- Reset and end-screen restart must still clear/recreate persisted state; the existing integration and browser smoke coverage must remain passing.
- Production preview must not contain the removed selector or mock-state labels; the E2E smoke test must check absence without relying on a missing-element visibility assertion.
- The source mock fixture and its dedicated test must be deleted only after all runtime imports are removed; a repository search must confirm no production import remains.
- The Vercel/npm contract must work from a clean install; `npm run test:e2e` must not depend on pnpm or untracked workspace files.

### Task 1: Pin the production absence behavior in tests

**Files:**
- Modify: `frontend/tests/app/App.integration.test.tsx`
- Modify: `frontend/tests/e2e/mvp.smoke.spec.ts`

**Interfaces:**
- Consumes: Existing `App` runtime and Playwright production preview.
- Produces: Tests that define the production branch contract before implementation.

- [ ] **Step 1: Replace the integration test for the development selector with an absence assertion**

Replace the test named `shows a dev-only state mode selector with Real-State as the default` with:

```tsx
it('does not render the development state harness', () => {
  render(<App />);

  expect(screen.queryByTestId('dev-mock-harness')).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/Dev State-Modus/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused integration test and verify it fails for the current implementation**

Run from `frontend`:

```bash
npm exec vitest run tests/app/App.integration.test.tsx -t "does not render the development state harness"
```

Expected: FAIL because the current development build still renders `dev-mock-harness`.

- [ ] **Step 3: Change the E2E assertion to check that the harness has zero elements**

In `frontend/tests/e2e/mvp.smoke.spec.ts`, replace:

```ts
await expect(page.getByTestId('dev-mock-harness')).not.toBeVisible();
```

with:

```ts
await expect(page.getByTestId('dev-mock-harness')).toHaveCount(0);
```

- [ ] **Step 4: Commit the test contract**

```bash
git add frontend/tests/app/App.integration.test.tsx frontend/tests/e2e/mvp.smoke.spec.ts
git commit -m "test: require production app without dev harness"
```

### Task 2: Remove mock-state runtime integration

**Files:**
- Modify: `frontend/src/app/App.tsx`
- Delete: `frontend/src/testing/mockGameState.ts`
- Delete: `frontend/tests/testing/mockGameState.test.ts`

**Interfaces:**
- Consumes: `useAppState()` and existing real `GameAction` dispatch behavior.
- Produces: `App` with one runtime `GameState` source and unchanged real gameplay handlers.

- [ ] **Step 1: Remove mock-only imports and declarations from `App.tsx`**

Delete the import of `initialMockState`, `midgameMockState`, and `finishMockState`. Remove the `DevStateMode` type, `mockStates` record, and `isMockStateMode` helper. Keep the `GameState` type because it is still used by `getKpiDeltas` and the real app state.

- [ ] **Step 2: Simplify App state initialization to real state only**

Remove `gameReducer` from the imports, remove `GameAction` from the type import if no other usage remains, and delete these state values and handlers:

```tsx
const [devStateMode, setDevStateMode] = useState<DevStateMode>('real');
const [mockState, setMockState] = useState<GameState>(initialMockState);
const isRealStateMode = devStateMode === 'real';
const handleMockStateChange = (...);
```

Set:

```tsx
const state = realState;
```

Change `dispatchToActiveState` to dispatch directly through `realDispatch`, preserving its existing `GameAction` parameter if that type remains used by the handler signature.

- [ ] **Step 3: Preserve real restart behavior without mock reset logic**

In `handleRestart`, keep the feedback, drag, selection, and `resetVersion` cleanup. Replace the conditional real/mock branch with the direct call:

```tsx
resetGame();
```

Do not change the public reset confirmation flow.

- [ ] **Step 4: Remove the development selector JSX**

Delete the `import.meta.env.DEV` block containing `data-testid="dev-mock-harness"`, the `Dev State-Modus` label, and the select options. Keep the placement drag preview and all gameplay overlays.

- [ ] **Step 5: Delete source fixtures that no longer have consumers**

Delete `frontend/src/testing/mockGameState.ts` and `frontend/tests/testing/mockGameState.test.ts`. Do not delete test-local mocks used by other component tests.

- [ ] **Step 6: Run the focused tests and verify the production absence contract passes**

Run from `frontend`:

```bash
npm exec vitest run tests/app/App.integration.test.tsx tests/app/AppErrorBoundary.test.tsx
```

Expected: PASS, including the new absence assertion and existing real-game interactions.

- [ ] **Step 7: Commit the runtime cleanup**

```bash
git add frontend/src/app/App.tsx frontend/src/testing/mockGameState.ts frontend/tests/testing/mockGameState.test.ts
git commit -m "chore: remove development state harness"
```

### Task 3: Remove harness-only styling and normalize npm E2E execution

**Files:**
- Modify: `frontend/src/app/App.css`
- Modify: `frontend/package.json`

**Interfaces:**
- Consumes: Existing production stylesheet and Playwright configuration.
- Produces: No unused dev-harness CSS and a clean-install E2E command that uses npm.

- [ ] **Step 1: Delete the `.dev-mock-harness` CSS block**

Remove the `.dev-mock-harness`, `.dev-mock-harness:hover`, `.dev-mock-harness:focus-within`, and `.dev-mock-harness select` rules from `frontend/src/app/App.css`. Keep all unrelated map, overlay, drag-preview, reset-modal, and responsive rules.

- [ ] **Step 2: Make the E2E script package-manager independent**

In `frontend/package.json`, change:

```json
"test:e2e": "pnpm.cmd build && playwright test"
```

to:

```json
"test:e2e": "npm run build && playwright test"
```

Do not remove the `dev`, `build`, `preview`, `test`, or `test:run` scripts.

- [ ] **Step 3: Verify no development harness references remain in shipped source**

Run from the repository root:

```bash
rg -n "DevStateMode|Dev State-Modus|dev-mock-harness|mockStates|initialMockState|midgameMockState|finishMockState|import\.meta\.env\.DEV" frontend/src frontend/tests
```

Expected: no matches. Test-local `vi.mock(...)` matches are unrelated and must remain.

- [ ] **Step 4: Commit the styling and npm command cleanup**

```bash
git add frontend/src/app/App.css frontend/package.json
git commit -m "chore: prepare production npm workflow"
```

### Task 4: Document the Vercel production deployment contract

**Files:**
- Create: `docs/deployment-vercel.md`

**Interfaces:**
- Consumes: The production branch build contract and existing `.env`/CARTO documentation.
- Produces: Repeatable dashboard settings and a rollback-safe deployment checklist.

- [ ] **Step 1: Add the deployment guide**

Create `docs/deployment-vercel.md` with these exact instructions:

```markdown
# Vercel Deployment

## Project settings

- Repository: `BochumSmartCitySimulation`
- Production branch: `production`
- Root Directory: `frontend`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`

## Environment variable

Add `CARTO_API_KEY` to the Vercel Production environment. Do not commit `.env` or the key to Git. The key is embedded in the client bundle at build time and must be restricted at CARTO to the deployed domain where possible.

## Release checklist

1. Run `npm ci` and `npm run test:run` in `frontend`.
2. Run `npm run build` in `frontend`.
3. Review the Vercel preview deployment.
4. Confirm the game starts at month 1, survives reload, and reset works.
5. Promote the reviewed deployment to production.

## Rollback

Promote the previous successful Vercel deployment. The `production` branch and Git history remain available; no database migration or server state rollback is required.
```

- [ ] **Step 2: Commit the deployment guide**

```bash
git add docs/deployment-vercel.md
git commit -m "docs: add Vercel production deployment guide"
```

### Task 5: Run clean-install verification and review the branch

**Files:**
- Verify: `frontend/package-lock.json`, production source, tests, and docs

**Interfaces:**
- Consumes: All implementation commits from Tasks 1–4.
- Produces: Evidence that `production` is deployable and does not contain the dev harness.

- [ ] **Step 1: Install from the tracked npm lockfile**

Run from `frontend`:

```bash
npm ci
```

Expected: install completes using `package-lock.json` without requiring pnpm workspace files.

- [ ] **Step 2: Run unit and integration tests**

Run:

```bash
npm run test:run
```

Expected: all tests pass and no deleted mock-state test is collected.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: TypeScript emits no errors and Vite creates `frontend/dist`.

- [ ] **Step 4: Run the browser smoke test**

Run:

```bash
npm run test:e2e
```

Expected: the smoke test passes with no `dev-mock-harness`, reload persistence intact, reset working, and end-screen restart working.

- [ ] **Step 5: Inspect the production preview manually**

Run:

```bash
npm run preview -- --host 127.0.0.1 --port 4174
```

Open the preview and confirm the public UI contains no Dev State selector or mock-state label. Stop the preview after checking it.

- [ ] **Step 6: Review branch scope and status**

Run:

```bash
git diff main...production --stat
git status --short --branch
git log --oneline --decorate -5
```

Expected: only the production spec, planned cleanup, deployment documentation, and related tests/configuration are present on `production`; the original `main` checkout's unrelated uncommitted files remain untouched.

- [ ] **Step 7: Commit any final verification-only corrections**

Only if verification identifies a required correction, commit it with a focused message. Do not push or merge automatically.
