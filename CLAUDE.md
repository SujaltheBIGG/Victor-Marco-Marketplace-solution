# CLAUDE.md

Fleek is a multi-vendor marketplace (Medusa-based API, Next.js storefront, React/Vite admin and seller dashboards) in a Bun + Turborepo monorepo. See README.md for apps, local setup and deployment.

## Commands

```bash
bun install           # install dependencies (always use bun)
bun run dev:apps      # API :9000, storefront :3000, admin :7001, seller hub :7002
bun run build         # build all packages
bun run lint
./scripts/reseed-local.sh   # rebuild the local database from the seed
```

## Layout

- `apps/api` – API server, subscribers, seed scripts
- `apps/storefront` – Next.js shop
- `apps/admin-test` – admin dashboard host, `apps/vendor` – seller hub host
- `packages/core` – marketplace modules, workflows and routes
- `packages/admin`, `packages/vendor`, `packages/dashboard-shared`, `packages/dashboard-sdk` – dashboard UI
- `packages/client`, `packages/types` – typed API client and shared types
- `deploy/` – Railway Dockerfiles

## Conventions

- TypeScript everywhere, no `any`.
- Conventional Commits (`feat(scope):`, `fix(scope):`, `chore:`).
- Bug fixes and new features need tests; keep `bun run build` green.
