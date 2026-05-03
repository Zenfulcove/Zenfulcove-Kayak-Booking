# ZenfulCove Kayaks

Public-facing kayak booking webapp for the ZenfulCove cabin rental property.

**Stack:** Next.js 16 (App Router) · React 19 · Supabase (auth + Postgres) · Tailwind 4 · TypeScript.

## Getting started

1. Install deps:
   ```bash
   npm install
   ```

2. Create a Supabase project at <https://supabase.com>, then copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` — project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-side only)

3. Run the schema in the Supabase SQL editor:
   ```
   supabase/sql/0001_init.sql
   ```

4. Seed your fleet (uncomment the seed block at the bottom of the SQL file or insert rows manually into `public.kayaks`).

5. Create an admin user — sign up via Supabase Auth dashboard or run:
   ```sql
   -- after creating the user in Supabase Auth, the profile row is auto-inserted by trigger.
   ```

6. Start the dev server:
   ```bash
   npm run dev
   ```

   - Public site: <http://localhost:3000>
   - Browse + book: `/book`
   - Admin (auth required): `/admin`

## Routes

| Path | Auth | Purpose |
|------|------|---------|
| `/` | public | Landing page |
| `/book` | public | List active kayaks |
| `/book/[kayakId]` | public | Reserve a specific kayak |
| `/book/confirmation/[bookingId]` | public | Reservation receipt |
| `/api/bookings` | public POST | Creates a pending booking |
| `/login` | public | Admin sign in |
| `/admin` | auth | Fleet + bookings dashboard |

## Pending work

- [ ] Stripe Checkout integration (currently `POST /api/bookings` creates a `pending` booking with no payment).
- [ ] Stripe webhook → flip booking to `confirmed` on `checkout.session.completed`.
- [ ] Admin CRUD for kayaks (right now you edit rows directly in Supabase).
- [ ] Email confirmation to the customer.
- [ ] Calendar view of bookings.
- [ ] Cancel/refund flow.

## Notes

- The schema uses a `btree_gist` exclusion constraint to prevent overlapping bookings on the same kayak.
- Public booking writes go through the API route using the **service role key** — RLS on `bookings` only authorizes authenticated admins, so the anon client cannot read or write reservations.
- This codebase intentionally mirrors ZOS conventions (`lib/supabaseClient.ts`, `lib/supabaseServer.ts`, middleware-based auth) but skips its multi-tenant / permissions / i18n layers — single property, one role.
