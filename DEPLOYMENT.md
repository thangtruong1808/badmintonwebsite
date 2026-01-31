# Deploy ChibiBadminton to Vercel (From Scratch)

This guide deploys the **frontend** and **backend** as **two separate Vercel projects** from the same Git repo. No prior Vercel setup assumed.

---

## What you get

| App      | Vercel project name (you choose) | Example URL                          |
|----------|-----------------------------------|--------------------------------------|
| Frontend | e.g. `badmintonwebsite`           | `https://badmintonwebsite.vercel.app` |
| Backend  | e.g. `chibibadminton-api`         | `https://chibibadminton-api.vercel.app` |

The frontend calls the backend using the backend URL. You deploy frontend first, then backend, then connect them.

---

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- Code in a **Git repository** (GitHub, GitLab, or Bitbucket) — Vercel deploys from Git
- (For backend) A **hosted MySQL** database (e.g. [PlanetScale](https://planetscale.com/), [Railway](https://railway.app/)) — Vercel does not run MySQL

---

# Step 1: Push your code to Git

1. Create a repo on GitHub (or GitLab / Bitbucket) if you haven’t already.
2. From your project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. Replace `YOUR_USERNAME` and `YOUR_REPO` with your repo URL.

---

# Step 2: Deploy the frontend

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New…** → **Project**.
3. **Import** your Git repository (e.g. the `chibibadminton` repo).
4. Before deploying, set these for the **frontend** project:

   | Field             | Value              |
   |-------------------|--------------------|
   | **Project Name**  | e.g. `badmintonwebsite` |
   | **Root Directory** | Click **Edit**, then enter: `frontend` |
   | **Framework Preset** | Vite (or leave default) |
   | **Build Command**   | `npm run build`    |
   | **Output Directory** | `dist`           |
   | **Install Command**  | `npm install`     |

5. **Environment variables** (optional now, required after backend is live):
   - Click **Environment Variables**.
   - Add:
     - **Name:** `VITE_API_URL`  
       **Value:** leave empty for now; after Step 3 you’ll set this to your backend URL (e.g. `https://chibibadminton-api.vercel.app`).
   - Add any others your app needs (e.g. `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`, `VITE_EMAIL_TO`).

6. Click **Deploy**.
7. Wait for the build to finish. Your frontend URL will be like:
   - **https://badmintonwebsite.vercel.app**
   - (Replace with your actual project name.)

---

# Step 3: Deploy the backend

1. In Vercel, click **Add New…** → **Project** again.
2. **Import the same Git repository** (same repo as the frontend).
3. Before deploying, set these for the **backend** project:

   | Field             | Value              |
   |-------------------|--------------------|
   | **Project Name**  | e.g. `chibibadminton-api` |
   | **Root Directory** | Click **Edit**, then enter: `backend` |
   | **Framework Preset** | Other             |
   | **Build Command**   | `npm run build`    |
   | **Output Directory** | Leave **empty** or enter a single dot: `.` |
   | **Install Command**  | `npm install`     |

4. **Environment variables** (required for API and DB):
   - Click **Environment Variables**.
   - Add every variable your backend uses locally (from `backend/.env`). At minimum:

   | Name           | Value (example)                          | Environments |
   |----------------|------------------------------------------|--------------|
   | `DB_HOST`      | Your MySQL host (e.g. from PlanetScale)   | Production   |
   | `DB_PORT`      | `3306`                                   | Production   |
   | `DB_USER`      | Your MySQL user                           | Production   |
   | `DB_PASSWORD`  | Your MySQL password                       | Production   |
   | `DB_NAME`      | `chibibadminton_db`                       | Production   |
   | `JWT_SECRET`   | A long random string (e.g. 32+ chars)    | Production   |
   | `FRONTEND_URL` | `https://badmintonwebsite.vercel.app`    | Production   |

   Use your **real** frontend URL from Step 2. Do **not** commit `.env`; set these only in Vercel.

5. Click **Deploy**.
6. Wait for the build. Your backend URL will be like:
   - **https://chibibadminton-api.vercel.app**
   - Copy this URL — you need it for the frontend.

---

# Step 4: Connect frontend to backend

1. In Vercel, open the **frontend** project (e.g. `badmintonwebsite`).
2. Go to **Settings** → **Environment Variables**.
3. Add or edit:
   - **Name:** `VITE_API_URL`
   - **Value:** your backend URL **with no trailing slash**, e.g. `https://chibibadminton-api.vercel.app`
   - **Environments:** Production (and Preview if you use preview deployments).
4. Save.
5. Go to **Deployments** → open the **⋯** menu on the latest deployment → **Redeploy**.
   - Redeploy is required so the new `VITE_API_URL` is baked into the build.

After the redeploy, the site at **https://badmintonwebsite.vercel.app** will call your backend at **https://chibibadminton-api.vercel.app**.

---

# Step 5: Production database (MySQL)

The backend expects a MySQL database. Vercel does not run MySQL; use a hosted provider.

1. **Create a MySQL database** (e.g. PlanetScale, Railway, Aiven).
2. **Create the database** (e.g. `chibibadminton_db`).
3. **Run your schema** once from your machine:
   ```bash
   cd backend
   # Use the production DB host/user/password from your provider
   mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_NAME < database/schema/schema.sql
   ```
4. **Seed an admin user** (optional):
   ```bash
   cd backend
   # Set DB_* and SEED_ADMIN_* in .env to point to production, then:
   npm run seed
   ```
5. The **backend** Vercel project already has `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` from Step 3; ensure they match this production database.

---

# Quick reference

## Frontend project (Vercel)

- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Env vars:** `VITE_API_URL` = backend URL; add other `VITE_*` / EmailJS as needed.
- **Redeploy** after changing any `VITE_*` variable.

## Backend project (Vercel)

- **Root Directory:** `backend`
- **Build Command:** `npm run build`
- **Output Directory:** empty or `.`
- **Env vars:** `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `FRONTEND_URL` (and any others from `backend/.env`).

## Repo layout (for reference)

```
chibibadminton/
├── frontend/              ← Frontend project root
│   ├── src/
│   ├── dist/              ← Build output
│   ├── vercel.json
│   └── package.json
├── backend/               ← Backend project root
│   ├── src/
│   ├── dist/              ← Build output (from tsc)
│   ├── vercel.json
│   └── package.json
└── DEPLOYMENT.md
```

---

# Troubleshooting

- **Frontend shows “Could not reach server”**  
  Set `VITE_API_URL` in the frontend project to your backend URL (no trailing slash) and **redeploy** the frontend.

- **Backend returns CORS errors**  
  In the backend project, set `FRONTEND_URL` to your frontend URL (e.g. `https://badmintonwebsite.vercel.app`).

- **Backend returns 404 or build finishes in &lt;1s**  
  Do **not** put `builds` or `routes` in `backend/vercel.json` — otherwise Vercel ignores the Project Build Command and `npm run build` never runs, so `dist/` is never created. Keep only `"buildCommand": "npm run build"` in vercel.json. Set **Build Command** to `npm run build` in Project Settings. Redeploy; the build should take several seconds (TypeScript compile). Root URL should then return `{ "status": "ok", "message": "ChibiBadminton API" }`.

- **Backend: “Cannot read properties of undefined (reading 'fsPath')”**  
  In the backend project **Settings → General**, leave **Output Directory** empty. Ensure **Root Directory** is exactly `backend`. Redeploy. The API is served via `dist/server.js` (builds + routes in vercel.json).

- **Backend build fails**  
  Ensure **Root Directory** is `backend` and **Build Command** is `npm run build`. Check the build log for TypeScript or missing dependency errors.

- **Backend “Access denied” for MySQL**  
  Check `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in the backend project’s env vars and that your hosted MySQL allows connections from Vercel’s IPs (or use “allow from anywhere” for development).
