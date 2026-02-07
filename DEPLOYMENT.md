# Deploying AEM Residence (and 3 sites on one Hostinger server)

## Can I run 3 different sites on one Hostinger Node.js server?

**Yes.** You do **not** need the same tech stack for all three:

1. **This app (AEM Operations)** – Node.js API + React frontend → one Node.js app (API serves the built React app).
2. **Landing page (Astro)** – Build to static HTML/JS/CSS → upload to a folder; no Node needed.
3. **3D website** – If it’s static (e.g. Three.js in HTML/JS), same as Astro: just static files in a folder.

Hostinger typically lets you:
- Run **one Node.js application** (your API + this app’s frontend).
- Serve **multiple static sites** (Astro, 3D) from different domains or folders (e.g. `public_html`, subdomains).

So: **one server, three sites, different tech stacks is fine.** Use the Node.js slot for this app; use static hosting (or Nginx) for the Astro and 3D sites.

---

## Deploying this app (AEM Operations) on Hostinger Node.js

This repo is a **monorepo**: API (Express) + web (Vite/React). For production we run **one Node process** that:

- Serves the **API** at `/auth`, `/orders`, `/products`, etc.
- Serves the **built React app** as static files and SPA fallback (so one URL, one deployment).

### 1. Build for production

From the **repo root**:

```bash
npm ci
npm run build:deploy
```

- `build:deploy` runs `npm run build` (shared + api + web) then copies `apps/web/dist` → `apps/api/public`.
- The API serves `apps/api/public` in production when that folder exists.

### 2. Where data and PDFs are stored

- **All app data** (users, orders, products, suppliers, reconciliations, etc.) is stored in the **database**. On Hostinger you typically use **Hostinger’s MySQL**: create a database in the panel, get the connection URL, set it as `DATABASE_URL`, and run migrations (see below). The app will then use Hostinger’s DB for everything.
- **PDFs are not stored.** When someone views or downloads an order PDF, the server **generates it on the fly** from the order data in the database. So no separate “PDF storage”—just the same DB that holds the orders.

### 3. Environment variables (Hostinger Node.js panel)

Set these for the Node.js app (e.g. in the app’s “Environment” or “.env”):

- `NODE_ENV=production`
- `PORT=4000` (or the port Hostinger assigns)
- `DATABASE_URL=...` — **Use Hostinger’s MySQL** (e.g. `mysql://user:pass@host/dbname`) so all data (orders, users, etc.) is stored on Hostinger’s DB. For local dev you can keep SQLite (`file:./prisma/dev.db`).
- `SESSION_SECRET=<long random string>`
- `CORS_ORIGIN=https://your-app-domain.com` (or leave unset if the frontend is on the same origin)

For **same-origin** (recommended): point your domain to this Node app and **do not** set `VITE_API_BASE` when building (or set it to `''`). The React app will call the API on the same host.

If the frontend is on a different domain: set `CORS_ORIGIN` to that domain and build the web app with `VITE_API_BASE=https://api.your-domain.com` (or whatever your API URL is).

### 4. Start command (Hostinger)

Use the **Application Root** that contains this repo (e.g. the folder where `package.json` and `apps/api` live). Then:

- **Start command:** `npm run start`  
  (runs the API; in production the API also serves the React app from `apps/api/public`.)

If Hostinger expects the process to live in a subfolder:

- **Application Root:** `apps/api`
- **Start command:** `node dist/index.js`  
  (and run `npm run build:deploy` from the **repo root** so `apps/api/public` exists.)

### 5. Database (first deploy)

**Using Hostinger MySQL (recommended):**

1. In Hostinger, create a MySQL database and user; copy the connection URL.
2. In `apps/api/prisma/schema.prisma` set `provider = "mysql"` (instead of `"sqlite"`) and keep `url = env("DATABASE_URL")`.
3. Set `DATABASE_URL` in the Node.js app to that MySQL URL.
4. Apply the schema to the empty DB: from repo root run `npx prisma db push` (or create a MySQL migration and run `npm run db:migrate`). Then optionally `npm run db:seed`.

**Using SQLite on the server:**

- Set `DATABASE_URL=file:./prisma/dev.db` and ensure `apps/api/prisma` is writable. Then run `npm run db:migrate` and optionally `npm run db:seed`.

---

## Summary: 3 sites on one server

| Site              | Tech        | On Hostinger                          |
|-------------------|------------|---------------------------------------|
| AEM Operations    | Node + React | Node.js app (this repo); API + frontend from one process. |
| Landing (Astro)   | Astro      | Build (`astro build`), upload `dist/` to a static folder or separate domain. |
| 3D website        | Static/Three.js | Upload built files to another folder or subdomain. |

You do **not** need the same tech stack; only this app needs the Node.js runtime. The other two can be plain static hosting.
