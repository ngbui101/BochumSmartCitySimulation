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
