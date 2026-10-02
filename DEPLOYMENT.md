# Deploying Mangrove Collection (cPanel / Apache)

Three apps, one registrable domain:

| App | Built with | Output | Served at |
| --- | --- | --- | --- |
| Storefront (`frontend/`) | Next.js static export | `frontend/out/` | `https://mangrove-collection.com` |
| Dashboard (`dashboard/`) | Vite + React | `dashboard/dist/` | `https://dashboard.mangrove-collection.com` |
| API (`backend-api/`) | Laravel + MySQL | `backend-api/public/` (document root) | `https://api.mangrove-collection.com` |

The two frontends are plain HTML/CSS/JS. Only the API runs PHP.

> **Same domain is required.** Sign-in uses an HttpOnly session cookie scoped to
> `.mangrove-collection.com`. If you host the frontends on a different domain
> (for example `*.vercel.app`), the browser will not send the cookie to the API
> and nobody can sign in.

---

## 1. How authentication works

- **Cookie sessions, not tokens.** Laravel Sanctum's SPA mode is used. After
  login the API sets `mangrove_session`: HttpOnly (JavaScript can't read it),
  `Secure`, `SameSite=Lax`, encrypted, and stored in the `sessions` table.
  No token is ever returned to or stored by the browser. `Authorization: Bearer`
  headers are ignored.
- **CSRF.** Before the first POST/PUT/PATCH/DELETE the frontends call
  `GET https://api.mangrove-collection.com/sanctum/csrf-cookie`, which sets a
  readable `XSRF-TOKEN` cookie. Every mutating request echoes it back in the
  `X-XSRF-TOKEN` header. A missing or stale token returns **419**. The clients
  refresh the token and retry once automatically.
- **Origin check.** Only requests whose `Origin`/`Referer` host is listed in
  `SANCTUM_STATEFUL_DOMAINS` get a session at all. Login from anywhere else
  returns **403** "Sign-in is only available from the Mangrove Collection
  website or dashboard". CORS (`CORS_ALLOWED_ORIGINS`) independently restricts
  which origins may read credentialed responses.
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
   - `api.` document root: `mangrove-api/public` (see step 3).
2. **SSL** (cPanel > SSL/TLS Status): run AutoSSL for all three hosts, plus
   `www.`. HTTPS is mandatory: the session cookie is `Secure` and every
   `.htaccess` redirects HTTP to HTTPS.
3. **PHP** (MultiPHP Manager): PHP **8.3+** for `api.`. Required extensions:
   `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`,
   `bcmath`, `fileinfo`, `gd` (or `imagick`), `intl`.
4. **MySQL** (MySQL Databases): create a database and user, and grant the user
   ALL PRIVILEGES on that database only.

Directory layout in your home folder:

```text
/home/USER/
├── mangrove-api/          # whole backend-api/ folder (NOT web-accessible)
│   └── public/            # <- document root of api.mangrove-collection.com
├── public_html/           # <- contents of frontend/out/
└── dashboard_html/        # <- contents of dashboard/dist/
```

Never put the Laravel project itself inside `public_html`. Only its `public/`
folder may be web-reachable, otherwise `.env` and `storage/` could be exposed.

---

## 3. API (`backend-api/`)

### 3.1 Upload

Upload the `backend-api/` folder to `~/mangrove-api/`, excluding `vendor/`,
`node_modules/`, `.env`, `storage/logs/*`, `tests/` and `.phpunit.result.cache`.
(Use Git Version Control in cPanel, or zip and extract it in File Manager.)

### 3.2 Production `.env`

Copy `.env.example` to `.env` and fill it in. The values that matter for
security:

```dotenv
APP_ENV=production
APP_DEBUG=false                       # never true in production
APP_URL=https://api.mangrove-collection.com
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=cpaneluser_mangrove
DB_USERNAME=cpaneluser_mangrove
DB_PASSWORD=********

# Hosts (no scheme) that receive the session cookie + CSRF protection
SANCTUM_STATEFUL_DOMAINS=mangrove-collection.com,www.mangrove-collection.com,dashboard.mangrove-collection.com
# Exact origins (scheme + host) allowed to make credentialed CORS requests
CORS_ALLOWED_ORIGINS=https://mangrove-collection.com,https://www.mangrove-collection.com,https://dashboard.mangrove-collection.com

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_DOMAIN=.mangrove-collection.com   # leading dot = shared by all subdomains
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
AUTH_REMEMBER_MINUTES=43200

CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=public

ADMIN_EMAIL=you@yourdomain.com
ADMIN_PASSWORD=a-long-unique-password
```

Lock the file down: `chmod 600 ~/mangrove-api/.env`.

Google OAuth, SMTP, SMS and SEO/pixel settings are **not** in `.env`. They
live in the `settings` table and are edited from the dashboard.

### 3.3 Install and migrate (cPanel > Terminal, or SSH)

```bash
cd ~/mangrove-api
composer install --no-dev --optimize-autoloader
php artisan key:generate          # first deploy only
php artisan migrate --force
php artisan db:seed --force       # idempotent: settings, shipping, pages, first admin
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
chmod -R 775 storage bootstrap/cache
```

If `ADMIN_PASSWORD` is empty, the seeder prints a random password once. Sign in
and change it, then remove `ADMIN_PASSWORD` from `.env` and run
`php artisan config:cache` again.

If `storage:link` is not allowed on your host, create the symlink in File
Manager: `public/storage` pointing to `../storage/app/public`. The
`storage/app/public/.htaccess` and `public/uploads/.htaccess` files block PHP
and script execution inside upload folders. Keep them.

### 3.4 Cron (cPanel > Cron Jobs)

Every minute:

```text
* * * * * cd /home/USER/mangrove-api && php artisan schedule:run >> /dev/null 2>&1
```

No code currently queues jobs. If you add queued mail or jobs later, also add:

```text
* * * * * cd /home/USER/mangrove-api && php artisan queue:work --stop-when-empty --max-time=55 >> /dev/null 2>&1
```

### 3.5 What `public/.htaccess` does

- Redirects HTTP to HTTPS.
- Returns 403 for dotfiles (`.env`, `.git`, ...) except `.well-known` (AutoSSL).
- Forwards the `X-XSRF-TOKEN` header to PHP.
- Hides the server signature and `X-Powered-By`.

The API adds its own security headers (`SecurityHeaders` middleware) and
rate-limits all routes.

### 3.6 Dashboard settings

After the first sign-in, open **Settings** and confirm `storefront_url` and
`dashboard_url`. Password-reset emails link to
`{storefront_url}/reset-password/` or `{dashboard_url}/reset-password`.

---

## 4. Building the frontends

Build on your computer (or CI), then upload the output folders. cPanel does not
need Node.

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
harmless. For the API:

```bash
cd ~/mangrove-api
php artisan down
# upload new code
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan db:seed --force
php artisan optimize:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache
php artisan up
```

---

## 5. Verification checklist

1. `https://api.mangrove-collection.com/up` returns 200.
   `https://api.mangrove-collection.com/.env` returns 403.
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
| **403 "Sign-in is only available from the Mangrove Collection website or dashboard"** | The frontend's host is missing from `SANCTUM_STATEFUL_DOMAINS` (host only, no `https://`, include the port locally). Run `php artisan config:cache` after editing. |
| **419 on every POST** | Usually the `XSRF-TOKEN` cookie can't be set or read: wrong `SESSION_DOMAIN`, the site served over HTTP while `SESSION_SECURE_COOKIE=true`, or the frontend on a different registrable domain from the API. |
| **CORS error in the console** | The origin isn't in `CORS_ALLOWED_ORIGINS` (exact scheme + host, no trailing slash), or the config cache is stale. |
| Signed in, but every request is a 401 | The session cookie isn't being sent. Check `SESSION_DOMAIN` has the leading dot and that the frontend was built with the production API URL (see the `.env.production.local` note in section 4). |
| Dashboard shows "Can't reach the Mangrove Collection API" | API down, wrong `VITE_API_URL`, or the dashboard CSP's `connect-src` doesn't include the API host. |
| 500 errors, blank JSON | Check `~/mangrove-api/storage/logs/laravel.log`. Check `storage/` and `bootstrap/cache` are writable. Never turn on `APP_DEBUG` on the live site. |
| Changes to `.env` ignored | Run `php artisan config:cache` (config is cached in production). |

### Local development

```bash
pnpm api            # Laravel on http://localhost:8080
pnpm dev            # storefront :3000 + dashboard :5173
```

Use `localhost` everywhere, not `127.0.0.1`. Cookies are per-host, so mixing
the two looks like "logged out". Local `.env` values:
`SESSION_DOMAIN=null`, `SESSION_SECURE_COOKIE=false`, and
`SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173`.

### Upgrading from token auth

Older builds stored a bearer token in `localStorage`. Those tokens are no longer
accepted, and the new builds delete them, so **every user has to sign in once
after this release**.
