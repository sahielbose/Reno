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

## Build status

This project is built phase by phase per `Reno_BUILD_PLAN.md`.

### ✅ Phase 1 — Repo scaffold & tooling

- Next.js 15.5 App Router app (TypeScript, `src/` dir, `@/*` import alias, pnpm).
- Tailwind CSS v4 + shadcn/ui base config.
- ESLint 9 (flat config) + Prettier + lint-staged + husky pre-commit.
- Vitest (unit) + Playwright (e2e) with sample tests.
- GitHub Actions CI: lint · typecheck · test · build, plus a Playwright job.

`pnpm dev` runs; `pnpm lint && pnpm typecheck && pnpm test && pnpm build` are green.

## License

Original work. Not affiliated with any other product — a functional UX study
under Reno's own brand.
