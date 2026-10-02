# Mangrove Collection API

REST API (`/v1`) for the Mangrove Collection storefront and admin dashboard, built with Express 5, TypeScript, Prisma (MySQL) and Zod.

## Setup

```sh
cp .env.example .env        # set APP_KEY and the DB_* values
pnpm install
pnpm exec prisma generate
pnpm db:migrate
pnpm db:seed                # prints the first admin's password unless ADMIN_PASSWORD is set
pnpm dev                    # http://localhost:8080
```

From the repository root, `pnpm api` starts the same dev server.

## Tests

```sh
pnpm test
```

The suite needs a MySQL database named by `DB_TEST_DATABASE` (default `mangrove_collection_test`); it is migrated automatically and emptied before every test.

## Uploads

- `public/uploads` — category and review images, served at `/uploads`.
- `storage/app/public` — media library and avatars, served at `/storage`.

Override the locations with `UPLOADS_PATH` and `PUBLIC_STORAGE_PATH`.
