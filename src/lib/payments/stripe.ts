import "server-only";

import type { PaymentProvider } from "@/lib/payments/interface";

/**
 * Stripe Checkout via the REST API (no SDK dependency). Activated by
 * getPaymentProvider() when STRIPE_SECRET_KEY is set.
 */
export function createStripeProvider(secretKey: string): PaymentProvider {
  return {
    live: true,
    async createCheckout({
      amountCents,
      description,
      invoiceId,
      successUrl,
      cancelUrl,
    }) {
      const body = new URLSearchParams();
      body.set("mode", "payment");
      body.set("success_url", successUrl);
      body.set("cancel_url", cancelUrl);
      body.set("client_reference_id", invoiceId);
      body.set("metadata[invoiceId]", invoiceId);
      body.set("line_items[0][quantity]", "1");
      body.set("line_items[0][price_data][currency]", "usd");
      body.set("line_items[0][price_data][unit_amount]", String(amountCents));
      body.set("line_items[0][price_data][product_data][name]", description);

      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
      if (!res.ok) {
        throw new Error(`Stripe ${res.status}: ${await res.text()}`);
      }
      const data = (await res.json()) as { id: string; url: string };
      return { id: data.id, url: data.url };
    },
  };
}
