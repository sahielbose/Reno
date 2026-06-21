# Reno

**Run every job from first bid to final build.** Reno is a multi-tenant
construction-management web app for residential general contractors,
remodelers, home builders, and the trades — estimating, proposals, e-sign,
scheduling, invoicing, and an AI assistant, all in one place.

> Reno is built as a _functional_ re-creation of the contractor job-to-cash
> workflow under its **own original brand** — its own name, logo, blueprint-blue
> palette, and copy. No pricing page, no "book a demo": every CTA opens the app.

The product spine is **"numbers carry forward"**: a budget flows into a branded
proposal, into progress invoices, and (on the cost side) into purchase orders and
vendor bills — nothing is retyped.

## Source of truth

Three documents in the repo root drive this build — read them before changing
anything:

- [`Reno_CONTEXT.md`](./Reno_CONTEXT.md) — architecture, data model, the 15-module
  inventory, golden rules, and the page/route map.
- [`Reno_BUILD_PLAN.md`](./Reno_BUILD_PLAN.md) — the phased build plan (Phases 1–20)
  with per-phase commit lists and the full file manifest.
- [`Reno_UI_REFERENCE.html`](./Reno_UI_REFERENCE.html) — the working visual +
  interaction prototype (the design system and UX spec).

## Tech stack

| Concern        | Choice                                            |
| -------------- | ------------------------------------------------- |
| Framework      | Next.js 15 (App Router) + TypeScript              |
| Styling        | Tailwind CSS v4 + shadcn/ui                       |
| Icons          | lucide-react                                      |
| Database / ORM | PostgreSQL + Prisma _(local via Docker, Phase 5)_ |
| Auth + tenancy | Dev provider → Clerk Organizations _(Phase 18)_   |
| Tests          | Vitest (unit) + Playwright (e2e)                  |
| Lint / format  | ESLint 9 (flat) + Prettier + husky + lint-staged  |

Phases 1–17 run **fully locally with stubs/mocks** (no external API keys). Real
integrations — Clerk, Neon, S3/R2, Resend, Anthropic, Inngest, Stripe,
QuickBooks — are wired in Phases 18–20.

## Getting started

```bash
pnpm install      # install dependencies
pnpm dev          # start the dev server (Turbopack) at http://localhost:3000
```

### Scripts

| Script               | What it does                |
| -------------------- | --------------------------- |
| `pnpm dev`           | Next dev server (Turbopack) |
| `pnpm build`         | Production build            |
| `pnpm start`         | Serve the production build  |
| `pnpm lint`          | ESLint                      |
| `pnpm typecheck`     | `tsc --noEmit`              |
| `pnpm test`          | Vitest unit tests           |
| `pnpm test:coverage` | Vitest with coverage        |
| `pnpm e2e`           | Playwright end-to-end tests |
| `pnpm format`        | Prettier write              |

A husky pre-commit hook runs `lint-staged` (ESLint + Prettier) on staged files.

## Local database

Phases 5+ need Postgres. Start it and seed:

```bash
docker compose up -d   # Postgres 16 on localhost:5433 (see .env.example)
cp .env.example .env   # then set DATABASE_URL
pnpm db:migrate        # apply migrations
pnpm db:seed           # seed the demo org (Apex Build Co.)
pnpm db:studio         # browse the data
```

## Build status

This project is built phase by phase per `Reno_BUILD_PLAN.md`.
`pnpm lint && pnpm typecheck && pnpm test && pnpm build` are green on every push (CI-verified).

- **✅ Phase 1 — Scaffold & tooling.** Next.js 15.5 App Router + TS, Tailwind v4, shadcn/ui, ESLint/Prettier/husky, Vitest + Playwright, GitHub Actions CI.
- **✅ Phase 2 — Design system.** Reno "blueprint" tokens, Space Grotesk/Inter/JetBrains Mono, the full primitive set (Button, Card, Badge, Input, Table, Tabs, Dialog, Dropdown, Toast), and a `/styleguide` reference page.
- **✅ Phase 3 — App shell & routing.** `(marketing)`/`(app)` route groups, the dark sidebar + topbar, responsive mobile drawer, and every `/app/*` route stubbed and navigable.
- **✅ Phase 4 — Marketing landing.** The full landing page ported from the prototype — hero + bid→built spine, product-mock feature sections, all-features grid, who-we-serve, CTA, footer. Every CTA opens the app; no pricing, no demo.
- **✅ Phase 5 — Data model.** Prisma schema (34 tables, multi-tenant), local Postgres, a prototype-accurate seed, zod validators, and an org-scoped repository layer.
- **✅ Phase 6 — Auth & tenancy.** A dev `AuthProvider` (cookie session over the seeded data), `getOrgContext()` scoping, role gates (owner/admin/member), a working org switcher, and tenant-isolation tests.

_Next: Phase 7 — Contacts / CRM._

## License

Original work. Not affiliated with any other product — a functional UX study
under Reno's own brand.
