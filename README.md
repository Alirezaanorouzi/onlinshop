# قائم مقام — onlineshop

Persian RTL clothing shop (Next.js).

## Local development

```bash
npm install
npm run dev
```

With `GITHUB_REPO` in `.env`, the app uses the same base path as GitHub Pages. Open:

**http://localhost:3000/onlinshop/**

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
