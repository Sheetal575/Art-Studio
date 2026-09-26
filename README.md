# Artist Portfolio — Next.js

A Next.js (App Router + TypeScript) portfolio site: hero, a filterable masonry work
grid, a zoom/pan lightbox, about, and contact sections, with a light/dark theme
toggle — plus a password-protected `/studio` page for uploading and managing artwork.

## Project structure

```
app/
  layout.tsx         Root layout: fonts, metadata, pre-paint theme script
  page.tsx            Assembles the public page, reading artwork fresh on each request
  globals.css         Public site styles (hand-written, not Tailwind)
  studio/
    layout.tsx         Studio-only layout, loads Tailwind (scoped to this route)
    studio.css          Tailwind v4 entrypoint + shadcn-style theme tokens
    page.tsx            The studio dashboard (protected)
    login/page.tsx      Password login page (public)
  api/studio/
    login/route.ts      Checks the password, sets the session cookie
    logout/route.ts      Clears the session cookie
    artworks/route.ts     POST — upload a new artwork
    artworks/[id]/route.ts PATCH (edit) / DELETE
components/
  Header.tsx, Hero.tsx, Gallery.tsx, Lightbox.tsx, About.tsx, Contact.tsx, Footer.tsx
  studio/
    LoginForm.tsx        Password form
    StudioDashboard.tsx  Upload form + artwork grid with edit/delete
  ui/                  shadcn-style primitives (button, input, dialog, select, ...)
lib/
  artworks.ts          Types + getArtworks() (reads the artworks table in Supabase)
  supabase.ts          Server-only Supabase client (service_role key)
  studio-auth.ts       Session cookie signing/verification (used by middleware + login route)
  studio-upload.ts     Image validation + upload/delete against Supabase Storage
  utils.ts             cn() helper for the ui/ components
middleware.ts          Protects /studio and /api/studio/* behind the password
```

## Edit your content

- **Artwork list**: go to `/studio` and use the upload/edit/delete UI. Changes write
  straight to Supabase (both the `artworks` table and the image file in Storage) and
  show up on the public site immediately — no rebuild or restart needed.
- **About/contact copy**: edit `components/About.tsx` and `components/Contact.tsx`.
- **Portrait**: edit `PORTRAIT_SRC` in `lib/artworks.ts` (this one stays a bundled
  static asset in `public/artsworks/`, not part of the database — it's the site's own
  fixed image, not something managed through `/studio`).

## Data & storage: Supabase

All artwork data lives in Supabase — nothing is stored on the app server's local disk.

- **`artworks` table** (Postgres): one row per artwork — `title`, `category`, `medium`,
  `size`, `year`, `description`, and `images` (a `text[]` of image URLs; `images[0]` is
  the cover shown in the grid and lightbox — a single-element array today, but already
  shaped for a future multi-image view per artwork).
- **`artworks` Storage bucket**: the actual image files, served via their public URL.

**Security**: Row Level Security is enabled on the `artworks` table with zero
policies, so the public API key can neither read nor write it — reads happen only
from server components, writes only through the password-gated `/api/studio/*`
routes, both using the `service_role` key (`SUPABASE_SERVICE_ROLE_KEY`, server-only,
never sent to the browser — it bypasses RLS by design, so it must never leak). The
Storage bucket is public for *reads* (so images load on the site) but has no write
policies, so uploads/deletes only happen server-side the same way.

## The `/studio` page

A private page for managing artwork without touching code.

1. Set a password: copy `.env.local.example` to `.env.local` and set `STUDIO_PASSWORD`
   (a default random one was generated for you in `.env.local` the first time this was
   set up — change it to whatever you like).
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the same file (from your
   Supabase project's Settings → API).
3. Restart `npm run dev` after changing either.
4. Visit `/studio` — you'll be redirected to `/studio/login`. Enter the password to get
   a session cookie (valid 7 days).
5. Upload artwork (title, category, medium, size, year, description, image) — it's
   stored in Supabase. Edit or delete any existing piece from the same page.

The `/studio` UI is built with Tailwind CSS + shadcn-style components
(`components/ui/`), loaded only on `/studio` routes so it never affects the public
site's hand-written styles in `app/globals.css`.

## Run locally

```bash
npm install
cp .env.local.example .env.local   # then set STUDIO_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Then open http://localhost:3000, and http://localhost:3000/studio for the studio.

## Deploying

Since all data and image storage live in Supabase rather than on local disk, this now
deploys cleanly to serverless platforms (Vercel, etc.) as well as a persistent server —
just set the same three environment variables in the host's dashboard.
