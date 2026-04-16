# Deploying Pilgrim Protect to DigitalOcean App Platform

This document describes how to deploy the Pilgrim Protect monorepo (`api/`
Express backend + `web/` Next.js donor site) to DigitalOcean App Platform.
Deployment is triggered from the DO dashboard; all configuration lives in
`.do/app.yaml`.

> **TL;DR** — push to `main` → DO detects `.do/app.yaml` → both services build
> and deploy. First-time setup takes ~15 minutes.

## 1 · Prerequisites

- A DigitalOcean account with billing enabled
- The repository pushed to GitHub (`Jturagavou/pilgrim-protect`)
- A GitHub → DO connection authorized for the repo
- The following managed services or accounts:
  - A MongoDB database — easiest: **DO Managed MongoDB** (~$15/mo for a dev
    cluster). You can also point at MongoDB Atlas.
  - A Cloudinary account (free tier is fine)
  - A Stripe account (use test keys for the staging preview)
  - A Mapbox account (public token)
  - A Brevo (ex-Sendinblue) account for transactional email
  - A Sentry project (one for `api`, one for `web`) — optional but highly
    recommended

## 2 · First-time deploy (DO dashboard)

1. Log in at <https://cloud.digitalocean.com/apps> → **Create App**.
2. Pick **GitHub** as the source, select `Jturagavou/pilgrim-protect`,
   branch `main`, and enable **Deploy on Push**.
3. DO detects `.do/app.yaml` and pre-populates two services (`api` + `web`).
   Leave the auto-detected settings alone unless you want to change region or
   instance size.
4. Click **Edit → Environment Variables** and fill in every secret marked
   `type: SECRET` in the spec:

   | Secret | Where to get it |
   |---|---|
   | `MONGODB_URI` | DO Managed Mongo → Connection Details, or Atlas connection string |
   | `JWT_SECRET` | Generate: `openssl rand -hex 32` |
   | `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API keys (secret key) |
   | `STRIPE_PUBLISHABLE_KEY` | Same page (publishable key) — exposed to the browser |
   | `CLOUDINARY_*` | Cloudinary dashboard → Account Details |
   | `BREVO_API_KEY` | Brevo dashboard → SMTP & API → API Keys |
   | `MAPBOX_TOKEN`, `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox account → Tokens |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
   | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | Sentry project → Settings → Client Keys |
   | `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | Sentry → required only for source-map upload at build |

   Every secret is stored encrypted at rest. DO rotates the encryption keys on
   a rolling basis — you never see plaintext after entering it.

5. Click **Create Resources**. First build takes 5–10 minutes (npm install is
   the long part). Watch the **Runtime Logs** tab for errors.

6. Verify:
   - `https://<your-app-name>.ondigitalocean.app/health` → returns
     `{ "status": "ok", "version": "v1", ... }`
   - `https://<your-app-name>.ondigitalocean.app/` → loads the donor site
   - `https://<your-app-name>.ondigitalocean.app/api/v1/schools` → returns an
     array

## 3 · Custom domain (GoDaddy DNS)

After the first deploy, DO provides CNAME targets under **Settings → Domains**.
Add these to GoDaddy:

| Host | Type | Points to | Notes |
|---|---|---|---|
| `@` (apex) | A/ALIAS | DO's apex target (shown in DO dashboard) | Use **Forwarding → ANAME/ALIAS** in GoDaddy; if unsupported, use A record with DO's IP |
| `www` | CNAME | `<your-app-name>.ondigitalocean.app` | |

Propagation takes up to an hour. DO auto-issues a Let's Encrypt certificate as
soon as DNS is verified.

## 4 · Streaming logs

Install `doctl` once:

```bash
brew install doctl
doctl auth init   # paste a DO API token with read/write on apps
```

Then:

```bash
# Find the app ID
doctl apps list

# Tail structured JSON logs from the api service
doctl apps logs <app-id> --type=run --component=api --follow

# Web service
doctl apps logs <app-id> --type=run --component=web --follow

# Build logs from the last deploy
doctl apps logs <app-id> --type=build --component=api
```

Logs are Pino JSON — pipe through `pino-pretty` for readable output:

```bash
doctl apps logs <app-id> --type=run --component=api --follow | npx pino-pretty
```

## 5 · Rollback

DO keeps every successful deploy. In the dashboard → **Activity** tab, pick
any previous deploy and click **Rollback**. Rollback completes in ~30 seconds
(it reuses the existing build artifact, no re-build needed).

From the CLI:

```bash
doctl apps deployments list <app-id>
doctl apps create-deployment <app-id> --force-rebuild=false  # re-runs latest
# or: promote a specific prior deploy
doctl apps create-deployment <app-id> --commit-hash <sha>
```

## 6 · Cost estimate

| Component | Size | Monthly |
|---|---|---|
| `api` service | basic-xxs (512 MB / 1 vCPU) | ~$5 |
| `web` service | basic-xxs | ~$5 |
| DO Managed MongoDB (dev) | 1 GB RAM | ~$15 |
| Bandwidth | First 100 GB | Free |
| TLS certificates | Let's Encrypt | Free |
| **Total (with Mongo)** |  | **~$25/mo** |
| **Total (Mongo Atlas free tier)** |  | **~$10/mo** |

Scale up each service with a dropdown in the dashboard — no re-deploy needed.

## 7 · Environment variables reference

Full list lives in `.do/app.yaml`. Local dev reads from `api/.env` and
`web/.env.local`, following `api/.env.example` / `web/.env.example`.

## 8 · CI/CD

`deploy_on_push: true` is set for both services, so every merge to `main`
triggers a redeploy. Use a protected branch + PR reviews on GitHub to gate
who can ship.

For preview deployments of PRs, enable **Preview Apps** in the DO dashboard
(Settings → App Platform → Preview Apps). DO builds a short-lived copy of
the stack per PR at `<app>-<pr-number>-preview.ondigitalocean.app`.

## 9 · Troubleshooting

| Symptom | Fix |
|---|---|
| `/health` returns 404 | API didn't boot — check runtime logs for Mongo connection errors |
| CORS blocked in browser | Confirm `ALLOWED_ORIGINS` env on the api matches the web domain |
| Source-maps missing in Sentry | Set `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` on the `web` service |
| Web build fails on `npm ci` | Ensure `web/package-lock.json` is committed and matches package.json |
| `MONGODB_URI is not defined` | Secret wasn't set during app creation — add it in Settings → App-Level Env Vars |

## 10 · Other hosting targets

This repo has no Vercel or Railway configuration — DO App Platform is the
sole deployment target. If you need to stage elsewhere temporarily, build
locally and use `doctl apps create-deployment` to push to a second DO app
rather than reintroducing another platform's config.
