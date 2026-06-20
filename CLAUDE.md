# CLAUDE.md — Reno build operating manual

You are building **Reno**, a multi-tenant construction-management web app, from
scratch and autonomously. Repo: `github.com/sahielbose/Reno` (commit to `main`).

## Source of truth — read before writing code

- **`Reno_CONTEXT.md`** — architecture, data model, 15-module inventory, golden
  rules, page/route map.
- **`Reno_BUILD_PLAN.md`** — Phases 1–20, per-phase commit lists, file manifest.
- **`Reno_UI_REFERENCE.html`** — the working visual + interaction prototype (the
  design system, the `DATA` seed shape, and every view's logic).

## Golden rules

1. **Functional clone, original brand.** Reno's own name, logo, blueprint-blue
   palette, copy — never another product's identity.
2. **Working product, not a landing page.** Real CRUD, real flows.
3. **The spine is "numbers carry forward":** Budget → Proposal → Invoice
   (client side) and Cost Catalog → PO → Vendor Bill (vendor side) share data.
4. **AI is an optional layer**, never required for a feature to work.
5. **Multi-tenant from day one** — every row scoped to an Organization.
6. **No pricing page, no "Book a Demo"** — every CTA opens the app.
7. **No external API keys before Phase 18.** Phases 1–17 run fully locally on
   stubs/mocks. In Phases 18–20, stop and ask the user for each key, keep
   `.env.example` updated, never commit secrets.

## How to work

- Execute `Reno_BUILD_PLAN.md` **in order, one phase at a time**. After each
  phase the app must run; then commit.
- **Many small, conventional commits** (`feat:`, `fix:`, `chore:`, `test:`,
  `docs:`, `ci:`). Target 80–120 total.
- Keep `main` green: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
  must pass before committing. A husky pre-commit hook runs lint-staged.

## Design tokens (from the prototype)

Brand `#1E47D8` · brand-700 `#1738ad` · accent (amber) `#F5A524` · ink
`#0E1726` · paper `#F6F7FB` · line `#E4E8F1`. Fonts: Space Grotesk (display),
Inter (body), JetBrains Mono (numbers/data). Radius 14px / lg 22px. Numbers are
always mono + tabular.

## Commands

```bash
pnpm dev         # dev server (Turbopack)
pnpm build       # production build
pnpm lint        # eslint
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest unit
pnpm e2e         # playwright e2e
```

## Progress

- **Phase 1 ✅** — repo scaffold & tooling (Next 15 + TS, Tailwind v4, shadcn/ui,
  eslint/prettier/husky, vitest/playwright, CI).
- Next: **Phase 2** — design system & UI primitives + `/styleguide`.
