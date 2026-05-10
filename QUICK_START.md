# Traveloop — 5 Steps to Live

Everything is pre-configured. You only need to do these 5 things.

---

## Step 1 — Get a free database
Go to **https://neon.tech** → sign up → New Project → copy the **connection string**.  
Looks like: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`

---

## Step 2 — Run local setup
```bash
# Mac/Linux
bash setup.sh

# Windows — run these manually instead:
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.local.example apps\web\.env.local
npm install
npm run db:generate
npm run db:migrate    # type "init" when asked for migration name
npm run db:seed
npm run dev
```
Open http://localhost:3000 → login: `demo@traveloop.ai` / `Traveloop2026!` ✅

---

## Step 3 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/traveloop.git
git push -u origin main
```

---

## Step 4 — Deploy API → Railway (https://railway.app)
1. New Project → Deploy from GitHub → select `traveloop` repo
2. **Settings → Root Directory:** `apps/api`
3. **Variables** — add these:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | your Neon connection string |
| `JWT_SECRET` | any 32+ char random string |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `WEB_ORIGIN` | *(fill after Step 5)* |

4. Railway auto-deploys → wait ~2 min → copy your Railway URL (Settings → Networking → Generate Domain)  
   e.g. `https://traveloop-api-production.up.railway.app`

> ✅ The `railway.json` and `nixpacks.toml` files are already in `apps/api` — Railway picks them up automatically.

---

## Step 5 — Deploy Web → Vercel (https://vercel.com)
1. Sign up with GitHub → New Project → import `traveloop` repo
2. **Root Directory:** `apps/web`
3. **Environment Variables** — add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-url.railway.app/api` |

4. Click **Deploy** → wait ~2 min → copy your Vercel URL  
   e.g. `https://traveloop.vercel.app`

5. Go back to **Railway → Variables** → set `WEB_ORIGIN` = your Vercel URL → redeploy.

---

## Done 🎉
Open your Vercel URL. Login with `demo@traveloop.ai` / `Traveloop2026!`

Future deploys: just `git push` — both Railway and Vercel auto-redeploy.
