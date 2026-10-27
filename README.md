# قائم مقام — onlineshop

Persian RTL clothing shop (Next.js). Production runs on **Liara** with SQLite catalog, OTP login, and Zarinpal.

## Local development

```bash
npm install
cp .env.example .env.local   # then edit secrets
npm run dev
```

Open **http://localhost:3000/**

For Liara deploy and env vars, see [docs/DEPLOY-LIARA.md](docs/DEPLOY-LIARA.md).

## Useful commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Production build |
| `npm run start` | Migrate DB + `next start` |
| `npm run db:migrate` | Run SQLite migrations |
| `npm run db:seed` | Seed catalog into SQLite |
| `npm run db:seed-admin` | Sync admin user from `ADMIN_PHONE` |
| `npm run storage:up` | Local SeaweedFS (optional; see `docs/BACKEND-V2.md`) |

## Layout

| Path | Role |
|------|------|
| `app/` | Storefront, admin UI, API routes |
| `components/` | React UI |
| `lib/` | Catalog, auth, payments, storage |
| `data/catalog.json` | Seed source for `db:seed` |
| `scripts/` | Migrate/seed and Liara deploy helpers |
| `docs/DEPLOY-LIARA.md` | Production deploy |
