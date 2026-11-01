# Deploying to Vercel

The site is a Next.js 16 app. Every page reads MP data through `lib/data.ts`.
With no database configured, that data comes from the committed JSON snapshot
in `data/processed/`. A deploy therefore needs only one environment variable,
`NEXT_PUBLIC_SITE_URL`. Everything else is optional.

## 1. Import the repository

1. In Vercel, choose **Add New → Project** and import the GitHub repository.
2. Framework preset: **Next.js** (Vercel detects it). Root directory: the repository root.
3. Build and output settings:
   - **Install command:** `npm ci` (the default `npm install` also works; `package-lock.json` is committed).
   - **Build command:** `npm run build`. This runs `next build --webpack`. Keep the
     `--webpack` flag: the project is built and tested with webpack, not Turbopack.
   - **Output directory:** leave the default (`.next`).
4. **Node.js version:** 22.x (Project Settings → General → Node.js Version). Next.js 16
   needs Node 20.9 or later, and the GitHub workflows use Node 22.
5. Add the environment variables below, then deploy. Pushes to `main` deploy to
   production. Pull requests get preview deploys.

## 2. Environment variables

Set these in Project Settings → Environment Variables. `.env.example` lists the same names.

| Variable | Required | What it does |
|----------|----------|--------------|
| `NEXT_PUBLIC_SITE_URL` | **Yes** | The absolute site URL, e.g. `https://your-project.vercel.app` (no trailing slash). Used for canonical and Open Graph links, `sitemap.xml` and `robots.txt`. It is read at build time, so redeploy after you change it. Without it, these links point to `http://localhost:3000`. |
| `DATABASE_URL` | No | YugabyteDB (YSQL) connection string. If it is unset, the site serves the JSON snapshot. If it is set but the database cannot be reached, the site still serves the JSON snapshot, and `/api/health` reports `degraded` with `database.status: unreachable`. |
| `DATABASE_CA_CERT` | With a hosted database | The database's CA certificate as **text** (the content of `certs/root.crt`). Use it on Vercel, where there is no file to point to. See the next section. |
| `GEMINI_API_KEY` | No | Server-side key for the optional "Explain simply" summary. It is never sent to the browser. |
| `GEMINI_MODEL` | No | A current Gemini model id. You must set both `GEMINI_API_KEY` and `GEMINI_MODEL`, or `/api/summary` uses the fixed template summary. |

The site works fully with only `NEXT_PUBLIC_SITE_URL` set: report cards come from
the JSON snapshot and summaries use the template.

### YugabyteDB Aeon (optional)

Set two variables in Vercel (Project Settings → Environment Variables), never in a file in the repository:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://<user>:<password>@<cluster-host>:5433/yugabyte`, with no `ssl…` parameters. Percent-encode special characters in the password (`@` is `%40`, `:` is `%3A`, `/` is `%2F`, `#` is `%23`). |
| `DATABASE_CA_CERT` | The whole content of `certs/root.crt`, including the `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` lines. Vercel accepts multi-line values. You can also paste it on one line, with a backslash followed by `n` between lines. |

- **Why a variable and not a file:** a deployed function cannot read files from
  your computer, and `pg` treats `sslrootcert=` as a file path at runtime. With
  `DATABASE_CA_CERT` set, the app uses the certificate text and removes any
  `ssl…` parameters from the URL itself. The server certificate and host name
  are always verified.
- **The certificate is not a secret.** It is the cluster provider's public CA
  chain (`certs/root.crt`, committed). The password is the secret.
- **IP allow list:** Vercel and GitHub Actions do not connect from fixed IP
  addresses, so in the Aeon console (Networking → IP Allow List) the list must
  allow `0.0.0.0/0`. The database stays protected by its password and verified
  TLS. The Vercel **build** reads the database too (pages are generated at build
  time), so the build machine needs access as well.
- **Local development:** in `.env` at the **project root** (next to
  `package.json`) set
  `DATABASE_URL=postgresql://<user>:<password>@<cluster-host>:5433/yugabyte?sslmode=verify-full&sslrootcert=certs/root.crt`.
  The path is relative to the project root. Never put `.env` or the certificate
  in `public/`: everything in `public/` is served to the internet.
- Load each approved snapshot with `python scripts/load_db.py --schema`. After
  setup, the `db-load` workflow does this for you (see below).
- Report-card pages are generated at build time. A snapshot loaded into the
  database appears on the cards after the next deploy.

## 3. GitHub settings for the workflows

The repository has two workflows in `.github/workflows/`:

- **`data-refresh.yml`** runs daily at 00:30 UTC (06:00 IST), or by hand. It
  rebuilds and validates the snapshot. When anything changed, it opens a pull
  request for review. Required setting: **Settings → Actions → General →
  Workflow permissions → "Allow GitHub Actions to create and approve pull
  requests"**. Merging that pull request into `main` starts a new Vercel
  production deploy.
- **`db-load.yml`** runs on pushes to `main` that change
  `data/processed/mps.json` or `data/processed/snapshot.json`, or by hand. It
  loads the approved snapshot into YugabyteDB. Required setting: the repository
  secret **`DATABASE_URL`** (Settings → Secrets and variables → Actions), in the
  form `postgresql://<user>:<password>@<cluster-host>:5433/yugabyte?sslmode=verify-full&sslrootcert=certs/root.crt`.
  The certificate path is relative to the repository root, where `certs/root.crt`
  is checked out. Do not add `ssl=true`: the Python driver does not accept it.
  Without the secret, the job's steps are skipped and the site keeps serving the
  JSON snapshot.

## 4. Post-deploy checklist

Replace `$SITE` with the deployed URL.

- [ ] `curl $SITE/api/health` returns `"status":"ok"`, the expected `mpCount`
      and `snapshotDate`, and a `dataSource` and `database.status` that match
      your setup: `json-snapshot` / `not_configured` with no database,
      `yugabytedb` / `ok` with one. A `"status":"degraded"` response means the
      database is configured but not in use: `unreachable` points to a wrong
      `DATABASE_URL` or `DATABASE_CA_CERT`, or an IP allow list that blocks the
      server; `empty` means no snapshot is loaded yet (run
      `python scripts/load_db.py --schema`). The site keeps working on the JSON
      snapshot in both cases, so always read this line.
- [ ] `curl "$SITE/api/health?deep=1"` also pings the database: expect
      `"database":{"configured":true,"status":"ok","reachable":true,"latencyMs":…}`.
- [ ] A report card loads, e.g. `$SITE/mp/new-delhi-delhi`, with its sources and dates shown.
- [ ] An old slug redirects: `curl -I $SITE/mp/new-delhi` returns `308` with
      `location: /mp/new-delhi-delhi`.
- [ ] An unknown page returns the 404 page: `curl -i $SITE/mp/no-such-seat`
      returns `404`, and the HTML includes the "We couldn't find that page"
      heading and the search box.
- [ ] `$SITE/sitemap.xml` lists `/`, `/about`, `/compare`, `/explore` and every
      `/mp/<slug>`, all under `NEXT_PUBLIC_SITE_URL`.
- [ ] `$SITE/robots.txt` allows all crawlers and points to `$SITE/sitemap.xml`.
- [ ] If Gemini is configured, "Explain simply" on a card returns a summary.
      If it is not configured, you see the template summary.
