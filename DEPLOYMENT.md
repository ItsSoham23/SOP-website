# Deployment

The current deployment uses Vercel Functions and Neon. The Cloudflare Worker files are retained as an older alternative and are not used by the Vercel deployment.

The website is a Vercel deployment with API functions in the `api/` directory.

## 1. Deploy the website

Connect this repository to Vercel. No build command is required.

## 2. Configure Neon

Connect Neon through the Vercel Marketplace and run [`worker/schema.sql`](./worker/schema.sql) in the Neon SQL editor. The schema creates the `stories` table and stores small uploaded files directly in PostgreSQL.

## 3. Configure environment variables

Add these in Vercel Project Settings → Environment Variables:

```text
DATABASE_URL=<Neon connection string>
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD=<strong admin password>
SESSION_SECRET=<long random secret>
```

The API also accepts `POSTGRES_URL` or `NEON_DATABASE_URL` if that is the variable name provided by the integration.

## 4. Redeploy and test

Push the repository to GitHub. Vercel will deploy the `api/` functions automatically. Test `/submit.html`, `/stories.html`, and `/admin.html`.

## Moving hosts later

The frontend only depends on the documented `/api` endpoints. The frontend uses relative `/api` requests, and the database access is isolated in `api/_lib/db.js`, so the backend can later move to another Node host without changing the public page structure.
