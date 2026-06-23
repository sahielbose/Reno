import crypto from "node:crypto";

import { db } from "@/lib/db";
import { addPayment } from "@/server/repositories/invoice";

export const runtime = "nodejs";

/** Verify Stripe's `stripe-signature` header against the raw payload. */
function verify(payload: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(
    header.split(",").map((kv) => kv.split("=") as [string, string]),
  );
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${parts.t}.${payload}`)
    .digest("hex");
  const got = parts.v1 ?? "";
  if (expected.length !== got.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(got));
}

/**
 * Stripe webhook: on `checkout.session.completed`, record the payment against
 * the invoice referenced in metadata — flipping it to Paid and updating the
 * dashboard, exactly like a manual payment.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();

  if (!secret || !signature || !verify(payload, signature, secret)) {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    const event = JSON.parse(payload) as {
      type: string;
      data: {
        object: {
          metadata?: { invoiceId?: string };
          client_reference_id?: string;
          amount_total?: number;
        };
      };
    };

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const invoiceId =
        session.metadata?.invoiceId ?? session.client_reference_id;
      const amount = (session.amount_total ?? 0) / 100;
      if (invoiceId && amount > 0) {
        const invoice = await db.invoice.findUnique({
          where: { id: invoiceId },
        });
        if (invoice) {
          await addPayment(invoice.orgId, invoiceId, amount, "stripe");
        }
      }
    }
    return new Response("ok", { status: 200 });
  } catch {
    return new Response("error", { status: 400 });
  }
}
