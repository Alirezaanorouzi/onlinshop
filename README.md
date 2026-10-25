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
| `npm run db:seed` | Seed catalog into SQLite |
| `npm run db:seed-admin` | Sync admin user from `ADMIN_PHONE` |
