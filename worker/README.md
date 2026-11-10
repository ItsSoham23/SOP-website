# Environmental Futures API

This Cloudflare Worker stores story metadata in Supabase PostgreSQL, uploads original files to the private `story-files` Supabase Storage bucket, serves public stories, and creates an admin-only ZIP export.

## Setup

1. Use the Supabase project URL `https://osxkimajjqvdvaifcqoe.supabase.co` and create the private `story-files` bucket.
2. Run [`schema.sql`](./schema.sql) in the Supabase SQL editor.
3. Install dependencies with `npm install`.
4. Set the Worker secrets listed in [`wrangler.toml`](./wrangler.toml).
5. Set `ALLOWED_ORIGIN` to the deployed Cloudflare Pages URL.
6. Deploy with `npm run deploy`.

The admin export uses the `x-admin-token` header. Set `SESSION_SECRET` to a long random value and keep it private. This intentionally keeps the first version small; put the token behind a password-protected admin tool or Cloudflare Access before sharing it.
