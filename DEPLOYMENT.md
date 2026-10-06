# Deploying Mangrove Collection (cPanel / Apache)

Three apps, one registrable domain:

| App | Built with | Output | Served at |
| --- | --- | --- | --- |
| Storefront (`frontend/`) | Next.js (static export) | `frontend/out/` | `https://mangrove-collection.com` |
| Dashboard (`dashboard/`) | Vite + React | `dashboard/dist/` | `https://dashboard.mangrove-collection.com` |
| API (`backend-api/`) | Laravel 13 (PHP 8.3+, MySQL) | `backend-api/` (PHP, document root `public/`) | `https://api.mangrove-collection.com` |

The dashboard and the storefront are plain HTML/CSS/JS and the API is a normal PHP site, so no Node.js is
needed on the server. The storefront's blog pages are rendered at build time, so search engines get the full
article, title, description and structured data.

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
  `GET https://api.mangrove-collection.com/sanctum/csrf-cookie`, which sets a readable `XSRF-TOKEN` cookie.
  Every mutating request echoes it back in the `X-XSRF-TOKEN` header. A missing
  or stale token returns **419**. The clients refresh the token and retry once
  automatically.
- **Origin check.** Only requests whose `Origin`/`Referer` host is listed in
  `SANCTUM_STATEFUL_DOMAINS` get a session at all. Login from anywhere else returns
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
   - The main domain is served by the storefront Node.js app (section 4.1).
   - `dashboard.` document root: `dashboard_html` (any folder outside `public_html`).
   - `api.` document root: **`mangrove-api/public`** (only the `public/` folder,
     never the app folder itself).
2. **SSL** (cPanel > SSL/TLS Status): run AutoSSL for all three hosts, plus
   `www.`. HTTPS is mandatory: the session cookie is `Secure`. Turn on
   **Force HTTPS Redirect** for all three hosts (cPanel > Domains).
3. **PHP** (cPanel > MultiPHP Manager): set `api.mangrove-collection.com` to
   PHP **8.2** or newer. In Select PHP Version / PHP extensions make sure
   `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `gd`, `curl`, `tokenizer`,
   `xml` and `ctype` are on. In MultiPHP INI Editor set `upload_max_filesize`
   and `post_max_size` to at least **110M** (blog videos can be 100 MB) and
   `memory_limit` to 256M.
4. **MySQL** (MySQL Databases): create a database and user, and grant the user
   ALL PRIVILEGES on that database only.

Directory layout in your home folder:

```text
/home/USER/
├── mangrove-api/          # backend-api/ (Laravel app; only public/ is web-accessible)
│   └── public/            # <- document root of api.mangrove-collection.com
├── mangrove-storefront/   # frontend/ (Node.js application root, NOT web-accessible)
└── dashboard_html/        # <- contents of dashboard/dist/
```

Never point a document root at `mangrove-api/` itself or put it inside
`public_html`, otherwise `.env` and the source could be exposed.

---

## 3. API (`backend-api/`)

### 3.1 Prepare and upload

If your cPanel has a Terminal with `composer`, upload the source and install there (step 3.3).
Otherwise install the PHP dependencies on your computer first:

```bash
cd backend-api
composer install --no-dev --optimize-autoloader     # -> vendor/
```

Upload the whole `backend-api/` folder to `~/mangrove-api/` **including `vendor/`**
(upload the files over FTP, or use Git Version Control + composer). Do not
upload `.env`, `tests/` or `node_modules/`. When redeploying, keep the server's `.env`,
`public/uploads/` and `storage/app/public/`.

### 3.2 Production `.env`

Copy `.env.example` to `~/mangrove-api/.env` and fill it in. The values that
matter for security:

```dotenv
APP_ENV=production
APP_DEBUG=false                       # never true in production
APP_KEY=base64:...                    # keep the key from the previous deploy
APP_URL=https://api.mangrove-collection.com
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=cpaneluser_mangrove
DB_USERNAME=cpaneluser_mangrove
DB_PASSWORD=********

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=sync

# Hosts (no scheme) that receive the session cookie + CSRF protection
SANCTUM_STATEFUL_DOMAINS=mangrove-collection.com,www.mangrove-collection.com,dashboard.mangrove-collection.com
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
When moving from the Express API, reuse its `APP_KEY` unchanged (both use the
same encryption format). A new key makes stored secrets unreadable and signs
everyone out. Generate a key only for a brand-new install: `php artisan key:generate`.

Lock the file down: `chmod 600 ~/mangrove-api/.env`.

Google OAuth, SMTP, SMS and SEO/pixel settings are **not** in `.env`. They
live in the `settings` table and are edited from the dashboard.

### 3.3 Install, migrate and seed (cPanel > Terminal, or SSH)

```bash
cd ~/mangrove-api
composer install --no-dev --optimize-autoloader   # skip if you uploaded vendor/
php artisan migrate --force        # creates missing tables, skips existing ones
php artisan db:seed --force        # idempotent: settings, shipping, pages, first admin
php artisan storage:link           # public/storage -> storage/app/public
php artisan optimize               # caches config, routes and views
chmod -R 775 storage bootstrap/cache public/uploads
```

If cPanel's PHP CLI is older than 8.2, call the right binary explicitly, e.g.
`/opt/cpanel/ea-php82/root/usr/bin/php artisan migrate --force`.

If `ADMIN_PASSWORD` is empty, the seeder prints a random password once. Sign in
and change it, then remove `ADMIN_PASSWORD` from `.env`.

Optional demo content (skips anything that already exists):

```bash
php artisan db:seed --class=CatalogSeeder --force       # 5 categories, 16 products with photos
php artisan db:seed --class=FreshCatalogSeeder --force  # same, but removes the current catalog first
php artisan db:seed --class=BlogSeeder --force          # 5 blog categories, 15 articles with covers
```

Uploaded files live in `public/uploads/` (categories, reviews) and
`storage/app/public/` (media library, avatars, blog videos), served by Apache
through `public/`. Keep both folders when redeploying.

After every change to `.env` run `php artisan optimize` again (the config is cached).

### 3.4 Upgrading from the Express API

The database is reused as-is: same tables, same password hashes, same images,
and every `/v1` endpoint keeps the same URL, request fields and JSON response.

1. Keep the same `APP_KEY`, database and upload folders (`public/uploads`,
   `storage/app/public`). Copy them from the old Node app folder into `~/mangrove-api/`.
2. In `.env`, rename `STATEFUL_DOMAINS` to `SANCTUM_STATEFUL_DOMAINS` and add
   `DB_CONNECTION=mysql`, `SESSION_DRIVER=database`, `CACHE_STORE=database` and
   `QUEUE_CONNECTION=sync` (see 3.2). `TRUST_PROXY` is no longer used.
3. Stop and delete the Node.js app in cPanel > Setup Node.js App, then set the
   `api.` document root to `mangrove-api/public`.
4. Run the commands in 3.3. `php artisan migrate --force` only adds what
   Laravel needs (`migrations`, `cache`, `jobs`, `personal_access_tokens`) and
   leaves the existing tables and data alone. Prisma's `_prisma_migrations`
   table can stay or be dropped.

Users may have to sign in once after the switch.

The API adds its own security headers (`nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: no-referrer`) and rate-limits all routes.

### 3.5 Dashboard settings

After the first sign-in, open **Settings** and confirm `storefront_url` and
`dashboard_url`. Password-reset emails link to
`{storefront_url}/reset-password/` or `{dashboard_url}/reset-password`.

---

## 4. Building the frontends

Build on your computer (or CI), then upload the output. The dashboard needs no
Node.js on the server; the storefront runs as a Node.js app.

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
pnpm build      # -> frontend/.next/ and dashboard/dist/
```

### 4.1 Storefront (static files)

The storefront is a static export: `pnpm build` writes plain HTML/CSS/JS to
`frontend/out/`. Upload the **contents** of `frontend/out/` (including
`.htaccess`) into `public_html/`. No Node.js app is needed; if you created one
in cPanel > Setup Node.js App, delete it.

Blog articles, blog categories and the sitemap are rendered from the live API
**during the build**, so search engines get the full article. A newly
published post appears after the next deploy (push to `main` or run the Deploy
workflow by hand). Blog search, tags, sorting and later pages load in the
browser.

`frontend/public/.htaccess` (copied into `out/`) forces HTTPS, redirects
`www.` to the apex, serves `404.html` for missing pages, permanently redirects
old `/blog/post/?slug=...` and `/blog/?category=...` links, and sends
`nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`,
`Permissions-Policy`, COOP (`same-origin-allow-popups`, so Google sign-in
works), HSTS and a CSP of `frame-ancestors`, `base-uri`, `object-src 'none'`,
`form-action` and `upgrade-insecure-requests`. Script sources are deliberately
not restricted because admins can inject analytics/pixel scripts from the
dashboard.

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

Upload the new build over the old files. Hashed
assets make stale caches harmless. For the API, upload the new code (keeping the server's `.env`,
`public/uploads/` and `storage/app/public/`), then:

```bash
cd ~/mangrove-api
composer install --no-dev --optimize-autoloader   # skip if you uploaded vendor/
php artisan migrate --force
php artisan db:seed --force
php artisan optimize
```

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
| **403 "Sign-in is only available from the Mangrove Collection website or dashboard"** | The frontend's host is missing from `SANCTUM_STATEFUL_DOMAINS` (host only, no `https://`, include the port locally). Run `php artisan optimize` after editing `.env`. |
| **419 on every POST** | Usually the `XSRF-TOKEN` cookie can't be set or read: wrong `SESSION_DOMAIN`, the site served over HTTP while `SESSION_SECURE_COOKIE=true`, or the frontend on a different registrable domain from the API. |
| **CORS error in the console** | The origin isn't in `CORS_ALLOWED_ORIGINS` (exact scheme + host, no trailing slash), or `php artisan optimize` wasn't run after editing `.env`. |
| Signed in, but every request is a 401 | The session cookie isn't being sent. Check `SESSION_DOMAIN` has the leading dot and that the frontend was built with the production API URL (see the `.env.production.local` note in section 4). |
| Dashboard shows "Can't reach the Mangrove Collection API" | API down, wrong `VITE_API_URL`, or the dashboard CSP's `connect-src` doesn't include the API host. |
| 500 errors, blank JSON | Check `~/mangrove-api/storage/logs/laravel.log` and cPanel > Errors. Check `storage/`, `bootstrap/cache/` and `public/uploads/` are writable. Never turn on `APP_DEBUG` on the live site. |
| "No application encryption key has been specified" | `~/mangrove-api/.env` is missing, unreadable, or has an empty `APP_KEY`. |
| "Your PHP version does not satisfy..." / syntax errors | The `api.` domain (or the CLI `php`) is on PHP older than 8.2. Fix it in MultiPHP Manager. |
| Images/videos 404 under `/storage/...` | `php artisan storage:link` was not run (or the symlink was not uploaded). |
| Video upload fails with 413/422 | Raise `upload_max_filesize` and `post_max_size` (MultiPHP INI Editor). |
| Changes to `.env` ignored | The config is cached: run `php artisan optimize` (or `php artisan config:clear`). |

### Local development

```bash
cd backend-api && composer install && php artisan migrate && php artisan db:seed && cd ..
pnpm api            # Laravel API on http://localhost:8080
pnpm dev            # API :8080 + storefront :3000 + dashboard :5173
cd backend-api && php artisan test   # API test suite
```

Use `localhost` everywhere, not `127.0.0.1`. Cookies are per-host, so mixing
the two looks like "logged out". Local `.env` values:
`APP_URL=http://localhost:8080`, `SESSION_DOMAIN=null`, `SESSION_SECURE_COOKIE=false`, and
`SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173`.

### Upgrading from token auth

Older builds stored a bearer token in `localStorage`. Those tokens are no longer
accepted, and the new builds delete them, so **every user has to sign in once
after this release**.
