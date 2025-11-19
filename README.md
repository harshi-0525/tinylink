TinyLink — Minimal URL Shortener (Next.js + Prisma)

TinyLink is a lightweight URL shortener with a clean dashboard and simple analytics. It lets you:
- Create short links with optional custom codes
- Redirect users from short codes to long target URLs
- View basic stats (total clicks, created time, last clicked)
- Search and manage your links (soft delete)

Built with Next.js App Router (v16), Prisma ORM, and Tailwind CSS v4.

Contents
- Overview
- Tech Stack
- Features
- Data Model
- Routing
- Validation & Behavior
- Setup (Local)
- Deployment
- API Examples
- Project Structure
- Notes & Limitations

Overview
- Purpose: Minimal, fast, single-tenant shortener with basic analytics.
- UI: Dashboard to create/search links, stats page per code.
- Persistence: PostgreSQL via Prisma.

Tech Stack
- Next.js 16 (App Router) with React 19
- Prisma 6 with PostgreSQL
- Tailwind CSS v4
- TypeScript

Features
- Create: Shorten any http(s) URL; optionally supply a custom code.
- Redirect: Visiting `/:code` redirects to the target URL and increments click count.
- Search: Filter by code or target URL (case-insensitive) on the dashboard.
- Stats: Per-link metrics: clicks, createdAt, lastClickedAt, and the short URL.
- Manage: Soft delete links to hide/remove them without losing history.
- Health Check: `/healthz` returns uptime and version.

Data Model (Prisma)
- `Link` fields:
  - `id: String` (UUID, primary key)
  - `code: String` (unique, 6–8 alphanumeric suggested)
  - `targetUrl: String`
  - `clicks: Int` (default 0)
  - `lastClickedAt: DateTime?`
  - `createdAt: DateTime` (default now)
  - `updatedAt: DateTime` (auto-updated)
  - `deletedAt: DateTime?` (soft delete marker)

Routing
- Web Routes
  - `GET /` – Dashboard to create, search and list links (client UI in `app/page.tsx`).
  - `GET /code/[code]` – Stats page for a single short code (client UI in `app/code/[code]/page.tsx`).
  - `GET /[code]` – Redirect handler; looks up the code, increments counters, redirects to `targetUrl` (`app/[code]/route.ts`).
  - `GET /healthz` – Health endpoint with `{ ok, version, uptimeSeconds }` (`app/healthz/route.ts`).

- API Routes (JSON)
  - `GET /api/links?q=...`
    - Lists non-deleted links, optionally filtered by `q` (matches `code` or `targetUrl`, case-insensitive).
    - Returns: `[{ code, url, shortUrl, clicks, lastClickedAt, createdAt }]`.
  - `POST /api/links`
    - Body: `{ url: string; code?: string }`
    - Validates URL and optional custom code; auto-generates a 6-char code if missing (up to 5 attempts to avoid collisions).
    - Returns: `{ code, url, shortUrl, clicks, lastClickedAt, createdAt }` (201) or `{ error }`.
  - `GET /api/links/:code`
    - Returns stats for a single code: `{ code, url, shortUrl, clicks, lastClickedAt, createdAt }` or `404` if not found/soft-deleted.
  - `DELETE /api/links/:code`
    - Soft deletes the link (sets `deletedAt`). Returns `204` or `404`.

Validation & Behavior
- URL validation: Only `http:` and `https:` URLs are accepted.
- Code validation: Alphanumeric only, 6–8 chars (`/^[A-Za-z0-9]{6,8}$/`).
- Code generation: Random 6-char code, up to 5 collision-avoidance attempts.
- Soft delete: Deleted links are excluded from listings, stats, and redirects.
- Redirect side effects: Each redirect increments `clicks` and sets `lastClickedAt`.
- Base URL: API responses include `shortUrl` using `NEXT_PUBLIC_BASE_URL` or `http://localhost:3000`.

Setup (Local)
- Prerequisites
  - Node.js 18+ (Next.js 16 compatible)
  - PostgreSQL database
  - pnpm (recommended) or npm/yarn

- Environment Variables
  - `DATABASE_URL` – PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/tinylink`.
  - `NEXT_PUBLIC_BASE_URL` – Public base URL for building `shortUrl` in API responses (e.g. `http://localhost:3000`).

- Install & Generate
  - Install deps: `pnpm install`
  - Generate Prisma client: `pnpm postinstall` runs `prisma generate` automatically, or run `pnpm prisma generate`.

- Database Migrations
  - Dev: `pnpm prisma migrate dev` (creates and applies migrations)
  - Prod: `pnpm prisma migrate deploy`

- Run Dev Server
  - `pnpm dev`
  - Open `http://localhost:3000`

Deployment
- Vercel
  - Set `DATABASE_URL` and `NEXT_PUBLIC_BASE_URL` in Vercel Project Settings.
  - Add a production Postgres (Vercel Postgres, Neon, Supabase, RDS, etc.).
  - Use a Build Command that installs and builds (pnpm supported). Ensure migrations run (via a deploy hook or `vercel build`/post-start step) using `prisma migrate deploy`.
  - Start command: `next start` (default for Next.js on Vercel’s serverless/edge; API routes run as server functions).

API Examples
- Create a link
  - `curl -X POST http://localhost:3000/api/links -H "Content-Type: application/json" -d '{"url":"https://example.com/article"}'`

- Create with custom code
  - `curl -X POST http://localhost:3000/api/links -H "Content-Type: application/json" -d '{"url":"https://example.com","code":"myBlog1"}'`

- List links (search)
  - `curl 'http://localhost:3000/api/links?q=blog'`

- Get stats for a code
  - `curl http://localhost:3000/api/links/myBlog1`

- Soft delete a code
  - `curl -X DELETE http://localhost:3000/api/links/myBlog1 -i`

Project Structure
- `app/` – App Router pages and routes
  - `page.tsx` – Dashboard UI (create/search/list)
  - `code/[code]/page.tsx` – Stats view for a link
  - `[code]/route.ts` – Redirect handler for short codes
  - `api/links/route.ts` – List + create links API
  - `api/links/[code]/route.ts` – Single-link stats + delete API
  - `healthz/route.ts` – Health endpoint
- `lib/prisma.ts` – Prisma client singleton
- `prisma/` – Prisma schema and migrations
- `prisma.config.ts` – Prisma configuration (schema path, engine, datasource)
- `next.config.ts` – Next.js config
- `app/globals.css` – Tailwind CSS setup (v4)

Notes & Limitations
- Next.js 16 behavior: In these route handlers, `context.params` is awaited (a Promise). This is reflected in the code.
- Custom code length: The UI and API expect 6–8 alphanumeric characters; anything outside that is rejected.
- Soft deletes: Deleted links remain in the DB with `deletedAt` set; they do not resolve or appear in listings.
- Encoding artifacts: Some UI glyphs may appear odd depending on your terminal/font. This does not affect functionality.
- Metadata: `app/layout.tsx` still has default metadata ("Create Next App"); you can update the title/description to match TinyLink.

Scripts
- `pnpm dev` – Run dev server
- `pnpm build` – Build for production
- `pnpm start` – Start production server
- `pnpm lint` – Run ESLint
- `postinstall` – Runs `prisma generate`
