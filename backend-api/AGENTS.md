# Mangrove Collection API

Express 5 + TypeScript API for the storefront (`../frontend`, Next.js on :3000) and the dashboard (`../dashboard`, Vite on :5173). MySQL through Prisma 7 (`@prisma/adapter-mariadb`), validation with Zod 4. Managed with pnpm (workspace root is the repo root).

## Commands

```sh
pnpm install
pnpm exec prisma generate   # also runs as postinstall
pnpm db:migrate             # prisma migrate deploy
pnpm db:seed                # idempotent: settings defaults, shipping methods, pages, first admin
pnpm db:seed:catalog        # optional starter catalog with photos
pnpm dev                    # node --watch (src only) + tsx on PORT (8080); root `pnpm dev` also starts frontend + dashboard
pnpm test                   # Vitest + Supertest against DB_TEST_DATABASE
pnpm typecheck
pnpm build && pnpm start
```

## Layout

- `src/app.ts` builds the Express app; `src/server.ts` listens.
- `src/routes/` — `auth`, `storefront` (public), `account` (signed-in customer), `admin` (admin + manager; users, payment accounts and settings are admin-only).
- `src/services/` — business logic (orders, payments, reviews, settings, mail, SMS, Google, images).
- `src/validation/` — Zod helpers that produce Laravel-shaped 422 responses (`{ message, errors }`) and the safe-text / safe-HTML / safe-URL rules.
- `src/resources/` — JSON serializers; responses keep the exact shape the frontends expect.
- `src/auth/session.ts` — cookie sessions in the `sessions` table, CSRF via `XSRF-TOKEN` cookie + `X-XSRF-TOKEN` header, remember-me cookie.
- `prisma/schema.prisma`, `prisma/migrations/` — schema; never edit an applied migration, add a new one.
- `src/generated/prisma` — generated client (git-ignored). Import from `../generated/prisma/client.js`.

## Rules

- Every input is validated with Zod. Free text uses `safeText` (rejects HTML/PHP tags, SQL-injection patterns, null bytes); rich text uses `isSafeHtml`; URLs use `isSafeUrl`. Never build SQL from strings: use Prisma or tagged `$queryRaw`.
- Keep response bodies, status codes and validation messages unchanged: the storefront and dashboard depend on them.
- Passwords are bcrypt with the `$2y$` prefix (`hashPassword`), interchangeable with the old PHP hashes.
- `APP_KEY` encrypts secret settings and signs cookies: never rotate it casually.
- Tests run only against a database whose name contains `test` and wipe it before every test. Never point tests or ad-hoc write requests at the dev database.
- ESM with `NodeNext`: relative imports end in `.js`.
