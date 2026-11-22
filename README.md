# Adam Todo Portal

VueJS frontend with Supabase Auth and Supabase PostgreSQL.

## Local setup

```bash
cd "C:\Users\ASUS TUF GAMING\Documents\adamTodoPortal"
copy .env.example .env
```

Edit `.env` with the Supabase project URL and anon key. Never put a service-role key in the frontend.

Run `supabase/schema.sql` in Supabase Dashboard > SQL Editor, then:

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5175

## Supabase setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Copy Project URL and anon/public key from Project Settings > API into `.env`.
4. For email confirmation during testing, configure Authentication > Providers > Email as preferred.
5. For production, configure the Site URL and redirect URLs to your deployed GitHub/Supabase frontend URL.

## Deploy later

This is a Vite frontend with Vercel Serverless API functions. Deploy it to Vercel from GitHub. Supabase provides authentication and PostgreSQL; the browser/API uses the public anon key with Row Level Security protecting each user's rows.

## Vercel API

Endpoints:

- `GET /api/health` - public health check.
- `POST /api/auth/register` - create a Supabase Auth account.
- `POST /api/auth/login` - login with email/password and receive a bearer token.
- `GET /api/auth/me` - return the authenticated account and `public.users` profile.
- `GET /api/todos` - list the authenticated user's todos.
- `POST /api/todos` - create a todo with `{ "title": "..." }`.
- `PATCH /api/todos` - update with `{ "id": "...", "completed": true }` or a title.
- `DELETE /api/todos` - delete with `{ "id": "..." }`.

Protected endpoints require:

```text
Authorization: Bearer <Supabase access token>
```

Add these Vercel Environment Variables before deployment:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
```

Use the Supabase URL and public anon key. Never add the Supabase service-role key to frontend or Vercel client-exposed variables.
