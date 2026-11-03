<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- On boot, `start` listens at http://127.0.0.1:3000 (`npm run dev -- --hostname 0.0.0.0 --port 3000`). If `.env.local` is missing it writes `CATALOG_BACKEND=sqlite`, then runs `npm run db:migrate` and `npm run db:seed` from `data/catalog.json`. Re-running `start` is safe: it skips the server when `/api/health` already responds.
- The storefront, product page, and cart work without OTP, Zarinpal, Snapp Pay, Telegram, or object storage. Leave `S3_*` unset unless SeaweedFS is up (`npm run storage:up`); otherwise uploads use `public/uploads/`.
- `npm run build` and `npx tsc --noEmit` are the checks that pass here. `npm run lint` currently fails on existing `react-hooks` findings in the shop UI; that is independent of environment setup.
