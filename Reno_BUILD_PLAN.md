# Reno — Build Plan (Phases 1–20)

> Autonomous execution guide for Claude Code. Build the full Reno contractor platform from scratch.
> **Read these first and treat them as the source of truth:**
> - `Reno_CONTEXT.md` — architecture, data model, module inventory, golden rules, page/route map.
> - `Reno_UI_REFERENCE.html` — the working visual/UX reference (open it; it's the design + interaction spec).
> - `Reno_BUILD_PLAN.md` — this file (phases, commits, file manifest).

---

## How to run this

1. Execute phases **in order, one phase at a time**. Don't start a phase until the previous one is committed and the app still runs.
2. Make **many small, logical commits** — conventional-commit style (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, `ci:`, `style:`, `refactor:`). Target ~80–120 commits total; the lists below are the floor, split further if a step is big.
3. **No external API keys until Phases 18–20.** Everything in Phases 1–17 must run locally with **stubs / mocks / local equivalents** (local Postgres, dev auth, local file storage, a stubbed AI responder, fake "pay online" + fake accounting sync). The app must be fully clickable end-to-end before any real integration is wired.
4. When you reach Phases 18–20 and need a key, **stop and ask the user for it** (list the exact env var). Never invent or commit secrets. Keep a `.env.example` updated every time you add a variable.
5. After each phase, update `README.md` with what now works.

### Golden rules (from `Reno_CONTEXT.md`)
Functional clone, not a brand clone (Reno's own identity — never Foreman's logo/colors/copy). Working product, not a landing page. Web-first. Multi-tenant + role-scoped from day one. AI is an optional layer, never required for a feature to work. Official integration APIs only. **No pricing page, no "Book a Demo"** — every CTA opens the app.

### Stub strategy (so Phases 1–17 need zero keys)
| Concern | Phases 1–17 (local/stub) | Phase that goes live |
|---|---|---|
| Auth / orgs | dev session provider behind an `AuthProvider` interface | 18 (Clerk) |
| Database | local Postgres (docker) | 18 (Neon) |
| File storage | local disk adapter behind a `Storage` interface | 19 (S3/R2) |
| Email | console/preview "outbox" | 19 (Resend) |
| AI assistant | scripted project-aware responder | 19 (Anthropic) |
| Background jobs | in-process queue | 19 (Inngest) |
| Payments | fake "mark as paid" | 20 (Stripe) |
| Accounting sync | fake "synced" badge | 20 (QuickBooks) |

---

## PHASE 1 — Repo scaffold & tooling
**Goal:** an empty Next.js app that lints, type-checks, tests, and builds in CI. No features.
**Read:** `Reno_CONTEXT.md` (Tech stack, Repo structure).
**Done when:** `pnpm dev` runs; CI is green.
- `chore: initialize Next.js 15 app router project with typescript`
- `chore: configure tailwind + postcss`
- `chore: add shadcn/ui and base config`
- `chore: add eslint + prettier + lint-staged + husky pre-commit`
- `chore: add vitest (unit) and playwright (e2e) configs`
- `ci: add github actions for lint, typecheck, and test`
- `docs: add README and reference Reno_CONTEXT.md / Reno_UI_REFERENCE.html`

## PHASE 2 — Design system & UI primitives
**Goal:** Reno's brand tokens and the reusable components, ported from the prototype.
**Read:** `Reno_UI_REFERENCE.html` (the `:root` tokens block + component styles).
**Done when:** a `/styleguide` page shows every primitive in Reno's brand.
- `feat: add Reno design tokens (brand blueprint-blue, amber, neutrals, radius)`
- `feat: load Space Grotesk, Inter, and JetBrains Mono`
- `feat: add Button, Card, Pill/Badge, Input/Field primitives`
- `feat: add Table, Tabs, Dialog/Modal, Toast, Dropdown primitives`
- `feat: add theme provider and global styles`
- `feat: add /styleguide reference page`

## PHASE 3 — App shell, routing & marketing/app split
**Goal:** route groups, sidebar/topbar, and placeholder pages for every destination.
**Read:** `Reno_CONTEXT.md` (Page & route map); `Reno_UI_REFERENCE.html` (sidebar + topbar).
**Done when:** you can navigate the whole app skeleton; mobile nav works.
- `feat: add (marketing) and (app) route groups + layouts`
- `feat: build app sidebar navigation with sections`
- `feat: build app topbar with search + new-project + notifications`
- `feat: add active-route states and breadcrumb/back affordances`
- `feat: add responsive mobile nav (drawer)`
- `feat: stub all /app/* routes with empty page shells`

## PHASE 4 — Marketing landing pages
**Goal:** port the full landing page from the prototype to React — no pricing, no demo.
**Read:** `Reno_UI_REFERENCE.html` (entire `#site` section).
**Done when:** landing matches the reference and every CTA opens `/app`.
- `feat: build hero + bid→built spine`
- `feat: build trust bar and AI/takeoff/budget→proposal feature sections`
- `feat: build e-sign/invoice/schedule/files+RFI feature sections`
- `feat: build all-features grid and who-we-serve`
- `feat: build CTA band and footer (no pricing, no book-a-demo)`
- `feat: wire every CTA + feature button to the relevant /app route`
- `a11y: keyboard focus, alt text, and reduced-motion on marketing`

## PHASE 5 — Data model, local DB & seed
**Goal:** the full Prisma schema, a local Postgres, and seed data drawn from the prototype.
**Read:** `Reno_CONTEXT.md` (Prisma data model); `Reno_UI_REFERENCE.html` (the `DATA` object = seed shape).
**Done when:** `prisma studio` shows seeded orgs/projects/budgets; repo layer is typed.
- `feat: add prisma + local postgres via docker-compose`
- `feat: model Organization, Membership, Contact, Project`
- `feat: model Budget, BudgetSection, LineItem, CostCatalogItem`
- `feat: model Proposal, Signature, Document, Request/RFI`
- `feat: model ScheduleTask, Dependency, Invoice, Payment`
- `feat: model PurchaseOrder, VendorBill, BidRequest, AIThread, ActivityLog`
- `feat: add seed script using Reno_UI_REFERENCE sample data`
- `feat: add typed repository layer + zod validators`

## PHASE 6 — Dev auth, multi-tenancy & roles
**Goal:** org-scoped data and role gates — all local, no Clerk yet.
**Read:** `Reno_CONTEXT.md` (Multi-tenancy & security).
**Done when:** all queries are tenant-scoped; switching org changes data; roles gate actions.
- `feat: add dev auth provider behind an AuthProvider interface`
- `feat: add org context + tenant-scoping in the repository layer`
- `feat: add role gates (owner / admin / member)`
- `feat: wire org switcher and user menu to dev session`
- `test: tenant-isolation unit tests`

## PHASE 7 — Contacts / CRM
**Goal:** the construction address book.
**Read:** `Reno_CONTEXT.md` (Module: CRM); `Reno_UI_REFERENCE.html` (Contacts view).
**Done when:** create/edit/list contacts of each type with validation.
- `feat: contacts list + table + type filters`
- `feat: contact detail drawer with linked projects + activity`
- `feat: create/edit contact form with zod validation`
- `feat: contact types (client/sub/vendor) + tags`
- `test: contacts CRUD tests`

## PHASE 8 — Projects, project hub & dashboard
**Goal:** the project list, the tabbed hub shell, the overview tab, and the home dashboard.
**Read:** `Reno_UI_REFERENCE.html` (Projects, Project hub tabs, Dashboard).
**Done when:** dashboard stats are real; hub tabs route correctly.
- `feat: projects list with status pills + search`
- `feat: project hub shell with tabbed navigation`
- `feat: project overview tab (financial summary + recent activity)`
- `feat: dashboard stats, active projects, and assistant summary card`
- `feat: new-project creation flow`
- `test: hub navigation + dashboard aggregation tests`

## PHASE 9 — Budget builder
**Goal:** the spine — an editable, section-based budget with live totals and margin.
**Read:** `Reno_CONTEXT.md` ("numbers carry forward"); `Reno_UI_REFERENCE.html` (Budget tab — `rBudget`/`upd`).
**Done when:** editing qty/cost recomputes line/section/grand totals and persists.
- `feat: render budget sections + line items from db`
- `feat: editable grid for name/qty/unit/unit-cost`
- `feat: live line, section, and grand-total recompute`
- `feat: per-line margin + add/remove rows and sections`
- `feat: persist edits with optimistic autosave`
- `test: budget math + rounding + totals tests`

## PHASE 10 — Cost catalog
**Goal:** reusable cost codes that feed budgets (and later POs/bills).
**Read:** `Reno_CONTEXT.md` (Module: Cost Catalog); `Reno_UI_REFERENCE.html` (Cost catalog view).
**Done when:** a catalog item can be inserted into a budget as a line.
- `feat: cost catalog list + codes + units`
- `feat: create/edit cost code with default unit + cost`
- `feat: insert catalog item into a budget section`
- `feat: keep catalog↔line linkage for future mapping`
- `test: catalog + insert tests`

## PHASE 11 — Proposals
**Goal:** generate a branded, client-facing proposal from a budget.
**Read:** `Reno_CONTEXT.md` (Module: Proposals); `Reno_UI_REFERENCE.html` (Proposal tab — `rProposal`).
**Done when:** "Generate" snapshots the budget into a proposal with a status lifecycle.
- `feat: generate proposal snapshot from current budget`
- `feat: branded proposal preview (sections + scope)`
- `feat: proposal status (draft/sent/signed) + proposals list page`
- `feat: server-side proposal PDF export`
- `test: proposal generation + snapshot tests`

## PHASE 12 — E-signatures & signer portal
**Goal:** in-house signing on proposals/agreements, plus the passwordless signer route.
**Read:** `Reno_CONTEXT.md` (Modules: E-Signatures, Portals; routes `/sign/[token]`); `Reno_UI_REFERENCE.html` (signature modal — `openSign`/`doSign`).
**Done when:** a client opens a tokenized link, signs on canvas, and it's sealed to the record.
- `feat: signature pad component with capture + clear`
- `feat: recipient model + send-for-signature flow`
- `feat: public passwordless signer route /sign/[token]`
- `feat: signature audit trail + sealed/immutable record`
- `feat: post-sign status update + notification hook (stub)`
- `test: end-to-end signing flow (stub email)`

## PHASE 13 — Documents, files & Requests/RFIs
**Goal:** project document hub and the request system (RFIs, change orders, lien waivers).
**Read:** `Reno_CONTEXT.md` (Modules: Files, Requests); `Reno_UI_REFERENCE.html` (Documents/Requests tabs).
**Done when:** upload + view PDFs locally; RFIs thread with status history.
- `feat: local file storage adapter behind a Storage interface`
- `feat: files list with type badges + upload`
- `feat: page-by-page PDF viewer (pdf.js)`
- `feat: request/RFI model + threaded replies + status history`
- `feat: change-order and lien-waiver request types`
- `test: documents + requests tests`

## PHASE 14 — Takeoffs
**Goal:** measure on blueprints in the browser and push quantities into the budget.
**Read:** `Reno_CONTEXT.md` (Module: Takeoffs); `Reno_UI_REFERENCE.html` (Takeoff tab — `initTk`/`drawPlan`/`pushTk`).
**Done when:** set scale, measure area/length/count on a PDF, send results to a budget line.
- `feat: render plan pages to canvas via pdf.js`
- `feat: scale calibration tool`
- `feat: area / length / count measurement tools (Konva)`
- `feat: takeoff list + push quantities to budget line items`
- `test: measurement math + push-to-budget tests`

## PHASE 15 — Scheduling & critical path
**Goal:** Gantt with dependencies and automatic critical-path computation.
**Read:** `Reno_CONTEXT.md` (Module: Scheduling); `Reno_UI_REFERENCE.html` (Schedule tab — `gantt()`).
**Done when:** tasks render on a Gantt, CPM marks the critical path, "Today" line shows.
- `feat: task + dependency model wiring`
- `feat: Gantt render (week columns + task bars)`
- `feat: critical-path (CPM) computation`
- `feat: today marker + calendar-view toggle`
- `feat: drag to adjust dates + draw dependency links`
- `test: CPM algorithm unit tests`

## PHASE 16 — Client invoices, vendor POs/bills & bid requests
**Goal:** the money modules (payment + accounting still stubbed).
**Read:** `Reno_CONTEXT.md` (Modules: Client Finances, Purchase Orders, Vendor Finances, Bid Requests); `Reno_UI_REFERENCE.html` (Invoices view + invoice tab).
**Done when:** progress invoices generate from budget; POs/bills/bid-requests work end-to-end with fake pay/sync.
- `feat: progress invoice from budget + status lifecycle`
- `feat: invoices list + per-project invoices + stub "pay online"`
- `feat: purchase orders (send for signature, ordered vs delivered)`
- `feat: vendor bills + stub pay + project profit roll-up`
- `feat: bid requests (one scope → many subs) + compare responses`
- `test: invoice + PO + profit math tests`

## PHASE 17 — AI assistant (stub), notifications, activity & polish
**Goal:** the assistant UI, system-wide states, and the golden-path test — all without external services.
**Read:** `Reno_CONTEXT.md` (AI layer design); `Reno_UI_REFERENCE.html` (AI page — `vAI`/`aiSend`).
**Done when:** the full bid→built flow passes e2e; every screen has empty/loading/error states.
- `feat: assistant chat UI with project-aware stubbed responses`
- `feat: dashboard insights sourced from the stubbed assistant`
- `feat: in-app notifications + activity-log feed`
- `feat: empty, loading, and error states across all modules`
- `a11y: focus order, labels, contrast, and reduced-motion pass`
- `test: golden-path e2e (budget → proposal → sign → invoice)`

---
# INTEGRATIONS — API KEYS START HERE (Phases 18–20)
> Pause at each `chore:` env step and ask the user for the listed key. Update `.env.example`. Never commit secrets.

## PHASE 18 — Auth & database go-live (Clerk + Neon)
**Goal:** replace the dev stubs with real auth and a production database.
**Read:** `Reno_CONTEXT.md` (Auth, Multi-tenancy).
**Keys needed:** `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL` (Neon).
- `feat: integrate Clerk (orgs + roles) behind the existing AuthProvider`
- `chore: add CLERK_* to env + .env.example (prompt user for keys)`
- `refactor: migrate dev sessions → Clerk + tenant middleware`
- `feat: provision Neon and point DATABASE_URL at production`
- `chore: run prisma migrate deploy + production-safe seed`
- `test: auth + tenant-isolation e2e against live providers`

## PHASE 19 — Storage, email, live AI & background jobs (S3/R2 + Resend + Anthropic + Inngest)
**Goal:** swap the remaining stubs for real services.
**Read:** `Reno_CONTEXT.md` (Files, AI layer + eval gates, Reminders/jobs).
**Keys needed:** `S3_*`/`R2_*`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `INNGEST_*`.
- `feat: swap local storage → S3/R2 with presigned uploads`
- `chore: add storage env + .env.example (prompt user)`
- `feat: integrate Resend for signer + invoice emails`
- `chore: add RESEND_API_KEY + email templates (prompt user)`
- `feat: wire Anthropic via Vercel AI SDK for the real assistant`
- `chore: add ANTHROPIC_API_KEY + AI eval gate + guardrails (prompt user)`
- `feat: add Inngest jobs (payment reminders, sync, daily digest)`

## PHASE 20 — Payments, accounting & deploy (Stripe + QuickBooks + Vercel)
**Goal:** real money movement, real accounting sync, security review, ship it.
**Read:** `Reno_CONTEXT.md` (Client/Vendor Finances, QuickBooks sync, Definition of done).
**Keys needed:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `QBO_CLIENT_ID`, `QBO_CLIENT_SECRET`, plus Vercel project envs.
- `feat: integrate Stripe for invoice pay-online + webhooks`
- `chore: add STRIPE_* env + webhook secret (prompt user)`
- `feat: QuickBooks Online OAuth + customer/item mapping`
- `feat: QBO sync for invoices, payments, and bills + reconcile state`
- `chore: add QBO_* env + Intuit app setup (prompt user)`
- `chore: security review — secrets, RBAC, rate limits, headers, webhooks`
- `ci: configure production env and deploy to Vercel`

---
> Commit-count check: the lists above total ~120 small commits across 20 phases (avg ~6/phase). That meets the 80–120 target; split any step further if it grows.

---

# Full project file manifest

Target layout (Next.js 15 App Router + Prisma). Claude Code creates these as it progresses; this is the map.

```
reno/
├─ README.md
├─ Reno_CONTEXT.md                  # context (architecture/spec)
├─ Reno_BUILD_PLAN.md               # context (this plan)
├─ Reno_UI_REFERENCE.html           # context (UX reference)
├─ package.json  pnpm-lock.yaml  tsconfig.json  next.config.ts
├─ tailwind.config.ts  postcss.config.js  components.json   # shadcn
├─ .eslintrc.cjs  .prettierrc  .gitignore  .env.example
├─ docker-compose.yml               # local postgres (Phase 5)
├─ .github/workflows/ci.yml
├─ playwright.config.ts  vitest.config.ts
├─ prisma/
│  ├─ schema.prisma
│  ├─ seed.ts                       # seeded from Reno_UI_REFERENCE DATA
│  └─ migrations/
├─ public/  (logo.svg, fonts/, og-image.png)
├─ tests/
│  ├─ unit/        (budget-math, cpm, totals, tenancy)
│  └─ e2e/         (golden-path, signing, takeoff)
└─ src/
   ├─ app/
   │  ├─ (marketing)/
   │  │  ├─ layout.tsx   page.tsx            # landing
   │  │  └─ _sections/   (hero, spine, features, cta, footer)
   │  ├─ (app)/app/
   │  │  ├─ layout.tsx                        # sidebar + topbar shell
   │  │  ├─ dashboard/page.tsx
   │  │  ├─ projects/page.tsx
   │  │  ├─ projects/[id]/
   │  │  │  ├─ layout.tsx                      # hub + tabs
   │  │  │  ├─ overview/page.tsx
   │  │  │  ├─ takeoff/page.tsx
   │  │  │  ├─ budget/page.tsx
   │  │  │  ├─ proposal/page.tsx
   │  │  │  ├─ schedule/page.tsx
   │  │  │  ├─ documents/page.tsx
   │  │  │  ├─ requests/page.tsx
   │  │  │  └─ invoices/page.tsx
   │  │  ├─ contacts/page.tsx   contacts/[id]/page.tsx
   │  │  ├─ proposals/page.tsx
   │  │  ├─ invoices/page.tsx
   │  │  ├─ catalog/page.tsx
   │  │  ├─ schedule/page.tsx
   │  │  ├─ purchase-orders/page.tsx
   │  │  ├─ bids/page.tsx
   │  │  ├─ assistant/page.tsx
   │  │  └─ settings/page.tsx                  # company, team, integrations, billing
   │  ├─ (public)/
   │  │  ├─ sign/[token]/page.tsx              # passwordless signer
   │  │  ├─ pay/[token]/page.tsx               # passwordless pay
   │  │  └─ portal/[token]/page.tsx            # client/sub portal
   │  ├─ styleguide/page.tsx
   │  └─ api/
   │     ├─ ai/route.ts                        # stub → Anthropic (P19)
   │     ├─ webhooks/stripe/route.ts           # (P20)
   │     ├─ webhooks/clerk/route.ts            # (P18)
   │     ├─ quickbooks/callback/route.ts       # (P20)
   │     └─ inngest/route.ts                   # (P19)
   ├─ components/
   │  ├─ ui/         (button, card, input, table, tabs, dialog, badge, toast, dropdown…)
   │  ├─ marketing/  (Hero, Spine, FeatureSection, FeatureGrid, CTA, Footer)
   │  └─ app/
   │     ├─ shell/   (Sidebar, Topbar, OrgSwitcher, MobileNav)
   │     ├─ budget/  (BudgetGrid, LineItemRow, Totals)
   │     ├─ proposal/(ProposalPreview, SendForSignature)
   │     ├─ esign/   (SignaturePad, SignerView, AuditTrail)
   │     ├─ takeoff/ (PlanCanvas, ScaleTool, MeasureTools, TakeoffList)
   │     ├─ schedule/(Gantt, TaskBar, TodayMarker, CalendarView)
   │     ├─ finances/(InvoiceList, InvoiceBuilder, POForm, VendorBill, BidCompare)
   │     ├─ documents/(FileList, PdfViewer, RfiThread, RequestForm)
   │     ├─ contacts/(ContactTable, ContactForm, ContactDrawer)
   │     └─ assistant/(ChatPanel, SuggestionChips, MessageRef)
   ├─ lib/
   │  ├─ db.ts                                 # prisma client
   │  ├─ auth/        (provider.ts, dev-auth.ts, clerk.ts [P18], roles.ts)
   │  ├─ storage/     (interface.ts, local.ts, s3.ts [P19])
   │  ├─ email/       (interface.ts, outbox.ts, resend.ts [P19])
   │  ├─ ai/          (assistant.ts stub → anthropic.ts [P19], guardrails.ts, evals.ts)
   │  ├─ jobs/        (queue.ts → inngest.ts [P19])
   │  ├─ payments/    (stub.ts → stripe.ts [P20])
   │  ├─ accounting/  (stub.ts → quickbooks.ts [P20])
   │  ├─ cpm.ts                                # critical-path algorithm
   │  ├─ money.ts                              # totals, margin, rounding
   │  └─ utils.ts  format.ts  tokens.ts        # signed-link tokens
   └─ server/
      ├─ schemas/     (zod: contact, project, budget, proposal, invoice, request…)
      ├─ repositories/(org, contact, project, budget, catalog, proposal, signature,
      │                document, request, schedule, invoice, po, vendorbill, bid, activity)
      └─ services/    (proposal-from-budget, invoice-from-budget, push-takeoff,
                       send-for-signature, qbo-sync [P20], reminders [P19])
```

---

# Claude Code prompt (paste this to kick off)

```
You are building "Reno," a multi-tenant construction-management web app, from scratch and autonomously.

Context files in the repo root — read all three before writing any code, and treat them as the source of truth:
- Reno_CONTEXT.md      (architecture, data model, module inventory, golden rules, route map)
- Reno_BUILD_PLAN.md   (Phases 1–20, the commit lists, and the file manifest)
- Reno_UI_REFERENCE.html (the working visual + interaction reference — open and study it)

Execute Reno_BUILD_PLAN.md exactly:
- Do the phases in order, one at a time. After each phase, make sure the app still runs and commit.
- Make many small, logical commits (conventional-commit style). Aim for 80–120 total.
- Phases 1–17 must run fully locally with stubs/mocks (local Postgres, dev auth, local file
  storage, scripted AI, fake pay/sync). DO NOT add any external API keys or paid integrations
  before Phase 18.
- In Phases 18–20, when a real key/integration is required, STOP and ask me for the exact env
  variable, keep .env.example updated, and never commit secrets.
- Follow the golden rules: functional clone with Reno's own brand (never Foreman's identity),
  no pricing page, no "Book a Demo" — every CTA opens the app.

Start with Phase 1. Tell me the commits you plan to make, then build them.
```
