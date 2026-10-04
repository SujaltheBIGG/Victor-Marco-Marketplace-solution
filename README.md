# Fleek Marketplace

Fleek is a multi-vendor marketplace: independent sellers list products in one shared catalog, shoppers buy from several sellers in a single checkout, and the marketplace operator approves sellers, sets commissions and oversees every order.

## Apps

| App | Path | Local URL | Who uses it |
| --- | --- | --- | --- |
| Storefront | `apps/storefront` | http://localhost:3000 | Shoppers |
| Seller hub | `apps/vendor` | http://localhost:7002 | Sellers |
| Admin | `apps/admin-test` | http://localhost:7001 | Marketplace operator |
| API | `apps/api` | http://localhost:9000 | All of the above |

In production the API also serves the admin at `/dashboard` and the seller hub at `/seller`.

## What works today

- **Storefront** – home page, category pages with filters, search, product pages with competing seller offers, multi-seller cart, checkout and order confirmation.
- **Seller hub** – seller sign-up and onboarding, offers (price, stock, SKU), orders and fulfillment, store settings, locations and shipping.
- **Admin** – seller approval, catalog, orders across all sellers, commission rates, customers, promotions, regions and taxes.
- **Marketplace logic** – one order per seller from a single checkout, per-order commission lines, and a default warehouse with shipping options for every newly approved seller.

Next phase: card payments (Stripe), transactional emails, seller payouts and legal/content pages.

## Tech stack

TypeScript monorepo (Bun workspaces + Turborepo): a Medusa-based API with marketplace modules, a Next.js storefront and two React/Vite dashboards. PostgreSQL and Redis are required.

## Local development

Requirements: [Bun](https://bun.sh) 1.4+, Node.js 22+, PostgreSQL 16 and Redis.

```bash
bun install

# Settings (git-ignored). Fill in the publishable key from Admin → Settings → Publishable API Keys.
cp apps/api/.env.template apps/api/.env
cp apps/storefront/.env.template apps/storefront/.env.local

# Create the database schema and demo catalog (resets the local database).
createdb fleek_marketplace
DATABASE_URL=postgres://localhost/fleek_marketplace ./scripts/reseed-local.sh

# Start the API, storefront, seller hub and admin together.
bun run dev:apps
```

Create an admin user with:

```bash
cd apps/api && bunx medusa user -e you@example.com -p 'a-strong-password'
```

The seed creates five demo sellers (`everyday@fleek.test`, `makersmoss@fleek.test`, `northline@fleek.test`, `brightside@fleek.test`, `fieldform@fleek.test`). Their password is `SEED_SELLER_PASSWORD`, or `supersecret` when unset. `SEED_EXTRA_SELLER_EMAIL` / `SEED_EXTRA_SELLER_NAME` add one more store.

## Deployment (Railway)

The whole marketplace runs as **one service behind one URL** (`deploy/Dockerfile`): the storefront at `/`, the seller hub at `/seller`, the admin at `/dashboard`, and the API routes, all behind a small gateway (`deploy/gateway.mjs`). PostgreSQL and Redis are Railway database add-ons.

Service variables:

| Variable | Value |
| --- | --- |
| `RAILWAY_DOCKERFILE_PATH` | `deploy/Dockerfile` |
| `PORT` | `8080` |
| `PUBLIC_URL` | the service URL, e.g. `https://fleek.up.railway.app` |
| `DATABASE_URL` / `REDIS_URL` | references to the Postgres and Redis add-ons |
| `JWT_SECRET` / `COOKIE_SECRET` | long random strings |
| `STORE_CORS`, `ADMIN_CORS`, `VENDOR_CORS`, `AUTH_CORS` | the service URL |
| `FILE_BACKEND_URL` | `<service-url>/static` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` and `SEED_PUBLISHABLE_KEY` | the same `pk_…` value |
| `STOREFRONT_REVALIDATE_URL` | `http://127.0.0.1:3000/api/revalidate` |
| `STOREFRONT_REVALIDATE_SECRET` and `REVALIDATE_SECRET` | the same random value |
| `SEED_ON_FIRST_BOOT` | `true` to load the demo catalog into an empty database |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | admin account created on start if missing |
| `SEED_SELLER_PASSWORD`, `SEED_EXTRA_SELLER_*` | optional demo seller settings |

## Project structure

```
apps/       storefront, api, seller hub (vendor), admin (admin-test)
packages/   marketplace core, typed API client, shared types, dashboard SDK and UI packages
deploy/     Dockerfiles for Railway
scripts/    local helpers (database reseed, worktree dev)
```

## License

See [LICENSE](LICENSE).
