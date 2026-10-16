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

### One-time GitHub settings

1. Push this project to `https://github.com/Alirezaanorouzi/onlinshop` on branch **`main`**.
2. Repo **Settings → Pages → Build and deployment**
   - **Source:** GitHub Actions
3. After the workflow runs, the site URL appears on the Pages settings page.

### Deploy

Every push to `main` runs `.github/workflows/deploy-pages.yml` and publishes the static `out/` folder.

Local test of the Pages build:

```powershell
$env:GITHUB_PAGES="true"
$env:GITHUB_REPO="https://github.com/Alirezaanorouzi/onlinshop.git"
npm run build
```

Copy `.env.example` to `.env` and set `GITHUB_REPO` (no space after `=`).
