# Backend v2 (Liara + SQLite + SeaweedFS)

## Object storage: SeaweedFS vs alternatives

| Option | Best for |
|--------|----------|
| **SeaweedFS** | Single server, many small files, low RAM, OSS |
| **MinIO** | Familiar S3 API, good docs, slightly heavier |
| **Managed S3/R2** | No ops; egress cost / region |

On **one Liara app server**, SeaweedFS is a solid choice. The app uses the **standard S3 API** (`@aws-sdk/client-s3`), so you can switch to MinIO or Liara Object Storage later by changing env vars only.

## Local development

```bash
npm run storage:up
npm run storage:init
# .env.local: CATALOG_BACKEND=sqlite, ADMIN_TOKEN, S3_* (see .env.example)
npm run db:migrate
npm run db:seed
npm run dev
```

Create an S3 bucket in SeaweedFS (default install often uses bucket name `seaweedfs` or create via `weed shell`). Set `S3_BUCKET` to match.

**Local dev without Docker:** leave `S3_*` unset — admin uploads go to `public/uploads/` and are served at `/uploads/...`.

## Customer account (SQLite)

| Table | Account UI | Purpose |
|-------|------------|---------|
| `users` | login | phone, role (`customer` / `admin`) |
| `customer_profiles` | پروفایل | name, city, address, postal code (1:1 with customer) |
| `orders` | سفارش‌های من | order header, shipping snapshot, fulfillment `status` |
| `order_items` | (per order) | line items with product name/price snapshot |
| `payments` | (linked) | Zarinpal `authority`, gateway status, `order_id` FK |

Order `status`: `awaiting_payment` → `paid` / `failed` (later: `processing`, `shipped`, …).

Migrations backfill existing `users` profile columns and legacy `payments` rows into the new tables on deploy.

## Admin auth (same OTP as customers)

- Login: **`/login`** (or `/login?next=/admin`) — phone + Kavenegar OTP only
- Admin is the user whose mobile matches **`ADMIN_PHONE`** in env (synced on migrate / `npm run db:seed-admin`)
- Session: httpOnly cookie `onlineshop_session` (`users.role === 'admin'`)
- Optional `ADMIN_EMAIL` / `ADMIN_PASSWORD` for legacy tooling; not shown on the login page
- Legacy `ADMIN_TOKEN` bearer still works for API until removed

## Liara

See **[DEPLOY-LIARA.md](./DEPLOY-LIARA.md)** — `liara.json`, disks `shop-data` + `shop-uploads`, env vars, `liara deploy`.

`npm start` runs migrations automatically; run `npm run db:seed` once on the server after first deploy.

## Admin panel

The shop header **user icon** is for **customers** (phone login later), not admin.

**Store owner:** open **`/login`** (or `/login?next=/admin`). Email/password after `npm run db:seed-admin`. Manage products at **`/admin`**.

Requires `CATALOG_BACKEND=sqlite`.

## APIs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Status + catalog backend |
| GET | `/api/products` | `?collection=&category=&query=&slugs=a,b` |
| GET | `/api/products/[slug]` | Single product |
| GET | `/api/admin/products` | List (admin) |
| POST | `/api/admin/products` | Create (admin JSON body) |
| PUT | `/api/admin/products/[slug]` | Update (admin) |
| DELETE | `/api/admin/products/[slug]` | Delete (admin) |
| POST | `/api/admin/upload` | `multipart/form-data` field `file`; header `Authorization: Bearer $ADMIN_TOKEN` |

GitHub Pages CI keeps `CATALOG_BACKEND=json` (default) and static export.
