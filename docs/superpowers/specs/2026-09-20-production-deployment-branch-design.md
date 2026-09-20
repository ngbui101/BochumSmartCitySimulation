# Production Deployment Branch Design

**Date:** 2026-09-20
**Branch:** `production`
**Status:** Approved conversational design; implementation pending plan review

## Goal

Create a deployable `production` branch for the Bochum Smart City Simulation. The public application must expose only the real game flow, preserve the browser-local game state across reloads, and remain deployable as a static Vite app on Vercel.

## User-approved scope

- Remove the in-app development state switcher and its mock-state runtime integration.
- Remove source mock states that exist only to power that runtime switcher.
- Keep the actual game, browser persistence, reset flow, end screen, and drag-and-drop placement behavior unchanged.
- Keep local development, unit tests, and Playwright tooling available for maintainers.
- Use the `production` Git branch as the Vercel deployment branch.

## Production runtime

The production bundle is a client-only React application built by Vite.

- The browser is the only game runtime.
- `localStorage` remains the persistence layer.
- A reload restores the state belonging to that browser.
- Reset clears and recreates the local game state.
- No login, API server, database, or shared multiplayer state is introduced.
- The CARTO key is a client build variable and must be configured in Vercel for the production environment. It is not treated as a server secret.

## Development code to remove from the shipped app

The following app-runtime elements are development-only and must be removed:

- `DevStateMode` and its state-selection helpers in `frontend/src/app/App.tsx`.
- Mock-state imports, mock-state storage, and mock-state dispatch branching in `App.tsx`.
- The `Dev State-Modus` selector rendered behind `import.meta.env.DEV`.
- CSS rules used only by `.dev-mock-harness`.
- `frontend/src/testing/mockGameState.ts` and its dedicated test, because no production or test runtime consumer remains after the harness is removed.
- App integration assertions that specifically verify the removed harness.

The following are explicitly not development-only and must remain:

- `npm run dev`, Vitest, and Playwright scripts.
- Test doubles and `vi.mock(...)` declarations inside test files.
- The placement drag preview, because it is part of the real player interaction.
- Error handling, persistence status messaging, reset confirmation, and end-screen restart behavior.

## Vercel deployment contract

Vercel is configured with the `frontend` directory as the project root:

```text
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
Environment Variable: CARTO_API_KEY
```

The build must succeed without a committed `.env` file. The production CARTO key is supplied by the Vercel project environment. If the key is absent, the existing map fallback remains usable.

## Verification requirements

The production branch is acceptable only when all of the following hold:

1. TypeScript compilation and Vite production build pass.
2. Unit and integration tests pass after removing harness-specific tests.
3. The browser smoke test confirms that the dev harness is absent.
4. The browser smoke test confirms month progression survives reload.
5. The browser smoke test confirms reset confirmation, reset persistence, end screen, and restart behavior.
6. A production preview serves the app without any Dev State selector or mock-state label.
7. Git status is clean except for the intended production commits; unrelated changes in the original `main` checkout are not staged or modified.

## Non-goals

- No backend or database implementation.
- No user accounts or cross-device synchronization.
- No deletion of the local development command or test infrastructure.
- No changes to game rules, map styling, visible district labels, or gameplay balancing.
- No automatic Vercel deployment or GitHub push in this task.

## Rollback and branch safety

The existing `main` branch remains unchanged by the production cleanup until the branch is reviewed and explicitly merged. The branch must be implemented in an isolated worktree so unrelated uncommitted files in the main checkout are preserved.
