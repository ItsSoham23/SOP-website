# Vercel setup

The site now uses Vercel Functions and Neon. The old `worker/` directory is retained as a historical Cloudflare implementation but is not used by the Vercel deployment.

## Database

Run [`worker/schema.sql`](./worker/schema.sql) in the Neon SQL editor. It creates the `stories` table and stores uploaded files in the `file_data` column.

The API accepts uploaded files up to 4 MB, which keeps requests within a practical serverless limit.

## Environment variables

In the Vercel project settings, add these for Production (and Preview if desired):

```text
DATABASE_URL=<provided by the Neon integration>
ADMIN_EMAIL=<your admin email>
ADMIN_PASSWORD=<a strong password>
SESSION_SECRET=<a long random secret>
```

The Neon integration may name the database variable `POSTGRES_URL`; the API supports `DATABASE_URL`, `POSTGRES_URL`, and `NEON_DATABASE_URL`.

## Deployment

Push the repository to GitHub. Vercel automatically redeploys and discovers the files in `api/`.

Test:

- `/stories.html` for the public archive
- `/submit.html` for submissions
- `/admin.html` for review, deletion, and ZIP export

The admin token is held only in the browser session while the page is open. Keep the admin page private and use HTTPS.
