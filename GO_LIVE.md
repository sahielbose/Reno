# Reno — Go-Live Runbook (Phases 18–20)

Reno runs **fully locally on stubs** through Phase 17. Every external
integration sits behind an interface with a local fallback, so production is a
matter of **setting a key** — no code changes to the feature surfaces. Set a
variable in `.env` (and in your host's env), and that integration activates;
leave it blank and the local fallback keeps working.

| Capability   | Interface / factory                       | Local default   | Production | Env var(s)                                              |
| ------------ | ----------------------------------------- | --------------- | ---------- | ------------------------------------------------------- |
| Auth         | `getAuthProvider()` `src/lib/auth`        | cookie dev auth | Clerk      | `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| Database     | Prisma `DATABASE_URL`                     | local Postgres  | Neon       | `DATABASE_URL`                                          |
| Email        | `getMailer()` `src/lib/email`             | console outbox  | Resend     | `RESEND_API_KEY`, `RESEND_FROM`                         |
| AI           | `getAIProvider()` `src/lib/ai`            | rule-based stub | Claude     | `ANTHROPIC_API_KEY`                                     |
| File storage | `getStorage()` `src/lib/storage`          | local disk      | S3 / R2    | `S3_*`                                                  |
| Payments     | `getPaymentProvider()` `src/lib/payments` | disabled        | Stripe     | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`            |
| Accounting   | schema `qbo*` fields                      | —               | QuickBooks | `QBO_*`                                                 |

---

## Phase 18 — Auth (Clerk) + Database (Neon)

**Neon (no code change):**

1. Create a Neon project → copy the pooled connection string.
2. Set `DATABASE_URL` to it (locally and on the host).
3. `pnpm prisma migrate deploy` then `pnpm db:seed` (optional demo data).

**Clerk:**

1. Create a Clerk app → copy the publishable + secret keys.
2. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
3. `pnpm add @clerk/nextjs`; wrap `app/layout.tsx` in `<ClerkProvider>` and add
   `middleware.ts` from Clerk's quickstart.
4. Implement `AuthProvider` over Clerk (`auth()` → `getSession()`), mapping the
   Clerk user/org to Reno's `Session`/`OrgContext`, and gate `getAuthProvider()`
   on `CLERK_SECRET_KEY`. Membership/role resolution is unchanged.

## Phase 19 — Storage, Email, Live AI, Jobs

**Email (Resend) — ready:** set `RESEND_API_KEY` (+ `RESEND_FROM`). `getMailer()`
auto-switches from the console outbox to Resend. Verify a proposal "send".

**AI (Claude) — ready:** set `ANTHROPIC_API_KEY` (+ optional `ANTHROPIC_MODEL`).
`getAIProvider()` switches from the rule-based stub to live Claude with the same
org-data context. Ask the assistant a question to verify.

**Storage (S3 / R2):** create a bucket + access keys, set `S3_*`, implement the
`Storage` interface (`put`/`get`/`delete`) with the S3 API, and gate
`getStorage()` on `S3_BUCKET`. The upload + `/api/files/[id]` paths are unchanged.

**Jobs (Inngest):** set `INNGEST_*`, add an Inngest client + `/api/inngest`
route, and move the notification stubs (e.g. proposal-signed, overdue reminders)
into Inngest functions.

## Phase 20 — Payments, Accounting, Deploy

**Payments (Stripe) — ready:** set `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`.
`getPaymentProvider()` returns the Stripe Checkout adapter; point a Stripe webhook
at `/api/webhooks/stripe` (event `checkout.session.completed`). The webhook records
the payment against the invoice (metadata `invoiceId`), flipping it to Paid and
updating the dashboard — same path as a manual payment.

**Accounting (QuickBooks):** set `QBO_*`, add the OAuth connect flow, and sync
invoices/bills using the existing `qboInvoiceId` / `qboBillId` schema columns.

**Deploy (Vercel):**

1. Import the repo into Vercel (framework auto-detected; see `vercel.json`).
2. Add every production env var above.
3. Build command `pnpm build`; Vercel runs Prisma generate via `postinstall`.
4. Run `prisma migrate deploy` against Neon as a deploy step.
5. Set `APP_URL` to the production domain so token + Stripe links resolve.

---

### Keys to request before going live

- **Clerk:** publishable + secret key
- **Neon:** pooled `DATABASE_URL`
- **Resend:** API key + verified `from` domain
- **Anthropic:** API key
- **S3/R2:** region, bucket, endpoint, access key id + secret
- **Stripe:** secret key + webhook signing secret
- **QuickBooks:** client id + secret + redirect URI
