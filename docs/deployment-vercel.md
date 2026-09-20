# Vercel Deployment

## Project settings

- Repository: `BochumSmartCitySimulation`
- Production branch: `main`
- Root Directory: `frontend`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`

## Environment variable

Add `CARTO_API_KEY` to the Vercel Production environment. Do not commit `.env` or the key to Git. The key is embedded in the client bundle at build time and must be restricted at CARTO to the deployed domain where possible.

## Release checklist

1. Run `npm ci` and `npm run test:run` in `frontend`.
2. Run `npm run build` in `frontend`.
3. Run `npm run test:e2e` against the production preview.
4. Review the Vercel preview deployment.
5. Confirm the game starts at month 1, survives reload, and reset works.
6. Merge or push the reviewed change to `main`; Vercel deploys `main` as production.

## Rollback

Promote the previous successful Vercel deployment. The `main` branch and Git history remain available; no database migration or server state rollback is required. Browser-local Spielstände werden durch ein Deployment nicht zentral zurückgesetzt.
