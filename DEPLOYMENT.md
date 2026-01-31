# Deploying ChibiBadminton to Vercel (Frontend + Backend Separately)

Your frontend is already live at **https://badmintonwebsite.vercel.app/**. This guide shows how to keep frontend and backend as **two separate Vercel projects** and wire them together.

---

## Overview

| Project   | Vercel project      | URL (example)                    | Repo / root      |
|----------|---------------------|-----------------------------------|------------------|
| Frontend | e.g. `chibibadminton` | https://badmintonwebsite.vercel.app | Same repo, root = `frontend` |
| Backend  | e.g. `chibibadminton-api` | https://chibibadminton-api.vercel.app | Same repo, root = `backend`  |

The frontend calls the backend using `VITE_API_URL` (your backend URL).

---

## 1. Deploy Frontend (already done)

Your frontend is at **https://badmintonwebsite.vercel.app/**.

### Option A: One repo, root = `frontend` (recommended for “frontend only”)

1. In [Vercel Dashboard](https://vercel.com/dashboard) → your project → **Settings** → **General**.
2. Set **Root Directory** to `frontend`.
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### Option B: Keep using repo root (current style)

If the project is set up with root at repo root and `vercel.json` points to `frontend/dist`, you can keep that. Ensure **Root Directory** is empty and the build outputs to `frontend/dist`.

### Frontend environment variables (Vercel)

In **Settings** → **Environment Variables**, add:

| Name               | Value                                      | Environments   |
|--------------------|--------------------------------------------|----------------|
| `VITE_API_URL`     | Your backend URL (see step 2), e.g. `https://chibibadminton-api.vercel.app` | Production, Preview |
| `VITE_EMAILJS_SERVICE_ID` | (your EmailJS value)                 | As needed      |
| `VITE_EMAILJS_TEMPLATE_ID` | (your EmailJS value)              | As needed      |
| `VITE_EMAILJS_PUBLIC_KEY` | (your EmailJS value)               | As needed      |
| `VITE_EMAIL_TO`    | (your email)                                | As needed      |

Redeploy after changing env vars so the build picks up `VITE_API_URL`.

---

## 2. Deploy Backend (separate Vercel project)

### 2.1 Create a new Vercel project for the API

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New** → **Project**.
2. Import the **same Git repository** as the frontend.
3. Configure the project:
   - **Project Name:** e.g. `chibibadminton-api`
   - **Root Directory:** click **Edit** and set to **`backend`**.
   - **Framework Preset:** Other (or leave default).
   - **Build Command:** `npm run build` (runs `tsc` and produces `dist/`).
   - **Output Directory:** Leave **empty** or leave the default. The repo’s `backend/vercel.json` sets `outputDirectory` to `.` so the backend builds without needing a static output. If the dashboard forces a value, enter a single dot **`.`**.
   - **Install Command:** `npm install`

4. Click **Deploy**. Vercel will use `backend/vercel.json` and `backend/api/index.js` to expose the Express app as a serverless function.

### 2.2 Backend environment variables (Vercel)

In the **backend project** → **Settings** → **Environment Variables**, add the same variables you use locally (from `backend/.env`), for example:

| Name          | Value                    | Environments   |
|---------------|--------------------------|----------------|
| `DB_HOST`     | Your MySQL host          | Production     |
| `DB_PORT`     | `3306`                   | Production     |
| `DB_USER`     | Your MySQL user          | Production     |
| `DB_PASSWORD` | Your MySQL password      | Production     |
| `DB_NAME`     | `chibibadminton_db`      | Production     |
| `JWT_SECRET`  | Strong random secret     | Production     |
| `FRONTEND_URL`| `https://badmintonwebsite.vercel.app` | Production |

Do **not** commit `.env`; use Vercel’s UI (or CLI) only.

### 2.3 Get the backend URL

After the first deploy, the backend URL will look like:

- **https://chibibadminton-api.vercel.app**  
  (or whatever project name you chose)

Use this as `VITE_API_URL` in the **frontend** project (step 1).

### 2.4 CORS

The backend already allows the frontend origin via `FRONTEND_URL`. Set `FRONTEND_URL` to `https://badmintonwebsite.vercel.app` in the backend project’s env vars so CORS works.

---

## 3. Wire frontend to backend

1. In the **frontend** Vercel project, set:
   - `VITE_API_URL` = your backend URL (e.g. `https://chibibadminton-api.vercel.app`)
2. Redeploy the frontend so the new value is baked into the build.

The app at https://badmintonwebsite.vercel.app/ will then call your Vercel backend API.

---

## 4. Database (MySQL) in production

The backend uses MySQL (e.g. `backend/src/db/connection.ts`). On Vercel you cannot run MySQL on the same host; use a hosted DB, for example:

- [PlanetScale](https://planetscale.com/) (MySQL-compatible)
- [Railway](https://railway.app/) (MySQL)
- [Aiven](https://aiven.io/) or any cloud MySQL

Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in the backend Vercel project to point to that database. Run your schema (e.g. `backend/database/schema/schema.sql`) and seed (e.g. `npm run seed` in backend) against the production DB from your local machine or a one-off script, not from Vercel.

---

## 5. Summary checklist

**Frontend (badmintonwebsite.vercel.app):**

- [ ] Root Directory = `frontend` (or current setup that builds frontend)
- [ ] `VITE_API_URL` = backend URL (e.g. `https://chibibadminton-api.vercel.app`)
- [ ] Other `VITE_*` and EmailJS vars set as needed
- [ ] Redeploy after env changes

**Backend (separate project):**

- [ ] Root Directory = `backend`
- [ ] Build Command = `npm run build`
- [ ] Env vars: `DB_*`, `JWT_SECRET`, `FRONTEND_URL` (and any others from `backend/.env`)
- [ ] Production MySQL created and schema/seed applied
- [ ] Copy backend URL into frontend’s `VITE_API_URL`

---

## Repo layout used by this guide

```
chibibadminton/
├── frontend/           # Frontend Vercel project (root = frontend)
│   ├── src/
│   ├── dist/           # Build output
│   ├── vercel.json
│   └── package.json
├── backend/            # Backend Vercel project (root = backend)
│   ├── api/
│   │   └── index.js    # Vercel serverless entry
│   ├── src/
│   ├── dist/           # Build output (from tsc)
│   ├── vercel.json     # Rewrites all traffic to /api
│   └── package.json
└── DEPLOYMENT.md       # This file
```

The backend’s `api/index.js` imports the built Express app from `dist/server.js` and forwards every request to it; `backend/vercel.json` sends all routes to that handler.
