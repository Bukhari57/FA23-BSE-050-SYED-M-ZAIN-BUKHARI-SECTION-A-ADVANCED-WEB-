# Deployment Guide

This repository contains a Vite frontend (`/frontend`) and an Express backend (`/backend`). Below are concise instructions and example CLI commands to deploy the frontend to Vercel and the backend to Railway (or similar services).

## Frontend — Vercel
1. Recommended (single Vercel project, monorepo): deploy from repo root so both `api/` serverless functions and the frontend are built together.

   - Vercel will use the repository root `vercel.json` which already contains builds for `api/**/*.js` and the frontend.
   - Build Command: `npm --prefix frontend run build`
   - Output Directory: `frontend/dist`

2. Or (alternate) deploy frontend-only: set Project Root to `frontend`, Build Command `npm run build`, Output `dist`.

3. Ensure production API base URL is `/api` (client calls relative paths). We set this in `vercel.json` and `frontend/.env.production`.

4. Required Vercel environment variables (add in Dashboard → Settings → Environment Variables or via CLI):

   - `VITE_SUPABASE_URL` = your Supabase Project URL (e.g. `https://xyz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon/public key
   - (Optional) `VITE_API_URL` = `/api` — already set in `vercel.json` and `frontend/.env.production`

   Example using Vercel CLI from repo root:

   ```bash
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   vercel env add VITE_API_URL production
   ```

5. Deploy (from repo root for monorepo):

   ```bash
   # install deps and build locally (optional)
   npm ci
   npm --prefix frontend run build

   # deploy to Vercel (interactive the first time)
   vercel --prod
   ```

Notes:

- Security: Do NOT put Supabase `service_role` key in frontend env vars. Only use the anon/public key for client access.
- Our `api/[...path].js` forwards requests to the Express `backend/app.js`, so client requests to `/api/*` will be handled by the serverless function and routed through the existing Express routes.

## Backend — Railway (recommended) / Render / Heroku

Railway (example):

1. Create a Railway project and connect your GitHub repo. Set the project root to `backend`.
2. Set environment variables (Project → Variables):

   - `SUPABASE_URL` = your Supabase Project URL
   - `SUPABASE_KEY` = your Supabase **service_role** key (keep secret)
   - `JWT_SECRET` = a secure secret used to sign JWTs

   Example Railway CLI (if using Railway CLI):

   ```bash
   # link to an existing Railway project or init
   railway init
   # set variables (values should be replaced with real secrets)
   railway variables set SUPABASE_URL "https://xyz.supabase.co"
   railway variables set SUPABASE_KEY "<your_service_role_key>"
   railway variables set JWT_SECRET "<random_jwt_secret>"
   ```

3. Start command: `npm start` (the repo includes `backend/Procfile` with `web: npm start`). Railway/Render will run `npm start` by default.

4. After deployment, confirm the backend is reachable and test authentication endpoints (`/api/auth/signup`, `/api/auth/login`).

## Alternative: Deploy backend as serverless on Vercel

This requires refactoring the Express app into serverless functions under `api/` (not covered here). Use this only if you prefer an all-Vercel deployment.

## Useful tips

- Keep `backend/.env` out of version control. Add `backend/.env` to `.gitignore` (already present in many setups).
- Use the Supabase Dashboard → Table Editor to inspect tables and rows after seeding or registering users.
