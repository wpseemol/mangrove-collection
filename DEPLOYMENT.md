# Deploying Mangrove Collection (cPanel / Apache)

Three apps, one registrable domain:

| App | Built with | Output | Served at |
| --- | --- | --- | --- |
| Storefront (`frontend/`) | Next.js static export | `frontend/out/` | `https://mangrove-collection.com` |
| Dashboard (`dashboard/`) | Vite + React | `dashboard/dist/` | `https://dashboard.mangrove-collection.com` |
| API (`backend-api/`) | Express + TypeScript + Prisma (MySQL) | `backend-api/dist/` (Node.js app) | `https://api.mangrove-collection.com` |

The two frontends are plain HTML/CSS/JS. Only the API runs server-side code (Node.js 22+).

> **Same domain is required.** Sign-in uses an HttpOnly session cookie scoped to
> `.mangrove-collection.com`. If you host the frontends on a different domain
> (for example `*.vercel.app`), the browser will not send the cookie to the API
> and nobody can sign in.

---

## 1. How authentication works

- **Cookie sessions, not tokens.** After login the API sets `mangrove_session`:
  HttpOnly (JavaScript can't read it), `Secure`, `SameSite=Lax`, signed with
  `APP_KEY`, and backed by a row in the `sessions` table. No token is ever
  returned to or stored by the browser. `Authorization: Bearer` headers are
  ignored.
- **CSRF.** Before the first POST/PUT/PATCH/DELETE the frontends call
  `GET https://api.mangrove-collection.com/sanctum/csrf-cookie` (the path is
  kept from the old Laravel API), which sets a readable `XSRF-TOKEN` cookie.
  Every mutating request echoes it back in the `X-XSRF-TOKEN` header. A missing
  or stale token returns **419**. The clients refresh the token and retry once
  automatically.
- **Origin check.** Only requests whose `Origin`/`Referer` host is listed in
  `STATEFUL_DOMAINS` get a session at all. Login from anywhere else returns
  **403** "Sign-in is only available from the Mangrove Collection website or
  dashboard". CORS (`CORS_ALLOWED_ORIGINS`) independently restricts which
  origins may read credentialed responses.
- **One login for both apps.** The storefront and dashboard share the session.
  A staff member who signs in on the storefront is sent straight to the
  dashboard already signed in, and **signing out of either app signs out of
  both**.
- **Remember me.** The storefront login has "Keep me signed in"
  (`AUTH_REMEMBER_MINUTES`, default 30 days). The dashboard login never sets a
  remember cookie, so staff sessions expire after `SESSION_LIFETIME` minutes of
  inactivity.
- **Revocation.** All of a user's sessions are deleted (and the remember token
  rotated) on: "log out everywhere", password change, password reset, account
  deactivation, role change, and account deletion.
- **Session check.** `GET /v1/auth/session` always returns 200 with
  `{ "authenticated": bool, "user": {...} | null }`, so guests don't produce
  401 errors in the console.
- Auth, account, admin and checkout responses are sent with
  `Cache-Control: no-store, private`.

---

## 2. cPanel setup (once)

1. **Subdomains** (cPanel > Domains): create `api.mangrove-collection.com` and
   `dashboard.mangrove-collection.com`.
   - Main domain document root: `public_html` (storefront).
   - `dashboard.` document root: `dashboard_html` (any folder outside `public_html`).
   - `api.` is served by the Node.js app (step 3); its document root must
     **not** be the app folder.
2. **SSL** (cPanel > SSL/TLS Status): run AutoSSL for all three hosts, plus
   `www.`. HTTPS is mandatory: the session cookie is `Secure`. Turn on
   **Force HTTPS Redirect** for all three hosts (cPanel > Domains).
3. **Node.js** (cPanel > Setup Node.js App): Node.js **22+** (see section 3.3).
4. **MySQL** (MySQL Databases): create a database and user, and grant the user
   ALL PRIVILEGES on that database only.

Directory layout in your home folder:

```text
/home/USER/
├── mangrove-api/          # backend-api/ (Node.js application root, NOT web-accessible)
├── public_html/           # <- contents of frontend/out/
└── dashboard_html/        # <- contents of dashboard/dist/
```

Never put the API folder inside `public_html` or any document root, otherwise
`.env` and the source could be exposed. The API itself serves only `/v1/*`,
`/up`, `/uploads/*` and `/storage/*`.

---

## 3. API (`backend-api/`)

### 3.1 Build and upload

Build on your computer (or CI):

```bash
pnpm install
pnpm --filter mangrove-collection-api exec prisma generate
pnpm --filter mangrove-collection-api build      # -> backend-api/dist/
```

Upload to `~/mangrove-api/`: `dist/`, `src/` (used by the seed scripts), `prisma/`,
`data/`, `public/uploads/`, `storage/`, `package.json` and `prisma.config.ts`. Do not
upload `node_modules/`, `.env` or `test/`. (Use Git Version Control in cPanel, or zip and
extract it in File Manager.)

### 3.2 Production `.env`

Copy `.env.example` to `~/mangrove-api/.env` and fill it in. The values that
matter for security:

```dotenv
APP_ENV=production
APP_DEBUG=false                       # never true in production
APP_KEY=base64:...                    # keep the key from the previous deploy
APP_URL=https://api.mangrove-collection.com
LOG_LEVEL=warning
TRUST_PROXY=1                         # behind Apache/Passenger, so client IPs (rate limits) are right

DB_HOST=localhost
DB_DATABASE=cpaneluser_mangrove
DB_USERNAME=cpaneluser_mangrove
DB_PASSWORD=********

# Hosts (no scheme) that receive the session cookie + CSRF protection
STATEFUL_DOMAINS=mangrove-collection.com,www.mangrove-collection.com,dashboard.mangrove-collection.com
# Exact origins (scheme + host) allowed to make credentialed CORS requests
CORS_ALLOWED_ORIGINS=https://mangrove-collection.com,https://www.mangrove-collection.com,https://dashboard.mangrove-collection.com

SESSION_LIFETIME=120
SESSION_DOMAIN=.mangrove-collection.com   # leading dot = shared by all subdomains
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
AUTH_REMEMBER_MINUTES=43200

ADMIN_EMAIL=you@yourdomain.com
ADMIN_PASSWORD=a-long-unique-password
```

`APP_KEY` encrypts the secret settings (SMTP, SMS, Google) and signs cookies.
When moving from the Laravel API, reuse its `APP_KEY` unchanged. A new key
makes stored secrets unreadable and signs everyone out. Generate a key only for
a brand-new install:
`node -e "console.log('base64:'+require('crypto').randomBytes(32).toString('base64'))"`.

Lock the file down: `chmod 600 ~/mangrove-api/.env`.

Google OAuth, SMTP, SMS and SEO/pixel settings are **not** in `.env`. They
live in the `settings` table and are edited from the dashboard.

### 3.3 Create the Node.js app (cPanel > Setup Node.js App)

- Node.js version: **22** or newer
- Application mode: **Production**
- Application root: `mangrove-api`
- Application URL: `api.mangrove-collection.com`
- Application startup file: `dist/server.js`

The app reads `~/mangrove-api/.env` on startup, so no environment variables need
to be entered in the form.

### 3.4 Install, migrate and seed (cPanel > Terminal, or SSH)

Enter the app's virtual environment (cPanel shows the `source .../activate`
command at the top of the app page), then:

```bash
cd ~/mangrove-api
npm install                       # includes the Prisma CLI and tsx used below
npx prisma generate
npx prisma migrate deploy
npx tsx --env-file=.env prisma/seed.ts   # idempotent: settings, shipping, pages, first admin
chmod -R 775 storage public/uploads
```

Then click **Restart** on the Node.js app page.

If `ADMIN_PASSWORD` is empty, the seeder prints a random password once. Sign in
and change it, then remove `ADMIN_PASSWORD` from `.env`.

Uploaded files live in `public/uploads/` (categories, reviews) and
`storage/app/public/` (media library, avatars). The API serves them as static
files only (never executed). Keep both folders when redeploying.

### 3.5 Upgrading from the Laravel API

The database is reused as-is: same tables, same password hashes, same images.

1. Keep the same `APP_KEY`, database and upload folders (`public/uploads`,
   `storage/app/public`).
2. Rename `SANCTUM_STATEFUL_DOMAINS` to `STATEFUL_DOMAINS` (the old name still
   works).
3. Run `npx prisma migrate deploy`. On a database created by Laravel, first mark
   the baseline as applied: `npx prisma migrate resolve --applied 0_init`. The
   last migration drops Laravel's own `cache`, `jobs`, `migrations` and
   `personal_access_tokens` tables.
4. Remove the old PHP document root and cron jobs: the Express API has no
   scheduler or queue.

The API adds its own security headers (`nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: no-referrer`) and rate-limits all routes.

### 3.6 Dashboard settings

After the first sign-in, open **Settings** and confirm `storefront_url` and
`dashboard_url`. Password-reset emails link to
`{storefront_url}/reset-password/` or `{dashboard_url}/reset-password`.

---

## 4. Building the frontends

Build on your computer (or CI), then upload the output folders. The frontends
need no Node.js on the server.

> **Env file gotcha:** both Next.js and Vite load `.env.local` **during
> production builds too**, and it takes priority over `.env.production`. If you
> keep a `.env.local` with `localhost` URLs for development, put production
> values in **`.env.production.local`**, which wins during `pnpm build`.
> Values are baked into the JavaScript at build time and are public. Never put
> secrets in them.

`frontend/.env.production.local`:

```dotenv
NEXT_PUBLIC_API_URL=https://api.mangrove-collection.com/v1
NEXT_PUBLIC_SITE_URL=https://mangrove-collection.com
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.mangrove-collection.com
```

`dashboard/.env.production.local`:

```dotenv
VITE_API_URL=https://api.mangrove-collection.com/v1
VITE_STOREFRONT_URL=https://mangrove-collection.com
```

Build both from the repo root:

```bash
pnpm install
pnpm build      # -> frontend/out/ and dashboard/dist/
```

### 4.1 Storefront upload

Upload the **contents** of `frontend/out/` (including the hidden
`.htaccess`) into `public_html/`. Enable "Show Hidden Files" in File Manager
to check that `.htaccess` is there.

`frontend/public/.htaccess` (copied into `out/`):

- Redirects HTTP to HTTPS and `www.` to the apex domain.
- Uses `DirectorySlash`, so `/shop` becomes `/shop/` and serves `shop/index.html`
  (the export uses `trailingSlash: true`). Unknown paths get `404.html`.
- Sends `nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`,
  `Permissions-Policy`, COOP (`same-origin-allow-popups`, so Google sign-in
  works) and HSTS.
- Sets a CSP of `frame-ancestors`, `base-uri`, `object-src 'none'`,
  `form-action` and `upgrade-insecure-requests`. Script sources are
  deliberately not restricted because admins can inject analytics/pixel scripts
  from the dashboard.
- Marks HTML as `no-cache` and `/_next/static/*` as immutable for one year.

### 4.2 Dashboard upload

Upload the **contents** of `dashboard/dist/` (including `.htaccess`) into
`dashboard_html/`.

`dashboard/public/.htaccess` (copied into `dist/`):

- Serves real files directly, returns 404 for missing `/assets/*`, and falls
  back to `index.html` for every other path (client-side routing).
- Sends `X-Frame-Options: DENY`, `X-Robots-Tag: noindex`, COOP `same-origin`,
  HSTS, and a strict CSP: `script-src 'self'` (no inline scripts; the
  theme bootstrap lives in `theme-init.js`).
- **If your API is not `https://api.mangrove-collection.com`, edit
  `connect-src` in that CSP**, or every API call will be blocked.

### 4.3 Redeploys

Upload the new build over the old files. Hashed assets make stale caches
harmless. For the API, upload the new `dist/`, `src/`, `prisma/` and `package.json`,
then:

```bash
cd ~/mangrove-api
npm install
npx prisma generate
npx prisma migrate deploy
npx tsx --env-file=.env prisma/seed.ts
```

and click **Restart** on the Node.js app page.

---

## 5. Verification checklist

1. `https://api.mangrove-collection.com/up` returns 200.
   `https://api.mangrove-collection.com/.env` returns 404.
2. `http://` URLs on all three hosts redirect to `https://`.
3. In the storefront's browser DevTools (Application > Cookies) after signing in:
   - `mangrove_session` has Domain `.mangrove-collection.com`, HttpOnly ✓,
     Secure ✓, SameSite `Lax`.
   - `XSRF-TOKEN` is not HttpOnly (it must be readable by JS).
   - Local Storage has no token (only `mc-auth` with the cached user profile).
4. Sign in on the storefront as an admin. You land on the dashboard already
   signed in.
5. Sign out in the dashboard, then refresh the storefront. You are signed out.
6. Deep links like `https://dashboard.mangrove-collection.com/products` and
   `https://mangrove-collection.com/shop` load directly after a refresh.
7. The browser console shows no CSP or CORS errors.

---

## 6. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| **403 "Sign-in is only available from the Mangrove Collection website or dashboard"** | The frontend's host is missing from `STATEFUL_DOMAINS` (host only, no `https://`, include the port locally). Restart the Node.js app after editing `.env`. |
| **419 on every POST** | Usually the `XSRF-TOKEN` cookie can't be set or read: wrong `SESSION_DOMAIN`, the site served over HTTP while `SESSION_SECURE_COOKIE=true`, or the frontend on a different registrable domain from the API. |
| **CORS error in the console** | The origin isn't in `CORS_ALLOWED_ORIGINS` (exact scheme + host, no trailing slash), or the app wasn't restarted after editing `.env`. |
| Signed in, but every request is a 401 | The session cookie isn't being sent. Check `SESSION_DOMAIN` has the leading dot and that the frontend was built with the production API URL (see the `.env.production.local` note in section 4). |
| Dashboard shows "Can't reach the Mangrove Collection API" | API down, wrong `VITE_API_URL`, or the dashboard CSP's `connect-src` doesn't include the API host. |
| 500 errors, blank JSON | Check `~/mangrove-api/storage/logs/app.log` and the Node.js app's log (`stderr.log`). Check `storage/` and `public/uploads/` are writable. Never turn on `APP_DEBUG` on the live site. |
| App won't start and the log mentions `APP_KEY` | `~/mangrove-api/.env` is missing or unreadable by the app user. |
| Changes to `.env` ignored | Restart the Node.js app (cPanel > Setup Node.js App > Restart). |

### Local development

```bash
pnpm api            # Express API on http://localhost:8080 (restarts on file changes)
pnpm dev            # storefront :3000 + dashboard :5173
pnpm --filter mangrove-collection-api test   # API test suite (uses mangrove_collection_test)
```

Use `localhost` everywhere, not `127.0.0.1`. Cookies are per-host, so mixing
the two looks like "logged out". Local `.env` values:
`SESSION_DOMAIN=null`, `SESSION_SECURE_COOKIE=false`, and
`STATEFUL_DOMAINS=localhost:3000,localhost:5173`.

### Upgrading from token auth

Older builds stored a bearer token in `localStorage`. Those tokens are no longer
accepted, and the new builds delete them, so **every user has to sign in once
after this release**.
