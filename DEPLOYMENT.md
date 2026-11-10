# Deployment

The website is a static Cloudflare Pages site. The API is a separate Cloudflare Worker so the database layer remains easy to move to another host later.

## 1. Deploy the website

Create a Cloudflare Pages project from this repository and use the repository root as the build output directory. No build command is required.

## 2. Create Supabase resources

Create a Supabase project and run [`worker/schema.sql`](./worker/schema.sql) in its SQL editor. The schema creates the `stories` table and a private `story-files` bucket.

Your Supabase project URL is:

```text
https://osxkimajjqvdvaifcqoe.supabase.co
```

## 3. Deploy the Worker

```powershell
cd worker
npm install
npx wrangler login
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
npm run deploy
```

When prompted for `SUPABASE_URL`, use:

```text
https://osxkimajjqvdvaifcqoe.supabase.co
```

Set `ALLOWED_ORIGIN` in [`worker/wrangler.toml`](./worker/wrangler.toml) to the exact Cloudflare Pages URL and redeploy.

## 4. Connect `/api`

In Cloudflare, route `https://your-pages-domain.example/api/*` to the Worker, or use a Worker custom domain and set `window.EFA_API_BASE` to that API URL before deploying the Pages site. The frontend defaults to `/api`, which is the most portable option.

Open `/admin.html` on the Pages site to sign in and download the ZIP export. Keep the admin credentials and `SESSION_SECRET` private.

## Moving hosts later

The frontend only depends on the documented `/api` endpoints. The Worker uses ordinary HTTP requests to Supabase, so it can later be replaced by an Express, Fastify, or other Node service without changing the database schema or public page structure.
