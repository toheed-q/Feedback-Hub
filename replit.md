# App

A single Next.js (App Router) application — no monorepo of separate services. Frontend pages and backend Route Handlers live together in one app.

## Run & Operate

- `pnpm --filter @workspace/app run dev` — run the Next.js dev server (binds to `$PORT`, defaults to 5000)
- `pnpm run typecheck` — typecheck the app
- `pnpm run build` — typecheck + build the app
- `pnpm --filter @workspace/app run prisma:generate` — regenerate the Prisma client
- `pnpm --filter @workspace/app run prisma:push` — push the Prisma schema to the database (dev only)
- `pnpm --filter @workspace/app run prisma:studio` — open Prisma Studio
- Required env: `DATABASE_URL` — Postgres connection string (currently empty; the user will provide a Supabase connection string later — do not block on it)

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript 5
- Styling: Tailwind CSS v4 + shadcn/ui
- DB: PostgreSQL (Supabase, pending) via Prisma 7 (`prisma-client` generator, `@prisma/adapter-pg`)
- Validation: Zod
- Backend: Next.js Route Handlers under `artifacts/app/app/api/*`

## Where things live

- `artifacts/app/app/` — pages and Route Handlers (App Router)
- `artifacts/app/lib/prisma.ts` — Prisma client singleton (throws a clear error if `DATABASE_URL` is unset)
- `artifacts/app/prisma/schema.prisma` — DB schema (source of truth)
- `artifacts/app/components/` — shadcn/ui components
- `scripts/post-merge.sh` — runs `pnpm install` and conditionally `prisma generate` after task merges

## Architecture decisions

- Migrated from a pnpm monorepo (Express API + Canvas mockup artifacts) to a single Next.js app per user request — everything (frontend + backend) lives in one artifact now.
- The artifact was bootstrapped via the `react-vite` artifact type (only native option) and then its scaffold was replaced with the real Next.js app; only `.replit-artifact/artifact.toml`'s service commands were changed to run Next.js dev/build/start.
- Prisma 7's `prisma-client` generator requires an adapter (`@prisma/adapter-pg`) at all times, even for local dev — `lib/prisma.ts` builds the adapter from `DATABASE_URL` and throws a clear runtime error if it's unset, instead of crashing at import time.

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

- DATABASE_URL should stay empty until the user explicitly provides a Supabase connection string — do not block setup or ask for it proactively.

## Gotchas

- The Replit dev container always has ambient `DATABASE_URL`/`PG*` env vars pointing at a local placeholder Postgres (`helium` host) even when `checkDatabase()` reports "not provisioned" — don't treat its presence as a real, usable database.
- Prisma 7 with the `prisma-client` generator needs `@prisma/adapter-pg` (or another driver adapter) passed to `new PrismaClient({ adapter })` — omitting it throws `PrismaClientConstructorValidationError` even with a valid `DATABASE_URL`.

## Pointers

- See the `artifacts` skill for how the Next.js app is registered and routed as a single artifact.
