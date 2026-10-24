# قائم مقام — onlineshop

Persian RTL clothing shop (Next.js).

## Local development

```bash
npm install
npm run dev
```

For GitHub Pages locally, set `GITHUB_PAGES=true` and `GITHUB_REPO` (see below). Open:

**http://localhost:3000/onlinshop/**

Liara / normal production: **no** `GITHUB_PAGES` — use `http://localhost:3000/`.

## GitHub Pages

**Live URL (after deploy):**  
https://alirezaanorouzi.github.io/onlinshop/

### One-time GitHub settings (important)

If you only see the README on the site, Pages is pointing at **`main`** instead of the built files. Fix it once:

1. Push code to **`main`** (workflow builds the shop into the **`gh-pages`** branch).
2. Repo **Settings → Pages → Build and deployment**
   - **Source:** Deploy from a branch
   - **Branch:** `gh-pages` → `/ (root)` → **Save**
3. Wait for the **Deploy GitHub Pages** action to finish (tab **Actions**).
4. Open **https://alirezaanorouzi.github.io/onlinshop/** (not the repo README page).

### Deploy

Every push to `main` runs `.github/workflows/deploy-pages.yml` and publishes the static `out/` folder.

Local test of the Pages build:

```powershell
$env:GITHUB_PAGES="true"
$env:GITHUB_REPO="https://github.com/Alirezaanorouzi/onlinshop.git"
npm run build
```

Copy `.env.example` to `.env` and set `GITHUB_REPO` (no space after `=`).
