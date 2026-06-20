# Reno — Project Context & Build Spec

> **What this file is.** The single source of truth for building **Reno**, a from-scratch functional re-creation of **Foreman** (`foreman.co`, YC W26, formerly "Scout Out"). It is written to be dropped into the repo root and consumed by Claude Code. Save it as `CONTEXT.md` (or rename to `CLAUDE.md` so Claude Code auto-loads it).
>
> **Reference product (what we study):** Foreman — an all-in-one AI project-management + estimating platform for residential construction contractors.
> **What we build:** the same *functionality and UX patterns*, under our **own brand (Reno)**, with **original** name, logo, colors, copy, and assets. We replicate *how it works*, not *who they are*.

---

## 0. Golden rules (read before writing any code)

1. **Functional clone, not a brand clone.** Re-implement the features and UX flows. Do **not** copy Foreman's name, logo, wordmark, color palette, marketing copy, screenshots, fonts, or any proprietary asset. All Reno branding is original. (Their code isn't public anyway — everything here is built fresh.)
2. **Working product, not a landing page.** Every module below must be *usable* — real CRUD, real data, real flows. "Book a demo" is not a deliverable; functioning app pages are.
3. **Web-first.** Ship a responsive web app. Mobile/native comes later; design the API and components so a future mobile client can reuse them.
4. **The spine is "numbers carry forward."** Budget → Proposal → Invoice (client side) and Cost Catalog → PO → Vendor Bill (vendor side) must share data so nothing is retyped. This data-continuity is the core product insight — get it right.
5. **AI is a feature layer, not the foundation.** The app must be fully functional with AI off. AI augments (takeoff assist, estimate drafting, proposal copy, the assistant) — it never gates core CRUD.
6. **Multi-tenant from day one.** Every row is scoped to an Organization (a contractor company). Never leak data across orgs.
7. **Use official integration APIs only.** QuickBooks via Intuit's official API, payments via Stripe — respect each provider's ToS. No scraping.
8. **Information, not professional advice.** AI estimates/takeoffs are drafts a human reviews and edits — never presented as a certified estimate, appraisal, or legal document. Keep edit-and-override everywhere.

---

## 1. Product overview

### 1.1 What Foreman does (the teardown)
Foreman replaces the spreadsheet/email/sticky-note patchwork that residential contractors use to run jobs. It manages the **full lifecycle of a construction job, from first estimate to final invoice**, in one place:

- A contractor creates a **project** tied to a **client**.
- They build a **budget** section by section, optionally pulling quantities from **takeoffs** measured directly on uploaded plan PDFs.
- That budget becomes a **branded proposal** the client reviews and **e-signs** in the browser (no third-party e-sign tool).
- The same budget drives **progress invoices** to the client (paid online, synced to QuickBooks) and **purchase orders / vendor bills** on the cost side (also synced to QuickBooks).
- A **schedule** with a **Gantt + critical-path** view tracks phases; **RFIs/requests** track questions and approvals; a **document hub** keeps plans, permits, photos, and contracts organized per job.
- An **AI assistant** sits across everything — answers questions about projects, drafts messages, surfaces what's at risk.

### 1.2 Target user
Residential general contractors, remodelers, home builders, roofers, and trades — small businesses (often 1–20 people) currently running jobs on spreadsheets + email. Secondary actors: **clients** (homeowners) and **subcontractors/vendors**, who interact through passwordless portals (sign, pay, accept POs, reply).

### 1.3 Their pricing (for reference; ours TBD)
One flat plan, everything included: ~$199.99/mo billed annually (20% off vs monthly), **+$20/seat/mo** for additional team members, free trial, no contract. No feature tiers. We can mirror this "one plan" simplicity later; billing is a late-phase concern.

### 1.4 Reno's positioning
Same job-to-cash workflow for contractors, our brand. MVP target: a contractor can sign up, create a project + client, build a budget (with AI assist + takeoffs), send a proposal, get it signed, invoice the client, and track the schedule — end to end, in the browser.

---

## 2. Full feature inventory (the 15 modules to clone)

Each is a real, usable module. Priority tiers map to the build phases in §9.

| # | Module | What it does (in our words) | Priority |
|---|---|---|---|
| 1 | **CRM (Contacts)** | One address book for clients, subs, and crew. Each contact carries a live history of everything sent (proposals, invoices, POs, messages). | P0 |
| 2 | **Projects / Job Hub** | Every job has a record: client link, address, trade/type, status (lead → bidding → planning → active → closed), and tabs for every other module. | P0 |
| 3 | **Budget** | Section-by-section cost breakdown. Line items with qty, unit, unit cost, line total, and per-line margin/markup. Real-time section + grand totals. The financial spine. | P0 |
| 4 | **Proposals / Client Agreements** | Generate a branded proposal from a budget. Client reviews, signs, and accepts in the browser. Status: draft → sent → viewed → signed. | P1 |
| 5 | **E-Signatures** | Built-in signature capture on proposals, agreements, and POs. No third-party tool, no manual field-placement. Audit trail (who, when, IP). Locks the doc on completion. | P1 |
| 6 | **Takeoffs** | Upload plan PDFs, set scale, and measure areas / lengths / counts directly on the page. Measurements feed quantities straight into the budget. | P2 |
| 7 | **AI Assistant** | Project-aware chat: answer questions about any project, draft messages/emails, summarize, surface risks and overdue items across every module. Streams responses. | P2 |
| 8 | **Scheduling** | Tasks with start/end/duration and dependencies. Gantt chart + calendar view. Auto-computes the **critical path** so you see what actually moves the finish date. | P3 |
| 9 | **Client Finances (Invoicing)** | Issue progress invoices tied to the project/budget. Collect payment online. Sync to QuickBooks. Status: draft → sent → viewed → paid/overdue. | P4 |
| 10 | **Cost Catalog** | Reusable cost codes/items behind every budget, bill, and PO. Mapped to QuickBooks items so totals reconcile. | P4 |
| 11 | **Purchase Orders** | Send POs to vendors for signature; track what's on order vs. what's been delivered. | P5 |
| 12 | **Vendor Finances** | Track vendor bills, record/schedule payments, QuickBooks sync on both sides. Costs-out view per project. | P5 |
| 13 | **Bid Requests** | Send one scope to multiple subs; collect and compare their pricing side by side. | P5 |
| 14 | **Requests (RFIs, lien waivers, etc.)** | Threaded requests with full status history (open → responded → resolved). RFIs, lien waivers, change-order asks. | P6 |
| 15 | **Files & Documents** | Plans, permits, photos, contracts, COIs organized per project. Big PDFs viewable page by page. Everything attaches to the right job. | P1 (basic) → P6 (PDF paging) |
| 16 | **Client & Sub Portals** | Passwordless (magic-link/token) portal where clients sign + pay and subs accept POs + reply. No account required. | P1 (sign) → P4 (pay) → P5 (sub) |

> **Cross-cutting:** notifications/reminders ("nothing falls through the cracks"), an activity log per project, org settings (team, roles, branding for proposals, integrations, billing).

---

## 3. The data-continuity spine (most important architecture decision)

Numbers must flow without re-entry. Model the shared objects so each downstream artifact references upstream data rather than copying it (snapshot only at the moment of "send/sign" for legal immutability).

```
Cost Catalog item ─┐
                   ├─► Budget Line Item ─┬─► Proposal line (snapshot on send)
Takeoff quantity ──┘                     ├─► Client Invoice line (progress %)
                                         └─► Purchase Order line ─► Vendor Bill line
                                                                     │
QuickBooks items  ◄──────────────────────────────────────────────────┘ (two-way sync)
```

Rules:
- A **Budget Line Item** optionally links to a **Cost Catalog** item and may be sourced from a **Takeoff measurement** (quantity auto-fills, stays editable).
- A **Proposal** snapshots budget lines at send time (immutable record) but tracks back to the live budget.
- **Invoices** bill against the budget by progress % or milestone; remaining-to-bill is computed.
- **POs** and **Vendor Bills** consume the same cost codes, so project profit (client revenue − costs-out) is always live.
- The **Cost Catalog ↔ QuickBooks item map** is the reconciliation key for sync.

---

## 4. System architecture

### 4.1 High-level shape
A single **Next.js (App Router)** full-stack application (UI + API in one repo, one deploy), backed by **PostgreSQL via Prisma**, with object storage for files, an AI service layer calling Anthropic, and a background-job runner for async work (AI generation, reminders, QuickBooks sync). Multi-tenant by Organization, enforced in every query.

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Browser (React, RSC + client)                 │
│  Marketing pages · Auth · App shell (sidebar nav) · Module UIs ·       │
│  PDF viewer + canvas takeoff tool · Signature pad · AI chat panel      │
└───────────────┬───────────────────────────────────────┬──────────────┘
                │ Server Actions / Route Handlers        │ Streaming (AI SDK)
┌───────────────▼───────────────────────────────────────▼──────────────┐
│                     Next.js server (App Router)                        │
│  Auth middleware (org + role) · Server Actions (mutations) ·           │
│  /api route handlers (webhooks, signer tokens, AI stream, uploads) ·   │
│  Domain services (budget, proposal, invoice, schedule/CPM, sync)       │
└───┬───────────────┬───────────────┬───────────────┬───────────────────┘
    │ Prisma        │ presigned     │ Anthropic      │ enqueue
┌───▼─────┐   ┌─────▼──────┐   ┌────▼───────┐   ┌────▼─────────────┐
│ Postgres│   │ Object     │   │ Anthropic  │   │ Background jobs   │
│ (Neon)  │   │ storage    │   │ (Claude)   │   │ (Inngest):        │
│ +Prisma │   │ (S3 / R2)  │   │ via AI SDK │   │ AI gen, reminders,│
└─────────┘   └────────────┘   └────────────┘   │ QBO + Stripe sync │
                                                  └───┬───────────────┘
                                   external:          │
                          ┌────────────────┬──────────▼─────┬───────────┐
                          │ Stripe         │ QuickBooks     │ Resend    │
                          │ (invoices/pay) │ Online (Intuit)│ (email)   │
                          └────────────────┴────────────────┴───────────┘
```

### 4.2 Layers
- **Presentation** — React Server Components for data-heavy reads; client components for interactive surfaces (budget editor, takeoff canvas, signature pad, schedule Gantt, AI chat). shadcn/ui + Tailwind.
- **Application/API** — Next.js Server Actions for mutations (typed, colocated); `/api` route handlers for things that need raw HTTP: webhooks (Stripe, QuickBooks), AI streaming, file upload presign, and **public signer/portal endpoints** (token-auth, no Clerk session).
- **Domain services** (`/server/services`) — pure-ish modules: `budget`, `proposal`, `invoice`, `po`, `schedule` (critical-path/CPM), `quickbooks`, `pdf/takeoff`, `ai`. Keep business logic here, not in components.
- **Data** — Prisma over Postgres. Every model has `orgId`; every query filters by it (see §10 multi-tenancy).
- **Async** — Inngest functions for: AI estimate/proposal generation, scheduled reminders + "at-risk" scans, QuickBooks/Stripe reconciliation, email sends that shouldn't block requests.

---

## 5. Tech stack (and exactly how it combines)

> Opinionated defaults chosen for Claude-Code velocity, type-safety end-to-end, and one-provider simplicity where possible. Swap notes included.

| Concern | Choice | Why / how it fits |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | One repo for UI + API. RSC for reads, Server Actions for writes, route handlers for webhooks/streaming. Deploys to Vercel in one shot. |
| UI / styling | **Tailwind CSS + shadcn/ui (Radix)** | Clean modern SaaS look fast; accessible primitives; fully themeable to the Reno brand. |
| Icons | **lucide-react** | Consistent, free. |
| DB | **PostgreSQL (Neon serverless)** | Relational data (projects, budgets, line items, invoices) needs SQL + joins; Neon is serverless-friendly for Vercel. |
| ORM | **Prisma** | Type-safe schema + migrations; the data spine in §3 maps cleanly to relations. |
| Auth + tenancy | **Clerk (Organizations)** | Multi-tenant orgs, roles, invites, sessions out of the box — saves weeks vs. rolling our own. *(Swap: Supabase Auth + RLS, or Auth.js.)* |
| File storage | **AWS S3** *(or Cloudflare R2)* | Plans/photos/PDFs; presigned uploads direct from browser; R2 if egress cost matters. |
| AI | **Anthropic API (Claude) via Vercel AI SDK** | Streaming assistant, estimate/proposal drafting, plan Q&A. AI SDK gives streaming + tool-calling ergonomics. **Verify current model IDs/SDK against Anthropic docs at build time.** |
| PDF render | **pdf.js (`react-pdf`/`pdfjs-dist`)** | Render plan pages in-browser for the document viewer and as the canvas base for takeoffs. |
| Takeoff canvas | **react-konva (Konva)** *(or raw `<canvas>`)* | Draw/measure polygons (area), polylines (length), and point counts over the PDF; scale by a user-set calibration. |
| Signatures | **`signature_pad`** on `<canvas>` | Capture signatures; we store image + audit metadata. Built-in (no DocuSign). |
| Payments | **Stripe (Invoices + Payment Links/Elements)** | Online client payments; webhook → mark invoice paid → enqueue QBO sync. |
| Accounting sync | **QuickBooks Online API (Intuit OAuth2)** | Official two-way sync of invoices, bills, items. Map via Cost Catalog. |
| Email | **Resend** *(+ React Email)* | Transactional: proposal/invoice/PO sends, RFI notifications, reminders, magic links. |
| Background jobs | **Inngest** *(or Trigger.dev)* | Durable async + cron for reminders, at-risk scans, and sync retries. |
| Scheduling/Gantt | **`frappe-gantt`** or **`dhtmlx`-style** lib *(or custom SVG)* + **in-house CPM** | Render Gantt; compute critical path ourselves (forward/backward pass) for correctness/control. |
| Tables/forms | **TanStack Table** + **react-hook-form** + **zod** | Budget grids, line-item editing, validated forms. |
| State/data fetching | RSC + Server Actions first; **TanStack Query** only where client caching is needed (e.g., AI, live tables) | Keep it simple; don't over-fetch on the client. |
| Validation | **zod** (shared schemas) | One schema validates form input, Server Action input, and API payloads. |
| Testing | **Vitest** (unit: CPM, budget math, sync mappers) + **Playwright** (E2E: signup → proposal → sign) | Lock the money math and the critical flows. |
| Hosting | **Vercel** (app) + **Neon** (db) + **S3/R2** (files) | One-command deploys; preview envs per PR. |

**End-to-end request example (build a proposal & get it signed):**
1. Contractor edits the **Budget** in a client component (TanStack Table + react-hook-form); each change calls a **Server Action** → Prisma writes line items; totals recompute server-side.
2. They hit "Generate Proposal." A Server Action calls the **AI service** (Claude via AI SDK) to draft scope/cover copy from the structured line items, returns a `Proposal` (draft) referencing the budget.
3. "Send" snapshots the lines, creates a public **signer token**, and enqueues an Inngest job → **Resend** emails the client a portal link.
4. Client opens `/sign/[token]` (no account), reviews, signs on the **signature pad**; a route handler validates the token, stores the signature + audit trail, flips status to `signed`, locks the snapshot, and notifies the contractor.
5. Contractor can now generate a progress **Invoice** from the same budget → **Stripe** collects payment → webhook marks it paid → Inngest syncs to **QuickBooks**.

---

## 6. Data model (Prisma sketch)

> Indicative — refine during Phase 0. Every model except `Organization`/`User` carries `orgId`.

- **Organization** — `id, name, slug, branding(logoUrl, primaryColor, address), stripeCustomerId, qboRealmId, qboTokens(enc), createdAt` *(Clerk org mirror)*
- **User / Membership** — Clerk-backed; `Membership(userId, orgId, role: OWNER|ADMIN|MEMBER)`
- **Contact** — `id, orgId, type: CLIENT|SUB|VENDOR|CREW, name, company, email, phone, address, notes` (+ derived activity history)
- **Project** — `id, orgId, contactId(client), name, address, trade, status, startDate, targetEndDate, createdAt`
- **Plan** / **PlanPage** — `Plan(id, projectId, fileKey, name)`, `PlanPage(planId, index, width, height, scaleCalibration?)`
- **Takeoff** — `id, projectId, planPageId, kind: AREA|LENGTH|COUNT, label, value, unit, geometry(json), budgetLineItemId?`
- **CostCatalogItem** — `id, orgId, code, name, unit, defaultUnitCost, qboItemId?`
- **Budget** — `id, projectId, name, status`; **BudgetSection** — `id, budgetId, name, order`; **BudgetLineItem** — `id, sectionId, costCatalogItemId?, name, qty, unit, unitCost, markupPct, lineTotal, order`
- **Proposal** — `id, projectId, budgetId, status: DRAFT|SENT|VIEWED|SIGNED|DECLINED, snapshot(json), coverCopy, total, sentAt, signedAt`
- **Signature** — `id, documentType: PROPOSAL|AGREEMENT|PO, documentId, signerName, signerEmail, signedAt, ip, imageKey, auditTrail(json)`
- **Document** — `id, projectId, kind: PLAN|PERMIT|PHOTO|CONTRACT|INSURANCE|OTHER, fileKey, name, uploadedBy, createdAt`
- **ScheduleTask** — `id, projectId, name, start, end, durationDays, percentComplete, isCritical`; **TaskDependency** — `id, predecessorId, successorId, type: FS|SS|FF|SF, lagDays`
- **Invoice** — `id, projectId, number, status: DRAFT|SENT|VIEWED|PAID|OVERDUE, lineItems(json/relation), amount, dueDate, stripeInvoiceId?, qboInvoiceId?`
- **Payment** — `id, invoiceId, stripePaymentId, amount, paidAt`
- **PurchaseOrder** — `id, projectId, vendorId, number, status, lineItems, total, signatureId?, qboBillId?`
- **VendorBill** — `id, projectId, vendorId, poId?, amount, status, dueDate, qboBillId?`
- **BidRequest** — `id, projectId, scope, status`; **BidResponse** — `id, bidRequestId, subId, amount, notes, status`
- **Request (RFI/etc.)** — `id, projectId, type: RFI|LIEN_WAIVER|CHANGE_ORDER|OTHER, subject, status: OPEN|RESPONDED|RESOLVED, thread(relation)`
- **AIThread / AIMessage** — `AIThread(id, orgId, projectId?, title)`, `AIMessage(threadId, role, content, createdAt)`
- **ActivityLog** — `id, orgId, projectId?, actorId, verb, target, meta(json), createdAt`
- **Reminder / Notification** — `id, orgId, userId?, projectId?, kind, dueAt, sentAt, payload(json)`

---

## 7. AI layer design

**Where AI shows up (all optional, all human-reviewed):**
1. **AI Assistant** (`/ai` + dockable panel) — project-aware chat. RAG over the org's projects/budgets/invoices/schedule (pull structured context by `projectId`, not a vector dump for MVP — query Prisma and feed compact JSON). Tools: "summarize project," "what's overdue," "draft an email to {contact}." Streams via the AI SDK.
2. **Estimate assist** — given a project description + (optional) takeoff quantities + cost-catalog defaults, draft budget sections/line items the contractor edits. Always returns a **range/confidence-aware** structure; never a single false-precision number.
3. **Proposal copy generation** — turn structured budget lines into clean scope-of-work + cover narrative for the branded proposal.
4. **Plan Q&A** (later) — ask questions about an uploaded plan; for MVP, extract text + render pages, keep it lightweight. *(True plan-reading/auto-takeoff is Foreman's hard moat — we ship a manual takeoff tool first and layer AI assist on top; do not promise pixel-accurate auto-takeoff in v1.)*

**Implementation notes:**
- Centralize prompts in `/ai/prompts/*`; centralize model calls in `/server/services/ai`. **Confirm current Claude model IDs and AI SDK APIs against Anthropic docs at build time** (don't hard-code from memory).
- Structured outputs: instruct the model to return strict JSON; validate with zod; reject/repair on parse failure.
- **Evals:** keep a small fixture set for (a) estimate sanity (no negative/absurd totals; ranges sane for the trade/region) and (b) proposal copy (no hallucinated scope not in the budget). A confidently wrong estimate is the failure that matters — gate with tests before shipping AI write-paths.
- Cost/latency: long generations run in Inngest jobs with a "generating…" UI state, not blocking the request.

---

## 8. Page / route map (the actual working app)

### 8.1 Marketing (public, original copy + Reno brand)
- `/` — landing (hero, the "bid → built" story, feature highlights, CTA to **sign up**, not just demo)
- `/features` and `/features/[slug]` — module pages
- `/industries/[trade]` — home-builders, remodelers, roofers, commercial, etc.
- `/pricing`
- `/blog`, `/blog/[slug]`
- `/login`, `/sign-up` (Clerk)

### 8.2 App (authenticated, org-scoped — under `/app`)
- `/app` — **Dashboard**: active projects, upcoming deadlines, unpaid/overdue invoices, an AI summary card ("here's what needs attention").
- `/app/projects` — project list (filter by status/trade/client).
- `/app/projects/[id]` — **Project hub** with tabs: **Overview · Plans & Takeoffs · Budget · Proposal · Schedule · Documents · Requests · Invoices · POs/Vendors · Activity**.
- `/app/projects/[id]/takeoff` — full-screen plan viewer + measurement tool.
- `/app/projects/[id]/budget` — budget editor (sections, line items, margins, totals).
- `/app/projects/[id]/proposal` — proposal builder → preview → send.
- `/app/projects/[id]/schedule` — Gantt + calendar + critical path.
- `/app/contacts` and `/app/contacts/[id]` — CRM (clients/subs/crew) with history.
- `/app/proposals` — all proposals across projects.
- `/app/invoices` and `/app/invoices/[id]` — client finances.
- `/app/vendors` / `/app/purchase-orders` — vendor finances + POs.
- `/app/bid-requests` — send scope to subs, compare bids.
- `/app/catalog` — cost catalog (codes, default costs, QBO item map).
- `/app/ai` — assistant chat (also a dockable panel app-wide).
- `/app/settings` — org profile, **branding** (logo/colors used on proposals/invoices), **team & roles**, **integrations** (QuickBooks, Stripe), **billing**.
- `/app/onboarding` — first-run setup (org name, branding, optional QBO connect).

### 8.3 Public portal (passwordless, token-auth, no Clerk session)
- `/sign/[token]` — client signs a proposal/agreement.
- `/pay/[token]` — client pays an invoice (Stripe).
- `/portal/[token]` — sub/vendor accepts a PO, replies to an RFI/bid request.

---

## 9. Build plan — phased for Claude Code

> Each phase ends with something demoable and deployed. Do them in order; don't start a phase until the prior one's "done" checks pass. Tell Claude Code to work **one phase at a time**.

### Phase 0 — Scaffold & foundations
- Init Next.js 15 (TS, App Router) + Tailwind + shadcn/ui + lucide.
- Add Prisma + Neon; define the §6 schema; first migration.
- Wire **Clerk** (orgs, roles, sign-in/up, middleware protecting `/app`).
- App shell: sidebar nav, top bar, org switcher, empty module pages.
- Establish the **Reno design system** (tokens: colors, type, spacing, radius) — original brand, not Foreman's. *(Read `/mnt/skills/public/frontend-design/SKILL.md` before styling.)*
- Set up env handling, `README`, Vitest + Playwright, deploy skeleton to Vercel.
- **Done when:** a user can sign up, create/join an org, and see an empty dashboard at a live URL.

### Phase 1 — CRM, Projects, Documents (basic), Proposal-sign skeleton
- **Contacts** CRUD (clients/subs/crew) + contact detail with activity stub.
- **Projects** CRUD + status pipeline + project hub shell with tabs.
- **Documents**: S3/R2 presigned upload, list, download, attach to project (PDF paging deferred).
- **Public signer** route `/sign/[token]` skeleton (renders a doc, captures a signature, stores audit) — even before proposals are rich.
- **Done when:** create a client → create a project → upload a file → generate a stub document → sign it via public link.

### Phase 2 — Budget & Proposals (the spine)
- **Budget** editor: sections, line items (qty/unit/unit cost/markup/line total), live totals, reorder. Lock down the **money math** with unit tests.
- **Cost Catalog** (basic): reusable items that prefill line items.
- **Proposals**: generate from a budget, edit cover/scope, preview (branded), **send** (Resend email + signer token), public review + sign, status transitions.
- **Done when:** budget → branded proposal → client signs → contractor sees "signed" with audit trail. Numbers carried from budget, not retyped.

### Phase 3 — AI Assistant + estimate/proposal AI assist
- Assistant chat (`/app/ai` + dockable panel), project-aware via Prisma-sourced context, streaming.
- **Estimate assist** (draft budget lines from description + catalog) and **proposal copy** generation, both edit-first and eval-gated.
- **Done when:** "summarize this project / what's overdue / draft a client email" works, and AI can pre-fill a budget the user then edits.

### Phase 4 — Takeoffs
- PDF render (pdf.js) in a full-screen viewer; page-by-page navigation.
- **Scale calibration** (user draws a known length, sets real-world value).
- Measure **area / length / count** on a Konva canvas overlay; label + save.
- Push measured quantities into budget line items (linked, editable).
- **Done when:** upload a plan → calibrate → measure a room area → that quantity lands in the budget.

### Phase 5 — Scheduling + critical path
- Tasks (start/end/duration/%); dependencies (FS/SS/FF/SF + lag).
- **CPM**: forward/backward pass to compute early/late start/finish, float, and critical path. Unit-test it.
- **Gantt** + calendar views; highlight the critical path; "at-risk" flag.
- **Done when:** a dependency change recomputes the critical path and the finish date correctly.

### Phase 6 — Client Finances + payments + QuickBooks
- **Invoices** from budget (progress %/milestone), statuses, branded PDF/email.
- **Stripe**: online payment via `/pay/[token]`; webhook → mark paid.
- **QuickBooks Online**: Intuit OAuth connect in settings; sync invoices + map cost-catalog ↔ QBO items; reconcile via Inngest (retry on failure).
- **Done when:** invoice a client → they pay online → it shows paid → it appears in connected QuickBooks.

### Phase 7 — Vendor side: POs, Vendor Bills, Bid Requests
- **Purchase Orders** (send for signature, track ordered vs delivered).
- **Vendor Bills** + payments; **costs-out** view → live project profit (revenue − costs).
- **Bid Requests**: one scope to multiple subs; compare responses side by side via `/portal/[token]`.
- QuickBooks sync on the vendor side.
- **Done when:** issue a PO → vendor accepts → log a bill → project profit updates → bill syncs to QBO.

### Phase 8 — Requests/RFIs, portals polish, reminders, activity
- **Requests** (RFI, lien waiver, change order) with threaded status history.
- **Sub/Client portal** polish (passwordless, replies, accept/decline).
- **Reminders + at-risk scans** via Inngest cron; notifications; per-project **activity log**.
- **PDF paging** for big plan sets in the document viewer.
- **Done when:** RFIs flow end to end, overdue items trigger reminders, and every project shows a clean activity feed.

### Phase 9 — Marketing site, billing, hardening
- Build the public marketing pages with **original Reno copy/brand**.
- Subscription billing (Stripe) — mirror "one simple plan + per-seat" if desired.
- Accessibility pass, empty/loading/error states, E2E coverage of the golden path (signup → proposal → sign → invoice → paid), perf, security review (see §10–§11).

---

## 10. Multi-tenancy, auth & security

- **Every** Prisma query is scoped by `orgId` derived from the Clerk session/org context — never trust a client-supplied `orgId`. Centralize this in a `getOrgContext()` helper and a Prisma extension/middleware that injects/validates `orgId`.
- **Roles**: OWNER/ADMIN/MEMBER gate destructive actions (delete project, manage billing, manage team, connect integrations).
- **Public portal endpoints** use **single-purpose signed tokens** (scoped to one document, expiring), not sessions. Validate token → resolve document → allow only the intended action.
- **Webhooks** (Stripe, QuickBooks): verify signatures; make handlers idempotent.
- **Secrets** (QBO tokens, Stripe keys): encrypted at rest; never in the client bundle; never logged. The human operator supplies all real credentials/keys — this doc/Claude Code never hard-codes secrets.
- **File access** via short-lived presigned URLs; check project/org ownership before issuing.
- **PII**: contacts, signatures, financials. Don't put sensitive data in URLs; restrict logs.

---

## 11. Legal & brand guardrails (do not skip)

- **Original brand only.** "Reno" name + our own logo, wordmark, colors, typography, illustrations, and **all marketing copy written fresh.** Do not reproduce Foreman's logo, palette, screenshots, slogans, or page copy.
- **No copied code or assets.** Build every module from scratch. Don't lift HTML/CSS/JS/text from `foreman.co`.
- **"Cloned UI" = cloned UX patterns**, not pixel-copied assets: same *layout logic and flows* (sidebar app shell, project-hub tabs, budget grid, proposal/sign flow), rendered in **our** visual identity.
- **Integrations by the book.** QuickBooks via Intuit's official API + OAuth; payments via Stripe — follow each provider's branding and ToS rules. No scraping of any third party.
- **Not professional advice.** AI estimates/takeoffs are editable drafts, clearly not certified estimates, appraisals, or legal contracts. Keep human-in-the-loop and override everywhere; show ranges/confidence on AI numbers.
- If we later expose a homeowner-facing angle, keep that as a *separate* product surface — this build is the contractor platform.

---

## 12. Repo structure (target)

```
reno/
├─ CONTEXT.md                 # this file (or CLAUDE.md)
├─ README.md
├─ .env.example               # documented env vars, no real secrets
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ src/
│  ├─ app/
│  │  ├─ (marketing)/         # public pages
│  │  ├─ (auth)/              # clerk sign-in/up
│  │  ├─ app/                 # authed app (dashboard, projects, …)
│  │  ├─ sign/[token]/        # public signer
│  │  ├─ pay/[token]/         # public payment
│  │  ├─ portal/[token]/      # sub/vendor portal
│  │  └─ api/                 # webhooks, ai stream, upload presign, tokens
│  ├─ components/             # ui (shadcn), shared widgets
│  │  ├─ budget/ proposal/ takeoff/ schedule/ ai/ signature/ …
│  ├─ server/
│  │  ├─ actions/             # server actions (mutations)
│  │  └─ services/            # budget, proposal, invoice, schedule(cpm),
│  │                         #   quickbooks, stripe, pdf, ai
│  ├─ ai/
│  │  ├─ prompts/
│  │  └─ schemas/             # zod for structured outputs
│  ├─ lib/                    # auth/org context, db client, utils, env
│  └─ jobs/                   # inngest functions (reminders, sync, gen)
├─ tests/
│  ├─ unit/                   # cpm, budget math, sync mappers
│  └─ e2e/                    # playwright golden path
└─ ...config (next, tailwind, tsconfig, eslint, vitest, playwright)
```

---

## 13. Local dev & build

> The human operator provisions accounts/keys (Neon, Clerk, S3/R2, Anthropic, Stripe, QuickBooks, Resend, Inngest) and fills `.env`. Claude Code scaffolds `.env.example` and wiring, but never invents or commits secrets.

Typical scripts (define in `package.json`):
- `pnpm dev` — Next dev server.
- `pnpm prisma migrate dev` / `pnpm prisma studio` — DB.
- `pnpm test` (Vitest) / `pnpm e2e` (Playwright).
- `pnpm lint` / `pnpm typecheck`.
- Inngest dev server alongside `dev` for jobs.

Env vars to document in `.env.example` (names only): `DATABASE_URL`, Clerk keys, S3/R2 creds + bucket, `ANTHROPIC_API_KEY`, Stripe keys + webhook secret, QuickBooks client id/secret + redirect, `RESEND_API_KEY`, Inngest keys, `APP_URL`.

---

## 14. Definition of done (MVP)

A contractor can, in the browser, with our brand and no third-party e-sign tool:
1. Sign up, create an org, set branding.
2. Add a client and create a project.
3. Upload a plan, run a takeoff, and have quantities flow into a budget.
4. Build a budget (AI-assisted, fully editable) with sections, margins, live totals.
5. Generate a branded proposal, send it, and have the client review + e-sign via a passwordless link.
6. Issue a progress invoice from that budget, collect payment online, and see it reflected (QuickBooks sync connected).
7. Track the schedule with a working critical path.
8. Ask the AI assistant about the project and get accurate, project-grounded answers.

Everything else (vendor finances, POs, bid requests, full RFIs, reminders) layers on after.

---

## 15. Open questions to confirm with the operator

1. **Target confirmed = Foreman** (all links pointed there; "Travo" appeared once and was treated as a slip). Confirm.
2. **Scope confirmed = full contractor platform** (not the lighter homeowner "consumer flip" from the batch doc). Confirm.
3. **Brand name = "Reno"** for this contractor product? (It reads slightly consumer-renovation; fine to keep, or pick a more contractor-leaning name — trivial find/replace.)
4. **Auth/tenancy**: Clerk (recommended) vs Supabase Auth — confirm before Phase 0.
5. **Storage**: S3 vs Cloudflare R2.
6. Any must-have integration beyond **QuickBooks + Stripe** for v1?
